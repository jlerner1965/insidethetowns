/**
 * What may publish: the one rule the build, the validator and the report share.
 *
 * A valid entry (src/content/schemas.ts) is not yet a publishable one. To
 * publish, an event or a place must say where it was read (`source`) and when
 * (`verified`), and a place claiming to be open must have been checked inside
 * its town's freshness window (src/config/freshness.ts). Anything else is
 * held back with a reason, and the reason is what gets printed, so a listing
 * that drops off the site always leaves a line saying why.
 *
 * Pure functions over frontmatter data, so the scripts can run them without
 * Astro and the tests can pin the boundaries.
 */
import { FRESHNESS, windowsFor } from '../config/freshness.ts';
import type { TownVariant } from '../config/towns/types.ts';
import { isExcluded } from '../content/schemas.ts';
import { TIME_ZONE, addDays, dayKey, fromWallClock, startOfDay } from './dates.ts';

const DAY = 86_400_000;

/** Whole Denver days from `verified` to `now`; negative if `verified` is ahead of today. */
export function ageDays(verified: Date, now: Date = new Date()): number {
  return Math.round((startOfDay(now).getTime() - startOfDay(verified).getTime()) / DAY);
}

type Provenanced = { source?: string; verified?: Date };
/** The part of a `seasonal` block the gate reads; see seasonalSchema. */
export type SeasonLike = { opens?: Date; closes?: Date; openMonths?: readonly string[]; closedMonths?: readonly string[] };
type PlaceLike = Provenanced & { status?: string; hours?: string; seasonal?: SeasonLike };

/** Why an entry may not publish, or null when it may. */
export type Exclusion =
  | { reason: 'invalid'; detail: string }
  | { reason: 'no-source'; detail: string }
  | { reason: 'no-verified'; detail: string }
  | { reason: 'stale'; detail: string; ageDays: number; windowDays: number };

/**
 * Whether a place may appear on the site at all.
 *
 * A `closed` or `temporarily-closed` listing is not held to the window: its
 * claim is that the place is shut, which the passing of ninety days does
 * not make less true, and the page exists for the reader who goes looking
 * for it. It still needs its source and date like everything else.
 */
export function placeExclusion(data: unknown, variant: TownVariant, now: Date = new Date()): Exclusion | null {
  const common = provenanceExclusion(data);
  if (common) return common;
  const place = data as PlaceLike & { verified: Date };
  if (place.status && place.status !== 'open') return null;
  const { listingDays } = windowsFor(variant);
  const age = ageDays(place.verified, now);
  if (age > listingDays) {
    return {
      reason: 'stale',
      detail: `verified ${dayKey(place.verified)}, ${age} days ago; a ${variant} listing is shown for ${listingDays}`,
      ageDays: age,
      windowDays: listingDays,
    };
  }
  return null;
}

/** Whether an event may appear. Events do not go stale; they end (src/lib/events.ts decides that). */
export function eventExclusion(data: unknown): Exclusion | null {
  return provenanceExclusion(data);
}

/**
 * Whether a place's hours may be shown. Hours drift before anything else
 * does, so they are hidden ahead of the listing: past `hoursDays` the row
 * and the page keep the address and the phone and say nothing about hours,
 * and nothing claims "Open now".
 */
export function hoursFresh(data: PlaceLike, variant: TownVariant, now: Date = new Date()): boolean {
  if (!data.verified) return false;
  return ageDays(data.verified, now) <= windowsFor(variant).hoursDays;
}

/** Whether a trail's or park's access notes may be shown. */
export function accessFresh(access: { verified: Date } | undefined, now: Date = new Date()): boolean {
  if (!access) return false;
  return ageDays(access.verified, now) <= FRESHNESS.accessDays;
}

/**
 * Days until a listing crosses its window, for the report's forward look;
 * negative once it has. A closed listing never does.
 */
export function daysUntilStale(data: PlaceLike, variant: TownVariant, now: Date = new Date()): number | null {
  if (!data.verified) return null;
  if (data.status && data.status !== 'open') return null;
  return windowsFor(variant).listingDays - ageDays(data.verified, now);
}

