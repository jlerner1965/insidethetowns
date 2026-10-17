/**
 * How sure the guide is of an event (src/lib/confidence.ts): what counts as
 * confirmed, what is only listed, how far ahead each shows, and when an
 * event has nothing current behind it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRESHNESS } from '../src/config/freshness.ts';
import { eventConfidence, eventPresentation, isTentative, type ConfidenceInput } from '../src/lib/confidence.ts';
import { addDays, dayKey, parseLocal, startOfDay } from '../src/lib/dates.ts';
import { eventExclusion } from '../src/lib/freshness.ts';
import { confirmText } from '../scripts/lib/confirm.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const NOW = parseLocal('2026-10-17T09:00');
const daysFromNow = (n: number, time = '18:00') => parseLocal(`${dayKey(addDays(startOfDay(NOW), n))}T${time}`);
const day = (n: number) => startOfDay(addDays(startOfDay(NOW), n));
const RECORDER = 'https://lyonsrecorder.org/event/old-time-jam/2026-10-28/';
const event = (over: Partial<ConfidenceInput> = {}): ConfidenceInput => ({
  start: daysFromNow(10),
  venue: 'Oskar Blues Grill & Brew',
  source: 'https://mainstagebrewing.com/music',
  verified: day(-1),
  ...over,
});
const W = FRESHNESS.events;

test("an event read on the organizer's own page recently is confirmed, and says nothing more than the check date", () => {
  const c = eventConfidence(event(), NOW);
  assert.equal(c.level, 'confirmed');
  assert.equal(c.basis, 'source');
  assert.equal(c.by, 'mainstagebrewing.com');
  assert.equal(c.line, undefined);
});

test('a community calendar alone makes an event listed, with a soft line naming the calendar and the venue', () => {
  const c = eventConfidence(event({ source: RECORDER }), NOW);
  assert.equal(c.level, 'listed');
  assert.equal(c.basis, 'calendar');
  assert.equal(c.short, 'From a community calendar');
  assert.match(c.line!, /^From the Lyons Recorder's community calendar, seen there October 16, 2026\. Worth a quick check with Oskar Blues Grill & Brew before you go\.$/);
  assert.ok(isTentative({ confidence: c }));
});

test('a call to the organizer confirms an event, whatever its source, and says so', () => {
  const c = eventConfidence(event({ source: RECORDER, confirmed: { how: 'phone', with: 'Oskar Blues', on: day(0) } }), NOW);
  assert.equal(c.level, 'confirmed');
  assert.equal(c.basis, 'phone');
  assert.equal(c.line, 'Confirmed by phone with Oskar Blues on October 17, 2026.');
  assert.equal(c.short, 'Confirmed by phone, Oct 17, 2026');
});

test('the freshest word from the organizer decides', () => {
  const c = eventConfidence(event({ verified: day(-2), confirmed: { how: 'email', with: 'the library', on: day(-90) } }), NOW);
  assert.equal(c.basis, 'source');
  const d = eventConfidence(event({ verified: day(-90), confirmed: { how: 'email', with: 'the library', on: day(-2) } }), NOW);
  assert.equal(d.basis, 'email');
});

test('a confirmation goes stale after its window and the event drops to listed, saying when it was last checked', () => {
  assert.equal(eventConfidence(event({ verified: day(-W.confirmedDays) }), NOW).level, 'confirmed');
  const stale = eventConfidence(event({ verified: day(-W.confirmedDays - 1) }), NOW);
  assert.equal(stale.level, 'listed');
  assert.equal(stale.basis, 'stale');
  assert.match(stale.line!, /^Last checked with the organizer on/);
});

test('a confirmed one-off shows however far ahead it is', () => {
  assert.deepEqual(eventPresentation(event({ start: daysFromNow(200) }), NOW).hidden, undefined);
});

test(`a listed one-off shows ${W.listedAheadDays} days ahead and waits before that`, () => {
  assert.equal(eventPresentation(event({ source: RECORDER, start: daysFromNow(W.listedAheadDays) }), NOW).hidden, undefined);
  const far = eventPresentation(event({ source: RECORDER, start: daysFromNow(W.listedAheadDays + 1) }), NOW);
  assert.match(far.hidden!, /listed on the Lyons Recorder's community calendar alone; shown from 2026-10-18/);
});

test(`a community-calendar listing not seen there in ${W.calendarDays} days leaves the site`, () => {
  assert.equal(eventPresentation(event({ source: RECORDER, verified: day(-W.calendarDays) }), NOW).hidden, undefined);
  assert.match(eventPresentation(event({ source: RECORDER, verified: day(-W.calendarDays - 1) }), NOW).hidden!, /last seen there/);
});

test(`a weekly series shows ${W.seriesDays} days past its last confirmation, and says "Every Thursday" rather than the cut`, () => {
  const series = event({ start: parseLocal('2026-09-24T18:00'), repeat: 'weekly', until: parseLocal('2026-12-31'), verified: day(-1) });
  const p = eventPresentation(series, NOW);
  assert.equal(p.confidence.level, 'confirmed');
  // Confirmed 16 October: dates through 11 December, the last Thursday in that window.
  assert.equal(dayKey(p.until!), '2026-12-10');
  assert.equal(p.recurring, 'Every Thursday');
  // The organizer's own end inside the window is left alone.
  assert.equal(eventPresentation({ ...series, until: parseLocal('2026-11-19') }, NOW).until, undefined);
});

test('a listed weekly series shows only its next few weeks', () => {
  const p = eventPresentation(event({ source: RECORDER, start: parseLocal('2026-09-24T18:00'), repeat: 'weekly', until: parseLocal('2026-12-31') }), NOW);
  assert.equal(dayKey(p.until!), '2026-11-05');
});

test('a series whose confirmed weeks have all passed leaves the site', () => {
  const p = eventPresentation(
    event({ start: parseLocal('2026-06-04T18:00'), repeat: 'weekly', until: parseLocal('2026-12-31'), verified: parseLocal('2026-07-01') }),
    NOW,
  );
  assert.match(p.hidden!, /its dates run 56 days past a confirmation, to 2026-08-26, and those have passed/);
});

test('the gate: a phone confirmation stands in for a source; a listed event far ahead is held, not invalid', () => {
  assert.equal(eventExclusion({ title: 'x', start: daysFromNow(5), venue: 'v', confirmed: { how: 'phone', with: 'v', on: day(0) } }, NOW), null);
  assert.equal(eventExclusion({ title: 'x', start: daysFromNow(5), venue: 'v' }, NOW)?.reason, 'no-source');
  assert.equal(eventExclusion({ title: 'x', start: daysFromNow(40), venue: 'v', source: RECORDER, verified: day(-1) }, NOW)?.reason, 'unconfirmed');
});

test('npm run confirm writes the block, clears a flag and a staged review, and leaves the check date alone', () => {
  const before = [
    '---',
    'title: "Old-time jam at Oskar Blues"',
    'review: { reason: "Oskar Blues\' page refuses automated requests.", since: "2026-10-17", from: manual }',
    'changeFlag: true',
    'changeNote: "recheck 2026-10-17: the page does not show 28 October"',
    'start: "2026-10-28T18:00"',
    'venue: "Oskar Blues Grill & Brew"',
    'category: music',
    `source: "${RECORDER}"`,
    'verified: "2026-09-18"',
    '---',
    '',
    'Come play tunes.',
    '',
  ].join('\n');
  const after = confirmText(before, { how: 'phone', with: 'Oskar Blues', on: '2026-10-17', note: 'Second and fourth Wednesdays, 6 pm' });
  const { data } = parseFrontmatter(after);
  assert.deepEqual(data.confirmed, { how: 'phone', with: 'Oskar Blues', on: '2026-10-17', note: 'Second and fourth Wednesdays, 6 pm' });
  assert.equal(data.review, undefined);
  assert.equal(data.changeFlag, undefined);
  assert.equal(data.verified, '2026-09-18');
  assert.match(after, /\n---\n\nCome play tunes\.\n$/);
});
