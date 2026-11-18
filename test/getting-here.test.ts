/**
 * Getting here through the year (the owner's navigation brief of 18
 * November 2026, item 7; src/lib/getting-here.ts): every town page lists
 * Denver International with its miles and time; a drive the page prints
 * over a pass closed in winter carries the year-round route, from the same
 * router; and Leadville lists Eagle County beside Aspen, whose road is
 * over Independence Pass.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { STANDALONE_GUIDES } from '../src/config/hub-towns.ts';
import { PASSES, type Pass } from '../src/config/passes.ts';
import { DEN, airportKey, airportRows, fromDenverKey, winterLine, winterNote, type GettingHere } from '../src/lib/getting-here.ts';
import { laterCheck, profileView } from '../src/lib/hub-town-page.ts';
import { publishedHubTowns } from '../src/lib/hub-towns.ts';
import { nearView } from '../src/lib/near-view.ts';
import { pairKey, type Airports, type RoadMiles } from '../src/lib/near.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';

const json = <T>(file: string): T => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')) as T;
const roads = json<RoadMiles>('data/hub/road-miles.json');
const airports = json<Airports>('data/hub/airports.json');
const gh = json<GettingHere>('data/hub/getting-here.json');
const published = publishedHubTowns(rawRecords('.', {}));
const withPage = new Set([...published.map((t) => t.slug), ...Object.keys(STANDALONE_GUIDES)]);
const town = (slug: string) => published.find((t) => t.slug === slug)!;
const view = (slug: string) => profileView(town(slug), { roads, airports, gettingHere: gh });
/** Passes whose closed road ends at a summit, so no drive between towns crosses them (scripts/getting-here.ts, SPURS). */
const SPURS = ['mount-blue-sky-highway'];

test('every town page lists Denver International with its miles and drive time, once, after the nearest', () => {
  for (const t of published) {
    const rows = view(t.slug).airports;
    const den = rows.filter((a) => a.code === DEN);
    assert.equal(den.length, 1, `${t.slug}: DEN once`);
    assert.ok(den[0]!.miles > 0 && den[0]!.minutes > 0, `${t.slug}: DEN has miles and time`);
    assert.equal(rows[0]!.nearest, true, `${t.slug}: the nearest by road first`);
    assert.equal(rows[0]!.code, roads.airport[t.slug]!.code, t.slug);
    assert.equal(new Set(rows.map((a) => a.code)).size, rows.length, `${t.slug}: an airport once`);
    for (const a of rows) assert.ok(a.minutes > 0 && airports.airports.some((x) => x.code === a.code), `${t.slug}: ${a.code}`);
  }
  // Where DEN is the nearest, it is the road-miles figure and the only row.
  const near = published.find((t) => roads.airport[t.slug]?.code === DEN)!;
  assert.deepEqual(view(near.slug).airports.map((a) => [a.code, a.miles]), [[DEN, roads.airport[near.slug]!.miles]]);
});

test('the rows: nearest first, then by miles, DEN listed where the file has it, a winter note where the drive has one', () => {
  const file: GettingHere = {
    checked: '2026-11-18',
    source: { name: 'Router', url: 'https://example.org/' },
    pointSource: { name: 'GNIS', url: 'https://example.org/' },
    passes: {},
    waypoints: { g: { name: 'Glenwood Springs', gnisId: 1, lat: 0, lon: 0 } },
    airports: { x: { DEN: { miles: 120, minutes: 150 }, EGE: { miles: 64, minutes: 80 } } },
    routes: { [airportKey('x', 'ASE')]: { over: ['independence-pass'], yearRound: { miles: 128.5, minutes: 169, via: ['g'] } } },
  };
  const rows = airportRows('x', { ...roads, airport: { x: { code: 'ASE', miles: 62.6, minutes: 129 } } }, airports, file, PASSES);
  assert.deepEqual(rows.map((r) => [r.code, r.nearest]), [['ASE', true], ['EGE', false], [DEN, false]]);
  assert.equal(rows[0]!.winter?.line, 'Over Independence Pass, which is closed in winter. Year-round, by way of Glenwood Springs: 129 miles, about 2 hours 50 minutes.');
  assert.equal(rows[0]!.winter?.checked, '2026-11-18');
  assert.equal(rows[1]!.winter, undefined);
});

