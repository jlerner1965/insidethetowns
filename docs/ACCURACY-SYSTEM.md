# The accuracy system: inspection and proposal

*3 October 2026. Phase 1 of the accuracy brief: what the repo already is,
where the brief lands on it, and what to build. Nothing below changes the
sites; it is the report the brief asks for before any large change.*

## 1. What the repo is

**One Astro 7 project, static output, one Vercel project per domain.** The
`TOWN` env var picks the site at build time (`src/config/index.ts`). There is
no per-town fork anywhere: components read `getSite()`/`getTown()`, town
differences live in `src/config/towns/<slug>.ts` and `content/<slug>/`. The
hub (insidethetowns.com) is the same build with `TOWN=hub`. This is the shared
chassis the brief wants to extend, and it is already the only way to add a
town (`npm run new-town`).

**Nine towns are live, not seven.** The brief's table omits two guides that
went live on 1 October 2026: Windsor (insidewindsorco.com) and Fort Collins
(insidefortcollins.com). Live today, each answering 200: Niwot, Lyons,
Berthoud, Erie, Johnstown, Timnath, Elizabeth, Windsor, Fort Collins, and the
hub. None of the Wave 1 to 4 towns in the brief exists in the repo yet, and
none of their domains answers (checked: carbonvalleyguide.com,
insidefirestone.com, insidelongmontco.com, insideloveland.com,
insideestespark.com, insidegolden.com all fail to resolve from here).

**There is no "variant" concept.** All nine towns are Front Range in the
brief's sense. Nothing in config or components distinguishes a mountain town;
`variant` would be a new field.

### Where content lives

Markdown with YAML frontmatter, one file per item, under
`content/<town>/{events,places,articles,pages}/`. Astro content collections
load every town into one collection with ids `<town>/<slug>`
(`src/content.config.ts`); pages reach them only through
`src/lib/content.ts`, which filters to the town being built. The Zod schemas in
`src/content/schemas.ts` are shared between Astro and the offline validator,
so there is one definition of a valid entry. Git is already the audit log and
the only store. No CMS, no database, no JSON or YAML data files beyond
frontmatter. A file whose name starts with `_` is a draft and is never built.

| | events | places | articles |
|---|---|---|---|
| Files | 653 (621 not yet past) | 337 | 29 |
| With `source` | 653 | 329 | n/a (`sources[]`) |
| With `verified` | 653 | 332 | most |
| `verified` within 30 days | all | 297 (40 carry a September date, nearly all on the call list) | |

### How events and listings are produced

