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
