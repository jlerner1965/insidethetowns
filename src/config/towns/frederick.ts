import type { TownConfig } from './types.ts';

/**
 * The Town of Frederick, Weld County: 14,513 people at the 2020 census, the
 * middle of the three coal towns of the Carbon Valley.
 *
 * Not a guide of its own. Frederick is covered by Inside Carbon Valley
 * (src/config/towns/carbon-valley.ts), with Firestone and Dacono: the
 * owner's restructure brief of 12 November 2026, and the QA brief of the
 * same day in so many words (DECISIONS.md, "Carbon Valley is the guide;
 * Frederick is covered by it"). It was a section of that guide from 5
 * October 2026 and a guide of its own, Inside Frederick at
 * insidefrederickco.com, from 2 to 12 November 2026.
 *
 * Everything Inside Frederick held moved to the Carbon Valley guide with its
 * slugs (content/carbon-valley/, data/carbon-valley/), so every path on
 * insidefrederickco.com redirects to the same path on carbonvalleyguide.com
 * (vercel.json; `retired.successor`). The config stays so the Vercel project
 * `insidefrederickco` keeps building, and keeps serving those redirects.
 * Subscribers tagged `frederick` get the Carbon Valley edition of the email
 * (scripts/lib/send-newsletter.ts).
 *
 * Figures are Frederick's own, from the Wikipedia infobox (census and GNIS),
 * read 2 November 2026.
 */
export const frederick: TownConfig = {
  kind: 'town',
  status: 'redirect',
  retired: {
    since: '2026-11-12',
    reason: 'Frederick is covered by Inside Carbon Valley, with Firestone and Dacono, and is not a guide of its own: the owner’s restructure brief of 12 November 2026.',
    // Everything moved there with its slugs, so the path is kept.
    successor: 'carbon-valley',
  },
  variant: 'front-range',
  region: 'Carbon Valley & I-25',
  neighbors: [],
  slug: 'frederick',
  name: 'Frederick',
  domain: 'insidefrederickco.com',
  siteTitle: 'Inside Frederick',
  tagline: 'Frederick, Colorado is covered by Inside Carbon Valley, the guide to Frederick, Firestone and Dacono.',
  shortTagline: 'Covered by Inside Carbon Valley',
  seoTagline: 'Frederick, Colorado, on Inside Carbon Valley',
  // Wikipedia infobox, read 2 November 2026: 2020 census 14,513; 2010 census 8,679.
  population: 14513,
  population2010: 8679,
  // GNIS, via the Wikipedia infobox: 4,938 ft (1,505 m).
  elevationFt: 4938,
  incorporated: 1907,
  // GNIS, via the Wikipedia infobox: 40°06′50″N 105°00′40″W.
  lat: 40.1139,
  lng: -105.0111,
  counties: ['Weld'],
  state: 'CO',
  colors: {
    // Golden Eagle navy, as the Carbon Valley guide's; a redirect's primary
    // is not counted against a live guide's (scripts/check-colors.ts).
    primary: '#1C2550',
    accent: '#C48B54',
    paper: 'cool',
  },
  hero: {
    // The holding page's picture: the Fifth Street photograph, a copy of the
    // Carbon Valley guide's hero, each with its row in IMAGE_LICENSES.csv.
    image: 'fifth-street-at-oak.jpg',
    alt: 'Fifth Street in old-town Frederick at Oak Street under snow in 2018: a two-story red-brick corner building with a stepped parapet, frosted bare trees, a black lamppost and a few cars on the plowed street',
    credit: 'Jared Winkler, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidefrederickco.com',
  },
  officialLinks: {
    townSite: 'https://www.frederickco.gov/',
    townSiteLabel: 'the Town of Frederick',
  },
};
