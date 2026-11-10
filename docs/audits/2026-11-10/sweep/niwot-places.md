# Niwot — accuracy report, part places

(Written incrementally. Policy used: a file is stamped only when every checkable claim in it was found on a page read today; a file whose listing fields matched but which carries a claim the pages read do not state is left unstamped and listed under Unverified, saying what did match.)

## Corrected
- `content/niwot/places/love-ice-cream.md` — summary/body: "Small-batch ice cream" → "Locally sourced ice cream from High Point Creamery" (the shop's page says "locally sourced, premium ice cream from High Point Creamery"; it does not say small-batch). Hours, address, dairy-free, Sept 2024 opening confirmed — source: https://www.loveicecream.co/
- `content/niwot/places/niwot-market-deli.md` — summary/body: "a soup bar" / "a soup bar in the cold months" → "soup made fresh daily" (page lists "Soup, Fresh Daily" in three sizes; no soup bar, no season) — source: https://niwotmarket.com/deli
- `content/niwot/places/wise-buys-antiques.md` — summary/body: "collectibles from the 1800s onward, plus furniture refinishing and repair" → "restored furniture, antiques and vintage collectibles, plus furniture repair and restoration on site" (listing does not give "1800s") — source: https://niwot.com/listing/wise-buys-antiques/

## Stale dated content fixed
- `content/niwot/places/fortezza-ristorante.md` — "The newest of Niwot's sit-down dinners" (opened August 2025, 15 months ago) → "A sit-down dinner restaurant on Niwot Road…, open since August 2025" — source: https://fortezzaristorante.com/our-story
- `content/niwot/places/niwot-childrens-park.md` — "which marks its tenth birthday in October 2026" → "the park turned ten in October 2026" — source: the file's own dates (file NOT stamped; see Unverified)

## New content written
- none (not in this part's remit)

## Confirmed unchanged (so far)
abos-pizza, belle-terre-floral, little-bird, niwot-liquor, sachi-sushi, una-vida, winot-coffee-company, blessings-day-spa, emory-janes-coffee-co (+ stamped with a fix: love-ice-cream, niwot-market-deli, wise-buys-antiques, fortezza-ristorante)

## Unverified, left unchanged
- `content/niwot/places/fans-chinese-cuisine.md` — hours "Daily 11 am–8:15 pm", phone, address — tried: https://www.fanschinesecuisine.com/ returns HTTP 429 "Vercel Security Checkpoint" (bot challenge, not worked around); no other primary source read.
- `content/niwot/places/niwot-inn.md` — address "342 Second Avenue"; "the only place to stay" — tried: niwotinn.com home, /rooms/ and /contact/: confirm "thirteen beautiful guestrooms", the spa, phone 303-652-8452 (not in file); no street address appears in the HTML of those pages; no niwot.com listing URL found.
- `content/niwot/places/niwot-market.md` — "Daily 7 am–8:30 pm" — tried: https://niwotmarket.com/contact-us (curl is reset; read through WebFetch): shows only "Open today 07:00 am – 08:30 pm" (a Tuesday), no per-day list; address, phone (303) 652-0919, "Est. 2002", produce, deli, pet supplies, Sachi/Nook/Belle Terre all confirmed on niwotmarket.com. Only the every-day part of the hours is unread.
- `content/niwot/places/old-fire-house-museum.md` — "8-by-14-foot frame shed" — tried: niwothistoricalsociety.org /explore/, /stories/fire-house-museum-a-short-history/, /stories/the-fire-cart-and-fire-house/: confirm 1910, 195 Second Avenue beside the Grange, bank/hotel site, laundry shed, Floyd Edmunds' office, 1997, six pieces, plaque, Buffalo No. 21, open Fourth of July; none gives the dimensions (the lhvc.com story the file cites is robots-disallowed).
- `content/niwot/places/gateway-sculpture.md` — whole listing — tried: only source is niwotarts.org (robots-disallowed); niwot.com/venues and /things-to-do/ do not describe the gateway.
- `content/niwot/places/niwot-childrens-park.md` — address "101 First Avenue", opened October 2016, mammoth/fossil features, Rock & Rails funding — tried: niwotarts.org disallowed; niwot.com/venues and /things-to-do/ confirm only that the park exists, has play equipment, a pavilion and story area.
- `content/niwot/places/niwot-sculpture-park.md` — "79th Street and Niwot Road", owned pieces, loans "for a year at a time" — tried: niwotarts.org disallowed; https://niwot.com/things-to-do/ confirms "Launched in November 2018", sculptures on loan chosen by the Niwot Sculpture Park Committee; not the corner or the loan term.
- `content/niwot/places/fly-away-home.md` — closed 24 Dec 2024 on owner's retirement — tried: source is lhvc.com (robots-disallowed). Supporting only: niwot.com/listing/fly-away-home/ is 404, and niwot.com now lists Belle Terre Floral at the same unit, 7960 Niwot Rd unit B1.
- `content/niwot/places/cimminis.md` — "Open since January 2022", "heated front patio" — tried: https://cimminisniwot.com/ confirms address, phone, and hours exactly as filed (lunch Wed–Fri 11–2, breakfast Sat–Sun 9–1, dinner Wed–Sat 4–8, Sun 4–7:30, closed Mon–Tue), "made from scratch"; opening date and heated patio not on the page (/our-story is 404).
- `content/niwot/places/fritz-family-brewers.md` — "German-style", "dogs on the patio", and the body's stale "Hours are from the brewery's site as read in September 2026" — tried: fritzfamilybrewers.com home and /about-us: hours, address, phone match exactly; pages say "family-friendly brewery… lagers and ales", nothing on German-style or dogs. Suggest dropping "as read in September 2026".
- `content/niwot/places/garden-gate-cafe.md` — "benedicts, farmhouse plates and Southwest specials" — tried: thegardengatecafe.com returns a Cloudflare "Just a moment" challenge (403); https://niwot.com/listing/the-garden-gate-cafe/ confirms daily 7 am–2 pm, unit B4, "breakfasts and lunches served daily"; no menu.
- `content/niwot/places/hannas-herb-shop.md` — "in Niwot since November 2025", "decades on Valmont Road" — tried: hannasherbshop.com contact page confirms Suite D-15 and hours exactly (Tue–Fri 10–6, Sat 10–4, closed Sun–Mon); the About page gives "since 1957" in Boulder but neither the move date nor Valmont Road.
- `content/niwot/places/inkberry-books.md` — "open since 2018", "art by Boulder County artists each month" — tried: https://www.inkberrybooks.com confirms Suite B-3, (720) 412-1548, every day 10:00–3:00, "New, gently used & out-of-print books"; not the year or the art. Note a conflict: niwot.com/listing/inkberry-books/ shows Friday 10 am–5 pm; the shop's own site says Friday 10–3 (file follows the shop).

### appended after the remaining 26 place files

## Corrected (cont.)
- `content/niwot/places/niwot-loop-trail.md` — access.closures: "None posted on the County's Niwot trails page on 5 November 2026…" → "Boulder County says the Niwot Loop Trailhead and trail will close later this winter while crews repair two bridges near the trailhead. Repair dates have not been announced; the recycling drop-off stays open." (correction file `corrections/2026-11-10-niwot-loop-trail.md` added) — source: https://bouldercounty.gov/open-space/parks-and-trails/niwot-trails/

## Confirmed unchanged (cont.)
lobo-regional-trail, murray-street-flowers, niles-family-dentistry, niwot-jewelry-gifts, niwot-veterinary-clinic, niwot-wheel-works, old-oak-coffeehouse, old-town-second-avenue, osmosis-gallery, raza-fresa, taverna-laudisio (+ niwot-loop-trail stamped with the closure fix)

## Unverified, left unchanged (cont.)
- `content/niwot/places/niwot-loop-trail.md` — only the parenthetical "The Niwot Trot 5K… has run a different course through downtown since 2024" — not on the County page (everything else on the page matches: seven trails and lengths, parking counts, leash rule, hours). File stamped because the closure fact changed.
- `content/niwot/places/niwot-hall.md` — "the Why Not Niwot? art show", "private rentals" — tried: niwothall.org home and /calendar/: confirm 195 2nd Avenue, Lecture Series, Holiday Market, Line Dancing Lessons, Rotary, Election Commission Meeting; Why Not Niwot? is not on either page today.
- `content/niwot/places/niwot-tavern.md` — "covered patio beside the bronze bears" — tried: niwottavern.com home and /location/niwot-tavern/: confirm 7960 Niwot Road, (303) 652-0200, "open daily 11 am - 9 pm"; no mention of the patio or bears.
- `content/niwot/places/the-nook.md` — "run by the same owner since 2019" — tried: https://niwot.com/listing/the-nook/ confirms inside Niwot Market, "Open daily from 7am - 8pm", 303-709-7004; niwotmarket.com/the-nook gives only a one-line description. No year on either.
- `content/niwot/places/the-wheel-house.md` — "Opened September 2020; its own kitchen opened in February 2026", "back patio", the niwot.com "124 Second Avenue" remark — tried: niwotwheelhouse.com home, /about, /bike-shop: confirm 101 2nd Ave Suite B, 720-340-2979, bar hours and bike-shop hours exactly as filed, Tuesday trivia, live music, no-appointment services, "Our Summer Ride series has concluded"; no opening dates or patio.
- `content/niwot/places/whistle-stop-park.md` — "CB&Q 14649… built in 1907", "Thursday-evening… June to August" — tried: niwotarts.org disallowed; niwot.com/venues confirms the south-west corner of Murray and 1st and "open to the public during daylight hours"; niwot.com/things-to-do confirms the caboose, bandstand and Rock & Rails; not the caboose number/year or concert days.

### appended after the 15 program files (all 58 files reached)

## Corrected (cont.)
- `content/niwot/programs/niwot-youth-sports.md` — price: "recreational soccer was $155 last spring" → "…$155 in the spring 2025 season, the latest its soccer page lists" (the page is headed "2025 Spring Season", not spring 2026). Basketball fees, Dec 1 deadline, grades, YMCA NoCo, March 6 tournament all confirmed — source: https://www.niwotyouthsports.org/sports/soccer/ and /sports/basketball/recreational-basketball/

## Stale dated content fixed (cont.)
- `content/niwot/programs/niwot-business-association.md` — `nextEvent: great-pumpkin-party` (31 October, past) → `nextEvent: enchanted-evening` (27 November) — source: the file's own dates (file NOT stamped; see Unverified)
- `content/niwot/programs/longmont-library-storytimes.md`, `niwot-elementary-preschool.md` — "read October 26, 2026" → "November 10, 2026" after re-reading every cited page.

## Confirmed unchanged (cont.)
programs: longmont-library-storytimes, niwot-elementary-preschool (+ niwot-youth-sports stamped with the fix)

## Unverified, left unchanged (cont.)
- `content/niwot/places/niwot-inn.md` — update to the entry above: the address "342 Second Avenue" IS on a primary page (Boulder County's NLIDAC event page: "Niwot Inn Conference Room, 342 Second Avenue, Niwot"); what remains unread is only "the only place to stay on Second Avenue / the one hotel in Niwot". Left unstamped.
- `content/niwot/programs/left-hand-grange.md` — the "Niwot Hall Next Century Project… donate page but no current status" sentence — tried: niwothall.org/join/ confirms $50 / $100 couple, 10% off one rental, "always welcome", PO Box 301; /calendar/ confirms "Niwot Hall Meeting" 4:30–6 pm on the 2nd Wednesday. "Next Century" appears on neither page.
- `content/niwot/programs/lid-advisory-committee.md` — "$5,885… $9,201" (Courier, robots-disallowed) and "the agenda for November 2 to 13 lists no Niwot LID meeting" — tried: the County series page and the 1 December event page confirm first Tuesday, 7–9 pm, Niwot Inn Conference Room, 342 Second Avenue, the two-week advance agenda note, and December 1 as next.
- `content/niwot/programs/niwot-business-association.md` — which events the NBA runs, the "This Week in Niwot" email — tried: niwot.com/business-in-niwot/ confirms the boundary rule, Join Now, monthly meetings, ribbon cuttings, discounted sponsorship; niwothall.org/calendar/ confirms "NBA Monthly Meeting" 8:30–10 am on Tuesday the 10th.
- `content/niwot/programs/niwot-community-association.md` — "National Night Out… and the tractor show", "all-volunteer… of households" — tried: niwot.org /membership/, /about/, /meetings/, home: confirm $30, March 1–February 28, PayPal/Venmo, established 1990, quarterly updates, May cleanup, parade and ice cream socials, veterans' banners, board 2nd Wednesday 7 pm at Niwot Hall, public welcome, a week's notice for the agenda, April annual meeting for members.
- `content/niwot/programs/niwot-community-connection.md` — "by three residents" (Courier), the contact email (Cloudflare-obfuscated on the page) — tried: niwot.com listing confirms 50 and older, established October 2021, "over 540 members", free, the interest-group list; hall calendar shows "Niwot Community Connection (Downstairs)" 9 am–12 pm.
- `content/niwot/programs/niwot-cultural-arts-association.md` — whole listing — tried: niwotarts.org is robots-disallowed; no other primary source for the $275,000 goal or the 2009 founding.
- `content/niwot/programs/niwot-elementary-childcare.md` — the late-start dates "November 4 and December 2" — tried: the school's childcare page confirms every hour, age and fee as filed (7 am–6 pm, 7:30–5:30, $16/$20, $32/$40, $45/$55, 2-day minimum, $50/$75, $30 late start, non-school-day sites about a month ahead); the district calendar PDF confirms 2.5-hour late starts but its dates are colour-coded cells that do not survive text extraction.
- `content/niwot/programs/niwot-elementary-ptac.md` — "the Niwot Trot 5K in October, which funds it", "The haunted house… is the high school's Key Club" — tried: niwotptac.com home and /volunteering.html confirm the 2026–27 board, minutes, community nights, carnival, spirit wear, King Soopers rewards, interest form, committees, and the "so many ways to help" quote.
- `content/niwot/programs/niwot-historical-society.md` — "lectures $5 for non-members", "October 21 talk… Niwot Cemetery", "150-year timeline" — tried: /join-and-give/ (first try HTTP 429, second OK) confirms $15 / $25, free lectures and the Niwot Gazette for members, the volunteer list and "a little or a lot". Did not request more pages from a site already rate-limiting.
- `content/niwot/programs/niwot-schools.md` — "tours every Tuesday and Thursday at 1:30" — tried: nhs.svvsd.org home (no tour line today; it shows an information night on Tuesday 10 November, drop-in 7:00–8:30, Commons); svvsd.org home confirms "Open enrollment December 1 – 15"; the district calendar PDF confirms Thanksgiving break Nov 23–27, winter break Dec 21–Jan 1, spring break Mar 15–19.
- `content/niwot/programs/rotary-club-of-niwot.md` — "the November 26 Thursday is a committee meeting at Old Oak Coffeehouse" — tried: niwotrotary.org /page/become-a-member confirms most Thursdays 7:30–8:30 am at Niwot Hall, the membership types, the four fundraisers; the club home page shows no November calendar in its HTML. Note 26 November 2026 is Thanksgiving Day.
- `content/niwot/programs/scouts-troop-161.md` — "chartered by the Grange for more than fifty years", "girls' troop since 2021", ages 11 to 17 — tried: niwothall.org/calendar/ confirms "Boy Scouts Troop 161 Meeting" Mondays 6–9 pm (Nov 2, 9); the history is from the Courier (robots-disallowed).

## Totals
58 files reached (43 places, 15 programs). Stamped 2026-11-10: 28 (25 places, 3 programs), of which 6 carry a content fix (love-ice-cream, niwot-market-deli, wise-buys-antiques, fortezza-ristorante, niwot-loop-trail, niwot-youth-sports). Left unstamped with a precise note: 30 (18 places, 12 programs); two of those had a stale-date fix only (niwot-childrens-park, niwot-business-association). One correction file added: `content/niwot/corrections/2026-11-10-niwot-loop-trail.md`. `npm run validate`: 0 errors.

## For the lead
- Niwot Loop Trail closure: Boulder County announced a winter closure of the Niwot Loop Trailhead and trail for two bridge repairs, dates to be announced (https://bouldercounty.gov/open-space/parks-and-trails/niwot-trails/). The place file now says so; this deserves an `updates/` entry (not written: outside this part's remit).
- Policy note: 30 files are unstamped only because one secondary sentence (an opening year, a patio, a Courier-sourced detail) is not on any page I could read; in almost all of them the name, address, phone and hours were re-confirmed today (details per line above). If the owner accepts stamping on listing fields alone, those can be stamped from this report without re-reading.
- Three listings rest entirely on niwotarts.org (gateway-sculpture, niwot-childrens-park, niwot-sculpture-park, plus programs/niwot-cultural-arts-association) and one on lhvc.com (fly-away-home); both sites disallow automated reads, so they need a human read.
- `places/fans-chinese-cuisine.md` (Vercel bot checkpoint) and `places/garden-gate-cafe.md` own site (Cloudflare challenge) also need a human read.
- `places/niwot-market.md`: the market's hours widget shows only today's hours; a human glance at the weekly dropdown would settle "daily".
- `places/inkberry-books.md`: niwot.com lists Friday 10–5, the shop's own site Friday 10–3; file follows the shop.
- `places/fritz-family-brewers.md` body still says "as read in September 2026" (hours re-confirmed today; sentence left because the file was not stamped).
- `places/niwot-veterinary-clinic.md`: the clinic's notice says "until March 15th" with no year; the listing will need closing out then.
- `events/niwot-local-improvement-district-advisory-committee-meeting-2026-11-17.md` exists, but the County series page lists no 17 November meeting (next is 1 December) — events are another part's; worth a look.
- `programs/rotary-club-of-niwot.md` says a committee meeting falls on 26 November, which is Thanksgiving Day.
