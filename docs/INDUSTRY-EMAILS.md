# Trade-body emails, ready to copy and paste

Twelve messages to the business organisations of the seven towns — eight by
email, four into a contact form — asking for the two things the listings are
still missing: **photographs**, and the **facts that are not on file** — hours,
websites, and 2027 event dates.

This is the batch route. The other three photo documents stay as they are:

| Document | Covers |
|---|---|
| `PHOTOS.md` | The method, what has already failed, the shot list, the licence rule |
| `PARK-PHOTO-EMAILS.md` | 10 emails, 41 parks, trails and open spaces |
| `VENUE-PHOTO-EMAILS.md` | 14 emails, 21 venues, one by one |
| **this file** | **12 messages to the organisations that can reach 145 businesses at once** |

Every address below was read out of the organisation's own page on
**21 September 2026** and is recorded in *How these addresses were checked* at
the foot of this document. Three of the seven towns publish no address at all;
those have a contact form and the same text to paste into it.

Send each one from that town's own address — `hello@insideberthoud.com`,
`hello@insidelyons.com` and so on. A request from the site being asked about is
answered far more often than one from a generic address.

> **Before sending: those addresses cannot receive mail yet.** Checked 21
> September 2026 — none of the eight domains has an MX record, and neither SPF
> nor DMARC is set. A sender falls back to the A record, `76.76.21.21`, which is
> Vercel's edge and runs no SMTP, so anything sent to `hello@inside<town>.com`
> bounces after a day or two. That address appears in every message below and in
> the newsletter blurb each organisation is asked to print, so a member who
> follows it gets a bounce from a guide that has just told their chamber it is
> real.
>
> DNS for all eight is on Cloudflare, so Cloudflare Email Routing fixes it free
> in about ten minutes. Until then, put a working reply address in the body in
> place of `hello@inside<town>.com`. The sites' contact forms are unaffected —
> Formspree delivers independently of these domains' DNS — so `/contact/` is a
> usable fallback to point people at.

---

## The gaps these emails are for

Counted from the content on 21 September 2026. "Businesses" means restaurants,
cafes, bars, shops and lodgings; parks, trails and venues are the other two
documents' work.

| Town | Listings | Businesses | No photograph | No hours | No website | Reachable only on foot |
|---|---|---|---|---|---|---|
| Berthoud | 50 | 33 | **33** | 14 | 30 | 29 |
| Niwot | 39 | 30 | **28** | 5 | 0 | 0 |
| Lyons | 39 | 25 | **24** | 1 | 1 | 1 |
| Elizabeth | 28 | 17 | **16** | 4 | 16 | 13 |
| Erie | 35 | 16 | **15** | 2 | 1 | 1 |
| Johnstown | 29 | 14 | **13** | 2 | 2 | 2 |
| Timnath | 20 | 10 | **10** | 0 | 3 | 2 |
| **Total** | **240** | **145** | **139** | **28** | **53** | **48** |

**48 of the 145 have neither a website nor a phone number on file.** For those
the Main Street walk in `PHOTOS.md` §1 is not the fast option, it is the only
one. Berthoud and Elizabeth hold 42 of the 48 between them, which is why those
two towns' emails lean hardest on the introduction.

### And every calendar but one stops at New Year

| Town | Last event on file | Days of runway |
|---|---|---|
| Niwot | 4 July 2027 | 286 |
| Berthoud | 31 December 2026 | 101 |
| Lyons | 31 December 2026 | 101 |
| Timnath | 30 December 2026 | 100 |
| Erie | 29 December 2026 | 99 |
| Elizabeth | 22 December 2026 | 92 |
| Johnstown | 17 December 2026 | 87 |

Nothing is near the 45-day warning in `scripts/weekly.ts`, so this is not
urgent. But six of the seven calendars end on the same fortnight, and the
organisations below are the people who already know the 2027 dates. Asking
costs a sentence, so every email asks.

---

# The twelve messages

## 1. Town of Berthoud — Economic Sustainability

**To:** `BDubois@Berthoud.org`
**Cc:** `SHorvath@Berthoud.org`
**Subject:** `Inside Berthoud lists 33 downtown businesses with no photograph — may we ask through you?`

