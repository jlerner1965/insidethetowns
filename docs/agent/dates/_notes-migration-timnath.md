# Migration notes: Timnath (read 17 November 2026)

Old content read from commit 7141d032. All reads by curl with the repo's own User-Agent unless said. Decisions are in `docs/migration/decisions/timnath.csv`.

## Could not be read
- **larimer.gov** Poudre River Trail page: 403 to curl; read with the WebFetch tool (allowed by the brief), which returned the page.
- **timnathchamber.com/directory/the-hidden-stem**: page text loads by script for curl; WebFetch read it. It now gives only "The Hidden Stem is a garden boutique on Main Street in Timnath, offering houseplants, outdoor blooms, and garden decor" and a link to its Facebook page: no address, phone or hours. thehiddenstem.com did not answer (502 through the proxy). Facebook is a login wall, not tried.
- **timnathbeerwerks.com/new-events** list and calendar views: script-loaded, no events in the text. The individual event pages read fine.
- **tmh.psdschools.org/about-us/calendarsschedule**: calendar script-loaded; read the school's public Google calendar feed that the old sources.json names for it.

## Places (17 kept, 1 gone)
- cfg-public-market-and-coffeehouse: cfgpublicmarket.com: "4138 Main Street, Unit A", SUN–THU 7am - 3pm, FRI–SAT 7am - 5pm. No change.
- costco-timnath: costco.com warehouse page: "4705 WEITZEL ST"; Gold Star & Business hours Mon-Fri 10:00 AM - 8:30 PM, Sat 9:30 AM - 7:00 PM, Sun 10:00 AM - 6:00 PM. No change.
- fossil-creek-reservoir-natural-area: fortcollins.gov: "3340 Carpenter Road, Fort Collins", "Open daily from dawn to dusk", Heron Loop 0.25, Sandpiper 0.4, Cattail Flats 0.76, "Dogs, bikes and horses are not allowed". No change. A Fort Collins natural area next to Timnath; kept as serving the town. Owner may prefer to drop it as not town-specific (the old guide had already retired Arapaho Bend).
- gque-bbq: gquebbq.com/locations/timnath/: "4931 Cima Vista Drive, Timnath", "970-823-8142", "SUN-THUR 11-9pm, FRI-SAT 11-10pm". No change.
- mein-house: themeinhouse.com: "4650 Signal Tree Dr.", "970-825-5565", "Monday - Saturday 11AM - 9PM". No change.
- old-town-main-street: timnath.org/timnath-main-street/: "a proud participant in the Colorado Main Street Program". No change.
- pedros-coffee-shop: pedroscoffeeshop.com/pages/visit: "2100 S Colorado Blvd", "Daily 7am - 3pm", "(970) 399-9424". No change.
- poudre-river-trail: larimer.gov (WebFetch): "45 miles of continuous, paved, multi-use trail", "connects northern Colorado communities diagonally from Bellvue to Greeley", bridge "spans 83 feet", celebration 13 June 2026. The "about a mile of ten-foot concrete" detail was not in what was returned. No change.
- the-hidden-stem: 410, unverifiable (above). Owner could confirm address, phone and hours on its Facebook page by hand.
- timnath-beerwerks: timnathbeerwerks.com/contactus: "4138 Main Street", "970-999-5751", Mon–Wed 12pm to 8pm, Thu–Fri 12pm to 9pm, Sat and Sun 11am to 9pm. No change.
- timnath-beverage: timnathbeverage.com: "6790 Innovate Pl", "970-795-4140", "Monday – Saturday: 9am-9pm, Sunday: 9am-7pm". No change.
- timnath-community-park: timnath.org/timnath-community-park/: "5500 Summerfields Pkwy.", "Dawn until Dusk", splash pad "daily from 8 a.m. to 8 p.m. from May 15 through Fall Festival", "Six pickleball courts, two tennis courts". No change.
- timnath-presbyterian-church: timnathpres.org/contact-us/: "4020 Main St.", "970-493-8996", "Office Hours: Tuesday-Thursday 9am-2pm"; home page: "Sunday School @ 9am | Worship @ 10am". No change.
- timnath-reservoir: timnath.org/timnath-reservoir/ (permits, fees, lease), timnath.org/parks ("Address: 5824 County Road 40", 7 a.m. to 7 p.m. hours, rules) and the 2026 Reservoir Policy PDF ("SUMMER HOURS ... 6:00 a.m. to 8:30 p.m. or dusk"). CHANGED: `phone` "(970) 231-7268" removed; no Town page read today prints it. The body still says the phone was read on 10 October.
- timnath-town-center: timnath.org/town-council/ and /agendas-minutes/: "4750 Signal Tree Drive", "970-224-3211", "The Town Council meets on the 2nd and 4th Tuesday of the month at 6:00 p.m.", "Public Comment is limited to three minutes per person", police at "5601 E Harmony Road". CHANGED: `hours` "Mon–Fri 8–5" removed; none of the pages read states office hours.
- weitzel-park: timnath.org/weitzel-park/: "4580 Weitzel St.", "Dawn until Dusk – gate-controlled", "4.5-acre park". No change.
- wild-pastures-burger: wildpasturesburger.com/contact: "5451 E Harmony Rd Timnath", "(970) 744-4137", "Timnath, CO: Daily: 11am - 8pm". No change.
- wildwing-park: timnath.org/wildwing-park/: "2221 South Larimer County Road 1", "Dawn until Dusk", "Restroom Facility (coming soon)". No change.

