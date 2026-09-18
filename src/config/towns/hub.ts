import type { HubConfig } from './types.ts';
import { towns } from './registry.ts';

export const hub: HubConfig = {
  kind: 'hub',
  slug: 'hub',
  name: 'Inside the Towns',
  domain: 'insidethetowns.com',
  siteTitle: 'Inside the Towns',
  tagline: 'Independent community guides to the small towns of Colorado’s Front Range.',
  seoTagline: 'Guides to Colorado’s Front Range towns',
  colors: {
    accent: '#2B4C7E',
    accentDark: '#1B3155',
    neutralBg: '#F4F3EF',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Foothills of the Colorado Front Range under a clear sky',
  },
  social: {
    email: 'hello@insidethetowns.com',
  },
  nav: [
    { label: 'Towns', href: '/#towns' },
    { label: 'About', href: '/about/' },
    { label: 'Advertise', href: '/advertise/' },
    { label: 'Contact', href: '/contact/' },
  ],
  towns,
};
