# Inside Loveland — design audit, 10 November 2026

**Verdict:** Sound; the weakest band contrast on the network.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] Team pages: white at 70% on the red (#BA0C2F) is 3.75:1; on Mountain View’s purple (#754ACC) the 80% eyebrows are 4.36:1 and the 70% details 3.73:1 (N1).

## Fix soon
- [design] Primary #BA0C2F is 12 RGB steps from Johnstown’s #C41230 (N7).

## Needs a visual check
- [design] Home: the four-school sports card runs to about 1,050 px on a laptop before the first event (N8). The home has two sections under it and no Worth knowing.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