- **Events** come in three ways: by hand as a markdown file; by
  `npm run import-events -- week.csv` (CSV to markdown, every row checked
  against the schema, `source` defaulting to `url` and `verified` to today);
  and from reader submissions on `/submit-event/` (a Formspree form that
  requires the organizer's link), which land in an inbox and are typed up.
  There is no feed ingestion of any kind. Weekly series are either one file
  with `repeat: weekly` + `until`, or one file per date (`src/lib/series.ts`
  picks the canonical page of such a series).
- **Listings** are written by hand, one file each, against the business's
  own site. The October rotation (`DECISIONS.md`, 3 October) re-checked 192
  of them in a day; 42 that cannot be checked online sit in
  `docs/CALL-LIST.md` for the owner to phone.
- **Rules at entry** (README, every content README): the business's own site
  is the source, never a review site, aggregator or directory; a business
  with no site gets no hours; every item carries a status.

### How they are rendered, and what the build already enforces

- **Past events vanish three ways**: filtered at build (`src/lib/events.ts`,
  `isPast`), removed in the reader's browser by `Freshness.astro` when the
  build is stale, and the sites are rebuilt three times a night and Thursday
  afternoon by `.github/workflows/scheduled-rebuild.yml` (Vercel deploy
  hooks). Past event pages stay reachable but carry noindex and leave the
  sitemap. Acceptance criterion 2 of the brief is already met.
- **Status exists on both collections**: events `scheduled | postponed |
  canceled`, places `open | temporarily-closed | closed`, each requiring a
  `statusNote` saying who says so and taking an optional `statusSource`. A
  canceled event stays on the calendar struck through and leaves the picks,
  feeds and newsletter; a closed place keeps its page, loses its hours and
  open-now badge.
- **Provenance is shown on detail pages**: every event and place page ends
  with "Checked 3 October 2026 against niwothall.org", the host linked. Cards
  and directory rows do not show it.
- **A correction route exists on places only**: "Own or run X? Send a photo,
  new hours or a correction" links to `/contact/?about=<name>`, the Formspree
  contact form (honeypot, CSP-checked). Event pages have no correction link.
- **`npm run validate`** runs before every build and in CI: schema, image
  files, licence ledger, form actions against the CSP, repeating-event slugs.
  `npm run check-links` (monthly, by hand) honours robots.txt and fails on a
  link that now lands on another host, which is how a hijacked domain looks.
- **`npm run weekly`** is a first cut of the weekly report: events expiring,
  events past, calendar runway, towns under 5 upcoming events, places
  without a photo, listings not re-checked in 30 days.
- **`LIVE_TOWNS`** in `src/config/index.ts` is the manual live gate: CI
  builds only those, the hub lists only those and names the rest under
  "coming soon". There is no count-based threshold.

### Hosting and deploy

Vercel Pro, one project per domain, all on this repo, production from `main`,
`TOWN` the only setting that differs (`DEPLOY.md`). CI (`ci.yml`) runs tests,
validate, colour contrast and `astro check`, then builds every live site.
Headers and redirects live in `vercel.json`; the build also writes
`_headers`/`_redirects` so Cloudflare Pages or Netlify would read the same
rules. Email for every domain is Cloudflare Email Routing forwarding
`hello@<domain>` to the owner's inbox; there is no sending capability.

### Redirects already in place (checked live today)

- `townofniwot.com/*` → 308 → `insideniwot.com/*` (`/events/` keeps its path,
  an unknown path goes to the home page). Served by the old `cityofniwot.com`
  repo's Vercel project, not this one.
- `explorelyons.com` → 308 → `www.explorelyons.com` → 308 →
  `insidelyons.com/*`, path preserved; `/civic/` maps to
  `/articles/who-governs-lyons/`. Also served from the old repo.

Both are 308 (permanent, method-preserving) rather than 301, which is what
Vercel emits for `permanent: true`; search engines treat them alike. An
unknown Lyons path is passed through and 404s on insidelyons.com rather than
going home, which differs from the brief's rule; see 4.5.

## 2. Items without a source or a verified date

Every event has both. Eight places lack a
`source`; five of those also lack `verified`. None is an oversight: each lost
its source on purpose in the October audit because the only source was a
review site or a dead domain, and each is on the call list.

| File | source | verified | Why |
|---|---|---|---|
| `content/berthoud/places/berthoud-inn.md` | – | – | TripAdvisor source removed; its own domain is parked |
| `content/elizabeth/places/coffee-house-on-main.md` | – | – | Hours were Yelp's; no site of its own |
| `content/elizabeth/places/cowgirlz-coffee.md` | – | – | Same |
| `content/johnstown/places/we-knead-donut.md` | – | – | Same |
| `content/timnath/places/chelos-modern-mexican.md` | – | – | Same |
| `content/johnstown/places/cassidys-sports-grill.md` | – | 2026-09-18 | Its domain redirects to a gambling site |
| `content/lyons/places/julies-thai-kitchen.md` | – | 2026-10-03 | Its domain serves spam |
| `content/lyons/places/lyons-dairy-bar.md` | – | 2026-10-03 | Same, same address |

Also worth knowing before the rule is enforced: 99 events have no `url` (all
have a `source`), and among 334 open places 153 have no phone, 87 no hours
and 32 no website. The audit chose not to apply the entry rule backwards to
these; the brief's "no source, no publish" would hide the eight above and
nothing else.

## 3. Where the brief and the repo disagree

These need a word from James before phase 2, because each changes what gets
built.

1. **Field names.** The brief's `sourceUrl`, `verifiedAt`, `startDateTime`,
   `name` are the repo's `source`, `verified`, `start`, `title`, across 1,000
   files, five scripts and sixteen test files. Proposal: keep the existing
   names and add the brief's new fields (`verifiedBy`, `sourceId`,
   `changeFlag`, `seasonal`, `variant`). A rename buys nothing and touches
   everything.
