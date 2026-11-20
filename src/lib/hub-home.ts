/**
 * The hub's home page (the redesign of 13 November 2026, the approved
 * mockup in docs/design/hub-home-mockup.html): what each section shows,
 * decided from the content rather than written on the page.
 *
 *   - The annual-events feature: the current season's count, by town.
 *   - This weekend: one listing a day, Friday to Sunday. Friday's is the
 *     week's high-school football game where the scores data has one on
 *     that day (`fridayGame`), else, like Saturday's and Sunday's, the best
 *     one-off the organizer's own page or a person has confirmed
 *     (`weekendPicks`), never the same town twice.
 *   - Each row's check line, in the words its guide's own page uses
 *     (`provenanceText`, `deadlineSourceText`, `changeSourceText`,
 *     `sportsSourceText`).
 *   - The index of the seven guides: each one's name, as the towns it
 *     covers make it, and its one line.
 *
 * Plain functions over plain data, like src/lib/hub-towns.ts, so
 * test/hub-home.test.ts can hold them. Imports astro:content for its types only.
 */
import type { CollectionEntry } from 'astro:content';
import { STANDALONE_GUIDES } from '../config/hub-towns.ts';
import type { SchoolSports, SportData, SportGame } from '../config/school-sports.ts';
import { schoolTeamName } from '../config/school-sports.ts';
import type { Confidence } from './confidence.ts';
import { isTentative } from './confidence.ts';
import { addDays, dayKey, formatDate, formatShortDate, parseLocal } from './dates.ts';
import { checkedBy } from './editor.ts';
import { PLAN_YOUR_DAY, forGeneralReaders, isFlagged, isMultiDay, isPast, lastDay, oneOffs, weekendWindow } from './events.ts';
import { FLAGSHIP_TEAM, formatGameTime, leaguePlace, placeText, where } from './school-sports.ts';
import { isFreeCost } from './cost.ts';
import { homeOf } from './hub-towns.ts';
import { CURRENT_SEASONS, TRADITION_TYPES, byTown, isDated, isUpcoming, seasonRows, type TraditionRecord, type TraditionRow, type TraditionType, type TraditionYear } from './traditions.ts';

/**
 * The feature card's count, by town (the fixes brief: "19 of 20 towns'
 * dates confirmed"): how many of the towns on the season page have a date
 * the organizer has confirmed and that is still ahead, out of every town
 * on it. A row with no town of its own (a shared or statewide record) is
 * in neither number.
 */
export function townsConfirmed(rows: ReadonlyArray<{ town?: string; confirmed: boolean; canceled?: boolean }>): { confirmed: number; towns: number; canceled: number } {
  const live = new Set<string>();
  const confirmed = new Set<string>();
  const called = new Set<string>();
  for (const row of rows) {
    if (!row.town) continue;
    if (row.canceled) called.add(row.town);
    else live.add(row.town);
    if (row.confirmed && !row.canceled) confirmed.add(row.town);
  }
  // A town whose only date was called off is not waiting on a date: it is counted apart.
  const canceled = [...called].filter((t) => !live.has(t)).length;
  return { confirmed: confirmed.size, towns: live.size, canceled };
}

/**
 * A season's line on the home, in a reader's words: "In 25 towns; 24 dates
 * set so far." Until the viewer review of 14 November 2026 it read "24 of
 * 25 towns’ dates confirmed", which was the count the hub keeps, not
 * something a reader asks. Every town's date set says only where it is
 * held; a town whose only date was called off is counted apart.
 */
export function seasonFeatureLine(counts: { confirmed: number; towns: number; canceled?: number }): string {
  const notes = [
    counts.confirmed >= counts.towns ? undefined : counts.confirmed === 0 ? 'no dates set yet' : `${counts.confirmed} ${counts.confirmed === 1 ? 'date' : 'dates'} set so far`,
    counts.canceled ? `${counts.canceled} more canceled this year` : undefined,
  ].filter((n): n is string => !!n);
  return `In ${counts.towns} ${counts.towns === 1 ? 'town' : 'towns'}${notes.length > 0 ? `; ${notes.join(', ')}` : ''}.`;
}

/**
 * Every name the home's town box knows, each with the one page it goes to
 * (the viewer review of 14 November 2026, in place of the twenty areas a
 * reader had to place their town in): a guide's own name and the towns it
 * covers go to the guide, since its pages are the fuller ones; every other
 * town to its page of annual dates. The first place a name is given wins,
 * so the guides come first. A to Z, no name twice. The hero's search box
 * suggests the same names.
 */
