# Migration notes: Georgetown (read 2026-11-17)

Old content from commit `933267d5` (insidegeorgetownco.com): 20 places, 4 articles, 14 events.
Read with `curl -sSL -m 25 -A "InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)"`
unless a row says otherwise. Files deleted before that commit were staging files only
(`staging/events/board-of-selectmen-2026-10-13`, `staging/events/jtml-book-group-2027-01-21`,
`staging/places/coopers-on-the-creek`, `staging/places/kneisel-and-anderson`): never published, so no old paths.
No event file carries `formerSlugs`, `annual` or `slug`; every old path is the file-name form.

Every restored file lost its `image`, `imageAlt` and `imageCredit` lines: the photographs were deleted with
the guide (`content/georgetown/images/` holds only `hero.jpg`) and this pass may not touch images. To bring
them back, restore from `933267d5`: `alpine-hose-no-2-firefighting-museum.jpg`, `gateway-visitor-center.jpg`,
`georgetown-loop-railroad-devils-gate-depot.jpg` (place and the with-kids article), `hamill-house.jpg`,
`the-old-school.jpg` (place and the history article), `tom-bennhoff-lake-trail.jpg`, and re-add the three lines.

## Places (20 kept, 0 gone)

| Place | URL read | Words that settle it | Changed |
|---|---|---|---|
| 511-rose | 511rose.com/our-chef-menu, /, /contact-us | "Monday: 11am to 3pm / Tue-Wed: CLOSED / Thursday: 11am to 8pm" … "Sunday: 11am to 8 pm"; "* LIVE MUSIC starts at 5pm Friday & Saturday"; "Every Friday and Saturday from 5p-8p"; "511 Rose Street … (303) 569-5142" | live-music days in summary and body: Thursday to Sunday, now Friday and Saturday |
| alpine-hose-no-2-firefighting-museum | historicgeorgetown.org/hamill-house | "Alpine Hose Museum hours: Alpine Hose Fire Museum is closed for the season"; "Both museums will be open for 66th Annual Georgetown Christmas Market, Dec 5-6, 12-13, 11am-3pm"; "507 5th Street"; "(303) 569-2840" | `seasonal.season` now "Closed for the season", `seasonal.hours` removed (Thu–Sun noon–4 is no longer on the page), `note` added, `closes: 2026-09-27` kept; summary and second paragraph say what was read on each date |
| hamill-house-museum | historicgeorgetown.org and /hamill-house | "Hamill House tours are available by reservation only - call 303.569.2840"; "No Admission Cost"; "Original House -1867"; "305 Argentine Street" | `seasonal` now "Tours by reservation only", `hours` and `closes` removed, `note` added; summary and season paragraph rewritten to the page |
| bierstadt-trailhead | fs.usda.gov/r02/arp/recreation/bierstadt-trailhead; fs.usda.gov/r02/arp/alerts/guanella-pass | "Go south on County Road 381 … for 9 miles"; "3.6 miles one way"; "mandatory free self-issuing permit"; order "ARP-CCRD-2023-02 … December 31, 2028" | none |
| cabin-creek-brewing | cabincreekbrewing.com | "Sunday - Thursday 11:30am - 8:00pm / Friday - Saturday 11:30am - 8:30pm"; "577 22nd St. … (720) 619-7264" | none |
| capital-prize-gold-mine-tours | capitalprizegoldmine.com/rates-hours, /directions-map | "1016 Biddle St"; "Regular Hours (September - June) … Mondays and Tuesdays may be restricted"; "Summer Hours (July - August) Hours 11am to 3:00pm"; "303-569-2468" | none |
| city-park | townofgeorgetown.us/town_government/parks_and_trails.php | "Town Parks … 2. City Park" | none. The address (1001 Taos Street) is from the Town's 2021 master plan PDF, not re-read today |
| coopers-on-the-creek | coopersonthecreek.com/contact/ | "11:30a – 8p Sun, Mon, Tues, Thurs / 11:30a – 9p Fri & Sat / Closed Wed"; "1500 Argentine St"; "303-569-5088" | none |
| gateway-visitor-center | georgetowntrust.org/georgetowngatewayvisitorcenter | "1491 Argentine Street"; "(303) 569-2405"; "Gift Shop and Information Center 9 a.m. to 5p.m. daily"; "Hours: 9 am - 5 pm M-F" | none (the page still gives both lines; the file already says so) |
| georgetown-lake-and-tom-bennhoff-lake-trail | Town parks page; .../tom_bennhoff_lake_trail.php; .../newslist.php | "Non-motorized boats only"; "approximately a 2 mile loop"; "Ice driving on the lake is by permit only- January - February"; news list still carries "Dec 31, 2025 Residents Urged to Use Caution" and "Georgetown Lake Ice Safety Reminders: Ice Fishing Prohibited Due to Added Safety Risks" | none |
| georgetown-loop-railroad-devils-gate-depot | georgetownlooprr.com/faqs-directions/, /events/ | "646 Loop Drive"; "888-456-6777"; "about 55 minutes from mid-October through early January"; "The Silver Plume Station is only open from late May through mid-October"; events page: "Santa's Lighted Forest November 6 – December 24" | none |
| guanella-pass-scenic-byway | clearcreekcounty.us/689/Guanella-Pass-Information | "seasonally closed after Thanksgiving and reopens on or about Memorial Day weekend at Naylor Lake"; "0.8 miles from the summit"; "$87.50"; "303-679-2422 Ext. 2". The Forest Service byway page was not re-read | none. The page's banner still reads "Guanella Pass is OPEN for summer!" |
| john-tomay-memorial-library | cccld.org/about/locations-and-hours | "605 6th Street … 303-569-2620"; Mon–Wed 9–5, Thu 9–6, Fri 9–5, Sat 9–2, "Sunday: Closed" | none. Banner: all branches closed 26–28 November |
| kneisel-and-anderson | kneiselanderson.com | "Wednesday-Sunday: 11am-5pm / Monday-Tuesday: CLOSED"; "509 6th Street … (303) 569-2650" | none |
| microtel-georgetown-lake | wyndhamhotels.com/microtel/georgetown-colorado/microtel-inn-and-suites-georgetown-lake/overview | curl got 404 (it redirects to a path without /overview); the WebFetch tool read the page: "2190 Argentine Street, Georgetown, CO 80444"; "+1-720-679-3754"; "friendly 24/7 service" | none. Read through WebFetch's summary, not the raw page: worth a look by hand |
| mountain-mamas-needful-things | mtnmamas.net/contact/ | "415 Rose Street"; "303.569.5116"; "Sun: 7:30am – 4pm / Mon/Tues: CLOSED / Wed/Thurs: 7:30am – 8:30pm / Fri/Sat: 7:30am – 10:30p" | none |
| rutherford-trail | georgetown-colorado.org/hiking-in-georgetown/; trails.colorado.gov/routes/184 | "RUTHERFORD TRAIL 403 3rd Street Intermediate, 2.1-mile trail"; "an excellent hiking and snowshoeing route from Georgetown up to Silver Dale" | none |
| silver-dollar-lake-trail | fs.usda.gov/r02/arp/recreation/trails/silver-dollar-lake-trail | "Just south of Guanella Pass Campground and north of the Guanella Pass, is a small parking area"; "Dogs must be on a hand-held leash"; last updated August 28, 2026 | none |
| the-old-school | georgetowntrust.org/events | "The Old School: 303-569-5180"; "Georgetown Old School … at 809 Taos Street"; newest event still the plein air exhibit to 9 August 2026 | none |
| werlin-park-dog-park | townofgeorgetown.us/town_government/werlin_park_dog_park.php | "Werlin Park / Dog Park located at 11th/Taos in Georgetown." | none |

