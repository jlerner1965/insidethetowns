# Erie: event sources, 10 November 2026

Only content/erie/sources.json was edited: 6 new entries (all proposed), 4 existing entries given a feedUrl and notes. No status changed. Validate: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Erie Community Library (existing, confirmed) | library | LibCal RSS, branch parameter is `cam`: `highplains.libcal.com/rss.php?iid=4057&m=month&cid=8181&cam=4556` | 14 of 73; 58 regulars | storytimes, clubs, CLOSED | Mostly in the guide by hand already: check doubles. Owner must switch type |
| The Old Mine (existing, now ical) | cidery, music | Google iCal `oldmine.calendar@gmail.com` | 5 of 139 (4 named music nights, a cider release); 7 regulars | TRIVIA, No Live Music, Closed, Brisket Sandwich Special | Needs `robots: subscribe` |
| Erie High School (new) | school stage | Google iCal `svvsd.org_27ajla9cn99nv52ectmgs1i33k@group...` | 6 of about 170 (One Acts, winter concerts, Winter Showcase) | 37 title exclusions on the entry | Needs `robots: subscribe`; dry run first |
| Erie Middle School (new) | school stage | Google iCal `svvsd.org_jvafr657arkbdcf2c4psj6ma78@group...` | 2 unique of 62 (Talent Show, Drama Production); 3 concerts double the high school's | on the entry | Same; small |
| Erie Chamber (existing) | chamber | ChamberMaster RSS `/feed/rss/UpcomingEvents.rss`, 10 items, date in title | 4 in Erie (holiday market, Tiny Art Show, Parade of Lights) | networking, karaoke, out-of-town items | Ingest cannot read it; stays html |
| Briggs Street Books and Music (new) | bookshop | none; month is one picture | 3 (Author Spotlight 14 Nov, Westerly Holiday Market, Shop Small Saturday); 2 book clubs | none | manual |
| Colorado Railbike Adventures (new) | seasonal ride | none | Illuminated and Daytime Christmas rides; dates not read | none | Dates only in FareHarbor, robots disallows |
| Co-Create Erie (new) | makerspace | none, HTML | 1 (Tiny Art Show, 29 Nov) | none | Space not open yet |
| Erie Historical Society (new) | museum | Events Calendar API answers, but empty | 0 (Homestead Christmas is 12 Dec) | none | Events are plain pages |
| Anderson Farms (existing, now ical) | farm | Sugar Calendar iCal `andersonfarms.com/events/ics/` | 0 of 95 (season is 1 Aug to 31 Oct) | Food Trucks | Out of season |

## 2. Turn on first

Library RSS, The Old Mine, Erie High School, then the chamber and the bookshop by hand. Together about 30 rows a month; about 15 are new to the guide, since the library's are already entered by hand (the feed saves that work). Anderson Farms before August.

## 3. Looked for and ruled out

- Cellar West, 445 Briggs St: custom Wix calendar, shared with Lafayette; Erie's items are weekly Vinyl Night and food trucks only.
- Downtown Erie (downtownerie.biz): Wix event list holds two 2025 items, stale.
- Echo Brewing, The Dugout, Birdhouse, Fox Dog Coffee: no calendar (Fox Dog's events page is empty; Birdhouse's is private hire; Dugout is Friday karaoke).
- Erie Social Club: mahjong, a book club, drink specials. Regulars.
- Boulder Valley Velodrome: calendar page empty; cyclocross was 7 November.
- Colorado National Golf Club: calendar empty for November.
- Little Grove, 512 Briggs St: children's play centre, opened 9 November; no events.
- Westerly (builder's site), The Recess Factory, Erie Optimists (Eerie Erie only, past); chamber members outside Erie (Winner's Circle, Axe Me Out, Toro Events Center, Blake's Taphouse).
- Not fetched: Soaring Heights PK-8's Google Calendar (id `svvsd.org_7lg21lnlet5822vuh86kj719bk@group...`), Eventbrite, Bandsintown.

## 4. Fetched despite a robots rule

- calendar.google.com (robots: `Disallow: /`), once each: `/calendar/ical/oldmine.calendar%40gmail.com/public/basic.ics`; the Erie High ids `svvsd.org_27ajla9cn99nv52ectmgs1i33k%40group...`, `c_mm55cdu30ih6er3ns1moer3i18%40group...` (404), `svvsd.org_363830393531322d363532%40resource...`, `f7p50q3enflbljla64hn92lhmg42o54m%40import...` (404); the Erie Middle id `svvsd.org_jvafr657arkbdcf2c4psj6ma78%40group...`.
- **My error, not the exception:** `https://www.theoldmine.com/events?format=json` was fetched twice before I had read the whole robots.txt, which disallows `?format=json`. It returned page data with no events; nothing from it was used.
- highplains.libcal.com has no Disallow, but its `Crawl-delay: 10` was not kept for four RSS requests in a row.
- Cellar West's widget endpoint (`gy7zo3-496fb0090aa33260-certifiedcode.wix-host.com/api/calendar-feed`): its robots.txt answered 500; one request, also 500, nothing read.

## 5. What a resident says

"Living in Erie means enjoying bike rides to Downtown Erie for the farmers market, meeting friends for drinks at one of the amazing restaurants on Briggs, shopping for unique gifts at local stores, and always running into a friendly face." Lisa S., resident, quoted on downtownerie.biz.
