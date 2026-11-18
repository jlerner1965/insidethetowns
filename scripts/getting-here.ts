#!/usr/bin/env node
/**
 * Getting here through the year (the owner's navigation brief of 18
 * November 2026, item 7), read from the router the road miles come from
 * into data/hub/getting-here.json (src/lib/getting-here.ts):
 *
 *   node scripts/getting-here.ts            # read and print
 *   node scripts/getting-here.ts --write    # and write data/hub/getting-here.json
 *
 * - Denver International (DEN) for every hub town page whose nearest
 *   commercial airport is another: road miles and drive time, from the
 *   town's point to the airport's, as scripts/town-facts.ts measures the
 *   nearest.
 * - Every drive a town page prints (from Denver, to each airport it lists,
 *   to each town in its Near list) is checked against the passes that
 *   close in winter: the passes in data/hub/passes.json with a
 *   `seasonalClosure`, each at its Gap point in the U.S. Geological
 *   Survey's Geographic Names Information System (GNIS). A drive is over a
 *   pass when the router's line runs within half a kilometre of that
 *   point. A drive that cannot reach a pass (the straight line from its
 *   start to the pass and on to its end is longer than the drive) is not
 *   asked for its line.
 * - For each drive over such a pass, the year-round route: the router's
 *   drive by way of a place on a road kept open in winter (WAYS, below, in
 *   either order), itself checked against every pass; the fastest such
 *   route is kept. Where none is clear of the passes, the drive is listed
 *   without one.
 * - Where a town's nearest airport by road is over such a pass, the
 *   nearest airport by a year-round road is listed too.
 *
 * The router is the Open Source Routing Machine's public server on
 * OpenStreetMap roads, as for the road miles. The miles a page already
 * prints are not changed here; this file adds beside them.
 *
 * Run by hand after scripts/town-facts.ts, or when a pass's closure in
 * data/hub/passes.json changes; never at build time.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STANDALONE_GUIDES } from '../src/config/hub-towns.ts';
import { PASSES } from '../src/config/passes.ts';
import { dayKey } from '../src/lib/dates.ts';
import { DEN, airportKey, fromDenverKey, type GettingHere, type WinterRoute } from '../src/lib/getting-here.ts';
import { publishedHubTowns } from '../src/lib/hub-towns.ts';
import { nearestPlaces, pairKey, type Airports, type Leg, type RoadMiles, type TownFacts } from '../src/lib/near.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';

const OUT = 'data/hub/getting-here.json';
const write = process.argv.includes('--write');
const today = dayKey(new Date());
const headers = { 'user-agent': 'insidethetowns.com town pages (getting-here reader)' };
const OSRM = 'https://router.project-osrm.org';
const GNIS_ZIP = 'https://prd-tnm.s3.amazonaws.com/StagedProducts/GeographicNames/DomesticNames/DomesticNames_CO_Text.zip';
/** How close the router's line must come to a pass's point for the drive to be over it. */
const OVER_METRES = 500;

/**
 * Each pass that closes in winter, at its GNIS Gap point or points (name
 * and county). Trail Ridge Road is two: it crosses the Continental Divide
 * at Milner Pass and tops out by Fall River Pass, where Old Fall River
 * Road meets it.
 */
const PASS_POINTS: Record<string, Array<{ name: string; county: string }>> = {
  'independence-pass': [{ name: 'Independence Pass', county: 'Lake' }],
  'trail-ridge-road': [
    { name: 'Milner Pass', county: 'Grand' },
    { name: 'Fall River Pass', county: 'Larimer' },
  ],
  'kebler-pass': [{ name: 'Kebler Pass', county: 'Gunnison' }],
  'guanella-pass': [{ name: 'Guanella Pass', county: 'Clear Creek' }],
  'cottonwood-pass': [{ name: 'Cottonwood Pass', county: 'Chaffee' }],
};
/** A pass with a closure that no drive between towns can cross: the road ends at it. */
const SPURS: Record<string, string> = {
  'mount-blue-sky-highway': 'CO 5 ends at the summit of Mount Blue Sky',
};
/**
 * Passes with no row or no closure in data/hub/passes.json that the
 * repo's own records (content/hub/traditions/) or the roads' surface say
 * are not kept open: a drive over one is printed at the end of the run so
 * a row can be added, and is never a year-round route.
 */
