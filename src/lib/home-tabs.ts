/**
 * What's happening on the home page (the homepage redesign brief, 27
 * October 2026): three tabs, Today, Tomorrow and This weekend, each up to
 * five rows and a count of the rest, built from the same `weekDays` reading
 * the Thursday email and the events page use, so the tabs never disagree
 * with either about a day.
 *
 * The weekend is `weekendWindow`'s: the one running now on a Friday,
 * Saturday or Sunday, else the one coming. Its rows carry the day's short
 * name before the time ("Sat · 10 am"), since three days share one list.
 * On a full tab the weekly series give up the visible slots first, as a
 * full day does on the events page, and the five shown are in the order of
 * the days and the clock.
 *
 * The default tab is Today, except on a Friday, Saturday or Sunday, when
 * it is the weekend the reader is standing in.
 */
import { dayKey, formatWeekday, startOfDay, TIME_ZONE } from './dates.ts';
import { weekendWindow } from './events.ts';
import type { DayItem, WeekDay } from './flagship-home.ts';

export const TAB_LIMIT = 5;

export type TabKey = 'today' | 'tomorrow' | 'weekend';

export interface TabRow extends DayItem {
  /** "Sat" before the time on the weekend tab, where three days share one list; empty on a day's own tab. */
  dayWord: string;
  /** The day the row is on, for the order within the weekend. */
  dayKey: string;
}

export interface HomeTab {
  key: TabKey;
  label: string;
  /** "Nothing listed for today" when the tab is empty. */
  empty: string;
  rows: TabRow[];
  /** Listed on those days beyond the rows shown. */
  more: number;
  /** Where "All events" goes for this tab: the events page's day or weekend view. */
  href: string;
}

const SHORT_DAY = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });

/** Up to `limit` of a list: one-off and civic listings before the weekly series, then back in day and clock order. */
export function pickRows(items: TabRow[], limit = TAB_LIMIT): { rows: TabRow[]; more: number } {
  const byClock = (a: TabRow, b: TabRow) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time);
  const chosen = [...items].sort((a, b) => Number(!!a.series) - Number(!!b.series) || byClock(a, b)).slice(0, limit);
  return { rows: chosen.sort(byClock), more: items.length - chosen.length };
}

/** Friday, Saturday or Sunday in Denver: the weekend tab opens. */
export function defaultTab(now = new Date()): TabKey {
  const word = formatWeekday(startOfDay(now));
  return /^(Fri|Sat|Sun)/.test(word) ? 'weekend' : 'today';
}

/**
 * The three tabs from the seven days (`weekDays` with `start: 'today'` and
 * no cap, so the choice of five is made here, over the whole weekend at
 * once).
 */
export function homeTabs(days: readonly WeekDay[], now = new Date(), limit = TAB_LIMIT): HomeTab[] {
  const all = (day: WeekDay | undefined, word: boolean): TabRow[] =>
    (day?.items ?? []).map((item) => ({ ...item, dayWord: word ? SHORT_DAY.format(day!.date) : '', dayKey: day!.key }));
  const { start, sunday } = weekendWindow(now);
  const startKey = dayKey(start);
  const sundayKey = dayKey(sunday);
  const weekendDays = days.filter((d) => d.key >= startKey && d.key <= sundayKey);
  const today = pickRows(all(days[0], false), limit);
  const tomorrow = pickRows(all(days[1], false), limit);
  const weekend = pickRows(weekendDays.flatMap((d) => all(d, true)), limit);
  return [
    { key: 'today', label: 'Today', empty: 'Nothing listed for today.', href: '/events/?when=today', ...today },
    { key: 'tomorrow', label: 'Tomorrow', empty: 'Nothing listed for tomorrow.', href: `/events/#day-${days[1]?.key ?? ''}`, ...tomorrow },
    { key: 'weekend', label: 'This weekend', empty: 'Nothing listed for the weekend yet.', href: '/this-weekend/', ...weekend },
  ];
}
