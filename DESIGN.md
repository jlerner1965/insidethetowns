# Inside the Towns: the design

This file is the design of insidethetowns.com: its pages, their order, and their look.
**Anything not written here does not change.** Every Claude Code brief that touches a page
follows this file. If a brief and this file disagree, this file wins.

- **Reference mockup:** [Inside the Towns mockup](https://claude.ai/artifact/TLmZDNW6fMuCekNfFd3YfN) (20 November 2026), built from this repo's content.
- **Frozen until:** 15 January 2027. Until then, fix only what is broken or wrong. New ideas go to *Later* at the bottom, not into a mockup.
- **On that date:** look once at what readers did (search clicks by page, visits by town, what people searched for). Change only what that points to, then set the next date here.
- **Retired:** the "Inside the Towns navigation redesign" canvas and every earlier home or town mockup. They are history, not instructions.

## Look

| Use | Value |
|---|---|
| Page | warm paper `#F7F5F0` |
| Text / secondary text | `#243137` / `#46545B` |
| Links, buttons, selected filters, the active tab | slate blue `#24455D` |
| Quiet emphasis (season labels, "Today", confirmed status) | sage `#7A8A6B` |
| Lines between rows | hairline `#DAD7D0` |
| "Not announced yet" square, "Our pick" | amber `#F0A62E`, as a fill under ink, never as text |
| A town's own color | only the thin rule above its name on its own page |

No other colors. Headings (page titles, section titles, article headlines) in **Fraunces**; everything else, including event and place names in rows, in **Instrument Sans**. Values come from `src/config/palette.ts` and `src/config/towns/hub.ts`.

- **Type sizes:** 13, 15, 17 (body), 20, 26, 34, 46 px; page titles 36 px on phones.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64 px.
- **Touch targets:** at least 44 px.

## One of each, on every page

- **Masthead:** the wordmark, then *This weekend · Annual events · Towns A–Z · Articles*, and a *Thursday email* button. On phones: the wordmark and *Menu*.
- **Footer:** About · How we check listings · Report a correction · Photo credits · Privacy · Instagram.
- **Buttons:** filled slate blue for the main action, slate outline for the others. Filters look like the outline button; the selected one is filled.
- **Dates:** "Fri, Nov 20", with the time on the line below. Today's date gets a small sage "Today" above it.
- **Sources:** "Checked Nov 19 · *Organizer's name*", in small text beside the thing that was checked. Nowhere else does the page say it checks things.
- **Photos:** a caption, then "Photo: *credit*" when the photo has one.
- **Rows** for calendars, listings and places. **Photos** only on stories and on places where the picture helps someone choose.

## The pages, top to bottom

1. **Home:** the town box (finds any town), then the town guides as buttons; the Flatirons photo beside it on desktop only. Then *Coming up*: the next date in each season (tree lightings, turkey trots, parades of lights…). Then *This weekend* (five rows, then "All N listings"), *Latest articles* (one with a photo, three as rows), *The Thursday email*. On a 390 × 844 phone the first *Coming up* event's name, town and date show without scrolling.
2. **Town page:** the same template for the 11 guides and every hub town.
   - At the top: Towns A–Z link, the color rule, the name, its counties, **one sentence about the place** (used once on the page), and *Events · Places to eat · Open town map*.
   - Then the tabs, always these names in this order: *Overview · Events · Eat & drink · Things to do · Map · Articles*. A town hides a tab it has nothing for; hub towns call *Events* "Dates". On phones the row scrolls and *All sections* stays pinned at its right end.
   - Then the town's lead, its most useful local information: Berthoud *Rec Center hours*, Johnstown *Friday's game*, Estes Park *Park entry*, Leadville *Mineral Belt Trail*, and so on. The lead's content changes with the season; its place on the page doesn't.
   - Then: Events (next eight, one-time and annual together), Places to eat, Parks and trails, Map, Articles.
3. **This weekend:** the title and the dates, then one filter row: *Day* (All, Fri, Sat, Sun) and *Town* (only towns with listings, with their counts). Then the listings by day: time, event name (linked to the organizer), town, venue, price when known, checked date. Multi-day events go last under *On all weekend*.
4. **Annual tracker (one per season):** the title and "N dates to come in N towns". Then *Next*: date, time, event, town, place, status, source. Then *Filter by town* and the rows: date, time, town, event, status (Confirmed, Not announced, Canceled), checked date and source. Background goes inside each row's *About this event*, after the dates. Then *Date not announced yet*, *Canceled this year*, *Already held this year*.
5. **Towns A–Z:** one search field for a town or county. Typing "Salida" leaves Salida, and Enter opens it. Then A to Z, each town with its counties and area; the 11 guides carry a *Guide* tag.
6. **Article:** the kicker, headline, date (and "Updated" date, sources count), the photo and credit, the opening paragraph set larger, then *Plan it*: the town page and its next dates. Then the story; the sources fold at the end.

## Words

Labels say what readers look for: "Rec Center hours", "Parade time", "Places to eat", "Open town map". One introduction per page. No promises that repeat what the source lines already show, and no text that explains an obvious button.

## Done means

On a phone (320 and 390 px), a tablet (768) and a laptop (1366):

- From the home page, the next tree lighting is one tap away.
- From the Berthoud page, the Rec Center hours are under the top block.
- From Towns A–Z, "Salida" plus Enter opens Salida.
- Every town filter shows only that town; no page scrolls sideways; *All sections* stays visible on a 320 px phone; a tab or link never lands its heading under the sticky bars.

## Later

Ideas wait here until the review date.

- 
