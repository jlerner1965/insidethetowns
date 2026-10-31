/**
 * Frontmatter schemas for the content collections. Shared between Astro's
 * content config (src/content.config.ts) and scripts/validate-content.ts so
 * there is exactly one definition of what a valid entry is.
 *
 * `image` is injected: Astro passes its image() helper (which resolves and
 * validates the file), the validator passes a plain string check.
 *
 * Field names are the repo's, not the accuracy brief's (`source` here is the
 * brief's `sourceUrl`, `verified` its `verifiedAt`, and so on). The mapping
 * is written out once, in docs/archive/ACCURACY-SYSTEM.md, "Field names".
 *
 * Two layers decide what publishes. This file says what a *valid* entry is,
 * and an invalid one is excluded from the build with a warning rather than
 * failing it (see `lenient` below). src/lib/freshness.ts says what a
 * *publishable* entry is: sourced, dated, and inside its freshness window.
 */
import { z } from 'astro/zod';
import { dayKey, parseLocal } from '../lib/dates.ts';
import { OPENING_HOURS_RE } from '../lib/hours.ts';
import { CLOCK_RE, WEEKDAYS, isDayOff, runSittings, weekdayOf } from '../lib/schedule.ts';

/** Astro passes its image() helper (typed to ImageMetadata); the validator passes a plain string check. */
export type ImageSchema = () => z.ZodType;

export const EVENT_CATEGORIES = [
  'music',
  'market',
  'festival',
  'outdoors',
  'family',
  'food',
  'arts',
  'civic',
  'sports',
  'other',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const PLACE_TYPES = [
  'restaurant',
  'bar',
  'coffee',
  'shop',
  'trail',
  'trailhead',
  'park',
  'venue',
  'lodging',
  'service',
] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

export const EAT_DRINK_TYPES: readonly PlaceType[] = ['restaurant', 'bar', 'coffee'];
export const THINGS_TO_DO_TYPES: readonly PlaceType[] = ['trail', 'trailhead', 'park', 'venue'];
/**
 * Public land rather than a business: nobody to write in as the owner, and
 * the mountain variant's `access` notes belong here and nowhere else.
 */
export const LAND_TYPES: readonly PlaceType[] = ['trail', 'trailhead', 'park'];

/**
 * Whether a place can be visited. Everything was `open` by construction until
 * the October 2026 audit found a restaurant that had closed in February, a
 * sports complex shut since May 2025 and a diner that had reopened under a
 * new name, all sitting in the standard open template with hours and an
 * "Open now" badge. A listing that cannot say "closed" is one that lies the
 * day the business does.
 *
 * `closed` is for good; `temporarily-closed` for a season, a rebuild or a
 * fire. Both keep the page (a URL that was live should not 404, and a reader
 * searching for the place deserves the answer) but drop the hours, the open
 * status and the place from the home page and the picks.
 */
export const PLACE_STATUSES = ['open', 'temporarily-closed', 'closed'] as const;
export type PlaceStatus = (typeof PLACE_STATUSES)[number];
export const PLACE_STATUS_LABELS: Record<PlaceStatus, string> = {
  open: 'Open',
  'temporarily-closed': 'Temporarily closed',
  // "Permanently", because a bare "Closed" beside a café reads as closed for
  // the day. The page for a closed place exists for the reader who went
  // looking; it is out of every list and the search index (src/lib/content.ts).
  closed: 'Permanently closed',
};

/**
 * Whether an event is still happening as listed. A canceled meeting stays on
 * the calendar, marked, because the reader who planned to go is exactly who
 * needs to see it; it leaves the picks, the feeds and the email, which are
 * for things a reader can still attend. `postponed` is for a date the
 * organizer has withdrawn without naming a new one.
 */
/** How a person confirmed an event with its organizer (an event's `confirmed`). */
export const CONFIRMATION_METHODS = ['phone', 'email', 'in-person'] as const;

export const EVENT_STATUSES = ['scheduled', 'postponed', 'canceled'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: 'Scheduled',
  postponed: 'Postponed',
  canceled: 'Canceled',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Music',
  market: 'Market',
  festival: 'Festival',
  outdoors: 'Outdoors',
  family: 'Family',
  food: 'Food & Drink',
  arts: 'Arts',
  civic: 'Civic',
  sports: 'Sports',
  other: 'Other',
};

/**
 * The label printed over a listing. "Other" is where what fits none of the
 * rest is filed, and it is not printed: a label that says nothing is noise
 * above the title. The filter still offers it.
 */
export const shownCategoryLabel = (category: EventCategory): string | undefined =>
  category === 'other' ? undefined : CATEGORY_LABELS[category];

/** Headings over a group of places: "Restaurants", not "Restaurant". */
export const PLACE_TYPE_PLURALS: Record<PlaceType, string> = {
  restaurant: 'Restaurants',
  bar: 'Bars & breweries',
  coffee: 'Coffee & sweets',
  shop: 'Shops',
  trail: 'Trails',
  // A trailhead is the lot, the sign and the start of several trails: the
  // place a mountain-town reader drives to. The trails from it are their own
  // listings where they are worth one; Estes Park, Golden, Evergreen and
  // Nederland each have more trailheads than a Front Range town has parks.
  trailhead: 'Trailheads',
  park: 'Parks & open space',
  venue: 'Venues',
  lodging: 'Places to stay',
  service: 'Services',
};

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  restaurant: 'Restaurant',
  bar: 'Bar',
  coffee: 'Coffee & Sweets',
  shop: 'Shop',
  trail: 'Trail',
  trailhead: 'Trailhead',
  park: 'Park',
  venue: 'Venue',
  lodging: 'Lodging',
  service: 'Service',
};

/** "2026-10-03" or "2026-10-03T10:00" in Denver time. A YAML-parsed Date is accepted too. */
const localDate = z.union([z.string(), z.date()]).transform((value, ctx) => {
  try {
    return parseLocal(value);
  } catch (err) {
    ctx.addIssue({ code: 'custom', message: (err as Error).message });
    return z.NEVER;
  }
});

/** A Denver wall-clock start with its time, "2026-10-09T19:30": a show has a curtain time. */
const localDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'a performance needs its time, as "2026-10-09T19:30"')
  .transform((value, ctx) => {
    try {
      return parseLocal(value);
    } catch (err) {
      ctx.addIssue({ code: 'custom', message: (err as Error).message });
      return z.NEVER;
    }
  });

/**
 * One show of a production: its start, or its start with a note of its own
 * ("Sold out") read off the box office.
 */
const performance = z
  .union([localDateTime, z.object({ start: localDateTime, note: z.string().min(1).optional() }).strict()])
  .transform((p) => (p instanceof Date ? { start: p } : p));

/**
 * One line of a run's week: the weekdays it opens and, where the organizer
 * gives them, that day's hours as Denver clock times. A closing time before
 * the opening one is after midnight. See src/lib/schedule.ts.
 */
const clockTime = z.string().regex(CLOCK_RE, 'a time of day as "19:00" (24-hour, quoted)');
const scheduleEntry = z
  .object({
    days: z.array(z.enum(WEEKDAYS)).min(1),
    start: clockTime.optional(),
    end: clockTime.optional(),
  })
  .strict()
  .refine((s) => !s.end || !!s.start, { message: 'a closing time needs its opening time', path: ['end'] });

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase letters, numbers and hyphens')
  .optional();

const httpUrl = z.url({ protocol: /^https?$/ });

/** Who ingested or submitted an item, where it is still in staging. */
export const REVIEW_ORIGINS = ['migration', 'ingest', 'submission', 'manual'] as const;

/**
 * Why an item is in `content/<town>/staging/` and not on the site. Required
 * there, forbidden in the published folders; the validator enforces both.
 * Approval (the review CLI, or a hand edit) removes this block, stamps
 * `verified` and `verifiedBy`, and moves the file.
 */
