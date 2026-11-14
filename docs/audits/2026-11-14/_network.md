# Inside the Towns — site review, 14 November 2026

> **Applied the same day, on branch `claude/new-session-2wnget`.** The owner shared the review; the code-side fixes went in, and what is the owner's to decide or do is listed at the end of this note.
>
> - Priority 2: a game whose day has passed with no score is "result to come"; `seasonComplete` has the week's guard; MaxPreps is read Thursday and Friday in November.
> - Priority 3, in part: the empty states no longer speak in process words, and three Erie status notes lose their raw "(read 2026-11-01)". The house wording of the "Checked … · Source" lines is left for the owner.
> - Priorities 4 and 5: the guide footer links All events, Every year and Athletics wherever the menu leaves them out; `/traditions/` links each tradition to the guide's own event page and lists every other annual page under "More every year"; hub search keeps annual event pages between runnings.
> - Priority 6: Quick answers is tucked only right under What's happening.
> - Priority 8, the code parts: the fifteen Coal Ridge dress-up days are retired and auto-review holds dress-up days and school-day entries; Find your next stop is plain links unless all three tiles have a photograph (this replaces the colour tile of 10 November); the signup names an issue older than a week by its date.
> - Priority 9: closed-guide redirects carry `?from=` and the hub page says the guide closed and names the nearest full guide within 60 km; the hub's `/erie/`, `/berthoud/`, `/niwot/`, `/frederick/` and the rest go to the guides.
> - Priority 11: the phone menu makes the page inert, closes on a tap outside, and Escape in Other towns closes only that; the root size is 106.25%.
> - Priority 12, in part: Report a correction in every guide's footer, to the form.
> - From the area lists: signup errors are announced and the email field gets `aria-invalid`; the article hero and eat-drink's lead photograph load eagerly; photographs inside the next-stop links have empty alt; Niwot's Rotary card says "Organizer's page", not "Register"; `/articles/` on a guide goes to `/guides/`; the network bar's hub link is white.
>
> **Not changed, the owner's to decide or do:** attaching the six domains in Vercel (priority 1); the hub home's own design against the inner pages (priority 7, the redesign of 13 November); the wording of the check lines network-wide (priority 3); Carbon Valley's name, per-town pages, places and photographs (priority 8); naming a person, one email address and one newsletter name on the trust pages (priority 12); the house date format (priority 10); the weekend tab's order, which puts the weekend's outings before its programs by the owner's rule (`test/home-tabs.test.ts`), so a Sunday festival sits above a Saturday storytime.
>
> Checked: `npm test` 957 pass, `npm run validate` 0 errors, `astro check` 0 errors; Erie, Niwot and the hub built with the site check passing.



Six reviewers each took one area: design, writing, findability, information quality, accessibility and speed, and how the hub and guides fit together. They looked at the live sites and the code. Nothing was changed.

**8** live sites (hub + 7 guides) **6** reviews **12** top priorities **6** owned domains down **31** pages linked from nowhere

Live guides: Berthoud, Erie, Johnstown, Windsor + Severance, Carbon Valley, Lyons, Niwot. Golden, Estes Park, Elizabeth and 15 other domains now redirect to town pages on the hub.


## Top priorities

Ordered by how much they affect readers. Most were found by two or more reviewers. "Spot-checked" means the claim was confirmed again after the reviews came back.


1. HighHub & network✓ Spot-checked

   Six domains you own are down

   insidesalida, insidesteamboatsprings, insidebuenavista, insidegrandjunction, insidefortmorgan and insidemead (.com) don't resolve at all. The redirect rules are already in `vercel.json`, but the domains aren't attached to the hub project. Mead's hub page (`/mead/`) is already live.

   **Fix:** attach the six domains in Vercel, as `DEPLOY.md` describes.
