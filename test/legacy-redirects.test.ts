/**
 * The folded domains' answers (the move of 17 November 2026): api/legacy.ts
 * and api/legacy-map.json, written from docs/migration/redirect-map.csv by
 * scripts/migration/redirect-map.ts, and vercel.json's part in it.
 *
 * - every folded guide (`section` on its config) has no redirect rule in
 *   vercel.json and one rewrite, `/:path*` to /api/legacy, so the function
 *   answers every path on its host;
 * - the map and the CSV agree: each 301 row is in the table with its
 *   destination on the hub, each 410 row is 0, each served row is absent
 *   (the function serves the sitemap and robots.txt itself);
 * - no destination is a folded domain, a 410 address, or a two-hop address
 *   (a redirect stub's target, or a path the hub answers with a redirect);
 * - the function's lookup finds a path with or without its slash, and an
 *   unknown path goes to the town's page.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allTowns } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';
import { answer, CACHE_HEADERS, lookup, requestedHost, requestedPath, requestedSearch, withQuery } from '../api/legacy.ts';
import { readCsv } from '../scripts/migration/shared.ts';
import map from '../api/legacy-map.json' with { type: 'json' };

type Rule = { source: string; destination: string; has?: Array<{ type: string; value?: string }> };
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as { redirects: Rule[]; rewrites?: Rule[] };
const hostOf = (r: Rule) => r.has?.find((h) => h.type === 'host')?.value;
const legacy = allTowns.filter((t) => t.hubPage && t.section);
const rows = readCsv(new URL('../docs/migration/redirect-map.csv', import.meta.url).pathname);
const table = map as Record<string, { page: string; paths: Record<string, string | 0>; sitemap?: string }>;

test('eighteen folded guides keep their pages on the hub, each with its mode', () => {
  assert.equal(legacy.length, 18);
  assert.deepEqual(legacy.filter((t) => t.section!.mode === 'full').map((t) => t.slug).sort(), ['estes-park', 'fortcollins', 'longmont', 'loveland']);
  for (const t of legacy) assert.equal(t.status, 'redirect', `${t.slug}: the domain still only redirects`);
});

test('vercel.json: no redirect rule for a folded domain, and one rewrite each to api/legacy.ts', () => {
  assert.deepEqual((vercel as { functions?: unknown }).functions, { 'api/legacy.ts': { includeFiles: 'api/legacy-map.json' } }, 'the map ships with the function');
  for (const t of legacy) {
    assert.deepEqual(vercel.redirects.filter((r) => hostOf(r) === t.domain), [], `${t.domain}: a redirect rule would answer before the function`);
    const rewrites = (vercel.rewrites ?? []).filter((r) => hostOf(r) === t.domain);
    assert.deepEqual(rewrites, [{ source: '/:path*', has: [{ type: 'host', value: t.domain }], destination: '/api/legacy/?legacy_path=/:path*' }], `${t.domain}: one rewrite, every path, the path passed on; to the function's slashed address, the only one Vercel serves it at with trailingSlash`);
  }
  // No redirect anywhere points at a folded domain.
  const folded = new Set(legacy.map((t) => t.domain));
  for (const r of vercel.redirects) {
    const host = r.destination.match(/^https?:\/\/([^/]+)/)?.[1]?.replace(/^www\./, '');
    assert.ok(!host || !folded.has(host), `${hostOf(r) ?? '*'}${r.source} → ${r.destination}: a folded domain`);
  }
});

test('the map holds every host and every row of the CSV, and nothing else', () => {
  assert.deepEqual(Object.keys(table).sort(), legacy.map((t) => t.domain).sort());
  const byHost = new Map<string, number>();
  for (const r of rows) {
    const entry = table[r.host!];
    assert.ok(entry, `${r.host}: not in the map`);
    assert.equal(entry!.page, `https://${hub.domain}/${legacy.find((t) => t.domain === r.host)!.hubPage!.town}/`);
    if (r.status === '200') {
      assert.ok(['/sitemap-index.xml', '/sitemap-0.xml', '/robots.txt'].includes(r.old_path!), `${r.host}${r.old_path}: only the sitemap and robots.txt are served`);
      assert.ok(!(r.old_path! in entry!.paths));
      continue;
    }
    byHost.set(r.host!, (byHost.get(r.host!) ?? 0) + 1);
    const got = entry!.paths[r.old_path!];
    if (r.status === '410') assert.equal(got, 0, `${r.host}${r.old_path}: 410 in the CSV`);
    else {
      assert.equal(r.status, '301');
      assert.equal(got, r.destination!.startsWith('http') ? r.destination : `https://${hub.domain}${r.destination}`, `${r.host}${r.old_path}`);
    }
    assert.ok(r.reason!.length > 3, `${r.host}${r.old_path}: a reason`);
  }
  for (const [host, n] of byHost) assert.equal(Object.keys(table[host]!.paths).length, n, `${host}: paths in the map and rows in the CSV`);
});

test('every destination is on the hub and is not itself an old address that redirects or is gone', () => {
  const folded = new Set(legacy.map((t) => t.domain));
  const gone = new Set(rows.filter((r) => r.status === '410').map((r) => `${r.host}${r.old_path}`));
  for (const r of rows.filter((r) => r.status === '301')) {
    const url = new URL(r.destination!, `https://${hub.domain}`);
    assert.equal(url.hostname, hub.domain, `${r.host}${r.old_path} → ${r.destination}: off the hub`);
    assert.ok(!folded.has(url.hostname));
    assert.ok(!gone.has(`${r.host}${url.pathname}`), `${r.host}${r.old_path} → ${r.destination}: a 410 address`);
    assert.doesNotMatch(url.pathname, /\/(?:this-week|this-weekend|updates)\/$/, `${r.host}${r.old_path} → ${r.destination}: a moved page`);
    // The hub's own redirects (src/lib/hub-moved.ts) would make it two hops.
    assert.ok(!vercel.redirects.some((x) => hostOf(x) === hub.domain && x.source.replace(/\{\/\}\?$/, '/') === url.pathname), `${r.host}${r.old_path} → ${r.destination}: the hub redirects it`);
  }
});

test('the function answers 301 to the mapped page, 410 where the map says so, the sitemap and robots.txt as files, and the town page for anything else', () => {
  const golden = table['insidegolden.com']!;
  const kept = Object.entries(golden.paths).find(([, v]) => v !== 0)!;
  assert.equal(lookup(golden, kept[0]), kept[1]);
  assert.equal(lookup(golden, kept[0].replace(/\/$/, '')), kept[1], 'without its slash');
  const r301 = answer('insidegolden.com', kept[0]);
  assert.equal(r301.status, 301);
  assert.equal(r301.headers.get('location'), kept[1]);
  const [gonePath] = Object.entries(golden.paths).find(([, v]) => v === 0)!;
  assert.equal(answer('insidegolden.com', gonePath).status, 410);
  assert.equal(answer('insidegolden.com', '/no-such-page/').status, 301);
  assert.equal(answer('insidegolden.com', '/no-such-page/').headers.get('location'), golden.page);
  assert.equal(answer('insidegolden.com', '/').headers.get('location'), golden.page);
  assert.equal(answer('insidegolden.com', '/robots.txt').status, 200);
  assert.match(answer('insidegolden.com', '/robots.txt').headers.get('content-type') ?? '', /text\/plain/);
  assert.equal(answer('insidegolden.com', '/sitemap-0.xml').status, 200);
  assert.ok(golden.sitemap!.includes('<loc>https://insidegolden.com/'));
  assert.equal(answer('insidethetowns.com', '/golden/').status, 404, 'not a folded host');
});

test('the brief’s named addresses', () => {
  const to = (host: string, path: string) => table[host]!.paths[path];
  assert.equal(to('insidelongmontco.com', '/events/light-up-longmont-holiday-lights-stroll-2026-11-21/'), `https://${hub.domain}/longmont/events/light-up-longmont/`);
  assert.equal(to('insidelongmontco.com', '/events/light-up-longmont/'), `https://${hub.domain}/longmont/events/light-up-longmont/`);
  assert.equal(to('insidelongmontco.com', '/eat-drink/'), `https://${hub.domain}/longmont/eat-drink/`);
  assert.equal(to('insidelongmontco.com', '/this-week/'), `https://${hub.domain}/longmont/events/`);
  assert.equal(to('insidelongmontco.com', '/sports/'), 0);
  assert.equal(to('insidegolden.com', '/events/trick-or-treat-street/'), `https://${hub.domain}/golden/trick-or-treat-street/`);
  assert.equal(to('insidegolden.com', '/events/olde-golden-candlelight-walk/'), `https://${hub.domain}/golden/candlelight-walk/`);
  assert.equal(to('insideidahosprings.com', '/events/georgetown-christmas-market-2026-12-05/'), `https://${hub.domain}/georgetown/christmas-market/`);
  assert.equal(to('insideestespark.com', '/places/'), `https://${hub.domain}/estes-park/directory/`, 'a stub for /directory/: where its target goes, one hop');
});

test('the path the reader asked for: from the rewrite’s parameter, with or without its slash; a query string changes the page nothing and is carried on', () => {
  const at = (u: string) => requestedPath(new URL(u, 'https://insidegolden.com'));
  assert.equal(at('/api/legacy?legacy_path=/events/trick-or-treat-street'), '/events/trick-or-treat-street');
  assert.equal(at('/api/legacy?legacy_path=/'), '/');
  assert.equal(at('/api/legacy?legacy_path=/events/trick-or-treat-street&utm_source=newsletter'), '/events/trick-or-treat-street');
  assert.equal(at('/api/legacy'), '/', 'no parameter: the home page');
  // The reader's query string is carried onto the Location, ahead of a fragment; the page is the same.
  const q = new URL('/api/legacy?legacy_path=/events/trick-or-treat-street/&utm_source=newsletter', 'https://insidegolden.com');
  assert.equal(requestedSearch(q), '?utm_source=newsletter');
  assert.equal(answer('insidegolden.com', requestedPath(q), requestedSearch(q)).headers.get('location'), 'https://insidethetowns.com/golden/trick-or-treat-street/?utm_source=newsletter');
  assert.equal(withQuery('https://insidethetowns.com/longmont/#traditions', '?a=1'), 'https://insidethetowns.com/longmont/?a=1#traditions');
  assert.equal(withQuery('https://insidethetowns.com/golden/', ''), 'https://insidethetowns.com/golden/');
  assert.equal(at('/events/x/'), '/events/x/', 'no rewrite parameter: the request’s own path');
  const to = (path: string) => {
    const r = answer('insidegolden.com', path);
    return `${r.status} ${r.headers.get('location') ?? ''}`;
  };
  for (const path of ['/events/trick-or-treat-street/', '/events/trick-or-treat-street', '/events/trick-or-treat-street-2026-10-30/', '/events/trick-or-treat-street-2026-10-30', '/EVENTS/Trick-or-Treat-Street/']) {
    assert.equal(to(path), '301 https://insidethetowns.com/golden/trick-or-treat-street/', path);
  }
});

test('every answer carries the CDN’s cache headers: a 301, a 410, the town page for an unknown path, the sitemap and robots.txt', () => {
  const golden = table['insidegolden.com']!;
  const [gonePath] = Object.entries(golden.paths).find(([, v]) => v === 0)!;
  for (const path of ['/events/trick-or-treat-street/', gonePath, '/no-such-page/', '/sitemap-0.xml', '/robots.txt']) {
    const r = answer('insidegolden.com', path);
    for (const [k, v] of Object.entries(CACHE_HEADERS)) assert.equal(r.headers.get(k), v, `${path}: ${k}`);
  }
  assert.match(CACHE_HEADERS['Vercel-CDN-Cache-Control'], /max-age=\d+/);
});

test('a place answers 410 only where it is closed; one whose source could not be read is kept, noindex, re-check pending', () => {
  for (const r of rows.filter((r) => r.status === '410' && /^\/places\//.test(r.old_path!))) assert.match(r.reason!, /^closed/, `${r.host}${r.old_path}: ${r.reason}`);
  const pending = table['insideblackhawk.com']!.paths['/places/monarch-casino-resort-spa/'];
  assert.equal(pending, `https://${hub.domain}/black-hawk/places/monarch-casino-resort-spa/`);
  // The Black Hawk listings the Clear Creek guide carried from 20 October to 2 November.
  assert.equal(table['insideidahosprings.com']!.paths['/places/monarch-casino-resort-spa/'], pending);
});

test('Boo Bash on Main and the Stampede: the owner’s two Elizabeth calls of 17 November 2026', () => {
  const to = (path: string) => table['insideelizabeth.com']!.paths[path];
  assert.equal(to('/events/boo-bash-on-main/'), `https://${hub.domain}/elizabeth/boo-bash-on-main/`);
  assert.equal(to('/events/boo-bash-on-main-2026/'), `https://${hub.domain}/elizabeth/boo-bash-on-main/`);
  const stampede = readFileSync(new URL('../content/hub/traditions/elizabeth-stampede-rodeo.md', import.meta.url), 'utf8');
  assert.match(stampede, /- year: 2027\n    status: confirmed\n    date: 2027-06-03\n    endDate: 2027-06-06\n/);
  // The Trick or Treat Train stays gone, on the owner's word.
  assert.equal(table['insideidahosprings.com']!.paths['/events/trick-or-treat-train-2026-10-30/'], 0);
});

test('a preview may name the folded domain to try; production answers the Host it was asked on', () => {
  const url = new URL('https://insidelyons-abc.vercel.app/api/legacy?legacy_path=/&legacy_host=insidegolden.com');
  const headers = new Headers({ host: 'insidelyons-abc.vercel.app' });
  assert.equal(requestedHost(url, headers, { VERCEL_ENV: 'preview' }), 'insidegolden.com');
  assert.equal(requestedHost(url, headers, { VERCEL_ENV: 'production' }), 'insidelyons-abc.vercel.app');
  assert.equal(requestedHost(url, new Headers({ host: 'www.insidegolden.com' }), {}), 'insidegolden.com');
  assert.equal(requestedSearch(url), '', 'neither parameter is carried onto the Location');
});

test('a kept place past its check window becomes re-check pending, not a 404: the sitemap rule reads the same window as the gate', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');
  const { stalePlaceSlugs, recheckPendingSlugs } = await import('../src/lib/raw-places.ts');
  const { placeExclusion } = await import('../src/lib/freshness.ts');
  const root = mkdtempSync(join(tmpdir(), 'stale-places-'));
  mkdirSync(join(root, 'x', 'places'), { recursive: true });
  const file = (slug: string, fm: string) => writeFileSync(join(root, 'x', 'places', `${slug}.md`), `---\ntitle: "${slug}"\n${fm}\n---\n`);
  file('old', 'verified: "2026-08-01"');
  file('fresh', 'verified: "2026-11-10"');
  file('old-closed', 'verified: "2026-08-01"\nstatus: closed');
  file('old-pending', 'verified: "2026-08-01"\nrecheckPending: "blocked"');
  const now = new Date('2026-11-17T19:00:00-07:00');
  assert.deepEqual([...stalePlaceSlugs('x', 90, root, now)], ['old']);
  assert.deepEqual([...recheckPendingSlugs('x', root)], ['old-pending']);
  // The gate agrees: the stale one is what it would cut for age; a re-check pending one it keeps.
  assert.equal(placeExclusion({ source: 'https://a.example/', verified: new Date('2026-08-01T12:00:00-06:00') }, 'front-range', now)?.reason, 'stale');
  assert.equal(placeExclusion({ source: 'https://a.example/', verified: new Date('2026-08-01T12:00:00-06:00'), recheckPending: 'blocked' }, 'front-range', now), null);
});
