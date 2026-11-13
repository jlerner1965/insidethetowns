/**
 * The check on a built site (scripts/lib/site-check.ts) is the last thing
 * between a template change and a reader, so each rule is proved here on a
 * small site with exactly one thing wrong: a check that passes everything
 * looks the same from outside as a site with nothing wrong.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  checkJsonLd,
  checkNetwork,
  checkSite,
  redirectsFor,
  scanHtml,
  sourcePattern,
  type Manifest,
  type VercelRedirect,
} from '../scripts/lib/site-check.ts';

const DOMAIN = 'insideexample.com';
const ORIGIN = `https://${DOMAIN}`;
const NETWORK = new Map([
  [DOMAIN, true],
  ['insideother.com', true],
  ['insideclosed.com', false],
]);

interface PageOptions {
  body?: string;
  noindex?: boolean;
  canonical?: string | null;
  head?: string;
  title?: string;
}

function page(path: string, o: PageOptions = {}): string {
  const canonical = o.canonical === undefined ? ORIGIN + path : o.canonical;
  return [
    '<!DOCTYPE html><html lang="en"><head>',
    `<title>${o.title ?? `Page ${path}`}</title>`,
    '<meta name="description" content="A page.">',
    o.noindex ? '<meta name="robots" content="noindex">' : '',
    canonical ? `<link rel="canonical" href="${canonical}">` : '',
    o.noindex ? '' : `<meta property="og:url" content="${ORIGIN + path}">`,
    '<meta property="og:title" content="t"><meta property="og:description" content="d">',
    `<meta property="og:image" content="${ORIGIN}/card.jpg"><meta name="twitter:card" content="summary"><meta name="twitter:image" content="${ORIGIN}/card.jpg">`,
    o.head ?? '',
    '</head><body><main id="main"><h1>Heading</h1>',
    o.body ?? '',
    '</main></body></html>',
  ].join('');
}

const stub = (to: string) => `<!doctype html><title>Redirecting to: ${to}</title><meta http-equiv="refresh" content="0;url=${to}"><meta name="robots" content="noindex"><link rel="canonical" href="${ORIGIN}${to}">`;

function sitemap(paths: string[]): Record<string, string> {
  return {
    '/sitemap-index.xml': `<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    '/sitemap-0.xml': `<urlset>${paths.map((p) => `<url><loc>${ORIGIN}${p}</loc><lastmod>2026-11-01T00:00:00.000Z</lastmod></url>`).join('')}</urlset>`,
  };
}

/** A sound two-page site; each test changes one thing about it. */
function sound(): Record<string, string> {
  return {
    '/index.html': page('/', { body: '<a href="/about/">About</a>' }),
    '/about/index.html': page('/about/', { body: '<a href="/">Home</a><h2 id="who">Who</h2>' }),
    '/404.html': page('/404.html', { noindex: true, canonical: null }),
    '/card.jpg': 'x',
    '/robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`,
    ...sitemap(['/', '/about/']),
  };
}

function run(files: Record<string, string>, redirects: VercelRedirect[] = [], archive?: RegExp) {
  const dir = mkdtempSync(join(tmpdir(), 'site-check-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text);
    }
    return checkSite({ dir, domain: DOMAIN, network: NETWORK, redirects, now: new Date('2026-11-09T12:00:00Z'), archive });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const rules = (files: Record<string, string>, redirects: VercelRedirect[] = [], archive?: RegExp) =>
  run(files, redirects, archive).problems.map((p) => p.rule).sort();

test('a sound site has no problems', () => {
  const result = run(sound());
  assert.deepEqual(result.problems, []);
  assert.equal(result.pages, 3);
});

test('a link to a page that was not built', () => {
  const files = { ...sound(), '/index.html': page('/', { body: '<a href="/about/">About</a><a href="/gone/">Gone</a>' }) };
  const { problems } = run(files);
  assert.deepEqual(problems.map((p) => p.rule), ['link-broken']);
  assert.match(problems[0]!.detail, /\/gone\//);
});

test('an image, a script or a stylesheet that was not built is a broken link too', () => {
  for (const tag of ['<img alt="" src="/_astro/x.jpg">', '<img alt="" src="/card.jpg" srcset="/_astro/a.webp 1x, /card.jpg 2x">', '<script src="/_astro/x.js"></script>']) {
    assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: `<a href="/about/">About</a>${tag}` }) }), ['link-broken'], tag);
  }
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: '<a href="/about/">About</a>', head: '<link rel="stylesheet" href="/_astro/x.css">' }) }), ['link-broken']);
});

