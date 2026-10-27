# How Inside the Towns works

The rules in force today, in one place. When a rule changes, this file
changes and the old wording goes; the history of why lives in
`DECISIONS.md`, which is a log, not a rulebook. Where this file and any
other document disagree, this file wins. Where this file and a test
disagree, fix one of them the same day.

Last revised: 27 October 2026.

## 1. What this is

A network of independent community guides for Colorado towns, one site per
town, all built from one codebase (`TOWN=<slug> npm run build`), hosted on
Vercel, one project per domain, with insidethetowns.com as the hub. One
person owns it and runs it a few hours a week with an assistant and a set
of scheduled jobs.

The product is the Thursday email. The site's job is to be right about
this week, to rank for the names of events and places, and to turn a
reader into a subscriber. Revenue is one labelled sponsor line per town, in
the email and on the site, three months minimum.

## 2. The decision we are inside

**The 90-day test** (20 October 2026 to 20 January 2027): three towns get
the work; everything else runs on automation. No new towns, no new
features, no search-engine projects until the test ends. The targets and
the weekly scorecard are in `docs/90-DAY-TEST.md`; the scorecard is filled
every Tuesday, once Search Console has settled the Sunday.

| Town | Why |
|---|---|
| Niwot | The owner lives there; third on search |
| Lyons | The one chamber relationship; where distribution is tested |
| Berthoud | Best search performance in the network; a town of 10,000 with no good calendar |

On 20 January: a sponsor renewal and two of three subscriber targets means
the model repeats in Golden and Erie. Readers but no sponsor means fix the
offer. Neither means the network stays live on automation as a community
project.

## 3. The towns

The config flag decides what a guide is; nothing is per-town in code.

| Kind | Flag | Towns | What it means |
|---|---|---|---|
| Resident guide | `home: true` | Berthoud, Elizabeth, Erie, Johnstown, Lyons, Niwot, Windsor | Follows a school; has Families, Living here and Updates; gets the Thursday email |
| Plain guide | none | Timnath, Carbon Valley, Idaho Springs (Clear Creek) | In the email and the weekly rotation |
| Visitor guide | `visitorGuide` | Estes Park, Evergreen, Golden, Manitou Springs | Checked on the 60-day cycle; no email, no signup box |
| Quiet guide | `quiet` | Elizabeth, Fort Collins, Grand Lake, Leadville, Longmont, Loveland, Nederland | Pages up and indexed; listings checked as the rotation reaches them; no email, no signup, no Thursday draft. Each has a decide-by date in its config |
| Folded | redirect | Severance (into Windsor), Fort Lupton (into a neighbour), Georgetown and Black Hawk (into Clear Creek) | A holding page or a redirect; the content lives on the neighbour's guide |
| Held | not live | Castle Rock | Built but not launched until it clears its threshold |

The hub lists every live guide A to Z and carries the network pages:
newsletter, advertise, privacy, about.

## 4. Who does what

- **The owner** decides, calls, photographs, meets, shares and merges.
  Phone calls, photographs, sponsor conversations, authorizing accounts and
  anything that puts a name to a person are his alone.
- **The assistant** audits, drafts, fixes code, proposes content changes
  and runs the scheduled checks. It edits `content/` only when asked to
  publish something specific; audit findings are proposals in a report.
  It never sends email, never pushes to `main`, and never adds a town, a
  feature or a per-town variant on its own.
- **Automation** (section 9) ingests events, approves the safe ones under
  the standing rules, re-checks listings nightly, reads the scores, drafts
  the email and rebuilds the sites daily. Everything it writes lands as a
  commit or a pull request that can be read.

## 5. Accuracy

One wrong fact costs more than ten missing ones.

- Every date, time, address, price, hours line and open-or-closed claim
  comes from a source read for it, and the file says which (`source`,
  `verified`). A file without both is held back by the validator.
- Primary sources first: the organizer, the business, the town, the
  library, the district, the county. A news story is a lead, not proof. A
  chamber's or a paper's calendar lists other people's events and waits
  for the organizer's own.
- Nothing is guessed. Can't confirm it: leave it out, or mark it
  unverified with what was found.
- A listing is re-checked within 30 days. At 60 days its hours hide. A
  listing whose only source dropped it carries a `changeFlag` and gets a
  call before the hours hide.
- Corrections are shown, not silently fixed: a change found late is a
  correction with both dates, never the week's news.
- A called-off or moved event stays on its day with the word beside it.

## 6. Photographs

- Every image has a row in `IMAGE_LICENSES.csv` saying where it came from
  and under what terms. No row, no image; the validator enforces it.
- Acceptable: public domain; an open licence that allows this use; taken
  by us; or sent by whoever holds the rights with written permission,
  recorded in `PERMISSIONS.md` and credited as they ask. A paid editorial
  licence of a real photograph of the real place, credited, is acceptable
  too. Generic stock and generated images are not.
- The hero may instead be a painting drawn for the guide (27 October 2026):
  ink and watercolour, drawn in code by `scripts/heroes/`, of the town's
  real landmarks taken from the guide's own reference photographs. It is
  a composition, not a view: its alt text says "illustration" and names
  what is in it, and nothing in it is invented to stand for a real
  building. Image-generator pictures stay out, because they invent the
  places they claim to show. Listings, tiles and articles keep
  photographs. Lyons, Niwot and Berthoud have one; the other guides wait
  for the end of the 90-day test.
- Never copied from a business's website, its social pages or a review
  site, however good the picture.
- The hero is the town itself, not the county or a lake outside it, and a
  hero photograph is never also a listing's card photograph.
- A card is for a photograph; a place without one is a row, never a
  coloured tile.
- Credit sits under a photograph shown in full and on `/credits/`, which
  the footer links from every page.