2. **Freshness windows.** The audit set a 30-day re-check rotation for every
   listing; the brief says Front Range listings are fresh for 90 days and
   hidden after. Proposal: both. The report flags at 30 (the rotation), the
   build hides at 90 (the backstop). Today nothing would be hidden; the
   oldest `verified` on a listing is 9 September.
3. **Listings hidden entirely at 90 days** (decided) means a closed-for-good
   listing marked `closed` with a note would also disappear once stale. The
   closed page exists for the reader who searches for the place. Proposal:
   the freshness gate applies to listings claiming to be open; a `closed`
   listing keeps its page, hours-free, as now.
4. **Towns.** Windsor and Fort Collins are live and not in the brief; the
   brief's Wave 1 to 4 towns and the Firestone redirect have nothing to
   attach to yet. Proposal: build the system for the nine, add
   `status`/`variant`/`launchThreshold` to config now, and scaffold new towns
   with `new-town` when their turn comes. The Firestone 301 waits for
   carbonvalleyguide.com to exist.
5. **Corrections email.** The brief wants a `CORRECTIONS_EMAIL` and asks for
   the address. Every site already has a Formspree endpoint whose destination
   is set in the Formspree dashboard, and `hello@insidethetowns.com` already
   forwards to the owner's inbox. Proposal: a `/correct/` form on the existing
   endpoints (hidden `town`, `item`, `url`, `_subject: [Correction] Lyons ·
   event/…`), `mailto:` fallback to a `correctionsEmail` in hub config. James
   decides whether that address is `hello@insidethetowns.com` or something
   else; nothing is invented meanwhile and the mailto stays dark until set.
6. **Dependencies.** `PLAN.md` says ask before adding any. Ingest needs an
   iCalendar parser and an RSS/Atom parser. Proposal: write both in-repo
   (a few hundred lines; the feeds in play are LibCal, LibraryCalendar,
   Tockify, CivicPlus and WordPress, all plain RFC 5545 / RSS 2.0), no new
   packages. Say so if a dependency is preferred.
7. **Launch threshold and Vercel.** A Vercel project cannot be un-deployed by
   a failed build; the previous deployment stays up. Proposal: a town under
   threshold builds a one-page holding site (noindex, "coming soon"), the hub
   omits it, and CI fails if a town in `LIVE_TOWNS` is under threshold so the
   push is caught before it deploys. All nine towns clear the default 10/15
   today by a wide margin.

## 4. Proposal: how the brief maps onto the chassis

The principle is the one the repo already follows: content stays as markdown
in git, the schema is the gate, and the build cannot see what is not
approved. Staging is a directory, approval is a `git mv` that stamps two
fields, and nothing needs a server.

### 4.1 Schema and validation (phase 2)

- `source` and `verified` become **required** on events and places. The
  eight places in section 2 move to staging (below) with a flag and a note;
  nothing is deleted.
- New optional fields: `verifiedBy` (stamped by the tools from now on; not
  backfilled, because a name nobody recorded would be invented),
  `sourceId` (registry key), `sourceUid` + `sourceHash` (what ingest matched
  and the field fingerprint it saw, for change detection), `changeFlag`,
  `changeNote`.
- Places gain `seasonal { season, hours, closedMonths[] }` and access fields
  for the mountain variant, optional until a town is `variant: mountain`.
- `src/config/freshness.ts`: every window in one file (event: until end;
  listing: 90 front-range / 30 mountain; hours: 60 / 30; access info: 30;
  re-check rotation: 30; report horizon: 14). Tests pin each.
- `TownConfig` gains `status: 'live' | 'wave1' … | 'redirect'`,
  `variant: 'front-range' | 'mountain'`, `subTowns?`, `launchThreshold`
  (default `{ events: 10, listings: 15 }`). `LIVE_TOWNS` becomes derived from
  `status === 'live'` and the threshold, so there is one place that says
  what is live.

### 4.2 Staging (phases 2 and 6)

`content/<town>/staging/{events,places}/`, same frontmatter plus
`review: { reason, since, from }`. The collection globs are
`*/events/*.md`, so staging is invisible to the build by construction, no
filter to forget. Approval moves the file into the collection and stamps
`verified` and `verifiedBy`. A flagged change on an approved item is a
sidecar in `staging/changes/<slug>.yml` holding the diff; the item stays
published as it was until James rules, except a cancellation, which is
applied as `status: canceled` with the feed as `statusSource` and still
queued for a look.

