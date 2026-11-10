# Berthoud: event sources, 10 November 2026

About 25 candidates checked; one new feed. Only content/berthoud/sources.json edited, all `proposed`, `npm run validate` passes.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Wildfire Community Arts Center (existing entry `tockify-com`, now typed ical) | arts centre, 425 Massachusetts Ave | ical, https://tockify.com/api/feeds/ics/wildfire | 2 of 71 (Soundbath 20 Nov, Drum Circle 4 Dec; both already entered by hand). 66 regulars (classes), 3 never-list | 15 excludeTitles for classes, private parties, board meeting; defaultVenue | Tockify robots.txt disallows /api/: needs `robots: subscribe` |
| Berthoud Historical Society (existing `berthoudhistoricalsociety-org`, notes only) | museum, talks | ical already recorded (category "event") | 4 of 4 | none | The "event" filter misses The Bells of Berthoud Ring (13, 20, 24 Dec); the unfiltered list feed has 7. feedUrl left alone for the owner |
| Little Thompson Observatory (new `starkids-org`) | observatory at the high school, 850 Spartan Ave | manual. Its ai1ec feed is a reservation calendar | 1 (Special Public Star Night, Fri 20 Nov, Jeff Bennett talk). Third Friday monthly, next 18 Dec | n/a | 416 of 592 feed items are private group bookings; feed path disallowed by robots |
| Homestead Fine Art Gallery (new `berthoudart-com`) | gallery, 344 Mountain Ave | manual (Squarespace events) | 0 new (its one item is A Very Merry Berthoud, 5 Dec) | none | ingest cannot read Squarespace; ?format=json disallowed |
| Berthoud Main Street, downtownberthoud.org, Parade of Lights (existing, notes only) | annual events | none; hand-written pages | 2, already in the guide | none | no feed exists |
| Berthoud High School (existing, notes only) | school | published ICS files exist but are empty | 0 | none | plays and concerts have no dated page; athletics on arbiterlive.com, not read |

## 2. Turn on first

1. Wildfire's Tockify feed, with `robots: subscribe` and the exclusions: about 2 or 3 a month (soundbath, drum circle, one-off workshops, later the StreetFest), replacing what is now typed by hand.
2. Historical Society iCal, ideally the unfiltered list feed: 4 to 7 a month in season.
3. Observatory public star night by hand: 1 a month.

Roughly 7 to 10 listings a month together, about half already entered by hand. I found no untapped music room or theatre in Berthoud.

## 3. Looked for and ruled out

- Berthoud Brewing (berthoudbrewing.com, SpotHopper): events page holds a Thanksgiving closure and "National Pizza Day".
- Northern Water, 220 Water Ave: calendar is board and committee meetings and office closures.
- Arcana House: Acuity booking for weekly meditation and classes, all regulars.
- Berthoud Fire: request forms, no calendar.
- TPC Colorado (tpc.com/colorado): private outings; no public calendar.
- Larimer County natural resources events: a headless browser met a Cloudflare check; the items visible are not at Carter Lake.
- Grace Place and Berthoud UMC: church calendars, no public concert listing.
- Eventbrite's Berthoud page: one Berthoud item (Long Shadow Farm turkey reservations).
- Joyful Brews, Siren House, Rise Artisan Bread, Cobblestone Corner, Hays Market (/events/ is 404): no events pages.
- berthoudoktoberfest.com: now a spam blog (adult-cam posts), not the festival.
- berthoudflapjackday.com redirects to City Star's page; berthoudsnowfest.com redirects to a missing Main Street page.
- Not crawled, robots names ClaudeBot with Disallow /: berthoudsurveyor.com (the weekly community calendar), berthoudcolorado.com (the chamber), bandsintown.com.
- Unreachable: berthoudlocal.org, berthoudday.com, berthoudbash.com, hopsandharley.com, kofehouse.com, trailhead.cafe (403). Parked: rockinsranch.com, whistlestoptavern.com.

## 4. Fetched despite a robots rule

- tockify.com: https://tockify.com/api/feeds/ics/wildfire (once).
- www.starkids.org: https://www.starkids.org/?plugin=all-in-one-event-calendar&controller=ai1ec_exporter_controller&action=export_events&no_html=true&ai1ec_cat_ids=12,16,15,23,18 (once).
- By mistake: https://www.berthoudcolorado.com/ home page, once (1 KB returned), before my script had parsed its robots.txt, which disallows ClaudeBot. Nothing from it was used.

## 5. What a resident would say

- The observatory holds a public star night on the third Friday of every month except July, with a speaker, then telescopes (starkids.org feed and Special Events page).
- The Bells of Berthoud ring at Fickel Park at 5:30 pm on 13, 20 and 24 December (Historical Society feed).
