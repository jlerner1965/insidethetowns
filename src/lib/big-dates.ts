/**
 * The big dates on a town's calendar: the festivals and parades a reader
 * searches for by name months ahead, "Niwot holiday parade", "Lyons Fourth
 * of July". /events/ leads with the next two weeks, so a parade in November
 * sat below the fold in October and the only permanent link to its page was
 * the sitemap. This picks those listings out so the events page can link
 * them from the top (search-visibility phase 1, 15 October 2026).
 *
 * Pure and deliberately narrow: the festival category, as the editor set
 * it, upcoming, not canceled, beyond the fortnight the page already shows,
 * once per listing however many occurrences it has. Nothing is inferred
 * from a title, and nothing here invents an event.
 */
import type { CollectionEntry } from 'astro:content';
import { addDays, startOfDay } from './dates.ts';
import { isTentative } from './confidence.ts';
import { isCanceled, isFlagged, isOver, uniqueByEvent } from './events.ts';

// The same shape src/lib/events.ts works over, so its helpers accept these.
type EventLike = { data: CollectionEntry<'events'>['data']; slug?: string; id?: string };

export function bigDates<T extends EventLike>(
  events: readonly T[],
  { now = new Date(), afterDays = 14, limit = 6 }: { now?: Date; afterDays?: number; limit?: number } = {},
): T[] {
  const after = addDays(startOfDay(now), afterDays).getTime();
  const picks = events.filter(
    (e) => e.data.category === 'festival' && !isCanceled(e) && !isTentative(e) && !isFlagged(e) && !isOver(e, now) && e.data.start.getTime() >= after,
  );
  return uniqueByEvent([...picks].sort((a, b) => a.data.start.getTime() - b.data.start.getTime())).slice(0, limit);
}
