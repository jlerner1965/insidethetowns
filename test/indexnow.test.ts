/**
 * IndexNow (scripts/indexnow.ts, scripts/lib/indexnow.ts): the key every
 * site serves, and which pages a run sends. Bing Webmaster Tools'
 * recommendation for Berthoud, 5 November 2026.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { accepted, CALENDAR_PATHS, verificationPending, INDEXNOW_KEY, sitemapEntries, sitemapLocs, submission, urlsToSubmit } from '../scripts/lib/indexnow.ts';

test('the key file is in public/, so every site serves it, and holds the key and nothing else', () => {
  assert.match(INDEXNOW_KEY, /^[a-zA-Z0-9-]{8,128}$/, 'the protocol’s form for a key');
  assert.equal(readFileSync(`public/${INDEXNOW_KEY}.txt`, 'utf8').trim(), INDEXNOW_KEY);
  // One key, one file: a second .txt of 32 hex characters would be an old key left behind.
  const keys = readdirSync('public').filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  assert.deepEqual(keys, [`${INDEXNOW_KEY}.txt`]);
});

test('a sitemap index and a sitemap are read as the site publishes them', () => {
  const index = '<sitemapindex><sitemap><loc>https://x.com/sitemap-0.xml</loc><lastmod>2026-11-05T19:03:03.654Z</lastmod></sitemap></sitemapindex>';
  assert.deepEqual(sitemapLocs(index), ['https://x.com/sitemap-0.xml']);
  const map = '<urlset><url><loc>https://x.com/</loc><lastmod>B</lastmod></url><url><loc>https://x.com/about/</loc></url></urlset>';
  assert.deepEqual([...sitemapEntries(map)], [['https://x.com/', 'B'], ['https://x.com/about/', '']]);
});

test('a run sends what is new, what is gone and what changed, not every page the rebuild re-dated', () => {
  const page = (path: string) => `https://insideberthoud.com${path}`;
  const before = new Map([
    [page('/'), 'build-1'],
    [page('/about/'), 'build-1'],
    [page('/events/trivia/'), '2026-11-01'],
    [page('/places/a-and-w/'), '2026-10-20'],
    [page('/places/closed-now/'), '2026-10-01'],
  ]);
  const after = new Map([
    [page('/'), 'build-2'],
    [page('/about/'), 'build-2'],
    [page('/events/trivia/'), '2026-11-05'],
    [page('/places/a-and-w/'), '2026-10-20'],
    [page('/events/new-one/'), '2026-11-05'],
  ]);
  const dated = (path: string) => path.startsWith('/events/') || path.startsWith('/places/');
  assert.deepEqual(urlsToSubmit(undefined, after, dated), [...after.keys()], 'no record: everything');
  assert.deepEqual(urlsToSubmit(before, after, dated), [
    page('/'), // a calendar page: turns over with each build
    page('/events/trivia/'), // its check date moved
    page('/events/new-one/'), // new
    page('/places/closed-now/'), // gone: the engine comes back and finds it gone
  ]);
  assert.ok(CALENDAR_PATHS.has('/events/') && !CALENDAR_PATHS.has('/about/'));
});

test('a submission names the host and where its key is, and only 200 or 202 is a yes', () => {
  assert.deepEqual(submission('insideberthoud.com', ['https://insideberthoud.com/']), {
    host: 'insideberthoud.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://insideberthoud.com/${INDEXNOW_KEY}.txt`,
    urlList: ['https://insideberthoud.com/'],
  });
  assert.ok(accepted(200) && accepted(202));
  assert.ok(!accepted(403) && !accepted(422) && !accepted(429));
  // The one 403 that means "wait": the key file is there and not yet checked (Fort Collins, first run, 5 November 2026).
  assert.ok(verificationPending(403, '{"errorCode":"SiteVerificationNotCompleted","message":"Site Verification is not completed."}'));
  assert.ok(!verificationPending(403, '{"errorCode":"InvalidKey"}') && !verificationPending(422, 'SiteVerificationNotCompleted'));
});
