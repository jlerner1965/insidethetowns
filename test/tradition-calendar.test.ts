/** A tradition's date as a calendar entry (src/lib/tradition-calendar.ts): all-day unless the time is certain, never a duration. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { certainTime, traditionCalendarEvent } from '../src/lib/tradition-calendar.ts';
import { buildIcs } from '../src/lib/ics.ts';
import type { TraditionRow } from '../src/lib/traditions.ts';

test('a time is certain only when it is one clock time with am or pm', () => {
  assert.equal(certainTime('5 pm'), '17:00');
  assert.equal(certainTime('6:30 p.m.'), '18:30');
  assert.equal(certainTime('10:00 AM'), '10:00');
  assert.equal(certainTime('7:30AM'), '07:30');
  assert.equal(certainTime('12 pm'), '12:00');
  assert.equal(certainTime('12:15 am'), '00:15');
  for (const t of ['3PM-6PM, Tree Lighting at 5PM', 'Fun run 10 am, 5K 10:30 am', '9:00', 'Evening', '4-5 p.m.', '7:30AM (5K at 9:00 a.m.)', '13 pm', '', undefined]) assert.equal(certainTime(t), undefined, String(t));
});

const row = (entry: Record<string, unknown>, extra: Partial<TraditionRow> = {}) =>
  ({
    record: { slug: 'lyons-tree-lighting', name: 'Lyons Tree Lighting', town: { name: 'Lyons', guide: 'lyons' }, type: 'tree-lighting', organizer: 'Town of Lyons', sourceUrl: 'https://example.org/', years: [] },
    entry: { year: 2026, status: 'confirmed', checked: '2026-11-12', ...entry },
    year: 2026,
    source: 'https://example.org/tree',
    ...extra,
  }) as unknown as TraditionRow;
const opts = { domain: 'insidethetowns.com', pageUrl: 'https://insidethetowns.com/tree-lightings/' };

test('a certain time makes a timed entry with no end; anything else is the day', () => {
  const timed = traditionCalendarEvent(row({ date: '2026-12-04', startTime: '5 pm', place: 'Sandstone Park' }), opts)!;
  assert.equal(timed.allDay, undefined);
  assert.equal(timed.end, undefined, 'no duration is invented');
  assert.equal(timed.location, 'Sandstone Park, Lyons, CO');
  assert.equal(timed.uid, 'lyons-tree-lighting-2026@insidethetowns.com');
  const ics = buildIcs([timed], { name: 'x', domain: 'insidethetowns.com' });
  assert.match(ics, /DTSTART;TZID=America\/Denver:20261204T170000/);
  assert.doesNotMatch(ics, /DTEND/);

  const vague = traditionCalendarEvent(row({ date: '2026-12-05', startTime: '3PM-6PM, Tree Lighting at 5PM' }), opts)!;
  assert.equal(vague.allDay, true);
  assert.match(vague.description!, /Time, as published: 3PM-6PM, Tree Lighting at 5PM/);
  assert.match(buildIcs([vague], { name: 'x', domain: 'insidethetowns.com' }), /DTSTART;VALUE=DATE:20261205\r\nDTEND;VALUE=DATE:20261206/);
  assert.equal(traditionCalendarEvent(row({ date: '2026-12-05' }), opts)!.allDay, true);
});

test('a date that runs several days is all-day across them, whatever its time', () => {
  const run = traditionCalendarEvent(row({ date: '2027-04-09', endDate: '2027-04-11', startTime: '10 am' }), opts)!;
  assert.equal(run.allDay, true);
  assert.match(buildIcs([run], { name: 'x', domain: 'insidethetowns.com' }), /DTSTART;VALUE=DATE:20270409\r\nDTEND;VALUE=DATE:20270412/);
});

test('nothing for a date not set, canceled or passed', () => {
  assert.equal(traditionCalendarEvent(row({ status: 'not-announced' }), opts), undefined);
  assert.equal(traditionCalendarEvent(row({ status: 'canceled', date: '2026-12-04' }), opts), undefined);
  assert.equal(traditionCalendarEvent(row({ status: 'typical' }), opts), undefined);
  assert.equal(traditionCalendarEvent(row({ date: '2026-11-01' }, { past: true }), opts), undefined);
});

test('a canceled date reaches a subscription as a cancellation, and nowhere else (audit, 13 November 2026)', () => {
  const canceled = (date?: string) =>
    ({
      record: { slug: 'w-p', name: 'Parade of Lights', organizer: 'Town', town: { name: 'Wellington', guide: 'wellington' }, type: 'parade-of-lights', sourceUrl: 'https://example.gov/', years: [] },
      entry: { year: 2026, status: 'canceled', ...(date ? { date } : {}), checked: '2026-11-12' },
      year: 2026,
      source: 'https://example.gov/',
    }) as unknown as TraditionRow;
  const ctx = { domain: 'insidethetowns.com', pageUrl: 'https://insidethetowns.com/parades-of-lights/' };
  // "Add to calendar" never offers a canceled date.
  assert.equal(traditionCalendarEvent(canceled('2026-12-20'), ctx), undefined);
  // A feed carries one whose date had been set and is still ahead, marked cancelled.
  const event = traditionCalendarEvent(canceled('2026-12-20'), { ...ctx, cancellations: true, today: '2026-11-12' });
  assert.equal(event?.cancelled, true);
  assert.match(event!.description!, /^Canceled:/);
  assert.match(buildIcs([event!], { name: 'x', domain: 'x' }), /^STATUS:CANCELLED\r$/m);
  // No date ever set, or a date gone: nothing to cancel.
  assert.equal(traditionCalendarEvent(canceled(), { ...ctx, cancellations: true, today: '2026-11-12' }), undefined);
  assert.equal(traditionCalendarEvent(canceled('2026-11-01'), { ...ctx, cancellations: true, today: '2026-11-12' }), undefined);
});
