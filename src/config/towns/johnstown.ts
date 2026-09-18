import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const johnstown: TownConfig = {
  kind: 'town',
  slug: 'johnstown',
  name: 'Johnstown',
  domain: 'insidejohnstown.com',
  siteTitle: 'Inside Johnstown',
  tagline: 'An independent guide to Johnstown, Colorado: Parish Avenue, the parks, the sugar-town history, and what it’s like to move to one of the fastest-growing towns in the country.',
  county: 'Weld',
  state: 'CO',
  lat: 40.3369,
  lng: -104.9119,
  population: 17303, // 2020 census; 2025 estimate 22,433
  elevationFt: 4994,
  incorporated: 1907, // platted 1902
  driveToDenver: 'About 50 min',
  colors: {
    // Sugar-beet burgundy on a sugar-white paper, for the Great Western factory town.
    accent: '#BE3762',
    accentDark: '#7B1F3C',
    neutralBg: '#F5F1EE',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'A county road running west out of Johnstown toward the snow-covered Front Range in April',
    credit: 'Maarten Heerlien, Wikimedia Commons, CC BY 2.0',
  },
  social: {
    email: 'hello@insidejohnstown.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Johnstown,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80534' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Johnstown_CO' },
    ],
    schoolDistrict:
      'Weld County School District RE-5J (Elwell, Letford and Pioneer Ridge elementaries, Roosevelt Middle and Roosevelt High, all in town); the northwest corner is in Thompson R2-J.',
    commuteNotes:
      'I-25 at the US 34 interchange is on the west edge of town: about 10 minutes to Loveland, 15 to Greeley on US 34, 25 to Fort Collins, and 50 to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://johnstownco.gov/',
    townSiteLabel: 'the Town of Johnstown',
    policeNonEmergency: 'https://johnstownpolice.org/',
    policeNonEmergencyLabel: 'Johnstown Police Department',
  },
};
