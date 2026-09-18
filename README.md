# Inside the Towns

One Astro codebase that builds a network of independent community guides for Colorado
Front Range towns, one deployment per domain, selected by the `TOWN` env var.

```
TOWN=niwot npm run dev        # or: npm run dev -- --town=niwot
TOWN=hub   npm run build      # insidethetowns.com
npm run validate              # check every town's content
npm run new-town lyons "Lyons"
npm run weekly                # the weekly content report (see below)
npm run import-events -- events.csv --dry-run   # CSV → event files
scripts/screenshot.sh out/ / /events/   # phone/tablet/desktop captures of dist/
```

## The weekly content session

1. `npm run weekly` prints, per town: events whose last date falls within the next
   7 days (add the next dates or delete the file), events already past, towns with
   fewer than 5 upcoming events, places without a photo, and listings not re-checked
   in 90 days. `--town=lyons`, `--days=14` and `--json` narrow or reshape it.
2. Collect the week's events in a CSV with the columns in
   `scripts/templates/events-template.csv` (title, start, end, venue, url, category,
   town are required; address, cost, description, source, repeat, until, recurring,
   allDay, timeNote, verified, slug, image, imageAlt, featured are optional). Dates
   are Denver wall-clock, `2026-10-03T10:00` or `2026-10-03`.
3. `npm run import-events -- week.csv --dry-run`, read the output, then run it without
   `--dry-run`. Every row is checked against the event schema first; an existing file
   is left alone unless `--force` is given. `source` defaults to `url` and `verified`
   to today, so every imported event carries both.
4. `npm run validate`, commit, push. Vercel rebuilds every live site.

Each town also publishes its upcoming events as an iCalendar feed at
`/events/calendar.ics` (weekly repeats expanded 120 days out), linked from the
events page, so readers can subscribe in a calendar app.

- `PLAN.md` — the build plan, phase by phase
- `DECISIONS.md` — choices made along the way
- `src/config/towns/` — one file per town; `index.ts` exports `getSite()` / `getTown()`
- `content/<town>/` — events, places, articles, pages, images (see the README in each)
- `IMAGE_LICENSES.csv` — every image, its source and licence
- `docs/PHOTOS.md` — how to get the missing photographs, and what has been ruled out
- `docs/PHOTO-CONTACTS.csv` — the 139 businesses without one, with phone and website
- `docs/PARK-PHOTO-EMAILS.md` — ten ready-to-send requests covering 41 parks and trails

Requires Node 22.18+ (scripts use Node's built-in TypeScript support).
