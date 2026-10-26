# Design pass, 26 October 2026

The owner's brief of 26 October: audit and implement the design proposal
of the same day ("Inside the Towns Design Proposal"), keeping the design
system and applying his revisions; check the repository before accepting
the proposal's claims; do it, verify it, report it. This file is the
record: what stayed, what changed, where the proposal was overruled and
why, the visual rules the pages now follow, and what was verified.

## What stayed

- Fraunces and Instrument Sans; the primary, accent and shared papers of
  Color System 2.0 (`src/config/palette.ts`); the contrast checks
  (`npm run check-colors`); the accent rule under section headings; the
  category colours.
- Every URL, every title, description, canonical and JSON-LD block (the
  Niwot build before and after has the same 120 routes and identical
  metadata on every home, section, place, event and article page).
- The content, the schemas, the integrations (Buttondown, Formspree,
  MaxPreps, LibCal), the licensed photography and its credits.
- Facts-first mobile detail pages; article widths, sources and tables of
  contents; the shared components and town config; the sports pages and
  the school identity on them.

## What changed

**Stage 1, the chrome and the type.** One paper masthead on every page of
every guide (`Header.astro`): wordmark, sentence-case menu from
`src/lib/nav.ts`, the town switcher, search, and on a guide the email
covers a small "Thursday email" link to the hub's signup with the town
ticked. The flagship guides' dark interior band and their home-page
school band are gone. One footer (`Footer.astro`); the home variant is
gone. The supporting-text floor is 14px (0.875rem) where it was 13px.
Fact lists on place, event and moving-here pages are `<dl class="facts">`
with sentence-case labels at 15px. A place page opens on its open-or-closed
status by the published hours, or "Check current hours" with the
business's own link where the guide has no hours; an event page opens on
its day, time and venue. One correction path: `Provenance.astro` carries
the checked date, the source, "Report a correction" (to `/correct/` with
the listing named) and, for a place with someone to run it, one owner
line. The compact provenance under directory rows is gone.

**Stage 2, the home page.** One `TownHome.astro` for every guide, replacing
`ClassicHome` and `FlagshipHome` (and `HomeMasthead`, `flagship-home.css`,
`home-flagship.astro`). `Hero.astro` has no minimum height and three
actions (This week, Eat & drink or Things to do, Living here or Moving
here); the name is 4.25rem on a desktop, not 6rem. `Scoreboard.astro` is
the school's strip on its band: latest result and next game, sport,
opponent, day, final or upcoming, the day the file was read; two rows on a
phone. `WeekAgenda.astro` is seven days from today, each under its full
date, Today and Tomorrow named only where they are those days, "No events
listed" on an empty day, a called-off listing kept and labelled, the
editor's pick labelled. Things to know beside the one email card where
the guide has updates or the email covers it; then places, the latest
articles, what the guide covers, and a close: resident guides (`home` in
the config) end on Add an event, Suggest an update and Resident resources;
the others on Moving here.

