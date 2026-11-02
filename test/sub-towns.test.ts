import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subTownLabel, subTownList, subTownsOf } from '../src/lib/sub-towns.ts';
import { towns } from '../src/config/towns/registry.ts';

test('a sub-town slug reads as a name', () => {
  assert.equal(subTownLabel('frederick'), 'Frederick');
  assert.equal(subTownLabel('fort-lupton'), 'Fort Lupton');
});

test('a single-town guide has no sub-towns and no list', () => {
  assert.deepEqual(subTownsOf({}), []);
  assert.equal(subTownList({}), '');
});

test('Clear Creek covers Idaho Springs and Georgetown; the closed Carbon Valley guide lists no sections, and Frederick is one town', () => {
  const cc = towns.find((t) => t.slug === 'idaho-springs');
  assert.ok(cc, 'idaho-springs is configured');
  assert.deepEqual([...cc.subTowns!], ['idaho-springs', 'georgetown']);
  assert.equal(subTownList(cc), 'Idaho Springs and Georgetown');
  // Carbon Valley (Frederick, Firestone, Dacono and Fort Lupton) closed on 2 November 2026.
  assert.equal(towns.find((t) => t.slug === 'carbon-valley')!.subTowns, undefined);
  assert.equal(subTownList(towns.find((t) => t.slug === 'frederick')!), '');
});

test('Windsor covers itself and Severance', () => {
  const windsor = towns.find((t) => t.slug === 'windsor');
  assert.deepEqual([...windsor!.subTowns!], ['windsor', 'severance']);
  assert.equal(subTownList(windsor!), 'Windsor and Severance');
});

test('every sub-town slug is URL-safe and distinct from a route the guide already has', () => {
  const RESERVED = new Set(['events', 'places', 'articles', 'guides', 'eat-drink', 'things-to-do', 'directory', 'moving-here', 'search', 'about', 'contact', 'this-weekend', 'correct', 'thanks', 'submit-event', 'for-businesses', 'privacy', 'credits', 'editorial', 'families', 'get-involved', 'living-here', 'updates', 'people', 'sports']);
  for (const t of towns) {
    for (const slug of t.subTowns ?? []) {
      assert.match(slug, /^[a-z][a-z0-9-]*$/, `${t.slug}: ${slug}`);
      assert.ok(!RESERVED.has(slug), `${t.slug}: ${slug} collides with a page the guide already has`);
    }
  }
});
