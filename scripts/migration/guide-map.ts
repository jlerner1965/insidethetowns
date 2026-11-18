/**
 * The redirect map for a moved guide's domain (the move of the seven guides,
 * src/config/guide-move.ts), made from the guide's current content in the
 * same build that serves it: anything published up to the cutover, and
 * after it, carries over with no step of its own.
 *
 * The guide's own project builds, with its switch on, the guide's section
 * exactly as the hub does (HUB_SECTION=1; scripts/run.ts) and answers from
 * the map written here into api/legacy-map.json, which Vercel bundles with
 * api/legacy.ts after the build command (the folded projects' build logs:
 * the functions are compiled after `npm run build`). Every address gets one
 * answer, one hop:
 *
 * 1. a page or file the section builds: the same path under /<town>/, or
 *    the tradition page that stands for an annual event
 *    (src/lib/moved-guides.ts);
 * 2. an address the guide forwarded (a former or retired slug, a moved
 *    index page; src/lib/former-slugs.ts): where its target lands;
 * 3. an address the guide ever published and no longer builds
 *    (docs/migration/guides/<host>.csv, rebuilt from git history, past
 *    deployments' sitemaps and vercel.json's history,
 *    scripts/migration/guide-inventory.ts): its decision there, made page
 *    by page; else, for a past occurrence of an event series that goes
 *    on, the series' current page;
 * 4. the guide's sitemap as it stands, at its old address, and a robots.txt
 *    that points to it, both 200 (api/legacy.ts).
 *
 * An address none of these answers is listed as unmapped: the build prints
 * it, and test/guide-move.test.ts fails on it, so nothing reaches the
 * town's home page by default.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { dayKey } from '../../src/lib/dates.ts';
import { guideRedirects, RETIRED_INDEX } from '../../src/lib/former-slugs.ts';
import { listsEvents } from '../../src/config/index.ts';
import { movedEventPaths } from '../../src/lib/moved-guides.ts';
import { pickCanonical, readOccurrences } from '../../src/lib/series.ts';
import { readCsv } from './shared.ts';

/** One domain's entry in api/legacy-map.json, as api/legacy.ts reads it. */
export interface MapEntry {
  /** Where an address the map does not know goes: the section's home. */
  page: string;
  paths: Record<string, string | 0>;
  sitemap?: string;
  sitemapIndex?: string;
  /** Set on a moved guide's entry: the 410 page then says the guide moved, not that it closed. */
  moved?: { name: string };
}

/** A row of docs/migration/guides/<host>.csv. */
export interface HistoryRow {
  old_path: string;
  /** Where the address was found: `git <sha>`, `sitemap <date>`, `vercel.json`, `qr-card`. */
  source: string;
  /** events, places, articles, page, file. */
  kind: string;
  /** For an event: "<title>|<venue>", its series key (src/lib/series.ts). */
  key: string;
  /** Empty (the rules decide), a path on the guide ("/events/x/": where that lands), "gone" (410), or an address on the hub. */
  decision: string;
  note: string;
}

/** Files a section build writes that are no page of the guide's: host files, the search, hashed assets. */
const NOT_ADDRESSES = /^\/(?:404\.html|robots\.txt|sitemap-[^/]*\.xml|_headers|_redirects|_astro\/|pagefind\/|favicons\/|favicon\.ico$|apple-touch-icon\.png$|[0-9a-f]{32}\.txt$)/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** "/events/" for events/index.html; "/events.rss" for events.rss. */
export function servedPath(file: string): string {
  const path = `/${file.split('\\').join('/')}`;
  return path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
}

/** Every address a section build serves, as the guide knew it (no /<town> prefix). */
export function sectionAddresses(out: string): Set<string> {
  return new Set(walk(out).map((f) => servedPath(relative(out, f))).filter((p) => !NOT_ADDRESSES.test(p)));
}

/** The history rows for a domain, or none. */
export function readHistory(root: string, domain: string): HistoryRow[] {
  const file = join(root, 'docs/migration/guides', `${domain}.csv`);
  return existsSync(file) ? (readCsv(file) as unknown as HistoryRow[]) : [];
}

