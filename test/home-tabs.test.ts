/**
 * The home page's What's happening tabs (src/lib/home-tabs.ts): five rows a
 * tab from the same week the email and the events page read, the weekend as
 * three days in one list, the default tab by the Denver weekday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTab, homeTabs, laterRows, NEXT_LIMIT, nextAfter, nextRank, pickRows, TAB_LIMIT } from '../src/lib/home-tabs.ts';
import { weekDays } from '../src/lib/flagship-home.ts';
import { parseLocal } from '../src/lib/dates.ts';

const at = (s: string) => parseLocal(s);
const ev = (slug: string, start: string, extra: Record<string, unknown> = {}) => ({
  slug,
  data: { title: slug, start: at(start), venue: 'Town Hall', category: 'civic', allDay: false, ...extra },
});

test('the default tab is Today on a weekday and This weekend from Friday to Sunday', () => {
  assert.equal(defaultTab(at('2026-10-27T09:00')), 'today', 'a Tuesday');
  assert.equal(defaultTab(at('2026-10-29T23:30')), 'today', 'a Thursday night');
  assert.equal(defaultTab(at('2026-10-30T06:00')), 'weekend', 'a Friday');
  assert.equal(defaultTab(at('2026-11-01T12:00')), 'weekend', 'a Sunday at noon');
  assert.equal(defaultTab(at('2026-11-01T16:59')), 'weekend', 'a Sunday before five');
  assert.equal(defaultTab(at('2026-11-01T17:00')), 'tomorrow', 'a Sunday evening: the weekend is over, Tomorrow opens');
  assert.equal(defaultTab(at('2026-11-01T20:00')), 'tomorrow', 'a Sunday night');
});

test('today and tomorrow are their own days; the weekend is Friday to Sunday in one list with the day before the time', () => {
  const now = at('2026-10-27T09:00'); // a Tuesday
  const events = [
    ev('council', '2026-10-27T18:00'),
    ev('storytime', '2026-10-28T10:30'),
    ev('market', '2026-10-31T09:00'),
    ev('concert', '2026-10-30T19:00'),
    ev('brunch', '2026-11-01T10:00'),
    ev('monday-thing', '2026-11-02T09:00'),
  ];
  const days = weekDays({ events, now, start: 'today', limit: 99 });
  const [today, tomorrow, weekend] = homeTabs(days, now);
  assert.deepEqual(today!.rows.map((r) => r.fullTitle), ['council']);
  assert.equal(today!.rows[0]!.dayWord, '', 'a day of its own needs no day word');
  assert.deepEqual(tomorrow!.rows.map((r) => r.fullTitle), ['storytime']);
  assert.deepEqual(weekend!.rows.map((r) => `${r.dayWord} ${r.fullTitle}`), ['Fri concert', 'Sat market', 'Sun brunch'], 'Friday, Saturday, Sunday in order; Monday is not the weekend');
  assert.equal(weekend!.more, 0);
});

test('on a Saturday the weekend tab is the weekend under way, Saturday and Sunday, and Today is Saturday too', () => {
  const now = at('2026-10-31T08:00');
  const events = [ev('market', '2026-10-31T09:00'), ev('brunch', '2026-11-01T10:00'), ev('gone', '2026-10-30T19:00')];
  const days = weekDays({ events, now, start: 'today', limit: 99 });
  const [today, , weekend] = homeTabs(days, now);
  assert.deepEqual(today!.rows.map((r) => r.fullTitle), ['market']);
  assert.deepEqual(weekend!.rows.map((r) => r.fullTitle), ['market', 'brunch'], 'Friday night is over and off the list');
});

test('five rows a tab; the weekly series give up the slots first and the rest are counted', () => {
  const now = at('2026-10-27T09:00');
  const row = (slug: string, time: string, series = false) => ({ ...weekDays({ events: [ev(slug, `2026-10-27T${time}`)], now, start: 'today', limit: 99 })[0]!.items[0]!, series, dayWord: '', dayKey: '2026-10-27' });
  const items = [row('trivia', '19:00', true), row('a', '09:00'), row('b', '10:00'), row('c', '11:00'), row('d', '12:00'), row('e', '13:00'), row('yoga', '08:00', true)];
  const { rows, more } = pickRows(items);
  assert.equal(rows.length, TAB_LIMIT);
  assert.deepEqual(rows.map((r) => r.fullTitle), ['a', 'b', 'c', 'd', 'e'], 'the two regulars wait on the events page');
  assert.equal(more, 2);
});

test('an empty tab keeps its line and its link', () => {
  const now = at('2026-10-27T09:00');
  const [today, tomorrow, weekend] = homeTabs(weekDays({ events: [], now, start: 'today', limit: 99 }), now);
  assert.equal(today!.rows.length, 0);
  assert.equal(today!.empty, 'Nothing listed for today.');
  assert.equal(tomorrow!.empty, 'Nothing listed for tomorrow.');
  assert.equal(weekend!.href, '/this-weekend/');
});

test('an empty tab offers what is next after its days: Niwot on the Saturday afternoon of 31 October 2026', () => {
  // The Great Pumpkin Party (10 am to 2 pm) was the day's only listing; the
  // next were on Tuesday. The build of that morning still had the party on
  // Today; the browser took it off at 2 pm, so every tab carries its next.
  const now = at('2026-10-31T05:10');
  const events = [
    ev('great-pumpkin-party', '2026-10-31T10:00', { end: at('2026-10-31T14:00') }),
    ev('trivia-night', '2026-11-03T18:30'),
    ev('lid-meeting', '2026-11-03T19:00'),
    ev('election-day', '2026-11-03T07:00'),
    ev('trivia-night', '2026-11-10T18:30'),
    ev('line-dancing', '2026-11-05T18:45'),
  ];
  const days = weekDays({ events, now, start: 'today', limit: 99 });
  const [today, tomorrow, weekend] = homeTabs(days, now, TAB_LIMIT, laterRows(events));
  assert.deepEqual(today!.rows.map((r) => r.fullTitle), ['great-pumpkin-party']);
  assert.deepEqual(today!.next.map((r) => r.fullTitle), ['election-day', 'trivia-night', 'lid-meeting'], 'after today, nothing on Sunday or Monday: Tuesday, in the order of the clock');
  assert.equal(today!.next[0]!.dayWord, 'Tue, Nov 3', 'the date before the time, since the next may be any day');
  assert.deepEqual(tomorrow!.next.map((r) => r.fullTitle), today!.next.map((r) => r.fullTitle));
  assert.deepEqual(weekend!.next.map((r) => r.fullTitle), ['election-day', 'trivia-night', 'lid-meeting'], 'after Sunday');
  assert.ok(today!.next.every((r) => r.end && r.eventDay), 'the next rows carry the marks the pruning reads');
});

test('next: one row a listing, nothing called off, at most three, and only after the day', () => {
  const events = [
    ev('today-thing', '2026-10-27T18:00'),
    ev('trivia', '2026-10-28T18:30'),
    ev('trivia', '2026-11-04T18:30'),
    ev('canceled-show', '2026-10-29T19:00', { status: 'canceled' }),
    ev('market', '2026-10-31T09:00'),
    ev('concert', '2026-11-01T19:00'),
    ev('brunch', '2026-11-02T10:00'),
  ];
  const next = nextAfter(laterRows(events), '2026-10-27');
  assert.equal(next.length, NEXT_LIMIT);
  assert.deepEqual(next.map((r) => r.fullTitle), ['trivia', 'market', 'concert'], 'the weekly series once, the canceled show left out, today not repeated');
  assert.deepEqual(nextAfter([], '2026-10-27'), [], 'nothing on the calendar: nothing next, and the tab says only "Nothing listed"');
});

test('on the Sunday the weekend tab’s empty line says "Nothing more", not "yet"', () => {
  const weekend = (when: string) => homeTabs(weekDays({ events: [], now: at(when), start: 'today', limit: 99 }), at(when))[2]!;
  assert.equal(weekend('2026-10-31T09:00').empty, 'Nothing listed for the weekend yet.', 'a Saturday');
  assert.equal(weekend('2026-11-01T09:00').empty, 'Nothing more listed this weekend.', 'the Sunday');
  assert.equal(weekend('2026-11-03T09:00').empty, 'Nothing listed for the weekend yet.', 'a Tuesday, the coming weekend');
});

test('next on a thin day: the pick, then a festival, a market or music, then the civic calendar and the regulars, each in the order of the days', () => {
  // Johnstown on a Sunday night, 1 November 2026: in time order the next
  // three were Monday's storytime, a council meeting and Tuesday's storytime,
  // and the Parade of Lights was a page away.
  const events = [
    ev('storytime', '2026-11-02T10:30', { category: 'family' }),
    ev('council', '2026-11-02T19:00', { category: 'civic' }),
    ev('storytime', '2026-11-09T10:30', { category: 'family' }),
    ev('storytime', '2026-11-16T10:30', { category: 'family' }),
    ev('trivia', '2026-11-03T18:30', { category: 'food' }),
    ev('trivia', '2026-11-10T18:30', { category: 'food' }),
    ev('trivia', '2026-11-17T18:30', { category: 'food' }),
    ev('author-talk', '2026-11-05T18:00', { category: 'arts' }),
    ev('holiday-market', '2026-11-21T09:00', { category: 'market' }),
    ev('parade-of-lights', '2026-12-05T17:30', { category: 'festival' }),
    ev('tree-lighting', '2026-12-04T18:00', { category: 'festival' }),
  ];
  const weekly = (e: { slug: string }) => e.slug === 'storytime' || e.slug === 'trivia';
  const rows = laterRows(events, new Set(['holiday-market']), weekly);
  assert.deepEqual(nextAfter(rows, '2026-11-01').map((r) => r.fullTitle), ['holiday-market', 'author-talk', 'tree-lighting'], 'the pick first, then the one-off outings by date; the regulars and the meeting after');
  assert.deepEqual(nextAfter(rows, '2026-11-01', 6).map((r) => r.fullTitle), ['holiday-market', 'author-talk', 'tree-lighting', 'parade-of-lights', 'storytime', 'council'], 'then the rest in the order of the clock, a weekly series once');
  assert.equal(nextRank({ pick: true }), 0);
  assert.equal(nextRank({ category: 'music' }), 1);
  assert.equal(nextRank({ category: 'arts' }), 1);
  assert.equal(nextRank({ category: 'music', series: true }), 2, 'a weekly open mic is a regular');
  assert.equal(nextRank({ category: 'civic' }), 2);
  assert.equal(nextRank({ category: 'sports' }), 2);
  // Johnstown as built on 1 November 2026: three library one-offs this week
  // and the Jingle in December. The last slot is the Jingle's.
  const crafts = [
    ev('sugar-skulls', '2026-11-03T14:00', { category: 'family' }),
    ev('paint-n-sip', '2026-11-06T18:30', { category: 'arts' }),
    ev('journaling', '2026-11-07T10:00', { category: 'family' }),
    ev('jingle', '2026-12-06T14:00', { category: 'festival' }),
    ev('open-mic', '2026-11-04T19:00', { category: 'music' }),
    ev('open-mic', '2026-11-11T19:00', { category: 'music' }),
  ];
  const craftRows = laterRows(crafts, undefined, (e) => e.slug === 'open-mic');
  assert.deepEqual(nextAfter(craftRows, '2026-11-01').map((r) => r.fullTitle), ['sugar-skulls', 'paint-n-sip', 'jingle'], 'the next two outings and the next festival; the weekly open mic is a regular, not the festival');
  assert.deepEqual(nextAfter(craftRows, '2026-11-01', 1).map((r) => r.fullTitle), ['sugar-skulls'], 'one slot: the nearest');
  assert.deepEqual(nextAfter(craftRows.filter((r) => r.fullTitle !== 'jingle'), '2026-11-01').map((r) => r.fullTitle), ['sugar-skulls', 'paint-n-sip', 'journaling'], 'no festival listed: the three nearest');
  const civic = [ev('meeting', '2026-11-02T19:00'), ev('hearing', '2026-11-03T19:00'), ev('board', '2026-11-04T19:00')];
  assert.deepEqual(nextAfter(laterRows(civic), '2026-11-01').map((r) => r.fullTitle), ['meeting', 'hearing', 'board'], 'all of a kind: the order of the days, as before');
});
