/**
 * Event filtering and grouping. Pure functions over collection entries so
 * they can be unit-tested without Astro.
 */
import type { CollectionEntry } from 'astro:content';
import { TIME_ZONE, addDays, dayKey, formatDayRange, formatMonthDay, formatTime, formatTimeRange, startOfDay } from './dates.ts';

type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

/**
 * True when the organizer has called it off or pulled the date. The listing
 * stays on the calendar, marked, for the reader who planned around it; it is
 * kept out of everything that recommends — the picks, the feeds, the email.
 */
export function isCanceled(event: { data: { status?: string } }): boolean {
  return event.data.status === 'canceled' || event.data.status === 'postponed';
}

/**
 * Expand weekly repeats and productions into one entry per occurrence, up to
 * `horizonDays` ahead of `now`. Everything else passes through untouched.
 * Occurrences share the source entry's slug, so they all link to the same
 * page.
 */
export function occurrences<T extends EventLike>(
  events: T[],
  { now = new Date(), horizonDays = 120 }: { now?: Date; horizonDays?: number } = {},
): T[] {
  const horizon = addDays(startOfDay(now), horizonDays).getTime();
  return sortByStart(events.flatMap((event) => expand(event, horizon)));
}

/**
 * Every date one listing has, as entries of their own: each week of a weekly
 * repeat through `until`, each show of a production, or the listing itself.
 * `horizon` stops a long repeat; `finalDay` passes none, since it wants the
 * last date however far off.
 */
function expand<T extends EventLike>(event: T, horizon = Infinity): T[] {
  const { repeat, until, start, end, performances } = event.data;
  // Each occurrence is as long as the first: `end` closes the first sitting.
  const duration = end ? end.getTime() - start.getTime() : 0;
  const at = (occStart: Date, timeNote = event.data.timeNote): T => ({
    ...event,
    data: { ...event.data, start: occStart, end: end ? new Date(occStart.getTime() + duration) : undefined, timeNote },
  });
  if (performances?.length) {
    // A show's card says its own time, and its own note when the box office
    // gives one: "7 pm; sold out", not the whole run's schedule.
    return performances
      .filter((p) => p.start.getTime() <= horizon)
      .map((p) => at(p.start, p.note ? `${formatTime(p.start)}; ${p.note}` : undefined));
  }
  if (repeat !== 'weekly' || !until) return [event];
  // Step by wall-clock weeks, not 7×24 hours: a 6 pm Tuesday repeat stays
  // at 6 pm Denver time across the November and March clock changes. The
  // `until` day is inclusive (the schema's word), so a 7 pm session on that
  // day is the last one, not the first one left out.
  const out: T[] = [];
  const lastStart = addDays(startOfDay(until), 1).getTime();
  for (let occStart = start; occStart.getTime() < lastStart && occStart.getTime() <= horizon; occStart = addDays(occStart, 7)) {
    out.push(at(occStart));
  }
  return out;
}

/**
 * The last Denver day a listing is on across every date it has, as
 * "2026-12-15": a weekly repeat's last week, a production's closing show,
 * and otherwise `lastDay`.
 *
 * `lastDay` and `isPast` answer for one sitting, and a weekly repeat's file
 * is its first sitting, so a trivia night running to December was taken for
 * over after its first Tuesday: every weekly series in the network carried
 * noindex and was missing from its sitemap (fresh audit, 9 October 2026).
 */
export function finalDay(event: EventLike): string {
  return expand(event).reduce((last, e) => (lastDay(e) > last ? lastDay(e) : last), lastDay(event));
}

/**
 * Whether a listing's page has anything left to offer: false while any date
 * of it is today or later. This is the expired-event rule, and the page's
 * noindex, the sitemap (through src/lib/series.ts, which reads the same
 * thing from raw markdown) and the network search all ask it, by the Denver
 * day, so a class that ended at 11:45 is not noindexed on the page while
 * still in that day's sitemap (fresh audit, 9 October 2026).
 */
export function isOver(event: EventLike, now = new Date()): boolean {
  return finalDay(event) < dayKey(now);
}

