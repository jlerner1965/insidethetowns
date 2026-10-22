/**
 * The programs, clubs and ways in (content/<town>/programs/): what a family
 * hub and a participation hub read. Pure functions over the collection's
 * data, so the deadline and grouping rules can be tested without Astro.
 *
 * Every day count here is a Denver calendar day (src/lib/dates.ts,
 * daysBetween): "14 days left" means fourteen midnights, whatever the hour
 * the page was built at.
 */
import {
  PROGRAM_AUDIENCES,
  PROGRAM_TOPICS,
  type ProgramAudience,
  type ProgramData,
  type ProgramKind,
  type ProgramTopic,
} from '../content/schemas.ts';
import { dayKey, daysBetween } from './dates.ts';

export type ProgramLike = { data: ProgramData; slug?: string; id?: string };

/** The kinds a participation hub lists: ways to join, serve, meet and gather. Programs and classes belong to the family hub and the calendar. */
export const JOIN_KINDS: readonly ProgramKind[] = ['club', 'organization', 'volunteer', 'meeting', 'social', 'service'];

/** The audiences a family hub is for, in the order its sections run. */
export const FAMILY_AUDIENCES: readonly ProgramAudience[] = ['babies', 'preschool', 'elementary', 'teens', 'families'];

/** The audiences that are children: what decides whether a program is something a child joins. */
export const CHILD_AUDIENCES: readonly ProgramAudience[] = ['babies', 'preschool', 'elementary', 'teens'];

/**
 * "Soon" on every page that says it: a deadline or an opening within the
 * next fourteen days. Anything later is coming up, under its own heading
 * with its date, never "closing soon" (family audit, 22 October 2026: open
 * enrollment opening on December 1 sat under "Closing soon" in October).
 */
export const SOON_DAYS = 14;
/** How far ahead "coming up" looks. */
export const LATER_DAYS = 90;

/**
 * A program the family hub lists: one with a family audience, other than a
 * public meeting. Berthoud's Town boards took teens on its Youth Advisory
 * Commission and so sat under Teens beside the library's teen programs
 * (navigation audit, 22 October 2026); a board is a way in for a resident,
 * listed on /get-involved/, not something a parent signs a child up for.
 */
export function isForFamilies(p: ProgramLike): boolean {
  return p.data.kind !== 'meeting' && p.data.audience.some((a) => FAMILY_AUDIENCES.includes(a));
}

export function isWayIn(p: ProgramLike): boolean {
  return JOIN_KINDS.includes(p.data.kind);
}

/**
 * Which part of the family hub a program belongs in. A child's activity
 * goes under its age; a parent's way of helping, a school and a service a
 * family uses (passes, care, tours) are not things a child joins and sit
 * apart; so does an organization whose membership happens to come in a
 * family size (family audit, 22 October 2026: a parent council and a
 * historical society were listed under "Ages 5–11").
 */
export type FamilySection = 'children' | 'parents' | 'organizations';

