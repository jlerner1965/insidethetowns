# Migration notes: Golden (insidegolden.com), read 17 November 2026

Old content from commit `7141d032`. Every page below was read with curl under the repo's
own user agent (scripts/lib/probe.ts) unless it says otherwise. Decisions are in
`docs/migration/decisions/golden.csv`.

## Trick or Treat Street (existing record, not edited)

- https://www.cityofgolden.gov/calendar.php?view=day&month=10&year=2026&day=30&calendar=&id=722 : the page
  loads its events by script, so the HTML carries none. Read instead from the calendar's own data file, the
  one the page loads (`/_assets_/plugins/revizeCalendar/calendar_data_handler.php?webspace=goldenco…`, found
  by the sources probe of 1 November). Entry id 722: title "Trick or Treat Street", start 2026-10-30 15:00,
  end 17:00, location "Washington Avenue, 10th to 13th St"; text: "Come in costume and celebrate one of
  Golden's favorite fall traditions! … Washington Avenue will be closed to traffic between 11th Street and
  14th Street".
- Record checks: date 30 October 2026 (a Friday), "3 p.m.", organizer City of Golden and the `continues`
  words all match. One thing to look at: the record's `place` is "Washington Avenue, 11th Street to 14th
  Street", which is the road closure; the City's location field for the event is "Washington Avenue, 10th to
  13th St". Not edited.
