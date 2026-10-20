# Search visibility: Search Console, sitemaps and the weekly measurement

Phase 1 of the search-visibility plan, 15 October 2026. Three flagship guides
get the concentrated effort: **Inside Lyons**, **Inside Niwot** and **Inside
Golden**. Nothing here adds a town, and nothing here has been connected to
Google or Bing yet: this page says what the sites can accept and what the
owner has to do by hand.

## Search Console verification (owner's task)

The sites can carry a search-engine verification meta tag without any token
living in this repository. `src/layouts/Base.astro` reads two environment
variables at build time (`src/lib/verification.ts`) and emits a tag for each
one that is set:

| Variable | Tag it fills | Who issues it |
|---|---|---|
| `GOOGLE_SITE_VERIFICATION` | `<meta name="google-site-verification">` | Google Search Console, "HTML tag" method |
| `BING_SITE_VERIFICATION` | `<meta name="msvalidate.01">` | Bing Webmaster Tools, "HTML meta tag" method |

Unset, nothing is emitted. A value that is not a plain token (spaces, quotes,
angle brackets) is refused rather than written into the head. The variables
are never read from a town config and never committed: a token is per
property, so per domain, and every domain is its own Vercel project.

**Where to supply each real token.** For each site, in Vercel: *Project →
Settings → Environment Variables*, Production environment, add
`GOOGLE_SITE_VERIFICATION` with the token Search Console shows for that
domain's HTML-tag method (the `content="…"` value only, not the whole tag),
then *Deployments → Redeploy* so the tag is built in. One project, one token:

| Site | Vercel project | Property to verify |
|---|---|---|
| Hub | `insidethetowns` | `https://insidethetowns.com/` |
| Inside Lyons | `insidelyons` | `https://insidelyons.com/` |
| Inside Niwot | `insideniwot` | `https://insideniwot.com/` |
| Inside Golden | `insidegolden` | `https://insidegolden.com/` |

The same steps work for any other guide's project when its turn comes.

