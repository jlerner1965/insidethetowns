/**
 * The guard on docs/DESIGN.md: the flagship home page, header and menu as
 * the owner signed them off on 26 October 2026. These are not snapshots;
 * each test names one rule of the spec, so a change that breaks it fails
 * here and has to be argued for (the owner's sign-off and a DECISIONS.md
 * entry) rather than slipping through.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { towns } from '../src/config/towns/registry.ts';
import { schoolsFor } from '../src/config/school-sports.ts';
import { schoolTheme } from '../src/config/school-colors.ts';
import { townNav } from '../src/lib/nav.ts';
import { DESIGN_SPEC, SCHOOL_BACKGROUNDS } from '../src/config/design.ts';

const css = readFileSync('src/components/home/flagship-home.css', 'utf8');
const header = readFileSync('src/components/Header.astro', 'utf8');
const flagships = towns.filter((t) => t.home);

/** Every `selector { body }` block in a stylesheet, comments removed, at-rules' insides included. */
function rules(source: string): Array<{ selector: string; body: string }> {
  const plain = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...plain.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1]!.trim(), body: m[2]! }));
}

test('the menu: every flagship has the same six destinations in the same order and words', () => {
  for (const t of flagships) {
    const sports = schoolsFor(t.slug).length > 0 ? [`${t.school!.mascot} sports`] : [];
    assert.deepEqual(
      townNav(t).map((n) => n.label),
      ['This week', 'Events', ...sports, 'Eat & drink', 'Families', 'Living here'],
      t.slug,
    );
  }
});

test('the menu: every classic guide follows the same order, with its own hub and its own "Moving here"', () => {
  for (const t of towns.filter((t) => !t.home)) {
    const labels = townNav(t).map((n) => n.label);
    assert.deepEqual(labels.slice(0, 2), ['This week', 'Events'], t.slug);
    assert.deepEqual(labels.slice(-3), ['Eat & drink', 'Things to do', 'Moving here'], t.slug);
    const middle = labels.slice(2, -3);
    assert.ok(middle.length <= 1 && middle.every((l) => /sports$/.test(l)), `${t.slug}: ${labels.join(', ')}`);
  }
});

test('the header has one treatment: one <header>, on the paper, with no per-template colour switch', () => {
  assert.equal(header.match(/<header\b/g)?.length, 1, 'one header element');
  assert.match(header, /<header class="relative bg-paper"/);
  for (const banned of [/\bon-dark\b/, /\bbg-primary text-white\b/, /fh-header/, /\bdark \?/, /homeTown/]) {
    assert.doesNotMatch(header, banned, `Header.astro: ${banned}`);
  }
  // The only thing the home page changes is where the email button points.
  assert.match(header, /const emailHref = Astro\.props\.home \? '#signup' : '\/#signup';/);
});

test('the school colour is trim: a background only on the closing band and the Home pill', () => {
  const school = /var\(--fh-(band|ink|rule)\)/;
  for (const { selector, body } of rules(css)) {
    for (const decl of body.split(';')) {
      const [prop, value = ''] = decl.split(':').map((s) => s.trim());
      if (!prop || !/^background/.test(prop) || !school.test(value)) continue;
      assert.ok(
        (SCHOOL_BACKGROUNDS as readonly string[]).includes(selector),
        `${selector} paints ${prop}: ${value}; the school's colour fills only ${SCHOOL_BACKGROUNDS.join(' and ')}`,
      );
    }
  }
});

test('the rule along the top of every page is the school’s main colour where the guide follows one', () => {
  assert.match(header, /schoolTheme\(site\.school\)/);
  assert.match(header, /background:\$\{school\.rule\}/);
  for (const t of flagships) assert.equal(schoolTheme(t.school!).rule, t.school!.primary, t.slug);
});

test('the sizes and key values in the stylesheet are the spec’s', () => {
  const found = new Map<string, string>();
  for (const m of css.matchAll(/:\s*([^;{}]+);\s*\}?\s*\/\*\s*spec:\s*([^*]+?)\s*\*\//g)) found.set(m[2]!, m[1]!.trim());
  for (const [name, value] of Object.entries(DESIGN_SPEC)) {
    assert.equal(found.get(name), value, `flagship-home.css "spec: ${name}"`);
  }
  assert.deepEqual([...found.keys()].sort(), Object.keys(DESIGN_SPEC).sort(), 'every spec comment is in DESIGN_SPEC and the other way round');
});

test('the scores are 56px on a phone and 72px from 64rem, the same size for both sides', () => {
  assert.equal(DESIGN_SPEC['score phone (56px)'], '3.5rem');
  assert.equal(DESIGN_SPEC['score desktop (72px)'], '4.5rem');
  // No rule dims or shrinks the losing side.
  assert.doesNotMatch(css, /fh-lost|opacity:\s*0\.\d/);
});

test('docs/DESIGN.md states the values the stylesheet holds', () => {
  const doc = readFileSync('docs/DESIGN.md', 'utf8');
  for (const [name, value] of Object.entries(DESIGN_SPEC)) {
    assert.ok(doc.includes(value), `DESIGN.md names ${name}: ${value}`);
  }
  assert.match(doc, /## Changing this/);
});
