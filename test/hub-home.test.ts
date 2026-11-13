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
import { parseLocal } from '../src/lib/dates.ts';
import {
  GUIDE_LINES,
  changeSourceText,
  deadlineListings,
  deadlineSourceText,
  deadlineTitle,
  fridayGame,
  gameRow,
  guideLine,
  guideName,
  numberWord,
  pickDeadline,
  provenanceText,
  searchSuggestions,
  seasonFeatureLine,
  sportsSourceText,
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
  assert.deepEqual(counts, { confirmed: 2, towns: 3 });
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
  assert.deepEqual(before, { title: 'Roosevelt football vs Montbello', meta: ['7 pm', 'The hall', '9–1 this season'], final: false });
  const after = gameRow({ school: sc, team: team({}, '10-1'), game: game({ date: '2026-11-13', opponent: 'Montbello', result: 'W', score: { us: 35, them: 14 } }) }, title, clock);
  assert.deepEqual(after, { title: 'Roosevelt Roughriders vs Montbello', meta: ['Final: Won 35–14', '10–1 this season'], final: true });
});

test('the stylesheet declares the palette in src/config/palette.ts', () => {
  const css = readFileSync('src/styles/hub-home.css', 'utf8');
  for (const [name, hex] of Object.entries(HUB_HOME)) assert.match(css, new RegExp(`--hh-${name}:\\s*${hex};`, 'i'), `--hh-${name}`);
});
