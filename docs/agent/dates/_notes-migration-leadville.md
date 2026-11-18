# Leadville: migration to insidethetowns.com, research log (17 November 2026)

Old content read from commit `7141d032`. Decisions are in `docs/migration/decisions/leadville.csv`.
Read with `curl` under the repo's own user agent unless a line says otherwise. All reads 17 November 2026.

Totals: 30 places kept, 0 gone. 4 guides kept. 54 event files: 3 to existing tradition records
(4 old paths), 33 kept as upcoming (34 old paths), 18 gone (17 past, 1 unverifiable). No new tradition records.

## Places (all 30 kept)

Changed:

- **before-and-after**: source `order.toasttab.com/online/before-after-612-harrison-ave` answers 403 to curl and to WebFetch (not worked around). The operator's own site, beforeandafterleadville.com, read: "Hours: Harrison Ave. location Sun - Thurs 7 am - 9 pm Fri & Sat 7 am - 10 pm"; it links the ordering page whose address carries "612-harrison-ave". The phone (719-427-9519) is on no page that could be read: `phone` removed. Address rests on that link, not on printed text. Owner may want to read the Toast page by hand.
- **city-on-a-hill-coffee**: cityonahillcoffee.com: "508 Harrison Ave Leadville, CO 80461 6am - 4pm Every Day". File had Mon–Fri to 3 pm. `hours` and the body sentence corrected to daily 6 am–4 pm.
- **healy-house-museum-and-dexter-cabin**: historycolorado.org page gives curl an AWS WAF challenge (HTTP 202, empty). WebFetch read it: "912 Harrison Avenue", "719-486-0487", "Gift Shop and Exhibit hall Open: Friday - Sunday, 10:30 AM - 2:30 PM", "Tours Held: 11:30 AM and 1 PM through November 29", "Book a tour after November 30 by emailing hc_hhdc@state.co.us". File had Wed–Sun 10–4 and four tours. `hours`, `summary`, the body's hours sentence and its read date corrected.
- **turquoise-lake-recreation-area**: Forest Service page: "2026 Turquoise Lake boat ramp hours: May 1-Sept. 7: open 6 a.m. to 8 p.m., every day"; "Facilities are closed in winter due to ice and snow, but this is a popular area for ice fishing". The page gives no campground season: "campgrounds May to September" removed from `seasonal.season`. Alerts page still lists the County Road 4 closure (April 7, 2026, access by County Road 9C) and the Willow Fire closure.

Unchanged (address, phone, hours or season as the source prints them):

