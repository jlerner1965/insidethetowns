/**
 * Whether a town has enough verified content to stand as a site.
 *
 * Counts what the build would actually publish — events with a source and a
 * check date that still have an occurrence to come, and open listings inside
 * their freshness window — against the town's launch threshold. Reads the
 * markdown directly, the way the validator and the weekly report do, so it
 * runs without Astro.
 *
 * The count never fails a build (DECISIONS.md, 3 October): a live town that
 * drops under its threshold still publishes what it has, and the shortfall
 * is a CI warning and a line in the weekly report; a town that has not
 * launched builds a holding page whatever its count, until its status says
 * `live`.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { eventSchema, placeSchema } from '../../src/content/schemas.ts';
import { DEFAULT_LAUNCH_THRESHOLD } from '../../src/config/freshness.ts';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { eventExclusion, placeExclusion } from '../../src/lib/freshness.ts';
import { addDays, startOfDay } from '../../src/lib/dates.ts';
import { parseFrontmatter } from './frontmatter.ts';

const plainImage = () => z.string();

export interface LaunchCounts {
  /** Events the build publishes that have at least one occurrence still to come. */
  events: number;
  /** Open listings the build publishes. */
  listings: number;
  threshold: { events: number; listings: number };
  meets: boolean;
}

function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => join(dir, f));
}

/** The instant the last occurrence of an event ends, repeats expanded. */
function lastEnd(e: { start: Date; end?: Date; allDay: boolean; repeat?: string; until?: Date }): Date {
  const duration = e.end ? e.end.getTime() - e.start.getTime() : e.allDay ? 86_400_000 : 0;
  if (e.repeat === 'weekly' && e.until) {
    const lastStart = addDays(startOfDay(e.until), 1).getTime();
    let t = e.start;
    for (let next = addDays(t, 7); next.getTime() < lastStart; next = addDays(next, 7)) t = next;
    return new Date(t.getTime() + duration);
  }
  return new Date(e.start.getTime() + duration);
}

export function launchCounts(town: TownConfig, contentRoot = 'content', now = new Date()): LaunchCounts {
  const today = startOfDay(now);
  const eventSchemaPlain = eventSchema(plainImage);
  const placeSchemaPlain = placeSchema(plainImage);
  let events = 0;
  for (const file of files(join(contentRoot, town.slug, 'events'))) {
    let data;
    try {
      const parsed = eventSchemaPlain.safeParse(parseFrontmatter(readFileSync(file, 'utf8')).data);
      if (!parsed.success) continue;
      data = parsed.data;
    } catch {
      continue;
    }
    if (eventExclusion(data)) continue;
    if (data.status !== 'scheduled') continue;
    if (lastEnd(data).getTime() >= today.getTime()) events++;
  }
  let listings = 0;
  for (const file of files(join(contentRoot, town.slug, 'places'))) {
    let data;
    try {
      const parsed = placeSchemaPlain.safeParse(parseFrontmatter(readFileSync(file, 'utf8')).data);
      if (!parsed.success) continue;
      data = parsed.data;
    } catch {
      continue;
    }
    if (placeExclusion(data, town.variant, now)) continue;
    if (data.status === 'open') listings++;
  }
  const threshold = town.launchThreshold ?? DEFAULT_LAUNCH_THRESHOLD;
  return { events, listings, threshold, meets: events >= threshold.events && listings >= threshold.listings };
}

/** One line for a log or a report: "12 of 10 events, 9 of 15 listings". */
export function describeCounts(c: LaunchCounts): string {
  return `${c.events} of ${c.threshold.events} upcoming events, ${c.listings} of ${c.threshold.listings} listings`;
}

