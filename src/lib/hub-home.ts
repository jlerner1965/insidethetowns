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
import { PLAN_YOUR_DAY, forGeneralReaders, isFlagged, isPast, oneOffs, weekendWindow } from './events.ts';
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
export function townsConfirmed(rows: ReadonlyArray<{ town?: string; confirmed: boolean }>): { confirmed: number; towns: number } {
  const towns = new Set<string>();
  const confirmed = new Set<string>();
  for (const row of rows) {
    if (!row.town) continue;
    towns.add(row.town);
    if (row.confirmed) confirmed.add(row.town);
  }
  return { confirmed: confirmed.size, towns: towns.size };
}

/** "19 of 20 towns’ dates confirmed." */
export function seasonFeatureLine(counts: { confirmed: number; towns: number }): string {
  return `${counts.confirmed} of ${counts.towns} ${counts.towns === 1 ? 'town’s' : 'towns’'} dates confirmed.`;
}

/** The names the home's search box suggests as they are typed: the guides and the town pages, A to Z, no name twice. */
export function searchSuggestions(...lists: ReadonlyArray<ReadonlyArray<{ name: string }>>): string[] {
  return [...new Set(lists.flat().map((t) => t.name))].sort((a, b) => a.localeCompare(b));
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
 * One listing for each day of the weekend that is not already taken (by
 * Friday's game), never two from one town and never one from a town in
 * `taken`. A listing qualifies when it starts that day and has not
 * finished, the organizer's own page or a person has confirmed it (the
 * `confirmed` level, src/lib/confidence.ts), and it is a one-off for a
 * general reader: no regular, no standing children's program, nothing
 * civic, canceled or flagged by the re-check, and not a program's own
 * deadline listing (`exclude`). The best is one its guide's editor picked
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
  {
    now = new Date(),
    taken = new Set<string>(),
    order = [],
    exclude = new Set<string>(),
    picked = new Set<string>(),
  }: {
    now?: Date;
    taken?: ReadonlySet<string>;
    order?: readonly string[];
    /** Listings, as `listingKey`, that are something else on the page: a program's deadline (`deadlineListings`). */
    exclude?: ReadonlySet<string>;
    /** Listings, as `listingKey`, a guide's editor picked for the week (src/lib/weekly.ts, currentPicks): these come first. */
    picked?: ReadonlySet<string>;
  } = {},
): Map<string, T> {
  const general = forGeneralReaders(all, all);
  const pool = oneOffs(general, all).filter((e) => !isPast(e, now) && !isFlagged(e) && !isTentative(e) && e.confidence?.level === 'confirmed' && !exclude.has(listingKey(e)));
  // A guide editor's pick or featured listing first, then a plan-your-day category, then the rest.
  const rank = (e: T) => (picked.has(listingKey(e)) || e.data.featured ? 0 : PLAN_YOUR_DAY.has(e.data.category) ? 1 : 2);
  const place = (slug: string) => order.indexOf(slug) + 1 || order.length + 1;
  const towns = new Set(taken);
  const picks = new Map<string, T>();
  for (const { key } of days) {
    const best = pool
      .filter((e) => dayKey(e.data.start) === key && !towns.has(e.town.slug))
      .sort((a, b) => rank(a) - rank(b) || a.data.start.getTime() - b.data.start.getTime() || place(a.town.slug) - place(b.town.slug))[0];
    if (!best) continue;
    picks.set(key, best);
    towns.add(best.town.slug);
  }
  return picks;
}

/** A listing as one key across the network: "berthoud/holiday-card-art-contest-deadline-2026-11-14". */
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
  school: Pick<SchoolSports, 'slug' | 'town' | 'calendar' | 'maxprepsName' | 'mascot'>;
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
  return [stage, place && team.league ? `${place} in the ${team.league.name}` : undefined].filter((s): s is string => !!s);
}

/** "Half an hour", "45 minutes", "An hour", "An hour and a half": a short listing's length, up to 90 minutes; nothing longer. */
export function durationWords(minutes: number): string | undefined {
  if (!(minutes > 0) || minutes > 90) return undefined;
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
    if (entry && name && (listed.includes(name) || name.includes(listed))) return { record, entry };
  }
  return undefined;
}

/**
 * Why a weekend listing earned the space, in a few words, each from a field
 * the listing or the registry carries, never from its prose: the guide's
 * own pick this week, an annual event (its running, where the organizer
 * numbers it), free admission (isFreeCost), and a short run time from its
 * start and end. Nothing, where none of them holds: no line is better than
 * a filler one.
 */
export function listingReasons(
  e: Pick<Listing, 'data'>,
  { pickedBy, annual }: { pickedBy?: string; annual?: { edition?: number } } = {},
): string[] {
  const { start, end, allDay, cost } = e.data;
  const sameDay = !!end && dayKey(start) === dayKey(end);
  const length = sameDay && !allDay ? durationWords(Math.round((end!.getTime() - start.getTime()) / 60_000)) : undefined;
  return [
    pickedBy ? `${pickedBy}’s pick this week` : undefined,
    annual ? (annual.edition ? `The ${ordinal(annual.edition)} annual` : 'Once a year') : undefined,
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
export function seasonsNow(records: readonly TraditionRecord[], today: string): Array<{ type: TraditionType; counts: { confirmed: number; towns: number }; next: TraditionRow }> {
  return TRADITION_TYPES.flatMap((type) => {
    if (CURRENT_SEASONS[type]?.year === undefined) return [];
    const rows = seasonRows(records, type, today);
    const next = rows.filter(isUpcoming).sort((a, b) => a.entry.date!.localeCompare(b.entry.date!) || byTown(a, b))[0];
    if (!next) return [];
    return [{ type, counts: townsConfirmed(rows.map((r) => ({ town: r.record.town?.name, confirmed: isUpcoming(r) }))), next }];
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
  file: 'front-range-flatirons.jpg',
  alt: 'The Flatirons and the foothills above Boulder from the air, with the plains and their towns beyond',
  caption: 'The Flatirons above Boulder, looking toward the plains.',
} as const;
