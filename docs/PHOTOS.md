# Getting the missing photographs

202 of 240 places have no photograph. 139 of those are restaurants, cafes, bars,
shops and lodgings. This is how to fix that, and what has already been ruled out.

`PHOTO-CONTACTS.csv` in this folder is the working list: every unphotographed
business with its address, area, phone, website and hours, sorted so a town's
Main Street reads in order.

## What has already been tried, and failed

Do not repeat these. The searches are recorded in `DECISIONS.md`.

- **Wikimedia Commons.** Each town's category holds 7 to 35 files, mostly
  locator maps, scanned archive documents, 2013 flood photographs and welcome
  signs. Everything usable was taken in Phases 5 to 7 and in the photo pass.
- **Openverse and Flickr under Creative Commons.** Searched across all 212
  unphotographed places. The matches were same-named places elsewhere: Pioneer
  Park in Bunbury and Fairbanks, Roberts Lake in British Columbia, Evans Park in
  Ohio, Queen Elizabeth II for anything containing "Elizabeth".
- **KartaView street-level imagery.** Four frames near Elizabeth's Main Street,
  all windshield dashcam shots of roadway with dashboard glare. No storefronts.
- **Mapillary.** Requires an API token this project does not have.
- **Yelp, Google Business, TripAdvisor and the businesses' own marketing
  photographs.** All copyrighted by their uploaders, and scraping them breaches
  those sites' terms as well. Not an option at any volume.

## What works

### 1. One walk down each Main Street

The fastest route by a wide margin. A phone camera in daylight covers most of a
town in an afternoon, and the images belong to the network outright.

Shot list per business, in priority order:

1. **The storefront straight on**, from across the street if the pavement is
   narrow. Include the sign. Mid-morning or late afternoon light; avoid noon.
2. **One detail** that says what the place is: the pastry case, the taps, the
   rack of hats, the bikes outside.
3. **The interior** only with the owner's nod, and only when it is not busy.

Landscape orientation, 3:2 or 4:3, at least 1600px on the long edge. No people
recognisable in the frame unless they have agreed.

For each photograph taken, add a row to `IMAGE_LICENSES.csv`:

```
content/<town>/images/<file>.jpg,own photograph,All rights reserved (Inside the Towns),n,<town>
```

### 2. Ask the business for one

Most will say yes, and many will send a better photograph than you would take.
Use the phone numbers and websites in `PHOTO-CONTACTS.csv`. The ask, by email or
in person:

> Hello — I run Inside <Town>, a free local guide at inside<town>.com. You have
> a listing on it already, with your address and hours; nobody pays to be
> listed and we do not sell advertising.
>
> The listing has no photograph. Could we either use one of yours, or take one
> of the front of the shop? If you send one, we will credit it to you and we
> will take it down the moment you ask.
>
> Either way the listing stays, photograph or not.

Record the permission. Add the row to `IMAGE_LICENSES.csv` as:

```
content/<town>/images/<file>.jpg,<their website>,Used with permission of the owner (<name>; <date>),y,<town>
```

Keep the email. Permission that cannot be produced later is not permission.

### 3. Ask the town and the county for the parks

Parks departments and county open space offices usually have a photograph
library and will often grant use for a local guide. Worth one email each to
Berthoud Parks, Erie Parks and Open Space, Johnstown Parks, the Elizabeth Park
and Recreation District, and Boulder County Parks and Open Space. That covers 34
parks and 21 trails in a handful of messages.

## The rule that governs all of this

Every image in the repository has a row in `IMAGE_LICENSES.csv` naming where it
came from and under what terms. No image goes in without one. A photograph whose
licence cannot be stated is not usable, however good it is and however much the
page wants one.
