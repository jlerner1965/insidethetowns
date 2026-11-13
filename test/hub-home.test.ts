/**
 * The hub's home page (src/lib/hub-home.ts), on the redesign of 13 November
 * 2026 (docs/design/hub-home-mockup.html): the season's count, the
 * weekend's one listing a day and Friday's game, every row's check line in
 * its guide's words, the guides' index, and the page's palette.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HUB_HOME } from '../src/config/palette.ts';
import type { SportData, SportGame } from '../src/config/school-sports.ts';
import type { TraditionRecord } from '../src/lib/traditions.ts';
import { parseLocal } from '../src/lib/dates.ts';
import {
  GUIDE_LINES,
  annualRecordFor,
  changeSourceText,
  deadlineListings,
  deadlineSourceText,
  deadlineTitle,
  durationWords,
  fridayGame,
  gameReasons,
  gameRow,
  guideLine,
  guideName,
  listingReasons,
  newsItems,
  nextLine,
  numberWord,
  ordinal,
  pickDeadline,
  provenanceText,
  searchSuggestions,
  seasonFeatureLine,
  seasonsNow,
  sportsSourceText,
  storySourceText,
  townsConfirmed,
  weekendDays,
  weekendPicks,
} from '../src/lib/hub-home.ts';

test('the feature counts towns, not dates: a town with two rows is one town', () => {
  const counts = townsConfirmed([
    { town: 'Estes Park', confirmed: true },
    { town: 'Estes Park', confirmed: false },
    { town: 'Lyons', confirmed: false },
    { town: 'Berthoud', confirmed: true },
    { confirmed: true },
  ]);
  assert.deepEqual(counts, { confirmed: 2, towns: 3, canceled: 0 });
  assert.deepEqual(townsConfirmed([{ town: 'A', confirmed: true }, { town: 'Wellington', confirmed: false, canceled: true }]), { confirmed: 1, towns: 1, canceled: 1 });
  assert.equal(seasonFeatureLine({ confirmed: 19, towns: 19, canceled: 1 }), '19 of 19 towns’ dates confirmed, 1 canceled.');
});

test('the feature line reads "19 of 20 towns’ dates confirmed."', () => {
  assert.equal(seasonFeatureLine({ confirmed: 19, towns: 20 }), '19 of 20 towns’ dates confirmed.');
  assert.equal(seasonFeatureLine({ confirmed: 1, towns: 1 }), '1 of 1 town’s dates confirmed.');
});

test('the search suggestions are every name once, A to Z', () => {
  assert.deepEqual(searchSuggestions([{ name: 'Lyons' }, { name: 'Berthoud' }], [{ name: 'Berthoud' }, { name: 'Estes Park' }]), ['Berthoud', 'Estes Park', 'Lyons']);
});

test('the registration deadline is the soonest that closes, else the soonest that opens, else nothing', () => {
  const d = (what: 'opens' | 'closes', on: string) => ({ what, on: new Date(`${on}T12:00:00-07:00`) });
  assert.deepEqual(pickDeadline([d('opens', '2026-11-15'), d('closes', '2026-11-20'), d('closes', '2026-11-18')]), d('closes', '2026-11-18'));
  assert.deepEqual(pickDeadline([d('opens', '2026-11-25'), d('opens', '2026-11-15')]), d('opens', '2026-11-15'));
  assert.equal(pickDeadline([]), undefined);
});

test('counts are words up to twelve, digits after', () => {
  assert.equal(numberWord(7), 'seven');
  assert.equal(numberWord(6), 'six');
  assert.equal(numberWord(13), '13');
});

test('a guide named for its town adds the towns it covers; one named for a region keeps its name', () => {
  assert.equal(guideName({ slug: 'windsor', name: 'Windsor' }, ['Severance']), 'Windsor and Severance');
  assert.equal(guideName({ slug: 'carbon-valley', name: 'Carbon Valley' }, ['Frederick', 'Firestone', 'Dacono']), 'Carbon Valley');
  assert.equal(guideName({ slug: 'lyons', name: 'Lyons' }, []), 'Lyons');
});

test('every guide has its line, and a new guide shows its short tagline', () => {
  assert.equal(guideLine({ slug: 'niwot', tagline: 'x' }), 'Second Avenue, the LoBo Trail, Cougars scores');
  assert.equal(guideLine({ slug: 'new-town', shortTagline: 'A new guide', tagline: 'x' }), 'A new guide');
  assert.equal(Object.keys(GUIDE_LINES).length, 7);
});

test('an event’s check line is its own page’s, without the full stop', () => {
  const verified = parseLocal('2026-11-11');
  const checked = (date: string) => `Checked ${date}`;
  assert.equal(provenanceText({ data: { verified, source: 'https://www.chsaanow.com/x' } }, checked), 'Checked November 11, 2026 against chsaanow.com');
  assert.equal(
    provenanceText({ data: { verified, source: 'https://oskarblues.com/e' }, confidence: { line: 'Confirmed by phone with Oskar Blues on November 11, 2026.' } }, checked),
    'Confirmed by phone with Oskar Blues on November 11, 2026. Listing: oskarblues.com',
  );
  assert.equal(provenanceText({ data: {} }, checked), undefined);
});

test('a deadline’s and a change’s lines are their guide pages’', () => {
  const verified = parseLocal('2026-11-11');
  assert.equal(deadlineSourceText({ verified, source: 'https://berthoudhistoricalsociety.org/e' }), 'Checked Nov 11, 2026 against berthoudhistoricalsociety.org');
  assert.equal(deadlineSourceText({ source: 'https://cvprd.com/swim' }), 'Source: cvprd.com');
  assert.equal(deadlineSourceText({ verified }), undefined);
  assert.equal(changeSourceText({ verified, source: 'https://www.frederickco.gov/x', sourceLabel: 'Town of Frederick' }), 'Source: Town of Frederick, read Nov 11, 2026');
  assert.equal(deadlineTitle('The program', { data: { title: 'Holiday Card Art Contest: artwork due' } }), 'Holiday Card Art Contest');
  assert.equal(deadlineTitle('The program'), 'The program');
});

test('a game’s line is its sports page’s', () => {
  const team = { fetched: '2026-11-11T19:47:32.243Z' };
  assert.equal(sportsSourceText(team, {}), 'Scores and schedules from MaxPreps, read Nov 11, 2026');
  assert.equal(sportsSourceText(team, {}, true), 'Scores from MaxPreps, read Nov 11, 2026; dates checked against the school calendar');
  assert.equal(sportsSourceText(team, { chsaa: { url: 'u', read: '2026-11-09' } }), 'Scores and schedules from MaxPreps, read Nov 11, 2026; postseason games from CHSAA’s bracket, read Nov 9, 2026');
});

test('the weekend is Friday to Sunday, the coming one on a weekday and the one under way on a Saturday or Sunday', () => {
  const keys = (iso: string) => weekendDays(new Date(iso)).map((d) => d.key);
  assert.deepEqual(keys('2026-11-11T15:00:00Z'), ['2026-11-13', '2026-11-14', '2026-11-15']);
  assert.deepEqual(keys('2026-11-14T15:00:00Z'), ['2026-11-13', '2026-11-14', '2026-11-15']);
  assert.deepEqual(keys('2026-11-15T15:00:00Z'), ['2026-11-13', '2026-11-14', '2026-11-15']);
  assert.deepEqual(keys('2026-11-16T15:00:00Z'), ['2026-11-20', '2026-11-21', '2026-11-22']);
});

type Extra = { category?: string; featured?: boolean; level?: 'confirmed' | 'listed'; repeat?: 'weekly'; until?: string; status?: string; slug?: string };

/** A listing as the hub's pages hand it over: with its town and its confidence (src/lib/content.ts). */
function ev(town: string, title: string, start: string, { category = 'arts', featured = false, level = 'confirmed', repeat, until, status = 'scheduled', slug }: Extra = {}) {
  return {
    slug: slug ?? title.toLowerCase().replace(/\W+/g, '-'),
    town: { slug: town },
    confidence: { level, basis: 'source' as const },
    data: {
      title,
      venue: 'The hall',
      start: parseLocal(start),
      allDay: false,
      category,
      featured,
      status,
      repeat,
      until: until ? parseLocal(until) : undefined,
    },
  } as unknown as Parameters<typeof weekendPicks>[0][number];
}

