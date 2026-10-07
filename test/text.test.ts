import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shorten } from '../src/lib/text.ts';

test('shorten: leaves short text alone', () => {
  assert.equal(shorten('Ball fields and a dog park.', 80), 'Ball fields and a dog park.');
});

test('shorten: cuts at a phrase when one is in reach, else at a word', () => {
  const text = 'An independent guide to Elizabeth, Colorado: Main Street, the Stampede, the Palmer Divide, and more.';
  assert.equal(shorten(text, 64), 'An independent guide to Elizabeth, Colorado: Main Street…');
  assert.equal(shorten('Twelve miles on the bed of the railway that carried coal', 30), 'Twelve miles on the bed of the…');
});

test('shorten: never ends inside a word', () => {
  const text = 'The rec center pools and their rules, Kid Zone, the gymnastics foam pit and the splash pads';
  const out = shorten(text, 50);
  assert.ok(text.startsWith(out.slice(0, -1)));
  assert.match(text.slice(out.length - 1), /^[\s,;:.]/);
});
