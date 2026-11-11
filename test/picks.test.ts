/**
 * Picks guides (src/lib/picks.ts): the picks in the guide's order, a pick
 * whose place has gone left out, and the page's list with the picks first.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { picksFirst, picksFor } from '../src/lib/picks.ts';

const place = (slug: string) => ({ slug, data: { title: slug } });

test('picks keep the guide order, drop a place no longer listed, and show a place once', () => {
  const places = [place('a'), place('b'), place('c')];
  const shown = picksFor([{ place: 'c', why: 'C.' }, { place: 'gone', why: 'Closed since.' }, { place: 'a', why: 'A.' }, { place: 'c', why: 'Again.' }], places);
  assert.deepEqual(shown.map((s) => s.place.slug), ['c', 'a']);
  assert.equal(shown[0]!.pick.why, 'C.');
});

test('the CollectionPage list leads with the picks, in order, then the rest as they were', () => {
  const listing = ['/places/a/', '/places/b/', '/places/c/', '/places/d/'].map((path) => ({ name: path, path }));
  assert.deepEqual(picksFirst(listing, ['/places/c/', '/places/a/']).map((l) => l.path), ['/places/c/', '/places/a/', '/places/b/', '/places/d/']);
});
