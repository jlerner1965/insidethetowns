# Receiving mail at hello@

Every site prints `hello@inside<town>.com`, and every photo and trade-body
request asks people to write to it. Checked 27 September 2026: all eight
domains are on Cloudflare (nameservers `donna` and `fonzie`), none has an MX
record, and none has SPF or DMARC. Mail to any of the addresses bounces.

`npm run email-routing -- --check` reproduces that check from anywhere, with
no credentials, and exits 1 while any domain still bounces.

## The fix: Cloudflare Email Routing

Free, and about ten minutes for all eight. It forwards any address on a
domain to an inbox you already read. Two routes.

### Route A: one command

Create an API token at https://dash.cloudflare.com/profile/api-tokens with
these permissions, scoped to the eight zones:

| Scope | Permission |
|---|---|
| Zone | Zone: Read |
| Zone | DNS: Edit |
| Zone | Email Routing Rules: Edit |
| Account | Email Routing Addresses: Edit |

Then, with the inbox the mail should land in:

```
CLOUDFLARE_API_TOKEN=… EMAIL_DESTINATION=you@example.com npm run email-routing -- --catch-all
```

For each domain it switches routing on (Cloudflare adds and locks the MX and
SPF records), registers the destination on the account, adds a rule forwarding
`hello@` there, forwards every other address there too (`--catch-all`, so
`info@` and a typo still arrive), and adds a DMARC record. It is idempotent.

**One step is yours:** the first time a destination inbox is registered,
Cloudflare emails it a verification link. Nothing forwards until it is
clicked. The script says so when the address is still unverified.

Then `npm run email-routing -- --check`, and send a test message to each
`hello@`.

### Route B: the dashboard

For each of the eight zones at https://dash.cloudflare.com:

1. **Email → Email Routing → Get started.**
2. **Destination address:** the inbox to forward to. Cloudflare emails it a
   verification link; click it once, it covers every zone on the account.
3. **Custom address:** `hello`, action Send to, the destination. Save.
4. **Catch-all:** action Send to, the destination. Save.
5. **DNS records:** Cloudflare offers to add the MX and SPF records; accept.
6. **DNS → Records → Add:** TXT, name `_dmarc`, content
   `v=DMARC1; p=none; rua=mailto:<destination>`.

Repeat for the other seven. Steps 2 and the verification click happen once.

## What this does not do

Send. Replying from the forwarded inbox works, but the reply goes out from
that inbox's address, not from `hello@inside<town>.com`. Sending as the town
address needs a sending provider with its own DNS records (DKIM, and its
`include:` in SPF). The environment holds a Resend key that is scoped to
sending only, so it cannot set that up; when the time comes, add each domain
in the Resend dashboard, add the records it gives you at Cloudflare, and then
set DMARC to `p=quarantine`. Until then, sign outgoing mail with the
forwarded inbox's address and the site's name.

## Why not Vercel, Google or the contact form

- Vercel hosts the sites and runs no mail; the domains' A records point at
  its edge, which is where a sender with no MX record falls back to and
  fails.
- A Google Workspace mailbox per domain is eight subscriptions for one
  person's inbox.
- The contact form on every site delivers through Formspree independently of
  DNS, so `/contact/` works today and is the fallback to point people at
  until routing is on. It is not a substitute for an address printed in
  thirty-six emails.
