/**
 * Exact town-name searches (src/lib/town-search.ts, src/lib/town-search-index.ts):
 * the audit of 13 November 2026 found "Niwot" on the hub led with eight
 * businesses. A query that is a town's name, one of its other names or a
 * region now leads with the town's own destinations. Nothing here is
 * written for one town: every case is read from the configs.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { allSites, liveTowns } from '../src/config/index.ts';
import { HUB_TOWNS } from '../src/config/hub-towns.ts';
import { matchTown, normalizeTownQuery } from '../src/lib/town-search.ts';
import { annualDestination, coveredTowns, guideDestination, townRegions, townSearchIndex } from '../src/lib/town-search-index.ts';

const hub = allSites.find((s) => s.kind === 'hub')!;
const index = townSearchIndex(hub, HUB_TOWNS);

test('a query is read the way a reader means it', () => {
  assert.equal(normalizeTownQuery('  Inside   Niwot '), 'niwot');
  assert.equal(normalizeTownQuery('Estes Park, CO'), 'estes park');
  assert.equal(normalizeTownQuery('Ft. Collins'), 'fort collins');
  assert.equal(normalizeTownQuery('Buena Vista, Colorado'), 'buena vista');
  assert.equal(normalizeTownQuery('Cañon City'), 'canon city');
});

test('every community guide leads its own name, its title and its slug', () => {
  for (const guide of liveTowns()) {
    for (const q of [guide.name, guide.siteTitle, guide.name.toUpperCase()]) {
      const { towns } = matchTown(q, index);
      assert.equal(towns[0]?.url, `https://${guide.domain}/`, `${q} leads with ${guide.siteTitle}`);
      assert.equal(towns[0]?.kind, 'guide');
    }
  }
});

test('a guide answers to the towns it covers, and says so', () => {
  for (const guide of liveTowns()) {
    for (const name of coveredTowns(guide)) {
      const { towns } = matchTown(name, index);
      const hit = towns.find((t) => t.url === `https://${guide.domain}/`);
      assert.ok(hit, `${name} finds ${guide.siteTitle}`);
      assert.match(hit.covers ?? '', new RegExp(name), `${guide.siteTitle} names ${name} among the towns it covers`);
    }
  }
});

test("a retired guide's town and title lead to the guide that took its ground", () => {
  for (const site of allSites) {
    if (site.kind !== 'town' || !site.retired?.successor) continue;
    const successor = liveTowns().find((t) => t.slug === site.retired!.successor);
    if (!successor) continue;
    assert.ok(matchTown(site.name, index).towns.some((t) => t.url === `https://${successor.domain}/`), `${site.name} finds ${successor.siteTitle}`);
    assert.ok(matchTown(site.siteTitle, index).towns.some((t) => t.url === `https://${successor.domain}/`), `${site.siteTitle} finds ${successor.siteTitle}`);
  }
});

test('a town page of annual dates leads its own name, with its two sections', () => {
  for (const town of HUB_TOWNS) {
    const d = matchTown(town.name, index).towns.find((t) => t.url === `/${town.slug}/`);
    assert.ok(d, `${town.name} finds its page`);
    assert.equal(d.kind, 'annual');
    assert.deepEqual(d.shortcuts.map((s) => s.href), [`/${town.slug}/#traditions`, `/${town.slug}/#outdoor-dates`]);
  }
});

test('a guide comes before a page of dates for the same name', () => {
  const both = index.towns.filter((t) => t.kind === 'annual').find((a) => index.towns.some((g) => g.kind === 'guide' && g.terms.some((term) => a.terms.includes(term))));
  if (!both) return;
  const { towns } = matchTown(both.name, index);
  assert.equal(towns[0]!.kind, 'guide');
  assert.ok(towns.some((t) => t.kind === 'annual'));
});

test('a guide shortcut is its menu, on its own domain', () => {
  const guide = liveTowns()[0]!;
  const d = guideDestination(guide, `https://${guide.domain}`);
  assert.ok(d.shortcuts.length >= 4);
  for (const s of d.shortcuts) assert.ok(s.href.startsWith(`https://${guide.domain}/`), s.href);
});

test('a region or a county lists its towns; a partial name or another word matches nothing', () => {
  const county = `${liveTowns()[0]!.counties[0]} County`;
  const { towns, region } = matchTown(county, index);
  assert.equal(towns.length, 0);
  assert.ok(region && region.towns.length > 1, `${county} lists its towns`);
  assert.equal(region.towns[0]!.kind, 'guide', 'the guides first');
  for (const q of ['pizza', liveTowns()[0]!.name.slice(0, 3)]) {
    const none = matchTown(q, index);
    assert.equal(none.towns.length, 0, q);
    assert.equal(none.region, undefined, q);
  }
  assert.equal(townRegions([], [], '').length, 0);
});

test("on a guide's own site the index is the guide alone, at its own paths", () => {
  const guide = liveTowns()[0]!;
  const own = townSearchIndex(guide);
  assert.equal(own.towns.length, 1);
  assert.equal(own.towns[0]!.url, '/');
  assert.equal(own.regions.length, 0);
  assert.equal(annualDestination(HUB_TOWNS[0]!, 'https://insidethetowns.com').url, `https://insidethetowns.com/${HUB_TOWNS[0]!.slug}/`);
});
