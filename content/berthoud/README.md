# Content for Inside Berthoud

Everything on insideberthoud.com that is not layout lives in this folder. Edit
Markdown, commit, push; the site rebuilds. No code changes needed.

```
content/berthoud/
  events/       one .md per event          → /events/<file-name>/
  places/       one .md per place          → /places/<file-name>/
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
source: "https://organizer.example/calendar"  # optional, where the listing was read
verified: "2026-09-17"            # optional, the day it was checked
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
source: "https://…"               # optional, where the listing was checked
verified: "2026-09-09"            # optional
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
TOWN=berthoud npm run dev   # preview at http://localhost:4321
```

`npm run build` runs the validator first and refuses to build broken content.
