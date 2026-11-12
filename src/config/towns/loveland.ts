import type { TownConfig } from './types.ts';

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
  // Folded into its town's page on the hub on 12 November 2026 (the
  // restructure brief; DECISIONS.md, "Two tiers"): the page has its three
  // verified dated items, so every address on this domain redirects to the
  // matching place on it (vercel.json, src/lib/fold.ts) and the guide's
  // content has left content/loveland/ (git history keeps it).
  status: 'redirect',
  hubPage: { town: 'loveland', since: '2026-11-12' },
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: [],
  launchThreshold: { events: 25, listings: 30 },
  slug: 'loveland',
  name: 'Loveland',
  // The "co" is the domain's, not the slug's, as with Windsor and Longmont.
  domain: 'insidelovelandco.com',
  siteTitle: 'Inside Loveland',
  tagline: 'An independent guide to Loveland, Colorado: downtown and the Rialto, the Benson Sculpture Garden, Lake Loveland, the breweries, and the Sweetheart City.',
  shortTagline: 'The Rialto, the sculpture garden, the lake and the Big Thompson',
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
  // The State Capitol is 46 miles; the guide's Getting around has the estimate.
  driveToDenver: 'About 55 min',
  population2010: 66859, // 2010 census, for census-to-census growth
  character:
    'The Sweetheart City, founded by the railroad on the Big Thompson in 1877: a sculpture garden, a lake in town, and the Centerra interchange on I-25.',
  colors: {
    // Red Wolf red, Loveland High's colour as the guide's (22 October 2026):
    // the city follows four schools, and its namesake's red is the guide's;
    // the shade is Loveland High's own site's. The other three schools keep
    // their colours on their own pages.
    primary: '#BA0C2F',
    accent: '#BA8C57',
    paper: 'warm',
  },
  // The line under each Find your next stop tile (TownConfig.nextStop), from what
  // the three pages list, 9 November 2026.
  nextStop: { eatDrink: 'Restaurants, breweries, shops', thingsToDo: 'Sculpture parks, Boyd Lake, trails', living: 'Housing, schools, getting around' },
  hero: {
    // Bought from Adobe Stock on 28 October 2026 (docs/HERO-PHOTOS.md), in
    // place of the lake at sunset: the hero is the town itself. A standard
    // licence, so no credit on the photograph; /credits/ names it.
    image: 'AdobeStock_412335350.jpeg',
    alt: 'Downtown Loveland from the air on a clear winter day: the brick blocks and new apartment buildings along the downtown streets, houses and bare trees all around, Lake Loveland beyond the rooftops and the foothills on the horizon',
    credit: 'Jacob Boomsma, Adobe Stock',
    // Wide screen: Lake Loveland, the foothills and the top of downtown, not rooftops alone.
    position: '50% 22%',
  },
  social: {
    email: 'hello@insidelovelandco.com',
  },
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
  plausible: true,
};
