/**
 * The gate: what may publish, and when a listing drops off.
 *
 * Every window is pinned at its boundary, because a listing hidden a day
 * early is a business told it is not there, and one shown a day late is the
 * stale page the whole system exists to prevent.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { FRESHNESS, windowsFor } from '../src/config/freshness.ts';
import {
  accessFresh,
  ageDays,
  daysUntilStale,
  dueForRecheck,
  eventExclusion,
  hoursFresh,
  placeExclusion,
} from '../src/lib/freshness.ts';
import { eventSchema, isExcluded, lenient, placeSchema } from '../src/content/schemas.ts';
import { parseLocal } from '../src/lib/dates.ts';

const plainImage = () => z.string();
const now = parseLocal('2026-10-03T12:00');
const daysAgo = (n: number) => parseLocal(`2026-10-03`).getTime() - n * 86_400_000;
const verifiedDaysAgo = (n: number) => new Date(daysAgo(n));

const place = (extra: Record<string, unknown> = {}) => ({
  title: 'The Tavern',
  source: 'https://example.org/',
  verified: verifiedDaysAgo(1),
  status: 'open',
  ...extra,
});

test('the windows are the brief\'s, and the mountain ones are shorter everywhere', () => {
  assert.equal(FRESHNESS.recheckDays, 30);
  assert.deepEqual(windowsFor('front-range'), { listingDays: 90, hoursDays: 60, accessDays: 30, recheckDays: 30 });
  assert.deepEqual(windowsFor('mountain'), { listingDays: 30, hoursDays: 30, accessDays: 30, recheckDays: 30 });
  assert.ok(windowsFor('mountain').listingDays < windowsFor('front-range').listingDays);
  assert.ok(windowsFor('mountain').hoursDays <= windowsFor('front-range').hoursDays);
});

test('no source or no check date holds an entry back, with a reason that names the gap', () => {
  assert.equal(placeExclusion(place(), 'front-range', now), null);
  assert.equal(placeExclusion(place({ source: undefined }), 'front-range', now)?.reason, 'no-source');
  assert.equal(placeExclusion(place({ verified: undefined }), 'front-range', now)?.reason, 'no-verified');
  assert.equal(eventExclusion({ title: 'x', source: 'https://a.org/', verified: verifiedDaysAgo(300) }), null);
  assert.equal(eventExclusion({ title: 'x', verified: verifiedDaysAgo(1) })?.reason, 'no-source');
  assert.match(eventExclusion({ title: 'x', source: 'https://a.org/' })?.detail ?? '', /verified/);
});

test('a Front Range listing is shown through day 90 and hidden on day 91', () => {
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(90) }), 'front-range', now), null);
  const hidden = placeExclusion(place({ verified: verifiedDaysAgo(91) }), 'front-range', now);
  assert.equal(hidden?.reason, 'stale');
  assert.match(hidden?.detail ?? '', /91 days ago/);
  assert.match(hidden?.detail ?? '', /shown for 90/);
});

test('a mountain listing is hidden on day 31', () => {
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(30) }), 'mountain', now), null);
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(31) }), 'mountain', now)?.reason, 'stale');
});

test('a closed listing does not go stale: its claim is that the place is shut', () => {
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(400), status: 'closed' }), 'front-range', now), null);
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(400), status: 'temporarily-closed' }), 'mountain', now), null);
  // But it still has to say where the closing was read.
  assert.equal(placeExclusion(place({ status: 'closed', source: undefined }), 'front-range', now)?.reason, 'no-source');
  assert.equal(daysUntilStale(place({ status: 'closed' }), 'front-range', now), null);
});

test('hours are hidden before the listing is', () => {
  assert.equal(hoursFresh(place({ verified: verifiedDaysAgo(60) }), 'front-range', now), true);
  assert.equal(hoursFresh(place({ verified: verifiedDaysAgo(61) }), 'front-range', now), false);
  assert.equal(placeExclusion(place({ verified: verifiedDaysAgo(61) }), 'front-range', now), null);
  assert.equal(hoursFresh(place({ verified: verifiedDaysAgo(31) }), 'mountain', now), false);
  assert.equal(hoursFresh(place({ verified: undefined }), 'front-range', now), false);
});

test('access notes have the shortest window and their own date', () => {
  assert.equal(accessFresh({ verified: verifiedDaysAgo(30) }, now), true);
  assert.equal(accessFresh({ verified: verifiedDaysAgo(31) }, now), false);
  assert.equal(accessFresh(undefined, now), false);
});

test('the report\'s arithmetic: days until stale, and due for the rotation', () => {
  assert.equal(daysUntilStale(place({ verified: verifiedDaysAgo(76) }), 'front-range', now), 14);
  assert.equal(daysUntilStale(place({ verified: verifiedDaysAgo(95) }), 'front-range', now), -5);
  assert.equal(dueForRecheck(place({ verified: verifiedDaysAgo(30) }), now), false);
  assert.equal(dueForRecheck(place({ verified: verifiedDaysAgo(31) }), now), true);
  assert.equal(dueForRecheck({ verified: undefined }, now), true);
  // Whole Denver days, so a check this morning is 0 days old all day.
  assert.equal(ageDays(parseLocal('2026-10-03T08:00'), parseLocal('2026-10-03T23:00')), 0);
  assert.equal(ageDays(parseLocal('2026-10-02T23:59'), parseLocal('2026-10-03T00:01')), 1);
});

test('a lenient schema turns an invalid entry into a marker and leaves a valid one alone', () => {
  const schema = lenient(eventSchema(plainImage));
  const bad = schema.parse({ title: 'Broken', start: 'not a date', venue: '', category: 'music' });
  assert.ok(isExcluded(bad));
  assert.equal(bad.title, 'Broken');
  assert.ok(bad.issues.some((i) => i.startsWith('start:')), bad.issues.join('; '));
  assert.ok(bad.issues.some((i) => i.startsWith('venue:')), bad.issues.join('; '));
  const good = schema.parse({ title: 'Fine', start: '2026-10-10T19:00', venue: 'Hall', category: 'music' });
  assert.equal(isExcluded(good), false);
  assert.equal((good as { title: string }).title, 'Fine');
  // And the gate treats the marker as an exclusion with the issues as its reason.
  assert.equal(eventExclusion(bad)?.reason, 'invalid');
  assert.match(eventExclusion(bad)?.detail ?? '', /start:/);
  assert.equal(isExcluded({ title: 'x', excluded: 'yes' }), false);
});

test('the staging block and the new provenance fields parse, and changeFlag needs its note', () => {
  const schema = placeSchema(plainImage);
  const staged = schema.parse({
    title: 'Waiting',
    type: 'coffee',
    address: '1 Main',
    summary: 'A café.',
    review: { reason: 'No site of its own', since: '2026-10-03', from: 'migration' },
  });
  assert.equal(staged.review?.reason, 'No site of its own');
  assert.equal(staged.review?.since.getTime(), parseLocal('2026-10-03').getTime());
  assert.throws(() => schema.parse({ title: 'x', type: 'coffee', address: '1', summary: 's', review: { since: '2026-10-03' } }));
  const stamped = schema.parse({
    title: 'Checked',
    type: 'coffee',
    address: '1 Main',
    summary: 'A café.',
    source: 'https://cafe.example/',
    verified: '2026-10-03',
    verifiedBy: 'James',
    sourceId: 'cafe-site',
    sourceUid: 'abc',
    sourceHash: 'deadbeef',
    changeFlag: true,
    changeNote: 'Closes at 5 now, not 6 (its site, 3 October).',
  });
  assert.equal(stamped.verifiedBy, 'James');
  assert.equal(stamped.changeFlag, true);
  assert.throws(
    () => schema.parse({ title: 'x', type: 'coffee', address: '1', summary: 's', changeFlag: true }),
    /changeNote/,
  );
  assert.equal(schema.parse({ title: 'x', type: 'coffee', address: '1', summary: 's' }).changeFlag, false);
});

test('mountain fields: seasonal hours on any place, access notes only on a trail or a park', () => {
  const schema = placeSchema(plainImage);
  const access = {
    parking: 'About 30 cars; full by 8 am at weekends',
    conditionsUrl: 'https://www.nps.gov/romo/planyourvisit/conditions.htm',
    conditionsLabel: 'Park conditions',
    source: 'https://www.nps.gov/romo/',
    verified: '2026-10-03',
  };
  const trail = schema.parse({ title: 'Lily Lake', type: 'trail', address: 'CO 7', summary: 's', access });
  assert.equal(trail.access?.parking, access.parking);
  assert.throws(() => schema.parse({ title: 'Café', type: 'coffee', address: '1', summary: 's', access }), /trail or a park/);
  assert.throws(() => schema.parse({ title: 'Lily Lake', type: 'trail', address: 'CO 7', summary: 's', access: { parking: 'x' } }));
  const seasonal = schema.parse({
    title: 'The Lodge',
    type: 'lodging',
    address: '1',
    summary: 's',
    seasonal: { season: 'Memorial Day to mid-October', hours: 'Daily 8–8', closedMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'] },
  });
  assert.equal(seasonal.seasonal?.closedMonths.length, 6);
});
