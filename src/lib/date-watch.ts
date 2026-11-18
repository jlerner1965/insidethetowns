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

/**
 * The dates a page gives for the watched year: its JSON-LD Events' start
 * dates and the dates written out in its text ("December 5, 2027", "Dec. 5th,
 * 2027", "12/5/2027", "2027-12-05"), kept where they fall in the window or
 * within three weeks of it. Each as "YYYY-MM-DD", once.
 */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function candidateDates(text: string, ldStarts: readonly string[], year: number, window: DateWindow, slackDays = 21): string[] {
  const found = new Set<string>();
  const pad = (n: number) => String(n).padStart(2, '0');
  const add = (m: number, d: number, y: number) => {
    if (y !== year || m < 1 || m > 12 || d < 1 || d > 31) return;
    const iso = `${y}-${pad(m)}-${pad(d)}`;
    if (Number.isNaN(Date.parse(`${iso}T12:00:00Z`)) || new Date(`${iso}T12:00:00Z`).getUTCDate() !== d) return;
    found.add(iso);
  };
  for (const s of ldStarts) {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) add(Number(m[2]), Number(m[3]), Number(m[1]));
  }
  for (const m of text.matchAll(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/gi)) {
    add(MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase()) + 1, Number(m[2]), Number(m[3]));
  }
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)) add(Number(m[1]), Number(m[2]), Number(m[3]));
  for (const m of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) add(Number(m[2]), Number(m[3]), Number(m[1]));
  const wraps = window.end < window.start;
  const from = `${year}-${window.start}`;
  const to = `${wraps ? year + 1 : year}-${window.end}`;
  return [...found].filter((d) => days(from, d) >= -slackDays && days(d, to) >= -slackDays).sort();
}
