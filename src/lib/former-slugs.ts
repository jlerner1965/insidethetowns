/**
 * The URLs a listing used to have, so a reader or a search engine that
 * still holds the old one lands somewhere rather than on a 404.
 *
 * Two sources, read straight from the Markdown and a JSON file, like
 * series.ts and raw-places.ts, because astro.config runs before the
 * collections exist:
 *
 * - `formerSlugs` in a listing's front matter: the editor's sweeps merge
 *   and re-file listings under new slugs (two beer-release pages and the
 *   band playing them became one, 5 November 2026), and the old URL went
 *   to a 404 while Google was still sending readers to it (nine such pages
 *   had traffic in the Search Console read of the same day). The old URL
 *   goes to the listing that holds it.
 *
 * - `content/<town>/retired.json`, the ledger of listings that came off
 *   with no file left to carry a former slug (the owner, 7 November 2026:
 *   103 addresses Google or a sent email still pointed at were 404s, past
 *   events deleted once their dates passed, and a listing an organizer
 *   takes down has nowhere to name its old slug). `{ "events": { "<slug>":
 *   null }, "places": { ... } }`: null sends the URL to the kind's own list
 *   (the events page, the directory); a slug sends it to the listing that
 *   took its place. A listing is never deleted because its date passed
 *   (the build hides it, and its page keeps serving the links readers
 *   hold); one that must come off is put here in the same change.
 *
 * The build turns each into a redirect page at the old path
 * (astro.config.mjs `redirects`, which a static build writes as a
 * meta-refresh page with noindex; Google reads that as a redirect). A
 * former or retired slug that is also a live slug is skipped with a warning
 * rather than shadowing a page: the live page wins, and the validator and
 * test/retired-slugs.test.ts report the clash.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const KINDS = ['events', 'places'] as const;
export type FormerSlugKind = (typeof KINDS)[number];

/** Where a retired listing's URL goes when nothing took its place: the kind's own list. */
export const RETIRED_INDEX: Record<FormerSlugKind, string> = { events: '/events/', places: '/directory/' };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `formerSlugs: [a, b]` on one line, or a block list of `- a` lines; nothing when the field is absent. */
export function parseFormerSlugs(frontmatter: string): string[] {
  const inline = frontmatter.match(/^formerSlugs:\s*\[([^\]]*)\]\s*$/m);
  if (inline) return inline[1]!.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  const block = frontmatter.match(/^formerSlugs:\s*\n((?:[ \t]+-\s*[^\n]*\n?)+)/m);
  if (block) return [...block[1]!.matchAll(/-\s*["']?([a-z0-9-]+)["']?/g)].map((m) => m[1]!);
  return [];
}

/** A town's live listings of one kind: each slug (the front matter's, else the file name's) with the former slugs it declares. */
export function liveListings(town: string, kind: FormerSlugKind, contentRoot = 'content'): Map<string, string[]> {
  const live = new Map<string, string[]>();
  const dir = join(contentRoot, town, kind);
  if (!existsSync(dir)) return live;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    const slug = fm.match(/^slug:\s*"?([a-z0-9-]+)"?\s*$/m)?.[1] ?? file.slice(0, -3);
    live.set(slug, parseFormerSlugs(fm));
  }
  return live;
}

export interface FormerSlug {
  kind: FormerSlugKind;
  from: string;
  to: string;
}

/** Every former slug a town's events and places declare, with the slug each now lives at. */
export function formerSlugs(town: string, contentRoot = 'content'): FormerSlug[] {
  const out: FormerSlug[] = [];
  for (const kind of KINDS) {
    const live = liveListings(town, kind, contentRoot);
    for (const [to, formers] of live) {
      for (const from of formers) {
        if (from === to) continue;
        if (live.has(from)) {
          console.warn(`former-slugs: ${town}/${kind}/${to} names ${from} as a former slug, but ${from} is a live listing; the live page keeps the URL.`);
          continue;
        }
        out.push({ kind, from, to });
      }
    }
  }
  return out;
}

export interface RetiredSlug {
  kind: FormerSlugKind;
  from: string;
  /** The slug that took its place, or null for the kind's own list. */
  to: string | null;
}

/** The town's retired.json, parsed and checked for shape; nothing when the town has none. A malformed ledger throws, naming the file. */
export function retiredSlugs(town: string, contentRoot = 'content'): RetiredSlug[] {
  const file = join(contentRoot, town, 'retired.json');
  if (!existsSync(file)) return [];
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${file}: not valid JSON (${(e as Error).message})`);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${file}: expected an object with "events" and/or "places"`);
  const out: RetiredSlug[] = [];
  for (const [kind, entries] of Object.entries(data as Record<string, unknown>)) {
    if (!(KINDS as readonly string[]).includes(kind)) throw new Error(`${file}: unknown kind "${kind}" (events or places)`);
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) throw new Error(`${file}: "${kind}" must map each slug to null or the slug that took its place`);
    for (const [from, to] of Object.entries(entries as Record<string, unknown>)) {
      if (!SLUG.test(from)) throw new Error(`${file}: "${from}" is not a slug`);
      if (to !== null && (typeof to !== 'string' || !SLUG.test(to))) throw new Error(`${file}: ${kind}/${from} must be null or a slug, not ${JSON.stringify(to)}`);
      out.push({ kind: kind as FormerSlugKind, from, to });
    }
  }
  return out;
}

