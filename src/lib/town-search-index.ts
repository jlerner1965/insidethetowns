/**
 * The index the search page carries for exact town-name searches
 * (src/lib/town-search.ts), built from the configs at build time.
 *
 * On the hub: every community guide, with the other names it answers to
 * (the towns it covers, a retired guide's town and title that it took
 * over) and its menu as shortcuts; every town's page of annual dates,
 * with its two sections as shortcuts; and the regions, clusters and
 * counties, each with its towns. On a guide: the guide itself, under its
 * own name and the towns it covers, so a search for the town on its own
 * guide still leads with the guide's sections.
 */
import { allTowns, liveTowns, type SiteConfig, type TownConfig } from '../config/index.ts';
import { HUB_CLUSTERS, STANDALONE_GUIDES, hubCountyLine, type HubTown } from '../config/hub-towns.ts';
import { townNav } from './nav.ts';
import { subTownsOf } from './sub-towns.ts';
import { normalizeTownQuery, type TownDestination, type TownRegion, type TownSearchIndex } from './town-search.ts';

const unique = (terms: Array<string | undefined>): string[] => [...new Set(terms.filter((t): t is string => !!t).map(normalizeTownQuery).filter(Boolean))];
const list = (names: string[]): string => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`);

/** The towns a guide covers besides its own name: its sub-towns and the standalone list, without the guide's own name. */
export function coveredTowns(guide: TownConfig): string[] {
  const names = [...subTownsOf(guide).map((t) => t.label), ...(STANDALONE_GUIDES[guide.slug]?.towns ?? [])];
  return [...new Set(names)].filter((n) => normalizeTownQuery(n) !== normalizeTownQuery(guide.name));
}

/** A community guide as a destination. `base` is '' on the guide's own site and its https origin elsewhere. */
export function guideDestination(guide: TownConfig, base: string, towns: readonly TownConfig[] = allTowns): TownDestination {
  const covered = coveredTowns(guide);
  // A retired guide whose ground this one took: its town's name and its old title lead here too (Inside Frederick).
  const successors = towns.filter((t) => t.retired?.successor === guide.slug);
  return {
    name: guide.name,
    title: guide.siteTitle,
    kind: 'guide',
    url: `${base}/`,
    description: guide.shortTagline ?? guide.tagline,
    shortcuts: townNav(guide).map((n) => ({ label: n.label, href: `${base}${n.href}` })),
    terms: unique([guide.name, guide.siteTitle, guide.slug.replace(/-/g, ' '), ...covered, ...successors.flatMap((t) => [t.name, t.siteTitle])]),
    covers: covered.length > 0 ? list(covered) : undefined,
  };
}

/** A town's page of annual dates on the hub as a destination. */
export function annualDestination(town: HubTown, base: string, towns: readonly TownConfig[] = allTowns): TownDestination {
  const old = town.guide ? towns.find((t) => t.slug === town.guide) : undefined;
  const url = `${base}/${town.slug}/`;
  return {
    name: town.name,
    title: town.name,
    kind: 'annual',
    url,
    description: `The events ${town.name} holds every year and the outdoor dates around it, ${hubCountyLine(town)}.`,
    shortcuts: [
      { label: 'Annual events', href: `${url}#traditions` },
      { label: 'Outdoor dates', href: `${url}#outdoor-dates` },
    ],
    // The old guide's title ("Inside Golden") still names the town; its domain now leads to this page.
    terms: unique([town.name, town.slug.replace(/-/g, ' '), old?.siteTitle]),
  };
}

/** The regions, clusters and counties, each with the guides and the town pages in it; a name with one town or none is left out. */
export function townRegions(guides: readonly TownConfig[], pages: readonly HubTown[], base: string): TownRegion[] {
  const regions = new Map<string, TownRegion>();
  const add = (name: string, town: TownRegion['towns'][number]) => {
    const key = normalizeTownQuery(name);
    const region = regions.get(key) ?? { name, terms: [key], towns: [] };
    if (!region.towns.some((t) => t.url === town.url)) region.towns.push(town);
    regions.set(key, region);
  };
  for (const g of guides) {
    const town = { name: g.name, url: `https://${g.domain}/`, kind: 'guide' as const };
    add(g.region, town);
    for (const c of g.counties) add(`${c} County`, town);
  }
  for (const p of pages) {
    const town = { name: p.name, url: `${base}/${p.slug}/`, kind: 'annual' as const };
    add(p.cluster, town);
    for (const c of p.counties) add(`${c} County`, town);
  }
  const order = (r: TownRegion) => (HUB_CLUSTERS as readonly string[]).indexOf(r.name);
  return [...regions.values()]
    .filter((r) => r.towns.length > 1)
    .map((r) => ({ ...r, towns: [...r.towns].sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === 'guide' ? -1 : 1)) }))
    .sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
}

/** The whole index for the site being built. `pages` are the hub's published town pages (publishedHubTowns()). */
export function townSearchIndex(site: SiteConfig, pages: readonly HubTown[] = []): TownSearchIndex {
  if (site.kind === 'town') return { towns: [guideDestination(site, '')], regions: [] };
  const guides = liveTowns();
  return {
    towns: [...guides.map((g) => guideDestination(g, `https://${g.domain}`)), ...pages.map((p) => annualDestination(p, ''))],
    regions: townRegions(guides, pages, ''),
  };
}

