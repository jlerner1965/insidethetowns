/**
 * The weekly email's signup (src/lib/signup.ts, run by NewsletterSignup.astro).
 * Nothing here reaches the provider or the subscriber list: the decisions are
 * pure, and the component is read as text.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inlineSignup, panelFor, readAnswer, SIGNUP_MESSAGES, signupOutcome } from '../src/lib/signup.ts';

test('a form with a town ticked is left to the browser to send', () => {
  assert.equal(signupOutcome({ towns: ['erie'], sending: false }), 'send');
});

test('a double click sends once', () => {
  let sending = false;
  let sent = 0;
  const press = () => {
    const outcome = signupOutcome({ towns: ['erie'], sending });
    if (outcome === 'send') {
      sending = true;
      sent++;
    }
    return outcome;
  };
  assert.equal(press(), 'send');
  assert.equal(press(), 'busy', 'the second press does nothing');
  assert.equal(sent, 1);
});

test('no towns ticked: nothing sent, on a town’s form as on the hub’s', () => {
  assert.equal(signupOutcome({ towns: [], sending: false }), 'need-town');
  assert.equal(SIGNUP_MESSAGES['need-town'], 'Pick at least one town.');
});

test('the browser opens the provider’s tab, not the script', () => {
  // The script opened an empty tab and posted into it by name; the owner got
  // the empty tab and nothing in it (20 October 2026). A plain target="_blank"
  // post is what every browser opens a tab for.
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  assert.match(component, /<form[^>]*\starget="_blank"/);
  assert.doesNotMatch(component, /window\.open\(/);
  assert.doesNotMatch(component, /form\.target\s*=/, 'the form keeps its own target');
  assert.doesNotMatch(component, /form\.submit\(\)/, 'requestSubmit, so the town check runs on every send');
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

test('the signup promises what the partnership page sells: labeled sponsors, never "no ads", and never list sharing', async () => {
  const { EMAIL_PROMISE } = await import('../src/lib/privacy.ts');
  assert.equal(EMAIL_PROMISE, 'One email a week. Clearly labeled sponsors. No list sharing.');
  const { readdirSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(astro|ts|md)$/.test(name)) files.push(path);
    }
  };
  walk('src');
  walk('content/hub');
  for (const file of files) {
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(text, /\bno ads\b/i, `${file} promises no ads while a sponsor line is for sale`);
  }
  // The partnership page does sell the email line, so the promise has to allow it.
  assert.match(readFileSync('src/routes/hub/advertise.astro', 'utf8'), /sponsor line in the \{sendDay\} email/);
});

test('a build signs up from the page only when its project has a Buttondown key, and never sees the key itself', () => {
  assert.equal(inlineSignup({ BUTTONDOWN_API_KEY: 'k-123' }), true);
  assert.equal(inlineSignup({ BUTTONDOWN_API_KEY: '  ' }), false);
  assert.equal(inlineSignup({}), false);
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  const script = component.slice(component.indexOf('<script>'));
  assert.doesNotMatch(script, /import\.meta\.env/, 'the browser script reads no environment');
  assert.match(component, /data-inline=\{inline \? '' : undefined\}/);
});

test('every answer from the page’s own call has a panel; anything unexpected offers Buttondown’s own form', () => {
  assert.equal(readAnswer({ status: 'confirm' }), 'confirm');
  assert.equal(readAnswer({ status: 'already' }), 'already');
  assert.equal(readAnswer({ status: 'added' }), 'added');
  assert.equal(panelFor('added'), 'added');
  assert.equal(readAnswer({ status: 'invalid' }), 'invalid');
  for (const odd of [null, {}, { status: 'refused' }, { status: 'unavailable' }, 'text']) assert.equal(readAnswer(odd), 'unavailable');
  assert.equal(panelFor('confirm'), 'confirm');
  assert.equal(panelFor('already'), 'already');
  assert.equal(panelFor('unavailable'), 'fallback');
  // The page says what is left to do, with the address it went to.
  assert.match(SIGNUP_MESSAGES.confirm, /check your email/);
  assert.match(SIGNUP_MESSAGES.confirmHelp, /\{email\}/);
  assert.equal(SIGNUP_MESSAGES.continue, 'Continue on Buttondown');
});

test('each panel says only what Buttondown’s answer supports', () => {
  // A confirmation email is promised only for `confirm`; an active
  // subscription only for `added` and `already`, which Buttondown reports
  // (an unconfirmed or unsubscribed address is `confirm`).
  assert.match(SIGNUP_MESSAGES.confirmHelp, /confirmation email/);
  assert.doesNotMatch(`${SIGNUP_MESSAGES.added} ${SIGNUP_MESSAGES.addedHelp}`, /confirm|check your email/i);
  assert.doesNotMatch(`${SIGNUP_MESSAGES.already} ${SIGNUP_MESSAGES.alreadyHelp}`, /confirm|check your email|Buttondown’s own form/i);
  assert.match(SIGNUP_MESSAGES.alreadyHelp, /\{email\}/);
  assert.doesNotMatch(SIGNUP_MESSAGES.fallbackHelp, /will take it/, 'Buttondown’s form is offered, not promised');
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  for (const panel of ['confirm', 'added', 'already', 'fallback', 'opened']) assert.match(component, new RegExp(`\\b${panel}: \\{ title: SIGNUP_MESSAGES`), panel);
  // A new tab only when the page's own call could not settle it: never for
  // an address already on the list (owner, 28 October 2026).
  assert.match(component, /already: \{ title: SIGNUP_MESSAGES\.already, help: SIGNUP_MESSAGES\.alreadyHelp \}/);
});

test('on a guide the address comes before the towns; on the hub the towns come first', () => {
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  const email = component.indexOf('type="email"');
  // The home page's card has no towns to pick (variant="card"); every other guide's form does.
  const townFieldset = component.indexOf('{town && !card && (\n        <fieldset');
  const hubFieldset = component.indexOf('{!town && (\n        <fieldset');
  assert.ok(hubFieldset > 0 && hubFieldset < email, 'hub: towns, then the address');
  assert.ok(townFieldset > email, 'guide: the address, then its ticked town');
});

test('the form carries no attribute the freshness script prunes by', () => {
  // src/lib/expiry.ts removes every [data-day] group it finds empty; a form
  // marked data-day="Thursday" vanished from /this-week/ on load (caught in
  // the browser before it shipped, 25 October 2026).
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  const form = component.match(/<form[^>]*data-signup[^>]*>/)![0];
  for (const attr of ['data-day=', 'data-day-link', 'data-end=', 'data-event-day', 'data-hide-when-empty']) assert.ok(!form.includes(attr), attr);
});

test('the page calls the function at its own path, with the slash the sites redirect to', () => {
  const component = readFileSync('src/components/NewsletterSignup.astro', 'utf8');
  assert.match(component, /fetch\('\/api\/subscribe\/'/);
});
