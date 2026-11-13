#!/usr/bin/env node
/**
 * The bulk facts behind "Near this town", the facts strip and "Getting
 * there" (the additions of 12 November 2026), read from four public
 * sources into two files:
 *
 *   node scripts/town-facts.ts            # read and print
 *   node scripts/town-facts.ts --write    # and write data/hub/town-facts.json and data/hub/road-miles.json
 *
 * - Where a town is: its Populated Place point in the U.S. Geological
 *   Survey's Geographic Names Information System (GNIS), matched by name
 *   and county.
 * - Elevation: the USGS Elevation Point Query Service at that point.
 * - Population: the Census Bureau's Vintage 2025 subcounty estimate (1 July
 *   2025). A census-designated place (Niwot, Redstone) has no annual
 *   estimate and gets none.
 * - Road miles and drive time: one router for every pair, so two pages can
 *   never disagree: the Open Source Routing Machine's public server, on
 *   OpenStreetMap's roads. A pair is stored once, under "a|b" with a
 *   before b, as the drive from a to b. The router does not know a pass is
 *   shut for the winter; the passes are named beside the miles
 *   (src/config/passes.ts).
 *
 * Run by hand when a town is added or once a year when the Census Bureau
 * publishes a new vintage; never at build time. A town a source cannot
 * place keeps what the file had, and is listed at the end of the run.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HUB_TOWNS, STANDALONE_GUIDES } from '../src/config/hub-towns.ts';
import { DENVER, pairKey, type Airports, type RoadMiles, type TownFacts } from '../src/lib/near.ts';
import { dayKey } from '../src/lib/dates.ts';

const FACTS = 'data/hub/town-facts.json';
const ROADS = 'data/hub/road-miles.json';
const AIRPORTS = 'data/hub/airports.json';
const write = process.argv.includes('--write');
// The day as Colorado has it (dayKey): a run in the evening, already tomorrow in UTC, stamped every read a day ahead (audit, 13 November 2026).
const today = dayKey(new Date());
const headers = { 'user-agent': 'insidethetowns.com town pages (yearly facts reader)' };

const GNIS_ZIP = 'https://prd-tnm.s3.amazonaws.com/StagedProducts/GeographicNames/DomesticNames/DomesticNames_CO_Text.zip';
const CENSUS_CSV = 'https://www2.census.gov/programs-surveys/popest/datasets/2020-2025/cities/totals/sub-est2025_8.csv';
const CENSUS_YEAR = 2025;
const EPQS = (lon: number, lat: number) => `https://epqs.nationalmap.gov/v1/json?x=${lon}&y=${lat}&units=Feet&wkid=4326`;
const OSRM = 'https://router.project-osrm.org';
/** How many of a town's neighbours, as the crow flies, are routed: the nearest six by road are among them. */
const CANDIDATES = 24;

/**
 * Every place with a page: the hub's towns and the seven guides. A guide
 * to several towns is placed at the first it names (Carbon Valley at
 * Frederick). `gnis` and `census` are the names the two files use where
 * they are not the town's own.
 */
interface Place {
  slug: string;
  name: string;
  county: string;
  gnis?: string;
  census?: string;
}
const GUIDE_PLACES: Record<string, Omit<Place, 'slug'>> = {
  berthoud: { name: 'Berthoud', county: 'Larimer' },
  erie: { name: 'Erie', county: 'Weld' },
  johnstown: { name: 'Johnstown', county: 'Weld' },
  windsor: { name: 'Windsor', county: 'Weld' },
  'carbon-valley': { name: 'Frederick', county: 'Weld' },
  lyons: { name: 'Lyons', county: 'Boulder' },
  niwot: { name: 'Niwot', county: 'Boulder' },
};
const NAMES: Record<string, { gnis?: string; census?: string }> = {
  creede: { census: 'City of Creede' },
  'canon-city': { gnis: 'Cañon City', census: 'Cañon City' },
};
const places: Place[] = [
  ...HUB_TOWNS.map((t) => ({ slug: t.slug, name: t.name, county: t.counties[0], ...NAMES[t.slug] })),
  ...Object.keys(STANDALONE_GUIDES).map((slug) => ({ slug, ...GUIDE_PLACES[slug]! })),
];

