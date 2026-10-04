/**
 * The scripts' small frontmatter reader. It has to read every shape the
 * content uses, and the staging `review` line and the mountain `seasonal`
 * block are inline maps, which it did not read before.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const parse = (yaml: string) => parseFrontmatter(`---\n${yaml}\n---\nbody`).data;

test('scalars, quoted strings, inline and block lists, as before', () => {
  const d = parse(`title: "A, b: c"\nfeatured: true\nn: 3\ntags: [a, "b c", 2]\nsources:\n  - { label: "Town", url: "https://t.gov/" }\n  - plain`);
  assert.equal(d.title, 'A, b: c');
  assert.equal(d.featured, true);
  assert.equal(d.n, 3);
  assert.deepEqual(d.tags, ['a', 'b c', 2]);
  assert.deepEqual(d.sources, [{ label: 'Town', url: 'https://t.gov/' }, 'plain']);
});

test('an inline map at the top level, with commas and colons inside its strings', () => {
  const d = parse(`review: { reason: "No site: call (970) 555-0100, ask for hours", since: "2026-10-03", from: migration }`);
  assert.deepEqual(d.review, { reason: 'No site: call (970) 555-0100, ask for hours', since: '2026-10-03', from: 'migration' });
});

test('a list inside an inline map is not split at its commas', () => {
  const d = parse(`seasonal: { season: "May–Oct", hours: "Daily 9–5", closedMonths: [Nov, Dec, Jan] }`);
  assert.deepEqual(d.seasonal, { season: 'May–Oct', hours: 'Daily 9–5', closedMonths: ['Nov', 'Dec', 'Jan'] });
  assert.deepEqual(parse('empty: {}').empty, {});
  assert.deepEqual(parse('empty: []').empty, []);
});

test('an escaped quote inside a quoted value of an inline map does not end the value', () => {
  const d = parse(`review: { reason: "venue read from \\"Council Chambers, 645 Holbrook Street\\". category guessed", since: "2026-10-04", from: ingest }`);
  assert.deepEqual(d.review, { reason: 'venue read from "Council Chambers, 645 Holbrook Street". category guessed', since: '2026-10-04', from: 'ingest' });
});
