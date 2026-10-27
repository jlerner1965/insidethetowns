# Inside Estes Park — site audit 27 October 2026

**Verdict:** Good: the season turns on 1 November and the files already say so (Aerial Tramway, Twin Owls, the Art Center); 9 of 11 facts matched, 0 wrong; 31 staged items wait (23 places since 6–10 October) and the Town, the recreation district and the YMCA refuse automated reads.

**Numbers:** 26 upcoming events (13 in 30 days, 19 in 60, 21 in 90 — runs to 2027-04-24 (179 days)); 49 listings, 34 without a photo; staging: 8 events, 23 places; home page 200 in 68 ms, average 75 ms over 90 pages; sitemap 99 URLs; calendar feed 26 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 9 match, 0 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] Estes Park Aerial Tramway closes for the season on 1 November (6 days): the file's seasonal block says so; confirm the row reads 'Closed for the season' from 2 November after the rebuild.
- [links] 404 https://www.stanleyhotel.com/dining/the-whiskey-vault/ — in content/estes-park/places/whiskey-vault-stanley-hotel.md

## Fix soon
- [accuracy] Longs Peak Trailhead and Rocky Mountain National Park access notes go stale in 9 days (the 30-day window for access): re-read the park's conditions pages.
- [content] 23 staged places waiting since 6–10 October: the longest place queue after Clear Creek. Hunter's Chophouse (staged) has no answering site.
- [accuracy] DeVotchKa's Halloween Costume Ball (30 and 31 October) is sold out on the Stanley's ticket page; say so on both files.
- [content] 34 of 49 listings without a photograph.
- [content] 34 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 6 past events still in content/estes-park/events/ (hidden on the site; delete or add the next dates)
- [accuracy] season turning: 2026-11-02  Estes Park Aerial Tramway: closes in 6d  —  content/estes-park/places/estes-park-aerial-tramway.md
- [design] 23/70 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Estes Park" suffix plus the date; see the network summary)

## Since last audit
- First audit as a visitor guide (20 October); the 20 October mountain re-check covered 34 listings and the RMNP trailheads.

## Couldn't verify
- estespark.colorado.gov, evrpd.com, larimer.gov (Hermit Park) and ymcarockies.org refuse automated reads: four confirmed sources, including the Town, are confirmed only by hand.
- The Stanley's Whiskey Vault page is a 404 (whiskey-vault-stanley-hotel.md): the bar may have been renamed; check the hotel's dining page before changing the listing.
- source registry: 2026-10-19  estespark-colorado-gov: blocked — refused an automated request
- source registry: 2026-10-19  evrpd-com: blocked — unexpected status
- source registry: 2026-10-19  larimer-gov-hermit-park: blocked — Cloudflare bot challenge
- source registry: 2026-10-19  ymcarockies-org: blocked — refused an automated request
- 7 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (6), larimer.gov (1)
- places/rocky-mountain-national-park.md phone; access.closures (Old Fall River Road): not on fetched pages
- events/wellness-fair-2026-11-07.md start; end; venue; cost: JS-only/blocked

## Proposed changes
- content/estes-park/events/devotchka-costume-ball-2026-10-30.md and -10-31.md: `cost: "$74.50 standing general admission; 21 and over; sold out"`.
- content/estes-park/places/whiskey-vault-stanley-hotel.md: its `url`/`source` (stanleyhotel.com/dining/the-whiskey-vault/) is a 404; relink to the hotel's current dining page or hold the listing.
