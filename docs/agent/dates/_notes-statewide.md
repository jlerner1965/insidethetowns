# Notes: statewide and multi-town outdoor records

Checked 2026-11-12. "curl" = `curl -L -A "Mozilla/5.0"`, text read from the saved page.

## Verified

**colorado-big-game-draw-application**
- https://cpw.state.co.us/activities/hunting/big-game/primary-draw (WebFetch + curl)
- "Colorado big-game hunters, this year, the application period opens on March 1, 2026, and closes on April 7 at 8 p.m. Mountain Time."
- 7 April 2026 is a Tuesday. No 2027 dates on the page, or on https://cpw.state.co.us/hunting/big-game.
- Odd: the same page's "Payment Deadlines" block is stale (all 2024 dates). Not used.
- A search result said CPW regulations set the deadline as "the first Tuesday in April". I did not open the regulation and did not use it.

**colorado-free-fishing-weekend**
- https://cpw.state.co.us/event/fishing/2026/06/experience-world-class-fishing-colorado-free-june-6-7 (WebFetch + curl)
- "On June 6-7, 2026, anyone can fish for free, and the fishing license and Habitat Stamp requirements are waived". Event block: "Saturday, Jun 6, 2026" to "Sunday, Jun 7, 2026" (weekdays check).
- No 2027 page. The "first full weekend of June" rule was seen only in a search result (CPW regulations), not read, so no typicalWindow.
- https://cpw.state.co.us/activities/fishing/fishing-licenses-and-dates does not mention the weekend.

**colorado-day-state-parks-free**
- https://cpw.state.co.us/event/events-and-festivals/2026/08/celebrate-colorado-day-visiting-state-parks-free (WebFetch + curl)
- "Colorado Parks and Wildlife (CPW) is offering free entry to all Colorado state parks on Monday, August 3, 2026." (a Monday.)
- typicalWindow for 2027 from the same page: "state parks celebrate the occasion with free entrance on the first Monday of August."
- "All other park fees remain in effect, including camping reservations, boat and off-highway vehicle registrations, and hunting and fishing licenses."
- No 2027 date published.

**nps-fee-free-*** (8 records: presidents-day, memorial-day, flag-day, independence-day, nps-birthday, constitution-day, theodore-roosevelt-birthday, veterans-day)
- https://www.nps.gov/planyourvisit/fee-free-parks.htm (WebFetch + curl), "Last updated: October 9, 2026"
- Heading "2026 Free Entrance Days in the National Parks"; list: "February 16: Presidents Day (Washington's Birthday)", "May 25: Memorial Day", "June 14: Flag Day/President Trump's birthday", "July 3–5: Independence Day weekend", "August 25: 110th Birthday of the National Park Service", "September 17: Constitution Day", "October 27: Theodore Roosevelt's birthday", "November 11: Veterans Day".
- The page gives no weekdays, so nothing to cross-check.
- No 2027 list published. All eight 2026 days are now past (Veterans Day was yesterday), so every record is 2027 not-announced + 2026 confirmed.
- "Beginning in 2026, free entrance on these days will be for US citizens and residents only. Nonresidents will pay the regular entrance fee and any applicable nonresident fees." Also "other fees, including timed entry or reservation fees, may apply". Both are in the `cost` field.
- Odd: the 2026 list is not the list of earlier years (no MLK Day, no National Public Lands Day, etc.), and "110th Birthday" is a one-year name. The 2027 list may have different days; some of these eight records may never get a 2027 date.
- Town lines, sources:
  - https://www.nps.gov/romo/planyourvisit/fees.htm (curl): "A valid entrance fee or park pass is always required to enter Rocky Mountain National Park"; the page repeats the 2026 free entrance days list.
  - https://www.nps.gov/romo/planyourvisit/directions.htm (curl): "The park has two gateway communities: the town of Estes Park on the east and the town of Grand Lake on the west."
  - https://www.nps.gov/colm/planyourvisit/fees.htm (curl): "$25 for a private vehicle"; repeats the 2026 free entrance days list.
  - https://www.nps.gov/colm/planyourvisit/directions.htm (curl): "Follow signs through Grand Junction to the east entrance on Monument Road."; "Turn south on Highway 340 to the west entrance, which is approximately three miles from Fruita."
  - Nederland: nps.gov names it only as a town on the Peak to Peak route from Denver to Estes Park, not as a gateway. Its line says only that the park charges a fee and takes part.

