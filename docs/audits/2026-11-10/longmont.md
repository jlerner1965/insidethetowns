# Inside Longmont — design audit, 10 November 2026

**Verdict:** Sound; one contrast failure and a stray mark in the wordmark.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] Team pages set in the guide’s blue (#1F6582): the white-at-70% details are 4.09:1 (N1).

## Fix soon
- [design] Wordmark: the second line reads "· Inside the Towns", opening on the dot that joins the two halves of the title when it is on one line.
- [design] Home: a tile repeats the hero (N3).

## Needs a visual check
- [design] Home: the three-school sports card sits above What’s happening (N8).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
