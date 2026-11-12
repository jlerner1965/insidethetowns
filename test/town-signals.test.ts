/**
 * River flow and snowpack on the hub's town pages (src/lib/town-signals.ts):
 * reading the agencies' responses, and showing a reading only while it is
 * fresh. One signature a town, and Castle Rock has none.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUB_TOWNS, findHubTown } from '../src/config/hub-towns.ts';
import { formatCfs, parseDwrStation, parseSnotel, parseUsgsLatest, percentOfMedian, riverFlow, snowpack, type FlowData, type SnowData } from '../src/lib/town-signals.ts';

const usgs = (value: unknown, time = '2026-11-12T20:30:00+00:00', id = 'USGS-09361500') => ({ features: [{ properties: { monitoring_location_id: id, parameter_code: '00060', time, value, unit_of_measure: 'ft^3/s', approval_status: 'Provisional' } }] });
const dwr = (extra: Record<string, unknown> = {}) => ({ ResultList: [{ abbrev: 'ARKSALCO', parameter: 'DISCHRG', measValue: 245.0, units: 'CFS', measDateTime: '2026-11-12T14:15:00-07:00', ...extra }] });

test('a USGS reading is the discharge and when it was measured', () => {
  assert.deepEqual(parseUsgsLatest('09361500', usgs('1250')), { agency: 'USGS', id: '09361500', cfs: 1250, measured: '2026-11-12T20:30:00.000Z' });
  // No feature, another gauge's, a "no value", or a time that does not parse: nothing.
  assert.equal(parseUsgsLatest('09361500', { features: [] }), undefined);
  assert.equal(parseUsgsLatest('06719505', usgs('1250')), undefined);
  assert.equal(parseUsgsLatest('09361500', usgs('-999999')), undefined);
  assert.equal(parseUsgsLatest('09361500', usgs('')), undefined);
  assert.equal(parseUsgsLatest('09361500', usgs('1250', 'soon')), undefined);
  assert.equal(parseUsgsLatest('09361500', 'Service unavailable'), undefined);
});

test('a DWR reading is its current discharge in cfs', () => {
  assert.deepEqual(parseDwrStation('ARKSALCO', dwr()), { agency: 'DWR', id: 'ARKSALCO', cfs: 245, measured: '2026-11-12T21:15:00.000Z' });
  assert.equal(parseDwrStation('ARKSALCO', dwr({ parameter: 'GAGE_HT' })), undefined);
  assert.equal(parseDwrStation('ARKSALCO', dwr({ units: 'AF' })), undefined);
  assert.equal(parseDwrStation('ARKSALCO', dwr({ measValue: null })), undefined);
  assert.equal(parseDwrStation('ARKGRNCO', dwr()), undefined);
});

test('a SNOTEL station’s newest daily value, with its median where NRCS gives one', () => {
  const body = [
    { stationTriplet: '485:CO:SNTL', data: [{ stationElement: { elementCode: 'WTEQ' }, values: [{ date: '2026-11-10', value: 0.9, median: 2.4 }, { date: '2026-11-11', value: 0.9, median: 2.6 }, { date: '2026-11-12' }] }] },
    { stationTriplet: '415:CO:SNTL', data: [{ stationElement: { elementCode: 'WTEQ' }, values: [{ date: '2026-11-11', value: 0.3 }] }] },
    { stationTriplet: '999:CO:SNTL', data: [{ stationElement: { elementCode: 'SNWD' }, values: [{ date: '2026-11-11', value: 4 }] }] },
  ];
  assert.deepEqual(parseSnotel(body), [
    { triplet: '485:CO:SNTL', date: '2026-11-11', swe: 0.9, median: 2.6 },
    { triplet: '415:CO:SNTL', date: '2026-11-11', swe: 0.3 },
  ]);
  assert.deepEqual(parseSnotel(undefined), []);
  assert.equal(percentOfMedian({ triplet: 'x', date: '2026-11-11', swe: 0.9, median: 2.6 }), 35);
  assert.equal(percentOfMedian({ triplet: 'x', date: '2026-11-11', swe: 0.9 }), undefined);
  assert.equal(percentOfMedian({ triplet: 'x', date: '2026-11-11', swe: 0.9, median: 0 }), undefined);
});

const gauge = { agency: 'USGS', id: '09361500', river: 'Animas River', where: 'at Durango', page: 'https://example.org/' } as const;
const flow = (measured: string): FlowData => ({ fetched: '2026-11-12', readings: [{ agency: 'USGS', id: '09361500', cfs: 1250, measured }] });

test('a river reading is shown for three days and then not at all', () => {
  const now = new Date('2026-11-12T22:00:00Z');
  assert.equal(riverFlow(gauge, flow('2026-11-12T20:30:00.000Z'), now)?.cfs, 1250);
  assert.equal(riverFlow(gauge, flow('2026-11-10T20:30:00.000Z'), now)?.cfs, 1250);
  assert.equal(riverFlow(gauge, flow('2026-11-08T20:30:00.000Z'), now), undefined, 'four days old');
  assert.equal(riverFlow(gauge, undefined, now), undefined, 'no file');
  assert.equal(riverFlow({ ...gauge, id: '06719505' }, flow('2026-11-12T20:30:00.000Z'), now), undefined, 'another gauge');
  assert.equal(riverFlow({ ...gauge, agency: 'DWR' }, flow('2026-11-12T20:30:00.000Z'), now), undefined, 'the same id at another agency');
});

test('cfs reads as the agency gave it', () => {
  assert.equal(formatCfs(1250), '1,250');
  assert.equal(formatCfs(245), '245');
  assert.equal(formatCfs(38.1), '38.1');
  assert.equal(formatCfs(7.21), '7.21');
});

const station = { triplet: '485:CO:SNTL', name: 'Fremont Pass', elevationFt: 11310, page: 'https://example.org/' };
const snow = (date: string, swe: number, median?: number): SnowData => ({ fetched: '2026-11-12', readings: [{ triplet: '485:CO:SNTL', date, swe, ...(median === undefined ? {} : { median }) }] });

test('snowpack is shown while it is fresh, and not in a summer with no snow and no median', () => {
  assert.equal(snowpack(station, snow('2026-11-11', 0.9, 2.6), '2026-11-12')?.swe, 0.9);
  assert.equal(snowpack(station, snow('2026-11-05', 0.9, 2.6), '2026-11-12'), undefined, 'a week old');
  assert.equal(snowpack(station, snow('2026-07-20', 0, 0), '2026-07-21'), undefined, 'summer');
  assert.equal(snowpack(station, snow('2026-07-20', 0), '2026-07-21'), undefined);
  assert.equal(snowpack(station, snow('2026-10-20', 0, 0.4), '2026-10-21')?.swe, 0, 'no snow yet where there usually is: that is worth saying');
  assert.equal(snowpack(station, undefined, '2026-11-12'), undefined);
});

test('the config: nine gauges, four stations, one signature a town, none for Castle Rock', () => {
  const kinds = (kind: string) => HUB_TOWNS.filter((t) => t.signature?.kind === kind).map((t) => t.slug).sort();
  assert.deepEqual(kinds('river-flow'), ['buena-vista', 'durango', 'fort-lupton', 'fort-morgan', 'golden', 'grand-junction', 'longmont', 'salida', 'timnath']);
  assert.deepEqual(kinds('snowpack'), ['breckenridge', 'crested-butte', 'leadville', 'nederland']);
  assert.equal(findHubTown('castle-rock')!.signature, undefined);
  for (const t of HUB_TOWNS) {
    if (t.signature?.kind === 'river-flow') {
      const g = t.signature.gauge;
      assert.match(g.id, g.agency === 'USGS' ? /^\d{8}$/ : /^[A-Z]{6,10}$/, t.slug);
      assert.match(g.page, g.agency === 'USGS' ? /^https:\/\/waterdata\.usgs\.gov\/monitoring-location\/USGS-\d{8}\/$/ : /^https:\/\/dwr\.state\.co\.us\/Tools\/Stations\/[A-Z]+$/, t.slug);
      assert.ok(g.page.includes(g.id), t.slug);
    }
    if (t.signature?.kind === 'snowpack') {
      const s = t.signature.station;
      assert.match(s.triplet, /^\d+:CO:SNTL$/, t.slug);
      assert.ok(s.page.endsWith(`sitenum=${s.triplet.split(':')[0]}`), t.slug);
      assert.ok(s.elevationFt > 8000, t.slug);
    }
  }
});
