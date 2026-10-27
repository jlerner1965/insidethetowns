# Inside Lyons — site audit 27 October 2026

**Verdict:** Good: 74 upcoming events, the week's notes current, nothing wrong for a reader; two stale re-check flags to dismiss, 22 staged events waiting, and the Lyons Recorder (44 events' source) still blocks automated reads.

**Numbers:** 74 upcoming events (54 in 30 days, 95 in 60, 96 in 90 — runs to 2026-12-27 (61 days)); 38 listings, 28 without a photo; 10 not re-checked in 30+ days; staging: 22 events, 2 places; home page 200 in 465 ms, average 86 ms over 90 pages; sitemap 120 URLs; calendar feed 93 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 21 match, 0 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [links] lyonsfire.org answered 503 to the crawler from /moving-here/ and the Living Here page; check in a browser before changing anything.

## Fix soon
- [accuracy] Solace, Uniquely Lyons and Western Stars match the Town's shop directory (the only source that answers); solaceoflyons.com and uniquelylyons.com do not respond and westernstarsgallery.com redirects to a dead host. The Town's list is undated, so a call is still the only way to confirm they are open.
- [content] 22 staged events and 2 staged places waiting since 6–21 October (the editor works 25 events a week network-wide, so Lyons's queue is a month deep). Decide the queue yourself: `npm run review -- --town=lyons`.
- [coverage] The Rock Garden is a core source (5 events) still proposed: `npm run sources -- confirm lyons rockgardenlyons-com`.
- [links] bouldercountyvotes.gov now redirects to bouldercounty.gov (election-day-2026-11-03.md, lines 7 and 10): relink to the county's own vote-centers page before 3 November.
- [coverage] 2 coffee listings; Niwot and Berthoud have four. No trailhead pages (Hall Ranch, Heil Valley and Button Rock are `trail` entries without `access` blocks).
- [accuracy] 10 listings or series not re-checked in 30+ days (npm run weekly lists them); the oldest: 2026-09-18  Blood drive; 2026-09-18  Library district board meeting; 2026-09-18  Library district board meeting; 2026-09-18  Lyons Urban Renewal Authority; 2026-09-18  Lyons Urban Renewal Authority
- [content] 28 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 54 past events still in content/lyons/events/ (hidden on the site; delete or add the next dates)
- [design] 9/74 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Lyons" suffix plus the date; see the network summary)

## Since last audit
- Still open from 12 October: Solace, Uniquely Lyons, Western Stars and Gatherings of a Lifetime (dead or lapsing sites; the Town's shop list is the only source) and Oskar Blues (checked 17 September). All five pass 30 days this week; hours hide from mid-November.
- Fixed since: the /stay/ page (26 October), the duplicated Fort Lupton... n/a. The Spooktacular and Ecology Advisory Board flags are for dates now past.

## Couldn't verify
- lyons-librarycalendar-com: robots.txt asks automated clients to stay out, so the library's 30-odd events are confirmed only by hand.
- LaVern M. Johnson Park Campground and the WeeCasa listing have no hours line (seasonal text only).
- source registry: 2026-10-19  lyons-librarycalendar-com: skipped — robots.txt asks automated clients not to fetch it
- 10 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): maxpreps.com (10)
- places/oskar-blues-grill-brew.md hours / address: Cloudflare 403 (curl and WebFetch)
- events/country-music-explored-wildflower.md time: time not readable

## Proposed changes
- Dismiss the two re-check flags on past dates: remove `changeFlag`/`changeNote` from content/lyons/events/halloween-spooktacular-2026.md and content/lyons/events/ecology-advisory-board-2026-10-20.md (or delete the files; both dates are over).
- Delete the 54 past event files the weekly report lists for Lyons.
