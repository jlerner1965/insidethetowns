import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * An El Paso County home rule city of 4,858 at the 2020 census, 6,306 feet
 * up at the foot of Pikes Peak on the west edge of Colorado Springs: the
 * mineral springs, Manitou Avenue, the Incline, the cog railway and the
 * Garden of the Gods next door. The lowest of the mountain guides, and the
 * only one south of Denver; the mountain chassis all the same, for the
 * seasons the Peak and the Incline keep.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insidemanitousprings.com, is the owner's, named 10 October 2026.
 */
export const manitouSprings: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Castle Rock, the nearest guide, an hour up I-25; it has not launched, so
  // the Nearby block stays empty until it does, as Elizabeth's does. Set when
  // the town went live, 10 October 2026; Castle Rock names Manitou back.
  neighbors: ['castle-rock'],
  // Set with the brief, 10 October 2026, at Evergreen's level: a town of
  // nearly five thousand with a year-round tourist street.
  launchThreshold: { events: 15, listings: 20 },
  slug: 'manitou-springs',
  name: 'Manitou Springs',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insidemanitousprings.com',
  siteTitle: 'Inside Manitou Springs',
  tagline:
    'An independent guide to Manitou Springs, Colorado: the mineral springs, Manitou Avenue, the Incline, the cog railway and the foot of Pikes Peak.',
  shortTagline: 'The springs, the Incline and the foot of Pikes Peak',
  seoTagline: 'What’s on in Manitou Springs, Colorado',
  counties: ['El Paso'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 38.85750, -104.91278.
  lat: 38.8575,
  lng: -104.9128,
  population: 4858, // 2020 census
  elevationFt: 6306, // GNIS, via Wikipedia
  character: 'A home rule city of about 4,900 at 6,300 feet at the foot of Pikes Peak, on the west edge of Colorado Springs, with mineral springs and a tourist avenue.',
  // 1888: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026) and the Wikipedia infobox (25 January 1888) agree.
  incorporated: 1888,
  population2010: 4992, // 2010 census, State Demography Office file
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. Each URL answered 200 to a
   * request on 10 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures, including US 24 through Ute Pass.',
    },
    {
      label: 'Pike and San Isabel National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/psicc/alerts',
      note: 'The Pikes Peak Ranger District’s closures and fire restrictions.',
    },
    {
      label: 'Pikes Peak Highway',
      url: 'https://drivepikespeak.com/',
      note: 'Whether the highway to the summit is open, from the City of Colorado Springs, which runs it.',
    },
  ],
  colors: {
    // Plum: a deep magenta-plum for the painted storefronts of Manitou Avenue, darker than Loveland's purple and bluer than Johnstown's raspberry. `npm run check-colors` is the gate.
    accent: '#8E2F6B',
    accentDark: '#5F1F48',
    neutralBg: '#F8F3F6',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Manitou Avenue in Manitou Springs: brick storefronts on the left and traffic heading down the tree-lined street',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 10 October 2026.
    credit: 'John Lloyd, Wikimedia Commons, CC BY 2.0',
  },
  social: {
    email: 'hello@insidemanitousprings.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Manitou-Springs,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Manitou-Springs_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the City's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox gives manitouspringsgov.com, which answered 301 to this
    // address on 10 October 2026; the site itself answers automated
    // requests with 403, so nothing here was read from it.
    townSite: 'https://www.manitouspringsco.gov/',
    townSiteLabel: 'the City of Manitou Springs',
  },
};
