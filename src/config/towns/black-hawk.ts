import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Gilpin County home rule city of 127 at the 2020 census, 8,058 feet up
 * in Gregory Gulch below Central City, and the smallest guide in the
 * network by population: the town is its casinos, the hills around them and
 * the Peak to Peak Highway. Mountain chassis; the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insideblackhawk.com, is the owner's, named 10 October 2026.
 */
export const blackHawk: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Nederland by the Peak to Peak, Golden down Clear Creek Canyon, Idaho
  // Springs up Virginia Canyon, Georgetown beyond it. Set when the town went
  // live, 10 October 2026; each names Black Hawk back.
  neighbors: ['nederland', 'golden', 'idaho-springs', 'georgetown'],
  slug: 'black-hawk',
  name: 'Black Hawk',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insideblackhawk.com',
  siteTitle: 'Inside Black Hawk',
  tagline:
    'An independent guide to Black Hawk, Colorado: the gaming town in Gregory Gulch, Gilpin County’s hills and the Peak to Peak Highway.',
  shortTagline: 'Gregory Gulch, the casinos and the Peak to Peak',
  seoTagline: 'Events and trails in Black Hawk, Colorado',
  counties: ['Gilpin'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39.80611, -105.50222.
  lat: 39.8061,
  lng: -105.5022,
  population: 127, // 2020 census
  elevationFt: 8058, // GNIS, via Wikipedia
  character: 'A home rule city of about 130 people at 8,000 feet, the gaming town of Gregory Gulch below Central City.',
  // 1864: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026) gives Black Hawk's incorporation year as 1864. The
  // Wikipedia infobox says 12 June 1886. The state file is the official
  // record, as for Nederland; the infobox date is noted here as the odd one out.
  incorporated: 1864,
  population2010: 118, // 2010 census, State Demography Office file
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
      note: 'Live state highway conditions and closures, including Colorado 119 (Clear Creek and Boulder canyons) and Colorado 72 (the Peak to Peak).',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Forest Service’s closures and fire restrictions on the national forest around Black Hawk and Central City.',
    },
  ],
  colors: {
    // Burgundy + brass, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#652B38',
    accent: '#B9995B',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'The Lace House in Black Hawk: a small Carpenter Gothic house with lacy white trim along its steep gable and porch, a flag on the porch and pines on the slope behind',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 10 October 2026.
    credit: 'Jerrye and Roy Klotz MD, Wikimedia Commons, CC BY-SA 3.0',
  },
  social: {
    email: 'hello@insideblackhawk.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Black-Hawk,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Black-Hawk_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the City's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox's official site. It answers automated requests with 403,
    // so nothing here was read from it (10 October 2026).
    townSite: 'https://www.cityofblackhawk.org/',
    townSiteLabel: 'the City of Black Hawk',
  },
};
