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
scripts/screenshot.sh out/ / /events/   # phone/tablet/desktop captures of dist/
```

## The weekly content session

The standing routine is `docs/AUDIT-2026-10-02.md`'s: one town at a time on a
fixed day, every event in the next 14 days confirmed against the organizer's
own page, and every listing re-checked within 30 days (about nine a town a
week, against the business's own site, by phone when the site is unclear).
Mark, don't delete: a place that has closed gets `status: closed` and a note
saying how you know, a meeting the Town has called off gets `status:
canceled`, and the pages do the rest (see any content README).

1. `npm run ingest`, then `npm run review`: the feeds' new items and changes land in
   staging and the review walks them (see *Review* below), with the summary at the
   top: what is waiting, listings going stale in 14 days, sources not answering.
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
   dated rows only when each date is on the organizer's calendar; a rule ("every
   Thursday") that nobody has checked against the calendar is not a listing.
3. `npm run import-events -- week.csv --dry-run`, read the output, then run it without
   `--dry-run`. Every row is checked against the event schema first; an existing file
   is left alone unless `--force` is given. `source` defaults to `url` and `verified`
   to today, so every imported event carries both.
4. `npm run validate`, commit, push. Vercel rebuilds every live site.
5. On the send day, `npm run newsletter -- --number=N` drafts one issue per town and
   one for the whole network from the listings: the weekend by day, anything still
   running, the week after, places added since the last issue (from the git history,
   so not in a shallow checkout) and articles published that week. Each draft is
   Markdown under a frontmatter block in the shape of `content/hub/issues/`. Read it,
   paste the body into Buttondown, send; then drop the file into `content/hub/issues/`
   and it becomes the archive page. `--town=lyons`, `--date=2026-10-01` and
   `--out=drafts` narrow it, move it, or write files instead of printing. It drafts;
   it never sends. Canceled events and closed places are left out of it.

Rules at entry, the same on all nine guides, and now enforced by the build: nothing
publishes without a `source` and a `verified` date, an open listing is hidden once
its check is older than its freshness window (its hours go first), a permanently
closed place keeps only its page, every item links to `/correct/`, and anything not
ready waits in `content/<town>/staging/` with a line saying why. A town's site is a
holding page until its config says `status: 'live'`. No listing publishes without a phone, a
website and hours taken from the business itself (a business with no site gets no
hours rather than a review site's); hours are written with am and pm; every listing
and event carries a status; a review site or an aggregator is never the source.

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
sources made to published events, then staged places, then staged events by
date, and at each one takes `a` (approve: stamp `verified` and `verifiedBy`,
drop the `review` block, move the file into the published folder; for a change,
write the source's new facts into the published file and clear the flag), `e`
(open the file in `$EDITOR`, validate, ask again), `r` (reject: delete a staged
file, or dismiss a change and keep the listing), `o` (open the source URL), `s`
(skip), `A` (approve the rest of the town's queue) or `q`. Nothing is approved
without a `source`. `--town=lyons` narrows it, `--summary` prints only the
summary, `--by="Name"` says who approved (else `REVIEWER`, else git's
user.name). Then `npm run validate`, commit, push.

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
  (`scripts/run.ts`) and the page loads the static index from `/pagefind/`. In
  `astro dev` there is no index and the page says so.
- `/events/` filters by when (today, this weekend, next 7 days, free) and by
  category, keeps the choice in the URL (`?when=weekend&category=music`), and
  has a day strip that jumps down the fortnight. `/this-weekend/` is the weekend
  as its own page.
- `/directory/` is every place by kind, with an "Open now" pill and a name search.
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
- `docs/ACCURACY-SYSTEM.md` — the accuracy brief: what the build enforces and why, phase by phase
- `IMAGE_LICENSES.csv` — every image, its source and licence
- `docs/PHOTOS.md` — how to get the missing photographs, and what has been ruled out
- `docs/PHOTO-CONTACTS.csv` — the 187 businesses without one, with phone and website
- `docs/PARK-PHOTO-EMAILS.md` — ten ready-to-send requests covering 41 parks and trails
- `docs/VENUE-PHOTO-EMAILS.md` — fourteen more covering the 21 venues, and how to reach the 139 businesses at once
- `docs/INDUSTRY-EMAILS.md` — twelve messages to the trade bodies that reach those 139 businesses, with verified addresses
- `docs/ALL-PHOTO-EMAILS.md` — all 36 of those messages in one file, in the order to send them, with one tracking table
- `docs/BACKLINKS.md` — verified local link targets per town, and the two domains not to touch
- `docs/LAUNCH-AUDIT.md` — the launch audit: what was fixed, what is left, what needs the owner
- `docs/AUDIT-2026-10-02.md` — the October site audit: every finding and what was done with it, the phone list, and the weekly routine and event standard the guides are held to
- `docs/EXPANSION-WINDSOR-FORT-COLLINS.md` — the plan for the two northern guides: what to settle first, what changes beyond the scaffold, the sources checked

Requires Node 22.18+ (scripts use Node's built-in TypeScript support).
