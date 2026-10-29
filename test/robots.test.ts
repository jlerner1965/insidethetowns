/**
 * Reading robots.txt for the link checker.
 *
 * Getting this wrong fails in two directions: too loose and the checker goes
 * on fetching from a site that has asked it to stay out; too strict and it
 * stops checking links that are allowed, and a dead one goes unnoticed. The
 * fixtures are the shapes met in the network's own sources.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowed, NO_RULES, parseRobots, STAY_OUT } from '../scripts/lib/robots.ts';

const TOKEN = 'InsideTheTowns-linkcheck';

test('a site that disallows every agent is closed, however many groups it repeats that in', () => {
  // The Lyons Recorder's file: two `*` groups, merged, and named bots between them.
  const rules = parseRobots(
    ['User-agent: *', 'Disallow: /', '', 'User-agent: Bingbot', 'Disallow: /', '', '', 'User-agent: *', 'Disallow: /wp-admin/'].join('\n'),
    TOKEN,
  );
  assert.equal(isAllowed(rules, '/event/womens-pinball-tournament/2026-10-17/'), false);
  assert.equal(isAllowed(rules, '/events/'), false);
  assert.equal(isAllowed(rules, '/'), false);
});

test('AI crawlers listed in the same group as * get the same rules as everyone', () => {
  // Squarespace's default: the named bots and * share one group of narrow rules.
  const rules = parseRobots(
    ['User-agent: ClaudeBot', 'User-agent: GPTBot', 'User-agent: *', 'Disallow: /search', 'Disallow: /api/', 'Allow: /api/ui-extensions/', 'Disallow:/*?format=json'].join('\n'),
    TOKEN,
  );
  assert.equal(isAllowed(rules, '/maingrass'), true);
  assert.equal(isAllowed(rules, '/search'), false);
  assert.equal(isAllowed(rules, '/api/data'), false);
  assert.equal(isAllowed(rules, '/api/ui-extensions/x'), true);
  assert.equal(isAllowed(rules, '/music?format=json'), false);
});

test('a group naming us replaces the * group rather than adding to it', () => {
  const text = ['User-agent: *', 'Disallow: /', '', 'User-agent: InsideTheTowns-linkcheck/1.0', 'Disallow: /private/'].join('\n');
  const rules = parseRobots(text, TOKEN);
  assert.equal(isAllowed(rules, '/events/'), true);
  assert.equal(isAllowed(rules, '/private/page'), false);
  // Anyone else still gets the * group.
  assert.equal(isAllowed(parseRobots(text, 'SomeOtherBot'), '/events/'), false);
});

test('the longest matching rule wins, and allow wins a tie', () => {
  const rules = parseRobots(['User-agent: *', 'Disallow: /a', 'Allow: /a/b', 'Disallow: /a/b/c', 'Allow: /x', 'Disallow: /x'].join('\n'), TOKEN);
  assert.equal(isAllowed(rules, '/a/other'), false);
  assert.equal(isAllowed(rules, '/a/b/page'), true);
  assert.equal(isAllowed(rules, '/a/b/c/page'), false);
  assert.equal(isAllowed(rules, '/x'), true);
});

test('a disallow is read whatever its letter case; an allow only as written', () => {
  // CivicPlus's rule of 20-21 October 2026, against the feed path its sites serve.
  const civic = parseRobots(['User-agent: *', 'Disallow: /rss.aspx', 'Disallow: /common/modules/icalendar/'].join('\n'), TOKEN);
  assert.equal(isAllowed(civic, '/common/modules/iCalendar/iCalendar.aspx?catID=26&feed=calendar'), false);
  assert.equal(isAllowed(civic, '/RSS.aspx'), false);
  assert.equal(isAllowed(civic, '/RSSFeed.aspx?ModID=58&CID=All-calendar.xml'), true, 'a different file is not caught');
  const opened = parseRobots(['User-agent: *', 'Disallow: /private', 'Allow: /private/open'].join('\n'), TOKEN);
  assert.equal(isAllowed(opened, '/private/open/page'), true);
  assert.equal(isAllowed(opened, '/Private/Open/page'), false, 'case never widens an allow');
});

test('* matches any run of characters and a trailing $ anchors the end', () => {
  const rules = parseRobots(['User-agent: *', 'Disallow: /*.pdf$', 'Disallow: /*?author='].join('\n'), TOKEN);
  assert.equal(isAllowed(rules, '/maps/trail.pdf'), false);
  assert.equal(isAllowed(rules, '/maps/trail.pdf?download=1'), true);
  assert.equal(isAllowed(rules, '/blog?author=3'), false);
  assert.equal(isAllowed(rules, '/blog?tag=3'), true);
});

test('files with nothing to say, or an empty Disallow, leave everything open', () => {
  // Cloudflare's content-signals preamble with no directives, as on the pinball venue's site.
  const comments = '# As a condition of accessing this website...\n# search: building a search index\n';
  assert.equal(isAllowed(parseRobots(comments, TOKEN), '/events'), true);
  assert.equal(isAllowed(parseRobots('User-agent: *\nDisallow:\n', TOKEN), '/anything'), true);
  assert.equal(isAllowed(parseRobots('<!doctype html><title>Not found</title>', TOKEN), '/anything'), true);
  assert.equal(isAllowed(NO_RULES, '/anything'), true);
});

test('a robots.txt the server could not serve means stay out, except robots.txt itself', () => {
  assert.equal(isAllowed(STAY_OUT, '/events/'), false);
  assert.equal(isAllowed(STAY_OUT, '/robots.txt'), true);
});
