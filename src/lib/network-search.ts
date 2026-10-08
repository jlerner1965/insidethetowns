/**
 * The hub's search, across every guide.
 *
 * Each guide's /search/ indexes that guide's own built pages. The hub's did
 * the same, so a search on insidethetowns.com for "Niwot Tavern" found six
 * hub pages that mention Niwot and not the tavern (audit, 7 October 2026):
 * the network's front door could not find anything in the network.
 *
 * The towns are separate deployments, so the hub cannot read their indexes
 * at build time, and merging eighteen remote indexes in the browser would
 * need CORS on every guide and eighteen fetches before the first result. But
 * all the towns live in this repository, and the hub already reads their
 * content through the same gate their own pages use (getNetworkEntries). So
 * the hub build writes one record per searchable town page, each with its
 * absolute URL on the town's domain, and the indexing step
 * (scripts/lib/search-index.ts) adds them to the hub's own Pagefind index as
 * pages. One index, one origin, nothing to keep in step.
 *
 * A record is a small HTML page rather than Pagefind's plain-text custom
 * record because a page gets Pagefind's heading weights: the name in the h1
 * is what lets "Niwot Tavern" put the tavern above a hub page that happens to
 * say "Niwot" and "tavern" somewhere in a long list.
 *
 * Pure string work, no content collections, so it can be unit-tested; the
 * route that gathers the entries is src/routes/hub/network-search.json.ts.
 */

/** What a result is, as the town's own search labels it (Base.astro `kind`), plus the guide itself and its Moving Here page. */
export type NetworkKind = 'Town' | 'Moving here' | 'Place' | 'Guide' | 'Event';

export interface NetworkRecord {
  /** Absolute, on the town's own domain: "https://insideniwot.com/places/niwot-tavern/". */
  url: string;
  kind: NetworkKind;
  title: string;
  /** The town's display name: "Niwot". */
  town: string;
  /** "insideniwot.com", shown under the title so a reader knows the link leaves the hub. */
  domain: string;
  /** One short line under the title: a place's type and street, an event's day and venue. */
  lead?: string;
  /** Plain text, escaped here. Ignored when `html` is given. */
  text?: string;
  /** The entry's own rendered HTML, from our own content; trusted and not escaped. */
  html?: string;
}

/** The file the hub build writes into dist/ for the indexing step, which reads and deletes it. */
export const NETWORK_SEARCH_FILE = 'network-search.json';

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ENTITIES[c]!);
}

/**
 * One meta value per element: Pagefind read `kind:Place, town:Niwot` on one
 * attribute as a single `kind` of "Place, town:Niwot". Empty elements, so the
 * values are not indexed as words on every record.
 */
function meta(key: string, value: string): string {
  return `<span data-pagefind-meta="${key}:${escapeHtml(value)}"></span>`;
}

/**
 * The page Pagefind indexes for one record. The h1 is the result's title;
 * `kind`, `town` and `domain` ride as meta for the result list; the
 * `data-pagefind-body` is required because every real page on the site marks
 * one, and Pagefind then ignores any page that does not.
 */
export function recordHtml(record: NetworkRecord): string {
  const lead = record.lead ? `<p>${escapeHtml(record.lead)}</p>` : '';
  const body = record.html ?? (record.text ? `<p>${escapeHtml(record.text)}</p>` : '');
  return (
    `<!doctype html><html lang="en"><head><title>${escapeHtml(record.title)}</title></head><body>` +
    `<main data-pagefind-body>${meta('kind', record.kind)}${meta('town', record.town)}${meta('domain', record.domain)}` +
    `<h1>${escapeHtml(record.title)}</h1>${lead}${body}` +
    `</main></body></html>`
  );
}

/**
 * Markdown to the words in it, for an entry whose rendered HTML is not to
 * hand. Links keep their text, images and markup go; it only has to be good
 * enough to search, never to show.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`|~]+/g, ' ')
    .replace(/^\s*:?-{3,}:?(\s+:?-{3,}:?)*\s*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
