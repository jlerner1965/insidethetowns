---
# One file per town per week: content/<town>/weekly/<weekOf>.md, weekOf the Monday.
# The pick's url is its listing on this guide (https://<domain>/events/<slug>/),
# and the listing's date decides where it shows: as Our pick only in the week
# it is on, under "Coming up" with its own date if it is later, and not at all
# without a listing to date it by.
# "This week in [Town]" reads the pick from the current week's file only, and
# New & closed from every file until each item's expires date (default: 14
# days after weekOf). An opening, closed, new-hours or moved item with no
# source is skipped. Leave what you have nothing for blank.
# On a flagship guide the home page's masthead prints `headline` under "The
# week of …" (two or three plain sentences, every fact one the week's
# listings or sources carry), and `knowTitle` heads "Three things to know"
# (a few words; "This week" when blank).
weekOf: 2026-10-12
headline: ""
knowTitle: ""
pick:
  title: ""
  body: ""
  url: ""
changes:              # New & closed
  - tag: opening      # opening | closed | new-hours | moved | added-to-guide
    name: ""
    detail: ""
    source: ""        # owner's or official announcement
    checked: 2026-10-13
    expires: 2026-10-26
---
