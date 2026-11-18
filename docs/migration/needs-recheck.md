# Places waiting for a re-check

*The move of 17 November 2026, on the owner's word of the same day.*

These places were on a folded guide and could not be read again when the guide moved to insidethetowns.com. They are kept like the other kept places, at the same address under the town, but each page is **noindex**, out of the sitemap, carries no LocalBusiness data, and opens with "Re-check pending. Last checked <date>". The old address on the guide's domain forwards to it (docs/migration/redirect-map.csv). `npm run validate` lists them on every run.

**To clear one:** read the source in a browser (or call the place), correct the file in `content/<town>/places/<slug>.md` to what it says, move `verified` to that day with `verifiedBy`, and delete the `recheckPending` line. The page is then indexed and listed in the sitemap on the next build. If it has closed for good, set `status: closed` (with `statusNote` and `statusSource`) and delete `recheckPending`; after the next hub build, `node scripts/migration/redirect-map.ts --dist=dist` answers its old address with 410, which is kept for confirmed closures only.

"Last checked" is the date in the file, the last day the old guide read the source. The pages are not cut for age while they wait, since the notice says how old the check is.

## The source blocked the check (37)

Each answered 403 or a bot challenge (Cloudflare and the like) to the repository's link checker and to WebFetch on 17 November 2026. Nothing was worked around. A person in a browser can read them.

