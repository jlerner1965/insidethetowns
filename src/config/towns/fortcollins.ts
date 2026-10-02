import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * The network's first city. 169,810 people at the 2020 census, the
 * fourth-largest in Colorado, and the place Timnath's, Berthoud's and
 * Johnstown's guides measure themselves against. The guide is a curated
 * selection rather than a directory — see docs/EXPANSION-WINDSOR-FORT-COLLINS.md,
 * decision 3 — and every listing carries `area`, because a city reader
 * navigates by neighborhood.
 */
export const fortcollins: TownConfig = {
  kind: 'town',
  slug: 'fortcollins',
  name: 'Fort Collins',
  domain: 'insidefortcollins.com',
  siteTitle: 'Inside Fort Collins',
  tagline:
    'An independent guide to Fort Collins, Colorado: Old Town, the Poudre, Horsetooth, the breweries, and what it’s like to live in the city the northern Front Range looks to.',
  seoTagline: 'Events and places in Fort Collins, Colorado',
  counties: ['Larimer'],
  state: 'CO',
  lat: 40.5475,
  lng: -105.0658,
  population: 169810, // 2020 census
  elevationFt: 4997,
  // 3 February 1873, per the City's own history (history.fcgov.com/explore/city-history).
  // Wikipedia's lead gives 12 February 1883, which is a later reorganisation; the
  // City's page is the primary source here.
  incorporated: 1873,
  driveToDenver: 'About 1 hr 10 min',
  population2010: 143986, // 2010 census, for census-to-census growth
  character: 'The city the other towns measure against: Old Town, the Poudre, CSU and 170,000 people.',
  colors: {
    // Navy on a cool paper. CSU's green was the obvious choice and it would
    // sit next to Niwot's; nothing else in the network is this dark a blue,
    // and the hub's mid-blue and Berthoud's lake blue both read lighter.
    accent: '#24467A',
    accentDark: '#172E52',
    neutralBg: '#F5F6F8',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'The Northern Hotel on College Avenue in Old Town Fort Collins, its vertical neon sign and white art-deco front beside a brick storefront under a deep blue sky',
    credit: 'Xnatedawgx, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidefortcollins.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Fort-Collins,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Fort-Collins_CO' },
    ],
    schoolDistrict:
      'Poudre School District (PSD): four comprehensive high schools (Fort Collins, Poudre, Rocky Mountain and Fossil Ridge), with the middle and elementary schools that feed them, plus the district’s option and charter schools.',
    commuteNotes:
      'Transfort runs the city buses and the MAX line down Mason Street; Bustang runs to Denver Union Station from the Downtown Transit Center. By car, I-25 is on the east edge: Loveland in twenty minutes, Greeley in thirty-five, Cheyenne in forty-five and Denver in about an hour and ten minutes off-peak.',
  },
  officialLinks: {
    townSite: 'https://www.fcgov.com/',
    townSiteLabel: 'the City of Fort Collins',
    policeNonEmergency: 'https://www.fcgov.com/police/',
    policeNonEmergencyLabel: 'Fort Collins Police Services',
  },
  formspreeId: 'mgavbjyp',
};
