/**
 * A guide retired with no guide to take it: Grand Lake, 30 October 2026
 * (DECISIONS.md, "Grand Lake retired"); Black Hawk, Carbon Valley and Fort
 * Lupton, 2 November 2026 (DECISIONS.md, "Black Hawk and Carbon Valley
 * close; Lafayette and Frederick open"), Frederick alone going on to a guide
 * of its own with new slugs; Evergreen, Manitou Springs and Clear Creek
 * (Idaho Springs, with Georgetown, its folded section), 3 November 2026
 * (DECISIONS.md, "Evergreen, Manitou Springs and Clear Creek retired").
 * Unlike a folded guide it has no
 * section anywhere, so its domain forwards to the hub. Four things have to
 * agree, each in a different file: the config says it is retired and not
 * where it went, no guide names it as a neighbour, its content has left its
 * folder, and vercel.json sends every path on its domain to the hub. A miss
 * in any one is a 404 on a URL search engines still hold, or a retired
 * guide's stale listings somewhere a reader can reach them.
 *
 * Where on the hub, since the restructure of 12 November 2026: a retired
 * guide whose town has a published page there (`hubPage` beside `retired`:
 * Grand Lake, Evergreen, Georgetown, Manitou Springs and Fort Lupton)
 * forwards to that page by the same rules as a guide folded that day
 * (src/lib/fold.ts, test/hub-fold.test.ts); one without (Black Hawk, Clear
 * Creek) still goes to the hub's home page, and Carbon Valley to Frederick.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { emailTowns, findTown, LIVE_TOWNS } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';
import { foldRules, OUTDOOR_ANCHOR, TRADITIONS_ANCHOR } from '../src/lib/fold.ts';
import { findHubTown } from '../src/config/hub-towns.ts';
import { publishedHubTownSlugs } from '../src/lib/tradition-files.ts';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  redirects: Array<{ source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> }>;
};
const retired = towns.filter((t) => t.retired);
const rulesFor = (domain: string) => vercel.redirects.filter((r) => r.has?.some((h) => h.type === 'host' && h.value === domain));

test('Grand Lake, Black Hawk, Carbon Valley, Fort Lupton, Evergreen, Manitou Springs, Clear Creek and Georgetown are the retired guides', () => {
  assert.deepEqual(retired.map((t) => t.slug).sort(), ['black-hawk', 'carbon-valley', 'evergreen', 'fort-lupton', 'georgetown', 'grand-lake', 'idaho-springs', 'manitou-springs']);
});

test('a retired multi-town guide lists no sections, and nothing is tagged with a retired section anywhere', () => {
  for (const t of retired) assert.equal(t.subTowns, undefined, `${t.slug}: no sections`);
  // Black Hawk left the Clear Creek guide on 2 November 2026 (Gilpin County
  // with it), and the guide itself retired on 3 November, Georgetown with it;
  // Windsor is the one multi-town guide left, and nothing in it is tagged
  // with a retired section.
  const retiredSlugs = new Set(retired.map((t) => t.slug));
  for (const t of towns.filter((t) => t.subTowns)) {
    for (const s of t.subTowns!) assert.ok(!retiredSlugs.has(s) || s === t.slug, `${t.slug}: lists the retired ${s}`);
    for (const coll of ['events', 'places', 'staging/events', 'staging/places']) {
      const dir = new URL(`../content/${t.slug}/${coll}/`, import.meta.url);
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        const body = readFileSync(new URL(f, dir), 'utf8');
        for (const s of retiredSlugs) assert.ok(!body.includes(`subTown: ${s}\n`), `${t.slug}/${coll}/${f} is still tagged ${s}`);
      }
    }
  }
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
  // Every redirect says where it went or why: folded into a guide, retired,
  // or folded into its town's page on the hub. A guide folded into another
  // guide is neither of the others; `hubPage` may accompany `retired` (a
  // guide retired earlier whose town has since got its page).
  for (const t of towns.filter((t) => t.status === 'redirect')) {
    assert.ok(!!t.foldedInto || !!t.retired || !!t.hubPage, `${t.slug}: folded into a guide, retired, or folded into its hub page`);
    if (t.foldedInto) assert.ok(!t.retired && !t.hubPage, `${t.slug}: folded into a guide, so neither retired nor on a hub page`);
  }
  assert.deepEqual(retired.filter((t) => t.hubPage).map((t) => t.slug).sort(), ['black-hawk', 'evergreen', 'fort-lupton', 'georgetown', 'grand-lake', 'idaho-springs', 'manitou-springs'], 'the retired guides whose domains go to their town page');
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

test("every path on a retired guide's domain redirects to its town's page on the hub, to the hub's home page where it has none, or into the guide that took its ground", () => {
  const published = new Set(publishedHubTownSlugs());
  for (const t of retired) {
    const rules = rulesFor(t.domain);
    assert.ok(rules.length > 0, `${t.domain}: no rules`);
    if (t.hubPage) {
      // The town has a published page on the hub: the same rules as a guide
      // folded on 12 November 2026, to the matching place on the page.
      assert.equal(t.retired!.successor, undefined, `${t.slug}: a hub page, so no successor guide`);
      assert.ok(findHubTown(t.hubPage.town), `${t.slug}: ${t.hubPage.town} is a hub town`);
      assert.ok(published.has(t.hubPage.town), `${t.slug}: the page /${t.hubPage.town}/ is published`);
      const page = `https://${hub.domain}/${t.hubPage.town}/`;
      assert.deepEqual(rules, foldRules(t.domain, hub.domain, t.hubPage.town), `${t.domain}: the rules src/lib/fold.ts writes`);
      assert.ok(rules.every((r) => r.permanent === true && r.destination.startsWith(page)), `${t.domain}: permanent, to ${page}`);
      const to = (source: string) => rules.find((r) => r.source === source)?.destination;
      assert.equal(to('/'), page, `${t.domain}: the home page`);
      assert.equal(to('/events{/}?'), `${page}#${TRADITIONS_ANCHOR}`, `${t.domain}: the events list goes to the page's traditions`);
      assert.equal(to('/events/(.*)'), `${page}#${TRADITIONS_ANCHOR}`, `${t.domain}: every event goes to the page's traditions`);
      assert.equal(to('/things-to-do{/}?'), `${page}#${OUTDOOR_ANCHOR}`, `${t.domain}: things to do goes to the page's outdoor dates`);
      assert.equal(rules[0]?.source, '/', `${t.domain}: the home page first`);
      assert.equal(rules.at(-1)?.source, '/(.*)', `${t.domain}: the catch-all last`);
      assert.equal(rules.at(-1)?.destination, page, `${t.domain}: the catch-all goes to the top of the page`);
      continue;
    }
    const successor = t.retired!.successor ? findTown(t.retired!.successor) : undefined;
    if (t.retired!.successor) assert.ok(successor && LIVE_TOWNS.includes(successor.slug), `${t.slug}: the successor ${t.retired!.successor} is a live guide`);
    const home = successor ? `https://${successor.domain}/` : `https://${hub.domain}/`;
    if (successor) {
      // Path kept where the page exists on the successor, the home page otherwise.
      assert.ok(rules.every((r) => r.permanent === true && r.destination.startsWith(home)), `${t.domain}: permanent, into ${successor.domain}`);
      for (const r of rules) {
        const m = r.destination.match(/^https:\/\/[^/]+\/(events|places|articles)\/([a-z0-9-]+)\/$/);
        if (m) assert.ok(existsSync(new URL(`../content/${successor.slug}/${m[1]}/${m[2]}.md`, import.meta.url)), `${t.domain}: ${r.source} goes to ${r.destination}, which has no file`);
      }
    } else {
      assert.ok(rules.every((r) => r.permanent === true && r.destination === home), `${t.domain}: permanent, to ${home}`);
    }
    assert.equal(rules.find((r) => r.source === '/')?.destination, home, `${t.domain}: the home page`);
    assert.equal(rules.at(-1)?.source, '/(.*)', `${t.domain}: the catch-all last`);
    assert.equal(rules.at(-1)?.destination, home, `${t.domain}: the catch-all goes home`);
  }
  // The three without a page, as before 12 November 2026.
  // Black Hawk's and Idaho Springs' pages qualified later on 12 November
  // 2026 (an organizer's own word of continuing counts), so Carbon Valley,
  // with Frederick as its successor, is the one retired guide without a page.
  assert.deepEqual(retired.filter((t) => !t.hubPage).map((t) => t.slug).sort(), ['carbon-valley']);
});

test('Carbon Valley forwards to Frederick, and Firestone with it', () => {
  const frederick = findTown('frederick')!;
  assert.equal(findTown('carbon-valley')!.retired!.successor, 'frederick');
  const firestone = rulesFor('insidefirestone.com');
  assert.ok(firestone.length > 0 && firestone.every((r) => r.permanent === true && r.destination === `https://${frederick.domain}/`), 'insidefirestone.com goes to Frederick’s home page');
});
