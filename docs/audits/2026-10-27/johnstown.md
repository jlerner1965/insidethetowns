# Inside Johnstown — site audit 27 October 2026

**Verdict:** Fair: the site is clean and the notes current, but the calendar runs out on 10 December (44 days, under the 45-day floor), one event's library source is a 404, and the guide lists no bar, trail or lodging.

**Numbers:** 42 upcoming events (44 in 30 days, 54 in 60, 54 in 90 — runs to 2026-12-10 (44 days)  ⚠ under 45 days of runway); 30 listings, 24 without a photo; 8 not re-checked in 30+ days; staging: 4 events, 1 place; home page 200 in 223 ms, average 77 ms over 90 pages; sitemap 99 URLs; calendar feed 57 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 23 match, 0 mismatch, 3 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [links] 404 https://johnstownmillikenpubliclibraries.us/event/thanksgiving-place-cards/ — in content/johnstown/events/thanksgiving-place-cards-2026-11-24.md

## Fix soon
- [accuracy] The Cemetery Crawl's noon tour (31 October) is sold out and the library's Paint 'n' Sip (6 November) has a waiting list only; say so on each listing.
- [content] Calendar runway is 44 days (ends 10 December): add December and January listings (the Town's and the library's feeds carry them; `npm run ingest -- --town=johnstown`).
- [coverage] No bar or brewery, no trail and no lodging listed; every other Front Range guide has at least two bars. Candidates the Town lists exist but none has been checked, so this is a gap to fill, not a fact to publish.
- [links] The Weld RE-5J school-year calendar URL in src/config/towns/johnstown.ts (lines 76–93, every break) now redirects to resources.finalsite.net; it still answers, so relink when next editing.
- [accuracy] 8 listings or series not re-checked in 30+ days.
- [links] https://www.weldre5j.org/fs/resource-manager/view/a2404edd-b9a0-4b6e-be7a-28e0f805c65b now lands on resources.finalsite.net (a rebrand, still answering; relink to the new host) — in src/config/towns/johnstown.ts
- [content] 24 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 22 past events still in content/johnstown/events/ (hidden on the site; delete or add the next dates)
- [design] 18/71 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Johnstown" suffix plus the date; see the network summary)

## Since last audit
- Fixed since 2 October: Wing Shack and Animal Crackers Feed, Old Town leading the featured places, the storytime record (26 October audit).

## Couldn't verify
- johnstownpolice.org answers 403 to automated reads (About and Moving here).
- 9 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): maxpreps.com (6), commons.wikimedia.org (2), johnstownpolice.org (1)
- places/dominics-hometown-pizza.md hours / address: Toast ordering page blocked
- places/scheels.md hours / phone / address: Cloudflare 403 (curl and WebFetch)
- events/paint-n-sip-2026-11-06.md cost: cost not stated

## Proposed changes
- content/johnstown/events/thanksgiving-place-cards-2026-11-24.md: lines 7 and 9 cite https://johnstownmillikenpubliclibraries.us/event/thanksgiving-place-cards/ which is a 404. Relink to the library's current event page (its calendar at johnstownmillikenpubliclibraries.us/events/) or hold the listing until it has a source.
- Delete the 22 past event files the weekly report lists.
