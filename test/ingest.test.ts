/**
 * Ingest: feeds in, staged files and change notes out, nothing published.
 *
 * The dates are the part that has to be right. A weekly storytime at 10:30
 * in a Google calendar crosses the November clock change and must still be
 * 10:30; a LibCal stamp is UTC; a CivicPlus item is a wall-clock string in
 * an English date. Each is pinned here with the instant it must become.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { civicPlusLocation, readIcal, urlAndDescription } from '../scripts/lib/feeds/ical.ts';
import { parseClock, parseLongDate, readRss } from '../scripts/lib/feeds/rss.ts';
import { readTribePage, tribeFirstPage } from '../scripts/lib/feeds/tribe.ts';
import { plainText } from '../scripts/lib/feeds/types.ts';
import { detectChanges, excludedTitle, fingerprint, guessCategory, hostOf, matchExisting, passesLocationFilter, siblingCounts, titleSimilarity, toStaged, venueFrom } from '../scripts/lib/ingest.ts';
import { eventFile, slugify } from '../scripts/lib/event-files.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { eventSchema, sourceSchema } from '../src/content/schemas.ts';
import { parseLocal, toWallClock } from '../src/lib/dates.ts';

const horizon = { from: parseLocal('2026-10-04'), to: parseLocal('2027-02-01') };
const denver = (s: string) => parseLocal(s).getTime();

const GOOGLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VTIMEZONE
TZID:America/Denver
BEGIN:DAYLIGHT
TZOFFSETFROM:-0700
TZOFFSETTO:-0600
TZNAME:MDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0600
TZOFFSETTO:-0700
TZNAME:MST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=America/Denver:20260922T103000
DTEND;TZID=America/Denver:20260922T110000
RRULE:FREQ=WEEKLY;UNTIL=20261215T065959Z;BYDAY=TU
EXDATE;TZID=America/Denver:20261124T103000
UID:storytime@example
SUMMARY:Toddler Storytime
LOCATION:Elizabeth Library of Pines & Plains Libraries\\, 651 Beverly St\\, Elizabeth\\, CO 80107\\, USA
DESCRIPTION:Songs and stories for ages 1-3.
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=America/Denver:20261110T160000
DTEND;TZID=America/Denver:20261110T163000
RECURRENCE-ID;TZID=America/Denver:20261110T103000
UID:storytime@example
SUMMARY:Toddler Storytime (afternoon this week)
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20261128
DTEND;VALUE=DATE:20261130
UID:bookfair@example
SUMMARY:Holiday Book Fair
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
DTSTART:20261006T163000Z
DTEND:20261006T171500Z
UID:11882
SUMMARY:Baby Storytime & Stay-and-Play
LOCATION:451 4th Ave\\, Lyons\\, CO\\, 80540\\, US
STATUS:CANCELLED
END:VEVENT
BEGIN:VEVENT
DTSTART;TZID=America/Denver:20250101T100000
UID:long-ago@example
SUMMARY:Last year
END:VEVENT
END:VCALENDAR
`;

test('a weekly rule keeps its wall-clock time across the clock change, honours EXDATE and a moved instance', () => {
  const events = readIcal(GOOGLE_ICS, horizon);
  const storytimes = events.filter((e) => e.uid.startsWith('storytime@example'));
  const starts = storytimes.map((e) => toWallClock(e.start));
  // Tuesdays from 6 October to 8 December, minus 24 November, with 10 November moved to 4 pm.
  assert.ok(starts.includes('2026-10-06T10:30'), starts.join(' '));
  assert.ok(starts.includes('2026-10-27T10:30'));
  assert.ok(starts.includes('2026-11-03T10:30'), 'the Tuesday after the clock change is still 10:30');
  assert.ok(!starts.includes('2026-11-24T10:30'), 'EXDATE removed 24 November');
  assert.ok(starts.includes('2026-11-10T16:00'), 'the RECURRENCE-ID override moved 10 November to 4 pm');
  assert.ok(!starts.includes('2026-11-10T10:30'));
  assert.equal(storytimes.find((e) => toWallClock(e.start) === '2026-11-10T16:00')?.title, 'Toddler Storytime (afternoon this week)');
  assert.ok(starts.every((s) => s < '2026-12-16'), 'UNTIL respected');
  assert.equal(storytimes[0]!.uid, 'storytime@example/2026-10-06');
  // 10:30 Denver is 16:30Z in October and 17:30Z in November: the instants differ, the clock does not.
  assert.equal(storytimes.find((e) => toWallClock(e.start) === '2026-10-06T10:30')!.start.toISOString(), '2026-10-06T16:30:00.000Z');
  assert.equal(storytimes.find((e) => toWallClock(e.start) === '2026-11-03T10:30')!.start.toISOString(), '2026-11-03T17:30:00.000Z');
});

test('all-day, UTC-stamped and cancelled items, and anything outside the horizon', () => {
  const events = readIcal(GOOGLE_ICS, horizon);
  const fair = events.find((e) => e.uid === 'bookfair@example')!;
  assert.equal(fair.allDay, true);
  assert.equal(toWallClock(fair.start), '2026-11-28');
  assert.equal(toWallClock(fair.end!), '2026-11-29', 'DTEND is exclusive; the schema wants the last day');
  const baby = events.find((e) => e.uid === '11882')!;
  assert.equal(toWallClock(baby.start), '2026-10-06T10:30', 'a Z stamp converts to Denver');
  assert.equal(baby.status, 'cancelled');
  assert.equal(events.some((e) => e.uid === 'long-ago@example'), false);
});

const CIVICPLUS = `<?xml version="1.0"?><rss version="2.0" xmlns:calendarEvent="https://www.berthoud.org/Calendar.aspx"><channel>
<title>Berthoud, CO - Calendar</title>
<item>
  <title>Open Gym 11am- 8pm</title>
  <link>https://www.berthoud.org/Calendar.aspx?EID=6863</link>
  <description>&lt;strong&gt;Event date:&lt;/strong&gt; October 4, 2026 &lt;br&gt;&lt;strong&gt;Event Time: &lt;/strong&gt;11:00 AM - 08:00 PM</description>
  <calendarEvent:EventDates> October 4, 2026 </calendarEvent:EventDates>
  <calendarEvent:EventTimes>11:00 AM - 08:00 PM</calendarEvent:EventTimes>
  <calendarEvent:Location>1000 N Berthoud ParkwayBerthoud, CO 80513</calendarEvent:Location>
  <guid isPermaLink="false">https://www.berthoud.org/Calendar.aspx?EID=6863/639234406150000000</guid>
</item>
<item>
  <title>Halloween Costume Exchange Collection</title>
  <link>https://www.erieco.gov/Calendar.aspx?EID=5467</link>
  <calendarEvent:EventDates>August 24, 2026 - October 14, 2026</calendarEvent:EventDates>
  <calendarEvent:EventTimes>08:00 AM - 05:00 PM</calendarEvent:EventTimes>
  <calendarEvent:Location>Erie, CO 80516</calendarEvent:Location>
</item>
<item>
  <title>Town Hall closed</title>
  <link>https://www.erieco.gov/Calendar.aspx?EID=5500</link>
  <calendarEvent:EventDates>November 26, 2026</calendarEvent:EventDates>
</item>
<item>
  <title>Cemetery Cleanup Week</title>
  <link>https://johnstownco.gov/Calendar.aspx?EID=77</link>
  <calendarEvent:EventDates>October 5, 2026 - October 10, 2026</calendarEvent:EventDates>
  <calendarEvent:EventTimes>12:00 AM - 11:59 PM</calendarEvent:EventTimes>
  <calendarEvent:Location>Council Chambers&lt;br&gt;645 Holbrook Street&lt;br&gt;P.O. Box 750Erie, CO 80516</calendarEvent:Location>
</item>
<item>
  <title>Road closure notice</title>
  <link>https://www.erieco.gov/CivicAlerts.aspx?AID=9</link>
  <description>News, not an event.</description>
</item>
</channel></rss>`;

test('CivicPlus calendar RSS: English dates and 12-hour times become Denver instants; news items are counted, not guessed', () => {
  assert.deepEqual(parseLongDate(' October 4, 2026 '), [2026, 10, 4]);
  assert.deepEqual(parseClock('12:15 AM'), [0, 15]);
  assert.deepEqual(parseClock('12:30 PM'), [12, 30]);
  assert.deepEqual(parseClock('08:00 PM'), [20, 0]);
  const { events, skipped } = readRss(CIVICPLUS, horizon);
  assert.equal(skipped, 1);
  assert.equal(events.length, 4);
  const gym = events[0]!;
  assert.equal(gym.uid, 'EID=6863');
  assert.equal(toWallClock(gym.start), '2026-10-04T11:00');
  assert.equal(toWallClock(gym.end!), '2026-10-04T20:00');
  assert.equal(gym.location, '1000 N Berthoud Parkway, Berthoud, CO 80513');
  const range = events[1]!;
  assert.equal(toWallClock(range.start), '2026-08-24T08:00');
  assert.equal(toWallClock(range.end!), '2026-10-14T17:00', 'a date range ends on its last day');
  const closed = events[2]!;
  assert.equal(closed.allDay, true);
  assert.equal(toWallClock(closed.start), '2026-11-26');
  const week = events[3]!;
  assert.equal(week.allDay, true, '12:00 AM to 11:59 PM is a day-long entry');
  assert.equal(toWallClock(week.start), '2026-10-05');
  assert.equal(toWallClock(week.end!), '2026-10-10');
  assert.equal(week.location, 'Council Chambers, 645 Holbrook Street, P.O. Box 750, Erie, CO 80516', 'the escaped <br> is a line break, and the city gets its own part');
});

const LIBCAL = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:libcal="https://libcal.com/rss_xmlns.php"><channel>
<item><title>Science Fun</title><link>https://highplains.libcal.com/event/17000001</link>
<description>&lt;strong&gt;Date:&lt;/strong&gt; Wednesday, October 7, 2026&lt;br/&gt;</description>
<category>Science</category><category>Kids</category>
<guid>https://highplains.libcal.com/event/17000001</guid>
<libcal:eventid>17000001</libcal:eventid><libcal:date>2026-10-07</libcal:date><libcal:start>16:00:00</libcal:start><libcal:end>17:00:00</libcal:end>
<libcal:description>&#x3C;p&gt;Hands-on experiments for ages 6&#x26;ndash;11.&#x3C;/p&gt;</libcal:description>
<libcal:campus>Carbon Valley Regional Library</libcal:campus><libcal:location>Carbon Valley Storytime Room</libcal:location></item>
<item><title>Cancelled: Ageless Grace®</title><link>https://highplains.libcal.com/event/17000002</link>
<guid>https://highplains.libcal.com/event/17000002</guid>
<libcal:eventid>17000002</libcal:eventid><libcal:date>2026-10-12</libcal:date><libcal:start>14:00:00</libcal:start><libcal:end>15:00:00</libcal:end>
<libcal:campus>Carbon Valley Regional Library</libcal:campus><libcal:location></libcal:location></item>
<item><title>Image Hunt</title><link>https://highplains.libcal.com/event/17000003</link>
<guid>https://highplains.libcal.com/event/17000003</guid>
<libcal:eventid>17000003</libcal:eventid><libcal:date>2026-10-06</libcal:date><libcal:start>00:00:00</libcal:start><libcal:end>23:59:59</libcal:end>
<libcal:campus>Kersey Library</libcal:campus><libcal:location></libcal:location></item>
<item><title>Long gone</title><link>https://highplains.libcal.com/event/1</link>
<libcal:eventid>1</libcal:eventid><libcal:date>2026-08-04</libcal:date><libcal:start>10:00:00</libcal:start><libcal:end>11:00:00</libcal:end>
<libcal:campus>Erie Community Library</libcal:campus></item>
</channel></rss>`;

test("LibCal RSS: the libcal elements carry the facts; a room and its branch make the location; 'Cancelled:' is a status", () => {
  const { events, skipped } = readRss(LIBCAL, horizon);
  assert.equal(skipped, 0);
  assert.equal(events.length, 3, 'the August item is outside the horizon');
  const science = events[0]!;
  assert.equal(science.uid, 'libcal:17000001');
  assert.equal(toWallClock(science.start), '2026-10-07T16:00');
  assert.equal(toWallClock(science.end!), '2026-10-07T17:00');
  assert.equal(science.location, 'Carbon Valley Storytime Room, Carbon Valley Regional Library');
  assert.equal(science.description, 'Hands-on experiments for ages 6–11.');
  assert.deepEqual(science.categories, ['Science', 'Kids']);
  assert.equal(science.status, 'confirmed');
  const grace = events[1]!;
  assert.equal(grace.title, 'Ageless Grace®', 'the prefix comes off the title');
  assert.equal(grace.status, 'cancelled');
  assert.equal(grace.location, 'Carbon Valley Regional Library', 'no room, so the branch alone');
  const hunt = events[2]!;
  assert.equal(hunt.allDay, true, '00:00:00 to 23:59:59 is a day-long entry');
  assert.equal(toWallClock(hunt.start), '2026-10-06');
  // The district-wide feed is narrowed to a branch by the registry's locationFilter.
  assert.equal(passesLocationFilter(science, { locationFilter: ['Carbon Valley'] }), true);
  assert.equal(passesLocationFilter(hunt, { locationFilter: ['Carbon Valley'] }), false);
});

test('a non-breaking space is a space: in feed text and in the title exclusions', () => {
  assert.equal(plainText('Ageless\u00a0Grace&nbsp;®'), 'Ageless Grace ®');
  assert.equal(excludedTitle({ title: 'Ageless\u00a0Grace®' }, { excludeTitles: ['Ageless Grace'] }), true, 'even a title that reached the matcher unconverted');
});

test("a site's ids are its own: a file read from another site with the same id is not that event", () => {
  const item: FeedEvent = { uid: '2690', title: 'Halloween Safe Night', start: parseLocal('2026-10-23T17:00'), allDay: false, categories: [], status: 'confirmed', url: 'https://www.firestoneco.gov/calendar.aspx?EID=2690' };
  const theirs: ExistingEvent = { file: 'x', slug: 'x', staged: false, title: 'City Council Meeting', start: parseLocal('2026-10-12T18:00'), venue: 'Dacono City Hall', sourceUid: '2690', sourceHost: 'daconoco.gov' };
  assert.equal(hostOf(item.url), 'firestoneco.gov', 'without the www');
  assert.equal(matchExisting(item, [theirs], 1, undefined, hostOf(item.url)).kind, 'none', "Dacono's 2690 is not Firestone's");
  assert.equal(matchExisting(item, [theirs], 1, undefined, 'daconoco.gov').kind, 'published', 'the same site, the same event, whichever of its feeds it came by');
  assert.equal(matchExisting(item, [{ ...theirs, sourceHost: undefined }], 1, undefined, 'firestoneco.gov').kind, 'published', 'a file whose host is unknown still matches by id, as before');
});

const CIVICPLUS_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:iCalendar-Ruby
BEGIN:VEVENT
DESCRIPTION: https://www.firestoneco.gov/calendar.aspx?EID=2690
DTEND;TZID=America/Denver:20261023T200000
DTSTART;TZID=America/Denver:20261023T170000
LOCATION:Miners Park - 170 Grant Ave.   Firestone CO 80520
SUMMARY:Halloween Safe Night
UID:2690
URL:/common/modules/iCalendar/iCalendar.aspx?feed=calendar&catID=33
END:VEVENT
BEGIN:VEVENT
DESCRIPTION: https://www.frederickco.gov/calendar.aspx?EID=4287
DTEND;VALUE=DATE:20261205
DTSTART;VALUE=DATE:20261205
LOCATION: - 105 Fifth Street  Frederick CO 80530
SUMMARY:Festival of Lights
UID:4287
URL:/common/modules/iCalendar/iCalendar.aspx?feed=calendar&catID=34
END:VEVENT
END:VCALENDAR`;

test('CivicPlus iCal: the event page comes out of the description, a same-day all-day end is no end, and the location is split for venueFrom', () => {
  const events = readIcal(CIVICPLUS_ICS, horizon);
  assert.equal(events.length, 2);
  const night = events[0]!;
  assert.equal(night.url, 'https://www.firestoneco.gov/calendar.aspx?EID=2690', 'the relative URL property is dropped for the page in the text');
  assert.equal(night.description, undefined, 'and the text was only that address');
  assert.equal(night.location, 'Miners Park, 170 Grant Ave., Firestone CO 80520');
  assert.deepEqual(venueFrom(night.location, {}), { venue: 'Miners Park', address: '170 Grant Ave., Firestone CO 80520', guessed: true });
  const lights = events[1]!;
  assert.equal(lights.allDay, true);
  assert.equal(lights.end, undefined, 'DTEND on the start day would be the day before');
  assert.equal(lights.location, '105 Fifth Street, Frederick CO 80530', 'an empty name leaves the address');
  assert.equal(venueFrom(lights.location, {}).venue, undefined, 'no venue to guess, only an address');
  assert.equal(civicPlusLocation('<p><span style="x">Chick-fil-A in Firestone</span></p> - 4405 Firestone Blvd.  Firestone CO 80504'), 'Chick-fil-A in Firestone, 4405 Firestone Blvd., Firestone CO 80504', 'pasted HTML comes off');
  assert.equal(civicPlusLocation(' -   Dacono CO 80514'), 'Dacono CO 80514');
  assert.equal(civicPlusLocation('Council Chambers, 645 Holbrook Street'), 'Council Chambers, 645 Holbrook Street', 'anything else passes through');
  assert.deepEqual(urlAndDescription('https://a.example/x', 'text'), { url: 'https://a.example/x', description: 'text' });
  assert.deepEqual(urlAndDescription(undefined, 'Join us. https://a.example/p?EID=1'), { url: 'https://a.example/p?EID=1', description: 'Join us.' });
});

test('The Events Calendar REST: UTC pair preferred, venue assembled, pagination URL built', () => {
  const page = {
    events: [
      {
        id: 10001725,
        status: 'publish',
        title: 'Music &#038; Movement Storytime',
        url: 'https://johnstownmillikenpubliclibraries.us/event/music-movement-storytime-7/2026-10-05/1/',
        start_date: '2026-10-05 10:00:00',
        end_date: '2026-10-05 11:00:00',
        utc_start_date: '2026-10-05 16:00:00',
        utc_end_date: '2026-10-05 17:00:00',
        timezone: 'America/Denver',
        all_day: false,
        modified: '2026-09-04 11:36:04',
        venue: { venue: 'Johnstown Location', address: '400 S Parish Ave', city: 'Johnstown' },
        categories: [{ name: 'Kids' }],
        description: '<p>Twinkle, twinkle.</p>',
      },
      { id: 2, title: 'Closed for the holiday', start_date: '2026-11-26 00:00:00', end_date: '2026-11-26 23:59:59', all_day: true, timezone: 'America/Denver' },
    ],
  };
  const events = readTribePage(page, horizon);
  assert.equal(events.length, 2);
  assert.equal(events[0]!.title, 'Music & Movement Storytime');
  assert.equal(toWallClock(events[0]!.start), '2026-10-05T10:00');
  assert.equal(events[0]!.location, 'Johnstown Location, 400 S Parish Ave, Johnstown');
  assert.deepEqual(events[0]!.categories, ['Kids']);
  assert.equal(events[0]!.description, 'Twinkle, twinkle.');
  assert.equal(events[1]!.allDay, true);
  const first = new URL(tribeFirstPage('https://x.org/wp-json/tribe/events/v1/events', parseLocal('2026-10-04')));
  assert.equal(first.searchParams.get('per_page'), '50');
  assert.equal(first.searchParams.get('start_date'), '2026-10-04');
  assert.equal(plainText('A &amp; B&lt;br&gt;<b>c</b>&#8217;s'), 'A & B\nc’s', 'escaped HTML inside a feed string is still HTML');
});

const source = (extra: Record<string, unknown> = {}) =>
  sourceSchema.parse({ id: 'lib', name: 'library.example', url: 'https://library.example/', type: 'ical', feedUrl: 'https://library.example/feed.ics', category: 'library', status: 'confirmed', ...extra });

test('venue from a feed location: the editor\'s alias or default wins, then the first part that is not a room or an address', () => {
  assert.deepEqual(venueFrom('Johnstown Location, 400 S Parish Ave, Johnstown', source({ venueAliases: { 'Johnstown Location': 'Glenn A. Jones, M.D. Memorial Library' } })), {
    venue: 'Glenn A. Jones, M.D. Memorial Library',
    address: '400 S Parish Ave, Johnstown',
    guessed: false,
  });
  assert.equal(venueFrom('Erie Storytime Room, Erie Community Library', source({ defaultVenue: 'Erie Community Library' })).venue, 'Erie Community Library');
  const guessed = venueFrom('Erie Storytime Room, Erie Community Library', source());
  assert.equal(guessed.venue, 'Erie Community Library');
  assert.equal(guessed.guessed, true);
  assert.deepEqual(venueFrom('451 4th Ave, Lyons, CO, 80540, US', source({ defaultVenue: 'Lyons Regional Library' })), {
    venue: 'Lyons Regional Library',
    address: '451 4th Ave, Lyons, CO, 80540',
    guessed: false,
  });
  // A department's default covers its own building, rooms and bare
  // addresses, not another place the location names: the library's film at
  // the museum is at the museum, and only a guess, so it flags no move.
  const elsewhere = venueFrom('Longmont Museum, 400 Quail Rd., Longmont, CO, 80501, United States', source({ defaultVenue: 'Longmont Public Library' }));
  assert.equal(elsewhere.venue, 'Longmont Museum');
  assert.equal(elsewhere.guessed, true);
  assert.equal(venueFrom('Longmont Public Library, 355 Emery St., Longmont, CO, 80501, United States', source({ defaultVenue: 'Longmont Public Library' })).guessed, false);
  assert.equal(venueFrom('Berthoud, CO 80513', source()).venue, undefined);
  assert.equal(venueFrom(undefined, source()).venue, undefined);
});

test('a location filter keeps the town\'s items from a district-wide feed', () => {
  const item = { title: 'Storytime', location: 'Erie Community Library', categories: [], start: new Date(), allDay: false, uid: '1', status: 'confirmed' as const };
  assert.equal(passesLocationFilter(item, source({ locationFilter: ['Erie'] })), true);
  assert.equal(passesLocationFilter({ ...item, location: 'Farr Regional Library' }, source({ locationFilter: ['Erie'] })), false);
  assert.equal(passesLocationFilter({ ...item, location: undefined }, source()), true);
});

test('categories are guessed from the feed\'s words and never asserted', () => {
  assert.equal(guessCategory({ title: 'Board of Trustees Meeting', categories: [] }).category, 'civic');
  assert.equal(guessCategory({ title: 'Baby Storytime', categories: ['Storytime'] }).category, 'family');
  assert.equal(guessCategory({ title: 'Blood drive', categories: [] }).category, 'other');
  assert.equal(guessCategory({ title: 'Blood drive', categories: [] }).guessed, true);
});

test('matching: the feed id first, then the same day and nearly the same title, and a different time is a different session', () => {
  const existing = [
    { file: 'a.md', slug: 'baby-storytime-2026-10-06', staged: false, title: 'Baby Storytime and Stay-and-Play', start: parseLocal('2026-10-06T10:30'), venue: 'Lyons Regional Library' },
    { file: 'b.md', slug: 'trivia', staged: true, title: 'Trivia Night', start: parseLocal('2026-10-06T18:00'), venue: 'The Tap', sourceUid: 'EID=9' },
  ];
  const item = { uid: 'x', title: 'Baby Storytime & Stay-and-Play', start: parseLocal('2026-10-06T10:30'), allDay: false, categories: [], status: 'confirmed' as const };
  assert.equal(matchExisting(item, existing).kind, 'published');
  assert.equal(matchExisting({ ...item, start: parseLocal('2026-10-06T14:00') }, existing).kind, 'published', 'alone on its day, a moved time is the same event moved');
  assert.equal(matchExisting({ ...item, start: parseLocal('2026-10-06T14:00') }, existing, 2).kind, 'none', 'with a sibling that day, the time tells them apart');
  assert.equal(matchExisting({ ...item, start: parseLocal('2026-10-13T10:30') }, existing).kind, 'none', 'another week');
  assert.equal(matchExisting({ ...item, uid: 'EID=9', title: 'Pub Quiz' }, existing).kind, 'staged', 'the feed id wins');
  assert.ok(titleSimilarity('Baby Storytime & Stay-and-Play', 'Baby Storytime and Stay-and-Play') > 0.9);
  assert.ok(titleSimilarity('Board of Trustees', 'Planning Commission') < 0.2);
  const two = [item, { ...item, uid: 'y', start: parseLocal('2026-10-06T14:00') }];
  assert.deepEqual([...siblingCounts(two).values()], [2, 2]);
});

test('a file another item owns by id this run is never taken by a similar title', () => {
  // The Longmont case of 4 October 2026: the council's visit to the market
  // was staged first, and the market itself, from another feed the same
  // morning, matched it by title and overwrote it.
  const existing = [
    { file: 'c.md', slug: 'council-at-longmont-farmers-market-2026-10-24', staged: true, title: 'Council at Longmont Farmers Market', start: parseLocal('2026-10-24T09:00'), venue: 'Boulder County Fairgrounds', sourceUid: 'council-1' },
  ];
  const market = { uid: 'market-1', title: 'Longmont Farmers Market', start: parseLocal('2026-10-24T08:00'), allDay: false, categories: [], status: 'confirmed' as const };
  assert.ok(titleSimilarity(market.title, existing[0]!.title) >= 0.6, 'similar enough that the title alone matches');
  assert.equal(matchExisting(market, existing, 1, new Set(['council-1', 'market-1'])).kind, 'none', 'the council item is in this run, so its file is its own');
  // An id that has left the feed (the County's id changes when a time
  // moves) leaves its file free to be found by title, as a change.
  assert.equal(matchExisting({ ...market, title: 'Council at Longmont Farmers Market', uid: 'council-2' }, existing, 1, new Set(['council-2', 'market-1'])).kind, 'staged');
  assert.equal(matchExisting(market, existing).kind, 'staged', 'without the run\'s ids, the old rule');
});

test('a change is a moved time, a moved venue or a cancellation, and nothing else', () => {
  const existing = { file: 'a.md', slug: 'x', staged: false, title: 'Council', start: parseLocal('2026-10-07T18:00'), end: parseLocal('2026-10-07T20:00'), venue: 'Town Hall', status: 'scheduled' };
  const same = { uid: '1', title: 'Council', start: parseLocal('2026-10-07T18:00'), end: parseLocal('2026-10-07T20:00'), allDay: false, categories: [], status: 'confirmed' as const };
  assert.deepEqual(detectChanges(same, existing, 'Town Hall'), []);
  assert.deepEqual(detectChanges({ ...same, start: parseLocal('2026-10-07T19:00') }, existing, 'Town Hall'), [{ field: 'start', was: '2026-10-07T18:00', now: '2026-10-07T19:00' }]);
  assert.deepEqual(detectChanges({ ...same, status: 'cancelled' }, existing, undefined), [{ field: 'status', was: 'scheduled', now: 'canceled' }]);
  assert.deepEqual(detectChanges(same, existing, 'Community Center'), [{ field: 'venue', was: 'Town Hall', now: 'Community Center' }]);
  assert.deepEqual(detectChanges(same, existing, 'Council Chambers', false), [], 'a guessed venue never counts as a move');
  // A room and an address where the guide names the building: the room is
  // offered as a last-resort guess for a new item, and never counts as a move.
  assert.deepEqual(venueFrom('Council Chambers, 645 Holbrook Street, Erie, CO 80516', source()), { venue: 'Council Chambers', address: '645 Holbrook Street, Erie, CO 80516', guessed: true });
  assert.equal(venueFrom('Niwot, CO', source()).venue, undefined);
  assert.equal(excludedTitle({ title: 'Lap Swim: 5am-4pm' }, source({ excludeTitles: ['lap swim', 'open gym'] })), true);
  assert.equal(excludedTitle({ title: 'Oktoberfest' }, source({ excludeTitles: ['lap swim'] })), false);
  assert.notEqual(fingerprint(same, 'Town Hall'), fingerprint({ ...same, start: parseLocal('2026-10-07T19:00') }, 'Town Hall'));
});

test('a staged file round-trips through the frontmatter reader and the event schema, with its review block', () => {
  const item = {
    uid: 'storytime@example/2026-10-06',
    title: 'Toddler Storytime',
    start: parseLocal('2026-10-06T10:30'),
    end: parseLocal('2026-10-06T11:00'),
    allDay: false,
    location: 'Elizabeth Library of Pines & Plains Libraries, 651 Beverly St, Elizabeth, CO 80107, USA',
    url: 'https://library.example/event/1',
    description: 'Songs and stories.',
    categories: ['Storytime'],
    status: 'confirmed' as const,
  };
  const staged = toStaged(item, source({ defaultVenue: 'Elizabeth Library' }), 'elizabeth', '2026-10-04');
  assert.equal(staged.slug, 'toddler-storytime-2026-10-06');
  const text = eventFile(staged.frontmatter, staged.body);
  const parsed = parseFrontmatter(text);
  const data = eventSchema(() => z.string()).parse(parsed.data);
  assert.equal(data.title, 'Toddler Storytime');
  assert.equal(data.start.getTime(), denver('2026-10-06T10:30'));
  assert.equal(data.venue, 'Elizabeth Library');
  assert.equal(data.address, '651 Beverly St, Elizabeth, CO 80107');
  assert.equal(data.category, 'family');
  assert.equal(data.sourceId, 'lib');
  assert.equal(data.sourceUid, item.uid);
  assert.equal(data.review?.from, 'ingest');
  assert.match(data.review?.reason ?? '', /rewrite/);
  assert.equal(data.verified, undefined, 'approval stamps verified, not ingest');
  assert.match(parsed.body, /Rewrite in the guide/);
  // A multi-town guide's source carries its town onto every file it stages.
  const firestone = toStaged(item, source({ subTown: 'firestone' }), 'carbon-valley', '2026-10-04');
  const firestoneText = eventFile(firestone.frontmatter, firestone.body);
  assert.match(firestoneText, /^title: .*\nsubTown: firestone\n/m);
  assert.equal(eventSchema(() => z.string()).parse(parseFrontmatter(firestoneText).data).subTown, 'firestone');
  assert.equal(slugify('Baby Storytime & Stay-and-Play'), 'baby-storytime-and-stay-and-play');
  // A cancelled item arrives already marked, with the feed as its source.
  const canceled = toStaged({ ...item, status: 'cancelled' }, source(), 'elizabeth', '2026-10-04');
  assert.equal(canceled.frontmatter.status, 'canceled');
  assert.match(String(canceled.frontmatter.statusNote), /marks this canceled/);
});
