# The flagship design

The home page, header and navigation of the seven flagship guides (Berthoud,
Niwot, Lyons, Erie, Johnstown, Elizabeth, Windsor), as the owner signed them
off on 26 October 2026. Any later fix follows this page. The values here are
the ones in the code; `test/design.test.ts` reads them back from the code and
fails `npm test` when the two disagree.

Where things live:

| What | File |
| --- | --- |
| The home page's markup | `src/components/home/FlagshipHome.astro` |
| The scoreboard card | `src/components/home/Scorecard.astro` |
| The home page's stylesheet (plain CSS, loaded only there) | `src/components/home/flagship-home.css` |
| The spec's values, shared with the tests | `src/config/design.ts` (`DESIGN_SPEC`, `FLAGSHIP_NAV`, `SCHOOL_BACKGROUNDS`, `BREAKPOINTS`) |
| The header, on every page of every guide | `src/components/Header.astro` |
| The menu | `src/lib/nav.ts` (`townNav`, `moreNav`) |
| The school's colours and their jobs | `src/config/school-colors.ts` (`schoolTheme`) |
| The shared tokens (paper, ink, lines, fonts, container) | `src/styles/global.css`, `src/config/palette.ts` |
| The week's rules (order, days, marks) | `src/lib/flagship-home.ts` (`weekDays`, `displayTitle`) |
| Interior page introductions | `src/layouts/Page.astro` |

## Type

Two faces, both self-hosted through Fontsource: **Fraunces Variable**
(`--font-heading`) and **Instrument Sans Variable** (`--font-body`). Fraunces
is set at optical size 72 (`font-variation-settings: "opsz" 72`) below 60px and
144 from 60px up; weight 500 unless noted. Nothing on the home page is under
15px.

