import type { TownConfig } from './types.ts';

/**
 * The network's first city. 169,810 people at the 2020 census, the
 * fourth-largest in Colorado, and the place Timnath's, Berthoud's and
 * Johnstown's guides measure themselves against. The guide is a curated
 * selection rather than a directory — see docs/archive/EXPANSION-WINDSOR-FORT-COLLINS.md,
 * decision 3 — and every listing carries `area`, because a city reader
 * navigates by neighborhood.
 */
export const fortcollins: TownConfig = {
  kind: 'town',
  status: 'live',
  // Quiet from 20 October 2026, owner's word, with the other city guides
  // (DECISIONS.md, "The city guides, 20 October"): pages up, listings
  // checked as the rotation reaches them, no weekly promise. 29 November is
  // before any listing's hours expire (60 days from its check on the Front
  // Range chassis; the quiet-towns test holds the order).
  quiet: {
    since: '2026-10-20',
    decideBy: '2026-11-29',
    reason: "a city of 170,000 with a daily paper, Visit Fort Collins and the City's own calendar behind the official sites; the guide cannot become the go-to resource there, and its 101 events and 67 listings cost the most hours of any guide to keep honest",
  },
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['timnath', 'windsor', 'loveland'],
  slug: 'fortcollins',
  name: 'Fort Collins',
  domain: 'insidefortcollins.com',
  siteTitle: 'Inside Fort Collins',
  tagline: 'An independent guide to Fort Collins, Colorado: Old Town, the CSU campus, the Poudre, Horsetooth, the breweries, and what it’s like to live here.',
  shortTagline: 'Old Town, the Poudre, Horsetooth and the breweries',
  seoTagline: 'Events and places in Fort Collins, Colorado',
  counties: ['Larimer'],
  state: 'CO',
  lat: 40.5475,
  lng: -105.0658,
  population: 169810, // 2020 census
  elevationFt: 4997,
  // 3 February 1873, per the City's own history (history.fcgov.com/explore/city-history).
  // Wikipedia's lead gives 12 February 1883, which is a later reorganisation; the
  // City's page is the primary source here.
  incorporated: 1873,
  driveToDenver: 'About 1 hr 10 min',
  population2010: 143986, // 2010 census, for census-to-census growth
  character: 'The city the other towns measure against: Old Town, the Poudre, CSU and 169,810 people at the 2020 census.',
  colors: {
    // Fresh spruce + amber, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#1E6657',
    accent: '#D0A34B',
    paper: 'warm',
  },
  hero: {
    image: 'hero-painted.jpg',
    alt: 'An ink-and-watercolour illustration of Fort Collins on an autumn morning: the white Northern Hotel with its vertical HOTEL sign, a brick storefront, the Old Town Square building with its star, the buff-brick Opera House Block and the C&S Freight Depot under gold trees, Horsetooth Rock on the foothills beyond a hogback rimmed with red sandstone, and in front cottonwoods, a pond with reeds and a trail through the prairie grass',
    credit: 'Illustration, Inside the Towns',
    painted: true,
    // Phone: the town and Horsetooth Rock in frame; wide screen: the town's base above the sports strip.
    position: '92% 56%',
  },
  social: {
    email: 'hello@insidefortcollins.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Fort-Collins,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Fort-Collins_CO' },
    ],
    schoolDistrict:
      'Poudre School District (PSD): four comprehensive high schools (Fort Collins, Poudre, Rocky Mountain and Fossil Ridge), with the middle and elementary schools that feed them, plus the district’s option and charter schools.',
    commuteNotes:
      'Transfort runs the city buses and the MAX line down Mason Street; Bustang runs to Denver Union Station from the Downtown Transit Center. By car, I-25 is on the east edge: Loveland in twenty minutes, Greeley in thirty-five, Cheyenne in forty-five and Denver in about an hour and ten minutes off-peak.',
  },
  officialLinks: {
    townSite: 'https://www.fortcollins.gov/',
    townSiteLabel: 'the City of Fort Collins',
    policeNonEmergency: 'https://www.fortcollins.gov/Services/Police-and-Public-Safety/Police-Services',
    policeNonEmergencyLabel: 'Fort Collins Police Services',
  },
  formspreeId: 'mgavbjyp',
  plausible: true,
};
