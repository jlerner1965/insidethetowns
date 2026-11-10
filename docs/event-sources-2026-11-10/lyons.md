# Lyons: event sources, 10 November 2026

content/lyons/sources.json: 8 new entries (all `proposed`), notes appended to 4 existing proposed ones. Validate: 0 errors.

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters | Blockers |
|---|---|---|---|---|---|
| Lyons Middle Senior High (new, `lmshs-svvsd-org`) | school stage and gym | ical, Google Calendar `c_2a55ijpsj3lakhj6u9p82cr5ns@group.calendar.google.com` | 3 (home basketball 1 and 8 Dec, band concert 10 Dec); 8 never-list | AWAY, No School, `^MS `, meetings, Open House, Parade of Lights | Google robots: needs `robots: subscribe` |
| Oskar Blues Grill & Brew (new) | music room | none; manual | 5 seen second hand (Sunday Serenade 15 and 22 Nov, Country Rhythm Outfit 21 Nov, Sugar Britches 27 Nov, Crick Wooder 28 Nov) | none | Site is a Cloudflare 403, robots included; oskarblues.com and Bandsintown name ClaudeBot `Disallow: /` |
| MainStage Brewing (new) | brewery | none; manual. SociableKit widget of Facebook events (data.accentapi.com/feed/25613350.json) | 3 (Pottery with a Purpose 14 Nov, Lucky's Vegan Night 22 Nov, Christmas tree sale 27 to 29 Nov); 16 regulars | Trivia, Open Bluegrass Pick, Dice and Drafts, Teacher Appreciation, Running Club | Third-party JSON ingest cannot read; looks 3 weeks ahead |
| The Lyons Farmette (new) | farm: workshops, ticketed dinners | html (Squarespace) | 2 (Branch Weaving 15 Nov, Yin Workshop 6 Dec) | none | robots disallows `?format=json/ical`; ingest cannot read Squarespace |
| Spirit Hound Distillers (new) | distillery | none; manual | not counted | n/a | Event list is an AnyRoad widget; both AnyRoad hosts `Disallow: /` |
| Redstone Museum, Lyons Community Foundation, Old Man Winter Rally (3 new) | museum, organizer, race | html, no feed | 0 each (summer talks; Earth Day and Hootenanny; 7 Feb 2027) | none | none |
| The Rock Garden (existing) | beer garden stage | html (Squarespace) | 0 on its site; 1 on Facebook only (Arthur Lee Land, 15 Nov) | CLOSED FOR A PRIVATE EVENT | Squarespace; seasonal, May to Oct |
| Planet Bluegrass / Wildflower (existing) | concert hall, festivals | html, no feed | 0 (fall series ended 4 Nov) | none | none |
| Lyons Classic Pinball (existing) | arcade | html, no feed | 2, both already on the guide | league weeks, Monday repairs | none |
| Lyons Recorder (existing) | news calendar | not read | unknown | n/a | robots.txt `User-agent: * Disallow: /` (added 19 Nov 2024, deliberately) |

## 2. Turn on first

1. **Lyons Recorder calendar**: ask the Recorder. It looks like The Events Calendar (`/events/?ical=1` probably exists, unverified) and is the only route the Oskar Blues nights take to the guide.
2. **Oskar Blues by hand, weekly**: about 8 to 10 named acts a month, the biggest gap in the guide.
3. **Lyons Middle Senior High** (the only readable feed): 2 to 4 a month in season.
4. **MainStage by hand**: 3 a month now, more with summer bands.
5. **Lyons Farmette by hand**: 2 a month.

Together roughly 15 to 20 listings a month, only 2 to 4 of them from a feed.

## 3. Looked for and ruled out

- **A-Lodge calendar** (a-lodge.com/calendar, Modern Events Calendar): house shows and jams are at A-Lodge Boulder.
- **High Street Concerts**: site still says no shows since 2020.
- **Western Stars Gallery**: has The Events Calendar JSON, 3 items ever (fairy hair, face painting), 0 upcoming.
- **Stonebridge Farm CSA**: Events Calendar feed, 0 events in 2026.
- **Dandelion Arts Collective**: Squarespace; its events are at libraries in other towns; the Lyons one is already listed.
- **LEAF (leaflyons.org)**: blog only, no calendar.
- **Moxie Bread Co, 442 High St**: one regular only, Coffee n Tunes bluegrass jam, Sundays 11 to 1.
- **Pizza Bar 66**: robots names ClaudeBot `Disallow: /`; not read.
- **Lyons Chamber (lyonschamber.org)**: robots `Disallow: /` for all; not read.
- **Lyons Main Street (lyonsmainstreet.com, "2026 Calendar of Events")**: Cloudflare 403 on curl and WebFetch.
- **The Wayback Bar, 430 Main St** (jazz nights; Laurie D Jazz Duo 3 Dec per aggregator): no website found.
- **Lyons Garden Club** (annual cook-off and tour only), **mayamastudio.com** (parked), **Town events page** (same host as the confirmed feed).
- **happeningnext.com/lyons-co**: aggregator of Facebook events; useful for a person to scan, not a source.

## 4. Fetched despite a robots rule

- calendar.google.com: `https://calendar.google.com/calendar/ical/c_2a55ijpsj3lakhj6u9p82cr5ns%40group.calendar.google.com/public/basic.ics` (once).

Note: loading Spirit Hound's page in Playwright made the page request its AnyRoad widget (robots `Disallow: /`); that response was not read.

## 5. What a resident would say

- Moxie Bread Co's page: an open bluegrass jam every Sunday, 11 to 1, "all skill levels welcome" (moxiebreadco.com/events).
