# Inside Niwot — design audit, 10 November 2026

**Verdict:** Sound, with two contrast failures that come from the green.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /sports/ and every team page: the small labels on the green band ("Next up · Football", the place and time beside a game) are white at 80% and 70% on #007C47, 3.97:1 and 3.42:1 where AA asks 4.5:1 (N1).
- [design] /families/: the school-boundaries button is the green on the accent wash (#F0E6E2), 4.31:1 (N2).

## Fix soon
- [design] Home: the Living here tile is the Niwot Tribune storefront, the same building as the hero a screen above it (a different file, the same picture to a reader).
- [design] The "Next" pill and photo credits are 11.7 px (N5).

## Since last audit
- Still open: the 11.7 px "Next" pill (docs/archive/DESIGN-AUDIT-2026-10-22.md, item 4).

## Needs a visual check
- [design] Phone home: the hero band (#007C47) sits directly on the athletics band (#126637), two greens a shade apart.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
