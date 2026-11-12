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
 * (an unscoped rule counts too).
 *
 * Two kinds of link have no file to find and are redirected by rules for
 * the whole host instead, and this checks that vercel.json really has a
 * rule on that host whose pattern takes the link's path:
 * - a link into a guide that is not live: folded into its page on the hub
 *   (`hubPage`, nine guides on 12 November 2026, src/lib/fold.ts), folded
 *   into another guide, or retired. The issues of October and November link
 *   Timnath, Golden and the rest, and those are in inboxes still.
 * - a link to an event on a live guide that lists no events (`lead:
 *   'updates'`, Niwot, 12 November 2026): the event pages are not built,
 *   whether or not the file is still in content/niwot/events/, and
 *   vercel.json sends /events/(.*) on its host to its home page.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { towns } from '../src/config/towns/registry.ts';
import { listsEvents } from '../src/config/index.ts';
import { hubRoutes, placeTypeRoutes } from '../src/integrations/town-routes.ts';
import { formerSlugs } from '../src/lib/former-slugs.ts';

const root = new URL('..', import.meta.url).pathname;

type Rule = { source: string; destination?: string; permanent?: boolean; has?: Array<{ type: string; value: string }> };
const rules = (JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8')) as { redirects: Rule[] }).redirects;

const live = towns.filter((t) => t.status === 'live');
// Every guide's domain, live or not: a link into a folded or retired guide is checked too.
const byDomain = new Map(towns.map((t) => [t.domain, t.slug]));
const liveSlugs = new Set(live.map((t) => t.slug));
const config = (slug: string) => towns.find((t) => t.slug === slug)!;

/** The slugs each live guide's listings declare as former, built as redirect pages (src/lib/former-slugs.ts). */
const former = new Map(live.map((t) => [t.slug, new Set(formerSlugs(t.slug).map((f) => `${f.kind}/${f.from}`))]));

/**
 * A rule for exactly this page, on this host or on every host, or a former
 * slug a live listing declares: an annual event's permanent page names the
 * dated slug it was filed under (8 November 2026), and the old URL is built
 * as a redirect to it.
 */
function redirected(domain: string, town: string, collection: string, slug: string): boolean {
  if (former.get(town)?.has(`${collection}/${slug}`)) return true;
  const sources = new Set([`/${collection}/${slug}{/}?`, `/${collection}/${slug}/`, `/${collection}/${slug}`]);
  return rules.some(
    (r) => sources.has(r.source) && (!r.has || r.has.some((h) => h.type === 'host' && h.value.replace(/^www\./, '') === domain)),
  );
}

/** A vercel.json source pattern as a regular expression: "{/}?", ":name" and "(.*)" are the three forms the file uses. */
function sourcePattern(source: string): RegExp {
  const body = source.replace(/\{\/\}\?|\(\.\*\)|:[a-z]+|[.+^$|[\]\\]/g, (m) => (m === '{/}?' ? '/?' : m === '(.*)' ? '.*' : m.startsWith(':') ? '[^/]+' : `\\${m}`));
  return new RegExp(`^${body}$`);
}

/** The first permanent rule scoped to this host that takes the path, as Vercel reads them: in order. */
function hostRule(domain: string, path: string): Rule | undefined {
  return rules.find(
    (r) => r.has?.some((h) => h.type === 'host' && h.value.replace(/^www\./, '') === domain) && sourcePattern(r.source).test(path),
  );
}

/**
 * Whether a link is answered: by its file, where the guide builds the page;
 * by a rule for exactly that page or a former slug; or, where the guide is
 * not live or builds no event pages, by a permanent rule on its host.
 */
function answered(l: Link): boolean {
  const town = config(l.town);
  const builds = liveSlugs.has(l.town) && (l.collection !== 'events' || listsEvents(town));
  if (builds) return existsSync(join(root, 'content', l.town, l.collection, `${l.slug}.md`)) || redirected(l.domain, l.town, l.collection, l.slug);
  const rule = hostRule(l.domain, `/${l.collection}/${l.slug}/`);
  if (!rule || rule.permanent !== true || !rule.destination) return false;
  // A guide folded into its hub page lands on that page, an event on its Traditions section.
  if (town.hubPage) return rule.destination.startsWith(`https://insidethetowns.com/${town.hubPage.town}/`);
  return true;
}

interface Link { file: string; town: string; domain: string; collection: string; slug: string }

/** The links in one file: absolute to any guide, live or not, and relative ones to `own`, the guide the file belongs to. */
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
  const broken = links.filter((l) => !answered(l));
  const lines = [...new Set(broken.map((l) => `https://${l.domain}/${l.collection}/${l.slug}/  (${l.file})`))];
  assert.equal(
    lines.length,
    0,
    `${lines.length} link(s) to a page that no longer exists. Keep the file (a past event is still served, noindexed) ` +
      `or add a host-scoped redirect to vercel.json, or name the old slug in formerSlugs on the listing that took its place:\n  ${lines.join('\n  ')}`,
  );
});