export const reviewSchema = z.object({
  /** What has to be settled before it can publish, in a sentence. */
  reason: z.string().min(1),
  /** The day it went into staging. */
  since: localDate,
  /** How it got there. */
  from: z.enum(REVIEW_ORIGINS).optional(),
});

/**
 * The provenance an item carries beyond `source` and `verified`, which stay
 * where they were. None is required of existing content; the tooling stamps
 * them from here on.
 */
const provenance = {
  /** Who checked it: a name, or the tool and the person who approved. Stamped at approval; never backfilled. */
  verifiedBy: z.string().min(1).optional(),
  /** Key of the entry in the town's source registry that this was read from. */
  sourceId: z.string().min(1).optional(),
  /** The feed's own identifier for the item (iCal UID, RSS guid), so a re-ingest finds it again. */
  sourceUid: z.string().min(1).optional(),
  /** Fingerprint of the fields as last read from the source, so a re-ingest can see what changed. */
  sourceHash: z.string().min(1).optional(),
  /** Set by ingest when the source changed an approved item; cleared at the next approval. */
  changeFlag: z.boolean().default(false),
  /** What changed, in a sentence: "Start moved from 6 pm to 7 pm (source, 3 October)". */
  changeNote: z.string().min(1).optional(),
  /** Present only in staging. See reviewSchema. */
  review: reviewSchema.optional(),
};

export function eventSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      ...provenance,
      title: z.string().min(1),
      /** On a multi-town guide, which town this is in. One of the config's `subTowns`. */
      subTown: z.string().min(1).optional(),
      slug,
      start: localDate,
      end: localDate.optional(),
      allDay: z.boolean().default(false),
      venue: z.string().min(1),
      address: z.string().optional(),
      url: httpUrl.optional(),
      /** "Free" or a price note such as "$12 adults, kids free". */
      cost: z.string().optional(),
      category: z.enum(EVENT_CATEGORIES),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the license asks for attribution. */
      imageCredit: z.string().optional(),
      /** Human note such as "Every Saturday through October". Display only; computed from repeat/until when absent. */
      recurring: z.string().optional(),
      /** The event happens every week on start's weekday, through `until` (inclusive). */
      repeat: z.enum(['weekly']).optional(),
      until: localDate.optional(),
      /**
       * Every show of a production that plays more than once: a play's nine
       * performances, each a curtain time, in order. `start` is the first of
       * them, and `end`, when the organizer gives one, closes the first and
       * sets every show's length, as it does for a weekly repeat. The page,
       * the day lists, the calendar files and the structured data then carry
       * each show on its own day, where a start and an end had made the run
       * one block from opening night to closing (fresh audit, 9 October 2026:
       * Sleepy Hollow's nine shows exported as sixteen all-day days).
       *
       * One file and one page per production, indexed while any show is to
       * come; a separately ticketed night is a performance, not a file. A
       * show's own note ("Sold out") goes on that show.
       */
      performances: z.array(performance).min(2).optional(),
      /**
       * For a run (`start` to `end` on a later day) that is not on every
       * day of its range: the weekdays it opens, each with its hours where
       * the source gives them, written from the same source as the rest.
       *
       *   schedule:
       *     - { days: [thu, sun], start: "19:00", end: "22:00" }
       *     - { days: [fri, sat], start: "19:00", end: "23:00" }
       *
       * Every page, filter, count and calendar file then has the run on
       * those days only, each with its own hours (src/lib/events.ts,
       * `occurrences`). Until 26 October 2026 the days were prose alone,
       * and Erie's "Today" showed a Thursday-to-Sunday attraction on a
       * Monday. `recurring` and `timeNote` stay as the run's own words.
       * A day without hours takes the run's start and end times, or stays
       * all day on an all-day run. `start` and `end` fall on open days.
       */
      schedule: z.array(scheduleEntry).min(1).optional(),
      /**
       * Days inside a run or a weekly series that it is not on, as the
       * organizer lists them: "none on Nov 26, Dec 24, 25 or 31", a week
       * called off. Left out of every page and feed. One a run or series
       * could never have had (outside its range, or another weekday) is an
       * error, so a typo cannot pass for a cancellation.
       */
      except: z.array(localDate).min(1).optional(),
      /**
       * The date is set and the time is not announced yet. With `allDay`,
       * which keeps the date arithmetic whole-day; the cards say "Time to
       * be announced" rather than "All day", a day lists it after its timed
       * and all-day listings, and the calendar files say so.
       */
      timeTbd: z.boolean().optional(),
      /** Replaces the computed time range on cards, e.g. "Time to be confirmed" or "Doors 6 pm, music 7 pm". */
      timeNote: z.string().optional(),
      /**
       * Who is putting the event on, where that is known and is not simply
       * the venue.
       *
       * Left empty rather than guessed: a talk at the library may be run by
       * the library, a book group, or a visiting society, and the venue is
       * not evidence of which. schema.org's `organizer` is only worth
       * emitting when it is a fact, so an unset field emits nothing.
       */
      organizer: z.string().min(1).optional(),
      /** The organizer's own site, when they have one distinct from `url`. */
      organizerUrl: httpUrl.optional(),
      /**
       * Who performs, where the listing names them: a concert's act, a
       * play's company, a talk's speaker, headliner first. Google reads it
       * as the Event's `performer`. Left empty for festivals, markets,
       * meetings, classes and anything whose act is not named, rather than
       * guessed.
       */
      performers: z
        .array(z.object({ name: z.string().min(1), kind: z.enum(['person', 'group']) }).strict())
        .min(1)
        .max(6)
        .optional(),
      /** The organizer's page or calendar the listing was read from. */
      source: httpUrl.optional(),
      /** The day the listing was checked against its source. */
      verified: localDate.optional(),
      /**
       * A person asked the organizer: a call, an email, a word at the door.
       * What a page cannot say for a venue that has no page, or one no
       * machine can read. `npm run confirm` writes it. A confirmation of a
       * weekly series covers its dates for FRESHNESS.events.seriesDays.
       */
      confirmed: z
        .object({
          how: z.enum(CONFIRMATION_METHODS),
          /** Who said so: "Oskar Blues, the front desk", "Kay Miller, the group's leader". */
          with: z.string().min(1),
          on: localDate,
          /** What they said, where it adds to the listing: "Every second and fourth Wednesday, 6 to 8:30". */
          note: z.string().min(1).optional(),
        })
        .strict()
        .optional(),
      featured: z.boolean().default(false),
      /** Still on as listed, or not. See EVENT_STATUSES. */
      status: z.enum(EVENT_STATUSES).default('scheduled'),
      /**
       * Who says so and since when, in a sentence: "The Town lists this
       * meeting as canceled." Required with any status but `scheduled`,
       * because a bare "Canceled" is a claim with nothing behind it.
       */
      statusNote: z.string().min(1).optional(),
      /** The page that says so, when there is one to link. */
      statusSource: httpUrl.optional(),
    })
    .refine((e) => e.status === 'scheduled' || !!e.statusNote, {
      message: 'a status other than scheduled needs a statusNote saying who says so',
      path: ['statusNote'],
    })
    .refine((e) => !e.end || e.end.getTime() >= e.start.getTime(), {
      message: 'end must be at or after start',
      path: ['end'],
    })
    .refine((e) => !e.until || (e.repeat && e.until.getTime() >= e.start.getTime()), {
      message: 'until requires repeat and must be at or after start',
      path: ['until'],
    })
    .refine((e) => !e.performances || (!e.allDay && !e.repeat && !e.recurring && !e.timeNote), {
      message:
        'performances are the times: not with allDay, repeat, recurring or timeNote (a show’s own note goes on that performance)',
      path: ['performances'],
    })
    .refine((e) => !e.performances || e.performances[0]!.start.getTime() === e.start.getTime(), {
      message: 'start must be the first performance',
      path: ['start'],
    })
    .refine((e) => !e.performances || e.performances.every((p, i, all) => i === 0 || p.start.getTime() > all[i - 1]!.start.getTime()), {
      message: 'performances must be in order, each once',
      path: ['performances'],
    })
    .refine((e) => !e.performances || !e.end || e.end.getTime() - e.start.getTime() < 24 * 3_600_000, {
      message: 'with performances, end closes the first show: one sitting, under 24 hours',
      path: ['end'],
    })
    .refine((e) => !e.schedule || (!!e.end && dayKey(e.end) !== dayKey(e.start) && !e.repeat && !e.performances), {
      message: 'schedule is for a run: an end on a later day than start, and no repeat or performances',
      path: ['schedule'],
    })
    .refine((e) => !e.schedule || e.schedule.flatMap((s) => s.days).length === new Set(e.schedule.flatMap((s) => s.days)).size, {
      message: 'each weekday goes in one schedule line only',
      path: ['schedule'],
    })
    .refine(
      (e) => {
        if (!e.schedule || !e.end) return true;
        // The run's first open day is its start's, and its last sitting ends
        // on its end's day: the sitemap reads `end` from the raw file
        // (src/lib/series.ts), the pages read the sittings, and the two must
        // name the same last day.
        const sittings = runSittings({ ...e, except: undefined });
        const first = sittings[0];
        const last = sittings[sittings.length - 1];
        if (!first || !last) return false;
        const endDay = (at: Date, whole: boolean) => (whole ? dayKey(at) : dayKey(new Date(at.getTime() - 1)));
        const lastDay = last.end ? endDay(last.end, false) : dayKey(last.start);
        return dayKey(first.start) === dayKey(e.start) && lastDay === endDay(e.end, e.allDay);
      },
      {
        message: 'a scheduled run starts and ends on days it is open: start on a schedule weekday, and end when its last open day closes',
        path: ['schedule'],
      },
    )
    .refine(
      (e) => {
        if (!e.except) return true;
        const days = e.except.map((d) => dayKey(d));
        if (e.repeat === 'weekly' && e.until) {
          // A week of the series, not its first or its last.
          const dow = weekdayOf(e.start);
          return days.every((d, i) => weekdayOf(e.except![i]!) === dow && d > dayKey(e.start) && d < dayKey(e.until!));
        }
        if (!e.end || dayKey(e.end) === dayKey(e.start) || e.performances) return false;
        // A day inside the run, strictly: the run starts and ends on days it is on.
        return days.every((d, i) => d > dayKey(e.start) && d < dayKey(e.end!) && !isDayOff({ schedule: e.schedule, start: e.start }, e.except![i]!));
      },
      {
        message: 'except names days a weekly series or a run would otherwise have: inside its range, on its weekday or a schedule day, not its first or last',
        path: ['except'],
      },
    )
    .refine((e) => !e.timeTbd || e.allDay, {
      message: 'timeTbd goes with allDay: a date with no time announced yet',
      path: ['timeTbd'],
    })
    .refine((e) => !e.image || !!e.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    })
    .refine((e) => !e.organizerUrl || !!e.organizer, {
      message: 'organizerUrl needs an organizer to belong to',
      path: ['organizer'],
    })
    .refine((e) => !e.changeFlag || !!e.changeNote, {
      message: 'a changeFlag needs a changeNote saying what the source changed',
      path: ['changeNote'],
    });
}

