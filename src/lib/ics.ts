/**
 * iCalendar export. Pure function over event entries so it can be tested
 * without Astro. Weekly repeats are expanded into individual occurrences
 * (matching what the site shows) rather than emitted as RRULEs, so calendar
 * apps and the pages agree on the dates.
 */
import { TIME_ZONE, dayKey, addDays, startOfDay } from './dates';

export type IcsEvent = {
  uid: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  location?: string;
  description?: string;
  url?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "20261003T100000" in Denver wall-clock time. */
export function icsLocal(date: Date, tz = TIME_ZONE): string {
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
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}${get('month')}${get('day')}T${get('hour')}${get('minute')}${get('second')}`;
}

/** "20261003" */
export function icsDate(date: Date): string {
  return dayKey(date).replace(/-/g, '');
}

function icsUtc(date: Date): string {
  const d = date;
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines at 75 octets per RFC 5545. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    if (size + len > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = ' ';
      size = 1;
    }
    current += ch;
    size += len;
  }
  out.push(current);
  return out.join('\r\n');
}

const VTIMEZONE_DENVER = [
  'BEGIN:VTIMEZONE',
  'TZID:America/Denver',
  'X-LIC-LOCATION:America/Denver',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:-0700',
  'TZOFFSETTO:-0600',
  'TZNAME:MDT',
  'DTSTART:19700308T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:-0600',
  'TZOFFSETTO:-0700',
  'TZNAME:MST',
  'DTSTART:19701101T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

export function buildIcs(
  events: IcsEvent[],
  { name, domain, now = new Date() }: { name: string; domain: string; now?: Date },
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Inside the Towns//${domain}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-TIMEZONE:${TIME_ZONE}`,
    ...VTIMEZONE_DENVER,
  ];
  const stamp = icsUtc(now);
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    if (e.allDay) {
      const endDay = e.end ? addDays(startOfDay(e.end), 1) : addDays(startOfDay(e.start), 1);
      lines.push(`DTSTART;VALUE=DATE:${icsDate(e.start)}`);
      lines.push(`DTEND;VALUE=DATE:${icsDate(endDay)}`);
    } else {
      lines.push(`DTSTART;TZID=${TIME_ZONE}:${icsLocal(e.start)}`);
      if (e.end) lines.push(`DTEND;TZID=${TIME_ZONE}:${icsLocal(e.end)}`);
    }
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
