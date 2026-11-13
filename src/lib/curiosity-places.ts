/**
 * A place an article names (a hub town's slug or a standalone guide's
 * key) as its name and its page: the town page on the hub, or the guide's
 * own site. One function, so the article, the index and the Nearby block
 * name and link a town the same way.
 */
import { findTown, getNetworkHub } from '../config/index.ts';
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
  if (guide && STANDALONE_GUIDES[place]) return { name: guide.name, href: `https://${guide.domain}/`, what: `${guide.name} guide` };
  const town = findHubTown(place);
  if (!town || !opts.withPage.has(place)) return undefined;
  return { name: town.name, href: opts.onHub ? `/${place}/` : `https://${getNetworkHub().domain}/${place}/`, what: `${town.name} town page` };
}
