/**
 * The date watch for traditions (the owner, 18 November 2026). Each record
 * keeps its typical window (`dateWindow`: the span of the year its date has
 * fallen in, read from the dates it was held on). About eight weeks before
 * the window opens, the nightly watch (scripts/date-watch.ts) reads the
 * organizer's page again for the next date; three weeks before, a date
 * still not confirmed goes on the needs-me list (docs/needs-me.md).
 *
 * Confirming the year is all it takes for the rest: the record's page title,
 * meta description, Event JSON-LD and the sitemap's lastmod are all read
 * from the record at build time (src/routes/hub/event.astro, src/lib/lastmod.ts).
 *
 * Plain functions over plain data: no astro:content, so the scripts, the
 * validator and the tests share one reading.
 */
import type { TraditionRecord, TraditionYear } from './traditions.ts';

/** "MM-DD": the first and last day of the year a record's date has fallen on. */
export interface DateWindow {
  start: string;
  end: string;
}

/** Weeks before the window opens that the organizer's page is read again for the next date. */
export const WATCH_WEEKS = 8;
/** Weeks before the window opens that a date not yet confirmed goes to the owner. */
export const NEEDS_ME_WEEKS = 3;
/** A record read in the watch is not read again for this many days, so its check date does not move every night. */
export const WATCH_REREAD_DAYS = 7;

const md = (day: string) => day.slice(5, 10);

/** The years with a date the organizer gave (confirmed, moved, or a canceled one that had been set). */
export function datedYears(record: Pick<TraditionRecord, 'years'>): TraditionYear[] {
  return record.years.filter((y) => !!y.date);
}

/**
 * The window read from the record's dates: the earliest and the latest day
 * of the year it has started on. Undefined where no year has a date (a
 * record with only a typical window, or none announced yet).
 */
export function deriveDateWindow(record: Pick<TraditionRecord, 'years'>): DateWindow | undefined {
  const days = datedYears(record).map((y) => md(y.date!)).sort();
  if (!days.length) return undefined;
  return { start: days[0]!, end: days[days.length - 1]! };
}

/** Whether the window holds every day the record has started on. */
export function windowCovers(window: DateWindow, record: Pick<TraditionRecord, 'years'>): boolean {
  const wraps = window.end < window.start;
  return datedYears(record).every((y) => {
    const d = md(y.date!);
    return wraps ? d >= window.start || d <= window.end : d >= window.start && d <= window.end;
  });
}

