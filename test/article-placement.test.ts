/**
 * Where an article is listed (the owner, 18 November 2026). An article whose
 * only town is one of the eleven full sections stays in that section, and
 * is on the hub's home ("In the towns") and /articles/ only once the owner
 * features it (`feature: true`, off by default); featured, it stays in its
 * section too. The home shows the five newest featured articles, each until
 * a `homeUntil` where it has one, whatever its kind. /articles/ keeps every
 * other article on the hub, those that name several towns included.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { fullSections, liveTowns, sectionHome } from '../src/config/index.ts';
import { articleSchema } from '../src/content/schemas.ts';
import { DRAFTS_ENV, articlePath, curiositySchema, type CuriosityArticle } from '../src/lib/curiosity.ts';
import { shownArticles } from '../src/lib/curiosity-files.ts';
import { fullSectionPlaces, onHub, sectionOnly } from '../src/lib/curiosity-places.ts';
import { dayKey, parseLocal } from '../src/lib/dates.ts';
import { newsItems } from '../src/lib/hub-home.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const sections = fullSectionPlaces();
const TODAY = '2026-11-18';
/** Drafts included, so a draft for one section (Camping near Berthoud) is held to the rule under the preview switch too. */
const everyArticle = shownArticles('.', { [DRAFTS_ENV]: '1' });
const verified = shownArticles('.', {});
const guideSchema = articleSchema(() => z.any());

