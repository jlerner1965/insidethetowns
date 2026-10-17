/**
 * How sure the guide is of an event, and what that lets a page say and show.
 *
 * Two levels, worked out from what the file already carries, never typed in:
 *
 * - confirmed: the organizer said so, recently. Its own page or feed, read
 *   within FRESHNESS.events.confirmedDays (the nightly re-check keeps that
 *   date moving), or a person's call or email to it in the same window.
 * - listed: the event is on a community calendar and nobody has confirmed it
 *   with the organizer, or its last confirmation has gone stale. It shows,
 *   with a line saying so, only FRESHNESS.events.listedAheadDays ahead, and
 *   it is kept out of everything that recommends.
 *
 * A weekly series is the organizer's rule carried forward, and the rule is
 * what drifts: every dead listing the Lyons check of 16 October 2026 found
 * was a regular. So a series' dates run FRESHNESS.events.seriesDays past its
 * last confirmation and stop there, and the next confirmation moves them on.
 * Dated listings (a one-off, a production's shows) are the organizer's own
 * dates and are not cut.
 *
 * An event leaves the site only when nothing current stands behind it: a
 * community-calendar listing not seen there in FRESHNESS.events.calendarDays,
 * or a series whose shown dates have all passed. Evidence that a listing is
 * wrong is a different matter: the re-check flags it and a person decides.
 *
 * Pure, and importing only the dates and the windows, so the Chamber site's
 * sync can load it from a checkout of this repository and apply the same rule.
 */
import { FRESHNESS } from '../config/freshness.ts';
import { communityCalendar } from './community-calendars.ts';
import { addDays, dayKey, formatDate, formatShortDate, formatWeekday, startOfDay } from './dates.ts';

export type ConfidenceLevel = 'confirmed' | 'listed';
/** What the level rests on: the organizer's page or feed, a person who asked, a community calendar, or a confirmation gone stale. */
export type ConfidenceBasis = 'source' | 'phone' | 'email' | 'in-person' | 'calendar' | 'stale';
export type ConfirmationMethod = 'phone' | 'email' | 'in-person';

export interface Confidence {
  level: ConfidenceLevel;
  basis: ConfidenceBasis;
  /** The day the level rests on. */
  on?: Date;
  /** Who: the site read, the person or office asked, the calendar's name. */
  by?: string;
  /** For rows and cards. Unset for a plain check against the organizer's page, which the check date already says. */
  short?: string;
  /** For the event page, a sentence or two. Unset for a plain check against the organizer's page. */
  line?: string;
}

export interface EventPresentation {
  confidence: Confidence;
  /** Set when the event is not shown at all, saying why, for the build log. */
  hidden?: string;
  /** A weekly series' last shown date, when it stops short of `until`. */
  until?: Date;
  /** The series line to show when `until` was cut, so the card claims no end the organizer never gave. */
  recurring?: string;
}

/** The fields this reads; a parsed event's data has all of them. */
export interface ConfidenceInput {
  start: Date;
  repeat?: 'weekly';
  until?: Date;
  venue?: string;
  recurring?: string;
  source?: string;
  verified?: Date;
  confirmed?: { how: ConfirmationMethod; with: string; on: Date; note?: string };
}

