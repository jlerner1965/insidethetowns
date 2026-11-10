# Inside Lafayette — design audit, 10 November 2026

**Verdict:** A flagship with one photograph, shown four times on its home page.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] Home: the hero and all three Find your next stop tiles are the same Simpson Street photograph; 0 of 40 places and 0 of 3 articles have an image (N3).

## Fix soon
- [design] Primary #1F5F5B is 8 RGB steps from Fort Collins’s #1E6657; it was picked on 2 November for distance from Erie’s and Longmont’s only (N7).

## Since last audit
- Still open: the three identical tiles (docs/audits/2026-11-04/lafayette.md).

## Needs a visual check
- [design] Hero: the end of the line ("and what’s new in town") runs over the snow-covered street; about 3.8:1 against the brightest tenth of what is behind it.
- [design] Home: a teal guide with a royal-blue Centaurus band (#003399).

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
