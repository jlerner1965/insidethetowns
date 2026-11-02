import type { TownConfig } from './types.ts';

/**
 * Two towns on one guide: Idaho Springs and Georgetown, the I-70 and Clear
 * Creek corridor west of Golden. Each had a guide of its own from 10 to 20
 * October 2026; the two already shared a county, a library district, a
 * recreation district, a school district and a Forest Service ranger
 * district (and an email edition), so they became one guide on 20 October
 * (DECISIONS.md, "Georgetown and Black Hawk join Idaho Springs on one Clear
 * Creek guide"). Black Hawk, in Gilpin County, was a third section from
 * that day until 2 November 2026, when the owner retired it: its listings
 * left this folder and insideblackhawk.com forwards to the hub (DECISIONS.md,
 * "Black Hawk and Carbon Valley close; Lafayette and Frederick open"). Every
 * event and place here carries a `subTown`, and the site has a section page
 * per town.
 *
 * The slug, the folder, the Vercel project and the domain stay Idaho
 * Springs's (insideidahosprings.com, the owner's, named 10 October 2026): the
 * larger of the two and the one with the search history. The name and the
 * title are the corridor's. The retired insidegeorgetownco.com points at
 * /georgetown/ (docs/REDIRECTS.md).
 *
 * Figures are each town's own, from the Wikipedia infobox (census and GNIS)
 * read 10 October 2026, and from the State Demography Office's historical
 * census file read 20 October 2026, summed where the config wants one
 * number; the comments say which. The point, the elevation, the colours and
 * the hero stay Idaho Springs's.
 */
export const idahoSprings: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/archive/ACCURACY-SYSTEM.md). Georgetown and Black
  // Hawk joined on 20 October 2026; Black Hawk left on 2 November.
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Evergreen over Floyd Hill and Golden down the canyon, as before; Nederland
  // by the Peak to Peak. Georgetown is no longer a neighbour: it is a section
  // of this guide.
  neighbors: ['evergreen', 'golden', 'nederland'],
  subTowns: ['idaho-springs', 'georgetown'],
  slug: 'idaho-springs',
  name: 'Clear Creek',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  // The guide outgrew the name on 20 October; the domain stays until the
  // owner names another, and insidegeorgetownco.com redirects here.
  domain: 'insideidahosprings.com',
  siteTitle: 'Inside Clear Creek',
  tagline:
    'An independent guide to Idaho Springs and Georgetown, Colorado: the Argo Mill, the Loop railroad, Guanella Pass and the roads above Clear Creek.',
  shortTagline: 'Idaho Springs and Georgetown on one guide',
  seoTagline: 'Idaho Springs and Georgetown, Colorado',
  // Both are Clear Creek County municipalities; Georgetown is the county seat.
  counties: ['Clear Creek'],
  state: 'CO',
  // Idaho Springs: GNIS, via the Wikipedia infobox: 39.74667, -105.48056.
  // Georgetown is 13 miles up I-70.
  lat: 39.7467,
  lng: -105.4806,
  // 2020 census, the two summed: Idaho Springs 1,782 + Georgetown 1,118.
  population: 2900,
  elevationFt: 7526, // Idaho Springs, GNIS via Wikipedia; Georgetown is 8,458.
  character:
    'Two gold and silver towns on the I-70 corridor west of Golden, about 2,900 people together: Idaho Springs on Clear Creek and Georgetown at the head of the valley.',
  // 1868: Georgetown's, the earlier of the two in the State Demography
  // Office's historical census file (Idaho Springs 1878), so the comparison
  // reads "since 1868".
  incorporated: 1868,
  // 2010 census, summed: Idaho Springs 1,717 + Georgetown 1,034 (State Demography Office file).
  population2010: 2751,
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. The two guides' lists, made
   * one: each URL answered 200 to a request on 10 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures: I-70, US 6 over Loveland Pass, Colorado 103 (the Mount Blue Sky road from Idaho Springs), the Guanella Pass road and Colorado 119 (Clear Creek Canyon).',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Clear Creek Ranger District’s closures and fire restrictions, including the Guanella Pass side.',
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
    // Bought from Adobe Stock on 30 October 2026 (docs/HERO-PHOTOS.md), in
    // place of the Argo mill alone: the mill with the town and the creek. A
    // standard licence, so no credit on the photograph; /credits/ names it.
    image: 'AdobeStock_413103868.jpeg',
    alt: 'Idaho Springs from the air on a January morning in 2021: the red Argo Gold Mine and Mill on the hillside at the right, Clear Creek and a riverside park below it, the town’s streets and houses climbing the canyon at the left, and dry, pine-dotted mountainsides all around',
    credit: 'Jacob Boomsma, Adobe Stock',
    // Wide screen: the houses, the creek and the top of the mill, not the near parking lots.
    position: '50% 45%',
  },
  social: {
    email: 'hello@insideidahosprings.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale in Idaho Springs on Zillow', url: 'https://www.zillow.com/homes/Idaho-Springs,-CO_rb/' },
      { label: 'Homes for sale in Georgetown on Zillow', url: 'https://www.zillow.com/homes/Georgetown,-CO_rb/' },
    ],
    // Idaho Springs and Georgetown are Clear Creek RE-1 (each guide's Moving
    // Here page, 13 October 2026, audit F05). commuteNotes waits on a sourced
    // drive time.
    schoolDistrict:
      'Clear Creek School District RE-1, at 320 Highway 103 in Idaho Springs, on a four-day week with optional Enrichment Fridays. Ask about the school assignment and transport for the address.',
  },
  officialLinks: {
    // Idaho Springs's, the larger town's; the section pages link each town's own.
    // It answered automated requests with 403 when the town was scaffolded on
    // 10 October 2026, then 200 to the robots-aware reader later that day.
    townSite: 'https://www.idahospringsco.com/',
    townSiteLabel: 'the City of Idaho Springs',
    also: [
      // Its home page answered 200 on 10 October 2026 (404 6th Street, 303-569-2555 on the page).
      { label: 'the Town of Georgetown', url: 'https://www.townofgeorgetown.us/' },
    ],
  },
  plausible: true,
};