export function townFinder(
  guides: ReadonlyArray<{ name: string; href: string; covered: ReadonlyArray<{ name: string; href: string }> }>,
  pages: ReadonlyArray<{ name: string; slug: string }>,
): Array<{ name: string; href: string }> {
  const found = new Map<string, { name: string; href: string }>();
  const add = (name: string, href: string) => {
    const key = name.trim().toLowerCase();
    if (key && !found.has(key)) found.set(key, { name, href });
  };
  for (const g of guides) add(g.name, g.href);
  for (const g of guides) for (const c of g.covered) add(c.name, c.href);
  for (const p of pages) add(p.name, `/${p.slug}/`);
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The registration deadline among the home's dated items: the soonest that
 * closes, since that is the one a reader can miss; where none closes within
 * the window, the soonest that opens. Nothing where there is neither (the
 * audit of 13 November 2026: omit, never fill).
 */
export function pickDeadline<T extends { what: 'opens' | 'closes'; on: Date }>(deadlines: readonly T[]): T | undefined {
  const byDate = [...deadlines].sort((a, b) => a.on.getTime() - b.on.getTime());
  return byDate.find((d) => d.what === 'closes') ?? byDate[0];
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "seven", for a count the page writes in words; past twelve, the digits. */
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** "Seven". */
export function capitalized(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** "Frederick, Firestone and Dacono". */
export function listWords(names: readonly string[]): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/**
 * A season's name inside a sentence: "parades of lights", "turkey trots";
 * a name that begins with a proper noun keeps its capital ("New Year’s
 * celebrations", "Easter egg hunts", "Oktoberfests"), where lowercasing the
 * whole name wrote "new year’s".
 */
export function inSentence(name: string): string {
  return /^(New Year|Easter|Oktoberfest)/.test(name) ? name : name.charAt(0).toLowerCase() + name.slice(1);
}

/**
 * The home's description, the words a search result shows under its title:
 * this weekend's events, the full sections by count, and the annual dates
 * of every other town (`moreTowns`), with the seasons open now where they
 * fit. The longest of the wordings that fits `limit` whole (the page passes
 * META_DESCRIPTION_LIMIT, 155). Since the owner's navigation brief of 18
 * November 2026 it counts the full sections, "eleven full town sections"
 * (fullSections, src/config/index.ts); it had counted the six guides that
 * list events.
 */
export function homeDescription(o: { sections: number; moreTowns: number; seasons: readonly string[] }, limit = 155): string {
  const lead = `This weekend’s events, ${numberWord(o.sections)} full town sections and annual dates for ${o.moreTowns} more Colorado towns`;
  const seasons = o.seasons.length > 0 ? `: ${listWords(o.seasons.map(inSentence))}` : '';
  const checked = ', each checked against its source';
  const wordings = [`${lead}${seasons}${checked}.`, `${lead}${seasons}.`, `${lead}${checked}.`, `${lead}.`];
  return wordings.find((d) => d.length <= limit) ?? wordings.at(-1)!;
}

/**
 * The guides' one line each in the index, as the approved mockup has them.
 * Each was read against the guide's own content on 13 November 2026 (its
 * tagline, its places and the school it follows): Niwot's Second Avenue
 * and LoBo Trail are its places, the Cougars its school. A guide with no
 * line here shows its short tagline, so a new guide reaches the index the
 * day it goes live.
 */
export const GUIDE_LINES: Readonly<Record<string, string>> = {
  berthoud: 'Main Street, the lakes, Spartans scores',
  erie: 'Briggs Street, trails, Tigers scores',
  johnstown: 'Parish Avenue, parks, Roughriders scores',
  windsor: 'The lake, Main Street, Wizards scores',
  'carbon-valley': 'Frederick, Firestone and Dacono',
  lyons: 'The river, trails and music at the canyon mouth',
  niwot: 'Second Avenue, the LoBo Trail, Cougars scores',
};

export function guideLine(guide: { slug: string; shortTagline?: string; tagline: string }): string {
  return GUIDE_LINES[guide.slug] ?? guide.shortTagline ?? guide.tagline;
}

/**
 * A guide's name in the index: a guide named for a region keeps its name
 * and its line lists the towns ("Carbon Valley"); one named for its own
 * town adds the others it covers ("Windsor and Severance").
 */
export function guideName(guide: { slug: string; name: string }, covered: readonly string[]): string {
  if (STANDALONE_GUIDES[guide.slug]?.towns?.length || covered.length === 0) return guide.name;
  return listWords([guide.name, ...covered]);
}

/** The host a source line names: "chsaanow.com". */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * An event's check line in the words of its own page on the guide
 * (src/components/Provenance.astro): the confidence's own sentence where
 * it says more than a date (a call to the organizer), with the listing's
 * site; else "Checked November 11, 2026 against chsaanow.com". Without
 * the closing full stop, since the home sets each as a line of its own.
 */
export function provenanceText(item: { data: { verified?: Date; source?: string }; confidence?: Pick<Confidence, 'line'> }, checked: (date: string) => string = checkedBy): string | undefined {
  const { verified, source } = item.data;
  const host = source ? hostOf(source) : undefined;
  const own = item.confidence?.line;
  if (own) return `${own}${host ? ` Listing: ${host}` : ''}`.replace(/\.$/, '');
  if (!verified && !host) return undefined;
  return `${verified ? checked(formatDate(verified)) : ''}${verified && host ? ' against ' : ''}${host ?? ''}`;
}

/** A registration deadline's line, as the family hub's card has it (DeadlineCard.astro): "Checked Nov 11, 2026 against host", or "Source: host". */
export function deadlineSourceText(data: { verified?: Date; source?: string }): string | undefined {
  if (!data.source) return undefined;
  return data.verified ? `Checked ${formatShortDate(data.verified)} against ${hostOf(data.source)}` : `Source: ${hostOf(data.source)}`;
}

/** A local change's line, as the guide's /updates/ has it (UpdateRow.astro): "Source: Town of Frederick: …, read Nov 11, 2026". */
export function changeSourceText(data: { verified?: Date; source?: string; sourceLabel?: string }): string | undefined {
  if (!data.source) return undefined;
  return `Source: ${data.sourceLabel ?? hostOf(data.source)}${data.verified ? `, read ${formatShortDate(data.verified)}` : ''}`;
}

/**
 * A game's line, as the school's sports page words its source
 * (src/routes/town/sports.astro): "Scores and schedules from MaxPreps, read
 * Nov 11, 2026", "Scores from MaxPreps" where the school's calendar checks
 * the dates, and the CHSAA bracket where the game came from one.
 */
export function sportsSourceText(team: Pick<SportData, 'fetched'>, game: Pick<SportGame, 'chsaa'>, calendar?: boolean): string {
  const read = team.fetched ? `, read ${formatShortDate(new Date(team.fetched))}` : '';
  const dates = calendar ? '; dates checked against the school calendar' : '';
  const bracket = game.chsaa ? `; postseason games from CHSAA’s bracket, read ${formatShortDate(parseLocal(game.chsaa.read))}` : '';
  return `${calendar ? 'Scores from' : 'Scores and schedules from'} MaxPreps${read}${dates}${bracket}`;
}

/** The days of the weekend this one is in or coming to, Friday to Sunday, as Denver days. On a Saturday it is still the Friday just gone. */
export function weekendDays(now: Date): Array<{ key: string; date: Date }> {
  const friday = addDays(weekendWindow(now).sunday, -2);
  return [0, 1, 2].map((n) => {
    const date = addDays(friday, n);
    return { key: dayKey(date), date };
  });
}

type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };
type Listing = EventLike & { town: { slug: string }; confidence?: Confidence };

/**
 * A listing a reader goes to on an errand, not for an outing, whatever its
 * category: a meeting or a hearing, or a sale or a drive that raises money
 * or collects things. The viewer review of 14 November 2026 found the
 * home's weekend picking "Community Meeting for Prescribed Fire Projects"
 * (filed under Outdoors by Boulder County's feed) and "Erie High School
 * Band Mattress Sale Fundraiser" (Other), where the category rules could
 * not see what they were. Read from the title, narrowly: a gala, a
 * pancake breakfast or a fun run that raises money is still an outing, and
 * "Meet the artist" is not a meeting. Such a listing is still on its
 * guide's events page and on the hub's /this-weekend/; the home's weekend
 * just does not recommend it.
 */
const ERRAND_RE = /\b(?:meeting|hearing|town hall|listening session|info(?:rmation(?:al)?)? session|webinar|public comment|mattress sale|car wash|blood drive|(?:food|coat|toy|book|diaper|school supply) drive|shred(?:ding)? (?:day|event))\b/i;
export function isErrand(e: { data: { title: string } }): boolean {
  return ERRAND_RE.test(e.data.title);
}

/**
 * One listing for each day of the weekend that is not already taken (by
 * Friday's game), never two from one town and never one from a town in
 * `taken`. A listing qualifies when it starts that day and has not
 * finished, the organizer's own page or a person has confirmed it (the
 * `confirmed` level, src/lib/confidence.ts), or it is a run of days still
 * on that day, and it is a one-off for a
 * general reader: no regular, no standing children's program, nothing
 * civic, canceled or flagged by the re-check, not a program's own
 * deadline listing (`exclude`), and not an errand (`isErrand`: a meeting,
 * a mattress sale, a blood drive). The best is one its guide's editor picked
 * for the week or featured (the guides' rule: nothing is picked by a
 * machine where an editor has picked), then a plan-your-day one (a
 * festival, a market, music, a game, the arts), then the rest; within
 * each, the earlier start, then the guides' order. The days are filled in
 * order, Friday first.
 *
 * `all` is the network's listings expanded with `occurrences`, so a
 * series stored as a file per date is known as one.
 */
export function weekendPicks<T extends Listing>(
  all: readonly T[],
  days: ReadonlyArray<{ key: string }>,
  options: WeekendPickOptions = {},
): Map<string, T> {
  const picks = new Map<string, T>();
  for (const [key, list] of weekendPicksByDay(all, days, { ...options, perDay: 1 })) picks.set(key, list[0]!);
  return picks;
}

export interface WeekendPickOptions {
  now?: Date;
  taken?: ReadonlySet<string>;
  order?: readonly string[];
  /** Listings, as `listingKey`, that are something else on the page: a program's deadline (`deadlineListings`). */
  exclude?: ReadonlySet<string>;
  /** Listings, as `listingKey`, a guide's editor picked for the week (src/lib/weekly.ts, currentPicks): these come first. */
  picked?: ReadonlySet<string>;
}

/**
 * Where a listing goes in one day's list, as a number to sort by: a timed
 * listing that starts that day by its start (midnight first, noon in its
 * place), then the all-day listings and the runs that began on an earlier
 * day, which have no time of their own on it.
 */
export function dayOrder(e: { data: { start: Date; allDay?: boolean } }, key: string): number {
  return !e.data.allDay && dayKey(e.data.start) === key ? e.data.start.getTime() : Number.MAX_SAFE_INTEGER;
}

/**
 * The same choice as `weekendPicks`, up to `perDay` listings a day (the
 * home's "This weekend" under the publication redesign of 14 November
 * 2026, a heading a day with its listings under it). Every rule holds: the
 * best listing of the whole weekend chosen first, never two from one town
 * across the weekend; then a town with listings on more than one day moves
 * to a day that would otherwise be empty, so the list spreads over Friday,
 * Saturday and Sunday at the same length; a day's listings are then shown
 * in clock order.
 */
export function weekendPicksByDay<T extends Listing>(
  all: readonly T[],
  days: ReadonlyArray<{ key: string }>,
  { now = new Date(), taken = new Set<string>(), order = [], exclude = new Set<string>(), picked = new Set<string>(), perDay = 1 }: WeekendPickOptions & { perDay?: number } = {},
): Map<string, T[]> {
  const general = forGeneralReaders(all, all);
  const pool = oneOffs(general, all).filter((e) => !isPast(e, now) && !isFlagged(e) && !isTentative(e) && e.confidence?.level === 'confirmed' && !exclude.has(listingKey(e)) && !isErrand(e));
  // A guide editor's pick or featured listing first, then a plan-your-day category, then the rest.
  const rank = (e: T) => (picked.has(listingKey(e)) || e.data.featured ? 0 : PLAN_YOUR_DAY.has(e.data.category) ? 1 : 2);
  const place = (slug: string) => order.indexOf(slug) + 1 || order.length + 1;
  // On a day: it starts then, or it is a run of days that began earlier and is still on.
  const onDay = (e: T, key: string) => {
    const first = dayKey(e.data.start);
    return first === key || (isMultiDay(e) && first < key && lastDay(e) >= key);
  };
  // The best listing anywhere in the weekend is placed first, so a town's
  // lesser Friday listing cannot take the town from its Saturday pick.
  const candidates = days
    .flatMap(({ key }, day) => pool.filter((e) => !taken.has(e.town.slug) && onDay(e, key)).map((e) => ({ e, key, day })))
    .sort((a, b) => rank(a.e) - rank(b.e) || a.day - b.day || a.e.data.start.getTime() - b.e.data.start.getTime() || place(a.e.town.slug) - place(b.e.town.slug));
  const towns = new Set<string>();
  const chosen = new Map<string, Array<{ e: T; at: number }>>();
  candidates.forEach(({ e, key }, at) => {
    const list = chosen.get(key) ?? [];
    if (list.length >= perDay || towns.has(e.town.slug)) return;
    list.push({ e, at });
    chosen.set(key, list);
    towns.add(e.town.slug);
  });
  // Spread over the weekend (the owner, 19 November 2026): most towns list
  // something on the Friday, so the best-first choice filled Friday and left
  // Saturday and Sunday empty. While a day is empty, a town chosen on a day
  // with two or more listings and with a listing of its own on the empty day
  // moves there: the same towns, the same number of rows, one town a row,
  // each day as full as before or fuller. Its listing there is its best on
  // that day (the candidates' order); an editor's pick or a featured listing
  // stays where it was chosen. With one a day (`weekendPicks`) nothing moves.
  const fixed = (e: T) => picked.has(listingKey(e)) || e.data.featured;
  // Each move fills an empty day and empties none, so this ends within days.length moves.
  for (let moved = true; moved; ) {
    moved = false;
    for (const { key: to } of days) {
      if ((chosen.get(to) ?? []).length > 0) continue;
      let best: { from: string; index: number; to: { e: T; at: number } } | undefined;
      for (const [from, list] of chosen) {
        if (list.length < 2) continue;
        for (const [index, c] of list.entries()) {
          if (fixed(c.e)) continue;
          const at = candidates.findIndex((x) => x.key === to && x.e.town.slug === c.e.town.slug);
          if (at !== -1 && (!best || at < best.to.at)) best = { from, index, to: { e: candidates[at]!.e, at } };
        }
      }
      if (!best) continue;
      chosen.get(best.from)!.splice(best.index, 1);
      chosen.set(to, [best.to]);
      moved = true;
    }
  }
  // In the days' own order, each day's listings in the order of the clock
  // (`dayOrder`): the rank chose them, it does not order them (the owner, 19
  // November 2026). Until then a day's pick came first whatever its time.
  const picks = new Map<string, T[]>();
  for (const { key } of days) if (chosen.has(key)) picks.set(key, chosen.get(key)!.sort((a, b) => dayOrder(a.e, key) - dayOrder(b.e, key) || a.at - b.at).map((c) => c.e));
  return picks;
}

export function listingKey(e: { town: { slug: string }; slug?: string; id?: string }): string {
  return `${e.town.slug}/${e.slug ?? e.id ?? ''}`;
}

type ProgramLike = { town: { slug: string }; data: { nextEvent?: string; registration?: { deadline?: Date; opens?: Date } } };

/**
 * The listings that are a program's registration deadline or opening, as
 * `listingKey`: the listing the program points at (`nextEvent`) where it
 * falls on one of those days ("Holiday Card Art Contest: artwork due"). The
 * family hub shows such a listing on the deadline's card (DeadlineCard.astro);
 * the home keeps it out of the weekend's picks, since it is a date to
 * meet, not a thing to go to.
 */
export function deadlineListings<P extends ProgramLike>(programs: readonly P[], listings: ReadonlyArray<Listing>): Set<string> {
  const keys = new Set<string>();
  for (const p of programs) {
    const r = p.data.registration;
    if (!p.data.nextEvent || !r) continue;
    const days = [r.deadline, r.opens].filter((d): d is Date => !!d).map((d) => dayKey(d));
    const own = listings.find((e) => e.town.slug === p.town.slug && e.slug === p.data.nextEvent);
    if (own && days.includes(dayKey(own.data.start))) keys.add(listingKey(own));
  }
  return keys;
}

/**
 * A deadline's title as the family hub's card gives it (DeadlineCard.astro):
 * the listing's own, less its "artwork due", where the program's listing
 * is on the deadline's day; else the program's.
 */
export function deadlineTitle(programTitle: string, listing?: { data: { title: string } }): string {
  return listing ? listing.data.title.replace(/\s*[:·-]\s*(?:\w+\s+)?due\s*$/i, '') : programTitle;
}

/** A school's football season, read for the home's Friday: its guide, the school, and the file's data after CHSAA's corrections. */
export interface GameSource<G> {
  guide: G;
  school: Pick<SchoolSports, 'slug' | 'town' | 'calendar' | 'maxprepsName' | 'mascot' | 'colors'>;
  team: SportData;
}

export interface FridayGame<G, T> extends GameSource<G> {
  game: SportGame;
  /** The guide's own listing for the game, where it has one: its title, venue, link and check line. */
  listing?: T;
}

/** The opponent's names a game may go by: CHSAA writes a winner still to be decided as "A or B". */
function opponents(game: Pick<SportGame, 'opponent'>): string[] {
  return game.opponent.split(/\s+or\s+/i).map((n) => n.trim().toLowerCase()).filter((n) => n.length >= 3);
}

/**
 * Friday night lights: the high-school football game the home leads its
 * weekend with, from the scores data (data/<town>/sports*.json, with
 * CHSAA's brackets merged in), on the weekend's Friday, played or to come.
 * The guide's own listing for it is found as the guides find it
 * (src/lib/flagship-home.ts, listedAsEvent): a sports listing that day
 * whose title names the opponent. Where several schools play that Friday,
 * the one whose guide features its listing comes first, then a
 * postseason game, then the guides' order. Nothing where no followed
 * school plays football that day.
 */
export function fridayGame<G, T extends Listing & { town: { slug: string } }>(
  sources: ReadonlyArray<GameSource<G> & { town: string }>,
  friday: string,
  listings: readonly T[],
): FridayGame<G, T> | undefined {
  const games = sources.flatMap((s, order) => {
    if (s.team.key !== FLAGSHIP_TEAM) return [];
    const game = s.team.results.find((g) => g.date === friday) ?? s.team.upcoming.find((g) => g.date === friday);
    if (!game) return [];
    const names = opponents(game);
    const listing = listings.find(
      (e) => e.town.slug === s.town && e.data.category === 'sports' && dayKey(e.data.start) === friday && e.data.status !== 'canceled' && names.some((n) => e.data.title.toLowerCase().includes(n)),
    );
    return [{ guide: s.guide, school: s.school, team: s.team, game, listing, order }];
  });
  const rank = (g: (typeof games)[number]) => (g.listing?.data.featured ? 0 : 2) + (g.game.stage ? 0 : 1);
  const best = games.sort((a, b) => rank(a) - rank(b) || a.order - b.order)[0];
  return best && { guide: best.guide, school: best.school, team: best.team, game: best.game, listing: best.listing };
}

/** "9–1": a record or a score, with the en dash the page sets them in. */
export function dashed(text: string): string {
  return text.replace(/(\d)-(\d)/g, '$1–$2');
}

/** The Friday game as a row: its title, the line under it, and whether it shows the final. */
export function gameRow(g: Pick<FridayGame<unknown, Listing>, 'school' | 'team' | 'game' | 'listing'>, displayTitle: (e: EventLike) => string, clock: (e: EventLike) => string): { title: string; meta: string[]; reasons: string[]; final: boolean } {
  const { school, team, game, listing } = g;
  const title = listing ? displayTitle(listing) : `${schoolTeamName(school)} ${where(game)} ${game.opponent}`;
  const record = team.overall ? `${dashed(team.overall)} this season` : undefined;
  const reasons = gameReasons(title, team, game);
  if (game.result) {
    const word = { W: 'Won', L: 'Lost', T: 'Tied' }[game.result];
    const score = game.forfeit ? 'by forfeit' : game.score ? `${game.score.us}–${game.score.them}` : undefined;
    return { title, meta: [`Final: ${[word, score].filter(Boolean).join(' ')}`, record].filter((s): s is string => !!s), reasons, final: true };
  }
  const time = listing ? clock(listing) : game.time ? formatGameTime(game) : undefined;
  const venue = listing?.data.venue ?? placeText(game);
  return { title, meta: [time, venue, record].filter((s): s is string => !!s), reasons, final: false };
}

/**
 * Why the game earned the space, from the scores data alone: the postseason
 * it is part of, where the title does not already say so, and the team's
 * place in its league, in the sports page's words ("1st in the 4A
 * Northern"; leaguePlace leaves out a place with no league game played).
 */
export function gameReasons(title: string, team: Pick<SportData, 'league'>, game: Pick<SportGame, 'stage'>): string[] {
  const stage = game.stage && !/playoff|tournament|championship/i.test(title) ? game.stage : undefined;
  const place = leaguePlace(team);
  // "league" said, for a reader who does not know "4A Northern" is one, unless the name says it already.
  const league = team.league ? `${team.league.name}${/league|conference/i.test(team.league.name) ? '' : ' league'}` : undefined;
  return [stage, place && league ? `${place} in the ${league}` : undefined].filter((s): s is string => !!s);
}

/** "Half an hour", "45 minutes", "An hour", "An hour and a half": a short listing's length, up to 90 minutes; nothing longer. */
export function durationWords(minutes: number): string | undefined {
  // A quarter of an hour to an hour and a half, in round figures: "61 minutes" is not a reason.
  if (minutes < 15 || minutes > 90 || minutes % 5 !== 0) return undefined;
  if (minutes === 30) return 'Half an hour';
  if (minutes === 60) return 'An hour';
  if (minutes === 90) return 'An hour and a half';
  return `${minutes} minutes`;
}

/** "1st", "2nd", "23rd", "78th". */
export function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

const nameKey = (text: string) => text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * The annual event a weekend listing is, from the registry of traditions
 * (content/hub/traditions/): a record at home in the listing's guide, with
 * a date the organizer set on the listing's own day, whose name the
 * listing's title carries (or the other way round). The year's entry, for
 * its edition number where the organizer gives one.
 */
export function annualRecordFor(e: Pick<Listing, 'town' | 'data'>, title: string, records: readonly TraditionRecord[]): { record: TraditionRecord; entry: TraditionYear } | undefined {
  const day = dayKey(e.data.start);
  const listed = nameKey(title);
  for (const record of records) {
    if (record.statewide || homeOf(record) !== e.town.slug) continue;
    const entry = record.years.find((y) => y.date === day && isDated(y));
    const name = nameKey(record.name);
    // Whole words: "Art Walk" is not in "Heart Walk for Lyons".
    if (entry && name && (` ${listed} `.includes(` ${name} `) || ` ${name} `.includes(` ${listed} `))) return { record, entry };
  }
  return undefined;
}

/**
 * Why a weekend listing earned the space, in a few words, each from a field
 * the listing or the registry carries, never from its prose: the guide's
 * own pick this week, an annual event (its running, where the organizer
 * numbers it), free admission (isFreeCost), and a short run time from its
 * start and end; or, in their place, the listing's own `why`, a few words
 * its editor read on the source. Nothing, where none of them holds: no
 * line is better than a filler one.
 */
export function listingReasons(
  e: Pick<Listing, 'data'>,
  { pickedBy, annual }: { pickedBy?: string; annual?: { edition?: number } } = {},
): string[] {
  const { start, end, allDay, cost, why } = e.data;
  const pick = pickedBy ? `${pickedBy}’s pick this week` : undefined;
  // The editor's own words, read on the source, stand in for the worked-out reasons.
  if (why) return [pick, why].filter((s): s is string => !!s);
  const sameDay = !!end && dayKey(start) === dayKey(end);
  const length = sameDay && !allDay ? durationWords(Math.round((end!.getTime() - start.getTime()) / 60_000)) : undefined;
  return [
    pick,
    // A first running is not yet annual.
    annual ? (annual.edition && annual.edition > 1 ? `The ${ordinal(annual.edition)} annual` : 'Once a year') : undefined,
    isFreeCost(cost) ? 'Free' : undefined,
    length,
  ].filter((s): s is string => !!s);
}

/**
 * This season: the annual events whose season the owner has opened with a
 * year (CURRENT_SEASONS: parades of lights, tree lightings and turkey trots
 * in November 2026), each with a date still to come, the soonest first. The year-round pages (Oktoberfests, rodeos, outdoor dates) are
 * not in it: they are one link away, under all the annual events.
 */
export function seasonsNow(records: readonly TraditionRecord[], today: string): Array<{ type: TraditionType; counts: { confirmed: number; towns: number; canceled: number }; next: TraditionRow }> {
  return TRADITION_TYPES.flatMap((type) => {
    if (CURRENT_SEASONS[type]?.year === undefined) return [];
    const rows = seasonRows(records, type, today);
    const next = rows.filter(isUpcoming).sort((a, b) => a.entry.date!.localeCompare(b.entry.date!) || byTown(a, b))[0];
    if (!next) return [];
    // Confirmed is a date the organizer set, held already or still to come, so the count does not fall as the season is played out.
    return [{ type, counts: townsConfirmed(rows.map((r) => ({ town: r.record.town?.name, confirmed: isDated(r.entry) && !!r.entry.date, canceled: r.entry.status === 'canceled' }))), next }];
  }).sort((a, b) => a.next.entry.date!.localeCompare(b.next.entry.date!));
}

/** "Catch the Glow Parade, Estes Park"; the town once only ("Longmont Turkey Trot"). */
export function nextLine(record: Pick<TraditionRecord, 'name' | 'town'>): string {
  const town = record.town?.name;
  return town && !record.name.includes(town) ? `${record.name}, ${town}` : record.name;
}

/**
 * The photograph beside the hero: the owner's own, of the Flatirons from
 * the air (IMAGE_LICENSES.csv), shown clean, with no words on it and no
 * credit line. The same picture is the page's share image.
 */
export const HOME_PHOTO = {
  /** The whole photograph, for the share image. */
  file: 'front-range-flatirons.jpg',
  /** The 2:1 band of it the page shows, cut once so no reader downloads the rest. */
  hero: 'front-range-flatirons-hero.jpg',
  alt: 'The Flatirons and the foothills above Boulder from the air, with the plains and their towns beyond',
  caption: 'The Flatirons above Boulder, looking across the Front Range.',
} as const;

/**
 * One item under "In the towns" on the hub's home: an article the owner has
 * marked `feature`, one of the hub's (src/lib/curiosity.ts) or a full
 * section's own. Dates are Denver days, "2026-11-13".
 */
export interface NewsItem {
  /** The towns the article is for, as its `towns` names them. */
  towns: readonly string[];
  /** Whether the owner has put it on the home (`feature`). */
  feature: boolean;
  /** The small label over the headline: "Nederland · News". */
  label: string;
  title: string;
  /** One line on what it means. */
  line: string;
  href: string;
  /** The day it was published. */
  date: string;
  /** Its last day on the page, where its `homeUntil` sets one. */
  until?: string;
  /** The address of the item it is listed right under, where its `homeAfter` names one. */
  after?: string;
  /** Its source line, in the words its own page uses. */
  source?: string;
}

/**
 * Whether an article is out by `today` (both Denver days, "2026-11-18"):
 * its date is on or before it. One rule for the hub's home and /articles/,
 * so an article dated ahead is on neither until its day's build.
 */
export function isPublished(date: string, today: string): boolean {
  return date <= today;
}

/**
 * What "In the towns" shows (the owner, 18 November 2026): the featured
 * articles, published by today and not past a `homeUntil`, the newest
 * first, `limit` in all. A featured article about one full section alone
 * is here too (onHub, src/lib/curiosity-places.ts) and stays in its
 * section; an unfeatured one never is. Nothing, where nothing qualifies:
 * the section is then not drawn. An item with `after` (its `homeAfter`)
 * is moved to just under the item at that address, where that item is
 * listed; otherwise it keeps its place by date.
 */
export function newsItems<I extends NewsItem>(items: readonly I[], today: string, limit = 5): I[] {
  const listed = [...items]
    .filter((i) => i.feature && isPublished(i.date, today) && (!i.until || today <= i.until))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  for (const item of listed.filter((i) => i.after && i.after !== i.href)) {
    if (!listed.some((i) => i.href === item.after)) continue;
    listed.splice(listed.indexOf(item), 1);
    listed.splice(listed.findIndex((i) => i.href === item.after) + 1, 0, item);
  }
  return listed.slice(0, limit);
}

/**
 * A story's source line: who it rests on, and the day the oldest source was
 * read, so the line never claims more than every source carries. "Sources:
 * Colorado Sun and BusinessDen, read Nov 13, 2026". A label written as
 * "Publisher: document" counts by its publisher, so a story resting on six
 * Town records and three Colorado Sun articles names each once; past three
 * publishers the rest are counted, so one row on the home page stays a few
 * lines (the Eldora explainer of 13 November 2026 rests on about twenty).
 */
export function storySourceText(sources: ReadonlyArray<{ label: string; checked: string }>, max = 3): string | undefined {
  if (sources.length === 0) return undefined;
  const oldest = [...sources].map((s) => s.checked).sort()[0]!;
  const publishers = [...new Set(sources.map((s) => s.label.split(':')[0]!.trim()))];
  const more = publishers.length - max;
  const names = more > 0 ? [...publishers.slice(0, max), `${more} more`] : publishers;
  return `${sources.length === 1 ? 'Source' : 'Sources'}: ${listWords(names)}, read ${formatShortDate(parseLocal(oldest))}`;
}
