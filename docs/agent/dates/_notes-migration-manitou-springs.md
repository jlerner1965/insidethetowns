# Notes: migration of insidemanitousprings.com to the hub (read 2026-11-17)

Old content read from commit `a030ab9b`. Pages read with `curl -A "InsideTheTowns-linkcheck/1.0 (+https://insidethetowns.com/editorial/)"` unless a line says otherwise. Decisions: `docs/migration/decisions/manitou-springs.csv` (92 old paths: 26 places, 3 guides, 63 events).

No event file carries `slug`, `formerSlugs` or `annual`, so each old event address is its file name. The files deleted before 3 November (staging places and events, one image) were never public addresses; the three staged events and three staged places were promoted to files of the same name, which are in the CSV.

Not carried, listed only: `pages/moving-here.md`; `weekly/2026-10-19.md`, `2026-10-26.md`, `2026-11-02.md`; `staging/places/` (garden-of-the-gods, manitou-springs-library, manitou-springs-penny-arcade, patsys-of-manitou-springs, red-mountain-trail, the-loop, theos-toys), never published. No `programs/` or `updates/`.

## Could not be read (owner to read by hand)

- **manitouspringsco.gov** (whole site, robots.txt included): 403, Cloudflare "Sorry, you have been blocked", to curl and to WebFetch. Affects Fields Park, Memorial Park, Soda Springs Park (410 unverifiable) and the four City meeting series (410).
- **monalisafondue.com** (home and /contact): 403 "Just a moment..." to curl, 403 to WebFetch. Mona Lisa Fondue Restaurant 410 unverifiable.

## Places kept (22)

