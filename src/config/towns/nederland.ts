import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Boulder County statutory town of 1,471 at the 2020 census, 8,235 feet up
 * at the top of Boulder Canyon, the highest and smallest guide in the network
 * and the trailhead town for the Indian Peaks. Mountain chassis; the default
 * launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const nederland: TownConfig = {
  kind: 'town',
  // Not live: the domain serves a noindex holding page until the owner flips
  // this after the first review (docs/ACCURACY-SYSTEM.md, launch threshold).
  status: 'wave3',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: ['lyons', 'niwot'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 10, listings: 15 },
  slug: 'nederland',
  name: 'Nederland',
  domain: 'insidenederland.com',
  siteTitle: 'Inside Nederland',
  tagline:
    'An independent guide to Nederland, Colorado: the town at the top of Boulder Canyon, Barker Reservoir, the Peak to Peak Highway, the Indian Peaks trailheads, and what it’s like to live at 8,200 feet.',
  seoTagline: 'Events and trails in Nederland, Colorado',
  counties: ['Boulder'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39°57′43″N 105°30′05″W.
  lat: 39.9619,
  lng: -105.5014,
  population: 1471, // 2020 census
  elevationFt: 8235, // GNIS, via Wikipedia
  // 15 November 1885, per the Wikipedia infobox.
  incorporated: 1885,
  population2010: 1445, // 2010 census, for census-to-census growth
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
      note: 'Live state highway conditions and closures, including Colorado 119 (Boulder Canyon) and Colorado 72 (the Peak to Peak).',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Boulder Ranger District’s closures, fire restrictions and the Brainard Lake and Indian Peaks orders.',
    },
    {
      label: 'Boulder County Parks & Open Space: trail conditions',
      url: 'https://bouldercounty.gov/open-space/parks-and-trails/trail-conditions/',
      note: 'Closures at Mud Lake, Caribou Ranch and the county’s other properties.',
    },
  ],
  colors: {
    // Mine-town wine: a deep claret for the old mill town at the top of Boulder Canyon, darker and browner than Johnstown's raspberry. `npm run check-colors` is the gate.
    accent: '#7B2D3C',
    accentDark: '#541E29',
    neutralBg: '#F8F4F4',
  },
  hero: {
    // The placeholder new-town writes; replace before launch and update IMAGE_LICENSES.csv.
    image: 'hero.jpg',
    alt: 'Placeholder image; a photograph of Nederland replaces it before launch',
  },
  social: {
    email: 'hello@insidenederland.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Nederland,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Nederland_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the district's
    // and the town's own pages, with the rest of the Moving Here guide.
  },
  officialLinks: {
    townSite: 'https://nederlandco.org/',
    townSiteLabel: 'the Town of Nederland',
    // The Town contracts with the Boulder County Sheriff's Office for law
    // enforcement: the Town's Law Enforcement page, read 6 October 2026
    // (non-emergency 303-441-4444; office at 20 Lakeview Drive). Confirmed
    // by the owner the same day.
    policeNonEmergency: 'https://www.nederlandco.gov/1451/Law-Enforcement',
    policeNonEmergencyLabel: 'Boulder County Sheriff’s Office, under contract to the Town (non-emergency 303-441-4444)',
  },
};
