/**
 * The hub's home page (the layout brief of 13 November 2026, and the fixes
 * brief the same day): what its Guides section shows and how the feature
 * card counts, decided from the content rather than written on the page.
 *
 * The Guides section's cards are the hub's town-anchored articles
 * (src/lib/curiosity.ts): an index card for each topic, Camping and Ghost
 * towns, once the topic has an article on the site (its index page is
 * built then, src/integrations/town-routes.ts curiosityRoutes), and the
 * one featured article, Sundance from the towns next door, once it is on
 * the site. A draft is not on the site, so it makes no card. With no card
 * the section is not drawn at all (the fixes brief: no "coming soon").
 *
 * Plain functions over plain data, like src/lib/hub-towns.ts, so
 * test/hub-home.test.ts can hold them. Never imports astro:content.
 */
import { CURIOSITY_TOPICS, TOPIC_INFO, articlePath, type CuriosityKind } from './curiosity.ts';

/** A card in the Guides section, always a link to a page that is built. */
export interface HomeTile {
  /** The small label over the title: "Index", "Featured article". */
  eyebrow: string;
  title: string;
  /** One line under the title. */
  line: string;
  href: string;
}

/** The featured article's slot (the layout brief): this article, found by its title, once it is on the site. */
export const FEATURED_ARTICLE = { title: 'Sundance from the towns next door', match: /\bsundance\b/i } as const;

/** An article as the cards read it: one already on the site (getCuriosity()). */
export interface ArticleOnSite {
  kind: CuriosityKind;
  title: string;
  description: string;
  slug: string;
  towns: string[];
}

/** The index cards: each topic with an article on the site, in the topics' order, with how many towns it covers. */
export function indexTiles(articles: ReadonlyArray<ArticleOnSite>): HomeTile[] {
  return CURIOSITY_TOPICS.flatMap((topic) => {
    const n = articles.filter((a) => a.kind === topic).length;
    if (n === 0) return [];
    return [{ eyebrow: 'Index', title: TOPIC_INFO[topic].label, line: `Near ${n} ${n === 1 ? 'town' : 'towns'}.`, href: TOPIC_INFO[topic].path }];
  });
}

/** The featured card: the one-off event article that carries the featured title, once it is on the site. */
export function featuredTile(articles: ReadonlyArray<ArticleOnSite>): HomeTile | undefined {
  const found = articles.find((a) => a.kind === 'event' && FEATURED_ARTICLE.match.test(a.title));
  if (!found) return undefined;
  return { eyebrow: 'Featured article', title: found.title, line: found.description, href: articlePath(found) };
}

/** The Guides section's cards, in the brief's order: the indexes, then the feature. Empty, the section is not drawn. */
export function guideTiles(articles: ReadonlyArray<ArticleOnSite>): HomeTile[] {
  const featured = featuredTile(articles);
  return [...indexTiles(articles), ...(featured ? [featured] : [])];
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

/**
 * The registration item for the hub's "Now in the towns": the soonest
 * deadline that closes, since that is the one a reader can miss; where
 * none closes within the window, the soonest that opens. Nothing where
 * there is neither (the audit of 13 November 2026: omit, never fill).
 */
export function pickDeadline<T extends { what: 'opens' | 'closes'; on: Date }>(deadlines: readonly T[]): T | undefined {
  const byDate = [...deadlines].sort((a, b) => a.on.getTime() - b.on.getTime());
  return byDate.find((d) => d.what === 'closes') ?? byDate[0];
}
