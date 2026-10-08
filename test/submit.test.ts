import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVENT_EMAIL_FIELDS, eventEmailHref } from '../src/lib/submit.ts';

test('eventEmailHref: the subject, and the form’s questions in the body, times in Mountain Time', () => {
  const href = eventEmailHref('hello@insidethetowns.com', 'Event submission — Inside Golden');
  const url = new URL(href);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'hello@insidethetowns.com');
  assert.equal(url.searchParams.get('subject'), 'Event submission — Inside Golden');
  const lines = url.searchParams.get('body')!.split('\r\n');
  assert.deepEqual(lines.slice(0, EVENT_EMAIL_FIELDS.length), EVENT_EMAIL_FIELDS.map((f) => `${f}: `));
  assert.ok(EVENT_EMAIL_FIELDS.some((f) => /Mountain Time/.test(f)), 'the time zone is named');
  assert.ok(EVENT_EMAIL_FIELDS.some((f) => /other dates/i.test(f)), 'a line for a second night or a repeat');
  // Spaces are %20, not "+", which some mail clients print literally.
  assert.doesNotMatch(href, /\+/);
});
