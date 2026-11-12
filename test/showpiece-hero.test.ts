/**
 * A town page's photograph (HubTown.showpiece.hero): three things and no
 * code. The file in content/hub/images/, its alt text in the config, and
 * its row in IMAGE_LICENSES.csv. An entry may wait for its file (Salida's,
 * 12 November 2026): the page draws the horizon until then. But a file
 * that is there has its alt and its licence, or the build would publish a
 * picture nobody described or can show the right to.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { HUB_TOWNS, findHubTown } from '../src/config/hub-towns.ts';

const ledger = readFileSync('IMAGE_LICENSES.csv', 'utf8');

test('a showpiece photograph that is on disk has alt text and a licence row; one that is not, the page waits for', () => {
  for (const t of HUB_TOWNS) {
    const hero = t.showpiece?.hero;
    if (!hero) continue;
    const path = `content/hub/images/${hero.image}`;
    if (!existsSync(path)) {
      assert.equal(hero.alt, '', `${t.slug}: alt text is written when the photograph arrives, from the photograph`);
      continue;
    }
    assert.ok(hero.alt.trim().length >= 40, `${t.slug}: ${path} is there; write its alt text in src/config/hub-towns.ts`);
    assert.ok(ledger.includes(`\n${path},`), `${t.slug}: ${path} has no row in IMAGE_LICENSES.csv`);
  }
});

test('Estes Park has its photograph; Salida’s entry is ready for one', () => {
  assert.ok(existsSync(`content/hub/images/${findHubTown('estes-park')!.showpiece!.hero!.image}`));
  assert.equal(findHubTown('salida')!.showpiece!.hero!.image, 'salida.jpg');
});
