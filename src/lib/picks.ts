/**
 * Picks guides (content/<town>/pages/eat-drink.md and things-to-do.md):
 * the picks resolved against the places a page lists, in the guide's
 * order. Pure, so it is tested without a build.
 */

export interface Pick {
  place: string;
  for?: string;
  why: string;
}

/**
 * Each pick with its place, in the guide's order. A pick whose place is not
 * among `places` (closed, delisted or moved to staging since the guide was
 * checked) is dropped rather than drawn as a dead link, and a place named
 * twice is shown once.
 */
export function picksFor<P extends { slug?: string; id?: string }>(picks: readonly Pick[], places: readonly P[]): Array<{ pick: Pick; place: P }> {
  const bySlug = new Map(places.map((p) => [p.slug ?? p.id ?? '', p]));
  const seen = new Set<string>();
  return picks.flatMap((pick) => {
    const place = bySlug.get(pick.place);
    if (!place || seen.has(pick.place)) return [];
    seen.add(pick.place);
    return [{ pick, place }];
  });
}

/** The page's list for its CollectionPage markup: the picks first, in order, then the rest of the directory. */
export function picksFirst<T extends { path: string }>(listing: readonly T[], pickPaths: readonly string[]): T[] {
  const order = new Map(pickPaths.map((p, i) => [p, i]));
  return [...listing].sort((a, b) => (order.get(a.path) ?? Infinity) - (order.get(b.path) ?? Infinity));
}
