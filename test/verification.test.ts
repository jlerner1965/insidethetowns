import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VERIFICATION_VARS, verificationTags } from '../src/lib/verification.ts';

test('a verification token in the environment becomes the search engine’s meta tag, and nothing else does', () => {
  assert.deepEqual(verificationTags({}), []);
  assert.deepEqual(verificationTags({ GOOGLE_SITE_VERIFICATION: '  ' }), []);
  assert.deepEqual(verificationTags({ GOOGLE_SITE_VERIFICATION: 'abc-DEF_123=' }), [
    { name: 'google-site-verification', content: 'abc-DEF_123=' },
  ]);
  assert.deepEqual(verificationTags({ BING_SITE_VERIFICATION: 'ABCDEF0123456789' }), [{ name: 'msvalidate.01', content: 'ABCDEF0123456789' }]);
  // Both, in a fixed order, so the head does not reorder between builds.
  assert.deepEqual(
    verificationTags({ BING_SITE_VERIFICATION: 'b', GOOGLE_SITE_VERIFICATION: 'g', TOWN: 'niwot' }).map((t) => t.name),
    ['google-site-verification', 'msvalidate.01'],
  );
});

test('a value that is not a token is refused rather than written into the head', () => {
  assert.deepEqual(verificationTags({ GOOGLE_SITE_VERIFICATION: '"><script>' }), []);
  assert.deepEqual(verificationTags({ GOOGLE_SITE_VERIFICATION: '<meta name=x content=y>' }), []);
  assert.deepEqual(verificationTags({ GOOGLE_SITE_VERIFICATION: 'two words' }), []);
});

test('no verification token is written into the repository', () => {
  // The variables are read from the environment and documented by name; a
  // token pasted into a config or a page would verify every town as one
  // property and be impossible to rotate without a commit.
  for (const file of ['src/layouts/Base.astro', 'src/lib/verification.ts', 'docs/SEARCH-VISIBILITY.md', 'DEPLOY.md']) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /content="[A-Za-z0-9_-]{20,}"/, `${file} carries what looks like a token`);
    // The map in verification.ts names each variable's tag; a tag name is not a token.
    assert.doesNotMatch(
      text,
      /(?:GOOGLE|BING)_SITE_VERIFICATION\s*[=:]\s*["']?(?!google-site-verification|msvalidate\.01)[A-Za-z0-9_-]{16,}/,
      `${file} assigns a token`,
    );
  }
  assert.deepEqual(Object.keys(VERIFICATION_VARS), ['GOOGLE_SITE_VERIFICATION', 'BING_SITE_VERIFICATION']);
});

test('the layout reads the tokens from the build’s environment, where Vercel puts them', async () => {
  const { readFileSync } = await import('node:fs');
  const layout = readFileSync('src/layouts/Base.astro', 'utf8');
  // import.meta.env as a whole object holds only the variables Astro knows
  // of; a token set in a Vercel project never reached the page that way.
  assert.match(layout, /verificationTags\(process\.env\)/);
  assert.doesNotMatch(layout, /verificationTags\(import\.meta\.env\)/);
});