const WATCH: Array<{ name: string; county: string }> = [
  { name: 'Medano Pass', county: 'Saguache' },
  { name: 'Ripple Creek Pass', county: 'Garfield' },
  { name: 'Boreas Pass', county: 'Summit' },
  { name: 'Ohio Pass', county: 'Gunnison' },
  { name: 'Schofield Pass', county: 'Gunnison' },
  { name: 'Pearl Pass', county: 'Gunnison' },
  { name: 'Tincup Pass', county: 'Gunnison' },
  { name: 'Engineer Pass', county: 'Ouray' },
  { name: 'Cinnamon Pass', county: 'Hinsdale' },
  { name: 'Imogene Pass', county: 'Ouray' },
  { name: 'Ophir Pass', county: 'San Miguel' },
  { name: 'Stony Pass', county: 'San Juan' },
  { name: 'Owl Creek Pass', county: 'Ouray' },
  { name: 'Mosquito Pass', county: 'Lake' },
  { name: 'Weston Pass', county: 'Lake' },
  { name: 'Hagerman Pass', county: 'Pitkin' },
];

/**
 * The places a year-round route may go by way of, each a GNIS Populated
 * Place on a road kept open in winter, and for each pass the ways round it
 * to try, in places. The fastest that crosses no pass is kept.
 */
const WAYPOINTS: Record<string, { name: string; county: string }> = {
  'glenwood-springs': { name: 'Glenwood Springs', county: 'Garfield' },
  'idaho-springs': { name: 'Idaho Springs', county: 'Clear Creek' },
  walden: { name: 'Walden', county: 'Jackson' },
  gunnison: { name: 'Gunnison', county: 'Gunnison' },
  crawford: { name: 'Crawford', county: 'Delta' },
  montrose: { name: 'Montrose', county: 'Montrose' },
  'poncha-springs': { name: 'Poncha Springs', county: 'Chaffee' },
  breckenridge: { name: 'Breckenridge', county: 'Summit' },
  bailey: { name: 'Bailey', county: 'Park' },
};
const WAYS: Record<string, string[][]> = {
  // CO 82 over the pass is the only road between the upper Arkansas and Aspen; the year-round way is I-70 and CO 82 through Glenwood Springs.
  'independence-pass': [['glenwood-springs']],
  // Between Estes Park and Grand County: Berthoud Pass (US 40) from I-70, or Cameron Pass (CO 14) and Willow Creek Pass (CO 125) through Walden.
  'trail-ridge-road': [['idaho-springs'], ['walden']],
  // Crested Butte to the North Fork and the Crystal valley: Gunnison, then CO 92 through Crawford or US 50 through Montrose.
  'kebler-pass': [
    ['gunnison', 'crawford'],
    ['gunnison', 'montrose'],
  ],
  // Georgetown to Fairplay: I-70 and Hoosier Pass through Breckenridge, or US 285 through Bailey.
  'guanella-pass': [['breckenridge'], ['bailey']],
  // The Arkansas valley to Gunnison: US 50 over Monarch Pass from Poncha Springs.
  'cottonwood-pass': [['poncha-springs']],
};

type Point = { lat: number; lon: number };
const read = <T>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const miles = (m: number) => Math.round((m / 1609.344) * 10) / 10;
const minutes = (s: number) => Math.round(s / 60);
const crow = (a: Point, b: Point) => {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(h));
};

const roads = read<RoadMiles>('data/hub/road-miles.json');
const facts = read<TownFacts>('data/hub/town-facts.json');
const airportList = read<Airports>('data/hub/airports.json');
const records = rawRecords('.', {});
const published = publishedHubTowns(records).map((t) => t.slug);
const withPage = new Set([...published, ...Object.keys(STANDALONE_GUIDES)]);
const problems: string[] = [];

