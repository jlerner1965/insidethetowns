#!/usr/bin/env node
/**
 * Makes hello@<every domain> deliver somewhere, and proves whether it does.
 *
 * Every site prints hello@inside<town>.com, every photo request asks a
 * business to write to it, and none of the eight domains has an MX record,
 * so all of it bounces. All eight zones are on Cloudflare, whose Email
 * Routing forwards an address on a domain to a real inbox for nothing.
 *
 *   npm run email-routing -- --check
 *     No credentials. Asks public DNS (over HTTPS, since the sandbox has no
 *     resolver) whether each domain has MX, SPF and DMARC records, and says
 *     which addresses will bounce. Exit 1 if any will.
 *
 *   CLOUDFLARE_API_TOKEN=… EMAIL_DESTINATION=you@example.com npm run email-routing
 *     For each domain: enables Email Routing (Cloudflare adds and locks the
 *     MX and SPF records), registers the destination inbox on the account
 *     (Cloudflare emails it a verification link the first time; forwarding
 *     starts once that is clicked), adds a rule forwarding hello@ to it, and
 *     a DMARC record. Idempotent: re-running changes nothing already done.
 *     --catch-all also forwards every other address on the domain, which is
 *     how a typo'd "hello@" or an "info@" still reaches you.
 *     --domain=insidelyons.com narrows it to one zone.
 *
 * The token needs: Zone → Zone: Read, DNS: Edit, Email Routing Rules: Edit;
 * Account → Email Routing Addresses: Edit. Scope it to the eight zones.
 *
 * Nothing here sends mail. Sending from these domains is a separate job
 * (Resend or similar, with its own DNS records) and until it is done, reply
 * from the inbox the mail is forwarded to.
 */
import { liveTowns } from '../src/config/index.ts';
import { hub } from '../src/config/towns/hub.ts';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

const domains = [hub.domain, ...liveTowns().map((t) => t.domain)].filter((d) => !opt('domain') || d === opt('domain'));
const LOCAL = 'hello';

// ---------------------------------------------------------------- check ----

