/**
 * Every town config, in wave order. `scripts/new-town.ts` appends to this
 * file automatically; keep the marker comments in place.
 */
import type { TownConfig } from './types';
import { niwot } from './niwot';
// new-town:imports

export const towns: TownConfig[] = [
  niwot,
  // new-town:entries
];
