/**
 * Event filtering and grouping. Pure functions over collection entries so
 * they can be unit-tested without Astro.
 */
import type { CollectionEntry } from 'astro:content';
import { addDays, dayKey, startOfDay } from './dates';

type EventLike = { data: CollectionEntry<'events'>['data'] };

export function eventEnd(event: EventLike): Date {
  const { start, end, allDay } = event.data;
  if (end) return end;
  if (allDay) return addDays(startOfDay(start), 1);
  return start;
}

/** True once the event is over: its end (or start) is before the start of today in Denver. */
export function isPast(event: EventLike, now = new Date()): boolean {
  return eventEnd(event).getTime() < startOfDay(now).getTime();
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
