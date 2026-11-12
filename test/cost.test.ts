/** One rule for "free" (src/lib/cost.ts), and the places that read it. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isFreeCost } from '../src/lib/cost.ts';
import { offerPrice } from '../src/lib/seo.ts';
import { eventIsFree } from '../src/lib/family-home.ts';

test('free is the organizer’s word, with nothing paid after it', () => {
  for (const cost of ['Free', 'free', 'Free; registration required', 'Free with library card', 'Free (extra guests $5)']) assert.equal(isFreeCost(cost), true, cost);
  for (const cost of ['Free; costume contest $5', 'Free for members, $10 for guests', 'Free; $3 post-run beer', 'Free to volunteer; the directory is a purchase', 'Free; $2 ticketing fee', '$5', 'Ticketed', 'Freedom Run, $20']) {
    assert.equal(isFreeCost(cost), false, cost);
  }
});

test('a missing cost is never free', () => {
  assert.equal(isFreeCost(undefined), false);
  assert.equal(isFreeCost(null), false);
  assert.equal(isFreeCost(''), false);
  assert.equal(isFreeCost('   '), false);
});

test('the structured price and the family page agree with it', () => {
  assert.deepEqual(offerPrice('Free; costume contest $5'), { lowPrice: '0', highPrice: '5', priceCurrency: 'USD' }, 'not a price of zero');
  assert.deepEqual(offerPrice('Free; registration required'), { price: '0', priceCurrency: 'USD' });
  assert.equal(eventIsFree('Free; costume contest $5'), false);
  assert.equal(eventIsFree(undefined), false);
});

test('no page keeps a free rule of its own', () => {
  for (const file of ['src/components/EventCard.astro', 'src/components/WeeklyRegulars.astro', 'src/lib/seo.ts', 'src/lib/family-home.ts', 'src/lib/programs.ts', 'src/routes/town/families.astro']) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /\^free\\b/, `${file} tests for "free" itself`);
    assert.match(text, /isFreeCost/, file);
  }
});
