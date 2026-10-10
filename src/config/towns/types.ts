/**
 * Every site in the network is described by one of these objects.
 * Town differences live here and in content/<town>/, never in components.
 */

import type { Paper } from '../palette.ts';

export type NavItem = { label: string; href: string };

/**
 * A guide's palette, in the roles of Color System 2.0 (src/config/palette.ts).
 * The values are the guide's own, not tuned here.
 */
export interface TownColors {
  /**
   * Hex, unique per guide. Identity and actions: the town name, links,
   * active navigation, main buttons and the dark bands, with white on them.
   * 4.5:1 on white and on the guide's paper; `npm run check-colors` proves it.
   */
  primary: string;
  /**
   * Hex. Decoration only: small rules, image placeholders, illustration.
   * Never text, an essential icon or a control's outline, so it has no
   * contrast to meet, and never a large wash.
   */
  accent: string;
  /** Which of the two shared page backgrounds the guide sits on. */
  paper: Paper;
}

export interface HeroConfig {
  /** File name inside content/<slug>/images/ (hub: content/hub/images/). */
  image: string;
  alt: string;
  credit?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  /** Published contact address for the site. */
  email: string;
}

/**
 * Where a town is on the way to being a site. `live` is the only status that
 * deploys a guide; it replaces the old hand-kept LIVE_TOWNS list. The waves
 * are the launch order in the accuracy brief, `redirect` is a domain that
 * only forwards (insidefirestone.com to the Carbon Valley guide).
 */
export const TOWN_STATUSES = ['live', 'wave1', 'wave2', 'wave3', 'wave4', 'redirect'] as const;
export type TownStatus = (typeof TOWN_STATUSES)[number];

/**
 * Which chassis a town runs on. The variant picks the freshness windows
 * (src/config/freshness.ts) and, for `mountain`, switches on the seasonal
 * and access fields a town at altitude needs. Nothing else differs.
 */
export const TOWN_VARIANTS = ['front-range', 'mountain'] as const;
export type TownVariant = (typeof TOWN_VARIANTS)[number];

/**
 * Where the hub's home page lists a town. A reader looks for their own
 * corner of the Front Range before their town, so "The towns" is grouped by
 * these, in this order, A to Z within each. It is a reader's grouping, not a
 * county one: Erie is mostly Weld but sits under Boulder County, and each
 * card still names its counties. The owner's grouping, 6 October 2026; the
 * hub reads the field and never a list of towns.
 */
export const TOWN_REGIONS = [
  'Boulder County',
  'Northern Colorado',
  'Carbon Valley & I-25',
  'Mountains & Foothills',
  'South Metro',
] as const;
export type TownRegion = (typeof TOWN_REGIONS)[number];

/**
 * Where a reader checks the roads before setting out, on a mountain guide:
 * CDOT's live map for every one, the park's conditions page for Estes Park.
 * The guide links these and never restates what they say; a closure copied
 * onto a static page is wrong by the time it is read.
 */
export interface ConditionsLink {
  /** "CDOT road conditions (COtrip)" */
  label: string;
  url: string;
  /** One short line on what the page is for, where the label is not enough. */
  note?: string;
}

