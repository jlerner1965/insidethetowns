# Evergreen: migration research log, 17 November 2026

Old domain insideevergreenco.com; old content read from commit `a030ab9b`. Every page below was read with
`curl` under the repo's own user agent (`scripts/lib/probe.ts`) on 17 November 2026 and answered 200, unless
it says otherwise. Decisions are in `docs/migration/decisions/evergreen.csv`.

Not carried, listed only: `pages/moving-here.md`, `weekly/2026-10-19.md`, `weekly/2026-10-26.md`,
`weekly/2026-11-02.md`, `README.md`, `sources.json`, and 18 files under `staging/` (never published, no URL).

## Places (26 kept, 1 gone)

- **Alderfer/Three Sisters Park, East Trailhead, West Trailhead** — jeffco.us/980: "31537 Buffalo Park Road",
  "30357 Buffalo Park Road", "The West Trailhead is now OPEN", shelters as the files say. The park page prints
  no hours; they are on jeffco.us/1583/Regulations, C.21.a: "from one (1) hour after sunset to one (1) hour
  before sunrise". Phone 303-271-5925 is in the page footer. No change.
- **Elk Meadow Park, Stagecoach Trailhead** — jeffco.us/1218: both trailhead addresses, "reopening on Saturday,
  October 25, 2025", "no longer offers an off-leash dog area". Hours from the Regulations page as above. No change.
- **Hiwan Heritage Park & Museum** — jeffco.us/1251: "28473 Meadow Drive", "720-497-7650", "Thursday through
  Sunday: Noon to 4:30 p.m.", "Closed: Monday through Wednesday". No change.
- **Beau Jo's Evergreen** — beaujos.com/locations/evergreen: "28186 CO-74", "(303) 670-2744", "11 AM - 8 PM
  Sunday - Thursday / 11 AM - 9 PM Friday & Saturday", happy hour Mon-Thu 3-6. The page also carries a
  commented-out footer block with older hours (9:30 PM / 10 PM); the visible hours match the file. No change.
- **Buchanan Park Recreation Center** — district page: "32003 Ellingwood Trail", "720-880-1100", "5:30 AM to
  8 PM (Monday through Thursday) 5:30 AM to 7 PM (Friday) 7 AM to 4 PM (Saturday & Sunday)". No change.
- **Buchanan Park** — district page: "41.25 acres", "Stocked trout ponds (2) - Permits available at Buchanan
  Recreation Center". Disc golf is on evergreenrecreation.com/disc-golf ("Disc Golf Course at Buchanan Park"). No change.
- **Wulf Recreation Center** — district page: "5300 S Olive Road", "720-880-1200", hours and pool hours as the
  file says; Wulf Park page for the courts and skate park. No change.
- **Kittredge Park** — district page: "Welch Avenue at Highway 74", "1.5 acres", park hours "one hour before
  sunrise to one hour after sunset". No change.
- **Evergreen Lake, Evergreen Lake Trail** — Lake House page: "29612 Upper Bear Creek Road", "720-880-1300",
  "Park/Trail open sunrise to sunset", "Summer boating will resume in 2027", trail "1.3 miles"; lake page:
  hotline 720-880-1391, group permit, "$25 photography permit fee". No change.
- **Evergreen Library** — jeffcolibrary.org/locations/ev: "5000 County Road 73", "(303) 235-5275", Mon-Thu
  9-8, Fri-Sat 9-5, Sun 12-5; "built in 1989 ... reopened to the public in 2024". No change.
- **Center for the Arts Evergreen** — evergreenarts.org footer: "31880 Rocky Village Drive", "(303)674-0056",
  "Sunday & Monday - Closed", Tue-Fri 9 to 5, Sat 10 to 4; auxiliary-galleries page for the two rooms. No change.
- **Evergreen Clothing & Mercantile** — own site: "28025 HWY 74", "(303) 679-9200", Sun-Fri 10-5, Sat 10-6,
  second Saturday to 7. No change.
