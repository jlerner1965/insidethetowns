/**
 * Which towns count as nearby, against the real configs.
 *
 * The "nearby this weekend" block sends a reader to another town's guide, so
 * "nearby" has to mean a drive someone would make for an evening — and has to
 * mean nothing at all for the one town that is an hour from everything.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allTowns, findTown, liveTowns } from '../src/config/index.ts';
import { milesBetween, nearestTowns } from '../src/lib/geo.ts';

const town = (slug: string) => findTown(slug)!;

test('Niwot to Erie is about seven miles', () => {
  const miles = milesBetween(town('niwot'), town('erie'));
  assert.ok(miles > 5 && miles < 9, `${miles} miles`);
});

test('a town is never its own neighbor and the nearest comes first', () => {
  // Loveland, five and a half miles off, since it went live on 5 October.
  const near = nearestTowns(town('berthoud'), liveTowns());
  assert.equal(near[0]!.town.slug, 'loveland');
  assert.ok(near.every((n) => n.town.slug !== 'berthoud'));
  assert.ok(near.every((n) => n.miles <= 25));
  assert.ok(near.length <= 3);
});

test('Timnath has Windsor and Fort Collins at its door, then Loveland', () => {
  // Against every configured town rather than the live ones: the geometry is
  // true before a town launches, and this is what the block will show once
  // all three are live. 4.8, 5.4 and 11.4 miles; Johnstown, at 13.8, is
  // fourth since Loveland was configured.
  assert.deepEqual(
    nearestTowns(town('timnath'), allTowns).map((n) => n.town.slug),
    ['windsor', 'fortcollins', 'loveland'],
  );
});

test('the northern cluster: each of the three is the nearest guide to the others', () => {
  assert.deepEqual(
    nearestTowns(town('windsor'), allTowns).map((n) => n.town.slug),
    ['timnath', 'fortcollins', 'johnstown'],
  );
  assert.deepEqual(
    nearestTowns(town('fortcollins'), allTowns).map((n) => n.town.slug),
    ['timnath', 'windsor', 'loveland'],
  );
  // Berthoud's three are Loveland at five and a half miles, Johnstown and
  // Longmont at ten and a half.
  assert.deepEqual(
    nearestTowns(town('berthoud'), allTowns).map((n) => n.town.slug),
    ['loveland', 'johnstown', 'longmont'],
  );
});

test('Longmont sits between Niwot, Erie and Berthoud', () => {
  // 6.1, 7.9 and 10.5 miles. In the nearby blocks it comes first for Niwot
  // and second for Erie and Lyons.
  assert.deepEqual(
    nearestTowns(town('longmont'), allTowns).map((n) => n.town.slug),
    ['niwot', 'erie', 'berthoud'],
  );
});

test('Loveland sits between Berthoud, Johnstown and Windsor', () => {
  // 5.5, 9.2 and 10.3 miles; Fort Collins is 10.8. In the nearby blocks it
  // comes first for Berthoud, second for Johnstown and third for Fort Collins
  // and Timnath.
  assert.deepEqual(
    nearestTowns(town('loveland'), allTowns).map((n) => n.town.slug),
    ['berthoud', 'johnstown', 'windsor'],
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
