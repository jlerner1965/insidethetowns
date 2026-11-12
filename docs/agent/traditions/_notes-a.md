# Traditions notes, batch A: Berthoud, Castle Rock, Elizabeth, Erie, Estes Park, Fort Collins

Drafted 2026-11-12. All pages were read on 2026-11-12. Day-of-week checks were run against the real calendar: 2026-11-06 Fri, 2026-11-14 Sat, 2026-11-21 Sat, 2026-11-27 Fri, 2026-12-01 Tue, 2026-12-04 Fri, 2026-12-05 Sat, 2025-11-28 Fri.

How each page was read: "curl" means I fetched the raw HTML and read the text myself. "WebFetch" means the site blocked curl (403) and I read it through the WebFetch tool, which returns an extract, not the raw page. Records that rest on a WebFetch read are flagged below.

Eight records:

| Record | Status |
|---|---|
| berthoud-parade-of-lights | 2026 confirmed |
| castle-rock-outlets-tree-lighting | 2026 confirmed (flagged) |
| elizabeth-mayors-tree-lighting | 2026 confirmed (flagged: page body not readable) |
| erie-parade-of-lights | 2026 confirmed |
| estes-park-catch-the-glow-parade | 2026 confirmed, plus a 2025 entry |
| estes-park-lighting-of-the-trees | 2026 confirmed |
| fort-collins-downtown-holiday-lighting-ceremony | 2026 confirmed (flagged: type fit) |
| fort-collins-nightlights-tree-lighting | 2026 confirmed |

---

## Berthoud

### berthoud-parade-of-lights: 2026 confirmed

- https://berthoudparadeoflights.com/ (curl). This is the event's own site. It reads "Berthoud Annual / Parade of Lights & Tree Lighting Ceremony", "Saturday, December 5th, 2026 at 5pm" and "Sat., Dec. 5". The timeline gives 4:00 PM line-up on Second Street and 5:00 PM parade start. The route is "along Mountain Ave. in downtown Berthoud, commencing at Second Street and concluding at Eighth Street". Caroling and the tree lighting ceremony are at 5:45 PM. The site states no cost and no 2025 date. Its WordPress API shows a single page, last modified 2026-10-14.
- https://forms.gle/23k83u6ohb2aF3nd7 is the float form linked from the site; it resolves to a Google Form, "Berthoud Parade of Lights Application 2026" (curl). It reads "The Berthoud Parade of Lights will be Saturday, December 5, 2026 at 5:00pm." Line-up is "at or before 4:30 pm along North 2nd Street". The contact is Kristina Portillo (970-646-3119, info@northerncoloradochristmas.com). The form footer says "This form was created inside of Northern Colorado Landscaping."
- **Combined event.** The tree lighting is part of this event: the organizer's heading is "Parade of Lights & Tree Lighting Ceremony" and its timeline puts the tree lighting at 5:45 pm. I wrote it once, as `parade-of-lights`, because the organizer leads with the parade. There is no separate Berthoud tree-lighting record.
- **Organizer: please check.** The parade site names no organization; its copyright line reads "Berthoud Parade of Lights", so I used that as `organizer`.
  - The float form is owned by a Northern Colorado Landscaping Google account.
  - Berthoud Main Street's page says the all-day festival around the parade is "brought to you by Berthoud Main Street, Town of Berthoud and Berthoud Chamber".
  - Change the organizer if you know who runs the parade.
