/**
 * Local changes (src/lib/updates.ts): what is current and what is archive,
 * decided from three dates kept apart. An old closure the guide found this
 * month is an old closure.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { archivedUpdates, currentUpdates, expiresOn, isCurrent, isLateNotice, timing } from '../src/lib/updates.ts';
import type { UpdateData } from '../src/content/schemas.ts';

const at = (s: string) => parseLocal(s);

function update(title: string, over: Partial<UpdateData> & Pick<UpdateData, 'effective'>) {
  const data: UpdateData = {
    title,
    kind: 'notice',
    stage: 'scheduled',
    summary: 'x',
    affects: 'y',
    published: over.effective,
    featured: false,
    ...over,
  };
  return { slug: title.toLowerCase().replace(/\W+/g, '-'), data };
}

test('a change shows through the end of its run, else sixty days, unless it says when to stop', () => {
  const closure = update('Median closure', { effective: at('2026-10-18'), effectiveEnd: at('2026-10-25') });
  assert.equal(isCurrent(closure, at('2026-10-25T23:00')), true, 'the last day counts');
  assert.equal(isCurrent(closure, at('2026-10-26T00:10')), false);
  const purchase = update('Land bought', { effective: at('2026-07-31'), stage: 'complete' });
  assert.equal(expiresOn(purchase).getTime(), at('2026-09-29').getTime());
  assert.equal(isCurrent(purchase, at('2026-10-21')), false);
  const vote = update('Vote', { effective: at('2026-11-03'), expires: at('2026-11-03') });
  assert.equal(isCurrent(vote, at('2026-11-03T20:00')), true, 'election night it is still current');
  assert.equal(isCurrent(vote, at('2026-11-04')), false, 'the morning after it is archive');
});

test('current changes lead with the featured one, then newest published first; the archive is by effect, newest first', () => {
  const now = at('2026-10-21');
  const a = update('A', { effective: at('2026-10-10'), published: at('2026-10-20') });
  const b = update('B', { effective: at('2026-11-03'), published: at('2026-10-15'), featured: true });
  const c = update('C', { effective: at('2026-10-01'), published: at('2026-10-21') });
  const old = update('Old', { effective: at('2024-12-24'), published: at('2026-10-07'), expires: at('2026-10-20') });
  const older = update('Older', { effective: at('2024-01-01'), published: at('2026-10-07'), expires: at('2026-10-20') });
  assert.deepEqual(currentUpdates([a, b, c, old, older], now).map((u) => u.data.title), ['B', 'C', 'A']);
  assert.deepEqual(archivedUpdates([a, b, c, old, older], now).map((u) => u.data.title), ['Old', 'Older']);
});

test('timing reads the dates, not the stage: ahead, now, past', () => {
  const run = update('Run', { effective: at('2026-10-18'), effectiveEnd: at('2026-10-25'), stage: 'approved' });
  assert.equal(timing(run, at('2026-10-17')), 'ahead');
  assert.equal(timing(run, at('2026-10-21')), 'now');
  assert.equal(timing(run, at('2026-10-26')), 'past');
  assert.equal(timing(update('Day', { effective: at('2026-11-03') }), at('2026-11-03T12:00')), 'now');
});

test('a completed change published more than a month after it happened is a late notice', () => {
  assert.equal(isLateNotice(update('Closed', { effective: at('2024-12-24'), published: at('2026-10-07'), stage: 'complete' })), true);
  assert.equal(isLateNotice(update('Moved', { effective: at('2026-09-01'), published: at('2026-10-21'), stage: 'complete' })), true);
  assert.equal(isLateNotice(update('Opened', { effective: at('2026-10-15'), published: at('2026-10-21'), stage: 'complete' })), false);
  assert.equal(isLateNotice(update('Vote', { effective: at('2024-01-01'), published: at('2026-10-21'), stage: 'scheduled' })), false, 'only a finished change can be noticed late');
});

test('a change is new for a week from publication, in Denver days', async () => {
  const { isNew } = await import('../src/lib/updates.ts');
  const u = (published: string) => ({ data: { published: parseLocal(published), effective: parseLocal(published) } }) as never;
  const now = parseLocal('2026-11-12T20:00');
  assert.equal(isNew(u('2026-11-12'), now), true);
  assert.equal(isNew(u('2026-11-06'), now), true);
  assert.equal(isNew(u('2026-11-05'), now), false);
});

test('a change is timely when featured, starting within the fortnight, or under way and recently published', async () => {
  const { isTimely } = await import('../src/lib/updates.ts');
  const now = parseLocal('2026-11-12T09:00');
  const u = (d: Record<string, unknown>) => ({ data: { featured: false, ...d } }) as never;
  assert.equal(isTimely(u({ published: parseLocal('2026-10-01'), effective: parseLocal('2026-11-20') }), now), true, 'starts in eight days');
  assert.equal(isTimely(u({ published: parseLocal('2026-10-01'), effective: parseLocal('2026-12-20') }), now), false, 'starts in five weeks');
  assert.equal(isTimely(u({ published: parseLocal('2026-11-05'), effective: parseLocal('2026-11-01'), effectiveEnd: parseLocal('2026-12-01') }), now), true, 'under way, published last week');
  assert.equal(isTimely(u({ published: parseLocal('2026-09-20'), effective: parseLocal('2026-09-20'), effectiveEnd: parseLocal('2026-12-01') }), now), false, 'under way for weeks');
  assert.equal(isTimely(u({ published: parseLocal('2026-09-20'), effective: parseLocal('2026-09-20'), effectiveEnd: parseLocal('2026-12-01'), featured: true }), now), true, 'featured');
});
