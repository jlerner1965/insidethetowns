/**
 * The home page's "For families" lines (Erie, 3 November 2026): up to three
 * things a parent can act on, from the same programs, district calendar and
 * events the family hub and the events page read, so the home never says
 * anything /families/ does not.
 *
 * 1. A school break with a camp or a program that keeps hours on it
 *    (`openOn`), within the next six weeks, named with the districts whose
 *    break it falls in, never "school's out" for every child in town. Only a
 *    program a reader can still join: no deadline, or one still ahead, and
 *    not full, paused or ended on the organizer's word.
 * 2. A registration deadline within the fortnight (SOON_DAYS), for a program not already
 *    named above.
 * 3. One free family listing this weekend, a one-off before a weekly
 *    series, nothing called off.
 *
 * A kind with nothing to say is left out, and the block with it when all
 * three are (TownHome.astro). Each line carries the last Denver day it is
 * true for (`day`) and, for an event, the instant it ends (`end`), which
 * the browser's pruning reads (src/lib/expiry.ts), so a build older than the
 * deadline shows fewer lines rather than a wrong one.
 */
import { dayKey, daysBetween, formatDayRange, formatDayShort, formatTime, parseLocal, toIsoLocal } from './dates.ts';
import { listedUntil, weekendWindow } from './events.ts';
import type { EventLike } from './flagship-home.ts';
import { ageText, deadlineAction, isFree, programStatus, splitDeadlines, type ProgramLike } from './programs.ts';

/** How far ahead a school break is worth a line on the home page. */
export const BREAK_DAYS = 42;

export interface FamilyBreak {
  district: string;
  from: string;
  to: string;
}

export interface FamilyLine {
  kind: 'break' | 'deadline' | 'free';
  /** The date first: "Register by Fri, Nov 13", "Mon, Nov 23 – Wed, Nov 25". */
  when: string;
  title: string;
  href: string;
  /** Ages, cost, the districts, as the organizer gives them; only those known. */
  facts: string[];
  /** The last Denver day the line is true for: `data-event-day`. */
  day: string;
  /** For an event, the instant it comes off: `data-end`. */
  end?: string;
}

/** "$125–$180 for each three-day camp", not the paragraph after it. */
export function shortPrice(price: string | undefined): string | undefined {
  const first = price?.split(/;|,\s/)[0]?.trim();
  return first || undefined;
}

/** "St. Vrain", "St. Vrain and Boulder Valley", "St. Vrain, Boulder Valley and Thompson". */
function districtList(names: string[]): string {
  return names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

const href = (p: ProgramLike) => `/families/#program-${p.slug ?? p.id ?? ''}`;

/** "Ages 6–14 on the day of camp" before a number; "Erie Middle School students" as the organizer wrote it. */
export function agesFact(ages: string | undefined): string | undefined {
  if (!ages) return undefined;
  const bare = ages.replace(/^ages?\s+/i, '');
  return /^(\d|up to\b|under\b)/i.test(bare) ? `Ages ${bare}` : ages;
}

function programFacts(p: ProgramLike): string[] {
  return [agesFact(ageText(p)), isFree(p) ? 'Free' : shortPrice(p.data.price)].filter((f): f is string => !!f);
}

/** The event's cost says free and nothing paid follows ("Free; registration required" is free). */
export function eventIsFree(cost: string | undefined): boolean {
  const c = cost?.trim() ?? '';
  return /^free\b/i.test(c) && !/\$/.test(c);
}

export function familyLines<P extends ProgramLike, E extends EventLike>({
  programs,
  breaks,
  events,
  now = new Date(),
  isSeries = () => false,
}: {
  programs: readonly P[];
  breaks: readonly FamilyBreak[];
  /** Occurrences, one entry a date (`occurrences`), over at least the coming weekend. */
  events: readonly E[];
  now?: Date;
  isSeries?: (e: E) => boolean;
}): FamilyLine[] {
  const today = dayKey(now);
  // Ended, full or paused: nothing to send a reader to.
  const live = programs.filter((p) => !['ended', 'full', 'paused'].includes(programStatus(p, now)?.state ?? ''));
  const lines: FamilyLine[] = [];

  // 1. The next school break a program keeps hours on.
  const windows = live
    .filter((p) => {
      const deadline = p.data.registration?.deadline;
      return !deadline || dayKey(deadline) >= today;
    })
    .flatMap((p) => (p.data.openOn ?? []).map((o) => ({ p, from: o.from, to: o.to })))
    .filter((w) => dayKey(w.to) >= today && daysBetween(now, w.from) <= BREAK_DAYS)
    .sort((a, b) => a.from.getTime() - b.from.getTime() || Number(!!b.p.data.featured) - Number(!!a.p.data.featured) || a.p.data.title.localeCompare(b.p.data.title));
  const brk = windows[0];
  if (brk) {
    const districts = [
      ...new Set(breaks.filter((b) => dayKey(parseLocal(b.from)) <= dayKey(brk.to) && dayKey(parseLocal(b.to)) >= dayKey(brk.from)).map((b) => b.district)),
    ];
    const deadline = brk.p.data.registration?.deadline;
    lines.push({
      kind: 'break',
      when: dayKey(brk.from) === dayKey(brk.to) ? formatDayShort(brk.from) : formatDayRange(brk.from, brk.to),
      title: brk.p.data.title,
      href: href(brk.p),
      facts: [
        ...(districts.length ? [`${districtList(districts)} break`] : []),
        ...programFacts(brk.p),
        ...(deadline ? [`${deadlineAction(brk.p)} ${formatDayShort(deadline)}`] : []),
      ],
      // Off at the deadline, where there is one before the camp ends: past
      // it the line's "Register by" is an invitation nobody can take up.
      day: deadline && dayKey(deadline) < dayKey(brk.to) ? dayKey(deadline) : dayKey(brk.to),
    });
  }

  // 2. A deadline within the fortnight, for a program not named above.
  const due = splitDeadlines(live, { now }).closingSoon.find((d) => d.program !== brk?.p);
  if (due) {
    lines.push({
      kind: 'deadline',
      when: `${deadlineAction(due.program)} ${formatDayShort(due.on)}`,
      title: due.program.data.title,
      href: href(due.program),
      facts: programFacts(due.program),
      day: dayKey(due.on),
    });
  }

  // 3. A free family listing this weekend.
  const { start, end } = weekendWindow(now);
  const free = events
    .filter((e) => {
      const d = e.data;
      return d.start >= start && d.start < end && listedUntil(e) > now && d.category === 'family' && d.status !== 'canceled' && d.status !== 'postponed' && eventIsFree(d.cost);
    })
    .sort((a, b) => Number(isSeries(a)) - Number(isSeries(b)) || a.data.start.getTime() - b.data.start.getTime())[0];
  if (free) {
    const d = free.data;
    lines.push({
      kind: 'free',
      when: `${formatDayShort(d.start)}${d.allDay ? '' : `, ${formatTime(d.start)}`}`,
      title: d.title,
      href: `/events/${free.slug ?? free.id ?? ''}/`,
      // The cost as the listing gives it: "Free; registration required" says what a parent needs.
      facts: [d.cost!.trim(), d.venue].filter((f): f is string => !!f),
      day: dayKey(d.start),
      end: toIsoLocal(listedUntil(free)),
    });
  }
  return lines;
}
