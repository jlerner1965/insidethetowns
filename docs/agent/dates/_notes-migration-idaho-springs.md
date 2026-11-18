# Migration notes: Idaho Springs (insideidahosprings.com), 17 November 2026

Old content read from `a030ab9b` (47 places, 8 articles, 47 events) and, for what was deleted
earlier in `5b268a7c`, from its parent (20 Black Hawk places, 4 articles, 17 events).
Decisions: `docs/migration/decisions/idaho-springs.csv` (123 old paths).
Read with `curl` under the repo's link-checker identification unless a line says otherwise.
Not carried, listed only: `pages/moving-here.md`, `weekly/` (3), `corrections/` (1), `staging/` (20, never public).

On every restored file: `subTown`, `sourceId`, `sourceUid` and `sourceHash` were removed (the hub
town has no sub-towns and no `sources.json`, and the validator rejects both); `verified` and
`verifiedBy` set to today. Articles also got `updated: "2026-11-17"`.

## Places in Idaho Springs: kept unchanged

- argo-mill-and-tunnel: mightyargo.com/plan and /faq. "The mill runs 10am–4pm every day, with the last tour at 3pm"; FAQ "calling 303-567-2421"; $32.95 / $19.95 still on the ticket table.
- beau-jos-pizza: beaujos.com/locations/idaho-springs. "1517 Miner St ... (303) 567-4376", "11 AM - 8 PM Sunday - Thursday, 11 AM - 9 PM Friday & Saturday".
- clear-creek-metropolitan-recreation-district: clearcreekrecreation.com/hours and /contact. "Weekdays: 6:30 am to 8:30 pm, Saturday: 10 am to 4 pm, Sunday: 10am to 4pm"; "98 12th Avenue", "(303) 567-4822".
- clear-creek-rafting-company: clearcreekrafting.com. "daily ... from mid-May through mid-August, depending on water conditions"; "350 Whitewater Rd", "303-567-1000".
- freeride-bike-shop: freeridebikeshopco.com. "1800 Colorado Blvd, STE #5", "(720) 608-0718", "Open Wednesday through Sunday 9A - 5:30P".
- idaho-springs-mountain-gems: own site. "1447 B Miner Street", "(303) 567-2789", "Monday - Thursday: 10am - 6pm, Friday - Sunday: 10am - 8pm".
- idaho-springs-public-library: cccld.org/about/locations-and-hours. Address, phone and the seven days' hours as listed.
- safeway: local.safeway.com store page. "2425 Miner St", "(303) 567-4471", 6:00 AM - 10:00 PM each day.
- smokin-yards-bbq: smokinyards.com/contact. "2736 Colorado Blvd", "303.567.9273", "SUN.– THU. 11:00 AM – 8:00 PM, FRI. – SAT. 11:00 AM – 9:00 PM".
- two-brothers-deli: 2brosdelicolorado.com. "Mon - Thurs 9 a.m. - 3 p.m., Fri - Sun 8 a.m. - 4 p.m.", "1424 Miner Street", "303-567-2439".
- echo-lake-campground: fs.usda.gov page (updated September 14, 2026). Still "Site Closed", no reason or date, as the listing already says; "Single Site: $26 per night". Kept as a seasonal site; unsure, see the end.
- mount-blue-sky-summit: fs.usda.gov page (updated September 8, 2026). "Closed for the season".
- historical-society-of-idaho-springs-visitor-center: historicidahosprings.com answers 403 to curl; read with WebFetch. "2060 Miner Street", "303.567.4382", "Winter hours of operation are 10:00am-4:00pm. Summer hours are 9:30am-5:00pm."
- indian-hot-springs: indianhotsprings.com/pool is drawn by script (empty to curl); read rendered in a browser (no challenge or login). "Monday - Friday 8:30am - 9:00pm; Saturday - Sunday 7:30am - 10:00am, 10:30am - 2:00pm, 3:00pm - 6:30pm; Adult swim (Sat & Sun) 7:30pm - 9:30pm"; "Weekends – Reservation required"; "303.989.6666", "302 Soda Creek Road".

## Places in Idaho Springs: kept, corrected

