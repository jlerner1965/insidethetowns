# Dated items for the hub town pages: research of 12 November 2026

Researched for the restructure brief of 12 November 2026: for each of the
37 hub towns, its traditions and outdoor dates, each read on the
organizer's or the agency's own page. One record per item, in the shape of
`content/hub/traditions/` (src/content/schemas.ts, `traditionSchema`).

- **Verified records are in `content/hub/traditions/`**, not here: 258
  on 12 November, 245 from this research and the 13 holiday records
  approved out of `docs/agent/traditions/`. Each carries its `sourceUrl` and a `checked`
  date on every year.
- **`unverified/`** holds what could not be read on its source: a page that
  refuses automated reads (not worked around), a date seen only in a search
  result or on a listing that is not the organizer's, two official pages
  that disagree, a date that rests on a rule ("each year on New Year's
  Eve") and not on a published date, or a tradition that could not be
  confirmed as still running. To publish one, read its source in a browser,
  correct the record, and move it to `content/hub/traditions/`.
- **`held/`** holds records that were read and are sound but are left off
  the pages on purpose (weekly markets and series; the eight fee-free days
  of 2026). Its README says why.
- **`_notes-<town>.md`** is the research log for each town: every URL read,
  how, the words on the page that give the date, and what was looked for
  and not found.

## How the verified records were checked

1. Researched from the organizer's own page, one agent per cluster of
   towns, under the rules in the brief: the source opened and read, never a
   search snippet; a date not on the page is `not-announced`; a typical
   window goes in `typicalWindow` in the source's words; no bot check
   worked around; the weekday on the page checked against the calendar.
2. Curated: 16 records the researchers themselves flagged were demoted to
   `unverified/` or held back, and seven corrected (a date resting on "each
   year", a year the agency did not print, a release date recorded as an
   opening day).
3. Spot-checked independently, two records in five (101 of them), by
   re-reading each source page without the research notes. Six problems:
   two dates (a fair's end date the page does not give; a rodeo whose first
   day is a concert), one start time, two typical windows that were
   paraphrases and not the page's words, and one programme with 2027 dates
   recorded as not announced. All six corrected. That is two material
   errors in 101, inside the handoff rule of 11 October (no more than one
   in ten). The other three in five were not re-read.

A date recorded for 2026 where the page prints a weekday and a day but no
year follows the standing rule (README, "Rules at entry"): it counts as
dated when it falls on that weekday this year. The research notes say
which records rest on that.
