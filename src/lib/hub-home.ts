/**
 * The hub's home page (the layout brief of 13 November 2026): what its
 * Guides section shows, decided from the content rather than written on
 * the page, so a tile turns from "coming soon" into a link the day its
 * pages exist and nobody edits the home page for it.
 *
 * The two article indexes, Camping and Ghost towns, are the hub's own:
 * each is live once content/hub/articles/ holds an article in its
 * category, and until then its tile says so and links nowhere (the brief:
 * the three tiles work even while the indexes are empty). The featured
 * slot is one article, named here, found by its title among every guide's
 * articles the day it is published.
 *
 * Plain functions over plain data, like src/lib/hub-towns.ts, so
 * test/hub-home.test.ts can hold them. Never imports astro:content.
 */

/** A tile in the Guides section: a link where its pages exist, else "coming soon". */
export interface HomeTile {
  /** The small label over the title: "Index", "Featured article". */
  eyebrow: string;
  title: string;
  /** One line under the title. */
  line: string;
  /** Where the tile goes. Absent, the tile is not a link and says `note`. */
  href?: string;
  /** What a tile without a link says in the link's place. */
  note?: string;
}

/** The hub's article indexes, in the order the Guides section lists them. */
export const GUIDE_INDEXES: ReadonlyArray<{ category: string; label: string; path: string; line: string }> = [
  { category: 'camping', label: 'Camping', path: '/camping/', line: 'Campgrounds and camping dates across the towns.' },
  { category: 'ghost-towns', label: 'Ghost towns', path: '/ghost-towns/', line: 'The townsites that emptied, and what is left to see.' },
];

/**
 * The featured article: the third tile. Found by title among the network's
 * articles once it is published; until then the tile carries its title and
 * "coming soon".
 */
export const FEATURED_ARTICLE = { title: 'Sundance from the towns next door', match: /\bsundance\b/i } as const;

export const COMING_SOON = 'Coming soon';

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

/** The index tiles, each a link once the hub has an article in its category. */
export function indexTiles(hubArticles: ReadonlyArray<Pick<ArticleRef, 'category'>>): HomeTile[] {
  return GUIDE_INDEXES.map((index) => {
    const live = hubArticles.some((a) => a.category === index.category);
    return { eyebrow: 'Index', title: index.label, line: index.line, ...(live ? { href: index.path } : { note: COMING_SOON }) };
  });
}

/** The featured tile: the named article where one of the network's articles carries its title, else its title and "coming soon". */
export function featuredTile(articles: ReadonlyArray<ArticleRef>): HomeTile {
  const found = articles.find((a) => FEATURED_ARTICLE.match.test(a.title));
  if (!found) return { eyebrow: 'Featured article', title: FEATURED_ARTICLE.title, line: 'One story from across the towns, when it is published.', note: COMING_SOON };
  return { eyebrow: 'Featured article', title: found.title, line: found.excerpt ?? '', href: articleHref(found) };
}

/** The three tiles of the Guides section, in the brief's order: the two indexes, then the feature. */
export function guideTiles(hubArticles: ReadonlyArray<Pick<ArticleRef, 'category'>>, articles: ReadonlyArray<ArticleRef>): HomeTile[] {
  return [...indexTiles(hubArticles), featuredTile(articles)];
}

/**
 * The feature card's one line of facts about a season page: how many dates
 * the organizers have confirmed, across how many towns, and the next one.
 */
export function seasonFeatureLine(counts: { confirmed: number; towns: number }, next?: string): string {
  const dates = `${counts.confirmed} ${counts.confirmed === 1 ? 'date' : 'dates'} confirmed`;
  const towns = counts.towns > 0 ? ` across ${counts.towns} ${counts.towns === 1 ? 'town' : 'towns'}` : '';
  return next ? `${dates}${towns}. Next: ${next}.` : `${dates}${towns}.`;
}

/** The names the home's search box suggests as they are typed: the guides and the town pages, A to Z, no name twice. */
export function searchSuggestions(...lists: ReadonlyArray<ReadonlyArray<{ name: string }>>): string[] {
  return [...new Set(lists.flat().map((t) => t.name))].sort((a, b) => a.localeCompare(b));
}
