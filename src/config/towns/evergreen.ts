import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * An unincorporated Jefferson County community of 9,307 at the 2020 census
 * (the census-designated place), 7,162 feet up on Bear Creek, with no town
 * government: Jefferson County, the Evergreen Park & Recreation District and
 * the fire district between them do what a town hall does elsewhere, which
 * the pages have to say. Mountain chassis.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const evergreen: TownConfig = {
  kind: 'town',
  // Not live: the domain serves a noindex holding page until the owner flips
  // this after the first review (docs/ACCURACY-SYSTEM.md, launch threshold).
  status: 'wave3',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: ['golden'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  launchThreshold: { events: 15, listings: 20 },
  slug: 'evergreen',
  name: 'Evergreen',
  domain: 'insideevergreenco.com',
  siteTitle: 'Inside Evergreen',
  tagline:
    'An independent guide to Evergreen, Colorado: the lake, the downtown on Bear Creek, the elk in the meadows, the Jeffco Open Space trails, and what it’s like to live in the foothills an hour from Denver.',
  seoTagline: 'Events and trails in Evergreen, Colorado',
  counties: ['Jefferson'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39°36′50″N 105°21′10″W.
  lat: 39.6139,
  lng: -105.3528,
  population: 9307, // 2020 census; the census-designated place
  elevationFt: 7162, // GNIS, via Wikipedia
  // Never incorporated: Evergreen is an unincorporated community and census-designated place in Jefferson County (the Wikipedia infobox), so there is no town government. Like Niwot, the county is the local government.
  incorporated: null,
  // No 2010 figure for the same census-designated place is cited here; growth is left blank.
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
      note: 'Live state highway conditions and closures, including Colorado 74 and I-70.',
    },
    {
      label: 'Jeffco Open Space alerts',
      url: 'https://www.jeffco.us/AlertCenter.aspx?CID=25',
      note: 'Trail and park closures at Alderfer/Three Sisters, Elk Meadow, Flying J Ranch and the rest of the county’s parks.',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Forest Service’s closures and notices, including the Mount Blue Sky road.',
    },
  ],
  colors: {
    // Evergreen: the dark forest green of the name, deeper and bluer than Niwot's emerald and far from Severance's grey sage. `npm run check-colors` is the gate.
    accent: '#1F5A3A',
    accentDark: '#143C27',
    neutralBg: '#F3F6F3',
  },
  hero: {
    // The placeholder new-town writes; replace before launch and update IMAGE_LICENSES.csv.
    image: 'hero.jpg',
    alt: 'Placeholder image; a photograph of Evergreen replaces it before launch',
  },
  social: {
    email: 'hello@insideevergreenco.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Evergreen,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Evergreen_CO' },
    ],
    // Jeffco Public Schools (jeffcopublicschools.org, read 6 October 2026).
    // commuteNotes are written at launch with the rest of the Moving Here guide.
    schoolDistrict: 'Jeffco Public Schools, the county-wide district.',
  },
  officialLinks: {
    townSite: 'https://www.jeffco.us/',
    townSiteLabel: 'Jefferson County (Evergreen has no town government)',
    // No town police: the Jefferson County Sheriff. Contact page read
    // 6 October 2026; the non-emergency number is the one Jefferson County's
    // own Hiwan Heritage Park page gives.
    policeNonEmergency: 'https://www.jeffcosheriffco.gov/about/contact',
    policeNonEmergencyLabel: 'Jefferson County Sheriff’s Office (non-emergency 303-980-7300)',
  },
};
