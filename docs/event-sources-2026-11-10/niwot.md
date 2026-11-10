# Niwot: event sources found, 10 November 2026

Nine entries added to `content/niwot/sources.json` (all `proposed`, `robots: honor`), and a dated note appended to the existing proposed `niwothistoricalsociety-org`. No status or type of an existing entry changed. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| MainStage Brewing, Gunbarrel (`mainstagebrewing-com-gunbarrel`) | Music room and taproom, 6035 Longbow Dr, Boulder | manual. Page widget (SociableKIT copy of Facebook events) loads `data.accentapi.com/feed/25613355.json` | 8 posted to 30 Nov (MainGrass x3, MainJazz x3, Boulder Dead Night, DJ Night); about 11 a month. 18 regulars | Exclude trivia, All Access/Temaki Tuesday, Run Club, Bluegrass Pick, Dice & Drafts, Magic | Not in Niwot (4 miles). Ingest has no reader; feed reaches only 3 weeks |
| Avery Brewing taproom (`averybrewing-com`) | Brewery, 4910 Nautilus Ct, Gunbarrel | html, no feed | 4 (ski swap 14 Nov, book swap 19 Nov, comedy 25 Nov, Krampusnacht market 5 Dec). 3 regulars | By hand | Not in Niwot |
| NHS Orchestra and Mariachi (`nhsorchestra-squarespace-com`) | School stage | html, plain text list | 3 (17 Nov, 9 Dec, 10 Dec, NHS Auditorium) | Skip Erie High dates | None |
| NHS Bands (`niwotbands-org`) | School stage | html; Squarespace calendar block | 1 read (Winter Jazz in the Rockies, 2 Dec, from the jazz Google Doc) | n/a | Calendar block's data is under `/api/`, disallowed; not read |
| NHS Theater (`niwothstheater-weebly-com`) | School stage | html | 0 (Frankenstein was 5 to 7 Nov, missed by the guide) | n/a | Two shows a year |
| Fortezza Ristorante (`fortezzaristorante-com`) | Ticketed wine dinners, 7916 Niwot Rd | html | 0 (4 Nov dinner past) | n/a | Occasional |
| Osmosis Gallery (`osmosisartgallery-com`) | Gallery, 290 Second Ave | html (blog RSS has no event dates) | 0 new (winter opening not posted) | n/a | Quarterly |
| Emory Jane's Coffee Co. (`emoryjanescoffeeco-com`) | Coffee truck | ical, public Google Calendar (id `6b1d56b8…@group.calendar.google.com`) | 0 events; 3 Niwot truck stops of 17 items | Out-of-town stops excluded by title | Google robots (needs `subscribe`); truck stops are regulars, owner's call as for Fritz |
| Ollin Farms (`ollinfarms-com`) | Farm dinners, 8627 N 95th St, Longmont | html | 0 (2027 schedule "announced in Spring") | n/a | Longmont address; may belong to the Longmont guide |
| Niwot Historical Society (existing) | Lectures | html; `/feed/` is posts, not dated events | 0 | n/a | Lectures announced as posts; events page stale since 2024 |

## 2. Turn on first

1. MainStage Gunbarrel, by hand weekly: about 11 a month, if the owner accepts Gunbarrel.
2. Niwot High orchestra, bands and theatre pages together: 4 this month, 2 to 4 in concert months.
3. Avery taproom events: 3 or 4 a month (same Gunbarrel question).
4. Fortezza dinners: 0 to 1.
5. Historical Society posts: 0 to 1.

Total: roughly 18 to 20 listings a month with Gunbarrel, about 5 without. Nothing found is a feed ingest can read today except Emory Jane's truck calendar.

## 3. Looked for and ruled out

- Niwot Tavern: no events page, only a photo gallery.
- The Old Oak Coffeehouse: events collection stops in September 2022; its monthly text repeats niwot.com.
- Niwot United Methodist Church (7405 Lookout Rd): public Google calendar read; all worship, rehearsals, small groups and "Busy".
- Una Vida: workshops page empty; the rest is classes.
- Niwot High choir (niwotchoir.weebly.com): calendar is a Google Drive file, not opened.
- Dead or parked: farowrestaurant.com (now a gambling site), 1914house.com, haystackgolf.com, Beyond the Mountain Brewing (MainStage has the space).
- No events page: Finkel & Garf, Little Bird, Hanna's Herb Shop, Taverna Laudisio, Raza Fresa. Colorado Therapeutic Riding Center lists only volunteer trainings.
- Not read: rmcc.org (403), niwotmarket.com (connection reset), winotcoffee.com and niwotjewelry.com (no answer); lhvc.com and niwotarts.org not crawled, as instructed.

## 4. Fetched despite a robots rule

- calendar.google.com: `/calendar/ical/6b1d56b8974d1b0603fc4e4bdeab26950232d75aeadd511e4997d0371017dccd%40group.calendar.google.com/public/basic.ics` (Emory Jane's), once.
- calendar.google.com: `/calendar/ical/dc30e93861562dae08a3bd464c3e70128a9e78a8ddb41c15a530a8227390cce4%40group.calendar.google.com/public/basic.ics` (Niwot UMC), once.

Also: data.accentapi.com has no robots.txt (404); both MainStage widget feeds were fetched once. Three pages were loaded in headless Chromium to find embeds (Emory Jane's, Niwot UMC, MainStage /music); MainStage's page made its own `/api/census` call, a path its robots.txt disallows.

## 5. What a resident would say

MainStage on its Friday MainGrass: "every lineup is unique, no two groups are the same, and often players are playing together for the very first time on our stage" (mainstagebrewing.com/gunbarrel).
