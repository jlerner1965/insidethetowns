#!/usr/bin/env node
/**
 * Writes the data a place page's street map is drawn from.
 *
 *   node scripts/place-maps.ts --town=berthoud
 *
 * A place page with no photograph was a page of text (audit of 9 November
 * 2026), and the site's security policy allows no embedded map. So the map
 * is the guide's own: the roads around the town from the Census Bureau's
 * TIGERweb service and each listing's address placed by the Census
 * geocoder, both public-domain federal data, kept in
 * data/<town>/place-map.json and drawn at build as an inline SVG
 * (src/components/PlaceMap.astro). Nothing is fetched when a page is read.
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

const file = join(root, 'data', town.slug, 'place-map.json');
const before = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { places: {} };

// Layer 6 is the secondary roads at street scale: the US and state highways, a town's main street often among them.
const lines = [...(await layer(6, 'highway')), ...(await layer(8, 'road')), ...(await layer(9, 'rail'))];

const dir = join(root, 'content', town.slug, 'places');
const places: Record<string, [number, number]> = {};
const unplaced: string[] = [];
for (const name of readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort()) {
  const id = name.replace(/\.md$/, '');
  const text = readFileSync(join(dir, name), 'utf8');
  const address = /^address: "?(.+?)"?$/m.exec(text)?.[1];
  if (!address) continue;
  // A pin set by hand ("fixed" in the file) stands: the geocoder spreads a house number along a range that can span two blocks.
  if (before.fixed?.[id]) {
    places[id] = before.fixed[id];
    continue;
  }
  if (!refresh && before.places?.[id] && before.addresses?.[id] === address) {
    places[id] = before.places[id];
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
    else places[id] = [round(lat), round(lng)];
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
      source: 'U.S. Census Bureau: TIGERweb (roads and railroads) and the Census geocoder (addresses); public domain',
      read: new Date().toISOString().slice(0, 10),
      // What the town calls a road the Census names by its number; kept by hand, and kept across runs.
      aliases: before.aliases ?? {},
      // Pins corrected by hand, with the reason in docs or the commit; these win over the geocoder on every run.
      fixed: before.fixed ?? {},
      box,
      places,
      addresses,
      lines,
    },
    null,
    0,
  ).replace(/\{"n"/g, '\n{"n"') + '\n',
);
console.log(`place-maps: ${town.slug}: ${lines.length} lines, ${Object.keys(places).length} places placed`);
for (const line of unplaced) console.log(`  not placed  ${line}`);
