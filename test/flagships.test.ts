/**
 * The flagship guides (Berthoud and Niwot, 21 October 2026; Lyons, 22
 * October; Elizabeth, Windsor, Erie and Johnstown, later that day; Golden, 28
 * October; Lafayette and Frederick, 2 November; Elizabeth left the list on
 * 4 November, a quiet guide): what their
 * configs promise the pages, checked so a config edit cannot quietly break
 * a hub. Every link on Living Here is an official page or a path on the
 * guide, every school break names its source and its check date, and the
 * navigation names the hubs the config switches on.
 */
import { schoolsFor } from '../src/config/school-sports.ts';
import { MIN_SHOPS_FOR_MENU, townNav } from '../src/lib/nav.ts';
import { MIN_PLACES_FOR_TYPE_PAGE } from '../src/lib/place-types.ts';
import { openPlaceTypeCounts } from '../src/lib/raw-places.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import { hubRoutes } from '../src/integrations/town-routes.ts';

const FLAGSHIPS = ['berthoud', 'niwot', 'lyons', 'windsor', 'erie', 'johnstown', 'golden', 'lafayette', 'frederick'];
const by = (slug: string) => towns.find((t) => t.slug === slug)!;

test('each flagship has the flagship layout and the three hubs; no other guide does', () => {
  for (const t of towns) {
    const flagship = FLAGSHIPS.includes(t.slug);
    assert.equal(!!t.home, flagship, `${t.slug}: home`);
    assert.equal(!!t.livingHere, flagship, `${t.slug}: livingHere`);
    // The participation hub is a flagship's to have or not: Lyons has none yet.
    if (!flagship) assert.equal(!!t.participation, false, `${t.slug}: participation`);
    assert.equal(!!t.families, flagship, `${t.slug}: families`);
  }
});

test('every guide has the same menu, built from what it has: the week, events, its school, the places, its hub, Living here or Moving here, and Guides', () => {
  for (const t of towns) {
    const nav = townNav(t);
    const labels = nav.map((n) => n.label);
    assert.deepEqual(nav.slice(0, 2).map((n) => n.href), ['/this-week/', '/things-to-do/'], `${t.slug}: the week and things to do lead`);
    assert.ok(nav.some((n) => n.href === (t.families ? '/families/' : '/events/')), `${t.slug}: Families, or Events where there is no family hub`);
    const sports = nav.find((n) => n.href === '/sports/');
    assert.equal(!!sports, schoolsFor(t.slug).length > 0, `${t.slug}: a sports item exactly where there is a school`);
    if (sports) assert.match(sports.label, /^Athletics$|\bsports$/, `${t.slug}: "${sports.label}" is Athletics or says sports`);
    assert.ok(nav.some((n) => n.href === (t.families ? '/families/' : '/things-to-do/')), `${t.slug}: hub or things to do`);
    assert.ok(nav.some((n) => n.href === (t.livingHere ? '/living-here/' : '/moving-here/')), `${t.slug}: living or moving here`);
    assert.equal(nav.at(-1)?.href, '/guides/', `${t.slug}: Guides last (the reader pass, 1 November 2026)`);
    // A proper noun inside a label keeps its capital: the school's name ("Berthoud athletics", "Resurrection Christian athletics").
    const proper = new Set(schoolsFor(t.slug).flatMap((s) => s.maxprepsName.split(' ')));
    for (const l of labels) assert.equal(l, l[0] + l.slice(1).replace(/\b[A-Z][a-z]+/g, (w) => (proper.has(w) ? w : w.toLowerCase())), `${t.slug}: "${l}" is in sentence case`);
  }
  // Berthoud lists ten open shops or more, so Shops follows Eat & drink (the owner, 7 November 2026).
  assert.deepEqual(townNav(by('berthoud')).map((n) => n.label), ['This week', 'Things to do', 'Athletics', 'Eat & drink', 'Shops', 'Families', 'Living here', 'Guides']);
  assert.equal(townNav(by('lyons')).find((n) => n.href === '/sports/')?.label, 'Athletics');
  // One word on every guide (the owner, 6 November 2026): Johnstown's Roosevelt High and Frederick High alike.
  assert.equal(townNav(towns.find((t) => t.slug === 'johnstown')!).find((n) => n.href === '/sports/')?.label, 'Athletics');
  assert.equal(townNav(towns.find((t) => t.slug === 'frederick')!).find((n) => n.href === '/sports/')?.label, 'Athletics');
  assert.equal(townNav(towns.find((t) => t.slug === 'loveland')!).find((n) => n.href === '/sports/')?.label, 'High school sports');
  // Erie follows Erie High since 25 October 2026, so its menu carries Erie High in the third slot.
  assert.deepEqual(townNav(towns.find((t) => t.slug === 'erie')!).map((n) => n.label), ['This week', 'Things to do', 'Athletics', 'Eat & drink', 'Families', 'Living here', 'Guides']);
  // Longmont follows its three high schools since 9 November 2026 (the owner's word), so its menu carries them in the third slot, as Loveland's.
  assert.deepEqual(townNav(towns.find((t) => t.slug === 'longmont')!).map((n) => n.label), ['This week', 'Things to do', 'High school sports', 'Eat & drink', 'Events', 'Moving here', 'Guides']);
});

