> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): the 3G result leads Worth knowing; Kofe House’s Thursday dinner; nineteen re-check dates; two local changes (Step Challenge; library and rec-center holiday hours). The eight past event files stay: every one is linked from a sent Thursday email, and a past event’s page is still served. Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Berthoud — site audit 4 November 2026

Read live 9:40–10:50 pm Denver time, Tuesday 3 November (that day's 05:10 build); sources read the same evening, so `verified` here is 2026-11-03. The live site carries PR #283; the audit branch does not.

**Verdict:** Clean for a reader: every event in the next seven days, the four civic meetings and both Spartans games match the organizer's own calendar; one fix now (the 3G result never reaches the home's Worth knowing), five fix-soon items, no dead links.


## Fix now
- [content] The home's Worth knowing shows the Development Code hearing and Heron Lakes Marina, not "Ballot Issue 3G: Mountain Vista Park bonds fail on election-night returns", the week's biggest change, marked `featured`. `TownHome.astro` sorts by `published` and takes two; PR #283 rewrote the file on 3 November but kept `published: "2026-10-21"`. Set it to 2026-11-03.

## Fix soon
- [accuracy] Kofe House: kofe-house.com says "Open Thursday Nights for Italian Dinner from 5:00 PM till 8:00 PM" beside "today's" 7:30 am–2:30 pm (read 3 Nov); the hours line says "Daily 7:30 am–2:30 pm". Open since 27 October.
- [accuracy] Friday's playoff is at home and the guide doesn't say so: MaxPreps lists Pueblo South's "away playoff game @ Berthoud", Max Marr Stadium, 6 November, 7 pm (read 3 Nov). `data/berthoud/sports.json` has `site: "neutral"`, so the strip prints no venue while the volleyball row prints "Home" (vs Delta, Saturday 11 am at Berthoud High, matches). The file is generated nightly; the fix is wherever playoff games become neutral.
- [accuracy] Cornerstone Cafe: its named source (newfreedomministry.com/page/cornerstone-cafe) has address and phone but no hours (read 3 Nov), yet the file says Tue–Sat 7 am–2 pm verified against it. Re-source or call (970) 344-5139.
- [accuracy] B-Rad's Arcade is still absent from Berthoud Main Street's Dine & Drink page (`changeFlag` 26 October). Ziggi's (`changeFlag` 3 November) shows "Daily 6 am–6 pm" with no hours on its page; they hide 2 December. Decisions below.
- [accuracy] 34 listings past re-check: 17 matched tonight (fixes.md); Town Board 24 Nov and 8 Dec, Planning Commission 10 Dec and the 9 Dec book club lie past the Town feed's window (to 17 November).
- [coverage] No farmers market page: The Berthoud Market, Town Park, Saturdays 9–1, 2026 season ended 26 September (loveland.macaronikid.com 2026 markets guide; localharvest.org). A spring item.

## Since last audit
- Fixed: Kofe House hours and phone; Cribbage 11 November on City Star's calendar; the rec center anniversary links berthoud.org/1530/Upcoming-Events (Friday 20 November, 4–8 pm); Holiday Card deadline 14 November.
- Monday's flags settled at the organizer's calendar: Hoss and the Hangman 7 November 6–8:30 (City Star feed); drum circle Friday 6 November 6:45–8, "First Friday of each month" (Wildfire's Tockify); Breathwork and Reiki 8 November 10–12, $30 (Tockify item 659; breathworkwithlee.com agrees).

## Couldn't verify
- Trailhead Cafe: trailhead.cafe answers 403 to curl and WebFetch.
- Aussie's Poke Pitstop renders by script; its stored hours block reads "Monday–Saturday 09:00 am – 05:00 pm, Sunday Closed", which looks like a builder default, against the guide's Mon–Sat 11–7:30. Call (970) 344-5215 first.
- larimer.gov answers 403; kofe-house.com and berthoudpetsupply.com time out to curl but read through WebFetch.

## Decisions for James
- B-Rad's: re-source to its own page, mark closed, or delete.
- Ziggi's: keep the hours to 2 December, or hide now and call (303) 802-4663.
- Local changes: two real items are drafted; the Step Challenge (free, 15 November–15 December, registration open) is the stronger. Engage Berthoud's Holiday Lights page dates voting "through Tuesday, December 20th", a 2022 weekday, so it was not drafted.

## Proposed changes
1. `content/berthoud/updates/ballot-issue-3g-mountain-vista-park.md` (as on main after PR #283): `published: "2026-10-21"` → `published: "2026-11-03"`.
2. `content/berthoud/places/kofe-house.md`: `hours: "Daily 7:30–2:30"` → `hours: "Daily 7:30 am–2:30 pm; Thu also 5–8 pm"` (the site shows only "today's" daytime hours plus the Thursday line; "Daily" rests on the 3 November read).
3. `verified` → `"2026-11-03"` on the 17 files in fixes.md, each matched tonight against the source it names.
4. Delete the 8 past event files the weekly report lists; 42 listings still lack a photograph.
5. `data/berthoud/sports.json` is generated; the playoff-site mapping is a code question, not a content edit.
