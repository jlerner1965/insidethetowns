/**
 * A quiet guide: live and kept accurate, but out of the weekly routine while
 * the owner decides whether to keep it (Elizabeth, from 12 October 2026). The
 * weekly email is the promise it no longer makes, so it must be absent from
 * every list the email reads, and its decision date must come before its
 * listings start to expire.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { emailTowns, liveTowns } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { FRESHNESS } from '../src/config/freshness.ts';

const quiet = towns.filter((t) => t.quiet);

test('Elizabeth, Grand Lake, Leadville and Nederland are the quiet guides, and still live', () => {
  // The three mountain guides from 20 October 2026 (DECISIONS.md, "The other
  // mountain guides, 20 October"); Elizabeth from 12 October.
  assert.deepEqual(quiet.map((t) => t.slug).sort(), ['elizabeth', 'grand-lake', 'leadville', 'nederland']);
  for (const t of quiet) assert.equal(t.status, 'live', `${t.slug}: a quiet guide stays up`);
});

test('the weekly email covers every live guide but a quiet one or a visitor guide', () => {
  const email = emailTowns().map((t) => t.slug);
  for (const t of liveTowns()) assert.equal(email.includes(t.slug), !t.quiet && !t.visitorGuide, t.slug);
});

test("a quiet guide's decision comes before its first listing loses its hours", () => {
  for (const t of quiet) {
    assert.ok(t.quiet!.since < t.quiet!.decideBy, `${t.slug}: decideBy after since`);
    const dir = new URL(`../content/${t.slug}/places/`, import.meta.url);
    const checked = readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => readFileSync(new URL(f, dir), 'utf8').match(/^verified: "(\d{4}-\d{2}-\d{2})"$/m)?.[1])
      .filter((d): d is string => !!d)
      .sort();
    const first = new Date(`${checked[0]}T12:00:00Z`);
    first.setUTCDate(first.getUTCDate() + FRESHNESS.hoursDays[t.variant]);
    assert.ok(t.quiet!.decideBy < first.toISOString().slice(0, 10), `${t.slug}: decide by ${t.quiet!.decideBy}, but hours start to expire ${first.toISOString().slice(0, 10)}`);
  }
});
