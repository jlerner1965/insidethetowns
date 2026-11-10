/**
 * The Eventbrite page reader and the SociableKIT events reader. An
 * Eventbrite event's time is a clock in its own zone; an organizer's page
 * repeats the start as the end; a place's page lists the whole region.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventbritePageData, eventbritePageKind, eventbritePlacePage, readEventbriteEvents } from '../scripts/lib/feeds/eventbrite.ts';
import { isSociableKitFeed, readSociableKit } from '../scripts/lib/feeds/sociablekit.ts';
import { passesLocationFilter, toStaged, venueFrom } from '../scripts/lib/ingest.ts';
import { FEED_TYPES, sourceSchema } from '../src/content/schemas.ts';
import { parseLocal, toWallClock } from '../src/lib/dates.ts';

const horizon = { from: parseLocal('2026-11-10'), to: parseLocal('2027-03-10') };

const venue = (name: string, street: string, city: string, zip: string) => ({ name, address: { address_1: street, city, region: 'CO', postal_code: zip, localized_address_display: `${street}, ${city}, CO ${zip}` } });
const DANCE = {
  id: '2002575036843',
  name: 'Toys In The Attic',
  url: 'https://www.eventbrite.com/e/toys-in-the-attic-tickets-2002575036843?aff=ebdssbdestsearch',
  start_date: '2026-11-14',
  start_time: '18:30',
  end_date: '2026-11-14',
  end_time: '20:30',
  timezone: 'America/Denver',
  is_cancelled: null,
  is_online_event: false,
  summary: 'Come peek inside the attic.',
  primary_venue: venue('Niwot High School Auditorium', '8989 Niwot Road', 'Niwot', '80503'),
};
const BOULDER = { ...DANCE, id: '1998452752981', name: 'Next Stop Comedy at Avery Brewing Company! - Boulder, CO', start_date: '2026-11-25', start_time: '19:00', end_date: '2026-11-25', end_time: '21:00', primary_venue: venue('Avery Brewing Company', '4910 Nautilus Court North', 'Boulder', '80301') };

const placePage = (results: unknown[]) => `<html><body><script>window.__SERVER_DATA__ = ${JSON.stringify({ env: { note: 'a } brace in a "string" must not end it' }, search_data: { events: { pagination: { page_size: 20, object_count: 4910, page_count: 49 }, results } } })};</script></body></html>`;
const organizerPage = (upcomingEvents: unknown[], hasMoreUpcoming = false) => `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { organizer: { id: '18605098376', name: 'Streetside Dance' }, upcomingEvents, hasMoreUpcoming } } })}</script></body></html>`;

test('the two page kinds are told from their addresses', () => {
  assert.equal(eventbritePageKind('https://www.eventbrite.com/o/streetside-dance-18605098376'), 'organizer');
  assert.equal(eventbritePageKind('https://www.eventbrite.com/d/co--niwot/all-events/'), 'place');
  assert.equal(eventbritePageKind('https://www.eventbrite.com/e/toys-in-the-attic-tickets-2002575036843'), undefined);
  assert.equal(eventbritePageKind('https://example.com/o/someone'), undefined);
  assert.equal(eventbritePlacePage('https://www.eventbrite.com/d/co--niwot/all-events/', 1), 'https://www.eventbrite.com/d/co--niwot/all-events/');
  assert.equal(eventbritePlacePage('https://www.eventbrite.com/d/co--niwot/all-events/', 3), 'https://www.eventbrite.com/d/co--niwot/all-events/?page=3');
});

test('a place page: the clock in the event\'s zone, the venue and its address, the page count', () => {
  const page = eventbritePageData(placePage([BOULDER, DANCE, { ...DANCE, id: 'online', is_online_event: true }, DANCE]));
  assert.equal(page?.pageCount, 49);
  const items = readEventbriteEvents(page!.events, horizon);
  // Soonest first; the online event and the repeated row are not listed.
  assert.deepEqual(items.map((i) => i.uid), ['2002575036843', '1998452752981']);
  const dance = items[0]!;
  assert.equal(dance.title, 'Toys In The Attic');
  assert.equal(toWallClock(dance.start), '2026-11-14T18:30');
  assert.equal(toWallClock(dance.end!), '2026-11-14T20:30');
  assert.equal(dance.location, 'Niwot High School Auditorium, 8989 Niwot Road, Niwot, CO 80503');
  // The search's tracking parameter is not part of the ticket page's address.
  assert.equal(dance.url, 'https://www.eventbrite.com/e/toys-in-the-attic-tickets-2002575036843');
  assert.equal(dance.description, 'Come peek inside the attic.');
  const where = venueFrom(dance.location, {});
  assert.equal(where.venue, 'Niwot High School Auditorium');
  // The region's list is kept to the town by the source's location filter.
  assert.equal(passesLocationFilter(dance, { locationFilter: ['Niwot, CO'] }), true);
  assert.equal(passesLocationFilter(items[1]!, { locationFilter: ['Niwot, CO'] }), false);
});

test('an organizer page: an end that repeats the start is dropped, and the price is read', () => {
  const html = organizerPage([
    { ...DANCE, start_time: '18:30:00', end_time: '18:30:00', is_cancelled: false, ticket_availability: { is_free: false, is_sold_out: false, minimum_ticket_price: { major_value: '23.18', currency: 'USD' }, maximum_ticket_price: { major_value: '23.18', currency: 'USD' } } },
    { ...DANCE, id: 'free', name: 'Open House', start_date: '2026-12-01', ticket_availability: { is_free: true, is_sold_out: true } },
    { ...DANCE, id: 'gone', name: 'Winter Show', start_date: '2026-12-12', is_cancelled: true },
  ]);
  const page = eventbritePageData(html);
  assert.equal(page?.more, false);
  const [dance, open, winter] = readEventbriteEvents(page!.events, horizon);
  assert.equal(toWallClock(dance!.start), '2026-11-14T18:30');
  assert.equal(dance!.end, undefined);
  assert.equal(dance!.cost, 'From $23.18, fees included');
  assert.equal(open!.cost, 'Free (sold out when read)');
  assert.equal(winter!.status, 'cancelled');
});

test('an event in another zone is the instant its own clock names', () => {
  const [show] = readEventbriteEvents([{ ...DANCE, timezone: 'America/Chicago', start_time: '19:30', end_time: '21:00' }], horizon);
  assert.equal(toWallClock(show!.start), '2026-11-14T18:30');
});

test('a page that is neither kind carries nothing', () => {
  assert.equal(eventbritePageData('<html><body>Just a moment…</body></html>'), undefined);
});

test('eventbrite is a feed type, and a staged item validates', () => {
  assert.ok(FEED_TYPES.includes('eventbrite'));
  const source = sourceSchema.parse({ id: 'eventbrite-com-streetside-dance', name: 'Streetside Dance (Eventbrite)', url: 'https://www.eventbrite.com/o/18605098376', feedUrl: 'https://www.eventbrite.com/o/18605098376', type: 'eventbrite', category: 'venue', status: 'proposed' });
  const [dance] = readEventbriteEvents([DANCE], horizon);
  const staged = toStaged(dance!, source, 'niwot', '2026-11-10');
  assert.equal(staged.frontmatter.venue, 'Niwot High School Auditorium');
  assert.equal(staged.frontmatter.sourceUid, '2002575036843');
});

test('SociableKIT: instants, an end equal to the start dropped, the country off the address', () => {
  assert.equal(isSociableKitFeed('https://data.accentapi.com/feed/25613355.json'), true);
  assert.equal(isSociableKitFeed('https://example.com/feed/1.json'), false);
  const items = readSociableKit(
    {
      events: [
        { event_id: '1', event_time_id: '1', name: 'MainGrass - 11/27/26', event_start_utc: '2026-11-28T01:00:00.000Z', event_end_utc: '2026-11-28T01:00:00.000Z', location: '6035 Longbow Dr, Boulder, CO 80301-3256, United States', html_link: 'https://www.facebook.com/events/1', description: '<div>Free bluegrass</div>' },
        { event_id: '2', event_time_id: '2', name: 'DJ Night with DJ Gourmet and Asano', event_start_utc: '2026-11-22T02:00:00.000Z', event_end_utc: '2026-11-22T06:00:00.000Z', location: '6035 Longbow Drive Unit 9, Boulder, CO' },
        { event_id: '3', name: 'Last month', event_start_utc: '2026-10-01T01:00:00.000Z' },
      ],
    },
    horizon,
  );
  assert.deepEqual(items.map((i) => i.title), ['DJ Night with DJ Gourmet and Asano', 'MainGrass']);
  assert.equal(toWallClock(items[0]!.start), '2026-11-21T19:00');
  assert.equal(toWallClock(items[0]!.end!), '2026-11-21T23:00');
  assert.equal(toWallClock(items[1]!.start), '2026-11-27T18:00');
  assert.equal(items[1]!.end, undefined);
  assert.equal(items[1]!.location, '6035 Longbow Dr, Boulder, CO 80301-3256');
  assert.equal(items[1]!.description, 'Free bluegrass');
});