### 4.3 Build gates and UI (phase 3)

- `src/lib/freshness.ts`: `isFresh(place, town)`, `hoursFresh(place, town)`,
  `isPublishable(entry)`. Applied inside `getTownEntries` for places so no
  page can bypass it, and in `openingHoursOf` for hours.
- Launch threshold counted at config time from the content on disk (the
  pattern `src/lib/series.ts` already uses for the sitemap), so the hub,
  the network bar and CI all agree.
- `scripts/run.ts` prints the per-town summary after a build: published,
  expired, hidden as stale, hours hidden, in staging.
- A `Provenance` component replaces the two hand-written footers: "Checked
  3 Oct against niwothall.org · Report a correction" on every event and
  place page, and a one-line "Checked 3 Oct" on cards and directory rows.
  The correction link goes to `/correct/?town=lyons&item=event/…&url=…`.

### 4.4 Source registry (phase 4)

`content/<town>/sources.yml`, validated by a schema in `schemas.ts`, fields
as in the brief. Seeded from the 260 distinct hosts the content already cites
(libcal, librarycalendar, erieco.gov, lyonsrecorder.org, the town sites,
the breweries), every entry `status: proposed` with the count of items
that cite it, so James confirms rather than types. Feed URLs are proposed
only where the site publishes one; everything else is `type: html` or
`manual` and is never fetched. `npm run check-sources` (the link checker's
robots-aware fetch) updates `lastChecked`/`lastStatus`.

### 4.5 Ingest, dedupe, change detection (phase 5)

`npm run ingest -- --town lyons`: confirmed `ical | rss | json` sources only,
robots.txt honoured, normalised to the event schema, written to staging.
Description is the feed's own text marked `needsRewrite: true`, never
published as is. Dedupe on normalised title + Denver day + venue with a
token-overlap score; a near match is merged in staging and flagged, not
dropped. Re-ingest compares `sourceHash` on approved items and files a
change sidecar; `STATUS:CANCELLED` or a vanished UID becomes a cancellation
at the top of the queue.

### 4.6 Review CLI and manual entry (phase 6)

`npm run review -- --town lyons`: cancellations, then changes, then new
items; each shows the source link; keys for approve, edit (opens `$EDITOR`),
reject, open URL, approve all remaining. `npm run add event|listing --town X`
prompts field by field, requires `source`, and asks "publish as approved?"
before writing outside staging. `verifiedBy` comes from `--by`, then
`REVIEWER`, then `git config user.name`.

### 4.7 Weekly report (phase 7)

`npm run report` grows out of `weekly.ts` (which stays as an alias): review
queue and flagged changes, cancellations, listings going stale in 14 days,
broken or changed sources, towns under threshold or under 5 events,
corrections received (Formspree's API if a key is set, otherwise a link to
the inbox), one Markdown file, towns in wave order, worst first.

### 4.8 Redirects (phase 8)

Niwot and Lyons are done and live. Two small things remain, both in the old
repos rather than this one: `explorelyons.com` passes unknown paths through
to a 404 on insidelyons.com where the brief says home page; and both answer
308 rather than 301. Firestone waits for Carbon Valley. A `docs/REDIRECTS.md`
records the rule and the three domains.

### 4.9 Mountain variant (phase 9)

`variant: mountain` switches the 30-day windows on, requires `seasonal` on
restaurants and lodging, and enables access fields on `trail` and `park`
(parking, permit, closure note), each linking to the land manager's live
page rather than restating conditions. Built when Wave 3 is scaffolded.

## 5. What is not proposed

- No admin page, no database, no serverless function: Formspree and a
  `mailto:` cover corrections, and git covers everything else.
- No renaming of existing fields or files.
- No deletion of the eight unsourced listings; they go to staging flagged.
- No scraping of HTML sources. A source without a feed is `manual`.

## 6. Questions for James

