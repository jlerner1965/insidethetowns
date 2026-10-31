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
 *
 * An empty tab says "Nothing listed" and then what is next after its days,
 * up to three listings, each at its next date (`next`). The owner's
 * screenshot of Niwot on 31 October 2026, a Saturday: the Great Pumpkin
 * Party ended at 2 pm and took the only row with it, and all three tabs
 * read "Nothing listed" with 22 events on the calendar from Tuesday. The
 * empty line stays (a quiet day is a fact about the guide); the page just
 * no longer stops there.
 */
import { dayKey, formatDayShort, formatWeekday, startOfDay, TIME_ZONE } from './dates.ts';
import { sortByStart, weekendWindow } from './events.ts';
import { eventItem, type DayItem, type EventLike, type WeekDay } from './flagship-home.ts';

export const TAB_LIMIT = 5;

/** How many listings an empty tab offers under "Next in <Town>". */
export const NEXT_LIMIT = 3;

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
  /**
   * What is next after the tab's last day, shown only while the tab is
   * empty: when it was built empty, or once the browser's pruning has taken
   * its last row off (src/lib/expiry.ts).
   */
  next: TabRow[];
}

const SHORT_DAY = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });

/** Up to `limit` of a list: one-off and civic listings before the weekly series, then back in day and clock order. */
export function pickRows(items: TabRow[], limit = TAB_LIMIT): { rows: TabRow[]; more: number } {
  const byClock = (a: TabRow, b: TabRow) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time);
  const chosen = [...items].sort((a, b) => Number(!!a.series) - Number(!!b.series) || byClock(a, b)).slice(0, limit);
  return { rows: chosen.sort(byClock), more: items.length - chosen.length };
}

/**
 * Every occurrence as a row, in the order of the clock, the date before the
 * time ("Tue, Nov 3"): the pool an empty tab's "Next in <Town>" is drawn
 * from. Pass `occurrences` over a month or two, so a quiet town's next
 * listing three weeks out is still found.
 */
export function laterRows(events: readonly EventLike[], picked?: ReadonlySet<string>): TabRow[] {
  return sortByStart([...events]).map((e) => ({ ...eventItem(e, picked), dayWord: formatDayShort(e.data.start), dayKey: dayKey(e.data.start) }));
}

/**
 * The first `limit` rows after a day: one row a listing (a weekly series
 * once, at its next date), and nothing called off, since a canceled show
 * is not what is next.
 */
export function nextAfter(rows: readonly TabRow[], afterKey: string, limit = NEXT_LIMIT): TabRow[] {
  const seen = new Set<string>();
  const next: TabRow[] = [];
  for (const row of rows) {
    if (next.length >= limit) break;
    if (row.dayKey <= afterKey || row.status || seen.has(row.href)) continue;
    seen.add(row.href);
    next.push(row);
  }
  return next;
}

/** Friday, Saturday or Sunday in Denver: the weekend tab opens. */
export function defaultTab(now = new Date()): TabKey {
  const word = formatWeekday(startOfDay(now));
  return /^(Fri|Sat|Sun)/.test(word) ? 'weekend' : 'today';
}

/**
 * The three tabs from the seven days (`weekDays` with `start: 'today'` and
 * no cap, so the choice of five is made here, over the whole weekend at
 * once), each with what is next after it from `later` (`laterRows`).
 */
export function homeTabs(days: readonly WeekDay[], now = new Date(), limit = TAB_LIMIT, later: readonly TabRow[] = []): HomeTab[] {
  const all = (day: WeekDay | undefined, word: boolean): TabRow[] =>
    (day?.items ?? []).map((item) => ({ ...item, dayWord: word ? SHORT_DAY.format(day!.date) : '', dayKey: day!.key }));
  const { start, sunday } = weekendWindow(now);
  const startKey = dayKey(start);
  const sundayKey = dayKey(sunday);
  const weekendDays = days.filter((d) => d.key >= startKey && d.key <= sundayKey);
  const today = pickRows(all(days[0], false), limit);
  const tomorrow = pickRows(all(days[1], false), limit);
  const weekend = pickRows(weekendDays.flatMap((d) => all(d, true)), limit);
  const todayKey = days[0]?.key ?? dayKey(now);
  const tomorrowKey = days[1]?.key ?? todayKey;
  return [
    { key: 'today', label: 'Today', empty: 'Nothing listed for today.', href: '/events/?when=today', ...today, next: nextAfter(later, todayKey) },
    { key: 'tomorrow', label: 'Tomorrow', empty: 'Nothing listed for tomorrow.', href: `/events/#day-${days[1]?.key ?? ''}`, ...tomorrow, next: nextAfter(later, tomorrowKey) },
    { key: 'weekend', label: 'This weekend', empty: 'Nothing listed for the weekend yet.', href: '/this-weekend/', ...weekend, next: nextAfter(later, sundayKey) },
  ];
}
