# Migration notes: Lafayette (insidelafayette.com -> insidethetowns.com/lafayette/)

Read 17 November 2026. Old content from commit `7141d032`. Every page below was read with
`curl` under the repo's own User-Agent (`scripts/lib/probe.ts`); all answered 200, none was
blocked or challenged. Decisions are in `docs/migration/decisions/lafayette.csv`.

## Places (40 old files, 40 kept)

All 40 are in Lafayette and their sources answer today with nothing about closing.
Unchanged except `verified` / `verifiedBy`, apart from these:

- **ghost-box-pizza**: ghostboxpizza.com "Hours: Mon-Thu 4:00 PM - 8:00 PM, Fri 10:00 AM - 9:00 PM, Sat 11:00 AM - 9:00 PM, Sun 11:00 AM - 8:00 PM". `hours` and the body sentence corrected (file had closing an hour later and split weekdays).
- **the-vaughn**: eatatthevaughn.com "MON & WED-THU: 11:30AM - CLOSE / TUESDAY: CLOSED / FRIDAY-SUNDAY: 11 AM - CLOSE". File said from 4 pm Mon, Wed-Thu; `hours` and body corrected to 11:30 am. (Thanksgiving week on the site: Tue Nov 24 open 11:30, closed Nov 26 and 27; not added.)
- **bob-l-burger-recreation-center**: lafayetteco.gov/2575. Hours, address, phone, daily and punch-card prices match. Changed in the body: "Reduced hours, Dec. 9, 24, 31: 5am-2pm" (file had Dec 9 to 1 pm); monthly pass now "Special Renovation Monthly Pass Rates ... Adult $30 R | $40 NR, Senior $17 R | $20 NR" (file had $38 / $21); the $15 weekend family rate and the Reduced Rate Program are no longer on the page, replaced by the page's "2027 Financial Assistance Program ... $200 annual account credit".
- **acreage-by-stem-ciders**: acreageco.com. Address and both phone numbers match. The "$25 bonus card with every $100 gift card" offer is not on the page now; clause removed.
- **william-olivers-publick-house**: williamolivers.com and /locations/lafayette/ both give "201 N Public Road, Lafayette, CO 80026" with no suite. "Suite 1C" dropped from `address` (not contradicted, just not stated). Still no hours on the site.

Read and matching, no change (the words that settle it):

