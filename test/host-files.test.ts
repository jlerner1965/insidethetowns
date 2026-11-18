/**
 * vercel.json is shared by every site; the _redirects file it is exported to
 * belongs to one. A redirect scoped to one host must reach only that site.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { hostFiles } from '../src/integrations/host-files.ts';
import { allTowns, domainMoved } from '../src/config/index.ts';

const movedDomain = (slug: string) => domainMoved(allTowns.find((t) => t.slug === slug)!);
/** The rewrite that sends every path on a moved domain to api/legacy.ts (scripts/fold-rules.ts). */
const rewriteFor = (real: { rewrites?: Array<{ source: string; destination: string; has?: Array<{ type: string; value: string }> }> }, host: string) =>
  (real.rewrites ?? []).find((r) => r.has?.some((h) => h.type === 'host' && h.value === host));

const config = {
  redirects: [
    { source: '/compare{/}?', destination: '/moving/', permanent: true },
    { source: '/civic{/}?', has: [{ type: 'host', value: 'insidelyons.com' }], destination: '/articles/who-governs-lyons/', permanent: true },
  ],
};

const redirectsFor = (domain: string, cfg: object = config) => {
  const dir = mkdtempSync(join(tmpdir(), 'host-files-'));
  try {
    const hook = hostFiles(cfg, domain).hooks['astro:build:done'] as (o: object) => void;
    hook({ dir: pathToFileURL(dir + '/'), logger: { info() {} } });
    return readFileSync(join(dir, '_redirects'), 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("a host-scoped redirect reaches its own site's _redirects and no other's", () => {
  assert.match(redirectsFor('insidelyons.com'), /^\/civic {2}\/articles\/who-governs-lyons\/ {2}301$/m);
  assert.doesNotMatch(redirectsFor('insideniwot.com'), /civic/);
  for (const domain of ['insidelyons.com', 'insideniwot.com']) assert.match(redirectsFor(domain), /^\/compare {2}\/moving\/ {2}301$/m);
});

test('a condition the exported file cannot express stops the build', () => {
  const cfg = { redirects: [{ source: '/x', destination: '/y', has: [{ type: 'cookie', value: 'a' }] }] };
  assert.throws(() => redirectsFor('insidelyons.com', cfg), /cannot translate a "cookie" condition/);
});

test('the real vercel.json gives Lyons the old explorelyons paths and Niwot none of them', () => {
  const real = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  if (movedDomain('lyons')) {
    // Lyons's domain has moved into the hub (src/config/guide-move.ts): no rule on its host or on explorelyons.com;
    // api/legacy.ts answers both from the map its build writes, the old explorelyons paths included.
    assert.doesNotMatch(redirectsFor('insidelyons.com', real), /^\/(explore|eat-shop|our-story|civic) /m);
    for (const host of ['insidelyons.com', 'explorelyons.com']) assert.deepEqual(rewriteFor(real, host)?.destination, '/api/legacy/?legacy_path=/$1', `${host}: the rewrite to the function`);
    return;
  }
  const lyons = redirectsFor('insidelyons.com', real);
  for (const path of ['/explore', '/eat-shop', '/outdoors', '/itineraries', '/plan-a-visit', '/our-story', '/civic', '/community']) {
    assert.match(lyons, new RegExp(`^${path} `, 'm'), path);
  }
  // /stay/ is a page on every guide with lodging since 20 October 2026, so the
  // old explorelyons /stay/ rule is gone: a host rule would answer before the page.
  assert.doesNotMatch(lyons, /^\/stay /m);
  assert.doesNotMatch(redirectsFor('insideniwot.com', real), /eat-shop|our-story|civic/);
});

test('a catch-all redirect also matches the trailing-slash URLs every page has', () => {
  // With trailingSlash on, every page URL ends in "/", and Vercel's
  // "/:path*" does not match one: on 5 October insidefirestone.com/about/
  // served Carbon Valley's page and /anything/ a 404 instead of redirecting.
  // "/(.*)" matches either form, and exports as "/*".
  const real = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const r of real.redirects as Array<{ source: string }>) {
    assert.doesNotMatch(r.source, /:[A-Za-z_]\w*\*$/, `${r.source}: use "/(.*)" so a trailing slash still matches`);
  }
  // Firestone's domain goes to the Carbon Valley guide, which covers it
  // (12 November 2026, the restructure brief; Inside Frederick from 8
  // November, the hub's home page from 2 November). Once Carbon Valley's
  // domain has moved, both forward through api/legacy.ts from its map.
  if (movedDomain('carbon-valley')) {
    for (const host of ['insidefirestone.com', 'insidefrederickco.com', 'carbonvalleyguide.com']) assert.deepEqual(rewriteFor(real, host)?.source, '/(.*)', `${host}: every path to the function`);
    return;
  }
  const firestone = redirectsFor('insidefirestone.com', real);
  assert.match(firestone, /^\/\* {2}https:\/\/carbonvalleyguide\.com\/ {2}301$/m);
  // Frederick's keeps the path: everything Inside Frederick held is at the
  // same address on the Carbon Valley guide.
  const frederick = redirectsFor('insidefrederickco.com', real);
  assert.match(frederick, /^\/\* {2}https:\/\/carbonvalleyguide\.com\/:splat {2}301$/m);
});
