/**
 * The weekly email's signup (src/lib/signup.ts, run by NewsletterSignup.astro).
 * Nothing here reaches the provider or the subscriber list: the decisions are
 * pure, and the component is read as text.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGNUP_MESSAGES, signupOutcome } from '../src/lib/signup.ts';

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