/** Keep the first entry per slug (or id), preserving order. */
export function uniqueByEvent<T extends EventLike>(events: T[]): T[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.slug ?? e.id ?? e.data.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The soonest occurrence that is not past, for a single event. */
export function nextOccurrence<T extends EventLike>(event: T, now = new Date()): T {
  return upcoming(occurrences([event], { now, horizonDays: 400 }), { now, limit: 1 })[0] ?? event;
}

/**
 * The instant an event is over, exclusive.
 *
 * All-day entries store `end` as the last day the thing is on ("2026-10-17" to
 * "2026-10-31" is a scarecrow trail you can still walk on the 31st), so the
 * moment it stops being on is the following midnight. A timed event ends when
 * it says it ends; one with no end time has no known end, and this returns its
 * start, so nothing claims it is under way. Whether it is still listed is
 * `listedUntil`'s question, not this one's.
 */
export function eventEnd(event: EventLike): Date {
  const { start, end, allDay } = event.data;
  if (allDay) return addDays(startOfDay(end ?? start), 1);
  if (end) return end;
  return start;
}

/**
 * The instant a listing comes off the pages, exclusive: a timed event at its
 * end time, an all-day run at the midnight after its last day, and a timed
 * event whose end the organizer never gave at the next Denver midnight.
 *
 * Today's listings used to stay up until midnight whatever time they ended,
 * so a 7 pm talk was still offered as "coming up" at 11 pm. A listing with no
 * end cannot drop off at its end, and dropping it at its start would take a
 * talk off the page while it is on, so it stays for the rest of its day.
 *
 * A display rule only. The midnight is ours, not the organizer's, so nothing
 * that exports an event (the .ics files, the Google link, the structured
 * data) reads this; those carry the end the listing gives, or none.
 */
export function listedUntil(event: EventLike): Date {
  const { start, end, allDay } = event.data;
  if (allDay || end) return eventEnd(event);
  return addDays(startOfDay(start), 1);
}

/**
 * When a listing is, as the .ics files, the Google link and the structured
 * data give it. All three read this, so they agree with each other and with
 * the page.
 *
 * One sitting goes as its start and its end, and an end the listing does not
 * give is left out, never guessed. An all-day listing goes as whole days. So
 * does a timed listing that runs across days for 24 hours or more, a festival
 * weekend or a three-week run with its show times in a note: exported from
 * its first start to its last end it was one block through every night in
 * between, which no reader could attend. Separately ticketed nights are
 * separate listings, one file per night, each exported on its own.
 *
 * An overnight sitting (8 pm to 12:30 am) is under 24 hours and stays timed.
 */
export function exportWhen(event: EventLike): { start: Date; end?: Date; allDay: boolean } {
  const { start, end, allDay } = event.data;
  if (allDay) return { start, end, allDay: true };
  if (end && dayKey(start) !== dayKey(end) && end.getTime() - start.getTime() >= 24 * 3_600_000) {
    return { start: startOfDay(start), end: startOfDay(end), allDay: true };
  }
  return { start, end, allDay: false };
}

/**
 * True once the listing is over by `listedUntil`. The comparison is `<=`
 * because that instant is exclusive: a talk that ends at 9 pm is gone at
 * 9 pm, and an all-day event on the 3rd is not still advertised on the 4th.
 */
export function isPast(event: EventLike, now = new Date()): boolean {
  return listedUntil(event).getTime() <= now.getTime();
}

/**
 * The last Denver day an event is on, as "2026-10-31".
 *
 * `eventEnd` is exclusive, so the final day is the one containing the instant
 * just before it. This is what the browser compares against today's date when
 * it clears finished listings out of a stale build.
 */
export function lastDay(event: EventLike): string {
  return dayKey(new Date(eventEnd(event).getTime() - 1));
}

/** True while the event has started and has not yet finished. */
export function isInProgress(event: EventLike, now = new Date()): boolean {
  const t = now.getTime();
  return event.data.start.getTime() <= t && eventEnd(event).getTime() > t;
}

/** True when a listing is on for more than one Denver day: a festival weekend, a six-week run. */
export function isMultiDay(event: EventLike): boolean {
  return lastDay(event) !== dayKey(event.data.start);
}

/**
 * The time line for a listing outside a day heading, as the email and the
 * sample issue print it: the organizer's own note if there is one, "Now
 * through October 31" for a run under way, the range for a run of whole days
 * not yet started, and otherwise the clock times.
 */
export function timeText(event: EventLike, now = new Date()): string {
  const { timeNote, start, end, allDay } = event.data;
  if (timeNote) return timeNote;
  if (end && isMultiDay(event)) {
    if (isInProgress(event, now)) return `Now through ${formatMonthDay(end)}`;
    if (allDay) return formatDayRange(start, end);
  }
  return formatTimeRange(start, end, allDay);
}

/**
 * Splits a list into the runs already under way, which began on an earlier
 * day and are still on, and everything else.
 *
 * A list grouped under day headings files each listing under the day it
 * starts, which put a corn maze that opened on September 23 under a
 * "Wednesday, September 23" heading for five weeks. The runs go in a group
 * of their own instead, each row saying "Now through October 31".
 */
export function splitOngoing<T extends EventLike>(events: T[], now = new Date()): { ongoing: T[]; dated: T[] } {
  const today = dayKey(now);
  const ongoing: T[] = [];
  const dated: T[] = [];
  for (const e of events) (dayKey(e.data.start) < today && !isPast(e, now) ? ongoing : dated).push(e);
  return { ongoing, dated };
}

export function sortByStart<T extends EventLike>(events: T[]): T[] {
  return [...events].sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
}

/**
 * Upcoming events: not past, optionally within the next `days` days,
 * sorted by start. `limit` caps the result.
 */
export function upcoming<T extends EventLike>(
  events: T[],
  { now = new Date(), days, limit }: { now?: Date; days?: number; limit?: number } = {},
): T[] {
  const horizon = days === undefined ? undefined : addDays(startOfDay(now), days);
  let list = sortByStart(events).filter((e) => !isPast(e, now));
  if (horizon) list = list.filter((e) => e.data.start.getTime() < horizon.getTime());
  if (limit !== undefined) list = list.slice(0, limit);
  return list;
}

export type DayGroup<T> = { key: string; date: Date; events: T[] };

/** Group sorted events by Denver calendar day. */
export function groupByDay<T extends EventLike>(events: T[]): DayGroup<T>[] {
  const groups = new Map<string, DayGroup<T>>();
  for (const event of sortByStart(events)) {
    const key = dayKey(event.data.start);
    const group = groups.get(key) ?? { key, date: startOfDay(event.data.start), events: [] };
    group.events.push(event);
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Categories present in a list, in schema order. */
export function categoriesIn<T extends EventLike>(events: T[], order: readonly string[]): string[] {
  const present = new Set(events.map((e) => e.data.category));
  return order.filter((c) => present.has(c as never));
}

/**
 * The weekend that is running now or coming next, as a Denver day window.
 *
 * On a Friday, Saturday or Sunday that is the weekend you are standing in, not
 * the next one — the case a naive "days until Friday" gets wrong. `end` is
 * exclusive (midnight opening Monday).
 */
export function weekendWindow(now = new Date()): { start: Date; sunday: Date; end: Date } {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = startOfDay(now);
  const dow = DAYS.indexOf(
    new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(today),
  );
  const sunday = addDays(today, dow === 0 ? 0 : 7 - dow);
  const start = dow === 0 || dow >= 5 ? today : addDays(sunday, -2);
  return { start, sunday, end: addDays(sunday, 1) };
}

export interface WeekendSections<T> {
  /** Under way at this moment. */
  now: T[];
  /** Starting inside the weekend window. */
  weekend: T[];
  /** Multi-day runs starting before the weekend, not under way yet, and still on on its Friday. */
  continuing: T[];
  /** Starting after the weekend, inside the horizon. */
  next: T[];
  /**
   * One-day listings between now and the weekend: Tuesday's council meeting.
   * No weekend page shows them, and they are not counted by sectionCount.
   */
  before: T[];
}

/**
 * Split events into the sections the weekend page shows, plus `before`, which
 * it does not. Every event that is not past lands in exactly one of them, so
 * "there is nothing on" can be decided by counting the shown sections rather
 * than by looking at one of them.
 *
 * "Still running" is for a run that lasts into the weekend. Anything else
 * that started before Friday used to land there too, which put Niwot's
 * one-off meetings of October 6 to 8 under "Still running" on its weekend
 * page; a one-day listing before the weekend is `before` now.
 */
export function weekendSections<T extends EventLike>(
  events: T[],
  { now = new Date(), horizonDays = 16 }: { now?: Date; horizonDays?: number } = {},
): WeekendSections<T> {
  const { start: weekendStart, sunday, end: weekendEnd } = weekendWindow(now);
  const horizon = addDays(sunday, horizonDays).getTime();
  const live = upcoming(events, { now });

  const friday = dayKey(weekendStart);
  const sections: WeekendSections<T> = { now: [], weekend: [], continuing: [], next: [], before: [] };
  for (const event of live) {
    const startsAt = event.data.start.getTime();
    if (isInProgress(event, now)) sections.now.push(event);
    else if (startsAt < weekendStart.getTime()) {
      (isMultiDay(event) && lastDay(event) >= friday ? sections.continuing : sections.before).push(event);
    } else if (startsAt < weekendEnd.getTime()) sections.weekend.push(event);
    else if (startsAt < horizon) sections.next.push(event);
  }
  return sections;
}

/** How many events a partition is carrying in the sections a weekend page shows. */
export function sectionCount<T>(sections: WeekendSections<T>): number {
  return sections.now.length + sections.weekend.length + sections.continuing.length + sections.next.length;
}

/**
 * The few listings a page should lead with, when it has room for a few.
 *
 * Date order alone leads with whatever is soonest, which on a Thursday evening
 * is Friday morning's storytime and knitting circle, with the weekend the
 * reader is actually planning pushed off the end. So this ranks before it
 * cuts: featured listings, then the coming weekend, then the rest by date. At
 * each step the one-offs come before the regulars — a release beats the
 * weekly trivia night — and a civic meeting comes after everything else,
 * because a council agenda is worth listing and is never the reason someone
 * opened the page. Within a tier it takes one listing from each day in turn,
 * so a Thursday build shows the weekend and not only Friday, which is what a
 * date-sorted tier comes to. The chosen few go back into date order, since a
 * list of dates that is not in date order reads as a mistake.
 */
export function highlights<T extends EventLike>(
  events: T[],
  { now = new Date(), limit = 6 }: { now?: Date; limit?: number } = {},
): T[] {
  const { start, end } = weekendWindow(now);
  const isRegular = regularTest(events);
  const rank = (e: T) => {
    const t = e.data.start.getTime();
    const weekend = t >= start.getTime() && t < end.getTime();
    return (e.data.featured ? 0 : weekend ? 4 : 8) + (isRegular(e) ? 2 : 0) + (e.data.category === 'civic' ? 1 : 0);
  };
  // One pick per listing, and one per series stored as a file per date: the
  // Saturday and Sunday of a studio tour are one event to a reader, not two
  // of a town's four picks.
  const seenSeries = new Set<string>();
  const live = uniqueByEvent(upcoming(events, { now }))
    .filter((e) => !isCanceled(e))
    .filter((e) => {
      const key = `${e.data.title}|${e.data.venue}`;
      if (seenSeries.has(key)) return false;
      seenSeries.add(key);
      return true;
    })
    .map((e, i) => ({ e, rank: rank(e), i, turn: 0 }));
  // `turn` is a listing's place among its tier's listings on its own day: the
  // first thing on Saturday ranks with the first thing on Friday, not after
  // the fourth.
  const seen = new Map<string, number>();
  for (const x of live) {
    const key = `${x.rank}|${dayKey(x.e.data.start)}`;
    x.turn = seen.get(key) ?? 0;
    seen.set(key, x.turn + 1);
  }
  live.sort((a, b) => a.rank - b.rank || a.turn - b.turn || a.i - b.i);
  return sortByStart(live.slice(0, limit).map((x) => x.e));
}

/**
 * Whether a listing is a regular: a weekly repeat, one carrying a "Third
 * Fridays" note, or one of a series stored as a file per date that lands on
 * the same weekday each time — which shows up as another listing with the
 * same title at the same venue, the way src/lib/series.ts recognises a
 * series too.
 *
 * The weekday test is what tells a knitting drop-in on two Fridays from a
 * touring show on a Thursday and a Friday. Both are two files with one
 * title, and only the first is a regular: a reader opening the home page
 * on the Thursday before wants the show, and Estes Park's two Amy Bruni
 * nights were ranked below every one-off a month later because they were
 * counted as a storytime (follow-up audit, 8 October 2026). A run across
 * weekdays is a one-off that happens more than once, and `highlights` and
 * `nearbyPicks` show it once, at its next date.
 *
 * `oneOffs` reads this for the hub's weekend block.
 */
export function regularTest<T extends EventLike>(all: readonly T[]): (event: T) => boolean {
  const slugsByKey = new Map<string, Set<string>>();
  const weekdaysByKey = new Map<string, Set<string>>();
  for (const e of all) {
    const key = `${e.data.title}|${e.data.venue}`;
    slugsByKey.set(key, (slugsByKey.get(key) ?? new Set()).add(e.slug ?? e.id ?? e.data.title));
    weekdaysByKey.set(key, (weekdaysByKey.get(key) ?? new Set()).add(denverWeekday(e.data.start)));
  }
  return (e) => {
    if (e.data.repeat || e.data.recurring) return true;
    const key = `${e.data.title}|${e.data.venue}`;
    return (slugsByKey.get(key)?.size ?? 0) > 1 && weekdaysByKey.get(key)?.size === 1;
  };
}

/** The Denver weekday, not UTC's: a 6 pm Thursday is already Friday in UTC. */
function denverWeekday(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(date);
}

/**
 * Whether a listing happens every week: a weekly repeat, one carrying a
 * "Third Fridays" note, or a series stored as a file per date with three or
 * more dates on one weekday. Two dates on a Thursday is a pair of listings;
 * a council meeting twice a month is civic and listed by date either way.
 *
 * This is what the events page's "Every week in [Town]" section holds, once
 * each, and what its date list leaves out. Narrower than `regularTest` on
 * purpose: a three-day residency is a series but not a regular.
 */
export function weeklyTest<T extends EventLike>(all: readonly T[]): (event: T) => boolean {
  const weekdaysByKey = new Map<string, Map<string, Set<string>>>();
  for (const e of all) {
    const key = `${e.data.title}|${e.data.venue}`;
    const dow = denverWeekday(e.data.start);
    const slugs = weekdaysByKey.get(key) ?? new Map<string, Set<string>>();
    slugs.set(dow, (slugs.get(dow) ?? new Set()).add(e.slug ?? e.id ?? e.data.title));
    weekdaysByKey.set(key, slugs);
  }
  return (e) => {
    if (e.data.category === 'civic') return false;
    if (e.data.repeat === 'weekly') return true;
    // A date range with a note ("Thursday to Sunday nights through October
    // 31") is a seasonal run, shown by date as "Now through…", not a regular.
    const multiDay = !!e.data.end && dayKey(e.data.end) !== dayKey(e.data.start);
    if (e.data.recurring && !multiDay) return true;
    const byDow = weekdaysByKey.get(`${e.data.title}|${e.data.venue}`);
    return !!byDow && [...byDow.values()].some((slugs) => slugs.size >= 3);
  };
}

/**
 * The weekly regulars, once each, as the next occurrence that has not
 * passed, so the day and time shown are the next one a reader can go to.
 * Sorted by weekday from today, then by time.
 */
export function weeklyRegulars<T extends EventLike>(entries: readonly T[], now = new Date()): T[] {
  const isWeekly = weeklyTest(entries);
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of sortByStart(upcoming(occurrences([...entries], { now, horizonDays: 400 }), { now }))) {
    if (!isWeekly(e) || isCanceled(e)) continue;
    const key = `${e.data.title}|${e.data.venue}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/**
 * The listings a visitor would drive for. A regular — the library's
 * storytime, the brewery's trivia night — is for the people who live there,
 * and a council meeting is for its residents, so neither is a pick to send a
 * reader across a town line for. What is left is the one-offs: the festival,
 * the release, the race. `all` is the full list a series would show up in,
 * when `events` is only the weekend's slice of it.
 */
export function oneOffs<T extends EventLike>(events: T[], all: readonly T[] = events): T[] {
  const isRegular = regularTest(all);
  return events.filter((e) => !isRegular(e) && e.data.category !== 'civic' && !isCanceled(e));
}

/**
 * The categories that make someone plan a day around a listing: festivals,
 * markets, concerts, races, shows. The rest (family, food, outdoors, other)
 * still qualify for a neighbour's block, after these.
 */
const PLAN_YOUR_DAY: ReadonlySet<string> = new Set(['festival', 'market', 'music', 'sports', 'arts']);

/**
 * The picks for a town's "Nearby this weekend" block, from its neighbours'
 * listings: what is on between Friday and Sunday, one-offs only.
 *
 * Left out: anything canceled or past, civic meetings, and the weekly
 * regulars (`weeklyTest`: the storytime, the trivia night), because a
 * neighbour's storytime is not a reason to cross a town line. A series of a
 * few dates is not a regular: Loveland's three nights of Die Fledermaus and
 * two Eagles home games stay in, once each, at the next date. A run that
 * started earlier counts if it is still on on the Friday; the card shows it
 * as "Now through".
 *
 * At most `perTown` from any one neighbour, so Longmont's calendar cannot
 * crowd out Lyons'. Every neighbour with something on gets its best pick
 * before any gets a second, and "best" is a plan-your-day category (or the
 * editor's featured flag) first, then something starting this weekend over
 * a run already going, then the earlier start. The picks come back in date
 * order.
 *
 * `all` is the neighbours' whole calendar, expanded with `occurrences`, so a
 * series shows up as one; `order` is the neighbours' slugs in the town's
 * config order, which breaks ties.
 */
export function nearbyPicks<T extends EventLike & { town: { slug: string } }>(
  all: readonly T[],
  order: readonly string[],
  { now = new Date(), limit = 6, perTown = 2 }: { now?: Date; limit?: number; perTown?: number } = {},
): T[] {
  const { start, end } = weekendWindow(now);
  const friday = dayKey(start);
  const isWeekly = weeklyTest(all);
  const onThisWeekend = (e: T) => {
    const t = e.data.start.getTime();
    if (t >= start.getTime() && t < end.getTime()) return true;
    return t < start.getTime() && isMultiDay(e) && lastDay(e) >= friday;
  };
  const seen = new Set<string>();
  const candidates = sortByStart([...all]).filter((e) => {
    if (isPast(e, now) || isCanceled(e) || e.data.category === 'civic' || isWeekly(e) || !onThisWeekend(e)) return false;
    // One card per series: the same title at the same venue is the same thing on another date.
    const key = `${e.town.slug}|${e.data.title}|${e.data.venue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const rank = (e: T) =>
    (e.data.featured || PLAN_YOUR_DAY.has(e.data.category) ? 0 : 2) + (e.data.start.getTime() >= start.getTime() ? 0 : 1);
  const byTown = new Map<string, T[]>();
  for (const e of candidates) byTown.set(e.town.slug, [...(byTown.get(e.town.slug) ?? []), e]);
  for (const list of byTown.values()) list.sort((a, b) => rank(a) - rank(b) || a.data.start.getTime() - b.data.start.getTime());
  const place = (slug: string) => (order.indexOf(slug) + 1 || order.length + 1);
  const picks: T[] = [];
  for (let round = 0; round < perTown && picks.length < limit; round++) {
    const pool = [...byTown.values()].map((list) => list[round]).filter((e): e is T => !!e);
    pool.sort((a, b) => rank(a) - rank(b) || place(a.town.slug) - place(b.town.slug) || a.data.start.getTime() - b.data.start.getTime());
    picks.push(...pool.slice(0, limit - picks.length));
  }
  return sortByStart(picks);
}
