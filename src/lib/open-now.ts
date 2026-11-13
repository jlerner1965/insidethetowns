/**
 * "Open now" and "Opens next" (the additions of 12 November 2026): a
 * town's outdoor rows read as what is open today and what opens soonest,
 * from the records' own dates and nothing else.
 *
 * A record says what it is the date of in `outdoor` (src/lib/traditions.ts):
 * a facility, and whether this record is its opening, its closing, or the
 * whole open period as one window. The reading:
 *
 * - Open now: a window whose date has come and whose endDate has not
 *   passed; or an opening whose date has come and whose facility has a
 *   closing date still ahead ("until" it). An opening with no closing
 *   date on file counts only for OPEN_WITHOUT_CLOSING_DAYS after it: a ski
 *   area that opened last week is open, and a pass that opened in April
 *   with no closing read since is not claimed in November.
 * - Opens next: a window or an opening dated after today, soonest first.
 *   The day reservations open (`booking`) is only ever in this list: that
 *   bookings opened in May says nothing about what is open today.
 *
 * Nothing is inferred. A facility with no dated opening this season is in
 * neither list, however sure anyone is that the lifts are running; a year
 * not announced is not a date. Today is the build's, and the page's script
 * corrects a passed date for the reader's own day as it does for every row
 * (DateCorrection.astro), so each item carries the days it turns on.
 */
import { OUTDOOR_KIND_LABELS, isDated, type OutdoorKind, type TraditionRecord, type TraditionYear } from './traditions.ts';

export interface OpenItem {
  /** The facility: "Trail Ridge Road", "Ski Cooper". */
  facility: string;
  kind: OutdoorKind;
  kindLabel: string;
  /** The record the date was read on, for the link to its row and its source. */
  slug: string;
  source: string;
  organizer: string;
  checked: string;
  /** The day it opened or opens. */
  from: string;
  /** The day it closes, where one is published and is on or after `from`. */
  until?: string;
  /** The source's own caveat on the date. */
  note?: string;
}

/** How long an opening with no closing date on file is read as "open". */
export const OPEN_WITHOUT_CLOSING_DAYS = 90;

const dated = (r: TraditionRecord): Array<TraditionYear & { date: string }> => r.years.filter((y): y is TraditionYear & { date: string } => isDated(y) && !!y.date);

/**
 * The two lists for a set of records (a place's own and shared outdoor
 * rows; pass them already filtered to the place).
 */
export function openNow(records: readonly TraditionRecord[], today: string): { open: OpenItem[]; next: OpenItem[] } {
  const tagged = records.filter((r) => r.type === 'outdoor' && !!r.outdoor);
  const open: OpenItem[] = [];
  const next: OpenItem[] = [];
  const item = (r: TraditionRecord, y: TraditionYear & { date: string }, until?: string): OpenItem => ({
    facility: r.outdoor!.facility,
    kind: r.outdoor!.kind,
    kindLabel: OUTDOOR_KIND_LABELS[r.outdoor!.kind],
    slug: r.slug,
    source: y.sourceUrl ?? r.sourceUrl,
    organizer: r.organizer,
    checked: y.checked,
    from: y.date,
    ...(until ? { until } : {}),
    ...(y.note ? { note: y.note } : {}),
  });
  /** Every dated closing of a facility, any year. */
  const closings = (facility: string): string[] =>
    tagged.filter((r) => r.outdoor!.edge === 'closes' && r.outdoor!.facility === facility).flatMap((r) => dated(r).map((y) => y.date));

  for (const r of tagged) {
    const edge = r.outdoor!.edge;
    if (edge === 'closes') continue;
    for (const y of dated(r)) {
      if (edge === 'window') {
        const end = y.endDate;
        if (y.date > today) next.push(item(r, y, end));
        else if (end && end >= today && r.outdoor!.kind !== 'booking') open.push(item(r, y, end));
        continue;
      }
      // An opening: the first closing on or after it ends it.
      const until = closings(r.outdoor!.facility)
        .filter((d) => d >= y.date)
        .sort()[0];
      if (y.date > today) next.push(item(r, y, until));
      else if (r.outdoor!.kind === 'booking') continue;
      else if (until ? until >= today : daysBetween(y.date, today) <= OPEN_WITHOUT_CLOSING_DAYS) {
        // Only the newest opening of a facility is its season.
        if (dated(r)[0]!.date === y.date) open.push(item(r, y, until));
      }
    }
  }
  const byFrom = (a: OpenItem, b: OpenItem) => a.from.localeCompare(b.from) || a.facility.localeCompare(b.facility);
  const firstPerFacility = (list: OpenItem[]) => list.filter((it, i) => list.findIndex((o) => o.facility === it.facility && o.kind === it.kind) === i);
  return {
    open: firstPerFacility(open.sort((a, b) => a.facility.localeCompare(b.facility))),
    next: firstPerFacility(next.sort(byFrom)),
  };
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}
