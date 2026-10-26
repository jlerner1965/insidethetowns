/**
 * Ingest's duplicate detection (audit, 26 October 2026). Johnstown's 1 pm
 * Music & Movement Storytime was published twice: a handoff's file holding
 * the sessions as `performances`, which the matcher read as its first date
 * alone, and a weekly series approved a week later from the feed's copies of
 * the later dates. The rules pinned here: the organizer's id first, then
 * the organizer's own page for the session, then day, time and title; two
 * published files that both answer are flagged, never merged by a rule; and
 * a looser match at the same place and time (the address written either
 * way) is staged with the question on it, for a person.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { duplicateNote, matchExisting, possibleDuplicates, sameVenue, toStaged, type ExistingEvent } from '../scripts/lib/ingest.ts';
import { decideEvent } from '../scripts/lib/auto-review.ts';
import type { FeedEvent } from '../scripts/lib/feeds/types.ts';
import { sourceSchema, type Source } from '../src/content/schemas.ts';
import { towns } from '../src/config/towns/registry.ts';
import { parseLocal } from '../src/lib/dates.ts';
import { normalizeStreet, sameAddress } from '../src/lib/address.ts';

test('an address written two ways is one address; a different number or ZIP is another', () => {
  assert.equal(normalizeStreet('400 S Parish Ave'), '400 s parish ave');
  assert.equal(normalizeStreet('400 South Parish Avenue, Johnstown, CO 80534'), '400 s parish ave');
  assert.ok(sameAddress('400 S Parish Ave', '400 South Parish Avenue'));
  assert.ok(sameAddress('400 S. Parish Ave, Johnstown, CO 80534', '400 South Parish Avenue, Johnstown, CO 80534'));
  assert.ok(sameAddress('105 Fifth Street', '105 5th St'));
  assert.ok(sameAddress('1 Main St Suite 4', '1 Main Street #4'));
  assert.ok(!sameAddress('400 S Parish Ave', '401 S Parish Ave'), 'next door is not the same place');
  assert.ok(!sameAddress('400 S Parish Ave', '400 N Parish Ave'));
  assert.ok(!sameAddress('400 S Parish Ave, Johnstown, CO 80534', '400 S Parish Ave, Somewhere, CO 80999'), 'two ZIPs, two towns');
  assert.ok(!sameAddress('Johnstown, CO', 'Johnstown, CO'), 'a town is not an address');
  assert.ok(!sameAddress(undefined, '400 S Parish Ave'));
});

const LIB = 'Glenn A. Jones, M.D. Memorial Library';
const page = (n: number, day: string) => `https://johnstownmillikenpubliclibraries.us/event/music-movement-storytime-${n}/${day}/2/`;

const item = (over: Partial<FeedEvent> = {}): FeedEvent => ({
  uid: '10001786',
  title: 'Music & Movement Storytime',
  start: parseLocal('2026-10-26T13:00'),
  end: parseLocal('2026-10-26T14:00'),
  allDay: false,
  location: 'Johnstown Location, 400 S Parish Ave, Johnstown',
  url: page(10, '2026-10-26'),
  categories: ['Kids'],
  status: 'confirmed',
  ...over,
});

const file = (over: Partial<ExistingEvent> = {}): ExistingEvent => ({
  file: 'a.md',
  slug: 'a',
  staged: false,
  title: 'Music & Movement Storytime (afternoon)',
  start: parseLocal('2026-10-26T13:00'),
  venue: LIB,
  ...over,
});

test("the organizer's own page for a session is its id where the file has no feed id", () => {
  // A title the matcher would not pair ("Afternoon Sessions" shares too few
  // words), found by the session's page listed in the file's body.
  const sessions = file({ file: 's.md', slug: 'sessions', title: 'Little Wigglers: Afternoon Sessions at the Library', urls: [page(10, '2026-10-26')] });
  const m = matchExisting(item(), [sessions]);
  assert.equal(m.kind, 'published');
  assert.equal(m.kind === 'published' && m.existing.slug, 'sessions');
  assert.equal(matchExisting(item({ url: undefined }), [sessions]).kind, 'none', 'without the link, the titles alone are too far apart');
  // The 10 am listing cites the 1 pm page in its body: with a 10 am item
  // in the feed that day, the time decides, not the link.
  const morning = file({ file: 'm.md', slug: 'morning', title: 'Music & Movement Storytime', start: parseLocal('2026-10-26T10:00'), urls: [page(10, '2026-10-26')] });
  assert.equal(matchExisting(item(), [morning], 2).kind, 'none');
});

test('two published files that are each the item are flagged, not merged; one within half an hour is simply the match', () => {
  const series = file({ file: 'series.md', slug: 'music-and-movement-storytime-afternoon' });
  const handoff = file({ file: 'handoff.md', slug: 'music-and-movement-afternoon-sessions-2026', title: 'Music & Movement Storytime: Afternoon Sessions' });
  const m = matchExisting(item(), [series, handoff], 2);
  assert.equal(m.kind, 'ambiguous');
  if (m.kind === 'ambiguous') assert.deepEqual(m.candidates.map((c) => c.slug).sort(), ['music-and-movement-afternoon-sessions-2026', 'music-and-movement-storytime-afternoon']);
  // By link, the same: both cite the session's page.
  const byLink = matchExisting(item(), [{ ...series, urls: [page(10, '2026-10-26')] }, { ...handoff, title: 'Something else entirely', urls: [page(10, '2026-10-26')] }], 2);
  assert.equal(byLink.kind, 'ambiguous');
  // The morning series and the afternoon one, on a day the feed lists only
  // the afternoon: not a pair, the afternoon one.
  const morning = file({ file: 'morning.md', slug: 'music-and-movement-storytime', title: 'Music & Movement Storytime', start: parseLocal('2026-10-26T10:00') });
  const one = matchExisting(item(), [morning, series], 1);
  assert.equal(one.kind, 'published');
  assert.equal(one.kind === 'published' && one.existing.slug, 'music-and-movement-storytime-afternoon');
  // A weekly file is many dates of one file, not many files.
  assert.equal(matchExisting(item(), [series, { ...series, start: parseLocal('2026-10-26T13:00') }], 2).kind, 'published');
});

test('the same place and time with a looser title is a possible duplicate, by name or by the address written either way', () => {
  const published = file({ file: 'p.md', slug: 'wiggle-time', title: 'Music and Movement for Toddlers', venue: 'The Johnstown library', address: '400 South Parish Avenue, Johnstown, CO 80534' });
  const place = { venue: LIB, address: '400 S Parish Ave, Johnstown' };
  assert.ok(sameVenue(place, published), '400 S Parish Ave is 400 South Parish Avenue');
  const dupes = possibleDuplicates(item(), place, [published]);
  assert.equal(dupes.length, 1);
  assert.match(dupes[0]!.why, /same venue/);
  assert.deepEqual(possibleDuplicates(item({ start: parseLocal('2026-10-26T15:00') }), place, [published]), [], 'two hours later is another session');
  assert.deepEqual(possibleDuplicates(item(), { venue: 'Town Hall', address: '101 W Charlotte St' }, [published]), [], 'another building');
  assert.deepEqual(possibleDuplicates(item({ title: 'Board of Trustees Work Session' }), place, [published]), [], 'unrelated titles at one place and time are two events');
  assert.deepEqual(possibleDuplicates(item(), place, [{ ...published, staged: true }]), [], 'a staged file is not a listing yet');
  assert.deepEqual(possibleDuplicates(item(), place, [{ ...published, sourceUid: 'other' }], new Set(['other'])), [], "a file another item in this run owns is that item's");
});

const library: Source = sourceSchema.parse({
  id: 'lib',
  name: 'Johnstown Milliken Public Libraries',
  url: 'https://johnstownmillikenpubliclibraries.us/',
  type: 'json',
  feedUrl: 'https://johnstownmillikenpubliclibraries.us/wp-json/tribe/events/v1/events',
  category: 'library',
  status: 'confirmed',
  venueAliases: { 'Johnstown Location': LIB },
});

test('a possible duplicate is staged with the question first, and the standing rules leave it for a person', () => {
  const published = file({ file: 'content/johnstown/events/wiggle-time.md', slug: 'wiggle-time', title: 'Music and Movement for Toddlers', address: '400 South Parish Avenue' });
  const dupes = possibleDuplicates(item(), { venue: LIB, address: '400 S Parish Ave' }, [published]);
  const staged = toStaged(item(), library, 'johnstown', '2026-10-26', dupes);
  const reason = (staged.frontmatter.review as { reason: string }).reason;
  assert.match(reason, /^Possible duplicate of wiggle-time \("Music and Movement for Toddlers": same day/);
  assert.equal(duplicateNote([]), undefined);
  const text = `---\ntitle: "Music & Movement Storytime"\nreview: { reason: ${JSON.stringify(reason)}, since: "2026-10-26", from: ingest }\nstart: "2026-11-30T13:00"\nend: "2026-11-30T14:00"\nvenue: "${LIB}"\naddress: "400 S Parish Ave"\nurl: "${page(15, '2026-11-30')}"\ncategory: family\nsource: "${page(15, '2026-11-30')}"\nsourceId: "lib"\nsourceUid: "10001871"\n---\n\nStories and songs for little ones, with plenty of movement.\n`;
  const johnstown = towns.find((t) => t.slug === 'johnstown')!;
  const v = decideEvent(text, { town: johnstown, source: library, published: [], today: '2026-10-26', by: 'test', targetExists: false });
  assert.equal(v.approve, false);
  assert.ok(!v.approve && v.reasons.some((r) => /possible duplicate/.test(r)), !v.approve ? v.reasons.join(' | ') : '');
});