/**
 * Hours that follow the season, for the mountain variant. A listing with a
 * `seasonal` block shows these instead of `hours` during `season`, and the
 * freshness window for the whole listing is the mountain one.
 *
 * `opens` and `closes` are the dates of the current season, read off the
 * operator's own page like every other fact here: a seasonal café, a lake
 * road, a visitor center. Between `closes` and the next `opens` the gate
 * (src/lib/content.ts) strips the hours and the page says "Closed for the
 * season", so a January reader is not told a lodge is open until 8. The
 * dates follow the listing's `verified` and its town's freshness window;
 * they carry no window of their own.
 */
/** A month as the operator writes it: "May", "Sept", "October". Matched on its first three letters. */
const monthName = z
  .string()
  .trim()
  .regex(
    /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t|tember)?|oct(ober)?|nov(ember)?|dec(ember)?)\.?$/i,
    'expected a month name, such as "May" or "Oct"',
  );

export const seasonalSchema = z
  .object({
    /** When these hours apply, as a reader reads it: "Memorial Day to mid-October". */
    season: z.string().min(1),
    /** Hours during the season, same form as `hours`. */
    hours: z.string().min(1).optional(),
    /** The day the current season opens, "YYYY-MM-DD", from the operator's page. */
    opens: localDate.optional(),
    /** The day the current season closes, "YYYY-MM-DD" (inclusive), from the operator's page. */
    closes: localDate.optional(),
    /**
     * Months the place is open: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
     * from the operator's page. The rows and cards say "Open May–Oct" from
     * it, the page says "Closed for the season" outside it, and the weekly
     * report flags the listing for a re-check as the first and last of
     * those months come round (src/lib/freshness.ts, seasonRecheck). Three
     * letters or the full name; a run may wrap the year (Nov to Apr). Set
     * this or `closedMonths`, not both: one is the other's complement.
     */
    openMonths: z.array(monthName).default([]),
    /** Months the place is shut: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]. */
    closedMonths: z.array(monthName).default([]),
    /** One short line in the operator's words, shown with the season: "Closed in mud season". */
    note: z.string().min(1).optional(),
  })
  .refine((s) => !s.opens || !s.closes || s.closes.getTime() >= s.opens.getTime(), {
    message: 'a season closes on or after the day it opens',
    path: ['closes'],
  })
  .refine((s) => s.openMonths.length === 0 || s.closedMonths.length === 0, {
    message: 'set openMonths or closedMonths, not both: one is the complement of the other',
    path: ['openMonths'],
  })
  .refine((s) => s.openMonths.length < 12, {
    message: 'a place open every month of the year has no season to declare',
    path: ['openMonths'],
  });

/**
 * Getting there, for a trail or a park in the mountain variant. Each line
 * is a fact that goes stale fast, so the block carries its own source and
 * check date and the shortest freshness window (FRESHNESS.accessDays). It
 * links the land manager's live notice rather than restating conditions.
 */
export const accessSchema = z.object({
  /** "Lot holds about 30 cars; full by 8 am at weekends" */
  parking: z.string().min(1).optional(),
  /** "Timed-entry permit May 22 to October 12" */
  permit: z.string().min(1).optional(),
  /** "The road closes for the season after the first heavy snow" */
  closures: z.string().min(1).optional(),
  /** The land manager's conditions page: the park, CDOT, the Forest Service. */
  conditionsUrl: httpUrl.optional(),
  conditionsLabel: z.string().min(1).optional(),
  source: httpUrl,
  verified: localDate,
});

