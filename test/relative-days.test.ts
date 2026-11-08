/**
 * "Today" and "Tomorrow" on the game labels come from the reader's date, not
 * the build's (src/lib/relative-days.ts, audit of 8 November 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextDayKey, relabelDays, relativeWord } from '../src/lib/relative-days.ts';

test('the day after a day crosses months and years', () => {
  assert.equal(nextDayKey('2026-11-12'), '2026-11-13');
  assert.equal(nextDayKey('2026-11-30'), '2026-12-01');
  assert.equal(nextDayKey('2026-12-31'), '2027-01-01');
  assert.equal(nextDayKey('2028-02-28'), '2028-02-29');
});

test('a page built on Friday tells Saturday’s reader the truth: Friday’s game keeps its day, Saturday’s is today', () => {
  const label = (day: string, only?: string) => ({ dataset: { relday: day, ...(only ? { reldayOnly: only } : {}) } as Record<string, string | undefined>, textContent: `the full day of ${day}` });
  const friday = label('2026-11-06');
  const saturday = label('2026-11-07');
  const sunday = label('2026-11-08');
  const tableSunday = label('2026-11-08', 'today');
  const unmarked = { dataset: {} as Record<string, string | undefined>, textContent: 'Thursday, November 12' };
  relabelDays([friday, saturday, sunday, tableSunday, unmarked], '2026-11-07');
  assert.equal(friday.textContent, 'the full day of 2026-11-06');
  assert.equal(saturday.textContent, 'Today');
  assert.equal(sunday.textContent, 'Tomorrow');
  assert.equal(tableSunday.textContent, 'the full day of 2026-11-08', 'a table that only says "Today" leaves tomorrow as a date');
  assert.equal(unmarked.textContent, 'Thursday, November 12');
  assert.equal(relativeWord('2026-11-12', '2026-11-12', true), 'Today');
  assert.equal(relativeWord('2026-11-13', '2026-11-12'), 'Tomorrow');
  assert.equal(relativeWord('2026-11-14', '2026-11-12'), undefined);
});
