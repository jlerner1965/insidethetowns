/**
 * Which few listings a page leads with.
 *
 * The case that prompted this: Berthoud's home page on a Thursday evening led
 * with Friday morning's toddler storytime and a knitting drop-in, and showed
 * nothing from the weekend, because "the next four by date" is what it was.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { highlights, occurrences, oneOffs, weeklyRegulars, weeklyTest } from '../src/lib/events.ts';

type Extra = {
  category?: string;
  featured?: boolean;
  end?: string;
  repeat?: 'weekly';
  until?: string;
  recurring?: string;
  /** For a series stored as one file per date: the same title, a different slug. */
  slug?: string;
  venue?: string;
};

/** A listing as the content collection would hand it over. */
function ev(title: string, start: string, { category = 'other', featured = false, end, repeat, until, recurring, slug, venue = 'The hall' }: Extra = {}) {
  return {
    slug: slug ?? title.toLowerCase().replace(/\W+/g, '-'),
    data: {
      title,
      venue,
      start: parseLocal(start),
      end: end ? parseLocal(end) : undefined,
      allDay: false,
      category,
      featured,
      repeat,
      until: until ? parseLocal(until) : undefined,
      recurring,
    },
  };
}

// A Thursday evening; the weekend is Friday 25 to Sunday 27 September.
const thursday = parseLocal('2026-09-24T21:00');
const titles = (list: { data: { title: string } }[]) => list.map((e) => e.data.title);

test('the weekend beats Friday morning when there is not room for both', () => {
  const list = [
    ev('Toddler storytime', '2026-09-25T10:30', { category: 'family' }),
    ev('Knit and crochet drop-in', '2026-09-25T13:00'),
    ev('Planning Commission', '2026-09-24T18:30', { category: 'civic' }),
    ev('Art in the Park', '2026-09-26T09:00', { category: 'arts' }),
    ev('Farmers market', '2026-09-27T09:00', { category: 'market' }),
    ev('Book club', '2026-09-30T18:00'),
  ];
  // Six listings, four slots: everything inside the weekend is in, the
  // Wednesday book club and the civic meeting are out.
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 4 })), [
    'Toddler storytime',
    'Knit and crochet drop-in',
    'Art in the Park',
    'Farmers market',
  ]);
});

test('a featured listing leads even when it is weeks away', () => {
  const list = [
    ev('Farmers market', '2026-09-26T09:00', { category: 'market' }),
    ev('Oktoberfest', '2026-10-17T12:00', { category: 'festival', featured: true }),
  ];
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 1 })), ['Oktoberfest']);
});

test('a civic meeting comes last within its tier, not out of the list', () => {
  const list = [
    ev('Town Board', '2026-09-26T18:00', { category: 'civic' }),
    ev('Trivia night', '2026-09-30T18:30'),
  ];
  // The weekend tier, even for a council, still beats a plain weekday listing.
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 1 })), ['Town Board']);
  // But inside the weekend the meeting yields to anything else on.
  const weekend = [ev('Town Board', '2026-09-25T18:00', { category: 'civic' }), ev('Concert', '2026-09-26T19:00', { category: 'music' })];
  assert.deepEqual(titles(highlights(weekend, { now: thursday, limit: 1 })), ['Concert']);
});

test('a tier takes one listing from each day in turn, so Friday does not fill the weekend', () => {
  const list = [
    ev('Friday A', '2026-09-25T10:00'),
    ev('Friday B', '2026-09-25T11:00'),
    ev('Friday C', '2026-09-25T12:00'),
    ev('Saturday D', '2026-09-26T09:00'),
    ev('Sunday E', '2026-09-27T10:00'),
  ];
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 3 })), ['Friday A', 'Saturday D', 'Sunday E']);
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 4 })), ['Friday A', 'Friday B', 'Saturday D', 'Sunday E']);
});

test('the chosen listings come back in date order', () => {
  const list = [
    ev('Later thing', '2026-10-02T18:00'),
    ev('Weekend thing', '2026-09-26T10:00'),
    ev('Headliner', '2026-10-10T19:00', { featured: true }),
  ];
  assert.deepEqual(titles(highlights(list, { now: thursday })), ['Weekend thing', 'Later thing', 'Headliner']);
});

