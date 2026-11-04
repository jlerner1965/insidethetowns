> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): the three full library classes, Planning and Zoning on 18 November, Wing Shack’s hours field, Cassidy’s summary, the Lazy Dog typo, three categories, fifteen re-check dates; two local changes (Weld County Road 46; the Town’s statement on Councilmember Berg, a decision below on how long it runs). Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Johnstown — site audit 4 November 2026

Read live on the evening of 3 November 2026 (Denver); every page in the brief, `/sports/` and `/about/` answered 200.

**Verdict:** Fair: the home tiles, Eat & drink and the week's rows match their sources, but three library classes this week are full and the listings say nothing, Planning and Zoning is on the wrong Wednesday, and two real local changes were waiting on the Town's site.

## Fix now
- [accuracy] Apple Cinnamon Breakfast Jars (Fri 6 Nov), Paint 'n Sip (Fri 6 Nov) and Creative Journaling (Sat 7 Nov) show "Free" and no registration; the library's pages say "Registration limit has been reached", 0 of 12, 0 of 14 and 0 of 10 places, waiting list only (johnstownmillikenpubliclibraries.us/event/…, 3 Nov). Paint 'n Sip was flagged 27 October.
- [accuracy] `events/planning-zoning-2026-11-25.md`: the Town's calendar feed has the Commission on Wednesday 18 November, 6–7 pm, 11 November canceled and nothing on the 25th (johnstownco.gov iCalendar, Commission Meetings, 3 Nov).
- [content] Two local changes drafted from johnstownco.gov: Weld County Road 46 closed from Galloway Drive to Telep Avenue, 28 October to the end of May 2027 (Cone Zone, week of 26 Oct); the Town's 31 October statement on the death of Councilmember Damien Berg (News Flash, posted 2 Nov). Worth knowing has only the hospital closure.

## Fix soon
- [content] Editor's notes in public fields: Wing Shack's hours field, "as the restaurant's page gives it (no days named)"; Cassidy's summary, "Call to check the hours; see the note below", on the list page.
- [content] Orchids 101 (12 Nov), Thanksgiving Feast (17 Nov) and Pancakes in a Jar (5 Dec) are tagged Outdoors: a plant talk and two cooking classes. Thanksgiving Feast takes registration; Pancakes' opens 21 November.
- [content] Families says the storytimes run through 30 and 19 November; Events says 7 and 17 December (`programs/library-storytimes.md` vs the event files).
- [content] "its's" in `places/lazy-dog-johnstown.md`.
- [accuracy] Dominic's and Scheels, last read 18 September, lose their hours on 17 November unless someone calls; both sites answer 403.
- [links] `src/config/towns/johnstown.ts` still carries the old Weld RE-5J calendar URL; it redirects and answers, and the PDF confirms the November days off.
- [coverage] No bar and no lodging (siblings: 1–6 bars, 0–4 lodgings). Confirmed on their own pages: Parry's Pizzeria & Taphouse, 4874 Thompson Pkwy, 100 draft beers (parryspizza.com/locations/johnstown/); Wingate by Wyndham Loveland, 5360 Ronald Reagan Blvd, Johnstown 80534 (wyndhamhotels.com). The Senior Center's Christmas Boutique, Sat 5 Dec, is on the Town's calendar, not the guide (johnstownco.gov/319). No trail or farmers market on any primary source.

## Since last audit
- Fixed: the 404 Thanksgiving Place Cards listing is gone; the calendar runs to 22 January (80 days); Election Day, the Holiday Open House and Herman's Hermits added.
- Still open: Paint 'n Sip's waiting list; 24 places without a photograph; 29 past event files (was 22); no bar, trail or lodging; 18 listings past their 30-day re-check, 13 read tonight and matched (fixes.md §7).

## Couldn't verify
- Lazy Dog, Dominic's (Toast) and Scheels answer 403, Cassidy's Instagram 429.
- Holiday Inn's prices: its own page dropped every connection; the shows page's "current mainstage prices" and both run dates match the listing.
- Monday's flags: the 2 November council meeting is past and the Town's feeds carry only upcoming items; the Breeze's recall and Johnstown Center Drive items are on neither its home page, Cone Zone nor the Town's elections page.
- Blocked to the crawler, not dead: johnstownpolice.org, weld.gov, larimer.gov, weld4h.org, zillow, realtor.com, most MaxPreps links. No 404s in 243 external links.

## Proposed changes
Exact old → new text is in `fixes.md` (§1 the Planning and Zoning move, §2 the three full classes, §3–6 the hedges, typo and categories, §7 thirteen verified-date updates); the two update files are in `drafts/`. In short:
- `events/planning-zoning-2026-11-25.md` → rename to `planning-zoning-2026-11-18.md`; `start: "2026-11-18T18:00"`, `end: "2026-11-18T19:00"`, drop `recurring`, body per fixes.md.
- `events/apple-cinnamon-breakfast-jars-2026-11-06.md`, `paint-n-sip-2026-11-06.md`, `creative-journaling-2026-11-07.md`: `cost: "Free"` → `cost: "Free; full, with a waiting list"` (Paint 'n Sip adds "; 21 and over"); body adds "Registration is required and the class is full; the library's page takes a waiting list."
- `places/wing-shack-johnstown.md`: `hours: "11 am–10 pm"`.
- `places/cassidys-sports-grill.md`: summary ends at "open until midnight on weekends."
- `places/lazy-dog-johnstown.md`: "its's" → "its".
- `events/orchids-101-2026-11-12.md`: `category: other`; `thanksgiving-feast-2026-11-17.md` and `pancakes-in-a-jar-2026-12-05.md`: `category: food`, with the registration lines in fixes.md.
- `updates/weld-county-road-46-closed-galloway-to-telep.md` and `updates/councilmember-damien-berg-dies.md` from `drafts/`.

## Decisions for James
- The Berg notice is a civic notice from the Town, not an opening, closure or decision. Run it in Worth knowing as drafted (kind `notice`, 60 days), run it for 30 (`expires: "2026-12-04"`), or keep it to the week's notes. The Town says nothing about filling the seat; the draft says nothing either.
- Cassidy's body paragraph explains that its hours date from 18 September and asks readers to call. Keep it, dated and transparent, or drop the hours so the page shows "Check current hours".
- Bars: retype Cassidy's and the Lazy Dog as `bar` (both carry sports-bar tags), or add Parry's as the first.
- Herman's Hermits runs 22–24 January with no times (Candlelight's shows page confirms the dates). One listing as now, or three once the curtain times are posted.
