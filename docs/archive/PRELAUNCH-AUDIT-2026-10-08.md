# Pre-launch audit — 8 October 2026

The hub and all eighteen guides, built from `main` at the day's last merge
(the follow-up-audit pass, the publisher naming and the twenty-one
photographs), then every built page read by a script, the live domains
fetched, and a sample of pages screenshotted at phone and desktop widths.
Everything found and fixed is below, then what was checked and found sound,
then what is knowingly left.

**Result: three things found, all fixed in this pass; nothing else missed.**

## What was checked

| Check | Scope |
|---|---|
| Built pages | 1,986 HTML pages across 19 sites (1,539 in the sitemaps; the rest noindex by design: past and non-canonical event occurrences, search, thanks and correction pages, delisted places) |
| Per page | `<title>`, meta description, canonical on the site's own host, robots, one `h1`, JSON-LD parses, every `<img>` has `alt` and its file, every internal link resolves in the build |
| Across sites | every cross-domain link (about 50,000, the switcher and footer on every page) resolves in the target guide's own build; sitemap URLs all built and on the right host; `robots.txt` and `404.html` present |
| The day's work | the town switcher on every guide page, the hub's task links and location line, the at-a-glance block on all 18 itineraries, "Published by Lerner Works" on every page, the publisher at the top of every structured-data graph, structured prices on event offers, no "Site by", no placeholder text, no "is a government site" |
| Live | all 19 domains: home page 200 with the day's markup deployed, `sitemap-index.xml` 200, `robots.txt` 200; the hub's RSS, a town's `.ics`, RSS and event feeds; a 404 returns 404; security headers (CSP, HSTS, nosniff, DENY, referrer and permissions policies) on hub and guide; Golden's new photographs and credits live |
| Visual | hub, Lyons, Golden, Estes Park, Carbon Valley, Nederland at 390px and 1348px; no script errors; horizontal overflow measured on every site's home page at 1280, 1348 and 1440px |
| Repository | 282 unit tests, `npm run validate` (0 errors), `npm run check-colors` (all pairs AA), `astro check` (0 errors), CI green on the merged head; the scheduled rebuild workflow enabled and succeeding |

## Fixed in this pass

- **The new "Other towns" item pushed the search button off the screen at
  the row breakpoint.** The primary navigation becomes a row at 1280px, and
  the switcher added to it this morning made the row wider than that on
  twelve of the eighteen guides (Carbon Valley by 76px, Fort Lupton 45,
  Fort Collins 40, Johnstown 31, and so on), and still on two of them at
  1348px. The row now reads "Towns" (the phone menu keeps "Other towns")
  and its gap tightens one step at that breakpoint. Re-measured on all 19
  home pages: no overflow at 1280, 1348 or 1440.
- **Same-day performances shared one page title.** A matinee and an evening
  show are two listings on one day, and so two pages with one `<title>`:
  four pairs in Fort Collins (the Nutcracker, Mystic Pizza, Willy Wonka, the
  CSU dance concert), one in Loveland (the PRCA finals). Such a pair now
  carries its start time in the title; every other listing keeps the date
  alone.
- **Eight outbound links used plain http where the site serves https.**
  Loveland Opera Theatre (six listings), Lincoln Gallery, Heart and SOL and
  Timnath Presbyterian, and Inkberry Books in Niwot, now link over https. The
  Wheel Bar and Powder River Hats do not answer over https and keep their
  http links.

## Checked and sound

- The hub's search index (`/network-search.json`) returns 404 on the live
  hub by design: the build reads it into the Pagefind index and deletes it.
- Noindex counts are what the design says: in Berthoud, 29 past or
  non-canonical event occurrences, 3 delisted places, and the search,
  thanks, message-sent and correction pages.
- Event offers without a numeric price (Fort Collins 12, Lyons 4, the rest
  0–2) are the listings whose cost line gives no figure ("Ticketed",
  "Tickets from the Rams ticket office"); the words stay as the description.
- One request fails on every page outside Vercel: Vercel's own analytics
  script, which exists only on the deployed host.
- The scheduled rebuild (`scheduled-rebuild.yml`) last ran on schedule on
  7 October and succeeded; the day's pushes reset GitHub's sixty-day
  inactivity switch.

## Knowingly left

- The audit's own open items that are not the repository's: the authorized
  newsletter test and subscriber reconciliation, the sponsor placement
  sample and reporting, audience measurement; photographs for the places
  Wikimedia Commons cannot supply (listed in `PHOTOS.md`).
- 42 validator warnings, all pre-existing and all of one kind: events that
  have passed and are already hidden, noindexed and out of the sitemap,
  waiting to be rolled forward or deleted in the weekly session.
