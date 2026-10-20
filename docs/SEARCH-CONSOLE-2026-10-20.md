# Search Console: the first read, 20 October 2026

The network's Search Console properties were connected to GSC Wizard on
20 October 2026 (read-only Google scope, one Google account), and this is
what they said. Everything below is from the Search Console API for web
search, settled through 18 October; nothing is estimated. Re-run the same
reads next month and compare.

## The whole network, 20 September to 17 October

25 domain properties carry the tag `inside-the-towns` in GSC Wizard (the
24 town guides and the hub, plus carbonvalleyguide.com); the tag lets the
cross-site report cover the guides without the aragonite sites. Over the 28
days the guides took **614 clicks on 26,081 impressions**, against 1 click on
93 impressions in the 28 days before: the sites were not indexed then, so the
comparison says only that they are now.

| Site | Clicks | Impressions | Note |
|---|---|---|---|
| Inside Berthoud | 133 | 3,571 | |
| Inside Erie | 91 | 2,885 | |
| Inside Niwot | 89 | 1,930 | flagship |
| Inside Lyons | 45 | 988 | flagship |
| Inside Estes Park | 39 | 1,634 | |
| Inside Loveland | 38 | 1,708 | |
| Inside Golden | 32 | 977 | flagship |
| Inside Johnstown | 32 | 2,473 | high impressions, low clicks |
| Inside Elizabeth | 23 | 1,205 | |
| Inside Longmont | 17 | 1,807 | high impressions, low clicks |
| Inside Timnath | 16 | 1,889 | high impressions, low clicks |
| Inside Fort Collins | 13 | 686 | |
| Inside Fort Lupton | 8 | 564 | |
| Hub (insidethetowns.com) | 7 | 119 | |
| Inside Idaho Springs | 6 | 253 | |
| Inside Nederland | 6 | 208 | |
| Inside Severance | 6 | 415 | |
| Inside Windsor | 5 | 639 | |
| Carbon Valley Guide | 4 | 977 | |
| Inside Black Hawk | 1 | 496 | |
| Inside Evergreen | 1 | 113 | |
| Inside Georgetown | 1 | 181 | |
| Inside Leadville | 1 | 85 | |
| Inside Manitou Springs | 0 | 278 | |
| Inside Castle Rock | 0 | 0 | not live; see below |

Three properties on the account are not guides and are left out:
aragocorminerals.com, aragonitesoil.com and their siblings, lernerworks.com,
townofniwot.com. The domain property `sc-domain:aragocorminerals.com` is
listed but unverified, so Google refuses every read on it; the URL-prefix
property for the same site works.

## What people search for

The opportunity report (queries ranked 3 to 30 with few clicks, by
impressions) says the same thing on every guide: searchers arrive by the
**name of an annual event** or the **name of a place**, almost never by
"things to do in [town]".

