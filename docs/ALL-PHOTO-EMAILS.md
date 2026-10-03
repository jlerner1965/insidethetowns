# Every photo email, in one place

Thirty-eight messages, ready to copy and paste, drawn from the three documents in
`docs/` (`INDUSTRY-EMAILS.md`, `PARK-PHOTO-EMAILS.md`, `VENUE-PHOTO-EMAILS.md`),
with the one-to-one ask from `PHOTOS.md`, plus Batch D: two follow-ups, added
1 October 2026, to the councils that said yes in September. Batches A to C are
the send list in one file, in the order to send it, copied word for word, so a
change to one belongs in its source as well. The tracking table at the end
records what has already been answered.

## Before you send anything

1. **`hello@inside<town>.com` reaches you.** Since 27 September 2026 all eight
   domains forward `hello@` to your inbox through Cloudflare Email Routing
   (`DEPLOY.md`, *Email*), and a test message has arrived. All twelve trade-body
   messages name that address, most of them in the newsletter blurb they ask
   the recipient to print, so leave it as it is. Before that date it bounced:
   none of the domains had an MX record.
2. **Send from your own address for now.** Email Routing only receives: sending
   *as* `hello@inside<town>.com` needs an outgoing server that signs mail for
   the domain, and none is set up. The `hello@` address in the text reaches you
   either way. Switch once sending is set up — a request from the site being
   asked about is answered far more often than one from a generic address.
3. **Sign each one.** Every message ends with `<name>`.
4. **Space the overlapping pairs a week apart:** Downtown Erie and the Erie
   Chamber; Timnath Main Street and the Timnath Chamber; the Niwot Business
   Association and the Left Hand Valley Courier. The batches overlap too: Kim
   Mitchell at the Town of Lyons gets A5 and B7, and the Town of Berthoud gets
   A1, B1 and C2 (Stephanie Horvath is on the first two,
   `information@berthoud.org` on the last two). Space those the same way.
5. **Skip C4 once A2 has gone.** A2 already asks Berthoud Main Street both of
   C4's questions, through the same contact form.

## Send order

| Batch | Messages | Why first |
|---|---|---|
| A. Trade bodies (12) | across the seven towns, reaches 139 businesses | one email each replaces dozens |
| B. Parks (10) | town and county parks departments, 41 sites | they hold libraries and answer |
| C. Venues (14) | libraries, museums, the Y, the theatre, 21 sites | one site each |

## What needs no email at all

Photograph these on the walk. Public exteriors and public art on public streets.

| Site | Town |
|---|---|
| Downtown mural and public art walk | Berthoud |
| Berthoud Town Hall | Berthoud |
| Historic walking tour of Old Town | Johnstown |
| The eight Town parks | Johnstown: no permit (Tim Hoos, Public Works, 2 October 2026); no park user in a photograph without their permission |
| Niwot Hall | Niwot |
| Timnath Town Center | Timnath |
| Heil Valley Ranch, Rabbit Mountain, Niwot Loop Trail | Boulder County: no permit under 25 people in open hours |
| Tubing the St. Vrain | Lyons: the river in summer |

## When a photograph comes back

Add a row to `IMAGE_LICENSES.csv` before the image goes near a page, and keep
the reply. Permission that cannot be produced later is not permission.

```
content/<town>/images/<file>.jpg,<their site or the email>,Used with permission of <name> (<date>),y,<town>
```

A photograph of your own from the walk takes this row instead:

```
content/<town>/images/<file>.jpg,own photograph,All rights reserved (Inside the Towns),n,<town>
```

When a reply brings facts rather than a photograph — corrected hours, a
website, a 2027 date — edit the place or event file, with `source:` set to the
reply and `verified:` set to the day it arrived.

---

# Batch A. The twelve trade-body messages


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

# Batch B. The ten park and open-space requests

Two things every one of these asks: may we use photographs you already hold,
and do we need a permit to take our own. Number 8 (Boulder County) is optional:
their permits page already allows still photography without a permit.

## 1. Town of Berthoud, Parks and Recreation — 8 sites

**To:** SHorvath@Berthoud.org (Stephanie Horvath, Community Engagement Manager)
**Cc:** skouns@berthoud.org (Parks Supervisor), information@berthoud.org

