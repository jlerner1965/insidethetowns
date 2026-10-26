/**
 * The home page (the homepage brief, 25 October 2026; the design pass, 26
 * October 2026): which final the scoreboard shows, what is next, the week
 * as seven days, the school's rows, the school's colours and the route. Every case is one a parent
 * would notice: last week's score on the board, Friday's game missing from
 * Friday, a school orange that white cannot be read on.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { agendaTitle, clockKey, dashed, displayTitle, gameHeading, leadGame, nextGame, resultSentence, scoreboardResult, teamRows, weekDays } from '../src/lib/flagship-home.ts';
import { contrast, schoolTheme } from '../src/config/school-colors.ts';
import { towns } from '../src/config/towns/registry.ts';
import { schoolSportsFor, schoolTeamName, type SportGame, type SportsData } from '../src/config/school-sports.ts';
import { townNav } from '../src/lib/nav.ts';
import { homeRoute } from '../src/integrations/town-routes.ts';

const at = (s: string) => parseLocal(s);
// Sunday 25 October 2026, late morning in Denver: the day the brief was written.
const SUNDAY = at('2026-10-25T11:30');

function game(date: string, opponent: string, extra: Partial<SportGame> = {}): SportGame {
  return { date, opponent, site: 'home', url: `https://example.com/${date}`, ...extra };
}

function data(teams: Array<{ key: string; name?: string; overall?: string; results?: SportGame[]; upcoming?: SportGame[] }>): SportsData {
  return {
    generated: '2026-10-25T17:22:58.624Z',
    sports: teams.map((t) => ({
      key: t.key,
      name: t.name ?? t.key,
      maxprepsUrl: 'https://example.com/',
      fetched: '2026-10-25T17:22:58.624Z',
      overall: t.overall,
      results: t.results ?? [],
      upcoming: t.upcoming ?? [],
      held: [],
      notes: [],
    })),
  };
}

const won = (date: string, opponent: string, us: number, them: number, site: SportGame['site'] = 'home') => game(date, opponent, { site, result: us > them ? 'W' : us < them ? 'L' : 'T', score: { us, them } });

// ------------------------------------------------------------ the scoreboard

test('the scoreboard leads with football’s final from the last eight days, even when another team played later', () => {
  const d = data([
    { key: 'football', name: 'Football', overall: '7-2', results: [won('2026-10-23', 'Mountain View', 50, 0, 'away')] },
    { key: 'softball', name: 'Softball', results: [won('2026-10-24', 'Delta', 12, 0)] },
  ]);
  const r = scoreboardResult(d, SUNDAY)!;
  assert.equal(r.team.key, 'football');
  assert.deepEqual(r.game.score, { us: 50, them: 0 });
});

test('with no football final in the window, the most recent final of any team; with none at all, nothing', () => {
  const d = data([
    { key: 'football', results: [won('2026-10-15', 'South Park', 48, 0)] },
    { key: 'volleyball', results: [won('2026-10-22', 'Front Range Christian', 3, 0)] },
    { key: 'softball', results: [won('2026-10-24', 'Brush', 14, 2)] },
  ]);
  assert.equal(scoreboardResult(d, SUNDAY)?.team.key, 'softball', 'Lyons, 25 October: football last played on the 15th');
  assert.equal(scoreboardResult(d, at('2026-11-10T12:00')), undefined, 'a final more than eight days old is not shown');
});

test('a forfeit or a meet’s placing has no score to put on a board, so it is passed over', () => {
  const d = data([{ key: 'football', results: [game('2026-10-23', 'Fairview', { result: 'W', forfeit: true })] }, { key: 'volleyball', results: [won('2026-10-21', 'Mead', 3, 1)] }]);
  assert.equal(scoreboardResult(d, SUNDAY)?.team.key, 'volleyball');
});

test('with no final, the left column has the week’s football game, and Next up is the game after it', () => {
  const d = data([
    { key: 'football', upcoming: [game('2026-10-30', 'Severance', { time: '19:00', site: 'away' })] },
    { key: 'volleyball', upcoming: [game('2026-10-26', 'University', { time: '18:30' })] },
  ]);
  const lead = leadGame(d, SUNDAY)!;
  assert.equal(lead.team.key, 'football');
  assert.equal(nextGame(d, SUNDAY, lead)?.game.opponent, 'University');
  assert.equal(nextGame(d, SUNDAY)?.game.opponent, 'University', 'without a lead, the soonest game');
});

test('the next game is named by its weekday and time, never "Today", and the time does not break from its "pm"', () => {
  assert.equal(gameHeading(game('2026-10-26', 'University', { time: '18:30' })), 'Monday, 6:30 pm');
  assert.equal(gameHeading(game('2026-10-25', 'Anyone')), 'Sunday');
});

test('a result reads as a sentence with its dash and its date; a record takes an en dash', () => {
  assert.equal(resultSentence(won('2026-10-23', 'Mountain View', 50, 0, 'away')), 'Won 50–0 at Mountain View, Friday, October 23.');
  assert.equal(resultSentence(won('2026-10-09', 'Windsor', 0, 46, 'away')), 'Lost 0–46 at Windsor, Friday, October 9.');
  assert.equal(dashed('7-2'), '7–2');
  assert.equal(dashed('5-8-2'), '5–8–2');
});

// ------------------------------------------------------------- the week

function ev(slug: string, start: string, extra: Record<string, unknown> = {}) {
  return { slug, data: { title: slug, start: at(start), allDay: false, venue: 'Library', category: 'family', ...extra } as never };
}

test('the week is seven days, Monday to Sunday by default, and a day shows three things in the order of the clock, with a count of the rest', () => {
  const days = weekDays({
    events: [ev('a', '2026-10-23T09:00'), ev('b', '2026-10-23T10:00'), ev('c', '2026-10-23T11:00'), ev('d', '2026-10-23T20:00')],
    sports: data([{ key: 'football', name: 'Football', results: [won('2026-10-23', 'Mountain View', 50, 0, 'away')], upcoming: [] }]),
    now: SUNDAY,
  });
  assert.deepEqual(days.map((d) => d.key), ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
  const friday = days[4]!;
  assert.deepEqual(friday.items.map((i) => i.title), ['a', 'b', 'c'], 'football has no time on file, so it does not jump the morning');
  assert.equal(friday.more, 2);
  assert.equal(friday.past, true);
  assert.equal(days[6]!.past, false, 'today is not past');
});

test('a game is placed by its time among the events, never ahead of an earlier one because it is sport', () => {
  const days = weekDays({
    events: [ev('story-time', '2026-10-30T10:30'), ev('trivia', '2026-10-30T20:00')],
    sports: data([{ key: 'football', name: 'Football', upcoming: [game('2026-10-30', 'Severance', { time: '19:00', site: 'away' })] }]),
    now: at('2026-10-26T09:00'),
    start: 'today',
  });
  assert.equal(days[0]!.key, '2026-10-26', 'the agenda starts on the day the page was built');
  const friday = days.find((d) => d.key === '2026-10-30')!;
  assert.deepEqual(friday.items.map((i) => i.title), ['story-time', 'Football at Severance', 'trivia']);
  assert.equal(friday.items[1]!.when, '7 pm');
  assert.equal(friday.items[1]!.site, 'Away');
});

test('on a full day the weekly series give up the visible slots first: a civic meeting is never hidden behind regulars', () => {
  const regulars = new Set(['trivia', 'cribbage']);
  const [tuesday] = weekDays({
    events: [ev('trivia', '2026-10-27T18:00'), ev('cribbage', '2026-10-27T18:15'), ev('storytime', '2026-10-27T10:30'), ev('town-board', '2026-10-27T18:30', { category: 'civic' })],
    sports: data([{ key: 'volleyball', name: 'Volleyball', upcoming: [game('2026-10-27', 'Windsor Charter Academy', { time: '18:30', site: 'away' })] }]),
    now: at('2026-10-27T08:00'),
    start: 'today',
    isSeries: (e) => regulars.has(e.slug!),
  });
  assert.deepEqual(tuesday!.items.map((i) => i.title), ['storytime', 'Volleyball at Windsor Charter Academy', 'town-board'], 'chosen first, then shown by the clock');
  assert.equal(tuesday!.more, 2);
});

test('a registration opening or deadline is on its day, so a day with one is not "Nothing listed"', () => {
  const days = weekDays({
    events: [],
    now: at('2026-10-26T09:00'),
    start: 'today',
    deadlines: [
      { on: at('2026-11-01T00:00'), what: 'opens', title: 'Berthoud Recreation youth sports', href: 'https://example.com/register' },
      { on: at('2026-11-01T00:00'), what: 'closes', title: 'Youth futsal clinic', href: '/families/' },
    ],
  });
  const sunday = days.find((d) => d.key === '2026-11-01')!;
  assert.deepEqual(sunday.items.map((i) => [i.kind, i.when, i.title]), [
    ['deadline', 'Sign-ups open', 'Berthoud Recreation youth sports'],
    ['deadline', 'Last day to sign up', 'Youth futsal clinic'],
  ]);
  assert.equal(sunday.items[0]!.eventDay, '2026-11-01');
});

test('a long time note goes on the venue line in full, not down the time column', () => {
  const note = 'Drop-off bins October 26 to November 6; drive-through drop-off November 7, 10 am to noon';
  const [day] = weekDays({ events: [ev('food-drive', '2026-10-26T08:00', { timeNote: note, venue: 'Severance Town Hall' }), ev('club', '2026-10-26T14:30', { timeNote: '2:30 pm' })], now: at('2026-10-26T07:00'), start: 'today' });
  const drive = day!.items.find((i) => i.fullTitle === 'food-drive')!;
  assert.equal(drive.when, '');
  assert.equal(drive.where, `${note} · Severance Town Hall`);
  assert.equal(day!.items.find((i) => i.fullTitle === 'club')!.when, '2:30 pm');
});

test('the Thursday email is on its day from today on, never on a Thursday gone by; a called-off event is kept and marked', () => {
  const email = { day: 'Thursday', time: '7 am' };
  const thisWeek = weekDays({ events: [], email, now: at('2026-10-20T12:00') });
  const thursday = thisWeek[3]!;
  assert.equal(thursday.items[0]?.title, 'Thursday email');
  assert.equal(thursday.items[0]?.meta, '7 am, in your inbox');
  assert.equal(thursday.items[0]?.href, '#signup');
  assert.equal(weekDays({ events: [], email, now: SUNDAY })[3]!.items.length, 0);
  const off = weekDays({ events: [ev('gone', '2026-10-21T10:00', { status: 'canceled' })], now: at('2026-10-20T12:00') });
  assert.equal(off[2]!.items.length, 1, 'a reader who planned around it sees it called off, not missing');
  assert.equal(off[2]!.items[0]?.status, 'canceled');
  assert.equal(off[2]!.items[0]?.pick, undefined);
  assert.equal(clockKey('6:30 pm'), '18:30');
  assert.equal(clockKey('7 am'), '07:00');
});

test('a long title is cut at a natural break for the agenda, never mid-word; a short one is left whole', () => {
  // The venue line under the row says the venue, so the title does not (the events page's rule).
  assert.equal(agendaTitle('Trivia Night at The Wheel House', 'The Wheel House'), 'Trivia Night');
  assert.equal(agendaTitle('Murder at Shade Hallow Manor', 'Berthoud Community Library'), 'Murder at Shade Hallow Manor');
  assert.equal(agendaTitle('Berthoud Area Chamber of Commerce Business After Hours: Halloween edition at the museum', 'Berthoud Historical Society Museum'), 'Berthoud Area Chamber of Commerce Business After Hours');
  assert.equal(displayTitle('Macaroon Stout release, with Steepland String Band'), 'Macaroon Stout release, with Steepland String Band');
  assert.equal(displayTitle('Berthoud Area Chamber of Commerce Business After Hours: Halloween edition at the museum'), 'Berthoud Area Chamber of Commerce Business After Hours');
  const long = 'A very long title with no natural break in it anywhere at all for the agenda';
  assert.equal(displayTitle(long), long, 'left whole, for the stylesheet’s two-line clamp');
});

test('every agenda row carries the marks the browser uses to take it down once it is over', () => {
  const [day] = weekDays({ events: [ev('talk', '2026-10-26T18:00', { end: at('2026-10-26T19:30') })], now: at('2026-10-26T09:00'), start: 'today' });
  assert.equal(day!.items[0]!.eventDay, '2026-10-26');
  assert.match(day!.items[0]!.end!, /^2026-10-26T19:30/);
});

test('the agenda runs seven days from today, names today and tomorrow, marks the pick and gives each day its own limit', () => {
  const days = weekDays({
    events: [ev('a', '2026-10-26T09:00'), ev('b', '2026-10-26T10:00'), ev('c', '2026-10-27T11:00'), ev('d', '2026-11-01T12:00')],
    now: SUNDAY,
    start: 'today',
    picked: new Set(['c']),
    limit: (i) => (i < 2 ? 1 : 3),
  });
  assert.deepEqual(days.map((d) => d.key), ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
  assert.equal(days[0]!.relative, 'Today');
  assert.equal(days[1]!.relative, 'Tomorrow');
  assert.equal(days[2]!.relative, undefined, 'only the two days a reader calls by name');
  assert.equal(days[0]!.past, false);
  assert.deepEqual(days[1]!.items.map((i) => i.title), ['a'], 'the first two days keep one item each here');
  assert.equal(days[1]!.more, 1);
  assert.equal(days[2]!.items[0]?.pick, true);
  assert.equal(days.some((d) => d.items.some((i) => i.title === 'd')), false, 'next Sunday is outside the seven days');
});

test('a game to come shows its time and where; one played shows the result', () => {
  const days = weekDays({ events: [], sports: data([{ key: 'volleyball', name: 'Volleyball', upcoming: [game('2026-10-21', 'University', { time: '18:30' })] }]), now: at('2026-10-20T09:00') });
  assert.equal(days[2]!.items[0]?.title, 'Volleyball vs University');
  assert.equal(days[2]!.items[0]?.meta, '6:30 pm · Home');
});

// ------------------------------------------------------- the school's rows

test('football has a row while its season is on; every other team only with a game in the next seven days', () => {
  const d = data([
    { key: 'football', name: 'Football', overall: '7-2', results: [won('2026-10-23', 'Mountain View', 50, 0, 'away')], upcoming: [game('2026-10-30', 'Severance', { site: 'away' })] },
    { key: 'volleyball', name: 'Volleyball', upcoming: [game('2026-10-26', 'University'), game('2026-10-27', 'Windsor Charter Academy', { site: 'away' })] },
    { key: 'boys-soccer', name: 'Boys soccer', results: [won('2026-10-22', 'Sterling', 9, 0)] },
    { key: 'boys-basketball', name: 'Boys basketball', upcoming: [game('2026-11-30', 'Mountain View')] },
  ]);
  const rows = teamRows(d, SUNDAY);
  assert.deepEqual(rows.map((r) => r.team.key), ['football', 'volleyball']);
  assert.equal(rows[0]!.football?.record, '7–2');
  assert.equal(rows[1]!.games.length, 2);
  assert.deepEqual(teamRows(d, at('2026-12-20T12:00')).map((r) => r.team.key), [], 'December: football is over and nothing is in the week');
});

// ------------------------------------------------------- the school's colours

test('every flagship names its school as the sports pages do, and its band clears 7:1 under white', () => {
  for (const t of towns.filter((t) => t.home)) {
    assert.ok(t.school, `${t.slug}: a flagship with a school in the sports coverage has its colours`);
    const sports = schoolSportsFor(t.slug)!;
    assert.equal(t.school!.name, sports.school, t.slug);
    assert.equal(t.school!.mascot, sports.mascot, t.slug);
    assert.equal(t.school!.teamName, schoolTeamName(sports), t.slug);
    for (const hex of [t.school!.primary, t.school!.secondary]) assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `${t.slug}: ${hex}`);
    assert.ok(contrast('#ffffff', schoolTheme(t.school!).band) >= 7, t.slug);
  }
  const notFlagship = towns.filter((t) => !t.home && t.school);
  assert.deepEqual(notFlagship.map((t) => t.slug), [], 'only a flagship has the home page that uses them');
});

test('a primary white cannot be read on at 7:1 swaps with the secondary; a secondary that cannot be read on the band is not used for words', () => {
  const erie = schoolTheme({ primary: '#F26B21', secondary: '#231F20' });
  assert.equal(erie.swapped, true);
  assert.equal(erie.band, '#231F20');
  assert.equal(erie.eyebrow, '#F26B21', 'the orange reads on the black');
  assert.equal(erie.pill.fill, '#ffffff', 'ink does not clear 4.5:1 on the orange, so the pill is white');
  const elizabeth = schoolTheme({ primary: '#8D181B', secondary: '#000000' });
  assert.equal(elizabeth.swapped, false);
  assert.equal(elizabeth.eyebrow, '#ffffff', 'black on cardinal is 2.3:1');
  const windsor = schoolTheme({ primary: '#6A1B32', secondary: '#FFC900' });
  assert.equal(windsor.pill.fill, '#FFC900');
  // The brief's own example: Berthoud is maroon and white.
  const berthoud = towns.find((t) => t.slug === 'berthoud')!.school!;
  assert.deepEqual([berthoud.primary, berthoud.secondary], ['#572932', '#FFFFFF']);
});

// ------------------------------------------------------- the menu and the route

test('every page of a guide, its home included, has the one shared menu', () => {
  const berthoud = towns.find((t) => t.slug === 'berthoud')!;
  assert.deepEqual(townNav(berthoud).map((n) => n.label), ['This week', 'Events', 'Spartans sports', 'Eat & drink', 'Families', 'Living here']);
  assert.equal(townNav(berthoud).find((n) => n.label === 'Spartans sports')?.href, '/sports/');
});

test('every guide builds its home from the one route file; `home` only changes what the page leads with', () => {
  for (const t of towns) assert.deepEqual(homeRoute(t), ['/', 'index.astro'], t.slug);
});
