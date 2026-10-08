/**
 * The weekly email's signup (src/lib/signup.ts, run by NewsletterSignup.astro).
 * Nothing here reaches the provider or the subscriber list: the browser's tab
 * and the form's post are stand-ins that record what they were asked to do.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGNUP_MESSAGES, submitSignup, type SignupStep } from '../src/lib/signup.ts';

/** A browser that opens tabs (or refuses to), and a form that records where it was posted. */
function harness({ blocks = false } = {}) {
  const posted: string[] = [];
  const tabs: Array<{ name: string; opener: unknown }> = [];
  const step = (towns: string[], sending = false): SignupStep => ({
    towns,
    sending,
    openTab: (name) => {
      if (blocks) return null;
      const tab = { name, opener: { page: 'this one' } as unknown };
      tabs.push(tab);
      return tab;
    },
    post: (target) => posted.push(target),
  });
  return { posted, tabs, step };
}

test('a sent form opens one tab, posts into it, and leaves the provider no handle on this page', () => {
  const h = harness();
  assert.equal(submitSignup(h.step(['erie']), 'signup-1'), 'opened');
  assert.deepEqual(h.posted, ['signup-1']);
  assert.equal(h.tabs[0]!.opener, null);
});

test('a double click sends once', () => {
  const h = harness();
  let sending = false;
  const press = () => {
    const outcome = submitSignup(h.step(['erie'], sending), `signup-${h.tabs.length}`);
    if (outcome === 'opened') sending = true;
    return outcome;
  };
  assert.equal(press(), 'opened');
  assert.equal(press(), 'busy', 'the second press does nothing');
  assert.equal(h.posted.length, 1);
  assert.equal(h.tabs.length, 1, 'one tab, not two');
});

test('a blocked tab sends nothing and says so, with a way through', () => {
  const h = harness({ blocks: true });
  assert.equal(submitSignup(h.step(['erie']), 'signup-1'), 'blocked');
  assert.deepEqual(h.posted, [], 'nothing posted into a tab that never opened');
  assert.match(SIGNUP_MESSAGES.blocked, /nothing was sent/);
  assert.match(SIGNUP_MESSAGES.blocked, /this tab/, 'offers to continue here');
});

test('no towns ticked: nothing sent, on a town’s form as on the hub’s', () => {
  const h = harness();
  assert.equal(submitSignup(h.step([]), 'signup-1'), 'need-town');
  assert.equal(h.tabs.length + h.posted.length, 0);
  assert.equal(SIGNUP_MESSAGES['need-town'], 'Pick at least one town.');
});

test('the page never claims a subscription it cannot see, and keeps the way back', () => {
  for (const text of Object.values(SIGNUP_MESSAGES)) assert.doesNotMatch(text, /\b(?:you(?:’|')re (?:in|subscribed)|subscribed!|success)/i, text);
  assert.equal(SIGNUP_MESSAGES.opened, 'Finish signing up in the new tab, then confirm by email.');
  assert.match(SIGNUP_MESSAGES.openedHelp, /error/, 'a provider error is named, with what to do');
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  assert.match(component, /data-signup-reopen/, 'a reopen link');
  assert.match(component, /data-signup-edit/, 'and a way back to the form');
});

test('every form carries the town rule, not only the hub’s', () => {
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  // One error line per branch: the town's form and the hub's.
  assert.equal(component.match(/data-towns-error/g)?.length, 3, 'two in the markup, one in the script');
  assert.doesNotMatch(component, /form\.dataset\.hub !== undefined && !boxes/, 'the check is no longer hub-only');
});
