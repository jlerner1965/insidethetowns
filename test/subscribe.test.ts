/**
 * The in-page signup's server side (src/lib/subscribe.ts, api/subscribe.ts):
 * what a form may post, what goes to Buttondown, and what the page is told.
 * Buttondown is never reached: every call is to a fetch the test hands in.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowedTags, BUTTONDOWN_SUBSCRIBERS, clientIp, fromOwnSite, ownHosts, readSignup, subscribe } from '../src/lib/subscribe.ts';
import { emailEditions } from '../src/config/index.ts';

const form = (pairs: Array<[string, string]>) => new URLSearchParams(pairs);

test('a form may post every town in an edition and All towns, and nothing else', () => {
  const tags = allowedTags();
  for (const edition of emailEditions()) for (const t of edition.towns) assert.ok(tags.has(t.slug), t.slug);
  assert.ok(tags.has('all-towns'));
  assert.ok(!tags.has('loveland'), 'a quiet guide has no email, so no tag');

  assert.deepEqual(readSignup(form([['email', ' reader@example.com '], ['tag', 'erie'], ['tag', 'erie'], ['page', 'https://insideerie.com/']])), {
    email: 'reader@example.com',
    tags: ['erie'],
    page: 'https://insideerie.com/',
  });
  assert.deepEqual(readSignup(form([['email', 'reader@example.com']])), { error: 'need-town' });
  assert.deepEqual(readSignup(form([['email', 'reader@example.com'], ['tag', 'made-up-town']])), { error: 'unknown-town' }, 'no invented tags');
  for (const bad of ['', 'reader', 'reader@', '@example.com', 'two words@example.com', 'a@b', `${'x'.repeat(250)}@example.com`]) {
    assert.deepEqual(readSignup(form([['email', bad], ['tag', 'erie']])), { error: 'invalid-email' }, bad);
  }
});

test('a signup goes to Buttondown with the towns as tags and no subscriber type, so its confirmation email is sent', async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fake = (status: number, body = '') => (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init! });
    return new Response(body, { status });
  }) as typeof fetch;
  const result = await subscribe({ email: 'reader@example.com', tags: ['erie', 'all-towns'], page: 'https://insideerie.com/sports/' }, { key: 'k-test', ip: '203.0.113.9', fetch: fake(201, '{}') });
  assert.deepEqual(result, { status: 'confirm' });
  assert.equal(calls[0]!.url, BUTTONDOWN_SUBSCRIBERS);
  assert.equal(calls[0]!.init.method, 'POST');
  assert.equal((calls[0]!.init.headers as Record<string, string>).Authorization, 'Token k-test');
  const sent = JSON.parse(String(calls[0]!.init.body));
  assert.deepEqual(sent, { email_address: 'reader@example.com', tags: ['erie', 'all-towns'], referrer_url: 'https://insideerie.com/sports/', ip_address: '203.0.113.9' });
  assert.equal('type' in sent, false, 'no type: double opt-in stays');
  assert.equal((calls[0]!.init.headers as Record<string, string>)['X-Buttondown-Collision-Behavior'], undefined, 'the first call never merges into an existing address');
  assert.equal((calls[0]!.init.headers as Record<string, string>)['X-Buttondown-Bypass-Firewall'], undefined, 'the firewall stays on');
});

test('Buttondown’s answers become what the page can act on, and no key is never a call', async () => {
  const answer = (status: number, body: string) => (async () => new Response(body, { status })) as typeof fetch;
  const request = { email: 'reader@example.com', tags: ['erie'] };
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, '{"code":"email_invalid","detail":"That email address is not valid."}') })).status, 'invalid');
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(429, 'slow down') })).status, 'unavailable', 'the daily limit: Buttondown’s own form instead');
  // By code, not by the words: a blocked address or a spam-scored IP is not
  // a typo and not "already signed up".
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, '{"code":"email_empty","detail":"x"}') })).status, 'invalid');
  for (const code of ['email_blocked', 'ip_address_spammy', 'subscriber_blocked', 'rate_limited', 'tag_invalid', 'newsletter_not_accepting_subscribers']) {
    assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, `{"code":"${code}","detail":"This email address is blocked."}`) })).status, 'unavailable', code);
  }
  // An address Buttondown has, whose lookup then fails, is not told anything it cannot see.
  for (const code of ['email_already_exists', 'subscriber_already_exists', 'subscriber_suppressed']) {
    assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, `{"code":"${code}","detail":"x"}`) })).status, 'unavailable', code);
  }
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(403, '{"code":"feature_disabled","detail":"Tags need a paid plan."}') })).status, 'unavailable');
  // A 400 with no code: only the plainest words count.
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, 'That email address is not valid.') })).status, 'invalid');
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, 'Your email is blocked by the firewall.') })).status, 'unavailable');
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(500, '') })).status, 'unavailable');
  assert.equal((await subscribe(request, { key: 'k', fetch: (async () => { throw new TypeError('fetch failed'); }) as typeof fetch })).status, 'unavailable');
  let called = false;
  const none = await subscribe(request, { key: undefined, fetch: (async () => { called = true; return new Response(''); }) as typeof fetch });
  assert.equal(none.status, 'unavailable');
  assert.equal(called, false);
  // The log line carries Buttondown's reason; the address is not in it.
  const logged = await subscribe(request, { key: 'k', fetch: answer(500, 'boom') });
  assert.doesNotMatch(logged.detail ?? '', /reader@example\.com/);
});

test('a confirmation email is said to be coming only when Buttondown made the subscriber unactivated', async () => {
  const created = (body: string) => (async () => new Response(body, { status: 201 })) as typeof fetch;
  const request = { email: 'reader@example.com', tags: ['erie'] };
  assert.equal((await subscribe(request, { key: 'k', fetch: created('{"id":"s1","type":"unactivated"}') })).status, 'confirm');
  assert.equal((await subscribe(request, { key: 'k', fetch: created('') })).status, 'confirm', 'no body: the default, double opt-in');
  // Double opt-in switched off in Buttondown: active at once, no email coming.
  const added = await subscribe(request, { key: 'k', fetch: created('{"id":"s1","type":"regular"}') });
  assert.equal(added.status, 'added');
  assert.match(added.detail ?? '', /double opt-in is off/, 'the log says why, for the owner');
});

/**
 * A fake Buttondown that answers by method and URL, and keeps every call:
 * `routes` maps "POST subscribers" (the create call; the nth answer for the
 * nth such call), "GET one", "POST reminder" to [status, body].
 */
