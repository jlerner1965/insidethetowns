# Leadville: event sources, second pass, 10 November 2026

No new readable feed exists in Leadville: everything found is a page a person reads, and almost nothing new falls in the window. `npm run validate`: 0 errors. Only content/leadville/sources.json changed: 5 new `proposed` entries, dated notes appended to 4 existing proposed ones.

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Cloud City Conservation Center (new, `c4leadville-org`) | nonprofit, farm markets, talks | html, c4leadville.org/c4events (Squarespace) | 1 (Climate & Coffee, 19 Nov, 8 am, Visitor Center); Posada 12 Dec is just outside; 5 regulars | exclude "Office Hours" | robots disallows ?format=json and ?format=ical |
| Tennessee Pass Nordic Center and Cookhouse (new) | Nordic area, ticketed dinners | html, tennesseepass.com/public-events/ | 0; page still shows last winter's Full Moon Skis | none | Events Calendar REST is empty; robots disallows `/*?` |
| Cloud City Wheelers (new) | bike club, races | html, cloudcitywheelers.com/events-calendar | 0; five Winter Bike Series races 16 Jan to 3 Apr 2027 | exclude weekly group rides | no feed |
| Alpine Orchestra (new) | orchestra | html, alpineorchestra.org/next_concerts.html | 1 (13 Nov, 7 pm; guide has it) | drop Salida and Buena Vista nights | no feed |
| Leadville Ski Joring (new) | festival | html, leadvilleskijoring.com | 0; 6 to 7 March 2027 | none | no feed |
| Tabor Opera House (existing, note added) | theatre | html; Events Calendar plugin now installed but empty | 1 (Toddies for the Tabor, 3 Dec; guide has it) | none | shows only in CueBox list |
| Two Mile Brewing (existing, note added) | brewery | html | 0; read in a browser, no events page at all | none | nothing to poll |
| Leadville Railroad (existing, note added) | excursion train | html, /special-events-on-the-leadville-railroad/ | 0 new (Holiday Express from 14 Nov) | none | dates sit in FareHarbor |
| Mineral Belt Trail / Loppet (existing, note added) | ski race | html | 0; no 2027 date on the page | none | registration host blocks AI crawlers |

## 2. What to turn on first
None has a feed, so nothing can be turned on for ingest. By hand, in order: Cloud City Conservation Center (1 to 3 a month), Tennessee Pass (4 or 5 evenings a winter, from December), Cloud City Wheelers (5 races January to April), Ski Joring, Alpine Orchestra. Together about 2 to 4 listings a month in winter. The one that could become a feed is the Tabor Opera House: if it starts entering shows in its new plugin, `https://taboroperahouse.org/wp-json/tribe/events/v1/events` is the feed.

## 3. Looked for and ruled out
- leadville.com (private portal with an Events Calendar feed): robots.txt names ClaudeBot, anthropic-ai and Claude-Web with `Disallow: /`. No entry.
- Leadville Herald: same robots block; not fetched.
- History Colorado (Healy House events): AWS WAF challenge (202, empty), robots.txt included.
- Full Circle of Lake County: public Google Calendar, 510 items, all youth-program sessions and school lunches; nothing public.
- Lake County Build a Generation (lcbag.org): Events Calendar installed, 0 events.
- Before & After, Treeline Kitchen, Cloud City Mead: Squarespace sites with no events page. Pastime, Manhattan Bar, Scarlet Tavern post only on Facebook or Instagram.
- Fire on the Mountain: undated standing classes. Harperrose Studios, Galena, Elevation Goods: shops, no events.
- Leadville Boom Days: site is http only (https has a self-signed certificate), still on 2026; August. No entry.
- Get Outdoors Leadville, Cloud City Mountain Sports, St. Vincent Health, High Mountain Institute: no public events lists.
- fourteenernet.com: closed. twinlakesinn.com, leadvilleusa.com: parked. leadvilleskijoring.us: redirects to an unrelated site.
- Lyric Theatre of Leadville, Leadville Arts Coalition, The Old Church: no sites of their own found; their events reach the tourism calendar.

## 4. Fetched despite a robots rule
- calendar.google.com: `https://calendar.google.com/calendar/ical/fullcircleleadville.org_edg9mvq2au6qbu5ovoovova5h8%40group.calendar.google.com/public/basic.ics`, once.
- www.c4leadville.org: `/c4events?format=json`, `/events?format=json`, `/farm-events?format=json`, once each. My error, not the exception: fetched before I read the `Disallow:/*?format=json` line. The entry's count was re-read from the allowed HTML page.
- leadville.com: home page and `/events/?ical=1` (empty body), fetched before its robots.txt was read. Nothing used.
- leadvilleloppet.itsyourrace.com: `/event.aspx?id=286`, one request sent by a chained command after its robots.txt had shown the AI block; it returned a Cloudflare block page. Nothing read.

## 5. What a resident would say
The Mineral Belt Trail's own page calls the Loppet "one of the most loved events in Leadville", where locals "ski in costumes" and "savor the race's legendary post-race potluck" (mineralbelttrail.com).
