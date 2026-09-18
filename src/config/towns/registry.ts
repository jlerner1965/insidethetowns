/**
 * Every town config, in wave order. `scripts/new-town.ts` appends to this
 * file automatically; keep the marker comments in place.
 */
import type { TownConfig } from './types.ts';
import { niwot } from './niwot.ts';
import { lyons } from './lyons.ts';
// new-town:imports

export const towns: TownConfig[] = [
  niwot,
  lyons,
  // new-town:entries
];
