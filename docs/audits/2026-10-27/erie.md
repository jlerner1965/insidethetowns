# Inside Erie — site audit 27 October 2026

**Verdict:** Good: 92 upcoming events and the week's notes current; one Town-calendar source link now needs a login, one planning-commission flag is for a past date, and 24 listings or series are past the 30-day re-check.

**Numbers:** 92 upcoming events (71 in 30 days, 113 in 60, 116 in 90 — runs to 2026-12-29 (63 days)); 37 listings, 18 without a photo; 24 not re-checked in 30+ days; staging: 4 events, 0 places; home page 200 in 467 ms, average 84 ms over 90 pages; sitemap 135 URLs; calendar feed 112 events; events page refreshed October 27, 2026.

**Accuracy spot-check (7 listings and up to 3 events, against the business's or organizer's own page, 27 October 2026):** 22 match, 2 mismatch, 4 couldn't verify. Full table: the audit's working file, summarised below.

## Fix now
- [accuracy] Birdhouse (birdhouse.md) says closed Monday; its own site says closed Tuesday and open Monday 4–9 pm. Wrong for a reader today.
- [links] content/erie/events/town-council-study-session-2026-11-03.md: its source (erieco.gov Calendar.aspx?EID=5435) now lands on a CivicPlus login page and the Town's calendar feed no longer lists a study session on 3 November (Election Day). Confirm with the Town or mark it canceled before the week's email.
- [accuracy] 2 listings wrong against the business's own page: birdhouse.md, piripi.md (replacement text under Proposed changes)

## Fix soon
- [accuracy] Piripi (piripi.md) changes its hours on 1 November (Mon–Thu 11 am–8 pm, Fri–Sat 11 am–9 pm, Sun 4–8 pm); the current line is right only through 31 October. Change it on Sunday, or now with an `effective` note.
- [links] Two more Town-calendar links (EID=5471 Safety Series 7 October, EID=5480 Coffee with a Cop 7 October) are past dates behind the same login page: delete those files.
- [links] Urban Renewal Authority: the 27 October file's link is the same login page; the Town's feed lists the next meeting on 10 November as EID=5453. Add that occurrence with the new link and let the 27 October file expire.
- [accuracy] 24 listings or series not re-checked in 30+ days, the most on any guide; the oldest are the Town's recurring meetings checked 18 September.
- [links] www.erieco.gov/2271/Parks reset the connection from /living-here/; xcelenergy.com → my.xcelenergy.com in src/config/towns/erie.ts:116.
- [content] 18 listings without a photograph (docs/PHOTO-CONTACTS.csv has the asks)
- [content] 58 past events still in content/erie/events/ (hidden on the site; delete or add the next dates)
- [design] /directory/: description 166 chars (over 160; a chassis fix on the directory page)
- [design] 6/75 pages have a <title> over 70 characters (search results cut at about 60) (a chassis fix: the " | Inside Erie" suffix plus the date; see the network summary)

## Since last audit
- Fixed since 2 October: the two-county note, the Briggs and Maxwell updates, Cristos Coffee and Bridge Refill Market (26 October audit).
- Still open: the planning-commission flag (21 October, past) and the 18 September meeting series.

## Couldn't verify
- The Old Mine and the Erie Chamber (members.eriechamber.org) are core sources still proposed (12 events between them).
- 7 outbound links answered 403 or 429 to the crawler (bot challenges, not dead pages): commons.wikimedia.org (5), maxpreps.com (1), census.gov (1)
- places/cellar-west-brewery.md phone / address: not stated
- places/echo-brewing.md phone / address: not stated
- events/bluegrass-jam-old-mine-2026-11-12.md cost: cost not stated
- events/eerie-erie-5k-and-10k-2026-10-31.md cost: fee not stated

## Proposed changes
- Dismiss the past flag: remove `changeFlag`/`changeNote` from content/erie/events/planning-commission-2026-10-21.md, or delete the file (the Town lists the next Planning Commission on 4 November).
- Delete the 58 past event files the weekly report lists for Erie, including safety-series-2026-10-07.md and coffee-with-a-cop-2026-10-07.md.
- content/erie/places/piripi.md — `hours: "Mon–Thu 11 am–8 pm, Fri–Sat 11 am–9 pm, Sun 4–8 pm"` (effective 2026-11-01; the current Mon–Sat 11–9, Sun 4–9 is correct only through 2026-10-31).
- content/erie/places/birdhouse.md — `hours: "Mon & Wed–Thu 4–9 pm, Fri–Sat 11:30 am–9:30 pm, Sun 11:30 am–8:30 pm; closed Tue"`
