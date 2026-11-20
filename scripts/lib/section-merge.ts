/**
 * Puts a folded guide's pages, built as a section (HUB_SECTION=1; see
 * src/config/index.ts, `sectionSite`), under /<town>/ in the hub's dist/
 * (the move of 17 November 2026).
 *
 * The section is built with Astro's `base` set to "/<town>", so every asset
 * the build itself names already carries the prefix. What does not is every
 * link a template or a listing writes by hand: "/events/", "/places/x/",
 * "https://insidelongmontco.com/eat-drink/". Those are settled here, once,
 * for every page, so no link can leave the section by being forgotten:
 *
 *   - a path the section moved (SECTION_MOVED: the home page is the hub's
 *     town page; This week, This weekend and Updates are /<town>/events/)
 *     goes where the brief sends it;
 *   - a path the section built gets the prefix;
 *   - a path the hub has (/search/, the favicons, /newsletter/) is left
 *     alone: it is the same site;
 *   - anything else is a link to nothing, and is reported (the build fails
 *     on it everywhere but Vercel, as check-site does).
 *
 * An absolute address on the guide's old domain is the same link spelled
 * out, and gets the same treatment with the hub's origin in front: the
 * structured data, the feeds and the calendar files name their pages that
 * way.
 *
 * Then the files are copied in. A file the hub already built at the same
 * path stops the merge: a tradition's page and a section page may never
 * share an address.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { SECTION_MOVED } from '../../src/lib/section.ts';

/**
 * The guide's paths the brief sends elsewhere, as [path, destination under
 * the section]: one list, in src/lib/section.ts, which a hub page that
 * draws a section's masthead reads too.
 */
export { SECTION_MOVED };

/**
 * What a section build writes that the hub already has or must not get:
 * the home page (the hub's town page stands for it), the 404, the host
 * files, the favicons (the hub's public/ has every town's), the IndexNow
 * key, and the section's own search page (the hub's search indexes the
 * section's pages with its own). Paths relative to the section's output.
 */
const DROPPED = ['index.html', '404.html', 'robots.txt', 'favicon.ico', 'apple-touch-icon.png', 'favicons', 'search', 'pagefind', '_headers', '_redirects', 'sitemap-index.xml'];

const TEXT = /\.(html|xml|rss|ics|json|txt)$/;

export interface MergeOptions {
  /** The section build's output folder. */
  from: string;
  /** The hub's dist/. */
  hub: string;
  /** "/longmont" */
  base: string;
  /** "insidelongmontco.com" */
  oldDomain: string;
  /** "insidethetowns.com" */
  hubDomain: string;
  /** The old event addresses with a tradition page on the hub (data/hub/fold-events.json): "/events/<slug>/" to "/<town>/<event>/". */
  events?: Readonly<Record<string, string>>;
  /**
   * A guide moved whole (`section.carry: 'all'`, src/config/guide-move.ts):
   * its home page, This Week, This weekend, updates and its Every year page
   * are carried at their own paths, not sent elsewhere, since the hub has no
   * town page for it. An annual event's own page is not merged where the
   * hub builds its tradition page (`events`): one page for one event.
   */
  carryAll?: boolean;
}