const now = new Date('2026-11-12T15:00:00Z');
const days = weekendDays(now);

test('one listing a day, never two from one town, and none from a town Friday’s game has', () => {
  const picks = weekendPicks(
    [
      ev('erie', 'Nutcracker excerpts', '2026-11-14T10:30'),
      ev('erie', 'Erie market', '2026-11-15T10:00', { category: 'market' }),
      ev('carbon-valley', 'Harvest and Holly Market', '2026-11-15T11:00', { category: 'market' }),
      ev('johnstown', 'Johnstown concert', '2026-11-14T19:00', { category: 'music' }),
    ],
    days.slice(1),
    { now, taken: new Set(['johnstown']) },
  );
  assert.deepEqual([...picks].map(([day, e]) => [day, e.data.title]), [
    ['2026-11-14', 'Nutcracker excerpts'],
    ['2026-11-15', 'Harvest and Holly Market'],
  ]);
});

test('only what the organizer has confirmed, and never a regular, a civic meeting, a canceled date or a deadline', () => {
  const deadline = ev('berthoud', 'Holiday Card Art Contest: artwork due', '2026-11-14T00:00', { slug: 'art-due' });
  const picks = weekendPicks(
    [
      ev('lyons', 'From a community calendar', '2026-11-14T09:00', { level: 'listed' }),
      ev('niwot', 'Board meeting', '2026-11-14T09:00', { category: 'civic' }),
      ev('erie', 'Called off', '2026-11-14T09:00', { status: 'canceled' }),
      ev('windsor', 'Trivia', '2026-11-07T19:00', { repeat: 'weekly', until: '2026-12-31', category: 'music' }),
      deadline,
    ],
    days,
    { now, exclude: new Set(['berthoud/art-due']) },
  );
  assert.equal(picks.size, 0);
});

