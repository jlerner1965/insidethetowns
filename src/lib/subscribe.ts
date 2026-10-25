/**
 * The weekly email's signup on the server: the form's address and towns,
 * handed to Buttondown's API by the function at /api/subscribe
 * (api/subscribe.ts), so a reader signs up without leaving the page.
 *
 * Why a function at all: Buttondown's embed form cannot be finished from the
 * page. A post to it opens Buttondown's own "Verify and Subscribe" page, so
 * the signup was a new tab, a second button there, then the confirmation
 * email: three places for one address, and readers were lost on the way
 * (owner, 25 October 2026). The API takes the address in one call and needs
 * a key, which a page cannot hold.
 *
 * What it keeps: double opt-in. No `type` is sent, so Buttondown makes the
 * subscriber `unactivated` and sends its confirmation email; nobody is on the
 * list until they click it, and the page says exactly that. The towns are the
 * form's own tags, checked against the email's editions, so a request cannot
 * invent a tag. The reader's address goes to Buttondown and nowhere else; the
 * reader's IP goes with it because Buttondown's firewall uses it to turn away
 * bots, as its documentation asks.
 *
 * Pure apart from the `fetch` it is given, so the tests never reach
 * Buttondown.
 */
import { emailEditions, getNetworkHub } from '../config/index.ts';

export const BUTTONDOWN_SUBSCRIBERS = 'https://api.buttondown.com/v1/subscribers';
/** The longest address RFC 5321 allows. */
const MAX_EMAIL = 254;
/** Every edition and "All towns" is fewer than this. */
const MAX_TAGS = 40;

/** The tags a form may post: every town in an edition the email covers, and "All towns". */
export function allowedTags(): Set<string> {
  const tags = new Set(emailEditions().flatMap((e) => e.towns.map((t) => t.slug)));
  const all = getNetworkHub().newsletter?.allTag;
  if (all) tags.add(all);
  return tags;
}

/** The form's field names, as the hosted form takes them (hub config). */
export function fieldNames(): { email: string; tag: string } {
  const config = getNetworkHub().newsletter;
  return { email: config?.emailField ?? 'email', tag: config?.tagField ?? 'tag' };
}

export interface SignupRequest {
  email: string;
  tags: string[];
  /** The page the form was on, for Buttondown's referrer: where readers sign up. */
  page?: string;
}

/**
 * The form's fields, read and checked. An address the browser's own email
 * check would pass, at least one town, and only towns the email covers;
 * anything else is refused before Buttondown sees it.
 */
export function readSignup(form: URLSearchParams, allowed = allowedTags()): SignupRequest | { error: 'invalid-email' | 'need-town' | 'unknown-town' } {
  const names = fieldNames();
  const email = (form.get(names.email) ?? '').trim();
  if (!email || email.length > MAX_EMAIL || !/^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/.test(email)) return { error: 'invalid-email' };
  const tags = [...new Set(form.getAll(names.tag).map((t) => t.trim()).filter(Boolean))];
  if (tags.length === 0) return { error: 'need-town' };
  if (tags.length > MAX_TAGS || tags.some((t) => !allowed.has(t))) return { error: 'unknown-town' };
  const page = form.get('page') ?? undefined;
  return { email, tags, ...(page ? { page } : {}) };
}

/**
 * What the page does with the answer:
 * - `confirm`: Buttondown took the address and sent its confirmation email.
 * - `already`: the address is on the list already (confirmed or not).
 * - `invalid`: Buttondown would not take the address.
 * - `unavailable`: no key, a limit reached, Buttondown down, or no answer;
 *   the page offers Buttondown's own form instead.
 */
export type SubscribeStatus = 'confirm' | 'already' | 'invalid' | 'unavailable';

export interface SubscribeResult {
  status: SubscribeStatus;
  /** What went wrong, for the function's log; never shown to the reader. */
  detail?: string;
}

/** Hand one signup to Buttondown. */
export async function subscribe(
  request: SignupRequest,
  options: { key: string | undefined; ip?: string; fetch?: typeof fetch; timeoutMs?: number },
): Promise<SubscribeResult> {
  if (!options.key) return { status: 'unavailable', detail: 'BUTTONDOWN_API_KEY is not set' };
  const send = options.fetch ?? fetch;
  let res: Response;
  try {
    res = await send(BUTTONDOWN_SUBSCRIBERS, {
      method: 'POST',
      headers: { Authorization: `Token ${options.key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email_address: request.email,
        tags: request.tags,
        ...(request.page ? { referrer_url: request.page } : {}),
        ...(options.ip ? { ip_address: options.ip } : {}),
      }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
    });
  } catch (e) {
    return { status: 'unavailable', detail: `no answer from Buttondown (${(e as Error).name})` };
  }
  if (res.ok) return { status: 'confirm' };
  const body = await res.text().catch(() => '');
  const detail = `HTTP ${res.status}: ${body.slice(0, 300)}`;
  // An address already on the list is a 400 unless a collision behaviour is
  // asked for, and none is: adding towns to someone else's address, or
  // resubscribing someone who left, is not something a form on a public
  // page should be able to do. Buttondown's own form does that, with its
  // own checks, and the page offers it.
  if (res.status === 400 && /already|exist|duplicate/i.test(body)) return { status: 'already', detail };
  if (res.status === 400 && /email/i.test(body)) return { status: 'invalid', detail };
  return { status: 'unavailable', detail };
}

/** The reader's IP from the platform's forwarding headers: the first hop is the client's. */
export function clientIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || undefined;
}

/**
 * The hosts this site's pages are served from: the guide's domain and its
 * www form, and the deployment's own vercel.app names, which Vercel gives
 * the function as VERCEL_URL and VERCEL_BRANCH_URL (a preview is read
 * there). Not every vercel.app host: anyone can deploy one.
 */
export function ownHosts(domain: string, env: Record<string, string | undefined>): string[] {
  return [domain, `www.${domain}`, env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter((h): h is string => !!h);
}

/**
 * A request from this site's own pages: the browser's Origin is one of the
 * site's hosts, over https. A post from anywhere else is refused, so another
 * site's page cannot use this one to sign addresses up. (Anything that is not
 * a browser can claim any Origin; Buttondown's firewall and its confirmation
 * email are what stand behind that.)
 */
export function fromOwnSite(origin: string | null, hosts: readonly string[]): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.protocol === 'https:' && hosts.includes(url.hostname);
  } catch {
    return false;
  }
}
