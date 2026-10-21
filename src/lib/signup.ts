/**
 * The weekly email's signup, as the decisions NewsletterSignup.astro's script
 * carries out. Pure, so they can be tested without a browser and never with
 * the provider.
 *
 * The form posts to Buttondown's hosted page in a new tab. This page cannot
 * see what that tab says, so it never says the reader is subscribed: it says
 * what is left to do there, and keeps a way to open the tab again or change
 * the details.
 *
 * The browser opens that tab itself, from the form's target="_blank", the
 * way it opens a link's. The script used to open an empty tab first and
 * post the form into it by name, so that a blocked tab would be known
 * before anything was sent; on 20 October the owner got the empty tab and
 * nothing in it, while this page said to finish signing up there. A tab
 * the reader asked for with a press is not a pop-up, and no blocker stops it.
 */

export type SignupOutcome =
  /** No town ticked: nothing is sent. The hub's rule, now on every form. */
  | 'need-town'
  /** This form has already sent: the second press of a double click. */
  | 'busy'
  /** Let the browser post the form into a new tab. */
  | 'send';

export interface SignupStep {
  /** The towns ticked on the form. */
  towns: readonly string[];
  /** This form has already been sent and not reopened. */
  sending: boolean;
}

/** One press of the button: whether the browser may send the form. */
export function signupOutcome(step: SignupStep): SignupOutcome {
  if (step.sending) return 'busy';
  if (step.towns.length === 0) return 'need-town';
  return 'send';
}

/** What the page says after each outcome. Nothing here claims a subscription the page cannot see. */
export const SIGNUP_MESSAGES = {
  'need-town': 'Pick at least one town.',
  'need-town-hub': 'Pick at least one town, or All towns.',
  opened: 'Finish signing up in the new tab, then confirm by email.',
  openedHelp:
    'Buttondown’s page asks you to press “Verify and Subscribe”, then sends an email with a link to confirm. If the tab did not open, or it shows an error, open it again or change your details.',
} as const;