**Subject:** Photograph permission for a free Berthoud guide

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free local guide to the
> town. It lists your parks with their addresses and what is at each one. It is
> editorial: nobody pays to be listed and there is no advertising.
>
> Eight of the park listings have no photograph:
>
> Ellen Bunyan Bein Park, Berthoud Bike Park, the Berthoud Reservoir Loop,
> Berthoud Town Park, Fickel Park, Pioneer Park, Roberts Lake and Waggener
> Farm Park.
>
> Two questions:
>
> 1. Do you hold photographs of any of these that we could use? We would credit
>    the Town on every one and take any of them down the day you ask.
> 2. If not, do we need a permit to photograph in the parks ourselves for the
>    guide?
>
> Happy to send the listings for a check while I am asking, in case anything on
> them has gone out of date.
>
> Thank you,
> <name>

---

## 2. Town of Erie, Parks and Open Space — 12 sites

**To:** communications@erieco.gov (Communications and Community Engagement Director)
**Cc:** parksandrecinfo@erieco.gov

**Subject:** Photograph permission for a free Erie guide

> Hello,
>
> I publish Inside Erie (insideerie.com), a free local guide to the town. It
> lists your parks and open spaces with their addresses and hours, taken from
> your own parks page, including the sunrise-to-sunset rule and the 6 am to
> 10 pm exception for Erie Community Park. It is editorial: nobody pays to be
> listed and there is no advertising.
>
> Twelve of the listings have no photograph:
>
> Arapahoe Ridge Park, Coal Creek Park, the Coal Creek Trail and Open Space,
> Erie Community Park, Erie Lake Open Space, the Erie Singletrack at Sunset
> Open Space, Lehigh Park, Longs Peak Park, Reliance Park and the Boneyard dog
> park, Serene Park, Star Meadows Park and the Thomas Reservoir Loop.
>
> Two questions:
>
> 1. Do you hold photographs of any of these that we could use? We would credit
>    the Town on every one and take any of them down the day you ask.
> 2. If not, do we need a permit to photograph on Town open space ourselves for
>    the guide?
>
> Thank you,
> <name>

---

## 3. Town of Johnstown, Parks and Recreation — 8 sites

**To:** sknowlton@johnstownco.gov (Samantha Knowlton, Communications Manager)
**Cc:** thoos@johnstownco.gov (Public Works Director; parks sit under Public Works)

**Subject:** Photograph permission for a free Johnstown guide

> Hello,
>
> I publish Inside Johnstown (insidejohnstown.com), a free local guide to the
> town. It lists your parks with their addresses and the 5 am to 10 pm hours
> from your Parks page. It is editorial: nobody pays to be listed and there is
> no advertising.
>
> Eight of the park listings have no photograph:
>
> Clearview Park, Eddie Aragon Park, Hays Park, Lake Park, Parish Park, Pioneer
> Ridge Park and its disc golf course, Rolling Hills Ranch Park and Sunrise
> Park.
>
> Two questions:
>
> 1. Do you hold photographs of any of these that we could use? We would credit
>    the Town on every one and take any of them down the day you ask.
> 2. If not, do we need a permit to photograph in the parks ourselves for the
>    guide?
>
> Thank you,
> <name>

---

## 4. Town of Timnath, Parks — 4 sites

**To:** recreation@timnathgov.com — note the domain is timnathgov.com, not timnath.org
**Or:** the Town's own route, https://timnath.org/parks-and-recreation-contact-form/

**Subject:** Photograph permission for a free Timnath guide

> Hello,
>
> I publish Inside Timnath (insidetimnath.com), a free local guide to the town.
> It lists your parks and the reservoir with their hours, including the
> motorized boating season of 1 April to 1 October and the off-season 7 am to
> 7 pm at the reservoir. It is editorial: nobody pays to be listed and there is
> no advertising.
>
> Four listings have no photograph: Timnath Community Park, Weitzel Park,
> WildWing Park and Timnath Reservoir.
>
> Two questions:
>
> 1. Do you hold photographs of any of these that we could use? We would credit
>    the Town on every one and take any of them down the day you ask.
> 2. If not, do we need a permit to photograph in the parks or at the reservoir
>    ourselves for the guide?
>
> Thank you,
> <name>

---

## 5. Elizabeth Park and Recreation District — 2 sites

**To:** mike@elizabethpr.com (Michael Barney, Executive Director)
**Cc:** ryan@elizabethpr.com (Parks Manager), info@elizabethpr.com

