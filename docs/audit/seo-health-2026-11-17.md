# SEO + content health audit: Inside the Towns network, 2026-11-17

Findings only; nothing in the site was changed. Audited on Tuesday 17 November 2026 from two sides: a production build of all eight sites (`astro build` per site, 2,292 HTML pages, checked from `dist/`) and the live sites over HTTP (every built URL and every sitemap URL, plus 3,206 redirect chains across 38 domains). Thirteen parallel workers ran the checks (two on the hub, one per guide, redirects, cross-site consistency, Lighthouse, Search Console); their results were merged and de-duplicated into 7,006 instances. Every instance, with URL, source file and evidence, is in `seo-health-2026-11-17-issues.csv`; the pages that need a photo are in `missing-photos-2026-11-17.csv`.

**Live vs build:** no stale deploy. On all eight sites the live title, description, canonical and H1 of every page match the build from `main` (`885af98`); one hub page differed in body text only (time-dependent copy).

## Verdict

1. **The technical base is sound.** Canonicals, sitemaps, robots, status codes, the 404 page, headings, alt text and schema dates are clean on all eight sites, the deploy is current, and Lighthouse mobile scores 98 to 100 with no page failing LCP, CLS or TBT.
2. **Readers are being shown wrong facts in a few places today (P0).** Friday's Roosevelt playoff is listed at a neutral site (it is at home), four playoff quarterfinals are a day early in the hub article, two teams' seasons end on the wrong game, a Turkey Trot price and a council deadline are out of date, and Severance venues are placed in Windsor in 78 places.
3. **The redirect layer leaks ranking.** All 21 folded or retired domains that resolve land on the right page in one hop, but 238 retired addresses answer 200 with a noindex meta refresh instead of a redirect, the Festival of Lights address goes to a list, and two Lyons URLs with impressions 404; Search Console shows folded guides still held 60% of clicks.
4. **Photos are the largest gap.** 249 place pages, 22 articles and six hub town pages (Salida and Timnath among them) have no photo, and ten full-size paid stock originals are downloadable from every site because one image glob ships every town's files.
5. **Three decisions are not live:** Lyons still has six indexable sports pages linked from every footer, the Estes Park Frozen Dead Guy Days spotlight was removed by the 14 November redesign, and Severance, Erie and the hub's sports rows are not in school colours.

## Issue counts: sites × categories (P0 / P1 / P2)

| Site | Inventory | Technical | On-page | Images | Schema | Accuracy | Linking | Perf. | GSC | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| insidethetowns.com | 0/5/5 | 0/14/21 | 0/245/133 | 0/12/156 | 0/5/228 | 5/9/27 | 0/0/653 | 0/0/5 | 0/14/2 | **5/304/1230** |
| insideberthoud.com | · | 0/49/32 | 0/0/23 | 0/64/65 | 0/0/126 | 2/31/20 | 0/0/30 | 0/0/18 | 0/21/8 | **2/165/322** |
| insideerie.com | · | 0/38/12 | 0/7/103 | 0/36/132 | 0/0/227 | 0/98/7 | 0/0/168 | 0/0/147 | 0/10/4 | **0/189/800** |
| insidejohnstown.com | · | 0/20/25 | 0/0/42 | 0/43/82 | 0/0/99 | 11/4/3 | 0/0/274 | 0/0/4 | 0/14/0 | **11/81/529** |
| insidewindsorco.com | · | 0/10/12 | 34/9/81 | 0/66/71 | 12/4/379 | 6/95/14 | 0/0/9 | 0/0/13 | · | **52/184/579** |
| carbonvalleyguide.com | 0/1/0 | 1/19/96 | 0/4/68 | 0/46/9 | 0/28/363 | 0/17/59 | 0/128/123 | 0/0/7 | · | **1/243/725** |
| insidelyons.com | 0/6/14 | 0/84/134 | 0/159/10 | 0/41/21 | 0/4/88 | 0/41/14 | 0/171/8 | 0/0/20 | 2/12/1 | **2/518/310** |
| insideniwot.com | · | 0/8/10 | 0/0/22 | 0/49/29 | 0/0/48 | 0/17/19 | 0/0/68 | 0/0/15 | 0/66/5 | **0/140/216** |
| redirect domains | · | 1/5/361 | · | · | · | · | · | · | 0/22/9 | **1/27/370** |
| **All** | 0/12/19 | 2/247/703 | 34/424/482 | 0/357/565 | 12/41/1558 | 24/312/163 | 0/299/1333 | 0/0/229 | 2/159/29 | **74/1851/5081** |

Cells are P0/P1/P2 instance counts; `·` means none. "Redirect domains" covers the 30 folded, retired and alternate domains read from `src/config/towns/*.ts`, `vercel.json`, `src/lib/fold.ts` and `docs/REDIRECTS.md`. Most P2 volume is a few template-wide items repeated per page (schema recommended fields, breadcrumb trail, no-slash two-hop redirects). Performance P2 rows on the guides are lazy-loaded lead photos read from the HTML; measured Lighthouse results are in their own section.

## Decisions that should have shipped

