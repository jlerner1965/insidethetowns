---
# One file per town per week: content/<town>/weekly/<weekOf>.md, weekOf the Monday.
# "This week in [Town]" reads the pick from the current week's file only, and
# New & closed from every file until each item's expires date (default: 14
# days after weekOf). An opening, closed, new-hours or moved item with no
# source is skipped. Leave what you have nothing for blank.
weekOf: 2026-10-12
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
