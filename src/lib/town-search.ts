/**
 * Exact town-name searches (the audit of 13 November 2026: "Niwot" on the
 * hub listed eight businesses with Niwot in their names before the guide
 * to Niwot itself). Pagefind ranks words, not places, and a business named
 * for its town matches the town's name better than the guide does. So the
 * search page asks this first: is the whole query the name of a town, one
 * of its other names, or a region? If it is, the town's own destinations
 * lead, with their shortcuts, and Pagefind's results follow.
 *
 * Pure and small, no imports: it runs in the browser on the search page,
 * against the index the page carries (src/lib/town-search-index.ts builds
 * it at build time from the configs, so nothing here names a town).
 */

/** One place a town's name can send a reader: its community guide, or its page of annual dates on the hub. */
export interface TownDestination {
  /** The town as a reader names it: "Niwot", "Carbon Valley", "Estes Park". */
  name: string;
  /** The destination's own title: "Inside Niwot", or the town's name for a page of dates. */
  title: string;
  kind: 'guide' | 'annual';
  url: string;
  /** One line on what the destination holds, in its own words. */
  description: string;
  /** The destination's main sections, each a link. */
  shortcuts: Array<{ label: string; href: string }>;
  /** The names that lead here, normalized (normalizeTownQuery): the name, the title, other towns it covers. */
  terms: string[];
  /** Other towns a guide covers, by name: "Frederick, Firestone and Dacono". */
  covers?: string;
}

/** A region or a county: the towns in it, each a link. */
export interface TownRegion {
  name: string;
  terms: string[];
  towns: Array<{ name: string; url: string; kind: 'guide' | 'annual' }>;
}

export interface TownSearchIndex {
  towns: TownDestination[];
  regions: TownRegion[];
}

/** What each kind is called, for a reader: no publishing vocabulary. */
export const DESTINATION_LABELS: Record<TownDestination['kind'], string> = {
  guide: 'Community guide',
  annual: 'Annual events and seasonal dates',
};

/**
 * A query or a name reduced to what a reader means by it: case, accents,
 * punctuation and "&" set aside; "Inside" in front and "CO" or "Colorado"
 * after taken off; "Ft" and "Mt" read as "Fort" and "Mount".
 */
export function normalizeTownQuery(text: string): string {
  let s = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’'`.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  s = s.replace(/^(inside|the town of|town of|city of)\s+/, '');
  s = s.replace(/\s+(co|colorado)$/, '');
  s = s.replace(/\bft\b/g, 'fort').replace(/\bmt\b/g, 'mount');
  return s.replace(/\s+/g, ' ').trim();
}

/** The destinations and the region a query names exactly; nothing for a partial or a looser match, which Pagefind answers. */
export function matchTown(query: string, index: TownSearchIndex): { towns: TownDestination[]; region?: TownRegion } {
  const q = normalizeTownQuery(query);
  if (!q) return { towns: [] };
  // A guide before a page of dates for the same name (Severance: Windsor's guide covers it, and it has a page of its own).
  const towns = index.towns.filter((t) => t.terms.includes(q)).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'guide' ? -1 : 1));
  const region = towns.length === 0 ? index.regions.find((r) => r.terms.includes(q)) : undefined;
  return { towns, region };
}
