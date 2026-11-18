# Migration notes: Grand Lake (insidegrandlake.com), read 2026-11-17

Old content from commit f5e52d14. All pages read with curl under the repo's own user agent (scripts/lib/probe.ts). Decisions are in docs/migration/decisions/grand-lake.csv. No published file was deleted before that commit (earlier deletions were staging files and one image, which had no public address); no event carried `annual` or `formerSlugs`.

## Could not be read (not worked around)
- https://www.townofgrandlake.com/ (every page tried: calendar, the three park pages, home): 403 with a bot check. Hits Gene Stover Lakefront Park, Point Park, Town Square Park, the Ghosts & Gourds event and five sources of the walking-order article.
- https://bobscottsauthenticindianjewelry.com/: "Error 403 Forbidden".
- https://sagebrushbbq.com/ and www.: 403, "Just a moment..." challenge.
- https://www.nps.gov/romo/planyourvisit/list_hiking_trails.htm: 404, page gone.

## Places kept
- Adams Falls: old source 404. The park's hiking page (https://www.nps.gov/romo/planyourvisit/hiking.htm) builds its trail list from nps.gov/customfields/trail_selector/getTrails.cfm (read): "East Inlet Trailhead to Adams Falls ... the hike to the viewing area for Adams Falls is 0.3 miles one-way"; "East Inlet Trail ... past Adams Falls to Lone Pine Lake, Lake Verna, Spirit Lake". Directions on /lower-east-inlet.htm unchanged. Timed entry page: "9 a.m. to 2 p.m. daily beginning on Friday, May 22 through Monday, October 12, 2026", East Inlet named. Changed: `source` and `url` to the hiking page; removed the 8,400 ft, 79 ft and lake mileages, which no page now gives (summary and one body sentence). The Town's East Inlet page (restrooms) was not re-read (403); the NPS data says "a vault toilet ... near the East Inlet Trailhead".
- Arapaho NRA: fs.usda.gov page read. "$5/ 1-Day Pass; $10/ 3-Day Pass; $15/ 7-Day Pass", "$30/ Annual Pass", "Day-use is from sun-up to sun-down"; "Stillwater Ramp is closed"; "Sunset Auxiliary Ramp | Sept. 8- Nov. 29 ... 6 a.m. - 6 p.m."; "Green Ridge Ramp | Sept. 8, 2026 - Oct. 31, 2026". Changed: `access.closures` re-dated to 18 November, Green Ridge put in the past tense.
- Cottage Court: grandlakehistory.org/museums/cottage-camp/: "open Monday – Saturday (Closed Sunday) from 11 am to 5 pm from Memorial Day thru August ... Saturdays thru September", 725 Lake Avenue, 970-627-8324. No change.
- Gateway Inn: home page footer "120 Lake Ave. ... 970-627-2400"; gatewayinn.com/contact/: "Front Desk is open: 8:00 AM – 8:00 PM". No change.
- Grand Lake Lodge: "15500 US-34", "(970) 627-3967"; winter lodging offered; restaurant page: tavern "closed for the season ... back in May 2027". No change (the file already says the tavern was closed in October).
- Grand Lake Visitor Center: gograndlake.com page now reads "Winter Hours / Open 7 Days a Week / 10 AM - 3 PM"; address and phone as filed. Changed: `hours`, summary and one body sentence; the `seasonal` block (summer hours) removed, since the page no longer gives them.
- Juniper Library: gcld.org page: 316 Garfield, 970-627-8353, Wed 10-7, Thu 10-6, Fri-Sun 10-4. No change.
- Kauffman House: "Monday – Saturday (closed Sunday) from Memorial Day through August 11:00 am to 5:00 pm, Weekends in September", 407 Pitkin Street. No change.
- Kawuneeche Visitor Center: nps.gov/romo/romo_linked_data.json: opens 09:00, closes 17:00 every day, "closed on Thanksgiving Day and Christmas Day", 16018 US Highway 34, 9705861206. No change.
- Miyauchi's: /hours: May & September and June-August tables as filed; "Tel: 970-627-9319". No change.
- Mountain Market: home page now headed "winter hours / Sunday - Thursday | 9 am - 7 pm / Friday & Saturday | 9 am - 8 pm"; 400 Grand Avenue, 970.627.3470. Changed: `hours`, summary, one body sentence.
- Never Summer: contact page "919 Grand Ave.", "970.627.3642", "Open 362 days per year from 10:00am - close | We close for: Easter, Thanksgiving, and Christmas"; home page "Open from 10:00am to 5:00pm or 6:00pm daily". No change.
- Rapids Lodge: FAQ now: "Open Thursday – Saturday / Happy Hour: 3:00 PM – 5:00 PM / Dinner: 5:00 PM – 8:00 PM"; home page "Telephone: (970) 627-3707 / 210 Rapids Lane"; dining page lists Happy Hour, Evening Dining, Winter Prix Fixe & Family Style Supper. Changed: `hours` (was Tue-Sun lunch and dinner), `openingHours` added, `lunch` tag dropped, summary and two body sentences.
- Rocky Mountain Folk School: "Main Building Address: 315 Pitkin Dr". No change.
- Rocky Mountain Repertory Theatre: box office page: winter, summer and fall hours as filed; 800 Grand Ave., (970) 627-3421. No change.
- The Hub: "830 Grand Ave", "970-627-5095", "OPEN Daily 7:00 am - 3:00 pm / Kitchen closes @ 2:30 pm", "Open Year Around". No change.

