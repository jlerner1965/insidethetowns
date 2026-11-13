/**
 * The search and feeds pass (12 November 2026): a town page's title from
 * its next dates, an Event marked up on one page with its time where the
 * time is certain, the calendar subscription links, the updates feed and
 * the hub's local changes, and the hub's menu.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventPage, townSearchText, type ShowingContext } from '../src/lib/hub-towns.ts';
import { traditionEventJsonLd } from '../src/lib/seo.ts';
import { subscribeLinks } from '../src/lib/ics.ts';
import { networkChanges, updateFeedItems, type UpdateLike } from '../src/lib/updates.ts';
import { hubNav } from '../src/lib/nav.ts';
import { parseLocal } from '../src/lib/dates.ts';
import type { TraditionRecord, TraditionRow } from '../src/lib/traditions.ts';

const row = (name: string, date?: string) =>
  ({ record: { slug: name.toLowerCase().replace(/\W+/g, '-'), name }, entry: { year: 2026, status: date ? 'confirmed' : 'not-announced', date, checked: '2026-11-12' }, year: 2026, source: 'https://example.org/' }) as unknown as TraditionRow;

test('a town page’s title and description name its next dated traditions and the year', () => {
  const t = townSearchText('Golden', [row('Candlelight Walk', '2026-12-04'), row('Buffalo Bill Days'), row('Golden Holiday Parade', '2026-12-12'), row('Jingle on the Avenue', '2026-12-19'), row('Fourth', '2027-07-04')]);
  assert.equal(t.seoTitle, 'Golden, Colorado events 2026: Candlelight Walk and annual dates');
  assert.match(t.description, /^Golden, Colorado in 2026: Candlelight Walk \(December 4\), Golden Holiday Parade \(December 12\) and Jingle on the Avenue \(December 19\)\./);
  assert.doesNotMatch(t.description, /Buffalo Bill|Fourth/, 'three at most, and none without a date');

  const across = townSearchText('Castle Rock', [row('Starlighting', '2026-11-21'), row('County Fair', '2027-07-30')]);
  assert.match(across.seoTitle, /2026–27/);
  assert.match(across.description, /County Fair \(July 30, 2027\)/, 'a date in the next year says its year');

  const long = townSearchText('Salida', [row('Christmas Mountain 5 Mile & 1 Mile Run', '2026-11-27')]);
  assert.ok(long.seoTitle.length <= 65, long.seoTitle);
  assert.match(long.seoTitle, /Christmas Mountain/);
  assert.match(long.seoTitle, /events/, 'every dated title says events');

  const none = townSearchText('Ouray', [row('Ice Festival')]);
  assert.equal(none.seoTitle, 'Ouray, Colorado: annual events and outdoor dates', 'no date ahead, no event named');
});

const record = (over: Partial<TraditionRecord>) => ({ slug: 'x', name: 'X', type: 'tree-lighting', organizer: 'Town', sourceUrl: 'https://example.org/', years: [], ...over }) as TraditionRecord;
const ctx = (published: string[]): ShowingContext => ({
  hubDomain: 'insidethetowns.com',
  published: new Set(published),
  guideDomain: (key) => (key === 'erie' ? 'insideerie.com' : undefined),
  guideName: (key) => key,
});

test('an Event is marked up on one page: the record’s home where it has a page, else the season page', () => {
  assert.equal(eventPage(record({ town: { name: 'Salida', guide: 'salida' } }), ctx(['salida'])), 'salida', 'a published town page');
  assert.equal(eventPage(record({ town: { name: 'Salida', guide: 'salida' } }), ctx([])), 'season', 'no town page yet');
  assert.equal(eventPage(record({ town: { name: 'Erie', guide: 'erie' } }), ctx([])), 'erie', 'a guide’s /traditions/');
  assert.equal(eventPage(record({ statewide: true }), ctx(['salida'])), 'season');
});

test('an Event’s start has its time and Denver’s offset only where the time is certain; the venue is the organizer’s', () => {
  const rec = { slug: 'starlighting', name: 'Starlighting', organizer: 'Chamber', town: { name: 'Castle Rock' }, type: 'tree-lighting', firstYear: 1962 };
  const timed = traditionEventJsonLd(rec, { status: 'confirmed', date: '2026-11-21', startTime: '2 pm', place: 'Wilcox Square', cost: 'Free' }, 'https://insidethetowns.com/castle-rock/')!;
  assert.equal(timed.startDate, '2026-11-21T14:00:00-07:00');
  assert.equal(timed.location.name, 'Wilcox Square');
  assert.equal(timed.description, 'Starlighting in Castle Rock, Colorado, organized by Chamber. At Wilcox Square. Cost: Free. First held in 1962.');
  assert.equal('endDate' in timed, false, 'no end is invented');
  const summer = traditionEventJsonLd(rec, { status: 'confirmed', date: '2027-07-04', startTime: '9:30 p.m.' }, 'https://x/')!;
  assert.equal(summer.startDate, '2027-07-04T21:30:00-06:00', 'daylight time has its own offset');
  const vague = traditionEventJsonLd(rec, { status: 'confirmed', date: '2026-11-21', startTime: '3PM-6PM, lighting at 5PM' }, 'https://x/')!;
  assert.equal(vague.startDate, '2026-11-21', 'the day alone');
  assert.equal(vague.location.name, 'Castle Rock', 'the town where no venue is named');
  assert.equal(traditionEventJsonLd(rec, { status: 'not-announced' }, 'https://x/'), undefined);
});

test('a calendar feed has a webcal link and Google’s add-by-URL', () => {
  const l = subscribeLinks('https://insideerie.com/events/calendar.ics');
  assert.equal(l.webcal, 'webcal://insideerie.com/events/calendar.ics');
  assert.equal(l.google, 'https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Finsideerie.com%2Fevents%2Fcalendar.ics');
});

const update = (slug: string, published: string, town: string, over: Record<string, unknown> = {}) =>
  ({ slug, town: { slug: town }, data: { title: slug, slug, kind: 'closure', summary: 'Closed.', affects: 'Drivers', effective: parseLocal(published), published: parseLocal(published), ...over } }) as unknown as UpdateLike & { town: { slug: string } };

test('the updates feed is newest first, in the record’s own words, each linked to its row', () => {
  const items = updateFeedItems([update('old', '2026-10-01', 'erie'), update('new', '2026-11-10', 'erie', { action: 'Use County Line Road.' })], 'https://insideerie.com/updates/');
  assert.deepEqual(items.map((i) => i.title), ['new', 'old']);
  assert.equal(items[0]!.link, 'https://insideerie.com/updates/#new');
  assert.equal(items[0]!.description, 'Closed. Affects: Drivers What to do: Use County Line Road.');
});

test('the hub’s local changes are current ones only, newest first, two a town at most', () => {
  const now = parseLocal('2026-11-12');
  const list = [
    update('e1', '2026-11-11', 'erie'), update('e2', '2026-11-10', 'erie'), update('e3', '2026-11-09', 'erie'),
    update('b1', '2026-11-08', 'berthoud'),
    update('gone', '2026-11-07', 'windsor', { expires: parseLocal('2026-11-08') }),
  ];
  assert.deepEqual(networkChanges(list, now).map((u) => u.slug), ['e1', 'e2', 'b1']);
});

test('the hub’s menu gains Annual events after the weekend only while a season page is built', () => {
  const nav = [{ label: 'This Weekend', href: '/this-weekend/' }, { label: 'Towns', href: '/#towns' }];
  assert.deepEqual(hubNav(nav, [{ label: 'Tree lightings', href: '/tree-lightings/' }], false).map((n) => [n.label, n.href]), [['This Weekend', '/this-weekend/'], ['Annual events', '/towns/#seasons-heading'], ['Towns', '/#towns']]);
  assert.deepEqual(hubNav(nav, [], false), nav);
});

test('the hub’s menu gains Articles after Towns only while an article is on the site', () => {
  const nav = [{ label: 'This Weekend', href: '/this-weekend/' }, { label: 'Towns', href: '/#towns' }, { label: 'Newsletter', href: '/newsletter/' }];
  assert.deepEqual(hubNav(nav, [{ label: 'Tree lightings', href: '/tree-lightings/' }], true).map((n) => n.label), ['This Weekend', 'Annual events', 'Towns', 'Articles', 'Newsletter']);
  assert.deepEqual(hubNav(nav, [], true).map((n) => [n.label, n.href]), [['This Weekend', '/this-weekend/'], ['Towns', '/#towns'], ['Articles', '/articles/'], ['Newsletter', '/newsletter/']]);
  assert.deepEqual(hubNav([{ label: 'Newsletter', href: '/newsletter/' }], [], true).map((n) => n.label), ['Newsletter', 'Articles'], 'with no Towns entry it goes last');
  assert.deepEqual(hubNav(nav, [], false), nav);
});
