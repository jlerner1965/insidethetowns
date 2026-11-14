/**
 * A tradition record's own page on the hub, /<town>/<event>/ (the brief of
 * 13 November 2026), and what hangs off it: the address from the slug, the
 * one page that carries the Event entity, the title that names the town,
 * the event, the year and the day, the sitemap date, and the hub route.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HUB_TOWNS, STANDALONE_GUIDES } from '../src/config/hub-towns.ts';
import { eventPage, eventPath, eventSegment, hubEventPages, publishedHubTowns, type ShowingContext } from '../src/lib/hub-towns.ts';
import { HUB_ROUTES, hubReservedSegments } from '../src/integrations/town-routes.ts';
import { contentDates } from '../src/lib/lastmod.ts';
import { traditionEventJsonLd } from '../src/lib/seo.ts';
import { titleTime, traditionTitle, TITLE_LIMIT } from '../src/lib/titles.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import type { TraditionRecord } from '../src/lib/traditions.ts';

function record(over: Partial<TraditionRecord> = {}): TraditionRecord {
  return {
    slug: 'golden-candlelight-walk',
    name: 'Candlelight Walk',
    town: { name: 'Golden', guide: 'golden' },
    type: 'festival',
    organizer: 'Visit Golden',
    sourceUrl: 'https://example.com/walk',
    years: [{ year: 2026, status: 'confirmed', date: '2026-12-04', startTime: '6:30 p.m.', place: 'Washington Ave.', checked: '2026-11-12' }],
    ...over,
  };
}
const published = new Set(['golden', 'estes-park']);
const ctx: ShowingContext = { hubDomain: 'insidethetowns.com', published, guideDomain: (k) => (k === 'erie' ? 'insideerie.com' : undefined), guideName: (k) => k };

test('the address drops the town prefix from the slug: golden-candlelight-walk is /golden/candlelight-walk/', () => {
  assert.equal(eventSegment(record(), 'golden'), 'candlelight-walk');
  assert.equal(eventPath(record(), published), '/golden/candlelight-walk/');
  // A slug without the prefix is used whole; one that is only the prefix is not emptied.
  assert.equal(eventSegment({ slug: 'jingle-on-the-avenue' }, 'golden'), 'jingle-on-the-avenue');
  assert.equal(eventSegment({ slug: 'golden-' }, 'golden'), 'golden-');
  // Fort Collins' records are filed under the hub town's slug, not the guide's config slug.
  assert.equal(eventPath(record({ slug: 'fort-collins-focomx', town: { name: 'Fort Collins', guide: 'fort-collins' } }), new Set(['fort-collins'])), '/fort-collins/focomx/');
  assert.equal(eventPath(record({ slug: 'fort-collins-focomx', town: { name: 'Fort Collins', guide: 'fortcollins' } }), new Set(['fort-collins'])), '/fort-collins/focomx/', 'the config slug means the same page');
});

test('only a record whose home is a published hub town page gets one: a guide’s record, a shared date and an unpublished town keep what they have', () => {
  assert.equal(eventPath(record({ town: { name: 'Erie', guide: 'erie' } }), published), undefined, 'a standalone guide');
  assert.equal(eventPath(record({ town: undefined, towns: [{ slug: 'golden' }] }), published), undefined, 'no home');
  assert.equal(eventPath(record({ slug: 'salida-x', town: { name: 'Salida', guide: 'salida' } }), published), undefined, 'not published');
  // The page is where eventPage already said the Event belongs: the two agree.
  assert.equal(eventPage(record(), ctx), 'golden');
  const pages = hubEventPages([record(), record({ slug: 'erie-parade', town: { name: 'Erie', guide: 'erie' } })], published);
  assert.deepEqual(pages.map((p) => [p.town, p.event, p.path]), [['golden', 'candlelight-walk', '/golden/candlelight-walk/']]);
});

test('the build fails on two records at one address, or on a town slug that is one of the hub’s routes', () => {
  assert.doesNotThrow(() => hubEventPages([record(), record({ slug: 'golden-candlelight-walk-2' })], published), 'a different slug is a different path');
  assert.throws(() => hubEventPages([record({ slug: 'golden-walk' }), record({ slug: 'golden-walk', name: 'Other' })], published), /two records, one address/);
  assert.throws(() => hubEventPages([record()], published, ['/golden', '/moving/[pair]']), /shadows/);
  assert.doesNotThrow(() => hubEventPages([record()], published, hubReservedSegments()));
});

test('no hub town is named like a fixed hub route, so no event page can shadow one', () => {
  const reserved = new Set(hubReservedSegments());
  assert.ok(reserved.has('moving') && reserved.has('newsletter') && reserved.has('towns') && reserved.has('dates'), [...reserved].join(', '));
  assert.ok(HUB_ROUTES.some(([pattern]) => pattern === '/[town]/[event]'), 'the route is injected on the hub');
  for (const town of HUB_TOWNS) assert.ok(!reserved.has(town.slug), `${town.slug} is a hub route`);
  for (const key of Object.keys(STANDALONE_GUIDES)) assert.ok(!reserved.has(key), key);
});

test('every record whose home is a published town has exactly one page, and no two share a path', () => {
  const records = rawRecords();
  const pub = new Set(publishedHubTowns(records).map((t) => t.slug));
  const pages = hubEventPages(records, pub, hubReservedSegments());
  assert.ok(pages.length > 100, `${pages.length} pages`);
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length);
  for (const r of records) {
    const path = eventPath(r, pub);
    const home = r.town?.guide;
    const hubHome = home && HUB_TOWNS.some((t) => t.slug === home || t.guide === home);
    if (hubHome && pub.has(pages.find((p) => p.record === r)?.town ?? '')) assert.ok(path, `${r.slug} has no page`);
    if (path) assert.match(path, /^\/[a-z0-9-]+\/[a-z0-9-]+\/$/, path);
  }
  // The pages the brief names.
  const paths = new Set(pages.map((p) => p.path));
  for (const p of ['/golden/candlelight-walk/', '/golden/holiday-parade/', '/longmont/turkey-trot/', '/estes-park/catch-the-glow-parade/']) assert.ok(paths.has(p), p);
});

test('the sitemap dates an event page by the newest check of its record', () => {
  const dates = contentDates({ kind: 'hub', slug: 'hub' });
  const walk = dates.get('/golden/candlelight-walk/');
  assert.ok(walk, 'no lastmod for /golden/candlelight-walk/');
  assert.ok(walk! >= '2026-11-12', walk);
  assert.ok(dates.get('/golden/'), 'the town page keeps its date');
});

test('the title names the town, the event, the year and the day, and the town once', () => {
  const dec4 = new Date('2026-12-04T12:00:00-07:00');
  assert.equal(titleTime('18:30'), '6:30 p.m.');
  assert.equal(titleTime('09:00'), '9 a.m.');
  assert.equal(titleTime('12:00'), '12 p.m.');
  assert.equal(traditionTitle('Golden', 'Candlelight Walk', 2026, { date: dec4, time: '6:30 p.m.' }), 'Golden Candlelight Walk 2026: Fri, Dec 4, 6:30 p.m.');
  assert.equal(traditionTitle('Longmont', 'Longmont Turkey Trot', 2026, { date: new Date('2026-11-14T12:00:00-07:00') }), 'Longmont Turkey Trot 2026: Sat, Nov 14');
  // Over the limit the time goes first, then the day; the name and the year stay.
  const nov7 = new Date('2026-11-07T12:00:00-07:00');
  assert.equal(traditionTitle('Estes Park', 'Craft Spirits & Brew Festival', 2026, { date: nov7, time: '12 p.m.' }), 'Estes Park Craft Spirits & Brew Festival 2026: Sat, Nov 7');
  assert.equal(traditionTitle('Estes Park', 'Rocky Mountain Craft Spirits Festival', 2026, { date: nov7, time: '12 p.m.' }), 'Estes Park Rocky Mountain Craft Spirits Festival 2026');
  const t = traditionTitle('Estes Park', 'Rocky Mountain Craft Spirits (& Brew) Festival', 2026, { date: nov7, time: '12 p.m.' });
  assert.equal(t, 'Estes Park Rocky Mountain Craft Spirits (& Brew) Festival 2026');
  // A name and year longer than TITLE_LIMIT by themselves are kept whole, never cut mid-name.
  assert.ok(t.length > TITLE_LIMIT, t);
  // The town is not said twice: inside a word, or by a Springs town's short name (the owner, 13 November 2026).
  assert.equal(traditionTitle('Boulder', 'BOLDERBoulder', 2027), 'BOLDERBoulder 2027');
  assert.equal(traditionTitle('Steamboat Springs', 'Steamboat OktoberWest', 2027), 'Steamboat OktoberWest 2027');
  assert.equal(traditionTitle('Green Mountain Falls', 'Green Box Arts Festival', 2027), 'Green Mountain Falls Green Box Arts Festival 2027');
  assert.equal(traditionTitle('Colorado Springs', 'Colorado State Fair', 2027), 'Colorado Springs Colorado State Fair 2027');
  // No date: the next year, and no day claimed.
  assert.equal(traditionTitle('Golden', 'Candlelight Walk', 2027), 'Golden Candlelight Walk 2027');
  assert.equal(traditionTitle('Wellington', 'Parade of Lights', 2026, { date: dec4, canceled: true }), 'Wellington Parade of Lights 2026: canceled');
});

test('the Event entity: the page’s own URL on its page, the row elsewhere; the status follows the entry; nothing without a date', () => {
  const rec = record();
  const own = traditionEventJsonLd(rec, rec.years[0]!, 'https://insidethetowns.com/golden/candlelight-walk/', { own: true })!;
  assert.equal(own.url, 'https://insidethetowns.com/golden/candlelight-walk/');
  assert.equal(own.eventStatus, 'https://schema.org/EventScheduled');
  assert.equal(own.startDate, '2026-12-04T18:30:00-07:00');
  const row = traditionEventJsonLd(rec, rec.years[0]!, 'https://insidethetowns.com/golden/')!;
  assert.equal(row.url, 'https://insidethetowns.com/golden/#golden-candlelight-walk');
  const moved = traditionEventJsonLd(rec, { status: 'moved', date: '2026-12-05', previousDate: '2026-12-04', reason: 'snow' }, 'https://x/', { own: true })!;
  assert.equal(moved.eventStatus, 'https://schema.org/EventRescheduled');
  assert.equal(moved.previousStartDate, '2026-12-04');
  const canceled = traditionEventJsonLd(rec, { status: 'canceled', date: '2026-12-04' }, 'https://x/', { own: true })!;
  assert.equal(canceled.eventStatus, 'https://schema.org/EventCancelled');
  assert.equal(traditionEventJsonLd(rec, { status: 'canceled' }, 'https://x/'), undefined, 'canceled with no date was never an event');
  assert.equal(traditionEventJsonLd(rec, { status: 'not-announced' }, 'https://x/'), undefined);
  assert.equal(traditionEventJsonLd(rec, { status: 'typical', typicalWindow: 'early December' }, 'https://x/'), undefined);
});
