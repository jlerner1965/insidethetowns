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

/** Run `fn` with no editor configured, then put the config back. */
function withoutEditor<T>(fn: () => T): T {
  const before = hub.editor;
  hub.editor = undefined;
  try {
    return fn();
  } finally {
    hub.editor = before;
  }
}

test('with no editor configured, the publication is the author', () => {
  const d = withoutEditor(() => articleJsonLd(site, article, 'https://insideniwot.com/articles/a/')) as never as {
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

test('the check lines name the editor by first name, show a bracketed placeholder as written, and say nothing with no editor', async () => {
  const { checkedBy, checkerName, isPlaceholder } = await import('../src/lib/editor.ts');
  assert.equal(isPlaceholder('[FULL NAME]'), true);
  assert.equal(isPlaceholder('James Lerner'), false);
  assert.equal(checkerName({ name: 'James Lerner', bio: 'x' }), 'James');
  assert.equal(checkerName({ name: '[FULL NAME]', bio: 'x' }), '[FIRST NAME]');
  assert.equal(withoutEditor(() => checkerName()), undefined);
  assert.equal(checkedBy('October 3, 2026', 'James'), 'Checked by James, October 3, 2026');
  assert.equal(withoutEditor(() => checkedBy('October 3, 2026')), 'Checked October 3, 2026');
});

test('a placeholder editor is not asserted as the author in structured data', () => {
  const ld = withEditor({ name: '[FULL NAME]', bio: '[BIO]' }, () => articleJsonLd(site, article, 'https://insideniwot.com/articles/a-piece/'));
  assert.deepEqual(ld.author, { '@id': 'https://insideniwot.com/#org' });
});
