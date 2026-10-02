/**
 * What a listing's status does to the pages that recommend.
 *
 * The October 2026 audit found a restaurant that had closed in February and a
 * sports complex shut since May 2025 sitting in the standard open template,
 * and three canceled town meetings listed as happening. The status field is
 * the fix; these are the places it has to reach.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { highlights, isCanceled, occurrences, oneOffs, upcoming } from '../src/lib/events.ts';
import { openingHoursOf } from '../src/lib/hours.ts';
import { buildIcs } from '../src/lib/ics.ts';
import { byProminence, isOpen } from '../src/lib/places.ts';
import { pickCanonical } from '../src/lib/series.ts';
import { eventSchema, placeSchema } from '../src/content/schemas.ts';
import { z } from 'astro/zod';

const plainImage = () => z.string();

function ev(title: string, start: string, extra: Record<string, unknown> = {}) {
  return {
    slug: title.toLowerCase().replace(/\W+/g, '-'),
    data: {
      title,
      venue: 'Town Hall',
      start: parseLocal(start),
      end: undefined,
      allDay: false,
      category: 'other',
      featured: false,
      status: 'scheduled',
      ...extra,
    },
  } as unknown as Parameters<typeof highlights>[0][number];
}

const now = parseLocal('2026-10-01T12:00');

// ---------------------------------------------------------------- the schema

test('a status other than the default needs a note saying who says so', () => {
  const event = eventSchema(plainImage);
  const base = { title: 'Meeting', start: '2026-10-06T18:30', venue: 'Town Hall', category: 'civic' };
  assert.equal(event.safeParse(base).success, true);
  assert.equal(event.safeParse(base).data?.status, 'scheduled');
  assert.equal(event.safeParse({ ...base, status: 'canceled' }).success, false, 'a bare "canceled" is a claim with nothing behind it');
  assert.equal(event.safeParse({ ...base, status: 'canceled', statusNote: 'The Town lists it as canceled.' }).success, true);

  const place = placeSchema(plainImage);
  const pub = { title: 'Pub', type: 'restaurant', address: '1 Main St', summary: 'A pub.' };
  assert.equal(place.safeParse(pub).data?.status, 'open');
  assert.equal(place.safeParse({ ...pub, status: 'closed' }).success, false);
  assert.equal(place.safeParse({ ...pub, status: 'closed', statusNote: 'Reported closed in February 2026.' }).success, true);
});

// ---------------------------------------------------------------- events

test('a canceled event stays in the list but leaves the picks', () => {
  const fair = ev('Fall Fair', '2026-10-03T10:00', { category: 'festival' });
  const meeting = ev('Board meeting', '2026-10-02T19:00', { status: 'canceled', statusNote: 'Canceled by the Town.' });
  const list = [meeting, fair];
  assert.deepEqual(
    upcoming(list, { now }).map((e) => e.data.title),
    ['Board meeting', 'Fall Fair'],
    'the reader who planned to go is who needs to see it',
  );
  assert.deepEqual(highlights(list, { now, limit: 6 }).map((e) => e.data.title), ['Fall Fair']);
  assert.deepEqual(oneOffs(list).map((e) => e.data.title), ['Fall Fair']);
  assert.equal(isCanceled(meeting), true);
  assert.equal(isCanceled(ev('x', '2026-10-02T19:00', { status: 'postponed' })), true, 'a withdrawn date is not one to recommend either');
});

test('the indexed occurrence of a series skips a canceled one', () => {
  const series = [
    { slug: 'pc-2026-10-06', key: 'PC|Hall', startDay: '2026-10-06', canceled: true },
    { slug: 'pc-2026-10-20', key: 'PC|Hall', startDay: '2026-10-20' },
    { slug: 'pc-2026-11-03', key: 'PC|Hall', startDay: '2026-11-03', canceled: true },
  ];
  assert.equal(pickCanonical(series, '2026-10-01').get('PC|Hall'), 'pc-2026-10-20');
  // When every remaining date is canceled, the soonest still gets the page.
  assert.equal(pickCanonical(series.filter((o) => o.canceled), '2026-10-01').get('PC|Hall'), 'pc-2026-10-06');
});

test('the calendar feed carries a cancellation rather than dropping the event', () => {
  const ics = buildIcs(
    [{ uid: 'a@x', title: 'Meeting', start: parseLocal('2026-10-06T18:30'), cancelled: true }],
    { name: 'Test', domain: 'x', now },
  );
  assert.match(ics, /STATUS:CANCELLED/);
  const plain = buildIcs([{ uid: 'b@x', title: 'Fair', start: parseLocal('2026-10-03T10:00') }], { name: 'Test', domain: 'x', now });
  assert.doesNotMatch(plain, /STATUS:/);
});

test('weekly repeats keep their status on every occurrence', () => {
  const weekly = ev('Trivia', '2026-10-01T19:00', { repeat: 'weekly', until: parseLocal('2026-10-29'), status: 'canceled', statusNote: 'Paused.' });
  for (const occurrence of occurrences([weekly], { now })) assert.equal(isCanceled(occurrence), true);
});

// ---------------------------------------------------------------- places

test('a closed place has no opening hours, whatever its file still says', () => {
  assert.deepEqual(openingHoursOf({ hours: 'Mon–Fri 9 am–5 pm' }), ['Mo-Fr 09:00-17:00']);
  assert.equal(openingHoursOf({ hours: 'Mon–Fri 9 am–5 pm', status: 'closed' }), null);
  assert.equal(openingHoursOf({ hours: 'Mon–Fri 9 am–5 pm', status: 'temporarily-closed' }), null);
  assert.equal(openingHoursOf({ openingHours: ['Mo-Fr 09:00-17:00'], status: 'closed' }), null, 'an explicit schedule is overridden too');
});

test('closed places go last, and a closed pick is no longer a pick', () => {
  const p = (title: string, featured = false, status = 'open') => ({ data: { title, featured, status } });
  const sorted = [p('Zed'), p('Bradford’s', true, 'closed'), p('Alpha'), p('Mid', true)].sort(byProminence).map((x) => x.data.title);
  assert.deepEqual(sorted, ['Mid', 'Alpha', 'Zed', 'Bradford’s']);
  assert.equal(isOpen(p('x')), true);
  assert.equal(isOpen(p('x', false, 'temporarily-closed')), false);
});
