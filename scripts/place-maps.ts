#!/usr/bin/env node
/**
 * Writes the data a place page's street map is drawn from.
 *
 *   node scripts/place-maps.ts --town=berthoud
 *   node scripts/place-maps.ts --town=berthoud --osm=/path/to/map.osm
 *
 * A place page with no photograph was a page of text (audit of 9 November
 * 2026), and the site's security policy allows no embedded map. So the map
 * is the guide's own: the roads around the town from the Census Bureau's
 * TIGERweb service and each listing's address placed by the Census
 * geocoder, both public-domain federal data, kept in
 * data/<town>/place-map.json and drawn at build as an inline SVG
 * (src/components/PlaceMap.astro). Nothing is fetched when a page is read.
 *
 * With --osm, an OpenStreetMap extract of the town (openstreetmap.org,
 * Export, saved as .osm) is the map instead: its streets under the names
 * the town uses, its building outlines, parks and water, and the position
 * of any listing it carries by house number and street or by name. That is
 * the building itself, where the geocoder is only somewhere on the block
 * (Berthoud, 9 November 2026: the two were 20 to 150 metres apart). The
 * extract is not kept; what is drawn from it is, with OpenStreetMap's
 * credit, which the map prints (ODbL).
 *
 * The geocoder places an address along its block by house number, so a pin
 * is within the block, not on the door: the map says "approximate". Where
 * its range spans two blocks the pin can land in the wrong one (Fickel Park,
 * 9 November 2026): check a new pin against its cross streets, and set it
 * by hand under "fixed" in the file when it is off. A
 * listing whose address it cannot match (an intersection, a rural route, a
 * place out of the frame) gets no pin and no map; nothing is guessed. A
 * listing already placed is kept unless --refresh is given. Run it again
 * when a place is added or moves.
 */
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { allTowns } from '../src/config/index.ts';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const slug = arg('town');
const refresh = process.argv.includes('--refresh');
const town = allTowns.find((t) => t.slug === slug);
if (!town) {
  console.error('place-maps: give --town=<slug>');
  process.exit(1);
}

