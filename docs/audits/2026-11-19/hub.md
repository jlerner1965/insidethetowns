# Inside the Towns — live site scan, 19 November 2026

**Verdict:** Strong. The hub and its eleven sections are technically clean after the 18 November move; what is left is one stale config file, one footer link whose label and target disagree, and a handful of design and SEO nits.

**Scope.** insidethetowns.com as it stands after the seven guides moved in on 18 November 2026 (every guide domain now 301s to its section). Checks run: design, content, SEO, navigation and links. Accuracy and coverage were not run.

## What was checked

| Check | Result |
|---|---|
| 3,096 sitemap URLs | all 200, none redirect, p50 0.16 s, max 0.62 s |
| 312 internal links not in the sitemap (from 125 fetched pages) | all 200 |
| 732 unique external links | 567 ok · 106 blocked bots (403, 79 of them MaxPreps) · 5 rate-limited (429) · 4 refused (406, treventscomplex.com) · 3 no answer |
| 90-page random SEO sample | every page: one title, meta description, canonical that matches the URL, one h1, og:image, JSON-LD (Event, Restaurant, Article, NewsArticle, CollectionPage, BreadcrumbList), alt on every image; no duplicate titles or descriptions; nothing noindexed |
| 10 key pages rendered at 375 px and 1280 px | no horizontal scroll, no broken images, no console errors, no failed requests, 260–700 kB per page |
| Redirects | http → https and www → apex one hop; 23 old-domain and deep-path addresses checked, each lands on the right section or town page in one hop (townofniwot.com takes two); /frederick/ and /severance/ forward correctly; unknown paths return a real 404 |
| Section homes (7) | palette applied per section, shared fonts, one h1, menus consistent with the 18 November brief (Niwot updates-led, Lyons trails-led, no Shops on Erie/Johnstown/Windsor/Carbon Valley menus though the pages exist) |
| This Week pages (6) | all checked through 18 November 2026 |
| Search | `/search/?q=parade+of+lights` returns 130 results |
| Phone menu | opens on hub and sections, aria-expanded toggles, body scroll locks |
| Feeds | events.rss (50 items), section events.rss and rss.xml all 200 |

## Fix now

- **[navigation]** The footer network strip on every section and town page says **"All 7 guides →"** while the masthead's town switcher says **"All 11 full sections →"**, and both go to the same anchor, `https://insidethetowns.com/#towns`, which lists eleven. A reader who clicks "7 guides" lands on a list of 11. Seen on 79 of the 125 fetched pages. Source: `src/components/NetworkBar.astro:93` (`All {liveTowns().length} guides →`). The 18 November decision says the footer strip "counts what it means", so the count may be intended; the target is not. See Decisions.
- **[content]** `manager/towns.json` still lists the seven guides as live at their own domains with no note that they moved into the hub on 18 November, and the manager and audit skills read it as the source of truth. Diff below.

## Fix soon

- **[design]** The hero photo credit renders at **8 px** ("iStock.com/JuniperCreek" on `/berthoud/`): `src/components/Hero.astro:138` and `src/components/home/NextStop.astro:111` use `text-[8px]`. Nothing else on the site goes below 11.7 px.
- **[design]** Phone page lengths, measured at 375 px: `/this-weekend/` 27,386 px, `/berthoud/events/` 17,365 px, `/leadville/` 16,290 px (the 18 November decision cites 16,996 before the section-bar work, so the bar helped navigation but not length), `/tree-lightings/` 13,573 px. The sticky section bar on `/leadville/` works. A decision, not a bug.
- **[design]** The three "Find your next stop" photos on each of the Niwot, Lyons, Berthoud, Erie and Windsor homes carry an empty `alt`. That is valid for decoration, but they are the place photos (Hall Ranch butte, the Bimson blacksmith shop, Oskar Blues pints); Johnstown and Carbon Valley homes have no such images. Real alt text would help image search and consistency.
- **[seo]** 10 of 90 sampled pages have titles over 60 characters (61 to 85), all event pages whose titles carry the full event name plus town and date, e.g. the Loveland "Purple Piano" page at 85. They will truncate in results; low impact.
- **[seo]** Section home titles are inconsistent: Niwot and Lyons end "| Inside Niwot" / "| Inside Lyons"; Berthoud, Erie, Johnstown, Windsor and Carbon Valley carry no suffix.
- **[navigation]** A section's phone menu names its neighbours three ways in one list: "Inside Johnstown", "Loveland on Inside the Towns", "Longmont on Inside the Towns"; the desktop menu shows bare town names. (Longmont's own wordmark, "Longmont · Inside the Towns", is deliberate: a local magazine already uses "Inside Longmont".)
- **[content]** Hub articles under `/articles/` carry no newsletter signup box, only the menu link; section articles have the box and the This Week strip. The hub's long reads (the Eldora piece is 3,240 words) are the pages most likely to arrive cold from search.

## Since last audit

The 14 November hub review and the 17 November SEO health fix log were code-side. Nothing in today's sample regressed: no repeated headings, no out-of-season sports descriptions, no missing descriptions or canonicals. The owner's own items from the 14 November note were not re-checked here.

## Couldn't verify