test('within the weekend a one-off beats an earlier regular', () => {
  const list = [
    ev('Toddler storytime', '2026-09-25T10:30', { category: 'family', recurring: 'Fridays at 10:30' }),
    ev('Knit and crochet drop-in', '2026-09-25T13:00', { slug: 'knit-2026-09-25' }),
    ev('Knit and crochet drop-in', '2026-10-02T13:00', { slug: 'knit-2026-10-02' }),
    ev('Art in the Park', '2026-09-26T09:00', { category: 'arts' }),
  ];
  // The knitting drop-in carries no `recurring` note; it is a series because
  // the same title at the same venue appears on another date.
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 1 })), ['Art in the Park']);
  assert.deepEqual(titles(highlights(list, { now: thursday, limit: 3 })), ['Toddler storytime', 'Knit and crochet drop-in', 'Art in the Park']);
});

test('one-offs leave out the regulars, however they are stored, and the council', () => {
  const list = [
    ev('Toddler storytime', '2026-09-25T10:30', { category: 'family', repeat: 'weekly', until: '2026-12-18' }),
    ev('Trivia night', '2026-09-30T18:30', { recurring: 'Last Wednesdays' }),
    ev('Knit and crochet drop-in', '2026-09-25T13:00', { slug: 'knit-2026-09-25' }),
    ev('Knit and crochet drop-in', '2026-10-02T13:00', { slug: 'knit-2026-10-02' }),
    ev('Town Board', '2026-09-26T18:00', { category: 'civic' }),
    ev('Oktoberfest', '2026-09-26T11:00', { category: 'festival' }),
    ev('Fall festival', '2026-09-19', { category: 'family', end: '2026-10-31' }),
  ];
  // The multi-week run is a one-off too: it is not a weekly regular.
  assert.deepEqual(titles(oneOffs(list)), ['Oktoberfest', 'Fall festival']);
  // Given only the weekend's slice, the series is still recognised from the full list.
  const weekend = list.filter((e) => e.data.start >= parseLocal('2026-09-25') && e.data.start < parseLocal('2026-09-28'));
  assert.deepEqual(titles(oneOffs(weekend, list)), ['Oktoberfest']);
});

test('a series stored as a file per date takes one of the picks, not one per date', () => {
  const now = parseLocal('2026-10-15T12:00');
  const events = [
    ev('Studio tour', '2026-10-17T10:00', { slug: 'studio-tour-2026-10-17', venue: 'Downtown' }),
    ev('Studio tour', '2026-10-18T10:00', { slug: 'studio-tour-2026-10-18', venue: 'Downtown' }),
    ev('Pumpkin patch', '2026-10-17T09:00'),
    ev('Concert', '2026-10-18T19:00'),
  ];
  const picks = highlights(events, { now, limit: 4 }).map((e) => e.slug);
  assert.equal(picks.filter((s) => s.startsWith('studio-tour')).length, 1);
  assert.ok(picks.includes('pumpkin-patch') && picks.includes('concert'));
});

