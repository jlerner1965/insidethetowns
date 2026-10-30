/**
 * A guide folded into another: Severance into Windsor and Fort Lupton into
 * Carbon Valley, 12 October 2026; Georgetown and Black Hawk into the Idaho
 * Springs guide, Inside Clear Creek, 20 October 2026. Four things have to agree for the move to
 * hold, and each lives in a different file: the config says where the town
 * went, the receiving guide lists it as a section, its content has left its
 * old folder, and vercel.json sends every path on the old domain to the new
 * guide. A miss in any one is a 404 on a URL search engines still hold.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { findTown, LIVE_TOWNS } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
  redirects: Array<{ source: string; destination: string; permanent?: boolean; has?: Array<{ type: string; value?: string }> }>;
};
// A retired guide redirects too, but to the hub, with no guide to take it: test/retired-towns.test.ts.
const folded = towns.filter((t) => t.status === 'redirect' && !t.retired);
const rulesFor = (domain: string) => vercel.redirects.filter((r) => r.has?.some((h) => h.type === 'host' && h.value === domain));

test('Severance, Fort Lupton, Georgetown and Black Hawk are the folded guides', () => {
  assert.deepEqual(folded.map((t) => t.slug).sort(), ['black-hawk', 'fort-lupton', 'georgetown', 'severance']);
});

test('a folded guide names a live guide that lists it as a section, and nobody lists it as a neighbour', () => {
  for (const t of folded) {
    assert.ok(t.foldedInto, `${t.slug}: foldedInto`);
    const home = findTown(t.foldedInto.town);
    assert.ok(home && LIVE_TOWNS.includes(home.slug), `${t.slug}: ${t.foldedInto.town} is live`);
    assert.ok(home.subTowns?.includes(t.slug), `${t.slug}: a section of ${home.slug}`);
    assert.equal(t.foldedInto.path, `/${t.slug}/`, `${t.slug}: the section page`);
    assert.deepEqual([...t.neighbors], [], `${t.slug}: names no neighbours`);
    for (const other of towns) assert.ok(!other.neighbors.includes(t.slug), `${other.slug} still lists ${t.slug}`);
  }
  for (const t of towns.filter((t) => t.status !== 'redirect')) assert.equal(t.foldedInto, undefined, `${t.slug}: foldedInto without status redirect`);
});

test("a folded guide's content has moved out of its folder", () => {
  for (const t of folded) {
    for (const dir of ['events', 'places', 'articles', 'pages', 'staging', 'weekly', 'corrections']) {
      const path = new URL(`../content/${t.slug}/${dir}/`, import.meta.url);
      assert.ok(!existsSync(path) || readdirSync(path).length === 0, `content/${t.slug}/${dir}/ should be empty`);
    }
    assert.ok(!existsSync(new URL(`../content/${t.slug}/sources.json`, import.meta.url)), `${t.slug}: sources moved`);
  }
});

test("every path on a folded guide's domain redirects into the guide that took it", () => {
  for (const t of folded) {
    const home = findTown(t.foldedInto!.town)!;
    const base = `https://${home.domain}`;
    const rules = rulesFor(t.domain);
    const to = (source: string) => rules.find((r) => r.source === source)?.destination;
    assert.ok(rules.every((r) => r.permanent === true && r.destination.startsWith(`${base}/`)), `${t.domain}: permanent, to ${home.domain}`);
    assert.equal(to('/'), `${base}${t.foldedInto!.path}`);
    assert.equal(to('/events/:slug{/}?'), `${base}/events/:slug/`, 'events keep their slug');
    assert.equal(to('/places/:slug{/}?'), `${base}/places/:slug/`, 'places keep their slug');
    assert.equal(to('/articles/:slug{/}?'), `${base}/articles/:slug/`, 'articles keep their slug');
    assert.equal(to('/moving-here{/}?'), `${base}/articles/moving-to-${t.slug}/`);
    assert.equal(to('/events{/}?'), `${base}/events/?where=${t.slug}`);
    // The calendar feed before the event pattern, or ":slug" would take it.
    const order = rules.map((r) => r.source);
    assert.ok(order.indexOf('/events/calendar.ics') < order.indexOf('/events/:slug{/}?'), `${t.domain}: calendar.ics first`);
    assert.equal(order.at(-1), '/(.*)', `${t.domain}: the catch-all last`);
    assert.equal(to('/(.*)'), `${base}${t.foldedInto!.path}`);
  }
});

test('the pages those rules point at exist in the receiving guide', () => {
  for (const t of folded) {
    const home = t.foldedInto!.town;
    assert.ok(existsSync(new URL(`../content/${home}/articles/moving-to-${t.slug}.md`, import.meta.url)), `${home}: moving-to-${t.slug}`);
    for (const coll of ['events', 'places']) {
      const dir = new URL(`../content/${home}/${coll}/`, import.meta.url);
      const tagged = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), 'utf8').includes(`\nsubTown: ${t.slug}\n`));
      assert.ok(tagged.length > 0, `${home}/${coll}: nothing tagged ${t.slug}`);
    }
  }
});