async function doh(name: string, type: string): Promise<string[]> {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`, {
    headers: { accept: 'application/dns-json' },
  });
  if (!res.ok) throw new Error(`DNS lookup for ${name} ${type} failed: HTTP ${res.status}`);
  const json = (await res.json()) as { Answer?: Array<{ data: string }> };
  return (json.Answer ?? []).map((a) => a.data);
}

async function check(): Promise<boolean> {
  let bouncing = 0;
  console.log('domain                 MX                                   SPF   DMARC  hello@');
  for (const d of domains) {
    const [mx, txt, dmarc] = await Promise.all([doh(d, 'MX'), doh(d, 'TXT'), doh(`_dmarc.${d}`, 'TXT')]);
    const spf = txt.some((t) => t.includes('v=spf1'));
    const hasDmarc = dmarc.some((t) => t.includes('v=DMARC1'));
    const delivers = mx.length > 0;
    if (!delivers) bouncing++;
    const mxText = mx.length ? mx.map((m) => m.replace(/^\d+\s+/, '').replace(/\.$/, '')).join(', ') : 'none';
    console.log(
      `${d.padEnd(22)} ${mxText.slice(0, 36).padEnd(36)} ${(spf ? 'yes' : 'no').padEnd(5)} ${(hasDmarc ? 'yes' : 'no').padEnd(6)} ${delivers ? 'delivers' : 'BOUNCES'}`,
    );
  }
  console.log(
    bouncing === 0
      ? `\nAll ${domains.length} domains accept mail.`
      : `\n${bouncing} of ${domains.length} domains have no MX record: mail to ${LOCAL}@ on them bounces. Run this script with CLOUDFLARE_API_TOKEN and EMAIL_DESTINATION set, or follow docs/EMAIL.md in the dashboard.`,
  );
  return bouncing === 0;
}

// ---------------------------------------------------------------- apply ----

const API = 'https://api.cloudflare.com/client/v4';

async function cf<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json()) as { success: boolean; result: T; errors: Array<{ code: number; message: string }> };
  if (!json.success) {
    throw new Error(`${method} ${path}: ${json.errors.map((e) => `${e.code} ${e.message}`).join('; ') || `HTTP ${res.status}`}`);
  }
  return json.result;
}

interface Zone {
  id: string;
  name: string;
  account: { id: string };
}
interface Address {
  id: string;
  email: string;
  verified: string | null;
}
interface Rule {
  id: string;
  name: string;
  matchers: Array<{ type: string; field?: string; value?: string }>;
  actions: Array<{ type: string; value?: string[] }>;
}

async function apply(): Promise<void> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const destination = process.env.EMAIL_DESTINATION;
  if (!token || !destination) {
    console.error('Set CLOUDFLARE_API_TOKEN and EMAIL_DESTINATION (the inbox hello@ should forward to), or run with --check.');
    process.exit(2);
  }
  const catchAll = flag('catch-all');

  for (const domain of domains) {
    console.log(`\n${domain}`);
    const zones = await cf<Zone[]>('GET', `/zones?name=${domain}`);
    const zone = zones[0];
    if (!zone) {
      console.log('  not a zone on this account; skipped');
      continue;
    }

    // 1. Routing on, which adds and locks the MX and SPF records.
    const routing = await cf<{ enabled: boolean; status: string }>('GET', `/zones/${zone.id}/email/routing`);
    if (routing.enabled) console.log(`  routing already enabled (${routing.status})`);
    else {
      await cf('POST', `/zones/${zone.id}/email/routing/enable`);
      console.log('  routing enabled; MX and SPF records added');
    }

    // 2. The inbox to forward to, registered once per account. Cloudflare
    //    emails it a verification link; nothing forwards until it is clicked.
    const addresses = await cf<Address[]>('GET', `/accounts/${zone.account.id}/email/routing/addresses?per_page=50`);
    let address = addresses.find((a) => a.email.toLowerCase() === destination.toLowerCase());
    if (!address) {
      address = await cf<Address>('POST', `/accounts/${zone.account.id}/email/routing/addresses`, { email: destination });
      console.log(`  destination ${destination} registered; Cloudflare has emailed it a verification link`);
    }
    if (!address.verified) console.log(`  destination ${destination} is NOT yet verified: click the link in Cloudflare's email or nothing forwards`);

    // 3. hello@ → destination.
    const rules = await cf<Rule[]>('GET', `/zones/${zone.id}/email/routing/rules?per_page=50`);
    const helloAt = `${LOCAL}@${domain}`;
    const existing = rules.find((r) => r.matchers.some((m) => m.type === 'literal' && m.field === 'to' && m.value === helloAt));
    if (existing) console.log(`  rule for ${helloAt} already present`);
    else {
      await cf('POST', `/zones/${zone.id}/email/routing/rules`, {
        name: `${helloAt} → ${destination}`,
        enabled: true,
        matchers: [{ type: 'literal', field: 'to', value: helloAt }],
        actions: [{ type: 'forward', value: [destination] }],
      });
      console.log(`  ${helloAt} forwards to ${destination}`);
    }

    // 4. Everything else on the domain, if asked.
    if (catchAll) {
      await cf('PUT', `/zones/${zone.id}/email/routing/rules/catch_all`, {
        name: `catch-all → ${destination}`,
        enabled: true,
        matchers: [{ type: 'all' }],
        actions: [{ type: 'forward', value: [destination] }],
      });
      console.log(`  every other address forwards to ${destination}`);
    }

    // 5. DMARC, so a receiving server treats the domain as one that has
    //    thought about mail. p=none: report, do not reject, until sending is
    //    set up with its own DKIM.
    const dmarcName = `_dmarc.${domain}`;
    const records = await cf<Array<{ id: string; content: string }>>('GET', `/zones/${zone.id}/dns_records?type=TXT&name=${dmarcName}`);
    if (records.length > 0) console.log('  DMARC record already present');
    else {
      await cf('POST', `/zones/${zone.id}/dns_records`, {
        type: 'TXT',
        name: '_dmarc',
        content: `v=DMARC1; p=none; rua=mailto:${destination}`,
        ttl: 1,
      });
      console.log('  DMARC record added (p=none)');
    }
  }
  console.log('\nDone. Re-run with --check in a few minutes to confirm the MX records are visible, then send a test message to each hello@.');
}

if (flag('check')) {
  const ok = await check();
  process.exit(ok ? 0 : 1);
} else {
  await apply();
}
