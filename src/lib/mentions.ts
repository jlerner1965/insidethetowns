/**
 * Which guide articles mention a place.
 *
 * The articles link to the listings freely ("the walk ends at [LaVern M.
 * Johnson Park](/places/lavern-m-johnson-park/)"); the listings linked back
 * to nothing, so a reader who landed on a place page from a search found the
 * address and hours and no way to the article that explains why to go. The
 * relationship is read off the links the editor already wrote, never guessed
 * from a name: a place is mentioned when an article's body links its page
 * (search-visibility phase 1, 15 October 2026).
 */

type ArticleLike = {
  slug?: string;
  id?: string;
  body?: string;
  data: { title: string; date: Date; excerpt?: string };
};

/** The article paths a body links, in order of appearance. */
export function linkedPlaceSlugs(body: string | undefined): string[] {
  if (!body) return [];
  const slugs: string[] = [];
  for (const m of body.matchAll(/\]\(\/places\/([a-z0-9-]+)\/?(?:[?#][^)]*)?\)/g)) {
    if (!slugs.includes(m[1]!)) slugs.push(m[1]!);
  }
  return slugs;
}

/** The articles whose body links `/places/<slug>/`, newest first. */
export function articlesMentioning<T extends ArticleLike>(articles: readonly T[], placeSlug: string): T[] {
  return articles
    .filter((a) => linkedPlaceSlugs(a.body).includes(placeSlug))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
