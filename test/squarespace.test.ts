/**
 * The Squarespace events page reader. The times are the part that has to be
 * right: the page's "Google Calendar" link carries instants in the site's
 * own time zone setting, which a brewery in Golden leaves on New York, and
 * the guide must show the clock the page shows.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSquarespaceEvents, squarespaceTimeZone, squarespaceView } from '../scripts/lib/feeds/squarespace.ts';
import { toStaged, venueFrom } from '../scripts/lib/ingest.ts';
import { FEED_TYPES, sourceSchema } from '../src/content/schemas.ts';
import { parseLocal, toWallClock } from '../src/lib/dates.ts';

const horizon = { from: parseLocal('2026-11-10'), to: parseLocal('2027-03-10') };

const article = (o: { cls?: string; href: string; title: string; day: string; dates?: string; times?: string; venue?: string; location?: string; excerpt?: string }) => `
<article class="eventlist-event eventlist-event--${o.cls ?? 'upcoming'} eventlist-event--hasimg">
  <a href="${o.href}" class="eventlist-column-thumbnail content-fill"><img alt="${o.title}" src="https://images.example/a.jpg?format=100w"></a>
  <div class="eventlist-column-info">
    <h1 class="eventlist-title"><a href="${o.href}" class="eventlist-title-link">${o.title}</a></h1>
    <ul class="eventlist-meta event-meta">
      <li class="eventlist-meta-item eventlist-meta-date event-meta-item">
        <time class="event-date" datetime="${o.day}">A day</time>
        ${o.times ?? ''}
      </li>
      ${o.venue ? `<li class="eventlist-meta-item eventlist-meta-address event-meta-item">${o.venue} <a href="http://maps.google.com?q=350 Terry Street Longmont, CO, 80501 United States" class="eventlist-meta-address-maplink" target="_blank">(map)</a></li>` : ''}
      ${o.dates ? `<li class="eventlist-meta-item eventlist-meta-export event-meta-item"><a href="http://www.google.com/calendar/event?action=TEMPLATE&text=x&dates=${o.dates}${o.location ? `&location=${o.location}` : ''}" class="eventlist-meta-export-google">Google Calendar</a> <a href="${o.href}?format=ical" class="eventlist-meta-export-ical">ICS</a></li>` : ''}
    </ul>
    ${o.excerpt ? `<div class="eventlist-excerpt"><p>${o.excerpt}</p></div>` : ''}
  </div>
</article>`;

const page = (zone: string, articles: string) => `<!doctype html><html><head><script>Static.SQUARESPACE_CONTEXT = {"website":{"timeZone":"${zone}","language":"en-US"}};</script></head>
<body class="collection-type-events view-list"><div class="eventlist eventlist--upcoming">${articles}</div></body></html>`;

const CIDERY = page(
  'America/Denver',
  [
    article({ href: '/events/music-ingrid-avison', title: 'MUSIC | INGRID AVISON &amp; FRIENDS', day: '2026-11-13', dates: '20261114T013000Z/20261114T033000Z', location: '350%20Terry%20Street%2C%20Longmont%2C%20CO%2C%2080501%2C%20United%20States', venue: 'St. Vrain Cidery', excerpt: 'NO COVER' }),
    article({ href: '/events/art-on-the-wall', title: 'ART | ON THE WALL', day: '2026-10-06', dates: '20261006T220000Z/20270104T030000Z', venue: 'St. Vrain Cidery' }),
    article({ href: '/events/last-month', cls: 'past', title: 'Last month', day: '2026-10-10', dates: '20261011T000000Z/20261011T020000Z' }),
    article({ href: '/events/music-ingrid-avison', title: 'MUSIC | INGRID AVISON &amp; FRIENDS', day: '2026-11-13', dates: '20261114T013000Z/20261114T033000Z' }),
  ].join('\n'),
);

test('a list page is read: title, the page as the id, venue and address, the excerpt', () => {
  assert.equal(squarespaceView(CIDERY), 'list');
  assert.equal(squarespaceTimeZone(CIDERY), 'America/Denver');
  const items = readSquarespaceEvents(CIDERY, 'https://www.stvraincidery.com/events', horizon);
  // The past item is before the horizon and the repeated article is one item; the run is still on.
  assert.deepEqual(items.map((i) => i.uid), ['/events/art-on-the-wall', '/events/music-ingrid-avison']);
  const music = items[1]!;
  assert.equal(music.title, 'MUSIC | INGRID AVISON & FRIENDS');
  assert.equal(music.url, 'https://www.stvraincidery.com/events/music-ingrid-avison');
  assert.equal(toWallClock(music.start), '2026-11-13T18:30');
  assert.equal(toWallClock(music.end!), '2026-11-13T20:30');
  assert.equal(music.allDay, false);
  assert.equal(music.location, 'St. Vrain Cidery, 350 Terry Street, Longmont, CO, 80501');
  assert.equal(music.description, 'NO COVER');
  assert.equal(music.status, 'confirmed');
  const where = venueFrom(music.location, {});
  assert.equal(where.venue, 'St. Vrain Cidery');
  assert.match(where.address ?? '', /^350 Terry Street/);
});

test('a site left on another time zone: the clock the page shows is the clock listed', () => {
  // Mountain Toad, Golden, 10 November 2026: the site is on New York and
  // "Drag Bingo!" was entered as 7:30 pm; the link says 00:30Z, which is
  // 7:30 pm Eastern and 5:30 pm in Golden. The taproom means 7:30.
  const html = page('America/New_York', article({ href: '/events/2025/9/26/drag-bingo', title: 'Drag Bingo!', day: '2026-11-14', dates: '20261115T003000Z/20261115T030000Z', venue: 'Mountain Toad Brewing' }));
  const [bingo] = readSquarespaceEvents(html, 'https://www.mountaintoadbrewing.com/events', horizon);
  assert.equal(toWallClock(bingo!.start), '2026-11-14T19:30');
  assert.equal(toWallClock(bingo!.end!), '2026-11-14T22:00');
  // The map link alone, where the calendar link has no location.
  assert.equal(bingo!.location, 'Mountain Toad Brewing, 350 Terry Street Longmont, CO, 80501');
});

test('without the export links the printed day and time are read', () => {
  const times = `<span class="event-time-12hr"><time class="event-time-12hr-start" datetime="2026-12-05">10:00 AM</time><time class="event-time-12hr-end" datetime="2026-12-05">5:00 PM</time></span><span class="event-time-24hr"><time class="event-time-24hr-start" datetime="2026-12-05">10:00</time><time class="event-time-24hr-end" datetime="2026-12-05">17:00</time></span>`;
  const html = page('America/Denver', article({ href: '/events/holiday-market', title: 'Holiday Mountain Market', day: '2026-12-05', times }) + article({ href: '/events/gives-day', title: 'A day with no time', day: '2026-12-08' }));
  const [market, day] = readSquarespaceEvents(html, 'https://example.org/events', horizon);
  assert.equal(toWallClock(market!.start), '2026-12-05T10:00');
  assert.equal(toWallClock(market!.end!), '2026-12-05T17:00');
  assert.equal(market!.allDay, false);
  assert.equal(day!.allDay, true);
  assert.equal(toWallClock(day!.start), '2026-12-08');
});

test('a cancellation written into the title is the status', () => {
  const html = page('America/Denver', article({ href: '/events/show', title: 'CANCELLED: Next Stop Comedy', day: '2026-11-14', dates: '20261115T030000Z/20261115T043000Z' }));
  const [show] = readSquarespaceEvents(html, 'https://example.org/events', horizon);
  assert.equal(show!.title, 'Next Stop Comedy');
  assert.equal(show!.status, 'cancelled');
});

test('the calendar grid and a page that is not an events page are told apart', () => {
  assert.equal(squarespaceView('<body class="collection-type-events view-list"><div class="sqs-events-collection-calendar"></div></body>'), 'calendar');
  assert.equal(squarespaceView('<body class="collection-type-page"><p>Hours</p></body>'), 'none');
  // A list with nothing coming up is still a list: no items, no error.
  const empty = page('America/Denver', '');
  assert.equal(squarespaceView(empty), 'list');
  assert.deepEqual(readSquarespaceEvents(empty, 'https://example.org/events', horizon), []);
});

test('squarespace is a feed type: it needs its feedUrl, and a staged item validates', () => {
  assert.ok(FEED_TYPES.includes('squarespace'));
  const base = { id: 'stvraincidery-com', name: 'St. Vrain Cidery', url: 'https://www.stvraincidery.com/events', category: 'venue', status: 'proposed' };
  assert.throws(() => sourceSchema.parse({ ...base, type: 'squarespace' }), /feedUrl/);
  const source = sourceSchema.parse({ ...base, type: 'squarespace', feedUrl: 'https://www.stvraincidery.com/events' });
  const [, music] = readSquarespaceEvents(CIDERY, source.feedUrl!, horizon);
  const staged = toStaged(music!, source, 'longmont', '2026-11-10');
  assert.equal(staged.frontmatter.venue, 'St. Vrain Cidery');
  assert.equal(toWallClock(staged.frontmatter.start as Date), '2026-11-13T18:30');
  assert.equal(staged.frontmatter.sourceUid, '/events/music-ingrid-avison');
});
