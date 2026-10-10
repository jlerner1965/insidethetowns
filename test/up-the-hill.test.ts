/**
 * "Up the hill this weekend": which mountain guides feed the strip on a
 * Front Range guide's This Week page, and which of their listings it shows.
 *
 * Built against Monday, October 5, 2026, so the weekend is the 9th to 11th.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal } from '../src/lib/dates.ts';
import { upTheHillPicks } from '../src/lib/events.ts';
import { mountainTowns } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';

let n = 0;
function ev(town: string, title: string, start: string, o: { category?: string; featured?: boolean; repeat?: 'weekly'; until?: string } = {}) {
  return {
    slug: `e${n++}`,
    town: { slug: town },
    data: {
      title,
      start: parseLocal(start),
      end: undefined,
      allDay: false,
      venue: `${title} venue`,
      category: o.category ?? 'music',
      repeat: o.repeat,
      until: o.until ? parseLocal(o.until) : undefined,
      status: 'scheduled',
      featured: o.featured ?? false,
    },
  } as never as Parameters<typeof upTheHillPicks>[0][number];
}
const now = parseLocal('2026-10-05T12:00');
const titles = (list: { data: { title: string } }[]) => list.map((e) => e.data.title);

test('the strip reads every live mountain guide and nothing else, decided by variant alone', () => {
  const hills = mountainTowns();
  assert.deepEqual(hills.map((t) => t.slug), towns.filter((t) => t.status === 'live' && t.variant === 'mountain').map((t) => t.slug).sort((a, b) => a.localeCompare(b)));
  for (const t of hills) assert.equal(t.variant, 'mountain', t.slug);
  assert.ok(hills.length >= 4, 'four mountain guides were live on 7 October 2026');
  assert.ok(!hills.some((t) => t.slug === 'niwot'));
});

test('at most three picks, one per mountain town, this weekend only, no civic, no weekly regular', () => {
  const all = [
    ev('estes-park', 'Elk Fest', '2026-10-10T10:00', { featured: true }),
    ev('estes-park', 'Second Estes thing', '2026-10-11T10:00'),
    ev('nederland', 'Ned Show', '2026-10-09T19:00'),
    ev('golden', 'Golden Gig', '2026-10-10T20:00'),
    ev('evergreen', 'Lake Day', '2026-10-11T09:00'),
    ev('golden', 'Council', '2026-10-10T18:00', { category: 'civic' }),
    ev('nederland', 'Trivia', '2026-10-09T19:00', { repeat: 'weekly', until: '2026-12-31' }),
    ev('estes-park', 'Next weekend', '2026-10-17T10:00'),
  ];
  const picks = upTheHillPicks(all, ['estes-park', 'evergreen', 'golden', 'nederland'], { now });
  assert.equal(picks.length, 3);
  const perTown = new Map<string, number>();
  for (const p of picks) perTown.set(p.town.slug, (perTown.get(p.town.slug) ?? 0) + 1);
  for (const [town, count] of perTown) assert.equal(count, 1, town);
  assert.ok(!titles(picks).includes('Council'));
  assert.ok(!titles(picks).includes('Trivia'));
  assert.ok(!titles(picks).includes('Next weekend'));
  assert.ok(!titles(picks).includes('Second Estes thing'));
  // Soonest first, as the strip lists them.
  const starts = picks.map((p) => p.data.start.getTime());
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
});

test('with nothing on this weekend there are no picks, and the strip does not render', () => {
  assert.deepEqual(upTheHillPicks([ev('golden', 'Later', '2026-10-20T10:00')], ['golden'], { now }), []);
  assert.deepEqual(upTheHillPicks([], ['golden'], { now }), []);
});
