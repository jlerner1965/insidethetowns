# Inside the Towns — network audit, 27 October 2026

Every live guide (20) and the hub, read from the repo and the live sites: content, design, accuracy, links, coverage, the business side, and the automation that is supposed to run on its own. One report per guide sits beside this file. Scope of the live checks: 1,900 pages fetched across the 21 sites, every sitemap URL and internal link HEAD-checked (1,100), 3,100 outbound links tried from the pages plus the repo's own `npm run check-links` over all 3,736 links in the content, every alternate and `www` domain probed over http and https, and 293 facts (hours, phones, addresses, dates, prices) read against the business's or organizer's own page.

## Verdicts

| Guide | Verdict |
|---|---|
| Hub | Clean. No sponsor, no rate card, the 90-day scorecard unfilled since its baseline week. |
| Niwot | Solid. Five call-list listings from 12 October now past 30 days; 14 past events to delete. |
| Lyons | Good. 22 staged events a month deep; the Lyons Recorder still blocks machine reads; two stale flags to dismiss. |
| Berthoud | Good. Kofe House's Thursday dinner hours missing; B-Rad's and Trailhead Cafe need a call; 16 listings past the re-check; 42 of 49 without a photo. |
| Erie | Good, two listings wrong: Birdhouse is closed Tuesday, not Monday; Piripi changes hours 1 November. Four Town-calendar links now sit behind a login; the 3 November study session has no source. |
| Johnstown | Fair. Calendar ends 10 December (44 days); no bar, trail or lodging listed; one library link dead. |
| Timnath | Thin but accurate. 9 events in the next 30 days; three listings rest on facts no page states. |
| Elizabeth | Quiet. Accurate where checked, but 19 of 25 listings are already stale and lose their hours from mid-November; decision due 15 November. |
| Windsor | Needs attention this week. No notes for the week of 26 October (the Wednesday run died on Windsor); the Twilight Tour flag is a false alarm to dismiss. |
| Fort Collins | Quiet, accurate. Two November flags to rule on; City links moved to fortcollins.gov; JAX's store page has an expired certificate. |
| Longmont | Quiet, accurate. Four staged items; one past event cites a 404. |
| Loveland | Quiet, under threshold (18 of 25 events), accurate; four City and county sources block machines. |
| Carbon Valley | Fair. Calendar ends 8 December (42 days); 13 staged; 45 of 47 listings without a photo; 18 parks against 1 bar and 1 coffee. |
| Estes Park | Good. The season turns 1 November and the files already say so; 23 staged places since 6–10 October; the Town and three others block machines. |
| Golden | Needs attention. Under threshold (13 of 20); Monster Mash listed at 3 pm, every source says 2; Foothills Art Center closed until 20 November but listed open; a museum page cited eight times is a 404; ten access notes stale in 9 days. |
| Evergreen | Good. Three December Santa Breakfast links dead (the Chamber moved the page); 18 staged. |
| Nederland | Quiet, under threshold (8 of 10). Busey Brews and Crosscut hours wrong; three listings' own sites answer nothing. |
| Clear Creek | Good for a week-old three-town guide. One wrong phone (Argo Mill); 30 staged places, the network's longest queue; both Cities block machines. |
| Grand Lake | Needs attention. This Week is blank for the week of 26 October; three of seven listings checked have wrong (summer) hours; under threshold (6 of 10). |
| Manitou Springs | Accurate (16 of 16) but thin: under threshold (9 of 15); the City blocks machines. |
| Leadville | Quiet, under threshold (9 of 10). Healy House and the Visitor Center are on autumn and winter hours the guide does not have. |

