/**
 * The re-check's judgement (scripts/lib/recheck.ts): what counts as the
 * source confirming a listing, what counts as a change, and what it will not
 * decide on its own.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import type { FeedEvent } from '../scripts/lib/feeds/types.ts';
import { dateRegex, jsonLdEvents, judgeFeed, judgePage, occurrences, pageText, timeRegex, type RecheckEvent } from '../scripts/lib/recheck.ts';

const at = (s: string) => parseLocal(s);
const event = (over: Partial<RecheckEvent> = {}): RecheckEvent => ({
  slug: 'pints-and-pages-2026-11-11',
  title: 'Pints & Pages book club',
  start: at('2026-11-11T18:00'),
  end: at('2026-11-11T19:00'),
  allDay: false,
  status: 'scheduled',
  url: 'https://lyons.librarycalendar.com/event/pints-pages-book-club-mainstage-brewing-11082',
  source: 'https://lyons.librarycalendar.com/event/pints-pages-book-club-mainstage-brewing-11082',
  ...over,
});
const item = (over: Partial<FeedEvent> = {}): FeedEvent => ({
  uid: '11082',
  title: 'Pints & Pages Book Club at MainStage Brewing',
  start: at('2026-11-11T18:00'),
  end: at('2026-11-11T19:00'),
  allDay: false,
  url: 'https://lyons.librarycalendar.com/event/pints-pages-book-club-mainstage-brewing-11082',
  categories: [],
  status: 'confirmed',
  ...over,
});

test('a weekly repeat has one occurrence per week inside the window, none past until', () => {
  const e = event({ start: at('2026-09-22T19:00'), end: undefined, repeat: 'weekly', until: at('2026-10-27') });
  const days = occurrences(e, at('2026-10-17'), at('2026-10-31')).map((d) => d.toISOString());
  assert.deepEqual(days, [at('2026-10-20T19:00').toISOString(), at('2026-10-27T19:00').toISOString()]);
});

test('a one-off outside the window has no occurrence', () => {
  assert.deepEqual(occurrences(event(), at('2026-10-17'), at('2026-10-31')), []);
});

test('the day regex reads the ways pages write a date', () => {
  const re = dateRegex(at('2026-10-20T19:00'));
  for (const s of ['October 20, 2026', 'Oct. 20', 'Oct 20th', '20 October 2026', '10/20/2026', '10/20', '2026-10-20']) assert.ok(re.test(s), s);
  for (const s of ['October 2, 2026', 'October 200', 'November 20', '10/21']) assert.ok(!re.test(s), `not ${s}`);
});

test('the time regex reads the ways pages write a time: "6:00" and "6" are both six', () => {
  const seven = timeRegex(at('2026-10-20T19:00'));
  for (const s of ['7:00 PM', '7pm', '7 p.m.', '07:00 PM', '19:00', '7 PM', '7:00', 'Doors 7', 'at 7', 'from 7', '7-9pm', '7:00 – 9:30 PM', '7 to 9 p.m.']) assert.ok(seven.test(s), s);
  for (const s of ['7:00 AM', '17:00', '7:30 pm', '6 pm', 'table 7', '7 teams', '7:00 - 9:00 am', 'at 7 am']) assert.ok(!seven.test(s), `not ${s}`);
  const half = timeRegex(at('2026-10-20T18:30'));
  for (const s of ['6:30pm', '6:30', 'doors 6:30', '6:30-8pm']) assert.ok(half.test(s), s);
  for (const s of ['6 pm', '6:00', 'doors 6']) assert.ok(!half.test(s), `not ${s}`);
});

test('structured data is read out of a page', () => {
  const html = `<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"Event","name":"Pints & Pages Book Club","startDate":"2026-11-11T18:00:00-07:00","endDate":"2026-11-11T19:00:00-07:00","eventStatus":"https://schema.org/EventScheduled"}</script></head><body></body></html>`;
  assert.deepEqual(jsonLdEvents(html), [{ name: 'Pints & Pages Book Club', startDate: '2026-11-11T18:00:00-07:00', endDate: '2026-11-11T19:00:00-07:00', eventStatus: 'https://schema.org/EventScheduled' }]);
});

test('page text drops scripts and tags and decodes entities', () => {
  assert.equal(pageText('<p>Pints &amp; Pages<script>x()</script></p><div>6:00pm</div>'), 'Pints & Pages\n6:00pm');
});

const filler = ' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.';

test('a page whose structured data carries the day and the time confirms', () => {
  const html = `<script type="application/ld+json">{"@type":"Event","name":"Pints & Pages Book Club at MainStage Brewing","startDate":"2026-11-11T18:00:00-07:00"}</script><p>${filler}</p>`;
  const j = judgePage(event(), at('2026-11-11T18:00'), html);
  assert.equal(j.verdict, 'confirmed');
  assert.match(j.note, /6 pm on 11 November/);
});

test('structured data with another time is a change', () => {
  const html = `<script type="application/ld+json">{"@type":"Event","name":"Pints & Pages Book Club","startDate":"2026-11-11T19:00:00-07:00"}</script><p>${filler}</p>`;
  const j = judgePage(event(), at('2026-11-11T18:00'), html);
  assert.equal(j.verdict, 'changed');
  assert.match(j.note, /7 pm on 11 November, not 6 pm/);
});

test('visible text with the day and the time confirms; the day without the time does not decide', () => {
  const yes = judgePage(event(), at('2026-11-11T18:00'), `<p>Pints & Pages, Wednesday, November 11, 2026, 6:00 pm – 7:00 pm at MainStage.${filler}</p>`);
  assert.equal(yes.verdict, 'confirmed');
  const shrug = judgePage(event(), at('2026-11-11T18:00'), `<p>Pints & Pages, Wednesday, November 11, 2026, 7:30 pm at MainStage.${filler}</p>`);
  assert.equal(shrug.verdict, 'unconfirmed');
  assert.match(shrug.note, /not 6 pm \(times near it: 7:30 pm\)/);
});

test('a page with no readable text is unreadable, not unconfirmed', () => {
  assert.equal(judgePage(event(), at('2026-11-11T18:00'), '<div id="app"></div>').verdict, 'unreadable');
});

test('"Free" with no word of it on the source is an aside, never a confirmation of the price', () => {
  const j = judgePage(event({ cost: 'Free' }), at('2026-11-11T18:00'), `<p>Pints & Pages, November 11, 2026, 6:00 pm.${filler}</p>`);
  assert.equal(j.verdict, 'confirmed');
  assert.deepEqual(j.asides, ['the source does not say the event is free; cost should come off unless it does']);
  assert.deepEqual(judgePage(event({ cost: 'Free' }), at('2026-11-11T18:00'), `<p>Pints & Pages, November 11, 2026, 6:00 pm. Free.${filler}</p>`).asides, []);
});

test('the feed item on the day with the same times confirms', () => {
  const j = judgeFeed(event(), at('2026-11-11T18:00'), [item()], "the library's feed");
  assert.equal(j.verdict, 'confirmed');
});

test('the feed item at another time, or another end time, is a change', () => {
  assert.match(judgeFeed(event(), at('2026-11-11T18:00'), [item({ start: at('2026-11-11T18:30') })], 'the feed').note, /6:30 pm on 11 November, not 6 pm/);
  const end = judgeFeed(event(), at('2026-11-11T18:00'), [item({ end: at('2026-11-11T20:00') })], 'the feed');
  assert.equal(end.verdict, 'changed');
  assert.match(end.note, /6 pm–8 pm on 11 November; the listing ends 7 pm/);
});

test('a feed that carries the event on other days but not this one is a change; one that never names it is not', () => {
  const moved = judgeFeed(event(), at('2026-11-11T18:00'), [item({ start: at('2026-11-12T18:00'), end: at('2026-11-12T19:00') })], 'the feed');
  assert.equal(moved.verdict, 'changed');
  assert.match(moved.note, /on 12 November/);
  const short = judgeFeed(event(), at('2026-11-11T18:00'), [item({ title: 'Storytime', start: at('2026-11-01T10:00'), end: at('2026-11-01T11:00'), url: undefined })], 'the feed');
  assert.equal(short.verdict, 'unconfirmed');
  const past = judgeFeed(event(), at('2026-11-11T18:00'), [item({ title: 'Storytime', start: at('2026-11-20T10:00'), end: at('2026-11-20T11:00'), url: undefined })], 'the feed');
  assert.equal(past.verdict, 'unconfirmed');
  assert.match(past.note, /has nothing by this title/);
});

test('a cancelled feed item is a change', () => {
  assert.match(judgeFeed(event(), at('2026-11-11T18:00'), [item({ status: 'cancelled' })], 'the feed').note, /cancelled/);
});