function buttondown(routes: Record<string, Array<[number, string]>>) {
  const calls: Array<{ key: string; url: string; headers: Record<string, string>; body: Record<string, unknown> | undefined }> = [];
  const fake = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const key = `${init?.method} ${u === BUTTONDOWN_SUBSCRIBERS ? 'subscribers' : u.endsWith('/send-reminder') ? 'reminder' : 'one'}`;
    calls.push({ key, url: u, headers: init?.headers as Record<string, string>, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    const [status, body] = routes[key]?.shift() ?? [500, 'no route'];
    return new Response(body, { status });
  }) as typeof fetch;
  return { fake, calls };
}

const ALREADY: [number, string] = [400, '{"code":"email_already_exists","detail":"This email address already exists."}'];

test('an address already on the list gets the form’s towns added, on the page, never taken away', async () => {
  const bd = buttondown({ 'POST subscribers': [ALREADY, [201, '{"type":"regular"}']], 'GET one': [[200, '{"type":"regular","tags":[]}']] });
  const result = await subscribe({ email: 'reader+news@example.com', tags: ['lyons'] }, { key: 'k', ip: '203.0.113.9', fetch: bd.fake });
  assert.equal(result.status, 'already');
  assert.deepEqual(bd.calls.map((c) => c.key), ['POST subscribers', 'GET one', 'POST subscribers']);
  assert.equal(bd.calls[1]!.url, `${BUTTONDOWN_SUBSCRIBERS}/reader%2Bnews%40example.com`, 'the address is one path segment');
  const merge = bd.calls[2]!;
  // Buttondown merges the towns itself: its subscriber objects come back
  // with no tags, so a list sent with a PATCH would replace the reader's.
  assert.equal(merge.headers['X-Buttondown-Collision-Behavior'], 'add');
  assert.deepEqual(merge.body!.tags, ['lyons']);
  assert.equal('type' in merge.body!, false, 'an active subscriber’s state is left as it is');
  assert.ok(!bd.calls.some((c) => c.key.startsWith('PATCH')), 'nothing is overwritten');
});

test('an address never confirmed gets its confirmation email again; one that unsubscribed must confirm to come back', async () => {
  const unconfirmed = buttondown({ 'POST subscribers': [ALREADY], 'GET one': [[200, '{"type":"unactivated"}']], 'POST reminder': [[200, '']] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: unconfirmed.fake })).status, 'confirm');
  assert.deepEqual(unconfirmed.calls.map((c) => c.key), ['POST subscribers', 'GET one', 'POST reminder']);

  const failed = buttondown({ 'POST subscribers': [ALREADY], 'GET one': [[200, '{"type":"unactivated"}']], 'POST reminder': [[429, 'slow down']] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: failed.fake })).status, 'unavailable');

  const left = buttondown({
    'POST subscribers': [[400, '{"code":"subscriber_suppressed","detail":"That subscriber has already unsubscribed."}'], [200, '{"type":"unactivated"}']],
    'GET one': [[200, '{"type":"unsubscribed"}']],
  });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: left.fake })).status, 'confirm');
  const back = left.calls[2]!;
  assert.equal(back.headers['X-Buttondown-Collision-Behavior'], 'add');
  assert.equal(back.body!.type, 'unactivated', 'back only once they click the new confirmation email');
});

