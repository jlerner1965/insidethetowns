# Loveland: event sources, 10 November 2026

17 new `proposed` entries; the confirmed downtownloveland-org gained a `feedUrl` and a dated note (type and status unchanged). Validate: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Loveland Downtown Partnership (existing, confirmed) | shared downtown calendar | iCal, tockify.com/api/feeds/ics/lovelanddowntown | ~18 of 42 | Bingo, Trivia, Book Club, Live Jazz, BBQ, Bonsai, private | Tockify robots disallows /api/; needs `subscribe`. Lists others' events; duplicates the Rialto |
| Crooked Beech Brewing | brewery, music | iCal (Google Calendar) | 7 of 27 | ~17 food trucks, cornhole, poker, clubs | Google robots; needs `subscribe` |
| Loveland Aleworks | brewery, music Fri/Sat | html (/live-music, /eventsatlovelandaleworks) | 10 (6 named acts) | book clubs, classes, trivia | No feed; December not posted; same items are in the Tockify feed |
| Sweet Heart Winery | winery: music, dinners | html | 8 | tastings, holidays, Fort Collins/Windsor rows | No feed; Loveland street address not found |
| Loveland Museum (thelovelandmuseum.org) | City museum | html (its Events Calendar feeds are empty) | 6 | none | Not behind the City's Akamai wall |
| Thompson Valley High | school | iCal (Finalsite) | ~9 (4 concerts, home varsity) | away, JV, clubs, meetings | robots disallows /fs/; needs `subscribe` |
| Loveland High | school | iCal (Finalsite) | ~5 (home varsity) | same | same |
| Mountain View High | school | iCal (Finalsite) | 2 | same | same |
| Centerra | district events (Chapungu, Kinston) | html, month archives | 4 (9 more 11 to 19 Dec) | weekly music, trivia, HPEC items, drives | No feed |
| Grimm Brothers Brewhouse | brewery, concerts | html | 3 | none | No feed (custom post type) |
| Verboten Brewing | brewery, acoustic Sundays | RSS, /events/feed/ (MEC) | 3 | trivia, poker, writing group, Fort Collins taproom | Feed holds 10 items; dates look a day off; reader may not parse mec: fields |
| Lincoln Gallery (TVAL) | gallery | iCal (Google Calendar) | 3 | staff-shift names, meetings, closures | Mostly a staffing calendar; needs `subscribe` |
| Sky Bear Brewery | brewery | html (Wix) | 2 | trivia, bingo, puzzles, book club | No feed |
| MeadKrieger | meadery | manual (Squarespace) | 2 | drink specials, hours | Ingest cannot read Squarespace |
| Loveland Orchestra | orchestra | iCal (static season file) | 1 (4 Dec) | none | A file uploaded once a season |
| Loveland Historical Society | talks at the museum | html (Wix) | 1 (19 Nov) | none | Time not on list |
| Artworks Center for Contemporary Art | gallery | manual (Squarespace) | 1 (13 Nov opening) | none | Squarespace |
| High Plains Environmental Center | nature center | iCal (Google Calendar) | 0 to 2 | cancelled, volunteer, children's series | Quiet until February; needs `subscribe` |

## 2. Turn on first

1. Downtown Partnership Tockify feed (covers Aleworks, MeadKrieger, Artworks, Big Thompson Brewery, the Historical Society in one read).
2. Crooked Beech Brewing.
3. Thompson Valley High, with Loveland High and Mountain View (one decision, same host).
4. Loveland Museum, by hand.
5. Sweet Heart Winery, by hand.

Together roughly 45 to 50 listings a month (about 18 + 7 + 16 + 6 + 8, less a few duplicates). Centerra adds a dozen in December.

## 3. Looked for and ruled out

- Independence Gallery ("Stay tuned"), Sage Speakeasy ("updating our events"), The Flipside (no dated events).
- desk chair workspace: 2 items, one a members' hour; reaches the Tockify feed.
- Loveland Opera Theatre: nothing until 16 January. Loveland Choral Society: concerts already in the Rialto feed.
- Chapungu site (points to Centerra), Forge Campus (hire page), Sylvan Dale (lodging specials only).
- Big Thompson Brewery: bingo and a paint night, in the Tockify feed.
- Black and Blues Music and Brews: own site answers 402; Bandsintown's robots.txt disallows ClaudeBot, not read.
- Pourhouse: Cloudflare 403, robots.txt included.
- Not reached: Promenade Shops, Boyd Lake, the cinema, Tom Davis Saloon, NoCo Cat Cafe (connection reset).

## 4. Fetched despite a robots rule (once each)

- tockify.com: https://tockify.com/api/feeds/ics/lovelanddowntown
- calendar.google.com: Crooked Beech, Lincoln Gallery and two HPEC public calendars (`/calendar/ical/<id>/public/basic.ics`)
- lhs.tsd.org, mvhs.tsd.org, tvhs.tsd.org: `/fs/calendar-manager/events.ics?calendar_ids[]=…` (robots disallows /fs/)

## 5. What a resident would say

- "Live music at Loveland Aleworks is free": winter Saturdays indoors on the loading dock, Fridays and Saturdays when it warms up (lovelandaleworks.com/live-music).
- The holidays start with the Festival of Lights on 4th Street (20 November, on the newly rebuilt street) and Flip the Switch at Chapungu (13 November) (Loveland Choral Society and Centerra pages).
