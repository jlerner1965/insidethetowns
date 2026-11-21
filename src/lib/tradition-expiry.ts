/**
 * "Today" in the reader's browser, for the pages of dates (the hub's town
 * and season pages, a guide's /traditions/): the reviews of 12 November
 * 2026 found they fixed today at the build, so a build a week old called a
 * date that had gone "Confirmed", counted it, and offered it as "Next".
 *
 * A row with a date set carries `data-ends` (the last day of it) and both
 * of its faces (src/components/TraditionRow.astro): `data-when-set`, shown,
 * and `data-when-past`, hidden. Once the reader's Denver date is past the
 * end, the faces swap and the row's status becomes not-announced.
 *
 * The hidden face carries no words in the HTML. Its text waits in
 * `data-past-text` attributes and is written in only when the faces swap
 * (fillPastText): a page read without its script, by a search engine, a
 * reader view or a fetch, said "Confirmed · Saturday, December 5" and
 * "Next date not yet announced · Last held Saturday, December 5" of the
 * same parade (the owner, 14 November 2026). The year list's "(last
 * held)" and the month strip's "now" are written the same way. What
 * hangs off the rows is then put right from what is left: the year
 * strip's mark for it becomes a ring, the month marked "now" is this
 * month, "Next" under a town's name is the soonest date still ahead or
 * goes, and a season page's count is counted again.
 *
 * Structured data is not touched: it is the build's, and the daily rebuild
 * is what keeps it. Pure over a small view of the DOM, like
 * src/lib/expiry.ts, so the cases can be replayed in a test.
 */
import { monthLabel } from './year-grid.ts';
import { typeset } from './text.ts';
import { listingOver } from './expiry.ts';

export interface DateNode {
  dataset: Record<string, string | undefined>;
  hidden: boolean | string;
  textContent: string | null;
  remove(): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  closest(selector: string): DateNode | null;
  querySelector(selector: string): DateNode | null;
  querySelectorAll(selector: string): Iterable<DateNode>;
  classList: { add(...names: string[]): void; remove(...names: string[]): void };
}

