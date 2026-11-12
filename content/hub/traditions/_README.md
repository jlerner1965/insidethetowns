# Traditions: approved records

One file per named annual event (a parade of lights, a tree lighting),
`<slug>.md`, front matter only, read by the hub's season pages
(`/parades-of-lights/`, `/tree-lightings/`) and each guide's `/traditions/`.
The format and the rules are in `src/lib/traditions.ts` and
`traditionSchema` in `src/content/schemas.ts`.

A record gets here one way: the owner reads a draft in
`docs/agent/traditions/`, checks it against its `sourceUrl`, and moves the
file here. The research agent never writes to this folder.

- The slug has no year in it. Each year is an entry in `years`, newest first.
- `confirmed` only where the organizer's own page states this year's date.
- An optional field the organizer has not published is left out.
- `npm run build` fails on a confirmed or moved year with no date, no
  source or no `checked`, and lists every year dated in the next 30 days
  whose check is more than 14 days old.
