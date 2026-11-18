/**
 * The redirect rules vercel.json carries for addresses the builds would
 * otherwise answer with a redirect page (a 200 with a meta refresh): each
 * live guide's former and retired slugs and moved index pages
 * (src/lib/former-slugs.ts), the hub's pages that moved to a guide
 * (src/lib/hub-moved.ts), and the same guide addresses on a domain that
 * forwards to the guide path for path, so nothing takes two hops.
 *
 * scripts/fold-rules.ts writes them; test/guide-redirects.test.ts fails
 * when vercel.json has fallen behind.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { allTowns, getNetworkHub, listsEvents } from '../../src/config/index.ts';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { eventSchema } from '../../src/content/schemas.ts';
import { dayKey } from '../../src/lib/dates.ts';
import { formerSlugRedirects, guideRedirects, guideRules, RETIRED_INDEX } from '../../src/lib/former-slugs.ts';
import { eventExclusion } from '../../src/lib/freshness.ts';
import { hubMovedRules } from '../../src/lib/hub-moved.ts';
import { readOccurrences } from '../../src/lib/series.ts';
import { parseFrontmatter } from './frontmatter.ts';

export interface HostRule {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
  has?: Array<{ type: string; value?: string }>;
}

/** The most redirects Vercel takes in one vercel.json (its docs, "Configuration redirects: Limits", read 17 November 2026). */
export const REDIRECT_LIMIT = 2048;

export const hostOf =(r: HostRule) => r.has?.find((h) => h.type === 'host')?.value;

/**
 * A guide's events that are over and that the publish gate holds back
 * (src/lib/freshness.ts): the file is kept, no page is built, and the
 * address the event had while it was listed is a 404 (two of Lyons' were
 * still shown by Google on 17 November 2026). Each goes to the events
 * list. An event still to come is left alone: its page returns when the
 * gate lets it through.
 */
export function heldEventRedirects(town: string, contentRoot = 'content', now = new Date()): Record<string, string> {
  const today = dayKey(now);
  const schema = eventSchema(() => z.string());
  const out: Record<string, string> = {};
  for (const o of readOccurrences(town, contentRoot)) {
    if (o.annual || o.lastDay >= today) continue;
    let held = true;
    try {
      const parsed = schema.safeParse(parseFrontmatter(readFileSync(join(contentRoot, town, 'events', `${o.slug}.md`), 'utf8')).data);
      held = !parsed.success || !!eventExclusion(parsed.data, now);
    } catch {
      /* unreadable front matter: the build drops it too */
    }
    if (held) out[`/events/${o.slug}`] = RETIRED_INDEX.events;
  }
  return out;
}

/** A guide's redirects, the held events' among them (a quiet guide builds no event page to hold). */
function redirectsFor(t: TownConfig, now: Date | null): Record<string, string> {
  const held = listsEvents(t) ? heldEventRedirects(t.slug, 'content', now ?? new Date()) : {};
  return { ...held, ...guideRedirects(t.slug, { listsEvents: listsEvents(t), now }) };
}

/**
 * One block of rules per host. `now` is the day the destinations are
 * settled for (an event that is over gives way to the events list); null
 * gives each listing as filed.
 */
export function generatedBlocks(now: Date | null = new Date()): Array<{ host: string; rules: HostRule[] }> {
  const live = allTowns.filter((t) => t.status === 'live');
  const blocks: Array<{ host: string; rules: HostRule[] }> = [{ host: getNetworkHub().domain, rules: hubMovedRules(getNetworkHub().domain) }];
  for (const t of live) blocks.push({ host: t.domain, rules: guideRules(t.domain, redirectsFor(t, now)) });
  for (const t of allTowns.filter((t) => t.status === 'redirect')) {
    // Inside Frederick keeps every path into Carbon Valley; Severance's
    // listings kept their slugs on the Windsor guide.
    const successor = live.find((g) => g.slug === t.retired?.successor);
    if (successor) blocks.push({ host: t.domain, rules: guideRules(t.domain, redirectsFor(successor, now), `https://${successor.domain}`) });
    const home = live.find((g) => g.slug === t.foldedInto?.town);
    if (home) blocks.push({ host: t.domain, rules: guideRules(t.domain, formerSlugRedirects(home.slug, 'content', now), `https://${home.domain}`) });
  }
  return blocks;
}

/**
 * The rules with each block in place: any rule the host already has for
 * one of the block's addresses gives way, and the block goes ahead of the
 * host's other rules (after its home-page rule, where it has one), so no
 * pattern below can take an address first.
 */
export function withBlocks(rules: HostRule[], blocks: Array<{ host: string; rules: HostRule[] }>): HostRule[] {
  let out = rules;
  for (const block of blocks) {
    const sources = new Set(block.rules.map((r) => r.source));
    const rest = out.filter((r) => !(hostOf(r) === block.host && sources.has(r.source)));
    let at = rest.findIndex((r) => hostOf(r) === block.host);
    if (at >= 0 && rest[at]!.source === '/') at++;
    if (at < 0) {
      // Nothing else on the host: the block stays where it is, or goes last.
      const was = out.findIndex((r) => hostOf(r) === block.host);
      at = was < 0 ? rest.length : out.slice(0, was).filter((r) => rest.includes(r)).length;
    }
    out = [...rest.slice(0, at), ...block.rules, ...rest.slice(at)];
  }
  return out;
}