## 7. Voice

Plain, warm and local: a neighbour who pays attention, not a tourism
board. Short sentences. The street, the business, the day. No hype words.
The guide never passes an organizer's copy off as its own; quoted text
names who said it. Every page says what it is and when it was checked.

## 8. The pages and the design

**The town home** is a front door, not the whole site (27 October 2026).
Top to bottom, the same on a phone and a desktop: nav; the hero as a short
band (photo, county, name, one line); the school's strip in the school's
colours; What's happening as Today, Tomorrow and This weekend tabs, five
rows each; the Thursday signup; three photo tiles (Eat & drink, Things to
do, Living here or Moving here); Worth knowing, two links; the footer as
one block. Sections with no data hide. On a phone the sports strip shows
the latest result only; nothing else on the home is hidden on a phone.

**Every other page** keeps its full content: `/this-week/` the whole week,
`/events/` everything, `/sports/` the full scoreboard with the "checked"
line, `/updates/` every change with its sources, `/guides/` the articles,
`/directory/` every place.

**Visual rules** (the ten from the 26 October pass, still in force):

1. The accent colour draws the rule under a section heading and the
   masthead stripe; it is never a text colour, a background or a card
   border.
2. The town's colours are the guide's; category dots and eyebrows are the
   listing's, never the town's.
3. The school's colours appear only on the home strip and the sports
   pages, proven 7:1 under white by `npm run check-colors`.
4. "Our pick" is amber; "Canceled" and "Postponed" are an ink-bordered
   label; "Free" and "Away" are plain words. The four are never one slot.
5. Colour never carries meaning alone; every status is a word.
6. Body 17px on articles, 16px elsewhere; supporting text 15px, never
   below 14px; eyebrows 12px uppercase on section heads only.
7. Headings wrap; nothing in a heading is nowrap except the menu row.
8. At most one sticky element per page; the masthead is not sticky.
9. One email form per page, and none on a quiet or visitor guide. On the
   home it stands alone after What's happening. The form never claims a
   subscription it cannot see.
10. The hero's photograph is the town's and keeps its credit.

## 9. The code and the jobs

- One repo, one template. Town differences live in config and content,
  never in code forks. Adding a town is a config file, a content folder
  and a Vercel project.
- Scripts ship as files (`script-src 'self'`); no inline script, no
  framework on the page.
- `npm test`, `npm run validate`, `npm run check-colors` and `astro check`
  pass before anything is pushed, and CI builds every live site on every
  pull request. The tests are the rules that cannot drift.
- Content is Markdown with YAML front matter under `content/<town>/`;
  sports data under `data/<town>/`; the config under
  `src/config/towns/<slug>.ts`; the home under `src/components/home/`.

Scheduled jobs (Denver time), all in `.github/workflows/`:

| When | Job | Writes |
|---|---|---|
| Daily 05:10 | Rebuild every site | nothing; Vercel redeploys |
| Daily 05:40 | Re-check the next 14 days of events against their sources | stamps and flags, as a pull request |
| Monday 07:10 | Ingest the confirmed feeds; auto-review the safe ones | staged and published events, as a pull request |
| Wednesday 06:20 | The research agent: one week's findings per flagship | a report, as a pull request |
| Thursday 06:10 | Draft the Thursday email from the listings | a draft, as a pull request; merging sends it |
| Sat and Sun 08:00, Wed 06:20 | Read the scores from MaxPreps | `data/<town>/sports.json`, committed straight to main |

The scorecard fill is a scheduled assistant session, Tuesday 11:17, from
3 November 2026 to 19 January 2027: it reads Search Console (GSC Wizard)
and Buttondown, adds the week's three rows to `docs/90-DAY-TEST.md`, and
opens a pull request. The weekly audit is the assistant's, not a
workflow's, until a scheduled session is set up for it.

## 10. Conflicts this file settles

Where the dated documents disagree, this is the reading in force:

- The home page is the 27 October front door, not the 25 or 26 October
  layouts. `docs/archive/DESIGN-PASS-2026-10-26.md` stands for everything but its
  Stage 2 home page and its rule 9's "beside Things to know".
- A paid editorial photograph of the real place is allowed (section 6);
  `docs/PHOTO-PRIORITIES.md`'s "no stock" means generic or generated
  images.
- On a phone the sports strip hides the next game and nothing else on the
  home is hidden (section 8).
- The manager agent in `manager/` is not set up and is not relied on. The
  weekly audit is run by the assistant on request or on a schedule; the
  `npm run weekly` report, the nightly re-check and the Monday ingest
  cover the ground the manager was designed for.

## 11. Open decisions

- The quiet guides' decide-by date is 19 November 2026: keep each, or
  retire it to a holding page.
- Berthoud: B-Rad's Arcade and Trailhead Cafe, dropped by their only
  source on 26 October; keep after a call, re-source, or mark closed.
- Whether to set up a scheduled assistant session for the weekly audit
  (section 4); the scorecard's was set up on 27 October 2026.

## 12. Where things are

| Need | Look in |
|---|---|
| Why a rule is what it is | `DECISIONS.md` (the log; entries run oldest to newest) |
| How to deploy, redirect, verify a domain | `DEPLOY.md` |
| What is open, and whose it is | `TODO.md` |
| Photo permissions and the asks | `PERMISSIONS.md`, `docs/PHOTOS.md`, `docs/PHOTO-CONTACTS.csv` |
| The 90-day test and its scorecard | `docs/90-DAY-TEST.md` |
| The latest audit per town | `docs/audits/<date>/<town>.md` |
| Editorial formats and the voice | `.claude/skills/inside-the-towns-editor/SKILL.md` |
| Dated reports, past designs, sent email drafts | `docs/archive/` |
