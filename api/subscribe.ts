/**
 * POST /api/subscribe: the weekly email's signup, without leaving the page.
 *
 * A Vercel Function beside the static site, one per project like the site
 * itself. It reads the form's address and towns, checks them, and hands them
 * to Buttondown's API with the key from the project's BUTTONDOWN_API_KEY
 * (src/lib/subscribe.ts has the rules). The answer is a status the page acts
 * on, never the provider's own words; `unavailable` tells the page to offer
 * Buttondown's hosted form instead, so a missing key or a bad day at the
 * provider costs a reader one more press, not their signup.
 *
 * The page only calls this once the build has seen the key
 * (NewsletterSignup.astro), so a project without one never sends a reader
 * here.
 */
import { getSite } from '../src/config/index.ts';
import { clientIp, fromOwnSite, ownHosts, readSignup, subscribe, type SubscribeStatus } from '../src/lib/subscribe.ts';

const json = (status: SubscribeStatus | 'refused', http: number) =>
  new Response(JSON.stringify({ status }), { status: http, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function POST(request: Request): Promise<Response> {
  const site = getSite();
  if (!fromOwnSite(request.headers.get('origin'), ownHosts(site.domain, process.env))) return json('refused', 403);
  if (!/application\/x-www-form-urlencoded/.test(request.headers.get('content-type') ?? '')) return json('refused', 415);
  const text = await request.text();
  if (text.length > 4000) return json('refused', 413);
  const signup = readSignup(new URLSearchParams(text));
  if ('error' in signup) return json(signup.error === 'invalid-email' ? 'invalid' : 'refused', 400);
  const result = await subscribe(signup, { key: process.env.BUTTONDOWN_API_KEY, ip: clientIp(request.headers) });
  // The reason goes to the function's log, never to the page; the address does not go to either.
  if (result.detail) console.log(`subscribe (${site.slug}): ${result.status}: ${result.detail}`);
  return json(result.status, result.status === 'confirm' ? 201 : result.status === 'unavailable' ? 503 : 200);
}

export function GET(): Response {
  return new Response('POST only', { status: 405, headers: { Allow: 'POST' } });
}
