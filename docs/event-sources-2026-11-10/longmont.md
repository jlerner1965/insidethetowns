# Longmont: event sources, 10 November 2026

15 entries added (all `proposed`, `honor`); 4 existing extended (Firehouse: feed added, typed ical; Longmont Theatre, St. Vrain Historical, Dickens: notes only). `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Bricks on Main | music bar, 471 Main | none (Wix); html, events are JSON inside the page | 12 named acts to 1 Dec (about 17 a month) + 6 open mic / blues jam | none | no Wix reader; by hand |
| Left Hand Tasting Room | brewery | none; html, 3 pages | 11 (music, comedy, 5K, book swap) | skip trivia, vinyl, nerd night, drives | by hand |
| Kuper Wine Bar | wine bar | json: kuperwinebar.com/wp-json/tribe/events/v1/events | 5 of 26 | RC Tasting, Half Price Bottle, Happy Hour, CLOSED, Trivia, Pilates | none |
| Firehouse Art Center (existing) | gallery | ical: Google Calendar r5a1ofr4s6d7mvuicgvq36l6tc@group… | 4 (two openings, Holiday Market, Color Curious) + poetry night | 21 exclusions (gallery hours, classes, rentals) | needs `robots: subscribe`; Holiday Market is titled "GALLERY HOURS…" |
| Dry Land Distillers | distillery | none (The Shop Calendar widget) ; manual | 5 | none | browser only |
| St. Vrain Cidery | cidery, 350 Terry | Squarespace; html | 4 + 8 yoga/workshops | by title prefix | ingest cannot read Squarespace |
| Jesters Dinner Theatre | dinner theatre | none; manual | 4 productions, about 18 nights | none | script-only site, runs not nights |
| Oskar Blues (Longmont) | brewery | html (RSS has post dates, mixes Brevard NC) | 4 | food trucks, class | by hand |
| 300 Suns Brewing | brewery | html (RSS has post dates) | 3 | happy hour | by hand |
| Longmont High School | school stage | ical: Google Calendar cajg17r5…@import… | 3 stage + 2 home varsity | 13 exclusions + location filter | needs `robots: subscribe`; dry run first |
| Longmont Public Media | makerspace | ical: longmontpublicmedia.org/?mec-ical-feed=1 | 2 | tours, orientations, classes | none |
| Longs Peak Chorus | barbershop chorus | rss: longspeakchorus.org/dbaction.php?action=rss&dbase=events | 2 (5 Dec shows) | Rehearsal, Loveland Show | feed has no time or venue |
| Parkway Food Hall | food hall | json: parkwayfoodhall.com/wp-json/tribe/events/v1/events | 2 of 18 | Geeks Who Drink, Karaoke | no venue on items |
| Grossen Bart Brewery | brewery | json: grossenbart.com/wp-json/tribe/events/v1/events | 1 of 47 | 9 exclusions | trivia items carry "UTC+0" |
| Longmont Chorale | choir | html | 1 (6 Dec) | none | monthly check |
| Longmont Youth Symphony | youth orchestra | Squarespace; html | 1 (15 Nov) | none | monthly check |

## 2. Turn on first

1. Kuper Wine Bar (feed, no robots question): 5.
2. Firehouse Art Center (feed, on `robots: subscribe`): 4 to 5.
3. Bricks on Main (by hand): about 17.
4. Left Hand Tasting Room (by hand): about 11.
5. Dry Land Distillers or Jesters (by hand): 5.

About 40 listings a month, only about 10 of them by feed; Longmont's best rooms publish pages, not feeds.

## 3. Looked for and ruled out

- Dickens Opera House: .com still 403; dickensoperahouse.co has an Events Calendar feed with 0 events in 2026.
- Longmont Theatre Company tickets (longmonttheatre.ludus.com): 403, blocks cloud hosts.
- Wibby Brewing: events page stale (October dates only).
- Abbott & Wallace Distilling: events page renders empty, even in a browser.
- Ya Ya Farm & Orchard: Events Calendar feed works, 9 items in 2026 (Applefest), none after October.
- Rosalee's Pizzeria: Events Calendar installed, 0 events.
- Pumphouse Brewery: TV sports schedule only. Outworld Brewing: "updating our events".
- Bootstrap Brewing, Barbed Wire Books, Shoes & Brews: no events page.
- Longmont Concert Band: next concert 14 March 2027. Centennial State Ballet: Nutcracker announced, no dates on the site.
- Skyline High School calendar: nothing public in the window.
- Muse Performance Space: it is in Lafayette.
- Sunflower Farm: robots.txt disallows AI agents (opt-out); its Google calendar is farm-school days.
- artwalklongmont.org: domain now redirects elsewhere. St. Vrain Historical Society: robots.txt disallows its events pages.
- No answer (reset or proxy 502; domains guessed): Longtucky Spirits, Collision, Brewmented, Times Collaborative, Ollin Farms, Mountain Fountain, Longmont Dance Theatre, Rocky Mountain Pumpkin Ranch.

## 4. Fetched despite a robots rule

All calendar.google.com (robots.txt: `Disallow: /`), public iCal, once each:
- Firehouse Art Center: …/ical/r5a1ofr4s6d7mvuicgvq36l6tc%40group.calendar.google.com/public/basic.ics
- Longmont High School: …/ical/cajg17r506kt1nhv94p6nh7ivbc84kjf%40import.calendar.google.com/public/basic.ics
- Skyline High School: …/ical/c_re0ps051ed8vu98864ut5o70c8%40group.calendar.google.com/public/basic.ics
- Sunflower Farm: …/ical/67bb6f6a…e8610e5b%40group.calendar.google.com/public/basic.ics

One mistake: sunflowerfarminfo.com's home page was fetched once although its robots.txt gives AI agents `Disallow: /` (my check missed it). Nothing more was read; no entry added.

## 5. For the guide

Nothing read worth quoting.
