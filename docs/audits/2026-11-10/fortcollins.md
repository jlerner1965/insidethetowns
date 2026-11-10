# Inside Fort Collins — design audit, 10 November 2026

**Verdict:** Sound; one contrast failure, and its green is all but Lafayette’s.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /sports/poudre/ and the other team pages set in the guide’s green (#1E6657): the white-at-70% details are 4.23:1 (N1).

## Fix soon
- [design] Primary #1E6657 is 8 RGB steps from Lafayette’s #1F5F5B, the closest pair on the network (N7).
- [design] Home: a tile repeats the hero (N3).

## Needs a visual check
- [design] Home: the four-school sports card fills the first laptop screen; no event is visible without scrolling (N8).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