**Subject:** Photograph permission for a free Elizabeth guide

> Hello,
>
> I publish Inside Elizabeth (insideelizabeth.com), a free local guide to the
> town. It lists Casey Jones Park, Evans Park and Prickly Pines, along with
> your day camps and the pickleball tournament. It is editorial: nobody pays to
> be listed and there is no advertising.
>
> Evans Park and Prickly Pines Disc Golf have no photograph. Casey Jones Park
> has one, from a Creative Commons photograph of the Stampede.
>
> Two questions:
>
> 1. Do you hold photographs of Evans Park or Prickly Pines that we could use?
>    We would credit the District on every one and take any of them down the day
>    you ask.
> 2. If not, do we need permission to photograph in the parks ourselves for the
>    guide?
>
> While I am writing: your pages give no posted hours for the parks themselves,
> only the office hours for disc rentals and the Snack Shack's season. If the
> parks do have posted hours, I would like to list them correctly.
>
> Thank you,
> <name>

---

## 6. Town of Elizabeth, Public Works — 1 site

**To:** no email is published; the Town's site sits behind Cloudflare and blocks automated reading.
Call 303-646-4166 and ask for Public Works, or use the contact route on townofelizabeth.org.

**Subject:** Running Creek Park, photograph and hours for a free Elizabeth guide

> Hello,
>
> I publish Inside Elizabeth (insideelizabeth.com), a free local guide to the
> town. It is editorial: nobody pays to be listed and there is no advertising.
>
> The listing for Running Creek Park has no photograph and no hours. Do you hold
> a photograph we could use, credited to the Town, and does the park have posted
> hours I should list? If not, do we need permission to photograph there
> ourselves?
>
> Thank you,
> <name>

---

## 7. Town of Lyons, Parks and Recreation — 1 site

**To:** kmitchell@townoflyons.com (Kim Mitchell, Director, Community Relations and Programs)
**Cc:** davec@townoflyons.com (Director, Parks and Public Works), recreation@townoflyons.com

**Subject:** Bohn Park photograph, and a question about your posted hours

> Hello,
>
> I publish Inside Lyons (insidelyons.com), a free local guide to the town. It
> is editorial: nobody pays to be listed and there is no advertising.
>
> Bohn Park's listing has no photograph. Do you hold one we could use, credited
> to the Town? We would take it down the day you ask. If not, do we need a
> permit to photograph in the park ourselves for the guide?
>
> One other thing, since it affects what we publish. Your site gives three
> different park hours: "dawn to dusk daily" on the Parks and Recreation page,
> "8:00 am until dusk" on the day-use page, and "8 am to 8 pm daily until
> further notice" on Bohn Park's own page. We are currently using the last of
> those for Bohn Park. Which is right?
>
> Thank you,
> <name>

---

## 8. Boulder County Parks and Open Space — 3 sites

**To:** posinfo@bouldercounty.gov
**Optional.** Their permits page already allows still photography without a permit during open hours with under 25 people. Send only if you want their library too.

**Subject:** Photograph permission for free guides to Lyons and Niwot

> Hello,
>
> I publish Inside Lyons and Inside Niwot (insidelyons.com, insideniwot.com),
> free local guides to those communities. They list your open space with the
> sunrise-to-sunset regulation from your own regulations page. They are
> editorial: nobody pays to be listed and there is no advertising.
>
> Three listings have no photograph: Heil Valley Ranch, Rabbit Mountain (Ron
> Stewart Preserve) and the Niwot Loop Trail. Hall Ranch already has one, from a
> Creative Commons photograph on Flickr.
>
> Two questions:
>
> 1. Does the department hold photographs of these that we could use? We would
>    credit Boulder County on every one and take any of them down the day you
>    ask.
> 2. If not, do we need a permit to photograph on open space ourselves for the
>    guides?
>
> Thank you,
> <name>

---

## 9. Douglas County Open Space and Natural Resources — 1 site

**To:** openspace@douglasco.gov
**Cc:** cfrizell@douglasco.gov (Caroline Frizell, Director, Communication and Public Affairs). The county notes email or text gets the fastest reply. Note the domain moved to douglasco.gov.

**Subject:** Bayou Gulch photograph for a free Elizabeth guide

