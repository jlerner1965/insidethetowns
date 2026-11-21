/**
 * A guide's dates on its home page (src/lib/hub-towns.ts): only dates that
 * are set; the outdoor dates lead when two or more qualify, otherwise the
 * guide's traditions lead and the outdoor dates follow. And the next date
 * on a town page is its own event's, an outdoor date only where it has none.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_OUTDOOR_TO_LEAD, guideHomeDates, guideLines, nextTownDate, nextUp, oneTimeEvents, placeRows, publishedHubTowns, statewideSummary } from '../src/lib/hub-towns.ts';
import { dayKey, parseLocal } from '../src/lib/dates.ts';
import { isAgencyDate, isUpcoming, type TraditionRecord } from '../src/lib/traditions.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { STANDALONE_GUIDES } from '../src/config/hub-towns.ts';

const TODAY = '2026-11-12';
const rec = (slug: string, extra: Partial<TraditionRecord>, years: TraditionRecord['years']): TraditionRecord =>
  ({ slug, name: slug, type: 'outdoor', organizer: 'Agency', sourceUrl: 'https://example.org/', years, ...extra }) as TraditionRecord;
const set = (date: string) => [{ year: Number(date.slice(0, 4)), status: 'confirmed' as const, date, checked: TODAY }];
const open = [{ year: 2027, status: 'not-announced' as const, checked: TODAY }];
const lyons = { towns: [{ slug: 'lyons' }] };
const own = { town: { name: 'Lyons', guide: 'lyons' }, type: 'festival' as const };

test('only outdoor dates with a date set are lines, the town’s as well as the statewide', () => {
  const records = [
    rec('road-closes', lyons, open),
    rec('road-opens', lyons, set('2027-05-28')),
    rec('meteor', { statewide: true }, set('2026-12-13')),
    rec('free-fishing', { statewide: true }, open),
  ];
  assert.deepEqual(guideLines(records, 'lyons', TODAY).map((r) => r.record.slug), ['road-opens', 'meteor']);
  // A date that has passed with no later year on file is not a date set.
  assert.deepEqual(guideLines([rec('gone', lyons, set('2026-10-01'))], 'lyons', TODAY), []);
});

test('two outdoor dates set: the outdoor dates lead', () => {
  const records = [rec('a', lyons, set('2026-12-01')), rec('b', lyons, set('2026-12-13')), rec('fest', own, set('2026-12-05'))];
  const dates = guideHomeDates(records, 'lyons', TODAY);
  assert.equal(MIN_OUTDOOR_TO_LEAD, 2);
  assert.equal(dates.lead, 'outdoor');
  assert.deepEqual(dates.outdoor.map((r) => r.record.slug), ['a', 'b']);
  // Statewide dates do not count toward the two: one local date and two
  // meteor showers is still traditions first, with all three outdoor
  // dates listed second.
  const meteors = guideHomeDates([rec('a', lyons, set('2026-12-01')), rec('m1', { statewide: true }, set('2026-12-13')), rec('m2', { statewide: true }, set('2027-08-12')), rec('fest', own, set('2026-12-05'))], 'lyons', TODAY);
  assert.equal(meteors.lead, 'traditions');
  assert.deepEqual(meteors.outdoor.map((r) => r.record.slug), ['a', 'm1', 'm2']);
  assert.deepEqual(dates.traditions.map((r) => r.record.slug), ['fest']);
});

test('fewer than two outdoor dates set: the traditions lead and the outdoor dates come second', () => {
  const records = [rec('a', lyons, set('2026-12-01')), rec('b', lyons, open), rec('c', { statewide: true }, open), rec('fest', own, set('2026-12-05')), rec('fair', own, open)];
  const dates = guideHomeDates(records, 'lyons', TODAY);
  assert.equal(dates.lead, 'traditions');
  assert.deepEqual(dates.outdoor.map((r) => r.record.slug), ['a'], 'the one that is set is still shown, second');
  assert.deepEqual(dates.traditions.map((r) => r.record.slug), ['fest'], 'a tradition with no date set is on /traditions/, not here');
  // None set at all: traditions lead, and there is no outdoor list to draw.
  // Lyons as the records stand: it does not open on meteor showers.
  assert.equal(guideHomeDates(rawRecords(), 'lyons', TODAY).lead, 'traditions');
  const none = guideHomeDates([rec('b', lyons, open), rec('fest', own, set('2026-12-05'))], 'lyons', TODAY);
  assert.deepEqual([none.lead, none.outdoor.length, none.traditions.length], ['traditions', 0, 1]);
});

test('the rule holds for every guide on the records as they are: nothing unannounced on a home page', () => {
  const records = rawRecords();
  for (const key of Object.keys(STANDALONE_GUIDES)) {
    const dates = guideHomeDates(records, key, TODAY);
    for (const r of [...dates.outdoor, ...dates.traditions]) assert.ok(isUpcoming(r), `${key}: ${r.record.slug} has no date set`);
    assert.equal(dates.lead, dates.outdoor.filter((r) => !r.record.statewide).length >= 2 ? 'outdoor' : 'traditions', key);
    // Whatever is left off is still on the guide's /traditions/.
    const all = placeRows(records, key, TODAY);
    assert.ok(all.outdoor.length + all.statewide.length >= dates.outdoor.length, key);
  }
});

test('next on a town page: the town’s own event first; an outdoor or free-admission date only where no event has a date set', () => {
  const rows = (records: TraditionRecord[]) => placeRows(records, 'salida', TODAY);
  const salida = { town: { name: 'Salida', guide: 'salida' } };
  const fest = rec('fest', { ...salida, type: 'festival' }, set('2027-07-10'));
  const ski = rec('ski-opens', salida, set('2026-12-04'));
  const free = rec('free-day', { ...salida, type: 'free-day' }, set('2026-11-20'));
  let r = rows([fest, ski, free]);
  // The review of 14 November 2026: a ski area opening three weeks out no longer wins over the town's own festival in July.
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'fest', 'the festival in July, not the ski area or the free day');
  r = rows([rec('run', { ...salida, type: 'race' }, set('2026-11-27')), rec('parade', { ...salida, type: 'parade-of-lights' }, set('2026-12-05')), ski]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'run', 'the soonest of the town’s own events');
  // No event of the town's has a date set: the soonest outdoor or free-admission date.
  r = rows([rec('fest', { ...salida, type: 'festival' }, open), ski, free]);
  assert.equal(nextUp(r.traditions, r.outdoor)?.record.slug, 'free-day');
  // Neither has one: no block.
  r = rows([rec('fest', { ...salida, type: 'festival' }, open)]);
  assert.equal(nextUp(r.traditions, r.outdoor), undefined);
});

test('the rule holds for every town page on the records as they are', () => {
  const records = rawRecords();
  for (const town of publishedHubTowns(records)) {
    const { traditions, outdoor } = placeRows(records, town.slug, TODAY);
    const next = nextUp(traditions, outdoor);
    const ownSet = traditions.some(isUpcoming);
    if (ownSet) assert.ok(next && !isAgencyDate(next.record.type), `${town.slug}: ${next?.record.slug} is not one of its own events`);
    else assert.equal(next, outdoor.find(isUpcoming), town.slug);
  }
});

test('the statewide fold’s summary is built from the records', () => {
  const row = (name: string) => ({ record: { name } }) as never;
  assert.equal(statewideSummary([row('Geminid meteor shower: peak night'), row('Free Fishing Weekend')]), '2 statewide dates: Geminid meteor shower, Free Fishing Weekend');
  assert.equal(statewideSummary([row('A'), row('B'), row('C'), row('D'), row('E')]), '5 statewide dates: A, B, C, and 2 more');
  assert.equal(statewideSummary([row('Only: one')]), '1 statewide date: Only');
});

// ------------------------------------------- a town page's one-time events and its hero (the owner, 21 November 2026)

/** A listing as the events collection hands it over. */
const listing = (slug: string, start: string, extra: Record<string, unknown> = {}) =>
  ({ slug, data: { title: slug, start: parseLocal(start), allDay: false, ...extra } }) as unknown as Parameters<typeof oneTimeEvents>[0][number];

