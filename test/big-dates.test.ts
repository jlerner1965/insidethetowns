import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bigDates } from '../src/lib/big-dates.ts';
import { parseLocal } from '../src/lib/dates.ts';

const now = parseLocal('2026-10-15T09:00');
const ev = (slug: string, start: string, category = 'festival', extra: Record<string, unknown> = {}) => ({
  slug,
  data: { title: slug, start: parseLocal(start), category, ...extra },
});

test('the big dates are the festivals beyond the fortnight the events page already shows, soonest first', () => {
  const picks = bigDates(
    [
      ev('block-party', '2026-10-17T11:00'), // inside the next two weeks: already on the page
      ev('fourth-of-july-2027', '2027-07-04T07:30'),
      ev('holiday-parade-2026', '2026-11-28T11:00'),
      ev('enchanted-evening-2026', '2026-11-27T18:00'),
      ev('trivia', '2026-11-30T18:30', 'nightlife'),
      ev('called-off', '2026-12-05T10:00', 'festival', { status: 'canceled' }),
      ev('last-year', '2025-11-29T11:00'),
    ],
    { now },
  ).map((e) => e.slug);
  assert.deepEqual(picks, ['enchanted-evening-2026', 'holiday-parade-2026', 'fourth-of-july-2027']);
});

test('a festival listed as several occurrences is one big date, and the list is capped', () => {
  const picks = bigDates(
    [
      ev('market', '2026-11-07T10:00'),
      ev('market', '2026-11-14T10:00'),
      ev('a', '2026-12-01T10:00'),
      ev('b', '2026-12-02T10:00'),
      ev('c', '2026-12-03T10:00'),
    ],
    { now, limit: 3 },
  ).map((e) => e.slug);
  assert.deepEqual(picks, ['market', 'a', 'b']);
});

test('nothing beyond the fortnight is an empty list, not an error', () => {
  assert.deepEqual(bigDates([ev('soon', '2026-10-20T10:00')], { now }), []);
  assert.deepEqual(bigDates([], { now }), []);
});
