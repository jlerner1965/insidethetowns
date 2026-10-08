/**
 * The calendar exports: the .ics a reader downloads and the Google Calendar
 * link beside it. A wrong offset here puts a reader at the venue an hour early.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { buildIcs, escapeText, googleCalendarUrl } from '../src/lib/ics.ts';
import { exportWhen } from '../src/lib/events.ts';
import { eventJsonLd } from '../src/lib/seo.ts';

const at = (s: string) => parseLocal(s);

test('TEXT values escape semicolons as well as commas, backslashes and newlines', () => {
  assert.equal(escapeText('Pick; jam, and a\\ line\nbreak'), 'Pick\\; jam\\, and a\\\\ line\\nbreak');
});

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

test('an event with no end goes to Google with none, not a guessed hour', () => {
  const url = new URL(googleCalendarUrl({ title: 'Talk', start: at('2026-11-05T18:30') }));
  assert.equal(url.searchParams.get('dates'), '20261105T183000/20261105T183000');
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

// ------------------------------------------------- one listing, three exports

/** A listing as the event page has it, with the three exports the page offers. */
function exportsOf(slug: string, data: { title: string; start: Date; end?: Date; allDay?: boolean; timeNote?: string }) {
  const listing = { slug, data: { venue: 'The Stanley Hotel', category: 'other', status: 'scheduled', allDay: false, ...data }, body: '' };
  const when = exportWhen(listing as never);
  const ics = buildIcs([{ uid: `${slug}@insideestespark.com`, title: data.title, ...when }], { name: data.title, domain: 'insideestespark.com', now: at('2026-10-08T09:00') });
  const google = new URL(googleCalendarUrl({ title: data.title, ...when })).searchParams.get('dates');
  const town = { kind: 'town', name: 'Estes Park', state: 'CO', domain: 'insideestespark.com' } as never;
  const ld = eventJsonLd(town, listing as never, `https://insideestespark.com/events/${slug}/`) as { startDate: string; endDate?: string };
  return { ics, google, ld };
}

test('a two-night show exports each night on its own, at its own start, with no end it never gave', () => {
  // insideestespark.com/events/amy-bruni-walking-with-ghosts-2026-10-15/ was
  // one listing running 7:30 pm to 7:30 pm the next day, and its .ics, Google
  // link and structured data all said so. Each night is its own listing now.
  const nights = [
    exportsOf('amy-bruni-walking-with-ghosts-2026-10-15', { title: 'Amy Bruni: Walking with Ghosts', start: at('2026-10-15T19:30') }),
    exportsOf('amy-bruni-walking-with-ghosts-2026-10-16', { title: 'Amy Bruni: Walking with Ghosts', start: at('2026-10-16T19:30') }),
  ];
  for (const [i, day] of ['20261015', '20261016'].entries()) {
    const { ics, google, ld } = nights[i]!;
    assert.match(ics, new RegExp(`^DTSTART;TZID=America/Denver:${day}T193000\r$`, 'm'));
    assert.doesNotMatch(ics, /^DTEND/m, 'no end in the .ics');
    assert.equal(google, `${day}T193000/${day}T193000`, 'no made-up end in the Google link');
    assert.equal(ld.startDate, `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6)}T19:30:00-06:00`);
    assert.equal(ld.endDate, undefined, 'no end in the structured data');
  }
});

test('a timed run across days exports as whole days in the .ics, the Google link and the structured data alike', () => {
  const { ics, google, ld } = exportsOf('applewood-show', {
    title: 'Saturday and Sunday show', start: at('2026-10-31T10:00'), end: at('2026-11-01T16:00'), timeNote: 'Sat 10–5, Sun 10–4',
  });
  assert.match(ics, /^DTSTART;VALUE=DATE:20261031\r$/m);
  assert.match(ics, /^DTEND;VALUE=DATE:20261102\r$/m, 'through Sunday, the end exclusive');
  assert.equal(google, '20261031/20261102');
  assert.deepEqual([ld.startDate, ld.endDate], ['2026-10-31', '2026-11-01']);
});

test('an overnight sitting stays one timed event', () => {
  const { ics, google, ld } = exportsOf('crystal-ball', { title: 'Crystal Ball', start: at('2026-12-31T20:00'), end: at('2027-01-01T00:30') });
  assert.match(ics, /^DTSTART;TZID=America\/Denver:20261231T200000\r$/m);
  assert.match(ics, /^DTEND;TZID=America\/Denver:20270101T003000\r$/m);
  assert.equal(google, '20261231T200000/20270101T003000');
  assert.deepEqual([ld.startDate, ld.endDate], ['2026-12-31T20:00:00-07:00', '2027-01-01T00:30:00-07:00']);
});

test('an event on November 1, 2026, the day the clocks go back, exports at its local time', () => {
  const { ics, google, ld } = exportsOf('sunday-concert', { title: 'Sunday concert', start: at('2026-11-01T19:00'), end: at('2026-11-01T21:00') });
  assert.match(ics, /^DTSTART;TZID=America\/Denver:20261101T190000\r$/m);
  assert.match(ics, /^DTEND;TZID=America\/Denver:20261101T210000\r$/m);
  assert.equal(google, '20261101T190000/20261101T210000');
  assert.equal(ld.startDate, '2026-11-01T19:00:00-07:00', 'MST, an hour later in UTC than the day before');
  const early = exportsOf('early', { title: 'Early', start: at('2026-11-01T00:30') });
  assert.equal(early.ld.startDate, '2026-11-01T00:30:00-06:00', 'still MDT before 2 am');
});
