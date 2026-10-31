/**
 * The home page's What's happening tabs (src/lib/home-tabs.ts): five rows a
 * tab from the same week the email and the events page read, the weekend as
 * three days in one list, the default tab by the Denver weekday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTab, homeTabs, laterRows, NEXT_LIMIT, nextAfter, pickRows, TAB_LIMIT } from '../src/lib/home-tabs.ts';
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
  assert.equal(defaultTab(at('2026-11-01T20:00')), 'weekend', 'a Sunday');
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
