/**
 * IndexNow: telling Bing (and Yandex, Seznam, Naver, which share what it is
 * told) that a page has changed, so it recrawls that page rather than
 * waiting for its turn. Bing Webmaster Tools recommended it for Berthoud on
 * 5 November 2026; the owner asked for it the same day.
 *
 * The protocol is a key, published as a text file at the root of each host
 * (public/<key>.txt, so every site serves the same one), and a POST naming
 * the changed URLs. The key is public by design: it proves only that whoever
 * sends URLs for a host can also put a file on it.
 *
 * The pure parts live here so the tests can reach them; scripts/indexnow.ts
 * does the fetching and the sending.
 */

/** The key, and the file public/<key>.txt that holds it. Change both together (test/indexnow.test.ts). */
export const INDEXNOW_KEY = 'a80b6307bdc241bd99606a09d7be8ca5';

/** The shared endpoint: one submission reaches every participating engine. */
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** The protocol's limit on one POST. */
export const INDEXNOW_BATCH = 10_000;

/**
 * Pages whose content turns over with the calendar rather than with a file:
 * the home page's Today and This weekend, the events list, the week. Their
 * lastmod is the build's, like /about/'s, but unlike /about/ they really
 * are different after each rebuild.
 */
export const CALENDAR_PATHS: ReadonlySet<string> = new Set(['/', '/events/', '/this-week/', '/this-weekend/']);

/** URL to lastmod, as a sitemap lists them. */
export type Snapshot = Map<string, string>;

/** Every <loc> in a sitemap index, or in a sitemap with the lastmod beside each. */
export function sitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]!);
}

export function sitemapEntries(xml: string): Snapshot {
  const out: Snapshot = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1]!.match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
    if (!loc) continue;
    out.set(loc, m[1]!.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/)?.[1] ?? '');
  }
  return out;
}

/**
 * What to send this run: everything when there is no record of the last
 * one; otherwise each URL that is new, each one that is gone (so the engine
 * comes back and finds it gone), and each one whose date moved, where the
 * date means something.
 *
 * A page that carries its own date (an event, a place, an article, the
 * sports pages: `dated`, from src/lib/lastmod.ts) changed when that date
 * moved. Every other page's lastmod is the build's, which moves twice a day
 * whether the page did or not, so those go only when they are new, or when
 * they are one of the calendar pages that do turn over with each build.
 */
export function urlsToSubmit(previous: Snapshot | undefined, current: Snapshot, dated: (path: string) => boolean): string[] {
  if (!previous) return [...current.keys()];
  const out: string[] = [];
  for (const [url, lastmod] of current) {
    const before = previous.get(url);
    if (before === undefined) out.push(url);
    else if (before !== lastmod) {
      const path = new URL(url).pathname;
      if (dated(path) || CALENDAR_PATHS.has(path)) out.push(url);
    }
  }
  for (const url of previous.keys()) if (!current.has(url)) out.push(url);
  return out;
}

/** The body of one IndexNow POST for one host. */
export function submission(host: string, urls: readonly string[]) {
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: [...urls],
  };
}

/** 200 is "received"; 202 is "received, key not yet checked". Anything else is a refusal. */
export function accepted(status: number): boolean {
  return status === 200 || status === 202;
}
