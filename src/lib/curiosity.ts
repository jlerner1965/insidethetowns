/**
 * The hub's town-anchored articles (the brief of 13 November 2026): one
 * file per article in content/hub/curiosity/, in two topics, Camping and
 * Ghost towns, each anchored to one town, and the one-off event article
 * (Sundance from the towns next door), which covers several.
 *
 * The rule is the town profile's (src/lib/town-profile.ts): every
 * practical fact is a value with the official page it was read on
 * (`source`) and the day it was read (`checked`), and a fact nobody could
 * confirm is left out of the file and named in `flags`. A guide site is
 * never a source. `checked` moves only when the fact is read again.
 *
 * An article is a draft until the owner sets `status: verified`. A draft
 * builds nowhere: no page, no index row, no link from a town page. The
 * one exception is the local preview switch (CURIOSITY_DRAFTS=1), which
 * is refused on Vercel as the tradition fixtures' switch is.
 *
 * Plain data and one schema, read by the collection, the route
 * integration, the pages, the validator, the report and the tests. It
 * never imports astro:content or node:fs.
 */
import { z } from 'astro/zod';
import { isGuideSite, sourceHost } from './town-profile.ts';

/** The topics with an index page, in the order the hub lists them. */
export const CURIOSITY_TOPICS = ['camping', 'ghost-towns'] as const;
export type CuriosityTopic = (typeof CURIOSITY_TOPICS)[number];
/** What an article is: one of the topics, or a one-off event article with no index of its own. */
export const CURIOSITY_KINDS = [...CURIOSITY_TOPICS, 'event'] as const;
export type CuriosityKind = (typeof CURIOSITY_KINDS)[number];

export const TOPIC_INFO: Record<CuriosityTopic, { label: string; path: string; near: (town: string) => string; intro: string; description: string }> = {
  camping: {
    label: 'Camping',
    path: '/camping/',
    near: (town) => `Camping near ${town}`,
    intro: 'Campgrounds by town: the fee, how to book, how many sites, the season with its year, the road in and who runs it, each read on the manager’s own page.',
    description: 'Camping near Colorado towns: fees, reservations, site counts, season dates, road surface and who manages each campground, every fact linked to its official source.',
  },
  'ghost-towns': {
    label: 'Ghost towns',
    path: '/ghost-towns/',
    near: (town) => `Ghost towns near ${town}`,
    intro: 'Ghost towns by town: the road, the vehicle it takes, when it can be reached, what still stands and who owns the ground, each read on an official page.',
    description: 'Ghost towns near Colorado towns: road surface, vehicle clearance, the season they can be reached, what is still standing and whether access is legal, with official sources.',
  },
};

/** The name on every article (the owner's brief, 13 November 2026). */
export const CURIOSITY_BYLINE = 'James Lerner';

/** Where the articles live. */
export const CURIOSITY_DIR = 'content/hub/curiosity';

/**
 * The preview switch: with CURIOSITY_DRAFTS=1 a local build draws the
 * drafts, each marked as one and noindex, so the owner can read a draft as
 * a page before marking it verified. Refused on Vercel outright, so no
 * deployment, preview or production, can ever show a draft.
 */
export const DRAFTS_ENV = 'CURIOSITY_DRAFTS';
export function draftsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const on = env[DRAFTS_ENV] === '1';
  if (on && env.VERCEL) {
    throw new Error(`${DRAFTS_ENV}=1 is set on Vercel. Draft articles are for local reading only and never ship.`);
  }
  return on;
}