const AGENT = 'InsideTheTowns-place-maps/1.0 (+https://insidethetowns.com)';
async function getJson(url: string): Promise<any> {
  const { stdout } = await run('curl', ['-sS', '-m', '90', '-A', AGENT, url], { maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(stdout);
}

/** About five kilometres each way of the town's centre: the town and its edges. */
const box = { w: town.lng - 0.065, e: town.lng + 0.065, s: town.lat - 0.045, n: town.lat + 0.045 };
const round = (n: number) => Math.round(n * 1e5) / 1e5;

type Line = { n: string; k: 'highway' | 'road' | 'rail'; p: number[][] };
async function layer(id: number, kind: Line['k']): Promise<Line[]> {
  const out: Line[] = [];
  for (let offset = 0; ; offset += 1000) {
    const url =
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Transportation/MapServer/${id}/query?where=1%3D1` +
      `&geometry=${box.w},${box.s},${box.e},${box.n}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects` +
      `&outFields=NAME&outSR=4326&resultOffset=${offset}&resultRecordCount=1000&f=geojson`;
    const data = await getJson(url);
    const features = data.features ?? [];
    for (const f of features) {
      const parts: number[][][] = f.geometry?.type === 'MultiLineString' ? f.geometry.coordinates : f.geometry ? [f.geometry.coordinates] : [];
      for (const part of parts) out.push({ n: f.properties?.NAME ?? '', k: kind, p: part.map(([x, y]) => [round(x), round(y)]) });
    }
    if (features.length < 1000) break;
  }
  return out;
}


type Area = { k: 'building' | 'park' | 'water'; p: number[][] };
type Poi = { name: string; number: string; street: string; at: [number, number] };
/** "North 8th Street", "N 8th St", "Third St": one spelling to compare by. */
const streetKey = (v: string) =>
  v
    .toLowerCase()
    .replace(/\b(north|south|east|west|n|s|e|w)\b\.?/g, ' ')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\bparkway\b/g, 'pkwy')
    .replace(/\bfirst\b/g, '1st')
    .replace(/\bsecond\b/g, '2nd')
    .replace(/\bthird\b/g, '3rd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const nameKey = (v: string) => v.toLowerCase().replace(/&/g, 'and').replace(/\b(the|co|company|restaurant|park|brewing|brewery)\b/g, ' ').replace(/[^a-z0-9]+/g, '');
const unescape = (v: string) => v.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** An .osm extract read as text: its nodes, then each way with its tags. The format is one element a line. */
function readOsm(path: string): { lines: Line[]; areas: Area[]; pois: Poi[]; newest: string } {
  const text = readFileSync(path, 'utf8');
  const nodes = new Map<string, [number, number]>();
  const lines: Line[] = [];
  const areas: Area[] = [];
  const pois: Poi[] = [];
  let newest = '';
  const tagsOf = (body: string) => Object.fromEntries([...body.matchAll(/<tag k="([^"]*)" v="([^"]*)"/g)].map((m) => [m[1]!, unescape(m[2]!)]));
  const poi = (tags: Record<string, string>, at: [number, number]) => {
    if (tags.name || tags['addr:housenumber']) pois.push({ name: tags.name ?? '', number: tags['addr:housenumber'] ?? '', street: tags['addr:street'] ?? '', at });
  };
  for (const m of text.matchAll(/<node id="(\d+)"[^>]*?timestamp="([^"]*)"[^>]*?lat="([-\d.]+)" lon="([-\d.]+)"(?:\/>|>([\s\S]*?)<\/node>)/g)) {
    const at: [number, number] = [round(Number(m[3])), round(Number(m[4]))];
    nodes.set(m[1]!, at);
    if (m[2]! > newest) newest = m[2]!;
    if (m[5]) poi(tagsOf(m[5]), at);
  }
  const DRAWN = new Set(['trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'living_street', 'trunk_link', 'primary_link']);
  for (const m of text.matchAll(/<way [^>]*>([\s\S]*?)<\/way>/g)) {
    const body = m[1]!;
    const tags = tagsOf(body);
    const points = [...body.matchAll(/<nd ref="(\d+)"/g)].map((n) => nodes.get(n[1]!)).filter((p): p is [number, number] => !!p);
    if (points.length < 2) continue;
    const lngLat = points.map(([lat, lng]) => [lng, lat]);
    const middle: [number, number] = [round(points.reduce((a, p) => a + p[0], 0) / points.length), round(points.reduce((a, p) => a + p[1], 0) / points.length)];
    if (tags.highway && DRAWN.has(tags.highway)) lines.push({ n: tags.name ?? '', k: /^(trunk|primary|secondary)/.test(tags.highway) ? 'highway' : 'road', p: lngLat });
    else if (tags.railway === 'rail') lines.push({ n: '', k: 'rail', p: lngLat });
    else if (tags.building) areas.push({ k: 'building', p: lngLat });
    else if (tags.leisure === 'park' || tags.leisure === 'playground' || tags.landuse === 'recreation_ground') areas.push({ k: 'park', p: lngLat });
    else if (tags.natural === 'water') areas.push({ k: 'water', p: lngLat });
    if (!tags.highway) poi(tags, middle);
  }
  return { lines, areas, pois, newest: newest.slice(0, 10) };
}
const osmPath = arg('osm');
const osm = osmPath ? readOsm(resolve(osmPath)) : undefined;
/** A listing in the extract: by its house number and street first, then by its name. Nothing loose: a near miss is no match. */
function osmPlace(title: string, address: string): [number, number] | undefined {
  if (!osm) return undefined;
  const parts = /^(\d+)\s+([^,#]+?)(?:,|\s+(?:Ste|Suite|Unit|#)|$)/i.exec(address);
  const byAddress = parts ? osm.pois.filter((p) => p.number === parts[1] && streetKey(p.street) === streetKey(parts[2]!)) : [];
  const key = nameKey(title);
  const named = [...byAddress, ...osm.pois].find((p) => p.name && nameKey(p.name) === key);
  if (named) return named.at;
  // The address alone: every entry at it in the extract (the building, a business in it), averaged, when they agree to within a building.
  if (byAddress.length) {
    const lat = byAddress.reduce((a, p) => a + p.at[0], 0) / byAddress.length;
    const lng = byAddress.reduce((a, p) => a + p.at[1], 0) / byAddress.length;
    if (byAddress.every((p) => Math.abs(p.at[0] - lat) < 0.0005 && Math.abs(p.at[1] - lng) < 0.0007)) return [round(lat), round(lng)];
  }
  return undefined;
}

const file = join(root, 'data', town.slug, 'place-map.json');
const before = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { places: {} };

// Layer 6 is the secondary roads at street scale: the US and state highways, a town's main street often among them.
const lines = osm ? osm.lines : [...(await layer(6, 'highway')), ...(await layer(8, 'road')), ...(await layer(9, 'rail'))];

const dir = join(root, 'content', town.slug, 'places');
const places: Record<string, [number, number]> = {};
const unplaced: string[] = [];
/** Where each pin came from, so a reader of the file knows which are the building and which the block. */
const from: Record<string, 'osm' | 'geocoder'> = {};
for (const name of readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort()) {
  const id = name.replace(/\.md$/, '');
  const text = readFileSync(join(dir, name), 'utf8');
  const address = /^address: "?(.+?)"?$/m.exec(text)?.[1];
  if (!address) continue;
  const title = /^title: "?(.+?)"?$/m.exec(text)?.[1] ?? id;
  // A pin set by hand ("fixed" in the file) stands: the geocoder spreads a house number along a range that can span two blocks.
  if (before.fixed?.[id]) {
    places[id] = before.fixed[id];
    continue;
  }
  const mapped = osmPlace(title, address);
  if (mapped) {
    places[id] = mapped;
    from[id] = 'osm';
    continue;
  }
  if (!refresh && before.places?.[id] && before.addresses?.[id] === address) {
    places[id] = before.places[id];
    from[id] = before.from?.[id] ?? 'geocoder';
    continue;
  }
  // A house number and a street; a suite or unit is dropped, and a town already in the line is kept.
  const street = address.replace(/,?\s*(Ste|Suite|Unit|#)\s*\S+$/i, '');
  if (!/^\d+\s+\S+/.test(street)) {
    unplaced.push(`${id}: "${address}" is not a street address`);
    continue;
  }
  const oneLine = /,\s*[A-Z][a-z]+/.test(street) ? `${street}, ${town.state}` : `${street}, ${town.name}, ${town.state}`;
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(oneLine)}&benchmark=Public_AR_Current&format=json`;
  try {
    const match = (await getJson(url)).result?.addressMatches?.[0];
    const lng = match?.coordinates?.x;
    const lat = match?.coordinates?.y;
    if (typeof lat !== 'number' || typeof lng !== 'number') unplaced.push(`${id}: no match for "${oneLine}"`);
    else if (lng < box.w || lng > box.e || lat < box.s || lat > box.n) unplaced.push(`${id}: "${oneLine}" is outside the map`);
    else {
      places[id] = [round(lat), round(lng)];
      from[id] = 'geocoder';
    }
  } catch (error) {
    unplaced.push(`${id}: ${(error as Error).message.split('\n')[0]}`);
  }
}

const addresses = Object.fromEntries(
  Object.keys(places).map((id) => [id, /^address: "?(.+?)"?$/m.exec(readFileSync(join(dir, `${id}.md`), 'utf8'))![1]]),
);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(
  file,
  JSON.stringify(
    {
      source: osm
        ? `OpenStreetMap contributors, ODbL (streets, buildings, parks, water and the pins marked osm; extract as edited to ${osm.newest}); U.S. Census geocoder, public domain (the pins marked geocoder)`
        : 'U.S. Census Bureau: TIGERweb (roads and railroads) and the Census geocoder (addresses); public domain',
      credit: osm ? 'osm' : 'census',
      read: new Date().toISOString().slice(0, 10),
      // What the town calls a road the Census names by its number; kept by hand, and kept across runs.
      aliases: before.aliases ?? {},
      // Pins corrected by hand, with the reason in docs or the commit; these win over the geocoder on every run.
      fixed: before.fixed ?? {},
      box,
      places,
      from,
      addresses,
      areas: osm?.areas ?? before.areas ?? [],
      lines,
    },
    null,
    0,
  ).replace(/\{"n"/g, '\n{"n"').replace(/\{"k"/g, '\n{"k"') + '\n',
);
console.log(`place-maps: ${town.slug}: ${lines.length} lines, ${osm?.areas.length ?? 0} areas, ${Object.keys(places).length} places placed (${Object.values(from).filter((v) => v === 'osm').length} from the extract)`);
for (const line of unplaced) console.log(`  not placed  ${line}`);
