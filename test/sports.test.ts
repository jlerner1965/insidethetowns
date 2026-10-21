/**
 * Berthoud High sports (scripts/sports.ts): the MaxPreps page read from its
 * own data, the school calendar's titles read, and the cross-check that
 * holds a game the two disagree on.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTeamPage } from '../scripts/lib/maxpreps.ts';
import { parseMonth, parseTitle } from '../scripts/lib/bhs-calendar.ts';
import { crossCheck, gamesToCome, keepPrevious, sameSchool } from '../scripts/lib/sports-crosscheck.ts';
import { BERTHOUD_SPORTS, type SportsData } from '../src/config/berthoud-sports.ts';

const football = BERTHOUD_SPORTS.find((s) => s.key === 'football')!;
const US = 'https://www.maxpreps.com/co/berthoud/berthoud-spartans/football/';

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
  const p = parseTeamPage(realPage, 'football');
  assert.equal(p.overall, '6-2');
  assert.deepEqual(p.league, { record: '3-1', name: '3A Cache la Poudre', place: '3rd' });
  assert.equal(p.updatedOn, '2026-10-21T14:37:47');
  assert.deepEqual(
    p.glance.map((g) => [g.date, g.site, g.opponent, g.result ?? g.time]),
    [['2026-10-15', 'home', 'Greeley Central', 'W'], ['2026-10-23', 'away', 'Mountain View', '19:00'], ['2026-10-30', 'away', 'Severance', '19:00']],
  );
  assert.deepEqual(p.glance[0]!.score, { us: 22, them: 0 });
  assert.equal(p.glance[1]!.url, 'https://www.maxpreps.com/co/football/game/berthoud-vs-mountain-view-loveland/10-23-2026/', 'the game page, without the tracking query');
  assert.deepEqual(p.warnings, []);
});

test('a played game is dated by its page URL, not the GMT instant the score went in', () => {
  const p = parseTeamPage(realPage, 'football');
  assert.deepEqual(p.results.map((g) => [g.date, g.opponent, `${g.result} ${g.score!.us}-${g.score!.them}`]), [
    ['2026-10-15', 'Greeley Central', 'W 22-0'],
    ['2026-10-09', 'Windsor', 'L 0-46'],
  ]);
  assert.equal(p.results.length, 2, 'the same result posted twice counts once');
});

test('a page without its data, or whose visible records differ from its data, is reported rather than trusted', () => {
  const blocked = parseTeamPage('<html><title>403 - Forbidden</title></html>', 'football');
  assert.equal(blocked.overall, undefined);
  assert.deepEqual(blocked.warnings, ['no __NEXT_DATA__ on the page']);
  const drifted = parseTeamPage(realPage.replace('Overall 6-2', 'Overall 7-2'), 'football');
  assert.ok(drifted.warnings.some((w) => w.includes('7-2')), drifted.warnings.join('; '));
});

test('a team MaxPreps has nothing for is told apart from a page that could not be read', () => {
  const empty = page(
    { teamContext: { standingsData: { overallStanding: { overallWinLossTies: '0-0' } } }, wallCards: {}, wallPosts: [] },
    'Berthoud Spartans Varsity Boys Cross Country Overall 0-0 League Schedule at a Glance No Schedule If you have the full schedule, send it to MaxPreps.',
  );
  const p = parseTeamPage(empty, 'cross-country');
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
<a class="fsCalendarTitle fsCalendarEventLink" title="Girls Varsity Volleyball vs Eaton High School" data-occur-id="1_2026-10-07T00:30:00Z_2026-10-07T02:00:00Z" href="#">x</a>`;

test('a month page gives each event once, in Denver time', () => {
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
  const p = parseTeamPage(realPage, 'football');
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
  const kept = keepPrevious(football, previous);
  assert.equal(kept.fetched, '2026-10-14T14:00:00Z');
  assert.equal(kept.overall, '5-2');
  const fresh = keepPrevious(football, undefined);
  assert.equal(fresh.fetched, undefined, 'no earlier entry: the card says it has not been read');
});
