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
