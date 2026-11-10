# Castle Rock: event sources, 10 November 2026

Five entries added to content/castle-rock/sources.json, all `proposed`, `robots: honor`. No existing entry changed. `npm run validate`: 0 errors.

## 1. Sources found

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Live Well Douglas County (`livewelldougco-com`) | county-wide listing site | json, https://livewelldougco.com/wp-json/tribe/events/v1/events | 8 in Castle Rock of 56 county-wide; 4 new to the guide (Veterans Day Fireworks 11 Nov, Festival Park Starlight Market 4 and 5 Dec, Reindeer Games 5 Dec) | locationFilter "Castle Rock" | Third party's listing, publisher not named; check each against the organizer link. robots allows it |
| Castle View High School (`cvhs-dcsdk12-org`) | school stage | ical, https://cvhs.dcsdk12.org/fs/calendar-manager/events.ics?calendar_ids[]=8 | about 11 of 40 (Musical 10 and 14 Nov, Crimson Players 3 to 5 Dec, four concerts, Thespian Showcase) | 13 title exclusions; default venue | robots disallows /fs/; needs `subscribe`. Titles do not name the show |
| Douglas County High School (`dchs-dcsdk12-org`) | school stage and gym | ical, https://dchs.dcsdk12.org/fs/calendar-manager/events.ics?calendar_ids[]=113&calendar_ids[]=114 | about 10 of 244 (IB Recital, band, choir, orchestra concerts; 6 varsity home games) | 18 title exclusions (practices, rentals, bell schedule, sub-varsity, away); default venue | robots disallows /fs/; needs `subscribe`. Exclusions need a dry run |
| Castle Rock Dance Academy (`castlerockdanceacademy-com`) | dance company | html, no feed | 0 in window; The Nutcracker of Castle Rock, 6 shows 17 to 20 Dec at Castle View HS | by hand | none |
| CALF, Lowell Ranch (`thecalf-org`) | education ranch | html, no feed | 0; Farm and Ranch Day (May), Harvest Day (Sept) | by hand | ranch street address not on pages read |

## 2. Turn on first

1. Live Well Douglas County: the only readable route to the Town's own seasonal events while crgov.com is 403. About 4 new a month, more in summer.
2. Castle View High School: about 11.
3. Douglas County High School: 4 concerts, or 10 with varsity home games.
4. Castle Rock Dance Academy by hand: 6 Nutcracker dates in December.
5. Ecclesia Market (already proposed, about 8): still the best music source in town.

The three new feeds add roughly 20 to 25 listings a month; with Ecclesia about 30.

## 3. Looked for and ruled out

- Wild Blue Yonder Brewing: no events page (private events only).
- Great Divide Brewery and Roadhouse: /events-releases/ is beer releases, no Tribe API.
- Courtyard Social, Crush Wine Bar: events pages say "We are updating our events".
- Z'Abbracci: "New Events Coming Soon".
- Union American Bistro: weekly drink specials only.
- COFF33: has The Events Calendar, 0 upcoming events.
- Teaology Tea Cafe (Wix Events): 2 in window, both classes (watercolor, "All Things Spiritual").
- The Emporium: paint parties via Just Artin' Around (classes; JavaScript site).
- The Barn: /events/ holds 2020 placeholders.
- The EDGE Ziplines: winter hours page, no dated events.
- Front Range Theatre Company: camps and library partnerships, no show calendar.
- Castle Rock Orchestra: Google calendar (littletonmusic.cro@gmail.com) has 41 items, none since 2024; castlerockorchestra.org fails its TLS certificate.
- Castle Rock Band (castlerockband.com): /concerts renders only its menu, even in Playwright.
- Castle Rock Senior Activity Center: monthly PDF calendar, members' programs; no Tribe API.
- Castlewood Canyon State Park (CPW): park page shows only statewide free-entry days; cpw.state.co.us/events answered 403.
- Cherokee Ranch and Castle: in Sedalia (6113 N. Daniels Park Road), no Tribe API; sells through OvationTix. Worth a decision if the guide wants it.
- Arapahoe Community College, Sturm campus: college-wide student events, no feed.
- Castle Rock Artist Alliance / Rhyolite Gallery: castlerockartistalliance.com answers 406 to automated requests; not read.
- Scileppi's, Alidade Brewing, Lost Coffee: Cloudflare 403 challenge.
- Run to Change Lives (Turkey ROCK Trot): 406; the race is already listed.
- Burly Brewing: burlybrewing.com is "site not found".
- therinkattherock.com: a parked domain.

## 4. Fetched despite a robots rule

- cvhs.dcsdk12.org: https://cvhs.dcsdk12.org/fs/calendar-manager/events.ics?calendar_ids[]=8 (subscription feed, /fs/ disallowed), once.
- dchs.dcsdk12.org: https://dchs.dcsdk12.org/fs/calendar-manager/events.ics?calendar_ids[]=113&calendar_ids[]=114 (same), once.
- calendar.google.com: https://calendar.google.com/calendar/ical/littletonmusic.cro%40gmail.com/public/basic.ics (Castle Rock Orchestra's public calendar), once.
- coff33.co: https://coff33.co/wp-json/tribe/events/v1/events?per_page=50&start_date=2026-11-10, once, by mistake: I read its robots.txt (`Disallow: /*?`) only after the request. It returned 0 events; the bare path, which is allowed, confirmed 0. No entry added.

## 5. What a resident would say

- The Town runs a "Season of the Star": Starlighting, then the Festival Park Starlight Market and Reindeer Games at Philip S. Miller Park (Live Well Douglas County's listings, linking crgov.com/2622/Season-of-the-Star).
- The Nutcracker of Castle Rock calls itself "a community tradition", in its 12th year (castlerockdanceacademy.com).
