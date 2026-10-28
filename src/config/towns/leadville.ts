import type { TownConfig } from './types.ts';

/**
 * The Lake County seat, a statutory city of 2,633 at the 2020 census and,
 * at 10,154 feet, by a
 * long way the highest guide in the network: the silver city of 1878,
 * Harrison Avenue, the Tabor Opera House, the Mineral Belt Trail and the
 * two highest peaks in the state above it. Mountain chassis; the default
 * launch threshold.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 10 October
 * 2026, as for every other town; the comments say which. The domain,
 * insideleadville.com, is the owner's, named 10 October 2026.
 */
export const leadville: TownConfig = {
  kind: 'town',
  // Live 10 October 2026, on the owner's word, under its launch threshold:
  // it publishes what is verified, and the validator and the weekly report
  // say what it is short of (docs/archive/ACCURACY-SYSTEM.md).
  status: 'live',
  // Quiet from 20 October 2026, owner's word, with the other small mountain
  // guides (DECISIONS.md, "The other mountain guides, 20 October"): pages
  // up, listings checked as the rotation reaches them, no weekly promise.
  // 19 November is before any listing's hours expire (45 days from its check
  // on the mountain chassis; the quiet-towns test holds the order).
  quiet: {
    since: '2026-10-20',
    decideBy: '2026-11-19',
    reason: 'the farthest guide from the rest of the network and a dozen events; a visitor guide from 12 October, and out of the weekly report too from 20 October, with the small mountain guides',
  },
  variant: 'mountain',
  region: 'Mountains & Foothills',
  // Nothing in the network is within an afternoon's drive of Leadville:
  // Georgetown, the nearest, is an hour and a half over Loveland Pass. Empty
  // on purpose, like Elizabeth's.
  neighbors: [],
  slug: 'leadville',
  name: 'Leadville',
  // Named by the owner on 10 October 2026, and on the owner's Cloudflare
  // nameservers (the same pair as the other guides), checked the same day.
  domain: 'insideleadville.com',
  siteTitle: 'Inside Leadville',
  tagline:
    // The highest incorporated city in the United States (Wikipedia's lead,
    // read 14 October 2026), at about 10,150 feet: GNIS gives 10,154, the
    // City 10,152, so the round figure, as the hub's table caption and the
    // character line below have it. "10,000 feet" said neither (network
    // audit, 14 October 2026).
    'An independent guide to Leadville, Colorado: Harrison Avenue, the Mineral Belt Trail and the highest incorporated city in the US, at about 10,150 feet.',
  shortTagline: 'Harrison Avenue, the Mineral Belt and the highest city in the US',
  seoTagline: 'Events and trails in Leadville, Colorado',
  counties: ['Lake'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39.25056, -106.29111.
  lat: 39.2506,
  lng: -106.2911,
  population: 2633, // 2020 census
  elevationFt: 10154, // GNIS, via Wikipedia
  character: 'The Lake County seat, a statutory city of about 2,600 at about 10,150 feet, the highest incorporated city in the United States, with a silver-boom main street and long winters.',
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
    // Alpine indigo + silver, on cool paper: Color System 2.0, 9 October 2026.
    primary: '#3D4D70',
    accent: '#A3ADBC',
    paper: 'cool',
  },
  hero: {
    image: 'hero-painted.jpg',
    alt: 'An ink-and-watercolour illustration of Leadville in autumn: the Tabor Opera House with its name across the front, the Silver Dollar Saloon’s wooden false front, the Delaware Block and the brick railroad depot under a white church spire, the Matchless Mine’s timber headframe on a mine dump, the Mineral Belt Trail through lodgepoles and gold aspens, and Turquoise Lake below the bare rust-coloured tops of the range',
    credit: 'Illustration, Inside the Towns',
    painted: true,
    // Phone: the town in frame; wide screen: the town's base above the sports strip.
    position: '92% 57%',
  },
  social: {
    email: 'hello@insideleadville.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Leadville,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Leadville_CO' },
    ],
    // The district as the guide's Moving Here page names it (13 October
    // 2026, audit F05). The comparison table shows only the words before
    // the colon. commuteNotes waits on a sourced drive time.
    schoolDistrict:
      'Lake County School District: enrollment, school assignment and transport depend on the address; the district answers those.',
  },
  officialLinks: {
    // The infobox gives colorado.gov/leadville, which answered 302 to
    // cityofleadville.colorado.gov, and that answered 404 (10 October 2026).
    // leadville-co.gov answered automated requests with 403 at first, then
    // 200 later the same day; its footer reads "City of Leadville | 800
    // Harrison Avenue", which settles that it is the City's site.
    townSite: 'https://www.leadville-co.gov/',
    townSiteLabel: 'the City of Leadville',
  },
  plausible: true,
};
