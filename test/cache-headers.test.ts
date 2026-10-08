/**
 * Vercel puts a path's headers on every response for it, a 404 included. A
 * year-long, immutable Cache-Control under /_astro/ turned one missed
 * stylesheet into a page with no CSS for as long as the browser kept the 404:
 * on 8 October, after a deploy renamed Base.css, insidefortlupton.com showed
 * bare HTML to a visitor while it rendered for everyone else.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

interface Rule {
  source: string;
  headers: Array<{ key: string; value: string }>;
}
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as { headers: Rule[] };

/** The Cache-Control a path is served with: the last matching rule wins, as on Vercel. */
function cacheControl(path: string): string | undefined {
  let value: string | undefined;
  for (const rule of config.headers) {
    if (!new RegExp(`^${rule.source.replace(/\(\.\*\)$/, '.*')}$`).test(path)) continue;
    const header = rule.headers.find((h) => h.key.toLowerCase() === 'cache-control');
    if (header) value = header.value;
  }
  return value;
}

const maxAge = (value = '') => Number(/max-age=(\d+)/.exec(value)?.[1] ?? NaN);

test('no rule caches anything as immutable', () => {
  for (const rule of config.headers) {
    for (const h of rule.headers) assert.doesNotMatch(h.value, /immutable/, rule.source);
  }
});

test('a built asset is cached an hour at most, so a missed file comes back by itself', () => {
  const value = cacheControl('/_astro/Base.DLI4aUY1.css');
  assert.ok(maxAge(value) > 0 && maxAge(value) <= 3600, value);
});

test("the search index's fixed-name files are checked on every load", () => {
  // pagefind-entry.json names the current index by hash; a cached copy
  // outlives the index it names and the next search asks for files that
  // are gone.
  for (const path of ['/pagefind/pagefind.js', '/pagefind/pagefind-entry.json']) {
    assert.equal(cacheControl(path), 'public, max-age=0, must-revalidate', path);
  }
});
