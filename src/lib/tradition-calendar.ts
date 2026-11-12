/**
 * A tradition's date as a calendar entry (the reviews of 12 November 2026:
 * "Add to calendar" on the season pages), through src/lib/ics.ts.
 *
 * All-day, unless the record's start time parses with certainty: one
 * clock time with its am or pm and nothing else ("5 pm", "6:30 p.m.",
 * "10:00 AM"). "3PM-6PM, Tree Lighting at 5PM", "Fun run 10 am, 5K 10:30
 * am", "9:00" and "Evening" are not certain, and the entry is the day. A
 * timed entry has no end: no record carries a duration and none is
 * invented. A date that runs several days is all-day across them.
 * Nothing for a row with no date set, a canceled one, or one that has
 * passed.
 */
import { parseLocal } from './dates.ts';
import type { IcsEvent } from './ics.ts';
import type { TraditionRow } from './traditions.ts';

/** "17:30" from "5:30 pm", or undefined when the text is anything but one clock time with am or pm. */
export function certainTime(text: string | undefined): string | undefined {
  const m = text?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (!m) return undefined;
  const hour = Number(m[1]);
  const minute = Number(m[2] ?? '0');
  if (hour < 1 || hour > 12 || minute > 59) return undefined;
  const pm = /^p/i.test(m[3]!);
  const h24 = (hour % 12) + (pm ? 12 : 0);
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** The entry for a row with a date still ahead; undefined otherwise. */
export function traditionCalendarEvent(row: TraditionRow, { domain, pageUrl }: { domain: string; pageUrl: string }): IcsEvent | undefined {
  const { record, entry } = row;
  if (row.past || !entry.date || (entry.status !== 'confirmed' && entry.status !== 'moved')) return undefined;
  const span = !!entry.endDate && entry.endDate !== entry.date;
  const time = span ? undefined : certainTime(entry.startTime);
  const where = [entry.place, record.town ? `${record.town.name}, CO` : undefined].filter(Boolean).join(', ');
  const description = [
    time ? undefined : entry.startTime ? `Time, as published: ${entry.startTime}` : undefined,
    entry.cost ? `Cost: ${entry.cost}` : undefined,
    entry.note ? `${record.organizer}: “${entry.note}”` : undefined,
    `Date read on ${record.organizer}'s page, ${row.source}, checked ${entry.checked}.`,
    `More: ${pageUrl}#${record.slug}`,
  ]
    .filter(Boolean)
    .join('\n');
  return {
    uid: `${record.slug}-${entry.year}@${domain}`,
    title: record.town ? `${record.name}, ${record.town.name}` : record.name,
    start: parseLocal(time ? `${entry.date}T${time}` : entry.date),
    ...(time ? {} : { allDay: true, ...(span ? { end: parseLocal(entry.endDate!) } : {}) }),
    ...(where ? { location: where } : {}),
    description,
    url: row.source,
  };
}
