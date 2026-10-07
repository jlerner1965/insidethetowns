/**
 * The sitemap's lastmod: a listing's check date, an article's check, update
 * or publish date, else the build. Read from the markdown the way the config
 * reads it, before the collections exist.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseLocal } from '../src/lib/dates.ts';
import { contentDates, lastmodFor } from '../src/lib/lastmod.ts';

const root = mkdtempSync(join(tmpdir(), 'lastmod-'));
const write = (rel: string, fm: string) => {
  mkdirSync(join(root, rel, '..'), { recursive: true });
  writeFileSync(join(root, rel), `---\n${fm}\n---\nbody\n`);
};
write('lyons/events/market.md', 'title: "Market"\nverified: "2026-10-03"');
write('lyons/events/renamed.md', 'title: "Renamed"\nslug: "other-name"\nverified: "2026-09-30"');
write('lyons/events/unchecked.md', 'title: "Unchecked"');
write('lyons/places/cafe.md', 'title: "Café"\nverified: "2026-10-01"');
write('lyons/articles/checked.md', 'title: "A"\ndate: "2026-09-01"\nupdated: "2026-09-10"\nverified: "2026-09-20"');
write('lyons/articles/updated.md', 'title: "B"\ndate: "2026-09-01"\nupdated: "2026-09-10"');
write('lyons/articles/fresh.md', 'title: "C"\ndate: "2026-09-01"');
write('lyons/articles/_draft.md', 'title: "D"\ndate: "2026-09-01"');
write('hub/issues/2026-10-01.md', 'title: "Issue"\ndate: "2026-10-01"');

const iso = (s: string) => parseLocal(s).toISOString();

test('events and places change when they were last checked; the slug field wins over the file name', () => {
  const dates = contentDates({ kind: 'town', slug: 'lyons' }, root);
  assert.equal(dates.get('/events/market/'), iso('2026-10-03'));
  assert.equal(dates.get('/events/other-name/'), iso('2026-09-30'));
  assert.equal(dates.get('/places/cafe/'), iso('2026-10-01'));
  assert.equal(dates.has('/events/unchecked/'), false, 'no date: the build date stands in');
});

test('an article changes when checked, else when updated, else when published; drafts are not pages', () => {
  const dates = contentDates({ kind: 'town', slug: 'lyons' }, root);
  assert.equal(dates.get('/articles/checked/'), iso('2026-09-20'));
  assert.equal(dates.get('/articles/updated/'), iso('2026-09-10'));
  assert.equal(dates.get('/articles/fresh/'), iso('2026-09-01'));
  assert.equal(dates.has('/articles/_draft/'), false);
});

test('the hub dates its issues; everything else is as new as the build', () => {
  const dates = contentDates({ kind: 'hub', slug: 'hub' }, root);
  assert.equal(dates.get('/newsletter/2026-10-01/'), iso('2026-10-01'));
  const build = new Date('2026-10-07T11:10:00Z');
  assert.equal(lastmodFor('https://insidethetowns.com/this-weekend/', dates, build), build.toISOString());
  assert.equal(lastmodFor('https://insidethetowns.com/newsletter/2026-10-01/', dates, build), iso('2026-10-01'));
});
