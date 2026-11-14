/**
 * The hub's town page as data (src/routes/hub/town.astro; the publication
 * redesign of 14 November 2026). The page is a run of numbered sections,
 * Events, Where to stay, Getting here, Outdoor dates and About, each drawn
 * only where the town's files have something for it, and numbered and
 * listed under "On this page" in the order they are drawn. Everything here
 * is pure, so the rules are tested rather than trusted to a template.
 *
 * The profile's values (the facts, the drive and the airport, the lodging
 * and the heritage) are exactly what TownProfile.astro printed before the
 * redesign, from the same files, with the same sources and check dates:
 * the layout changed, not a figure.
 */
import { hubCountyLine, type HubTown } from '../config/hub-towns.ts';
import { BLOCK_MONTHS } from './date-block.ts';
import { monthLabel, type YearMark } from './year-grid.ts';
import type { Airports, RoadMiles, TownFacts } from './near.ts';
import { newestCheck, sourceHost, type TownProfile } from './town-profile.ts';
import { isUpcoming, type TraditionRow } from './traditions.ts';

/* ---------------------------------------------------------------- sections */

export type SectionKey = 'events' | 'stay' | 'getting' | 'outdoor' | 'about';

/** The sections in the page's order, each with its anchor and its words. */
export const SECTION_ORDER: readonly SectionKey[] = ['events', 'stay', 'getting', 'outdoor', 'about'];

/**
 * Each section's anchor. The events and outdoor anchors are the ones a
 * folded guide's old addresses land on (vercel.json) and the site search's
 * shortcuts name (src/lib/town-search-index.ts), so they did not change
 * with the layout.
 */
export const SECTION_IDS: Readonly<Record<SectionKey, string>> = {
  events: 'traditions',
  stay: 'stay',
  getting: 'getting-here',
  outdoor: 'outdoor-dates',
  about: 'about',
};

export interface PageSection {
  key: SectionKey;
  id: string;
  /** "01", "02": the number the section opens with, counted over the sections drawn. */
  number: string;
  /** Its line under "On this page". */
  label: string;
  /** Its heading. */
  title: string;
}

/** The sections a town's page draws, numbered in order; one with nothing in it is left out and the rest close up. */
export function pageSections(town: string, present: Readonly<Record<SectionKey, boolean>>): PageSection[] {
  const words: Record<SectionKey, { label: string; title: string }> = {
    events: { label: 'Event dates', title: `Events and dates in ${town}` },
    stay: { label: 'Where to stay', title: `Where to stay in ${town}` },
    getting: { label: 'Getting here', title: `Getting to ${town}` },
    outdoor: { label: 'Outdoor dates', title: 'Outdoor dates in Colorado' },
    about: { label: `About ${town}`, title: `About ${town}` },
  };
  return SECTION_ORDER.filter((k) => present[k]).map((key, i) => ({
    key,
    id: SECTION_IDS[key],
    number: String(i + 1).padStart(2, '0'),
    ...words[key],
  }));
}

/* ----------------------------------------------------- the year at a glance */

/**
 * Each tradition in the month of its date: the date set where there is
 * one, else the month it was last held. One with no date in any year is
 * left off the grid and stays in the list. The town's own outdoor dates
 * are not marked: the grid is the town's events (as before the redesign).
 */
export function yearMarks(traditions: readonly TraditionRow[], groupOf: (row: TraditionRow) => string): Array<YearMark & { month: number }> {
  return traditions.flatMap((r) => {
    const set = isUpcoming(r);
    const date = set ? r.entry.date : r.lastHeld;
    if (!date) return [];
    const month = Number(date.slice(5, 7)) - 1;
    const base = { slug: r.record.slug, month, group: groupOf(r) };
    return [set ? { ...base, set: true, year: date.slice(0, 4) } : { ...base, set: false, heldYear: date.slice(0, 4), nextYear: r.past ? undefined : String(r.year) }];
  });
}

/** The grid's twelve cells: the month's short name, whether it is the current one, and its marks. */
export function yearGrid(marks: ReadonlyArray<YearMark & { month: number }>, thisMonth: number) {
  return BLOCK_MONTHS.map((short, i) => {
    const own = marks.filter((m) => m.month === i);
    // A month links to the list its first entry is under: a date set before one not yet announced.
    const target = own.find((m) => m.set)?.group ?? own[0]?.group;
    return { month: i, short, now: i === thisMonth, marks: own, target, label: monthLabel(i, own, i === thisMonth) };
  });
}

/* ------------------------------------------------------------ the profile */

export interface ProfileFiles {
  facts?: TownFacts;
  roads?: RoadMiles;
  airports?: Airports;
  bustang?: { checked: string; stops: Array<{ town: string; service: string; detail?: string; seasonal?: string; url: string; source: string; checked: string }> };
  profile?: TownProfile;
}

