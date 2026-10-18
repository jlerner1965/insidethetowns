/**
 * What the review does to a file, as text transforms with no prompt attached,
 * so the tests can pin them and the CLI (scripts/review.ts) only asks.
 *
 * Every edit is a line in the frontmatter set, replaced or removed; the body
 * and every other line stay byte for byte. Approval stamps `verified` and
 * `verifiedBy` (and, on a place, `added`) and drops the `review` block; applying a change rewrites the
 * fields the source changed and clears the flag; dismissing a change clears
 * the flag and leaves the listing as it was.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { FRESHNESS } from '../../src/config/freshness.ts';
import type { TownConfig } from '../../src/config/towns/types.ts';
import { changeSchema, placeSchema, type Change } from '../../src/content/schemas.ts';
import { daysUntilAccessStale, daysUntilStale, seasonRecheck } from '../../src/lib/freshness.ts';
import { readRegistry } from '../../src/lib/sources.ts';
import { parseFrontmatter } from './frontmatter.ts';
import { yamlString } from './event-files.ts';

/** The frontmatter block's bounds: [start of first line after '---', index of the closing '---']. */
function bounds(text: string): { head: string; rest: string } {
  if (!text.startsWith('---\n')) throw new Error('no frontmatter block');
  const end = text.indexOf('\n---', 3);
  if (end === -1) throw new Error('frontmatter block is not closed');
  return { head: text.slice(0, end), rest: text.slice(end) };
}

/** Set `key: value` in the frontmatter, replacing the line if it exists, appending otherwise. `value` is already YAML. */
export function setField(text: string, key: string, value: string): string {
  const { head, rest } = bounds(text);
  const re = new RegExp(`^${key}:.*$`, 'm');
  const line = `${key}: ${value}`;
  return (re.test(head) ? head.replace(re, line) : `${head}\n${line}`) + rest;
}

export function removeField(text: string, key: string): string {
  const { head, rest } = bounds(text);
  return head.replace(new RegExp(`\\n${key}:.*(?=\\n|$)`, 'g'), '') + rest;
}

export function getField(text: string, key: string): string | undefined {
  const { head } = bounds(text);
  const m = head.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return m ? m[1]!.trim() : undefined;
}

/**
 * A staged file made publishable: review block gone, check date and checker
 * stamped. A place also gets `added`, the day it goes on the guide, which the
 * weekly email's "New on the guide" reads; one that already carries it (it
 * was published before and sent back to staging) keeps its date.
 */
export function approveText(text: string, today: string, by: string, kind: 'event' | 'place' = 'event'): string {
  let out = removeField(text, 'review');
  out = setField(out, 'verified', yamlString(today));
  out = setField(out, 'verifiedBy', yamlString(by));
  if (kind === 'place' && getField(out, 'added') === undefined) out = setField(out, 'added', yamlString(today));
  return out;
}

/** The published file with the source's change written in, re-stamped, and the flag cleared. */
export function applyChangeText(text: string, change: Change, sourceName: string, today: string, by: string): string {
  let out = text;
  for (const c of change.changes) {
    if (c.field === 'start' || c.field === 'end') out = setField(out, c.field, yamlString(c.now));
    else if (c.field === 'venue') out = setField(out, 'venue', yamlString(c.now));
    else if (c.field === 'status' && c.now === 'canceled') {
      out = setField(out, 'status', 'canceled');
      out = setField(out, 'statusNote', yamlString(`${sourceName} lists this as canceled (read ${today}).`));
      out = setField(out, 'statusSource', yamlString(change.sourceUrl));
    }
  }
  out = removeField(out, 'changeFlag');
  out = removeField(out, 'changeNote');
  out = setField(out, 'verified', yamlString(today));
  out = setField(out, 'verifiedBy', yamlString(by));
  return out;
}

/** The published file with the flag cleared and nothing else touched: the source was wrong, or the listing already says it. */
export function dismissChangeText(text: string): string {
  return removeField(removeField(text, 'changeFlag'), 'changeNote');
}

/**
 * A re-check's flag answered: the listing now says what the source says (the
 * editor has edited it, or it already did), so the flag comes off and the
 * check is stamped today. The re-check writes no change file, only the flag
 * and the evidence in `changeNote`, so there are no fields to write in.
 */
export function clearFlagText(text: string, today: string, by: string): string {
  let out = dismissChangeText(text);
  out = setField(out, 'verified', yamlString(today));
  out = setField(out, 'verifiedBy', yamlString(by));
  return out;
}

/**
 * The queue, in the order the editor should see it: cancellations, other
 * changes and flags, places, then events by date.
 *
 * A `flag` is a published event carrying `changeFlag` with no change file:
 * what the nightly re-check writes (scripts/recheck-events.ts) when the
 * source contradicts a listing, or a person writes by hand. The evidence is
 * the `changeNote`; there are no new fields to write in, so the editor edits
 * the listing or lets it stand, and either way the flag comes off here.
 */
export type QueueItem =
  | { kind: 'change'; town: TownConfig; file: string; eventFile: string; change: Change }
  | { kind: 'flag'; town: TownConfig; file: string; data: Record<string, unknown>; body: string; note: string }
  | { kind: 'place' | 'event'; town: TownConfig; file: string; data: Record<string, unknown>; body: string };

