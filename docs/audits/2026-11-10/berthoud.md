# Inside Berthoud — design audit, 10 November 2026

**Verdict:** Clean on every measured check; two small things on the home page.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix soon
- [design] Home: one Find your next stop tile repeats the hero photograph (N3).
- [design] The iStock credit on the hero is 10.6 px, the smallest type on the network; the licence wants it beside the photograph, so it should be readable (N5).
- [design] `seoTagline` is "Main Street, the lakes, Berthoud, Colorado", a list where every other guide has a phrase ("Old Town, trails and events in Niwot, Colorado"); it is the home page’s title in search results.

## Since last audit
- Nothing design-related was open from 9 November.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
