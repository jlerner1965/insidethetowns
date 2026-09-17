import type { HubConfig } from './types';
import { towns } from './registry';

export const hub: HubConfig = {
  kind: 'hub',
  slug: 'hub',
  name: 'Inside the Towns',
  domain: 'insidethetowns.com',
  siteTitle: 'Inside the Towns',
  tagline: 'Independent community guides to the small towns of Colorado’s Front Range.',
  colors: {
    accent: '#1E3A5F',
    accentDark: '#14263F',
    neutralBg: '#F6F5F1',
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
