/**
 * The calendar's reliability (audit priority 1, 26 October 2026).
 *
 * On Monday 26 October 2026 Erie's events page, filtered to "Today", listed
 * Terror in the Corn, which runs Thursday to Sunday nights, and left out
 * the Monday chess club the home page and "Every week" both showed. Every
 * case here runs on a fixed clock against fixtures copied from the listings
 * of that day, so none of it depends on the real date.
 *
 * The rule under test: a listing is a series (a run, a weekly repeat, a
 * production), and what the pages show, filter, count and export is its
 * occurrences, from `occurrences()`, the one expansion every page reads.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { dayKey, parseLocal } from '../src/lib/dates.ts';
import { agenda, groupByDay, isPast, nextOccurrence, occurrences, upcoming, weeklyRegulars, weeklyTest } from '../src/lib/events.ts';
import { eventRowShown, whenWindow, type EventRowMarks } from '../src/lib/filters.ts';
import { buildIcs, feedEvents } from '../src/lib/ics.ts';
import { weekEvents } from '../src/lib/weekly.ts';
import { weekDays } from '../src/lib/flagship-home.ts';
import { eventSchema } from '../src/content/schemas.ts';
import { lastDay } from '../src/lib/events.ts';

const at = (s: string) => parseLocal(s);
const schema = eventSchema(() => z.string());

/** Monday 26 October 2026, 9 am in Denver: the morning of the Erie report. */
const MONDAY = at('2026-10-26T09:00');

type Fx = { slug: string; data: ReturnType<typeof schema.parse> };

/** A listing as the content collection hands it over: parsed by the real schema. */
function listing(slug: string, fields: Record<string, unknown>): Fx {
  return { slug, data: schema.parse({ venue: 'Somewhere', category: 'other', ...fields }) };
}

