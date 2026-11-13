/**
 * The hub's town-anchored articles (the brief of 13 November 2026): one
 * file per article in content/hub/curiosity/, in two topics, Camping and
 * Ghost towns, each anchored to one town, and the one-off event article
 * (Sundance from the towns next door), which covers several; and, since 13
 * November 2026, a story: a piece of news worth a reader's time (Nederland
 * and Eldora), shown under "In the towns" on the hub's home for a fortnight
 * or until `homeUntil`, and kept at its address after that.
 *
 * The rule is the town profile's (src/lib/town-profile.ts): every
 * practical fact is a value with the official page it was read on
 * (`source`) and the day it was read (`checked`), and a fact nobody could
 * confirm is left out of the file and named in `flags`. A guide site is
 * never a source. `checked` moves only when the fact is read again. A
 * story may rest on a named news report (the Colorado Sun, BusinessDen):
 * the town need not have published its own record first (the owner, 13
 * November 2026). It names each report, links it and gives the day it was
 * read, like any other source.
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
/** What an article is: one of the topics, a one-off event article, or a story (news); the last two have no index of their own. */
export const CURIOSITY_KINDS = [...CURIOSITY_TOPICS, 'event', 'story'] as const;
export type CuriosityKind = (typeof CURIOSITY_KINDS)[number];

/** An event article or a story: at /articles/<slug>/, naming any number of towns, every fact from its listed sources. */
export function isStandalone(kind: CuriosityKind): kind is 'event' | 'story' {
  return kind === 'event' || kind === 'story';
}

/** How long a story is on the hub's home after its date, where it gives no `homeUntil`. */
export const STORY_HOME_DAYS = 14;

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

/**
 * The name on every article: the studio, not a person (the owner, 13 November
 * 2026: "remove my name from all articles; if needed say by Lerner Works").
 */
export const CURIOSITY_BYLINE = 'Lerner Works';

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
const flag = z.object({ field: text.max(40), note: text.max(600) }).strict();

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

/**
 * A game an event article follows: a playoff schedule that turns into
 * results (the football playoffs brief, 13 November 2026). The page draws
 * the games first, a table on a wide screen and one card per game on a
 * phone, grouped by weekend with the newest first, so last week's results
 * stay on the page under this week's games.
 *
 * Preview to result, one game at a time:
 *   1. Before kickoff the game is `scheduled`, with the venue only where
 *      CHSAA's game page or the host's ticket listing names one; without
 *      it the page says "Venue not yet confirmed" and links the game page.
 *   2. When CHSAA's game page posts the final, set `status: final`, both
 *      `score`s, `next` (who advances, and to which game, once CHSAA's
 *      bracket names it) and `checked`. A score read anywhere else waits.
 *   3. Move the article's `updated` only for a change like that, and add
 *      the next round's games as CHSAA posts them; nothing is deleted.
 * There is no "live": the page has no live source, so a game in progress
 * stays `scheduled` until its final is posted.
 */
export const GAME_STATUSES = ['scheduled', 'postponed', 'final'] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

/** A Denver wall-clock time, as the content files write one: "2026-11-13T19:00". */
const wallClock = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, '"YYYY-MM-DDTHH:MM", Denver time');
const anchor = z.string().regex(/^#[a-z0-9]+(?:-[a-z0-9]+)*$/, 'an anchor on the page: "#find-your-team"');

const gameTeam = z
  .object({
    /** As CHSAA's bracket names the school: "Fort Collins", "Douglas County". */
    name: text.max(60),
    seed: z.number().int().min(1).max(32),
    /** The article's section for the team, where it has one: the schedule links the name to it. */
    section: anchor.optional(),
    /** The final score: only a final game carries one. */
    score: z.number().int().min(0).optional(),
  })
  .strict();

const game = z
  .object({
    /** "5A", "2A". */
    class: text.max(8),
    /** "Second round", "Quarterfinal". */
    round: text.max(40),
    kickoff: wallClock,
    home: gameTeam,
    away: gameTeam,
    /** The stadium, as CHSAA's game page or the host's ticket listing names it. Left out, the page says "Venue not yet confirmed". */
    venue: text.max(120).optional(),
    status: z.enum(GAME_STATUSES).default('scheduled'),
    /** CHSAA's game page: the official listing, and the page a final is read on. */
    url: source,
    /** The host's ticket page, where CHSAA's game page links one. */
    tickets: source.optional(),
    /** The stream CHSAA's game page links, and whether it costs money to watch. */
    stream: z.object({ url: source, label: text.max(60), paid: z.boolean() }).strict().optional(),
    /** After a final: who advances, and to which game, in one line. */
    next: text.max(240).optional(),
    /** The day the game's facts were last read. */
    checked: day,
  })
  .strict()
  .refine((g) => (g.status === 'final') === (g.home.score !== undefined && g.away.score !== undefined), {
    message: 'a final carries both scores, and nothing else carries a score: no result until CHSAA posts the final',
    path: ['status'],
  })
  .refine((g) => g.home.score === undefined || g.home.score !== g.away.score, { message: 'a playoff game has a winner', path: ['home', 'score'] })
  .refine((g) => g.status === 'final' || !g.next, { message: 'who advances is written once the game is final', path: ['next'] });
export type Game = z.infer<typeof game>;

const placeSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'a town page’s slug or a guide’s key, as src/config/hub-towns.ts names it');