Accuracy across the spot-check: 293 facts read against primary sources, 269 matched, 13 were wrong (listed in the guides' reports with replacement text), 44 could not be read because the source blocks machines or does not state the fact. Nothing checked had closed without the guide knowing.

## The three issues that are chassis-wide, not per town

1. **Page titles over 70 characters.** About one page in five across the network (Longmont 42 of 70 crawled, Manitou Springs 37 of 66, Clear Creek 27 of 72): an event title plus " — October 29, 2026" plus " | Inside <Town>" runs to 90–110 characters, and search results cut at about 60. One rule in `src/lib/titles.ts` (drop the suffix, or the date, once the title passes 60) fixes every guide. Four directory pages (Erie, Windsor, Manitou Springs, Leadville) also carry a meta description of 166–167 characters.
2. **Mountain access notes going stale together.** Forty access blocks (trailheads, parks, passes) on the seven mountain guides fall out of their 30-day window in the next 14 days: Golden 10, Clear Creek 9, Leadville 6, Grand Lake 4, Nederland 4, Manitou Springs 3, Evergreen 2, Estes Park 2. The weekly rotation stopped reaching those guides on 20 October; either one monthly pass over the land managers' pages, or a longer winter window for `access`, keeps the pages from losing their parking and closure lines in November.
3. **The queue the automation cannot drain.** 233 items wait in staging (88 events, 143 places), 100 of them since 6 October. The Monday run approves events under its rules but never a place; the Wednesday editor takes 25 events and 10 places a week. At that rate the 143 places are 14 weeks of waiting, and the Clear Creek, Estes Park and Golden queues are the oldest. Either widen the editor's weekly take or run `npm run review` by hand on the three mountain guides once.

Two more patterns worth naming: 265 outbound links refused automated reads (the Town sites of Windsor, Elizabeth, Fort Collins, Loveland, Estes Park, Grand Lake, Idaho Springs, Black Hawk, Manitou Springs and Leadville among them), so the calendars that matter most are the ones only a person can read; and about 540 open listings have no photograph (docs/PHOTO-CONTACTS.csv), the Carbon Valley, Clear Creek and Windsor guides worst.

## The automation: what runs, what broke, what was fixed here

| Check | State on 27 October | Action |
|---|---|---|
| CI (every push) | Green on main (run 1092, this morning). | None. |
| Scheduled rebuild (daily, twice) | 64 runs, all green; every live site served a build from today ("Refreshed October 27, 2026" on each events page). The workflow fails loudly if a live town lacks a deploy hook, and it passes, so all 21 have one. | None. |
| Nightly event re-check | 13 runs, all green. PR #204 (26 October) is open: 5 changes, 173 confirmations, 71 calls to make. Today's run had not started by 13:45 UTC (GitHub starts schedules late, as DEPLOY.md says). | Merge #204 so Wednesday's editor can rule on the flags. |
| **Weekly ingest (Monday)** | **Failed on 26 October.** The Fort Lupton library's LibCal feed carries a Thanksgiving closure entered as "9:00 pm – 8:00 pm"; the reader wrote an end before the start, the strict validate failed, and the week's run died after approving 164 events it then never pushed. | **Fixed in this branch:** the LibCal reader drops an end before its start (`scripts/lib/feeds/rss.ts`), `toStaged` guards every feed the same way with a note on the review line (`scripts/lib/ingest.ts`), and a test holds it (`test/ingest.test.ts`). After merging, run the workflow by hand (Actions → Weekly ingest → Run workflow) to recover the week. |
| **Wednesday research drafts** | **Failed on 21 October** on Windsor: the model answered with a tool call for a tool it was not given and `agent/agent.mjs` threw; 19 guides got drafts, Windsor did not, so the editor published nothing for Windsor and its This Week page is still last week's. | **Fixed in this branch:** a stray client-tool call is answered with "no such tool" and the run carries on (three strikes end it); the weekly prompt now states the week's date window, so a pick from the Saturday before the week (Grand Lake's blank page) is not drafted. Merge before tomorrow's 12:20 UTC run. |
| Weekly editor (Wednesday, after the drafts) | One run (21 October), green; PR #180 merged the same day. | None; it runs tomorrow. |
| Thursday drafts and the send | Green on 22 October: PR #197 merged, nine editions sent through Buttondown (the key is set). | None; next Thursday 29 October. |
| School sports | Green; last scheduled run 25 October. The 25 October push race is fixed by the workflow's own retry. | None. |
| **The manager's weekly audit** (manager/schedule.mjs, Mondays 6:07) | **Not set up, as far as the repo shows:** no `manager/config.json` exists, which `setup.mjs` writes, and nothing in the history records a scheduled deployment being created. It cannot be verified from this session (no Console access). | Decide whether to create it, or let this audit's format and `npm run weekly` stand in for it. |
| GitHub's runner warnings | Every run warns that actions/checkout@v4 and setup-node@v4 target Node 20 and are forced onto Node 24. | Bump both to v5 when convenient; nothing fails today. |

Vercel's deployment list is not readable by this session's connector (403), so "every site built today" rests on the pages' own refresh dates and `last-modified` headers, which all say 27 October 12:37 UTC.

## Technical

`npm test` 566 pass (565 before this branch, plus the LibCal case); `npm run validate` 0 errors, 7 warnings (six guides under their launch threshold: Golden, Grand Lake, Leadville, Loveland, Manitou Springs, Nederland; no rate card); `npm run check-colors` every pair passes AA, the seven school bands at 7:1; `astro check` 0 errors; the hub, Lyons and Clear Creek build. Live: every page 200, averages 70–130 ms a page, CSP, HSTS and X-Frame-Options on every response, a real 404 for a missing page, sitemaps with lastmod on every entry, the iCal and RSS feeds answering on every guide, the Plausible tag on all 20 guides, every alternate domain (townofniwot.com, explorelyons.com, insideseverance.com, insidefirestone.com, insidefortlupton.com, insidegeorgetownco.com, insideblackhawk.com) and every `www` landing on the right guide with 200. Redirect chains longer than two hops: only http://www.townofniwot.com (three), which is the old project's doing.

Links, from `npm run check-links` over the whole content (3,736 links, 1,038 hosts): 14 dead, 12 moved to another host, 24 no response, 265 refused. Every dead and moved link is in its guide's report with the file and line.

## Business

- No sponsor is set on any guide or the hub; `hub.rates` is unset (the validator's standing warning); docs/SPONSOR-OFFER.md's $200 a month waits on your number. /advertise/ withholds audience figures until 30 days of counting, correctly.
- docs/90-DAY-TEST.md: the week-of-19-October row (sent, subscribers, opens, search) is empty; the Monday fill on 26 October did not happen. Buttondown and Search Console are out of this session's reach.
- One relationship on file (the Lyons Area Chamber, contacted 20 October, draft in docs/relationships/drafts/); no log entry since.
- Forms: the hub and nine guides post to Formspree; eleven guides (Longmont, Loveland, Carbon Valley and the eight mountain guides) have no form id, so Contact, Submit an event and Report a correction are `mailto:` links there. That works, but a correction on a visitor guide is an email, not a form.
- Analytics: Plausible on every guide; Vercel Web Analytics on the hub, enabled in the dashboard (not checkable from here). Search Console baseline of 20 October stands; the per-guide numbers above come from no newer read.

## Coverage, in one table (open listings by kind)

| Guide | eat | drink | coffee | shop | parks/trails | venue | lodging | Hubs |
|---|---|---|---|---|---|---|---|---|
| Niwot | 11 | 2 | 4 | 11 | 5 | 6 | 1 | families, living here, get involved, updates |
| Lyons | 6 | 4 | 2 | 7 | 9 | 6 | 4 | families, living here |
| Berthoud | 11 | 2 | 4 | 12 | 9 | 8 | – | all four |
| Erie | 6 | 4 | 4 | 4 | 12 | 7 | – | families, living here, updates |
| Johnstown | 9 | – | 2 | 4 | 8 | 7 | – | families, living here |
| Timnath | 3 | 1 | 2 | 3 | 6 | 3 | – | – |
| Elizabeth | 4 | 1 | 2 | 8 | 4 | 6 | – | families, living here |
| Windsor | 5 | 5 | 2 | 4 | 17 | 7 | 1 | families, living here |
| Fort Collins | 11 | 9 | 5 | 5 | 19 | 13 | 3 | – |
| Longmont | 9 | 9 | 4 | 4 | 11 | 3 | – | – |
| Loveland | 14 | 11 | 3 | 6 | 6 | 2 | – | – |
| Carbon Valley | 8 | 1 | 1 | 2 | 21 | 14 | – | – |
| Estes Park | 13 | 6 | 1 | 7 | 14 | 5 | 3 | – |
| Golden | 4 | 4 | 1 | 1 | 16 | 5 | – | – |
| Evergreen | 3 | 2 | 3 | 4 | 9 | 6 | – | – |
| Nederland | 6 | 1 | – | 4 | 9 | 5 | – | – |
| Clear Creek | 11 | 6 | 3 | 5 | 15 | 16 | 3 | – |
| Grand Lake | 2 | – | 2 | 3 | 5 | 5 | 2 | – |
| Manitou Springs | 4 | 1 | 2 | 3 | 5 | 8 | 2 | – |
| Leadville | 2 | 2 | 2 | 2 | 8 | 7 | 1 | – |

The gaps that stand out: Johnstown without a bar; Nederland without a coffee listing; Golden, Grand Lake, Leadville and Manitou Springs with two to four restaurants in towns built on visitors; Carbon Valley and Windsor with more parks than places to eat. Each guide's report says which.

## Decisions for James

- The sponsor price, and whether to fill the 90-day scorecard weekly or drop the table.
- The quiet guides: Elizabeth by 15 November; Nederland, Grand Lake and Leadville by 19 November; Fort Collins, Longmont and Loveland by 29 November. Elizabeth's listings go stale first.
- Longmont's site title ("Longmont · Inside the Towns", the odd one out in every guide's switcher): deliberate or not.
- Whether the manager's scheduled audit should exist at all, now that `npm run weekly`, the nightly re-check and this audit cover the same ground.
- Erie's 3 November study session: the Town's calendar no longer lists it; cancel or confirm.

## Changed in this branch

`scripts/lib/feeds/rss.ts`, `scripts/lib/ingest.ts`, `test/ingest.test.ts` (the ingest fix and its test), `agent/agent.mjs` (the research agent's tool-call fix and the date window), these reports under `docs/audits/2026-10-27/`, and one entry in DECISIONS.md. Nothing under `content/` was touched; every content fix is a proposal in its guide's report.
