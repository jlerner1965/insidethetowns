/**
 * The primary navigation of a town guide, one rule for every guide (the
 * navigation audit of 22 October 2026: neighbouring guides ran two menus
 * that shared one label, and the sports page was reachable only by a
 * mascot's name). The items follow from what the guide has, so a new school
 * or a new hub reaches the menu without anyone editing a list:
 *
 *   This week · Events · <Mascot> sports · Eat & drink · <hub> · <living>
 *
 * - "<Mascot> sports" only where the guide follows a school
 *   (src/config/school-sports.ts); "High school sports" where it follows
 *   several; a school's `navLabel` where the mascot alone would not say
 *   whose team it is (Carbon Valley's Golden Eagles are Frederick High's).
 * - The hub: Families where the guide has the family hub, else Things to do.
 * - Living here where the guide has that page, else Moving here.
 *
 * Every other section (This weekend, Guides, the directory, Get involved,
 * Updates, and whichever of the pairs above is not in the menu) is in the
 * footer on every page, and the ones a resident asks for by name are under
 * "More" in the header (moreNav). The flagship home page has no menu of its
 * own any more (the 26 October 2026 audit: its "Town" went to Things to do
 * and its mascot-only label changed name inside the site); docs/DESIGN.md. Sentence case throughout; the classic masthead sets
 * the row in small capitals with CSS, so the words are the same everywhere.
 */
import { schoolsFor } from '../config/school-sports.ts';
import type { NavItem, SiteConfig, TownConfig } from '../config/towns/types.ts';

/** The menu's word for the sports page, or nothing where the guide follows no school. */
export function sportsNavLabel(town: string): string | undefined {
  const schools = schoolsFor(town);
  if (schools.length === 0) return undefined;
  if (schools.length > 1) return 'High school sports';
  const [school] = schools;
  return school!.navLabel ?? `${school!.mascot} sports`;
}

export function townNav(town: Pick<TownConfig, 'slug' | 'families' | 'livingHere'>): NavItem[] {
  const sports = sportsNavLabel(town.slug);
  return [
    { label: 'This week', href: '/this-week/' },
    { label: 'Events', href: '/events/' },
    ...(sports ? [{ label: sports, href: '/sports/' }] : []),
    { label: 'Eat & drink', href: '/eat-drink/' },
    town.families ? { label: 'Families', href: '/families/' } : { label: 'Things to do', href: '/things-to-do/' },
    town.livingHere ? { label: 'Living here', href: '/living-here/' } : { label: 'Moving here', href: '/moving-here/' },
  ];
}

/**
 * The flagship guides' second tier (the 26 October 2026 audit, priority 6):
 * the sections the six-item menu leaves out but a resident looks for by
 * name, Things to do and Get involved first, each under its own label. In
 * the row they sit behind "More", with the nearby guides; in the phone
 * panel they are listed open under the six. The footer still names them.
 */
export function moreNav(town: Pick<TownConfig, 'slug' | 'families' | 'livingHere' | 'participation'>, opts: { updates?: boolean } = {}): NavItem[] {
  const inMenu = new Set(townNav(town).map((n) => n.href));
  return [
    { label: 'Things to do', href: '/things-to-do/' },
    ...(town.participation ? [{ label: 'Get involved', href: '/get-involved/' }] : []),
    { label: 'This weekend', href: '/this-weekend/' },
    ...(opts.updates ? [{ label: 'Local changes', href: '/updates/' }] : []),
  ].filter((n) => !inMenu.has(n.href));
}

/** The site's menu: the rule above on a guide, the hub's own list on the hub. */
export function siteNav(site: SiteConfig): NavItem[] {
  return site.kind === 'hub' ? site.nav : townNav(site);
}
