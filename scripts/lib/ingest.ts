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
import type { FeedEvent } from './feeds/types.ts';
import { slugify } from './event-files.ts';

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

/** Whether the editor has excluded this title from the source. */
export function excludedTitle(item: Pick<FeedEvent, 'title'>, source: Pick<Source, 'excludeTitles'>): boolean {
  if (!source.excludeTitles?.length) return false;
  const title = item.title.toLowerCase();
  return source.excludeTitles.some((t) => title.includes(t.toLowerCase()));
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
export function venueFrom(location: string | undefined, source: Pick<Source, 'venueAliases' | 'defaultVenue'>): { venue?: string; address?: string; guessed: boolean } {
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
  if (source.defaultVenue) {
    const named = parts.find((p) => p.toLowerCase().includes(source.defaultVenue!.toLowerCase()));
    return { venue: named ? source.defaultVenue : source.defaultVenue, address: addressIn(parts), guessed: false };
  }
  const isRoom = (p: string) => /\b(room|hall|suite|offsite|online|virtual|zoom|chambers|library living room)\b/i.test(p) && !/library|center|centre|park|church|school|hall$/i.test(p);
  const isAddress = (p: string) => /^\d/.test(p);
  const isRegion = (p: string, i: number) =>
    /^(co|colorado|usa?|us|united states)$/i.test(p) ||
    /^\d{5}(-\d{4})?$/.test(p) ||
    /^[A-Za-z .]+,?\s*CO\b/.test(p) ||
    /^CO\s+\d{5}/.test(p) ||
    // "Berthoud" followed by "CO 80513" is the town, not a venue.
    /^(CO|Colorado)\b/.test(parts[i + 1] ?? '');
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

/** Feed item -> the file it would become in staging. */
export function toStaged(item: FeedEvent, source: Source, town: string, today: string): StagedEvent {
  const guesses: string[] = [];
  const { venue, address, guessed: venueGuessed } = venueFrom(item.location, source);
  const { category, guessed: categoryGuessed } = guessCategory(item);
  const finalVenue = venue ?? 'Venue not given in the feed';
  if (!venue) guesses.push('the feed gives no venue');
  else if (venueGuessed) guesses.push(`venue read from "${item.location}"`);
  if (categoryGuessed) guesses.push(`category guessed (${category})`);
  const reason = [`Ingested from ${source.name}; check against the organizer's page`, ...guesses, 'description is the feed\'s text: rewrite'].join('. ');
  const frontmatter: Record<string, unknown> = {
    title: item.title,
    review: { reason, since: today, from: 'ingest' },
    start: item.start,
    end: item.end,
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
  const slug = `${slugify(item.title)}-${dayKey(item.start)}`;
  const body = item.description
    ? `<!-- The organizer's own text, from the feed. Rewrite in the guide's words before approving. -->\n\n${item.description}`
    : `<!-- The feed carried no description. Write one from the organizer's page before approving. -->`;
  return { slug, frontmatter, body, guesses };
}

export type Match =
  | { kind: 'none' }
  | { kind: 'staged'; existing: ExistingEvent }
  | { kind: 'published'; existing: ExistingEvent };

/**
 * The existing file a feed item is about, if any. The feed's own id wins;
 * failing that, the same Denver day and a title sharing most of its words.
 * Two different events on one day at one venue with near-identical titles
 * (two storytimes) are told apart by their start time.
 */
/**
 * `siblings`: how many items in the same feed share this item's title and
 * day. One (the usual case) means a listing with that title on that day is
 * this event, whatever time it says, so a moved time is detected as a
 * change. Two or more (a morning and an afternoon storytime) means the time
 * is what tells them apart, and only the nearest within half an hour matches.
 */
export function matchExisting(item: FeedEvent, existing: ExistingEvent[], siblings = 1): Match {
  const byUid = existing.find((e) => e.sourceUid && e.sourceUid === item.uid);
  if (byUid) return { kind: byUid.staged ? 'staged' : 'published', existing: byUid };
  const day = dayKey(item.start);
  const sameDay = existing.filter((e) => dayKey(e.start) === day);
  let best: { e: ExistingEvent; score: number } | undefined;
  for (const e of sameDay) {
    const score = titleSimilarity(item.title, e.title);
    if (score < INGEST.titleMatch) continue;
    if (siblings > 1 && !item.allDay && Math.abs(e.start.getTime() - item.start.getTime()) > 30 * 60_000) continue;
    if (!best || score > best.score) best = { e, score };
  }
  if (!best) return { kind: 'none' };
  return { kind: best.e.staged ? 'staged' : 'published', existing: best.e };
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
