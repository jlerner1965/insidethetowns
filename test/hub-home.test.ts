/**
 * The hub home's Guides section, feature line and section numbers
 * (src/lib/hub-home.ts). The fixes brief of 13 November 2026: the Guides
 * section is not drawn until a card links to a live page, it carries only
 * such cards, and the sections after it are numbered from what is drawn.
 * The cards are the hub's town-anchored articles (src/lib/curiosity.ts),
 * and the page passes only those on the site (getCuriosity()).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FEATURED_ARTICLE, featuredTile, guideTiles, indexTiles, pickDeadline, searchSuggestions, sectionNumbers, seasonFeatureLine, townsConfirmed, type ArticleOnSite } from '../src/lib/hub-home.ts';

const article = (kind: ArticleOnSite['kind'], slug: string, towns: string[], title = `Article ${slug}`): ArticleOnSite => ({ kind, slug, towns, title, description: `About ${slug}.` });
const sundance = article('event', 'sundance-from-the-towns-next-door', ['lyons', 'niwot'], FEATURED_ARTICLE.title);

test('with nothing on the site, there are no cards, so no section', () => {
  assert.deepEqual(guideTiles([]), []);
});

test('an index card per topic with an article on the site, Camping before Ghost towns, with its count', () => {
  const tiles = indexTiles([article('ghost-towns', 'nederland', ['nederland']), article('camping', 'lyons', ['lyons']), article('camping', 'berthoud', ['berthoud'])]);
  assert.deepEqual(tiles.map((t) => [t.title, t.href, t.line]), [['Camping', '/camping/', 'Near 2 towns.'], ['Ghost towns', '/ghost-towns/', 'Near 1 town.']]);
});

test('the featured card is the Sundance event article, at its address on the hub', () => {
  const tile = featuredTile([article('camping', 'lyons', ['lyons']), sundance]);
  assert.equal(tile?.href, '/articles/sundance-from-the-towns-next-door/');
  assert.equal(tile?.line, 'About sundance-from-the-towns-next-door.');
});

test('no featured card for another event article, or "Sundance" inside another word', () => {
  assert.equal(featuredTile([article('event', 'fair', ['berthoud'], 'The county fair from the towns next door')]), undefined);
  assert.equal(featuredTile([article('event', 'sundancer', ['erie'], 'The Sundancer bakery opens')]), undefined);
});

test('only live cards, indexes first, then the feature', () => {
  assert.deepEqual(guideTiles([sundance, article('ghost-towns', 'leadville', ['leadville'])]).map((t) => t.title), ['Ghost towns', FEATURED_ARTICLE.title]);
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

test('the registration item is the soonest that closes, else the soonest that opens, else nothing', () => {
  const d = (what: 'opens' | 'closes', on: string) => ({ what, on: new Date(`${on}T12:00:00-07:00`) });
  assert.deepEqual(pickDeadline([d('opens', '2026-11-15'), d('closes', '2026-11-20'), d('closes', '2026-11-18')]), d('closes', '2026-11-18'));
  assert.deepEqual(pickDeadline([d('opens', '2026-11-25'), d('opens', '2026-11-15')]), d('opens', '2026-11-15'));
  assert.equal(pickDeadline([]), undefined);
});
