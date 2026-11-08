/**
 * "Today" and "Tomorrow" on the game labels, decided in the reader's browser.
 *
 * A static page said "Today · 7 pm" for Friday's football game and
 * "Tomorrow · 11 am" for Saturday's volleyball from the day it was built
 * until the next build replaced it, and a reader who opened it the morning
 * after, before the rebuild (or through a cache that kept Friday's copy),
 * was told the wrong day (audit of 8 November 2026). So the build writes the
 * day in full, which is true whenever it is read, and marks it
 * `data-relday="2026-11-12"`; Freshness.astro swaps in "Today" or "Tomorrow"
 * where the reader's Denver date makes it so. `data-relday-only="today"`
 * keeps "Tomorrow" out of a table that only ever said "Today".
 *
 * Pure, over the smallest view of an element, so the clock cases run in a
 * test without a browser.
 */

/** The Denver day after `day`: "2026-11-12" → "2026-11-13". */
export function nextDayKey(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** "Today", "Tomorrow", or nothing, for a day key against the reader's `today`. */
export function relativeWord(day: string, today: string, todayOnly = false): 'Today' | 'Tomorrow' | undefined {
  if (day === today) return 'Today';
  if (!todayOnly && day === nextDayKey(today)) return 'Tomorrow';
  return undefined;
}

/** What relabelling needs of an element; `HTMLElement` satisfies it. */
export interface RelabelNode {
  dataset: Record<string, string | undefined>;
  textContent: string | null;
}

/** Each marked day that is today or tomorrow for the reader, said so; the rest keep the day in full. */
export function relabelDays(nodes: Iterable<RelabelNode>, today: string): void {
  for (const node of nodes) {
    const day = node.dataset.relday;
    if (!day) continue;
    const word = relativeWord(day, today, node.dataset.reldayOnly === 'today');
    if (word) node.textContent = word;
  }
}
