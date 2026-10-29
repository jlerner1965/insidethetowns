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
import { SCHOOL_SPORTS, schoolSportsFor, schoolsFor, schoolTeamName, shareImageName, shareImagePath, sportsDataFile, sportsPath, teamPath, type SportsData } from '../src/config/school-sports.ts';
import { readFileSync } from 'node:fs';
import { sportsRoutes } from '../src/integrations/town-routes.ts';
import { findTown } from '../src/config/index.ts';
import { townNav } from '../src/lib/nav.ts';
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

test('the next game is the soonest of any team, a Thursday match before Friday football', async () => {
  const { bigGame, coming } = await import('../src/lib/school-sports.ts');
  const game = (date: string, opponent: string) => ({ date, time: '19:00', opponent, site: 'away' as const, url: `https://x/${opponent}/` });
  const team = (key: string, upcoming: ReturnType<typeof game>[]) => ({ key, name: key, maxprepsUrl: '', results: [], upcoming, held: [], notes: [] });
  const now = new Date('2026-10-21T18:00:00Z');
  const data = { generated: '', sports: [team('football', [game('2026-10-23', 'Mountain View'), game('2026-10-30', 'Severance')]), team('soccer', [game('2026-10-22', 'Sterling')])] };
  assert.equal(bigGame(data, now)!.game.opponent, 'Sterling', 'Thursday soccer before Friday football');
  assert.deepEqual(coming(data).map((c) => c.game.opponent), ['Sterling', 'Mountain View', 'Severance'], 'the list stays chronological');
  const later = { generated: '', sports: [team('football', [game('2026-11-06', 'Playoff')]), team('soccer', [game('2026-10-29', 'Valley')])] };
  assert.equal(bigGame(later, now)!.game.opponent, 'Valley', 'the soonest game leads, a week out or not');
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
// A game MaxPreps deleted: the row keeps its teams and a result, has no URL
// and no sentence, and says so where the state goes.
const deleted = (() => {
  const row = scheduleRow({ id: 'x1', url: 'https://www.maxpreps.com/co/volleyball/game/berthoud-vs-colorado-academy/10-5-2026/', kickoff: '2026-10-05T19:00:00', played: true, sentence: '', teams: [{ ...BERTHOUD, away: false, result: 'W', score: 3 }, { name: 'Colorado Academy', url: 'https://www.maxpreps.com/co/denver/colorado-academy-mustangs/volleyball/', away: true, result: 'L', score: 0 }] });
  row[18] = null;
  row[28] = 'ContestState is Deleted.';
  return row;
})();
const cancelled = scheduleRow({ id: 'x0', url: 'https://www.maxpreps.com/co/softball/game/berthoud-vs-golden/1-1-1900/', kickoff: '1900-01-01T00:00:00', sentence: '', teams: [{ name: 'Golden', url: 'https://www.maxpreps.com/co/golden/golden-demons/softball/fall/', away: 'neutral' }, { ...BERTHOUD, away: 'neutral' }] });

test('the schedule page gives the whole season, oldest first: scores where played, the kickoff where not, nothing where the sentence names no time', () => {
  const page = parseSchedulePage(schedulePage([greeleyRow, fortMorgan, cancelled, timnath, deleted, meeker, mountainViewRow, severanceRow]), TEAM);
  assert.deepEqual(page.warnings, []);
  assert.equal(page.skipped, 2, 'the cancelled row and the deleted one');
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
  // The school page, then one page per team with data in the file on disk (none with no file).
  const berthoudRoutes = sportsRoutes('berthoud');
  assert.deepEqual(berthoudRoutes[0], ['/sports', 'sports.astro']);
  const berthoudData = JSON.parse(readFileSync('data/berthoud/sports.json', 'utf8')) as SportsData;
  assert.deepEqual(
    berthoudRoutes.slice(1, -1),
    berthoudData.sports.filter((t) => t.fetched && !t.empty).map((t) => [`/sports/${t.key}`, 'sports-team.astro']),
    'a team page for every team with data, none for one MaxPreps has nothing for',
  );
  assert.ok(berthoudRoutes.some(([p]) => p === '/sports/football'), 'football has a page');
  assert.deepEqual(sportsRoutes('berthoud', '/nowhere'), [['/sports', 'sports.astro'], ['/sports/share/[image].png', 'sports-share.png.ts']], 'no data file, no team pages');
  assert.deepEqual(sportsRoutes('longmont'), [], 'a town without a school has no page');
  assert.equal(sportsRoutes('erie')[0]![0], '/sports', 'Erie follows Erie High (25 October 2026)');
  assert.equal(teamPath(berthoud, 'football'), '/sports/football/');

  const loveland = schoolsFor('loveland');
  assert.deepEqual(loveland.map((s) => s.slug), ['loveland-high', 'thompson-valley', 'mountain-view', 'resurrection-christian']);
  assert.equal(schoolSportsFor('loveland'), undefined, 'no one school is the city’s');
  assert.equal(schoolSportsFor('loveland', 'mountain-view')?.mascot, 'Mountain Lions');
  assert.equal(sportsPath(loveland[1]!), '/sports/thompson-valley/');
  assert.equal(sportsDataFile(loveland[1]!), 'data/loveland/sports-thompson-valley.json');
  assert.deepEqual(sportsRoutes('loveland', '/nowhere'), [
    ['/sports', 'sports-index.astro'],
    ['/sports/loveland-high', 'sports.astro'],
    ['/sports/thompson-valley', 'sports.astro'],
    ['/sports/mountain-view', 'sports.astro'],
    ['/sports/resurrection-christian', 'sports.astro'],
    ['/sports/share/[image].png', 'sports-share.png.ts'],
  ]);
  assert.ok(sportsRoutes('loveland').some(([p, f]) => p === '/sports/mountain-view/football' && f === 'sports-team.astro'), 'a school’s team page carries the school’s slug');
  assert.equal(teamPath(loveland[2]!, 'football'), '/sports/mountain-view/football/');
});

test('every school is one entry with its own file, and its town’s menu carries it in the third slot', () => {
  const files = SCHOOL_SPORTS.map(sportsDataFile);
  assert.equal(new Set(files).size, files.length, 'no two schools share a file');
  for (const town of new Set(SCHOOL_SPORTS.map((s) => s.town))) {
    const schools = schoolsFor(town);
    const sluggish = schools.filter((s) => s.slug).length;
    assert.ok(sluggish === 0 ? schools.length === 1 : sluggish === schools.length, `${town}: either one school without a slug or several each with one`);
    const nav = townNav(findTown(town)!);
    assert.equal(nav[2]?.href, '/sports/', `${town}: the school is the third menu item`);
    assert.equal(nav[2]?.label, schools.length === 1 ? (schools[0]!.navLabel ?? `${schools[0]!.mascot} sports`) : 'High school sports', `${town}: the label says sports`);
    for (const s of schools) assert.ok(s.calendar || s.calendarNote, `${s.school}: a calendar to check against, or a note saying why not`);
  }
});

test('a result MaxPreps lists twice is shown once; a doubleheader stays two games', async () => {
  const { dedupeResults } = await import('../src/lib/school-sports.ts');
  const g = (c: string, us: number, them: number) => ({ date: '2026-10-17', opponent: 'Air Academy', site: 'neutral' as const, result: us > them ? ('W' as const) : ('L' as const), score: { us, them }, url: `https://x/?c=${c}` });
  assert.equal(dedupeResults([g('a', 6, 22), g('b', 6, 22)]).length, 1, 'the same game under two contest ids');
  assert.equal(dedupeResults([g('a', 4, 15), g('b', 9, 17)]).length, 2, 'a doubleheader');
});

test('the strip keeps the week’s football game however many matches come before it: Berthoud’s week of 26 October 2026', async () => {
  const { stripGames, weekGames } = await import('../src/lib/school-sports.ts');
  const game = (date: string, time: string, opponent: string, site: 'home' | 'away') => ({ date, time, opponent, site, url: `https://www.maxpreps.com/co/x/${opponent.toLowerCase().replace(/ /g, '-')}/${date}/` });
  const team = (key: string, name: string, overall: string, upcoming: ReturnType<typeof game>[]) => ({ key, name, maxprepsUrl: '', fetched: '2026-10-24T17:07:31.253Z', overall, results: [], upcoming, held: [], notes: [] });
  // data/berthoud/sports.json as the 24 October run wrote it: three volleyball
  // matches on Monday, Tuesday and Thursday, football on Friday.
  const berthoud: SportsData = {
    generated: '2026-10-24T17:07:31.253Z',
    sports: [
      team('football', 'Football', '7-2', [game('2026-10-30', '19:00', 'Severance', 'away')]),
      team('boys-soccer', 'Boys soccer', '8-7', []),
      team('volleyball', 'Volleyball', '15-5', [game('2026-10-26', '18:30', 'University', 'home'), game('2026-10-27', '18:30', 'Windsor Charter Academy', 'away'), game('2026-10-29', '18:30', 'Frederick', 'home')]),
      team('softball', 'Softball', '17-10', []),
    ],
  };
  const now = new Date('2026-10-25T15:00:00Z');
  assert.deepEqual(weekGames(berthoud, now).map((c) => c.game.opponent), ['University', 'Windsor Charter Academy', 'Frederick', 'Severance'], 'the week, soonest first');
  assert.deepEqual(stripGames(berthoud, now, 3).map((c) => `${c.team.name} ${c.game.opponent}`), ['Football Severance', 'Volleyball University', 'Volleyball Windsor Charter Academy'], 'football first, then the slots by date');
  assert.deepEqual(stripGames(berthoud, now).map((c) => c.game.opponent), ['Severance', 'University', 'Windsor Charter Academy', 'Frederick'], 'no limit: the whole week, football still first');
  // No football in the week (its season over, or a bye): the slots are the soonest games, as before.
  const bye = { ...berthoud, sports: berthoud.sports.filter((s) => s.key !== 'football') };
  assert.deepEqual(stripGames(bye, now, 3).map((c) => c.game.opponent), ['University', 'Windsor Charter Academy', 'Frederick']);
  // Football a week out is not this week's game and takes no slot.
  const later = { ...berthoud, sports: [team('football', 'Football', '7-2', [game('2026-11-06', '19:00', 'Playoff', 'away')]), ...bye.sports] };
  assert.deepEqual(stripGames(later, now, 3).map((c) => c.game.opponent), ['University', 'Windsor Charter Academy', 'Frederick']);
});

/*
 * The postseason as MaxPreps labels it (Windsor softball, read from the
 * runner 25 October 2026): the schedule row's sentence says "neutral playoff
 * game", the row carries the tournament's id, and the page's bracket list
 * names it "2026 CHSAA State Softball Tournaments"; the Game Results post on
 * the home page names the same tournament in its `tournament` object. No
 * round is stated anywhere per game.
 */
const WINDSOR_SB = { url: 'https://www.maxpreps.com/co/windsor/windsor-wizards/softball/fall/', schoolName: 'Windsor', playoffVenue: 'Aurora Sports Park' };
const WINDSOR = { name: 'Windsor', url: WINDSOR_SB.url };
const STATE = 'ebde8a19-74eb-4897-839d-0c381f6bad34';
const R32 = '6a45d709-60fb-4e2a-907d-b2cebf15d0cc';
function stateRow(o: { id: string; date: string; kickoff: string; them: string; themUrl: string; us: number; them2: number; sentence: string; tournament?: string; venue?: string }) {
  const row = scheduleRow({
    id: o.id, url: `https://www.maxpreps.com/co/softball/game/${o.them.toLowerCase().replace(/ /g, '-')}-vs-windsor/${o.date}/`, kickoff: o.kickoff, played: true, sentence: o.sentence,
    teams: [{ ...WINDSOR, away: 'neutral', result: 'W', score: o.us }, { name: o.them, url: o.themUrl, away: 'neutral', result: 'L', score: o.them2 }],
  });
  row[12] = o.tournament ? 'cbf4aaf8-cddf-4f26-8d76-d9957e13ba35' : '00000000-0000-0000-0000-000000000000';
  row[13] = o.tournament ?? '00000000-0000-0000-0000-000000000000';
  if (o.venue) row[5] = o.venue;
  return row;
}
const windsorRows = [
  scheduleRow({
    id: 'sev', url: 'https://www.maxpreps.com/co/softball/game/severance-vs-windsor/10-8-2026/', kickoff: '2026-10-08T16:00:00', played: true,
    sentence: 'On 10/8, the Windsor varsity softball team won their away conference game against Severance (CO) by a score of 4-0.',
    teams: [{ ...WINDSOR, away: true, result: 'W', score: 4 }, { name: 'Severance', url: 'https://www.maxpreps.com/co/severance/severance-silver-knights/softball/fall/', away: false, result: 'L', score: 0 }],
  }),
  stateRow({ id: 'tj', date: '10-17-2026', kickoff: '2026-10-17T10:00:00', them: 'Thomas Jefferson', themUrl: 'https://www.maxpreps.com/co/denver/thomas-jefferson-spartans/softball/fall/', us: 13, them2: 0, tournament: R32, sentence: 'On 10/17, the Thomas Jefferson varsity softball team lost their neutral tournament game against Windsor (CO) by a score of 13-0.' }),
  stateRow({ id: 'fm', date: '10-24-2026', kickoff: '2026-10-24T10:00:00', them: 'Fruita Monument', themUrl: 'https://www.maxpreps.com/co/fruita/fruita-monument-wildcats/softball/fall/', us: 13, them2: 3, tournament: STATE, venue: 'Field B4', sentence: 'On 10/24, the Windsor varsity softball team won their neutral playoff game against Fruita Monument (Fruita, CO) by a score of 13-3.' }),
  stateRow({ id: 'hf', date: '10-24-2026', kickoff: '2026-10-24T13:15:00', them: 'Holy Family', themUrl: 'https://www.maxpreps.com/co/broomfield/holy-family-tigers/softball/fall/', us: 6, them2: 2, tournament: STATE, venue: 'Field B4', sentence: 'On 10/24, the Windsor varsity softball team won their neutral playoff game against Holy Family (Broomfield, CO) by a score of 6-2.' }),
];
const schedulePageWith = (rows: unknown[][], tournaments: unknown) => `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { contests: rows, tournaments } } })}</script></body></html>`;

test('a playoff or tournament game carries the stage MaxPreps labels it with, and no round it does not state: Windsor softball', async () => {
  const { stageName } = await import('../scripts/lib/maxpreps.ts');
  assert.equal(stageName('2026 CHSAA State Softball Tournaments'), 'State Softball Tournaments');
  assert.equal(stageName('2026 CHSAA Class 4A Softball Round of 32'), 'Class 4A Softball Round of 32');
  assert.equal(stageName(null), undefined);

  // The schedule page: the bracket list names the tournament; a row outside any bracket has no stage.
  // `pageProps.tournaments` as the live page had it: one entry per bracket game, by contest id.
  const brackets = [
    { contestId: 'fm', tournamentId: STATE, tournamentName: '2026 CHSAA State Softball Tournaments', isTournamentPlayOff: true, bracketName: 'Class 4A' },
    { contestId: 'hf', tournamentId: STATE, tournamentName: '2026 CHSAA State Softball Tournaments', isTournamentPlayOff: true, bracketName: 'Class 4A' },
    { contestId: 'tj', tournamentId: R32, tournamentName: '2026 CHSAA Class 4A Softball Round of 32', isTournamentPlayOff: false, bracketName: 'Class 4A Site 1 ' },
  ];
  const named = parseSchedulePage(schedulePageWith(windsorRows, brackets), WINDSOR_SB);
  assert.deepEqual(named.warnings, []);
  assert.deepEqual(named.games.map((g) => [g.opponent, g.stage ?? null, g.venue ?? null]), [
    ['Severance', null, null],
    ['Thomas Jefferson', 'Class 4A Softball Round of 32', null],
    ['Fruita Monument', 'State Softball Tournaments', 'Aurora Sports Park'],
    ['Holy Family', 'State Softball Tournaments', 'Aurora Sports Park'],
  ]);
  for (const g of named.games) assert.ok(!/semifinal|championship|final/i.test(g.stage ?? ''), 'no round is invented');
  // Without the bracket list, the sentence's own word stands; a volleyball "tournament match" reads the same.
  const bare = parseSchedulePage(schedulePageWith(windsorRows, []), WINDSOR_SB);
  assert.deepEqual(bare.games.map((g) => g.stage ?? null), [null, 'Tournament', 'Playoffs', 'Playoffs']);

  // The home page: the Game Results post names the tournament; the glance card's entry does not, and says nothing.
  const holyFamily = {
    contestId: 'hf', hasResult: true, canonicalUrl: 'https://www.maxpreps.com/co/softball/game/holy-family-broomfield-vs-windsor/10-24-2026/?c=hf', timestamp: '2026-10-24T21:26:29', homeAwayType: 2, isTimeTba: false, isDateTba: false,
    teams: [{ schoolName: 'Windsor', score: 6, result: 'W', teamCanonicalUrl: WINDSOR_SB.url }, { schoolName: 'Holy Family', score: 2, result: 'L', teamCanonicalUrl: 'https://www.maxpreps.com/co/broomfield/holy-family-tigers/softball/fall/' }],
    tournament: { tournamentName: null, bracketName: 'Class 4A' },
  };
  const home = page({
    teamContext: { standingsData: { overallStanding: { overallWinLossTies: '29-0' } } },
    wallCards: { schedule: { data: [holyFamily] } },
    wallPosts: [{ type: 9, title: 'Game Results', timeStamp: '2026-10-24T21:26:29', data: { ...holyFamily, tournament: { tournamentName: '2026 CHSAA State Softball Tournaments', bracketName: 'Class 4A' } } }],
  }, 'Windsor Wizards Softball Overall 29-0 Schedule at a Glance');
  const p = parseTeamPage(home, WINDSOR_SB);
  assert.equal(p.results[0]!.stage, 'State Softball Tournaments');
  assert.equal(p.results[0]!.neutral, true);
  assert.equal(p.glance[0]!.stage, undefined, 'the glance card names no tournament, so nothing is written');
  assert.deepEqual(p.warnings, []);
});

test('with every game played and none listed to come, the band says the regular season is complete: Elizabeth football', async () => {
  const { seasonComplete } = await import('../src/lib/school-sports.ts');
  const now = new Date('2026-10-25T15:00:00Z');
  const tca = { date: '2026-10-23', opponent: 'The Classical Academy', site: 'home' as const, result: 'W' as const, score: { us: 27, them: 17 }, url: 'u1' };
  const team = (key: string, results: typeof tca[], upcoming: Array<{ date: string; opponent: string; site: 'home' | 'away'; url: string }>) => ({ key, name: key, maxprepsUrl: '', fetched: '2026-10-24T17:09:58.516Z', overall: '9-0', results, upcoming, held: [], notes: [] });
  // data/elizabeth/sports.json, 24 October 2026: nine results, nothing to come, on every team.
  const elizabeth: SportsData = { generated: '2026-10-24T17:09:58.516Z', sports: [team('football', [tca], []), team('volleyball', [{ ...tca, opponent: 'Ponderosa', url: 'u2' }], [])] };
  assert.equal(seasonComplete(elizabeth, now), true);
  // Berthoud the same day: football at Severance on the Friday, so the season is not complete.
  const berthoud: SportsData = { generated: '', sports: [team('football', [tca], [{ date: '2026-10-30', opponent: 'Severance', site: 'away', url: 'u3' }])] };
  assert.equal(seasonComplete(berthoud, now), false);
  // A game listed for today still counts as to come.
  const today: SportsData = { generated: '', sports: [team('football', [tca], [{ date: '2026-10-25', opponent: 'X', site: 'away', url: 'u4' }])] };
  assert.equal(seasonComplete(today, now), false);
  // Nothing played yet: nothing to say.
  assert.equal(seasonComplete({ generated: '', sports: [team('football', [], [])] }, now), false);
});

test('the strip, This week and the email read one week: football first, the last result, last week’s football', async () => {
  const { gameText, lastResultOf, resultText, weekAhead } = await import('../src/lib/school-sports.ts');
  const { townSportsWeek } = await import('../scripts/lib/sports-data.ts');
  const now = new Date('2026-10-25T15:00:00Z');
  const greeley = { date: '2026-10-23', opponent: 'Greeley Central', site: 'home' as const, result: 'W' as const, score: { us: 22, them: 0 }, url: 'g' };
  const team = (key: string, name: string, overall: string, results: typeof greeley[], upcoming: Array<{ date: string; time?: string; opponent: string; site: 'home' | 'away' | 'neutral'; url: string; venue?: string; stage?: string }>) => ({ key, name, maxprepsUrl: '', fetched: 'x', overall, results, upcoming, held: [], notes: [] });
  const data: SportsData = {
    generated: '',
    sports: [
      team('football', 'Football', '7-2', [greeley], [{ date: '2026-10-30', time: '19:00', opponent: 'Severance', site: 'away', url: 'f' }]),
      team('volleyball', 'Volleyball', '15-5', [{ ...greeley, date: '2026-10-24', opponent: 'Windsor', result: 'L', score: { us: 1, them: 3 }, url: 'v0' }], [{ date: '2026-10-26', time: '18:30', opponent: 'University', site: 'home', url: 'v1' }]),
      team('softball', 'Softball', '27-0', [], [{ date: '2026-10-31', time: '10:00', opponent: 'Fruita Monument', site: 'neutral', venue: 'Aurora Sports Park', stage: 'State Softball Tournaments', url: 's' }]),
    ],
  };
  const week = weekAhead(data, now);
  assert.deepEqual(week.games.map((g) => g.game.opponent), ['Severance', 'University', 'Fruita Monument'], 'football first, then by date');
  assert.equal(week.last!.game.opponent, 'Windsor', 'the latest result of any team');
  assert.equal(week.football!.game.opponent, 'Greeley Central', 'last week’s football');
  assert.equal(lastResultOf(data, 'football', new Date('2026-11-05T15:00:00Z')), undefined, 'a result more than a week old is not last week’s');
  assert.equal(gameText(week.games[0]!, now), 'Football at Severance · Friday, October 30 · 7 pm · Away');
  assert.equal(gameText(week.games[1]!, now), 'Volleyball vs University · Tomorrow · 6:30 pm · Home');
  assert.equal(gameText(week.games[2]!, now), 'Softball vs Fruita Monument · Saturday, October 31 · 10 am · State Softball Tournaments · Aurora Sports Park');
  assert.equal(resultText(week.football!), 'Football won 22-0 vs Greeley Central, 7-2 this season');
  assert.equal(weekAhead(data, now, 2).games.length, 2, 'the strip’s limit');
  // The scripts read the same files from disk: a town with a school and a file has a week; one without has none.
  assert.equal(townSportsWeek('berthoud', now)[0]?.school.mascot, 'Spartans');
  assert.deepEqual(townSportsWeek('estes-park', now), []);
});

test('every school carries the winter list after its fall list, ice hockey only where CHSAA lists the school, and the eyebrow’s season comes from the data', async () => {
  const { seasonOf } = await import('../src/lib/school-sports.ts');
  for (const school of SCHOOL_SPORTS) {
    const keys = school.teams.map((t) => t.key);
    assert.equal(new Set(keys).size, keys.length, `${school.school}: no team twice`);
    for (const t of school.teams) assert.ok(t.season === 'fall' || t.season === 'winter', `${school.school} ${t.key}: a season`);
    assert.ok(keys.includes('boys-basketball') && keys.includes('girls-basketball') && keys.includes('wrestling'), `${school.school}: the winter list`);
    const fall = school.teams.findIndex((t) => t.season === 'fall');
    const winter = school.teams.findIndex((t) => t.season === 'winter');
    assert.ok(fall < winter, `${school.school}: fall before winter`);
    assert.equal(keys.includes('ice-hockey'), school.school === 'Resurrection Christian School', `${school.school}: ice hockey only where CHSAA lists the school`);
    // MaxPreps has no girls' swimming page for Elizabeth or Lyons (25 October 2026).
    assert.equal(keys.includes('girls-swimming'), !['Elizabeth High School', 'Lyons Middle/Senior High School'].includes(school.school), `${school.school}: girls swimming`);
  }
  const teams = schoolSportsFor('berthoud')!.teams;
  const game = (date: string, opponent: string) => ({ date, opponent, site: 'home' as const, url: `u-${date}` });
  const team = (key: string, results: ReturnType<typeof game>[], upcoming: ReturnType<typeof game>[]) => ({ key, name: key, maxprepsUrl: '', results, upcoming, held: [], notes: [] });
  const now = new Date('2026-10-25T15:00:00Z');
  // Football still has a game: fall. Only basketball left to play: winter. Nothing to play, football the last result: fall. No games at all: the build's fall.
  const fall: SportsData = { generated: '', sports: [team('football', [], [game('2026-10-30', 'Severance')]), team('boys-basketball', [], [game('2026-12-01', 'Eaton')])] };
  assert.deepEqual(seasonOf(fall, teams, now), { season: 'Fall', year: 2026, years: '2026', label: 'Fall 2026' });
  const winter: SportsData = { generated: '', sports: [team('football', [{ ...game('2026-10-30', 'Severance'), result: 'W' as const, score: { us: 1, them: 0 } }], []), team('boys-basketball', [], [game('2026-12-01', 'Eaton')])] };
  assert.equal(seasonOf(winter, teams, new Date('2026-11-20T15:00:00Z')).label, 'Winter 2026–27');
  const january: SportsData = { generated: '', sports: [team('boys-basketball', [], [game('2027-01-12', 'Eaton')])] };
  assert.equal(seasonOf(january, teams, new Date('2027-01-05T15:00:00Z')).label, 'Winter 2026–27', 'a January game is the same winter');
  const done: SportsData = { generated: '', sports: [team('football', [{ ...game('2026-10-30', 'Severance'), result: 'W' as const, score: { us: 1, them: 0 } }], [])] };
  assert.equal(seasonOf(done, teams, new Date('2026-11-20T15:00:00Z')).label, 'Fall 2026');
  assert.equal(seasonOf({ generated: '', sports: [] }, teams, now).label, 'Fall 2026');
});

test('a result from last season on the wall of a team that is 0-0 is not this season’s: Erie basketball', () => {
  const us = { url: 'https://www.maxpreps.com/co/erie/erie-tigers/basketball/', schoolName: 'Erie' };
  const c = (id: string, url: string, year: string, played?: { us: number; them: number; result: 'W' | 'L' }, kickoff?: string) => ({
    contestId: id, year, hasResult: !!played, canonicalUrl: `${url}?c=${id}`, timestamp: played ? '2026-02-28T04:00:00' : kickoff, homeAwayType: 0, isTimeTba: false, isDateTba: false,
    teams: [{ schoolName: 'Erie', score: played?.us ?? 0, result: played?.result ?? null, teamCanonicalUrl: us.url }, { schoolName: 'Poudre', score: played?.them ?? 0, result: played ? (played.result === 'W' ? 'L' : 'W') : null, teamCanonicalUrl: 'https://www.maxpreps.com/co/x/' }],
  });
  const poudre = c('n1', 'https://www.maxpreps.com/co/basketball/game/erie-vs-poudre-fort-collins/12-1-2026/', '26-27', undefined, '2026-12-01T19:00:00');
  const rangeview = c('o1', 'https://www.maxpreps.com/co/basketball/game/erie-vs-rangeview-aurora/2-27-2026/', '25-26', { us: 37, them: 73, result: 'L' });
  const html = page(
    { teamContext: { standingsData: { overallStanding: { overallWinLossTies: '0-0' } } }, wallCards: { schedule: { data: [poudre] } }, wallPosts: [{ type: 9, title: 'Game Results', timeStamp: '2026-02-28T04:00:00', data: rangeview }] },
    'Erie Tigers Basketball Overall 0-0 Schedule at a Glance',
  );
  const p = parseTeamPage(html, us);
  assert.deepEqual(p.results, [], 'February’s game belongs to 25-26');
  assert.equal(p.glance[0]!.opponent, 'Poudre');
  // The same post with the season's own year stays.
  const same = page(
    { teamContext: { standingsData: { overallStanding: { overallWinLossTies: '0-1' } } }, wallCards: { schedule: { data: [poudre] } }, wallPosts: [{ type: 9, title: 'Game Results', timeStamp: '2026-12-02T04:00:00', data: { ...rangeview, year: '26-27' } }] },
    'Erie Tigers Basketball Overall 0-1 Schedule at a Glance',
  );
  assert.equal(parseTeamPage(same, us).results.length, 1);
});

test('titles and descriptions come from the data: the school, the mascot, the sports with data, the season’s year, the record and the next game', async () => {
  const { schoolPageTitle, sportsFullTitle, teamDescription, teamPageTitle, shortWhen } = await import('../src/lib/school-sports.ts');
  const now = new Date('2026-10-25T15:00:00Z');
  const team = (name: string, overall?: string, upcoming: SportsData['sports'][number]['upcoming'] = [], results: SportsData['sports'][number]['results'] = []) => ({ key: name.toLowerCase().replace(/ /g, '-'), name, maxprepsUrl: '', fetched: 'x', overall, upcoming, results, held: [], notes: [] });
  const football = team('Football', '7-2', [{ date: '2026-10-30', time: '19:00', opponent: 'Severance', site: 'away', url: 'u' }], [{ date: '2026-10-23', opponent: 'Mountain View', site: 'away', result: 'W', score: { us: 50, them: 0 }, url: 'r' }]);
  assert.equal(teamPageTitle(berthoud, football, '2026'), 'Berthoud Spartans Football Scores & Schedule 2026');
  assert.equal(teamPageTitle(berthoud, team('Boys basketball'), '2026–27'), 'Berthoud Spartans Boys Basketball Scores & Schedule 2026–27');
  assert.equal(teamDescription(berthoud, football, 'fall', now), 'Berthoud High football is 7-2 this fall. Next: at Severance, Friday Oct 30, 7 pm. Every score and the full schedule, from MaxPreps.');
  const softball = team('Softball', '17-10', [], [{ date: '2026-10-17', opponent: 'X', site: 'neutral', result: 'L', score: { us: 1, them: 4 }, url: 'r' }]);
  assert.equal(teamDescription(berthoud, softball, 'fall', now), 'Berthoud High softball is 17-10 this fall. Regular season complete. Every score and the full schedule, from MaxPreps.');
  const state = team('Softball', '27-0', [{ date: '2026-10-31', time: '10:00', opponent: 'Fruita Monument', site: 'neutral', neutral: true, venue: 'Aurora Sports Park', stage: 'State Softball Tournaments', url: 'u' }]);
  assert.equal(teamDescription(schoolSportsFor('windsor')!, state, 'fall', now), 'Windsor High softball is 27-0 this fall. Next: vs Fruita Monument, Saturday Oct 31, 10 am, State Softball Tournaments. Every score and the full schedule, from MaxPreps.');
  assert.equal(shortWhen({ date: '2026-11-07', opponent: 'x', site: 'home', url: 'u' }), 'Saturday Nov 7', 'no time, no comma');
  // The school's title names the school, not every sport: each has its own page (audit, 26 October 2026).
  assert.equal(schoolPageTitle(berthoud), 'Berthoud High School Spartans Scores & Schedules');
  // The guide's name goes on where the whole fits in 70; the longest school and sport names go without it.
  assert.equal(sportsFullTitle('Berthoud Spartans Football Scores & Schedule 2026', 'Inside Berthoud'), 'Berthoud Spartans Football Scores & Schedule 2026 · Inside Berthoud');
  assert.equal(sportsFullTitle('Mountain View Mountain Lions Girls Basketball Scores & Schedule 2026–27', 'Inside Loveland'), 'Mountain View Mountain Lions Girls Basketball Scores & Schedule 2026–27');
  // Every school and team title in the network, as the pages write it, stays inside 75 characters (it ran to 91).
  for (const school of SCHOOL_SPORTS) {
    const guide = findTown(school.town)!.siteTitle;
    const titles = [schoolPageTitle(school), ...school.teams.map((t) => teamPageTitle(school, t, t.season === 'winter' ? '2026–27' : '2026'))];
    for (const title of titles) assert.ok(sportsFullTitle(title, guide).length <= 75, sportsFullTitle(title, guide));
  }
});

/*
 * No SportsEvent on the sports pages: a schedule of many games is not the
 * page per event Google's guidelines ask for, and games among minors on a
 * school's premises are named there as ineligible (26 October 2026).
 */
test('the sports pages carry no Event markup per game', async () => {
  const seo = await import('../src/lib/seo.ts');
  assert.equal('sportsEventJsonLd' in seo, false, 'the builder is gone');
  for (const route of ['src/routes/town/sports.astro', 'src/routes/town/sports-team.astro']) {
    assert.doesNotMatch(readFileSync(route, 'utf8'), /SportsEvent'|sportsEventJsonLd\(/, route);
  }
});

test('a share card is a 1200×630 PNG in the school’s colour, named for the school or the team', async () => {
  const { renderShareCard, SHARE_HEIGHT, SHARE_WIDTH } = await import('../src/lib/share-image.ts');
  const sharp = (await import('sharp')).default;
  const png = await renderShareCard({ color: '#572932', title: 'Spartans football', record: '7-2 this fall · 3-1 in the 3A Cache la Poudre', footer: 'Scores and schedules · Inside Berthoud' });
  const meta = await sharp(png).metadata();
  assert.equal(meta.format, 'png');
  assert.equal(meta.width, SHARE_WIDTH);
  assert.equal(meta.height, SHARE_HEIGHT);
  // The corner is the school's colour; the type is white somewhere on it.
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([data[0], data[1], data[2]], [0x57, 0x29, 0x32]);
  let white = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i]! > 240 && data[i + 1]! > 240 && data[i + 2]! > 240) white++;
  assert.ok(white > 2000, `white type on the card (${white} pixels)`);
  assert.equal(shareImageName(berthoud), 'school');
  assert.equal(shareImagePath(berthoud, 'football'), '/sports/share/football.png');
  assert.equal(shareImagePath(schoolsFor('loveland')[2]!, 'football'), '/sports/share/mountain-view-football.png');
  assert.equal(shareImagePath(schoolsFor('loveland')[2]!), '/sports/share/mountain-view.png');
  assert.ok(sportsRoutes('berthoud').some(([p, f]) => p === '/sports/share/[image].png' && f === 'sports-share.png.ts'));
});

test('the sports pages’ CollectionPage carries dateModified from the run, and the hub’s index gets a record per school and team page', async () => {
  const { collectionPageJsonLd } = await import('../src/lib/seo.ts');
  const { sportsRecord, recordHtml } = await import('../src/lib/network-search.ts');
  const town = findTown('berthoud')!;
  const page = collectionPageJsonLd(town, { name: 'x', description: 'y', path: '/sports/', updated: new Date('2026-10-24T17:07:31.253Z') });
  assert.equal(page.dateModified, '2026-10-24T11:07:31-06:00', 'the run’s instant, in Denver’s offset');
  assert.equal('dateModified' in collectionPageJsonLd(town, { name: 'x', description: 'y', path: '/sports/' }), false, 'nothing when the date is unknown');
  const record = sportsRecord(town, berthoud, { path: '/sports/football/', title: 'Berthoud Spartans Football Scores & Schedule 2026', description: 'Berthoud High football is 7-2 this fall.' }, [{ name: 'Football', overall: '7-2', opponents: ['Severance', 'Mountain View'] }]);
  assert.equal(record.url, 'https://insideberthoud.com/sports/football/');
  assert.equal(record.kind, 'Sports');
  assert.equal(record.lead, 'Football 7-2');
  assert.match(record.text!, /Spartans.*Severance/);
  assert.match(recordHtml(record), /data-pagefind-meta="kind:Sports"/);
});

test('a league place is shown only once a league game is played: MaxPreps ranks every 0-0 team first', async () => {
  const { leaguePlace } = await import('../src/lib/school-sports.ts');
  assert.equal(leaguePlace({ league: { record: '0-0', name: '6A Front Range', place: '1st' } }), undefined, 'Erie basketball, 25 October 2026');
  assert.equal(leaguePlace({ league: { record: '0-0-0', name: 'x', place: '1st' } }), undefined);
  assert.equal(leaguePlace({ league: { record: '3-1', name: '3A Cache la Poudre', place: '3rd' } }), '3rd');
  assert.equal(leaguePlace({ league: { record: '0-2', name: 'x', place: '7th' } }), '7th', 'a winless team that has played has a place');
  assert.equal(leaguePlace({}), undefined);
});

test('the email’s "Last week" is a result from the past seven days: football’s, else any team’s, else nothing', async () => {
  const { recentResult, weekAhead } = await import('../src/lib/school-sports.ts');
  const result = (date: string, opponent: string) => ({ date, opponent, site: 'home' as const, result: 'W' as const, score: { us: 3, them: 1 }, url: `u-${date}` });
  const team = (key: string, results: ReturnType<typeof result>[]) => ({ key, name: key, maxprepsUrl: '', fetched: 'x', results, upcoming: [], held: [], notes: [] });
  const now = new Date('2026-11-12T15:00:00Z');
  // Football done on 30 October, softball on 24 October: nothing in the week before 12 November.
  const quiet: SportsData = { generated: '', sports: [team('football', [result('2026-10-30', 'Severance')]), team('softball', [result('2026-10-24', 'Holy Family')])] };
  assert.equal(recentResult(quiet, now), undefined, 'an old result is not last week’s');
  assert.equal(weekAhead(quiet, now).football, undefined);
  assert.equal(weekAhead(quiet, now).last!.game.opponent, 'Severance', 'the page’s "Last out" still has it');
  // Volleyball played on the 10th: that is last week's.
  const busy: SportsData = { generated: '', sports: [...quiet.sports, team('volleyball', [result('2026-11-10', 'Erie')])] };
  assert.equal(recentResult(busy, now)!.game.opponent, 'Erie');
});

test('the email’s games carry their day in full, and a shared edition gives them a section of their own (29 October 2026)', async () => {
  const { weekAhead } = await import('../src/lib/school-sports.ts');
  const { schoolWeekLines, sharedGames, townGames } = await import('../scripts/lib/email-sports.ts');
  const send = new Date('2026-10-29T06:00:00Z'); // Thursday, midnight in Denver
  const game = (date: string, opponent: string, site: 'home' | 'away' | 'neutral', time: string, extra = {}) => ({ date, opponent, site, time, url: `u-${opponent}`, ...extra });
  const team = (key: string, name: string, overall: string, upcoming: unknown[], results: unknown[] = []) => ({ key, name, overall, maxprepsUrl: '', fetched: 'x', results, upcoming, held: [], notes: [] });
  const windsor = { generated: '', sports: [
    team('football', 'Football', '4-5', [game('2026-10-29', 'Greeley Central', 'away', '19:00')], [{ date: '2026-10-22', opponent: 'Thompson Valley', site: 'away', url: 'u-tv', result: 'W', score: { us: 56, them: 14 } }]),
    team('boys-soccer', 'Boys soccer', '10-1-4', [game('2026-10-29', 'Rampart', 'neutral', '18:00', { stage: 'Boys Soccer State Championships', neutral: true })]),
    team('volleyball', 'Volleyball', '13-6', [game('2026-10-30', 'Legend', 'away', '08:00')]),
  ] } as SportsData;
  const timnath = { generated: '', sports: [team('football', 'Football', '7-2', [game('2026-10-30', 'Fort Morgan', 'away', '19:00')])] } as SportsData;
  const quiet = { generated: '', sports: [team('football', 'Football', '3-6', [])] } as SportsData;
  const week = (school: ReturnType<typeof schoolSportsFor>, data: SportsData) => ({ school: school!, week: weekAhead(data, send) });

  const lines = schoolWeekLines(week(schoolSportsFor('windsor'), windsor), 'S');
  assert.equal(lines[0], '- **Thursday, October 29 · 7 pm · Away** [Football at Greeley Central](u-Greeley Central) · 4-5 this season', 'football first, its day in full');
  assert.equal(lines[1], '- **Thursday, October 29 · 6 pm · Boys Soccer State Championships** [Boys soccer vs Rampart](u-Rampart) · 10-1-4 this season');
  assert.equal(lines[2], '- **Friday, October 30 · 8 am · Away** [Volleyball at Legend](u-Legend) · 13-6 this season');
  assert.ok(lines.includes('Last week: football won 56-14 at Thompson Valley, 4-5 this season.'));
  assert.doesNotMatch(lines.join('\n'), /Today|Tomorrow/, 'merged on the Friday, or read in the archive, "Today" would be wrong');
  assert.equal(townGames([week(schoolSportsFor('windsor'), windsor)], 'S')[0], '## Windsor Wizards this week');

  // Windsor, Severance and Timnath: the games are their own section, split by town like the edition's others.
  const shared = sharedGames([
    { heading: 'Windsor and Severance', sports: [week(schoolSportsFor('windsor'), windsor)], scores: 'W' },
    { heading: 'Timnath', sports: [week(schoolSportsFor('timnath'), timnath)], scores: 'T' },
  ]);
  assert.deepEqual(shared.filter((l) => l.startsWith('#')), ['## Windsor Wizards and Timnath Cubs this week', '### Windsor and Severance', '### Timnath'], 'not under "This weekend"');
  assert.ok(shared.includes('[Scores and schedules](T)'));
  // A town following two schools names each.
  const [loveland, , mountainView] = schoolsFor('loveland');
  const two = sharedGames([{ heading: 'Loveland', sports: [week(loveland, timnath), week(mountainView, timnath)], scores: 'L' }]);
  assert.deepEqual(two.filter((l) => l.startsWith('###')), [`### Loveland: ${schoolTeamName(loveland!)}`, `### Loveland: ${schoolTeamName(mountainView!)}`]);

  // A school with no games and no result this week: no heading, and a section only where another has something.
  assert.deepEqual(schoolWeekLines(week(schoolSportsFor('niwot'), quiet), 'S'), []);
  assert.deepEqual(townGames([week(schoolSportsFor('niwot'), quiet)], 'S'), []);
  assert.deepEqual(sharedGames([{ heading: 'Timnath', sports: [week(schoolSportsFor('timnath'), quiet)], scores: 'T' }]), []);
  const one = sharedGames([
    { heading: 'Windsor and Severance', sports: [week(schoolSportsFor('windsor'), quiet)], scores: 'W' },
    { heading: 'Timnath', sports: [week(schoolSportsFor('timnath'), timnath)], scores: 'T' },
  ]);
  assert.deepEqual(one.filter((l) => l.startsWith('#')), ['## Timnath Cubs this week', '### Timnath']);
});

test('a school’s teams are called by its short name and mascot, as people search for them', async () => {
  const { teamPageTitle } = await import('../src/lib/school-sports.ts');
  assert.equal(schoolTeamName(schoolSportsFor('lyons')!), 'Lyons Lions', 'not "Lyons Middle/Senior Lions"');
  assert.equal(schoolTeamName(schoolSportsFor('timnath')!), 'Timnath Cubs', 'not "Timnath Middle-High Cubs"');
  assert.equal(schoolTeamName(schoolSportsFor('johnstown')!), 'Roosevelt Roughriders');
  assert.equal(schoolTeamName(schoolSportsFor('loveland', 'resurrection-christian')!), 'Resurrection Christian Cougars');
  assert.equal(teamPageTitle(schoolSportsFor('lyons')!, { name: 'Football' }, '2026'), 'Lyons Lions Football Scores & Schedule 2026');
  for (const s of SCHOOL_SPORTS) assert.doesNotMatch(schoolTeamName(s), /School|Middle|Senior|\//, s.school);
});

test('a forfeit and a game nobody scored are read, not a reason to drop the whole schedule (25 October 2026)', async () => {
  const { outcome } = await import('../src/lib/school-sports.ts');
  // Resurrection Christian softball: "won by forfeit", the data W 0-0.
  const rc = { name: 'Resurrection Christian', url: 'https://www.maxpreps.com/co/loveland/resurrection-christian-cougars/softball/fall/' };
  const forfeit = scheduleRow({
    id: 'f1', url: 'https://www.maxpreps.com/co/softball/game/peak-to-peak-vs-resurrection-christian/10-6-2026/', kickoff: '2026-10-06T16:00:00', played: true,
    sentence: 'On 10/6, the Resurrection Christian varsity softball team won by forfeit in their away non-conference game against Peak to Peak (Lafayette, CO).',
    teams: [{ ...rc, away: true, result: 'W', score: 0 }, { name: 'Peak to Peak', url: 'https://www.maxpreps.com/co/lafayette/peak-to-peak-pumas/softball/fall/', away: false, result: 'L', score: 0 }],
  });
  const read = parseSchedulePage(schedulePage([forfeit]), { url: rc.url, schoolName: rc.name });
  assert.deepEqual(read.warnings, []);
  assert.equal(read.games[0]!.result, 'W');
  assert.equal(read.games[0]!.forfeit, true);
  assert.equal(read.games[0]!.score, undefined, 'no 0-0 shown for a forfeit');
  assert.equal(outcome(read.games[0]!), 'by forfeit at Peak to Peak');
  // The word has to match the data, as for any result.
  const wrong = structuredClone(forfeit) as unknown[];
  wrong[29] = 'On 10/6, the Resurrection Christian varsity softball team lost by forfeit in their away non-conference game against Peak to Peak (Lafayette, CO).';
  assert.equal(parseSchedulePage(schedulePage([wrong]), { url: rc.url, schoolName: rc.name }).warnings.length, 1);

  // Erie volleyball: a past tournament match with no result reported.
  const erie = { name: 'Erie', url: 'https://www.maxpreps.com/co/erie/erie-tigers/volleyball/' };
  const unreported = scheduleRow({
    id: 'u1', url: 'https://www.maxpreps.com/co/volleyball/match/erie-vs-pine-creek/9-12-2026/', kickoff: '2026-09-12T09:00:00',
    sentence: 'No result has been reported for the Pine Creek varsity volleyball neutral tournament match vs. Erie (CO).',
    teams: [{ name: 'Pine Creek', url: 'https://www.maxpreps.com/co/colorado-springs/pine-creek-eagles/volleyball/', away: 'neutral' }, { ...erie, away: 'neutral' }],
  });
  const vb = parseSchedulePage(schedulePage([unreported]), { url: erie.url, schoolName: erie.name });
  assert.deepEqual(vb.warnings, []);
  assert.equal(vb.games.length, 1);
  const [g] = vb.games;
  assert.equal(g!.result, undefined);
  assert.equal(g!.time, undefined, 'no time: it is not a game to come');
  assert.equal(g!.stage, 'Tournament');
  assert.deepEqual(gamesToCome({ url: erie.url, glance: [], results: [], warnings: [], schedule: vb.games }, '2026-10-25'), [], 'never listed as next');
});

test('a bracket slot MaxPreps has not filled is named as one, not as an unreadable game (Elizabeth football, 25 October 2026)', () => {
  const us = { url: 'https://www.maxpreps.com/co/elizabeth/elizabeth-cardinals/football/', schoolName: 'Elizabeth' };
  const slot = {
    contestId: '39f3', hasResult: false, canonicalUrl: null, timestamp: '1900-01-01T00:00:00', homeAwayType: 2, isTimeTba: true, isDateTba: true,
    teams: [{ schoolName: 'Elizabeth', score: null, result: null, teamCanonicalUrl: us.url }, { schoolName: null, score: null, result: null, teamCanonicalUrl: null }],
    tournament: { tournamentName: null, bracketName: 'Class 2A' },
  };
  const tca = { contestId: 'c1', hasResult: true, canonicalUrl: 'https://www.maxpreps.com/co/football/game/elizabeth-vs-tca/10-23-2026/?c=c1', timestamp: '2026-10-24T03:15:04', homeAwayType: 0, isTimeTba: false, isDateTba: false,
    teams: [{ schoolName: 'Elizabeth', score: 27, result: 'W', teamCanonicalUrl: us.url }, { schoolName: 'The Classical Academy', score: 17, result: 'L', teamCanonicalUrl: 'https://x/' }] };
  const p = parseTeamPage(page({ teamContext: { standingsData: { overallStanding: { overallWinLossTies: '9-0' } } }, wallCards: { schedule: { data: [tca, slot] } }, wallPosts: [] }, 'Elizabeth Football Overall 9-0 Schedule at a Glance'), us);
  assert.deepEqual(p.warnings, ['a Class 2A bracket game with its date and opponent still to be set']);
  assert.equal(p.glance.length, 1, 'nothing invented for the slot');
});
