#!/usr/bin/env node
/**
 * Reads the river gauges and SNOTEL stations the hub's town pages watch
 * (HubTown.signature, src/lib/town-signals.ts) into data/hub/river-flow.json
 * and data/hub/snowpack.json.
 *
 *   node scripts/town-signals.ts            # read and print
 *   node scripts/town-signals.ts --write    # and write the files
 *
 * Public services, no key: USGS's api.waterdata.usgs.gov, Colorado DWR's
 * telemetry service, NRCS's AWDB. One request a gauge and one for all the
 * stations. A gauge that fails keeps its last reading in the file (the
 * pages drop a reading once it is three days old); a run in which nothing
 * could be read writes nothing; and the run exits 0 either way, so a
 * service having a bad morning never fails a workflow or a build.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { HUB_TOWNS } from '../src/config/hub-towns.ts';
import { dayKey } from '../src/lib/dates.ts';
import { dwrStationUrl, parseDwrStation, parseSnotel, parseUsgsLatest, snotelUrl, usgsLatestUrl, type FlowData, type FlowReading, type SnowData } from '../src/lib/town-signals.ts';

const FLOW = 'data/hub/river-flow.json';
const SNOW = 'data/hub/snowpack.json';
const write = process.argv.includes('--write');
const now = new Date();
// The day as Colorado has it (dayKey): a run in the evening, already tomorrow in UTC, stamped every read a day ahead (audit, 13 November 2026).
const today = dayKey(now);
const headers = { 'user-agent': 'insidethetowns.com town pages (daily reader)', accept: 'application/json' };

async function json(url: string): Promise<unknown | undefined> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
    if (!res.ok) {
      console.log(`  ${res.status} from ${new URL(url).host}`);
      return undefined;
    }
    return await res.json();
  } catch (error) {
    console.log(`  could not reach ${new URL(url).host} (${error instanceof Error ? error.message : String(error)})`);
    return undefined;
  }
}
const read = <T>(file: string): T | undefined => (existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as T) : undefined);
const save = (file: string, data: unknown) => {
  if (!write) return;
  mkdirSync('data/hub', { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 1)}\n`);
};

// River flow: each gauge on its own, so one that fails keeps what it had.
const gauges = HUB_TOWNS.flatMap((t) => (t.signature?.kind === 'river-flow' ? [{ town: t.slug, ...t.signature.gauge }] : []));
const before = read<FlowData>(FLOW);
const readings: FlowReading[] = [];
let fresh = 0;
for (const g of gauges) {
  const body = await json(g.agency === 'USGS' ? usgsLatestUrl(g.id) : dwrStationUrl(g.id));
  const reading = body === undefined ? undefined : g.agency === 'USGS' ? parseUsgsLatest(g.id, body) : parseDwrStation(g.id, body);
  if (reading) {
    fresh++;
    readings.push(reading);
    console.log(`river-flow: ${g.town} ${g.agency} ${g.id}: ${reading.cfs} cfs at ${reading.measured}`);
  } else {
    const kept = before?.readings.find((r) => r.agency === g.agency && r.id === g.id);
    if (kept) readings.push(kept);
    console.log(`river-flow: ${g.town} ${g.agency} ${g.id}: no reading${kept ? `; keeping ${kept.measured}` : ''}`);
  }
}
if (fresh > 0) save(FLOW, { fetched: today, readings } satisfies FlowData);
else console.log(`river-flow: nothing read; ${existsSync(FLOW) ? `keeping ${FLOW} as it is` : 'no file written'}`);

// Snowpack: all the stations in one request, the last week of daily values.
const stations = HUB_TOWNS.flatMap((t) => (t.signature?.kind === 'snowpack' ? [{ town: t.slug, ...t.signature.station }] : []));
if (stations.length > 0) {
  const begin = dayKey(new Date(now.getTime() - 7 * 86_400_000));
  const body = await json(snotelUrl(stations.map((s) => s.triplet), begin, today));
  const parsed = body === undefined ? [] : parseSnotel(body);
  const old = read<SnowData>(SNOW);
  const merged = stations.flatMap((s) => {
    const r = parsed.find((p) => p.triplet === s.triplet) ?? old?.readings.find((p) => p.triplet === s.triplet);
    console.log(`snowpack: ${s.town} ${s.triplet}: ${r ? `${r.swe} in on ${r.date}${r.median !== undefined ? `, median ${r.median}` : ''}` : 'no value'}`);
    return r ? [r] : [];
  });
  if (parsed.length > 0) save(SNOW, { fetched: today, readings: merged } satisfies SnowData);
  else console.log(`snowpack: nothing read; ${existsSync(SNOW) ? `keeping ${SNOW} as it is` : 'no file written'}`);
}
console.log(write ? 'town-signals: done' : 'town-signals: dry run; pass --write to save');
