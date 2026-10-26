/**
 * The photograph policy says one thing everywhere (src/lib/photo-policy.ts),
 * and the business and partnership pages claim nothing nobody counted.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PHOTO_ACCEPTED,
  PHOTO_CREDIT,
  PHOTO_EMAIL_FIELDS,
  PHOTO_NOT_COPIED,
  PHOTO_PERMISSION,
  photoEmailHref,
} from '../src/lib/photo-policy.ts';

/** A page's source without its comments, which may quote the old wording. */
const read = (path: string) =>
  readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

test('the policy says what is accepted, what permission it needs and how credit works', () => {
  assert.match(PHOTO_ACCEPTED, /public domain/);
  assert.match(PHOTO_ACCEPTED, /permission/);
  assert.match(PHOTO_NOT_COPIED, /do not copy/);
  assert.match(PHOTO_NOT_COPIED, /owner sends it/, 'an owner’s own photograph is welcome when they send it');
  assert.match(PHOTO_PERMISSION, /in writing/);
  assert.match(PHOTO_PERMISSION, /take the photograph down/);
  assert.match(PHOTO_CREDIT, /photo credits page/);
});

test('the editorial, credits and business pages state it from the one module', () => {
  const editorial = read('src/pages/editorial.astro');
  for (const name of ['PHOTO_ACCEPTED', 'PHOTO_NOT_COPIED', 'PHOTO_PERMISSION', 'PHOTO_CREDIT']) assert.match(editorial, new RegExp(`\\{${name}\\}`), name);
  assert.match(editorial, /id="photographs"/, 'the credits page links to the section');
  assert.match(read('src/pages/credits.astro'), /\{PHOTO_NOT_COPIED\}/);
  assert.match(read('src/pages/credits.astro'), /\/editorial\/#photographs/);
  const business = read('src/routes/town/for-businesses.astro');
  for (const name of ['PHOTO_WANTED', 'PHOTO_PERMISSION', 'PHOTO_NOT_COPIED', 'PHOTO_CREDIT']) assert.match(business, new RegExp(`\\{${name}\\}`), name);
});

test('no page says an owner’s own photographs are not used while another asks for them', () => {
  for (const path of ['src/pages/editorial.astro', 'src/pages/credits.astro', 'src/routes/town/for-businesses.astro', 'src/routes/hub/advertise.astro']) {
    assert.doesNotMatch(read(path), /marketing photographs?[^.]*not used/i, path);
  }
});

test('the photograph email asks who took it, how to credit it and for permission', () => {
  const href = photoEmailHref('hello@example.com', 'Inside Berthoud');
  assert.ok(href.startsWith('mailto:hello@example.com?subject='));
  const body = decodeURIComponent(href.slice(href.indexOf('&body=') + 6));
  for (const field of PHOTO_EMAIL_FIELDS) assert.ok(body.includes(field), field);
  assert.match(body, /may publish it/);
  assert.match(decodeURIComponent(href), /Photograph for a listing — Inside Berthoud/);
});

test('the business page leads with correcting a listing, submitting an event and sending a photograph', () => {
  const business = read('src/routes/town/for-businesses.astro');
  const correct = business.indexOf("title: 'Correct a listing'");
  const event = business.indexOf("title: 'Submit an event'");
  const photo = business.indexOf("title: 'Send a photograph'");
  assert.ok(correct > 0 && correct < event && event < photo, 'the three actions, in order');
  // The actions are drawn before anything else in the page body.
  const body = business.slice(business.indexOf('<Page'));
  assert.ok(body.indexOf('actions.map') < body.indexOf('How the guide stays independent'));
});

test('business and partnership pages claim no audience, result or partnership nobody measured or agreed', () => {
  for (const path of ['src/routes/town/for-businesses.astro', 'src/routes/hub/advertise.astro']) {
    const text = read(path);
    assert.doesNotMatch(text, /come back to (every week|weekly)/i, `${path}: reader behaviour nobody counted`);
    assert.doesNotMatch(text, /is read more/i, path);
    assert.doesNotMatch(text, /media kit/i, `${path}: no media kit exists`);
    assert.doesNotMatch(text, /\b(?:our|official) partners?\b|in partnership with|endorsed by (?!or)/i, path);
    assert.doesNotMatch(text, /testimonial|\d[\d,]* (?:readers|subscribers|visitors)/i, path);
  }
});

test('the community pilot is an example, labeled as one, and names no organization', () => {
  const advertise = read('src/routes/hub/advertise.astro');
  const start = advertise.indexOf('id="pilot-example"');
  assert.ok(start > 0, 'the example is on the partnership page');
  const example = advertise.slice(start, advertise.indexOf('</aside>', start));
  assert.match(example, /Example only · not an existing partnership/);
  assert.match(example, /describes no real organization and no agreement/);
  assert.match(example, /no outcome is promised/);
  assert.doesNotMatch(example, /\$\d|\d+ (?:readers|subscribers)/, 'no price and no audience figure');
  assert.doesNotMatch(example, /Chamber of Commerce|Library District|Main Street/, 'no real organization named');
  // The business page points at it and says the same.
  assert.match(read('src/routes/town/for-businesses.astro'), /example only: no partnership is implied/i);
});