export function readQueue(town: TownConfig, contentDir: string): QueueItem[] {
  const items: QueueItem[] = [];
  const changesDir = join(contentDir, town.slug, 'staging', 'changes');
  if (existsSync(changesDir)) {
    for (const name of readdirSync(changesDir).sort()) {
      if (!name.endsWith('.json')) continue;
      const file = join(changesDir, name);
      const parsed = changeSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
      if (!parsed.success) continue;
      const eventFile = join(contentDir, town.slug, 'events', `${parsed.data.slug}.md`);
      if (!existsSync(eventFile)) continue;
      items.push({ kind: 'change', town, file, eventFile, change: parsed.data });
    }
  }
  // Flagged listings with no change file: the re-check's, and the editor's own.
  const withChange = new Set(items.map((i) => (i.kind === 'change' ? i.eventFile : '')));
  const eventsDir = join(contentDir, town.slug, 'events');
  if (existsSync(eventsDir)) {
    for (const name of readdirSync(eventsDir).sort()) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = join(eventsDir, name);
      if (withChange.has(file)) continue;
      let parsed;
      try {
        parsed = parseFrontmatter(readFileSync(file, 'utf8'));
      } catch {
        continue;
      }
      if (parsed.data.changeFlag !== true) continue;
      items.push({ kind: 'flag', town, file, data: parsed.data, body: parsed.body, note: String(parsed.data.changeNote ?? '') });
    }
  }
  for (const kind of ['place', 'event'] as const) {
    const dir = join(contentDir, town.slug, 'staging', `${kind}s`);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = join(dir, name);
      try {
        const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
        items.push({ kind, town, file, data, body });
      } catch {
        // The validator reports it; the review cannot show what it cannot read.
      }
    }
  }
  const rank = (i: QueueItem) => (i.kind === 'change' ? (i.change.cancel ? 0 : 1) : i.kind === 'flag' ? 1 : i.kind === 'place' ? 2 : 3);
  const when = (i: QueueItem) => (i.kind === 'event' || i.kind === 'flag' ? String(i.data.start ?? '') : '');
  return items.sort((a, b) => rank(a) - rank(b) || when(a).localeCompare(when(b)));
}

export interface TownSummary {
  town: TownConfig;
  /** `changes` counts every published listing a source or the re-check has a question about: change files and bare flags; `flags` is the bare flags alone. */
  waiting: { events: number; places: number; changes: number; cancellations: number; flags: number };
  /** Open listings whose check crosses the window inside the report horizon. */
  goingStale: Array<{ title: string; file: string; inDays: number }>;
  /**
   * Seasonal listings whose season opens or closes inside the horizon, or
   * turned since they were last checked (src/lib/freshness.ts, seasonRecheck).
   */
  seasonsTurning: Array<{ title: string; file: string; kind: 'opens' | 'closes'; on: Date; inDays: number }>;
  /** Confirmed sources whose last check did not come back ok. */
  brokenSources: Array<{ id: string; status: string; note?: string }>;
}

const plainPlace = placeSchema(() => z.string());

/** The three things the brief's weekly report was for, computed for one town. */
export function summarize(town: TownConfig, contentDir: string, now = new Date()): TownSummary {
  const queue = readQueue(town, contentDir);
  const waiting = {
    events: queue.filter((i) => i.kind === 'event').length,
    places: queue.filter((i) => i.kind === 'place').length,
    changes: queue.filter((i) => i.kind === 'change' || i.kind === 'flag').length,
    cancellations: queue.filter((i) => i.kind === 'change' && i.change.cancel).length,
    flags: queue.filter((i) => i.kind === 'flag').length,
  };
  const goingStale: TownSummary['goingStale'] = [];
  const seasonsTurning: TownSummary['seasonsTurning'] = [];
  const placesDir = join(contentDir, town.slug, 'places');
  if (existsSync(placesDir)) {
    for (const name of readdirSync(placesDir)) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = join(placesDir, name);
      let data;
      try {
        const parsed = plainPlace.safeParse(parseFrontmatter(readFileSync(file, 'utf8')).data);
        if (!parsed.success) continue;
        data = parsed.data;
      } catch {
        continue;
      }
      const inDays = daysUntilStale(data, town.variant, now);
      if (inDays !== null && inDays <= FRESHNESS.reportHorizonDays) goingStale.push({ title: data.title, file, inDays });
      // "Before you go" notes have their own check date and window; they go
      // stale on their own and are flagged on their own, like the listing.
      const accessIn = data.status === 'open' ? daysUntilAccessStale(data.access, now) : null;
      if (accessIn !== null && accessIn <= FRESHNESS.reportHorizonDays) goingStale.push({ title: `${data.title}: access notes`, file, inDays: accessIn });
      // A season turning is a re-check of its own, whatever the listing's date says.
      const season = seasonRecheck(data, now, FRESHNESS.reportHorizonDays);
      if (season) seasonsTurning.push({ title: data.title, file, ...season });
    }
    goingStale.sort((a, b) => a.inDays - b.inDays);
    seasonsTurning.sort((a, b) => a.inDays - b.inDays);
  }
  let brokenSources: TownSummary['brokenSources'] = [];
  try {
    brokenSources = readRegistry(town.slug, contentDir)
      .sources.filter((s) => s.status === 'confirmed' && s.lastStatus && !['ok', 'skipped'].includes(s.lastStatus))
      .map((s) => ({ id: s.id, status: s.lastStatus!, note: s.lastNote }));
  } catch {
    // The validator reports a broken registry file.
  }
  return { town, waiting, goingStale, seasonsTurning, brokenSources };
}