- **Adam's Mountain Cafe** — adamsmountaincafe.com. "26 Manitou Ave", "(719) 685-1430", "Tue – Sat : 8am – 2pm, 5pm – 8pm / Sun & Mon : 8am – 2pm". No change. (A banner still reads "Closed Tuesday, September 8".)
- **Barr Trail** — fs.usda.gov trail page. "constructed from 1914 to 1921", "about 16 hours", "A fee is required to park at the trailhead", Route 33 shuttle, "Motorized vehicles are prohibited". No change.
- **Cog Railway** — cograilway.com. "515 Ruxton Ave", "1 (719) 685-5401", "year-round operation", "3.5 hour round trip" (the file already notes 3 vs 3.5). No change.
- **Cave of the Winds** — hours-directions page. "100 Cave of the Winds Rd", "719-685-5444", "10am-5pm daily (last tour around 4pm)", "Open year-round except Thanksgiving and Christmas Day". No change.
- **Commonwheel Artists Co-op** — contact-us.html. "Open Daily 10AM to 6PM", "102 Cañon Avenue", "719-685-1008". No change.
- **Crystal Park Cantina** — crystalparkcantina.com. "178 Crystal Park Road", "(719)-685-5999", "Sun, Tue, Wed, Thur, Fri, Sat 11:00 AM - 9:00 PM". No change.
- **Iron Springs Chateau** — 1home.html, 1tickets.html, 1prices.html. Phone "(719) 685-5104"; "performs on Friday and Saturday evenings"; "doors open at 7:00 p.m. and the show begins at 7:30 p.m."; box office "01 May - 31 August: Tuesday through Saturday 12:00 to 5:00 p.m."; "$50.00". Changed: the Rocky Horror run "plays" to "played" (summary and body). NOT changed, for the owner: the home page now prints "444 S. Ruxton Avenue, Manitou Springs, CO 80819"; the file has "444 Ruxton Avenue ... 80829" (80829 is the ZIP every other Manitou page gives). The body's line about the 2025 holiday show is dated to 10 October and was left.
- **Manitou Art Center** — manitouartcenter.org. "Wednesday and Thursday 10am to 6pm / Friday and Saturday 10am to 5pm / Sunday - Tuesday CLOSED", "513/515 Manitou Ave", "(719) 685-1861". No change. Conflict on its own site: the events page lists "Tuesday 10am to 6pm" for the buildings.
- **Manitou Brewing Company** — manitoubrewing.com. "725 Manitou Ave", "719-282-7709"; hours now "Sun – Thurs / 12pm – 8pm / Friday & Saturday / 12pm – 9pm" (header and footer agree). Changed: `hours` and the body's hours sentence.
- **Manitou Cliff Dwellings** — season-hours-cost page. "May, June, July & August – 9 A.M. to 6 P.M. / March, April, September & October – 9 A.M. to 5:00 P.M. / November – 9 A.M. to 4 P.M. / December, January, & February – 10 A.M. to 4 P.M."; "(719) 685-5242"; "10 Cliff Rd"; admission as filed. Changed: `hours`, the summary's hours clause and the body's hours sentence.
- **Manitou Incline** — coloradosprings.gov/manitouincline. "Winter Hours - November 1 - April 30: 6 a.m. - 3 p.m."; "Summer Hours - May 1 - October 31: 6 a.m.- 6 p.m."; "free online reservation and signed waiver are required"; "No pets allowed"; "We do not allow parties larger than 8 people." No change.
- **Manitou Mineral Springs** — manitousprings.org/mineral-spring-water/ ("8 naturally-carbonated mineral springs"; map and cups at "354 Manitou Ave."; "cups are CASH ONLY") and manitousprings.org/faq/ ("All public mineral springs are completely free and flow 24/7"). No change.
- **Manitou Outpost** — manitououtpost.com. "807 Manitou Ave.", "(719) 685-5026", "10:00 am – 5:00 pm [7 Days a Week]". No change.
- **Manitou Springs Heritage Center** — manitouspringsheritagecenter.org. "517 Manitou Avenue", "(719) 685-1454"; now "Open Wed – Sun Noon-4:00pm or by appointment." Changed: `hours` ("Daily" to "Wed–Sun"), the summary and the body sentence. (The footer also says "Closed November 25th for Thanksgiving"; not written.)
- **Manitou Springs Visitor Center** — manitousprings.org/contact-us/. "(719) 685-5089", "354 Manitou Ave". Changed: body "the 2026 race is on" to "was on".
- **Miramont Castle Museum** — miramontcastle.org/contact. "10:00AM – 3:30PM, Tuesday - Sunday"; "Summer Hours (Memorial Day - Labor Day) 9:00AM – 4:30PM, 7 days a week"; "719-685-1011"; "9 Capitol Hill Ave". No change.
- **Pikes Peak Chocolate and Ice Cream** — contact-1 page. "805 Manitou Ave.", "(719) 685-9600", hours as filed. No change.
- **Red Dog Coffee** — /hours. "MONDAY - THURSDAY • 7AM-6PM / FRIDAY - SUNDAY • 7AM-7PM", "739 Manitou Ave.", "719-313-9080". No change.
- **SALUS** — shopsalus.com. "Manitou Springs Store / 906 Manitou Avenue, Ste 105 / 719-685-1121 / Hours 10:30–6 daily". No change.
- **Swirl** — swirlismybar.com. "717 Manitou Ave.", "1-719-685-2294", "Monday-Thursday: 11 am- 9 pm ... Sunday: 11am - 8pm". No change.
- **The Cliff House** — thecliffhouse.com/contact-us. "306 Cañon Ave.", "719.785.1000". No change.
- **Villa Motel** — villamotel.com and /faq/. "481 Manitou Ave", "(719) 685-5492", "Check in is at 3:00 pm ... arrive after 9:00 p.m. ... Check out time is 11:00 a.m.", pool "Memorial Day weekend through Labor Day weekend", guest laundry. No change.

## Guides (3 kept)

