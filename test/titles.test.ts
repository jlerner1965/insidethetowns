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
  assert.equal(fitTitle('Blind Date with a Book — Oct 25', 'Inside Berthoud'), 'Blind Date with a Book — Oct 25 | Inside Berthoud');
  // 60 since the owner's review of 13 November 2026 (it was 70).
  const long = 'Blind Date with a Book at City Star — Oct 25';
  assert.equal(fitTitle(long, 'Inside Berthoud'), long, 'with the suffix it would run to 62');
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
  assert.equal(placeTitle('Berthoud Recreation Center', 'Venue', town, facts({ poolSchedule: true, dayPassPrices: true })), 'Berthoud Recreation Center Hours & Pool Schedule');
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
  assert.equal(placeTitle(long, 'Park', town, facts({ type: 'park', amenities: ['playground', 'pond', 'picnic'] })), `${long}, Berthoud, CO`, 'over the limit the kind gives way, the town stays');
  assert.ok(placeTitle('A Park With a Longish Name Here', 'Park', town, facts({ type: 'park', amenities: ['playground', 'basketball court', 'picnic pavilions'] })).length <= TITLE_LIMIT);
  // Other types keep the kind-and-town form.
  assert.equal(placeTitle('Hays Market', 'Shop', town, facts({ type: 'shop' })), 'Hays Market — Shop in Berthoud, CO');
  assert.equal(amenityLabel('ball fields'), 'Ball Fields');
  assert.equal(amenityLabel('no-dogs'), 'No Dogs');
});

test('a place title that will stand without the guide’s name carries the town itself', async () => {
  // 56 of 781 live place titles named no town (10 November 2026): the fact
  // title ran too long for " | Inside [Town]" and the name did not say where.
  const { placeTitle, fitTitle } = await import('../src/lib/titles.ts');
  const facts = (o: object) => ({ type: 'park', hours: false, menu: false, poolSchedule: false, dayPassPrices: false, amenities: [], ...o });
  const fc = { name: 'Fort Collins', state: 'CO', siteTitle: 'Inside Fort Collins' };
  const park = placeTitle('Rolland Moore Park', 'Park', fc, facts({ amenities: ['tennis', 'racquetball', 'ball fields'] }));
  assert.equal(park, 'Rolland Moore Park, Fort Collins: Tennis & Racquetball');
  assert.equal(fitTitle(park, fc.siteTitle), park, 'and stands alone, under the limit');
  const estes = { name: 'Estes Park', state: 'CO', siteTitle: 'Inside Estes Park' };
  assert.equal(
    placeTitle('Penelope’s World Famous Burgers & Fries', 'Restaurant', estes, facts({ type: 'restaurant', hours: true })),
    'Penelope’s World Famous Burgers & Fries, Estes Park, CO',
  );
  const frederick = { name: 'Frederick', state: 'CO', siteTitle: 'Inside Frederick' };
  assert.equal(
    placeTitle('Carbon Valley Recreation Center', 'Venue', frederick, facts({ type: 'venue', hours: true, poolSchedule: true, dayPassPrices: true })),
    'Carbon Valley Recreation Center Hours',
    'a claim gives way before the town does',
  );
  // Where the guide's name fits after it, or the name says where, nothing changes.
  const berthoud = { name: 'Berthoud', state: 'CO', siteTitle: 'Inside Berthoud' };
  assert.equal(placeTitle('Cornerstone Cafe', 'Restaurant', berthoud, facts({ type: 'restaurant', hours: true })), 'Cornerstone Cafe: Hours & Location');
  assert.equal(placeTitle('Berthoud Recreation Center', 'Venue', berthoud, facts({ type: 'venue', hours: true, poolSchedule: true, dayPassPrices: true })), 'Berthoud Recreation Center Hours & Pool Schedule');
  // A Severance listing on Inside Windsor: the guide's name does not place it, so the title does.
  const severance = { name: 'Severance', state: 'CO', siteTitle: 'Inside Windsor' };
  assert.equal(placeTitle('Domino’s Pizza', 'Restaurant', severance, facts({ type: 'restaurant', hours: true })), 'Domino’s Pizza, Severance: Hours & Location');
  assert.equal(placeTitle('Bruce’s Bar', 'Bar', severance, facts({ type: 'bar' })), 'Bruce’s Bar — Bar in Severance, CO');
  assert.equal(placeTitle('Severance Library', 'Venue', severance, facts({ type: 'venue', hours: true })), 'Severance Library Hours');
  // Too long even so: the name and the town, which always names the town (the kind gives way first).
  const long = 'A Restaurant With a Name That Runs On Past Fifty Characters Here';
  assert.equal(placeTitle(long, 'Restaurant', fc, facts({ type: 'restaurant', hours: true })), `${long}, Fort Collins, CO`);
});

