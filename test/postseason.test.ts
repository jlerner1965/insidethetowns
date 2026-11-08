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

const SUNDAY = new Date('2026-11-08T19:00:00Z');

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
  const merged = withPostseason({ town: 'loveland', slug: 'resurrection-christian' }, data, SUNDAY, [row({ town: 'loveland', slug: 'resurrection-christian', opponent: 'Alamosa or Platte Valley', time: '18:30' })]);
  assert.equal(merged.sports[0]!.upcoming.length, 1);
  assert.equal(merged.sports[0]!.upcoming[0]!.opponent, 'Platte Valley');
  assert.equal(merged.sports[0]!.upcoming[0]!.venue, 'Denver Coliseum');
});

test('a row for another school of the same town, a played game or a passed day changes nothing', () => {
  const data: SportsData = { generated: '', sports: [team('volleyball', { results: [{ date: '2026-11-12', opponent: 'Eaton', site: 'away', result: 'W', score: { us: 3, them: 1 }, url: 'https://www.maxpreps.com/r/' }] })] };
  assert.equal(withPostseason({ town: 'loveland', slug: 'mountain-view' }, data, SUNDAY, [row({ town: 'loveland', slug: 'resurrection-christian' })]), data);
  assert.equal(withPostseason({ town: 'berthoud' }, data, SUNDAY, [row()]).sports[0]!.upcoming.length, 0, 'the result is there; no game to come is added');
  assert.equal(withPostseason({ town: 'berthoud' }, data, new Date('2026-11-13T19:00:00Z'), [row()]), data);
});

test('a team with a first-round bye is not called finished while its playoff game is to come', () => {
  const timnath = readSportsData({ town: 'timnath' }, undefined, SUNDAY);
  const football = timnath?.sports.find((t) => t.key === 'football');
  assert.ok(football, 'Timnath’s football data');
  assert.equal(football.upcoming[0]?.opponent, 'Eagle Valley');
  assert.equal(seasonOver(football, '2026-11-08'), false);
});