- **explore-manitou-springs-in-walking-order** — read: manitousprings.org/parking/ ("Hiawatha Gardens 84 Spaces Starting at $3.00/hr ... Paid Parking from 5am – 6pm"; "Canon Lot 46 Spaces Starting at $3.50/hr ... 7am – 6pm"; "Free parking after 6pm"; two free 30-minute sessions; "719-685-2600"), the springs, contact, Art Center, Heritage Center, Commonwheel, Miramont (home page: admission $15/$13/$10, tearoom "11:00am and 1:00pm only"), Brewing, PPLD ("701 Manitou Ave.", "Route 3") and Cliff Dwellings FAQ ("Exit 141") pages. Changed: Heritage Center "every day" to "Wednesday to Sunday"; Brewing hours to "Sunday to Thursday noon–8 pm and Friday and Saturday noon–9 pm". `updated` added. NOT re-read: the Mona Lisa sentence (hours, $68, two hours) and the Soda Springs Park and Memorial Park facts (both sources 403). Its links to /places/mona-lisa-fondue-restaurant/, /places/soda-springs-park/ and /places/memorial-park/ point at places not carried.
- **manitou-springs-history** — Heritage Museum (517 Manitou Avenue), springs page, Miramont (tea "Reservations required"). No change. Links to /places/soda-springs-park/.
- **manitou-springs-with-kids** — Heritage Museum and Miramont read; the City source is 403. No checkable claim found wrong. Links to Soda Springs Park and Memorial Park, not carried.

## Events

- **Emma Crawford Coffin Races** (two old addresses) — existing record `manitou-springs-emma-crawford-coffin-races`; not re-read.
- **Manitou Christmas Parade** — NEW record `manitou-springs-christmas-parade`. manitouchristmasparade.com: "The Annual Manitou Christmas Parade"; "Sunday, December 6th, 2026 6 PM". /parade-information/: "Parade Start: 6:00 pm / Sunday, December 6, 2026 / Manitou Ave – On Manitou Avenue From Ruxton Avenue to El Paso Blvd."; "The U.S. Marine Corps Reserve will be out to pick up for Toys for Tots". 6 December 2026 is a Sunday. No cost and no first year on the pages. Type `parade-of-lights` chosen on "a night time spectacular on Sunday evening beginning at 6:00 pm"; the organizer does not use the words "parade of lights" (owner may prefer `festival`).
- **Armadillo Ranch** — manitouarmadilloranch.com/events is a Tockify embed (`data-tockify-calendar="dilloranch"`); the calendar's own feed (tockify.com/api/ngevent?calname=dilloranch) read. All 22 filed gigs from 19 November to 31 December are on it with the same start and end times. Page: "$3.50 entertainment fee", "962 Manitou Avenue". Kept. On the calendar and not on the old guide (not added): Packing Tape, 21 November.
- **Chamber holiday page** — manitousprings.org/holiday-traditions-in-manitou/: "Nov 25 from 5:00-7:00pm at the Town Clock"; "November 25: Christmas Tree Lighting at Wheeler Town Clock with Santa Claus 5-7pm"; "December 24: Santa at the Town Clock" (no time); "December 31: AdAmAn Fireworks on Pikes Peak". Three events kept.
- **AdAmAn fireworks** — adaman.org: "at the stroke of midnight on New Year's Eve"; "The guest application process has been closed for the 2026 climb." Kept as an upcoming event, not a tradition: its hub record stays in `unverified/` (the date rests on "each year"). "Weather permitting" in the file's time note is not on either page; left as filed.
- **Elf on the Shelf Hunt** — manitousprings.org/elf-hunt/: "4th Annual", "Starts Wednesday, November 25 / Ends Sunday, December 20 @ noon". Kept.
- **Commonwheel Holiday Market** — commonwheel.com/events.html: "November & December (Nov. 6 - Dec. 27) Holiday Market". Kept (a market: no tradition record).
- **Miramont** — miramontcastle.org/upcoming-events: Victorian Christmas High Tea, nine seatings 27 to 29 November, each "SOLD OUT", "$65 per ticket"; Poe Night 15 Jan 6 and 8 pm, 16 Jan 6 and 8 pm, 17 Jan 6 pm, "$65 per ticket. Reservations required." Both kept.
- **First Friday, 4 December** — manitouartcenter.org/events: "Join Us! Every First Friday 5-8 PM" and "Upcoming events: No upcoming events". The dated night is not confirmed: 410.
- **Ghost Stories of Old Manitou** (five old addresses) — manitouspringsheritagecenter.org/ghost-tours/: "started back in 1995 ... a key annual fundraiser"; "Get your 2026 Ghost Tours Tickets Now!". No 2027 date and no words that it returns: 410, no record added. A candidate for a record once the museum dates 2027.
- **City Council meetings, work sessions, open mic, Coffee with the City Administrator** — source 403: 410.
- Everything else is a past one-time event: 410.
