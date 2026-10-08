import type { HubConfig } from './types.ts';
import { towns } from './registry.ts';

export const hub: HubConfig = {
  kind: 'hub',
  slug: 'hub',
  name: 'Inside the Towns',
  domain: 'insidethetowns.com',
  siteTitle: 'Inside the Towns',
  // Not "small towns": Fort Collins is a city of 170,000, and this line is also
  // the Organization description in the publisher graph (src/lib/seo.ts).
  // Not "northern" either: Elizabeth is on the Palmer Divide, south-east of
  // Denver, and a tagline that puts every guide north of the city is wrong
  // on one of them.
  tagline: 'Independent community guides to the towns of Colorado’s Front Range.',
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
  /**
   * Vercel Web Analytics, network-wide. Still has to be enabled per project
   * in the Vercel dashboard — this only puts the script on the page and lets
   * /privacy/ and /advertise/ say so.
   */
  analytics: true,
  analyticsSince: '2026-09-19',
  /**
   * Buttondown. emailField and tagField are left at their defaults ("email",
   * "tag"), which is what the account's own embed snippet uses. Town choice
   * rides as repeated `tag` fields, so a subscriber carries one tag per town
   * they picked, or `all-towns` if they wanted the lot.
   */
  newsletter: {
    action: 'https://buttondown.com/api/emails/embed-subscribe/jlerner1965',
    allTag: 'all-towns',
    sendDay: 'Thursday',
  },
  social: {
    email: 'hello@insidethetowns.com',
  },
  correctionsEmail: 'hello@insidethetowns.com',
  // No `editor`, at the owner's direction on 8 October 2026: no person is
  // named. The check lines read "Checked <date>", the About pages carry no
  // "Who runs it", and articles are authored by the publication. The
  // publisher is an organisation, Lerner Works, named below at the owner's
  // direction the same day (the follow-up audit asked who is accountable).
  publisher: { name: 'Lerner Works', url: 'https://lernerworks.com' },
  nav: [
    { label: 'This Weekend', href: '/this-weekend/' },
    { label: 'Moving Here', href: '/moving/' },
    { label: 'Newsletter', href: '/newsletter/' },
    { label: 'Towns', href: '/#towns' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
  towns,
  formspreeId: 'xeaoakgg',
  // Who built the sites, set on 5 October 2026 at the owner's direction.
  credit: { label: 'Lerner Works', url: 'https://lernerworks.com' },
};