- acreage: "1380 Horizon Avenue, Unit A ... 720.443.3007". arapaho-center-theater (Facility/Details/10): "300 E. Simpson St. ... 303-661-1260 ... currently unavailable for rentals until further notice". beauprez-barn: "695 Beauprez Avenue ... 303-661-1310 ... Open for scheduled programs only".
- coal-creek-trail, flagg-park (bouldercounty.gov): trailhead counts and "Trailheads close at sunset" / "Parks are open sunrise to sunset" match. The Oct 26 - Nov 6 heavy-equipment notice is still printed on both pages; the body's dated sentences (that notice, the Sept 8 closure, the Nov 14 walk) are now in the past but not wrong, left as written.
- festival-plaza: "311 S. Public Rd. ... Hours 6am-10pm". great-bark-dog-park (Facilities RID=70): "119th St. ... 4am-10pm". great-outdoors-water-park: "500 E. South Boulder Road", 2026 hours and gate prices match. indian-peaks-golf-course: "2300 Indian Peaks Trail ... 303-666-4706". jeannots: "Open Every Day | 7 AM - 3 PM ... (303) 586-6545 ... 2770 Arapahoe Rd., Suite 124".
- lafayette-cemetery: "111 W. Baseline Road ... open daily for visitation and remembrance from 7am to sunset". lafayette-chamber-of-commerce: "304 W. Baseline Rd. ... Monday - Friday: 9:00 AM - 4:00 PM"; the $290 membership figure in the body is on another Chamber page, not re-read. lafayette-city-hall: "open to the public from 8am-5pm, Monday-Friday ... 1290 S. Public Road ... 303-665-5588".
- lafayette-history-museum: "108 E. Simpson St. ... Wednesday-Friday 10 AM-2 PM, Saturday 8 AM-12 PM, Sunday-Tuesday Closed ... 303-665-7030" (the site's holiday line reads "Closed Nov. 26 & 26", its own typo). lafayette-police-department: address "451 N. 111th St.", "303-665-5571", "Lobby Hours Monday - Friday 8am - 5pm" read on lafayetteco.gov/99; dispatch 303-441-4444 on the source.
- lafayette-public-library: hours, address, phone and the closures list match line for line. lafayette-senior-center: "103 S. Iowa Ave. ... Monday - Thursday 8:30am-5pm, Friday 8:30am-4pm". lafayette-skatepark: "Daily: Dawn-9pm". lafayette-ymca: "2800 Dagny Way ... 303-664-5455".
- liquid-mechanics, odd13, tandoori-kitchen, tangerine, the-post, the-read-queen, little-herbal-apothecary, jeannots: hours on each site match the file exactly. Little Herbal's page also carries a second widget ("Mon-Fri 9:00 - 17:00, Sat 10:00 - 13:00, Sun Closed") that contradicts its own "Store Hours Monday-Saturday: 10am-6pm, Sunday: 11am-4pm"; the file follows the stated store hours, as before.
- ras-kassas: "802 S. Public Road ... (303) 447-2919/(303) 604-6885". The site prints two sets of hours (3-9 pm every day; a footer with 11am-9pm); the file gives none, left so. romeros-k9-club: "985 South Public Road ... (720) 485-5968".
- rock-creek-east-open-space, the-collective, the-arts-hub ("420 Courtney Way ... Hours: By Appointment Only ... 303-229-1127"), thomas-open-space ("1640 W Baseline Road ... open for the 2026 season through November starting July 17"), wilson-community-gardens (fees and Jan. 7 / Jan. 14 registration match), wow-childrens-museum ("Tuesday-Saturday 9am - 5pm ... Sundays from 12:00pm-5:00pm", $15 / $9).
- the-shack-at-waneka-lake: hours match on the source; the page prints no address, "1600 Caria Dr" read on the Boathouse page (lafayetteco.gov/2647). waneka-lake-park: "open during Park Hours; 6:00 am to 10:00 pm", lots at 705 and 1600 Caria Dr; Boathouse page: "ended rental operations effective Aug. 11".

## Guides (5 old files, 5 kept)

- **bvsd-school-closures-and-lafayette**: bvsd.org/current-topics/declining-enrollment: "On September 22, 2026, the ... Board of Education voted to approve Resolution 26-27"; "(i.e. Birch, Douglass, Eldorado 6-8, Flatirons, Mesa, Monarch K-5)"; the lottery-priority and dual-language quotes are word for word. Choice Enrollment page: "November 1, 2026 - December 18, 2026 ... until August 31, 2027", "On or about December 23rd", "within 13 days", 720-561-5247. No change.
- **explore-lafayette-in-walking-order**: its place sources are the nine read above; all match. Heading for stop 2 lost "Suite 1C" (see William Oliver's). RTD's schedule page lists 225, DASH and JUMP; the Park-n-Ride timetable PDF was not re-read.
- **lafayette-history**: City "This Date in Lafayette History" ("set aside 150 acres", Feb 23 1889, "31 for and 28 against", church dedicated May 13 1893, $3,000, Plant Lake), Rose Lueras page (1934, 25 others, Santa Monica, 2019, 2021), Water Resources ("approximately 80%"), Historical Society About (1976, Elmo Lewis, 2022) and plaque page ("nearly 200", "October 21, 2025"), Wikipedia Columbine page (Nov 21 1927, Eastenes, Spanudakhis). All match. Census CSV not re-read.
- **lafayette-holidays-2026**: kept because its season is still ahead; it is dead after 1 January 2027 and should then be retired. Library closures, recreation center ("Dec. 9, 24, 31: 5am-2pm"), Senior Services, School's Out camps ("$60 R | $72 NR", "8am-5:30pm", the dates), Ride Free Lafayette ("7 a.m.-8 p.m." excluding Thanksgiving, Christmas, New Year's Day), Three Cart tree line and every linked event re-read and matching. One conflict in the sources: the City Storytimes page says "Sensory Storytime with Santa ... Saturday, Dec. 6"; LibCal says "Saturday, December 5, 2026" (the 5th is the Saturday). The article follows LibCal. Its body says "read ... on November 10", left as written.
- **lafayette-with-kids**: WOW! visit and calendar, Storytimes, Makerspace, recreation fees, camps, boathouse, Shack, special events pages match. Removed the "$15 family rate" clause (gone from the City page). The Coal Creek "finish on December 7" line comes from the City's project notice, not re-read.

Links in the kept guides and places to `/families/`, `/get-involved/`, `/moving-here/` and `/updates/` point at old-guide pages that are not carried; left as they are per the brief.

## Events (59 old files + 4 slugs in retired.json)

No old event file has `annual`, `slug` or `formerSlugs`; each old path is the file name.

- **tradition (1, existing record)**: holiday-on-the-plaza-2026-12-05 -> `lafayette-holiday-on-the-plaza`. No new records added.
- **kept, upcoming (37)**, each read today on its organizer page with the same date, time and place:
  - Center for Musical Arts (centerformusicalarts.org/event/...): Monday Jazz Combo 6 pm and 7 pm (Dec 14), Advanced Jazz Ensemble (Dec 16, 7-8), Rocky Mountain Big Band (Dec 17, 7:30-9:30), Michael Davidman (Jan 29 2027, 7:30, $5-$20), Ratoi / Tirsu (Feb 19 2027, 7:30, $5-$20).
  - Cultural Caravan: Behind the Music, "Nov 18, 2026, 7:00 PM, The Collective" (tonight).
  - Odd13 events page: can food drive "Nov 1 ... to Nov 24", Hot Wax Cold Foam Nov 18 (the page's start time reads "4:00 AM", its own error; file gives no start time), Black Friday early release Nov 20 6:30-8, cookie pop-up Nov 21 4-7:30.
  - LibCal: Books & Brews Nov 19 7-8; Older Adult Learning Club Nov 19 and Dec 17 (1-3; Dec topic on event/15132226), Jan 21 and Feb 18 2027 (12:30-2:30; Feb topic on event/17741490); Loteria Nov 21 and Dec 19; Sensory Storytime Nov 28; Sensory Storytime and photos with Santa Dec 5 10:30-11:15; Wellness Crafts Dec 2; Friends holiday sale Dec 4-6 (Sunday 1-3:30 on event/16301274); Paws to Read Dec 13, Jan 10, Jan 24, Feb 28.
  - City calendar / Engage: Construction and Cocoa Nov 19 5:30-6:30; mending circle Nov 22 1-4; Lafayette Birds! Dec 6, Jan 3, Feb 7 (each its own EID, 1-3 pm); winter wreath workshop Dec 10 (waitlist); Jack Frost's walk Dec 13 1-3; Gathered exhibit "Fri, Nov 13 - Sun, Jan 10".
  - ceh.bvsd.org: "Choice Enrollment Tours- 11/20, 12/4 & 12/11 - 8:45am-10:15am"; "IB and Engineering Night - Tuesday December 1st, 5pm-6:00pm".
  - Eventbrite (organizer's ticket page): Lavender Gala, "Sunday, December 6, 12 PM - 3 PM, Nissi's ... 1455 Coal Creek Drive #Unit T". The page calls it the "26th annual"; it is a county-wide event with no hub record, kept as a dated listing.
- **410 (25)**: 19 past one-time events (3-17 November); fall-mindfulness-walk (canceled, past); boys-wrestling-vs-fairview (high-school sports); and the 4 slugs the old guide had already retired with no successor in `retired.json`.

## Listed only, not carried

`pages/moving-here.md`; 26 files in `programs/`; 11 in `updates/`; `weekly/2026-11-02.md` and `weekly/2026-11-16.md`; 17 in `corrections/`; 10 unpublished drafts in `staging/places/`.
