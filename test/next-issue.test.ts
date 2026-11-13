/**
 * "Next issue today" stops being true at the send (the audit of 13
 * November 2026): src/lib/next-issue.ts, in Colorado time.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseLocal } from '../src/lib/dates.ts';
import { clockOf, nextIssueAt, nextIssueWords, sendInstant } from '../src/lib/next-issue.ts';

const thursday = sendInstant(parseLocal('2026-11-12'), '7 am');

test('the send time reads as a clock time', () => {
  assert.equal(clockOf('7 am'), '07:00');
  assert.equal(clockOf('7:30 pm'), '19:30');
  assert.equal(clockOf('12 pm'), '12:00');
  assert.equal(clockOf('early'), undefined);
});

test('before the send on Thursday it is today; after it, next Thursday', () => {
  assert.equal(nextIssueWords(thursday, parseLocal('2026-11-12T06:30'), '7 am'), 'today, Thursday, November 12 at 7 am');
  assert.equal(nextIssueWords(thursday, parseLocal('2026-11-12T07:00'), '7 am'), 'Thursday, November 19 at 7 am');
  assert.equal(nextIssueWords(thursday, parseLocal('2026-11-12T21:00'), '7 am'), 'Thursday, November 19 at 7 am');
  assert.equal(nextIssueWords(thursday, parseLocal('2026-11-10T12:00'), '7 am'), 'Thursday, November 12 at 7 am');
});

test('a build left for weeks still names the next send, at 7 am Colorado time across the change of clocks', () => {
  const march = sendInstant(parseLocal('2027-03-04'), '7 am');
  const next = nextIssueAt(march, parseLocal('2027-03-12T08:00'), '7 am');
  assert.equal(next.toISOString(), parseLocal('2027-03-18T07:00').toISOString());
});
