/**
 * "Near this town" as data: the nearest towns with a page, by road, and the
 * passes and named routes that join them (src/lib/near.ts,
 * src/config/passes.ts). One function for both pages that show it, so the
 * hub's town page and a guide's /things-to-do/ (NearThisTown.astro) never
 * print different miles for the same pair or link a town differently.
 */
import { findTown, getNetworkHub } from '../config/index.ts';
import { STANDALONE_GUIDES, findHubTown } from '../config/hub-towns.ts';
import { PASSES, type Pass } from '../config/passes.ts';
import { nearestPlaces, passesFor, type Leg, type RoadMiles } from './near.ts';

export interface NearLink {
  name: string;
  href: string;
}

export interface NearView {
  /** The nearest towns with a page, nearest first, each with its road miles. */
  near: Array<{ place: string; name: string; href: string } & Leg>;
  /** The passes and routes that name the place, each with the ends that have a page. */
  passes: Array<{ pass: Pass; ends: NearLink[] }>;
}

/**
 * `withPage` is every place a reader can be sent: the hub's published town
 * pages and the standalone guides. On the hub a town page's link is a
 * path; on a guide it is the hub's full address.
 */
export function nearView(place: string, roads: RoadMiles | undefined, withPage: ReadonlySet<string>, onHub: boolean): NearView {
  const hub = getNetworkHub();
  const link = (slug: string): NearLink | undefined => {
    const hubTown = findHubTown(slug);
    if (hubTown) return { name: hubTown.name, href: onHub ? `/${slug}/` : `https://${hub.domain}/${slug}/` };
    const guide = findTown(STANDALONE_GUIDES[slug]?.guide ?? '');
    return guide ? { name: guide.name, href: `https://${guide.domain}/` } : undefined;
  };
  const near = roads
    ? nearestPlaces(roads, place, withPage).flatMap((n) => {
        const l = link(n.place);
        return l ? [{ ...n, ...l }] : [];
      })
    : [];
  const passes = passesFor(PASSES, place, withPage).map(({ pass }) => ({
    pass,
    ends: pass.connects.map((s) => link(s)).filter((l): l is NearLink => !!l),
  }));
  return { near, passes };
}
