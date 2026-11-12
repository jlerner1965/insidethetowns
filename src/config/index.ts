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
import { editionsOf, type Edition } from '../lib/editions.ts';
import { STANDALONE_GUIDES } from './hub-towns.ts';

export type { ConditionsLink, EditorConfig, HubConfig, NewsletterEdition, SiteConfig, TownConfig, TownRegion, TownStatus, TownVariant, NavItem } from './towns/types.ts';
export type { Edition } from '../lib/editions.ts';
export { editionFor } from '../lib/editions.ts';
export { TOWN_REGIONS } from './towns/types.ts';
export { censusGrowth, countiesCovered, countyLabel, countyShort } from './towns/types.ts';

/**
 * Towns that are deployed and public: every config whose `status` is `live`.
 * CI builds these and the scripts audit, ingest and re-check these. Set
 * `status: 'live'` on the town's config when its domain serves.
 *
 * Not the list of guides a page shows: that is `liveTowns()`, the seven
 * standalone guides. A site can be deployed and listed nowhere (Elizabeth,
 * whose guide stays up until its page on the hub qualifies).
 */
export const LIVE_TOWNS: string[] = towns.filter((t) => t.status === 'live').map((t) => t.slug);

/** Every deployed guide's config, in the registry's order: what the scripts work through. */
export function deployedTowns(): TownConfig[] {
  return towns.filter((t) => LIVE_TOWNS.includes(t.slug));
}

/**
 * Whether a site lists events. Every guide does but a quiet one (`lead:
 * 'updates'`, Niwot, the restructure of 12 November 2026): it builds no
 * events page, so nothing on it or on any other site links to one, and
 * its event files are read by no page.
 */
export function listsEvents(site: SiteConfig): boolean {
  return site.kind === 'hub' || site.lead !== 'updates';
}

/** All configured towns, wave order (live or not). */
export const allTowns: TownConfig[] = towns;

/** All sites including the hub. */
export const allSites: SiteConfig[] = [...towns, hub];

export function findTown(slug: string): TownConfig | undefined {
  return towns.find((t) => t.slug === slug);
}

/**
 * The guides, as every page lists them: the seven standalone guides and no
 * other town, in the order of STANDALONE_GUIDES (src/config/hub-towns.ts):
 * Berthoud, Erie, Johnstown, Windsor, Carbon Valley, Lyons, Niwot. The hub's
 * home page, the menus, the footers, the signup, the newsletter page, the
 * search index, the structured data and About all read this, so the same
 * seven come in the same order everywhere, and a town is added to or taken
 * off every list in one place. (Until 12 November 2026 this was every live
 * config, A to Z, which listed Frederick and Elizabeth as guides.) A guide
 * here that is not yet `live` is left out, as before.
 */
export function liveTowns(): TownConfig[] {
  return Object.values(STANDALONE_GUIDES)
    .map(({ guide }) => towns.find((t) => t.slug === guide))
    .filter((t): t is TownConfig => !!t && LIVE_TOWNS.includes(t.slug));
}

/**
 * The guides the weekly email covers, in the guides' own order: every one but a guide
 * the owner has made quiet (`quiet`) or a visitor guide (`visitorGuide`).
 * The signup, the newsletter page and the Thursday drafts read this, through
 * `emailEditions()`, so neither is promised a weekly issue.
 */
export function emailTowns(): TownConfig[] {
  // Nor a guide that lists no events (`lead: 'updates'`): the email is the
  // week's events, and it has none to send.
  return liveTowns().filter((t) => !t.quiet && !t.visitorGuide && t.lead !== 'updates');
}

/** The weekly email's editions, in the guides' order: shared ones from the hub's config, every other covered guide on its own. */
export function emailEditions(): Edition[] {
  return editionsOf(emailTowns(), hub.newsletter?.editions);
}

/**
 * The live mountain guides (none of the seven is one today): what the Front Range guides' "Up the hill
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
  const guides = new Set(liveTowns().map((t) => t.slug));
  return town.neighbors.map((slug) => findTown(slug)).filter((t): t is TownConfig => !!t && guides.has(t.slug));
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

/** The hub config, from any build. */
export function getNetworkHub(): HubConfig {
  return hub;
}