| Role | Face | Size (phone → from 64rem) | Weight | Other | Class |
| --- | --- | --- | --- | --- | --- |
| Body | Instrument Sans | 18px, line-height 1.6 | 400 | ink | `.fh` |
| H1, "This week in <Town>" | Fraunces opsz 72 | 2.25rem → 3rem | 500 | line-height 1.05 | `.fh-title` |
| Purpose line (the town's `tagline`) | Instrument Sans | 1.0625rem | 400 | muted ink, max 38rem | `.fh-purpose` |
| The week's line (weekly notes `headline`) | Fraunces opsz 72 | 1.25rem | 300 italic | only from this week's file | `.fh-headline` |
| H2 | Fraunces opsz 72 | 1.75rem → 2.25rem | 500 | line-height 1.15 | `.fh-h2` |
| Eyebrow | Instrument Sans | 15px | 600 | uppercase, tracking 0.12em, muted ink | `.fh-eyebrow`, `.fh-card-eyebrow`, `.fh-band-eyebrow`, `.fh-card-next-label` |
| Score | Fraunces opsz 144 | 3.5rem (56px) → 4.5rem (72px) | 500 | tabular lining figures, tracking -0.03em | `.fh-score` |
| Card team name | Fraunces opsz 72 | 1.25rem → 1.5rem | 500 | wraps (`overflow-wrap: anywhere`) | `.fh-score-team` |
| Next game, set large when there is no final | Fraunces opsz 72 | 2rem → 2.5rem | 500 | | `.fh-card-big` |
| Agenda day number | Fraunces opsz 72 | 1.75rem | 500 | the guide's primary | `.fh-agenda-num` |
| Agenda weekday and time | Instrument Sans | 15px | 600 | muted ink | `.fh-agenda-wd`, `.fh-agenda-time` |
| Agenda title | Instrument Sans | 18px | 600 | clamped to two lines | `.fh-agenda-title` |
| Agenda venue and cost | Instrument Sans | 15px | 400 | muted ink | `.fh-agenda-where` |
| Tile title | Fraunces opsz 72 | 1.375rem | 500 | | `.fh-tile-title` |
| Closing band title | Fraunces | 2.5rem (opsz 72) → 4rem (opsz 144, from 48rem) | 500, the *before* 300 italic | max 14ch | `.fh-cta-title` |
| Header menu | Instrument Sans | 0.8125rem | 600 | uppercase, tracking 0.1em | `Header.astro` |
| Wordmark | Fraunces | 1.75rem → 2rem (from 48rem); fitted to the room below 40rem | "Inside" 300 italic in ink, the name 600 in the primary | | `Wordmark.astro` |
| Interior page H1 | Fraunces (`display-md`) | 2.25rem → 3rem (`md:text-5xl`) | | | `Page.astro` |

## Colour

The guide's own palette is everything; the school's colour is **trim only**,
and the closing band is **the one full-colour moment** on the page.

| Role | Value | Token | Allowed on |
| --- | --- | --- | --- |
| Paper | warm `#F7F5F0`, cool `#F2F6F7`, per the town's `colors.paper` | `--color-paper` (`PAPERS` in `palette.ts`) | the header, the first screen, the paper sections |
| White | `#ffffff` | `--color-raised`, `#fff` | the scoreboard card, tiles, the white sections |
| Ink | `#243137` | `--color-ink` (`INK`) | body text, titles, the away side's score |
| Muted ink | `#46545B` | `--color-ink-muted` (`INK_MUTED`) | eyebrows, times, venues, small print |
| Lines | the paper mixed 12% (soft) or 30% with the ink | `--color-line-soft`, `--color-line` | rules between rows, card and tile borders |
| The guide's primary | the town's `colors.primary` | `--color-primary` | links, the agenda's day numbers, the email button, the active menu item |
| The guide's accent | the town's `colors.accent` | `--color-accent` | the header's top rule on a guide with no school; never words |
| Our pick | amber `#f0a62e` tag on wash `#fdf0d8` | (hex in `flagship-home.css`) | the pick row only |
| School ink | the school's primary where it clears 4.5:1 on white and both papers and white clears 4.5:1 on it, else the band | `--fh-ink` (`schoolTheme().ink`) | the card's eyebrow and Next up label, **the home side's score**, the Home pill's fill, the Away pill's outline and words |
| School rule | the school's primary, unswapped | `--fh-rule` (`schoolTheme().rule`) | the 6px rule above every page's header, the 4px rule along the card's top; never words |
| School band | the primary, or the secondary where white does not clear 7:1 on the primary (Erie, Johnstown) | `--fh-band` (`schoolTheme().band`) | **the closing band's background only**, white on it at 7:1 |
| Band eyebrow | the school's other colour where it clears 4.5:1 on the band, else white | `--fh-eyebrow` | the closing band's eyebrow |

The rule the tests hold: in `flagship-home.css` the school's colours
(`--fh-band`, `--fh-ink`, `--fh-rule`) are a `background` only on `.fh-band`
and `.fh-site-home` (`SCHOOL_BACKGROUNDS`). `npm run check-colors` proves every
pair: white on the band at 7:1, the ink on white and on the paper at 4.5:1,
white on the ink at 4.5:1. The losing side of a final is never dimmed: both
scores are the same size, and the result is said in a word ("Won", "Lost",
"Tied") on the card's first line.

## Space and widths

| What | Value |
| --- | --- |
| Container | max 76rem; side padding 1.25rem, 2rem from 40rem, 2.5rem from 64rem (`container-page`, `global.css`) |
| Section padding | 3rem phone, 4.5rem from 48rem (`.fh-section`) |
| First screen | padding 1.25rem top, 3rem bottom; 2rem and 4rem from 48rem (`.fh-top`); gap 1.5rem |
| First screen columns, from 64rem | `minmax(0, 7fr) minmax(0, 5fr)`, column gap 3rem |
| Card | padding 0.9rem 1.25rem 1rem, radius 12px, 1px soft line, top rule `4px solid var(--fh-rule)` |
| Agenda day | `grid-template-columns: 3rem minmax(0, 1fr)` (date, items) |
| Agenda item, from 40rem | `grid-template-columns: 5.5rem minmax(0, 1fr)` (time, title); one column below |
| Tiles and card radius | 12px; pills 9999px |
| Tap targets | 44px minimum (`.fh-link`, `.fh-button`, agenda rows, header buttons) |
| Purpose line | max 38rem |
| Closing band | padding 3.5rem, 5rem from 48rem |
| Interior page introduction | padding 1.5rem, 2.25rem from 48rem (`py-6 md:py-9`); intro 1.0625rem, 1.125rem from 48rem; content starts 2rem below (2.5rem from 48rem) |

## Breakpoints

Drawn and checked at 360, 390 and 430 (phones), 768 (tablet), 1280 and
1440 × 900 (desktop) (`BREAKPOINTS`). The CSS steps are 40rem (640px: the
agenda's time column, the email button in the header, two tiles a row), 48rem
(768px: section padding, the band title), 64rem (1024px: the card beside the
intro, desktop type sizes) and 80rem (1280px: the menu as a row).

## The header

One treatment on every page of every guide, home and interior alike. No
template switches its colour.

- A 6px rule (`h-1.5`) above it: the school's main colour (`schoolTheme().rule`)
  on a guide that follows a school, else the guide's primary running into its
  accent.
- The header on the paper (`bg-paper`), 1px soft line under it, padding
  1.25rem (1.75rem from 48rem).
- Left: the wordmark. Right: search (a 44px round button), then on a flagship
  the email button ("Thursday email", the guide's primary, white words, 44px,
  from 40rem; inside the phone menu below that), then the menu button below
  80rem.
- The menu (`townNav`), in this order and these words on every flagship:
  **This week, Events, <Mascot> sports, Eat & drink, Families, Living here**
  (`FLAGSHIP_NAV`). The mascot stays and "sports" says what it is ("Spartans
  sports"); a guide following no school has no sports item.
- Then **More**, a native disclosure: "In <Town>": Things to do, Get involved
  (where the guide has it), This weekend, Local changes (where there are any)
  (`moreNav`); then the nearby guides; then "All N guides". In the row it opens
  under itself and closes on Escape (focus back on "More"), a click or a tab
  elsewhere. In the phone panel it is listed open.
- The current page: the primary, with a 2px underline 0.6em under the word in
  the row; `aria-current="page"`.
- The phone menu: the button opens a panel under the header and puts focus on
  its first link; the page under it is dimmed and does not scroll. Escape
  closes it and returns focus to the button; following a link closes it; so
  does tabbing out of the header. The button's label is "Menu", then "Close
  menu". Focus is the shared ring: 2px primary outline, 3px offset, white halo.
- The email button goes to `#signup` on the home page and `/#signup` on every
  other page: the closing band's form.

## The home page, top to bottom

1. **Intro**: H1 "This week in <Town>", the town's `tagline` as the purpose
   line, and the week's `headline` when this week's notes have one.
2. **The scoreboard card** (beside the intro from 64rem, under it on a phone).
3. **This week**: "Our pick" (from this week's notes, when its listing is on),
   then the agenda.
4. **The email**, promoted on its own: the day and hour, one button to the
   form, and the latest issue sent to this town, only where one exists.
5. **Worth knowing in <Town>** (or the notes' `knowTitle`): the local changes
   and the sign-up dates after the agenda's seven days, up to 14 days out. No number in the heading. Left
   off the page when there are none.
6. **<Mascot> sports in season**: one row a team (name, record, what is next);
   no score the card already shows. Left off when no team is in season.
7. **Living in <Town>**: the town's licensed photograph (the config's `hero`,
   credited under it where the config gives a credit) beside the routes:
   Families, Eat & drink, Things to do, Get involved (where it exists),
   Living here.
8. **The closing band**, the one full-colour moment: the email's form.

## The scoreboard card

- White, 1px soft line, radius 12px, a 4px top rule in the school's rule colour.
- **With a final** (the latest in 8 days, football first): the eyebrow
  "<Mascot> <sport> · Final" in the school ink; a line "Won · Friday, October
  23 · At Mountain View"; then **two rows**, our side first, each a team name
  (Fraunces 1.25rem → 1.5rem) and its score (3.5rem / 56px on a phone, 4.5rem
  / 72px from 64rem). Our score is in the school ink, theirs in the ink; both
  the same size. Then "Season 7–2", "All scores →" and Share.
- **With no final**: the eyebrow "· Next game", the day and time set large
  (2rem → 2.5rem), the matchup and its Home or Away pill.
- **Next up**: one line under a soft rule: the label, "Mon, Oct 26, 6:30 pm ·
  Volleyball vs University", the pill. With no game to come: "No other game
  on the schedule yet."
- "Scores checked <day>, <time>" in 15px muted ink.
- **No score and no game** (no school, no data, the off-season): the card is
  not drawn; the intro and the week take the left column and the email the
  right.
- **A long team name** wraps inside its row; the score keeps its own column
  and never shrinks.

## The week agenda

- Seven days from the day the page was built, only the days with something on.
  A day is a row: a 3rem date column (weekday 15px, day number 1.75rem in the
  primary) beside its items.
- Each item: the time, then the title (a dot in the category's colour; two
  lines at most; a long title cut at a natural break by `displayTitle`), then
  the venue and cost, or a game's Home or Away pill. Phones (below 40rem): the
  time over the title. From 40rem: a 5.5rem time column. From 64rem the agenda
  sits in the 7fr column beside the card.
- Registration openings and deadlines from the programs are on their day
  ("Sign-ups open", "Last day to sign up"), so a day with one is never
  "Nothing listed".
- Three a day, then "N more on <weekday> →" to the events page. On a full
  day the weekly series give up the slots first, so one-off and civic
  listings, games and sign-up dates are chosen before them; the chosen ones
  are shown in the order of the clock, games and events alike, all-day,
  sign-up and time-note items after the timed ones.
- Days with nothing: one line, "Nothing listed yet on Wed, Sun. Add an event".
  A week with nothing: "Nothing listed for the next seven days yet", with Add
  an event and the events page.
- Every row carries `data-event-day` and `data-end`, so the browser takes down
  what is over on an old build (`src/lib/expiry.ts`).
- The Thursday email is never one of the week's items.

## Tiles, buttons, cards and the closing band

- **Tiles** (`.fh-tile`): white, 1px soft line, radius 12px, padding 1rem
  1.25rem; eyebrow, title, one line in muted ink with an arrow; border in the
  primary on hover. One a row on a phone, two from 40rem.
- **Buttons**: one filled button style, `.fh-button`: the guide's primary,
  white words, 1rem 600, 44px, fully rounded. Standalone links (`.fh-link`)
  are underlined, 600, the primary, 44px tall.
- **Pills**: Home is the school ink with white words; Away is a 1.5px outline
  and words in the school ink; 15px 600, 24px tall.
- **The closing band** (`#signup`, `.fh-band`): the school band, white words
  (7:1), the eyebrow in `--fh-eyebrow`, the title "Know what's happening
  *before* it happens.", the email's promise, the form, and the latest issue
  where one exists. It is the last thing in `<main>`, so the footer meets it
  with a hairline.

## Changing this

This design is final. A change to anything on this page needs the owner's
sign-off first and a DECISIONS.md entry saying what changed and why; then
change `src/config/design.ts`, the stylesheet and this page together, so
`npm test` passes again. A test that fails here is doing its job.
