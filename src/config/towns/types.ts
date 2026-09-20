/**
 * Every site in the network is described by one of these objects.
 * Town differences live here and in content/<town>/, never in components.
 */

export type NavItem = { label: string; href: string };

export interface TownColors {
  /** Hex, unique per town. Used for links, buttons, highlights. */
  accent: string;
  /** Darker shade of accent for text on light backgrounds and hover states. */
  accentDark: string;
  /** Page background tint. Keep it close to white. */
  neutralBg: string;
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

export interface TownConfig {
  kind: 'town';
  /** URL-safe identifier, also the content folder name: "lyons" */
  slug: string;
  /** Display name: "Lyons" */
  name: string;
  /** Production domain without protocol: "insidelyons.com" */
  domain: string;
  /** "Inside Lyons" */
  siteTitle: string;
  /** One sentence. Shown in the hero and meta description. */
  tagline: string;
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
  /** Every town in the network, live or not. The hub filters by LIVE_TOWNS. */
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
   * and /advertise/ says "rates on request" until then. A published rate card
   * with blanks in it is worse than no rate card: it tells a buyer you have
   * not worked it out.
   */
  rates?: AdRate[];
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

/** Default navigation for a town site. Towns can override `nav` in their config. */
export const DEFAULT_TOWN_NAV: NavItem[] = [
  { label: 'Events', href: '/events/' },
  { label: 'Eat & Drink', href: '/eat-drink/' },
  { label: 'Things to Do', href: '/things-to-do/' },
  { label: 'Moving Here', href: '/moving-here/' },
  { label: 'About', href: '/about/' },
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