/** Whole days from one "YYYY-MM-DD" to another. */
function days(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export type WatchState = 'settled' | 'quiet' | 'watch' | 'needs-me';

export interface Watch {
  state: WatchState;
  /** The year whose date is being watched for. */
  year: number;
  /** "YYYY-MM-DD": the day that year's window opens. */
  opens: string;
  /** Days from today to `opens`: negative once the window is open. */
  daysToWindow: number;
  /** The record's entry for that year, where it has one. */
  entry?: TraditionYear;
}

/**
 * Where a record stands today. The watched year is this year while this
 * year's window has not closed, else next year. It is settled once that
 * year has the organizer's date (confirmed or moved) or is canceled; else
 * quiet until eight weeks before the window, watched from then, and the
 * owner's from three weeks before (and through the window, while still
 * unconfirmed). A one-off (`notAnnual`) and a record with no window are
 * never watched.
 */
export function watchState(record: Pick<TraditionRecord, 'years' | 'notAnnual'> & { dateWindow?: DateWindow }, today: string): Watch | undefined {
  const window = record.dateWindow ?? deriveDateWindow(record);
  if (!window || record.notAnnual) return undefined;
  const thisYear = Number(today.slice(0, 4));
  const wraps = window.end < window.start;
  const closes = (y: number) => `${wraps ? y + 1 : y}-${window.end}`;
  const year = closes(thisYear) >= today ? thisYear : thisYear + 1;
  const opens = `${year}-${window.start}`;
  const entry = record.years.find((y) => y.year === year);
  const daysToWindow = days(today, opens);
  // Settled: that year has the organizer's date (still ahead, or held already this window), or is canceled.
  if (entry && (entry.status === 'canceled' || ((entry.status === 'confirmed' || entry.status === 'moved') && !!entry.date))) {
    return { state: 'settled', year, opens, daysToWindow, entry };
  }
  const state: WatchState = daysToWindow <= NEEDS_ME_WEEKS * 7 ? 'needs-me' : daysToWindow <= WATCH_WEEKS * 7 ? 'watch' : 'quiet';
  return { state, year, opens, daysToWindow, entry };
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const WEEKDAY = '(sun|mon|tue|wed|thu|fri|sat)(?:day|\\.|s|urday|nesday|rsday|sday)?';

/**
 * How a page dates what it says (the owner, 18 November 2026): a date is
 * written confirmed only where the organizer's page states the year, or
 * gives a weekday that is that date's weekday in the year watched.
 *   year       "Saturday, December 5, 2026", "12/5/2026", "2026-12-05";
 *   weekday    "Saturday, December 5", and 5 December 2026 is a Saturday;
 *   no-year    "December 5", or a weekday that is not that date's in the
 *              year watched (last year's date, left up): for a person;
 *   mismatch   the year, and a weekday that is not that date's in it
 *              ("Saturday, December 6, 2026", a Sunday): for a person;
 *   event-data only in the page's JSON-LD, not its text (a calendar plugin
 *              can generate the next one by itself): for a person.
 */
export type DateBasis = 'year' | 'weekday' | 'no-year' | 'mismatch' | 'event-data';

/** One date the page gives: the day ("YYYY-MM-DD", in the year watched where it gives none), how it dates it, and the words read. */
export interface DateReading {
  date: string;
  basis: DateBasis;
  /** The words around it on the page, as read: what is saved with a confirmed year (`readText`). */
  text: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
function isoOf(y: number, m: number, d: number): string | undefined {
  if (m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const iso = `${y}-${pad(m)}-${pad(d)}`;
  return new Date(`${iso}T12:00:00Z`).getUTCDate() === d ? iso : undefined;
}
const weekdayOf = (iso: string) => WEEKDAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()]!;
/** The words around a match, on one line, at most about 160 characters. */
function around(text: string, at: number, length: number): string {
  const from = Math.max(0, text.lastIndexOf('.', at - 1) + 1, at - 70);
  const to = Math.min(text.length, at + length + 70);
  return `${from > 0 ? '…' : ''}${text.slice(from, to).replace(/\s+/g, ' ').trim()}${to < text.length ? '…' : ''}`;
}

/**
 * Every date the page gives that could be the watched year's: in its text,
 * with the year ("December 5, 2026", "Dec. 5th, 2026", "12/5/2026",
 * "2026-12-05"), with a weekday and no year ("Saturday, December 5"), or
 * with neither ("December 5"); a range ("December 5–6, 2026") gives each
 * day, and a longer one its first and last (several dates, for a person). Dates the page gives for another year are not the watched year's
 * and are left out. Then its JSON-LD Events' start dates, as event data.
 */
export function readDates(text: string, ldStarts: readonly string[], year: number): DateReading[] {
  const out: DateReading[] = [];
  const add = (date: string | undefined, basis: DateBasis, words: string) => {
    if (date && !out.some((r) => r.date === date && r.basis === basis)) out.push({ date, basis, text: words });
  };
  const written = new RegExp(`(?:\\b${WEEKDAY},?\\s+)?\\b${MONTH}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*(?:-|–|—|to|through|&|and)\\s*(\\d{1,2})(?:st|nd|rd|th)?)?(?:,?\\s+(\\d{4}))?\\b`, 'gi');
  for (const m of text.matchAll(written)) {
    const [whole, wd, mon, d1, d2, y] = m;
    if (y && Number(y) !== year) continue;
    const month = MONTHS.indexOf(mon!.slice(0, 3).toLowerCase()) + 1;
    const first = Number(d1);
    const last = d2 && Number(d2) > first ? Number(d2) : first;
    const words = around(text, m.index!, whole.length);
    // The weekday, where the page gives one, is the first day's.
    const firstDate = isoOf(year, month, first);
    const weekdayFits = !wd || (!!firstDate && weekdayOf(firstDate) === wd.slice(0, 3).toLowerCase());
    const basis: DateBasis = y ? (weekdayFits ? 'year' : 'mismatch') : wd && weekdayFits ? 'weekday' : 'no-year';
    const each = last - first <= 3 ? Array.from({ length: last - first + 1 }, (_, i) => first + i) : [first, last];
    for (const d of each) add(isoOf(year, month, d), basis, words);
  }
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) if (Number(m[3]) === year) add(isoOf(year, Number(m[1]), Number(m[2])), 'year', around(text, m.index!, m[0].length));
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) if (Number(m[1]) === year) add(isoOf(year, Number(m[2]), Number(m[3])), 'year', around(text, m.index!, m[0].length));
  for (const s of ldStarts) {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m && Number(m[1]) === year) add(isoOf(year, Number(m[2]), Number(m[3])), 'event-data', `JSON-LD startDate ${s}`);
  }
  return out;
}

