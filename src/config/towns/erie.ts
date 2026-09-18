import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const erie: TownConfig = {
  kind: 'town',
  slug: 'erie',
  name: 'Erie',
  domain: 'insideerie.com',
  siteTitle: 'Inside Erie',
  tagline: 'An independent guide to Erie, Colorado: Briggs Street, the trails, the coal-town history, and what it’s like to move to a town that doubled.',
  county: 'Weld',
  state: 'CO',
  lat: 40.0503,
  lng: -105.05,
  population: 30038, // 2020 census
  colors: {
    // Coal-seam indigo on a warm grey paper: the town was Colorado's coal capital for
    // eighty years. Distinct from Niwot's evergreen, Lyons' sandstone and Berthoud's lake blue.
    accent: '#3D3A5C',
    accentDark: '#26243D',
    neutralBg: '#F3F1EC',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Colorado 7 running west out of Erie toward the snow-covered Front Range on a December morning',
    credit: 'Jeffrey Beall, Wikimedia Commons, CC BY 4.0',
  },
  social: {
    email: 'hello@insideerie.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Erie,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80516' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Erie_CO' },
    ],
    schoolDistrict:
      'Mostly St. Vrain Valley Schools (Erie, Red Hawk and Black Rock elementaries, Soaring Heights PK-8, Erie Middle, Erie High); the Boulder County side is Boulder Valley (Meadowlark PK-8).',
    commuteNotes:
      'About 20 minutes to Boulder on Arapahoe Road or Colorado 7, 35 to Denver and 35 to Denver International Airport by I-25 and E-470. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://www.erieco.gov/',
    townSiteLabel: 'the Town of Erie',
    policeNonEmergency: 'https://www.erieco.gov/246/Police-Department',
    policeNonEmergencyLabel: 'Erie Police Department',
  },
};
