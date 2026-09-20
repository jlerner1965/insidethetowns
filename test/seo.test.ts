/**
 * Structured data that makes a claim has to be a claim we can stand behind.
 *
 * The listing pages had no markup of their own at all — they inherited the
 * site's Organization and WebSite and said nothing about themselves. These
 * cover the shape of what they say now, and in particular that a list does
 * not announce more items than it ships.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionPageJsonLd } from '../src/lib/seo.ts';

const town = { kind: 'town', domain: 'insideerie.com', siteTitle: 'Inside Erie' } as never;

const item = (n: number) => ({ name: `Thing ${n}`, path: `/places/thing-${n}/` });

test('a collection page belongs to its own site', () => {
  const d = collectionPageJsonLd(town, { name: 'Eat & drink', description: 'x', path: '/eat-drink/' });
  assert.equal(d['@type'], 'CollectionPage');
  assert.equal(d['@id'], 'https://insideerie.com/eat-drink/#page');
  assert.equal(d.url, 'https://insideerie.com/eat-drink/');
  // The property that ties a page to its publication, which is the whole point.
  assert.deepEqual(d.isPartOf, { '@id': 'https://insideerie.com/#website' });
});

test('an empty page declares no list rather than an empty one', () => {
  const d = collectionPageJsonLd(town, { name: 'x', description: 'x', path: '/events/' });
  assert.equal('mainEntity' in d, false);
  const e = collectionPageJsonLd(town, { name: 'x', description: 'x', path: '/events/', items: [] });
  assert.equal('mainEntity' in e, false);
});

test('numberOfItems never exceeds what is actually listed', () => {
  // The bug this catches: 169 events on the page, 50 in the markup, and a
  // numberOfItems of 169 — a catalogue that is not there.
  for (const n of [1, 10, 50, 169, 600]) {
    const d = collectionPageJsonLd(town, {
      name: 'x', description: 'x', path: '/events/',
      items: Array.from({ length: n }, (_, i) => item(i)),
    }) as never as { mainEntity: { numberOfItems: number; itemListElement: unknown[] } };
    assert.equal(d.mainEntity.numberOfItems, d.mainEntity.itemListElement.length,
      `${n} items: numberOfItems must match the list`);
    assert.ok(d.mainEntity.itemListElement.length <= 50, `${n} items: list is capped`);
  }
});

test('relative paths resolve against the site; absolute urls are left alone', () => {
  const d = collectionPageJsonLd(town, {
    name: 'x', description: 'x', path: '/this-weekend/',
    items: [{ name: 'local', path: '/events/a/' }, { name: 'elsewhere', url: 'https://insidelyons.com/events/b/' }],
  }) as never as { mainEntity: { itemListElement: Array<{ url: string; position: number }> } };
  assert.equal(d.mainEntity.itemListElement[0]!.url, 'https://insideerie.com/events/a/');
  assert.equal(d.mainEntity.itemListElement[1]!.url, 'https://insidelyons.com/events/b/');
  assert.equal(d.mainEntity.itemListElement[0]!.position, 1);
  assert.equal(d.mainEntity.itemListElement[1]!.position, 2);
});
