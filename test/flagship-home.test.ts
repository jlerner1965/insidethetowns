/**
 * The flagship home page (the homepage brief, 25 October 2026): which final
 * the scoreboard shows, what is next, the week as seven days, the school's
 * rows, the school's colours and the home menu. Every case is one a parent
 * would notice: last week's score on the board, Friday's game missing from
 * Friday, a school orange that white cannot be read on.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { clockKey, dashed, gameHeading, leadGame, nextGame, resultSentence, scoreboardResult, teamRows, weekDays } from '../src/lib/flagship-home.ts';
import { contrast, schoolTheme } from '../src/config/school-colors.ts';
import { towns } from '../src/config/towns/registry.ts';
import { schoolSportsFor, schoolTeamName, type SportGame, type SportsData } from '../src/config/school-sports.ts';
import { homeNav, townNav } from '../src/lib/nav.ts';
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

test('the week is seven days, Monday to Sunday, and a day shows three things with a count of the rest', () => {
  const days = weekDays({
    events: [ev('a', '2026-10-23T09:00'), ev('b', '2026-10-23T10:00'), ev('c', '2026-10-23T11:00'), ev('d', '2026-10-23T12:00')],
    sports: data([{ key: 'football', name: 'Football', results: [won('2026-10-23', 'Mountain View', 50, 0, 'away')] }]),
    now: SUNDAY,
  });
  assert.deepEqual(days.map((d) => d.key), ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
  const friday = days[4]!;
  assert.equal(friday.items[0]?.title, 'Football at Mountain View', 'football keeps its place and leads the day');
  assert.equal(friday.items[0]?.meta, 'Won 50–0 · Away');
  assert.deepEqual(friday.items.slice(1).map((i) => i.title), ['a', 'b']);
  assert.equal(friday.more, 2);
  assert.equal(friday.past, true);
  assert.equal(days[6]!.past, false, 'today is not past');
});

test('the Thursday email is on its day from today on, never on a Thursday gone by; a called-off event is left off', () => {
  const email = { day: 'Thursday', time: '7 am' };
  const thisWeek = weekDays({ events: [], email, now: at('2026-10-20T12:00') });
  const thursday = thisWeek[3]!;
  assert.equal(thursday.items[0]?.title, 'Thursday email');
  assert.equal(thursday.items[0]?.meta, '7 am, in your inbox');
  assert.equal(thursday.items[0]?.href, '#signup');
  assert.equal(weekDays({ events: [], email, now: SUNDAY })[3]!.items.length, 0);
  const off = weekDays({ events: [ev('gone', '2026-10-21T10:00', { status: 'canceled' })], now: at('2026-10-20T12:00') });
  assert.equal(off[2]!.items.length, 0);
  assert.equal(clockKey('6:30 pm'), '18:30');
  assert.equal(clockKey('7 am'), '07:00');
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

test('the home page’s menu is the brief’s; every other page keeps the shared one', () => {
  const berthoud = towns.find((t) => t.slug === 'berthoud')!;
  assert.deepEqual(homeNav(berthoud).map((n) => n.label), ['This week', 'Spartans', 'Town', 'Eat & drink', 'Families', 'Living here']);
  assert.equal(homeNav(berthoud).find((n) => n.label === 'Spartans')?.href, '/sports/');
  assert.deepEqual(townNav(berthoud).map((n) => n.label), ['This week', 'Events', 'Spartans sports', 'Eat & drink', 'Families', 'Living here']);
});

test('a flagship’s home page is its own route file, so a classic guide’s build never imports it', () => {
  for (const t of towns) assert.deepEqual(homeRoute(t), ['/', t.home ? 'home-flagship.astro' : 'index.astro'], t.slug);
});
