# Inside Timnath — site audit 27 October 2026

**Verdict:** Thin but accurate: 11 upcoming events (9 in the next 30 days) is the smallest Front Range calendar; everything checked matched its source; three listings carry facts no primary page states.

**Numbers:** 11 upcoming events (9 in 30 days, 16 in 60, 16 in 90 — runs to 2026-12-22 (56 days)); 18 listings, 14 without a photo; 6 not re-checked in 30+ days; staging: 2 events, 1 place; home page 200 in 58 ms, average 77 ms over 87 pages; sitemap 60 URLs; calendar feed 19 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 14 match, 0 mismatch, 6 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- Nothing that is wrong for a reader today.

## Fix soon
- [content] 9 events in the next 30 days: the Town's and the library's calendars are the sources to pull from; Timnath Beerwerks (7 events) is a core source still proposed: `npm run sources -- confirm timnath timnathbeerwerks-com`.
- [accuracy] The Hidden Stem (hours, phone, address) and Timnath Reservoir (hours, phone, address) rest on no page that states them: the Hidden Stem is on the 12 October call list; the reservoir needs the Town's page or a call.
- [accuracy] Town Council meeting dates (town-council-2026-11-10.md) cite timnath.org/town-council/, which lists no schedule; link the agendas page that does.
- [accuracy] 6 listings or series not re-checked in 30+ days.
- [coverage] 3 restaurants, 1 bar, 3 shops: fewer than any Front Range sibling; Timnath has more of each along Harmony Road and at the Town Center.
- [content] 14 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 5 past events still in content/timnath/events/ (hidden on the site; delete or add the next dates)
- [design] 9/67 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Timnath" suffix plus the date; see the network summary)

## Since last audit
- Still open from 12 October: The Hidden Stem (call list).

## Couldn't verify
- poudre-fire.org answers 403 to automated reads (Moving here).
- 7 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): maxpreps.com (4), commons.wikimedia.org (2), poudre-fire.org (1)
- places/the-hidden-stem.md hours: chamber listing has no hours (JS page; WebFetch confirmed none); file has no business url
- places/the-hidden-stem.md phone; address: not stated on source
- places/timnath-reservoir.md hours: not stated on source (curl + WebFetch)
- places/timnath-reservoir.md phone; address: not stated on source

## Proposed changes
- Delete the 5 past event files the weekly report lists.
