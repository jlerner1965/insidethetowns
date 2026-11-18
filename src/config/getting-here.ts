/**
 * The year-round routes and the other airports for "Getting here" (the
 * owner's navigation brief of 18 November 2026, item 7), as
 * scripts/getting-here.ts wrote them: Denver International's miles and
 * time from every town whose nearest airport is another, and each drive a
 * town page prints that crosses a pass closed in winter, with the
 * year-round route. src/lib/getting-here.ts reads it; one file for every
 * page, as data/hub/passes.json is.
 */
import data from '../../data/hub/getting-here.json' with { type: 'json' };
import type { GettingHere } from '../lib/getting-here.ts';

export const GETTING_HERE: GettingHere = data as unknown as GettingHere;
