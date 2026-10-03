/**
 * How long a checked fact stays publishable, in one place.
 *
 * Every window the build, the validator and the weekly report use is here, so
 * tuning one means editing one number and reading one file. The reasoning:
 *
 * - An event is fresh until it ends. Its date is the fact; `verified` says
 *   when the date was last read off the organizer's page.
 * - A listing's hours and phone drift fastest. The October 2026 audit found
 *   hours wrong at five of sixteen Erie businesses within a fortnight of
 *   being checked, so the re-check rotation is thirty days (`recheckDays`,
 *   what the report nags about) and the build's backstop is ninety
 *   (`listingDays`, after which the listing is hidden rather than shown as
 *   current). Mountain towns, where a season closes a road or a kitchen,
 *   get thirty for both.
 * - Hours are hidden before the listing is: a café is still there at day
 *   sixty-one, its Tuesday closing time may not be.
 * - Trail, parking and closure notes (the mountain variant's `access`) are
 *   the most perishable thing on these sites and get the shortest window;
 *   the page links the land manager's live notice rather than restating it.
 *
 * `variant` is the town's: see TownConfig.variant.
 */
import type { TownVariant } from './towns/types.ts';

export const FRESHNESS = {
  /** The rotation: a listing not re-checked in this many days is on the weekly list. */
  recheckDays: 30,
  /** The report's forward look: "going stale in the next N days". */
  reportHorizonDays: 14,
  /** Days from `verified` after which a listing claiming to be open is hidden from the site. */
  listingDays: { 'front-range': 90, mountain: 30 } satisfies Record<TownVariant, number>,
  /** Days from `verified` after which a listing's hours are hidden; the rest of the listing stays. */
  hoursDays: { 'front-range': 60, mountain: 30 } satisfies Record<TownVariant, number>,
  /** Days from `verified` after which trail, parking and closure notes are hidden. */
  accessDays: 30,
} as const;

/** A town's own windows, so callers do not index the tables themselves. */
export function windowsFor(variant: TownVariant) {
  return {
    listingDays: FRESHNESS.listingDays[variant],
    hoursDays: FRESHNESS.hoursDays[variant],
    accessDays: FRESHNESS.accessDays,
    recheckDays: FRESHNESS.recheckDays,
  };
}

/**
 * What a town must have verified and upcoming before its site goes live.
 * Overridable per town with `launchThreshold`; a large town launching with a
 * curated scope sets its own.
 */
export const DEFAULT_LAUNCH_THRESHOLD = { events: 10, listings: 15 } as const;
