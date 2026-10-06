/**
 * The hub's "The towns", grouped. Pure, so the rule is tested rather than
 * trusted to a template: one group per region in TOWN_REGIONS order, the
 * towns A to Z within each, and a region with no live town is not drawn at
 * all. Nothing here names a town or counts one; the region field on each
 * config decides (the owner's rule, 6 October 2026).
 */
import { TOWN_REGIONS, type TownRegion } from '../config/towns/types.ts';

export interface RegionGroup<T> {
  region: TownRegion;
  towns: T[];
}

export function groupByRegion<T extends { name: string; region: TownRegion }>(live: readonly T[]): RegionGroup<T>[] {
  const atoz = [...live].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return TOWN_REGIONS.map((region) => ({ region, towns: atoz.filter((t) => t.region === region) })).filter((g) => g.towns.length > 0);
}
