/**
 * A town page's photograph (HubTown.hero, or a showpiece's): three things
 * and no code. The file, its alt text in the config, and its row in
 * IMAGE_LICENSES.csv. An entry may wait for its file (Salida's, 12
 * November 2026, and the Commons picks of 14 November 2026, which
 * scripts/fetch-hub-heroes.ts brings in): the page draws the horizon until
 * then. But a file that is there has its alt and its licence, or the build
 * would publish a picture nobody described or can show the right to.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { HUB_TOWNS, findHubTown, heroOf, heroPath } from '../src/config/hub-towns.ts';
import { creditBeside, parseLedger } from '../src/lib/credits.ts';

const ledger = new Map(parseLedger(readFileSync('IMAGE_LICENSES.csv', 'utf8')).map((r) => [r.path, r]));
const manifest: Array<{ slug: string }> = JSON.parse(readFileSync('scripts/hub-heroes.json', 'utf8')).towns;

test('a town photograph that is on disk has alt text and a licence row; one that is not, the page waits for', () => {
  for (const t of HUB_TOWNS) {
    const hero = heroOf(t);
    if (!hero) continue;
    const path = heroPath(hero);
    if (!existsSync(path)) {
      assert.equal(hero.folder, undefined, `${t.slug}: ${path} is not there; a former guide's hero is used from where it already is`);
      assert.equal(hero.alt, '', `${t.slug}: alt text is written when the photograph arrives, from the photograph`);
      continue;
    }
    assert.ok(hero.alt.trim().length >= 40, `${t.slug}: ${path} is there; write its alt text in src/config/hub-towns.ts`);
    assert.ok(ledger.has(path), `${t.slug}: ${path} has no row in IMAGE_LICENSES.csv`);
  }
});

test('a town page borrows only its own former guide’s hero, and no two pages share a photograph', () => {
  const seen = new Map<string, string>();
  for (const t of HUB_TOWNS) {
    const hero = heroOf(t);
    if (!hero) continue;
    if (hero.folder) assert.equal(hero.folder, t.guide, `${t.slug}: a photograph from content/${hero.folder}/ is another town's`);
    const path = heroPath(hero);
    assert.ok(!seen.has(path), `${t.slug} and ${seen.get(path)} both use ${path}`);
    seen.set(path, t.slug);
  }
});

test('the town page prints no credit, so its photograph is never one whose licence wants the credit beside it', () => {
  for (const t of HUB_TOWNS) {
    const hero = heroOf(t);
    const row = hero && ledger.get(heroPath(hero));
    if (row) assert.ok(!creditBeside(row), `${t.slug}: ${row.path} is an editorial stock photograph; it needs its credit on the picture`);
  }
});

test('every photograph awaited from Commons is in the download list, and the list names only towns waiting for one', () => {
  const listed = new Set(manifest.map((m) => m.slug));
  for (const m of manifest) {
    const t = findHubTown(m.slug);
    assert.ok(t, `scripts/hub-heroes.json: ${m.slug} is not a hub town`);
    assert.equal(t!.hero?.image, `${m.slug}.jpg`, `${m.slug}: set hero: { image: '${m.slug}.jpg', alt: '' } in src/config/hub-towns.ts`);
  }
  for (const t of HUB_TOWNS) {
    if (!t.hero || t.hero.folder || existsSync(heroPath(t.hero))) continue;
    assert.ok(listed.has(t.slug), `${t.slug}: ${heroPath(t.hero)} is awaited but scripts/hub-heroes.json has no source for it`);
  }
});

test('Estes Park has its photograph; Salida’s entry is ready for the owner’s', () => {
  const estes = heroOf(findHubTown('estes-park')!)!;
  assert.ok(existsSync(heroPath(estes)));
  assert.equal(findHubTown('salida')!.showpiece!.hero!.image, 'salida.jpg');
});