const DAY = 86_400_000;
const ageDays = (d: Date, now: Date) => Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / DAY);
const HOW: Record<ConfirmationMethod, string> = { phone: 'by phone', email: 'by email', 'in-person': 'in person' };

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** The level an event stands at today, and the words for it. */
export function eventConfidence(e: ConfidenceInput, now: Date = new Date()): Confidence {
  const w = FRESHNESS.events;
  const calendar = communityCalendar(e.source);
  // The freshest word from the organizer: its own page or feed, or a person who asked.
  const fromOrganizer: Confidence[] = [];
  if (e.confirmed) {
    const c = e.confirmed;
    fromOrganizer.push({
      level: 'confirmed',
      basis: c.how,
      on: c.on,
      by: c.with,
      short: `Confirmed ${HOW[c.how]}, ${formatShortDate(c.on)}`,
      line: `Confirmed ${HOW[c.how]} with ${c.with} on ${formatDate(c.on)}.`,
    });
  }
  if (e.source && e.verified && !calendar) {
    fromOrganizer.push({ level: 'confirmed', basis: 'source', on: e.verified, by: hostOf(e.source) });
  }
  fromOrganizer.sort((a, b) => b.on!.getTime() - a.on!.getTime());
  const best = fromOrganizer[0];
  if (best && ageDays(best.on!, now) <= w.confirmedDays) return best;
  if (calendar && e.verified) {
    const venue = e.venue ? e.venue.replace(/\s*\(.*\)$/, '') : 'the venue';
    return {
      level: 'listed',
      basis: 'calendar',
      on: e.verified,
      by: calendar,
      short: 'From a community calendar',
      line: `From ${calendar}, seen there ${formatDate(e.verified)}. Worth a quick check with ${venue} before you go.`,
    };
  }
  const last = best?.on ?? e.verified;
  return {
    level: 'listed',
    basis: 'stale',
    on: last,
    by: best?.by,
    short: last ? `Last checked ${formatShortDate(last)}` : 'Not recently checked',
    line: last
      ? `Last checked with the organizer on ${formatDate(last)}. Worth a quick check before you go.`
      : 'Not recently checked with the organizer. Worth a quick check before you go.',
  };
}

/** Whether an event shows today, and how much of it: the level, and a series cut to its confirmed weeks. */
export function eventPresentation(e: ConfidenceInput, now: Date = new Date()): EventPresentation {
  const w = FRESHNESS.events;
  const confidence = eventConfidence(e, now);
  if (!e.start) return { confidence };
  const today = startOfDay(now);
  if (confidence.basis === 'calendar' && ageDays(confidence.on!, now) > w.calendarDays) {
    return {
      confidence,
      hidden: `rests on ${confidence.by} alone, last seen there ${dayKey(confidence.on!)}, more than ${w.calendarDays} days ago`,
    };
  }
  // The last day dates are shown through: a listed event's few weeks ahead,
  // and a weekly series' confirmed weeks, whichever ends first.
  let through: Date | undefined = confidence.level === 'listed' ? addDays(today, w.listedAheadDays) : undefined;
  const series = e.repeat === 'weekly' && !!e.until;
  if (series) {
    const confirmedThrough = confidence.on ? addDays(startOfDay(confidence.on), w.seriesDays) : today;
    if (!through || confirmedThrough.getTime() < through.getTime()) through = confirmedThrough;
  }
  if (!through) return { confidence };
  const last = dayKey(through);
  if (!series) {
    if (dayKey(e.start) <= last) return { confidence };
    const from = dayKey(addDays(startOfDay(e.start), -w.listedAheadDays));
    return { confidence, hidden: `${describe(confidence)}; shown from ${from}, ${w.listedAheadDays} days ahead` };
  }
  if (dayKey(e.until!) <= last) return { confidence };
  let lastStart: Date | undefined;
  for (let d = e.start; dayKey(d) <= last; d = addDays(d, 7)) lastStart = d;
  if (!lastStart || dayKey(lastStart) < dayKey(today)) {
    const confirmed = confidence.on ? `last confirmed ${dayKey(confidence.on)}` : 'never confirmed';
    return {
      confidence,
      hidden: lastStart
        ? `a weekly series ${confirmed}; its dates run ${w.seriesDays} days past a confirmation, to ${last}, and those have passed`
        : `a weekly series ${confirmed}; its dates run ${w.seriesDays} days past a confirmation, to ${last}, and its first is after that`,
    };
  }
  return { confidence, until: startOfDay(lastStart), recurring: e.recurring ?? `Every ${formatWeekday(e.start)}` };
}

function describe(c: Confidence): string {
  if (c.basis === 'calendar') return `listed on ${c.by} alone`;
  if (c.basis === 'stale') return `last confirmed ${c.on ? dayKey(c.on) : 'never'}, more than ${FRESHNESS.events.confirmedDays} days ago`;
  return 'confirmed';
}

/** A listing a reader should check before relying on: shown, but not recommended. */
export function isTentative(event: object): boolean {
  return (event as { confidence?: { level?: ConfidenceLevel } }).confidence?.level === 'listed';
}
