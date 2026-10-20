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
**Done, 20 October 2026.** The owner reports every live domain added to
Google Search Console and to Bing Webmaster Tools, and the GSC Wizard
plugin connected the same day reads the Google side: every guide, the hub
and carbonvalleyguide.com has a verified `sc-domain:` property (the DNS
route), and each has a sitemap submitted, as `/sitemap.xml` or
`/sitemap-index.xml`. Inside Castle Rock's was submitted as `/site.xml`,
which does not exist; resubmit it when the site launches. The Google
connection is read-only, so submitting stays a Search Console task, and
Bing is not connected (it needs a Bing Webmaster API key in the plugin).
The Performance figures in the weekly table below can be read through the
plugin; the Pages report's indexed count cannot, and stays a person's job.
The first read of the data is docs/SEARCH-CONSOLE-2026-10-20.md.

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

**First Search Console read, 20 October 2026**, through the GSC Wizard
plugin the owner connected that day (Google read-only; Bing not yet, it
needs a Bing Webmaster API key added in the plugin). Twenty-eight days to
18 October, the whole property, not the weekly window above, so a baseline
rather than a row:

| Site | Clicks | Impressions | CTR | Avg position | Top page (clicks) | Section page for "[town] events" |
|---|---|---|---|---|---|---|
| Inside Niwot | 89 | 1,930 | 4.6% | 11.9 | /events/niwot-trot-5k-2026/ (33) | /events/ position 12.6, 145 impressions, 5 clicks |
| Inside Lyons | 45 | 988 | 4.6% | 17.8 | /events/ (16) | "lyons events" position 10, 40% CTR |
| Inside Golden | 32 | 977 | 3.3% | 15.0 | /events/trick-or-treat-street-2026-10-30/ (27) | /events/ position 14.6, 36 impressions, 0 clicks |

What the queries say, and what phase 5 answers: Lyons's /eat-drink/ drew
153 impressions and one click at position 27, on queries like "bars in
lyons" (position 14), "best restaurants in lyons, co" (10), "coffee shop
lyons co" (41) and "breakfast lyons co" (50); Niwot's were "coffee shop
niwot" (11), "breakfast niwot" (37) and a run of searches for one
restaurant by name. Those are the queries the kind pages are titled for.
The first comparison is these same rows four weeks after the pages are
live. Single event pages carry most clicks on all three guides (the Niwot
Trot, Trick or Treat Street, Old Dogapalooza), which argues for the big
dates ahead on /events/ and for a permanent page per annual event, not
yet built. Golden's home page sits at position 48 on 31 impressions and
the guide's section pages barely show; Golden's problem is authority, so
its outreach (docs/OUTREACH-FLAGSHIPS.md) matters more than its pages.

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
| 3 | Editorial, needs a person or a business's facts: ~~verify the Search Console properties and submit the sitemaps~~ (done, 20 October 2026: owner's word, and read through GSC Wizard the same day; Castle Rock's resubmit at launch, docs/SEARCH-CONSOLE-2026-10-20.md); fix the Buttondown description and send the first issue; confirm the core event sources for Lyons, Niwot and Golden; roll forward or delete the 169 past events; reword or source the 13 unreadable hours lines; the photo list (docs/PHOTO-PRIORITIES.md); the outreach list (docs/OUTREACH-FLAGSHIPS.md); extend `related` links to the other nineteen guides' articles; verify the 2026 Holiday Parade date with the Business Association | Owner, with the weekly session | Each line struck through here with a date |
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

## Phase 5, 20 October 2026: one page per kind of place

Shipped on the branch of 20 October. The queries a town guide exists for
are "[town] restaurants", "[town] breweries", "[town] trails", "[town]
parks", and until now each landed on /eat-drink/ or /things-to-do/, a page
titled for a broader thing and listing four kinds at once. Every live guide
now builds one page per kind it has at least three of (`MIN_PLACES_FOR_TYPE_PAGE`,
src/lib/place-types.ts): /restaurants/, /bars-breweries/, /coffee/, /shops/,
/trails/, /trailheads/, /parks/, /venues/, /stay/ and /services/, each
titled "[Kind] in [Town], CO", with the kind and the town in the h1, a
CollectionPage with its ItemList, a breadcrumb through the section it
belongs to, and links to its sibling kinds. The group headings on
/eat-drink/, /things-to-do/, /directory/ and the sub-town pages link to
them, so every page that lists places leads to the kind pages and the kind
pages lead back. They enter the sitemap like any other page. Lyons builds
seven of them, the network 70-odd; `test/place-types.test.ts` keeps the
routes built and the headings linked in step over every listing.

What to watch in Search Console, four weeks on: impressions for queries of
the shape "[town] [kind]" and which URL Google shows for them. If it still
shows /eat-drink/ for "golden breweries" the kind pages need more on them
(an opening line, the article that mentions the kind) rather than more of
them.

## Distribution: where a small town's readers actually are

Search is slow and links are slower. The traffic a town guide can turn on
this month is the town's own Facebook groups, Nextdoor, and the newsletters
the chamber and the library already send, and none of this is in any
document yet. It is work for a person with accounts of their own; the
repository supplies the pages to share and the campaign tags to count them.

- **One post a week per flagship, in the town's community Facebook group**,
  on the day the Thursday email goes out: the /this-weekend/ page, with
  the three best things on it named in the post. Not the home page, and
  not a different page each week: a page whose URL never changes builds
  recognition. Link with `?utm_source=facebook&utm_medium=social&utm_campaign=weekend`
  so Vercel Web Analytics can tell the group from search
  (src/lib/newsletter.ts has the tag shape the email uses).
- **Nextdoor, the same post**, with `utm_source=nextdoor`. Nextdoor shows
  a post to the neighbourhoods around the poster, which for Niwot and
  Lyons is the whole town.
- **The chamber's and the library's own newsletters.** Ask once, in the
  outreach emails (docs/OUTREACH-DRAFTS-2026-10-20.md), whether they would
  carry one line a month pointing at the kind page their members are on
  (/restaurants/ for the chamber, /events/ for the library).
- **A Google Business Profile for each flagship guide** is not worth it:
  the guides have no premises and Google removes such profiles.

The measure is the "Signups from search" and "Event-page visits" columns
above, split by `utm_source`, and the week's new subscribers in Buttondown.
A post that brings fewer than ten visitors twice running is not worth the
weekly minute; a group that brings fifty is where the next sponsor's
customers are.

