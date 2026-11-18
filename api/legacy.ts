/**
 * Every request to a folded guide's domain (the move of 17 November 2026).
 *
 * The eighteen domains in api/legacy-map.json (insidelongmontco.com,
 * insidelovelandco.com, insidefortcollins.com, insideestespark.com,
 * insidegolden.com, insideelizabeth.com, insideidahosprings.com and the
 * rest) each stay on their own Vercel project, which builds nothing but
 * this function (scripts/run.ts); vercel.json rewrites every path on each
 * host here. The answer is one hop, server side:
 *
 * - 301 to the address on insidethetowns.com that docs/migration/redirect-map.csv
 *   gives the path (a section page, a kept page, a tradition page, or the
 *   town's page);
 * - 410 where the map says so: a past one-time event with no annual page, a
 *   closed or unverifiable place, a page with no town-specific content, a
 *   high-school sports page;
 * - the pre-restructure sitemap at its original addresses, and a robots.txt
 *   that points to it, so search engines re-read every old address and see
 *   where it went. Remove the two after 2027-05-17.
 * - an address not in the map: 301 to the town's page, as the catch-all did.
 *
 * Keep these redirects live and the domains renewed indefinitely, at
 * minimum until 2027-11-17 (the owner's brief).
 *
 * The map is written by `node scripts/migration/redirect-map.ts` from the
 * CSV; test/legacy-redirects.test.ts holds the two together.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type Table = Record<string, { page: string; paths: Record<string, string | 0>; sitemap?: string; sitemapIndex?: string }>;
// Read beside this file, once per instance: the URL form is what Vercel's
// file tracer follows, so the map ships with the function.
// vercel.json's `functions` entry includes it (includeFiles), at the same
// path from the project root, which is the function's working directory.
let loaded: Table | undefined;
function table(): Table {
  if (loaded) return loaded;
  const beside = new URL('./legacy-map.json', import.meta.url);
  const file = existsSync(beside) ? beside : join(process.cwd(), 'api', 'legacy-map.json');
  return (loaded = JSON.parse(readFileSync(file, 'utf8')) as Table);
}

/**
 * How long an answer is kept. The browser: an hour. Vercel's CDN: a day,
 * so a repeat request for the same old address is answered without the
 * function; a deployment of the project starts the cache afresh, so a
 * change to the map is live as soon as it deploys. `Vercel-CDN-Cache-Control`
 * and `CDN-Cache-Control` are read by the CDN in place of `Cache-Control`,
 * which vercel.json's catch-all header rule may set for the browser.
 */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=3600',
  'CDN-Cache-Control': 'public, max-age=86400',
  'Vercel-CDN-Cache-Control': 'public, max-age=86400',
} as const;

const GONE_HTML = (page: string, name: string) =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>This page is gone</title><meta name="robots" content="noindex"><body style="font-family:system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem;line-height:1.5"><h1>This page is gone</h1><p>It was on a guide that has closed, and there is no page on Inside the Towns that stands for it.</p><p><a href="${page}">${name}: annual events and outdoor dates</a></p></body></html>`;

/** The host the reader asked for, without its www. */
export function hostOf(headers: Headers): string {
  const raw = headers.get('x-forwarded-host') ?? headers.get('host') ?? '';
  return raw.split(',')[0]!.trim().toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');
}

/** The map's answer for a path: a destination, 0 for gone, or undefined for an address it does not know. */
export function lookup(entry: Table[string], pathname: string): string | 0 | undefined {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  const candidates = [path, path.endsWith('/') ? path.slice(0, -1) : `${path}/`, path.toLowerCase(), path.toLowerCase().endsWith('/') ? path.toLowerCase().slice(0, -1) : `${path.toLowerCase()}/`];
  for (const c of candidates) if (c in entry.paths) return entry.paths[c];
  return undefined;
}

/** A destination with the reader's query string on it, ahead of any fragment, as Vercel's own redirect rules carry it. */
export function withQuery(location: string, search: string): string {
  if (!search || search === '?') return location;
  const at = location.indexOf('#');
  const [base, hash] = at === -1 ? [location, ''] : [location.slice(0, at), location.slice(at)];
  return `${base}${base.includes('?') ? `&${search.slice(1)}` : search}${hash}`;
}

export function answer(host: string, pathname: string, search = ''): Response {
  const entry = table()[host];
  if (!entry) return new Response('Not found', { status: 404 });
  const cache = CACHE_HEADERS;
  if (pathname === '/robots.txt') {
    // Remove after 2027-05-17, with the sitemap below.
    return new Response(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap-index.xml\n`, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...cache } });
  }
  if (pathname === '/sitemap-index.xml' && entry.sitemapIndex) return new Response(entry.sitemapIndex, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', ...cache } });
  if (pathname === '/sitemap-0.xml' && entry.sitemap) return new Response(entry.sitemap, { status: 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', ...cache } });
  const found = lookup(entry, pathname);
  if (found === 0) {
    const name = decodeURIComponent(entry.page.split('/').filter(Boolean).pop()!).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return new Response(GONE_HTML(entry.page, name), { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8', ...cache } });
  }
  return new Response(null, { status: 301, headers: { Location: withQuery(found ?? entry.page, search), ...cache } });
}

/**
 * The path the reader asked for. vercel.json's rewrite passes it as
 * `legacy_path` (`/(.*)` → `/api/legacy/?legacy_path=/$1`, Vercel's
 * own pattern for redirects answered by a function), since the request
 * this function sees may carry the rewritten address. The original query
 * string rides along: it does not change which page the answer names, and
 * it is carried onto the 301's Location, as Vercel's own redirect rules
 * carry it (a newsletter's `utm_` tags reach the hub's analytics).
 */
export function requestedPath(url: URL): string {
  const given = url.searchParams.get('legacy_path');
  if (given !== null) return given.startsWith('/') ? given : `/${given}`;
  return url.pathname.startsWith('/api/legacy') ? '/' : url.pathname;
}

/** The reader's own query string, without the rewrite's parameter. */
export function requestedSearch(url: URL): string {
  const params = new URLSearchParams(url.search);
  params.delete('legacy_path');
  params.delete('legacy_host');
  // Vercel's rule converter adds the `has` condition's capture to the
  // rewritten query (`&host=$host`; @vercel/routing-utils): it is the
  // platform's, not the reader's, and never rides onto the Location.
  params.delete('host');
  params.delete('path');
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}

/**
 * The folded domain the request is for: its Host. On a preview deployment
 * only (VERCEL_ENV "preview"), `?legacy_host=insidegolden.com` stands in for
 * it, so the map can be tried on Vercel before a merge: a preview's own
 * address is no folded domain. Production ignores the parameter.
 */
export function requestedHost(url: URL, headers: Headers, env: Record<string, string | undefined> = process.env): string {
  const given = url.searchParams.get('legacy_host');
  return env.VERCEL_ENV === 'preview' && given ? given.toLowerCase().replace(/^www\./, '') : hostOf(headers);
}

export function GET(request: Request): Response {
  const url = new URL(request.url);
  return answer(requestedHost(url, request.headers), requestedPath(url), requestedSearch(url));
}

export const HEAD = GET;
