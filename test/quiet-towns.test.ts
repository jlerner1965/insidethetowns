/**
 * A quiet guide: live and kept accurate, but out of the weekly routine while
 * the owner decides whether to keep it (Elizabeth, from 12 October 2026). The
 * weekly email is the promise it no longer makes, so it must be absent from
 * every list the email reads, and its decision date must come before its
 * listings start to expire.
 *
 * Not the same thing as the guide the restructure of 12 November 2026 calls
 * quiet, Niwot (`lead: 'updates'`): that one lists no events at all and is a
 * standing arrangement with no decision date. It carries no `quiet` flag; it
 * is out of the email all the same, which the second test holds.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { emailTowns, listsEvents, liveTowns } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { FRESHNESS } from '../src/config/freshness.ts';

const quiet = towns.filter((t) => t.quiet);

test('Elizabeth is the quiet guide, and still live', () => {
  // Elizabeth from 12 October 2026; Grand Lake, Leadville and Nederland, then
  // Fort Collins, Longmont and Loveland, from 20 October (DECISIONS.md, "The
  // other mountain guides" and "The city guides"). Grand Lake was retired on
  // 30 October ("Grand Lake retired"); the other six were kept the same day.
  // Castle Rock went live quiet on 31 October ("Castle Rock live, quiet").
  // The restructure of 12 November 2026 folded Castle Rock, Fort Collins,
  // Leadville, Longmont, Loveland and Nederland into their pages on the hub
  // (test/hub-fold.test.ts): a folded guide is not quiet, it is gone, so
  // Elizabeth, whose page did not qualify, is the one left.
  assert.deepEqual(quiet.map((t) => t.slug).sort(), ['elizabeth']);
  for (const t of quiet) assert.equal(t.status, 'live', `${t.slug}: a quiet guide stays up`);
  for (const t of towns.filter((t) => t.hubPage)) assert.equal(t.quiet, undefined, `${t.slug}: folded into its hub page, no longer quiet`);
});

test('the weekly email covers every live guide but a quiet one, a visitor guide or one that lists no events', () => {
  const email = emailTowns().map((t) => t.slug);
  // A guide that lists no events (`lead: 'updates'`, Niwot, 12 November
  // 2026) has no week to send: the email is the week's events.
  for (const t of liveTowns()) assert.equal(email.includes(t.slug), !t.quiet && !t.visitorGuide && t.lead !== 'updates', t.slug);
  for (const t of liveTowns()) assert.equal(listsEvents(t), t.lead !== 'updates', `${t.slug}: lists events unless it leads with updates`);
  assert.deepEqual(liveTowns().filter((t) => !email.includes(t.slug)).map((t) => t.slug), ['elizabeth', 'niwot']);
  assert.deepEqual(email, ['berthoud', 'erie', 'frederick', 'johnstown', 'lyons', 'windsor']);
  // Nothing that is not live is covered.
  for (const slug of email) assert.equal(towns.find((t) => t.slug === slug)?.status, 'live', slug);
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
