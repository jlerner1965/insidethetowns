/**
 * The date layer, which every "is this still on?" decision rests on.
 *
 * Content is written as Denver wall clock with no offset, so these check that
 * a naive string becomes the instant a reader in Colorado would mean by it —
 * including across both daylight-saving transitions, where an hour either
 * does not exist or happens twice.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, formatTimeRange, fromWallClock, parseLocal, startOfDay, toIsoLocal } from '../src/lib/dates.ts';

const iso = (d: Date) => d.toISOString();

test('naive wall clock resolves against Denver, not the server', () => {
  // Mountain Daylight Time is UTC-6, so 10:00 in Denver is 16:00 UTC.
  assert.equal(iso(parseLocal('2026-09-20T10:00')), '2026-09-20T16:00:00.000Z');
  // Mountain Standard Time is UTC-7.
  assert.equal(iso(parseLocal('2026-12-05T10:00')), '2026-12-05T17:00:00.000Z');
});

test('a bare date is midnight in Denver', () => {
  assert.equal(iso(parseLocal('2026-09-20')), '2026-09-20T06:00:00.000Z');
  assert.equal(iso(parseLocal('2026-12-05')), '2026-12-05T07:00:00.000Z');
});

test('spring forward: the hour that does not exist still yields a real instant', () => {
  // 2026-03-08 02:30 America/Denver never happens — the clock jumps 02:00 to
  // 03:00. It must still resolve, and must not land on the previous day.
  const t = parseLocal('2026-03-08T02:30');
  assert.ok(!Number.isNaN(t.getTime()));
  assert.equal(dayKey(t), '2026-03-08');
});

test('spring forward: midnight either side of the transition', () => {
  assert.equal(iso(parseLocal('2026-03-07')), '2026-03-07T07:00:00.000Z'); // MST
  assert.equal(iso(parseLocal('2026-03-09')), '2026-03-09T06:00:00.000Z'); // MDT
});

test('fall back: the repeated hour picks one instant and keeps the date', () => {
  // 2026-11-01 01:30 happens twice in Denver.
  const t = parseLocal('2026-11-01T01:30');
  assert.equal(dayKey(t), '2026-11-01');
  assert.equal(iso(parseLocal('2026-10-31')), '2026-10-31T06:00:00.000Z'); // MDT
  assert.equal(iso(parseLocal('2026-11-02')), '2026-11-02T07:00:00.000Z'); // MST
});

test('a DST-transition day is still exactly one calendar day long', () => {
  // The spring-forward day is 23 hours; startOfDay of its last minute must
  // still be its own midnight, not the day before.
  const lastMinute = fromWallClock(2026, 3, 8, 23, 59);
  assert.equal(dayKey(startOfDay(lastMinute)), '2026-03-08');
  const fallBack = fromWallClock(2026, 11, 1, 23, 59);
  assert.equal(dayKey(startOfDay(fallBack)), '2026-11-01');
});

test('midnight boundary: the last instant of a day and the first of the next', () => {
  assert.equal(dayKey(fromWallClock(2026, 9, 20, 23, 59, 59)), '2026-09-20');
  assert.equal(dayKey(fromWallClock(2026, 9, 21, 0, 0, 0)), '2026-09-21');
});

test('a YAML-parsed Date is read as the wall clock the author typed', () => {
  // YAML turns an unquoted timestamp into a UTC Date; its UTC fields are the
  // wall clock that was written down.
  assert.equal(iso(parseLocal(new Date('2026-09-20T10:00:00Z'))), '2026-09-20T16:00:00.000Z');
});

test('ISO strings carrying an explicit offset are respected', () => {
  assert.equal(iso(parseLocal('2026-09-20T16:00:00Z')), '2026-09-20T16:00:00.000Z');
});

test('an unparseable date is rejected rather than silently wrong', () => {
  assert.throws(() => parseLocal('next Tuesday'), /Unparseable date/);
});

test('toIsoLocal carries the Denver offset for JSON-LD', () => {
  assert.equal(toIsoLocal(parseLocal('2026-09-20T10:00')), '2026-09-20T10:00:00-06:00');
  assert.equal(toIsoLocal(parseLocal('2026-12-05T10:00')), '2026-12-05T10:00:00-07:00');
});

test('all-day ranges read as "All day" rather than a bogus time', () => {
  const start = parseLocal('2026-09-20');
  assert.equal(formatTimeRange(start, undefined, true), 'All day');
});
