# Inside Castle Rock — design audit, 10 November 2026

**Verdict:** One photograph in the whole guide, shown four times on the home page; a placeholder palette.

Design check only. Built from `main` at 336d266 and rendered at 375 px and 1280 px (about 25 pages: every section page and one place, event, article and team page), with axe-core's WCAG 2.2 AA rules; every built page read for title, description, canonical, viewport, palette, one h1, heading order and alt text; the live home and four section pages fetched (all 200, no redirects, palette as in the repo).

## Fix now
- [design] Home: the hero and all three Find your next stop tiles are the same Wilcox Street photograph. None of the 49 places and none of the 3 articles has an image, so every tile falls back to the hero (N3).

## Fix soon
- [design] Home, event rows: a cost field carrying a sentence ("Ticketed through Eventbrite; the price is not on the shop’s page") wraps under the venue as a second line of grey.
- [design] The config comment says the palette sits close to Johnstown and Loveland; measured, its nearest are Berthoud and Windsor (34 RGB steps each) (N7).

## Needs a visual check
- [design] Desktop home: no Don’t miss card, so the right third beside the listings is empty (N6).

## Decisions for James
- The palette (#6E3647 and #A0546A) is marked a placeholder until the 29 November decision. If the guide stays: a colour of its own, clear of the three maroons.

Chassis items (N1 to N8) are in `_network.md`; proposed changes are there too.