- `discoverblackhawk.com/events` and `/stair-climb` (sources on two Black Hawk tradition records) never answer from this container, though the site's home page does. `nococatcafe.com/before-you-visit` and its home page never answer either, with or without www. These may be reachable from a browser; they were not from here.
- Four `treventscomplex.com` links return 406 to a browser user agent (one answered 200 on retry): a firewall, not a dead page.
- 106 external links return 403 to a crawler, 79 of them MaxPreps; 5 return 429. Expected bot blocking, not checked further.

## Decisions for James

1. **The footer strip's "All 7 guides →".** Options: (a) keep the count and point it somewhere that lists the seven, which the home's `#towns` block no longer does on its own; (b) say "All 11 full sections →" like the masthead; (c) drop the link from the strip, since the masthead already carries it.
2. **Phone length of the hub's list pages** (`/this-weekend/` at 27,000 px). Paginate, collapse towns by default, or leave as is.
3. **Hub articles without the signup box.** Add the box, or keep the hub's long reads free of it on purpose.

## Second review, checked the same night

A second review of the live site was pasted in for a verdict. Its P0 list mostly came from text extraction and was wrong on the live HTML: the home has an h1, the Friday event names are in the HTML, every section home lists 8 to 17 events, all eleven sections are in Find your town, and every section has an Eat & drink page. These of its points held up and were fixed on this branch (DECISIONS.md, "Fixes from the live-site review"):

- **[accuracy]** Berthoud's tree lighting, 5 December at 5:45 pm by the parade's own site, was missing from /tree-lightings/. It is a record of its own now.
- **[content]** /articles/ listed the six newest stories twice. The subject below now holds only the earlier ones.
- **[design]** The home asked for an email before any story or town. The signup is last again, the owner's order of 13 November.
- **[navigation]** The home said 91 more towns and /towns/ said 95, listing four towns twice. Both now count and list by one rule.
- **[seo]** Fort Collins, Golden and Brush titles said 2026 while listing 2027 dates. A title's year now spans every date in the next twelve months.
- **[accuracy]** The CoCo article's Daily Camera and Reporter-Herald links go to Mass Transit's reprints and now say so. The Fort Collins "plus 10 percent" is explained from the City's own document.
- **[coverage]** 71 of 95 town pages have no trails and no places section: see `thin-town-pages.md`. Not changed.

Decisions added for James:

4. **The 71 thin town pages.** Fill them town by town, noindex the thinnest, or leave them. *Decided 18 November 2026: keep every page for now and revisit in February 2027, when the pages have three months of search data.* Removing a page takes its event pages with it (about 50 addresses for the 14 below), each needing a redirect or a 410, and the nightly re-checks already keep the records at little cost; noindex is the fallback if one is to go sooner.
   - **Candidates to remove** (an outlying area, no event in the next 90 days, at most one dated in the next year, nothing redirecting to or linking the page, no trails or places, under 5 search impressions, Aug 20 to Nov 16): Cedaredge, Meeker, Paonia, Hotchkiss, Craig, Walden, Kremmling, Crestone, Rocky Ford, Florence, La Veta, Cortez, Mancos, Marble.
   - **Hold, as thin but with a reason to wait:** Dillon, Silverthorne and Keystone (with the insidesummitcounty.com decision); Morrison (Red Rocks and Dinosaur Ridge: build out rather than cut); Westcliffe (10 impressions and a click already); Woodland Park, Green Mountain Falls and Victor (decide the Pikes Peak group together); Minturn (Vail's neighbour).
5. **La Junta and Buena Vista** hold their parade and tree lighting in one record, so neither shows on /tree-lightings/. Split them as Berthoud now is, or leave them.

## Proposed changes

`manager/towns.json`: note the move on each of the seven. Niwot shown; the same line goes on lyons, berthoud, erie, johnstown, windsor and carbon-valley.
```diff
-    { "slug": "niwot",       "name": "Niwot",        "domain": "insideniwot.com",        "live": true,  "alternate_domains": ["townofniwot.com"], "notes": "townofniwot.com is the older separate site; it now redirects to insideniwot.com. From 2026-11-12 it lists no events (lead: updates): ..." },
+    { "slug": "niwot",       "name": "Niwot",        "domain": "insideniwot.com",        "live": true,  "alternate_domains": ["townofniwot.com"], "notes": "Moved into insidethetowns.com/niwot/ on 2026-11-18 (src/config/guide-move.ts): every path on insideniwot.com 301s to the same path under the section; audit the section on the hub. townofniwot.com is the older separate site; it now redirects to insideniwot.com. From 2026-11-12 it lists no events (lead: updates): ..." },
```

`src/components/Hero.astro:138` and `src/components/home/NextStop.astro:111` (if the credit is to be readable):
```diff
-    <p class:list={['absolute right-1.5 z-10 text-[8px] leading-none text-white/75 ...
+    <p class:list={['absolute right-1.5 z-10 text-[11px] leading-none text-white/75 ...
```

`src/components/NetworkBar.astro:93`, option (b) above:
```diff
-                <li class="leading-snug sm:pb-3"><a href={`https://${hub.domain}/#towns`} class="inline-block py-3 text-[0.875rem] font-medium text-white underline sm:py-0">All {liveTowns().length} guides →</a></li>
+                <li class="leading-snug sm:pb-3"><a href={`https://${hub.domain}/#towns`} class="inline-block py-3 text-[0.875rem] font-medium text-white underline sm:py-0">All {fullSections().length} full sections →</a></li>
```
