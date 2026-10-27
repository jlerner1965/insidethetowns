# Design revisions, 27 October 2026

The owner's critique of 26 October, written over the Berthoud guide after
the design pass of that day (docs/archive/DESIGN-PASS-2026-10-26.md), applied to
the shared components, so every guide gets the same changes. Nothing here
touches the design system, a URL or any metadata.

## Home page (`TownHome.astro`)

- **A third less space between the school's strip and the week.** The
  agenda is on a `band-close` band (2.75rem / 4rem above, the full
  4rem / 6rem below) when a strip precedes it. The week and the games are
  one subject; every change of subject keeps the full band.
- **The town's own stories before the neighbours'.** "From the guide"
  follows "Where to go"; "Nearby this weekend" is its own band after it,
  drawn only when the neighbours have something on.
- **"What Inside Berthoud covers" is a short band of links**
  (`band-compact`, "More of Inside Berthoud"): the pages in a four-column
  grid, no copy under them. The lines of copy repeated the menu, the footer
  and the pages' own introductions.
- **One invitation.** The resident close is a sentence or two with Add an
  event, Suggest an update and resident resources as links in it, where it
  was three cards with copy. Visitor guides keep the moving-here close.
- **"Eat, drink, wander" shows what it says.** Three picks: one place to
  eat or drink (restaurant, bar, coffee), one outdoors (trail, trailhead,
  park), one of the town's culture (venue). Within a kind: the editor's
  pick with a photograph, then any photograph, then the editor's pick. A
  guide short of a kind fills the three from the rest. A pick without a
  photograph (Berthoud has no licensed photograph of a café or a brewery)
  is a panel on the paper with its whole summary, address and hours
  (`PlaceCard`): words, not a coloured tile. The eight rows under it are
  unchanged.
- **Neighbours' names as plain labels.** `NetworkEventCard` takes
  `neutral`; `NearbyWeekend` sets it on every guide's page, so the
  lozenges in Loveland's, Longmont's and Johnstown's colours are gone from
  a Berthoud page. The hub keeps the colours, where the towns are the
  subject. A town's line ("Main Street, the St. Vrain Greenway and the
  breweries") is under its first pick only, not every one.
- **The email once.** The agenda no longer lists "Thursday email" as an
  item on its day, and the nearby block's "Get your nearby towns every
  Thursday" link is off on a page that has the form (home, events). The
  home page offers the email in the card beside Things to know and in the
  masthead link, as the rule of 26 October says.

## Events page (`events/index.astro`, `EventFilters.astro`)

- **Shorter introduction, one action row.** "What's listed in Berthoud:
  the next two weeks, then further out, and the weekly regulars." Then
  Submit an event and Subscribe to calendar as outline buttons, with "Just
  the weekend?" and the refresh date in small type beside them.
- **The town's listings first, uninterrupted.** The order is the next
  fourteen days, big dates, further out, every week, then the email's form,
  then Nearby this weekend. The form and the neighbours used to sit between
  the fortnight and "Further out".
- **"Show the weekly regulars on their days."** A labelled switch under the
  filters, off by default, kept in the URL as `?regulars=1`. On, the
  regulars' dates join the list by day (the rows a date filter already
  brings out) and "Every week" steps aside with its chip in the day strip,
  so Monday on the events page is Monday on the home page. A run's later
  nights stay held. The rule is `eventRowShown` in `src/lib/filters.ts`,
  tested in `test/calendar-reliability.test.ts`.

## Duplicated details

- The home agenda's meta line said a long time note twice ("Sessions at
  2:30 and 6:30 pm · Sessions at 2:30 and 6:30 pm · the library"):
  `eventItem` in `src/lib/flagship-home.ts` now builds it from the parts.
- An events-page row with a long note whose first clause fits the time
  column ("From 3 pm; live music 6–8:30 pm") said the whole note again on
  the line under the title on a wide screen; the line carries the rest of
  the note now ("live music 6–8:30 pm").

## Not done

- **Hero photographs.** Not swapped: the repository holds no better real
  photograph of Berthoud than the Carter Lake one in use, and the owner's
  own confidence in that change is moderate until one exists.

## Verified

`npm test` (565 tests), `TOWN=berthoud astro check` (0 errors), the
Berthoud build; the switch exercised in a browser (on: 19 regular rows
shown, the directory and its chip hidden, the URL updated; from a
`?regulars=1` link the same; with Today the date rule still decides).
Before and after screenshots: `/mnt/project-files/design/berthoud-before/`
and `berthoud-after/`.
