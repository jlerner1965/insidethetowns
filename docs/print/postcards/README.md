# Mailing postcards: Niwot, Lyons, Berthoud

For Avery 3380 (two-sided, 4¼ × 5½ in, four to a sheet, micro-perforated,
65 lb matte cover). Made 4 November 2026 for handwritten notes to the three
towns in the 90-day test; the box holds 120 cards, so 30 sheets.

| File | What it is |
|---|---|
| `alignment-test.pdf` | The four card outlines. Print once on plain paper first |
| `niwot.pdf`, `lyons.pdf`, `berthoud.pdf` | Two pages each: page 1 is the front, four cards; page 2 is the back |
| `preview.png` | One front and one back, on screen |
| `make.cjs` | Makes all of the above; the header says how to run it |

## What is on each card

**Front:** the guide's name in its own colours, "What's on in [Town] this
weekend, and what changed this week", the home page's own line, the domain,
and a QR code that opens the home page with `?ref=postcard`. Plausible reads
`ref` as the visit's source, so **Sources** on each site's dashboard shows
`postcard` for scans. Every code was decoded from the rendered sheet, all
four cards, before these files were saved.

**Back:** the guide's name and `hello@` address top left, a stamp box top
right, a divider, and four faint address lines on the right half. The left
half is blank for the note. Nothing is printed in the bottom ⅝ in, which
the Postal Service keeps for its barcode. A First-Class postcard stamp
covers a card this size; Avery says the stock meets postal regulations.

## Printing

1. **Test first.** Print `alignment-test.pdf` on plain paper and hold it over
   a postcard sheet against a window. The lines should sit on the
   perforations. If they don't, it is almost always step 2.
2. **Actual size.** Choose *Actual size* or *100%* in the print dialog, never
   *Fit to page*.
3. **One sheet at a time**, paper guides snug, so the sheet goes in straight.
4. **Front:** print **page 1 only** of the town's PDF.
5. **Back:** put the same sheet back in turned over, top edge first again, and
   print **page 2 only**.
6. **Check the first sheet before printing more.** Snap one card out and turn
   it over like a page, left to right. The back should read the right way up.
   If it is upside down, your printer's duplex path differs: for the rest of
   the sheets, turn the sheet over bottom edge first instead. Every card on a
   sheet is the same, so nothing else can mismatch.
7. Content stops 0.3 in from every card edge, because the cards reach the
   sheet's edges and no inkjet prints to the edge. A hairline of white at an
   outer edge is the printer's margin, not a misalignment.

## What to write

One ask, in your own hand, and a return path. For a chamber:

> I run Inside [Town], the free weekly email and guide to what's on in town.
> Would you share the Thursday email with your members, and may I carry your
> events? hello@inside[town].com

Who gets one, from docs/BACKLINKS.md and the contact files:

- **Lyons Area Chamber of Commerce.** You have already spoken with them
  (20 October); the note is a follow-up and the distribution ask is drafted
  in `docs/relationships/drafts/lyons-chamber-2026-10-20.md`. They have no
  website of their own and run on Facebook, so confirm a mailing address
  before writing one.
- **Berthoud Area Chamber of Commerce** (berthoudcolorado.com). Their site
  opts out of automated reading, so a note is the route anyway.
- **Niwot Business Association** (niwot.com). Niwot has no chamber; the
  Association is the merchants' body and runs the downtown calendar.

No mailing address for any of the three is recorded in the repo; look each
up before you write. Golden and Erie are not in the test and have no cards
yet; `make.cjs` makes a town's sheet from one line once there is a reason to.
