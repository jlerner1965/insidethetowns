# Launch audit — 18 September 2026

Eight live sites, 889 pages, 835 content entries. Audited across content
integrity, links, build, SEO and structured data, accessibility, and live
infrastructure. Everything found and fixed is below, then what is knowingly
left, then what only the owner can do.

**Result: no blockers remain.** The one serious issue, the half-live
`townofniwot.com` redirect, was outside this repository and has since been
fixed and verified.

## Fixed in this pass

### Accessibility

- **The focus ring was invisible on every dark surface, on all eight sites.**
  One ring, `outline: 2px solid var(--color-accent)`, landed on the footer, the
  network bar and the accent-dark bands. Measured against the footer it reached
  1.66:1 on Erie and 1.96:1 on Johnstown, where WCAG 1.4.11 wants 3:1. It is
  now a two-tone ring, accent outline against a white inner edge, with the
  colours swapped on dark grounds.
- **The hub map hid its seven town links.** `role="img"` on the SVG prunes
  descendants from the accessibility tree, so the seven links inside it were
  focusable but unnamed: seven silent tab stops. The role is gone and each link
  carries an `aria-label`.
- **The category filter changed the page silently.** `aria-pressed` reported
  the button; nothing reported that the list beneath had changed. It now writes
  a result count to a `role="status"` element.
- **The filter buttons' only boundary was a 2.08:1 hairline.** Changed to the
  next step darker, which clears 3:1.
- **Section labels were paragraphs.** "Shops", "Stay the night", "Outdoors, in
  depth" and "Further out" were styled `<p>` elements doing a heading's job.
  They are now `h2`, and the two directory pages carry a screen-reader heading
  so the document no longer jumps from `h1` to `h3`.

### SEO and structured data

- **329 event pages were near-duplicate and thin.** A recurring series is
  stored as one file per occurrence, so a fortnightly council meeting became a
  dozen pages differing in two tokens, with an identical heading. The soonest
  occurrence of each series is now the indexed one; later occurrences are
  `noindex` and excluded from the sitemap, which the sitemap filter and the page
  now agree on. Every occurrence stays reachable from the events page and the
  calendar feed.
- **Every event page shared a boilerplate description** of date, time and venue,
  which said nothing about the event and collided outright in three cases. The
  description now leads with those particulars, which is what a searcher needs,
  and continues into the body's first sentence.
- **96 pages shared a title** because recurring events share a name. Event pages
  now carry the date in the title while the visible heading stays clean, via a
  new `seoTitle` on the page layout.
- **Home page titles ran to 139 characters.** They now trim the tagline at a
  clause or word boundary, never ending on a stop word, and run 44 to 63
  characters. The hub carries an explicit short tagline because its full one
  cannot be cut cleanly.
- **431 meta descriptions ran over 165 characters.** Clamped centrally at 155 on
  a word boundary, so page copy stays written for the page rather than for the
  snippet.
- **No page had a `BreadcrumbList`, and no article had `Article` data** despite
  declaring `og:type=article`. Both are now emitted.
- **404 pages inherited the home page description.** They have their own.

### Performance

- **The hero was the largest asset a desktop visitor downloaded**, at 823 KB.
  It sits under a heavy black gradient, so quality 72 is invisible there and
  takes it to 705 KB. Checked against a rendered screenshot.

## Verified clean, so the next pass need not repeat it

- **Content.** 835 entries validate. Every place carries a source. Nothing has
  gone 90 days without a re-check. Every image has a licence row, and every
  licence row has a file.
- **Links.** 17,052 internal links, none broken.
- **Canonicals.** 889 of 889 absolute and on the right domain, with no
  cross-town leakage, the hub included.
- **Sitemaps.** Exact match to the indexable page count, no 404 page, no
  calendar feed.
- **Cross-domain.** Exactly seven sibling domains per page, no self-links, no
  anchor mismatches, every site current since Elizabeth went live.
- **Structured data.** No malformed JSON-LD anywhere. All 577 event
  `startDate` values carry the correct daylight-saving offset.
- **Duplicate content across towns.** Zero page pairs above 0.25 similarity.
  The duplication was entirely inside single towns, and is now handled.
- **Contrast of text.** Every text and background pair passes AA on all eight
  towns; the narrowest is 4.95:1.
- **Live infrastructure.** All eight apexes serve HTTP/2 200 on valid
  certificates. www and plain HTTP both redirect 308. The six security headers
  are byte-identical across all eight and match `vercel.json` exactly. HTML is
  `max-age=0, must-revalidate`, hashed assets are `immutable`, Brotli is
  negotiated everywhere, 404s are real 404s with the custom page, and response
  times cluster between 0.114 and 0.187 seconds.

## Knowingly left

- **163 titles run over 70 characters**, almost all event pages, because the
  date was added to make them unique. A truncated but unique title beats a short
  one shared by twelve pages.
- **95 built images exceed 400 KB.** Most are the emitted originals that sit as
  the `<img src>` fallback inside a `<picture>`; a browser that supports WebP
  never fetches them. Recompressing the sources was tested and returned about
  one per cent, so they are already efficient.
- **HSTS has no `preload`.** Adding it is a commitment to stay HTTPS-only that
  is slow and awkward to reverse, so it is the owner's call rather than a
  default.
- **A 404 under `/favicons/` is cached for a week** by the path rule in
  `vercel.json`. Latent only: all eight real favicons return 200.
- **No contact form ships.** `formspreeId` is set on no site, so the contact
  page has no `<form>` at all. The form's accessibility is untested because
  there is nothing to test.

## Fixed after the audit

**The `townofniwot.com` redirect is now complete.** The apex and every unknown
path return 308 to insideniwot.com; the named paths still land on their
specific new pages. The catch-all had never fired because `trailingSlash: true`
normalises every request to end in a slash before matching, and the catch-all
rule was the only one without `{/}?`. The domain is served from
`jlerner1965/cityofniwot.com`, not from `townofniwot.com`, which is why the
first fix had no effect; both repositories now carry the corrected rules.

Verified live: `/`, `/about/`, `/news/`, `/parks/` and an unknown path all
308 to `https://insideniwot.com/`, `/eat-shop/` to `/eat-drink/`, `/events/`
to `/events/`, and www and plain HTTP still 308 to the apex first.

## For the owner

Nothing outstanding. `HSTS preload`, a contact form and the `/favicons/` cache
rule under **Knowingly left** are all decisions rather than defects.
