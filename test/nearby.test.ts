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
import { findTown, LIVE_TOWNS, liveTowns, neighborsOf } from '../src/config/index.ts';
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
  changeFlag?: boolean;
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
      changeFlag: o.changeFlag,
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

test('meetings, weekly regulars, cancellations, flagged listings and other days are left out', () => {
  const all = [
    ev('a', 'Council', '2026-10-10T10:00', { category: 'civic' }),
    ev('a', 'Storytime', '2026-10-03T10:00', { repeat: 'weekly', until: '2026-12-26', category: 'family' }),
    ev('a', 'Trivia', '2026-10-09T19:00', { recurring: 'Every Friday' }),
    ev('a', 'Called off', '2026-10-10T12:00', { status: 'canceled' }),
    ev('a', 'Flagged', '2026-10-10T13:00', { changeFlag: true }),
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
  // on a live guide until the owner flips its neighbour. Severance and Fort
  // Lupton were folded into Windsor and Carbon Valley on 12 October 2026 and
  // name nobody; nobody names them. Carbon Valley and Fort Lupton were
  // retired on 2 November 2026, when Frederick took Carbon Valley's place
  // beside Erie and Longmont and Lafayette joined the Boulder County guides.
  // The restructure of 12 November 2026 folded nine guides into their pages
  // on the hub (Castle Rock, Estes Park, Fort Collins, Golden, Leadville,
  // Longmont, Loveland, Nederland and Timnath): each names nobody now, and
  // every guide that named one dropped it, so the lists below are what is
  // left of the owner's, in his order. Elizabeth's one neighbour was Castle
  // Rock, so it names nobody. Lafayette followed later the same day, out of
  // Erie's and Niwot's lists. Carbon Valley is the guide beside Erie again
  // since 12 November 2026, and Frederick, covered by it, names nobody.
  const NEIGHBORS: Record<string, string[]> = {
    niwot: ['lyons', 'erie'],
    lyons: ['niwot'],
    longmont: [],
    erie: ['carbon-valley', 'niwot'],
    lafayette: [],
    frederick: [],
    'carbon-valley': ['erie'],
    berthoud: ['johnstown'],
    loveland: [],
    johnstown: ['windsor', 'berthoud'],
    windsor: ['johnstown'],
    timnath: [],
    fortcollins: [],
    elizabeth: [],
    severance: [],
    'fort-lupton': [],
    'castle-rock': [],
    'estes-park': [],
    golden: [],
    evergreen: [],
    nederland: [],
    // The six mountain guides, live 10 October 2026, each pair both ways.
    // Georgetown and Black Hawk were sections of the Idaho Springs guide from
    // 20 October 2026 and name nobody. Grand Lake was retired on 30 October
    // 2026, and Clear Creek, Manitou Springs and Evergreen on 3 November;
    // Leadville, which never had a neighbour within an afternoon's drive,
    // was folded on 12 November.
    'black-hawk': [],
    'idaho-springs': [],
    georgetown: [],
    'grand-lake': [],
    'manitou-springs': [],
    leadville: [],
  };
  assert.deepEqual(Object.keys(NEIGHBORS).sort(), towns.map((t) => t.slug).sort(), 'every config is in the list');
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

test('Elizabeth has no live neighbours, so its block is never built; every other live guide has one', () => {
  // Leadville named nobody from the start: nothing in the network was an
  // afternoon's drive away. Elizabeth and Manitou Springs were alone too
  // until Castle Rock, on both their lists, went live on 31 October 2026.
  // Golden was alone for part of 3 November 2026, between its neighbours'
  // retirement and the owner naming Lafayette and Erie. Since 12 November
  // 2026 Leadville, Golden and Castle Rock are folded into their pages on
  // the hub, which leaves Elizabeth, whose one neighbour was Castle Rock,
  // the live guide with none.
  // Elizabeth is deployed and not one of the seven guides the pages list.
  const ALONE = ['elizabeth'];
  for (const slug of ALONE) {
    assert.ok(LIVE_TOWNS.includes(slug), `${slug} is live`);
    assert.deepEqual(neighborsOf(findTown(slug)!), [], slug);
  }
  for (const t of liveTowns()) assert.ok(neighborsOf(t).length > 0, t.slug);
  // A guide that is not live names nobody, and nobody names it.
  for (const t of towns.filter((t) => t.status !== 'live')) {
    assert.deepEqual([...t.neighbors], [], `${t.slug}: not live, names no neighbours`);
    for (const other of towns) assert.ok(!other.neighbors.includes(t.slug), `${other.slug} still lists ${t.slug}`);
  }
});