/**
 * Days until a trail's, trailhead's or park's access notes cross their own
 * window (FRESHNESS.accessDays), for the same forward look the listings get;
 * negative once they have. Null where there are none. The notes carry their
 * own check date, so re-checking a listing's hours does not renew them.
 */
export function daysUntilAccessStale(access: { verified: Date } | undefined, now: Date = new Date()): number | null {
  if (!access) return null;
  return FRESHNESS.accessDays - ageDays(access.verified, now);
}

/** Due for the rotation: not re-checked in `recheckDays`. */
export function dueForRecheck(data: Provenanced, now: Date = new Date()): boolean {
  if (!data.verified) return true;
  return ageDays(data.verified, now) > FRESHNESS.recheckDays;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * Whether a seasonal place is open for the season today, in Denver.
 *
 * `opens` and `closes` decide when both are set: the season runs from the
 * start of the first day to the end of the last. Otherwise `closedMonths`
 * decides, matched on the first three letters so "Nov", "November" and
 * "nov" all read the same. A block with neither says nothing about today
 * and the place is treated as in season; its `season` text still shows.
 */
export function inSeason(seasonal: SeasonLike | undefined, now: Date = new Date()): boolean {
  if (!seasonal) return true;
  const today = startOfDay(now);
  if (seasonal.opens && seasonal.closes) {
    return today.getTime() >= startOfDay(seasonal.opens).getTime() && today.getTime() <= startOfDay(seasonal.closes).getTime();
  }
  const months = openMonthSet(seasonal);
  if (months) return months.has(Number(dayKey(now).slice(5, 7)) - 1);
  return true;
}

/** Whether a season can be placed on the calendar: dates, or the months it is open or shut. */
export function seasonDated(seasonal: SeasonLike | undefined): boolean {
  if (!seasonal) return false;
  return (!!seasonal.opens && !!seasonal.closes) || openMonthSet(seasonal) !== undefined;
}

/** A month name as the operator wrote it, as an index 0 to 11; undefined for anything else. */
function monthIndex(name: string): number | undefined {
  const i = MONTHS.indexOf(name.trim().slice(0, 3).toLowerCase());
  return i === -1 ? undefined : i;
}

/**
 * The months a place is open, as indices, from `openMonths` or the
 * complement of `closedMonths`; undefined when the block names neither, or
 * names every month (a season that never turns is not a season).
 */
export function openMonthSet(seasonal: SeasonLike | undefined): Set<number> | undefined {
  if (!seasonal) return undefined;
  const open = (seasonal.openMonths ?? []).map(monthIndex).filter((i): i is number => i !== undefined);
  if (open.length > 0) return open.length < 12 ? new Set(open) : undefined;
  const closed = (seasonal.closedMonths ?? []).map(monthIndex).filter((i): i is number => i !== undefined);
  if (closed.length === 0) return undefined;
  const set = new Set(MONTHS.map((_, i) => i).filter((i) => !closed.includes(i)));
  return set.size === 0 ? undefined : set;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The months a place is open, as a reader reads them: "May–Oct", "Nov–Apr"
 * for a run that wraps the year, "May–Jun, Sep–Oct" for a split one.
 * Undefined when the block gives no months. The label is the months as
 * declared, whatever today is; `seasonLabel` says whether it is open.
 */
export function openMonthsLabel(seasonal: SeasonLike | undefined): string | undefined {
  const months = openMonthSet(seasonal);
  if (!months) return undefined;
  // Runs of consecutive open months, starting after a closed month so a run
  // across December and January reads as one.
  const first = MONTHS.findIndex((_, i) => months.has(i) && !months.has((i + 11) % 12));
  const start = first === -1 ? 0 : first;
  const runs: Array<[number, number]> = [];
  for (let k = 0; k < 12; k++) {
    const i = (start + k) % 12;
    if (!months.has(i)) continue;
    const last = runs[runs.length - 1];
    if (last && last[1] === (i + 11) % 12) last[1] = i;
    else runs.push([i, i]);
  }
  return runs.map(([a, b]) => (a === b ? MONTH_LABELS[a] : `${MONTH_LABELS[a]}–${MONTH_LABELS[b]}`)).join(', ');
}

/**
 * The one line a row or a card shows for a seasonal place: "Open May–Oct"
 * while it is in season, "Closed for the season" when it is not, with the
 * month or the day it reopens where the block says. Undefined for a block
 * that cannot be placed on the calendar (its `season` text still shows on
 * the page) and for a place with no season.
 */
export function seasonLabel(seasonal: SeasonLike | undefined, now: Date = new Date()): string | undefined {
  if (!seasonal || !seasonDated(seasonal)) return undefined;
  const months = openMonthsLabel(seasonal);
  if (inSeason(seasonal, now)) return months ? `Open ${months}` : 'Open for the season';
  const turn = seasonTurn(seasonal, now);
  if (turn?.kind !== 'opens') return 'Closed for the season';
  // A dated season reopens on a day; one given as months reopens in a month.
  const when = seasonal.opens && seasonal.closes ? formatTurnDay(turn.on) : MONTH_LABELS[Number(dayKey(turn.on).slice(5, 7)) - 1];
  return `Closed for the season; reopens ${when}`;
}

/** "May 23", for a dated reopening. */
function formatTurnDay(day: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'long', day: 'numeric' }).format(day);
}

