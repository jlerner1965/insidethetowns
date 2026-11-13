/**
 * The hub home's Guides section and feature line (src/lib/hub-home.ts):
 * the brief of 13 November 2026 asks that the three tiles work while the
 * article indexes are empty, showing "coming soon", and turn into links
 * from the content alone.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COMING_SOON, FEATURED_ARTICLE, GUIDE_INDEXES, articleHref, featuredTile, guideTiles, indexTiles, searchSuggestions, seasonFeatureLine } from '../src/lib/hub-home.ts';

test('with no articles, every tile is "coming soon" and none is a link', () => {
  const tiles = guideTiles([], []);
  assert.equal(tiles.length, 3);
  assert.deepEqual(tiles.map((t) => t.title), ['Camping', 'Ghost towns', FEATURED_ARTICLE.title]);
  for (const t of tiles) {
    assert.equal(t.href, undefined, `${t.title} links nowhere until its pages exist`);
    assert.equal(t.note, COMING_SOON);
  }
});

test('an index is a link once the hub has an article in its category', () => {
  const tiles = indexTiles([{ category: 'camping' }, { category: 'other' }]);
  assert.equal(tiles[0]!.href, '/camping/');
  assert.equal(tiles[0]!.note, undefined);
  assert.equal(tiles[1]!.href, undefined, 'no ghost-towns article, no link');
  assert.equal(tiles[1]!.note, COMING_SOON);
});

test('every index path has a trailing slash, as every link on the sites does', () => {
  for (const index of GUIDE_INDEXES) assert.match(index.path, /^\/[a-z-]+\/$/);
});

test('the featured tile finds its article by title and links to it on its guide', () => {
  const tile = featuredTile([
    { title: 'Carter Lake: the permit and the launch', category: 'outdoors', slug: 'carter-lake', domain: 'insideberthoud.com' },
    { title: 'Sundance from the towns next door', category: 'culture', slug: 'sundance-from-the-towns-next-door', excerpt: 'The festival moves to Boulder.', domain: 'insidelyons.com' },
  ]);
  assert.equal(tile.href, 'https://insidelyons.com/articles/sundance-from-the-towns-next-door/');
  assert.equal(tile.title, 'Sundance from the towns next door');
  assert.equal(tile.line, 'The festival moves to Boulder.');
  assert.equal(tile.note, undefined);
});

test('the featured tile does not match "Sundance" inside another word', () => {
  const tile = featuredTile([{ title: 'The Sundancer bakery opens', category: 'food', slug: 'sundancer', domain: 'insideerie.com' }]);
  assert.equal(tile.href, undefined);
});

test("a hub article's page is on the hub, a guide's on its domain", () => {
  assert.equal(articleHref({ slug: 'camping-at-carter-lake' }), '/articles/camping-at-carter-lake/');
  assert.equal(articleHref({ slug: 'carter-lake', domain: 'insideberthoud.com' }), 'https://insideberthoud.com/articles/carter-lake/');
});

test('the feature line counts dates and towns in words that agree with their numbers', () => {
  assert.equal(seasonFeatureLine({ confirmed: 12, towns: 9 }, 'Longmont Lights · Nov 28'), '12 dates confirmed across 9 towns. Next: Longmont Lights · Nov 28.');
  assert.equal(seasonFeatureLine({ confirmed: 1, towns: 1 }), '1 date confirmed across 1 town.');
  assert.equal(seasonFeatureLine({ confirmed: 0, towns: 0 }), '0 dates confirmed.');
});

test('the search suggestions are every name once, A to Z', () => {
  assert.deepEqual(searchSuggestions([{ name: 'Lyons' }, { name: 'Berthoud' }], [{ name: 'Berthoud' }, { name: 'Estes Park' }]), ['Berthoud', 'Estes Park', 'Lyons']);
});
