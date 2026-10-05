import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A city of 76,378 at the 2020 census, the second-largest in Larimer County,
 * and like Fort Collins and Longmont a curated guide rather than a directory:
 * events from the sources the editor confirms, and places downtown, food and
 * drink, the breweries, and the parks and open space. The launch threshold is
 * higher than a small town's for that reason.
 */
export const loveland: TownConfig = {
  kind: 'town',
  // Live on 5 October 2026, on the owner's word after the first review.
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['berthoud', 'johnstown', 'fortcollins'],
  launchThreshold: { events: 25, listings: 30 },
  slug: 'loveland',
  name: 'Loveland',
  // The "co" is the domain's, not the slug's, as with Windsor and Longmont.
  domain: 'insidelovelandco.com',
  siteTitle: 'Inside Loveland',
  tagline:
    'An independent guide to Loveland, Colorado: downtown and the Rialto, the Benson Sculpture Garden, Lake Loveland and the Big Thompson, the breweries, and what it’s like to live in the Sweetheart City.',
  // "Colorado" spelled out: there is a Loveland in Ohio (with a museum whose
  // domain is lovelandmuseum.org) and a Loveland Pass a hundred miles away.
  seoTagline: 'Events and places in Loveland, Colorado',
  counties: ['Larimer'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40°23′27″N 105°04′19″W.
  lat: 40.3908,
  lng: -105.0719,
  population: 76378, // 2020 census
  elevationFt: 4997, // GNIS, via Wikipedia
  // 30 April 1881, per the Colorado State Archives' list of municipal
  // incorporations as Wikipedia cites it. The Colorado Central Railroad
  // founded the town in 1877; that is the founding, not the incorporation.
  incorporated: 1881,
  population2010: 66859, // 2010 census, for census-to-census growth
  character:
    'The Sweetheart City, founded by the railroad on the Big Thompson in 1877: a sculpture garden, a lake in town, and the Centerra interchange on I-25.',
  colors: {
    // Plum on a cool paper: between Erie's blue-violet and Johnstown's
    // burgundy on the wheel, and further from each than they are from the
    // reds. `npm run check-colors` is the gate.
    accent: '#8A3D86',
    accentDark: '#5F2A5C',
    neutralBg: '#F8F5F7',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Sunset over Lake Loveland, framed by two trees on the shore, with a person sitting in silhouette at the water and the mountains beyond',
    credit: 'Paul Dineen, Wikimedia Commons, CC BY 3.0',
  },
  social: {
    email: 'hello@insidelovelandco.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Loveland,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Loveland_CO' },
    ],
    schoolDistrict:
      'Thompson School District R2-J, based in Loveland, which also takes in Berthoud and the Larimer County sides of Johnstown and Windsor.',
    commuteNotes:
      'US 34 crosses the city east to west as Eisenhower Boulevard, out to I-25 and Centerra one way and up the Big Thompson Canyon the other; US 287 runs north and south through it. COLT runs the city buses, the FLEX regional route links Fort Collins, Berthoud and Longmont, and Bustang runs to Denver, 46 miles south.',
  },
  officialLinks: {
    townSite: 'https://www.lovgov.org/',
    townSiteLabel: 'the City of Loveland',
  },
};
