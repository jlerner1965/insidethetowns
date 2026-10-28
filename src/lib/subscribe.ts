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
 * - `confirm`: Buttondown made the subscriber `unactivated` and sent its
 *   confirmation email; nobody is on the list until they click it. Also
 *   the answer for an address Buttondown already had but never confirmed
 *   (the confirmation is sent again) or that had unsubscribed (resubscribed
 *   pending a new confirmation).
 * - `added`: Buttondown made the subscriber `regular` at once, which it only
 *   does when double opt-in is off in the account's settings. No
 *   confirmation email is coming, so the page must not say one is.
 * - `already`: Buttondown says the address is an active subscriber, and the
 *   form's towns have been added to it.
 * - `invalid`: Buttondown says the address itself is not valid.
 * - `unavailable`: no key, a limit reached, a blocked address, Buttondown
 *   down, or no answer; the page offers Buttondown's own form instead.
 */
export type SubscribeStatus = 'confirm' | 'added' | 'already' | 'invalid' | 'unavailable';

/**
 * Buttondown's 400 codes for a new subscriber (its OpenAPI schema,
 * SubscriberInputValidationErrorCode, read 26 October 2026). An address it
 * has already, in any state, is looked up and dealt with from the page
 * (`existing`). Only an IP the firewall scores as spammy is tried again,
 * past the firewall. Every other code (email_blocked, subscriber_blocked,
 * rate_limited, tag_invalid…) is `unavailable`, and the page hands the
 * reader to Buttondown's own form, which says why in its own words.
 * Matching on the human text instead read "email_blocked" as a typo in the
 * address.
 */
const ALREADY_CODES = new Set(['email_already_exists', 'subscriber_already_exists', 'subscriber_suppressed']);
const INVALID_CODES = new Set(['email_invalid', 'email_empty']);
const FIREWALL_CODES = new Set(['ip_address_spammy']);
/** Subscriber types nothing on this page can change: the owner's, or the reader's mail server's. */
const FINAL_TYPES = new Set(['blocked', 'complained', 'undeliverable', 'removed']);

/** The `code` of a Buttondown error body, or undefined if there is none. */
function errorCode(body: string): string | undefined {
  try {
    const code = (JSON.parse(body) as { code?: unknown } | null)?.code;
    return typeof code === 'string' ? code : undefined;
  } catch {
    return undefined;
  }
}

/** The subscriber's `type` from a 201's body, or undefined if it cannot be read. */
function subscriberType(body: string): string | undefined {
  try {
    const type = (JSON.parse(body) as { type?: unknown } | null)?.type;
    return typeof type === 'string' ? type : undefined;
  } catch {
    return undefined;
  }
}

export interface SubscribeResult {
  status: SubscribeStatus;
  /** What went wrong, for the function's log; never shown to the reader. */
  detail?: string;
}

