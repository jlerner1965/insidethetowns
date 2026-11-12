# Transit service-change watch: the plan, as a prompt

Written 12 November 2026. A separate idea, not part of Inside the Towns and
not covered by the 90-day test: nothing here is built into the sites. Paste
everything below the line into a new session, together with `gtfs_diff.py`
from this folder.

---

You are helping me test a new project: a transit service-change watch. Read all
of this before doing anything.

## The idea

Once a week, compare every US transit agency's published schedule with the
previous version and report, in plain English and route by route, what is
changing: routes ending, trips cut or added, Sunday service starting or
stopping, earlier last departures. Riders follow their route and get an email
before the change takes effect.

## Why this idea (the decision)

Ten research agents looked for a data-aggregation site that has not been done
and that brings people back. This one won because:

- One standard format (GTFS) covers every agency, so one reader scales. The
  Mobility Database catalog (files.mobilitydatabase.org/feeds_v2.csv) lists 904
  active US feeds, free, with a stable "latest" URL for each.
- Agencies are cutting service to close budget gaps, so there is news weekly.
- Nobody does it. Agencies announce changes poorly; the Transit app only relays
  what agencies publish.
- An alert about a change is something an AI answer cannot give, and sites
  built on alerts are the ones growing now.

Rejected: insurance rate filings (the national portal bans automated
downloading), fish-stocking tracker (about 40 state formats), bourbon trackers
(states are fighting them), Colorado metro-district ledger (2,500 sets of PDFs).

## What is already proven

The attached script, `gtfs_diff.py`, read six agencies with no per-agency code
(RTD Denver, TriMet, SEPTA bus, RIPTA, KCATA, Transfort). Use it as the
starting point. The method that controls false alarms:

- Match routes by the name riders see (route_short_name, else long name), never
  internal ids.
- Count trips on real calendar dates using calendar.txt and calendar_dates.txt.
- Compare what two snapshots say about the SAME future week, in a week with no
  holiday. On Boston's archive (cdn.mbta.com/archive/archived_feeds.txt) this
  cut 15 false alarms to 1 real change.
- Report only changes of at least 4 trips and 10%, plus any route or day of
  service that starts or ends, and a first or last departure moving 30+ minutes.

How to run it:

    python3 gtfs_diff.py range FEED.zip
    python3 gtfs_diff.py compare OLD.zip YYYYMMDD NEW.zip YYYYMMDD   # each date is a Monday

Not solved: temporary construction shuttles still look like changes; the
thresholds are guesses tested on one agency; past versions are not available
without a sign-in, so history must be collected from now on.

Unchecked lead: SEPTA's bus feed (files.mobilitydatabase.org/mdb-502/latest.zip,
read 12 November 2026) shows the "M1 Bus" (126 weekday trips) running the week
of 7 December 2026 and absent the week of 11 January 2027. It may be a cut or a
rename. Verify against SEPTA's own announcements before saying either.

## The real risk, and the plan

My last project had good content and too few readers. So the audience comes
first and the site comes last.

1. Pick three cities where cuts are happening now (candidates: Philadelphia,
   Portland, Kansas City). Ignore the other 900 agencies.
2. For each city, produce a one-page write-up of what the next schedule change
   does, route by route, with a sign-up box. No site yet.
3. Draft, for me to send: a note to the local transit reporters, a note to the
   rider advocacy group, and a post for the city's transit forum.
4. Count for four weeks. Pass mark: 200 sign-ups across the three cities and
   one news story that cites the write-up.
5. Only if it passes: build the Astro site, the per-route pages and the alerts,
   and one automated account per city that posts each change.

Search traffic is a bonus, not the plan.

## Rules

- Every figure must trace to the agency's own feed. Check anything surprising
  against the agency's announcements before it goes in a write-up. Say "the
  schedule shows", never "the agency is cutting", unless the agency said so.
- Have me review every write-up and every message. Do not send, post, sign up
  or contact anyone.
- Honor each feed's license and robots.txt. A handful of requests per source.
- This is separate from my existing sites. Do not change their pages, content
  or scheduled jobs.
- Tell me plainly when something failed or could not be verified.

## Start here

Run the script on Philadelphia's current feed, then give me the Philadelphia
write-up as a draft, with the M1 question answered first.