test('an annual event title carries the year beside the name, then the day; a past one says when it was held and which year is to come', async () => {
  const { annualEventTitle } = await import('../src/lib/titles.ts');
  const { parseLocal } = await import('../src/lib/dates.ts');
  assert.equal(annualEventTitle('Olde Golden Holiday Parade', 'Golden', parseLocal('2026-12-12T10:30'), false), 'Olde Golden Holiday Parade 2026 — Sat, Dec 12');
  assert.equal(annualEventTitle('Parade of Lights', 'Erie', parseLocal('2026-12-04T18:00'), false), 'Parade of Lights 2026 in Erie — Fri, Dec 4');
  // A year that is over: the event, the town and the next year (the owner, 13 November 2026).
  assert.equal(annualEventTitle('Niwot Trot 5K', 'Niwot', parseLocal('2026-10-04T09:00'), true), 'Niwot Trot 5K: 2027 dates');
  assert.equal(annualEventTitle('Terror in the Corn at Anderson Farms', 'Erie', parseLocal('2026-09-25T18:00'), true), 'Terror in the Corn at Anderson Farms, Erie: 2027 dates');
  assert.equal(annualEventTitle('Brewfest 2026', 'Erie', parseLocal('2026-09-12T12:00'), false), 'Brewfest 2026 in Erie — Sat, Sep 12');
});

test('an event title that stands alone says where the event is, where that fits (the owner, 13 November 2026)', async () => {
  const { eventTitle, annualEventTitle, TITLE_LIMIT } = await import('../src/lib/titles.ts');
  // Fits with the guide's name, which places it: as it was.
  assert.equal(eventTitle('Karaoke Night', 'Nov 13', 'Erie', 'Inside Erie'), 'Karaoke Night — Nov 13');
  // The title names the town: as it was.
  assert.equal(eventTitle('Berthoud Blues Bash at City Star', 'Nov 14', 'Berthoud', 'Inside Berthoud'), 'Berthoud Blues Bash at City Star — Nov 14');
  assert.equal(eventTitle('Hoss and the Hangman at City Star', 'Nov 7', 'Berthoud', 'Inside Berthoud'), 'Hoss and the Hangman at City Star — Nov 7', 'fits with " | Inside Berthoud" (59)');
  // Too long for the guide's name: the town goes before the date.
  assert.equal(eventTitle('Greg Hoy and the Boys at City Star', 'Dec 12', 'Berthoud', 'Inside Berthoud'), 'Greg Hoy and the Boys at City Star — Berthoud, Dec 12');
  // A Severance listing on Inside Windsor is placed by its own town, not the guide's name.
  assert.equal(eventTitle('Kids Fishing Derby', 'Jun 6, 2027', 'Severance', 'Inside Windsor'), 'Kids Fishing Derby — Severance, Jun 6, 2027');
  // No room for the town either: the title and the date, as before.
  const long = 'Raspberry Bandit and Cabaret releases with Johnny Johnston';
  assert.equal(eventTitle(long, 'Nov 6', 'Berthoud', 'Inside Berthoud'), `${long} — Nov 6`);
  // An annual event's weekday gives way before the town and the year do.
  const d = new Date('2026-12-05T12:00:00-07:00');
  assert.equal(annualEventTitle('Festival of Lights', 'Frederick', d, false), 'Festival of Lights 2026 in Frederick — Sat, Dec 5');
  const t = annualEventTitle('Olde Golden Christmas Candlelight Walk and Parade', 'Golden', d, false);
  assert.ok(t.length <= TITLE_LIMIT && t.includes('2026'), t);
});