> Hello,
>
> I publish Inside Elizabeth (insideelizabeth.com), a free local guide to
> Elizabeth in Elbert County. It lists the Two Bridges Trail at Bayou Gulch
> Regional Park, fifteen minutes west of town, as one of the nearest walks. It
> is editorial: nobody pays to be listed and there is no advertising.
>
> The listing has no photograph. Do you hold one of Bayou Gulch or the Two
> Bridges Trail that we could use, credited to Douglas County? We would take it
> down the day you ask. If not, do we need a permit to photograph there
> ourselves for the guide?
>
> Thank you,
> <name>

---

## 10. Niwot Cultural Arts Association — 1 site

**To:** the contact route on niwotarts.org; no address is published in a form I could read.

**Subject:** A photograph of the Children's Park for Inside Niwot

> Hello,
>
> I publish Inside Niwot (insideniwot.com), a free local guide to Niwot. It
> lists the Children's Park and the Sculpture Park, and the First Friday Art
> Walk among the events. It is editorial: nobody pays to be listed and there is
> no advertising.
>
> The Children's Park listing has no photograph. Do you have one we could use,
> credited to the Association or to the photographer, whichever you prefer? We
> would take it down the day you ask.
>
> Separately, the Sculpture Park listing now uses a Creative Commons photograph
> of The Eagle Catcher. If that piece is not part of the Association's
> collection, tell me and I will change it.
>
> Thank you,
> <name>


---

# Batch C. The fourteen venue requests

Six of the 21 venues need no permission (listed at the top of this file). Of
the fifteen that do, thirteen have a contact and are covered below; number 4,
on the murals, is an optional extra, and the two with no contact at all are
listed at the end of the batch. Three are phone calls: the Johnstown-Milliken
library, the Johnstown YMCA and the Candlelight Dinner Playhouse. Four more
have no email address on file and go through a form or the venue's own site:
Berthoud Main Street, the Wildfire Arts Center, Osmosis Gallery and Lyons
Classic Pinball.


## 1. Berthoud Community Library District — 1 site

**To:** berthoudcommunitylibrary@gmail.com
**Phone:** (970) 532-2757 · 236 Welch Ave

**Subject:** Photograph for the Berthoud Community Library listing on Inside Berthoud

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free local guide to the
> town. The library has a listing on it already, with your hours and a note
> about the storytimes, the writers group and the literary festival. It is
> editorial: nobody pays to be listed and there is no advertising.
>
> The listing has no photograph. Two questions:
>
> 1. Does the library hold a photograph of the building we could use? We would
>    credit the library on it and take it down the day you ask.
> 2. If not, may we photograph the exterior, and the interior if we come at a
>    quiet hour? Nobody recognisable would be in the frame.
>
> Either way the listing stays and the hours stay right.
>
> Thank you,
> <name>

## 2. Town of Berthoud — 2 sites

**To:** information@berthoud.org
**Phone:** (970) 532-2643
**Sites:** Berthoud Recreation Center (1000 N Berthoud Pkwy), Berthoud Town Hall (807 Mountain Ave)

Town Hall's exterior is on the public-art walk and needs no permission — ask
only for the Recreation Center, and only for the inside.

**Subject:** Photograph of the Recreation Center for Inside Berthoud

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free guide to the town. It
> lists the Recreation Center at Waggener Farm Park with your hours and day-pass
> information, taken from berthoud.org. Nobody pays to be listed.
>
> The listing has no photograph. Does the Town hold one of the Recreation Center
> — the pools, the climbing wall or the building — that we could use? We would
> credit the Town of Berthoud and remove it whenever you asked.
>
> If not, may we photograph inside at a quiet hour, with nobody recognisable in
> the frame?
>
> Thank you,
> <name>

## 3. Berthoud Historical Society — 1 site

**To:** museumsdirector@berthoudhistoricalsociety.org
**Phone:** (970) 532-2147 · McCarty-Fickel Home, 645 7th St, open by appointment

**Subject:** Photograph of the McCarty-Fickel Home for Inside Berthoud

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free guide to the town. The
> McCarty-Fickel Home is listed on it as a museum open by appointment, with the
> 1916 date and the doctor's office. Nobody pays to be listed.
>
> The listing has no photograph. Does the Society hold one of the house — the
> exterior, or the surgery as it is kept — that we could use? We would credit
> the Berthoud Historical Society on it and take it down the day you asked.
>
> If it is easier, I would be glad to come and photograph it at an appointment
> that suits you.
>
> Thank you,
> <name>

## 4. Berthoud Main Street — 1 site

