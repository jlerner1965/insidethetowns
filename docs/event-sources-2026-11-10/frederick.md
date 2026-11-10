# Frederick (Carbon Valley): event sources, second pass, 10 November 2026

Six entries appended to content/frederick/sources.json, all `proposed`, `robots: honor`. No existing entry changed. `npm run validate` could not run (node_modules is absent: "Cannot find package 'astro'"); nothing was installed. The file parses as JSON in the existing format; new entries use only schema fields and enum values.

## 1. Sources

| Source | Kind | Feed | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Coal Ridge Middle School (`crms-svvsd-org`), 6201 Booth Dr, Firestone | school stage | ical, Google Calendar `svvsd.org_2d3139363534373231313035@resource.calendar.google.com` | 6 concerts on 3 evenings (choir 1 Dec, orchestra 3 Dec, band 10 Dec); 48 items in window, 4,394 in feed | 20 title exclusions (practice, club, basketball, auditions, "Combined", etc.); default venue | Google robots rule: needs `robots: subscribe` |
| Thunder Valley K-8 (`tvk8-svvsd-org`), 600 5th St, Frederick | school stage | ical, Google Calendar `c_umjia982kts6g0otn74ad8jekc@group.calendar.google.com` | 1 (Soaring Singers Concert, 7 Dec); 16 in window, 559 in feed | 12 title exclusions; default venue | same |
| IMI Motorsports Complex (`imimotorsports-com`), 5074 Summit Blvd, Dacono | dirt track | json, `imimotorsports.com/wp-json/tribe/events/v1/events` | 0 (calendar unused since 11 Oct 2025; 32 past items) | default venue (items have none) | Track posts elsewhere: allevents.in shows "Driftsgiving" 22 Nov, absent from its own calendar |
| Carbon Valley Half Marathon & 5K (`cvhalfmarathon-org`) | race | none, manual | 0 (race is 8 May 2027, Centennial Park, Frederick) | none | one date a year |
| MeCo Coffee Collective, 318 Fifth St, Frederick (`mecocoffee-com`) | coffee shop: open mic, workshops | none, manual | 3 one-offs (suncatcher workshop 15 Nov, candle pouring 7 Dec, cookie swap 10 Dec) plus open mic (2nd and last Sundays: a regular) | none | Own site is private (401) and its robots.txt shuts out ClaudeBot; dates came from allevents.in only, unconfirmed |
| Mountain Cowboy Brewing, 302 Fifth St, Frederick (`mountaincowboybrewing-com`) | brewery | none, manual | not counted | none | robots.txt names ClaudeBot, anthropic-ai, Claude-Web `Disallow: /`; not crawled. Address from Colorado Brewery List only |

## 2. Turn on first

1. Coal Ridge Middle School: about 6 a month in concert season, if school concerts are wanted (same call as Frederick High).
2. Thunder Valley K-8: 1 to 2 a month.
3. MeCo Coffee by hand (Facebook): 3 to 5 a month, the only downtown room found with a changing calendar.
4. IMI Motorsports and the half marathon: nothing now; race days from spring.

Total now: roughly 8 to 12 listings a month, 7 of them school concerts. Honest reading: Carbon Valley has no music room, theatre, cinema, gallery or bookshop with a calendar; the first pass already has what feeds exist.

## 3. Looked for and ruled out

- Yellow Scene Magazine events (yellowscene.com/events/feed/, RSS, 50 items): none in Frederick, Firestone or Dacono; all Jamestown, Nederland, Denver, Arvada. Possibly useful to the Nederland guide.
- En Face Studios (dance, 7073 Colorado Blvd, Frederick): Events Calendar installed, REST and iCal both empty; "Nutcracker Night Out" 12 Dec is a paid kids' drop-off, not a performance.
- Georgia Boys BBQ (Frederick): no events page (404), no music listed.
- Saddleback Golf Club (Firestone): no calendar; tournaments by enquiry.
- Peppers Fireside Grille: Cloudflare challenge (403) on every path including robots.txt; not read.
- Magical Moments (142 6th St, Frederick; a princess tea 12 Dec on allevents): site is an "under construction" page.
- Firestone Charter Academy (Winter Market 5 Dec on allevents): site answers 503.
- CPW events for St. Vrain State Park: cpw.state.co.us/events answers 403; park page links only statewide free-entry days (already in registry).
- Community theatre, orchestra, choir, gallery, cinema, bookshop, winery, farmers market in the three towns: four searches found none.

## 4. Fetched despite a robots rule

- calendar.google.com: `https://calendar.google.com/calendar/ical/svvsd.org_2d3139363534373231313035%40resource.calendar.google.com/public/basic.ics` (once)
- calendar.google.com: `https://calendar.google.com/calendar/ical/c_umjia982kts6g0otn74ad8jekc%40group.calendar.google.com/public/basic.ics` (once)

## 5. What a resident would say

- The Carbon Valley Half Marathon's own site says the 2027 race has moved to Frederick and that the course passes "the town's growing collection of handcrafted wood carvings" (cvhalfmarathon.org); the chainsaw carvings are a thing the guide could name.
- The open mic host (4Tell, on allevents.in) bills it "ALL TALENTS AND GENRES WELCOME", second and last Sunday at MeCo: the nearest thing downtown Frederick has to a music night in winter.
