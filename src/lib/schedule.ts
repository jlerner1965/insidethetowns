/**
 * The days a run is on, when it is not on every day of its range.
 *
 * A run is one listing from `start` to `end`: a corn maze, a haunted house,
 * a season of carriage rides. Until 26 October 2026 the weekdays it kept
 * were prose only ("Thursday to Sunday nights"), so every date filter took
 * it to be on every day of its range, and Erie's "Today" on a Monday listed
 * Terror in the Corn, which is shut on Mondays. `schedule` says the same
 * thing as data: the weekdays it opens, each with its hours where the
 * organizer gives them; `except` names the days within the range it does
 * not (a holiday, a night the organizer cancelled). Both are read from the
 * listing's own source, like every other field.
 *
 * Pure and dependency-free beyond src/lib/dates.ts, so the schema, the
 * occurrence expansion and the tests all read the same rule.
 */
import { TIME_ZONE, addDays, dayKey, fromWallClock, startOfDay } from './dates.ts';

/** Weekdays as the schema writes them, in JavaScript's order (Sunday first). */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** "19:00": a wall-clock time in Denver. */
export const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface ScheduleEntry {
  /** The weekdays these hours apply to. */
  days: readonly Weekday[];
  /** Opening time that day, "19:00". Absent: the run's own start time (or the whole day, for an all-day run). */
  start?: string;
  /** Closing time, "23:00"; earlier than `start` means after midnight. */
  end?: string;
}

const SHORT: Record<string, Weekday> = { Sun: 'sun', Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat' };
const weekdayFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });

/** The Denver weekday of an instant, as the schema writes it. */
export function weekdayOf(date: Date): Weekday {
  return SHORT[weekdayFormat.format(date)]!;
}

/** "19:00" for the Denver wall clock of an instant. */
export function clockOf(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('hour')}:${get('minute')}`;
}

/** The instant `clock` ("19:00") falls at on the Denver day containing `day`, across the clock changes. */
export function atClock(day: Date, clock: string): Date {
  const [y, m, d] = dayKey(day).split('-').map(Number);
  const [h, min] = clock.split(':').map(Number);
  return fromWallClock(y!, m!, d!, h!, min!);
}

/** The schedule entry that covers a Denver day's weekday, if any. */
export function entryFor(schedule: readonly ScheduleEntry[], day: Date): ScheduleEntry | undefined {
  const dow = weekdayOf(day);
  return schedule.find((s) => s.days.includes(dow));
}

export interface RunLike {
  start: Date;
  end?: Date;
  allDay?: boolean;
  schedule?: readonly ScheduleEntry[];
  except?: readonly Date[];
}

export interface Sitting {
  start: Date;
  end?: Date;
  allDay: boolean;
  /** The schedule gave this day's hours: the run's own time note no longer describes it. */
  ownHours: boolean;
}

/**
 * Every day a scheduled run is on, as a sitting with that day's hours, from
 * the day of `start` to the day of `end` inclusive (a timed sitting must
 * open before `end`), leaving out the weekdays
 * the schedule does not name and the `except` days. Stops at `horizon` (an
 * instant; a sitting starting after it is not returned).
 *
 * A day's hours are the schedule entry's where it gives them, else the run's
 * own start and end times; an all-day run with no hours stays all day. A
 * closing time at or before the opening one is the next morning's: a 7 pm to
 * 1 am haunted house is on until 1 am, not over before it opened.
 */
export function runSittings(run: RunLike, horizon = Infinity): Sitting[] {
  const { start, end, allDay = false, schedule, except = [] } = run;
  if (!schedule?.length || !end) return [];
  const skip = new Set(except.map((d) => dayKey(d)));
  const last = dayKey(end);
  // An all-day run's `end` is its last day, whole.
  const closesBy = (allDay ? addDays(startOfDay(end), 1) : end).getTime();
  const out: Sitting[] = [];
  for (let day = startOfDay(start); dayKey(day) <= last && day.getTime() <= horizon; day = addDays(day, 1)) {
    if (skip.has(dayKey(day))) continue;
    const entry = entryFor(schedule, day);
    if (!entry) continue;
    const ownHours = !!entry.start;
    if (allDay && !ownHours) {
      out.push({ start: day, allDay: true, ownHours });
      continue;
    }
    const opens = atClock(day, entry.start ?? clockOf(start));
    // A timed run is over at its `end`: an overnight Friday that closes at
    // 1 am Saturday is the last night when the run ends then.
    if (opens.getTime() > horizon || opens.getTime() >= closesBy) break;
    const closing = entry.end ?? (ownHours ? undefined : clockOf(end));
    let closes = closing ? atClock(day, closing) : undefined;
    if (closes && closes.getTime() <= opens.getTime()) closes = atClock(addDays(day, 1), closing!);
    out.push({ start: opens, end: closes, allDay: false, ownHours });
  }
  return out;
}

/** Whether a Denver day is one of the run's days off: not a scheduled weekday, or named in `except`. */
export function isDayOff(run: RunLike, day: Date): boolean {
  if ((run.except ?? []).some((d) => dayKey(d) === dayKey(day))) return true;
  return !!run.schedule?.length && !entryFor(run.schedule, day);
}