export function placeSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      ...provenance,
      title: z.string().min(1),
      /**
       * On a guide that covers several towns (Carbon Valley), which one this
       * is in. One of the town config's `subTowns`; the validator checks.
       */
      subTown: z.string().min(1).optional(),
      seasonal: seasonalSchema.optional(),
      access: accessSchema.optional(),
      slug,
      type: z.enum(PLACE_TYPES),
      address: z.string().min(1),
      /** District or landmark: "Old Town, Second Avenue", "Cottonwood Square". */
      area: z.string().optional(),
      /** Where the listing was checked: the business's own site, a directory, or a dated news report. */
      source: httpUrl.optional(),
      verified: localDate.optional(),
      /**
       * The day the listing was published on the guide: stamped at approval
       * (scripts/review.ts), or written by whoever adds a place by hand. Not
       * the day the business opened. The weekly email's "New on the guide"
       * reads it. Required on every published place; a staged one gets it
       * when it is approved.
       */
      added: localDate.optional(),
      url: httpUrl.optional(),
      phone: z.string().optional(),
      /**
       * The hours as a reader reads them: "Tue–Sat 10–5; closed Sun–Mon".
       * The build parses this line into `openingHours` (see src/lib/hours.ts)
       * for the open-or-closed status and the structured data, so it is the
       * one field to edit when hours change.
       */
      hours: z.string().optional(),
      /**
       * schema.org openingHours, "Tu-Sa 10:00-17:00", one string per run.
       * Only for a listing whose `hours` line the parser will not read —
       * seasonal hours, an odd split — where the text stays for display and
       * this carries the structure. Left unset, it is derived from `hours`.
       */
      openingHours: z
        .array(z.string().regex(OPENING_HOURS_RE, 'expected "Mo-Fr 09:00-17:00" (day codes Mo Tu We Th Fr Sa Su, 24-hour times)'))
        .optional(),
      /**
       * A trail map the land manager publishes, linked rather than copied.
       * Theirs stays current when a trail is rerouted or closed; a copy here
       * would freeze on the day it was taken, on pages that promise to be
       * checked against the source.
       */
      mapUrl: httpUrl.optional(),
      priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the license asks for attribution. */
      imageCredit: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      /** One or two sentences, shown on cards. */
      summary: z.string().min(1).max(280),
      /** Whether it can be visited. See PLACE_STATUSES. */
      status: z.enum(PLACE_STATUSES).default('open'),
      /**
       * The day the guide recorded the status that is not `open`, set when
       * the status is changed. The email's "Closed" section reads it; when
       * the business actually closed belongs in `statusNote`. Required with
       * any status but `open`, and removed when a place reopens.
       */
      closed: localDate.optional(),
      /**
       * What happened and how we know, in a sentence or two: "Reported
       * closed on February 21, 2026, ahead of the sale of the building
       * (Retro 102.5); not yet confirmed with the owners." Required with any
       * status but `open`.
       */
      statusNote: z.string().min(1).optional(),
      /** The report or notice that says so, when there is one to link. */
      statusSource: httpUrl.optional(),
    })
    .refine((p) => !p.image || !!p.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    })
    .refine((p) => p.status === 'open' || !!p.statusNote, {
      message: 'a status other than open needs a statusNote saying what happened and how we know',
      path: ['statusNote'],
    })
    .refine((p) => !!p.review || !!p.added, {
      message: 'a published place needs `added`: the day it went on the guide, as "YYYY-MM-DD"',
      path: ['added'],
    })
    .refine((p) => (p.status === 'open') === !p.closed, {
      message: 'a status other than open needs `closed`, the day it was recorded ("YYYY-MM-DD"); an open place has none',
      path: ['closed'],
    })
    .refine((p) => !p.changeFlag || !!p.changeNote, {
      message: 'a changeFlag needs a changeNote saying what the source changed',
      path: ['changeNote'],
    })
    .refine((p) => !p.access || LAND_TYPES.includes(p.type), {
      message: 'access notes belong on a trail, a trailhead or a park',
      path: ['access'],
    });
}

export function articleSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      /**
       * The <title> and share title, when the headline on the page is not
       * the line a searcher needs: "Which side of County Line Road you buy
       * on" is the right headline over the article and the wrong one in a
       * results list, which wants the town, the state and the question
       * ("Erie, CO: Boulder County or Weld County?"). Sentence case, like
       * the rest of the guide; the site title is appended as on every page.
       * Left unset, the headline is the title (search audit, 13 October
       * 2026).
       */
      seoTitle: z.string().min(1).max(70).optional(),
      slug,
      date: localDate,
      updated: localDate.optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the license asks for attribution. */
      imageCredit: z.string().optional(),
      excerpt: z.string().min(1).max(320),
      category: z.string().min(1),
      tags: z.array(z.string()).default([]),
      /**
       * Where the facts came from, listed at the foot of the article. A
       * practical guide — where the playgrounds are, which day the market
       * runs — is only worth reading if a reader can see what it rests on.
       */
      sources: z.array(z.object({ label: z.string().min(1), url: httpUrl })).default([]),
      /** The day the guide's facts were last checked, shown beside the date. */
      verified: localDate.optional(),
      /**
       * Where to go next, under the article: up to three links the editor
       * chose, each with one sentence on how it connects. A path on this
       * guide or a full URL. Without any, the strip falls back to the newest
       * articles in the same section, shown without a sentence.
       */
      related: z
        .array(
          z.object({
            label: z.string().min(1),
            href: z.string().regex(/^(\/|https?:\/\/)/, 'a path on this guide ("/places/…/") or a full URL'),
            /** One sentence on how it connects. */
            note: z.string().min(1),
          }),
        )
        .max(3)
        .default([]),
      /**
       * A Denver day on which this article's framing stops being current —
       * an election held, a season closed, a deadline passed. From that day
       * the page carries `supersededNote` at the top, decided by the build
       * and again by the reader's browser, so the article does not go on
       * describing a future that has happened.
       *
       * It does not hide or noindex the article. A careful account of what
       * was on a ballot is worth keeping after the vote; what it must stop
       * doing is presenting itself as advice for something still to come.
       */
      supersededAfter: localDate.optional(),
      /** What to say from that day. Plain sentences; no markup. */
      supersededNote: z.string().optional(),
      /** Where the current answer lives — an official source, not our own page. */
      supersededSource: httpUrl.optional(),
      supersededSourceLabel: z.string().optional(),
      /**
       * The route at a glance, on a first-visit itinerary: where it starts
       * and where to leave the car, how long it takes, on foot or by car,
       * the day that suits it, and the one caveat a reader should know
       * before setting out. Shown under the title (follow-up audit, 8
       * October 2026: the practical facts were there but spread down a long
       * page). Every line restates the article; a glance is a summary of
       * it, not a second source, so a fact that is not in the body does not
       * belong here, and a line the article cannot support is left out.
       */
      glance: z
        .object({
          start: z.string().min(1).max(160),
          duration: z.string().min(1).max(160).optional(),
          by: z.string().min(1).max(160),
          bestDay: z.string().min(1).max(160).optional(),
          caveat: z.string().min(1).max(160).optional(),
        })
        .optional(),
    })
    .refine((a) => !a.image || !!a.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    })
    .refine((a) => !a.supersededAfter || !!a.supersededNote, {
      message: 'supersededAfter needs a supersededNote saying what changed',
      path: ['supersededNote'],
    })
    .refine((a) => !a.supersededSource || !!a.supersededSourceLabel, {
      message: 'supersededSource needs a supersededSourceLabel; a bare URL is not a link text',
      path: ['supersededSourceLabel'],
    })
    .refine((a) => !a.supersededNote || !!a.supersededAfter, {
      message: 'supersededNote needs a supersededAfter date saying when it starts being true',
      path: ['supersededAfter'],
    });
}

/** A sent issue of the weekly email, archived as its own page. */
export function issueSchema<I extends z.ZodType>(image: () => I) {
  return z.object({
    title: z.string().min(1),
    slug,
    /** The day it went out. */
    date: localDate,
    /** Issue number, for the archive listing. */
    number: z.number().int().positive().optional(),
    excerpt: z.string().min(1).max(320),
    image: image().optional(),
    imageAlt: z.string().optional(),
    /** Shown under the image. Required when the license asks for attribution. */
    imageCredit: z.string().optional(),
    /** Town slugs this issue went to. Empty means the whole network. */
    towns: z.array(z.string()).default([]),
  });
}

/**
 * The editor's notes for one town and one week: content/<town>/weekly/<weekOf>.md,
 * copied from scripts/templates/weekly-template.md. "This week in [Town]"
 * (ThisWeek.astro) reads them: the pick from the current week's file only,
 * dated by the listing it links to, and New & closed from every file whose
 * items have not expired.
 */
export const CHANGE_TAGS = ['opening', 'closed', 'new-hours', 'moved', 'added-to-guide'] as const;
export type ChangeTag = (typeof CHANGE_TAGS)[number];
/**
 * What the tag says on the page. "Added to the guide" is a listing new to
 * us, not a business new to the town, and is never shown as an opening.
 */
