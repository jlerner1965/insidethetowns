/**
 * CHSAA's postseason games merged into the MaxPreps files as the pages read
 * them (src/config/postseason.ts, `withPostseason`; network audit, 8
 * November 2026): a state match MaxPreps filed as away or home is played at
 * the Denver Coliseum, a state qualifier MaxPreps has no match for still
 * shows its first match, and a team with a first-round bye is not called
 * finished before its playoff game.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POSTSEASON, type PostseasonGame } from '../src/config/postseason.ts';
import { schoolSportsFor, type SportData, type SportsData } from '../src/config/school-sports.ts';
import { seasonOver, withPostseason } from '../src/lib/school-sports.ts';
import { readSportsData } from '../scripts/lib/sports-data.ts';
import { fileURLToPath } from 'node:url';

const SUNDAY = new Date('2026-11-08T19:00:00Z');
/**
 * The sports files as the run of 11 November 2026 wrote them
 * (test/fixtures/sports/_README.md). The live files are rewritten after
 * every run: once Severance's game with Pueblo East was played, the live
 * file carried it as a result and this read failed with nothing wrong (14
 * November 2026).
 */
const FROZEN = fileURLToPath(new URL('./fixtures/sports/', import.meta.url));

function team(key: string, over: Partial<SportData> = {}): SportData {
  return { key, name: key, maxprepsUrl: 'https://www.maxpreps.com/x/', fetched: '2026-11-08T18:00:00Z', overall: '19-6', results: [], upcoming: [], held: [], notes: [], ...over };
}

const row = (over: Partial<PostseasonGame> = {}): PostseasonGame => ({
  town: 'berthoud',
  team: 'volleyball',
  date: '2026-11-12',
  time: '08:00',
  opponent: 'Eaton',
  venue: 'Denver Coliseum',
  stage: 'State Championships',
  source: 'https://chsaanow.com/brackets/girls-volleyball/2026/state/3a',
  read: '2026-11-08',
  ...over,
});

