/**
 * The home page's What's happening tabs (src/lib/home-tabs.ts): five rows a
 * tab from the same week the email and the events page read, the weekend as
 * three days in one list, the default tab by the Denver weekday.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultTab, DONT_MISS_DAYS, dontMiss, homeTabs, labelGames, laterRows, NEXT_LIMIT, nextAfter, nextRank, pickRows, TAB_DAYS_AHEAD, TAB_LIMIT, tabEditions, tabRank } from '../src/lib/home-tabs.ts';
import { asOfFor } from '../src/lib/relative-days.ts';
import { listedAsEvent, weekDays } from '../src/lib/flagship-home.ts';
import { agenda, FILL_BELOW, fillTest } from '../src/lib/events.ts';
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

test('a canceled listing keeps its line while there is room, gives up its slot on a full tab, and is not one of the rest', () => {
  // Erie's weekend, 3 November 2026: a canceled shadow-puppetry workshop held one of five slots.
  const now = at('2026-10-27T09:00');
  const row = (slug: string, time: string, extra: Record<string, unknown> = {}) => ({ ...weekDays({ events: [ev(slug, `2026-10-27T${time}`, extra)], now, start: 'today', limit: 99 })[0]!.items[0]!, dayWord: '', dayKey: '2026-10-27' });
  const off = row('workshop', '08:00', { status: 'canceled' });
  assert.equal(off.status, 'canceled');
  const full = pickRows([off, row('a', '09:00'), row('b', '10:00'), row('c', '11:00'), row('d', '12:00'), row('e', '13:00'), row('f', '14:00')]);
  assert.deepEqual(full.rows.map((r) => r.fullTitle), ['a', 'b', 'c', 'd', 'e']);
  assert.equal(full.more, 1, 'the one listing still on, not the canceled one');
  const room = pickRows([off, row('a', '09:00'), row('b', '10:00')]);
  assert.deepEqual(room.rows.map((r) => r.fullTitle), ['workshop', 'a', 'b'], 'with room, the cancellation is news worth a line, in clock order');
  assert.equal(room.more, 0);
});

test('"Don\'t miss" is the next featured listing within three weeks, still on and not over', () => {
  const now = at('2026-11-07T09:00');
  const evening = ev('enchanted-evening', '2026-11-27T18:00', { featured: true, end: at('2026-11-27T21:00') });
  const parade = ev('holiday-parade', '2026-11-28T11:00', { featured: true });
  const band = ev('band', '2026-11-08T19:00');
  assert.equal(dontMiss([parade, band, evening], now)?.slug, 'enchanted-evening', 'the earliest featured one, not the earliest listing');
  assert.equal(dontMiss([band], now), undefined, 'nothing featured: no card');
  const later = ev('far-off', '2026-12-20T10:00', { featured: true });
  assert.equal(dontMiss([later], now), undefined, `more than ${DONT_MISS_DAYS} days out: not yet`);
  const called = ev('called-off', '2026-11-14T10:00', { featured: true, status: 'canceled' });
  assert.equal(dontMiss([called, evening], now)?.slug, 'enchanted-evening', 'a canceled one is skipped');
  assert.equal(dontMiss([evening], at('2026-11-27T21:00')), undefined, 'gone at its end');
  assert.equal(dontMiss([evening], at('2026-11-27T20:00'))?.slug, 'enchanted-evening', 'still on an hour before its end');
});

test('a game on the tabs names the school and says home or away where no venue does', () => {
  const now = at('2026-11-07T08:00');
  const sports = {
    generated: '2026-11-07',
    sports: [{ key: 'volleyball', name: 'Volleyball', results: [], upcoming: [{ date: '2026-11-07', opponent: 'Fruita Monument', site: 'home', time: '10:00' }] }],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const days = weekDays({ events: [], sports: sports as any, teamHref: () => '/sports/volleyball/', now, start: 'today', limit: 99 });
  const game = labelGames(days, 'Niwot').flatMap((d) => d.items).find((i) => i.kind === 'game')!;
  assert.equal(game.title, 'Niwot volleyball vs Fruita Monument');
  assert.equal(game.where, 'Home');
  // The week the email and the events page read is not changed.
  assert.equal(days.flatMap((d) => d.items).find((i) => i.kind === 'game')!.title, 'Volleyball vs Fruita Monument');
});

test('the tabs are built for the build’s day and the two after, and the reader’s day picks the set: Leadville at 1:39 am on a page built the day before', () => {
  // Built on Monday 9 November; read early on Tuesday the 10th. "Today" was
  // Monday's rows, all pruned, and Tuesday's listing sat under Tomorrow.
  const now = at('2026-11-09T04:10');
  const events = [ev('monday-talk', '2026-11-09T18:00'), ev('tuesday-council', '2026-11-10T18:00'), ev('wednesday-parade', '2026-11-11T10:00')];
  const editions = tabEditions((asOf) => homeTabs(weekDays({ events, now: asOf, start: 'today', limit: 99 }), asOf), now);
  assert.deepEqual(editions.map((e) => e.asOf), ['2026-11-09', '2026-11-10', '2026-11-11']);
  assert.equal(editions.length, TAB_DAYS_AHEAD + 1);
  const today = (asOf: string) => editions.find((e) => e.asOf === asOf)!.tabs[0]!.rows.map((r) => r.fullTitle);
  const keys = editions.map((e) => e.asOf);
  assert.deepEqual(today(asOfFor(keys, '2026-11-09')!), ['monday-talk']);
  assert.deepEqual(today(asOfFor(keys, '2026-11-10')!), ['tuesday-council'], 'after midnight, Today is Tuesday');
  assert.deepEqual(editions[1]!.tabs[1]!.rows.map((r) => r.fullTitle), ['wednesday-parade'], 'and Tomorrow is Wednesday');
  assert.equal(asOfFor(keys, '2026-11-14'), '2026-11-11', 'a build older than its sets shows the last, which the pruning empties');
  assert.equal(asOfFor(keys, '2026-11-08'), '2026-11-09', 'a clock behind the build shows the build’s day');
});

test('regulars fill a quiet day and step back on a full one', () => {
  const now = at('2026-11-16T09:00');
  const row = (slug: string, time: string, series = false) => ({ ...weekDays({ events: [ev(slug, `2026-11-16T${time}`)], now, start: 'today', limit: 99 })[0]!.items[0]!, series, dayWord: '', dayKey: '2026-11-16' });
  const titles = (items: ReturnType<typeof row>[]) => pickRows(items).rows.map((r) => r.fullTitle);
  // Niwot on a Monday: nothing but the brewery's trivia and a food truck.
  assert.deepEqual(titles([row('trivia', '18:30', true), row('food-truck', '16:00', true)]), ['food-truck', 'trivia'], 'a day with no events shows its regulars');
  // One event: the regulars fill the list up to FILL_BELOW rows, no further.
  const quiet = [row('concert', '19:00'), row('trivia', '18:30', true), row('bingo', '17:00', true), row('open-mic', '20:00', true)];
  assert.deepEqual(titles(quiet), ['bingo', 'trivia', 'concert']);
  assert.equal(pickRows(quiet).rows.length, FILL_BELOW);
  assert.equal(pickRows(quiet).more, 1, 'the regular not shown is counted, and the link leads to it');
  // Three events: the regulars step back, though two slots of five are free.
  const full = [row('a', '09:00'), row('b', '10:00'), row('c', '11:00'), row('trivia', '18:30', true), row('bingo', '17:00', true)];
  assert.deepEqual(titles(full), ['a', 'b', 'c']);
  assert.equal(pickRows(full).more, 2);
});

test('what is a regular: the same thing every time, and the day’s food truck; not a meeting, a run or a one-off', () => {
  const mondays = ['2026-11-16', '2026-12-07', '2026-12-21'].map((d) => ev(`trivia-${d}`, `${d}T18:30`, { title: 'Trivia', venue: 'Fritz Family Brewers', category: 'other' }));
  const truck = ev('cruagh', '2026-11-14T12:00', { title: 'Cruagh Irish Food Truck', venue: 'Fritz Family Brewers', category: 'food' });
  const council = ['2026-11-17', '2026-12-01'].map((d) => ev(`council-${d}`, `${d}T19:00`, { title: 'Town Board', category: 'civic' }));
  const play = ['2026-11-12', '2026-11-13', '2026-11-14'].map((d) => ev(`play-${d}`, `${d}T19:00`, { title: 'Fall Play', category: 'arts' }));
  const concert = ev('concert', '2026-11-20T19:00', { title: 'Josh Blackburn Live', category: 'music' });
  const all = [...mondays, truck, ...council, ...play, concert];
  const isFill = fillTest(all);
  assert.ok(mondays.every(isFill), 'trivia on the first and third Mondays');
  assert.ok(isFill(truck), 'a food truck, though it is listed once');
  assert.ok(!council.some(isFill), 'a meeting twice a month is listed by date');
  assert.ok(!play.some(isFill), 'a play on three nights is a run');
  assert.ok(!isFill(concert), 'a band with a name');
  // "Further out" on the events page: the trivia once, at its next date.
  const later = agenda(all, { now: at('2026-11-01T09:00') }).later.map((e) => e.slug);
  assert.deepEqual(later.filter((s) => s.startsWith('trivia')), ['trivia-2026-11-16'], 'one row for the regular beyond the fortnight');
  assert.equal(later.filter((s) => s.startsWith('council')).length, 2, 'both meetings');
});

test('"Next in <Town>" names a regular once though it has a page per date', () => {
  const rows = laterRows(['2026-11-16', '2026-12-07', '2026-12-21'].map((d) => ev(`trivia-${d}`, `${d}T18:30`, { title: 'Trivia', category: 'other' })), undefined, () => true);
  assert.deepEqual(nextAfter(rows, '2026-11-10').map((r) => r.dayKey), ['2026-11-16']);
});

test('outings lead a tab; a library program and a meeting are shown only where they leave room, and under them', () => {
  const now = at('2026-11-13T05:00'); // a Friday
  const row = (slug: string, start: string, extra: Record<string, unknown> = {}) => {
    const day = weekDays({ events: [ev(slug, start, extra)], now, start: 'today', limit: 99 }).find((d) => d.items.length)!;
    return { ...day.items[0]!, dayWord: '', dayKey: day.key };
  };
  const library = { venue: 'Gunbarrel Library', category: 'other' };
  const music = { venue: 'The Wheel House', category: 'music' };
  const talk = row('great-decisions', '2026-11-13T10:00', library);
  const movie = row('classic-movies', '2026-11-15T14:00', library);
  const council = row('board-meeting', '2026-11-13T16:30');
  const bands = [row('maingrass', '2026-11-13T18:00', music), row('strangebyrds', '2026-11-13T19:00', music), row('starlight', '2026-11-14T19:00', music), row('mainjazz', '2026-11-15T17:30', music)];
  assert.equal(talk.program, true, 'a listing at a library is a program');
  assert.equal(bands[0]!.program, undefined);
  assert.equal(tabRank(talk), 2);
  assert.equal(tabRank(council), 2);
  assert.equal(tabRank(bands[0]!), 0);

  // Room for all: the four bands in clock order, then the programs and the meeting in clock order.
  const roomy = pickRows([talk, movie, council, ...bands], 7);
  assert.deepEqual(roomy.rows.map((r) => r.fullTitle), ['maingrass', 'strangebyrds', 'starlight', 'mainjazz', 'great-decisions', 'board-meeting', 'classic-movies']);

  // Five slots: the Friday morning talk is in, under the bands; the rest wait behind "more".
  const five = pickRows([talk, movie, council, ...bands]);
  assert.deepEqual(five.rows.map((r) => r.fullTitle), ['maingrass', 'strangebyrds', 'starlight', 'mainjazz', 'great-decisions']);
  assert.equal(five.more, 2);

  // A full weekend of outings: no program takes a slot from one.
  const full = pickRows([talk, movie, ...bands, row('market', '2026-11-14T09:00', { venue: 'Cottonwood Square', category: 'market' }), row('craft-fair', '2026-11-14T12:00', { venue: 'Niwot Hall', category: 'arts' })]);
  assert.deepEqual(full.rows.map((r) => r.fullTitle), ['maingrass', 'strangebyrds', 'market', 'craft-fair', 'starlight']);

  // Nothing else on: the library's program is the day, and leads it.
  assert.deepEqual(pickRows([talk]).rows.map((r) => r.fullTitle), ['great-decisions']);
});

test('a game the guide also lists as an event is one row, the listing, until it is played', () => {
  const now = at('2026-11-10T09:00');
  const playoff = ev('roosevelt-football-4a-playoffs-second-round-2026-11-13', '2026-11-13T19:00', { title: 'Roosevelt football vs Montbello: 4A playoffs, second round', venue: 'Roosevelt High School', category: 'sports' });
  const band = ev('band', '2026-11-13T20:00', { title: 'A band', venue: 'A bar', category: 'music' });
  const game = (extra: Record<string, unknown> = {}) => ({ id: 'g1', date: '2026-11-13', time: '19:00', opponent: 'Montbello', site: 'home', stage: 'State Football Playoffs', ...extra });
  const sports = (g: Record<string, unknown>, upcoming = true) => ({ sports: [{ key: 'football', name: 'Football', results: upcoming ? [] : [g], upcoming: upcoming ? [g] : [] }] }) as never;
  assert.equal(listedAsEvent(game(), [playoff]), true);
  assert.equal(listedAsEvent(game(), [band]), false, 'another listing that day is not the game');
  assert.equal(listedAsEvent(game({ opponent: 'Mead' }), [playoff]), false, 'another opponent');
  assert.equal(listedAsEvent(game({ result: 'W' }), [playoff]), false, 'played: the row has the result');
  const friday = (s: never, events: unknown[]) => weekDays({ events: events as never[], sports: s, now, start: 'today', limit: 99 }).find((d) => d.key === '2026-11-13')!.items;
  assert.deepEqual(friday(sports(game()), [playoff, band]).map((i) => i.kind), ['event', 'event'], 'the listing and the band; the game row is not repeated');
  assert.deepEqual(friday(sports(game()), [band]).map((i) => i.kind), ['game', 'event'], 'with no listing of its own, the game row is the game');
});