export const CHANGE_TAG_LABELS: Record<ChangeTag, string> = {
  opening: 'Opening',
  closed: 'Closed',
  'new-hours': 'New hours',
  moved: 'Moved',
  'added-to-guide': 'Added to the guide',
};
/** A claim about a business needs the owner's or an official announcement behind it; a guide addition is our own doing. */
export const SOURCED_CHANGE_TAGS: readonly ChangeTag[] = ['opening', 'closed', 'new-hours', 'moved'];

/** The template's empty strings read as "not set", so a copied file validates as it is. */
const blank = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const weeklyChangeSchema = z.object({
  tag: z.enum(CHANGE_TAGS),
  name: z.string().min(1),
  detail: z.string().min(1),
  /** The owner's or official announcement. Required on the page for every tag but added-to-guide. */
  source: blank(httpUrl),
  /** The day the item was checked against its source; shown as "Checked …". */
  checked: localDate,
  /**
   * The day the business actually changed, when it is known and is not the
   * week the guide noticed: Fly Away Home closed on 24 December 2024 and the
   * guide found out on 7 October 2026. The page says both dates, and an
   * item whose change is more than CHANGE_DAYS before its check is labelled
   * as a correction to the guide rather than as this week's news
   * (src/lib/weekly.ts, `isBacklog`). Without it, the change is taken to be
   * recent. Never later than `checked`.
   */
  effective: blank(localDate),
  /** The last day the item shows. Default: 14 days after the file's weekOf. */
  expires: blank(localDate),
}).refine((c) => !c.effective || c.effective.getTime() <= c.checked.getTime(), {
  message: 'effective is the day the business changed, so it cannot be after the day it was checked',
  path: ['effective'],
});
export type WeeklyChange = z.infer<typeof weeklyChangeSchema>;

const isBlankChange = (c: unknown) =>
  typeof c === 'object' && c !== null && ['name', 'detail', 'source'].every((k) => !(c as Record<string, unknown>)[k]);

export function weeklySchema() {
  return z.object({
    /** The Monday the file is for. The file name is the same date. */
    weekOf: localDate,
    /**
     * The week in two or three plain sentences, under "The week of …" in
     * the flagship home page's masthead. Every fact in it is one the week's
     * listings or sources carry. Blank, the masthead leaves the block out.
     */
    headline: blank(z.string().min(1)),
    /**
     * The flagship home page's title over "Three things to know": a few
     * words for the week ("A vote, a park, a deadline"). Blank, "This week".
     */
    knowTitle: blank(z.string().min(1)),
    pick: z
      .object({
        title: blank(z.string().min(1)),
        body: blank(z.string().min(1)),
        /**
         * The listing on this guide, /events/<slug>/. Its date decides where
         * the pick shows (src/lib/weekly.ts currentPick): Our pick only in
         * the week it is on, "Coming up" if later, nowhere without one.
         */
        url: blank(httpUrl),
      })
      .optional(),
    // The template's blank item is dropped, not an error; a half-filled one is.
    changes: z.preprocess(
      (v) => (Array.isArray(v) ? v.filter((c) => !isBlankChange(c)) : v),
      z.array(weeklyChangeSchema).default([]),
    ),
    /**
     * A resident's question answered in a few sentences, from a named source:
     * "When does the winter activity guide open?" The week's page shows it
     * under its own heading; a week without one shows nothing there.
     */
    qa: z
      .object({
        question: z.string().min(1),
        answer: z.string().min(1),
        source: blank(httpUrl),
        sourceLabel: blank(z.string().min(1)),
      })
      .optional(),
    /**
     * An original local feature for the week: a person, a place, a thing
     * the editor went and looked at. `url` is the page it lives on (a
     * profile, an article, a place) and `body` the teaser. Only ever the
     * editor's own reporting or material the subject supplied; nothing
     * here is written from a search result.
     */
    feature: z
      .object({
        title: z.string().min(1),
        body: z.string().min(1),
        url: blank(z.string().regex(/^(\/|https?:\/\/)/, 'a path on this guide or a full URL')),
        /** Where the reporting came from: "Interview with …, 14 October 2026", "Supplied by …". */
        basis: z.string().min(1),
      })
      .optional(),
  });
}
export type WeeklyNotes = z.infer<ReturnType<typeof weeklySchema>>;

/**
 * One entry on a site's public corrections log (/corrections/): a change made
 * because a reader said something was wrong. content/<town>/corrections/
 * <date>-<slug>.md, or content/hub/corrections/ for the network's own pages.
 * The body, if any, is the longer note; the summary is the one line the log shows.
 */
export const correctionSchema = z.object({
  /** The day the change was made. */
  date: localDate,
  /** What changed, in one line: "Niwot Tavern: hours corrected to Tue–Sun 11am–9pm." */
  summary: z.string().min(1).max(200),
  /** The page that changed, as a path on this site: "/places/niwot-tavern/". */
  item: z.string().regex(/^\//, 'a path on this site, starting with /').optional(),
});

/** Free-form pages such as moving-here.md. */
export function pageSchema<I extends z.ZodType>(image: () => I) {
  return z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    image: image().optional(),
    imageAlt: z.string().optional(),
    /** Shown under the image. Required when the license asks for attribution. */
    imageCredit: z.string().optional(),
    updated: localDate.optional(),
  });
}

/*
 * The source registry: content/<town>/sources.json, the places the editor
 * checks each week. Not a content collection (nothing public renders it);
 * src/lib/sources.ts reads and writes it, the validator checks it, and
 * `npm run sources` lists, confirms and probes it.
 *
 * `status` governs ingestion only. A `proposed` source is never fetched by
 * ingest until the editor confirms it; content that already cites the source
 * by URL publishes regardless, because publishing turns on an item's own
 * `source` and `verified`, never on the registry.
 */
export const SOURCE_TYPES = ['ical', 'rss', 'json', 'html', 'manual'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];
export const SOURCE_CATEGORIES = ['city-calendar', 'county', 'chamber', 'library', 'parks', 'venue', 'news', 'other'] as const;
export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];
/** The order the editor confirms them in: the civic and institutional calendars first. */
export const CORE_CATEGORIES: readonly SourceCategory[] = ['city-calendar', 'county', 'chamber', 'library', 'parks'];
export const SOURCE_STATUSES = ['proposed', 'confirmed', 'retired'] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];
export const SOURCE_CHECK_RESULTS = ['ok', 'broken', 'changed', 'blocked', 'unreachable', 'skipped'] as const;

