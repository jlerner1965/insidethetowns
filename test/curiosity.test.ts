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
  ARTICLES_INDEX_PATH,
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
  finalLine,
  gamesByWeek,
  isShown,
  kindLabel,
  lastModified,
  lastVerified,
  newestFirst,
  openFlags,
  openItems,
  reverifyDue,
  townsLine,
} from '../src/lib/curiosity.ts';
import { curiosityDates, curiosityFiles, hasArticles, shownArticles, topicsWithArticles } from '../src/lib/curiosity-files.ts';
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

test('a game shows a score only once it is final, says who advances only then, and lives only on an event article', () => {
  const src = [{ label: 'CHSAA: 4A bracket', url: 'https://chsaanow.com/brackets/football/2026/state/4a', checked: '2026-11-13' }];
  const event = { slug: 'x', kind: 'event', towns: ['johnstown'], title: 'X', description: 'X.', date: '2026-11-13', sources: src };
  const game = (over: Record<string, unknown> = {}) => ({
    class: '4A',
    round: 'Second round',
    kickoff: '2026-11-13T19:00',
    home: { name: 'Roosevelt', seed: 1, section: '#roosevelt-high-school-johnstown' },
    away: { name: 'Montbello', seed: 17 },
    url: 'https://chsaanow.com/sports/football/games/2026/11/13/montbello-at-roosevelt',
    checked: '2026-11-13',
    ...over,
  });
  assert.deepEqual(issues({ ...event, games: [game()] }), [], 'a scheduled game, no venue: the page says so');
  assert.equal(curiositySchema.parse({ ...event, games: [game()] }).games[0]!.status, 'scheduled');
  // No score before the final, and no final without both scores: nothing reads as live.
  assert.ok(issues({ ...event, games: [game({ home: { name: 'Roosevelt', seed: 1, score: 21 }, away: { name: 'Montbello', seed: 17, score: 7 } })] }).some((i) => /final/.test(i)));
  assert.ok(issues({ ...event, games: [game({ status: 'final' })] }).some((i) => /final/.test(i)));
  assert.ok(issues({ ...event, games: [game({ status: 'live' })] }).length > 0, 'there is no live status');
  const final = game({ status: 'final', home: { name: 'Roosevelt', seed: 1, score: 35 }, away: { name: 'Montbello', seed: 17, score: 14 }, next: 'Roosevelt plays Golden or Mesa Ridge on November 20.' });
  assert.deepEqual(issues({ ...event, games: [final] }), []);
  assert.ok(issues({ ...event, games: [game({ next: 'Roosevelt advances.' })] }).some((i) => /final/.test(i)), 'who advances waits for the final');
  assert.equal(finalLine(curiositySchema.parse({ ...event, games: [final] }).games[0]!), 'Roosevelt 35, Montbello 14', 'the winner first');
  assert.ok(issues({ ...event, games: [game({ kickoff: '2026-11-13 7pm' })] }).some((i) => /kickoff/.test(i)));
  assert.ok(issues(camping({ games: [game()] })).some((i) => /event article/.test(i)), 'only an event article');
  // An update may carry its time, for a page that changes more than once a day.
  assert.deepEqual(issues({ ...event, updated: { date: '2026-11-14', time: '22:30', note: 'Friday’s finals.' } }), []);
  assert.ok(issues({ ...event, updated: { date: '2026-11-14', time: '10 pm', note: 'n' } }).some((i) => /HH:MM/.test(i)));
  // A game's check counts toward "Last verified" and the reverify reminder.
  assert.equal(lastVerified({ ...curiositySchema.parse(event), games: [curiositySchema.parse({ ...event, games: [game({ checked: '2026-11-10' })] }).games[0]!] }), '2026-11-10');
});

test('the schedule groups games by weekend, the newest first, so earlier results stay under this week’s games', () => {
  const g = (kickoff: string) => ({ kickoff }) as Parameters<typeof gamesByWeek>[0][number];
  const weeks = gamesByWeek([g('2026-11-13T19:00'), g('2026-11-20T19:00'), g('2026-11-12T19:00'), g('2026-11-14T13:00'), g('2026-11-21T13:00')]);
  assert.deepEqual(
    weeks.map((w) => [w.first, w.last, w.games.length]),
    [
      ['2026-11-20', '2026-11-21', 2],
      ['2026-11-12', '2026-11-14', 3],
    ],
  );
  assert.deepEqual(weeks[1]!.games.map((x) => x.kickoff), ['2026-11-12T19:00', '2026-11-13T19:00', '2026-11-14T13:00'], 'kickoff order within a weekend');
  assert.deepEqual(gamesByWeek([]), []);
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
  // An update with a time prints it in Mountain Time, and the same instant is the dateModified.
  assert.match(page, /\$\{formatTime\(updatedAt\)\} MT/);
  assert.match(page, /const modified = updatedAt && lastModified\(data\) === data\.updated!\.date \? `\$\{data\.updated!\.date\}T\$\{data\.updated!\.time\}`/);
  assert.match(page, /Venue not yet confirmed/, 'a game with no named venue says so, never a guess');
});

