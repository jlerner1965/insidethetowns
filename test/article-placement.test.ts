/**
 * Where an article is listed (the owner, 18 November 2026). An article whose
 * only town is one of the eleven full sections stays in that section: it is
 * on neither the hub's home ("In the towns") nor /articles/. The home shows
 * the five newest featured articles (`feature: true`, off by default), and
 * /articles/ keeps every other article on the hub, those that name several
 * towns included.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { fullSections, liveTowns } from '../src/config/index.ts';
import { articleSchema } from '../src/content/schemas.ts';
import { DRAFTS_ENV, articlePath, curiositySchema, type CuriosityArticle } from '../src/lib/curiosity.ts';
import { shownArticles } from '../src/lib/curiosity-files.ts';
import { fullSectionPlaces, sectionOnly } from '../src/lib/curiosity-places.ts';
import { newsItems } from '../src/lib/hub-home.ts';
import { parseFrontmatter } from '../scripts/lib/frontmatter.ts';

const sections = fullSectionPlaces();
const TODAY = '2026-11-18';
/** Drafts included, so a draft for one section (Camping near Berthoud) is held to the rule under the preview switch too. */
const everyArticle = shownArticles('.', { [DRAFTS_ENV]: '1' });
const verified = shownArticles('.', {});

/** A guide's own articles, read from disk as the hub reads them: each is its guide's town's alone. */
function guideArticles(slug: string): Array<{ slug: string; title: string; data: Record<string, unknown> }> {
  const dir = join('content', slug, 'articles');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const { data } = parseFrontmatter(readFileSync(join(dir, f), 'utf8'));
      return { slug: f.replace(/\.md$/, ''), title: String(data.title), data };
    });
}

/** "In the towns" as src/routes/hub/index.astro builds it from the hub's articles. */
function homeItems(articles: readonly CuriosityArticle[], today = TODAY) {
  return newsItems(
    articles.map((a) => ({ towns: a.towns, feature: a.feature, label: a.slug, title: a.title, line: a.description, href: articlePath(a), date: a.date, until: a.homeUntil, slug: a.slug })),
    today,
    5,
  );
}

test('the eleven full sections are known by their guide key and their town page slug', () => {
  assert.equal(fullSections().length, 11);
  for (const t of fullSections()) {
    assert.ok(sections.has(t.slug), t.slug);
    if (t.hubPage) assert.ok(sections.has(t.hubPage.town), t.hubPage.town);
  }
  assert.ok(sections.has('fortcollins') && sections.has('fort-collins'));
});

test('an article is one section’s alone when its only town is a full section', () => {
  for (const place of ['berthoud', 'carbon-valley', 'erie', 'estes-park', 'fort-collins', 'fortcollins', 'johnstown', 'longmont', 'loveland', 'lyons', 'niwot', 'windsor']) {
    assert.equal(sectionOnly([place]), true, place);
  }
  for (const place of ['leadville', 'nederland', 'creede', 'buena-vista', 'carbondale', 'crested-butte', 'durango', 'salida', 'steamboat-springs']) {
    assert.equal(sectionOnly([place]), false, `${place} is a hub town, not a full section`);
  }
  assert.equal(sectionOnly(['berthoud', 'loveland']), false, 'two sections: on the hub');
  assert.equal(sectionOnly(['niwot', 'nederland']), false, 'a section and a hub town: on the hub');
});

test('every guide’s own article is its section’s alone, so neither / nor /articles/ lists one', () => {
  // The hub's /articles/ read its guide rows from the live guides (getNetworkEntries); every one is a full section.
  const guides = liveTowns();
  assert.ok(guides.length > 0);
  let count = 0;
  for (const t of guides) {
    for (const a of guideArticles(t.slug)) {
      count++;
      assert.equal(sectionOnly([t.slug]), true, `${t.slug}/articles/${a.slug} stays in the ${t.name} section`);
    }
  }
  assert.ok(count > 0, 'the guides have articles to hold to the rule');
  assert.ok(guideArticles('berthoud').some((a) => a.slug === 'breakfast-and-coffee-in-berthoud'), 'the owner’s example is a Berthoud article');
  // And every article of the four folded sections, which the hub never listed, is one section's too.
  for (const t of fullSections()) assert.equal(sectionOnly([t.slug]), true, t.slug);
});