2. HighInformation✓ Spot-checked

   Volleyball pages say "season over" for teams playing at state

   Berthoud, Niwot, Lyons and Windsor `/sports/volleyball/` read "season over · final record 19–6", then list the Nov 12 state game further down the same page. The page's own test skips the 7-day guard that `seasonOver()` in `src/lib/school-sports.ts` already has. Scores were last read Nov 11.

   **Fix:** use the existing guard, show "result to come" for a past game with no score, and add Thursday and Friday reads during state tournaments.
3. HighWritingDesign

   Checking notes show on every page

   "Checked … against …", "Source: … read …" and raw dates like "(read 2026-11-11)" appear about 1,300 times in the pages sampled. The Estes Park hub page has 77 in 2,900 words. Empty sections use the same process wording: "Nothing verified on the calendar…", "the first read has not run". This is the audit trail, not what readers came for, and it breaks the editor skill's own rule.

   Sources: `src/lib/checked.ts:36`, `town/events/[slug].astro:410`, `places/[slug].astro:409`, `ThisWeek.astro:211`, `sports.astro:266`.

   **Fix:** one plain line per page or card, such as "Updated Nov 13 · Confirm with City Star Brewing before you go". Gather sources into one Sources note. Rewrite empty states to invite a submission.
4. HighFindability

   The biggest annual events can't be reached by browsing

   31 built pages are linked from nowhere. Erie has 13, including the Balloon Festival, Town Fair, Brewfest and Erie Fest. Berthoud has 9, including Berthoud Day, Oktoberfest and the Berthoud Market. Lyons's `/sports/` and its team pages have no link at all. `/traditions/` lists only some annual events and links to the chamber and hub, never to the guide's own event page. Hub search misses "balloon festival".

   **Fix:** make `/traditions/` the full annual index and link each title to its event page (`traditions.astro`, `TraditionRow.astro`). Show annual events on venue pages. Put "Every year" and "Athletics" in the footer. Index annual records in `src/lib/network-search.ts`.
5. HighFindability

   The full events calendar isn't in the menu or the footer

   On all six guides that list events, `/events/`, the only page with date, category and free filters, can be reached only from the home page. Families took its menu slot, and the footer has "This weekend" but not "Events", although the comment in `src/lib/nav.ts` says it's there. Four pages overlap: the home tabs, `/this-week/`, `/this-weekend/` and `/events/`.

   **Fix:** add Events to the footer, or make "This week" open the calendar. Longer term, merge the event views into one page with when-tabs.
6. HighDesignHub & network

   A home-page section overlaps the one above it on all 7 guides

   The quick-links band uses a negative top margin that assumed it sat under the white events section. It now follows a paper-coloured band, so the two overlap at desktop width. On Niwot it cuts off the email signup text by 34px on desktop and 17px on a phone.

   Source: `src/components/home/QuickAnswers.astro:36` (`-mt-8 md:-mt-14`).

   **Fix:** drop the negative margin, or apply it only when the section above is the white events band.
7. HighDesignHub & network

   The hub's home page looks like a different site from the rest of the hub

   The home page uses Newsreader and Inter, a pine-green wordmark, a 65px header, no search icon and a short footer. Every other hub page uses Fraunces and Instrument Sans, a slate-blue wordmark, a 99px header and the full footer, with a different nav order. The first click feels like leaving the site. The home page also downloads 146KB of font only for its wordmark.

   Source: `src/routes/hub/index.astro` and `src/styles/hub-home.css`, against `Header.astro` and `Footer.astro`.

   **Fix:** one set of fonts, colour, header and footer on every hub page.
8. HighAll six reviews✓ Spot-checked

   Carbon Valley is the weakest guide
   - The name doesn't match: logo "Inside Carbon Valley", domain carbonvalleyguide.com, home title "Frederick, Firestone & Dacono", and the newsletter goes out as "Inside Frederick".
   - No pages or filters for Frederick, Firestone or Dacono. insidefrederickco.com and insidefirestone.com land on the home page.
   - Only 3 restaurants, 2 coffee shops and 1 bar. No Dacono places at all. All 4 articles are about Frederick.
   - The "Find your next stop" tiles have no photos and show as flat navy blocks (`home/NextStop.astro:85`).
   - About 14 school dress-up days ("Ugly Sweater Day", "Grinch Day") are listed as public events, and organizer typos go straight into titles.
   - "Read last Thursday's issue" links to the Oct 29 issue.

   **Fix:** pick one name, add per-town pages like Windsor's, block school-calendar patterns in auto-approval, and add places and photos.
