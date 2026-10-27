# Inside Evergreen — site audit 27 October 2026

**Verdict:** Good: 10 of 12 facts matched, 0 wrong, and the notes current; three December Santa Breakfast listings cite chamber pages that are now 404s, 18 staged items wait, and the library's and the Little Bear's sources moved or went silent.

**Numbers:** 20 upcoming events (8 in 30 days, 21 in 60, 22 in 90 — runs to 2027-01-30 (95 days)); 27 listings, 22 without a photo; staging: 6 events, 12 places; home page 200 in 52 ms, average 71 ms over 90 pages; sitemap 74 URLs; calendar feed 25 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 10 match, 0 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [links] 404 https://members.evergreenchamber.org/events/details/santa-breakfast-104105 — in content/evergreen/events/santa-breakfast-at-lariat-lodge-2026-12-05.md
- [links] 404 https://members.evergreenchamber.org/events/details/santa-breakfast-104107 — in content/evergreen/events/santa-breakfast-at-wild-game-2026-12-19.md
- [links] 404 https://members.evergreenchamber.org/events/details/santa-breakfast-12-12-2026-104106 — in content/evergreen/events/santa-breakfast-at-woodcellar-bar-and-grill-2026-12-12.md

## Fix soon
- [links] The three Santa Breakfast files (5, 12 and 19 December) cite members.evergreenchamber.org event pages that are 404s; the chamber now lists the series at https://evergreenchamber.org/santa-breakfast/. Relink all three and re-verify the dates there.
- [links] jeffcolibrary.org (a confirmed source) now lands on jeffcolibrary.bibliocommons.com: update the registry entry.
- [accuracy] Evergreen Lake and Kittredge Park access notes stale in 9 days.
- [content] 6 staged events and 12 staged places waiting since 6–10 October; six of the events are 'held by the editor' (the Monday run's note).
- [content] 22 of 27 listings without a photograph.
- [links] https://our.show/takeflight now lands on www.onthestage.tickets (a rebrand, still answering; relink to the new host) — in content/evergreen/staging/events/evergreen-children-s-chorale-fall-concert-take-flight-2026-11-13.md
- [content] 22 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 8 past events still in content/evergreen/events/ (hidden on the site; delete or add the next dates)
- [design] 23/70 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Evergreen" suffix plus the date; see the network summary)

## Since last audit
- First audit as a visitor guide (20 October).

## Couldn't verify
- littlebearsaloon.com answers nothing (the staged Little Bear listing).
- Alderfer/Three Sisters hours and the Halloween Walk's cost are not stated on their pages.
- source registry: 2026-10-19  jeffcolibrary-org: changed — now lands on jeffcolibrary.bibliocommons.com
- source registry: 2026-10-19  evergreenaudubon-org: skipped — robots.txt asks automated clients not to fetch it
- source registry: 2026-10-19  littlebearsaloon-com: unreachable — no response — DNS, TLS or timeout
- 10 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (9), en.wikipedia.org (1)
- places/alderfer-three-sisters-park.md hours: not on page
- events/downtown-evergreen-halloween-walk-2026-10-31.md cost: cost not stated

## Proposed changes
- content/evergreen/events/santa-breakfast-at-lariat-lodge-2026-12-05.md, santa-breakfast-at-woodcellar-bar-and-grill-2026-12-12.md, santa-breakfast-at-wild-game-2026-12-19.md: `url` and `source` → https://evergreenchamber.org/santa-breakfast/ once the dates are confirmed there; `verified: "2026-10-27"`.