| Decision | Status | Evidence |
|---|---|---|
| Niwot shows updates and things to know only, no events | **Shipped, with leftovers** | No event pages, feeds, nav items, sitemap entries or internal event links; old event URLs 308 to the home page in one hop; home leads with Updates, then Things to know. Leftovers: `/about/` still shows "Upcoming listings 0" and "Start with what's on", the kids article points to "the events page", the holiday article has five orphaned "The listing." sentences, and `/contact/` and `/for-businesses/` meta still promise event submission (21 rows). `/traditions/` carries two Event JSON-LD blocks (owner's call). |
| Lyons has no sports and leans outdoors | **Not shipped** | Six `/sports/*` pages are built, indexable, in the sitemap and refreshed daily; the footer links "Athletics" to `/sports/` on all 171 pages (`src/components/Footer.astro:53`); the newsletter blurb promises "the scores" on 157 pages; the home page's first section is events and the title leads with events. `DECISIONS.md:10579` leaves the removal to the owner. |
| Timnath and Salida are hub pages, not guides | **Shipped, with leftovers** | `/timnath/` and `/salida/` exist on the hub and nothing current presents them as guides. Both have no hero photograph. Six indexable newsletter-archive pages still say "Inside Timnath" or link to insidetimnath.com. insidesalida.com has no DNS record, so its redirect rules serve nothing. |
| Sports elements use each high school's own colours | **Partly** | School primary confirmed on Berthoud, Johnstown (Roosevelt `#C41230`), Carbon Valley (Frederick `#1C2550`) and Niwot (`#007C47`). Not shipped: all 7 Severance High pages render in Windsor maroon `#6A1B32`, not navy `#1C3C6D` (the templates skip school colours when a guide follows two schools, `sports.astro:75`); Erie's 7 sports pages use `#983C0E`, the guide primary, not `#F26B21`/`#231F20` from `school-colors.ts`; the hub's sports rows use the hub blue. Trim and second colours use the guide accent on Berthoud, Johnstown and Carbon Valley (P2). |
| Estes Park spotlights Frozen Dead Guy Days and focuses on what the town offers | **Not live** | The spotlight shipped on 12 November and the 14 November redesign removed it (`DECISIONS.md:11460`). The page also splits its dates between the town and the national park (P2). |
| Leadville includes the August Race Across the Sky | **Shipped** | On `/leadville/`, dated 21 August 2027, which matches the organizer. |
| New articles appear on the hub home without "All articles" | **Shipped** | All five published articles are on the home page. |

## P0: hurts indexing or shows readers wrong information

Each P0 below was checked against the live site; the sports and price facts were checked against the official source cited in the evidence (CHSAA brackets and game pages, RunSignup). The Roosevelt game page, the Festival of Lights redirect and the two Lyons 404s were re-checked by hand after the merge.

### 2 Technical

#### old event URL redirects to the events list although the event has a live page

- **Instances:** 9 (2 P0/7 P2). **Where:** insidelyons.com (7), carbonvalleyguide.com (1), insidefrederickco.com (1).
- **Worst examples:**
  - SEO-0001 · <https://carbonvalleyguide.com/events/festival-of-lights-2026-12-05/> · `vercel.json:3416` · 308 -> https://carbonvalleyguide.com/events/ (200). The event is live at https://carbonvalleyguide.com/events/festival-of-lights/ (200); content/carbon-valley/events/festival-of-lights.md:4 has "formerSlugs: [festival-of-lights-2…
  - SEO-0002 · <https://insidefrederickco.com/events/festival-of-lights-2026-12-05/> · `vercel.json:3416` · 308 -> https://carbonvalleyguide.com/events/festival-of-lights-2026-12-05/ -> 308 -> https://carbonvalleyguide.com/events/ (two hops, lands on the list; the event page /events/festival-of-lights/ exists)
  - SEO-2558 · <https://insidelyons.com/events/baby-storytime-library/> · `content/lyons/retired.json:14` · live 200 meta refresh -> /events/; retired.json value null; live page for it: /events/baby-storytime-november/ ("Baby storytime and stay-and-play — Nov 24 | Inside Lyons")
- **Why it matters:** The old address is the one Google ranks; sending it to a list throws that ranking away and the reader has to hunt for the event.
- **Fix:** Delete this vercel.json rule (the formerSlugs stub then answers) or change its destination to /events/festival-of-lights/

### 3 On-page

#### Severance event meta description says the venue is in Windsor

- **Instances:** 34 (34 P0). **Where:** insidewindsorco.com (34).
- **Worst examples:**
  - SEO-0003 · <https://insidewindsorco.com/events/2027-town-projects-and-budget-town-hall-2026-10-13/> · `src/routes/town/events/[slug].astro:170` · meta description: "Tuesday, October 13, 5 pm – 7 pm at Severance Town Hall, Windsor. A town hall on the Town of Severance's projects and budget for 2027, at Town Hall on" (page is noindex: past or repeat)
  - SEO-0004 · <https://insidewindsorco.com/events/8th-grade-band-showcase-concert-2027-03-10/> · `src/routes/town/events/[slug].astro:170` · meta description: "Wednesday, March 10, 6:30 pm – 8:30 pm at Severance High School, Windsor. 8th Grade Band Showcase Concert at Severance High School, Wednesday, March 1"
  - SEO-0005 · <https://insidewindsorco.com/events/8th-grade-orchestra-showcase-concert-2027-03-09/> · `src/routes/town/events/[slug].astro:170` · meta description: "Tuesday, March 9, 6:30 pm – 8:30 pm at Severance High School, Windsor. 8th Grade Orchestra Showcase Concert at Severance High School, Tuesday, March 9"
- **Why it matters:** This is the line Google shows under the result, and it puts a Severance venue in the wrong town.
- **Fix:** Use the event's subTown label (as the title already does) or the address locality instead of town.name in the particulars sentence (lines 170-171).

### 5 Structured data

#### Event schema addressLocality "Windsor" for a Severance venue

- **Instances:** 12 (12 P0). **Where:** insidewindsorco.com (12).
- **Worst examples:**
  - SEO-0037 · <https://insidewindsorco.com/events/battle-of-the-bands-2027-02-20/> · `src/lib/seo.ts:498` · location.name="Severance High School, 1200 Hidden Valley Parkway, Severance", address={"@type": "PostalAddress", "addressLocality": "Windsor", "addressRegion": "CO"} ; source file content/windsor/events/battle-of-the-bands-2027-0…
  - SEO-0038 · <https://insidewindsorco.com/events/end-of-second-quarter-2026-12-17/> · `src/lib/seo.ts:498` · location.name="Severance Middle School, 1801 Avery Plaza Street, Severance", address={"@type": "PostalAddress", "addressLocality": "Windsor", "addressRegion": "CO"} ; source file content/windsor/events/end-of-second-quarter-2026-…
  - SEO-0039 · <https://insidewindsorco.com/events/end-of-third-quarter-2027-03-11-glecom/> · `src/lib/seo.ts:498` · location.name="Severance Middle School, 1801 Avery Plaza Street, Severance", address={"@type": "PostalAddress", "addressLocality": "Windsor", "addressRegion": "CO"} ; source file content/windsor/events/end-of-third-quarter-2027-0…
- **Why it matters:** Google reads the town from this field for event results and maps; it is wrong for every Severance venue.
- **Fix:** Give these imported events an `address` (split it out of `venue`), or fall back to the subTown label rather than town.name.

### 6 Consistency & accuracy

#### sports: wrong last game shown (same-day results stored in reverse order)

- **Instances:** 6 (6 P0). **Where:** insidewindsorco.com (4), insideberthoud.com (2).
- **Worst examples:**
  - SEO-0063 · <https://insideberthoud.com/sports/> · `data/berthoud/sports.json` · Softball form strip ends "L Fri, Oct 23: Lost 2-3 vs Lyons / W Fri, Oct 23: Won 12-0 vs Delta / Season over"; CHSAA bracket has Delta (1st round) before Lyons (quarterfinal).
  - SEO-0065 · <https://insidewindsorco.com/> · `data/windsor/sports-windsor-high.json:374` · Home sports strip: "Windsor Wizards Last out: volleyball won 3-0 vs Lewis-Palmer". CHSAA 4A bracket (https://chsaanow.com/brackets/girls-volleyball/2026/state/4a): Match Q Windsor def. Lewis-Palmer 3-0; SF1 Windsor def. Golden 3-…
  - SEO-0064 · <https://insideberthoud.com/sports/softball/> · `data/berthoud/sports.json` · Meta description: "Last game: won 12-0 vs Delta"; band: "Last time out · Softball Won 12-0 vs Delta … season over"; table lists "Fri, Oct 23 vs Lyons L 2–3" before "Fri, Oct 23 vs Delta W 12–0". CHSAA 3A bracket (https://chsaanow…
- **Why it matters:** Readers are told a season ended on a win when it ended on a loss (or, for Windsor, that a quarterfinal was the last match, not the state final).
- **Fix:** Order same-day results by match time/bracket round (scripts/lib/maxpreps.ts keeps no time for results), so the Rampart final is last; then say "season over" and name the runner-up finish.

#### passed deadline still shown as open

- **Instances:** 5 (5 P0). **Where:** insidejohnstown.com (5).
- **Worst examples:**
  - SEO-0054 · <https://insidejohnstown.com/> · `content/johnstown/updates/town-council-vacancy-applications-due-november-16.md:2` · "Worth knowing": link text "Town Council is taking applications for a vacant seat until November 16". Today is 2026-11-17; the deadline passed at 10 am on 2026-11-16. The update has stage: underway and expires: 2026-11-23; its so…
  - SEO-0055 · <https://insidejohnstown.com/get-involved/> · `content/johnstown/programs/town-council.md:9` · "A vacant Council seat is open to applications until 10 am on November 16.". Today is 2026-11-17; the deadline passed at 10 am on 2026-11-16. The update has stage: underway and expires: 2026-11-23; its source page https://johnsto…
  - SEO-0056 · <https://insidejohnstown.com/living-here/> · `content/johnstown/updates/town-council-vacancy-applications-due-november-16.md:2` · "Notice · Under way — Town Council is taking applications for a vacant seat until November 16 … Apply by 10 am on Monday, November 16". Today is 2026-11-17; the deadline passed at 10 am on 2026-11-16. The update has stage: underw…
- **Why it matters:** Readers are told they can still apply after the deadline has passed.
- **Fix:** Change the update to "applications closed Nov 16; interviews Nov 23" (stage/complete) or expire it; remove the sentence from the get-involved entry

#### playoff game listed on the wrong day

- **Instances:** 4 (4 P0). **Where:** insidethetowns.com (4).
- **Worst examples:**
  - SEO-0059 · <https://insidethetowns.com/articles/colorado-football-playoffs-2026/> · `content/hub/curiosity/colorado-football-playoffs-2026.md:108` · 4A Monarch vs Loveland: page: "quarterfinal, Friday, November 20" for both teams; CHSAA 4A bracket (https://chsaanow.com/brackets/football/2026/state/4a, read 17 Nov 2026): "G26 11/21 2:00P 4 Monarch 5 Loveland" (source lines 108…
  - SEO-0060 · <https://insidethetowns.com/articles/colorado-football-playoffs-2026/> · `content/hub/curiosity/colorado-football-playoffs-2026.md:140` · 4A Montrose vs Pueblo West: page: "Montrose plays No. 7 Pueblo West in the quarterfinals on Friday, Nov. 20"; CHSAA 4A bracket: "G27 11/21 1:00P 2 Montrose 7 Pueblo West" (source lines 140, 368)
  - SEO-0061 · <https://insidethetowns.com/articles/colorado-football-playoffs-2026/> · `content/hub/curiosity/colorado-football-playoffs-2026.md:45` · 3A Mead vs Evergreen: page: "Evergreen plays at No. 4 Mead in the quarterfinals on Friday, Nov. 20"; CHSAA 3A bracket (https://chsaanow.com/brackets/football/2026/state/3a): "G26 11/21 1:00P 4 Mead 5 Evergreen" (source lines 45,…
- **Why it matters:** Readers who trust the article turn up a day early.
- **Fix:** Change the day to Saturday, November 21 and add the kickoff time from CHSAA; line 421 ("the 3A to 5A quarterfinals are Friday, November 20") needs "November 20-21"

#### upcoming playoff game shown at a neutral site; CHSAA lists the school as home

- **Instances:** 4 (4 P0). **Where:** insidejohnstown.com (3), insidethetowns.com (1).
- **Worst examples:**
  - SEO-0069 · <https://insidejohnstown.com/> · `data/johnstown/sports.json:145` · Page shows: "A. Jones, M.D. Memorial Library 7 pm Roosevelt football vs Mesa Ridge Neutral site · State Football Playoffs 10 am Watercolor Trees & Leaves Glenn A. Jones, M.D. Memoria". Official: CHSAA game page https://chsaanow.c…
  - SEO-0072 · <https://insidethetowns.com/> · `data/johnstown/sports.json:145` · Page shows: "20 Johnstown · Friday night lights Roosevelt Roughriders vs Mesa Ridge State Football Playoffs · 1st in the 4A Northern league 7 pm · Neutral site · 10–1 this season Bert". Official: CHSAA game page https://chsaanow.…
  - SEO-0070 · <https://insidejohnstown.com/sports/> · `data/johnstown/sports.json:145` · Page shows: ". Next up · Football · State Football Playoffs Roosevelt vs Mesa Ridge Friday, November 20 · 7 pm · Neutral site The Roughriders are 10-1 overall, 7-0 in the 4A Northern.". Official: CHSAA game page https://chsaanow.…
- **Why it matters:** Friday's game is at Roosevelt; four pages tell readers it is somewhere else.
- **Fix:** Add a `hosted` entry for football 2026-11-20 on Roosevelt in src/config/school-sports.ts (as was done for 2026-11-13, line 423) so the page says Home; re-run the sports build.

#### event price out of date

- **Instances:** 3 (3 P0). **Where:** insidejohnstown.com (3).
- **Worst examples:**
  - SEO-0051 · <https://insidejohnstown.com/events/> · `content/johnstown/events/fitness-avenue-turkey-trot.md:8` · Page shows "5K $43.40, kids' 1K $22.20, fees included; prices rise after November 13". Organizer page https://runsignup.com/Race/CO/Johnstown/FitnessAvenueTurkeyTrot (read 2026-11-17) shows "5K Price: $48.70 incl. $3.70 Fee" and…
  - SEO-0052 · <https://insidejohnstown.com/events/fitness-avenue-turkey-trot/> · `content/johnstown/events/fitness-avenue-turkey-trot.md:8` · Page shows "5K $43.40, kids' 1K $22.20, fees included; prices rise after November 13". Organizer page https://runsignup.com/Race/CO/Johnstown/FitnessAvenueTurkeyTrot (read 2026-11-17) shows "5K Price: $48.70 incl. $3.70 Fee" and…
  - SEO-0053 · <https://insidejohnstown.com/this-weekend/> · `content/johnstown/events/fitness-avenue-turkey-trot.md:8` · Page shows "5K $43.40, kids' 1K $22.20, fees included; prices rise after November 13". Organizer page https://runsignup.com/Race/CO/Johnstown/FitnessAvenueTurkeyTrot (read 2026-11-17) shows "5K Price: $48.70 incl. $3.70 Fee" and…
- **Why it matters:** The price shown is lower than what the organizer now charges.
- **Fix:** Update cost to "5K $48.70, kids' 1K $27.50, fees included; prices rise after November 25"

#### Severance annual event page says "Windsor holds it every year"

- **Instances:** 2 (2 P0). **Where:** insidewindsorco.com (2).
- **Worst examples:**
  - SEO-0049 · <https://insidewindsorco.com/events/kids-fishing-derby/> · `src/routes/town/events/[slug].astro:320` · Visible copy: "Windsor holds it every year; the next date has not been announced, and this page is updated when the organizer posts it." The organizer shown on the page is the Town of Severance.
  - SEO-0050 · <https://insidewindsorco.com/events/trick-or-treat-parade/> · `src/routes/town/events/[slug].astro:320` · Visible copy: "Windsor holds it every year; the next date has not been announced, and this page is updated when the organizer posts it." The organizer shown on the page is the Town of Severance.
- **Why it matters:** Wrong town in visible copy on an indexable page.
- **Fix:** Use the event's subTown label (or the organizer) instead of town.name in the awaiting-date sentence.

### 9 Search Console

#### URL with search impressions returns 404

- **Instances:** 2 (2 P0). **Where:** insidelyons.com (2).
- **Worst examples:**
  - SEO-0073 · <https://insidelyons.com/events/art-opening-at-mainstage-brewing-2026-11-06/> · `content/lyons/retired.json` · live HTTP 404 on 2026-11-17 (curl); no file in content/lyons/events and no entry in content/lyons/retired.json; Search Console 28 days 2026-10-18..2026-11-14: 14 impressions, 0 clicks, position 27.4; URL Inspection: Submitted and…
  - SEO-0074 · <https://insidelyons.com/events/old-time-jam-at-oskar-blues-2026-10-28/> · `content/lyons/retired.json` · live HTTP 404 on 2026-11-17 (curl); no file in content/lyons/events and no entry in content/lyons/retired.json; Search Console 28 days 2026-10-18..2026-11-14: 2 impressions, 0 clicks, position 3.5; not inspected
- **Why it matters:** Google is still showing these addresses and they are dead ends.
- **Fix:** Add the slug to content/lyons/retired.json (null sends it to /events/, or name the listing that replaced it) so the URL redirects instead of 404ing

## P1: clear ranking or UX loss

### 1 Inventory & indexing

#### sports page still built, indexable and in sitemap (Lyons has no sports)

- **Instances:** 6 (6 P1). **Where:** insidelyons.com (6).
- **Worst examples:**
  - SEO-0081 · <https://insidelyons.com/sports/> · `src/routes/town/sports.astro` · live 200; robots meta none; in sitemap-0.xml; title "Lyons Middle/Senior High School Lions Scores & Schedules"; data/lyons/sports.json read Nov 16, 2026; own share image https://insidelyons.com/sports/share/school.png
  - SEO-0082 · <https://insidelyons.com/sports/boys-basketball/> · `src/routes/town/sports-team.astro` · live 200; robots meta none; in sitemap-0.xml; title "Lyons Lions Boys Basketball Scores & Schedule 2026–27"; data/lyons/sports.json read Nov 16, 2026; own share image https://insidelyons.com/sports/share/boys-basketball.png
  - SEO-0083 · <https://insidelyons.com/sports/football/> · `src/routes/town/sports-team.astro` · live 200; robots meta none; in sitemap-0.xml; title "Lyons Lions Football Scores & Schedule 2026 · Inside Lyons"; data/lyons/sports.json read Nov 16, 2026; own share image https://insidelyons.com/sports/share/football.png
- **Why it matters:** The owner's decision is that Lyons has no sports; these pages are still live, indexable and refreshed daily.
- **Fix:** Stop building /sports/* for lead: outdoors (or noindex + drop from sitemap), then 308 the six URLs to / or /things-to-do/

#### orphan page: indexable and in the sitemap, no internal link from any page

- **Instances:** 5 (5 P1). **Where:** insidethetowns.com (5).
- **Worst examples:**
  - SEO-0076 · <https://insidethetowns.com/boulder/museum-of-boulder-colorado-day-free-admission/> · `content/hub/traditions/boulder-museum-of-boulder-colorado-day-free-admission.md` · 0 inbound internal links in links.jsonl; in sitemap-0.xml; self-canonical; 109 words; title "Colorado Day: free admission at the Museum of Boulder 2027"
  - SEO-0077 · <https://insidethetowns.com/boulder/museum-of-boulder-tulagi-free-days/> · `content/hub/traditions/boulder-museum-of-boulder-tulagi-free-days.md` · 0 inbound internal links in links.jsonl; in sitemap-0.xml; self-canonical; 129 words; title "Free days at the Museum of Boulder for Tulagi Music Fest ticket holders 2027"
  - SEO-0078 · <https://insidethetowns.com/golden/colorado-railroad-museum-boulder-county-free-days/> · `content/hub/traditions/golden-colorado-railroad-museum-boulder-county-free-days.md` · 0 inbound internal links in links.jsonl; in sitemap-0.xml; self-canonical; 98 words; title "Golden Boulder County Free Admission Days at the Colorado Railroad Museum 2027"
- **Why it matters:** A page with no internal link gets little crawl attention and no reader can reach it.
- **Fix:** A free-admission day whose date has passed is dropped from every list (isListed, src/lib/hub-towns.ts:89) but its page is still built and listed in the sitemap: either keep a link to it from the town page and /free-admission-days/, or noindex it and drop it f…

#### home title names three towns; one has no listings

- **Instances:** 1 (1 P1). **Where:** carbonvalleyguide.com (1).
- **Worst examples:**
  - SEO-0075 · <https://carbonvalleyguide.com/> · `src/config/towns/carbon-valley.ts:61` · title “Frederick, Firestone & Dacono, CO events & things to do”. Of 31 place pages: 23 Frederick addresses, 7 Firestone, 1 Longmont, 0 Dacono. None of the 68 event files has a Dacono venue or address. /parks/ and /eat-drink/ neve…
- **Why it matters:** The title promises Dacono coverage the guide does not have.
- **Fix:** Add Dacono listings (city hall, parks, a few businesses, the events calendar) or soften the title until they exist; the config comment says the Firestone/Dacono listings removed on 2 November were not brought back.

### 2 Technical

#### retired URL answers 200 with a meta refresh (noindex stub), not an HTTP redirect

- **Instances:** 224 (224 P1). **Where:** insidelyons.com (84), insideberthoud.com (46), insideerie.com (38), carbonvalleyguide.com (19), insidejohnstown.com (19), insidewindsorco.com (10), insideniwot.com (8).
- **Worst examples:**
  - SEO-0110 · <https://carbonvalleyguide.com/articles/> · `astro.config.mjs:62` · HTTP 200; meta refresh "0;url=/guides/"; robots "noindex"; canonical https://carbonvalleyguide.com/guides/; not in sitemap; target https://carbonvalleyguide.com/guides/ answers 200
  - SEO-0129 · <https://insideberthoud.com/articles/> · `astro.config.mjs:62` · HTTP 200; meta refresh "0;url=/guides/"; robots "noindex"; canonical https://insideberthoud.com/guides/; not in sitemap; target https://insideberthoud.com/guides/ answers 200
  - SEO-0175 · <https://insideerie.com/articles/> · `astro.config.mjs:62` · HTTP 200; meta refresh "0;url=/guides/"; robots "noindex"; canonical https://insideerie.com/guides/; not in sitemap; target https://insideerie.com/guides/ answers 200
- **Why it matters:** Google files these as "Excluded by noindex" instead of passing the old address's ranking on; Search Console shows dated event URLs still holding the impressions.
- **Fix:** Have the build emit a permanent redirect for every Astro `redirects` entry (formerSlugs, /places, /articles) into vercel.json or the Vercel build output config, as host-files.ts does for _redirects

#### hub address for a guide town answers 200 with a meta refresh, not an HTTP redirect

- **Instances:** 14 (14 P1). **Where:** insidethetowns.com (14).
- **Worst examples:**
  - SEO-0087 · <https://insidethetowns.com/berthoud/> · `src/lib/hub-moved.ts:20` · live status 200; <meta http-equiv=refresh content="0;url=https://insideberthoud.com/">; robots=noindex; canonical=https://insideberthoud.com/ (noindex and a cross-domain canonical on the same page)
  - SEO-0088 · <https://insidethetowns.com/carbon-valley/> · `src/lib/hub-moved.ts:24` · live status 200; <meta http-equiv=refresh content="0;url=https://carbonvalleyguide.com/">; robots=noindex; canonical=https://carbonvalleyguide.com/ (noindex and a cross-domain canonical on the same page)
  - SEO-0089 · <https://insidethetowns.com/dacono/> · `src/lib/hub-moved.ts:27` · live status 200; <meta http-equiv=refresh content="0;url=https://carbonvalleyguide.com/">; robots=noindex; canonical=https://carbonvalleyguide.com/ (noindex and a cross-domain canonical on the same page)
- **Why it matters:** A 200 page with noindex and a cross-domain canonical sends mixed signals; a 308 passes the link on cleanly.
- **Fix:** Add host-scoped permanent redirects for these 14 paths to vercel.json (the rules hub-moved.ts says were left for the owner) so each answers 308 in one hop

#### old event URL lands on the town page although the event has its own hub page

- **Instances:** 5 (5 P1). **Where:** insideblackhawk.com (1), insideevergreenco.com (1), insideidahosprings.com (1), insidelongmontco.com (1), insidemanitousprings.com (1).
- **Worst examples:**
  - SEO-0101 · <https://insideblackhawk.com/events/halloween-street-fall-festival-2026-10-24/> · `data/hub/fold-events.json` · 308 https://insideblackhawk.com/events/halloween-street-fall-festival-2026-10-24/ > 200 https://insidethetowns.com/black-hawk/#traditions; matching page https://insidethetowns.com/black-hawk/halloween-street-fall-festival/ is bui…
  - SEO-0102 · <https://insideevergreenco.com/events/frostival-2026-12-12/> · `data/hub/fold-events.json` · 308 https://insideevergreenco.com/events/frostival-2026-12-12/ > 200 https://insidethetowns.com/evergreen/#traditions; matching page https://insidethetowns.com/evergreen/frostival/ is built and live (200); address cited in ./docs…
  - SEO-0103 · <https://insideidahosprings.com/events/halloween-street-fall-festival-2026-10-24/> · `data/hub/fold-events.json` · 308 https://insideidahosprings.com/events/halloween-street-fall-festival-2026-10-24/ > 200 https://insidethetowns.com/idaho-springs/#traditions; matching page https://insidethetowns.com/black-hawk/halloween-street-fall-festival/…
- **Why it matters:** The fold was meant to keep each old event address on its own page; these five lose it, two of them for December events.
- **Fix:** Add "/events/halloween-street-fall-festival-2026-10-24/" (and its undated form) for insideblackhawk.com to data/hub/fold-events.json and run node scripts/fold-rules.ts --write, so it goes to https://insidethetowns.com/black-hawk/halloween-street-fall-festival/

#### redirect lands on a noindex page

- **Instances:** 4 (4 P1). **Where:** insideberthoud.com (3), insidejohnstown.com (1).
- **Worst examples:**
  - SEO-0106 · <https://insideberthoud.com/events/beer-release-cabaret-2026-11-06/> · `content/berthoud/events/raspberry-bandit-and-cabaret-releases-with-johnny-johnston-a-2026-11-06.md` · Stub -> /events/raspberry-bandit-and-cabaret-releases-with-johnny-johnston-a-2026-11-06/, which is a past event carrying <meta name="robots" content="noindex"> and no canonical.
  - SEO-0109 · <https://insidejohnstown.com/events/messy-art/> · `vercel.json:1462` · Live: 308 -> /events/messy-art-2026-10-28/ (200, meta robots noindex, an event dated Oct 28 2026). content/johnstown/retired.json:7 says null (-> /events/); the built stub points to /events/. The hub newsletter archive /newslette…
  - SEO-0107 · <https://insideberthoud.com/events/holiday-card-art-contest-deadline-2026-11-07/> · `content/berthoud/events/holiday-card-art-contest-deadline-2026-11-14.md` · Stub -> /events/holiday-card-art-contest-deadline-2026-11-14/, which is a past event carrying <meta name="robots" content="noindex"> and no canonical.
- **Why it matters:** A redirect that ends on a noindex page drops the ranking of the address it came from.
- **Fix:** Point the old slug at /events/ now that the merged event has passed.

### 3 On-page

#### thin event page

- **Instances:** 279 (231 P1/48 P2). **Where:** insidethetowns.com (231), carbonvalleyguide.com (24), insideerie.com (24).
- **Worst examples:**
  - SEO-0527 · <https://insidethetowns.com/alamosa/rio-frio-ice-festival/> · `content/hub/traditions/alamosa-rio-frio-ice-festival.md` · 94 words; no description of the event, only date/status, source and links
  - SEO-2999 · <https://carbonvalleyguide.com/events/6th-8th-band-concert-2027-02-18/> · `content/carbon-valley/events/6th-8th-band-concert-2027-02-18.md` · Body (35 words): “6th-8th Band Concert at Thunder Valley K-8, 600 5th Street, Frederick, Thursday, February 18, 6 pm – 7 pm. Listed by Thunder Valley K-8 (sch…” ; 363 words in <main> are almost all template and signup text.
  - SEO-3023 · <https://insideerie.com/events/3d-paper-design-2026-11-23/> · `content/erie/events/3d-paper-design-2026-11-23.md:16` · body: “3D Paper Design at Erie Community Library, Monday, November 23, 10 am – 12 pm. Listed by highplains.libcal.com; the organizer's page has the details a”
- **Why it matters:** These pages were built to hold the folded guides' event rankings; with under 100 words and often no date, Google has little reason to index them.
- **Fix:** Add an `about` paragraph to the record (what the event is, where, cost) so the page says more than the row on the town page; or noindex pages whose date is not announced

#### newsletter blurb promises "the scores" on a guide with no sports

- **Instances:** 157 (157 P1). **Where:** insidelyons.com (157).
- **Worst examples:**
  - SEO-0344 · <https://insidelyons.com/> · `src/components/NewsletterSignup.astro:164` · "the weekend’s events, the scores, places that opened or closed in Lyons, and a new article when there is one"
  - SEO-0345 · <https://insidelyons.com/articles/explore-lyons-in-walking-order/> · `src/components/NewsletterSignup.astro:164` · "the weekend’s events, the scores, places that opened or closed in Lyons, and a new article when there is one"
  - SEO-0346 · <https://insidelyons.com/articles/lyons-hikes-where-dogs-are-allowed/> · `src/components/NewsletterSignup.astro:164` · "the weekend’s events, the scores, places that opened or closed in Lyons, and a new article when there is one"
- **Why it matters:** Copy on 157 pages contradicts the no-sports decision.
- **Fix:** Key the ', the scores' clause on town.lead !== 'outdoors' as well as town.school

#### sports page drawn in the guide palette, not the school's colours

- **Instances:** 19 (19 P1). **Where:** insidewindsorco.com (9), insideerie.com (7), insidethetowns.com (3).
- **Worst examples:**
  - SEO-0508 · <https://insideerie.com/sports/> · `src/lib/school-sports.ts:20` · scoped style on the page wrapper: --town-primary:#983C0E; --color-primary:#983C0E — identical to the guide palette on <html> (--town-primary:#983C0E). Neither #F26B21 (Erie High orange) nor #231F20 (black) from TownConfig.school…
  - SEO-0515 · <https://insidethetowns.com/> · `src/routes/hub/index.astro:541` · High school scores: all 7 rows are <a class="text-primary underline ..."> (the hub's #24455D) with the result in text-ink-muted; the only inline style on the page is the wordmark's; none of the school colours in src/config/towns/…
  - SEO-0518 · <https://insidewindsorco.com/> · `src/components/SportsStrip.astro:50` · "High school sports this week" strip: "Windsor Wizards … / Severance Silver Knights …" with classes bg-primary / border-primary-line / text-primary only (= #6A1B32); no per-school colour.
- **Why it matters:** The decision was that sports use each school's own colours; these pages do not.
- **Fix:** Decide which rule is meant: if sports elements must carry schoolTheme() (band #231F20, mark/rule #F26B21), apply it in schoolCssVars()/the sports templates and the share card; if #983C0E (the school site’s own darkest orange step, per the config comment) is t…

#### indexable page presents Timnath as a standalone guide

- **Instances:** 6 (6 P1). **Where:** insidethetowns.com (6).
- **Worst examples:**
  - SEO-0338 · <https://insidethetowns.com/newsletter/2026-10-22-all-towns/> · `content/hub/issues/2026-10-22-all-towns.md` · "Everything on: insidetimnath.com/events". Page is indexable (robots: None), self-canonical, in the sitemap (True) and in the hub search index. insidetimnath.com now 308s to https://insidethetowns.com/timnath/.
  - SEO-0339 · <https://insidethetowns.com/newsletter/2026-10-22-windsor-timnath/> · `content/hub/issues/2026-10-22-windsor-timnath.md` · footer "from Inside Windsor and Inside Timnath"; links to insidetimnath.com/this-week/ and /events/…. Page is indexable (robots: None), self-canonical, in the sitemap (True) and in the hub search index. insidetimnath.com now 308s…
  - SEO-0340 · <https://insidethetowns.com/newsletter/2026-10-29-all-towns/> · `content/hub/issues/2026-10-29-all-towns.md` · "Everything on: insidetimnath.com/events". Page is indexable (robots: None), self-canonical, in the sitemap (True) and in the hub search index. insidetimnath.com now 308s to https://insidethetowns.com/timnath/.
- **Why it matters:** Timnath is a hub page; these indexable pages still brand it as a guide and link to the retired domain.
- **Fix:** Either noindex the archived issues that predate the fold, or rewrite the retired-guide links and the "Inside Timnath" line at build time to the hub Timnath page.

#### placeholder text shown to readers ("TBD")

- **Instances:** 4 (4 P1). **Where:** insidethetowns.com (4).
- **Worst examples:**
  - SEO-0504 · <https://insidethetowns.com/estes-park/> · `content/hub/traditions/rmnp-glacier-basin-campground.md:21` · visible text: "Typical window, not a date: TBD: Check back in mid-November." (Glacier Basin Campground season; today is 17 November)
  - SEO-0505 · <https://insidethetowns.com/granby/> · `content/hub/traditions/rmnp-glacier-basin-campground.md:21` · visible text: "Typical window, not a date: TBD: Check back in mid-November." (Glacier Basin Campground season; today is 17 November)
  - SEO-0506 · <https://insidethetowns.com/grand-lake/> · `content/hub/traditions/rmnp-glacier-basin-campground.md:21` · visible text: "Typical window, not a date: TBD: Check back in mid-November." (Glacier Basin Campground season; today is 17 November)
- **Why it matters:** Readers see a literal placeholder on four indexable pages.
- **Fix:** Replace typicalWindow with the real typical window ("late May to early September") or remove the field; re-check the source now that mid-November has arrived

#### page titled for Carbon Valley covers Frederick only

- **Instances:** 3 (3 P1). **Where:** carbonvalleyguide.com (3).
- **Worst examples:**
  - SEO-0501 · <https://carbonvalleyguide.com/guides/> · `src/routes/town/guides.astro:40` · meta description “Guides to Carbon Valley, CO: Carbon Valley with kids, the outdoors, what moving here is like, and how the town got this way.” All four articles are Frederick’s (Frederick with kids, Explore Frederick, Frederick…
  - SEO-0502 · <https://carbonvalleyguide.com/living-here/> · `src/routes/town/living-here.astro` · title “Living in Carbon Valley, CO: utilities, schools, who to call”; intro on the page: “Who handles what in Frederick; for Firestone and Dacono, see each town’s own site.” Mentions: Frederick 23, Firestone 8, Dacono 3.
  - SEO-0503 · <https://carbonvalleyguide.com/moving-here/> · `content/carbon-valley/pages/moving-here.md:2` · title tag “Moving to Carbon Valley, Colorado | Inside Carbon Valley”; H1 “Moving to Frederick”; meta description “Frederick, Colorado: a statutory town in Weld County…”; schema WebPage name “Moving to Carbon Valley, Colorado”. Me…
- **Why it matters:** The title and the content disagree, so Firestone and Dacono searchers land on a Frederick page.
- **Fix:** Describe what is there (“Frederick with kids…”) or commission the Firestone and Dacono pieces.

#### decision not shipped: Estes Park does not spotlight Frozen Dead Guy Days

- **Instances:** 1 (1 P1). **Where:** insidethetowns.com (1).
- **Worst examples:**
  - SEO-0334 · <https://insidethetowns.com/estes-park/> · `src/config/hub-towns.ts:236` · Frozen Dead Guy Days is the 8th of 14 plain rows under Coming up (APR 9-11 2027); no spotlight block, not in the title, description or intro. showpiece.spotlight: 'estes-park-frozen-dead-guy-days' is still in the config but DECIS…
- **Why it matters:** The spotlight shipped on 12 November and the 14 November redesign removed it.
- **Fix:** Owner to confirm: restore a spotlight block in src/routes/hub/town.astro, or accept the 14 November layout

#### form placeholder text shown to readers

- **Instances:** 1 (1 P1). **Where:** carbonvalleyguide.com (1).
- **Worst examples:**
  - SEO-0335 · <https://carbonvalleyguide.com/submit-event/> · `src/routes/town/submit-event.astro:119` · Visible copy: “The form here isn’t switched on yet, so email it instead”. No <form> on the page; src/config/towns/carbon-valley.ts has no formspreeId (Erie and Berthoud have one and render a form).
- **Why it matters:** The page tells readers the form is not switched on.
- **Fix:** Create the Formspree form for carbonvalleyguide.com and set formspreeId in the town config (TODO.md line 107 lists it as owner-pending).

#### hero line promises outdoor dates the page does not show

- **Instances:** 1 (1 P1). **Where:** insidelyons.com (1).
- **Worst examples:**
  - SEO-0336 · <https://insidelyons.com/> · `src/lib/hero-line.ts:59` · hero text "The outdoor dates around Lyons, and what’s on this week, with the one we’d go to"; the only dated section is headed "Every year in Lyons" and lists festivals and holiday events
- **Why it matters:** The first line of the home page promises content the page does not carry.
- **Fix:** Either show the outdoor dates section or change the line when dates.lead is not outdoor

#### home page does not lead with outdoor content

- **Instances:** 1 (1 P1). **Where:** insidelyons.com (1).
- **Worst examples:**
  - SEO-0337 · <https://insidelyons.com/> · `src/components/home/TownHome.astro:294` · section order in <main>: "What’s happening in Lyons" (events tabs) > "Every year in Lyons" (Tree Lighting, Parade of Lights, Old Man Winter, RockyGrass, Folks Festival) > Worth knowing > Find your next stop; no "Outdoor dates" he…
- **Why it matters:** The decision was that Lyons leans outdoors; the home page leads with events.
- **Fix:** Give the outdoor lead real content (trail conditions, river flow, the three trail pages) above or directly under the hero, whatever the count of dated outdoor records

### 4 Photos & images

#### place page has no photo

- **Instances:** 249 (249 P1). **Where:** insidewindsorco.com (51), insideberthoud.com (50), insideniwot.com (34), carbonvalleyguide.com (30), insidejohnstown.com (29), insidelyons.com (29), insideerie.com (26).
- **Worst examples:**
  - SEO-0866 · <https://carbonvalleyguide.com/places/acupuncture-and-natural-medicine-center/> · `content/carbon-valley/places/acupuncture-and-natural-medicine-center.md` · No <img> in the listing; og:image is the guide-wide fallback fifth-street-at-oak (old-town Frederick in snow, 2018), shared by 133 pages; schema has no image.
  - SEO-0896 · <https://insideberthoud.com/places/a-and-w/> · `content/berthoud/places/a-and-w.md` · No `image:` in front matter; page shows the street-map fallback; Restaurant JSON-LD has no image; og:image is the generic town photo.
  - SEO-0946 · <https://insideerie.com/places/24-carrot-bistro/> · `content/erie/places/24-carrot-bistro.md` · no image: in front matter; no <img> in <main>; og:image = generic AdobeStock_511199397.h1dO3Vw4_Z2nHoU2.jpg; no image in the restaurant schema
- **Why it matters:** A place page with no photo gets a generic share image and gives image search nothing; whole list pages (restaurants, coffee, shops) show no photos at all.
- **Fix:** Add image, imageAlt and imageCredit (owner-supplied with permission, Town-supplied, or shot by us).

#### full-size licensed stock original publicly served (unreferenced)

- **Instances:** 73 (73 P1). **Where:** carbonvalleyguide.com (10), insideberthoud.com (10), insideerie.com (10), insidejohnstown.com (10), insidelyons.com (10), insideniwot.com (10), insidewindsorco.com (10), insidethetowns.com (3).
- **Worst examples:**
  - SEO-0786 · <https://carbonvalleyguide.com/_astro/AdobeStock_1111460584.B0Bfe_uT.jpeg> · `src/lib/images.ts:8` · AdobeStock_1111460584.B0Bfe_uT.jpeg: 7,162,554 bytes in the Carbon Valley build; no page, stylesheet or script of this site references it. Live check of AdobeStock_413103868.ZHVGgwzP.jpeg and iStock-1417954947.D5q866fi.jpg on car…
  - SEO-0796 · <https://insideberthoud.com/_astro/AdobeStock_1111460584.B0Bfe_uT.jpeg> · `src/lib/images.ts:8` · Live GET https://insideberthoud.com/_astro/AdobeStock_1111460584.B0Bfe_uT.jpeg -> 200 image/jpeg, 7,162,554 bytes (unprocessed original). Another town's licensed hero; not used on any Berthoud page.
  - SEO-0806 · <https://insideerie.com/_astro/AdobeStock_1111460584.B0Bfe_uT.jpeg> · `src/lib/images.ts:8` · live range request answered HTTP 206, full size 7162554 bytes; file is in this site's build (7162554 bytes); the glob '/content/*/images/*' at src/lib/images.ts:8 takes in every town's originals
- **Why it matters:** Full-resolution paid stock files (up to 10 MB) can be downloaded from every site; PERMISSIONS.md:721 quotes the iStock term against standalone files.
- **Fix:** Limit the image glob to the towns the site being built uses, so other towns' originals are not emitted to /_astro.

#### article has no lead photo

- **Instances:** 22 (22 P1). **Where:** insideniwot.com (4), insidewindsorco.com (4), carbonvalleyguide.com (3), insideberthoud.com (3), insidejohnstown.com (3), insidethetowns.com (3), insidelyons.com (2).
- **Worst examples:**
  - SEO-0758 · <https://carbonvalleyguide.com/articles/explore-frederick-in-walking-order/> · `content/carbon-valley/articles/explore-frederick-in-walking-order.md` · No image: in the article file; no <img> in the article; og:image is the guide-wide fallback fifth-street-at-oak; Article schema has no image; its card on /guides/ is text-only.
  - SEO-0761 · <https://insideberthoud.com/articles/breakfast-and-coffee-in-berthoud/> · `content/berthoud/articles/breakfast-and-coffee-in-berthoud.md` · No <img> in the article; no `image:` in front matter; Article JSON-LD has no image; og:image is the generic town photo iStock-1417954947.D5q866fi_ZJlo4V.jpg.
  - SEO-0764 · <https://insidejohnstown.com/articles/breakfast-and-coffee-in-johnstown/> · `content/johnstown/articles/breakfast-and-coffee-in-johnstown.md` · No image: in frontmatter; no <img> on the page, og:image is the generic hero, Article JSON-LD has no image
- **Why it matters:** Articles are the pages most likely to be shared; without a lead photo they share the generic town image and have no Article image for Google.
- **Fix:** Add image/imageAlt/imageCredit to the frontmatter.

#### hub town page has no hero photograph

- **Instances:** 6 (6 P1). **Where:** insidethetowns.com (6).
- **Worst examples:**
  - SEO-0859 · <https://insidethetowns.com/cedaredge/> · `src/config/hub-towns.ts:327` · data-town-hero="mesa" (drawn horizon); hero: { image: 'cedaredge.jpg', alt: '' } and content/hub/images/cedaredge.jpg is not in the repo
  - SEO-0860 · <https://insidethetowns.com/green-mountain-falls/> · `src/config/hub-towns.ts:346` · data-town-hero="peaks" (drawn horizon); hero: { image: 'green-mountain-falls.jpg', alt: '' } and content/hub/images/green-mountain-falls.jpg is not in the repo
  - SEO-0861 · <https://insidethetowns.com/marble/> · `src/config/hub-towns.ts:315` · data-town-hero="peaks" (drawn horizon); hero: { image: 'marble.jpg', alt: '' } and content/hub/images/marble.jpg is not in the repo
- **Why it matters:** These town pages render a text card where every other town has a photo; two of them are Salida and Timnath.
- **Fix:** Add the licensed photograph to content/hub/images/, write its alt in hub-towns.ts and add its IMAGE_LICENSES.csv row

#### build ships every town's unreferenced image originals

- **Instances:** 5 (5 P1). **Where:** carbonvalleyguide.com (1), insideberthoud.com (1), insidejohnstown.com (1), insideniwot.com (1), insidewindsorco.com (1).
- **Worst examples:**
  - SEO-0780 · <https://carbonvalleyguide.com/_astro/> · `src/lib/images.ts:8` · 383 more unreferenced image files, 185,272,357 bytes (e.g. durango.BpzAX9WW.jpg 2,043,903 bytes, live 200). Whole build: 393 unreferenced image files, 262,074,445 bytes of a 266,940,470-byte _astro folder; only 46 image files are…
  - SEO-0781 · <https://insideberthoud.com/_astro/> · `src/lib/images.ts:8` · dist/_astro holds 753 files; 460 (269 MB) are referenced by no page, stylesheet or script of this site, 369 of them unprocessed originals from other towns (e.g. durango.BpzAX9WW.jpg 2,043,903 bytes, live 200).
  - SEO-0782 · <https://insidejohnstown.com/_astro/> · `src/lib/images.ts:8` · 415 of 614 files in dist/_astro (398 .jpg, 9 .jpeg, 5 .webp, 3 .js) are referenced by no HTML/CSS/JS of this site: 262,736,906 bytes vs 17,619,309 bytes referenced. e.g. durango.BpzAX9WW.jpg 2,043,903 bytes, live 200.
- **Why it matters:** One glob puts 260 MB of other towns' originals into each site's deploy; it is the cause of the stock-file exposure.
- **Fix:** Same fix: emit only the images the site being built uses.

#### featured event has no photo

- **Instances:** 1 (1 P1). **Where:** carbonvalleyguide.com (1).
- **Worst examples:**
  - SEO-0785 · <https://carbonvalleyguide.com/events/festival-of-lights/> · `content/carbon-valley/events/festival-of-lights.md` · The home page’s “Don’t miss” event and the only confirmed annual tradition: no image, og:image is the generic fallback, Event schema has no image.
- **Why it matters:** The guide's featured December event has no image of its own.
- **Fix:** A photo of the Crist Park tree lighting or lighted parade from a past year (ask the Town of Frederick).

#### licensed photo sits unused in the repo

- **Instances:** 1 (1 P1). **Where:** carbonvalleyguide.com (1).
- **Worst examples:**
  - SEO-0865 · <https://carbonvalleyguide.com/places/st-vrain-state-park/> · `content/carbon-valley/images/st-vrain-state-park.jpg` · content/carbon-valley/images/ holds st-vrain-state-park.jpg and hero.jpg (both St. Vrain State Park, CC BY 4.0, IMAGE_LICENSES.csv lines 176 and 148), firestone-former-town-hall.jpg (line 149), ottesen-grain-mill.jpg (line 219) a…
- **Why it matters:** A licensed photo that would fill an empty slot is already in the repo.
- **Fix:** Add image/imageAlt/imageCredit to places/st-vrain-state-park.md; use the Firestone town-hall photo on a Firestone page; remove the Fort Lupton library file (not this guide’s town).

### 5 Structured data

#### Article schema has no image

- **Instances:** 57 (11 P1/46 P2). **Where:** insidethetowns.com (41), insidewindsorco.com (4), insideniwot.com (4), carbonvalleyguide.com (3), insidejohnstown.com (3), insidelyons.com (2).
- **Worst examples:**
  - SEO-1115 · <https://insidelyons.com/articles/explore-lyons-in-walking-order/> · `content/lyons/articles/explore-lyons-in-walking-order.md` · Article JSON-LD without image (Google asks for one for article rich results)
  - SEO-1117 · <https://insidethetowns.com/articles/colorado-connector-train-tax/> · `src/routes/hub/curiosity-article.astro:143` · NewsArticle block has headline, dates, author, publisher but no `image`; og:image is front-range-flatirons.CimX2VLU_1QMcH6.jpg
  - SEO-1122 · <https://insidewindsorco.com/articles/moving-to-severance/> · `content/windsor/articles/moving-to-severance.md` · Article JSON-LD has headline, datePublished, dateModified, author, publisher but no `image` (Google lists image as recommended for Article rich results)
- **Why it matters:** Google asks for an image on Article markup; without it the article cannot show as a rich result with a thumbnail.
- **Fix:** Add image (the share image) and dateModified to the issue Article object

#### Event schema names "Carbon Valley" as the town, with no street address

- **Instances:** 28 (28 P1). **Where:** carbonvalleyguide.com (28).
- **Worst examples:**
  - SEO-1126 · <https://carbonvalleyguide.com/events/6th-8th-band-concert-2027-02-18/> · `content/carbon-valley/events/6th-8th-band-concert-2027-02-18.md:5` · location.name “Thunder Valley K-8, 600 5th Street, Frederick”; address = {addressLocality: “Carbon Valley”, addressRegion: “CO”} (no streetAddress, no postalCode). The event file has venue: but no address: field, so src/lib/seo.t…
  - SEO-1127 · <https://carbonvalleyguide.com/events/6th-8th-orchestra-concert-2027-02-25/> · `content/carbon-valley/events/6th-8th-orchestra-concert-2027-02-25.md:5` · location.name “Thunder Valley K-8, 600 5th Street, Frederick”; address = {addressLocality: “Carbon Valley”, addressRegion: “CO”} (no streetAddress, no postalCode). The event file has venue: but no address: field, so src/lib/seo.t…
  - SEO-1128 · <https://carbonvalleyguide.com/events/6th-grade-orchestra-concert-2027-02-22/> · `content/carbon-valley/events/6th-grade-orchestra-concert-2027-02-22.md:5` · location.name “Coal Ridge Middle School, 6201 Booth Drive, Firestone”; address = {addressLocality: “Carbon Valley”, addressRegion: “CO”} (no streetAddress, no postalCode). The event file has venue: but no address: field, so src/l…
- **Why it matters:** Carbon Valley is not a postal town; Google cannot place these events.
- **Fix:** Add address: "<street>, <Frederick|Firestone>, CO <zip>" to the event file (or map the school and library venue names to their addresses once in the ingest).

#### online event marked as an in-person event

- **Instances:** 2 (2 P1). **Where:** insidelyons.com (2).
- **Worst examples:**
  - SEO-1154 · <https://insidelyons.com/events/word-wednesday-writing-group-2026-11-04/> · `src/lib/seo.ts:503` · location.name "Online, via the Lyons Regional Library" with eventAttendanceMode OfflineEventAttendanceMode and a Place in Lyons, CO
  - SEO-1155 · <https://insidelyons.com/events/word-wednesday-writing-group-2026-12-02/> · `src/lib/seo.ts:503` · location.name "Online, via the Lyons Regional Library" with eventAttendanceMode OfflineEventAttendanceMode and a Place in Lyons, CO
- **Why it matters:** Search results will show an online event as if it had a physical venue.
- **Fix:** Emit OnlineEventAttendanceMode with a VirtualLocation when the venue is online

### 6 Consistency & accuracy

#### past event page has no "passed" notice and still reads as upcoming

- **Instances:** 221 (221 P1). **Where:** insideerie.com (89), insidewindsorco.com (56), insidelyons.com (33), insideberthoud.com (28), carbonvalleyguide.com (15).
- **Worst examples:**
  - SEO-1230 · <https://carbonvalleyguide.com/events/bubble-tea-social-2026-11-16/> · `src/routes/town/events/[slug].astro:272` · Event date 2026-11-16; live 200, noindex, not in sitemap. Page shows the date, “Add to calendar” links and no ended notice; JSON-LD eventStatus EventScheduled. Reachable from the hub newsletter archive and old links.
  - SEO-1245 · <https://insideberthoud.com/events/a-little-help-service-saturday-2026-11-07/> · `src/routes/town/events/[slug].astro:243` · Page (live 200, noindex) shows "When Saturday, November 7" with no year, no past notice, and still offers "Add to calendar"; schema endDate 2026-11-07.
  - SEO-1273 · <https://insideerie.com/events/adaptive-storytime-2026-10-10/> · `src/routes/town/events/[slug].astro:243` · event ended 2026-10-10; page shows “Next Saturday, October 10” (no year), “Add to calendar” links and no notice that it has passed; noindex, live 200
- **Why it matters:** A reader arriving from search or an old email sees a date with no year, "Next" and "Add to calendar" for an event that is over.
- **Fix:** For over && !annual: label the date “Was held”, include the year, drop the calendar links and add a one-line “This event has passed — see what’s on” notice

#### external link redirects elsewhere

- **Instances:** 83 (2 P1/81 P2). **Where:** carbonvalleyguide.com (44), insidethetowns.com (28), insideniwot.com (3), insideberthoud.com (3), insideerie.com (3), insidelyons.com (2).
- **Worst examples:**
  - SEO-1220 · <https://insideniwot.com/articles/how-niwot-got-here/> · `content/niwot/articles/how-niwot-got-here.md:27` · https://www.visitlongmont.org/chief-niwot-the-story-of-left-hand-and-the-boulder-valley-curse/ -> 200 at https://www.visitlongmont.org/blog/stories/category/arts-culture-%26-history/… (a blog category listing, title "Posts in Art…
  - SEO-1221 · <https://insidethetowns.com/platteville/> · `data/hub/towns/platteville.json:51` · https://platteville.colorado.gov/pioneer-museum lands on https://platteville.colorado.gov/form/pd-citizen-concerns (a police "citizen concerns" form), linked as the Pioneer Museum
  - SEO-5270 · <https://carbonvalleyguide.com/> · `content/carbon-valley/articles/metro-districts-and-neighborhood-pools.md:18` · https://www.cvprd.com/pool-schedule -> https://www.carbonvalleyrec.gov/pool-schedule (200 after 1 redirect(s)). source_file is the first repo file that holds this URL; it may be filed in others too.
- **Why it matters:** The reader lands somewhere other than the page cited as the source.
- **Fix:** Update the link to the new address.

#### stale copy: a passed date or deadline still written as current or upcoming

- **Instances:** 35 (9 P1/26 P2). **Where:** carbonvalleyguide.com (14), insidewindsorco.com (7), insideberthoud.com (6), insideniwot.com (3), insideerie.com (2), insidelyons.com (2), insidejohnstown.com (1).
- **Worst examples:**
  - SEO-1459 · <https://carbonvalleyguide.com/get-involved/> · `content/carbon-valley/programs/carbon-valley-chamber-of-commerce.md:9` · “a monthly Business After Hours (next November 5 at 5 pm) and a Business Connectors breakfast (November 10 at 8:30)”; schedule line: “Business After Hours November 5, 5 pm; Business Connectors November 10, 8:30 am; a ribbon cutti…
  - SEO-1460 · <https://insideberthoud.com/families/> · `content/berthoud/programs/jr-spartans.md:9` · Summary: "boys' basketball for 5th to 8th grade, with tryouts on Saturday, November 14."; When: "Basketball tryouts Saturday, November 14, 9–11:30 am" (lines 9 and 12); today is Nov 17.
  - SEO-1462 · <https://insideerie.com/updates/> · `content/erie/updates/short-term-rental-permits.md:5` · Listed under Current: “Council takes up a special-event permit period for the Sundance Film Festival on November 10.” (today is Nov 17; item last verified 2026-11-10)
- **Why it matters:** Dated copy that has passed makes the page read as unmaintained.
- **Fix:** Re-read the Town page and retitle in the past/present tense (what is closed now, when it finishes).

#### Calendar export appends "Windsor, CO" to a Severance venue

- **Instances:** 30 (30 P1). **Where:** insidewindsorco.com (30).
- **Worst examples:**
  - SEO-1156 · <https://insidewindsorco.com/events/2027-town-projects-and-budget-town-hall-2026-10-13/> · `src/routes/town/events/[slug].astro:183` · Google Calendar link location="Severance Town Hall, 3 S Timber Ridge Parkway, Severance, CO 80550, Windsor, CO" (same string in the .ics LOCATION, src/routes/town/events/[slug].ics.ts:32) (noindex page)
  - SEO-1157 · <https://insidewindsorco.com/events/8th-grade-band-showcase-concert-2027-03-10/> · `src/routes/town/events/[slug].astro:183` · Google Calendar link location="Severance High School, 1200 Hidden Valley Pkwy, Severance, CO 80550, Windsor, CO" (same string in the .ics LOCATION, src/routes/town/events/[slug].ics.ts:32)
  - SEO-1158 · <https://insidewindsorco.com/events/8th-grade-orchestra-showcase-concert-2027-03-09/> · `src/routes/town/events/[slug].astro:183` · Google Calendar link location="Severance High School, 1200 Hidden Valley Pkwy, Severance, CO 80550, Windsor, CO" (same string in the .ics LOCATION, src/routes/town/events/[slug].ics.ts:32)
- **Why it matters:** The reader's calendar entry carries the wrong town.
- **Fix:** Drop the appended town when the address already names a locality; otherwise append the subTown label.

#### event remnant on a no-events guide (Niwot)

- **Instances:** 21 (15 P1/6 P2). **Where:** insideniwot.com (21).
- **Worst examples:**
  - SEO-1205 · <https://insideniwot.com/about/> · `src/pages/about.astro:72` · Fact strip shows "Upcoming listings 0" and the note "0 listings: 0 dated events and 0 weekly regulars; 0 dates in the next two weeks. Each page says which it counts."
  - SEO-1206 · <https://insideniwot.com/about/> · `src/pages/about.astro:81` · Intro says the guide covers "what’s on this week, where to eat and drink, where to walk…"
  - SEO-1207 · <https://insideniwot.com/about/> · `src/pages/about.astro:189` · Closing band: eyebrow "Coming up in Niwot", h2 "Start with what’s on", body "0 listings: 0 dated events and 0 weekly regulars in Niwot right now, from markets and live music to town meetings."; only button is Eat & drink
- **Why it matters:** Niwot is meant to carry updates and things to know only; these lines still promise or count events.
- **Fix:** Delete "The listing." or link the words to the organizer page already in sources.

#### listing or article not re-checked in over 30 days

- **Instances:** 19 (5 P1/14 P2). **Where:** insidelyons.com (11), insideniwot.com (5), insidejohnstown.com (2), insideberthoud.com (1).
- **Worst examples:**
  - SEO-1222 · <https://insidelyons.com/places/gatherings-of-a-lifetime/> · `content/lyons/places/gatherings-of-a-lifetime.md:10` · verified: "2026-09-17" (61 days before 2026-11-17); page shows "Hours Not shown: last checked 61 days ago. Call to confirm."; /editorial/ says anything 30 days without a re-check is flagged
  - SEO-5355 · <https://insideberthoud.com/events/library-book-club-the-personal-librarian-2026-12-09/> · `content/berthoud/events/library-book-club-the-personal-librarian-2026-12-09.md:12` · verified: "2026-09-18" (page: "Checked September 18, 2026"); every other upcoming listing was checked in November.
  - SEO-5356 · <https://insidejohnstown.com/places/dominics-hometown-pizza/> · `content/johnstown/places/dominics-hometown-pizza.md` · Page shows "Checked September 18, 2026" (verified: "2026-09-18"), 60 days before today; every other listing was checked between Oct 2 and Nov 11
- **Why it matters:** The site's own rule is a 30-day re-check; these are past it.
- **Fix:** Re-check against the source and update verified

#### broken external link (404/410)

- **Instances:** 13 (13 P1). **Where:** insidejohnstown.com (4), insidethetowns.com (4), carbonvalleyguide.com (1), insideerie.com (1), insidelyons.com (1), insideniwot.com (1), insidewindsorco.com (1).
- **Worst examples:**
  - SEO-1191 · <https://carbonvalleyguide.com/updates/> · `content/carbon-valley/updates/colorado-boulevard-closed-in-dacono-through-december-1.md:15` · https://www.daconoco.gov/m/newsflash/Home/Detail/2250 -> 404 (lands on https://www.daconoco.gov/404.aspx?…badlink=/m/newsflash/Home/Detail/2250); checked twice with a browser User-Agent. Anchor: “City of Dacono news: Veterans Wal…
  - SEO-1192 · <https://insideerie.com/updates/> · `content/erie/updates/short-term-rental-permits.md:12` · https://www.erieco.gov/2687/40920/Short-Term-Rentals returns 404 (“Custom404 • Erie, CO”); https://www.erieco.gov/2687/Short-Term-Rentals returns 200 “Short-Term Rentals | Erie, CO” (checked live 2026-11-17)
  - SEO-1193 · <https://insidejohnstown.com/events/les-miserables-candlelight-2026/> · `content/johnstown/events/les-miserables-candlelight-2026.md` · https://coloradocandlelight.com/show/les-miserables-johnstown-colorado/ -> 404 ("Page not found - Candlelight"); page is a past, noindex event
- **Why it matters:** A dead source link breaks the trail the site relies on for trust.
- **Fix:** Repoint to the Town Council page or drop the link when the notice is closed

#### same event listed twice (feed listing duplicates an existing listing)

- **Instances:** 6 (6 P1). **Where:** insideerie.com (6).
- **Worst examples:**
  - SEO-1453 · <https://insideerie.com/events/bluegrass-jam-live-music-2026-12-10/> · `content/erie/events/bluegrass-jam-live-music-2026-12-10.md:3` · bluegrass-jam-live-music-2026-12-10 (2026-12-10T17:00, venue “The Old Mine, 500 Briggs Street”) and bluegrass-jam-old-mine-2026-12-10 (venue “The Old Mine”, Second Thursdays) are the same 17:00 slot at The Old Mine; both are inde…
  - SEO-1454 · <https://insideerie.com/events/hoss-and-the-hangman-live-music-2026-11-25/> · `content/erie/events/hoss-and-the-hangman-live-music-2026-11-25.md:3` · hoss-and-the-hangman-live-music-2026-11-25 (2026-11-25T18:00, venue “The Old Mine, 500 Briggs Street”) and live-music-wednesdays-old-mine (venue “The Old Mine”, Wednesdays at 6) are the same 18:00 slot at The Old Mine; both are i…
  - SEO-1455 · <https://insideerie.com/events/matt-adams-live-music-2026-11-18/> · `content/erie/events/matt-adams-live-music-2026-11-18.md:3` · matt-adams-live-music-2026-11-18 (2026-11-18T18:00, venue “The Old Mine, 500 Briggs Street”) and live-music-wednesdays-old-mine (venue “The Old Mine”, Wednesdays at 6) are the same 18:00 slot at The Old Mine; both are indexable a…
- **Why it matters:** Readers see the same night twice.
- **Fix:** Merge: keep one listing per night (put the act name on the weekly listing’s date, or end the weekly series where dated feed listings exist) and retire the other slug

#### Upcoming game no longer matches MaxPreps (opponent now TBA; game link 404)

- **Instances:** 4 (4 P1). **Where:** insidewindsorco.com (4).
- **Worst examples:**
  - SEO-1187 · <https://insidewindsorco.com/sports/windsor-high/> · `data/windsor/sports-windsor-high.json:1407` · Site (read Nov 16): "Fri, Dec 11 Girls basketball vs Cherry Creek · 7:30 pm" (site: home) linking https://www.maxpreps.com/co/basketball/girls/game/cherry-creek-greenwood-village-vs-windsor/12-11-2026/?c=c35e4f71-e473-4c70-837f-d…
  - SEO-1188 · <https://insidewindsorco.com/sports/windsor-high/> · `data/windsor/sports-windsor-high.json:1414` · Site (read Nov 16): "Sat, Dec 12 Girls basketball at Cherokee Trail · 1 pm" linking https://www.maxpreps.com/co/basketball/girls/game/cherokee-trail-cougar-aurora-vs-windsor/12-12-2026/?c=311ae078-9a11-4c21-bd31-c43703493d47 whic…
  - SEO-1189 · <https://insidewindsorco.com/sports/windsor-high/girls-basketball/> · `data/windsor/sports-windsor-high.json:1407` · Site (read Nov 16): "Fri, Dec 11 Girls basketball vs Cherry Creek · 7:30 pm" (site: home) linking https://www.maxpreps.com/co/basketball/girls/game/cherry-creek-greenwood-village-vs-windsor/12-11-2026/?c=c35e4f71-e473-4c70-837f-d…
- **Why it matters:** The schedule shown is no longer what the source says.
- **Fix:** Re-run the MaxPreps read; show a TBA opponent at Cherry Creek High School rather than a home game against Cherry Creek.

#### opening listed as not announced after the ski area has opened

- **Instances:** 3 (3 P1). **Where:** insidethetowns.com (3).
- **Worst examples:**
  - SEO-1227 · <https://insidethetowns.com/outdoor-dates/> · `content/hub/traditions/pagosa-springs-wolf-creek-ski-area-opens.md:14` · page: "TBA 2026 ... Wolf Creek Ski Area opens for the season ... Not yet announced. Checked Nov 12, 2026"; wolfcreekski.com on 17 Nov: "After a great reopening weekend ... Wolf Creek Ski Area would like to thank the skiers and sn…
  - SEO-1228 · <https://insidethetowns.com/pagosa-springs/> · `content/hub/traditions/pagosa-springs-wolf-creek-ski-area-opens.md:14` · page: "TBA 2026 ... Wolf Creek Ski Area opens for the season ... Not yet announced. Checked Nov 12, 2026"; wolfcreekski.com on 17 Nov: "After a great reopening weekend ... Wolf Creek Ski Area would like to thank the skiers and sn…
  - SEO-1229 · <https://insidethetowns.com/pagosa-springs/wolf-creek-ski-area-opens/> · `content/hub/traditions/pagosa-springs-wolf-creek-ski-area-opens.md:14` · page: "TBA 2026 ... Wolf Creek Ski Area opens for the season ... Not yet announced. Checked Nov 12, 2026"; wolfcreekski.com on 17 Nov: "After a great reopening weekend ... Wolf Creek Ski Area would like to thank the skiers and sn…
- **Why it matters:** The page says an opening date is unknown when the ski area is already running.
- **Fix:** Read the opening date on wolfcreekski.com and set the 2026 year to confirmed

#### Register link goes to a closed form

- **Instances:** 1 (1 P1). **Where:** insideberthoud.com (1).
- **Worst examples:**
  - SEO-1186 · <https://insideberthoud.com/families/> · `content/berthoud/programs/jr-spartans.md:14` · Jr. Spartans "Register" -> https://forms.gle/kVCLEdAk88QatF4w8 -> 200 https://docs.google.com/forms/d/e/1FAIpQLSe3wNpDu7CnNxvuSmLcO-uWWsrulNBOr9PReOGcnG2ZppXtyg/closedform (checked live 2026-11-17).
- **Why it matters:** The call to action leads to a closed form.
- **Fix:** Remove the form link and set the listing to closed (statusUntil was 2026-11-14).

#### copy points readers to "this guide’s sports page"

- **Instances:** 1 (1 P1). **Where:** insidelyons.com (1).
- **Worst examples:**
  - SEO-1204 · <https://insidelyons.com/families/> · `content/lyons/programs/high-school-athletics.md:9` · summary: "…the scores are on this guide’s sports page."; body line 19 links [the Lions’ page here](/sports/)
- **Why it matters:** Copy points at a page the guide is not meant to have.
- **Fix:** Remove the sentence and the /sports/ link, or link MaxPreps directly

#### playoffs article says time and site are not posted; CHSAA has posted them

- **Instances:** 1 (1 P1). **Where:** insidethetowns.com (1).
- **Worst examples:**
  - SEO-1451 · <https://insidethetowns.com/articles/colorado-football-playoffs-2026/> · `content/hub/curiosity/colorado-football-playoffs-2026.md:296` · Article (updated Nov 14): "Next game: No. 8 Mesa Ridge (9-2), quarterfinal, Friday, November 20. CHSAA has not posted the time or site." and "By the evening of November 14, CHSAA had posted a kickoff time and a site for none of t…
- **Why it matters:** The article is the hub's main playoff page and it is behind the official bracket.
- **Fix:** Update the Roosevelt entry (and re-check the other nine teams still playing) with the posted kickoff time and host before Friday.

#### same event has a confirmed next date in one place and "to be announced" in another

- **Instances:** 1 (1 P1). **Where:** insideerie.com (1).
- **Worst examples:**
  - SEO-1452 · <https://insideerie.com/traditions/> · `content/hub/traditions/erie-balloon-festival.md:10` · Location 1: https://insideerie.com/traditions/ and https://insideerie.com/ ("Every year in Erie"): "Erie Balloon Festival Confirmed · Friday, July 9 to Sunday, July 11, 2027 6:00 AM · Weld County Road 5 & Colliers Pkwy · 100% FRE…
- **Why it matters:** Two pages of the same guide disagree about the same event.
- **Fix:** Confirm the 2027 dates on erieballoonfestival.com by hand, then make the event file and the tradition record agree (add the 2027 start/end to content/erie/events/erie-balloon-festival.md or drop the 2027 year from the tradition).

### 7 Internal linking

#### footer links to /sports/ on a guide with no sports

- **Instances:** 171 (171 P1). **Where:** insidelyons.com (171).
- **Worst examples:**
  - SEO-1596 · <https://insidelyons.com/> · `src/components/Footer.astro:53` · footer <a href="/sports/">Athletics</a> (added by the 14 Nov review; DECISIONS.md:10581 says the sports pages are "linked from nowhere")
  - SEO-1597 · <https://insidelyons.com/404.html> · `src/components/Footer.astro:53` · footer <a href="/sports/">Athletics</a> (added by the 14 Nov review; DECISIONS.md:10581 says the sports pages are "linked from nowhere")
  - SEO-1598 · <https://insidelyons.com/about/> · `src/components/Footer.astro:53` · footer <a href="/sports/">Athletics</a> (added by the 14 Nov review; DECISIONS.md:10581 says the sports pages are "linked from nowhere")
- **Why it matters:** Every page of the Lyons guide links to the sports pages the decision removed.
- **Fix:** Skip the sportsLabel entry in Footer.astro when town.lead === 'outdoors'

#### "Read the last issue" link is three weeks old (newer issues filed under the old Frederick slug)

- **Instances:** 128 (128 P1). **Where:** carbonvalleyguide.com (128).
- **Worst examples:**
  - SEO-1468 · <https://carbonvalleyguide.com/> · `src/components/NewsletterSignup.astro:158` · Link text “Read the October 29 issue” -> https://insidethetowns.com/newsletter/2026-10-29-carbon-valley/ . The 5 and 12 November issues exist as content/hub/issues/2026-11-05-frederick.md and 2026-11-12-frederick.md with towns: […
  - SEO-1469 · <https://carbonvalleyguide.com/articles/explore-frederick-in-walking-order/> · `src/components/NewsletterSignup.astro:158` · Link text “Read the October 29 issue” -> https://insidethetowns.com/newsletter/2026-10-29-carbon-valley/ . The 5 and 12 November issues exist as content/hub/issues/2026-11-05-frederick.md and 2026-11-12-frederick.md with towns: […
  - SEO-1470 · <https://carbonvalleyguide.com/articles/frederick-history/> · `src/components/NewsletterSignup.astro:158` · Link text “Read the October 29 issue” -> https://insidethetowns.com/newsletter/2026-10-29-carbon-valley/ . The 5 and 12 November issues exist as content/hub/issues/2026-11-05-frederick.md and 2026-11-12-frederick.md with towns: […
- **Why it matters:** 128 pages point readers to an old issue while two newer ones exist.
- **Fix:** Retag the two November issues (towns: [carbon-valley]) or teach latestIssueFor the frederick -> carbon-valley alias, so the link shows the 12 November issue.

### 9 Search Console

#### retired events URL redirects to the home page while Google still ranks it

- **Instances:** 57 (57 P1). **Where:** insideniwot.com (57).
- **Worst examples:**
  - SEO-1838 · <https://insideniwot.com/events/> · `vercel.json:1502` · live 308 -> https://insideniwot.com/ (curl 2026-11-17); Search Console 28 days 2026-10-18..2026-11-14: 258 impressions, 5 clicks, position 11.2; URL Inspection: Page with redirect
  - SEO-1839 · <https://insideniwot.com/events/a-dance-for-wildlife-2026-12-06/> · `vercel.json:1513` · live 308 -> https://insideniwot.com/ (curl 2026-11-17); Search Console 28 days 2026-10-18..2026-11-14: 2 impressions, 0 clicks, position 3.0
  - SEO-1840 · <https://insideniwot.com/events/artist-in-residence-open-house-gail-denton-2026-10-15/> · `vercel.json:1513` · live 308 -> https://insideniwot.com/ (curl 2026-11-17); Search Console 28 days 2026-10-18..2026-11-14: 2 impressions, 0 clicks, position 47.5
- **Why it matters:** 62 of Niwot's 101 clicks in the window came from these addresses; they now land on the home page.
- **Fix:** Keep the decision; send the annual-event addresses (Great Pumpkin Party, Holiday Parade, Enchanted Evening, Niwot Trot) to their row on /traditions/ rather than /, so the redirect lands on matching content

#### sitemap URL not indexed: URL is unknown to Google

- **Instances:** 31 (17 P1/14 P2). **Where:** insideberthoud.com (12), insidethetowns.com (8), insideerie.com (5), insideniwot.com (4), insidelyons.com (2).
- **Worst examples:**
  - SEO-1909 · <https://insideberthoud.com/events/trick-or-treat-street/> · `content/berthoud/events/trick-or-treat-street.md` · URL Inspection API 2026-11-17: "URL is unknown to Google"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
  - SEO-1914 · <https://insideerie.com/events/erie-town-fair/> · `content/erie/events/erie-town-fair.md` · URL Inspection API 2026-11-17: "URL is unknown to Google"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
  - SEO-1916 · <https://insidelyons.com/stay/> · `src/routes/town/places-by-type.astro` · URL Inspection API 2026-11-17: "URL is unknown to Google"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
- **Why it matters:** Google has not found pages the sitemap lists.
- **Fix:** Link it from an indexed page in body text (not only the menu or footer) and request indexing in Search Console; the page itself has no blocker

#### page-one impressions, almost no clicks

- **Instances:** 29 (29 P1). **Where:** insideberthoud.com (10), insidejohnstown.com (7), insideniwot.com (6), insidelyons.com (5), insideerie.com (1).
- **Worst examples:**
  - SEO-1809 · <https://insideberthoud.com/articles/berthoud-history/> · `content/berthoud/articles/berthoud-history.md` · Search Console 28 days 2026-10-18..2026-11-14: 123 impressions, 0 clicks, CTR 0.0%, average position 10.4; live title: "History of Berthoud: the town that moved uphill"
  - SEO-1819 · <https://insideerie.com/places/county-line-wine-and-spirits/> · `content/erie/places/county-line-wine-and-spirits.md` · Search Console 28 days 2026-10-18..2026-11-14: 199 impressions, 0 clicks, CTR 0.0%, average position 7.7; live title: "County Line Wine & Spirits — Shop in Erie, CO | Inside Erie"
  - SEO-1820 · <https://insidejohnstown.com/eat-drink/> · `src/routes/town/eat-drink.astro` · Search Console 28 days 2026-10-18..2026-11-14: 980 impressions, 6 clicks, CTR 0.6%, average position 10.8; live title: "Restaurants in Johnstown, CO: 9 picks to start with"
- **Why it matters:** The page ranks but the title and description are not earning the click.
- **Fix:** Rewrite the title and description to answer the search (what it is, where, the one fact people want: hours, date, price); for a business-name search expect a low ceiling

#### folded-guide URL with impressions now redirects to a hub town page

- **Instances:** 13 (13 P1). **Where:** insidegolden.com (4), insideestespark.com (3), insidelongmontco.com (2), insideevergreenco.com (1), insidefortlupton.com (1), insidegrandlake.com (1), insidemanitousprings.com (1).
- **Worst examples:**
  - SEO-1786 · <https://insideestespark.com/events/crystal-ball-2026-12-31/> · `vercel.json` · Search Console 28 days 2026-10-18..2026-11-14: 203 impressions, 7 clicks, position 6.4; live 308 -> https://insidethetowns.com/estes-park/crystal-ball/
  - SEO-1789 · <https://insideevergreenco.com/articles/evergreen-history/> · `vercel.json` · Search Console 28 days 2026-10-18..2026-11-14: 179 impressions, 3 clicks, position 8.3; live 308 -> (not fetched)
  - SEO-1790 · <https://insidefortlupton.com/places/pearson-park/> · `vercel.json` · Search Console 28 days 2026-10-18..2026-11-14: 283 impressions, 2 clicks, position 6.8; live 308 -> https://insidethetowns.com/fort-lupton/
- **Why it matters:** Place, sport and one-off event addresses with impressions now land on a general town page.
- **Fix:** Listed so the weekly read can check whether the hub destination takes over the query; a redirect to a page without the matching content is usually dropped as a soft 404

#### sitemap URL not indexed: Discovered - currently not indexed

- **Instances:** 11 (10 P1/1 P2). **Where:** insidethetowns.com (6), insideberthoud.com (2), insideniwot.com (2), insideerie.com (1).
- **Worst examples:**
  - SEO-1899 · <https://insideberthoud.com/bars-breweries/> · `src/routes/town/places-by-type.astro` · URL Inspection API 2026-11-17: "Discovered - currently not indexed"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
  - SEO-1901 · <https://insideerie.com/articles/erie-history/> · `content/erie/articles/erie-history.md` · URL Inspection API 2026-11-17: "Discovered - currently not indexed"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
  - SEO-1902 · <https://insideniwot.com/services/> · `src/routes/town/places-by-type.astro` · URL Inspection API 2026-11-17: "Discovered - currently not indexed"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
- **Why it matters:** Google knows the address and has chosen not to crawl it yet, usually a sign of thin or low-priority pages.
- **Fix:** Link it from an indexed page in body text (not only the menu or footer) and request indexing in Search Console; the page itself has no blocker

#### dated annual-event URL still holds the ranking; its replacement stub is a 200 noindex page, not a redirect

- **Instances:** 10 (10 P1). **Where:** insideerie.com (4), insideberthoud.com (2), insidejohnstown.com (2), insidelyons.com (2).
- **Worst examples:**
  - SEO-1767 · <https://insideberthoud.com/events/a-very-merry-berthoud-2026/> · `content/berthoud/events/a-very-merry-berthoud.md:4` · dated URL: 223 impressions, 0 clicks, position 7.1; permanent URL /events/a-very-merry-berthoud/: 51 impressions, 2 clicks (28 days 2026-10-18..2026-11-14); dated URL live status 200 with meta robots "noindex" and canonical ['htt…
  - SEO-1769 · <https://insideerie.com/events/boo-on-briggs-street-2026/> · `content/erie/events/boo-on-briggs-street.md:4` · dated URL: 1049 impressions, 5 clicks, position 6.4; permanent URL /events/boo-on-briggs-street/: 3 impressions, 0 clicks (28 days 2026-10-18..2026-11-14); dated URL live status 200 with meta robots "noindex" and canonical ['http…
  - SEO-1773 · <https://insidejohnstown.com/events/johnstown-jingle-2026/> · `content/johnstown/events/johnstown-jingle.md:4` · dated URL: 148 impressions, 3 clicks, position 5.3; permanent URL /events/johnstown-jingle/: 3 impressions, 0 clicks (28 days 2026-10-18..2026-11-14); dated URL live status 200 with meta robots "noindex" and canonical ['https://i…
- **Why it matters:** The permanent event pages are not inheriting the dated pages' rankings; three are December events.
- **Fix:** Serve former slugs as HTTP 308 (a vercel.json rule per formerSlugs entry, as /events/trick-or-treat-street-2026/ already is on insideberthoud.com) and drop noindex from the stub, so Google passes the dated URL's ranking to the permanent page

#### folded guide still earns search traffic that its hub town page has not picked up

- **Instances:** 9 (9 P1). **Where:** insideestespark.com (1), insideevergreenco.com (1), insidefortlupton.com (1), insidegolden.com (1), insidegrandlake.com (1), insidelafayette.com (1), insidelongmontco.com (1), insidelovelandco.com (1), insidemanitousprings.com (1).
- **Worst examples:**
  - SEO-1777 · <https://insideestespark.com/> · `src/lib/fold.ts` · insideestespark.com property, 28 days 2026-10-18..2026-11-14: 91 clicks, 5731 impressions (previous 28 days: 39 clicks, 1634 impressions); every URL now 308s to https://insidethetowns.com/estes-park/ or a section of it; that hub…
  - SEO-1778 · <https://insideevergreenco.com/> · `src/lib/fold.ts` · insideevergreenco.com property, 28 days 2026-10-18..2026-11-14: 24 clicks, 2378 impressions (previous 28 days: 1 clicks, 113 impressions); every URL now 308s to https://insidethetowns.com/evergreen/ or a section of it; that hub p…
  - SEO-1779 · <https://insidefortlupton.com/> · `src/lib/fold.ts` · insidefortlupton.com property, 28 days 2026-10-18..2026-11-14: 5 clicks, 1148 impressions (previous 28 days: 8 clicks, 564 impressions); every URL now 308s to https://insidethetowns.com/fort-lupton/ or a section of it; that hub p…
- **Why it matters:** Nine folded guides held 60% of measured clicks; the hub held 10.
- **Fix:** Nothing to undo; re-read both properties weekly. Where a folded URL had real demand (a place, a sport, a dated event with no hub page), decide whether the hub page should carry that content or the loss is accepted

#### home page averages below page one

- **Instances:** 5 (5 P1). **Where:** insideberthoud.com (1), insideerie.com (1), insidejohnstown.com (1), insidelyons.com (1), insideniwot.com (1).
- **Worst examples:**
  - SEO-1799 · <https://insideberthoud.com/> · `src/routes/town/index.astro` · Search Console 28 days 2026-10-18..2026-11-14: 154 impressions, 12 clicks, average position 20.2; live title: "Berthoud, CO events this weekend & things to do"
  - SEO-1800 · <https://insideerie.com/> · `src/routes/town/index.astro` · Search Console 28 days 2026-10-18..2026-11-14: 76 impressions, 3 clicks, average position 10.4; live title: "Erie, Colorado events this weekend & things to do"
  - SEO-1801 · <https://insidejohnstown.com/> · `src/routes/town/index.astro` · Search Console 28 days 2026-10-18..2026-11-14: 203 impressions, 1 clicks, average position 14.0; live title: "Johnstown, Colorado events this weekend & things to do"
- **Why it matters:** The home page is not on page one for its own town's queries.
- **Fix:** The home page is competing on the bare town name against the town government; earn it with links (docs/BACKLINKS.md) rather than title changes

#### kind page outranked by the section page it was built to replace

- **Instances:** 5 (5 P1). **Where:** insideberthoud.com (1), insideerie.com (1), insidejohnstown.com (1), insidelyons.com (1), insideniwot.com (1).
- **Worst examples:**
  - SEO-1804 · <https://insideberthoud.com/restaurants/> · `src/routes/town/places-by-type.astro` · /eat-drink/: 214 impressions, 4 clicks, position 21.3; /restaurants/: no impressions (URL Inspection: URL is unknown to Google) (28 days 2026-10-18..2026-11-14)
  - SEO-1805 · <https://insideerie.com/restaurants/> · `src/routes/town/places-by-type.astro` · /eat-drink/: 317 impressions, 3 clicks, position 29.6; /restaurants/: 6 impressions, 0 clicks, position 38.8 (28 days 2026-10-18..2026-11-14)
  - SEO-1806 · <https://insidejohnstown.com/restaurants/> · `src/routes/town/places-by-type.astro` · /eat-drink/: 980 impressions, 6 clicks, position 10.8; /restaurants/: 41 impressions, 0 clicks, position 27.5 (28 days 2026-10-18..2026-11-14); query "johnstown restaurants" is served by /eat-drink/ (77 impressions, 1 click, posi…
- **Why it matters:** /restaurants/ was built to rank for restaurant queries and /eat-drink/ still outranks it.
- **Fix:** docs/SEARCH-VISIBILITY.md (Phase 5) names this test: give /restaurants/ an opening paragraph and the articles that mention the kind, and link to it in body text from /eat-drink/ and the home page

#### sitemap URL Google still holds as noindex from an old crawl

- **Instances:** 3 (3 P1). **Where:** insidejohnstown.com (2), insidelyons.com (1).
- **Worst examples:**
  - SEO-1895 · <https://insidejohnstown.com/events/babytime-library/> · `content/johnstown/events/babytime-library.md` · URL Inspection API 2026-11-17: "Excluded by 'noindex' tag", last crawl 2026-09-30; the live page is 200 with no robots meta and is in the sitemap
  - SEO-1897 · <https://insidelyons.com/events/open-bluegrass-pickn-mainstage/> · `content/lyons/events/open-bluegrass-pickn-mainstage.md` · URL Inspection API 2026-11-17: "Excluded by 'noindex' tag", last crawl 2026-09-30; the live page is 200 with no robots meta and is in the sitemap
  - SEO-1896 · <https://insidejohnstown.com/events/music-and-movement-storytime/> · `content/johnstown/events/music-and-movement-storytime.md` · URL Inspection API 2026-11-17: "Excluded by 'noindex' tag", last crawl 2026-10-01; the live page is 200 with no robots meta and is in the sitemap
- **Why it matters:** Google's copy of the page is an old noindex version.
- **Fix:** Request indexing in Search Console so Google recrawls; it has not fetched the page since the noindex came off

#### sitemap URL not indexed: Crawled - currently not indexed

- **Instances:** 1 (1 P1). **Where:** insidejohnstown.com (1).
- **Worst examples:**
  - SEO-1898 · <https://insidejohnstown.com/events/cemetery-crawl/> · `content/johnstown/events/cemetery-crawl.md` · URL Inspection API 2026-11-17: "Crawled - currently not indexed"; in the live sitemap; live 200, indexable, canonical self; 0 impressions in 28 days 2026-10-18..2026-11-14
- **Why it matters:** Google crawled the page and declined to index it.
- **Fix:** Link it from an indexed page in body text (not only the menu or footer) and request indexing in Search Console; the page itself has no blocker

## P2: polish

One line per issue type; every instance is in the CSV.

### 1 Inventory & indexing

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| event file excluded from the build (source not re-read in 30 days) | 8 | 1 | SEO-1929 <https://insidelyons.com/events/art-opening-at-mainstage-brewing-2026-11-06/> `content/lyons/events/art-opening-at-mainstage-brewing-2026-11-06.md` | Re-read the Lyons Recorder calendar or the venue, then re-verify or retire the file |
| sports page in the on-site search index | 6 | 1 | SEO-1939 <https://insidelyons.com/sports/> `src/routes/town/sports.astro` | Add data-pagefind-ignore to the sports routes on an outdoors-led guide, or stop building them |
| Lyons email edition still carries school sports | 3 | 1 | SEO-1926 <https://insidethetowns.com/newsletter/2026-10-29-lyons/> `scripts/newsletter.ts:173` | Skip townSportsWeek/townGames when town.lead === 'outdoors' before the 19 Nov send |
| hub statewide season page omits an event a network guide carries | 2 | 1 | SEO-1937 <https://insidethetowns.com/turkey-trots/> `content/windsor/events/windsor-turkey-trot.md` | Add a turkey-trot tradition record for it so the hub page and the guide /traditions/ page list and link it. |

### 2 Technical

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| old address without trailing slash takes two hops (slash added first, then the rule) | 418 | 9 | SEO-2140 <https://carbonvalleyguide.com/articles/carbon-valley-history> `vercel.json:3779` | Low value: accept, or note that the `{/}?` in each source never matches because Vercel applies trailingSlash before redirects |
| Google Calendar link repeats the town and state in the location | 73 | 1 | SEO-1982 <https://insidelyons.com/events/art-4-art-trading-cards-2026-11-21/> `src/routes/town/events/[slug].astro:183` | Append `${town.name}, CO` only when data.address does not already contain it |
| http or www variant takes two or more hops | 67 | 1 | SEO-2073 <http://explorelyons.com/> `vercel.json` | Platform behaviour (Vercel upgrades to https before applying rules); accept |
| /sitemap.xml redirect is temporary (307) | 29 | 9 | SEO-1953 <https://carbonvalleyguide.com/sitemap.xml> `vercel.json:100` | Set "permanent": true on the /sitemap.xml rule |
| path with a matching page on the new guide is sent to the home page | 22 | 1 | SEO-2571 <https://townofniwot.com/about/> `docs/REDIRECTS.md:9` | In the cityofniwot.com repo vercel.json, send /about/ to https://insideniwot.com/about/ (or pass every path through and let insideniwot.com answer) |
| sitemap lastmod is the build time on a page with no content date | 20 | 2 | SEO-2615 <https://insidejohnstown.com/about/> `astro.config.mjs` | Give static pages a real last-changed date or omit lastmod for them |
| redirect chain of two hops across domains | 18 | 1 | SEO-2597 <https://explorelyons.com/civic/> `vercel.json:171` | Add a rule scoped to host explorelyons.com (and www) in vercel.json sending /civic/ straight to the final address, ahead of the domain-level redirect… |
| /index.html answers 200 as a duplicate of the directory URL | 8 | 8 | SEO-1945 <https://carbonvalleyguide.com/index.html> `vercel.json` | Optional: one rule "/:path*/index.html" -> "/:path*/" and "/index.html" -> "/"; the canonical already handles it |
| upper-case path answers 404 (no redirect to the lower-case URL) | 8 | 8 | SEO-2640 <https://carbonvalleyguide.com/ARTICLES/EXPLORE-FREDERICK-IN-WALKING-ORDER/> `vercel.json` | Accept (Vercel paths are case-sensitive) unless Search Console shows upper-case links |
| built redirect page and vercel.json rule disagree on the destination | 6 | 3 | SEO-2062 <https://insidejohnstown.com/events/messy-art/> `vercel.json:1458` | Keep one source of truth: drop the vercel.json rule or the formerSlugs/redirects entry so the two cannot drift |
| owned domain does not resolve (no DNS record), so its redirect rules are never served | 6 | 1 | SEO-2565 <https://insidebuenavista.com/> `vercel.json:5726` | Add insidebuenavista.com and www.insidebuenavista.com to the insidethetowns Vercel project and create the A/CNAME records at Cloudflare |
| RSS feed links to noindex page | 5 | 1 | SEO-2055 <https://insidejohnstown.com/events.rss> `src/routes/town/events.rss.ts` | Either point feed items for later occurrences at the series' indexed page or accept it |
| docs/REDIRECTS.md out of date with what is live | 5 | 1 | SEO-2068 <https://explorelyons.com/> `docs/REDIRECTS.md:10` | Rewrite the explorelyons.com row to match DEPLOY.md and what is live |
| unknown path on a retired domain is passed through to a 404 | 5 | 1 | SEO-2635 <https://explorelyons.com/zz-audit-check/no-such-page-7431/> `docs/REDIRECTS.md:10` | Leave (documented) or add a catch-all to the home page for paths insidelyons.com does not have |
| redirect chain of two hops | 4 | 1 | SEO-2593 <http://www.insidethetowns.com/> `vercel.json` | Domain-level setting in Vercel: send http://www straight to https://apex (low value; Google follows both hops) |
| Redirect takes two hops | 2 | 2 | SEO-2060 <https://insideseverance.com/articles/severance-history> `vercel.json` | Acceptable; could be one hop by redirecting the www host and slash-less paths directly. |

### 3 On-page

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| meta description cut off mid-sentence with an ellipsis | 207 | 3 | SEO-2729 <https://insideerie.com/articles/erie-history/> `content/erie/articles/erie-history.md` | Write a description of 150 characters or fewer that ends on a full sentence (or cut at the last sentence boundary instead of mid-clause) |
| title over 65 characters | 42 | 8 | SEO-3079 <https://carbonvalleyguide.com/events/centennial-state-ballet-excerpts-from-the-nutcracker-2026-12-05/> `content/carbon-valley/events/centennial-state-ballet-excerpts-from-the-nutcracker-2026-12-05.md:2` | Add a shorter seoTitle to the event file. |
| event meta description appends the guide name after the real town | 24 | 1 | SEO-2693 <https://carbonvalleyguide.com/events/6th-8th-band-concert-2027-02-18/> `src/lib/seo.ts:121` | Skip the “, <guide name>” suffix when the venue line already ends in a town, or use the address’s town. |
| boilerplate page near-identical across network domains | 23 | 8 | SEO-2667 <https://carbonvalleyguide.com/editorial/> `src/pages/editorial.astro` | Low risk, but either canonicalise the guide copies to the hub page or noindex them; keep one indexable copy. |
| sports trim uses the guide accent, not the school's second colour | 22 | 3 | SEO-2975 <https://carbonvalleyguide.com/sports/> `src/routes/town/sports.astro:133` | Set --town-accent to the school’s secondary inside the sports wrapper (as --color-primary is set), checking contrast for the tie pill. |
| thin place page | 22 | 2 | SEO-3047 <https://insidejohnstown.com/places/bad-daddys-burger-bar/> `content/johnstown/places/bad-daddys-burger-bar.md` | Add 2-3 sentences a local would know (what to order, parking, what the playground has) and a photo |
| "More in Windsor" heading on a Severance place page | 17 | 1 | SEO-2648 <https://insidewindsorco.com/places/blue-spruce-park/> `src/routes/town/places/[slug].astro:442` | Use the guide's coverage name ("More in Windsor and Severance") or the listing's own town. |
| meta description template leaves "Daily" capitalised mid-sentence | 14 | 1 | SEO-2942 <https://insidejohnstown.com/places/clearview-park/> `src/routes/town/places/[slug].astro` | Lower-case the hours string when it is spliced into the sentence |
| sports meta description out of season ("Regular season complete", "this winter") | 9 | 4 | SEO-2966 <https://carbonvalleyguide.com/sports/> `src/routes/town/sports.astro:72` | Say “this school year” or split fall results from winter schedules. |
| thin town page: two events of its own | 9 | 1 | SEO-3069 <https://insidethetowns.com/cedaredge/> `src/config/hub-towns.ts:327` | Add the town's other annual events to content/hub/traditions/ |
| title prefixes the town to a name that starts with another place or article | 9 | 1 | SEO-3121 <https://insidethetowns.com/buena-vista/parade-of-lights/> `src/lib/titles.ts:325` | Join with a separator or reorder ("Loveland Ski Area opening day 2027, Georgetown") when the record name does not carry the town |
| mislabelled heading: "Coming up in Niwot" over an updates link | 8 | 1 | SEO-2956 <https://insideniwot.com/articles/2026-incorporation-election/> `src/components/ArticleStrip.astro:64` | Heading "What’s new in Niwot" (or drop the heading) when lead is "updates". |
| indexable page titled with a retired guide brand | 7 | 1 | SEO-2722 <https://insidethetowns.com/newsletter/2026-10-22-idaho-springs/> `content/hub/issues/2026-10-22-idaho-springs.md:2` | Decide whether archived issues of retired guides stay indexable; if they do, relabel them (e.g. "Frederick edition") and repoint their links. |
| filler meta description | 4 | 1 | SEO-2717 <https://insideberthoud.com/places/arcana-house/> `src/routes/town/places/[slug].astro` | Build the description from the place summary when there are no hours to state. |
| meta description reads ungrammatically (“is open” + free-text hours note) | 4 | 1 | SEO-2938 <https://carbonvalleyguide.com/places/bulrush-open-space/> `src/lib/seo.ts:262` | When the hours value is a note rather than a day range, write “Hours: <note>” or lower-case and rephrase. |
| event filed under the Sports category (pinball) | 2 | 1 | SEO-2691 <https://insidelyons.com/events/fall-pinball-league/> `content/lyons/events/fall-pinball-league.md:9` | Owner call: refile pinball under another category if no Sports label should appear on Lyons |
| template copy says “this town” on a three-town guide | 2 | 1 | SEO-2997 <https://carbonvalleyguide.com/traditions/> `src/routes/town/traditions.astro:119` | Use the guide’s name (“The events Carbon Valley’s towns hold every year”). |
| Estes Park page splits its dates between the town and the national park | 1 | 1 | SEO-2665 <https://insidethetowns.com/estes-park/> `src/config/hub-towns.ts:237` | Owner to judge against "focuses on what the town offers"; the town events do lead |
| Sports index copy calls both schools Windsor's and implies a calendar check that neither school has | 1 | 1 | SEO-2666 <https://insidewindsorco.com/sports/> `src/routes/town/sports-index.astro:39` | Say "Windsor and Severance" where the guide follows schools in two towns, and drop the calendar clause when no school has a calendar. |
| canceled event shows a "TBA 2026" date badge | 1 | 1 | SEO-2690 <https://insidethetowns.com/wellington/parade-of-lights/> `src/routes/hub/event.astro` | Show "Canceled" in the badge when the year is canceled and has no date |
| home title leads with events, not the outdoors | 1 | 1 | SEO-2721 <https://insidelyons.com/> `src/config/towns/lyons.ts:15` | Rewrite seoTagline around trails, the river and parks |
| meta description leads with a start date that has passed | 1 | 1 | SEO-2936 <https://insidethetowns.com/georgetown/> `src/lib/hub-towns.ts:225` | For a run in progress, give the range or "through December 24" instead of the start date |
| meta description names things the page does not list | 1 | 1 | SEO-2937 <https://carbonvalleyguide.com/services/> `src/lib/place-types.ts:112` | Build the examples from the page’s own listings. |
| same heading repeated 9 times | 1 | 1 | SEO-2964 <https://insidejohnstown.com/> `src/routes/town/index.astro` | Render the heading once outside the variants, or mark hidden variants so only one heading is exposed |
| seasonal hours text repeats itself | 1 | 1 | SEO-2965 <https://insidelyons.com/places/lyons-redstone-museum/> `content/lyons/places/lyons-redstone-museum.md:8` | Print the season once |
| time note split at its first comma on desktop | 1 | 1 | SEO-3078 <https://insideerie.com/this-weekend/> `src/components/EventCard.astro:88` | Do not split a timeNote that is a list of times; keep the whole note in one place |

### 4 Photos & images

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| event page has no photo | 173 | 5 | SEO-3135 <https://insideberthoud.com/events/a-very-merry-berthoud/> `content/berthoud/events/a-very-merry-berthoud.md` | Add an image to the event, or a photo to the venue's place page so its events inherit it. |
| share image falls back to the generic town photo or a text card (page has no photo of its own) | 152 | 7 | SEO-3543 <https://carbonvalleyguide.com/eat-drink/> `src/components/PlaceDirectory.astro:63` | Any one photographed restaurant, cafe or the brewery (Gabe’s Cafe, Georgia Boys or Mirror Image) so the page has a lead card |
| image candidate over 300 KB as served | 132 | 8 | SEO-3310 <https://carbonvalleyguide.com/> `src/config/towns/carbon-valley.ts:111` | Lower the WebP quality for the two widest hero candidates or cap the widest at 2000px. |
| img src fallback is the full-size original | 67 | 2 | SEO-3442 <https://insideerie.com/> `src/components/Hero.astro` | Point src at the 1280w or 1920w rendition rather than the original |
| img width/height attributes do not match the file | 16 | 1 | SEO-3509 <https://insidejohnstown.com/events/planning-and-zoning-commission-work-session-2026-12-09/> `content/johnstown/images/town-hall.jpg` | Pass the real aspect ratio (or crop with fit=cover) so the reserved box matches; replace the 588px Masonic Temple scan with a larger original |
| licence row has no source URL and no permissions record | 5 | 1 | SEO-3525 <https://insideberthoud.com/credits/> `IMAGE_LICENSES.csv:87` | Add a Town of Berthoud section to PERMISSIONS.md with the date, sender and scope of the email. |
| photo provenance vague: no photographer or rights holder named | 4 | 1 | SEO-3533 <https://insideniwot.com/places/cimminis/> `IMAGE_LICENSES.csv` | Record who took each photo and who granted use (name, date); reverse-image-search the four to rule out further third-party originals. |
| same photo used twice (two pages or twice on one page) | 4 | 3 | SEO-3539 <https://carbonvalleyguide.com/articles/frederick-with-kids/> `content/carbon-valley/articles/frederick-with-kids.md:6` | Give the article its own photo (rec center lazy river or the skate park). |
| credit line prints raw Commons markup | 3 | 1 | SEO-3131 <https://insidethetowns.com/credits/> `IMAGE_LICENSES.csv:360` | Write the author in the ledger as "Michael Greiner; derivative by Nesnad" |
| og:image smaller than its declared 1200x630 | 2 | 2 | SEO-3530 <https://insideerie.com/places/anderson-farms/> `content/erie/images/anderson-farms.jpg` | Source a wider Anderson Farms photo (owner-supplied) or emit the true width |
| photograph shown but not listed on /credits/ | 2 | 1 | SEO-3537 <https://insidethetowns.com/articles/creede-repertory-theatre-history/> `src/lib/photo-credits.ts:33` | Same fix as the Leadville article |
| article lead photo does not show the article’s subject | 1 | 1 | SEO-3130 <https://insideerie.com/articles/breakfast-in-erie/> `content/erie/articles/breakfast-in-erie.md:6` | Replace with a breakfast photograph once one is permitted |
| credits page shows no change note for resized Commons renditions | 1 | 1 | SEO-3134 <https://insidethetowns.com/credits/> `src/lib/credits.ts:101` | Treat "rendition" as resized in changesFrom() |
| hero photograph carries burned-in text | 1 | 1 | SEO-3308 <https://insidethetowns.com/paonia/> `content/hub/images/paonia.jpg` | Crop the caption out (note "cropped" in the ledger row, IMAGE_LICENSES.csv:338) or choose another frame |
| hero source narrower than the band it fills | 1 | 1 | SEO-3309 <https://insidethetowns.com/longmont/> `content/longmont/images/main-street-at-third-avenue.jpg` | Fetch the Commons original (File:Longmont_Colorado.JPG) at 1920 px or wider |
| photo credit differs between the page and the credits record | 1 | 1 | SEO-3532 <https://insideberthoud.com/> `src/config/towns/berthoud.ts:57` | Use one credit line in both places (the licence asks for the iStock.com/<contributor> form beside the photo). |

### 5 Structured data

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| Event schema missing recommended fields (endDate, image, offers, organizer, performer) | 433 | 6 | SEO-4083 <https://carbonvalleyguide.com/events/6th-8th-band-concert-2027-02-18/> `content/carbon-valley/events/6th-8th-band-concert-2027-02-18.md` | Give the event or its venue listing a photograph; school venues (Frederick High, Coal Ridge MS, Thunder Valley K-8) have no place listing to borrow f… |
| Organization areaServed does not match the towns the guide covers | 371 | 2 | SEO-4520 <https://carbonvalleyguide.com/> `src/lib/seo.ts:391` | Emit areaServed as an array of City nodes from the towns the guide covers (Frederick, Firestone, Dacono; Windsor, Severance). |
| Place schema missing recommended fields (postalCode, geo, image, telephone) | 343 | 7 | SEO-4891 <https://carbonvalleyguide.com/places/acupuncture-and-natural-medicine-center/> `src/lib/seo.ts` | Emit geo from data/carbon-valley/place-map.json, which already holds each place’s coordinates for the street map. |
| Event schema location has no (or an unparsed) street address | 335 | 6 | SEO-3748 <https://carbonvalleyguide.com/events/carbon-valley-holiday-festival-2026-12-05/> `content/carbon-valley/events/carbon-valley-holiday-festival-2026-12-05.md:6` | Write the address as "170 Grant Ave, Firestone, CO 80520". |
| sports page has no SportsTeam or SportsEvent schema | 10 | 2 | SEO-5243 <https://carbonvalleyguide.com/sports/> `src/routes/town/sports.astro` | Add SportsTeam for the school and SportsEvent items for upcoming games (startDate with offset, homeTeam/awayTeam, location). |
| Static page has no BreadcrumbList or page-level schema | 7 | 1 | SEO-5234 <https://insidewindsorco.com/about/> `src/pages/about.astro` | Add a two-step BreadcrumbList (and WebPage/AboutPage/ContactPage where it fits). |
| ItemList entry points to a noindex page | 4 | 1 | SEO-4516 <https://insideerie.com/events/> `src/routes/town/events/index.astro` | List the series’ canonical occurrence URL in the ItemList, or drop noindex entries from it |
| Article schema has no dateModified | 3 | 2 | SEO-3698 <https://insidejohnstown.com/articles/two-counties-two-fire-districts/> `content/johnstown/articles/two-counties-two-fire-districts.md` | Emit dateModified = datePublished when no update date is set |
| @type EventVenue on a place that is not an event venue | 2 | 1 | SEO-3695 <https://insideniwot.com/places/gateway-sculpture/> `src/lib/seo.ts:742` | Map to TouristAttraction/LandmarksOrHistoricalBuildings via a tag, or retype the place. |
| dated free-admission day has no Event JSON-LD | 2 | 1 | SEO-5241 <https://insidethetowns.com/boulder/museum-of-boulder-holiday-art-fair-free-admission/> `src/lib/seo.ts:827` | A museum free day is an event people attend: allow type free-day (with a place) through traditionEventJsonLd |
| Article headline over 110 characters | 1 | 1 | SEO-3697 <https://carbonvalleyguide.com/articles/frederick-with-kids/> `content/carbon-valley/articles/frederick-with-kids.md:2` | Use the seoTitle (“Frederick with kids: lazy river, skate park, storytimes”) as the schema headline. |
| Breadcrumb repeats the same name | 1 | 1 | SEO-3747 <https://insidewindsorco.com/windsor/> `src/routes/town/sub-town/[subTown].astro` | Name the first crumb "Inside Windsor" (or the second "Windsor town page"). |

### 6 Consistency & accuracy

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| place shows "Hours unknown" | 14 | 2 | SEO-5369 <https://insideberthoud.com/places/arcana-house/> `content/berthoud/places/arcana-house.md` | Suppress the row for outdoor features; otherwise get hours from the business. |
| Organizer link has a stray trailing quote | 5 | 1 | SEO-5253 <https://insidewindsorco.com/events/shs-musical-les-miserables-2026-11-19/> `content/windsor/events/shs-musical-les-miserables-2026-11-19.md:7` | Strip the trailing \" from `url` and `source` in the four Les Misérables files (importer bug: escaped quote from the feed). |
| finished season shown as "nothing scheduled yet" | 4 | 3 | SEO-5351 <https://insideberthoud.com/sports/volleyball/> `src/lib/school-sports.ts:412` | Treat a team as finished once its sport's state championship end date (SportConfig.state.to) has passed, without waiting out SEASON_OVER_DAYS. |
| same address shown with two ZIP codes | 3 | 2 | SEO-5383 <https://carbonvalleyguide.com/events/holiday-food-drive-2026-11-21/> `content/carbon-valley/events/holiday-food-drive-2026-11-21.md:6` | Confirm the ZIP on King Soopers’ store page and make both files agree. |
| school primary colour differs between two config files | 3 | 3 | SEO-5386 <https://insideerie.com/sports/> `src/config/school-sports.ts:516` | Keep one source for a school's colour (derive SchoolSports.colors from TownConfig.school, or the reverse) and note any contrast-driven shade as a der… |
| event filed under the wrong category | 2 | 1 | SEO-5262 <https://insideerie.com/events/amazing-architecture-around-the-world-2026-11-19/> `content/erie/events/amazing-architecture-around-the-world-2026-11-19.md:7` | Change category to arts (or other) |
| Playoff round label printed as the venue | 1 | 1 | SEO-5258 <https://insidewindsorco.com/sports/windsor-high/football/> `scripts/lib/maxpreps.ts:486` | Ignore venue strings that are round names; show Home/Away from the bracket. |
| State championship not stated | 1 | 1 | SEO-5259 <https://insidewindsorco.com/sports/windsor-high/softball/> `data/windsor/sports-windsor-high.json` | Say "4A state champions" on the team page, the school page and the home strip. |
| completed playoff game shown as "vs"; CHSAA lists it as an away game | 1 | 1 | SEO-5260 <https://insidewindsorco.com/sports/severance-high/football/> `data/windsor/sports-severance-high.json` | For a postseason game filed neutral by MaxPreps, take home/away from the CHSAA game page. |
| completed playoff game shown without Home; CHSAA lists the school as host | 1 | 1 | SEO-5261 <https://insidewindsorco.com/sports/windsor-high/football/> `data/windsor/sports-windsor-high.json` | Add a hosted entry (football, 2026-11-06) for Windsor High, or treat a venue string that is only a round name as no venue. |
| template copy does not fit Niwot | 1 | 1 | SEO-5415 <https://insideniwot.com/updates/> `src/routes/town/updates.astro:64` | Word per town: "the county, the school district, a special district or the local paper". |

### 7 Internal linking

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| BreadcrumbList schema but no visible breadcrumb trail | 606 | 5 | SEO-5425 <https://carbonvalleyguide.com/articles/explore-frederick-in-walking-order/> `src/layouts/Page.astro` | Render the same trail the schema declares (Carbon Valley › Section › Page) at the top of the page. |
| vague anchor text "Source" | 267 | 1 | SEO-6476 <https://insidethetowns.com/alamosa/early-iron-festival/> `src/routes/hub/event.astro:175` | Name the organizer in the link text ("Source: Alamosa Parks & Recreation"), as the current-year line already does |
| hub newsletter archive links to a network URL that now redirects | 211 | 1 | SEO-6233 <https://insidethetowns.com/newsletter/2026-10-22-all-towns/> `content/hub/issues/2026-10-22-all-towns.md` | Archived issues: point the link at the final URL when the archive is rebuilt, or accept (each is one permanent hop to a 200 page) |
| footer link redirects | 170 | 1 | SEO-6062 <https://insidejohnstown.com/> `src/config/towns/hub.ts:82` | Link the www URL directly |
| bare URL used as anchor text | 25 | 1 | SEO-6037 <https://insidethetowns.com/newsletter/2026-10-22-all-towns/> `content/hub/issues/2026-10-22-all-towns.md` | Archive rendering of the 22 October issues: use the link label ("This week in Berthoud") and strip utm parameters |
| internal link to a noindex page | 23 | 1 | SEO-6444 <https://insideberthoud.com/> `content/berthoud/events/digital-navigator-drop-in-library-wednesdays.md` | Link the series' indexable page instead, or let this occurrence be the canonical one. |
| Article page has no visible breadcrumb or back link | 9 | 1 | SEO-5416 <https://insidewindsorco.com/articles/explore-severance-in-driving-order/> `src/routes/town/articles/[slug].astro` | Show the Guides trail above the headline. |
| no breadcrumb (visible or BreadcrumbList) | 7 | 1 | SEO-6467 <https://insideberthoud.com/about/> `src/pages/about.astro` | Add the Berthoud > page trail. |
| article has no in-content link to its parent index | 6 | 1 | SEO-6031 <https://insidelyons.com/articles/explore-lyons-in-walking-order/> `src/routes/town/articles/[slug].astro` | Add a "← Guides" back link, as the place and event templates have |
| visible breadcrumb differs from BreadcrumbList schema | 6 | 1 | SEO-6743 <https://insideerie.com/sports/boys-basketball/> `src/routes/town/sports-team.astro:64` | Make the visible trail and the schema use the same names and levels |
| hub event URL forwards to a section page although the guide has the event page | 1 | 1 | SEO-6232 <https://insidethetowns.com/severance/town-christmas/> `src/lib/hub-moved.ts:34` | Point it at the event page while the 2026 date is upcoming (or give Town Christmas a year-less annual page like the other two). |
| outdoors-led guide links a hub high-school football article | 1 | 1 | SEO-6474 <https://insidelyons.com/things-to-do/> `src/components/NearbyArticles.astro` | Filter sports articles out of NearbyArticles for lead: outdoors |
| primary nav has no outdoor item | 1 | 1 | SEO-6475 <https://insidelyons.com/> `src/lib/nav.ts:75` | Consider a Trails (or Outdoors) item first in the menu on the outdoors-led guide |

### 8 Performance

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| lead photo (likely LCP) is lazy-loaded, with no fetchpriority or preload | 186 | 7 | SEO-6790 <https://carbonvalleyguide.com/moving-here/> `src/routes/town/moving-here.astro:64` | Set loading="eager" fetchpriority="high" as articles/[slug].astro:90 does. |
| first card or list image is lazy-loaded | 24 | 3 | SEO-6750 <https://carbonvalleyguide.com/guides/> `src/routes/town/guides.astro:75` | Pass an eager flag to the first ArticleCard. |
| image heavier than needed | 11 | 6 | SEO-6776 <https://insideberthoud.com/> `src/components/Hero.astro:87` | Lower the encode quality for this image (the heroes already use quality 72; article/place/event lead images use the default) or add a smaller srcset… |
| intermittent layout shift from script-revealed open-status line | 3 | 3 | SEO-6787 <https://carbonvalleyguide.com/places/carbon-valley-regional-library/> `src/routes/town/places/[slug].astro:273` | Reserve the line's height in the built HTML (render the line visible with a placeholder / min-height instead of `hidden`), or set the status in an in… |
| hashed /_astro assets cached for one hour only | 2 | 2 | SEO-6774 <https://carbonvalleyguide.com/_astro/fifth-street-at-oak.sK6Gdr7O_ZY591D.webp> `vercel.json:51` | Serve /_astro/* with public, max-age=31536000, immutable. |
| TBT near threshold on events index | 1 | 1 | SEO-6749 <https://insideerie.com/events/> `src/routes/town/events/index.astro` | Watch as the calendar grows; defer the row-scroll setup (requestIdleCallback) or paginate the list |
| single-run TBT excursion | 1 | 1 | SEO-6976 <https://insidethetowns.com/golden/> `src/routes/hub/town.astro` | No action from this sample; re-measure. Could be lab noise |
| small script-driven layout shift | 1 | 1 | SEO-6977 <https://insidethetowns.com/this-weekend/> `src/routes/hub/this-weekend.astro:132` | Low priority; reserve space for the script-filled blocks above the weekend list |

### 9 Search Console

| Issue | Instances | Sites | Example | Fix |
|---|---|---|---|---|
| folded property's submitted sitemap now errors | 9 | 1 | SEO-6981 <https://insideestespark.com/sitemap.xml> `vercel.json` | Remove the submission in Search Console (the connection here is read-only); the redirects carry the move |
| Search Console sitemap count behind the live sitemap | 3 | 3 | SEO-6978 <https://insideberthoud.com/sitemap.xml> `astro.config.mjs` | None needed: Google re-reads it on its own; the count is from its last download |
| same query shown for two network URLs (hub page and folded guide) | 1 | 1 | SEO-6990 <https://insidethetowns.com/golden/> `src/config/hub-towns.ts` | Transitional. Check after Google recrawls the guide URL that /golden/candlelight-walk/, not /golden/, is the hub URL shown for the query |
| search-visibility doc out of date | 1 | 1 | SEO-6991 <https://insidethetowns.com/> `docs/SEARCH-VISIBILITY.md:58` | Add the 2026-11-17 read (out/gsc/findings.md) as a dated row or archive file and correct the property list |

## Performance: Lighthouse mobile, sampled

Lighthouse 13.6, mobile preset, simulated throttling, against the live sites: 64 pages (one of each template per site), three runs each, median reported. **No page fails a threshold** (LCP > 2.5 s, CLS > 0.1, TBT > 200 ms). Worst median LCP is 2.28 s (hub history story, a 168 KB lead image); CLS is 0.000 at the median on every page; worst TBT is 115 ms (Erie `/events/`, a 119 ms task from the `scroll-rows` script). INP has no lab value and no field (CrUX) data was available, so TBT stands in for it.

What Lighthouse did surface, all P2: place pages shift now and then when the "open now" line is revealed after load (`src/routes/town/places/[slug].astro:273`; one run in ten on three sampled places, up to CLS 0.119); the place lead image is lazy-loaded with no fetchpriority and was the LCP element on 5 of 7 sampled place pages (`places/[slug].astro:314`); 11 lead images are 40 to 123 KB heavier than needed. The one-hour cache on `/_astro/` assets is a recorded decision and is not counted.

| Site | Template | URL | Score | LCP ms | CLS | TBT ms | LCP element / cause |
|---|---|---|---|---|---|---|---|
| insidethetowns.com | home | / | 100 | 1823 | 0 | 3 | none: passes all thresholds |
| insidethetowns.com | hub-town | /estes-park/ | 99 | 1968 | 0 | 57 | over-heavy image AdobeStock_2151219980.kH75PEl0_c3CYm.webp |
| insidethetowns.com | hub-town | /golden/ | 99 | 1980 | 0 | 45 | over-heavy image AdobeStock_504466744.Bm-W3RI9_NTqSg.webp |
| insidethetowns.com | hub-event | /estes-park/catch-the-glow-parade/ | 100 | 912 | 0 | 0 | none: passes all thresholds |
| insidethetowns.com | season | /tree-lightings/ | 100 | 963 | 0 | 15 | none: passes all thresholds |
| insidethetowns.com | traditions-index | /annual-events/ | 100 | 930 | 0 | 0 | none: passes all thresholds |
| insidethetowns.com | curiosity-article | /articles/colorado-connector-train-tax/ | 100 | 912 | 0 | 10 | none: passes all thresholds |
| insidethetowns.com | history-story | /articles/leadville-tabors-silver-fortune/ | 98 | 2280 | 0 | 57 | over-heavy image matchless-mine.Di32RHP9_1TOWS9.webp |
| insidethetowns.com | listing-towns | /towns/ | 100 | 923 | 0 | 0 | none: passes all thresholds |
| insidethetowns.com | listing-articles | /articles/ | 100 | 930 | 0 | 0 | none: passes all thresholds |
| insidethetowns.com | this-weekend | /this-weekend/ | 100 | 959 | 0 | 56 | none: passes all thresholds |
| insideberthoud.com | home | / | 99 | 2131 | 0 | 20 | over-heavy image iStock-1417954947.D5q866fi_1DATU6.webp |
| insideberthoud.com | this-week | /this-week/ | 100 | 930 | 0 | 51 | none: passes all thresholds |
| insideberthoud.com | event | /events/glow-and-splash-2027-01-02/ | 100 | 930 | 0 | 17 | none: passes all thresholds |
| insideberthoud.com | sports-team | /sports/boys-basketball/ | 100 | 930 | 0 | 19 | none: passes all thresholds |
| insideberthoud.com | traditions | /traditions/ | 100 | 909 | 0 | 36 | none: passes all thresholds |
| insideberthoud.com | article | /articles/berthoud-history/ | 100 | 930 | 0 | 59 | none: passes all thresholds |
| insideberthoud.com | place | /places/berthoud-recreation-center/ | 100 | 1530 | 0 | 20 | intermittent layout shift: open-status line unhidden by script |
| insideberthoud.com | events-index | /events/ | 99 | 961 | 0 | 94 | none: passes all thresholds |
| insideerie.com | home | / | 99 | 1950 | 0 | 21 | none: passes all thresholds |
| insideerie.com | this-week | /this-week/ | 100 | 930 | 0 | 48 | none: passes all thresholds |
| insideerie.com | event | /events/veterans-day-celebration/ | 100 | 930 | 0 | 0 | none: passes all thresholds |
| insideerie.com | sports-team | /sports/boys-basketball/ | 100 | 913 | 0 | 10 | none: passes all thresholds |
| insideerie.com | traditions | /traditions/ | 100 | 918 | 0 | 8 | none: passes all thresholds |
| insideerie.com | article | /articles/old-erie-in-photographs/ | 100 | 1680 | 0 | 49 | none: passes all thresholds |
| insideerie.com | place | /places/erie-singletrack/ | 99 | 1830 | 0 | 0 | LCP image is loading=lazy with no fetchpriority |
| insideerie.com | events-index | /events/ | 99 | 970 | 0 | 115 | none: passes all thresholds |
| insidejohnstown.com | home | / | 99 | 2123 | 0 | 0 | over-heavy image old-town-walk-charlotte-street.BSDg0BGh_Z1zcl4h.webp |
| insidejohnstown.com | this-week | /this-week/ | 100 | 930 | 0 | 0 | none: passes all thresholds |
| insidejohnstown.com | event | /events/holiday-open-house-parish-house-2026/ | 100 | 930 | 0 | 42 | over-heavy image parish-house.BlTsdNuT_Z1t4CVy.webp |
| insidejohnstown.com | sports-team | /sports/boys-basketball/ | 100 | 930 | 0 | 26 | none: passes all thresholds |
| insidejohnstown.com | traditions | /traditions/ | 100 | 930 | 0 | 14 | none: passes all thresholds |
| insidejohnstown.com | article | /articles/johnstown-history/ | 100 | 1684 | 0 | 40 | none: passes all thresholds |
| insidejohnstown.com | place | /places/old-town-walking-tour/ | 100 | 1807 | 0 | 0 | LCP image is loading=lazy with no fetchpriority; over-heavy image old-town-walk-charlotte-street.BSDg0BGh_Z1S… |
| insidejohnstown.com | events-index | /events/ | 100 | 936 | 0 | 51 | none: passes all thresholds |
| insidewindsorco.com | home | / | 100 | 1782 | 0 | 34 | none: passes all thresholds |
| insidewindsorco.com | this-week | /this-week/ | 100 | 930 | 0 | 28 | none: passes all thresholds |
| insidewindsorco.com | event | /events/floral-alchemy-opening-reception-2026-11-06/ | 100 | 930 | 0 | 13 | none: passes all thresholds |
| insidewindsorco.com | sports-team | /sports/windsor-high/boys-basketball/ | 100 | 914 | 0 | 26 | none: passes all thresholds |
| insidewindsorco.com | traditions | /traditions/ | 100 | 910 | 0 | 61 | none: passes all thresholds |
| insidewindsorco.com | article | /articles/windsor-history/ | 100 | 920 | 0 | 0 | none: passes all thresholds |
| insidewindsorco.com | place | /places/poudre-river-trail/ | 99 | 1980 | 0 | 25 | LCP image is loading=lazy with no fetchpriority; over-heavy image poudre-river.CjAPS2pG_3IcaJ.webp |
| insidewindsorco.com | events-index | /events/ | 99 | 940 | 0 | 92 | none: passes all thresholds |
| carbonvalleyguide.com | home | / | 100 | 1824 | 0 | 22 | none: passes all thresholds |
| carbonvalleyguide.com | this-week | /this-week/ | 100 | 930 | 0 | 18 | none: passes all thresholds |
| carbonvalleyguide.com | event | /events/from-features-to-fiction-dan-jorgensen-2026-12-13/ | 100 | 930 | 0 | 19 | none: passes all thresholds |
| carbonvalleyguide.com | sports-team | /sports/boys-basketball/ | 100 | 930 | 0 | 21 | none: passes all thresholds |
| carbonvalleyguide.com | traditions | /traditions/ | 100 | 930 | 0 | 14 | none: passes all thresholds |
| carbonvalleyguide.com | article | /articles/frederick-with-kids/ | 100 | 903 | 0 | 62 | none: passes all thresholds |
| carbonvalleyguide.com | place | /places/carbon-valley-regional-library/ | 100 | 1652 | 0 | 15 | LCP image is loading=lazy with no fetchpriority; intermittent layout shift: open-status line unhidden by scri… |
| carbonvalleyguide.com | events-index | /events/ | 100 | 949 | 0 | 90 | none: passes all thresholds |
| insidelyons.com | home | / | 100 | 1830 | 0 | 58 | none: passes all thresholds |
| insidelyons.com | this-week | /this-week/ | 100 | 930 | 0 | 0 | none: passes all thresholds |
| insidelyons.com | event | /events/creative-grounds-adult-hand-building-thursdays/ | 100 | 930 | 0 | 10 | over-heavy image creative-grounds-mural.BVIc__K2_ZbYipw.webp |
| insidelyons.com | sports-team | /sports/boys-basketball/ | 100 | 930 | 0 | 19 | none: passes all thresholds |
| insidelyons.com | traditions | /traditions/ | 100 | 930 | 0 | 42 | none: passes all thresholds |
| insidelyons.com | article | /articles/lyons-history-sandstone-railroad-river/ | 100 | 1680 | 0 | 38 | none: passes all thresholds |
| insidelyons.com | place | /places/creative-grounds/ | 99 | 1530 | 0 | 62 | LCP image is loading=lazy with no fetchpriority; intermittent layout shift: open-status line unhidden by scri… |
| insidelyons.com | events-index | /events/ | 100 | 962 | 0 | 43 | none: passes all thresholds |
| insideniwot.com | home | / | 100 | 1819 | 0 | 6 | none: passes all thresholds |
| insideniwot.com | sports-team | /sports/boys-basketball/ | 100 | 930 | 0 | 14 | none: passes all thresholds |
| insideniwot.com | traditions | /traditions/ | 100 | 912 | 0 | 6 | none: passes all thresholds |
| insideniwot.com | article | /articles/how-niwot-got-here/ | 100 | 939 | 0 | 0 | over-heavy image niwot-tribune-storefront.KIrz9375_ZXRHsB.webp |
| insideniwot.com | place | /places/niwot-loop-trail/ | 100 | 930 | 0 | 8 | none: passes all thresholds |

## Search Console

Live data through the GSC Wizard connector for six of the eight properties (hub, Berthoud, Erie, Johnstown, Lyons, Niwot) and nine folded properties; window 18 October to 14 November 2026 against the previous 28 days; 163 URLs inspected. Read-only: nothing was submitted or changed.

- **Folded guides held 60% of measured clicks:** 658 clicks and 32,773 impressions on nine folded properties, 441 and 24,591 on the six live ones, 10 and 199 on the hub. The window ends two days after the fold, so whether the hub picks this up is not yet visible.
- **Niwot:** 62 of 101 clicks came from 57 `/events/`, `/this-week/` and `/this-weekend/` URLs that now 308 to the home page (`vercel.json:1502`, `:1513`).
- **Dated annual-event URLs still hold the ranking (10):** the replacement stubs are 200 + noindex. Erie's Boo! on Briggs has 1,049 impressions on the dated URL and 3 on the permanent one.
- **43 of 144 inspected sitemap URLs are not indexed**, including 14 of 50 hub pages and Berthoud `/restaurants/`. The sample was weighted to pages with no impressions, so this overstates the site-wide rate.
- **`/restaurants/` is outranked by `/eat-drink/` on every guide** (the test `docs/SEARCH-VISIBILITY.md` set for itself).
- **Hub vs guide competition:** one overlapping query found ("golden candlelight walk 2026", hub page and folded guide). The hub has no competing page for a live guide's town, only redirect stubs.
- All nine folded properties' submitted sitemaps now error.

## Missing photos

`missing-photos-2026-11-17.csv` lists 587 pages that need a photo: insideerie.com 128, insidewindsorco.com 113, insideberthoud.com 98, insidejohnstown.com 89, insideniwot.com 54, insidelyons.com 48, carbonvalleyguide.com 42, insidethetowns.com 15. By slot: share image (og/twitter) 64, place photo + share image 59, place photo (page lead, place card, place schema image, share image) 51, place photo (page shows a street map instead; listing cards and the share image fall back to the town photo) 50, event photo (own image or the venue's photo; share image) 50, event image (page, event schema image and share image) 40, event photo and share image 36, event photo (also the event schema image and the share image) 35.

## Checked and clean

- **Deploy:** live matches the build on all eight sites; every live URL answers 200 or 308.
- **Canonicals:** present, single, absolute, https, self-referencing and on the right domain on every indexable page of all eight sites. No guide page canonicalises to the hub or to another town. No Inside Frederick or insidefrederickco.com leftovers on carbonvalleyguide.com.
- **Sitemaps and robots:** built and live sitemaps agree; no sitemap URL 404s or redirects; robots.txt is correct on every domain; every noindex found is intended (past events, redirect stubs, utility pages). No worker found a preview or staging URL linked, canonicalised or indexable.
- **404s:** a made-up URL returns a real 404 on all eight sites.
- **Folded and retired domains:** all 21 that resolve go to the right town page or guide in one 308; none lands on the hub home, loops, uses a 302 or serves an indexable 200.
- **Titles and headings:** no title duplicated across domains; one H1 per page; heading order clean.
- **Hub images:** every `<img>` has width, height, alt, webp and srcset; no two towns share a photo; every file has a licence row. Alt text and licences are clean on Erie, Lyons and Niwot as well.
- **Schema dates:** every Event date is valid ISO 8601 with the right America/Denver offset.
- **Event facts across sites:** no hub-vs-guide date or time conflict apart from the Erie Balloon Festival; none between visible copy and JSON-LD; all 55 head-to-head games agree on both schools' pages; 11 holiday dates match the organizers' sites.
- **Scores:** every game before 17 November shows a score on every sports page.
- **Linking:** every hub article is linked from a relevant town page; hub-to-guide and guide-to-hub links work in both directions; internal links resolve.
- **Performance:** Lighthouse mobile 98 to 100 on all 64 sampled pages; Lighthouse SEO 100 on 63 of 64 (the exception is a past event that is noindex by design).

## Unverified

Suspected or unresolved; none of these is counted as a finding.

- **Bot-blocked external links (about 470 URLs):** answered 403, 406 or 429 to an automated request and could not be judged. Per site: hub 53, Berthoud 66, Erie 46, Johnstown 42, Windsor 131, Carbon Valley 45, Lyons 36, Niwot 46. Mostly maxpreps.com, windsorco.gov (every URL), larimer.gov, weld.gov, zillow.com, realtor.com, amtrak.com and stock.adobe.com. A person should open them.
- **Erie Balloon Festival 2027 dates (9 to 11 July):** the two site values conflict; erieballoonfestival.com blocked the check, so which is right is not established.
- **Other "not posted" lines in the hub playoffs article** (`content/hub/curiosity/colorado-football-playoffs-2026.md:260, 278, 314, 332`): only Roosevelt's game page and the four misdated quarterfinals were read; the rest are probably stale the same way.
- **Order of other same-day results:** only the last day of Berthoud softball and Windsor volleyball was checked against CHSAA; other multi-game days may be reversed too (no visible harm, since they are not the "last game").
- **Playoff games filed as neutral:** Frederick vs Air Academy and Severance vs Lewis-Palmer (both 6 November) show "Neutral site"; their CHSAA pages could not be read.
- **Individual scores and records:** checked for presence and internal consistency; MaxPreps blocked a game-by-game comparison on most sites.
- **Whether serving the stock originals breaches the Adobe Stock or iStock licence:** the files are publicly downloadable (verified); the licence reading is a legal question.
- **Whether a lazy-loaded lead photo is the LCP element on every place and event page:** measured on 7 sampled place pages (5 of 7); inferred from markup elsewhere.
- **How Google treats the meta-refresh stubs:** mixed evidence from two recrawled stubs (one took the permanent page as canonical, one kept the dated URL); both are "Excluded by noindex".
- **cityofniwot.com:** answers a Wix 404 on every path; nothing in the repo says the owner holds the domain.
- **townofniwot.com:** 22 paths that exist on insideniwot.com are sent to the home page; the rules live in another repo this session cannot read.
- **Old event addresses not cited in the repo:** git history here starts on 13 November, so old slugs could not be rebuilt; the 337 old addresses cited in docs and data were tested.
- **carbonvalleyacademy.org:** certificate error through this session's proxy; could be the site or the proxy.
- **Smaller items:** King Soopers ZIP (80530 vs 80504); "Severance Knights" vs "Silver Knights"; a possible typo in a weld4h.org URL ("Severace"); Lyons Farmette ZIP 80503; Board of Trustees end time "11 pm"; four townofniwot.com photographs with no named photographer; whether eight build-excluded Lyons events are still happening; other event prices (only the Turkey Trot was compared with its organizer); place hours, phones and addresses (not re-verified against the businesses).

## Checks not run

- **Search Console for insidewindsorco.com and carbonvalleyguide.com:** both are verified but not activated in the GSC connector, and activating one is a write. The only figures are an in-repo export dated 20 October 2026 (`docs/archive/SEARCH-CONSOLE-2026-10-20.md`). Eleven folded properties are in the same state.
- **Ahrefs Search Console tools:** returned "Insufficient plan".
- **Full URL inspection:** 163 of roughly 1,000 sitemap URLs inspected; the Pages (index coverage) report is not available through the API. Previous-period figures were pulled per property only.
- **Bing Webmaster Tools:** not connected.
- **INP and field data:** no lab value for INP and no CrUX data; TBT reported instead. Lighthouse was sampled (64 pages), as the brief allowed.
- **Google Rich Results Test:** not run; JSON-LD was validated by script against Google's documented required and recommended fields.
- **Rendered-page checks:** colours, breadcrumbs and hidden elements were read from built HTML, CSS and share images, not from screenshots.
- **Six domains with no DNS record** (insidesalida.com, insidesteamboatsprings.com, insidebuenavista.com, insidegrandjunction.com, insidefortmorgan.com, insidemead.com): nothing to request; their rules were checked on paper only.
- **Origin TLS certificates:** the session's proxy re-terminates TLS, so expiry dates could not be read.
- **Redirect rules held in other repos** (townofniwot.com, explorelyons.com): tested live only.
- **Generated Google Calendar and Maps links, .ics files, RSS feeds and the Pagefind index:** checked for presence and the right domain, not field by field.
- **Fact-checking every listing against its source:** done for upcoming holiday events, playoff games and anything a link check exposed; not for every place's hours, price or address.

## Consolidated fix list, in impact order

Written to go out as one brief. Row ids are in the CSV under the issue label named.

1. **Correct the wrong facts now (P0).**
   - Roosevelt vs Mesa Ridge, Friday 20 November: show it as a home game (`src/config/school-sports.ts:421` covers 13 November only; `data/johnstown/sports.json:145`). Affects the hub home and three Johnstown pages.
   - Hub playoffs article (`content/hub/curiosity/colorado-football-playoffs-2026.md`): move Monarch–Loveland, Montrose–Pueblo West, Mead–Evergreen and Palisade–Pueblo East to Saturday 21 November and replace the "has not posted the time or site" lines with CHSAA's times and sites.
   - Same-day results: order by bracket round or start time so Berthoud softball ends on the 2–3 loss to Lyons (`data/berthoud/sports.json`) and Windsor volleyball on the 2–3 state-final loss to Rampart (`data/windsor/sports-windsor-high.json:374`).
   - Turkey Trot price (`content/johnstown/events/fitness-avenue-turkey-trot.md:8`): $48.70 / $27.50, rising after 25 November.
   - Johnstown council vacancy (`content/johnstown/updates/town-council-vacancy-applications-due-november-16.md`, `content/johnstown/programs/town-council.md:9`): close it out.
   - Severance on the Windsor guide: use the venue's own town in event meta descriptions (34), Event schema `addressLocality` (12), calendar exports (30) and the "Windsor holds it every year" line (`src/routes/town/events/[slug].astro:320`).
2. **Fix the redirects that lose ranking.**
   - `vercel.json:3416`: send `/events/festival-of-lights-2026-12-05/` to `/events/festival-of-lights/`.
   - Add the two Lyons 404s to `content/lyons/retired.json`.
   - Serve the 224 retired-URL stubs and the hub's 14 guide-town addresses as 308 rules in `vercel.json`, not 200 meta-refresh pages (`content/<town>/retired.json`, `formerSlugs`, `src/lib/hub-moved.ts`).
   - Add the five missing entries to `data/hub/fold-events.json` (Evergreen Frostival and four others) and point Lyons' seven retired slugs at their live event pages.
   - Niwot: send old event and This Week addresses to the closest live page, not the home page, where one exists.
3. **Stop publishing other towns' originals.** Narrow the glob at `src/lib/images.ts:8` to the site being built; that removes the ten full-size stock files and about 260 MB from each deploy.
4. **Finish the decisions.**
   - Lyons: remove the six sports pages, the footer "Athletics" link (`src/components/Footer.astro:53`), "the scores" from the newsletter blurb and the Lyons email; lead the home page with the outdoors.
   - Estes Park: restore the Frozen Dead Guy Days spotlight.
   - School colours: Severance High navy on its seven pages, Erie High's orange and black on its seven, school colours on the hub's sports rows.
   - Niwot: clear the event leftovers on `/about/`, `/contact/`, `/for-businesses/` and two articles.
   - Timnath: reword or noindex the six newsletter-archive pages that brand it as a guide.
5. **Past event pages (221):** add a "this has passed" notice with the year, and drop "Next" and "Add to calendar" (`src/routes/town/events/[slug].astro:243`).
6. **Carbon Valley:** refile the 5 and 12 November issues from `frederick` to `carbon-valley` so the "last issue" link updates on 128 pages; retitle or broaden the three Frederick-only pages; switch on or reword `/submit-event/`; give events a real town and street address in schema.
7. **Photos:** six hub town heroes (Salida, Timnath, Cedaredge, Green Mountain Falls, Marble, Platteville), then place pages (249) and article leads (22), starting with restaurants, coffee and shops; use the licensed St. Vrain State Park and Severance photos already in the repo. The shot list is `missing-photos-2026-11-17.csv`.
8. **Stale copy and links:** the "TBD" placeholder (`content/hub/traditions/rmnp-glacier-basin-campground.md:21`), Wolf Creek's opening, the Erie Balloon Festival date conflict, the closed Jr. Spartans form, the expired Lyons river-park offer, six duplicate Old Mine listings, the 13 broken source links and the Platteville museum link.
9. **Hub pages:** link the five orphan free-admission pages; add dates and body copy to the event pages under 100 words; add `image` to Article schema.
10. **Lead photo loading:** make the place and event lead image eager with `fetchpriority="high"` (`places/[slug].astro:314`), and reserve space for the "open now" line.
11. **Search Console housekeeping:** activate Windsor and Carbon Valley in the GSC tool, remove or resubmit the nine folded properties' sitemaps, and recheck the fold's effect after a full 28 days.
12. **Polish in one pass (P2):** visible breadcrumb trails, meta descriptions cut mid-sentence, titles over 65 characters, Event and Place schema recommended fields, `areaServed`, "Source" anchor text, the 211 newsletter-archive links that redirect, no-slash and http/www extra hops, DNS for the six unresolved domains, `docs/REDIRECTS.md`.
