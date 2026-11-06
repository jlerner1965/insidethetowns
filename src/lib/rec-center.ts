/**
 * A town's recreation center schedule (data/<town>/rec-center.json): the
 * facility's hours, open swim and lap swim by weekday for the current
 * season, the dated exceptions the Town posts (a holiday closure, a
 * school-break swim), and the day-pass and membership prices, each from
 * the Town's own pages with the day they were read.
 *
 * Written for Berthoud (the owner's brief, 6 November 2026: "Today at the
 * rec center" on the home page and the listing, the pool schedule and the
 * prices on the listing), and shared: a town with a file gets the line and
 * the table, a town without one gets nothing, and no config flag says
 * which. "Today" is worked out from the data at read time, in the browser
 * on Denver's clock (RecCenterToday.astro), so a page built on Wednesday
 * is right on Thursday; the pure date logic is here so a test can pass a
 * date. Nothing here invents an hour: a day the data does not settle (an
 * exception with no hours, a day past the season) sends the reader to the
 * Town's page.
 */
import { clockLabel } from './hours.ts';
import { dayKey, TIME_ZONE } from './dates.ts';

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export const WEEKDAYS: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEKDAY_LABELS: Record<Weekday, string> = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

/** "05:00" to "21:00", 24-hour, as the Town prints them. */
export type Range = [string, string];

export interface RecCenterException {
  /** A Denver day, "2026-11-26". */
  date: string;
  /** The Town's own words: "Thanksgiving Day", "Fall break". */
  note: string;
  /** The whole facility is closed; nothing else is read. */
  closed?: boolean;
  /** The facility's hours that day, where they differ from the weekday's. */
  facility?: Range;
  /** The swims that day, where they differ; an empty list means none is listed. */
  openSwim?: Range[];
  lapSwim?: Range[];
  /** Where the Town says so, when it is not the file's own sources. */
  source?: string;
}

export interface RecCenterPrices {
  source: string;
  checked: string;
  dayPass: Array<{ label: string; price: string }>;
  memberships: Array<{ label: string; price: string }>;
  note?: string;
}

export interface RecCenterData {
  /** The slug of the place listing this schedule belongs to. */
  place: string;
  name: string;
  /** "Rec center": the first word of the today line. */
  shortName: string;
  /** The Town's live schedule page, the link under every line. */
  scheduleUrl: string;
  /** The day the schedule was last read against its sources, "2026-11-06". */
  checked: string;
  sources: Array<{ label: string; url: string }>;
  /** The season the weekly schedule holds for; outside it the reader is sent to the Town. */
  season: { label: string; from: string; to: string };
  /** The facility's hours by weekday; null on a day it does not open. */
  facility: Record<Weekday, Range | null>;
  openSwim: Record<Weekday, Range[]>;
  lapSwim: Record<Weekday, Range[]>;
  /** The Town's standing notes, printed under the table. */
  notes?: string[];
  /** A monthly rule: the pool closes early on the first Sunday. */
  monthly?: Array<{ weekday: Weekday; week: number; poolCloses: string; note: string }>;
  exceptions: RecCenterException[];
  prices?: RecCenterPrices;
}

/** The town's file from an `import.meta.glob` over data/*\/rec-center.json, or nothing. */
export function recCenterFor(files: Record<string, RecCenterData>, town: string): RecCenterData | undefined {
  const entry = Object.entries(files).find(([path]) => path.endsWith(`/data/${town}/rec-center.json`) || path.includes(`/${town}/rec-center.json`));
  return entry?.[1];
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/**
 * "5 am–9 pm", "4–8 pm", "11 am–7 pm": the meridiem once when both ends
 * share it, as the Town prints its own ("4pm-8pm" reads as "4–8 pm").
 */
export function rangeLabel([open, close]: Range): string {
  const a = clockLabel(minutesOf(open));
  const b = clockLabel(minutesOf(close));
  const suffix = (s: string) => s.slice(-3);
  if ((suffix(a) === ' am' || suffix(a) === ' pm') && suffix(a) === suffix(b)) return `${a.slice(0, -3)}–${b}`;
  return `${a}–${b}`;
}

/** "5 am–4:15 pm & 7–8 pm"; undefined for no runs. */
export function rangesLabel(ranges: readonly Range[]): string | undefined {
  return ranges.length > 0 ? ranges.map(rangeLabel).join(' & ') : undefined;
}

export type RecCenterStatus =
  | { kind: 'open'; facility: string; openSwim?: string; lapSwim?: string; note?: string }
  | { kind: 'closed'; note?: string }
  /** Nothing settled for the day: outside the season, or an exception with no hours. */
  | { kind: 'check'; note?: string };

const WEEKDAY_FORMAT = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });
const DAY_OF_MONTH = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, day: 'numeric' });

export function weekdayOf(date: Date, tz = TIME_ZONE): Weekday {
  const word = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(date).toLowerCase().slice(0, 3);
  return (WEEKDAYS.includes(word as Weekday) ? word : 'sun') as Weekday;
}