export function familySection(p: ProgramLike): FamilySection {
  const { kind } = p.data;
  if (kind === 'organization') return 'organizations';
  if (kind === 'volunteer' || kind === 'service') return 'parents';
  return 'children';
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
 * the under-fives, the school years, the teens, each with the years it
 * covers so a program's own numbers can be read against them. A program
 * is filed once, under the group most of its years fall in, and every
 * other group it reaches into says so in a line of its own
 * (`familyAgeGroups`, `alsoHere`), with the program's actual range.
 */
export const FAMILY_AGE_GROUPS = [
  { id: 'under-5', label: 'Under 5', from: 0, to: 4, audiences: ['babies', 'preschool'] as readonly ProgramAudience[] },
  { id: '5-11', label: 'Ages 5–11', from: 5, to: 11, audiences: ['elementary', 'families'] as readonly ProgramAudience[] },
  { id: 'teens', label: 'Teens', from: 12, to: 17, audiences: ['teens'] as readonly ProgramAudience[] },
] as const;
export type FamilyAgeGroup = (typeof FAMILY_AGE_GROUPS)[number];

/** The organizer's numbers, where the file gives them: "16 and up" is from 16 with no top. */
function ageSpan(p: ProgramLike): { from: number; to: number } | undefined {
  const { ageFrom, ageTo } = p.data;
  if (ageFrom === undefined && ageTo === undefined) return undefined;
  return { from: ageFrom ?? 0, to: ageTo ?? 120 };
}

/** How many of a group's years a span covers; 0 when it does not reach the group. */
function yearsIn(span: { from: number; to: number }, group: FamilyAgeGroup): number {
  return Math.max(0, Math.min(span.to, group.to) - Math.max(span.from, group.from) + 1);
}

/**
 * Every age group a program reaches: by its numbers where it has them, by
 * its audience tags where it does not. A program for families as a whole
 * reaches the school years, the age most of them mean.
 */
export function familyGroupsOf(p: ProgramLike): FamilyAgeGroup[] {
  const span = ageSpan(p);
  if (span) return FAMILY_AGE_GROUPS.filter((g) => yearsIn(span, g) > 0);
  return FAMILY_AGE_GROUPS.filter((g) => p.data.audience.some((a) => g.audiences.includes(a)));
}

/**
 * The group a family program is filed under, for its section and a link
 * to it: the one most of its years fall in (the school years win a tie
 * with either neighbour, the teens a tie with the under-fives: a league
 * from four to eighteen is a school-age league), or by its tags the first
 * group it fits, except that
 * one tagged from the under-fives into school age is filed with the school
 * years, where most of its ages are (navigation audit, 22 October 2026:
 * swim lessons from six months and a league from four to fifteen had led
 * the under-fives).
 */
export function familyGroupOf(p: ProgramLike): FamilyAgeGroup | undefined {
  const span = ageSpan(p);
  if (span) {
    const [under5, school, teens] = FAMILY_AGE_GROUPS;
    const years = FAMILY_AGE_GROUPS.map((g) => yearsIn(span, g));
    const most = Math.max(...years);
    if (most === 0) return undefined;
    // School years win a tie with either neighbour; teens win a tie with the under-fives.
    if (years[1] === most) return school;
    if (years[2] === most) return teens;
    return under5;
  }
  const [under5, school] = FAMILY_AGE_GROUPS;
  const has = (a: ProgramAudience) => p.data.audience.includes(a);
  if (under5.audiences.some(has) && (has('elementary') || has('teens'))) return school;
  return FAMILY_AGE_GROUPS.find((g) => p.data.audience.some((a) => g.audiences.includes(a)));
}

/**
 * The age sections with their programs: each program once, under its own
 * group, and named again in `alsoHere` under every other group its ages
 * reach, so a parent of a teen finds the troop and the league whichever
 * section they read, and reads the real range on the row.
 */
export function familyAgeGroups<T extends ProgramLike>(list: readonly T[]): Array<{ group: FamilyAgeGroup; programs: T[]; alsoHere: T[] }> {
  return FAMILY_AGE_GROUPS.map((group) => {
    // The programs made for the youngest of the group's ages lead (a
    // storytime for babies before a league that starts at four); the ones
    // filed here by their first audience follow, by name within a rank.
    const rank = (p: T) => {
      const i = group.audiences.indexOf(p.data.audience[0]!);
      return i < 0 ? group.audiences.length : i;
    };
    const programs = byName(list.filter((p) => familyGroupOf(p) === group)).sort((a, b) => rank(a) - rank(b));
    const alsoHere = byName(list.filter((p) => familyGroupOf(p) !== group && familyGroupsOf(p).includes(group)));
    return { group, programs, alsoHere };
  }).filter((g) => g.programs.length > 0 || g.alsoHere.length > 0);
}

/** "11 to 17", "16 and up", "under 5": the organizer's numbers as a phrase, or their own words. */
export function ageText(p: ProgramLike): string | undefined {
  const { ageFrom, ageTo, ages } = p.data;
  if (ages) return ages;
  if (ageFrom !== undefined && ageTo !== undefined) return `${ageFrom} to ${ageTo}`;
  if (ageFrom !== undefined) return `${ageFrom} and up`;
  if (ageTo !== undefined) return `up to ${ageTo}`;
  return undefined;
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
 * form can be filed tonight. Counted in Denver days, so a deadline fourteen
 * days off is "soon" at 11 pm as at 9 am.
 */
export function upcomingDeadlines<T extends ProgramLike>(list: readonly T[], { now = new Date(), days = 45 } = {}): Deadline<T>[] {
  const out: Deadline<T>[] = [];
  for (const program of list) {
    const r = program.data.registration;
    if (!r) continue;
    if (r.opens) {
      const d = daysBetween(now, r.opens);
      if (d > 0 && d <= days) out.push({ program, on: r.opens, what: 'opens' });
    }
    if (r.deadline) {
      const d = daysBetween(now, r.deadline);
      if (d >= 0 && d <= days) out.push({ program, on: r.deadline, what: 'closes' });
    }
  }
  return out.sort((a, b) => a.on.getTime() - b.on.getTime() || a.program.data.title.localeCompare(b.program.data.title));
}

/** One entry per program, the soonest: a window that opens and closes within the horizon is one row, not two. */
export function onePerProgram<T extends ProgramLike>(list: Deadline<T>[]): Deadline<T>[] {
  const seen = new Set<T>();
  return list.filter((d) => !seen.has(d.program) && seen.add(d.program));
}

/** Whole Denver days from `now` to the deadline: 0 today, 1 tomorrow. */
export function daysLeft(d: Pick<Deadline, 'on'>, now = new Date()): number {
  return daysBetween(now, d.on);
}

/**
 * The deadlines a family hub shows, in three lists that never share an
 * entry: what closes within SOON_DAYS, what opens within SOON_DAYS, and
 * everything later up to LATER_DAYS, one entry per program. A deadline
 * is never called soon because its opening is.
 */
export function splitDeadlines<T extends ProgramLike>(
  list: readonly T[],
  { now = new Date(), soon = SOON_DAYS, later = LATER_DAYS } = {},
): { closingSoon: Deadline<T>[]; openingSoon: Deadline<T>[]; later: Deadline<T>[] } {
  const all = onePerProgram(upcomingDeadlines(list, { now, days: later }));
  const isSoon = (d: Deadline<T>) => daysLeft(d, now) <= soon;
  return {
    closingSoon: all.filter((d) => d.what === 'closes' && isSoon(d)),
    openingSoon: all.filter((d) => d.what === 'opens' && isSoon(d)),
    later: all.filter((d) => !isSoon(d)),
  };
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

/**
 * The activity itself costs nothing, on the organizer's word. The file's
 * `free` decides where it is set; otherwise the price line counts only
 * when it begins "Free" and nothing paid follows: "Free" and "Free (extra
 * guests $5)" do, "Free to volunteer; the directory is a purchase", "$15 a
 * year; lectures $5 for non-members" and "Free; basketball $5 a night" do
 * not (family audit, 22 October 2026: a $5 lecture fee and a free parent
 * council were both under "Free, any day").
 */
export function isFree(p: ProgramLike): boolean {
  if (p.data.free !== undefined) return p.data.free;
  const price = p.data.price?.trim() ?? '';
  if (!/^free\b/i.test(price)) return false;
  if (/^free\s+(?:to|for)\s+(?:volunteer|members?|apply|tour)/i.test(price)) return false;
  // Anything priced after a semicolon or a comma is a paid part of the same listing.
  const rest = price.replace(/^free\b/i, '').replace(/\([^)]*\)/g, '');
  return !/\$|\bfee\b|\bdues\b/i.test(rest);
}

/** A reader can turn up without signing up, on the organizer's word; unknown when the file says nothing. */
export function isDropIn(p: ProgramLike): boolean | undefined {
  if (p.data.dropIn !== undefined) return p.data.dropIn;
  const r = p.data.registration;
  if (!r) return undefined;
  return !r.required && !r.deadline && !r.opens;
}

/**
 * The free things to do, drop-ins first, then the ones that take a sign-up,
 * then the ones the file does not say about. A volunteer role or a
 * membership organization is not a free thing to do, whatever its price
 * line says: free volunteering is still volunteering.
 */
export function freePrograms<T extends ProgramLike>(list: readonly T[]): T[] {
  const rank = (p: T) => (isDropIn(p) === true ? 0 : isDropIn(p) === false ? 1 : 2);
  return byName(list.filter((p) => isFree(p) && familySection(p) !== 'organizations' && p.data.kind !== 'volunteer')).sort((a, b) => rank(a) - rank(b));
}
