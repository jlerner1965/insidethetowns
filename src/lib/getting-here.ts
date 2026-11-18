/**
 * Getting here through the year (the owner's navigation brief of 18
 * November 2026, item 7): every hub town page lists Denver International
 * (DEN) with its miles and drive time beside the nearest commercial
 * airport, and every drive the page prints that crosses a pass closed in
 * winter carries the year-round route beside it.
 *
 * The figures are in data/hub/getting-here.json, written by
 * scripts/getting-here.ts from the same router as the road miles
 * (data/hub/road-miles.json, scripts/town-facts.ts), so a year-round figure
 * is measured the way the figure beside it is. A drive is over a pass when
 * the router's line runs within half a kilometre of the pass's point in
 * the Geographic Names Information System; the year-round route is the
 * router's by way of a place on a road kept open in winter (the file's
 * `waypoints`), itself checked against every pass. A pass is closed in
 * winter when the agency that keeps it says so (`seasonalClosure` in
 * data/hub/passes.json, in the agency's words).
 *
 * Plain functions over plain data; the file itself is read in
 * src/config/getting-here.ts, so the script that writes it can use these.
 */
import type { Pass } from '../config/passes.ts';
import { formatDrive, formatMiles, type Airports, type Leg, type RoadMiles } from './near.ts';

export interface GettingHere {
  checked: string;
  source: { name: string; url: string };
  /** Where each pass and waypoint is: its point in GNIS. */
  pointSource: { name: string; url: string };
  /** The passes closed in winter that every drive is checked against, each at its GNIS point or points. */
  passes: Record<string, Array<{ name: string; gnisId: number; lat: number; lon: number }>>;
  /** The places a year-round route goes by way of. */
  waypoints: Record<string, { name: string; gnisId: number; lat: number; lon: number }>;
  /**
   * The airports a town lists besides its nearest by road (road-miles.json):
   * Denver International always, and the nearest by a year-round road
   * where the nearest by road is over a pass closed in winter. Town, then
   * the airport's code.
   */
  airports: Record<string, Record<string, Leg>>;
  /** Each printed drive found over a pass closed in winter (by fromDenverKey, airportKey, or the pair's key in road-miles.json): the passes, and the year-round route where the router gives one. */
  routes: Record<string, WinterRoute>;
}

export interface YearRound extends Leg {
  /** Waypoint keys, in order. */
  via: string[];
}

export interface WinterRoute {
  /** Pass slugs (data/hub/passes.json), in the order the drive meets them. */
  over: string[];
  yearRound?: YearRound;
  /** Why there is no year-round figure, where there is none. */
  none?: string;
}

/** The code of Denver International, listed on every town page. */
export const DEN = 'DEN';

/** "denver>leadville": the drive from Denver the page prints. */
export const fromDenverKey = (town: string): string => `denver>${town}`;
/** "leadville>ASE": the drive from the town to an airport. */
export const airportKey = (town: string, code: string): string => `${town}>${code}`;

/** A drive over a pass closed in winter, as the page shows it. */
export interface WinterNote {
  over: Pass[];
  /** `via` in names. */
  yearRound?: Leg & { via: string[] };
  /** The words the page prints (winterLine). */
  line: string;
  /** When the router was asked (the file's `checked`). */
  checked: string;
}

/**
 * The note for a drive, or undefined where the drive crosses no pass closed
 * in winter. `via` is in names. A pair is routed one way, from the slug
 * that sorts first (road-miles.json); `reverse` names its places from the
 * other end, for that town's page.
 */
export function winterNote(gh: GettingHere | undefined, key: string, passes: readonly Pass[], reverse = false): WinterNote | undefined {
  const route = gh?.routes[key];
  if (!route) return undefined;
  const over = route.over.map((slug) => passes.find((p) => p.slug === slug)).filter((p): p is Pass => !!p);
  if (over.length === 0) return undefined;
  const y = route.yearRound;
  const via = y ? y.via.map((w) => gh!.waypoints[w]?.name ?? w) : [];
  const yearRound = y ? { miles: y.miles, minutes: y.minutes, via: reverse ? via.reverse() : via } : undefined;
  return { over, ...(yearRound ? { yearRound } : {}), line: winterLine({ over, yearRound }), checked: gh!.checked };
}

/** "Independence Pass", "Kebler Pass and Cottonwood Pass". */
function names(list: readonly string[]): string {
  return list.length < 2 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

/**
 * The note's words: "Over Independence Pass, which is closed in winter.
 * Year-round, by way of Glenwood Springs: 129 miles, about 2 hours 50
 * minutes." Without a year-round figure, the first sentence alone.
 */
export function winterLine(note: Pick<WinterNote, 'over' | 'yearRound'>): string {
  const over = names(note.over.map((p) => p.name));
  const first = `Over ${over}, ${note.over.length > 1 ? 'which are' : 'which is'} closed in winter.`;
  const y = note.yearRound;
  return y ? `${first} Year-round, by way of ${names(y.via)}: ${formatMiles(y.miles)}, ${formatDrive(y.minutes)}.` : first;
}

export interface AirportRow extends Leg {
  code: string;
  name: string;
  city: string;
  url?: string;
  /** The nearest commercial airport by road (road-miles.json). */
  nearest: boolean;
  winter?: WinterNote;
}

/**
 * The airports a town page lists, nearest by road first: the nearest by
 * road, then the file's others for the town (Denver International, and
 * the nearest by a year-round road where it is another), each with its
 * miles and drive time and, where the drive is over a pass closed in
 * winter, the note. An airport is listed once.
 */
export function airportRows(town: string, roads: RoadMiles | undefined, airports: Airports | undefined, gh: GettingHere | undefined, passes: readonly Pass[]): AirportRow[] {
  const find = (code: string) => airports?.airports.find((a) => a.code === code);
  const legs = new Map<string, Leg>();
  const nearest = roads?.airport[town];
  if (nearest) legs.set(nearest.code, { miles: nearest.miles, minutes: nearest.minutes });
  for (const [code, leg] of Object.entries(gh?.airports[town] ?? {})) if (!legs.has(code)) legs.set(code, leg);
  const rows: AirportRow[] = [];
  for (const [code, leg] of legs) {
    const a = find(code);
    if (!a) continue;
    const winter = winterNote(gh, airportKey(town, code), passes);
    rows.push({ code, name: a.name, city: a.city, ...(a.url ? { url: a.url } : {}), miles: leg.miles, minutes: leg.minutes, nearest: code === nearest?.code, ...(winter ? { winter } : {}) });
  }
  return rows.sort((x, y) => Number(y.nearest) - Number(x.nearest) || x.miles - y.miles);
}