Brian Dubois is Economic Sustainability Manager; Stephanie Horvath is Community
Engagement Manager and runs the Town's channels. Phone (970) 344-5406.

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free, independent guide to
> the town. It carries 50 Berthoud listings, 33 of them businesses, with
> addresses and hours. Nobody pays to be listed, there is no advertising, and no
> listing can be bought or removed by payment. The site links out to berthoud.org
> 75 times, all of it unprompted and all of it before I wrote to you.
>
> Two things would make those listings better, and both are quicker through the
> Town than through 33 separate emails:
>
> 1. **Photographs.** All 33 business listings have none. If a business would
>    like one of theirs used, send it to hello@insideberthoud.com — we credit it
>    to them and take it down the day they ask.
> 2. **Hours and websites.** 14 of the 33 have no opening hours on file and 30
>    have no website. 29 have no contact detail of any kind, so they can only be
>    reached by walking in.
>
> Would you be willing to put a line in a Town newsletter or a business
> round-up? Something like:
>
>> Inside Berthoud lists local businesses free of charge and is looking for
>> photographs and current hours. Send yours to hello@insideberthoud.com —
>> they will credit the photograph to you and remove it whenever you ask.
>
> One more, if it is easy: our Berthoud events calendar runs out on 31 December.
> If the Town has 2027 dates for the recurring events, I would carry them.
>
> I am also walking Mountain Avenue and Massachusetts Avenue with a camera and
> will photograph storefronts from the pavement, which needs nobody's permission.
> If a business would rather we did not, tell me and we will leave them out.
>
> Thank you,
> <name>

## 2. Berthoud Main Street — contact form

**Form:** https://berthoudmainstreet.org/contact/
**Subject field:** `Photographs and hours for the 33 Berthoud business listings`

Berthoud Main Street is a 501(c)(3) and runs the downtown programme; the Town's
own downtown listings cite it 22 times. **It publishes no email address** — all
46 pages of its site were checked and the contact form is the only route. Paste
the body below into the form.

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free local guide. It lists
> 33 Berthoud businesses with their addresses and hours, and cites your Dine &
> Drink and Shop & Antiques pages as the source on many of them. Nobody pays to
> be listed and we do not sell advertising.
>
> None of those 33 listings has a photograph, 30 have no website on file and 14
> have no hours. Rather than send 33 cold emails, I would rather ask once
> through you.
>
> Would Main Street put a line in a newsletter or a members' post? Something
> like:
>
>> Inside Berthoud lists local businesses free and is looking for photographs
>> and current hours. Send yours to hello@insideberthoud.com — they will credit
>> you and take it down whenever you ask. They are also happy to come and
>> photograph your storefront.
>
> Two other things only Main Street would know: do you hold photographs of
> murals that have since rotated out of the public art walk, and is there a
> current list of which sculptures are installed now? Either would improve that
> listing more than a photograph of my own.
>
> I am photographing storefronts from the pavement on the next fine day, which
> needs nobody's permission. If a member would rather we did not, tell me and we
> will leave them out.
>
> Thank you,
> <name>

**On the Berthoud Area Chamber.** They can be written to like anyone else, and
this is an ordinary thing to ask a chamber. But their `robots.txt` disallows 74
named AI and scraper user-agents, so **no automated client should be pointed at
their site** — including to look up their address. Open
`berthoudcolorado.com` in a browser, as a person, and take the address from
there. See `BACKLINKS.md`. Berthoud Main Street is the better route for downtown
businesses in any case, because the downtown programme is theirs.

## 3. Niwot Business Association — contact form

**Form:** https://niwot.com/contact/
**Post:** Niwot Business Association, PO Box 92, Niwot, CO 80544
**Subject field:** `Photographs for the 30 Niwot business listings`

**The NBA publishes no email address** — 61 pages of niwot.com were checked and
the two addresses on the site belong to a pizzeria and a tree-carving project.
The form is the route. Niwot is unincorporated, so the NBA is the de facto civic
centre as well as the business body; the site cites niwot.com 46 times.