- cycles-of-life: colbikes.com, "309 Harrison Ave ... Thursday - Saturday 10am-6pm Sunday 10am-4pm Monday 10am-6pm Tuesday - Closed Wednesday - Closed ... (719) 486-5533".
- delaware-hotel: delawarehotel.com/faqs, "Check in from 4:00 pm, check out by 11:00 am. The front desk is staffed around the clock"; 700 Harrison Ave; (719) 486-1418.
- mineral-1886: mineral1886.com, "Coffee Cafe, 7 am to noon The Bar, 5:30 to 10 pm"; 700 Harrison Avenue; 719-427-2194.
- freight: freightleadville.com, "719.293.1053 ... 320 E 9th Street"; calendar runs into December.
- high-mountain-pies: hmpies.com, "115 W Fourth St ... Open 11AM -10PM Every Day ... 719-486-5555".
- inn-the-clouds: stayinntheclouds.com, "(719)427-4888 500 E 7th St"; its Cloudbeds booking page data: checkinTime 15:00, checkoutTime 10:00.
- national-mining-hall-of-fame-and-museum: mininghalloffame.org/museum/, "Monday Closed Tuesday-Sunday 10:00AM-4:00PM", 120 W. 9th Street, "Open year-round".
- matchless-mine: mininghalloffame.org/matchless-mine/, "Open in the summer from approximately Memorial Day to Labor Day"; "Closed for the season"; 557 County Road 3.
- huck-finn-ice-rink: lakecountyco.gov/383, "open from December to February; weather permitting", 445 Maple Street, 719-839-5476; still shows "closed for the 2025/2026 season", nothing for 2026/27.
- community-park-and-fairgrounds, ice-palace-park, mineral-belt-trail: Lake County facility and Parks and Facilities pages ("W 6th and McWethy Drive"; "Ice Palace Park (1017 Harrison)"; "12-mile paved pathway"); trailheads on leadvilletwinlakes.com/trail/mineral-belt-trail/ as the file gives them.
- leadville-national-fish-hatchery: fws.gov, "2846 Highway 300", "(719) 486-0189", "Office Hours Mon-Fri 7:00am - 3:30pm".
- leadville-railroad: leadvillerailroad.com, "326 E. 7th St.", "We run Daily trips from Memorial Day weekend through September. October- April we run weekly rides", "Holiday Express Starts November 14th!"; 866-386-3936 on its train-rides page.
- leadville-ranger-district-office: fs.usda.gov, "810 Front Street ... 8:00 a.m. - 4:30 p.m. (Closed on federal holidays) ... 719-486-0749".
- mount-elbert-trailheads, mount-massive-trailhead: Forest Service pages, directions word for word as the files give them.
- melanzana: melanzana.com/pages/contact, "716 Harrison Ave ... Open 10AM – 6PM, 7 Days ... (719) 486-3245".
- quincys-steak-and-spirits: locations page, "416 Harrison Ave ... 719-486-9765 4:00 p.m.-8:00 p.m. Sunday thru Thursday 4:00 p.m.-9:00 p.m. Friday and Saturday".
- safeway: store page, 1900 N Poplar Way, (719) 486-0795, 6:00 AM - 11:00 PM every day.
- silver-dollar-saloon: contact page, "970-470-2368 ... 315 Harrison Ave. ... Everyday: 12pm - 1am".
- ski-cooper: skicooper.com/events/, "Opening Day – Weather Permitting December 9 @ 9:00 am - 4:00 pm"; 232 CR 29; 719-486-2277.
- st-vincent-health: "Emergency Department Open 24/7 ... 816 W. 4th Street"; (719) 486-0230.
- tabor-opera-house: taboroperahouse.org, "308 Harrison Ave ... (719)486-8409".
- two-mile-brewing: twomilebrewing.com is a Square Online page with no text for a plain read (no bot check; it needs scripts). Its /home page opened in a browser: "101 Harrison Ave ... (719) 293-2766 ... Monday Closed Tuesday Closed Wednesday Closed Thursday 3:00 pm - 9:00 pm Friday 11:00 am - 9:00 pm" and the same Saturday and Sunday.
- visit-leadville-twin-lakes-visitor-center: home page, "Visitor Center Winter Hours: Open Thursday – Monday 10am to 4pm 460 Harrison Ave ... 719-486-3900"; visitor-guide-maps page, "Open daily in summer, extended weekends in winter".

## Guides (all 4 kept)

- **explore-leadville-in-walking-order**: re-read the tourism panel's About Us ("10,152′ ... 100 miles west of Denver and 128 miles northwest of Colorado Springs"), Ice Palace Park and Mineral Belt Trail pages, the mining museum (Climax exhibit "October 8th, 2026, to January 10th, 2027"; statehood gallery "opens August 1st, 2026"), Healy House, Tabor Visit ("late May to the middle of October, Friday through Sunday"), Melanzana How to Shop, Quincys, Silver Dollar, High Mountain Pies. Corrected: Healy House hours and tour times (three places, plus `glance`); best days Wednesday to Sunday became Friday to Sunday (excerpt, `glance.bestDay`, step 1); visitor centre "daily 10 am–5 pm in summer" is on no page read, replaced with the posted winter hours and "daily in summer"; the October tour and Addams Family sentences removed as past. Not re-read: leadville-co.gov (403 bot check) for the COtrip link; Quincys' filet and prime rib nights (its menu page is 404; the home page says only "steak and prime rib").
- **leadville-history**: taboroperahouse.org/history: "built the opera house in 1879 in just 100 days", "enclosed skywalk to the Clarendon Hotel. The hotel, now gone", "In 1893, Judge A.S. Weston bought the Tabor Opera House". Unchanged.
- **leadville-with-kids**: mining museum, railroad and hatchery pages as above; Willow Fire closure "October 1st, 2026 ... through December 31, 2026 ... unless rescinded". Unchanged.
- **leadville-out-of-season**: its listed sources re-read; none was blocked. Dated facts moved from 10 October to 18 November (intro, `supersededNote`, Matchless, rink). Corrected: FREIGHT (no "year-round venue" wording on its page now; calendar shows Boxcar Bar evenings, cribbage on November 19, the Motherlode market December 11–13); railroad (Oktoberfest past; "Holiday Express Starts November 14th", "Winter Express Starting January 14th"); Tabor (October shows past; calendar lists only "Toddies at the Tabor" on December 3); visitor centre winter hours now posted; Healy House hours; Cycles of Life ("fat bikes" is on no page read, removed; "classic, skate ski packages ... $45 a day" stands); the ranger office's October 12 closure note removed. Lake County's groomed-trails page still carries only the 2025/26 notice.

