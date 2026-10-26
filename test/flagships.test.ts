/**
 * The flagship guides (Berthoud and Niwot, 21 October 2026; Lyons, 22
 * October; Elizabeth, Windsor, Erie and Johnstown, later that day): what their
 * configs promise the pages, checked so a config edit cannot quietly break
 * a hub. Every link on Living Here is an official page or a path on the
 * guide, every school break names its source and its check date, and the
 * navigation names the hubs the config switches on.
 */
import { schoolsFor } from '../src/config/school-sports.ts';
import { townNav } from '../src/lib/nav.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import { hubRoutes } from '../src/integrations/town-routes.ts';

const FLAGSHIPS = ['berthoud', 'niwot', 'lyons', 'elizabeth', 'windsor', 'erie', 'johnstown'];
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

test('every guide has the same menu, built from what it has: the week, events, its school, the places, its hub and Living here or Moving here', () => {
  for (const t of towns) {
    const nav = townNav(t);
    const labels = nav.map((n) => n.label);
    assert.deepEqual(nav.slice(0, 2).map((n) => n.href), ['/this-week/', '/events/'], `${t.slug}: the week and events lead`);
    const sports = nav.find((n) => n.href === '/sports/');
    assert.equal(!!sports, schoolsFor(t.slug).length > 0, `${t.slug}: a sports item exactly where there is a school`);
    if (sports) assert.match(sports.label, /\bsports$/, `${t.slug}: "${sports.label}" says sports`);
    assert.ok(nav.some((n) => n.href === (t.families ? '/families/' : '/things-to-do/')), `${t.slug}: hub or things to do`);
    assert.ok(nav.some((n) => n.href === (t.livingHere ? '/living-here/' : '/moving-here/')), `${t.slug}: living or moving here`);
    for (const l of labels) assert.equal(l, l[0] + l.slice(1).replace(/\b[A-Z][a-z]/g, (w) => (/^(Golden|Eagles|Frederick)$/.test(w) ? w : w.toLowerCase())), `${t.slug}: "${l}" is in sentence case`);
  }
  assert.deepEqual(townNav(by('berthoud')).map((n) => n.label), ['This week', 'Events', 'Spartans sports', 'Eat & drink', 'Families', 'Living here']);
  assert.equal(townNav(by('lyons')).find((n) => n.href === '/sports/')?.label, 'Lions sports');
  assert.equal(townNav(towns.find((t) => t.slug === 'carbon-valley')!).find((n) => n.href === '/sports/')?.label, 'Frederick sports');
  assert.equal(townNav(towns.find((t) => t.slug === 'loveland')!).find((n) => n.href === '/sports/')?.label, 'High school sports');
  // Erie follows Erie High since 25 October 2026, so its menu carries the Tigers in the third slot.
  assert.deepEqual(townNav(towns.find((t) => t.slug === 'erie')!).map((n) => n.label), ['This week', 'Events', 'Tigers sports', 'Eat & drink', 'Families', 'Living here']);
  assert.deepEqual(townNav(towns.find((t) => t.slug === 'longmont')!).map((n) => n.label), ['This week', 'Events', 'Eat & drink', 'Things to do', 'Moving here']);
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
  assert.deepEqual(hubRoutes(by('longmont')), [], 'a guide without the hubs gets no hub routes');
});

test('the About page names who runs the guide, in verified words: James Lerner, Lerner Works, and Niwot as where he grew up', () => {
  const niwot = by('niwot').about!.who.join(' ');
  const berthoud = by('berthoud').about!.who.join(' ');
  assert.match(niwot, /James Lerner/);
  assert.match(niwot, /grew up in Niwot/);
  assert.match(berthoud, /James Lerner/);
  assert.match(berthoud, /not a Berthoud resident/);
  assert.match(berthoud, /Lerner Works/);
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
