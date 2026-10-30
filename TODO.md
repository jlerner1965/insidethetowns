# To do

The one list. Who does each thing is in the last column: the owner (calls,
photographs, meetings, merges, money) or the assistant (code, drafts,
reports, checks). Three towns get the work until 20 January 2027
(`HOW-IT-WORKS.md`, section 2); everything else is on hold at the bottom.
Remove a row when it is done; the dated audits in `docs/audits/` say what
was found and when.

Last revised: 28 October 2026.

## This week

| Town | What | Why | Who |
|---|---|---|---|
| Berthoud | Call B-Rad's Arcade and Trailhead Cafe: still open, hours | Dropped by their only source on 26 October; hours hide in 60 days | Owner |
| Berthoud | Call Kofe House, (970) 344-5391: confirm the seven-day hours and the Thursday 5–8 pm dinner | The listing's hours are wrong against its own page | Owner |
| Berthoud | Call the library, (970) 532-2757: a calendar feed, or a monthly hours check for its six series | Its site rate-limits the nightly check; six series read as unverifiable | Owner |
| Berthoud | Photographs: City Star front, Town Hall, the Bike Park, Fickel Park, the Reservoir Loop, then Kofe House, Berthoud Brewing, Grandpa's, Cornerstone, Rise | The three home tiles and the eat-and-drink page have no photograph of a business; the shot list and sources are in the 27 October session notes and `docs/PHOTO-PRIORITIES.md` | Owner (hire or shoot) |
| Berthoud | A local change for `/updates/` on 3 November: the result on Issue 3G, from the county's returns | Worth knowing hides itself when its two items expire; the rec-centre anniversary is now a full listing (20 November, 4–8 pm) | Assistant drafts, owner confirms |
| All | Buy the hero photographs in `docs/HERO-PHOTOS.md` (Berthoud's, Loveland's and Lyons's are in, 28 October: paste their order numbers into `PERMISSIONS.md`; Erie's, 30 October, is in with its licence record; Clear Creek's, Leadville's, Manitou Springs's, Fort Collins's, Golden's and Estes Park's, 30 October, are in with theirs): iStock (Longmont, then the upgrades), Adobe Stock (the upgrades), Shutterstock packs if wanted; about $190. Send the files and receipts to the assistant | The paintings are gone; Longmont's hero is a lake rather than the town | Owner buys, assistant installs |
| Johnstown, Timnath | Shoot the hero: Parish Avenue north from 1st Street; Old Town Main Street north toward the church | Nothing exists to buy for either (`docs/HERO-PHOTOS.md`) | Owner |
| Lyons | Open lyonsfire.org in a browser; it answered 503 to the crawler from Moving here and Living here | Fix-now item, 27 October audit | Owner |
| Lyons | Call Lyons Veterinary Clinic, 303-823-6767, before Sunday 1 November: is the open house noon to 3 pm? Then `npm run confirm` (the line is in the staged file) | The queue was cleared on 30 October; this and the church festival are the two events left, each on the Recorder's word alone | Owner |
| Lyons | Ask Christian Promise Fellowship for the hours and address of its 7 November festival | Its site has been down since 21 October | Owner |
| Lyons | Confirm The Rock Garden as a source (`npm run sources -- confirm lyons rockgardenlyons-com`) before spring | Nothing waits on it now: its season's last show was 24 October | Owner |
| Lyons and Niwot | Re-list three weekly series that ended in October once the organizer confirms the next dates: the library's baby and toddler storytimes (Lyons), the Rotary Club breakfast (Niwot) | Their files stayed when the past one-offs were deleted on 27 October; a series with no next date shows nothing | Owner confirms, assistant re-lists |
| Niwot | Call Belle Terre Floral, (303) 652-0419, and The Nook: hours | On no page of their own since 12 October | Owner |
| All three | Fill the 90-day scorecard for the week of 26 October (`docs/90-DAY-TEST.md`) on Tuesday 3 November | The scheduled session does it every Tuesday at 11:17; Search Console settles a Sunday about two days later | Assistant (scheduled) |
| Lyons | Get the first subscriber: nobody has signed up on insidelyons.com, so the 22 October edition did not send | Its target is 150 by 20 January; the chamber's distribution ask is the drafted way in | Owner |
| Golden | 20 November: Foothills Art Center's galleries reopen for the Holiday Art Market; once its home page says so, take `status: temporarily-closed` (and `closed`, `statusNote`, `statusSource`) off `content/golden/places/foothills-art-center.md` | Marked closed on 28 October; nothing reopens a listing on its own | Assistant |
| Golden | Calls for the held queue (`npm run review -- --town=golden`): store hours from Sherpa House (303-278-7939), Table Mountain Grill (303-216-8040), YoColorado (303-278-2796) and Peak Cycles (303-216-1616); current closing times from Golden City Brewery ((303) 279-8092); a public phone for the Golden Mill and the Coors tour; the choir's date (GoldenConcertChoir@gmail.com); and from the 28 October additions, which hours are current at Cafe 13 ((303) 278-2225), Golden Goods ((303) 216-2123) and Trailhead Taphouse (720-638-9009), and a phone and hours for Stay Golden Mercantile | Each listing's own site gives everything else; the 28 October re-read is in each file's review note | Owner |

## Decisions due

| By | Decision | Who |
|---|---|---|
| Now | A scheduled assistant session for the weekly audit: yes or no (the scorecard's was set up 27 October) | Owner |
| Before each guide's first expiry | Re-check the kept quiet guides' listings against their own sites, then move `decideBy` to 20 January: Elizabeth (25) by 17 November; Nederland (26) by 21 November; Leadville (26) by 24 November; Fort Collins (67) by 30 November; Longmont (40) and Loveland (42) by 3 December. The mountain two need a second pass in early January (45-day hours). Listings whose sites refuse automated reads go to the owner as calls | Assistant checks, owner calls |
| 20 January | The 90-day test's verdict (`docs/90-DAY-TEST.md`) | Owner |
| 20 January, after the verdict | The five held domains (`DECISIONS.md`, "Five domains held, 30 October"): Lafayette first if the test passes; Frederick and Mead into their neighbours; Steamboat Springs and Salida renewed or let go | Owner |

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
