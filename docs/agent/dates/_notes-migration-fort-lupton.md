# Migration notes: Fort Lupton (insidefortlupton.com), read 2026-11-17

Old content from commit 5ce23d48 (folded 12 October 2026). All pages read with curl under the repo's own user agent. Decisions are in docs/migration/decisions/fort-lupton.csv; they cover insidefortlupton.com paths only. No published file was deleted before that commit (earlier deletions were staging files); no event carried `annual` or `formerSlugs`.

## Could not be read (not worked around)
- https://www.acehardware.com/store-details/14333: 403 bot check. Ace Hardware of Fort Lupton: 410 unverifiable.
- https://business.fortluptonchamber.org/events/Details/2026-trick-or-treat-street-1895337: 403, "Just a moment...".
- https://highplains.libcal.com/event/17575934 (Family Health Plate, 30 November): HTTP 400, "Event not found." Read twice.

## Places kept, no change (words on the page)
- A Natural Way, /contact/: "333 Denver Ave", "(303) 857-4481", "Tuesday–Friday · 9am–6pm / Saturday · 9am–1pm".
- City parks, fortluptonco.gov/Facilities/Facility/Details/<n>: Cannery (Fifth Street and Fulton Avenue, 0.4 acres), Community Center Park (203 South Harrison Avenue), Dog Park (12285 Hwy 52), Heritage (Northrup Ave and Hickory St), Lancaster (13 acres), Railroad (4th Street and Pacific Avenue): each "Public Park that is open Sunrise to Sunset", "Free", 303-857-4200 where filed. Lancaster's page reset the connection once and was read on the second try.
- Pearson Park: facility page gives location, features and "13 acres", no hours; /1017/Parks: "Parks are open from dawn to dusk."
- Coyote Creek, /contact: "222 Clubhouse Drive", "(303) 857-6152", "Summer Hours: Open Daily | 5:45am - 8:30pm / Winter Hours: Open Daily | 9:00am - 4:00pm".
- City Museum, /157/Museum: "453 First Street", "303-857-1634", "Wednesday - Friday 10:00 am - 3:00 pm", "Admission: FREE".
- Library, /1080/Hours-and-Location: "Monday–Thursday: 9 am–8 pm / Friday & Saturday: 9 am–5 pm / Sunday: Closed", 370 S. Rollie Ave., 303–339–4089.
- Historic Denver Avenue, /424/Historic-Preservation: "Along Denver Avenue, which serves as the City's historic main street, there are many excellent examples of early 20th century commercial buildings"; board "meets on the first Thursday of the month".
- House of Smoke, /contact/: "825 Denver Ave", "(303) 857-2750", "Mon - Fri: 8am - 3pm / Saturday & Sunday Closed".
- Lucky Shot: "327 Denver Ave.", "(303) 857-0333", hours as filed.
- Raw Roots: "337 Denver Ave", "(720) 823-3331", Tue-Thu 9-6, Fri 9-2, Sat 9-1, Sun-Mon closed.
- Salt & Acres, /pages/contact: Thu 4-8, Fri 12-9, Sat 10-9, Sun 10-3; "9490 County Road 25", "(303) 970-0699".
- Santiago's, /Fort-Lupton: "150 1st St", "303-857-4797", "Mon-Sat 6am-8pm, Closed Sundays".
- South Platte Valley Historic Park, spvhs.org (reset once, read on the second try): "open for Public Visitation the first and third weekend of each month, May to October 2026 ... 10 AM to 4 PM"; "2001 Historic Park Way"; visitor center "will be operational this fall".
- Wholly Stromboli, /contact-us/: "410 Denver Ave.", "303-857-2252", hours as filed.

## Changed in restored files
- fort-lupton-public-and-school-library (place) and fort-lupton-history (guide): the `image`, `imageAlt` and `imageCredit` lines were removed because the image files are no longer in content/fort-lupton/images/ (they are in content/carbon-valley/images/: fort-lupton-public-and-school-library.jpg, ottesen-grain-mill.jpg). Images were outside this task. Removed lines, to put back once the files are copied:
  - library: `image: ../images/fort-lupton-public-and-school-library.jpg`, alt "The tan-brick Fort Lupton Public and School Library with its name lettered on the wall, the bronze Heartland Story statue beside the entrance and patches of snow on the forecourt", credit "Erie Bard, Wikimedia Commons, CC BY-SA 4.0".
  - history: `image: ../images/ottesen-grain-mill.jpg`, alt "The 1920 Ottesen Grain Co. feed mill in Fort Lupton in October 2021, a corrugated-metal mill with a tile silo and a headhouse", credit "Suzanne Powell, Wikimedia Commons, CC BY-SA 4.0".
- explore-fort-lupton-in-walking-order: dropped "It does not have a listing on this guide yet", since the historic park has a listing.

## Guides
- explore-fort-lupton-in-walking-order: kept. Read: Historic Preservation, Historic Designation register (eleven entries; "ODD FELLOWS LODGE 300-306 DENVER AVE.", "SEYMORE and BIRDIE RHODE HOUSE 149 DENVER AVE.", St. John Building), Museum, spvhs.org, and each stop's own page (above). Its fort paragraph gives 2026 dates that have passed (17-18 October, Pumpkinfest 10 October); left as dated facts.
- fort-lupton-history: kept. Read: Crossroads in Eden PDF (DocumentCenter/View/398, pdftotext): "September 15, 1836", "June 13, 1860", "May 23, 1882", "the father of modern Fort Lupton", "50,000 pounds of milk per day", "dedicated on March 2, 1940"; spvhs luptons-fort.html ("In 1836 ... a former Lieutenant in the U.S. Dragoons", "1836-1844", "began in 2003", "dedicated in 2011"); background.html ("$30 donation ... September 10, 1987", "3.4 acres", "25,000 volunteer hours and $220,000", 1981 demolition); Museum page (1929, 1993, 1996). The other sources were not re-read.
- fort-lupton-with-kids: 410. The article says "Times and prices are for fall 2026" and is built on dated items: swim sessions from 27 October, classes on 17 and 24 October, the October calendar, "times are not yet out" for Winterfest (they are now), Koshio Park "late fall". Not a re-check; it would need rewriting.

## Events
- La Posada + Lotería, https://highplains.libcal.com/event/17279975: "Tuesday, December 8, 2026 / 5:30pm - 7:30pm ... Fort Lupton Public & School Library - Public Branch". Kept unchanged.
- Family Health Plate (30 November): source says "Event not found." 410 unverifiable.
- Pumpkinfest & Hayrides: /846/Pumpkinfest-The-Fort: "Saturday, October 10, 2026", "We can't wait to see you all again next year!"; /172/Special-Events still says "October 9-10 - Pumpkinfest & Hayrides". The two City pages still disagree, the reason its record sits in docs/agent/dates/unverified/fort-lupton-pumpkinfest.md. 410 for now; if the owner publishes that record, this path should go to /fort-lupton/pumpkinfest/.
- Día de los Muertos (two files, both the 2 November viewing night), /1157/Dia-de-los-Muertos: "Special Viewing Night: November 2, 5:30–7:30 pm"; "This will be our 5th year hosting community ofrendas at the library". Annual by that sentence, but no 2027 date and no word that it returns, so no record was added. 410.
- Trick-or-Treat Street: Chamber page 403. 410.
- Winterfest (existing record fort-lupton-winterfest) had only a staging file on the old guide, so no old address.
- The other eight are past one-time library, recreation and concert dates: 410, no read needed.
