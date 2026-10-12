# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
| insidefirestone.com | carbonvalleyguide.com, Firestone section | this repo's `vercel.json`, host-scoped to `insidefirestone.com`; the domain and `www` are on the Vercel project `carbonvalleyguide`, with DNS at Cloudflare | Live on 5 October 2026. The Firestone section is one page, `/firestone/`, and the guide's events and places are site-wide with a `?where=firestone` filter, so the rules are: `/` → `/firestone/`; `/events/` → `/events/?where=firestone`; everything else → `/firestone/` (the rule's "home page" for a path with no match, the section page being Firestone's home). `www` 308s to the apex at the domain level, then follows the same rules. The catch-all is `/(.*)`, not `/:path*`: with `trailingSlash` on, every page URL ends in `/`, which `/:path*` does not match, so on the first day `/about/` served Carbon Valley's page on this domain and other paths 404ed. |
| insideseverance.com | insidewindsorco.com, Severance section | this repo's `vercel.json`, host-scoped to `insideseverance.com`; the domain stays on its own Vercel project `insideseverance`, which still builds (`TOWN=severance`, status `redirect`) so it keeps serving the rules; `www` 308s to the apex at the domain level | Written 12 October 2026; live once the branch merges and the project rebuilds. Severance's content moved to the Windsor guide with the same slugs, so the path is kept: `/events/<slug>/`, `/places/<slug>/` and `/articles/<slug>/` go to the same path on insidewindsorco.com; `/events/`, `/eat-drink/`, `/things-to-do/` and `/directory/` go to the Windsor page filtered `?where=severance`; `/moving-here/` goes to `/articles/moving-to-severance/`; the calendar feed and the two RSS feeds go to Windsor's; `/` and everything else go to `/severance/`. `test/folded-towns.test.ts` holds the rules to the config. |
| insidefortlupton.com | carbonvalleyguide.com, Fort Lupton section | this repo's `vercel.json`, host-scoped to `insidefortlupton.com`; the domain stays on its own Vercel project `insidefortlupton`, which still builds (`TOWN=fort-lupton`, status `redirect`); `www` 308s to the apex at the domain level | Written 12 October 2026, the same rules as Severance's with `fort-lupton` and carbonvalleyguide.com: same paths kept, `?where=fort-lupton` on the lists, `/moving-here/` to `/articles/moving-to-fort-lupton/`, `/` and everything else to `/fort-lupton/`. |

Only Niwot's lives outside this repository, in its own Vercel project, so
the redirects and the search rankings they preserve do not depend on this
build. This network's `vercel.json` is built into every town's site and
carries the two rules every town shares, the Lyons rules scoped to
`insidelyons.com` (explorelyons.com is a domain on the insidelyons project,
see DEPLOY.md), the Firestone rules scoped to `insidefirestone.com`, and
since 12 October 2026 the Severance and Fort Lupton rules scoped to their own
domains. Those two differ from Firestone's in one way: each domain stays on
the project that served its guide rather than moving to the receiving
guide's project, so nothing changes in the Vercel dashboard. That project
keeps building from this repo (a config change builds every site), and the
host rules in the `vercel.json` it deploys answer every request before the
one holding page it builds is reached.
A host-scoped rule is applied by Vercel per request, so it acts only on
requests to that host, and is exported to no site's `_redirects` but its own
host's.
