import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

/**
 * A Clear Creek County statutory city of 1,782 at the 2020 census, 7,526
 * feet up on Clear Creek where I-70 meets the road to Mount Blue Sky: the
 * 1859 gold town with the Argo Mill, the hot springs and the trailheads
 * above the canyon. Mountain chassis; the default launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain is not
 * yet the owner's call: see `domain` below.
 */
export const idahoSprings: TownConfig = {
  kind: 'town',
  // Not live. The guide builds a holding page until the owner names the
  // domain and the first review clears the launch threshold.
  status: 'wave2',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Empty until the owner sets them: neighbours go both ways (test/nearby.test.ts),
  // so naming Evergreen and Golden here means naming Idaho Springs on theirs, which
  // is the owner's call. Proposed: georgetown (up I-70), evergreen (over Squaw Pass
  // or Floyd Hill), golden (down the canyon), black-hawk (up Virginia Canyon).
  neighbors: [],
  slug: 'idaho-springs',
  name: 'Idaho Springs',
  /**
   * UNCONFIRMED. The owner has not named this town's domain (10 October
   * 2026), and the brief says to ask rather than guess, so this is a
   * reserved `.invalid` name that cannot resolve. Replace it, and the email
   * below, with the Inside domain the owner owns before creating the Vercel
   * project; nothing links to a town that is not live, so until then it
   * appears nowhere a reader can see.
   */
  domain: 'idaho-springs.unconfirmed.invalid',
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
    // Argo Mill rust: the red-brown of the mill above the creek, redder than Elizabeth's amber and brighter than Fort Lupton's brown. `npm run check-colors` is the gate.
    accent: '#A2501C',
    accentDark: '#6E3612',
    neutralBg: '#F8F4EF',
  },
  hero: {
    image: 'hero.jpg',
    // The stand-in from scripts/templates/; a photograph is chosen at launch, with its row in IMAGE_LICENSES.csv.
    alt: 'Placeholder: no photograph of Idaho Springs has been chosen yet',
  },
  social: {
    // Follows the domain; see the note on `domain`.
    email: 'hello@idaho-springs.unconfirmed.invalid',
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
