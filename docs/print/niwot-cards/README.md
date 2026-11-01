# Inside Niwot handout cards

For Avery 8371 / 5874 (two-sided, Clean Edge, 2 × 3.5 in, ten to a sheet).
Made 1 November 2026.

| File | What it is |
|---|---|
| `alignment-test.pdf` | Card outlines. Print once on plain paper first |
| `<place>.pdf` | Two pages: page 1 is side 1, ten cards whose QR code names that place; page 2 is side 2, the back |
| `preview.png` | One front and the back, on screen |

## Each place has its own code

Every front sheet's QR code opens the home page with `?ref=card-<place>`.
Plausible reads `ref` as the visit's source, so **Sources** on the Plausible
dashboard shows `card-oldoak`, `card-winot` and so on: which counter gets
scans. `general.pdf` (`?ref=card`) is for anywhere else. Leave one
place's sheet at one place.

| Sheet | Place | Shows in Plausible as |
|---|---|---|
| general | anywhere | card |
| oldoak | The Old Oak Coffeehouse | card-oldoak |
| winot | Winot Coffee Company | card-winot |
| inkberry | Inkberry Books | card-inkberry |
| market | Niwot Market | card-market |
| loveicecream | Love Ice Cream | card-love |
| wheelhouse | The Wheel House | card-wheel |
| fritz | Fritz Family Brewers | card-fritz |
| tavern | Niwot Tavern | card-tavern |
| gardengate | Garden Gate Cafe | card-garden |
| littlebird | Little Bird | card-bird |

The links are kept short, so every code is the smallest size (29 × 29). Each
was decoded from the rendered sheet, at all four corners, before these files
were saved.

## Printing

1. **Test first.** Print `alignment-test.pdf` on plain paper. Hold it over a
   card sheet against a window. If the outlines don't sit on the card edges,
   fix the printer (steps 2 and 3) before using card stock.
2. **Actual size.** In the print dialog choose *Actual size* or *100%*, never
   *Fit to page* or *Shrink oversized pages*. Fit-to-page is the usual
   reason a sheet comes out shifted.
3. **One sheet at a time** through the manual or rear tray, paper guides
   snug against the sheet. The first sheet printed on 31 October went in at
   a slight angle; snug guides stop that.
4. **Side 1:** open the place's PDF (`oldoak.pdf`, say) and print **page 1
   only**, on the side Avery marks "SIDE 1".
5. **Side 2:** put the same sheet back in turned over, top edge first again,
   and print **page 2 only**. Every back is the same, so if a sheet goes in the
   other way round the cards still match; check that the backs aren't upside
   down on the first sheet before printing more.
6. **Scan one card from a corner of the sheet** with a phone before snapping
   them out. Fold the sheet inward to snap the cards out, as Avery says.

## What changed from the first sheet, and why

- **QR code 0.9 in, up from about 0.6 in**, with its full white border. The
  print guides agree on about 0.8 in (2 cm) or more for a card held in the
  hand, and four modules of white all round. A cropped border is the most
  common reason a printed code fails to scan.
- **Everything 0.19 in or more from the card edge.** A home printer can be a
  little off, and the Clean Edge cards have no bleed.
- **The line under the headline** now says "checked every week", which is
  what sets the guide apart.
- **A back side**: the Thursday email and "Know of an event?", which brings
  in the events the feeds miss. It has no second code, so nobody wonders
  which one to scan.

## Remaking them

`make.cjs` builds every file here. It needs Node, Playwright and the
`qrcode` package (`npm install qrcode`). Edit `SHOPS` to add a place: keep
the ref eight characters or fewer after `card-`, so the code stays the
smallest size.
