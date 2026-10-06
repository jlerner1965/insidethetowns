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
  // Not live: the domain serves a noindex holding page until the owner flips
  // this after the first review (docs/ACCURACY-SYSTEM.md, launch threshold).
  status: 'wave2',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['windsor', 'timnath', 'fortcollins'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 10, listings: 15 },
  slug: 'severance',
  name: 'Severance',
  domain: 'insideseverance.com',
  siteTitle: 'Inside Severance',
  tagline:
    'An independent guide to Severance, Colorado: the small town east of Windsor that grew from 3,000 to 7,700 people in a decade, its parks and its events, and what it’s like to live there.',
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
    // The placeholder new-town writes; replace before launch and update IMAGE_LICENSES.csv.
    image: 'hero.jpg',
    alt: 'Placeholder image; a photograph of Severance replaces it before launch',
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
    // schoolDistrict and commuteNotes are written at launch, from the district's
    // and the town's own pages, with the rest of the Moving Here guide.
  },
  officialLinks: {
    townSite: 'https://www.townofseverance.org/',
    townSiteLabel: 'the Town of Severance',
    // policeNonEmergency is set at launch from the department's own page.
  },
};
