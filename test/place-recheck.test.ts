/**
 * The places re-check (src/lib/place-recheck.ts, scripts/recheck-places.ts),
 * and the guides keeping a stale place as re-check pending (the owner, 18
 * November 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addressOn, closureOn, duePlaces, judgePlace, mainHtml, namesPlace, phonesOn, recheckDueDays, type RecheckPlace } from '../src/lib/place-recheck.ts';
import { FRESHNESS } from '../src/config/freshness.ts';

const place = (over: Partial<RecheckPlace>): RecheckPlace => ({ town: 'lyons', slug: 'x', title: 'Oskar Blues Grill & Brew', variant: 'front-range', verified: '2026-10-01', ...over });
const page = (text: string, code = '200') => ({ code, body: text, text });

test('a place is due at half its window, well inside it: 45 days on the Front Range, 30 in the mountains', () => {
  assert.equal(recheckDueDays('front-range'), 45);
  assert.equal(recheckDueDays('mountain'), 30);
  assert.ok(recheckDueDays('front-range') < FRESHNESS.listingDays['front-range']);
  assert.ok(recheckDueDays('mountain') < FRESHNESS.listingDays.mountain);
  const today = '2026-11-18';
  const due = duePlaces(
    [
      place({ slug: 'fresh', verified: '2026-11-01' }),
      place({ slug: 'half', verified: '2026-10-04' }),
      place({ slug: 'old', verified: '2026-09-01' }),
      place({ slug: 'mtn', variant: 'mountain', verified: '2026-10-18' }),
      place({ slug: 'waiting', verified: '2026-11-10', recheckPending: 'blocked' }),
      place({ slug: 'gone', verified: '2026-01-01', status: 'closed' }),
    ],
    today,
  ).map((p) => p.slug);
  // Waiting first, then the largest share of its window; never a closed place; not a fresh one.
  assert.deepEqual(due, ['waiting', 'old', 'mtn', 'half']);
  assert.deepEqual(duePlaces([place({ slug: 'a', verified: '2026-01-01' }), place({ slug: 'b', verified: '2026-01-02' })], today, 1).map((p) => p.slug), ['a'], 'a night’s budget');
  // The waiting ones are read every night on top of the budget, so they never crowd out the rotation.
  assert.deepEqual(duePlaces([place({ slug: 'w', recheckPending: 'blocked' }), place({ slug: 'a', verified: '2026-01-01' }), place({ slug: 'b', verified: '2026-01-02' })], today, 1).map((p) => p.slug), ['w', 'a']);
});

test('a page confirms a place by its name or its number, and says when the number has changed', () => {
  assert.ok(namesPlace('Welcome to Oskar Blues Grill and Brew in Lyons', 'Oskar Blues Grill & Brew'));
  assert.ok(namesPlace('THE BUFFET at Monarch', 'The Buffet at Monarch'));
  assert.ok(!namesPlace('A different brewery entirely', 'Oskar Blues Grill & Brew'));
  assert.deepEqual(phonesOn('Call (303) 823-6685 or +1 303.555.0100'), ['3038236685', '3035550100']);
  const p = { title: 'Oskar Blues Grill & Brew', phone: '303-823-6685' };
  assert.equal(judgePlace(p, page('Oskar Blues Grill & Brew, Lyons. Call 303-823-6685. '.repeat(10)), 'the source page').verdict, 'confirmed');
  const moved = judgePlace(p, page('Oskar Blues Grill & Brew, Lyons. Call 720-555-0199. '.repeat(10)), 'the source page');
  assert.equal(moved.verdict, 'changed');
  assert.match(moved.note, /720-555-0199/);
  assert.equal(judgePlace(p, page('Nothing about it here at all. '.repeat(20)), 'the source page').verdict, 'changed');
  assert.equal(judgePlace(p, page('', '404'), 'the source page').verdict, 'changed');
});

test('a name alone does not confirm a listing that has a phone or a street address to check', () => {
  assert.ok(addressOn('Visit us at 111 Richman St., Black Hawk', '111 Richman Street, Black Hawk, CO 80422'));
  assert.ok(addressOn('303 Main Street', '303 Main St, Lyons'));
  assert.ok(!addressOn('112 Richman Street', '111 Richman Street'));
  const shop = { title: 'The Hidden Stem', address: '4024 Main Street, Timnath, CO 80547', phone: '970-555-0142' };
  const bare = judgePlace(shop, page(`The Hidden Stem: a garden boutique on Main Street in Timnath. ${'Members directory. '.repeat(20)}`), 'the source page');
  // Named, and nothing contradicts it, but no fact to read it by: a check date for the rotation, never a cleared re-check (byName).
  assert.equal(bare.verdict, 'confirmed');
  assert.equal(bare.byName, true);
  assert.equal(judgePlace(shop, page(`The Hidden Stem, 4024 Main Street, Timnath. ${'Shop. '.repeat(40)}`), 'the source page').verdict, 'confirmed');
  // A trailhead with no phone and no street number: its name is what there is to read.
  assert.equal(judgePlace({ title: 'Cold Springs Campground', address: 'Colorado 119, north of Black Hawk' }, page(`Cold Springs Campground. ${'Reservations. '.repeat(30)}`), 'the source page').byName, true);
  // A city's switchboard number in the footer is not the park's: phones are read from the page's own content.
  const park = { title: 'Clark Centennial Community Park', phone: '303-651-8416', address: '1100 Lashley St., Longmont' };
  const html = `<main>Clark Centennial Community Park, 1100 Lashley St. ${'Fields and a pool. '.repeat(20)}</main><footer>City of Longmont 303-776-6050</footer>`;
  const j = judgePlace(park, { code: '200', body: html, text: html.replace(/<[^>]+>/g, ' '), main: mainHtml(html).replace(/<[^>]+>/g, ' ') }, 'the source page');
  assert.equal(j.verdict, 'confirmed');
  assert.match(j.note, /same address/);
});

test('only a closure for good closes a place; a season or a holiday never does', () => {
  assert.match(closureOn('After 20 years, Oskar Blues Grill & Brew has closed its doors. Thank you, Lyons.')!, /closed its doors/);
  assert.match(closureOn('We are permanently closed.')!, /permanently closed/);
  assert.equal(closureOn('Closed for the season; we reopen in May.'), undefined);
  assert.equal(closureOn('Temporarily closed for remodeling.'), undefined);
  assert.equal(closureOn('Closed Thanksgiving Day.'), undefined);
  const j = judgePlace({ title: 'Oskar Blues Grill & Brew' }, page(`Oskar Blues Grill & Brew in Lyons is permanently closed. ${'More text. '.repeat(30)}`), 'the source page');
  assert.equal(j.verdict, 'closed');
  assert.ok(j.quote);
});

test('a bot check, a refusal, robots.txt or no answer is blocked: re-check pending, on the needs-me list', () => {
  const p = { title: 'Bar 8042' };
  for (const code of ['403', '429', '503', '000', '401']) assert.equal(judgePlace(p, page('', code), 'the source page').verdict, 'blocked', code);
  assert.equal(judgePlace(p, 'robots', 'the source page').verdict, 'blocked');
  assert.equal(judgePlace(p, page('<div id="app"></div>'), 'the source page').verdict, 'blocked', 'a page drawn by JavaScript showed nothing');
});

test('a place waiting for a re-check is kept on a guide as on the hub: built, noindex, out of the sitemap, off every list; a stale guide place still leaves the build (the guides move into the hub on 4 January 2027)', () => {
  const content = readFileSync('src/lib/content.ts', 'utf8');
  assert.match(content, /new Map\(\[\[site\.slug, site\]\]\), isSectionBuild\(\)\)/, 'a guide does not keep a stale place; a section does');
  const config = readFileSync('astro.config.mjs', 'utf8');
  assert.match(config, /\.\.\.closedPlaceSlugs\(site\.slug\), \.\.\.recheckPendingSlugs\(site\.slug\), \.\.\.\(isSectionBuild\(\) \? stalePlaceSlugs\(/, 'a waiting place is out of every town build’s sitemap; a stale one out of a section’s');
  // Every list of places reads isListed or `delisted`, so a waiting place is on none.
  for (const file of ['src/components/home/TownHome.astro', 'src/pages/about.astro', 'src/components/ArticleStrip.astro', 'src/routes/town/directory.astro', 'src/routes/town/eat-drink.astro', 'src/routes/town/things-to-do.astro', 'src/routes/town/places-by-type.astro']) {
    const text = readFileSync(file, 'utf8');
    assert.ok(/isListed|delisted/.test(text), file);
  }
  const placePage = readFileSync('src/routes/town/places/[slug].astro', 'utf8');
  assert.match(placePage, /noindex=\{place\.delisted\}/);
  assert.match(placePage, /data\.recheckPending \? \[\] : \[localBusinessJsonLd/, 'no LocalBusiness while it waits');
  assert.match(placePage, /Last checked/);
});
