# Hero photographs: what to buy and what to shoot

28 October 2026. The painted heroes are gone (`DECISIONS.md`, *The heroes
are photographs again*). Every guide is back on a photograph, and this file
lists the better ones to get. The plan further down is the owner's research
of 28 October, kept as written. The table above it shows what has changed
since and is kept current. A row comes off when its hero is replaced.

## Where each hero stands

| Guide | Hero now | Next | Who |
|---|---|---|---|
| Berthoud | **Bought 28 October:** iStock 1417954947, downtown on Mountain Avenue with the painted grain elevator (John M. Chase, 2021, editorial, 4,015 px). Its licence wants "iStock.com/JuniperCreek" beside the photo, so the hero prints it | Done. Paste the order number into `PERMISSIONS.md` | Owner |
| Lyons | **Swapped 2 November:** Main Street from Commons (Billy Hathorn, 2010, 2,400 px) is the hero again; the Adobe foothills bought 28 October (Adobe Stock 754641294, the foothills across the valley in March 2024 (LD Productions, standard licence, 5,472 px). Main Street's photo is back on its listing) stay licensed in the folder, unused: they showed no town. The Main Street listing is a row meanwhile | Shoot Main Street yourself, or an aerial; the Commons frame is full of parked cars | Owner |
| Niwot | Second Avenue and the Niwot Tribune (Jeffrey Beall, Flickr, CC BY-SA 2.0, 1,600 px) | The plan missed this one: it is Old Town under an open licence, and the hero since 27 October. Keep it; shoot Second Avenue east from Cottonwood Square for a sharper, current frame | Owner (shoot) |
| Lafayette | **New 2 November:** East Simpson Street in Old Town under snow (Jared Winkler, 2018, CC BY-SA 4.0, Commons' 1920px rendition), the guide's first hero | Shoot or buy Public Road in season; Commons' other Lafayette frames are the lake (CC0, 2025) and single houses | Owner |
| Frederick (the Carbon Valley guide until 2 November) | Fifth Street at Oak in old-town Frederick, under snow (Jared Winkler, 2018, CC BY-SA 4.0, 2,400 px), the Carbon Valley hero from 28 October, moved to `content/frederick/images/` with the town on 2 November | Done. It is also the Moving here guide's photograph, which the rules allow (only listings may not share the hero's) | — |
| Longmont | **Swapped 2 November:** Main Street at Third Avenue (David Shankbone, 2009, CC BY 3.0, 1,280 px), the history article's header, in place of McIntosh Lake | Buy iStock 2170237583, the downtown aerial ($33). Commons' Main Street at 5th Avenue (Billy Hathorn, 2010, 4,000 px) was looked at and passed over: a median tree in the middle of the frame and a Winchell's sign | Owner |
| Loveland | **Bought 28 October:** Adobe Stock 412335350, Jacob Boomsma's winter aerial of downtown with Lake Loveland and the foothills beyond (standard licence, 5,458 px) | Done. Paste the order number into `PERMISSIONS.md` | Owner |
| Erie | **Bought 30 October:** Adobe Stock 511199397, Briggs Street in Old Town from just above the rooftops, looking south, June 2022 (Noel, standard licence, 5,460 px), in place of Town Hall | Done. Adobe's licence record says Standard; it carries no order number | — |
| Johnstown | **Swapped 2 November:** the Historical Society's Charlotte Street sidewalk in Old Town (permission on file), in place of the Brush Barn a mile out of town; the walking tour's card is the Masonic Temple now | Still shoot Parish Avenue north from 1st Street; nothing exists to buy | Owner |
| Timnath | A frozen pond at sunrise, 960 px | Shoot Old Town Main Street north toward the church; nothing exists to buy | Owner |
| Windsor | Windsor Lake from the air, downtown on the far shore | Keep. The Commons Town Hall the plan offers is the Art & Heritage Center listing's card | — |
| Clear Creek | **Bought 30 October:** Adobe Stock 413103868, Jacob Boomsma's winter aerial of Idaho Springs, January 2021: the Argo mill, the creek and the town climbing the canyon (standard licence, 5,462 px), in place of the mill alone | Done. Adobe's licence record says Standard | — |
| Leadville | **Bought 30 October:** Adobe Stock 1111460584, Joe Sohm's drone view up Harrison Avenue, October 2023 (standard licence, 5,272 px), in place of the town among the aspens | Done. Adobe's licence record says Standard | — |
| Manitou Springs | **Bought 30 October:** Adobe Stock 357829842, Jacob Boomsma's June 2020 aerial of downtown along Manitou Avenue, the red rock and the mountains above (standard licence, 5,460 px), in place of Manitou Avenue at street level | Done. Adobe's licence record says Standard | — |
| Fort Collins | **Bought 30 October:** Adobe Stock 419314122, Old Town Square in July 2020, the splash pad, the umbrellas and the sandstone blocks (Schrodington, LLC, standard licence, 5,151 px), in place of the Northern Hotel | Done. Adobe's licence record says Standard | — |
| Golden | **Bought 30 October:** Adobe Stock 504466744, Jacob Boomsma's August 2021 aerial of Washington Avenue under the Welcome to Golden arch, North Table Mountain above (standard licence, 4,096 px), in place of Clear Creek and its kayakers | Done. Adobe's licence record says Standard | — |
| Estes Park | **Bought 30 October:** Adobe Stock 2151219980, Elkhorn Avenue from above in autumn, the cottonwoods yellow (Josh-Lehew, standard licence, 4,024 px), in place of the town from the Gem Lake trail | Done. Adobe's licence record says Standard | — |
| Elizabeth, Evergreen, Nederland | Their October Commons photographs | Fine as they are; the plan's picks are upgrades if the month's iStock and Adobe downloads have room | Owner |

Commons does load from the assistant's container, contrary to the plan's
last paragraph, when files are fetched through
`commons.wikimedia.org/w/thumb.php?f=<File>&w=2400` (`docs/PHOTOS.md`).

## Putting a bought photograph in

Send the downloaded file and the receipt to the assistant, or:

1. Save the file to `content/<town>/images/` exactly as the agency
   delivered it: its own name (`iStock-1417954947.jpg`), full size, its
   embedded record kept, which iStock's licence requires (section 11(d)).
   The site makes its own smaller copies at build. While this repository
   is public, see the open question under *Stock licences* in
   `PERMISSIONS.md` first.
2. Write its receipt in `PERMISSIONS.md`, under *Stock licences*.
3. Add its row to `IMAGE_LICENSES.csv`: the asset's page as the source,
   the licence starting with the agency and its kind (`iStock editorial
   licence (John M. Chase; 2021); bought 2026-11-02 — see PERMISSIONS.md,
   section: Stock licences; resized to 2400px`), `y` for credit.
4. In `src/config/towns/<town>.ts`, set `hero.image`, an `alt` that says
   what is in the frame, where and when, and a `credit` naming the
   photographer and the agency ("John M. Chase, iStock"); `npm run
   validate` fails a credit without the agency's name. Set `position` if
   the middle of the picture is the wrong crop for the band.
5. Run `npm test`, `npm run validate` and `npm run check-colors`, and look
   at the home page at 375, 768 and 1,280 px.

---

## The plan, 28 October 2026

*By James Lerner.*

### How to read this

One photograph per guide, of the town itself: its main street, or the town in its setting. That is the site's own rule (HOW-IT-WORKS, section 6), and it is what the three paintings and six of the current photos break. Paid editorial or royalty-free licences of a real photograph of the real place are allowed by the same rule; generic stock and generated images are not.

Each town below lists up to three verified candidates, ranked, with the one I'd take first marked **Pick**. Every link was opened and its caption read; none of the pictures could be viewed from here, so look at each before buying. Free (Commons, Flickr CC, Unsplash) comes first where it is as good; stock where it is clearly better.

**Replace first** (the current hero is not the town): Berthoud (Carter Lake / painting), Niwot (painting), Lyons (painting), Longmont (McIntosh Lake cattails), Loveland (lake sunset), Johnstown (a barn on County Road 17), Timnath (a 960 px pond), Carbon Valley (a park sign). **Fine as is, upgrade if cheap:** Erie, Elizabeth, Evergreen, Nederland, Golden, Fort Collins, Windsor, Estes Park, Grand Lake, Clear Creek, Leadville, Manitou Springs.

**For the repo:** each new file needs a row in `IMAGE_LICENSES.csv`, a credit in the town config, and the old hero's credits-page entry removed. A stock licence receipt goes in `PERMISSIONS.md`. Hero files are 2400 px wide or more; the band crops to a strip, so `position` sets which part shows.

Prices seen today: iStock $12 for a Basic image or $33 for a Premium one, and a Premium plan of 10 images for $70 a month; Adobe Stock 1 credit per standard photo, 10 credits for $29.99 a month, $79.99 for an extended licence; Shutterstock $29 for a 2-image pack or 10 images a month for $29 on the annual plan; Getty about $499 a single image. Shutterstock pages don't show pixel sizes to a fetch, so check the size on the page before paying. The buying plan and the shoot list are at the end.

### Front Range

### Berthoud

**Pick:** the iStock "Downtown Berthoud" frame: the only verified street-level photo of the Mountain Avenue district on any stock site, 4,015 px, summer morning, with the grain silo in it. It is an editorial licence, which the site's own rules allow for a real photo of the real place; it can't be reused in ads or promotions. If you want a standard licence instead, the Shutterstock drone view is the fallback, unseen.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | Historic downtown Berthoud, 17 July 2021, sunny morning, landscape | John M. Chase | **Editorial only** (allowed by HOW-IT-WORKS §6; no ad use) | 4015×3011 | $33 (3 credits), or $7 on the 10/month plan | [iStock 1417954947](https://www.istockphoto.com/photo/downtown-berthoud-colorado-gm1417954947-464839137) |
| 2 | Shutterstock | Drone view of Berthoud's neighbourhoods along the Front Range; content not confirmed | Elevation drone photos | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 2825099701](https://www.shutterstock.com/image-photo/residential-neighborhoods-berthoud-colorado-beautiful-scenic-2825099701) |
| 3 | Wikimedia Commons | Bimson Blacksmith Shop, 228 Mountain Avenue, September 2012: a single landmark, and already the museum listing's photo, which the rules say a hero can't share | Jeffrey Beall | CC BY-SA 3.0 | 5184×3026 | Free | [File:Bimson\_Blacksmith\_Shop.JPG](https://commons.wikimedia.org/wiki/File:Bimson_Blacksmith_Shop.JPG) (read via a mirror) |

Also seen: Adobe's 318 "berthoud colorado" results are about 90% Berthoud Pass; the town hits are maps, the city-limit sign and a liquor-store storefront. Shutterstock has a March 2024 editorial series by Rachel Rose Boucher (2434501979, 2435323873, 2434503511, 2410175789: storefronts, the old depot and elevator, Town Hall), each a single building. Berthoud is 20 minutes from Niwot: Mountain Avenue looking west from 4th Street in late-afternoon light, with the silo, would beat all of these and cost nothing.

### Niwot

**Pick:** shoot it yourself. No standard-licence or Creative Commons photo of Old Town Niwot exists on any reachable source; the three usable frames are all editorial. Second Avenue from the Cottonwood Square end, looking east toward the Tribune building, mid-morning, is the shot. If you'd rather buy, the first Shutterstock frame is the one.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Shutterstock | The Niwot Tribune office and the antique store on the old Second Avenue block, cars out front, 24 February 2024, 4:3 | Rachel Rose Boucher | **Editorial only** (a commercial licence "may be available" on request) | Not shown | $29 for a 2-image pack | [Shutterstock 2431454375](https://www.shutterstock.com/image-photo/niwot-colorado-usa-february-24-2024-2431454375) |
| 2 | Shutterstock | Several red-brick stores on the historic block, sunny winter day | Rachel Rose Boucher | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2431467219](https://www.shutterstock.com/image-photo/niwot-colorado-usa-february-24-2024-2431467219) |
| 3 | Getty Images | The train crossing on 2nd Avenue, 7 March 2016 | Katie Wood / The Denver Post | **Editorial, rights-managed**; commercial use by arrangement | 5616×3744 | Login to see the price | [Getty 519596558](https://www.gettyimages.com/detail/news-photo/the-train-crossing-on-2nd-avenue-in-niwot-colorado-on-march-news-photo/519596558) |

Also seen: Shutterstock 2430967255, the red caboose at Whistle Stop Park (Boucher, editorial), as a landmark fallback. Adobe's 74 Niwot hits are farm and solar-farm drone shots, Niwot Ridge tundra and maps; iStock is Niwot Ridge, barns and the Niwot Circuit Race; Unsplash has nothing. Shutterstock 470224526 ("SevenMaps") is a map.

### Lyons

**Pick:** Adobe's "View of Lyons from the Boulder mountain range": the town in its setting from above, 5,472 px, standard licence, no AI label. Open #2 beside it before buying; its keywords (street, downtown, skyline, canyon) suggest the better street-level frame.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock | Elevated view of Lyons in its valley: town, river, rock, mountains | Dylan | Standard | 5472×3648 | 1 credit | [Adobe 754641294](https://stock.adobe.com/images/view-of-lyons-colorado-from-boulder-mountain-range/754641294) |
| 2 | Adobe Stock | Lyons on a summer day: keywords town, street, downtown, skyline, canyon (sibling frame 636832246) | jzehnder | Standard | 5000×3333 | 1 credit | [Adobe 636832312](https://stock.adobe.com/images/lyons-colorado-in-the-rocky-mountains-on-a-summer-day/636832312) |
| 3 | iStock | Daytime small-town street scene at Halloween: cars, flag, info sign, horizontal | Kum Seong Wan | Standard, non-AI | 4840×2723 | $12 | [iStock 1132771015](https://www.istockphoto.com/photo/town-of-lyons-colorado-gm1132771015-300434633) |

Also seen: Shutterstock 2392575519 (CDivine1, "Town of Lyons in autumn", standard, about 2:1) and 1571534650 (a 2019 drone session) have no description at all, so they're unknowns. Adobe 1100798504, the "tilt-shift, charming town vibes" one, reads as generated: skip it. Shutterstock otherwise returns Roxborough's Lyons Overlook and Hall Ranch; Adobe mixes in Lyon, France. Commons lists "Downtown Lyons, CO IMG 5242.JPG" and "Lyons, CO, Redstone Museum IMG 5247.JPG", neither readable from here.

### Longmont

**Pick:** the iStock "Longmont Aerial During Autumn" by Dee Liu, who shoots downtown aerials for a living: 5,000 px, standard licence, keywords Downtown District / Cityscape / City Street. It is the only commercial-licence photo of the city itself that could be verified. For a street-level Main Street frame, #2 is editorial.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | Aerial of Longmont in fall colour, downtown district | Dee Liu | Standard, non-AI | 5000×3120 | $33 (3 credits) | [iStock 2170237583](https://www.istockphoto.com/photo/longmont-aerial-during-autumn-gm2170237583-590171980) |
| 2 | Shutterstock | The red-brick 1881 Imperial Hotel on Main Street with the intersection traffic, 4 September 2023 | Rachel Rose Boucher | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2361221367](https://www.shutterstock.com/image-photo/longmont-colorado-usa-september-4-2023-2361221367) |
| 3 | Shutterstock | Aerial of Longmont from the St. Vrain, January 2022, about 16:9 | Stonecircle | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 2108606831](https://www.shutterstock.com/image-photo/aerial-view-longmont-colorado-st-vrain-2108606831) |

**Do not use** Adobe 1007823010 ("historic downtown Longmont, brick buildings"): it is labelled Generated with AI. Also seen: Shutterstock 2360759325 (the Performing Arts Center, editorial, one building), 2784434027 (a subdivision aerial, standard, suburbs not the city), and 760544758 / 501636766, which are maps. Visit Longmont's [media gallery](https://visitlongmont.org/media/media-gallery/) shows no Main Street photo; its terms limit use to Visit Longmont's promotional partners, so you'd need their OK. Commons lists "Another glimpse of downtown Longmont, CO IMG 5228.JPG" and a Downtown Longmont Historic District category, unreadable from here.

### Loveland

**Pick:** Jacob Boomsma's winter aerial of downtown Loveland: 5,458 px, standard licence. The same frame is on Shutterstock, where the 2-image pack works out cheaper if you're buying his Grand Lake aerial too. No photo of the Rialto marquee exists on any reachable stock site.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock | Aerial of downtown Loveland in winter (variants 412335436, 412335269) | Jacob Boomsma | Standard | 5458×3634 | 1 credit | [Adobe 412335350](https://stock.adobe.com/images/aerial-view-of-downtown-loveland-colorado-during-winter/412335350) |
| 2 | Shutterstock | The same series, February 2021 (variant 1914025168) | Jacob Boomsma | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 1913432905](https://www.shutterstock.com/image-photo/aerial-view-downtown-loveland-colorado-during-1913432905) |
| 3 | Adobe Stock | Loveland on a sunny summer day: keywords downtown, skyline, Front Range, duck pond | jzehnder | Standard | 3000×2000, just over the threshold | 1 credit | [Adobe 862265135](https://stock.adobe.com/images/loveland-colorado-on-a-sunny-summer-day/862265135) |

Also seen: iStock 1500525947 (a Wirestock aerial, standard, $12) is tagged suburb with no mountains; Shutterstock 1924525019 is empty pandemic storefronts, editorial and portrait; Getty has Denver Post editorial frames on East 4th Street with people as the subject. Commons lists File:Rialto\_Theater\_Loveland\_CO.jpg and File:4th-Street-Loveland-CO.JPG, which couldn't be opened from here and are worth a look in a browser. No Loveland, Ohio contamination in any result set. The Rialto is a 25-minute drive: the marquee from across 4th Street at dusk, lit, is the obvious own shot.

### Johnstown

**Pick:** shoot it yourself. No photograph of Parish Avenue exists on any free or paid source. The shot: Parish Avenue looking north from about 1st Street, so the old brick storefronts fill the frame and the water tower sits behind, morning light on the west-side fronts.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Shutterstock | "Curvy railroad downtown Johnstown": the Great Western tracks; tagged Buildings and Backgrounds, so it may be a track close-up | Micah Thomas | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 1953355018](https://www.shutterstock.com/image-photo/1953355018) |
| 2 | Adobe Stock (Premium) | Aerial of a new Johnstown subdivision with the mountains on the horizon: the growth, not the old town | Amazing Aerial | Standard, Premium collection | 12288×8192 | $499.99 large, $249.99 small | [Adobe 2187421441](https://stock.adobe.com/images/x/2187421441) |

Two is all that exists. Also seen: Commons' Johnstown category holds four files (Town Hall, the Brush Barn you have now, the Little Thompson River bridge, one unnamed); the Town Hall page couldn't be opened. Everything else is Buc-ee's, Scheels, farmland aerials, Johnstown PA and NY, or Johnstown Castle in Ireland.

### Timnath

**Pick:** shoot it yourself; there is nothing to buy. Adobe and Shutterstock both auto-correct "Timnath" to Timna, Israel; with exact match forced, Shutterstock's only Timnath frames are Costco and EV-charger editorial shots and Poudre Trail segments, iStock the same, Adobe zero. The shot: Old Town Main Street looking north from the Timnath Beerwerks block, with the 1899 Presbyterian Church steeple closing the view, late afternoon so the west-facing fronts are lit, or blue hour with the Beerwerks lights on.

Also seen: Commons has File:Timnath-Downtown.JPG, almost certainly the 2005 Old Town snapshot from the Wikipedia article, too old and small; its Timnath category reportedly holds the church, the 1900 school and Town Hall, none openable from here to check size or licence. iStock 901351142 is the Poudre at Timnath, river scenery.

### Windsor

**Pick:** keep the lake aerial, or swap to the free Commons photo of the 1890s Town Hall (now the Art & Heritage Center) on 5th Street, the only verified non-lake, non-AI Windsor town photo found. No Main Street / CO 392 streetscape exists on any stock site; the search returns Windsor, England.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Wikimedia Commons | Windsor Town Hall (the Art & Heritage Center), 116 5th Street, on the National Register, August 2012 | Jeffrey Beall | CC BY-SA 3.0 | 3929×2561 | Free | [File:Windsor\_Town\_Hall.JPG](https://commons.wikimedia.org/wiki/File:Windsor_Town_Hall.JPG) (read via a mirror) |
| 2 | Shutterstock | A one-room schoolhouse, historic building, 1 August 2022; very likely the Boardwalk Park museum schoolhouse, location not stated | J.Campbell | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2187385731](https://www.shutterstock.com/image-photo/2187385731) |
| 3 | Shutterstock | Sunrise over Windsor Lake: the same subject as the current hero, fallback only | Robert Shainline | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 1045818001](https://www.shutterstock.com/image-photo/1045818001) |

**Do not use** Adobe 929099990 ("sunrise over Windsor, Great Western Railway tracks, downtown buildings", 7,280 px), 1345814384 or 993478403: every attractive-sounding Windsor downtown result on Adobe is labelled Generated with AI. Also seen: Shutterstock 1623409420 is the 1899 flour mill shot in January 2013, before the 2017 fire, so it can't stand for the town today; Adobe 393612486 and Shutterstock 506366893 / 759889489 / 501906826 are maps and map pins. The own shot: Main Street from 5th looking west toward the water tower, or Boardwalk Park's lake house from the lake path in the evening.

### Frederick (researched as Carbon Valley; the guide closed 2 November 2026 and Frederick carries on)

**Pick:** the Shutterstock Fifth Street frame of downtown Frederick (the police department's brick building), editorial-only, the one landscape-orientation downtown shot that exists. The Adobe aerial of Frederick in its fields is the true town-in-its-setting picture but it is a $499.99 premium asset.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock (Premium) | Drone view of the town of Frederick among its fields under a cloudy sky; mountains not in the keywords | Amazing Aerial | Standard, Premium collection | 12288×8192 | $499.99 large, $249.99 small | [Adobe 2173458994](https://stock.adobe.com/images/x/2173458994) |
| 2 | Shutterstock | The Frederick Police Department's brick building on Fifth Street downtown, 30 December 2023 | Rachel Rose Boucher | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2406994875](https://www.shutterstock.com/image-photo/2406994875) |
| 3 | Shutterstock | The Frederick Museum (the former City Hall) downtown, December 2023; portrait, backup only | Rachel Rose Boucher | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2408559983](https://www.shutterstock.com/image-photo/2408559983) |

Also seen: Shutterstock 2406984531 (museum, winter, portrait), 2406987053 (the grape-stomping bronze), and Dacono City Hall frames 2406756769 / 2406762543, all editorial. Firestone on Adobe is a neighbourhood sunset and wildfire smoke; nothing of Central Park, the Firestone sign, the Miners Memorial or Crist Park anywhere. Commons has File:Frederick,\_CO.jpg, File:Firestone,\_Colorado.JPG and File:Dacono,\_Colorado.JPG, probably Jeffrey Beall's town-sign photos, unverified. The own shot: Fifth Street in Frederick from Crist Park looking north, afternoon, with the Front Range at the end of the street if the air is clear.

### Erie

**Pick:** the Shutterstock Briggs Street row: the 1889 Davis Building with Old Mine Cider and Sweets Ice Cream, February 2024, landscape. Editorial-only; the standard-licence "Old town Erie" (#2) is the fallback but its content can't be confirmed from the page text.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Shutterstock | Historic downtown streetscape on Briggs Street: red-brick storefronts, the Davis Building (1889), Old Mine Cider Company and Sweets Ice Cream, 24 February 2024 | Rachel Rose Boucher | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2429666101](https://www.shutterstock.com/image-photo/2429666101) |
| 2 | Shutterstock | "Old town Erie in Colorado", November 2022; filed under Nature / Parks, so look before buying | Des2916 | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 2222095765](https://www.shutterstock.com/image-photo/2222095765) |
| 3 | Adobe Stock (Premium) | Canada geese on a pond with Erie's pumpkin water tower behind, summer | Travel 'n' Lifestyle | Standard, Premium collection | 4000×3000 | $499.99 large, $249.99 small | [Adobe 2191959659](https://stock.adobe.com/images/x/2191959659) |

Also seen: the same photographer's editorial set is a ready-made backup list: 2429669365 (Lucille's and the businesses with cars on the street), 2363583043 (the Coal Park building), 2366109521 (a two-storey brick downtown building at the crosswalk), 2363574043 (the post office with the coal car). Adobe 511199397 ("Erie CO") is keyworded church, castle, cathedral, europa, and was set aside here as the wrong place; it is not: its GPS record puts it over 660 Briggs Street, and it is the hero from 30 October. Getty is Denver Post news (fracking, the velodrome). Commons has only the Town Hall / Lincoln School files you use now.

### Golden

**Pick:** the iStock "Washington Avenue in Golden": the Welcome to Golden arch over the street with the Victorian storefronts, under a standard licence, 5,616 px, $33. Nearly every other arch shot on every site is editorial-only.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | The Welcome to Golden arch spanning Washington Avenue, historic shops and bars along the street | milehightraveler | Standard (Premium) | 5616×3744 | $33 (3 credits), or $7 on the 10/month plan | [iStock 497148273](https://www.istockphoto.com/photo/washington-avenue-in-golden-colorado-gm497148273-41849224) |
| 2 | iStock | 16:9 drone panorama of Golden in autumn: downtown and the School of Mines in their setting | Aaron Seltzer | Standard | 7048×3964 | $12 | [iStock 1740953054](https://www.istockphoto.com/photo/16x9-panorama-of-golden-colorado-from-drone-gm1740953054-542733037) |
| 3 | Adobe Stock | Aerial of downtown Golden's main street with Table Mountain | Jacob Boomsma | Standard | 4096×2684 | 1 credit | [Adobe 504466744](https://stock.adobe.com/images/aerial-view-of-downtown-golden-s-main-street-and-table-mountain-colorado/504466744) |

Also seen: the newest and sharpest arch shot, iStock 2212504972 (April 2025, 7,414 px), and Adobe 546325835 (6,506 px) are both editorial-only; so are Shutterstock 2227289159 and 2191037791. iStock 1300897625 (Golden from Lookout Mountain Road, standard, $12) is only 2,600 px. Visit Golden offers [press photos on request](https://www.visitgolden.com/media) through its PR agency, with no stated terms.

### Fort Collins

**Pick:** the Shutterstock Old Town Square frame, the fountain and outdoor dining in daylight, standard licence. Shutterstock doesn't print pixel sizes, so confirm it is at least 2,400 px before paying. For sheer resolution, #2 is Old Town at 8,214 px but at blue hour.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Shutterstock | Old Town Square: the splash fountain and outdoor dining, June 2024 | zimmytws | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 2470619517](https://www.shutterstock.com/image-photo/fountain-outdoor-dining-downtown-fort-collins-2470619517) |
| 2 | Adobe Stock | Old Town at blue hour (twilight) | Chris | Standard | 8214×5476 | 1 credit | [Adobe 223903080](https://stock.adobe.com/images/old-town-fort-collins-at-blue-hour/223903080) |
| 3 | Adobe Stock | Street-level downtown in summer | Schrodington, LLC | Standard | 5151×3434 | 1 credit | [Adobe 419314122](https://stock.adobe.com/images/downtown-fort-collins-colorado/419314122) |

**Do not use** Adobe 1136668052 ("Skyline View of Fort Collins Downtown"): labelled Generated with AI. Also seen: iStock 1353104730, the Linden Street Italianate storefronts with cafés, is exactly the brief but editorial-only (3,770 px, $33); iStock 1154898207 (Chris LaBasco, standard, $12) is 3,000 px, borderline; the RiverNorthPhotography Old Town scenes on iStock (458360813, 1157840789) and all the Shutterstock Old Town Square shots are editorial. Adobe 469144791 (Boomsma, autumn aerial, 5,462 px, standard) is fine if you'd rather an aerial. Visit Fort Collins has [no self-serve library](https://www.visitftcollins.com/about/media); photos on request, no terms stated.

### Evergreen

**Pick:** the iStock Lake House on Evergreen Lake with its reflection: the in-town landmark, standard licence, 5,548 px. It's a 2012 upload shot at dusk, so check it isn't too dark for the band; the 2024 dam photo (#2) is the fresher standard-licence alternative. No standard-licence daylight photo of the downtown storefront row exists on any reachable site.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | The Lake House on Evergreen Lake reflected at dusk (captioned "Mountain Lodge in Evergreen Colorado, part of the public park area") | beklaus | Standard | 5548×3698 | $33 (3 credits) | [iStock 165799923](https://www.istockphoto.com/photo/mountain-lodge-reflecting-in-lake-at-dusk-gm165799923-20746767) |
| 2 | Shutterstock | The Evergreen dam on Evergreen Lake, May 2024 | Faina Gurevich | Standard | Not shown | $29 for a 2-image pack | [Shutterstock 2461897959](https://www.shutterstock.com/image-photo/beautiful-evergreen-dam-on-lake-colorado-2461897959) |
| 3 | Shutterstock | Main Street's businesses in the old buildings, 1 September 2025 | Stillgravity | **Editorial only** | Not shown | $29 for a 2-image pack | [Shutterstock 2673847181](https://www.shutterstock.com/image-photo/evergreen-colorado-usa-sept-1-2025-2673847181) |

**Do not use** Adobe 1317862297 (an aerial with the lake and golf course): labelled Generated with AI. Also seen: Shutterstock 2739701613 (downtown in winter, February 2026) is editorial; iStock 1140217051 (standard, $12, 4,608 px) is the lake footbridge with no town in it; Adobe's downtown results are drone video clips. The own-shot version: the south side of Main Street by the Bear Creek bridge, from the north sidewalk, mid-morning.

### Nederland

**Pick:** the iStock drone frame of the town beside Barker Reservoir with the Front Range behind: August 2025, 5,760 px, standard licence, labelled non-AI. The same shoot has an ultra-wide panorama (#3) that would suit the short band.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | Nederland beside Barker Reservoir, Front Range peaks in the distance, August 2025 | Alex Potemkin | Standard, non-AI | 5760×3240 | $33 (3 credits) | [iStock 2227443413](https://www.istockphoto.com/photo/nederland-town-nestled-beside-barker-reservoir-with-front-range-peaks-visible-in-gm2227443413-643314092) |
| 2 | Adobe Stock | Nederland across Barker Reservoir in summer | F&J McGinn | Standard | 4878×3251 | 1 credit | [Adobe 88076179](https://stock.adobe.com/images/evocative-view-of-nederland-colorado-across-barker-reservoir/88076179) |
| 3 | iStock | Ultra-wide aerial panorama of the town, lake and Continental Divide, same shoot as #1 | Alex Potemkin | Standard | 7746×2746 | $33 (3 credits) | [iStock 2227443400](https://www.istockphoto.com/photo/town-nestled-in-valley-beside-lake-with-continental-divide-peaks-nederland-community-gm2227443400-643314033) |

Also seen: iStock 2227443513 (same series, standard) as a fourth option; Adobe 182213187 (bwolski, sunset, 4,822 px) and Adobe 1886045428 (Dylan, snow-covered town aerial, fisheye) as standard alternatives. iStock 505981463 (downtown with the old train car, July 2014) and Shutterstock 2719532799 / 4216138115 are editorial. Nothing of the Mining Museum or the Carousel of Happiness on any reachable site. The Netherlands pollution is real on every site; all three candidates are captioned Nederland, Boulder County.

### Elizabeth

**Pick:** keep the current Commons hero unless you're willing to pay Getty rates. There is no downtown Elizabeth photo on iStock, Adobe or Shutterstock at all (turkeys, pronghorn, a map, and 2008 Stampede rodeo shots with cowboys as the subject). The only real finds are two July 2025 royalty-free Getty frames by one photographer, and Getty's single-image price is about $499 without a subscription.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Getty Images (Moment) | Historic downtown Elizabeth: brick buildings and colourful storefronts, with a classic Jeep, 29 July 2025 | Larry Braun | Royalty-free, creative (not editorial) | 6583×4386 | Sign in to see; Getty's list price for one image is $499 | [Getty 2237885808](https://www.gettyimages.com/detail/photo/historic-downtown-elizabeth-colorado-with-classic-royalty-free-image/2237885808) |
| 2 | Getty Images (Moment) | Main Street with parked cars and the small-town buildings, overcast, 29 July 2025 | Larry Braun | Royalty-free, creative | 5542×3683 | As above | [Getty 2229946949](https://www.gettyimages.com/detail/photo/street-scene-downtown-elizabeth-colorado-royalty-free-image/2229946949) |

Two is all that exists. The photographer sells direct at larrybraunphotography.com, which may be far cheaper than Getty for a web licence; worth an email. Otherwise the own shot: the false-front row on the north side of Main Street (CO 86) around the 1907 First National Bank, from the south sidewalk looking north-west, mid-morning, ideally Stampede weekend in early June for the bunting.

### Mountain towns

### Estes Park

**Pick:** the iStock downtown shot with the Continental Divide behind it: 5,472 px, standard licence, and it is Elkhorn Avenue rather than the park. The Pexels panorama is a free fallback of the same idea.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | iStock | Downtown Estes Park storefronts with Longs Peak, Hallett and Flattop behind, snow on the peaks | milehightraveler | Standard, commercial OK (Premium tier) | 5472×3648 | $33 (3 credits), or $7 on the 10/month plan | [iStock 2199686673](https://www.istockphoto.com/photo/downtown-estes-park-colorado-and-snowy-rocky-mountain-national-park-gm2199686673-620262849) |
| 2 | Adobe Stock | Aerial of Elkhorn Avenue in fall colour | Josh-Lehew | Standard | 4024×2260 | 1 credit | [Adobe 2151219980](https://stock.adobe.com/images/aerial-view-of-elkhorn-avenue-in-downtown-estes-park/2151219980) |
| 3 | Pexels | Panorama of the town in its valley with the mountains behind; location tagged Estes Park | Demian Tejeda-Benitez | Pexels licence: free, commercial OK, no credit required | 5472×3648 | Free | [Pexels 9067501](https://www.pexels.com/photo/green-trees-and-mountain-ranges-under-blue-sky-9067501/) |

Also seen: Shutterstock 1184521150 (Jillian Cain, downtown shopping district, 2018, standard) as a backup; Pexels 7489377 (Andrew Patrick, town with Lake Estes, 4327 px, free) as a second free option. Unsplash's Estes Park results are all park scenery with no town in them. Visit Estes Park keeps a [media folder on Brandfolder](https://brandfolder.com/visitestespark/media_trade) with no terms stated; contact press@visitestespark.com before using anything from it.

### Grand Lake

*Retired 30 October 2026 (DECISIONS.md, "Grand Lake retired"); kept here in case it reopens.*

**Pick:** the Shutterstock autumn aerial of the village with the lake and shoreline in frame. It is the only clean-licence shot of the town itself; every street-level Grand Avenue and boardwalk photo found is editorial-only.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Shutterstock | Aerial of the town of Grand Lake in autumn, lake and shoreline in frame | Jacob Boomsma | Standard | Not shown on the page; confirm before buying | $29 for a 2-image pack ($14.50 each) | [Shutterstock 2855458091](https://www.shutterstock.com/image-photo/aerial-view-tourist-mountain-town-autumn-2855458091) |
| 2 | Shutterstock | Street-level town scene, Grand Avenue | Steven Phraner | Standard on Shutterstock (the same photographer's near-identical iStock frame is editorial-only) | Not shown | $29 for a 2-image pack | [Shutterstock 2683013705](https://www.shutterstock.com/image-photo/town-grand-lake-colorado-tourist-destination-2683013705) |
| 3 | iStock | Grand Avenue entering the town, September 2022 | pabradyphoto | **Editorial only**: not for the hero of an ad-supported site | 6159×4108 | $12 | [iStock 1498503646](https://www.istockphoto.com/photo/road-into-the-town-of-grand-lake-colorado-gm1498503646-520062012) |

Also seen: the boardwalk shots (iStock 2276366028, Shutterstock 2781430579) are portrait or editorial, and Adobe 1571885769 carries an editorial restriction. Boomsma has sibling aerials at Shutterstock 1918181558 and 2855458077 if the first crops badly. On iStock, search "grand lake colorado town"; the plain search returns a lagoon in Bolivia. Visit Grand County runs an [image library](https://images.visitgrandcounty.com/) that covers Grand Lake, with a login and terms of use not shown on the landing page (info@visitgrandcounty.com).

### Clear Creek (Idaho Springs / Georgetown)

**Pick:** the Adobe winter aerial of downtown Idaho Springs (#2): standard licence, 5,462 px, the town grid between the canyon walls. The 8,256 px storefront frame (#1) is bigger but its tags are generic ("italy, europa, palace"), so open the preview and confirm it is Miner Street before paying.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock | Historic downtown Idaho Springs storefronts (one of a series: 1450842483, 1450845249, 1450840206, 1450843714, 1450843584) | mark | Standard | 8256×5504 | 1 credit | [Adobe 1450842615](https://stock.adobe.com/images/idaho-springs-colorado-historic-downtown/1450842615) |
| 2 | Adobe Stock | Aerial of downtown Idaho Springs in winter, Clear Creek canyon walls either side | Jacob Boomsma | Standard | 5462×3639 | 1 credit | [Adobe 413103868](https://stock.adobe.com/images/aerial-view-of-downtown-idaho-springs-colorado-in-winter/413103868) |
| 3 | Adobe Stock | Georgetown in its valley from the Guanella Pass road overlook, peaks behind (a Georgetown hero if the guide ever splits) | JoseA | Standard | 6000×4000 | 1 credit | [Adobe 311480574](https://stock.adobe.com/images/georgetown-colorado-from-an-overlook-in-guanella-pass-road/311480574) |

Also seen: Shutterstock 2607119149 (Kristi Blokhin, winter skyline with mountains, standard) and 2613062843 (Danica Chang, 6th Street Georgetown brick storefronts, standard) are sound backups. Most Shutterstock Miner Street scenes (2032832183, 1645379158, 2587230339) are editorial. iStock's "idaho springs colorado" search returns Lava Hot Springs, Idaho, and the water wheel; skip it. Some Adobe results are mis-tagged "Idaho Falls, Colorado".

### Leadville

**Pick:** the Adobe aerial straight down Harrison Avenue with the mining-town grid and the mountains: 5,272 px, standard licence (the caption carries a date but the page shows no editorial restriction).

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock | Aerial down Harrison Avenue, October 2023, the town grid and the Sawatch behind | spiritofamerica | Standard | 5272×2962 | 1 credit | [Adobe 1111460584](https://stock.adobe.com/images/october-2-2023-leadville-co-aerial-view-down-main-street-historic-leadville-colorado-mining-town/1111460584) |
| 2 | Adobe Stock | Leadville skyline | chapin31 | Standard | 4380×2680 | 1 credit | [Adobe 163677857](https://stock.adobe.com/images/leadville-colorado-skyline/163677857) |
| 3 | iStock | Historic Leadville with snow on Mount Massive behind | SWKrullImaging | Standard (Basic) | 3072×2048, a 2007 upload and the smallest here | $12 | [iStock 172373011](https://www.istockphoto.com/photo/historic-leadville-colorado-gm172373011-5180470) |

Also seen: Shutterstock 2409622177 (Jacob Boomsma, autumn aerial, standard, 2024) and Adobe 704621653 are strong alternatives if you'd rather buy there. iStock 495910564 (Harrison Avenue in summer, chapin31) is editorial-only, as are most Shutterstock storefront shots (the Delaware Hotel, the Silver Dollar, the Golden Burro). Pexels has mountains only.

### Manitou Springs

**Pick:** the Adobe aerial of downtown Manitou, the Manitou Avenue corridor with the red-rock foothills: 5,460 px, standard licence. Every street-level Manitou Avenue shot with Pikes Peak behind it is editorial-only.

| # | Source | What it shows | Photographer | Licence | Max size | Price | Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Adobe Stock | Aerial of downtown Manitou Springs (siblings: 404406365, 357963080, 357963161, 404406535) | Jacob Boomsma | Standard | 5460×3636 | 1 credit | [Adobe 357829842](https://stock.adobe.com/images/aerial-view-of-downtown-manitou-springs/357829842) |
| 2 | iStock | Manitou Avenue shops, "gateway to Pikes Peak", September 2015 | Craig McCausland | **Editorial only** | 5000×3312 | $33 | [iStock 614414440](https://www.istockphoto.com/photo/town-of-manitou-springs-colorado-gm614414440-106450869) |
| 3 | Shutterstock | Main street of Manitou, May 2025 | Ceri Breeze | **Editorial only** (the page says a separate commercial licence "may be available") | Not shown | $29 for a 2-image pack | [Shutterstock 2700251601](https://www.shutterstock.com/image-photo/scenic-view-main-street-manitou-springs-2700251601) |

Also seen: Shutterstock 2530835189 (Sadie H, standard) is portrait; Adobe 1075861192 is a night shot; iStock 875448008 and Shutterstock 2683132633 / 2770573477 are editorial. Pexels has the red rocks and no downtown. No public photo library found for Visit Manitou Springs.

### What to buy, and what to shoot

About $190 covers every town that has a photo worth buying. The cheapest route is one month of each site's plan rather than single images:

| Site | Buy | Covers | Cost |
| --- | --- | --- | --- |
| iStock | Premium plan, 10 images for one month | Estes Park, Golden, Longmont, Nederland, Berthoud (editorial), Evergreen; four downloads spare | $70 |
| Adobe Stock | 5 credits (the 5-credit pack, price shown at checkout) or one month of the 10-credit plan | Lyons, Loveland, Leadville, Manitou Springs, Idaho Springs | $30 to $50 |
| Shutterstock | Three 2-image packs, or one month of the 10-image plan if it's sold without the annual commitment | Grand Lake, Fort Collins, Erie (editorial), Frederick (editorial), Niwot (editorial), Windsor schoolhouse (editorial, optional) | $87 |
| Free | Download and credit | Windsor Town Hall (Commons, CC BY-SA), Estes Park panorama (Pexels) | $0 |

On the editorial picks (Berthoud, Erie, Frederick, Niwot): the site's own rules allow a paid editorial licence of a real photo of the real place. The licence bars advertising and promotional use and retouching; cropping and the band's CSS overlay are fine, and the share image is still editorial use. Don't put those four into sponsored posts or printed cards.

**Nothing to buy:** Johnstown, Timnath and Elizabeth have no usable photo on any source (Elizabeth has two Getty frames at $499 each; the photographer sells direct at larrybraunphotography.com and may be far cheaper). Niwot has editorial frames only. Each section above names the shot: Parish Avenue north from 1st, Old Town Main Street north from the Beerwerks, Main Street Elizabeth from the south sidewalk, Second Avenue east from Cottonwood Square. The first three plus Berthoud, Windsor Main Street and the Loveland Rialto sit on one 90-mile Saturday-morning loop from Niwot.

**AI-generated results to avoid**, all labelled on the asset page: Adobe 1007823010 (Longmont), 1136668052 (Fort Collins), 1317862297 (Evergreen), 929099990 / 1345814384 / 993478403 (Windsor), 1100798504 (Lyons, unlabelled but reads generated). The repo's rule already keeps these out; the search results don't.

**Not checked from here:** Wikimedia Commons, Flickr, Alamy, Dreamstime and Openverse all refuse this environment's fetches, so the free column is thin. The repo's own notes say the Commons categories for these towns were already picked over for heroes, so the loss is small; the Commons files named in the Loveland, Longmont and Lyons sections are the ones worth a two-minute look in a browser.
