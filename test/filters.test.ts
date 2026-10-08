/**
 * The directory's filter and the hub's town filter (src/lib/filters.ts, run
 * by FilterBar.astro). Every case is one the October 7 audit found on a live
 * page: a name search that left the whole list up, a category plus a typo
 * that still showed two bars, and a town's only listing announced as a result
 * and then left folded behind "Show 20 more".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collapsePlan, emptyText, filterRows, normalizeName, statusText, unknownNote, type FilterRow, type FilterState } from '../src/lib/filters.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const all: FilterState = { value: 'all', openOnly: false, where: 'all', query: '' };
const names = (rows: FilterRow[], state: Partial<FilterState>) => {
  const { shown } = filterRows(rows, { ...all, ...state });
  return rows.filter((_, i) => shown[i]).map((r) => r.name);
};

const berthoud: FilterRow[] = [
  { name: 'City Star Brewing', category: 'bar', open: 'true' },
  { name: 'Berthoud Brewing Company', category: 'bar', open: 'false' },
  { name: 'Bimbo’s Pizza', category: 'restaurant', open: 'true' },
  { name: 'Mary’s Market', category: 'coffee' },
  { name: 'Berthoud Town Park', category: 'park', land: true },
];

test('a name narrows the list to the rows that carry it', () => {
  assert.deepEqual(names(berthoud, { query: 'City Star' }), ['City Star Brewing']);
  assert.deepEqual(names(berthoud, { query: '  city   star ' }), ['City Star Brewing'], 'case and spacing do not matter');
  assert.deepEqual(names(berthoud, { query: "Bimbo's" }), ['Bimbo’s Pizza'], 'a straight apostrophe finds a curly one');
});

test('name, category and open status are one filter', () => {
  assert.deepEqual(names(berthoud, { value: 'bar' }), ['City Star Brewing', 'Berthoud Brewing Company']);
  assert.deepEqual(names(berthoud, { value: 'bar', query: 'City Starx' }), [], 'Bar plus a typo is nothing, not both bars');
  assert.deepEqual(names(berthoud, { value: 'bar', openOnly: true }), ['City Star Brewing']);
  assert.deepEqual(names(berthoud, { value: 'restaurant', query: 'City Star' }), [], 'the name does not escape the category');
});

test('nonsense finds nothing and says so, with the filters that left nothing; clearing restores everything', () => {
  const none = filterRows(berthoud, { ...all, query: 'qwzx' });
  assert.equal(none.count, 0);
  assert.equal(emptyText({ query: 'qwzx', openOnly: false }), 'Nothing matches “qwzx”.');
  assert.equal(emptyText({ query: 'City Starx', label: 'Bar', openOnly: false }), 'Nothing matches “City Starx” in Bar.');
  assert.equal(filterRows(berthoud, all).count, berthoud.length, 'reset: every row back');
});

test('group counts come from the same result as the rows', () => {
  const { shown } = filterRows(berthoud, { ...all, query: 'berthoud' });
  const count = (category: string) => berthoud.filter((r, i) => r.category === category && shown[i]).length;
  assert.equal(count('bar'), 1);
  assert.equal(count('park'), 1);
  assert.equal(count('restaurant'), 0, 'a group with nothing left is hidden, not left at its old count');
});

test('Open now leaves unknown hours out and says how many; it does not call them closed', () => {
  const r = filterRows(berthoud, { ...all, openOnly: true });
  assert.deepEqual(berthoud.filter((_, i) => r.shown[i]).map((x) => x.name), ['City Star Brewing', 'Bimbo’s Pizza']);
  assert.equal(r.unknownHours, 1, 'Mary’s Market has no hours we can read');
  assert.equal(r.unknownLand, 1, 'the park keeps daylight hours, which is not a business’s hours');
  assert.equal(unknownNote(r), '1 place with unknown hours not shown. 1 park or trail with daylight or no posted hours not shown.');
  assert.equal(unknownNote({ unknownHours: 3, unknownLand: 0 }), '3 places with unknown hours not shown.');
  assert.equal(unknownNote(filterRows(berthoud, all)), '', 'nothing to say when Open now is off');
});

test('the real directories: City Star in Berthoud and 24 Carrot in Erie each find their one row', () => {
  const rowsOf = (town: string): FilterRow[] =>
    readdirSync(join('content', town, 'places'))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => {
        const { data } = parseFrontmatter(readFileSync(join('content', town, 'places', f), 'utf8')) as { data: { title: string; type: string } };
        return { name: data.title, category: data.type };
      });
  const erie = rowsOf('erie');
  assert.ok(erie.length >= 35, `Erie lists ${erie.length}`);
  assert.equal(filterRows(rowsOf('berthoud'), { ...all, query: 'City Star' }).count, 1);
  assert.equal(filterRows(erie, { ...all, query: '24 Carrot' }).count, 1);
  assert.equal(filterRows(erie, { ...all, query: 'zzzz' }).count, 0);
});

// --------------------------------------------------------------- the hub

test('filtered to one town, its only listing that day sits above the fold', () => {
  // A day of 27 listings, folded after 6; Estes Park’s is the 21st.
  const towns = Array.from({ length: 27 }, (_, i) => (i === 20 ? 'estes-park' : `town-${i % 5}`));
  const rows = towns.map((category, i) => ({ category, name: `Listing ${i}` }));
  const filtered = filterRows(rows, { ...all, value: 'estes-park' });
  assert.equal(filtered.count, 1);
  assert.deepEqual(collapsePlan(filtered.shown, 6), { above: [20], below: [] }, 'shown at once, no "Show 20 more"');
  assert.equal(statusText(filtered.count, { label: 'Estes Park', openOnly: false, query: '' }), '1 result in Estes Park', 'the town’s name, not its slug');
});

test('a filter with many matches folds after the first few of them; reset restores the original fold', () => {
  const shownAll = Array.from({ length: 27 }, () => true);
  assert.deepEqual(collapsePlan(shownAll, 6), { above: [0, 1, 2, 3, 4, 5], below: Array.from({ length: 21 }, (_, i) => i + 6) }, 'as built');
  const someTown = shownAll.map((_, i) => i % 3 === 0);
  const plan = collapsePlan(someTown, 6);
  assert.deepEqual(plan.above, [0, 3, 6, 9, 12, 15]);
  assert.deepEqual(plan.below, [18, 21, 24], 'Show 3 more, counted among the matches');
  assert.deepEqual(collapsePlan(shownAll.slice(0, 7), 6).below, [], 'seven is shown whole, as the server renders it');
});

test('names compare the way a reader types them', () => {
  assert.equal(normalizeName('Café  Luna’s'), "cafe luna's");
});
