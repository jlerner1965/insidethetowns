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
 * it is the weekend the reader is standing in, until five on the Sunday
 * afternoon: from then the weekend is over for anyone planning, and every
 * home opened on a weekend tab reading "Nothing listed" or an 11 am show at
 * 9 pm (the reader pass, 1 November 2026), so Tomorrow opens instead. On
 * the Sunday the weekend tab's empty line says "Nothing more", not "yet".
 *
 * An empty tab says "Nothing listed" and then what is next after its days,
 * up to three listings, each at its next date (`next`): the week's pick
 * first, then the one-off outings (a festival, a market, music, the arts, a
 * family day, food, the outdoors) in the order of the days, and only then
 * the civic calendar and the weekly regulars; the last slot is kept for the
 * next festival, market or music when none fell inside the three. In time order alone a Sunday night offered Monday's storytimes and
 * a council meeting while the Parade of Lights sat a page away (the reader
 * pass, 1 November 2026). The owner's
 * screenshot of Niwot on 31 October 2026, a Saturday: the Great Pumpkin
 * Party ended at 2 pm and took the only row with it, and all three tabs
 * read "Nothing listed" with 22 events on the calendar from Tuesday. The
 * empty line stays (a quiet day is a fact about the guide); the page just
 * no longer stops there.
 */
import { dayKey, formatDayShort, formatWeekday, startOfDay, TIME_ZONE } from './dates.ts';
import { sortByStart, weekendWindow } from './events.ts';
import { eventItem, type DayItem, type EventLike, type WeekDay } from './flagship-home.ts';
import type { EventCategory } from '../content/schemas.ts';

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
export function laterRows<E extends EventLike>(events: readonly E[], picked?: ReadonlySet<string>, isSeries: (e: E) => boolean = () => false): TabRow[] {
  return sortByStart([...events]).map((e) => ({ ...eventItem(e, picked), series: isSeries(e), dayWord: formatDayShort(e.data.start), dayKey: dayKey(e.data.start) }));
}

/** The kinds a reader comes to town for: one of the three slots is kept for the next of these. */
export const LEAD_CATEGORIES: readonly EventCategory[] = ['festival', 'market', 'music'];
/** The other one-offs worth a line: a talk, a craft session, a dinner, a walk. */
export const OUTING_CATEGORIES: readonly EventCategory[] = ['arts', 'family', 'food', 'outdoors'];

/** 0 the week's pick, 1 a one-off outing, 2 a meeting, a game, a weekly regular. */
export function nextRank(row: Pick<TabRow, 'pick' | 'series' | 'category'>): number {
  if (row.pick) return 0;
  if (row.series || !row.category) return 2;
  return LEAD_CATEGORIES.includes(row.category) || OUTING_CATEGORIES.includes(row.category) ? 1 : 2;
}

/** A one-off festival, market or music: what the last slot is kept for. */
const isLead = (row: Pick<TabRow, 'series' | 'category'>) => !row.series && !!row.category && LEAD_CATEGORIES.includes(row.category);

/**
 * The first `limit` rows after a day: one row a listing (a weekly series
 * once, at its next date), and nothing called off, since a canceled show
 * is not what is next.
 */
export function nextAfter(rows: readonly TabRow[], afterKey: string, limit = NEXT_LIMIT): TabRow[] {
  const seen = new Set<string>();
  const after: TabRow[] = [];
  for (const row of rows) {
    if (row.dayKey <= afterKey || row.status || seen.has(row.href)) continue;
    seen.add(row.href);
    after.push(row);
  }
  // By rank, then as given (the order of the days and the clock): a stable sort.
  const ranked = after
    .map((row, i) => ({ row, i }))
    .sort((a, b) => nextRank(a.row) - nextRank(b.row) || a.i - b.i)
    .map(({ row }) => row);
  const next = ranked.slice(0, limit);
  // The last slot is the next festival, market or music when none made the
  // list on its date, so the big thing a month out is on the home with the
  // week's crafts and talks, not only on the Events page.
  if (limit > 1 && !next.some(isLead)) {
    const big = ranked.find((row) => isLead(row) && !next.includes(row));
    if (big) next[next.length - 1] = big;
  }
  return next;
}

/** The Denver hour from which a Sunday's weekend is over for the tabs: Tomorrow opens. Also in WhatsHappening.astro's script. */
export const WEEKEND_OVER_HOUR = 17;

const DENVER_HOUR = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', hourCycle: 'h23' });

/** Friday, Saturday or Sunday in Denver: the weekend tab opens, until five on the Sunday afternoon, when Tomorrow does. */
export function defaultTab(now = new Date()): TabKey {
  const word = formatWeekday(startOfDay(now));
  if (/^Sun/.test(word) && Number(DENVER_HOUR.format(now)) >= WEEKEND_OVER_HOUR) return 'tomorrow';
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
  // On the Sunday "yet" is wrong: the weekend is not waiting for listings.
  const weekendEmpty = todayKey === sundayKey ? 'Nothing more listed this weekend.' : 'Nothing listed for the weekend yet.';
  return [
    { key: 'today', label: 'Today', empty: 'Nothing listed for today.', href: '/events/?when=today', ...today, next: nextAfter(later, todayKey) },
    { key: 'tomorrow', label: 'Tomorrow', empty: 'Nothing listed for tomorrow.', href: `/events/#day-${days[1]?.key ?? ''}`, ...tomorrow, next: nextAfter(later, tomorrowKey) },
    { key: 'weekend', label: 'This weekend', empty: weekendEmpty, href: '/this-weekend/', ...weekend, next: nextAfter(later, sundayKey) },
  ];
}