- **Java Groove Cafe** — own site: "28186 CO-74 Ste #1", "303-674-4494", "Every Day: 7:00am - 5:00pm". No change.
- **Lariat Lodge Brewing** — own site: "27618 Fireweed Drive", "303-674-1842", "Open daily from: 11am - 9pm". No change.
- **Mountain Home** — own site: "27965 Meadow Dr.", "303-674-3345", "Open Daily: 10:00AM to 5:00PM". No change.
- **Muddy Buck Coffee House** — own site: "28065 Highway 74 Suite 101", "(303) 670-0433", "Monday - Friday |
  7am - 5pm, Saturday & Sunday | 8am - 5pm". No change.
- **Revival Brews** — own site: "27845 Highway 74", "(303) 670-3224", "Fall and winter Hours: Wednesday through
  Friday 3p-9p, Saturday 12pm-9pm, Sunday 12p-8pm". Body corrected: bingo is "FREE BINGO AT 4PM & 6PM" (was "at 6 pm").
- **Shadow Mountain Gallery** — own site: "Open Daily 10am-5pm", "28186 Hwy 74 Suite 2", "303.670.3488". No change.
- **Sundance Gardens** — own site: "27866 Meadow Dr", "(303) 670-8211", "Monday-Saturday 10-5 Sunday 10-4". No change.
- **The Colorado Creamery** — own site: "27905 Meadow Dr.", "(303) 835-2578", Mon-Fri 3-8:30, Sat-Sun 12-8:30.
  A stale banner about 2-3 October is still up. No change.
- **The Holly Berry** — own site: "28165 HWY 74", "(303) 674-4821", Mon-Fri 9-5, Sat 9-4, Sun closed. Banner:
  closed from Wednesday 11/25/2026 at noon, reopening "Monday 12/30/2026" (the shop's own typo, presumably
  11/30; not put in the file). No change.
- **Wildflower Cafe** — own site: "28035 Colorado 74", "(303)-674-3323", "Open Daily 7:30am-2:00pm", first-Friday
  pop-up at 5 and 7. No change.
- **Suz Cookie Jar Rescue Bakery & Bites — 410, unverifiable.** scjrbakery.com (and www.) now returns a
  one-line page that redirects to `/lander`, a domain-parking page. A web search turned up no other site of
  its own (only directory listings, one giving a Marshdale address). Not read: its social pages (login walls).

## Guides (4 kept)

- **evergreen-history** — re-read: jeffco.us/1251 (Camp Neosho 1893, Jock Spence, Gross Medical College,
  Buchanan 1938-39, 15,000 acres, $61,000 bull, 1974, 1975); evergreenchamber.org/history (1859, 1875 post
  office, Clarke 350 acres 1878, Humphrey's Model T "Mary Ann", 1928, Alderfer 1977/2002, Noble Meadow 408
  acres 1993, Little Bear / St. Mark's); emahs.org pages (1973, Medlen School 1886, chapel 1918, 25-room lodge);
  Denver Mountain Parks (1912 Genesee, Fillius 1914, Bergen Park shelter 1917, Dedisse 1919, "already
  established as a popular summer retreat"); ovationwest.org (1924, 1989, 2021); fire district (1948, nearly
  26,000, 120 square miles); district pages (1956, 1969, 1991, 23,000); Wikipedia (2,321; 9,307; 17 July 1876;
  420 acres, $25,000). All there. Changed: the last sentence's pointer to "Moving to Evergreen" (/moving-here/,
  not carried) removed.