test('one-time events: a passed listing is left out, and a series is shown at its next date, not its first', () => {
  const now = parseLocal('2026-11-21T09:00');
  const trivia = listing('trivia', '2026-11-12T19:00', { repeat: 'weekly', until: parseLocal('2026-12-03') });
  const gone = listing('trivia-once', '2026-11-12T19:00');
  const film = listing('film', '2026-11-20T19:00');
  const karaoke = listing('karaoke', '2026-11-21T20:00');
  const rows = oneTimeEvents([trivia, gone, film, karaoke], now);
  // Leadville's list read "Thursday, November 12" for its weekly trivia night on November 21.
  assert.deepEqual(rows.map((r) => [r.e.slug, dayKey(r.start)]), [['karaoke', '2026-11-21'], ['trivia', '2026-11-26']]);
  // The series' last Thursday over: it goes too.
  assert.deepEqual(oneTimeEvents([trivia], parseLocal('2026-12-04T09:00')), []);
});

test('the hero: the soonest of the annual and the one-time events; an annual run on now counts; outdoor dates only without either', () => {
  const leadville = { town: { name: 'Leadville', guide: 'leadville' } };
  const rows = (records: TraditionRecord[], today = TODAY) => placeRows(records, 'leadville', today);
  const parade = rec('parade', { ...leadville, type: 'parade-of-lights' }, set('2026-12-04'));
  const ski = rec('ski-opens', leadville, set('2026-12-09'));
  let r = rows([parade, ski]);
  // Leadville on 20 November: a film night that day, not the parade on December 4.
  let picked = nextTownDate(r.traditions, r.outdoor, { slug: 'film', start: '2026-11-20' });
  assert.ok(picked && 'event' in picked && picked.event.slug === 'film');
  // The parade is sooner than the one-time event: the parade.
  picked = nextTownDate(r.traditions, r.outdoor, { slug: 'market', start: '2026-12-11' });
  assert.ok(picked && 'row' in picked && picked.row.record.slug === 'parade');
  // The same day: the annual event, drawn first on the page.
  picked = nextTownDate(r.traditions, r.outdoor, { slug: 'taste', start: '2026-12-04' });
  assert.ok(picked && 'row' in picked && picked.row.record.slug === 'parade');
  // No one-time event: as before (nextUp).
  assert.equal((nextTownDate(r.traditions, r.outdoor, undefined) as { row: { record: { slug: string } } }).row.record.slug, 'parade');
  // A run on now (Georgetown's lighted forest, from November 27 to December 24) is sooner than any date still to come.
  const forest = rec('forest', { ...leadville, type: 'festival' }, [{ year: 2026, status: 'confirmed', date: '2026-11-27', endDate: '2026-12-24', checked: TODAY }]);
  r = rows([forest], '2026-12-01');
  picked = nextTownDate(r.traditions, r.outdoor, { slug: 'workshop', start: '2026-12-05' });
  assert.ok(picked && 'row' in picked && picked.row.record.slug === 'forest');
  // No annual event set: the one-time event before an outdoor date; neither: the outdoor date.
  r = rows([rec('parade', { ...leadville, type: 'parade-of-lights' }, open), ski]);
  picked = nextTownDate(r.traditions, r.outdoor, { slug: 'film', start: '2026-12-20' });
  assert.ok(picked && 'event' in picked);
  picked = nextTownDate(r.traditions, r.outdoor, undefined);
  assert.ok(picked && 'row' in picked && picked.row.record.slug === 'ski-opens');
});
