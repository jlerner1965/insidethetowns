/**
 * One page per kind of place: /restaurants/, /trails/, /parks/.
 *
 * "Golden breweries", "Lyons restaurants", "Niwot coffee" and "Estes Park
 * trailheads" are the queries a town guide exists for, and until 20 October
 * 2026 every one of them landed on /eat-drink/ or /things-to-do/, a page
 * titled for a broader thing and listing four kinds at once. A page whose
 * title, heading and list are one kind in one town is what that searcher is
 * shown, and what the rest of the guide can link by name.
 *
 * Pure: the integration decides which pages to build from the markdown on
 * disk (src/lib/raw-places.ts), the page from the parsed entries, and the
 * directory headings link only to pages that exist. All three read this.
 */
import { EAT_DRINK_TYPES, PLACE_TYPES, THINGS_TO_DO_TYPES, type PlaceType } from '../content/schemas.ts';

/**
 * Fewer than this of a kind and the kind gets no page: a page listing two
 * bars is a thin page, and the two are already on /eat-drink/.
 */
export const MIN_PLACES_FOR_TYPE_PAGE = 3;

export interface PlaceTypePage {
  /** Site-relative, with the trailing slash every route on the sites has. */
  path: string;
  /** The h1: the kind, as the directory headings name it. */
  heading: string;
  /** The <title> before the site title, for "[kind] in [Town], CO". */
  title: (town: { name: string; state: string }) => string;
  /** The section the kind belongs to, for the breadcrumb and the way back. */
  parent: { name: string; path: string };
  /** One line about what the list is, for the intro and the snippet. */
  describe: (town: { name: string; state: string }, count: number) => string;
}

const EAT_DRINK = { name: 'Eat & Drink', path: '/eat-drink/' };
const THINGS_TO_DO = { name: 'Things to Do', path: '/things-to-do/' };
const DIRECTORY = { name: 'Directory', path: '/directory/' };

const where = (town: { name: string; state: string }) => `${town.name}, ${town.state}`;

export const PLACE_TYPE_PAGES: Record<PlaceType, PlaceTypePage> = {
  restaurant: {
    path: '/restaurants/',
    heading: 'Restaurants',
    title: (t) => `Restaurants in ${where(t)}`,
    parent: EAT_DRINK,
    describe: (t, n) => `${n} restaurants in ${where(t)}, each with its address, hours and what it is known for. Listings are editorial; nobody pays to be here.`,
  },
  bar: {
    path: '/bars-breweries/',
    heading: 'Bars & breweries',
    title: (t) => `Bars & breweries in ${where(t)}`,
    parent: EAT_DRINK,
    describe: (t, n) => `${n} bars, breweries and taprooms in ${where(t)}, with addresses, hours and what each one pours. Listings are editorial; nobody pays to be here.`,
  },
  coffee: {
    path: '/coffee/',
    heading: 'Coffee & sweets',
    title: (t) => `Coffee shops & sweets in ${where(t)}`,
    parent: EAT_DRINK,
    describe: (t, n) => `${n} coffee shops, bakeries and sweet spots in ${where(t)}, with addresses and hours. Listings are editorial; nobody pays to be here.`,
  },
  shop: {
    path: '/shops/',
    heading: 'Shops',
    title: (t) => `Shops in ${where(t)}`,
    parent: EAT_DRINK,
    describe: (t, n) => `${n} shops and stores in ${where(t)}: what each one sells, where it is and when it is open. Listings are editorial; nobody pays to be here.`,
  },
  trail: {
    path: '/trails/',
    heading: 'Trails',
    title: (t) => `Trails in ${where(t)}`,
    parent: THINGS_TO_DO,
    describe: (t, n) => `${n} trails in and around ${where(t)}: where each one starts, what it is like and who looks after it.`,
  },
  trailhead: {
    path: '/trailheads/',
    heading: 'Trailheads',
    title: (t) => `Trailheads in ${where(t)}`,
    parent: THINGS_TO_DO,
    describe: (t, n) => `${n} trailheads in and around ${where(t)}: where to park, what starts there and who manages the land.`,
  },
  park: {
    path: '/parks/',
    heading: 'Parks & open space',
    title: (t) => `Parks & open space in ${where(t)}`,
    parent: THINGS_TO_DO,
    describe: (t, n) => `${n} parks and open spaces in and around ${where(t)}: what is there, where it is and who looks after it.`,
  },
  venue: {
    path: '/venues/',
    heading: 'Venues',
    title: (t) => `Venues in ${where(t)}`,
    parent: THINGS_TO_DO,
    describe: (t, n) => `${n} venues in ${where(t)}: the halls, stages, galleries and rooms where the town's events happen, with addresses and hours.`,
  },
  lodging: {
    path: '/stay/',
    heading: 'Places to stay',
    title: (t) => `Places to stay in ${where(t)}`,
    parent: THINGS_TO_DO,
    describe: (t, n) => `${n} places to stay in ${where(t)}: inns, cabins, campgrounds and hotels, each with its address and its own site. Listings are editorial; nobody pays to be here.`,
  },
  service: {
    path: '/services/',
    heading: 'Services',
    title: (t) => `Services in ${where(t)}`,
    parent: DIRECTORY,
    describe: (t, n) => `${n} services in ${where(t)}: the post office, the clinic, the hardware store and the rest, with addresses and hours.`,
  },
};

/** The kinds that get a page, given how many open places a town lists of each. */
export function placeTypePages(counts: Partial<Record<PlaceType, number>>, min = MIN_PLACES_FOR_TYPE_PAGE): PlaceType[] {
  return PLACE_TYPES.filter((t) => (counts[t] ?? 0) >= min);
}

/** How many of each kind, over a list of places that can be visited. */
export function countByType(places: Array<{ data: { type: PlaceType } }>): Partial<Record<PlaceType, number>> {
  const counts: Partial<Record<PlaceType, number>> = {};
  for (const p of places) counts[p.data.type] = (counts[p.data.type] ?? 0) + 1;
  return counts;
}

/** The kind a page path names, or nothing for any other path. */
export function placeTypeOfPath(pathname: string): PlaceType | undefined {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return PLACE_TYPES.find((t) => PLACE_TYPE_PAGES[t].path === path);
}

/**
 * The sibling pages a kind's page links at the foot: the other kinds in the
 * same section that have a page of their own, in PLACE_TYPES order.
 */
export function siblingTypePages(type: PlaceType, built: readonly PlaceType[]): PlaceType[] {
  const parent = PLACE_TYPE_PAGES[type].parent.path;
  return built.filter((t) => t !== type && PLACE_TYPE_PAGES[t].parent.path === parent);
}

/** Whether a kind is listed on /eat-drink/ (else /things-to-do/ or the directory). */
export function sectionOf(type: PlaceType): 'eat-drink' | 'things-to-do' | 'directory' {
  if (EAT_DRINK_TYPES.includes(type) || type === 'shop') return 'eat-drink';
  if (THINGS_TO_DO_TYPES.includes(type) || type === 'lodging') return 'things-to-do';
  return 'directory';
}