/** Where the nightly watch keeps what it could not write (scripts/date-watch.ts), for the needs-me list (scripts/needs-me.ts). */
export const WATCH_FINDINGS = 'data/hub/date-watch.json';

/** One thing the watch read but could not write: the record, the page, why, and the words read. */
export interface WatchFinding {
  slug: string;
  name: string;
  town: string;
  year: number;
  /** "YYYY-MM-DD": the day that year's window opens. */
  opens: string;
  url: string;
  why: string;
  text?: string;
  /** The day it was read. */
  read: string;
}

/** The findings that still need a person: the record's watched year not yet settled (a date written by a person or the watch, or canceled). */
export function openFindings(findings: readonly WatchFinding[], records: ReadonlyArray<Pick<TraditionRecord, 'slug' | 'years' | 'notAnnual'> & { dateWindow?: DateWindow }>, today: string): WatchFinding[] {
  const open = new Set(records.filter((r) => { const w = watchState(r, today); return !!w && w.state !== 'settled'; }).map((r) => r.slug));
  return findings.filter((f) => open.has(f.slug));
}

/** What the watch does with what it read. */
export type DateDecision =
  /** Written `confirmed`, with the page's address and `text`. */
  | { kind: 'confirm'; date: string; endDate?: string; basis: 'year' | 'weekday'; text: string }
  /** On the needs-me list, not the page: why, and what was read. */
  | { kind: 'review'; why: string; dates: string[]; text?: string }
  /** No date for the year near its window: written `not-announced`, with the day it was looked for. */
  | { kind: 'none' };

/**
 * The owner's rule of 18 November 2026: a date is written confirmed only when
 * the organizer's page states the year (or gives a weekday that matches the
 * date in that year), the date is in the future, and it falls inside the
 * tradition's typical window. Anything else goes to the needs-me list, not
 * the page.
 *
 * The dates weighed are the year watched's within three weeks of its window
 * (`nearDays`): a date further off is another thing on the page (a board
 * meeting, the day a post went up). One day, or two to four consecutive
 * days (a festival weekend), is one date; more is a person's to read.
 */
export function decideDate(readings: readonly DateReading[], year: number, window: DateWindow, today: string, nearDays = 21): DateDecision {
  const wraps = window.end < window.start;
  const from = `${year}-${window.start}`;
  const to = `${wraps ? year + 1 : year}-${window.end}`;
  const near = readings.filter((r) => days(from, r.date) >= -nearDays && days(r.date, to) >= -nearDays);
  if (!near.length) return { kind: 'none' };
  const dates = [...new Set(near.map((r) => r.date))].sort();
  const words = (d: string) => near.find((r) => r.date === d && r.basis !== 'event-data')?.text ?? near.find((r) => r.date === d)?.text;
  // Each day must be dated by the page's own words: the year, or a matching weekday.
  const stated = (d: string) => near.some((r) => r.date === d && (r.basis === 'year' || r.basis === 'weekday'));
  const unstated = dates.filter((d) => !stated(d));
  if (unstated.length) {
    const r = near.find((x) => x.date === unstated[0]);
    const md = unstated.map((d) => d.slice(5)).join(', ');
    const why =
      r?.basis === 'event-data'
        ? `${unstated.join(', ')} is only in the page’s event data, not in its text`
        : r?.basis === 'mismatch'
          ? `the page gives ${unstated.join(', ')} with a weekday that is not that date’s`
          : `the page gives ${md} with no year${/\b(sun|mon|tue|wed|thu|fri|sat)/i.test(r?.text ?? '') ? `, and its weekday is not that date’s in ${year}` : ''}`;
    return { kind: 'review', why, dates, text: words(unstated[0]!) };
  }
  const span = days(dates[0]!, dates.at(-1)!);
  if (dates.length > 4 || span !== dates.length - 1) return { kind: 'review', why: `several ${year} dates on the page (${dates.join(', ')})`, dates, text: words(dates[0]!) };
  const date = dates[0]!;
  const endDate = dates.length > 1 ? dates.at(-1) : undefined;
  if (date <= today) return { kind: 'review', why: `the page gives ${date}, which is not in the future`, dates, text: words(date) };
  if (date < from || date > to) return { kind: 'review', why: `the page gives ${date}, outside its typical window (${window.start} to ${window.end})`, dates, text: words(date) };
  const basis = near.some((r) => r.date === date && r.basis === 'year') ? 'year' : 'weekday';
  return { kind: 'confirm', date, endDate, basis, text: words(date)! };
}
