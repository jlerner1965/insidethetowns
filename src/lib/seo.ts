/**
 * JSON-LD builders. Keep these pure so they are easy to eyeball in tests.
 */
import type { CollectionEntry } from 'astro:content';
import type { SiteConfig, TownConfig } from '@/config';
import { toIsoLocal } from './dates';

export function websiteJsonLd(site: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteTitle,
    url: `https://${site.domain}/`,
    description: site.tagline,
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