9. HighHub & networkFindability✓ Spot-checked

   Readers of closed guides are redirected with no explanation

   The 18 closed guides send readers to hub town pages, which list annual dates only, with a different masthead and no note. insidegolden.com/places/old-capitol-grill/ lands on a page with no places. Typing insidethetowns.com/erie/, /berthoud/, /niwot/ or /frederick/ gives "page not found", even though /golden/ works. About 500 places, 1,100 events and 86 corrections were removed with the closed guides.

   **Fix:** add a `?from=` parameter to the redirects and show a one-line banner pointing to the nearest full guide. Redirect hub paths for live guides to those guides. Keep an archive of the removed corrections.
10. MediumWritingDesign

    Dates and times are written many ways, and relative words go stale

    On one page: "3 pm – 10 pm" and "3 pm to 10 pm"; "15 May 2027" beside "January 25". Elsewhere: "p.m.", "3PM-6PM", "11:45 AM", "1:00 pm … $35.00", and times with no am/pm ("Tuesdays at 6", "weekdays 8–5"). Words fixed at build time go stale: Berthoud's deadline card said "tomorrow" on the due date, and "Register by Fri, Nov 13" still showed on Saturday. The sites last rebuilt at 9:40 pm Friday, so Friday's events were still in Saturday's picks.

    **Fix:** one house format ("Sat, Nov 14 · 10 am–noon"), normalize the free-text fields (`recurring`, `cost`, `typicalWindow`) with a CI check, and work out relative words in the browser.
11. MediumAccessibility

    The phone menu doesn't hold keyboard focus, and the header breaks with larger text

    Below 1280px, which includes desktops zoomed to 110% or more, Tab moves past the last menu item into the dimmed page while the menu stays open. Tapping outside doesn't close it, and Escape in "Other towns" closes the whole menu (WCAG 2.4.3, 2.4.11). With larger or spaced text the header buttons are pushed off-screen, and `html { font-size: 17px }` ignores the reader's own font-size setting (1.4.12).

    **Fix:** set `inert` on main and footer while the menu is open; close on an outside tap. Use `font-size: 106.25%` and switch to the menu when the row actually overflows.
