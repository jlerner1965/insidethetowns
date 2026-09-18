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

export type { HubConfig, SiteConfig, TownConfig, NavItem } from './towns/types.ts';

/**
 * Towns that are deployed and public. The hub only links to these, and the
 * NetworkBar only lists these. Add a slug here when its domain is live.
 */
export const LIVE_TOWNS: string[] = ['niwot', 'lyons', 'berthoud', 'erie', 'johnstown', 'timnath'];

/** All configured towns, wave order (live or not). */
export const allTowns: TownConfig[] = towns;

/** All sites including the hub. */
export const allSites: SiteConfig[] = [...towns, hub];

export function findTown(slug: string): TownConfig | undefined {
  return towns.find((t) => t.slug === slug);
}

export function liveTowns(): TownConfig[] {
  return towns.filter((t) => LIVE_TOWNS.includes(t.slug));
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
