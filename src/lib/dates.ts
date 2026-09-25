/**
 * All dates in content are written as wall-clock time in America/Denver, with
 * no timezone suffix: "2026-10-03T10:00" or "2026-10-03". This module turns
 * those into real instants and formats them back in Denver time, so builds
 * produce the same output on a laptop in Colorado and a Vercel runner in UTC.
 */
export const TIME_ZONE = 'America/Denver';

const NAIVE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

/** Milliseconds to add to a UTC instant to get the wall clock in `tz`. */
function tzOffsetMs(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - date.getTime();
}

/** Build an instant from wall-clock components in `tz`, DST-aware. */
export function fromWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  tz = TIME_ZONE,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = tzOffsetMs(new Date(guess), tz);
  let result = guess - offset;
  const offset2 = tzOffsetMs(new Date(result), tz);
  if (offset2 !== offset) result = guess - offset2;
  return new Date(result);
}

/**
 * Parse a content date. Accepts:
 *  - "2026-10-03" or "2026-10-03T10:00[:00]" (Denver wall clock)
 *  - any ISO string with an explicit offset or Z
 *  - a Date (a YAML parser may already have produced one from an unquoted
 *    timestamp; YAML treats naive timestamps as UTC, so its UTC fields are
 *    the wall clock the author typed and are re-read in Denver time)
 */
export function parseLocal(input: string | Date): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) throw new Error('Invalid date');
    return fromWallClock(
      input.getUTCFullYear(),
      input.getUTCMonth() + 1,
      input.getUTCDate(),
      input.getUTCHours(),
      input.getUTCMinutes(),
      input.getUTCSeconds(),
    );
  }
  const text = input.trim();
  const m = NAIVE.exec(text);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return fromWallClock(Number(y), Number(mo), Number(d), Number(h ?? 0), Number(mi ?? 0), Number(s ?? 0));
  }
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Unparseable date "${input}". Use "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" (Denver time).`);
  }
  return parsed;
}

/** "2026-10-03" for the Denver calendar day containing `date`. */
export function dayKey(date: Date, tz = TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Midnight in Denver at the start of the day containing `now`. */
export function startOfDay(now = new Date(), tz = TIME_ZONE): Date {
  const [y, m, d] = dayKey(now, tz).split('-').map(Number);
  return fromWallClock(y!, m!, d!, 0, 0, 0, tz);
}

/** The wall-clock fields `date` shows in `tz`. */
function wallParts(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') };
}

/**
 * Move by whole calendar days in Denver, keeping the time of day.
 *
 * Adding 24 hours is not the same as adding a day twice a year: the Sunday the
 * clocks go back is 25 hours long, so a fixed-millisecond step landed the
 * weekend's exclusive end at 11pm rather than midnight, and pushed a late
 * Sunday listing into the following week.
 */
export function addDays(date: Date, days: number, tz = TIME_ZONE): Date {
  const { year, month, day, hour, minute, second } = wallParts(date, tz);
  return fromWallClock(year, month, day + days, hour, minute, second, tz);
}

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, ...opts });

/** "Saturday, October 3" */
export function formatDayLong(date: Date): string {
  return fmt({ weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

/** "Sat, Oct 3" */
export function formatDayShort(date: Date): string {
  return fmt({ weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

/** "October 3, 2026" */
export function formatDate(date: Date): string {
  return fmt({ month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

/** "Oct" / "3" for calendar badges. */
export function monthDay(date: Date): { month: string; day: string; weekday: string } {
  return {
    month: fmt({ month: 'short' }).format(date),
    day: fmt({ day: 'numeric' }).format(date),
    weekday: fmt({ weekday: 'short' }).format(date),
  };
}

/** "Tuesday" */
export function formatWeekday(date: Date): string {
  return fmt({ weekday: 'long' }).format(date);
}

/** "10 am", "6:30 pm" */
export function formatTime(date: Date): string {
  const s = fmt({ hour: 'numeric', minute: '2-digit' }).format(date);
  return s.replace(':00', '').replace(' AM', ' am').replace(' PM', ' pm').replace(' ', ' ');
}

/** "10 am – 2 pm" or "All day" or "6:30 pm" */
export function formatTimeRange(start: Date, end?: Date, allDay = false): string {
  if (allDay) return 'All day';
  if (!end) return formatTime(start);
  if (dayKey(start) === dayKey(end)) return `${formatTime(start)} – ${formatTime(end)}`;
  return `${formatDayShort(start)} ${formatTime(start)} – ${formatDayShort(end)} ${formatTime(end)}`;
}

/** ISO 8601 with the Denver offset, for JSON-LD and <time datetime>. */
export function toIsoLocal(date: Date, tz = TIME_ZONE): string {
  const offsetMin = tzOffsetMs(date, tz) / 60_000;
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  const local = new Date(date.getTime() + offsetMin * 60_000);
  return `${local.toISOString().slice(0, 19)}${sign}${hh}:${mm}`;
}

/** "September 26–27", "October 31 – November 1", or "September 27" for one day. */
export function formatDayRange(start: Date, end: Date): string {
  const monthDay = fmt({ month: 'long', day: 'numeric' });
  if (dayKey(start) === dayKey(end)) return monthDay.format(start);
  const month = fmt({ month: 'long' });
  if (month.format(start) === month.format(end)) {
    return `${monthDay.format(start)}–${fmt({ day: 'numeric' }).format(end)}`;
  }
  return `${monthDay.format(start)} – ${monthDay.format(end)}`;
}
