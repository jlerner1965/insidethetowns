/**
 * The hub's home page (the layout brief of 13 November 2026, and the fixes
 * brief the same day): what its Guides section shows and how the feature
 * card counts, decided from the content rather than written on the page.
 *
 * The Guides section lists only cards that link to a page that is built
 * and has something on it, and is not drawn at all until one does (the
 * fixes brief: no "coming soon" cards). Two kinds of card:
 *
 * - an article index, Camping or Ghost towns: the hub's own page, live
 *   once the hub builds it (a route in src/integrations/town-routes.ts)
 *   and content/hub/articles/ holds an article in its category;
 * - the featured article, named here and found by its title among every
 *   guide's published articles, on its guide's own domain.
 *
 * Plain functions over plain data, like src/lib/hub-towns.ts, so
 * test/hub-home.test.ts can hold them. Never imports astro:content.
 */

/** A card in the Guides section, always a link to a page that is built. */
export interface HomeTile {
  /** The small label over the title: "Index", "Featured article". */
  eyebrow: string;
  title: string;
  /** One line under the title. */
  line: string;
  href: string;
}

/** The hub's article indexes, in the order the Guides section lists them. */
export const GUIDE_INDEXES: ReadonlyArray<{ category: string; label: string; path: string; line: string }> = [
  { category: 'camping', label: 'Camping', path: '/camping/', line: 'Campgrounds and camping dates across the towns.' },
  { category: 'ghost-towns', label: 'Ghost towns', path: '/ghost-towns/', line: 'The townsites that emptied, and what is left to see.' },
];

/** The featured article, found by title among the network's published articles. */
export const FEATURED_ARTICLE = { title: 'Sundance from the towns next door', match: /\bsundance\b/i } as const;

/** An article as the resolver reads it: the hub's own carries no domain. */
export interface ArticleRef {
  title: string;
  category: string;
  slug: string;
  excerpt?: string;
  /** The guide's domain, for an article on a guide: "insidelyons.com". */
  domain?: string;
}

/** Where an article's page is: on its guide, or on the hub. */
export function articleHref(article: Pick<ArticleRef, 'slug' | 'domain'>): string {
  return article.domain ? `https://${article.domain}/articles/${article.slug}/` : `/articles/${article.slug}/`;
}

/** "/camping/" and "/camping" name the same page. */
const bare = (path: string) => path.replace(/\/$/, '');

/**
 * The index cards that are live: the hub builds the index's page
 * (`routes`, the hub's route patterns) and holds an article in its
 * category. Neither alone: a route with nothing in it is an empty page,
 * and an article with no index page has nowhere to be listed.
 */
export function indexTiles(hubArticles: ReadonlyArray<Pick<ArticleRef, 'category'>>, routes: ReadonlyArray<string>): HomeTile[] {
  const built = new Set(routes.map(bare));
  return GUIDE_INDEXES.filter((index) => built.has(bare(index.path)) && hubArticles.some((a) => a.category === index.category)).map((index) => ({
    eyebrow: 'Index',
    title: index.label,
    line: index.line,
    href: index.path,
  }));
}

/** The featured card, where one of the network's published articles carries its title; else none. */
export function featuredTile(articles: ReadonlyArray<ArticleRef>): HomeTile | undefined {
  const found = articles.find((a) => a.domain && FEATURED_ARTICLE.match.test(a.title));
  if (!found) return undefined;
  return { eyebrow: 'Featured article', title: found.title, line: found.excerpt ?? '', href: articleHref(found) };
}

/**
 * The Guides section's cards, in the brief's order: the indexes, then the
 * feature. Only live ones; empty, the section is not drawn.
 */
export function guideTiles(hubArticles: ReadonlyArray<Pick<ArticleRef, 'category'>>, articles: ReadonlyArray<ArticleRef>, routes: ReadonlyArray<string>): HomeTile[] {
  const featured = featuredTile(articles);
  return [...indexTiles(hubArticles, routes), ...(featured ? [featured] : [])];
}

/**
 * The feature card's count, by town (the fixes brief: "19 of 20 towns'
 * dates confirmed"): how many of the towns on the season page have a date
 * the organizer has confirmed and that is still ahead, out of every town
 * on it. A row with no town of its own (a shared or statewide record) is
 * in neither number.
 */
export function townsConfirmed(rows: ReadonlyArray<{ town?: string; confirmed: boolean }>): { confirmed: number; towns: number } {
  const towns = new Set<string>();
  const confirmed = new Set<string>();
  for (const row of rows) {
    if (!row.town) continue;
    towns.add(row.town);
    if (row.confirmed) confirmed.add(row.town);
  }
  return { confirmed: confirmed.size, towns: towns.size };
}

/** "19 of 20 towns’ dates confirmed. Next: …" */
export function seasonFeatureLine(counts: { confirmed: number; towns: number }, next?: string): string {
  const count = `${counts.confirmed} of ${counts.towns} ${counts.towns === 1 ? 'town’s' : 'towns’'} dates confirmed.`;
  return next ? `${count} Next: ${next}.` : count;
}

/** The names the home's search box suggests as they are typed: the guides and the town pages, A to Z, no name twice. */
export function searchSuggestions(...lists: ReadonlyArray<ReadonlyArray<{ name: string }>>): string[] {
  return [...new Set(lists.flat().map((t) => t.name))].sort((a, b) => a.localeCompare(b));
}

/** The numbers over the home's sections, "01", "02", …, counting only the sections that are drawn. */
export function sectionNumbers<K extends string>(shown: ReadonlyArray<readonly [key: K, drawn: boolean]>): Partial<Record<K, string>> {
  const numbers: Partial<Record<K, string>> = {};
  let n = 0;
  for (const [key, drawn] of shown) if (drawn) numbers[key] = String(++n).padStart(2, '0');
  return numbers;
}