export const sourceSchema = z
  .object({
    /** Stable key, lowercase with hyphens; what an item's `sourceId` names. */
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be lowercase letters, numbers and hyphens'),
    /** On a multi-town guide, which town it covers. */
    subTown: z.string().min(1).optional(),
    /** What the editor calls it. Seeded as the host name; never invented. */
    name: z.string().min(1),
    /** The page a person opens to check it. */
    url: httpUrl,
    /** The machine-readable feed ingest reads, where there is one. Required for ical, rss and json. */
    feedUrl: httpUrl.optional(),
    /** One page the content actually cited, for whoever confirms the source. */
    sampleUrl: httpUrl.optional(),
    type: z.enum(SOURCE_TYPES),
    category: z.enum(SOURCE_CATEGORIES),
    /** `core` sources are confirmed first; the rest wait until they are needed. */
    priority: z.enum(['core', 'other']).default('other'),
    status: z.enum(SOURCE_STATUSES).default('proposed'),
    checkFrequency: z.enum(['weekly', 'monthly']).default('weekly'),
    lastChecked: localDate.optional(),
    lastStatus: z.enum(SOURCE_CHECK_RESULTS).optional(),
    /** What the last check saw, in a few words. */
    lastNote: z.string().optional(),
    /** How many published items cite a URL on this host, at the last seeding. */
    cites: z.object({ events: z.number().int().nonnegative(), places: z.number().int().nonnegative() }).optional(),
    /**
     * `honor` (the default): the feed is fetched only where the site's
     * robots.txt allows our user agent, like every other request these
     * scripts make. `subscribe`: the feed is one the owner publishes for
     * calendar subscriptions (a library's "add to your calendar" link) and the
     * editor has decided a weekly read is within that; set by the editor
     * only, never by seeding. Ingest says which rule it applied.
     */
    robots: z.enum(['honor', 'subscribe']).default('honor'),
    /**
     * Keep only feed items whose location matches one of these (case-
     * insensitive substrings). A district-wide library feed or a county
     * calendar carries every branch; the guide wants its town's.
     */
    locationFilter: z.array(z.string().min(1)).optional(),
    /**
     * Feed items whose title matches one of these (case-insensitive) are not
     * staged. A recreation centre's calendar lists lap swim and open gym every
     * day; the guide's event standard does not list them. Set by the editor.
     * A plain entry is a piece of the title; one starting with `^` is a
     * regular expression, for a holiday or closure marker that must not
     * catch a festival named after the same day ("^Christmas$", not
     * "Christmas"). See scripts/lib/ingest.ts, excludedTitle.
     */
    excludeTitles: z
      .array(
        z
          .string()
          .min(1)
          .refine((t) => {
            if (!t.startsWith('^')) return true;
            try {
              new RegExp(t, 'i');
              return true;
            } catch {
              return false;
            }
          }, 'an entry starting with ^ must be a valid regular expression'),
      )
      .optional(),
    /**
     * Keep only feed items carrying one of these feed categories (case-
     * insensitive, exact), or drop items carrying one of these. A hall's
     * rental calendar marks its public events "Featured Event" among the
     * rehearsals and private bookings; a brewery's calendar files the daily
     * food truck under "Food Trucks". Set by the editor; the feed's own
     * category names, not the guide's.
     */
    includeCategories: z.array(z.string().min(1)).optional(),
    excludeCategories: z.array(z.string().min(1)).optional(),
    /** Feed venue text -> the name the guide uses: { "Johnstown Location": "Glenn A. Jones, M.D. Memorial Library" }. */
    venueAliases: z.record(z.string(), z.string().min(1)).optional(),
    /** The venue when the feed names a room or an address but not the place: a library's own calendar. */
    defaultVenue: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine((s) => !['ical', 'rss', 'json'].includes(s.type) || !!s.feedUrl, {
    message: 'a feed source needs its feedUrl',
    path: ['feedUrl'],
  });

export type Source = z.infer<typeof sourceSchema>;

export const sourceRegistrySchema = z
  .object({
    town: z.string().min(1),
    sources: z.array(sourceSchema),
  })
  .refine((r) => new Set(r.sources.map((s) => s.id)).size === r.sources.length, {
    message: 'source ids must be unique within a town',
    path: ['sources'],
  });

export type SourceRegistry = z.infer<typeof sourceRegistrySchema>;

/**
 * A change the source made to an already-approved event, written by ingest
 * to content/<town>/staging/changes/<slug>.json and settled in review. The
 * published file is left as it was (with `changeFlag` set) until the editor
 * rules; a cancellation is the one change that goes to the top of the queue.
 */
export const changeSchema = z.object({
  /** The published event's slug. */
  slug: z.string().min(1),
  sourceId: z.string().min(1),
  sourceUid: z.string().min(1).optional(),
  /** The feed item or page the change was read from. */
  sourceUrl: httpUrl,
  detected: localDate,
  /** The source now marks the event canceled. */
  cancel: z.boolean().default(false),
  changes: z.array(z.object({ field: z.string().min(1), was: z.string(), now: z.string() })),
});
export type Change = z.infer<typeof changeSchema>;


/*
 * Programs, clubs and ways in: content/<town>/programs/<slug>.md.
 *
 * The ongoing things a resident can join, register for or turn up to,
 * kept apart from the dated events: a storytime is a weekly listing on the
 * calendar, but "what can my four-year-old join this winter" is a question
 * about programs, with an age range, a season, a price and a deadline. One
 * file per program or organization; a dated session of it is still an
 * event, and `nextEvent` points at the listing rather than copying it.
 *
 * Every entry carries `source` and `verified` like a place does, and is
 * held back without them (src/lib/content.ts). Nothing here is a claim the
 * organizer did not publish: a field the organizer's page does not give is
 * left out, and the page says "not stated" rather than guessing.
 */
export const PROGRAM_AUDIENCES = ['babies', 'preschool', 'elementary', 'teens', 'adults', 'seniors', 'families', 'everyone'] as const;
export type ProgramAudience = (typeof PROGRAM_AUDIENCES)[number];
export const PROGRAM_AUDIENCE_LABELS: Record<ProgramAudience, string> = {
  babies: 'Babies and toddlers',
  preschool: 'Preschoolers',
  elementary: 'Elementary age',
  teens: 'Teens',
  adults: 'Adults',
  seniors: '50 and over',
  families: 'Families together',
  everyone: 'Everyone',
};

export const PROGRAM_KINDS = ['program', 'league', 'class', 'club', 'organization', 'volunteer', 'meeting', 'social', 'service'] as const;
export type ProgramKind = (typeof PROGRAM_KINDS)[number];
export const PROGRAM_KIND_LABELS: Record<ProgramKind, string> = {
  program: 'Program',
  league: 'League or team',
  class: 'Class',
  club: 'Club or group',
  organization: 'Organization',
  volunteer: 'Volunteering',
  meeting: 'Public meeting',
  social: 'Social activity',
  service: 'Service',
};

/** The subjects a family hub groups by, in the order the page shows them. */
export const PROGRAM_TOPICS = ['sports', 'arts', 'learning', 'outdoors', 'community', 'civic', 'history', 'faith', 'other'] as const;
export type ProgramTopic = (typeof PROGRAM_TOPICS)[number];
export const PROGRAM_TOPIC_LABELS: Record<ProgramTopic, string> = {
  sports: 'Sports and recreation',
  arts: 'Arts and music',
  learning: 'Learning and the library',
  outdoors: 'Outdoors',
  community: 'Community',
  civic: 'Civic and public meetings',
  history: 'History',
  faith: 'Faith',
  other: 'Other',
};

/** What a venue booking is, so a room reservation is never shown as an open invitation. */
export const PROGRAM_ACCESS = ['public', 'members', 'registered', 'private'] as const;
export type ProgramAccess = (typeof PROGRAM_ACCESS)[number];
export const PROGRAM_ACCESS_LABELS: Record<ProgramAccess, string> = {
  public: 'Open to the public',
  members: 'Members and their guests',
  registered: 'Registration required',
  private: 'Private',
};

/**
 * Where a program stands (Lyons audit, 26 October 2026: a football season
 * that ended on October 7 and a storytime break read the same as an open
 * league). `open`: running or taking sign-ups now. `upcoming`: announced,
 * not yet started or not yet taking sign-ups. `full`: the organizer says
 * the places are taken. `paused`: a break the organizer has announced, with
 * its dates. `ended`: the season or session is over and the next one is
 * not posted. The page derives what it can from the file's dates
 * (src/lib/programs.ts, programStatus); `status` is for what only the
 * organizer's words can say, and it is never assumed.
 */
export const PROGRAM_STATUSES = ['open', 'upcoming', 'full', 'paused', 'ended'] as const;
export type ProgramStatusState = (typeof PROGRAM_STATUSES)[number];
export const PROGRAM_STATUS_LABELS: Record<ProgramStatusState, string> = {
  open: 'Open now',
  upcoming: 'Not started yet',
  full: 'Full',
  paused: 'On a break',
  ended: 'Ended',
};

export function programSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      slug,
      /** On a multi-town guide, which town. */
      subTown: z.string().min(1).optional(),
      kind: z.enum(PROGRAM_KINDS),
      topic: z.enum(PROGRAM_TOPICS).default('other'),
      audience: z.array(z.enum(PROGRAM_AUDIENCES)).min(1),
      /** Who runs it: "Berthoud Recreation", "Niwot Youth Sports". */
      organizer: z.string().min(1),
      organizerUrl: httpUrl.optional(),
      /** Where to register, join or read more, when it is not the organizer's front page. */
      url: httpUrl.optional(),
      /** One or two sentences for the row. */
      summary: z.string().min(1).max(320),
      /** "Ages 4–5", "Grades 3–8", "16 and up", as the organizer writes it. */
      ages: z.string().min(1).optional(),
      /**
       * The same eligibility as whole years, where the organizer gives
       * numbers: `ageFrom: 11, ageTo: 17` for a troop of 11 to 17, `ageFrom:
       * 16` alone for "16 and up". The family hub files a program by these
       * when they are set and by `audience` when they are not, so a program
       * for 11 to 17 is never under "Ages 5–11" because a tag said so.
       */
      ageFrom: z.number().int().min(0).max(120).optional(),
      ageTo: z.number().int().min(0).max(120).optional(),
      /** "Berthoud Recreation Center, 1000 N Berthoud Pkwy". */
      location: z.string().min(1).optional(),
      /** "Tuesdays 4:30–5:30 pm", "Most Thursdays 7:30–8:30 am". */
      schedule: z.string().min(1).optional(),
      /** "Winter 2027: January to March", "Year-round". */
      season: z.string().min(1).optional(),
      /** "$91 resident / $101 non-resident", "Free", "$30 a year per household". */
      price: z.string().min(1).optional(),
      /**
       * The organizer says taking part costs nothing. Set it only for the
       * activity itself: free volunteering, a free membership benefit or a
       * free tour of a paid museum is not a free program. Unset, the hub
       * reads `price` and counts only a line that begins "Free" with no
       * paid part after it (src/lib/programs.ts, isFree).
       */
      free: z.boolean().optional(),
      /**
       * No sign-up and no fixed date: a reader can turn up any day it runs.
       * Unset, the hub takes `registration.required: false` as the same
       * thing; a program with no registration block is not assumed either way.
       */
      dropIn: z.boolean().optional(),
      /** What to bring or buy: "Own glove; bats and helmets provided". */
      equipment: z.string().min(1).optional(),
      /** Who may take part, and how: see PROGRAM_ACCESS. */
      access: z.enum(PROGRAM_ACCESS).default('public'),
      registration: z
        .object({
          required: z.boolean(),
          /** "Online through DaySmart", "Call 970-532-2757", "Form at the front desk". */
          how: z.string().min(1).optional(),
          url: httpUrl.optional(),
          /** The organizer's own deadline, as a Denver day. */
          deadline: localDate.optional(),
          /** The day registration opens, where the organizer says. */
          opens: localDate.optional(),
          /** The organizer's words on the deadline where a date alone misleads: "Early-bird pricing through November". */
          note: z.string().min(1).optional(),
        })
        .optional(),
      /** The organizer says beginners are fine. Left unset when they do not say. */
      beginners: z.boolean().optional(),
      /** The organizer says newcomers or visitors are welcome. Left unset when they do not say. */
      newcomers: z.boolean().optional(),
      /** The slug of the listing that is this program's next public date, on this guide. */
      nextEvent: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
      /**
       * Days the program keeps hours it does not usually keep, in the
       * organizer's words: the pool's school-break swims. The family hub's
       * days-off rows read these, so a break with a program open on it says
       * so in a chip rather than sending a reader to look.
       */
      openOn: z
        .array(
          z
            .object({ from: localDate, to: localDate, note: z.string().min(1) })
            .refine((o) => o.from.getTime() <= o.to.getTime(), { message: 'openOn: from is after to' }),
        )
        .optional(),
      /**
       * The current or next session's first and last days, where the
       * organizer gives them. Before `starts` the program reads as not
       * started yet; after `ends` it reads as ended until the file names
       * the next session, so a finished season never passes for an open one.
       */
      starts: localDate.optional(),
      ends: localDate.optional(),
      /** Where the program stands, on the organizer's word: see PROGRAM_STATUSES. Unset, the dates decide, or nothing is said. */
      status: z.enum(PROGRAM_STATUSES).optional(),
      /** The first day `status` holds (a break that starts next week). Unset, it holds from now. */
      statusFrom: localDate.optional(),
      /** The last day `status` holds (a break's last day); after it the program reads as running again. */
      statusUntil: localDate.optional(),
      /** The organizer's words on the status: "Storytime takes a break", "The fall session filled; wait list open". */
      statusNote: z.string().min(1).optional(),
      /** A need the organizer has published, in their words: "Parent volunteers needed". */
      volunteerNeed: z.string().min(1).optional(),
      /** How to make a first inquiry: an email, a phone, a form. */
      contact: z.string().min(1).optional(),
      /** The organizer's page this was read from. Required to publish. */
      source: httpUrl.optional(),
      /** The day the facts above were read. Required to publish. */
      verified: localDate.optional(),
      verifiedBy: z.string().min(1).optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    })
    .refine((p) => !p.image || !!p.imageAlt, { message: 'imageAlt is required when image is set', path: ['imageAlt'] })
    .refine((p) => !p.registration?.deadline || !p.registration.opens || p.registration.opens.getTime() <= p.registration.deadline.getTime(), {
      message: 'registration opens before its deadline',
      path: ['registration'],
    })
    .refine((p) => p.ageFrom === undefined || p.ageTo === undefined || p.ageFrom <= p.ageTo, {
      message: 'ageFrom is greater than ageTo',
      path: ['ageTo'],
    })
    .refine((p) => !p.starts || !p.ends || p.starts.getTime() <= p.ends.getTime(), { message: 'starts is after ends', path: ['ends'] })
    .refine((p) => !p.statusFrom || !p.statusUntil || p.statusFrom.getTime() <= p.statusUntil.getTime(), {
      message: 'statusFrom is after statusUntil',
      path: ['statusUntil'],
    })
    .refine((p) => !!p.status || (!p.statusFrom && !p.statusUntil && !p.statusNote), {
      message: 'statusFrom, statusUntil and statusNote need a status',
      path: ['status'],
    })
    .refine((p) => p.status !== 'paused' || !!p.statusUntil, {
      message: 'a paused program says when it is back: statusUntil is its last day off',
      path: ['statusUntil'],
    });
}
export type ProgramData = z.infer<ReturnType<typeof programSchema>>;

