/**
 * A place page's structured data (src/lib/seo.ts, localBusinessJsonLd):
 * the type by what the place is, the hours only from a schedule the
 * listing states, the menu only where there is one, and the whole thing
 * serialisable (the Berthoud owner's brief, 6 November 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localBusinessJsonLd, openingHoursSpecification, placeSchemaType } from '../src/lib/seo.ts';

const town = { kind: 'town', name: 'Berthoud', state: 'CO', domain: 'insideberthoud.com' } as never;
const page = 'https://insideberthoud.com/places/x/';
const place = (data: Record<string, unknown>) => ({ data: { tags: [], status: 'open', ...data } }) as never;

/** Through JSON and back, as the page ships it: no undefined, no function, every key named. */
const roundTrip = (o: object) => JSON.parse(JSON.stringify(o)) as Record<string, unknown>;

test('a recreation center is a SportsActivityLocation with its hours as a specification and the Town’s site as its url', () => {
  const d = roundTrip(
    localBusinessJsonLd(town, place({ title: 'Berthoud Recreation Center', type: 'venue', tags: ['pool', 'gym'], address: '1000 N Berthoud Pkwy', url: 'https://www.berthoud.org/1547/x', phone: '(970) 532-1600', hours: 'Mon–Fri 5 am–9 pm, Sat 7–8, Sun 11–8', summary: 'The Town’s recreation center.' }), page),
  );
  for (const key of ['@context', '@type', 'name', 'address', 'url', 'mainEntityOfPage', 'telephone', 'openingHoursSpecification']) assert.ok(key in d, key);
  assert.equal(d['@type'], 'SportsActivityLocation');
  assert.equal(d.url, 'https://www.berthoud.org/1547/x');
  assert.equal(d.mainEntityOfPage, page);
  assert.deepEqual(d.address, { '@type': 'PostalAddress', streetAddress: '1000 N Berthoud Pkwy', addressLocality: 'Berthoud', addressRegion: 'CO' });
  const spec = d.openingHoursSpecification as Array<{ '@type': string; dayOfWeek: string[]; opens: string; closes: string }>;
  assert.deepEqual(spec[0], { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '05:00', closes: '21:00' });
  assert.deepEqual(spec[1], { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '07:00', closes: '20:00' });
  assert.equal(spec.length, 3);
  assert.equal('hasMenu' in d, false, 'no menu on a pool');
});

test('a restaurant with a menu link carries hasMenu; a park is a Park with no hours and no menu', () => {
  const cafe = roundTrip(localBusinessJsonLd(town, place({ title: 'Cornerstone Cafe', type: 'restaurant', address: '250 Mountain Ave', hours: 'Tue–Sat 7 am–2 pm', menuUrl: 'https://example.com/menu', summary: 'Diner.' }), page));
  assert.equal(cafe['@type'], 'Restaurant');
  assert.equal(cafe.hasMenu, 'https://example.com/menu');
  assert.equal(cafe.url, page, 'no site of its own: the page is the url');
  const park = roundTrip(localBusinessJsonLd(town, place({ title: 'Bein Park', type: 'park', address: 'Spartan Ave & 10th St', url: 'https://www.berthoud.org/x', menuUrl: 'https://example.com/menu', summary: 'Soccer park.' }), page));
  assert.equal(park['@type'], 'Park');
  assert.equal('openingHours' in park, false);
  assert.equal('openingHoursSpecification' in park, false);
  assert.equal('hasMenu' in park, false, 'a menu link on a park is not a FoodEstablishment claim');
});

test('the venue subtypes, and hours the parser will not read make no specification', () => {
  assert.equal(placeSchemaType('venue', ['library', 'kids']), 'Library');
  assert.equal(placeSchemaType('venue', ['government', 'meetings']), 'GovernmentOffice');
  assert.equal(placeSchemaType('venue', ['music']), 'EventVenue');
  assert.equal(placeSchemaType('coffee'), 'CafeOrCoffeeShop');
  assert.equal(placeSchemaType('nonsense'), 'LocalBusiness');
  assert.deepEqual(openingHoursSpecification([]), []);
  // A closed listing has no hours at all, whatever its file still says.
  const closed = roundTrip(localBusinessJsonLd(town, place({ title: 'X', type: 'bar', status: 'closed', address: '1 St', hours: 'Daily 11–8', summary: 'x' }), page));
  assert.equal('openingHoursSpecification' in closed, false);
});