## Places not carried (410)
- Gene Stover Lakefront Park, Point Park, Town Square Park: Town site 403. The chamber's parks page (gograndlake.com/things-to-do/parks-playgrounds/) describes all three but gives no address, phone, parking or rules, so the files could not be checked. An owner read of the three Town pages in a browser would settle them.
- Bob Scott's, Sagebrush BBQ: own sites blocked, as above.

## Guides
- grand-lake-history: kept. Kauffman page: built 1892, "only remaining log hotel built in Grand Lake prior to the 1900's", Ezra's death 1920, sold 1946, society purchase 1973. Listed Cottage Court URL (/museums/cottage-court-museum/) redirects to a near-empty page; changed to /museums/cottage-camp/, which carries the motor-court text. Its last paragraph links the walking-order guide, which is not carried.
- grand-lake-with-kids: kept. Library page (316 Garfield), branch calendar (Storytime, Afterschool Club, Book Club listed), NPS conditions page read. Body links Point Park, Town Square Park and the walking-order guide, none of which is carried.
- explore-grand-lake-in-walking-order: 410. Five Town sources unreadable, trail list 404, and its stops include Bob Scott's, Sagebrush and the three Town parks (not carried) and Rapids Lodge (hours changed).

## Events
- Rocky Mountain Rep, https://www.rockymountainrep.com/show-tickets/current-season/: "Saturday, December 5th at 7:00pm" (Yuletide); "Saturday, December 12th, at 7:30pm and Sunday, December 13th, at 2:00pm" (Home for the Holidays); "December 31st, at 9:00pm" (NYE). The theatre's ticketing pages (rockymountainrepertory.csstix.com) give the year and prices: Yuletide 12/05/2026, $40/$30/$20; Holidays 12/12 and 12/13/2026, $50/$40/$28, "$6.00 service fee"; New Year's Eve "Thursday, December 31, 2026 @ 9:00pm", $55/$45/$33, "$6.00 service fee". All three kept unchanged. The page does not call any of them annual, so no tradition record.
- Brown Bag Book Club: https://gcld.librarycalendar.com/event/brown-bag-book-club-11196: "Thursday, December 10, 2026 12:00pm–1:30pm", Fireplace Area, The Borrowed Life of Frederick Fife. Kept as the December meeting: start, end, url and source moved to that occurrence and the 12 November date removed.
- Ghosts & Gourds Gathering (24 October): past; the Town calendar is 403, so whether it returns could not be read. 410.
- The other eleven are past library and theatre dates: 410, no read needed.