**The alternative, and probably the better one:** a Search Console *Domain
property* verified by a DNS TXT record at the registrar (Cloudflare, where
every domain's nameservers are; DEPLOY.md). A domain property covers the
apex and `www` together and needs no build. The meta-tag route above exists
so verification is possible without touching DNS; choose one per domain, not
both.

After verification, submit the sitemap index for each property (below), and
set the property's users so the owner is not the only one who can read it.
Read on 20 October 2026 through GSC Wizard: every guide, the hub and
carbonvalleyguide.com has a verified `sc-domain:` property (the DNS route),
and each has a sitemap submitted, as `/sitemap.xml` or `/sitemap-index.xml`.
Inside Castle Rock's was submitted as `/site.xml`, which does not exist;
resubmit it when the site launches. The Google connection GSC Wizard holds
is read-only, so submitting stays a Search Console task. The first read of
the data is docs/SEARCH-CONSOLE-2026-10-20.md.

## Sitemap URLs

Every site publishes a sitemap index and one sitemap, and `/sitemap.xml`
redirects (307) to the index. `robots.txt` on every live site names the
index. Pages that carry `noindex` (past events, repeat occurrences of a
series, closed places, `/search/`, `/correct/`, `/thanks/`,
`/message-sent/`) are left out of the sitemap by `astro.config.mjs`; the
audit of 15 October 2026 fetched all 1,829 listed URLs and found none that
was noindexed, duplicated, or on the wrong host.

| Site | Sitemap index | Sitemap |
|---|---|---|
| Hub | https://insidethetowns.com/sitemap-index.xml | https://insidethetowns.com/sitemap-0.xml |
| Inside Lyons | https://insidelyons.com/sitemap-index.xml | https://insidelyons.com/sitemap-0.xml |
| Inside Niwot | https://insideniwot.com/sitemap-index.xml | https://insideniwot.com/sitemap-0.xml |
| Inside Golden | https://insidegolden.com/sitemap-index.xml | https://insidegolden.com/sitemap-0.xml |

The other guides follow the same pattern on their own domains
(`src/config/towns/*.ts`, `domain`).

## The permanent events pages

Searches like "Lyons events", "Niwot events this weekend" and "Golden events"
should land on pages whose URL never changes and whose contents do:

| Query shape | Lyons | Niwot | Golden |
|---|---|---|---|
| "[town] events" | https://insidelyons.com/events/ | https://insideniwot.com/events/ | https://insidegolden.com/events/ |
| "[town] events this weekend" | https://insidelyons.com/this-weekend/ | https://insideniwot.com/this-weekend/ | https://insidegolden.com/this-weekend/ |
| "this week in [town]" | https://insidelyons.com/this-week/ | https://insideniwot.com/this-week/ | https://insidegolden.com/this-week/ |

Each has a stable canonical, is rebuilt nightly and on every push, shows only
upcoming listings (the browser removes anything that finishes between
builds, `src/lib/expiry.ts`), says when its listings were refreshed, and
links the big dates ahead (`src/lib/big-dates.ts`: the festival-category
listings beyond the fortnight, so the Holiday Parade and the Fourth of July
have a permanent way in). No dated weekly URL is generated for search; the
weekly email links these pages with campaign tags instead.

## Weekly measurement

One row per flagship per week. Every cell is filled from the named source or
left as `unknown`; nothing is estimated. Search Console figures exist only
after a property is verified, so the first rows will be mostly unknown, which
is the honest starting point.

| Week of | Site | Indexed pages ¹ | Impressions ¹ | Clicks ¹ | Non-brand queries ¹ | Queries in positions 4–20 ¹ | Independent referring domains ² | Signups from search ³ | Event-page visits ⁴ | Sponsor impressions / clicks ⁵ |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-12 | Inside Lyons | unknown | 427 | 14 | 82 | 41 | unknown | unknown | unknown | n/a (no sponsor) |
| 2026-10-12 | Inside Niwot | unknown | 521 | 18 | 59 | 25 | unknown | unknown | unknown | n/a (no sponsor) |
| 2026-10-12 | Inside Golden | unknown | 922 | 34 | 138 | 37 | unknown | unknown | unknown | n/a (no sponsor) |

¹ Google Search Console, Performance report for the property, the seven days
ending the Sunday of the row; "indexed pages" from the Pages report. A
non-brand query is one that does not contain "inside" with the town's name.
The 12 October row was read through the Search Console API on 20 October
2026 (docs/SEARCH-CONSOLE-2026-10-20.md): no query that week contained the
brand, so the non-brand count is every query Google listed; the Pages report
is not in the API, so indexed pages stay unknown until read by hand.
² Hand-counted from Search Console's Links report or any link tool the owner
uses, with every `inside*.com` and `insidethetowns.com` domain excluded: the
sister-guide footers link every guide from every other, and those are not
independent authority.
³ Buttondown subscribers whose signup page carried a search referrer, or a
`utm_source` other than `newsletter`; unknown until Buttondown's referrer
data is read.
⁴ Vercel Web Analytics, pageviews whose path starts `/events/`, for the
project, over the seven days.
⁵ Sponsor placements render nothing until a sponsor is set
(`src/config/towns/types.ts`, `TownSponsors`), so until then this column is
not applicable rather than zero.

Baseline, for comparison only and not from Search Console: Vercel Web
Analytics, 19 September to 15 October 2026, read on 15 October. Niwot 292
visitors and 730 pageviews, of which 75 visitors arrived from google.com;
Lyons 234 visitors and 579 pageviews, 32 from google.com; Golden 84 visitors
and 184 pageviews, referrers not read. Niwot's Google landings were led by
the Niwot Trot 5K event page and the incorporation-election article.

## The phases

Decided 15 October 2026, after phase 1 shipped. Each phase has an owner;
nothing moves to "done" here until it is.

| Phase | What | Owner | Done when |
|---|---|---|---|
| 1 | Pages answer the searcher: Start here, refreshed date and big dates on /events/, place titles and "In the guides", Article and Moving Here structured data, flagship `related` links, verification from the environment | Repository | Shipped, PR #132 |
| 2 | Signal over noise: past events as one count in the validator (`--past` lists them), a second daily rebuild at 17:10 UTC, About titles not doubled, Golden's commute line, the hub snippet ending at its full stop, outbound links on the three flagships checked (0 dead) | Repository | This phase |
| 3 | Editorial, needs a person or a business's facts: ~~verify the Search Console properties and submit the sitemaps~~ (domain properties for every guide and the hub, sitemaps submitted, read 20 October 2026; Castle Rock's resubmit at launch, docs/SEARCH-CONSOLE-2026-10-20.md); fix the Buttondown description and send the first issue; confirm the core event sources for Lyons, Niwot and Golden; roll forward or delete the 169 past events; reword or source the 13 unreadable hours lines; the photo list (docs/PHOTO-PRIORITIES.md); the outreach list (docs/OUTREACH-FLAGSHIPS.md); extend `related` links to the other nineteen guides' articles; verify the 2026 Holiday Parade date with the Business Association | Owner, with the weekly session | Each line struck through here with a date |
| 4 | Measurement and commercial proof, after four weeks of Search Console and sends: fill the weekly table above, decide the three flagships' sponsor placements from real numbers, publish a rate card only if they hold | Owner | First rate card, or a dated decision not to publish one yet |

## Done in this phase, in the code

- Place pages: `<title>` names the kind and the town ("Hall Ranch — Trail in
  Lyons, CO | Inside Lyons"); an "In the guides" list links the articles that
  mention the place (`src/lib/mentions.ts`).
- Events pages: "Listings refreshed" date and "Big dates ahead".
- Home pages: a "Start here" section naming events, the weekend, eat and
  drink, things to do, the guides and Moving Here, with the publisher.
- Moving Here: WebPage and BreadcrumbList structured data with
  `dateModified`; contextual links in the Lyons, Niwot and Golden guides.
- Articles: `isPartOf` the site, `dateModified` from the edit or the check
  date; `related` links on the twelve flagship articles that had none.
- Verification tags from the environment, as above.
