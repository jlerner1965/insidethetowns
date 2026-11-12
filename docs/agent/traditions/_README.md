# Tradition drafts, winter 2026: for approval

Drafted 12 November 2026 for the 18 live guides, two types only: parades of
lights and tree lightings. Each `.md` here is a complete record. To approve
one, read its `sourceUrl`, then move the file unchanged to
`content/hub/traditions/`. `npm run validate` and the build check it there.
Nothing here is on any site until it is moved.

The three research notes (`_notes-a.md`, `_notes-b.md`, `_notes-c.md`) list
every page read and what each said.

## How these were checked

Each draft was researched from the organizer's own page. Then every 2026
date was read again on its `sourceUrl` in a plain headless browser, along
with the three 2025 "last held" pages. That second read found the date on
the organizer's page for 17 of the 18 drafts. The one it could not read is
Elizabeth (below). No bot check was worked around.

## The 18 drafts

All are `confirmed` for 2026. None is not announced, moved or canceled.

| Draft | Town | Type | 2026 | Read again |
|---|---|---|---|---|
| `berthoud-parade-of-lights` | Berthoud | Parade of lights | Sat Dec 5, 5 pm | Yes |
| `castle-rock-outlets-tree-lighting` | Castle Rock | Tree lighting | Sat Nov 14, 4 pm | Yes. **Check that it counts** |
| `elizabeth-mayors-tree-lighting` | Elizabeth | Tree lighting | Sat Dec 5 | **No: open it in a browser first** |
| `erie-parade-of-lights` | Erie | Parade of lights | Fri Dec 4, 4:30 pm | Yes |
| `estes-park-catch-the-glow-parade` | Estes Park | Parade of lights | Fri Nov 27, 5:30 pm (2025: Nov 28) | Yes, both years |
| `estes-park-lighting-of-the-trees` | Estes Park | Tree lighting | Sat Nov 21, 3:30 pm | Yes |
| `fort-collins-downtown-holiday-lighting-ceremony` | Fort Collins | Tree lighting | Fri Nov 6, 5:30 pm (past) | Yes. **Check the type** |
| `fort-collins-nightlights-tree-lighting` | Fort Collins | Tree lighting | Tue Dec 1, 5:30 pm | Yes |
| `frederick-festival-of-lights` | Frederick | Tree lighting | Sat Dec 5, 5:30 pm | Yes |
| `johnstown-jingle` | Johnstown | Tree lighting | Sun Dec 6, 2 pm | Yes. **Check the organizer's name** |
| `longmont-lights-holiday-parade` | Longmont | Parade of lights | Sat Dec 12, 5 pm (2025: Dec 13) | Yes, both years |
| `longmont-light-up-longmont` | Longmont | Tree lighting | Sat Nov 21, 5 pm | Yes. **Check the type** |
| `longmont-village-at-the-peaks-tree-lighting` | Longmont | Tree lighting | Sat Nov 28, 4:30 pm | Yes. **Check that it counts** |
| `loveland-festival-of-lights` | Loveland | Tree lighting | Fri Nov 20, 5 pm | Yes |
| `lyons-parade-of-lights` | Lyons | Parade of lights | Sat Dec 5, 6:30 pm (2025: Dec 6) | Yes, both years |
| `lyons-tree-lighting` | Lyons | Tree lighting | Fri Dec 4, 5 pm (2025: Dec 5) | Yes, both years |
| `niwot-enchanted-evening` | Niwot | Tree lighting | Fri Nov 27, 6 pm | Yes |
| `windsor-wonderland` | Windsor | Tree lighting | Sat Dec 5, 4 pm | Yes |

## Settle these before approving

1. **Elizabeth: not read.** The Town's page is behind a Cloudflare bot
   check. The date comes from the page's own address
   (`…/mayors-tree-lighting-saturday-december-5-2026`) and from a search
   engine's copy of the page. Open it in a browser. If it says December 5,
   approve it as it is. The time and place were left out because they could
   not be read.
2. **Does it count as a tree lighting?**
   - **Castle Rock Outlets** and **Longmont's Village at the Peaks** are
     shopping centres' tree lightings, not the town's.
   - **Fort Collins' Downtown Holiday Lighting Ceremony** lights the trees
     across Old Town, not a single tree.
   - **Light Up Longmont** is billed as a "holiday lights stroll". It
     includes a tree lighting at 6th Ave. Plaza at 6 pm.
3. **`startTime` is when the event starts, not when the tree is lit or the
   parade steps off.** Erie's parade runs at 6:30 pm. The trees are lit at
   5:30 pm in Estes Park, 5:30 pm in Johnstown, 7:30 pm in Loveland and
   4:15 pm in Windsor. Change the field before approving if the row should
   show the lighting or the parade instead.
4. **Organizer names:**
   - **Berthoud:** the parade's site names no organization, so the record
     says "Berthoud Parade of Lights".
   - **Johnstown:** the DDA's page says Downtown Development *Authority*,
     but its vendor waiver says *Association*.
5. **Combined events, written once.**
   - **Berthoud:** the tree lighting is part of the Parade of Lights.
   - **Frederick:** the Festival of Lights includes a lighted parade. It is
     filed as a tree lighting because the Town leads with the tree.
6. **Estes Park 2025:** the Town's 2025 release gives the parade as
   "Friday, Nov. 28". Its parking section later mentions Nov. 29. The
   record uses Nov. 28, the date in the release's headline and opening
   paragraph.

## Towns with no record, and why

| Town | Parade of lights | Tree lighting |
|---|---|---|
| Berthoud | Has a record | Part of the parade, not separate |
| Castle Rock | None found | Only the Outlets' event. The Town's site refuses automated reads, so a Town tree lighting is not ruled out. The Starlighting lights a star, not a tree |
| Elizabeth | None found | Has a record |
| Erie | Has a record | None on the Town or Chamber pages |
| Fort Collins | No community parade with an organizer page. CSU Marching Band's "Parade of Lights Preview" (Fri Dec 4, 5:30 pm, on CSU's page) was left out as a preview of Denver's parade; `_notes-a.md` has the record ready if wanted | Has records |
| Golden | None: the Olde Golden Holiday Parade is at 10:30 am | None: the Candlelight Walk switches on the downtown lights and is not described as a tree lighting |
| Johnstown | None on the Town calendar | Has a record |
| Lafayette | None | No record: the Chamber's 2026 Holiday on the Plaza page (Dec 5, 2–6 pm) doesn't mention a tree lighting. Only a news roundup did, for 2025 |
| Leadville | No record: the parade is real, but its organizer, Leadville Main Street, has no page about it that could be read. Only the tourism office lists it | None found |
| Longmont | Has a record | Has records |
| Loveland | None: "Floats on Fourth" is parked floats | Has a record |
| Lyons | Has a record | Has a record |
| Nederland | None found | None: the Town's 2022 lighting release is gone and the chamber's domain redirects elsewhere |
| Niwot | None: the holiday parade is at 11 am | Has a record |
| Timnath | None found | No record: the Old Town Holiday Tree Lighting has no 2026 date and no named organizer on any page found |
| Windsor | None: the Wonderland parade is never called lighted | Has a record. The Town's Cone Tree Lighting (Public Works, first held Dec 9, 2025) could not be checked because windsorco.gov refuses automated reads |

Facebook could not be read from here, so organizer posts there were not
checked. That matters most for Leadville Main Street and the Lafayette
Chamber.
