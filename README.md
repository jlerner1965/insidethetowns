# Inside the Towns

One Astro codebase that builds a network of independent community guides for Colorado
Front Range towns, one deployment per domain, selected by the `TOWN` env var.

```
TOWN=niwot npm run dev        # or: npm run dev -- --town=niwot
TOWN=hub   npm run build      # insidethetowns.com
npm run validate              # check every town's content (--hours lists hours lines it cannot read; --build is what a build runs)
npm run check-links           # ask the live web whether our outbound links still work
npm run check-colors          # prove the palette passes WCAG AA on every site
npm run new-town lyons "Lyons"
npm run weekly                # the weekly content report (see below)
npm run newsletter            # draft Thursday's email from the listings (see below)
npm run import-events -- events.csv --dry-run   # CSV → event files
npm run sources               # the source registry: what waits to be confirmed, core first (see below)
npm run ingest -- --dry-run   # read the confirmed feeds into staging; changes to published events go to review
npm run review                # the summary, then everything in staging: approve, edit, reject (see below)
npm run auto-review -- --dry-run   # what the standing rules would approve without a person, and why the rest waits
npm run recheck -- --town=lyons    # the next 14 days of events read against their sources again; --write stamps and flags (see below)
npm run confirm -- lyons old-time-jam --how=phone --with="Oskar Blues"   # record a call to an organizer
npm run sports -- --write          # high-school scores from MaxPreps for each town that follows a school (see below)
scripts/screenshot.sh out/ / /events/   # phone/tablet/desktop captures of dist/
```

## High-school sports

A town that follows its high school (Berthoud, Niwot, Lyons, Timnath,
Elizabeth, Johnstown, Windsor, Carbon Valley and Erie, and Loveland's four
schools, in `src/config/school-sports.ts`) has `/sports/`: each followed team's record, the
whole season's results and the games to come, read from the team's MaxPreps
home page and its `/schedule/` page (the full season, used only where it
agrees with the home page on every game both carry) by
`.github/workflows/sports-maxpreps.yml` on Saturday mornings (Friday night's
scores), Sunday mornings (Saturday's: the playoff rounds and the state
tournaments) and Wednesdays, and the week's games in a strip under the home
page hero. The run writes `data/<town>/sports.json` (never `content/`), commits it
to main, and that town's site rebuilds. Where the school has a calendar a
machine may read (Berthoud's Finalsite site; Niwot's ArbiterLive asks readers
to stay out), each game to come is checked against it: where the two disagree
on the day, time or opponent the game is held off the page and named in the
run's summary. A team whose page cannot be read or parsed keeps its last good
entry and its "updated" date; nothing guessed or partial is written. `npm run
sports` prints what a run would do; `--town=niwot` narrows it, and
`--town=berthoud --sport=football` reads one team's page and prints it.

## The resident hubs and the flagship layout

Berthoud and Niwot (21 October 2026) and Lyons (22 October) carry the
resident hubs and a flagship home page, each switched on by the town's
config and shared as routes and components with nothing town-specific in
them:

- `/families/` (`families` on the config): what a child can join, by age
  (by the organizer's numbers, `ageFrom`/`ageTo`, where the file gives them;
  a program spanning ages is filed once and named under every other age it
  reaches), the parents' side and the organizations apart from the child
  activities, what closes or opens in the next 14 days and what comes
  later, the district's break dates, and the free things (`free` on the
  file, else a price line that begins "Free" with nothing paid after it).
  Reads `content/<town>/programs/`; the rules are `src/lib/programs.ts`.
- `/get-involved/` (`participation`): the organizations, clubs, volunteer
  roles, public meetings and social activities, each with cost, contact,
  access (public, members, registration, private) and the next public date.
  The same collection, the ways-in kinds (`src/lib/programs.ts`).
- `/living-here/` (`livingHere`): which body handles what, as links to the
  right page of each official site, every section dated.
- `/updates/` (any guide with `content/<town>/updates/`): local changes with
  three dates kept apart, when it took effect, when the guide published it,
  when the source was read, current first and then the archive
  (`src/lib/updates.ts`).
- `/people/` builds only where a profile in `content/<town>/profiles/` says
  `status: published`, which the schema allows only with its basis, its
  consent and no open questions; a draft is validated and never built.

