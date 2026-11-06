/**
 * Page titles (src/lib/titles.ts): the guide's name rides on a title only
 * where the whole thing fits in TITLE_LIMIT, and an event's date in the
 * title tag is short.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, pageTitle, titleDate, TITLE_LIMIT } from '../src/lib/titles.ts';
import { parseLocal } from '../src/lib/dates.ts';

const site = { siteTitle: 'Inside Berthoud', tagline: 'The Garden Spot.' };

test('a short title keeps the guide’s name; a long one stands alone', () => {
  assert.equal(pageTitle(site, 'Events'), 'Events | Inside Berthoud');
  assert.equal(fitTitle('Blind Date with a Book at City Star — Oct 25', 'Inside Berthoud'), 'Blind Date with a Book at City Star — Oct 25 | Inside Berthoud');
  const long = 'Berthoud Historical Society Fall Speaker Series — Nov 17';
  assert.equal(fitTitle(long, 'Inside Berthoud'), long, 'with the suffix it would run to 74');
  assert.ok(`${long} | Inside Berthoud`.length > TITLE_LIMIT);
});

test('the home title is unchanged when there is no page title', () => {
  assert.match(pageTitle(site), /^Inside Berthoud — /);
});

test('an event’s title date is the month and day, with the year only when it is another year', () => {
  const now = parseLocal('2026-10-27T09:00');
  assert.equal(titleDate(parseLocal('2026-11-17T18:00'), now), 'Nov 17');
  assert.equal(titleDate(parseLocal('2027-01-03T18:00'), now), 'Jan 3, 2027');
});

test('a place title claims only what its page has: hours, a menu, a pool schedule, prices, or a park’s amenities', async () => {
  // The Berthoud owner's brief, 6 November 2026: "show the answer in search results".
  const { placeTitle, amenityLabel } = await import('../src/lib/titles.ts');
  const town = { name: 'Berthoud', state: 'CO' };
  const facts = (o: object) => ({ type: 'venue', hours: true, menu: false, poolSchedule: false, dayPassPrices: false, amenities: [], ...o });
  assert.equal(placeTitle('Berthoud Recreation Center', 'Venue', town, facts({ poolSchedule: true, dayPassPrices: true })), 'Berthoud Recreation Center Hours, Pool Schedule & Day Pass Prices');
  assert.equal(placeTitle('Berthoud Town Hall', 'Venue', town, facts({})), 'Berthoud Town Hall Hours');
  assert.equal(placeTitle('Berthoud Town Hall', 'Venue', town, facts({ hours: false })), 'Berthoud Town Hall — Venue', 'hours hidden: no claim of them');
  assert.equal(placeTitle('Happy Eating Asian Cafe', 'Restaurant', town, facts({ type: 'restaurant', menu: true })), 'Happy Eating Asian Cafe: Menu & Hours');
  assert.equal(placeTitle('Cornerstone Cafe', 'Restaurant', town, facts({ type: 'restaurant' })), 'Cornerstone Cafe: Hours & Location');
  assert.equal(placeTitle('Joyful Brews', 'Coffee & Sweets', town, facts({ type: 'coffee', hours: false, menu: true })), 'Joyful Brews: Menu & Location');
  assert.equal(placeTitle('Joyful Brews', 'Coffee & Sweets', town, facts({ type: 'coffee', hours: false })), 'Joyful Brews — Coffee & Sweets in Berthoud, CO');
  assert.equal(placeTitle('Bein Park', 'Park', town, facts({ type: 'park', amenities: ['soccer fields', 'playground', 'dog park', 'ball fields'] })), 'Bein Park: Soccer Fields, Playground & Dog Park');
  assert.equal(placeTitle('Bein Park', 'Park', town, facts({ type: 'park', amenities: ['playground'] })), 'Bein Park — Park in Berthoud, CO', 'one tag is not a list');
  // A long name keeps two amenities, then the plain form, rather than running past the limit.
  const long = 'The Very Long Name of a Neighborhood Park on the East Side of Town';
  assert.equal(placeTitle(long, 'Park', town, facts({ type: 'park', amenities: ['playground', 'pond', 'picnic'] })), `${long} — Park in Berthoud, CO`);
  assert.ok(placeTitle('A Park With a Longish Name Here', 'Park', town, facts({ type: 'park', amenities: ['playground', 'basketball court', 'picnic pavilions'] })).length <= TITLE_LIMIT);
  // Other types keep the kind-and-town form.
  assert.equal(placeTitle('Hays Market', 'Shop', town, facts({ type: 'shop' })), 'Hays Market — Shop in Berthoud, CO');
  assert.equal(amenityLabel('ball fields'), 'Ball Fields');
  assert.equal(amenityLabel('no-dogs'), 'No Dogs');
});
