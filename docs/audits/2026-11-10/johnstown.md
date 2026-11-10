# Inside Johnstown — design audit, 10 November 2026

**Verdict:** Sound; one contrast failure, and its red is nearly Loveland’s.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /sports/ and team pages: eyebrows on the red band (#C41230) are white at 80%, 4.25:1; the 70% details are 3.52:1 (N1).

## Fix soon
- [design] Home: the Don’t miss card shows the hero photograph again, a screen below the hero (N3).
- [design] Primary #C41230 is 12 RGB steps from Loveland’s #BA0C2F; the two are neighbours in each other’s Towns menu (N7).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
