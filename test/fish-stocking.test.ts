/**
 * "Recently stocked near <Town>" (src/lib/fish-stocking.ts): reading CPW's
 * table, matching a town's waters by Atlas id, and showing nothing out of
 * season, on an old file, or when no water matches.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { RECENT_DAYS, parseStockingReport, recentlyStocked, reportDay, type StockingData } from '../src/lib/fish-stocking.ts';
import { HUB_TOWNS } from '../src/config/hub-towns.ts';

const cell = (label: string, value: string) => `<td><span aria-hidden="true"><p><b>${label}</b></p></span>${value}</td>`;
const tr = (name: string, region: string, date: string, id: number) =>
  `<tr>\n<th>${name}</th>\n${cell('Body of Water', region)}\n${cell('Region', date)}\n${cell('Report Date', `<a href="http://ndismaps.nrel.colostate.edu/fishingatlas/index.aspx?keyword=fspot&amp;value=${id}">Atlas</a>`)}\n</tr>`;
const page = (rows: string) =>
  `<html><body><div class="coh-style-data-table"><table>\n<caption>Trout Stocking Report</caption>\n<thead><tr><th><strong>Body of Water</strong></th><th><strong>Region</strong></th><th><strong>Report Date</strong></th><th><strong>Link</strong></th></tr></thead>\n<tbody>\n${rows}\n</tbody></table></div></body></html>`;

test('the report’s rows are read as CPW marks them up: name, region, date, Atlas id', () => {
  const rows = parseStockingReport(page([tr('Grand Lake', 'northwest', '11/6/2026', 83), tr('Lon Hagler reservoir', 'northeast', '10/9/2026', 450), tr('Roan&#039;s Pothole', 'northwest', '10/30/2026', 1614)].join('\n')));
  assert.deepEqual(rows[0], { id: 83, name: 'Grand Lake', region: 'northwest', added: '2026-11-06' });
  assert.deepEqual(rows[1], { id: 450, name: 'Lon Hagler reservoir', region: 'northeast', added: '2026-10-09' });
  assert.equal(rows[2]!.name, 'Roan’s Pothole');
  // The header row has no link and is not a row.
  assert.equal(rows.length, 3);
});

test('a row without a date that parses or an Atlas id is skipped; a page without the table is refused', () => {
  const rows = parseStockingReport(page([tr('Good Lake', 'northeast', '11/6/2026', 5), tr('Bad Date', 'northeast', 'soon', 6), tr('Not A Day', 'northeast', '2/30/2026', 7)].join('\n')));
  assert.deepEqual(rows.map((r) => r.name), ['Good Lake']);
  assert.throws(() => parseStockingReport('<html><body><p>Maintenance</p></body></html>'), /not on the page/);
  assert.throws(() => parseStockingReport(page('')), /no row/);
  assert.equal(reportDay('11/6/2026'), '2026-11-06');
  assert.equal(reportDay('13/1/2026'), undefined);
});

const data = (rows: StockingData['rows'], fetched = '2026-11-12'): StockingData => ({ source: 'x', fetched, rows });
const grandLake = [{ name: 'Grand Lake', ids: [83] }];
const r = (id: number, added: string, name = `water ${id}`) => ({ id, name, region: 'northwest', added });

test('a town’s water is matched by id, shown once at its latest date, under the town’s own name for it', () => {
  const lines = recentlyStocked([{ name: 'Lon Hagler Reservoir', ids: [450] }, { name: 'Sheldon Lake', ids: [550] }], data([r(450, '2026-10-09', 'Lon Hagler reservoir'), r(450, '2026-10-30', 'Lon Hagler Reservoir'), r(550, '2026-11-06'), r(999, '2026-11-06')]), '2026-11-12');
  assert.deepEqual(lines.map((l) => [l.name, l.added]), [['Sheldon Lake', '2026-11-06'], ['Lon Hagler Reservoir', '2026-10-30']]);
  assert.match(lines[0]!.atlas, /fspot&value=550$/);
});

test('nothing is shown when no water matches, the addition is old, or the town watches none', () => {
  assert.deepEqual(recentlyStocked(grandLake, data([r(1, '2026-11-06')]), '2026-11-12'), []);
  assert.deepEqual(recentlyStocked([], data([r(83, '2026-11-06')]), '2026-11-12'), []);
  // Added more than RECENT_DAYS ago, while the report itself is current.
  assert.equal(RECENT_DAYS, 30);
  assert.deepEqual(recentlyStocked(grandLake, data([r(83, '2026-10-02'), r(1, '2026-11-06')]), '2026-11-12'), []);
  assert.equal(recentlyStocked(grandLake, data([r(83, '2026-10-16'), r(1, '2026-11-06')]), '2026-11-12').length, 1);
});

test('nothing is shown out of season, on a file not read lately, or with no file', () => {
  // The report's newest date is weeks old: the season is over, whatever the town's own row says.
  assert.deepEqual(recentlyStocked(grandLake, data([r(83, '2026-11-06')], '2026-12-05'), '2026-12-05'), []);
  // In season, but the last good read is too old to trust (the fetch has been failing).
  assert.deepEqual(recentlyStocked(grandLake, data([r(83, '2026-11-06')], '2026-10-20'), '2026-11-12'), []);
  assert.deepEqual(recentlyStocked(grandLake, undefined, '2026-11-12'), []);
  assert.deepEqual(recentlyStocked(grandLake, data([]), '2026-11-12'), []);
});

test('the config maps waters by hand: named, with ids, no water watched by two towns', () => {
  const seen = new Map<number, string>();
  let towns = 0;
  for (const t of HUB_TOWNS) {
    if (t.signature?.kind !== 'fish-stocking') continue;
    towns++;
    assert.ok(t.signature.waters.length > 0, t.slug);
    for (const w of t.signature.waters) {
      assert.ok(w.name.length > 3 && w.ids.length > 0, `${t.slug}: ${w.name}`);
      for (const id of w.ids) {
        assert.equal(seen.get(id), undefined, `${t.slug}: water ${id} is also ${seen.get(id)}'s`);
        seen.set(id, t.slug);
      }
    }
  }
  assert.ok(towns > 0 && towns < HUB_TOWNS.length, 'a signature is optional: some towns have one and some do not');
});

test('the data file on disk, where there is one, is what the reader writes', () => {
  if (!existsSync('data/hub/fish-stocking.json')) return;
  const file = JSON.parse(readFileSync('data/hub/fish-stocking.json', 'utf8')) as StockingData;
  assert.match(file.fetched, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(file.source, /^https:\/\/cpw\.state\.co\.us\//);
  for (const row of file.rows) {
    assert.ok(Number.isInteger(row.id) && row.name, JSON.stringify(row));
    assert.match(row.added, /^\d{4}-\d{2}-\d{2}$/);
  }
});
