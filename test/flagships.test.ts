/**
 * The flagship guides (Berthoud and Niwot, 21 October 2026; Lyons, 22
 * October): what their
 * configs promise the pages, checked so a config edit cannot quietly break
 * a hub. Every link on Living Here is an official page or a path on the
 * guide, every school break names its source and its check date, the home
 * page's photograph has its licence row, and the navigation names the hubs
 * the config switches on.
 */
import { schoolSportsFor } from '../src/config/school-sports.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import { hubRoutes } from '../src/integrations/town-routes.ts';

const FLAGSHIPS = ['berthoud', 'niwot', 'lyons'];
const by = (slug: string) => towns.find((t) => t.slug === slug)!;
const licences = readFileSync('IMAGE_LICENSES.csv', 'utf8');

test('each flagship has the flagship layout, the three hubs and a compact footer; no other guide does', () => {
  for (const t of towns) {
    const flagship = FLAGSHIPS.includes(t.slug);
    assert.equal(!!t.home, flagship, `${t.slug}: home`);
    assert.equal(!!t.livingHere, flagship, `${t.slug}: livingHere`);
    // The participation hub is a flagship's to have or not: Lyons has none yet.
    if (!flagship) assert.equal(!!t.participation, false, `${t.slug}: participation`);
    assert.equal(!!t.families, flagship, `${t.slug}: families`);
    assert.equal(t.footer === 'compact', flagship, `${t.slug}: footer`);
  }
  assert.equal(by('berthoud').home!.signature, 'families');
  assert.equal(by('niwot').home!.signature, 'get-involved');
  assert.equal(by('lyons').home!.signature, 'families');
});

test('the flagship navigation is the five pills: the week, the family hub, the school’s mascot, Living Here and the places', () => {
  for (const slug of FLAGSHIPS) {
    const t = by(slug);
    const hrefs = t.nav.map((n) => n.href);
    assert.deepEqual(hrefs, ['/this-week/', '/families/', '/sports/', '/living-here/', '/eat-drink/'], slug);
    assert.equal(t.nav.find((n) => n.href === '/sports/')?.label, schoolSportsFor(slug)?.mascot, `${slug}: the pill is the mascot`);
  }
});

test('the purpose line is enduring: no dated civic topic in the masthead or the short tagline', () => {
  for (const slug of FLAGSHIPS) {
    const t = by(slug);
    for (const line of [t.home!.purpose, t.shortTagline ?? '', t.character ?? '']) {
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

test('the home page photograph is a file with a licence row, credited where the licence asks', () => {
  for (const slug of FLAGSHIPS) {
    const { photo } = by(slug).home!;
    // The option-B home page draws no photograph; a guide may have none.
    if (!photo) continue;
    assert.ok(licences.includes(`content/${slug}/images/${photo.image}`), `${slug}: ${photo.image} has no licence row`);
    assert.ok(photo.alt.length > 20, `${slug}: alt text`);
  }
  // Second Avenue is CC BY-SA and needs its credit; the Town's playground photograph is credited as a courtesy.
  assert.match(by('niwot').home!.photo?.credit ?? '', /CC BY-SA/);
  assert.match(by('berthoud').home!.photo?.credit ?? '', /Town of Berthoud/);
  assert.equal(by('lyons').home!.photo, undefined, 'no photograph was chosen for Lyons; none is invented');
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
