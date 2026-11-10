# Inside the Towns — design audit, 10 November 2026

The 18 live guides, design only. Each was built from `main` at 336d266 and rendered in Chromium at 375 px and 1280 px: every section page plus one place, one event, one article and one team page per guide (about 25 pages each, some 860 page loads), with axe-core's WCAG 2.2 AA rules run on each. Every built page (3,400 across the 18) was also read for its head tags, headings and alt text, and the live home and four section pages of each guide were fetched (90 pages, all 200, none slower than 1.5 s, palettes as in the repo). One report per guide sits beside this file. Nothing under `content/` or `src/` was changed.

**Verdict:** the chassis is sound. Nothing overflows, no image is broken, no page lacks a title, description, canonical, viewport or single h1, no heading level is skipped and every image has alt text, on all 18. The problems are two contrast failures the colour checker does not test, three guides with one photograph each, and a handful of per-town items.

## Verdicts

| Guide | Verdict |
|---|---|
| Niwot | Sound, with two contrast failures that come from the green. |
| Lyons | Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page. |
| Berthoud | Clean on every measured check; two small things on the home page. |
| Erie | Sound; one contrast failure on the sports pages. Best photograph coverage on the network (19 of 49 places). |
| Johnstown | Sound; one contrast failure, and its red is nearly Loveland’s. |
| Timnath | The one guide whose hero shows no town; one contrast failure. |
| Elizabeth | Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page. |
| Windsor | Clean on every measured check. |
| Fort Collins | Sound; one contrast failure, and its green is all but Lafayette’s. |
| Longmont | Sound; one contrast failure and a stray mark in the wordmark. |
| Loveland | Sound; the weakest band contrast on the network. |
| Castle Rock | One photograph in the whole guide, shown four times on the home page; a placeholder palette. |
| Estes Park | Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page. |
| Golden | Sound, with the worst button contrast on the network, and two brand colours on one page. |
| Nederland | Clean on every measured check; the hero crop fights the type. |
| Leadville | Clean. No overflow, broken image, console error, missing alt, heading skip or missing head tag on any page. |
| Lafayette | A flagship with one photograph, shown four times on its home page. |
| Frederick | A flagship with one photograph, shown four times on its home page. |

## Fix now

- **N1 [design] Faded white text on the colour bands fails AA on seven guides.** The sports pages set eyebrows at white 80% (12.75 px) and game details at white 70% on the band (`NextUp.astro`, `home/SportsBar.astro`). Measured on the rendered pages: Niwot 3.97:1 and 3.42:1, Timnath 4.00 and 3.44, Johnstown 4.25 and 3.52, Loveland 3.75 (and 3.73 on Mountain View's purple), Longmont 4.09, Fort Collins 4.23, Erie 4.26. AA asks 4.5:1 at these sizes. `npm run check-colors` tests white/70 only at display size (3:1), so it passes.
- **N2 [design] The primary on the accent wash fails on Golden and Niwot.** The schools panel on /families/ is `bg-accent-soft` with `text-primary` outline buttons: Golden 3.96:1 (nine buttons), Niwot 4.31:1, Timnath 4.52:1. `global.css` says the accent is "never a wash", and `check-colors` has no primary-on-accent-soft pair.
- **N3 [design] Three guides show one photograph four times on the home page.** Castle Rock, Lafayette and Frederick have no listing or article image, so the hero and all three Find your next stop tiles are the same picture (`NextStop.astro` falls back to the hero). Seven more repeat the hero once: Berthoud, Estes Park, Fort Collins, Longmont, Nederland and Timnath in a tile, Johnstown in the Don't miss card.

## Fix soon

- **N4 [design]** Article pages carry two `<aside>` landmarks with no label (`routes/town/articles/[slug].astro`, lines 104 and 116); axe flags it on 16 guides.
- **N5 [design]** Type under 12 px on 17 guides: the "Next" pill and photo credits at 11.7 px (open since 22 October), the month on a family date chip and Berthoud's hero credit at 10.6 px.
- **N7 [design]** Primaries that are nearly the same colour: Fort Collins and Lafayette (8 RGB steps apart), Johnstown and Loveland (12), Berthoud and Windsor (24), Timnath and Longmont (27); Castle Rock's placeholder is 34 from both maroons. `check-colors` fails only an identical pair, and its comment says the primary "is what tells one tab from another".
- Per-town: Timnath's hero shows no town; Nederland's hero title sits on a painted sign; Longmont's wordmark opens its second line on a stray dot; Berthoud's `seoTagline`.

## Needs a visual check

- **N6 [design]** Desktop home with no Don't miss card: the listings stop at about 63% of the width and the right third is blank (Castle Rock, Elizabeth, Estes Park, Leadville and Nederland among others on the day).
- **N8 [design]** The four multi-school guides put the sports card above What's happening; on Loveland and Fort Collins no event is on the first laptop screen.
- On a phone, a flagship's first screen is the photograph, the colour band and the athletics band; the first listing starts under it.
- On seven flagships the athletics band is not the guide's colour (Niwot, Lyons, Timnath and Lafayette in another shade or hue, Erie and Johnstown in black, Golden in red); Golden's two also meet on /sports/.

## Since last audit

- Still open: Lafayette's identical tiles (4 November); the 11.7 px "Next" pill (22 October).
- Not raised again: titles over 65 characters, withdrawn on 9 November as by design (`src/lib/titles.ts`).

## Decisions for James

- **Photographs for Castle Rock, Lafayette and Frederick**, or a tile that shows the guide's colour when there is no second photograph. Two of the three are flagships in the Thursday email.
- **Golden's colour:** copper with a red athletics band, or the school's colour as on the other nine flagships.
- **Timnath's hero:** Old Town, or keep the sunrise.
- **Near-twin primaries:** leave them, or move Lafayette off Fort Collins's green and settle Castle Rock's placeholder by 29 November.
- **The multi-school sports card:** above the events, or under them.

## Proposed changes

N1, in `src/components/NextUp.astro` and `src/components/home/SportsBar.astro`: replace every `text-white/80` and `text-white/70` with `text-white`. White at 92% is the least that clears 4.5:1 on every band colour in use (Golden's copper is the limit, 4.58:1), so full white with the existing weight difference is the simple form. Then in `scripts/check-colors.ts`, beside the display-size line:

```ts
want(`${site.slug} small white text on primary`, ratio(WHITE, primary), 4.5);
```

N2, in `src/routes/town/families.astro` line 340: `bg-accent-soft` to `border border-line bg-raised` (white, as every other panel), which also restores the token rule. Or add to `check-colors.ts`:

```ts
want(`${site.slug} primary on the accent wash`, ratio(primary, mix(site.colors.accent, 0.16, WHITE)), 4.5);
```

which fails today for Golden and Niwot.

N4, in `src/routes/town/articles/[slug].astro`: `aria-label="About this guide"` on the aside at line 104 and `aria-label="On this page"` on the one at line 116 (check the wording against what each holds).

## Couldn't verify

- How the pages look in Safari or Firefox: rendered in Chromium only.
- The live sites beyond five pages each; the rendered checks ran on a local build of the same commit's code, built on 10 November, so day-dependent blocks (Don't miss, the signup's position) may differ from what was live.
