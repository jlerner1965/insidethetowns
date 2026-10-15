/**
 * Search-visibility phase 1 (15 October 2026): the markup and titles that
 * tell a search engine what a page is and when it changed, without claiming
 * anything the content does not say.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleModified, webPageJsonLd } from '../src/lib/seo.ts';
import { placeTitle } from '../src/lib/titles.ts';

const site = { kind: 'town', domain: 'insidelyons.com', siteTitle: 'Inside Lyons' } as never;

test('an article changed when it was edited or when its facts were last checked, whichever is later', () => {
  const published = new Date('2026-09-18T06:00:00Z');
  const checked = new Date('2026-10-07T06:00:00Z');
  const edited = new Date('2026-10-10T06:00:00Z');
  assert.equal(articleModified({}), undefined);
  assert.equal(articleModified({ verified: checked }), checked);
  assert.equal(articleModified({ updated: edited }), edited);
  assert.equal(articleModified({ updated: checked, verified: edited }), edited);
  assert.equal(articleModified({ updated: edited, verified: checked }), edited);
  // A check never predates publication in practice; if it did, the later date still wins.
  assert.equal(articleModified({ updated: published, verified: checked }), checked);
});

test('the Moving Here guide is a WebPage of its site, dated by its last update', () => {
  const d = webPageJsonLd(site, { name: 'Moving to Lyons', description: 'x', path: '/moving-here/', updated: new Date('2026-10-02T06:00:00Z') });
  assert.equal(d['@type'], 'WebPage');
  assert.equal(d['@id'], 'https://insidelyons.com/moving-here/#page');
  assert.equal(d.url, 'https://insidelyons.com/moving-here/');
  assert.deepEqual(d.isPartOf, { '@id': 'https://insidelyons.com/#website' });
  assert.deepEqual(d.publisher, { '@id': 'https://insidelyons.com/#org' });
  assert.match(String(d.dateModified), /^2026-10-02T/);
  const undated = webPageJsonLd(site, { name: 'x', description: 'x', path: '/moving-here/' });
  assert.equal('dateModified' in undated, false);
});

test('a place title says what and where, and does not name the town twice', () => {
  const lyons = { name: 'Lyons', state: 'CO' };
  assert.equal(placeTitle('Hall Ranch', 'Trail', lyons), 'Hall Ranch — Trail in Lyons, CO');
  assert.equal(placeTitle('Lyons Classic Pinball', 'Venue', lyons), 'Lyons Classic Pinball — Venue');
  assert.equal(placeTitle('Niwot Market', 'Shop', { name: 'Niwot', state: 'CO' }), 'Niwot Market — Shop');
  // A town name inside a longer word is not the town: "Goldenrod" is not in Golden.
  assert.equal(placeTitle('Goldenrod Cafe', 'Restaurant', { name: 'Golden', state: 'CO' }), 'Goldenrod Cafe — Restaurant in Golden, CO');
  // Carbon Valley: the guide's name in a listing counts the same way.
  assert.equal(placeTitle('Carbon Valley Park', 'Park', { name: 'Carbon Valley', state: 'CO' }), 'Carbon Valley Park — Park');
});