// 1. GNIS: the Gap of each pass and the Populated Place of each waypoint.
const zip = join(tmpdir(), 'gnis-co.zip');
execFileSync('curl', ['-sS', '-m', '120', '-o', zip, GNIS_ZIP]);
const gnis = execFileSync('unzip', ['-p', zip, 'Text/DomesticNames_CO.txt'], { maxBuffer: 256 * 1024 * 1024 })
  .toString('utf8')
  .split('\n')
  .map((l) => l.split('|'));
function feature(kind: 'Gap' | 'Populated Place', name: string, county: string) {
  const row = gnis.find((c) => c[2] === kind && c[1] === name && c[5] === county);
  if (!row) throw new Error(`GNIS has no ${kind} "${name}" in ${county} County`);
  return { name, gnisId: Number(row[0]), lat: Number(row[15]), lon: Number(row[16]) };
}
const seasonal = PASSES.filter((p) => p.seasonalClosure);
for (const p of seasonal) if (!PASS_POINTS[p.slug] && !SPURS[p.slug]) throw new Error(`${p.slug} closes in winter and has no GNIS point here (PASS_POINTS) or reason it cannot be crossed (SPURS)`);
for (const slug of Object.keys(PASS_POINTS)) if (!seasonal.some((p) => p.slug === slug)) throw new Error(`${slug}: a point here but no seasonalClosure in data/hub/passes.json`);
const passPoints: GettingHere['passes'] = Object.fromEntries(Object.entries(PASS_POINTS).map(([slug, list]) => [slug, list.map((f) => feature('Gap', f.name, f.county))]));
const watchPoints = WATCH.map((f) => feature('Gap', f.name, f.county));
const waypoints: GettingHere['waypoints'] = Object.fromEntries(Object.entries(WAYPOINTS).map(([key, f]) => [key, feature('Populated Place', f.name, f.county)]));
/** Every point a drive is checked against: a pass that closes, or a watched one (slug "watch:<name>"). */
const checkPoints = [
  ...Object.entries(passPoints).flatMap(([slug, list]) => list.map((p) => ({ slug, ...p }))),
  ...watchPoints.map((p) => ({ slug: `watch:${p.name}`, ...p })),
];

// 2. The router.
async function get(url: string): Promise<unknown> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(90_000) });
      if (res.ok) {
        const data = (await res.json()) as { code?: string };
        if (data.code === 'Ok') {
          await sleep(1100);
          return data;
        }
      }
    } catch {
      // try again
    }
    await sleep(3000);
  }
  return undefined;
}
interface Line extends Leg {
  coords: number[][];
}
async function drive(points: Point[]): Promise<Line | undefined> {
  const path = points.map((p) => `${p.lon},${p.lat}`).join(';');
  const data = (await get(`${OSRM}/route/v1/driving/${path}?overview=full&geometries=geojson&continue_straight=false`)) as { routes?: Array<{ distance: number; duration: number; geometry: { coordinates: number[][] } }> } | undefined;
  const r = data?.routes?.[0];
  return r ? { miles: miles(r.distance), minutes: minutes(r.duration), coords: r.geometry.coordinates } : undefined;
}
async function legs(from: Point[], to: Point[]): Promise<Array<Array<Leg | undefined>> | undefined> {
  const path = [...from, ...to].map((p) => `${p.lon},${p.lat}`).join(';');
  const sources = from.map((_, i) => i).join(';');
  const destinations = to.map((_, i) => from.length + i).join(';');
  const data = (await get(`${OSRM}/table/v1/driving/${path}?sources=${sources}&destinations=${destinations}&annotations=distance,duration`)) as { distances?: Array<Array<number | null>>; durations?: Array<Array<number | null>> } | undefined;
  if (!data?.distances || !data.durations) return undefined;
  return data.distances.map((row, i) => row.map((d, j) => (typeof d === 'number' && typeof data.durations![i]![j] === 'number' ? { miles: miles(d), minutes: minutes(data.durations![i]![j]!) } : undefined)));
}
/** Metres from a point to the nearest point of a line, on a flat projection about the point (the lines here are a few hundred metres from it at most). */
function metresFrom(p: Point, line: number[][]): { metres: number; at: number } {
  const lat0 = (p.lat * Math.PI) / 180;
  const x = (lon: number) => ((lon * Math.PI) / 180) * Math.cos(lat0) * 6_371_000;
  const y = (lat: number) => ((lat * Math.PI) / 180) * 6_371_000;
  const px = x(p.lon);
  const py = y(p.lat);
  let best = { metres: Infinity, at: -1 };
  for (let i = 1; i < line.length; i++) {
    const [alon, alat] = line[i - 1]!;
    const [blon, blat] = line[i]!;
    if (Math.abs(alat! - p.lat) > 0.05 && Math.abs(blat! - p.lat) > 0.05) continue;
    const ax = x(alon!), ay = y(alat!), bx = x(blon!), by = y(blat!);
    const dx = bx - ax, dy = by - ay;
    const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
    const m = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    if (m < best.metres) best = { metres: m, at: i };
  }
  return best;
}
/** The passes and watched passes a line crosses, in the order it meets them. */
function crossed(line: number[][]): string[] {
  const hits = checkPoints.map((c) => ({ slug: c.slug, ...metresFrom(c, line) })).filter((h) => h.metres <= OVER_METRES);
  return [...new Set(hits.sort((a, b) => a.at - b.at).map((h) => h.slug))];
}
/** Whether a drive of this length could reach any checked point at all. */
const mayCross = (from: Point, to: Point, length: number) => checkPoints.some((c) => crow(from, c) + crow(c, to) - 0.7 <= length);

