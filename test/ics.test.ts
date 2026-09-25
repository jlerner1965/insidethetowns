/**
 * The calendar exports: the .ics a reader downloads and the Google Calendar
 * link beside it. A wrong offset here puts a reader at the venue an hour early.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { buildIcs, googleCalendarUrl } from '../src/lib/ics.ts';

const at = (s: string) => parseLocal(s);

test('a timed event is sent to Google in Denver wall-clock time', () => {
  const url = new URL(
    googleCalendarUrl({
      title: 'Art in the Park',
      start: at('2026-09-26T09:00'),
      end: at('2026-09-26T13:00'),
      location: 'Berthoud Town Park, Berthoud, CO',
      url: 'https://insideberthoud.com/events/art-in-the-park/',
    }),
  );
  assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/render');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), 'Art in the Park');
  assert.equal(url.searchParams.get('dates'), '20260926T090000/20260926T130000');
  assert.equal(url.searchParams.get('ctz'), 'America/Denver');
  assert.equal(url.searchParams.get('location'), 'Berthoud Town Park, Berthoud, CO');
  assert.equal(url.searchParams.get('details'), 'https://insideberthoud.com/events/art-in-the-park/');
});

test('an event with no end is given an hour, because Google insists on one', () => {
  const url = new URL(googleCalendarUrl({ title: 'Talk', start: at('2026-11-05T18:30') }));
  assert.equal(url.searchParams.get('dates'), '20261105T183000/20261105T193000');
});

test('an all-day event uses dates, with the exclusive end Google expects', () => {
  const one = new URL(googleCalendarUrl({ title: 'Fair', start: at('2026-10-03'), allDay: true }));
  assert.equal(one.searchParams.get('dates'), '20261003/20261004');
  const run = new URL(googleCalendarUrl({ title: 'Trail', start: at('2026-10-17'), end: at('2026-10-31'), allDay: true }));
  assert.equal(run.searchParams.get('dates'), '20261017/20261101');
});

test('a single-event .ics carries the zone, the page and lines no longer than 75 octets', () => {
  const ics = buildIcs(
    [
      {
        uid: 'art-in-the-park-2026-09-26@insideberthoud.com',
        title: 'Art in the Park at the Berthoud Market, with a very long title to fold',
        start: at('2026-09-26T09:00'),
        end: at('2026-09-26T13:00'),
        location: 'Berthoud Town Park, 7th Street, Berthoud, CO',
        description: 'Cost: Free\nMore: https://insideberthoud.com/events/art-in-the-park/',
        url: 'https://insideberthoud.com/events/art-in-the-park/',
      },
    ],
    { name: 'Art in the Park — Inside Berthoud', domain: 'insideberthoud.com', now: at('2026-09-24T21:00') },
  );
  assert.match(ics, /^DTSTART;TZID=America\/Denver:20260926T090000\r$/m);
  assert.match(ics, /^DTEND;TZID=America\/Denver:20260926T130000\r$/m);
  assert.match(ics, /^UID:art-in-the-park-2026-09-26@insideberthoud.com\r$/m);
  assert.match(ics, /^URL:https:\/\/insideberthoud.com\/events\/art-in-the-park\/\r$/m);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 1);
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, line);
});
