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
import { isMoved } from '../config/guide-move.ts';
import { towns } from '../config/towns/registry.ts';
import { dayKey, formatMonthDay, parseLocal } from './dates.ts';
import { TRADITION_TYPE_INFO, byNextDate, countsAsVerified, hasVerifiedDate, isAgencyDate, isListed, isUpcoming, nextRow, onSeasonPage, type TraditionRecord, type TraditionRow } from './traditions.ts';
import { TITLE_LIMIT } from './titles.ts';

/**
 * A town page is published once the town has one named annual event of
 * its own whose next date, or the date it was last held, was read on its
 * organizer's own page (the owner's brief of 12 November 2026; until then
 * the bar was three verified items of any kind). "Its own" is a record
 * whose home is the town (`town.guide`). An outdoor date, a shared date
 * (Trail Ridge Road, listed for six towns) and a statewide one show on the
 * page but do not make one.
 */
export const MIN_OWN_ITEMS = 1;

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

/** The hub towns with a page: one dated event of their own or more. In the registry's order. */
export function publishedHubTowns(records: readonly TraditionRecord[]): HubTown[] {
  return HUB_TOWNS.filter((t) => ownEvents(records, t.slug).length >= MIN_OWN_ITEMS);
}

/** A town's own named annual events with a date read on the organizer's page: what makes its page. */
export function ownEvents(records: readonly TraditionRecord[], town: string): TraditionRecord[] {
  return records.filter((r) => !r.fixture && homeOf(r) === town && !isAgencyDate(r.type) && hasVerifiedDate(r));
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
  const rows = records.filter((r) => appliesTo(r, place)).map((r) => nextRow(r, today)).filter(isListed);
  const sorted = (list: TraditionRow[]) => list.sort(byNextDate);
  return {
    traditions: sorted(rows.filter((r) => !isAgencyDate(r.record.type))),
    outdoor: sorted(rows.filter((r) => isAgencyDate(r.record.type) && !r.record.statewide)),
    statewide: sorted(rows.filter((r) => isAgencyDate(r.record.type) && !!r.record.statewide)),
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
  /** Where a standalone guide's pages are, "https://insideberthoud.com" or its section on the hub (guideOrigin). */
  guideOrigin: (key: string) => string | undefined;
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
  if (onSeasonPage(record)) out.push({ key: 'season', label: `All ${info.plural.toLowerCase()}`, href: `https://${ctx.hubDomain}${info.path}#${record.slug}` });
  if (record.statewide) return out;
  const places = [homeOf(record), ...(record.towns ?? []).map((t) => placeKey(t.slug))].filter((p): p is string => !!p);
  for (const place of [...new Set(places)]) {
    const hubTown = findHubTown(place);
    if (hubTown) {
      if (ctx.published.has(place)) out.push({ key: place, label: hubTown.name, href: `https://${ctx.hubDomain}/${place}/#${record.slug}` });
      continue;
    }
    const origin = ctx.guideOrigin(place);
    if (origin) out.push({ key: place, label: ctx.guideName(place), href: `${origin}/traditions/#${record.slug}` });
  }
  return out;
}

/** A meta description's length, as src/components/SEO.astro clamps it. */
const DESCRIPTION_LIMIT = 155;

/** The first wording that fits a meta description whole; the last where none does. */
export function firstFitting(wordings: readonly string[], limit = DESCRIPTION_LIMIT): string {
  return wordings.find((w) => w.length <= limit) ?? wordings[wordings.length - 1]!;
}

/**
 * A town page's title and description for a search result: the town, the
 * year its next dates fall in, and the next two or three traditions with a
 * date set, each by name and day. Only dates the organizers have
 * published, so the line is as true as the page; a town with none ahead
 * says what the page holds and names no event.
 */
/** What a town page covers besides its dates, for its title and the line under its name (the owner, 18 November 2026). */
export interface TownCovers {
  trails?: boolean;
  stay?: boolean;
  history?: boolean;
}

export function townSearchText(name: string, traditions: readonly TraditionRow[], spotlight?: string, today: string = dayKey(new Date()), covers: TownCovers = {}): { seoTitle: string; description: string } {
  // A showpiece's spotlight leads the title and the list while its date is set, whatever falls before it.
  const upcoming = traditions.filter(isUpcoming).sort((a, b) => a.entry.date!.localeCompare(b.entry.date!));
  const lead = spotlight ? upcoming.find((r) => r.record.slug === spotlight) : undefined;
  const next = (lead ? [lead, ...upcoming.filter((r) => r !== lead)] : upcoming).slice(0, 3);
  // The title says what the page covers (events, trails and things to do), the description keeps the dates.
  const things = covers.trails ? 'events, trails and things to do' : 'events and things to do';
  const more = [covers.trails && 'trails and parks', covers.stay && 'where to stay', 'getting here', covers.history && 'the town’s history'].filter(Boolean).join(', ');
  const titles = (years?: string) => {
    const tail = years ? ` (${years})` : '';
    return [`${name}, Colorado: ${things}${tail}`, `${name}, CO: ${things}${tail}`, `${name}, Colorado: events and things to do${tail}`, `${name}, CO: events and things to do${tail}`, `${name}, CO: events${tail}`];
  };
  const fit = (list: string[]) => list.find((t) => t.length <= TITLE_LIMIT) ?? list[list.length - 1]!;
  if (next.length === 0) {
    return {
      seoTitle: fit(titles()),
      description: firstFitting([
        `${name}, Colorado: its annual events and outdoor dates, with the date each organizer has published or that it has not yet; ${more}; each with the page it was read from.`,
        `${name}, Colorado: annual events and outdoor dates, ${more}, each with its source.`,
        `${name}, Colorado: annual events, ${more}.`,
      ]),
    };
  }
  // A run already under way is named by the day it ends, not a start that has passed.
  const day = (r: TraditionRow) =>
    r.entry.date! < today && r.entry.endDate && r.entry.endDate >= today ? `through ${formatMonthDay(parseLocal(r.entry.endDate))}` : formatMonthDay(parseLocal(r.entry.date!));
  const spanOf = (dates: readonly string[]) => {
    const ys = dates.map((d) => d.slice(0, 4)).sort();
    return ys[0] === ys[ys.length - 1] ? ys[0]! : `${ys[0]}–${ys[ys.length - 1]!.slice(2)}`;
  };
  const yearsOf = next.map((r) => r.entry.date!.slice(0, 4)).sort();
  const first = yearsOf[0]!;
  // The description's years are those of the dates it names.
  const years = spanOf(next.map((r) => r.entry.date!));
  // The title's are those of every date the page has ahead in the next twelve
  // months, not only the three the description names (the review of 19
  // November 2026: Fort Collins, Golden and Brush said 2026 while their pages
  // listed 2027 dates, and Loveland beside them said 2026–27).
  const horizon = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  const titleYears = spanOf([...next, ...upcoming.filter((r) => r.entry.date! <= horizon)].map((r) => r.entry.date!));
  const list = next.map((r) => `${r.record.name} (${day(r)}${r.entry.date!.slice(0, 4) === first ? '' : `, ${r.entry.date!.slice(0, 4)}`})`);
  const words = (n: number) => (n === 1 ? list[0]! : `${list.slice(0, n - 1).join(', ')} and ${list[n - 1]}`);
  // The description whole, never cut mid-sentence (the audit of 17 November 2026): the closing sentence shortens first, then the list.
  const tails = [` Every annual event and outdoor date, with ${more}, each with the page it was read from.`, ` Every annual event and outdoor date, with ${more}.`, ' Every annual event and outdoor date, with its source.', ''];
  const counts = list.map((_, i) => list.length - i);
  return {
    seoTitle: fit(titles(titleYears)),
    description: firstFitting(counts.flatMap((n) => tails.map((tail) => `${name}, Colorado in ${years}: ${words(n)}.${tail}`))),
  };
}

/**
 * The one page that carries a record's Event structured data: its home
 * (the town's page on the hub, or its guide's /traditions/) where that
 * page exists, and the hub's season page otherwise. Returned as a
 * showing's key: a place's slug, or 'season'. Each of the three pages asks
 * whether it is the one and marks the event up only then.
 */
export function eventPage(record: TraditionRecord, ctx: ShowingContext): string {
  const home = homeOf(record);
  return home && showings(record, ctx).some((s) => s.key === home) ? home : 'season';
}

/** The records a standalone guide shows: its own traditions, and every outdoor date that applies to it. */
export function guideRecords(records: readonly TraditionRecord[], key: string): TraditionRecord[] {
  return records.filter((r) => appliesTo(r, key));
}

/**
 * The outdoor dates a standalone guide shows as single lines (its home
 * page, This week): every outdoor date that names the guide and the
 * statewide ones, soonest first, and only those with a date set (the
 * owner, 12 November 2026). A line that only says "not yet announced" is
 * no reason to stop a reader, whether the date is the whole state's or
 * the road's up the canyon: those stay on the guide's /traditions/.
 */
export function guideLines(records: readonly TraditionRecord[], key: string, today: string): TraditionRow[] {
  const { outdoor, statewide } = placeRows(records, key, today);
  return [...outdoor.filter(isUpcoming), ...statewide.filter(isUpcoming)];
}

/** Outdoor dates lead a guide's dates only when this many have a date set. */
export const MIN_OUTDOOR_TO_LEAD = 2;

/**
 * A guide's dates on its home page, in the order they are shown (the
 * owner, 12 November 2026; a rule for every guide, not for one). Both
 * lists hold only rows with a date set. The outdoor dates come first when
 * at least two of the guide's own local ones qualify (a statewide date
 * does not count); with fewer, the guide's own traditions lead and
 * the outdoor dates follow. Either list may be empty, and a page draws
 * nothing for an empty one.
 */
export function guideHomeDates(
  records: readonly TraditionRecord[],
  key: string,
  today: string,
): { lead: 'outdoor' | 'traditions'; outdoor: TraditionRow[]; traditions: TraditionRow[] } {
  const outdoor = guideLines(records, key, today);
  const traditions = placeRows(records, key, today).traditions.filter(isUpcoming);
  // Only the guide's own local dates count toward the two (the owner, 12
  // November 2026, later): a statewide date is shown in the list but never
  // makes the outdoor dates lead. Lyons does not open on meteor showers.
  const local = outdoor.filter((r) => !r.record.statewide).length;
  return { lead: local >= MIN_OUTDOOR_TO_LEAD ? 'outdoor' : 'traditions', outdoor, traditions };
}

/**
 * What is next on a town page, under its name: the soonest date set among
 * the town's own events, which is every type but an outdoor date and a
 * free-admission day; an outdoor or free-admission date only where no
 * event of the town's has a date set; nothing where neither has (the
 * review of 14 November 2026: fourteen heroes showed a boat ramp closing
 * or a ski area opening while the town's own event was coming up, Fort
 * Collins' a Horsetooth Reservoir ramp under a title naming NoCo Winter
 * Wonderland). From 12 November 2026 until then the sooner of the two
 * kinds had won. The lists below the hero are not changed by this.
 */
export function nextUp(traditions: readonly TraditionRow[], outdoor: readonly TraditionRow[]): TraditionRow | undefined {
  return traditions.find(isUpcoming) ?? outdoor.find(isUpcoming);
}

/**
 * The one line under "Across Colorado" on a town page, from the records
 * themselves: how many, and the first few by name, cut at a colon ("Geminid
 * meteor shower: peak night" is "Geminid meteor shower").
 */
export function statewideSummary(rows: readonly TraditionRow[], show = 3): string {
  const names = rows.map((r) => r.record.name.split(':')[0]!.trim());
  const count = `${rows.length} statewide date${rows.length === 1 ? '' : 's'}`;
  if (names.length === 0) return count;
  const listed = names.slice(0, show).join(', ');
  const more = names.length - show;
  return `${count}: ${listed}${more > 0 ? `, and ${more} more` : ''}`;
}

/**
 * A record's own page on the hub (the brief of 13 November 2026: a page
 * for each hub tradition record, so an event has an address of its own to
 * rank, and a folded guide's old event address has somewhere to go). At
 * /<town>/<event>/, where <event> is the record's slug with the leading
 * "<town>-" taken off: golden-candlelight-walk is /golden/candlelight-walk/.
 * No year in the address; the year is in the title. Built for every record
 * whose home is a published hub town page (eventPage); a record whose home
 * is a standalone guide, or that has no home, keeps its row and no page.
 */
export interface HubEventPage {
  record: TraditionRecord;
  /** The hub town's slug: the first segment of the path. */
  town: string;
  /** The second segment. */
  event: string;
  /** "/golden/candlelight-walk/". */
  path: string;
}

/** The second segment of a record's page: its slug without its town's prefix. */
export function eventSegment(record: Pick<TraditionRecord, 'slug'>, town: string): string {
  const prefix = `${town}-`;
  const rest = record.slug.startsWith(prefix) ? record.slug.slice(prefix.length) : record.slug;
  return rest || record.slug;
}

/**
 * The standalone guides moved into the hub (src/config/guide-move.ts), by
 * place key: each record at home in one has its own page under the guide's
 * section, /<town>/<event>/, as a published town page's records do.
 */
const MOVED_PLACES: ReadonlySet<string> = new Set(towns.filter((t) => isMoved(t) && t.hubPage).map((t) => t.hubPage!.town));

/**
 * The town a tradition page is under, as the hub's town pages know one: a
 * hub town, or a guide moved into the hub (src/config/guide-move.ts), whose
 * section at /<town>/ is the town's page. Undefined for any other segment.
 */
export function pageTown(slug: string): Pick<HubTown, 'slug' | 'name' | 'counties'> | undefined {
  const hubTown = findHubTown(slug);
  if (hubTown) return hubTown;
  const guide = towns.find((t) => isMoved(t) && t.hubPage?.town === slug);
  return guide ? { slug, name: guide.name, counties: guide.counties as [string, ...string[]] } : undefined;
}

/** The path of a record's own page, or undefined where it has none (its home is no published hub town page, nor a moved guide's section). */
export function eventPath(record: TraditionRecord, published: ReadonlySet<string>): string | undefined {
  const home = homeOf(record);
  if (!home) return undefined;
  if (!(findHubTown(home) ? published.has(home) : MOVED_PLACES.has(home))) return undefined;
  return `/${home}/${eventSegment(record, home)}/`;
}

/**
 * Every event page the hub builds. Fails, rather than builds two pages at
 * one address or one that takes a route the hub already has, when two
 * records share a path or a town's slug is a reserved first segment
 * (`reserved`: the hub's fixed routes, src/integrations/town-routes.ts).
 *
 * A free-admission day that has passed is on no page (isListed), so it has
 * no page of its own either until its next date is on file: the audit of
 * 17 November 2026 found five such pages in the sitemap with no link to them.
 */
export function hubEventPages(records: readonly TraditionRecord[], published: ReadonlySet<string>, reserved: Iterable<string> = [], today: string = dayKey(new Date())): HubEventPage[] {
  const taken = new Set([...reserved].map((s) => s.replace(/^\/|\/$/g, '').split('/')[0]!).filter(Boolean));
  const out: HubEventPage[] = [];
  const seen = new Map<string, string>();
  for (const record of records) {
    const path = eventPath(record, published);
    if (!path || !isListed(nextRow(record, today))) continue;
    const [town, event] = path.split('/').filter(Boolean) as [string, string];
    if (taken.has(town)) throw new Error(`Event page ${path} (${record.slug}) shadows the hub's /${town}/ route.`);
    const other = seen.get(path);
    if (other) throw new Error(`Event page ${path} is both ${other} and ${record.slug}: two records, one address.`);
    seen.set(path, record.slug);
    out.push({ record, town, event, path });
  }
  return out;
}
