# Needs me

*Written by `npm run needs-me` (scripts/needs-me.ts) on 2026-11-20, from the files as they stand. The nightly re-check rewrites it; do not edit it by hand.*

What no machine could settle. Each line says where to look; the fix is always a person reading the source (or calling), then the file.

## How to confirm a place by hand

Read its source in a browser (or call, email or visit). If it is as the file says, run the command in its row, from the repository:

```bash
npm run confirm-place -- black-hawk/bar-8042 --how=browser
```

That records a verified read dated today (`verified`, and `verifiedBy` with your name and how), and clears its flags: set aside, read blocked, possible closure. Add `--on=2026-11-20` for the day you checked if it was not today, `--how=phone` (or `email`, `in-person`) for how, and `--note="Hours unchanged"` to keep what you found. Several places go in one command. If something differs (hours, phone), correct the file too. If it has closed for good: `--closed --note="What happened and how you know" --source=<page>`; its old address becomes 410 at the next redirect-map rebuild. Then `npm run validate`, commit and push (or ask Claude to). The nightly run drops it from this list.

## Places set aside by you (1)

Kept, noindex and off every list, until you confirm them. The nightly re-check reads them but never clears them.

| Town | Place | Last verified | Listed now | Source to read | Why | To confirm it |
|---|---|---|---|---|---|---|
| Timnath | [The Hidden Stem](https://insidethetowns.com/timnath/places/the-hidden-stem/) | 2026-09-18 | no: set aside | <https://timnathchamber.com/directory/the-hidden-stem> | Not re-read at the move, 17 November 2026: the Chamber directory listing now gives no address, phone or hours (only "a garden boutique on Main Street in Timnath"); its own page is Facebook (login wall); thehiddenstem.com did not answer. | `npm run confirm-place -- timnath/the-hidden-stem --how=browser` |

## Possible closures (3)

A sign the place may have closed that does not say so in those words: its page gone, a locator that no longer lists it, "Site Closed", a parked domain. Nothing is hidden and nothing becomes a 410 until you confirm it. While its last verified date is inside the window it stays listed; past it, the usual rules apply.

| Town | Place | Last verified | Listed now | Source to read | Why | To confirm it |
|---|---|---|---|---|---|---|
| Estes Park | [Estes Perk & the Velvet Lounge](https://insidethetowns.com/estes-park/places/estes-perk/) | 2026-10-20 | yes, through 2026-12-19 | <https://estesperk.com/> | 2026-11-19: the source page answered but no longer names the place or lists its phone, https://estesperk.com/ | `npm run confirm-place -- estes-park/estes-perk --how=browser` |
| Evergreen | [Suz Cookie Jar Rescue Bakery & Bites](https://insidethetowns.com/evergreen/places/suz-cookie-jar-rescue/) | 2026-10-06 | yes, through 2026-12-05 | <https://scjrbakery.com/> | 2026-11-17: own site scjrbakery.com is now a domain-parking page (redirects to /lander); no other official page found. | `npm run confirm-place -- evergreen/suz-cookie-jar-rescue --how=browser` |
| Niwot | [The Niwot gateway sculpture](https://insidethetowns.com/niwot/places/gateway-sculpture/) | 2026-09-09 | yes, through 2026-12-08 | <https://niwotarts.org/> | 2026-11-18: the source page answered but no longer names the place or lists its phone, https://niwotarts.org/ | `npm run confirm-place -- niwot/gateway-sculpture --how=browser` |

## Places whose source blocked the nightly read (2)

Flagged on the first blocked read (a bot check, a refusal, robots.txt, no answer). Each stays listed and indexed while its last verified date is inside its window (90 days on the Front Range, 60 in the mountains); past it, the usual rules apply: a guide drops it, a hub section keeps its page noindex as re-check pending. A later read that works clears the flag by itself.

| Town | Place | Last verified | Listed now | Source to read | Why | To confirm it |
|---|---|---|---|---|---|---|
| Estes Park | [Estes Valley Community Center](https://insidethetowns.com/estes-park/places/estes-valley-community-center/) | 2026-10-13 | yes, through 2026-12-12 | <https://evrpd.com/community-center/> | 2026-11-18: the source page: answered 307 | `npm run confirm-place -- estes-park/estes-valley-community-center --how=browser` |
| Loveland | [Bai Tong](https://insidethetowns.com/loveland/places/bai-tong-loveland/) | 2026-10-04 | yes, through 2027-01-02 | <https://www.baitongloveland.com/> | 2026-11-18: the source page: 403, a bot check or a refusal (https://www.baitongloveland.com/); left for the owner to confirm | `npm run confirm-place -- loveland/bai-tong-loveland --how=browser` |

## Dates the watch read but did not write (1)

The nightly date watch writes a date only where the organizer’s page states the year (or gives a weekday that is that date’s in the year), the date is in the future, and it falls inside the record’s typical window. These did not. **To clear one:** read the page, and write the year `confirmed` with its date, `sourceUrl`, the words you read (`readText`) and `checked`, or `canceled` with the reason in the organizer’s words.

| Event | Town | Year | Window opens | Why | Words read | Page | Read | File |
|---|---|---|---|---|---|---|---|---|
| Lake John Ice Fishing Tournament | Walden | 2027 | 2027-01-10 | the page gives 01-10, 01-11 with no year | “…January 10th and 11th! The tournament is still on! Colorado has been experiencing some unse…” | <https://www.visitnorthparkco.com/2026-lake-john-fishing-contest> | 2026-11-20 | `content/hub/traditions/walden-lake-john-ice-fishing-tournament.md` |

## Tradition dates not confirmed three weeks before their window (0)

The nightly date watch reads the organizer’s page from eight weeks out; these are three weeks out or less with no date for the year. **To clear one:** read the page (or call), and write the year `confirmed` with its date and `checked`, or `canceled` with the reason in the organizer’s words.

None.

## Seasonal roundups due with dates missing (2)

A roundup is due from eight weeks before its season (src/lib/traditions.ts, CURRENT_SEASONS). Report only: nothing fails a build.

- **[Winter carnivals](https://insidethetowns.com/winter-carnivals/)**, season 2026-12-01 to 2027-03-15, due since 2026-10-06 (under six weeks to go): 1 of 13 without a confirmed date: Cripple Creek Ice Festival (Cripple Creek).
- **[New Year’s celebrations](https://insidethetowns.com/new-years/)**, season 2026-12-31 to 2027-01-01, due since 2026-11-05 (under six weeks to go): 1 of 13 without a confirmed date: New Years Eve Fireworks & Torchlight Parade (Keystone).