## Guides (4 kept)
- explore-timnath-in-driving-order: place facts as above. CHANGED the Hidden Stem sentence to "is a garden boutique on Main Street." (its address and days are no longer on its listing). The link to /places/the-hidden-stem/ now points at a 410.
- timnath-history: en.wikipedia.org/wiki/Timnath,_Colorado: Sherwood Station 1860, "Fairview", "July 6, 1920", home rule charter 2006, "6,487 at the 2020 census"; timnathpres.org/our-church/history/: 1869 school, Taylor 1883, 1933 no permanent minister; tmh.psdschools.org/about-us: "opened in the fall of 2022". Only `verified` set.
- timnath-reservoir-permits-and-eligibility: reservoir page fee lists match the table; permits page: "properly permitted residents, future Timnath residents, Colorado anglers, and their guests", "(970) 971-8850", "STAY TUNED FOR 2027 REGISTRATION DATES!"; anglers page: "Colorado resident anglers only", "Limit of one (1) permit tag"; policy PDF: 65 annual motorized permits (to 70), $300,000 liability, eFoil annual $100, carp, ice fishing, flag system, lightning at 10 miles, 200 feet, hours by season; lease "went into effect in 2016 and has a 15-year term". CHANGED: the clause "the reservoir's own number is (970) 231-7268" removed. NOT re-read: pickup at 4800 Goodman Street and the two-business-day wait; the permits pages do not carry them between seasons.
- timnath-with-kids: park, reservoir and CF&G facts as above (cfgpublicmarket.com: "Café • Soda Fountain • General Store & Gifts"). No fact changed. It links Arapaho Bend on insidefortcollins.com.
- Not carried, listed only: pages/moving-here; programs (6); updates (1); weekly (5).

## Events
- Traditions (existing records, mapping already in data/hub/fold-events.json): timnath-holiday-festival and timnath-holiday-festival-2026 to /timnath/holiday-festival/ (timnath.org/holidayfestival/ today: "Timnath Community Park on December 5th, 2026 from 11 am -1 pm"); noco-winter-wonderland-2026-11-26 to /timnath/noco-winter-wonderland/ (ticket page today: "Thu, Nov 26, 2026 at 5:15 PM to Thu, Dec 31, 2026 at 8:45 PM"). No new record.
- Extra row: /events/timnath-fall-festival-2026/ is not a file at the commit; it is in the old retired.json (410 before the fold). Added to the CSV pointing at the existing record's page /timnath/fall-festival/. Remove the row if retired addresses should stay gone.
- Kept, each read today on its own page:
  - Timnath Beerwerks event pages: Art on Tap "Friday, November 20, 2026 6:00 PM 8:00 PM"; Adoption Event "Saturday, December 5, 2026 1:00 PM 3:00 PM"; Love You Buddy "Saturday, December 5, 2026 4:00 PM 6:00 PM"; Music Bingo: TV Theme Songs "Wednesday, November 17, 2026 6:00 PM 8:00 PM"; Timnath Pub Runners "Thursday, November 19, 2026 6:00 PM 9:00 PM"; Live Music: Christine Alice "Thursday, December 3, 2026 5:30 PM 7:30 PM" (its `source` is the script-loaded calendar view; read at /new-events/2026/12/3/live-music-christine-alice). The bingo and run nights are weekly, but each date has a page of its own, so each counts as confirmed.
  - magic-on-main-street-2026-12-12: timnathfarmersmarket.org/about/: "Dec 12 • Magic on Main Street". Date only; the file already says the time is not announced. Not flagged annual in the old file, so kept as an event, no record.
  - Timnath Middle-High School public calendar feed (all STATUS:CONFIRMED): TMHS Band Concerts 2026-12-10T01:00Z–03:00Z (9 December 6–8 pm); TMHS Orchestra Concerts 2026-12-11T01:00Z–03:30Z; Orchestra Concert 2027-02-18T02:00Z; Pre-ASTA Orchestra Concert 2027-02-24T02:00Z; Pre-CBA Band Concert 2027-02-25T02:00Z; Girls' Golf Fundraiser-Fuzzys Taco 2026-11-20T00:30Z–03:00Z; Knowledge Bowl Fundraiser 2027-01-14T18:00Z–2027-01-15T05:00Z; Boys' Soccer Dine & Give (GQue BBQ Timnath) all day 18 November. The three fundraisers are at restaurants with Fort Collins addresses and two are for sports teams; kept because they are confirmed school events, not games. Owner may prefer 410.
- 410, upcoming but not confirmed:
  - Cousins Maine Lobster food truck 11-28 and 12-26: the taproom's event pages now print "12:00 PM 8:00 PM"; the files say 10 am to 6 pm, set on 1 November from the taproom calendar ("the draft had said noon to 8"). Two readings of the same organizer disagree, so the time is not settled.
  - town-council 11-24, 12-08, 12-22: the Town's pages give the rule only; no dated listing read.
- 410, the rest: 12 past events, and the three weekly-series pages (music-bingo-at-timnath-beerwerks, run-club-timnath-beerwerks, tuesday-night-poker-at-timnath-beerwerks).