test('the editor’s featured listing first, then a plan-your-day one, then the earlier start', () => {
  const picks = weekendPicks(
    [ev('erie', 'Early talk', '2026-11-14T09:00', { category: 'education' }), ev('lyons', 'Late show', '2026-11-14T19:00', { category: 'music' })],
    days,
    { now },
  );
  assert.equal(picks.get('2026-11-14')?.data.title, 'Late show');
  const featured = weekendPicks([ev('lyons', 'Late show', '2026-11-14T19:00', { category: 'music' }), ev('erie', 'The big one', '2026-11-14T20:00', { category: 'education', featured: true })], days, { now });
  assert.equal(featured.get('2026-11-14')?.data.title, 'The big one');
});

test('a program’s listing on its deadline day is a deadline, not a weekend pick', () => {
  const listing = ev('berthoud', 'Holiday Card Art Contest: artwork due', '2026-11-14T00:00', { slug: 'art-due' });
  const other = ev('berthoud', 'A class', '2026-11-20T10:00', { slug: 'a-class' });
  const programs = [
    { town: { slug: 'berthoud' }, data: { nextEvent: 'art-due', registration: { deadline: parseLocal('2026-11-14') } } },
    { town: { slug: 'berthoud' }, data: { nextEvent: 'a-class', registration: { deadline: parseLocal('2026-11-18') } } },
  ];
  assert.deepEqual([...deadlineListings(programs, [listing, other])], ['berthoud/art-due']);
});

const game = (g: Partial<SportGame> & { date: string; opponent: string }): SportGame => ({ site: 'home', url: 'https://maxpreps.example/g', ...g });
const team = (games: { upcoming?: SportGame[]; results?: SportGame[] }, overall = '9-1'): SportData => ({
  key: 'football',
  name: 'Football',
  maxprepsUrl: 'https://maxpreps.example/t',
  fetched: '2026-11-11T19:47:32.243Z',
  overall,
  results: games.results ?? [],
  upcoming: games.upcoming ?? [],
  held: [],
  notes: [],
});
const school = (town: string, mascot: string, maxprepsName = town) => ({ town, slug: undefined, calendar: undefined, maxprepsName, mascot });

