/**
 * The places re-check (the owner, 18 November 2026): every place on the hub
 * (the four full sections and the places kept page by page) and on the seven
 * guides is read against its source again on a rotation, each well inside
 * its window (90 days on the Front Range, 60 in the mountains; FRESHNESS in
 * src/config/freshness.ts), by the same rules as the events re-check, as
 * the owner settled them on 18 November 2026:
 *
 *   confirmed      the source names the place again: a new check date;
 *   changed        the source names it with another phone number: flagged
 *                  with the evidence, for the weekly editor run to update;
 *   closed         the place's page says it has closed for good, in those
 *                  words, naming it: `status: closed`, which the next
 *                  redirect-map rebuild answers with 410;
 *   closure-check  a sign it may have closed that is not that (its page gone,
 *                  a locator that no longer lists it, "Site Closed" with no
 *                  word on how long): `closureCheck`, for a person to
 *                  confirm; nothing hidden, never a 410 by itself;
 *   blocked        no reading (a bot check, a refusal, robots.txt, no
 *                  answer): `readBlocked`, on the needs-me list; the listing
 *                  stays visible while `verified` is inside its window, and
 *                  the usual freshness rules apply once it is not.
 *
 * A place a person set aside (`recheckPending`) is read too, but only the
 * person clears it (`npm run confirm-place`).
 *
 * Pure functions over the file's fields and the page that was fetched, so
 * the script (scripts/recheck-places.ts) and the tests read one rule.
 */
import { FRESHNESS } from '../config/freshness.ts';
import type { TownVariant } from '../config/towns/types.ts';

/**
 * A place is due once it is half its window old: 45 days on the Front Range,
 * 30 in the mountains. The rotation reads the most overdue first, a night's
 * budget at a time; with the budget below every place is read again within
 * about three weeks of falling due, so none reaches its window unread.
 */
export const RECHECK_SHARE = 0.5;
/** Places read in one night, at most. About 950 places over a 30-day cycle is 32 a night; the rest is headroom. */
export const NIGHTLY_BUDGET = 60;

export function recheckDueDays(variant: TownVariant): number {
  return Math.floor(FRESHNESS.listingDays[variant] * RECHECK_SHARE);
}

/** The fields of a place file the rotation reads. */
export interface RecheckPlace {
  town: string;
  slug: string;
  title: string;
  variant: TownVariant;
  status?: string;
  /** "YYYY-MM-DD", or undefined where the file has none. */
  verified?: string;
  recheckPending?: string;
  readBlocked?: string;
  closureCheck?: string;
  source?: string;
  url?: string;
  phone?: string;
  address?: string;
}

/** Whole days from one "YYYY-MM-DD" to another. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/**
 * Tonight's places: every place on the needs-me list (set aside, its read
 * blocked, or a possible closure), read each night outside the budget so a
 * source that opens up is caught the next morning and they never crowd out
 * the rotation; then the open and temporarily closed places half their
 * window old, the oldest share of its window first, up to the budget. A
 * place closed for good is not read: its page already says so.
 */
export function duePlaces<P extends RecheckPlace>(places: readonly P[], today: string, budget = NIGHTLY_BUDGET): P[] {
  const urgency = (p: P) => (p.verified ? daysBetween(p.verified, today) / FRESHNESS.listingDays[p.variant] : 9);
  const order = (a: P, b: P) => urgency(b) - urgency(a) || a.town.localeCompare(b.town) || a.slug.localeCompare(b.slug);
  const open = places.filter((p) => p.status !== 'closed');
  const flagged = (p: P) => !!(p.recheckPending || p.readBlocked || p.closureCheck);
  const waiting = open.filter(flagged).sort(order);
  const due = open.filter((p) => !flagged(p) && (!p.verified || daysBetween(p.verified, today) >= recheckDueDays(p.variant))).sort(order).slice(0, budget);
  return [...waiting, ...due];
}

export type PlaceVerdict = 'confirmed' | 'changed' | 'closed' | 'closure-check' | 'blocked';

