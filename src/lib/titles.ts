/**
 * Page titles. Pure string work, no config lookup, so it can be unit-tested.
 */

/** Just enough of a site config to title its home page. */
export interface TitleSite {
  siteTitle: string;
  tagline: string;
  seoTagline?: string;
}

/**
 * The <title> for a site's home page.
 *
 * Search results cut a title around 60 characters and several taglines are a
 * full sentence, so the tagline is trimmed at a clause or word boundary rather
 * than the copy being shortened — the tagline is written for the hero, not for
 * the search result.
 *
 * The trim is why this is worth testing rather than eyeballing. It used to cut
 * Erie's tagline at the comma immediately before "Colorado", producing
 * "Inside Erie — An independent guide to Erie" and dropping the one word that
 * says which Erie is meant.
 */
export function homeTitle(site: TitleSite): string {
  const line = site.seoTagline ?? site.tagline;
  const full = `${site.siteTitle} \u2014 ${line}`;
  if (full.length <= 65) return full;
  const room = 65 - site.siteTitle.length - 3;
  let tail = line.slice(0, room);
  const cut = Math.max(tail.lastIndexOf(','), tail.lastIndexOf(';'));
  tail = cut > room * 0.5 ? tail.slice(0, cut) : tail.slice(0, tail.lastIndexOf(' '));
  // A cut that lands on a stop word reads as a sentence chopped in half.
  const stop = /\s+(a|an|the|to|of|and|in|on|for|with|from|at|by|that|its)$/i;
  while (stop.test(tail)) tail = tail.replace(stop, '');
  return `${site.siteTitle} \u2014 ${tail.replace(/[.,;:\s]+$/, '')}`;
}

/**
 * A site title cut for the two-weight wordmark: the town's name, set in the
 * accent, and the rest in a light italic. "Inside Niwot" has the rest before
 * the name; Longmont's "Longmont · Inside the Towns" (a local magazine already
 * publishes as Inside Longmont) has it after. Any other title is all name.
 */
export function wordmarkParts(siteTitle: string): { before?: string; name: string; after?: string } {
  const inside = /^(Inside)\s+(.+)$/.exec(siteTitle);
  if (inside) return { before: inside[1], name: inside[2]! };
  const network = /^(.+?)\s+(·\s+Inside the Towns)$/.exec(siteTitle);
  if (network) return { name: network[1]!, after: network[2] };
  return { name: siteTitle };
}

/** How big the wordmark sets the `after` part, as a share of the name's size. */
export const WORDMARK_AFTER_SCALE = 0.5;

/**
 * Roughly how wide the wordmark is, in em: half an em a character, just over
 * the widest one-line title measured ("Inside Longmont", 0.499). A title
 * with an `after` part is set on two lines, the second at
 * WORDMARK_AFTER_SCALE (on one line, Longmont's pushed the desktop nav off
 * the page), so it is as wide as the longer line.
 */
export function wordmarkEm(siteTitle: string): number {
  const { name, after } = wordmarkParts(siteTitle);
  if (!after) return siteTitle.length * 0.5;
  return Math.max(name.length, after.length * WORDMARK_AFTER_SCALE) * 0.5;
}

/** "[Page] | Inside [Town]", or the home title when there is no page title. */
export function pageTitle(site: TitleSite, title?: string): string {
  return title ? `${title} | ${site.siteTitle}` : homeTitle(site);
}