12. MediumInformationHub & network

    The trust pages don't match how the sites work
    - About and editorial pages describe an editor checking every listing, but most checks are automated (the files' `verifiedBy` lines say "auto-review … weekly ingest").
    - No person is named and there is no postal address. Every guide's About page shows an empty "The people behind…" section.
    - The corrections log says it lists changes readers reported, but the entries are self-found fixes. It is linked only from the editorial page.
    - Each contact page shows two different email addresses, and the newsletter goes by six different names.

    **Fix:** describe the process as it is, name a person, add "Report a correction" to the guide footer, use one email address and one newsletter name.


## By area

Everything else each reviewer found, beyond the top priorities above.

### Design and layout 65 pages at phone, tablet and desktop widths

- High

  Pages without photos look unfinished: every directory and event page, most articles, eat-drink on Berthoud and Carbon Valley. A tile with no photo should fall back to the text links used on phones.
- Medium

  Lines run 150–165 characters in "Worth knowing", Updates and place excerpts (`WorthKnowing.astro:38`, `TownHome.astro:251`, `places/[slug].astro:432`). Cap at about 65 characters.
- Medium

  Headings at 24–32px are set so tight the letters touch ("The guides", "Our picks this week"). Use the text cut below 2rem, as `.prose h2` already does.
- Medium

  Components drift: three "Our pick" badge styles, three button shapes, "Jump to" chips 36px tall (under the 44px tap minimum), and about 30 one-off text sizes.
- Medium

  Lists repeat themselves: Berthoud things-to-do shows the same places three or four times; six of Niwot's ten restaurants are "Our pick".
- Medium

  Hero photos vary: Carbon Valley's shading is a grey smudge on a pale sky, Lyons is soft at desktop, Berthoud's eat-drink tile reuses the hero.
- Medium

  Very long phone pages: Erie `/events/` is about 28 screens; the footer is about 1.3 screens; every event and place page carries 12 lines of privacy text under the signup.
- Low

  Near-identical town colours (Berthoud and Windsor; Carbon Valley and Lyons). Cramped desktop nav at 1280–1440px. Directory headings are underlined like links. The hub home's phone menu has no dimmed backdrop.

### Writing and readability about 90 pages read

- Medium

  Long sentences. Updates average 26.6 words per sentence (34% over 30), programs 28. Moving-here reads at grade 12–14 and Berthoud families at about 17. Articles are close to the grade 9 target.
- Medium

  Terms with no explanation: statutory and home-rule town, mill levies, metropolitan districts, "SCFD Free Day", a Clear Creek flow reading in cubic feet a second with no sense of high or low.
- Medium

  Vague or contradictory labels: "The one to know", "Things to know" (holds dates), "Also on:". The editor's pick has four names. Niwot's Rotary card shows "No registration" next to a "Register" button (`ProgramRow.astro:164/184`).
- Low

  Guide counts disagree: "six" in the hub description, "Seven" in its heading, "all 6" on this-weekend.
- Low

  British spellings ("at weekends", "metre", "licence", "cancelled" beside "canceled"), and the same street written "141 Fifth St" and "214 5th St".
- Low

  Search with no results says only "Nothing found" with no suggestion. Photo credits are 8px.

### Findability tasks tried at phone width; all 7 guides crawled

- Medium

  Searching "farmers market" finds nothing; Berthoud's page is called "The Berthoud Market". Add search keywords and a better no-results block.
- Medium

  "Guides" means articles in the menu but the whole site everywhere else, and `/articles/` is a 404 on guides although every article lives under it.
- Medium

  Living here (menu) and Moving here (footer) cover the same ground with no links between them.
- Medium

  The corrections form is reachable only from event and place pages; from the home page a reader gets a mailto link.
- Medium

  Things to do has no events, and its link to the calendar sits 10,000+ pixels down on a phone.
- Low

  Laptops at 1024–1279px get the phone menu. No visible breadcrumbs. Families pages link no parks, playgrounds or library. "Open now" shows for trails, which have no hours. Niwot has no lasting newsletter link.

### Information quality new unless marked as already in the Nov 10 audit

- Medium

  Rocky Mountain National Park dates are a year stale: Trail Ridge closing shows "most recent Nov 14, 2025" in mid-November on Estes Park, Lyons, Berthoud and Grand Lake. Glacier Basin shows raw text "TBD: Check back in mid-November."
- Medium

  Nederland's "Next" event is Frozen Dead Guy Days, which is held in Estes Park. Fifteen hub town pages have no upcoming date at all.
- Medium

  Niwot's "Every year" page leaves out the Holiday Parade on Nov 28, and its holiday article has five stray "The listing." sentences.
- Medium

  21 places and 5 events are past the 30-day re-check. Lyons's Oskar Blues, Solace, Uniquely Lyons and Gatherings (already in audit) lose their hours around Nov 16. Johnstown's Dominic's and Scheels are new.
- Low

  Missing hours: Berthoud 10 places, Windsor 6, Carbon Valley's Pepper's Fireside has no hours or phone. "Cost: Not stated" shows to readers, even on volunteering.
- Low

  Farmers markets are missing from 6 of 7 guides, with no "returns in June" note. Windsor has no place maps.

### Accessibility and speed axe-core on 40 pages at two widths

- Medium

  Form errors aren't announced: the newsletter "Pick at least one town" message unhides silently, and the email field never gets `aria-invalid`. On submit-event and correct, help text sits inside labels, so a field's name is about 300 characters. Required fields aren't marked. Carbon Valley's forms are a mailto only.
- Medium

  Card links are announced starting with the photo's alt text (about 230 characters on Berthoud's "Next stop" tile). Use empty alt on images inside links (`NextStop.astro`, `WhatsHappening.astro`).
