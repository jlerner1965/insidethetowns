# Severance: covered by Inside Windsor

Inside Severance was folded into Inside Windsor on 12 October 2026
(DECISIONS.md, *Severance and Fort Lupton become sections*). Severance's
events, places, staged items, articles and sources are in `content/windsor/`,
each event and place with `subTown: severance`, and the section page is
insidewindsorco.com/severance/. Its Moving Here page is now the article
`content/windsor/articles/moving-to-severance.md`.

Every path on insideseverance.com redirects to the same page on
insidewindsorco.com (vercel.json, docs/REDIRECTS.md). The Vercel project
`insideseverance` still builds with `TOWN=severance` so it keeps serving
those rules; what it builds is one holding page, and `images/hero.jpg` stays
here because that page uses it.

Add new Severance content to `content/windsor/` with `subTown: severance`,
not here.
