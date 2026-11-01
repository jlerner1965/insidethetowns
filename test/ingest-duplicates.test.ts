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
import { duplicateNote, elsewhereNote, matchExisting, possibleDuplicates, sameVenue, toStaged, venueFrom, type ExistingEvent } from '../scripts/lib/ingest.ts';
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

test("a production's later show is the file's, though its first show's id is still in the feed", () => {
  // Castle Rock's Santa sessions, 10 December 2026: one file, three shows, the 10 am show's id.
  const santa = (start: string, laterShow?: boolean): ExistingEvent => ({
    file: 'santa.md', slug: 'booked-for-the-holidays-2026-12-10', staged: false,
    title: 'Booked for the Holidays', start: parseLocal(start), venue: 'Philip S. Miller Library',
    sourceUid: '14463389', ...(laterShow ? { laterShow } : {}),
  });
  const shows = [santa('2026-12-10T10:00'), santa('2026-12-10T14:00', true), santa('2026-12-10T18:00', true)];
  const session = (uid: string, at: string) => item({ uid, title: 'Booked for the Holidays', start: parseLocal(at), end: undefined, url: undefined });
  const claimed = new Set(['14463389', '14463412', '14463461']);
  const two = matchExisting(session('14463412', '2026-12-10T14:00'), shows, 3, claimed);
  assert.equal(two.kind, 'published', 'the 2 pm session is the file’s 2 pm show, not a new listing');
  assert.equal(two.kind === 'published' && two.existing.start.getTime(), parseLocal('2026-12-10T14:00').getTime());
  assert.equal(matchExisting(session('14463389', '2026-12-10T10:00'), shows, 3, claimed).kind, 'published', 'the first show still matches by its id');
  // Without the mark, the file belonged to the 10 am item and the 6 pm session was new.
  const unmarked = shows.map(({ laterShow: _, ...e }) => e);
  assert.equal(matchExisting(session('14463461', '2026-12-10T18:00'), unmarked, 3, claimed).kind, 'none');
  // A looser title at the same place and time is still put to a person.
  const retitled = shows.map((e) => ({ ...e, title: 'Booked for the Holidays: A Visit with Santa', address: '100 S. Wilcox Street' }));
  const later = session('14463461', '2026-12-10T18:00');
  assert.equal(matchExisting(later, retitled, 3, claimed).kind, 'none', 'two words of four is not the same title');
  assert.equal(possibleDuplicates(later, { venue: 'Philip S. Miller Library' }, retitled, claimed).length, 1, 'so it is staged as a possible duplicate, not approved');
  // Given the feed's title for each id, the retitled file's later show is known by its first show's title.
  const titled = new Map([...claimed].map((uid) => [uid, 'Booked for the Holidays']));
  const known = matchExisting(later, retitled, 3, titled);
  assert.equal(known.kind, 'published', 'the feed calls the first show what it calls this one');
  assert.equal(known.kind === 'published' && known.existing.start.getTime(), parseLocal('2026-12-10T18:00').getTime());
  const other = new Map([...titled, ['14463389', 'Teen Tech Help']]);
  assert.equal(matchExisting(later, retitled, 3, other).kind, 'none', 'a first show of another name proves nothing');
});

test('a later show answers only to an item near its time; a same-named item at another hour is not it', () => {
  const santa = (start: string, laterShow?: boolean): ExistingEvent => ({
    file: 'santa.md', slug: 'booked-for-the-holidays-2026-12-10', staged: false,
    title: 'Booked for the Holidays', start: parseLocal(start), venue: 'Philip S. Miller Library', sourceUid: '14463389', ...(laterShow ? { laterShow } : {}),
  });
  const shows = [santa('2026-12-10T10:00'), santa('2026-12-10T14:00', true)];
  const session = (uid: string, at: string) => item({ uid, title: 'Booked for the Holidays', start: parseLocal(at), end: undefined, url: undefined });
  // Siblings 1: by day and title alone a first show would be matched whatever the hour; a later show is not.
  const m = matchExisting(session('999', '2026-12-10T18:00'), shows, 1, new Set(['14463389']));
  assert.equal(m.kind, 'none', 'a 6 pm item is not the 2 pm show');
  const near = matchExisting(session('14463412', '2026-12-10T14:15'), shows, 1, new Set(['14463389', '14463412']));
  assert.equal(near.kind, 'published');
  assert.equal(near.kind === 'published' && near.how, 'title');
  assert.equal(matchExisting(session('14463389', '2026-12-10T10:00'), shows, 1).kind === 'published' && matchExisting(session('14463389', '2026-12-10T10:00'), shows, 1).how, 'uid');
});

test("a location that is only 'Offsite Event' makes the default venue a guess, not the feed's word", () => {
  const src = { defaultVenue: 'Estes Valley Library' };
  assert.equal(venueFrom('Offsite Event', src).guessed, true, 'the library says the parade is not at the library');
  assert.equal(venueFrom('Offsite', src).guessed, true);
  assert.equal(venueFrom('Hondius Room', src).guessed, false, 'a room is in the building');
  assert.equal(venueFrom('Hondius Room', src).venue, 'Estes Valley Library');
});

test('the note for a same-named event another calendar puts somewhere else holds it for a person', () => {
  const parade = file({ file: 'p.md', slug: 'catch-the-glow-parade-2026-11-27', title: 'Catch the Glow Parade', venue: 'Elkhorn Avenue, downtown Estes Park' });
  const note = elsewhereNote(parade, 'Estes Valley Library', 'the Estes Valley Library calendar');
  assert.match(note, /^Possible duplicate of catch-the-glow-parade-2026-11-27 /, 'the standing rules hold anything so marked');
  assert.match(note, /it is not that listing moving/);
  const staged = toStaged(item({ title: 'Catch the Glow Parade' }), library, 'johnstown', '2026-11-01', [], note);
  assert.ok((staged.frontmatter.review as { reason: string }).reason.startsWith(note));
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
