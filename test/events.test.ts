/**
 * Event filtering: what counts as over, and which section of the weekend page
 * a listing belongs in.
 *
 * Every case here is one a reader would notice on the site — an all-day fair
 * still advertised the morning after, a ten-week theatre run vanishing from
 * the page, or "nothing is current" printed above a listing that is current.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import {
  eventEnd,
  isInProgress,
  isPast,
  lastDay,
  sectionCount,
  upcoming,
  weekendSections,
  weekendWindow,
} from '../src/lib/events.ts';

interface Fixture {
  data: { title: string; start: Date; end?: Date; allDay: boolean };
  slug: string;
}

/** A listing as the content collection would hand it over. */
function ev(title: string, start: string, end?: string, allDay = false): Fixture {
  return {
    slug: title.toLowerCase().replace(/\W+/g, '-'),
    data: { title, start: parseLocal(start), end: end ? parseLocal(end) : undefined, allDay },
  };
}

const at = (s: string) => parseLocal(s);
const titles = (list: Fixture[]) => list.map((e) => e.data.title);

// ---------------------------------------------------------------- over or not

test('a timed event is over once its end time has passed', () => {
  const e = ev('Concert', '2026-09-20T19:00', '2026-09-20T22:00');
  assert.equal(isPast(e, at('2026-09-20T12:00')), false);
  assert.equal(isPast(e, at('2026-09-20T23:00')), false, 'still today, so still listed for today');
  assert.equal(isPast(e, at('2026-09-21T00:01')), true);
});

test('a timed event with no end time is over the next day', () => {
  const e = ev('Council meeting', '2026-09-20T18:00');
  assert.equal(isPast(e, at('2026-09-20T23:59')), false);
  assert.equal(isPast(e, at('2026-09-21T00:01')), true);
});

test('an all-day event is not still advertised the morning after', () => {
  // The regression: eventEnd was the next midnight and isPast used "<", so a
  // one-day fair stayed "upcoming" for the whole of the following day.
  const fair = ev('Fall Festival', '2026-09-20', undefined, true);
  assert.equal(isPast(fair, at('2026-09-20T09:00')), false);
  assert.equal(isPast(fair, at('2026-09-20T23:59')), false);
  assert.equal(isPast(fair, at('2026-09-21T00:01')), true, 'over once the next day has started');
  assert.equal(isPast(fair, at('2026-09-21T09:00')), true);
});

test('a multi-day all-day run is live through its final day', () => {
  // Content stores `end` as the last day the thing is on.
  const run = ev('Scarecrow trail', '2026-10-17', '2026-10-31', true);
  assert.equal(isPast(run, at('2026-10-20T12:00')), false);
  assert.equal(isPast(run, at('2026-10-31T09:00')), false, 'you can still walk it on the 31st');
  assert.equal(isPast(run, at('2026-10-31T23:59')), false);
  assert.equal(isPast(run, at('2026-11-01T00:01')), true);
});

test('eventEnd is exclusive for all-day entries', () => {
  assert.equal(eventEnd(ev('One day', '2026-09-20', undefined, true)).toISOString(), '2026-09-21T06:00:00.000Z');
  assert.equal(eventEnd(ev('Run', '2026-10-17', '2026-10-31', true)).toISOString(), '2026-11-01T06:00:00.000Z');
});

test('over-ness survives a daylight-saving transition', () => {
  // Fall back is 2026-11-01; the day is 25 hours long.
  const e = ev('Halloween parade', '2026-10-31', undefined, true);
  assert.equal(isPast(e, at('2026-10-31T23:00')), false);
  assert.equal(isPast(e, at('2026-11-01T00:30')), true);

  // Spring forward is 2026-03-08; the day is 23 hours long.
  const spring = ev('Sugar house tour', '2026-03-07', undefined, true);
  assert.equal(isPast(spring, at('2026-03-07T23:00')), false);
  assert.equal(isPast(spring, at('2026-03-08T04:00')), true);
});

test('isInProgress spans the middle of a long run', () => {
  const run = ev('Les Misérables', '2026-09-10', '2026-11-15', true);
  assert.equal(isInProgress(run, at('2026-09-09T12:00')), false);
  assert.equal(isInProgress(run, at('2026-10-01T12:00')), true);
  assert.equal(isInProgress(run, at('2026-11-15T20:00')), true);
  assert.equal(isInProgress(run, at('2026-11-16T00:30')), false);
});

test('upcoming drops what is over and keeps what is not', () => {
  const list = [
    ev('Yesterday', '2026-09-19T10:00'),
    ev('Today', '2026-09-20T10:00'),
    ev('Tomorrow', '2026-09-21T10:00'),
    ev('Long run', '2026-09-10', '2026-11-15', true),
  ];
  assert.deepEqual(titles(upcoming(list, { now: at('2026-09-20T12:00') })), ['Long run', 'Today', 'Tomorrow']);
});

// -------------------------------------------------------------- weekend window

