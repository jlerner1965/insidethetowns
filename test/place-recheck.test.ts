/**
 * The places re-check (src/lib/place-recheck.ts, scripts/recheck-places.ts),
 * and the guides keeping a stale place as re-check pending (the owner, 18
 * November 2026).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { addressOn, closureOn, duePlaces, judgePlace, mainHtml, namesPlace, phonesOn, recheckDueDays, unclearClosureOn, type RecheckPlace } from '../src/lib/place-recheck.ts';
import { FRESHNESS } from '../src/config/freshness.ts';
import { placeExclusion } from '../src/lib/freshness.ts';
import { closedPlaceSlugs, recheckPendingSlugs, stalePlaceSlugs } from '../src/lib/raw-places.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';
import { closeByHand, confirmByHand, writeClosureCheck, writeConfirmed, writeReadBlocked } from '../scripts/lib/place-edit.ts';

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
      place({ slug: 'waiting', verified: '2026-11-10', recheckPending: 'set aside' }),
      place({ slug: 'blocked', verified: '2026-11-12', readBlocked: '2026-11-17: 403' }),
      place({ slug: 'gone', verified: '2026-01-01', status: 'closed' }),
    ],
    today,
  ).map((p) => p.slug);
  // Flagged for a person first (set aside, blocked, a possible closure), then the largest share of its window; never a closed place; not a fresh one.
  assert.deepEqual(due, ['waiting', 'blocked', 'old', 'mtn', 'half']);
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
  // The page gone, or no longer naming the place: a possible closure for a person, not a change and not a closure.
  assert.equal(judgePlace(p, page('Nothing about it here at all. '.repeat(20)), 'the source page').verdict, 'closure-check');
  assert.equal(judgePlace(p, page('', '404'), 'the source page').verdict, 'closure-check');
  assert.equal(judgePlace(p, page('', '410'), 'the source page').verdict, 'closure-check');
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

test('an unclear sign of closure goes to a person, never straight to 410: a store gone from a locator, a campground saying "Site Closed"', () => {
  // A store locator that no longer lists the store.
  const store = { title: 'Starbucks — Colorado Boulevard', phone: '303-567-2578', address: '2801 Colorado Blvd, Idaho Springs, CO 80452' };
  const locator = judgePlace(store, page(`Find a store near you. ${'Store results for Idaho Springs, Colorado. '.repeat(10)} Evergreen, 303-555-0100.`), 'the source page');
  assert.equal(locator.verdict, 'closure-check');
  // A campground page with a "Site Closed" banner: for the season or for good, it does not say.
  for (const words of ['Site Closed', 'This location is closed.', 'Currently closed', 'Closed until further notice', 'Closed indefinitely']) {
    assert.ok(unclearClosureOn(words), words);
    const camp = judgePlace({ title: 'Cold Springs Campground', address: 'Colorado 119' }, page(`Cold Springs Campground. ${words}. ${'Reservations and alerts. '.repeat(20)}`), 'the source page');
    assert.equal(camp.verdict, 'closure-check', words);
  }
  // The hours are not a closure: a closed day, a holiday list, a place between its hours.
  for (const words of ['*The store is closed on\nthe following holidays:\nThanksgiving', 'The store is closed on Mondays.', 'Currently closed · Opens 11 AM', 'Location closed today for a private event.']) assert.equal(unclearClosureOn(words), undefined, words);
  // A place already marked temporarily closed says nothing new by "currently closed".
  assert.equal(judgePlace({ title: 'Cold Springs Campground', status: 'temporarily-closed' }, page(`Cold Springs Campground. Currently closed. ${'Reservations. '.repeat(30)}`), 'the source page').verdict, 'confirmed');
  // Written as a flag for a person: the place stays open, so no 410 at the next redirect-map rebuild.
  const root = mkdtempSync(join(tmpdir(), 'closure-'));
  try {
    mkdirSync(join(root, 'evergreen', 'places'), { recursive: true });
    const file = join(root, 'evergreen', 'places', 'bakery.md');
    writeFileSync(file, writeClosureCheck(placeFile('2026-11-01'), '2026-11-18', 'its own site is now a domain-parking page', undefined, 'https://example.com/'));
    const text = readFileSync(file, 'utf8');
    assert.match(text, /^closureCheck: "2026-11-18: its own site is now a domain-parking page, https:\/\/example\.com\/"$/m);
    assert.doesNotMatch(text, /^status:\s*"?closed/m);
    assert.equal(closedPlaceSlugs('evergreen', root).size, 0, 'no 410');
    assert.equal(placeExclusion(fm(text), 'mountain', new Date('2026-11-20T18:00:00Z')), null, 'and nothing hidden while it is fresh');
    // Only a person closes it: confirm-place --closed.
    const closed = closeByHand(text, { on: '2026-11-21', how: 'phone', by: 'the editor', note: 'Closed for good on November 1, the owner said' });
    assert.match(closed, /^status: "closed"$/m);
    assert.doesNotMatch(closed, /^closureCheck:/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/** A place file as the guides write them, verified on `verified`. */
