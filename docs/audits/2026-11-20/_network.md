# Inside the Towns — design audit, 20 November 2026

**Verdict:** Clean chassis with one real inconsistency: a section's annual-event pages wear the hub's colours and footer. The rest is wording, 11 px type and carried-over decisions.

**Scope.** Design check only, every live site: the hub and its seven guide sections (Berthoud, Erie, Johnstown, Windsor + Severance, Carbon Valley, Lyons, Niwot), all on insidethetowns.com since 18 November. Four passes: the code (chassis, palette, `npm run check-colors`), the live HTML of 129 pages, and 25 pages rendered at 375 px and 1280 px. Content, accuracy, links and coverage were not run. Nothing was changed.

| Check | Result |
|---|---|
| 129 pages fetched (hub 8, sections 121) | all 200 at their final URL except the five noted below; p50 0.2 s, max 0.9 s |
| Every page | one title, one description (94–155 chars), canonical = URL, viewport, og:title and og:image, one h1, no skipped heading level, alt on every image, no http:// asset, 300 assets HEAD-checked all 200 |
| Palette | `--town-primary` set per section and distinct across all eight; `check-colors`: all pairs pass AA, school bands white at 7:1 |
| 25 pages × 2 viewports | 0 console errors, 0 horizontal scroll, 0 broken images, 0 contrast failures in header, hero, bands, footer or buttons; one element under 12 px (Berthoud hero credit) |
| Phone menu, 7 homes | opens, locks scroll, closes on Escape and tap-outside |
| Keyboard, 7 homes | first tab is "Skip to content"; visible 2 px outline in the town colour on every stop |

## Fix now
- **[design] A section's annual-event pages take the hub's chrome.** `/windsor/wonderland/`, `/lyons/parade-of-lights/`, `/lyons/tree-lighting/`, `/carbon-valley/frederick-festival-of-lights/` carry the Windsor, Lyons or Carbon Valley masthead and menu (the 18 November brief) but the hub palette (`--town-primary:#24455D`), the hub footer with no "All 11 towns" strip, no signup form, and "Report a correction" as a mailto rather than `/<town>/correct/`. Every other page in those sections has the section's palette, footer and form. `src/routes/hub/event.astro:158` passes `masthead` only. See Decisions.
- **[design] Faded white on a colour band, 11.7 px.** The year under a tradition's date block is `text-[0.6875rem]` at `opacity-80` on `bg-primary text-white` (`src/components/TraditionRow.astro:118`, every `/traditions/` page and the pages above): 3.97:1 on Niwot's green, 4.26:1 on Johnstown's red, under 4.5:1. `test/band-contrast.test.ts` does not cover this file. Diff below.

