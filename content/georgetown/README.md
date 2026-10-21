# Georgetown: covered by Inside Clear Creek

Inside Georgetown was folded into Inside Clear Creek, the guide at
insideidahosprings.com, on 20 October 2026 (DECISIONS.md, *Georgetown and
Black Hawk join Idaho Springs on one Clear Creek guide*). Georgetown's events,
places, staged items, articles and sources are in `content/idaho-springs/`,
each event and place with `subTown: georgetown`, and the section page is
insideidahosprings.com/georgetown/. Its Moving Here page is now the article
`content/idaho-springs/articles/moving-to-georgetown.md`.

Every path on insidegeorgetownco.com redirects to the same page on
insideidahosprings.com (vercel.json, docs/REDIRECTS.md). The Vercel project
for insidegeorgetownco.com still builds with `TOWN=georgetown` so it keeps serving
those rules; what it builds is one holding page, and `images/hero.jpg` stays
here because that page uses it.

Add new Georgetown content to `content/idaho-springs/` with `subTown: georgetown`,
not here.
