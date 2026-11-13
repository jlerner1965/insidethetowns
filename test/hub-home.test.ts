/**
 * The hub home's Guides section, feature line and section numbers
 * (src/lib/hub-home.ts). The fixes brief of 13 November 2026: the Guides
 * section is not drawn until a card links to a live page, it carries only
 * such cards, and the sections after it are numbered from what is drawn.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FEATURED_ARTICLE, articleHref, featuredTile, guideTiles, indexTiles, searchSuggestions, sectionNumbers, seasonFeatureLine, townsConfirmed } from '../src/lib/hub-home.ts';

const HUB_ROUTES = ['/', '/this-weekend', '/towns', '/[town]'];
const sundance = { title: FEATURED_ARTICLE.title, category: 'culture', slug: 'sundance-from-the-towns-next-door', excerpt: 'The festival moves to Boulder.', domain: 'insidelyons.com' };

test('with nothing published, there are no cards, so no section', () => {
  assert.deepEqual(guideTiles([], [], HUB_ROUTES), []);
});

test('an index needs both its page built and an article in its category', () => {
  assert.deepEqual(indexTiles([{ category: 'camping' }], HUB_ROUTES), [], 'an article, but no /camping/ page');
  assert.deepEqual(indexTiles([], [...HUB_ROUTES, '/camping']), [], 'a page, but nothing in it');
  const tiles = indexTiles([{ category: 'camping' }, { category: 'ghost-towns' }], [...HUB_ROUTES, '/camping']);
  assert.deepEqual(tiles.map((t) => t.href), ['/camping/'], 'Ghost towns has articles and no page');
});

test('only live cards are listed, indexes first, then the feature', () => {
  const tiles = guideTiles([{ category: 'ghost-towns' }], [sundance], [...HUB_ROUTES, '/ghost-towns/']);
  assert.deepEqual(tiles.map((t) => t.title), ['Ghost towns', FEATURED_ARTICLE.title]);
  for (const t of tiles) assert.ok(t.href, `${t.title} is a link`);
});

test('the featured card finds its article by title and links to it on its guide', () => {
  const tile = featuredTile([{ title: 'Carter Lake: the permit and the launch', category: 'outdoors', slug: 'carter-lake', domain: 'insideberthoud.com' }, sundance]);
  assert.equal(tile?.href, 'https://insidelyons.com/articles/sundance-from-the-towns-next-door/');
  assert.equal(tile?.line, 'The festival moves to Boulder.');
});

test('the featured card is not drawn for "Sundance" inside another word, or for an article with no guide page', () => {
  assert.equal(featuredTile([{ title: 'The Sundancer bakery opens', category: 'food', slug: 'sundancer', domain: 'insideerie.com' }]), undefined);
  assert.equal(featuredTile([{ ...sundance, domain: undefined }]), undefined);
});

test("a hub article's page is on the hub, a guide's on its domain", () => {
  assert.equal(articleHref({ slug: 'camping-at-carter-lake' }), '/articles/camping-at-carter-lake/');
  assert.equal(articleHref({ slug: 'carter-lake', domain: 'insideberthoud.com' }), 'https://insideberthoud.com/articles/carter-lake/');
});

test('the feature counts towns, not dates: a town with two rows is one town', () => {
  const counts = townsConfirmed([
    { town: 'Estes Park', confirmed: true },
    { town: 'Estes Park', confirmed: false },
    { town: 'Lyons', confirmed: false },
    { town: 'Berthoud', confirmed: true },
    { confirmed: true },
  ]);
  assert.deepEqual(counts, { confirmed: 2, towns: 3 });
});

test('the feature line reads "19 of 20 towns’ dates confirmed."', () => {
  assert.equal(seasonFeatureLine({ confirmed: 19, towns: 20 }), '19 of 20 towns’ dates confirmed.');
  assert.equal(seasonFeatureLine({ confirmed: 19, towns: 20 }, 'Catch the Glow Parade, Estes Park · Fri, Nov 27'), '19 of 20 towns’ dates confirmed. Next: Catch the Glow Parade, Estes Park · Fri, Nov 27.');
  assert.equal(seasonFeatureLine({ confirmed: 1, towns: 1 }), '1 of 1 town’s dates confirmed.');
});

test('sections are numbered from what is drawn: no Guides, and the Feature is 02', () => {
  assert.deepEqual(sectionNumbers([['towns', true], ['guides', false], ['feature', true]] as const), { towns: '01', feature: '02' });
  assert.deepEqual(sectionNumbers([['towns', true], ['guides', true], ['feature', true]] as const), { towns: '01', guides: '02', feature: '03' });
});

test('the search suggestions are every name once, A to Z', () => {
  assert.deepEqual(searchSuggestions([{ name: 'Lyons' }, { name: 'Berthoud' }], [{ name: 'Berthoud' }, { name: 'Estes Park' }]), ['Berthoud', 'Estes Park', 'Lyons']);
});
