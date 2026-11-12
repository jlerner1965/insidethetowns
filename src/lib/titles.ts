/**
 * Page titles. Pure string work, no config lookup, so it can be unit-tested.
 */
import { monthDay, TIME_ZONE } from './dates.ts';

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

/**
 * The longest a <title> is let run. Search results cut at about 60
 * characters, and a page's own words come before the guide's name: a title
 * that fits with " | Inside [Town]" keeps it, one that does not stands
 * alone (the sports pages' rule since 21 October 2026, SPORTS_TITLE_LIMIT,
 * applied everywhere on 27 October: 163 of 531 event titles and 31 of 259
 * place titles ran past 70 with the suffix). The guide's name is still in
 * og:site_name and the wordmark.
 */
export const TITLE_LIMIT = 70;

/** "[Page] | Inside [Town]" where that fits in TITLE_LIMIT, else "[Page]". */
export function fitTitle(title: string, siteTitle: string): string {
  const full = `${title} | ${siteTitle}`;
  return full.length <= TITLE_LIMIT ? full : title;
}

/**
 * "Oct 13" for a title tag, with the year only when it is not this year
 * (a title is read on the day; "October 13, 2026" cost ten characters that
 * pushed most event titles past the limit).
 */
export function titleDate(date: Date, now = new Date()): string {
  const { month, day } = monthDay(date);
  const year = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric' }).format(date);
  const thisYear = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric' }).format(now);
  return year === thisYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
}

/** "[Page] | Inside [Town]" (or "[Page]" when that runs long), or the home title when there is no page title. */
export function pageTitle(site: TitleSite, title?: string): string {
  return title ? fitTitle(title, site.siteTitle) : homeTitle(site);
}

/**
 * What a place page shows, for a title that claims only what is there
 * (the Berthoud owner's brief, 6 November 2026: "show the answer in search
 * results"). `hours` is whether the page prints the hours, not whether
 * the listing has them: hidden for age or season, they are not promised.
 */
export interface PlacePageFacts {
  type: string;
  hours: boolean;
  menu: boolean;
  /** A weekly pool schedule on the page (src/lib/rec-center.ts). */
  poolSchedule: boolean;
  /** Sourced day-pass prices on the page. */
  dayPassPrices: boolean;
  /** The listing's tags, in the editor's order: a park's top amenities. */
  amenities: readonly string[];
}

