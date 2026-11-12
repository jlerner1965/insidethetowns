/**
 * Dates that pass after the build (src/lib/tradition-expiry.ts, and toRow in
 * src/lib/traditions.ts for the build's own day): a season page expires a
 * date, and the reader's browser does the same for a stale build.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { datePassed } from '../src/lib/tradition-expiry.ts';
import { isUpcoming, seasonCounts, seasonRows, townGroups, type TraditionRecord } from '../src/lib/traditions.ts';

const rec = (slug: string, date: string, endDate?: string): TraditionRecord =>
  ({ slug, name: slug, town: { name: slug, guide: 'lyons' }, type: 'tree-lighting', organizer: 'Town', sourceUrl: 'https://example.org/', years: [{ year: 2026, status: 'confirmed', date, endDate, checked: '2026-11-12' }] }) as TraditionRecord;

test('a season page stops calling a passed date confirmed, and stops counting it', () => {
  const records = [rec('early', '2026-11-21'), rec('late', '2026-12-05'), rec('run', '2026-11-20', '2026-11-29')];
  const before = seasonRows(records, 'tree-lighting', '2026-11-12');
  assert.equal(before.filter((r) => r.past).length, 0);
  assert.equal(seasonCounts(before).confirmed, 3);

  const after = seasonRows(records, 'tree-lighting', '2026-11-25');
  const bySlug = Object.fromEntries(after.map((r) => [r.record.slug, r]));
  assert.equal(bySlug.early!.past, true, 'the 21st has passed on the 25th');
  assert.equal(bySlug.early!.lastHeld, '2026-11-21', 'and is given as the last held');
  assert.equal(isUpcoming(bySlug.early!), false);
  assert.equal(bySlug.run!.past, undefined, 'a run still on today has not passed');
  assert.equal(bySlug.late!.past, undefined);
  assert.equal(seasonCounts(after).confirmed, 2);
  // The day itself is not past.
  assert.equal(seasonRows(records, 'tree-lighting', '2026-11-21').find((r) => r.record.slug === 'early')!.past, undefined);
});

test('a guide’s traditions page moves a passed date out of "Date confirmed"', () => {
  const groups = townGroups([rec('early', '2026-11-21'), rec('late', '2026-12-05')], 'lyons', '2026-11-25');
  assert.deepEqual(groups.dated.map((r) => r.record.slug), ['late']);
  assert.deepEqual(groups.waiting.map((r) => r.record.slug), ['early']);
});

test('in the browser a date has passed once its last day is before the reader’s day', () => {
  assert.equal(datePassed('2026-11-21', '2026-11-22'), true);
  assert.equal(datePassed('2026-11-21', '2026-11-21'), false);
  assert.equal(datePassed('2026-11-29', '2026-11-25'), false);
  assert.equal(datePassed(undefined, '2026-11-25'), false);
});
