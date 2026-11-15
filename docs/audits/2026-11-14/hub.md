# Inside the Towns (the hub): site audit, 14 November 2026

> **Fixed on 14 November 2026 (evening), in the pull request that added this report:** Fix now 1 in part (a game whose kickoff has passed reads "Result to come"; the finals themselves still need entering from CHSAA), 2 in part (the 2026 closing, from the NPS release of 13 November; the 2026 opening is still missing, since the release of 29 May 2026 says the road "is open for the season" without the day it opened), 3 (a run under way reads "On now, through …" on town pages and /annual-events/) and 6 (Kremmling's Super 8 link); and the full cost line on /this-weekend/'s cards (Fix soon), now "From $70" as on the home. Everything else below is open.

**Verdict:** Every page loads and nearly every link works. Five pages state things the hub's own sources now contradict: Trail Ridge Road, the football scores, past dates labelled "Next", "Confirmed" next to "Tentative", and a monthly free day shown as "not announced". On a phone, the pages after the home still carry the clutter the home just shed.

**Numbers:** 660 sitemap URLs, all 200 (average 181 ms, slowest 515 ms). 1,009 internal link targets, all 200, and every #anchor resolves. 982 image URLs, all 200 (re-checked on the 23:51 UTC build). 2,299 external links: one confirmed 404, plus 48 403s and 3 429s from sites that block bots. No duplicate titles or descriptions. Every page has a canonical (except /search/, by design), a viewport tag, one H1 and alt text on every image. At 393px, 23 page types showed no sideways scroll, and every hub page, the home included, now uses the same 65px masthead and the same fonts.

Scope: the hub minus its home page (James is editing the home's weekend picks and cost lines). Checked live at 393px with Playwright and curl on 14 November, between about 23:30 and 00:30 UTC (afternoon in Colorado), on the builds of 23:34 and 23:51 UTC. Every "Fix now" item was re-checked on the 23:51 build.

## Fix now

1. **[accuracy] /articles/colorado-football-playoffs-2026/ still reads "Scheduled" for all 14 games, and 13 of them have been played.** The 14th, Golden at Mesa Ridge, kicks off at 6 pm Saturday. CHSAA has posted finals: Palisade 49, Fort Morgan 26 (Fri 13 Nov) and Mead 56, Rifle 7 (Sat 14 Nov) (chsaanow.com game pages, checked 14 Nov). The hub's home page already shows "Roosevelt won 53-10 vs Montbello" and "Severance lost 7-10 vs Pueblo East", while the article lists both games as "Scheduled". The article is the "Latest" lead on /articles/. Its `reverify` ("each game night… set status, scores") hasn't run. Content: `content/hub/curiosity/colorado-football-playoffs-2026.md`. Code: `src/routes/hub/curiosity-article.astro:104,225`, where a kickoff that has passed with no final should read "Result to come", the same rule the volleyball pages now follow.
2. **[accuracy] Trail Ridge Road is a year out of date on 6 pages:** /estes-park/, /grand-lake/, /granby/, /longmont/, /loveland/ and /outdoor-dates/. Closing: "TBA 2026 · Not yet announced · Most recent Friday, November 14, 2025 · normally closes in mid-October". NPS says the road closed to through travel for winter 2026/27 on 13 Nov 2026 (release of 13 Nov; the NPS news list's summary says 12 Nov): nps.gov/romo/learn/news/trail-ridge-road-closes-to-through-travel-for-winter-2026-2027-season.htm. Opening: "Most recent Friday, May 30, 2025", yet the record's own source, the NPS release of 29 May 2026, says the road "is open for the season". The 2026 opening is missing. Files: `content/hub/traditions/trail-ridge-road-closes.md`, `trail-ridge-road-opens.md`. The Lyons and Berthoud guides list the same records (not checked).
3. **[accuracy] "Next … date" shows a start date that has already passed.** Durango's hero: "Next Durango date: Lake Nighthorse recreation season, Friday, April 10, 2026". /annual-events/: "Outdoor dates: Next: Lake Nighthorse…, April 10, 2026". Georgetown's hero: "Santa's Lighted Forest, Friday, November 6, 2026". Ridgway: "Friday, November 13, 2026". These are runs still under way, dated by their first day, and they also sit under "Coming up" (APR 10). Code: `src/routes/hub/town.astro:131` (`nextDay` uses `entry.date`), `nextUp` in `src/lib/hub-towns.ts`, and `src/routes/hub/annual-events.astro`.
4. **[accuracy] "Confirmed." next to the organizer's own "Tentative".** Grand Junction's hero and /outdoor-dates/: "Powderhorn Mountain Resort opening day, Confirmed. Friday, November 20, 2026 · Powderhorn Mountain Resort: 'Tentative Opening Day'". powderhorn.com says "Tentative Opening Day Friday, November 20" (checked 14 Nov). /silverton/ shows the same with Kendall Mountain ("Tentative opening date"), and 20 confirmed records carry a hedge like this: Ski Cooper closing "Tentative", Frisco tubing "snow pending", Salida's Chaffee County Fair "Confirmed" plus "2027 info coming soon". Code: `src/components/hub/DateEntry.astro:130` and `TraditionRow.astro`. The records are under `content/hub/traditions/`.
5. **[accuracy] /longmont/museum-second-saturday-free-day/: "TBA 2026 · 2026 date not yet announced… Send us the 2026 date".** The museum's page says "Second Saturday of each month is free day!" (longmontcolorado.gov, checked 14 Nov), so today was one and the next is 12 Dec. The site's other "typical window" records show the same "Not yet announced." (for example Piñon Flats on /alamosa/). Files: `content/hub/traditions/longmont-museum-second-saturday-free-day.md`, `src/components/hub/DateEntry.astro:143`.
6. **[links] /kremmling/ "Where to stay": the Super 8 link is a 404 in a real browser.** The same URL plus `/overview` loads. File: `data/hub/towns/kremmling.json:14-15`.

## Fix soon

- [content] **/this-weekend/ leaves out the hub's own towns.** The network's "This weekend across the towns" reads only the 6 guides (`getNetworkEntries('events')`, `src/routes/hub/this-weekend.astro`). It misses four dated hub events this weekend: Longmont Turkey Trot (Sat), the Castle Rock Outlets tree lighting (Sat, also in the home's This season), Georgetown's Big Horn Sheep Festival (Sat) and the Dinosaur Ridge free day (Sun).
- [design] **/this-weekend/ is 24,620px on a phone, about 29 screens.** The weekend itself runs from 756px to 4,354px. The "two weeks after" fill 4,354px to 21,677px (about 20 screens). The cards print the full cost line: Les Misérables' is about 150 characters (`src/components/NetworkEventCard.astro:108`). The home's `shortCost` fix doesn't reach this page.
- [content] **Most event pages say nothing about the event.** 34 of 615 records carry `about`, so about 468 of the ~502 event pages are a title, a date, a place and a source, averaging 104 words. The source is also said twice on one screen: "Checked Nov 12, 2026 · Source: …" in the card, then "From …'s page, checked November 12, 2026." under it. Files: `src/routes/hub/event.astro`, `content/hub/traditions/*.md`.
- [design] **The check lines the home dropped on 14 Nov are still on the other pages.** Town pages average 18 "Checked" lines (Estes Park 42 in 2,471 words, /outdoor-dates/ 123). Each event and season entry also adds "Add to calendar: Apple or Outlook (.ics) · Google" and "Also on:". Code: `DateEntry.astro`, `TraditionRow.astro`.
- [design] **The first listing sits below the first phone screen** (852px tall): season pages at 960px (nine pills and a subscribe line come first), /salida/ at 942px, /this-weekend/ at 856px. Files: `season.astro`, `town.astro` ("On this page"), `this-weekend.astro`.
- [content] **Town pages are mostly "not announced".** Across the 95 Events sections there are 399 "Not yet announced" entries and 240 confirmed ones. Not-announced outnumber confirmed on 64 pages. Salida's Events section is 4,442px (five screens) for 4 dates.
- [design] **Three looks across the hub's pages.** Town pages and the home use the flat publication style. Event, season and /this-weekend/ pages use rounded cards, dark date tiles and pill buttons, and /articles/ uses pill filters. See audit-shots/evidence-*.png.
- [content] **Weak heroes.** Fort Collins' and Timnath's "Next … date" is "Horsetooth Reservoir boat ramps close for the season", while their page titles name NoCo Winter Wonderland. Nederland's hero and title lead with Frozen Dead Guy Days, which the page itself says is held in Estes Park (still open from the 14 Nov review). 12 town pages have no next date (Cedaredge, Craig, Crestone, Dillon, Florence, Keystone, Kremmling, Meeker, Paonia, Rocky Ford, Silverthorne, Walden).
- [content] **Search ranks "not announced" above what's coming.** "longmont" puts Halloween Parade 2027 (TBA) above today's Turkey Trot, "salida" leads with Jazz Fest 2027 (TBA), and "estes park" shows Wool Market (TBA) before the 21 Nov tree lighting. "restaurant golden" finds only two October newsletter issues. "fort colins" returns La Veta. No results gives only "Nothing found" (still open). Files: `src/pages/search.astro`, `src/lib/network-search.ts`.
- [content] **/submit-event/ says "We cover 6 so far"** while /towns/ lists 7 guides and 95 town pages, each of which asks "Organizing an event in …? Send us your dates." File: `src/routes/hub/submit-event.astro`.
- [design] **The footer is 1,358px on every page** (1.6 phone screens). It lists nine season pages but not This weekend, Articles or Annual events (`src/components/Footer.astro`).
- [content] **Still open from 14 Nov:** time formats mixed on one page (/tree-lightings/ has "4 p.m.", "5 pm" and "5:00-7:00 pm"; Salida has "10 am" and "10:00 AM"; event H1s say "5 p.m." over a body that says "5 pm"). The organizer typo "Free with Gaurdian" is on /this-weekend/ and the 12 Nov issues. "Also on: Inside Lyons · Loveland" mixes guide names with town names.
- [links] **Old newsletter issues** (Golden, Lafayette, Idaho Springs, Windsor-Timnath) link to closed guides about 220 times. Each link lands on a town page's #traditions, not on the event.
- [design] 37 event-page titles run over the 60-character rule, and 9 meta descriptions end "..".

## Since last audit

- Fixed: every hub page, the home included, now uses one masthead and one set of fonts (measured). /erie/, /berthoud/ and /frederick/ redirect to their guides. The home's check lines are gone. Longmont's odd guide name went away when the guide was folded.
- Still open: the items marked above. The six owned domains (insidesalida, insidemead, insidesteamboatsprings, insidebuenavista, insidegrandjunction, insidefortmorgan) still return no DNS address, though /salida/ and /mead/ are live. See docs/audits/2026-11-14/_network.md, priority 1.
- Checked and right: the Longmont Turkey Trot, Castle Rock Outlets and Starlighting, Loveland's Festival of Lights, Grand Junction's tree lighting, Purgatory's opening, Salida's Christmas Mountain Run and Chaffee fair dates, the Dinosaur Ridge free day and Monarch's "not announced" all match their sources (checked 14 Nov).

## Couldn't verify

- Georgetown's Big Horn Sheep Festival (the source page renders no events) and Estes Park's Lighting of the Trees (eventsinestes.com returned a bot check).
- /salida/: "Mountain Valley Transit… suspended from November 16": not on the cited page. The Salida Museum's hours: its own site says both "Friday thru Sunday 12–4" (under SUMMER HOURS) and "winter hours… Saturday and Sunday". The hub gives Fri–Sun with no season.
- The 48 external 403s (MaxPreps ×18, Adobe Stock ×7, hotel sites), and staycobblestone.com and friscolodge.com, which returned 502 through this session's proxy.

## Decisions for James

- **Tentative dates:** add a status ("Tentative.") or keep "Confirmed." and drop the quoted hedge.
- **/this-weekend/:** add the hub's town-page dates, or retitle the page to the six guides. Separately: fold the two weeks after behind a link, or keep them.
- **Check lines on inner pages:** apply the home's 14 Nov rule, one source line per page, or keep them.
- **"More in Arkansas Valley / Park gateway towns / Front Range cities"** on town pages: these are the area names the home just replaced with a town box. Keep, or use "Towns near Salida".
- **Event pages with no `about`:** fill them, or leave them out of the sitemap until they say what the event is.

## Proposed changes

`data/hub/towns/kremmling.json` (lines 14–15):
```diff
-      "url": "https://www.wyndhamhotels.com/super-8/kremmling-colorado/super-8-kremmling",
-      "source": "https://www.wyndhamhotels.com/super-8/kremmling-colorado/super-8-kremmling",
+      "url": "https://www.wyndhamhotels.com/super-8/kremmling-colorado/super-8-kremmling/overview",
+      "source": "https://www.wyndhamhotels.com/super-8/kremmling-colorado/super-8-kremmling/overview",
```

`content/hub/traditions/trail-ridge-road-closes.md`:
```diff
   - year: 2026
-    status: not-announced
-    typicalWindow: "normally closes in mid-October"
-    checked: 2026-11-12
+    status: confirmed
+    date: 2026-11-13
+    sourceUrl: "https://www.nps.gov/romo/learn/news/trail-ridge-road-closes-to-through-travel-for-winter-2026-2027-season.htm"
+    checked: 2026-11-14
```

`content/hub/traditions/trail-ridge-road-opens.md`: add a 2026 year above 2025. Confirm the day first: the NPS release dated 29 May 2026, the record's own sourceUrl, says the road "is open for the season".
```diff
     checked: 2026-11-12
+  - year: 2026
+    status: confirmed
+    date: 2026-05-29
+    checked: 2026-11-14
   - year: 2025
```

`content/hub/curiosity/colorado-football-playoffs-2026.md`: the two finals checked on CHSAA. The other games need their CHSAA pages read.
```diff
-    away: { name: Fort Morgan, seed: 14, section: "#fort-morgan-high-school-fort-morgan" }
-    home: { name: Palisade, seed: 3, section: "#palisade-high-school-palisade" }
+    away: { name: Fort Morgan, seed: 14, section: "#fort-morgan-high-school-fort-morgan", score: 26 }
+    home: { name: Palisade, seed: 3, section: "#palisade-high-school-palisade", score: 49 }
+    status: final
...
-    away: { name: Rifle, seed: 13 }
-    home: { name: Mead, seed: 4, section: "#mead-high-school-mead" }
+    away: { name: Rifle, seed: 13, score: 7 }
+    home: { name: Mead, seed: 4, section: "#mead-high-school-mead", score: 56 }
+    status: final
```
Update each game's `checked:` to 2026-11-14.
