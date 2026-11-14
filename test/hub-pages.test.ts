/**
 * The hub's publication pages (the redesign of 14 November 2026): the town
 * page's sections, numbered over the ones drawn; the year at a glance and
 * what each month says; the one town under "More in …"; the areas' names;
 * and the two colours the redesign added, declared once.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HUB_PUBLICATION } from '../src/config/palette.ts';
import { CLUSTER_NAMES, HUB_CLUSTERS, HUB_TOWNS, clusterName } from '../src/config/hub-towns.ts';
import { milesShort, nextInCluster, pageSections, yearGrid } from '../src/lib/hub-town-page.ts';
import { formatMiles } from '../src/lib/near.ts';
import { monthLabel } from '../src/lib/year-grid.ts';

test('the stylesheet declares the publication colours in src/config/palette.ts', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, new RegExp(`--color-hairline:\\s*${HUB_PUBLICATION.hairline};`, 'i'));
  assert.match(css, new RegExp(`--color-hero-mountain:\\s*${HUB_PUBLICATION.heroMountain};`, 'i'));
});

test('the sections are numbered over the ones drawn, and On this page lists the same', () => {
  const all = pageSections('La Veta', { events: true, stay: true, getting: true, outdoor: true, about: true });
  assert.deepEqual(all.map((s) => [s.number, s.label, s.id]), [
    ['01', 'Event dates', 'traditions'],
    ['02', 'Where to stay', 'stay'],
    ['03', 'Getting here', 'getting-here'],
    ['04', 'Outdoor dates', 'outdoor-dates'],
    ['05', 'About La Veta', 'about'],
  ]);
  assert.deepEqual(all.map((s) => s.title), ['Events and dates in La Veta', 'Where to stay in La Veta', 'Getting to La Veta', 'Outdoor dates in Colorado', 'About La Veta']);
  // No lodging on file: the section is not drawn and the rest close up.
  const noStay = pageSections('Craig', { events: true, stay: false, getting: true, outdoor: true, about: true });
  assert.deepEqual(noStay.map((s) => [s.number, s.key]), [['01', 'events'], ['02', 'getting'], ['03', 'outdoor'], ['04', 'about']]);
});

test('a month says what it holds, in the board’s words', () => {
  assert.equal(monthLabel(8, [{ set: true }]), 'September: 1 event, date set');
  assert.equal(monthLabel(6, [{ set: false, heldYear: '2026', nextYear: '2027' }, { set: false, heldYear: '2026', nextYear: '2027' }]), 'July: 2 events last held in July 2026, 2027 dates not yet announced');
  // A date that has passed with no later year on file awaits its next date, not a named year.
  assert.equal(monthLabel(11, [{ set: false, heldYear: '2026' }]), 'December: 1 event last held in December 2026, next date not yet announced');
  assert.equal(monthLabel(4, [{ set: true }, { set: false, heldYear: '2026', nextYear: '2027' }], true), 'May, this month: 1 event, date set; 1 event last held in May 2026, 2027 date not yet announced');
});

test('the grid’s months link to the list their entries are under, a date set first', () => {
  const cells = yearGrid(
    [
      { slug: 'a', month: 6, set: false, heldYear: '2026', nextYear: '2027', group: 'not-announced' },
      { slug: 'b', month: 8, set: true, year: '2027', group: 'coming-up' },
      { slug: 'c', month: 8, set: false, heldYear: '2026', nextYear: '2027', group: 'not-announced' },
    ],
    10,
  );
  assert.equal(cells.length, 12);
  assert.equal(cells[6]!.target, 'not-announced');
  assert.equal(cells[8]!.target, 'coming-up');
  assert.equal(cells[0]!.target, undefined, 'a month with nothing in it links nowhere');
  assert.ok(cells[10]!.now && cells.filter((c) => c.now).length === 1);
  assert.equal(cells[8]!.label, 'September: 1 event, date set; 1 event last held in September 2026, 2027 date not yet announced');
});

test('More in an area: the next town in it, round to the first; none for a town alone in its area', () => {
  const towns = [
    { slug: 'a', cluster: 'Southern Colorado' as const },
    { slug: 'b', cluster: 'North Park' as const },
    { slug: 'c', cluster: 'Southern Colorado' as const },
    { slug: 'd', cluster: 'Southern Colorado' as const },
  ];
  assert.equal(nextInCluster(towns[0]!, towns)?.slug, 'c');
  assert.equal(nextInCluster(towns[3]!, towns)?.slug, 'a');
  assert.equal(nextInCluster(towns[1]!, towns), undefined);
});

test('the short miles are the long ones’ number', () => {
  for (const miles of [53.4, 8.26, 176.5, 1240]) assert.equal(milesShort(miles).replace(' mi', ''), formatMiles(miles).replace(/ miles?$/, ''));
});

test('every area has a name for the page, and only the display changes', () => {
  for (const c of HUB_CLUSTERS) assert.ok(CLUSTER_NAMES[c], c);
  assert.equal(clusterName('Arkansas valley'), 'Arkansas Valley');
  assert.equal(clusterName('I-70 mountain'), 'I-70 mountain towns');
  assert.equal(clusterName('Park gateway'), 'Park gateway towns');
  // The towns still name their area by its key.
  for (const t of HUB_TOWNS) assert.ok((HUB_CLUSTERS as readonly string[]).includes(t.cluster), t.slug);
});
