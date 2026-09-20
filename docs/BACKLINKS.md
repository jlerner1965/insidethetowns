# Local backlink targets

Every URL below was fetched and confirmed on **20 September 2026**. Two domains
that look like obvious targets are traps and are listed under *Do not link to
these* — read that section before you write to anybody.

This is a target list, not a campaign. Nobody at Inside the Towns has a
relationship with any of these organisations yet, and this document does not
pretend otherwise. It exists so the owner does not have to redo the research.

## Why this matters more for some towns than others

Five of the eight names are ambiguous nationally. There is an Erie in
Pennsylvania, a Johnstown in Pennsylvania and New York, an Elizabeth in New
Jersey, a Lyons in Kansas and New York, a Berthoud that is unambiguous but
small. Titles now carry "Colorado" or "CO" (see `src/lib/titles.ts`), which
tells a search engine what the page is about, but it does not tell it which
place the *site* belongs to. Links from organisations that are unmistakably in
Colorado do that, and nothing else on the page can.

So the order of effort is:

1. **Erie, Johnstown, Elizabeth** — heaviest ambiguity, smallest local link
   footprint. These three gain the most per link.
2. **Lyons, Timnath** — ambiguous or new enough to be worth the effort.
3. **Niwot, Berthoud** — names are effectively unique; links help, but they are
   not solving a disambiguation problem.

Within a town, a link from the library or the town government is worth more
than a link from a business directory, because those domains are old, local and
nobody buys links on them.

## What each site already gives these organisations

The "cited" column counts how many times that organisation's domain already
appears in that town's content. It is the honest opening of any outreach email:
the sites link out to these organisations heavily and unprompted, and have
since before anybody asked for anything back.

Two entries read zero: the Berthoud and Elizabeth chambers. Everywhere else the
citations arrived organically, because those organisations' calendars are among
the sources events are taken from — Erie's 23 are almost all `source:` fields on
imported events and places. So a zero means those two chamber calendars have
never been used as an event source.

**An earlier draft of this document said Elizabeth's chamber was therefore
"worth adding as a source on the merits". That was wrong on both halves, and the
research is recorded here so nobody repeats it.**

### Berthoud's chamber has opted out of AI crawling — do not automate against it

`www.berthoudcolorado.com/robots.txt` names **74 AI and scraper user-agents**,
`ClaudeBot`, `Claude-Web` and `anthropic-ai` among them, and gives every one of
them `Disallow: /`. Everything else gets `Allow: /` with only the member portal
excluded. That is a deliberate, maintained opt-out, not a CMS default.

Automated collection from their calendar is exactly what they have asked not to
happen, so it is not done and should not be. Nothing stops a person reading
their public events page and entering an event by hand, or — better — asking the
chamber directly whether they would like their events carried. That is a
conversation, not a crawler.

### Elizabeth's chamber publishes nothing to import

Checked 20 September 2026:

- `/events` is a placeholder — two headings and "Check back here often", no
  listings of any kind.
- No events plugin. There is no `tribe_events` post type, `/events/?ical=1`
  returns the HTML page rather than an iCal feed, and `wp-sitemap.xml` has no
  events section.
- The named event pages — `/elizabash/`, `/harvest-festival/`,
  `/annual-chamber-events/`, `/banquet/` — are **broken**. Divi shortcodes
  render as literal `[et_pb_section …]` text, and the images date from 2015 to
  2018. `/annual-chamber-events/` contains nothing but the broken shortcode.
- Their event portal, `business.elizabethchamber.org/events/`, returns
  **HTTP 410 Gone** — the server declaring it permanently retired.

The chamber is real and its front page is live, so it stays on the target list
as an outreach contact. As an event source it does not exist.

### And neither calendar is short

Occurrence counts are not runway, and runway is what a reader feels. Measured
20 September 2026:

| Town | Occurrences, next 90 days | Runway |
|---|---|---|
| Erie | 213 | 100 days |
| Lyons | 254 | 98 |
| Berthoud | 186 | 97 |
| Timnath | 77 | 97 |
| Elizabeth | 74 | 93 |
| Johnstown | 67 | **81** |
| Niwot | 54 | 287 |

Elizabeth is mid-pack by runway and has twelve days more than Johnstown, which
is the tightest in the network. `scripts/weekly.ts` warns under 45 days and
nothing is near it. Ranking towns by raw occurrence count — which is what
produced the "second-thinnest" claim — sorts a weekly series with fourteen
evenings above a single festival and says nothing about when a calendar runs
dry.

### Niwot — insideniwot.com

| Organisation | URL | Cited |
|---|---|---|
| Niwot Business Association | https://niwot.com/ | 46 |
| Niwot Cultural Arts Association | https://niwotarts.org/ | 18 |
| Left Hand Grange No. 9 / Niwot Hall | https://niwothall.org/ | 23 |
| Niwot Historical Society | https://niwothistoricalsociety.org/ | 7 |
| Niwot Community Association | https://niwot.org/ | 3 |
| Left Hand Valley Courier | https://www.lhvc.com/ | 6 |