// The listings as they stood on 26 October, re-encoded from their own prose.
const terror = listing('terror-in-the-corn-2026', {
  title: 'Terror in the Corn at Anderson Farms',
  start: '2026-09-25T19:00',
  end: '2026-10-31T23:00',
  venue: 'Anderson Farms',
  recurring: 'Thursday to Sunday nights through October 31',
  timeNote: 'Thu & Sun 7–10 pm, Fri & Sat 7–11 pm, through Oct 31',
  schedule: [
    { days: ['thu', 'sun'], start: '19:00', end: '22:00' },
    { days: ['fri', 'sat'], start: '19:00', end: '23:00' },
  ],
});
const festival = listing('anderson-farms-fall-festival-2026', {
  title: 'Anderson Farms Fall Festival',
  start: '2026-09-23',
  end: '2026-10-31',
  allDay: true,
  venue: 'Anderson Farms',
  category: 'family',
  recurring: 'Daily except Tuesdays, through October 31',
  schedule: [{ days: ['mon', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
});
const chess = listing('chess-club-for-grades-3-5', {
  title: 'Chess Club for grades 3-5',
  start: '2026-09-28T16:15',
  end: '2026-09-28T17:15',
  repeat: 'weekly',
  until: '2026-10-26',
  venue: 'Erie Community Library',
  category: 'family',
  recurring: 'Mondays',
});
/** A monthly club stored the way the guides store one: a file per session, each saying "Second Mondays". */
const monthly = ['2026-09-14', '2026-10-12', '2026-11-09', '2026-12-14'].map((d) =>
  listing(`book-club-${d}`, { title: 'Second Monday Book Club', start: `${d}T18:30`, end: `${d}T19:30`, venue: 'Library', recurring: 'Second Mondays' }),
);

const days = (list: Fx[]) => list.map((e) => dayKey(e.data.start));

// ------------------------------------------------------------ 1 and 2

test('1. a Thursday-to-Sunday attraction is not on a Monday (Erie, 26 October 2026)', () => {
  const all = occurrences([terror], { now: MONDAY, horizonDays: 14 });
  const today = upcoming(all, { now: MONDAY, days: 1 });
  assert.deepEqual(today, [], 'nothing on the Monday');
  assert.deepEqual(days(upcoming(all, { now: MONDAY })), ['2026-10-29', '2026-10-30', '2026-10-31'], 'Thursday, Friday and Saturday, and no later: the run ends on the 31st');
  const [thu, fri] = upcoming(all, { now: MONDAY });
  assert.equal(thu!.data.start.getTime(), at('2026-10-29T19:00').getTime());
  assert.equal(thu!.data.end!.getTime(), at('2026-10-29T22:00').getTime(), 'Thursday closes at 10');
  assert.equal(fri!.data.end!.getTime(), at('2026-10-30T23:00').getTime(), 'Friday closes at 11');
  assert.equal(thu!.data.timeNote, undefined, 'the night carries its own hours, not the whole run’s note');
});

test('2. a festival open daily except Tuesdays is not on a Tuesday', () => {
  const tuesday = at('2026-10-27T10:00');
  const all = occurrences([festival], { now: tuesday, horizonDays: 7 });
  assert.deepEqual(upcoming(all, { now: tuesday, days: 1 }), []);
  assert.deepEqual(days(upcoming(all, { now: tuesday })), ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
  assert.ok(all.every((e) => e.data.allDay), 'an all-day run stays all day on each of its days');
  // The weekday on the client filter's own rows, not only the server's list.
  const rows = agenda([festival], { now: tuesday }).fortnight;
  const shown = rows.filter((r) => eventRowShown(marks(r), { when: 'today', category: 'all', free: false, where: 'all' }, tuesday));
  assert.equal(shown.length, 0);
});

// ------------------------------------------------------------ 3 and 4

test('3. a verified Monday session is in Monday’s dated results', () => {
  const rows = agenda([chess, terror, festival], { now: MONDAY }).fortnight;
  const today = rows.filter((r) => eventRowShown(marks(r), { when: 'today', category: 'all', free: false, where: 'all' }, MONDAY));
  assert.deepEqual(today.map((r) => r.event.slug).sort(), ['anderson-farms-fall-festival-2026', 'chess-club-for-grades-3-5']);
  // In the unfiltered view the regular stays in its own directory, once.
  const anytime = rows.filter((r) => eventRowShown(marks(r), { when: 'any', category: 'all', free: false, where: 'all' }, MONDAY));
  assert.ok(!anytime.some((r) => r.event.slug === 'chess-club-for-grades-3-5'));
  assert.deepEqual(agenda([chess], { now: MONDAY }).weekly.map((e) => e.slug), ['chess-club-for-grades-3-5']);
  // Its last week is the 26th: nothing invented after `until`.
  assert.deepEqual(days(occurrences([chess], { now: MONDAY, horizonDays: 60 }).filter((e) => !isPast(e, MONDAY))), ['2026-10-26']);
});

test('4. a second-Monday monthly event is not on every Monday', () => {
  const isWeekly = weeklyTest(monthly);
  assert.ok(monthly.every((e) => !isWeekly(e)), 'a monthly series is not a weekly regular, whatever its note says');
  assert.deepEqual(weeklyRegulars(monthly, MONDAY), [], 'so it is not under "Every week: Mondays"');
  const { fortnight, later } = agenda(monthly, { now: MONDAY });
  assert.deepEqual(fortnight.map((r) => dayKey(r.event.data.start)), [], 'no session in the next fourteen days');
  assert.deepEqual(later.map((e) => dayKey(e.data.start)), ['2026-11-09', '2026-12-14'], 'each session on its own date');
  // Four Mondays in a row is a weekly series, filed a date at a time.
  const weekly = ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'].map((d) =>
    listing(`knit-${d}`, { title: 'Knit night', start: `${d}T18:00`, venue: 'Library' }),
  );
  assert.ok(weeklyTest(weekly)(weekly[3]!));
});

// ------------------------------------------------------------ 5

test('5. cancelled and excluded occurrences are handled the same way everywhere', () => {
  const carriage = listing('holiday-carriage-rides-2026-11-22', {
    title: 'Holiday Carriage Rides',
    start: '2026-11-22T17:00',
    end: '2027-01-03T20:00',
    category: 'family',
    schedule: [
      { days: ['wed', 'thu', 'fri'], start: '16:30', end: '20:30' },
      { days: ['sat', 'sun'], start: '17:00', end: '20:00' },
    ],
    except: ['2026-11-26', '2026-12-24', '2026-12-25', '2026-12-31'],
  });
  const thanksgiving = at('2026-11-26T12:00');
  const all = occurrences([carriage], { now: thanksgiving, horizonDays: 60 });
  const listed = days(all);
  for (const off of ['2026-11-26', '2026-12-24', '2026-12-25', '2026-12-31']) assert.ok(!listed.includes(off), `no ride on ${off}`);
  assert.ok(listed.includes('2026-11-27') && listed.includes('2026-12-26'));
  assert.ok(!listed.some((d) => ['mon', 'tue'].includes(weekday(d))), 'no ride on a Monday or Tuesday');
  // The excluded day is in no list, no filter and no export.
  const rows = agenda([carriage], { now: thanksgiving }).fortnight;
  assert.equal(rows.filter((r) => eventRowShown(marks(r), { when: 'today', category: 'all', free: false, where: 'all' }, thanksgiving)).length, 0);
  const ics = buildIcs(feedEvents([carriage], { now: thanksgiving, site: 'https://insidecastlerock.com', domain: 'insidecastlerock.com' }), { name: 'x', domain: 'x', now: thanksgiving });
  assert.ok(!ics.includes('DTSTART;TZID=America/Denver:20261126'), 'Thanksgiving is not in the feed');
  assert.ok(ics.includes('DTSTART;TZID=America/Denver:20261127T163000'));
  // A weekly repeat takes the same `except`.
  const trivia = listing('trivia', { title: 'Trivia', start: '2026-11-05T19:00', repeat: 'weekly', until: '2026-12-03', except: ['2026-11-26'] });
  assert.deepEqual(days(occurrences([trivia], { now: thanksgiving, horizonDays: 30 })), ['2026-11-05', '2026-11-12', '2026-11-19', '2026-12-03']);
  // A cancelled listing keeps every date, marked, on the calendar and in the feed, and leaves the week's picks.
  const off = listing('called-off', { title: 'Called off', start: '2026-10-29T18:00', status: 'canceled', statusNote: 'The Town lists it as canceled.' });
  const feed = feedEvents([off], { now: MONDAY, site: 'https://x.test', domain: 'x.test' });
  assert.equal(feed[0]!.cancelled, true);
  assert.equal(agenda([off], { now: MONDAY }).fortnight.length, 1, 'still on the dated list, struck through');
  assert.deepEqual(weekEvents(occurrences([off], { now: MONDAY }), MONDAY), [], 'and out of the week the home page recommends');
  // The schema refuses an `except` day the series could never have had, and a run that would end on a day it is shut.
  assert.throws(() => listing('bad', { title: 'Bad', start: '2026-11-05T19:00', repeat: 'weekly', until: '2026-12-03', except: ['2026-11-27'] }));
  assert.throws(() => listing('bad2', { title: 'Bad', start: '2026-10-01T19:00', end: '2026-10-31T22:00', schedule: [{ days: ['thu'] }] }));
});

// ------------------------------------------------------------ 6 and 7

test('6. an overnight event stays on until its real end time', () => {
  const haunt = listing('late-haunt', {
    title: 'Late haunt',
    start: '2026-10-30T19:00',
    end: '2026-10-31T01:00',
    schedule: [{ days: ['fri', 'sat'], start: '19:00', end: '01:00' }],
  });
  const all = occurrences([haunt], { now: at('2026-10-30T12:00'), horizonDays: 7 });
  assert.deepEqual(days(all), ['2026-10-30']);
  const friday = all[0]!;
  assert.equal(friday.data.end!.getTime(), at('2026-10-31T01:00').getTime(), '1 am on Saturday, not 1 am on Friday');
  assert.equal(isPast(friday, at('2026-10-31T00:45')), false, 'still on at quarter to one');
  assert.equal(isPast(friday, at('2026-10-31T01:00')), true);
  assert.equal(lastDay(friday), '2026-10-31');
  const oneOff = listing('gig', { title: 'Late gig', start: '2026-10-31T20:00', end: '2026-11-01T00:30' });
  assert.equal(upcoming([oneOff], { now: at('2026-11-01T00:15') }).length, 1);
  assert.equal(upcoming([oneOff], { now: at('2026-11-01T00:30') }).length, 0);
});

test('7. the 1 November 2026 clock change keeps local times', () => {
  const run = listing('lights', { title: 'Lights', start: '2026-10-29T18:00', end: '2026-11-05T21:00', schedule: [{ days: ['thu', 'sun'], start: '18:00', end: '21:00' }] });
  const all = occurrences([run], { now: at('2026-10-26T12:00'), horizonDays: 14 });
  assert.deepEqual(days(all), ['2026-10-29', '2026-11-01', '2026-11-05']);
  const hours = all.map((e) => (e.data.end!.getTime() - e.data.start.getTime()) / 3_600_000);
  assert.deepEqual(hours, [3, 3, 3], 'three hours each night, the Sunday of the change included');
  const ics = buildIcs(feedEvents([run], { now: at('2026-10-26T12:00'), site: 'https://x.test', domain: 'x.test' }), { name: 'x', domain: 'x.test', now: MONDAY });
  for (const d of ['20261029', '20261101', '20261105']) {
    assert.ok(ics.includes(`DTSTART;TZID=America/Denver:${d}T180000`), `6 pm on ${d}`);
    assert.ok(ics.includes(`DTEND;TZID=America/Denver:${d}T210000`), `9 pm on ${d}`);
  }
  // A weekly repeat across the change, the same.
  const weekly = listing('w', { title: 'W', start: '2026-10-28T18:00', repeat: 'weekly', until: '2026-11-04' });
  assert.deepEqual(occurrences([weekly], { now: MONDAY }).map((e) => e.data.start.getTime()), [at('2026-10-28T18:00').getTime(), at('2026-11-04T18:00').getTime()]);
});

// ------------------------------------------------------------ 8

test('8. the home page week, the filtered agenda and the feed agree about the same occurrence', () => {
  const entries = [terror, festival, chess];
  // The home page: FlagshipHome passes occurrences() to weekDays.
  const week = weekDays({ events: occurrences(entries, { now: MONDAY, horizonDays: 8 }), now: MONDAY });
  // A row's shown title may drop "at Anderson Farms" (agendaTitle); fullTitle is the listing's own.
  const homeDays = week.filter((d) => d.items.some((i) => i.fullTitle === terror.data.title)).map((d) => d.key);
  // The events page, filtered to the next seven days.
  const rows = agenda(entries, { now: MONDAY }).fortnight;
  const filtered = rows
    .filter((r) => r.event.slug === terror.slug)
    .filter((r) => eventRowShown(marks(r), { when: 'week', category: 'all', free: false, where: 'all' }, MONDAY))
    .map((r) => dayKey(r.event.data.start));
  // The calendar feed.
  const feed = feedEvents(entries, { now: MONDAY, site: 'https://insideerie.com', domain: 'insideerie.com' })
    .filter((e) => e.title === terror.data.title)
    .map((e) => dayKey(e.start));
  assert.deepEqual(homeDays, ['2026-10-29', '2026-10-30', '2026-10-31']);
  assert.deepEqual(filtered, homeDays);
  assert.deepEqual(feed, homeDays);
  // And Monday is Monday everywhere: the chess club, the festival, no Terror.
  const mondayHome = week.find((d) => d.key === '2026-10-26')!.items.map((i) => i.fullTitle).sort();
  const mondayRows = rows
    .filter((r) => eventRowShown(marks(r), { when: 'today', category: 'all', free: false, where: 'all' }, MONDAY))
    .map((r) => r.event.data.title)
    .sort();
  assert.deepEqual(mondayRows, mondayHome);
  // The single-event file a reader saves gives the same next night.
  assert.equal(dayKey(nextOccurrence(terror, MONDAY).data.start), '2026-10-29');
});

// ------------------------------------------------------------ order and time

test('a day lists its timed things by clock, then the all-day ones, then the ones with no time yet', () => {
  const game = listing('game', { title: 'Football', start: '2026-10-30T19:00', category: 'sports' });
  const talk = listing('talk', { title: 'Talk', start: '2026-10-30T10:00', category: 'arts' });
  const fair = listing('fair', { title: 'Fair', start: '2026-10-30', allDay: true });
  const tbd = listing('tbd', { title: 'Parade', start: '2026-10-30', allDay: true, timeTbd: true, timeNote: 'Start time not yet announced' });
  const [day] = groupByDay([tbd, game, fair, talk]);
  assert.deepEqual(day!.events.map((e) => e.data.title), ['Talk', 'Football', 'Fair', 'Parade']);
  assert.throws(() => listing('x', { title: 'X', start: '2026-10-30T10:00', timeTbd: true }), /allDay/);
});

// ---------------------------------------------------------------- helpers

function marks(r: { event: Fx; regular: boolean; repeat: boolean }): EventRowMarks {
  return { category: r.event.data.category, startDay: dayKey(r.event.data.start), lastDay: lastDay(r.event), regular: r.regular, repeat: r.repeat };
}

function weekday(day: string): string {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(`${day}T12:00:00Z`).getUTCDay()]!;
}

test('the filter windows are Denver days on a fixed clock', () => {
  assert.deepEqual(whenWindow('today', MONDAY), { from: '2026-10-26', to: '2026-10-26' });
  assert.deepEqual(whenWindow('week', MONDAY), { from: '2026-10-26', to: '2026-11-01' });
  assert.deepEqual(whenWindow('weekend', MONDAY), { from: '2026-10-30', to: '2026-11-01' });
  assert.equal(whenWindow('any', MONDAY), null);
  // Late on a Sunday evening in Denver it is already Monday in UTC.
  assert.deepEqual(whenWindow('today', at('2026-11-01T22:30')), { from: '2026-11-01', to: '2026-11-01' });
});
