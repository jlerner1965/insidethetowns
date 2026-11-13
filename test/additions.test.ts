/**
 * The additions of 12 November 2026 (docs/additions-report.md): the rules
 * that keep the new blocks honest. One page test for a town, one number
 * for a pair of towns, "Open now" only from a date read, a free day that
 * drops off once it has passed, and a source and a check date on
 * everything a town's profile says.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { HUB_CLUSTERS, HUB_TOWNS, STANDALONE_GUIDES, findHubTown } from '../src/config/hub-towns.ts';
import { traditionSchema } from '../src/content/schemas.ts';
import { ownEvents, placeKey, placeRows, publishedHubTowns } from '../src/lib/hub-towns.ts';
import { NEAR_MAX, formatDrive, formatMiles, nearestPlaces, pairKey, passesFor, roadLeg, type Airports, type RoadMiles, type TownFacts } from '../src/lib/near.ts';
import { OPEN_WITHOUT_CLOSING_DAYS, openNow } from '../src/lib/open-now.ts';
import { TERRAIN } from '../src/lib/ridgeline.ts';
import { isGuideSite, townProfileSchema } from '../src/lib/town-profile.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { CURRENT_SEASONS, TRADITION_TYPE_INFO, isListed, nextRow, seasonRows, type TraditionRecord } from '../src/lib/traditions.ts';

const json = <T>(file: string): T => JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')) as T;
const roads = json<RoadMiles>('data/hub/road-miles.json');
const facts = json<TownFacts>('data/hub/town-facts.json');
const airports = json<Airports>('data/hub/airports.json');
const passes = json<{ passes: Array<{ slug: string; connects: string[]; alsoServes?: string[]; seasonalClosure?: string; closureSource?: string; statusUrl?: string; source: string; checked: string }> }>('data/hub/passes.json').passes;
const records = rawRecords('.', {});
const published = publishedHubTowns(records);
const places = [...HUB_TOWNS.map((t) => t.slug), ...Object.keys(STANDALONE_GUIDES)];
const withPage = new Set([...published.map((t) => t.slug), ...Object.keys(STANDALONE_GUIDES)]);

test('a town page needs one named annual event of its own with a date read; an outdoor date alone makes none', () => {
  const event = (over: Partial<TraditionRecord>): TraditionRecord => ({ slug: 'x', name: 'X', town: { name: 'Vail', guide: 'vail' }, type: 'festival', organizer: 'O', sourceUrl: 'https://example.org/', years: [{ year: 2026, status: 'confirmed', date: '2026-09-12', checked: '2026-11-12' }], ...over });
  assert.deepEqual(publishedHubTowns([event({})]).map((t) => t.slug), ['vail']);
  assert.deepEqual(publishedHubTowns([event({ type: 'outdoor' })]), [], 'an outdoor date is not an event');
  assert.deepEqual(publishedHubTowns([event({ years: [{ year: 2027, status: 'not-announced', checked: '2026-11-12' }] })]), [], 'no date read, no page');
  assert.deepEqual(publishedHubTowns([event({ town: undefined, towns: [{ slug: 'vail' }], type: 'outdoor' })]), [], 'a shared date is not the town’s own');
  for (const t of published) assert.ok(ownEvents(records, t.slug).length >= 1, t.slug);
});

test('every town is in a cluster the hub lists, and every cluster has its country', () => {
  for (const t of HUB_TOWNS) assert.ok((HUB_CLUSTERS as readonly string[]).includes(t.cluster), t.slug);
  for (const c of HUB_CLUSTERS) assert.ok(TERRAIN[c], c);
  assert.equal(new Set(HUB_TOWNS.map((t) => t.slug)).size, HUB_TOWNS.length, 'a town is listed once');
  for (const t of HUB_TOWNS) assert.equal(STANDALONE_GUIDES[t.slug], undefined, `${t.slug}: a town with a guide has no hub page`);
});

test('road miles: one router, one number a pair, and every place with a page has its neighbours', () => {
  assert.match(roads.source.url, /^https:\/\//);
  assert.match(roads.checked, /^\d{4}-\d{2}-\d{2}$/);
  for (const key of Object.keys(roads.pairs)) {
    const [a, b] = key.split('|') as [string, string];
    assert.ok(a < b, `${key}: stored once, the earlier slug first`);
    assert.ok(places.includes(a) && places.includes(b), key);
    assert.equal(roadLeg(roads, a, b), roadLeg(roads, b, a), 'both pages read the same leg');
    assert.equal(pairKey(b, a), key);
  }
  for (const place of withPage) {
    const near = nearestPlaces(roads, place, withPage);
    assert.ok(near.length >= 4 && near.length <= NEAR_MAX, `${place}: ${near.length} neighbours`);
    assert.ok(near.every((n) => withPage.has(n.place) && n.place !== place), place);
    assert.deepEqual([...near].sort((x, y) => x.miles - y.miles).map((n) => n.place), near.map((n) => n.place), `${place}: nearest first`);
    // What A prints for B is what B prints for A.
    for (const n of near) assert.equal(roadLeg(roads, n.place, place)!.miles, n.miles);
    assert.ok(roads.fromDenver[place], `${place}: miles from Denver`);
    assert.ok(facts.towns[place]?.elevationFt, `${place}: elevation`);
  }
  assert.equal(nearestPlaces(roads, 'vail', new Set()).length, 0, 'nothing links to a page that is not built');
});

test('the nearest airport is one on the FAA list, and the population carries its year', () => {
  const codes = new Set(airports.airports.map((a) => a.code));
  for (const [place, leg] of Object.entries(roads.airport)) assert.ok(codes.has(leg.code), `${place}: ${leg.code}`);
  assert.match(airports.listSource, /faa\.gov/);
  assert.ok(facts.sources.population.year >= 2025);
  assert.match(facts.sources.population.url, /census\.gov/);
});

test('miles and drive time read as a person says them', () => {
  assert.equal(formatMiles(64.2), '64 miles');
  assert.equal(formatMiles(1), '1 mile');
  assert.equal(formatMiles(3.44), '3.4 miles');
  assert.equal(formatDrive(93), 'about 1 hour 35 minutes');
  assert.equal(formatDrive(22), 'about 20 minutes');
  assert.equal(formatDrive(121), 'about 2 hours');
});

test('a pass connects two places in the network, carries its source, and a closure has the page it was read on', () => {
  assert.ok(passes.length >= 20);
  for (const p of passes) {
    assert.equal(p.connects.length, 2, p.slug);
    for (const s of [...p.connects, ...(p.alsoServes ?? [])]) assert.ok(placeKey(s), `${p.slug}: ${s}`);
    assert.match(p.source, /^https:\/\//, p.slug);
    assert.ok(!isGuideSite(p.source), p.slug);
    if (p.seasonalClosure) assert.match(p.closureSource ?? '', /^https:\/\//, `${p.slug}: a closure names its source`);
    if (p.statusUrl) assert.match(p.statusUrl, /^https:\/\/(www\.cotrip\.org|www\.summitcountyco\.gov)\//, p.slug);
  }
  const mine = passesFor(passes as never, 'aspen', withPage);
  assert.ok(mine.some((m) => m.pass.slug === 'independence-pass'));
  assert.equal(passesFor(passes as never, 'aspen', new Set(['aspen'])).length, 0, 'a pass to a page that is not built is not listed');
});

test('open now: only from a date read, and never from an old opening with no closing', () => {
  const rec = (slug: string, edge: 'opens' | 'closes' | 'window', years: TraditionRecord['years'], kind: 'ski-area' | 'booking' | 'road' = 'ski-area', facility = 'Hill'): TraditionRecord => ({
    slug, name: slug, town: { name: 'Vail', guide: 'vail' }, type: 'outdoor', organizer: 'O', sourceUrl: 'https://example.org/', outdoor: { kind, facility, edge }, years,
  });
  const y = (date: string, endDate?: string) => ({ year: Number(date.slice(0, 4)), status: 'confirmed' as const, date, ...(endDate ? { endDate } : {}), checked: '2026-11-12' });
  const today = '2026-11-12';
  // Opened yesterday, no closing published: open.
  assert.deepEqual(openNow([rec('a', 'opens', [y('2026-11-11')])], today).open.map((i) => i.from), ['2026-11-11']);
  // Opened in April, nothing since: not claimed.
  assert.equal(openNow([rec('a', 'opens', [y('2026-04-16')], 'road')], today).open.length, 0);
  assert.ok(OPEN_WITHOUT_CLOSING_DAYS <= 120);
  // Opened, with a closing still ahead: open until it.
  const season = openNow([rec('a', 'opens', [y('2026-06-01')]), rec('b', 'closes', [y('2026-11-30')])], today);
  assert.equal(season.open[0]!.until, '2026-11-30');
  // The closing has passed: not open.
  assert.equal(openNow([rec('a', 'opens', [y('2026-06-01')]), rec('b', 'closes', [y('2026-10-30')])], today).open.length, 0);
  // Opens next, soonest first, with its closing where one is read.
  const next = openNow([rec('a', 'opens', [y('2026-11-26')]), rec('b', 'closes', [y('2027-04-04')]), rec('c', 'opens', [y('2026-11-20')], 'ski-area', 'Other')], today).next;
  assert.deepEqual(next.map((i) => [i.facility, i.from, i.until]), [['Other', '2026-11-20', undefined], ['Hill', '2026-11-26', '2027-04-04']]);
  // A window: open inside it, next before it, gone after it.
  assert.equal(openNow([rec('w', 'window', [y('2026-05-22', '2026-10-18')])], '2026-07-01').open.length, 1);
  assert.equal(openNow([rec('w', 'window', [y('2026-05-22', '2026-10-18')])], '2026-05-01').next.length, 1);
  assert.deepEqual(openNow([rec('w', 'window', [y('2026-05-22', '2026-10-18')])], today), { open: [], next: [] });
  // The day bookings opened is never "open now"; a year not announced is in neither list.
  assert.equal(openNow([rec('k', 'opens', [y('2026-11-01')], 'booking')], today).open.length, 0);
  assert.deepEqual(openNow([rec('n', 'opens', [{ year: 2027, status: 'not-announced', checked: today }])], today), { open: [], next: [] });
  // An untagged outdoor date is left out.
  assert.deepEqual(openNow([{ ...rec('u', 'opens', [y('2026-11-11')]), outdoor: undefined }], today), { open: [], next: [] });
});

test('every outdoor facility’s opening and closing use the same words', () => {
  const tagged = records.filter((r) => r.outdoor);
  assert.ok(tagged.length >= 80);
  for (const r of tagged.filter((x) => x.outdoor!.edge === 'closes')) {
    const kinds = new Set(tagged.filter((x) => x.outdoor!.facility === r.outdoor!.facility).map((x) => x.outdoor!.kind));
    assert.equal(kinds.size, 1, `${r.slug}: one kind for "${r.outdoor!.facility}"`);
  }
});

test('the five season pages opened with the additions have records, and a free day that has passed is listed nowhere', () => {
  for (const type of ['rodeo-fair', 'oktoberfest', 'harvest-festival', 'winter-carnival', 'free-day'] as const) {
    assert.ok(CURRENT_SEASONS[type], type);
    assert.match(TRADITION_TYPE_INFO[type].path, /^\/[a-z-]+\/$/);
    assert.ok(seasonRows(records, type, '2026-11-12').length >= 3, `${type}: rows`);
  }
  const free = records.filter((r) => r.type === 'free-day');
  assert.ok(free.length >= 20);
  const today = '2026-11-12';
  for (const row of seasonRows(records, 'free-day', today)) assert.ok(!row.past, `${row.record.slug}: a passed day is still on the page`);
  const gone = free.map((r) => nextRow(r, today)).filter((row) => !isListed(row));
  assert.ok(gone.length > 0, 'some 2026 days have passed');
  const onTown = placeRows(records, 'estes-park', today);
  for (const row of gone) assert.ok(![...onTown.statewide, ...onTown.outdoor].some((r) => r.record.slug === row.record.slug), row.record.slug);
  // Past the last date ahead, the page is the undated rows only.
  assert.ok(seasonRows(records, 'free-day', '2030-01-01').every((row) => !!row.entry.typicalWindow));
});

test('the registry’s optional fields: an edition, sub-events inside the run, closed days on a run', () => {
  const base = { slug: 'x-fair', name: 'X', town: { name: 'Vail', guide: 'vail' }, type: 'rodeo-fair', organizer: 'O', sourceUrl: 'https://example.org/' };
  const ok = (year: object) => traditionSchema().safeParse({ ...base, years: [year] }).success;
  const dated = { year: 2027, status: 'confirmed', date: '2027-07-01', endDate: '2027-07-10', checked: '2026-11-12' };
  assert.ok(ok({ ...dated, edition: 78, closedDays: ['Mondays'], subEvents: [{ name: 'Parade', date: '2027-07-04', time: '10 am' }] }));
  assert.ok(!ok({ ...dated, subEvents: [{ name: 'Parade', date: '2027-07-12' }] }), 'a sub-event outside the run');
  assert.ok(!ok({ ...dated, subEvents: [{ name: 'Parade' }] }), 'a sub-event with no day or time');
  assert.ok(!ok({ year: 2027, status: 'confirmed', date: '2027-07-01', closedDays: ['Mondays'], checked: '2026-11-12' }), 'closed days with no run');
  assert.ok(!ok({ year: 2027, status: 'not-announced', edition: 78, checked: '2026-11-12' }), 'an edition with no date');
  assert.ok(!traditionSchema().safeParse({ ...base, type: 'festival', outdoor: { kind: 'road', facility: 'Pass', edge: 'opens' }, years: [dated] }).success, '`outdoor` on an event');
});

test('every town profile is valid, names a town in the registry, and reads nothing from a guide or booking site', () => {
  const dir = new URL('../data/hub/towns/', import.meta.url);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  assert.ok(files.length >= 80);
  for (const f of files) {
    const parsed = townProfileSchema.safeParse(json(`data/hub/towns/${f}`));
    assert.ok(parsed.success, `${f}: ${parsed.success ? '' : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    assert.equal(`${parsed.data!.slug}.json`, f);
    assert.ok(findHubTown(parsed.data!.slug), f);
    assert.ok(Object.keys(parsed.data!).length > 1, `${f}: a profile with nothing in it is not kept`);
  }
  const bad = { slug: 'vail', lodging: [{ name: 'X', url: 'https://www.booking.com/hotel/x', source: 'https://www.booking.com/hotel/x', checked: '2026-11-12' }] };
  assert.ok(!townProfileSchema.safeParse(bad).success, 'a booking site is not a property’s own site');
  assert.ok(!townProfileSchema.safeParse({ slug: 'vail', heritage: { nameOrigin: { text: 'x', source: 'https://www.uncovercolorado.com/vail/', checked: '2026-11-12' } } }).success);
  assert.ok(isGuideSite('https://www.uncovercolorado.com/x') && !isGuideSite('https://www.hotelcolorado.com/'));
  for (const r of records) for (const u of [r.sourceUrl, ...r.years.map((y) => y.sourceUrl)]) assert.ok(!u || !isGuideSite(u), `${r.slug}: ${u}`);
});