Niwot is unincorporated, so there is no town hall to write to — Boulder County
is the local government and the Business Association is the de facto civic
centre. There is also no Niwot library; the area is served by the Boulder Public
Library District, whose site is Boulder-city facing and a weak local signal.

The Courier is a peer publication, not a directory. Treat it as a colleague:
the useful thing to offer is a correction channel and a calendar they can check,
not a link swap.

### Lyons — insidelyons.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Lyons (government) | https://www.townoflyons.com/ | 10 |
| Town of Lyons (visitor site) | https://www.lyonscolorado.com/ | 52 |
| The Lyons Recorder | https://lyonsrecorder.org/ | 74 |
| Lyons Redstone Museum | https://www.lyonsredstonemuseum.com/ | 6 |
| Lyons Regional Library District | https://lyons.colibraries.org/ | 3 |

The two town domains are one relationship, not two — both are run by the Town.

The Lyons Area Chamber of Commerce has no website of its own that could be
found; it operates through Facebook and appears in the Boulder Chamber's member
directory. `lyons-chamber.com` is **Lyons, Kansas** and is not a target.

### Berthoud — insideberthoud.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Berthoud | https://www.berthoud.org/ | 75 |
| Berthoud Community Library District | https://www.berthoudcommunitylibrary.org/ | 28 |
| Berthoud Main Street | https://berthoudmainstreet.org/ | 22 |
| Berthoud Historical Society | https://www.berthoudhistoricalsociety.org/ | 5 |
| Berthoud Area Chamber of Commerce | https://www.berthoudcolorado.com/ | **0** |

`downtownberthoud.org` serves the same site as `berthoudmainstreet.org` — one
organisation, two domains. Do not write to it twice.

The chamber's site is client-rendered and returns an empty document to anything
that does not run JavaScript, which is why it is easy to miss; its member
directory at `business.berthoudcolorado.com` runs on ChamberMate and confirms
the organisation.

**Their `robots.txt` disallows 74 named AI and scraper user-agents outright,
including this one.** Write to them as a person; do not point anything automated
at their site. See *The two zeroes* above.

### Erie — insideerie.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Erie | https://www.erieco.gov/ | 140 |
| Erie Chamber of Commerce | https://eriechamber.org/ | 23 |
| Erie Historical Society / Wise Homestead | https://www.eriehistoricalsociety.org/ | 3 |
| High Plains Library District (Erie Community Library) | https://www.mylibrary.us/ | 3 |
| Downtown Erie | https://www.downtownerie.biz/ | 2 |

Existing citations mostly point at `members.eriechamber.org`, the membership
portal. `eriechamber.org` is the organisation's front door and is the better
address for outreach.

Erie is the strongest case in the network for this work. It straddles Boulder
and Weld counties, it shares a name with a much larger city in Pennsylvania, and
`content/erie/articles/which-side-of-county-line-road.md` is the kind of page —
genuinely useful, genuinely local, not published anywhere else — that a town or
chamber will link to without being asked twice.

### Johnstown — insidejohnstown.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Johnstown | https://johnstownco.gov/ | 54 |
| Johnstown-Milliken Public Libraries | https://johnstownmillikenpubliclibraries.us/ | 48 |
| Johnstown Historical Society | https://jhsco.org/ | 10 |
| Johnstown Downtown Development Association | https://www.visitdowntownjohnstown.com/ | 4 |

**The Johnstown-Milliken Chamber of Commerce has no usable website.** See below.

Four targets is the thinnest list in the network, against one of the worst name
collisions (Johnstown, Pennsylvania). `content/johnstown/articles/two-counties-two-fire-districts.md`
is the asset to lead with.

### Timnath — insidetimnath.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Timnath | https://timnath.org/ | 33 |
| Downtown Timnath | https://downtowntimnath.com/ | 2 |
| Timnath Chamber of Commerce | https://timnathchamber.com/ | 1 |
| Poudre River Public Library District | https://www.poudrelibraries.org/ | 1 |

`timnath.org` rejects requests that do not send a browser user-agent — it
returns 406 to curl and to most link checkers. It is a live, healthy site. Do
not let a checker talk you into removing those 33 links.

There is no Timnath historical society site. `timnathhistory.org` resolves but
is a parked domain that bounces to a registrar lander.

### Elizabeth — insideelizabeth.com

| Organisation | URL | Cited |
|---|---|---|
| Town of Elizabeth | https://www.townofelizabeth.org/ | 31 |
| Elizabeth Main Street | https://www.elizabethmainstreet.org/ | 26 |
| Pines & Plains Libraries | https://pplibraries.org/ | 14 |
| Elizabeth Park & Recreation District | https://www.elizabethpr.com/ | 12 |
| Historic Elizabeth (Town Historic Advisory Board) | https://www.historicelizabethco.org/ | 2 |
| Elbert County | https://www.elbertcounty-co.gov/ | — |
| Elizabeth Chamber of Commerce | https://www.elizabethchamber.org/ | **0** |