/** A full section's own articles, read from disk and held to the schema as the hub reads them: each is its town's alone. */
function sectionArticles(slug: string) {
  const dir = join('content', slug, 'articles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), data: guideSchema.parse(parseFrontmatter(readFileSync(join(dir, f), 'utf8')).data) }));
}

/** "In the towns" as src/routes/hub/index.astro builds it: the hub's articles, then the sections' own. */
function homeItems(articles: readonly CuriosityArticle[], today = TODAY, extra: ReturnType<typeof sectionItem>[] = []) {
  return newsItems(
    [...articles.map((a) => ({ towns: a.towns, feature: a.feature, label: a.slug, title: a.title, line: a.description, href: articlePath(a), date: a.date, until: a.homeUntil, slug: a.slug })), ...extra],
    today,
    5,
  );
}

/** A section article as the home maps it. */
function sectionItem(town: ReturnType<typeof fullSections>[number], a: { slug: string; data: z.infer<typeof guideSchema> }) {
  return {
    towns: [town.slug],
    feature: a.data.feature,
    label: `${town.name} · ${a.data.category}`,
    title: a.data.title,
    line: a.data.excerpt,
    href: `${sectionHome(town)}articles/${a.slug}/`,
    date: dayKey(a.data.date),
    until: a.data.homeUntil && dayKey(a.data.homeUntil),
    slug: a.slug,
  };
}

const estes = fullSections().find((t) => t.slug === 'estes-park')!;
const berthoud = fullSections().find((t) => t.slug === 'berthoud')!;

test('the eleven full sections are known by their guide key and their town page slug', () => {
  assert.equal(fullSections().length, 11);
  for (const t of fullSections()) {
    assert.ok(sections.has(t.slug), t.slug);
    if (t.hubPage) assert.ok(sections.has(t.hubPage.town), t.hubPage.town);
  }
  assert.ok(sections.has('fortcollins') && sections.has('fort-collins'));
});

test('an article is one section’s alone when its only town is a full section, and on the hub then only when featured', () => {
  for (const place of ['berthoud', 'carbon-valley', 'erie', 'estes-park', 'fort-collins', 'fortcollins', 'johnstown', 'longmont', 'loveland', 'lyons', 'niwot', 'windsor']) {
    assert.equal(sectionOnly([place]), true, place);
    assert.equal(onHub({ towns: [place] }), false, `${place}, unfeatured: its section’s alone`);
    assert.equal(onHub({ towns: [place], feature: false }), false, place);
    assert.equal(onHub({ towns: [place], feature: true }), true, `${place}, featured: on the hub too`);
  }
  for (const place of ['leadville', 'nederland', 'creede', 'buena-vista', 'carbondale', 'crested-butte', 'durango', 'salida', 'steamboat-springs']) {
    assert.equal(sectionOnly([place]), false, `${place} is a hub town, not a full section`);
    assert.equal(onHub({ towns: [place] }), true, place);
  }
  assert.equal(onHub({ towns: ['berthoud', 'loveland'] }), true, 'two sections: on the hub');
  assert.equal(onHub({ towns: ['niwot', 'nederland'] }), true, 'a section and a hub town: on the hub');
});

test('an unfeatured section article is on neither / nor /articles/: every one today, the Berthoud breakfast guide among them', () => {
  let count = 0;
  for (const t of fullSections()) {
    for (const a of sectionArticles(t.slug)) {
      count++;
      if (!a.data.feature) assert.equal(onHub({ towns: [t.slug], feature: a.data.feature }), false, `${t.slug}/articles/${a.slug} stays in the ${t.name} section`);
    }
  }
  assert.ok(count > 0, 'the sections have articles to hold to the rule');
  const breakfast = sectionArticles('berthoud').find((a) => a.slug === 'breakfast-and-coffee-in-berthoud');
  assert.ok(breakfast, 'the owner’s example is a Berthoud article');
  assert.equal(breakfast.data.feature, false);
  assert.equal(onHub({ towns: ['berthoud'], feature: breakfast.data.feature }), false);
  // The seven guides are full sections, so the rule covers every article the hub read from them before.
  for (const t of liveTowns()) assert.ok(sectionOnly([t.slug]), t.slug);
});

test('/articles/ keeps the hub’s articles but those for one section alone that are not featured', () => {
  const kept = everyArticle.filter((a) => onHub(a));
  for (const a of kept) assert.ok(a.feature || !sectionOnly(a.towns), `${a.slug} is for one full section, unfeatured, and is not on /articles/`);
  // The drafts anchored to one section's town (Camping near Berthoud, Carbon Valley and Lyons) are left to their section.
  for (const slug of ['camping-berthoud', 'camping-carbon-valley', 'camping-lyons']) {
    const a = everyArticle.find((x) => x.slug === slug);
    if (a) assert.ok(!kept.includes(a), slug);
  }
  // What stays: the articles that name several towns and the hub towns' own.
  const keptSlugs = new Set(kept.map((a) => a.slug));
  for (const slug of [
    'colorado-connector-train-tax',
    'colorado-football-playoffs-2026',
    'creede-repertory-theatre-history',
    'leadville-tabors-silver-fortune',
    'nederland-eldora-purchase',
    'buena-vista-river-park-trail-downtown-hot-springs',
    'carbondale-park-once-main-street-rio-grande-trail',
    'crested-butte-without-a-car',
    'durango-silverton-train-which-trip-booking-parking',
    'salida-downtown-and-arkansas-river-walk',
    'steamboat-hot-springs-old-town-or-strawberry-park',
  ]) {
    assert.ok(keptSlugs.has(slug), `${slug} stays on /articles/`);
  }
  // A featured article anchored to one section's town is listed.
  const camping = everyArticle.find((a) => a.slug === 'camping-berthoud');
  if (camping) assert.ok(onHub({ ...camping, feature: true }));
});

test('the /articles/ page reads every full section’s articles and filters both of its lists through the one rule', () => {
  const page = readFileSync('src/routes/hub/articles-index.astro', 'utf8');
  assert.match(page, /getCuriosity\(\)\)\.map\(\(a\) => a\.data\)\.filter\(\(a\) => onHub\(a, sectionPlaces\)\)/, 'the hub’s articles');
  assert.match(page, /getSectionArticles\(\)\)\.filter\(\(a\) => onHub\(\{ towns: \[a\.town\.slug\], feature: a\.data\.feature \}, sectionPlaces\)\)/, 'the sections’ articles, the four folded ones (Estes Park) included');
  assert.match(page, /href: `\$\{sectionHome\(a\.town\)\}articles\/\$\{a\.slug\}\/`/, 'each at its address in its section');
  const content = readFileSync('src/lib/content.ts', 'utf8');
  assert.match(content, /export async function getSectionArticles\(\)[\s\S]*?fullSections\(\)\.map\(async \(town\) => \(await getSectionEntries\('articles', town\)\)/);
  const intro = page.match(/const intro = '([^']*)'/)?.[1] ?? '';
  assert.ok(intro.length > 0);
  assert.doesNotMatch(intro, /own guide/, 'the intro does not say it holds each town’s own guide articles');
  // One line under the intro, linking each full section's Guides page.
  assert.match(page, /const sections = fullSections\(\)\.map\(\(t\) => \(\{ name: t\.name, href: `\$\{sectionHome\(t\)\}guides\/` \}\)\)/);
  assert.equal((page.match(/data-section-guides/g) ?? []).length, 1);
  assert.match(page, /full sections keeps its own local guides/);
});