/** When a season next turns, or last turned: the day the place opens or closes. */
export interface SeasonTurn {
  /** What happens on `on`: the place opens for the season, or closes for it. */
  kind: 'opens' | 'closes';
  /** The first day of the new state, a Denver day at 00:00. */
  on: Date;
}

/** The first Denver day of a month, `monthsAhead` months from the month `now` is in (negative for past). */
function monthStart(now: Date, monthsAhead: number): Date {
  const [y, m] = dayKey(now).split('-').map(Number) as [number, number];
  const total = y * 12 + (m - 1) + monthsAhead;
  const year = Math.floor(total / 12);
  const month = total - year * 12 + 1;
  return fromWallClock(year, month, 1, 0, 0, 0);
}

/**
 * The next day the season turns, from `now` forward: the day it opens if it
 * is closed, the day after `closes` (or the first closed month) if it is
 * open. A dated season that has closed with no next `opens` has no next
 * turn. A block with no dates and no months never turns.
 */
export function seasonTurn(seasonal: SeasonLike | undefined, now: Date = new Date()): SeasonTurn | undefined {
  if (!seasonal) return undefined;
  const today = startOfDay(now);
  if (seasonal.opens && seasonal.closes) {
    const opens = startOfDay(seasonal.opens);
    const dayAfterClose = addDays(startOfDay(seasonal.closes), 1);
    if (today.getTime() < opens.getTime()) return { kind: 'opens', on: opens };
    if (today.getTime() < dayAfterClose.getTime()) return { kind: 'closes', on: dayAfterClose };
    return undefined;
  }
  const months = openMonthSet(seasonal);
  if (!months) return undefined;
  const open = inSeason(seasonal, now);
  for (let ahead = 1; ahead <= 12; ahead++) {
    const on = monthStart(now, ahead);
    const month = Number(dayKey(on).slice(5, 7)) - 1;
    if (months.has(month) !== open) return { kind: open ? 'closes' : 'opens', on };
  }
  return undefined;
}

/** The most recent day the season turned, on or before today; undefined when it never has or the block cannot say. */
export function lastSeasonTurn(seasonal: SeasonLike | undefined, now: Date = new Date()): SeasonTurn | undefined {
  if (!seasonal) return undefined;
  const today = startOfDay(now);
  if (seasonal.opens && seasonal.closes) {
    const opens = startOfDay(seasonal.opens);
    const dayAfterClose = addDays(startOfDay(seasonal.closes), 1);
    if (today.getTime() >= dayAfterClose.getTime()) return { kind: 'closes', on: dayAfterClose };
    if (today.getTime() >= opens.getTime()) return { kind: 'opens', on: opens };
    return undefined;
  }
  const months = openMonthSet(seasonal);
  if (!months) return undefined;
  const open = inSeason(seasonal, now);
  for (let back = 0; back < 12; back++) {
    const on = monthStart(now, -back);
    const before = Number(dayKey(monthStart(now, -back - 1)).slice(5, 7)) - 1;
    if (months.has(before) !== open) return { kind: open ? 'opens' : 'closes', on };
  }
  return undefined;
}

