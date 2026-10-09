/**
 * Productions and the whole run of a listing.
 *
 * A play that runs nine shows over three weekends is one listing with nine
 * dates, and a weekly trivia night is one file with a date every Tuesday to
 * December. Each was being read as its first date alone, or as one block
 * from first to last (fresh audit, 9 October 2026): the theatre runs became
 * sixteen-day all-day blocks in readers' calendars, and every weekly series
 * was noindexed after its first week.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { parseLocal, dayKey } from '../src/lib/dates.ts';
import { exportWhen, finalDay, isOver, isPast, nextOccurrence, occurrences, upcoming } from '../src/lib/events.ts';
import { eventSchema } from '../src/content/schemas.ts';
import { occurrenceUid, showKey } from '../src/lib/ics.ts';

const at = (s: string) => parseLocal(s);
const schema = eventSchema(() => z.string());
const base = { title: 'The Legend of Sleepy Hollow', venue: 'Magnolia Theatre', category: 'arts' };

const sleepyHollow = schema.parse({
  ...base,
  start: '2026-10-09T19:00',
  performances: [
    { start: '2026-10-09T19:00', note: 'sold out' },
    '2026-10-10T19:00',
    '2026-10-11T13:00',
    '2026-10-17T13:00',
    '2026-10-17T19:00',
    '2026-10-24T19:00',
  ],
});
const production = { slug: 'sleepy-hollow', data: sleepyHollow };

test('a production is one entry per show, each at its own time, sharing the page', () => {
  const shows = occurrences([production], { now: at('2026-10-09T08:00'), horizonDays: 60 });
  assert.equal(shows.length, 6);
  assert.deepEqual(
    shows.map((s) => s.data.start.getTime()),
    sleepyHollow.performances!.map((p) => p.start.getTime()),
  );
  assert.ok(shows.every((s) => s.slug === 'sleepy-hollow'));
  // Two shows on the 17th are two entries on the 17th, not one.
  assert.equal(shows.filter((s) => dayKey(s.data.start) === '2026-10-17').length, 2);
  // Each show exports as itself: timed, and no block across the run.
  for (const s of shows) assert.equal(exportWhen(s).allDay, false);
  // A show's own note rides on that show alone.
  assert.equal(shows[0]!.data.timeNote, '7 pm; sold out');
  assert.equal(shows[1]!.data.timeNote, undefined);
});

test('the next show is the one a reader can still go to', () => {
  // Saturday the 17th at 3 pm. The matinee gave no end time, so like any
  // listing without one it stays up for the rest of its day: it, the evening
  // show and the 24th are what is left.
  const sat = at('2026-10-17T15:00');
  assert.equal(nextOccurrence(production, sat).data.start.getTime(), at('2026-10-17T13:00').getTime());
  const left = upcoming(occurrences([production], { now: sat }), { now: sat });
  assert.equal(left.length, 3);
  assert.equal(nextOccurrence(production, at('2026-10-18T10:00')).data.start.getTime(), at('2026-10-24T19:00').getTime());
});

test('a production is over after its closing show, not after opening night', () => {
  assert.equal(finalDay(production), '2026-10-24');
  assert.equal(isPast(production, at('2026-10-10T08:00')), true, 'opening night alone is over');
  assert.equal(isOver(production, at('2026-10-10T08:00')), false, 'the run is not');
  assert.equal(isOver(production, at('2026-10-24T23:00')), false, 'closing day still counts');
  assert.equal(isOver(production, at('2026-10-25T00:30')), true);
});

test('a weekly repeat is over after its last week', () => {
  const trivia = {
    slug: 'trivia',
    data: { title: 'Trivia', start: at('2026-09-22T18:30'), end: at('2026-09-22T20:30'), allDay: false, repeat: 'weekly' as const, until: at('2026-12-15') },
  };
  assert.equal(finalDay(trivia), '2026-12-15');
  assert.equal(isOver(trivia as never, at('2026-10-09T12:00')), false, 'running to December');
  assert.equal(isOver(trivia as never, at('2026-12-16T00:01')), true);
  // A one-off is over the day after its day, whatever time it ended:
  // the page and the sitemap ask this by the Denver day.
  const barre = { slug: 'barre', data: { title: 'barre3', start: at('2026-10-08T11:00'), end: at('2026-10-08T11:45'), allDay: false } };
  assert.equal(isOver(barre as never, at('2026-10-08T13:00')), false);
  assert.equal(isOver(barre as never, at('2026-10-09T00:00')), true);
});

test('two shows on one day get calendar UIDs and files of their own', () => {
  const [matinee, evening] = occurrences([production], { now: at('2026-10-17T08:00') }).filter((s) => dayKey(s.data.start) === '2026-10-17');
  assert.equal(showKey(matinee!.data.start), '20261017T1300');
  assert.notEqual(occurrenceUid('sleepy-hollow', matinee!.data, 'x.com'), occurrenceUid('sleepy-hollow', evening!.data, 'x.com'));
  // Everything else keeps its day-based UID, so subscribers see no churn.
  assert.equal(occurrenceUid('fair', { start: at('2026-10-17T10:00') }, 'x.com'), 'fair-2026-10-17@x.com');
});

test('the schema holds a production to its performances', () => {
  const bad = (extra: Record<string, unknown>) =>
    !schema.safeParse({ ...base, start: '2026-10-09T19:00', performances: ['2026-10-09T19:00', '2026-10-10T19:00'], ...extra }).success;
  assert.ok(bad({ start: '2026-10-08T19:00' }), 'start must be the first show');
  assert.ok(bad({ performances: ['2026-10-09T19:00', '2026-10-09T19:00'] }), 'each show once');
  assert.ok(bad({ performances: ['2026-10-09T19:00', '2026-10-08T19:00'] }), 'in order');
  assert.ok(bad({ performances: ['2026-10-09T19:00', '2026-10-10'] }), 'every show has its time');
  assert.ok(bad({ allDay: true }), 'not all day');
  assert.ok(bad({ timeNote: 'Fri 7 pm' }), 'the times are the performances');
  assert.ok(bad({ recurring: 'Nine shows' }), 'a production is not a regular');
  assert.ok(bad({ end: '2026-10-24T21:00' }), 'end closes the first show, not the run');
  assert.ok(!bad({ end: '2026-10-09T20:30' }), 'a first show’s end sets every show’s length');
});
