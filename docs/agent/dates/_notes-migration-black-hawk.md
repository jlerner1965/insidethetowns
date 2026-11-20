# Migration notes: Black Hawk (read 2026-11-17)

Old content from commit `933267d5` (insideblackhawk.com): 20 places, 3 articles, 17 events.
Read with `curl -sSL -m 25 -A "InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)"`.
Files deleted before that commit were staging files only (`staging/events/creepy-crawl-2026-10-16` and
eleven staged places): never published, so no old paths. No event file carries `formerSlugs`, `annual`
or `slug`; every old path is the file-name form (`/events/mountain-meditation-circle/` has no date).

Restored files lost their `image`, `imageAlt` and `imageCredit` lines: `content/black-hawk/images/` holds
only `hero.jpg` and this pass may not touch images. To bring them back, restore from `933267d5`:
`golden-gate-canyon-state-park.jpg` (place and the with-kids article) and
`maryland-mountain-quartz-valley-open-space-park.jpg` (place and the history article).

2026-11-20: photos restored. The two files were moved with `git mv` from `content/idaho-springs/images/` to `content/black-hawk/images/` (byte-for-byte the files at `933267d5`), their IMAGE_LICENSES.csv rows now name black-hawk, and the three lines are back on both places and on black-hawk-with-kids and black-hawk-history.

## Unreadable sources (11 places and one guide gone for this reason)

- monarchblackhawk.com (every page tried: /contact-us, /dining/bistro-mariposa, /dining/java-etc, /dining/monarch-chophouse, /explore/activities/shopping, /wellness, /dining/the-buffet, /getting-here): HTTP 403, a "Just a moment..." bot check, to curl; 403 to the WebFetch tool as well. Not worked around. Gone: monarch-casino-resort-spa, bistro-mariposa, java-etc-monarch, monarch-chophouse, mpulse-gift-shop, spa-monarch, the-buffet-at-monarch.
- ameristarblackhawk.com (/visit, /dining/bar-8042, /dining/fireside-kitchen, /dining/timberline-grill): redirects to pennentertainment.com/ameristar-black-hawk/…, which answers 403 with the same bot check to curl and to WebFetch. Gone: ameristar-black-hawk, bar-8042, fireside-kitchen, timberline-grill.
- These are the town's two largest resorts. Each needs a read in a browser; if the details still match, the old file can be restored from `933267d5` as it stands.

## Places (8 kept, 12 gone)

| Place | URL read | Words that settle it | Changed |
|---|---|---|---|
| ballys-black-hawk | casinos.ballys.com/black-hawk | "300 Main Street Black Hawk, Colorado 80422 … Phone: 303-582-2600"; Casino Café & Grille, B Bar, Full House Grill, Gold Bar, East Bar & Bites, Double Down Bistro all named | none. The October promotions in the body have passed and were left as dated history |
| black-hawk-and-central-city-tramway | cityofblackhawk.org/1385/Shuttle-Service | "Monday - Thursday 30 Minutes \| 10 am - 2:00 am." "Friday - Sunday 30 Minutes \| 10 am - Noon / 20 Minutes \| Noon - 2 am. / 30 Minutes \| 2 am - 3:00 am."; "303-761-3145" | last runs were 2:30 am and 3:30 am; `hours`, summary and body now 2 am and 3 am |
| gilpin-county-public-library | gilpinlibrary.org/holiday-schedule.html and / | "15131 Hwy 119 … Phone: 303-582-5777"; "Wednesday, November 11 / Thursday, November 26 / Friday, November 27 / Thursday, December 24 / Friday, December 25" | none |
| golden-gate-canyon-state-park | cpw.state.co.us/state-parks/golden-gate-canyon-state-park | "Park: Day use, 5 a.m. to 10 p.m. / Visitor Center: Tue.-Sun. 9 a.m. to 4 p.m., Closed Mondays. / Campground Office: Closed for the season."; "92 Crawford Gulch Road"; "303-582-3707"; "Daily Vehicle Pass: $12-$17"; "Mountain Base Road will be closed for the winter season starting 11-1-26"; "The dump station is closed and water is shut off for the winter season" | visitor center was "daily"; `hours` and body corrected. The fall capacity, towing and paving notices are gone from the page: `access.parking` removed, `access.closures` replaced with the winter closure, the summary's "Expect it to fill by 9 am on fall weekends" removed. Its address is in Golden; kept as the state park the Black Hawk guides send families to. Owner may disagree |
| gregory-street-plaza | cityofblackhawk.org/1215/Gregory-Street-Plaza | "located in the heart of Black Hawk's HARD District"; "Construction of Gregory Street Plaza began in September 2019"; Fire House Museum, Bobtail Mine building and Bunkhouse as the file says | none. The October 2026 Halloween Street paragraph is past and was left as dated history |
| maryland-mountain-quartz-valley-open-space-park | cityofblackhawk.org/1219/Maryland-Mountain-Quartz-Valley-Open-Spa | "8060 Black Hawk Blvd."; "The park is open from dawn to dusk"; "Water is not available at the trailhead or in the park"; "Restrooms and trash receptacles are located only at the trailhead" | none |
| the-lodge-casino | thelodgecasino.com/contact-us/ | "240 Main Street"; "Tel. 303.582.1771" | none |
| white-buffalo-grille | thelodgecasino.com/restaurants/white-buffalo-grille/ | "Thu, Sun, and Mon: 3PM-9PM / Fri and Sat: 3PM-10PM"; "3PM-5PM every Thursday thru Monday"; "303-582-6375" | none |
| cold-springs-campground | fs.usda.gov/r02/arp/recreation/cold-springs-campground | "Site Closed"; last updated September 21, 2026 | gone: the old guide had it `temporarily-closed`, and the banner is still up |

