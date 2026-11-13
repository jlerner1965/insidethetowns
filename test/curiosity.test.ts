/**
 * The hub's town-anchored articles (the brief of 13 November 2026;
 * src/lib/curiosity.ts): the rules that keep them honest. Every fact has
 * its official source and the day it was read, a guide site is never a
 * source, a season carries its year, and a draft is on no page, no index
 * and no Nearby block until its file says `status: verified`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { curiosityRoutes } from '../src/integrations/town-routes.ts';
import {
  CAMPING_FIELDS,
  CURIOSITY_BYLINE,
  DRAFTS_ENV,
  GHOST_FIELDS,
  articlePath,
  isStandalone,
  storyHomeUntil,
  articlesFor,
  curiositySchema,
  draftsEnabled,
  factsOf,
  isShown,
  lastVerified,
  openFlags,
  openItems,
  reverifyDue,
} from '../src/lib/curiosity.ts';
import { curiosityDates, curiosityFiles, shownArticles, topicsWithArticles } from '../src/lib/curiosity-files.ts';
import { placeName } from '../src/lib/curiosity-places.ts';
import { contentDates } from '../src/lib/lastmod.ts';
import { isGuideSite } from '../src/lib/town-profile.ts';

const fact = (value: string, checked = '2026-11-13') => ({ value, source: 'https://www.townoflyons.com/351/Camping', checked });
const camping = (over: Record<string, unknown> = {}) => ({
  slug: 'camping-lyons',
  kind: 'camping',
  towns: ['lyons'],
  title: 'Camping near Lyons',
  description: 'Where to camp near Lyons.',
  date: '2026-11-13',
  campgrounds: [{ name: 'A campground', fee: fact('$30 a night'), season: fact('April 15 to October 15, 2026') }],
  ...over,
});
const issues = (data: unknown) => {
  const r = curiositySchema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

test('an article is a draft, and not personally visited, until its file says otherwise', () => {
  const a = curiositySchema.parse(camping());
  assert.equal(a.status, 'draft');
  assert.equal(a.visited, false);
  assert.equal(isShown(a, {}), false, 'a draft is not on the site');
  assert.equal(isShown({ status: 'verified' }, {}), true);
});

test('the preview switch shows drafts locally and is refused on Vercel', () => {
  assert.equal(draftsEnabled({}), false);
  assert.equal(draftsEnabled({ [DRAFTS_ENV]: '1' }), true);
  assert.equal(isShown({ status: 'draft' }, { [DRAFTS_ENV]: '1' }), true);
  assert.throws(() => draftsEnabled({ [DRAFTS_ENV]: '1', VERCEL: '1' }), /never ship/);
});

test('a fact needs its source and the day it was read, and a guide site is not a source', () => {
  assert.deepEqual(issues(camping()), []);
  assert.ok(issues(camping({ campgrounds: [{ name: 'A', fee: { value: '$30' } }] })).length > 0, 'no source, no fact');
  assert.ok(issues(camping({ campgrounds: [{ name: 'A', fee: { value: '$30', source: 'https://www.townoflyons.com/' } }] })).length > 0, 'no check date, no fact');
  for (const site of ['https://www.uncovercolorado.com/x', 'https://en.wikipedia.org/wiki/X', 'https://www.tripadvisor.com/x']) {
    assert.ok(isGuideSite(site));
    assert.ok(issues(camping({ campgrounds: [{ name: 'A', fee: { value: '$30', source: site, checked: '2026-11-13' } }] })).some((i) => /guide site/.test(i)), site);
    assert.ok(issues(camping({ sources: [{ label: 'X', url: site, checked: '2026-11-13' }] })).some((i) => /guide site/.test(i)), site);
  }
});

test('a campground’s season carries its year or says year-round', () => {
  const season = (value: string) => issues(camping({ campgrounds: [{ name: 'A', season: fact(value) }] }));
  assert.deepEqual(season('May 15 to October 12, 2026'), []);
  assert.deepEqual(season('Year-round'), []);
  assert.ok(season('Mid-May to mid-October').some((i) => /year/.test(i)));
});

test('a topic article is anchored to one town and carries its own kind of entry; an event article names its sources', () => {
  assert.ok(issues(camping({ towns: ['lyons', 'niwot'] })).some((i) => /one town/.test(i)));
  assert.ok(issues(camping({ campgrounds: [] })).some((i) => /campgrounds/.test(i)));
  assert.ok(issues(camping({ ghostTowns: [{ name: 'Caribou' }] })).some((i) => /ghost/.test(i)));
  const event = { slug: 'x', kind: 'event', towns: ['niwot', 'lyons'], title: 'X', description: 'X.', date: '2026-11-13' };
  assert.ok(issues(event).some((i) => /source/.test(i)));
  assert.deepEqual(issues({ ...event, sources: [{ label: 'The festival', url: 'https://festival.sundance.org/', checked: '2026-11-13' }] }), []);
});

test('a story names several towns or one, rests on its sources, which may be news reports, and only it carries homeUntil', () => {
  const sun = { label: 'Colorado Sun', url: 'https://coloradosun.com/2026/11/11/eldora-mountain-acquisition-investigation/', checked: '2026-11-13' };
  const story = { slug: 'nederland-eldora', kind: 'story', towns: ['nederland'], title: 'X', description: 'X.', date: '2026-11-13' };
  assert.ok(issues(story).some((i) => /source/.test(i)), 'a story without sources');
  assert.deepEqual(issues({ ...story, sources: [sun] }), [], 'a news report is a source');
  assert.deepEqual(issues({ ...story, towns: ['nederland', 'lyons'], sources: [sun], homeUntil: '2026-11-30' }), []);
  assert.ok(issues({ ...story, sources: [sun], homeUntil: '2026-11-01' }).some((i) => /homeUntil/.test(i)), 'not before its date');
  assert.ok(issues(camping({ homeUntil: '2026-11-30' })).some((i) => /homeUntil/.test(i)), 'only a story');
  assert.equal(articlePath({ kind: 'story', towns: ['nederland'], slug: 'nederland-eldora' }), '/articles/nederland-eldora/');
  assert.equal(storyHomeUntil({ date: '2026-11-13' }), '2026-11-27');
  assert.equal(storyHomeUntil({ date: '2026-11-13', homeUntil: '2026-12-01' }), '2026-12-01');
});

test('an article with an open flag cannot be marked verified; an empty field with no flag can', () => {
  const flagged = camping({ status: 'verified', campgrounds: [{ name: 'A', fee: fact('$30'), flags: [{ field: 'road', note: 'the page does not say' }] }] });
  assert.ok(issues(flagged).some((i) => /open flags/.test(i)));
  assert.ok(issues(camping({ status: 'verified', needs: ['read the fee page again'] })).some((i) => /open flags/.test(i)));
  assert.deepEqual(issues(camping({ status: 'verified' })), [], 'a field left out is left out: the page prints what was confirmed');
});

test('the checklist names every flag and every field of the brief’s left empty', () => {
  const a = curiositySchema.parse(camping({ needs: ['one for the article'], campgrounds: [{ name: 'A', fee: fact('$30'), flags: [{ field: 'road', note: 'the page does not say' }] }] }));
  const items = openItems(a);
  assert.deepEqual(openFlags(a).map((i) => i.field), ['article', 'road']);
  // fee is filled, road is flagged: booking, sites, season and manager are empty.
  assert.deepEqual(items.filter((i) => i.kind === 'empty').map((i) => i.field), ['booking', 'sites', 'season', 'manager']);
  assert.equal(CAMPING_FIELDS.length, 6);
  assert.equal(GHOST_FIELDS.length, 5);
});

test('"Last verified" is the oldest check among the facts, and moves only when that fact is read again', () => {
  const a = curiositySchema.parse(camping({ campgrounds: [{ name: 'A', fee: fact('$30', '2026-11-13'), season: fact('Year-round', '2026-12-01') }] }));
  assert.equal(factsOf(a).length, 2);
  assert.equal(lastVerified(a), '2026-11-13');
  const again = curiositySchema.parse(camping({ campgrounds: [{ name: 'A', fee: fact('$30', '2027-01-12'), season: fact('Year-round', '2026-12-01') }] }));
  assert.equal(lastVerified(again), '2026-12-01');
});

test('an article due to be read again is due until every fact has been', () => {
  const a = curiositySchema.parse(camping({ reverify: { from: '2027-01-11', why: 'the plans are still being published' } }));
  assert.equal(reverifyDue(a, '2027-01-10'), false);
  assert.equal(reverifyDue(a, '2027-01-11'), true);
  const done = curiositySchema.parse(camping({ reverify: { from: '2027-01-11', why: 'x' }, campgrounds: [{ name: 'A', fee: fact('$30', '2027-01-12') }] }));
  assert.equal(reverifyDue(done, '2027-01-13'), false);
});

test('an article’s address is its topic and its town, or /articles/<slug>/ for an event', () => {
  assert.equal(articlePath({ kind: 'camping', towns: ['lyons'], slug: 'camping-lyons' }), '/camping/lyons/');
  assert.equal(articlePath({ kind: 'ghost-towns', towns: ['leadville'], slug: 'ghost-towns-leadville' }), '/ghost-towns/leadville/');
  assert.equal(articlePath({ kind: 'event', towns: ['niwot', 'lyons'], slug: 'sundance' }), '/articles/sundance/');
});

test('a Nearby block lists the articles that name the place, the topics before the event', () => {
  const all = [
    { kind: 'event' as const, towns: ['niwot', 'lyons'], title: 'Sundance' },
    { kind: 'camping' as const, towns: ['lyons'], title: 'Camping near Lyons' },
    { kind: 'ghost-towns' as const, towns: ['nederland'], title: 'Ghost towns near Nederland' },
  ];
  assert.deepEqual(articlesFor(all, 'lyons').map((a) => a.title), ['Camping near Lyons', 'Sundance']);
  assert.deepEqual(articlesFor(all, 'niwot').map((a) => a.title), ['Sundance']);
  assert.deepEqual(articlesFor(all, 'berthoud'), []);
});

// The files in content/hub/curiosity/.
const files = curiosityFiles('.');

test('every article file passes the schema, is named for its slug and names towns the network has', () => {
  for (const f of files) {
    assert.deepEqual(f.issues, [], f.file);
    for (const t of f.article!.towns) assert.ok(placeName(t), `${f.file}: ${t}`);
  }
  const paths = files.map((f) => articlePath(f.article!));
  assert.equal(new Set(paths).size, paths.length, 'two articles at one address');
});

test('an article’s body carries no fact’s source on a guide site, and no logo or artwork', () => {
  for (const f of files) {
    const body = readFileSync(f.file, 'utf8').replace(/^---\n[\s\S]*?\n---/, '');
    for (const [, link] of body.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) assert.ok(!isGuideSite(link!), `${f.file}: ${link}`);
    assert.ok(!/!\[|<img/i.test(body), `${f.file}: an article is text; no image`);
  }
});

test('a draft builds nothing: no route, no index, no sitemap date, without the preview switch', () => {
  const drafts = files.filter((f) => f.article!.status === 'draft').map((f) => f.article!);
  const shown = shownArticles('.', {});
  for (const d of drafts) assert.ok(!shown.some((a) => a.slug === d.slug), d.slug);
  const routes = curiosityRoutes('.', {}).map(([pattern]) => pattern);
  const dates = curiosityDates('.', {});
  for (const d of drafts) {
    assert.ok(!dates.has(articlePath(d)), d.slug);
    if (!isStandalone(d.kind) && !shown.some((a) => a.kind === d.kind)) assert.ok(!routes.some((r) => articlePath(d).startsWith(`${r}/`)), `${d.slug}: ${routes.join(' ')}`);
  }
  if (shown.length === 0) {
    assert.deepEqual(routes, []);
    assert.deepEqual(topicsWithArticles('.', {}), []);
  }
  // With the switch, every draft has its page and its topic its index.
  const preview = curiosityRoutes('.', { [DRAFTS_ENV]: '1' }).map(([pattern]) => pattern);
  // An event article and a story share /articles/<slug>/; a topic has its index and its town pages.
  for (const d of drafts) assert.ok(preview.includes(isStandalone(d.kind) ? '/articles/[slug]' : `/${d.kind}/[town]`), d.slug);
  for (const d of drafts) if (!isStandalone(d.kind)) assert.ok(preview.includes(`/${d.kind}`), d.slug);
});

test('the hub’s sitemap dates take in only the articles on the site', () => {
  const dates = contentDates({ kind: 'hub', slug: 'hub' });
  for (const a of shownArticles('.')) assert.ok(dates.has(articlePath(a)), a.slug);
  for (const f of files) if (f.article!.status === 'draft' && process.env[DRAFTS_ENV] !== '1') assert.ok(!dates.has(articlePath(f.article!)), f.file);
});

test('the byline is the studio’s, not a person’s, and the pages print it, the verified day and the visited label', () => {
  assert.equal(CURIOSITY_BYLINE, 'Lerner Works');
  const page = readFileSync('src/routes/hub/curiosity-article.astro', 'utf8');
  assert.match(page, /'@type': 'Organization', name: CURIOSITY_BYLINE/);
  assert.match(page, /By \{CURIOSITY_BYLINE\}/);
  assert.match(page, /Last verified/);
  assert.match(page, /'Visited' : 'Not personally visited'/);
  assert.match(page, /noindex=\{draft\}/, 'a draft under the preview switch is noindex');
});

test('the Nearby block is links only, on the hub town page and a guide’s things to do', () => {
  const block = readFileSync('src/components/NearbyArticles.astro', 'utf8');
  assert.match(block, /getCuriosity\(\)/, 'only the articles on the site');
  assert.ok(!/description|summary|\.value/.test(block.replace(/^---[\s\S]*?---/, '')), 'no line of an article is copied onto a town page');
  assert.match(readFileSync('src/routes/hub/town.astro', 'utf8'), /<NearbyArticles place=\{town\.slug\} onHub \/>/);
  assert.match(readFileSync('src/routes/town/things-to-do.astro', 'utf8'), /<NearbyArticles place=\{nearPlace\} \/>/);
});
