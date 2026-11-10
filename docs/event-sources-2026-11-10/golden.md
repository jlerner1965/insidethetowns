# Golden: event sources, 10 November 2026

Nine entries added (all `proposed`, `robots: honor`); thegoldenmill-com notes extended. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Golden Today, Live Music calendar | resident-run newsletter's calendar (aggregator) | ical, Google Calendar `72bpivh04aocdsuofijfrsf1bg@group...` | 12 named acts (4 at Miners Saloon new) | drop "More Live Music", unnamed "Live Music @ Golden Mill" | Google robots rule; duplicates venue listings |
| Golden Today, Golden Cultural Alliance calendar | same; museums, Miners Alley, art center, library | ical, `tg1827dlqfoph1rtj5dsbg8cn8@group...` | about 16 one-offs plus about 12 Miners Alley performance nights from weekly rules | 29 title exclusions (storytimes, clubs, classes) | robots rule; duplicates library and museum feeds |
| Golden Today, Olde Golden Christmas calendar | same; holiday season | ical, `5b6eru4tumr8ftgt7bohjk3tsk@group...` | about 15 (KOSI Holiday Flip, Christkindl Market, Golden High bazaar and choir concert new) | 2 | robots rule; seasonal |
| Golden Today, main "Events in Golden" calendar | same; everything | ical, `ib10lknj7255htdq1r34sa4tfo@group...` | about 20 of 51 one-offs, half new (Sand Mandala Festival, International Day at Mines) | 41 exclusions, still needs a person | robots rule; 17 MB; fills two weeks ahead |
| New Terrain Brewing | brewery with a music series | json, `newterrainbrewing.com/wp-json/tribe/events/v1/events` (iCal also answers) | 7 (5 already listed by hand) | `includeCategories: ["Golden"]` drops the Palisade taproom; 15 food trucks excluded by name | trucks have no category, so a new truck needs a new exclusion |
| Goosetown Station | bar with bands | ical, Google Calendar `goosetownstation@gmail.com` | 3 | closed, private party, truck emoji | robots rule; emoji in titles |
| The Golden Mill (existing entry, notes extended) | food hall | none (Wix Events), html | 6 | trivia, bingo | no feed |
| Holidaily Brewing | brewery | none, html | 3 | food trucks, closure, tour, bingo | structured-data times look wrong |
| Mountain Toad Brewing | brewery | Squarespace `?format=json`, manual | 1 (Holiday Market 6 Dec) plus Drag Bingo | 5 regulars | ingest cannot read Squarespace |
| UllrGrass | festival, Parfet Park | none, html | 0 (29 to 31 Jan 2027) | none | once a year |

## 2. Turn on first

1. Golden Today Live Music: about 12 a month, 4 or 5 new after duplicates.
2. Golden Today Cultural Alliance: about 25 to 30 rows a month, of which the Miners Alley nights (about 15) cannot be read anywhere else by machine.
3. New Terrain Brewing: about 7, replacing hand entry.
4. Golden Today Olde Golden Christmas: about 15 in season, 6 new.
5. Goosetown Station: 3 to 6.

Roughly 60 listings a month before duplicates, perhaps 30 to 35 new. Golden Today is an aggregator: review it like a chamber source, and the owner may want to ask its publisher first.

## 3. Looked for and ruled out

- Buffalo Rose: EventON plugin, no calendar feed; `/events/feed/` is RSS by post date, not show date.
- Cannonball Creek Brewing: Squarespace calendar is 21 food trucks and a closure.
- State 38 Distilling: no events collection on its site; its classes appear in Golden Today's main calendar.
- Colorado Mountain Club: iCal has 330 statewide member trips with no location field.
- American Mountaineering Museum: Squarespace events collection empty.
- Rocky Mountain Quilt Museum: events page renders no dated items in HTML; covered by the Cultural Alliance calendar.
- Golden High School: Finalsite calendar page exposed no feed, in HTML or a browser; `/fs/` disallowed.
- Mother Cabrini Shrine: Mass times only.
- Rock Rest Lodge: calendar.php has no text. Miners Saloon: site answered 503.
- Over Yonder Brewing: robots.txt `Disallow: /` and the site returns 404.
- Not reachable (proxy 502 or connection reset, not retried by other means): dirtydogsroadhouse.com, denverkickers.org, gcb.beer, goldencitybrewery.com, goldenmoondistillery.com; tributarygolden.com redirects to another business (403); dinoridge.org 403.

## 4. Fetched despite a robots rule

calendar.google.com (robots.txt disallows /calendar), each once:
- `/calendar/ical/goosetownstation%40gmail.com/public/basic.ics`
- `/calendar/ical/<id>%40group.calendar.google.com/public/basic.ics` for the six Golden Today calendars: 72bpivh04aocdsuofijfrsf1bg (Live Music), tg1827dlqfoph1rtj5dsbg8cn8 (Cultural Alliance), 5b6eru4tumr8ftgt7bohjk3tsk (Olde Golden Christmas), ib10lknj7255htdq1r34sa4tfo (main), lp234bghamnd25363cubnncj0s (Halloween, not registered), mgrm87ki00c9soumkckcsse4ro (Master Calendar Only, placeholders, not registered).

## 5. What a resident would say

- Golden Today's about page: "an independent publication launched in February 2007 by Barb Warden".
- Miners Saloon books a different named player each Wednesday at 6 pm (Golden Today's Live Music calendar); the guide lists it as one standing item.
