/**
 * The weekly email's editions (src/lib/editions.ts): every guide the email
 * covers is in exactly one, a few guides share one, and the visitor guides
 * and the quiet guide are in none (owner, 12 October 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { editionFor, editionsOf } from '../src/lib/editions.ts';
import { emailEditions, emailTowns, findTown, liveTowns } from '../src/config/index.ts';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';
import type { TownConfig } from '../src/config/towns/types.ts';

const t = (slug: string, name: string, extra: Partial<TownConfig> = {}) => ({ slug, name, ...extra }) as TownConfig;

test('a shared edition holds its towns, the rest are editions of one, A to Z', () => {
  const covered = [t('windsor', 'Windsor'), t('timnath', 'Timnath'), t('erie', 'Erie')];
  const editions = editionsOf(covered, [{ slug: 'windsor-timnath', name: 'Windsor and Timnath', towns: ['windsor', 'timnath'] }]);
  assert.deepEqual(editions.map((e) => e.slug), ['erie', 'windsor-timnath']);
  const shared = editions[1]!;
  assert.equal(shared.shared, true);
  assert.deepEqual(shared.towns.map((x) => x.slug), ['windsor', 'timnath'], 'the lead town first');
  assert.equal(editions[0]!.shared, false);
  assert.equal(editionFor('timnath', editions), shared);
  assert.equal(editionFor('lyons', editions), undefined);
});

test('a shared edition left with one covered town is that town’s own', () => {
  // Timnath quiet: Windsor is not sent an email named for a town it no longer reaches.
  const editions = editionsOf([t('windsor', 'Windsor')], [{ slug: 'windsor-timnath', name: 'Windsor and Timnath', towns: ['windsor', 'timnath'] }]);
  assert.deepEqual(editions.map((e) => [e.slug, e.name, e.shared]), [['windsor', 'Windsor', false]]);
});

test('an edition of one carries its town’s email sponsor; a shared one its own', () => {
  const sponsor = { name: 'A', url: 'https://a.example/' };
  const own = { name: 'B', url: 'https://b.example/' };
  const [solo] = editionsOf([t('erie', 'Erie', { sponsors: { email: sponsor } })]);
  assert.equal(solo!.sponsor, sponsor);
  const [shared] = editionsOf([t('a', 'A', { sponsors: { email: sponsor } }), t('b', 'B')], [{ slug: 'ab', name: 'A and B', towns: ['a', 'b'], sponsor: own }]);
  assert.equal(shared!.sponsor, own);
});

test('the one shared edition left, and ten in all', () => {
  // Three shared and fifteen in all until 20 October 2026: Idaho Springs and
  // Georgetown became one guide, Inside Clear Creek, an edition of one under
  // the Idaho Springs slug; Estes Park, Golden and Evergreen became visitor
  // guides and Grand Lake, Leadville and Nederland went quiet; then Fort
  // Collins, Longmont and Loveland went quiet, which left Johnstown an
  // edition of its own. Golden came back as an edition of its own on 28
  // October 2026, a flagship. On 2 November 2026 Carbon Valley's edition
  // closed with the guide and Lafayette's and Frederick's opened, flagships
  // from the start: ten.
  const editions = emailEditions();
  const shared = editions.filter((e) => e.shared).map((e) => [e.slug, e.towns.map((x) => x.slug)]);
  assert.deepEqual(shared, [
    ['windsor-timnath', ['windsor', 'timnath']],
  ]);
  assert.equal(editions.length, 10);
  // Every covered guide in exactly one edition.
  const placed = editions.flatMap((e) => e.towns.map((x) => x.slug)).sort();
  assert.deepEqual(placed, emailTowns().map((x) => x.slug).sort());
});

test('the configured editions name live guides the email covers, once each, under slugs no town has', () => {
  const configured = hub.newsletter?.editions ?? [];
  const seen = new Set<string>();
  const slugs = new Set(towns.map((x) => x.slug));
  const covered = new Set(emailTowns().map((x) => x.slug));
  for (const e of configured) {
    assert.ok(!slugs.has(e.slug), `${e.slug}: a town's slug, so its draft would overwrite that town's`);
    assert.ok(e.towns.length >= 2, `${e.slug}: an edition of one needs no config`);
    for (const slug of e.towns) {
      assert.ok(findTown(slug), `${e.slug}: no town "${slug}"`);
      assert.ok(covered.has(slug), `${e.slug}: ${slug} is not covered by the email (not live, quiet or a visitor guide)`);
      assert.ok(!seen.has(slug), `${slug} is in two editions`);
      seen.add(slug);
    }
  }
});

test('Estes Park, Evergreen and Manitou Springs are visitor guides, live and out of the email', () => {
  // Black Hawk, Leadville and Manitou Springs until 20 October 2026: Black
  // Hawk became a section of the Idaho Springs guide, which the email covers,
  // Leadville went quiet, and Estes Park, Golden and Evergreen joined Manitou.
  // Golden left on 28 October 2026 as a flagship, back in the email.
  const visitor = towns.filter((x) => x.visitorGuide).map((x) => x.slug).sort();
  assert.deepEqual(visitor, ['estes-park', 'evergreen', 'manitou-springs']);
  assert.ok(editionFor('golden', emailEditions()), 'Golden has its own edition again');
  const live = liveTowns().map((x) => x.slug);
  for (const slug of visitor) {
    assert.ok(live.includes(slug), `${slug} stays live`);
    assert.equal(editionFor(slug, emailEditions()), undefined, `${slug}: no edition`);
  }
});
