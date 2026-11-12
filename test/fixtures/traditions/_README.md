# Tradition fixtures — sample records, never real

These are **test fixtures**, not events. They exist so the hub's season pages
and a guide's `/traditions/` can be built and looked at before any real record
is approved, with one record per status (confirmed, not announced, moved,
canceled).

- Every one has `fixture: true` and a slug starting `fixture-`; the names,
  organizers, places, dates and links are made up, and the links go to
  `example.com`.
- They load only with `TRADITIONS_FIXTURES=1`
  (`TRADITIONS_FIXTURES=1 TOWN=hub npm run build`). The switch throws on
  Vercel, the content collection reads this folder only behind it, the site
  check fails any build without it that carries a fixture row
  (`fixture-shipped`), and `npm run validate` refuses a fixture in `content/`.
- Real records live in `content/hub/traditions/`, one per event, approved by
  moving a draft there from `docs/agent/traditions/`.