const place = (slug: string): Point => {
  const t = facts.towns[slug];
  if (!t) throw new Error(`${slug}: no point in data/hub/town-facts.json`);
  return t;
};
const airportPoint = (code: string): Point => {
  const a = airportList.airports.find((x) => x.code === code);
  if (a?.lat === undefined || a.lon === undefined) throw new Error(`${code}: no point in data/hub/airports.json`);
  return { lat: a.lat, lon: a.lon };
};

/** A drive's check: undefined when it crosses nothing; the passes and the year-round route when it does. */
async function check(key: string, from: Point, to: Point, length: number): Promise<WinterRoute | undefined> {
  if (!mayCross(from, to, length)) return undefined;
  const line = await drive([from, to]);
  if (!line) {
    problems.push(`${key}: the router did not answer; not checked`);
    return undefined;
  }
  if (Math.abs(line.miles - length) > Math.max(1, length * 0.02)) problems.push(`${key}: the router gives ${line.miles} miles today against ${length} on file`);
  const hits = crossed(line.coords);
  const watched = hits.filter((s) => s.startsWith('watch:'));
  for (const w of watched) problems.push(`${key}: over ${w.slice(6)}, which has no seasonal closure in data/hub/passes.json; add one from the agency's page, or a WAYS entry, and run again`);
  const over = hits.filter((s) => !s.startsWith('watch:'));
  if (over.length === 0) return undefined;
  // Each way round in its order and the other: WAYS lists Crested Butte's side first, and a drive from Carbondale meets Crawford first.
  const tries = [...new Map(over.flatMap((s) => WAYS[s] ?? []).flatMap((via) => [via, [...via].reverse()]).map((via) => [via.join('>'), via])).values()];
  let best: (Leg & { via: string[] }) | undefined;
  for (const via of tries) {
    const round = await drive([from, ...via.map((w) => waypoints[w]!), to]);
    if (!round) continue;
    const still = crossed(round.coords);
    if (still.length > 0) {
      console.log(`  ${key} by way of ${via.join(', ')}: still over ${still.join(', ')}`);
      continue;
    }
    if (!best || round.minutes < best.minutes) best = { miles: round.miles, minutes: round.minutes, via };
  }
  if (!best) problems.push(`${key}: over ${over.join(', ')}; no way round in WAYS is clear of the passes`);
  return best ? { over, yearRound: best } : { over, none: 'no way round in scripts/getting-here.ts (WAYS) is clear of the passes' };
}

