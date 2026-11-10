# Inside Estes Park — design audit, 10 November 2026

**Verdict:** Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix soon
- [design] Home: a tile repeats the hero (N3). The home is the shortest on the network (two sections), by design for a visitor guide.

## Needs a visual check
- [design] Desktop home: no Don’t miss card, so the right third beside the listings is empty (N6).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
