# Painted heroes

Each guide that has one shows an ink-and-watercolour painting of the town
as its home-page hero instead of a photograph (HOW-IT-WORKS.md, section 6).
The paintings are drawn in code: `wclib.py` holds the shared watercolour
machinery (SVG filters for bleeding edges, pigment and paper grain, a
wobbling sepia ink, and helpers for clouds, trees, buildings and rocks),
and each town's script composes its scene from the guide's own reference
photographs. Nothing is drawn from an image generator.

| Town | Script | What is in it |
|---|---|---|
| Lyons | `lyons.py` | The hill behind Main Street with its band of red sandstone, the red-capped ridge, the stone church, the 1881 depot, the sandstone storefronts, the St. Vrain |
| Niwot | `niwot.py` | Second Avenue's brick blocks and the Niwot Tribune, the railroad and caboose, the Front Range traced from the owner's own photo |
| Berthoud | `berthoud.py` | The Bimson Blacksmith Shop, Mountain Avenue storefronts, grain bins and a barn, Pioneer Park's pond, Longs Peak and Mount Meeker |
| Johnstown | `johnstown.py` | The Masonic Temple, the Parish House behind its iron fence, Town Hall's rotunda and flags, the street sign and lamp post at Charlotte and Fremont, the Brush Barn and a pumpjack in the fields, the Front Range and Longs Peak traced from the old hero photo |
| Erie | `erie.py` | Town Hall (the 1906 Lincoln School) with its cupola and the miners' memorial, the 1930 City Hall and its siren tower, the 1889 Davis Building and its neighbour on Briggs Street, Anderson Farms' barn and windmill, Coal Creek's footbridge, the Front Range traced from the Baseline Road photo |
| Elizabeth | `elizabeth.py` | Main Street's white crenellated block, the blue-roofed shop and false-front store, the 1907 First National Bank, the Huber-Carlson Building, Town Hall with its flag, the Elizabeth Stampede arena with its announcer's booth and grandstand, ponderosas on the prairie |
| Windsor | `windsor.py` | Windsor Lake from the trail with its red sandstone riprap, the Art & Heritage Center (the 1909 town hall), the Windsor Mill's white elevator, tower and brick mill, the tall stack and white elevator of the skyline, Main Park's gold and red trees, the Front Range with Longs Peak traced from the aerial |
| Golden | `golden.py` | South Table Mountain and Castle Rock, Mount Zion's M, North Table's basalt cliffs, the Welcome to Golden arch over Washington Avenue, the Old Capitol Grill block, The Rose and the bison, Guggenheim Hall's tower, Clear Creek's whitewater park |
| Timnath | `timnath.py` | The 1888 Presbyterian church with its belfry and the pine beside it, the buff-brick corner building, the garage-front building and the red-brick block on Main Street, the river under gold cottonwoods with a split-rail fence |
| Loveland | `loveland.py` | Lake Loveland and its cottonwoods, Fourth Street's red brick block, Henry's and the Rialto, the Colorado and Southern depot, the Devil's Backbone and its Keyhole, the Front Range traced from the guide's lake photo |
| Evergreen | `evergreen.py` | Evergreen Lake with the boardwalk and the log Lake House, the Highway 74 storefronts (the Little Bear, the green gabled building, the red cafe, the tin-roofed grey and green buildings) and the guardrail, timbered hills with a granite crown, blue peaks up the valley |
| Longmont | `longmont.py` | The Dickens Opera House and its red-brick neighbour on Main Street, the three-storey arched-window block across the intersection, buff- and red-brick storefronts, Left Hand Brewing's tasting room and white silos, McIntosh Lake and its cattails, Longs Peak and Mount Meeker traced from the guide's own photo |
| Leadville | `leadville.py` | The Tabor Opera House, the Silver Dollar Saloon, the Delaware Block, the railroad depot and a white church spire, the Matchless Mine's headframe on its dump, the Mineral Belt Trail, Turquoise Lake under the range's bare rust-coloured tops |
| Idaho Springs | `idaho-springs.py` | The wooded hillsides with granite outcrops and gold aspen, the Charlie Tayler waterwheel, Miner Street with Beau Jo's, the 1890 Hanchett Building and the tile-roofed Placer Inn building, the Argo Gold Mine and Mill stepping up its hill, Clear Creek |
| Fort Collins | `fortcollins.py` | Horsetooth Rock above the red-rimmed hogback, the Northern Hotel and its sign, the Old Town Square building and its star, the Opera House Block, the C&S Freight Depot, cottonwoods along the Poudre, a pond with reeds and a prairie trail |
| Grand Lake | `grand-lake.py` | The forested mountain rising from the lake with gold aspen stands, the bare summit at the head of the lake, the boathouses and docks, a green-roofed log cabin, Grand Avenue's boardwalk false fronts and flags, the log Kauffman House, Lakefront Park's beach and pedal boats |
| Nederland | `nederland.py` | Barker Reservoir under timbered hills with gold aspens, Eldora's ski runs and the snowy peaks of the Divide, the Mining Museum's Bucyrus steam shovel, Mountain People's Co-op and the Rustic Moose |
| Carbon Valley | `carbon-valley.py` | Frederick's stepped-parapet brick corner at Fifth and Oak, Firestone's former Town Hall with the mine car in its gable, the Carbon Valley Regional Library's rotunda, Fort Lupton's Ottesen Grain Co. mill, Bald Eagle Pond and the St. Vrain State Park sign |
| Estes Park | `estes-park.py` | West Elkhorn Avenue's storefronts and green lamp posts, the Stanley Hotel on its rise, the Big Thompson past the riverwalk into Lake Estes, Longs Peak with the Diamond and Mount Meeker, traced from the hero photo |
| Manitou Springs | `manitou-springs.py` | Manitou Avenue's brick storefronts and the cream block with its red cornice, Miramont Castle on the hill, the Cliff House, the 7 Minute Spring's pavilion and red sumac, the Incline, the red cog train on Pikes Peak's bare upper slopes |

## Making the image

The scripts are deterministic (each seeds its own random numbers), so the
same script always draws the same picture.

```sh
python3 scripts/heroes/niwot.py /tmp/niwot.svg
# Render with the Chromium that Playwright installs, 2400 x 1000 (Playwright
# is not a dependency of this repo; NODE_PATH points at a global install):
NODE_PATH=$(npm root -g) node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2400,height:1000}});await p.goto('file:///tmp/niwot.svg');await p.screenshot({path:'/tmp/niwot.png'});await b.close()})()"
node -e "require('sharp')('/tmp/niwot.png').jpeg({quality:84,mozjpeg:true}).toFile('content/niwot/images/hero-painted.jpg')"
```

The PNG step matters: the SVG filters are heavy and render differently from
browser to browser, so the site ships the rendered JPEG, not the SVG.

## Composing for the hero band

The hero crops the 2400 x 1000 picture differently by width, so a scene is
laid out for both:

- **Phone** (under 640 px): a band 208 px tall shows the full height and
  about 1,730 px of the width. `position` in the town's config chooses
  which part (`'85% 56%'` shows x 569 to 2,300).
- **Desktop**: the full width and a strip of the height, as little as 350
  px tall at 1,920 px wide. The vertical half of `position` places it; the
  town's buildings should stand between y 560 and 720.
- **The type** sits bottom left on a desktop, over roughly x 0 to 1,180. Keep
  the town to the right of that and let fields or hills fill the left.

`painted: true` in the town's `hero` config swaps the photograph's scrim and
colour wash for a soft shade behind the words only (`src/components/Hero.astro`).
