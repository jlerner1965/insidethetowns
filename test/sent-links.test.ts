/**
 * A link a reader already has keeps working (the owner, 7 November 2026:
 * Plausible counted 26 visits to Berthoud's "Page not found" page). The
 * Thursday emails (content/hub/issues/) are in readers' inboxes and archived
 * on the hub, and the weekly notes are on the guides; the 22 October issue
 * linked sixteen event pages on Berthoud, Lyons, Windsor and Erie that were
 * deleted once their dates passed, though the rule of 4 November 2026 says a
 * past event a sent email links stays (DECISIONS.md).
 *
 * So every link from those files to an event, a place or an article on a
 * live guide must find the file, or a redirect for its path on that guide's
 * host in vercel.json, the way the deleted Berthoud events already had one
 * (an unscoped rule counts too). A guide that is not live redirects every
 * path with host rules of its own (test/retired-towns.test.ts), so its links
 * are left to those.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { towns } from '../src/config/towns/registry.ts';
import { hubRoutes, placeTypeRoutes } from '../src/integrations/town-routes.ts';

const root = new URL('..', import.meta.url).pathname;

type Rule = { source: string; has?: Array<{ type: string; value: string }> };
const rules = (JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as { redirects: Rule[] }).redirects;

const live = towns.filter((t) => t.status === 'live');
const byDomain = new Map(live.map((t) => [t.domain, t.slug]));

/** A rule for exactly this page, on this host or on every host. */
function redirected(domain: string, collection: string, slug: string): boolean {
  const sources = new Set([`/${collection}/${slug}{/}?`, `/${collection}/${slug}/`, `/${collection}/${slug}`]);
  return rules.some(
    (r) => sources.has(r.source) && (!r.has || r.has.some((h) => h.type === 'host' && h.value.replace(/^www\./, '') === domain)),
  );
}

interface Link { file: string; town: string; domain: string; collection: string; slug: string }

/** The links in one file: absolute to a live guide, and relative ones to `own`, the guide the file belongs to. */
function linksIn(file: string, own?: { slug: string; domain: string }): Link[] {
  const text = readFileSync(join(root, file), 'utf8');
  const out: Link[] = [];
  for (const m of text.matchAll(/https?:\/\/(?:www\.)?([a-z0-9.-]+)\/(events|places|articles)\/([a-z0-9-]+)\/?(?=[)\s"'>#?]|$)/g)) {
    const town = byDomain.get(m[1]!);
    if (town) out.push({ file, town, domain: m[1]!, collection: m[2]!, slug: m[3]! });
  }
  if (own) {
    for (const m of text.matchAll(/\]\(\/(events|places|articles)\/([a-z0-9-]+)\/?(?:[#?][^)]*)?\)/g)) {
      out.push({ file, town: own.slug, domain: own.domain, collection: m[1]!, slug: m[2]! });
    }
  }
  return out;
}

const mdIn = (dir: string) => (existsSync(join(root, dir)) ? readdirSync(join(root, dir)).filter((n) => n.endsWith('.md')).map((n) => `${dir}/${n}`) : []);

const links: Link[] = [
  ...mdIn('content/hub/issues').flatMap((f) => linksIn(f)),
  ...live.flatMap((t) => mdIn(`content/${t.slug}/weekly`).flatMap((f) => linksIn(f, t))),
];

test('the sent emails and the weekly notes link something to check', () => {
  assert.ok(links.length > 100, `only ${links.length} links found: the patterns have stopped matching`);
});

test('every event, place and article a sent email or a weekly note links is still there, or redirected', () => {
  const broken = links.filter(
    (l) => !existsSync(join(root, 'content', l.town, l.collection, `${l.slug}.md`)) && !redirected(l.domain, l.collection, l.slug),
  );
  const lines = [...new Set(broken.map((l) => `https://${l.domain}/${l.collection}/${l.slug}/  (${l.file})`))];
  assert.equal(
    lines.length,
    0,
    `${lines.length} link(s) to a page that no longer exists. Keep the file (a past event is still served, noindexed) ` +
      `or add a host-scoped redirect to vercel.json:\n  ${lines.join('\n  ')}`,
  );
});

test('no redirect on a live guide hides a page that exists', () => {
  // Vercel applies a redirect before it looks for the file, so a rule left
  // behind for a deleted listing would hide the page if the slug came back,
  // and a rule for a kind of place the guide drops below the threshold for
  // (Berthoud's /trails/, 7 November 2026) would hide that page once the
  // guide lists enough of them again, as a rule for a hub the guide no longer
  // has (Elizabeth's /families/ and /living-here/, gone with its flagship
  // status) would hide the hub if it came back. Remove the rule when the
  // page returns.
  const hidden: string[] = [];
  for (const r of rules) {
    for (const h of r.has ?? []) {
      const town = h.type === 'host' ? byDomain.get(h.value.replace(/^www\./, '')) : undefined;
      if (!town) continue;
      const listing = r.source.match(/^\/(events|places|articles)\/([a-z0-9-]+)\{\/\}\?$/);
      if (listing && existsSync(join(root, 'content', town, listing[1]!, `${listing[2]}.md`))) hidden.push(`${h.value}${r.source}`);
      const section = r.source.match(/^(\/[a-z-]+)\{\/\}\?$/);
      const config = live.find((t) => t.slug === town)!;
      if (section && [...placeTypeRoutes(town), ...hubRoutes(config)].some(([pattern]) => pattern === section[1])) hidden.push(`${h.value}${r.source}`);
    }
  }
  assert.deepEqual(hidden, [], `redirects in vercel.json over pages the build makes:\n  ${hidden.join('\n  ')}`);
});
