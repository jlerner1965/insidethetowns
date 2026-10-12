/**
 * The phone's one-line filter rows (src/lib/scroll-rows.ts): which edge
 * fades, and where a row scrolls to keep the chosen button in view.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edges, reveal } from '../src/lib/scroll-rows.ts';

test('a row at rest with more to the right fades only on the right', () => {
  assert.deepEqual(edges(0, 298, 472), { before: false, after: true });
});

test('a row swiped part way fades on both sides; at its end, only on the left', () => {
  assert.deepEqual(edges(150, 298, 472), { before: true, after: true });
  assert.deepEqual(edges(174, 298, 472), { before: true, after: false });
  // A fraction of a pixel short of the end is the end.
  assert.deepEqual(edges(173.5, 298, 472), { before: true, after: false });
});

test('a row that fits fades nowhere', () => {
  assert.deepEqual(edges(0, 600, 472), { before: false, after: false });
});

test('the first button hidden by a swipe takes the row back to its start', () => {
  // The "When" row swiped 150px, "Anytime" at 6px: the case on the phone.
  assert.equal(reveal({ scrollLeft: 150, clientWidth: 298, scrollWidth: 472 }, { left: 6, width: 90 }, 32), 0);
});

test('a button off to the right is brought in, clear of the fade', () => {
  // "Sports", far along the "What" row, chosen from a shared link.
  const to = reveal({ scrollLeft: 0, clientWidth: 298, scrollWidth: 1003 }, { left: 800, width: 80 }, 32);
  assert.equal(to, 800 + 80 + 32 - 298);
  // Never past the end of the row.
  assert.equal(reveal({ scrollLeft: 0, clientWidth: 298, scrollWidth: 1003 }, { left: 920, width: 80 }, 32), 1003 - 298);
});

test('a button already in view leaves the row where it is', () => {
  assert.equal(reveal({ scrollLeft: 0, clientWidth: 298, scrollWidth: 1003 }, { left: 100, width: 80 }, 32), null);
});
