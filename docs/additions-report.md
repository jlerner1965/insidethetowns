# Additions report: new hub town pages and the eight additions

Built on 12 November 2026 from the owner's brief, in one pass. Every date and fact was read that day on the page named beside it in the data. This file says what was built, how much was filled, and what was left empty and why.

Two things limited the research and explain most of the gaps below. The session's web-search allowance ran out early, so most pages were reached only by trying the organiser's or the Town's own address. And many Town sites (most `*.colorado.gov` sites, vail.gov, minturn.org, townofdillon.com, silverthorne.org, cityofsalida.com and others) refuse automated reads. Nothing was filled from memory or from a guide site.

## 1. Towns added, by region group

60 towns now have a page on insidethetowns.com. The hub lists 96 town pages, up from 40, beside the 7 guides. Each passed the test: at least one named annual event with its next or last-held date read on the organiser's own site. The number after a town is how many such events it has.

- **Front Range cities**: Boulder (6), Greeley (6)
- **Front Range and plains towns**: Mead (4), Milliken (1), Wellington (4), Platteville (2), Brush (6), Sterling (3)
- **Eastern plains** (new group): Rocky Ford (2), La Junta (4)
- **I-70 mountain**: Central City (6), Morrison (1)
- **Summit County**: Dillon (2), Silverthorne (1)
- **Eagle valley** (new group): Vail (5), Minturn (2), Eagle (2), Avon (4)
- **Grand County** (new group): Winter Park (3), Fraser (3), Granby (4), Kremmling (1)
- **North Park** (new group): Walden (1)
- **South Park** (new group): Fairplay (1), Alma (3)
- **Arkansas valley**: Cañon City (1), Florence (2), Westcliffe (2)
- **Pikes Peak**: Cripple Creek (6), Victor (2), Woodland Park (3), Green Mountain Falls (1), Palmer Lake (3)
- **Southern Colorado** (new group): Trinidad (2), La Veta (2)
- **San Luis Valley** (new group): Creede (3), Alamosa (3), Monte Vista (3), Del Norte (1), Crestone (2)
- **Yampa valley**: Craig (3)
- **Western Slope**: Cedaredge (1), Delta (2), Rifle (1), Meeker (2)
- **North Fork valley** (new group): Paonia (1), Hotchkiss (2)
- **Roaring Fork valley**: Aspen (3), Basalt (5), Redstone (4), Marble (1)
- **Gunnison valley**: Gunnison (4), Lake City (3)
- **Southwest**: Silverton (2), Ridgway (2), Pagosa Springs (5), Montrose (4), Cortez (3), Mancos (3), Dolores (1)

Mead was already in the registry with one record and no page. It now has four events and a page, and insidemead.com forwards to it (`vercel.json`). No town outside the candidate list was added.

The page rule changed to match the brief: one dated event of the town's own makes a page (it was three dated items of any kind). It is in `src/lib/hub-towns.ts`, `HOW-IT-WORKS.md` and `DECISIONS.md`.

### Events to look at before relying on them

These were written because the organiser's page gives the date, but the researcher flagged something about the page.

- **Greeley Stampede**: the run (24 June to 5 July 2026) is the first and last day on the organiser's day sheets. No page states the run in one line.
- **Vail Oktoberfest**: the site names no organiser, so the record's organiser is "Vail Oktoberfest". **Vail America Days** names the Town of Vail on the strength of discovervail.com.
- **Vail Mountain opening (13 November 2026)** is the operator's target, "subject to change". **Kendall Mountain (5 December 2026)** is "tentative" on its site. Both carry that note.
- **Central City, Madam Lou Bunch Day**: both years are from visitcentralcity.com, whose 2026 heading and body disagree by a day; the Saturday was recorded. The 2027 dates that site gives for Stills in the Hills and the Beer Fest were not used, because they are not on those events' own sites. Both read "not yet announced".
- **Montrose County Fair & Rodeo**: the banner reads 16 to 24 July 2027 beside 2026 news items.
- **Basalt, Merry on Midland**: the Town page gives "Friday, December 11" with no year; the year is from the chamber's 2026 holiday page. **Redstone Grand Illumination** is dated on the Redstone Inn's page, the host.
- **Erie Balloon Festival**: the page body says 9 to 11 July 2027 while its title still says 2026. The body was used.
- **Berthoud Chocolate Walk**: the 2027 date is on Berthoud Main Street's events page. The event's own page still shows last season, so no time or price is stored.
- **Cañon City Music & Blossom Festival**: only the parade day (2 May 2026) is on the organiser's pages, so the record is that day and not the whole run.
- **Wellington Parade of Lights** is recorded as canceled for 2026 from the Town's page. The Town's reason was not stored, because its wording was not read directly.
- **Minturn** passes on Vail Recreation District races held in town. **Silverthorne** passes on one Town bulletin, which prints the wrong weekday for 4 July. **Marble** passes on one event. **Kremmling** passes on the Middle Park Fair, whose end date is on the CSU Extension page.
- **Windsor Harvest Festival** has no date at all, only the Town's "over Labor Day weekend", shown as a typical window.

