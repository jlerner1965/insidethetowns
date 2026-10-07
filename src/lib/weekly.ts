/**
 * "This week in [Town]": the editor's weekly notes and the week's listings,
 * decided the same way on the /this-week/ page, the home page's compact
 * version and the strip under every article. Pure functions over collection
 * entries, so the date rules can be tested without Astro.
 *
 * Every date is a Denver day (src/lib/dates.ts). "This week" is Monday to
 * Sunday around `now`, whether or not a notes file exists for it; "this
 * weekend" is weekendWindow's: the coming Friday to Sunday, or the one under
 * way. An event has ended once its end (or its start, with no end) has
 * passed, and an ended event is never shown — a stricter line than the
 * calendar's isPast, which keeps today's listings up until midnight.
 */
import type { CollectionEntry } from 'astro:content';
import {
  CHANGE_TAG_LABELS,
  SOURCED_CHANGE_TAGS,
  isExcluded,
  type ChangeTag,
  type WeeklyChange,
  type WeeklyNotes,
} from '../content/schemas.ts';
import { TIME_ZONE, addDays, dayKey, startOfDay } from './dates.ts';
import { eventEnd, isCanceled, isMultiDay, lastDay, sortByStart, uniqueByEvent, weekendWindow } from './events.ts';

/** Items show through this many days after the file's weekOf unless the item says otherwise. */
export const CHANGE_DAYS = 14;

type NotesLike = { data: WeeklyNotes | { excluded: true } };
type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

/** The notes files that read, in weekOf order, newest first. */
export function notesOf<T extends NotesLike>(entries: readonly T[]): Array<T & { data: WeeklyNotes }> {
  return entries
    .filter((e): e is T & { data: WeeklyNotes } => !isExcluded(e.data))
    .sort((a, b) => b.data.weekOf.getTime() - a.data.weekOf.getTime());
}

/** Monday to Sunday, Denver days, around `now`. `end` is exclusive (midnight opening the next Monday). */
export function weekWindow(now = new Date()): { monday: Date; sunday: Date; end: Date } {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = startOfDay(now);
  const dow = DAYS.indexOf(new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' }).format(today));
  const monday = addDays(today, -((dow + 6) % 7));
  const sunday = addDays(monday, 6);
  return { monday, sunday, end: addDays(monday, 7) };
}

/** The current week's file: the latest weekOf on or before today. A file dated ahead waits its turn. */
export function currentNotes<T extends NotesLike>(entries: readonly T[], now = new Date()): (T & { data: WeeklyNotes }) | undefined {
  const today = startOfDay(now).getTime();
  return notesOf(entries).find((n) => n.data.weekOf.getTime() <= today);
}

export interface Pick {
  title: string;
  body?: string;
  url?: string;
}

/** Our pick, from the current week's file only, and only when it has a title. */
export function currentPick(entries: readonly NotesLike[], now = new Date()): Pick | undefined {
  const pick = currentNotes(entries, now)?.data.pick;
  if (!pick?.title) return undefined;
  return { title: pick.title, body: pick.body, url: pick.url };
}

export interface Change extends WeeklyChange {
  /** The tag as it is written on the page. "Added to the guide" is never "Opening". */
  label: string;
  /** The last day it shows, the item's own or 14 days after its file's weekOf. */
  expires: Date;
}

/**
 * New & closed: every item from any week's file that has not expired, newest
 * check first. A claim about a business (opening, closed, new-hours, moved)
 * with no source is left out; our own guide additions need none.
 */
export function activeChanges(entries: readonly NotesLike[], now = new Date()): Change[] {
  const today = dayKey(now);
  const out: Change[] = [];
  for (const notes of notesOf(entries)) {
    for (const c of notes.data.changes) {
      if (SOURCED_CHANGE_TAGS.includes(c.tag) && !c.source) continue;
      const expires = c.expires ?? addDays(notes.data.weekOf, CHANGE_DAYS);
      if (dayKey(expires) < today) continue;
      out.push({ ...c, expires, label: changeLabel(c.tag) });
    }
  }
  return out.sort((a, b) => b.checked.getTime() - a.checked.getTime());
}

export function changeLabel(tag: ChangeTag): string {
  return CHANGE_TAG_LABELS[tag];
}

/** True once the event's end (or its start, when it has no end) is behind `now`. */
export function hasEnded(event: EventLike, now = new Date()): boolean {
  return eventEnd(event).getTime() <= now.getTime();
}

/** Not ended, not called off, soonest first, one row per listing. */
export function stillOn<T extends EventLike>(events: readonly T[], now = new Date()): T[] {
  return uniqueByEvent(sortByStart([...events]).filter((e) => !hasEnded(e, now) && !isCanceled(e)));
}

/**
 * This weekend's listings: anything starting Friday to Sunday, and a run
 * that began earlier and is still on over the weekend. Pass the calendar
 * through `occurrences` first so a weekly regular lands on its day.
 */
export function weekendEvents<T extends EventLike>(events: readonly T[], now = new Date()): T[] {
  const { start, end } = weekendWindow(now);
  const friday = dayKey(start);
  return stillOn(events, now).filter((e) => {
    const t = e.data.start.getTime();
    if (t >= start.getTime() && t < end.getTime()) return true;
    return t < start.getTime() && isMultiDay(e) && lastDay(e) >= friday;
  });
}

/** The next few listings that have not ended, for the strip under an article. */
export function upcomingEvents<T extends EventLike>(events: readonly T[], { now = new Date(), limit = 3 } = {}): T[] {
  return stillOn(events, now).slice(0, limit);
}