const slashed = (path: string) => (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`);

export interface GuideMap {
  entry: MapEntry;
  /** Addresses the guide published that nothing here answers: each must get a decision. */
  unmapped: HistoryRow[];
  counts: { built: number; events: number; forwarded: number; history: number; series: number; gone: number };
}

/**
 * The map for one moved guide. `out` is its section build (HUB_SECTION=1),
 * before any merge; `root` the repository, for the content and the history.
 */
export function guideMap(o: { guide: TownConfig; out: string; hubDomain: string; root?: string; now?: Date; /** The history rows, in place of docs/migration/guides/<host>.csv. */ history?: HistoryRow[] }): GuideMap {
  const root = o.root ?? process.cwd();
  const now = o.now ?? new Date();
  const town = o.guide.hubPage!.town;
  const hub = `https://${o.hubDomain}`;
  const built = sectionAddresses(o.out);
  const events = movedEventPaths(o.guide);
  const paths: Record<string, string | 0> = {};
  const counts = { built: 0, events: 0, forwarded: 0, history: 0, series: 0, gone: 0 };

  /** Where a path on the guide lands, when the section builds it (or an annual event's page stands for it); its query and fragment ride along. */
  const land = (path: string): string | undefined => {
    const at = path.search(/[?#]/);
    const p = slashed(at === -1 ? path : path.slice(0, at));
    const rest = at === -1 ? '' : path.slice(at);
    if (events[p]) return `${hub}${events[p]}${rest}`;
    if (built.has(p)) return `${hub}/${town}${p}${rest}`;
    return undefined;
  };

  // 1. What the section builds.
  for (const p of built) {
    paths[p] = land(p)!;
    if (events[p]) counts.events++;
    else counts.built++;
  }
  // An annual event's address the section may not build (its date passed): the tradition page all the same.
  for (const [p, to] of Object.entries(events)) if (!(p in paths)) ((paths[p] = `${hub}${to}`), counts.events++);

  // 2. What the guide forwarded: its former and retired slugs, its moved index
  // pages. A retired listing the guide sent to its events list or directory
  // is not sent there (a generic page, the owner's rule): its series' current
  // page, or its decision, answers it below.
  const forwarded = guideRedirects(o.guide.slug, { listsEvents: listsEvents(o.guide), contentRoot: join(root, 'content'), now });
  const generic = new Set(Object.values(RETIRED_INDEX));
  for (const [from, to] of Object.entries(forwarded)) {
    const p = slashed(from);
    if (p in paths) continue;
    if (generic.has(to) && /^\/(events|places|articles)\/[^/]+\/$/.test(p)) continue;
    const target = land(to);
    if (target) ((paths[p] = target), counts.forwarded++);
  }

  // 3. What the guide published before and no longer builds.
  const occurrences = readOccurrences(o.guide.slug, join(root, 'content'));
  const canonical = pickCanonical(occurrences, dayKey(now));
  const unmapped: HistoryRow[] = [];
  for (const row of o.history ?? readHistory(root, o.guide.domain)) {
    const p = slashed(row.old_path);
    if (p in paths) continue;
    const decision = row.decision.trim();
    if (decision === 'gone') {
      paths[p] = 0;
      counts.gone++;
      continue;
    }
    if (decision.startsWith('https://')) {
      paths[p] = decision;
      counts.history++;
      continue;
    }
    if (decision.startsWith('/')) {
      const target = land(decision) ?? (typeof paths[slashed(decision)] === 'string' ? (paths[slashed(decision)] as string) : undefined);
      if (target) {
        paths[p] = target;
        counts.history++;
        continue;
      }
    }
    // A past occurrence of a series that goes on: the series' page today.
    if (row.kind === 'events' && row.key) {
      const page = canonical.get(row.key);
      const target = page && land(`/events/${page}/`);
      if (target) {
        paths[p] = target;
        counts.series++;
        continue;
      }
    }
    unmapped.push(row);
  }

  // 4. The sitemap the guide serves today, at its old address.
  const sitemapFile = join(o.out, 'sitemap-0.xml');
  const prefix = new RegExp(`https://${o.hubDomain.replace(/\./g, '\\.')}/${town}/`, 'g');
  const sitemap = existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8').replace(prefix, `https://${o.guide.domain}/`) : undefined;
  const sitemapIndex = sitemap ? `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://${o.guide.domain}/sitemap-0.xml</loc></sitemap></sitemapindex>` : undefined;

  return { entry: { page: `${hub}/${town}/`, paths, sitemap, sitemapIndex, moved: { name: o.guide.siteTitle } }, unmapped, counts };
}
