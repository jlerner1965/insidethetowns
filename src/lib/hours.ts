/**
 * Opening hours: from the text a listing carries to "Open · closes 7 pm".
 *
 * Every place stores its hours as a line of text ("Tue–Sat 10–5; closed
 * Sun–Mon"), which is what a reader wants to read and what the weekly session
 * wants to edit. This turns that line into schema.org `openingHours` strings
 * ("Tu-Sa 10:00-17:00") at build time, so the same line also drives the open
 * or closed status a reader sees on the page and the `openingHours` in the
 * listing's structured data. One field, edited in one place; the structure
 * follows.
 *
 * It parses only what it is sure of. "Open daily, dawn to dusk", "by
 * appointment", a seasonal note, an office and a service time on one line —
 * all of these return null, the page shows the text and makes no open-now
 * claim. A confident wrong "Open now" on a shop that shut at five is worse
 * than no badge at all. A listing that needs something the parser will not
 * read can set `openingHours` explicitly and the text stays as the display.
 *
 * Pure functions, no DOM, no Astro: shared by the build, the validator, the
 * tests, and the script that runs in the reader's browser.
 */
import { TIME_ZONE } from './dates.ts';

/** Sunday first, as Date#getDay counts. */
export const DAY_CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** One run of open time on a set of days. Minutes from midnight; `close` may pass 1440 for a bar that shuts at 1 am. */
export interface Span {
  days: number[];
  open: number;
  close: number;
}

