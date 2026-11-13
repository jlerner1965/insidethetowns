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

test('a sports page is as new as the run that wrote its data file: the school’s, each team’s, and the index of a town’s several schools', () => {
  const generated = '2026-10-24T17:07:31.253Z';
  const data = (sports: Array<{ key: string; fetched?: string; empty?: string }>) =>
    JSON.stringify({ generated, sports: sports.map((s) => ({ name: s.key, maxprepsUrl: '', results: [], upcoming: [], held: [], notes: [], ...s })) });
  mkdirSync(join(root, 'data', 'berthoud'), { recursive: true });
  writeFileSync(join(root, 'data', 'berthoud', 'sports.json'), data([{ key: 'football', fetched: generated }, { key: 'boys-cross-country', fetched: generated, empty: 'nothing' }, { key: 'wrestling' }]));
  // A town with several schools: Windsor's two (Loveland's four until that
  // guide was folded into its page on the hub on 12 November 2026).
  mkdirSync(join(root, 'data', 'windsor'), { recursive: true });
  writeFileSync(join(root, 'data', 'windsor', 'sports-severance-high.json'), data([{ key: 'football', fetched: generated }]));
  writeFileSync(join(root, 'data', 'windsor', 'sports-windsor-high.json'), data([{ key: 'football', fetched: generated }]).replace(generated, '2026-10-22T17:00:00.000Z'));
  // And the same town with one school's file not yet written.
  const partial = mkdtempSync(join(tmpdir(), 'lastmod-partial-'));
  mkdirSync(join(partial, 'data', 'windsor'), { recursive: true });
  writeFileSync(join(partial, 'data', 'windsor', 'sports-windsor-high.json'), data([{ key: 'football', fetched: generated }]).replace(generated, '2026-10-22T17:00:00.000Z'));

  const berthoud = contentDates({ kind: 'town', slug: 'berthoud' }, root, root);
  assert.equal(berthoud.get('/sports/'), generated);
  assert.equal(berthoud.get('/sports/football/'), generated);
  assert.equal(berthoud.has('/sports/boys-cross-country/'), false, 'a team with nothing has no page');
  assert.equal(berthoud.has('/sports/wrestling/'), false, 'an unread team has no page');

  const windsor = contentDates({ kind: 'town', slug: 'windsor' }, root, root);
  assert.equal(windsor.get('/sports/severance-high/'), generated);
  assert.equal(windsor.get('/sports/severance-high/football/'), generated);
  assert.equal(windsor.get('/sports/windsor-high/'), '2026-10-22T17:00:00.000Z');
  assert.equal(windsor.get('/sports/'), generated, 'the index is as new as the newest school’s run');
  const oneFile = contentDates({ kind: 'town', slug: 'windsor' }, root, partial);
  assert.equal(oneFile.has('/sports/severance-high/'), false, 'no file, the build date stands in');
  assert.equal(oneFile.get('/sports/'), '2026-10-22T17:00:00.000Z', 'the index is dated by the one file there is');
  // A town that follows no school (Longmont's three left with its guide on 12 November 2026) has no sports dates.
  assert.equal(contentDates({ kind: 'town', slug: 'longmont' }, root, root).has('/sports/'), false);
});

test('the hub’s town and season pages are dated by the newest check of their records, not the build', () => {
  const dates = contentDates({ kind: 'hub', slug: 'hub' });
  for (const path of ['/parades-of-lights/', '/estes-park/']) {
    const iso = dates.get(path);
    assert.ok(iso, path);
    assert.ok(iso! <= new Date().toISOString(), `${path} is not in the future`);
  }
});
