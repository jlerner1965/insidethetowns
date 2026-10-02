/**
 * The register is written for us; /credits/ is written for readers. These
 * pin down the translation, and run the real register through it so a row
 * that would print a wrong or empty credit fails here as well as in validate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { licenseName, parseLedger, publicCredit, type LedgerRow } from '../src/lib/credits.ts';

const row = (license: string, source = 'https://commons.wikimedia.org/wiki/File:X.jpg'): LedgerRow => ({
  path: 'content/erie/images/x.jpg',
  town: 'erie',
  file: 'x.jpg',
  source,
  license,
  creditRequired: true,
});

test('quoted fields keep their commas', () => {
  const [r] = parseLedger(
    'path,source_url,license,credit_required (y/n),town\n' +
      'content/lyons/images/downtown.jpg,"https://commons.wikimedia.org/wiki/File:Downtown_Lyons,_CO_IMG_5242.JPG","CC BY-SA 3.0 (Billy Hathorn, 2010)",y,lyons\n',
  );
  assert.equal(r!.source, 'https://commons.wikimedia.org/wiki/File:Downtown_Lyons,_CO_IMG_5242.JPG');
  assert.equal(r!.license, 'CC BY-SA 3.0 (Billy Hathorn, 2010)');
  assert.equal(r!.file, 'downtown.jpg');
  assert.equal(r!.creditRequired, true);
});

test('a Creative Commons row names the author, links the licence and says what changed', () => {
  assert.deepEqual(publicCredit(row('CC BY-SA 2.0 (KimonBerlin via Flickr; 2014); resized to 1600px')), {
    author: 'KimonBerlin',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg',
    changes: 'resized',
  });
  const cropped = publicCredit(row('CC BY 4.0 (Jeffrey Beall; 2017); cropped and resized to 1700px. Came in via townofniwot.com'));
  assert.equal(cropped.licenseUrl, 'https://creativecommons.org/licenses/by/4.0/');
  assert.equal(cropped.changes, 'cropped and resized');
});

test('public domain and CC0 rows', () => {
  assert.equal(publicCredit(row('CC0 (ZoologicalLee; 2021)')).licenseUrl, 'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.equal(
    publicCredit(row('Public Domain Mark 1.0 (City of Greeley, Flickr)')).licenseUrl,
    'https://creativecommons.org/publicdomain/mark/1.0/',
  );
  const pd = publicCredit(row('Public domain (Russell Lee for the Coal Mines Administration, 1946; National Archives 540361)'));
  assert.equal(pd.author, 'Russell Lee for the Coal Mines Administration');
  assert.equal(pd.licenseUrl, undefined);
  // Commons' generic uploader is not a name worth printing.
  assert.equal(publicCredit(row('Public domain (Commons uploader); 717px original')).author, undefined);
});

test('internal notes never reach the reader', () => {
  const erie = publicCredit(row('Town of Erie staff photograph; permission 2026-09-18 — see PERMISSIONS.md, section: x'));
  assert.deepEqual([erie.author, erie.license], ['Town of Erie', 'Used with permission']);
  const berthoud = publicCredit(row('Use authorized by Town of Berthoud Community Engagement Manager via email, 2026-09-21', 'provided directly by Town of Berthoud'));
  assert.deepEqual([berthoud.author, berthoud.sourceUrl], ['Town of Berthoud', undefined]);
  const own = publicCredit(row('owned by the publisher; all rights reserved. EXIF stripped on import', 'photographed by the site owner'));
  assert.deepEqual(own, { author: 'Inside the Towns', license: 'All rights reserved' });
  const johnstown = publicCredit(
    row('Courtesy of the Johnstown Historical Society, Ltd — permission by email 2026-10-02, see PERMISSIONS.md, section: x; resized to 1600px', 'https://jhsco.org/historicwalkingtour/'),
  );
  assert.deepEqual(
    [johnstown.author, johnstown.license, johnstown.sourceUrl, johnstown.changes],
    ['Johnstown Historical Society, Ltd', 'Used with permission', 'https://jhsco.org/historicwalkingtour/', 'resized'],
  );
  const johnstownTown = publicCredit(
    row('Town of Johnstown photograph; sent in reply to the photo request 2026-10-02 — see PERMISSIONS.md, section: x; EXIF stripped on import', 'provided directly by the Town of Johnstown, 2026-10-02'),
  );
  assert.deepEqual([johnstownTown.author, johnstownTown.license, johnstownTown.sourceUrl], ['Town of Johnstown', 'Used with permission', undefined]);
  for (const c of [erie, berthoud, own, johnstown, johnstownTown]) assert.doesNotMatch(JSON.stringify(c), /PERMISSIONS|EXIF|confirm/);
});

test('a row it cannot read is an error, not a blank credit', () => {
  assert.throws(() => publicCredit(row('mystery terms')), /cannot turn the licence/);
  assert.throws(() => publicCredit(row('CC0 placeholder — never ship on a live site')), /cannot turn the licence/);
});

test('licenseName is what a caption must contain', () => {
  assert.equal(licenseName(row('CC BY-SA 3.0 (Jeffrey Beall; 2015)')), 'CC BY-SA 3.0');
  assert.equal(licenseName(row('Public domain (Nyttend)')), undefined);
  assert.equal(licenseName(row('Town of Erie staff photograph; permission')), undefined);
});

test('every row in the real register reads as a public credit', () => {
  const rows = parseLedger(readFileSync(new URL('../IMAGE_LICENSES.csv', import.meta.url), 'utf8'));
  assert.ok(rows.length > 50);
  for (const r of rows.filter((r) => r.path.startsWith('content/'))) {
    const c = publicCredit(r);
    assert.ok(c.license, r.path);
    if (r.creditRequired && licenseName(r)) assert.ok(c.author, `${r.path} needs an author to credit`);
  }
});
