/**
 * The hub's publication pages (the redesign of 14 November 2026): the town
 * page's sections, numbered over the ones drawn; the year at a glance and
 * what each month says; the towns under "More in …"; History's rows, one a year; the areas' names;
 * and the two colours the redesign added, declared once.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { HUB_PUBLICATION } from '../src/config/palette.ts';
import { CLUSTER_NAMES, HUB_CLUSTERS, HUB_TOWNS, clusterName } from '../src/config/hub-towns.ts';
import { MORE_MAX, MORE_MIN, milesShort, moreHeading, moreInRegion, notYetLine, pageSections, profileView, sameYearJoined, yearGrid } from '../src/lib/hub-town-page.ts';
import { formatMiles, roadLeg, type RoadMiles } from '../src/lib/near.ts';
import { publishedHubTowns } from '../src/lib/hub-towns.ts';
import { rawRecords } from '../src/lib/tradition-files.ts';
import { monthLabel } from '../src/lib/year-grid.ts';

test('the stylesheet declares the publication colours in src/config/palette.ts', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  assert.match(css, new RegExp(`--color-hairline:\\s*${HUB_PUBLICATION.hairline};`, 'i'));
  assert.match(css, new RegExp(`--color-hero-mountain:\\s*${HUB_PUBLICATION.heroMountain};`, 'i'));
});

test('the sections are numbered over the ones drawn, and On this page lists the same', () => {
  const all = pageSections('La Veta', { events: true, places: false, trails: false, directory: false, stay: true, getting: true, outdoor: true, about: true });
  assert.deepEqual(all.map((s) => [s.number, s.label, s.id]), [
    ['01', 'Event dates', 'traditions'],
    ['02', 'Where to stay', 'stay'],
    ['03', 'Getting here', 'getting-here'],
    ['04', 'Outdoor dates', 'outdoor-dates'],
    ['05', 'About La Veta', 'about'],
  ]);
  assert.deepEqual(all.map((s) => s.title), ['Events and dates in La Veta', 'Where to stay in La Veta', 'Getting to La Veta', 'Outdoor dates in Colorado', 'About La Veta']);
  // No lodging on file: the section is not drawn and the rest close up.
  const noStay = pageSections('Craig', { events: true, places: false, trails: false, directory: false, stay: false, getting: true, outdoor: true, about: true });
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

test('More in an area: its other pages nearest by road first, then the rest of it, five at most', () => {
  const towns = [
    { slug: 'a', cluster: 'Southern Colorado' as const },
    { slug: 'b', cluster: 'North Park' as const },
    { slug: 'c', cluster: 'Southern Colorado' as const },
    { slug: 'd', cluster: 'Southern Colorado' as const },
    { slug: 'e', cluster: 'Southern Colorado' as const },
    { slug: 'f', cluster: 'Southern Colorado' as const },
    { slug: 'g', cluster: 'Southern Colorado' as const },
    { slug: 'h', cluster: 'Southern Colorado' as const },
  ];
  const roads = { pairs: { 'a|c': { miles: 40, minutes: 50 }, 'a|d': { miles: 9, minutes: 12 }, 'a|g': { miles: 20, minutes: 25 }, 'a|b': { miles: 5, minutes: 6 } } };
  // The area's pages with miles, nearest first; then those with none, in the hub's order; never the town itself or another area while its own has three.
  assert.deepEqual(moreInRegion(towns[0]!, towns, roads).map((t) => t.slug), ['d', 'g', 'c', 'e', 'f']);
  assert.equal(moreInRegion(towns[0]!, towns, roads).length, MORE_MAX);
  // A town alone in its area: the nearest pages by road around it make up three, and the heading names their areas.
  const alone = moreInRegion(towns[1]!, towns, { pairs: { 'a|b': { miles: 5, minutes: 6 }, 'b|h': { miles: 30, minutes: 40 }, 'b|e': { miles: 12, minutes: 15 }, 'b|f': { miles: 90, minutes: 99 } } });
  assert.deepEqual(alone.map((t) => t.slug), ['a', 'e', 'h']);
  assert.equal(moreHeading(alone), 'Southern Colorado');
  assert.equal(moreHeading([{ cluster: 'Yampa valley' }, { cluster: 'Grand County' }, { cluster: 'Grand County' }]), 'Yampa Valley and Grand County');
  assert.equal(moreHeading([{ cluster: 'North Park' }]), 'North Park');
  // No miles on file and nobody else in the area: nothing to link.
  assert.deepEqual(moreInRegion(towns[1]!, towns), []);
});

test('every town page’s More in links three to five other published pages, nearest first, its own area first', () => {
  const roads = JSON.parse(readFileSync('data/hub/road-miles.json', 'utf8')) as RoadMiles;
  const published = publishedHubTowns(rawRecords());
  const built = new Set(published.map((t) => t.slug));
  for (const town of published) {
    const more = moreInRegion(town, published, roads);
    const mates = published.filter((t) => t.cluster === town.cluster && t.slug !== town.slug);
    assert.ok(more.length <= MORE_MAX, town.slug);
    // At least three where its area has three other pages; and three for every town here, the small areas topped up from around them.
    if (mates.length >= MORE_MIN) assert.ok(more.length >= MORE_MIN, `${town.slug}: ${more.length} links, its area has ${mates.length} other pages`);
    assert.ok(more.length >= MORE_MIN, `${town.slug}: ${more.length} links`);
    for (const t of more) assert.ok(built.has(t.slug) && t.slug !== town.slug, `${town.slug} links ${t.slug}`);
    // Its own area's pages come first, as many as there are, up to five.
    const own = more.filter((t) => t.cluster === town.cluster);
    assert.equal(own.length, Math.min(mates.length, MORE_MAX), town.slug);
    assert.deepEqual(more.slice(0, own.length), own, town.slug);
    // Nearest first, where the miles are on file.
    const miles = own.map((t) => roadLeg(roads, town.slug, t.slug)?.miles ?? Infinity);
    assert.deepEqual(miles, [...miles].sort((x, y) => x - y), town.slug);
  }
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

test('History: rows of one year are joined into one, in the file’s order, and every row’s source still counts', () => {
  const row = (year: number, text: string, source = 'https://example.org/a') => ({ year, text, source, checked: '2026-11-12' });
  assert.deepEqual(
    sameYearJoined([row(1872, 'Incorporated.'), row(1874, 'Rio Grande County was formed.'), row(1874, 'The Windsor Hotel was established.'), row(1890, 'One')]).map((r) => [r.year, r.text]),
    [[1872, 'Incorporated.'], [1874, 'Rio Grande County was formed. The Windsor Hotel was established.'], [1890, 'One']],
  );
  // A sentence with no full stop gets one before the next; nothing else is changed.
  assert.equal(sameYearJoined([row(1890, 'The Huber Building was built'), row(1890, 'Elizabeth was incorporated.')])[0]!.text, 'The Huber Building was built. Elizabeth was incorporated.');
  // On a page: one row for 1874, and both sources named.
  const town = HUB_TOWNS.find((t) => t.slug === 'del-norte')!;
  const profile = JSON.parse(readFileSync('data/hub/towns/del-norte.json', 'utf8'));
  const view = profileView(town, { profile });
  const years = view.heritage!.timeline.map((t) => t.year);
  assert.deepEqual(years, [...new Set(years)], 'one row a year');
  assert.ok(view.heritageSources.some(([host]) => host.includes('windsorhoteldelnorte')), 'the hotel’s own page is still a source');
});

test('History on every town page: one row a year, and no timeline row that only repeats The name or Founded', () => {
  for (const town of HUB_TOWNS) {
    let profile;
    try {
      profile = JSON.parse(readFileSync(`data/hub/towns/${town.slug}.json`, 'utf8'));
    } catch {
      continue;
    }
    const h = profileView(town, { profile }).heritage;
    if (!h) continue;
    const years = h.timeline.map((t) => t.year);
    assert.deepEqual(years, [...new Set(years)], `${town.slug}: two rows for one year`);
    // The same words as the Founded row, in its year, say nothing new (Estes Park's 1859 did, word for word).
    if (h.founded?.text) {
      const same = h.timeline.find((t) => t.year === h.founded!.year && t.text.replace(/[.\s]+$/, '') === h.founded!.text!.replace(/[.\s]+$/, ''));
      assert.equal(same, undefined, `${town.slug}: ${h.founded.year} is the Founded row again`);
    }
  }
});

test('a road line drops the window’s own period before “; most recent”', () => {
  assert.equal(notYetLine('typically closes in late Oct. or early Nov., depending on weather conditions.', 'Nov 3, 2026'), 'not yet announced, typically closes in late Oct. or early Nov., depending on weather conditions; most recent Nov 3, 2026');
  assert.equal(notYetLine('around Memorial Day weekend', undefined), 'not yet announced, around Memorial Day weekend');
  assert.equal(notYetLine(undefined, 'May 21, 2026'), 'not yet announced; most recent May 21, 2026');
});
