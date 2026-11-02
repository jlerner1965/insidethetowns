import type { TownConfig } from './types.ts';

// Scaffolded 2 November 2026; the flagship config follows in this branch.
export const lafayette: TownConfig = {
  kind: 'town',
  status: 'wave1',
  variant: 'front-range',
  region: 'Boulder County',
  neighbors: ['erie', 'longmont', 'niwot'],
  slug: 'lafayette',
  name: 'Lafayette',
  domain: 'insidelafayette.com',
  siteTitle: 'Inside Lafayette',
  tagline: 'An independent guide to Lafayette, Colorado: Old Town, Waneka Lake, the Coal Creek trails and what’s on this week.',
  counties: ['Boulder'],
  state: 'CO',
  lat: 39.9936,
  lng: -105.0897,
  colors: { primary: '#1F5F5B', accent: '#B8863B', paper: 'warm' },
  hero: { image: 'hero.jpg', alt: 'TODO' },
  social: { email: 'hello@insidelafayette.com' },
  movingHere: { listingsLinks: [{ label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Lafayette,-CO_rb/' }] },
  officialLinks: { townSite: 'https://www.lafayetteco.gov/', townSiteLabel: 'the City of Lafayette' },
};
