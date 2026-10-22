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

/**
 * The family hub's three age sections (redesign brief, 22 October 2026):
 * the under-fives, the school years, the teens. A program for families as
 * a whole is filed with the school years, the age most of them mean. A
 * program appears once, under the first group it fits, as byAudience does.
 */
export const FAMILY_AGE_GROUPS = [
  { id: 'under-5', label: 'Under 5', audiences: ['babies', 'preschool'] as readonly ProgramAudience[] },
  { id: '5-11', label: 'Ages 5–11', audiences: ['elementary', 'families'] as readonly ProgramAudience[] },
  { id: 'teens', label: 'Teens', audiences: ['teens'] as readonly ProgramAudience[] },
] as const;
export type FamilyAgeGroup = (typeof FAMILY_AGE_GROUPS)[number];

export function familyAgeGroups<T extends ProgramLike>(list: readonly T[]): Array<{ group: FamilyAgeGroup; programs: T[] }> {
  const placed = new Set<T>();
  return FAMILY_AGE_GROUPS.map((group) => {
    // The programs made for the youngest of the group's ages lead (a
    // storytime for babies before a league that starts at four); the ones
    // filed here by their first audience follow, by name within a rank.
    const rank = (p: T) => {
      const i = group.audiences.indexOf(p.data.audience[0]!);
      return i < 0 ? group.audiences.length : i;
    };
    const programs = byName(list.filter((p) => !placed.has(p) && p.data.audience.some((a) => group.audiences.includes(a)))).sort((a, b) => rank(a) - rank(b));
    for (const p of programs) placed.add(p);
    return { group, programs };
  }).filter((g) => g.programs.length > 0);
}

/** The group a family program is filed under, for a link to its section. */
export function familyGroupOf(p: ProgramLike): FamilyAgeGroup | undefined {
  return FAMILY_AGE_GROUPS.find((g) => p.data.audience.some((a) => g.audiences.includes(a)));
}

/**
 * A deadline as one line with the action in it: "Holiday Card Art Contest:
 * entries due Sat Nov 7", "Berthoud Recreation youth sports: registration
 * opens Sun Nov 1". The organizer's own words on how to register decide
 * between entries and registration; a listing's title stands in for the
 * program's where the deadline has its own listing.
 */
export function deadlineTitle(d: Deadline, day: string, eventTitle?: string): string {
  const title = (eventTitle ?? d.program.data.title).replace(/\s*(?:[:·-]\s*)?(?:deadline|(?:\w+\s+)?due|registration (?:opens|closes))\s*$/i, '');
  const entries = /\bentr(?:y|ies)\b/i.test(d.program.data.registration?.how ?? '');
  const action = d.what === 'opens' ? 'registration opens' : entries ? 'entries due' : 'register by';
  return `${title}: ${action} ${day}`;
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

/** One entry per program, the soonest: a window that opens and closes within the horizon is one row, not two. */
export function onePerProgram<T extends ProgramLike>(list: Deadline<T>[]): Deadline<T>[] {
  const seen = new Set<T>();
  return list.filter((d) => !seen.has(d.program) && seen.add(d.program));
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