/** "ball fields" → "Ball Fields"; "no-dogs" → "No Dogs"; "of" and "and" stay small after the first word. */
export function amenityLabel(tag: string): string {
  const small = new Set(['and', 'of', 'the', 'for', 'to', 'in', 'on', 'at']);
  return tag
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** "Hours", "Hours & Pool Schedule", "Hours, Pool Schedule & Day Pass Prices". */
function ampersandList(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`;
}

/**
 * The <title> of a place page, before the site title is appended: what the
 * place is and where. "Hall Ranch | Inside Lyons" told a search result
 * nothing about which Hall Ranch or what kind of place it is; "Hall Ranch —
 * Trail in Lyons, CO" does, and is what someone typing "trails in Lyons"
 * is shown (search-visibility phase 1, 15 October 2026). A place whose
 * name already carries the town's ("Niwot Market") is not told twice where
 * it is. The h1 on the page stays the bare name.
 *
 * With `facts`, the title says what the page answers (6 November 2026),
 * and only that:
 * - a venue with its hours shown: "{Name} Hours", then ", Pool Schedule"
 *   where the page has the weekly pool schedule and " & Day Pass Prices"
 *   where it has sourced prices;
 * - a restaurant or a coffee house: "{Name}: Menu & Hours" with a menu
 *   link and the hours, "{Name}: Hours & Location" with the hours alone,
 *   "{Name}: Menu & Location" with the menu alone;
 * - a park: "{Name}: {two or three of its tags}", "Bein Park: Soccer
 *   Fields, Playground & Dog Park", from the listing's tags in the
 *   editor's order.
 * Any other type, a venue whose hours are hidden, a park with one tag, or
 * a title that would run past TITLE_LIMIT even cut back, keeps the kind-
 * and-town form. The guide's name is still added where it fits (fitTitle).
 */
/** Whether a place's name already carries the town's ("Niwot Market"), as a whole word: "Goldenrod" is not Golden. */
export function namesTown(name: string, town: string): boolean {
  return new RegExp(`\\b${town.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(name);
}

export function placeTitle(name: string, kind: string, town: { name: string; state: string; siteTitle?: string }, facts?: PlacePageFacts): string {
  const named = namesTown(name, town.name);
  const plain = named ? `${name} — ${kind}` : `${name} — ${kind} in ${town.name}, ${town.state}`;
  if (!facts) return plain;
  const fits = (t: string) => t.length <= TITLE_LIMIT;
  /*
   * A title names its town somewhere: in the place's own name, or in the
   * guide's name after it. A fact title too long for " | Inside [Town]"
   * stood alone with neither, on 56 of 781 live place pages (the sweep of
   * 10 November 2026: "Rolland Moore Park: Tennis, Racquetball & Ball
   * Fields", "Penelope's World Famous Burgers & Fries: Hours & Location",
   * and the Smokin' Dave's of three towns told apart by nothing). Where
   * the guide's name will not fit after it (fitTitle, with `siteTitle`
   * given), the town goes after the name instead: "Rolland Moore Park,
   * Fort Collins: Tennis, Racquetball & Ball Fields". Without `siteTitle`
   * the title is as it was.
   */
  // The guide's name stands for the town only where it carries it: a
  // Severance listing on Inside Windsor is not placed by "| Inside Windsor".
  const standsAlone = (t: string) => !named && !!town.siteTitle && !(namesTown(town.siteTitle, town.name) && fitTitle(t, town.siteTitle) !== t);
  const placed = (t: string, withTown: string): string | undefined => {
    if (!fits(t)) return undefined;
    if (!standsAlone(t)) return t;
    return fits(withTown) ? withTown : undefined;
  };
  if (facts.type === 'venue' && facts.hours) {
    const parts = ['Hours', ...(facts.poolSchedule ? ['Pool Schedule'] : []), ...(facts.dayPassPrices ? ['Day Pass Prices'] : [])];
    // Over the limit, the last claim gives way first: the hours are the title's point.
    for (let n = parts.length; n >= 1; n--) {
      const list = ampersandList(parts.slice(0, n));
      const title = placed(`${name} ${list}`, `${name}, ${town.name}: ${list}`);
      if (title) return title;
    }
    return plain;
  }
  if (facts.type === 'restaurant' || facts.type === 'coffee') {
    const tail = facts.menu && facts.hours ? 'Menu & Hours' : facts.hours ? 'Hours & Location' : facts.menu ? 'Menu & Location' : undefined;
    if (!tail) return plain;
    return placed(`${name}: ${tail}`, `${name}, ${town.name}: ${tail}`) ?? plain;
  }
  if (facts.type === 'park') {
    const labels = facts.amenities.map(amenityLabel).filter(Boolean);
    for (const n of [3, 2]) {
      if (labels.length < n) continue;
      const list = ampersandList(labels.slice(0, n));
      const title = placed(`${name}: ${list}`, `${name}, ${town.name}: ${list}`);
      if (title) return title;
    }
    return plain;
  }
  return plain;
}

/**
 * The <title> of an annual event's permanent page: the year beside the
 * name, where people type it ("niwot trot 2026", "boo on briggs 2026"),
 * then the day. "Olde Golden Holiday Parade 2026 — Sat, Dec 12"; once the
 * year's edition is over and no later listing exists, "Niwot Trot 5K —
 * held Oct 4, 2026; 2027 date to come". The town is added where the title
 * does not already name it, and a year already in the title is not said
 * twice (the owner's brief, 11 November 2026: date and year in the title
 * tag of every date-bound page).
 */
export function annualEventTitle(title: string, town: string, date: Date, awaiting: boolean): string {
  const year = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric' }).format(date);
  const { month, day, weekday } = monthDay(date);
  const where = title.toLowerCase().includes(town.toLowerCase()) ? '' : ` in ${town}`;
  if (awaiting) return `${title}${where} \u2014 held ${month} ${day}, ${year}; ${Number(year) + 1} date to come`;
  const named = title.includes(year) ? title : `${title} ${year}`;
  return `${named}${where} \u2014 ${weekday}, ${month} ${day}`;
}
