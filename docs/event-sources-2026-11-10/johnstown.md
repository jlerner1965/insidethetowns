# Johnstown: event sources, 10 November 2026

Johnstown has little with a changing calendar: one new feed (high school games), two hand-read pages, notes added to three existing proposed entries. No music room with a readable site was found. `npm run validate`: 0 errors.

## 1. Sources

| Source | Kind | Feed type and URL | Worth a row, 10 Nov to 10 Dec | Filters needed | Blockers |
|---|---|---|---|---|---|
| Roosevelt High School, athletics (NEW `rhs-weldre5j-org`) | school gym and field | ical, `https://rhs.weldre5j.org/fs/calendar-manager/events.ics?calendar_ids[]=26` (188 items to May 2027) | 6 home varsity dates of 23 items (football playoff 13 Nov, already listed; basketball 1 and 8 Dec; wrestling 2, 3, 9 Dec) | locationFilter "Johnstown"; exclude " @ ", "JV ", "Freshman", "C-Team" | robots.txt disallows /fs/: needs `robots: subscribe` |
| Weld RE-5J district calendar (NEW `weldre5j-org`) | school stages | html month grid, `?cal_date=YYYY-MM-01` | 2 (RMS band concert 8 Dec, orchestra 9 Dec, both at RHS); choir 15 Dec just outside | by hand; mostly no-school days, PTO, clubs | district iCal also under /fs/, not fetched |
| Fitness Avenue Turkey Trot 5K (NEW `runsignup-com-fitnessavenueturkeytrot`) | race | manual (RunSignup page) | 1 (Thu 26 Nov, 21 S Parish Ave, kids 1K 7:45 am, 5K 8:00 am) | none | no feed |
| Candlelight Dinner Playhouse (existing, notes added) | dinner theatre | html, no feed; AudienceView ticket calendar | 2 runs (Les Miserables to 15 Nov; Holiday Inn from 27 Nov, 12 performance days in window) | none | no feed |
| Johnstown DDA, visitdowntownjohnstown.com (existing, notes added) | downtown festivals | html (Wix), no feed | 1 (Johnstown Jingle, 6 Dec, already listed) | none | four dates a year |
| Johnstown Historical Society (existing, notes added) | museum | html (Sugar Calendar), no feed | 1 (Holiday Open House, 5 Dec, already listed) | none | three dates a year |

## 2. Turn on first

1. Roosevelt High athletics feed (with `robots: subscribe`): about 5 home varsity dates a month in winter.
2. District calendar by hand: 2 to 4 school concerts in December, few otherwise.
3. Turkey Trot: 1, once a year.
4. Candlelight `/all-shows/` monthly: the concerts (GARTH LIVE! 15 to 17 March 2027 is not in the guide).

Roughly 6 to 9 listings a month in winter, mostly games; only the first is automatic.

## 3. Looked for and ruled out

- Thompson Rivers Parks and Recreation (trpr.org): robots.txt names ClaudeBot, anthropic-ai and Claude-Web with Disallow: /; not crawled. Based in Milliken.
- Scheels Johnstown (scheels.com): Cloudflare 403 on the store page. A search result shows a Holiday LEGO Build Event on 12 December; not verified.
- Eventbrite and Bandsintown Johnstown pages: robots.txt disallows (Eventbrite `Disallow: /` for all; Bandsintown names ClaudeBot).
- YMCA of Northern Colorado (/events): one Johnstown item, a seniors' potluck (regular). No feed.
- Bella Ridge Golf Club: The Events Calendar REST works but holds 0 upcoming; past items are "Course Reserved" and leagues.
- johnstownbbqday.org: redirects to the Town's own page (already a confirmed source); 2026 date was 6 June.
- thompsonriverranch.com: domain now serves unrelated spam; not the neighbourhood's site.
- Johnstown Breeze (johnstownbreeze.com): TLS certificate does not match the host; not read.
- Spirits Music Hall (1 N Parish Ave): only an old Eventbrite open-mic listing (undated in the search result) and a JamBase page (403); no sign it still operates.
- Cassidy's Sports Grill, Veteran Brothers Brewing, Tilted Barrel, Mirror Image Taphouse at Woods, Eleve Dance Academy, Hankins Farms: no readable site or calendar found (guessed hosts did not resolve; searches returned nothing). Not confirmed to exist or to host events.
- Roosevelt High choir and theatre: named on the activities page, no dates on any calendar.

## 4. Fetched despite a robots rule

- rhs.weldre5j.org: `https://rhs.weldre5j.org/fs/calendar-manager/events.ics?calendar_ids[]=26` (once; robots.txt disallows /fs/).

## 5. What a resident would say

- The Town runs a free Johnstown Holiday Passport: pick one up at Town Hall, collect a "Shop Local" sticker at each listed business (no purchase needed), return it full for a holiday goodie (johnstownco.gov/699/Johnstown-Holiday-Passport-Program; no dates on the page).
- BBQ Day is the day of the year: parade at 10, car show, band and fireworks at the middle school (johnstownco.gov/610/BBQ-Day; Historical Society lists 5 June 2027).
