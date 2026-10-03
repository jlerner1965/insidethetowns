/**
 * A permanently closed place: its page stays, with the notice, and it leaves
 * every list, the search index and the sitemap. The sitemap decides from the
 * raw markdown before the collections exist and the page from the parsed
 * entry, so the two readings are checked against each other over every
 * listing in the repository.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { closedPlaceSlugs } from '../src/lib/raw-places.ts';
import { presentation } from '../src/lib/freshness.ts';
import { PLACE_STATUS_LABELS, placeSchema } from '../src/content/schemas.ts';
import { towns } from '../src/config/towns/registry.ts';
import { hub } from '../src/config/towns/hub.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const schema = placeSchema(() => z.string());

test('the sitemap and the page agree on which places are closed', () => {
  let checked = 0;
  for (const town of towns) {
    const dir = join('content', town.slug, 'places');
    if (!existsSync(dir)) continue;
    const fromRaw = closedPlaceSlugs(town.slug);
    const fromParsed = new Set<string>();
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue;
      const parsed = schema.safeParse(parseFrontmatter(readFileSync(join(dir, file), 'utf8')).data);
      if (!parsed.success) continue;
      checked++;
      if (presentation(parsed.data, town.variant).delist) fromParsed.add(parsed.data.slug ?? file.slice(0, -3));
    }
    assert.deepEqual([...fromRaw].sort(), [...fromParsed].sort(), `${town.slug}: sitemap and page disagree on closed places`);
  }
  assert.ok(checked > 300, `only ${checked} places checked`);
});

test('a closed place says so in words a reader cannot misread', () => {
  assert.equal(PLACE_STATUS_LABELS.closed, 'Permanently closed');
  assert.equal(PLACE_STATUS_LABELS['temporarily-closed'], 'Temporarily closed');
});

test('corrections have somewhere to go', () => {
  assert.equal(hub.correctionsEmail, 'hello@insidethetowns.com');
});
