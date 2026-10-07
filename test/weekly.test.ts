/**
 * "This week in [Town]": which notes file is current, which New & closed
 * items still show, and which listings count as this weekend's. Every case
 * is one a reader would notice: last week's opening still up a month on, a
 * market listed at 3 pm that packed up at 1, a pick from a file dated for
 * next Monday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { occurrences } from '../src/lib/events.ts';
import { activeChanges, currentNotes, currentPick, hasEnded, isWeekend, upcomingEvents, weekEvents, weekWindow, weekendEvents } from '../src/lib/weekly.ts';

const at = (s: string) => parseLocal(s);

function notes(weekOf: string, pick?: { title?: string; body?: string; url?: string }, changes: Array<Record<string, unknown>> = []) {
  return {
    data: {
      weekOf: at(weekOf),
      pick: pick ? { title: pick.title || undefined, body: pick.body, url: pick.url } : undefined,
      changes: changes.map((c) => ({
        tag: c.tag as never,
        name: String(c.name ?? 'Place'),
        detail: String(c.detail ?? 'Detail'),
        source: c.source as string | undefined,
        checked: at(String(c.checked ?? '2026-10-13')),
        expires: c.expires ? at(String(c.expires)) : undefined,
      })),
    },
  };
}

function ev(title: string, start: string, end?: string, extra: Record<string, unknown> = {}) {
  return { slug: title.toLowerCase().replace(/\W+/g, '-'), data: { title, start: at(start), end: end ? at(end) : undefined, allDay: false, ...extra } };
}

// ----------------------------------------------------------------- the week

test('this week runs Monday to Sunday in Denver, from any day of it', () => {
  for (const day of ['2026-10-12T00:30', '2026-10-14T12:00', '2026-10-18T23:30']) {
    const { monday, sunday } = weekWindow(at(day));
    assert.equal(monday.getTime(), at('2026-10-12').getTime(), day);
    assert.equal(sunday.getTime(), at('2026-10-18').getTime(), day);
  }
  assert.equal(weekWindow(at('2026-10-19T06:00')).monday.getTime(), at('2026-10-19').getTime());
});

// ----------------------------------------------------------------- the pick

test('the current file is the latest weekOf on or before today; a file for next week waits', () => {
  const files = [notes('2026-10-05', { title: 'Last week' }), notes('2026-10-12', { title: 'This week' }), notes('2026-10-19', { title: 'Next week' })];
  assert.equal(currentNotes(files, at('2026-10-14'))?.data.pick?.title, 'This week');
  assert.equal(currentNotes(files, at('2026-10-12T00:10'))?.data.pick?.title, 'This week', 'from the first minute of Monday');
  assert.equal(currentNotes(files, at('2026-10-11T23:50'))?.data.pick?.title, 'Last week');
  assert.equal(currentNotes(files, at('2026-10-01')), undefined);
});

test('the pick comes only from the current week, and a blank title is no pick', () => {
  const files = [notes('2026-10-05', { title: 'Old pick', body: 'b' }), notes('2026-10-12', { title: '' })];
  assert.equal(currentPick(files, at('2026-10-14')), undefined, 'last week’s pick does not carry over');
  assert.deepEqual(currentPick(files, at('2026-10-07')), { title: 'Old pick', body: 'b', url: undefined });
  assert.equal(currentPick([], at('2026-10-14')), undefined, 'no file at all');
});

test('a file that failed its schema is skipped, not read', () => {
  const files = [{ data: { excluded: true as const } }, notes('2026-10-12', { title: 'Good' })];
  assert.equal(currentPick(files, at('2026-10-14'))?.title, 'Good');
});

// ---------------------------------------------------------- new and closed

test('every unexpired item from any week shows, newest check first', () => {
  const files = [
    notes('2026-10-05', undefined, [{ tag: 'closed', name: 'Old café', source: 'https://x.test/', checked: '2026-10-06' }]),
    notes('2026-10-12', undefined, [{ tag: 'opening', name: 'New bar', source: 'https://x.test/', checked: '2026-10-13' }]),
  ];
  assert.deepEqual(activeChanges(files, at('2026-10-14')).map((c) => c.name), ['New bar', 'Old café']);
});

test('an item hides after its expires date, by default 14 days after its file’s weekOf', () => {
  const files = [
    notes('2026-10-05', undefined, [
      { tag: 'closed', name: 'Default expiry', source: 'https://x.test/' },
      { tag: 'closed', name: 'Own expiry', source: 'https://x.test/', expires: '2026-10-15' },
    ]),
  ];
  const names = (day: string) => activeChanges(files, at(day)).map((c) => c.name);
  assert.deepEqual(names('2026-10-15T23:00'), ['Default expiry', 'Own expiry'], 'shows through the expires day itself');
  assert.deepEqual(names('2026-10-16'), ['Default expiry']);
  assert.deepEqual(names('2026-10-19T23:59'), ['Default expiry'], 'weekOf + 14 is October 19');
  assert.deepEqual(names('2026-10-20'), []);
});

test('an opening, closing, new-hours or move with no source is skipped; a guide addition needs none', () => {
  const files = [
    notes('2026-10-12', undefined, [
      { tag: 'opening', name: 'Unsourced opening' },
      { tag: 'new-hours', name: 'Unsourced hours' },
      { tag: 'moved', name: 'Sourced move', source: 'https://x.test/' },
      { tag: 'added-to-guide', name: 'Guide addition' },
    ]),
  ];
  assert.deepEqual(activeChanges(files, at('2026-10-14')).map((c) => c.name), ['Sourced move', 'Guide addition']);
});

test('added-to-guide is never labelled as an opening', () => {
  const files = [notes('2026-10-12', undefined, [{ tag: 'added-to-guide', name: 'Guide addition' }, { tag: 'opening', name: 'Opening', source: 'https://x.test/' }])];
  const labels = Object.fromEntries(activeChanges(files, at('2026-10-14')).map((c) => [c.name, c.label]));
  assert.equal(labels['Guide addition'], 'Added to the guide');
  assert.equal(labels['Opening'], 'Opening');
});

// ----------------------------------------------------------------- events

test('an event has ended once its end time has passed, or its start when it has none', () => {
  const timed = ev('Market', '2026-10-17T09:00', '2026-10-17T13:00');
  assert.equal(hasEnded(timed, at('2026-10-17T12:59')), false);
  assert.equal(hasEnded(timed, at('2026-10-17T13:00')), true, 'gone the minute it ends, not at midnight');
  const open = ev('Talk', '2026-10-17T19:00');
  assert.equal(hasEnded(open, at('2026-10-17T18:59')), false);
  assert.equal(hasEnded(open, at('2026-10-17T19:00')), true);
  const allDay = { ...ev('Fair', '2026-10-17'), data: { ...ev('Fair', '2026-10-17').data, allDay: true } };
  assert.equal(hasEnded(allDay, at('2026-10-17T23:59')), false, 'an all-day listing is on all day');
  assert.equal(hasEnded(allDay, at('2026-10-18T00:00')), true);
});

test('this weekend is Friday to Sunday, with a run that began earlier and is still on; nothing ended or canceled', () => {
  const events = [
    ev('Thursday thing', '2026-10-15T19:00', '2026-10-15T21:00'),
    ev('Friday show', '2026-10-16T19:30'),
    ev('Saturday market', '2026-10-17T09:00', '2026-10-17T13:00'),
    ev('Sunday walk', '2026-10-18T10:00'),
    ev('Monday meeting', '2026-10-19T18:00'),
    ev('Corn maze', '2026-09-25', '2026-10-31', { allDay: true }),
    ev('Called off', '2026-10-17T15:00', undefined, { status: 'canceled' }),
  ];
  assert.deepEqual(weekendEvents(events, at('2026-10-14T12:00')).map((e) => e.data.title), ['Corn maze', 'Friday show', 'Saturday market', 'Sunday walk']);
  assert.deepEqual(weekendEvents(events, at('2026-10-17T14:00')).map((e) => e.data.title), ['Corn maze', 'Sunday walk'], 'on Saturday afternoon the market has ended');
});

test('the rest of the week runs from today to Sunday, so a Wednesday is not told the week is quiet', () => {
  const events = [
    ev('Tuesday talk', '2026-10-13T19:00', '2026-10-13T21:00'),
    ev('Wednesday storytime', '2026-10-14T10:00', '2026-10-14T10:30'),
    ev('Thursday trivia', '2026-10-15T19:00', '2026-10-15T21:00'),
    ev('Saturday market', '2026-10-17T09:00', '2026-10-17T13:00'),
    ev('Monday meeting', '2026-10-19T18:00'),
    ev('Corn maze', '2026-09-25', '2026-10-31', { allDay: true }),
  ];
  assert.deepEqual(weekEvents(events, at('2026-10-14T08:00')).map((e) => e.data.title), ['Corn maze', 'Wednesday storytime', 'Thursday trivia', 'Saturday market']);
  assert.deepEqual(weekEvents(events, at('2026-10-14T12:00')).map((e) => e.data.title), ['Corn maze', 'Thursday trivia', 'Saturday market'], 'the storytime has ended by noon');
  assert.deepEqual(weekEvents(events, at('2026-10-17T14:00')).map((e) => e.data.title), ['Corn maze'], 'on Saturday afternoon only the run is left');
  assert.equal(isWeekend(at('2026-10-14T12:00')), false);
  assert.equal(isWeekend(at('2026-10-16T08:00')), true);
  assert.equal(isWeekend(at('2026-10-18T23:00')), true);
});

test('a weekly regular shows once, on its day this weekend', () => {
  const trivia = { ...ev('Trivia', '2026-09-04T19:00', '2026-09-04T21:00'), data: { ...ev('Trivia', '2026-09-04T19:00', '2026-09-04T21:00').data, repeat: 'weekly' as const, until: at('2026-12-18') } };
  const now = at('2026-10-14T12:00');
  const list = weekendEvents(occurrences([trivia], { now, horizonDays: 30 }), now);
  assert.equal(list.length, 1);
  assert.equal(list[0]!.data.start.getTime(), at('2026-10-16T19:00').getTime());
});

test('the strip under an article takes the next few that have not ended', () => {
  const events = [ev('Over', '2026-10-14T09:00', '2026-10-14T10:00'), ev('Soon', '2026-10-14T18:00'), ev('Later', '2026-10-20T18:00'), ev('Much later', '2026-11-20T18:00')];
  assert.deepEqual(upcomingEvents(events, { now: at('2026-10-14T12:00'), limit: 2 }).map((e) => e.data.title), ['Soon', 'Later']);
});
