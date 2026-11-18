# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/contact/`, `/privacy/` and `/community/` are mapped; every other path, including ones insideniwot.com has a page for (`/about/`, `/directory/`, `/eat-drink/` and 19 more on 17 November 2026), goes to the home page. `/events/` keeps its path and is sent on by insideniwot.com's own rule (to `/traditions/` since 17 November 2026), two hops; passing paths through and sending `/events*` straight on are changes in that repo. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the domain and `www` are on the Vercel project `insidelyons` since 4 October 2026 (DEPLOY.md), each a domain-level 308 to insidelyons.com with the path kept; the renamed paths are answered by the insidelyons.com rules in this repo's `vercel.json` | Live, one hop from either host for a path insidelyons.com has (`/stay/`, `/events/`, `/eat-drink/`, `/things-to-do/`). The eight renamed paths (`/explore/`, `/eat-shop/`, `/outdoors/`, `/itineraries/`, `/plan-a-visit/`, `/our-story/`, `/civic/`, `/community/`) take two: the domain's 308, then the insidelyons.com rule. The domain-level redirect answers before any rule in `vercel.json`, so a rule scoped to explorelyons.com here would never run; one hop needs the domain served by the project (not redirected) in the Vercel dashboard, with host rules for it. An unknown path is passed through and 404s on insidelyons.com. |
| insidefirestone.com | carbonvalleyguide.com, the home page (insidefrederickco.com from 8 to 12 November 2026; the hub's from 2 to 8 November; carbonvalleyguide.com's Firestone section until 2 November 2026) | this repo's `vercel.json`, host-scoped to `insidefirestone.com`; the domain and `www` are on the Vercel project `carbonvalleyguide`, with DNS at Cloudflare | Rewritten 12 November 2026 (the restructure brief: Firestone is covered by the Carbon Valley guide): `/` and everything else to the guide's home page, in one step. The closed guide's Firestone section page is gone, so there is no `/firestone/` to send it to. |
| insideseverance.com | insidewindsorco.com, Severance section | this repo's `vercel.json`, host-scoped to `insideseverance.com`; the domain stays on its own Vercel project `insideseverance`, which still builds (`TOWN=severance`, status `redirect`) so it keeps serving the rules; `www` 308s to the apex at the domain level | Written 12 October 2026; live once the branch merges and the project rebuilds. Severance's content moved to the Windsor guide with the same slugs, so the path is kept: `/events/<slug>/`, `/places/<slug>/` and `/articles/<slug>/` go to the same path on insidewindsorco.com; `/events/`, `/eat-drink/`, `/things-to-do/` and `/directory/` go to the Windsor page filtered `?where=severance`; `/moving-here/` goes to `/articles/moving-to-severance/`; the calendar feed and the two RSS feeds go to Windsor's; `/` and everything else go to `/severance/`. `test/folded-towns.test.ts` holds the rules to the config. |
| insidegeorgetownco.com | insidethetowns.com, the home page (insideidahosprings.com's Georgetown section from 20 October to 3 November 2026) | this repo's `vercel.json`, host-scoped to `insidegeorgetownco.com`; the domain stays on its own Vercel project `insidegeorgetownco`, which still builds (`TOWN=georgetown`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Rewritten 3 November 2026 when the owner retired the Clear Creek guide: `/` and everything else to the hub's home page, since the section it pointed at closed with the guide. From 20 October it had the thirteen section rules, as Severance's, with `georgetown` and insideidahosprings.com. |
| insideblackhawk.com | insidethetowns.com, the home page (the Clear Creek guide's Black Hawk section from 20 October to 2 November 2026) | this repo's `vercel.json`, host-scoped to `insideblackhawk.com`; the domain stays on its own Vercel project `insideblackhawk`, which still builds (`TOWN=black-hawk`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Rewritten 2 November 2026 when the owner retired Black Hawk: `/` and everything else to the hub's home page, since its listings left the Clear Creek guide with it. From 20 October it had the thirteen section rules with `black-hawk`. |
| insidefortlupton.com | insidethetowns.com, the home page (carbonvalleyguide.com's Fort Lupton section from 12 October to 2 November 2026) | this repo's `vercel.json`, host-scoped to `insidefortlupton.com`; the domain stays on its own Vercel project `insidefortlupton`, which still builds (`TOWN=fort-lupton`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Rewritten 2 November 2026 when the Carbon Valley guide closed: `/` and everything else to the hub's home page. From 12 October it had the thirteen section rules with `fort-lupton` and carbonvalleyguide.com. |
| insidefrederickco.com | carbonvalleyguide.com, the same path (`retired.successor` on the Frederick config) | this repo's `vercel.json`, host-scoped to `insidefrederickco.com`; the domain stays on its Vercel project `insidefrederickco`, which still builds (`TOWN=frederick`, status `redirect`, `retired`) | Written 12 November 2026 (the restructure brief: Frederick is not a guide of its own; Carbon Valley covers it). Everything Inside Frederick held moved to the Carbon Valley guide with its slugs, so `/` goes to the home page and every other path to the same path (`/(.*)` to `https://carbonvalleyguide.com/$1`); the one event Inside Frederick had itself retired goes straight to `/events/`, so nothing takes two hops. |
| carbonvalleyguide.com (a live guide again) | itself; only the closed guide's addresses that have no page now are redirected | this repo's `vercel.json`, host-scoped to `carbonvalleyguide.com` | Rewritten 12 November 2026. From 8 November every path went to insidefrederickco.com; those rules are gone. In their place, one rule for each address the guide had before 2 November and does not have now (read from git history): the section pages `/frederick/`, `/firestone/` and `/dacono/` to the home page and `/fort-lupton/` to Fort Lupton's page on the hub; each Firestone or Dacono place and article to the home page and each of their events to `/events/`; each Fort Lupton place, event and article to `https://insidethetowns.com/fort-lupton/`. `test/retired-towns.test.ts` checks none of them shadows a page the guide has. |
| insidegrandlake.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `insidegrandlake.com`; the domain stays on its own Vercel project `insidegrandlake`, which still builds (`TOWN=grand-lake`, status `redirect`, `retired`) | Written 30 October 2026, when the guide was retired with no guide to take it: `/` and everything else to the hub's home page, since no page there matches a Grand Lake path. |
| insideidahosprings.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `insideidahosprings.com`; the domain stays on its own Vercel project `insideidahosprings`, which still builds (`TOWN=idaho-springs`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Written 3 November 2026, when the owner retired Inside Clear Creek (Idaho Springs and Georgetown) with no guide to take it: `/` and everything else to the hub's home page, as Grand Lake's. |
| insideevergreenco.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `insideevergreenco.com`; the domain stays on the Vercel project that served the guide, which still builds (`TOWN=evergreen`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Written 3 November 2026, when the owner retired the guide with no guide to take it: `/` and everything else to the hub's home page, as Grand Lake's. |
| insidemanitousprings.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `insidemanitousprings.com`; the domain stays on its own Vercel project `insidemanitousprings`, which still builds (`TOWN=manitou-springs`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Written 3 November 2026, when the owner retired the guide with no guide to take it: `/` and everything else to the hub's home page, as Grand Lake's. Its one in-guide rule (`/places/garden-of-the-gods/` to `/things-to-do/`) went with it. |

### Guides folded into their town page on the hub, 12 November 2026

| From | To | Rules |
|---|---|---|
| insidecastlerockco.com, insideestespark.com, insidefortcollins.com, insidegolden.com, insidelafayette.com, insideleadville.com, insidelongmontco.com, insidelovelandco.com, insidenederland.com, insidetimnath.com (folded 12 November 2026) | that town's page, `https://insidethetowns.com/<town>/` | `src/lib/fold.ts`, written into `vercel.json` by `node scripts/fold-rules.ts --write`, host-scoped; each domain stays on its own Vercel project, which still builds (status `redirect`, `hubPage`) and serves the rules |
| insidegrandlake.com, insideevergreenco.com, insidegeorgetownco.com, insidemanitousprings.com, insidefortlupton.com, insideblackhawk.com, insideidahosprings.com (retired earlier) | the same, in place of the hub's home page | the same rules; the rows above for these seven say "the home page", which is where they went until 12 November. Live, each goes to its town's page |
| insideelizabeth.com (folded 12 November 2026) | `https://insidethetowns.com/elizabeth/` | the same rules, with its two old event addresses in `data/hub/fold-events.json` |

On each: `/` goes to the page; an old event address whose event has a
record of its own on the hub goes to that record's page,
`https://insidethetowns.com/<town>/<event>/` (below); `/events/`, every
other `/events/<slug>/`, `/this-week/`, `/this-weekend/`, `/traditions/`
and `/events.rss` go to the page's `#traditions`; `/things-to-do/`,
`/trails/`, `/trailheads/` and `/parks/` go to `#outdoor-dates`;
everything else goes to the top of the page. All permanent. A fragment in
a redirect's `Location` is kept by browsers and dropped by Google; check
one with `curl -sI https://insideestespark.com/events/` once the projects
have rebuilt.

**Where the reader came from: added and removed, 14 November 2026.**
For part of the day every rule above ended its destination with
`?from=<the old domain>`, and the hub's pages read it to show a line,
"Inside Estes Park has closed. Estes Park's annual events and outdoor
dates are kept here; the nearest full guide is Inside Lyons." The owner
asked for that line to come off every closed guide's town, so the line,
`src/components/FromClosedGuide.astro` and `src/lib/closed-guides.ts`
are gone and the destinations are plain addresses again
(`src/lib/fold.ts`; `vercel.json` rewritten by `scripts/fold-rules.ts`).

**The hub's address for a live guide's town, 14 November 2026.**
`insidethetowns.com/erie/`, `/berthoud/`, `/niwot/` and `/frederick/`
were "page not found" while `/golden/` worked. `src/lib/hub-moved.ts`
now makes each live guide's slug, and Carbon Valley's three towns, a
redirect page to the guide's home, as Severance's are.

**Old event addresses, 13 November 2026.** Google drops the fragment, so
every `/events/<slug>/` on a folded domain landed on one page that did not
carry the event, and the rankings those addresses held (606 of the
network's 1,088 clicks, 14 October to 10 November 2026, on Golden,
Loveland, Longmont and Estes Park's) had nowhere to go. Each hub tradition
record whose home is a published town page now has a page of its own,
`/<town>/<event>/` (the record's slug without its `<town>-` prefix; no year
in the address; `src/routes/hub/event.astro`, `hubEventPages` in
`src/lib/hub-towns.ts`), and `data/hub/fold-events.json` maps each old
event address that is clearly the same event (same town, same organizer or
venue, same annual date) to its record: host, then old path (the dated
address and the undated one with its `formerSlugs`, read from git history
at the parent of commit `d2cc63e`) to record slug. `src/lib/fold.ts`
(`foldEventTargets`, `foldRules`) writes one permanent rule per old
address, `/events/<slug>{/}?` to the record's page, ahead of the
`/events/(.*)` catch-all, so each is one hop and no rule points at a page
that is not built (the map refuses a record with no page of its own). `node
scripts/fold-rules.ts --write` regenerates `vercel.json`;
`test/hub-fold.test.ts` holds the map, the records and `vercel.json` in
step. An old address whose event has no record (not annual, or the
organizer's page could not confirm it) stays on the catch-all. Vercel
answers 308 for `permanent: true`. insideseverance.com still goes to the
Windsor guide's Severance section (the owner, 12 November 2026).

**Domains for towns that never had a guide** (`domain` in
`src/config/hub-towns.ts`, the owner's, 12 November 2026): insidesalida.com,
insidesteamboatsprings.com, insidebuenavista.com, insidegrandjunction.com
and insidefortmorgan.com carry the same rules to their town's page, and
insidemead.com since Mead's page was published. None of the six resolves
(17 November 2026: Cloudflare nameservers, no A record, `www` NXDOMAIN),
so their 72 rules are served by nothing: add each to the hub's project
(`insidethetowns`) in the Vercel dashboard, with DNS at Cloudflare as for
the others, and the host rules in the deployed `vercel.json` answer from
there.

insideniwot.com (a quiet guide from 12 November 2026, no events): from 17
November 2026 `/events/` and each annual event's address (the five files
with `annual: true` and their `formerSlugs`) go to `/traditions/`,
`/this-week/` and `/this-weekend/` to `/updates/`, `/events.rss` to
`/updates.rss`; every other `/events/<slug>/`, `/submit-event/` and
`/thanks/` go to its home page. Host-scoped in `vercel.json`; the annual
events' rules are written by `scripts/fold-rules.ts`.

### The folded domains move into insidethetowns.com, 17 November 2026

The eighteen folded domains (insidelongmontco.com, insidelovelandco.com,
insidefortcollins.com, insideestespark.com, insidegolden.com,
insidecastlerockco.com, insidelafayette.com, insideleadville.com,
insidenederland.com, insidetimnath.com, insideelizabeth.com,
insideidahosprings.com, insidegeorgetownco.com, insideblackhawk.com,
insideevergreenco.com, insidegrandlake.com, insidemanitousprings.com,
insidefortlupton.com) no longer carry redirect rules in `vercel.json`. Each
has one rewrite, `/(.*)` to `/api/legacy/?legacy_path=/$1`, and `api/legacy.ts` answers. Two things the first two attempts got wrong, which left every page address on the eighteen domains answering 404 from about 05:15 to the deploy of this rule on 18 November 2026 UTC: the destination must be the function's slashed address (with `trailingSlash: true` Vercel serves it there and nowhere else), and the source must be `/(.*)` (Vercel matched `/:path*` strictly, so it missed every address ending in a slash and the bare `/`, and only /robots.txt and the sitemaps reached the function)
every request from `api/legacy-map.json`, which `node
scripts/migration/redirect-map.ts --dist=dist` writes from
`docs/migration/redirect-map.csv` (one row per old address: host, path,
301 or 410 or 200, destination, reason, where the address came from).
The CSV is built from `docs/migration/inventory/<host>.csv` (`node
scripts/migration/inventory.ts --old=<folder>`: every address each domain
served at the pre-restructure commit 7141d032, its sitemap, its redirect
stubs, and the listings git history shows it had before), the page-by-page
decisions in `docs/migration/decisions/<town>.csv`, and the hub build.

- **Longmont, Loveland, Fort Collins and Estes Park** (`section.mode:
  'full'`) are sections of the hub: the guide's pages at the same path
  under `/<town>/`, built from the guide's own templates (`HUB_SECTION=1`,
  `scripts/lib/section-merge.ts`). An old address goes to the same path;
  the home page to the town's page; This week, This weekend and Updates to
  `/<town>/events/`; an annual event's address to its tradition page; a
  past one-time event, a lapsed place and a sports page answer 410.
- **The other fourteen** (`section.mode: 'pages'`) keep what was decided
  one by one: `/<town>/places/<slug>/`, `/<town>/guides/<slug>/`,
  `/<town>/events/<slug>/`, and `/<town>/places/` as the index; the rest of
  the guide is the town's page. 410 only for a closed or unverifiable
  place, a page with no town-specific content, a sports page, and a past
  one-time event with no annual page; each row gives its reason.
- Each domain's pre-restructure sitemap is served at `/sitemap-index.xml`
  and `/sitemap-0.xml` (from `data/migration/sitemaps/<host>/`), with a
  robots.txt that points to it. **Remove both after 2027-05-17.** Eleven
  were copied from the builds at 7141d032. The seven guides retired before
  the restructure had stopped building one by then (18 November 2026, the
  owner: every folded domain serves the sitemap it had): six are the files
  their last live deployments served, read from Vercel (Black Hawk and
  Georgetown 20 October, Grand Lake 30 October, Evergreen, Idaho Springs
  and Manitou Springs 3 November); no deployment from Fort Lupton's live
  week (6 to 12 October) survives, so its sitemap is rebuilt from the
  guide's page addresses at 5ce23d48 and says so in an XML comment. The
  27 addresses those sitemaps list that the inventory had not (the
  picks pages, `/parks/`, `/restaurants/`, `/venues/` and the like, and
  the Clear Creek guide's `/georgetown/` and `/idaho-springs/`) are rows of
  the map, source `sitemap`.
- A redirect stub (meta refresh) goes where its target goes, one hop. An
  address not in the map goes to the town's page (301). Server-side 301
  only; no meta-refresh pages are built for these hosts.
- The rewrite passes the path as `legacy_path`; the lookup takes it with
  or without its trailing slash and in any case, and a query string is
  carried onto the Location without changing the page. Vercel itself
  answers a path without its trailing slash with a 308 to the slash before
  any rule or rewrite runs (`trailingSlash: true`), so that form takes two
  hops, as it did before; `www.` takes one more at the domain level.
- Every answer carries `Cache-Control: public, max-age=3600` and
  `CDN-Cache-Control` / `Vercel-CDN-Cache-Control: public, max-age=86400`:
  Vercel's CDN keeps a 301 or 410 for a day, and a new deployment of the
  project starts its cache afresh.
- A place answers 410 only when it is closed for good. A kept place whose
  source could not be read is kept, noindex, "re-check pending"
  (`docs/migration/needs-recheck.md`), and so is a kept place that later
  passes its check window: its page stays, so the address it is mapped to
  never 404s.
- **Keep the redirects live and the domains renewed indefinitely, at
  minimum until 2027-11-17** (the owner's brief; the comment is in
  `api/legacy.ts`).
- Each folded project builds nothing but one 404 page and the function
  (`scripts/run.ts`); the Ignored Build Step skips it unless `vercel.json`,
  `api/legacy.ts`, `api/legacy-map.json`, the map or its config change.
- `test/legacy-redirects.test.ts` holds the CSV, the map and `vercel.json`
  together; `node scripts/migration/check-local.ts` checks a hub build,
  and `node scripts/migration/check-production.ts` reads every row against
  the live domains after a deploy (host-based answers cannot be tried on
  a preview address).
- `docs/migration/production-check.csv`: what production returned for
  every row of the map on 17 November 2026 (Denver), after #461 deployed:
  the status, the `Location`, and the destination's own status. 4,516 of
  4,530 as mapped and no 404; the 14 others were the old sitemap files of
  the seven guides retired before the restructure (Black Hawk, Evergreen,
  Fort Lupton, Georgetown, Grand Lake, Idaho Springs, Manitou Springs),
  which answered 301 to the town's page where the map says 200, until
  those sitemaps were added on 18 November 2026 (above). A record of that
  run, not regenerated by any script.

### A guide's own old addresses, and the hub's, 17 November 2026

The builds answer a former slug (`formerSlugs`), a retired one
(`content/<town>/retired.json`), `/places/`, `/articles/` and the hub's
address for a guide's town (`src/lib/hub-moved.ts`) with a redirect page:
HTTP 200, a meta refresh, noindex. The audit of 17 November 2026 found
238 of them with no rule here, and Google filing the dated address of an
annual event under "excluded by noindex" while it still held the ranking.
Now `node scripts/fold-rules.ts --write` writes one rule for each
(`scripts/lib/redirect-rules.ts`), host-scoped, `"statusCode": 301`, ahead
of the host's other rules, and the page is only the fallback:

- each live guide: its former and retired slugs and the two index pages,
  to the destination the build's page has (`formerSlugRedirects`). An
  event that is over gives way to `/events/`, a repeat of a series to the
  series' indexed page, a closed place to `/directory/`, so no rule lands
  on a noindex page;
- an event that is over and held back by the publish gate (the file is
  kept, no page is built): to `/events/` (two of Lyons' were 404s with
  impressions);
- insidefrederickco.com and insideseverance.com: the same addresses of the
  guide each forwards to, straight to the destination, so an old address
  there is one hop, not two;
- insidethetowns.com: the 14 addresses in `HUB_MOVED`, to the guide.

Run it after a listing is retired, merged or re-filed.
`test/guide-redirects.test.ts` fails when a rule is missing, is not the
first to answer, or goes somewhere else, and when any rule lands on
another rule. A destination settled on the day the rules were written
stays accepted after the event passes; the next `--write` moves it to the
list. The other rules in the file keep `permanent: true`, which Vercel
answers as 308; both are permanent to a search engine. Vercel allows 2,048
redirects in one `vercel.json`; the file holds 875, and the script and the
test refuse more.

Also on 17 November 2026: `/sitemap.xml` to `/sitemap-index.xml` is a 301
(it was a 307); `/index.html` and `/<path>/index.html` go to the directory
address. Those three are the last rules in the file, so a redirect-only
domain's own catch-all answers first, in one hop; Lyons' six `/sports/` pages, removed that
day, go to `/families/#program-high-school-athletics`; and the hub's five
pages for free-admission days that have passed, no longer built, go to
`/free-admission-days/` (the Museum of Boulder's two, Dinosaur Ridge's) or
to `/golden/` (the Colorado Railroad Museum's two, which that page does
not list).

Not changed, because they are Vercel's own behaviour and not rules in this
file: an address without its trailing slash gets the slash first and the
rule second (two hops); `http://www.` takes two hops to the apex on a live
domain and three on a redirect-only one; an upper-case path is a 404; and a
made-up slug on insidefrederickco.com or insideseverance.com is passed
through to the guide's 404.

Only Niwot's lives outside this repository, in its own Vercel project, so
the redirects and the search rankings they preserve do not depend on this
build. This network's `vercel.json` is built into every town's site and
carries the two rules every town shares, the Lyons rules scoped to
`insidelyons.com` (explorelyons.com is a domain on the insidelyons project,
see DEPLOY.md), the Firestone rules scoped to `insidefirestone.com`, and
since 12 October 2026 the Severance and Fort Lupton rules scoped to their own
domains, and since 20 October the Georgetown and Black Hawk rules the same
way (Fort Lupton's, Black Hawk's, Firestone's and Carbon Valley's own all go
to the hub since 2 November 2026, and Georgetown's, with Idaho Springs',
Evergreen's and Manitou Springs', since 3 November). Those domains differ from Firestone's in one way: each stays on
the project that served its guide rather than moving to the receiving
guide's project, so nothing changes in the Vercel dashboard. That project
keeps building from this repo (a config change builds every site), and the
host rules in the `vercel.json` it deploys answer every request before the
one holding page it builds is reached.
A host-scoped rule is applied by Vercel per request, so it acts only on
requests to that host, and is exported to no site's `_redirects` but its own
host's.
