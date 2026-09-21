import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const berthoud: TownConfig = {
  kind: 'town',
  slug: 'berthoud',
  name: 'Berthoud',
  domain: 'insideberthoud.com',
  siteTitle: 'Inside Berthoud',
  tagline: 'An independent guide to Berthoud, Colorado: the Garden Spot, its Main Street, the lakes, and what it’s like to move here.',
  seoTagline: 'Main Street, the lakes, Berthoud, Colorado',
  // 2020 census: about 97 per cent of the town's population in Larimer, 3 per cent in Weld.
  counties: ['Larimer', 'Weld'],
  countySplit: {
    note: 'Berthoud is overwhelmingly a Larimer County town, but annexations east of the county line put a small part of it in Weld. Worth checking on a specific address rather than assuming.',
    source: 'https://www.berthoud.org/',
    verified: '2026-09-20',
  },
  state: 'CO',
  lat: 40.3122,
  lng: -105.0611,
  population: 10332, // 2020 census
  elevationFt: 5033,
  incorporated: 1888,
  driveToDenver: 'About 50 min',
  population2010: 5105, // 2010 census, for census-to-census growth
  character: 'The Garden Spot: a real Main Street and the lakes, at Larimer prices short of Fort Collins.',
  colors: {
    // Carter Lake water under a Front Range sky, on wheat-colored paper for the
    // "Garden Spot of Colorado". Distinct from Niwot's evergreen and Lyons' sandstone.
    accent: '#1587B4',
    accentDark: '#0D5170',
    neutralBg: '#F6F3EC',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Carter Lake on a June afternoon: pines along the near shore, the hogback foothills across the water west of Berthoud, and a high cloud sky',
    credit: 'KimonBerlin, Wikimedia Commons, CC BY-SA 2.0',
  },
  social: {
    email: 'hello@insideberthoud.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Berthoud,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80513' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Berthoud_CO' },
    ],
    schoolDistrict:
      'Mostly Thompson School District R2-J: Berthoud Elementary, Ivy Stockwell Elementary, Turner Middle and Berthoud High, all in town. Weld RE-5J serves a small part of Berthoud on the Weld County side, so check the district against the address rather than the town.',
    commuteNotes:
      'About 15 minutes to Loveland or Longmont on US 287, 25 to Fort Collins, and about 50 minutes to Denver by I-25. The FLEX bus runs between Fort Collins, Loveland, Berthoud, Longmont and Boulder.',
  },
  officialLinks: {
    townSite: 'https://www.berthoud.org/',
    townSiteLabel: 'the Town of Berthoud',
    policeNonEmergency: 'https://www.larimer.gov/sheriff/patrol/berthoud-squad',
    policeNonEmergencyLabel: 'the Larimer County Sheriff’s Berthoud squad',
  },
  formspreeId: 'xjykyryq',
};
