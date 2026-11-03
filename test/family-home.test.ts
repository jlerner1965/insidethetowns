/**
 * The home page's "For families" lines (src/lib/family-home.ts): the next
 * school break with a camp on it, named by district; a deadline within the
 * fortnight for another program; one free family listing this weekend. A
 * kind with nothing to say is left out, and every line knows the day it
 * stops being true.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agesFact, eventIsFree, familyLines, shortPrice } from '../src/lib/family-home.ts';
import { parseLocal } from '../src/lib/dates.ts';
import { listingOver } from '../src/lib/expiry.ts';

const at = (s: string) => parseLocal(s);
const program = (slug: string, data: Record<string, unknown>) => ({ slug, data: { title: slug, kind: 'program', topic: 'sports', audience: ['elementary'], ...data } }) as never;
const event = (slug: string, start: string, data: Record<string, unknown> = {}) =>
  ({ slug, data: { title: slug, start: at(start), end: at(start.replace(/T\d\d/, 'T23')), venue: 'Erie Community Library', category: 'family', cost: 'Free', allDay: false, status: 'scheduled', ...data } }) as never;

const BREAKS = [
  { district: 'Boulder Valley', from: '2026-11-11', to: '2026-11-11' },
  { district: 'St. Vrain', from: '2026-11-23', to: '2026-11-27' },
  { district: 'Boulder Valley', from: '2026-11-23', to: '2026-11-27' },
];
const camp = program('camp-erie-break-camps', {
  title: 'Camp Erie school-break camps',
  ages: '6–14 on the day of camp',
  price: '$125–$180 for each three-day camp, as the registration site lists it; the Camp Erie scholarship takes 50 per cent off',
  registration: { required: true, deadline: at('2026-11-13') },
  openOn: [
    { from: at('2026-11-23'), to: at('2026-11-25'), note: 'Camp Erie' },
    { from: at('2026-12-21'), to: at('2026-12-23'), note: 'Camp Erie' },
  ],
  featured: true,
});
const athletics = program('erie-middle-school-athletics', { title: 'Erie Middle School athletics', registration: { required: true, deadline: at('2026-11-16') } });

test('the break line names the camp, its days and the districts whose break it is on, never every child in town', () => {
  const now = at('2026-11-03T09:00');
  const [brk] = familyLines({ programs: [camp, athletics], breaks: BREAKS, events: [], now });
  assert.equal(brk!.kind, 'break');
  assert.equal(brk!.title, 'Camp Erie school-break camps');
  assert.equal(brk!.when, 'November 23–25');
  assert.deepEqual(brk!.facts, ['St. Vrain and Boulder Valley break', 'Ages 6–14 on the day of camp', '$125–$180 for each three-day camp', 'Register by Fri, Nov 13']);
  assert.equal(brk!.href, '/families/#program-camp-erie-break-camps');
  assert.equal(brk!.day, '2026-11-13', 'off the page in the browser once its deadline is past, even on an old build');
  // One district's day off is that district's: a window on Boulder Valley's Veterans Day says so.
  const vets = program('vets-day-club', { title: 'Veterans Day club', openOn: [{ from: at('2026-11-11'), to: at('2026-11-11'), note: '' }] });
  assert.deepEqual(familyLines({ programs: [vets], breaks: BREAKS, events: [], now })[0]!.facts, ['Boulder Valley break']);
});

test('the deadline line is another program, so the same camp is not named twice', () => {
  const now = at('2026-11-03T09:00');
  const lines = familyLines({ programs: [camp, athletics], breaks: BREAKS, events: [], now });
  assert.deepEqual(lines.map((l) => l.kind), ['break', 'deadline']);
  assert.equal(lines[1]!.title, 'Erie Middle School athletics');
  assert.equal(lines[1]!.when, 'Register by Mon, Nov 16');
  assert.equal(lines[1]!.day, '2026-11-16');
});

test('a camp a reader can no longer join is not offered: deadline gone, or full on the organizer’s word', () => {
  const after = familyLines({ programs: [camp], breaks: BREAKS, events: [], now: at('2026-11-14T09:00') });
  assert.deepEqual(after, [], 'the deadline is behind, and nothing else is due');
  const full = program('full-camp', { title: 'Full camp', status: 'full', openOn: [{ from: at('2026-11-23'), to: at('2026-11-25'), note: '' }] });
  assert.deepEqual(familyLines({ programs: [full], breaks: BREAKS, events: [], now: at('2026-11-03T09:00') }), []);
  const far = program('spring-camp', { title: 'Spring camp', openOn: [{ from: at('2027-03-15'), to: at('2027-03-19'), note: '' }] });
  assert.deepEqual(familyLines({ programs: [far], breaks: BREAKS, events: [], now: at('2026-11-03T09:00') }), [], 'more than six weeks out is the hub’s, not the home’s');
});

test('the free line is this weekend’s free family listing, a one-off before a weekly series, nothing called off', () => {
  const now = at('2026-11-03T09:00'); // a Tuesday: the weekend is the 6th to the 8th
  const events = [
    event('saturday-storytime', '2026-11-07T10:30'),
    event('dinovember', '2026-11-07T14:30', { cost: 'Free; registration required' }),
    event('shadow-puppets', '2026-11-08T11:30', { status: 'canceled' }),
    event('paid-workshop', '2026-11-07T09:00', { cost: 'Standard $25 / Resident $20' }),
    event('council', '2026-11-07T09:00', { category: 'civic' }),
    event('tuesday-thing', '2026-11-03T16:00'),
  ];
  const lines = familyLines({ programs: [], breaks: [], events, now, isSeries: (e: { slug: string }) => e.slug === 'saturday-storytime' });
  assert.equal(lines.length, 1);
  assert.equal(lines[0]!.title, 'dinovember');
  assert.equal(lines[0]!.when, 'Sat, Nov 7, 2:30 pm');
  assert.deepEqual(lines[0]!.facts, ['Free; registration required', 'Erie Community Library'], 'the cost as the listing gives it');
  assert.equal(lines[0]!.href, '/events/dinovember/');
  // The browser takes it down when it is over (src/lib/expiry.ts).
  assert.ok(!listingOver({ end: lines[0]!.end, day: lines[0]!.day }, at('2026-11-07T15:00').getTime(), '2026-11-07'));
  assert.ok(listingOver({ end: lines[0]!.end, day: lines[0]!.day }, at('2026-11-08T09:00').getTime(), '2026-11-08'));
});

test('nothing to say is nothing on the page', () => {
  assert.deepEqual(familyLines({ programs: [], breaks: BREAKS, events: [], now: at('2026-11-03T09:00') }), []);
});

test('free means free, and a price is its first clause', () => {
  assert.ok(eventIsFree('Free'));
  assert.ok(eventIsFree('Free; registration required'));
  assert.ok(!eventIsFree('Free for members, $10 for guests'));
  assert.ok(!eventIsFree(undefined));
  assert.equal(shortPrice('$125–$180 for each three-day camp, as the registration site lists it; scholarships'), '$125–$180 for each three-day camp');
  assert.equal(shortPrice('$1,200 a season'), '$1,200 a season', 'a thousands comma is not a clause');
  assert.equal(agesFact('6–14 on the day of camp'), 'Ages 6–14 on the day of camp');
  assert.equal(agesFact('Erie Middle School students'), 'Erie Middle School students', 'not "Ages Erie Middle School students"');
  assert.equal(agesFact('up to 5'), 'Ages up to 5');
});