1. Keep the existing field names and add the brief's new ones (3.1)?
2. Flag at 30 days, hide at 90 (3.2), and leave `closed` pages up (3.3)?
3. The corrections address: `hello@insidethetowns.com`, or another (3.5)?
4. In-repo iCal/RSS parsers rather than new packages (3.6)?
5. Holding page plus CI failure for a town under threshold (3.7)?
6. Move the eight unsourced listings to staging now, which hides them from
   the sites until a source is found or a call is made (section 2)?

With a yes to each, phase 2 starts from `src/content/schemas.ts`,
`src/config/freshness.ts` and the eight moves, and every step keeps
`npm run validate` and `npm test` green.

## 7. Decided, 3 October 2026

James's answers to section 6, which phase 2 is built on:

1. Existing field names stay; the brief's new fields are added. The mapping
   is section 8, the one place it is written out.
2. Flag at 30 days, hide at 90 on a Front Range guide; a mountain guide hides
   at 30. A `closed` page may stay up only with a clear "Permanently closed"
   notice, no hours or phone, and out of the directory lists and the site's
   search (the notice and the directory and search exclusions are phase 3).
3. Corrections go to hello@insidethetowns.com through Formspree, with the
   honeypot field (phase 3).
4. RSS is parsed in the repo. iCal uses an established package (ical.js or
   node-ical), as a dev dependency used only at ingest: recurrence, time
   zones and exceptions are where a hand-written parser gets dates wrong, and
   accuracy outranks the dependency rule.
5. The launch threshold never fails a build, because a failed build leaves
   the previous, stale deployment up. A not-yet-launched town under threshold
   builds a noindex holding page. A live town that drops under it still
   builds and publishes its verified content, and is flagged as a CI warning
   and in the weekly report. Bad individual items are excluded with a
   warning, not build-breaking.
6. The eight unsourced listings move to staging now.

## 8. Field names: the brief's terms and the repo's

The repo's names predate the brief and sit in about a thousand files, five
scripts and the tests, so they stay. Where the brief names something the repo
had no field for, the field is added under the brief's name. Where the brief
names a state the build computes, no field exists and the row says what
computes it.

### Town config (`src/config/towns/<slug>.ts`)

| Brief | Repo | Note |
|---|---|---|
| `slug`, `name`, `domain` | same | |
| `status` | `status` | added: `live`, `wave1`..`wave4`, `redirect`. `LIVE_TOWNS` is now derived from it |
| `variant` | `variant` | added: `front-range`, `mountain` |
| `subTowns[]` | `subTowns` | added; items on such a guide carry `subTown` |
| `launchThreshold` | `launchThreshold` | added; default `DEFAULT_LAUNCH_THRESHOLD` in `src/config/freshness.ts` |
| `palette` | `colors` | |

### Event (`content/<town>/events/<slug>.md`)

| Brief | Repo | Note |
|---|---|---|
| `id` | the file name | also the URL slug; `slug` overrides |
| `town` | the folder | `content/<town>/` |
| `subTown` | `subTown` | added |
| `title` | `title` | |
| `startDateTime`, `endDateTime` | `start`, `end` | Denver wall clock, no suffix |
| `timezone` | none | always `America/Denver`; `src/lib/dates.ts` |
| `venueName`, `address`, `cost` | `venue`, `address`, `cost` | |
| `description` | the Markdown body | own words |
| `sourceUrl` | `source` | |
| `sourceId` | `sourceId` | added; a key in the town's source registry (phase 4) |
| `status: staged` | the `staging/` folder | plus a `review` block saying why |
| `status: approved` | the published folder | `source` and `verified` present |
| `status: rejected` | deleted | git history keeps it |
| `status: expired` | computed | `isPast` in `src/lib/events.ts`, from `end`/`until` |
| | `status` | the repo's own field is the event's fate: `scheduled`, `postponed`, `canceled`, with `statusNote`/`statusSource`. Not the brief's editorial state |
| `verifiedAt` | `verified` | |
| `verifiedBy` | `verifiedBy` | added; stamped from now on, not backfilled |
| `lastChangedAt` | git history | and `changeNote` says what changed |
| `changeFlag` | `changeFlag` | added, with `changeNote`; also `sourceUid` and `sourceHash` for the re-ingest to match on |
| `recurring` | `repeat` + `until`, or `recurring` (display text) | |

