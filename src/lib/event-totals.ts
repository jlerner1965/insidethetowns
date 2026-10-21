/**
 * One definition of "how many events", for every page that prints a count.
 *
 * Three pages counted three ways: About counted listings (one trivia night
 * is one), the events page counted dates (a trivia night is fifteen), and
 * the home page counted the week's rows. The numbers are all true and
 * reading them together they look wrong. So every count a reader sees comes
 * from here, labelled by what it counts.
 */
import type { CollectionEntry } from 'astro:content';
import { isCanceled, isOver, occurrences, uniqueByEvent, upcoming, weeklyTest } from './events.ts';

type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

export interface EventTotals {
  /** Listings with a date ahead of them: one-offs, the town meetings, a production's run. One per file. */
  dated: number;
  /** Weekly regulars: a storytime, a trivia night. One per series, however many weeks it runs. */
  series: number;
  /** `dated` + `series`: every listing a reader can still go to. */
  listings: number;
  /** Dates in the next fourteen days, every occurrence of every listing: what the fortnight on the events page holds. */
  datesNextTwoWeeks: number;
}

export function eventTotals<T extends EventLike>(entries: readonly T[], now = new Date()): EventTotals {
  const isWeekly = weeklyTest(entries);
  const live = entries.filter((e) => !isCanceled(e) && !isOver(e, now));
  const series = live.filter((e) => isWeekly(e));
  const dated = live.filter((e) => !isWeekly(e));
  const fortnight = upcoming(occurrences([...live], { now, horizonDays: 14 }), { now, days: 14 });
  return {
    dated: uniqueByEvent(dated).length,
    series: uniqueByEvent(series).length,
    listings: uniqueByEvent(dated).length + uniqueByEvent(series).length,
    datesNextTwoWeeks: fortnight.length,
  };
}

/** "38 listings: 29 dated events and 9 weekly regulars", for a page that prints the count in words. */
export function describeTotals(t: EventTotals): string {
  const parts = [`${t.dated} dated event${t.dated === 1 ? '' : 's'}`, `${t.series} weekly regular${t.series === 1 ? '' : 's'}`];
  return `${t.listings} listing${t.listings === 1 ? '' : 's'}: ${parts.join(' and ')}`;
}