test('Shops is in the menu only where the guide lists enough open shops, right after Eat & drink', () => {
  const erie = by('erie');
  const labels = (shop: number) => townNav(erie, { shop }).map((n) => n.label);
  assert.ok(!labels(MIN_SHOPS_FOR_MENU - 1).includes('Shops'), 'one short of the threshold: no Shops');
  const at = labels(MIN_SHOPS_FOR_MENU);
  assert.equal(at[at.indexOf('Eat & drink') + 1], 'Shops', 'at the threshold: Shops, after Eat & drink');
  assert.equal(townNav(erie, {}).some((n) => n.href === '/shops/'), false, 'no shops at all: no Shops');
  // The item links to a page the build makes: /shops/ needs MIN_PLACES_FOR_TYPE_PAGE, far fewer.
  assert.ok(MIN_SHOPS_FOR_MENU >= MIN_PLACES_FOR_TYPE_PAGE);
  // Every guide the counts put over the line, from the markdown on disk.
  for (const t of towns) {
    const has = townNav(t).some((n) => n.href === '/shops/');
    assert.equal(has, (openPlaceTypeCounts(t.slug).shop ?? 0) >= MIN_SHOPS_FOR_MENU, `${t.slug}: Shops follows the count`);
  }
});

test('the short tagline is enduring: no dated civic topic in it or in the town’s one line', () => {
  for (const slug of FLAGSHIPS) {
    const t = by(slug);
    for (const line of [t.shortTagline ?? '', t.character ?? '']) {
      assert.doesNotMatch(line, /\b(vote|ballot|election|bond)\b/i, `${slug}: "${line}"`);
      assert.doesNotMatch(line, /\b20\d\d\b/, `${slug}: a year in "${line}"`);
    }
  }
});

test('every Living Here link is an official https page or a path on the guide, and every section says when it was read', () => {
  for (const slug of FLAGSHIPS) {
    for (const section of by(slug).livingHere!.sections) {
      assert.match(section.verified, /^\d{4}-\d{2}-\d{2}$/, `${slug}: ${section.title}`);
      assert.ok(section.items.length > 0, `${slug}: ${section.title} is empty`);
      for (const item of section.items) {
        assert.match(item.url, /^(https:\/\/|\/)/, `${slug}: ${item.label}: ${item.url}`);
        assert.ok(item.label.length > 3, `${slug}: ${item.label}`);
      }
    }
  }
});

test('school breaks come from the district calendar, dated, sourced and in order', () => {
  for (const slug of FLAGSHIPS) {
    const f = by(slug).families!;
    assert.ok(f.schools.length >= 1, slug);
    for (const b of f.breaks) {
      assert.match(b.from, /^\d{4}-\d{2}-\d{2}$/, `${slug}: ${b.label}`);
      assert.match(b.to, /^\d{4}-\d{2}-\d{2}$/, `${slug}: ${b.label}`);
      assert.ok(b.to >= b.from, `${slug}: ${b.label} ends before it starts`);
      assert.match(b.source, /^https:\/\//, `${slug}: ${b.label} source`);
      assert.match(b.verified, /^\d{4}-\d{2}-\d{2}$/, `${slug}: ${b.label} verified`);
    }
  }
  // Both districts' Thanksgiving weeks, as their 2026–27 calendars give them.
  assert.ok(by('berthoud').families!.breaks.some((b) => b.from === '2026-11-23' && b.to === '2026-11-27'));
  assert.ok(by('niwot').families!.breaks.some((b) => b.from === '2026-11-23' && b.to === '2026-11-27'));
  assert.ok(by('lyons').families!.breaks.some((b) => b.from === '2026-11-23' && b.to === '2026-11-27'));
});

test('the hub routes follow the config and the content: both hubs, local changes, and people only where a profile is published', () => {
  for (const slug of FLAGSHIPS) {
    const patterns = hubRoutes(by(slug)).map(([p]) => p);
    assert.ok(patterns.includes('/families') && patterns.includes('/living-here'), slug);
    assert.equal(patterns.includes('/updates'), existsSync(`content/${slug}/updates`), `${slug}: updates follows the content folder`);
    assert.equal(patterns.includes('/get-involved'), !!by(slug).participation, `${slug}: get-involved follows participation`);
    // Every profile is still a draft, so there is no people page to build.
    assert.ok(!patterns.includes('/people'), `${slug}: no profile is published yet`);
  }
  // Longmont switches on no hub; its only route is the changes page, which
  // follows its updates folder like every other guide's.
  assert.deepEqual(
    hubRoutes(by('longmont')),
    existsSync('content/longmont/updates') ? [['/updates', 'updates.astro']] : [],
    'a guide without the hubs gets no hub routes beyond the changes page its updates folder gives it',
  );
});

test('the About page names who runs the guide, in verified words: James Lerner, Lerner Works, and Niwot as where he grew up', () => {
  const niwot = by('niwot').about!.who.join(' ');
  const berthoud = by('berthoud').about!.who.join(' ');
  assert.match(niwot, /James Lerner/);
  assert.match(niwot, /grew up in Niwot/);
  assert.match(berthoud, /James Lerner/);
  assert.match(berthoud, /not a Berthoud resident/);
  assert.match(berthoud, /Lerner Works/);
  // "Twenty minutes down the Diagonal" (audit, 26 October 2026): the Diagonal
  // runs from Boulder to Longmont, not to Berthoud, and a reader new to the
  // area cannot decode road shorthand. Where he grew up is said plainly.
  assert.doesNotMatch(berthoud, /Diagonal/);
  assert.match(berthoud, /grew up in Niwot, in Boulder County/);
  assert.equal(by('niwot').about!.photo, undefined, 'no portrait exists; none is invented');
});

test('the hub pages open on an intro of fifteen words or fewer', () => {
  for (const town of towns) {
    for (const [page, intro] of [['families', town.families?.intro], ['get-involved', town.participation?.intro], ['living-here', town.livingHere?.intro]] as const) {
      if (!intro) continue;
      const words = intro.split(/\s+/).filter(Boolean).length;
      assert.ok(words <= 15, `${town.slug} /${page}/ intro is ${words} words: ${intro}`);
    }
  }
});
