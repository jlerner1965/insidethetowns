/**
 * The standing children's and family programs (src/lib/events.ts,
 * standingFamilyTest): the library's storytimes and the kids' clubs, weekly
 * or monthly under the family category, which the home page's tabs, This
 * week, the Thursday email and the hub's front page leave to the Families
 * page and the events page's weekly block (the owner, 6 November 2026:
 * Inside Berthoud's weekend opened with "Terrific Toddler Storytime").
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { forGeneralReaders, occurrences, standingFamilyTest } from '../src/lib/events.ts';

const at = (s: string) => parseLocal(s);
const ev = (slug: string, start: string, extra: Record<string, unknown> = {}) => ({
  slug,
  data: { title: slug, start: at(start), venue: 'The library', category: 'family', allDay: false, ...extra } as never,
});

test('a weekly storytime and a monthly club are standing programs; a one-off family event is not', () => {
  const all = [
    ev('Terrific Toddler Storytime', '2026-11-06T10:30', { repeat: 'weekly', until: at('2026-12-18') }),
    ev('Family LEGO Club', '2026-11-15T14:00', { recurring: 'Monthly, third Sundays' }),
    ev('Trunk or Treat', '2026-10-31T17:00'),
    ev('Holiday Craft Fair', '2026-12-05T10:00', { venue: 'Town Hall' }),
  ];
  const standing = standingFamilyTest(all);
  assert.deepEqual(all.map((e) => [e.slug, standing(e)]), [
    ['Terrific Toddler Storytime', true],
    ['Family LEGO Club', true],
    ['Trunk or Treat', false],
    ['Holiday Craft Fair', false],
  ]);
});

test('a series stored as a file per date on one weekday is a standing program', () => {
  const dates = ['2026-11-03', '2026-11-17', '2026-12-01'].map((d, i) => ev(`tales-${i}`, `${d}T16:00`, { title: 'Tales 2 Tails' }));
  const standing = standingFamilyTest(dates);
  assert.ok(dates.every(standing), 'first and third Tuesdays, three files');
  const show = ['2026-11-12', '2026-11-13'].map((d, i) => ev(`show-${i}`, `${d}T19:00`, { title: 'The Nutcracker', venue: 'The theatre' }));
  assert.ok(!show.some(standingFamilyTest(show)), 'a show on a Thursday and a Friday is a one-off that happens twice');
});

test('a seasonal run under the family category stays: its sittings carry the run, not a program', () => {
  const rides = ev('Holiday Carriage Rides', '2026-11-22T17:00', {
    end: at('2027-01-03T20:00'),
    recurring: 'Wednesday to Sunday, November 22 to January 3',
    schedule: [{ days: ['wed', 'thu', 'fri', 'sat', 'sun'] }],
  });
  const polar = ev('The Polar Express Train Ride', '2026-11-06', { end: at('2026-12-23'), allDay: true, recurring: 'Several evenings a week from November 6' });
  const all = [rides, polar];
  const expanded = occurrences(all, { now: at('2026-11-20T12:00'), horizonDays: 30 });
  assert.ok(expanded.length > 2, 'the carriage rides expand to their open days');
  assert.equal(forGeneralReaders(expanded, all).length, expanded.length, 'every sitting is kept');
});

test('a regular outside the family category is not a children\'s program: trivia and the council meet as before', () => {
  const all = [
    ev('Trivia night', '2026-11-05T19:00', { venue: 'The brewery', category: 'food', repeat: 'weekly', until: at('2026-12-31') }),
    ev('Town Board', '2026-11-10T18:30', { venue: 'Town Hall', category: 'civic', recurring: 'Second and fourth Tuesdays' }),
    ev('Bouncing Baby Storytime', '2026-11-10T10:30', { repeat: 'weekly', until: at('2026-12-15') }),
  ];
  assert.deepEqual(forGeneralReaders(all).map((e) => e.slug), ['Trivia night', 'Town Board']);
});
