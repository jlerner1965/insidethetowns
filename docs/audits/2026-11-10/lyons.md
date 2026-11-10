# Inside Lyons — design audit, 10 November 2026

**Verdict:** Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix soon
- [design] Photo credits and the "Next" pill are 11.7 px (N5); article pages carry two unlabelled asides (N4).

## Needs a visual check
- [design] Phone home: the navy hero band (#022C66) over the brighter blue athletics band (#0054A6) reads as two blues.
- [design] Desktop home: with no Don’t miss card today, the right third beside the listings is empty (N6).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