| Site | Query | Impressions | Clicks | Position |
|---|---|---|---|---|
| Berthoud | berthoud rec center | 276 | 0 | 10.5 |
| Berthoud | berthoud oktoberfest (six spellings, with and without 2026) | 404 | 23 | 4–8 |
| Erie | erie brewfest | 344 | 22 | 4.4 |
| Erie | boo on briggs (+ 2026, street, erie co) | 334 | 2 | 4–8 |
| Niwot | niwot trot | 191 | 3 | 5.9 |
| Timnath | mein house (+ timnath) | 188 | 0 | 8.4 |
| Johnstown | cassidys (+ cassidy's, sports grill, bar and grill, johnstown) | 270 | 1 | 5–10 |
| Elizabeth | elizabeth library (+ co, hours) | 151 | 0 | 7.6 |
| Loveland | applewood arts festival 2026 (+ craft show) | 155 | 0 | 7.3 |
| Longmont | pumpkin pie days longmont (+ vintage & antique market) | 142 | 0 | 8–10 |
| Estes Park | macgregor chophouse (four spellings) | 150 | 0 | 8–10 |
| Golden | golden chili cookoff 2026 (+ cook off) | 79 | 0 | 7–9 |
| Loveland | loveland zombie crawl 2026 | 55 | 2 | 3.6 |
| Golden | golden trick or treat street | 23 | 2 | 3.1 |

Lyons has no query over 20 impressions: "lyons events" (20 impressions, 8
clicks, a 40% click rate) and "mainstage lyons" (10) lead it. The permanent
events pages from phase 1 are doing what they were built for: "niwot
events", "lyons events" and "golden trick or treat street" all click at
20–50%.

## Three findings

### 1. Annual events rank, then the page is noindexed the morning after

Pumpkin Pie Days (Longmont, 10–11 October) drew 142 impressions at position
8 in the week before it; the page now carries `noindex`, because a past
occurrence is noindexed by rule (`src/routes/town/events/[slug].astro`,
`isOver`). Berthoud's Oktoberfest, Erie's Brewfest and Boo on Briggs, the
Niwot Trot, the Applewood Arts Festival, the Golden Chili Cook-off and the
Loveland Zombie Crawl are on the same path: the ranking Google gave each of
them this year is dropped when the date passes, and next year's listing
starts from nothing under a new slug.

The rule is right for a council meeting; it is wrong for the festival
category, where the name is what people search and the search comes back
every year. A permanent page per festival (one URL, the next date on it,
last year's below) is the structural fix; it is a design decision for the
owner, not something to slip in. Until then, `src/lib/big-dates.ts` keeps
the upcoming festivals linked from `/events/`, which is why "golden
candlelight walk 2026" and "golden christmas parade 2026" already sit at
position 3 in October.

### 2. Johnstown's best-ranking page is a 404

`insidejohnstown.com/places/cassidys-sports-grill/` drew 270 impressions at
positions 5 to 10 across fourteen spellings of the name, and Google is still
serving it. The listing was moved to `content/johnstown/staging/places/` on
3 October (its website now redirects to a gambling site; the hours could not
be checked), so the live URL returns 404 with `noindex`. Google will drop
it within weeks. The fix is editorial: call (970) 587-7744, record it with
`npm run confirm`, and republish. The page already says "call before you
go"; a confirmed-by-phone listing is better than a hole where the town's
most-searched restaurant was.

### 3. Castle Rock's sitemap was submitted at the wrong path

Inside Castle Rock is `status: 'wave2'`, serves `Disallow: /` and has no
impressions, which is as intended. But Search Console shows its sitemap
submitted on 8 October as `https://insidecastlerockco.com/site.xml`, which
is a 404; every other guide's submission is `/sitemap.xml` or
`/sitemap-index.xml`. When Castle Rock launches, resubmit as
`https://insidecastlerockco.com/sitemap-index.xml`. (`sc-domain:insideblackhawk.com`
reports one sitemap warning; Google's API does not say which URL.)

## Smaller things

- **"Venue" is a weak kind in a title.** "Berthoud Recreation Center — Venue
  in Berthoud, CO" sits at position 10.5 on 276 searches for "berthoud rec
  center" with no clicks; the Town's own page outranks it, as it should. The
  `venue` type covers rec centers, libraries, town halls and theatres
  (`PLACE_TYPE_LABELS`, `src/content/schemas.ts`); a few more types, or a
  per-place kind override, would give those titles a real noun. The page
  also lacks the one fact 38 searchers asked for, pool hours, by design (it
  links the Town's calendar).
- **Place pages at positions 5–10 with 0% click rate** (Mein House, MacGregor
  Chophouse, Elizabeth library, Cimmini's, Inkberry Books) are competing
  with the business's own site, Google Maps and Yelp for a navigational
  search. Low clicks there are normal; the impressions are the value, and
  the "In the guides" links are what turn a place page into a reason to
  read on.
- **Johnstown, Timnath and Longmont** have the network's worst click rates
  (0.9–1.3%) because their impressions are mostly these navigational place
  names at positions 8–11. Nothing to fix on the pages; more articles that
  mention the places will do more than any title.

## The flagships, week of 12 October

Filled into the weekly table in `docs/SEARCH-VISIBILITY.md`. Vercel Web
Analytics could not be read through the API on 20 October ("Web Analytics
not found" for every project), so event-page visits stay unknown until read
from the dashboard; the Pages report's indexed count is not in the API
either.

## How this was read

GSC Wizard's MCP tools over the Search Console API: `get_cross_site_summary`
(tag `inside-the-towns`, 28 days), `score_opportunities` per site,
`query_search_analytics` with query and page dimensions to find the ranking
URL, `get_position_distribution` for the 4–20 band, `list_sitemaps` and
`inspect_url` for Castle Rock. The trial on the GSC Wizard account ends 27
October 2026; the Google connection is read-only, so sitemap submission
stays a Search Console task.