**Contact form:** https://berthoudmainstreet.org/contact/ — no address is
published on the site.
**Site:** Downtown mural and public art walk

**Optional.** The murals are public art on a public street; photograph them
on the walk. Send this only if you want the programme's own images of works
that have since rotated out, or a note on which sculptures are current.

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free guide to the town. It
> lists the downtown mural and public art walk, pointing at your Things To Do
> page for the route.
>
> I plan to photograph the murals myself, which needs nobody's permission. But
> two things only you would know: does Main Street hold photographs of works
> that have rotated out, and is there a current list of which sculptures are
> installed now? Either would make the listing better than a photograph alone.
>
> Thank you,
> <name>

## 5. Wildfire Arts Center — 1 site

**Contact form:** https://www.wildfirearts.org/contact-us — the address shown
on their site is a template placeholder (`user@domain.com`), so use the form or
the phone.
**Phone:** (970) 532-5497 · 425 Massachusetts Ave · Tue–Wed 9–3, Thu 9–2, Fri 10–3

**Subject:** Photograph for the Wildfire Arts Center listing on Inside Berthoud

> Hello,
>
> I publish Inside Berthoud (insideberthoud.com), a free guide to the town. The
> Arts Center has a listing on it with your hours and a note about the classes,
> summer camps, Art in the Park and StreetFest. Nobody pays to be listed.
>
> The listing has no photograph. Do you have one of the building or a class in
> progress that we could use? We would credit the Center and take it down
> whenever you asked. If you would rather we took our own, I am happy to come in
> open hours.
>
> Thank you,
> <name>

## 6. Pines & Plains Libraries — 1 site

**To:** scoleman@pplibraries.org — the published address for the Elizabeth
Library and the district office.
**Phone:** (303) 646-3416 · 651 W Beverly St

**Subject:** Photograph for the Elizabeth Library listing on Inside Elizabeth

> Hello,
>
> I publish Inside Elizabeth (insideelizabeth.com), a free local guide. The
> Elizabeth Library is listed on it with your hours and a note about the
> children's and teen rooms, the story times and the free art classes. Nobody
> pays to be listed and there is no advertising.
>
> The listing has no photograph. Does the district hold one of the Elizabeth
> building we could use? We would credit Pines & Plains Libraries and remove it
> the day you asked. If not, may we photograph the exterior and the inside at a
> quiet hour, with nobody recognisable in the frame?
>
> Thank you,
> <name>

## 7. Erie Historical Society — 1 site

**To:** info@eriehistoricalsociety.org
**Phone:** (303) 828-4568 · Wise Homestead Museum, 11611 Jasper Rd · Sat 10–2, May–Sep

**Subject:** Photograph of the Wise Homestead for Inside Erie

> Hello,
>
> I publish Inside Erie (insideerie.com), a free guide to the town. The Wise
> Homestead Museum is listed on it with your Saturday hours and the note that it
> is one of the oldest frame houses in Boulder County. Nobody pays to be listed.
>
> The listing has no photograph. Does the Society hold one of the farmhouse we
> could use? We would credit the Erie Historical Society and take it down the day
> you asked. Otherwise I would be glad to come on a Saturday in the season and
> photograph it.
>
> Thank you,
> <name>

## 8. Johnstown Historical Society — 2 sites

**To:** jhscomuseum@gmail.com
**Phone:** (970) 587-0278 · 701 Charlotte St · Tue, Wed, Sat 9–12
**Sites:** Historic Parish House & Museum, Historic walking tour of Old Town

The Parish House listing has carried an exterior photograph since 1 October
2026 (Jeffrey Beall, Wikimedia Commons). Ask for the rooms inside and for the
walking tour's stops, which still have nothing.

**Subject:** Photographs of the Parish House rooms and the walking tour for Inside Johnstown

> Hello,
>
> I publish Inside Johnstown (insidejohnstown.com), a free guide to the town.
> Two of your things are listed on it: the Historic Parish House & Museum, with
> your Tuesday, Wednesday and Saturday mornings, and the 25-stop walking tour of
> Old Town. Nobody pays to be listed and there is no advertising.
>
> The Parish House listing shows the bungalow from Charlotte Street, but nothing
> of what a visitor actually comes to see. Does the Society hold images of the
> Parish family's rooms as they are kept, or of the meteorite fragment, that we
> could use? And is there a photograph of any of the walking tour's stops you
> would like it to lead with? We would credit the Johnstown Historical Society
> and take any of them down the day you asked.
>
> I plan to photograph the walking tour's stops from the street, which needs
> nobody's permission, but if there is a stop you would rather we did not
> feature, tell me and we will leave it out.
>
> Thank you,
> <name>

