# Nederland: event sources, 10 November 2026

Six entries added to content/nederland/sources.json (all `proposed`), dated notes appended to five existing ones (eldora-com, pioneerinnnederland-com, wildbear-org, themtnear-com, knottedrootbrewing-com); no status or type changed. `npm run validate` could not run (no node_modules in the repo: "Cannot find package 'astro'"); I did not install anything and checked the file by hand against sourceSchema instead (ids, enums, feedUrl on feed types, valid JSON, two-space format).

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| The Backdoor Theatre (new) | Cinema in the Community Center | json: https://thebackdoortheatre.org/wp-json/tribe/events/v1/events (iCal also at /events/list/?ical=1) | 9 screenings (Sense and Sensibility 13-14 Nov, Wicker 20-21 Nov, The Cat in the Hat 27-28 Nov; Fri 7 pm, Sat 2 and 7 pm) | none; defaultVenue set | none; robots allows |
| Wild Bear Nature Center (existing, notes added) | Nature center | none; Squarespace page /events | 1 (Owl Moon, 21 Nov, Mud Lake); 4 day-off camps and 5 storytimes are regulars | by hand | Squarespace disallows ?format=ical |
| Nederland Food Pantry (new) | Nonprofit events page | none; Squarespace /events | 1 (Holiday Mountain Market, Sat 5 Dec, 10 to 5, Community Center); 1 distribution, 1 never-list | by hand | same |
| Bristlecone Bookshop (new) | Bookshop | none; Squarespace /events | 0, plus 1 regular (Poetry Open Mic 21 Nov); two author events fell in the fortnight before | by hand | same |
| Covered Wagon Restaurant & Saloon (new) | Saloon with music, at the old Pioneer Inn address | manual | not countable; karaoke Thursdays (regular) | n/a | music is posted only on Facebook |
| Hub Ned (new) | Coworking event room | ical: https://members.hubned.com/events/ics | 0 (feed is empty) | private bookings, if it fills | none |
| Ned Gravel (new) | Race site | none; html | 0 (race was 12 July; 2027 date not posted) | n/a | seasonal |
| Eldora (confirmed, note added) | Ski area | none; events page data is /page-data/activities-amenities/events/page-data.json | 0 events posted; banner says opening day 13 Nov | n/a | events list empty |
| The Mountain-Ear (existing, notes added) | Weekly paper's Music Listing and Cracker Barrel | none | lead sheet only | n/a | stories marked subscribers-only |

## 2. Turn on first

1. The Backdoor Theatre: the only real feed found, 9 to 12 screenings a month (3 or 4 films).
2. Wild Bear, by hand from /events: 1 or 2 a month in winter.
3. Nederland Food Pantry page, by hand: about 1 a month.
4. Bristlecone Bookshop, by hand: about 2 author events a month.
5. A Mountain-Ear subscription for the Thursday Music Listing, which covers the bars with no calendar (Covered Wagon, Ned General, Knotted Root): perhaps 3 to 5 named acts a month.

Total: roughly 15 to 20 listings a month, 9 to 12 of them from the one feed.

## 3. Looked for and ruled out

- Pioneer Inn: domain still dead (502); Covered Wagon now trades at 15 E 1st St.
- Ned General (nedgeneral.com): "Events" page is a blurb with no dates; The Foggy Tops on 15 Nov is known only from the paper.
- Salto Coffee Works: Events Calendar pages stop in 2019; same address and phone as Ned General.
- Knotted Root: /events still empty, though the paper lists a Sunday Jazz Jam.
- Carousel of Happiness: home page links The Events Calendar, but /events/?ical=1 and the REST route both 404.
- Caribou Room: next shows are 12 and 19 Dec, both already in the guide; nothing in the window.
- Very Nice Brewing: Wix Events, no feed; already covered by the nightly re-check.
- Mountain-Ear /calendar/: "No events were found"; no feed.
- nederdays.com (Holiday Mountain Market, Nederdays of Art): 404 and 403.
- Seniors' Holiday Mountain Market page: still describes 2022.
- nederlandhistoricalsociety.org: 503 and reads like a placeholder, not the real society; nederlandmuseums.org has a broken certificate.
- Crosscut Pizzeria, Mountain People's Co-op: no events on their home pages.
- Stage Stop and Howlin Wind (Rollinsville), Gold Hill Inn and Store, Jamestown Mercantile: other towns; stagestoprollinsville.com does not answer, howlinwindbrewing.com robots 403.
- Brightwood Music (in The Vault): no site found.
- Frozen Dead Guy Days: no longer in Nederland. NedFest: already recorded as dormant.

## 4. Fetched despite a robots rule

None. No Squarespace ?format= feed was requested. One thing to know: The Mountain-Ear's 5 November Music Listing carries a "subscribers only" notice but was served in full to a plain request; I read that one story for leads and one Halloween photo story by mistake, and stopped there.

## 5. What a resident would say

- Movies are Friday and Saturday nights at the Backdoor, with a Saturday matinee that is open caption (thebackdoortheatre.org).
- The bars do not keep calendars; people look at the Mountain-Ear's Thursday Music Listing or Facebook (Covered Wagon's site says its music is "posted on our Facebook page").
- Wild Bear's storytime moves from the library to "Wild Bear Nature Center" on 1 December, which suggests the new building opens for programs then (wildbear.org/events); worth confirming with them.
