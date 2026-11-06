/**
 * The rec center's day (src/lib/rec-center.ts): the weekday's hours and
 * swims, a Saturday's, Thanksgiving's closure, a day with no hours
 * settled, and the line each becomes. The dates are passed in, as the
 * browser passes its own, so the tests do not depend on the day they run.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { exceptionLabel, rangeLabel, recCenterFor, recCenterToday, todayLine, upcomingExceptions, weekRows, type RecCenterData } from '../src/lib/rec-center.ts';
import { parseLocal } from '../src/lib/dates.ts';

const data = JSON.parse(readFileSync(new URL('../data/berthoud/rec-center.json', import.meta.url), 'utf8')) as RecCenterData;

test('a weekday: the facility, the open swim and the lap swim as the Town prints them', () => {
  const friday = recCenterToday(data, parseLocal('2026-11-06T09:00'));
  assert.deepEqual(friday, { kind: 'open', facility: '5 am–9 pm', openSwim: '4–8 pm', lapSwim: '5 am–4 pm' });
  assert.equal(todayLine(friday, data), 'Rec center 5 am–9 pm · Open swim 4–8 pm · Lap swim 5 am–4 pm');
  // Tuesday: no open swim is the Town's word, and the lap swim has two runs.
  const tuesday = recCenterToday(data, parseLocal('2026-11-10T20:00'));
  assert.equal(todayLine(tuesday, data), 'Rec center 5 am–9 pm · No open swim · Lap swim 5 am–4:15 pm & 7–8 pm');
});

test('a weekend day, and the first Sunday’s early pool close', () => {
  const saturday = recCenterToday(data, parseLocal('2026-11-14T12:00'));
  assert.equal(todayLine(saturday, data), 'Rec center 7 am–8 pm · Open swim 11 am–7 pm · Lap swim 7–11 am');
  const sunday = recCenterToday(data, parseLocal('2026-11-15T12:00'));
  assert.equal(todayLine(sunday, data), 'Rec center 11 am–8 pm · Open swim 11 am–7 pm');
  const first = recCenterToday(data, parseLocal('2026-12-06T12:00'));
  assert.equal(todayLine(first, data), 'Rec center 11 am–8 pm · Open swim 11 am–5 pm · pool closes 5 pm for lifeguard training');
});

test('Thanksgiving Day is closed; the day after keeps only the hours the Town posted for it', () => {
  const thanksgiving = recCenterToday(data, parseLocal('2026-11-26T12:00'));
  assert.deepEqual(thanksgiving, { kind: 'closed', note: 'Thanksgiving Day' });
  assert.equal(todayLine(thanksgiving, data), 'Rec center closed today · Thanksgiving Day');
  // A noon opening makes the weekday's 5 am lap swim impossible, so it is not claimed.
  const friday = recCenterToday(data, parseLocal('2026-11-27T12:00'));
  assert.equal(todayLine(friday, data), 'Rec center noon–6 pm · Open swim noon–5 pm · Day after Thanksgiving; no child watch');
  // A fall-break day keeps the weekday's facility hours and takes the posted swim.
  assert.equal(todayLine(recCenterToday(data, parseLocal('2026-11-24T12:00')), data), 'Rec center 5 am–9 pm · Open swim noon–8 pm · Lap swim 5 am–4:15 pm & 7–8 pm · Fall break');
});

test('past the season, or on a day the Town has not settled, the reader is sent to check', () => {
  const summer = recCenterToday(data, parseLocal('2027-06-01T12:00'));
  assert.equal(summer.kind, 'check');
  assert.equal(todayLine(summer, data), 'Check today’s hours');
  const bare: RecCenterData = { ...data, exceptions: [{ date: '2026-11-06', note: 'Staff day' }] };
  assert.deepEqual(recCenterToday(bare, parseLocal('2026-11-06T12:00')), { kind: 'check', note: 'Staff day' });
  assert.equal(recCenterToday(data, parseLocal('2026-08-19T12:00')).kind, 'check', 'the day before the season');
});

test('the table, the exceptions and the file', () => {
  assert.equal(rangeLabel(['05:00', '21:00']), '5 am–9 pm');
  assert.equal(rangeLabel(['16:00', '20:00']), '4–8 pm');
  assert.equal(rangeLabel(['12:00', '17:00']), 'noon–5 pm', 'as clockLabel says it everywhere else');
  const rows = weekRows(data);
  assert.equal(rows[0]!.day, 'Monday');
  assert.equal(rows[1]!.openSwim, 'None');
  assert.equal(rows[6]!.lapSwim, 'None');
  const coming = upcomingExceptions(data, parseLocal('2026-11-25T12:00'));
  assert.equal(coming[0]!.date, '2026-11-25');
  assert.equal(exceptionLabel(coming.find((e) => e.date === '2026-11-26')!), 'Closed');
  assert.equal(exceptionLabel(coming.find((e) => e.date === '2026-11-27')!), 'Open noon–6 pm, open swim noon–5 pm');
  assert.equal(exceptionLabel({ date: 'x', note: 'x', openSwim: [], lapSwim: [] }), 'No open swim, no lap swim');
  // The loader picks the town's file from a glob and nothing for a town without one.
  const files = { '/data/berthoud/rec-center.json': data };
  assert.equal(recCenterFor(files, 'berthoud'), data);
  assert.equal(recCenterFor(files, 'erie'), undefined);
  // Every hour in the file is on a Town page: the file names its sources and the day it was read.
  assert.match(data.checked, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(data.sources.length >= 1);
  assert.ok(data.prices && data.prices.dayPass.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(data.prices.checked));
});