async function text(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(90_000) });
    if (!res.ok) {
      console.log(`  ${res.status} from ${new URL(url).host}`);
      return undefined;
    }
    return await res.text();
  } catch (error) {
    console.log(`  could not reach ${new URL(url).host} (${error instanceof Error ? error.message : String(error)})`);
    return undefined;
  }
}
/** The Census Bureau's file is Latin-1 (Cañon City). */
async function latin1(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(90_000) });
    return res.ok ? Buffer.from(await res.arrayBuffer()).toString('latin1') : undefined;
  } catch {
    return undefined;
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const read = <T>(file: string): T | undefined => (existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : undefined);
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// 1. GNIS: the Populated Place of the town's name in the town's county.
const zip = join(tmpdir(), 'gnis-co.zip');
execFileSync('curl', ['-sS', '-m', '120', '-o', zip, GNIS_ZIP]);
const gnis = execFileSync('unzip', ['-p', zip, 'Text/DomesticNames_CO.txt'], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
const gnisRows = gnis
  .split('\n')
  .map((l) => l.split('|'))
  .filter((c) => c[2] === 'Populated Place');
const before = read<TownFacts>(FACTS);
const facts: TownFacts = {
  checked: today,
  sources: {
    point: { name: 'U.S. Geological Survey, Geographic Names Information System', url: 'https://www.usgs.gov/tools/geographic-names-information-system-gnis' },
    elevation: { name: 'U.S. Geological Survey, Elevation Point Query Service', url: 'https://apps.nationalmap.gov/epqs/' },
    population: { name: `U.S. Census Bureau, Vintage ${CENSUS_YEAR} population estimates`, url: 'https://www.census.gov/programs-surveys/popest/data/tables.html', year: CENSUS_YEAR },
  },
  towns: {},
};
const missing: string[] = [];
for (const p of places) {
  const want = plain(p.gnis ?? p.name);
  const row = gnisRows.find((c) => plain(c[1]!) === want && c[5] === p.county) ?? gnisRows.find((c) => plain(c[1]!) === want && gnisRows.filter((o) => plain(o[1]!) === want).length === 1);
  if (!row) {
    missing.push(`${p.slug}: no GNIS Populated Place "${p.gnis ?? p.name}" in ${p.county} County`);
    if (before?.towns[p.slug]) facts.towns[p.slug] = before.towns[p.slug]!;
    continue;
  }
  facts.towns[p.slug] = { gnisId: Number(row[0]), lat: Number(row[15]), lon: Number(row[16]) };
}

// 2. Elevation at each point.
for (const [slug, t] of Object.entries(facts.towns)) {
  const kept = before?.towns[slug];
  if (kept?.elevationFt !== undefined && kept.lat === t.lat && kept.lon === t.lon) {
    t.elevationFt = kept.elevationFt;
    continue;
  }
  const body = await text(EPQS(t.lon, t.lat));
  const value = body ? Number((JSON.parse(body) as { value?: number | string }).value) : NaN;
  if (Number.isFinite(value) && value > 0) t.elevationFt = Math.round(value);
  else missing.push(`${slug}: no elevation from the USGS point service`);
  await sleep(150);
}

// 3. Population: the incorporated place's Vintage estimate.
const csv = await latin1(CENSUS_CSV);
if (csv) {
  const lines = csv.split('\n').map((l) => l.split(','));
  const head = lines[0]!;
  const col = head.indexOf(`POPESTIMATE${CENSUS_YEAR}`);
  const nameCol = head.indexOf('NAME');
  for (const p of places) {
    const t = facts.towns[p.slug];
    if (!t) continue;
    const want = plain(p.census ?? p.name);
    const row = lines.find((c) => c[0] === '162' && [want, `${want} town`, `${want} city`].includes(plain(c[nameCol] ?? '')));
    if (row && col > 0) t.population = Number(row[col]);
    else missing.push(`${p.slug}: no Vintage ${CENSUS_YEAR} estimate (not an incorporated place)`);
  }
} else {
  for (const [slug, t] of Object.entries(facts.towns)) if (before?.towns[slug]?.population) t.population = before.towns[slug]!.population;
}

// 4. Road miles: each town with its nearest neighbours as the crow flies, Denver, and the airports.
const miles = (m: number) => Math.round((m / 1609.344) * 10) / 10;
const minutes = (s: number) => Math.round(s / 60);
const crow = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const rad = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2;
  return 2 * 3958.8 * Math.asin(Math.sqrt(h));
};
async function table(points: Array<{ lat: number; lon: number }>): Promise<{ distances: number[][]; durations: number[][] } | undefined> {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(';');
  for (let attempt = 0; attempt < 3; attempt++) {
    const body = await text(`${OSRM}/table/v1/driving/${coords}?annotations=distance,duration`);
    if (body) {
      const data = JSON.parse(body) as { code: string; distances?: number[][]; durations?: number[][] };
      if (data.code === 'Ok' && data.distances && data.durations) return { distances: data.distances, durations: data.durations };
    }
    await sleep(2000);
  }
  return undefined;
}
const airports = read<Airports>(AIRPORTS);
const roadsBefore = read<RoadMiles>(ROADS);
const roads: RoadMiles = {
  checked: today,
  source: { name: 'Open Source Routing Machine, on OpenStreetMap roads', url: 'https://project-osrm.org/' },
  denver: { name: DENVER.name, lat: DENVER.lat, lon: DENVER.lon },
  pairs: {},
  fromDenver: {},
  airport: {},
};
const slugs = Object.keys(facts.towns).sort();
let routed = 0;
for (const slug of slugs) {
  const here = facts.towns[slug]!;
  const near = slugs
    .filter((s) => s !== slug)
    .sort((a, b) => crow(here, facts.towns[a]!) - crow(here, facts.towns[b]!))
    .slice(0, CANDIDATES);
  const fields = airports?.airports.filter((a) => a.lat !== undefined && a.lon !== undefined) ?? [];
  const points = [here, ...near.map((s) => facts.towns[s]!), DENVER, ...fields.map((a) => ({ lat: a.lat!, lon: a.lon! }))];
  const result = await table(points);
  if (!result) {
    missing.push(`${slug}: the router did not answer; its miles are the last run's`);
    for (const [key, value] of Object.entries(roadsBefore?.pairs ?? {})) if (key.split('|').includes(slug)) roads.pairs[key] ??= value;
    if (roadsBefore?.fromDenver[slug]) roads.fromDenver[slug] = roadsBefore.fromDenver[slug]!;
    if (roadsBefore?.airport[slug]) roads.airport[slug] = roadsBefore.airport[slug]!;
    continue;
  }
  routed++;
  near.forEach((other, i) => {
    const [a, b] = slug < other ? [0, i + 1] : [i + 1, 0];
    const d = result.distances[a]![b];
    const t = result.durations[a]![b];
    if (typeof d === 'number' && typeof t === 'number') roads.pairs[pairKey(slug, other)] = { miles: miles(d), minutes: minutes(t) };
  });
  const dIndex = near.length + 1;
  const fromDenver = result.distances[dIndex]![0];
  if (typeof fromDenver === 'number') roads.fromDenver[slug] = { miles: miles(fromDenver), minutes: minutes(result.durations[dIndex]![0]!) };
  let best: { code: string; miles: number; minutes: number } | undefined;
  fields.forEach((a, i) => {
    const d = result.distances[0]![dIndex + 1 + i];
    if (typeof d === 'number' && (!best || miles(d) < best.miles)) best = { code: a.code, miles: miles(d), minutes: minutes(result.durations[0]![dIndex + 1 + i]!) };
  });
  if (best) roads.airport[slug] = best;
  await sleep(1100);
}

console.log(`town-facts: ${Object.keys(facts.towns).length} of ${places.length} places placed; ${Object.values(facts.towns).filter((t) => t.elevationFt).length} with an elevation; ${Object.values(facts.towns).filter((t) => t.population).length} with a ${CENSUS_YEAR} estimate`);
console.log(`road-miles: ${routed} of ${slugs.length} routed; ${Object.keys(roads.pairs).length} pairs; ${Object.keys(roads.fromDenver).length} from Denver; ${Object.keys(roads.airport).length} with a nearest airport${airports ? '' : ' (no data/hub/airports.json yet)'}`);
for (const m of missing) console.log(`  missing  ${m}`);
if (write) {
  mkdirSync('data/hub', { recursive: true });
  writeFileSync(FACTS, `${JSON.stringify(facts, null, 1)}\n`);
  writeFileSync(ROADS, `${JSON.stringify(roads, null, 1)}\n`);
  console.log(`wrote ${FACTS} and ${ROADS}`);
}
