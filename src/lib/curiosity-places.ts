/**
 * A place an article names (a hub town's slug or a standalone guide's
 * key) as its name and its page: the town page on the hub, or the guide's
 * own site. One function, so the article, the index and the Nearby block
 * name and link a town the same way.
 */
import { findTown, fullSections, getNetworkHub, guideUrl } from '../config/index.ts';
import { STANDALONE_GUIDES, findHubTown } from '../config/hub-towns.ts';

export interface PlaceLink {
  name: string;
  /** A path on the hub where `onHub`, else a full address. */
  href: string;
  /** "Lyons guide" or "Nederland town page": what the link opens. */
  what: string;
}

export function placeName(place: string): string | undefined {
  return findHubTown(place)?.name ?? findTown(STANDALONE_GUIDES[place]?.guide ?? '')?.name;
}

/**
 * `withPage`: the hub towns whose page is built; a town without one has a
 * name and no link. A standalone guide always has its site.
 */
export function placeLink(place: string, opts: { onHub: boolean; withPage: ReadonlySet<string> }): PlaceLink | undefined {
  const guide = findTown(STANDALONE_GUIDES[place]?.guide ?? '');
  if (guide && STANDALONE_GUIDES[place]) return { name: guide.name, href: guideUrl(guide), what: `${guide.name} guide` };
  const town = findHubTown(place);
  if (!town || !opts.withPage.has(place)) return undefined;
  return { name: town.name, href: opts.onHub ? `/${place}/` : `https://${getNetworkHub().domain}/${place}/`, what: `${town.name} town page` };
}

/**
 * The names an article's towns may give one of the eleven full sections
 * (fullSections, src/config/index.ts): its guide's key and its town page's
 * slug, "fortcollins" and "fort-collins".
 */
export function fullSectionPlaces(): ReadonlySet<string> {
  return new Set(fullSections().flatMap((t) => [t.slug, ...(t.hubPage ? [t.hubPage.town] : [])]));
}

/**
 * Whether an article belongs to one full section alone: its only town is
 * one of the eleven (the owner, 18 November 2026). Such an article stays in
 * its section, on its Guides page and wherever the section lists it, and
 * is on neither the hub's home nor /articles/; its address and the sitemap
 * are as they were. An article that names several towns (the Colorado
 * Connector) stays on the hub. A guide's own article is its guide's town's
 * alone: pass `[town.slug]`.
 */
export function sectionOnly(towns: readonly string[], sections: ReadonlySet<string> = fullSectionPlaces()): boolean {
  return towns.length === 1 && sections.has(towns[0]!);
}
