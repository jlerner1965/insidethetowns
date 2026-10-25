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
  assert.equal((calls[0]!.init.headers as Record<string, string>)['X-Buttondown-Collision-Behavior'], undefined, 'an existing address is never changed from here');
  assert.equal((calls[0]!.init.headers as Record<string, string>)['X-Buttondown-Bypass-Firewall'], undefined, 'the firewall stays on');
});

test('Buttondown’s answers become what the page can act on, and no key is never a call', async () => {
  const answer = (status: number, body: string) => (async () => new Response(body, { status })) as typeof fetch;
  const request = { email: 'reader@example.com', tags: ['erie'] };
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, '{"code":"email_already_exists","detail":"This email address already exists."}') })).status, 'already');
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(400, '{"code":"email_invalid","detail":"That email address is not valid."}') })).status, 'invalid');
  assert.equal((await subscribe(request, { key: 'k', fetch: answer(429, 'slow down') })).status, 'unavailable', 'the daily limit: Buttondown’s own form instead');
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
