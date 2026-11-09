/**
 * Reads a built site (dist/) the way a crawler would and reports what is
 * broken in it: a link to a page that was not built, a canonical that names
 * another URL, a sitemap that lists a noindex page or leaves an indexable one
 * out, structured data that does not parse or points nowhere, a redirect in
 * vercel.json that hides a real page or lands on a missing one.
 *
 * The unit tests hold the rules of each function; nothing held the pages
 * those functions add up to. A template change that passes every test can
 * still ship a nav link to a route one kind of guide does not have, and the
 * first to find it was a reader or an audit a week later. This runs after
 * every build (`npm run build`, scripts/run.ts) and in CI for every live
 * site, and any problem fails the build.
 *
 * Offline and deterministic: it reads files, never the network. Links that
 * leave the network are `npm run check-links`'s job. Links between the
 * network's own sites are written to a manifest per site and checked once
 * every site is built (scripts/check-network.ts).
 *
 * No HTML parser: the pages are Astro's own output, so a tag scanner is
 * enough, and a dependency here would be one more thing to keep in step.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface Problem {
  /** The rule's short name, stable, so a report can be grouped and searched. */
  rule: string;
  /** The page, file or redirect the problem is on. */
  where: string;
  detail: string;
}

export interface VercelRedirect {
  source: string;
  destination: string;
  permanent?: boolean;
  has?: Array<{ type: string; value?: string }>;
}

export interface SiteInput {
  /** The built site's folder. */
  dir: string;
  /** The site's own domain, without scheme. */
  domain: string;
  /** Every domain of the network mapped to whether a guide is served there. */
  network: Map<string, boolean>;
  /** vercel.json's redirects, all of them; the host conditions are read here. */
  redirects: VercelRedirect[];
  /** The build's clock, for "a lastmod in the future". */
  now?: Date;
  /**
   * Pages that are a record of something already sent (the hub's archive of
   * the Thursday emails). Their links are what the email carried, so one may
   * go through a redirect or to a guide that has since closed; it still has
   * to land somewhere.
   */
  archive?: RegExp;
}

export interface Manifest {
  domain: string;
  /** Every path that answers 200 with a page or a file. */
  paths: string[];
  /** Paths that are a redirect page (a former slug), with where they go. */
  moved: Record<string, string>;
  /** Links to the network's other sites: the page they are on and the URL. */
  outbound: Array<{ from: string; url: string; archive?: boolean }>;
}

// ---------------------------------------------------------------------------
// HTML

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

export interface Tag {
  name: string;
  attrs: Record<string, string>;
}

export interface Scan {
  tags: Tag[];
  /** The text of each <title>. */
  titles: string[];
  /** The text of each JSON-LD script, as written. */
  jsonLd: string[];
  ids: Set<string>;
}

const TAG = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Every start tag with its attributes, and the text of the title and the JSON-LD blocks. */
export function scanHtml(html: string): Scan {
  const jsonLd: string[] = [];
  const titles: string[] = [];
  // Script and style bodies are not markup: a "<a href" inside one is text.
  // The opening tag is kept, for a script's src.
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)([\s\S]*?)<\/script>/gi, (_, open: string, body: string) => {
      if (/type\s*=\s*["']?application\/ld\+json/i.test(open)) jsonLd.push(body);
      return open;
    })
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1')
    // The document's title is the one in <head>; an inline SVG has a <title> of its own.
    .replace(/<head\b[\s\S]*?<\/head>/i, (head) =>
      head.replace(/<title\b[^>]*>([\s\S]*?)<\/title>/gi, (_, body: string) => {
        titles.push(decodeEntities(body).trim());
        return '';
      }),
    );
  const tags: Tag[] = [];
  const ids = new Set<string>();
  for (const m of markup.matchAll(TAG)) {
    const attrs: Record<string, string> = {};
    for (const a of (m[2] ?? '').matchAll(ATTR)) {
      attrs[a[1]!.toLowerCase()] = decodeEntities(a[2] ?? a[3] ?? a[4] ?? '');
    }
    const name = m[1]!.toLowerCase();
    tags.push({ name, attrs });
    if (attrs.id) ids.add(attrs.id);
    if (name === 'a' && attrs.name) ids.add(attrs.name);
  }
  return { tags, titles, jsonLd, ids };
}

