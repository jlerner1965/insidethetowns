# Migration notes: Castle Rock (insidecastlerockco.com -> insidethetowns.com/castle-rock/), read 2026-11-17

Old content read from commit 7141d032. Sources fetched with curl and the repo's own User-Agent
(`InsideTheTowns-linkcheck/1.0`); where that met a bot check, one try with the WebFetch tool. No
bot check was worked around. Decisions: `docs/migration/decisions/castle-rock.csv`.

## Places: 39 kept, 10 not carried (unreadable)

Kept, source page read by curl (200) and address, phone and hours as the file states them:
105-west-brewing, angies-restaurant, bb-cafe (/contact), castle-rock-collective,
castle-rock-library (dcl.org/castle-rock), castle-rock-museum, castlewood-canyon-state-park (CPW:
"Park: Sunrise to Sunset", 2989 South State Highway 83, Franktown), chick-fil-a-castle-rock
("Monday - Saturday 6:00 AM-10:00 PM", Sunday closed), coff33, courtyard-social, crush-wine-bar,
dawson-butte-open-space, fairgrounds-regional-park, glacier-homemade-ice-cream,
glendale-farm-open-space, granellis-pizzeria, great-divide-brewery-and-roadhouse,
guadalajara-family-restaurant ("Hours: 11am - 8 pm Everyday"), homegrown-tap-and-dough,
honnibrook-craft-meadery, mod-mountain-boutique, no-cow-bakery, outlets-at-castle-rock (general
hours Mon-Sat 10-8, Sun 11-6; holiday hours not checked into the file), parrys-pizzeria-and-taphouse,
pegasus-restaurant, provision ("WEDNESDAY - SATURDAY 4PM TO LAST CALL"), rockyard-brewing
("Open daily at 11am."), teaology-tea-cafe, the-barn-antiques-and-specialty-shops, the-emporium,
union-american-bistro, wide-awake-eatery ("OPEN EVERYDAY 7 AM - 2 PM"), wild-blue-yonder-brewing
(hours from the page's openingHoursSpecification: Sun-Thu 11:00-21:00, Fri-Sat 11:00-22:00), zabbracci.

- douglas-county-fairgrounds: douglasco.gov/county-fair-grounds/ 200; phone 720.733.6900. Footer
  prints "500 Fairgrounds Dr."; the file says Road and its body already explains why. Unchanged.
- crave-real-burgers: home page carries no address; read on the site's contact page
  https://www.craverealburgers.com/blank-3: "3982 Limelight Ave Castle Rock, CO 80109", "303-814-2829". Kept.
- the-edge-ziplines: https://theedgezip.com/plan-your-visit: "Winter hours Monday-Wednesday, 11am-4pm
  Thursday-Sunday, 10am-4pm". CHANGED `hours` from "Daily 9 am–6 pm". Also CHANGED the body: the plan
  page's table gives Ziplines "No min" age, 70-250 lbs (the zipline page: "No minimum age"); Adventure
  Tower page "Ages 4+"; Ninja Course "No min". The file had said ages 7 and up for all three.
- castle-cafe: curl 403 (bot check); WebFetch read https://castlecafe.com/: "403 Wilcox Street",
  "(303) 814-2233", Sunday 11-8, Monday to Saturday 11-9. Kept.
- sudden-fiction-books: curl 403; WebFetch read https://suddenfictionbooks.com/upcoming-events:
  "221 Perry St Ecclesia Market Castle Rock, CO 80104-2418", "(303) 856-8181". Kept.

Unreadable, 410 `unverifiable` (owner: read these in a browser to bring them back):
- alidade-brewing (alidadebrewing.com), lost-coffee (lostcoffee.com), scileppis-at-the-old-stone-church
  (scileppis.com), los-dos-potrillos-castle-rock (losdospotrillos.com/castle-rock): "Just a moment..."
  Cloudflare challenge, 403 to curl and to WebFetch, on the home page and one other path each.
- castle-rock-recreation-center, festival-park, miller-activity-complex, philip-s-miller-park,
  ridgeline-open-space, rock-park: the Town's crgov.com answers 403 "Sorry, you have been blocked"
  (Cloudflare, civicplus.io) on every path, robots.txt included. The Town has no other official page for them.

retired.json at the commit also lists six places and two events already retired (no files); listed in
the CSV as 410.

## Guides: 2 kept, 1 not carried

- castle-rock-history: KEPT, `verified` only. Read: Historical Society ?page_id=3044 (1871 line, 1874
  county seat, 1875 depot, Murrays 1970, National Register 1974, local landmark 1994), ?page_id=588
  (formed 1991, depot bought 1996), state historical-census.csv (incorporated 1881; 1880: 88; 1890: 315),
  county-muni-timeseries.csv (2024: 83497, "Vintage 2024 Prepared October 2025"), Wikipedia Castle Rock
  (Gould, 120 acres, six streets, 77 lots, April 14, 1881), castlerock.org/castle-rock-starlighting
  (star 1936, Starlighting 1962, Saturday November 21, 2026, star at about 5:30). Not re-read: the other
  four Wikipedia pages, douglasco "Other Governments", dcl.org archive lines.
- castle-rock-with-kids: KEPT. Read: dcl.org/castle-rock (hours), dcl.org/playscapes (The Ranch), The
  Edge's six pages (prices from $99/$59/$49/$29, weights, Sky Trek ages 4+), the three douglasco park
  pages, Historical Society events page (Santa Dec. 12, 10am-12pm), trolley and carriage pages, Starlighting.
  CHANGED two facts to The Edge's pages: zipline "ages 7 and up" -> no minimum age; "listed hours are 9 to 6
  daily" sentence -> the winter hours. Its October items (Slick Science, Boo Bash, Fangtastic, ticket sale
  days) are past and left as written. Storytime calendar is script-rendered and was not re-read.