export const curiositySchema = z
  .object({
    /** The file's name, and the address of an event article or a story: /articles/<slug>/. */
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
    /** Whether the writer has been there. Set, the byline line says "Visited"; unset, it says nothing (no "Not personally visited", the owner, 13 November 2026). */
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
    needs: z.array(text.max(600)).default([]),
    /**
     * Read every source again from this day: an event whose plans are
     * still being published. The validator lists the article from that
     * day until every `checked` in it is on or after it.
     */
    reverify: z.object({ from: day, why: text.max(240) }).strict().optional(),
    /**
     * A story's last day under "In the towns" on the hub's home; without it,
     * STORY_HOME_DAYS after its date. The article stays at its address.
     */
    homeUntil: day.optional(),
    /**
     * A substantive revision after the first version: the day it was made
     * and one line on what changed, both printed under the byline and the
     * day given as the page's dateModified. Not for a re-check that changed
     * nothing a reader sees (that moves `checked`), and never to look fresh.
     * `time` (Denver, "16:10") is for a page that changes more than once a
     * day, such as a playoff schedule taking results: the line then reads
     * "Updated November 13, 2026, 4:10 pm MT" and the dateModified carries it.
     */
    updated: z
      .object({ date: day, time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, '"HH:MM", Denver time').optional(), note: text.max(300) })
      .strict()
      .optional(),
    // An event article's own masthead and close, where the defaults (the
    // towns by name, the note on fees and roads, the towns' links at the
    // foot) do not fit it. The football playoffs
    // article (13 November 2026) is the first.
    /** The line over the headline, in place of the towns by name: "High school football · Colorado playoffs". */
    eyebrow: text.max(80).optional(),
    /** How the article was reported, in place of the visited label. */
    reportingNote: text.max(200).optional(),
    /** Jump links under the byline, each to an anchor on the page. */
    jump: z.array(z.object({ label: text.max(30), href: anchor }).strict()).max(5).default([]),
    /** The note after the sources, in place of the one about fees, seasons and roads. */
    footnote: text.max(400).optional(),
    /** Whether the towns' links are drawn at the foot; false where each section links its own town. */
    townsNav: z.boolean().default(true),
    /** The one invitation the article ends with, to a page on the hub: the newsletter. */
    invite: z.object({ text: text.max(120), href: z.string().regex(/^\/[a-z0-9/-]*$/, 'a page on the hub: "/newsletter/"') }).strict().optional(),
    /** The games an event article follows, drawn first (see GAME_STATUSES). */
    games: z.array(game).default([]),
  })
  .strict()
  .refine((a) => isStandalone(a.kind) || a.towns.length === 1, { message: 'a topic article is anchored to one town', path: ['towns'] })
  .refine((a) => (a.kind === 'camping') === a.campgrounds.length > 0, { message: 'a camping article lists its campgrounds, and only a camping article does', path: ['campgrounds'] })
  .refine((a) => (a.kind === 'ghost-towns') === a.ghostTowns.length > 0, { message: 'a ghost-town article lists its ghost towns, and only a ghost-town article does', path: ['ghostTowns'] })
  .refine((a) => !isStandalone(a.kind) || a.sources.length > 0, { message: 'an event article or a story names the source of every fact', path: ['sources'] })
  .refine((a) => a.kind === 'story' || !a.homeUntil, { message: 'only a story is shown on the hub’s home, so only a story carries homeUntil', path: ['homeUntil'] })
  .refine((a) => !a.homeUntil || a.homeUntil >= a.date, { message: 'homeUntil is on or after the story’s date', path: ['homeUntil'] })
  .refine((a) => !a.updated || a.updated.date >= a.date, { message: 'an update is on or after the article’s date', path: ['updated', 'date'] })
  .refine((a) => a.kind === 'event' || a.games.length === 0, { message: 'only an event article carries games', path: ['games'] })
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

/** Every fact in the article with a source and a day: the entries' fields, the games and the prose's sources. */
export function factsOf(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'sources'> & { games?: readonly Game[] }): Array<{ source: string; checked: string }> {
  const fields = [...new Set<string>([...CAMPING_FIELDS, ...GHOST_FIELDS])];
  const fromEntries = entriesOf(a).flatMap((e) => [
    ...fields.map((f) => (e as Record<string, unknown>)[f] as Fact | undefined).filter((f): f is Fact => !!f),
    ...e.more,
    ...(e.skip ? [e.skip] : []),
  ]);
  const fromGames = (a.games ?? []).map((g) => ({ source: g.url, checked: g.checked }));
  return [...fromEntries, ...fromGames, ...a.sources.map((s) => ({ source: s.url, checked: s.checked }))];
}

