/**
 * A town page's drawn horizon (src/lib/ridgeline.ts): the same line for a
 * slug at every build, a different one for every town, the terrain its
 * cluster or its own config says.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUB_TOWNS, findHubTown } from '../src/config/hub-towns.ts';
import { RIDGE_HEIGHT, RIDGE_WIDTH, TERRAIN, ridgeline } from '../src/lib/ridgeline.ts';

test('a slug draws the same horizon every time', () => {
  for (const t of HUB_TOWNS) assert.deepEqual(ridgeline(t.slug, t.cluster, t.terrain), ridgeline(t.slug, t.cluster, t.terrain), t.slug);
  // Pinned, so a change to the generator is a decision and not an accident.
  assert.ok(ridgeline('salida', 'Arkansas valley').layers[0].startsWith('M0 220 L0 21.1 L73 26.9 L150 31.9 L228 86.9 L300 96.1'));
  const again = JSON.stringify(ridgeline('leadville', 'Arkansas valley'));
  for (let i = 0; i < 5; i++) assert.equal(JSON.stringify(ridgeline('leadville', 'Arkansas valley')), again);
});

test('no two towns share a horizon', () => {
  const seen = new Map<string, string>();
  for (const t of HUB_TOWNS) {
    const key = ridgeline(t.slug, t.cluster, t.terrain).layers.join('|');
    assert.equal(seen.get(key), undefined, `${t.slug} draws the same line as ${seen.get(key)}`);
    seen.set(key, t.slug);
  }
});

test('every path is closed and stays inside the box', () => {
  for (const t of HUB_TOWNS) {
    for (const d of ridgeline(t.slug, t.cluster, t.terrain).layers) {
      assert.match(d, /^M0 220 /, t.slug);
      assert.match(d, / L1200 220 Z$/, t.slug);
      const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
      for (const n of numbers) assert.ok(n >= 0 && n <= Math.max(RIDGE_WIDTH, RIDGE_HEIGHT), `${t.slug}: ${n} is outside the box`);
    }
  }
});

test('the terrain is the cluster’s unless the town sets its own', () => {
  assert.equal(ridgeline('frisco', 'Summit County').terrain, 'peaks');
  assert.equal(ridgeline('fort-morgan', 'Front Range and plains towns').terrain, 'plains');
  // The owner's four, 12 November 2026.
  const own = { evergreen: 'foothills', 'castle-rock': 'mesa', longmont: 'plains', louisville: 'plains' } as const;
  for (const [slug, terrain] of Object.entries(own)) {
    const t = findHubTown(slug)!;
    assert.equal(t.terrain, terrain, slug);
    assert.equal(ridgeline(t.slug, t.cluster, t.terrain).terrain, terrain, slug);
    assert.notEqual(TERRAIN[t.cluster], terrain, `${slug}: the override differs from its cluster's`);
  }
  // Every override differs from its cluster's country, or it would not be one. (The owner's four were the
  // only ones until the towns of the brief of 12 November 2026 were added.)
  for (const t of HUB_TOWNS.filter((x) => x.terrain)) assert.notEqual(TERRAIN[t.cluster], t.terrain, `${t.slug}: the override repeats its cluster's`);
  for (const slug of Object.keys(own)) assert.ok(findHubTown(slug)!.terrain, slug);
  // An override changes the line drawn, not only its label.
  const evergreen = findHubTown('evergreen')!;
  assert.notDeepEqual(ridgeline('evergreen', evergreen.cluster, 'foothills').layers, ridgeline('evergreen', evergreen.cluster).layers);
});