test('the weekend is the one you are standing in, not the next one', () => {
  const day = (d: string) => weekendWindow(at(d));
  // Thursday looks forward to Friday.
  assert.equal(day('2026-09-24T12:00').start.toISOString(), at('2026-09-25').toISOString());
  // Friday, Saturday and Sunday are already in it.
  assert.equal(day('2026-09-25T12:00').start.toISOString(), at('2026-09-25').toISOString());
  assert.equal(day('2026-09-26T12:00').start.toISOString(), at('2026-09-26').toISOString());
  assert.equal(day('2026-09-27T12:00').start.toISOString(), at('2026-09-27').toISOString());
  // Monday looks forward to the coming Friday, six days out.
  assert.equal(day('2026-09-21T12:00').start.toISOString(), at('2026-09-25').toISOString());
});

test('the weekend window ends at midnight opening Monday', () => {
  const { end, sunday } = weekendWindow(at('2026-09-24T12:00'));
  assert.equal(sunday.toISOString(), at('2026-09-27').toISOString());
  assert.equal(end.toISOString(), at('2026-09-28').toISOString());
});

test('a weekend window straddling a DST change is still three days', () => {
  // Friday 2026-10-30 through Sunday 2026-11-01, with the clocks going back.
  const { start, end } = weekendWindow(at('2026-10-30T12:00'));
  assert.equal(start.toISOString(), at('2026-10-30').toISOString());
  assert.equal(end.toISOString(), at('2026-11-02').toISOString());
});

// ------------------------------------------------------------- four sections

test('every live event lands in exactly one section', () => {
  const list = [
    ev('Over already', '2026-09-18T10:00'),
    ev('Running now', '2026-09-10', '2026-11-15', true),
    ev('Friday market', '2026-09-25T16:00', '2026-09-25T20:00'),
    ev('Sunday ride', '2026-09-27T09:00'),
    ev('Next Tuesday', '2026-09-29T18:00'),
  ];
  const s = weekendSections(list, { now: at('2026-09-24T12:00') });
  assert.deepEqual(titles(s.now), ['Running now']);
  assert.deepEqual(titles(s.weekend), ['Friday market', 'Sunday ride']);
  assert.deepEqual(titles(s.next), ['Next Tuesday']);
  assert.deepEqual(titles(s.continuing), []);
  assert.equal(sectionCount(s), 4, 'the finished event is not carried anywhere');
});

test('a run that began earlier is kept, not dropped', () => {
  // Partitioning on start date alone lost these: a ten-week run starting in
  // September is neither "this weekend" nor "next week".
  const list = [ev('Les Misérables', '2026-09-10', '2026-11-15', true)];
  const s = weekendSections(list, { now: at('2026-09-24T12:00') });
  assert.equal(sectionCount(s), 1);
  assert.deepEqual(titles(s.now), ['Les Misérables']);
});

test('"nothing is current" is false while anything is still running', () => {
  // The reported fault: the stale notice was decided from the dated day
  // groups alone, so a page carrying only a continuing run announced that
  // everything had already happened while displaying it.
  const s = weekendSections([ev('Les Misérables', '2026-09-10', '2026-11-15', true)], {
    now: at('2026-11-10T12:00'),
  });
  assert.equal(s.weekend.length, 0);
  assert.equal(s.next.length, 0);
  assert.ok(sectionCount(s) > 0, 'the page is not empty, so it must not say it is');
});

test('a genuinely empty window reports itself empty', () => {
  const s = weekendSections([ev('Long gone', '2026-01-04T10:00')], { now: at('2026-09-24T12:00') });
  assert.equal(sectionCount(s), 0);
});

test('events beyond the horizon are not shown as coming next week', () => {
  const s = weekendSections([ev('Christmas market', '2026-12-05T10:00')], { now: at('2026-09-24T12:00') });
  assert.equal(sectionCount(s), 0);
});

test('sections hold across midnight on the Friday of the weekend', () => {
  const list = [ev('Friday market', '2026-09-25T16:00', '2026-09-25T20:00')];
  const before = weekendSections(list, { now: at('2026-09-24T23:59') });
  assert.deepEqual(titles(before.weekend), ['Friday market']);
  const after = weekendSections(list, { now: at('2026-09-25T00:01') });
  assert.deepEqual(titles(after.weekend), ['Friday market'], 'still the weekend once Friday starts');
  const during = weekendSections(list, { now: at('2026-09-25T17:00') });
  assert.deepEqual(titles(during.now), ['Friday market'], 'under way, so it is happening now');
});

test('lastDay is the final day a listing is on, for the browser expiry pass', () => {
  assert.equal(lastDay(ev('Fair', '2026-09-20', undefined, true)), '2026-09-20');
  assert.equal(lastDay(ev('Trail', '2026-10-17', '2026-10-31', true)), '2026-10-31');
  assert.equal(lastDay(ev('Gig', '2026-09-20T19:00', '2026-09-20T22:00')), '2026-09-20');
  assert.equal(lastDay(ev('Meeting', '2026-09-20T18:00')), '2026-09-20');
  // A run ending after midnight belongs to the day it started, not the next.
  assert.equal(lastDay(ev('Late set', '2026-09-20T21:00', '2026-09-21T00:00')), '2026-09-20');
});
