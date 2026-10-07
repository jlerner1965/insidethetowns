import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Weld County home-rule town of 7,683 at the 2020 census, up from 3,165 in
 * 2010: the fastest-growing municipality in the network by share, and the
 * only one whose growth is nearly all new subdivisions. Front Range chassis;
 * the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const severance: TownConfig = {
  kind: 'town',
  // Live 7 October 2026, on the owner's word, after the first review cleared
  // the launch threshold (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['windsor', 'timnath', 'fortcollins'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  // Listings lowered from 15 to 12 by the owner on 6 October 2026: the Town's parks
  // have no published addresses and its businesses mostly no sites of their own.
  launchThreshold: { events: 10, listings: 12 },
  slug: 'severance',
  name: 'Severance',
  domain: 'insideseverance.com',
  siteTitle: 'Inside Severance',
  tagline:
    'An independent guide to Severance, Colorado: the parks, the ponds, the events, and life in the Weld County town east of Windsor that doubled in a decade.',
  shortTagline: 'The parks, the ponds and a town that doubled in ten years',
  seoTagline: 'Events and places in Severance, Colorado',
  counties: ['Weld'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 40°31′24″N 104°51′14″W.
  lat: 40.5233,
  lng: -104.8539,
  population: 7683, // 2020 census
  elevationFt: 4876, // GNIS, via Wikipedia
  // 20 November 1920, per the Wikipedia infobox (founded 1906).
  incorporated: 1920,
  population2010: 3165, // 2010 census, for census-to-census growth
  colors: {
    // Prairie sage: a grey-green for the beet and grain country east of Windsor, greyer than Longmont's olive and Niwot's emerald. `npm run check-colors` is the gate.
    accent: '#5F7F5B',
    accentDark: '#3E5A3B',
    neutralBg: '#F5F6F1',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Blue Spruce Pond in Severance at sunset: a fountain on the water, cottonwoods along the far bank and a pink and orange sky',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'Sajacobsen, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insideseverance.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Severance,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Severance_CO' },
    ],
    // Weld RE-4 (Windsor-Severance), based in Windsor (weldre4.org, read
    // 6 October 2026). commuteNotes are written at launch.
    schoolDistrict: 'Weld RE-4 School District (Windsor-Severance), based in Windsor; Severance High and Severance Middle are in town.',
  },
  officialLinks: {
    townSite: 'https://www.townofseverance.org/',
    townSiteLabel: 'the Town of Severance',
    // Read 6 October 2026 from the department's page: office 970-685-9708,
    // after-hours non-emergency dispatch 970-350-9600.
    policeNonEmergency: 'https://www.townofseverance.org/200/Police',
    policeNonEmergencyLabel: 'Severance Police Department (non-emergency dispatch 970-350-9600)',
  },
};
