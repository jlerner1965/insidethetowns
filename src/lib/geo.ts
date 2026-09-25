/**
 * Distances between the towns, from the coordinates in their configs.
 *
 * Pure functions, so anything built on "nearby" can be tested against the
 * real configs without a build.
 */
import type { TownConfig } from '../config/towns/types.ts';

type Point = Pick<TownConfig, 'lat' | 'lng'>;

const EARTH_RADIUS_MILES = 3958.8;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in statute miles. */
export function milesBetween(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

export interface Neighbor<T> {
  town: T;
  miles: number;
}

/**
 * The other towns a reader in `town` might drive to for an evening: the
 * nearest few, nearest first, and none beyond `maxMiles`.
 *
 * Twenty-five miles is about where "over the hill" becomes "a trip". Berthoud
 * to Johnstown is eight, Niwot to Erie seven; Timnath reaches only Johnstown
 * and Berthoud; and Elizabeth's nearest guide is fifty-three miles away, so a
 * block built on this shows nothing there rather than suggest an hour each way.
 */
export function nearestTowns<T extends Point & { slug: string }>(
  town: T,
  towns: readonly T[],
  { maxMiles = 25, limit = 3 }: { maxMiles?: number; limit?: number } = {},
): Neighbor<T>[] {
  return towns
    .filter((t) => t.slug !== town.slug)
    .map((t) => ({ town: t, miles: milesBetween(town, t) }))
    .filter((n) => n.miles <= maxMiles)
    .sort((a, b) => a.miles - b.miles)
    .slice(0, limit);
}
