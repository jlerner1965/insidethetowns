/**
 * The programs, clubs and ways in (content/<town>/programs/): what a family
 * hub and a participation hub read. Pure functions over the collection's
 * data, so the deadline and grouping rules can be tested without Astro.
 *
 * Every day count here is a Denver calendar day (src/lib/dates.ts,
 * daysBetween): "14 days left" means fourteen midnights, whatever the hour
 * the page was built at.
 */
import { isFreeCost } from './cost.ts';
import {
  PROGRAM_STATUS_LABELS,
  PROGRAM_TOPICS,
  type ProgramAudience,
  type ProgramData,
  type ProgramKind,
  type ProgramStatusState,
  type ProgramTopic,
} from '../content/schemas.ts';
import { dayKey, daysBetween, formatDate, formatMonthDay } from './dates.ts';

export type ProgramLike = { data: ProgramData; slug?: string; id?: string };

/** The kinds a participation hub lists: ways to join, serve, meet and gather. Programs and classes belong to the family hub and the calendar. */
export const JOIN_KINDS: readonly ProgramKind[] = ['club', 'organization', 'volunteer', 'meeting', 'social', 'service'];

/** The audiences a family hub is for, in the order its sections run. */
export const FAMILY_AUDIENCES: readonly ProgramAudience[] = ['babies', 'preschool', 'elementary', 'teens', 'families'];

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
 * (The Families page filed its children's programs by these groups until 6
 * November 2026; it files them by subject now, `byTopic`, with each row's
 * ages on the row. Kept for an age view.)
 *
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

/** "Entries due" where the organizer's words on how to register are about entries, else "Register by". */
export function deadlineAction(p: ProgramLike): string {
  return /\bentr(?:y|ies)\b/i.test(p.data.registration?.how ?? '') ? 'Entries due' : 'Register by';
}

/** Programs grouped by topic, in schema order; empty topics left out. */
export function byTopic<T extends ProgramLike>(list: readonly T[]): Array<{ topic: ProgramTopic; programs: T[] }> {
  return PROGRAM_TOPICS.map((topic) => ({ topic, programs: byName(list.filter((p) => p.data.topic === topic)) })).filter((g) => g.programs.length > 0);
}

/**
 * A library's (or a firehouse's) storytime program for the under-fives, by
 * its title and its audiences: babies, preschoolers and their families, and
 * no older child. The Families page says it in one line, the days and the
 * library's calendar, rather than the row every other program gets, whose
 * summary and "Who" and "When" facts spelled out which session is for
 * babies under two and which for toddlers, at what hour (the owner, 6
 * November 2026: a timetable of where the smallest children will be is not
 * what a town guide should print; the library's own calendar has it).
 */
