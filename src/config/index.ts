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
import { STANDALONE_GUIDES, findHubTown } from './hub-towns.ts';
import { isMoved, type GuidePlace } from './guide-move.ts';
export { DOMAIN_HELD, GUIDE_MOVE, MOVING_GUIDES, domainHeld, domainMoved, isMoved, moveSwitches } from './guide-move.ts';

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
 * A guide's neighbours that live on the hub (TownConfig.hubNeighbors), each
 * with the address of its page there, in the order the config lists them.
 * `published` is the hub towns whose page is built (publishedHubTownSlugs,
 * src/lib/tradition-files.ts): one without a page is left out, as a guide
 * that has not launched is from neighborsOf.
 */
export function hubNeighborsOf(town: Pick<TownConfig, 'hubNeighbors'>, published: ReadonlySet<string>): Array<{ slug: string; name: string; href: string }> {
  return (town.hubNeighbors ?? []).flatMap((slug) => {
    const page = findHubTown(slug);
    return page && published.has(slug) ? [{ slug, name: page.name, href: `https://${hub.domain}/${slug}/` }] : [];
  });
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
  if (isSectionBuild()) {
    if (site.kind !== 'town' || site.section?.mode !== 'full' || !site.hubPage) {
      throw new Error(`${SECTION_ENV}=1 with TOWN=${slug}: only a town with section.mode "full" and a hub page is built as a section of the hub.`);
    }
    return sectionSite(site);
  }
  return site;
}

/**
 * The switch for building a folded guide as a section of the hub
 * (scripts/run.ts sets it for each `section.mode: 'full'` town after the
 * hub's own build; scripts/lib/section-merge.ts puts the result under
 * /<town>/ in the hub's dist). Without it the same TOWN builds what its
 * own domain's project serves: nothing but redirects.
 */
export const SECTION_ENV = 'HUB_SECTION';
export function isSectionBuild(env: Record<string, string | undefined> = process.env): boolean {
  return env[SECTION_ENV] === '1';
}

/**
 * The site Plausible counts a page under, or none. Every page the hub
 * serves, its own and each section's under /<town>/, counts under the hub's
 * domain when the hub config sets `plausible` (the owner's review of #465,
 * 18 November 2026), so a guide's figures go on after its move as its pages
 * under /<town>/; a guide on its own domain counts under that domain when
 * its config sets `plausible`. Base.astro puts the tracker on the page and
 * /privacy/ says so from this one answer.
 */
export function plausibleDomain(site: SiteConfig, env: Record<string, string | undefined> = process.env): string | undefined {
  if (site.kind === 'hub' || isSectionBuild(env)) return hub.plausible ? hub.domain : undefined;
  return site.plausible ? site.domain : undefined;
}

/** The towns with something of their guide kept under their hub page, by mode; registry order. */
export function sectionTowns(mode?: 'full' | 'pages'): TownConfig[] {
  return towns.filter((t) => !!t.section && !!t.hubPage && (!mode || t.section.mode === mode));
}

/** A section's path prefix on the hub: "/fort-collins" for the config `fortcollins`. */
export function sectionBase(town: Pick<TownConfig, 'hubPage' | 'slug'>): string {
  if (!town.hubPage) throw new Error(`${town.slug} has no hub page, so no section.`);
  return `/${town.hubPage.town}`;
}

/**
 * A folded guide's config as its section on the hub is built from it: live
 * (so the guide's routes and gates apply as they did) and labelled "Inside
 * <Town>" (the owner's brief of 17 November 2026). The domain stays the old
 * one during the build, so an absolute address a template writes is told
 * apart from the hub's own and rewritten to its place under /<town>/
 * (scripts/lib/section-merge.ts).
 */
export function sectionSite(town: TownConfig): TownConfig {
  // A guide moved whole keeps its own name, masthead and contact as they were (the owner's brief of 18 November 2026).
  if (isMoved(town)) return { ...town, status: 'live', neighbors: town.section?.neighbors ?? town.neighbors };
  return { ...town, status: 'live', siteTitle: `Inside ${town.name}`, neighbors: town.section?.neighbors ?? [], social: { ...town.social, email: hub.social.email } };
}

/**
 * Whose events are ingested and re-read each night: every deployed guide,
 * and each full section on the hub, whose events pages are as live as a
 * guide's.
 */
export function eventTowns(): TownConfig[] {
  return towns.filter((t) => LIVE_TOWNS.includes(t.slug) || t.section?.mode === 'full');
}

/**
 * Where a guide's pages are served, with no trailing slash: its own domain,
 * or, once its switch is on (src/config/guide-move.ts), its section on the
 * hub, "https://insidethetowns.com/lyons". Every link one site writes to a
 * guide's page goes through here, so a switch moves every link with it.
 */
export function guideOrigin(t: GuidePlace): string {
  return isMoved(t) && t.hubPage ? `https://${hub.domain}/${t.hubPage.town}` : `https://${t.domain}`;
}

/** A guide's page by path ("/events/x/"), wherever the guide is served. */
export function guideUrl(t: GuidePlace, path = '/'): string {
  return `${guideOrigin(t)}${path.startsWith('/') ? path : `/${path}`}`;
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
