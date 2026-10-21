/**
 * The programs, clubs and ways in (content/<town>/programs/): what a family
 * hub and a participation hub read. Pure functions over the collection's
 * data, so the deadline and grouping rules can be tested without Astro.
 */
import {
  PROGRAM_AUDIENCES,
  PROGRAM_TOPICS,
  type ProgramAudience,
  type ProgramData,
  type ProgramKind,
  type ProgramTopic,
} from '../content/schemas.ts';
import { addDays, dayKey, startOfDay } from './dates.ts';

export type ProgramLike = { data: ProgramData; slug?: string; id?: string };

/** The kinds a participation hub lists: ways to join, serve, meet and gather. Programs and classes belong to the family hub and the calendar. */
export const JOIN_KINDS: readonly ProgramKind[] = ['club', 'organization', 'volunteer', 'meeting', 'social', 'service'];

/** The audiences a family hub is for, in the order its sections run. */
export const FAMILY_AUDIENCES: readonly ProgramAudience[] = ['babies', 'preschool', 'elementary', 'teens', 'families'];

export function isForFamilies(p: ProgramLike): boolean {
  return p.data.audience.some((a) => FAMILY_AUDIENCES.includes(a));
}

export function isWayIn(p: ProgramLike): boolean {
  return JOIN_KINDS.includes(p.data.kind);
}

/** By name, picks first. */
export function byName<T extends ProgramLike>(list: readonly T[]): T[] {
  return [...list].sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.title.localeCompare(b.data.title));
}

/**
 * Programs grouped by audience, in the order given; empty audiences left
 * out. With `once` (the default) a program appears under the first of its
 * audiences in that order and nowhere else: swim lessons for six months
 * and up are listed under babies, not five times down the page. The
 * by-subject index is where the same program is found again.
 */
export function byAudience<T extends ProgramLike>(
  list: readonly T[],
  audiences: readonly ProgramAudience[] = PROGRAM_AUDIENCES,
  { once = true } = {},
): Array<{ audience: ProgramAudience; programs: T[] }> {
  const placed = new Set<T>();
  return audiences
    .map((audience) => {
      const programs = byName(list.filter((p) => p.data.audience.includes(audience) && !(once && placed.has(p))));
      for (const p of programs) placed.add(p);
      return { audience, programs };
    })
    .filter((g) => g.programs.length > 0);
}

/** The audience a program is filed under on a page that lists it once: the first of its audiences in the page's order. */
export function filedUnder(p: ProgramLike, audiences: readonly ProgramAudience[] = PROGRAM_AUDIENCES): ProgramAudience {
  return audiences.find((a) => p.data.audience.includes(a)) ?? p.data.audience[0]!;
}

/** Programs grouped by topic, in schema order; empty topics left out. */
export function byTopic<T extends ProgramLike>(list: readonly T[]): Array<{ topic: ProgramTopic; programs: T[] }> {
  return PROGRAM_TOPICS.map((topic) => ({ topic, programs: byName(list.filter((p) => p.data.topic === topic)) })).filter((g) => g.programs.length > 0);
}

export interface Deadline<T extends ProgramLike = ProgramLike> {
  program: T;
  /** The organizer's deadline, or the day registration opens, whichever is the next thing to happen. */
  on: Date;
  what: 'closes' | 'opens';
}

/**
 * Registration deadlines and openings in the next `days` days, soonest
 * first: what a resident can still sign up for, and what opens soon. A
 * deadline that has passed is not shown; a program whose registration opened
 * already is shown by its deadline only. Today's deadline still counts: a
 * form can be filed tonight.
 */
export function upcomingDeadlines<T extends ProgramLike>(list: readonly T[], { now = new Date(), days = 45 } = {}): Deadline<T>[] {
  const today = startOfDay(now).getTime();
  const horizon = addDays(startOfDay(now), days).getTime();
  const out: Deadline<T>[] = [];
  for (const program of list) {
    const r = program.data.registration;
    if (!r) continue;
    if (r.opens && r.opens.getTime() > today && r.opens.getTime() < horizon) out.push({ program, on: r.opens, what: 'opens' });
    if (r.deadline && r.deadline.getTime() >= today && r.deadline.getTime() < horizon) out.push({ program, on: r.deadline, what: 'closes' });
  }
  return out.sort((a, b) => a.on.getTime() - b.on.getTime() || a.program.data.title.localeCompare(b.program.data.title));
}

/** True once the organizer's deadline is behind us, so a row can say so instead of inviting a reader to miss it. */
export function deadlinePassed(p: ProgramLike, now = new Date()): boolean {
  const d = p.data.registration?.deadline;
  return !!d && dayKey(d) < dayKey(now);
}

/** "Free", "$30 a year", as the row prints it, or undefined. */
export function priceLine(p: ProgramLike): string | undefined {
  return p.data.price;
}
