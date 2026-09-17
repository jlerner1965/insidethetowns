/**
 * Town-scoped access to the content collections. Every getCollection call in
 * the codebase goes through here so no page can accidentally show another
 * town's content.
 */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { getSite } from '@/config';

export type TownEntry<C extends CollectionKey> = CollectionEntry<C> & { slug: string };

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