## 2. Candidate towns skipped

- **Olathe**: the Olathe Sweet Corn Festival's own site confirms 22 August 2026 (its 36th year, "since 1990") but places the festival at the Montrose Rotary Club Amphitheater in Cerise Park, Montrose. An event held in Montrose does not make an Olathe page, and no other Olathe event could be read: townofolathe.org returned 403 and a bot check. Tried: olathesweetcornfest.com, olathesweetcornfest.com/about, townofolathe.org. This is the owner's call. The facts are enough for a record if the festival should count for Olathe.
- **Elizabeth** already has a hub page, so it was not added again. Its Stampede record was checked (the dates match) and re-filed as a rodeo.

Every other candidate passed.

### Named leads that could not be confirmed

No record was written for these. Each needs the organiser's own page with a year on it.

- Paonia **Mountain Harvest Festival**: mountainharvestfestival.org returned an empty page and the ticket page returned 403.
- Westcliffe **Jazz in the Sangres**: no organiser site found; jazzinthesangres.com does not resolve.
- **Brush Rodeo**: brushrodeo.com, .org and .net do not resolve; the City page says "each year, July 2-4" with no year.
- Victor **Gold Rush Days 2027**: the organiser shows only 17 to 19 July 2026, which is recorded.
- Westcliffe **High Mountain Hay Fever 2026**: the site now shows only 8 to 11 July 2027, which is recorded.
- Also tried and not confirmed: Bravo! Vail, Eagle County Fair & Rodeo, Minturn Market, Lighting of Dillon, Kremmling Days, Rifle Rendezvous, Creede 4th of July ("tentative"), Alamosa Round-Up (503), Crestone Music Festival (403), Dolores Escalante Days (the chamber site is a placeholder), Green Mountain Falls Bronc Day, Palmer Lake Arts Fest (no year on the page), La Veta Oktoberfest (the domain is now unrelated), Trinidad Legacy Rodeo, Arkansas Valley Balloon Festival, Aspen Music Festival and Filmfest (no dated year), Gunnison Balloon Rally, MarbleFest.

Two addresses must not be linked: burrodays.com and allaboardwestcliffe.org now serve gambling pages.

## 3. The eight additions

### 1. Near this town

- Built: `src/components/NearThisTown.astro`, `src/lib/near.ts`, `data/hub/road-miles.json` (written by `scripts/town-facts.ts`), `data/hub/passes.json` and `src/config/passes.ts`. It is on every hub town page and at the foot of each guide's `/things-to-do/`.
- Filled: all 104 places (97 hub towns and 7 guides) are placed and routed, with 1593 pairs of road miles, each stored once. Every published page lists its nearest six. A test holds that the two pages of a pair print the same miles.
- Routing source: the Open Source Routing Machine's public server on OpenStreetMap roads, between each town's Populated Place point in USGS's GNIS. It does not take a road out of the miles when it is shut for the season, and the block says so.
- Passes and routes: 42 rows, each with its highway, the two towns, and the road's page on COtrip. Two were opened in a browser to confirm the link form works. 5 carry a usual seasonal closure in the agency's words: Trail Ridge Road, Independence, Kebler, Guanella and Mount Blue Sky.
- Left empty: the **Cottonwood Pass** closure (CDOT lists it as seasonal with opening dates only; no closing wording was read). **Boreas Pass** highway, elevation and closure (Summit County's pages give only this summer's opening) and **Phantom Canyon Road** number and status; neither is a COtrip route, so they link to the county page or COtrip's front page. Elevations for Cottonwood, Kebler, Guanella and the three canyons. **Peak to Peak** route numbers (CDOT's byway page does not state them). The name "Million Dollar Highway" is not on a CDOT page read, so the row is Red Mountain Pass. **Raton Pass** has only one network town and is not listed.

