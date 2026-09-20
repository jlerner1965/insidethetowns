/**
 * Event filtering and grouping. Pure functions over collection entries so
 * they can be unit-tested without Astro.
 */
import type { CollectionEntry } from 'astro:content';
import { TIME_ZONE, addDays, dayKey, startOfDay } from './dates.ts';

type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

const WEEK = 7 * 86_400_000;

/**
 * Expand weekly repeats into one entry per occurrence, up to `horizonDays`
 * ahead of `now`. Non-repeating events pass through untouched. Occurrences
 * share the source entry's slug, so they all link to the same page.
 */
export function occurrences<T extends EventLike>(
  events: T[],
  { now = new Date(), horizonDays = 120 }: { now?: Date; horizonDays?: number } = {},
): T[] {
  const horizon = addDays(startOfDay(now), horizonDays).getTime();
  const out: T[] = [];
  for (const event of events) {
    const { repeat, until, start, end } = event.data;
    if (repeat !== 'weekly' || !until) {
      out.push(event);
      continue;
    }
    const duration = end ? end.getTime() - start.getTime() : 0;
    for (let t = start.getTime(); t <= until.getTime() && t <= horizon; t += WEEK) {
      const occStart = new Date(t);
      out.push({ ...event, data: { ...event.data, start: occStart, end: end ? new Date(t + duration) : undefined } });
    }
  }
  return sortByStart(out);
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
 * it says it ends; one with no end time is treated as over once its start has
 * passed, which is the only honest reading of a listing that never said.
 */
export function eventEnd(event: EventLike): Date {
  const { start, end, allDay } = event.data;
  if (allDay) return addDays(startOfDay(end ?? start), 1);
  if (end) return end;
  return start;
}

/**
 * True once the event is over: nothing of it is left on or after today in
 * Denver. The comparison is `<=` because `eventEnd` is exclusive — an all-day
 * event on the 3rd ends at midnight opening the 4th, and must not still be
 * advertised on the 4th.
 */
export function isPast(event: EventLike, now = new Date()): boolean {
  return eventEnd(event).getTime() <= startOfDay(now).getTime();
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
  /** Runs that began earlier and are still on, but are not under way right now. */
  continuing: T[];
  /** Starting after the weekend, inside the horizon. */
  next: T[];
}

/**
 * Split events into the four sections the weekend page shows. Every event that
 * is not past lands in exactly one of them, so "there is nothing on" can be
 * decided by counting the sections rather than by looking at one of them.
 */
export function weekendSections<T extends EventLike>(
  events: T[],
  { now = new Date(), horizonDays = 16 }: { now?: Date; horizonDays?: number } = {},
): WeekendSections<T> {
  const { start: weekendStart, sunday, end: weekendEnd } = weekendWindow(now);
  const horizon = addDays(sunday, horizonDays).getTime();
  const live = upcoming(events, { now });

  const sections: WeekendSections<T> = { now: [], weekend: [], continuing: [], next: [] };
  for (const event of live) {
    const startsAt = event.data.start.getTime();
    if (isInProgress(event, now)) sections.now.push(event);
    else if (startsAt < weekendStart.getTime()) sections.continuing.push(event);
    else if (startsAt < weekendEnd.getTime()) sections.weekend.push(event);
    else if (startsAt < horizon) sections.next.push(event);
  }
  return sections;
}

/** How many events a partition is carrying in total. */
export function sectionCount<T>(sections: WeekendSections<T>): number {
  return sections.now.length + sections.weekend.length + sections.continuing.length + sections.next.length;
}
