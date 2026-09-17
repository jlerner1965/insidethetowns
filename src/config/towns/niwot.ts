import { DEFAULT_TOWN_NAV, type TownConfig } from './types';

export const niwot: TownConfig = {
  kind: 'town',
  slug: 'niwot',
  name: 'Niwot',
  domain: 'insideniwot.com',
  siteTitle: 'Inside Niwot',
  tagline: 'An independent guide to Niwot, Colorado: what’s on, where to eat, where to walk, and what it’s like to live here.',
  county: 'Boulder',
  state: 'CO',
  lat: 40.1039,
  lng: -105.1708,
  population: 4000,
  colors: {
    // Evergreen for the cottonwood-and-foothills valley; the old townofniwot.com wordmark was an evergreen ground too.
    accent: '#2E6B4E',
    accentDark: '#1C4634',
    neutralBg: '#F5F2EA',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Hay bales in the Left Hand Valley below the foothills west of Niwot',
  },
  social: {
    email: 'hello@insideniwot.com',
  },
  nav: DEFAULT_TOWN_NAV,
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Niwot,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80503' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Niwot_CO' },
    ],
    schoolDistrict: 'St. Vrain Valley School District (Niwot Elementary, Sunset Middle, Niwot High).',
    commuteNotes:
      'About 15 minutes to Boulder and 10 to Longmont on the Diagonal Highway (CO-119); roughly 50 minutes to Denver and 45 to DIA.',
  },
  officialLinks: {
    // Niwot is unincorporated; Boulder County is the local government.
    townSite: 'https://bouldercounty.gov/',
    townSiteLabel: 'Boulder County',
    policeNonEmergency: 'https://www.bouldercounty.gov/departments/sheriff/',
  },
};