## Fix soon
- **[design] Network strip wording.** Masthead `All 11 full sections →` (`Header.astro:215`) and footer `All 11 towns →` (`NetworkBar.astro:244`), the same link. The count was aligned after 19 November; the phrase was not.
- **[design] Neighbour towns named three ways.** Phone menu: "Inside Johnstown" beside "Loveland on Inside the Towns"; section footer: bare "Johnstown"; hub footer: "Inside Berthoud" beside "Longmont · Inside the Towns". Open since 19 November.
- **[design] Home titles stray from the 20 November formula** ("<Town>, CO events this weekend & things to do"): Erie, Johnstown and Windsor still say "Colorado" (`erie.ts:20`, `johnstown.ts:16`, `windsor.ts:32`). Inner-page suffixes also vary: Erie's sports page ends " · Inside Erie", its eat-drink page "| Inside Erie", Berthoud's and Johnstown's equivalents have none. Diff below.
- **[design] 11 px type on a 17 px root:** the "Our pick" pill (`PlaceDirectory.astro:86`, every places page), the month on a tradition date block below 640 px (`TraditionRow.astro:116`), the "Home" tag in the playoff scores table (`routes/hub/curiosity-article.astro:241`). 0.75rem is the floor elsewhere.
- **[design] "Open now" dot is a hard-coded colour**, `bg-[#2f9e5b]` (`FilterBar.astro:60`), unlike the `.open-status` green `#1f7a45` (`global.css:720`), and outside `check-colors`.
- **[design] Berthoud and Windsor primaries are 24 RGB steps apart** (#572932, #6A1B32); `check-colors.ts:169` fails identical pairs only (N7, open since 10 November).
- **[design] Signup box missing where sibling pages have it:** hub articles and `/articles/` (19 November, Decision 3); `/windsor/sports/`, `/severance/`, `/windsor/windsor/`; Niwot's place pages and `/niwot/traditions/` while `/niwot/sports/` and its home carry one.
- **[design] Unlabelled `<aside>` landmarks** remain on `pages/about.astro:157` and `:286`, `routes/town/places/[slug].astro:356`, `events/[slug].astro:384`, `updates.astro:60`, `get-involved.astro:67`, `living-here.astro:77`, `people/[slug].astro:53`. The article route was fixed.
- **[design] Phone page length** at 375 px: `/this-weekend/` 28,292 px (27,386 on 19 November), `/erie/events/` 19,952, `/erie/families/` 19,140, `/lyons/families/` 17,281, `/golden/` 16,415. The filter chip row on events and families pages clips its last chip ("This we…") with no scroll cue.
- **[design] `/lyons/sports/` is a 404** served with the hub's header and footer, not Lyons's. Nothing links to it and insidelyons.com/sports/ forwards to `/lyons/families/#program-high-school-athletics`, but `manager/towns.json` still says "the sports pages still build". Diff below.
- **[design] Comments out of date:** `global.css:15` and `palette.ts:9` say the accent is "never a wash", yet `bg-accent-soft` carries ink text on the tie pills and the families pill, and `check-colors.ts:95` proves it. `SEO.astro:203` sets og:title to the site title on a home whose `<title>` is the tagline.

## Explained by config, not findings
Shops in Berthoud's and Niwot's menus only (`nav.ts:95`, ten open shops); Windsor and Carbon Valley on cool paper; Erie's and Johnstown's black sports bars (the schools' colours, `school-sports.ts:591`); Carbon Valley's signup below Find your next stop (`TownHome.astro:168`, a thin day); Niwot without the email button (out of the weekly email); Windsor's two-school strip under What's happening; Johnstown and Carbon Valley next-stop tiles as text (fewer than three photographs).

## Since last audit
- Fixed: N1 white at 70/80% on bands (full white now, lowest ratio 7.03:1 on Erie's NextUp); N2 primary on the accent wash; N4 article asides; N5 for credits and the Next pill (0.75rem); N6 empty right third (every home had a Don't miss card today); N8 sports card above the events; the footer's "All 7 guides"; a Report a correction link on all 129 pages; Lyons's navy-on-blue phone home; empty-alt next-stop photographs (closed by the 20 November decision).
- Still open: the Berthoud 8 px credit and the hub article signup (Decisions); `manager/towns.json` not yet noting the 18 November move (19 November, hub.md).

## Needs a visual check by James
- N3, desktop only: Berthoud's Eat & drink tile is the hero (`berthoud.ts:51`, by config); Niwot's Living here tile is the hero; Erie's Things to do tile is the Don't miss photograph.
- Windsor's three next-stop photographs are flat beside a strong lake hero.
- On every desktop home the Kids-and-family link block sits in the left two-thirds with the right third empty.

## Decisions for James
1. **Annual pages under a section:** give them the section's palette, footer, signup and correction form (a `town` prop into `Page`), or keep the hub chrome under the section masthead on purpose.
2. **Berthoud's 8 px credit** (`Hero.astro:138`, `NextStop.astro:111`). Your call of 28 October and 10 November, kept; in the 1280 px render it cannot be read, and the comment itself says a credit nobody can read is not one. Accept as is, or 0.625rem.
3. **One phrase for the network strip:** "full sections", "towns", or drop the footer link.
4. Carried from 19 November: the hub articles' signup box (3) and the phone length of the list pages (2).

## Proposed changes
`src/components/TraditionRow.astro:118`
```diff
-    {block.foot && <span class:list={['mt-1 text-[0.6875rem] sm:text-[0.75rem]', block.set ? 'opacity-80' : '']}>{block.foot}</span>}
+    {block.foot && <span class="mt-1 text-[0.75rem]">{block.foot}</span>}
```
and add `src/components/TraditionRow.astro` to the files `test/band-contrast.test.ts` reads.

`src/config/towns/erie.ts:20`, `johnstown.ts:16`, `windsor.ts:32`
```diff
-  seoTagline: 'Erie, Colorado events this weekend & things to do',
+  seoTagline: 'Erie, CO events this weekend & things to do',
```
(the same for Johnstown and Windsor).

`manager/towns.json`, lyons
```diff
-"notes": "outdoors-led from 2026-11-12 (lead: outdoors): no sports item in its menu or on its home page; the sports pages still build" },
+"notes": "outdoors-led from 2026-11-12 (lead: outdoors): no sports item in its menu or on its home page; no /sports/ since 2026-11-17 (insidelyons.com/sports/ forwards to /lyons/families/#program-high-school-athletics)" },
```

Screenshots, if wanted while the session lasts: `/tmp/claude-0/-home-user-insidethetowns/4d4b80e5-9006-51a1-ad63-d94688f37839/scratchpad/visual/` (102 PNGs: full pages, heroes, open menus, first focus stop).
