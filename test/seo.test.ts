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

test('an event names its organiser only when the listing records one', async () => {
  const { eventJsonLd } = await import('../src/lib/seo.ts');
  const town = { kind: 'town', name: 'Erie', state: 'CO', domain: 'insideerie.com' } as never;
  const base = {
    title: 'Talk', start: new Date('2026-12-30T18:00:00Z'), venue: 'Erie Community Library',
    category: 'civic', allDay: false, featured: false, tags: [],
  };

  const without = eventJsonLd(town, { data: base, body: '' } as never, 'https://insideerie.com/events/talk/');
  assert.equal('organizer' in without, false, 'no organiser recorded, so none claimed');

  const withOrg = eventJsonLd(
    town,
    { data: { ...base, organizer: 'Erie Historical Society', organizerUrl: 'https://example.org/s' }, body: '' } as never,
    'https://insideerie.com/events/talk/',
  ) as never as { organizer: { '@type': string; name: string; url?: string } };
  assert.equal(withOrg.organizer['@type'], 'Organization');
  assert.equal(withOrg.organizer.name, 'Erie Historical Society');
  assert.equal(withOrg.organizer.url, 'https://example.org/s');

  const noUrl = eventJsonLd(
    town,
    { data: { ...base, organizer: 'Erie Historical Society' }, body: '' } as never,
    'https://insideerie.com/events/talk/',
  ) as never as { organizer: Record<string, unknown> };
  assert.equal('url' in noUrl.organizer, false, 'no url recorded, so none invented');
});

test('an event\'s offer carries a number where the cost line gives one, and the words always', async () => {
  const { eventJsonLd, offerPrice } = await import('../src/lib/seo.ts');
  assert.deepEqual(offerPrice('Free'), { price: '0', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('Free; registration required'), { price: '0', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$20'), { price: '20', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$25 per person, online in advance only'), { price: '25', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$74.50 standing general admission; 21 and over'), { price: '74.50', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$40–$98'), { lowPrice: '40', highPrice: '98', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('$15; seniors $13; under 18 $5; CSU students free'), { lowPrice: '0', highPrice: '15', priceCurrency: 'USD' });
  assert.deepEqual(offerPrice('Standard $25 / Resident $20'), { lowPrice: '20', highPrice: '25', priceCurrency: 'USD' });
  assert.equal(offerPrice('Ticketed; dinner included'), undefined, 'no figure, no number');
  assert.equal(offerPrice('Tickets from the Rams ticket office'), undefined);

  const town = { kind: 'town', name: 'Erie', state: 'CO', domain: 'insideerie.com' } as never;
  const base = { title: 'Show', start: new Date('2026-12-30T18:00:00Z'), venue: 'Hall', category: 'arts', allDay: false, featured: false, tags: [] };
  const ld = (cost: string) =>
    (eventJsonLd(town, { data: { ...base, cost }, body: '' } as never, 'https://insideerie.com/events/show/') as never as { offers: Record<string, string> }).offers;
  assert.deepEqual(ld('$20'), { '@type': 'Offer', url: 'https://insideerie.com/events/show/', description: '$20', price: '20', priceCurrency: 'USD' });
  assert.equal(ld('$40–$98')['@type'], 'AggregateOffer');
  assert.equal(ld('$40–$98').lowPrice, '40');
  assert.deepEqual(ld('Ticketed'), { '@type': 'Offer', url: 'https://insideerie.com/events/show/', description: 'Ticketed' });
  assert.equal(ld('Free').price, '0');
});

test('the publisher graph leads from every town to the hub and from the hub to the publisher', async () => {
  const { siteJsonLd } = await import('../src/lib/seo.ts');
  const { getNetworkHub } = await import('../src/config/index.ts');
  const hub = getNetworkHub();
  assert.ok(hub.publisher?.name, 'the hub config names the publisher');
  const graph = siteJsonLd(hub) as { '@graph': Array<Record<string, unknown>> };
  const org = graph['@graph'][0] as { parentOrganization?: { name: string; url: string } };
  assert.equal(org.parentOrganization?.name, hub.publisher!.name);
  assert.equal(org.parentOrganization?.url, hub.publisher!.url);
});
