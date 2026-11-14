# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
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
| insidegrandlake.com, insideevergreenco.com, insidegeorgetownco.com, insidemanitousprings.com, insidefortlupton.com, insideblackhawk.com, insideidahosprings.com (retired earlier) | the same, in place of the hub's home page | the same rules; the rows above for these five describe where they went until 12 November |

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
and insidefortmorgan.com carry the same rules to their town's page.
insidemead.com has no rule until Mead's page is published; `node
scripts/fold-rules.ts` says so. These domains are on no Vercel project in
this repo yet: add each to the hub's project (`insidethetowns`) in the
Vercel dashboard, with DNS at Cloudflare as for the others, and the host
rules in the deployed `vercel.json` answer from there. Until a domain is
attached, nothing serves it.

insideniwot.com (a quiet guide from 12 November 2026, no events):
`/events/`, every `/events/<slug>/`, `/this-week/`, `/this-weekend/`,
`/submit-event/` and `/events.rss` go to its home page, host-scoped in
`vercel.json`.

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
