# Inside Clear Creek — site audit 27 October 2026

**Verdict:** Good for a three-town guide a week old: 12 of 15 facts matched, one phone number wrong (the Argo Mill); 35 staged items wait (30 places since 10 October, the longest queue in the network), nine access notes go stale in 13 days, and Black Hawk's City site blocks every read.

**Numbers:** 29 upcoming events (16 in 30 days, 28 in 60, 30 in 90 — runs to 2027-01-21 (86 days)); 67 listings, 53 without a photo; staging: 5 events, 30 places; home page 200 in 317 ms, average 78 ms over 90 pages; sitemap 130 URLs; calendar feed 32 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 12 match, 1 mismatch, 2 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] 1 listing wrong against the business's own page: argo-mill-and-tunnel.md (replacement text under Proposed changes)

## Fix soon
- [content] 30 staged places since 10 October: at the editor's ten a week this queue alone is three weeks. Two of them (Copper Kitchen Pizzeria, Golden Rose Antiques) cite City of Black Hawk pages that are 404s and a Black Hawk district site that answers nothing.
- [accuracy] Nine access notes (Bierstadt and Guanella Pass, Georgetown Lake, Golden Gate Canyon, Maryland Mountain, Mount Blue Sky byway and summit, Silver Dollar Lake, Virginia Canyon) go stale in 13 days.
- [links] The Georgetown master-plan PDF on townofgeorgetown.us now serves from cms7files.revize.com (explore-georgetown-in-driving-order.md line 21, city-park.md line 16): relink.
- [content] 53 of 67 listings without a photograph, the most in the network; 25 listings have no hours line.
- [design] 27 of 72 crawled pages have titles over 70 characters (the three-town name makes the suffix long).
- [links] staged item cites a dead page: https://www.cityofblackhawk.org/city-manager/page/city-black-hawk-welcomes-bruce-boynton-owner-pick-axe-pizza-copper-kitchen — content/idaho-springs/staging/places/copper-kitchen-pizzeria.md
- [links] staged item cites a dead page: https://www.cityofblackhawk.org/media/10731 — content/idaho-springs/staging/places/copper-kitchen-pizzeria.md
- [links] staged item cites a dead page: https://www.cityofblackhawk.org/media/9436 — content/idaho-springs/staging/places/copper-kitchen-pizzeria.md, content/idaho-springs/staging/places/golden-rose-antiques-and-collectibles.md
- [content] 53 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 14 past events still in content/idaho-springs/events/ (hidden on the site; delete or add the next dates)
- [design] 28/72 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Clear Creek" suffix plus the date; see the network summary)

## Since last audit
- First audit since Georgetown and Black Hawk joined the guide (20 October); insidegeorgetownco.com and insideblackhawk.com land on the Clear Creek site on every path probed.

## Couldn't verify
- cityofblackhawk.org (Cloudflare 403 since 11 October), idahospringsco.com (403 on every page), ameristarblackhawk.com (Cloudflare): the City of Idaho Springs, the City of Black Hawk and the casino's restaurants cannot be read by a machine.
- Indian Hot Springs' pool page is JavaScript-only.
- source registry: 2026-10-11  cityofblackhawk-org: blocked — Cloudflare answered 403 to the feed and the calendar page on 11 October 2026. The content handoff of the same day reported reading this feed; confirm it once it answers.
- 18 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (7), idahospringsco.com (4), ameristarblackhawk.com (4)
- places/indian-hot-springs.md hours, address, phone: JS-only page
- places/timberline-grill.md hours, phone: Cloudflare block

## Proposed changes
- content/idaho-springs/places/argo-mill-and-tunnel.md: `phone: "983-955-8866"`