> Hello,
>
> I publish Inside Niwot (insideniwot.com), a free, independent guide. It lists
> 30 Niwot businesses with addresses, hours and links, and cites niwot.com 46
> times as the source. Nobody pays to be listed, there is no advertising, and no
> listing can be bought or removed by payment.
>
> 28 of those 30 listings have no photograph. Every one of them has a website on
> file, so this is the one town in the network where nothing is missing except
> the picture — which makes it the easiest to fix.
>
> Would the Association put a line in the e-newsletter? Something like:
>
>> Inside Niwot lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insideniwot.com — they will credit it
>> to you and remove it whenever you ask, and they are happy to come and
>> photograph your storefront instead.
>
> Five listings also have no opening hours: if the Association keeps a current
> list, I would take it gratefully.
>
> I am walking Second Avenue and Niwot Road with a camera and will photograph
> storefronts from the pavement, which needs nobody's permission. If a member
> would rather we did not, tell me and we will leave them out.
>
> Thank you,
> <name>

## 4. Left Hand Valley Courier — contact form

**Form:** https://www.lhvc.com/contact — choose **Submit press release**
**Phone:** (303) 845-3077 · PO Box 652, Niwot, CO 80544
**Subject field:** `Press release: free local guide seeking photographs of Niwot businesses`

The Courier is a peer publication, not a directory. Treat it as a colleague —
what is on offer is a correction channel and a calendar they can check, not a
link swap. Send this only after the NBA has been asked, so the two do not
collide.

> Hello,
>
> I publish Inside Niwot (insideniwot.com), a free, independent local guide —
> 39 Niwot listings, an events calendar, no advertising and nothing paid for.
>
> 28 of our 30 business listings have no photograph, and I am asking businesses
> to send one or to let me photograph the storefront. If that is worth a line to
> your readers, the address is hello@insideniwot.com; we credit every photograph
> and remove it on request.
>
> Two things I would rather offer than ask for. First, if you ever find
> something wrong on our pages — a date, an address, a closure we have missed —
> write to that address and I will fix it the same day and say so. Second, our
> Niwot calendar runs to July 2027 and is free to check against; if it ever
> saves you a phone call, use it.
>
> Thank you,
> <name>

## 5. Town of Lyons — Community Programs and Relations

**To:** `kmitchell@townoflyons.com`
**Cc:** `kbruckner@townoflyons.com`
**Subject:** `Inside Lyons has no photograph on 24 business listings — a line in a newsletter?`

Kim Mitchell is Director of Community Programs and Relations, 303-823-6622
ext. 35; Kristen Bruckner covers Arts and Cultural Services, ext. 66. The Town
runs both `townoflyons.com` and the visitor site `lyonscolorado.com`, which the
site cites 52 times. **The Lyons Area Chamber has no website** — it operates
through Facebook — so the Town is the only emailable body in town.

> Hello,
>
> I publish Inside Lyons (insidelyons.com), a free, independent guide to the
> town: 39 listings, an events calendar, no advertising, nothing paid for. The
> site cites lyonscolorado.com 52 times and townoflyons.com ten times, all of it
> unprompted.
>
> 24 of our 25 business listings have no photograph. The contact data is in good
> order — only one is missing hours and only one a website — so a photograph is
> genuinely the only thing missing.
>
> Would the Town put a line in a newsletter or on the visitor site's channels?
> Something like:
>
>> Inside Lyons lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insidelyons.com — they will credit it
>> to you and take it down whenever you ask. They are also happy to come and
>> photograph your storefront.
>
> Our Lyons calendar is full to 31 December and then stops. If the Town has 2027
> dates — the summer concerts, the festivals, anything already booked — I would
> carry them, with a link back to your page on each.
>
> I am photographing Main Street storefronts from the pavement, which needs
> nobody's permission. If a business would rather we did not, tell me and we
> will leave them out.
>
> Thank you,
> <name>

## 6. The Lyons Recorder

**To:** `LyonsRecorder.Editor@gmail.com`
**Post:** Lyons Recorder, PO Box 512, Lyons, CO 80540
**Subject:** `A free local guide, and an offer rather than an ask`

The Recorder is cited 74 times across the Lyons content — more than any other
source. Lead with that, and lead with the offer.

