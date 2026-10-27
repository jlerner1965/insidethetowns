# Inside Berthoud — site audit 27 October 2026

**Verdict:** Good: the strongest calendar in the network (67 events in 30 days), the week's notes current, nothing wrong for a reader; two listings whose only source dropped them need a call, 16 listings are past the 30-day re-check, and 42 of 49 listings have no photograph.

**Numbers:** 47 upcoming events (67 in 30 days, 109 in 60, 109 in 90 — runs to 2026-12-26 (60 days)); 49 listings, 42 without a photo; 16 not re-checked in 30+ days; staging: 0 events, 1 place; home page 200 in 54 ms, average 80 ms over 90 pages; sitemap 124 URLs; calendar feed 96 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 15 match, 1 mismatch, 5 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] 2 listings wrong against the business's own page: kofe-house.md (replacement text under Proposed changes)

## Fix soon
- [accuracy] Kofe House (kofe-house.md) also opens Thursday evenings 5–8 pm for Italian dinner, which the guide's hours line leaves out; the site shows only 'today's' daytime hours, so confirm the seven-day pattern by phone. The page also gives a phone the guide lacks: (970) 344-5391.
- [accuracy] Cribbage Night at City Star on 11 November (cribbage-night-city-star-2026-11-11.md): City Star's calendar lists the series on the 2nd and 4th Wednesdays but shows only the Double Wide Burgers truck on 11 November; re-check once the November calendar fills, or hold the listing.
- [accuracy] B-Rad's Arcade and Trailhead Cafe carry `changeFlag` since 26 October: Berthoud Main Street's Dine & Drink page, their only source, no longer lists either. Call or walk past before the hours hide (60 days from their last check), then re-source or mark closed.
- [links] www.berthoud.org/Calendar.aspx?EID=6319 (rec-center-fifth-anniversary-2026-11-20.md) now lands on a CivicPlus login page; the Town's RSS feed no longer carries the item under that name. Confirm the 20 November anniversary on the Town's or the rec center's page and relink, or hold the listing.
- [links] xcelenergy.com → my.xcelenergy.com (src/config/towns/berthoud.ts:105): harmless redirect; relink when next editing the config.
- [accuracy] 16 listings or series not re-checked in 30+ days, the biggest backlog on a Front Range guide; the 12 October call list still names Wishful Living (its domain carries a gambling store) and B-Rad's.
- [content] 42 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 31 past events still in content/berthoud/events/ (hidden on the site; delete or add the next dates)
- [design] 20/75 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Berthoud" suffix plus the date; see the network summary)

## Since last audit
- Still open from 12 October: Wishful Living and B-Rad's Arcade (call list). The 26 October audit's About-page and futsal-deadline fixes are live.
- The Berthoud Community Library's events-classes page answered 429 to the crawler and the nightly re-check reads 'page does not show it' for six library series (PR #204): the library calendar needs a feed or a phone call.

## Couldn't verify
- berthoudpetsupply.com answered nothing (DNS, TLS or timeout) for berthoud-pet-supply.md; carterlakemarina.com the same for the Carter Lake article: check both in a browser.
- larimer.gov (sample ballot, sheriff) and the library's events page answer 403/429 to automated reads.
- no response from https://berthoudpetsupply.com/ (DNS, TLS or timeout; the listing's own site may be down) — content/berthoud/places/berthoud-pet-supply.md
- no response from https://carterlakemarina.com/ (DNS, TLS or timeout; the listing's own site may be down) — content/berthoud/articles/carter-lake-trail-permit-and-launch.md
- 9 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): larimer.gov (4), maxpreps.com (3), commons.wikimedia.org (2)
- places/b-rads-arcade.md address / status: not on source page
- places/trailhead-cafe.md address / status: not on source page
- places/city-star-brewing.md phone: phone not stated
- events/cribbage-night-city-star-2026-11-11.md date / time: Nov 11 occurrence not on calendar

## Decisions for James
- B-Rad's Arcade and Trailhead Cafe: keep (after a call), re-source to their own Facebook pages (allowed since 11 October), or mark closed.

## Proposed changes
- Delete the 31 past event files the weekly report lists for Berthoud.
- content/berthoud/places/kofe-house.md — `hours: "Daily 7:30 am–2:30 pm; Thu also 5–8 pm for Italian dinner"` (site shows only "today's" daytime hours; confirm the 7-day pattern before relying on "Daily"). Optional add: `phone: "(970) 344-5391"`.
- Follow-ups, not mismatches: b-rads-arcade.md and trailhead-cafe.md are no longer on their only source page (changeNotes already on file); cribbage-night-city-star-2026-11-11.md should be re-checked once City Star's November calendar lists it.
