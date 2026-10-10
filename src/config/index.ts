/**
 * Site selection. The TOWN env var picks which site is being built or served:
 *
 *   TOWN=niwot npm run dev
 *   TOWN=hub   npm run build
 *
 * Nothing in the codebase may hard-code a town. Components read from here.
 */
import type { HubConfig, SiteConfig, TownConfig } from './towns/types.ts';
import { towns } from './towns/registry.ts';
import { hub } from './towns/hub.ts';

export type { ConditionsLink, EditorConfig, HubConfig, SiteConfig, TownConfig, TownRegion, TownStatus, TownVariant, NavItem } from './towns/types.ts';
export { TOWN_REGIONS } from './towns/types.ts';
export { countiesCovered, countyLabel, countyShort } from './towns/types.ts';

/**
 * Towns that are deployed and public: every config whose `status` is `live`.
 * The hub only links to these, the NetworkBar only lists these, CI builds
 * only these. Set `status: 'live'` on the town's config when its domain
 * serves; there is no second list to keep in step.
 */
export const LIVE_TOWNS: string[] = towns.filter((t) => t.status === 'live').map((t) => t.slug);

/** All configured towns, wave order (live or not). */
export const allTowns: TownConfig[] = towns;

/** All sites including the hub. */
export const allSites: SiteConfig[] = [...towns, hub];

export function findTown(slug: string): TownConfig | undefined {
  return towns.find((t) => t.slug === slug);
}

/**
 * A to Z, so the same names come in the same order on every page that lists
 * them: the hub's filter, its signup, the submit form and About had the
 * config's own order (Niwot, Lyons, Berthoud…) while the home page and the
 * footer were alphabetical. A page that wants another order sorts its copy.
 */
export function liveTowns(): TownConfig[] {
  return towns.filter((t) => LIVE_TOWNS.includes(t.slug)).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The live mountain guides, A to Z: what the Front Range guides' "Up the hill
 * this weekend" strip (UpTheHill.astro) reads. Decided by `variant`, so a
 * mountain town joins the strip the day it goes live and nothing is listed
 * twice.
 */
export function mountainTowns(): TownConfig[] {
  return liveTowns().filter((t) => t.variant === 'mountain');
}

/**
 * A town's neighbours that have a guide to send a reader to, in the order its
 * config lists them. One that has not launched is left out: its domain does
 * not serve a guide yet.
 */
export function neighborsOf(town: Pick<TownConfig, 'neighbors'>): TownConfig[] {
  return town.neighbors.map((slug) => findTown(slug)).filter((t): t is TownConfig => !!t && LIVE_TOWNS.includes(t.slug));
}

/**
 * The site being built. Reads process.env.TOWN and fails loudly if it is
 * unset or unknown, because a build with the wrong town is worse than no build.
 */
export function getSite(): SiteConfig {
  const slug = process.env.TOWN?.trim();
  const known = allSites.map((s) => s.slug).join(', ');
  if (!slug) {
    throw new Error(
      `TOWN env var is not set. Run e.g. "TOWN=niwot npm run dev" or "npm run dev -- --town=niwot". Known sites: ${known}`,
    );
  }
  const site = allSites.find((s) => s.slug === slug);
  if (!site) {
    throw new Error(`Unknown TOWN "${slug}". Known sites: ${known}. Add a town with "npm run new-town <slug> <Name>".`);
  }
  return site;
}

/** The current site, narrowed to a town. Throws when building the hub. */
export function getTown(): TownConfig {
  const site = getSite();
  if (site.kind !== 'town') {
    throw new Error(`getTown() was called while building the hub (${site.domain}). Use getSite() or getHub().`);
  }
  return site;
}

/** The current site, narrowed to the hub. Throws when building a town. */
export function getHub(): HubConfig {
  const site = getSite();
  if (site.kind !== 'hub') {
    throw new Error(`getHub() was called while building ${site.domain}. Use getSite() or getTown().`);
  }
  return site;
}

export function isHub(site: SiteConfig = getSite()): site is HubConfig {
  return site.kind === 'hub';
}

/** The hub config, from any build. */
export function getNetworkHub(): HubConfig {
  return hub;
}