test('a link inside a script or a comment is not a link', () => {
  const body = '<a href="/about/">About</a><!-- <a href="/gone/">x</a> --><script src="/card.jpg">const s = \'<a href="/gone/">\';</script>';
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body }) }), []);
});

test('a link without its trailing slash costs a redirect', () => {
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: '<a href="/about">About</a>' }) }), ['link-no-trailing-slash']);
});

test('a fragment link needs its element; a query string does not change the page', () => {
  const ok = page('/', { body: '<a href="/about/?where=x#who">Who</a><a href="#main">Skip</a>' });
  assert.deepEqual(rules({ ...sound(), '/index.html': ok }), []);
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: '<a href="/about/#nobody">Who</a>' }) }), ['link-fragment']);
});

test('mail, phone and off-network links are left alone', () => {
  const body = '<a href="/about/">A</a><a href="mailto:a@example.com">m</a><a href="tel:+13035550100">t</a><a href="https://example.org/nothing/">x</a>';
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body }) }), []);
});

test('an own-site link written with www or http', () => {
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: `<a href="http://${DOMAIN}/about/">A</a>` }) }), ['link-own-form']);
});

test('a link to a redirect page, and a redirect page that goes nowhere or goes twice', () => {
  const linked = { ...sound(), '/old/index.html': stub('/about/'), '/index.html': page('/', { body: '<a href="/old/">Old</a><a href="/about/">A</a>' }) };
  assert.deepEqual(rules(linked), ['link-to-redirect']);
  assert.deepEqual(rules({ ...sound(), '/old/index.html': stub('/about/') }), [], 'a redirect page nothing links to is what it is for');
  assert.deepEqual(rules({ ...sound(), '/old/index.html': stub('/gone/') }), ['redirect-page-target']);
  assert.deepEqual(rules({ ...sound(), '/old/index.html': stub('/older/'), '/older/index.html': stub('/about/') }), ['redirect-chain']);
});

test('a link to a guide that has closed, and the links to a live one are kept for the network check', () => {
  const body = '<a href="/about/">A</a><a href="https://insideclosed.com/events/">closed</a><a href="https://insideother.com/events/x/">other</a>';
  const result = run({ ...sound(), '/index.html': page('/', { body }) });
  assert.deepEqual(result.problems.map((p) => p.rule), ['link-to-closed-guide']);
  assert.deepEqual(result.manifest.outbound, [{ from: '/', url: 'https://insideother.com/events/x/' }]);
});

test('a record of a sent email may link through a redirect or to a closed guide, never to nothing', () => {
  const archive = /^\/newsletter\/\d{4}-/;
  const issue = (body: string) => ({
    ...sound(),
    '/old/index.html': stub('/about/'),
    '/newsletter/2026-10-22-x/index.html': page('/newsletter/2026-10-22-x/', { body }),
    '/index.html': page('/', { body: '<a href="/about/">A</a><a href="/newsletter/2026-10-22-x/">Issue</a>' }),
    ...sitemap(['/', '/about/', '/newsletter/2026-10-22-x/']),
  });
  assert.deepEqual(rules(issue('<a href="/old/">o</a><a href="https://insideclosed.com/x/">c</a>'), [], archive), []);
  assert.deepEqual(rules(issue('<a href="/old/">o</a>')), ['link-to-redirect'], 'only where the site says the page is an archive');
  assert.deepEqual(rules(issue('<a href="/gone/">g</a>'), [], archive), ['link-broken']);
});

test('the canonical is the page’s own URL, once', () => {
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { canonical: `${ORIGIN}/` }) }), ['canonical']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { canonical: null }) }), ['canonical']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { head: `<link rel="canonical" href="${ORIGIN}/about/">` }) }), ['canonical']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { canonical: 'https://insideother.com/about/' }) }), ['canonical']);
});

test('a noindex page has no canonical, and the 404 page is noindex', () => {
  assert.deepEqual(rules({ ...sound(), '/404.html': page('/404.html', { noindex: true }) }), ['canonical-on-noindex']);
  const rulesFor404 = rules({ ...sound(), '/404.html': page('/404.html') });
  assert.ok(rulesFor404.includes('noindex-404'), rulesFor404.join());
});