## 9. Johnstown-Milliken Public Libraries — 1 site

**Phone:** (970) 587-2459 — no email address is published on their site.
**Site:** Glenn A. Jones, M.D. Memorial Library, 400 S Parish Ave

Call rather than write. If you would rather send something, ask at the desk for
the director's address.

> Hello — I publish Inside Johnstown, a free local guide at insidejohnstown.com.
> The Glenn A. Jones library is listed on it with your hours, the makerspace and
> the library of things; nobody pays to be listed.
>
> The listing has no photograph. Does the district have one of the building we
> could use, credited to you and removed whenever you ask? And if not, may we
> photograph the outside and the inside at a quiet hour?

## 10. YMCA of Northern Colorado — 1 site

**Phone:** (720) 797-2020 · 165 Settler Way
**Site:** Johnstown Community YMCA

No branch address is published; the site routes through a general contact form.
The branch desk is the faster route.

> Hello — I publish Inside Johnstown (insidejohnstown.com), a free local guide.
> The Johnstown Y is listed on it with your hours and the pools, track and
> preschool. Nobody pays to be listed.
>
> Does the Y hold a photograph of the branch we could use, credited to the YMCA
> of Northern Colorado and removed whenever you ask? An exterior would do. I
> would not photograph inside a facility with members in it without you arranging
> it.

## 11. Candlelight Dinner Playhouse — 1 site

**Phone:** (970) 744-3747 · Box office Tue–Fri 10–5, Sat 12–5 · 4747 Marketplace Dr

A working theatre: they will have production and house photographs already, and
a press contact used to this request. `coloradocandlelight.com` answers `202`
to automated clients, so use the phone or their own contact page in a browser.

**Subject:** Photograph for the Candlelight listing on Inside Johnstown

> Hello,
>
> I publish Inside Johnstown (insidejohnstown.com), a free guide to the town.
> The Playhouse is listed on it with your box office hours and the current
> season. Nobody pays to be listed and there is no advertising.
>
> The listing has no photograph. Would you send one we may use — the house, the
> building, or a production still you already clear for press? We would credit it
> as you ask and take it down whenever you want.
>
> Thank you,
> <name>

## 12. Lyons Regional Library District — 1 site

**To:** info@lyonslibrary.com
**Site:** 451 4th Ave · Mon–Thu 10–7, Fri 10–5, Sat 10–2

**Subject:** Photograph for the library listing on Inside Lyons

> Hello,
>
> I publish Inside Lyons (insidelyons.com), a free local guide. The library is
> listed on it with your hours and a note about the meeting rooms and the Effie
> Banta Room. Nobody pays to be listed.
>
> The listing has no photograph, which is a shame for a 2019 building. Does the
> district hold one we could use? We would credit the Lyons Regional Library
> District and remove it the day you asked. If not, may we photograph it
> ourselves, outside and in at a quiet hour?
>
> Thank you,
> <name>

## 13. Osmosis Gallery — 1 site

**Site:** https://www.osmosisartgallery.com/ · 290 Second Ave, Niwot
**Hours:** Mon–Fri 10–5, Sat 11–5

A gallery showing more than forty Colorado artists — ask before photographing
inside, because the work on the walls is not theirs to license.

> Hello — I publish Inside Niwot (insideniwot.com), a free local guide. The
> gallery is listed on it with your hours and the First Friday openings; nobody
> pays to be listed.
>
> The listing has no photograph. May we use one of yours, or photograph the
> front of the building on Second Avenue? I would not photograph the work on the
> walls without you telling me which artists are happy with that.

## 14. Lyons Classic Pinball — 1 site

**Site:** https://www.lyonsclassicpinball.com/ · 339 Main St
**Hours:** Thu 5–10, Fri 4–10, Sat 12–10, Sun 12–9

> Hello — I publish Inside Lyons (insidelyons.com), a free local guide. The hall
> is listed on it with your hours, the monthly tournament and the women's league.
> Nobody pays to be listed and we do not sell advertising.
>
> The listing has no photograph. Could we use one of yours, or come in during
> open hours and take one of the floor? Nobody recognisable would be in the
> frame. We would credit it to you and take it down the moment you asked.