export interface TownConfig {
  kind: 'town';
  /** URL-safe identifier, also the content folder name: "lyons" */
  slug: string;
  /** See TownStatus. Only `live` builds a guide. */
  status: TownStatus;
  /** See TownVariant. */
  variant: TownVariant;
  /**
   * The official road and closure pages a reader should check before driving
   * up, for the `mountain` variant: shown on Things to Do and on every trail,
   * trailhead and park page. See ConditionsLink. Absent on a Front Range guide.
   */
  conditionsLinks?: readonly ConditionsLink[];
  /** See TownRegion. */
  region: TownRegion;
  /**
   * The guides a reader here would drive to for a Saturday, as slugs, nearest
   * or most-visited first. The "Nearby this weekend" block reads its listings
   * from these and nowhere else, so the list is the owner's call, not a
   * radius: Elizabeth's is empty because every other guide is an hour away.
   */
  neighbors: readonly string[];
  /**
   * The places a multi-town guide covers, as slugs: Carbon Valley's
   * frederick, firestone and dacono. Every item on such a guide is tagged
   * with one of these. Absent on a single-town guide.
   */
  subTowns?: readonly string[];
  /**
   * What must be verified and upcoming before the guide goes live; the
   * default is DEFAULT_LAUNCH_THRESHOLD in src/config/freshness.ts. A large
   * town launching with a curated scope sets its own.
   */
  launchThreshold?: { events: number; listings: number };
  /** Display name: "Lyons" */
  name: string;
  /** Production domain without protocol: "insidelyons.com" */
  domain: string;
  /** "Inside Lyons" */
  siteTitle: string;
  /** One sentence. Shown in the hero and meta description. */
  tagline: string;
  /**
   * A few words on what the town is, shown beside its name wherever another
   * site links to it (the footer's sister guides, Nearby this weekend):
   * "Sandstone, the river, and a music festival". Not the tagline, which is
   * a sentence.
   */
  shortTagline?: string;
  /** Used in <title> when the full tagline would be truncated mid-phrase. */
  seoTagline?: string;
  /**
   * Every county the municipal boundary falls in, the one holding most of the
   * population first.
   *
   * Three of these towns straddle a county line, which a single-county field
   * quietly hid: Erie is 58% Weld and 42% Boulder, Johnstown 73% Weld and 27%
   * Larimer, Berthoud 97% Larimer and 3% Weld. Which side of the line a house
   * sits on decides its school district, its sheriff and its ballot, so the
   * guides name both rather than round to one.
   */
  counties: readonly [string, ...string[]];
  /**
   * What the county line actually means on the ground, where the town spans
   * one. Carries its own source and check date, like every other material
   * claim in this file.
   */
  countySplit?: { note: string; source: string; verified: string };
  state: 'CO';
  lat: number;
  lng: number;
  population?: number;
  /** Feet above sea level. Wikipedia's infobox, which carries the GNIS figure. */
  elevationFt?: number;
  /**
   * Year the town incorporated, or null where it never did. Niwot's null is
   * the single most useful cell in the comparison: no town government, county
   * services, and an incorporation election on the 2026 ballot.
   */
  incorporated?: number | null;
  /** Off-peak, from the town's own Moving Here guide. Short enough for a cell. */
  driveToDenver?: string;
  /** The previous decennial census, so growth is census-to-census and comparable. */
  population2010?: number;
  /**
   * Median home price, with the date and source it was read from. All three or
   * none: an unsourced, undated price is the kind of number that looks
   * authoritative for two years after it stopped being true. /moving/ only
   * draws the column when every live town has one.
   */
  medianHomePrice?: number;
  medianHomePriceAsOf?: string;
  medianHomePriceSource?: string;
  /** One line on what the town actually is, for the comparison table. */
  character?: string;
  colors: TownColors;
  fonts?: { heading?: string; body?: string };
  hero: HeroConfig;
  social: SocialLinks;
  /** Primary navigation. Override per town if needed. */
  nav: NavItem[];
  movingHere: {
    /** Zillow/Redfin/etc. link-outs. */
    listingsLinks: Array<{ label: string; url: string }>;
    schoolDistrict?: string;
    commuteNotes?: string;
  };
  /** Always link to official sources; never impersonate them. */
  officialLinks: {
    townSite: string;
    /** Label for the townSite link, e.g. "Boulder County" for unincorporated towns. */
    townSiteLabel?: string;
    policeNonEmergency?: string;
    /** What to call the policeNonEmergency link. Without it the raw URL would be the link text. */
    policeNonEmergencyLabel?: string;
  };
  /** Formspree form id for the contact form. Without it the contact page falls back to mailto. */
  formspreeId?: string;
  ga4Id?: string;
  /**
   * The town's sponsors, one per placement, each a labeled line beside the
   * editorial and never inside it — the placements /advertise/ describes.
   * Absent until someone has actually bought one; every slot stays dark
   * until then, the way the editor and the rate card do. Nothing here can
   * put a business into a listing or move one up.
   */
  sponsors?: TownSponsors;
}