/** The URLs a page asks a browser or a crawler to fetch or follow. */
export function references(scan: Scan): string[] {
  const out: string[] = [];
  const srcset = (value: string | undefined) => {
    for (const part of (value ?? '').split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) out.push(url);
    }
  };
  for (const { name, attrs } of scan.tags) {
    if (name === 'a' || name === 'area' || name === 'link') {
      if (attrs.href !== undefined) out.push(attrs.href);
      if (name === 'link') srcset(attrs.imagesrcset);
    } else if (name === 'img' || name === 'source') {
      if (attrs.src !== undefined) out.push(attrs.src);
      srcset(attrs.srcset);
    } else if (name === 'script' || name === 'iframe' || name === 'video' || name === 'audio' || name === 'embed') {
      if (attrs.src !== undefined) out.push(attrs.src);
      if (attrs.poster) out.push(attrs.poster);
    } else if (name === 'form') {
      if (attrs.action) out.push(attrs.action);
    } else if (name === 'meta') {
      const key = attrs.property ?? attrs.name ?? '';
      if (/^(og:image|og:url|twitter:image)$/.test(key) && attrs.content) out.push(attrs.content);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Redirects

/**
 * vercel.json's `source` as a regular expression. Only the forms the file
 * uses are understood, the same ones host-files.ts translates; any other
 * throws, because a rule this cannot read is a rule it cannot check.
 */
export function sourcePattern(source: string): RegExp {
  let body = '';
  let rest = source;
  while (rest) {
    let m: RegExpMatchArray | null;
    if ((m = rest.match(/^\{\/\}\?/))) body += '/?';
    else if ((m = rest.match(/^\(\.\*\)/))) body += '.*';
    else if ((m = rest.match(/^:[A-Za-z_]\w*\*/))) body += '.*';
    else if ((m = rest.match(/^:[A-Za-z_]\w*/))) body += '[^/]+';
    else if ((m = rest.match(/^[A-Za-z0-9_\-./~%]+/))) body += m[0].replace(/[.]/g, '\\.');
    else throw new Error(`site-check: cannot read the redirect source "${source}".`);
    rest = rest.slice(m[0].length);
  }
  return new RegExp(`^${body}$`);
}

/** The redirects that apply on one host: the ones conditioned on it, and the ones with no condition. */
export function redirectsFor(redirects: VercelRedirect[], domain: string): VercelRedirect[] {
  return redirects.filter((r) => (r.has ?? []).every((c) => c.type === 'host' && c.value === domain));
}

// ---------------------------------------------------------------------------
// The built files

function walk(dir: string, base = ''): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = `${base}/${name}`;
    if (statSync(full).isDirectory()) out.push(...walk(full, rel));
    else out.push(rel);
  }
  return out;
}

/** The URL path a built file answers at: /x/index.html is /x/. */
export function pathOf(file: string): string {
  return file.endsWith('/index.html') ? file.slice(0, -'index.html'.length) : file;
}

interface Page {
  path: string;
  file: string;
  scan: Scan;
  noindex: boolean;
  /** Where a redirect page (Astro's meta refresh) sends the reader. */
  refresh?: string;
  canonical: string[];
}

function metaContent(scan: Scan, key: string): string[] {
  return scan.tags
    .filter((t) => t.name === 'meta' && (t.attrs.name === key || t.attrs.property === key))
    .map((t) => t.attrs.content ?? '');
}

function readPage(dir: string, file: string): Page {
  const scan = scanHtml(readFileSync(join(dir, file), 'utf8'));
  const refreshTag = scan.tags.find((t) => t.name === 'meta' && t.attrs['http-equiv']?.toLowerCase() === 'refresh');
  const refresh = refreshTag?.attrs.content?.match(/url\s*=\s*(.+)$/i)?.[1]?.trim();
  return {
    path: pathOf(file),
    file,
    scan,
    noindex: metaContent(scan, 'robots').some((c) => /noindex/i.test(c)),
    refresh,
    canonical: scan.tags.filter((t) => t.name === 'link' && t.attrs.rel === 'canonical').map((t) => t.attrs.href ?? ''),
  };
}

