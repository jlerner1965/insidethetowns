/**
 * A guide's dates on its home page (src/lib/hub-towns.ts): only dates that
 * are set; the outdoor dates lead when two or more qualify, otherwise the
 * guide's traditions lead and the outdoor dates follow. And the next date
 * on a town page is the sooner of a tradition and an outdoor date.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_OUTDOOR_TO_LEAD, guideHomeDates, guideLines, nextUp, placeRows, statewideSummary } from '../src/lib/hub-towns.ts';
import { isUpcoming, type TraditionRecord } from '../src/lib/traditions.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { STANDALONE_GUIDES } from '../src/config/hub-towns.ts';

const TODAY = '2026-11-12';
const rec = (slug: string, extra: Partial<TraditionRecord>, years: TraditionRecord['years']): TraditionRecord =>
  ({ slug, name: slug, type: 'outdoor', organizer: 'Agency', sourceUrl: 'https://example.org/', years, ...extra }) as TraditionRecord;
const set = (date: string) => [{ year: Number(date.slice(0, 4)), status: 'confirmed' as const, date, checked: TODAY }];
const open = [{ year: 2027, status: 'not-announced' as const, checked: TODAY }];
const lyons = { towns: [{ slug: 'lyons' }] };
const own = { town: { name: 'Lyons', guide: 'lyons' }, type: 'festival' as const };

test('only outdoor dates with a date set are lines, the town’s as well as the statewide', () => {
  const records = [
    rec('road-closes', lyons, open),
    rec('road-opens', lyons, set('2027-05-28')),
    rec('meteor', { statewide: true }, set('2026-12-13')),
    rec('free-fishing', { statewide: true }, open),
  ];
  assert.deepEqual(guideLines(records, 'lyons', TODAY).map((r) => r.record.slug), ['road-opens', 'meteor']);
  // A date that has passed with no later year on file is not a date set.
  assert.deepEqual(guideLines([rec('gone', lyons, set('2026-10-01'))], 'lyons', TODAY), []);
});

test('two outdoor dates set: the outdoor dates lead', () => {
  const records = [rec('a', lyons, set('2026-12-01')), rec('b', { statewide: true }, set('2026-12-13')), rec('fest', own, set('2026-12-05'))];
  const dates = guideHomeDates(records, 'lyons', TODAY);
  assert.equal(MIN_OUTDOOR_TO_LEAD, 2);
  assert.equal(dates.lead, 'outdoor');
  assert.deepEqual(dates.outdoor.map((r) => r.record.slug), ['a', 'b']);
  assert.deepEqual(dates.traditions.map((r) => r.record.slug), ['fest']);
});

test('fewer than two outdoor dates set: the traditions lead and the outdoor dates come second', () => {
  const records = [rec('a', lyons, set('2026-12-01')), rec('b', lyons, open), rec('c', { statewide: true }, open), rec('fest', own, set('2026-12-05')), rec('fair', own, open)];
  const dates = guideHomeDates(records, 'lyons', TODAY);
  assert.equal(dates.lead, 'traditions');
  assert.deepEqual(dates.outdoor.map((r) => r.record.slug), ['a'], 'the one that is set is still shown, second');
  assert.deepEqual(dates.traditions.map((r) => r.record.slug), ['fest'], 'a tradition with no date set is on /traditions/, not here');
  // None set at all: traditions lead, and there is no outdoor list to draw.
  const none = guideHomeDates([rec('b', lyons, open), rec('fest', own, set('2026-12-05'))], 'lyons', TODAY);
  assert.deepEqual([none.lead, none.outdoor.length, none.traditions.length], ['traditions', 0, 1]);
});

test('the rule holds for every guide on the records as they are: nothing unannounced on a home page', () => {
  const records = rawRecords();
  for (const key of Object.keys(STANDALONE_GUIDES)) {
    const dates = guideHomeDates(records, key, TODAY);
    for (const r of [...dates.outdoor, ...dates.traditions]) assert.ok(isUpcoming(r), `${key}: ${r.record.slug} has no date set`);
    assert.equal(dates.lead, dates.outdoor.length >= 2 ? 'outdoor' : 'traditions', key);
    // Whatever is left off is still on the guide's /traditions/.
    const all = placeRows(records, key, TODAY);
    assert.ok(all.outdoor.length + all.statewide.length >= dates.outdoor.length, key);
  }
});

test('next on a town page is the sooner of a tradition and an outdoor date', () => {
  const rows = (records: TraditionRecord[]) => placeRows(records, 'salida', TODAY);
  const salida = { town: { name: 'Salida', guide: 'salida' } };
  const fest = rec('fest', { ...salida, type: 'festival' }, set('2027-07-10'));
  const ski = rec('ski-opens', salida, set('2026-12-04'));
  let r = rows([fest, ski]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'ski-opens', 'the outdoor date three weeks out, not the festival in July');
  r = rows([rec('run', { ...salida, type: 'race' }, set('2026-11-27')), ski]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'run');
  // The same day: the tradition.
  r = rows([rec('run', { ...salida, type: 'race' }, set('2026-12-04')), ski]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'run');
  // Only one kind has a date; neither has.
  r = rows([rec('fest', { ...salida, type: 'festival' }, open), ski]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'ski-opens');
  r = rows([rec('fest', { ...salida, type: 'festival' }, open)]);
  assert.equal(nextUp(r.traditions, r.outdoor), undefined);
});

test('the statewide fold’s summary is built from the records', () => {
  const row = (name: string) => ({ record: { name } }) as never;
  assert.equal(statewideSummary([row('Geminid meteor shower: peak night'), row('Free Fishing Weekend')]), '2 statewide dates: Geminid meteor shower, Free Fishing Weekend');
  assert.equal(statewideSummary([row('A'), row('B'), row('C'), row('D'), row('E')]), '5 statewide dates: A, B, C, and 2 more');
  assert.equal(statewideSummary([row('Only: one')]), '1 statewide date: Only');
});
