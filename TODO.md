# To do

The one list. Who does each thing is in the last column: the owner (calls,
photographs, meetings, merges, money) or the assistant (code, drafts,
reports, checks). The 90-day test is paused as of 12 November 2026 and its
rules are removed (`HOW-IT-WORKS.md`, section 2); rows dated to 20 January
stand until the owner revisits them.
Remove a row when it is done; the dated audits in `docs/audits/` say what
was found and when.

Last revised: 11 November 2026.

## This week

| Town | What | Why | Who |
|---|---|---|---|
| Hub | January 2027: property-tax dates for the counties the pages cover, as `tax-date` records, each from its county treasurer's own page | The type exists (12 November 2026); the treasurers post the year's due dates in January | Assistant, owner approves |
| Hub | Late January 2027: wildlife and trail closures (raptor nesting, elk calving, winter range) as `closure` records, from each land manager's own page | The type exists; most closures are posted for 1 February or 15 March | Assistant, owner approves |
| Hub | Late February 2027: Easter egg hunts as `egg-hunt` records; Easter is 28 March 2027 | The type exists; organizers post in February and March | Assistant, owner approves |
| Hub | April 2027: farmers-market season dates as `farmers-market` records (eleven weekly markets wait in `docs/agent/dates/held/`) | The type exists; markets announce their season in April | Assistant, owner approves |
| Hub | Spring 2027: graduation, the last day and the first day of school as `school-date` records, from each district's calendar | The type exists; the 2027-28 calendars are adopted in spring | Assistant, owner approves |
| Hub | June 2027: open the fireworks page (`CURRENT_SEASONS.fireworks` in `src/lib/traditions.ts`, summer 2027) from the seven existing `fireworks` records, once their 2027 dates are read | The records exist; the page builds the day a season is set | Assistant, owner approves |
| Hub | When CHSAA's site can be read by a person or the GitHub runner: the 2026-27 state championship dates and sites into `src/config/postseason.ts`. chsaanow.com's robots.txt names this assistant's readers under `Disallow: /`, so it was not read on 12 November | The owner asked for them; a source that refuses automated reads is not worked around | Owner |
| All | Each morning's re-check pull request now opens with "Waiting for a person, dated in the next 14 days": decide those before merging (`npm run review -- --town=<town>`), events first. 19 events on 1 November, among them Lyons's Christian Promise festival (7 Nov), Evergreen's two Thursday music series (from 5 Nov), Leadville's 10th Mountain Day (6 Nov), Longmont's La Traviata and the Warriors of Peace recording (14 Nov) | A staged event is deleted unlisted once its date passes; a flag left past its date shows the old fact on the day (`DECISIONS.md`, "Where events still slipped through") | Owner |
| All | An issue labelled `automation-failure` means a job's run was lost: read it, re-run the job from the Actions tab, close the issue once it passes | The ingest, re-check, editor and Thursday drafts open one when they fail | Owner |
| Castle Rock | Confirm Honnibrook's events feed (`npm run sources -- confirm castle-rock honnibrook-com`), after adding `excludeTitles` for its poker, trivia and role-playing nights if they are not wanted | Proposed 1 November; a dry run finds the two listed Josh Blackburn nights and the three regulars | Owner |
| Windsor | Decide whether Tockify's subscription feed may be read: set `robots: subscribe` on `tockify-com` (Mighty River Brewing), then confirm it (Manitou Springs' Armadillo Ranch feed went with the guide, retired 3 November 2026) | Tockify's robots.txt keeps automated clients out of `/api/`, where the feeds are; until then Mighty River's nights are read only by hand | Owner |
| Berthoud, Golden | Confirm the two feeds the 1 November probe found: `npm run sources -- confirm berthoud berthoudhistoricalsociety-org` (its four events already listed); Foothills Art Center (`golden foothillsartcenter-org`) after `excludeTitles` for its classes (35 of 37 items) | `docs/sources-probe-2026-11-01.md`, table 1, has the other 22 and what each would bring | Owner |
| All | The probe's two decisions: which of the 34 robots-blocked subscription feeds may be read (`robots: subscribe`; Niwot's Wheel House and Lyons's Rock Garden and Creative Grounds are among them, on Squarespace), and retiring the four lapsed sources (`npm run sources -- retire loveland visitlovelandco-org`, and the same for savellis.com, nederlandchamber.org and periodicbrewing.com under their ids) | Section 3a and table 2 of the probe report | Owner |
| Berthoud | Call B-Rad's Arcade and Trailhead Cafe: still open, hours | Dropped by their only source on 26 October; hours hide in 60 days | Owner |
| Berthoud | Call Kofe House, (970) 344-5391: confirm the seven-day hours and the Thursday 5–8 pm dinner | The listing's hours are wrong against its own page | Owner |
| Berthoud | Photographs: City Star front, Town Hall, the Bike Park, Fickel Park, the Reservoir Loop, then Kofe House, Berthoud Brewing, Grandpa's, Cornerstone, Rise | The three home tiles and the eat-and-drink page have no photograph of a business; the shot list and sources are in the 27 October session notes and `docs/PHOTO-PRIORITIES.md` | Owner (hire or shoot) |
| Berthoud, Carbon Valley, Erie, Niwot (and Lafayette's hub page) | When each county certifies the 3 November count (Boulder's canvass board meets 24 November; Larimer says no later than 25 November; Weld by late November), put the certified figures in each election update and drop "unofficial": Berthoud 3G, Carbon Valley's Frederick 2D and 2E, Erie 3E and 3F, Niwot 300 to 306 (the update, the election article and the line on the hub's Moving page), and Lafayette's 2A note in `src/config/towns/lafayette.ts` | Each gives the counties' final unofficial counts of 13 November (Berthoud 4,548 against, 3,100 for). Castle Rock's, Elizabeth's and Longmont's updates went with the 12 November restructure | Assistant |
| All | Buy the hero photographs in `docs/HERO-PHOTOS.md` (Berthoud's, Loveland's and Lyons's are in, 28 October: paste their order numbers into `PERMISSIONS.md`; Erie's, 30 October, is in with its licence record; Clear Creek's, Leadville's, Manitou Springs's, Fort Collins's, Golden's and Estes Park's, 30 October, are in with theirs; Clear Creek and Manitou Springs retired on 3 November): iStock (Longmont, then the upgrades), Adobe Stock (the upgrades), Shutterstock packs if wanted; about $190. Send the files and receipts to the assistant | The paintings are gone; Longmont's hero is a lake rather than the town | Owner buys, assistant installs |
| Johnstown, Timnath | Shoot the hero: Parish Avenue north from 1st Street; Old Town Main Street north toward the church | Nothing exists to buy for either (`docs/HERO-PHOTOS.md`) | Owner |
| Lyons | Open lyonsfire.org in a browser; it answered 503 to the crawler from Moving here and Living here | Fix-now item, 27 October audit | Owner |
| Lyons | 2 November: delete `content/lyons/staging/events/lyons-veterinary-clinic-open-house-2026-11-01.md` unless the owner confirmed it | The clinic is open Monday to Friday, so no call could reach it before the Sunday open house; the file says to delete it after 1 November if no call is made. It was never on the site | Assistant |
| Lyons | Confirm The Rock Garden as a source (`npm run sources -- confirm lyons rockgardenlyons-com`) before spring | Nothing waits on it now: its season's last show was 24 October | Owner |
| Niwot | Call Belle Terre Floral, (303) 652-0419, and The Nook: hours | On no page of their own since 12 October | Owner |
| Niwot | For /services/, two staged places (`npm run review -- --town=niwot`): Niwot Barber Shop: call 303-652-9088 to confirm the Courier's 2021 hours (Tue, Wed, Fri, Sat 11–4); it has no page of its own. Niwot Dental: open niwotdental.com in your own browser, or call (303) 652-3500, for the suite and hours at 6800 N 79th St (it refuses this machine, even in a browser). The post office, 150 Murray St in the gap report: USPS's locator sends this machine to its outage page, so read it yourself | /services/ went up on 9 November with three listings: Niles Family Dentistry, Blessings Day Spa and Niwot Veterinary Clinic | Owner |
| Niwot | After March 15, 2027: Niwot Veterinary Clinic moves to its Rock Creek hospital in Broomfield. Once its site says it has gone, mark the listing `status: closed` with the note | The clinic's own page gives "up until March 15th" and no year | Assistant |
| Niwot | Wednesday 18 November, once the editor's pull request is open: add to the Niwot notes for the week of 23 November a `new-hours` change, RTD's BOLT on its Sunday/holiday schedule on Thanksgiving, Thursday 26 November, sourced to the BOLT schedule (schedule-pdfs.rtd-denver.com, BOLT, 27 September 2026 to 2 January 2027) | The owner said yes on 9 November (Niwot gap report, finding 6). The editor publishes a week's notes only where no file for that week exists yet, so the line cannot go in earlier without losing the week's draft; a reminder is set for the 18th | Assistant |
| Erie, Berthoud | The goal, 11 November: top search results and 1,000 visitors a week each (`DECISIONS.md`, same date). Berthoud's base is about 32 search clicks a week; Erie's is unread | The owner's word | Owner decides, assistant works |
| Erie, Berthoud | Visitors a week has no source the assistant can read: the Vercel connection sees a team with no projects, and Plausible is not connected. Connect the Vercel account that holds `insideerie` and `insideberthoud`, or read the two weekly figures off the dashboard | The goal is counted in visitors, and Search Console counts only Google clicks | Owner |
| Berthoud | Ask the Chamber (970-532-4200) for Berthoud Day's parade time and venue, and Berthoud Recreation (970-532-1600) for the 3 July fireworks' hours; tell the assistant | The two pages have a day and no times; outside listings disagree on the venue | Owner |
| Erie | Name the Erie restaurants the guide should have (it lists eight); the assistant reads each one's own site and files it. Fox Crumb Bakery (foxcrumb.com) and Miner's Tavern, 524 Briggs, could not be read by machine: hours and phone by a call or a browser | "erie restaurants" sits at position 10 and the eat-and-drink page at 28 | Owner names, assistant files |
| Erie, Berthoud | Thursday 12 November: post the two drafts in `docs/relationships/drafts/2026-11-12-weekend-posts-erie-berthoud.md` | The first of the weekly posts | Owner |
| Erie, Berthoud | Thursdays: post /this-weekend/ in the town's Facebook groups and on Nextdoor with the campaign tags in `docs/SEARCH-VISIBILITY.md`, "Distribution" | Search alone does not reach 1,000 a week on today's footprint | Owner |
| All three | Fill the 90-day scorecard for the week of 9 November (`docs/90-DAY-TEST.md`) on Tuesday 17 November, and the search columns of the weeks of 26 October and 2 November once Search Console can be read | The scheduled session does it every Tuesday at 11:17; Search Console settles a Sunday about two days later | Assistant (scheduled) |
| Golden | 20 November: Foothills Art Center's galleries reopen for the Holiday Art Market; once its home page says so, take `status: temporarily-closed` (and `closed`, `statusNote`, `statusSource`) off `content/golden/places/foothills-art-center.md` | Marked closed on 28 October; nothing reopens a listing on its own | Assistant |
| Castle Rock | Live and quiet from 31 October: add insidecastlerockco.com as a site in Plausible; resubmit its Search Console sitemap as `/sitemap-index.xml` (it was submitted as `/site.xml`); switch on Web Analytics in the `insidecastlerockco` Vercel project if it is off | The guide counts readers only once these are on (`DECISIONS.md`, "Castle Rock live, quiet") | Owner |
| Golden | Calls for the held queue (`npm run review -- --town=golden`): store hours from Sherpa House (303-278-7939), Table Mountain Grill (303-216-8040), YoColorado (303-278-2796) and Peak Cycles (303-216-1616); current closing times from Golden City Brewery ((303) 279-8092); a public phone for the Golden Mill and the Coors tour; the choir's date (GoldenConcertChoir@gmail.com); and from the 28 October additions, which hours are current at Cafe 13 ((303) 278-2225), Golden Goods ((303) 216-2123) and Trailhead Taphouse (720-638-9009), and a phone and hours for Stay Golden Mercantile | Each listing's own site gives everything else; the 28 October re-read is in each file's review note | Owner |