### 2. More outdoor-date rows

- Built: an `outdoor` tag on registry records (kind: campground, booking, timed entry, road, ski area, river, other; edge: opens, closes, window), `src/lib/open-now.ts` and `src/components/OpenNow.astro`. "Open now" and "Opens next" sit under Outdoor dates on every hub town page and on each guide's `/traditions/`.
- Filled: 123 outdoor records in all (71 before), 117 of them tagged: 40 ski-area, 35 other, 25 road, 9 campground, 4 booking, 4 timed-entry. 53 town pages have at least one tagged row.
- New shared rows include Eldorado Canyon and Brainard Lake timed entry, Rocky Mountain National Park campgrounds and the timed-entry release day, Mesa Verde tours and Wetherill Mesa, Black Canyon's South Rim and East Portal roads, Great Sand Dunes' Medano Pass road and Piñon Flats, Maroon Bells, Pikes Peak North Slope and Harpers Corner Road. New town rows include ski-area opening and closing days (Winter Park, Granby Ranch, Vail, Beaver Creek, Aspen Mountain and Highlands, Silverton, Kendall Mountain, Wolf Creek), Telluride Town Park campground and its booking day, Lake Nighthorse, the Grand Lake Nordic Center and Windsor Lake boating.
- "Open now" is deliberately conservative: an opening with no closing date on file counts for ninety days only.
- Left empty: **river and tubing season**. No agency page gave a dated season (the Arkansas Headwaters flow dates were not found and Steamboat's site was blocked), so there are no river rows. **Campground booking-open dates** exist only for Telluride Town Park, Brainard Lake and RMNP timed entry; Estes Valley, Carter Lake and Colorado state park campgrounds book on a rolling 180-day or six-month window with no date. **RMNP 2027 campground dates** ("TBD: check back in mid-November"). **Morefield Campground** (dates shown with no year). Hanging Lake (permits are year-round). Boreas, the Alpine Loop, Lands End, Buffalo, Mosquito, Weston and Hagerman passes (no agency date read).
- Two existing records need a re-read: `trail-ridge-road-opens` lacks its 2026 date (NPS's release of 29 May 2026 was not opened), and `rmnp-timed-entry` ends on the Bear Lake date (18 October) though the rest of the park ended 12 October.

### 3. Free-admission days

- Built: a `free-day` type and `/free-admission-days/`, in the season-page format. A day that has passed is listed nowhere, at build time and again in the reader's browser.
- Filled: 42 records, one a day: National Park Service 8, Bureau of Land Management 8, Forest Service 10, Fish and Wildlife 4, Colorado Parks and Wildlife 4 (Colorado Day re-filed, plus Veterans Day, Fresh Air Friday and the August military month), Museum of Boulder 3, Dinosaur Ridge in Morrison 2, Colorado Railroad Museum 2, Longmont Museum 1. Dates still ahead on 12 November: Dinosaur Ridge 15 November and 20 December, Fresh Air Friday 27 November, Museum of Boulder 12 to 13 December.
- Left empty: no agency has published a 2027 list, so every federal day reads "2027 not yet announced" and is off the page until one does. No dated free day was found at Fort Collins Museum of Discovery, Loveland Museum, the History Colorado museums in Leadville, Montrose and Trinidad, Tread of Pioneers or the Overland Trail Museum. Museums of Western Colorado could not be read. Golden History Museum, the Greeley museums and the Royal Gorge Regional Museum are always free, which is not a dated day.
- For review: the four Fish and Wildlife days may not apply to any fee-charging refuge in Colorado. The Colorado Railroad Museum and Longmont Museum rows have no date ("2027 dates TBA", second Saturdays) and sit under "Not announced yet". The Museum of Boulder's Holiday Art Fair page says "FREE Admission" without saying outright that gallery admission is waived.

### 4. Quick facts and getting there (hub town pages)

- Built: `src/components/TownProfile.astro`, with the bulk facts in `data/hub/town-facts.json` and `data/hub/road-miles.json`, the Bustang stops in `data/hub/bustang.json` and the airports in `data/hub/airports.json`.
- Filled, of 96 hub town pages: elevation 96 (USGS point service at the town's GNIS point); population 94 (Census Bureau Vintage 2025, shown as "Population, 2025"); county 96 (Census Bureau county parts); incorporation year 21; miles and drive time from Denver 96; nearest commercial airport 96 (nearest by road of the 13 Colorado airports on the FAA's 2025 commercial-service list); Bustang or local transit 61.
- Left empty: **population** for Evergreen and Redstone. They are census-designated places and have no annual estimate.
- Left empty: **incorporation year** for 75 towns: Alma, Aspen, Boulder, Breckenridge, Buena Vista, Cañon City, Carbondale, Castle Rock, Cedaredge, Central City, Cortez, Craig, Crestone, Cripple Creek, Del Norte, Delta, Dillon, Dolores, Durango, Eagle, Elizabeth, Estes Park, Evergreen, Fairplay, Florence, Fort Lupton, Fort Morgan, Fraser, Frisco, Fruita, Glenwood Springs, Golden, Grand Junction, Grand Lake, Greeley, Green Mountain Falls, Gunnison, Hotchkiss, Idaho Springs, Keystone, Kremmling, La Veta, Lafayette, Leadville, Longmont, Louisville, Loveland, Mancos, Manitou Springs, Marble, Meeker, Milliken, Minturn, Monte Vista, Montrose, Morrison, Nederland, Palisade, Palmer Lake, Paonia, Platteville, Redstone, Ridgway, Rifle, Salida, Silverthorne, Silverton, Steamboat Springs, Telluride, Timnath, Trinidad, Vail, Victor, Walden, Woodland Park. Tried: each Town's own site and county page. Most refuse automated reads or give no year (Frisco's says "chartered in 1879", which is not incorporation). Fort Collins' 1873 is worth a second look.
- Left empty: **Bustang** for Evergreen, Golden, Morrison, Dillon and Keystone, where ridebustang.com lists a park-and-ride or ski-area stop without naming the town. The other towns without a line have no stop on any of the 16 route pages. Two airport links (flydenver.com, aspenairport.com) answered an automated read with a bot check and should be opened once by hand.

### 5. Where to stay, and the season field

- Built: the lodging list on hub town pages (name, kind, season, the property's own site; the schema refuses booking and guide sites). On places: `yearRound`, the other half of the existing `seasonal` block, shown wherever the season line is (rows, cards, the place page).
- Filled: 58 of 96 town pages have lodging, 135 properties in all; 12 carry a season. Three places on the guides were marked year-round from their own pages: Carter Lake, Erie Lake and LaVern M. Johnson Park.
- Left empty: **no lodging** for 38 towns: Alma, Carbondale, Castle Rock, Central City, Craig, Crestone, Delta, Dillon, Dolores, Eagle, Elizabeth, Fairplay, Florence, Fort Lupton, Fort Morgan, Fraser, Greeley, Green Mountain Falls, La Junta, Lafayette, Longmont, Louisville, Loveland, Mancos, Mead, Meeker, Milliken, Monte Vista, Nederland, Palmer Lake, Paonia, Platteville, Rifle, Rocky Ford, Severance, Sterling, Timnath, Wellington. Tried: the property sites linked from each Town or chamber page. Without web search only those could be found, and several hotel sites refused the read. Most towns with lodging have fewer than the three to five asked for. Season is empty wherever the property's site does not say.
- For review: Ameristar and The Nest (Black Hawk) and Ski Tip Lodge (Keystone) were read on a listing page, not the property's own.

### 6. Heritage card (hub town pages)

- Built: the history card, with the name, the founding, dated facts, museums and landmarks with hours, cost and season, ghost towns nearby and makers. Estes Park was done first and most fully: five places to stay, its founding, five dated facts, the Stanley Hotel, the Stanley Home Museum and MacGregor Ranch with tours, prices and seasons, and two makers.
- Filled, of 96 pages: name origin 36; founding 45; dated facts 82; museums and landmarks 75 (130 sites); ghost towns 2; makers 15.
- No profile at all, because nothing could be confirmed on an acceptable source: Craig, Meeker, Timnath.
- Left empty for Estes Park: the name origin, the incorporation year, Estes Transit, the Estes Park Museum and the Fall River Hydroplant. estespark.colorado.gov returned 403 to every read.
- Left empty generally: ghost towns and makers were researched only where a town or museum page named them. Museum hours, cost or season are missing wherever the museum's own page did not state them.
- Sources to review: some history was read on a town's tourism office or a heritage-area site, not the Town's or county's own: visitmontrose.com (Montrose), visitlajunta.net (La Junta), discoverblackhawk.com (Black Hawk), gofruita.com (Fruita), redstonecolorado.com (Redstone), victorgoldrushdays.com (Victor), southparkheritage.org, the South Park National Heritage Area (Fairplay, Alma), and museumtrail.org, the San Luis Valley museums' joint site (Creede, Monte Vista, Crestone). Drop those fields if those are not acceptable sources. The Tread of Pioneers Museum now calls itself the Steamboat Springs History Museum.

### 7. Tradition registry

- Built: optional `edition`, `subEvents` (name, day, time, place) and `closedDays` on a year, shown on every row; `firstYear` was already there. Four new types with statewide season pages: `/rodeos-and-county-fairs/` (27 records), `/oktoberfests/` (7), `/harvest-festivals/` (12) and `/winter-carnivals/` (13). Existing records were re-filed under them.
- Filled: the registry has 564 records (279 before). 57 carry an edition number, 40 a founding year, 50 sub-events, 1 closed days.
- The named events:

| Event | Result |
|---|---|
| Lyons: RockyGrass | Added: 23 to 25 July 2027, the 55th |
| Lyons: Rocky Mountain Folks Festival | Added: 6 to 8 August 2027, the 37th |
| Lyons: Old Man Winter Rally | Added: 7 February 2027 |
| Lyons: Bloomin' Beats | Not added: no organiser page found; not on the Town of Lyons site |
| Lyons: Venus de Miles | Not added: the organiser's site reads "Website Expired" |
| Berthoud: Snowfest | Not added: berthoudsnowfest.com redirects to a 404 and the name is nowhere on Berthoud Main Street's site |
| Estes Park: Elk Fest, Scottish-Irish Highland Festival, Frozen Dead Guy Days | Already there; dates match the organisers' pages |
| Estes Park: Duck Race | Added: 1 May 2027 |
| Estes Park: Winter Festival | Not added: the Town's events page is a 404 and the events site no longer lists it |
| Salida: FIBArk | Already there; matches |
| Salida: Christmas Mountain | Not added: no organiser page for the lighting could be read (the Christmas Mountain run has its record) |
| Leadville: Boom Days, Ski Joring | Already there; match. The Ski Joring 2026 entry cites the visitor bureau and wants a re-read on the organiser's page |
| Georgetown: Christmas Market | Already there; corrected to the two weekends only, museum hours removed, 66th |
| Georgetown: Bighorn Sheep Festival | Already there; 14 November 2026 matches |
| Breckenridge: Ullr Fest, Snow Sculpture Championships, Lighting of Breckenridge | Already there; match |
| Palisade: Peach Festival, Mountain Winefest | Already there; match |
| Fruita: Mike the Headless Chicken Festival | Already there; matches |
| Fruita: Fat Tire Festival | Added: 2026 canceled ("taking a break for 2026"), 2027 not yet announced |
| Glenwood Springs: Strawberry Days | Already there; matches (the 129th) |
| Steamboat Springs: Winter Carnival | Already there; matches |
| Steamboat Springs: Cowboys' Roundup Days | Added: 2 to 4 July 2026; 2027 not yet announced |
| Manitou Springs: Emma Crawford Coffin Races | Already there; matches; source address updated |
| Durango: Snowdown, Polar Express | Already there; match |
| Ouray: Ice Festival | Already there; matches (the 32nd) |
| Castle Rock: Starlighting | Already there; 21 November 2026 matches |
| Evergreen: Winterfest | Not added: the only organiser page still describes February 2023. Frostival (12 December 2026) and the Pond Hockey Championship were added |
| Evergreen: Rodeo | Already there; matches |
| Loveland: Sweetheart Festival, Sculpture in the Park | Already there; match |
| Lafayette: Peach Festival | Already there, with no date: the chamber's page still gives none |
| Fort Collins: NewWestFest | Not added: bohemiannights.org now redirects to a venue calendar with no festival or date |
| Longmont: Dia de los Muertos | Already there; 24 October 2026 matches |

- The guides also gained: Berthoud (A Very Merry Berthoud, Chocolate Walk), Erie (Town Fair, Balloon Festival, Brewfest), Johnstown (Fall Fest, Trick or Treat Street, Cinco de Mayo Fiesta), Windsor (Farmers Market, Harvest Festival), Niwot (Let's Wine About Winter, Rock & Rails), Carbon Valley (Frederick in Flight, Miners Day, 4th at Firestone) and Lyons (Lucky Lyons 5K/10K).
- Not confirmed for the guides: Erie Biscuit Day (the Historical Society withdrew its 2026 application), Berthoud Day and Oktoberfest (the Chamber's pages are 404), Johnstown BBQ Day (503), Erie Air Fair, Dacono Music & Spirits Festival, and Niwot's 4th of July (the listing's date and its text disagreed, so the record was not kept). "Rhythm on the Rails" and "Nostalgia Day" are not names on niwot.com. Chainsaws & Chuckwagons (Frederick, 15 to 18 July 2026) was read and is ready to add.

### 8. Place details

- Built: `details` on a place (reservations, cash only, closed days, dogs, bikes, fees, tours, tastings, and a market's day, hours and season dates). Each line shows on the place page only when filled, with the page it was read on and the day. Phone and website were already fields.
- Filled, Berthoud first:

| Guide | Places | With a phone | With a website | With a details block |
|---|---|---|---|---|
| berthoud | 60 | 41 | 53 | 50 |
| erie | 51 | 31 | 51 | 47 |
| johnstown | 35 | 30 | 35 | 27 |
| windsor | 56 | 39 | 55 | 49 |
| carbon-valley | 31 | 29 | 31 | 27 |
| lyons | 40 | 23 | 37 | 30 |
| niwot | 43 | 27 | 42 | 32 |
| **All** | 316 | 220 | 304 | 262 |

  Added in this pass: 20 phone numbers and 4 websites (Cornerstone Cafe, Grandpa's Cafe, Happy Eating, Kofe House). A details block was written wherever the place's own page was read; 48 carry a fact beyond the source (dog and bike rules, fees, tours, reservations).
- Left empty: most places still without a phone are parks and trails whose own page gives only the Town Hall or county number, or none. Business sites that blocked the read got nothing: Brick Oven Pizza, Trailhead Cafe, Oskar Blues, MASH Lab, Vecinos, Lucile's, Fair Winds, Candlelight, Dominic's, Lazy Dog, Scheels, Jersey Mike's, Garden Gate and Fan's. No farmers market has a place file on the guides, so no market day, hours or season was filled there (Windsor's market is in the registry, 6 June to 5 September 2026).
- Listing problems noticed and not changed. Each wants a call or a second read:
  - Cornerstone Cafe (Berthoud): its own page shows (970) 344-5139; the listing has 344-5360.
  - Super 8 Windsor: its page shows 970-541-1609; the listing has 970-686-5996.
  - All eight Frederick parks carry 720-382-5805, which is on none of the Town's pages.
  - Seven Johnstown parks were given (970) 587-4664, the Town front desk number each park page gives for shelter questions. Remove it if a park should carry no general number.
  - Western Stars Gallery (Lyons) shares 160 E Main St with Creative Grounds and its domain redirects elsewhere. Future Legends (Windsor) has a 404 site. wishfulliving.com is down. poudretrail.org's home page carries injected gambling spam.
  - The phones on file for Cellar West, Niwot Wheel Works and The Nook are not on their own pages. Inkberry Books' `url` points to the niwot.com directory though inkberrybooks.com works.

## 4. Also

- **"Counties: 3"** on the hub home page counted only the seven guides. It now reads "Counties with a guide", and the note under the strip says the population and the county count are the guides' only.
- Nothing was added to any guide's home page. No sports, This Week or newsletter code was changed.

## 5. Checks run

- `npm test`: 857 tests pass, 11 of them new (`test/additions.test.ts`). `npm run validate`: 0 errors; it now also checks every town profile and refuses a guide site as a record's source. `npm run check-colors` and `astro check`: clean.
- Builds with the site check: the hub (152 pages, no problems), Berthoud and Lyons (no problems). CI builds every site on the pull request.
- `scripts/check-additions.ts` checks one record or profile at a time. `scripts/town-facts.ts --write` rewrites the bulk facts and the road miles when a town is added or the Census Bureau publishes a new vintage.
