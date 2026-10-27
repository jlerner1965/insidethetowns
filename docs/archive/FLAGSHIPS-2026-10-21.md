# The two flagships: handoff, 21 October 2026

Inside Berthoud and Inside Niwot, worked as one project from the brief of
21 October 2026, on the branch `claude/berthoud-niwot-flagship-oeibwd`.
Nothing is deployed from the branch: Vercel builds production from `main`
(DEPLOY.md), so the live sites change when this branch is merged. Preview
deployments are off for every project but Lyons, so there is no preview
URL; the before-and-after captures are in `docs/screenshots/flagships-2026-10-21/`.

## 1. What was implemented for Berthoud

- **Home page** (`src/components/home/FlagshipHome.astro`, `home` on the
  config): a split masthead a third of the old hero's height, the Town's
  own playground photograph, the purpose line, "This week" and "Berthoud
  Families" buttons, and a dated line for Ballot Issue 3G; then the week
  (pick, the rows, coming up) beside a supporting column (things to know,
  deadlines, new & closed, the Spartans' games in maroon); Berthoud
  Families as the signature section; Around Berthoud (the photographed
  places, the names, the latest guide); the email; Who handles what; the
  neighbours, four at most; a footer strip naming Loveland, Longmont,
  Johnstown and the hub.
- **/families/**: fifteen programs from the library, Berthoud Recreation's
  fall activity guide and the organizers' pages, by age then by subject,
  each once; deadlines and openings (winter registration opens November 1;
  the Historical Society's card contest closes November 7); Thompson's
  2026–27 breaks; the free things; the family listings coming up; the two
  districts' boundary lookups.
- **/get-involved/** ("Join Something"): the Social Run, the library's
  groups and volunteer forms, the Historical Society, Berthoud Main Street,
  the Town's boards and the Youth Advisory Commission, the Rotary
  satellite club, the Friends of the Library.
- **/living-here/**: utilities (with the address caveat for Xcel and
  Poudre Valley REA), trash, BATS and FLEX, recreation registration,
  schools (Thompson and Weld RE-5J), reporting a problem, Town meetings
  and the committee application, every section dated.
- **/updates/**: Ballot Issue 3G, the winter guide, the Wilson Farm
  purchase.
- **/this-week/**: things to know, the pick, the rows, deadlines, new &
  closed, a resident's question (when winter registration opens), the
  neighbours, the hill as day trips, the email.
- **Navigation**: Events, Eat & Drink, Things to Do, Families, Living
  Here, Sports; Guides and Moving Here in the footer and on Living Here.
- **About**: who runs it, in the verified words; the people section and
  how to nominate someone; counts with one definition.

## 2. What was implemented for Niwot

- **Home page**: the same layout with Second Avenue beside the
  introduction, "This week" and "Get Involved" buttons, a dated line for
  the November 3 vote; the week beside its supporting column (the
  Cougars' games in green); Around Niwot (the photographed places, the
  names, the newest guide) and Get Involved as the two signature sections;
  the email; Who handles what; the neighbours; a footer strip naming
  Longmont, Lyons, Erie, Nederland and the hub.
- **/get-involved/**: twelve entries, from the Community Connection and
  the Rotary to the Grange, the Business Association, the Community
  Association, the Cultural Arts Association, the Historical Society, the
  PTAC, the LID committee, Troop 161, Niwot Youth Sports and the schools,
  each with access, cost, contact, source, check date and the next date on
  the calendar.
- **/families/**: the youth routes (Niwot Youth Sports basketball,
  registration through December 1; the PTAC; the schools and open
  enrollment December 1–15), St. Vrain's 2026–27 breaks, the family
  listings, the kids' outing guide.
- **/living-here/**: roads and the CO 119 project, water and sewer (with
  the septic caveat), safety and permits, schools, trails and open space,
  the organizations, civic developments with the vote stated neutrally
  and dated.
- **/updates/**: the CO 119 median closures, the LID's October approvals,
  the Niles move, the Fly Away Home closure (as the late notice it is),
  the vote.
- **/this-week/** as Berthoud's, with the question "when does my ballot
  have to be in" and the neighbours' weekend now on the page above the
  hill.
- **A new listing**: the Great Pumpkin Party, October 31, from the
  Business Association's page with the Courier's schedule.
- **Tagline**: the vote is out of the permanent line and the comparison
  line and into dated coverage.

## 3. Factual errors confirmed and corrected

| Finding | What was found today | Done |
|---|---|---|
| Berthoud Neon Nights dates | The Town's Upcoming Events page and home-page calendar (read 21 October) give pickleball Friday October 23, dodgeball Saturday October 24; the printed guide has them reversed, and the guide had followed the print. | Both listings corrected to the Town's current pages, with the print's times and fees kept and a line to call; corrections entry logged. |
| Niwot volleyball, 30 October | MaxPreps carried Fossil Ridge twice at 9:45 am under two contest ids; the second match page now answers 404. | Duplicate: the data file corrected, the run's parser now drops a repeat of the same day, known time and opponent (doubleheaders kept), with a test. |
| Niwot weekly nearby | The full page led with Evergreen, Manitou Springs and Golden on a one-listing week. | Town content first; the neighbours' weekend after it; the mountain strip labelled as day trips. |
| Old closures as news | Fly Away Home (closed December 2024) was in "New & closed" with its October 2026 check date. | `effective` on weekly changes; an old change is shown as a correction with both dates, off the week's news, and expires as before. |
| Event counts | About counted listings, the events page dates, the home page the week's rows, each under the word "events". | One definition (`src/lib/event-totals.ts`): listings (dated plus weekly series) and dates in the fortnight, labelled on every page that prints a count. |
| Repeated items | The Niwot cemetery talk was the pick, the first row and the first "What's on" card. | The pick's listing is left out of the rows under it; "Coming up" leaves out what the week showed. |

## 4. Pages and components changed

New: `src/components/home/FlagshipHome.astro`, `ClassicHome.astro` (the
old page, moved unchanged), `HeroCompact.astro`, `SportsStrip.astro`,
`ProgramRow.astro`, `UpdateRow.astro`, `DeadlineList.astro`,
`TrackClicks.astro`; routes `families.astro`, `get-involved.astro`,
`living-here.astro`, `updates.astro`, `people/`; libraries
`src/lib/programs.ts`, `updates.ts`, `event-totals.ts`; schemas for
programs, updates and profiles; `scripts/templates/profile-template.md`;
tests `programs`, `updates`, `event-totals`, `flagships`.

Changed: `ThisWeek.astro` (sections, order, dedupe), `NearbyWeekend.astro`
(limit), `UpTheHill.astro` (label), `NetworkBar.astro` and `Footer.astro`
(compact mode, hub links), `about.astro`, `Base.astro` (click counting),
`town-routes.ts`, `content.ts` and `freshness.ts` (the hubs' gate),
`weekly.ts` (backlog), `school-sports.ts` (the week's games),
`sports-crosscheck.ts` (dedupe), the two configs and `types.ts`,
`data/niwot/sports.json`, the two Neon Nights listings, three weekly
notes files, both content READMEs, README.md, DECISIONS.md.

## 5. Validation results

- `npm run validate`: 2,309 entries, 0 errors.
- `npm test`: 439 tests pass (420 before; 19 added for the deadline, the
  archive, the count, the dedupe, the backlog rule and the configs).
- `npx astro check` (TOWN=niwot): 0 errors.
- `npm run check-colors`: passes.
- Builds: Berthoud (164 pages), Niwot (113), Lyons and the hub, all
  complete; Lyons's home page is the classic layout, unchanged.
- Rendered checks (Playwright over the built sites, `/`, `/this-week/`,
  `/families/`, `/get-involved/`, `/living-here/`, `/updates/`, `/about/`,
  `/events/` at 390, 768 and 1440): no horizontal overflow, no unloaded or
  stretched image, no empty image box, one h1 per page, every internal
  link answers; the first local content starts at about 880px on a
  390-wide phone (one short scroll) and inside the first screen at 1440.
  The two reports left are pre-existing and by design: the events page's
  filter pills scroll sideways at 390 and read as clipped, and one lazy
  image low on the Niwot events page had not decoded when measured.
- Dates and recurrence: the existing timezone, series and expiry tests
  still pass; the new deadline and archive rules are tested on Denver days.
- Newsletter and submission flows are untouched (the signup posts to the
  same Buttondown endpoint; the Formspree forms are as they were); nothing
  was sent.

## 6. Screenshots

`docs/screenshots/flagships-2026-10-21/`: `before-*` are the live sites on
21 October; `after-*` are the branch's builds, home and This Week, at 390,
768 and 1440, both towns.

## 7. Preview and deployment

No preview deployment exists for these two projects (DEPLOY.md: preview
deployments are off for every project but Lyons). Deployment follows the
repository's policy: merge to `main`, and each project rebuilds. Nothing
is deployed from this branch.

## 8. Content withheld

- **Profiles**: two drafts, unpublished, each listing what is missing:
  Steve Hensley (Town recreation director; needs an interview or supplied
  words, consent, a photograph or none) and Pat Murphy (Great Pumpkin
  Party organizer and Community Connection co-founder; the same). No
  portrait of James Lerner exists in the repository, so the About pages
  carry none.
- **Halloween in the Hall**, October 31: on Niwot Hall's calendar with no
  description, host or cost; not listed.
- **Troop 161**: the troop's own site could not be read; the entry carries
  the hall's booking, labelled as such.
- **Berthoud Area Chamber of Commerce**: its site returned no content; no
  entry.
- **Niwot Pizza's move**: no date on the owner's page; stays a weekly item
  without an effective date rather than an update.
- **LID November meeting**: the Courier reports November 17; the county's
  calendar still says November 3; both are stated, neither asserted.
- **Winter activity guide programs**: not yet published by the Town
  (November 1); the family hub says what the fall guide implies and
  points at the Town's own guide.

## 9. Maintenance checklist

- **Every week**: read the programs with a deadline or opening in the next
  45 days against the organizer's page (`npm run weekly` does not yet
  list them; the family hub's deadlines section shows which); update
  `verified` only when the facts were read.
- **November 1**: read Berthoud's winter activity guide and replace the
  fall guide's youth programs and prices; add the winter deadlines.
- **November 4**: the vote's result. Replace Niwot's `updates/incorporation-vote.md`
  with a result notice (stage `complete`, the county's result page as
  source), update the election explainer and the config comments; the
  Living Here civic note and the `character` line.
- **November 17 or 3**: confirm the LID meeting date on the county's
  calendar and correct the listing and the program entry.
- **Each month**: re-read the Living Here links (`npm run check-links`
  covers the content; the config links are not in it yet) and stamp the
  section's `verified`.
- **Each update**: set `expires`, or it runs sixty days; move nothing by
  hand, the archive is automatic.
- **Profiles**: publish only after the interview and the consent are
  recorded in the file; the schema refuses otherwise.
- **Sports**: the Saturday and Wednesday runs will now drop a repeated
  contest; read the run summary for the note.