test('every postseason row names a school and a team the guides follow, in the formats the pages read', () => {
  for (const g of POSTSEASON) {
    const school = schoolSportsFor(g.town, g.slug);
    assert.ok(school, `${g.town}${g.slug ? `/${g.slug}` : ''} follows no school`);
    assert.ok(school.teams.some((t) => t.key === g.team), `${school.school} has no ${g.team} team`);
    assert.match(g.date, /^\d{4}-\d{2}-\d{2}$/);
    if (g.time) assert.match(g.time, /^\d{2}:\d{2}$/);
    assert.match(g.read, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(g.read <= g.date, `${g.town} ${g.team}: read after the game`);
    assert.match(g.source, /^https:\/\/chsaanow\.com\/brackets\//, 'CHSAA brackets only');
  }
});

test('a state match MaxPreps files as away takes the bracket’s site, venue, stage and time, and keeps its MaxPreps page', () => {
  const maxpreps = 'https://www.maxpreps.com/co/volleyball/match/berthoud-vs-eaton-fightin-reds/11-12-2026/';
  const data: SportsData = { generated: '', sports: [team('volleyball', { upcoming: [{ date: '2026-11-12', time: '08:00', opponent: 'Eaton', site: 'away', url: maxpreps }] })] };
  const merged = withPostseason({ town: 'berthoud' }, data, SUNDAY, [row()]);
  const g = merged.sports[0]!.upcoming[0]!;
  assert.equal(g.site, 'neutral');
  assert.equal(g.neutral, true);
  assert.equal(g.venue, 'Denver Coliseum');
  assert.equal(g.stage, 'State Championships');
  assert.equal(g.url, maxpreps);
  assert.deepEqual(g.chsaa, { url: row().source, read: '2026-11-08' });
  assert.equal(merged.sports[0]!.upcoming.length, 1, 'one game, not two');
  // The file the build shares between pages is left as it was.
  assert.equal(data.sports[0]!.upcoming[0]!.site, 'away');
});

test('a state match MaxPreps does not carry yet is added, linked to the bracket', () => {
  const data: SportsData = { generated: '', sports: [team('volleyball'), team('football')] };
  const merged = withPostseason({ town: 'niwot' }, data, SUNDAY, [row({ town: 'niwot', opponent: 'Mead', time: '11:00', source: 'https://chsaanow.com/brackets/girls-volleyball/2026/state/4a' })]);
  const g = merged.sports[0]!.upcoming[0]!;
  assert.equal(g.opponent, 'Mead');
  assert.equal(g.time, '11:00');
  assert.ok(g.url.startsWith('https://chsaanow.com/brackets/girls-volleyball/2026/state/4a#'));
  assert.equal(merged.sports[1], data.sports[1], 'a team with no row is the same object');
});

test('an opponent still to be decided matches whichever team MaxPreps names', () => {
  const data: SportsData = { generated: '', sports: [team('volleyball', { upcoming: [{ date: '2026-11-12', opponent: 'Platte Valley', site: 'home', url: 'https://www.maxpreps.com/m/' }] })] };
  const merged = withPostseason({ town: 'windsor', slug: 'windsor-high' }, data, SUNDAY, [row({ town: 'windsor', slug: 'windsor-high', opponent: 'Alamosa or Platte Valley', time: '18:30' })]);
  assert.equal(merged.sports[0]!.upcoming.length, 1);
  assert.equal(merged.sports[0]!.upcoming[0]!.opponent, 'Platte Valley');
  assert.equal(merged.sports[0]!.upcoming[0]!.venue, 'Denver Coliseum');
});

test('a row for another school of the same town, a played game or a passed day changes nothing', () => {
  const data: SportsData = { generated: '', sports: [team('volleyball', { results: [{ date: '2026-11-12', opponent: 'Eaton', site: 'away', result: 'W', score: { us: 3, them: 1 }, url: 'https://www.maxpreps.com/r/' }] })] };
  assert.equal(withPostseason({ town: 'windsor', slug: 'severance-high' }, data, SUNDAY, [row({ town: 'windsor', slug: 'windsor-high' })]), data);
  assert.equal(withPostseason({ town: 'berthoud' }, data, SUNDAY, [row()]).sports[0]!.upcoming.length, 0, 'the result is there; no game to come is added');
  assert.equal(withPostseason({ town: 'berthoud' }, data, new Date('2026-11-13T19:00:00Z'), [row()]), data);
});

test('a team with a first-round bye is not called finished while its playoff game is to come', () => {
  // Timnath's football (3A, No. 7, a bye on 6 November 2026 and Eagle Valley
  // on the 13th) was read here from data/timnath/ until that guide was
  // folded into its page on the hub on 12 November 2026 and its data left
  // with it; no school still followed had a bye, so the case is built: a
  // last result nine days back, nothing to come on MaxPreps, and CHSAA's row.
  const football = team('football', { overall: '8-2', results: [{ date: '2026-10-30', opponent: 'Severance', site: 'home', result: 'W', score: { us: 28, them: 14 }, url: 'https://www.maxpreps.com/r/' }] });
  const data: SportsData = { generated: '', sports: [football] };
  assert.equal(seasonOver(football, '2026-11-08'), true, 'on MaxPreps alone the season reads as over');
  const bye = row({ town: 'berthoud', team: 'football', date: '2026-11-13', time: undefined, opponent: 'Eagle Valley', venue: undefined, stage: 'State Football Playoffs', source: 'https://chsaanow.com/brackets/football/2026/state/3a' });
  const merged = withPostseason({ town: 'berthoud' }, data, SUNDAY, [bye]).sports.find((t) => t.key === 'football');
  assert.ok(merged, 'the football team');
  assert.equal(merged.upcoming[0]?.opponent, 'Eagle Valley');
  assert.equal(seasonOver(merged, '2026-11-08'), false);
});

test('the data files as the pages read them carry the postseason rows of the schools still followed', () => {
  // Severance High's football file as of 11 November and CHSAA's row for Pueblo East at Dutch Clark on 13 November 2026.
  const severance = readSportsData({ town: 'windsor', slug: 'severance-high' }, FROZEN, SUNDAY);
  const football = severance?.sports.find((t) => t.key === 'football');
  assert.ok(football, 'Severance’s football data');
  assert.equal(football.upcoming[0]?.opponent, 'Pueblo East');
  assert.equal(football.upcoming.filter((g) => g.date === '2026-11-13').length, 1, 'one game, not MaxPreps’s and CHSAA’s both');
  assert.equal(seasonOver(football, '2026-11-08'), false);
});