test('the home’s In the towns is the five newest featured articles, a featured section article included', () => {
  const items = homeItems(verified);
  assert.ok(items.length <= 5);
  for (const i of items) assert.ok(i.feature, `${i.slug} is featured`);
  // The owner's five, featured on 18 November 2026.
  assert.deepEqual(
    items.map((i) => i.slug).sort(),
    ['colorado-connector-train-tax', 'colorado-football-playoffs-2026', 'creede-repertory-theatre-history', 'leadville-tabors-silver-fortune', 'nederland-eldora-purchase'],
  );
  // A featured Estes Park article, the newest, leads the home and pushes the oldest featured off; it is still its section's article.
  const rmnp = sectionArticles('estes-park').find((a) => a.slug === 'first-visit-to-rocky-mountain-national-park')!;
  const featured = sectionItem(estes, { ...rmnp, data: { ...rmnp.data, feature: true, date: parseLocal('2026-11-18') } });
  const withEstes = homeItems(verified, TODAY, [featured]);
  assert.equal(withEstes[0]!.slug, 'first-visit-to-rocky-mountain-national-park');
  assert.equal(withEstes[0]!.href, 'https://insidethetowns.com/estes-park/articles/first-visit-to-rocky-mountain-national-park/');
  assert.equal(withEstes.length, 5);
  // Unfeatured, the same article and the Berthoud breakfast guide are not there.
  const breakfast = sectionArticles('berthoud').find((a) => a.slug === 'breakfast-and-coffee-in-berthoud')!;
  const unfeatured = [sectionItem(estes, { ...rmnp, data: { ...rmnp.data, date: parseLocal('2026-11-18') } }), sectionItem(berthoud, { ...breakfast, data: { ...breakfast.data, date: parseLocal('2026-11-18') } })];
  assert.ok(!homeItems(verified, TODAY, unfeatured).some((i) => unfeatured.some((u) => u.slug === i.slug)));
  // A featured hub article anchored to one section's town is there too.
  const berthoudStory = { ...verified.find((a) => a.slug === 'nederland-eldora-purchase')!, slug: 'x', towns: ['berthoud'], date: TODAY, feature: true };
  assert.equal(homeItems([...verified, berthoudStory])[0]!.slug, 'x');
});