**geminid-meteor-shower-peak**
- https://www.amsmeteors.org/calendar/ (WebFetch + curl; the old /meteor-showers/meteor-shower-calendar/ URL says "This page has moved")
- "PEAK NIGHT Dec 13–14 / Geminids / Active through December 4–17, 2026"; "The Moon will be 15% illuminated · Waxing crescent on peak night (Dec 13–14, 2026)."
- Still ahead, so 2026 is the first entry. The page lists only upcoming showers, so no 2025 entry.

**perseid-meteor-shower-peak**
- Same AMS page: "PEAK NIGHT Aug 12–13 / Perseids / Active through July 17 – August 24, 2027"; "The Moon will be 79% illuminated · Waxing gibbous on peak night (Aug 12–13, 2027)."
- No 2026 entry on the page (already past), so none recorded.

**colorado-fishing-license-year**
- https://cpw.state.co.us/activities/fishing/fishing-licenses-and-dates (WebFetch + curl)
- "Annual fishing licenses are valid March 1 through March 31 (13 months). Annual licenses go on sale March 1 each year."; "Annual Fishing Licenses Valid March 1 2026 - March 31 2027 (13 Months)".
- EDITOR CHECK: the 2026 entry (1 March 2026 to 31 March 2027) is printed on the page. The 2027 entry (date 2027-03-01, no endDate) rests on "go on sale March 1 each year"; the page does not print "2027" as a sale date. It is a fixed calendar date, not a computed one, so I recorded it as confirmed. Change it to not-announced if that is too loose.

**i70-traction-law-season**
- https://www.codot.gov/travel/winter-driving/tractionlaw (WebFetch + curl)
- "Morrison to Dotsero on I-70 between Sept. 1 and May 31, or if conditions require, these laws could be enforced with fines."
- EDITOR CHECK: CDOT gives the month and day with no year. I wrote the current season as 2026-09-01 to 2027-05-31. The year is mine, not CDOT's.
- The page does not name the towns in the record; they were supplied in the task. Glenwood Springs lies between Morrison and Dotsero on I-70, but the CDOT page does not say so.
- CDOT can also apply traction and chain laws "on any state highway" during storms.

## Unverified

**colorado-fall-colour-peak** (in unverified/)
- https://www.colorado.com/articles/ways-explore-colorados-fall-colors (WebFetch read it; curl got 403)
- "The month of September is the ideal time to witness Colorado fall color, but you have to time it right" (article "Ways to Explore Colorado's Fall Colors", "Published August 2025").
- Why unverified: this is an "ideal time", not a stated peak window; the site refused curl, so I could not read the raw page myself, only through WebFetch's summary; and a sister article (https://www.colorado.com/articles/10-places-see-colorados-fall-color) says "this September and October".
- US Forest Service, https://www.fs.usda.gov/visit/fall-colors (curl): gives no statewide window. Only White River National Forest: aspens "turn brilliant gold in late September."

## Could not verify
- A plain, official statewide peak window for fall colour.
- 2027 dates for the big game draw, Free Fishing Weekend, Colorado Day free entry and the NPS fee-free days: none published yet.

## Looked for and did not find
- 2027 big game dates on cpw.state.co.us (primary draw page and big game page).
- A 2027 NPS free entrance days list.
- https://www.colorado.com/activities/fall-season (404).
- A year on CDOT's traction law page.
- Skipped as instructed: Keep Colorado Wild pass, turkey and elk season dates.
