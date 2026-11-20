# Inside Niwot — design audit, 20 November 2026

**Verdict:** Clean; one contrast item and an uneven signup.

- [design] `/niwot/traditions/`: the year under each date block is white at 80% on #007C47, 3.97:1, the lowest on the network (`TraditionRow.astro:118`, Fix now in `_network.md`).
- [design] No signup box on `/niwot/places/niwot-hall/`, `/niwot/places/niwot-tavern/` or `/niwot/traditions/`, while the home ("Niwot updates, by email") and `/niwot/sports/` carry one. Niwot is out of the Thursday email, so the header has no email button by design; the body boxes should agree one way or the other.
- [design] Desktop: the Living here tile is the hero photograph (N3, visual check).
- Fixed: N2, the outline buttons on the accent wash on `/niwot/families/` (the one remaining `btn-outline text-primary` link sits on paper). Updates leads the menu and the old events addresses forward to `/niwot/updates/` and `/niwot/traditions/`. 14 pages fetched, baseline clean.

Network-wide items: `_network.md`.