> Hello,
>
> I publish Inside Lyons (insidelyons.com), a free, independent guide with no
> advertising. Your reporting is the single most cited source on the site — 74
> links, all of them ours to you and none of them asked for.
>
> Two offers before any ask. If you find anything wrong on our pages, write to
> hello@insidelyons.com and I will correct it the same day. And our events
> calendar is free to check against if it ever saves you a call.
>
> The ask, such as it is: 24 of our 25 Lyons business listings have no
> photograph. If that is worth a line to your readers, businesses can send one
> to the same address — credited to them, removed whenever they say.
>
> Thank you,
> <name>

## 7. Elizabeth Main Street Program — contact form

**Form:** https://www.elizabethmainstreet.org/contact/
**Phone:** 303-646-4166 · 151 S Banner Street, Elizabeth, CO 80107
**Subject field:** `Photographs and hours for 16 Elizabeth business listings`

**No email address is published** — the contact page runs a Locable form widget
and nothing else. The phone is the faster route if the form goes unanswered. The
site cites elizabethmainstreet.org 26 times. Board: Carrie Wedel (President),
Brandon Jeffress (Vice President).

> Hello,
>
> I publish Inside Elizabeth (insideelizabeth.com), a free, independent guide to
> the town: 28 listings, an events calendar, no advertising, and no listing that
> can be bought or removed by payment. The site cites your pages 26 times as the
> source.
>
> Elizabeth has the thinnest contact data of the seven towns I publish. Of 17
> business listings, 16 have no photograph, 16 have no website on file, four have
> no hours, and **13 have neither a website nor a phone number** — so they can
> only be reached by walking in.
>
> Two things would fix most of that in one go:
>
> 1. Would Main Street put a line in a newsletter or a members' post? Something
>    like:
>
>> Inside Elizabeth lists local businesses free of charge and is looking for
>> photographs and current hours. Send yours to hello@insideelizabeth.com —
>> they will credit the photograph to you and remove it whenever you ask.
>
> 2. If the programme keeps a current downtown business list with hours, I would
>    take it gratefully and cite Main Street as the source on every listing it
>    corrects.
>
> Our Elizabeth calendar also runs out on 22 December. If you have 2027 dates
> for the Main Street events, send them and I will carry them.
>
> I am walking South Main Street with a camera and will photograph storefronts
> from the pavement, which needs nobody's permission. If a business would rather
> we did not, tell me and we will leave them out.
>
> Thank you,
> <name>

## 8. Downtown Erie

**To:** `info@weloveerie.biz`
**Subject:** `Photographs for the 15 Downtown Erie business listings`

Phone (720) 277-9255. Downtown Erie is the downtown programme;
`downtownerie.biz` and `weloveerie.biz` are the same organisation.

> Hello,
>
> I publish Inside Erie (insideerie.com), a free, independent guide to the town:
> 35 listings, an events calendar, no advertising, nothing paid for.
>
> 15 of our 16 Erie business listings have no photograph. The rest of the data
> is in good order — only two are missing hours and only one a website — so the
> photograph is the whole of it.
>
> Would you put a line in a newsletter or a members' post? Something like:
>
>> Inside Erie lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insideerie.com — they will credit it
>> to you and take it down whenever you ask. They are also happy to come and
>> photograph your storefront.
>
> Our Erie calendar is full to 29 December and then stops; if you have 2027
> dates for the Briggs Street events I would carry them, each linking back to
> you.
>
> One thing I would rather offer than ask for: the site carries a page on which
> side of County Line Road a given address sits, and which county, school
> district and fire district that puts it in. It is written for people who have
> just moved and cannot get a straight answer. If it is useful to you, link it —
> and if it is wrong anywhere, tell me and I will fix it.
>
> I am photographing Briggs Street storefronts from the pavement, which needs
> nobody's permission. If a business would rather we did not, tell me and we
> will leave them out.
>
> Thank you,
> <name>

## 9. Erie Chamber of Commerce

**To:** `erie@eriechamber.org`
**Subject:** `A photo request your members might want to hear about`

Phone (303) 828-3440 · 235 Wells Street, Erie, CO 80516. The site already cites
the chamber 23 times, mostly at `members.eriechamber.org`; `eriechamber.org` is
the front door and the better address. Send this **or** the Downtown Erie email
first and wait a week — they overlap in membership, and two identical asks in
one week reads as a mailing list.

