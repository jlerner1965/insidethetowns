# Design audit, 22 October 2026: the nine guides that follow a high school

For James. The owner's notes of 22 October: the athletics pages should be
one design across every guide so the next school is a config entry; a guide
should wear its high school's colours, footer included; the family hub's
notes were hard to read; "Lyons is not Lions"; and both phone and desktop
should be launch-ready. This is what was found on every page of the nine
guides (Berthoud, Niwot, Lyons, Timnath, Elizabeth, Johnstown, Windsor,
Loveland, Carbon Valley) at 390 and 1440 px, and what was done.

## Done in this pass

### A guide wears its school's colour, masthead to footer

| Guide | School | Colour | Source |
|---|---|---|---|
| Berthoud | Spartans | #8F0018 maroon | MaxPreps team data (PR #188) |
| Niwot | Cougars | #007C47 green | MaxPreps, darkened 5% (PR #188) |
| Lyons | Lions | #022C66 navy | MaxPreps (PR #190) |
| Timnath | Cubs | #137495 blue | MaxPreps 1580A5, darkened 10% to clear the warm paper and the amber notice wash |
| Elizabeth | Cardinals | #8D181B red | the school's own site; MaxPreps's CC0022 is Loveland High's too, and a guide's primary is its own |
| Johnstown | Roughriders | #C41230 red | Roosevelt High's own site theme; MaxPreps carries only a placeholder black (222222) for the school |
| Windsor | Wizards | #6A1B32 maroon | the school's own site; MaxPreps's 8F0018 is Berthoud's |
| Loveland | Red Wolves | #BA0C2F red | Loveland High's own site; the city follows four schools and its namesake's red is the guide's |
| Carbon Valley | Golden Eagles | #1C2550 navy | Frederick High's own site; MaxPreps's 022C66 is Lyons' |

The town's `colors.primary` and the school's `colors.primary` in
`src/config/school-sports.ts` are the same value on every guide, so the
sports page, the masthead's links, the buttons and the footer are one
colour; `npm run check-colors` proves each against white, the paper, the
amber wash and the dark band. The favicons carry the new colours (cache
version bumped to v6). Timnath's accent is now the Cubs' gold: its old
reservoir blue sat on a blue primary.

The "random footer colour" was the old town palette (olive, saddle brown,
burgundy, teal, mulberry, graphite) under a sports page in the school's
colour. With the two the same, the footer matches on every page.

### The supporting ink

`INK_MUTED` was #526068, 6.0:1 on the warm paper: AA, but the owner found
a program card's notes ("Beginners welcome, the organizer says", the
contact line, the source line) hard to read. It is #46545B now, 7.2:1 on
the warm paper and 7.8:1 on white: AAA at any size. Every guide shares the
token, so every meta line, caption and label is darker by the same step.

### The sports page is one design

Every guide's `/sports/` is `src/routes/town/sports.astro` with no
per-town markup: the records strip, the next game in the school's band,
the scoreboard, one table per team, the footnote and the correction band.
What varies is config: the school, the mascot, the colour, the calendar
(or the line saying why there is none), the one-line note (Carbon
Valley's) and, for a town with several schools, the slug and the sister
links. Loveland's `/sports/` list is the only other template
(`sports-index.astro`).

To add a school: one entry in `SCHOOL_SPORTS` (school, mascot, MaxPreps
URL and name, colour, calendar or calendarNote, teams), the town's
`colors.primary` set to the same colour, the mascot in the third nav slot
(`[...DEFAULT_TOWN_NAV.slice(0, 2), { label, href: '/sports/' }, ...DEFAULT_TOWN_NAV.slice(2)]`),
the favicon recoloured, then `npm run check-colors`, `node --test`, and
the workflow dispatched for the town to write its data file. The test
`every school is one entry with its own file…` in `test/sports.test.ts`
holds the nav slot and the calendar-or-note rule.

### Lyons and the Lions

The owner read "The Lions' scores, schedules and records" under "Lyons
Middle/Senior High School sports" as a misspelling. It is not: the school's
own site (lmshs.svvsd.org) names its teams the Lions five times on its
home page, MaxPreps files the school as the Lyons Lions, and the Lions
Booster Club is at lyonslions.org. The page is left as it is. If the pair
reads badly, the nav pill could say "Lyons Lions" rather than "Lions";
that is a one-word config change.

## Checked and sound

- **Phone and desktop.** No horizontal overflow on any of the 50 pages
  captured (home, sports, events, the family hubs, a Loveland school
  page) at 390 and 1440. The only elements past the right edge are the
  events page's filter pills, which are a sideways scroller by design.
- **Headers and footers** are the guide's primary on every page of the
  nine guides (`header` and `footer` background read from the rendered
  page); the sports page's wrapper carries the same value except on
  Loveland's three non-namesake school pages (below).
- **Type sizes.** The smallest text on a sports page is the "Next" pill
  at 11.7px bold uppercase; everything else is 12px or larger. Body is
  16px, meta lines 15px, tables 15px.
- **The nav** fits at 1280 on all six classic guides with the mascot in
  the third slot (search button at x=1238 of 1280).

## Open, for the owner

1. **The masthead differs between the flagships and the rest.** Berthoud,
   Niwot and Lyons have the flagship masthead (`TownConfig.home`): a band
   in the guide's colour with the wordmark and a row of five pills. The
   six classic guides have the chassis masthead: the wordmark on the
   paper, uppercase links, a menu button on phones. Both are in the
   guide's colour now, but they are two designs. Making the six flagships
   is the `home` block (signature, purpose, photo, secondary link) plus
   the family hub and Living Here that go with it, a day's work per guide
   and more content than design; giving every classic guide the colour
   band instead is one component change that would reach all 17 classic
   guides, sports or not. Neither was done here.
2. **Loveland's other three schools.** Thompson Valley (black), Mountain
   View (purple) and Resurrection Christian (blue) keep their own colours
   on their pages, over a Red Wolf red masthead and footer. One guide can
   wear one colour; the alternative is a neutral guide colour for
   Loveland, which the owner's rule (a guide matches its high school)
   argues against.
3. **MaxPreps's colours are not always the school's.** Roosevelt's and
   Thompson Valley's come back as 222222, a placeholder; the sports probe
   prints them (`--sport=football`), and the school's own site is the
   check. Thompson Valley's black is real (black and gold); Roosevelt's is
   not, so its red is the school site's.
4. **The "Next" pill at 11.7px.** Readable, but the smallest type on the
   site; 12px would match the eyebrows.

## Captures

`docs/screenshots/2026-10-22-design-audit/`: Timnath home and sports at
390, Johnstown and Loveland sports at 1440, Lyons families at 390, Carbon
Valley home at 1440, after the changes.
