/**
 * Every town config, in wave order. `scripts/new-town.ts` appends to this
 * file automatically; keep the marker comments in place.
 */
import type { TownConfig } from './types.ts';
import { niwot } from './niwot.ts';
import { lyons } from './lyons.ts';
import { berthoud } from './berthoud.ts';
import { erie } from './erie.ts';
import { johnstown } from './johnstown.ts';
import { timnath } from './timnath.ts';
import { elizabeth } from './elizabeth.ts';
import { windsor } from './windsor.ts';
import { fortcollins } from './fortcollins.ts';
import { longmont } from './longmont.ts';
import { loveland } from './loveland.ts';
import { carbonValley } from './carbon-valley.ts';
// new-town:imports

export const towns: TownConfig[] = [
  niwot,
  lyons,
  berthoud,
  erie,
  johnstown,
  timnath,
  elizabeth,
  windsor,
  fortcollins,
  longmont,
  loveland,
  carbonValley,
  // new-town:entries
];
