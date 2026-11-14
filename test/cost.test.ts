/** One rule for "free" (src/lib/cost.ts), and the places that read it. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isFreeCost, shortCost } from '../src/lib/cost.ts';
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

test('the home’s short cost: a short line as written, a long one its lowest ticket price', () => {
  assert.equal(shortCost('$10'), '$10');
  assert.equal(shortCost('$15 adults, $5 kids'), '$15 adults, $5 kids');
  assert.equal(shortCost(undefined), undefined);
  assert.equal(shortCost('  '), undefined);
  // The lines from the guides' event files, 14 November 2026.
  const cases: Array<[string, string]> = [
    ['$115–$125 adults, $80 youth 13–18, $70 children 12 and under, plus a $6 reservation fee per ticket; dinner included', 'From $70'],
    ['$125, plus a $6 reservation fee per ticket, dinner included', '$125'],
    ['$13.50–$50 by day and ticket type; 3 and under free', 'From $13.50'],
    ['$30, or two for $50 ($25 / two for $40 for Chamber members); 21+', 'From $30; 21+'],
    ['$40 through November 10, $45 November 11–24, $50 on November 25, plus a registration processing fee; chip-timed 4 mile $5 extra; kids 10 and under free with a registered guardian', 'From $40'],
    ['$45 advance, $50 day of, $5 designated driver; 21+', 'From $45; 21+'],
    ['$45; Eventbrite lists $28.52–$49.87 with fees', '$45'],
    ['$8 adults; $5 seniors and K–12 students; pre-K and under free', 'From $5'],
    ['5K $48.70 ($51.88 after November 29), 10K $59.30 ($66.72 after November 29), kids’ 1-mile fun run $16.90; ages 3–12 $22.20 (5K), $27.50 (10K); registration fees included', 'From $16.90'],
    ['Marathon $154, half $115, 10K $80, 5K $70 (ages 3 to 12 $25 and $20), fun run $20; registration closes October 4', 'From $20'],
    ['Timed tickets: general admission $43 Thursday, $50 Friday or Saturday, $48 Sunday; Quick Pass $63 Thursday; Platinum Pass $150', 'From $43'],
    ['Gala tickets $1,250 a table, $150 a seat, with dinner and dancing', 'From $150'],
    ['Pay what you wish, from $0; reserve a seat with the Cultural Caravan', 'Pay what you wish'],
    ['Residents only: you must be a resident of Severance; registration is limited', 'Residents only: you must be a resident of Severance'],
  ];
  for (const [cost, short] of cases) assert.equal(shortCost(cost), short, cost);
});

test('no page keeps a free rule of its own', () => {
  for (const file of ['src/components/EventCard.astro', 'src/components/WeeklyRegulars.astro', 'src/lib/seo.ts', 'src/lib/family-home.ts', 'src/lib/programs.ts', 'src/routes/town/families.astro']) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /\^free\\b/, `${file} tests for "free" itself`);
    assert.match(text, /isFreeCost/, file);
  }
});
