# Estes Park: event sources, 10 November 2026

14 entries added to content/estes-park/sources.json (all `proposed`, `honor`). Two confirmed entries got a `feedUrl` and a dated note, types unchanged. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| The Rock Inn Mountain Tavern | music room | html, rockinnestes.com/music-calendar | 18 named acts | none | no feed; 7 local acts rotate |
| Events Complex (existing) | Town events | Google iCal, in `feedUrl` | 6: Veterans Memorial, Tree Lighting, Chase the Glow 5k, Glow Parade, Holiday Wine and Craft, Thumbs Up Vertical Challenge | Private Event/Meeting, Pickleball, Walking | needs `robots: subscribe` |
| School District R-3 | school stage | ical, estesschools.org/calendar/calendar_424.ics | 6 of 59: musical x3, blood drive, choirs concert, 5th grade music | 18 exclusions set | floating times, no TZID |
| Avant Garde Aleworks | brewery | html, /calendar | 8: Maker Sundays, tattoo pop-up, holiday bar; 16 regulars | vinyl night, happy hour, open mic, CLOSED | Google calendar id not exposed |
| Listening at the Legion | listening room | json, legionlisten.com/wp-json/tribe/events/v1/events | 2: Grace Morrison, Rebecca Folsom Trio; 7 to April | none | none |
| Snowy Peaks Winery | winery | html | 3: two Friday acts, Restaurant Week; 1 open mic | none | posts a week or two ahead |
| Fine Arts Guild | community theatre | html | 3: A Christmas Carol, 4 to 6 Dec | none | Squarespace page |
| Oratorio Society | chorus | html | 2: Messiah, 4 and 5 Dec | none | times not on page |
| Estes Park Chorale | choir | html | 1: Season of Light, 21 Nov | none | none |
| Art Center of Estes Park | gallery | html, /schedule | 1: show opens 13 Nov | none | none |
| Estes Arts District | art walk | html | 1: First Friday, 4 Dec | none | rewritten monthly |
| Stanley Home Museum | museum | html | up to 2, undated in text read | tours | date by hand |
| Macdonald Book Shop | bookshop | Events Calendar JSON recorded; typed manual | 0 (next 11 and 12 Jan) | none | time zone "UTC+0" |
| Historic Park Theatre | cinema | manual | not counted | | schedule from /graphql, disallowed |
| Estes Valley Voice | news calendar | manual (CitySpark) | not counted | | takes submissions |
| Rock Cut Brewing (existing) | brewery | Google iCal, in `feedUrl` | 0; named music June to September | Food Truck, Trivia, Bingo | needs `robots: subscribe` |

## 2. Turn on first
1. Listening at the Legion (clean json).
2. Events Complex Google calendar, under `robots: subscribe`.
3. School District iCal with its exclusions.
4. The Rock Inn, by hand or as one Regulars line.
5. Avant Garde Aleworks, once it shares its iCal.

About 15 to 20 listings a month with The Rock Inn as one line; 35 to 40 with each of its nights a row.

## 3. Ruled out
- The Barrel: only food trucks and weekly bingo.
- Lumpy Ridge Brewing: page says follow social media.
- Estes Park Mountain Shop: "No events at the moment".
- EVRPD: now readable with gzip decoding, but its Events Calendar feed is a 2024 class timetable (62 items, UTC+0). Entry not edited.
- Frozen Dead Guy Days (April, already listed), Estes Park Marathon (June): no feed.
- estesparkmusicfestival.org: domain now carries unrelated spam.
- Rocky Mountain Conservancy, Estes Park News, Bird & Jim: robots.txt disallows ClaudeBot.
- Estes Valley Land Trust (WAF), Lonigan's, YMCA of the Rockies (403), Museum Friends (redirects to the Town's 403 host).
- Reel Mountain Theater, Bogey's (proxy 502); The Wheel Bar, Estes Park Brewery, esteslegion.org past its home page (connection resets). The Legion's "Tavern Live Music" page deserves a retry.
- Kind Coffee, Elkins Distilling: no events.

## 4. Fetched despite a robots rule
- calendar.google.com/calendar/ical/estes.org_crkjvme9sv81j4b73v1ctelmfs%40group.calendar.google.com/public/basic.ics (once)
- calendar.google.com/calendar/ical/9obsj06n1e1vtcbm6ccjikhrg0%40group.calendar.google.com/public/basic.ics (once)

Also: the probe fetched the home pages of www.birdandjim.com and rmconservancy.org before their robots.txt was read; nothing more was read from either.

## 5. What a resident would say
- "We feature live music most nights of the week": The Rock Inn, on local solo and duo acts in its dining room (rockinnestes.com/music-calendar).
- Estes Park Restaurant Week runs 13 to 22 November (Snowy Peaks Winery's events page); the guide has no event for it.
