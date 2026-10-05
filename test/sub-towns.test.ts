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

test('Carbon Valley covers Frederick, Firestone and Dacono, in that order', () => {
  const cv = towns.find((t) => t.slug === 'carbon-valley');
  assert.ok(cv, 'carbon-valley is configured');
  assert.deepEqual([...cv.subTowns!], ['frederick', 'firestone', 'dacono']);
  assert.equal(subTownList(cv), 'Frederick, Firestone and Dacono');
  assert.deepEqual(cv.launchThreshold, { events: 15, listings: 20 });
  assert.equal(cv.domain, 'carbonvalleyguide.com');
});

test('every sub-town slug is URL-safe and distinct from a route the guide already has', () => {
  const RESERVED = new Set(['events', 'places', 'articles', 'guides', 'eat-drink', 'things-to-do', 'directory', 'moving-here', 'search', 'about', 'contact', 'this-weekend', 'correct', 'thanks', 'submit-event', 'for-businesses', 'privacy', 'credits', 'editorial']);
  for (const t of towns) {
    for (const slug of t.subTowns ?? []) {
      assert.match(slug, /^[a-z][a-z0-9-]*$/, `${t.slug}: ${slug}`);
      assert.ok(!RESERVED.has(slug), `${t.slug}: ${slug} collides with a page the guide already has`);
    }
  }
});