test('the links into folded guides and to Niwot’s events are among those checked, and each lands where its rule says', () => {
  // Guards the test above: if the patterns stopped reaching these links it would pass on nothing.
  const folded = links.filter((l) => config(l.town).hubPage);
  assert.ok(folded.length > 0, 'the sent issues link guides since folded into their hub pages');
  for (const l of folded) {
    const town = config(l.town);
    const page = `https://insidethetowns.com/${town.hubPage!.town}/`;
    const rule = hostRule(l.domain, `/${l.collection}/${l.slug}/`);
    assert.ok(rule, `${l.domain}: no rule takes /${l.collection}/${l.slug}/`);
    assert.equal(rule.permanent, true);
    assert.equal(rule.destination, l.collection === 'events' ? `${page}#traditions` : page, `${l.domain}/${l.collection}/${l.slug}/`);
  }
  const quietEvents = links.filter((l) => liveSlugs.has(l.town) && !listsEvents(config(l.town)) && l.collection === 'events');
  assert.ok(quietEvents.length > 0, 'the sent issues and Niwot’s weekly notes link Niwot’s events');
  for (const l of quietEvents) {
    const rule = hostRule(l.domain, `/${l.collection}/${l.slug}/`);
    assert.ok(rule, `${l.domain}: no rule takes /events/${l.slug}/`);
    assert.equal(rule.source, '/events/(.*)');
    assert.equal(rule.destination, '/', `${l.domain}: an event goes to the guide's home page`);
    assert.equal(rule.permanent, true);
  }
  // The patterns read as Vercel reads them.
  assert.ok(sourcePattern('/events{/}?').test('/events/') && sourcePattern('/events{/}?').test('/events') && !sourcePattern('/events{/}?').test('/events/a/'));
  assert.ok(sourcePattern('/events/:slug{/}?').test('/events/a-b/') && !sourcePattern('/events/:slug{/}?').test('/events/a/b/'));
  assert.ok(sourcePattern('/events/(.*)').test('/events/a-b/') && !sourcePattern('/events/(.*)').test('/places/a/'));
  assert.ok(sourcePattern('/events.rss').test('/events.rss') && !sourcePattern('/events.rss').test('/eventsxrss'));
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
      // A guide that is not live builds nothing for a rule to hide.
      if (!town || !liveSlugs.has(town)) continue;
      const listing = r.source.match(/^\/(events|places|articles)\/([a-z0-9-]+)\{\/\}\?$/);
      if (listing && existsSync(join(root, 'content', town, listing[1]!, `${listing[2]}.md`))) hidden.push(`${h.value}${r.source}`);
      const section = r.source.match(/^(\/[a-z-]+)\{\/\}\?$/);
      const config = live.find((t) => t.slug === town)!;
      if (section && [...placeTypeRoutes(town), ...hubRoutes(config)].some(([pattern]) => pattern === section[1])) hidden.push(`${h.value}${r.source}`);
    }
  }
  assert.deepEqual(hidden, [], `redirects in vercel.json over pages the build makes:\n  ${hidden.join('\n  ')}`);
});