- majestic-art-gallery: themajesticgallery.com. "OPEN 10am-4pm Daily. Summer (June - September) Hours: 10am to 5pm daily." Was "Daily 10 am–5 pm"; `hours` and the summary corrected.
- mighty-argo-cable-car: mightyargo.com/plan hours table: "Sun–Mon 11am–7pm; Tue–Wed Closed; Thu 11am–6pm; Fri–Sat 11am–7pm". Was Sun–Thu 10–6, Fri–Sat 10–7. `hours`, the summary and one body sentence corrected ("every day" no longer holds). The FAQ gives a slightly different week ("Mon 10am–5pm ... Fri–Sun 11am–7pm"); the listing follows the plan page, its `source`. Phone "(983) 955-8866" matches.
- mtn-prime: mtnprime.com. "Saturday: 10:30 am - 10:30 pm, Sunday: 10:30 am - 10:00 pm"; "Weekend Lunch Served 10:30 AM - 4 PM Sat & Sun, Breakfast options served until 3 PM". Was 9:30 am with a 9:30–12:30 brunch; `hours`, summary and the meal sentence corrected.
- slaymaker-cellars: slaymakercellars.com/visit. Monday to Thursday "11am - 5pm" (Tuesday printed "11pm - 5pm"), Friday to Sunday "10am - 6pm". Was Mon–Thu 10–5, Fri–Sun 10–7; `hours` and the note on the Tuesday misprint corrected.
- tommyknocker-brewery-and-pub: tommyknocker.com. "Mon-Thu 10:30 AM - 7:00 PM; Fri, Sat 10:30 AM - 8:00 PM; Sun 10:30 AM - 7:00 PM". Was to 8 pm and 9 pm; `hours` corrected.
- uplift-inn: upliftinn.com, /contact, /policies. "Uplift Inn is closed for the winter season, but we're already looking forward to welcoming you back in late May 2027!" Address, phone, "Check-in: After 4:00 PM / Check-out: By 10:00 AM" match. Added `seasonal` and one body sentence.
- mount-blue-sky-scenic-byway: fs.usda.gov page, now updated November 12, 2026 and marked "Site Closed" (was "open to Summit Lake"). `seasonal`, `access.closures`, summary and the closing paragraph corrected.

## Places in Idaho Springs: 410

- citizens-park, courtney-ryley-cooper-park, water-wheel-park, virginia-canyon-mountain-park: unverifiable. idahospringsco.com answers 403 to curl and to WebFetch (every URL tried, home page included). Not worked around. mightyargo.com has no page for the park (404).
- westbound-and-down-brewing: unverifiable. westboundanddown.com: Cloudflare "Just a moment..." (403) on /contact, / and /idaho-springs; WebFetch 403 too.
- starbucks-colorado-boulevard: unverifiable. The source is Starbucks' store locator, drawn by script; a rendered read returned "Zoomed out too far" with no store on three tries.

## Places in Georgetown and Black Hawk

- The 20 Georgetown places were already restored to `content/georgetown/places/` by the Georgetown pass; nothing overwritten. I read the same sources and agree with keeping all 20 (one thing to know: the Gateway Visitor Center page says both "9 am - 5 pm M-F" and "open daily from 9:00 a.m. to 5:00 p.m.").
- The 20 Black Hawk places (off this guide since 20 October) follow `docs/migration/decisions/black-hawk.csv`; not re-read here.

## Guides

- explore-idaho-springs-in-walking-order: kept. Re-read: historicidahosprings.com home, /historic-sites/ ("designated as a National Historic District in 1983") and the waterwheel page ("built the waterwheel in 1893", moved 1946, "restored during the spring and summer of 1988"), all by WebFetch; mightyargo.com/plan and /faq (33 miles, 35 minutes, exit 241, $2.95 to $14.95 parking, 20% off booked ahead); themajesticgallery.com; beaujos.com; parkidahosprings.com/parking-basics ("First half hour: $0.50", "Two-hour Flat Rate Special: $6.00", "$1 per hour and an $8 daily max"); visitidahospringsco.com/heritageandculture. Corrected: cable car hours, the Majestic's closing time (three places), the Mount Blue Sky line. Removed the `related` entry for Virginia Canyon Mountain Park (410). Not re-read: the City's parks page (403), which the Water Wheel Park paragraph leans on.
- idaho-springs-history, idaho-springs-with-kids: kept. Sources re-read: historicidahosprings.com (WebFetch), argomilltour.com ("listed on the National Register of Historic Places"), mightyargo.com ("January 1859 George Jackson ..."), cccld.org. One sentence in each that pointed at park listings now gone was trimmed. Body links to the three parks are left as they were.
- moving-to-georgetown, moving-to-black-hawk: 410. They are the old guide's moving-here pages (not carried), carry no `sources`, and the first describes the retired Inside Clear Creek guide.
- The four Georgetown guides and three Black Hawk guides follow those towns' passes (files already there).

