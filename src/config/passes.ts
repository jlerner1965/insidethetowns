/**
 * The mountain passes and named routes between the network's towns (the
 * additions of 12 November 2026), for "Near this town"
 * (src/lib/near.ts). One list for every page.
 *
 * Each row: the highway, the two towns it connects (the nearest town with
 * a page on each side), its usual seasonal closure where the agency that
 * keeps the road says it has one, in the agency's words, and the road's
 * page on COtrip, the Colorado Department of Transportation's traveler
 * site. A pass kept open all winter has no `seasonalClosure`; nothing here
 * says a road is open today, which is what the COtrip link is for.
 *
 * Read on the agency's own pages on the day in `checked`; the rows are in
 * data/hub/passes.json so a re-read is a data change and not a code one.
 */
import data from '../../data/hub/passes.json' with { type: 'json' };

export interface Pass {
  slug: string;
  name: string;
  /** "CO 82", "US 550", "Chaffee County Road 306". */
  highway?: string;
  elevationFt?: number;
  /** The two places it connects, by slug (src/lib/hub-towns.ts, placeKey). */
  connects: [string, string];
  /** Other places for which it is the way across. */
  alsoServes?: string[];
  seasonalClosure?: string;
  closureSource?: string;
  /** The road's status on COtrip, or CDOT's own page for it. */
  statusUrl?: string;
  statusLabel?: string;
  source: string;
  checked: string;
}

export const PASSES_NOTE: string | undefined = (data as unknown as { cotripNote?: string }).cotripNote;
export const PASSES: readonly Pass[] = (data as unknown as { passes: Pass[] }).passes;