test('Friday night lights: the game whose guide features its listing, then a playoff game, then the guides’ order', () => {
  const roosevelt = { guide: 'johnstown', town: 'johnstown', school: school('johnstown', 'Roughriders'), team: team({ upcoming: [game({ date: '2026-11-13', opponent: 'Montbello', time: '19:00', stage: 'State Football Playoffs' })] }) };
  const severance = { guide: 'windsor', town: 'windsor', school: school('windsor', 'Silver Knights'), team: team({ upcoming: [game({ date: '2026-11-13', opponent: 'Pueblo East', time: '19:00', stage: 'State Football Playoffs' })] }) };
  const erie = { guide: 'erie', town: 'erie', school: school('erie', 'Tigers'), team: team({ upcoming: [game({ date: '2026-11-13', opponent: 'Broomfield', time: '19:00' })] }) };
  const listing = ev('johnstown', 'Roosevelt football vs Montbello: 4A playoffs, second round', '2026-11-13T19:00', { category: 'sports', featured: true });
  assert.equal(fridayGame([erie, severance, roosevelt], '2026-11-13', [listing])?.guide, 'johnstown');
  assert.equal(fridayGame([erie, severance, roosevelt], '2026-11-13', [])?.guide, 'windsor');
  assert.equal(fridayGame([erie], '2026-11-13', [])?.guide, 'erie');
  assert.equal(fridayGame([erie], '2026-11-20', []), undefined);
  assert.equal(fridayGame([erie], '2026-11-13', [])?.listing, undefined);
});

test('the game’s row: its time, venue and record before; the final, once posted, after', () => {
  const sc = school('johnstown', 'Roughriders', 'Roosevelt');
  const title = (e: { data: { title: string } }) => e.data.title;
  const clock = () => '7 pm';
  const listing = ev('johnstown', 'Roosevelt football vs Montbello', '2026-11-13T19:00', { category: 'sports' });
  const before = gameRow({ school: sc, team: team({}), game: game({ date: '2026-11-13', opponent: 'Montbello', time: '19:00' }), listing }, title, clock);
  assert.deepEqual(before, { title: 'Roosevelt football vs Montbello', meta: ['7 pm', 'The hall', '9–1 this season'], reasons: [], final: false });
  const after = gameRow({ school: sc, team: team({}, '10-1'), game: game({ date: '2026-11-13', opponent: 'Montbello', result: 'W', score: { us: 35, them: 14 } }) }, title, clock);
  assert.deepEqual(after, { title: 'Roosevelt Roughriders vs Montbello', meta: ['Final: Won 35–14', '10–1 this season'], reasons: [], final: true });
});

test('a guide editor’s pick comes before the plan-your-day rule', () => {
  const picks = weekendPicks(
    [ev('erie', 'Nutcracker excerpts', '2026-11-14T10:30', { category: 'arts' }), ev('berthoud', 'Blues Bash', '2026-11-14T19:00', { category: 'other', slug: 'blues-bash' })],
    days,
    { now, picked: new Set(['berthoud/blues-bash']) },
  );
  assert.equal(picks.get('2026-11-14')?.data.title, 'Blues Bash');
});

test('the weekend’s best listing is placed first, and a run of days counts on each day it is on', () => {
  // Berthoud's lesser Friday listing does not take the town from its Saturday pick.
  const picks = weekendPicks(
    [ev('berthoud', 'Friday duo', '2026-11-13T18:00', { category: 'music' }), ev('berthoud', 'Blues Bash', '2026-11-14T12:00', { category: 'music', slug: 'blues-bash' })],
    days,
    { now, picked: new Set(['berthoud/blues-bash']) },
  );
  assert.deepEqual([...picks].map(([d, e]) => [d, e.data.title]), [['2026-11-14', 'Blues Bash']]);
  const run = ev('lyons', 'Three-day festival', '2026-11-13T10:00', { category: 'festival' });
  (run.data as { end?: Date }).end = parseLocal('2026-11-15T17:00');
  const taken = weekendPicks([run], days.slice(1), { now });
  assert.deepEqual([...taken.keys()], ['2026-11-14']);
});