**Stage 3, lists and the hub.** The events page leads with a labelled
Highlights section (four by the home page's ranking) where the fortnight
has eight or more listings, then the full list by day; its intro says
"What's listed", not "Everything on". The filter bar shows what is set and
"Clear filters" whenever a filter is on; on a phone the category and town
rows fold behind "Filter by type" and open on their own from a shared
link. The hub lists the towns in a grid of three under their regions, with
the map after them, not sticky beside a single column.

## Where the proposal was modified, and why

- **Events default.** The proposal hid library programs and meetings
  behind a default-off checkbox. Not done: the owner's rule is that
  nothing is hidden. The page leads with a small Highlights selection and
  shows everything, with the existing distinct filters.
- **Scoreboard.** The proposal moved the flagship masthead's scoreboard to
  the sports page. The sports page already carried the full scoreboard;
  the home page keeps a compact strip instead, in the school's colours.
- **The "Stay" page.** Not added; lodging stays under Things to do.
- **Accent tints for photo-less places.** Not done: a photo-less place is a
  text row (`PlaceIndex`), never a coloured tile.
- **Hub.** The proposal put the directory in a tighter grid beside the
  map; the map goes after the grid instead, so it never pushes the names
  down, and stays hidden on a phone where its labels cannot be tapped.
- **"Checked every week."** Not written anywhere; the pages carry the real
  checked date.

## Visual rules

1. **Accent rule.** The accent colour draws the rule under a section
   heading (`SectionHeader`) and the top stripe of the masthead. It is not
   a text colour, not a background and not a border on a card.
2. **Town accent vs category colour.** The town's primary and accent are
   the guide's; the category dot and eyebrow colours
   (`--cat-<category>-dot/ink`) are the listing's and never the town's.
   A place's type takes the hue in `PLACE_HUE`.
3. **School colour.** Only the home-page scoreboard and the sports pages
   are on the school's band, proven at 7:1 under white by
   `check-colors`. Nothing else is.
4. **Editorial vs warning.** "Our pick" and "Highlight" are amber
   (`bg-highlight-soft` with a `ring-highlight`, ink text). "Canceled" and
   "Postponed" are an ink-bordered label beside the title, with the date
   struck through on the event page. "Free" and "Away" are plain words in
   the meta line. The four are never one slot.
5. **Colour never carries meaning alone.** Every status is a word; every
   category has its label beside its dot; a link is underlined or in the
   primary at weight 600.
6. **Type sizes.** Body 17px on articles, 16px elsewhere; supporting text
   15px (`0.9375rem`) and never below 14px (`0.875rem`); eyebrows 12px
   uppercase, only on section headers, category tags and fact-list heads.
   Display headings scale 2.5rem / 3.25rem / 4.25rem (hero) and
   2.25rem / 3rem (sections) with the viewport.
7. **Long names wrap.** Headings use `overflow-wrap: anywhere` where a
   single word can exceed a phone's width (hero, day headings); nothing in
   a heading is `white-space: nowrap` except the masthead's menu row,
   which becomes a panel below 80rem.
8. **Sticky elements.** At most one sticky thing per page: the day heading
   on the events list and the filter bar on a directory. The masthead is
   not sticky, so nothing stacks.
9. **One form per page.** At most one embedded email form; the masthead
   carries the link. On the home page the form sits beside Things to know;
   elsewhere it follows the main content. Never a closing form.
10. **Photographs.** A card is for a photograph; a place without one is a
    row. The hero's photograph is the town's and keeps its credit.

## Verified

- `npm test` (500 tests), `npm run validate` (2,379 entries, 0 errors),
  `npm run check-colors`, `astro check` (0 errors).
- Builds: Niwot, Berthoud, Lyons, Erie, Johnstown, the hub, Carbon
  Valley (multi-town), Loveland (four schools), Nederland (sparse),
  Severance (holding page).
- Rendered at 320, 390, 768 and 1440 px: no horizontal overflow on home,
  events, eat-drink, this-week, moving-here and sports.
- Keyboard: skip link, wordmark, search, every menu item, the town
  switcher (Enter opens, Escape closes and returns focus), the email
  link, then the hero's three buttons, each with a visible 2px outline.
  Phone menu opens on Enter, moves focus into the panel, closes on Escape
  with focus back on the button.
- Filters: category, town and Free set the "Showing …" line and the URL,
  hide the Highlights, and "Clear filters" restores everything and puts
  focus on Anytime; a shared `?category=` link opens the phone fold.
- Newsletter: an invalid address is stopped by the field; a valid one with
  the request blocked shows the "finish in the new tab" panel and "Change
  your details" returns the form. No real subscription was sent.
- Text at 200% on a 390px phone: the home page has no overflow after
  fixes to the place index and the footer email; the events list's day
  numbers and a few long display headings still exceed the width by up
  to 68px (see Uncertain).
- Metadata and structured data: identical before and after on every
  Niwot page.

## Uncertain or left

- MaxPreps gives no word for a game called off or moved; the scoreboard
  and agenda cannot show one. A game that leaves the schedule leaves the
  page on the next read.
- Hours are a free-text line on many places (a lodge's "Check-in 4 pm");
  the page then says "Check current hours" with the business's link rather
  than inferring an open state.
- At 200% text on a phone, display headings with long single words and
  the events list's day numbers overflow by a few dozen pixels; a real
  browser zoom (which also narrows the viewport) does not show this.
- The design was validated on the ten builds above; the remaining guides
  share every changed component and config path, and the nightly rebuild
  carries the change to each once this is merged.
