# Inside Elizabeth — site audit 27 October 2026

**Verdict:** Quiet since 12 October and accurate where checked (13 of 15 facts matched, 0 wrong), but 19 listings are past the 30-day re-check and will start losing their hours in the second week of November; the decision to keep or drop the guide is due 15 November.

**Numbers:** 28 upcoming events; 25 listings; home page 200 in 244 ms, average 77 ms over 90 pages; sitemap 69 URLs; calendar feed 39 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 13 match, 0 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] 19 listings already past the re-check (the weekly report's quiet-town line): with a 12 September check date, hours hide from about 11 November and the listings from about 11 December. Either run one rotation (`npm run agent -- verify elizabeth --stale=30`) or accept that the pages go hours-less before the 15 November decision.

## Fix soon
- [accuracy] Elizabeth Brewing's own page shows two hour sets (a table saying Mon–Fri from 4 pm, an 'open today' widget saying noon); the guide follows the table. A phone call settles it.
- [content] 3 staged places waiting since 6 October (Coffee House on Main, Cowgirlz Coffee: no site of their own; on the call list).
- [links] brewelizabeth.com/about-the-building, elizabethkbar.com/contact and icthreads.com answered nothing to the link checker (the Elizabeth Kitchen and Bar and IC Threads listings): check in a browser; a dead site is not a closed business, but a listing with no source cannot stay.
- [coverage] 1 trail listed; Elizabeth has the Running Creek and Casey Jones trail systems.
- [design] 18/71 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Elizabeth" suffix plus the date; see the network summary)

## Since last audit
- Quiet since 12 October; the 15 October decision kept it on reader numbers (DECISIONS.md, 'Elizabeth stays').

## Couldn't verify
- townofelizabeth.org answers a Cloudflare challenge to every automated read (the Town is a confirmed source that cannot be ingested).
- The Nest at the 1897 House: its only page is Facebook, which asks for a login.
- no response from https://brewelizabeth.com/about-the-building (DNS, TLS or timeout; the listing's own site may be down) — content/elizabeth/articles/elizabeth-history.md
- no response from https://elizabethkbar.com/contact (DNS, TLS or timeout; the listing's own site may be down) — content/elizabeth/articles/explore-elizabeth-in-walking-order.md, content/elizabeth/places/elizabeth-kitchen-and-bar.md
- no response from https://icthreads.com/ (DNS, TLS or timeout; the listing's own site may be down) — content/elizabeth/places/ic-threads.md
- 6 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): townofelizabeth.org (2), commons.wikimedia.org (2), maxpreps.com (2)
- places/the-nest-at-the-1897-house.md address / status: Facebook redirects to login

## Decisions for James
- Keep Elizabeth past 15 November, or let it go: if it stays, it needs a verification rotation now, because 19 of 25 listings are already stale.

## Proposed changes
- content/elizabeth/events/veterans-appreciation-luncheon-2026.md: the organizer's page gives an end time; add `end: "2026-11-06T14:00"`.
