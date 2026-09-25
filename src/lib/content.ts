/**
 * Town-scoped access to the content collections. Every getCollection call in
 * the codebase goes through here so no page can accidentally show another
 * town's content.
 */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { getSite, liveTowns, type TownConfig } from '@/config';

export type TownEntry<C extends CollectionKey> = CollectionEntry<C> & { slug: string };
/** A town's entry seen from the hub, which needs to know whose it is. */
export type NetworkEntry<C extends CollectionKey> = TownEntry<C> & { town: TownConfig };

function slugOf(id: string, townSlug: string): string {
  return id.startsWith(`${townSlug}/`) ? id.slice(townSlug.length + 1) : id;
}

/** All entries of a collection for the site being built. Empty for the hub. */
export async function getTownEntries<C extends CollectionKey>(collection: C): Promise<TownEntry<C>[]> {
  const site = getSite();
  if (site.kind === 'hub') return [];
  const prefix = `${site.slug}/`;
  const entries = await getCollection(collection, (entry) => entry.id.startsWith(prefix));
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
  const entries = await getCollection(collection, (entry) => towns.has(entry.id.split('/')[0]!));
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
  const entries = await getCollection(collection, (entry) => towns.has(entry.id.split('/')[0]!));
  return entries.map((entry) => {
    const townSlug = entry.id.split('/')[0]!;
    const data = entry.data as { slug?: string };
    return Object.assign(entry, { slug: data.slug ?? slugOf(entry.id, townSlug), town: towns.get(townSlug)! }) as NetworkEntry<C>;
  });
}
