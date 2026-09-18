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
    accent: '#2C74CC',
    accentDark: '#1B4A86',
    neutralBg: '#F4F3EF',
  },
  hero: {
    image: 'front-range-aerial.jpg',
    alt: 'The Colorado Front Range from the air: tilted sandstone slabs and forested foothills dropping away to the towns on the plains',
  },
  social: {
    email: 'hello@insidethetowns.com',
  },
  nav: [
    { label: 'This Weekend', href: '/this-weekend/' },
    { label: 'Towns', href: '/#towns' },
    { label: 'About', href: '/about/' },
    { label: 'Advertise', href: '/advertise/' },
    { label: 'Contact', href: '/contact/' },
  ],
  towns,
};