- Medium

  The largest image is lazy-loaded on articles and eat-drink: Niwot `/eat-drink/` takes 2.15s to show it on a slow connection, against about 1.2s elsewhere.
- Low

  Text over photos: credits at 1.1–4.0:1 contrast; the footer "Inside the Towns" link is 3.25:1 on Niwot (`NetworkBar.astro:60`). Small stacked links in the hub playoffs article (22px, no gap). Repeated link text such as "CHSAA game page" ×14.

### Hub and network every domain checked; 1,640 sitemap URLs crawled

- Medium

  Share images: 85–95% of each guide's pages, every event included, use the guide's single hero photo. The hub already makes per-town share cards (`town-share.png.ts`); extend it to events and season pages.
- Medium

  Guide homes are uneven: the "Don't miss" card shows on 3 of 7, leaving an empty column elsewhere; weekend lists are out of date order on Erie and Lyons; Windsor has no athletics bar and drops Severance after the heading.
- Medium

  `/newsletter/` says "6 editions" but the editions list is empty; the sentence is hard-coded at `src/routes/hub/newsletter.astro:49`.
- Low

  Page title endings vary ("| Inside X", "·", or nothing; "CO" and "Colorado"). The advertise page reads as machine-written and gives no rate.

## Domains at a glance

First-impression grade: is it clear within five seconds what the site is, which town, who runs it, and what to do next?

| Domain | Status | Grade | Note |
| --- | --- | --- | --- |
| insideberthoud.com | Live | A− | Clear in five seconds. |
| insideerie.com | Live | A− | Weekend list puts Sunday before Saturday. |
| insidethetowns.com | Live (hub) | B+ | Publisher only in the footer; home looks unlike the inner pages. |
| insidelyons.com | Live | B+ | Empty right column on desktop; weekend out of order. |
| insideniwot.com | Live | B+ | Email signup text cut off. |
| insideseverance.com | Redirect to Windsor's Severance page | B+ |  |
| insidejohnstown.com | Live | B | One event this weekend; a tile with no photo. |
| insidewindsorco.com | Live | B | Says "Windsor and Severance" once, then only Windsor. |
| 18 closed guides (Golden, Estes Park, Elizabeth, Lafayette, Leadville, Longmont, Loveland, Nederland and others) | Redirect to hub town pages | B− | Good pages, but no word that the guide closed. |
| carbonvalleyguide.com | Live | C+ | Unfamiliar place name; photo-less tiles; mismatched domain. |
| insidefrederickco.com, insidefirestone.com | Redirect to Carbon Valley home | C | No Frederick or Firestone page to land on. |
| insidesalida, insidesteamboatsprings, insidebuenavista, insidegrandjunction, insidefortmorgan, insidemead (.com) | Down (no DNS) | F | Redirect rules exist; domains not attached. |

## Visitor tasks

Tried on a phone, counting taps from the home page.

| Task | Where | Path | Result |
| --- | --- | --- | --- |
| What's on this weekend | Berthoud, Erie | Home "This weekend" tab, 1 tap | Easy |
| Restaurant open now | Carbon Valley | Menu › Eat & drink › Open now, 3 taps | Easy |
| Submit an event | All guides | "Add an event", 1 tap | Easy |
| Something for kids | All guides | Menu › Families, 2 taps | Easy |
| Tree lighting date | Berthoud, Erie | Search finds it first; browsing takes 7–8 screens | Easy by search |
| Coffee shop | Berthoud, Niwot, Carbon Valley | Menu › Eat & drink › Coffee filter, far down the page | OK |
| Park or trail | Erie | Things to do › Trails; "Open now" gives 0 results | OK, dead end |
| Report a mistake | All guides | 1 tap from a listing; from home only a mailto link | Hard from home |
| Neighbouring town without a guide | Berthoud → Loveland | Hub › A–Z, 4+ taps | Hard |
| Off-season big event (Balloon Festival, Berthoud Day) | Erie, Berthoud | No link anywhere; search only | Failed |
| Farmers market | Berthoud, Erie | Search finds nothing | Failed |
| High-school football score | Lyons | No link to `/sports/` | Failed |
| Hub to a live guide by URL | insidethetowns.com/erie/ | Page not found | Failed |
| Restaurant in Golden | insidegolden.com | Lands on a dates-only hub page | Failed |

