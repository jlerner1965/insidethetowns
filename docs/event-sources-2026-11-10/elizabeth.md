# Elizabeth: event sources, second pass, 10 November 2026

Five entries appended to content/elizabeth/sources.json, all `proposed`, `robots: honor`; no existing entry changed. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Elizabeth Kitchen + Bar (`elizabethkbar-com`) | bar, 240 S Elizabeth St | GoDaddy calendar JSON at calendar.apps.secureserver.net (typed `manual`, URL in feedUrl) | 4: sign painting 12 Nov, Mike Maurer live 25 Nov, Comedy Show 5 Dec, Christmas Cow Painting 10 Dec. Regulars 10 (karaoke, open mic, video bingo, Broncos) | 11 title exclusions (specials are 65 of 100 items); defaultVenue | Ingest has no reader for this JSON; page is script-drawn, so by hand in a browser |
| Legacy Academy (`legacyk8-org`) | K-8 charter, 1975 Legacy Circle | Google Calendar iCal | 4: PTCO Craft Fair 14 Nov, grade concerts 1 and 2 Dec, Fall Theater Performance 3 Dec | keep only `EVENT:` titles (5,394 VEVENTs, mostly athletics and clubs); defaultVenue | Google robots rule: needs `robots: subscribe` |
| Elbert County Chamber (`elbertcountychamber-org`) | chamber, 338 S Main St | Google Calendar iCal | 0 (networking only); in season 1 or 2 a month (Fall Fest & Movie in the Park, Carriage Shoppes Christmas Open House, Business Expo) | 15 networking exclusions; locationFilter Elizabeth | Google robots rule; low yield |
| AllEvents, Elizabeth CO (`allevents-in-elizabeth-co`) | aggregator of Facebook events | none (html) | about 10 leads: Veteran's Spaghetti Dinner 13 Nov, two workshops at The Nest (15, 22 Nov), Christmas at the Ranch 5 Dec | by hand | not an organizer: every item needs checking |
| Elizabeth Celtic Festival (`elizabethcelticfest-org`) | festival, 18 and 19 July 2026 | none (html) | 0 | none | seasonal |

## 2. Turn on first

1. Elizabeth Kitchen + Bar: the only room in town with a changing programme; about 4 one-offs a month (14 with regulars). Needs a reader for GoDaddy's JSON or a monthly hand read.
2. Legacy Academy with `robots: subscribe`: 2 to 4 a month in term.
3. AllEvents as a weekly hand-check page for what venues post only on Facebook: 5 to 8 a month once checked.
4. Elbert County Chamber: 0 to 2 a month.

Roughly 10 to 15 listings a month, half by hand.

Two things for a person:
- Mayor's Tree Lighting: a search result quotes the Town's page as Saturday 5 December 2026, 3 to 6 pm on Main Street, lighting at 5. The Town's site is 403 to me; check `mayors-tree-lighting.md` against it.
- AllEvents shows "Austin Allen Live" at the bar on 14 November and "Comedy Night Returns" on 12 December; the bar's own calendar has neither and puts the Comedy Show on 5 December.

## 3. Looked for and ruled out

- elizabethchamber.org, elizabethkiwanis.org: parked. elizabethcelticfestival.com: hijacked.
- Elbert County Artists Guild: its site fails TLS verification and answers 503; locable.com copy 403. Not read.
- Elizabeth High athletics: on gobound.com, 403.
- Spring Valley Golf Club: calendar empty for November, one past golf event, no Tribe API.
- Antelope Alpacas (classes suspended since 2022), Elizabeth UMC (no events page), American Legion Post 82 (no calendar).
- The Nest at the 1897 House: no website; appears on AllEvents.
- Independence (housing development): marketing blog RSS, not events.
- Patch's Elizabeth calendar: stale.
- The Carriage Shoppes, Songkick, Bandsintown, Colorado Community Media: robots.txt names ClaudeBot `Disallow: /`; not crawled.
- Eventbrite, Macaroni KID: other towns' events.
- Holly Acres tree farm: site 404.

## 4. Fetched despite a robots rule

Published-calendar exception, once each, both on calendar.google.com:
- `/calendar/ical/c_b42d639c9fb5436ac519d6e4e418048656a1437384d115a91c5e677b75c14ccc%40group.calendar.google.com/public/basic.ics` (chamber)
- `/calendar/ical/legacyk8.org_3rrge904rvsra8n4f3l33fa6vg%40group.calendar.google.com/public/basic.ics` (Legacy Academy)

Mistakes, not exceptions: three hosts were fetched in the same command as their robots.txt, before I had read the rule, and each names ClaudeBot `Disallow: /`: thecarriageshoppes.com (home page), www.songkick.com (`/venues/458851-casey-jones-park-pavilion`), coloradocommunitymedia.com (`/events/`, answered 429, and `/local-events/`). Files deleted; nothing from them is in the registry. elizabethkbar.com reset every curl connection, so it and its robots.txt (allows all but /404) were read with the fetch tool and Playwright.

## 5. What a resident would say

- "This venue regularly hosts events like comedy night, so check the schedule for your next date night", of Elizabeth Kitchen + Bar (Independence community blog, 23 October 2026).
- The same blog (18 September 2026) names the Town's annual Historic Downtown Walk & Talk, late September: a date the guide could carry.