test('the Nearby block is links only, on the hub town page and a guide’s things to do', () => {
  const block = readFileSync('src/components/NearbyArticles.astro', 'utf8');
  assert.match(block, /getCuriosity\(\)/, 'only the articles on the site');
  assert.ok(!/description|summary|\.value/.test(block.replace(/^---[\s\S]*?---/, '')), 'no line of an article is copied onto a town page');
  assert.match(readFileSync('src/routes/hub/town.astro', 'utf8'), /<NearbyArticles place=\{town\.slug\} onHub \/>/);
  assert.match(readFileSync('src/routes/town/things-to-do.astro', 'utf8'), /<NearbyArticles place=\{nearPlace\} \/>/);
});

test('/articles/ lists every article on the site, the newest first, each with its kind and towns', () => {
  assert.equal(ARTICLES_INDEX_PATH, '/articles/');
  assert.deepEqual(['event', 'story', 'camping', 'ghost-towns'].map((k) => kindLabel(k as Parameters<typeof kindLabel>[0])), ['Event', 'News', 'Camping', 'Ghost towns']);
  const list = [
    { date: '2026-11-12', title: 'Sundance' },
    { date: '2026-11-13', title: 'Nederland and Eldora' },
    { date: '2026-11-13', title: 'Colorado football playoffs' },
  ];
  assert.deepEqual(newestFirst(list).map((a) => a.title), ['Colorado football playoffs', 'Nederland and Eldora', 'Sundance']);
  assert.equal(list[0]!.title, 'Sundance', 'the list it is given is left as it was');
  assert.equal(townsLine(['Nederland']), 'Nederland');
  assert.equal(townsLine(['Niwot', 'Lyons', 'Erie']), 'Niwot · Lyons · Erie');
  assert.equal(townsLine(['Niwot', 'Lyons', 'Erie', 'Longmont']), 'Niwot · Lyons · Erie · 1 more town');
  assert.equal(townsLine(['A', 'B', 'C', 'D', 'E']), 'A · B · C · 2 more towns');
});

test('the index at /articles/ is built, and on the hub’s menu and home, only while an article is on the site', () => {
  const routes = curiosityRoutes('.', {}).map(([pattern]) => pattern);
  assert.equal(routes.includes('/articles'), shownArticles('.', {}).length > 0);
  assert.equal(hasArticles('.', {}), shownArticles('.', {}).length > 0);
  // Under the preview switch every draft is shown, so the index is built.
  if (files.length > 0) assert.ok(curiosityRoutes('.', { [DRAFTS_ENV]: '1' }).some(([pattern, file]) => pattern === '/articles' && file === 'articles-index.astro'));
  const page = readFileSync('src/routes/hub/articles-index.astro', 'utf8');
  assert.match(page, /getCuriosity\(\)/, 'only the articles on the site');
  assert.match(page, /newestFirst\(/);
  assert.match(page, /' · Draft'/, 'a draft under the preview switch says so');
  const home = readFileSync('src/routes/hub/index.astro', 'utf8');
  assert.match(home, /href=\{ARTICLES_INDEX_PATH\}[^>]*>All articles →</);
  // The home page draws its own masthead menu; it carries Articles too, after Towns.
  assert.match(home, /label: 'Towns', href: '#towns' \},[\s\S]{0,160}articlesOnSite\.length > 0 && \{ label: 'Articles', href: ARTICLES_INDEX_PATH \}/);
});

test('an update carries its day and a line on what changed, and the page’s modified day is never before it was published', () => {
  const base = {
    slug: 'x', kind: 'story', towns: ['nederland'], title: 'T', description: 'D', date: '2026-11-13',
    sources: [{ label: 'S', url: 'https://example.org/', checked: '2026-11-12' }],
  };
  assert.ok(curiositySchema.safeParse({ ...base, updated: { date: '2026-11-20', note: 'Rewritten with the Town’s records.' } }).success);
  assert.ok(!curiositySchema.safeParse({ ...base, updated: { date: '2026-11-12', note: 'Before the article.' } }).success, 'not before the article’s date');
  assert.ok(!curiositySchema.safeParse({ ...base, updated: { date: '2026-11-20' } }).success, 'an update says what changed');
  const a = curiositySchema.parse(base);
  // Read the day before it was written: modified is the day it was published, not earlier.
  assert.equal(lastModified(a), '2026-11-13');
  assert.equal(lastModified(curiositySchema.parse({ ...base, updated: { date: '2026-11-20', note: 'n' } })), '2026-11-20');
  assert.equal(lastModified(curiositySchema.parse({ ...base, sources: [{ label: 'S', url: 'https://example.org/', checked: '2026-11-25' }] })), '2026-11-25');
  const page = readFileSync('src/routes/hub/curiosity-article.astro', 'utf8');
  assert.match(page, /dateModified: toIsoLocal\(parseLocal\(modified\)\)/);
  assert.match(page, /Published <time datetime=\{data\.date\}>/);
  assert.match(page, /Update, \{day\(data\.updated\.date\)\}:/);
});