test('a featured article leaves the home after its homeUntil, whatever its kind: the playoffs the day after the last final', () => {
  const playoffs = verified.find((a) => a.slug === 'colorado-football-playoffs-2026')!;
  assert.equal(playoffs.kind, 'event');
  // CHSAA's brackets, read Nov. 19, 2026: the last final is 5A, Saturday, Dec. 5, 6 pm, at Canvas Stadium.
  assert.equal(playoffs.homeUntil, '2026-12-06');
  assert.ok(homeItems(verified, '2026-12-06').some((i) => i.slug === playoffs.slug), 'on the home through Dec. 6');
  assert.ok(!homeItems(verified, '2026-12-07').some((i) => i.slug === playoffs.slug), 'off it from Dec. 7');
  // An article with no homeUntil stays past the old fortnight, until five newer featured ones push it off.
  assert.ok(homeItems(verified, '2027-03-01').some((i) => i.slug === 'colorado-connector-train-tax'));
  // A section article's homeUntil works the same way.
  const rmnp = sectionArticles('estes-park').find((a) => a.slug === 'first-visit-to-rocky-mountain-national-park')!;
  const dated = sectionItem(estes, { ...rmnp, data: { ...rmnp.data, feature: true, date: parseLocal('2026-11-18'), homeUntil: parseLocal('2026-11-30') } });
  assert.ok(homeItems(verified, '2026-11-30', [dated]).some((i) => i.slug === rmnp.slug));
  assert.ok(!homeItems(verified, '2026-12-01', [dated]).some((i) => i.slug === rmnp.slug));
});

test('homeUntil is for a featured article of any kind; feature is off unless the owner sets it', () => {
  const sources = [{ label: 'S', url: 'https://example.org/', checked: '2026-11-18' }];
  const event = { slug: 'x', kind: 'event', towns: ['niwot', 'lyons'], title: 'T', description: 'D', date: '2026-11-18', sources };
  assert.equal(curiositySchema.parse(event).feature, false);
  assert.ok(curiositySchema.safeParse({ ...event, feature: true, homeUntil: '2026-12-06' }).success, 'a featured event article');
  assert.ok(!curiositySchema.safeParse({ ...event, homeUntil: '2026-12-06' }).success, 'not on an unfeatured event article');
  assert.ok(!curiositySchema.safeParse({ ...event, feature: true, homeUntil: '2026-11-17' }).success, 'not before its date');
  const article = { title: 'T', slug: 'x', date: '2026-11-18', excerpt: 'E', category: 'Families' };
  assert.equal(guideSchema.parse(article).feature, false);
  assert.equal(guideSchema.parse({ ...article, feature: true }).feature, true);
  assert.ok(guideSchema.safeParse({ ...article, feature: true, homeUntil: '2026-12-01' }).success, 'a featured section article');
  assert.ok(!guideSchema.safeParse({ ...article, homeUntil: '2026-12-01' }).success, 'not on an unfeatured one');
  assert.ok(!guideSchema.safeParse({ ...article, feature: true, homeUntil: '2026-11-17' }).success, 'not before its date');
  // No draft is featured: a file the owner has not verified has not been put on the home either.
  for (const a of everyArticle.filter((x) => x.status !== 'verified')) assert.equal(a.feature, false, a.slug);
});

test('the home builds In the towns from the hub’s articles and the sections’ own, under its new line', () => {
  const home = readFileSync('src/routes/hub/index.astro', 'utf8');
  const start = home.indexOf('const news = newsItems(');
  const block = home.slice(start, home.indexOf('HOME_NEWS_LIMIT,', start));
  assert.match(block, /articlesOnSite\.map\(\(a\) => \(\{\s*towns: a\.towns,\s*feature: a\.feature,/);
  assert.match(block, /sectionArticles\.map\(\(a\) => \(\{\s*towns: \[a\.town\.slug\],\s*feature: a\.data\.feature,/);
  assert.match(block, /until: a\.homeUntil,/);
  assert.match(block, /until: a\.data\.homeUntil && dayKey\(a\.data\.homeUntil\),/);
  assert.match(home, /const sectionArticles = await getSectionArticles\(\);/);
  assert.doesNotMatch(home, /networkChanges/, 'no local change on the home');
  assert.match(home, /<p class=\{dek\}>Stories from the towns, each with its sources\.<\/p>/);
  assert.doesNotMatch(home, /News and changes/);
});