function placeFile(verified: string, extra = ''): string {
  return `---\ntitle: "Bakery on Main"\nslug: "bakery"\ntype: "bakery"\nsource: "https://example.com/"\nverified: "${verified}"\nverifiedBy: "the editor"\nphone: "303-555-0142"\n${extra}---\n\nA bakery.\n`;
}
/** Its front matter as the content collection hands it to the freshness gate (dates as Dates). */
function fm(text: string): Record<string, unknown> {
  const d = parseFrontmatter(text).data as Record<string, unknown>;
  return { ...d, verified: new Date(`${String(d.verified).slice(0, 10)}T12:00:00-07:00`) };
}

test('a fresh listing stays visible through repeated blocked reads, keeping its last verified date, then follows the stale rules once its window ends', () => {
  const root = mkdtempSync(join(tmpdir(), 'blocked-'));
  try {
    mkdirSync(join(root, 'lyons', 'places'), { recursive: true });
    const file = join(root, 'lyons', 'places', 'bakery.md');
    // Verified 1 November; blocked on three nights running.
    let text = placeFile('2026-11-01');
    for (const night of ['2026-11-18', '2026-11-19', '2026-11-20']) text = writeReadBlocked(text, night, '403, a bot check or a refusal');
    writeFileSync(file, text);
    // Flagged for a person on the first blocked read, and only once; the check date is kept.
    assert.match(text, /^readBlocked: "2026-11-18: 403, a bot check or a refusal"$/m);
    assert.equal(text.match(/^readBlocked:/gm)!.length, 1);
    assert.match(text, /^verified: "2026-11-01"$/m);
    assert.doesNotMatch(text, /^recheckPending:/m, 'not set aside: a blocked read hides nothing');
    // Visible and indexable while inside its window (90 days on the Front Range: through 30 January 2027).
    const window = FRESHNESS.listingDays['front-range'];
    assert.equal(window, 90);
    for (const day of ['2026-11-20', '2027-01-15', '2027-01-30']) {
      assert.equal(placeExclusion(fm(text), 'front-range', new Date(`${day}T18:00:00Z`)), null, day);
      assert.equal(stalePlaceSlugs('lyons', window, root, new Date(`${day}T18:00:00Z`)).size, 0, `in the sitemap on ${day}`);
    }
    assert.equal(recheckPendingSlugs('lyons', root).size, 0, 'not noindex');
    // Past it, the usual rules: stale (a guide drops it; a section keeps it noindex as re-check pending, src/lib/content.ts).
    const after = placeExclusion(fm(text), 'front-range', new Date('2027-01-31T18:00:00Z'));
    assert.equal(after?.reason, 'stale');
    assert.deepEqual([...stalePlaceSlugs('lyons', window, root, new Date('2027-01-31T18:00:00Z'))], ['bakery'], 'out of the sitemap once stale');
    // The same in the mountains, on a 60-day window.
    assert.equal(placeExclusion(fm(text), 'mountain', new Date('2026-12-31T18:00:00Z')), null);
    assert.equal(placeExclusion(fm(text), 'mountain', new Date('2027-01-01T18:00:00Z'))?.reason, 'stale');
    // A later read that works answers the flag and moves the date; so does a person's confirmation.
    const read = writeConfirmed(text, '2026-11-25', 'the nightly re-check workflow', 'the source names it and gives its phone', 'https://example.com/');
    assert.doesNotMatch(read, /^readBlocked:/m);
    assert.match(read, /^verified: "2026-11-25"$/m);
    const byHand = confirmByHand(text, { on: '2026-11-22', how: 'browser', by: 'James Lerner' });
    assert.doesNotMatch(byHand, /^readBlocked:/m);
    assert.match(byHand, /^verified: "2026-11-22"$/m);
    assert.match(byHand, /^verifiedBy: "James Lerner, read in a browser on 2026-11-22"$/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a place a person set aside stays set aside until the person confirms it', () => {
  const text = placeFile('2026-10-11', 'recheckPending: "Set aside by a person"\n');
  // The nightly run writes nothing to it (scripts/recheck-places.ts); the gate keeps its page noindex and off the lists.
  const script = readFileSync('scripts/recheck-places.ts', 'utf8');
  assert.match(script, /if \(write && !row\.setAside\)/);
  assert.doesNotMatch(readFileSync('scripts/lib/place-edit.ts', 'utf8').split('export const HAND_METHODS')[0]!, /recheckPending/, 'no nightly write touches recheckPending');
  const cleared = confirmByHand(text, { on: '2026-11-20', how: 'phone', by: 'James Lerner', note: 'Open, hours unchanged' });
  assert.doesNotMatch(cleared, /^recheckPending:/m);
  assert.match(cleared, /^verifiedBy: "James Lerner, by phone on 2026-11-20: Open, hours unchanged"$/m);
});

test('a bot check, a refusal, robots.txt or no answer is blocked: flagged for a person, on the needs-me list', () => {
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