export interface MergeResult {
  pages: number;
  files: number;
  /** Links that lead nowhere: "<page>: <link>". */
  dangling: string[];
  /** The section's sitemap, as the hub serves it: its file name at the hub's root, or nothing when the section lists no page. */
  sitemap?: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** "/events/" for events/index.html; "/events.rss" for events.rss. */
function served(file: string): string {
  const path = `/${file.split('\\').join('/')}`;
  return path.endsWith('/index.html') ? path.slice(0, -'index.html'.length) : path;
}

/**
 * Where one hand-written path goes. `inSection` and `inHub` say what is
 * built where. Returns the path to write, or undefined for a dead link.
 * The query and the fragment ride along.
 */
export function resolvePath(href: string, base: string, inSection: (path: string) => boolean, inHub: (path: string) => boolean, events: Readonly<Record<string, string>> = {}, moved: ReadonlyArray<readonly [string, string]> = SECTION_MOVED): string | undefined {
  const at = href.search(/[?#]/);
  const path = at === -1 ? href : href.slice(0, at);
  const rest = at === -1 ? '' : href.slice(at);
  // Already under the section (the build's own assets, the hub's town page and its tradition pages).
  if (path === base || path.startsWith(`${base}/`)) return href;
  if (path === '/') return `${base}/${rest}`;
  // A moved page's fragment names a section of a page that is gone; the query, where there is one, stays.
  for (const [from, to] of moved) if (path === from || path === from.replace(/\/$/, '')) return `${base}${to}${rest.startsWith('?') ? rest.split('#')[0] : ''}`;
  const slashed = path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  // An annual event's old address: its tradition page, before the section's own pages (the section builds none for it).
  if (events[slashed]) return `${events[slashed]}${rest}`;
  if (inSection(slashed)) return `${base}${slashed}${rest}`;
  if (inHub(slashed)) return `${slashed}${rest}`;
  return undefined;
}

const ATTR = /(\s(?:href|src|action|poster)=")(\/(?!\/)[^"]*)(")/g;
const SRCSET = /(\s(?:srcset|imagesrcset)=")([^"]*)(")/g;

/** Rewrites one file's text. `report` is told each dead link. */
export function rewriteText(text: string, o: Pick<MergeOptions, 'base' | 'oldDomain' | 'hubDomain' | 'events' | 'carryAll'>, html: boolean, inSection: (path: string) => boolean, inHub: (path: string) => boolean, report: (link: string) => void): string {
  const moved = o.carryAll ? [] : SECTION_MOVED;
  const go = (href: string): string => {
    const to = resolvePath(href, o.base, inSection, inHub, o.events, moved);
    if (to === undefined) {
      report(href);
      // A dead link is sent to the hub's town page rather than left pointing at nothing.
      return `${o.base}/`;
    }
    return to;
  };
  let out = text;
  if (html) {
    out = out.replace(ATTR, (_m, a: string, href: string, z: string) => `${a}${go(href.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}${z}`);
    out = out.replace(SRCSET, (_m, a: string, set: string, z: string) => `${a}${set.split(',').map((part) => part.trim().replace(/^\/(?!\/)\S*/, (u) => go(u))).join(', ')}${z}`);
  }
  // The same links spelled out on the old domain, anywhere in the file: JSON-LD, og:url, feeds, calendars.
  const absolute = new RegExp(`https?:(\\\\?/\\\\?/)(?:www\\.)?${o.oldDomain.replace(/\./g, '\\.')}((?:\\\\?/[^\\s"'<>\\\\)]*)*)`, 'g');
  out = out.replace(absolute, (_m, slashes: string, tail: string) => {
    const escaped = slashes.includes('\\');
    const path = (escaped ? tail.replace(/\\\//g, '/') : tail) || '/';
    const to = `https://${o.hubDomain}${go(path.replace(/&amp;/g, '&'))}`;
    return escaped ? to.replace(/\//g, '\\/') : to;
  });
  // An address the build wrote on the hub's origin without the section's
  // prefix: the feeds and the calendar files name their pages from `site`
  // by hand ("https://insidethetowns.com/events/x/"). A hub page, or the
  // hub's home, is left as it is.
  const onHub = new RegExp(`https://${o.hubDomain.replace(/\./g, '\\.')}(/[^\\s"'<>)]*)`, 'g');
  out = out.replace(onHub, (m, path: string) => {
    const clean = path.split(/[?#]/)[0]!;
    if (clean === '/' || clean === o.base || clean.startsWith(`${o.base}/`) || inHub(clean.endsWith('/') || /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}/`)) return m;
    const to = resolvePath(path.replace(/&amp;/g, '&'), o.base, inSection, inHub, o.events, moved);
    return to === undefined ? m : `https://${o.hubDomain}${to.replace(/&/g, '&amp;')}`;
  });
  // The same, percent-encoded inside another address (the Google Calendar
  // link's webcal://<domain>/events/calendar.ics).
  const encoded = new RegExp(`(webcal|https?)%3A%2F%2F(?:www\\.)?${o.oldDomain.replace(/\./g, '\\.')}((?:%2F[A-Za-z0-9._~-]*)*)`, 'g');
  out = out.replace(encoded, (_m, scheme: string, tail: string) => {
    const path = tail.replace(/%2F/g, '/') || '/';
    return `${scheme}%3A%2F%2F${o.hubDomain}${encodeURIComponent(go(path)).replace(/%2F/gi, '%2F')}`;
  });
  return out;
}

/**
 * The hub's own pages that name a moved guide's domain by hand (an article's
 * link to its sports page, the moving guide's link to a Niwot update): each
 * is rewritten to the guide's place on the hub, so no page of the hub links
 * a domain that only redirects. `where` gives the hub path for a path on a
 * moved domain, or undefined where the domain is no moved guide's
 * (src/lib/moved-guides.ts, movedPath). Returns the files changed.
 */
export function rewriteMovedLinks(hub: string, hubDomain: string, domains: readonly string[], where: (domain: string, path: string) => string | undefined, dropped: Readonly<Record<string, string>> = {}): number {
  if (!domains.length) return 0;
  const hosts = domains.map((d) => d.replace(/\./g, '\\.')).join('|');
  const absolute = new RegExp(`https?:(\\\\?/\\\\?/)(?:www\\.)?(${hosts})((?:\\\\?/[^\\s"'<>\\\\)]*)*)`, 'g');
  // A section page the merge dropped for the hub's tradition page ("/windsor/events/windsor-wonderland/" to
  // "/windsor/wonderland/"), linked by a hub page (a season's roundup) on the hub's origin or by path.
  const droppedPaths = Object.keys(dropped).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const onHub = droppedPaths ? new RegExp(`(https://${hubDomain.replace(/\./g, '\\.')}|\\s(?:href|src)=")(${droppedPaths})`, 'g') : undefined;
  let changed = 0;
  const built = (to: string) => {
    const p = to.split(/[?#]/)[0]!;
    return existsSync(join(hub, p.endsWith('/') ? `${p}index.html` : p));
  };
  for (const file of walk(hub).filter((f) => TEXT.test(f))) {
    // The archive of sent emails is a historical record: a link there follows the guide only where its page is built on the
    // hub; the address of a listing that is over stays as sent, and the guide's domain answers it from its map.
    const archive = /^(?:.*[\\/])?newsletter[\\/]/.test(relative(hub, file));
    const text = readFileSync(file, 'utf8');
    let out = onHub ? text.replace(onHub, (_m, lead: string, path: string) => `${lead}${dropped[path]}`) : text;
    out = out.replace(absolute, (m, slashes: string, domain: string, tail: string) => {
      const escaped = slashes.includes('\\');
      const path = (escaped ? tail.replace(/\\\//g, '/') : tail) || '/';
      const to = where(domain, path.replace(/&amp;/g, '&'));
      if (!to || (archive && !built(to))) return m;
      const url = `https://${hubDomain}${to.replace(/&/g, '&amp;')}`;
      return escaped ? url.replace(/\//g, '\\/') : url;
    });
    if (out !== text) {
      writeFileSync(file, out, 'utf8');
      changed++;
    }
  }
  return changed;
}

/** The newest `<lastmod>` in a sitemap file, or nothing when no page there carries one. */
export function sitemapLastmod(xml: string): string | undefined {
  let newest: string | undefined;
  for (const [, value] of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) if (!Number.isNaN(Date.parse(value!)) && (!newest || Date.parse(value!) > Date.parse(newest))) newest = value;
  return newest;
}

export function mergeSection(o: MergeOptions): MergeResult {
  if (!existsSync(o.from)) throw new Error(`section-merge: ${o.from} is not built.`);
  for (const name of DROPPED) if (!(o.carryAll && name === 'index.html')) rmSync(join(o.from, name), { recursive: true, force: true });
  // A moved guide's annual event with a tradition page on the hub: the tradition page stands for it (see `carryAll`).
  if (o.carryAll) for (const path of Object.keys(o.events ?? {})) if (path.endsWith('/')) rmSync(join(o.from, path.slice(1)), { recursive: true, force: true });
  // public/ is copied into every build; what the hub already serves at the root is not served twice.
  const files = walk(o.from).map((f) => relative(o.from, f));
  const section = new Set(files.map(served));
  const inSection = (path: string) => section.has(path);
  const inHub = (path: string) => existsSync(join(o.hub, path.endsWith('/') ? `${path}index.html` : path));

  const dangling: string[] = [];
  let pages = 0;
  let sitemap: string | undefined;
  const target = join(o.hub, o.base);
  for (const file of files) {
    const from = join(o.from, file);
    if (file === 'sitemap-0.xml') {
      // Served at the hub's root beside its own, and named in its index (below).
      sitemap = `sitemap-${o.base.slice(1)}.xml`;
      let xml = readFileSync(from, 'utf8');
      // The annual events' own pages a moved guide's section does not carry (see `carryAll`) are not listed either.
      if (o.carryAll) for (const path of Object.keys(o.events ?? {})) xml = xml.replace(new RegExp(`<url><loc>https://${o.hubDomain.replace(/\./g, '\\.')}${o.base}${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>.*?</url>`, 'g'), '');
      writeFileSync(join(o.hub, sitemap), xml, 'utf8');
      continue;
    }
    const to = join(target, file);
    if (existsSync(to)) throw new Error(`section-merge: ${o.base}/${file} is already built by the hub; a section page and a hub page may not share an address.`);
    mkdirSync(dirname(to), { recursive: true });
    if (!TEXT.test(file)) {
      cpSync(from, to);
      continue;
    }
    const html = file.endsWith('.html');
    if (html) pages++;
    const page = `${o.base}${served(file)}`;
    writeFileSync(to, rewriteText(readFileSync(from, 'utf8'), o, html, inSection, inHub, (link) => dangling.push(`${page}: ${link}`)), 'utf8');
  }
  if (sitemap) {
    const index = join(o.hub, 'sitemap-index.xml');
    const xml = readFileSync(index, 'utf8');
    const loc = `<loc>https://${o.hubDomain}/${sitemap}</loc>`;
    // The child entry carries the newest lastmod among its pages, as the
    // hub's own entry does (the site audit of 19 November 2026: one of
    // twelve entries had one), so a crawler can tell which file moved.
    const newest = sitemapLastmod(readFileSync(join(o.hub, sitemap), 'utf8'));
    const entry = `<sitemap>${loc}${newest ? `<lastmod>${newest}</lastmod>` : ''}</sitemap>`;
    if (!xml.includes(loc)) writeFileSync(index, xml.replace('</sitemapindex>', `${entry}</sitemapindex>`), 'utf8');
  }
  return { pages, files: files.length, dangling, sitemap };
}
