import type { TownConfig } from './types.ts';

/**
 * A Gilpin County home rule city of 127 at the 2020 census, 8,058 feet up
 * in Gregory Gulch below Central City, and the smallest guide the network
 * ever had by population: the town is its casinos, the hills around them and
 * the Peak to Peak Highway.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insideblackhawk.com, is the owner's, named 10 October 2026.
 *
 * Its own guide from 10 to 20 October 2026 (a visitor guide, no weekly
 * email), then a section of Inside Clear Creek, the Idaho Springs guide,
 * from 20 October (DECISIONS.md, "Georgetown and Black Hawk join Idaho
 * Springs on one Clear Creek guide"). Retired on 2 November 2026 on the
 * owner's word (DECISIONS.md, "Black Hawk and Carbon Valley close; Lafayette
 * and Frederick open"): its events, places, articles and sources left the
 * Clear Creek folder (git history keeps them), the Clear Creek guide is two
 * towns again, and every path on insideblackhawk.com redirects to the hub's
 * home page (vercel.json). The config stays so the Vercel project keeps
 * building, and keeps serving those redirects.
 */
export const blackHawk: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold;
  // folded into the Idaho Springs guide on 20 October 2026; retired 2 November.
  status: 'redirect',
  retired: {
    since: '2026-11-02',
    reason: 'The owner closed the Black Hawk coverage on 2 November 2026, with the Carbon Valley guide, to put the hand work into Lafayette and Frederick instead; Clear Creek keeps Idaho Springs and Georgetown.',
  },
  variant: 'mountain',
  region: 'Mountains & Foothills',
  neighbors: [],
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
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Black-Hawk,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Black-Hawk_CO' },
    ],
    // The district as the guide's Moving Here page named it (13 October
    // 2026, audit F05).
    schoolDistrict:
      'Gilpin County School District RE-1: one campus at 10595 Highway 119 for preschool through 12th grade (Gilpin County Preschool, Elementary and Secondary).',
  },
  officialLinks: {
    // The infobox's official site. It answered automated requests with 403
    // when the town was scaffolded on 10 October 2026, then 200 to the
    // robots-aware reader later that day.
    townSite: 'https://www.cityofblackhawk.org/',
    townSiteLabel: 'the City of Black Hawk',
  },
};