// ---------------------------------------------------------------------------
// Structured data

const URL_KEYS = new Set(['url', '@id', 'item', 'image', 'logo', 'sameAs', 'mainEntityOfPage', 'contentUrl', 'target']);
const DATE_KEYS = new Set(['startDate', 'endDate', 'datePublished', 'dateModified', 'validFrom', 'validThrough']);
// A date, or a date and time with seconds optional and an offset or Z optional.
const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;
/** What Google's rich results will not read a type without. */
const REQUIRED: Record<string, string[]> = {
  Event: ['name', 'startDate', 'location'],
  Article: ['headline'],
  NewsArticle: ['headline'],
  BlogPosting: ['headline'],
  BreadcrumbList: ['itemListElement'],
  ItemList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  Organization: ['name'],
  WebSite: ['name', 'url'],
  Place: ['name'],
  PostalAddress: ['addressLocality'],
};

/**
 * One JSON-LD block's problems, and the URLs it names. A block that says
 * something false to a search engine is worse than no block: it is the one
 * place the page is read by a machine that takes it at its word.
 */
export function checkJsonLd(text: string): { problems: string[]; urls: string[] } {
  const problems: string[] = [];
  const urls: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    return { problems: [`does not parse: ${error instanceof Error ? error.message : String(error)}`], urls };
  }
  const roots = Array.isArray(data) ? data : [data];
  for (const root of roots) {
    if (!root || typeof root !== 'object') {
      problems.push('a block that is not an object');
      continue;
    }
    const context = (root as Record<string, unknown>)['@context'];
    if (typeof context !== 'string' || !/^https?:\/\/schema\.org\/?$/.test(context)) {
      problems.push(`@context is ${JSON.stringify(context)}, not https://schema.org`);
    }
  }
  const typesOf = (node: Record<string, unknown>): string[] => {
    const t = node['@type'];
    return Array.isArray(t) ? t.filter((x): x is string => typeof x === 'string') : typeof t === 'string' ? [t] : [];
  };
  const visit = (node: unknown, trail: string, top: boolean): void => {
    if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, `${trail}[${i}]`, top));
      return;
    }
    if (!node || typeof node !== 'object') return;
    const object = node as Record<string, unknown>;
    const keys = Object.keys(object);
    const types = typesOf(object);
    const label = types[0] ? `${trail || 'root'} (${types[0]})` : trail || 'root';
    // {"@id": "..."} alone is a reference to a node declared elsewhere; a
    // @graph holder carries no type of its own.
    const reference = keys.length === 1 && keys[0] === '@id';
    const holder = top && '@graph' in object;
    if (!reference && !holder && types.length === 0) problems.push(`${label}: no @type`);
    for (const type of types) {
      for (const need of REQUIRED[type] ?? []) {
        const value = object[need];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          problems.push(`${label}: ${type} without ${need}`);
        }
      }
    }
    if (types.includes('ItemList') && Array.isArray(object.itemListElement)) {
      const list = object.itemListElement as Array<Record<string, unknown>>;
      if (typeof object.numberOfItems === 'number' && object.numberOfItems !== list.length) {
        problems.push(`${label}: numberOfItems ${object.numberOfItems} but ${list.length} listed`);
      }
    }
    if ((types.includes('ItemList') || types.includes('BreadcrumbList')) && Array.isArray(object.itemListElement)) {
      const positions = (object.itemListElement as Array<Record<string, unknown>>).map((e) => e?.position);
      if (positions.some((p) => p !== undefined) && positions.some((p, i) => p !== i + 1)) {
        problems.push(`${label}: positions are ${JSON.stringify(positions)}, not 1 to ${positions.length}`);
      }
    }
    if (typeof object.startDate === 'string' && typeof object.endDate === 'string' && ISO.test(object.startDate) && ISO.test(object.endDate)) {
      // Compared at the precision both share: a date against a date-time is not earlier for lacking a time.
      const n = Math.min(object.startDate.length, object.endDate.length, 16);
      if (object.endDate.slice(0, n) < object.startDate.slice(0, n)) problems.push(`${label}: endDate ${object.endDate} is before startDate ${object.startDate}`);
    }
    for (const [key, value] of Object.entries(object)) {
      const at = `${label}.${key}`;
      if (value === null || value === '') {
        problems.push(`${at} is empty`);
        continue;
      }
      if (typeof value === 'string' && /\b(undefined|NaN|\[object Object\])\b/.test(value) && key !== 'description' && key !== 'text' && key !== 'articleBody') {
        problems.push(`${at} is ${JSON.stringify(value)}`);
      }
      if (DATE_KEYS.has(key) && typeof value === 'string' && !ISO.test(value)) problems.push(`${at} is ${JSON.stringify(value)}, not an ISO 8601 date`);
      if (URL_KEYS.has(key)) {
        for (const candidate of Array.isArray(value) ? value : [value]) {
          if (typeof candidate !== 'string') continue;
          if (!/^https?:\/\/[^\s/]+(\/\S*)?$/.test(candidate)) problems.push(`${at} is ${JSON.stringify(candidate)}, not an absolute URL`);
          else urls.push(candidate);
        }
      }
      if (key !== '@context') visit(value, `${trail ? `${trail}.` : ''}${key}`, key === '@graph');
    }
  };
  for (const root of roots) visit(root, '', true);
  return { problems, urls };
}

