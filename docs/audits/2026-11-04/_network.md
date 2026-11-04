# Inside the Towns — flagship audit, 4 November 2026

The ten flagships (Berthoud, Elizabeth, Erie, Frederick, Golden, Johnstown, Lafayette, Lyons, Niwot, Windsor), read from the repo and live on the evening of 3 November 2026 (Denver), the 3 November 05:10 build. One report per guide sits beside this file, each headed with what was applied on branch `claude/flagship-audit-2026-11-04`. Scope: every main page of the ten sites fetched (158, all 200); `npm run check-links` over the ten guides' content (1,972 links); about 2,100 external links tested from the live pages by the town agents; roughly 230 facts (hours, dates, times, venues, prices, meeting dates) read against the business's or organizer's own page, of which about 20 were wrong and are fixed here; the Monday research agent's flags ruled on; and up to two real local changes found for each guide from official sources.

## Verdicts

| Guide | Verdict |
|---|---|
| Berthoud | Clean for a reader; the 3G result was hidden behind two newer items on the home (a chassis bug, fixed); Kofe House's Thursday dinner; two local changes added. |
| Elizabeth | Accurate where a machine can read it (18 of 20), thin and stalling: the Town blocks every automated read, the library's programs stop at October on the guide, the Redfin link reached Iowa. Worth knowing has its first two items. Keep-or-drop decision open. |
| Erie | Good (24 of 29 matched); Erie Social Club was listed open on Sundays; the Veterans Day listing hid a registration deadline; two local changes added. |
| Frederick | Accurate where it counts (23 of 26) but five reader-facing errors on a two-day-old flagship: four `/updates/<slug>/` links that 404, the Festival of Lights "from midnight", a ballot item still saying vote, a wrong D&D time, a dead market application. All fixed; two local changes added. |
| Golden | Solid; four wrong facts (Old Capitol Grill's weekend opening, the Buffalo Bill Museum's winter-hours end, Donut Dollies' veterans price, the council's 4:30 start), each fixed with a correction; two local changes added. |
| Johnstown | Fair: three full library classes said "Free" and nothing else; Planning and Zoning on the wrong Wednesday; two real local changes waiting on the Town's site. All applied. |
| Lafayette | Sound for a two-day-old flagship, but the weekend tab sent readers to a canceled walk and a members-only meeting, and five public fields carried the build agent's notes to itself. All fixed; two local changes added. |
| Lyons | Clean for a reader; St. Vrain Market and Smokin Dave's hours wrong at the top of Eat & drink; three hedges live; the Board's four hearings missing from its listing; Worth knowing back with two Town decisions. |
| Niwot | Clean for a reader; the LID meeting of 3 November was never on the county's agenda; eight "when this was checked" hedges live; the incorporation result (featured) and St. Vrain open enrollment added. |
| Windsor | Solid on hours and dates; a canceled Severance council meeting still listed; the Art & Heritage Center's Thursday hours the Town no longer gives; Chimney Park's reopening now dated. Worth knowing has its first two items. |

Links: 1,972 links in the ten guides' content, 2 dead (both fixed), 14 moved (relinked where the redirect was by design), the rest fine; about 2,100 external links from the live pages, none dead; the 403s are bot walls (MaxPreps, Zillow, Realtor, the Town sites of Windsor and Elizabeth, Weld and Larimer counties).

## What was chassis-wide, and what changed in code

