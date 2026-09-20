import { DEFAULT_TOWN_NAV, type TownConfig } from './types.ts';

export const niwot: TownConfig = {
  kind: 'town',
  slug: 'niwot',
  name: 'Niwot',
  domain: 'insideniwot.com',
  siteTitle: 'Inside Niwot',
  tagline: 'An independent guide to Niwot, Colorado: what’s on, where to eat, where to walk, and what it’s like to live here.',
  counties: ['Boulder'],
  state: 'CO',
  lat: 40.1039,
  lng: -105.1708,
  population: 4306, // 2020 census, Niwot CDP
  elevationFt: 5168,
  incorporated: null, // unincorporated; a CDP under Boulder County
  driveToDenver: '45–50 min',
  population2010: 4006, // 2010 census, for census-to-census growth
  character: 'Deliberately small and still unincorporated — no town hall, and a vote on that in 2026.',
  colors: {
    // Evergreen for the cottonwood-and-foothills valley; the old townofniwot.com wordmark was an evergreen ground too.
    accent: '#108452',
    accentDark: '#0C5B39',
    neutralBg: '#F5F2EA',
  },
  hero: {
    image: 'front-range-from-the-fields.jpg',
    alt: 'Open grassland under a wide Colorado sky near Niwot, the Front Range running along the western horizon',
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
    schoolDistrict: 'St. Vrain Valley School District: Niwot Elementary, Sunset Middle (Longmont), Niwot High.',
    commuteNotes:
      'About 20 minutes to Boulder or Longmont on the Diagonal Highway (CO 119); 45–50 to Denver, about 45 to DIA. RTD’s BOLT bus stops at Niwot Road.',
  },
  officialLinks: {
    // Niwot is unincorporated; Boulder County is the local government.
    townSite: 'https://bouldercounty.gov/',
    townSiteLabel: 'Boulder County',
    policeNonEmergency: 'https://bouldercounty.gov/safety/sheriff/',
    policeNonEmergencyLabel: 'Boulder County Sheriff',
  },
};