/** "Mo-Fr 10:00-17:00" or "Sa,Su 08:00-14:00" or "Mo-Su 00:00-24:00". */
export const OPENING_HOURS_RE = /^(?:(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?)(?:,(?:(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?))* ([01]\d|2[0-4]):([0-5]\d)-([01]\d|2[0-4]):([0-5]\d)$/;

type Token =
  | { kind: 'days'; days: number[] }
  | { kind: 'time'; open: number; close: number }
  | { kind: 'closed' }
  | { kind: 'appointment' };

/** "Sun–Thu" → [0,1,2,3,4]; "Wed–Mon" wraps. */
function dayRange(from: number, to: number): number[] {
  const days: number[] = [];
  for (let d = from; ; d = (d + 1) % 7) {
    days.push(d);
    if (d === to) break;
  }
  return days;
}

/**
 * Resolve a time range whose am/pm may be missing on one or both ends.
 *
 * With nothing stated: an opening hour from 6 to 11 is morning, 12 is noon,
 * 1 to 5 is afternoon — unless reading it as afternoon would run the place
 * overnight ("5:30–1:30" is a café, not a club), or the same line opens at
 * that hour or earlier with an explicit "am" elsewhere (a gym's "Mon–Thu
 * 5 am–9 pm, Fri 5–7"). A closing hour with no am/pm is evening, except 12,
 * which is noon before an eleven o'clock opening and midnight after it. With
 * one end stated, the other is read so the range runs forwards. A close that
 * still lands at or before the open is the next morning.
 */
function resolveRange(
  h1: number, m1: number, ap1: string | null,
  h2: number, m2: number, ap2: string | null,
  earliestAm: number | null,
): [number, number] | null {
  if (h1 < 1 || h1 > 12 || h2 < 1 || h2 > 12 || m1 > 59 || m2 > 59) return null;
  const to24 = (h: number, ap: 'am' | 'pm') => (ap === 'am' ? h % 12 : (h % 12) + 12);
  let open: number;
  let close: number;
  if (ap1 && ap2) {
    open = to24(h1, ap1 as 'am' | 'pm') * 60 + m1;
    close = to24(h2, ap2 as 'am' | 'pm') * 60 + m2;
  } else if (ap2) {
    close = to24(h2, ap2 as 'am' | 'pm') * 60 + m2;
    // "4–8:30 pm" opens at 4 pm; "9–3 pm" must open at 9 am.
    const samePm = ap2 === 'pm' && (h1 % 12) + m1 / 60 < (h2 % 12) + m2 / 60;
    open = to24(h1, samePm ? 'pm' : 'am') * 60 + m1;
  } else if (ap1) {
    open = to24(h1, ap1 as 'am' | 'pm') * 60 + m1;
    const am = (h2 % 12) * 60 + m2;
    close = am > open ? am : am + 12 * 60;
  } else {
    const closeFor = (o: number) => {
      if (h2 === 12) return o >= 11 * 60 ? 24 * 60 : 12 * 60;
      const pm = (h2 + 12) * 60 + m2;
      return pm > o ? pm : h2 * 60 + m2 + 24 * 60;
    };
    const amOpen = (h1 % 12) * 60 + m1;
    const pmOpen = amOpen + 12 * 60;
    let afternoon = h1 >= 1 && h1 <= 5;
    if (afternoon && earliestAm !== null && earliestAm <= amOpen) afternoon = false;
    if (afternoon && closeFor(pmOpen) > 24 * 60) afternoon = false;
    open = h1 === 12 ? 12 * 60 + m1 : afternoon ? pmOpen : amOpen;
    close = closeFor(open);
  }
  if (close <= open) close += 24 * 60;
  return [open, close];
}

function tokenize(text: string): Token[] | null {
  const s = text
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\bnoon\b/g, '12 pm')
    .replace(/\bmidnight\b/g, '12 am')
    .replace(/\b(a|p)\.m\./g, '$1m')
    .replace(/\b(\d)(am|pm)\b/g, '$1 $2');
  // The earliest hour the line explicitly opens "am", for the gym case above.
  let earliestAm: number | null = null;
  for (const m of s.matchAll(/(\d{1,2})(?::(\d{2}))?\s*am\s*(?:-|to)/g)) {
    const at = (Number(m[1]) % 12) * 60 + Number(m[2] ?? 0);
    earliestAm = earliestAm === null ? at : Math.min(earliestAm, at);
  }
  const tokens: Token[] = [];
  let i = 0;
  const re = {
    space: /^[\s,;&]+/,
    dayRange: /^(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?\s*(?:-|to|through)\s*(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/,
    day: /^(sun|mon|tue|wed|thu|fri|sat)[a-z]*\.?/,
    daily: /^(?:open\s+)?(?:daily|every\s+day|7\s+days(?:\s+a\s+week)?|all\s+week)/,
    allHours: /^(?:open\s+)?24(?:\s*hours|\/7)/,
    time: /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/,
    closed: /^closed/,
    appointment: /^(?:or\s+)?by\s+appointment(?:\s+only)?/,
    filler: /^(?:open|only|and|hours?|from|\.)/,
  };
  while (i < s.length) {
    const rest = s.slice(i);
    let m: RegExpMatchArray | null;
    if ((m = rest.match(re.space))) {
      i += m[0].length;
    } else if ((m = rest.match(re.dayRange))) {
      tokens.push({ kind: 'days', days: dayRange(DAY_NAMES.indexOf(m[1]!), DAY_NAMES.indexOf(m[2]!)) });
      i += m[0].length;
    } else if ((m = rest.match(re.daily))) {
      tokens.push({ kind: 'days', days: [0, 1, 2, 3, 4, 5, 6] });
      i += m[0].length;
    } else if ((m = rest.match(re.day))) {
      tokens.push({ kind: 'days', days: [DAY_NAMES.indexOf(m[1]!)] });
      i += m[0].length;
    } else if ((m = rest.match(re.allHours))) {
      tokens.push({ kind: 'time', open: 0, close: 24 * 60 });
      i += m[0].length;
    } else if ((m = rest.match(re.time))) {
      const range = resolveRange(Number(m[1]), Number(m[2] ?? 0), m[3] ?? null, Number(m[4]), Number(m[5] ?? 0), m[6] ?? null, earliestAm);
      if (!range) return null;
      tokens.push({ kind: 'time', open: range[0], close: range[1] });
      i += m[0].length;
    } else if ((m = rest.match(re.closed))) {
      tokens.push({ kind: 'closed' });
      i += m[0].length;
    } else if ((m = rest.match(re.appointment))) {
      tokens.push({ kind: 'appointment' });
      i += m[0].length;
    } else if ((m = rest.match(re.filler))) {
      i += m[0].length;
    } else {
      // dawn, dusk, sunrise, a month, "office", "worship": not hours we can
      // stand behind, so not hours at all.
      return null;
    }
  }
  return tokens;
}

/** "Mo-Fr", "Sa,Su", "We-Mo" — consecutive days as a range, the rest listed. */
function formatDays(days: number[]): string {
  const set = [...new Set(days)];
  if (set.length === 7) return 'Mo-Su';
  // Keep the order the listing gave, but describe a wrapped run ("Wed–Mon") as
  // its range rather than as five separate days.
  const runs: number[][] = [];
  for (const d of set) {
    const last = runs[runs.length - 1];
    if (last && (last[last.length - 1]! + 1) % 7 === d) last.push(d);
    else runs.push([d]);
  }
  return runs.map((r) => (r.length > 2 ? `${DAY_CODES[r[0]!]}-${DAY_CODES[r[r.length - 1]!]}` : r.map((d) => DAY_CODES[d]).join(','))).join(',');
}

function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * The hours line as schema.org `openingHours` strings, or null when any part
 * of it is not something to be confident about.
 */
export function parseHoursText(text: string | undefined): string[] | null {
  if (!text) return null;
  const tokens = tokenize(text);
  if (!tokens || tokens.length === 0) return null;

  type Segment = { days: number[]; times: Array<{ open: number; close: number }>; closed: boolean; appointment: boolean };
  const segments: Segment[] = [];
  let current: Segment | null = null;
  const start = (): Segment => {
    const seg: Segment = { days: [], times: [], closed: false, appointment: false };
    segments.push(seg);
    return seg;
  };
  for (const t of tokens) {
    if (t.kind === 'days') {
      // "closed Sun–Mon": the days belong to the closed segment just opened.
      const attach = current && (current.closed || current.appointment) && current.days.length === 0;
      if (!attach && (!current || current.times.length > 0 || current.closed || current.appointment)) current = start();
      current!.days.push(...t.days);
    } else if (t.kind === 'time') {
      if (!current) current = start();
      if (current.closed) return null;
      current.times.push({ open: t.open, close: t.close });
    } else if (t.kind === 'closed') {
      // "Sun closed" names its days first; "closed Sun" names them after.
      if (current && current.times.length === 0 && current.days.length > 0 && !current.appointment) current.closed = true;
      else (current = start()).closed = true;
    } else {
      // "by appointment" describes the days before it when there is no time,
      // and is a trailing remark ("Tue–Sat 10–5, or by appointment") otherwise.
      if (current && current.times.length === 0 && !current.closed) current.appointment = true;
      else (current = start()).appointment = true;
    }
  }

  const out: string[] = [];
  const timed = segments.filter((s) => s.times.length > 0);
  for (const seg of segments) {
    if (seg.closed || seg.appointment) continue;
    if (seg.times.length === 0) return null;
    // A bare time with no day ("10–5") is every day only when it is all there is.
    const days = seg.days.length > 0 ? seg.days : timed.length === 1 && segments.length === 1 ? [0, 1, 2, 3, 4, 5, 6] : null;
    if (!days) return null;
    for (const t of seg.times) out.push(`${formatDays(days)} ${hhmm(t.open)}-${hhmm(t.close > 24 * 60 ? t.close - 24 * 60 : t.close)}`);
  }
  return out.length > 0 ? out : null;
}

/**
 * Whether an hours line is text on purpose: daylight hours for a park or a
 * trail, a lodging's check-in, by appointment, a season, a box office, a
 * service time or a runway. `parseHoursText` returns null for all of these,
 * rightly; a schedule would put "Open now" on a theatre whose box office
 * keeps the afternoon, or on a park after dark in December. The validator
 * counts them apart, so its warning names only the lines that could be a
 * schedule and are not.
 */
export function hoursTextByDesign(text: string): boolean {
  const s = text.toLowerCase();
  return (
    /\b(?:sunrise|sunset|dawn|dusk|daylight)\b/.test(s) ||
    /\bcheck-?(?:in|out)\b/.test(s) ||
    /\bappointment\b/.test(s) ||
    /\b(?:box office|worship|runway)\b/.test(s) ||
    // A season: "May–Sep", "Sep 23–Oct 31", "April to October".
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:[-–—]|to\b|through\b|\d)/.test(s)
  );
}

/** A listing's structured hours: the explicit field, else what its text line parses to. */
export function openingHoursOf(data: { hours?: string; openingHours?: string[]; status?: string }): string[] | null {
  // A closed place has no opening hours, whatever its file still says: the
  // text is kept for the day it reopens, but nothing may say "Open now".
  if (data.status && data.status !== 'open') return null;
  return data.openingHours ?? parseHoursText(data.hours);
}

/** Read `openingHours` strings back into spans. Malformed strings are skipped. */
export function parseOpeningHours(spec: readonly string[]): Span[] {
  const spans: Span[] = [];
  for (const line of spec) {
    const m = line.match(/^([A-Za-z,-]+) (\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    if (!m) continue;
    const days: number[] = [];
    for (const part of m[1]!.split(',')) {
      const [a, b] = part.split('-');
      const from = DAY_CODES.indexOf(a as never);
      const to = b ? DAY_CODES.indexOf(b as never) : from;
      if (from < 0 || to < 0) continue;
      days.push(...dayRange(from, to));
    }
    const open = Number(m[2]) * 60 + Number(m[3]);
    let close = Number(m[4]) * 60 + Number(m[5]);
    if (close <= open) close += 24 * 60;
    if (days.length > 0) spans.push({ days, open, close });
  }
  return spans;
}

/** Denver weekday and minutes since midnight for an instant. */
export function localClock(now: Date, tz = TIME_ZONE): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = DAY_NAMES.indexOf(get('weekday').toLowerCase().slice(0, 3));
  const hour = Number(get('hour')) % 24;
  return { day, minutes: hour * 60 + Number(get('minute')) };
}

/** "7 pm", "10:30 am", "midnight". */
export function clockLabel(minutes: number): string {
  const m = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  if (m === 0) return 'midnight';
  if (m === 12 * 60) return 'noon';
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h < 12 ? 'am' : 'pm'}`;
}

export interface OpenStatus {
  open: boolean;
  /** "Open · closes 7 pm", "Closed · opens 10 am", "Closed · opens Tue 10 am". */
  label: string;
}

/**
 * Whether a place is open at `now`, and what happens next. Null when the
 * spec has nothing to say — the page then shows the text and nothing else.
 */
export function openingStatus(spec: readonly string[], now: Date, tz = TIME_ZONE): OpenStatus | null {
  const spans = parseOpeningHours(spec);
  if (spans.length === 0) return null;
  const { day, minutes } = localClock(now, tz);
  const yesterday = (day + 6) % 7;

  // Open now: a span on today that covers the minute, or one from yesterday
  // still running past midnight.
  let closesAt: number | null = null;
  for (const s of spans) {
    if (s.days.includes(day) && s.open <= minutes && minutes < s.close) closesAt = Math.max(closesAt ?? 0, s.close);
    if (s.days.includes(yesterday) && s.close > 24 * 60 && minutes < s.close - 24 * 60) closesAt = Math.max(closesAt ?? 0, s.close - 24 * 60);
  }
  if (closesAt !== null) return { open: true, label: `Open · closes ${clockLabel(closesAt)}` };

  // Closed: the next opening, today or on a later day.
  for (let ahead = 0; ahead < 8; ahead++) {
    const d = (day + ahead) % 7;
    const opens = spans.filter((s) => s.days.includes(d) && (ahead > 0 || s.open > minutes)).map((s) => s.open);
    if (opens.length === 0) continue;
    const at = Math.min(...opens);
    const when = ahead === 0 ? '' : ahead === 1 ? 'tomorrow ' : `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]} `;
    return { open: false, label: `Closed · opens ${when}${clockLabel(at)}` };
  }
  return { open: false, label: 'Closed' };
}