## Guides (2 kept, 1 gone)

- black-hawk-history: cityofblackhawk.org/1195/History: "established in May of 1859 as part of the Gregory Diggings"; "In June of 1860 … founded the town of Black Hawk Point"; "incorporated on March 11, 1864"; "1872: Black Hawk is connected with Denver by railroad"; "1863 Black Hawk Presbyterian Church … Annex Building located at 211 Church Street"; gaming initiative "in 1990", casinos 1991. Kept; only the image lines changed.
- black-hawk-with-kids: City plaza, library and CPW pages answer and say what the article says. Kept; only the image lines changed.
- explore-black-hawk-in-driving-order: gone. Four of its five stops (parking at the Monarch, Spa Monarch, Bistro Mariposa, the Chophouse) rest on monarchblackhawk.com, which cannot be read, and its "in October 2026, a Saturday for Halloween Street" advice has passed.
- Both kept guides end with a link to `/articles/explore-black-hawk-in-driving-order/`, and with-kids mentions "the food directory"; the links were left as the brief asks, and now point at a page that is gone.

Not carried, listed only: `pages/moving-here.md`, `weekly/2026-10-19.md`, `corrections/2026-10-17-tramway-hours.md`.

## Events (17 old paths)

- halloween-street-fall-festival-2026-10-17, -2026-10-24 and halloween-night-2026-10-31: tradition, existing record `black-hawk-halloween-street-fall-festival` (not edited), which covers October 1–31 and the October 31 celebration, 3–8 p.m. Only the 10-24 path was already in `data/hub/fold-events.json`.
- city-council-meeting-2026-12-09: 410. cityofblackhawk.org/calendar.aspx?month=12&year=2026: "City Council Meeting … December 9, 2026, 3:00 PM - 5:00 PM"; its event page (Calendar.aspx?EID=808) leaves "Location:" empty, so the place is not confirmed. A routine meeting; restore it if the owner wants civic meetings on the hub.
- city-council-meeting-2026-11-11: the calendar reads "City Council Meeting - CANCELLED"; 10-14 and 10-28 are past.
- ted-garcia-fine-art-gallery-* (seven files): the City's November and December calendars list none of them (11-27, 11-28, 12-04, 12-19, 12-31 upcoming). The gallery was never a published place on the guide and its own site was not looked for. 410.
- mountain-meditation-circle (`repeat: weekly`): gilpinlibrary.org/mountain-meditation-circle.html: "WHEN : Mondays at 6:00pm", "meets on Monday evenings … from 6:05 pm to 7:30 pm"; no dated occurrence, so nothing to keep on a static page. 410.
- pumpkin-decorating-contest-2026-10-01 (ended October 23) and free-park-entry-for-veterans-2026-11-11: past. 410.
