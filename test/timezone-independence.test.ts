/**
 * The build must produce identical output wherever it runs.
 *
 * Vercel builds in UTC, a laptop in Colorado builds in Mountain time, and a
 * contributor abroad builds in something else entirely. If any of the date
 * logic reaches for the system zone, the three disagree about which events are
 * on — so this runs the same questions in four zones and insists on one answer.
 *
 * Kiritimati (UTC+14) and Niue (UTC-11) are the extremes: whenever it is in
 * Denver, those two are on different calendar days from each other.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZONES = ['UTC', 'America/Denver', 'Pacific/Kiritimati', 'Pacific/Niue'];

/** Answers the date layer gives, as a string, for one system timezone. */
const PROBE = `
import { parseLocal, dayKey, toIsoLocal, startOfDay, addDays } from './src/lib/dates.ts';
import { isPast, weekendWindow, weekendSections } from './src/lib/events.ts';

const at = (s) => parseLocal(s);
const ev = (title, start, end, allDay = false) => ({
  slug: title, data: { title, start: at(start), end: end ? at(end) : undefined, allDay },
});

const list = [
  ev('Fair', '2026-09-20', undefined, true),
  ev('Run', '2026-09-10', '2026-11-15', true),
  ev('Market', '2026-09-25T16:00', '2026-09-25T20:00'),
  ev('Later', '2026-09-29T18:00'),
];
const now = at('2026-09-24T12:00');
const s = weekendSections(list, { now });
const w = weekendWindow(now);

console.log(JSON.stringify({
  parsed: at('2026-09-20T10:00').toISOString(),
  iso: toIsoLocal(at('2026-12-05T10:00')),
  day: dayKey(at('2026-09-20T23:30')),
  midnight: startOfDay(at('2026-09-20T23:30')).toISOString(),
  dstStep: addDays(at('2026-10-31'), 2).toISOString(),
  pastFairOnThe21st: isPast(ev('Fair', '2026-09-20', undefined, true), at('2026-09-21T09:00')),
  weekendStart: w.start.toISOString(),
  weekendEnd: w.end.toISOString(),
  now: s.now.map((e) => e.data.title),
  weekend: s.weekend.map((e) => e.data.title),
  next: s.next.map((e) => e.data.title),
}));
`;

test('every date answer is identical in every system timezone', () => {
  const answers = ZONES.map((TZ) => ({
    TZ,
    out: execFileSync(process.execPath, ['--input-type=module', '-e', PROBE], {
      cwd: root,
      env: { ...process.env, TZ },
      encoding: 'utf8',
    }).trim(),
  }));

  const [first, ...rest] = answers;
  for (const answer of rest) {
    assert.equal(
      answer.out,
      first!.out,
      `TZ=${answer.TZ} disagrees with TZ=${first!.TZ}.\n  ${first!.TZ}: ${first!.out}\n  ${answer.TZ}: ${answer.out}`,
    );
  }

  // And the shared answer is the right one, not merely a consistent wrong one.
  const parsed = JSON.parse(first!.out);
  assert.equal(parsed.parsed, '2026-09-20T16:00:00.000Z', 'Denver wall clock, not the server’s');
  assert.equal(parsed.day, '2026-09-20', 'late evening in Denver is still that day');
  assert.equal(parsed.pastFairOnThe21st, true);
  assert.deepEqual(parsed.now, ['Run']);
  assert.deepEqual(parsed.weekend, ['Market']);
  assert.deepEqual(parsed.next, ['Later']);
});
