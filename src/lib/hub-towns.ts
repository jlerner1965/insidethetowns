/**
 * Where a record shows (the restructure of 12 November 2026): one record,
 * many places. A place is a town page on the hub (src/config/hub-towns.ts)
 * or one of the seven standalone guides, named by one slug space; this
 * file answers, for a set of records, which town pages are published,
 * what each place lists, the line a record carries there, and the links
 * from one showing to the others.
 *
 * Plain functions over plain data, like src/lib/traditions.ts: the pages,
 * the route integration, the validator and the tests share one reading.
 * It never imports astro:content or node:fs.
 */
import { HUB_CLUSTERS, HUB_TOWNS, STANDALONE_GUIDES, findHubTown, hubTownForGuide, type HubTown } from '../config/hub-towns.ts';
import { CURRENT_SEASONS, TRADITION_TYPE_INFO, byNextDate, countsAsVerified, isUpcoming, nextRow, type TraditionRecord, type TraditionRow } from './traditions.ts';

/**
 * A town page is published only when the town has this many verified
 * items of its own (a date read on the source, or, the owner's rule of 12
 * November 2026, the organizer's own word that the event continues while
 * its next date is not announced). "Its own" is a record whose home is the town
 * (`town.guide`): an event held there, or the town's own outdoor date. A
 * shared date (Trail Ridge Road, listed for six towns) and a statewide one
 * show on the page but do not count toward it.
 */
export const MIN_OWN_ITEMS = 3;

/**
 * The slug a record's `town.guide` or `towns[].slug` means, in the one
 * space the pages use: a hub town's slug or a standalone guide's key. A
 * config slug is accepted for either (`fortcollins` is Fort Collins' page,
 * `frederick` the Carbon Valley guide), so a record drafted against the
 * old guide still lands on the right page.
 */
export function placeKey(slug: string): string | undefined {
  if (findHubTown(slug) || STANDALONE_GUIDES[slug]) return slug;
  const hubTown = hubTownForGuide(slug);
  if (hubTown) return hubTown.slug;
  return Object.keys(STANDALONE_GUIDES).find((k) => STANDALONE_GUIDES[k]!.guide === slug);
}

/** The place a record is at home in, if it has one. */
export function homeOf(record: Pick<TraditionRecord, 'town'>): string | undefined {
  return record.town?.guide ? placeKey(record.town.guide) : undefined;
}

/** Whether a record shows at a place: its home, a town it lists, or anywhere when statewide. */
export function appliesTo(record: Pick<TraditionRecord, 'town' | 'towns' | 'statewide'>, place: string): boolean {
  if (record.statewide) return true;
  if (homeOf(record) === place) return true;
  return !!record.towns?.some((t) => placeKey(t.slug) === place);
}

/** The line a record carries at a place: what the date means there. */
export function lineFor(record: Pick<TraditionRecord, 'towns'>, place: string): string | undefined {
  return record.towns?.find((t) => placeKey(t.slug) === place)?.line;
}

/**
 * A town's own verified records: what its page is held to. A record whose
 * home is the town, with a date read on its source or the organizer's own
 * word that it continues (countsAsVerified).
 */
export function ownItems(records: readonly TraditionRecord[], town: string): TraditionRecord[] {
  return records.filter((r) => !r.fixture && homeOf(r) === town && countsAsVerified(r));
}

/** The hub towns with a page: MIN_OWN_ITEMS of their own or more. In the registry's order. */
export function publishedHubTowns(records: readonly TraditionRecord[]): HubTown[] {
  return HUB_TOWNS.filter((t) => ownItems(records, t.slug).length >= MIN_OWN_ITEMS);
}

/** A place's rows in the page's two sections, each soonest first, then A to Z. */
export interface PlaceRows {
  traditions: TraditionRow[];
  /** The place's own outdoor dates and the shared ones that name it. */
  outdoor: TraditionRow[];
  /** Statewide outdoor dates, kept apart: the same on every page. */
  statewide: TraditionRow[];
}

export function placeRows(records: readonly TraditionRecord[], place: string, today: string): PlaceRows {
  const rows = records.filter((r) => appliesTo(r, place)).map((r) => nextRow(r, today));
  const sorted = (list: TraditionRow[]) => list.sort(byNextDate);
  return {
    traditions: sorted(rows.filter((r) => r.record.type !== 'outdoor')),
    outdoor: sorted(rows.filter((r) => r.record.type === 'outdoor' && !r.record.statewide)),
    statewide: sorted(rows.filter((r) => r.record.type === 'outdoor' && !!r.record.statewide)),
  };
}

/** The seasons of a showpiece page, in the order of the year. */
export const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'] as const;
export type Season = (typeof SEASONS)[number];

/** The season a "YYYY-MM-DD" falls in: December to February is winter. */
export function seasonOf(date: string): Season {
  const month = Number(date.slice(5, 7));
  if (month === 12 || month <= 2) return 'Winter';
  if (month <= 5) return 'Spring';
  if (month <= 8) return 'Summer';
  return 'Fall';
}