## Events

- Kept, each dated page read on cccld.org: ispl-werewolf-after-dark ("November 19 @ 6:00 pm - 7:00 pm"), ispl-gobble-gobble-storytime ("November 20 @ 10:00 am - 11:00 am"), ispl-medicare-mentors on 23 and 30 November and 7, 14 and 21 December ("10:00 am - 12:00 pm", Idaho Springs Public Library).
- idaho-springs-book-group-2026-12-14: the old URL now redirects to a past January meeting; the library's live page (cccld.org/event/ispl-book-group-16-2-2-2/) says "December 14 @ 5:00 pm - 6:00 pm". Kept with the time and link corrected (was 4 to 5 pm). Its duplicate `ispl-book-group-2026-12-14` leads to it (`formerSlugs`).
- jtml-kids-winter-craft-workshops-... (5, 6, 12, 13 December): each page confirms "9:00 am - 2:00 pm". The page's Venue field says Idaho Springs Public Library, but the title ("JTML-") and text ("at the John Tomay Memorial Library ... during the Georgetown Christmas Market") say Georgetown. Written to `content/georgetown/events/` with the venue corrected to the John Tomay Memorial Library, 605 6th Street. Worth a human look.
- landmark-12-pop-up-wine-bar: hoteldeparismuseum.org: "December 5, 4PM-8PM; December 6 ...; December 12 ...; December 13, 4PM-8PM". Kept, in `content/georgetown/events/`.
- idaho-springs-tree-lighting-2026-11-28: tradition, existing record idaho-springs-holiday-ramble. visitidahospringsco.com/holidayramble: "6:00 PM: Community Christmas Tree Lighting at Citizens Park" on Friday, November 27. Visit Clear Creek's page still says Saturday, November 28, 3:00 to 4:30 PM, which is what the old listing carried; the organizer's page is the one to trust.
- georgetown-christmas-market (two old paths): tradition, existing record `georgetown-christmas-market`, not edited. Checked against historicgeorgetown.org/georgetown-christmas-market-2/: "66th Annual Georgetown Christmas Market", "December 5–6 & 12–13, 2026", "Free Admission • Free Parking & Shuttle", "Historic Downtown Georgetown". The record matches.
- trick-or-treat-train-2026-10-30: NO record added, 410. georgetownlooprr.com/events/ now lists only Santa's Rocky Mountain Adventure, Santa's Lighted Forest, the New Years Train and the Encore Train. Nothing on the site names the Trick or Treat Train: tried /glrr-events/trick-or-treat-train/ (404), the site search and its JSON search for "trick", "halloween", "treat" (nothing), the sitemap, the blog, /ride-with-us/, /planning-your-visit/, /in-the-loop/, /faqs-directions/. History Colorado's page for the railroad returned an empty 202. So neither "annual" nor "returns" can be read on the organizer's own pages today; the 2026 dates (30 and 31 October) were last read there on 28 October by the nightly re-check.
- autumnfest-georgetown-loop: 410, same finding.
- Black Hawk: the City's calendar list for December 2026 shows only a Historic Preservation Commission meeting; the Ted Garcia gallery evenings are not on it. Rows follow black-hawk.csv.
- john-tomay-memorial-library-book-group-2026-12-17: its page redirects to a past September meeting and the series page lists 19 November and then 21 January; 410.
- Bread Bar (Silver Plume): events page shows nothing to a plain read; 6 November is past, 21 November unverifiable and outside both towns.
- Everything else is a past dated event; no web read.

## Unsure

- Echo Lake Campground and the two Mount Blue Sky listings are kept though the Forest Service marks them closed: they are seasonal sites and the listings say so.
- Georgetown files carry no images in the other pass's copies; the five event files written here have none either.