/** A row's date has passed: its last day is before today. A date under way today has not. */
export function datePassed(ends: string | undefined, today: string): boolean {
  return !!ends && ends < today;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Write in the words a hidden face waits with: the element's own, and every one inside it. */
export function fillPastText(el: DateNode): void {
  if (el.dataset.pastText !== undefined) el.textContent = el.dataset.pastText;
  for (const inner of el.querySelectorAll('[data-past-text]')) inner.textContent = inner.dataset.pastText ?? '';
}

/** Swap every passed row to its past face. Returns the rows' ids. */
export function expireRows(root: DateNode, today: string): string[] {
  const expired: string[] = [];
  for (const row of root.querySelectorAll('[data-tradition-row][data-ends]')) {
    if (row.dataset.expired !== undefined || !datePassed(row.dataset.ends, today)) continue;
    for (const el of row.querySelectorAll('[data-when-set]')) el.hidden = true;
    for (const el of row.querySelectorAll('[data-when-past]')) {
      fillPastText(el);
      el.hidden = false;
    }
    row.dataset.expired = '';
    row.dataset.status = 'not-announced';
    const id = row.getAttribute('id');
    if (id) expired.push(id);
  }
  return expired;
}

/** The whole correction for one page. */
/**
 * Which of a town page's rows still ahead is its next date, by the rule
 * the build uses (src/lib/hub-towns.ts, nextUp): the soonest event, and an
 * agency's date (an outdoor or free-admission date) only where no event is
 * left; the page's order breaks a tie. -1 where none is ahead.
 */
export function nextRowIndex(rows: ReadonlyArray<{ starts: string; agency: boolean }>): number {
  let best = -1;
  rows.forEach((r, i) => {
    const b = rows[best];
    if (!b || Number(r.agency) < Number(b.agency) || (r.agency === b.agency && r.starts < b.starts)) best = i;
  });
  return best;
}

export function correctDates(root: DateNode, today: string, nowMs = Date.now()): void {
  const expired = new Set(expireRows(root, today));

  // The year strip: a passed date's mark is a ring, and says so.
  for (const mark of root.querySelectorAll('[data-year-strip] a[data-mark]')) {
    const slug = (mark.getAttribute('href') ?? '').slice(1);
    if (!expired.has(slug) || mark.dataset.mark !== 'set') continue;
    mark.dataset.mark = 'held';
    const dot = mark.querySelector('[data-dot]');
    dot?.classList.remove('bg-primary');
    dot?.classList.add('border-2', 'border-primary', 'bg-raised');
    if (mark.dataset.labelPast) {
      mark.setAttribute('aria-label', mark.dataset.labelPast);
      mark.setAttribute('title', mark.dataset.labelPast);
    }
  }
  for (const item of root.querySelectorAll('[data-year-list] [data-mark-name]')) {
    if (expired.has(item.dataset.markName ?? '')) {
      const note = item.querySelector('[data-held-note]');
      if (note) {
        fillPastText(note);
        note.hidden = false;
      }
    }
  }
  // The year at a glance on a hub town page (src/routes/hub/town.astro, the
  // publication redesign of 14 November 2026): a passed date's dot becomes a
  // ring, last held that year, and every month with marks says again what
  // it holds (src/lib/year-grid.ts), the current month as this month.
  const thisMonth = Number(today.slice(5, 7)) - 1;
  for (const grid of root.querySelectorAll('[data-year-grid]')) {
    for (const mark of grid.querySelectorAll('[data-mark]')) {
      if (mark.dataset.mark !== 'set' || !expired.has(mark.dataset.slug ?? '')) continue;
      mark.dataset.mark = 'held';
      mark.dataset.heldYear = mark.dataset.year;
      mark.dataset.nextYear = '';
    }
    for (const cell of grid.querySelectorAll('[data-month-cell]')) {
      const index = Number(cell.dataset.monthCell);
      const now = index === thisMonth;
      cell.dataset.now = String(now);
      const label = cell.querySelector('[data-now-label]');
      if (label) {
        label.textContent = now ? 'now' : '';
        label.hidden = !now;
      }
      const link = cell.querySelector('a');
      if (link) {
        const marks = [...cell.querySelectorAll('[data-mark]')].map((m) => ({ set: m.dataset.mark === 'set', heldYear: m.dataset.heldYear, nextYear: m.dataset.nextYear || undefined }));
        link.setAttribute('aria-label', monthLabel(index, marks, now));
      }
    }
  }

  // "Now" is this month, not the build's.
  const month = MONTHS[Number(today.slice(5, 7)) - 1];
  for (const cell of root.querySelectorAll('[data-year-strip] [data-month]')) {
    const now = cell.dataset.month === month;
    cell.classList.remove(now ? 'bg-raised' : 'bg-highlight-soft');
    cell.classList.add(now ? 'bg-highlight-soft' : 'bg-raised');
    const label = cell.querySelector('[data-now-label]');
    if (label) {
      label.textContent = now ? 'now' : '';
      label.hidden = !now;
    }
  }

  // "Next" under a town's name, as the build chooses it (src/lib/hub-towns.ts,
  // nextUp): the soonest of the town's own events still ahead among the
  // page's own rows (not the folded statewide ones); an outdoor or
  // free-admission date only where no event is ahead.
  // A hub town page's one-time events count with its own events (src/lib/hub-towns.ts,
  // nextTownDate; the owner, 21 November 2026): each row not yet over by the rule
  // that takes it off the list (listingOver, src/lib/expiry.ts), after the annual
  // rows, so the annual event keeps a tie as on the build.
  const next = root.querySelector('[data-next-up]');
  if (next) {
    const rows = [
      ...[...root.querySelectorAll('[data-tradition-row][data-starts]')].filter((r) => r.dataset.expired === undefined && !r.closest('[data-statewide]')),
      ...[...root.querySelectorAll('[data-carried-event][data-starts]')].filter((r) => !listingOver({ end: r.dataset.end, day: r.dataset.eventDay }, nowMs, today)),
    ];
    // An outdoor date is the agency's, wherever its section is: under its own heading, or among a hub town page's dates (`data-agency`).
    const ahead = rows[nextRowIndex(rows.map((r) => ({ starts: r.dataset.starts!, agency: !!r.closest('#outdoor-dates') || r.dataset.agency !== undefined })))];
    const link = next.querySelector('a');
    const day = next.querySelector('[data-next-day]');
    if (!ahead || !link || !day) next.remove();
    else if (link.getAttribute('href') !== `#${ahead.getAttribute('id')}`) {
      link.setAttribute('href', `#${ahead.getAttribute('id')}`);
      // The name as the page sets it: typographic quotes (src/lib/text.ts); the attribute keeps the file's.
      link.textContent = typeset(ahead.dataset.name ?? '');
      day.textContent = ahead.dataset.dayText ?? '';
    }
  }

  // A season page's counts: the dates still to come, and on a season with
  // a year the ones already held, as built (`data-built`) and with every
  // date that has passed since, so the line's parts still add up to every
  // row on the page.
  const set = [...root.querySelectorAll('[data-tradition-row][data-starts]')];
  const left = set.filter((r) => r.dataset.expired === undefined).length;
  for (const count of root.querySelectorAll('[data-date-count]')) {
    const kind = count.dataset.dateCount;
    if (kind === 'ahead') count.textContent = String(left);
    else if (kind === 'upcoming') count.textContent = `${left} upcoming`;
    else if (kind === 'held') {
      const held = Number(count.dataset.built ?? 0) + set.length - left;
      count.textContent = `${held} already held`;
      const part = count.closest('[data-held-part]');
      if (part) part.hidden = held === 0;
    }
  }
}
