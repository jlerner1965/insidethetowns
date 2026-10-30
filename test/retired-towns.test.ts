/**
 * A guide retired with no guide to take it: Grand Lake, 30 October 2026
 * (DECISIONS.md, "Grand Lake retired"). Unlike a folded guide it has no
 * section anywhere, so its domain forwards to the hub. Four things have to
 * agree, each in a different file: the config says it is retired and not
 * where it went, no guide names it as a neighbour, its content has left its
 * folder, and vercel.json sends every path on its domain to the hub's home
 * page. A miss in any one is a 404 on a URL search engines still hold, or a
 * retired guide's stale listings somewhere a reader can reach them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { emailTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  redirects: Array<{ source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> }>;
};
const retired = towns.filter((t) => t.retired);
const rulesFor = (domain: string) => vercel.redirects.filter((r) => r.has?.some((h) => h.type === 'host' && h.value === domain));

test('Grand Lake is the retired guide', () => {
  assert.deepEqual(retired.map((t) => t.slug), ['grand-lake']);
});

test('a retired guide redirects, says why, goes nowhere else, and is out of every list', () => {
  for (const t of retired) {
    assert.equal(t.status, 'redirect', `${t.slug}: status redirect`);
    assert.equal(t.foldedInto, undefined, `${t.slug}: retired, not folded`);
    assert.equal(t.quiet, undefined, `${t.slug}: no longer quiet`);
    assert.equal(t.visitorGuide, undefined, `${t.slug}: not a visitor guide`);
    assert.match(t.retired!.since, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(t.retired!.reason.length > 20, `${t.slug}: a reason`);
    assert.ok(!LIVE_TOWNS.includes(t.slug), `${t.slug}: not deployed as a guide`);
    assert.ok(!emailTowns().some((e) => e.slug === t.slug), `${t.slug}: not in the email`);
    assert.deepEqual([...t.neighbors], [], `${t.slug}: names no neighbours`);
    for (const other of towns) assert.ok(!other.neighbors.includes(t.slug), `${other.slug} still lists ${t.slug}`);
  }
  for (const t of towns.filter((t) => t.status === 'redirect')) assert.ok(!!t.foldedInto !== !!t.retired, `${t.slug}: folded or retired, one of the two`);
  for (const t of towns.filter((t) => t.status !== 'redirect')) assert.equal(t.retired, undefined, `${t.slug}: retired without status redirect`);
});

test("a retired guide's content has left its folder", () => {
  for (const t of retired) {
    for (const dir of ['events', 'places', 'articles', 'pages', 'staging', 'weekly', 'corrections', 'programs', 'updates']) {
      const path = new URL(`../content/${t.slug}/${dir}/`, import.meta.url);
      assert.ok(!existsSync(path) || readdirSync(path).length === 0, `content/${t.slug}/${dir}/ should be empty`);
    }
    assert.ok(!existsSync(new URL(`../content/${t.slug}/sources.json`, import.meta.url)), `${t.slug}: sources gone`);
  }
});

test("every path on a retired guide's domain redirects to the hub's home page", () => {
  for (const t of retired) {
    const rules = rulesFor(t.domain);
    const home = `https://${hub.domain}/`;
    assert.ok(rules.length > 0, `${t.domain}: no rules`);
    assert.ok(rules.every((r) => r.permanent === true && r.destination === home), `${t.domain}: permanent, to ${home}`);
    assert.ok(rules.some((r) => r.source === '/'), `${t.domain}: the home page`);
    assert.equal(rules.at(-1)?.source, '/(.*)', `${t.domain}: the catch-all last`);
  }
});
