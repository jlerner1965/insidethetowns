# Redirects

The rule, from the accuracy brief: a retired or consolidated domain 301s to
its canonical guide, keeping the path where a matching page exists and
going to the home page otherwise.

| From | To | Where the rules live | State on 5 October 2026 |
|---|---|---|---|
| townofniwot.com | insideniwot.com | the `cityofniwot.com` repo's `vercel.json`, Vercel project `cityofniwot-com` | Live. `/events/` keeps its path; an unknown path goes to the home page. Vercel answers 308 for `permanent: true`, which search engines treat as 301. |
| explorelyons.com | insidelyons.com | the `explorelyons` repo's `vercel.json`, Vercel project `explorelyons-com` | Live. Apex 308s to `www`, then to insidelyons.com with the path kept; `/civic/` maps to `/articles/who-governs-lyons/`. An unknown path is passed through and 404s on insidelyons.com rather than going home, the one departure from the rule; fixing it is a one-line change in that repo's `vercel.json`. |
| insidefirestone.com | carbonvalleyguide.com, Firestone section | this repo's `vercel.json`, host-scoped to `insidefirestone.com`, to take effect once the domain is attached to the Vercel project `carbonvalleyguide` | Rules written 5 October 2026, inert until the domain is attached. The Firestone section is one page, `/firestone/`, and the guide's events and places are site-wide with a `?where=firestone` filter, so the rules are: `/` → `/firestone/`; `/events/` → `/events/?where=firestone`; everything else → `/firestone/` (the rule's "home page" for a path with no match, the section page being Firestone's home). `www` is handled by the domain-level redirect Vercel adds when both hostnames are attached. Attaching the domain, and its DNS, is the owner's call and was not done. |

Only Niwot's lives outside this repository, in its own Vercel project, so
the redirects and the search rankings they preserve do not depend on this
build. This network's `vercel.json` is built into every town's site and
carries the two rules every town shares, the Lyons rules scoped to
`insidelyons.com` (explorelyons.com is a domain on the insidelyons project,
see DEPLOY.md), and now the Firestone rules scoped to `insidefirestone.com`.
A host-scoped rule is applied by Vercel per request and exported to no
site's `_redirects` but its own host's, so the Firestone rules are inert
until insidefirestone.com is a domain on the `carbonvalleyguide` project.
