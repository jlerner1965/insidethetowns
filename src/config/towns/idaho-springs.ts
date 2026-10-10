import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Clear Creek County statutory city of 1,782 at the 2020 census, 7,526
 * feet up on Clear Creek where I-70 meets the road to Mount Blue Sky: the
 * 1859 gold town with the Argo Mill, the hot springs and the trailheads
 * above the canyon. Mountain chassis; the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insideidahosprings.com, is the owner's, named 10 October 2026.
 */
export const idahoSprings: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/ACCURACY-SYSTEM.md).
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Georgetown up I-70, Evergreen over Floyd Hill, Golden down the canyon,
  // Black Hawk up Virginia Canyon. Set when the town went live, 10 October
  // 2026; each names Idaho Springs back.
  neighbors: ['georgetown', 'evergreen', 'golden', 'black-hawk'],
  slug: 'idaho-springs',
  name: 'Idaho Springs',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insideidahosprings.com',
  siteTitle: 'Inside Idaho Springs',
  tagline:
    'An independent guide to Idaho Springs, Colorado: Clear Creek, Miner Street, the Argo Mill, the hot springs and the road to Mount Blue Sky.',
  shortTagline: 'Clear Creek, Miner Street and the road to Mount Blue Sky',
  seoTagline: 'What’s on in Idaho Springs, Colorado',
  counties: ['Clear Creek'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39.74667, -105.48056.
  lat: 39.7467,
  lng: -105.4806,
  population: 1782, // 2020 census
  elevationFt: 7526, // GNIS, via Wikipedia
  character: 'A statutory city of about 1,800 at 7,500 feet on Clear Creek, the first stop up I-70 from Denver and the gateway to Mount Blue Sky.',
  // 1878: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026). The Wikipedia infobox says 15 November 1885. The state
  // file is the official record, as for Nederland; the infobox date is
  // noted here as the odd one out.
  incorporated: 1878,
  population2010: 1717, // 2010 census, State Demography Office file
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
      note: 'Live state highway conditions and closures, including I-70 and Colorado 103 (the Mount Blue Sky road from town).',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Clear Creek Ranger District’s closures and fire restrictions.',
    },
    {
      label: 'Mount Blue Sky summit road',
      url: 'https://www.fs.usda.gov/r02/arp/recreation/mount-blue-sky-summit',
      note: 'The Forest Service’s page for the summit road: its season and the entry rules in force.',
    },
  ],
  colors: {
    // Burnished copper + river teal, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#87542F',
    accent: '#2C7D83',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'The red Argo gold mill on the hillside above Idaho Springs, its name painted high on the mill, under a blue sky',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 10 October 2026.
    credit: 'D&RG Railfan, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insideidahosprings.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Idaho-Springs,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Idaho-Springs_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the City's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox's official site. It answers automated requests with 403,
    // so nothing here was read from it (10 October 2026).
    townSite: 'https://www.idahospringsco.com/',
    townSiteLabel: 'the City of Idaho Springs',
  },
};
