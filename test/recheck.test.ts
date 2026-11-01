/**
 * The re-check's judgement (scripts/lib/recheck.ts): what counts as the
 * source confirming a listing, what counts as a change, and what it will not
 * decide on its own.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import type { FeedEvent } from '../scripts/lib/feeds/types.ts';
import { dateRegex, jsonLdEvents, judgeFeed, judgePage, occurrenceUrl, occurrences, pageText, sameTitle, timeRegex, type RecheckEvent } from '../scripts/lib/recheck.ts';

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

test('two same-named items on one day: the one at this time confirms, and the note names both when neither does', () => {
  // CSU's dance concert, 14 November 2026: a 2 pm matinee and a 7:30 pm show, each its own feed item; the file is the evening show.
  const matinee = item({ title: 'Pints & Pages', start: at('2026-11-11T14:00'), end: at('2026-11-11T15:00'), url: 'https://x.org/e/1' });
  const evening = item({ title: 'Pints & Pages', start: at('2026-11-11T18:00'), end: at('2026-11-11T19:00'), url: 'https://x.org/e/2' });
  const file = event({ url: undefined });
  const j = judgeFeed(file, at('2026-11-11T18:00'), [matinee, evening], 'the feed');
  assert.equal(j.verdict, 'confirmed', 'the 6 pm show, though the matinee comes first in the feed');
  assert.match(j.note, /6 pm/);
  const seven = judgeFeed(event({ url: undefined, start: at('2026-11-11T19:00'), end: at('2026-11-11T20:00') }), at('2026-11-11T19:00'), [matinee, evening], 'the feed');
  assert.equal(seven.verdict, 'changed');
  assert.match(seven.note, /at 2 pm and 6 pm on 11 November, not 7 pm/, 'both times, not the first one as the new time');
  // A production's file cites one show's page for every show: the time decides before the page.
  const cited = judgeFeed(event({ url: 'https://x.org/e/1' }), at('2026-11-11T18:00'), [matinee, evening], 'the feed');
  assert.equal(cited.verdict, 'confirmed', 'a file at 6 pm citing the matinee’s page is still the 6 pm show');
  // With no item at this time, the cited page decides.
  const pageOnly = judgeFeed(event({ url: 'https://x.org/e/1', start: at('2026-11-11T19:00'), end: at('2026-11-11T20:00') }), at('2026-11-11T19:00'), [matinee, evening], 'the feed');
  assert.match(pageOnly.note, /at 2 pm on 11 November, not 7 pm/);
});

test('a cancelled feed item is a change', () => {
  assert.match(judgeFeed(event(), at('2026-11-11T18:00'), [item({ status: 'cancelled' })], 'the feed').note, /cancelled/);
});

test("titles match on their own words, not the venue's", () => {
  assert.ok(sameTitle('Pints & Pages Book Club at MainStage Brewing', 'Pints & Pages book club', 'MainStage Brewing Company'));
  assert.ok(!sameTitle('Trivia Game (WayBack Bar)', 'Karaoke at the Wayback Bar', 'Wayback Bar (back of Wildcat Mountaineering)'));
  assert.ok(sameTitle('Old Time Jam (Oskar Blues)', 'Old-time jam at Oskar Blues', 'Oskar Blues Grill & Brew'));
});

test("a calendar that gives each date its own page is read at the page for the date checked", () => {
  assert.equal(occurrenceUrl('https://lyonsrecorder.org/event/old-time-jam/2026-10-28/', at('2026-11-25T18:00')), 'https://lyonsrecorder.org/event/old-time-jam/2026-11-25/');
  assert.equal(occurrenceUrl('https://lyonsrecorder.org/event/old-time-jam/2026-11-25/', at('2026-11-25T18:00')), 'https://lyonsrecorder.org/event/old-time-jam/2026-11-25/');
  assert.equal(occurrenceUrl('https://mainstagebrewing.com/music', at('2026-11-25T18:00')), 'https://mainstagebrewing.com/music');
});

// The false alarms of the first network-wide run (17 October 2026), each now a question for a person or a confirmation.

test('structured data for another date of a series is not a change', () => {
  const html = `<script type="application/ld+json">{"@type":"Event","name":"Cribbage Night","startDate":"2026-10-14T18:30:00-06:00"}</script><p>${filler}</p>`;
  const j = judgePage(event({ title: 'Cribbage Night', start: at('2026-11-11T18:30'), end: undefined }), at('2026-11-11T18:30'), html);
  assert.equal(j.verdict, 'unconfirmed');
  assert.match(j.note, /does not show 11 November; its structured data has "Cribbage Night" on 14 October/);
});

test('a matinee and an evening show on one day: the one at the listed time confirms', () => {
  const html = `<script type="application/ld+json">[{"@type":"TheaterEvent","name":"Mystic Pizza","startDate":"2026-10-17T14:00:00-06:00"},{"@type":"TheaterEvent","name":"Mystic Pizza","startDate":"2026-10-17T19:30:00-06:00"}]</script><p>${filler}</p>`;
  assert.equal(judgePage(event({ title: 'Mystic Pizza', start: at('2026-10-17T19:30'), end: undefined }), at('2026-10-17T19:30'), html).verdict, 'confirmed');
});

test('a structured-data time that is only the date (midnight), or the site clock in UTC, is not a change', () => {
  const midnight = `<script type="application/ld+json">{"@type":"Event","name":"Weekly beer release day","startDate":"2026-10-22T00:00:00-06:00"}</script><p>Weekly beer release day, October 22, 11 am.${filler}</p>`;
  assert.equal(judgePage(event({ title: 'Weekly beer release day', start: at('2026-10-22T11:00'), end: undefined }), at('2026-10-22T11:00'), midnight).verdict, 'confirmed');
  const utc = `<script type="application/ld+json">{"@type":"Event","name":"Trunk or Treat","startDate":"2026-10-25T07:00:00-06:00"}</script><p>${filler}</p>`;
  assert.notEqual(judgePage(event({ title: 'Trunk or Treat', start: at('2026-10-25T13:00'), end: undefined }), at('2026-10-25T13:00'), utc).verdict, 'changed');
});

test('"cancelled" counts only beside the event\'s own name', () => {
  const page = (s: string) => `<p>Halloween Haven, October 24, 2026, 5 pm at the park. ${s} ${filler}</p>`;
  assert.equal(judgePage(event({ title: 'Halloween Haven', start: at('2026-10-24T17:00'), end: undefined }), at('2026-10-24T17:00'), page('End of Summer Bash, August 15th, CANCELLED!')).verdict, 'confirmed');
  const off = judgePage(event({ title: 'Journey to the Heart of Zeppelin', start: at('2026-10-23T19:30'), end: undefined }), at('2026-10-23T19:30'), `<p>*CANCELLED* Dreamboat Annie presents Journey to the Heart of Zeppelin 10/23/26 at 7:30 pm. ${filler}</p>`);
  assert.equal(off.verdict, 'changed');
  assert.match(off.note, /CANCELLED/);
  // Erie's page: a past meeting cancelled, the one being checked listed as usual.
  const erie = `<p>Wednesday Aug 5, 2026 at 6:30 PM MDT Planning Commission Meeting - CANCELED Council Chambers. Wednesday Oct 21, 2026 at 6:30 PM MDT Planning Commission Meeting Council Chambers. ${filler}</p>`;
  assert.equal(judgePage(event({ title: 'Planning Commission', start: at('2026-10-21T18:30'), end: undefined }), at('2026-10-21T18:30'), erie).verdict, 'confirmed');
});

test("a meeting past the end of a town's feed is not missing from it", () => {
  const j = judgeFeed(event({ title: 'Town Board Meeting', start: at('2026-11-10T18:00'), end: undefined }), at('2026-11-10T18:00'), [item({ title: 'Town Board Meeting', start: at('2026-10-27T18:00'), end: undefined, url: undefined })], 'the town feed');
  assert.equal(j.verdict, 'unconfirmed');
  assert.match(j.note, /does not reach 10 November yet/);
});

// The call list (callReason): whom the re-check's report asks a person to ring.

import { callReason } from '../scripts/lib/recheck.ts';

const from = at('2026-10-18');
const call = (over: Partial<Parameters<typeof callReason>[0]>) =>
  callReason({ verdict: 'confirmed', note: '', level: 'confirmed', basis: 'source', from, ...over });

test('a listed event is a call whatever the page said: a community calendar alone, or a check gone stale', () => {
  assert.equal(call({ level: 'listed', basis: 'calendar', calendar: "the Lyons Recorder's community calendar", verdict: 'confirmed', note: 'still on the calendar' }), 'only on a community calendar');
  assert.equal(call({ level: 'listed', basis: 'stale', verdict: 'unconfirmed', note: 'the page does not show 20 October' }), 'check gone stale');
});

test('a page no machine could read, or that does not show the date, is a call; a feed that does not reach the date yet is not', () => {
  assert.equal(call({ verdict: 'unreadable', note: 'the source page: 403, a bot challenge or a refusal' }), 'page cannot be read');
  assert.equal(call({ verdict: 'unconfirmed', note: 'the page does not show 20 October' }), 'page does not show it');
  assert.equal(call({ verdict: 'unconfirmed', note: 'the Town feed does not reach 20 October yet' }), undefined);
  assert.equal(call({ verdict: 'confirmed', note: '"Trivia" at 7 pm on 20 October on the feed' }), undefined);
});

test('a venue a person has already confirmed is not rung again because its page refuses a machine', () => {
  for (const basis of ['phone', 'email', 'in-person'] as const) {
    assert.equal(call({ verdict: 'unreadable', note: 'the source page: 403', level: 'confirmed', basis }), undefined, basis);
    assert.equal(call({ verdict: 'unconfirmed', note: 'the page does not show 20 October', level: 'confirmed', basis }), undefined, basis);
  }
});

test('a weekly series about to run out of confirmed weeks is a call, even one confirmed by phone', () => {
  assert.equal(call({ until: at('2026-10-27'), level: 'confirmed', basis: 'phone' }), 'series shown only through 2026-10-27');
  assert.equal(call({ until: at('2026-11-20') }), undefined, 'three weeks of dates in hand is not yet a call');
});

// The call list's phone numbers (placeFor): which listing on the guide an event's venue is.

import { placeFor } from '../scripts/lib/recheck.ts';

const listings = (...titles: string[]) => titles.map((title) => ({ title }));
const placeOf = (venue: string, titles: string[], town: string) => placeFor(venue, listings(...titles), town)?.title;

test('a venue is the listing whose name it holds whole, or that holds it whole', () => {
  assert.equal(placeOf('Oskar Blues', ['A-Lodge Lyons', 'Oskar Blues Grill & Brew'], 'Lyons'), 'Oskar Blues Grill & Brew');
  assert.equal(placeOf('Lyons Regional Library, Effie Banta Room', ['Lyons Regional Library', 'Hall Ranch'], 'Lyons'), 'Lyons Regional Library');
  assert.equal(placeOf('Castorena’s Equine Center, The Ranch Events Complex', ['The Ranch Events Complex & Blue Arena'], 'Loveland'), 'The Ranch Events Complex & Blue Arena', 'a part between commas is a name of its own');
  assert.equal(placeOf('Erie Town Hall Council Chambers', ['Erie Community Center', 'Erie Town Hall (Lincoln School)'], 'Erie'), 'Erie Town Hall (Lincoln School)', 'a parenthesis is set aside');
});

test('one word in common is not a match: the call list would print the wrong number', () => {
  assert.equal(placeOf('Lyons Town Hall', ['Hall Ranch', 'A-Lodge Lyons'], 'Lyons'), undefined);
  assert.equal(placeOf('Harmony Library', ["Austin's American Grill, Harmony"], 'Fort Collins'), undefined);
  assert.equal(placeOf('Golden Community Center', ['Foothills Art Center'], 'Golden'), undefined);
  assert.equal(placeOf('Council Chambers, City Hall', ['City Park'], 'Fort Collins'), undefined);
});

test('a name left with one word matches only that word', () => {
  assert.equal(placeOf('Niwot Hall', ['Niwot Hall', 'Niwot Inn & Spa'], 'Niwot'), 'Niwot Hall');
  assert.equal(placeOf('Downtown Fort Collins', ['Downtown Transit Center (Transfort)'], 'Fort Collins'), undefined);
});

test('the closest fit wins when more than one listing holds the name', () => {
  assert.equal(placeOf('Windsor Town Hall', ['Severance Town Hall', 'Windsor Town Hall'], 'Windsor'), 'Windsor Town Hall');
  assert.equal(placeOf('Wildflower Pavilion, Planet Bluegrass', ['Planet Bluegrass', 'Wildflower Pavilion, Planet Bluegrass'], 'Lyons'), 'Wildflower Pavilion, Planet Bluegrass');
});
