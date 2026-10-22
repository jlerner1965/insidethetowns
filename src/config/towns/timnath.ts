import type { TownConfig } from './types.ts';

export const timnath: TownConfig = {
  kind: 'town',
  status: 'live',
  variant: 'front-range',
  region: 'Northern Colorado',
  neighbors: ['fortcollins', 'windsor'],
  slug: 'timnath',
  name: 'Timnath',
  domain: 'insidetimnath.com',
  siteTitle: 'Inside Timnath',
  tagline: 'An independent guide to Timnath, Colorado: Old Town Main Street, the reservoir and the river trail, and what it’s like to move to a town that grew tenfold.',
  shortTagline: 'Old Town Main Street, the reservoir and the river trail',
  seoTagline: 'Events, the reservoir and trails in Timnath, CO',
  // 99.9 per cent of the town's population is in Larimer; a sliver of annexed
  // land east of the county line is in Weld, too small to name as a second county.
  counties: ['Larimer'],
  state: 'CO',
  lat: 40.5333,
  lng: -104.9644,
  population: 6487, // 2020 census; 2025 estimate about 11,600
  elevationFt: 4869,
  incorporated: 1920,
  driveToDenver: 'About 1 hr',
  population2010: 625, // 2010 census, for census-to-census growth
  character: 'A farm village that grew tenfold between the 2010 and 2020 censuses, mostly since the Costco.',
  colors: {
    // Cub blue, the school's colour as the guide's (22 October 2026, owner's
    // call that a guide matches its high school): MaxPreps's team data gives
    // 1580A5, darkened 10% to clear the warm paper and the amber notice wash. The gold is the Cubs' too.
    primary: '#137495',
    accent: '#C8880A',
    paper: 'warm',
  },
  hero: {
    image: 'sunrise.jpg',
    alt: 'Sunrise through bare cottonwoods over a frozen pond in Timnath',
    credit: 'USFWS Mountain-Prairie, Wikimedia Commons, CC BY 2.0',
  },
  social: {
    email: 'hello@insidetimnath.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Timnath,-CO_rb/' },
      { label: 'Homes for sale on Redfin', url: 'https://www.redfin.com/zipcode/80547' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Timnath_CO' },
    ],
    schoolDistrict:
      'Poudre School District: Timnath Elementary in Old Town, Bethke Elementary, and Timnath Middle-High School on Prospect Road, all in town.',
    commuteNotes:
      'Harmony Road meets I-25 at the west edge of town: about 10 minutes to south Fort Collins, 20 to Loveland or Old Town Fort Collins, 15 to Windsor and about an hour to Denver. Most commutes are by car.',
  },
  officialLinks: {
    townSite: 'https://timnath.org/',
    townSiteLabel: 'the Town of Timnath',
    policeNonEmergency: 'https://timnath.org/public-safety/',
    policeNonEmergencyLabel: 'Timnath public safety',
  },
  formspreeId: 'xzezegre',
};
