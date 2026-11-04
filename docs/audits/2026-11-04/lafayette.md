> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): the canceled walk, the members-only meeting (deleted, and the feed excludes “Members Meeting”), the doubled rec-center update, the five public fields with build-agent notes, the holiday sale as one listing with its flag cleared, the Coal Creek Trail action, Living here’s election notes, the Paws to Read and Cricut titles, the gardens note; two local changes (Issue 2A; the 2027 budget and Flock cameras). Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Lafayette — site audit 4 November 2026

**Verdict:** Sound for a two-day-old flagship, but this weekend's home page sends readers to a canceled walk and a members-only meeting, and five public fields carry the build agent's notes to itself.

First audit. Read live 3 November; facts, changes and 235 links checked 4 November (appendix).

## Fix now
- [accuracy] **Fall mindfulness walk, Sun Nov 8** (home weekend tab, This week, Events) is canceled: the City's Engage page reads "CANCELED: Fall Mindfulness Walk". Mark it, don't delete (fixes 1).
- [accuracy] **Historical Society Annual Members Meeting, Sat Nov 7** (home weekend tab, Events highlights): its LibCal listing says it "is not open to the public" (fixes 2).
- [content] **Recreation center update, Mon Nov 9, listed twice**, with a third copy in staging (fixes 3).
- [content] **Editor's notes on public pages**: Liquid Mechanics ("did not load for this reader"), Ras Kassa's, Acreage, the Hot Wax night ("no usable start time") (fixes 4).

## Fix soon
- [content] **Friends holiday sale listed three times** (the Dec 4 listing plus feed rows for Dec 5 and 6). The validator's flag is the feed's per-day split, not a change: keep the listing, clear the flag, drop the rows (fixes 5).
- [accuracy] **Coal Creek Trail closure** holds: the Cone Zone map listed it as current on Nov 4, past the eight weeks. Re-date and say so; the county flagger note ends Nov 6 (fixes 6). Sweeping, land use code and lockbox match their sources.
- [accuracy] **Living here says the election is coming**; 2A passed 7,017 to 3,509 (fixes 7).
- [content] Feed-shaped rows: "Older Adult Learning Club - Cricut Iron-on Designs - Register", three "Paws to Read - Drop In" at "Kid Zone" (fixes 8). "33 events through January"; "January 7.." on Families (fixes 9).
- [design] The three home tiles all show the hero photograph; no place has an image.

## Since last audit
None; the 1 November network fixes hold.

## Couldn't verify
The sports strip (MaxPreps 403; sports.json read Nov 2). Acreage and William Oliver's hours (their sites print none). The City's "Nov. 2 meeting recap" (a teaser). The WebTrac youth-sports link (403 to two readers).

## Links
No 404s, 5xx or timeouts. 403s, none a gone business: 70 MaxPreps (known block), lafayettehistoricalsociety.org and williamolivers.com (load elsewhere), WebTrac, Zillow; Realtor.com 429.

## Coverage
- [coverage] **Lafayette Farmers Market**, absent: lafayettefm.com, "Sundays, May 3rd - October 25th, 9am - 1pm," Public Road between Cleveland and Geneseo.
- [coverage] **Eat & drink has 11 places**, one coffee (Golden: 24). Absent: The Post, 105 W Emma St, 303-593-2066, Mon–Fri 11:30–9, Sat–Sun 10–9 (thepostcolorado.com). Cannon Mine Coffee closed in 2023 (BizWest).
- [coverage] **Centaurus "Theater Show Week," Nov 9, 6–9 pm** (ceh.bvsd.org), unlisted and untitled.
- 27 events in 30 days; older flagships carry 90–100. For New & closed: the library closes Nov 11, The Collective Nov 9–11.

## Worth knowing
`drafts/lamont-does-park-tax-extended.md` (2A passed) and `drafts/flock-cameras-ended-2027-budget.md` (Flock cameras ending). Undrafted: the $40 million bond sale, Oct 6 (lafayette-listens.com/capital-bond).

## Decisions for James
1. **Ras Kassa's hours**: banner "open 3pm-9pm every day", take-out block 11–9. List 3–9, none (fixes 4), or call.
2. **Romero's hours**: Mon, Wed–Thu 4–"9ish", Fri 2–"10ish", Sat 12:30–"10ish", Sun 12:30–"7ish", no Tuesday. Opening times only, or leave.
3. **Drought Stage 1** is archived by the 60-day rule while the City says drought persists. Set `expires`, or leave.
4. **Holiday sale**: one three-day listing (fixes 5) or three retitled rows.
5. **Historical Society meeting**: delete (fixes 2) or keep with a "members only" line.

## Proposed changes
All in `fixes.md`: nine groups, 17 files, five deletions.

## Appendix: pages and facts
Pages (all 200, final URL as requested, 0.18–0.52 s, the 3 November build): insidelafayette.com /, /this-week/, /events/, /eat-drink/, /things-to-do/, /families/, /moving-here/, /living-here/, /guides/, /updates/, /sports/, /get-involved/, /this-weekend/, /articles/lafayette-with-kids/, /articles/explore-lafayette-in-walking-order/, /places/odd13-brewing/, /places/lafayette-public-library/, /places/waneka-lake-park/.

Checked 4 November and matching their sources: Odd13, Tangerine, Jeannot's, Tandoori Kitchen, Liquid Mechanics and Read Queen hours; rec center hours and admission; library hours; The Collective hours; WOW hours and prices (Sundays from Nov 8); History Museum hours; the cemetery plaque Nov 6 4:30–5:30; the blood drive, Wellness Crafts and Paws to Read; the WOW bash; the Centaurus showcase Nov 10; Holiday on the Plaza Dec 5 2–6 pm; Council first and third Tuesdays (next Nov 17). Sources read: lafayetteco.gov news 10228, 10279, 10240, 10277, 10272, 10281, 10295; /776/Utility-Billing; /4245/Cone-Zone; /247/City-Council; /4362/2026-Ballot-Measure; Calendar EID 12264 and 12265; LibCal DecSale2026, BloodDrives2026, WellnessAugDec2026, histsocietyboardJanDec2026, event/15600043, NovRecCtrConversation; engage.lafayetteco.gov activity ce302102; bouldercounty.gov Coal Creek Trail; electionresults.bouldercounty.gov; lafayette-listens.com/capital-bond; lafayettecolorado.com annual events and Holiday on the Plaza; ceh.bvsd.org; wowchildrensmuseum.org; odd13brewing.com/events; lafayettefm.com; thepostcolorado.com.
