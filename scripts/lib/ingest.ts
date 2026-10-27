/**
 * From a feed item to a staged event file, and the matching that decides
 * whether it is new, already staged, or a change to something published.
 *
 * Pure functions over data read elsewhere, so the tests can pin the
 * decisions: what counts as the same event, what counts as a change, how a
 * room-and-address location becomes a venue, which category a storytime
 * gets. Nothing here fetches or writes; scripts/ingest.ts does both.
 */
import { createHash } from 'node:crypto';
import type { Source } from '../../src/content/schemas.ts';
import { dayKey, toWallClock } from '../../src/lib/dates.ts';
import { INGEST } from '../../src/config/ingest.ts';
import { sameAddress } from '../../src/lib/address.ts';
import { normalizeUrl } from '../../src/lib/session-links.ts';
import type { FeedEvent } from './feeds/types.ts';
import { eventSlug } from './event-files.ts';

/** An event file already in the repository, published or staged, as the matcher needs it. */
export interface ExistingEvent {
  file: string;
  slug: string;
  staged: boolean;
  title: string;
  start: Date;
  end?: Date;
  venue: string;
  status?: string;
  sourceUid?: string;
  sourceHash?: string;
  /** The host of the page the file was read from, without "www.": the site whose ids `sourceUid` belongs to. */
  sourceHost?: string;
  /** The street address the file gives, for telling one venue written two ways ("400 S Parish Ave", "400 South Parish Avenue"). */
  address?: string;
  /**
   * The organizer's pages this date of the file cites: its `url` and
   * `source`, and the session's own page where the body lists one
   * (src/lib/session-links.ts). The feed's link for an item is the
   * organizer's id for it, where the file carries no `sourceUid`.
   */
  urls?: string[];
}

/** "https://www.firestoneco.gov/calendar.aspx?EID=2690" -> "firestoneco.gov". */
/** "tickets.lctix.com" -> "lctix.com": the last two labels, which is the site for every host these feeds use. */
export function siteOf(host: string): string {
  return host.toLowerCase().split('.').slice(-2).join('.');
}

export function sameSite(a: string, b: string): boolean {
  return siteOf(a) === siteOf(b);
}

export function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return undefined;
  }
}

/** The frontmatter and body a feed item becomes. */
export interface StagedEvent {
  slug: string;
  frontmatter: Record<string, unknown>;
  body: string;
  /** Guesses the review has to confirm, in words. */
  guesses: string[];
}

const STOP = new Set(['the', 'a', 'an', 'and', 'of', 'at', 'in', 'on', 'for', 'with', 'to', 'by', 'from', '&']);

/** Lowercase words, punctuation and stop words gone, for comparing titles. */
export function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w && !STOP.has(w)),
  );
}

/** Jaccard overlap of the two titles' words, 0 to 1. */
export function titleSimilarity(a: string, b: string): number {
  const x = titleTokens(a);
  const y = titleTokens(b);
  if (x.size === 0 || y.size === 0) return 0;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return shared / (x.size + y.size - shared);
}