- **evergreen-lake-through-the-seasons** — re-read the district's boat-rentals, bring-your-own-boat,
  seasonal-lake-rules, public-ice-skating, winter-programs, fishing, evergreen-lake-trail, lake-house and
  stagecoach-park pages: rental rates $25/$40/$50, day pass $10/$15, season pass $100 "expires October 1,
  2026", 15 ft vs 17 ft, shuttle 10am-5pm from 3229 El Pinal Dr, skating $15/$20, rink $150, passes $200/$120,
  skates 8T to 16, ice-fishing kit $75, "CURRENTLY CLOSED FOR THE SEASON", "Summer boating will resume in
  2027", ice page "Updated: 11/16/2026" still says the season is announced "ONCE WE HAVE AN OPENING DAY".
  Changed: the clause on 2025-26 (every holiday date closed, 15th tournament canceled) removed; the ice page
  now shows the 2026/27 table (all "TBD") and no longer says it.
- **explore-evergreen-in-driving-order** — every stop re-read as a place above. Changed: the Suz Cookie Jar
  Rescue sentence and its two mentions (glance.bestDay, step 2) removed, since the place could not be verified
  and is not carried; the Hiwan Halloween (24 October 2026) sentence removed, passed.
- **evergreen-with-kids** — re-read district-information (25%, $375 opt-in), facility-admission-fees ($7/$10,
  $8/$12, $13/$17, $5/$7), rec-center pages (orientation $10/$13, pool closes 30 min before), playschool,
  fishing ($16/$20, 10 permits a day), improvements page (all-wheels park, splash pad), park pages, library
  branch, Family Place and roof pages, county park pages, arts-center pages. Changed: "read on" date to 18
  November; Level 1 swim lessons now "6 yrs - 12 yrs" at both pools (was 5 to 12 at Wulf); the family-nights
  sentence replaced with what the page lists now (Kid's Night Out, Dec 4 2026 and Jan 8 2027, "Dinner
  Included"); roof work "expected to continue into November" (was October); the 2025-26 poor-winter sentence
  removed (no longer on the district's pages); October full-moon hike put in the past tense; Hiwan Halloween
  sentence removed; MakeSpace's "next on October 21" replaced with a pointer to the events page (it lists 18
  Nov, 5-7 pm, free); the "Through the year" section removed (its events have passed or have their own pages,
  and it linked to /events/?category=family and /submit-event/). The playschool's closed dates still read as
  on the page (Oct 12-13, Nov 23-25, Dec 21-Jan 5); the page now also lists Tuesday-evening and Saturday sessions,
  not added.
- All four keep links to `/places/...`, `/articles/...` and `/contact/` as written.

## Events

Kept (7), each read on its source today:
- **Evergreen Chamber Orchestra holiday concert** — evergreenchamberorch.org event page: "December 19th, 2026 @
  3:00 pm", "6pm Performance", "$25 – $50", "Evergreen Lutheran Church, 5980 County Hwy 73". No change.
- **Evergreen Speaks, 19 Nov** — evergreennewcomers.com/evergreen-speaks: "Nov 19, 2026; 7:00-8:00 PM — Drs.
  Benjamin E. Sax & David M. Krueger", "Evergreen Christian Church, 27772 Iris Dr.", "free and open to the
  public". No change. It is tomorrow.
- **Sculpture walk, 5 Dec** — evergreenarts.org/cae/sculpture-tours: "December 5 — Center for the Arts
  Evergreen (meet at CAE)", "10:30 am - 11:30 am", "FREE". No change.
- **Santa Breakfasts, 6 and 19 Dec** — evergreenchamber.org/santa-breakfast: "Sunday, December 6 | Hiwan Barn,
  1552 Bergen Pkwy", 8:00 and 10:00 seatings; "Saturday, December 19 | The Wild Game, 1204 Bergen Pkwy", 8:30
  and 10:30; "$28 per person (adults and children 1+)". No change. The three dates removed from the old guide
  on 27 October (28 Nov, 5 Dec, 12 Dec) are still not on the page: 410.
- **A Christmas Carol** — box office (app.arts-people.com, show 361862) lists three shows: "Fri, Dec 18th, 2026
  at 7:30 pm", "Sat, Dec 19th, 2026 at 2:00 pm", "Sun, Dec 20th, 2026 at 2:00 pm"; prices as filed. The
  Saturday 7:30 pm show filed on 9 October is not listed. Changed: that performance removed, body says three.
  The box office does not say why (pulled or sold out); worth a look by hand.
- **Second Saturday, 12 Dec** — downtownevergreen.com/events/second-saturdays: "December 12th - Holiday
  Shopping"; the page gives no hours. Chamber listing (members.evergreenchamber.org, event 108388): "4:00 PM -
  7:00 PM MST", "FREE!". No change.

To a tradition page (7):
- Existing records, not edited: **Holiday Walk** (downtownevergreen.com: "Friday, December 4th, 2026 | 5-9pm",
  "34rd Annual Holiday Walk"), **Frostival** (district: 11:00 AM - 3:00 PM, Santa 12-2, "EPRD's Annual Holiday
  event"), **Pond Hockey Championship** (district: "January 30 and 31, 2027", "15th Annual").
- New record **evergreen-winterfest** — evergreenarts.org/winterfest: "Center for the Arts Evergreen's annual
  Winterfest", "SATURDAY, DECEMBER 5TH FROM 10 AM TO 4 PM", "FREE community event", "FREE Photos with Santa
  (11 – 1)". 5 December 2026 is a Saturday.
- New record **evergreen-new-years-day-lake-plunge** — a4aevergreen.org/lake-plunge: "Date: January 1, 2027
  (Registration open Nov 25, 2026)", "Evergreen Lake", "10AM - 12:00PM"; the home page says its emcee "has
  been part of the Lake Plunge since the start and serves as emcee each year". The page does not use the word
  "annual". The old listing said registration opened November 10; the page now says November 25.
- New record **evergreen-witches-and-warlocks-on-the-water** — district page: "We'll see you for the next
  coven gathering in 2027!", "Saturday, October 10th, 2026, 10:00am-1:00pm", "Evergreen Lake". 2027 not announced.
- New record **evergreen-trick-or-treat-trail** — district page: "The annual Treat-or-Treat Trail is back!",
  "When: Friday, October 30, 4 - 8 PM", "Buchanan Park Ball Fields" (no year printed; the page's address is
  2026-10-30 and 30 October 2026 is a Friday). The page calls it annual but does not say in so many words that
  it returns in 2027; 2027 is not-announced. A judgment call, flagged for the owner.

Annual-looking, not given a record (410):
- **Downtown Evergreen Halloween Walk** — downtownevergreen.com/events/halloween-walk: "October 31st, Trick or
  Treating | 4-6pm"; a standing page in the organizer's Events menu, but no year, no "annual", no word of a
  return. A candidate if the owner reads it as continuing.
- **Mountain of Thanks** — mountainofthanks.com: "November 14, 1-4 pm"; "The Gratitude Tree. Coming in 2027!
  Next year you will be able to add a leaf"; no date, not called annual.
- **Alternative Gift Fair** — gifttwice.org: "the 2026 Alternative Gift Fair, Saturday, November 14th (9 am - 4
  pm), Sunday, November 15th (9 am - 3pm)"; nothing on next year.
- **Mountain Home holiday open house** — mountainhome.net: "FREE Annual Holiday Open House from Nov. 13th -
  15th"; a shop's sale weekend, no next date.
- **Hiwan Halloween**, **Native American Heritage Month Celebration** — county calendar pages (EID 16764,
  16939): 2026 dates only.
- **EAPL Zombie Run 5K** — only the Chamber's listing read; no organizer page saying it returns.
- **Nightmare at 1520** — humanitix ticket page: nothing on a return.
- **Free live music Saturdays at Revival Brews** — weekly series; the pub's page gives "FREE LIVE MUSIC 5:30 PM
  TO 7:30 PM" on Saturdays and no dated occurrence.

Everything else is a past one-time event and was not read.

## Unreadable or not read

- scjrbakery.com: domain-parking page (see Suz Cookie Jar Rescue).
- No bot checks or login walls met on any other source.
