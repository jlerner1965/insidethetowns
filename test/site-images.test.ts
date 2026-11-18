/**
 * Which photographs a build may see (src/integrations/site-images.ts), and
 * the box and fallback an image is asked for (src/lib/image-service.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getNetworkHub } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { originalsIn, siteImagePatterns } from '../src/integrations/site-images.ts';
import { fallbackWidth, fitBox } from '../src/lib/image-service.ts';

test('a guide sees its own images folder and no other town’s', () => {
  for (const town of towns) {
    const patterns = siteImagePatterns(town);
    assert.ok(patterns[0]!.startsWith(`/content/${town.slug}/images/*.`), town.slug);
    // Anything more is a named portrait in the hub's folder, never a folder.
    for (const more of patterns.slice(1)) assert.match(more, /^\/content\/hub\/images\/[^*]+$/, town.slug);
  }
});

test('the hub sees its own folder, and one named file from each other folder a town page or article uses', () => {
  const patterns = siteImagePatterns(getNetworkHub());
  assert.ok(patterns.includes('/content/hub/images/*.{jpg,jpeg,png,webp,avif,gif}'));
  assert.ok(patterns.includes('/content/leadville/images/matchless-mine.jpg'), 'an article’s imageFolder');
  assert.ok(patterns.some((p) => p.startsWith('/content/golden/images/')), 'a town page’s hero.folder');
  assert.equal(patterns.filter((p) => p.includes('*')).length, 1);
});

test('a built file that is a source image byte for byte is an original; a rendition is not', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-images-'));
  mkdirSync(join(root, 'content/x/images'), { recursive: true });
  mkdirSync(join(root, 'dist/_astro'), { recursive: true });
  writeFileSync(join(root, 'content/x/images/a.jpg'), 'the original bytes');
  writeFileSync(join(root, 'dist/_astro/a.HASH.jpg'), 'the original bytes');
  writeFileSync(join(root, 'dist/_astro/a.HASH_abc.webp'), 'a rendition, as long');
  assert.deepEqual(originalsIn(join(root, 'dist/_astro'), root), ['a.HASH.jpg']);
});

test('a box larger than the file is scaled down to it, shape kept', () => {
  assert.deepEqual(fitBox(1200, 800, { width: 1200, height: 771 }), { width: 1157, height: 771 });
  assert.deepEqual(fitBox(1200, 800, { width: 588, height: 445 }), { width: 588, height: 392 });
  assert.deepEqual(fitBox(1200, 630, { width: 4015, height: 3011 }), { width: 1200, height: 630 });
  // One pixel over is rounding: the width stands.
  assert.deepEqual(fitBox(1600, 1068, { width: 1600, height: 1067 }), { width: 1600, height: 1067 });
});

test('the fallback src is a srcset candidate: the widest, and at most 1280 on a full-width band', () => {
  assert.equal(fallbackWidth(4015, [640, 960, 1280, 1920], 4015, true), 1280);
  assert.equal(fallbackWidth(2400, [640, 960, 1280, 1536], 2400, false), 1536);
  assert.equal(fallbackWidth(1000, [640, 960, 1280, 1920], 1000, true), 1000);
  assert.equal(fallbackWidth(1200, [640, 750, 828, 1080, 1200, 1280, 1668], 1668, false), 1200);
  assert.equal(fallbackWidth(588, [], 588, false), 588);
});
