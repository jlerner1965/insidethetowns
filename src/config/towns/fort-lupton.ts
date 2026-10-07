import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Weld County statutory city of 7,955 at the 2020 census, on US 85 and the
 * South Platte eight miles east of the Carbon Valley towns, with the rebuilt
 * 1836 fort on its north edge. Front Range chassis; the default launch
 * threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const fortLupton: TownConfig = {
  kind: 'town',
  // Not live: the domain serves a noindex holding page until the owner flips
  // this after the first review (docs/ACCURACY-SYSTEM.md, launch threshold).
  status: 'wave2',
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  neighbors: ['carbon-valley', 'longmont'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 10, listings: 15 },
  slug: 'fort-lupton',
  name: 'Fort Lupton',
  domain: 'insidefortlupton.com',
  siteTitle: 'Inside Fort Lupton',
  tagline:
    'An independent guide to Fort Lupton, Colorado: the old fort on the South Platte, downtown, the recreation center, and life across I-25 from Carbon Valley.',
  shortTagline: 'The old fort, downtown and the South Platte',
  seoTagline: 'Events and places in Fort Lupton, Colorado',
  counties: ['Weld'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40°05′30″N 104°49′45″W.
  lat: 40.0917,
  lng: -104.8292,
  population: 7955, // 2020 census
  elevationFt: 4915, // GNIS, via Wikipedia
  // 1890, per the State Demography Office's historical census file (the
  // Wikipedia infobox gives no date); read 6 October 2026.
  incorporated: 1890,
  population2010: 7377, // 2010 census, for census-to-census growth
  colors: {
    // Fort timber: a saddle brown for the 1836 trading post the city is named for, darker and less orange than Elizabeth's amber. `npm run check-colors` is the gate.
    accent: '#7D5330',
    accentDark: '#553820',
    neutralBg: '#F8F5F0',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Denver Avenue in Fort Lupton looking west, a Fort Lupton banner over the road and the snow-covered Front Range beyond the rooftops',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'Jeffrey Beall, Wikimedia Commons, CC BY 3.0',
  },
  social: {
    email: 'hello@insidefortlupton.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Fort-Lupton,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Fort-Lupton_CO' },
    ],
    // Weld RE-8, the district based in Fort Lupton (its office is on South
    // Fulton Avenue, per the chamber's events page read 6 October 2026; the
    // district's own site did not answer from here). commuteNotes are
    // written at launch with the rest of the Moving Here guide.
    schoolDistrict: 'Weld RE-8 Schools, the district based in Fort Lupton.',
  },
  officialLinks: {
    townSite: 'https://www.fortluptonco.gov/',
    townSiteLabel: 'the City of Fort Lupton',
    // Read 6 October 2026 from the department's page: non-emergency dispatch
    // 720-652-4222 (the same Weld dispatch Frederick's police use).
    policeNonEmergency: 'https://www.fortluptonco.gov/1013/Police-Department',
    policeNonEmergencyLabel: 'Fort Lupton Police Department (non-emergency dispatch 720-652-4222)',
  },
};