## Two with no contact at all

These have no website and no phone in the repository, so they need a walk or a
look-up before anything can be sent:

| Venue | Town | Address |
|---|---|---|
| B-Rad's Arcade | Berthoud | 154 Mountain Ave |
| Elbert County Artists Guild | Elizabeth | 338 S Main St |

Both are storefronts on the two Main Streets you would be walking anyway. (The
First National Bank building in Elizabeth was on this list; it has carried a
Commons photograph since 1 October 2026.)


---

# Batch D. Follow-ups to the two who said yes

Both replied in September and offered more. These ask for exactly what is
still missing.

## 1. Town of Berthoud — the six parks still without a photograph

**To:** SHorvath@Berthoud.org (Stephanie Horvath, Community Engagement Manager)
**Cc:** skouns@berthoud.org (Parks Supervisor)

She sent four photographs on 21 September: the Recreation Center, two of Town
Park and Waggener Farm Park. Six of the eight parks in B1 still have none.

**Subject:** Thank you — and six Berthoud parks still without a photograph

> Hello Stephanie,
>
> Thank you again for the photographs of the Recreation Center, Town Park and
> Waggener Farm Park. They are on Inside Berthoud now and they have made those
> listings far better than anything I could have written.
>
> Six of the park listings still have no photograph:
>
> Ellen Bunyan Bein Park, Berthoud Bike Park, the Berthoud Reservoir Loop,
> Fickel Park, Pioneer Park and Roberts Lake.
>
> If the Town has photographs of any of these, I would be glad to use them on
> the same terms as before. If not, is it fine for me to photograph them
> myself for the guide?
>
> Thank you,
> <name>

## 2. Town of Erie — the five parks not on erieco.gov

**To:** communications@erieco.gov (for Ashley Burger, Communications & Marketing Manager)
**Phone:** 303-926-2541

Her grant of 18 September covered the photographs on erieco.gov and offered
more: "If you are looking for particular photos of our parks that aren't on
the website, please reach out, I likely already have them." Five parks and the
Singletrack have none on the website (PERMISSIONS.md).

**Subject:** Taking you up on your offer — five Erie parks without a photograph

> Hello Ashley,
>
> Thank you for letting Inside Erie use the Town's park photographs. Six of
> them are on the guide now, credited to the Town.
>
> You kindly offered to look for photographs that are not on the website, so
> I am taking you up on it. These listings still have none, because erieco.gov
> has none to use:
>
> Arapahoe Ridge Park, Lehigh Park, Longs Peak Park, Serene Park, Star Meadows
> Park, and the Erie Singletrack at Sunset Open Space (the Town's page for it
> carries only trail maps).
>
> Any of them would be welcome, on the same terms as before.
>
> Thank you,
> <name>


---

# If a trade body says no: the one-to-one ask

For any business you reach directly, in person or by email. Addresses, phones
and websites for all 139 are in `docs/PHOTO-CONTACTS.csv`.

> Hello — I run Inside <Town>, a free local guide at inside<town>.com. You have
> a listing on it already, with your address and hours; nobody pays to be
> listed and we do not sell advertising.
>
> The listing has no photograph. Could we either use one of yours, or take one
> of the front of the shop? If you send one, we will credit it to you and we
> will take it down the moment you ask.
>
> Either way the listing stays, photograph or not.

## The introduction email

> Subject: A photo request your members might want to hear about
>
> Hello,
>
> I publish Inside <Town> (inside<town>.com), a free local guide. It lists
> <N> businesses in <Town> with their address and hours. Nobody pays to be
> listed, we do not sell advertising, and no listing can be bought or removed
> by payment.
>
> <N> of those listings have no photograph, which makes them look thinner than
> the businesses deserve. I would rather ask once through you than send <N>
> cold emails.
>
> Would you be willing to put a line in a newsletter or a members' post? Something
> like:
>
>> Inside <Town> lists local businesses free and is looking for photographs.
>> If you would like one of yours used on your listing, send it to
>> <address> — they will credit you and take it down whenever you ask.
>> They are also happy to come and photograph your storefront.
>
> I am also walking Main Street with a camera and will photograph storefronts
> from the pavement, which needs nobody's permission. If a member would rather we
> did not, tell me and we will leave them out.
>
> Thank you,
> <name>

