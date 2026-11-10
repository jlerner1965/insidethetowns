# Inside Golden — design audit, 10 November 2026

**Verdict:** Sound, with the worst button contrast on the network, and two brand colours on one page.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /families/: nine outline buttons (school-finder links) are the copper (#94651E) on the accent wash (#E0E4E6), 3.96:1 where AA asks 4.5:1 (N2).

## Fix soon
- [design] Family date chips set the month at 10.6 px (N5).

## Needs a visual check
- [design] The guide is copper and the school is Demon red (#8F0018). On a phone the home stacks a copper band on a red one; on /sports/ the header is copper and the records are red. Every other flagship wears its school’s colour.

## Decisions for James
- Golden’s colour: keep copper with a red athletics band, or follow the 22 October rule (a guide matches its high school) as the other nine flagships do.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