/*
 * Local changes: content/<town>/updates/<slug>.md.
 *
 * What changed, who it affects, when, what a resident should do, and where
 * the original is: an opening or a closure, a road or park closure, a
 * decision a public body took, a program announced. One file per change.
 * Three dates are kept apart on purpose: `effective` is when the thing
 * happens or happened, `published` is when the guide wrote it up, and
 * `verified` is when the source was last read. An old closure found this
 * month is an old closure, and the page says so.
 *
 * `stage` is where the change stands: a proposal is not an approval, and
 * approved work is not work under way. `expires` is the last day it shows
 * on the pages that promise what is current; after that it is archive,
 * still reachable, never recycled as news.
 */
export const UPDATE_KINDS = ['opening', 'closure', 'move', 'construction', 'park', 'decision', 'program', 'notice'] as const;
export type UpdateKind = (typeof UPDATE_KINDS)[number];
export const UPDATE_KIND_LABELS: Record<UpdateKind, string> = {
  opening: 'Opening',
  closure: 'Closure',
  move: 'Move',
  construction: 'Construction and access',
  park: 'Parks and facilities',
  decision: 'Public decision',
  program: 'Program announcement',
  notice: 'Notice',
};
export const UPDATE_STAGES = ['proposed', 'approved', 'underway', 'complete', 'scheduled'] as const;
export type UpdateStage = (typeof UPDATE_STAGES)[number];
export const UPDATE_STAGE_LABELS: Record<UpdateStage, string> = {
  proposed: 'Proposed',
  approved: 'Approved',
  underway: 'Under way',
  complete: 'Complete',
  scheduled: 'Scheduled',
};