// ---------------------------------------------------------------------------
// The site

const SKIP_SCHEME = /^(mailto|tel|sms|javascript|data|blob|webcal|geo):/i;

/** Every problem in one built site, and its manifest for the network check. */
export function checkSite(input: SiteInput): { problems: Problem[]; manifest: Manifest; pages: number } {
  const { dir, domain, network } = input;
  const origin = `https://${domain}`;
  const problems: Problem[] = [];
  const add = (rule: string, where: string, detail: string) => problems.push({ rule, where, detail });

  const files = walk(dir);
  const fileSet = new Set(files);
  const pages = new Map<string, Page>();
  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    const page = readPage(dir, file);
    pages.set(page.path, page);
  }
  /** A path answers when a file or a page was built for it. */
  const answers = (path: string): boolean => fileSet.has(path) || pages.has(path);

  const mine = redirectsFor(input.redirects, domain).map((r) => ({ ...r, pattern: sourcePattern(r.source) }));
  const redirectAt = (path: string) => mine.find((r) => r.pattern.test(path));

  const outbound: Manifest['outbound'] = [];
  const seenOut = new Set<string>();
  const moved: Record<string, string> = {};

  /**
   * One URL a page names, resolved the way a browser would. `what` says where
   * on the page it was, for the report.
   */
  const follow = (page: Page, raw: string, what: string): void => {
    const sent = input.archive?.test(page.path) ?? false;
    // An @id in structured data is a name for a node, "#org", not a place on a page.
    const names = what === 'structured data';
    const ref = raw.trim();
    if (ref === '' || SKIP_SCHEME.test(ref)) return;
    let url: URL;
    try {
      url = new URL(ref, origin + page.path);
    } catch {
      add('link-malformed', page.path, `${what} "${raw}" is not a URL`);
      return;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    const host = url.hostname.replace(/^www\./, '');
    if (host !== domain) {
      if (!network.has(host)) return;
      if (url.protocol !== 'https:' || url.hostname !== host) add('link-network-form', page.path, `${what} ${ref}: the network's sites are https, without www`);
      if (!network.get(host)) {
        if (!sent) add('link-to-closed-guide', page.path, `${what} ${ref}: no guide is served at ${host}; it redirects elsewhere`);
      } else if (!seenOut.has(`${page.path} ${url}`)) {
        seenOut.add(`${page.path} ${url}`);
        outbound.push({ from: page.path, url: url.toString(), ...(sent ? { archive: true } : {}) });
      }
      return;
    }
    if (url.protocol !== 'https:' || url.hostname !== domain) add('link-own-form', page.path, `${what} ${ref}: this site is https://${domain}`);
    let path: string;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      add('link-malformed', page.path, `${what} "${raw}" is not a URL`);
      return;
    }
    if (!answers(path)) {
      const rule = redirectAt(path);
      if (rule) {
        if (!sent) add('link-to-redirect', page.path, `${what} ${ref} is redirected to ${rule.destination}; link to that`);
      }
      else if (!path.endsWith('/') && pages.has(`${path}/`)) add('link-no-trailing-slash', page.path, `${what} ${ref} costs a redirect; the page is ${path}/`);
      else add('link-broken', page.path, `${what} ${ref}: nothing is built at ${path}`);
      return;
    }
    const target = pages.get(path);
    if (target?.refresh !== undefined && !sent) add('link-to-redirect', page.path, `${what} ${ref} is a redirect page to ${target.refresh}; link to that`);
    if (url.hash.length > 1 && !names && target && target.refresh === undefined) {
      let id = url.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        /* as written */
      }
      // ":~:text=" is a text fragment, which names words, not an element.
      if (!id.startsWith(':~:') && !target.scan.ids.has(id)) add('link-fragment', page.path, `${what} ${ref}: ${path} has no element with id "${id}"`);
    }
  };

  const titles = new Map<string, string[]>();
  const indexable = new Set<string>();

  for (const page of pages.values()) {
    const { scan, path } = page;
    if (page.refresh !== undefined) {
      // A former slug's redirect page: where it goes has to be there, and be the end of the road.
      moved[path] = page.refresh;
      let to: URL | undefined;
      try {
        to = new URL(page.refresh, origin + path);
      } catch {
        add('redirect-page-target', path, `redirects to "${page.refresh}", which is not a URL`);
      }
      if (to && to.hostname === domain) {
        const target = pages.get(decodeURIComponent(to.pathname));
        if (!target && !fileSet.has(decodeURIComponent(to.pathname))) add('redirect-page-target', path, `redirects to ${page.refresh}, which is not built`);
        else if (target?.refresh !== undefined) add('redirect-chain', path, `redirects to ${page.refresh}, which redirects again to ${target.refresh}`);
      } else if (to && network.has(to.hostname)) {
        if (!network.get(to.hostname)) add('link-to-closed-guide', path, `redirects to ${page.refresh}; no guide is served there`);
        else outbound.push({ from: path, url: to.toString() });
      }
      continue;
    }

    if (scan.titles.length !== 1 || !scan.titles[0]) add('title', path, `${scan.titles.length} <title> elements${scan.titles.length === 1 ? ', empty' : ''}`);
    const descriptions = metaContent(scan, 'description');
    if (descriptions.length !== 1 || !descriptions[0]!.trim()) add('description', path, `${descriptions.length} meta descriptions${descriptions.length === 1 ? ', empty' : ''}`);
    if (!scan.tags.some((t) => t.name === 'html' && t.attrs.lang)) add('lang', path, '<html> has no lang');
    if (scan.tags.filter((t) => t.name === 'h1').length !== 1 && !page.noindex) {
      add('h1', path, `${scan.tags.filter((t) => t.name === 'h1').length} <h1> elements; a page has one`);
    }

    // The 404 page answers for every missing URL: it can never be indexable.
    if (path === '/404.html' && !page.noindex) add('noindex-404', path, 'the 404 page is not noindex');

    const self = origin + encodeURI(path);
    if (page.noindex) {
      if (page.canonical.length) add('canonical-on-noindex', path, `noindex, and canonical ${page.canonical[0]}: one says drop the page, the other says index it`);
    } else {
      indexable.add(path);
      if (page.canonical.length !== 1) add('canonical', path, `${page.canonical.length} canonical links; an indexable page has one`);
      else if (page.canonical[0] !== self && page.canonical[0] !== origin + path) add('canonical', path, `canonical is ${page.canonical[0]}, not ${self}`);
      const ogUrl = metaContent(scan, 'og:url');
      if (ogUrl.length !== 1 || (ogUrl[0] !== self && ogUrl[0] !== origin + path)) add('og-url', path, `og:url is ${ogUrl.join(', ') || 'missing'}, not ${self}`);
      const title = scan.titles[0];
      if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
      for (const key of ['og:title', 'og:description', 'og:image', 'twitter:card', 'twitter:image']) {
        if (!metaContent(scan, key).some((c) => c.trim())) add('social-card', path, `no ${key}`);
      }
    }

    // An id twice on one page: the second can never be linked to, and a label or aria reference picks one at random.
    const seen = new Set<string>();
    const twice = new Set<string>();
    for (const t of scan.tags) {
      if (!t.attrs.id) continue;
      if (seen.has(t.attrs.id)) twice.add(t.attrs.id);
      seen.add(t.attrs.id);
    }
    if (twice.size) add('duplicate-id', path, `id used more than once: ${[...twice].join(', ')}`);

    for (const { name, attrs } of scan.tags) {
      if (name === 'a' && attrs.href !== undefined && attrs.href.trim() === '') add('link-empty', path, 'an <a> with an empty href');
      if (name === 'img' && attrs.alt === undefined) add('img-alt', path, `<img src="${attrs.src ?? ''}"> has no alt attribute`);
      if (name === 'a' && attrs.target === '_blank' && attrs.href?.startsWith('http://')) add('link-insecure', path, `link to ${attrs.href} opens over http`);
    }

    // The canonical was judged above, against the page's own URL.
    for (const ref of references({ ...scan, tags: scan.tags.filter((t) => !(t.name === 'link' && t.attrs.rel === 'canonical')) })) follow(page, ref, 'link');

    for (const block of scan.jsonLd) {
      const result = checkJsonLd(block);
      for (const p of result.problems) add('json-ld', path, p);
      for (const url of new Set(result.urls)) follow(page, url, 'structured data');
    }
  }

  for (const [title, where] of titles) {
    if (where.length > 1) add('duplicate-title', where[0]!, `"${title}" is the title of ${where.length} indexable pages: ${where.slice(0, 6).join(', ')}${where.length > 6 ? '…' : ''}`);
  }

  // ---- The sitemap: exactly the indexable pages, each once.
  const listed = new Set<string>();
  if (!fileSet.has('/sitemap-index.xml')) {
    add('sitemap', '/sitemap-index.xml', 'not built');
  } else {
    const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1]!.trim()));
    const now = input.now ?? new Date();
    for (const map of locs(readFileSync(join(dir, 'sitemap-index.xml'), 'utf8'))) {
      const mapPath = map.startsWith(origin) ? map.slice(origin.length) : '';
      if (!mapPath || !fileSet.has(mapPath)) {
        add('sitemap', '/sitemap-index.xml', `lists ${map}, which is not built`);
        continue;
      }
      const xml = readFileSync(join(dir, mapPath), 'utf8');
      for (const entry of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = locs(entry[1]!)[0] ?? '';
        const lastmod = entry[1]!.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
        if (!loc.startsWith(`${origin}/`)) {
          add('sitemap', mapPath, `${loc} is not on ${origin}`);
          continue;
        }
        const path = decodeURIComponent(new URL(loc).pathname);
        if (listed.has(path)) add('sitemap', mapPath, `${loc} is listed twice`);
        listed.add(path);
        const page = pages.get(path);
        if (!page) add('sitemap', mapPath, `${loc} is listed and not built`);
        else if (page.refresh !== undefined) add('sitemap', mapPath, `${loc} is listed and is a redirect page`);
        else if (page.noindex) add('sitemap', mapPath, `${loc} is listed and is noindex`);
        if (redirectAt(path)) add('sitemap', mapPath, `${loc} is listed and vercel.json redirects it`);
        if (!lastmod) add('sitemap-lastmod', mapPath, `${loc} has no lastmod`);
        else if (Number.isNaN(Date.parse(lastmod))) add('sitemap-lastmod', mapPath, `${loc} has lastmod ${lastmod}, not a date`);
        else if (Date.parse(lastmod) > now.getTime() + 36 * 3600 * 1000) add('sitemap-lastmod', mapPath, `${loc} has lastmod ${lastmod}, in the future`);
      }
    }
    for (const path of indexable) {
      if (path === '/404.html') continue;
      if (!listed.has(path)) add('sitemap', path, 'indexable, and not in the sitemap: add it, or mark the page noindex');
    }
  }

  // ---- robots.txt names the sitemap and blocks nothing the sitemap offers.
  if (!fileSet.has('/robots.txt')) {
    add('robots', '/robots.txt', 'not built');
  } else {
    const robots = readFileSync(join(dir, 'robots.txt'), 'utf8');
    const maps = [...robots.matchAll(/^sitemap:\s*(\S+)/gim)].map((m) => m[1]!);
    if (listed.size && !maps.includes(`${origin}/sitemap-index.xml`)) add('robots', '/robots.txt', `does not name ${origin}/sitemap-index.xml`);
    const blocked = [...robots.matchAll(/^disallow:\s*(\S+)/gim)].map((m) => m[1]!);
    for (const path of listed) {
      const by = blocked.find((b) => path.startsWith(b));
      if (by) add('robots', '/robots.txt', `Disallow: ${by} blocks ${path}, which the sitemap lists`);
    }
  }

  // ---- The feeds: every link in them is a page of this site.
  for (const feed of files.filter((f) => /\.(rss|xml)$/.test(f) && !/^\/sitemap-/.test(f))) {
    const xml = readFileSync(join(dir, feed), 'utf8');
    if (!/<rss[\s>]|<feed[\s>]/.test(xml)) continue;
    const feedPage = { path: feed } as Page;
    for (const m of xml.matchAll(/<(?:link|guid)(?:\s[^>]*)?>([^<]+)<\/(?:link|guid)>/g)) {
      const url = decodeEntities(m[1]!.trim());
      if (/^https?:\/\//.test(url)) follow(feedPage, url, 'feed link');
    }
  }

  // ---- vercel.json's redirects on this host. Vercel applies them before it
  // looks for a file, so a rule whose source is a built page hides the page.
  const sources = new Map<string, number>();
  for (const rule of mine) {
    sources.set(rule.source, (sources.get(rule.source) ?? 0) + 1);
    const label = `vercel.json ${rule.source}`;
    for (const path of [...pages.keys(), ...files.filter((f) => !f.endsWith('.html'))]) {
      if (!rule.pattern.test(path)) continue;
      // Over a redirect page the rule is the same move said twice (a retired
      // listing has both a rule here and a line in retired.json); the rule
      // answers first, as a real 308, and nothing is lost. Over a page with
      // content, the content can never be read.
      if (pages.get(path)?.refresh !== undefined) continue;
      add('redirect-hides-page', label, `${path} is built, and this redirect answers before it does`);
      break;
    }
    if (/^https?:\/\//.test(rule.destination)) continue; // another site: scripts/check-network.ts
    if (/[:(*]/.test(rule.destination)) continue; // carries a parameter: no one path to look for
    const path = decodeURIComponent(rule.destination.split(/[?#]/)[0]!);
    const target = pages.get(path);
    if (!answers(path)) {
      const next = redirectAt(path);
      if (next) add('redirect-chain', label, `goes to ${rule.destination}, which ${next.source} redirects again to ${next.destination}`);
      else add('redirect-target', label, `goes to ${rule.destination}, which is not built`);
    } else if (target?.refresh !== undefined) {
      add('redirect-chain', label, `goes to ${rule.destination}, a redirect page to ${target.refresh}`);
    }
  }
  for (const [source, n] of sources) if (n > 1) add('redirect-duplicate', `vercel.json ${source}`, `${n} rules for this host have the same source; only the first is ever used`);

  const manifest: Manifest = {
    domain,
    paths: [...new Set([...files.filter((f) => !f.endsWith('.html')), ...pages.keys()])].sort(),
    moved,
    outbound,
  };
  return { problems, manifest, pages: pages.size };
}

// ---------------------------------------------------------------------------
// The network

/**
 * What only shows once every site is built: a link from one site to a page
 * of another that is not there, and a redirect in vercel.json that crosses
 * to another site and lands on nothing.
 */
export function checkNetwork(manifests: Manifest[], redirects: VercelRedirect[], network: Map<string, boolean>): Problem[] {
  const problems: Problem[] = [];
  const byDomain = new Map(manifests.map((m) => [m.domain, m]));
  const paths = new Map(manifests.map((m) => [m.domain, new Set(m.paths)]));
  /** `sent`: the link is in a record of a sent email, where a redirect is a link that still works. */
  const land = (raw: string, sent = false): { ok: true } | { ok: false; why: string } => {
    const url = new URL(raw);
    const site = byDomain.get(url.hostname);
    if (!site) return { ok: false, why: network.get(url.hostname) ? `${url.hostname} was not built` : `no guide is served at ${url.hostname}` };
    const path = decodeURIComponent(url.pathname);
    if (path in site.moved) return sent ? { ok: true } : { ok: false, why: `${path} on ${site.domain} is a redirect page to ${site.moved[path]}; link to that` };
    if (paths.get(site.domain)!.has(path)) return { ok: true };
    const rule = redirectsFor(redirects, site.domain).find((r) => sourcePattern(r.source).test(path));
    if (rule) return sent ? { ok: true } : { ok: false, why: `${site.domain} redirects ${path} to ${rule.destination}; link to that` };
    if (!path.endsWith('/') && paths.get(site.domain)!.has(`${path}/`)) return { ok: false, why: `the page is ${path}/; without the slash it costs a redirect` };
    return { ok: false, why: `nothing is built at ${path} on ${site.domain}` };
  };
  // One line per missing page, however many pages link to it: the network
  // bar is on every page, so one bad link there is thousands of findings.
  const bad = new Map<string, { why: string; from: string[] }>();
  for (const site of manifests) {
    for (const link of site.outbound) {
      const host = new URL(link.url).hostname;
      // A live site that was not built: the caller says so once (check-network.ts), not per link.
      if (!byDomain.has(host) && network.get(host)) continue;
      const result = land(link.url, link.archive);
      if (result.ok) continue;
      const key = link.url.split(/[?#]/)[0]!;
      const entry = bad.get(key) ?? { why: result.why, from: [] };
      entry.from.push(`${site.domain}${link.from}`);
      bad.set(key, entry);
    }
  }
  for (const [url, { why, from }] of bad) {
    problems.push({ rule: 'cross-site-link', where: from[0]!, detail: `links to ${url}: ${why}${from.length > 1 ? ` (and ${from.length - 1} more page${from.length === 2 ? ' links' : 's link'} there)` : ''}` });
  }
  for (const rule of redirects) {
    if (!/^https?:\/\//.test(rule.destination)) continue;
    const host = (rule.has ?? []).find((c) => c.type === 'host')?.value ?? 'every host';
    const where = `vercel.json ${host}${rule.source}`;
    let url: URL;
    try {
      url = new URL(rule.destination);
    } catch {
      problems.push({ rule: 'redirect-target', where, detail: `destination ${rule.destination} is not a URL` });
      continue;
    }
    if (!network.has(url.hostname)) continue; // off the network: not ours to check
    if (!byDomain.has(url.hostname) && network.get(url.hostname)) continue; // live and not built: reported once by the caller
    // A parameter in the path stands for many pages; the site it lands on still has to be a guide.
    if (/\/:[A-Za-z_]/.test(url.pathname)) {
      if (!byDomain.has(url.hostname)) problems.push({ rule: 'redirect-target', where, detail: `goes to ${rule.destination}: no guide is built at ${url.hostname}` });
      continue;
    }
    const result = land(rule.destination);
    if (!result.ok) problems.push({ rule: 'redirect-target', where, detail: `goes to ${rule.destination}: ${result.why}` });
  }
  return problems;
}

/** The report, grouped by rule, the way a person fixes it: one cause at a time. */
export function formatProblems(problems: Problem[], limit = 12): string {
  const groups = new Map<string, Problem[]>();
  for (const p of problems) groups.set(p.rule, [...(groups.get(p.rule) ?? []), p]);
  const lines: string[] = [];
  for (const [rule, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`\n${rule} (${list.length})`);
    for (const p of list.slice(0, limit)) lines.push(`  ${p.where}: ${p.detail}`);
    if (list.length > limit) lines.push(`  … and ${list.length - limit} more (--all prints every one)`);
  }
  return lines.join('\n');
}

/** Whether a folder holds a built site. */
export function isBuilt(dir: string): boolean {
  return existsSync(join(dir, 'index.html'));
}

export const manifestName = (domain: string): string => `${domain}.json`;