1. **The guide's best writing was reachable from /guides/ alone.** Thirteen flagship articles (six town histories, three breakfast guides, the county-line and fire-district explainers, two of Niwot's civic pieces) were linked from no section page. Eat & drink now lists its Food & drink articles and Moving here its History, Civic, Moving here and Community articles, the block Things to do already carried for Outdoors; Families lists every outing guide, not the newest (Windsor's was hidden behind Severance's). Lafayette's walking-order guide, the one "Explore" category on the network, is refiled as Outdoors. The category is the rule from here.
2. **A featured change did not lead Worth knowing.** `TownHome.astro` re-sorted by `published` alone; Berthoud's featured 3G result sat behind two routine notices. It keeps `currentUpdates`' order now.
3. **Editor's doubt on public pages.** Five flagships carried the build agents' notes to themselves in summaries, hours fields and bodies ("its calendar did not load for this reader", "look like an error", "when this was checked"): about thirty instances across the flagships, all cut with the facts kept. `npm run validate` now warns on these phrases in any public field (`HEDGE_PHRASES`); it names six more on Castle Rock, Estes Park and Fort Collins, outside this audit.
4. **Worth knowing starves without a feed.** Elizabeth and Windsor had never had a local change; Lyons's expired on Election Day; Golden, Johnstown and Niwot had one each. Every one of the twenty items added here came from a page the Town, county, library or school district already publishes. Nothing in the automation writes `updates/` files: the Wednesday research agent drafts the week's notes and never a change. That is the gap behind this finding, and a decision (below).
5. **A past event a sent email links must stay.** Past event pages are still served (200, noindex), so deleting the file breaks a link in a reader's inbox. Thirty files on Berthoud, Erie, Lyons and Niwot were kept on that ground; the unlinked ones were deleted. DECISIONS.md carries the rule.
6. **Frederick's `/updates/<slug>/` links.** Four Frederick pages linked a per-change URL the chassis does not build (it links `/updates/#slug`). Fixed in content; worth a validator check if it recurs.

## Election night

Four flagships voted on 3 November and every result is on the guide as the county's unofficial count, labelled so, as the counties label it: Berthoud's 3G (bonds fail), Niwot's incorporation (546 to 1,466 against), Erie's 3E lodging tax (passes) and 3F Community Center tax (fails), Elizabeth's four trustee seats, Lafayette's 2A (Lamont Does Park tax extended, 7,017 to 3,509). Frederick's 2D and 2E could not be read (apps.weld.gov blocks automated reads); its item says the vote happened and where the count is. Golden's Jeffco Schools 5A and 5B were trailing; no item.

## Technical

`npm test` 624 pass; `npm run validate` 0 errors, 7 warnings (the hub's rate card and six hedges outside the flagships); every flagship builds, and the Worth knowing block on each home shows two items (see the per-town reports for which). The Berthoud home was rebuilt after the Worth knowing fix and leads with the 3G result.

## Decisions for James (collected)

- **Elizabeth: keep or drop.** `manager/towns.json` says decide by 15 November; the town config says 30 November. The content is accurate where a machine can read it, but the Town's site blocks every automated read, so its civic listings are hand-check only, a monthly cost no other flagship carries.
- **Feeding Worth knowing.** Either the Wednesday research agent drafts `updates/` files from the Town's news and agenda pages (the sources are in each `sources.json`), or it stays a hand pass. Twenty items in one night says the material is there.
- **Election results.** Published now as unofficial counts. Say the word when each county certifies (Boulder 24 November; Elbert, Larimer and Weld on their own schedules) and the items get the certified figures and `stage: approved`. Frederick's 2D/2E needs a browser read of apps.weld.gov.
- **Johnstown: the Berg notice.** The Town's statement on Councilmember Damien Berg's death runs as a `notice` for 60 days. Thirty, or the week's notes only, are the alternatives.
- **Per-town calls** (each in its report): B-Rad's Arcade and Ziggi's (Berthoud); Mini Donuts and the Carriage Shoppes' hours, The Coffee House on Main (Elizabeth); Council 10 November 6:30 or 7, Ziggi's, Injoy (Erie); Board-meeting wording, ECR Cafe, the staged quilters (Frederick); the staged Abejas, Buffalo Bill's hours form, the police notice (Golden); Cassidy's hours, bars, Herman's Hermits (Johnstown); Ras Kassa's and Romero's hours, Drought Stage 1's expiry (Lafayette); the utility-rate item (proposed, or wait for the minutes), the Dairy Bar, the electric tiers, the Sunday class (Lyons); when to state the incorporation result as certified, the 17 November LID meeting (Niwot); Chimney Park as an item, the Severance hearing, the Dara Weyna and craft-show events (Windsor).
- **Past files that stay.** Thirty past event files linked from sent emails remain hidden on the sites. A redirect rule for a deleted past event (to `/events/`) would let the weekly report's "delete" advice be followed; until then they stay.