test('a note names every pass on the way, and without a year-round figure it says only that', () => {
  const p = (name: string) => ({ name }) as Pass;
  assert.equal(winterLine({ over: [p('Kebler Pass')] }), 'Over Kebler Pass, which is closed in winter.');
  assert.equal(winterLine({ over: [p('Kebler Pass'), p('Cottonwood Pass')], yearRound: { miles: 9.44, minutes: 22, via: ['Gunnison', 'Crawford'] } }), 'Over Kebler Pass and Cottonwood Pass, which are closed in winter. Year-round, by way of Gunnison and Crawford: 9.4 miles, about 20 minutes.');
});

test('the file: one router and one check date, every pass point from GNIS, every pass that closes is checked', () => {
  assert.equal(gh.source.url, roads.source.url, 'the same router as the road miles');
  assert.match(gh.checked, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(gh.pointSource.url, /usgs\.gov/);
  for (const p of PASSES.filter((x) => x.seasonalClosure && !SPURS.includes(x.slug))) assert.ok(gh.passes[p.slug]?.length, `${p.slug} closes in winter and is not checked; run scripts/getting-here.ts`);
  for (const [slug, points] of Object.entries(gh.passes)) {
    assert.ok(PASSES.find((p) => p.slug === slug)?.seasonalClosure, `${slug}: checked but has no closure`);
    for (const pt of points) assert.ok(pt.gnisId > 0 && pt.lat > 36 && pt.lat < 41.1 && pt.lon > -109.1 && pt.lon < -102, `${slug}: ${pt.name}`);
  }
  for (const w of Object.values(gh.waypoints)) assert.ok(w.gnisId > 0, w.name);
});

test('a drive over a pass closed in winter carries its year-round route, longer than the road over the pass, by named places', () => {
  const printed = new Set<string>();
  for (const t of published) {
    printed.add(fromDenverKey(t.slug));
    for (const a of view(t.slug).airports) printed.add(airportKey(t.slug, a.code));
  }
  for (const p of withPage) for (const n of nearView(p, roads, withPage, true, gh).near) printed.add(pairKey(p, n.place));
  assert.ok(Object.keys(gh.routes).length > 0);
  for (const [key, route] of Object.entries(gh.routes)) {
    assert.ok(printed.has(key), `${key}: a drive no page prints`);
    assert.ok(route.over.length > 0 && route.over.every((s) => gh.passes[s]), key);
    assert.ok(route.yearRound || route.none, `${key}: a year-round route, or why there is none`);
    if (!route.yearRound) continue;
    const direct = key.includes('|') ? roads.pairs[key]!.miles : key.startsWith('denver>') ? roads.fromDenver[key.slice(7)]!.miles : (roads.airport[key.split('>')[0]!]?.code === key.split('>')[1] ? roads.airport[key.split('>')[0]!]!.miles : gh.airports[key.split('>')[0]!]![key.split('>')[1]!]!.miles);
    assert.ok(route.yearRound.miles > direct, `${key}: ${route.yearRound.miles} year-round against ${direct} over the pass`);
    assert.ok(route.yearRound.minutes > 0 && route.yearRound.via.length > 0 && route.yearRound.via.every((w) => gh.waypoints[w]), key);
  }
});

test('every pass a page’s drive crosses is in that page’s Passes and routes, with its closure in the agency’s words', () => {
  for (const t of published) {
    const v = view(t.slug);
    const { near, passes } = nearView(t.slug, roads, withPage, true, gh);
    const notes = [v.fromDenverWinter, ...v.airports.map((a) => a.winter), ...near.map((n) => n.winter)].filter((n) => !!n);
    const listed = new Set(passes.map((p) => p.pass.slug));
    for (const n of notes) {
      for (const pass of n.over) {
        assert.ok(listed.has(pass.slug), `${t.slug}: a drive over ${pass.slug}, which its Passes and routes does not list`);
        assert.ok(pass.seasonalClosure && pass.closureSource, pass.slug);
      }
      assert.ok(n.yearRound || n.line.endsWith('closed in winter.'), t.slug);
    }
  }
});

test('Leadville lists Aspen, over Independence Pass with the year-round route by Glenwood Springs, Eagle County and Denver International', () => {
  const rows = view('leadville').airports;
  assert.deepEqual(rows.map((a) => a.code), ['ASE', 'EGE', DEN]);
  const ase = rows[0]!;
  assert.equal(ase.nearest, true);
  assert.deepEqual(ase.winter?.over.map((p) => p.slug), ['independence-pass']);
  assert.deepEqual(ase.winter?.yearRound?.via, ['Glenwood Springs']);
  assert.ok(ase.winter!.yearRound!.miles > ase.miles);
  assert.match(ase.winter!.line, /^Over Independence Pass, which is closed in winter\. Year-round, by way of Glenwood Springs: \d+ miles, about /);
  const ege = rows.find((a) => a.code === 'EGE')!;
  assert.equal(ege.winter, undefined, 'Eagle County is reached by a road open all year');
  assert.equal(ege.name, 'Eagle County Regional Airport');
  // The pass's own row gives CDOT's words: late October or early November to Memorial Day weekend.
  const independence = nearView('leadville', roads, withPage, true, gh).passes.find((p) => p.pass.slug === 'independence-pass')!.pass;
  assert.match(independence.seasonalClosure!, /late Oct\. or early Nov\./);
  assert.match(independence.seasonalClosure!, /Memorial Day/);
  assert.match(independence.closureSource!, /codot\.gov/);
  // And the record the outdoor dates are read from says the same.
  assert.match(readFileSync('content/hub/traditions/independence-pass-closes.md', 'utf8'), /typically closes in late Oct\. or early Nov\./);
  // The source line names the later reading.
  assert.equal(view('leadville').laterCheck?.what, 'the other airports and the year-round route');
});

test('the source line names what the later reading gave, and nothing where the page shows none of it', () => {
  assert.equal(laterCheck(['DEN'], false, '2026-11-18')?.what, 'Denver International');
  assert.equal(laterCheck(['GUC', 'DEN'], true, '2026-11-18')?.what, 'the other airports and the year-round route');
  assert.equal(laterCheck([], true, '2026-11-18')?.what, 'the year-round route');
  assert.equal(laterCheck([], false, '2026-11-18'), undefined);
  assert.equal(view(published.find((t) => roads.airport[t.slug]?.code === DEN)!.slug).laterCheck, undefined, 'a town whose nearest is DEN shows nothing from the later reading');
});

test('the Near list carries the note on a page that prints the pair', () => {
  const aspen = nearView('aspen', roads, withPage, true, gh).near.find((n) => n.place === 'leadville');
  assert.ok(aspen?.winter, 'Aspen to Leadville is over Independence Pass');
  assert.equal(aspen.winter.yearRound?.via[0], 'Glenwood Springs');
  const cb = nearView('crested-butte', roads, withPage, true, gh).near.filter((n) => n.winter);
  assert.ok(cb.length >= 4 && cb.every((n) => n.winter!.over.some((p) => p.slug === 'kebler-pass')), 'Crested Butte’s neighbours over Kebler Pass');
  assert.equal(winterNote(gh, pairKey('aspen', 'basalt'), PASSES), undefined, 'a drive over no pass that closes has no note');
  // A guide's Near list (NearThisTown.astro) does not print the note: none of its pairs may need one.
  for (const g of Object.keys(STANDALONE_GUIDES)) assert.ok(nearView(g, roads, withPage, false, gh).near.every((n) => !n.winter), `${g}: a Near pair over a pass that closes; NearThisTown.astro must print its note`);
});

test('Cottonwood Pass’s closure is the county’s words from its own record', () => {
  const cottonwood = PASSES.find((p) => p.slug === 'cottonwood-pass')!;
  const record = readFileSync('content/hub/traditions/cottonwood-pass-closes.md', 'utf8');
  const words = /typicalWindow: "([^"]+)"/.exec(record)![1]!;
  assert.ok(cottonwood.seasonalClosure?.includes(words), cottonwood.seasonalClosure);
  assert.equal(cottonwood.closureSource, /sourceUrl: "([^"]+)"/.exec(record)![1]);
});
