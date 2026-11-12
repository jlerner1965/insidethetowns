/**
 * The date block beside a tradition's row (src/components/TraditionRow.astro;
 * the design pass of 12 November 2026): what its three lines say. Pure, so
 * the rule is tested rather than trusted to a template.
 *
 * - A date the organizer has set: the month, the day, the year. A date
 *   that runs on within the month shows the span ("9–11"); one that ends
 *   in another month shows the first day with "to Dec 31" under it, and
 *   leaves the year to the row's status line.
 * - A canceled date keeps its numbers, and the row strikes them through.
 * - No date set: "TBA", with the year it is awaited for, or no year once
 *   the last date has passed and no later year is on file. Never last
 *   year's date: that stays in words on the row ("Last held …").
 * - A typical window only: "Varies".
 */
import type { TraditionRow } from './traditions.ts';

export interface DateBlock {
  /** A date is shown (set or canceled); false is the outline block. */
  set: boolean;
  /** The row is canceled: the numbers are struck through. */
  canceled: boolean;
  /** "APR"-style month, mixed case here and upper-cased by the page; empty on an outline block. */
  top: string;
  /** "9", "9–11", "TBA" or "Varies". */
  main: string;
  /** The year, "to Dec 31", or empty. */
  foot: string;
}

export const BLOCK_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const parts = (day: string) => day.split('-').map(Number) as [number, number, number];

export function dateBlock(row: Pick<TraditionRow, 'entry' | 'past' | 'year'>): DateBlock {
  const { entry } = row;
  const canceled = entry.status === 'canceled';
  const past = !!row.past;
  const dated = !past && (entry.status === 'confirmed' || entry.status === 'moved');
  const shown = dated || canceled ? entry.date : undefined;
  if (shown) {
    const [y, m, d] = parts(shown);
    const end = entry.endDate && entry.endDate !== shown ? parts(entry.endDate) : undefined;
    const sameMonth = !!end && end[0] === y && end[1] === m;
    return {
      set: true,
      canceled,
      top: BLOCK_MONTHS[m - 1]!,
      main: sameMonth ? `${d}–${end![2]}` : String(d),
      foot: end && !sameMonth ? `to ${BLOCK_MONTHS[end[1] - 1]} ${end[2]}` : String(y),
    };
  }
  if (entry.status === 'typical') return { set: false, canceled: false, top: '', main: 'Varies', foot: '' };
  return { set: false, canceled, top: '', main: 'TBA', foot: past ? '' : String(row.year) };
}
