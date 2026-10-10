import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Gilpin County home rule city of 127 at the 2020 census, 8,058 feet up
 * in Gregory Gulch below Central City, and the smallest guide in the
 * network by population: the town is its casinos, the hills around them and
 * the Peak to Peak Highway. Mountain chassis; the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain is not
 * yet the owner's call: see `domain` below.
 */
export const blackHawk: TownConfig = {
  kind: 'town',
  // Not live. The guide builds a holding page until the owner names the
  // domain and the first review clears the launch threshold.
  status: 'wave2',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Empty until the owner sets them: neighbours go both ways (test/nearby.test.ts),
  // so naming Nederland and Golden here means naming Black Hawk on theirs, which is
  // the owner's call. Proposed: nederland (the Peak to Peak), golden (Clear Creek
  // Canyon), and idaho-springs and georgetown once they launch.
  neighbors: [],
  slug: 'black-hawk',
  name: 'Black Hawk',
  /**
   * UNCONFIRMED. The owner has not named this town's domain (10 October
   * 2026), and the brief says to ask rather than guess, so this is a
   * reserved `.invalid` name that cannot resolve. Replace it, and the email
   * below, with the Inside domain the owner owns before creating the Vercel
   * project; nothing links to a town that is not live, so until then it
   * appears nowhere a reader can see.
   */
  domain: 'black-hawk.unconfirmed.invalid',
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
    // Cinnabar: a true, deep red for the brick and the marquees of Gregory Gulch, truer and brighter than Nederland's wine, deeper and less orange than Lyons' sandstone. `npm run check-colors` is the gate.
    accent: '#A42A22',
    accentDark: '#6F1C17',
    neutralBg: '#F7F3F2',
  },
  hero: {
    image: 'hero.jpg',
    // The stand-in from scripts/templates/; a photograph is chosen at launch, with its row in IMAGE_LICENSES.csv.
    alt: 'Placeholder: no photograph of Black Hawk has been chosen yet',
  },
  social: {
    // Follows the domain; see the note on `domain`.
    email: 'hello@black-hawk.unconfirmed.invalid',
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