> Hello,
>
> I publish Inside Erie (insideerie.com), a free, independent local guide. It
> lists 35 Erie places and carries an events calendar; nobody pays to be listed,
> there is no advertising, and the site already links to the chamber 23 times
> because your calendar is one of the sources events are taken from.
>
> 15 of our 16 business listings have no photograph. Rather than write to 15
> businesses cold, I would rather ask once through you.
>
> Would the chamber put a line in a members' newsletter? Something like:
>
>> Inside Erie lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insideerie.com — they will credit it
>> to you and remove it whenever you ask.
>
> If the chamber has 2027 event dates already fixed, I would carry those too;
> our calendar currently stops on 29 December.
>
> Thank you,
> <name>

## 10. Johnstown Downtown Development Association

**To:** `johnstowndda@gmail.com`
**Cc:** `scrosthwaite@johnstownco.gov`
**Subject:** `Photographs for 13 downtown Johnstown listings, and 2027 dates`

Sarah Crosthwaite is Interim Executive Director; (970) 578-9612, PO Box 127,
Johnstown, CO 80534. **The Johnstown-Milliken Chamber has no usable website** —
its old domain now serves an unrelated gambling site and its replacement does
not resolve — so the DDA is the business body to write to. See `BACKLINKS.md`
before linking to anything chamber-branded.

> Hello,
>
> I publish Inside Johnstown (insidejohnstown.com), a free, independent guide to
> the town: 29 listings, an events calendar, no advertising, nothing paid for.
> The site cites johnstownco.gov 54 times and visitdowntownjohnstown.com four
> times, all of it unprompted.
>
> 13 of our 14 Johnstown business listings have no photograph. Only two are
> missing hours and only two a website, so the photograph really is the gap.
>
> Would the DDA put a line in a newsletter or a members' post? Something like:
>
>> Inside Johnstown lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insidejohnstown.com — they will
>> credit it to you and take it down whenever you ask. They are also happy to
>> come and photograph your storefront.
>
> Our Johnstown calendar is the tightest in the network: it is full to 17
> December and then empty. If the DDA has 2027 dates for the downtown events, I
> would carry every one of them with a link back to you.
>
> I am photographing Parish Avenue and Charlotte Street storefronts from the
> pavement, which needs nobody's permission. If a business would rather we did
> not, tell me and we will leave them out.
>
> Thank you,
> <name>

## 11. Timnath Main Street

**To:** `lgraves@timnathgov.com`
**Subject:** `Photographs for the ten Old Town Timnath business listings`

Logan Graves is Principal Planner and staffs the Main Street programme;
970-224-3211. Timnath was designated a Colorado Main Street community by DOLA.
Board chair: Katie Gibson. **Note the domain: the Town's website is `timnath.org`
but its email is `@timnathgov.com`.**

> Hello,
>
> I publish Inside Timnath (insidetimnath.com), a free, independent guide to the
> town: 20 listings, an events calendar, no advertising, and no listing that can
> be bought or removed by payment. The site cites timnath.org 33 times.
>
> All ten of our Timnath business listings have no photograph. Their hours are
> complete, which is better than any other town I publish; three have no website
> on file and two no contact detail at all.
>
> Would Main Street put a line in a newsletter, a board packet or a downtown
> post? Something like:
>
>> Inside Timnath lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insidetimnath.com — they will credit
>> it to you and remove it whenever you ask, and they are happy to come and
>> photograph your storefront instead.
>
> Our Timnath calendar runs to 30 December and then stops. If the Main Street
> board has 2027 dates — Second Sundays on Main, Trick or Treat Street, the
> holiday events — I would carry them with a link back to downtowntimnath.com on
> each.
>
> I am photographing Main Street storefronts from the pavement, which needs
> nobody's permission. If a business would rather we did not, tell me and we
> will leave them out.
>
> Thank you,
> <name>

## 12. Timnath Chamber of Commerce

**To:** `membership@timnathchamber.com`
**Subject:** `A photo request your members might want to hear about`