const text = z.string().min(1);
const url = z.url({ protocol: /^https?$/ });
const source = url.refine((u) => !isGuideSite(u), 'a guide site is not a source: the land manager, the town, the county, the state park or the operator’s own page');
/** "2026-11-13", quoted or not: YAML reads an unquoted day as a date. */
const day = z.union([z.string(), z.date()]).transform((value, ctx) => {
  const s = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T12:00:00Z`))) {
    ctx.addIssue({ code: 'custom', message: '"YYYY-MM-DD"' });
    return z.NEVER;
  }
  return s;
});

/** One practical fact: what it is, the official page it was read on, and the day it was read. */
const fact = z.object({ value: text.max(480), source, checked: day }).strict();
export type Fact = z.infer<typeof fact>;

/** A season line names its year, or says the place is open all year. */
const seasonFact = fact.refine((f) => /\b(19|20)\d{2}\b/.test(f.value) || /year[- ]round/i.test(f.value), {
  message: 'a season carries its year ("May 15 to October 12, 2026") or says "year-round"',
  path: ['value'],
});

/**
 * What is still to settle on an entry: a field left empty because no
 * official page gave it, or a value the owner should look at again. One
 * line each; the report lists them (`npm run curiosity`).
 */
const flag = z.object({ field: text.max(40), note: text.max(400) }).strict();

const entryBase = {
  name: text,
  /** The manager's own page for the place: where a reader books or checks. */
  url: source.optional(),
  /** One or two sentences of our own on what the place is. No fact that is not in a field below. */
  summary: text.max(400).optional(),
  /** More facts worth a line, each labelled: "Dogs", "Day pass", "Water". */
  more: z.array(z.object({ label: text.max(40), value: text.max(480), source, checked: day }).strict()).max(6).default([]),
  /** "Skip it if…": only where an official page supports it, and that page is the source. */
  skip: fact.optional(),
  flags: z.array(flag).default([]),
};

/** The fields of a campground, in the order the page prints them. */
export const CAMPING_FIELDS = ['fee', 'booking', 'sites', 'season', 'road', 'manager'] as const;
export const CAMPING_LABELS: Record<(typeof CAMPING_FIELDS)[number], string> = {
  fee: 'Fee',
  booking: 'Reservation or first-come',
  sites: 'Sites',
  season: 'Season',
  road: 'Road surface',
  manager: 'Managed by',
};
const campground = z
  .object({
    ...entryBase,
    fee: fact.optional(),
    /** Reservations or first-come, and where to book. */
    booking: fact.optional(),
    /** How many sites, by kind where the manager says. */
    sites: fact.optional(),
    season: seasonFact.optional(),
    road: fact.optional(),
    manager: fact.optional(),
  })
  .strict();
export type Campground = z.infer<typeof campground>;

/** The fields of a ghost town, in the order the page prints them. */
export const GHOST_FIELDS = ['road', 'clearance', 'season', 'standing', 'ownership'] as const;
export const GHOST_LABELS: Record<(typeof GHOST_FIELDS)[number], string> = {
  road: 'Road surface',
  clearance: 'Vehicle clearance',
  season: 'Season reachable',
  standing: 'Still standing',
  ownership: 'Ownership and access',
};
const ghostTown = z
  .object({
    ...entryBase,
    road: fact.optional(),
    clearance: fact.optional(),
    /** When it can be reached: a road's closure, a gate, a museum's season. */
    season: fact.optional(),
    standing: fact.optional(),
    /** Who owns the ground and whether going there is legal. */
    ownership: fact.optional(),
  })
  .strict();
export type GhostTown = z.infer<typeof ghostTown>;

const placeSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'a town page’s slug or a guide’s key, as src/config/hub-towns.ts names it');

export const curiositySchema = z
  .object({
    /** The file's name, and the address of an event article: /articles/<slug>/. */
    slug: placeSlug,
    kind: z.enum(CURIOSITY_KINDS),
    /**
     * The towns the article is for: a hub town's slug or a standalone
     * guide's key. A topic article is anchored to exactly one, and its
     * address is /<topic>/<town>/; an event article names every town it
     * has a section for. Each one's page links here from its Nearby block.
     */
    towns: z.array(placeSlug).min(1),
    title: text,
    /** The <title> and share title, where the headline is not the line a searcher needs. */
    seoTitle: text.max(70).optional(),
    /** The meta description and the line under the headline. */
    description: text.max(160),
    /** `draft` until the owner has checked it; only `verified` builds. */
    status: z.enum(['draft', 'verified']).default('draft'),
    /** Whether the writer has been there. Unset, the page says "Not personally visited". */
    visited: z.boolean().default(false),
    /** The day the article was first written. */
    date: day,
    /**
     * The sources of what the prose says, where a fact is not in an
     * entry's field: an event article's every fact, a topic article's
     * introduction. Each with the day it was read.
     */
    sources: z.array(z.object({ label: text, url: source, checked: day }).strict()).default([]),
    campgrounds: z.array(campground).default([]),
    ghostTowns: z.array(ghostTown).default([]),
    /** Still to settle on the article as a whole, one line each. */
    needs: z.array(text.max(400)).default([]),
    /**
     * Read every source again from this day: an event whose plans are
     * still being published. The validator lists the article from that
     * day until every `checked` in it is on or after it.
     */
    reverify: z.object({ from: day, why: text.max(240) }).strict().optional(),
  })
  .strict()
  .refine((a) => a.kind === 'event' || a.towns.length === 1, { message: 'a topic article is anchored to one town', path: ['towns'] })
  .refine((a) => (a.kind === 'camping') === a.campgrounds.length > 0, { message: 'a camping article lists its campgrounds, and only a camping article does', path: ['campgrounds'] })
  .refine((a) => (a.kind === 'ghost-towns') === a.ghostTowns.length > 0, { message: 'a ghost-town article lists its ghost towns, and only a ghost-town article does', path: ['ghostTowns'] })
  .refine((a) => a.kind !== 'event' || a.sources.length > 0, { message: 'an event article names the source of every fact', path: ['sources'] })
  .refine((a) => a.status !== 'verified' || (a.needs.length === 0 && [...a.campgrounds, ...a.ghostTowns].every((e) => e.flags.length === 0)), {
    message: 'an article with open flags is not verified: settle each one (fill the field from its source, or delete the flag and leave the field out)',
    path: ['status'],
  });

export type CuriosityArticle = z.infer<typeof curiositySchema>;
type Entry = Campground | GhostTown;

/** The article's entries, whichever topic it is. */
export function entriesOf(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns'>): Entry[] {
  return [...a.campgrounds, ...a.ghostTowns];
}

/** Every fact in the article with a source and a day: the entries' fields and the prose's sources. */
export function factsOf(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'sources'>): Array<{ source: string; checked: string }> {
  const fields = [...new Set<string>([...CAMPING_FIELDS, ...GHOST_FIELDS])];
  const fromEntries = entriesOf(a).flatMap((e) => [
    ...fields.map((f) => (e as Record<string, unknown>)[f] as Fact | undefined).filter((f): f is Fact => !!f),
    ...e.more,
    ...(e.skip ? [e.skip] : []),
  ]);
  return [...fromEntries, ...a.sources.map((s) => ({ source: s.url, checked: s.checked }))];
}

/**
 * The article's "Last verified" day: the oldest check among its facts, so
 * the line never claims more than every fact can carry. Reading one fact
 * again moves that fact's own date; the article's moves when the oldest
 * one has been read again.
 */
export function lastVerified(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'sources' | 'date'>): string {
  return (
    factsOf(a)
      .map((f) => f.checked)
      .sort()[0] ?? a.date
  );
}

/** Where the article is on the hub. */
export function articlePath(a: Pick<CuriosityArticle, 'kind' | 'towns' | 'slug'>): string {
  return a.kind === 'event' ? `/articles/${a.slug}/` : `${TOPIC_INFO[a.kind].path}${a.towns[0]}/`;
}

/** Whether the article is on the site: verified, or a draft under the local preview switch. */
export function isShown(a: Pick<CuriosityArticle, 'status'>, env: Record<string, string | undefined> = process.env): boolean {
  return a.status === 'verified' || draftsEnabled(env);
}

/** The articles a place's Nearby block links to, the event articles last. */
export function articlesFor<A extends Pick<CuriosityArticle, 'towns' | 'kind' | 'title'>>(articles: readonly A[], place: string): A[] {
  const order = (a: A) => CURIOSITY_KINDS.indexOf(a.kind);
  return articles.filter((a) => a.towns.includes(place)).sort((x, y) => order(x) - order(y) || x.title.localeCompare(y.title));
}

export interface OpenItem {
  /** The entry it is on, or nothing for the article as a whole. */
  entry?: string;
  field: string;
  /** `empty`: a field of the brief's with no value. `flag`: a line the writer left for the owner. */
  kind: 'empty' | 'flag';
  note?: string;
}

/** The flags alone: what stops `status: verified`. */
export function openFlags(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'needs'>): OpenItem[] {
  return [
    ...a.needs.map((note): OpenItem => ({ field: 'article', kind: 'flag', note })),
    ...entriesOf(a).flatMap((e) => e.flags.map((f): OpenItem => ({ entry: e.name, field: f.field, kind: 'flag', note: f.note }))),
  ];
}

/**
 * Everything the owner has to look at before marking an article verified:
 * every flag, and every field of the brief's that an entry leaves empty
 * with no flag saying why.
 */
export function openItems(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'needs'>): OpenItem[] {
  const empty = (entry: Entry, fields: readonly string[]): OpenItem[] =>
    fields
      .filter((f) => !(entry as Record<string, unknown>)[f] && !entry.flags.some((flag) => flag.field === f))
      .map((f) => ({ entry: entry.name, field: f, kind: 'empty' as const }));
  return [...openFlags(a), ...a.campgrounds.flatMap((e) => empty(e, CAMPING_FIELDS)), ...a.ghostTowns.flatMap((e) => empty(e, GHOST_FIELDS))];
}

/** Whether the article is due to be read again (`reverify`) and has a fact not read since. */
export function reverifyDue(a: Pick<CuriosityArticle, 'reverify' | 'campgrounds' | 'ghostTowns' | 'sources' | 'date'>, today: string): boolean {
  return !!a.reverify && today >= a.reverify.from && lastVerified(a) < a.reverify.from;
}

/** A source link's words: the site it is on. */
export { sourceHost };
