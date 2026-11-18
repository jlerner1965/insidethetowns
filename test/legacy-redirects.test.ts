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
import { answer, lookup } from '../api/legacy.ts';
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
  for (const t of legacy) {
    assert.deepEqual(vercel.redirects.filter((r) => hostOf(r) === t.domain), [], `${t.domain}: a redirect rule would answer before the function`);
    const rewrites = (vercel.rewrites ?? []).filter((r) => hostOf(r) === t.domain);
    assert.deepEqual(rewrites, [{ source: '/:path*', has: [{ type: 'host', value: t.domain }], destination: '/api/legacy' }], `${t.domain}: one rewrite, every path`);
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
