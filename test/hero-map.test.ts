/**
 * The hub's links start a town's photograph from /hero-map.json, which the
 * build reads out of each town page (src/lib/hero-map.ts). If the page's hero
 * lost its marker, the list would go empty and the photographs would quietly
 * come late again; if the parse took the wrong attribute, a link would fetch
 * a file the page never asks for.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heroOf } from '../src/lib/hero-map.ts';

const built =
  '<section><img src="/_astro/palisade.B1_Z1.webp" srcset="/_astro/palisade.B1_Za.webp 640w, /_astro/palisade.B1_Zb.webp 960w, /_astro/palisade.B1_Zc.webp 1280w, /_astro/palisade.B1_Zd.webp 1920w" alt="Palisade" sizes="100vw" loading="eager" fetchpriority="high" decoding="sync" class="absolute" style="object-position: 50% 40%" data-showpiece-hero width="1920" height="1280"></section>';

test('reads the hero photograph’s srcset and sizes from a built town page', () => {
  assert.deepEqual(heroOf(built), {
    srcset: '/_astro/palisade.B1_Za.webp 640w, /_astro/palisade.B1_Zb.webp 960w, /_astro/palisade.B1_Zc.webp 1280w, /_astro/palisade.B1_Zd.webp 1920w',
    sizes: '100vw',
  });
});

test('passes over a page whose photographs are not the town hero', () => {
  assert.equal(heroOf('<img src="/a.webp" srcset="/a.webp 640w" sizes="100vw">'), undefined);
  assert.equal(heroOf('<main>No photograph</main>'), undefined);
});

test('the marker is written as a value too, and an escaped ampersand is read back', () => {
  const dev = '<img data-showpiece-hero="" sizes="100vw" srcset="/_image?href=a&amp;w=640 640w">';
  assert.deepEqual(heroOf(dev), { srcset: '/_image?href=a&w=640 640w', sizes: '100vw' });
});

test('the town page’s hero carries the marker the build looks for', () => {
  const page = readFileSync(new URL('../src/routes/hub/town.astro', import.meta.url), 'utf8');
  assert.match(page, /<Image[\s\S]*?data-showpiece-hero[\s\S]*?\/>/);
});

test('the hub’s pages carry the script that uses the list', () => {
  const base = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  assert.match(base, /site\.kind === 'hub' && <HeroWarm \/>/);
});
