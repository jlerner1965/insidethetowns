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
  const lyons = redirectsFor('insidelyons.com', real);
  for (const path of ['/explore', '/eat-shop', '/stay', '/outdoors', '/itineraries', '/plan-a-visit', '/our-story', '/civic', '/community']) {
    assert.match(lyons, new RegExp(`^${path} `, 'm'), path);
  }
  assert.doesNotMatch(redirectsFor('insideniwot.com', real), /eat-shop|our-story|civic/);
});
