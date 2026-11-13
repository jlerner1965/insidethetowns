/**
 * A hub town's profile (the additions of 12 November 2026): what its page
 * says beside its dates. One file per town, data/hub/towns/<slug>.json,
 * with the town's lodging, its heritage card, the transit that serves it
 * and the facts no bulk file carries (the year it was incorporated).
 *
 * The rule is the registry's: every value was read on the page named
 * beside it (`source`) on the day named beside it (`checked`), and a value
 * nobody could confirm is left out of the file. Nothing here has a
 * default, and a block with nothing in it draws nothing.
 *
 * A source is the town, the county, the managing agency, the organizer or
 * the business's own site. A guide site is never one (GUIDE_SITES), and
 * the schema refuses the ones the brief names.
 *
 * Plain data and one schema, read by the town page, the validator and the
 * tests. It never imports astro:content or node:fs.
 */
import { z } from 'astro/zod';

/** Sites that list other people's facts: never a source, never a link. */
export const GUIDE_SITES = ['uncovercolorado.com', 'tripadvisor.com', 'yelp.com', 'wikipedia.org', 'colorado.com', 'onlyinyourstate.com', 'thecrazytourist.com'];
/** Booking and affiliate sites: a place to stay links to its own site. */
export const BOOKING_SITES = ['booking.com', 'expedia.com', 'hotels.com', 'airbnb.com', 'vrbo.com', 'tripadvisor.com', 'kayak.com', 'priceline.com', 'agoda.com', 'trivago.com', 'orbitz.com', 'travelocity.com', 'hotwire.com'];

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};
const onAny = (url: string, sites: readonly string[]) => sites.some((s) => hostOf(url) === s || hostOf(url).endsWith(`.${s}`));

/** Whether a link is on a guide site (GUIDE_SITES): never a source. */
export function isGuideSite(link: string): boolean {
  return onAny(link, GUIDE_SITES);
}

const url = z.url({ protocol: /^https?$/ });
const source = url.refine((u) => !onAny(u, GUIDE_SITES), 'a guide site is not a source: the town, the county, the agency, the organizer or the business’s own page');
const own = url.refine((u) => !onAny(u, [...GUIDE_SITES, ...BOOKING_SITES]), 'link the place’s own site: no booking, affiliate or guide site');
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '"YYYY-MM-DD"');
const text = z.string().min(1);
/** Where a value was read and the day it was read. */
const read = { source, checked: day };

export const townProfileSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    /** Facts no bulk file carries. Elevation, population and the Denver miles are in data/hub/town-facts.json. */
    facts: z
      .object({
        /** The year the town was incorporated, from the town, the county or the state. */
        incorporated: z.object({ year: z.number().int().min(1850).max(2100), ...read }).strict().optional(),
        /** Elevation in feet, where the town's or an agency's page gives it and the bulk file has none. */
        elevationFt: z.object({ value: z.number().int().min(3000).max(14500), ...read }).strict().optional(),
      })
      .strict()
      .optional(),
    /** Bustang, Outrider or a local bus or train that stops in the town, from the operator's own page. */
    transit: z.array(z.object({ name: text, detail: text.max(200).optional(), url: own, ...read }).strict()).optional(),
    /** Places to stay inside the town, each linked to its own site. */
    lodging: z
      .array(
        z
          .object({
            name: text,
            /** "Hotel", "Lodge", "Cabins", "Campground", "Inn", in a word or two. */
            kind: text.max(40).optional(),
            url: own,
            /** "Year-round", or the open dates in the property's words: "Open mid-May to mid-October". */
            season: text.max(120).optional(),
            ...read,
          })
          .strict(),
      )
      .max(8)
      .optional(),
    heritage: z
      .object({
        /** Where the name comes from, in a sentence. */
        nameOrigin: z.object({ text: text.max(320), ...read }).strict().optional(),
        /** The year the town was founded, platted or settled, and which of those it is. */
        founded: z.object({ year: z.number().int().min(1500).max(2100), text: text.max(200).optional(), ...read }).strict().optional(),
        /** Three to five dated facts, oldest first. */
        timeline: z.array(z.object({ year: z.number().int().min(1000).max(2100), text: text.max(320), ...read }).strict()).max(5).optional(),
        /** The town's museums and landmarks. */
        sites: z
          .array(
            z
              .object({
                name: text,
                kind: z.enum(['museum', 'landmark']),
                url: own.optional(),
                hours: text.max(200).optional(),
                cost: text.max(200).optional(),
                /** "Year-round", or the season in the operator's words. */
                season: text.max(160).optional(),
                ...read,
              })
              .strict(),
          )
          .max(8)
          .optional(),
        ghostTowns: z.array(z.object({ name: text, text: text.max(320).optional(), url: url.optional(), ...read }).strict()).max(5).optional(),
        /** Makers based in the town: what they make, and their own site. */
        makers: z.array(z.object({ name: text, what: text.max(120), url: own, ...read }).strict()).max(6).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type TownProfile = z.infer<typeof townProfileSchema>;

/** The newest check date anywhere in a block, for its "Checked" line. */
export function newestCheck(items: ReadonlyArray<{ checked: string } | undefined>): string | undefined {
  return items
    .filter((i): i is { checked: string } => !!i)
    .map((i) => i.checked)
    .sort()
    .at(-1);
}

/** A source link's words: the site it is on. */
export function sourceHost(link: string): string {
  return hostOf(link);
}