/**
 * A showpiece page's year: every row under the season of its date, the
 * next one where it is published and the last one otherwise. A row with
 * no date at all (a typical window only) has no season and is returned
 * apart, so nothing is filed under a season nobody read.
 */
export function bySeason(rows: readonly TraditionRow[]): { seasons: Array<{ season: Season; rows: TraditionRow[] }>; undated: TraditionRow[] } {
  const dateOf = (r: TraditionRow) => (isUpcoming(r) ? r.entry.date : r.lastHeld);
  const groups = new Map<Season, TraditionRow[]>(SEASONS.map((s) => [s, []]));
  const undated: TraditionRow[] = [];
  for (const row of rows) {
    const date = dateOf(row);
    if (date) groups.get(seasonOf(date))!.push(row);
    else undated.push(row);
  }
  const inYear = (a: TraditionRow, b: TraditionRow) => dateOf(a)!.slice(5).localeCompare(dateOf(b)!.slice(5)) || a.record.name.localeCompare(b.record.name);
  // Winter runs December to February: December sorts first within it.
  const winter = (a: TraditionRow, b: TraditionRow) => {
    const k = (r: TraditionRow) => (dateOf(r)!.slice(5, 7) === '12' ? '00' : dateOf(r)!.slice(5, 7)) + dateOf(r)!.slice(7);
    return k(a).localeCompare(k(b)) || a.record.name.localeCompare(b.record.name);
  };
  return {
    seasons: SEASONS.map((season) => ({ season, rows: groups.get(season)!.sort(season === 'Winter' ? winter : inYear) })).filter((g) => g.rows.length > 0),
    undated,
  };
}

/**
 * The pages a hub town's page links to: the other published pages in its
 * cluster, then those in the clusters it also links with, each in the
 * registry's order. A town not yet published is not linked.
 */
export function nearbyPages(town: HubTown, published: readonly HubTown[]): HubTown[] {
  const clusters = [town.cluster, ...(town.alsoLinks ?? [])];
  return clusters.flatMap((c) => published.filter((t) => t.cluster === c && t.slug !== town.slug));
}

/** The published pages by cluster, in HUB_CLUSTERS order; an empty cluster is left out. */
export function byCluster(published: readonly HubTown[]): Array<{ cluster: string; towns: HubTown[] }> {
  return HUB_CLUSTERS.map((cluster) => ({ cluster: cluster as string, towns: published.filter((t) => t.cluster === cluster) })).filter((g) => g.towns.length > 0);
}

/** What the links between showings need to know about the network. */
export interface ShowingContext {
  hubDomain: string;
  /** Slugs of the hub towns with a published page. */
  published: ReadonlySet<string>;
  /** A standalone guide's domain, by its key in STANDALONE_GUIDES. */
  guideDomain: (key: string) => string | undefined;
  /** A standalone guide's name, by its key. */
  guideName: (key: string) => string;
}

export interface Showing {
  /** 'season' for the hub's season page, else the place's slug. */
  key: string;
  label: string;
  href: string;
}

/**
 * Everywhere a record shows, as links: the hub's season page for its type
 * where one is set, each published town page it applies to, and each
 * standalone guide, at the record's own row. A statewide record lists the
 * season page alone: it is on every page, and forty links say less than
 * one. A page shows these minus itself, so every showing links to the
 * others.
 */
export function showings(record: TraditionRecord, ctx: ShowingContext): Showing[] {
  const out: Showing[] = [];
  const info = TRADITION_TYPE_INFO[record.type];
  if (CURRENT_SEASONS[record.type]) out.push({ key: 'season', label: `All ${info.plural.toLowerCase()}`, href: `https://${ctx.hubDomain}${info.path}#${record.slug}` });
  if (record.statewide) return out;
  const places = [homeOf(record), ...(record.towns ?? []).map((t) => placeKey(t.slug))].filter((p): p is string => !!p);
  for (const place of [...new Set(places)]) {
    const hubTown = findHubTown(place);
    if (hubTown) {
      if (ctx.published.has(place)) out.push({ key: place, label: hubTown.name, href: `https://${ctx.hubDomain}/${place}/#${record.slug}` });
      continue;
    }
    const domain = ctx.guideDomain(place);
    if (domain) out.push({ key: place, label: ctx.guideName(place), href: `https://${domain}/traditions/#${record.slug}` });
  }
  return out;
}

/** The records a standalone guide shows: its own traditions, and every outdoor date that applies to it. */
export function guideRecords(records: readonly TraditionRecord[], key: string): TraditionRecord[] {
  return records.filter((r) => appliesTo(r, key));
}

/**
 * The shared dates a standalone guide shows as single lines (its home
 * page, This week): every outdoor date that names the guide, soonest
 * first, then the statewide ones that have a date ahead. A statewide
 * date with nothing announced is on the guide's /traditions/ and not
 * here: a line that only says "not yet announced" for the whole state is
 * no reason to stop a reader.
 */
export function guideLines(records: readonly TraditionRecord[], key: string, today: string): TraditionRow[] {
  const { outdoor, statewide } = placeRows(records, key, today);
  return [...outdoor, ...statewide.filter(isUpcoming)];
}
