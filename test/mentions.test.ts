import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { articlesMentioning, linkedPlaceSlugs } from '../src/lib/mentions.ts';

const article = (slug: string, date: string, body: string) => ({ slug, body, data: { title: slug, date: new Date(date) } });

test('a place is mentioned when an article links its page, once however often, in order of appearance', () => {
  const body = 'Start at [Sandstone Park](/places/sandstone-park/), eat on [Main Street](/places/main-street/#top), then back to [the park](/places/sandstone-park/).';
  assert.deepEqual(linkedPlaceSlugs(body), ['sandstone-park', 'main-street']);
  assert.deepEqual(linkedPlaceSlugs(undefined), []);
  // Other internal links and external ones are not places.
  assert.deepEqual(linkedPlaceSlugs('[events](/events/) and [the Town](https://www.townoflyons.com/places/x/)'), []);
});

test('the articles that mention a place come newest first, and a name in prose without a link is not a mention', () => {
  const articles = [
    article('older', '2026-09-18', 'The walk ends at [Bohn Park](/places/bohn-park/).'),
    article('newer', '2026-10-07', 'Across the river, [Bohn Park](/places/bohn-park/) has the dog park.'),
    article('prose-only', '2026-10-10', 'Bohn Park is mentioned here but not linked.'),
  ];
  assert.deepEqual(articlesMentioning(articles, 'bohn-park').map((a) => a.slug), ['newer', 'older']);
  assert.deepEqual(articlesMentioning(articles, 'hall-ranch'), []);
});

test('every place an article on disk links to exists in that town', () => {
  const missing: string[] = [];
  for (const town of readdirSync('content')) {
    const dir = join('content', town, 'articles');
    let files: string[];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    const places = new Set(readdirSync(join('content', town, 'places')).map((f) => f.replace(/\.md$/, '')));
    for (const file of files) {
      for (const slug of linkedPlaceSlugs(readFileSync(join(dir, file), 'utf8'))) {
        if (!places.has(slug)) missing.push(`${town}/articles/${file} → /places/${slug}/`);
      }
    }
  }
  assert.deepEqual(missing, []);
});
