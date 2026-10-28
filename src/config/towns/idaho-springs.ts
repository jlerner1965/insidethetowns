import type { TownConfig } from './types.ts';

/**
 * Three towns on one guide, since 20 October 2026: Idaho Springs, Georgetown
 * and Black Hawk, the I-70 and Clear Creek corridor west of Golden, the way
 * Carbon Valley covers Frederick, Firestone and Dacono. Each had a guide of
 * its own from 10 to 20 October; the three together had a dozen to seventeen
 * events apiece, Idaho Springs and Georgetown already shared a county, a
 * library district, a recreation district, a school district and a Forest
 * Service ranger district (and an email edition), and Black Hawk was a
 * visitor guide with no weekly of its own (DECISIONS.md, "Georgetown and
 * Black Hawk join Idaho Springs on one Clear Creek guide"). Every event and
 * place here carries a `subTown`, and the site has a section page per town.
 *
 * The slug, the folder, the Vercel project and the domain stay Idaho
 * Springs's (insideidahosprings.com, the owner's, named 10 October 2026): the
 * largest of the three and the one with the search history. The name and the
 * title are the corridor's. The retired insidegeorgetownco.com and
 * insideblackhawk.com point at /georgetown/ and /black-hawk/ (docs/REDIRECTS.md).
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
  // Hawk joined on 20 October 2026.
  status: 'live',
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Evergreen over Floyd Hill and Golden down the canyon, as before; Nederland
  // by the Peak to Peak from Black Hawk. Georgetown and Black Hawk are no
  // longer neighbours: they are sections of this guide.
  neighbors: ['evergreen', 'golden', 'nederland'],
  subTowns: ['idaho-springs', 'georgetown', 'black-hawk'],
  slug: 'idaho-springs',
  name: 'Clear Creek',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  // The guide outgrew the name on 20 October; the domain stays until the
  // owner names another, and insidegeorgetownco.com and insideblackhawk.com
  // redirect here.
  domain: 'insideidahosprings.com',
  siteTitle: 'Inside Clear Creek',
  tagline:
    'An independent guide to Idaho Springs, Georgetown and Black Hawk, Colorado: the Argo Mill, the Loop railroad, the casinos and the roads above Clear Creek.',
  shortTagline: 'Idaho Springs, Georgetown and Black Hawk on one guide',
  // The home title's room ends at exactly three names and the state's two letters.
  seoTagline: 'Idaho Springs, Georgetown and Black Hawk, CO',
  // Idaho Springs and Georgetown are Clear Creek County; Black Hawk is Gilpin.
  counties: ['Clear Creek', 'Gilpin'],
  countySplit: {
    note: 'Idaho Springs and Georgetown, the county seat, are in Clear Creek County; Black Hawk, over Virginia Canyon or up Clear Creek Canyon from Golden, is in Gilpin County, with its own school district, library and sheriff. The guide covers both counties; no county line runs through any of the three towns.',
    // The State Demography Office's historical census file lists each
    // municipality with its county of incorporation: Black Hawk, Gilpin;
    // Georgetown and Idaho Springs, Clear Creek.
    source: 'https://storage.googleapis.com/co-publicdata/historical-census.csv',
    verified: '2026-10-20',
  },
  state: 'CO',
  // Idaho Springs: GNIS, via the Wikipedia infobox: 39.74667, -105.48056. The
  // middle of the three by road: Georgetown is 13 miles up I-70, Black Hawk
  // 9 miles up Virginia Canyon.
  lat: 39.7467,
  lng: -105.4806,
  // 2020 census, the three summed: Idaho Springs 1,782 + Georgetown 1,118 + Black Hawk 127.
  population: 3027,
  elevationFt: 7526, // Idaho Springs, GNIS via Wikipedia; Georgetown is 8,458 and Black Hawk 8,058.
  character:
    'Three gold and silver towns on the I-70 corridor west of Golden, about 3,000 people together: Idaho Springs on Clear Creek, Georgetown at the head of the valley and Black Hawk in Gregory Gulch.',
  // 1864: Black Hawk's, the earliest of the three in the State Demography
  // Office's historical census file (Georgetown 1868, Idaho Springs 1878), so
  // the comparison reads "since 1864", as Carbon Valley reads from Frederick's.
  incorporated: 1864,
  // 2010 census, summed: Idaho Springs 1,717 + Georgetown 1,034 + Black Hawk 118 (State Demography Office file).
  population2010: 2869,
  /**
   * Where a reader checks the roads before setting out. Official pages,
   * linked live on Things to Do and every trail, trailhead and park page;
   * the guide never restates what they say. The three guides' lists, made
   * one: each URL answered 200 to a request on 10 October 2026.
   */
  conditionsLinks: [
    {
      label: 'CDOT road conditions (COtrip)',
      url: 'https://www.cotrip.org/',
      note: 'Live state highway conditions and closures: I-70, US 6 over Loveland Pass, Colorado 103 (the Mount Blue Sky road from Idaho Springs), the Guanella Pass road, Colorado 119 (Clear Creek Canyon) and Colorado 72 (the Peak to Peak).',
    },
    {
      label: 'Arapaho and Roosevelt National Forests: alerts',
      url: 'https://www.fs.usda.gov/r02/arp/alerts',
      note: 'The Clear Creek Ranger District’s closures and fire restrictions, including the Guanella Pass side and the forest around Black Hawk and Central City.',
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
    image: 'hero-painted.jpg',
    alt: 'An ink-and-watercolour illustration of Idaho Springs in autumn: wooded hillsides with pines, granite outcrops and gold aspen, the Charlie Tayler waterwheel, the Miner Street blocks with Beau Jo’s, the 1890 Hanchett Building and the tile-roofed building at 1401 Miner Street, the red Argo Gold Mine and Mill stepping up its hill, and Clear Creek in front',
    credit: 'Illustration, Inside the Towns',
    painted: true,
    // Phone: the town in frame; wide screen: the town's base above the sports strip.
    position: '94% 57%',
  },
  social: {
    email: 'hello@insideidahosprings.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale in Idaho Springs on Zillow', url: 'https://www.zillow.com/homes/Idaho-Springs,-CO_rb/' },
      { label: 'Homes for sale in Georgetown on Zillow', url: 'https://www.zillow.com/homes/Georgetown,-CO_rb/' },
      { label: 'Homes for sale in Black Hawk on Zillow', url: 'https://www.zillow.com/homes/Black-Hawk,-CO_rb/' },
    ],
    // Idaho Springs and Georgetown are Clear Creek RE-1 (each guide's Moving
    // Here page, 13 October 2026, audit F05); Black Hawk is Gilpin County
    // RE-1, one campus. The comparison table shows only the words before the
    // colon, so the split is said before it. commuteNotes waits on a sourced
    // drive time.
    schoolDistrict:
      'Mostly Clear Creek School District RE-1: Idaho Springs and Georgetown, at 320 Highway 103 in Idaho Springs, on a four-day week with optional Enrichment Fridays; Black Hawk is in Gilpin County School District RE-1, one campus at 10595 Highway 119. Ask about the school assignment and transport for the address.',
  },
  officialLinks: {
    // Idaho Springs's, the largest town's; the section pages link each town's own.
    // It answered automated requests with 403 when the town was scaffolded on
    // 10 October 2026, then 200 to the robots-aware reader later that day.
    townSite: 'https://www.idahospringsco.com/',
    townSiteLabel: 'the City of Idaho Springs',
    also: [
      // Its home page answered 200 on 10 October 2026 (404 6th Street, 303-569-2555 on the page).
      { label: 'the Town of Georgetown', url: 'https://www.townofgeorgetown.us/' },
      // 403 to automated requests on 10 October 2026, then 200 to the robots-aware reader.
      { label: 'the City of Black Hawk', url: 'https://www.cityofblackhawk.org/' },
    ],
  },
  plausible: true,
};