- `cost` is omitted because the parade's own pages do not state one.
- **No 2025 entry.** The 2025 float form (https://docs.google.com/forms/d/e/1FAIpQLSeICrPX6HW-NlYTEEUOJo8hknD4l1EbIPoT8rsj3OcvhbGJHA/closedform) is closed and shows no date.
  - The Town's December 2025 newsletter and a 2025 regional roundup were in the search results, but neither is the parade organizer's page, so I did not use them.

Other URLs read for Berthoud:
- https://berthoudmainstreet.org/averymerryberthoud/ (curl): "Saturday, December 5th, 2026", for A Very Merry Berthoud, ending with the "Parade of Lights and Tree Lighting Ceremony". This is a festival-partner page, so I used it for context only.
- https://www.berthoud.org/1530/Upcoming-Events (curl): the Town lists "A Very Merry Berthoud (December 5, 2026)", ending with "the Parade of Lights and Community Tree Lighting". This is a partner listing, used for context only.

## Castle Rock

### castle-rock-outlets-tree-lighting: 2026 confirmed (flagged)

- https://www.outletsatcastlerock.com/event/44699-tree-lighting-celebration. curl got a 403 ("Your IP has been blocked"), so I read it twice with WebFetch, and both reads agree.
  - Title "Tree Lighting Celebration"; "Annual Tree Lighting, Free Concert & Holiday Drone Show"; "Saturday, November 14, 2026".
  - "November 14th: 4:00 pm - 7:00 pm"; "Concert starts at 4:00 PM". No separate lighting time is given.
  - "Free and open to the public!"; 5050 Factory Shops Blvd. Suite 437.
  - Santa lights "Colorado's tallest Christmas tree".
  - The page states no first year and no 2025 date.
- **Flag 1: type fit.** This is run by a shopping centre, not the Town. It is a free public tree lighting held in Castle Rock, so I included it as a community tree lighting. Drop it if shopping-centre lightings are out of scope. (Another batch included Longmont's Village at the Peaks lighting on the same basis.)
- **Flag 2: read method.** The page was read only through WebFetch, because curl was blocked.
- **No 2025 entry.** The 2025 date (Nov 15, 2025) appears only on listing and news sites, not on an Outlets page I could read.

### No other Castle Rock record

- **No parade of lights in Castle Rock.**
  - https://www.downtowncastlerock.com/2026events (curl), the Downtown Merchants Association's 2026 events: no parade and no tree lighting. It lists winter trolley rides and carriage rides 11/22/26 to 1/3/27.
  - Web searches found no Castle Rock lighted parade.
  - A Denver Gazette roundup heading mentions a "Castle Rock Festival of Lights Hometown Lighted Parade", but it gives no date or organizer, and I found no organizer page for it.
- **Castle Rock Starlighting is excluded.** It is the lighting of the star on the Rock, not a tree, so it is neither of the two types. The Chamber's page, https://castlerock.org/castle-rock-starlighting/, puts it on Saturday, November 21, 2026; I took that from the repo listing and did not re-read the page for a record.
- **No Town tree lighting found.** https://www.crgov.com/StarSeason returned 403 to both curl and WebFetch. Search showed no Town of Castle Rock tree lighting.

## Elizabeth

### elizabeth-mayors-tree-lighting: 2026 confirmed (flagged: page body not readable)

- https://www.townofelizabeth.org/community/page/mayors-tree-lighting-saturday-december-5-2026 sits behind a Cloudflare "Just a moment..." check. curl, WebFetch and a headless browser all received only the check page. I did not try to get around it.
- **Where the date comes from:**
  - The Town's own page URL (its CMS title slug) reads "mayors-tree-lighting-saturday-december-5-2026".
  - Two web searches returned the search index's text of that same page: "Come join us at the Mayor's Tree Lighting on Saturday, December 5, from 3:00 - 6:00 p.m.", with the tree lit at 5:00 p.m., activities on Main Street, and a Stage II burn-ban notice.
  - December 5 is a Saturday in 2026, so the weekday matches.
  - The repo's existing listing (content/elizabeth/events/mayors-tree-lighting.md, verified 2026-10-11 by Codex) gives the same date and times.
- **Please open the page in a normal browser before approving.** Because I could not read the body myself, I left out `startTime` (3 pm), `place` and `cost`. The name "Mayor's Tree Lighting" comes from the page title in the URL and the search text; the original may use a curly apostrophe.
- **No 2025 entry.** Elizabeth Main Street Program's Locable listing for Dec 6, 2025 (https://www.locable.com/connections/45185-elizabeth-main-street-program/events/2025/12/6/243078/mayors-tree-lighting-2) is also behind Cloudflare (403), so I could not read it.

Other URLs read for Elizabeth:
- https://www.elizabethmainstreet.org/ and https://www.elizabethmainstreet.org/events (curl): no tree lighting or parade listed for 2026.

No parade of lights in Elizabeth:
- Search found none in Elizabeth itself. The nearest is the Town of Kiowa's lighted car parade, which is a different town.
- "An Elizabeth Christmas" (Park & Rec District, Dec 12) is not a parade or tree lighting, according to the repo listing.

## Erie

### erie-parade-of-lights: 2026 confirmed

- https://members.eriechamber.org/events/details/parade-of-lights-2026-853091 (curl).
  - Event: "Parade of Lights 2026"; "Friday, December 4th / 4:30 PM - 8:30 PM / Downtown Historic Erie"; "Friday Dec 4, 2026 / 4:30 PM - 8:30 PM MST".
  - Times: "Activities begin at 4:30 pm; Parade begins at 6:30". Choirs sing 4–6 pm.
  - Route: "north on Briggs St. from Maxwell Ave. to Cheesman St."
  - Organizer: "Hosted by The Erie Chamber of Commerce".
  - No cost is stated for the parade (only "Free Carriage Rides" and free hot chocolate), so `cost` is omitted.
- `startTime` is "4:30 pm", the organizer's start time for the event. **The parade itself steps off at 6:30 pm.** Change `startTime` to 6:30 pm if the field should be the parade time.
- `name` is "Parade of Lights", which is what the Chamber calls it on both pages (no "Erie" prefix).
- https://www.eriechamber.org/special-events/ (curl): "Parade of Lights / Friday, December 4th , 2026 / 4:30 PM - 8:30 PM", linking to the page above.
- **No 2025 entry.**
  - The Chamber's event search (https://members.eriechamber.org/events/search?q=parade...) returns only the 2026 event.
  - Web search found no Chamber 2025 page.
  - A yellowscene.com listing (Dec 5, 2025) is a third-party site.

### No Erie tree lighting

- https://www.erieco.gov/calendar.aspx?CID=0&month=11&year=2026 and the same calendar for month=12 (curl): no tree lighting or parade, only Tree Advisory Board meetings and the Pilgrimage Run.
- https://www.erieco.gov/Search?searchPhrase=tree%20lighting (curl): no results.
- The Chamber's 2026 parade pages do not mention a tree lighting.
- Web search found no Erie tree lighting with an organizer page.

## Estes Park

eventsinestes.com is the Town of Estes Park Events Department's site. Its About page names the Events Department and the Town; its footer gives events@estes.org and 1125 Rooftop Way.

### estes-park-catch-the-glow-parade: 2026 confirmed, plus a 2025 entry

- https://eventsinestes.com/catch-the-glow-parade/ (curl).
  - "Free Event"; "November 27, 2026 / Friday 5:30 p.m."
  - "the Annual Catch the Glow Parade as it lights up Estes Park on Friday, November 27, 2026, at 5:30 PM—the day after Thanksgiving!"
  - "up to 30,000 spectators gather along Elkhorn Avenue". No first year is stated.
- **2025 entry: Friday, Nov. 28, 2025.** Source: https://docs.google.com/document/d/e/2PACX-1vSQBvLx2lVdwnheab-neajA8dDE_quFvVtP1an-atyjp5nQD3IxQhDxFxV2sGIHOg/pub (curl). This is a Town of Estes Park news release, "Catch the Glow Parade brightens downtown Estes Park Nov. 28", dated Nov. 18, 2025: "starts at 5:30 p.m. on Friday, Nov. 28". The Town publishes its releases as Google Docs; its 2026 news list links its 2026 releases the same way.
- **Conflict in a third-party listing.** A search summary said one Estes Park calendar (estes-park.com, a tourism site, not the Town) lists the parade on November 28, 2026. That date is a Saturday and conflicts with the organizer. I ignored it; the organizer says Friday, November 27, 2026.

### estes-park-lighting-of-the-trees: 2026 confirmed

- https://eventsinestes.com/tree-lighting/ (curl).
  - "Lighting of the Trees | November"; "Free Event"; "Estes Park's Lighting of the Trees Ceremony".
  - "November 21, 2026 / Saturday 3:30 – 6 p.m. / Lighting of the Trees at 5:30 PM"; in Bond Park.
- https://estespark.colorado.gov/news (curl), the Town news list: "Nov. 10, 2026 Town to host 16th annual Lighting of the Trees Ceremony Nov. 21". It links to https://docs.google.com/document/d/e/2PACX-1vR4cUTxB86YSASofwNiYrDpUxcgwsZ70ktbVBXpNLPDQbgPaKz7yhCksdxZeekOHA/pub (curl): "The festivities begin at 3:30 p.m. on Saturday, Nov. 21, in Bond Park. The official tree-lighting takes place at 5:30 p.m."
- `firstYear` is omitted. The release only says "16th annual" and states no starting year.
- `startTime` is 3:30 pm (festivities start). The tree is lit at 5:30 pm.
- **No 2025 entry.**
  - The Town news list (https://estespark.colorado.gov/news, and with ?year=2025) shows only Sept–Nov 2026.
  - I found no Town page or release giving the 2025 date. Searches showed Nov. 22, 2025 only on third-party sites.

Nothing else found in Estes Park: searches showed no other tree lighting with its own organizer page (Stanley Hotel, YMCA of the Rockies, Elkhorn Lodge).

## Fort Collins

### fort-collins-downtown-holiday-lighting-ceremony: 2026 confirmed (flagged: type fit; the event is already past)

- https://www.fortcollins.gov/Event-Folder/2026-Events/2026-Q4/Downtown-Holiday-Lighting-Ceremony. curl got a 403, so I read it through WebFetch.
  - "Downtown Holiday Lighting Ceremony"; "Friday, November 06, 2026"; "05:30 PM - 07:00 PM"; "Old Town Square"; cost "Free".
  - "a short ceremony taking place at 6:30 p.m. before the lights turn on".
  - "Trees throughout Old Town will be illuminated with thousands of LED bulbs through February."
  - It is a partnership of the City, the Downtown Development Authority (DDA) and the Downtown General Improvement District, presented by Fort Collins Connexion; the contact is the Parks Department.
  - No first year is stated.
- https://www.fortcollins.gov/Event-Folder/2026-Events/2026-Q4/Downtown-Holiday-Lights (WebFetch) shows the same title, date and times.
- **Flag 1: type fit.** This lights the holiday lights on the trees throughout Old Town; it is not one Christmas tree. I typed it `tree-lighting` because the City describes trees being illuminated. Drop it if it doesn't fit.
- **Flag 2: read method.** The City's pages were read only through WebFetch.
- The 2026 date has already passed (Nov 6). The status is still `confirmed`.
- **No 2025 entry.**
  - The likely 2025 City page (…/2025-Events/2025-Q4/Downtown-Holiday-Lighting-Ceremony) returned 404.
  - https://fortcollins.gov/Home/Tabs/News?id=8936 (WebFetch) now shows unrelated 2026 news.
  - https://www.fcgov.com/downtown-holiday-lights returned 500.
  - The DDA pages https://downtownfortcollins.com/do/downtown-holiday-lighting-ceremony-2 (Friday, Nov 7, 2025) and https://downtownfortcollins.com/do/downtown-holiday-lighting-ceremony-1 (Friday, Nov 1, 2024) were read with curl. Both say "This event is produced by an outside organization and is unaffiliated with the Downtown Development Authority", so they are listings, not organizer pages, and I did not use them.

### fort-collins-nightlights-tree-lighting: 2026 confirmed

- https://giveanightlight.com/ redirects to https://www.realitiesforchildren.com/events/nightlights-2/ (curl). Realities For Children's own page reads:
  - "JOIN US FOR THE 29TH ANNUAL NIGHTLIGHTS TREE LIGHTING CELEBRATION!"
  - "Tuesday December 1, 2026"
  - "Location: First Presbyterian Church, 531 S College Ave, Fort Collins / Time: Festivities begin at 5:30 PM / Program: 6:00 - 7:00 PM"
  - "This free, community celebration"; the event ends with the "Lighting of the 50-ft blue NightLights tree".
  - It says the tree "for 28 years has stood". No start year is stated, so `firstYear` is omitted.
- https://www.realitiesforchildren.com/nightlights-toolkit/ (curl): "29TH ANNUAL NIGHTLIGHTS · 2026", "December 1 / NightLights Tree Lighting Celebration". I took `name` from this wording.
- **No 2025 entry.**
  - https://www.realitiesforchildren.com/gallery/2025-nightlights/ (curl) is a photo album with no date.
  - The 2025 date (Mon, Dec 1, 2025) appears only on news and chamber listings.
  - The organization's site blocked one of my API requests with an anti-bot page; I did not retry.

### Fort Collins candidate not written

- **CSU Marching Band "2026 Parade of Lights Preview".** I did not write a record because I'm not sure it counts as a lighted community holiday parade; please decide.
  - https://music.colostate.edu/events/2026-parade-of-lights-preview/ (curl): "Friday, December 4, 2026 at 5:30 pm". Route: "East on Lake St., North on Peterson St., West on Pitkin St., and South on Remington St.", followed by a short performance at the University Center for the Arts.
  - It is a hometown preview by the band before the 9News Parade of Lights in Denver. The page does not say the band is lit.
  - The 2025 page, https://music.colostate.edu/events/2025-parade-of-lights-preview/ (curl), gives "Date: December 5, 2025, Time: 5:30 PM - 6:00 PM" and "Organizer: School of Music, Theatre, and Dance".
  - If you approve it, the record would be type `parade-of-lights`, name "Parade of Lights Preview", organizer "CSU School of Music, Theatre, and Dance". It would have a 2026 entry dated 2026-12-04 at 5:30 pm, and a 2025 entry dated 2025-12-05 with the 2025 page as its sourceUrl.

### No Fort Collins lighted parade with an organizer page

- Search found no Fort Collins parade of lights other than the CSU preview.
- A radio-station article describes a downtown holiday bike-light parade, but gives no date and no organizer page.

## Could not verify

- **Elizabeth:** the Town's page body is behind Cloudflare. The details are above.
- **Castle Rock:** the Town site (crgov.com) is blocked to curl and WebFetch, so a Town-run tree lighting could not be ruled out from its own site. Search showed none.
- **Castle Rock and Fort Collins (the City):** these pages were read only through WebFetch, which returns an extract, not the raw page.
