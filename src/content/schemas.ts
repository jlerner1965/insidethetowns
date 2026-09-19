/**
 * Frontmatter schemas for the content collections. Shared between Astro's
 * content config (src/content.config.ts) and scripts/validate-content.ts so
 * there is exactly one definition of what a valid entry is.
 *
 * `image` is injected: Astro passes its image() helper (which resolves and
 * validates the file), the validator passes a plain string check.
 */
import { z } from 'astro/zod';
import { parseLocal } from '../lib/dates.ts';

/** Astro passes its image() helper (typed to ImageMetadata); the validator passes a plain string check. */
export type ImageSchema = () => z.ZodType;

export const EVENT_CATEGORIES = [
  'music',
  'market',
  'festival',
  'outdoors',
  'family',
  'food',
  'arts',
  'civic',
  'sports',
  'other',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const PLACE_TYPES = [
  'restaurant',
  'bar',
  'coffee',
  'shop',
  'trail',
  'park',
  'venue',
  'lodging',
  'service',
] as const;
export type PlaceType = (typeof PLACE_TYPES)[number];

export const EAT_DRINK_TYPES: readonly PlaceType[] = ['restaurant', 'bar', 'coffee'];
export const THINGS_TO_DO_TYPES: readonly PlaceType[] = ['trail', 'park', 'venue'];

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Music',
  market: 'Market',
  festival: 'Festival',
  outdoors: 'Outdoors',
  family: 'Family',
  food: 'Food & Drink',
  arts: 'Arts',
  civic: 'Civic',
  sports: 'Sports',
  other: 'Other',
};

/** Headings over a group of places: "Restaurants", not "Restaurant". */
export const PLACE_TYPE_PLURALS: Record<PlaceType, string> = {
  restaurant: 'Restaurants',
  bar: 'Bars & breweries',
  coffee: 'Coffee & sweets',
  shop: 'Shops',
  trail: 'Trails',
  park: 'Parks & open space',
  venue: 'Venues',
  lodging: 'Places to stay',
  service: 'Services',
};

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  restaurant: 'Restaurant',
  bar: 'Bar',
  coffee: 'Coffee & Sweets',
  shop: 'Shop',
  trail: 'Trail',
  park: 'Park',
  venue: 'Venue',
  lodging: 'Lodging',
  service: 'Service',
};

/** "2026-10-03" or "2026-10-03T10:00" in Denver time. A YAML-parsed Date is accepted too. */
const localDate = z.union([z.string(), z.date()]).transform((value, ctx) => {
  try {
    return parseLocal(value);
  } catch (err) {
    ctx.addIssue({ code: 'custom', message: (err as Error).message });
    return z.NEVER;
  }
});

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase letters, numbers and hyphens')
  .optional();

const httpUrl = z.url({ protocol: /^https?$/ });

export function eventSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      slug,
      start: localDate,
      end: localDate.optional(),
      allDay: z.boolean().default(false),
      venue: z.string().min(1),
      address: z.string().optional(),
      url: httpUrl.optional(),
      /** "Free" or a price note such as "$12 adults, kids free". */
      cost: z.string().optional(),
      category: z.enum(EVENT_CATEGORIES),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the licence asks for attribution. */
      imageCredit: z.string().optional(),
      /** Human note such as "Every Saturday through October". Display only; computed from repeat/until when absent. */
      recurring: z.string().optional(),
      /** The event happens every week on start's weekday, through `until` (inclusive). */
      repeat: z.enum(['weekly']).optional(),
      until: localDate.optional(),
      /** Replaces the computed time range on cards, e.g. "Time to be confirmed" or "Doors 6 pm, music 7 pm". */
      timeNote: z.string().optional(),
      /** The organizer's page or calendar the listing was read from. */
      source: httpUrl.optional(),
      /** The day the listing was checked against its source. */
      verified: localDate.optional(),
      featured: z.boolean().default(false),
    })
    .refine((e) => !e.end || e.end.getTime() >= e.start.getTime(), {
      message: 'end must be at or after start',
      path: ['end'],
    })
    .refine((e) => !e.until || (e.repeat && e.until.getTime() >= e.start.getTime()), {
      message: 'until requires repeat and must be at or after start',
      path: ['until'],
    })
    .refine((e) => !e.image || !!e.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    });
}

export function placeSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      slug,
      type: z.enum(PLACE_TYPES),
      address: z.string().min(1),
      /** District or landmark: "Old Town, Second Avenue", "Cottonwood Square". */
      area: z.string().optional(),
      /** Where the listing was checked: the business's own site, a directory, or a dated news report. */
      source: httpUrl.optional(),
      verified: localDate.optional(),
      url: httpUrl.optional(),
      phone: z.string().optional(),
      hours: z.string().optional(),
      /**
       * A trail map the land manager publishes, linked rather than copied.
       * Theirs stays current when a trail is rerouted or closed; a copy here
       * would freeze on the day it was taken, on pages that promise to be
       * checked against the source.
       */
      mapUrl: httpUrl.optional(),
      priceRange: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the licence asks for attribution. */
      imageCredit: z.string().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      /** One or two sentences, shown on cards. */
      summary: z.string().min(1).max(280),
    })
    .refine((p) => !p.image || !!p.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    });
}

export function articleSchema<I extends z.ZodType>(image: () => I) {
  return z
    .object({
      title: z.string().min(1),
      slug,
      date: localDate,
      updated: localDate.optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Shown under the image. Required when the licence asks for attribution. */
      imageCredit: z.string().optional(),
      excerpt: z.string().min(1).max(320),
      category: z.string().min(1),
      tags: z.array(z.string()).default([]),
    })
    .refine((a) => !a.image || !!a.imageAlt, {
      message: 'imageAlt is required when image is set',
      path: ['imageAlt'],
    });
}

/** A sent issue of the weekly email, archived as its own page. */
export function issueSchema<I extends z.ZodType>(image: () => I) {
  return z.object({
    title: z.string().min(1),
    slug,
    /** The day it went out. */
    date: localDate,
    /** Issue number, for the archive listing. */
    number: z.number().int().positive().optional(),
    excerpt: z.string().min(1).max(320),
    image: image().optional(),
    imageAlt: z.string().optional(),
    /** Shown under the image. Required when the licence asks for attribution. */
    imageCredit: z.string().optional(),
    /** Town slugs this issue went to. Empty means the whole network. */
    towns: z.array(z.string()).default([]),
  });
}

/** Free-form pages such as moving-here.md. */
export function pageSchema<I extends z.ZodType>(image: () => I) {
  return z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    image: image().optional(),
    imageAlt: z.string().optional(),
    /** Shown under the image. Required when the licence asks for attribution. */
    imageCredit: z.string().optional(),
    updated: localDate.optional(),
  });
}

export const COLLECTIONS = ['events', 'places', 'articles', 'pages', 'issues'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

export const schemaFor: Record<CollectionName, (image: ImageSchema) => z.ZodType> = {
  events: eventSchema,
  places: placeSchema,
  articles: articleSchema,
  pages: pageSchema,
  issues: issueSchema,
};
