/**
 * A re-filed listing's old URLs (src/lib/former-slugs.ts): read from the
 * front matter, turned into redirects, never shadowing a live page. The
 * Search Console read of 5 November 2026 found nine 404s with traffic, most
 * of them events the editor had merged under a new slug.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { formerSlugRedirects, formerSlugs, parseFormerSlugs } from '../src/lib/former-slugs.ts';

test('formerSlugs reads as an inline list or a block list, quoted or not, and nothing when absent', () => {
  assert.deepEqual(parseFormerSlugs('title: "x"\nformerSlugs: [old-one, "old-two"]\nstart: "2026-11-06"'), ['old-one', 'old-two']);
  assert.deepEqual(parseFormerSlugs('title: "x"\nformerSlugs:\n  - old-one\n  - "old-two"\nstart: "2026-11-06"'), ['old-one', 'old-two']);
  assert.deepEqual(parseFormerSlugs('title: "x"\nstart: "2026-11-06"'), []);
});

test('each former slug becomes a redirect to the listing that holds it; a slug a live listing still uses is left to that listing', () => {
  const root = mkdtempSync(join(tmpdir(), 'former-slugs-'));
  const events = join(root, 'berthoud', 'events');
  const places = join(root, 'berthoud', 'places');
  mkdirSync(events, { recursive: true });
  mkdirSync(places, { recursive: true });
  writeFileSync(join(events, 'cabaret-release-with-johnny-johnston-2026-11-06.md'), '---\ntitle: "Cabaret release with Johnny Johnston"\nformerSlugs: [beer-release-cabaret-2026-11-06, johnny-johnston-2026-11-06, trivia-night]\n---\n');
  writeFileSync(join(events, 'trivia-night.md'), '---\ntitle: "Trivia"\n---\n');
  writeFileSync(join(events, 'renamed.md'), '---\ntitle: "Renamed"\nslug: "new-name"\nformerSlugs:\n  - old-name\n---\n');
  writeFileSync(join(places, 'chelos.md'), '---\ntitle: "Chelo\'s"\nformerSlugs: [chelos-modern-mexican]\n---\n');
  const warned: string[] = [];
  const warn = console.warn;
  console.warn = (m: string) => void warned.push(m);
  try {
    const found = formerSlugs('berthoud', root);
    assert.deepEqual(
      found.sort((a, b) => a.from.localeCompare(b.from)),
      [
        { kind: 'events', from: 'beer-release-cabaret-2026-11-06', to: 'cabaret-release-with-johnny-johnston-2026-11-06' },
        { kind: 'places', from: 'chelos-modern-mexican', to: 'chelos' },
        { kind: 'events', from: 'johnny-johnston-2026-11-06', to: 'cabaret-release-with-johnny-johnston-2026-11-06' },
        { kind: 'events', from: 'old-name', to: 'new-name' },
      ],
    );
    assert.equal(warned.length, 1, 'trivia-night is a live listing and keeps its URL');
    assert.match(warned[0]!, /trivia-night/);
    assert.deepEqual(formerSlugRedirects('berthoud', root), {
      '/events/beer-release-cabaret-2026-11-06': '/events/cabaret-release-with-johnny-johnston-2026-11-06/',
      '/events/johnny-johnston-2026-11-06': '/events/cabaret-release-with-johnny-johnston-2026-11-06/',
      '/events/old-name': '/events/new-name/',
      '/places/chelos-modern-mexican': '/places/chelos/',
    });
  } finally {
    console.warn = warn;
  }
  assert.deepEqual(formerSlugs('nowhere', root), [], 'a town with no content has no redirects');
});