test('a listing’s reasons come from its fields only, and none is better than a filler', () => {
  const listing = (cost: string | undefined, start: string, end?: string, allDay = false) => ({ data: { cost, start: parseLocal(start), end: end ? parseLocal(end) : undefined, allDay } }) as unknown as Parameters<typeof listingReasons>[0];
  assert.deepEqual(listingReasons(listing('Free', '2026-11-14T10:30', '2026-11-14T11:00')), ['Free', 'Half an hour']);
  assert.deepEqual(listingReasons(listing('$10', '2026-11-15T11:00', '2026-11-15T15:00')), []);
  assert.deepEqual(listingReasons(listing('Free to members', '2026-11-15T11:00')), []);
  assert.deepEqual(listingReasons(listing(undefined, '2026-11-14T19:00'), { pickedBy: 'Inside Berthoud', annual: { edition: 78 } }), ['Inside Berthoud’s pick this week', 'The 78th annual']);
  assert.deepEqual(listingReasons(listing(undefined, '2026-11-14T19:00'), { annual: {} }), ['Once a year']);
  const withWhy = { data: { why: 'More than forty local vendors', cost: 'Free', start: parseLocal('2026-11-15T11:00') } } as unknown as Parameters<typeof listingReasons>[0];
  assert.deepEqual(listingReasons(withWhy, { pickedBy: 'Inside Erie' }), ['Inside Erie’s pick this week', 'More than forty local vendors']);
  assert.equal(durationWords(45), '45 minutes');
  assert.equal(durationWords(60), 'An hour');
  assert.equal(durationWords(120), undefined);
  assert.equal(durationWords(61), undefined);
  assert.equal(durationWords(1), undefined);
  assert.deepEqual(listingReasons(listing(undefined, '2026-11-14T19:00'), { annual: { edition: 1 } }), ['Once a year']);
  assert.deepEqual([1, 2, 3, 11, 12, 13, 21, 78, 101].map(ordinal), ['1st', '2nd', '3rd', '11th', '12th', '13th', '21st', '78th', '101st']);
});

test('the game’s reasons: the postseason its title does not already name, and its league place', () => {
  const league = { league: { record: '7-0', name: '4A Northern', place: '1st' } };
  assert.deepEqual(gameReasons('Roosevelt football vs Montbello: 4A playoffs, second round', league, { stage: 'State Football Playoffs' }), ['1st in the 4A Northern league']);
  assert.deepEqual(gameReasons('Severance Silver Knights vs Pueblo East', {}, { stage: 'State Football Playoffs' }), ['State Football Playoffs']);
  assert.deepEqual(gameReasons('Erie Tigers vs Broomfield', { league: { record: '0-0', name: '5A', place: '1st' } }, {}), []);
});

const record = (over: Partial<TraditionRecord> & Pick<TraditionRecord, 'slug' | 'name' | 'type' | 'years'>): TraditionRecord => ({ organizer: 'The town', sourceUrl: 'https://example.org', town: { name: 'Berthoud', guide: 'berthoud' }, ...over });
const year = (date: string, extra: Partial<TraditionRecord['years'][number]> = {}) => ({ year: 2026, status: 'confirmed' as const, date, checked: '2026-11-11', ...extra });

test('an annual event is a record at home in the listing’s guide, on its day, under its name', () => {
  const parade = record({ slug: 'berthoud-parade', name: 'Parade of Lights', type: 'parade-of-lights', years: [year('2026-12-05', { edition: 30 })] });
  const listing = ev('berthoud', 'Berthoud Parade of Lights', '2026-12-05T18:00');
  assert.equal(annualRecordFor(listing, 'Berthoud Parade of Lights', [parade])?.entry.edition, 30);
  assert.equal(annualRecordFor(ev('erie', 'Erie Parade of Lights', '2026-12-05T18:00'), 'Erie Parade of Lights', [parade]), undefined);
  assert.equal(annualRecordFor(ev('berthoud', 'Parade of Lights', '2026-12-06T18:00'), 'Parade of Lights', [parade]), undefined);
  const walk = record({ slug: 'w', name: 'Art Walk', type: 'festival', years: [year('2026-12-05')] });
  assert.equal(annualRecordFor(ev('berthoud', 'Heart Walk for Berthoud', '2026-12-05T10:00'), 'Heart Walk for Berthoud', [walk]), undefined);
});

test('this season is the seasons opened with a year that still have a date to come', () => {
  const records = [
    record({ slug: 'a', name: 'Parade A', type: 'parade-of-lights', years: [year('2026-11-27')] }),
    record({ slug: 'b', name: 'Parade B', type: 'parade-of-lights', town: { name: 'Erie', guide: 'erie' }, years: [{ year: 2026, status: 'not-announced', checked: '2026-11-11' }] }),
    record({ slug: 'c', name: 'Oktoberfest', type: 'oktoberfest', years: [year('2026-11-20')] }),
    record({ slug: 'd', name: 'Trot', type: 'turkey-trot', years: [year('2026-11-10')] }),
  ];
  const now = seasonsNow(records, '2026-11-13');
  assert.deepEqual(now.map((s) => [s.type, s.next.record.slug, s.counts]), [['parade-of-lights', 'a', { confirmed: 1, towns: 2, canceled: 0 }]]);
});

