# Migration notes: Nederland (read 2026-11-17)

Old content from commit `7141d032` (insidenederland.com). Every page read with
`curl -sSL -m 25 -A "InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)"`.
No source refused the read; nothing was unreadable.

## Places (29 kept, 0 gone)

| Place | URL read | Words that settle it | Changed |
|---|---|---|---|
| barker-meadows-reservoir, chipeta-park, nathan-lazarus-skatepark | nederlandco.org/1446/Trails-Open-Spaces | "East St. and Boulder Canyon Drive"; "254 Lakeview Drive"; "155 East 1st St." with the amenities as listed | none |
| nedrink | same page, and nederlandco.org/1353/NedRINK | "500 Indian Peaks Drive"; "NedRINK is open December - February"; "Closed for the Season"; "303-258-3167 Ext. 6100" | none |
| brainard-lake-recreation-area | fs.usda.gov/r02/arp/recreation/brainard-lake-recreation-area and ...-seasonal-information | "open from approximately mid-June through mid-October"; "$10 day use fee"; "Motorized activity is prohibited ... from November 15 – April 30"; "From Colorado Highway 72 at Ward" | none. It is at Ward, about 12 miles north; kept as the Indian Peaks access the guide's articles send Nederland visitors to. Owner may disagree |
| bristlecone-bookshop | bristleconebookshop.com | "Thursdays 8-12 / Fridays 12-6 / Saturdays 12-6 / Sundays 10-3"; "114 E Second Street"; "(720) 442-8931" | hours were "Fri–Sat 10 am–5 pm; Sun 10 am–3 pm", now "Thu 8 am–noon; Fri–Sat noon–6 pm; Sun 10 am–3 pm" (the page gives no am/pm; read as 8 am to noon and noon to 6). Summary and the body's "Friday, Saturday and Sunday only" and read date changed to match |
| busey-brews | buseybrews.com | "Monday-Wednesday: 11am – 5pm / Thursday-Friday: 11am – 8pm / Saturday: 10:30am – 8pm / Sunday: 10:30am – 7pm"; "70 East 1st Street"; "855-NED-BREW" | none |
| carousel-of-happiness | carouselofhappiness.org/visit-the-carousel/ | "Monday: 11 am to 5pm"; "Closed Tuesday & Wednesday"; Thu 11–5, Fri–Sun 10–5; "Last ride of the day at 4:45pm"; "$3 per ride"; "20 Lakeview Dr"; "Stay tuned for special Holiday hours." | none |
| crosscut-pizzeria-and-taphouse | crosscutpizza.com | "Monday, Wednesday, Thursday: 3pm- 8pm / Friday & Saturday: 11:30am- 9pm / Sunday: 11:30am- 8pm / Closed Tuesdays"; "Happy Hour will return Wednesday, January 6, 2027"; "(303) 258–3519" | none |
| decent-bagel | decentbagel.com/location | "NEDERLAND: Open 7:30a-5:30p daily (bagel sales stop at 2p) 35 E 1st St."; "Ned: 720-882-6063" | none |
| eldora-mountain | eldora.com/the-mountain/questions/hours-faq/ and eldora.com | "ELDORA IS CURRENTLY CLOSED. FOR OPENING DAY UPDATES, SIGN UP HERE."; "9:00 AM to 4:00 PM Monday through Friday and 8:30 AM to 4:00 PM on Saturday and Sunday"; "typically between November and April"; "303-440-8700" | the page no longer gives the 13 November opening day. Removed `seasonal.opens` and the date from `seasonal.season`; the body sentence now says the page gave no opening date on 18 November |
| fourth-of-july-trailhead, hessie-trailhead, west-magnolia-trailhead | their fs.usda.gov/r02/arp/recreation/ pages | directions, parking, permits and "Restrooms are not available" as the files say. Hessie shuttle: bouldercounty.gov/open-space/parks-and-trails/hessie-trailhead/, "has ended for the 2026 season. Service will resume Memorial Day Weekend 2027." | none |
| kathmandu-restaurant | kathmandurestaurant.us/nederland/ | "Sunday-Thursday, 11 am – 9:30 pm / Friday – Saturday, 11 am – 10 pm"; "110 N Jefferson St"; "303-258-1169" | none |
| mountain-man-outdoor-store | mountainmannederland.com | "98 Peak to Peak Hwy"; "Open daily 9am – 6pm"; "303-258-3295" | none |
| mountain-peak-cafe | mountainpeakcafe.com | page shows today only ("07:00 am – 03:00 pm"); its markup's openingHoursSpecification: Mon–Thu 07:00–15:00, Fri–Sun 07:00–19:00; "121 Jefferson Street"; "(303) 258-0102" | none |
| mountain-peoples-co-op | mtnpeoplescoop.com | "8AM - 8PM DAILY"; "30 E. First Street"; "(303) 258.7500" | none |
| mud-lake-open-space | bouldercounty.gov/open-space/parks-and-trails/mud-lake/ | "31 car parking spots"; "2 ADA parking spots"; "4 horse trailer spots"; "Parks are open sunrise to sunset"; address "2034 Co, Road 126" on the Town's parks page | none |
| natures-own | naturesown.com/nederland | "5 East 1st Street"; "303-258-3557"; "Open daily: 10am - 5pm" | none |
| ned-general | nedgeneral.com/portfolio-item/contact/ | Mon–Wed "7 am – 3 pm", Thu–Sun "7 am – 7 pm"; "112 E 2nd Street"; "303-258-3537" | none |
| nederland-community-center | nederlandco.gov/1400/Community-Center | "750 Highway 72 North"; "303) 258-9721" | none |
| nederland-community-library | nederland.colibraries.org/location-and-hours/ | "Monday-Thursday 10 – 7 / Friday & Saturday 10 – 5 / Sunday 1 – 5"; "200 Highway 72 North"; "303-258-1101" | none |
| nederland-mining-museum | bouldercounty.gov/open-space/education/museums/nederland-mining-museum/ | "The museum is closed for the season."; "June 1 through Oct. 31", Fri, Sat, Sun "11 a.m. – 5 p.m."; "200 N. Bridge Street"; "303-258-7332"; "Admission is FREE." | none |
| nederland-visitors-center | nederlandco.org/1436/Directions and /1434/ | "45 West 1st Street #1"; "303-258-3266 Ext. 6020"; "Wednesday through Monday 11 am to 5 pm" | none |
| the-boulder-creek-lodge | thebouldercreeklodge.com | "55 Lakeview Drive"; "303-258-9463"; check-in "4:00pm - 10:00pm" | none |
| the-caribou-room | thecaribouroom.com/contact-us and /dining | "55 Indian Peaks Dr."; "303-258-3637"; "open show nights from 7-10 PM" | none |
| tin-shed-sports | tinshedsports.com | "M, T, W, F, Sat 9am – 6pm / Thurs & Sun 9am - 5pm"; "112 E 2nd St"; "303.258.3509" | none |
| ubon-thai-cuisine | ubonnederland.com | "Mon: 11:00 AM - 9:30 PM / Tue: 4:00 PM - 9:30 PM / Wed - Sun: 11:00 AM - 9:30 PM"; "155 CO-119"; "(303) 258-3194" | none |