test('the sitemap is the indexable pages, no more and no fewer', () => {
  assert.deepEqual(rules({ ...sound(), ...sitemap(['/']) }), ['sitemap'], 'an indexable page left out');
  assert.deepEqual(rules({ ...sound(), ...sitemap(['/', '/about/', '/gone/']) }), ['sitemap'], 'a page that was not built');
  const hidden = { ...sound(), '/index.html': page('/'), '/about/index.html': page('/about/', { noindex: true, canonical: null }) };
  assert.deepEqual(rules(hidden), ['sitemap'], 'a noindex page listed');
  assert.deepEqual(rules({ ...hidden, ...sitemap(['/']) }), []);
  assert.deepEqual(rules({ ...sound(), '/old/index.html': stub('/about/'), ...sitemap(['/', '/about/', '/old/']) }), ['sitemap'], 'a redirect page listed');
  assert.deepEqual(rules({ ...sound(), ...sitemap(['/', '/about/', '/about/']) }), ['sitemap'], 'listed twice');
});

test('a sitemap entry needs a lastmod that is a date and not in the future', () => {
  const withLastmod = (lastmod: string) => ({
    ...sound(),
    '/sitemap-0.xml': `<urlset><url><loc>${ORIGIN}/</loc>${lastmod}</url><url><loc>${ORIGIN}/about/</loc><lastmod>2026-11-01</lastmod></url></urlset>`,
  });
  assert.deepEqual(rules(withLastmod('')), ['sitemap-lastmod']);
  assert.deepEqual(rules(withLastmod('<lastmod>soon</lastmod>')), ['sitemap-lastmod']);
  assert.deepEqual(rules(withLastmod('<lastmod>2027-01-01</lastmod>')), ['sitemap-lastmod']);
});

test('robots.txt names the sitemap and blocks nothing it lists', () => {
  assert.deepEqual(rules({ ...sound(), '/robots.txt': 'User-agent: *\nAllow: /\n' }), ['robots']);
  assert.deepEqual(rules({ ...sound(), '/robots.txt': `User-agent: *\nDisallow: /about/\nSitemap: ${ORIGIN}/sitemap-index.xml\n` }), ['robots']);
});

test('a page has one title, one description and one h1; ids are not repeated', () => {
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { title: '' }) }), ['title']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { body: '<h1>Second</h1>' }) }), ['h1']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { body: '<p id="a"></p><p id="a"></p>' }) }), ['duplicate-id']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { body: '<img src="/card.jpg">' }) }), ['img-alt']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { title: 'Page /' }) }), ['duplicate-title']);
});

test('an SVG’s <title> in the body is not a second page title', () => {
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { body: '<svg><title>Icon</title></svg>' }) }), []);
});

test('structured data: what does not parse, has no type, or says something a search engine cannot use', () => {
  const ld = (o: unknown) => checkJsonLd(typeof o === 'string' ? o : JSON.stringify(o)).problems;
  const C = 'https://schema.org';
  assert.deepEqual(ld({ '@context': C, '@type': 'WebPage', '@id': `${ORIGIN}/#page`, url: `${ORIGIN}/`, isPartOf: { '@id': `${ORIGIN}/#website` } }), []);
  assert.equal(ld('{"@context": ').length, 1);
  assert.match(ld({ '@type': 'WebPage' })[0]!, /@context/);
  assert.match(ld({ '@context': C, name: 'x' })[0]!, /no @type/);
  assert.match(ld({ '@context': C, '@type': 'WebPage', url: '/about/' })[0]!, /not an absolute URL/);
  assert.match(ld({ '@context': C, '@type': 'Event', name: 'x', location: { '@type': 'Place', name: 'y' } })[0]!, /Event without startDate/);
  assert.match(ld({ '@context': C, '@type': 'Event', name: 'x', startDate: 'Saturday', location: { '@type': 'Place', name: 'y' } })[0]!, /not an ISO 8601 date/);
  assert.match(ld({ '@context': C, '@type': 'Event', name: 'x', startDate: '2026-11-14T18:00:00-07:00', endDate: '2026-11-13T18:00:00-07:00', location: { '@type': 'Place', name: 'y' } })[0]!, /before startDate/);
  assert.deepEqual(ld({ '@context': C, '@type': 'Event', name: 'x', startDate: '2026-11-14', endDate: '2026-11-14T20:00:00-07:00', location: { '@type': 'Place', name: 'y' } }), []);
  assert.match(ld({ '@context': C, '@type': 'WebPage', name: '' })[0]!, /is empty/);
  assert.match(ld({ '@context': C, '@type': 'ItemList', numberOfItems: 3, itemListElement: [{ '@type': 'ListItem', position: 1, url: `${ORIGIN}/` }] })[0]!, /numberOfItems 3 but 1 listed/);
  assert.match(ld({ '@context': C, '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 2, name: 'x', item: `${ORIGIN}/` }] })[0]!, /positions/);
  assert.deepEqual(ld({ '@context': C, '@graph': [{ '@type': 'Organization', '@id': `${ORIGIN}/#org`, name: 'x' }] }), []);
});

test('a URL in structured data has to be built, and an @id’s fragment is a name, not an anchor', () => {
  const block = (url: string) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${ORIGIN}/about/#page`, url })}</script>`;
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { head: block(`${ORIGIN}/about/`) }) }), []);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { head: block(`${ORIGIN}/gone/`) }) }), ['link-broken']);
  assert.deepEqual(rules({ ...sound(), '/about/index.html': page('/about/', { head: '<script type="application/ld+json">{</script>' }) }), ['json-ld']);
});

