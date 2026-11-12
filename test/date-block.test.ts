/**
 * The date block beside a tradition's row (src/lib/date-block.ts): what it
 * shows for a date set, a span, a canceled date, no date, and a typical
 * window. It never shows last year's date.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateBlock } from '../src/lib/date-block.ts';
import type { TraditionRow, TraditionYear } from '../src/lib/traditions.ts';

const row = (entry: Partial<TraditionYear>, extra: Partial<TraditionRow> = {}) =>
  ({ entry: { year: 2027, status: 'confirmed', checked: '2026-11-12', ...entry } as TraditionYear, year: entry.year ?? 2027, ...extra }) as TraditionRow;

test('a single day: month, day, year', () => {
  assert.deepEqual(dateBlock(row({ date: '2027-08-21' })), { set: true, canceled: false, top: 'Aug', main: '21', foot: '2027' });
});

test('a span inside one month shows both days', () => {
  assert.deepEqual(dateBlock(row({ date: '2027-04-09', endDate: '2027-04-11' })), { set: true, canceled: false, top: 'Apr', main: '9–11', foot: '2027' });
  // An end date equal to the start is one day.
  assert.equal(dateBlock(row({ date: '2027-04-09', endDate: '2027-04-09' })).main, '9');
});

test('a span into another month shows the first day and where it runs to, the year left to the status line', () => {
  assert.deepEqual(dateBlock(row({ date: '2027-07-23', endDate: '2027-08-01' })), { set: true, canceled: false, top: 'Jul', main: '23', foot: 'to Aug 1' });
  // Across the new year too.
  assert.deepEqual(dateBlock(row({ year: 2026, date: '2026-11-26', endDate: '2027-01-03' })), { set: true, canceled: false, top: 'Nov', main: '26', foot: 'to Jan 3' });
});

test('a moved date shows the new day', () => {
  assert.equal(dateBlock(row({ status: 'moved', date: '2027-06-12', previousDate: '2027-06-05', reason: 'x' })).main, '12');
});

test('a canceled date keeps its numbers and says it is canceled; with no date it is an outline', () => {
  assert.deepEqual(dateBlock(row({ status: 'canceled', date: '2027-06-05' })), { set: true, canceled: true, top: 'Jun', main: '5', foot: '2027' });
  assert.deepEqual(dateBlock(row({ status: 'canceled' })), { set: false, canceled: true, top: '', main: 'TBA', foot: '2027' });
});

test('no date set is TBA with the year awaited, and never last year’s date', () => {
  assert.deepEqual(dateBlock(row({ status: 'not-announced' }, { lastHeld: '2026-06-18' })), { set: false, canceled: false, top: '', main: 'TBA', foot: '2027' });
  // The newest date has passed and no later year is on file: TBA with no year, though the entry still holds the old date.
  const past = dateBlock(row({ year: 2026, date: '2026-08-07', endDate: '2026-08-09' }, { past: true, lastHeld: '2026-08-07' }));
  assert.deepEqual(past, { set: false, canceled: false, top: '', main: 'TBA', foot: '' });
});

test('a typical window only is Varies', () => {
  assert.deepEqual(dateBlock(row({ year: 2026, status: 'typical', typicalWindow: 'between Sept. 1 and May 31' })), { set: false, canceled: false, top: '', main: 'Varies', foot: '' });
});