export function updateSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      slug,
      subTown: z.string().min(1).optional(),
      kind: z.enum(UPDATE_KINDS),
      stage: z.enum(UPDATE_STAGES),
      /** What changed, in one or two sentences. */
      summary: z.string().min(1).max(400),
      /** Who it affects: "Anyone driving CO 119 through Niwot", "Families with children in Thompson schools". */
      affects: z.string().min(1),
      /** What a resident should do, in a sentence. Optional: some changes ask nothing. */
      action: z.string().min(1).optional(),
      /** When the change takes or took effect, as a Denver day; the first day of a run. */
      effective: localDate,
      /** The last day of a run (a closure through the 25th), inclusive. */
      effectiveEnd: localDate.optional(),
      /** The organizer's words where a date alone misleads: "Spring 2027", "First Sunday of each month". */
      effectiveNote: z.string().min(1).optional(),
      /** The day the guide published this. */
      published: localDate,
      /** The day the source was last read. Required to publish. */
      verified: localDate.optional(),
      verifiedBy: z.string().min(1).optional(),
      /** The original: the agency's or business's own page. Required to publish. */
      source: httpUrl.optional(),
      /** "CDOT project page", "Town of Berthoud news release". */
      sourceLabel: z.string().min(1).optional(),
      /** A second source, where the first is a report rather than the original. */
      alsoSource: httpUrl.optional(),
      alsoSourceLabel: z.string().min(1).optional(),
      /** The last day this shows as current; after it, the archive. Default: effectiveEnd, else 60 days after effective. */
      expires: localDate.optional(),
      /** A page on this guide the change is about: "/places/fly-away-home/". */
      item: z.string().regex(/^\//, 'a path on this guide, starting with /').optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: z.string().optional(),
      featured: z.boolean().default(false),
    })
    .refine((u) => !u.image || !!u.imageAlt, { message: 'imageAlt is required when image is set', path: ['imageAlt'] })
    .refine((u) => !u.effectiveEnd || u.effectiveEnd.getTime() >= u.effective.getTime(), {
      message: 'effectiveEnd is on or after effective',
      path: ['effectiveEnd'],
    })
    .refine((u) => !u.alsoSource || !!u.alsoSourceLabel, { message: 'alsoSource needs an alsoSourceLabel', path: ['alsoSourceLabel'] });
}
export type UpdateData = z.infer<ReturnType<typeof updateSchema>>;

/*
 * People: content/<town>/profiles/<slug>.md. A short profile of someone
 * behind the town: a business owner, a volunteer, an artist, a coach, a
 * longtime resident, someone running a program.
 *
 * Nothing here is ever generated. A profile publishes only when it rests on
 * original or authorized material: an interview the editor conducted, words
 * the subject supplied and approved, or a published account the subject's
 * own organization put out. `basis` says which, with the date, and
 * `consent` says the subject agreed to appear; a file without both stays a
 * draft (`status: draft`), is validated, and is never built. A draft is
 * where the questions still to ask are kept, so the handoff can say
 * exactly what is missing.
 */
export const PROFILE_ROLES = ['business-owner', 'volunteer', 'artist', 'coach', 'longtime-resident', 'organizer', 'educator', 'other'] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];
export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  'business-owner': 'Business owner',
  volunteer: 'Volunteer',
  artist: 'Artist',
  coach: 'Coach',
  'longtime-resident': 'Longtime resident',
  organizer: 'Runs a community program',
  educator: 'Educator',
  other: 'Resident',
};
export const PROFILE_BASES = ['interview', 'supplied', 'published-by-subject', 'public-record'] as const;
export type ProfileBasis = (typeof PROFILE_BASES)[number];

export function profileSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      name: z.string().min(1),
      slug,
      subTown: z.string().min(1).optional(),
      role: z.enum(PROFILE_ROLES),
      /** "Owner, Inkberry Books", "Scoutmaster, Troop 161". */
      affiliation: z.string().min(1).optional(),
      /** A page on this guide: the place or program they are behind. */
      item: z.string().regex(/^\//, 'a path on this guide, starting with /').optional(),
      /** One or two sentences for the row and the card. */
      summary: z.string().min(1).max(320),
      /** `draft` until the material and the consent exist; only `published` builds. */
      status: z.enum(['draft', 'published']).default('draft'),
      /** What the profile rests on, and when: see PROFILE_BASES. */
      basis: z
        .object({
          kind: z.enum(PROFILE_BASES),
          /** "Interview at the shop, 14 October 2026", "Statement supplied by email, 2 October 2026". */
          detail: z.string().min(1),
          on: localDate,
        })
        .optional(),
      /** The subject agreed to the profile and the photograph: how and when. */
      consent: z.object({ how: z.enum(['email', 'in-person', 'phone', 'form']), on: localDate }).optional(),
      /** Still to ask, for a draft: each a question the editor needs answered before publishing. */
      needs: z.array(z.string().min(1)).default([]),
      date: localDate.optional(),
      updated: localDate.optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      imageCredit: z.string().optional(),
      sources: z.array(z.object({ label: z.string().min(1), url: httpUrl })).default([]),
      tags: z.array(z.string()).default([]),
    })
    .refine((p) => !p.image || !!p.imageAlt, { message: 'imageAlt is required when image is set', path: ['imageAlt'] })
    .refine((p) => p.status !== 'published' || (!!p.basis && !!p.consent && !!p.date), {
      message: 'a published profile needs basis, consent and date; without them it stays a draft',
      path: ['status'],
    })
    .refine((p) => p.status !== 'published' || p.needs.length === 0, {
      message: 'a profile with open questions is not ready to publish',
      path: ['needs'],
    });
}
export type ProfileData = z.infer<ReturnType<typeof profileSchema>>;

export const COLLECTIONS = ['events', 'places', 'articles', 'pages', 'issues', 'weekly', 'corrections', 'programs', 'updates', 'profiles'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

/** The collections that have a staging folder: content/<town>/staging/<collection>/. */
export const STAGED_COLLECTIONS = ['events', 'places'] as const satisfies readonly CollectionName[];

export const schemaFor: Record<CollectionName, (image: ImageSchema) => z.ZodType> = {
  events: eventSchema,
  places: placeSchema,
  articles: articleSchema,
  pages: pageSchema,
  issues: issueSchema,
  weekly: () => weeklySchema(),
  corrections: () => correctionSchema,
  programs: programSchema,
  updates: updateSchema,
  profiles: profileSchema,
};

/**
 * What an entry that failed its schema becomes inside the build.
 *
 * A content collection fails the whole build on one bad frontmatter field,
 * in any town, because every town loads into the same collection. A failed
 * build on Vercel leaves the previous deployment serving, with last week's
 * events and whatever was stale then, which is the one outcome the freshness
 * work exists to prevent. So the build-time schema catches the failure and
 * keeps the entry as this marker instead; src/lib/content.ts drops every
 * marker before a page sees it and says which, and `npm run validate` (CI,
 * and before every build) reports the same file with the same issues. The
 * site is never stale and the error is never silent.
 */
export interface ExcludedData {
  excluded: true;
  title: string;
  issues: string[];
}

export function isExcluded(data: unknown): data is ExcludedData {
  return typeof data === 'object' && data !== null && (data as { excluded?: unknown }).excluded === true;
}

/** `schema`, with failures turned into an ExcludedData marker instead of an error. */
export function lenient<T extends z.ZodTypeAny>(schema: T) {
  return schema.catch((ctx) => {
    const input = (ctx.input ?? {}) as { title?: unknown };
    const marker: ExcludedData = {
      excluded: true,
      title: typeof input.title === 'string' ? input.title : '(untitled)',
      issues: ctx.error.issues.map((i) => `${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`),
    };
    return marker as unknown as z.output<T>;
  });
}