The last paragraph matters. Say it up front rather than letting a business
discover a photograph of their shop and wonder. It is also true, which is why it
can be said.


---

# Tracking

| # | Batch | Recipient | Route | Sent | Reply | Outcome |
|---|---|---|---|---|---|---|
| A1 | Trade | Town of Berthoud, Economic Sustainability | email | | | |
| A2 | Trade | Berthoud Main Street | form | | | |
| A3 | Trade | Niwot Business Association | form | | | |
| A4 | Trade | Left Hand Valley Courier | form, a week after A3 | | | |
| A5 | Trade | Town of Lyons, Community Programs | email | | | |
| A6 | Trade | The Lyons Recorder | email | | | |
| A7 | Trade | Elizabeth Main Street Program | form | | | |
| A8 | Trade | Downtown Erie | email | | | |
| A9 | Trade | Erie Chamber of Commerce | email, a week after A8 | | | |
| A10 | Trade | Johnstown Downtown Development Association | email | | | |
| A11 | Trade | Timnath Main Street | email | | | |
| A12 | Trade | Timnath Chamber of Commerce | email, a week after A11 | | | |
| B1 | Parks | Town of Berthoud Parks and Recreation (8 sites) | email, a week after A1 | yes | 2026-09-21 | 4 photographs: Recreation Center, Town Park ×2, Waggener Farm Park. Six parks remain → D1 |
| B2 | Parks | Town of Erie Parks and Open Space (12) | email | yes | 2026-09-18 | Granted, standing (PERMISSIONS.md). Six used; the remaining five parks and the Singletrack came with D2 |
| B3 | Parks | Town of Johnstown Parks and Recreation (8) | email | yes | 2026-10-02 | No library. No permit to photograph the parks; no park users without their permission (PERMISSIONS.md). One playground photograph sent from their files, the north playground at Sunrise Park (confirmed by the owner). Seven parks remain: the walk |
| B4 | Parks | Town of Timnath Parks (4) | email or form | | | |
| B5 | Parks | Elizabeth Park and Recreation District (2) | email | | | |
| B6 | Parks | Town of Elizabeth Public Works (1) | phone | | | |
| B7 | Parks | Town of Lyons Parks and Recreation (1) | email, a week after A5 | | | |
| B8 | Parks | Boulder County Parks and Open Space (3) | email, optional | yes | 2026-09-18 | Granted for the three gallery pages (PERMISSIONS.md). Done |
| B9 | Parks | Douglas County Open Space (1) | email | | | |
| B10 | Parks | Niwot Cultural Arts Association (1) | form | | | |
| C1 | Venues | Berthoud Community Library District | email | | | |
| C2 | Venues | Town of Berthoud (Recreation Center) | email, a week after B1 | — | — | Not needed: the Recreation Center came with B1. Done |
| C3 | Venues | Berthoud Historical Society | email | | | |
| C4 | Venues | Berthoud Main Street (murals), optional | form; skip once A2 has gone | | | |
| C5 | Venues | Wildfire Arts Center | form or phone | | | |
| C6 | Venues | Pines & Plains Libraries | email | | | |
| C7 | Venues | Erie Historical Society | email | | | |
| C8 | Venues | Johnstown Historical Society | email | yes | 2026-10-02 | Granted: the walking tour page's photographs, credit "Courtesy of the Johnstown Historical Society, Ltd" (PERMISSIONS.md); three used on the walking tour listing. Parish House interior and meteorite photographs promised; asked portrait or landscape, answered landscape. Also: Cemetery Crawl registration open, listing updated |
| C9 | Venues | Johnstown-Milliken Public Libraries | phone | | | |
| C10 | Venues | YMCA of Northern Colorado | phone | | | |
| C11 | Venues | Candlelight Dinner Playhouse | phone | | | |
| C12 | Venues | Lyons Regional Library District | email | | | |
| C13 | Venues | Osmosis Gallery | site contact | | | |
| C14 | Venues | Lyons Classic Pinball | site contact | | | |
| D1 | Follow-up | Town of Berthoud — six parks | email | | | |
| D2 | Follow-up | Town of Erie — five parks and the Singletrack | email | 2026-10-01 | 2026-10-02 | The five park pages now carry photographs (one used from each); five Singletrack photographs supplied by Drive folder, three used (PERMISSIONS.md). Erie is complete |
