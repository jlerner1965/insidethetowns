# Inside Windsor — site audit 27 October 2026

**Verdict:** Needs attention this week: the This Week page is still last week's (the Wednesday research run died on Windsor, so the editor published nothing for the week of 26 October), and three re-check flags on the Twilight Tour need a ruling before Friday's tour; everything spot-checked against sources matched.

**Numbers:** 25 upcoming events (38 in 30 days, 61 in 60, 61 in 90 — runs to 2026-12-24 (58 days)); 46 listings, 41 without a photo; staging: 1 event, 8 places; home page 200 in 217 ms, average 85 ms over 90 pages; sitemap 108 URLs; calendar feed 51 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 16 match, 0 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [content] No weekly notes for the week of 26 October: /this-week/ shows the week of 19 October (the Halloween Carnival of 24 October as the pick). The research agent threw on Windsor on 21 October ('model asked for a client tool'), fixed in this audit's branch (agent/agent.mjs); until a draft exists, write content/windsor/weekly/2026-10-26.md by hand from the listings.
- [accuracy] Twilight Tour of Lakeview Cemetery, 30 October: the guide lists one file at 5:30 pm with two tours (5:30 and 7); the Town's calendar lists the two tours as separate items (EID 1326 and 1327) and the re-check flagged the file against the 7 pm one. The listing is right as written; dismiss the flag so the page stops carrying a contradiction.

## Fix soon
- [accuracy] The 23 and 24 October Twilight Tour files are flagged and past: delete them.
- [links] clearviewlibrary.org (the library, a confirmed source) now lands on clearview.libnet.info: update the registry entry's URL (`content/windsor/sources.json`) so the Monday check stops reporting it as changed.
- [content] 8 staged places waiting since 10 October; 41 of 46 listings without a photograph (the most on a Front Range guide after Carbon Valley).
- [links] weld.gov Property-Information now redirects to apps.weld.gov (moving-to-severance.md line 55); library.municode.com answers 403.
- [coverage] 15 parks against 5 restaurants and 2 coffee listings; Windsor's downtown has more of both.
- [accuracy] Hearth Restaurant and Pub's own site shows two hour sets (header vs footer); the guide follows the header. Worth a call.
- [content] 41 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 35 past events still in content/windsor/events/ (hidden on the site; delete or add the next dates)
- [design] /directory/: description 167 chars (over 160; a chassis fix on the directory page)
- [design] 14/72 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Windsor" suffix plus the date; see the network summary)
- [links] internal: /places/the-lodge/ → 0 UND_ERR_CONNECT_TIMEOUT (from /eat-drink/, /directory/)

## Since last audit
- First audit since Windsor became a flagship (22 October). The Severance fold (12 October) holds: insideseverance.com paths land on the Windsor site.

## Couldn't verify
- windsorco.gov answers Cloudflare 403 to the feed and every page (24 links), so the Town's own calendar is a confirmed source nothing can read; three core sources (Town, Chamber, library) are still proposed.
- Vecinos Mexican Grill (Severance) blocks automated reads; verify by phone.
- source registry: 2026-10-19  clearviewlibrary-org: changed — now lands on clearview.libnet.info
- 23 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): windsorco.gov (11), maxpreps.com (1), larimer.gov (1), library.municode.com (1), commons.wikimedia.org (1)
- places/vecinos-mexican-grill-and-cantina.md (severance) hours; address; phone: HTTP 403 on curl and WebFetch

## Proposed changes
- Remove `changeFlag` and `changeNote` from content/windsor/events/twilight-tour-of-lakeview-cemetery-2026-10-30.md (the Town lists both tours; the file's `timeNote: "Tours at 5:30 and 7 pm"` already says so).
- Delete content/windsor/events/twilight-tour-of-lakeview-cemetery-2026-10-23.md and -2026-10-24.md (past, flagged).
- Write content/windsor/weekly/2026-10-26.md: weekOf 2026-10-26, pick the Monster Mash Bash (Friday 30 October, 6:30–10 pm, Windsor Mill Event Center; verified against the Chamber's page today) or the Twilight Tour, changes: [].
- content/windsor/sources.json: clearviewlibrary-org `url` → https://clearview.libnet.info/ (its events at /events).
