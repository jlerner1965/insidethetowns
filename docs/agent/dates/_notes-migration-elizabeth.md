# Migration notes: Elizabeth (read 17 November 2026)

Old content read from commit 7141d032. All reads by curl with the repo's own User-Agent unless said. Decisions are in `docs/migration/decisions/elizabeth.csv`.

## Could not be read
- **townofelizabeth.org** (every page: /bt, /pc, parks-and-trails, the tree-lighting page): HTTP 403 "Just a moment..." to curl and to WebFetch. Not worked around. Affects Town Hall, Running Creek Park, the Board of Trustees and Planning Commission meetings.
- **elizabethchamber.org**: every URL returns a script redirect to `/lander`, a parked-domain page. business.elizabethchamber.org does not resolve. No other Chamber site found by search. Affects Boo Bash on Main.
- **historycolorado.org/location/first-national-bank-elizabeth**: HTTP 202 with an empty body, twice.
- **elizabethkbar.com/events**: 200, but the calendar is loaded by script; the page text carries no events.
- **pplibraries.org/03a-activities-calendar/**: 200; the calendar is an embedded Google Calendar frame, no events in the page text.

## Places (23 kept, 1 gone)
- antelope-alpacas: antelopealpacas.com/find-us.html: "360 Main Street", "Saturdays 10:00 AM - 5:00 PM", "303-646-YARN (9276)". No change.
- carriage-shoppes-tea-room: carriageshoppestea.wordpress.com: "392-B Main Street", "1-303-646-4681", "Tuesday – Saturday: 11am to 3pm, Closed Sunday & Monday". No change.
- casey-jones-park: elizabethpr.com/casey-jones-park: "103-acre site", "4 new courts were added to the park in 2024", "approximately 1.5 miles", "(303) 646-3599". No change.
- catrinas-latin-food: elizabethfamilyrestaurant.com/contact: "210 S Elizabeth St A", "(719) 751-8789", Mon–Sat 6:30 AM–8 PM, Sun 8 AM–2 PM. No change.
- el-pinito: pinitofamilyrestaurant.com: "800 E Kiowa Ave", "(303) 646-1556", "(303) 646-3365", Mon-Fri 11–9; the page still prints Sat "10:00 am - 9:00 am" and Sun "9:00 am - 9:00 am", as the file already says. No change.
- elbert-county-artists-guild: elizabethmainstreet.org directory: "338 S Main Street", "303-565-7491", "Founded in 2024". No change.
- elizabeth-brewing-company: brewelizabeth.com: "239 South Main Street", "(720) 335-6011", "Monday - Friday: 4pm - 10pm, Saturday: 12pm - 10pm, Sunday: 12pm - 8pm". No change.
- elizabeth-kitchen-and-bar: elizabethkbar.com/contact: "240 South Elizabeth Street Unit 110", "720-761-5000", hours as filed; "Kitchen closes at 9pm Daily. Friday and Saturday at 10pm & Sunday at 8pm". No change.
- elizabeth-library: pplibraries.org/01b-elizabeth-library/: "651 Beverly St.", "303-646-3416", Mon–Thu 9–8, Fri 9–5, Sat 10–5, Sun closed. No change. (Notice on the page: all locations closed Thursday, November 26 and Friday, November 27.)
- elizabeth-stampede-grounds: elizabethstampede.com: "(303) 646-0308"; the home page's countdown block prints "Elizabeth Stampede · June 3–6, 2027" as visible text, which is the file's 2027 sentence. No change. Note for the owner: the hub record `elizabeth-stampede-rodeo` has 2027 as not-announced (the 12 November read took the date for a hidden attribute; the same block also prints it in a visible line). Not edited here.
- elizabeth-town-hall: source 403. Kept on two other Town-run sites: historicelizabethco.org footer "151 South Banner Street, Elizabeth, CO 80107, 3036464166"; elizabethmainstreet.org "151 S Banner Street", "303-646-4166", Mon–Fri 8:00am–5:00pm. The meeting days, times and comment limits in the body were NOT re-read (they stand on the 7 October read). Owner to read /bt by hand.
- evans-park: elizabethpr.com/evans-park: "34201 County Road 17", "(303) 646-3599", skate park, pond, pickleball as filed. No change.
- first-national-bank-building: the source (/about) now shows only a script-loaded directory. Read historicelizabethco.org home: "In 2023, the First National Bank (188 S Main St) was listed on the National Register of Historic Places"; Main Street Program news: "Over 115 years ago in 1907 it was the building that ...". The 1914, 1933, American Legion and vault details were not re-read. Kept.
- historic-main-street: historicelizabethco.org: "In 1998, Elizabeth passed a preservation ordinance and created its Historic Advisory Board", "In 2002, the 1882 Section House was restored", "In 2012, interpretive plaques", "In 2015 ... Main Street city and a Certified Local Government"; Depot lot post (quick_posts/21734): "455 E Spruce Street", "More than 100 parking spaces". No change.
- ic-threads: icthreads.com: "244 Main Street", "(720) 394-6999" (the page also shows (303)646-2161), Tue–Fri 10–5, Sat 10–3, Sun–Mon closed. No change.
- kgs-fashion-farm: Main Street directory: "271 S Main Street"; still no phone or hours. No change.
- mountain-man-nut-and-fruit: mtnman.com stores page: "207 Main St", "(303) 621-0175", "Mon ... Sat: 10:30–17:30, Closed Sundays". No change. (Banner: closed November 25-27.)
- powder-river-hat-company: powderriverhats.com: "211 Main St", "Tuesday-Saturday 10am-5pm or by appointment", "(303)-646-6999". No change.
- prickly-pines-disc-golf: elizabethpr.com/prickly-pines-disc-golf: "18-hole disc golf course in Evans Park", "Daily Fee $5.00". No change.
- randys-antiques-and-art: Main Street directory: "232 S Main Street", "720-343-7266". No change.
- small-town-mini-donuts: smalltownminidonuts.com: page content "Monday – Friday: 7a-12p, Saturday & Sunday: 8a - 12p"; the "3–5 pm" block the file had is no longer on the page. CHANGED `hours` to "Mon–Fri 7 am–noon, Sat–Sun 8 am–noon". The template footer still carries the other, older set (Mon 6am-1pm ... Thu Closed), as the body already warns.
- the-carriage-shoppes: thecarriageshoppes.com: "392 Main Street", REGULAR and WINTER hours both printed, as the file states. No change.
- the-nest-at-the-1897-house: Main Street directory: "286 S Main Street", "720-643-5124", "Founded in 2020". No change (the directory now also lists hours, Mon–Sat 10–5, Sun 11–4; not added).
- running-creek-park: 410, unverifiable. Source is the Town's parks page (403); no other official page gives its address or amenities. Two kept guides still link to it.

## Guides (3 kept)
- elizabeth-history: historicelizabethco.org (dates above; "1890 Huber-Carlson Building (239 Main Street)"); en.wikipedia.org/wiki/Elizabeth,_Colorado: "post office opened on April 24, 1882", "Incorporated October 9, 1890", "1,675 at the 2020 United States census, a +23.34% increase"; brewelizabeth.com/about-the-building: "In 1995 ... State Register of Historic Properties status for the 1890 Huber-Carlson Building", "George Carlson bought ... in 1971". History Colorado not readable, so "January 31, 2023", 1914 and 1933 were not re-read. Only `verified` set.
- elizabeth-with-kids: district park pages and library page as above; douglasco.gov Two Bridges: "10.4 miles with multiple loops from 2.7 to 10.4 miles", "Pets must be on leashes", "one hour before sunrise to one hour after sunset". CHANGED "From 6 most mornings; closed Thursdays." to "Open 7 to noon Monday to Friday and 8 to noon at weekends." (the shop's page content). Running Creek sentences rest on the Town page (403), not re-read.
- explore-elizabeth-in-walking-order: sources above, plus elizabethstampede.com/parking: "All parking for the public will be at Elizabeth High School and Elizabeth Middle School ... FREE", "ADA parking will remain in the main lot at Casey Jones Park". CHANGED "the 2027 dates come out in spring" to "the Stampede's home page gives June 3 to 6 for 2027".
- Not carried, listed only: pages/moving-here; programs (9); updates (2); weekly (5); corrections (2); staging/events (3).

## Events
- **Boo Bash on Main** (owner's ask): NOT verified, so no record added and both old paths are 410. Organizer page elizabethchamber.org is a parked domain; elizabethmainstreet.org events, calendar, news and key-projects pages carry nothing on it; the Town's site is 403. A web search found only listings that are not the organizer's (Macaroni Kid, AllEvents, Denver Gazette), which are not sources. The record drafted on 12 November stays in `unverified/elizabeth-boo-bash-on-main.md`. To publish: read the Chamber's own announcement by hand (its Facebook page or a new site), complete that record, move it to `content/hub/traditions/`, and change the two CSV rows to `tradition` with destination `/elizabeth/boo-bash-on-main/`.
- mayors-tree-lighting (+ -2026): tradition, existing record `elizabeth-mayors-tree-lighting`, mapping already in data/hub/fold-events.json. Its source page is 403 today; record not touched.
- Kept, each confirmed today:
  - an-elizabeth-christmas-2026-12-12: elizabethpr.com/epr-hosted-events: "An Elizabeth Christmas - Casey Jones Pavilion- December 12th, 1pm-3pm @ Casey Jones Pavilion". The page does not call it annual; kept as an event, no record.
  - comedy-night-in-elizabeth-2026-12-12: Eventbrite: "Saturday, December 12 • Starts at 8 PM", "Elizabeth Kitchen + Bar, 240 South Elizabeth Street #Unit 110".
  - elbert-county-marketplace 11-21, 11-28, 12-05, 12-19: marketspread.com organizer page: "November 7, 14, 21, 28 / December 5, 19", "Hours are 9 AM – 2 PM", "Casey Jones Park Pavilion, 4189 S. Hwy 86". Dates written out by the organizer, so each counts as confirmed.
  - EMS/EHS band 12-07, choir 12-08, orchestra 12-09: elizabethschooldistrict.org/all-events?cal_date=2026-12-01: Monday December 7 "EMS/EHS Band Concert (@EHS)" 6–7 PM; Tuesday December 8 "EMS/EHS Combined Choir (@EHS)" 7–8 PM; Wednesday December 9 "EMS/EHS Combined Orchestra Concert (@EMS)" 6–7 PM.
  - Legacy Academy theater 12-03, band 12-10: the school's public Google calendar (linked from legacyk8.org), read as its public iCal feed: "EVENT: Fall Theater Performance" 2026-12-04T01:00Z to 02:30Z (3 December, 6–7:30 pm MST), "EVENT: Band Concert" 2026-12-11T01:00Z to 02:30Z, both STATUS:CONFIRMED.
- 410, upcoming but not confirmed:
  - Board of Trustees 11-24, 12-08, 12-22 and Planning Commission 12-01, 12-15: Town site 403.
  - christmas-cow-painting 12-10 and live-music-mike-maurer 11-25: restaurant events page is script-loaded; nothing read.
  - Library series occurrences from 1 December on (Coffee & Chat, Curiosity Club, Heritage Crew, LEGO, Piecemakers, Joy Seekers, Just a Note) and wic-clinic 12-09: the library's own calendar is a script-loaded frame. elizabethmainstreet.org/calendar (the library's feed) does list each date at the filed time, but as rule-generated repeats: it lists Curiosity Club on 26 November although the library's own page says it is closed that day, and Joy Seekers on 1 January. So no occurrence is individually confirmed. Owner's call: if the Main Street calendar listing is enough, those 30 rows could flip to `keep` (less the 26 November, 24 December and 1 January ones).
- 410, the rest: past events (30 rows), three canceled Town meetings (also past), three weekly-series pages (story-time-mondays, story-time-wednesdays, yarning-for-all).
- retired.json at the old commit lists 9 event and 5 place addresses already retired before the fold; they are not files and are not in the CSV.