// 3. Denver International from every town page whose nearest is another.
const out: GettingHere = {
  checked: today,
  source: roads.source,
  pointSource: { name: 'U.S. Geological Survey, Geographic Names Information System', url: 'https://www.usgs.gov/tools/geographic-names-information-system-gnis' },
  passes: passPoints,
  waypoints,
  airports: {},
  routes: {},
};
const needDen = published.filter((t) => roads.airport[t] && roads.airport[t]!.code !== DEN);
for (let i = 0; i < needDen.length; i += 50) {
  const batch = needDen.slice(i, i + 50);
  const table = await legs(batch.map(place), [airportPoint(DEN)]);
  batch.forEach((t, j) => {
    const leg = table?.[j]?.[0];
    if (leg) (out.airports[t] ??= {})[DEN] = leg;
    else problems.push(`${t}: no drive to DEN from the router`);
  });
}

// 4. Every drive a town page prints.
const winter = new Map<string, WinterRoute>();
async function note(key: string, from: Point, to: Point, length: number) {
  const w = await check(key, from, to, length);
  if (w) winter.set(key, w);
  return w;
}
for (const t of published) {
  const d = roads.fromDenver[t];
  if (d) await note(fromDenverKey(t), roads.denver, place(t), d.miles);
  const nearest = roads.airport[t];
  if (nearest) {
    const over = await note(airportKey(t, nearest.code), place(t), airportPoint(nearest.code), nearest.miles);
    // The nearest by a year-round road, where the nearest by road is over a pass: airports in order of road miles, each by its year-round
    // route where its own is over a pass, until the next one's road miles are already more than the best year-round figure.
    if (over) {
      const all = airportList.airports.filter((a) => a.lat !== undefined && a.lon !== undefined);
      const table = await legs([place(t)], all.map((a) => ({ lat: a.lat!, lon: a.lon! })));
      const ranked = all
        .map((a, j) => ({ code: a.code, leg: table?.[0]?.[j] }))
        .filter((a): a is { code: string; leg: Leg } => !!a.leg)
        .sort((x, y) => x.leg.miles - y.leg.miles);
      let best: { code: string; leg: Leg; yearRound: number; w?: WinterRoute } | undefined;
      for (const a of ranked) {
        if (best && a.leg.miles >= best.yearRound) break;
        const w = a.code === nearest.code ? over : await check(airportKey(t, a.code), place(t), airportPoint(a.code), a.leg.miles);
        const yearRound = w ? w.yearRound?.miles : a.leg.miles;
        if (yearRound !== undefined && (!best || yearRound < best.yearRound)) best = { code: a.code, leg: a.leg, yearRound, ...(w ? { w } : {}) };
      }
      if (best && best.code !== nearest.code) {
        (out.airports[t] ??= {})[best.code] = best.leg;
        if (best.w) winter.set(airportKey(t, best.code), best.w);
      }
    }
  }
  const den = out.airports[t]?.[DEN];
  if (den) await note(airportKey(t, DEN), place(t), airportPoint(DEN), den.miles);
}
const pairs = new Set<string>();
for (const p of withPage) for (const n of nearestPlaces(roads, p, withPage)) pairs.add(pairKey(p, n.place));
for (const key of [...pairs].sort()) {
  const [a, b] = key.split('|') as [string, string];
  await note(key, place(a), place(b), roads.pairs[key]!.miles);
}

// Only the drives a page prints: from Denver, the airports it lists, its Near list.
const listed = (key: string) => {
  const [town, code] = key.split('>');
  if (!code || town === 'denver') return true;
  return roads.airport[town!]?.code === code || !!out.airports[town!]?.[code];
};
for (const [key, w] of [...winter.entries()].sort(([a], [b]) => a.localeCompare(b))) if (listed(key)) out.routes[key] = w;

console.log(`getting-here: DEN for ${Object.values(out.airports).filter((a) => a[DEN]).length} towns; ${Object.keys(out.routes).length} printed drives over a pass that closes in winter`);
for (const [key, w] of Object.entries(out.routes)) console.log(`  ${key}  over ${w.over.join(', ')}${w.yearRound ? `; year-round ${w.yearRound.miles} miles, ${w.yearRound.minutes} minutes, by way of ${w.yearRound.via.join(', ')}` : `; ${w.none}`}`);
for (const [town, list] of Object.entries(out.airports)) for (const code of Object.keys(list)) if (code !== DEN) console.log(`  ${town}: also ${code}, the nearest by a year-round road`);
for (const p of problems) console.log(`  check  ${p}`);
if (write) {
  writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`wrote ${OUT}`);
}
