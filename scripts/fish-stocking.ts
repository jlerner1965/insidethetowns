#!/usr/bin/env node
/**
 * Reads Colorado Parks and Wildlife's trout stocking report into
 * data/hub/fish-stocking.json, for the "Recently stocked near <Town>"
 * block on the hub's town pages (src/lib/fish-stocking.ts).
 *
 *   node scripts/fish-stocking.ts            # read and print what would change
 *   node scripts/fish-stocking.ts --write    # and write the file
 *
 * One public page, read once a run with a plain GET; CPW's robots.txt does
 * not exclude it. A failed read, or a page whose table has gone, changes
 * nothing: the last good file stays, the pages stop showing it once it is
 * two weeks old, and the run exits 0 so the workflow's other steps and the
 * build are not broken by CPW's site having a bad morning.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseStockingReport, STOCKING_SOURCE, type StockingData } from '../src/lib/fish-stocking.ts';
import { HUB_TOWNS } from '../src/config/hub-towns.ts';

const FILE = 'data/hub/fish-stocking.json';
const write = process.argv.includes('--write');
const today = new Date().toISOString().slice(0, 10);

function keep(why: string): never {
  console.log(`fish-stocking: ${why}; ${existsSync(FILE) ? `keeping ${FILE} as it is` : 'no file written'}`);
  process.exit(0);
}

let html = '';
try {
  const res = await fetch(STOCKING_SOURCE, { redirect: 'follow', headers: { 'user-agent': 'insidethetowns.com stocking report reader (weekly)' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) keep(`CPW answered ${res.status}`);
  html = await res.text();
} catch (error) {
  keep(`could not reach CPW (${error instanceof Error ? error.message : String(error)})`);
}

let rows;
try {
  rows = parseStockingReport(html);
} catch (error) {
  keep(`could not read the report (${error instanceof Error ? error.message : String(error)})`);
}

const data: StockingData = { source: STOCKING_SOURCE, fetched: today, rows };
const watched = new Set(HUB_TOWNS.flatMap((t) => (t.signature?.kind === 'fish-stocking' ? t.signature.waters.flatMap((w) => w.ids) : [])));
const newest = rows.reduce((max, r) => (r.added > max ? r.added : max), '');
console.log(`fish-stocking: ${rows.length} rows, newest ${newest}; ${rows.filter((r) => watched.has(r.id)).length} are waters a town page watches`);

const before = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, 'utf8')) as StockingData) : undefined;
if (before && JSON.stringify(before.rows) === JSON.stringify(rows) && before.fetched === today) keep('nothing changed');
if (!write) {
  console.log('fish-stocking: dry run; pass --write to save');
  process.exit(0);
}
mkdirSync(dirname(FILE), { recursive: true });
writeFileSync(FILE, `${JSON.stringify(data, null, 1)}\n`);
console.log(`fish-stocking: wrote ${FILE}`);
