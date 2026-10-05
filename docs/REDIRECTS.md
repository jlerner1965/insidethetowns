# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
| insidefirestone.com | carbonvalleyguide.com, Firestone section | this repo's `vercel.json`, host-scoped to `insidefirestone.com`; the domain and `www` are on the Vercel project `carbonvalleyguide`, with DNS at Cloudflare | Live on 5 October 2026. The Firestone section is one page, `/firestone/`, and the guide's events and places are site-wide with a `?where=firestone` filter, so the rules are: `/` → `/firestone/`; `/events/` → `/events/?where=firestone`; everything else → `/firestone/` (the rule's "home page" for a path with no match, the section page being Firestone's home). `www` 308s to the apex at the domain level, then follows the same rules. The catch-all is `/(.*)`, not `/:path*`: with `trailingSlash` on, every page URL ends in `/`, which `/:path*` does not match, so on the first day `/about/` served Carbon Valley's page on this domain and other paths 404ed. |

Only Niwot's lives outside this repository, in its own Vercel project, so
the redirects and the search rankings they preserve do not depend on this
build. This network's `vercel.json` is built into every town's site and
carries the two rules every town shares, the Lyons rules scoped to
`insidelyons.com` (explorelyons.com is a domain on the insidelyons project,
see DEPLOY.md), and now the Firestone rules scoped to `insidefirestone.com`.
A host-scoped rule is applied by Vercel per request, so it acts only on
requests to that host, and is exported to no site's `_redirects` but its own
host's.