A program or an update publishes with a `source` and a `verified` date,
like a place; without them it is held back with a line on the log. The
weekly notes took three more fields: `effective` on a change (the day the
business changed, so an old closure found this month is shown as a
correction with both dates, never as the week's news), and optional `qa`
and `feature` blocks. "This week" lists the town's own content first and
the neighbours and the mountain guides after it, labelled as the day trips
they are. `src/lib/event-totals.ts` is the one definition of "how many
events" for every page that prints a count. The home page's flagship layout
(`home` on the config, `src/components/home/FlagshipHome.astro`: the header
as a masthead with five pills, today in a line, the week as a list, every
other hub as one link, the email) keeps the shared chassis for every other
guide (`ClassicHome.astro`). A flagship's primary colour is its school's,
as `src/config/school-sports.ts` names it.

## The weekly content session

The standing routine is `docs/AUDIT-2026-10-02.md`'s: one town at a time on a
fixed day, every event in the next 14 days confirmed against the organizer's
own page, and every listing re-checked within 30 days (about nine a town a
week, against the business's own site, by phone when the site is unclear).
Mark, don't delete: a place that has closed gets `status: closed` and a note
saying how you know, a meeting the Town has called off gets `status:
canceled`, and the pages do the rest (see any content README).

0. The nightly re-check has already run (`.github/workflows/recheck-events.yml`,
   `npm run recheck`): every published event due in the next 14 days read against
   its source again. Where the source is a feed in the registry, the item on the
   day is compared exactly (start, end, cancellation); otherwise the page is
   fetched and its structured data or visible text read. A confirmation moves
   `verified` and says what was read where in `verifiedBy`; a change sets
   `changeFlag` with the evidence in `changeNote`, which `npm run review` walks;
   its pull request opens with the calls to make: each venue whose events no
   machine could confirm (a bot challenge, a robots.txt that says no, a listing
   resting on a community calendar alone), its number from the guide, and the
   `npm run confirm` line that records the call. It never edits a time or moves a
   file. Merge its pull request and make the calls; the Wednesday editor run
   (step 1) works what it flagged. How a
   confirmation shows on the site, and what "listed" means, is in the content
   README ("Sources, check dates, and staging").
1. `npm run ingest`, then `npm run review`: the feeds' new items and changes land in
   staging and the review walks them (see *Review* below), with the summary at the
   top: what is waiting, listings going stale in 14 days, sources not answering.
   The ingest runs on its own every Monday morning
   (`.github/workflows/weekly-ingest.yml`): it checks the sources, reads the feeds
   into staging, approves what the standing rules allow (`npm run auto-review`,
   below), validates, and opens a pull request on the `automation/ingest` branch
   whose body lists what was approved, what waits and why. Merge it; close it
   unmerged and nothing has happened. Nothing it writes reaches a site until that
   merge. What waits is reviewed on Wednesday, once the research drafts are in, by
   `.github/workflows/weekly-editor.yml`: Claude Code on the API, following the
   editor skill, rules on every flag against its source, approves the soonest
   staged events and longest-waiting places only where the organizer's or the
   business's own page says the same thing that day, publishes next Monday's
   weekly notes from the drafts with anything unsourced dropped, and opens one
   pull request (`automation/editor`) whose body is a table of its rulings. Read
   it and merge it. Its prompt is `.github/weekly-editor.md`; it can edit only
   under `content/`, and it stops at $10 of API use. To decide the queue yourself
   instead, check the ingest branch out and run the review there before merging.
   `npm run weekly` still prints the longer report, per town: events whose last date
   falls within the next 7 days (add the next dates or delete the file), events
   already past, towns with fewer than 5 upcoming events, places without a photo,
   and listings not re-checked in 30 days — that week's share of the rotation.
   `--town=lyons`, `--days=14` and `--json` narrow or reshape it.
2. Collect the week's events in a CSV with the columns in
   `scripts/templates/events-template.csv` (title, start, end, venue, url, category,
   town are required; address, cost, description, source, repeat, until, recurring,
   allDay, timeNote, verified, slug, image, imageAlt, featured are optional). Dates
   are Denver wall-clock, `2026-10-03T10:00` or `2026-10-03`. A series goes in as
   dated rows, or one file with `repeat`, when the organizer gives the dates or
   states the rule ("every Thursday through December") on its own page.
3. `npm run import-events -- week.csv --dry-run`, read the output, then run it without
   `--dry-run`. Every row is checked against the event schema first; an existing file
   is left alone unless `--force` is given. `source` defaults to `url` and `verified`
   to today, so every imported event carries both.
4. `npm run validate`, commit, push. Vercel rebuilds every live site.
5. On the send day, the issue is waiting as a pull request: `.github/workflows/newsletter-drafts.yml`
   runs `npm run newsletter` every Thursday morning, writes one file per edition
   into `content/hub/issues/` and opens a pull request on `automation/newsletter`
   whose body lists every edition and the subscriber tags it goes to. Read it, edit
   a file on the branch if something wants saying, and merge it by Friday: the merge
   sends every edition through Buttondown (`.github/workflows/newsletter-send.yml`,
   `npm run send-newsletter`, which needs `BUTTONDOWN_API_KEY`) and each file becomes
   its archive page. Close it and nothing is sent. By hand, `npm run newsletter -- --number=N` drafts one issue per edition
   (see *Editions* below) and one for the whole network from the listings: the weekend by day, anything still
   running, the week after, places added since the last issue (from the git history,
   so not in a shallow checkout) and articles published that week. Each draft is
   Markdown under a frontmatter block in the shape of `content/hub/issues/`.
   `--town=lyons`, `--date=2026-10-01` and
   `--out=drafts` narrow it, move it, or write files instead of printing. It drafts;
   it never sends. Canceled events and closed places are left out of it.

Rules at entry, the same on every guide, and now enforced by the build: nothing
publishes without a `source` and a `verified` date, an open listing is hidden once
its check is older than its freshness window (its hours go first), a permanently
closed place keeps only its page, every item links to `/correct/`, and anything not
ready waits in `content/<town>/staging/` with a line saying why. A town's site is a
holding page until its config says `status: 'live'`. No listing publishes without a
website and hours taken from the business itself (a business with no site gets no
hours rather than a review site's), and its phone too where the business publishes
one (the owner, 10 October 2026: no phone is not a bar to listing); a weekday and date
without a year count as dated when they fall on that weekday this year; hours are
written with am and pm; every listing and event carries a status; a review site or
an aggregator is never the source.

The owner loosened these on 11 October 2026 (DECISIONS.md, *The owner's rules of
11 October*): a business's own Facebook or Instagram page counts as its own page;
Google Maps showing a place open counts as a second source that it is open, never
for its hours, prices or phone; a series the organizer states as a rule ("the second
and fourth Wednesday") may be listed on the organizer's word; a mountain listing
stays up 60 days from its check (hours 45); a place in a neighbouring town with no
guide of its own may be listed as `area: "Nearby: <town>"`; an article publishes
once it is accurate and sourced; and a content handoff is spot-checked (about one
item in five, every photo licence) and accepted on its own reading when no more
than one checked item in ten has a material error, with `verifiedBy` naming who
read it. A source that refuses automated reads is not worked around.

## Folded and quiet guides

A town too small or too thin to hold a guide of its own can be **folded**
into a neighbour as a section, as Severance was into Windsor and Fort Lupton
into Carbon Valley on 12 October 2026: its content moves to the neighbour's
folder with a `subTown` on every event and place, the neighbour lists it in
`subTowns` (which gives it a `/<town>/` page and a "Where" filter), its own
config takes `status: 'redirect'` and `foldedInto`, and host-scoped rules in
`vercel.json` send every path on its old domain to the same page on the new
one (docs/REDIRECTS.md). `test/folded-towns.test.ts` holds the four in step.
New Severance content goes in `content/windsor/` with `subTown: severance`;
new Fort Lupton content in `content/carbon-valley/` with `subTown: fort-lupton`.

A guide the owner wants out of the weekly routine while deciding whether to
keep it is made **quiet** (`quiet` on its config: since, decide by, why), as
Elizabeth was on 12 October 2026, to be decided by 15 November. It stays up
and accurate as far as the rotation reaches, but makes no weekly promise: no
email signup on its pages or box for it on any other, no Thursday draft, and
one line in the weekly report counting the days to the decision.

A **visitor guide** (`visitorGuide` on its config: since, why) is a destination
people plan a trip around, kept current but not published weekly: Black Hawk,
Leadville and Manitou Springs, from 12 October 2026. It has no weekly email,
signup or Thursday draft, but unlike a quiet guide it stays in the weekly
report, labeled, because a mountain listing still expires sixty days from its
check; about a monthly pass keeps it whole.

## Editions

The weekly email goes out as editions (`src/lib/editions.ts`). Most are one
guide's. `newsletter.editions` on the hub config names the few that share one
issue, one signup box and one sponsor line while each keeps its own site:
Windsor, Severance and Timnath; Idaho Springs and Georgetown; Loveland and
Johnstown. A shared edition's draft has each town's listings under its own
heading. Subscribers are still tagged by town, so in Buttondown a shared
edition is sent to everyone tagged with any of its towns (one email each,
however many of them they ticked), and an edition of one to its town's tag.
On a guide the signup ticks that guide's edition with the guide's own tag;
on the hub a shared edition's box posts its lead town's tag. Fifteen
editions as of 12 October 2026; `npm run newsletter -- --town=timnath`
drafts the edition Timnath is in.

## The source registry

`content/<town>/sources.json` is the list of places checked each week for that
town. `npm run sources` prints what is still proposed, core entries (the town
calendar, the chamber, the library, the parks department, the venues the
calendar leans on) first; `npm run sources -- confirm lyons townoflyons-com`
confirms one; `npm run sources -- check` asks each confirmed source whether it
still answers, robots.txt honoured, and records the result for the weekly
report; `npm run sources -- seed` proposes entries for any host the content
cites that the registry does not yet know. A proposed source is never read by
ingest; it has no effect on what publishes.

## Ingest

`npm run ingest` reads every confirmed feed source (`ical`, `rss` or `json` with
a `feedUrl` in `content/<town>/sources.json`), honouring each site's robots.txt
unless the editor has set `robots: subscribe` on the source, and writes what it
finds into `content/<town>/staging/events/`, one file per occurrence, with a
`review` line naming the source and every guess (venue, category). An item the
guide already has, found by the feed's id or by the same day and nearly the same
title, is compared instead: a moved time, a confirmed venue change or a
cancellation is written to `staging/changes/<slug>.json` and the published file
gets `changeFlag: true` and a `changeNote`, and nothing else about it changes.
Cancellations sort first in the weekly report. `--town=erie`, `--source=<id>` and
`--dry-run` narrow it or hold it. iCalendar is read with ical.js (recurrence,
exceptions and time zones are where a hand-written parser gets dates wrong);
RSS (CivicPlus calendars) and The Events Calendar's REST format are read here.
Nothing ingest writes is published: approval is the review's.

## Review

`npm run review` is the weekly session's front door. It prints the summary
first, per town: what is waiting in staging, listings whose check crosses the
freshness window in the next fortnight, and confirmed sources whose last check
failed. Then it walks the queue, cancellations first, then other changes the
sources made to published events and the listings the nightly re-check flagged
(`changeFlag` with the evidence in `changeNote`, no change file), then staged
places, then staged events by date, and at each one takes `a` (approve: stamp
`verified` and `verifiedBy`, and `added` on a place, drop the `review` block,
move the file into the published folder; for a change, write the source's new
facts into the published file and clear the flag; for a re-check flag, the
listing now says what the source says, so clear the flag and stamp the check),
`e` (open the file in `$EDITOR`, validate, ask again), `r` (reject: delete a
staged file, or dismiss a change or a flag and keep the listing), `o` (open the
source URL), `s` (skip), `A` (approve the rest of the town's queue; a flag is
skipped, since it needs a person's read) or `q`. Nothing is approved
without a `source`. `--town=lyons` narrows it, `--summary` prints only the
summary, `--by="Name"` says who approved (else `REVIEWER`, else git's
user.name). Then `npm run validate`, commit, push.

`npm run auto-review` is the same review without a person at the prompt, under
standing rules (`scripts/lib/auto-review.ts`; the owner's delegation of 15
October 2026). It approves a staged event only when the organizer's own
confirmed feed listed it (a town, county, library or parks calendar, or a
venue's own; never a chamber's or a paper's), the venue is named and is a
place, the date is ahead and within 400 days, nothing in the organizer's text
says canceled or postponed, no published listing has the same title that day,
and the editor did not hold it by hand. The published body is one sentence
from the feed's fields and the organizer's description quoted as its own
words, never passed off as the guide's. A change is written in when the same
feed moved a listing's time, named its venue or called it off; a change to
the day, to a weekly series, or from another source waits. Staged places
never approve here. `verifiedBy` names the feed, the day it was read and the
run. `--dry-run` decides and writes nothing; `--report=<file>` writes the same
report as Markdown (the Monday pull request's body); `--by` names the run.

## Link rot

`npm run check-links` asks every outbound link in the content whether it is still
there, and prints the file and line of any that are not. A café redesigns, a town
moves a department page, a festival lets its domain lapse — none of which the build
can see, because the link is still perfectly good HTML.

It is not part of `npm run build` or the validator, which stay offline and fast, and
it puts a request on every small business in the network, which is fine monthly and
rude daily. Run it before a push that touches sources, and roughly monthly otherwise.

It fails (exit 1) on a 404, a 410, a URL that will not parse, or a link that now lands
on a different site — a 200 from the wrong host, which is what a lapsed domain bought
by a casino looks like, and which a status code alone would call fine. A 403 is nearly
always a bot challenge rather than a dead page — Cloudflare answers most town and
small-business sites that way — and a timeout is usually our end, so both are
reported and neither fails the run. A check that cries wolf gets ignored, and the
real 404 gets ignored along with it.

It reads each site's robots.txt first and does not fetch a link the site asks
automated clients to leave alone. Those are listed by host as "not fetched", for a
person to check in a browser. The Lyons Recorder, the source of many Lyons events,
is one of them.

`npm run check-links -- niwot` narrows it to one town.

Each town also publishes its upcoming events as an iCalendar feed at
`/events/calendar.ics` (weekly repeats expanded 120 days out), linked from the
events page, so readers can subscribe in a calendar app.

## Finding things

- `/search/` on every site: Pagefind indexes `dist/` at the end of `npm run build`
  (`scripts/run.ts`) and the page loads the static index from `/pagefind/`. The
  hub's index also holds every live guide's places, articles, upcoming events and
  Moving Here page, linking to the guide's own domain (`src/lib/network-search.ts`).
  In `astro dev` there is no index and the page says so.
- `/events/` is two lists: the one-time events and the town meetings by date
  (filter by when: today, this weekend, next 7 days; by category, with Free at
  the end of the row; the choice stays in the URL, `?when=weekend&category=music&free=1`,
  and a day strip jumps down the fortnight), then "Every week in [Town]", the
  weekly regulars once each with day, time and venue. `/this-weekend/` is the
  weekend as its own page. `/this-week/` on a Front Range guide ends with "Up the hill
  this weekend": two or three of the live mountain guides' weekend listings (and a place
  whose season opens that week), each linking to its page on that mountain guide, with
  campaign tags on the link and a custom analytics event on the click
  (`src/components/UpTheHill.astro`). Nothing on, no strip.
- `/restaurants/`, `/bars-breweries/`, `/coffee/`, `/shops/`, `/trails/`, `/trailheads/`,
  `/parks/`, `/venues/`, `/stay/` and `/services/`: one page per kind of place the guide
  lists at least three of (`src/lib/place-types.ts`), titled "[Kind] in [Town], CO", the
  page a search for "[town] restaurants" or "[town] trails" lands on. The group headings
  on Eat & Drink, Things to Do and the directory link to them (docs/SEARCH-VISIBILITY.md).
- `/directory/` is every place by kind, with an "Open now" pill and a name search.
  Place kinds: restaurant, bar, coffee, shop, trail, trailhead, park, venue, lodging,
  service. A mountain guide's places may carry `seasonal` (season, hours, open and
  close dates, the months it is open or shut, and a note); rows and cards say "Open
  May–Oct" or "Closed for the season" from it, and the weekly report and the review's
  summary list a seasonal listing for a re-check as its season opens or closes
  (`src/lib/freshness.ts`, `seasonRecheck`). A trail, trailhead or park may carry `access` (parking, permit,
  closures, the land manager's conditions page); the town config's `conditionsLinks`
  (CDOT; the park for Estes Park) are linked on Things to Do and every such page.
- `/guides/` is every article by subject. Articles take `sources` (a list of
  `{ label, url }`) and `verified`, shown at the foot.

## Hours

A place's `hours` is one line of text, and the build reads it into schema.org
`openingHours` (`src/lib/hours.ts`) for the open-or-closed status on every row
and page, the "Open now" filter, and the listing's structured data. Write it the
way the existing listings do — `Tue–Sat 10–5; closed Sun–Mon`, `Daily 7 am–2 pm`,
`Wed–Fri 11–2 & 4–8` — and it will be read. Dawn to dusk, by appointment and
seasonal notes are shown as text and make no open-now claim. `npm run validate --
--hours` lists the lines the parser could not read; reword them, or set
`openingHours` (`["Tu-Sa 10:00-17:00"]`) on the listing and keep the text for
display.

## Sponsors

`sponsors` on a town config (`events`, `movingHere`, `email`) and on the hub
(`email`) switch on the labeled placements /advertise/ describes. Every slot
renders nothing until set. `/for-businesses/` on each town explains listings
and placements to a business owner.

- `PLAN.md` — the build plan, phase by phase
- `DECISIONS.md` — choices made along the way
- `src/config/towns/` — one file per town; `index.ts` exports `getSite()` / `getTown()`
- `content/<town>/` — events, places, articles, pages, images, and `staging/` for what is not yet publishable (see the README in each)
- `src/config/freshness.ts` — how long a checked fact stays publishable; `src/lib/freshness.ts` decides, `src/lib/content.ts` applies, on every page
- `docs/CHASSIS_TWEAKS.md` — where the shared template did not fit a town, logged for the owner to pick from
- `docs/ACCURACY-SYSTEM.md` — the accuracy brief: what the build enforces and why, phase by phase
- `IMAGE_LICENSES.csv` — every image, its source and licence
- `docs/PHOTOS.md` — how to get the missing photographs, and what has been ruled out
- `docs/PHOTO-CONTACTS.csv` — every open listing without one (610 on 11 October 2026), with phone, website, the shot wanted and permission status
- `docs/CALL-LIST.md` — the listings that need a phone call, and the question to ask
- `docs/VERIFICATION-QUEUE-2026-10-11.csv` — every staged record as of 11 October 2026, what was decided and what is still open
- `docs/PARK-PHOTO-EMAILS.md` — ten ready-to-send requests covering 41 parks and trails
- `docs/VENUE-PHOTO-EMAILS.md` — fourteen more covering the 21 venues, and how to reach the 139 businesses at once
- `docs/INDUSTRY-EMAILS.md` — twelve messages to the trade bodies that reach those 139 businesses, with verified addresses
- `docs/ALL-PHOTO-EMAILS.md` — all 36 of those messages in one file, in the order to send them, with one tracking table
- `docs/BACKLINKS.md` — verified local link targets per town, and the two domains not to touch
- `docs/SEARCH-VISIBILITY.md` — Search Console verification (tokens come from each Vercel project’s environment, never the repo), the sitemap URLs, the permanent events pages, and the weekly measurement table
- `docs/PHOTO-PRIORITIES.md` — the photographs the three flagship guides (Lyons, Niwot, Golden) need first, with the subject and alt-text guidance for each
- `docs/OUTREACH-FLAGSHIPS.md` — the human partnership tasks for the three flagships: who to ask for a link, a source, distribution or a calendar; nothing on it has been done
- `docs/LAUNCH-AUDIT.md` — the launch audit: what was fixed, what is left, what needs the owner
- `docs/AUDIT-2026-10-02.md` — the October site audit: every finding and what was done with it, the phone list, and the weekly routine and event standard the guides are held to
- `docs/EXPANSION-WINDSOR-FORT-COLLINS.md` — the plan for the two northern guides: what to settle first, what changes beyond the scaffold, the sources checked

Requires Node 22.18+ (scripts use Node's built-in TypeScript support).
