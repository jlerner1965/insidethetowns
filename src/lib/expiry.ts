/**
 * When a listing comes off a page in the reader's browser.
 *
 * Every event row is built with two marks: `data-end`, the instant the
 * listing comes off (`listedUntil`: its end time, or the next Denver midnight
 * when it gave none), and `data-event-day`, the last Denver day it is on. The
 * browser scripts (Freshness.astro, the hub's weekend page) read both and
 * remove what has finished, so a build older than the weekend shows fewer
 * events rather than wrong ones.
 *
 * The rule, in order: a known end decides on its own, and the day is only
 * consulted when there is no usable end. The two used to be or-ed together,
 * which read as the same thing and was not: an 8 pm show that runs to 1 am
 * has an end in the future and a start day in the past, and at half past
 * midnight the day comparison took it down while it was still on (follow-up
 * audit, 8 October 2026). Pure, so the clock cases can be replayed in a test
 * without a browser.
 */

export interface ListingMarks {
  /** `data-end`: an ISO instant with its offset, as `toIsoLocal` writes it. */
  end?: string;
  /** `data-event-day`: "2026-10-08", the last Denver day the listing is on. */
  day?: string;
}

/**
 * True once a listing is over and should come off the page.
 *
 * `nowMs` is the reader's clock; `today` is the reader's date in Denver as
 * "2026-10-08". An end that parses is the whole answer: over at that instant,
 * not before, whatever day it started on. Without one, the listing is over
 * once its last day is behind today's, and not until, so a listing with no
 * end stays up for the whole of its day.
 */
export function listingOver({ end, day }: ListingMarks, nowMs: number, today: string): boolean {
  const ends = Date.parse(end ?? '');
  if (!Number.isNaN(ends)) return ends <= nowMs;
  return !!day && day < today;
}

/**
 * The smallest view of the DOM the pruning needs, so it can run over a stub
 * in a test and over the document in the page. `Element` satisfies it.
 */
export interface PrunableNode {
  dataset: Record<string, string | undefined>;
  /** `boolean | string` because the DOM's `hidden` may read "until-found". */
  hidden: boolean | string;
  remove(): void;
  closest(selector: string): PrunableNode | null;
  querySelector(selector: string): PrunableNode | null;
  querySelectorAll(selector: string): Iterable<PrunableNode>;
}

/**
 * Remove what has finished, then rebuild what hung off it: a day heading with
 * nothing left under it, a jump link to a day that is gone, a block with no
 * empty state, and the empty line where a list has run out.
 *
 * Removed rather than hidden, because the filters drive `hidden` and two
 * mechanisms toggling one property would fight; a node that is gone is gone
 * for both, and the filter recounts what is left.
 *
 * The jump links follow the surviving sections, not the calendar: a day
 * whose last listing is an overnight show still has its heading at half past
 * midnight, so it keeps its chip too.
 */
export function pruneExpired(root: PrunableNode, nowMs: number, today: string): void {
  for (const event of root.querySelectorAll('[data-event-day]')) {
    if (listingOver({ end: event.dataset.end, day: event.dataset.eventDay }, nowMs, today)) event.remove();
  }
  // A day heading with nothing left under it is worse than no heading.
  for (const day of root.querySelectorAll('[data-day]')) {
    if (!day.querySelector('[data-event-day]')) day.remove();
  }
  // And a jump link to a day that is gone.
  for (const link of root.querySelectorAll('[data-day-link]')) {
    if (!root.querySelector(`[data-day="${link.dataset.dayLink}"]`)) link.remove();
  }
  // A block that has no empty state, such as "Nearby this weekend", goes
  // altogether once nothing is left in it.
  for (const box of root.querySelectorAll('[data-hide-when-empty]')) {
    if (!box.querySelector('[data-event-day]')) box.remove();
  }
  // Say so when a list has emptied out, rather than leaving a blank.
  for (const empty of root.querySelectorAll('[data-events-empty]')) {
    const scope = empty.closest('[data-events-scope]') ?? root;
    if (!scope.querySelector('[data-event-day]')) empty.hidden = false;
  }
}