- castle-rock-holiday-season-2026: 410. A dated roundup read on 31 October; three of its days are past, it
  ends on 24 December and it sends readers to the old events calendar. Its remaining dates were each
  confirmed as events below. Owner may prefer to carry it until Christmas; say so and it can be restored.

Listed only, not carried: pages/moving-here.md, updates/mayor-and-council-unofficial-results-2026.md,
weekly/2026-11-02.md, weekly/2026-11-16.md, corrections/2026-11-12-castle-rock-starlighting.md,
staging/places (3), sources.json, retired.json.

## Events: 3 traditions (existing records), 38 kept upcoming, 19 files 410

Traditions, all existing records already mapped in data/hub/fold-events.json; no record added or edited:
castle-rock-starlighting, turkey-rock-trot, tree-lighting-celebration-outlets (each with its dated former slug).

Kept (source re-read today, same date, time and place):
- Library, each on its own page go.dcl.org/event/<id>: 3D Printing 102 ("Saturday, November 21 2:00pm -
  3:30pm"), Ornament Bar Dec 8 ("This event is full / Join the waitlist"), A Visit with Santa Dec 10,
  Jingle Jam Nov 29 (full, waitlist), Local Author Showcase Mar 20, Stamped with Style Jan 25 ("Cost: $15
  per person"), Stitch by Stitch Jan 21, Battle of the Books x10 (ids 17383119 to 17383128, Tuesdays and
  Thursdays 26 Jan to 25 Feb, "4:00pm - 8:00pm", Event Hall A & B), Epic Reads x4 (17007122, 17007124,
  17655243, 17655244; 4:30pm - 5:30pm). The files' `source` for the last two series is the script-rendered
  calendar, so verifiedBy names the event page read.
- Fairgrounds (douglasco.gov): Christmas Eve Live Nativity "Thursday, December 24, 2026 5:00 PM"; St.
  Francis of Assisi Christmas Eve Service "Thursday, December 24, 2026" (no time on the page, none in the file).
- Historical Society calendar: "Santa at the Castle Rock Museum Dec. 12, 2026 10am – 12pm".
- livewelldougco.com (organizer shown: Town of Castle Rock): Starlight Market "December 4 @ 3:00 pm – 8:00
  pm" and "December 5 @ 11:00 am – 7:00 pm", Reindeer Games "December 5 @ 1:00 pm – 4:00 pm" Philip S.
  Miller Park, Storytellers and S'mores "December 12 @ 5:00 pm – 7:00 pm" Festival Park; all "Free".
- downtowncastlerock.com: trolley "Mondays & Tuesdays during the Holiday Season (11/23 - 12/29) 5:30 PM -
  7:30 PM"; carriage rides "from 11/22/2026 to 1/3/2027 ... Saturday - Sunday (5:00 - 8:00 pm)", "$59 for the
  entire carriage".
- honnibrook.com: Gamer's Choice RPG "November 21 @ 5:00 pm – 10:00 pm"; Josh Blackburn, event page JSON
  startDate 2026-12-04T18:00, endDate 21:00 (read on /events/month/2026-12/).
- Eventbrite, each page's JSON (EventScheduled, InStock): Club 21 Nov 20 19:00-21:00; Suncatcher Workshop
  Nov 22 14:00-17:00; Let It Snow Nov 20 18:00-21:00 ("514 Perry Street, #c106"); Return to Self Nov 29 18:00-19:00.
- Sudden Fiction (WebFetch): "Holiday Book Wrapping Mon, 12/7/2026 6:00pm - 8:00pm"; "Starfall: ACOTAR 7
  Release Party Mon, 1/11/2027 9:00pm - 11:00pm".

410:
- boo-bash (+ boo-bash-2026-10-24): marked annual in the file, but the Outlets' event page is
  script-rendered (curl and WebFetch both return no text). Annual, not verifiable.
- castle-rock-craft-show-extraordinaire-2026-11-07: fairgrounds page says "The 34th Annual Castle Rock
  Craft Show Extraordinaire"; castlerockseniorcenter.org still shows "33rd Annual Craft Show Extraordinaire"
  (2025). No next date, no words that it returns. Annual, not verifiable; no record added.
- fangtastic-festival, rocky-mountain-mennonite-relief-sale: past; pages re-read, no "annual" or next date.
- The other 15 are past one-time events (last day before 18 November), not re-read.
