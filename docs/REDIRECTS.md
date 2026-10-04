# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 4 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
| insidefirestone.com | carbonvalleyguide.com, Firestone section | nothing yet | Neither domain resolves. When Carbon Valley is scaffolded, its Firestone section is `/firestone/`, and insidefirestone.com's rules are `/:path*` → `https://carbonvalleyguide.com/firestone/:path*` for the pages that exist there and `/` for the rest, in a `vercel.json` on whatever serves the old domain. |

None of the three lives in this repository: this network's `vercel.json` is
built into every town's site and carries only the two rules every town
shares. The old domains keep their own Vercel projects so the redirects, and
the search rankings they preserve, do not depend on this build.
