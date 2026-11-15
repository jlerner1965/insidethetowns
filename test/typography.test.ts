/**
 * Two small formatters for words the data files wrote their own way (the
 * review of 14 November 2026): typographic quotes and apostrophes
 * (src/lib/text.ts, typeset), and an organizer's time in the style the
 * site prints its own (src/lib/dates.ts, publishedTime). Neither changes a
 * letter, a figure or a time; each only sets what is there.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTimeRange, parseLocal, publishedTime } from '../src/lib/dates.ts';
import { typeset } from '../src/lib/text.ts';

test('straight apostrophes and quotes become typographic ones', () => {
  const cases: Array<[string, string]> = [
    ["Santa's Lighted Forest", 'Santa’s Lighted Forest'],
    ["America's Mountain", 'America’s Mountain'],
    ["Mary's Lake", 'Mary’s Lake'],
    ["Leadville's Tabors: a silver fortune, a scandal and the crash", 'Leadville’s Tabors: a silver fortune, a scandal and the crash'],
    ["Presidents' Day", 'Presidents’ Day'],
    ['Alamosa means "cottonwood" in Spanish.', 'Alamosa means “cottonwood” in Spanish.'],
    ['"Pagosah" is a Southern Ute word for "healing waters", for the hot springs.', '“Pagosah” is a Southern Ute word for “healing waters”, for the hot springs.'],
    ['declared, "in this camp we\'ll have fair play."', 'declared, “in this camp we’ll have fair play.”'],
    ["Loaf 'n Jug", 'Loaf ’n Jug'],
    ["Beef 'N Bean Day", 'Beef ’N Bean Day'],
    ["the '27 festival", 'the ’27 festival'],
    ["a 'quoted' word", 'a ‘quoted’ word'],
  ];
  for (const [from, to] of cases) assert.equal(typeset(from), to);
  // Words already set, or with nothing to set, are returned as they are.
  assert.equal(typeset('Winter Park’s “Torchlight”'), 'Winter Park’s “Torchlight”');
  assert.equal(typeset(undefined), undefined);
});

test('inside a quotation the page sets, a quotation is set in single quotes', () => {
  assert.equal(typeset('Mary Jane closes "As Late As Possible"', { inner: true }), 'Mary Jane closes ‘As Late As Possible’');
  assert.equal(typeset("Mary Jane's", { inner: true }), 'Mary Jane’s');
});

test('times as the source wrote them, in the style the site prints', () => {
  const cases: Array<[string, string]> = [
    ['7:30AM', '7:30 am'],
    ['5PM', '5 pm'],
    ['7:00 PM', '7 pm'],
    ['10 AM', '10 am'],
    ['10:00 a.m.', '10 am'],
    ['11:00 AM - 3:00 PM', '11 am – 3 pm'],
    ['3PM-6PM, Tree Lighting at 5PM', '3 pm – 6 pm, Tree Lighting at 5 pm'],
    ['Community Christmas Tree Lighting at 6:00 PM Friday', 'Community Christmas Tree Lighting at 6 pm Friday'],
    ['around 5:00pm', 'around 5 pm'],
    ['3:30-5:30pm', '3:30 – 5:30 pm'],
    ['Doors 8 p.m., show 9 p.m.', 'Doors 8 pm, show 9 pm'],
  ];
  for (const [from, to] of cases) assert.equal(publishedTime(from), to);
  // The site's own formatter gives the same words for the same times.
  assert.equal(publishedTime('11:00 AM - 3:00 PM'), formatTimeRange(parseLocal('2026-12-12T11:00'), parseLocal('2026-12-12T15:00')));
  assert.equal(publishedTime('7:30AM'), formatTimeRange(parseLocal('2026-11-26T07:30')));
});

test('a time is never changed or added to, and the words around it are kept', () => {
  // "5-9pm" does not say the 5 is pm, so it is not given one.
  assert.equal(publishedTime('5-9pm'), '5 – 9 pm');
  assert.equal(publishedTime('Noon-3pm'), 'Noon – 3 pm');
  // A full stop that ends a sentence stays.
  assert.equal(publishedTime('Starts 9 a.m. Bring water.'), 'Starts 9 am. Bring water.');
  assert.equal(publishedTime('Gates 10 AM; race 11:30 AM.'), 'Gates 10 am; race 11:30 am.');
  // Nothing that is not a time.
  for (const text of ['Highway 9', 'Route 66', 'AMC 10', '4 miles', 'Free']) assert.equal(publishedTime(text), text);
  assert.equal(publishedTime(undefined), undefined);
});
