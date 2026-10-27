# Inside Nederland — site audit 27 October 2026

**Verdict:** Quiet since 20 October and under its launch threshold (8 of 10 upcoming events); two restaurants' hours are wrong on the guide (Busey Brews closes at 5 pm Monday to Wednesday, Crosscut at 8 pm), three listings' own sites answer nothing, and the Mining Museum's season ends in 5 days.

**Numbers:** 8 upcoming events; 26 listings; home page 200 in 58 ms, average 67 ms over 87 pages; sitemap 60 URLs; calendar feed 9 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 16 match, 2 mismatch, 1 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] 3 listings wrong against the business's own page: brainard-lake-recreation-area.md, busey-brews.md, crosscut-pizzeria-and-taphouse.md (replacement text under Proposed changes)

## Fix soon
- [accuracy] Nederland Mining Museum closes for the season on 31 October (the file says so); Brainard Lake, NedRink, Hessie and West Magnolia access notes go stale in 9–13 days.
- [accuracy] The Brainard Lake file still carries the 2–16 October road-closure sentence; drop it.
- [content] 14 staged items waiting (3 events, 11 places since 10 October). 3 library event files cite nederland.colibraries.org pages that are now 404s (all past dates: delete the files).
- [coverage] No coffee listing; Nederland has three cafés on First Street.
- [design] 15/66 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Nederland" suffix plus the date; see the network summary)

## Since last audit
- Quiet since 20 October.

## Couldn't verify
- nedgeneral.com, mountainpeakcafe.com and naturesown.com answered nothing (Ned General, Mountain Peak Cafe, Nature's Own); tinshedsports.com answered 503. A silent site is not a closed shop: check in a browser or by phone before the listings' checks run out.
- nederlandchamber.org answers a Cloudflare challenge.
- no response from https://mountainpeakcafe.com/ (DNS, TLS or timeout; the listing's own site may be down) — content/nederland/places/mountain-peak-cafe.md
- no response from https://naturesown.com/ (DNS, TLS or timeout; the listing's own site may be down) — content/nederland/places/natures-own.md
- 5 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (3), en.wikipedia.org (1), nederlandareahistoricalsociety.org (1)
- places/brainard-lake-recreation-area.md access.closures (Oct 2–16, 2026 road closure): only on Recreation.gov (not fetched); the window has passed, so the sentence is stale

## Decisions for James
- Keep Nederland past 19 November, or let it go.

## Proposed changes
- content/nederland/places/brainard-lake-recreation-area.md: drop the `access.closures` sentence about the 2–16 October 2026 closure; keep 'The main gate closes in mid-October; motor vehicles are prohibited November 15 to April 30'.
- Delete content/nederland/events/dia-de-los-muertos-2026-10-21.md, nevermore-library-murder-mystery-2026-10-10.md and winnie-the-pooh-birthday-party-2026-10-16.md (past; their library pages are 404s).
- content/nederland/places/busey-brews.md: `hours: "Mon–Wed 11 am–5 pm; Thu–Fri 11 am–8 pm; Sat 10:30 am–8 pm; Sun 10:30 am–7 pm"`
- content/nederland/places/crosscut-pizzeria-and-taphouse.md: `hours: "Mon, Wed–Thu 3–8 pm; Fri–Sat 11:30 am–9 pm; Sun 11:30 am–8 pm; closed Tue"`
- (editorial, not a mismatch) content/nederland/places/brainard-lake-recreation-area.md: the `access.closures` sentence about the October 2–16, 2026 road closure is past; drop it and keep "The main gate closes in mid-October; motor vehicles are prohibited November 15 to April 30".