/**
 * Everything the profile files say about a town, as TownProfile.astro read
 * them: the four figures at a glance and their sources, the drive from
 * Denver, buses and trains, the nearest airport, where to stay, and the
 * heritage. A value nobody confirmed is not in the files and not here.
 */
export function profileView(town: HubTown, { facts, roads, airports, bustang, profile }: ProfileFiles) {
  const bulk = facts?.towns[town.slug];
  const elevation = profile?.facts?.elevationFt?.value ?? bulk?.elevationFt;
  const incorporated = profile?.facts?.incorporated;
  const strip = [
    elevation !== undefined && { label: 'Elevation', value: `${elevation.toLocaleString('en-US')} ft` },
    bulk?.population !== undefined && facts && { label: `Population, ${facts.sources.population.year}`, value: bulk.population.toLocaleString('en-US') },
    { label: town.counties.length > 1 ? 'Counties' : 'County', value: hubCountyLine(town).replace(/ (County|counties)$/, '') },
    incorporated && { label: 'Incorporated', value: String(incorporated.year) },
  ].filter((f): f is { label: string; value: string } => !!f);
  const stripSources = [
    elevation !== undefined && (profile?.facts?.elevationFt ? { name: sourceHost(profile.facts.elevationFt.source), url: profile.facts.elevationFt.source } : facts && { name: `${facts.sources.elevation.name}, at the town’s point in the Geographic Names Information System`, url: facts.sources.elevation.url }),
    bulk?.population !== undefined && facts && { name: `${facts.sources.population.name} (1 July ${facts.sources.population.year})`, url: facts.sources.population.url },
    incorporated && { name: sourceHost(incorporated.source), url: incorporated.source },
  ].filter((s): s is { name: string; url: string } => !!s);

  const fromDenver = roads?.fromDenver[town.slug];
  const nearestAirport = roads?.airport[town.slug];
  const airport = nearestAirport ? airports?.airports.find((a) => a.code === nearestAirport.code) : undefined;
  const transit = [
    ...(bustang?.stops.filter((s) => s.town === town.slug).map((s) => ({ name: s.service, detail: [s.detail, s.seasonal].filter(Boolean).join('. '), url: s.url, checked: s.checked })) ?? []),
    ...(profile?.transit ?? []).map((t) => ({ name: t.name, detail: t.detail, url: t.url, checked: t.checked })),
  ];

  const lodging = profile?.lodging ?? [];
  const h = profile?.heritage;
  const sites = h?.sites ?? [];
  const timeline = [...(h?.timeline ?? [])].sort((a, b) => a.year - b.year);
  const ghostTowns = h?.ghostTowns ?? [];
  const makers = h?.makers ?? [];
  const hasHeritage = !!h && (!!h.nameOrigin || !!h.founded || timeline.length > 0 || sites.length > 0 || ghostTowns.length > 0 || makers.length > 0);
  const heritageItems = h ? [h.nameOrigin, h.founded, ...timeline, ...sites, ...ghostTowns, ...makers] : [];
  const heritageSources = [...new Map(heritageItems.filter((i) => !!i).map((i) => [sourceHost(i!.source), i!.source])).entries()];

  return {
    /** Shown as figures only where there are two or more (as before). */
    strip: strip.length > 1 ? strip : [],
    stripSources,
    factsChecked: facts?.checked,
    fromDenver,
    airport: airport && nearestAirport ? { ...airport, miles: nearestAirport.miles } : undefined,
    airportList: airports?.listSource,
    transit,
    roads,
    lodging,
    lodgingChecked: newestCheck(lodging),
    heritage: hasHeritage && h ? { nameOrigin: h.nameOrigin, founded: h.founded, timeline, sites, ghostTowns, makers } : undefined,
    heritageSources,
    heritageChecked: h ? newestCheck(heritageItems) : undefined,
  };
}

/* ------------------------------------------------------------ the closing */

/**
 * The next town in the same cluster, in the hub's order, coming round to
 * the first after the last: the one link under "More in …". None where the
 * town is the cluster's only page.
 */
export function nextInCluster<T extends Pick<HubTown, 'slug' | 'cluster'>>(town: T, published: readonly T[]): T | undefined {
  const mates = published.filter((t) => t.cluster === town.cluster);
  if (mates.length < 2) return undefined;
  const i = mates.findIndex((t) => t.slug === town.slug);
  return mates[(i + 1) % mates.length];
}

/** "53 mi": the miles formatMiles prints, rounded the same way, in the short unit. */
export function milesShort(miles: number): string {
  const n = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
  return `${n.toLocaleString('en-US')} mi`;
}