test('/articles/ keeps the hub’s articles but those for one section alone', () => {
  const kept = everyArticle.filter((a) => !sectionOnly(a.towns));
  const dropped = everyArticle.filter((a) => sectionOnly(a.towns));
  for (const a of kept) assert.ok(!(a.towns.length === 1 && sections.has(a.towns[0]!)), `${a.slug} is for one full section and is not on /articles/`);
  // The drafts anchored to one section's town (Camping near Berthoud, Carbon Valley and Lyons) are left to their section.
  for (const slug of ['camping-berthoud', 'camping-carbon-valley', 'camping-lyons']) {
    if (everyArticle.some((a) => a.slug === slug)) assert.ok(dropped.some((a) => a.slug === slug), slug);
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
});

test('the /articles/ page filters both of its lists through the one rule, and says where the local guides are', () => {
  const page = readFileSync('src/routes/hub/articles-index.astro', 'utf8');
  assert.match(page, /getCuriosity\(\)\)\.map\(\(a\) => a\.data\)\.filter\(\(a\) => !sectionOnly\(a\.towns, onHub\)\)/, 'the hub’s articles');
  assert.match(page, /getNetworkEntries\('articles'\)\)\.filter\(\(a\) => !sectionOnly\(\[a\.town\.slug\], onHub\)\)/, 'the guides’ articles');
  const intro = page.match(/const intro = '([^']*)'/)?.[1] ?? '';
  assert.ok(intro.length > 0);
  assert.doesNotMatch(intro, /own guide/, 'the intro no longer says it holds each town’s own guide articles');
  // One line under the intro, linking each full section's Guides page.
  assert.match(page, /const sections = fullSections\(\)\.map\(\(t\) => \(\{ name: t\.name, href: `\$\{sectionHome\(t\)\}guides\/` \}\)\)/);
  assert.equal((page.match(/data-section-guides/g) ?? []).length, 1);
  assert.match(page, /full sections keeps its own local guides/);
});

test('the home’s In the towns is the five newest featured articles, never one for a single section', () => {
  const items = homeItems(verified);
  assert.ok(items.length <= 5);
  for (const i of items) {
    assert.ok(i.feature, `${i.slug} is featured`);
    assert.ok(!sectionOnly(i.towns), `${i.slug} is for one full section and is not on the home`);
  }
  // The owner's five, featured on 18 November 2026.
  assert.deepEqual(
    items.map((i) => i.slug).sort(),
    ['colorado-connector-train-tax', 'colorado-football-playoffs-2026', 'creede-repertory-theatre-history', 'leadville-tabors-silver-fortune', 'nederland-eldora-purchase'],
  );
  // They stay past the old fortnight: on until five newer featured articles push them off.
  assert.equal(homeItems(verified, '2027-03-01').length, 5);
  // Featuring an article for one section does not bring it to the home.
  const berthoudOnly = { ...verified.find((a) => a.slug === 'nederland-eldora-purchase')!, slug: 'x', towns: ['berthoud'], date: TODAY, feature: true };
  assert.ok(!homeItems([...verified, berthoudOnly]).some((i) => i.slug === 'x'));
  // Under the preview switch too: no draft for one section reaches the home.
  for (const i of homeItems(everyArticle)) assert.ok(!sectionOnly(i.towns), i.slug);
});

test('the home builds In the towns from the hub’s articles alone, each with its towns and its feature flag', () => {
  const home = readFileSync('src/routes/hub/index.astro', 'utf8');
  const block = home.slice(home.indexOf('const news = newsItems('), home.indexOf('const news = newsItems(') + 800);
  assert.match(block, /articlesOnSite\.map\(\(a\) => \(\{\s*towns: a\.towns,\s*feature: a\.feature,/);
  assert.doesNotMatch(home, /networkChanges|getNetworkEntries\('articles'\)/, 'no local change and no guide article on the home');
});

test('feature is off unless the owner sets it, on the hub’s articles and the guides’ alike', () => {
  const story = { slug: 'x', kind: 'story', towns: ['nederland'], title: 'T', description: 'D', date: '2026-11-18', sources: [{ label: 'S', url: 'https://example.org/', checked: '2026-11-18' }] };
  assert.equal(curiositySchema.parse(story).feature, false);
  assert.equal(curiositySchema.parse({ ...story, feature: true }).feature, true);
  const guide = articleSchema(() => z.any());
  const article = { title: 'T', slug: 'x', date: '2026-11-18', excerpt: 'E', category: 'Families' };
  assert.equal(guide.parse(article).feature, false);
  assert.equal(guide.parse({ ...article, feature: true }).feature, true);
  // No draft is featured: a file the owner has not verified has not been put on the home either.
  for (const a of everyArticle.filter((x) => x.status !== 'verified')) assert.equal(a.feature, false, a.slug);
});
