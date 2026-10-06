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
import { dayKey, startOfDay } from './dates.ts';

const DAY = 86_400_000;

/** Whole Denver days from `verified` to `now`; negative if `verified` is ahead of today. */
export function ageDays(verified: Date, now: Date = new Date()): number {
  return Math.round((startOfDay(now).getTime() - startOfDay(verified).getTime()) / DAY);
}

type Provenanced = { source?: string; verified?: Date };
/** The part of a `seasonal` block the gate reads; see seasonalSchema. */
export type SeasonLike = { opens?: Date; closes?: Date; closedMonths?: readonly string[] };
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
  if (seasonal.closedMonths && seasonal.closedMonths.length > 0) {
    const month = MONTHS[Number(dayKey(now).slice(5, 7)) - 1]!;
    return !seasonal.closedMonths.some((m) => m.trim().slice(0, 3).toLowerCase() === month);
  }
  return true;
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
