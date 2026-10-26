/**
 * A list page's one provenance line (src/components/CheckedLine.astro),
 * as a pure function so its wording can be tested.
 *
 * The dates are the items' own `verified` days, never the build's. The
 * line says what they are: when every item was read the same day, that
 * day; when they were read on different days, the span, and that the
 * rows were not all checked together (Lyons audit, 26 October 2026: a
 * single "Checked" date over a page read as if every row had been read
 * that day). Where each row carries its own date, the line says so and
 * points the reader to it.
 */
import { formatDate, formatMonthDay, parseLocal } from './dates.ts';
import { checkedBy, checkerName } from './editor.ts';

export interface CheckedLineOptions {
  /** Each row on the page shows its own check date. */
  perItem?: boolean;
  /** Who checked; defaults to the network's editor, if one is named. */
  by?: string;
}

export function checkedLineText(dates: ReadonlyArray<Date | string | undefined>, { perItem = false, by = checkerName() }: CheckedLineOptions = {}): string | undefined {
  const days = dates
    .filter((d): d is Date | string => !!d)
    .map((d) => (typeof d === 'string' ? parseLocal(d) : d))
    .sort((a, b) => a.getTime() - b.getTime());
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) return undefined;
  const who = by ? `Checked by ${by}` : 'Checked';
  if (formatDate(first) === formatDate(last)) {
    return `${checkedBy(formatDate(last), by)}: ${days.length === 1 ? 'the item here was' : 'every item here was'} read against its own source that day.`;
  }
  const span = first.getFullYear() === last.getFullYear() ? `${formatMonthDay(first)} to ${formatDate(last)}` : `${formatDate(first)} to ${formatDate(last)}`;
  return `${who} item by item, ${span}, not all on one day${perItem ? '; each row gives the day its source was read' : ''}.`;
}
