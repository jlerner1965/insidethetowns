/**
 * Town-scoped access to the content collections. Every getCollection call in
 * the codebase goes through here so no page can accidentally show another
 * town's content.
 */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { getSite, liveTowns, type TownConfig } from '@/config';
import { isExcluded } from '@/content/schemas';
import { eventExclusion, placeExclusion, presentation, type Exclusion } from '@/lib/freshness';

export type TownEntry<C extends CollectionKey> = CollectionEntry<C> & {
  slug: string;
  /**
   * Set by the gate on a place whose hours it stripped: `stale` when the
   * check is older than the hours window, `closed` when the place is. The
   * page says which, instead of leaving a gap that reads as "no hours".
   */
  hoursHidden?: 'closed' | 'stale';
  /** Set by the gate on a closed place: the page stays, every list and the search index drop it. */
  delisted?: boolean;
};
/** A town's entry seen from the hub, which needs to know whose it is. */
export type NetworkEntry<C extends CollectionKey> = TownEntry<C> & { town: TownConfig };

function slugOf(id: string, townSlug: string): string {
  return id.startsWith(`${townSlug}/`) ? id.slice(townSlug.length + 1) : id;
}

/** Noted once per entry per build, so a page that lists places twice does not say it twice. */
const reported = new Set<string>();

/**
 * The gate every page reads through. An entry that failed its schema, has
 * no source or check date, or (a place) has passed its freshness window is
 * dropped here, with one line on the build log saying which and why. The
 * decision lives in src/lib/freshness.ts; this is the one place it is
 * applied, so no page can forget it.
 */
function publishable<C extends CollectionKey>(collection: C, entries: CollectionEntry<C>[], towns: Map<string, TownConfig>): CollectionEntry<C>[] {
  if (collection !== 'events' && collection !== 'places') return entries;
  const now = new Date();
  return entries.filter((entry) => {
    const townSlug = entry.id.split('/')[0]!;
    const variant = towns.get(townSlug)?.variant ?? 'front-range';
    const why: Exclusion | null =
      collection === 'places' ? placeExclusion(entry.data, variant, now) : eventExclusion(entry.data);
    if (!why) {
      if (collection === 'places') shape(entry as CollectionEntry<'places'>, variant, now);
      return true;
    }
    if (!reported.has(entry.id)) {
      reported.add(entry.id);
      const name = isExcluded(entry.data) ? entry.data.title : (entry.data as { title?: string }).title ?? entry.id;
      console.warn(`excluded ${collection}/${entry.id} (${name}): ${why.detail}`);
    }
    return false;
  });
}

/**
 * What a published listing may still show, applied to the data every page
 * and the structured data read, so a stripped phone number cannot come back
 * through a component that forgot. The decision is `presentation` in
 * src/lib/freshness.ts.
 */
function shape(entry: CollectionEntry<'places'>, variant: TownConfig['variant'], now: Date) {
  const p = presentation(entry.data, variant, now);
  const data = { ...entry.data };
  if (p.hideHours) {
    data.hours = undefined;
    data.openingHours = undefined;
  }
  if (p.hidePhone) data.phone = undefined;
  Object.assign(entry, { data, hoursHidden: p.hoursHidden, delisted: p.delist });
}

/** All entries of a collection for the site being built. Empty for the hub. */
export async function getTownEntries<C extends CollectionKey>(collection: C): Promise<TownEntry<C>[]> {
  const site = getSite();
  if (site.kind === 'hub') return [];
  const prefix = `${site.slug}/`;
  const entries = publishable(collection, await getCollection(collection, (entry) => entry.id.startsWith(prefix)), new Map([[site.slug, site]]));
  return entries.map((entry) => {
    const data = entry.data as { slug?: string };
    const slug = data.slug ?? slugOf(entry.id, site.slug);
    return Object.assign(entry, { slug }) as TownEntry<C>;
  });
}

export async function getTownEntry<C extends CollectionKey>(
  collection: C,
  slug: string,
): Promise<TownEntry<C> | undefined> {
  const entries = await getTownEntries(collection);
  return entries.find((e) => e.slug === slug);
}

/**
 * Every live town's entries, with the town each one belongs to.
 *
 * Only the hub may call this: it is the one site whose job is to look across
 * the towns, and the whole point of getTownEntries is that no town page can
 * reach another town's content by accident. Because all the towns live in one
 * repository, the hub reads them at build time with no feeds, no fetches and
 * nothing to keep in sync.
 */
export async function getNetworkEntries<C extends CollectionKey>(collection: C): Promise<NetworkEntry<C>[]> {
  const site = getSite();
  if (site.kind !== 'hub') {
    throw new Error(`getNetworkEntries() was called while building ${site.domain}. Town pages must use getTownEntries().`);
  }
  const towns = new Map(liveTowns().map((t) => [t.slug, t]));
  const entries = publishable(collection, await getCollection(collection, (entry) => towns.has(entry.id.split('/')[0]!)), towns);
  return entries.map((entry) => {
    const townSlug = entry.id.split('/')[0]!;
    const town = towns.get(townSlug)!;
    const data = entry.data as { slug?: string };
    return Object.assign(entry, { slug: data.slug ?? slugOf(entry.id, townSlug), town }) as NetworkEntry<C>;
  });
}

/**
 * The hub's own entries. Towns use getTownEntries and the hub uses this; the
 * split is what stops either from reaching the other's content by accident.
 */
export async function getHubEntries<C extends CollectionKey>(collection: C): Promise<TownEntry<C>[]> {
  const site = getSite();
  if (site.kind !== 'hub') {
    throw new Error(`getHubEntries() was called while building ${site.domain}. Town pages must use getTownEntries().`);
  }
  const entries = await getCollection(collection, (entry) => entry.id.startsWith('hub/'));
  return entries.map((entry) => {
    const data = entry.data as { slug?: string };
    return Object.assign(entry, { slug: data.slug ?? slugOf(entry.id, 'hub') }) as TownEntry<C>;
  });
}

/**
 * The entries of a town's neighbors, for the one place a town site looks over
 * the fence on purpose: the "nearby this weekend" block on /events/.
 *
 * getTownEntries stays strict, so no town page can reach another town's
 * content by accident. This is the deliberate case, and it is deliberate
 * twice over: the caller names the towns it wants, and every entry comes back
 * carrying its town, so it cannot be rendered as if it were ours.
 */
export async function getNeighborEntries<C extends CollectionKey>(
  collection: C,
  neighbors: readonly TownConfig[],
): Promise<NetworkEntry<C>[]> {
  const towns = new Map(neighbors.map((t) => [t.slug, t]));
  if (towns.size === 0) return [];
  const entries = publishable(collection, await getCollection(collection, (entry) => towns.has(entry.id.split('/')[0]!)), towns);
  return entries.map((entry) => {
    const townSlug = entry.id.split('/')[0]!;
    const data = entry.data as { slug?: string };
    return Object.assign(entry, { slug: data.slug ?? slugOf(entry.id, townSlug), town: towns.get(townSlug)! }) as NetworkEntry<C>;
  });
}