test('a feed’s links are pages of the site', () => {
  const feed = (link: string) => `<rss><channel><link>${ORIGIN}/</link><item><link>${link}</link><guid>${link}</guid></item></channel></rss>`;
  assert.deepEqual(rules({ ...sound(), '/events.rss': feed(`${ORIGIN}/about/`) }), []);
  assert.deepEqual(rules({ ...sound(), '/events.rss': feed(`${ORIGIN}/gone/`) }), ['link-broken', 'link-broken']);
});

const host = (value: string) => [{ type: 'host', value }];

test('a redirect source is read as Vercel reads it', () => {
  assert.ok(sourcePattern('/compare{/}?').test('/compare'));
  assert.ok(sourcePattern('/compare{/}?').test('/compare/'));
  assert.ok(!sourcePattern('/compare{/}?').test('/compare/x/'));
  assert.ok(sourcePattern('/events/:slug{/}?').test('/events/a-b/'));
  assert.ok(!sourcePattern('/events/:slug{/}?').test('/events/a/b/'));
  assert.ok(sourcePattern('/(.*)').test('/anything/at/all/'));
  assert.ok(sourcePattern('/moved/:path*').test('/moved/a/b/'));
  assert.ok(!sourcePattern('/sitemap.xml').test('/sitemapxxml'));
  assert.throws(() => sourcePattern('/a|b'), /cannot read/);
});

test('a host’s redirects are its own and the ones for every host', () => {
  const all: VercelRedirect[] = [
    { source: '/a', destination: '/' },
    { source: '/b', destination: '/', has: host(DOMAIN) },
    { source: '/c', destination: '/', has: host('insideother.com') },
  ];
  assert.deepEqual(redirectsFor(all, DOMAIN).map((r) => r.source), ['/a', '/b']);
});

test('a redirect that hides a built page, lands on nothing, chains, or is written twice', () => {
  const to = (source: string, destination: string, on = DOMAIN): VercelRedirect => ({ source, destination, has: host(on) });
  assert.deepEqual(rules(sound(), [to('/about{/}?', '/')]), ['redirect-hides-page', 'sitemap'], 'and the sitemap lists a page that redirects');
  assert.deepEqual(rules(sound(), [to('/about{/}?', '/', 'insideother.com')]), [], 'another host’s rule is not this site’s');
  assert.deepEqual(rules(sound(), [to('/old{/}?', '/gone/')]), ['redirect-target']);
  assert.deepEqual(rules(sound(), [to('/old{/}?', '/about/?where=x')]), []);
  assert.deepEqual(rules(sound(), [to('/old{/}?', '/older/'), to('/older{/}?', '/about/')]), ['redirect-chain']);
  assert.deepEqual(rules(sound(), [to('/old{/}?', '/about/'), to('/old{/}?', '/')]), ['redirect-duplicate']);
  assert.deepEqual(rules({ ...sound(), '/old/index.html': stub('/about/') }, [to('/old{/}?', '/about/')]), [], 'over a redirect page the rule only says the same thing first');
  assert.deepEqual(rules({ ...sound(), '/index.html': page('/', { body: '<a href="/old/">o</a><a href="/about/">a</a>' }) }, [to('/old{/}?', '/about/')]), ['link-to-redirect']);
});

