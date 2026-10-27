/**
 * Page titles (src/lib/titles.ts): the guide's name rides on a title only
 * where the whole thing fits in TITLE_LIMIT, and an event's date in the
 * title tag is short.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, pageTitle, titleDate, TITLE_LIMIT } from '../src/lib/titles.ts';
import { parseLocal } from '../src/lib/dates.ts';

const site = { siteTitle: 'Inside Berthoud', tagline: 'The Garden Spot.' };

test('a short title keeps the guide’s name; a long one stands alone', () => {
  assert.equal(pageTitle(site, 'Events'), 'Events | Inside Berthoud');
  assert.equal(fitTitle('Blind Date with a Book at City Star — Oct 25', 'Inside Berthoud'), 'Blind Date with a Book at City Star — Oct 25 | Inside Berthoud');
  const long = 'Berthoud Historical Society Fall Speaker Series — Nov 17';
  assert.equal(fitTitle(long, 'Inside Berthoud'), long, 'with the suffix it would run to 74');
  assert.ok(`${long} | Inside Berthoud`.length > TITLE_LIMIT);
});

test('the home title is unchanged when there is no page title', () => {
  assert.match(pageTitle(site), /^Inside Berthoud — /);
});

test('an event’s title date is the month and day, with the year only when it is another year', () => {
  const now = parseLocal('2026-10-27T09:00');
  assert.equal(titleDate(parseLocal('2026-11-17T18:00'), now), 'Nov 17');
  assert.equal(titleDate(parseLocal('2027-01-03T18:00'), now), 'Jan 3, 2027');
});
