/**
 * Two more signatures for the hub's town pages (HubTown.signature; the
 * owner, 12 November 2026): the river at the town's gauge and the snowpack
 * at the nearest SNOTEL station. Like the stocking report
 * (src/lib/fish-stocking.ts), each is read by a scheduled job into a file
 * under data/hub/ and the pages read the file, never the network.
 *
 * River flow. A USGS gauge is read from the agency's current API,
 * api.waterdata.usgs.gov (the older waterservices.usgs.gov is shut down
 * on 22 February 2027, in USGS's own notice); a Colorado Division of
 * Water Resources gauge from its telemetry service. Both give the latest
 * discharge in cubic feet a second with the time it was measured. USGS:
 * "USGS-authored or produced data and information are considered to be in
 * the U.S. Public Domain", and its current readings are "Provisional data
 * subject to revision", so the page says provisional.
 *
 * Snowpack. NRCS's AWDB service gives a station's daily snow water
 * equivalent in inches with its median for that day of the year ("Daily
 * Normals for the Period 1991-2020", on the station's page), which the
 * page prints beside it. NRCS: "Data is provisional and subject to
 * revision."
 *
 * A reading is shown only while it is fresh: a river reading measured in
 * the last three days, a snowpack value from the last five. An old file,
 * a missing station or a value that does not parse shows nothing. Snowpack
 * shows nothing when the station has no snow and the median for the day
 * is none either (summer). Pure: plain data in, plain data out.
 */
import type { RiverGauge, SnotelStation } from '../config/hub-towns.ts';

export interface FlowReading {
  agency: 'USGS' | 'DWR';
  id: string;
  /** Cubic feet a second. */
  cfs: number;
  /** When it was measured, an ISO instant. */
  measured: string;
}
export interface FlowData {
  fetched: string;
  readings: FlowReading[];
}

export interface SnowReading {
  triplet: string;
  /** The day the value is for, "YYYY-MM-DD". */
  date: string;
  /** Snow water equivalent, inches. */
  swe: number;
  /** The station's median for that day of the year, inches, where NRCS gives one. */
  median?: number;
}
export interface SnowData {
  fetched: string;
  readings: SnowReading[];
}

export const FLOW_FRESH_DAYS = 3;
export const SNOW_FRESH_DAYS = 5;

export const FLOW_SOURCES = {
  USGS: { name: 'U.S. Geological Survey', short: 'USGS' },
  DWR: { name: 'Colorado Division of Water Resources', short: 'Colorado DWR' },
} as const;
export const SNOW_SOURCE = 'USDA Natural Resources Conservation Service, SNOTEL';

export const usgsLatestUrl = (id: string) =>
  `https://api.waterdata.usgs.gov/ogcapi/v1/collections/latest-continuous/items?f=json&monitoring_location_id=USGS-${id}&parameter_code=00060`;
export const dwrStationUrl = (abbrev: string) => `https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrystation/?format=json&abbrev=${abbrev}`;
export const snotelUrl = (triplets: readonly string[], begin: string, end: string) =>
  `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data?stationTriplets=${triplets.join(',')}&elements=WTEQ&duration=DAILY&beginDate=${begin}&endDate=${end}&centralTendencyType=MEDIAN&returnFlags=false`;

const number = (value: unknown): number | undefined => {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

/** A USGS latest-continuous response: the discharge reading, or undefined when there is none or it is USGS's "no value" (negative). */
export function parseUsgsLatest(id: string, json: unknown): FlowReading | undefined {
  const features = (json as { features?: Array<{ properties?: Record<string, unknown> }> })?.features ?? [];
  const p = features.map((f) => f.properties ?? {}).find((x) => x.parameter_code === '00060' && x.monitoring_location_id === `USGS-${id}`);
  const cfs = number(p?.value);
  const time = typeof p?.time === 'string' ? p.time : undefined;
  if (cfs === undefined || cfs < 0 || !time || Number.isNaN(Date.parse(time))) return undefined;
  return { agency: 'USGS', id, cfs, measured: new Date(time).toISOString() };
}

/** A DWR telemetry-station response: its current discharge, or undefined. */
export function parseDwrStation(abbrev: string, json: unknown): FlowReading | undefined {
  const rows = (json as { ResultList?: Array<Record<string, unknown>> })?.ResultList ?? [];
  const r = rows.find((x) => x.abbrev === abbrev && x.parameter === 'DISCHRG');
  const cfs = number(r?.measValue);
  const time = typeof r?.measDateTime === 'string' ? r.measDateTime : undefined;
  if (cfs === undefined || cfs < 0 || r?.units !== 'CFS' || !time || Number.isNaN(Date.parse(time))) return undefined;
  return { agency: 'DWR', id: abbrev, cfs, measured: new Date(time).toISOString() };
}

/** An AWDB data response: each station's newest daily value that has one. */
export function parseSnotel(json: unknown): SnowReading[] {
  const out: SnowReading[] = [];
  for (const station of (json as Array<{ stationTriplet?: string; data?: Array<{ stationElement?: { elementCode?: string }; values?: Array<Record<string, unknown>> }> }>) ?? []) {
    const series = station.data?.find((d) => d.stationElement?.elementCode === 'WTEQ');
    const latest = [...(series?.values ?? [])].reverse().find((v) => number(v.value) !== undefined && typeof v.date === 'string');
    if (!station.stationTriplet || !latest) continue;
    const swe = number(latest.value)!;
    if (swe < 0) continue;
    const median = number(latest.median);
    out.push({ triplet: station.stationTriplet, date: String(latest.date).slice(0, 10), swe, ...(median !== undefined && median >= 0 ? { median } : {}) });
  }
  return out;
}

const dayMs = 86_400_000;
const daysOld = (iso: string, now: Date) => (now.getTime() - Date.parse(iso)) / dayMs;

/** The gauge's reading, while it is fresh; else nothing. */
export function riverFlow(gauge: RiverGauge, data: FlowData | undefined, now: Date): FlowReading | undefined {
  const reading = data?.readings.find((r) => r.agency === gauge.agency && r.id === gauge.id);
  if (!reading) return undefined;
  const age = daysOld(reading.measured, now);
  return age >= 0 && age <= FLOW_FRESH_DAYS ? reading : undefined;
}

/** "1,250" for a big river, "38.1" for a creek, "7.21" as the agency gave it. */
export function formatCfs(cfs: number): string {
  return cfs >= 100 ? Math.round(cfs).toLocaleString('en-US') : String(Number(cfs.toPrecision(3)));
}

/** The station's value, while it is fresh and there is snow or a median to speak of; else nothing. */
export function snowpack(station: SnotelStation, data: SnowData | undefined, today: string): SnowReading | undefined {
  const reading = data?.readings.find((r) => r.triplet === station.triplet);
  if (!reading) return undefined;
  const age = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${reading.date}T00:00:00Z`)) / dayMs;
  if (age < 0 || age > SNOW_FRESH_DAYS) return undefined;
  if (reading.swe === 0 && !(reading.median && reading.median > 0)) return undefined;
  return reading;
}

/** "35% of the median for the date", where there is a median above zero. */
export function percentOfMedian(reading: SnowReading): number | undefined {
  return reading.median && reading.median > 0 ? Math.round((reading.swe / reading.median) * 100) : undefined;
}
