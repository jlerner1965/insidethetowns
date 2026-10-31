import type { TownConfig } from './types.ts';

/**
 * The Douglas County seat, a home-rule town of 73,158 at the 2020 census (up
 * from 48,231 in 2010) and the network's third-largest guide after Fort
 * Collins and Longmont. Like them a curated guide rather than a directory:
 * downtown, food and drink, the parks and open space. The launch threshold
 * is higher than a small town's for that reason.
 *
 * Figures are from the Wikipedia infobox (census and GNIS), read 6 October
 * 2026, as for every other town; the comments say which. The domain is the
 * one on the owner's Cloudflare nameservers (the same pair as the other
 * thirteen), confirmed 6 October 2026.
 */
export const castleRock: TownConfig = {
  kind: 'town',
  // Live from 31 October 2026, the owner's word ("lets get castle rock off
  // staged"), after a holding page since 6 October. It opens quiet, as the
  // other city guides have been since 20 October (DECISIONS.md, "Castle Rock
  // live, quiet, 31 October"), and under its events threshold (18 of 25 that
  // day): pages up and indexed, listings checked as the rotation reaches
  // them, no weekly email. 29 November is before any listing's hours expire
  // (60 days from the 6 October checks: 5 December); the quiet-towns test
  // holds the order.
  status: 'live',
  quiet: {
    since: '2026-10-31',
    decideBy: '2026-11-29',
    reason: "a town of 73,000 between Denver and Colorado Springs with the Town's own calendar, the Chamber and Visit Castle Rock behind it, an hour from every guide in the email; it opens to be read and counted, like the other city guides, until the 90-day test decides what the network keeps",
  },
  variant: 'front-range',
  region: 'South Metro',
  neighbors: ['elizabeth', 'manitou-springs'],
  // Set with the brief, 6 October 2026: upcoming events / open listings.
  // Listings lowered from 30 to 29 by the owner on 6 October 2026, the Town's own
  // parks and facilities being unreadable by automated means.
  launchThreshold: { events: 25, listings: 29 },
  slug: 'castle-rock',
  name: 'Castle Rock',
  domain: 'insidecastlerockco.com',
  siteTitle: 'Inside Castle Rock',
  tagline:
    'An independent guide to Castle Rock, Colorado: downtown under the Rock, Philip S. Miller Park, the trails, and life between Denver and Colorado Springs.',
  shortTagline: 'Downtown under the Rock, Philip S. Miller Park and the open space',
  seoTagline: 'Events and places in Castle Rock, Colorado',
  counties: ['Douglas'],
  state: 'CO',
  // GNIS, via the Wikipedia infobox: 39°22′20″N 104°52′30″W.
  lat: 39.3722,
  lng: -104.875,
  population: 73158, // 2020 census
  elevationFt: 6224, // GNIS, via Wikipedia
  // 14 April 1881, per the Wikipedia infobox (founded 1874).
  incorporated: 1881,
  population2010: 48231, // 2010 census, for census-to-census growth
  colors: {
    // Not in Color System 2.0 (9 October 2026), which covers the guides
    // then live or launching. A placeholder in its roles until the owner
    // gives Castle Rock a palette: the rhyolite rose it had, its dark shade
    // as the primary, on warm paper. It launched with it on 31 October 2026;
    // choosing one is the owner's, by the 29 November decision (it sits
    // close to Johnstown and Loveland).
    primary: '#6E3647',
    accent: '#A0546A',
    paper: 'warm',
  },
  hero: {
    image: 'hero.jpg',
    alt: 'Wilcox Street in downtown Castle Rock in winter: brick storefronts, parked cars and strings of lights crossing the street',
    // Attribution required by the photograph’s licence; see IMAGE_LICENSES.csv. Chosen 7 October 2026.
    credit: 'Jared Winkler, Wikimedia Commons, CC BY-SA 4.0',
  },
  social: {
    email: 'hello@insidecastlerockco.com',
  },
  movingHere: {
    listingsLinks: [
      { label: 'Homes for sale on Zillow', url: 'https://www.zillow.com/homes/Castle-Rock,-CO_rb/' },
      { label: 'Homes for sale on Realtor.com', url: 'https://www.realtor.com/realestateandhomes-search/Castle-Rock_CO' },
    ],
    // Douglas County School District (dcsdk12.org, read 6 October 2026).
    // commuteNotes are written at launch with the rest of the Moving Here guide.
    schoolDistrict: 'Douglas County School District RE-1, based in Castle Rock.',
  },
  officialLinks: {
    townSite: 'https://www.crgov.com/',
    townSiteLabel: 'the Town of Castle Rock',
    // The Town's police page, given by the owner on 7 October 2026. crgov.com
    // answers automated requests with 403, so the number is not read here; the
    // page carries it.
    policeNonEmergency: 'https://www.crgov.com/3454/Castle-Rock-Police',
    policeNonEmergencyLabel: 'Castle Rock Police Department',
  },
  // Counted from launch, as every live guide has been since 22 October 2026;
  // the site has to be added in Plausible's dashboard before the first view
  // lands.
  plausible: true,
};