Phone (970) 430-5754 · PO Box 154, Timnath, CO 80547-0154. Their own contact
form requires an account, so email is the route. Send a week apart from the
Main Street email above — the memberships overlap.

> Hello,
>
> I publish Inside Timnath (insidetimnath.com), a free, independent local guide.
> It lists 20 Timnath places with addresses and hours; nobody pays to be listed
> and there is no advertising.
>
> All ten of our business listings have no photograph. Rather than write to ten
> businesses cold, I would rather ask once through you.
>
> Would the chamber put a line in a members' newsletter? Something like:
>
>> Inside Timnath lists local businesses free of charge and is looking for
>> photographs. Send one of yours to hello@insidetimnath.com — they will credit
>> it to you and remove it whenever you ask.
>
> Thank you,
> <name>

---

## When the photographs come back

Record the permission before the image goes anywhere near a page. Add the row to
`IMAGE_LICENSES.csv`:

```
content/<town>/images/<file>.jpg,<their site or the email>,Used with permission of <name> (<date>),y,<town>
```

Keep the reply itself. Permission that cannot be produced later is not
permission. When it is your own photograph from the Main Street walk, the row is:

```
content/<town>/images/<file>.jpg,own photograph,All rights reserved (Inside the Towns),n,<town>
```

Corrected hours, a website or a 2027 date are edits to the place or event file,
with `source:` set to the reply and `verified:` set to the day it arrived.

---

## Tracking

| # | Town | Organisation | Route | Sent | Reply | Newsletter ran | Photos in | Data in |
|---|---|---|---|---|---|---|---|---|
| 1 | Berthoud | Town of Berthoud — Economic Sustainability | email | | | | | |
| 2 | Berthoud | Berthoud Main Street | form | | | | | |
| — | Berthoud | Berthoud Area Chamber | **browser only** | | | | | |
| 3 | Niwot | Niwot Business Association | form | | | | | |
| 4 | Niwot | Left Hand Valley Courier | form | | | | | |
| 5 | Lyons | Town of Lyons — Community Programs | email | | | | | |
| 6 | Lyons | The Lyons Recorder | email | | | | | |
| 7 | Elizabeth | Elizabeth Main Street Program | form | | | | | |
| 8 | Erie | Downtown Erie | email | | | | | |
| 9 | Erie | Erie Chamber of Commerce | email | | | | | |
| 10 | Johnstown | Johnstown DDA | email | | | | | |
| 11 | Timnath | Timnath Main Street | email | | | | | |
| 12 | Timnath | Timnath Chamber of Commerce | email | | | | | |

Thirteen rows, twelve sendable messages — eight emails and four contact forms.
The Berthoud chamber row is a reminder to look their address up in a browser,
not something to send from here.

---

## How these addresses were checked

Read out of each organisation's own pages on 21 September 2026, from the page
source rather than from a rendered summary. That distinction matters:

- **`timnath.org` obfuscates its addresses with Cloudflare email protection.**
  The page renders the words "[email protected]" and stores the real address
  XOR-encoded in a `data-cfemail` attribute. Decoding it gives
  `lgraves@timnathgov.com` — a **different domain from the website**. Anything
  that reads the rendered text will either miss the address or invent a
  plausible one; `timnath.mainstreet@timnath.org` looks right and does not
  exist. The same decode gives `sbieber@timnathgov.com` for the ADA coordinator
  and `aadams@timnathgov.com` on the town manager's page.
- **`downtownerie.biz` and `visitdowntownjohnstown.com` are Wix sites** whose
  contact details are rendered client-side, so `curl` alone returns only Wix's
  own telemetry addresses. Both were confirmed against the rendered page.
- **`berthoudmainstreet.org` (46 pages) and `niwot.com` (61 pages)** were
  crawled in full. Neither publishes an address anywhere. Their robots.txt files
  permit this; the Berthoud **chamber's** does not, and was not touched.
- **`townofelizabeth.org` returns 403 to every automated client**, including a
  browser user-agent, so the Elizabeth board names come from
  `elizabethmainstreet.org`, which is open.

Recheck before a second round. Interim directors do not stay interim, and two of
the twelve rows above are one person's job change away from bouncing.
