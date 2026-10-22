/**
 * Berthoud High sports (scripts/sports.ts): the MaxPreps page read from its
 * own data, the school calendar's titles read, and the cross-check that
 * holds a game the two disagree on.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySchedule, parseSchedulePage, parseTeamPage } from '../scripts/lib/maxpreps.ts';
import { parseMonth, parseTitle } from '../scripts/lib/finalsite-calendar.ts';
import { crossCheck, dedupeToCome, gamesToCome, keepPrevious, sameSchool } from '../scripts/lib/sports-crosscheck.ts';
import { SCHOOL_SPORTS, schoolSportsFor, schoolsFor, sportsDataFile, sportsPath, type SportsData } from '../src/config/school-sports.ts';
import { sportsRoutes } from '../src/integrations/town-routes.ts';
import { findTown } from '../src/config/index.ts';
import { nextGames, placeText } from '../src/lib/school-sports.ts';

const berthoud = schoolSportsFor('berthoud')!;
const football = berthoud.teams.find((s) => s.key === 'football')!;
const US = 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/football/';
const TEAM = { url: US, schoolName: 'Berthoud' };

/** The shapes seen on the real page, 21 October 2026, cut to what is read. */
function contest(opts: { id: string; url: string; home: boolean; played?: { us: number; them: number; result: 'W' | 'L' }; kickoff?: string; them: string }) {
  return {
    contestId: opts.id,
    hasResult: !!opts.played,
    canonicalUrl: `${opts.url}?c=${opts.id}`,
    timestamp: opts.played ? '2026-10-16T04:23:58' : opts.kickoff,
    homeAwayType: opts.home ? 0 : 1,
    isTimeTba: false,
    isDateTba: false,
    teams: [
      { schoolName: 'Berthoud', score: opts.played?.us ?? 0, result: opts.played?.result ?? null, teamCanonicalUrl: US },
      { schoolName: opts.them, score: opts.played?.them ?? 0, result: opts.played ? (opts.played.result === 'W' ? 'L' : 'W') : null, teamCanonicalUrl: 'https://www.maxpreps.com/co/x/' },
    ],
  };
}

function page(pageProps: object, visible = 'Berthoud Spartans Varsity Football Overall 6-2 League 3-1 (3rd) Schedule at a Glance Fri, 10/16 vs Greeley Central'): string {
  return `<html><body><div>${visible}</div><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps } })}</script></body></html>`;
}

