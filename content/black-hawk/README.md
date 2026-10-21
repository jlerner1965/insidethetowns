# Black Hawk: covered by Inside Clear Creek

Inside Black Hawk was folded into Inside Clear Creek, the guide at
insideidahosprings.com, on 20 October 2026 (DECISIONS.md, *Georgetown and
Black Hawk join Idaho Springs on one Clear Creek guide*). Black Hawk's events,
places, staged items, articles and sources are in `content/idaho-springs/`,
each event and place with `subTown: black-hawk`, and the section page is
insideidahosprings.com/black-hawk/. Its Moving Here page is now the article
`content/idaho-springs/articles/moving-to-black-hawk.md`.

Every path on insideblackhawk.com redirects to the same page on
insideidahosprings.com (vercel.json, docs/REDIRECTS.md). The Vercel project
for insideblackhawk.com still builds with `TOWN=black-hawk` so it keeps serving
those rules; what it builds is one holding page, and `images/hero.jpg` stays
here because that page uses it.

Add new Black Hawk content to `content/idaho-springs/` with `subTown: black-hawk`,
not here.