export interface PlaceJudgement {
  verdict: PlaceVerdict;
  /** What was read where, in a sentence: the evidence for the file and the report. */
  note: string;
  /** The words on the page that say it closed, for the status note. */
  quote?: string;
  /**
   * Confirmed by the place's name alone (a trailhead, a campground: no phone
   * or street number to read again): the note says so in `verifiedBy`. A
   * place a person set aside is never cleared by the nightly run, by name or
   * by fact (scripts/recheck-places.ts).
   */
  byName?: boolean;
}

/**
 * What a fetch came back with: the status code ("000" for no answer), the
 * body, its visible text, and `main`, the text without the page's header,
 * footer and navigation (a city's switchboard number in every footer is not
 * the park's), or that robots.txt said no.
 */
export type Fetched = { code: string; body: string; text: string; main?: string } | 'robots';

/** The page's own content: header, footer and navigation taken out, for its phone numbers. */
export function mainHtml(html: string): string {
  return html.replace(/<(header|footer|nav)\b[\s\S]*?<\/\1>/gi, ' ');
}

const STOP = new Set(['the', 'a', 'an', 'and', 'of', 'at', 'in', 'on', 'co', 'colorado', '&']);
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** The listing's name on the page: every word of it that counts (not "the", not "at"), or the whole name folded. */
export function namesPlace(text: string, title: string): boolean {
  const page = ` ${fold(text)} `;
  const name = fold(title);
  if (name && page.includes(` ${name} `)) return true;
  const words = name.split(' ').filter((w) => w.length > 1 && !STOP.has(w));
  return words.length > 0 && words.every((w) => page.includes(` ${w} `));
}

/** Ten digits, as a phone number is written anywhere: "(303) 555-0100", "303.555.0100", "+1 303 555 0100". */
export function phonesOn(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(/(?:\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-](\d{4})\b/g)) out.add(`${m[1]}${m[2]}${m[3]}`);
  return [...out];
}

