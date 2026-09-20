/**
 * JSON-LD builders. Keep these pure so they are easy to eyeball in tests.
 */
import type { CollectionEntry } from 'astro:content';
// Relative rather than the '@/…' alias so the module loads in plain Node and
// its builders can be unit-tested; Vite resolves both the same way.
import { getNetworkHub, liveTowns, type SiteConfig, type TownConfig } from '../config/index.ts';
import { toIsoLocal } from './dates.ts';

/**
 * The publisher graph: who runs this site, and how the eight domains relate.
 *
 * Seven separate domains look to a search engine like seven strangers. The
 * towns declare the hub as their `parentOrganization` and the hub declares
 * them as its `subOrganization`, and that reciprocal pair is what says one
 * publisher rather than a ring of sites linking to each other.
 *
 * No `logo`: the only mark that exists is an SVG favicon, and pointing at
 * something that may not validate is worse than leaving the property out.
 */
export function siteJsonLd(site: SiteConfig) {
  const url = `https://${site.domain}/`;
  const hubUrl = `https://${getNetworkHub().domain}/`;
  const organization =
    site.kind === 'hub'
      ? {
          '@type': 'Organization',
          '@id': `${url}#org`,
          name: site.siteTitle,
          url,
          description: site.tagline,
          subOrganization: liveTowns().map((t) => ({
            '@type': 'Organization',
            '@id': `https://${t.domain}/#org`,
            name: t.siteTitle,
            url: `https://${t.domain}/`,
          })),
        }
      : {
          '@type': 'Organization',
          '@id': `${url}#org`,
          name: site.siteTitle,
          url,
          description: site.tagline,
          parentOrganization: {
            '@type': 'Organization',
            '@id': `${hubUrl}#org`,
            name: getNetworkHub().siteTitle,
            url: hubUrl,
          },
          areaServed: {
            '@type': 'City',
            name: site.name,
            addressRegion: site.state,
            addressCountry: 'US',
          },
        };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: site.siteTitle,
        description: site.tagline,
        publisher: { '@id': `${url}#org` },
        inLanguage: 'en-US',
      },
    ],
  };
}

export function eventJsonLd(
  town: TownConfig,
  event: CollectionEntry<'events'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = event;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title,
    startDate: toIsoLocal(data.start),
    ...(data.end ? { endDate: toIsoLocal(data.end) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: data.venue,
      ...(data.address
        ? { address: { '@type': 'PostalAddress', streetAddress: data.address, addressLocality: town.name, addressRegion: town.state } }
        : { address: { '@type': 'PostalAddress', addressLocality: town.name, addressRegion: town.state } }),
    },
    ...(imageUrl ? { image: [imageUrl] } : {}),
    // Only when the listing records who is running it. The venue is not
    // evidence of the organiser, so an unset field emits nothing rather than
    // a guess dressed as structured data.
    ...(data.organizer
      ? {
          organizer: {
            '@type': 'Organization',
            name: data.organizer,
            ...(data.organizerUrl ? { url: data.organizerUrl } : {}),
          },
        }
      : {}),
    description: event.body?.slice(0, 300),
    url,
    ...(data.cost
      ? {
          offers: {
            '@type': 'Offer',
            url: data.url ?? url,
            ...(data.cost.toLowerCase() === 'free' ? { price: '0', priceCurrency: 'USD' } : { description: data.cost }),
          },
        }
      : {}),
  };
}

/**
 * A listing page — what is on, where to eat, what to do — as a CollectionPage.
 *
 * These pages had no markup of their own at all: they inherited the site's
 * Organization and WebSite from the layout and said nothing about themselves.
 * CollectionPage is what they actually are, and `isPartOf` pointing at the
 * site's WebSite node is the property that ties a page to its publication —
 * which is the relationship the network needs stated, town by town.
 *
 * `mainEntity` carries the list itself, capped, so the markup describes what
 * is on the page rather than asserting a catalogue that is not there. Pass
 * nothing and the property is left off rather than declaring an empty list.
 */
/** Enough to describe the page without shipping a kilobyte of markup. */
const LIST_CAP = 50;

export function collectionPageJsonLd(
  site: SiteConfig,
  page: {
    name: string;
    description: string;
    path: string;
    /** `path` is relative to this site; `url` is absolute, for the hub linking across domains. */
    items?: Array<{ name: string; path?: string; url?: string }>;
  },
) {
  const url = `https://${site.domain}/`;
  const items = page.items ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}${page.path.replace(/^\//, '')}#page`,
    url: `${url}${page.path.replace(/^\//, '')}`,
    name: page.name,
    description: page.description,
    isPartOf: { '@id': `${url}#website` },
    inLanguage: 'en-US',
    ...(items.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        // What the list actually enumerates, not what the page holds: claiming
        // 169 items and shipping 50 is a catalogue that is not there.
        numberOfItems: Math.min(items.length, LIST_CAP),
        itemListElement: items.slice(0, LIST_CAP).map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: item.url ?? `https://${site.domain}${item.path}`,
        })),
      },
    }),
  };
}

export function breadcrumbJsonLd(site: SiteConfig, trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: `https://${site.domain}${step.path}`,
    })),
  };
}

export function articleJsonLd(
  site: SiteConfig,
  article: CollectionEntry<'articles'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = article;
  const editor = getNetworkHub().editor;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt,
    datePublished: toIsoLocal(data.date),
    ...(data.updated ? { dateModified: toIsoLocal(data.updated) } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    articleSection: data.category,
    /*
     * A named person when the network has one configured, the publication
     * itself otherwise. Both are valid; the difference is that a reader and a
     * search engine can see who stands behind the piece. Never invented — if
     * no editor is set, this stays with the organisation rather than
     * attributing the work to a name nobody chose.
     */
    author: editor
      ? { '@type': 'Person', name: editor.name, ...(editor.url ? { url: editor.url } : {}) }
      : { '@id': `https://${site.domain}/#org` },
    publisher: { '@id': `https://${site.domain}/#org` },
    mainEntityOfPage: url,
    url,
  };
}

export function localBusinessJsonLd(
  town: TownConfig,
  place: CollectionEntry<'places'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = place;
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    bar: 'BarOrPub',
    coffee: 'CafeOrCoffeeShop',
    shop: 'Store',
    lodging: 'LodgingBusiness',
    park: 'Park',
    trail: 'TouristAttraction',
    venue: 'EventVenue',
    service: 'LocalBusiness',
  };
  return {
    '@context': 'https://schema.org',
    '@type': typeMap[data.type] ?? 'LocalBusiness',
    name: data.title,
    description: data.summary,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address,
      addressLocality: town.name,
      addressRegion: town.state,
    },
    ...(data.url ? { sameAs: data.url } : {}),
    ...(data.phone ? { telephone: data.phone } : {}),
    ...(data.priceRange ? { priceRange: data.priceRange } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    url,
  };
}
