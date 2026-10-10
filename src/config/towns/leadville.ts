import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * The Lake County seat, a statutory city of 2,633 at the 2020 census and,
 * at 10,154 feet, by a
 * long way the highest guide in the network: the silver city of 1878,
 * Harrison Avenue, the Tabor Opera House, the Mineral Belt Trail and the
 * two highest peaks in the state above it. Mountain chassis; the default
 * launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain is not
 * yet the owner's call: see `domain` below.
 */
export const leadville: TownConfig = {
  kind: 'town',
  // Not live. The guide builds a holding page until the owner names the
  // domain and the first review clears the launch threshold.
  status: 'wave2',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Nothing in the network is within an afternoon's drive of Leadville:
  // Georgetown, the nearest, is an hour and a half over Loveland Pass. Empty
  // on purpose, like Elizabeth's.
  neighbors: [],
  slug: 'leadville',
  name: 'Leadville',
  /**
   * UNCONFIRMED. The owner has not named this town's domain (10 October
   * 2026), and the brief says to ask rather than guess, so this is a
   * reserved `.invalid` name that cannot resolve. Replace it, and the email
   * below, with the Inside domain the owner owns before creating the Vercel
   * project; nothing links to a town that is not live, so until then it
   * appears nowhere a reader can see.
   */
  domain: 'leadville.unconfirmed.invalid',
  siteTitle: 'Inside Leadville',
  tagline:
    'An independent guide to Leadville, Colorado: Harrison Avenue, the silver city at 10,000 feet, the Mineral Belt Trail and the highest peaks in the state.',
  shortTagline: 'Harrison Avenue, the Mineral Belt and 10,000 feet',
  seoTagline: 'Events and trails in Leadville, Colorado',
  counties: ['Lake'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39.25056, -106.29111.
  lat: 39.2506,
  lng: -106.2911,
  population: 2633, // 2020 census
  elevationFt: 10154, // GNIS, via Wikipedia
  character: 'The Lake County seat, a statutory city of about 2,600 at 10,150 feet, with a silver-boom main street and long winters.',
  // 1878: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026) and the Wikipedia infobox (18 February 1878) agree.
  incorporated: 1878,
  population2010: 2602, // 2010 census, State Demography Office file
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
      note: 'Live state highway conditions and closures, including US 24, Colorado 91 over Fremont Pass and Colorado 82 over Independence Pass, which closes for the winter.',
    },
    {
      label: 'Pike and San Isabel National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/psicc/alerts',
      note: 'The Leadville Ranger District’s closures and fire restrictions, including on the Mount Elbert and Mount Massive trailheads.',
    },
  ],
  colors: {
    // Spruce: the grey-green of the lodgepole and spruce at ten thousand feet, greyer than Evergreen's forest green and greener than Windsor's teal. `npm run check-colors` is the gate.
    accent: '#2F6B5E',
    accentDark: '#1F4A41',
    neutralBg: '#F2F6F4',
  },
  hero: {
    image: 'hero.jpg',
    // The stand-in from scripts/templates/; a photograph is chosen at launch, with its row in IMAGE_LICENSES.csv.
    alt: 'Placeholder: no photograph of Leadville has been chosen yet',
  },
  social: {
    // Follows the domain; see the note on `domain`.
    email: 'hello@leadville.unconfirmed.invalid',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Leadville,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Leadville_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the City's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox gives colorado.gov/leadville, which answered 302 to
    // cityofleadville.colorado.gov, and that answered 404 (10 October 2026).
    // leadville-co.gov answers automated requests with 403, the way Estes
    // Park's site does. TO CONFIRM with the owner: which is the City's site.
    townSite: 'https://www.leadville-co.gov/',
    townSiteLabel: 'the City of Leadville',
  },
};
