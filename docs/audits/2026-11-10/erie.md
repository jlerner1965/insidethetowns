# Inside Erie — design audit, 10 November 2026

**Verdict:** Sound; one contrast failure on the sports pages. Best photograph coverage on the network (19 of 49 places).

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /sports/ and team pages: the white-at-70% details on the orange band (#983C0E) are 4.26:1 at 21 px, under AA’s 4.5:1 (N1).

## Fix soon
- [design] Family date chips set the month at 10.6 px (N5).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
