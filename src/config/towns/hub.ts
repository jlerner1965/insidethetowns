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
  // on one of them. Not "Front Range" alone since 10 October 2026 either:
  // Grand Lake, Leadville and the Clear Creek towns are in the mountains,
  // and two of the guides cover a few neighbouring communities together
  // (audit of 13 October 2026, F06). Grand Lake and Clear Creek have since
  // retired; Estes Park, Nederland and Leadville keep the mountains in it.
  tagline: 'Independent community guides to Colorado’s towns, on the Front Range and in the mountains.',
  // "to", not "&": a text fetch showed the title's "&amp;" raw (navigation
  // audit, 22 October 2026), and "and" runs the title past 65 characters.
  seoTagline: 'Colorado town guides: Front Range to mountains',
  colors: {
    // Front Range blue + sage, on warm paper: Color System 2.0, 9 October 2026.
    primary: '#24455D',
    accent: '#7A8A6B',
    paper: 'warm',
  },
  // The owner's photograph of the Flatirons, the full-resolution original
  // of front-range-aerial.jpg (13 November 2026): the home page shows it,
  // and it is every other hub page's share image, so /credits/ names the
  // picture the home page actually carries.
  hero: {
    image: 'front-range-flatirons.jpg',
    alt: 'The Flatirons and the foothills above Boulder from the air, with the plains and their towns beyond',
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
    // The owner's word for the flagship home pages (25 October 2026): the
    // issue goes out at 7 am. The send is the merge of Thursday's pull
    // request (newsletter-drafts.yml), so this is a promise to keep; remove
    // it and the pages name the day alone.
    sendTime: '7 am',
    // Shared editions, owner's word, 12 October 2026 (DECISIONS.md, "Regional
    // editions and visitor guides"): one issue, one box and one sponsor line
    // for towns a reader would plan a weekend across. Each guide keeps its
    // site and its subscribers' town tags; an edition goes to every tag in it.
    // The Idaho Springs and Georgetown edition ended on 20 October 2026 when
    // the two became one guide, Inside Clear Creek, an edition of its own;
    // the Loveland and Johnstown edition the same day, when Loveland went
    // quiet, so Johnstown is an edition of its own. Clear Creek's own edition
    // ended on 3 November 2026, when the owner retired the guide.
    // The Windsor, Severance and Timnath edition ended on 12 November 2026,
    // when Timnath's guide was folded into its page on the hub; Windsor is
    // an edition of its own again.
    editions: [],
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
  // The home page's order and words (13 November 2026), so the menu does not
  // change under a reader between the home and any other page; "Annual
  // events" is added after the weekend (src/lib/nav.ts, hubNav). About and
  // Contact are in the footer of every page.
  nav: [
    { label: 'This weekend', href: '/this-weekend/' },
    { label: 'Towns', href: '/#towns' },
    { label: 'Moving here', href: '/moving/' },
    { label: 'Newsletter', href: '/newsletter/' },
    { label: 'How we check', href: '/editorial/' },
  ],
  towns,
  formspreeId: 'xeaoakgg',
  // Who built the sites, set on 5 October 2026 at the owner's direction.
  credit: { label: 'Lerner Works', url: 'https://lernerworks.com' },
};
