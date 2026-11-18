/**
 * "Near this town" as data: the nearest towns with a page, by road, and the
 * passes and named routes that join them (src/lib/near.ts,
 * src/config/passes.ts). One function for both pages that show it, so the
 * hub's town page and a guide's /things-to-do/ (NearThisTown.astro) never
 * print different miles for the same pair or link a town differently.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { allTowns, findTown, getNetworkHub, guideUrl } from '../config/index.ts';
import { STANDALONE_GUIDES, findHubTown } from '../config/hub-towns.ts';
import { GETTING_HERE } from '../config/getting-here.ts';
import { PASSES, type Pass } from '../config/passes.ts';
import { winterNote, type GettingHere, type WinterNote } from './getting-here.ts';
import { nearestPlaces, pairKey, passesFor, type Leg, type RoadMiles } from './near.ts';

export interface NearLink {
  name: string;
  href: string;
  /**
   * What lives on from the town's closed guide under its page on the hub
   * (the move of 17 November 2026; `section` on the guide's config): a
   * full section's events page, or the index of the pages kept one by one.
   * A guide's Near block links it beside the town (the owner's brief:
   * Berthoud to Loveland and Longmont, Erie to Lafayette and Longmont).
   */
  section?: { label: string; href: string };
}

export interface NearView {
  /**
   * The nearest towns with a page, nearest first, each with its road miles;
   * where the drive is over a pass closed in winter, the note with the
   * year-round route (src/lib/getting-here.ts).
   */
  near: Array<{ place: string; winter?: WinterNote } & NearLink & Leg>;
  /** The passes and routes that name the place, each with the ends that have a page. */
  passes: Array<{ pass: Pass; ends: NearLink[] }>;
}

/**
 * `withPage` is every place a reader can be sent: the hub's published town
 * pages and the standalone guides. On the hub a town page's link is a
 * path; on a guide it is the hub's full address.
 */
/** Whether a page-by-page section has an index to link: a kept place or guide on disk. */
function sectionHasIndex(slug: string, contentRoot = 'content'): boolean {
  return ['places', 'articles'].some((kind) => {
    const dir = join(contentRoot, slug, kind);
    return existsSync(dir) && readdirSync(dir).some((f) => f.endsWith('.md') && !f.startsWith('_'));
  });
}

export function nearView(place: string, roads: RoadMiles | undefined, withPage: ReadonlySet<string>, onHub: boolean, gettingHere: GettingHere | undefined = GETTING_HERE): NearView {
  const hub = getNetworkHub();
  const link = (slug: string): NearLink | undefined => {
    const hubTown = findHubTown(slug);
    if (hubTown) {
      const base = onHub ? '' : `https://${hub.domain}`;
      const folded = allTowns.find((t) => t.hubPage?.town === slug && t.section);
      const section =
        folded?.section?.mode === 'full'
          ? { label: `Inside ${hubTown.name}`, href: `${base}/${slug}/events/` }
          : folded?.section?.mode === 'pages' && sectionHasIndex(folded.slug)
            ? { label: 'Places', href: `${base}/${slug}/places/` }
            : undefined;
      return { name: hubTown.name, href: `${base}/${slug}/`, ...(section ? { section } : {}) };
    }
    const guide = findTown(STANDALONE_GUIDES[slug]?.guide ?? '');
    return guide ? { name: guide.name, href: guideUrl(guide) } : undefined;
  };
  const near = roads
    ? nearestPlaces(roads, place, withPage).flatMap((n) => {
        const l = link(n.place);
        const winter = winterNote(gettingHere, pairKey(place, n.place), PASSES);
        return l ? [{ ...n, ...l, ...(winter ? { winter } : {}) }] : [];
      })
    : [];
  const passes = passesFor(PASSES, place, withPage).map(({ pass }) => ({
    pass,
    ends: pass.connects.map((s) => link(s)).filter((l): l is NearLink => !!l),
  }));
  return { near, passes };
}