export function isStorytimeProgram(p: ProgramLike): boolean {
  const underFives: readonly ProgramAudience[] = ['babies', 'preschool', 'families'];
  return /story\s*times?\b/i.test(p.data.title) && p.data.audience.every((a) => underFives.includes(a));
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const WEEKDAY_PLURALS: Record<(typeof WEEKDAYS)[number], string> = { Mon: 'Mondays', Tue: 'Tuesdays', Wed: 'Wednesdays', Thu: 'Thursdays', Fri: 'Fridays', Sat: 'Saturdays', Sun: 'Sundays' };

/**
 * The days a schedule names, without the hours: "Mon 4 pm; Tue, Wed and Fri
 * 10:30 am" is "Mondays, Tuesdays, Wednesdays and Fridays", a range ("Monday
 * to Friday", "Mon–Thu") is every day in it, and all five weekdays are
 * "weekdays" ("weekdays and Saturdays"). Nothing where the schedule names
 * no day. For the one-line storytime entry (isStorytimeProgram).
 */
export function scheduleDays(schedule: string | undefined): string | undefined {
  if (!schedule) return undefined;
  const DAY = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b/gi;
  const index = (word: string) => WEEKDAYS.indexOf((word[0]!.toUpperCase() + word.slice(1, 3).toLowerCase()) as (typeof WEEKDAYS)[number]);
  const found = new Set<number>();
  for (const m of schedule.matchAll(new RegExp(`${DAY.source}\\s*(?:to|through|-|–)\\s*${DAY.source}`, 'gi'))) {
    const [from, to] = [index(m[1]!), index(m[2]!)];
    for (let d = from; d <= to; d++) found.add(d);
  }
  for (const m of schedule.matchAll(DAY)) found.add(index(m[1]!));
  const days = WEEKDAYS.filter((_, i) => found.has(i));
  if (days.length === 0) return undefined;
  const weekdays = days.filter((d) => d !== 'Sat' && d !== 'Sun');
  const weekend = days.filter((d) => d === 'Sat' || d === 'Sun').map((d) => WEEKDAY_PLURALS[d]);
  const words = weekdays.length === 5 ? ['weekdays', ...weekend] : [...weekdays.map((d) => WEEKDAY_PLURALS[d]), ...weekend];
  return words.length <= 2 ? words.join(' and ') : `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`;
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
  return isFreeCost(p.data.price);
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

/**
 * Where a program stands on the day the page is built: open, not started
 * yet, full, on a break or ended (Lyons audit, 26 October 2026). Read in
 * this order, each from the file's own dates or the organizer's word:
 *
 * 1. A session whose last day (`ends`) has gone by is ended, unless the
 *    next session's sign-ups are already dated ahead.
 * 2. The organizer's `status`, while it holds (from `statusFrom`, through
 *    `statusUntil`); a break that is over reads as running again.
 * 3. A start (`starts`) or a sign-up opening (`registration.opens`) still
 *    ahead is not started yet.
 * 4. Sign-ups open now (an opening behind us, or none, and a deadline
 *    ahead), or a session under way between `starts` and `ends`, is open.
 *
 * Anything else says nothing: a weekly storytime with no dates is not
 * called open because the file is silent, and a passed deadline is the
 * row's to say. `detail` is one short line with the date that decides it.
 */
export interface ProgramStatus {
  state: ProgramStatusState;
  label: string;
  detail?: string;
}

/** "October 7", or "January 11, 2027" when the year is not this one. */
function dayText(d: Date, now: Date): string {
  return d.getFullYear() === now.getFullYear() ? formatMonthDay(d) : formatDate(d);
}

const join = (...parts: Array<string | undefined>) => parts.filter(Boolean).join('. ') || undefined;

export function programStatus(p: ProgramLike, now = new Date()): ProgramStatus | undefined {
  const d = p.data;
  const today = dayKey(now);
  const ahead = (x?: Date) => !!x && dayKey(x) > today;
  const behind = (x?: Date) => !!x && dayKey(x) < today;
  const make = (state: ProgramStatusState, detail?: string): ProgramStatus => ({ state, label: PROGRAM_STATUS_LABELS[state], detail });
  const r = d.registration;

  // 1. The session is over, and the next one is not dated.
  if (behind(d.ends) && !ahead(r?.opens)) {
    return make('ended', join(`Ended ${dayText(d.ends!, now)}`, d.status === 'ended' ? d.statusNote : undefined));
  }
  // 2. The organizer's word, while it holds.
  if (d.status && !ahead(d.statusFrom) && !behind(d.statusUntil)) {
    if (d.status === 'paused') return make('paused', join(d.statusNote, `Back after ${dayText(d.statusUntil!, now)}`));
    if (d.status === 'upcoming' && ahead(d.starts)) return make('upcoming', join(d.statusNote, `Starts ${dayText(d.starts!, now)}`));
    return make(d.status, d.statusNote);
  }
  // 3. Not started, or not taking sign-ups, yet.
  if (ahead(d.starts)) return make('upcoming', `Starts ${dayText(d.starts!, now)}`);
  if (ahead(r?.opens)) return make('upcoming', `Sign-ups open ${dayText(r!.opens!, now)}`);
  // 4. Taking sign-ups, or under way.
  if (r?.deadline && !behind(r.deadline)) return make('open', `Sign up by ${dayText(r.deadline, now)}`);
  if (d.starts && d.ends && !ahead(d.starts) && !behind(d.ends)) return make('open', `Runs through ${dayText(d.ends, now)}`);
  // 5. The deadline has passed and nothing says the session is on: closed,
  // said so, rather than a muted "deadline was" among the open rows (the
  // owner's brief, 6 November 2026). A program that names its next opening
  // was caught by rule 3; one that has started is "open" by rule 4.
  if (r?.deadline && behind(r.deadline)) return make('closed', `Registration closed ${dayText(r.deadline, now)}`);
  return undefined;
}

/**
 * A break the organizer has announced that has not begun, within the next
 * `days` days: "A break October 27 to November 11", so a parent reading on
 * the Monday is not sent to Tuesday's storytime.
 */
export function breakAhead(p: ProgramLike, now = new Date(), days = SOON_DAYS): string | undefined {
  const d = p.data;
  if (d.status !== 'paused' || !d.statusFrom || !d.statusUntil) return undefined;
  const until = daysBetween(now, d.statusFrom);
  if (until <= 0 || until > days) return undefined;
  const span = `${dayText(d.statusFrom, now)} to ${dayText(d.statusUntil, now)}`;
  return d.statusNote ? `${d.statusNote}, ${span}` : `A break ${span}`;
}

/** Ended for the season: kept off the age sections and the free list, and listed once at the foot of the hub. */
export function isEnded(p: ProgramLike, now = new Date()): boolean {
  return programStatus(p, now)?.state === 'ended';
}

/**
 * The order within a section by what a reader can still act on: the full
 * ones after the rest, the ended ones last (the hub lists those apart).
 * Stable, so the section's own order (age, featured, name) stands within
 * each rank.
 */
export function byActionable<T extends ProgramLike>(list: readonly T[], now = new Date()): T[] {
  const rank = (p: T) => {
    const s = programStatus(p, now)?.state;
    return s === 'ended' ? 2 : s === 'full' || s === 'closed' ? 1 : 0;
  };
  return [...list].sort((a, b) => rank(a) - rank(b));
}

/**
 * A fact that holds more than one program's answer, split into its parts
 * (the audit of 13 November 2026): "Museum: all ages, free 11 and under;
 * card contest: K–5th grade" is two answers, each with its own label. Only
 * a value whose every part starts with a short "Name:" is split, so a
 * plain "Tue and Thu; 4 to 5 pm" stays one line. Nothing is reworded.
 */
export function factParts(text: string): Array<{ label?: string; text: string }> {
  const parts = text.split(/;\s+/);
  if (parts.length < 2) return [{ text }];
  const labelled = parts.map((p) => p.match(/^([^:;]{1,40}):\s+(.+)$/s));
  if (labelled.some((m) => !m)) return [{ text }];
  return labelled.map((m) => ({ label: m![1]!.charAt(0).toUpperCase() + m![1]!.slice(1), text: m![2]! }));
}

/** The age groups a families page can filter by, from the programs' `audience`: only those present, in age order. */
export const AGE_FILTERS = [
  { key: 'young', label: 'Babies and preschool', audiences: ['babies', 'preschool'] },
  { key: 'elementary', label: 'Elementary', audiences: ['elementary'] },
  { key: 'teens', label: 'Teens', audiences: ['teens'] },
] as const;
/** A program for families or for everyone is for every age. */
export const ALL_AGES = ['families', 'everyone'] as const;

/** The filter keys a program matches, as `data-ages` carries them; "all" where it is for every age. */
export function ageKeys(audience: readonly string[]): string[] {
  if (audience.some((a) => (ALL_AGES as readonly string[]).includes(a))) return ['all'];
  return AGE_FILTERS.filter((f) => f.audiences.some((a) => audience.includes(a))).map((f) => f.key);
}