/**
 * What is wrong with a town's ledger, for the validator and the test: a
 * retired slug that is still a live listing (the page would be hidden if
 * the rule were applied, so the build skips it), and a target that is not
 * one (the build falls back to the list). Empty when the ledger is sound.
 */
export function retiredLedgerIssues(town: string, contentRoot = 'content'): string[] {
  const issues: string[] = [];
  let retired: RetiredSlug[];
  try {
    retired = retiredSlugs(town, contentRoot);
  } catch (e) {
    return [(e as Error).message];
  }
  for (const { kind, from, to } of retired) {
    const live = liveListings(town, kind, contentRoot);
    if (live.has(from)) issues.push(`${town}/retired.json: ${kind}/${from} is a live listing; remove it from the ledger or the file`);
    if (to !== null && !live.has(to)) issues.push(`${town}/retired.json: ${kind}/${from} names ${to}, which is not a live listing; use null for the list, or the slug it lives at`);
  }
  return issues;
}

/**
 * The town's former and retired slugs as Astro `redirects`: `/events/old`
 * to `/events/new/`, or to the kind's list. A former slug comes first: a
 * listing that names its old slug knows better than the ledger.
 */
export function formerSlugRedirects(town: string, contentRoot = 'content'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { kind, from, to } of formerSlugs(town, contentRoot)) out[`/${kind}/${from}`] = `/${kind}/${to}/`;
  for (const { kind, from, to } of retiredSlugs(town, contentRoot)) {
    const path = `/${kind}/${from}`;
    if (path in out) continue;
    const live = liveListings(town, kind, contentRoot);
    if (live.has(from)) {
      console.warn(`retired.json: ${town}/${kind}/${from} is retired in the ledger but is a live listing; the live page keeps the URL.`);
      continue;
    }
    if (to !== null && !live.has(to)) console.warn(`retired.json: ${town}/${kind}/${from} names ${to}, which is not a live listing; the URL goes to ${RETIRED_INDEX[kind]} instead.`);
    out[path] = to !== null && live.has(to) ? `/${kind}/${to}/` : RETIRED_INDEX[kind];
  }
  return out;
}

/**
 * A program points at its next event by slug (`nextEvent`), and the row
 * prints that event's date and link. When the event is re-filed under a new
 * slug the pointer finds nothing, and nothing says so: the row just loses
 * its line (Niwot's Business Association pointed at great-pumpkin-party-2026
 * for a week after the listing became great-pumpkin-party, 9 November
 * 2026). One issue per pointer that names no live event, with the slug the
 * event moved to when a listing declares the old one.
 */
export function nextEventIssues(town: string, contentRoot = 'content'): string[] {
  const dir = join(contentRoot, town, 'programs');
  if (!existsSync(dir)) return [];
  const live = liveListings(town, 'events', contentRoot);
  const issues: string[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
    const slug = fm?.match(/^nextEvent:\s*["']?([a-z0-9-]+)["']?\s*$/m)?.[1];
    if (!slug || live.has(slug)) continue;
    const now = [...live].find(([, formers]) => formers.includes(slug))?.[0];
    issues.push(`${town}/programs/${file}: nextEvent "${slug}" is not an event on this guide${now ? `; the listing is now "${now}"` : ''}`);
  }
  return issues;
}
