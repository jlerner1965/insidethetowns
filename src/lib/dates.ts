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
  // The parts stop at whole seconds, so compare with the instant cut to the
  // second: subtracting its milliseconds too gave "the build's own now" a
  // fractional offset ("-06:0.0137") in toIsoLocal.
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
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

/**
 * Whole Denver calendar days from `from` to `to`: 0 on the same day, 1 for
 * tomorrow, negative for a day gone by, whatever the time of day on either
 * end and across the clock changes. A countdown built from milliseconds
 * ("14 days left" rounded from 13.6) was a day out for anyone reading after
 * lunch, and the Sunday the clocks go back is 25 hours long.
 */
export function daysBetween(from: Date, to: Date, tz = TIME_ZONE): number {
  const utcMidnight = (d: Date) => {
    const [y, m, day] = dayKey(d, tz).split('-').map(Number);
    return Date.UTC(y!, m! - 1, day!);
  };
  return Math.round((utcMidnight(to) - utcMidnight(from)) / 86_400_000);
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

/**
 * A time as an organizer wrote it ("7:30AM", "5PM", "7:00 PM", "10 a.m.",
 * "3PM-6PM"), in the style formatTime prints ("7:30 am", "5 pm", "3 pm –
 * 6 pm"): the hour and minutes as written, ":00" dropped, "am" and "pm" in
 * lower case after a space, and a hyphen or dash between two times as a
 * spaced en dash (the review of 14 November 2026: eighteen town pages
 * printed times as each source wrote them). The times themselves never
 * change, and nothing is added: "5-9pm" is "5 – 9 pm", with no "pm" given
 * to the 5. Words around the times ("Doors 8 p.m., show 9 p.m.", "around
 * 5:00pm", "Noon-3pm") are kept as they are.
 */
export function publishedTime(text: string): string;
export function publishedTime(text: string | undefined): string | undefined;
export function publishedTime(text: string | undefined): string | undefined {
  if (!text) return text;
  const time = (h: string, m: string | undefined) => `${Number(h)}${m && m !== '00' ? `:${m}` : ''}`;
  return (
    text
      // "7:30AM", "7:00 PM", "10 a.m.", "5pm": the hour, its minutes unless ":00", and "am" or "pm".
      // A dotted "p.m." loses its dots, but one that also ends a sentence keeps the full stop ("9 a.m. Bring water." is "9 am. Bring water.").
      .replace(/\b(\d{1,2})(?::(\d{2}))?\s*(?:([AaPp])\.\s?[Mm]\.?|([AaPp])\s?[Mm]\b)/g, (whole: string, h: string, m: string | undefined, dotted: string | undefined, plain: string | undefined, at: number, all: string) => {
        const stop = whole.endsWith('.') && /^\s+[A-Z]/.test(all.slice(at + whole.length)) ? '.' : '';
        return `${time(h, m)} ${(dotted ?? plain)!.toLowerCase()}m${stop}`;
      })
      // A range: "3 pm-6 pm", "5:00-7 pm", "3:30-5:30 pm", "Noon-3 pm", "9 am–12 pm", with the time after the dash in that style now.
      .replace(/(\b\d{1,2}(?::\d{2})?(?: [ap]m)?|\b[Nn]oon)\s*[-–]\s*(?=\d{1,2}(?::\d{2})? [ap]m\b)/g, (_, from: string) => {
        const m = from.match(/^(\d{1,2})(?::(\d{2}))?( [ap]m)?$/);
        return `${m ? `${time(m[1]!, m[2])}${m[3] ?? ''}` : from} – `;
      })
  );
}

/** "10 am – 2 pm" or "All day" or "6:30 pm" */
export function formatTimeRange(start: Date, end?: Date, allDay = false): string {
  if (allDay) return 'All day';
  if (!end) return formatTime(start);
  // A feed's whole day written as clock times, midnight to 11:59 pm
  // (Clearview's take-home kits), printed as "12 am – 11:59 pm".
  if (dayKey(start) === dayKey(end) && toWallClock(start).length === 10 && toWallClock(end).endsWith('T23:59')) return 'All day';
  if (dayKey(start) === dayKey(end)) return `${formatTime(start)} – ${formatTime(end)}`;
  return `${formatDayShort(start)} ${formatTime(start)} – ${formatDayShort(end)} ${formatTime(end)}`;
}

/** ISO 8601 with the Denver offset, for JSON-LD and <time datetime>. */
/**
 * The form the content files write dates in: "2026-10-03T10:00", or
 * "2026-10-03" alone for midnight. The inverse of parseLocal.
 */
export function toWallClock(date: Date, tz = TIME_ZONE): string {
  const iso = toIsoLocal(date, tz).slice(0, 16);
  return iso.endsWith('T00:00') ? iso.slice(0, 10) : iso;
}

export function toIsoLocal(date: Date, tz = TIME_ZONE): string {
  const offsetMin = tzOffsetMs(date, tz) / 60_000;
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  const local = new Date(date.getTime() + offsetMin * 60_000);
  return `${local.toISOString().slice(0, 19)}${sign}${hh}:${mm}`;
}

/**
 * "Oct 3, 2026": the check date on a row or card. Every card said "Checked
 * Oct 3" with no year (network audit, 14 October 2026), which reads as
 * today's year until it is not; the year costs five characters.
 */
export function formatShortDate(date: Date): string {
  return fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/** "October 31" */
export function formatMonthDay(date: Date): string {
  return fmt({ month: 'long', day: 'numeric' }).format(date);
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
