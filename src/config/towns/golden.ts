import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * The Jefferson County seat, a home-rule city of 20,399 at the 2020 census at
 * the mouth of Clear Creek Canyon: foothills town rather than high country,
 * but a town whose weekends are trailheads, with Jefferson County Open Space
 * on three sides, so it runs on the mountain chassis. The launch threshold is
 * above the default for a city this size.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const golden: TownConfig = {
  kind: 'town',
  // Live 7 October 2026, on the owner's word, after the first review cleared
  // the launch threshold (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: ['evergreen', 'black-hawk', 'idaho-springs', 'georgetown'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 20, listings: 25 },
  slug: 'golden',
  name: 'Golden',
  domain: 'insidegolden.com',
  siteTitle: 'Inside Golden',
  tagline:
    'An independent guide to Golden, Colorado: Washington Avenue, Clear Creek, the Table Mountains, Lookout Mountain, and life at the edge of the foothills.',
  shortTagline: 'Washington Avenue, Clear Creek and the Table Mountains',
  seoTagline: 'Events, trails and places in Golden, Colorado',
  counties: ['Jefferson'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39°45′12″N 105°12′55″W.
  lat: 39.7533,
  lng: -105.2153,
  population: 20399, // 2020 census
  elevationFt: 5784, // GNIS, via Wikipedia
  driveToDenver: 'About 25 min',
  character: 'A college, brewery and county-seat town at the canyon mouth, twelve miles from downtown Denver.',
  // 3 January 1871, as Golden City, Colorado Territory, per the Wikipedia infobox (founded 16 June 1859).
  incorporated: 1871,
  population2010: 18867, // 2010 census, for census-to-census growth
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. Each URL answered 200 to a
   * request on 6 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures, including US 6 through Clear Creek Canyon and I-70.',
    },
    {
      label: 'Jeffco Open Space: alerts and closures',
      url: 'https://www.jeffco.us/1531/Alerts-Closures',
      note: 'Trail closures at North Table Mountain, Lookout Mountain, Clear Creek Canyon Park and the county’s other parks, the seasonal wildlife closures included.',
    },
  ],
  colors: {
    // Copper-gold + creek slate, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#94651E',
    accent: '#3D5760',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Clear Creek east of the Washington Avenue bridge in Golden, kayakers in the current and North Table Mountain behind the town',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'Dough4872, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidegolden.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Golden,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Golden_CO' },
    ],
    // Jeffco Public Schools (jeffcopublicschools.org, read 6 October 2026).
    // commuteNotes are written at launch with the rest of the Moving Here guide.
    schoolDistrict: 'Jeffco Public Schools, the county-wide district.',
  },
  officialLinks: {
    // cityofgolden.net redirects here (read 6 October 2026).
    townSite: 'https://www.cityofgolden.gov/',
    townSiteLabel: 'the City of Golden',
    // Read 6 October 2026 from the department's contact page: non-emergency
    // dispatch through Jeffcom, 303-980-7300; the department itself 303-384-8045.
    policeNonEmergency: 'https://www.cityofgolden.gov/police/contact_us.php',
    policeNonEmergencyLabel: 'Golden Police Department (non-emergency dispatch 303-980-7300)',
  },
};
