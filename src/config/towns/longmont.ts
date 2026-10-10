import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A city of 98,885 at the 2020 census, the network's second after Fort
 * Collins, and like it a curated guide rather than a directory: the events
 * from the City's own calendars, and places on Main Street and downtown,
 * food and drink, the breweries, and the parks and greenways. The launch
 * threshold is higher than a small town's for that reason.
 */
export const longmont: TownConfig = {
  kind: 'town',
  // Live on 5 October 2026, on the owner's word after the first review.
  status: 'live',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['niwot', 'lyons', 'erie', 'carbon-valley', 'berthoud', 'fort-lupton'],
  launchThreshold: { events: 25, listings: 30 },
  slug: 'longmont',
  name: 'Longmont',
  // The "co" is the domain's, not the slug's, as with Windsor.
  domain: 'insidelongmontco.com',
  siteTitle: 'Inside Longmont',
  tagline: 'An independent guide to Longmont, Colorado: Main Street, the St. Vrain Greenway, McIntosh Lake, the breweries, and life in a city of 98,885 (2020 census).',
  shortTagline: 'Main Street, the St. Vrain Greenway and the breweries',
  seoTagline: 'Events and places in Longmont, Colorado',
  // Boulder first: the City calls itself a Boulder County city that extends
  // east into Weld (longmontcolorado.gov/information/about-longmont/).
  counties: ['Boulder', 'Weld'],
  countySplit: {
    note: 'Longmont is a Boulder County city that extends east into western Weld County. The City’s own new-resident page tells residents to sign up for Boulder or Weld County emergency alerts depending on their address, so check which county an address is in rather than assuming.',
    source: 'https://longmontcolorado.gov/information/about-longmont/new-resident-information/',
    verified: '2026-10-04',
  },
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40°09′42″N 105°05′04″W.
  lat: 40.1617,
  lng: -105.0844,
  population: 98885, // 2020 census; the City's own page says "over 99,000"
  // GNIS, via Wikipedia, as for every other town; the City's page says 4,979.
  elevationFt: 4981,
  // 15 November 1885, per the Colorado State Archives' list of municipal
  // incorporations as Wikipedia cites it. The Chicago-Colorado Colony founded
  // the town in 1871 (the City's About page); that is the founding, not the
  // incorporation.
  incorporated: 1885,
  // Downtown Denver is 34 miles; the guide's Getting around has the estimate.
  driveToDenver: 'About 45 min',
  population2010: 86270, // 2010 census, for census-to-census growth
  character:
    'The Chicago-Colorado Colony’s 1871 town on the St. Vrain, a city of 98,885 at the 2020 census, with its own fiber network, fifteen miles from Boulder and five from I-25.',
  colors: {
    // Clear denim + lively brick, on cool paper: Color System 2.0, 9 October 2026.
    primary: '#1F6582',
    accent: '#B75A3F',
    paper: 'cool',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Sunset over McIntosh Lake in north-west Longmont: dry cattails in the foreground and the sun dropping behind the snow-covered mountains to the west',
    credit: 'Tyler Cipriani, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidelongmontco.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Longmont,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Longmont_CO' },
    ],
    // One district on both sides of the county line, per the district's own
    // pages; test/towns.test.ts knows why this line does not begin "Mostly".
    schoolDistrict:
      'St. Vrain Valley Schools, the district based in Longmont, whose boundary takes in parts of Boulder and Weld counties; its online lookup gives the neighborhood schools for an address.',
    commuteNotes:
      'US 287 is Main Street: 16 miles north to Loveland and 34 miles south to downtown Denver. Colorado 119 runs 15 miles south-west to Boulder and 5 miles east to I-25.',
  },
  officialLinks: {
    townSite: 'https://longmontcolorado.gov/',
    townSiteLabel: 'the City of Longmont',
    policeNonEmergency: 'https://longmontcolorado.gov/public-safety/contact-public-safety/',
    policeNonEmergencyLabel: 'Longmont Public Safety (police and fire)',
  },
};