const greeley = contest({ id: 'c7', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-greeley-central/10-15-2026/', home: true, played: { us: 22, them: 0, result: 'W' }, them: 'Greeley Central' });
const windsor = contest({ id: 'w1', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-windsor/10-9-2026/', home: false, played: { us: 0, them: 46, result: 'L' }, them: 'Windsor' });
const mountainView = contest({ id: '38', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-mountain-view-loveland/10-23-2026/', home: false, kickoff: '2026-10-23T19:00:00', them: 'Mountain View' });
const severance = contest({ id: '44', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-severance/10-30-2026/', home: false, kickoff: '2026-10-30T19:00:00', them: 'Severance' });

const realPage = page({
  teamContext: {
    standingsData: {
      overallStanding: { overallWinLossTies: '6-2' },
      leagueStanding: { leagueName: '3A Cache la Poudre', conferenceWinLossTies: '3-1', conferenceStandingPlacement: '3rd' },
    },
    teamSettings: { scheduleUpdatedOn: '2026-10-21T14:37:47', standingsUpdatedOn: '2026-10-21T14:37:47' },
  },
  wallCards: { schedule: { data: [greeley, mountainView, severance] } },
  wallPosts: [
    { type: 9, title: 'Game Results', timeStamp: '2026-10-15T19:00:00', data: greeley },
    { type: 4, title: 'Stats Updated', timeStamp: '2026-10-15T19:00:00', data: { contestId: 'c7' } },
    { type: 9, title: 'Game Results', timeStamp: '2026-10-09T19:00:00', data: windsor },
    { type: 9, title: 'Game Results', timeStamp: '2026-10-09T19:00:00', data: windsor },
  ],
});

test('the records, the glance card and the results come out of the page data', () => {
  const p = parseTeamPage(realPage, TEAM);
  assert.equal(p.overall, '6-2');
  assert.deepEqual(p.league, { record: '3-1', name: '3A Cache la Poudre', place: '3rd' });
  assert.equal(p.updatedOn, '2026-10-21T14:37:47');
  assert.deepEqual(
    p.glance.map((g) => [g.date, g.site, g.opponent, g.result ?? g.time]),
    [['2026-10-15', 'home', 'Greeley Central', 'W'], ['2026-10-23', 'away', 'Mountain View', '19:00'], ['2026-10-30', 'away', 'Severance', '19:00']],
  );
  assert.deepEqual(p.glance[0]!.score, { us: 22, them: 0 });
  assert.equal(p.glance[1]!.url, 'https://www.maxpreps.com/co/football/game/berthoud-vs-mountain-view-loveland/10-23-2026/?c=38', 'the game page, without the tracking query');
  assert.deepEqual(p.warnings, []);
});

test('a played game is dated by its page URL, not the GMT instant the score went in', () => {
  const p = parseTeamPage(realPage, TEAM);
  assert.deepEqual(p.results.map((g) => [g.date, g.opponent, `${g.result} ${g.score!.us}-${g.score!.them}`]), [
    ['2026-10-15', 'Greeley Central', 'W 22-0'],
    ['2026-10-09', 'Windsor', 'L 0-46'],
  ]);
  assert.equal(p.results.length, 2, 'the same result posted twice counts once');
});

test('a page without its data, or whose visible records differ from its data, is reported rather than trusted', () => {
  const blocked = parseTeamPage('<html><title>403 - Forbidden</title></html>', TEAM);
  assert.equal(blocked.overall, undefined);
  assert.deepEqual(blocked.warnings, ['no __NEXT_DATA__ on the page']);
  const drifted = parseTeamPage(realPage.replace('Overall 6-2', 'Overall 7-2'), TEAM);
  assert.ok(drifted.warnings.some((w) => w.includes('7-2')), drifted.warnings.join('; '));
});

test('a team MaxPreps has nothing for is told apart from a page that could not be read', () => {
  const empty = page(
    { teamContext: { standingsData: { overallStanding: { overallWinLossTies: '0-0' } } }, wallCards: {}, wallPosts: [] },
    'Berthoud Spartans Varsity Boys Cross Country Overall 0-0 League Schedule at a Glance No Schedule If you have the full schedule, send it to MaxPreps.',
  );
  const p = parseTeamPage(empty, { url: `${berthoud.maxpreps}cross-country/`, schoolName: 'Berthoud' });
  assert.equal(p.noSchedule, true);
  assert.deepEqual(p.glance, []);
  assert.ok(!p.warnings.includes('no "Schedule at a Glance" card'));
});

test('the school calendar titles are read into team, level, where and opponent', () => {
  assert.deepEqual(parseTitle('Boys Varsity Football @ Mountain View High School - FR'), { gender: 'Boys', level: 'Varsity', sport: 'Football', where: '@', opponent: 'Mountain View High School' });
  assert.deepEqual(parseTitle('Girls C-Team Volleyball vs University High School - .'), { gender: 'Girls', level: 'C-Team', sport: 'Volleyball', where: 'vs', opponent: 'University High School' });
  assert.deepEqual(parseTitle('Boys JV Soccer @ Weld Central Junior/Senior High School'), { gender: 'Boys', level: 'JV', sport: 'Soccer', where: '@', opponent: 'Weld Central Junior/Senior High School' });
  assert.deepEqual(parseTitle('Girls Varsity Flag Football'), { gender: 'Girls', level: 'Varsity', sport: 'Flag Football' });
});

const monthHtml = `
<a class="fsCalendarTitle fsCalendarEventLink" title="Boys Varsity Football @ Mountain View High School - FR" data-occur-id="112093072_2026-10-24T01:00:00Z_2026-10-24T03:00:00Z" href="#">x</a>
<a class="fsCalendarTitle fsCalendarEventLink" title="Boys Varsity Football @ Mountain View High School - FR" data-occur-id="112093072_2026-10-24T01:00:00Z_2026-10-24T03:00:00Z" href="#">x</a>
<a class="fsCalendarTitle fsCalendarEventLink" title="Boys Varsity Football @ Severance High School - FR" data-occur-id="112093076_2026-10-31T01:00:00Z_2026-10-31T03:00:00Z" href="#">x</a>
<a class="fsCalendarTitle fsCalendarEventLink" title="Boys JV Football vs Severance High School - FR" data-occur-id="112093077_2026-10-31T22:00:00Z_2026-11-01T00:00:00Z" href="#">x</a>
<a class="fsCalendarTitle fsCalendarEventLink fsCalendarTruncate" title="Girls Varsity Volleyball vs Eaton High School" data-occur-id="1_2026-10-07T00:30:00Z_2026-10-07T02:00:00Z" href="#">x</a>`;

test('a month page gives each event once, in Denver time, whether or not the link carries a third class (Roosevelt High’s grid does)', () => {
  const events = parseMonth(monthHtml);
  assert.deepEqual(events.map((e) => [e.date, e.time, e.level, e.sport, e.opponent]), [
    ['2026-10-23', '19:00', 'Varsity', 'Football', 'Mountain View High School'],
    ['2026-10-30', '19:00', 'Varsity', 'Football', 'Severance High School'],
    ['2026-10-31', '16:00', 'JV', 'Football', 'Severance High School'],
    ['2026-10-06', '18:30', 'Varsity', 'Volleyball', 'Eaton High School'],
  ]);
});

test('a school’s name is the same with or without "High School" after it', () => {
  assert.ok(sameSchool('Mountain View High School', 'Mountain View'));
  assert.ok(sameSchool('Weld Central Junior/Senior High School', 'Weld Central'));
  assert.ok(sameSchool('Resurrection Christian School', 'Resurrection Christian'));
  assert.ok(!sameSchool('Mountain View High School', 'Mountain Vista'));
  assert.ok(!sameSchool('Greeley Central High School', 'Greeley West'));
});

test('the cross-check publishes what the school calendar agrees with and holds what it contradicts', () => {
  const calendar = parseMonth(monthHtml);
  const p = parseTeamPage(realPage, TEAM);
  const toCome = gamesToCome(p, '2026-10-21');
  assert.deepEqual(toCome.map((g) => g.opponent), ['Mountain View', 'Severance']);

  const agreed = crossCheck(football, toCome, calendar);
  assert.deepEqual(agreed.upcoming.map((g) => g.opponent), ['Mountain View', 'Severance']);
  assert.deepEqual(agreed.held, []);
  assert.deepEqual(agreed.notes, []);

  // The school moves kickoff to 6 pm: held, with both times named.
  const earlier = calendar.map((e) => (e.opponent?.startsWith('Mountain View') ? { ...e, time: '18:00' } : e));
  const time = crossCheck(football, toCome, earlier);
  assert.deepEqual(time.upcoming.map((g) => g.opponent), ['Severance']);
  assert.equal(time.held.length, 1);
  assert.match(time.held[0]!.reason, /MaxPreps says 7 pm, the school calendar says 6 pm/);

  // The school has a different opponent that night: held.
  const other = calendar.map((e) => (e.opponent?.startsWith('Mountain View') ? { ...e, opponent: 'Thompson Valley High School', title: 'Boys Varsity Football @ Thompson Valley High School' } : e));
  const opponent = crossCheck(football, toCome, other);
  assert.match(opponent.held[0]!.reason, /lists "Boys Varsity Football @ Thompson Valley High School" that day instead/);

  // The school has the game a week later: held, the school's date named.
  const moved = calendar.map((e) => (e.opponent?.startsWith('Mountain View') ? { ...e, date: '2026-10-24' } : e));
  const date = crossCheck(football, toCome, moved);
  assert.match(date.held[0]!.reason, /on 2026-10-24 at 7 pm/);

  // The school calendar has no such game: published on MaxPreps's word, and noted.
  const silent = crossCheck(football, toCome, calendar.filter((e) => !e.opponent?.startsWith('Mountain View')));
  assert.deepEqual(silent.upcoming.map((g) => g.opponent), ['Mountain View', 'Severance']);
  assert.deepEqual(silent.held, []);
  assert.match(silent.notes[0]!, /not on the school calendar/);

  // Only the varsity team's events count: the JV game on the 31st does not contradict anything.
  const jvOnly = crossCheck(football, toCome, calendar.filter((e) => e.level === 'JV'));
  assert.equal(jvOnly.held.length, 0);
});

test('a team whose page failed keeps its previous entry, its date included', () => {
  const previous: SportsData = {
    generated: '2026-10-14T14:00:00Z',
    sports: [{ key: 'football', name: 'Football', maxprepsUrl: US, fetched: '2026-10-14T14:00:00Z', overall: '5-2', results: [], upcoming: [], held: [], notes: [] }],
  };
  const kept = keepPrevious(football, previous, berthoud.maxpreps);
  assert.equal(kept.fetched, '2026-10-14T14:00:00Z');
  assert.equal(kept.overall, '5-2');
  const fresh = keepPrevious(football, undefined, berthoud.maxpreps);
  assert.equal(fresh.fetched, undefined, 'no earlier entry: the card says it has not been read');
  assert.equal(fresh.maxprepsUrl, US, 'and still links the team');
  const niwot = schoolSportsFor('niwot')!;
  assert.equal(keepPrevious(niwot.teams[0]!, undefined, niwot.maxpreps).maxprepsUrl, 'https://www.maxpreps.com/co/niwot/niwot-cougars/football/');
  assert.equal(niwot.calendar, undefined, 'Niwot has no calendar a machine may read');
});

test('the big game of the week is the first team in config order with a game in the next seven days', async () => {
  const { bigGame, coming } = await import('../src/lib/school-sports.ts');
  const game = (date: string, opponent: string) => ({ date, time: '19:00', opponent, site: 'away' as const, url: `https://x/${opponent}/` });
  const team = (key: string, upcoming: ReturnType<typeof game>[]) => ({ key, name: key, maxprepsUrl: '', results: [], upcoming, held: [], notes: [] });
  const now = new Date('2026-10-21T18:00:00Z');
  const data = { generated: '', sports: [team('football', [game('2026-10-23', 'Mountain View'), game('2026-10-30', 'Severance')]), team('soccer', [game('2026-10-22', 'Sterling')])] };
  assert.equal(bigGame(data, now)!.game.opponent, 'Mountain View', 'Friday football over Thursday soccer');
  assert.deepEqual(coming(data).map((c) => c.game.opponent), ['Sterling', 'Mountain View', 'Severance'], 'the list stays chronological');
  const later = { generated: '', sports: [team('football', [game('2026-11-06', 'Playoff')]), team('soccer', [game('2026-10-29', 'Valley')])] };
  assert.equal(bigGame(later, now)!.game.opponent, 'Valley', 'nothing for football this week: the soonest game leads');
  const past = { generated: '', sports: [team('football', [game('2026-10-16', 'Greeley Central')])] };
  assert.equal(bigGame(past, now), undefined, 'a game already played is not next');
});

/*
 * The /schedule/ page's rows, as the live page had them on 21 October 2026:
 * 41 values a row and 32 a team, no keys. Only the positions the reader
 * uses are filled; the rest are null, as many of the real ones are.
 */
function scheduleRow(o: { id: string; url: string; kickoff: string; sentence: string; played?: boolean; teams: Array<{ name: string; url: string; away: boolean | 'neutral'; result?: 'W' | 'L' | 'T'; score?: number }> }) {
  const row: unknown[] = new Array(41).fill(null);
  row[0] = o.teams.map((t) => {
    const team: unknown[] = new Array(32).fill(null);
    team[5] = t.result ?? null;
    team[6] = t.score ?? null;
    team[11] = t.away === 'neutral' ? 2 : t.away ? 1 : 0;
    team[13] = t.url;
    team[14] = t.name;
    return team;
  });
  row[1] = o.id;
  row[4] = !!o.played;
  row[11] = o.kickoff;
  row[18] = `${o.url}?c=${o.id}`;
  row[29] = o.sentence;
  return row;
}
const schedulePage = (rows: unknown[][]) => `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { contests: rows } } })}</script></body></html>`;
const BERTHOUD = { name: 'Berthoud', url: US };
const fortMorgan = scheduleRow({
  id: 'a1', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-fort-morgan/8-21-2026/', kickoff: '2026-08-21T19:00:00', played: true,
  sentence: 'On 8/21, the Berthoud varsity football team won their away non-conference game against Fort Morgan (CO) by a score of 33-13.',
  teams: [{ name: 'Fort Morgan', url: 'https://www.maxpreps.com/co/fort-morgan/fort-morgan-mustangs/football/', away: false, result: 'L', score: 13 }, { ...BERTHOUD, away: true, result: 'W', score: 33 }],
});
const timnath = scheduleRow({
  id: 'a2', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-timnath/8-28-2026/', kickoff: '2026-08-28T19:00:00', played: true,
  sentence: 'On 8/28, the Timnath varsity football team won their away non-conference game against Berthoud (CO) by a score of 28-0.',
  teams: [{ name: 'Timnath', url: 'https://www.maxpreps.com/co/timnath/timnath-cubs/football/', away: true, result: 'W', score: 28 }, { ...BERTHOUD, away: false, result: 'L', score: 0 }],
});
const greeleyRow = scheduleRow({
  id: 'c7', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-greeley-central/10-15-2026/', kickoff: '2026-10-15T19:00:00', played: true,
  sentence: 'On 10/15, the Greeley Central varsity football team lost their away conference game against Berthoud (CO) by a score of 22-0.',
  teams: [{ ...BERTHOUD, away: false, result: 'W', score: 22 }, { name: 'Greeley Central', url: 'https://www.maxpreps.com/co/greeley/greeley-central-wildcats/football/', away: true, result: 'L', score: 0 }],
});
const mountainViewRow = scheduleRow({
  id: '38', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-mountain-view-loveland/10-23-2026/', kickoff: '2026-10-23T19:00:00',
  sentence: 'The Berthoud varsity football team has an away conference game @  Mountain View (Loveland, CO) on Friday, October 23 @ 7p.',
  teams: [{ name: 'Mountain View', url: 'https://www.maxpreps.com/co/loveland/mountain-view-mountain-lions/football/', away: false }, { ...BERTHOUD, away: true }],
});
const severanceRow = scheduleRow({
  id: '44', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-severance/10-30-2026/', kickoff: '2026-10-30T19:00:00',
  sentence: 'The Berthoud varsity football team has an away conference game @  Severance (CO) on Friday, October 30, time TBA.',
  teams: [{ name: 'Severance', url: 'https://www.maxpreps.com/co/severance/severance-silver-knights/football/', away: false }, { ...BERTHOUD, away: true }],
});

// Softball's rows, 21 October 2026: a tournament game at a neutral site, and
// a cancelled game that keeps its row with the sentence blank.
const meeker = scheduleRow({
  id: 's1', url: 'https://www.maxpreps.com/co/softball/game/berthoud-vs-meeker/9-4-2026/', kickoff: '2026-09-04T12:00:00', played: true,
  sentence: 'On 9/4, the Meeker varsity softball team lost their neutral tournament game against Berthoud (CO) by a score of 21-0.',
  teams: [{ ...BERTHOUD, away: 'neutral', result: 'W', score: 21 }, { name: 'Meeker', url: 'https://www.maxpreps.com/co/meeker/meeker-cowboys/softball/fall/', away: 'neutral', result: 'L', score: 0 }],
});
const cancelled = scheduleRow({ id: 'x0', url: 'https://www.maxpreps.com/co/softball/game/berthoud-vs-golden/1-1-1900/', kickoff: '1900-01-01T00:00:00', sentence: '', teams: [{ name: 'Golden', url: 'https://www.maxpreps.com/co/golden/golden-demons/softball/fall/', away: 'neutral' }, { ...BERTHOUD, away: 'neutral' }] });

test('the schedule page gives the whole season, oldest first: scores where played, the kickoff where not, nothing where the sentence names no time', () => {
  const page = parseSchedulePage(schedulePage([greeleyRow, fortMorgan, cancelled, timnath, meeker, mountainViewRow, severanceRow]), TEAM);
  assert.deepEqual(page.warnings, []);
  assert.equal(page.skipped, 1);
  assert.deepEqual(page.games.map((g) => `${g.date} ${g.site} ${g.opponent} ${g.result ?? ''} ${g.score ? `${g.score.us}-${g.score.them}` : g.time ?? 'TBA'}`), [
    '2026-08-21 away Fort Morgan W 33-13',
    '2026-08-28 home Timnath L 0-28',
    '2026-09-04 neutral Meeker W 21-0',
    '2026-10-15 home Greeley Central W 22-0',
    '2026-10-23 away Mountain View  19:00',
    '2026-10-30 away Severance  TBA',
  ]);
  assert.equal(page.games[0]!.url, 'https://www.maxpreps.com/co/football/game/berthoud-vs-fort-morgan/8-21-2026/?c=a1');
});

test('a schedule row the sentence does not bear out is reported, not read: a swapped score, a side the other way, a kickoff that differs', () => {
  const swapped = structuredClone(fortMorgan) as unknown[];
  (swapped[29] as string) && (swapped[29] = 'On 8/21, the Berthoud varsity football team won their away non-conference game against Fort Morgan (CO) by a score of 33-14.');
  const sideways = structuredClone(timnath) as unknown[];
  sideways[29] = 'On 8/28, the Timnath varsity football team won their home non-conference game against Berthoud (CO) by a score of 28-0.';
  const late = structuredClone(mountainViewRow) as unknown[];
  late[29] = 'The Berthoud varsity football team has an away conference game @  Mountain View (Loveland, CO) on Friday, October 23 @ 7:30p.';
  const page = parseSchedulePage(schedulePage([swapped, sideways, late, greeleyRow]), TEAM);
  assert.equal(page.games.length, 1);
  assert.equal(page.warnings.length, 3);
  assert.match(page.warnings[0]!, /33-14/);
  assert.match(page.warnings[1]!, /the other way/);
  assert.match(page.warnings[2]!, /19:30/);
});

test('the schedule replaces the home page’s results only where the two agree on every game the home page has', () => {
  const home = parseTeamPage(realPage, TEAM);
  assert.equal(home.results.length, 2);
  const full = parseSchedulePage(schedulePage([fortMorgan, timnath, greeleyRow, mountainViewRow, severanceRow]), TEAM);
  // Windsor, which the home page reports, is not on this schedule.
  assert.match(applySchedule(home, full)!, /no 2026-10-09 Windsor/);
  assert.equal(home.results.length, 2);
  assert.equal(home.schedule, undefined);

  const windsorRow = scheduleRow({
    id: 'w1', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-windsor/10-9-2026/', kickoff: '2026-10-09T19:00:00', played: true,
    sentence: 'On 10/9, the Berthoud varsity football team lost their away conference game against Windsor (CO) by a score of 46-0.',
    teams: [{ name: 'Windsor', url: 'https://www.maxpreps.com/co/windsor/windsor-wizards/football/', away: false, result: 'W', score: 46 }, { ...BERTHOUD, away: true, result: 'L', score: 0 }],
  });
  // A doubleheader: two games on one page path, told apart by ?c= alone.
  const twice = (id: string, us: number, them: number) => scheduleRow({
    id, url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-falcon/10-17-2026/', kickoff: '2026-10-17T10:00:00', played: true,
    sentence: `On 10/17, the Berthoud varsity football team lost their away non-conference game against Falcon (CO) by a score of ${them}-${us}.`,
    teams: [{ name: 'Falcon', url: 'https://www.maxpreps.com/co/falcon/falcon-falcons/football/', away: false, result: 'W', score: them }, { ...BERTHOUD, away: true, result: 'L', score: us }],
  });
  const agreed = parseSchedulePage(schedulePage([fortMorgan, timnath, windsorRow, greeleyRow, twice('d1', 4, 15), twice('d2', 9, 17), mountainViewRow, severanceRow]), TEAM);
  assert.equal(applySchedule(home, agreed), undefined);
  assert.deepEqual(home.results.map((g) => g.date), ['2026-10-17', '2026-10-17', '2026-10-15', '2026-10-09', '2026-08-28', '2026-08-21']);
  assert.deepEqual(home.results.filter((g) => g.opponent === 'Falcon').map((g) => `${g.score!.us}-${g.score!.them} ${g.url.slice(-5)}`), ['4-15 ?c=d1', '9-17 ?c=d2']);
  assert.equal(home.schedule!.length, 8);
  assert.deepEqual(gamesToCome(home, '2026-10-21').map((g) => g.opponent), ['Mountain View', 'Severance']);

  // The same page with Greeley Central's score wrong is refused.
  const wrong = structuredClone(greeleyRow) as unknown[];
  wrong[29] = 'On 10/15, the Greeley Central varsity football team lost their away conference game against Berthoud (CO) by a score of 23-0.';
  ((wrong[0] as unknown[][])[0]!)[6] = 23;
  const fresh = parseTeamPage(realPage, TEAM);
  assert.match(applySchedule(fresh, parseSchedulePage(schedulePage([fortMorgan, timnath, windsorRow, wrong, mountainViewRow, severanceRow]), TEAM))!, /scores differ for 2026-10-15 Greeley Central/);
  assert.equal(fresh.results.length, 2);
});

test('a game listed twice at the same time against the same opponent is one game; a doubleheader is two', () => {
  const game = (id: string, time: string | undefined, opponent = 'Fossil Ridge') => ({
    date: '2026-10-30',
    opponent,
    site: 'neutral' as const,
    url: `https://www.maxpreps.com/co/volleyball/match/fossil-ridge-fort-collins-vs-niwot/10-30-2026/?c=${id}`,
    ...(time ? { time } : {}),
  });
  // Niwot volleyball, 21 October 2026: the same 9:45 match under two contest ids.
  const twice = dedupeToCome([game('0d7c07ea', '09:45'), game('831d7c52', '09:45')]);
  assert.equal(twice.length, 1);
  assert.match(twice[0]!.url, /0d7c07ea/, 'the first contest id is kept');
  // Two games at two times is a doubleheader.
  assert.equal(dedupeToCome([game('a', '10:00'), game('b', '12:00')]).length, 2);
  // Two games with no time given cannot be told apart from a doubleheader, so both stay.
  assert.equal(dedupeToCome([game('a', undefined), game('b', undefined)]).length, 2);
  // Different opponents at one time are two entries (a tournament pool listed loosely), kept.
  assert.equal(dedupeToCome([game('a', '09:45'), game('b', '09:45', 'Mead')]).length, 2);
});

test('a playoff or tournament game is at a neutral site, with the venue MaxPreps gives or the sport’s playoff site', () => {
  const softball = { url: 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/softball/fall/', schoolName: 'Berthoud', playoffVenue: 'Aurora Sports Park' };
  const delta = scheduleRow({
    id: 'p1', url: 'https://www.maxpreps.com/co/softball/game/berthoud-vs-delta/10-23-2026/', kickoff: '2026-10-23T12:15:00',
    sentence: 'The Delta varsity softball team has an away playoff game @  Berthoud (CO) on Friday, October 23 @ 12:15p.',
    teams: [{ name: 'Berthoud', url: softball.url, away: false }, { name: 'Delta', url: 'https://www.maxpreps.com/co/delta/delta-panthers/softball/fall/', away: true }],
  });
  (delta as unknown[])[5] = 'Field A2';
  const barnes = structuredClone(meeker) as unknown[];
  barnes[5] = 'Barnes Complex/Fairgrounds Park';
  const page = parseSchedulePage(schedulePage([barnes, delta]), softball);
  assert.deepEqual(page.warnings, []);
  const [meet, playoff] = page.games;
  assert.equal(meet!.site, 'neutral');
  assert.equal(meet!.neutral, true);
  assert.equal(meet!.venue, 'Barnes Complex/Fairgrounds Park');
  // MaxPreps files the state opener as a home game; it is played at Aurora.
  assert.equal(playoff!.site, 'neutral');
  assert.equal(playoff!.venue, 'Aurora Sports Park');
  assert.equal(placeText(playoff!), 'Aurora Sports Park');
  assert.equal(placeText({ date: '2026-10-30', opponent: 'x', site: 'away', url: 'u' }), 'Away');
  assert.equal(placeText({ date: '2026-10-30', opponent: 'x', site: 'neutral', neutral: true, url: 'u' }), 'Neutral site');

  // The home page's glance card calls it a home game; the schedule's word stands.
  const home = parseTeamPage(realPage, TEAM);
  const football = { ...TEAM };
  const mv = structuredClone(mountainViewRow) as unknown[];
  mv[29] = 'The Berthoud varsity football team has an away playoff game @  Mountain View (Loveland, CO) on Friday, October 23 @ 7p.';
  mv[5] = 'Ray Patterson Stadium';
  const windsorRow = scheduleRow({
    id: 'w1', url: 'https://www.maxpreps.com/co/football/game/berthoud-vs-windsor/10-9-2026/', kickoff: '2026-10-09T19:00:00', played: true,
    sentence: 'On 10/9, the Berthoud varsity football team lost their away conference game against Windsor (CO) by a score of 46-0.',
    teams: [{ name: 'Windsor', url: 'https://www.maxpreps.com/co/windsor/windsor-wizards/football/', away: false, result: 'W', score: 46 }, { ...BERTHOUD, away: true, result: 'L', score: 0 }],
  });
  assert.equal(applySchedule(home, parseSchedulePage(schedulePage([fortMorgan, timnath, windsorRow, greeleyRow, mv, severanceRow]), football)), undefined);
  const next = home.schedule!.find((g) => g.opponent === 'Mountain View')!;
  assert.equal(next.site, 'neutral');
  assert.equal(next.venue, 'Ray Patterson Stadium');
});

test('the home page’s sports block takes each team’s next game in the config’s order', () => {
  const data: SportsData = {
    generated: '',
    sports: [
      { key: 'football', name: 'Football', maxprepsUrl: '', results: [], held: [], notes: [], upcoming: [{ date: '2026-10-23', opponent: 'Mountain View', site: 'away', url: 'f' }] },
      { key: 'volleyball', name: 'Volleyball', maxprepsUrl: '', results: [], held: [], notes: [], upcoming: [{ date: '2026-10-20', opponent: 'Old', site: 'home', url: 'o' }, { date: '2026-10-22', opponent: 'Liberty Common', site: 'home', url: 'v' }] },
      { key: 'xc', name: 'Cross country', maxprepsUrl: '', results: [], held: [], notes: [], upcoming: [] },
    ],
  };
  assert.deepEqual(nextGames(data, new Date('2026-10-21T18:00:00Z')).map((g) => `${g.team.name} ${g.game.opponent}`), ['Football Mountain View', 'Volleyball Liberty Common']);
});

test('a playoff game the school calendar files as home is published at its neutral site, with a note, not held', () => {
  const softball = berthoud.teams.find((s) => s.key === 'softball')!;
  const game = { date: '2026-10-23', opponent: 'Delta', site: 'neutral' as const, neutral: true, venue: 'Aurora Sports Park', time: '12:15', url: 'u' };
  const calendar = [{ gender: 'Girls' as const, level: 'Varsity', sport: 'Softball', where: 'vs' as const, opponent: 'Delta High School', title: 'Girls Varsity Softball vs Delta High School', date: '2026-10-23', time: '12:15' }];
  const check = crossCheck(softball, [game], calendar);
  assert.deepEqual(check.held, []);
  assert.equal(check.upcoming[0]!.venue, 'Aurora Sports Park');
  assert.match(check.notes[0]!, /Aurora Sports Park.*files as home/);
  // The time still has to agree.
  const late = crossCheck(softball, [{ ...game, time: '14:00' }], calendar);
  assert.equal(late.held.length, 1);
});

test('a town with one school keeps /sports/ and sports.json; Loveland’s four each get a slug, a page and a file, and /sports/ lists them', () => {
  const berthoud = schoolSportsFor('berthoud')!;
  assert.equal(sportsPath(berthoud), '/sports/');
  assert.equal(sportsDataFile(berthoud), 'data/berthoud/sports.json');
  assert.deepEqual(sportsRoutes('berthoud'), [['/sports', 'sports.astro']]);
  assert.deepEqual(sportsRoutes('lyons'), [], 'a town without a school has no page');

  const loveland = schoolsFor('loveland');
  assert.deepEqual(loveland.map((s) => s.slug), ['loveland-high', 'thompson-valley', 'mountain-view', 'resurrection-christian']);
  assert.equal(schoolSportsFor('loveland'), undefined, 'no one school is the city’s');
  assert.equal(schoolSportsFor('loveland', 'mountain-view')?.mascot, 'Mountain Lions');
  assert.equal(sportsPath(loveland[1]!), '/sports/thompson-valley/');
  assert.equal(sportsDataFile(loveland[1]!), 'data/loveland/sports-thompson-valley.json');
  assert.deepEqual(sportsRoutes('loveland'), [
    ['/sports', 'sports-index.astro'],
    ['/sports/loveland-high', 'sports.astro'],
    ['/sports/thompson-valley', 'sports.astro'],
    ['/sports/mountain-view', 'sports.astro'],
    ['/sports/resurrection-christian', 'sports.astro'],
  ]);
});

test('every school is one entry with its own file, and its town’s nav carries it in the third slot', () => {
  const files = SCHOOL_SPORTS.map(sportsDataFile);
  assert.equal(new Set(files).size, files.length, 'no two schools share a file');
  for (const town of new Set(SCHOOL_SPORTS.map((s) => s.town))) {
    const schools = schoolsFor(town);
    const sluggish = schools.filter((s) => s.slug).length;
    assert.ok(sluggish === 0 ? schools.length === 1 : sluggish === schools.length, `${town}: either one school without a slug or several each with one`);
    const nav = findTown(town)!.nav;
    assert.equal(nav[2]?.href, '/sports/', `${town}: the school is the third nav item`);
    assert.equal(nav[2]?.label, schools.length === 1 ? schools[0]!.mascot : 'Sports', `${town}: the label is the mascot, or "Sports" for several schools`);
    for (const s of schools) assert.ok(s.calendar || s.calendarNote, `${s.school}: a calendar to check against, or a note saying why not`);
  }
});