const digits = (phone: string | undefined) => (phone ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');

/**
 * A page that says the place has closed for good, in words that cannot mean
 * a season or a holiday ("closed for the season", "temporarily closed" are
 * not closures). The match is returned so the file can quote it.
 */
export function closureOn(text: string): string | undefined {
  const sentences = text.split(/(?<=[.!?])\s+|\n/);
  for (const s of sentences) {
    if (/temporar|for the (season|winter|summer|holiday)|until further notice|seasonal|reopen/i.test(s)) continue;
    const m = s.match(/\b(permanently closed|closed permanently|closed for good|has (?:now )?closed (?:its|our) doors|(?:we|they) (?:have|are) (?:now )?(?:permanently )?closed (?:for good|permanently)|is (?:now )?permanently closed|will (?:be )?clos(?:e|ing) permanently)\b/i);
    if (m) return s.trim().slice(0, 240);
  }
  return undefined;
}

/**
 * Words that may mean the place has closed but do not say for good ("Site
 * Closed", "this location is closed", "closed until further notice"): a
 * person confirms (closure-check). Not an hours line ("Closed Mondays").
 */
export function unclearClosureOn(text: string): string | undefined {
  // Read the page a line and a sentence at a time, with the next line beside it, so "The store is closed on" /
  // "the following holidays" reads as one: a closed day or a holiday is the hours, not a closure.
  const lines = text.split(/(?<=[.!?])\s+|\n/).map((s) => s.trim()).filter(Boolean);
  for (const [i, s] of lines.entries()) {
    const m = s.match(/\b(site closed|location (?:is )?closed|store (?:is )?closed|currently closed|closed until further notice|closed indefinitely|temporarily closed|no longer (?:open|operating|in business))\b/i);
    if (!m) continue;
    const after = `${s.slice(m.index! + m[0].length)} ${lines[i + 1] ?? ''}`;
    if (HOURS_CLOSING.test(after) || OPENS_AGAIN.test(s)) continue;
    return s.slice(0, 240);
  }
  return undefined;
}
/** "closed on Mondays", "closed for the following holidays", "closed today": the hours, not a closure. */
const HOURS_CLOSING = /^\s*(?:on|for|every|each|at|during|from|today|tonight|tomorrow|this|weekends?|holidays?|the following|(?:mon|tues|wednes|thurs|fri|satur|sun)days?)\b/i;
/** "Currently closed · Opens 11 AM": a place between its hours. */
const OPENS_AGAIN = /\bopens?\s+(?:at|tomorrow|today|\d|(?:mon|tue|wed|thu|fri|sat|sun))/i;

/**
 * The verdict on one place from what its source answered. `where` names the
 * page in the note ("the source page", "the place's own site").
 */
/** The street address on the page: its number and the first word of its street ("111 Richman Street" → 111 … richman). */
export function addressOn(text: string, address: string | undefined): boolean {
  const m = (address ?? '').match(/^\s*(\d+[a-z]?)\s+(?:[nsew]\.?\s+|north\s+|south\s+|east\s+|west\s+)?([a-z0-9]+)/i);
  if (!m) return false;
  const page = ` ${fold(text)} `;
  return new RegExp(` ${m[1]!.toLowerCase()} (?:[a-z]+ ){0,2}${fold(m[2]!)} `).test(page);
}

export function judgePlace(place: Pick<RecheckPlace, 'title' | 'phone' | 'address' | 'status'>, got: Fetched, where: string): PlaceJudgement {
  if (got === 'robots') return { verdict: 'blocked', note: `${where}: robots.txt asks automated clients not to read it` };
  // A page gone is a sign, not proof: a person confirms before anything changes.
  if (got.code === '404' || got.code === '410') return { verdict: 'closure-check', note: `${where} answers ${got.code}: the page is gone` };
  if (!/^2/.test(got.code)) {
    const why = got.code === '000' ? 'no answer' : /^(401|403|429|503)$/.test(got.code) ? `${got.code}, a bot check or a refusal` : `answered ${got.code}`;
    return { verdict: 'blocked', note: `${where}: ${why}` };
  }
  const text = got.text;
  // A shell drawn by JavaScript, or a challenge page that answered 200: nothing to read.
  if (text.length < 200 && !namesPlace(text, place.title)) return { verdict: 'blocked', note: `${where} answered, but showed nothing to read (a page drawn by JavaScript, or a challenge)` };
  const named = namesPlace(text, place.title);
  const closure = closureOn(text);
  if (closure && named) return { verdict: 'closed', note: `${where} says it has closed for good`, quote: closure };
  // "Site Closed", "currently closed": unless the listing already has it closed for now, a person confirms.
  const unclear = named ? unclearClosureOn(text) : undefined;
  if (unclear && place.status !== 'temporarily-closed') return { verdict: 'closure-check', note: `${where} may say it has closed, without saying for good`, quote: unclear };
  const ours = digits(place.phone);
  const listed = phonesOn(got.main ?? text);
  if (named && ours && listed.length > 0 && !listed.includes(ours)) {
    return { verdict: 'changed', note: `${where} names the place but lists ${listed.slice(0, 3).map((p) => `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`).join(', ')}, not ${place.phone}` };
  }
  // Confirmed: the page names it and shows a fact of the listing again (its phone, or its street address),
  // or names it where the listing has neither to check (a trailhead, a park without a street number).
  const samePhone = !!ours && listed.includes(ours);
  const sameAddress = addressOn(text, place.address);
  const checkable = !!ours || /^\s*\d/.test(place.address ?? '');
  if (named && (samePhone || sameAddress)) return { verdict: 'confirmed', note: `${where} still names it${samePhone ? ', with the same phone number' : ''}${sameAddress ? `${samePhone ? ' and' : ','} at the same address` : ''}` };
  if (samePhone) return { verdict: 'confirmed', note: `${where} lists its phone number` };
  // Named, and nothing on the page contradicts it, but no fact of the listing to read it by: a check date
  // for a listing in the rotation; a place a person set aside is never written (byName).
  if (named) return { verdict: 'confirmed', note: `${where} still names it (${checkable ? 'its phone and street address are not on the page to compare' : 'the listing has no phone or street number to compare'})`, byName: true };
  // A store missing from a locator, a listing gone from a directory: a sign it may have closed, for a person.
  return { verdict: 'closure-check', note: `${where} answered but no longer names the place or lists its phone` };
}
