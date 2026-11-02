# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
| insidefirestone.com | insidethetowns.com, the home page (carbonvalleyguide.com's Firestone section until 2 November 2026) | this repo's `vercel.json`, host-scoped to `insidefirestone.com`; the domain and `www` are on the Vercel project `carbonvalleyguide`, with DNS at Cloudflare | Rewritten 2 November 2026 when the Carbon Valley guide closed: `/` and everything else to the hub's home page, as Grand Lake's. Before that, from 5 October 2026: The Firestone section is one page, `/firestone/`, and the guide's events and places are site-wide with a `?where=firestone` filter, so the rules are: `/` → `/firestone/`; `/events/` → `/events/?where=firestone`; everything else → `/firestone/` (the rule's "home page" for a path with no match, the section page being Firestone's home). `www` 308s to the apex at the domain level, then follows the same rules. The catch-all is `/(.*)`, not `/:path*`: with `trailingSlash` on, every page URL ends in `/`, which `/:path*` does not match, so on the first day `/about/` served Carbon Valley's page on this domain and other paths 404ed. |
| insideseverance.com | insidewindsorco.com, Severance section | this repo's `vercel.json`, host-scoped to `insideseverance.com`; the domain stays on its own Vercel project `insideseverance`, which still builds (`TOWN=severance`, status `redirect`) so it keeps serving the rules; `www` 308s to the apex at the domain level | Written 12 October 2026; live once the branch merges and the project rebuilds. Severance's content moved to the Windsor guide with the same slugs, so the path is kept: `/events/<slug>/`, `/places/<slug>/` and `/articles/<slug>/` go to the same path on insidewindsorco.com; `/events/`, `/eat-drink/`, `/things-to-do/` and `/directory/` go to the Windsor page filtered `?where=severance`; `/moving-here/` goes to `/articles/moving-to-severance/`; the calendar feed and the two RSS feeds go to Windsor's; `/` and everything else go to `/severance/`. `test/folded-towns.test.ts` holds the rules to the config. |
| insidegeorgetownco.com | insideidahosprings.com (Inside Clear Creek), Georgetown section | this repo's `vercel.json`, host-scoped to `insidegeorgetownco.com`; the domain stays on its own Vercel project `insidegeorgetownco`, which still builds (`TOWN=georgetown`, status `redirect`); `www` 308s to the apex at the domain level | Written 20 October 2026, the same thirteen rules as Severance's with `georgetown` and insideidahosprings.com: paths kept for events, places and articles, `?where=georgetown` on the lists, `/moving-here/` to `/articles/moving-to-georgetown/`, the feeds to the guide's, `/` and everything else to `/georgetown/`. |
| insideblackhawk.com | insidethetowns.com, the home page (the Clear Creek guide's Black Hawk section from 20 October to 2 November 2026) | this repo's `vercel.json`, host-scoped to `insideblackhawk.com`; the domain stays on its own Vercel project `insideblackhawk`, which still builds (`TOWN=black-hawk`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Rewritten 2 November 2026 when the owner retired Black Hawk: `/` and everything else to the hub's home page, since its listings left the Clear Creek guide with it. From 20 October it had the thirteen section rules with `black-hawk`. |
| insidefortlupton.com | insidethetowns.com, the home page (carbonvalleyguide.com's Fort Lupton section from 12 October to 2 November 2026) | this repo's `vercel.json`, host-scoped to `insidefortlupton.com`; the domain stays on its own Vercel project `insidefortlupton`, which still builds (`TOWN=fort-lupton`, status `redirect`, `retired`); `www` 308s to the apex at the domain level | Rewritten 2 November 2026 when the Carbon Valley guide closed: `/` and everything else to the hub's home page. From 12 October it had the thirteen section rules with `fort-lupton` and carbonvalleyguide.com. |
| carbonvalleyguide.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `carbonvalleyguide.com`; the domain stays on its Vercel project `carbonvalleyguide`, which still builds (`TOWN=carbon-valley`, status `redirect`, `retired`) | Written 2 November 2026, when the owner closed the four-town guide and opened Inside Frederick (insidefrederickco.com) in its place: `/` and everything else to the hub's home page. Frederick's listings kept their slugs on the new guide, but Firestone's, Dacono's and Fort Lupton's have no page anywhere, so the rule is the hub's, as Grand Lake's; the hub lists Frederick. |
| insidegrandlake.com | insidethetowns.com, the home page | this repo's `vercel.json`, host-scoped to `insidegrandlake.com`; the domain stays on its own Vercel project `insidegrandlake`, which still builds (`TOWN=grand-lake`, status `redirect`, `retired`) | Written 30 October 2026, when the guide was retired with no guide to take it: `/` and everything else to the hub's home page, since no page there matches a Grand Lake path. |

Only Niwot's lives outside this repository, in its own Vercel project, so
the redirects and the search rankings they preserve do not depend on this
build. This network's `vercel.json` is built into every town's site and
carries the two rules every town shares, the Lyons rules scoped to
`insidelyons.com` (explorelyons.com is a domain on the insidelyons project,
see DEPLOY.md), the Firestone rules scoped to `insidefirestone.com`, and
since 12 October 2026 the Severance and Fort Lupton rules scoped to their own
domains, and since 20 October the Georgetown and Black Hawk rules the same
way (Fort Lupton's, Black Hawk's, Firestone's and Carbon Valley's own all go
to the hub since 2 November 2026). Those domains differ from Firestone's in one way: each stays on
the project that served its guide rather than moving to the receiving
guide's project, so nothing changes in the Vercel dashboard. That project
keeps building from this repo (a config change builds every site), and the
host rules in the `vercel.json` it deploys answer every request before the
one holding page it builds is reached.
A host-scoped rule is applied by Vercel per request, so it acts only on
requests to that host, and is exported to no site's `_redirects` but its own
host's.
