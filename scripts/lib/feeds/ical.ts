/**
 * iCalendar, read with ical.js and converted to instants by our own date
 * code.
 *
 * ical.js (Mozilla's, used by Thunderbird) does the parsing and the
 * recurrence arithmetic: RRULE, EXDATE, RECURRENCE-ID overrides, all in the
 * wall-clock time the rule is written in, which is the only way a weekly
 * storytime stays at 10:30 across the November clock change. What it does
 * not ship is a time zone database, so each occurrence's wall clock and TZID
 * are converted to an instant with `fromWallClock` (src/lib/dates.ts), the
 * same Intl-backed conversion every date on the sites goes through. UTC
 * stamps convert directly; floating times are read as Denver, which is what
 * every feed here means by them.
 */
import ICAL from 'ical.js';
import { TIME_ZONE, fromWallClock } from '../../../src/lib/dates.ts';
import type { FeedEvent, Horizon } from './types.ts';

/** Windows and other non-IANA zone names that turn up in feeds. */
const ZONE_ALIASES: Record<string, string> = {
  'Mountain Standard Time': TIME_ZONE,
  'Mountain Daylight Time': TIME_ZONE,
  'US Mountain Standard Time': 'America/Phoenix',
  'US/Mountain': TIME_ZONE,
  MST: TIME_ZONE,
  MDT: TIME_ZONE,
};

function isIana(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** An ICAL.Time to an instant, honouring its zone the way the feed meant it. */
export function toInstant(t: ICAL.Time): Date {
  const tzid = t.zone?.tzid;
  if (t.isDate) return fromWallClock(t.year, t.month, t.day, 0, 0, 0, TIME_ZONE);
  if (tzid === 'UTC' || tzid === 'Z') return t.toJSDate();
  if (!tzid || tzid === 'floating') return fromWallClock(t.year, t.month, t.day, t.hour, t.minute, t.second, TIME_ZONE);
  const zone = ZONE_ALIASES[tzid] ?? tzid;
  if (isIana(zone)) return fromWallClock(t.year, t.month, t.day, t.hour, t.minute, t.second, zone);
  // A zone we cannot name: trust the VTIMEZONE the feed shipped, if it did.
  return t.toJSDate();
}

function text(component: ICAL.Component, name: string): string | undefined {
  const v = component.getFirstPropertyValue(name);
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function categories(component: ICAL.Component): string[] {
  const out: string[] = [];
  for (const prop of component.getAllProperties('categories')) {
    for (const v of prop.getValues()) if (typeof v === 'string' && v.trim()) out.push(v.trim());
  }
  return out;
}

/**
 * Every occurrence in the window, one FeedEvent each. A recurring event's
 * occurrences share its UID with the occurrence date appended, so a
 * re-ingest finds the same Tuesday again.
 */
export function readIcal(ics: string, horizon: Horizon): FeedEvent[] {
  const jcal = ICAL.parse(ics);
  const calendar = new ICAL.Component(jcal);
  for (const tz of calendar.getAllSubcomponents('vtimezone')) {
    const zone = new ICAL.Timezone(tz);
    if (zone.tzid && !ICAL.TimezoneService.has(zone.tzid)) ICAL.TimezoneService.register(zone.tzid, zone);
  }

  const masters = new Map<string, ICAL.Event>();
  const exceptions: ICAL.Event[] = [];
  for (const vevent of calendar.getAllSubcomponents('vevent')) {
    const event = new ICAL.Event(vevent);
    if (!event.uid) continue;
    if (event.isRecurrenceException()) exceptions.push(event);
    else masters.set(event.uid, event);
  }
  for (const ex of exceptions) {
    const master = masters.get(ex.uid);
    if (master) master.relateException(ex);
    // An exception without a master is a one-off moved out of a series we
    // were not sent; take it as it stands.
    else masters.set(`${ex.uid}#${ex.recurrenceId?.toString()}`, ex);
  }

  const from = ICAL.Time.fromJSDate(horizon.from, true);
  const to = ICAL.Time.fromJSDate(horizon.to, true);
  const out: FeedEvent[] = [];

  const push = (item: ICAL.Event, start: ICAL.Time, end: ICAL.Time | null, uidSuffix: string) => {
    const component = item.component;
    const startAt = toInstant(start);
    const endAt = end ? toInstant(end) : undefined;
    if (startAt.getTime() >= horizon.to.getTime()) return;
    if ((endAt ?? startAt).getTime() < horizon.from.getTime()) return;
    const status = (text(component, 'status') ?? 'CONFIRMED').toUpperCase();
    const lastModified = component.getFirstPropertyValue('last-modified');
    out.push({
      uid: `${item.uid}${uidSuffix}`,
      title: item.summary?.trim() || '(untitled)',
      start: startAt,
      // An all-day DTEND is the day after the last day; the schema wants the last day.
      end: endAt && start.isDate ? new Date(endAt.getTime() - 86_400_000) : endAt,
      allDay: start.isDate,
      location: item.location?.trim() || undefined,
      url: text(component, 'url'),
      description: item.description?.trim() || undefined,
      categories: categories(component),
      status: status === 'CANCELLED' ? 'cancelled' : 'confirmed',
      lastModified: lastModified instanceof ICAL.Time ? lastModified.toJSDate() : undefined,
    });
  };

  for (const event of masters.values()) {
    if (!event.isRecurring()) {
      push(event, event.startDate, event.endDate, '');
      continue;
    }
    const iterator = event.iterator();
    let next: ICAL.Time | null;
    let guard = 0;
    while ((next = iterator.next()) && guard++ < 10_000) {
      if (next.compare(to) >= 0) break;
      const details = event.getOccurrenceDetails(next);
      if (details.endDate.compare(from) < 0) continue;
      push(details.item, details.startDate, details.endDate, `/${details.recurrenceId.toString().slice(0, 10)}`);
    }
  }
  return out;
}
