#!/usr/bin/env node
/**
 * The local checks of the move (17 November 2026, step 7), over a hub build:
 *
 *   TOWN=hub npm run build && node scripts/migration/check-local.ts --dist=dist
 *
 * - every page under a section or kept page by page: a self-referencing
 *   canonical (or noindex), its nav and internal links inside its town's
 *   section or on the hub, its images and scripts present in the build;
 * - every event page: the dates in its Event JSON-LD match the page's
 *   <time> and the listing file's start and end;
 * - no page links to a folded domain, or to an address the map answers 410;
 * - the sitemap lists every indexable new page and no noindex one;
 * - every 301 destination in docs/migration/redirect-map.csv is built.
 *
 * Exit 1 on any problem; the list says which page and which rule.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns, isMoved } from '../../src/config/index.ts';
import { guideMap, readHistory } from './guide-map.ts';
import { readCsv } from './shared.ts';

const args = process.argv.slice(2);
const dist = args.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist';
const HUB = 'https://insidethetowns.com';
const problems: string[] = [];
const problem = (s: string) => problems.push(s);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const sections = allTowns.filter((t) => t.hubPage && t.section);
// A guide moved into the hub (src/config/guide-move.ts) is a section too, and its domain only redirects.
const folded = new Set(sections.map((t) => t.domain));
const moved = sections.filter((t) => isMoved(t));
const towns = new Map(sections.map((t) => [t.hubPage!.town, t]));
const built = (path: string) => existsSync(join(dist, path.endsWith('/') ? `${path}index.html` : path));

const sitemapUrls = new Set<string>();
for (const f of readdirSync(dist).filter((f) => /^sitemap-.*\.xml$/.test(f) && f !== 'sitemap-index.xml')) {
  for (const m of readFileSync(join(dist, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(new URL(m[1]!).pathname);
}

const gone = new Set(readCsv('docs/migration/redirect-map.csv').filter((r) => r.status === '410').map((r) => `https://${r.host}${r.old_path}`));
const map = readCsv('docs/migration/redirect-map.csv');
for (const r of map.filter((r) => r.status === '301')) {
  const path = r.destination!.replace(/^https:\/\/insidethetowns\.com/, '').split(/[?#]/)[0]!;
  if (!built(path)) problem(`${r.host}${r.old_path} → ${r.destination}: destination not built`);
}
// A moved guide's map, made from its section build as its own project makes it (scripts/migration/guide-map.ts):
// every destination built, every address of its sitemap in it, nothing unmapped, and every address of its history answered.
let movedAddresses = 0;
for (const guide of moved) {
  const out = `.sections/${guide.slug}`;
  if (!existsSync(join(out, 'sitemap-0.xml'))) {
    problem(`${guide.domain}: no section build at ${out}/ to make its map from (TOWN=hub npm run build leaves one)`);
    continue;
  }
  const m = guideMap({ guide, out, hubDomain: 'insidethetowns.com' });
  for (const [from, to] of Object.entries(m.entry.paths)) {
    movedAddresses++;
    if (to === 0) continue;
    const path = to.replace(/^https:\/\/insidethetowns\.com/, '').split(/[?#]/)[0]!;
    if (!built(path)) problem(`${guide.domain}${from} → ${to}: destination not built`);
    if (gone.has(to.split(/[?#]/)[0]!)) problem(`${guide.domain}${from} → ${to}: a 410 address`);
    if (/\/(?:events|directory|guides)\/$/.test(path) && /^\/(?:events|places|articles)\/[^/]+\/$/.test(from)) problem(`${guide.domain}${from} → ${to}: a listing sent to an index page`);
    for (const d of folded) if (to.includes(`//${d}/`)) problem(`${guide.domain}${from} → ${to}: a folded domain`);
  }
  for (const loc of m.entry.sitemap!.matchAll(/<loc>https:\/\/[^/]+([^<]+)<\/loc>/g)) if (!(loc[1]! in m.entry.paths)) problem(`${guide.domain}${loc[1]}: in the sitemap it serves but not in its map`);
  for (const r of m.unmapped) problem(`${guide.domain}${r.old_path}: a published address with no answer (docs/migration/guides/${guide.domain}.csv)`);
  for (const row of readHistory(process.cwd(), guide.domain)) if (!(row.old_path in m.entry.paths) && !(row.old_path.replace(/\/$/, '') in m.entry.paths)) problem(`${guide.domain}${row.old_path}: in the history but not answered`);
}

let pages = 0;
let events = 0;
const files = walk(dist).filter((f) => f.endsWith('.html'));
for (const file of files) {
  const path = `/${file.slice(dist.length + 1).replace(/index\.html$/, '')}`;
  const town = path.split('/')[1] ?? '';
  const inSection = towns.has(town) && path.split('/').filter(Boolean).length >= 2;
  const html = readFileSync(file, 'utf8');
  // Nothing anywhere links to a folded domain or a 410 address. The archive
  // of sent emails is a historical record and keeps the addresses it sent.
  const archive = path.startsWith('/newsletter/');
  if (!archive) for (const m of html.matchAll(/(?:href|src|content)="(https?:\/\/[^"]+)"/g)) {
    const url = m[1]!;
    let host: string;
    try {
      host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      continue;
    }
    if (folded.has(host)) problem(`${path}: links ${url} (a folded domain)`);
    if (gone.has(url.split(/[?#]/)[0]!)) problem(`${path}: links ${url}, which answers 410`);
  }
  if (!inSection) continue;
  pages++;
  const noindex = /<meta name="robots" content="noindex"/.test(html);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!noindex && canonical !== `${HUB}${path}`) problem(`${path}: canonical is ${canonical ?? 'missing'}`);
  if (noindex && sitemapUrls.has(path)) problem(`${path}: noindex but in the sitemap`);
  if (!noindex && !sitemapUrls.has(path) && !/\/(?:thanks|message-sent|correct|search)\/$/.test(path)) problem(`${path}: indexable but not in the sitemap`);
  const base = `/${town}/`;
  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
    const href = m[1]!.split(/[?#]/)[0]!;
    if (!href) continue;
    if (href.startsWith(base) || href.startsWith('/_astro/') || href.startsWith('/favicons/') || href === '/favicon.ico' || href === '/apple-touch-icon.png' || href === '/sitemap-index.xml') {
      if (!built(href) && !href.startsWith('/_astro/')) problem(`${path}: links ${href}, which is not built`);
      if (href.startsWith('/_astro/') && !existsSync(join(dist, href))) problem(`${path}: asset ${href} missing`);
      continue;
    }
    // Off the section: only the hub's own pages.
    if (!built(href)) problem(`${path}: links ${href}, outside the section and not a hub page`);
  }
  // An event page: JSON-LD dates against the page's <time> and the listing file.
  const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => {
    try {
      return JSON.parse(m[1]!) as Record<string, unknown>;
    } catch {
      return {};
    }
  });
  const event = ld.find((j) => j['@type'] === 'Event');
  const slug = path.match(/^\/[a-z-]+\/events\/([a-z0-9-]+)\/$/)?.[1];
  if (event && slug) {
    events++;
    const start = String(event.startDate ?? '');
    const times = [...html.matchAll(/<time datetime="([^"]+)"/g)].map((m) => m[1]!);
    if (!times.some((t) => t.slice(0, 10) === start.slice(0, 10))) problem(`${path}: JSON-LD startDate ${start} is not a date the page shows (${times.slice(0, 3).join(', ')})`);
    const cfg = towns.get(town)!;
    const file = join('content', cfg.slug, 'events', `${slug}.md`);
    if (existsSync(file)) {
      const fm = readFileSync(file, 'utf8');
      const fileStart = fm.match(/^start:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
      // A repeating listing is shown at its next date; its file's start is the first.
      const repeats = /^(?:repeat|recurring|performances|schedule):/m.test(fm);
      if (fileStart && !repeats && fileStart !== start.slice(0, 10)) problem(`${path}: JSON-LD startDate ${start} but the file says ${fileStart}`);
    }
  }
}
console.log(`${pages} section pages checked, ${events} event pages with Event JSON-LD, ${sitemapUrls.size} sitemap addresses, ${map.length} mapped addresses${moved.length ? `, ${movedAddresses} on the ${moved.length} moved guide${moved.length === 1 ? '' : 's'}` : ''}.`);
if (problems.length) {
  console.error(`${problems.length} problem(s):`);
  for (const p of problems.slice(0, 200)) console.error(`  ${p}`);
  if (problems.length > 200) console.error(`  … and ${problems.length - 200} more`);
  process.exit(1);
}
console.log('No problems.');
