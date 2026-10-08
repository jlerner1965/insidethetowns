/**
 * The weekly email's signup, as the decisions NewsletterSignup.astro's script
 * carries out. Pure, so they can be tested with stand-ins for the browser and
 * never with the provider.
 *
 * The form posts to Buttondown's hosted page in a new tab. This page cannot
 * see what that tab says, so it never says the reader is subscribed: it says
 * what is left to do there, and keeps a way to open the tab again or change
 * the details. The script used to hide the form the moment it was sent, with
 * nothing to go back to if the tab was blocked or showed an error, and two
 * quick presses sent it twice.
 */

export type SignupOutcome =
  /** No town ticked: nothing is sent. The hub's rule, now on every form. */
  | 'need-town'
  /** This form is already sending: the second press of a double click. */
  | 'busy'
  /** The browser refused the new tab: nothing was sent. */
  | 'blocked'
  /** The provider's page is open in a new tab, with the form posted to it. */
  | 'opened';

export interface SignupStep {
  /** The towns ticked on the form. */
  towns: readonly string[];
  /** A send from this form is already under way. */
  sending: boolean;
  /** Opens a named tab, as window.open does; null when the browser refuses. */
  openTab: (name: string) => { opener: unknown } | null;
  /** Posts the form into the tab of that name. */
  post: (target: string) => void;
}

/**
 * One press of the button. The tab is opened first, from the press itself,
 * so a refusal is known before anything is sent; the form then posts into
 * it. The provider's page gets no handle back on this one.
 */
export function submitSignup(step: SignupStep, tabName: string): SignupOutcome {
  if (step.sending) return 'busy';
  if (step.towns.length === 0) return 'need-town';
  const tab = step.openTab(tabName);
  if (!tab) return 'blocked';
  try {
    tab.opener = null;
  } catch {
    // A browser that will not let it be cleared has already cleared it.
  }
  step.post(tabName);
  return 'opened';
}

/** What the page says after each outcome. Nothing here claims a subscription the page cannot see. */
export const SIGNUP_MESSAGES = {
  'need-town': 'Pick at least one town.',
  'need-town-hub': 'Pick at least one town, or All towns.',
  opened: 'Finish signing up in the new tab, then confirm by email.',
  openedHelp:
    'Buttondown’s page asks you to press “Verify and Subscribe”, then sends an email with a link to confirm. If the tab did not open, or it shows an error, open it again or change your details.',
  blocked:
    'Your browser blocked the new tab, so nothing was sent. Allow pop-ups for this site and press the button again, or continue on Buttondown’s page in this tab.',
} as const;