## Events

To existing tradition records (not edited):
- parade-of-lights (and old slug leadville-main-street-parade-of-lights-2026-12-04): listing "December 4 @ 6:00 pm Free ... the annual Leadville Main Street Parade of Lights".
- leadville-ski-joring-2027-03-06: listing "March 6, 2027 - March 7, 2027 ... 79th year".
- ski-cooper-opening-day-2026-12-09: "Opening Day – Weather Permitting December 9 @ 9:00 am - 4:00 pm".

Kept, each confirmed on its source with the same date, time and place:
- leadvilletwinlakes.com event pages: Champions (Nov 20, 9 pm), cribbage (Nov 19, 6–8:30 pm; the listing's text still says "November 11th", its date field and FREIGHT's own calendar say the 19th), karaoke (Nov 21), Shop Small Saturday (Nov 28, 12–4), Steam and Stitches (Dec 6, 10–4:30, $85), Taste of Leadville (Dec 4, 4:30–7:30, $45), bingo Nov 26, Dec 3 and Dec 10, the three Winter Mountain Bike Series dates (Jan 23, Feb 6, Mar 6, 2027), and the Delaware Hotel trivia pages for Nov 19, Nov 26 and Dec 3 (7 pm).
- skicooper.com: Warren Miller (Nov 20, 7–9:30 pm, "Each ticket is $33.00"), Santa (Dec 24, 11:30–12:30), 10th Mountain Day (Feb 26, 2027), St. Patrick's Day (Mar 17, 2027).
- c4leadville.org: Climate & Coffee, "Thursday, November 19, 2026 8:00 AM 9:00 AM ... Rescheduled".
- freightleadville.com: Motherlode Holiday Market, "December 11–13, 2026 Friday: 3–8 PM Saturday & Sunday: 12–5 PM".
- taboroperahouse.org/events/calendar: "THU, DEC 3 5:00 PM Toddies at the Tabor". Title corrected from "Toddies for the Tabor". The ticket page (getcuebox) shows only its title to a plain read, so the 7 pm end stands on the 1 November read.
- Lake County Public Library (12 files): the tockify detail pages show only a title to a plain read; the calendar's own feed (`tockify.com/api/ngevent?calname=lcplcalevents`, what the page loads) gives each event as "scheduled" with the file's start, end and place. Craft Anarchy is listed for January 1, 2027, New Year's Day, as the feed has it.
- Winter Band/Choir Concert: the events-calendar page is an embedded Google Calendar; its public feed gives December 8, 7–9 pm, Lake County High School, status confirmed.

Gone:
- 17 past events (see the CSV), including the Holiday Express season start of 14 November and the City Council listing whose last date was 4 November.
- thursday-night-family-bingo-at-the-elks-lodge-2026-11-19: its address now redirects (301) to the 9 April occurrence; the calendar's neighbours show "Turkey Bingo at Elks Lodge" that night.

Annual events without a record, left as dated listings and not made traditions: Taste of Leadville (the listing calls it "an annual stroll", but the organizer's own page, stgeorgeleadville.org/home, says nothing of it), 10th Mountain Day and St. Patrick's Day at Ski Cooper, Shop Small Saturday, the Motherlode Holiday Market, the Winter Mountain Bike Series.

## Listed only, not carried

`pages/moving-here.md`, `updates/independence-pass-closed-for-winter-2026.md`, `weekly/2026-10-19.md`, `2026-10-26.md`, `2026-11-02.md`, `2026-11-16.md`, ten staged places under `staging/places/`, `sources.json`. No `programs/`.

## Could not be read

- order.toasttab.com (Before & After): 403.
- www.leadville-co.gov: 403 bot check ("Just a moment...").
- historycolorado.org: bot check to curl; read with WebFetch.
- taboroperahouse.app.getcuebox.com ticket page: scripts only.
