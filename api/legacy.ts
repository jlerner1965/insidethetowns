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
import { readFileSync } from 'node:fs';

type Table = Record<string, { page: string; paths: Record<string, string | 0>; sitemap?: string; sitemapIndex?: string }>;
// Read beside this file, once per instance: the URL form is what Vercel's
// file tracer follows, so the map ships with the function.
let loaded: Table | undefined;
const table = (): Table => (loaded ??= JSON.parse(readFileSync(new URL('./legacy-map.json', import.meta.url), 'utf8')) as Table);

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

export function answer(host: string, pathname: string): Response {
  const entry = table()[host];
  if (!entry) return new Response('Not found', { status: 404 });
  const cache = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' };
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
  return new Response(null, { status: 301, headers: { Location: found ?? entry.page, ...cache } });
}

export function GET(request: Request): Response {
  const url = new URL(request.url);
  return answer(hostOf(request.headers), url.pathname);
}

export const HEAD = GET;
