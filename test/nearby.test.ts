/**
 * "Nearby this weekend": which of the neighbours' listings a town's block
 * shows, and which towns are its neighbours.
 *
 * Built against Monday, October 5, 2026, so the weekend is the 9th to 11th.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { nearbyPicks } from '../src/lib/events.ts';
import { findTown, liveTowns, neighborsOf } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';

let n = 0;
interface Opts {
  end?: string;
  allDay?: boolean;
  category?: string;
  repeat?: 'weekly';
  until?: string;
  recurring?: string;
  status?: string;
  featured?: boolean;
  venue?: string;
}
/** A neighbour's listing as getNeighborEntries hands it over. */
function ev(town: string, title: string, start: string, o: Opts = {}) {
  return {
    slug: `e${n++}`,
    town: { slug: town },
    data: {
      title,
      start: parseLocal(start),
      end: o.end ? parseLocal(o.end) : undefined,
      allDay: o.allDay ?? false,
      venue: o.venue ?? `${title} venue`,
      category: o.category ?? 'music',
      repeat: o.repeat,
      until: o.until ? parseLocal(o.until) : undefined,
      recurring: o.recurring,
      status: o.status ?? 'scheduled',
      featured: o.featured ?? false,
    },
  } as never as Parameters<typeof nearbyPicks>[0][number];
}
const now = parseLocal('2026-10-05T12:00');
const titles = (list: { data: { title: string } }[]) => list.map((e) => e.data.title);

test('at most two from any one neighbour, and six in all', () => {
  const all = [
    ...['A1', 'A2', 'A3', 'A4'].map((t, i) => ev('a', t, `2026-10-10T1${i}:00`, { category: 'festival' })),
    ...['B1', 'B2', 'B3'].map((t, i) => ev('b', t, `2026-10-10T1${i}:00`, { category: 'market' })),
    ...['C1', 'C2', 'C3'].map((t, i) => ev('c', t, `2026-10-11T1${i}:00`)),
    ev('d', 'D1', '2026-10-09T19:00'),
  ];
  const picks = nearbyPicks(all, ['a', 'b', 'c', 'd'], { now });
  assert.equal(picks.length, 6);
  for (const town of ['a', 'b', 'c', 'd']) assert.ok(picks.filter((p) => p.town.slug === town).length <= 2, town);
  // Every neighbour with something on gets one before any gets a second.
  assert.deepEqual([...new Set(picks.map((p) => p.town.slug))].sort(), ['a', 'b', 'c', 'd']);
});

test('the plan-your-day listings win the second places', () => {
  const all = [
    ev('a', 'Festival', '2026-10-10T10:00', { category: 'festival' }),
    ev('a', 'Craft hour', '2026-10-10T09:00', { category: 'family' }),
    ev('a', 'Concert', '2026-10-11T19:00', { category: 'music' }),
  ];
  assert.deepEqual(titles(nearbyPicks(all, ['a'], { now })), ['Festival', 'Concert']);
});

test('meetings, weekly regulars, cancellations and other days are left out', () => {
  const all = [
    ev('a', 'Council', '2026-10-10T10:00', { category: 'civic' }),
    ev('a', 'Storytime', '2026-10-03T10:00', { repeat: 'weekly', until: '2026-12-26', category: 'family' }),
    ev('a', 'Trivia', '2026-10-09T19:00', { recurring: 'Every Friday' }),
    ev('a', 'Called off', '2026-10-10T12:00', { status: 'canceled' }),
    ev('a', 'Tuesday gig', '2026-10-06T19:00'),
    ev('a', 'Next Saturday', '2026-10-17T19:00'),
    ev('a', 'Last weekend', '2026-10-03T19:00'),
    ev('a', 'Saturday gig', '2026-10-10T19:00'),
  ];
  assert.deepEqual(titles(nearbyPicks(all, ['a'], { now })), ['Saturday gig']);
});

test('a run on through Friday counts; a series of a few dates is shown once', () => {
  const all = [
    ev('a', 'Corn maze', '2026-09-23', { end: '2026-10-31', allDay: true, category: 'family' }),
    ev('a', 'Ended Thursday', '2026-09-23', { end: '2026-10-08', allDay: true }),
    ev('b', 'Opera', '2026-10-09T19:00', { venue: 'Rialto' }),
    ev('b', 'Opera', '2026-10-10T14:00', { venue: 'Rialto' }),
    ev('b', 'Opera', '2026-10-11T14:00', { venue: 'Rialto' }),
  ];
  const picks = nearbyPicks(all, ['a', 'b'], { now });
  assert.deepEqual(titles(picks), ['Corn maze', 'Opera'], 'the opera once, at its next date');
  assert.equal(picks[1]!.data.start.getTime(), parseLocal('2026-10-09T19:00').getTime());
});

test('nothing qualifying means nothing at all', () => {
  assert.deepEqual(nearbyPicks([ev('a', 'Council', '2026-10-10T10:00', { category: 'civic' })], ['a'], { now }), []);
  assert.deepEqual(nearbyPicks([], [], { now }), []);
});

test('each guide names the neighbours the owner set, in that order', () => {
  // The owner's lists, 5 October 2026, with the seven towns scaffolded on
  // 6 October appended to the guides they name, so each pair goes both ways.
  // A town that is not live is filtered out by neighborsOf, so nothing shows
  // on a live guide until the owner flips its neighbour.
  const NEIGHBORS: Record<string, string[]> = {
    niwot: ['longmont', 'lyons', 'erie', 'nederland'],
    lyons: ['longmont', 'niwot', 'estes-park', 'nederland'],
    longmont: ['niwot', 'lyons', 'erie', 'carbon-valley', 'berthoud', 'fort-lupton'],
    erie: ['longmont', 'carbon-valley', 'niwot'],
    'carbon-valley': ['erie', 'longmont', 'fort-lupton'],
    berthoud: ['loveland', 'longmont', 'johnstown'],
    loveland: ['berthoud', 'johnstown', 'fortcollins', 'estes-park'],
    johnstown: ['loveland', 'windsor', 'berthoud'],
    windsor: ['timnath', 'johnstown', 'fortcollins', 'severance'],
    timnath: ['fortcollins', 'windsor', 'severance'],
    fortcollins: ['timnath', 'windsor', 'loveland', 'severance'],
    elizabeth: ['castle-rock'],
    severance: ['windsor', 'timnath', 'fortcollins'],
    'fort-lupton': ['carbon-valley', 'longmont'],
    'castle-rock': ['elizabeth'],
    'estes-park': ['lyons', 'loveland'],
    golden: ['evergreen'],
    evergreen: ['golden'],
    nederland: ['lyons', 'niwot'],
  };
  for (const t of towns) assert.deepEqual([...t.neighbors], NEIGHBORS[t.slug], t.slug);
});

test('neighbours are real guides, never the town itself, and go both ways', () => {
  for (const t of towns) {
    for (const slug of t.neighbors) {
      assert.ok(findTown(slug), `${t.slug}: no town called "${slug}"`);
      assert.notEqual(slug, t.slug, `${t.slug} lists itself`);
      assert.ok(findTown(slug)!.neighbors.includes(t.slug), `${t.slug} lists ${slug}, which does not list it back`);
    }
  }
});

test('Elizabeth has no live neighbours, so its block is never built', () => {
  // Castle Rock is on its list from 6 October 2026 but not live; neighborsOf
  // leaves it out until it is.
  assert.deepEqual(neighborsOf(findTown('elizabeth')!), []);
  for (const t of liveTowns().filter((t) => t.slug !== 'elizabeth')) assert.ok(neighborsOf(t).length > 0, t.slug);
});