/** Why a seasonal listing is on the re-check list, for the weekly report and the review's summary. */
export interface SeasonRecheck {
  kind: 'opens' | 'closes';
  /** The day the season turns, or turned. */
  on: Date;
  /** Days from today to that day; zero or negative once it has passed. */
  inDays: number;
}

/**
 * Whether a seasonal listing is due a re-check because its season is about
 * to turn, or has turned since it was last checked. The hours, the phone
 * message and the "open" claim all change on that day, whatever the
 * listing's own freshness window says, so the weekly report lists it:
 * within `horizonDays` of the turn ahead, and from the turn behind until
 * `verified` is on or after it. An open-all-year listing is never here.
 */
export function seasonRecheck(
  data: { seasonal?: SeasonLike; verified?: Date; status?: string },
  now: Date = new Date(),
  horizonDays: number = FRESHNESS.reportHorizonDays,
): SeasonRecheck | undefined {
  if (!data.seasonal || (data.status && data.status !== 'open')) return undefined;
  const today = startOfDay(now);
  const days = (on: Date) => Math.round((on.getTime() - today.getTime()) / DAY);
  const last = lastSeasonTurn(data.seasonal, now);
  if (last && (!data.verified || startOfDay(data.verified).getTime() < last.on.getTime())) {
    return { kind: last.kind, on: last.on, inDays: days(last.on) };
  }
  const next = seasonTurn(data.seasonal, now);
  if (next && days(next.on) <= horizonDays) return { kind: next.kind, on: next.on, inDays: days(next.on) };
  return undefined;
}

/**
 * Whether a place's season hours stand in for its `hours` today. Only a
 * season with dates (or closed months) can say it is running; one without
 * says nothing about today, so its hours stay text on the Season line and
 * the year-round `hours` stand. Otherwise a place open all year with a
 * summer schedule would show the summer hours in January.
 */
export function seasonalHoursApply(seasonal: (SeasonLike & { hours?: string }) | undefined, now: Date = new Date()): boolean {
  return !!seasonal?.hours && seasonDated(seasonal) && inSeason(seasonal, now);
}

/**
 * What a published listing may still show. A closed place keeps its page
 * (James, 3 October: with a clear notice, no hours or phone, and out of the
 * directory and the search index); a listing whose hours have passed their
 * window keeps everything but the hours, and the page says they are not
 * shown rather than leaving a gap that reads as "no hours".
 */
export interface Presentation {
  /** Strip `hours` and `openingHours`: closed, or hours past their window. */
  hideHours: boolean;
  /** Why, for the page to say so: `closed` says nothing extra; `stale` says "not recently checked"; `season` says "closed for the season". */
  hoursHidden?: 'closed' | 'stale' | 'season';
  /** Strip `phone`: a closed place's number is not one to ring. */
  hidePhone: boolean;
  /** Out of lists, search and the sitemap; the page itself stays. */
  delist: boolean;
}

export function presentation(data: PlaceLike, variant: TownVariant, now: Date = new Date()): Presentation {
  if (data.status === 'closed') return { hideHours: true, hoursHidden: 'closed', hidePhone: true, delist: true };
  if (data.status === 'temporarily-closed') return { hideHours: true, hoursHidden: 'closed', hidePhone: false, delist: false };
  // Out of season comes before stale: "closed for the season" is the answer a
  // reader needs, and the listing itself is hidden at the mountain window anyway.
  if (!inSeason(data.seasonal, now)) return { hideHours: true, hoursHidden: 'season', hidePhone: false, delist: false };
  if (!hoursFresh(data, variant, now)) return { hideHours: true, hoursHidden: 'stale', hidePhone: false, delist: false };
  return { hideHours: false, hidePhone: false, delist: false };
}

function provenanceExclusion(data: unknown): Exclusion | null {
  if (isExcluded(data)) return { reason: 'invalid', detail: data.issues.join('; ') };
  const entry = data as Provenanced;
  if (!entry.source) return { reason: 'no-source', detail: 'no source: nothing says where this was read' };
  if (!entry.verified) return { reason: 'no-verified', detail: 'no verified date: nothing says when this was checked' };
  return null;
}

/** One line for a log or a report. */
export function describeExclusion(x: Exclusion): string {
  return x.detail;
}
