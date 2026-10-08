/**
 * JSON-LD builders. Keep these pure so they are easy to eyeball in tests.
 */
import { openingHoursOf } from './hours.ts';
import type { CollectionEntry } from 'astro:content';
// Relative rather than the '@/…' alias so the module loads in plain Node and
// its builders can be unit-tested; Vite resolves both the same way.
import { getNetworkHub, liveTowns, type SiteConfig, type TownConfig } from '../config/index.ts';
import { dayKey, toIsoLocal } from './dates.ts';
import { exportWhen } from './events.ts';
import { isPlaceholder } from './editor.ts';

/**
 * The publisher graph: who runs this site, and how the domains relate.
 *
 * Separate domains look to a search engine like strangers. The
 * towns declare the hub as their `parentOrganization` and the hub declares
 * them as its `subOrganization`, and that reciprocal pair is what says one
 * publisher rather than a ring of sites linking to each other.
 *
 * At the top of the graph, when the hub config names one, is the publisher
 * (Lerner Works): the hub's `parentOrganization`, so every town leads to
 * the hub and the hub leads to the organisation accountable for it.
 *
 * No `logo`: the only mark that exists is an SVG favicon, and pointing at
 * something that may not validate is worse than leaving the property out.
 */
export function siteJsonLd(site: SiteConfig) {
  const url = `https://${site.domain}/`;
  const hubUrl = `https://${getNetworkHub().domain}/`;
  const publisher = getNetworkHub().publisher;
  const organization =
    site.kind === 'hub'
      ? {
          '@type': 'Organization',
          '@id': `${url}#org`,
          name: site.siteTitle,
          url,
          description: site.tagline,
          ...(publisher ? { parentOrganization: { '@type': 'Organization', name: publisher.name, url: publisher.url } } : {}),
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

/**
 * A structured price from a listing's cost line, where one can be read off
 * without guessing. "Free" (and "Free; registration required") is a price
 * of zero. One dollar figure is the price. Several ("$15; seniors $13;
 * under 18 $5", "$40–$98") are a range, lowest to highest, and a tier that
 * is free puts zero at the bottom of it. A line with no figure ("Ticketed",
 * "Tickets from the Rams ticket office") gets no number: the words go in
 * the offer's description either way, so nothing the listing says is lost.
 *
 * Google reads `price` and `priceCurrency` on an Event's offer; a text
 * description alone is not a price to it (follow-up audit, 8 October 2026).
 */
export function offerPrice(
  cost: string,
): { price: string; priceCurrency: 'USD' } | { lowPrice: string; highPrice: string; priceCurrency: 'USD' } | undefined {
  const text = cost.trim();
  if (/^free\b/i.test(text)) return { price: '0', priceCurrency: 'USD' };
  const amounts = [...text.matchAll(/\$\s?(\d+(?:\.\d{1,2})?)/g)].map((m) => Number(m[1]));
  if (/\bfree\b/i.test(text)) amounts.push(0);
  if (amounts.length === 0) return undefined;
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  const money = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  if (low === high) return { price: money(low), priceCurrency: 'USD' };
  return { lowPrice: money(low), highPrice: money(high), priceCurrency: 'USD' };
}

export function eventJsonLd(
  town: TownConfig,
  event: CollectionEntry<'events'>,
  url: string,
  imageUrl?: string,
) {
  const { data } = event;
  // As the .ics and the Google link give it: whole days by date alone, one
  // sitting by its times, and no end the listing does not have.
  const when = exportWhen(event);
  const stamp = (d: Date) => (when.allDay ? dayKey(d) : toIsoLocal(d));
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title,
    startDate: stamp(when.start),
    ...(when.end ? { endDate: stamp(when.end) } : {}),
    eventStatus:
      data.status === 'canceled'
        ? 'https://schema.org/EventCancelled'
        : data.status === 'postponed'
          ? 'https://schema.org/EventPostponed'
          : 'https://schema.org/EventScheduled',
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
    ...(data.cost ? { offers: offer(data.cost, data.url ?? url) } : {}),
  };
}

/** The offer: the cost line as written, and a number where one can be read from it. */
function offer(cost: string, url: string) {
  const price = offerPrice(cost);
  return {
    '@type': price && 'lowPrice' in price ? 'AggregateOffer' : 'Offer',
    url,
    description: cost,
    ...price,
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
  // A placeholder name is not a person to assert; the organisation stays the author.
  const person = editor && !isPlaceholder(editor.name) ? editor : undefined;
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
    author: person
      ? { '@type': 'Person', name: person.name, ...(person.url ? { url: person.url } : {}) }
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
  const hours = openingHoursOf(data);
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    bar: 'BarOrPub',
    coffee: 'CafeOrCoffeeShop',
    shop: 'Store',
    lodging: 'LodgingBusiness',
    park: 'Park',
    trail: 'TouristAttraction',
    trailhead: 'TouristAttraction',
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
    ...(hours ? { openingHours: hours } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    url,
  };
}
