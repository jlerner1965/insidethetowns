/**
 * "This week in [Town]": the editor's weekly notes and the week's listings,
 * decided the same way on the /this-week/ page, the home page's compact
 * version and the strip under every article. Pure functions over collection
 * entries, so the date rules can be tested without Astro.
 *
 * Every date is a Denver day (src/lib/dates.ts). "This week" is Monday to
 * Sunday around `now`, whether or not a notes file exists for it; "this
 * weekend" is weekendWindow's: the coming Friday to Sunday, or the one under
 * way. An event has ended by the calendar's own rule (`listedUntil` in
 * src/lib/events.ts): at its end time, or at midnight when it gave none, and
 * an ended event is never shown. Our pick has to be on inside the week the
 * heading names (`currentPick`).
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
import { isCanceled, isMultiDay, isPast, lastDay, sortByStart, uniqueByEvent, weekendWindow } from './events.ts';

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

export interface Pick<T extends EventLike = EventLike> {
  title: string;
  body?: string;
  url?: string;
  /** The listing the pick links to, at the occurrence it is for. */
  event: T;
}

export interface WeekPick<T extends EventLike = EventLike> {
  /** On inside the week the heading names: Our pick. */
  thisWeek?: Pick<T>;
  /** On after this week: shown apart, under "Coming up", with its own date. */
  comingUp?: Pick<T>;
}

/** The listing a pick's URL names, "/events/<slug>/", or undefined for any other link. */
export function pickSlug(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname.match(/^\/events\/([^/]+)\/?$/)?.[1];
  } catch {
    return undefined;
  }
}

/**
 * Our pick, from the current week's file only, placed by the date of the
 * listing it links to.
 *
 * The notes for the week of October 5 picked a talk on the 13th and a
 * festival on the 17th, and the home pages showed them under "October 5–11".
 * A pick is dated by its listing, the event page its URL names, and it is
 * this week's only when that listing is on between Monday 00:00 and the next
 * Monday 00:00 in Denver (`weekWindow`), has not ended and is not called off.
 * A pick whose listing comes after the week is `comingUp`, for the page to
 * show apart under its real date. A pick with no title, or whose listing has
 * ended, been called off or cannot be found (no URL, or not one of this
 * guide's event pages), cannot be dated, and is neither.
 *
 * Pass the calendar through `occurrences` first, so a weekly regular is found
 * on its day this week.
 */
export function currentPick<T extends EventLike>(
  entries: readonly NotesLike[],
  events: readonly T[],
  now = new Date(),
): WeekPick<T> {
  const pick = currentNotes(entries, now)?.data.pick;
  const slug = pickSlug(pick?.url);
  if (!pick?.title || !slug) return {};
  const listed = sortByStart(events.filter((e) => (e.slug ?? e.id) === slug && !isCanceled(e) && !isPast(e, now)));
  const { end } = weekWindow(now);
  const text = { title: pick.title, body: pick.body, url: pick.url };
  // Not past means still on at `now`, which is inside the week, so starting
  // before the week's end is enough: a run that began last week counts.
  const inWeek = listed.find((e) => e.data.start.getTime() < end.getTime());
  if (inWeek) return { thisWeek: { ...text, event: inWeek } };
  const later = listed.find((e) => e.data.start.getTime() >= end.getTime());
  return later ? { comingUp: { ...text, event: later } } : {};
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

/** True once the listing is over by the calendar's rule: its end time, or midnight when it has none. */
export function hasEnded(event: EventLike, now = new Date()): boolean {
  return isPast(event, now);
}

/** Not ended, not called off, soonest first, one row per listing. */
export function stillOn<T extends EventLike>(events: readonly T[], now = new Date()): T[] {
  return uniqueByEvent(sortByStart([...events]).filter((e) => !hasEnded(e, now) && !isCanceled(e)));
}

/**
 * The rest of this week's listings: anything from today to Sunday, and a
 * run that began earlier and is still on. On a Friday, Saturday or Sunday
 * this is the weekend; earlier in the week it is the week ahead, so a
 * Wednesday reader is not told the week is quiet while Thursday has three
 * things on. Pass the calendar through `occurrences` first.
 */
export function weekEvents<T extends EventLike>(events: readonly T[], now = new Date()): T[] {
  const today = startOfDay(now);
  const { end } = weekWindow(now);
  const todayKey = dayKey(today);
  return stillOn(events, now).filter((e) => {
    const t = e.data.start.getTime();
    if (t >= today.getTime() && t < end.getTime()) return true;
    return t < today.getTime() && isMultiDay(e) && lastDay(e) >= todayKey;
  });
}

/** True from Friday to Sunday, when the rest of the week is the weekend. */
export function isWeekend(now = new Date()): boolean {
  const { start } = weekendWindow(now);
  return startOfDay(now).getTime() >= start.getTime();
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
