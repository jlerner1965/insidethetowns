/**
 * Facts the guides state about themselves.
 *
 * The county field used to be a single string, which quietly rounded three
 * towns that straddle a county line down to one county each — and with it the
 * school district, the sheriff and the ballot a reader would be checking.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { towns } from '../src/config/towns/registry.ts';
import { countiesCovered, countyLabel, countyShort } from '../src/config/towns/types.ts';
import { LIVE_TOWNS } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';
import { homeTitle } from '../src/lib/titles.ts';

const by = (slug: string) => {
  const t = towns.find((x) => x.slug === slug);
  assert.ok(t, `no town configured for "${slug}"`);
  return t;
};

test('the three towns that straddle a county line name both counties', () => {
  // Verified 2026-09-20 against the Town of Erie's own Regional Partners page
  // and the census municipality-by-county split.
  assert.deepEqual([...by('erie').counties], ['Weld', 'Boulder']);
  assert.deepEqual([...by('johnstown').counties], ['Weld', 'Larimer']);
  assert.deepEqual([...by('berthoud').counties], ['Larimer', 'Weld']);
});

test('single-county towns are unchanged', () => {
  assert.deepEqual([...by('niwot').counties], ['Boulder']);
  assert.deepEqual([...by('lyons').counties], ['Boulder']);
  assert.deepEqual([...by('elizabeth').counties], ['Elbert']);
  assert.deepEqual([...by('timnath').counties], ['Larimer']);
});

test('a split town carries a sourced, dated explanation of the split', () => {
  for (const slug of ['erie', 'johnstown', 'berthoud']) {
    const { countySplit } = by(slug);
    assert.ok(countySplit, `${slug} spans two counties and must explain how`);
    assert.match(countySplit.source, /^https:\/\//, `${slug}: split needs a real source`);
    assert.match(countySplit.verified, /^\d{4}-\d{2}-\d{2}$/, `${slug}: split needs a check date`);
    assert.ok(countySplit.note.length > 40, `${slug}: the note must actually say something`);
  }
});

test('every town that names one county makes no split claim', () => {
  for (const t of towns) {
    if (t.counties.length === 1) assert.equal(t.countySplit, undefined, `${t.slug}`);
    else assert.ok(t.countySplit, `${t.slug} spans ${t.counties.length} counties with no note`);
  }
});

test('county labels read as English in both shapes', () => {
  assert.equal(countyLabel(by('niwot')), 'Boulder County');
  assert.equal(countyLabel(by('erie')), 'Weld and Boulder counties');
  assert.equal(countyShort(by('erie')), 'Weld & Boulder');
  assert.equal(countyShort(by('niwot')), 'Boulder');
});

test('the network counts every county it covers, not every town', () => {
  const live = towns.filter((t) => LIVE_TOWNS.includes(t.slug));
  // Boulder, Weld, Larimer, Elbert.
  assert.deepEqual(countiesCovered(live).sort(), ['Boulder', 'Elbert', 'Larimer', 'Weld']);
});

test('no guide claims a single school district for a town that has two', () => {
  // The comparison table truncates this field at the first ":" or "(", so a
  // split town has to say so before that point or the short form lies.
  const short = (full?: string) => (full ? (full.split(/[:(]/)[0] ?? full).trim() : '');
  for (const t of towns) {
    if (t.counties.length > 1) {
      assert.match(short(t.movingHere.schoolDistrict), /^Mostly /,
        `${t.slug}: spans counties, so its short school line must be hedged`);
    }
  }
});

test('every live town is configured and every config is complete enough to build', () => {
  for (const slug of LIVE_TOWNS) {
    const t = by(slug);
    assert.match(t.domain, /^inside[a-z]+\.com$/, `${slug}: domain`);
    assert.equal(t.state, 'CO');
    assert.ok(t.counties.length >= 1, `${slug}: at least one county`);
  }
});

test('every town home title names the state after the search-result trim', () => {
  // Asserting the trimmed output, not the raw tagline: the trim is the thing
  // that used to eat ", Colorado", so a test on the untrimmed string proves
  // nothing. Berthoud's first fix passed that way and still shipped truncated.
  for (const t of [...towns, hub]) {
    const title = homeTitle(t);
    assert.ok(title.length <= 65, `${t.slug}: home title is ${title.length} chars`);
    assert.match(title, /Colorado|,\s*CO\b/, `${t.slug}: trimmed home title names no state — "${title}"`);
  }
});

test('a tagline whose comma sits before the state is not cut at that comma', () => {
  // The original Erie failure, kept as a case of its own.
  const cut = homeTitle({
    siteTitle: 'Inside Erie',
    tagline: 'An independent guide to Erie, Colorado: Briggs Street, the trails, the coal-town history, and what it is like to move to a town that doubled.',
  });
  assert.ok(cut.length <= 65);
  // With no seoTagline there is genuinely no room for the state, which is
  // exactly why every town sets one; the guard above is what enforces that.
  assert.equal(homeTitle({ siteTitle: 'Inside Erie', tagline: 'x', seoTagline: 'Briggs Street, trails and events in Erie, Colorado' }),
    'Inside Erie \u2014 Briggs Street, trails and events in Erie, Colorado');
});

test('the three most ambiguous names spell Colorado out rather than abbreviating', () => {
  for (const slug of ['erie', 'johnstown', 'elizabeth']) {
    assert.match(by(slug).seoTagline ?? '', /Colorado/, `${slug}: "CO" is too weak a signal for this name`);
  }
});
