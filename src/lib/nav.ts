/**
 * The primary navigation of a town guide, one rule for every guide (the
 * navigation audit of 22 October 2026: neighbouring guides ran two menus
 * that shared one label, and the sports page was reachable only by a
 * mascot's name). The items follow from what the guide has, so a new school
 * or a new hub reaches the menu without anyone editing a list:
 *
 *   This week · Things to do · Athletics · Eat & drink · Shops · <hub> · <living> · Guides
 *
 * - Things to do took the second slot from Events on 6 November 2026 (the
 *   owner's brief: parks, the rec center and the trails are what Search
 *   Console says people come for, and the events are a click away on the
 *   home page, This week and the footer). Every guide has the page
 *   (src/integrations/town-routes.ts); where the hub slot would repeat it,
 *   a guide without the family hub, Events keeps that slot instead.
 *
 * - "Athletics" only where the guide follows a school (the owner, 6
 *   November 2026: one word in the menu, the same on every guide; it was
 *   "<School> athletics" that day and "<Mascot> sports" before, and the
 *   school's name still heads the strip, the band and the share image,
 *   src/config/school-sports.ts schoolAthletics), whether it follows one
 *   school or several ("High school sports" on Windsor's until 13 November
 *   2026); a school's `navLabel` where it would not do.
 * - "Shops" only where the guide lists MIN_SHOPS_FOR_MENU open shops or
 *   more (the owner, 7 November 2026, after reading niwot.com, whose menu
 *   leads with shopping: Niwot's downtown is its shops, and /shops/ was
 *   built but linked from neither the menu nor the footer). Counted from
 *   the markdown, as the route that builds /shops/ counts them
 *   (src/lib/raw-places.ts), so a guide gains the item when its tenth shop
 *   is listed and loses it when a closure takes it under. Ten, not the
 *   type page's three: a menu item has to be worth a visit from every page.
 * - The hub: Families where the guide has the family hub, else Events (Things to do already being in the menu).
 * - Living here where the guide has that page, else Moving here.
 *
 * - Guides, the articles (the dog rules, the county line, the fire
 *   districts), since 1 November 2026: the reader pass found the guide's best
 *   writing two clicks down, reached from a tile or the footer, and a visitor
 *   who left from the first screen never learned it was there.
 *
 * Every other section (the full events calendar, This weekend, Every year,
 * Athletics, the directory, Get involved, Updates, and whichever of the
 * pairs above is not in the menu) is in the footer on every page
 * (src/components/Footer.astro; the calendar, Every year and Athletics since
 * the review of 14 November 2026). Sentence case throughout, in the row and in the
 * phone panel alike (design pass, 26 October 2026: the row was set in small
 * capitals, and the flagship home page ran a second menu of its own).
 */
import { schoolsFor } from '../config/school-sports.ts';
import { openPlaceTypeCounts } from './raw-places.ts';
import { seasonTypesWithRecords } from './tradition-files.ts';
import { hasArticles } from './curiosity-files.ts';
import { ARTICLES_INDEX_PATH } from './curiosity.ts';
import { TRADITION_TYPE_INFO } from './traditions.ts';
import type { NavItem, SiteConfig, TownConfig } from '../config/towns/types.ts';

/** The menu's word for the sports page, or nothing where the guide follows no school. */
export function sportsNavLabel(town: string): string | undefined {
  const schools = schoolsFor(town);
  if (schools.length === 0) return undefined;
  // One word on every guide, whether it follows one school or two (the
  // owner, 13 November 2026: Windsor's "High school sports" was the odd one).
  if (schools.length > 1) return 'Athletics';
  const [school] = schools;
  return school!.navLabel ?? 'Athletics';
}

/** How many open shops a guide lists before Shops has a place in its menu. */
export const MIN_SHOPS_FOR_MENU = 10;

export function townNav(
  town: Pick<TownConfig, 'slug' | 'families' | 'livingHere' | 'lead'>,
  counts: Partial<Record<string, number>> = openPlaceTypeCounts(town.slug),
): NavItem[] {
  // An outdoors-led guide (Lyons) has no sports in its menu; the pages stay.
  const sports = town.lead === 'outdoors' ? undefined : sportsNavLabel(town.slug);
  // A quiet guide (Niwot) has no events: Updates stands where This week
  // does, and the hub slot never falls back to Events.
  const quiet = town.lead === 'updates';
  const shops = (counts.shop ?? 0) >= MIN_SHOPS_FOR_MENU;
  return [
    quiet ? { label: 'Updates', href: '/updates/' } : { label: 'This week', href: '/this-week/' },
    { label: 'Things to do', href: '/things-to-do/' },
    ...(sports ? [{ label: sports, href: '/sports/' }] : []),
    { label: 'Eat & drink', href: '/eat-drink/' },
    ...(shops ? [{ label: 'Shops', href: '/shops/' }] : []),
    ...(town.families ? [{ label: 'Families', href: '/families/' }] : quiet ? [] : [{ label: 'Events', href: '/events/' }]),
    town.livingHere ? { label: 'Living here', href: '/living-here/' } : { label: 'Moving here', href: '/moving-here/' },
    { label: 'Guides', href: '/guides/' },
  ];
}

/** The site's menu: the rule above on a guide, the hub's own list on the hub. */
export function siteNav(site: SiteConfig): NavItem[] {
  return site.kind === 'hub' ? hubNav(site.nav) : townNav(site);
}

/** The season pages that are built, as links: every type with a season and a record for it. */
export function seasonLinks(root = '.'): NavItem[] {
  return seasonTypesWithRecords(root).map((t) => ({ label: TRADITION_TYPE_INFO[t].plural, href: TRADITION_TYPE_INFO[t].path }));
}

/** Where every annual-events page is listed: the section of /towns/ that names them all. */
/** Every round-up of annual dates with what is next (src/routes/hub/annual-events.astro; until 13 November 2026, a heading on /towns/). */
export const ANNUAL_EVENTS_HREF = '/annual-events/';

/**
 * The hub's menu: its own list, with "Annual events" first, the home
 * page's word for the season pages (13 November 2026; it was "Seasonal
 * dates", to the first season page; first since the desktop boards of 14
 * November 2026, after the weekend before). It goes to the list of every
 * season page, /annual-events/. No season page, no entry.
 *
 * And "Articles" after Towns, to the index of every article on the site
 * (/articles/, src/lib/curiosity.ts), so a news story or an event brief is
 * one click from any page (the owner, 13 November 2026). No article on the
 * site, no entry.
 */
export function hubNav(nav: readonly NavItem[], seasons: readonly NavItem[] = seasonLinks(), articles: boolean = hasArticles()): NavItem[] {
  const items = [...nav];
  if (seasons[0]) items.unshift({ label: 'Annual events', href: ANNUAL_EVENTS_HREF });
  if (articles) {
    const towns = items.findIndex((n) => n.href === '/towns/');
    items.splice(towns === -1 ? items.length : towns + 1, 0, { label: 'Articles', href: ARTICLES_INDEX_PATH });
  }
  return items;
}
