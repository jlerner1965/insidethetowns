/**
 * The newest sent issue for a town (src/lib/issues.ts), which the signup
 * links as "Read last Thursday's issue".
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { latestIssueFor } from '../src/lib/issues.ts';

function archive(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'issues-'));
  mkdirSync(join(root, 'hub', 'issues'), { recursive: true });
  for (const [name, body] of Object.entries(files)) writeFileSync(join(root, 'hub', 'issues', name), body);
  return root;
}
const issue = (date: string, towns: string) => `---\ntitle: "An issue"\ndate: "${date}"\nexcerpt: "x"\ntowns: [${towns}]\n---\n\nBody\n`;

test('the newest issue that names the town, by its send day', () => {
  const root = archive({
    '2026-10-29-berthoud.md': issue('2026-10-29', 'berthoud'),
    '2026-11-05-berthoud.md': issue('2026-11-05', 'berthoud'),
    '2026-11-05-lyons.md': issue('2026-11-05', 'lyons'),
  });
  assert.deepEqual(latestIssueFor('berthoud', '2026-11-10', root), { slug: '2026-11-05-berthoud', date: '2026-11-05' });
});

test('a shared edition is every one of its towns’ issue; the whole-network issue is nobody’s', () => {
  const root = archive({
    '2026-11-05-windsor-timnath.md': issue('2026-11-05', 'windsor, timnath'),
    '2026-11-05-all-towns.md': issue('2026-11-05', ''),
  });
  assert.equal(latestIssueFor('timnath', '2026-11-10', root)?.slug, '2026-11-05-windsor-timnath');
  assert.equal(latestIssueFor('windsor', '2026-11-10', root)?.slug, '2026-11-05-windsor-timnath');
  assert.equal(latestIssueFor('erie', '2026-11-10', root), undefined);
});

test('a draft, a file dated ahead and a town with no issue give nothing to link', () => {
  const root = archive({
    '_2026-11-12-berthoud.md': issue('2026-11-12', 'berthoud'),
    '2026-11-19-berthoud.md': issue('2026-11-19', 'berthoud'),
  });
  assert.equal(latestIssueFor('berthoud', '2026-11-10', root), undefined);
  assert.equal(latestIssueFor('berthoud', '2026-11-10', join(root, 'nowhere')), undefined);
});

test('every live archive file is read: each email-covered guide has an issue to show', () => {
  // The real archive: Berthoud has been in the email since October.
  const found = latestIssueFor('berthoud', '2099-01-01');
  assert.ok(found && /^\d{4}-\d{2}-\d{2}-/.test(found.slug));
});
