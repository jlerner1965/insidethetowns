> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): the Redfin link, youth volleyball, youth soccer, the veterans luncheon, the marketplace Saturdays, the walking article’s donut hours, Catrina’s date, Living here’s election note; two local changes (the trustee count; Thanksgiving day camp), the guide’s first. The library programs under Proposed changes item 10 were not added: the library’s own calendar has to be read by hand. Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Elizabeth — site audit 4 November 2026

**Verdict:** Accurate where a machine can read it (18 of 20 facts match their primary source), but thin and stalling: the Town's site blocks every automated read, so its ten civic listings are hand-check only; the library's monthly programs stop at October on the guide; Worth knowing has never had an item (two drafts attached); and the Redfin link on Moving here lands in Iowa. Keepable, at the cost of a monthly hand pass no other flagship needs.

**Numbers:** 25 upcoming events, 24 listings, 14 past re-check; 34 pages fetched, all 200 but three 404s by design; 225 external links tested, none dead, one wrong (Redfin), bot blocks at maxpreps, zillow and realtor (3 November, Denver evening).

## Fix now
- [links] Moving here: the Redfin link (city/5866) redirects to Duncombe, Iowa; Elizabeth is city/6117 (3 Nov).
- [accuracy] Youth volleyball: the district's page has three divisions (6–8, 8–10, 11–13) and games "at EMS or Legacy"; the guide says two and "EMS or Frontier" (3 Nov).
- [content] Living here: "A ballot drop box … until 7 pm November 3" is past from the 4 November build.
- [content] Youth soccer: "a player clinic … is on Saturday, October 24" reads as upcoming.
- [accuracy] Small Town Mini Donuts: the walking article ("from 6 am most days, closed Thursdays") and the listing (Mon–Fri 7–noon and 3–5, Sat–Sun 8–noon) disagree, and the shop's site shows both sets (3 Nov). One answer, after a call.
- [content] Veterans luncheon: the organizer's page gives 11:30–2 and the RSVP link; the listing has neither. The 27 Oct proposal was never applied.

## Fix soon
- [coverage] Library monthly programs after October are missing (dates under Proposed changes); the library's calendar is the primary and its robots.txt disallows AI agents: a hand read.
- [coverage] Confirmed and missing: Winter Stargazing, Sat Nov 14, 6–8 pm (csastro.org); Pines & Plains board meeting, Tue Nov 24, 4 pm (pplibraries.org); the brewery's trivia Tuesdays 7 pm and Tiny Tap Wednesdays 6 pm (brewelizabeth.com).
- [content] Elbert County Marketplace: six files say "Alternate Saturdays"; November is every Saturday (marketspread.com, 3 Nov).
- [accuracy] The Carriage Shoppes' site adds winter hours (Mondays closed, Tue–Sat 10–5, Sun 11–4) with no start date; the guide lists the regular hours. A call.
- [accuracy] 14 past re-check: 10 Town meetings, Story Time ×2 and Yarning, Catrina's.
- [coverage] "Trails 1" on Things to do is a disc-golf course; the Running Creek trail and the Casey Jones loop have no listing.
- [content] Home "Next in Elizabeth" on a Tuesday night: the pick, Joy Seekers Nov 6, Joy Seekers Dec 4; Saturday's market skipped (home-tabs.ts ranks an arts one-off above a series). Chassis.

## Since last audit
- Closed: the 27 Oct fix-now (19 stale) by the 30 Oct rotation.
- Still open: the brewery's "Open today 12–10" widget; 3 staged places; the three GoDaddy sites answer a browser-style fetch with matching hours, so not gone; 1 trail.

## Couldn't verify
- townofelizabeth.org, 403 to curl and WebFetch: Board of Trustees Nov 10 and 24, Planning Commission Nov 17 (and the Nov 3 "canceled", set 30 Oct), Mayor's Tree Lighting Dec 5, Town Hall hours, Monday's note of a Board meeting Wed Nov 18.
- The Nest's hours (Facebook); the fire ban (Town and fire district sites 403); CR 166 construction (county news, 19 Oct, about 60 days, one lane at a bridge between CR 13 and CR 21): the notice does not place the bridge, so not drafted.

## Decisions for James
1. Keep or drop: towns.json says by 15 November, the town config (30 Oct) says 30 November.
2. Mini Donuts, which hours (720-420-0838); the Carriage Shoppes, regular or winter ((303) 646-4672).
3. Publish The Coffee House on Main Street from the Main Street directory (341 S Main St, 303-621-0118, hours unknown), as the Nest is, or keep it staged.
4. Worth knowing: the trustee count is unofficial, four votes between fourth and fifth. Publish with the time of the count (drafted) or wait for certification.

## Proposed changes
Exact old → new text is in fixes.md; in reader-impact order:

1. `src/config/towns/elizabeth.ts`, movingHere.listingsLinks: `https://www.redfin.com/city/5866/CO/Elizabeth` → `https://www.redfin.com/city/6117/CO/Elizabeth`.
2. `src/config/towns/elizabeth.ts`, livingHere "Meetings and elections" note → "Elbert County runs the town's elections by mail ballot; its Elections page lists the drop boxes and voter service centers for each one. Elections office: 440 Comanche Street, Kiowa, 303-621-3127, Monday to Thursday 7:30 am–5 pm." Section `verified` → "2026-11-03".
3. `content/elizabeth/programs/youth-volleyball.md`: three divisions, games at EMS or Legacy; `verified: "2026-11-03"`.
4. `content/elizabeth/programs/youth-soccer.md`: drop the October 24 clinic from summary and body; `verified: "2026-11-03"`.
5. `content/elizabeth/events/veterans-appreciation-luncheon-2026.md`: `end: "2026-11-06T14:00"`; `url` → the event's own page; body names the RSVP link.
6. `content/elizabeth/events/elbert-county-marketplace-2026-11-07.md` and the 11-14, 11-21, 11-28, 12-05, 12-19 files: `recurring` → "Every other Saturday, April to December, and every Saturday in November".
7. `content/elizabeth/articles/explore-elizabeth-in-walking-order.md`: the donut clause → the listing's hours (pending decision 2).
8. `content/elizabeth/places/catrinas-latin-food.md`: `verified: "2026-11-03"`.
9. New updates from drafts/: `trustee-election-unofficial-results-2026.md`, `thanksgiving-break-day-camp-registration.md`.
10. New events after a hand read of the library's calendar (dates as the Main Street calendar shows them, elizabethmainstreet.org/calendar/?page=2 to 5, 3 Nov; all at 651 Beverly St): Free Virtual Legal Clinic Wed Nov 4 and Dec 2, 2 pm; Community Coffee & Chat Tue Nov 10 and Dec 8, 10 am; Piecemakers quilting Fri Nov 13 and Dec 11, 2 pm; Book Club Mon Nov 16 11:30, Tue Nov 17 11:30 and 5:30/6, Tue Dec 15 11:30 and 5:30/6, Mon Dec 21 11:30; Just a Note paper arts Tue Nov 17, Dec 1 and Dec 15, 10 am; LEGO Construction Masters Tue Dec 1, 4 pm; Curiosity Club Thu Nov 26 and Dec 24, 4:30 pm (both holiday dates: confirm before listing). Plus Winter Stargazing Sat Nov 14 6–8 pm (source csastro.org, the organizer's page) and the Pines & Plains board meeting Tue Nov 24 4 pm (source pplibraries.org).