## Coverage by guide

Places with hours counts only places with a door (not trails or parks).

| Guide | Places | With hours | Upcoming events | Articles / updates | Verdict |
| --- | --- | --- | --- | --- | --- |
| Berthoud | 56 | 31 of 41 | 70 | 8 / 8 | Rich |
| Erie | 50 | 19 of 21 | 88 | 8 / 9 | Rich |
| Windsor + Severance | 53 | 18 of 24 | 63 | 9 / 4 | OK (19 events from school calendars) |
| Lyons | 39 | 20 of 20 | 64 | 6 / 6 | OK, 8 places overdue for a check |
| Johnstown | 35 | 19 of 20 | 50 | 5 / 5 | OK to thin; nothing in town this weekend |
| Niwot | 42 | 25 of 30 | 0 shown | 8 / 9 | OK as an updates guide (62 events on file, hidden by design) |
| Carbon Valley | 31 | 10 of 16 | 69 | 4 / 8 | Thin (42 events from school calendars) |

The hub has 95 town pages and 615 annual-event and outdoor-date records, all checked within the last 7 days.

## Speed

Phone width, empty cache. "Slow" is simulated slow 4G with a 4× slower processor. Every page measured was 140–442KB in 13–24 requests, and layout shift was 0.03 or less.

| Page | Size | Requests | Main image shown (fast / slow) |
| --- | --- | --- | --- |
| Hub home | 405 KB | 20 | 0.61 / 1.32 s |
| Hub this-weekend | 172 KB | 20 | 0.71 / 1.01 s |
| Estes Park (hub town page) | 220 KB | 17 | 0.70 / 1.77 s |
| Niwot home | 190 KB | 20 | 0.74 / 1.20 s |
| Niwot eat-drink | 325 KB | 24 | 0.72 / **2.15 s** |
| Berthoud home | 221 KB | 24 | 0.44 / 1.42 s |
| Berthoud article | 313 KB | 21 | 0.83 / 1.56 s |
| Erie events | 170 KB | 22 | 0.45 / 0.97 s |
| Erie article | 442 KB | 24 | 0.58 / 0.87 s |
| Carbon Valley place page | 156 KB | 20 | 0.72 / 0.88 s |

## What works well

- Search ranks results well ("coffee", "tree lighting", "football", "library" all put the right page first), and hub search covers the whole network.
- No dead links found: 65 outbound links, 22 event sources and 315 hub internal links checked. Hub and guide dates match for the 17 events on both.
- Strong accessibility baseline: automated checks were clean on 77 of 80 runs, with a working skip link, visible focus, labelled fields and no sideways scrolling at any width.
- Comfortable body text (17px, 1.6 line spacing), a good article line length, and big event dates that are easy to scan.
- The drawn place maps and Erie's historic-photo article feel genuinely local. Each town's colour comes from its high school.
- "Report a correction" on every listing, helpful 404 pages, every image licensed, and a plain, warm tone with no hype.
- Berthoud's snow article ([When it snows in Berthoud](https://insideberthoud.com/articles/when-it-snows-in-berthoud/)) is a model: answer first, question headings, lists, grade 8 reading level.

Reviewed 14 November 2026 against the live sites, which last rebuilt at about 9:40 pm on Friday 13 November. Line numbers refer to the code on `main` at that time.