/**
 * One definition of "how many events" (src/lib/event-totals.ts): listings
 * once each, series once each, and the fortnight's dates as dates.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { describeTotals, eventTotals } from '../src/lib/event-totals.ts';

const at = (s: string) => parseLocal(s);
const ev = (title: string, start: string, extra: Record<string, unknown> = {}) => ({
  slug: title.toLowerCase().replace(/\W+/g, '-'),
  data: { title, start: at(start), allDay: false, venue: 'V', category: 'other', status: 'scheduled', ...extra },
});

test('a weekly regular is one listing however many weeks it runs; a canceled or past one is none', () => {
  const now = at('2026-10-21T12:00');
  const entries = [
    ev('Trivia', '2026-09-22T18:00', { repeat: 'weekly', until: at('2026-12-29') }),
    ev('Release', '2026-10-23T15:00'),
    ev('Parade', '2026-12-05T17:00'),
    ev('Gone', '2026-10-03T10:00'),
    ev('Called off', '2026-10-27T18:30', { status: 'canceled', statusNote: 'x' }),
  ] as never[];
  const t = eventTotals(entries, now);
  assert.equal(t.series, 1);
  assert.equal(t.dated, 2);
  assert.equal(t.listings, 3);
  // Two trivia nights (27 Oct, 3 Nov) and the release fall inside the fortnight; the parade does not.
  assert.equal(t.datesNextTwoWeeks, 3);
  assert.equal(describeTotals(t), '3 listings: 2 dated events and 1 weekly regular');
});
