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
  county: string;
  state: 'CO';
  lat: number;
  lng: number;
  population?: number;
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
  };
  /** Formspree form id for the contact form. Without it the contact page falls back to mailto. */
  formspreeId?: string;
  ga4Id?: string;
}

export interface HubConfig {
  kind: 'hub';
  slug: 'hub';
  name: string;
  domain: string;
  siteTitle: string;
  tagline: string;
  colors: TownColors;
  fonts?: { heading?: string; body?: string };
  hero: HeroConfig;
  social: SocialLinks;
  nav: NavItem[];
  /** Every town in the network, live or not. The hub filters by LIVE_TOWNS. */
  towns: TownConfig[];
  formspreeId?: string;
  ga4Id?: string;
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
