import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const berthoud: TownConfig = {
  kind: 'town',
  slug: 'berthoud',
  name: 'Berthoud',
  domain: 'insideberthoud.com',
  siteTitle: 'Inside Berthoud',
  tagline: 'An independent guide to Berthoud, Colorado: the Garden Spot, its Main Street, the lakes, and what it’s like to move here.',
  county: 'Larimer',
  state: 'CO',
  lat: 40.3122,
  lng: -105.0611,
  population: 10332, // 2020 census
  colors: {
    // Carter Lake water under a Front Range sky, on wheat-coloured paper for the
    // "Garden Spot of Colorado". Distinct from Niwot's evergreen and Lyons' sandstone.
    accent: '#2A5D78',
    accentDark: '#1B3F52',
    neutralBg: '#F6F3EC',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Carter Lake on a June afternoon, with the hogback foothills across the water west of Berthoud',
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
      'Thompson School District R2-J: Berthoud Elementary, Ivy Stockwell Elementary, Turner Middle and Berthoud High, all in town.',
    commuteNotes:
      'About 15 minutes to Loveland or Longmont on US 287, 25 to Fort Collins, and about 50 minutes to Denver by I-25. The FLEX bus runs between Fort Collins, Loveland, Berthoud, Longmont and Boulder.',
  },
  officialLinks: {
    townSite: 'https://www.berthoud.org/',
    townSiteLabel: 'the Town of Berthoud',
    policeNonEmergency: 'https://www.larimer.gov/sheriff/patrol/berthoud-squad',
  },
};