## Guides (4 kept)

- before-you-drive-to-hessie: county Hessie page (distances 4.2 / 9.6 / 11.6 / 12 / 13 miles; "fined $50 or towed"; "Shuttles depart every 15 minutes"; NB fares $2.75 / $1.35; overnight parking rule), Forest Service Hessie and Indian Peaks Wilderness pages (canisters, group of 12, permits June 1 – Sept. 15). All as written. No change.
- explore-nederland-in-driving-order: stops re-read on the pages above. Changed: Crosscut "Monday, Wednesday and Thursday 3–9 pm" to "3–8 pm" (its page). The museum stop and the Halloween line are past for 2026; left as written.
- nederland-history: nederlandco.org/1444/History (Dayton, Brownsville, 1871, Breed, 1873, 1874, nearly 3,000 by 1916, about 200 by 1920), nederlandareahistoricalsociety.org/timeline (Brown's Crossing, 1873, bankrupt 1878, 1905 branch, Wolf Tongue 1904), Wikipedia (15 November 1885; "completed in January 2026"), the Town's Eldora update ("Last Updated on November 06, 2026": "We are continuing to pursue the acquisition"; "previous Purchase Agreement with POWDR has expired"; "approximately $20 million"), county fire release, carousel story, library history. All as written. No change. It is not in the History-story template; left as it was.
- nederland-with-kids: library storytime, Makers Club ("Sept. 24-Nov. 19"), passes and card pages; NedRINK prices ($8 / $10 youth day pass, $5 youth rental, $15 Learn to Skate, $220 / $240 family pass); Fitness Place fees ($3, $5, family $75); Caribou Ranch; Wild Bear ($90/day, 6-12); Eldora lessons and family bundle. All as written. No change. Its October items (Costume Storytime, gold panning, Owl Moon of 24 October, "The calendar") are past, and five of its links go to event pages now gone: /events/gold-panning-2026-10-18/, winnie-the-pooh, dia-de-los-muertos, halloween-eve-pumpkin-carving-party, halloween-at-the-vault. Owner to decide whether to trim.

All four: `verified` and `updated` set to 2026-11-17.

## Events (47 files; none had `annual` or `formerSlugs`)

Kept, each re-read on its own page today (date, time, place as the file says):
- Caribou Room: a-very-caribou-xmas-2026-12-19 ("Saturday, December 19th | Doors & Dinner Available: 7 PM | Show: 7:30 PM", GA $25), spafford-2026-12-12 ("Show: 8 PM", ADV $30). The Xmas page does not call the show annual; kept as a dated event, no record.
- Very Nice Brewing event pages: gael-again 11-19 and 12-17 (6–8 PM), beyond-comprehension 11-21 and halbrooks 11-28 (5–7 PM), trivia 11-20 (7–9 PM), open mic 12-03 (6–8 PM).
- turkey-hangover 11-27: page says "Nov 27, 2026, 6:00 PM – 8:00 PM"; the file had 5 to 7 pm. Start, end and the body's time corrected.
- buseybrews.com/events/: "Live Trivia to Benefit Nederland Fire Protection District (NFPD) November 19th at 6:30pm".
- nederlandfoodpantry.org: Holiday Mountain Market booth "Saturday, December 5th & Sunday, December 6th ... 10:00 AM – 5:00 PM"; Holiday Box Distribution "Saturday, December 19th ... 10:00 AM – 1:00 PM".
- nederland.libcal.com: Front Range Mycological Society "Wednesday, November 17, 2026 5:00pm - 7:00pm" (today); Peak Harmony Holiday music "Thursday, December 3, 2026 6:30pm - 7:30pm".
- wildbear.org: Owl Moon "Saturday, November 21, 2026 6:00 PM 7:30 PM Mud Lake".
- bristleconebookshop.com/events/poetry-open-mic-4: "Saturday, November 21, 2026 5:00 PM 7:00 PM".
- thebackdoortheatre.org: Wicker Nov 20 7 pm, Nov 21 2 pm and 7 pm; The Cat in the Hat Nov 27 7 pm, Nov 28 2 pm and 7 pm.

Tradition, new record `nederland-carousel-of-happiness-gala` for animals-after-dark-neon-night-gala-2026-11-07:
carouselofhappiness.org/annualgala/: "2026 Annual Fundraising Gala"; "our annual fundraiser supporting the Carousel of Happiness"; "When: Saturday, November 7th, 6:30PM to 11:OOPM"; "General Admission | $100", "VIP Admission | $150"; "*** This year’s event is tentatively scheduled for November 2027 ***". That last line was already on the page before the 2026 gala (the old listing's note), so its "this year" is loose; recorded as 2027 not-announced with those words in `continues`. Earlier galas on the page: November 2023, June 2022.

Gone (24): past one-time events, 7 October to 14 November 2026. No source read.

Not carried, listed only: pages/moving-here.md; weekly/2026-10-19, 10-26, 11-02, 11-16; corrections (5); staging/places (11); no programs/ or updates/.
