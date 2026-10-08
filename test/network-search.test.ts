import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { NETWORK_SEARCH_FILE, plainText, recordHtml, type NetworkRecord } from '../src/lib/network-search.ts';
import { buildSearchIndex } from '../scripts/lib/search-index.ts';

const tavern: NetworkRecord = {
  url: 'https://insideniwot.com/places/niwot-tavern/',
  kind: 'Place',
  title: 'Niwot Tavern',
  town: 'Niwot',
  domain: 'insideniwot.com',
  lead: 'Restaurant · 7960 Niwot Road',
  text: 'The neighborhood tavern on the corner of Cottonwood Square.',
};

test('recordHtml: the title is the h1, and every meta key has its own element', () => {
  const html = recordHtml(tavern);
  assert.match(html, /<main data-pagefind-body>/);
  assert.match(html, /<h1>Niwot Tavern<\/h1>/);
  assert.match(html, /data-pagefind-meta="kind:Place"/);
  assert.match(html, /data-pagefind-meta="town:Niwot"/);
  assert.match(html, /data-pagefind-meta="domain:insideniwot.com"/);
});

test('recordHtml: escapes text, passes rendered HTML through', () => {
  const html = recordHtml({ ...tavern, title: 'Fish & <Chips>', text: '"quoted"' });
  assert.match(html, /<h1>Fish &amp; &lt;Chips&gt;<\/h1>/);
  assert.match(html, /&quot;quoted&quot;/);
  const rendered = recordHtml({ ...tavern, html: '<h2>Parking</h2><p>Behind the hall.</p>' });
  assert.match(rendered, /<h2>Parking<\/h2><p>Behind the hall.<\/p>/);
  assert.doesNotMatch(rendered, /Cottonwood/, 'html replaces text');
});

test('plainText: keeps the words, drops the markup', () => {
  const md = '## Parking\n\nUse the [Town lot](https://example.com) **behind** the hall.\n\n![A lot](lot.jpg)\n\n| Area | Dogs |\n| --- | --- |\n| Hall Ranch | No |';
  assert.equal(plainText(md), 'Parking Use the Town lot behind the hall. Area Dogs Hall Ranch No');
});

/**
 * The indexing step for real, on a two-page site: a built page plus one
 * network record. Pagefind keeps the record's absolute URL (the hub's search
 * links straight to the guide) and reads each meta key separately, and the
 * records file does not survive into the deploy.
 */
test('buildSearchIndex: town records keep their URL and meta, and the records file is removed', async () => {
  const dist = mkdtempSync(join(tmpdir(), 'search-index-'));
  try {
    mkdirSync(join(dist, 'about'));
    writeFileSync(join(dist, 'about', 'index.html'), '<html lang="en"><body><main data-pagefind-body><h1>About the network</h1><p>Independent guides.</p></main></body></html>');
    writeFileSync(join(dist, NETWORK_SEARCH_FILE), JSON.stringify([{ url: tavern.url, html: recordHtml(tavern) }]));

    const { pages, records } = await buildSearchIndex(dist);
    assert.equal(pages, 1);
    assert.equal(records, 1);
    assert.ok(!existsSync(join(dist, NETWORK_SEARCH_FILE)), 'records file deleted before deploy');

    const fragments = readdirSync(join(dist, 'pagefind', 'fragment')).map((f) =>
      JSON.parse(gunzipSync(readFileSync(join(dist, 'pagefind', 'fragment', f))).toString().replace(/^pagefind_dcd/, '')),
    );
    const record = fragments.find((f) => f.url === tavern.url);
    assert.ok(record, `a fragment at ${tavern.url}; got ${fragments.map((f) => f.url).join(', ')}`);
    assert.equal(record.meta.title, 'Niwot Tavern');
    assert.equal(record.meta.kind, 'Place');
    assert.equal(record.meta.town, 'Niwot');
    assert.equal(record.meta.domain, 'insideniwot.com');
    assert.ok(fragments.some((f) => f.url === '/about/'), 'the site’s own pages are still indexed');
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});