## Guides (4 kept, 0 gone)

- explore-georgetown-in-driving-order: re-read the Trust, Town visitor, Loop FAQ, where-to-eat, Mountain Mamas', 511 Rose, Town parks, Capital Prize (both pages), Bennhoff trail, hiking and Cabin Creek pages; every hour, price and address matches except 511 Rose's music days ("Thursday to Sunday evenings" changed to "Friday and Saturday evenings"). The 2021 master plan PDF was not re-read.
- georgetown-october-to-may: a 2026–27 off-season page (`supersededAfter: 2027-05-31`), still current. All nine sources re-read; county plowing and gate text, Forest Order to "December 31, 2028", the two lake notices on the Town's news list and COTREX's "hiking and snowshoeing" all still there. Changed: the intro now says the pages were read on 10 October and again on 18 November; the museums sentence adds what Historic Georgetown's site says now (Hamill by reservation, Alpine Hose closed for the season, both open for the Christmas Market).
- georgetown-history: townofgeorgetown.us "Since its beginning as a mining camp in 1859"; "National Historic Landmark District"; georgetown-colorado.org/history-and-tours/ lists Alpine Hose, Hamill House, Hotel de Paris and the Loop. The schoolhouse dates (2015, 2023) rest on the Trust's press packet, as the Old School listing says; not re-read. No change but the image lines.
- georgetown-with-kids: makes no dated claims; Loop, Capital Prize and library pages answer. No change but the image lines.

Not carried, listed only: `pages/moving-here.md`, `weekly/2026-10-19.md`.

## Events (14 old paths)

- christmas-at-the-hamill-house-2026-12-12: keep. historicgeorgetown.org/christmas-at-the-hamill-house/: "Saturday, December 12th, 2026 & Saturday, December 19th, 2026 / 6:00 PM – 9:00 PM"; "Ticket cost: $85 per person"; "Saint Nicholas and The Silver Plume Singers". The page does not call it annual, so no tradition record was added.
- georgetown-christmas-market-2026-12-05 and -12-12: tradition, existing record `georgetown-christmas-market` (not edited). The page still reads "66th Annual Georgetown Christmas Market, Dec 5-6, 12-13".
- trick-or-treat-train-2026-10-30: tradition, `/georgetown/trick-or-treat-train/`; the record is the Idaho Springs pass's to add. The railroad's events page no longer lists it.
- autumnfest-georgetown-loop-2026-10-16: 410. georgetownlooprr.com/events/ now lists only the holiday, New Year's and Encore trains; no word that Autumnfest returns.
- john-tomay-memorial-library-book-group-2026-11-19: keep. cccld.org/event/jtml-book-group/2026-11-19/: "November 19 @ 3:00 pm - 4:30 pm MST", "605 6th Street".
- john-tomay-memorial-library-book-group-2026-12-17: 410. Its URL redirects to /2026-09-17/ ("This event has passed") and cccld.org/events/month/2026-12/ lists no JTML Book Group.
- jtml-book-group-2027-01-21: keep. cccld.org/event/jtml-book-group/2027-01-21/: "January 21, 2027 @ 3:00 pm - 4:30 pm MST", "605 6th Street".
- 410 as past, no web read: bookfest-halloween-book-giveaway-2026-10-31, hoppy-halloween-storytime-2026-10-30, jtml-book-group-2026-10-15, jtml-friends-community-potluck-2026-10-17, music-and-movement-storytime-2026-10-16, werewolf-after-dark-2026-10-15.
