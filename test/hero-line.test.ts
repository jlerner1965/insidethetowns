/**
 * The hero's line on a town guide: what the guide does this week, not facts
 * about the town (the owner, 1 November 2026), written whole for each width so
 * neither is cut, and promising only what that kind of guide's home page has:
 * a guide that leads with its updates or its outdoor dates (`lead`, 12
 * November 2026) says that instead.
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
    if (t.lead === 'updates') {
      // A quiet guide lists no events: no week, and no pick, is promised.
      for (const s of [withPick.short, withPick.long, without.short, without.long]) {
        assert.doesNotMatch(s, /this week|What’s on|the one we’d go to/, `${t.slug}: a guide that lists no events promises no week and no pick`);
      }
      assert.deepEqual(withPick, without, `${t.slug}: the pick changes nothing`);
    } else if (t.lead === 'outdoors') {
      assert.match(withPick.short, /^The outdoor dates around /, `${t.slug}: the outdoor dates lead`);
      assert.match(withPick.short, /what’s on this week/, `${t.slug}: it still lists the week`);
      assert.match(withPick.long, /the one we’d go to/, `${t.slug}: the week's pick, when there is one`);
    } else if (t.home) {
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
  // A week with no current change: Worth knowing is not on the page, so the
  // line promises the Eat & drink tile instead (the reader pass, 1 November 2026).
  assert.deepEqual(heroLine(erie, { pick: true, changes: false }), {
    short: 'What’s on in Erie this week, and where to eat and drink',
    long: 'What’s on in Erie this week, where to eat and drink, and the one we’d go to',
  });
  assert.deepEqual(heroLine(erie, { changes: false }), {
    short: 'What’s on in Erie this week, and where to eat and drink',
    long: 'What’s on in Erie this week, and where to eat and drink',
  });
  for (const t of live) {
    if (t.visitorGuide) continue;
    const line = heroLine(t, { pick: true, changes: false })!;
    assert.ok(line.short.length <= HERO_LINE_SHORT && line.long.length <= HERO_LINE_LONG, `${t.slug}: the line without Updates fits: ${line.long}`);
  }
});

test('a guide that leads with something else says so: Updates on a quiet guide, the outdoor dates on an outdoors-led one (12 November 2026)', () => {
  // `lead: 'updates'` (Niwot): what its home page has, Updates when there is
  // a current one and Things to know. One line for both widths, no pick.
  const niwot = live.find((t) => t.slug === 'niwot')!;
  assert.equal(niwot.lead, 'updates');
  assert.deepEqual(heroLine(niwot, { pick: true }), { short: 'What’s new in Niwot, and what to know', long: 'What’s new in Niwot, and what to know' });
  assert.deepEqual(heroLine(niwot, { pick: false, changes: true }), { short: 'What’s new in Niwot, and what to know', long: 'What’s new in Niwot, and what to know' });
  assert.deepEqual(heroLine(niwot, { pick: true, changes: false }), { short: 'What to know in Niwot', long: 'What to know in Niwot' });
  // `lead: 'outdoors'` (Lyons): the outdoor dates first, then the week; the
  // pick only in the wide line and only in a week with one. Whether Worth
  // knowing has a change does not alter it.
  const lyons = live.find((t) => t.slug === 'lyons')!;
  assert.equal(lyons.lead, 'outdoors');
  assert.deepEqual(heroLine(lyons, { pick: true }), {
    short: 'The outdoor dates around Lyons, and what’s on this week',
    long: 'The outdoor dates around Lyons, and what’s on this week, with the one we’d go to',
  });
  assert.deepEqual(heroLine(lyons, { pick: false }), {
    short: 'The outdoor dates around Lyons, and what’s on this week',
    long: 'The outdoor dates around Lyons, and what’s on this week',
  });
  assert.deepEqual(heroLine(lyons, { pick: true, changes: false }), heroLine(lyons, { pick: true }));
  // A guide without `lead` is unchanged, whatever else it is.
  assert.deepEqual(heroLine({ name: 'Erie', home: true }, { pick: true }), heroLine({ name: 'Erie', home: true, lead: undefined }, { pick: true }));
  assert.equal(heroLine({ name: 'Erie', home: true })!.short, 'What’s on in Erie this week, and what’s new in town');
  // Every `lead` line fits both widths for every live guide's name, should another take one.
  for (const t of live) {
    for (const lead of ['updates', 'outdoors'] as const) {
      for (const changes of [true, false]) {
        const line = heroLine({ name: t.name, home: true, lead }, { pick: true, changes })!;
        assert.ok(line.short.length <= HERO_LINE_SHORT && line.long.length <= HERO_LINE_LONG, `${t.slug} as ${lead}: ${line.long}`);
      }
    }
  }
});

test('the hero uses the line, and the home tells it whether this week has a pick and Worth knowing has a change', () => {
  const hero = readFileSync('src/components/Hero.astro', 'utf8');
  assert.match(hero, /heroLine\(site, \{ pick: Astro\.props\.pick === true, changes: Astro\.props\.changes !== false \}\)/);
  const home = readFileSync('src/components/home/TownHome.astro', 'utf8');
  // A quiet guide (`lead: 'updates'`, Niwot, 12 November 2026) lists no
  // events, so it never promises a pick.
  // A timely change sits higher on the page than Worth knowing (audit, 13 November 2026); either is a change the line may promise.
  // The H1 is the guide's name as the hub gives it ("Windsor and Severance"; the owner, 13 November 2026).
  assert.match(home, /<Hero compact title=\{guideName\(town, coveredTowns\(town\)\)\} pick=\{!quietGuide && !!pick\} changes=\{know\.length > 0 \|\| timely\.length > 0\} \/>/);
  assert.match(home, /const quietGuide = [^\n]*lead === 'updates'/);
});