interface SubscribeOptions {
  key: string | undefined;
  ip?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

/** One call to Buttondown's API: its status and body, or the reason there was none. */
type Answer = { status: number; ok: boolean; body: string } | { error: string };

function caller(key: string, options: SubscribeOptions) {
  const send = options.fetch ?? fetch;
  return async (url: string, init: { method: string; body?: unknown; headers?: Record<string, string> }): Promise<Answer> => {
    try {
      const res = await send(url, {
        method: init.method,
        headers: { Authorization: `Token ${key}`, Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
        ...(init.body ? { body: JSON.stringify(init.body) } : {}),
        signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
      });
      return { status: res.status, ok: res.ok, body: await res.text().catch(() => '') };
    } catch (e) {
      return { error: `no answer from Buttondown (${(e as Error).name})` };
    }
  };
}

/** The new subscriber, as the create call sends it: the towns as tags, no type, so double opt-in holds. */
function newSubscriber(request: SignupRequest, ip: string | undefined) {
  return {
    email_address: request.email,
    tags: request.tags,
    ...(request.page ? { referrer_url: request.page } : {}),
    ...(ip ? { ip_address: ip } : {}),
  };
}

/** Hand one signup to Buttondown. */
export async function subscribe(request: SignupRequest, options: SubscribeOptions): Promise<SubscribeResult> {
  if (!options.key) return { status: 'unavailable', detail: 'BUTTONDOWN_API_KEY is not set' };
  const call = caller(options.key, options);
  const create = (headers?: Record<string, string>) => call(BUTTONDOWN_SUBSCRIBERS, { method: 'POST', body: newSubscriber(request, options.ip), headers });
  let answer = await create();
  // A shared or relayed IP (iCloud Private Relay, a VPN, a phone carrier's)
  // can score as spammy, and the reader can do nothing about it. Once more,
  // past the firewall: Buttondown allows five of these an hour, and no type
  // is sent, so the confirmation email still stands between an address and
  // the list.
  if ('status' in answer && answer.status === 400 && FIREWALL_CODES.has(errorCode(answer.body) ?? '')) {
    answer = await create({ 'X-Buttondown-Bypass-Firewall': 'true' });
  }
  if ('error' in answer) return { status: 'unavailable', detail: answer.error };
  const result = created(answer);
  return result.status === 'already' ? existing(request, call, options.ip) : result;
}

/**
 * An address Buttondown already has, settled from the page rather than
 * sent to Buttondown's own form in a new tab (owner, 28 October 2026: the
 * new tab, its "Verify and Subscribe" and the email were too many steps).
 * What happens depends on the state Buttondown has it in:
 * - never confirmed: the confirmation email is sent again (`confirm`);
 * - unsubscribed: resubscribed as `unactivated`, which sends a new
 *   confirmation email, so nobody who left is back without clicking it
 *   (`confirm`);
 * - blocked, complained, undeliverable or removed: nothing here can change
 *   that (`unavailable`);
 * - otherwise on the list: the form's towns are added to the ones it has
 *   (`already`). Buttondown merges them itself, since its subscriber
 *   objects come back with an empty tag list and a list sent here would
 *   replace the reader's towns. Only ever added, never taken away.
 */
async function existing(request: SignupRequest, call: ReturnType<typeof caller>, ip: string | undefined): Promise<SubscribeResult> {
  const one = `${BUTTONDOWN_SUBSCRIBERS}/${encodeURIComponent(request.email)}`;
  const found = await call(one, { method: 'GET' });
  if ('error' in found) return { status: 'unavailable', detail: found.error };
  const type = found.ok ? subscriberType(found.body) : undefined;
  if (!type) return { status: 'unavailable', detail: `already on Buttondown, but the lookup gave HTTP ${found.status}: ${found.body.slice(0, 200)}` };
  if (FINAL_TYPES.has(type)) return { status: 'unavailable', detail: `already on Buttondown as ${type}` };
  if (type === 'unactivated') {
    const sent = await call(`${one}/send-reminder`, { method: 'POST' });
    if ('error' in sent) return { status: 'unavailable', detail: sent.error };
    return sent.ok
      ? { status: 'confirm', detail: 'already on Buttondown, unconfirmed: confirmation sent again' }
      : { status: 'unavailable', detail: `send-reminder gave HTTP ${sent.status}: ${sent.body.slice(0, 200)}` };
  }
  const resubscribe = type === 'unsubscribed';
  const merged = await call(BUTTONDOWN_SUBSCRIBERS, {
    method: 'POST',
    body: { ...newSubscriber(request, ip), ...(resubscribe ? { type: 'unactivated' } : {}) },
    headers: { 'X-Buttondown-Collision-Behavior': 'add' },
  });
  if ('error' in merged) return { status: 'unavailable', detail: merged.error };
  if (!merged.ok) return { status: 'unavailable', detail: `adding to an existing ${type} subscriber gave HTTP ${merged.status}: ${merged.body.slice(0, 200)}` };
  return resubscribe
    ? { status: 'confirm', detail: 'unsubscribed on Buttondown: resubscribed pending confirmation' }
    : { status: 'already', detail: `already on Buttondown as ${type}: towns added` };
}

/** The create call's answer, read. `already` here means only that Buttondown has the address. */
function created(res: { status: number; ok: boolean; body: string }): SubscribeResult {
  const body = res.body;
  if (res.ok) {
    // The 201 carries the new subscriber. `unactivated` is the double
    // opt-in state, and the default; `regular` means the account has double
    // opt-in switched off, so no confirmation email is on its way. A body
    // that cannot be read is taken as the default, which is what no `type`
    // in the request asks for.
    const type = subscriberType(body);
    if (type === 'regular') return { status: 'added', detail: 'subscriber created as regular: double opt-in is off in Buttondown' };
    return { status: 'confirm' };
  }
  const detail = `HTTP ${res.status}: ${body.slice(0, 300)}`;
  // An address already on the list is a 400, since the first call asks for
  // no collision behaviour: `existing` looks it up and decides, so a new
  // address is never merged into anything by accident.
  if (res.status !== 400) return { status: 'unavailable', detail };
  const code = errorCode(body);
  if (code !== undefined) {
    if (ALREADY_CODES.has(code)) return { status: 'already', detail };
    if (INVALID_CODES.has(code)) return { status: 'invalid', detail };
    return { status: 'unavailable', detail };
  }
  // A 400 with no code (Buttondown's older answers): only its plainest words.
  if (/already (?:exists|subscribed)/i.test(body)) return { status: 'already', detail };
  if (/not a valid email|invalid email|email (?:address )?is (?:not valid|invalid)/i.test(body)) return { status: 'invalid', detail };
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
