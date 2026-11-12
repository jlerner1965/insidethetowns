/**
 * manager/towns.json is what the manager agent reads for the list of towns,
 * their domains and whether each is live, and it says of itself "keep this
 * current; if the two disagree, the repo config wins". A hand-kept copy of
 * the configs drifts the day a town is flipped live or folded, so this holds
 * the two together: every live config is listed live with its domain, a
 * folded town's domain is an alternate of the guide that took it, a guide
 * folded into its page on the hub (12 November 2026) is listed not live with
 * where it went, and a guide out of the weekly email says so in its notes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';

interface ManagerTown {
  slug: string;
  name: string;
  domain: string;
  live: boolean;
  alternate_domains?: string[];
  notes?: string;
}
const manager = JSON.parse(readFileSync(new URL('../manager/towns.json', import.meta.url), 'utf8')) as {
  network: { domain: string; repo: string; newsletter_day: string };
  towns: ManagerTown[];
};
const listed = new Map(manager.towns.map((t) => [t.slug, t]));

test('the network entry names the hub and the send day', () => {
  assert.equal(manager.network.domain, hub.domain);
  assert.equal(manager.network.newsletter_day, hub.newsletter?.sendDay ?? 'Thursday');
  assert.match(manager.network.repo, /github\.com\/jlerner1965\/insidethetowns$/);
});

test('every live guide is listed live, by its own name and domain', () => {
  for (const t of towns.filter((t) => t.status === 'live')) {
    const m = listed.get(t.slug);
    assert.ok(m, `${t.slug} is live in src/config/towns and missing from manager/towns.json`);
    assert.equal(m.live, true, `${t.slug} is live in the config and not in manager/towns.json`);
    assert.equal(m.domain, t.domain, `${t.slug}: domain`);
    assert.equal(m.name, t.name, `${t.slug}: name`);
  }
});

test('nothing is listed live that the configs do not deploy', () => {
  const live = new Set(towns.filter((t) => t.status === 'live').map((t) => t.slug));
  for (const m of manager.towns) {
    if (m.live) assert.ok(live.has(m.slug), `${m.slug} is live in manager/towns.json but its config is not status: 'live'`);
  }
});

test("a folded town's domain is an alternate of the guide that took it, and is not its own entry", () => {
  // A guide folded into its town's page on the hub (`hubPage`) has no guide to take it: the next test but one.
  for (const t of towns.filter((t) => t.status === 'redirect' && !t.retired && !t.hubPage)) {
    assert.ok(t.foldedInto, `${t.slug} redirects but says not where`);
    const host = listed.get(t.foldedInto.town);
    assert.ok(host, `${t.foldedInto.town} is missing from manager/towns.json`);
    assert.ok(host.alternate_domains?.includes(t.domain), `${t.domain} should be an alternate domain of ${t.foldedInto.town}`);
    assert.equal(listed.get(t.slug), undefined, `${t.slug} was folded into ${t.foldedInto.town} and should not have an entry of its own`);
  }
});

test('a retired guide keeps its own entry, not live, and its notes say it was retired', () => {
  for (const t of towns.filter((t) => t.retired)) {
    const m = listed.get(t.slug);
    assert.ok(m, `${t.slug} is retired and missing from manager/towns.json`);
    assert.equal(m.live, false, `${t.slug} is retired and listed live`);
    assert.equal(m.domain, t.domain, `${t.slug}: domain`);
    assert.match(m.notes ?? '', new RegExp(`retired ${t.retired.since}`), `${t.slug}: notes should say "retired ${t.retired.since}"`);
  }
});

test('a guide folded into its page on the hub keeps its own entry, not live, and its notes say where it went and when', () => {
  // The nine of 12 November 2026, and the five retired earlier whose domains
  // now forward to their town's page, not the hub's home page.
  const withPage = towns.filter((t) => t.hubPage);
  assert.equal(withPage.filter((t) => !t.retired).length, 9);
  for (const t of withPage) {
    const m = listed.get(t.slug);
    assert.ok(m, `${t.slug} was folded into its hub page and is missing from manager/towns.json`);
    assert.equal(m.live, false, `${t.slug} was folded into its hub page and is listed live`);
    assert.equal(m.domain, t.domain, `${t.slug}: domain`);
    assert.equal(m.name, t.name, `${t.slug}: name`);
    assert.ok((m.notes ?? '').includes(`${hub.domain}/${t.hubPage!.town}/`), `${t.slug}: notes should name the page, ${hub.domain}/${t.hubPage!.town}/`);
    if (!t.retired) assert.ok((m.notes ?? '').includes(`folded into its page on ${hub.domain} ${t.hubPage!.since}`), `${t.slug}: notes should say "folded into its page on ${hub.domain} ${t.hubPage!.since}"`);
    assert.doesNotMatch(m.notes ?? '', /\b(quiet|visitor guide) since\b/, `${t.slug}: no longer a quiet or visitor guide`);
  }
});

test('a guide out of the weekly email says so in its notes, and nothing else claims to be', () => {
  for (const t of towns.filter((t) => t.status === 'live')) {
    const notes = listed.get(t.slug)?.notes ?? '';
    if (t.quiet) assert.match(notes, /quiet since \d{4}-\d{2}-\d{2}/, `${t.slug} is quiet; its notes should say so`);
    else assert.doesNotMatch(notes, /\bquiet since\b/, `${t.slug} is not quiet`);
    if (t.visitorGuide) assert.match(notes, /visitor guide since \d{4}-\d{2}-\d{2}/, `${t.slug} is a visitor guide; its notes should say so`);
    else assert.doesNotMatch(notes, /\bvisitor guide since\b/, `${t.slug} is not a visitor guide`);
    // The owner publishes weekly notes on every live guide; only the email is dropped. A note that
    // tells the audit agent not to expect This Week on these guides would have it pass a missing page.
    // The one exception since 12 November 2026 is a guide that lists no events (`lead: 'updates'`, Niwot):
    // it builds no events, This week or This weekend page and is out of the email, and its notes say both.
    if (t.quiet || t.visitorGuide) assert.doesNotMatch(notes, /no .*This Week expected/i, `${t.slug}: This Week runs on every live guide that lists events`);
    if (t.lead === 'updates') {
      assert.match(notes, /lists no events/, `${t.slug} lists no events; its notes should say so`);
      assert.match(notes, /out of the weekly email/, `${t.slug} is out of the weekly email; its notes should say so`);
    } else {
      assert.doesNotMatch(notes, /lists no events/, `${t.slug} lists events`);
    }
  }
});
