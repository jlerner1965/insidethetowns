> Applied on branch `claude/flagship-audit-2026-11-04` (4 November 2026): the four /updates/ links, the Festival of Lights start, the tax item’s interim wording, the December D&D time, the market application, the babysitting ages, the Thanksgiving tally, the Toastmasters scheme, two past files; two local changes (the 2027 budget hearings; Colorado Boulevard in Dacono). The Board-meeting wording is a decision below. Everything else under Proposed changes below is as the audit proposed; the Decisions for James are open.

# Inside Frederick — site audit 4 November 2026

Read live the evening of 3 November, Denver (build 15:21); first audit; 21 pages, all 200; 290 external links.

**Verdict:** Accurate where it counts (23 of 26 facts matched) but five reader-facing errors: four dead links to update pages, the Festival of Lights from midnight, a ballot item still saying vote, a wrong December D&D time, and a 404 market application with a date the Town never gave.

## Fix now
- [links] `/updates/<slug>/` 404s (chassis form: `/updates/#slug`): pages/moving-here.md, articles/frederick-with-kids.md, programs/carbon-valley-help-center-volunteers.md, programs/neighborhood-watch-and-police-programs.md.
- [accuracy] events/festival-of-lights-2026-12-05.md: bare-date `start`, so /events/ prints "12 am to 8 pm"; the Town says 5:30 to 8.
- [accuracy] updates/transportation-sales-tax-on-the-november-ballot.md still says return your ballot by 7 pm November 3 and shows to 31 December; interim text in fixes.md; result: Decisions 1.
- [accuracy] events/teen-dungeons-and-dragons-2026-12-01.md: body says 3:45 to 6:45; the library and the file's own `end` say 7:15; `source` is the November page.
- [accuracy][links] programs/frederick-market-vendors.md: a 404 application link, and "2027 applications open January 1" (shown on /families/) is on no Town page; the Town says "Check back in January".

## Fix soon
- [accuracy] "First and third Wednesdays at 7 pm" is the Town page's line; its calendar and CivicClerk show regular sessions on first Wednesdays only. Decisions 2.
- [content] The holiday-help update's Thanksgiving tally (November 2) had moved on every line by the 3rd; drop it.
- [content] Fall Babysitting Class says "no age range"; the class page says 12 to 17.
- [links] Toastmasters URL: http 503, https 200. [content] Delete Frights on Fifth and the staged 2 November meeting.
- [content] Calendar ends 8 December (35 days); December waits on the library's month view, Burn the Bird (staged) and the Santa Run routes.
- [coverage] Eat & drink: 2 restaurants, 1 brewery, 1 coffee; the Town's directory lists 26 restaurants (including Bash's on Fifth Street), 4 coffee houses, 3 bars (Rocky J's missing).
- [coverage] Trails: one listing (Bulrush) against the Town's 21 miles; its Existing Trails map (DocumentCenter/View/22414) names six greenways (Raspberry Hill, Legacy, No Name Creek, Wildflower, Wyndham Hill, Fox Run) and twelve unlisted parks; 7 of 26 listed.
- [design] Clean; two long titles are the 27 October chassis item.

## Since last audit
First audit.

## Couldn't verify
- 2D and 2E: weld.gov points to apps.weld.gov/clerkrecorder/elections/results/ (unofficial results from 7:10 pm November 3), 403 to curl and WebFetch.
- The playoff vs Air Academy (MaxPreps 403); Ziggi's hours; three no-response hosts (chamber, Left Hand Water, Carbon Valley Academy), each noted on the page; bot blocks at MaxPreps (89 links), weld.gov, Zillow.

## Worth knowing
Two drafts: the 2027 budget hearings, November 4 and December 2 (the Board packet), and Colorado Boulevard closed in Dacono, Highway 52 to Second Street, through December 1 (the Town's roadwork page). Not drafted: Veterans Day and Thanksgiving closures (frederickco.gov/1201 and /372, mylibrary.us/holiday-closures, cvprd.com).

## Decisions for James
1. The tax result: read apps.weld.gov in a browser, then rewrite with the counts, "unofficial" until certified: passed, `stage: approved`, "Frederick approved a one percent transportation sales tax; it starts January 1", `expires` into 2027; failed, `stage: complete` and a title saying so.
2. Board meetings: the Town page's words, or its calendar ("first Wednesdays at 7 pm, 5:30 work session"), cited.
3. Erie Coffee Roasters' ECR Cafe (staged since 5 October pending a Town or chamber listing) is in the Town's directory now: publish, or wait for a dated post.
4. Staged Carbon Valley Quilters (November 11): cancelled on LibCal, the group already on Get involved; delete, or publish struck through.

## Proposed changes
All in `fixes.md` as exact old → new text, numbered 1–9: the four update links (1), the Festival of Lights start (2), the interim tax-update text (3), the December D&D time and source (4), the market application link and January wording (5), the babysitting ages (6), the Thanksgiving tally (7), the Toastmasters scheme (8), two past files (9). Drafts: `drafts/2027-budget-hearing-november-4-adoption-december-2.md` and `drafts/colorado-boulevard-closed-in-dacono-through-december-1.md`, both passing `updateSchema`.
