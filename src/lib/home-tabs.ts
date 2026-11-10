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
import { addDays, dayKey, formatDayShort, formatWeekday, startOfDay, TIME_ZONE } from './dates.ts';
import { FILL_BELOW, isPast, sortByStart, weekendWindow } from './events.ts';
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

/**
 * What a reader opens the tab for comes first (the owner, 10 November 2026,
 * the day the library feeds were turned on and a weekend opened with a
 * library's programs above the bands): 0 the week's pick, a game, and the
 * outings (music, a market, a festival, the arts, food, the outdoors,
 * something for families); 1 any other one-off; 2 a library's own program
 * and a civic meeting, which are worth their line and are never why someone
 * opened the page.
 */
export function tabRank(row: Pick<TabRow, 'pick' | 'category' | 'program' | 'kind'>): number {
  if (row.pick || row.kind === 'game') return 0;
  if (row.program || row.category === 'civic') return 2;
  return row.category && (row.category === 'sports' || LEAD_CATEGORIES.includes(row.category) || OUTING_CATEGORIES.includes(row.category)) ? 0 : 1;
}

/**
 * Up to `limit` of a list. The one-offs take the slots, the outings before
 * a library's programs and the meetings (`tabRank`), so a library program
 * is shown only where the outings leave room, and under them; within a rank
 * the order is the day's and the clock's. The regulars (`series`: trivia, a monthly
 * club, the day's food truck; events.ts, fillTest) are shown only on a quiet
 * list, one with fewer than FILL_BELOW one-offs, and only up to that many
 * rows in all: they keep a thin guide's Tuesday from reading "Nothing
 * listed" and never lead a full one (the owner, 10 November 2026). Until
 * then a regular took any slot a one-off left free, so a tab with two events
 * showed them among three storytimes. A listing called off or postponed
 * comes last: a cancellation is worth its line while the tab has room, and
 * on a full tab it gives up its slot first (Erie, 3 November 2026: a
 * canceled workshop held one of the weekend's five slots). The count of the
 * rest is of listings still on, the regulars not shown among them, so "3
 * more today" leads to them on the events page.
 */
export function pickRows(items: TabRow[], limit = TAB_LIMIT): { rows: TabRow[]; more: number } {
  const byClock = (a: TabRow, b: TabRow) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time);
  const byRank = (a: TabRow, b: TabRow) => tabRank(a) - tabRank(b) || byClock(a, b);
  const sorted = [...items].sort(byClock);
  const chosen = sorted.filter((r) => !r.status && !r.series).sort(byRank).slice(0, limit);
  const fill = Math.min(limit, FILL_BELOW) - chosen.length;
  if (fill > 0) chosen.push(...sorted.filter((r) => !r.status && r.series).slice(0, fill));
  chosen.push(...sorted.filter((r) => r.status).slice(0, Math.max(0, limit - chosen.length)));
  const on = (list: TabRow[]) => list.filter((r) => !r.status).length;
  // The outings first, then the programs and meetings: each in clock order.
  const lower = (r: TabRow) => (tabRank(r) === 2 ? 1 : 0);
  return { rows: chosen.sort((a, b) => lower(a) - lower(b) || byClock(a, b)), more: on(items) - on(chosen) };
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
    // A regular kept as a file per date has a page per date: once, by its title at its venue.
    const key = row.series ? `${row.fullTitle}|${row.where}` : row.href;
    if (row.dayKey <= afterKey || row.status || seen.has(key)) continue;
    seen.add(key);
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

/**
 * How many days after the build's the home page carries its tabs for. The
 * page is built at about 4 am and read until the next build, so from
 * midnight "Today" held yesterday's rows, every one already taken off by the
 * browser, and every guide read "Nothing listed for today" with today's
 * listings sitting under Tomorrow (the owner's screenshot of Leadville, 10
 * November 2026, 1:39 am, on a page built on the 9th). So the tabs are built
 * once for the build's day and once for each of the next TAB_DAYS_AHEAD, and
 * the browser shows the set made for the reader's own Denver date
 * (`asOfFor` in src/lib/relative-days.ts). Two days ahead covers a night's
 * rebuild that GitHub starts late or drops.
 */
export const TAB_DAYS_AHEAD = 2;

/** The three tabs as they read on one Denver day. */
export interface TabEdition {
  /** "2026-11-10": the day this set's Today is. */
  asOf: string;
  tabs: HomeTab[];
}

/** The tabs for the build's day and each of the next `ahead`: `build` is given the moment to read from (now, then each following midnight). */
export function tabEditions(build: (asOf: Date) => HomeTab[], now = new Date(), ahead = TAB_DAYS_AHEAD): TabEdition[] {
  return Array.from({ length: ahead + 1 }, (_, i) => {
    const asOf = i === 0 ? now : addDays(startOfDay(now), i);
    return { asOf: dayKey(asOf), tabs: build(asOf) };
  });
}

/** How far ahead, in days, the "Don't miss" card looks for a featured listing. */
export const DONT_MISS_DAYS = 21;

/**
 * The "Don't miss" card beside the tabs (the owner, 7 November 2026, after
 * comparing the guide with niwot.com, whose front page gives its festivals
 * photographs while ours set Enchanted Evening in the same row as a band
 * night): the next listing the editor flagged `featured` that starts within
 * DONT_MISS_DAYS of today, still on as listed and not over. A called-off or
 * moved one is never offered as something not to miss; the tabs still carry
 * it with its label. Nothing when none qualifies: the card is the
 * `featured` flag's to earn, not a slot to fill.
 */
export function dontMiss<E extends EventLike>(events: readonly E[], now: Date, days = DONT_MISS_DAYS): E | undefined {
  const until = addDays(startOfDay(now), days + 1).getTime();
  return sortByStart([...events]).find(
    (e) => e.data.featured === true && (e.data.status ?? 'scheduled') === 'scheduled' && !isPast(e, now) && e.data.start.getTime() < until,
  );
}

/**
 * A school game on the home page's tabs says whose game it is and where:
 * "Niwot volleyball vs Fruita Monument" over "Home", where the list had
 * "Volleyball vs Fruita Monument" and an empty venue column, the same line
 * the school's strip had just shown above it (the owner, 7 November 2026).
 * Only the tabs: the events page and the Thursday email set games under the
 * school's own heading already, so their titles are left as they are.
 */
export function labelGames(days: readonly WeekDay[], school: string): WeekDay[] {
  const named = (title: string) => `${school} ${title.charAt(0).toLowerCase()}${title.slice(1)}`;
  return days.map((day) => ({
    ...day,
    items: day.items.map((item) =>
      item.kind === 'game'
        ? { ...item, title: named(item.title), fullTitle: named(item.fullTitle), where: [item.site, item.where].filter(Boolean).join(' · ') }
        : item,
    ),
  }));
}
