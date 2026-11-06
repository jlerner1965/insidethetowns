/**
 * The primary navigation of a town guide, one rule for every guide (the
 * navigation audit of 22 October 2026: neighbouring guides ran two menus
 * that shared one label, and the sports page was reachable only by a
 * mascot's name). The items follow from what the guide has, so a new school
 * or a new hub reaches the menu without anyone editing a list:
 *
 *   This week · Things to do · <School> athletics · Eat & drink · <hub> · <living> · Guides
 *
 * - Things to do took the second slot from Events on 6 November 2026 (the
 *   owner's brief: parks, the rec center and the trails are what Search
 *   Console says people come for, and the events are a click away on the
 *   home page, This week and the footer). Every guide has the page
 *   (src/integrations/town-routes.ts); where the hub slot would repeat it,
 *   a guide without the family hub, Events keeps that slot instead.
 *
 * - "<School> athletics" only where the guide follows a school
 *   (src/config/school-sports.ts, schoolAthletics: "Niwot athletics",
 *   "Roosevelt athletics", the school's name rather than the mascot's since
 *   6 November 2026); "High school sports" where it follows several; a
 *   school's `navLabel` where neither would do.
 * - The hub: Families where the guide has the family hub, else Events (Things to do already being in the menu).
 * - Living here where the guide has that page, else Moving here.
 *
 * - Guides, the articles (the dog rules, the county line, the fire
 *   districts), since 1 November 2026: the reader pass found the guide's best
 *   writing two clicks down, reached from a tile or the footer, and a visitor
 *   who left from the first screen never learned it was there.
 *
 * Every other section (This weekend, the directory, Get involved, Updates,
 * and whichever of the pairs above is not in the menu) is in the footer on
 * every page. Sentence case throughout, in the row and in the
 * phone panel alike (design pass, 26 October 2026: the row was set in small
 * capitals, and the flagship home page ran a second menu of its own).
 */
import { schoolAthletics, schoolsFor } from '../config/school-sports.ts';
import type { NavItem, SiteConfig, TownConfig } from '../config/towns/types.ts';

/** The menu's word for the sports page, or nothing where the guide follows no school. */
export function sportsNavLabel(town: string): string | undefined {
  const schools = schoolsFor(town);
  if (schools.length === 0) return undefined;
  if (schools.length > 1) return 'High school sports';
  const [school] = schools;
  return school!.navLabel ?? schoolAthletics(school!);
}

export function townNav(town: Pick<TownConfig, 'slug' | 'families' | 'livingHere'>): NavItem[] {
  const sports = sportsNavLabel(town.slug);
  return [
    { label: 'This week', href: '/this-week/' },
    { label: 'Things to do', href: '/things-to-do/' },
    ...(sports ? [{ label: sports, href: '/sports/' }] : []),
    { label: 'Eat & drink', href: '/eat-drink/' },
    town.families ? { label: 'Families', href: '/families/' } : { label: 'Events', href: '/events/' },
    town.livingHere ? { label: 'Living here', href: '/living-here/' } : { label: 'Moving here', href: '/moving-here/' },
    { label: 'Guides', href: '/guides/' },
  ];
}

/** The site's menu: the rule above on a guide, the hub's own list on the hub. */
export function siteNav(site: SiteConfig): NavItem[] {
  return site.kind === 'hub' ? site.nav : townNav(site);
}
