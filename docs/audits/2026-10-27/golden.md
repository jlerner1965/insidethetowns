# Inside Golden — site audit 27 October 2026

**Verdict:** Needs attention: under its launch threshold (13 of 20 upcoming events), the Monster Mash on Saturday is listed an hour late (3 pm; every source now says 2–4 pm), Foothills Art Center is temporarily closed until 20 November but listed with regular hours, ten park access notes go stale in 9 days, and the history article links a museum page that is now a 404 (eight times).

**Numbers:** 13 upcoming events (10 in 30 days, 13 in 60, 13 in 90 — runs to 2026-12-19 (53 days)); 31 listings, 14 without a photo; staging: 0 events, 13 places; home page 200 in 318 ms, average 77 ms over 90 pages; sitemap 70 URLs; calendar feed 13 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 9 match, 2 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] 2 listings wrong against the business's own page: monster-mash-2026-10-31.md, foothills-art-center.md (replacement text under Proposed changes)
- [links] 404 https://www.goldenhistory.org/learn-do/walkingtour/ — in content/golden/articles/golden-history.md

## Fix soon
- [content] Under threshold: 13 upcoming events against 20; Visit Golden blocks automated reads and the Buffalo Rose's site answers nothing, so the two biggest calendars are hand work.
- [accuracy] Ten park and trailhead access notes (Clear Creek Whitewater Park, Lions Park, Lookout Mountain, North and South Table Mountain, White Ranch, Windy Saddle, Mount Galbraith, Vanover) go stale in 9 days: one pass over Jeffco's alerts page covers them.
- [links] goldenhistory.org/learn-do/walkingtour/ is a 404 and the history article cites it eight times (content/golden/articles/golden-history.md lines 12, 45, 51, 53, 59, 61, 69, 83); the museum's site has no walking-tour page the crawler could find. Relink to the museum's history pages or drop the citations.
- [content] 13 staged places waiting since 10 October; Windy Saddle Cafe (staged) and the Buffalo Rose have no answering site.
- [coverage] 4 restaurants, 1 coffee, 1 shop for a town of Golden's size; the Washington Avenue blocks have dozens.
- [content] 14 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 12 past events still in content/golden/events/ (hidden on the site; delete or add the next dates)
- [design] 8/69 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Golden" suffix plus the date; see the network summary)

## Since last audit
- First audit as a visitor guide (20 October); Golden is one of the three photo-priority flagships (docs/PHOTO-PRIORITIES.md) and 14 listings still have no photograph.

## Couldn't verify
- visitgolden.com (Cloudflare) and buffalorose.net (no response) are confirmed sources that cannot be read.
- Centennial Cone Park hours and the Mines mineral ID day are not on their pages (client-rendered).
- source registry: 2026-10-19  visitgolden-com: blocked — Cloudflare bot challenge
- source registry: 2026-10-19  buffalorose-net: unreachable — no response — DNS, TLS or timeout
- no response from https://goldenbeerchilicookoff.org/ (DNS, TLS or timeout; the listing's own site may be down) — content/golden/events/golden-beverage-tasting-and-chili-cook-off-2026-10-17.md
- 14 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (13), parkgoldenco.com (1)
- places/centennial-cone-park.md hours: not on page
- events/mineral-id-day-2026-11-07.md start; end; venue; cost: JS-only page

## Proposed changes
- Dismiss the past flag on content/golden/events/yoga-with-a-ranger-2026-10-24.md (delete the file; Jeffco lists the next session on 21 November).
- `content/golden/places/foothills-art-center.md`: `hours: "Temporarily closed; reopens Nov 20 for the 51st Holiday Art Market (Nov 19–Dec 29). Classes and events continue as scheduled"` (the page states no regular hours; restore the Mon–Sat 10 am–5 pm; Sun 12–5 pm line only once the site shows it again).
- `content/golden/events/monster-mash-2026-10-31.md`: `start: "2026-10-31T14:00"`, `end: "2026-10-31T16:00"`, remove `timeNote` (all three sources now agree on 2–4 pm), remove `changeFlag`/`changeNote`.
