/**
 * "Near this town", the facts strip and "Getting there" (the additions of
 * 12 November 2026): the readings of two generated files and one config.
 *
 * - data/hub/road-miles.json: road miles and drive minutes for every pair
 *   of places that are near each other, from one router
 *   (scripts/town-facts.ts). A pair is stored once, so the page for A and
 *   the page for B print the same number.
 * - data/hub/town-facts.json: each place's point, elevation and
 *   population, each from the agency named in the file.
 * - src/config/passes.ts: the passes and named routes between towns.
 *
 * A place is a hub town's slug or a standalone guide's key
 * (src/lib/hub-towns.ts, placeKey). Plain functions over plain data; the
 * pages import the JSON and hand it in.
 */
import type { Pass } from '../config/passes.ts';

/** Where "from Denver" is measured from: Denver's Populated Place point in GNIS (feature 201738). */
export const DENVER = { name: 'Denver', lat: 39.7391536, lon: -104.9847034 } as const;

export interface TownFacts {
  checked: string;
  sources: {
    point: { name: string; url: string };
    elevation: { name: string; url: string };
    population: { name: string; url: string; year: number };
  };
  towns: Record<string, { gnisId: number; lat: number; lon: number; elevationFt?: number; population?: number }>;
}

export interface Leg {
  miles: number;
  minutes: number;
}

export interface RoadMiles {
  checked: string;
  source: { name: string; url: string };
  denver: { name: string; lat: number; lon: number };
  /** "a|b", a before b: the drive from a to b. */
  pairs: Record<string, Leg>;
  fromDenver: Record<string, Leg>;
  /** The nearest commercial airport by road, by its code in data/hub/airports.json. */
  airport: Record<string, Leg & { code: string }>;
}

export interface Airports {
  listSource: string;
  checked: string;
  airports: Array<{ code: string; name: string; city: string; lat?: number; lon?: number; url?: string; source?: string }>;
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** The one number both pages print for a pair. */
export function roadLeg(roads: Pick<RoadMiles, 'pairs'>, a: string, b: string): Leg | undefined {
  return roads.pairs[pairKey(a, b)];
}

export const NEAR_MIN = 4;
export const NEAR_MAX = 6;

/**
 * The nearest other places with a page, by road: up to six, nearest first.
 * Fewer than four is still a list (a town at the edge of the map); none is
 * no block. Only a place in `withPage` is listed, so nothing links to a
 * page that is not built.
 */
export function nearestPlaces(roads: Pick<RoadMiles, 'pairs'>, place: string, withPage: ReadonlySet<string>): Array<{ place: string } & Leg> {
  const out: Array<{ place: string } & Leg> = [];
  for (const [key, leg] of Object.entries(roads.pairs)) {
    const [a, b] = key.split('|') as [string, string];
    const other = a === place ? b : b === place ? a : undefined;
    if (other && withPage.has(other)) out.push({ place: other, ...leg });
  }
  return out.sort((x, y) => x.miles - y.miles || x.place.localeCompare(y.place)).slice(0, NEAR_MAX);
}

/**
 * The passes and named routes on a place's block: each one that names the
 * place as an end or as a town it serves, and whose other end has a page.
 */
export function passesFor(passes: readonly Pass[], place: string, withPage: ReadonlySet<string>): Array<{ pass: Pass; to: string }> {
  const out: Array<{ pass: Pass; to: string }> = [];
  for (const pass of passes) {
    const [a, b] = pass.connects;
    const named = a === place || b === place || !!pass.alsoServes?.includes(place);
    if (!named) continue;
    // From an end, the other end; from a town it also serves, the end that is not the nearer one is unknown, so name both ends.
    const to = a === place ? b : b === place ? a : undefined;
    if (to && !withPage.has(to)) continue;
    if (!to && !(withPage.has(a) && withPage.has(b))) continue;
    out.push({ pass, to: to ?? '' });
  }
  return out;
}

/** "12 miles", "1 mile", "104 miles": whole miles from ten up, one decimal below. */
export function formatMiles(miles: number): string {
  const n = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'mile' : 'miles'}`;
}

/** "about 25 minutes", "about 1 hour 40 minutes": to the nearest five minutes, never to the minute. */
export function formatDrive(minutes: number): string {
  const m = Math.max(5, Math.round(minutes / 5) * 5);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `about ${m} minutes`;
  return `about ${h} ${h === 1 ? 'hour' : 'hours'}${rest ? ` ${rest} minutes` : ''}`;
}