- The same file has the earlier years: 31 October 2024 (id 249) and 31 October 2025 (id 520, "Halloween
  Happenings & Trick or Treat Street on Washington Avenue"), both 3 to 5 pm. No 2027 entry yet.
- Old addresses `/events/trick-or-treat-street/` and `/events/trick-or-treat-street-2026-10-30/` both go to
  `/golden/trick-or-treat-street/` (already in data/hub/fold-events.json).

## Other existing records the old event pages go to (read, not edited)

- Great Turkey Chase: shop.runnersroost.com/content/the-great-turkey-chase: "The 13th Annual Great Turkey
  Chase is November 26th, 2026", "November 26, 2026 at 8:30am", Parfet Park. Matches.
- Candlelight Walk: Visit Golden page: "December 4th, 2026", "The walk begins at 6:30 p.m.". Matches.
- Holiday Parade: "Saturday, December 12, 2026 … begins at 10:30 a.m.". Matches.
- Jingle on the Avenue: its own page: "Saturday, December 19, 2026, 11:00 AM – 1:00 PM". Matches (the record
  carries the date only).
- UllrGrass: Eventbrite listing: 29 to 31 January 2027, Parfet Park. Matches.
- Harvest Haunt Express: past (17 to 18 October 2026); record not re-read.

## New tradition records

- `golden-polar-express`: coloradorailroadmuseum.org/polar-express/: "returns to the Colorado Railroad Museum
  in November and December 2026 for another season"; "Opening Night is Friday, November 6, and the final
  performances take place on Wednesday, December 23" (both weekdays right for 2026); "the Main Show begins
  promptly at 5 p.m., 6:30 p.m., or 8 p.m."; "$80/person ages 2-15, $100/person ages 16 and older".
- `golden-holiday-art-market`: foothillsartcenter.org/exhibits/51st-holiday-art-market/: "51st Holiday Art
  Market", "November 20 – December 29", "Closed on Thanksgiving and Christmas Day", "Admission is free …
  Astor House, 1133 Arapahoe St."; the home page: "reopen November 20 for the Member Preview". The old event
  file gave the public opening as 21 November; the page prints no separate public opening day, so the record
  carries 20 November with the Member Preview as its part.
- `golden-chili-cook-off`: goldenbeerchilicookoff.org: "Saturday, October 17, 2026", "1pm - 4pm", "Parfet
  Park: Washington Avenue and 10th Street, Golden"; "This beloved Golden tradition is now under the management
  of the Golden Welcome Center … We're proud to carry on this fun-filled event". No 2027 date. The old file's
  "17th" is not on the page, so no edition.
- `golden-nightmare-on-greek-street`: fraternitysorority.mines.edu/nightmare-on-greek-street-nogs/:
  "Nightmare on Greek Street is our annual event … The event takes place the Thursday before Halloween every
  year from 5-8 PM." The page prints no dated year, so the record has 2027 as not announced with that
  sentence as its typical window, and no 2026 entry (the date rests on a rule, not a printed date).

## Places (56 read, 56 kept)

All 56 sources answered 200 and none says it is closing. Address (street number and street) and phone were
found on each source page; hours compared line by line.

- Changed: **Buffalo Rose** (buffalorosegolden.com/contact-us/): "Saturday: 10am-12midnight", "Sun:
  10am-10pm", "Sat & Sun Brunch 10am-2pm". The file had 9 am for both days and for brunch; hours field and the
  brunch sentence corrected to 10 am.
- Changed: **Golden Hour Pilates** (goldenhourpilatesco.com/faqs, text is in the page's script data): "710
  Golden Ridge Rd, Golden, CO 80401", "720 248 7586"; FAQ: "710 Golden Ridge Road, Golden CO 80439 - In the
  Golden Ridge Shopping Center (between the pizza place and dry cleaners)". "Suite 114" is not on the site,
  so the address is now the footer's; "up to three classes a day, seven days a week" is not on the site (the
  schedule is on Walla), so the `hours` field was removed. The summary and body still say it: owner to
  decide. Prices ($59, $180, $130, $150) match.
- **Foothills Art Center**: home page: "Our Astor House location is temporarily closed as we prepare for our
  51st Holiday Art Market. We'll reopen November 20 for the Member Preview". File already says so
  (status temporarily-closed); kept as is. Its status fields will want clearing after 20 November.
- Jeffco open-space parks (Apex, Centennial Cone, Clear Creek Canyon, Clear Creek Trail, Mount Galbraith,
  North and South Table Mountain, White Ranch, Windy Saddle, Lookout Mountain preserve): park pages read;
  hours on jeffco.us/1583/Regulations ("one (1) hour after sunset to one (1) hour before sunrise"). Apex
  water-tank closure and odd/even dates as filed. Centennial Cone: "hunting access … will begin December 1,
  closing the park to all other uses through January 31", as filed. Clear Creek Trail: the Gateway
  Trailhead's address is on the Clear Creek Canyon Park page, not the trail page.
- City parks (Lions, Parfet, Vanover, Tony Grampsas, Ulysses, Whitewater Park): park pages read; hours on the
  City's Park Rules page ("5 a.m. to 11 p.m."; creek corridor "1 hour before dawn - 1 hour after dusk").
- Colorado Railroad Museum: visit page "9 a.m. to 5 p.m., Tuesday-Sunday (closed Mondays)"; the footer still
  says "Open Daily". Filed as the visit page gives it.

## Guides (6 read, 6 kept)

- thanksgiving-to-new-years-closures-and-trash-days: trash page (five holidays, "delayed one day", 5280 Waste
  Solutions 303-277-8727); City calendar data (delays 27 to 28 November, 26 December, 2 January; no fourth
  Tuesday council meeting on 22 December); library closures (11, 26, 27 November; 24, 25 December);
  Community Center holiday hours; School's Out camp dates and prices; history museum break program; Holiday
  Art Market hours; museum closed days. All as written. Not re-read: the budget hearing on 8 December. The
  article is dated: its last date is 2 January 2027.
- explore-golden-in-walking-order: parkgoldenco.com/paid-parking ("first two hours are free, and each
  additional hour is $2.50 up to a maximum of $10 per day"); every place it names re-read as a place above.
- mesa-hike-or-canyon-walk: North Table Mountain page (15-plus miles, Peery Parkway), Clear Creek Trail page
  (1.75-mile Gateway Segment, "170 parking spaces", 10 feet, "65+ mile"), Alerts & Closures (Rim Rock
  "closed from February 1 through July 31"), Park Rules. The map PDFs were not re-read.
- apex-white-ranch-and-lookout-mountain: Apex, White Ranch, Windy Saddle, Lookout Mountain and Buffalo Bill
  park pages re-read; map PDFs and Denver's pages not re-read.
- golden-with-kids: Community Center hours and holiday hours, child watch hours, library hours, railroad
  museum hours and Polar Express dates and prices, Discovery Park, holiday dates. Not found on the pages
  read: the "130-foot" slide length.
- golden-history: Mines history page (Golden City 1859, trustees 1874) and the museum pages; the Wikipedia
  and archive sources were not re-read.

## Events (139 files, 147 old addresses, plus 8 retired)

Kept, each on its own page's date, time and place (structured data or page text): Buffalo Rose (15),
Golden Mill (5), New Terrain (7), Foothills Art Center (2), Golden History Park blacksmithing (2; the event
pages, not the listing page), Eventbrite listings (4), Visit Golden (pancake breakfast), Jeffco calendar
(Yoga With a Ranger), Mines calendar (3 basketball games; times are UTC in the page data), jeffcomineralshow.com,
mountaintoadbrewing.com/events, jeffsymphony.org, goldenconcertchoir.org.

- Library events (4): jeffcolibrary.bibliocommons.com event pages load by script. Read from the library's
  Golden events RSS (gateway.bibliocommons.com/v2/libraries/jeffcolibrary/rss/events?locations=GN, with
  startDate for December): Watercolor Landscapes 18 Nov 6 pm, Ratatouille 24 Nov 2 pm, Buying & Selling
  Online 2 Dec 1 pm, Beyond Garage Sales 3 Dec 1 pm, none cancelled.
- City events: City calendar data. Cookies with Councilors 5 Dec 10 to 11 am, Community Center, Bear Creek
  Room. Council 15 Dec 6:30 to 8 pm is its own entry. Council 24 Nov is the fourth-Tuesday rule (5 to 8 pm,
  exceptions 24 March, 23 June, 22 December). Council 8 Dec: the calendar's second-Tuesday rule gives 4:30 to
  8:30 pm, the file 5 pm from the meetings page, which could not be re-read: 410.
- Golden Concert Choir: "December 12, SATURDAY, 4:00 - 5:00 PM, COMMON FLAME UUC, 14350 W. 32ND AVE"; the
  tickets page names Adult, Senior and Student tickets but no prices, so `cost` was removed.
- Miners Alley shows (3): the theater's pages give no dates in their HTML. Visit Golden's series pages now
  list It's a Wonderful Life and Who's Holiday to 27 December and The Story of the Nutcracker to 26 December
  (including 25 December), against 20 and 19 December in the files: 410, unverifiable.
- Miners Saloon (7) and Goosetown Station (8) dated listings came from Google Calendar feeds, which are not
  read (robots); miners-saloon.com says only "6:00 – 9:00pm every Wednesday" and Goosetown's calendar page
  carries no events in its HTML: 410, unverifiable.
- Two weekly series files (Miners Saloon Wednesdays, Chrispy at Mountain Toad): 410, not carried.
- Balkan European, 28 December: a food truck's day on New Terrain's calendar: 410.
- Looked annual, no record added: Golden Cemetery Tour, Monster Mash, Mines Museum Spooktacular (each page
  gives the 2026 date and no word that it returns); Jefferson County Home Show (Nationwide Expos; the site
  now shows 16 to 18 April 2027 and 1 to 3 October 2027: a twice-yearly trade expo).
- Still annual by the organizer's words but kept as dated events, not records: Thanksgiving at the Golden
  Mill ("3rd Annual"), Mountain Toad Holiday Market ("8th Annual"), WhiskeyFest 2026.
- The 8 addresses in the old `retired.json` (library storytimes, one yoga date) had no file at the last
  commit: listed as 410.

## Not carried (listed only)

pages/moving-here.md; 26 programs; 6 updates; 4 weekly files (2026-10-19, 10-26, 11-02, 11-16); 30
corrections; staging.

## Unreadable or not read

- cityofgolden.gov/government/public_meetings.php: meeting times load by script.
- minersalley.com show pages: dates load by script.
- goosetownstation.com calendar and the Golden Today / Goosetown Google Calendar feeds: not read.
