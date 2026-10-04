/**
 * RSS 2.0, written here because the feeds in play are small and plain, and
 * the one structure that matters is CivicPlus's calendar extension.
 *
 * A CivicPlus town site (Lyons, Berthoud, Erie, Johnstown) publishes its
 * calendar as RSS with three extra elements per item: `calendarEvent:
 * EventDates` ("October 4, 2026" or "August 24, 2026 - October 4, 2026"),
 * `calendarEvent:EventTimes` ("11:00 AM - 08:00 PM") and `calendarEvent:
 * Location`. Those are the facts; the `<description>` repeats them in HTML.
 * An item without an event date is news, not an event, and is dropped with a
 * count rather than guessed at.
 */
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import { plainText, type FeedEvent, type Horizon } from './types.ts';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function element(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return undefined;
  const inner = m[1]!.trim();
  const cdata = inner.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return (cdata ? cdata[1]! : inner).trim();
}

/** "October 4, 2026" -> [2026, 10, 4]. */
export function parseLongDate(text: string): [number, number, number] | null {
  const m = text.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]!.toLowerCase());
  if (month === -1) return null;
  return [Number(m[3]), month + 1, Number(m[2])];
}

/** "08:00 AM" -> [8, 0]; "12:30 PM" -> [12, 30]; "12:15 AM" -> [0, 15]. */
export function parseClock(text: string): [number, number] | null {
  const m = text.trim().match(/^(\d{1,2}):(\d{2})\s*([AP])\.?M\.?$/i);
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  if (m[3]!.toUpperCase() === 'P') hour += 12;
  return [hour, Number(m[2])];
}

export interface RssReadResult {
  events: FeedEvent[];
  /** Items with no event date: news, notices, jobs. */
  skipped: number;
}

export function readRss(xml: string, horizon: Horizon): RssReadResult {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => m[1]!);
  const events: FeedEvent[] = [];
  let skipped = 0;
  for (const item of items) {
    const title = plainText(element(item, 'title') ?? '');
    const link = element(item, 'link');
    const dates = element(item, 'calendarEvent:EventDates');
    const times = element(item, 'calendarEvent:EventTimes');
    const location = element(item, 'calendarEvent:Location');
    const guid = element(item, 'guid');
    const description = element(item, 'description');
    if (!dates || !title) {
      skipped++;
      continue;
    }
    const [firstText, lastText] = dates.split(/\s+-\s+|\s+–\s+/).map((s) => s.trim());
    const first = parseLongDate(firstText ?? '');
    const last = lastText ? parseLongDate(lastText) : first;
    if (!first || !last) {
      skipped++;
      continue;
    }
    let [startClock, endClock] = (times ?? '').split(/\s+-\s+|\s+–\s+/).map((s) => parseClock(s));
    // "12:00 AM - 11:59 PM" is how CivicPlus writes a day-long entry.
    if (startClock && endClock && startClock[0] === 0 && startClock[1] === 0 && endClock[0] === 23 && endClock[1] === 59) {
      startClock = null;
      endClock = null;
    }
    const allDay = !startClock;
    const start = fromWallClock(first[0], first[1], first[2], startClock?.[0] ?? 0, startClock?.[1] ?? 0, 0, TIME_ZONE);
    const end = endClock
      ? fromWallClock(last[0], last[1], last[2], endClock[0], endClock[1], 0, TIME_ZONE)
      : lastText
        ? fromWallClock(last[0], last[1], last[2], 0, 0, 0, TIME_ZONE)
        : undefined;
    if (start.getTime() >= horizon.to.getTime() || (end ?? start).getTime() < horizon.from.getTime()) continue;
    // CivicPlus's guid is "<link>/<ticks>"; the event id is the EID in the link.
    const eid = link?.match(/EID=(\d+)/i)?.[1];
    events.push({
      uid: eid ? `EID=${eid}` : (guid ?? link ?? title),
      title,
      start,
      end,
      allDay,
      location: location
        ? plainText(location)
            .replace(/\n+/g, ', ')
            // CivicPlus drops the line break before the city: "750Erie, CO".
            .replace(/(\d)(?=[A-Z][a-z])/g, '$1, ')
            .replace(/([a-z.])([A-Z][a-z])/g, '$1, $2')
            .replace(/\s*,\s*,\s*/g, ', ')
        : undefined,
      url: link,
      // The description is the dates and the location again; nothing to keep.
      description: description && !/Event dates?:/i.test(plainText(description)) ? plainText(description) : undefined,
      categories: [],
      status: 'confirmed',
    });
  }
  return { events, skipped };
}
