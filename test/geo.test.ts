/**
 * Which towns count as nearby, against the real configs.
 *
 * The "nearby this weekend" block sends a reader to another town's guide, so
 * "nearby" has to mean a drive someone would make for an evening — and has to
 * mean nothing at all for the one town that is an hour from everything.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findTown, liveTowns } from '../src/config/index.ts';
import { milesBetween, nearestTowns } from '../src/lib/geo.ts';

const town = (slug: string) => findTown(slug)!;

test('Niwot to Erie is about seven miles', () => {
  const miles = milesBetween(town('niwot'), town('erie'));
  assert.ok(miles > 5 && miles < 9, `${miles} miles`);
});

test('a town is never its own neighbor and the nearest comes first', () => {
  const near = nearestTowns(town('berthoud'), liveTowns());
  assert.equal(near[0]!.town.slug, 'johnstown');
  assert.ok(near.every((n) => n.town.slug !== 'berthoud'));
  assert.ok(near.every((n) => n.miles <= 25));
  assert.ok(near.length <= 3);
});

test('Timnath reaches only Johnstown and Berthoud within twenty-five miles', () => {
  assert.deepEqual(
    nearestTowns(town('timnath'), liveTowns()).map((n) => n.town.slug),
    ['johnstown', 'berthoud'],
  );
});

test('Elizabeth has no neighbor, so the block built on this shows nothing there', () => {
  assert.deepEqual(nearestTowns(town('elizabeth'), liveTowns()), []);
});

test('every other live town has at least one neighbor', () => {
  for (const t of liveTowns().filter((t) => t.slug !== 'elizabeth')) {
    assert.ok(nearestTowns(t, liveTowns()).length >= 1, t.slug);
  }
});