test('a run across weekdays is a one-off shown once, not a regular ranked below everything', () => {
  // Estes Park, Thursday 8 October 2026: two nights of the same show the
  // next week, two more at the end of the month, and six one-offs in
  // November. The show was counted as a regular and never made the six.
  const now = parseLocal('2026-10-08T12:00');
  const events = [
    ev('Walking with Ghosts', '2026-10-15T19:30', { category: 'arts', slug: 'ghosts-10-15', venue: 'Stanley' }),
    ev('Walking with Ghosts', '2026-10-16T19:30', { category: 'arts', slug: 'ghosts-10-16', venue: 'Stanley' }),
    ev('Costume Ball', '2026-10-30T18:30', { category: 'music', slug: 'ball-10-30', venue: 'Stanley' }),
    ev('Costume Ball', '2026-10-31T18:30', { category: 'music', slug: 'ball-10-31', venue: 'Stanley' }),
    ev('Trick or treat', '2026-10-31T17:00'),
    ev('Wellness fair', '2026-11-07T09:00'),
    ev('Gumbo dinner', '2026-11-12T16:30'),
    ev('Puzzle exchange', '2026-11-14T11:30'),
    ev('Teen cooking', '2026-11-18T16:30'),
    ev('Tree lighting', '2026-11-21T15:30'),
    // A card-making session on three Saturdays is a regular, and still ranks after the one-offs.
    ev('Card making', '2026-11-07T10:00', { slug: 'cards-11-07', venue: 'Library' }),
    ev('Card making', '2026-11-21T10:00', { slug: 'cards-11-21', venue: 'Library' }),
    ev('Card making', '2026-12-12T11:00', { slug: 'cards-12-12', venue: 'Library' }),
  ];
  const picks = highlights(events, { now, limit: 6 });
  assert.deepEqual(picks.map((e) => e.slug), ['ghosts-10-15', 'ball-10-30', 'trick-or-treat', 'wellness-fair', 'gumbo-dinner', 'puzzle-exchange']);
  // And on the hub, the show is a reason to drive: a one-off, once.
  assert.deepEqual(oneOffs(events).map((e) => e.slug).filter((s) => s.startsWith('ghosts')), ['ghosts-10-15', 'ghosts-10-16']);
  assert.ok(!oneOffs(events).some((e) => e.slug.startsWith('cards')));
});

test('what has passed is out, and a weekly series appears once', () => {
  const list = [
    ev('Yesterday', '2026-09-23T18:00'),
    ev('Yoga', '2026-09-15T09:00', { repeat: 'weekly', until: '2026-12-15' }),
    ev('Concert', '2026-09-26T19:00', { category: 'music' }),
  ];
  const picked = highlights(occurrences(list, { now: thursday }), { now: thursday });
  assert.deepEqual(titles(picked), ['Concert', 'Yoga']);
  assert.equal(picked[1]!.data.start.toISOString(), parseLocal('2026-09-29T09:00').toISOString(), 'the next Tuesday, not the first');
});

test('a weekly regular is a repeat, a recurring note, or three dates on one weekday; a pair or a civic series is not', () => {
  const list = [
    ev('Trivia', '2026-09-22T18:00', { repeat: 'weekly', until: '2026-12-15', venue: 'The Tap' }),
    ev('Open mic', '2026-10-15T19:00', { recurring: 'Third Thursdays' }),
    ev('Storytime', '2026-10-06T10:30', { slug: 'storytime-1' }),
    ev('Storytime', '2026-10-13T10:30', { slug: 'storytime-2' }),
    ev('Storytime', '2026-10-20T10:30', { slug: 'storytime-3' }),
    ev('Line dancing', '2026-10-08T18:00', { slug: 'line-1' }),
    ev('Line dancing', '2026-10-29T18:00', { slug: 'line-2' }),
    ev('Town Council', '2026-10-05T18:00', { category: 'civic', slug: 'council-1' }),
    ev('Town Council', '2026-10-19T18:00', { category: 'civic', slug: 'council-2' }),
    ev('Town Council', '2026-11-02T18:00', { category: 'civic', slug: 'council-3' }),
    ev('Oktoberfest', '2026-10-10T12:00', { category: 'festival' }),
    // A seasonal run stored as one date range with a note is an event, not a regular.
    ev('Terror in the Corn', '2026-09-25T19:00', { end: '2026-10-31T23:00', recurring: 'Thursday to Sunday nights through October 31', slug: 'corn' }),
  ];
  const isWeekly = weeklyTest(list);
  assert.deepEqual(list.filter(isWeekly).map((e) => e.slug), ['trivia', 'open-mic', 'storytime-1', 'storytime-2', 'storytime-3']);
  // Once each, on the next date to come, the one-offs and meetings left to the date list.
  const regulars = weeklyRegulars(list, parseLocal('2026-10-01T12:00'));
  assert.deepEqual(new Set(titles(regulars)), new Set(['Trivia', 'Storytime', 'Open mic']));
  assert.equal(regulars.find((e) => e.data.title === 'Trivia')!.data.start.toISOString(), parseLocal('2026-10-06T18:00').toISOString(), 'the next Tuesday');
});