### Listing (`content/<town>/places/<slug>.md`)

| Brief | Repo | Note |
|---|---|---|
| `name` | `title` | |
| `category` | `type` | `restaurant`, `bar`, `coffee`, `shop`, `trail`, `park`, `venue`, `lodging`, `service` |
| `address`, `phone`, `hours` | same | `openingHours` carries the structured form when the text cannot be read |
| `website` | `url` | |
| `seasonal { season, hours, closedMonths[] }` | `seasonal` | added |
| `sourceUrl` | `source` | |
| `status: staged` | the `staging/` folder | with `review` |
| `status: approved` | the published folder | |
| `status: stale` | computed | `placeExclusion` in `src/lib/freshness.ts`, from `verified` and the town's variant |
| `status: closed` | `status: closed` | the repo's field: `open`, `temporarily-closed`, `closed`, with `statusNote`/`statusSource` |
| `verifiedAt`, `verifiedBy` | `verified`, `verifiedBy` | |
| `notes` | `statusNote`, or the body | |
| mountain extras (trailheads, parking, permits, closures) | `access` on a `trail` or `park` | added; its own `source` and `verified`, 30-day window, links the land manager's live page |

### Elsewhere

| Brief | Repo |
|---|---|
| freshness rules, one config file | `src/config/freshness.ts` |
| the gate the build applies | `src/lib/freshness.ts`, applied in `src/lib/content.ts` |
| `CORRECTIONS_EMAIL` | `correctionsEmail` on the hub config (phase 3) |
| source registry | `content/<town>/sources.yml` (phase 4), fields as in the brief |

## 9. Phase 2, built 3 October 2026

- **Freshness config**: `src/config/freshness.ts`, every window in one
  object, tested at each boundary (`test/freshness.test.ts`).
- **The gate**: `src/lib/freshness.ts`. An event or place publishes only
  with a `source` and a `verified`; an open listing only inside its window.
  Applied once, in `src/lib/content.ts`, which every page reads through, so
  no page can skip it. Each exclusion is one line on the build log.
- **A build that does not fail on one bad file.** Events and places load
  through `lenient()` (`src/content/schemas.ts`): an entry that fails its
  schema becomes a marker the gate drops, instead of a failed build that
  leaves the previous deployment serving stale events. `npm run build` runs
  the validator in `--build` mode, which reports the same file the same way;
  `npm run validate` alone, and in CI, is still strict. Tested by building
  Lyons with a deliberately broken event: one warning, 147 events, build
  green.
- **Staging**: `content/<town>/staging/{events,places}/`, invisible to the
  collection globs by construction, each file carrying `review: { reason,
  since, from }`. The validator requires the block there and rejects it in
  the published folders. The eight unsourced listings are there now, each
  with the question a phone call has to answer. The Lyons kids' article no
  longer links the Dairy Bar or repeats its hours.
- **Schema additions**: `verifiedBy`, `sourceId`, `sourceUid`, `sourceHash`,
  `changeFlag` + `changeNote`, `subTown`, `review`, `seasonal`, `access`.
  Nothing existing is required to change.
- **Town config**: `status`, `variant`, `subTowns`, `launchThreshold`.
  `LIVE_TOWNS` is derived from `status: 'live'`; the hand-kept list is gone
  and `new-town` writes the new fields.
- **The scripts' frontmatter reader** now reads an inline map
  (`review: { … }`) and a list inside one (`closedMonths: [ … ]`).
- **The per-town summary** the brief asks every build to print comes from
  the validator, which every build runs: published, excluded by the build,
  in staging, per town.

Not in phase 2, and next: hours hidden at 60 days on the page, the
"Permanently closed" notice and the directory and search exclusions, the
holding page and CI warning for the threshold, the provenance line on cards,
the correction form (all phase 3).

## 10. Before phase 3, 3 October 2026

James's three conditions, and what was found:

1. **The daily rebuild exists and runs.** `.github/workflows/scheduled-rebuild.yml`
   fires every live project's Vercel deploy hook at 04:10, 07:10 and 09:10
   UTC and on Thursday afternoons; all 21 runs to date succeeded, the latest
   three on 3 October. GitHub runs the schedule late (five to eight hours in
   September), which is why there are three overnight fires rather than one,
   and `Freshness.astro` removes finished events in the browser as the
   backstop. Nothing to add; `DEPLOY.md` has the setup.