/** The placements a town sells. Each renders only when set. */
export interface TownSponsors {
  /** "Presented by" on /events/ and /this-weekend/. */
  events?: Sponsor;
  /** A labeled block on /moving-here/. */
  movingHere?: Sponsor;
  /** A line at the top of the town's weekly email. */
  email?: Sponsor;
}

/** One sponsor. Text only: a logo would need a licence row and a design pass. */
export interface Sponsor {
  name: string;
  /** Where the name links. Marked rel="sponsored", as search engines ask. */
  url: string;
  /** One short line in the sponsor's words, shown after the name. Optional. */
  line?: string;
}

/**
 * The person responsible for what the network publishes.
 *
 * Optional, and everything that would name someone stays dark until it is
 * set — the masthead on /about/, the byline on an article, the author in an
 * article's structured data. That is deliberate: "independent" is the claim
 * this network rests on, and an invented editor would make it a lie, so the
 * slot is built and left empty rather than filled with a plausible name.
 *
 * `bio` should be the editor's own words. Nothing here is generated.
 */
export interface EditorConfig {
  name: string;
  /** A few sentences: enough for a reader to judge why this person would know. */
  bio: string;
  /** "Editor", "Editor and founder". Defaults to "Editor". */
  role?: string;
  /** Where corrections should go, if not the site's general address. */
  email?: string;
  /** A personal or professional page, where one exists. */
  url?: string;
  /** A photograph, a file in content/hub/images/, shown on every About page. Needs its row in IMAGE_LICENSES.csv. */
  photo?: string;
  photoAlt?: string;
}

export interface HubConfig {
  kind: 'hub';
  slug: 'hub';
  name: string;
  domain: string;
  siteTitle: string;
  tagline: string;
  /** Used in <title> when the full tagline would be truncated mid-phrase. */
  seoTagline?: string;
  colors: TownColors;
  fonts?: { heading?: string; body?: string };
  hero: HeroConfig;
  social: SocialLinks;
  nav: NavItem[];
  /** Every town in the network, live or not. The hub shows those with status `live`. */
  towns: TownConfig[];
  formspreeId?: string;
  ga4Id?: string;
  /**
   * Who runs it. Absent until a real name and a real biography exist; see
   * EditorConfig for why this is left empty rather than filled in.
   */
  editor?: EditorConfig;
  /**
   * The weekly email. Absent until a provider is set up, and every signup
   * block on every site stays dark until it appears — the same shape as
   * formspreeId, so nothing has to be half-built waiting for an account.
   */
  newsletter?: NewsletterConfig;
  /**
   * Where a reader's correction goes. /correct/ on every town posts to that
   * town's Formspree form, whose destination is set in Formspree's dashboard;
   * this address is the `mailto:` fallback where no form is configured, and
   * what the pages name. Set on 3 October 2026 at the owner's direction.
   */
  correctionsEmail?: string;
  /**
   * Vercel Web Analytics on every site in the network.
   *
   * Chosen over GA4 because the privacy page can stay true: it sets no
   * cookies (visitors are identified by a hash of the request, discarded
   * after 24 hours), and in v2 the script and its endpoints are same-origin
   * relative paths, so `script-src 'self'` already covers it and the CSP
   * does not have to be widened for a third party.
   *
   * It still has to be switched on per project in the Vercel dashboard; this
   * flag only controls whether the script is on the page and whether the
   * privacy page says so.
   */
  analytics?: boolean;
  /**
   * The day counting started, `YYYY-MM-DD`.
   *
   * Switching analytics on does not give you an audience; it gives you an
   * empty chart. /advertise/ uses this to tell a buyer how long the counter
   * has been running, and keeps quiet about audience figures until there are
   * enough weeks behind them to mean anything. The sites rebuild daily, so
   * the page moves through those states on its own.
   */
  analyticsSince?: string;
  /**
   * What a placement costs. Absent until there are numbers to stand behind,
   * and /advertise/ invites a founding-partnership conversation until then.
   * A published rate card with blanks in it is worse than no rate card: it
   * tells a buyer you have not worked it out.
   */
  rates?: AdRate[];
  /**
   * Network-wide sponsors. Same rule as a town's: absent until sold, dark
   * until then, and never inside the listings.
   *
   * `email` is the line at the top of the whole-network issue. `network` is
   * the founding network sponsor: "Nearby this weekend, presented by…" on
   * that block on every guide, and "This weekend, presented by…" on every
   * /this-weekend/ page, the hub's included. /advertise/ describes it.
   */
  sponsors?: { email?: Sponsor; network?: Sponsor };
  /**
   * The small "Site by…" credit in every site's footer strip, kept apart
   * from the editorial. Absent, it renders nothing. When `publisher` is set
   * the strip says "Published by" instead, since the same name is both.
   */
  credit?: { label: string; url: string };
  /**
   * Who publishes the network: an organisation, named on every About and
   * editorial page and at the top of the publisher graph in the structured
   * data (the hub's parentOrganization). Set at the owner's direction on 8
   * October 2026, in answer to the follow-up audit's "name the accountable
   * publisher". An organisation, not a person: `editor` stays unset.
   */
  publisher?: { name: string; url: string };
}