`www.townofelizabeth.org` sits behind a Cloudflare bot challenge and returns 403
to every automated client, including a headless browser. It loads normally for a
person. Same warning as Timnath: a link checker will flag 31 good links.

Elizabeth is the only town in the network in Elbert County, which makes the
county site a cheap disambiguation signal — no other Elizabeth in the United
States is in Elbert County, Colorado.

The chamber is an outreach contact only. Its site publishes no events, its event
pages are broken and its event portal is gone — see *The two zeroes* above
before spending any time looking for a calendar there.

## Do not link to these

- **`johnstownmillikenchamber.com`** — the chamber's old domain. It now serves
  an Indonesian online-gambling site ("EMPIRE88"). Search engines still index
  the chamber's old pages on it, so it looks legitimate in results and returns a
  clean `200`. It is not the chamber. The replacement address that appears in
  directory listings, `jmchamber.com`, does not resolve at all. The chamber can
  still be reached by phone and post through the listings on
  `johnstownco.gov`; there is no site to link to and no site to be linked from.
- **`lyons-chamber.com`** — Lyons, **Kansas**. Its title reads "lyonskschamber".
  General web search conflates it with the Colorado town.

A `200` response is not verification. Both of these return one. Check the title
and the body text of anything before it goes in a page or an email.

## What to actually ask for

Not a link exchange. Ask to be listed where the organisation already maintains a
list — most of them have a "community links", "local resources" or "visitor
information" page, and that is the placement worth having.

What the sites can genuinely offer, all of it checkable by the person reading
the email:

- A maintained events calendar for their town, with a public submission form at
  `/submit-event/`, which will carry their events whether or not they link back.
- Corrections. If a page about their organisation is wrong, they can say so and
  it gets fixed.
- Links out to them that already exist, in volume, as the tables above show.

What the sites cannot offer, and what must never appear in an outreach email:
readership figures, traffic numbers, subscriber counts, or any claim about how
many people will see their listing. None of that is known. A local library
director will ask, and "I don't have those numbers yet, the site launched in
2026" is a survivable answer. An invented one is not.

## Draft email

Adjust per town. Keep it short; these are small organisations and most of them
are run by volunteers.

> Subject: Inside <Town> — a question about your community links page
>
> Hello,
>
> I run Inside <Town> (<https://inside<town>.com>), an independent local guide to
> <Town>: an events calendar, a directory of places to eat and things to do, and
> occasional articles about how the town works.
>
> The site already links to <organisation> in <N> places — your <events page /
> hours / programme> is one of the sources I check when I update the calendar.
> I wanted to introduce myself rather than keep citing you anonymously.
>
> Two things, either of which you are welcome to ignore:
>
> If you keep a community links or local resources page, I would be glad to be
> considered for it. And if anything I have written about <organisation> is
> wrong, please tell me and I will correct it the same day.
>
> The site is new, so I have no audience figures to offer you — what I can offer
> is that your events will be listed accurately whether or not you link back.
> Anyone can submit one at <https://inside<town>.com/submit-event/>.
>
> Thank you,
> <name>
> <email>

The `<N>` is the "Cited" figure from the table. Count it again before sending —
the number will have moved.

## What not to do

- No paid links, sponsored posts bought for SEO, or link-exchange schemes. They
  are against Google's spam policies and the penalty lands on the eight domains
  at once.
- No mass directory submission. The low-quality local directories that accept
  anything are worth nothing and associate the network with sites that are worth
  less than nothing.
- No pitching a link in exchange for coverage, and no implying that a listing
  on Inside <Town> depends on one. Editorial placement is not for sale — see
  `/advertise/`.
- Do not write to all seven towns' organisations from one template in one
  afternoon. These are small communities with overlapping boards; the Johnstown
  and Milliken chamber, the Berthoud chamber and the Larimer County offices all
  know each other.

## Re-verifying this list

Small-town civic sites move, lapse and get squatted — two of the obvious
candidates already had. Before a round of outreach, re-check with a browser
user-agent and read the titles, not just the status codes:

```sh
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
while read -r u; do
  body=$(curl -sSL --max-time 25 -A "$UA" -w '\n@@%{http_code}' "$u")
  printf '%s | %s | %s\n' \
    "$(printf '%s' "$body" | grep -o '@@[0-9]*$' | tr -d '@')" \
    "$u" \
    "$(printf '%s' "$body" | tr '\n' ' ' | grep -oiE '<title[^>]*>[^<]*' | head -1)"
done < targets.txt
```

`www.townofelizabeth.org` will return 403 and `timnath.org` will return 406 to
that loop. Both are healthy. Everything else in this document returned 200 with
the expected title on 20 September 2026.
