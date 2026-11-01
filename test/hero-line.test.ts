/**
 * The hero's line on a town guide: what the guide does this week, not facts
 * about the town (the owner, 1 November 2026), written whole for each width so
 * neither is cut, and promising only what that kind of guide's home page has.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { allTowns, LIVE_TOWNS } from '../src/config/index.ts';
import { HERO_LINE_LONG, HERO_LINE_SHORT, heroLine } from '../src/lib/hero-line.ts';

const live = allTowns.filter((t) => LIVE_TOWNS.includes(t.slug));

test('every live town guide has a line that fits each width whole, with its name in it', () => {
  for (const t of live) {
    if (t.visitorGuide) continue;
    for (const pick of [true, false]) {
      const line = heroLine(t, { pick })!;
      assert.ok(line, `${t.slug}: no hero line`);
      assert.ok(line.short.length <= HERO_LINE_SHORT, `${t.slug}: phone line is ${line.short.length} characters: ${line.short}`);
      assert.ok(line.long.length <= HERO_LINE_LONG, `${t.slug}: wide line is ${line.long.length} characters: ${line.long}`);
      for (const s of [line.short, line.long]) {
        assert.ok(s.includes(t.name), `${t.slug}: the line does not name the guide`);
        assert.ok(!s.includes('…'), `${t.slug}: a line written to fit is never cut`);
      }
    }
  }
});

test('a line promises only what the guide has: changes on a resident guide, the pick only in a week with one', () => {
  for (const t of live) {
    if (t.visitorGuide) {
      assert.equal(heroLine(t), undefined, `${t.slug}: a visitor guide keeps its place line`);
      continue;
    }
    const withPick = heroLine(t, { pick: true })!;
    const without = heroLine(t, { pick: false })!;
    if (t.home) {
      assert.match(withPick.short, /what’s new in town/, `${t.slug}: a resident guide has Updates`);
      assert.match(withPick.long, /the one we’d go to/, `${t.slug}: the week's pick, when there is one`);
    } else {
      assert.doesNotMatch(withPick.long, /what’s new in town/, `${t.slug}: no Updates on this guide`);
    }
    for (const s of [without.short, without.long]) assert.doesNotMatch(s, /the one we’d go to/, `${t.slug}: no pick this week, so no promise of one`);
  }
  const erie = live.find((t) => t.slug === 'erie')!;
  assert.deepEqual(heroLine(erie, { pick: true }), {
    short: 'What’s on in Erie this week, and what’s new in town',
    long: 'What’s on in Erie this week, what’s new in town, and the one we’d go to',
  });
});

test('the hero uses the line, and the home tells it whether this week has a pick', () => {
  const hero = readFileSync('src/components/Hero.astro', 'utf8');
  assert.match(hero, /heroLine\(site, \{ pick: Astro\.props\.pick === true \}\)/);
  const home = readFileSync('src/components/home/TownHome.astro', 'utf8');
  assert.match(home, /<Hero compact pick=\{!!pick\} \/>/);
});