2. **The strict validator cannot block a deploy.** Vercel's Git integration
   deploys on push without waiting for GitHub Actions, so a red `npm run
   validate` in CI never holds a deployment. The only validator in Vercel's
   path is the one `npm run build` runs, and in `--build` mode it now exits 0
   whatever it finds: entry errors are excluded, repo-level errors are
   printed with a line saying they are not blocking, and CI stays red for
   both. (The Vercel projects were not visible to this session's connector,
   so the Git settings were read from `DEPLOY.md` rather than the dashboard.)
3. **Phases 2 and 3 ship together.** Nothing from this branch is merged
   until the closed notice, the hours hiding and the holding page are in.

## 11. Phase 3, built 3 October 2026

- **Hours hide before the listing does.** The gate strips `hours` and
  `openingHours` from a listing checked more than 60 days ago (30 on a
  mountain guide), so the row, the page, the open-now badge and the
  structured data all lose them at once; the page says "Not shown: last
  checked N days ago. Call to confirm" and the row "Hours not recently
  checked; call ahead". `presentation()` in `src/lib/freshness.ts` decides,
  `shape()` in `src/lib/content.ts` applies.
- **A permanently closed place** keeps its page, now headed "Permanently
  closed", loses its hours and phone, carries noindex, and leaves the
  directory, Eat & Drink, Things to Do, the business count, the site search
  and the sitemap. A temporarily closed place keeps its row, labeled, with
  hours gone and phone kept. Checked on Berthoud: Bradford's page builds
  with the notice and appears in none of the lists or the sitemap.
- **Provenance on every item.** `Provenance.astro` puts "Checked 3 October
  2026 against niwothall.org. Report a correction" on every event and place
  page and "Checked October 3" on every event row and directory row.
- **`/correct/`** on every town: what is wrong, an optional reply address,
  Formspree's honeypot, the town's existing Formspree form, and hidden
  fields for the town, the item and the page, with the subject `[Correction]
  Lyons · event/farmers-market` filled from the link. Falls back to a
  `mailto:` to `hub.correctionsEmail` (hello@insidethetowns.com) where a town
  has no form id. Formspree's destination is set in its dashboard, per form.
- **The launch threshold** is counted from what the build would publish
  (`scripts/lib/launch.ts`). A live town under it is a warning in the
  validator, a GitHub annotation in CI and a line in the weekly report; its
  verified content still publishes. A town whose status is not `live` builds
  one holding page, noindex, with robots.txt disallowing everything and an
  empty sitemap, whatever its count; the validator says when it is ready.
  Checked by building Timnath as `wave1`.
- **The validator never fails a build.** See section 10.

Not in phase 3: the sources registry (phase 4), ingest (5), the review CLI
(6), the report proper (7), the Firestone redirect (8), mountain pages (9).

## 12. Phase 4, built 4 October 2026

Steered first: the "Checked" date comes off event rows and stays on event
pages and directory rows; the rebuild workflow now fails, naming the town,
when a live town has no deploy hook (the secret takes `<slug> <url>` lines;
bare URLs still fire and are counted against the live sites instead).

- **The registry** is `content/<town>/sources.json`, one file per town,
  schema in `src/content/schemas.ts`, read and written only through
  `src/lib/sources.ts` so it always comes back in the same order. Fields as
  in the brief, plus `feedUrl` (what ingest reads; required for `ical`,
  `rss` and `json`), `sampleUrl` (one page the content actually cited),
  `priority` (`core` or `other`) and `cites`.
- **`proposed` blocks ingestion only.** Confirmed: what publishes is decided
  by an item's own `source` and `verified` in `src/lib/freshness.ts`, which
  does not import the registry, and a test keeps it that way. Content that
  cites a proposed host stays up. `sourceId` on an item is optional and the
  validator only checks that it exists.
- **Seeding proposed 84 entries, not 260.** Only hosts cited by an event, or
  by two or more places, are places the editor checks weekly; a business
  cited once by its own listing is that listing's source. Each entry is
  named by its host, carries the page the content cited and how many items
  cite it, and says its category was guessed and its type is `html` until a
  feed is found. Nothing existing is overwritten on a re-seed.
