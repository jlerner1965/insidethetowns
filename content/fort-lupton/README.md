# Fort Lupton: covered by Inside Carbon Valley

Inside Fort Lupton was folded into Inside Carbon Valley on 12 October 2026
(DECISIONS.md, *Severance and Fort Lupton become sections*). Fort Lupton's
events, places, staged items, articles and sources are in
`content/carbon-valley/`, each event and place with `subTown: fort-lupton`,
and the section page is carbonvalleyguide.com/fort-lupton/. Its Moving Here
page is now the article `content/carbon-valley/articles/moving-to-fort-lupton.md`.
Two sources were renamed where Carbon Valley already had the id:
`weld-gov-fort-lupton` and `highplains-libcal-com-fort-lupton`.

Every path on insidefortlupton.com redirects to the same page on
carbonvalleyguide.com (vercel.json, docs/REDIRECTS.md). The Vercel project
`insidefortlupton` still builds with `TOWN=fort-lupton` so it keeps serving
those rules; what it builds is one holding page, and `images/hero.jpg` stays
here because that page uses it.

Add new Fort Lupton content to `content/carbon-valley/` with
`subTown: fort-lupton`, not here.
