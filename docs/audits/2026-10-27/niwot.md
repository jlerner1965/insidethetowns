# Inside Niwot — site audit 27 October 2026

**Verdict:** Solid: the live site is clean, the week's notes are current, nothing a reader sees is wrong; the open items are the five call-list listings from 12 October and 14 past events to tidy.

**Numbers:** 21 upcoming events (14 in 30 days, 26 in 60, 26 in 90 — runs to 2027-07-04 (250 days)); 41 listings, 33 without a photo; 7 not re-checked in 30+ days; staging: 3 events, 0 places; home page 200 in 409 ms, average 89 ms over 90 pages; sitemap 97 URLs; calendar feed 30 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 17 match, 0 mismatch, 6 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- Nothing that is wrong for a reader today.

## Fix soon
- [accuracy] Belle Terre Floral's hours (Mon–Sat 10–5) and The Nook's hours (daily 7 am–8 pm) are on no page of their own; the gateway sculpture is no longer described on niwotarts.org (all three on the 12 October call list).
- [coverage] 2 bars, 2 trails and 1 lodging listed; Berthoud and Lyons carry three to six of each. The Wheel House and Niwot Tavern are the only bars; no trail beyond LoBo and the Niwot Loop.
- [accuracy] 7 listings or series not re-checked in 30+ days (npm run weekly lists them); the oldest: 2026-09-18  Niwot Hall board meeting; 2026-09-18  Niwot Local Improvement District Advisory Committee meeting; 2026-09-18  Belle Terre Floral; 2026-09-18  The Garden Gate Cafe; 2026-09-09  The Niwot gateway sculpture
- [content] 33 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 14 past events still in content/niwot/events/ (hidden on the site; delete or add the next dates)
- [design] 7/74 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Niwot" suffix plus the date; see the network summary)

## Since last audit
- Still open from the 12 October re-check (docs/archive/CALL-LIST.md): Sachi Sushi hours, The Nook's phone, Niwot Liquor Store, the gateway sculpture, Belle Terre Floral. Each is now past 30 days; the first hours start hiding around 8 November and the listings themselves around 8 December.
- Fixed since 2 October: the 26 October audit's family hub, the incorporation explainer re-read against the election commission and the county, the Election Day listing.

## Couldn't verify
- niwotmarket.com answered nothing to the crawler today (Sachi Sushi, The Nook and the Niwot Market contact page all cite it); the site may be down rather than gone: check in a browser.
- no response from https://niwotmarket.com/contact-us (DNS, TLS or timeout; the listing's own site may be down) — content/niwot/places/niwot-market.md
- no response from https://niwotmarket.com/sachi-sushi-1 (DNS, TLS or timeout; the listing's own site may be down) — content/niwot/places/sachi-sushi.md
- no response from https://niwotmarket.com/the-nook (DNS, TLS or timeout; the listing's own site may be down) — content/niwot/places/the-nook.md
- 5 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): maxpreps.com (4), commons.wikimedia.org (1)
- places/belle-terre-floral.md hours: hours not stated
- places/garden-gate-cafe.md hours / address: Cloudflare 403 (curl and WebFetch)
- places/the-nook.md hours: hours not stated
- places/gateway-sculpture.md address: source page does not describe it

## Proposed changes
- Delete the 14 past event files `npm run weekly -- --town=niwot` lists (all are one-off dates in October; none carries a next date).
