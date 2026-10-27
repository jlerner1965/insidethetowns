# Inside Carbon Valley — site audit 27 October 2026

**Verdict:** Fair: accurate where checked (8 of 11 facts matched, 0 wrong) and the notes current, but the calendar runs out on 8 December (42 days), 13 staged items wait, 45 of 47 listings have no photograph, and the guide is parks-heavy (18) and thin on places to eat (8) and drink (1 bar, 1 coffee).

**Numbers:** 25 upcoming events (18 in 30 days, 25 in 60, 25 in 90 — runs to 2026-12-08 (42 days)  ⚠ under 45 days of runway); 47 listings, 45 without a photo; staging: 5 events, 8 places; home page 200 in 205 ms, average 90 ms over 90 pages; sitemap 109 URLs; calendar feed 25 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 8 match, 0 mismatch, 3 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- Nothing that is wrong for a reader today.

## Fix soon
- [content] Calendar runway 42 days (ends 8 December): the four Town feeds and the two library feeds carry December; the failed Monday ingest (26 October) held this week's items back, so run it by hand once the fix is merged.
- [content] 5 staged events and 8 staged places waiting; the Fort Lupton library's Thanksgiving closure (the LibCal item that broke the Monday ingest) is now read as a one-day all-day item.
- [coverage] 1 bar, 1 coffee, 2 shops across four towns; Frederick's and Firestone's main streets have more of each.
- [accuracy] Colorado National Speedway's page lists a Halloween race outside its April–September season line; check the date before the listing says the season is over.
- [content] 45 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 20 past events still in content/carbon-valley/events/ (hidden on the site; delete or add the next dates)
- [design] 25/69 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Carbon Valley" suffix plus the date; see the network summary)

## Since last audit
- The Fort Lupton fold (12 October) holds: insidefortlupton.com and insidefirestone.com land on carbonvalleyguide.com. The three Día de los Muertos duplicates were made one on 26 October.

## Couldn't verify
- The Fort Lupton Chamber (Trick-or-Treat Street, 31 October) answers Cloudflare 403; Clem Dufour Park's address and the Frederick Recreation Area's phone are not on the Towns' pages.
- 8 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (4), maxpreps.com (3), business.fortluptonchamber.org (1)
- places/clem-dufour-park.md address: address not on page
- places/frederick-recreation-area.md phone: phone not on page
- events/trick-or-treat-street-2026-10-31.md start; end; venue: blocked (Cloudflare 403)

## Proposed changes
- Delete the 20 past event files the weekly report lists.
