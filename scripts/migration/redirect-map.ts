#!/usr/bin/env node
/**
 * Where every old address of a folded guide's domain goes (the move of 18
 * November 2026, steps 1 and 4): docs/migration/redirect-map.csv, and the
 * table api/legacy.ts answers from, api/legacy-map.json.
 *
 *   node scripts/migration/redirect-map.ts --dist=dist     # after `TOWN=hub npm run build`
 *
 * For each address in docs/migration/inventory/<host>.csv:
 *
 * - a full section (Longmont, Loveland, Fort Collins, Estes Park;
 *   `section.mode: 'full'`): the same path under /<town>/ where the hub
 *   built it; the home page, This week, This weekend and Updates to where
 *   the brief sends them; an annual event's address to its tradition page
 *   (data/hub/fold-events.json); a past one-time event, a closed or lapsed
 *   place and a high-school sports page 410; anything else the town's page;
 * - a guide kept page by page (`section.mode: 'pages'`): the decision in
 *   docs/migration/decisions/<town>.csv, checked against what the hub
 *   built; the guide's fixed pages to the town's page, its directory and
 *   its picks pages to /<town>/places/, its feeds 410;
 * - every domain: the pre-restructure sitemap and robots.txt are served as
 *   they were (status 200 in the map), to be removed after 2027-05-17.
 *
 * A redirect stub (meta refresh) goes where its target goes, so no address
 * takes two hops. An address not in the map is answered at request time
 * with the town's page (api/legacy.ts).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns, getNetworkHub } from '../../src/config/index.ts';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { ALSO_COVERED, foldEventTargets, type FoldEventMap } from '../../src/lib/fold.ts';
import { hubEventPages, publishedHubTowns } from '../../src/lib/hub-towns.ts';
import { rawRecords } from '../../src/lib/tradition-files.ts';
import { dayKey } from '../../src/lib/dates.ts';
import foldEvents from '../../data/hub/fold-events.json' with { type: 'json' };
import { FOLDED, csvLine, readCsv } from './shared.ts';

const args = process.argv.slice(2);
const dist = args.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist';
const hub = getNetworkHub();
const today = dayKey(new Date());
if (!existsSync(join(dist, 'index.html'))) throw new Error(`${dist}/ holds no hub build; run TOWN=hub npm run build first.`);

const records = rawRecords();
const published = new Set(publishedHubTowns(records).map((t) => t.slug));
const pages = new Map(hubEventPages(records, published).map((p) => [p.record.slug, { town: p.town, event: p.event }]));

/** Whether the hub built a page or file at this path. */
const built = (path: string): boolean => {
  const clean = path.split(/[?#]/)[0]!;
  return existsSync(join(dist, clean.endsWith('/') ? `${clean}index.html` : clean));
};
const git = (...a: string[]): string | undefined => {
  try {
    return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return undefined;
  }
};
/** The old listing's front matter at the commit, or at the commit that deleted it. */
function oldFile(town: TownConfig, commit: string, kind: string, slug: string): string | undefined {
  const file = `content/${town.slug}/${kind}/${slug}.md`;
  const at = git('show', `${commit}:${file}`);
  if (at) return at;
  const deleted = git('log', '--diff-filter=D', '--format=%h', '-1', commit, '--', file)?.trim();
  return deleted ? git('show', `${deleted}^:${file}`) : undefined;
}
const lastDate = (fm: string): string | undefined => fm.match(/^(?:start|end|until):\s*"?(\d{4}-\d{2}-\d{2})/gm)?.map((m) => m.slice(-10)).sort().pop();
const SERVED = new Set(['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt']);
const TO_EVENTS = new Set(['/this-week/', '/this-weekend/', '/updates/']);
const TO_PLACES = new Set(['/directory/', '/places/', '/eat-drink/', '/guides/', '/articles/', '/restaurants/', '/coffee/', '/bars-breweries/', '/shops/', '/parks/', '/trails/', '/trailheads/', '/venues/', '/museums/', '/lodging/']);
const FEED = /^\/(?:events\.rss|rss\.xml|updates\.rss|events\/calendar\.ics|events\/[^/]+\.ics)$/;

interface Row {
  host: string;
  old_path: string;
  status: 301 | 410 | 200;
  destination: string;
  reason: string;
  source: string;
}
const rows: Row[] = [];
const summary: Record<string, Record<string, number>> = {};
const count = (host: string, key: string) => ((summary[host] ??= {})[key] = (summary[host]![key] ?? 0) + 1);

for (const town of allTowns.filter((t) => t.hubPage && t.section && FOLDED[t.domain])) {
  const host = town.domain;
  const H = town.hubPage!.town;
  const page = `/${H}/`;
  const mode = town.section!.mode;
  const { commit } = FOLDED[host]!;
  const inventory = readCsv(`docs/migration/inventory/${host}.csv`);
  const decisionsOf = (slug: string) => new Map(existsSync(`docs/migration/decisions/${slug}.csv`) ? readCsv(`docs/migration/decisions/${slug}.csv`).map((r) => [r.old_path!, r]) : []);
  const decisions = decisionsOf(town.slug);
  // A second town the guide carried for a while (src/lib/fold.ts, ALSO_COVERED: the Clear Creek
  // guide held Black Hawk's listings from 20 October to 2 November 2026): its own decisions, by the same path.
  const alsoCovered = (ALSO_COVERED[host] ?? []).map((t) => decisionsOf(allTowns.find((c) => c.hubPage?.town === t)?.slug ?? t));
  const traditions = new Map(foldEventTargets(foldEvents as FoldEventMap, host, H, (slug) => pages.get(slug)).map((e) => [e.path, `/${e.town ?? H}/${e.event}/`]));
  const stubs = new Map(inventory.filter((r) => r.source === 'stub').map((r) => [r.old_path!, r.note!]));

  const decide = (path: string, depth = 0): Omit<Row, 'host' | 'old_path' | 'source'> => {
    const go = (destination: string, reason: string): Omit<Row, 'host' | 'old_path' | 'source'> => ({ status: 301, destination, reason });
    const gone = (reason: string): Omit<Row, 'host' | 'old_path' | 'source'> => ({ status: 410, destination: '', reason });
    if (SERVED.has(path)) return { status: 200, destination: '', reason: 'served as it was: the pre-restructure sitemap and robots.txt; remove after 2027-05-17' };
    if (path === '/') return go(page, 'the old home page is the town’s page on the hub');
    const stub = stubs.get(path);
    if (stub && depth < 3) {
      const target = stub.startsWith('/') ? stub : new URL(stub).pathname;
      const d = decide(target, depth + 1);
      return { ...d, reason: `a redirect stub for ${target}: ${d.reason}` };
    }
    if (path.startsWith('/sports/')) return gone('high-school sports page; there are no ongoing scores');
    if (/^\/sports\/?$/.test(path)) return gone('high-school sports page; there are no ongoing scores');
    const event = path.match(/^\/events\/([a-z0-9-]+)\/$/)?.[1];
    const place = path.match(/^\/places\/([a-z0-9-]+)\/$/)?.[1];
    const article = path.match(/^\/articles\/([a-z0-9-]+)\/$/)?.[1];
    const tradition = traditions.get(path);
    if (mode === 'full') {
      if (TO_EVENTS.has(path)) return go(`${page}events/`, 'This week, This weekend and Updates are the section’s events page');
      if (path === '/updates.rss') return go(`${page}events.rss`, 'the section’s events feed');
      if (path === '/traditions/') return go(`${page}#traditions`, 'the town’s annual events are on its page');
      if (tradition) return go(tradition, 'an annual event: its tradition page on the hub');
      if (built(`${page}${path.slice(1)}`)) return go(`${page}${path.slice(1)}`, event ? 'carried over: the event’s page in the section' : place ? 'kept: the place’s page in the section' : article ? 'kept: the guide in the section' : 'the same page in the section');
      if (event) {
        const fm = oldFile(town, commit, 'events', event);
        if (fm && /^annual:\s*true/m.test(fm)) return gone('annual on the old guide, not verifiable as continuing on its source; no tradition record');
        const last = fm ? lastDate(fm) : undefined;
        if (last && last >= today) return gone('upcoming on the old guide but held back by the publish gate (no confirmation on its source)');
        return gone('past one-time event with no matching annual page');
      }
      if (path.endsWith('.ics')) return gone('a past event’s calendar file');
      if (place) {
        const fm = oldFile(town, commit, 'places', place);
        if (fm && /^status:\s*"?closed"?\s*$/m.test(fm)) return gone('closed: the old guide had it permanently closed');
        return go(`${page}directory/`, 'not built in the section (outside its freshness window); the section’s directory');
      }
      return go(page, 'a page not carried into the section; the town’s page on the hub');
    }
    // Page by page.
    const d = decisions.get(path);
    if (d) {
      if (d.decision === '410') return gone(d.reason!);
      const dest = d.destination!;
      if (d.decision === '301') return built(dest) ? go(dest, d.reason!) : go(page, `${d.reason!} (index not built; the town's page)`);
      // A kept place since found closed for good (`status: closed` in its file) answers 410: only a confirmed closure does.
      const keptPlace = dest.match(/^\/[a-z-]+\/places\/([a-z0-9-]+)\/$/)?.[1];
      if (keptPlace && existsSync(`content/${town.slug}/places/${keptPlace}.md`) && /^status:\s*"?closed"?\s*$/m.test(readFileSync(`content/${town.slug}/places/${keptPlace}.md`, 'utf8'))) return gone('closed: the place’s file says it has closed for good');
      if (built(dest)) return go(dest, d.decision === 'tradition' ? `an annual event: ${d.reason}` : `kept: ${d.reason}`);
      if (d.decision === 'tradition') throw new Error(`${host}${path}: the tradition page ${dest} is not built.`);
      return gone(`unverifiable: carried over but held back by the hub’s publish gate (${dest})`);
    }
    if (tradition) return go(tradition, 'an annual event: its tradition page on the hub');
    if (FEED.test(path)) return gone('a feed or calendar file of the closed guide; no page stands for it');
    if (TO_PLACES.has(path)) return built(`${page}places/`) ? go(`${page}places/`, 'the directory and the picks pages are the index of kept pages') : go(page, 'the town’s page on the hub');
    if (event) {
      const fm = oldFile(town, commit, 'events', event);
      if (fm && /^annual:\s*true/m.test(fm)) return gone('annual on the old guide, not verifiable as continuing; no tradition record');
      return gone(fm && (lastDate(fm) ?? '') >= today ? 'not carried: no decision for it' : 'past one-time event with no matching annual page');
    }
    if (place) {
      // Decided under the other town the guide carried (ALSO_COVERED), by the same path.
      for (const other of alsoCovered) {
        const o = other.get(path);
        if (o && o.decision !== '410' && built(o.destination!)) return go(o.destination!, `a ${o.destination!.split('/')[1]} listing the guide carried for a while: ${o.reason}`);
        if (o?.decision === '410') return gone(o.reason!);
      }
      // A listing the guide itself dropped before the move: 410 only when it had it closed.
      const fm = oldFile(town, commit, 'places', place);
      if (fm && /^status:\s*"?closed"?\s*$/m.test(fm)) return gone('closed: the old guide had it permanently closed');
      return built(`${page}places/`) ? go(`${page}places/`, 'dropped from the old guide before the move, not as closed; the town’s places') : go(page, 'dropped from the old guide before the move, not as closed; the town’s page');
    }
    if (article) return gone('retired before the restructure');
    // A page the guide had for a town it covered ("/georgetown/" on the Clear Creek guide, in the
    // sitemap it served on 3 November 2026): that town's page on the hub, where it has one.
    const covered = path.match(/^\/([a-z-]+)\/$/)?.[1];
    if (covered && covered !== H && built(`/${covered}/`) && allTowns.some((t) => t.hubPage?.town === covered)) return go(`/${covered}/`, 'the guide’s page for a town it covered: that town’s page on the hub');
    return go(page, 'a page of the closed guide; the town’s page on the hub');
  };

  for (const r of inventory) {
    const path = r.old_path!;
    const d = decide(path);
    rows.push({ host, old_path: path, ...d, source: r.source! });
    count(host, d.status === 200 ? 'served' : d.status === 301 ? (d.destination.startsWith(page) && d.destination !== page && !d.destination.startsWith(`${page}#`) ? (d.destination.split('/').length > 3 && !/\/(events|places|guides|articles|directory|eat-drink|things-to-do|events\.rss|rss\.xml)/.test(d.destination) ? 'to a tradition page' : 'to a kept or moved page') : 'to the town page') : `410: ${d.reason.split(/[:;]/)[0]}`);
  }
}

rows.sort((a, b) => a.host.localeCompare(b.host) || a.old_path.localeCompare(b.old_path));
writeFileSync('docs/migration/redirect-map.csv', ['host,old_path,status,destination,reason,source', ...rows.map((r) => csvLine([r.host, r.old_path, r.status, r.destination, r.reason, r.source]))].join('\n') + '\n');

// The table the function answers from: host → town page, and each path's answer.
const table: Record<string, { page: string; paths: Record<string, string | 0>; sitemap?: string; sitemapIndex?: string }> = {};
for (const r of rows) {
  const town = allTowns.find((t) => t.domain === r.host)!;
  const entry = (table[r.host] ??= { page: `https://${hub.domain}/${town.hubPage!.town}/`, paths: {} });
  if (r.status === 200) continue;
  entry.paths[r.old_path] = r.status === 410 ? 0 : r.destination.startsWith('http') ? r.destination : `https://${hub.domain}${r.destination}`;
}
for (const host of Object.keys(table)) {
  const dir = join('data/migration/sitemaps', host);
  if (existsSync(join(dir, 'sitemap-0.xml'))) {
    table[host]!.sitemap = readFileSync(join(dir, 'sitemap-0.xml'), 'utf8');
    table[host]!.sitemapIndex = readFileSync(join(dir, 'sitemap-index.xml'), 'utf8');
  }
}
writeFileSync('api/legacy-map.json', JSON.stringify(table) + '\n');

for (const [host, counts] of Object.entries(summary)) console.log(`${host}: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}`);
console.log(`${rows.length} addresses in docs/migration/redirect-map.csv; api/legacy-map.json rewritten.`);
