/**
 * The standing rules of the unattended review (scripts/lib/auto-review.ts):
 * what an organizer's own feed item needs before it publishes without a
 * person, what the published file then says, and which of a source's
 * changes are written in. Every refusal names its reason, so the weekly
 * pull request can list what waits and why.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { decideChange, decideEvent, quoteFrom, type EventContext } from '../scripts/lib/auto-review.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { changeSchema, eventSchema, type Source } from '../src/content/schemas.ts';
import { towns } from '../src/config/towns/registry.ts';

const lyons = towns.find((t) => t.slug === 'lyons')!;
const carbonValley = towns.find((t) => t.slug === 'carbon-valley')!;
const TODAY = '2026-10-15';
const schema = eventSchema(() => z.string());

const library: Source = {
  id: 'lib',
  name: 'Lyons Library',
  url: 'https://library.example/',
  type: 'ical',
  category: 'library',
  priority: 'core',
  status: 'confirmed',
  cites: { events: 0, places: 0 },
  robots: 'honor',
} as Source;

function staged(over: Record<string, string | undefined> = {}, body = 'Songs, stories and a craft for the under-fives. Bring a blanket.'): string {
  const fields: Record<string, string | undefined> = {
    title: '"Toddler Storytime"',
    review: '{ reason: "Ingested from Lyons Library; check against the organizer\'s page. category guessed (family). description is the feed\'s text: rewrite", since: "2026-10-14", from: ingest }',
    start: '"2026-11-07T10:00"',
    end: '"2026-11-07T12:00"',
    venue: '"Lyons Regional Library"',
    address: '"451 4th Ave, Lyons, CO 80540"',
    url: '"https://library.example/event/1"',
    cost: '"Free"',
    category: 'family',
    source: '"https://library.example/event/1"',
    sourceId: '"lib"',
    sourceUid: '"1"',
    ...over,
  };
  const head = Object.entries(fields)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `---\n${head}\n---\n\n<!-- The organizer's own text, from the feed. Rewrite in the guide's words before approving. -->\n\n${body}\n`;
}

const ctx = (over: Partial<EventContext> = {}): EventContext => ({
  town: lyons,
  source: library,
  published: [],
  today: TODAY,
  by: 'the weekly ingest workflow',
  targetExists: false,
  ...over,
});

function refused(text: string, c: EventContext, re: RegExp) {
  const v = decideEvent(text, c);
  assert.equal(v.approve, false, `expected a refusal matching ${re}`);
  assert.ok(v.reasons.some((r) => re.test(r)), `reasons were: ${v.reasons.join(' | ')}`);
}

test('an organizer’s own feed item with a venue and a future date publishes, stamped with the feed and the run, saying only what the feed said', () => {
  const v = decideEvent(staged(), ctx());
  assert.equal(v.approve, true);
  if (!v.approve) return;
  const { data, body } = parseFrontmatter(v.text);
  assert.equal(data.review, undefined);
  assert.equal(data.verified, TODAY);
  assert.match(String(data.verifiedBy), /^auto-review from the Lyons Library feed read 2026-10-14, the weekly ingest workflow$/);
  assert.ok(schema.safeParse(data).success);
  // The guide's sentence first, from the fields; then the organizer's words as a quotation that says whose they are.
  assert.equal(
    body.trim(),
    "Toddler Storytime at Lyons Regional Library, Saturday, November 7, 10 am – 12 pm. Free. Listed by Lyons Library; the organizer's page has the details and any registration.\n\n> Songs, stories and a craft for the under-fives. Bring a blanket.\n>\n> — Lyons Library, its listing",
  );
  assert.doesNotMatch(body, /<!--/);
});

test('what stays for a person: the editor’s own holds, sources that are not the organizer, and anything the feed left in doubt', () => {
  refused(staged({ review: '{ reason: "held", since: "2026-10-08", from: manual }' }), ctx(), /held by the editor \(manual\)/);
  refused(staged({ review: '{ reason: "x", since: "2026-10-08" }' }), ctx(), /not from ingest/);
  refused(staged({ sourceId: undefined }), ctx(), /no sourceId/);
  refused(staged(), ctx({ source: undefined }), /not in the registry/);
  refused(staged(), ctx({ source: { ...library, status: 'proposed' } }), /proposed, not confirmed/);
  refused(staged(), ctx({ source: { ...library, category: 'chamber' } }), /a chamber, which lists others' events/);
  refused(staged(), ctx({ source: { ...library, category: 'news' } }), /a news/);
  refused(staged({ venue: '"Venue not given in the feed"' }), ctx(), /gives no venue/);
  refused(staged({ venue: '"Microsoft Teams meeting Join: https://teams.example"' }), ctx(), /not a place/);
  refused(staged({ venue: '"P.O. Box 750"' }), ctx(), /not a place/);
  refused(staged({ venue: '"Atrium"', address: undefined }), ctx(), /one word with no address/);
  // A one-word venue with an address is a place: "Makerspace, 400 S Parish Ave".
  assert.equal(decideEvent(staged({ venue: '"Makerspace"' }), ctx()).approve, true);
  refused(staged({ title: '"Library Closed for Veterans Day"' }), ctx(), /closure notice/);
  refused(staged({ title: '"Trash Pickup (Homes WEST of Colorado Blvd)"' }), ctx(), /service schedule/);
  refused(staged({ start: '"2026-10-14T10:00"', end: undefined }), ctx(), /already past/);
  assert.equal(decideEvent(staged({ start: '"2026-10-15T10:00"', end: undefined }), ctx()).approve, true, 'today is not past');
  refused(staged({ start: '"2028-01-07T10:00"', end: undefined }), ctx(), /more than 400 days out/);
  refused(staged({ repeat: 'weekly', until: '"2026-12-05"' }), ctx(), /repeating series/);
  refused(staged({ status: 'canceled', statusNote: '"Lyons Library marks this canceled (feed read 2026-10-14)."' }), ctx(), /arrives canceled/);
  refused(staged({}, 'This event has been canceled. Songs and stories for the under-fives.'), ctx(), /says "canceled"/);
  refused(staged({}, 'POSTPONED to a new date. Songs and stories.'), ctx(), /says "POSTPONED"/);
  refused(staged(), ctx({ town: carbonValley }), /needs a subTown/);
  assert.equal(decideEvent(staged({ subTown: 'firestone' }), ctx({ town: carbonValley })).approve, true);
  refused(staged(), ctx({ published: [{ file: 'content/lyons/events/toddler-storytime.md', title: 'Toddler Storytime', start: new Date('2026-11-07T16:00:00Z') }] }), /may be content\/lyons\/events\/toddler-storytime\.md/);
  // Same title on another day is another date, not a duplicate.
  assert.equal(decideEvent(staged(), ctx({ published: [{ file: 'x.md', title: 'Toddler Storytime', start: new Date('2026-11-14T16:00:00Z') }] })).approve, true);
  refused(staged(), ctx({ targetExists: true }), /already exists/);
});

test('ingest’s one guess the rules can see through: a board game is not a board that meets', () => {
  const game = decideEvent(staged({ title: '"Cozy Board Game Night"', category: 'civic' }), ctx());
  assert.equal(game.approve, true);
  if (game.approve) assert.equal(parseFrontmatter(game.text).data.category, 'other');
  const board = decideEvent(staged({ title: '"Library Board Meeting"', category: 'civic' }), ctx());
  assert.equal(board.approve, true);
  if (board.approve) assert.equal(parseFrontmatter(board.text).data.category, 'civic');
  // Every other guess stands as made; the page shows it and the editor can change it.
  const arts = decideEvent(staged({ title: '"Messy Art"', category: 'arts' }), ctx());
  if (arts.approve) assert.equal(parseFrontmatter(arts.text).data.category, 'arts');
});

test('the quotation is the organizer’s first sentences, with the labels, links and sign-up lines gone and abbreviations intact', () => {
  assert.equal(
    quoteFrom('<!-- feed text -->\n\nDrop by anytime from 10 a.m. to noon to watch the blacksmith work his craft. Listen to the clang of the hammer. Learn about the tools.\nSign Up'),
    'Drop by anytime from 10 a.m. to noon to watch the blacksmith work his craft. Listen to the clang of the hammer.',
  );
  // Longmont's feed opens with labels that are not sentences.
  assert.equal(
    quoteFrom('For 6th-12th graders\nThis program is in English\nRegistration is required\nLearn how to turn real leaves and flowers into eco-prints. We will use leaves from the garden.'),
    'Learn how to turn real leaves and flowers into eco-prints. We will use leaves from the garden.',
  );
  // A bare domain is a link; the sentence pointing at it is a pointer, not a description.
  assert.equal(quoteFrom('Everyone is welcome to the monthly book group at the library. Visit cccld.org for more information.'), 'Everyone is welcome to the monthly book group at the library.');
  // Initials do not end a sentence.
  assert.match(quoteFrom('Learn about the C.H. Callahan house, one of the city’s oldest homes and gathering places.') ?? '', /^Learn about the C\.H\. Callahan house/);
  // Too short to mean anything, or nothing left: no quotation.
  assert.equal(quoteFrom('Fun for all ages!'), undefined);
  assert.equal(quoteFrom('<!-- The feed carried no description. -->'), undefined);
  // Never more than two sentences or about 300 characters.
  const long = Array.from({ length: 6 }, (_, i) => `Sentence number ${i + 1} of the organizer's long description runs on for a while.`).join(' ');
  const q = quoteFrom(long)!;
  assert.equal(q.split(/(?<=\.)\s/).length, 2);
  assert.ok(q.length <= 300);
});

const PUBLISHED = `---
title: "Toddler Storytime"
start: "2026-11-07T10:00"
end: "2026-11-07T12:00"
venue: "Lyons Regional Library"
category: family
source: "https://library.example/event/1"
sourceId: "lib"
verified: "2026-10-03"
changeFlag: true
changeNote: "Lyons Library now says: end 2026-11-07T12:00 → 2026-11-07T13:00"
---

Songs and stories.
`;

const change = (over: Record<string, unknown> = {}) =>
  changeSchema.parse({
    slug: 'toddler-storytime-2026-11-07',
    sourceId: 'lib',
    sourceUrl: 'https://library.example/event/1',
    detected: '2026-10-14',
    cancel: false,
    changes: [{ field: 'end', was: '2026-11-07T12:00', now: '2026-11-07T13:00' }],
    ...over,
  });

test('a change the listing’s own feed made to its time, venue or status is written in; another source’s, a moved day or a series waits', () => {
  const cctx = { source: library, today: TODAY, by: 'the weekly ingest workflow' };
  const applied = decideChange(PUBLISHED, change(), cctx);
  assert.equal(applied.approve, true);
  if (applied.approve) {
    const { data } = parseFrontmatter(applied.text);
    assert.equal(data.end, '2026-11-07T13:00');
    assert.equal(data.changeFlag, undefined);
    assert.equal(data.changeNote, undefined);
    assert.equal(data.verified, TODAY);
    assert.match(String(data.verifiedBy), /^auto-review from the Lyons Library feed read 2026-10-14, the weekly ingest workflow$/);
  }
  // The same site read by another registry entry is the same organizer.
  const sibling = decideChange(PUBLISHED, change({ sourceId: 'lib-kids', sourceUrl: 'https://library.example/kids/event/1' }), { ...cctx, source: { ...library, id: 'lib-kids' } });
  assert.equal(sibling.approve, true);
  // Another site saying so is not the organizer's change.
  const other = decideChange(PUBLISHED, change({ sourceId: 'town', sourceUrl: 'https://town.example/Calendar.aspx?EID=1' }), { ...cctx, source: { ...library, id: 'town', category: 'city-calendar' } });
  assert.equal(other.approve, false);
  if (!other.approve) assert.match(other.reasons.join(' '), /came from lib, the change from town/);
  // Day moves wait.
  const moved = decideChange(PUBLISHED, change({ changes: [{ field: 'start', was: '2026-11-07T10:00', now: '2026-11-14T10:00' }] }), cctx);
  assert.equal(moved.approve, false);
  if (!moved.approve) assert.match(moved.reasons.join(' '), /moves to another day/);
  // A weekly series holds every date; one date's change is a person's edit.
  const series = decideChange(PUBLISHED.replace('end: "2026-11-07T12:00"\n', 'end: "2026-11-07T12:00"\nrepeat: weekly\nuntil: "2026-12-05"\n'), change(), cctx);
  assert.equal(series.approve, false);
  if (!series.approve) assert.match(series.reasons.join(' '), /weekly series/);
  // The organizer calling it off is written in, with the organizer named.
  const off = decideChange(PUBLISHED, change({ cancel: true, changes: [{ field: 'status', was: 'scheduled', now: 'canceled' }] }), cctx);
  assert.equal(off.approve, true);
  if (off.approve) {
    const { data } = parseFrontmatter(off.text);
    assert.equal(data.status, 'canceled');
    assert.match(String(data.statusNote), /^Lyons Library lists this as canceled \(read 2026-10-15\)\.$/);
    assert.equal(data.statusSource, 'https://library.example/event/1');
  }
  // Not confirmed, or not the organizer: waits.
  assert.equal(decideChange(PUBLISHED, change(), { ...cctx, source: { ...library, status: 'proposed' } }).approve, false);
  assert.equal(decideChange(PUBLISHED, change(), { ...cctx, source: { ...library, category: 'news' } }).approve, false);
});
