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
export function correctDates(root: DateNode, today: string): void {
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

  // "Next" under a town's name: the soonest date still ahead among the
  // page's own rows (not the folded statewide ones), a tradition before an
  // outdoor date on the same day, as the build chooses it.
  const next = root.querySelector('[data-next-up]');
  if (next) {
    const ahead = [...root.querySelectorAll('[data-tradition-row][data-starts]')]
      .filter((r) => r.dataset.expired === undefined && !r.closest('[data-statewide]'))
      .map((r, i) => ({ r, i, outdoor: r.closest('#outdoor-dates') ? 1 : 0 }))
      .sort((a, b) => a.r.dataset.starts!.localeCompare(b.r.dataset.starts!) || a.outdoor - b.outdoor || a.i - b.i)[0]?.r;
    const link = next.querySelector('a');
    const day = next.querySelector('[data-next-day]');
    if (!ahead || !link || !day) next.remove();
    else if (link.getAttribute('href') !== `#${ahead.getAttribute('id')}`) {
      link.setAttribute('href', `#${ahead.getAttribute('id')}`);
      link.textContent = ahead.dataset.name ?? '';
      day.textContent = ahead.dataset.dayText ?? '';
    }
  }

  // A season page's count of dates still to come.
  const count = root.querySelector('[data-date-count]');
  if (count) {
    const left = [...root.querySelectorAll('[data-tradition-row][data-starts]')].filter((r) => r.dataset.expired === undefined).length;
    count.textContent = count.dataset.dateCount === 'ahead' ? String(left) : `${left} ${left === 1 ? 'date' : 'dates'}`;
  }
}
