/**
 * The weekly email's signup, as the decisions NewsletterSignup.astro's script
 * carries out. Pure, so they can be tested without a browser and never with
 * the provider.
 *
 * Two ways a form can send. Where the site's build has a Buttondown key
 * (`inlineSignup`), the page posts the form to its own /api/subscribe
 * (src/lib/subscribe.ts) and stays where it is: the next step is the
 * confirmation email, and the page says so. An address Buttondown already
 * has is settled there too, without a new tab. Otherwise, and whenever that
 * call does not go through, the form posts to Buttondown's hosted page in a
 * new tab, which asks for "Verify and Subscribe" before it sends the email.
 * Neither way can see the reader click the confirmation link, so the page
 * never says the reader is subscribed on the strength of a press or an
 * opened tab: it says what is left to do, and keeps a way to send again or
 * change the details. The exceptions are Buttondown's own answer that the
 * subscriber is active (`added`, double opt-in off in its settings; and
 * `already`, an address that was on the list before), and then the page
 * says that and no more.
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

/**
 * Whether this build's forms sign up from the page: the site's project has
 * a Buttondown API key, which the function at /api/subscribe needs. Only
 * whether it is set is read; the key itself never reaches a page. The
 * owner adds it once, as a shared environment variable, and every site
 * switches over at its next build (DEPLOY.md).
 */
export function inlineSignup(env: Record<string, unknown>): boolean {
  const key = env.BUTTONDOWN_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

/** /api/subscribe's answer, as the page reads it (src/lib/subscribe.ts). Anything else is `unavailable`. */
export type SubscribeAnswer = 'confirm' | 'added' | 'already' | 'invalid' | 'unavailable';

export function readAnswer(body: unknown): SubscribeAnswer {
  const status = (body as { status?: unknown } | null)?.status;
  return status === 'confirm' || status === 'added' || status === 'already' || status === 'invalid' ? status : 'unavailable';
}

/**
 * What the page shows in the form's place for each answer, and what its
 * button does: `direct` posts the same form to Buttondown's own page in a
 * new tab, the way every form did before the function existed.
 */
export type SignupPanel = 'confirm' | 'added' | 'already' | 'fallback' | 'opened';

export function panelFor(answer: Exclude<SubscribeAnswer, 'invalid'>): SignupPanel {
  return answer === 'unavailable' ? 'fallback' : answer;
}

/** What the page says after each outcome. Nothing here claims a subscription the page cannot see. */
export const SIGNUP_MESSAGES = {
  'need-town': 'Pick at least one town.',
  'need-town-hub': 'Pick at least one town, or All towns.',
  // Signed up from the page: the confirmation email is the one step left.
  confirm: 'One last step: check your email.',
  confirmHelp: 'A confirmation email from Buttondown is on its way to {email}. Click the link in it and the {day} email starts. Nothing in your inbox? Look in spam or promotions.',
  // Buttondown added the address without a confirmation email: its account
  // has double opt-in switched off (src/lib/subscribe.ts, `added`). Said
  // only on Buttondown's own word that the subscriber is active, never on a
  // press alone, and without promising an email that is not coming.
  added: 'Done: Buttondown has added your address.',
  addedHelp: 'The {day} email will go to {email}. Every issue has a link to unsubscribe.',
  invalid: 'That address doesn’t look right. Check it for a typo.',
  // Buttondown says the address is an active subscriber, and the form's
  // towns have been added to it (src/lib/subscribe.ts, `existing`). An
  // address never confirmed, or unsubscribed, is `confirm` instead.
  already: 'You’re already on the list.',
  alreadyHelp: 'The {day} email goes to {email}, and the towns you ticked are on it now. Nothing more to do.',
  // The function could not take it. Buttondown's own form may: it is not
  // promised, since a blocked address or a firewall refusal fails there too,
  // and that page says why.
  fallback: 'That didn’t go through from here.',
  fallbackHelp: 'Try Buttondown’s own form instead: press the button to finish in a new tab, then confirm by email. It will say if something is wrong.',
  continue: 'Continue on Buttondown',
  // Sent to Buttondown's page in a new tab.
  opened: 'Finish signing up in the new tab, then confirm by email.',
  openedHelp:
    'Buttondown’s page asks you to press “Verify and Subscribe”, then sends an email with a link to confirm. If the tab did not open, or it shows an error, open it again or change your details.',
  reopen: 'Open the signup tab again',
} as const;
