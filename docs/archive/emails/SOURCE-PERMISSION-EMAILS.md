# Two permission emails: reading a library's calendar feed weekly

Two of the best event feeds in the network sit behind a robots.txt that
disallows agents it does not list, though both are the feeds the libraries
offer readers under "subscribe". The repo's rule is to honour robots.txt, so
`npm run ingest` does not read either until the library says it may. Both
sources are `manual` in their town's `sources.json` with the feed URL kept;
when a yes comes, set `type` back to `ical` and `robots` to `subscribe`.

Addresses are not filled in here: take them from each library's own contact
page rather than from a guess. Pines & Plains lists its staff at
<https://pplibraries.org/00e-contact-us/>. The Lyons Regional Library's site
did not answer an automated request on 4 October 2026; its contact page is
the place to look, and the calendar feed itself names a programs contact.

## Lyons Regional Library

**Subject:** Reading the library's event calendar feed for Inside Lyons

Hello,

I publish Inside Lyons (insidelyons.com), an independent community guide to
the town. The library's programs are the backbone of its events calendar:
about 70 of the listings there right now come from your calendar at
lyons.librarycalendar.com, each checked against your page and linked back
to it.

I would like to read the calendar's iCal feed
(https://lyons.librarycalendar.com/events/feed/ical) once a week, by
script, so that new programs and any changes reach the guide sooner and more
accurately than by hand. The feed is the one your site offers under
"subscribe", but the site's robots.txt asks automated clients to stay out,
so I am asking rather than assuming.

What I would do with it: one request a week, identifying as
InsideTheTowns-linkcheck; nothing is published automatically, every item is
checked by a person before it goes up, each listing links to your page and
names the library as its source, and your own text is not reproduced, only
the facts of date, time and place.

If that is fine with you, a reply saying so is all I need. If you would
rather I did not, I will carry on reading the calendar by hand.

Thank you for the programs, and for the calendar.

James
Inside Lyons · hello@insidelyons.com

## Pines & Plains Libraries

**Subject:** Reading the Elizabeth calendar feed for Inside Elizabeth

Hello,

I publish Inside Elizabeth (insideelizabeth.com), an independent community
guide to the town. The library's programs make up a good part of its events
calendar: fifteen of the listings there now come from your activities page,
each checked against it and linked back.

Your activities page embeds public Google calendars, and I would like to
read the one named "Elizabeth Events" once a week, by script, through its
public iCal address, so new programs and changes reach the guide sooner and
more accurately than by hand. Google's robots.txt asks automated clients to
stay out of calendar.google.com, so I am asking you rather than assuming
that a calendar you publish for subscription may be read that way.

What I would do with it: one request a week, identifying as
InsideTheTowns-linkcheck; nothing is published automatically, every item is
checked by a person before it goes up, each listing links to your page and
names the library as its source, and your own text is not reproduced, only
the facts of date, time and place. If the "District Happenings" calendar
also carries Elizabeth programs, I would ask the same of it.

If that is fine with you, a reply saying so is all I need. If you would
rather I did not, I will carry on reading the page by hand.

Thank you for the programs.

James
Inside Elizabeth · hello@insideelizabeth.com
