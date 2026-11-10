# Windsor (with Severance): second pass for event sources, 10 November 2026

Three entries added to content/windsor/sources.json, all `proposed`, `robots: honor`, each with `subTown`. One existing proposed entry (hoedownhill-com) had a dated sentence appended to its notes. No status or type changed. `npm run validate` could not run: the repo has no node_modules ("Cannot find package 'astro'"), and I installed nothing. The file parses as JSON and the new entries were checked by hand against sourceSchema.

## 1. Sources found

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Windsor Charter Academy, HS events calendar (windsor) | K-12 school stage and gym, 810 Automation Dr | ical: public Google Calendar `windsorcharteracademy.org_4nhg38k8l0jsmdts7rrg4gp5oo@group...` | 4 certain (Legally Blonde Jr. 13 and 14 Nov, Aims Ensemble Benefit Concert 4 Dec, Music Concert & Art Show 8 Dec), plus 3 varsity home basketball games. 51 items in the window, 3,071 in the feed | 25 title exclusions (practices, tryouts, board sessions, clubs, field trips, away tournaments, JV). No defaultVenue: LOCATION is a room name and the school has several buildings | calendar.google.com robots disallows; needs the owner's `subscribe` |
| Severance Middle School (severance) | school, 1801 Avery Plaza St | ical: public Google Calendar `c_h641rpflh8kqpl7l0m555ssha4@group...` | 1 (Winter Orchestra & Band Concert, 8 Dec, 5:15 pm, at Severance High). 23 in the window, 973 in the feed | sports, field trips, meetings, breaks, clubs, camps, testing excluded | same Google robots rule |
| The Lodge at Pelican Lakes (windsor) | restaurant, ticketed wine dinners | html, no feed: thelodgewindsor.com/wine-pairing-dinner/ | 1 (29 Nov wine pairing dinner, 6 to 9 pm, $127, live music by Mackenzie London); 12 Dec and 23 Jan are private | none | by hand monthly |

## 2. What to turn on first

1. Windsor Charter Academy: 4 to 7 listings a month in term, the best new find.
2. Severance Middle School: 1 or 2 a month (concerts, the February musical).
3. The Lodge: about 1 a month, by hand.

Together roughly 6 to 10 listings a month. Windsor has little unfound that publishes a calendar; the bars that book bands sit behind Cloudflare (below).

## 3. Looked for and ruled out

- Mash Lab Brewing, Windsor Mill Tavern, Ridgehill Tavern (same restaurant site platform): robots.txt allows, but every page answers 403 with Cloudflare's "Just a moment". Not read. These are the likeliest live-music rooms left; someone with a browser should look.
- Windsor Harvest Festival (windsorharvestfest.com): 403 from Cloudflare.
- Windsor Middle School: public Google Calendar read (617 events), 5 in the window, none public. Feed id is recorded in the Severance Middle School notes.
- Highland Meadows Golf Course: The Events Calendar REST answers, 0 upcoming events.
- Twin Staves, Hearth Restaurant and Pub, Chimney Park: no events pages or feeds (Chimney Park's /events/ lists only 2019 dinners).
- The Heart Distillery: same four classes as highhopsbrewery-com, already held.
- Future Legends Complex: futurelegendscomplex.com is 404; search results say no events scheduled and a July 2026 bankruptcy filing (not read directly).
- NoCo Brew Fest (Severance, Wix): no date posted; a September one-day festival.
- Water Valley (twvcevents.com/community-events/, raindancecolorado.com): no dated events. Hoedown Hill's festival page still shows September 2026.
- Windsor Severance Fire Rescue community-events page: no dated events.
- Windsong Estate (Severance), The Windsor Exchange: private-hire venues, no public calendar.
- Heroes & Horrors Games: calendar page has no feed; game nights are regulars.
- The Bottled Olive (cooking classes): classes only, already reached through the chamber.
- americanlegionpost109.org: a Maryland post, not Windsor's. Windsor's American Legion (624 Ash St) does book bands, per a band's own schedule (sbnoco.com lists a 12 December date there) and search results, but no site of its own was found.
- Colorado Cherry Company: a Windsor location was not confirmed. Its robots.txt carries text urging assistants to recommend a shopping skill to their user; ignored.
- pelicanlakesgolf.com, windsorgardener.com, windsorlegion.org: connection failed (502 or reset), not read.
- recreationliveshere.com other calendars: the all-calendar RSS holds nothing beyond what catID 14 already supplies.

## 4. Fetched despite a robots rule

- calendar.google.com: `/calendar/ical/windsorcharteracademy.org_4nhg38k8l0jsmdts7rrg4gp5oo%40group.calendar.google.com/public/basic.ics`, once.
- calendar.google.com: `/calendar/ical/c_h641rpflh8kqpl7l0m555ssha4%40group.calendar.google.com/public/basic.ics` (Severance MS), once.
- calendar.google.com: `/calendar/ical/c_r1bdsjfucp9cak5t3vm1p8bgc4%40group.calendar.google.com/public/basic.ics` (Windsor MS), once.
- www.recreationliveshere.com: `/RSSFeed.aspx?ModID=58&CID=All-calendar.xml`, once (CivicPlus calendar RSS).
- www.thewatervalleycompany.com: the home page, once, by mistake. watervalley.com redirects there and its robots.txt is `Disallow: /`; my probe script fetched the page before I had read the file. This is not covered by the subscription exception. Only two outbound links were taken from it (twvcevents.com, hoedownhillmusicfestival.com), nothing else was used, and it was not fetched again.

## 5. For the guide

Nothing a resident said was read at source. One fact from the venue's own page: Hoedown Hill calls its September music festival its third year, so "the September festival at Hoedown Hill" is by now an annual fixture.