test('the open seasons come soonest first, and a town named in the event is not named twice', () => {
  const records = [
    record({ slug: 'p', name: 'Parade', type: 'parade-of-lights', years: [year('2026-11-27')] }),
    record({ slug: 't', name: 'Longmont Turkey Trot', type: 'turkey-trot', town: { name: 'Longmont' }, years: [year('2026-11-26')] }),
  ];
  assert.deepEqual(seasonsNow(records, '2026-11-13').map((s) => s.type), ['turkey-trot', 'parade-of-lights']);
  assert.equal(nextLine(records[1]!), 'Longmont Turkey Trot');
  assert.equal(nextLine({ name: 'Catch the Glow Parade', town: { name: 'Estes Park' } }), 'Catch the Glow Parade, Estes Park');
});

test('In the towns: published and not past its day, the newest first, one per town, three at most', () => {
  const item = (town: string, title: string, date: string, until = '2026-11-30') => ({ town, label: town, title, line: '', href: '#', date, until });
  const items = [
    item('nederland', 'Eldora', '2026-11-13'),
    item('nederland', 'An older Nederland item', '2026-11-10'),
    item('berthoud', 'Ballot issue', '2026-11-05'),
    item('erie', 'Gone', '2026-11-01', '2026-11-12'),
    item('lyons', 'Not yet', '2026-11-20'),
    item('windsor', 'Snow routes', '2026-11-08'),
    item('johnstown', 'Fourth', '2026-11-02'),
  ];
  assert.deepEqual(newsItems(items, '2026-11-13').map((i) => i.title), ['Eldora', 'Snow routes', 'Ballot issue']);
  assert.deepEqual(newsItems([], '2026-11-13'), []);
});

test('a story’s source line names every report and the oldest day one was read', () => {
  assert.equal(storySourceText([{ label: 'Colorado Sun', checked: '2026-11-13' }, { label: 'BusinessDen', checked: '2026-11-12' }]), 'Sources: Colorado Sun and BusinessDen, read Nov 12, 2026');
  assert.equal(storySourceText([{ label: 'Town of Nederland', checked: '2026-11-13' }]), 'Source: Town of Nederland, read Nov 13, 2026');
  assert.equal(storySourceText([]), undefined);
  // "Publisher: document" counts by publisher; past three, the rest are counted.
  const s = (label: string) => ({ label, checked: '2026-11-13' });
  assert.equal(storySourceText([s('Town of Nederland: Sept. 30 statement'), s('Town of Nederland: Nov. 9 packet'), s('Colorado Sun: Nov. 11 article')]), 'Sources: Town of Nederland and Colorado Sun, read Nov 13, 2026');
  assert.equal(storySourceText([s('Town of Nederland: a'), s('Colorado Sun: b'), s('BusinessDen: c'), s('Bond Buyer: d'), s('KUNC: e')]), 'Sources: Town of Nederland, Colorado Sun, BusinessDen and 2 more, read Nov 13, 2026');
});

test('the stylesheet declares the palette in src/config/palette.ts', () => {
  const css = readFileSync('src/styles/hub-home.css', 'utf8');
  for (const [name, hex] of Object.entries(HUB_HOME)) assert.match(css, new RegExp(`--hh-${name}:\\s*${hex};`, 'i'), `--hh-${name}`);
});

test('the phone menu closes when focus moves elsewhere, not when it goes to nothing (a tap in Safari)', () => {
  const page = readFileSync('src/routes/hub/index.astro', 'utf8');
  const handler = page.match(/header\.addEventListener\('focusout', \(event\) => \{([\s\S]*?)\n    \}\);/);
  assert.ok(handler, 'the masthead has a focusout handler');
  // Safari does not focus a tapped link, so relatedTarget is null on a tap
  // inside the menu; closing then would hide the link before the tap lands.
  assert.match(handler[1]!, /if \(next && !header\.contains\(next\)\) set\(false\);/);
  assert.ok(!/if \(!header\.contains\(event\.relatedTarget/.test(handler[1]!), 'a null relatedTarget must not close the menu');
  // A tap anywhere else still closes it.
  assert.match(page, /document\.addEventListener\('click', \(event\) => \{\s*if \(!header\.contains\(event\.target as Node\)\) set\(false\);/);
});
