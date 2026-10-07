/**
 * What the weekly email and its sample page (/newsletter/sample/) share: the
 * send day, and which places are new on the guide or newly closed since the
 * last issue.
 *
 * Both are read from the places themselves. `added` is the day a place went
 * on the guide, stamped when it is approved (scripts/review.ts); `closed` is
 * the day its status stopped being open, set with the status. The dates for
 * places that predate the fields were backfilled once from the git history
 * (DECISIONS.md, "Dates on places"). Nothing reads the history at build time,
 * so a shallow clone builds the same page as a full one.
 */
import { addDays, dayKey, formatWeekday, startOfDay } from './dates.ts';
import { isOpen } from './places.ts';

/** The next send day on or after `from`, as a Denver day. */
export function nextSendDay(from: Date, sendDay: string): Date {
  let day = startOfDay(from);
  for (let i = 0; i < 7 && formatWeekday(day) !== sendDay; i++) day = addDays(day, 1);
  return day;
}

/**
 * The days an issue sent on `send` reports on: the six after the previous
 * send day, and the send day itself. Weekly issues tile without overlapping,
 * so nothing is new twice.
 */
export function issueWindow(send: Date): { from: Date; until: Date } {
  return { from: addDays(send, -6), until: addDays(send, 1) };
}

interface PlaceDates {
  data: { status?: string; added?: Date; closed?: Date };
}

const within = (date: Date | undefined, { from, until }: { from: Date; until: Date }) =>
  !!date && date.getTime() >= from.getTime() && date.getTime() < until.getTime();

/**
 * The day a town's guide opened: the earliest `added` among its places. What
 * went on that day is the guide itself, which is news of its own, not a list
 * of new places; a town that launches with forty would otherwise fill the
 * section with all forty.
 */
export function openingDay(places: PlaceDates[]): Date | undefined {
  let first: Date | undefined;
  for (const p of places) if (p.data.added && (!first || p.data.added < first)) first = p.data.added;
  return first;
}

/** Went on the guide in the issue's window, after the guide's opening day, and is open. */
export function isNewPlace(place: PlaceDates, send: Date, opened?: Date): boolean {
  if (opened && place.data.added && place.data.added.getTime() <= opened.getTime()) return false;
  return isOpen(place) && within(place.data.added, issueWindow(send));
}

/** Recorded as closed, or temporarily closed, in the issue's window. */
export function isNewlyClosed(place: PlaceDates, send: Date): boolean {
  return !isOpen(place) && within(place.data.closed, issueWindow(send));
}

/**
 * A site link as the email carries it, with the campaign tags the analytics
 * read: where it came from (the newsletter), how (email), and which issue
 * (the send day). The tags name the issue, never the reader; no address goes
 * in a URL. The same three go on any link written by hand in the provider:
 *
 *   ?utm_source=newsletter&utm_medium=email&utm_campaign=2026-10-15
 */
export function campaignLink(url: string, send: Date): string {
  const out = new URL(url);
  out.searchParams.set('utm_source', 'newsletter');
  out.searchParams.set('utm_medium', 'email');
  out.searchParams.set('utm_campaign', dayKey(send));
  return out.toString();
}