## Event calls, 2 to 20 November

From a 21-day re-check run on 31 October (`npm run recheck -- --days=21`,
report only): every event in the three towns dated 1 to 21 November that
no machine could confirm. One call settles a venue's whole list; the
`npm run confirm` line records it, and a different time, day or price is
edited into the file first. The nightly re-check's pull request adds new
calls as the feeds roll forward; read it on 9 and 16 November. Calls in the
other guides (57 on 31 October) wait with the rest until 20 January.

| By | Town | Call | Ask | Then |
|---|---|---|---|---|
| Mon 2 Nov | Lyons | MainStage Brewing, (303) 823-2331 | Tuesday trivia: 6:30 or 7 pm? (its page now shows 6:30 near 3 November; the guide says 7.) The First Friday art opening, 6 November, 6–8 pm? (on the Recorder's calendar only) | `npm run confirm -- lyons trivia-mainstage-brewing art-opening-at-mainstage-brewing --how=phone --with="MainStage Brewing Company"` |
| Mon 2 Nov | Lyons | Planet Bluegrass, (303) 823-0848, or the Eventim ticket page in a browser | Country Music: Explored, Wednesday 4 November: doors 6, show 7? (its page shows the day, not the time) | `npm run confirm -- lyons country-music-explored-wildflower --how=phone --with="Planet Bluegrass"` |
| Mon 2 Nov | Lyons | Oskar Blues Grill & Brew (no number on the guide; its site has one) | Sunday Serenade, Sundays 5–7 pm, no cover, through 20 December? The old-time jam, second and fourth Wednesdays at 6 (next 11 November)? And the listing's open ask: still open, and which closing times are current | `npm run confirm -- lyons sunday-serenade-oskar-blues old-time-jam-at-oskar-blues --how=phone --with="Oskar Blues Grill & Brew"`, and tell the assistant the hours |
| Mon 2 Nov | Lyons | Email pdmf.cpfchurch@gmail.com (its site has been down since 21 October) | The hours and the address of the fall festival, Saturday 7 November | Add them to `content/lyons/staging/events/christian-promise-fellowship-festival-2026-11-07.md`, then `npm run confirm -- lyons christian-promise --how=email --with="Christian Promise Fellowship"` |
| Mon 2 Nov | Berthoud | The library, (970) 532-2757 | Its six weekly series as listed through December: Musical Moments and Writers Group (Mondays), Bouncing Baby Storytime and Digital Navigator (Tuesdays), Perky Pre-K (Wednesdays), Terrific Toddler (Fridays)? And a calendar feed we may read, or a monthly check by phone (its site rate-limits the nightly check) | `npm run confirm -- berthoud musical-moments-library writers-group-library bouncing-baby-storytime digital-navigator-drop-in-library perky-pre-k-storytime terrific-toddler-storytime --how=phone --with="Berthoud Community Library"` |
| Mon 2 Nov | Berthoud | Wildfire Arts Center, (970) 532-5497 | U-Create Open Studio, Saturdays 10–noon, $5, none on 28 November; Brush & Banter, Mondays 6–8 pm, $5, through 21 December: both still running? | `npm run confirm -- berthoud u-create-open-studio-at-wildfire-arts-center brush-and-banter-class-and-open-studio --how=phone --with="Wildfire Arts Center"` |
| Mon 9 Nov | Berthoud | City Star Brewing, (970) 532-7827 | Cribbage night, second and fourth Wednesdays, 6–8:30 pm, free (next 11 and 25 November)? Its page shows 11 November at later times; last confirmed 18 September | `npm run confirm -- berthoud cribbage-night --how=phone --with="City Star Brewing"` |
| Mon 9 Nov | Niwot | Rebuilding Seminars, Bob Manthy, 720-600-2763 | The introductory evening, Thursday 12 November, 6:30–8 pm: where in Niwot, and is it free? | Add venue and cost to the staged file, then `npm run confirm -- niwot rebuilding-evening-workshop --how=phone --with="Rebuilding Seminars"` |
| Mon 9 Nov | Lyons | The library, (303) 823-5165 | The blood drive, Wednesday 18 November, donations 3–6 pm: still on? (its calendar no longer lists it; last confirmed 18 September.) And when the toddler and preschool storytime starts again (it stopped 21 October with no next date) | `npm run confirm -- lyons blood-drive --how=phone --with="Lyons Regional Library"`; the storytime dates to the assistant to re-list |

No call needed (read 31 October): the Holiday Card Art Contest's own pages
say artwork is due Saturday 14 November, not 7 November, in person at 228
Mountain Ave; corrected that day, with an entry on Berthoud's corrections
log, and "free to enter" came off, since no page of the Society's says it.
The Lyons library board's page lists 17 November at 6 pm; the Lyons
trustees' meetings and Election Day rest on the Town's and the county's
pages; the Lyons Veterinary Clinic open house is above. Already done: the
Niwot Rotary breakfasts (5 to 19 November) and the Lyons baby storytime (17
and 24 November) were re-listed and confirmed by the nightly re-check.
The Niwot line dancing (5 November) was published on 31 October from Niwot
Hall's own page, without a price: the page gives none and the Zeffy page
refuses automated reads (Niwot Hall's `/events/lindy-b-dance/` page is the
2022 Tuesday series, expired).

## Decisions due

| By | Decision | Who |
|---|---|---|
| Now | Curiosity drafts, the calls that hold four articles (`npm run curiosity` lists each): Town of Lyons (LaVern M. Johnson Park's tent season and whether the fee table is 2027's); Boulder Ranger District (drinking water at Olive Ridge; who owns the Caribou ruins and whether a visitor may walk to them); Larimer County (Carter Lake: cabins, 'Sky Harbor', the $10 permit for 2027, then put the two corrected lines back in the Berthoud guide's Carter Lake article); Chaffee County Road and Bridge (County Road 390 to Vicksburg and Winfield: surface, passenger cars, winter maintenance). Also: Boyd Lake's fee on cpwshop.com, and the two map readings flagged on the Nederland draft | Owner |
| Early December | Sundance from the towns next door: no flag is open; read it as a page (`CURIOSITY_DRAFTS=1 TOWN=hub npm run dev`) and set `status: verified` | Owner |
| Late November | Camping near Lyons: read the Park Service's Summer 2027 table for Longs Peak Campground and fill its season | Assistant, owner approves |
| Before it is verified | Camping near Carbon Valley: read St. Vrain State Park's page again and take out the 'Closed now' line and its skip note once the south loops reopen | Assistant, owner approves |
| March 2027 | Camping near Berthoud: Boyd Lake's low-water boating closure is printed as 2026's; read the park page for 2027 | Assistant, owner approves |
| May 2027 | Ghost towns near Leadville: the Matchless Mine's 2027 opening date and ticket price, and CDOT's 2027 opening date for Independence Pass | Assistant, owner approves |
| Week of 11 January 2027 | Sundance from the towns next door: read every source again (the festival's venue, transit and parking pages, RTD's January service change, the City of Boulder's festival page) and move each `checked`; the validator lists the article from 11 January until that is done. The festival is 21 to 31 January 2027 | Assistant, owner approves |
| Now | A scheduled assistant session for the weekly audit: yes or no (the scorecard's was set up 27 October) | Owner |
| Now | Search Console for the scorecard: GSC Wizard is renewed on the Starter plan (10 properties), but its 10 slots are held by the aragonite sites and townofniwot.com, so it refuses Niwot, Lyons and Berthoud. In Dashboard Management, hide three of those and show the three guides (or upgrade); the weeks of 26 October and 2 November then get filled | Owner |
| Now | Buttondown: is open tracking on? No open has been counted on 24 deliveries since 22 October | Owner |
| Before each guide's first expiry | Re-check the kept quiet guides' listings against their own sites, then move `decideBy` to 20 January: Elizabeth done 30 October (21 of 25 confirmed or corrected, 86 & Main staged; three calls below), decide-by now 30 November, and again with the city guides in the week of 23 November, since a 30 October check lasts only to 29 December; Nederland done in part 30 October (15 re-checked, decide-by now 3 December), all 26 again in the week of 7 December, which mountain hours need to reach 20 January; Leadville done 30 October (24 of 26; two calls below), decide-by now 23 November, all 26 again in the week of 7 December; Fort Collins (67), Longmont (40), Loveland (42) and Castle Rock (30, live and quiet from 31 October, decide-by 29 November, hours from 5 December), with Elizabeth's second pass, all in the week of 23 November: a check on or after 21 November is what lasts to 20 January on the 60-day hours, and none of the three loses hours before 30 November. The mountain two need a second pass in early January (45-day hours). Listings whose sites refuse automated reads go to the owner as calls | Assistant checks, owner calls |
| 29 November | Castle Rock: its colours (still the placeholder rhyolite rose, near Johnstown's and Loveland's), and whether it joins the email or goes, with the other city guides | Owner |
| 20 January | The 90-day test's verdict (`docs/90-DAY-TEST.md`) | Owner |
| 20 January, after the verdict | The three domains still held (`DECISIONS.md`, "Five domains held, 30 October"; Lafayette and Frederick opened 2 November, "Black Hawk and Carbon Valley close; Lafayette and Frederick open"): Mead into a neighbour; Steamboat Springs and Salida renewed or let go | Owner |
| Now | Inside Carbon Valley, the guide again from 12 November (Frederick, Firestone and Dacono; DECISIONS.md, "Carbon Valley is the guide; Frederick is covered by it"): check the `carbonvalleyguide` project has what a live guide needs, since it only served redirects from 2 November: its deploy-hook line in the `VERCEL_DEPLOY_HOOKS` secret, Email Routing for `hello@carbonvalleyguide.com`, a Plausible site and a Search Console property for carbonvalleyguide.com, and a Formspree form (DEPLOY.md). Search Console: a change of address from insidefrederickco.com. The `insidefrederickco` and `insidelafayette` projects only serve redirects now and need none of this. Buttondown: the edition's tag is `carbon-valley`; subscribers tagged `frederick` are sent it too | Owner |

## Elizabeth: calls from the 30 October re-check

| By | What | Who |
|---|---|---|
| By 30 November | Elizabeth, three calls, needed before its decide-by can pass 30 November (the Town's site refuses automated reads, and nothing dated shows Catrina's open): Catrina's Latin Food, (719) 751-8789, still open and the hours Mon–Sat 6:30 am–8 pm, Sun 8 am–2 pm?; Town Hall, the office hours (the Main Street program says Mon–Fri 8 am–5 pm); Running Creek Park, still as listed. And 86 & Main, 122 S Main: what is it, and is it open? (staged) | Owner |
| Soon | Elizabeth: tell The Carriage Shoppes their site's About page (thecarriageshoppes.com/about-the-carriage-shoppes/) now serves a gambling spam page; the site looks compromised. A goodwill email, and a reason to be in touch | Owner |
| Soon | Elizabeth: Powder River Custom Hat Company's site says 211 Main; the Main Street directory says 232, the address it also gives Randy's. One call settles it | Owner |

## Castle Rock: before and after launch, from the 31 October completion

| By | What | Who |
|---|---|---|
| Soon | Browser reads where the fetch is refused: Alidade Brewing (alidadebrewing.com, hours and phone), Lost Coffee (lostcoffee.com, the Perry Street address, hours), Scileppi's (scileppis.com, hours), Crowfoot Valley Coffee (crowfootvalleycoffee.com: is the casino spam gone, and the hours), Guadalajara Family Restaurant (guadalajaramexfood.com, hours), Hideaway Bar & Grill (hideawaybarandgrill.com, hours) | Owner |
| Soon | Calls for hours: Castle View Cafe, 303-942-1155; Cuba Cuba, (720) 639-2719 (are the posted summer hours current?); Iron Mule Brewery, 720-328-9008 or taproom@ironmulebrewery.com; Ecclesia Market (hours and a phone; its contact page is a form); Glacier Ice Cream, (303) 386-3751; Mod Mountain Boutique (confirm open; nothing dated on its site); Sudden Fiction Books, (303) 856-8181 (published without hours; its site states none) | Owner |
| By 15 December | St. Francis of Assisi, 303-688-3025: the time of the Christmas Eve service at the Events Center (staged) | Owner |
| By 29 November | Confirm or decline Sudden Fiction Books as a source (`npm run sources -- confirm castle-rock suddenfictionbooks-com`); three of its events are published on its own page (`DECISIONS.md`, "Castle Rock completed before launch") | Owner |
| Soon | A Formspree form id for the contact page (it falls back to mailto), and a bought hero for the home page (`docs/HERO-PHOTOS.md`) | Owner |

## Leadville: calls from the 30 October re-check

| By | What | Who |
|---|---|---|
| By 23 November | Healy House Museum and Dexter Cabin, (719) 486-0487: winter and Thanksgiving hours; still Wed–Sun 10–4 with tours at 10, 11:30, 1 and 2:30? (History Colorado's site refuses automated reads) | Owner |
| By 23 November | Leadville National Fish Hatchery, (719) 486-0189: is it open to visitors? The Service's page shows office hours and no closure; the county tourism site says it "remains closed due to the Willow Fire" (August, and its 20 September update) | Owner |

## Calls still open in the three towns

Carried from the call list of 3 to 12 October (`docs/archive/CALL-LIST.md`,
which keeps every town). A row comes off once the listing carries a
`verified` date after 12 October 2026.

| Town | Listing | Ask | Who |
|---|---|---|---|
| Niwot | Belle Terre Floral, (303) 652-0419 | Hours, and still inside the Niwot Market? Its own site gives neither | Owner |
| Niwot | Fan's Chinese Cuisine | Hours, website | Owner |
| Niwot | Fly Away Home, 7960 Niwot Rd, Unit B-1, (303) 887-8064 | Still in Niwot? Which unit | Owner |
| Niwot | Little Bird | Hours, phone | Owner |
| Niwot | Niwot Cultural Arts Association (niwotarts.org) | Is the gateway sculpture still theirs to describe? Their site no longer mentions it (the listing goes on 8 December) | Owner |
| Niwot | Niwot Liquor Store, 303-652-2636 | Open, and its hours? Only a 2025 directory entry was found (the listing goes on 8 December) | Owner |
| Niwot | Sachi Sushi, (303) 652-0919 (the market's line) | The counter's days and hours: its page (read 12 October) gives none, so the listing shows none | Owner |
| Niwot | The Garden Gate Cafe | Hours, phone | Owner |
| Niwot | The Nook, (303) 652-0919 or 303-709-7004 | Which number is the Nook's? The guide has the first, which is the Niwot Market's main line on every page of its site; the business association's listing (August 2026) has the second | Owner |
| Niwot | WiNot Coffee Company | Hours, phone | Owner |
| Lyons | Gatherings of a Lifetime | Weekend hours still Sat–Sun 10–4? Only the Town's undated shop list says so | Owner |
| Lyons | Julie's Thai Kitchen, 138 Main St | Still open? Hours, phone, website | Owner |
| Lyons | Lyons Dairy Bar, 138 Main St | Still open? Which business is at 138 Main | Owner |
| Lyons | Oskar Blues Grill & Brew, 303 Main St | Still open? Hours (the pack's later closing times, or the listing's?) | Owner |
| Lyons | Solace | Still open? Hours, phone | Owner |
| Lyons | Uniquely Lyons | Still open? Hours, phone | Owner |
| Berthoud | B-Rad's Arcade | Still open? It has left Berthoud Main Street's dining list | Owner |
| Berthoud | Berthoud Inn, (970) 532-4566 | Still open? Hours, website | Owner |
| Berthoud | Brick Oven Pizza, 269 Mountain Ave | Hours, phone | Owner |
| Berthoud | Cornerstone Cafe, (970) 344-5139 | Days and hours | Owner |
| Berthoud | Happy Eating, 506 Welch Ave | Which days, and closing time | Owner |
| Berthoud | Indigo Sky Trading, 212 Mountain Ave | Hours, phone | Owner |
| Berthoud | Log Cabin Liquors, 443 Mountain Ave | Hours, phone | Owner |
| Berthoud | Trailhead Cafe, 375 Meadowlark Dr | Hours; still open? | Owner |
| Berthoud | Wishful Living, (970) 532-9834 | Still open at 321 Mountain Ave? Its domain now carries a gambling store; Main Street still lists it | Owner |

## Photographs

`docs/PHOTO-CONTACTS.csv` is the ledger of every listing without a
photograph and who to ask; `docs/PHOTO-PRIORITIES.md` is the shot list for
Lyons, Niwot and Golden; Berthoud's is in the row above; `docs/HERO-PHOTOS.md`
is the heroes' buy and shoot list. Permissions
received go in `PERMISSIONS.md`.

## On hold until 20 January 2027

The other guides run on automation: the Monday ingest, the nightly
re-check, the daily rebuild. Their open calls (Georgetown, Black Hawk,
Grand Lake, Leadville, Idaho Springs, Manitou Springs, Elizabeth, Timnath,
Johnstown, Erie, Carbon Valley, Evergreen, Golden, Longmont, Windsor,
Severance, Fort Lupton, Nederland, Estes Park, Fort Collins: 92 rows) stay in
`docs/archive/CALL-LIST.md`; the 11 October register of every staged
record is `docs/archive/VERIFICATION-QUEUE-2026-10-11.csv`. Forty mountain
access notes fall out of their 30-day window in November (the network
audit of 27 October); one monthly pass over the land managers' pages, or a
longer winter window, keeps them.

Loveland's resident pages, on the owner's yes of 9 November 2026 (the
Loveland gap report of 8 November, M1 and M15): Living here, Families and
Services, as Berthoud has them, with a home for the Chilson Senior Center,
House of Neighborly Service and the Food Bank's Loveland site. On a
resident guide those pages come with `home: true`, so this follows the
verdict and Loveland being kept at its decide-by (29 November). Owner
decides, assistant builds.

Agreed for the three towns, to be done after the test or when the owner says:

- **Niwot High's spring teams on the sports pages.** The owner said yes on
  9 November 2026 (finding 5): baseball, boys' volleyball, girls' golf,
  girls' soccer, girls' tennis and track. `SportConfig.season` has had
  spring since 9 November (Lyons's baseball and track), so what is left
  comes before the spring season: each team's MaxPreps path, read from
  MaxPreps. Cheer is not on MaxPreps and is not followed. Gymnastics,
  boys' golf and boys' tennis were added on 9 November. Assistant.
