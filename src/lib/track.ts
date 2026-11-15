/**
 * One custom event to the analytics the sites already use, and no new
 * vendor: Vercel Web Analytics and, on a guide that has it, Plausible. Both
 * are no-ops where their script is not on the page. Shared by
 * TrackClicks.astro (links and forms marked `data-track`, the newsletter
 * form) and the hub home's town box, which says whether a name matched.
 * The props are where it happened and what was chosen, never what a reader
 * typed.
 */
import { track as vercel } from '@vercel/analytics';
import { track as plausible } from '@plausible-analytics/tracker';

export function sendEvent(name: string, props: Record<string, string>): void {
  try {
    vercel(name, props);
  } catch {
    /* analytics off */
  }
  try {
    plausible(name, { props });
  } catch {
    /* no plausible here */
  }
}
