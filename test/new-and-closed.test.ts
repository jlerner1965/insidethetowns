/**
 * /new-and-closed/ (src/lib/new-and-closed.ts): the guide's own records of
 * openings and closings, kept for 90 days, and its additions, apart.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addedToGuide, townChanges } from '../src/lib/new-and-closed.ts';
import { hubRoutes } from '../src/integrations/town-routes.ts';
import { findTown } from '../src/config/index.ts';
import type { TownConfig } from '../src/config/towns/types.ts';

const d = (s: string) => new Date(`${s}T12:00:00-07:00`);
const now = d('2026-11-09');

test('an opening or a closing with a source is kept for 90 days; one without a source, or older, is not', () => {
  const notes = [
    { data: { changes: [
      { tag: 'opening' as const, name: 'New Cafe', detail: 'Opened on Public Road.', source: 'https://newcafe.example/', checked: d('2026-10-20') },
      { tag: 'closed' as const, name: 'Unsourced Shop', detail: 'Closed.', checked: d('2026-10-20') },
      { tag: 'closed' as const, name: 'Old Diner', detail: 'Closed in July.', source: 'https://x.example/', checked: d('2026-11-01'), effective: d('2026-07-01') },
      { tag: 'added-to-guide' as const, name: 'A Park', detail: 'Added.', checked: d('2026-11-01') },
    ] } },
  ];
  const rows = townChanges({ notes, updates: [], places: [] }, now);
  assert.deepEqual(rows.map((r) => r.name), ['New Cafe']);
  assert.equal(rows[0]!.label, 'Opening');
});

test('a place marked closed and a note about the same closing are one row, the place’s, linking its page', () => {
  const notes = [{ data: { changes: [{ tag: 'closed' as const, name: 'Corner Bakery', detail: 'Closed for good.', source: 'https://owner.example/', checked: d('2026-11-02') }] } }];
  const places = [{ slug: 'corner-bakery', data: { title: 'Corner Bakery', status: 'closed', closed: d('2026-11-02'), statusNote: 'The owner announced the closing.', statusSource: 'https://owner.example/' } }];
  const rows = townChanges({ notes, updates: [], places }, now);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.href, '/places/corner-bakery/');
  assert.equal(rows[0]!.label, 'Closed');
});

test('a local change is on the page only when it is an opening or a closure', () => {
  const updates = [
    { slug: 'library-reopens', data: { kind: 'opening', title: 'The library reopens', summary: 'Open again.', effective: d('2026-10-01'), source: 'https://city.example/' } },
    { slug: 'veterans-day', data: { kind: 'notice', title: 'Veterans Day closures', summary: 'Closed Nov 11.', effective: d('2026-11-11') } },
    { slug: 'trail', data: { kind: 'construction', title: 'Trail detour', summary: 'Detour.', effective: d('2026-09-08') } },
  ];
  const rows = townChanges({ notes: [], updates, places: [] }, now);
  assert.deepEqual(rows.map((r) => r.name), ['The library reopens']);
  assert.equal(rows[0]!.href, '/updates/#library-reopens');
});

test('New on the guide: open places added in the last 30 days, newest first, never a closed one or one the guide opened with', () => {
  const places = [
    { slug: 'launch', data: { title: 'Launch', added: d('2026-09-01') } },
    { slug: 'a', data: { title: 'A', added: d('2026-11-09') } },
    { slug: 'b', data: { title: 'B', added: d('2026-10-01') } },
    { slug: 'c', data: { title: 'C', added: d('2026-11-02') } },
    { slug: 'z', data: { title: 'Z', added: d('2026-11-03'), status: 'closed', closed: d('2026-11-05') } },
  ];
  assert.deepEqual(addedToGuide(places, now).map((p) => p.slug), ['a', 'c']);
  // A guide that opened inside the window: its first day's listings are not new to it.
  const opened = [{ slug: 'x', data: { title: 'X', added: d('2026-11-02') } }, { slug: 'y', data: { title: 'Y', added: d('2026-11-09') } }];
  assert.deepEqual(addedToGuide(opened, now).map((p) => p.slug), ['y']);
});

test('the page builds only where the config switches it on: Lafayette, from 9 November 2026', () => {
  const lafayette = findTown('lafayette') as TownConfig;
  assert.ok(hubRoutes(lafayette).some(([p, f]) => p === '/new-and-closed' && f === 'new-and-closed.astro'));
  const berthoud = findTown('berthoud') as TownConfig;
  assert.ok(!hubRoutes(berthoud).some(([p]) => p === '/new-and-closed'));
});
