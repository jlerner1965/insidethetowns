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
 * is written out once, in docs/ACCURACY-SYSTEM.md, "Field names".
 *
 * Two layers decide what publishes. This file says what a *valid* entry is,
 * and an invalid one is excluded from the build with a warning rather than
 * failing it (see `lenient` below). src/lib/freshness.ts says what a
 * *publishable* entry is: sourced, dated, and inside its freshness window.
 */
import { z } from 'astro/zod';
import { parseLocal } from '../lib/dates.ts';
import { OPENING_HOURS_RE } from '../lib/hours.ts';

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
  'park',
  'venue',
  'lodging',
  'service',
] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

export const EAT_DRINK_TYPES: readonly PlaceType[] = ['restaurant', 'bar', 'coffee'];
export const THINGS_TO_DO_TYPES: readonly PlaceType[] = ['trail', 'park', 'venue'];

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

/** Headings over a group of places: "Restaurants", not "Restaurant". */
export const PLACE_TYPE_PLURALS: Record<PlaceType, string> = {
  restaurant: 'Restaurants',
  bar: 'Bars & breweries',
  coffee: 'Coffee & sweets',
  shop: 'Shops',
  trail: 'Trails',
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
      /** The organizer's page or calendar the listing was read from. */
      source: httpUrl.optional(),
      /** The day the listing was checked against its source. */
      verified: localDate.optional(),
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
 */
export const seasonalSchema = z.object({
  /** When these hours apply, as a reader reads it: "Memorial Day to mid-October". */
  season: z.string().min(1),
  /** Hours during the season, same form as `hours`. */
  hours: z.string().min(1).optional(),
  /** Months the place is shut: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]. */
  closedMonths: z.array(z.string().min(1)).default([]),
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
    .refine((p) => !p.access || ['trail', 'park'].includes(p.type), {
      message: 'access notes belong on a trail or a park',
      path: ['access'],
    });
}

export function articleSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
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
     */
    excludeTitles: z.array(z.string().min(1)).optional(),
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

export const COLLECTIONS = ['events', 'places', 'articles', 'pages', 'issues'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

/** The collections that have a staging folder: content/<town>/staging/<collection>/. */
export const STAGED_COLLECTIONS = ['events', 'places'] as const satisfies readonly CollectionName[];

export const schemaFor: Record<CollectionName, (image: ImageSchema) => z.ZodType> = {
  events: eventSchema,
  places: placeSchema,
  articles: articleSchema,
  pages: pageSchema,
  issues: issueSchema,
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
