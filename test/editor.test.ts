/**
 * The masthead slot.
 *
 * "Independent" is the claim this network rests on, and an invented editor
 * would make it a lie — so everything that would name a person stays dark
 * until a real name and a real biography are configured. These check both
 * states, because the empty one is the one that ships today.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hub } from '../src/config/towns/hub.ts';
import { articleJsonLd } from '../src/lib/seo.ts';
import { articleSchema } from '../src/content/schemas.ts';
import { z } from 'astro/zod';

const site = { kind: 'town', domain: 'insideniwot.com', siteTitle: 'Inside Niwot' } as never;
const article = {
  data: { title: 'A piece', excerpt: 'x', date: new Date('2026-09-20T12:00:00Z'), category: 'Community', tags: [] },
} as never;

/** Run `fn` with an editor configured, then put the config back. */
function withEditor<T>(editor: NonNullable<typeof hub.editor>, fn: () => T): T {
  const before = hub.editor;
  hub.editor = editor;
  try {
    return fn();
  } finally {
    hub.editor = before;
  }
}

test('with no editor configured, the publication is the author', () => {
  assert.equal(hub.editor, undefined, 'none is set today; this test documents that state');
  const d = articleJsonLd(site, article, 'https://insideniwot.com/articles/a/') as never as {
    author: Record<string, string>;
  };
  assert.deepEqual(d.author, { '@id': 'https://insideniwot.com/#org' });
});

test('with an editor configured, the person is named', () => {
  const d = withEditor(
    { name: 'A Real Person', bio: 'Two sentences they wrote themselves.', url: 'https://example.org/me' },
    () => articleJsonLd(site, article, 'https://insideniwot.com/articles/a/'),
  ) as never as { author: Record<string, string> };
  assert.equal(d.author['@type'], 'Person');
  assert.equal(d.author.name, 'A Real Person');
  assert.equal(d.author.url, 'https://example.org/me');
});

test('an editor without a page is named without one invented', () => {
  const d = withEditor({ name: 'A Real Person', bio: 'Their words.' }, () =>
    articleJsonLd(site, article, 'https://insideniwot.com/articles/a/'),
  ) as never as { author: Record<string, string> };
  assert.equal(d.author.name, 'A Real Person');
  assert.equal('url' in d.author, false);
});

test('the publisher stays the publication either way', () => {
  const org = { '@id': 'https://insideniwot.com/#org' };
  const unset = articleJsonLd(site, article, 'https://x/') as never as { publisher: unknown };
  assert.deepEqual(unset.publisher, org);
  const set = withEditor({ name: 'P', bio: 'b' }, () => articleJsonLd(site, article, 'https://x/')) as never as {
    publisher: unknown;
  };
  assert.deepEqual(set.publisher, org);
});

const schema = articleSchema(() => z.string());
const baseArticle = {
  title: 'A piece',
  date: '2026-09-20',
  excerpt: 'A summary.',
  category: 'Community',
};

test('sponsored and contributed articles require an identified party', () => {
  assert.equal(schema.safeParse({ ...baseArticle, contribution: { type: 'sponsored' } }).success, false);
  assert.equal(
    schema.safeParse({ ...baseArticle, contribution: { type: 'sponsored', name: 'Local Sponsor' } }).success,
    true,
  );
  assert.equal(
    schema.safeParse({ ...baseArticle, contribution: { type: 'contributed', name: 'Community Group' } }).success,
    true,
  );
});

test('a material correction requires a matching updated date', () => {
  const correction = { date: '2026-09-21', note: 'Corrected the meeting date.' };
  assert.equal(schema.safeParse({ ...baseArticle, corrections: [correction] }).success, false);
  assert.equal(schema.safeParse({ ...baseArticle, updated: '2026-09-21', corrections: [correction] }).success, true);
  assert.equal(schema.safeParse({ ...baseArticle, updated: '2026-09-20', corrections: [correction] }).success, false);
});