### Black Hawk (11)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Ameristar Black Hawk | [/black-hawk/places/ameristar-black-hawk/](https://insidethetowns.com/black-hawk/places/ameristar-black-hawk/) | `https://insideblackhawk.com/places/ameristar-black-hawk/` | 2026-10-10 | https://www.ameristarblackhawk.com/visit |
| Bar 8042 at Ameristar | [/black-hawk/places/bar-8042/](https://insidethetowns.com/black-hawk/places/bar-8042/) | `https://insideblackhawk.com/places/bar-8042/` | 2026-10-11 | https://www.ameristarblackhawk.com/dining/bar-8042 |
| Bistro Mariposa | [/black-hawk/places/bistro-mariposa/](https://insidethetowns.com/black-hawk/places/bistro-mariposa/) | `https://insideblackhawk.com/places/bistro-mariposa/` | 2026-10-10 | https://monarchblackhawk.com/dining/bistro-mariposa |
| Fireside Kitchen | [/black-hawk/places/fireside-kitchen/](https://insidethetowns.com/black-hawk/places/fireside-kitchen/) | `https://insideblackhawk.com/places/fireside-kitchen/` | 2026-10-10 | https://www.ameristarblackhawk.com/dining/fireside-kitchen |
| Monarch Casino Resort Spa | [/black-hawk/places/monarch-casino-resort-spa/](https://insidethetowns.com/black-hawk/places/monarch-casino-resort-spa/) | `https://insideblackhawk.com/places/monarch-casino-resort-spa/` | 2026-10-10 | https://monarchblackhawk.com/contact-us |
| Monarch Chophouse | [/black-hawk/places/monarch-chophouse/](https://insidethetowns.com/black-hawk/places/monarch-chophouse/) | `https://insideblackhawk.com/places/monarch-chophouse/` | 2026-10-10 | https://monarchblackhawk.com/dining/monarch-chophouse |
| Spa Monarch | [/black-hawk/places/spa-monarch/](https://insidethetowns.com/black-hawk/places/spa-monarch/) | `https://insideblackhawk.com/places/spa-monarch/` | 2026-10-10 | https://monarchblackhawk.com/wellness |
| The Buffet at Monarch | [/black-hawk/places/the-buffet-at-monarch/](https://insidethetowns.com/black-hawk/places/the-buffet-at-monarch/) | `https://insideblackhawk.com/places/the-buffet-at-monarch/` | 2026-10-10 | https://monarchblackhawk.com/dining/the-buffet |
| Timberline Grill | [/black-hawk/places/timberline-grill/](https://insidethetowns.com/black-hawk/places/timberline-grill/) | `https://insideblackhawk.com/places/timberline-grill/` | 2026-10-10 | https://www.ameristarblackhawk.com/dining/timberline-grill |
| java etc. at Monarch | [/black-hawk/places/java-etc-monarch/](https://insidethetowns.com/black-hawk/places/java-etc-monarch/) | `https://insideblackhawk.com/places/java-etc-monarch/` | 2026-10-11 | https://monarchblackhawk.com/dining/java-etc |
| mPulse Gift Shop at Monarch | [/black-hawk/places/mpulse-gift-shop/](https://insidethetowns.com/black-hawk/places/mpulse-gift-shop/) | `https://insideblackhawk.com/places/mpulse-gift-shop/` | 2026-10-11 | https://monarchblackhawk.com/explore/activities/shopping |

### Castle Rock (10)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Alidade Brewing | [/castle-rock/places/alidade-brewing/](https://insidethetowns.com/castle-rock/places/alidade-brewing/) | `https://insidecastlerockco.com/places/alidade-brewing/` | 2026-10-31 | https://www.alidadebrewing.com/ |
| Castle Rock Recreation Center | [/castle-rock/places/castle-rock-recreation-center/](https://insidethetowns.com/castle-rock/places/castle-rock-recreation-center/) | `https://insidecastlerockco.com/places/castle-rock-recreation-center/` | 2026-10-31 | https://www.crgov.com/2054/Recreation-Center |
| Festival Park | [/castle-rock/places/festival-park/](https://insidethetowns.com/castle-rock/places/festival-park/) | `https://insidecastlerockco.com/places/festival-park/` | 2026-10-31 | https://www.crgov.com/facilities/facility/details/festivalpark |
| Los Dos Potrillos | [/castle-rock/places/los-dos-potrillos-castle-rock/](https://insidethetowns.com/castle-rock/places/los-dos-potrillos-castle-rock/) | `https://insidecastlerockco.com/places/los-dos-potrillos-castle-rock/` | 2026-11-06 | https://www.losdospotrillos.com/castle-rock |
| Lost Coffee | [/castle-rock/places/lost-coffee/](https://insidethetowns.com/castle-rock/places/lost-coffee/) | `https://insidecastlerockco.com/places/lost-coffee/` | 2026-10-31 | https://www.lostcoffee.com/ |
| Miller Activity Complex (MAC) | [/castle-rock/places/miller-activity-complex/](https://insidethetowns.com/castle-rock/places/miller-activity-complex/) | `https://insidecastlerockco.com/places/miller-activity-complex/` | 2026-10-31 | https://www.crgov.com/2049/Miller-Activity-Complex-MAC |
| Philip S. Miller Park | [/castle-rock/places/philip-s-miller-park/](https://insidethetowns.com/castle-rock/places/philip-s-miller-park/) | `https://insidecastlerockco.com/places/philip-s-miller-park/` | 2026-10-31 | https://www.crgov.com/2051/Philip-S-Miller-Park |
| Ridgeline Open Space and Trails | [/castle-rock/places/ridgeline-open-space/](https://insidethetowns.com/castle-rock/places/ridgeline-open-space/) | `https://insidecastlerockco.com/places/ridgeline-open-space/` | 2026-10-31 | https://www.crgov.com/facilities/facility/details/ridgelineopenspace |
| Rock Park Open Space and Trails | [/castle-rock/places/rock-park/](https://insidethetowns.com/castle-rock/places/rock-park/) | `https://insidecastlerockco.com/places/rock-park/` | 2026-10-31 | https://www.crgov.com/facilities/facility/details/rockpark |
| Scileppi's at The Old Stone Church | [/castle-rock/places/scileppis-at-the-old-stone-church/](https://insidethetowns.com/castle-rock/places/scileppis-at-the-old-stone-church/) | `https://insidecastlerockco.com/places/scileppis-at-the-old-stone-church/` | 2026-10-31 | https://www.scileppis.com/ |

### Elizabeth (1)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Running Creek Park | [/elizabeth/places/running-creek-park/](https://insidethetowns.com/elizabeth/places/running-creek-park/) | `https://insideelizabeth.com/places/running-creek-park/` | 2026-10-10 | https://www.townofelizabeth.org/publicworks/page/parks-and-trails |

### Fort Lupton (1)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Ace Hardware of Fort Lupton | [/fort-lupton/places/ace-hardware-of-fort-lupton/](https://insidethetowns.com/fort-lupton/places/ace-hardware-of-fort-lupton/) | `https://insidefortlupton.com/places/ace-hardware-of-fort-lupton/` | 2026-10-10 | https://www.acehardware.com/store-details/14333 |

### Grand Lake (5)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Bob Scott's Authentic Indian Jewelry | [/grand-lake/places/bob-scotts-authentic-indian-jewelry/](https://insidethetowns.com/grand-lake/places/bob-scotts-authentic-indian-jewelry/) | `https://insidegrandlake.com/places/bob-scotts-authentic-indian-jewelry/` | 2026-10-10 | https://bobscottsauthenticindianjewelry.com/ |
| Gene Stover Lakefront Park | [/grand-lake/places/gene-stover-lakefront-park/](https://insidethetowns.com/grand-lake/places/gene-stover-lakefront-park/) | `https://insidegrandlake.com/places/gene-stover-lakefront-park/` | 2026-10-10 | https://www.townofgrandlake.com/administration/page/gene-stover-lakefront-park |
| Point Park | [/grand-lake/places/point-park/](https://insidethetowns.com/grand-lake/places/point-park/) | `https://insidegrandlake.com/places/point-park/` | 2026-10-10 | https://www.townofgrandlake.com/community/page/point-park |
| Sagebrush BBQ & Grill | [/grand-lake/places/sagebrush-bbq-and-grill/](https://insidethetowns.com/grand-lake/places/sagebrush-bbq-and-grill/) | `https://insidegrandlake.com/places/sagebrush-bbq-and-grill/` | 2026-10-10 | https://sagebrushbbq.com/ |
| Town Square Park | [/grand-lake/places/town-square-park/](https://insidethetowns.com/grand-lake/places/town-square-park/) | `https://insidegrandlake.com/places/town-square-park/` | 2026-10-10 | https://www.townofgrandlake.com/community/page/town-square-park |

### Idaho Springs (5)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Citizens Park | [/idaho-springs/places/citizens-park/](https://insidethetowns.com/idaho-springs/places/citizens-park/) | `https://insideidahosprings.com/places/citizens-park/` | 2026-10-10 | https://www.idahospringsco.com/our-community/page/parks |
| Courtney Ryley Cooper Park | [/idaho-springs/places/courtney-ryley-cooper-park/](https://insidethetowns.com/idaho-springs/places/courtney-ryley-cooper-park/) | `https://insideidahosprings.com/places/courtney-ryley-cooper-park/` | 2026-10-10 | https://www.idahospringsco.com/our-community/page/parks |
| Virginia Canyon Mountain Park | [/idaho-springs/places/virginia-canyon-mountain-park/](https://insidethetowns.com/idaho-springs/places/virginia-canyon-mountain-park/) | `https://insideidahosprings.com/places/virginia-canyon-mountain-park/` | 2026-10-10 | https://www.idahospringsco.com/home-page/page/virginia-canyon-mountain-park-vcmp |
| Water Wheel Park | [/idaho-springs/places/water-wheel-park/](https://insidethetowns.com/idaho-springs/places/water-wheel-park/) | `https://insideidahosprings.com/places/water-wheel-park/` | 2026-10-10 | https://www.idahospringsco.com/our-community/page/parks |
| Westbound & Down Brewing Company | [/idaho-springs/places/westbound-and-down-brewing/](https://insidethetowns.com/idaho-springs/places/westbound-and-down-brewing/) | `https://insideidahosprings.com/places/westbound-and-down-brewing/` | 2026-10-10 | https://www.westboundanddown.com/contact |

### Manitou Springs (4)

| Place | Hub page | Old address | Last checked | Source to read |
|---|---|---|---|---|
| Fields Park | [/manitou-springs/places/fields-park/](https://insidethetowns.com/manitou-springs/places/fields-park/) | `https://insidemanitousprings.com/places/fields-park/` | 2026-10-10 | https://www.manitouspringsco.gov/836/Tennis-and-Pickleball-Courts |
| Memorial Park | [/manitou-springs/places/memorial-park/](https://insidethetowns.com/manitou-springs/places/memorial-park/) | `https://insidemanitousprings.com/places/memorial-park/` | 2026-10-10 | https://www.manitouspringsco.gov/Facilities/Facility/Details/Memorial-Park-3 |
| Mona Lisa Fondue Restaurant | [/manitou-springs/places/mona-lisa-fondue-restaurant/](https://insidethetowns.com/manitou-springs/places/mona-lisa-fondue-restaurant/) | `https://insidemanitousprings.com/places/mona-lisa-fondue-restaurant/` | 2026-10-10 | https://www.monalisafondue.com/ |
| Soda Springs Park | [/manitou-springs/places/soda-springs-park/](https://insidethetowns.com/manitou-springs/places/soda-springs-park/) | `https://insidemanitousprings.com/places/soda-springs-park/` | 2026-10-10 | https://www.manitouspringsco.gov/723/_Soda-Springs-Park-Remodel |

## The source gave nothing to check against (4)

Not blocked, and not confirmed closed either, so kept and flagged rather than answered with 410.

| Place | Hub page | Old address | Last checked | Source | What the read found |
|---|---|---|---|---|---|
| Cold Springs Campground | [/black-hawk/places/cold-springs-campground/](https://insidethetowns.com/black-hawk/places/cold-springs-campground/) | `https://insideblackhawk.com/places/cold-springs-campground/` | 2026-10-10 | https://www.fs.usda.gov/r02/arp/recreation/cold-springs-campground | The Forest Service page carries a "Site Closed" banner; the old guide had it temporarily closed; whether for the season or for good is not said. The file keeps `status: temporarily-closed`. |
| Suz Cookie Jar Rescue Bakery & Bites | [/evergreen/places/suz-cookie-jar-rescue/](https://insidethetowns.com/evergreen/places/suz-cookie-jar-rescue/) | `https://insideevergreenco.com/places/suz-cookie-jar-rescue/` | 2026-10-06 | https://scjrbakery.com/ | own site scjrbakery.com is now a domain-parking page (redirects to /lander); no other official page found |
| Starbucks — Colorado Boulevard | [/idaho-springs/places/starbucks-colorado-boulevard/](https://insidethetowns.com/idaho-springs/places/starbucks-colorado-boulevard/) | `https://insideidahosprings.com/places/starbucks-colorado-boulevard/` | 2026-10-11 | https://www.starbucks.com/store-locator?map=39.770895,-105.444815,10z&place=Idaho%20Springs%2C%20Colorado | the source is Starbucks' script-drawn store locator, which showed no store results in a plain read or a rendered one |
| The Hidden Stem | [/timnath/places/the-hidden-stem/](https://insidethetowns.com/timnath/places/the-hidden-stem/) | `https://insidetimnath.com/places/the-hidden-stem/` | 2026-09-18 | https://timnathchamber.com/directory/the-hidden-stem | the Chamber directory listing now gives no address, phone or hours (only "a garden boutique on Main Street in Timnath"); its own page is Facebook (login wall); thehiddenstem.com did not answer |

## Not here

- Places confirmed closed answer 410. On 17 November 2026 there are none: every place 410 in the map was a source that could not be read, and those are the pages above.
- Six Castle Rock listings the old guide had retired before the move (Greenland, Hidden Mesa, Lincoln Mountain and Spruce Mountain open spaces, Sandstone Ranch, Two Bridges Trail) had no page on it; their old addresses forwarded to its directory and now forward to /castle-rock/places/.
- Twenty Black Hawk listings the Clear Creek guide carried from 20 October to 2 November 2026 have old addresses on insideidahosprings.com too; those go to the same Black Hawk pages, kept or re-check pending.