test('across the network: a link or a redirect to another site lands on a page built there', () => {
  const other: Manifest = { domain: 'insideother.com', paths: ['/', '/events/', '/events/x/'], moved: { '/events/old/': '/events/x/' }, outbound: [] };
  const from = (url: string, archive?: boolean): Manifest => ({ domain: DOMAIN, paths: ['/'], moved: {}, outbound: [{ from: '/', url, ...(archive ? { archive } : {}) }] });
  const check = (m: Manifest, redirects: VercelRedirect[] = []) => checkNetwork([m, other], redirects, NETWORK).map((p) => p.rule);
  assert.deepEqual(check(from('https://insideother.com/events/x/?utm_source=x#top')), []);
  assert.deepEqual(check(from('https://insideother.com/events/gone/')), ['cross-site-link']);
  assert.deepEqual(check(from('https://insideother.com/events')), ['cross-site-link'], 'without its slash');
  assert.deepEqual(check(from('https://insideother.com/events/old/')), ['cross-site-link'], 'a redirect page');
  assert.deepEqual(check(from('https://insideother.com/events/old/', true)), [], 'a sent email may go through a redirect');
  assert.deepEqual(check(from('https://insideother.com/events/gone/', true)), ['cross-site-link'], 'and never to nothing');
  const rule = (destination: string): VercelRedirect => ({ source: '/x', destination, has: host('insideclosed.com') });
  assert.deepEqual(check(from('https://insideother.com/'), [rule('https://insideother.com/events/')]), []);
  assert.deepEqual(check(from('https://insideother.com/'), [rule('https://insideother.com/gone/')]), ['redirect-target']);
  assert.deepEqual(check(from('https://insideother.com/'), [rule('https://insideother.com/events/:slug/')]), []);
  assert.deepEqual(check(from('https://insideother.com/'), [rule('https://example.org/gone/')]), [], 'off the network is not ours to check');
  assert.deepEqual(checkNetwork([from('https://insideother.com/')], [], NETWORK), [], 'a live site that was not built is reported once, by the caller');
  const twice: Manifest = { domain: DOMAIN, paths: ['/'], moved: {}, outbound: [{ from: '/', url: 'https://insideother.com/gone/' }, { from: '/about/', url: 'https://insideother.com/gone/?x=1' }] };
  const grouped = checkNetwork([twice, other], [], NETWORK);
  assert.equal(grouped.length, 1, 'one line per missing page, not per link to it');
  assert.match(grouped[0]!.detail, /1 more page links there/);
});

test('the scanner reads attributes however they are quoted, and decodes them', () => {
  const scan = scanHtml(`<html><head><title>A &amp; B</title></head><body><a href='/x/?a=1&amp;b=2' class=plain data-x>x</a><p id="one"></p></body></html>`);
  assert.deepEqual(scan.titles, ['A & B']);
  assert.equal(scan.tags.find((t) => t.name === 'a')!.attrs.href, '/x/?a=1&b=2');
  assert.equal(scan.tags.find((t) => t.name === 'a')!.attrs.class, 'plain');
  assert.ok(scan.ids.has('one'));
});

test('a draft article in a build without the preview switch is refused', () => {
  const files = { ...sound(), '/about/index.html': page('/about/', { body: '<a href="/">Home</a><h2 id="who">Who</h2><p data-draft>A draft</p>' }) };
  assert.deepEqual(rules(files), ['draft-shipped']);
});

test('a sample tradition record in a build without the fixtures switch is refused', () => {
  const files = { ...sound(), '/about/index.html': page('/about/', { body: '<a href="/">Home</a><h2 id="who">Who</h2><article data-tradition-row data-fixture>Sample</article>' }) };
  assert.deepEqual(rules(files), ['fixture-shipped']);
  const dir = mkdtempSync(join(tmpdir(), 'site-check-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text);
    }
    const allowed = checkSite({ dir, domain: DOMAIN, network: NETWORK, redirects: [], now: new Date('2026-11-09T12:00:00Z'), fixtures: true });
    assert.deepEqual(allowed.problems, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
