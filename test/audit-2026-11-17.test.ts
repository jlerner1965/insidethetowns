/**
 * The template-level findings of the 17 November 2026 audit, each held by
 * the rule that fixed it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleJsonLd, eventJsonLd, eventLocality, eventPlace, eventWhere, placeSchemaType, postalAddress, siteJsonLd, venueParts } from '../src/lib/seo.ts';
import { clampSnippet } from '../src/lib/plain-text.ts';
import { coveredTowns } from '../src/lib/sub-towns.ts';
import { eventTitle } from '../src/lib/titles.ts';
import { correctedGame, seasonOver, teamDescription } from '../src/lib/school-sports.ts';

const cv = { kind: 'town', slug: 'carbon-valley', name: 'Carbon Valley', state: 'CO', domain: 'carbonvalleyguide.com', siteTitle: 'Inside Carbon Valley', tagline: 'x' } as never;
const windsor = { kind: 'town', slug: 'windsor', name: 'Windsor', state: 'CO', domain: 'insidewindsorco.com', siteTitle: 'Inside Windsor', tagline: 'x', subTowns: ['windsor', 'severance'] } as never;
const base = { title: 'Band Concert', start: new Date('2027-02-19T01:00:00Z'), category: 'arts', allDay: false, featured: false, tags: [], status: 'scheduled' };
const ld = (town: never, data: object, listed?: string) =>
  eventJsonLd(town, { data: { ...base, ...data }, body: '' } as never, 'https://x/events/e/', undefined, undefined, listed) as never as { location: Record<string, never>; eventAttendanceMode: string };

test('a guide named for a region is not a town: the towns it covers are', () => {
  assert.deepEqual(coveredTowns(cv), ['Frederick', 'Firestone', 'Dacono']);
  assert.deepEqual(coveredTowns(windsor), ['Windsor', 'Severance']);
  assert.deepEqual(coveredTowns({ slug: 'erie', name: 'Erie' }), ['Erie']);
  const area = (site: never) => (siteJsonLd(site)['@graph'][0] as { areaServed: unknown }).areaServed;
  assert.deepEqual((area(cv) as Array<{ name: string }>).map((c) => c.name), ['Frederick', 'Firestone', 'Dacono']);
  assert.deepEqual((area(windsor) as Array<{ name: string }>).map((c) => c.name), ['Windsor', 'Severance']);
});

test('a venue line that carries its street and town gives them to the address, and the town is said once', () => {
  const venue = 'Thunder Valley K-8, 600 5th Street, Frederick';
  assert.deepEqual(venueParts(venue, ['Frederick']), { name: 'Thunder Valley K-8', street: '600 5th Street', locality: 'Frederick' });
  assert.deepEqual(venueParts('The Old Mine, 500 Briggs Street', ['Erie']), { name: 'The Old Mine', street: '500 Briggs Street' });
  assert.deepEqual(venueParts('Windsor Library - Pikes Peak', ['Windsor']), { name: 'Windsor Library - Pikes Peak' });
  assert.equal(eventLocality({ venue }, cv), 'Frederick');
  assert.equal(eventPlace({ venue }, cv), venue);
  assert.equal(eventPlace({ venue: 'Crist Park', address: '105 5th St, Frederick, CO 80530' }, cv), 'Crist Park, Frederick');
  assert.equal(eventWhere({ venue }, cv), `${venue}, CO`);
  assert.equal(eventWhere({ venue: 'Library', address: '400 S Parish Ave, Johnstown' }, { name: 'Johnstown', state: 'CO' }), 'Library, 400 S Parish Ave, Johnstown, CO');
  const place = ld(cv, { venue }).location;
  assert.equal(place.name, 'Thunder Valley K-8');
  assert.deepEqual(place.address, { '@type': 'PostalAddress', streetAddress: '600 5th Street', addressLocality: 'Frederick', addressRegion: 'CO', addressCountry: 'US' });
  // A Severance school on the Windsor guide, by its section.
  assert.equal((ld(windsor, { venue: 'Severance High School, 1200 Hidden Valley Parkway, Severance', subTown: 'severance' }).location.address as { addressLocality: string }).addressLocality, 'Severance');
  // No street of its own: the address on the venue's own listing, where the guide has one; else none.
  assert.equal((ld(cv, { venue: 'Carbon Valley Regional Library' }, '7 Park Ave, Firestone, CO 80504').location.address as { streetAddress: string }).streetAddress, '7 Park Ave');
  assert.equal('streetAddress' in (ld(cv, { venue: 'Somewhere' }).location.address as object), false);
});

test('an address is split with no comma before the state, and at a town the guide covers with no state', () => {
  assert.deepEqual(postalAddress('170 Grant Ave., Firestone CO 80520', { name: 'Carbon Valley', state: 'CO' }), {
    '@type': 'PostalAddress', streetAddress: '170 Grant Ave.', addressLocality: 'Firestone', addressRegion: 'CO', postalCode: '80520', addressCountry: 'US',
  });
  assert.equal(postalAddress('400 S Parish Ave, Johnstown', { name: 'Johnstown', state: 'CO' }).streetAddress, '400 S Parish Ave');
  assert.equal(postalAddress('101 Second Avenue, Suite B', { name: 'Niwot', state: 'CO' }).streetAddress, '101 Second Avenue, Suite B');
});

test('an online event has a virtual location, not a place in town', () => {
  const online = ld(cv, { venue: 'Online, via the Lyons Regional Library', url: 'https://example.org/e' });
  assert.equal(online.eventAttendanceMode, 'https://schema.org/OnlineEventAttendanceMode');
  assert.deepEqual(online.location, { '@type': 'VirtualLocation', url: 'https://example.org/e' });
  assert.equal(ld(cv, { venue: 'Crist Park' }).eventAttendanceMode, 'https://schema.org/OfflineEventAttendanceMode');
});

test('a landmark is not an event venue; an article always has a modified date and a headline within 110 characters', () => {
  assert.equal(placeSchemaType('venue', ['public-art', 'landmark']), 'TouristAttraction');
  assert.equal(placeSchemaType('venue', ['museum', 'landmark']), 'Museum');
  assert.equal(placeSchemaType('venue', ['concerts']), 'EventVenue');
  const title = 'Frederick with kids: a lazy river, a foam pit, a 30,000-square-foot skate park, storytimes and Santa in Crist Park';
  const date = new Date('2026-09-20T06:00:00Z');
  const article = articleJsonLd(cv, { data: { title, seoTitle: 'Frederick with kids: lazy river, skate park, storytimes', excerpt: 'x', date, category: 'Guide' } } as never, 'https://x/a/');
  assert.equal(article.headline, 'Frederick with kids: lazy river, skate park, storytimes');
  assert.equal(article.dateModified, article.datePublished);
});

test('a snippet is cut where a thought ends, with no ellipsis', () => {
  const list = 'Every place on one list — restaurants, bars & breweries, coffee & sweets, shops, trails, parks & open space, venues, places to stay, services — with what each one is and where.';
  const out = clampSnippet(list, 155);
  assert.ok(!out.endsWith('…') && out.endsWith('.') && out.length <= 155, out);
  assert.equal(clampSnippet('One whole sentence that runs well past the half of the budget it is given here. And a second one that does not fit in it at all, however it is cut.', 100), 'One whole sentence that runs well past the half of the budget it is given here.');
  assert.equal(clampSnippet('Short enough.', 100), 'Short enough.');
});

test('a long event title that ends with its venue drops the venue, which the page gives', () => {
  assert.equal(eventTitle('Gratitude of Presence sound journey at Wildfire Arts Center', 'Nov 20', 'Berthoud', 'Inside Berthoud', 'Wildfire Arts Center'), 'Gratitude of Presence sound journey — Berthoud, Nov 20');
  assert.equal(eventTitle('Njioma Grevious & Friends: Cultural Caravan at the Erie Community Center', 'Nov 20', 'Erie', 'Inside Erie', 'Erie Community Center'), 'Njioma Grevious & Friends: Cultural Caravan — Erie, Nov 20');
  assert.equal(eventTitle('Hoss and the Hangman at City Star', 'Nov 7', 'Berthoud', 'Inside Berthoud', 'City Star'), 'Hoss and the Hangman at City Star — Nov 7');
});

test('a loss at state ends a season without the week’s wait, and a round’s name is not a venue', () => {
  const game = { date: '2026-11-13', opponent: 'Pueblo East', site: 'neutral' as const, url: 'u', stage: 'State Football Playoffs', result: 'L' as const, score: { us: 7, them: 10 } };
  const team = { key: 'football', name: 'Football', overall: '8-4', results: [game], upcoming: [] };
  assert.equal(seasonOver(team, '2026-11-17'), true);
  assert.equal(seasonOver(team, '2026-11-14'), false, 'the next day: a bracket may still name a game');
  assert.equal(seasonOver({ ...team, results: [{ ...game, result: 'W' as const }] }, '2026-11-17'), false, 'a win waits on the draw');
  assert.match(teamDescription({ school: 'Severance High School' }, team as never, 'fall', new Date('2026-11-17T18:00:00Z')), /Season over\./);
  assert.equal('venue' in correctedGame({ ...game, venue: 'State Playoffs Round 1' }, undefined, []), false);
  assert.equal(correctedGame({ ...game, venue: 'Dutch Clark' }, undefined, []).venue, 'Dutch Clark');
});
