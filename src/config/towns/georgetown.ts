import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * The Clear Creek County seat, a territorial charter municipality of 1,118
 * at the 2020 census, 8,458 feet up at the head of the valley below Loveland
 * Pass: the silver town whose Victorian streets, the Georgetown Loop
 * railroad and the Guanella Pass road bring the weekend up from Denver.
 * Mountain chassis; the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insidegeorgetownco.com, is the owner's, named 10 October 2026.
 */
export const georgetown: TownConfig = {
  kind: 'town',
  // Not live. The guide builds a holding page until the owner names the
  // domain and the first review clears the launch threshold.
  status: 'wave2',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Empty until the owner sets them: neighbours go both ways (test/nearby.test.ts),
  // so naming Evergreen and Golden here means naming Georgetown on theirs, which is
  // the owner's call. Proposed: idaho-springs (thirteen miles down I-70), then
  // evergreen and golden beyond it.
  neighbors: [],
  slug: 'georgetown',
  name: 'Georgetown',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  // It carries "co", as Evergreen's does.
  domain: 'insidegeorgetownco.com',
  siteTitle: 'Inside Georgetown',
  tagline:
    'An independent guide to Georgetown, Colorado: the silver town’s Victorian streets, the Georgetown Loop, Guanella Pass and the Clear Creek County seat.',
  shortTagline: 'The silver town, the Loop railroad and Guanella Pass',
  seoTagline: 'Events and trails in Georgetown, Colorado',
  counties: ['Clear Creek'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39.71806, -105.69417.
  lat: 39.7181,
  lng: -105.6942,
  population: 1118, // 2020 census
  // GNIS, via the Wikipedia infobox; the article's lead says 8,530, so the infobox figure is used, as everywhere else.
  elevationFt: 8458,
  character: 'The Clear Creek County seat, a Victorian silver town of about 1,100 at 8,500 feet, with the Loop railroad and the Guanella Pass road.',
  // 1868: the State Demography Office's historical census file
  // (storage.googleapis.com/co-publicdata/historical-census.csv, read 10
  // October 2026). The Wikipedia infobox says 16 November 1885. The state
  // file is the official record, as for Nederland; the infobox date is
  // noted here as the odd one out.
  incorporated: 1868,
  population2010: 1034, // 2010 census, State Demography Office file
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
      note: 'Live state highway conditions and closures, including I-70, US 6 over Loveland Pass and the Guanella Pass road.',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Clear Creek Ranger District’s closures and fire restrictions, including on the Guanella Pass side.',
    },
  ],
  colors: {
    // Victorian blue: the deep blue-violet of the painted houses on Taos and Rose streets, darker than the hub's blue and greyer than Erie's indigo. `npm run check-colors` is the gate.
    accent: '#3F4F8F',
    accentDark: '#2B3661',
    neutralBg: '#F4F4F8',
  },
  hero: {
    image: 'hero.jpg',
    // The stand-in from scripts/templates/; a photograph is chosen at launch, with its row in IMAGE_LICENSES.csv.
    alt: 'Placeholder: no photograph of Georgetown has been chosen yet',
  },
  social: {
    email: 'hello@insidegeorgetownco.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Georgetown,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Georgetown_CO' },
    ],
    // schoolDistrict and commuteNotes are written at launch, from the
    // district's and the Town's own pages, with the rest of Moving Here.
  },
  officialLinks: {
    // The infobox's official site; its home page answered 200 on 10
    // October 2026 (404 6th Street, 303-569-2555 on the page).
    townSite: 'https://www.townofgeorgetown.us/',
    townSiteLabel: 'the Town of Georgetown',
  },
};
