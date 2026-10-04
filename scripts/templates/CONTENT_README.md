# Content for Inside __NAME__

Everything on inside__SLUG__.com that is not layout lives in this folder. Edit
Markdown, commit, push; the site rebuilds. No code changes needed.

```
content/__SLUG__/
  events/       one .md per event          → /events/<file-name>/
  places/       one .md per place          → /places/<file-name>/
  staging/      events/ and places/ waiting for a source or a check; never built
  sources.json  the places the editor checks each week (see below); never built
  articles/     one .md per article        → /articles/<file-name>/
  pages/        moving-here.md             → /moving-here/
  images/       photos referenced above, plus hero.jpg
```

The file name is the URL slug: `events/holiday-parade.md` → `/events/holiday-parade/`.
Use lowercase letters, numbers and hyphens. A file starting with `_` is ignored (drafts).

## Dates and times

Write times as they appear on the poster, in Colorado time, quoted:

```yaml
start: "2026-10-03T10:00"    # 10 am
end: "2026-10-03T14:00"
```

A date alone (`"2026-10-03"`) means midnight; add `allDay: true` for all-day events.
Do not add a timezone suffix. Events disappear from the site automatically once they end.

## Images

Put photos in `images/` and reference them relative to the Markdown file:

```yaml
image: ../images/holiday-parade.jpg
imageAlt: "Floats on 2nd Avenue during the holiday parade"
```

`imageAlt` is required whenever `image` is set. Every photo also needs a row in
`IMAGE_LICENSES.csv` at the repo root: `path, source_url, license, credit_required (y/n), town`.

## Event

```yaml
---
title: "Holiday Parade"
start: "2026-11-28T11:00"
end: "2026-11-28T13:00"          # optional
allDay: false                     # optional
venue: "2nd Avenue"
address: "2nd Ave & Franklin St"  # optional
url: "https://organizer.example"  # optional, the organizer's page
cost: "Free"                      # optional, "Free" or a note
category: festival                # music|market|festival|outdoors|family|food|arts|civic|sports|other
image: ../images/parade.jpg       # optional
imageAlt: "…"                     # required with image
recurring: "Every Saturday through October"  # optional, display only
repeat: weekly                    # optional: one file covers every week on start's weekday…
until: "2026-12-15"               # …through this date (inclusive). Cards say "Every Tuesday through December 15".
timeNote: "Time to be confirmed"  # optional, shown instead of the time range
source: "https://organizer.example/calendar"  # where the listing was read; without it the build holds the event back
verified: "2026-09-17"            # the day it was checked; same
featured: false                   # optional
---
Description in Markdown.
```

A weekly regular (trivia, a market, a class) is one file with `repeat: weekly` and `until`.
The events page shows every date for the next two weeks and one date after that.

## Place

```yaml
---
title: "Niwot Tavern"
type: restaurant                  # restaurant|bar|coffee|shop|trail|park|venue|lodging|service
address: "7960 Niwot Rd"
area: "Cottonwood Square"         # optional district or landmark, shown on the card
url: "https://…"                  # optional
source: "https://…"               # where the listing was checked; without it the build holds the listing back
verified: "2026-09-09"            # the day it was checked; same
phone: "303-555-0100"             # optional
hours: "Tue–Sun 11am–9pm"         # optional
priceRange: "$$"                  # optional: $ $$ $$$ $$$$
image: ../images/tavern.jpg       # optional
imageAlt: "…"
tags: [patio, live-music]         # optional
featured: true                    # optional, floats to the top and the home page
summary: "One or two sentences shown on the card."
---
Longer description in Markdown.
```

`restaurant`, `bar` and `coffee` appear under Eat & Drink; `trail`, `park` and `venue` under Things to Do.

## Sources, check dates, and staging

Nothing publishes without a `source` (the organizer's or the business's own page,
never a review site or an aggregator) and a `verified` date. An event or a place
in the published folders that lacks either is left out of the build, with a line
on the build log and in `npm run validate` saying so; the file is not deleted.
A listing that claims to be open is also left out once its `verified` date is
older than its freshness window (90 days on a Front Range guide, 30 on a mountain
one; `src/config/freshness.ts`), and its hours go first (60 and 30 days). The
weekly report lists what is due for a re-check well before that.

Anything not ready to publish goes in `staging/events/` or `staging/places/`,
same frontmatter plus one line saying why it is waiting:

```yaml
review: { reason: "No site of its own; call for hours and phone.", since: "2026-10-03", from: manual }
```

`from` is `migration`, `ingest`, `submission` or `manual`. `npm run ingest` fills
`staging/events/` from the confirmed feeds in `sources.json` (each file says which
source and what was guessed), and writes any change a feed makes to an already
published event to `staging/changes/<slug>.json`, setting `changeFlag` on the
published file and touching nothing else there. The build never reads
`staging/`. To publish, settle the question, set `source` and `verified`, remove
the `review` line and move the file up a level (the review CLI does these in one
step). A published file still carrying `review` fails validation, as does a staged
file without one.

## The source registry

`sources.json` lists the places checked each week for this town: the town
calendar, the chamber, the library, the parks department, the venues the
calendar leans on, and the rest. Each entry has an `id`, a `url`, a `type`
(`ical`, `rss` or `json` with a `feedUrl`; `html` or `manual` otherwise), a
`category` and a `status`. `npm run sources -- --town=__SLUG__` lists what is
still `proposed`, core entries first; `npm run sources -- confirm __SLUG__ <id>`
confirms one. Only a confirmed feed is ever read by ingest. The status has no
effect on what publishes: an event or place publishes on its own `source` and
`verified`, whatever the registry says about that host. An item may name its
registry entry with `sourceId`; the validator checks the id exists.

## Closed places and canceled events

A listing that cannot say "closed" lies the day the business does. Both
collections carry a `status`, and anything but the default needs a note saying
what happened and how you know:

```yaml
# a place
status: closed                    # open (default) | temporarily-closed | closed
statusNote: "Reported closed on February 21, 2026, ahead of the sale of the building (Retro 102.5)."
statusSource: "https://…"         # optional, the report or notice

# an event
status: canceled                  # scheduled (default) | postponed | canceled
statusNote: "The Town's meeting page lists this meeting as canceled."
statusSource: "https://…"         # optional
```

A permanently closed place keeps its page, headed "Permanently closed" with the
note, and loses everything else: its hours, its phone, its directory row, its place
in the site search and the sitemap. A temporarily closed place keeps its row,
labeled, with the hours gone. A canceled event stays on the calendar, struck
through, for the reader who planned to go, and leaves the picks, the feeds and the
weekly email. Delete a file only when the listing was never right; otherwise mark
it, so the URL keeps answering.

## Article

```yaml
---
title: "Five trails within ten minutes"
date: "2026-09-01"
updated: "2026-09-15"             # optional
excerpt: "One or two sentences for cards and search."
category: "Outdoors"
tags: [outdoors]                  # articles tagged outdoors also show on Things to Do
image: ../images/trail.jpg        # optional
imageAlt: "…"
---
Body in Markdown.
```

## Checking your work

```
npm run validate          # every file, every town
TOWN=__SLUG__ npm run dev   # preview at http://localhost:4321
```

`npm run build` runs the validator first and refuses to build broken content.
