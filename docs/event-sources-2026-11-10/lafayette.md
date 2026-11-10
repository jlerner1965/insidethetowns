# Lafayette: event sources, 10 November 2026

10 new `proposed` entries in content/lafayette/sources.json; notes appended to 4 existing proposed entries. No status changed. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Nissi's Entertainment and Events (new) | live music and comedy room | rss (Modern Events Calendar) https://nissis.com/events/feed/ | 18 (page lists to Dec 5 only) | exclude Private Event, 100+ Women Who Care | feed holds only the next 10 shows, so about ten days' lead |
| Muse Performance Space (new) | jazz listening room | none; VenuePilot widget, html | 13, plus 1 monthly jazz jam | none | script-only page; needs a browser or a hand read |
| The Arts Hub (existing) | youth and community theatre | none; plain Squarespace text, html | 9 performance dates (Addams Family Dec 3 to 6, showcases, Imagine A Dragon) | none | none; plain fetch now reads it |
| Dog House Music / The End Lafayette (new) | small venue | none; Wix Events, html | 3, plus 6 regulars (open mics, meetups) | Meetup, Open Mic, Speed Dating | no feed |
| Theater Company of Lafayette (new) | community theatre, Arapaho Center | none, html | 3 (Twilight Zone, Nov 13 to 15) | none | season page is an image |
| Center for Musical Arts (new) | music school concert series | json https://centerformusicalarts.org/wp-json/tribe/events/v1/events | 1 concert, 1 student recital; 5 concerts Dec 13 to 17 | exclude Master Class; locationFilter Lafayette | none |
| pARTiculars Art Gallery (new) | co-op gallery | json, same route on particularsart.com | 1 (2nd Friday opening, Nov 13); 21 classes | one regex keeping only openings and markets | check the regex on first read |
| Ghost Box Pizza (new) | restaurant | none; SpotHopper, html | 2; trivia and music bingo weekly | n/a | none |
| Three Leaf Farm (new) | farm | none; Squarespace text, html | 1 (Art in the Barn Holiday Market, Dec 5); 1 sold-out workshop | n/a | seasonal |
| Liquid Mechanics (existing) | brewery | Squarespace collection (ingest cannot read) | 1 (Corkscrew Hill, Nov 16); 20 trucks, 3 trivia | Food Truck, Trivia, Closed | Squarespace; December not read |
| The Read Queen (new) | bookshop | json, same route on thereadqueen.com | 0 new (1 item, already listed) | none | low volume |
| Acreage by Stem Ciders (new) | cidery | json, same route on acreageco.com | 0 (7 in Aug to Oct) | Yoga | empty in winter |
| Lafayette Historical Society (existing) | museum | Events Calendar route in feedUrl, type left html | 0 (board meetings) | Board of Directors | robots `Disallow: /*?` |
| WOW! Children's Museum (existing) | museum | none (own plugin; ?ical=1 and tribe route absent) | 1 (Sensory Friendly Santa, Nov 15) | n/a | no feed |

## 2. Turn on first
1. Nissi's (rss, reads today): about 18 a month.
2. Muse Performance Space (by hand or a future VenuePilot reader): about 13.
3. The Arts Hub (by hand): about 9 in a show month.
4. Center for Musical Arts (json): 1 to 6.
5. Dog House Music / The End (by hand): 3 to 5.

Roughly 45 to 50 listings a month; only Nissi's and the Center for Musical Arts (about 20) arrive by feed.

## 3. Looked for and ruled out
- Motus Theater: Boulder company; its one Lafayette night (Nov 14) is already in the guide.
- East Simpson Coffee: events page says "No upcoming events."
- Bounce Empire: one 18+ night and school fundraisers.
- Cellar West: Wix site with no events page.
- Westbound and Down: Cloudflare 403 on robots.txt; not read.
- Peak to Peak Charter School: school days and sports; feeds under /fs/, disallowed.
- Romero's K9 Club: no events link on the home page.
- lafayetteoatmealfestival.com and William Oliver's: hosts unreachable (guessed domains).
- downtownlafayette.org: Louisiana, not Colorado.

## 4. Fetched despite a robots rule
Not under the subscription exception; an error: www.liquidmechanicsbrewing.com/events?view=calendar&month=12-2026 was loaded once in the headless browser (Squarespace disallows `?view=` and `?month=`); it returned nothing useful. The allowed /events page's own script also moved to ?view=calendar&month=11-2026 and called /api/open/GetItemsByMonth. Nothing else.

## 5. What a resident would say
- A reviewer quoted on the Muse's home page: "Every Monday there is Jam Session with Brad Goode and Pete Lewis. Great jazz venue." (museperformancespace.com)
- Theater Company of Lafayette says this is the 14th time it has staged its Twilight Zone format (tclstage.org).
