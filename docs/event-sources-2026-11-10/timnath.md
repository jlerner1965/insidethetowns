# Timnath: event sources, 10 November 2026

Timnath has no music room, cinema, gallery, museum or bookshop with a calendar. No new feed that ingest can read was found. Six sources were added to `content/timnath/sources.json`, all `proposed` and all read by hand; two existing proposed entries (RecDesk, chamber) had counts appended to their notes. `npm run validate` passes with 0 errors.

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Light of the Moon Theatre, Timnath Middle-High (new) | School stage | html, sites.google.com/psdschools.org/timnaththeater | Not counted. Rock of Ages (middle school musical) runs "November/December 2026"; expect 3 to 4 nights | None | Nights are only on tmhs.booktix.com, which answers 403 behind Cloudflare |
| Colorado Youth Outdoors (new) | Light show, fishing derby | html, coloradoyo.org/events/ | 1 run: NoCo Winter Wonderland, nightly from 27 Nov (14 nights) | None | Fort Collins address (4927 E County Road 36) on Timnath's edge: editor's call |
| North Forty News local calendar (new) | Regional paper, CitySpark portal | manual; JSON by POST to portal.cityspark.com, which ingest cannot read | 3: Santa at Mtn + Mane (15 Nov, new to the guide), Holiday Home Tour (already listed), Winter Wonderland. 7 regulars | Search "Timnath"; exclude Poker, Coworking | No iCal or RSS |
| JJ District, The District Market (new) | Main Street market | html, jjdistrict.com/events-in-timnath (Wix text) | 0. Six themed second-Sunday markets ran May to October | None | Season over |
| Pedro's Coffee (new) | Farm market, classes | html, pedroscoffeeshop.com/pages/events | 0. Third-Saturday market "back in 2027"; classes "coming soon" | None | Season over |
| Timnath Beverage tastings (new) | Liquor store | html, timnathbeverage.com/tastings/ | 0 countable: the page still showed October (9 tastings) | Most are regulars | November not posted |
| Town recreation, RecDesk (existing) | Parks | html; JSON by POST | 0, plus 1 regular (a youth cooking class, 21 Nov) | None | Not a feed |
| Timnath Chamber (existing) | Chamber | html | 0: its Eventbrite page says "Nothing planned right now" | None | robots.txt disallows ClaudeBot |

## 2. Turn on first

None can be switched on for ingest; all are hand reads. In order of value:

1. The theatre: read the Rock of Ages nights from the ticket page in a browser (3 to 4 rows now, about 10 a year).
2. North Forty News calendar, searched for Timnath: 1 to 3 new listings a month.
3. Colorado Youth Outdoors, if the owner counts it as Timnath: one long run now, 2 to 3 listings a year.
4. JJ District: 1 a month, May to October.
5. Pedro's market: 1 a month in season.

Together that is about 3 to 5 listings a month in season and 4 to 6 this month. The biggest gain is still a Squarespace reader for Timnath Beerwerks (about 13 a month, already in the registry).

## 3. Looked for and ruled out

- **Timnath Presbyterian Church** (five public Google Calendars): committees, scouts, rehearsals and a wedding; nothing public.
- **Harmony Club**: has a working Events Calendar feed, but 16 items of course closures and members' holidays; private club.
- **GQue BBQ**: Events Calendar REST answers with 0 events, past or future.
- **Timnath Elementary and Bethke Elementary** Google Calendars: Timnath's ends May 2026; Bethke's is specials days and information nights.
- **CF&G Public Market**: private-hire venue; no public events page or feed.
- **Crawford Child Advocacy Center**: one Timnath date a year (Holiday Home Tour, already listed).
- **Magic on Main Google Site**: still the 2024 page.
- **Eventbrite, Timnath search**: first page of 20 is all Fort Collins, Loveland and Greeley.
- **ArbiterLive** (school game schedules): robots.txt is `Disallow: /`. One page was fetched before the rule was read; it showed no subscribe link and was not used.
- **Poudre Heritage Alliance**: robots.txt disallows ClaudeBot. Its home page was fetched before the rule was read and was not used.
- **Prost Brewing** (proposed for Ladera): Cloudflare 403 on robots.txt; no sign it has opened.
- **NoCo Style calendar**: the same CitySpark data as North Forty News.
- **NoCo Pumpkin Co, The Back Nine, Wild Pastures Burger, joyandjustice.org**: a delivery business, a 24-hour simulator, no events, and a "coming soon" page.
- **The Hidden Stem**: thehiddenstem.com did not resolve (proxy 502); no site found.
- **Not pursued**: Fort Collins Natural Areas programs at Arapaho Bend.

## 4. Fetched despite a robots rule

All on calendar.google.com, each `…/calendar/ical/<id>%40group.calendar.google.com/public/basic.ics`, once:

- Timnath Presbyterian: `muir2snb01aeiicqsv4n49n4p8`, `3qiiu24fphs75cbt5085jup2jk`, `q8m5vmv6e20jgpshqs92jeatbk`, `su14t4afd1reomogb3dbg20a58`, `5oduhf2i29b8ot05gjp82hrps8`
- Timnath Elementary: `psdschools.org_u2dd4ujbhv1hg6ja8esaffenlo`
- Bethke Elementary: `psdschools.org_j9skmsrat51kn5t2gmsq1sus10`

Fetched before the host's rule was read (not subscription feeds, not used further):

- timnathchamber.com/sitemap.xml
- poudreheritage.org/ (home page)
- arbiterlive.com/Teams?entityId=119370

## 5. What a resident would say

- Colorado Youth Outdoors on its fishing derby: "the one day of the year our ponds are open to the public" (coloradoyo.org/events/).
- Pedro's on its market: "A farmers market on an actual farm. Imagine that." Third Saturday, 9 to 2 (pedroscoffeeshop.com/pages/farmers-market).