export function normalizeVenue(venue: string): string {
  return venue.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Whether a feed item passes the source's location filter. No filter: everything passes. */
export function passesLocationFilter(item: FeedEvent, source: Pick<Source, 'locationFilter'>): boolean {
  if (!source.locationFilter?.length) return true;
  const haystack = `${item.location ?? ''} ${item.title}`.toLowerCase();
  return source.locationFilter.some((needle) => haystack.includes(needle.toLowerCase()));
}

/** Whether the item's feed categories pass the source's include and exclude lists. */
export function passesCategoryFilter(item: Pick<FeedEvent, 'categories'>, source: Pick<Source, 'includeCategories' | 'excludeCategories'>): boolean {
  const have = item.categories.map((c) => c.replace(/\s+/g, ' ').trim().toLowerCase());
  const norm = (list: string[] | undefined) => (list ?? []).map((c) => c.replace(/\s+/g, ' ').trim().toLowerCase());
  const include = norm(source.includeCategories);
  if (include.length && !have.some((c) => include.includes(c))) return false;
  const exclude = norm(source.excludeCategories);
  return !have.some((c) => exclude.includes(c));
}

/** Whether the editor has excluded this title from the source. */
export function excludedTitle(item: Pick<FeedEvent, 'title'>, source: Pick<Source, 'excludeTitles'>): boolean {
  if (!source.excludeTitles?.length) return false;
  const title = item.title.replace(/\s+/g, ' ').toLowerCase();
  return source.excludeTitles.some((t) => title.includes(t.replace(/\s+/g, ' ').toLowerCase()));
}

/**
 * A venue and, where the text has one, an address, from a feed's free-text
 * location. Feeds write "Erie Storytime Room, Erie Community Library",
 * "Johnstown Location, 400 S Parish Ave, Johnstown", "451 4th Ave, Lyons,
 * CO, 80540, US" or nothing. The source's aliases and default venue are the
 * editor's knowledge and win; after that the first part that is not a room
 * and not an address is the venue, and the address is the part that starts
 * with a number.
 */
export function venueFrom(location: string | undefined, source: Pick<Source, 'venueAliases' | 'defaultVenue'>): { venue?: string; address?: string; guessed: boolean; silent?: boolean } {
  const parts = (location ?? '')
    .split(/\s*,\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const alias = source.venueAliases ?? {};
  for (const part of parts) {
    const hit = alias[part];
    if (hit) return { venue: hit, address: addressIn(parts), guessed: false };
  }
  if (location && alias[location]) return { venue: alias[location], guessed: false };
  const isRoom = (p: string) => /\b(room|hall|suite|offsite|online|virtual|zoom|chambers|library living room)\b/i.test(p) && !/library|center|centre|park|church|school|hall$/i.test(p);
  const isAddress = (p: string) => /^\d/.test(p);
  const isRegion = (p: string, i: number) =>
    /^(co|colorado|usa?|us|united states)$/i.test(p) ||
    /^\d{5}(-\d{4})?$/.test(p) ||
    /^[A-Za-z .]+,?\s*CO\b/.test(p) ||
    /^CO\s+\d{5}/.test(p) ||
    // "Berthoud" followed by "CO 80513" is the town, not a venue.
    /^(CO|Colorado)\b/.test(parts[i + 1] ?? '');
  if (source.defaultVenue) {
    // LibCal writes "Offsite" beside the branch that runs an event held
    // somewhere else (Fort Lupton's teen laser tag, at the high school): the
    // building is the organizer, not the venue, so the default is only a guess.
    if (parts.some((p) => /^off-?site$/i.test(p))) return { venue: source.defaultVenue, address: addressIn(parts), guessed: true };
    const named = parts.some((p) => p.toLowerCase().includes(source.defaultVenue!.toLowerCase()));
    // A department's feed is at its own building unless the location names
    // another place: the library's film at the museum ("Longmont Museum,
    // 400 Quail Rd.") is at the museum, and saying the library, with
    // confidence, flagged a move that never happened.
    const elsewhere = !named && parts.some((p, i) => !isRoom(p) && !isAddress(p) && !isRegion(p, i));
    // `silent`: the feed names no place at all (nothing, or only the town:
    // "Severance CO 80550"), so the default is the editor's assumption, not
    // the feed's word. Good enough to stage a new item at; not a reason to
    // say a published one has moved (Severance's teen movie night is at the
    // library, and the Town's calendar does not say otherwise).
    const silent = parts.every((p, i) => isRegion(p, i));
    if (!elsewhere) return { venue: source.defaultVenue, address: addressIn(parts), guessed: false, ...(silent ? { silent: true } : {}) };
  }
  const candidates = parts.filter((p, i) => !isRoom(p) && !isAddress(p) && !isRegion(p, i));
  const venue = candidates[0] ?? parts.find((p, i) => !isAddress(p) && !isRegion(p, i));
  return { venue: venue || undefined, address: addressIn(parts), guessed: true };
}

function addressIn(parts: string[]): string | undefined {
  const i = parts.findIndex((p) => /^\d+\s+\S/.test(p));
  if (i === -1) return undefined;
  // The street and whatever follows it up to the state, as one line.
  const tail = parts.slice(i).filter((p) => !/^(usa?|us|united states)$/i.test(p));
  return tail.join(', ');
}

/**
 * A category from the feed's own categories and the title. A guess the
 * review confirms; `other` when nothing fits, never a confident wrong one.
 */
export function guessCategory(item: Pick<FeedEvent, 'title' | 'categories'>): { category: string; guessed: boolean } {
  const text = `${item.categories.join(' ')} ${item.title}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/\b(council|trustees?|board|commission|committee|hearing|town hall meeting|planning|work ?session|election|ballot|budget)\b/, 'civic'],
    [/\b(storytime|story time|toddler|baby|preschool|kids?|children|family|teen|tween|lego|craft|playgroup)\b/, 'family'],
    [/\b(farmers'? ?market|market)\b/, 'market'],
    [/\b(concert|music|band|choir|jazz|bluegrass|open mic|karaoke|singer|orchestra)\b/, 'music'],
    [/\b(festival|fest|parade|celebration|fair|carnival|fireworks)\b/, 'festival'],
    [/\b(hike|trail|outdoor|nature|bird|garden|wildlife|open space|ranch)\b/, 'outdoors'],
    [/\b(art|arts|painting|gallery|theater|theatre|film|movie|author|book club|writing|poetry|exhibit|photography|craft)\b/, 'arts'],
    [/\b(dinner|brunch|tasting|wine|beer|brew|food|cook|chef|bbq|pancake)\b/, 'food'],
    [/\b(run|5k|10k|race|yoga|fitness|pickleball|soccer|basketball|volleyball|swim|gym|tournament|golf|hockey)\b/, 'sports'],
  ];
  for (const [re, category] of rules) if (re.test(text)) return { category, guessed: true };
  return { category: 'other', guessed: true };
}

/** What a re-ingest compares to see whether the source changed the item. */
export function fingerprint(item: FeedEvent, venue: string | undefined): string {
  const parts = [item.title, item.start.toISOString(), item.end?.toISOString() ?? '', item.allDay ? 'allday' : '', venue ?? '', item.status];
  return createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 12);
}

/**
 * Feed item -> the file it would become in staging. `dupes`, the published
 * listings it may repeat (`possibleDuplicates`), lead the review line.
 */
export function toStaged(item: FeedEvent, source: Source, _town: string, today: string, dupes: PossibleDuplicate[] = []): StagedEvent {
  const guesses: string[] = [];
  const { venue, address, guessed: venueGuessed } = venueFrom(item.location, source);
  const { category, guessed: categoryGuessed } = guessCategory(item);
  const finalVenue = venue ?? 'Venue not given in the feed';
  if (!venue) guesses.push('the feed gives no venue');
  else if (venueGuessed) guesses.push(`venue read from "${item.location}"`);
  if (categoryGuessed) guesses.push(`category guessed (${category})`);
  // The schema refuses an end before the start, and the workflow's strict
  // validate then fails the whole week's ingest (26 October 2026, one LibCal
  // closure entered as 9 pm to 8 pm). Whatever the feed, the end is dropped
  // here and the review line says so; the start stands.
  const endBeforeStart = !!item.end && item.end.getTime() < item.start.getTime();
  if (endBeforeStart) guesses.push(`the feed's end (${toWallClock(item.end!)}) was before its start and was dropped`);
  const dupe = duplicateNote(dupes);
  const reason = [...(dupe ? [dupe] : []), `Ingested from ${source.name}; check against the organizer's page`, ...guesses, 'description is the feed\'s text: rewrite'].join('. ');
  const frontmatter: Record<string, unknown> = {
    title: item.title,
    // On a multi-town guide the feed's registry entry says which town it is
    // for; a shared feed (the chamber's) leaves it for the review to set.
    subTown: source.subTown,
    review: { reason, since: today, from: 'ingest' },
    start: item.start,
    end: endBeforeStart ? undefined : item.end,
    allDay: item.allDay || undefined,
    venue: finalVenue,
    address,
    url: item.url,
    cost: item.cost,
    category,
    status: item.status === 'cancelled' ? 'canceled' : undefined,
    statusNote: item.status === 'cancelled' ? `${source.name} marks this canceled (feed read ${today}).` : undefined,
    statusSource: item.status === 'cancelled' ? item.url ?? source.feedUrl ?? source.url : undefined,
    source: item.url ?? source.url,
    sourceId: source.id,
    sourceUid: item.uid,
    sourceHash: fingerprint(item, venue),
  };
  const slug = eventSlug(item.title, dayKey(item.start));
  const body = item.description
    ? `<!-- The organizer's own text, from the feed. Rewrite in the guide's words before approving. -->\n\n${item.description}`
    : `<!-- The feed carried no description. Write one from the organizer's page before approving. -->`;
  return { slug, frontmatter, body, guesses };
}

export type Match =
  | { kind: 'none' }
  | { kind: 'staged'; existing: ExistingEvent }
  | { kind: 'published'; existing: ExistingEvent }
  /**
   * Two or more published files are each this item, by the organizer's link
   * or by day, time and title: the guide lists one event twice. No rule
   * merges them; the files are flagged for a person to merge.
   */
  | { kind: 'ambiguous'; candidates: ExistingEvent[]; why: string };

/** Within half an hour: the same sitting, as far as a feed can say. */
const HALF_HOUR = 30 * 60_000;

/** The first entry of each file, in order. */
function byFile<T extends { file: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((e) => (seen.has(e.file) ? false : (seen.add(e.file), true)));
}

/**
 * The existing file a feed item is about, if any. The feed's own id wins;
 * then the organizer's page for the item (its link), which a file cites as
 * its `url` or `source` or lists in its body; failing those, the same Denver
 * day and a title sharing most of its words. Two different events on one day
 * at one venue with near-identical titles (two storytimes) are told apart by
 * their start time.
 *
 * `claimed`: every feed id in this run, so that a file another current item
 * owns by id is never taken over by title or link.
 *
 * `siblings`: how many items in the same feed share this item's title and
 * day. One (the usual case) means a listing with that title on that day is
 * this event, whatever time it says, so a moved time is detected as a
 * change. Two or more (a morning and an afternoon storytime) means the time
 * is what tells them apart, and only the nearest within half an hour matches.
 *
 * Where two published files both answer, the item is given to neither: the
 * guide lists the event twice (Johnstown's 1 pm storytime, in two files from
 * two handoffs, until 26 October 2026), and which one stays is an editor's
 * call. A published file within half an hour is preferred to one that is
 * not, so a series at 10 and its twin at 1 are not taken for a pair on a day
 * the feed lists only one of them.
 */
export function matchExisting(item: FeedEvent, existing: ExistingEvent[], siblings = 1, claimed?: ReadonlySet<string>, host?: string): Match {
  // A site's ids are its own: CivicPlus numbers its events from 1 on every
  // site, so Firestone's 2690 and Dacono's 2690 are two events on one guide.
  // The site, not the registry entry, is the scope: Longmont's council and
  // library feeds are one site and share ids, and an item in both is one
  // event. A file whose host is unknown still matches any id, as before.
  // tickets.lctix.com and www.lctix.com are one site: the comparison is on
  // the registrable domain, not the hostname.
  const byUid = existing.find((e) => e.sourceUid && e.sourceUid === item.uid && (!host || !e.sourceHost || sameSite(e.sourceHost, host)));
  if (byUid) return { kind: byUid.staged ? 'staged' : 'published', existing: byUid };
  const day = dayKey(item.start);
  const near = (e: ExistingEvent) => item.allDay || Math.abs(e.start.getTime() - item.start.getTime()) <= HALF_HOUR;
  // A file whose own feed id is still in this run belongs to that item.
  // "Council at Longmont Farmers Market" shares most of its words with the
  // market itself, and once took over the market's file; an id that has
  // gone from the feed (the County's change when a time moves) can still
  // be found by its title, which is how a moved event is noticed.
  const free = (e: ExistingEvent) => !(claimed && e.sourceUid && e.sourceUid !== item.uid && claimed.has(e.sourceUid));
  const sameDay = existing.filter((e) => dayKey(e.start) === day && free(e));
  const decide = (found: ExistingEvent[], why: string): Match | undefined => {
    if (!found.length) return undefined;
    const published = byFile(found.filter((e) => !e.staged));
    if (published.length > 1) {
      const close = published.filter(near);
      if (close.length === 1) return { kind: 'published', existing: close[0]! };
      return { kind: 'ambiguous', candidates: close.length > 1 ? close : published, why };
    }
    const best = found[0]!;
    return { kind: best.staged ? 'staged' : 'published', existing: best };
  };
  // The organizer's page for this date: the id a file without the feed's
  // own carries. A file that cites another session's page (the 10 am
  // listing linking the 1 pm page) is not this item, so with a sibling that
  // day the time still has to agree.
  const link = item.url ? normalizeUrl(item.url) : undefined;
  if (link) {
    const found = sameDay.filter((e) => e.urls?.some((u) => normalizeUrl(u) === link) && (siblings <= 1 || near(e)));
    const hit = decide(found, `each cites the organizer's page for it, ${item.url}`);
    if (hit) return hit;
  }
  const scored: Array<{ e: ExistingEvent; score: number }> = [];
  for (const e of sameDay) {
    const score = titleSimilarity(item.title, e.title);
    if (score < INGEST.titleMatch) continue;
    if (siblings > 1 && !item.allDay && !near(e)) continue;
    scored.push({ e, score });
  }
  // Highest first; the sort is stable, so a tie goes to the file found first, as before.
  scored.sort((a, b) => b.score - a.score);
  return decide(scored.map((s) => s.e), 'the same day and nearly the same title') ?? { kind: 'none' };
}

/** A published file the review should rule on before a staged item is approved beside it. */
export interface PossibleDuplicate {
  existing: ExistingEvent;
  /** Why, in words for the review line. */
  why: string;
}

/** Below this share of words, two titles at one place and time are two events (a storytime and a board meeting). */
export const DUPLICATE_TITLE_FLOOR = 0.3;

/** One venue, by its name or by its street address written either way. */
export function sameVenue(a: { venue?: string; address?: string }, b: { venue?: string; address?: string }): boolean {
  if (a.venue && b.venue && normalizeVenue(a.venue) === normalizeVenue(b.venue)) return true;
  return sameAddress(a.address, b.address);
}

/**
 * Published files a new item may repeat though it matched none of them: the
 * same day, a start within half an hour, the same venue (by name, or by
 * address with "400 S Parish Ave" read as "400 South Parish Avenue"), and
 * titles that share some words without sharing most ("Music & Movement
 * Storytime" and "Afternoon Sessions: Music and Movement"). Neither merged
 * nor dropped: the item goes to staging with the files named, and the
 * standing rules leave it for a person (scripts/lib/auto-review.ts).
 */
export function possibleDuplicates(
  item: FeedEvent,
  place: { venue?: string; address?: string },
  existing: ExistingEvent[],
  claimed?: ReadonlySet<string>,
): PossibleDuplicate[] {
  const day = dayKey(item.start);
  const out: PossibleDuplicate[] = [];
  for (const e of existing) {
    if (e.staged || dayKey(e.start) !== day) continue;
    if (claimed && e.sourceUid && e.sourceUid !== item.uid && claimed.has(e.sourceUid)) continue;
    if (!item.allDay && Math.abs(e.start.getTime() - item.start.getTime()) > HALF_HOUR) continue;
    if (!sameVenue(place, e)) continue;
    const score = titleSimilarity(item.title, e.title);
    if (score < DUPLICATE_TITLE_FLOOR) continue;
    out.push({ existing: e, why: `same day, start within half an hour, same venue, titles ${Math.round(score * 100)}% alike` });
  }
  return byFile(out.map((d) => ({ ...d, file: d.existing.file }))).map(({ existing: e, why }) => ({ existing: e, why }));
}

/** The review line a staged item carries while it may repeat a published listing. */
export function duplicateNote(dupes: PossibleDuplicate[]): string | undefined {
  if (!dupes.length) return undefined;
  const list = dupes.map((d) => `${d.existing.slug} ("${d.existing.title}": ${d.why})`).join(' and ');
  return `Possible duplicate of ${list}. Merge it into that listing or reject it; do not approve it as a new one`;
}

/** The flag a published file carries while another published file lists the same event. */
export function ambiguousNote(item: FeedEvent, candidates: ExistingEvent[], why: string, sourceName: string, today: string): string {
  const files = candidates.map((c) => c.slug).join(' and ');
  return `Possible duplicate listings: ${files} are each "${item.title}" on ${toWallClock(item.start)} in ${sourceName} (${why}; read ${today}). Keep one, merge the other's facts into it and redirect its URL, or dismiss`;
}

/** For each item, how many items in the same feed share its title and day. */
export function siblingCounts(items: FeedEvent[]): Map<FeedEvent, number> {
  const key = (i: FeedEvent) => `${[...titleTokens(i.title)].sort().join(' ')}|${dayKey(i.start)}`;
  const counts = new Map<string, number>();
  for (const i of items) counts.set(key(i), (counts.get(key(i)) ?? 0) + 1);
  return new Map(items.map((i) => [i, counts.get(key(i)) ?? 1]));
}

/**
 * What the source changed on a published event, field by field; empty when
 * nothing did. A venue counts only when the feed names it with the editor's
 * own alias or default (`venueConfident`): a feed that says "Council
 * Chambers, 645 Holbrook Street" where the guide says "Erie Town Hall" is
 * naming the room, not moving the meeting.
 */
export function detectChanges(item: FeedEvent, existing: ExistingEvent, venue: string | undefined, venueConfident = true): Array<{ field: string; was: string; now: string }> {
  const changes: Array<{ field: string; was: string; now: string }> = [];
  if (existing.start.getTime() !== item.start.getTime()) {
    changes.push({ field: 'start', was: toWallClock(existing.start), now: toWallClock(item.start) });
  }
  if (item.end && existing.end && existing.end.getTime() !== item.end.getTime()) {
    changes.push({ field: 'end', was: toWallClock(existing.end), now: toWallClock(item.end) });
  }
  if (venue && venueConfident && normalizeVenue(venue) !== normalizeVenue(existing.venue)) {
    changes.push({ field: 'venue', was: existing.venue, now: venue });
  }
  const wasCanceled = existing.status === 'canceled' || existing.status === 'postponed';
  if (item.status === 'cancelled' && !wasCanceled) changes.push({ field: 'status', was: existing.status ?? 'scheduled', now: 'canceled' });
  return changes;
}