/** One line on the rate card. */
export interface AdRate {
  /** What it is called on the invoice. */
  name: string;
  /** Where it appears, in the reader's terms. */
  placement: string;
  /** Whole dollars. */
  price: number;
  /** What the price buys: 'month', 'quarter', 'issue'. */
  period: string;
  /** How many exist, so scarcity is stated rather than implied. */
  slots?: number;
  /** Anything a buyer would otherwise have to ask. */
  note?: string;
}

/**
 * Provider-agnostic on purpose. Buttondown and Kit both take a plain POST with
 * an email field and repeated tag fields; only the names differ, so they live
 * here rather than in the markup.
 */
export interface NewsletterConfig {
  /** Where the form posts. The provider's embed endpoint. */
  action: string;
  /** Field name for the address. Buttondown "email", Kit "email_address". */
  emailField?: string;
  /**
   * Field name for a town tag, repeated once per chosen town. Buttondown uses
   * "tag"; Kit uses "fields[town]" and takes one value, so a Kit setup wants
   * one list per town or a single combined tag.
   */
  tagField?: string;
  /** What a subscriber is tagged with when they want everything. */
  allTag?: string;
  /** The day it goes out, for the copy. */
  sendDay?: string;
}

export type SiteConfig = TownConfig | HubConfig;

/**
 * Default navigation for a town site. Towns can override `nav` in their config.
 *
 * Five sections (owner, 10 October 2026: eight items read as too many). This
 * Week and Directory keep their pages and move to the footer: the home page
 * opens on the week and links "All places", the events page has a "This
 * weekend" filter, and Eat & Drink and Things to Do hold the directory's
 * places by kind. "Towns" is not a section and sits apart, beside search.
 */
export const DEFAULT_TOWN_NAV: NavItem[] = [
  { label: 'Events', href: '/events/' },
  { label: 'Eat & Drink', href: '/eat-drink/' },
  { label: 'Things to Do', href: '/things-to-do/' },
  { label: 'Guides', href: '/guides/' },
  { label: 'Moving Here', href: '/moving-here/' },
];

/**
 * "Boulder County", or "Weld and Boulder counties" where the town spans two.
 * Lower-case "counties" is correct once it is no longer part of a proper name.
 */
export function countyLabel(town: Pick<TownConfig, 'counties'>): string {
  const [first, ...rest] = town.counties;
  if (rest.length === 0) return `${first} County`;
  return `${[...town.counties].slice(0, -1).join(', ')} and ${town.counties[town.counties.length - 1]} counties`;
}

/** "Boulder" or "Weld & Boulder", for table cells where the full phrase will not fit. */
export function countyShort(town: Pick<TownConfig, 'counties'>): string {
  return town.counties.join(' & ');
}

/** Every distinct county the network covers. */
export function countiesCovered(towns: ReadonlyArray<Pick<TownConfig, 'counties'>>): string[] {
  return [...new Set(towns.flatMap((t) => [...t.counties]))];
}
