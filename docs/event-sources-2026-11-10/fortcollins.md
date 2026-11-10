# Fort Collins: event sources, 10 November 2026

Only content/fortcollins/sources.json was edited: 10 existing proposed entries built on (3 given a feed), 9 new entries, all `proposed`, `robots: honor`. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Aggie Theatre (existing; z2ent.com page) | music room | none (Webflow); html | 14 | 2 "Private Event" rows | aggietheatre.com robots names ClaudeBot; listing lives on z2ent.com, which disallows nothing |
| Avogadro's Number (new) | music room | none (SpotHopper); html | about 19 of 22 | open mic, closure | no feed |
| The Comedy Fort (new) | comedy club | none (SeatEngine); html | 12 titles, about 18 nights | New Material Night | no feed |
| Magic Rat, The Elizabeth Hotel (new) | free music room | none; html | 10 to 28 Nov (December not read) | others' downtown events | December loads by script |
| Wolverine Farm Publick House (new) | bookshop, hall | json: wolverinefarm.org/wp-json/tribe/events/v1/events | about 14 of 47 | happy hour, closures, meet-ups | none |
| CSU Rams (existing) | sport | ical: csurams.com/calendar.ashx/calendar.ics | 12 home games of 38 | locationFilter "Fort Collins"; "Flex Week" | venue not in feed for volleyball |
| Poudre Libraries (existing) | library | ical: poudrelibraries.librarycalendar.com/events/feed/ical | about 20 of 287 | long excludeTitles (143 storytimes etc.) | 1.8 MB, 2,602 items |
| Bas Bleu Theatre (new) | playhouse | none (Wix); html | 12 performances, 2 productions | none | static HTML prints times in the wrong time zone |
| Maxline Brewing (new) | brewery | ical: maxlinebrewing.com/events/ical/ | 5 of 41 | food trucks by name, trivia, bingo | capped at 50; truck list needs upkeep |
| Ginger and Baker (new) | restaurant, teaching kitchen | json: gingerandbaker.com/wp-json/tribe/events/v1/events | 3, plus about 28 cooking classes | private events, closures, order days | owner to decide on classes |
| Fort Collins Nursery (existing) | garden centre | json: tribe REST | 2 of 4 | none | small |
| New Belgium (existing) | brewery | none; html, Humanitix links | 2 (3 regulars) | trivia, ASL social | no feed |
| Wildcraft market (existing) | winter market | none (Wix) | 4 Saturdays | none | no feed |
| The Lyric (new) | cinema, music | none (GraphQL app) | not counted | none | needs a browser; one-off shows not found in page text |
| Old Firehouse Books (new, manual) | bookshop | not read | not counted | none | robots.txt: ClaudeBot Disallow: / |
| downtownfortcollins.com (existing) | DDA | not read | not counted | none | 403 on every request, robots.txt included |

## 2. Turn on first
1. Wolverine Farm (json), about 14.
2. CSU Rams (ical), about 12 in season.
3. Poudre Libraries (ical), about 20, only after a dry run of the exclusions.
4. Maxline (ical), 5 now, more in summer (named acts Thursdays and Sundays).
5. Ginger and Baker (json), 3, or about 30 if the classes are wanted.

Feeds alone: roughly 55 listings a month. The bigger gain is by hand: Aggie, Avogadro's, Comedy Fort and Magic Rat are about 60 more a month and have no feed.

## 3. Looked for and ruled out
- Gardens on Spring Creek and Bath Garden Center (existing entries, notes updated): no feed; only classes beyond what the guide has.
- OpenStage Theatre: tribe feed works (8 Dracula nights) but every show is at the Lincoln Center, already read through lctix.
- Fort Collins Symphony: RSS carries post dates, not concert dates; tickets through lctix.
- Fort Collins Museum of Discovery: Social Good/Blackbaud grid of daily dome films and admission; no feed.
- Museum of Art Fort Collins: nothing upcoming listed.
- Gregory Allicar Museum (CSU): /events/ical/ works, 6 exhibitions, 0 in window.
- Global Village Museum: tribe REST answers 0 events.
- Odell Brewing: next six Fort Collins items all run club, walk club, game night, trivia.
- Horse & Dragon: static page pointing to Facebook; Sip & Savor already in guide; Pandamonium 27 and 28 February 2027.
- FoCoMA/FoCoMX: no calendar; festival page gave no 2027 date.
- Sound Bar (254 Linden St): no site of its own found, aggregators only.
- events.colostate.edu: robots.txt Disallow: / for all agents.
- visitftcollins.com: 403 on /events/.
- Jessup Farm, Foothills, Poudre Landmarks, Center for Fine Art Photography: robots.txt names ClaudeBot; not crawled.
- Not researched: the larimer.gov, harbinger, focofallfest, tourdecorgi, eventbrite, humanitix and runsignup entries.

## 4. Fetched despite a robots rule
No subscription feed was fetched against a rule. Three mistakes to declare: a probe script requested the home page before robots.txt was read on oldfirehousebooks.com, www.jessupfarm.com and c4fap.org (404), all of which name ClaudeBot with Disallow: /. Nothing from them was used. Also one redirected request to www.aggietheatre.com/ (ClaudeBot disallowed), which lands on z2ent.com.

## 5. For the guide
- Wildcraft calls itself "Colorado's first year-round farmers market", in its 20th season inside Foothills, Saturdays 10 to 2, November to April (wildcraftmarkets.com).
