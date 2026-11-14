/**
 * What a hub page says to a reader who arrives from a closed guide (the
 * review of 14 November 2026): the 18 guides folded into their town's page
 * on the hub send every address there (src/lib/fold.ts), and the page, a
 * different masthead with dates only, gave no word of why. Each redirect
 * now carries `?from=<the old domain>`; the page looks the domain up here
 * and shows one line: the guide has closed, this page keeps its town's
 * annual dates, and the nearest full guide, where one is near.
 *
 * Only a domain listed here is ever named: the query is read, never shown.
 * Pure data work, so it can be unit-tested.
 */

interface Located {
  slug: string;
  name: string;
  siteTitle: string;
  domain: string;
  lat: number;
  lng: number;
}

/** A closed guide's line: its title, its town, and the nearest live guide, where one is within NEAR_KM. */
export interface ClosedGuideNote {
  guide: string;
  town: string;
  nearest?: { name: string; url: string };
}

/** Further than this and no guide is "nearby": Leadville's nearest full guide is two hours away. */
export const NEAR_KM = 60;

/** The great-circle distance in kilometres. */
export function distanceKm(a: Pick<Located, 'lat' | 'lng'>, b: Pick<Located, 'lat' | 'lng'>): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Every closed guide's domain with its line, from the folded configs and the live guides. */
export function closedGuideNotes(folded: readonly Located[], live: readonly Located[]): Record<string, ClosedGuideNote> {
  const out: Record<string, ClosedGuideNote> = {};
  for (const town of folded) {
    const nearest = live
      .map((g) => ({ g, km: distanceKm(town, g) }))
      .filter((x) => x.km <= NEAR_KM)
      .sort((a, b) => a.km - b.km)[0]?.g;
    out[town.domain] = {
      guide: town.siteTitle,
      town: town.name,
      nearest: nearest ? { name: nearest.siteTitle, url: `https://${nearest.domain}/` } : undefined,
    };
  }
  return out;
}
