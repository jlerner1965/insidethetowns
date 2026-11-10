# Inside Timnath — design audit, 10 November 2026

**Verdict:** The one guide whose hero shows no town; one contrast failure.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] /sports/ and team pages: eyebrows on the blue band (#137495) are 4.00:1, the 70% details 3.44:1 (N1).

## Fix soon
- [design] Hero (`sunrise.jpg`) is bare cottonwoods over a frozen pond at sunrise. Lyons, Longmont and Johnstown each lost a hero for showing no town (the 1 November reader pass); Timnath’s was not changed. `old-town.jpg` is already in the guide.
- [design] The hero’s alt text is 62 characters and names nothing a reader could place; the other guides run 105 to 284.
- [design] Home: a tile repeats the hero (N3). The school-boundaries button on /families/ is 4.52:1 on the accent wash, a pass by 0.02 (N2).

## Needs a visual check
- [design] Home: the guide is teal and the athletics band is the Cubs’ navy (#00295B); the config comment says the teal is the school’s colour.

## Decisions for James
- Replace the hero with Old Town (the photograph on hand, or a bought one as on 30 October), or keep the sunrise.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