/** One weekend's games, as the schedule groups them: the days they fall on, and the games in kickoff order. */
export interface GameWeek {
  /** The weekend's first and last days, "2026-11-13". */
  first: string;
  last: string;
  games: Game[];
}

/**
 * The games by weekend, the newest weekend first, so this week's games sit
 * above last week's results. A weekend runs Monday to Sunday: Thursday,
 * Friday and Saturday games of one round are one group.
 */
export function gamesByWeek(games: readonly Game[]): GameWeek[] {
  const monday = (wall: string) => {
    const d = new Date(`${wall.slice(0, 10)}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  };
  const weeks = new Map<string, Game[]>();
  for (const g of [...games].sort((x, y) => x.kickoff.localeCompare(y.kickoff))) {
    const key = monday(g.kickoff);
    weeks.set(key, [...(weeks.get(key) ?? []), g]);
  }
  return [...weeks.entries()]
    .sort(([x], [y]) => y.localeCompare(x))
    .map(([, list]) => ({ first: list[0]!.kickoff.slice(0, 10), last: list[list.length - 1]!.kickoff.slice(0, 10), games: list }));
}

/** A final's line, the winner first: "Fort Collins 35, Northfield 21". */
export function finalLine(g: Pick<Game, 'home' | 'away'>): string | undefined {
  const { home, away } = g;
  if (home.score === undefined || away.score === undefined) return undefined;
  const [w, l] = home.score > away.score ? [home, away] : [away, home];
  return `${w.name} ${w.score}, ${l.name} ${l.score}`;
}

/**
 * The article's "Last verified" day: the oldest check among its facts, so
 * the line never claims more than every fact can carry. Reading one fact
 * again moves that fact's own date; the article's moves when the oldest
 * one has been read again.
 */
export function lastVerified(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'sources' | 'date'> & { games?: readonly Game[] }): string {
  return (
    factsOf(a)
      .map((f) => f.checked)
      .sort()[0] ?? a.date
  );
}

/**
 * The day the article last changed, for its dateModified and the sitemap:
 * the latest of its first day, its last revision (`updated`) and its
 * "Last verified" day, so it is never earlier than the day it was published.
 */
export function lastModified(a: Pick<CuriosityArticle, 'campgrounds' | 'ghostTowns' | 'sources' | 'date' | 'updated'> & { games?: readonly Game[] }): string {
  return [a.date, lastVerified(a), a.updated?.date ?? a.date].sort().at(-1)!;
}

/** Where the article is on the hub. */
export function articlePath(a: Pick<CuriosityArticle, 'kind' | 'towns' | 'slug'>): string {
  return isStandalone(a.kind) ? `/articles/${a.slug}/` : `${TOPIC_INFO[a.kind].path}${a.towns[0]}/`;
}

/** A story's last day on the hub's home: its `homeUntil`, else STORY_HOME_DAYS after its date. */
export function storyHomeUntil(a: Pick<CuriosityArticle, 'date' | 'homeUntil'>): string {
  if (a.homeUntil) return a.homeUntil;
  const d = new Date(`${a.date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + STORY_HOME_DAYS);
  return d.toISOString().slice(0, 10);
}

/** Whether the article is on the site: verified, or a draft under the local preview switch. */
export function isShown(a: Pick<CuriosityArticle, 'status'>, env: Record<string, string | undefined> = process.env): boolean {
  return a.status === 'verified' || draftsEnabled(env);
}

/** The hub's index of every article on the site: /articles/. */
export const ARTICLES_INDEX_PATH = '/articles/';

/** What an article is, in the word its row shows: "News", "Event", "Camping". */
export function kindLabel(kind: CuriosityKind): string {
  return kind === 'event' ? 'Event' : kind === 'story' ? 'News' : TOPIC_INFO[kind].label;
}

/** The articles in the order /articles/ lists them: the newest first, then by title. */
export function newestFirst<A extends Pick<CuriosityArticle, 'date' | 'title'>>(articles: readonly A[]): A[] {
  return [...articles].sort((x, y) => y.date.localeCompare(x.date) || x.title.localeCompare(y.title));
}

/** An article's towns on one line: up to `max` by name, then how many more. */
export function townsLine(names: readonly string[], max = 3): string {
  if (names.length <= max) return names.join(' · ');
  const more = names.length - max;
  return `${names.slice(0, max).join(' · ')} · ${more} more ${more === 1 ? 'town' : 'towns'}`;
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
export function reverifyDue(a: Pick<CuriosityArticle, 'reverify' | 'campgrounds' | 'ghostTowns' | 'sources' | 'date'> & { games?: readonly Game[] }, today: string): boolean {
  return !!a.reverify && today >= a.reverify.from && lastVerified(a) < a.reverify.from;
}

/** A source link's words: the site it is on. */
export { sourceHost };