test('a blocked, bounced or complaining address is not touched, and the page offers Buttondown’s form', async () => {
  for (const type of ['blocked', 'complained', 'undeliverable', 'removed']) {
    const bd = buttondown({ 'POST subscribers': [ALREADY], 'GET one': [[200, `{"type":"${type}"}`]] });
    assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: bd.fake })).status, 'unavailable', type);
    assert.equal(bd.calls.length, 2, type);
  }
  const lost = buttondown({ 'POST subscribers': [ALREADY], 'GET one': [[404, '{"detail":"Not found"}']] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: lost.fake })).status, 'unavailable');
  const refused = buttondown({ 'POST subscribers': [ALREADY, [400, '{"code":"ip_address_spammy"}']], 'GET one': [[200, '{"type":"regular"}']] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: refused.fake })).status, 'unavailable', 'towns not added: not said to be');
});

test('a spam-scored IP is tried once more past the firewall, still with the confirmation email', async () => {
  const spammy: [number, string] = [400, '{"code":"ip_address_spammy","detail":"x"}'];
  const bd = buttondown({ 'POST subscribers': [spammy, [201, '{"type":"unactivated"}']] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', ip: '172.225.1.1', fetch: bd.fake })).status, 'confirm');
  assert.equal(bd.calls[0]!.headers['X-Buttondown-Bypass-Firewall'], undefined);
  assert.equal(bd.calls[1]!.headers['X-Buttondown-Bypass-Firewall'], 'true');
  assert.equal('type' in bd.calls[1]!.body!, false, 'double opt-in holds past the firewall');
  const twice = buttondown({ 'POST subscribers': [spammy, spammy] });
  assert.equal((await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: twice.fake })).status, 'unavailable');
  assert.equal(twice.calls.length, 2, 'once more, not again and again');
  const blocked = buttondown({ 'POST subscribers': [[400, '{"code":"email_blocked"}']] });
  await subscribe({ email: 'reader@example.com', tags: ['erie'] }, { key: 'k', fetch: blocked.fake });
  assert.equal(blocked.calls.length, 1, 'an address the owner blocked is not retried');
});

test('only the site’s own pages may post, over https', () => {
  const hosts = ownHosts('insideerie.com', { VERCEL_URL: 'insideerie-abc123-team.vercel.app', VERCEL_BRANCH_URL: 'insideerie-git-main-team.vercel.app' });
  assert.ok(fromOwnSite('https://insideerie.com', hosts));
  assert.ok(fromOwnSite('https://www.insideerie.com', hosts));
  assert.ok(fromOwnSite('https://insideerie-abc123-team.vercel.app', hosts), 'its own preview');
  assert.ok(!fromOwnSite('https://someone-else.vercel.app', hosts), 'not any vercel.app');
  assert.ok(!fromOwnSite('https://insideniwot.com', hosts), 'not a sister guide');
  assert.ok(!fromOwnSite('http://insideerie.com', hosts));
  assert.ok(!fromOwnSite(null, hosts));
  assert.ok(!fromOwnSite('not a url', hosts));
  assert.equal(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })), '203.0.113.9');
  assert.equal(clientIp(new Headers({ 'x-real-ip': '198.51.100.2' })), '198.51.100.2');
  assert.equal(clientIp(new Headers()), undefined);
});

test('the function answers a post with a status and nothing more', async () => {
  const { POST, GET } = await import('../api/subscribe.ts');
  const prevTown = process.env.TOWN;
  const prevKey = process.env.BUTTONDOWN_API_KEY;
  process.env.TOWN = 'erie';
  delete process.env.BUTTONDOWN_API_KEY;
  try {
    const post = (origin: string | null, body: string, type = 'application/x-www-form-urlencoded;charset=UTF-8') =>
      POST(new Request('https://insideerie.com/api/subscribe', { method: 'POST', body, headers: { ...(origin ? { origin } : {}), 'content-type': type } }));
    const read = async (res: Response) => [res.status, (await res.json()).status];
    assert.deepEqual(await read(await post('https://evil.example', 'email=a%40b.com&tag=erie')), [403, 'refused']);
    assert.deepEqual(await read(await post('https://insideerie.com', '{}', 'application/json')), [415, 'refused']);
    assert.deepEqual(await read(await post('https://insideerie.com', 'email=nope&tag=erie')), [400, 'invalid']);
    assert.deepEqual(await read(await post('https://insideerie.com', 'email=a%40example.com&tag=nowhere')), [400, 'refused']);
    // No key on the project: unavailable, and the page offers Buttondown's own form.
    assert.deepEqual(await read(await post('https://insideerie.com', 'email=a%40example.com&tag=erie')), [503, 'unavailable']);
    assert.equal(GET().status, 405);
  } finally {
    if (prevTown === undefined) delete process.env.TOWN;
    else process.env.TOWN = prevTown;
    if (prevKey !== undefined) process.env.BUTTONDOWN_API_KEY = prevKey;
  }
});