/** Which Sunday (or Monday…) of the month a day is: 1 for the 1st to 7th. */
function weekOfMonth(date: Date, tz = TIME_ZONE): number {
  const day = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, day: 'numeric' }).format(date));
  return Math.ceil(day / 7);
}

/**
 * The day as the data settles it. In order: a day outside the season is
 * not settled; a dated exception is read before the weekday (a closure
 * first, then its own hours and swims over the weekday's, and an exception
 * with neither is not settled); the monthly rule caps the pool on its day;
 * a weekday the facility does not open is closed.
 */
export function recCenterToday(data: RecCenterData, now: Date, tz = TIME_ZONE): RecCenterStatus {
  const key = dayKey(now, tz);
  if (key < data.season.from || key > data.season.to) return { kind: 'check', note: `The ${data.season.label} schedule ran ${data.season.from < key ? 'to' : 'from'} ${data.season.from < key ? data.season.to : data.season.from}` };
  const weekday = weekdayOf(now, tz);
  const exception = data.exceptions.find((e) => e.date === key);
  if (exception?.closed) return { kind: 'closed', note: exception.note };
  const facility = exception?.facility ?? data.facility[weekday];
  if (exception && !exception.facility && !exception.openSwim && !exception.lapSwim) return { kind: 'check', note: exception.note };
  if (!facility) return { kind: 'closed' };
  let openSwim = exception?.openSwim ?? data.openSwim[weekday];
  const lapSwim = exception?.lapSwim ?? data.lapSwim[weekday];
  let note = exception?.note;
  const monthly = data.monthly?.find((m) => m.weekday === weekday && m.week === weekOfMonth(now, tz));
  if (monthly && !exception) {
    const cap = minutesOf(monthly.poolCloses);
    openSwim = openSwim.filter(([open]) => minutesOf(open) < cap).map(([open, close]) => (minutesOf(close) > cap ? [open, monthly.poolCloses] : [open, close]) as Range);
    note = `pool closes ${clockLabel(cap)} for ${monthly.note}`;
  }
  return { kind: 'open', facility: rangeLabel(facility), openSwim: rangesLabel(openSwim), lapSwim: rangesLabel(lapSwim), ...(note ? { note } : {}) };
}

/**
 * The line: "Rec center 5 am–9 pm · Open swim 4–8 pm · Lap swim 5 am–4 pm",
 * "Rec center closed today · Thanksgiving Day", or "Check today’s hours"
 * (the component puts the Town's link after it). "No open swim" is said
 * on a Tuesday or Thursday because the Town's schedule says so; a lap
 * swim the day does not have is left off.
 */
export function todayLine(status: RecCenterStatus, data: Pick<RecCenterData, 'shortName'>): string {
  if (status.kind === 'check') return 'Check today’s hours';
  if (status.kind === 'closed') return `${data.shortName} closed today${status.note ? ` · ${status.note}` : ''}`;
  return [
    `${data.shortName} ${status.facility}`,
    status.openSwim ? `Open swim ${status.openSwim}` : 'No open swim',
    status.lapSwim ? `Lap swim ${status.lapSwim}` : undefined,
    status.note,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** The weekly table's rows, Monday first, as the reader reads them. */
export function weekRows(data: RecCenterData): Array<{ day: string; facility: string; openSwim: string; lapSwim: string }> {
  const order: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return order.map((d) => ({
    day: WEEKDAY_LABELS[d],
    facility: data.facility[d] ? rangeLabel(data.facility[d]!) : 'Closed',
    openSwim: rangesLabel(data.openSwim[d]) ?? 'None',
    lapSwim: rangesLabel(data.lapSwim[d]) ?? 'None',
  }));
}

/** The exceptions still to come from `now` (today included), for the list under the table. */
export function upcomingExceptions(data: RecCenterData, now: Date, tz = TIME_ZONE): RecCenterException[] {
  const key = dayKey(now, tz);
  return data.exceptions.filter((e) => e.date >= key).sort((a, b) => a.date.localeCompare(b.date));
}

/** One exception as words: "Closed", "Open 12–6 pm, open swim 12–5 pm", "Open swim 12–8 pm". */
export function exceptionLabel(e: RecCenterException): string {
  if (e.closed) return 'Closed';
  const parts = [
    e.facility ? `Open ${rangeLabel(e.facility)}` : undefined,
    e.openSwim ? (e.openSwim.length ? `open swim ${rangesLabel(e.openSwim)}` : 'no open swim') : undefined,
    e.lapSwim ? (e.lapSwim.length ? `lap swim ${rangesLabel(e.lapSwim)}` : 'no lap swim') : undefined,
  ].filter((p): p is string => !!p);
  if (parts.length === 0) return 'Hours to be posted';
  const line = parts.join(', ');
  return line.charAt(0).toUpperCase() + line.slice(1);
}

// Unused formatters kept private to this module's tests; the component formats the date itself.
void WEEKDAY_FORMAT;
void DAY_OF_MONTH;