- **Core first.** `npm run sources` lists per town what is proposed, core
  first: `city-calendar`, `chamber`, `library`, `parks`, and a `venue` cited
  by five or more events. 38 of the 84 are core; ticketing platforms such as Tockify and MaxPreps are never core, and a Town's own site is recognised from its config whatever its domain ends in. The rest wait, listed under
  "these can wait until they are needed".
- **`npm run sources -- check`** probes each confirmed source's page (or
  feed) with the link checker's robots-aware fetch, now shared in
  `scripts/lib/probe.ts`, and records `lastChecked`, `lastStatus` and a note.
  The weekly report lists confirmed sources not answering as they should,
  and how many core sources still wait.

Still proposed, by design: everything. Confirming is the editor's, with the
list above.

## 13. Phase 5, built 4 October 2026

Confirmed first, at the owner's direction: the five library and six town
calendars named on 4 October, and Boulder County as `county` (a new
category, core) for Niwot and Lyons. Everything else stays proposed.

- **Feeds found** by fetching each confirmed source's page and the links it
  advertises, then reading each candidate once: Lyons library (iCal), Boulder
  County (iCal, The Events Calendar), the four CivicPlus town sites (calendar
  RSS with structured dates, times and location), the Johnstown Milliken
  libraries (The Events Calendar's REST API; its iCal answered 502), and Pines
  & Plains (five public Google calendars embedded on its activities page; the
  one named "Elizabeth Events" is set, "District Happenings" proposed). Not
  found: High Plains LibCal's public iCal is 500 district-wide events
  starting a month back and never reaches the coming weeks under any
  parameter tried; Timnath's site has no events feed; the Berthoud library is
  a Wix site with no feed; Elizabeth's town site answers automated requests
  with 403. Those four stay `html` or `manual`, each with the finding in its
  note.
- **Two feeds wait on a robots decision.** lyons.librarycalendar.com and
  calendar.google.com both disallow every path for agents they do not list.
  Both feeds are the ones the libraries offer readers under "subscribe". The
  repo's rule has been to honour robots.txt, so ingest does not read them and
  says so each run. The registry has a per-source `robots: subscribe` the
  editor can set; nothing sets it automatically.
- **Readers.** iCalendar through ical.js (a dev dependency, used only here):
  it parses and expands recurrence in the rule's own wall-clock time, so a
  weekly storytime stays at 10:30 across the November clock change; each
  occurrence is then converted to an instant by the repo's own Denver date
  code. RSS and the REST format are read in the repo. Tests pin a weekly rule
  with EXDATE and a moved instance across the clock change, UTC stamps, all-
  day dates, the CivicPlus English dates and 12-hour clocks, and the day-long
  "12:00 AM to 11:59 PM".
- **Matching and change detection** (`scripts/lib/ingest.ts`): the feed's
  own id first; else the same Denver day and a title sharing 60% of its
  words. When the feed has two items with one title on one day, the time
  tells them apart; when it has one, a different time is a moved event. A
  change is a moved start or end, a cancellation, or a venue named with the
  editor's own alias; a feed that says "Council Chambers, 645 Holbrook
  Street" where the guide says "Erie Town Hall" is naming the room, not
  moving the meeting, and is not a change.
- **Per-source editorial knobs**, all optional, none set by seeding:
  `locationFilter` (a county or district feed carries every branch),
  `venueAliases` and `defaultVenue` (the feed's "Johnstown Location" is the
  guide's "Glenn A. Jones, M.D. Memorial Library"), `excludeTitles` (a rec
  centre's daily lap swim), `robots`.
- **What ingest writes**: `staging/events/<slug>.md` with `review` naming the
  source and each guess, the feed's text in the body under a line saying to
  rewrite it, `sourceId`, `sourceUid`, `sourceHash`, and no `verified`;
  `staging/changes/<slug>.json` plus `changeFlag` and `changeNote` on the
  published file, whose facts it never edits. `INGEST.autoApplyCancellations`
  is off: a cancellation goes to the top of the review, not into the file.
- **First real run, 4 October**: see the commit. The review CLI is phase 6.
