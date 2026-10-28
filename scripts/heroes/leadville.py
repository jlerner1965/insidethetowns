"""Leadville hero, ink and watercolour, 2400 x 1000, in the Lyons style.

The silver city on an autumn morning, a composition from the guide's own
photographs. Behind it the range over Turquoise Lake, Galena and Wildcat
Mountains with their bare rust-coloured tops, traced from the hero
photograph (hero.jpg, taken from the mine dumps above town), the lake in
the valley and the lodgepole forest on the flats; the white church spire
above the roofs, from the same photograph. Along Harrison Avenue: the
railroad depot on East 7th Street with its shingled roof and half-timbered
gable (leadville-railroad-depot.jpg); the Delaware Block with its white
cornice and copper-capped corner (harrison-avenue-at-seventh-street.jpg);
the Silver Dollar Saloon's board false front, dated 1879, with its plank
porch and wagon wheels, and the brick block beside it
(silver-dollar-saloon.jpg); the Tabor Opera House with its name across the
front and its bare brick side wall (tabor-opera-house.jpg); the avenue's
black lamp posts (both Harrison Avenue photographs). In front, the Matchless
Mine's raked timber headframe, hoist house, board cabin and ore cart on a
dump (matchless-mine.jpg), and the paved Mineral Belt Trail through
lodgepoles and sage (mineral-belt-trail.jpg, whose bare summit carries the
dusting of snow used on the highest tops here), among gold aspens.
The ridge right of the photograph's frame (x 2000 on) is generic filler.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(11)

# --- Sky, with the morning's cumulus over the range.
sky()
for cx, cy, s in [(250, 130, 60), (900, 92, 46), (1500, 150, 72), (2150, 100, 52), (620, 262, 30), (1880, 250, 32)]:
    cloud(cx, cy, s)


def conifer_d(x, base, h, w=0.22):
    """A lodgepole or spruce: a narrow ragged spire; its outline and its lit (left) half."""
    n = max(4, int(h / 8)); step = h * 0.88 / n
    left, right = [], []
    for i in range(n):
        y = base - h * 0.1 - i * step; r = w * h * 0.5 * (1 - i / n) + 1.5
        left += [(x - r * random.uniform(0.85, 1.15), y), (x - r * 0.4, y - step * 0.55)]
        right += [(x + r * random.uniform(0.85, 1.15), y), (x + r * 0.4, y - step * 0.55)]
    return poly(left + [(x, base - h)] + list(reversed(right))), poly(left + [(x, base - h), (x, base - h * 0.1)])

def conifer(x, base, h, w=0.22, col="#2F4E3B", lit="#6F8F5A", op=0.92, inked=True):
    full, half = conifer_d(x, base, h, w)
    wash(full, col, op, "wcs")
    wash(half, lit, 0.4, "wcs", g=True)
    if inked:
        ink(line([(x, base), (x, base - h * 0.16)]), 1.3, 0.7)


def aspen(x, base, h, col=None):
    """An aspen in its autumn gold, with a pale trunk."""
    col = col or random.choice(["#EDB532", "#E9A92E", "#F1C043", "#EDB532"])
    ink(line([(x, base), (x + jit(2), base - h * 0.4)]), 2.6, 0.95, color="#EEE7DA")
    for k in range(3):
        ty = base - random.uniform(0.05, 0.3) * h
        ink(line([(x - 1.5, ty), (x + 1.5, ty)]), 0.9, 0.55)
    blobs = [(0, -0.64, 0.2, 0.32), (-0.13, -0.52, 0.13, 0.18), (0.13, -0.56, 0.12, 0.2), (0.02, -0.84, 0.12, 0.14)]
    d = " ".join(f"M{x + dx * h - rx * h:.1f},{base + dy * h:.1f} a{rx * h:.1f},{ry * h:.1f} 0 1,0 {2 * rx * h:.1f},0 a{rx * h:.1f},{ry * h:.1f} 0 1,0 {-2 * rx * h:.1f},0 Z" for dx, dy, rx, ry in blobs)
    wash(d, col, 0.92, "wc2")
    wash(f"M{x + h * 0.04:.0f},{base - h * 0.95:.0f} C{x + h * 0.3:.0f},{base - h * 0.8:.0f} {x + h * 0.28:.0f},{base - h * 0.4:.0f} {x + h * 0.05:.0f},{base - h * 0.34:.0f} C{x + h * 0.12:.0f},{base - h * 0.55:.0f} {x + h * 0.1:.0f},{base - h * 0.8:.0f} {x + h * 0.04:.0f},{base - h * 0.95:.0f} Z", "#D06A1E", 0.45, "wcs", g=True)
    ink(line([(x, base - h * 0.36), (x - h * 0.06, base - h * 0.6)]), 1.2, 0.6)


def sage(x, y, r=9):
    wash(f"M{x - r:.0f},{y:.0f} a{r},{r * 0.6:.0f} 0 1,0 {2 * r},0 a{r},{r * 0.6:.0f} 0 1,0 {-2 * r},0 Z", random.choice(["#8E9A80", "#9DA58A", "#A3A38C"]), 0.8, "wcs", g=True)
    ink(line([(x - r * 0.5, y + 3), (x - r * 0.2, y - r * 0.5)]), 0.8, 0.35)


# --- The range over Turquoise Lake, traced from the hero photograph: its
# crop from y 380 of the 1920-wide frame, x * 1.25 less 400, y * 1.1 from 314.
def T(pts): return [(1.25 * x - 400, 314 + 1.1 * y) for x, y in pts]
INKSCALE = 0.55
far = T([(320, 96), (380, 100), (450, 100), (540, 88), (580, 84), (640, 88), (700, 96), (760, 100), (820, 108), (850, 110), (900, 96), (960, 88),
         (1010, 84), (1060, 90), (1110, 100), (1130, 104), (1180, 90), (1220, 85), (1270, 92), (1330, 80), (1380, 68), (1420, 68), (1460, 76),
         (1520, 80), (1600, 66), (1680, 58), (1760, 50), (1840, 30), (1880, 18), (1920, 10)]) + [(2060, 332), (2150, 344), (2260, 362), (2400, 382)]
wash(ridge_d(far), "#B2A3B6", 0.82, "wc3")
# The bare tops above timberline, rust and grey, as the photograph shows them.
for a, b, dep, col, op in [(-60, 640, 110, "#C4927A", 0.5), (560, 1080, 110, "#C99A80", 0.45), (1060, 1780, 110, "#C4927A", 0.45),
                           (1640, 2460, 120, "#BE8C78", 0.5), (300, 900, 60, "#968CA6", 0.25), (1400, 2100, 70, "#968CA6", 0.25)]:
    xs = list(range(a, b + 1, 12))
    top = [(x, interp(far, x) - 3) for x in xs]
    bot = [(x, interp(far, x) + 4 + dep * math.sin(math.pi * (x - a) / (b - a)) ** 0.7 * (0.86 + 0.14 * math.sin(x / 61 + a))) for x in reversed(xs)]
    wash(poly(top + bot), col, op, "wc2", g=True)
for i in range(46):   # gullies and pale rock on the bare tops
    x = random.uniform(80, 2380); y0 = interp(far, x) + random.uniform(10, 44)
    ink(line([(x, y0), (x - 7, y0 + 18)]), 0.9, 0.28)
for i in range(14):
    x = random.uniform(500, 2300); y0 = interp(far, x) + random.uniform(20, 50)
    add(f'<path d="M{x:.0f},{y0:.0f} l-10,22" stroke="#F2E9DA" stroke-width="3" stroke-linecap="round" opacity="0.5" filter="url(#wcs)"/>')
for px, w, dep in [(1990, 56, 12), (1600, 34, 8), (1460, 30, 7)]:   # the first dusting of snow
    py = interp(far, px)
    d = f"M{px - w / 2:.0f},{py + dep:.0f} L{px - w * 0.15:.0f},{py + 2:.0f} L{px + w * 0.2:.0f},{py + 2:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.15:.0f},{py + dep * 0.5:.0f} L{px:.0f},{py + dep:.0f} Z"
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.85" filter="url(#wcs)"/>')
ink(open_path(far), 1.4, 0.55)
# Timber on the far slopes, blue-green with distance, with a ragged timberline.
mid0 = T([(320, 150), (450, 140), (560, 150), (640, 160), (720, 172), (800, 182), (880, 200), (960, 214), (1000, 192), (1060, 170), (1130, 152),
          (1200, 140), (1300, 124), (1400, 112), (1500, 106), (1600, 100), (1700, 92), (1800, 86), (1920, 80)]) + [(2100, 412), (2250, 422), (2400, 432)]
mid = [(x, interp(mid0, x) + jit(5) + (8 if random.random() < 0.2 else 0)) for x in range(0, 2401, 16)]
wash(ridge_d(mid), "#738B84", 0.82, "wc3")
for i in range(46):
    x = random.uniform(0, 2400); y = interp(mid, x) + random.uniform(6, 44)
    r = random.uniform(10, 20)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.45:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.45:.0f} 0 1,0 {-2 * r:.0f},0 Z", "#566F68", 0.4, "wcs", g=True)
ink(open_path(mid), 1.0, 0.35)
# The near forested hills that come down to the lake from either side.
nearL = T([(320, 112), (420, 108), (450, 110), (500, 118), (560, 130), (640, 160), (720, 190), (800, 215), (870, 240), (930, 262)])
wash(ridge_d(nearL), "#58735B", 0.9, "wc1")
nearR = T([(900, 262), (960, 240), (1050, 200), (1150, 176), (1250, 160), (1350, 150), (1500, 136), (1650, 122), (1800, 110), (1920, 100)]) + [(2150, 426), (2400, 432)]
wash(ridge_d(nearR), "#647C60", 0.9, "wc1")
for cx, cy, rx, ry in [(260, 520, 280, 46), (1480, 500, 300, 40), (2150, 476, 220, 30)]:   # cloud shadows across the slopes
    wash(f"M{cx - rx},{cy} a{rx},{ry} 0 1,0 {2 * rx},0 a{rx},{ry} 0 1,0 {-2 * rx},0 Z", "#3F4F62", 0.2, "wc3", g=True)
for i in range(60):   # timber texture on the near slopes
    x = random.uniform(0, 2400); hill = nearL if x < 800 else nearR
    y = interp(hill, x) + random.uniform(10, 90)
    if y < 600: wash(f"M{x - 7:.0f},{y:.0f} a7,4 0 1,0 14,0 a7,4 0 1,0 -14,0 Z", "#3E5A46", 0.4, "wcs", g=True)
ink(open_path(nearL), 1.4, 0.55); ink(open_path(nearR), 1.4, 0.55)

# Turquoise Lake in the valley between them.
lake_top = T([(852, 244), (900, 240), (1000, 243), (1100, 247), (1200, 252), (1300, 257), (1388, 264)])
lake_bot = T([(1388, 264), (1340, 270), (1250, 273), (1150, 271), (1050, 266), (950, 258), (870, 250), (852, 244)])
wash(open_path(lake_top) + " L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in lake_bot) + " Z", "#7299B4", 0.92, "wc2")
wash(open_path(lake_top) + " L" + " L".join(f"{x:.1f},{y + (y - 584) * -0.5:.1f}" for x, y in lake_bot) + " Z", "#C9DDE8", 0.45, "wcs", g=True)
for i in range(10):
    x = random.uniform(760, 1260); y = interp(lake_top, x) + random.uniform(6, 20)
    add(f'<path d="M{x:.0f},{y:.0f} q18,-2 36,0" stroke="#FBF7EE" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.75"/>')
ink(open_path(lake_bot[::-1]), 1.2, 0.5)

# --- The lodgepole forest on the flats between the lake and town.
INKSCALE = 0.8
ftop = [(0, 616), (400, 612), (800, 620), (1200, 612), (1600, 618), (2000, 610), (2400, 616)]
wash(ridge_d(ftop), "#3E5A46", 0.92, "wc1")
spikes = []
for x in range(-10, 2412, 8):
    y = interp(ftop, x) + 6; hh = random.uniform(12, 30); r = hh * 0.16
    spikes.append(f"M{x - r:.1f},{y:.1f} L{x:.1f},{y - hh:.1f} L{x + r:.1f},{y:.1f} Z")
wash(" ".join(spikes), "#2F4A3A", 0.9, "wcs")
wash(poly([(0, 618), (2400, 618), (2400, 640), (0, 646)]), "#7E9A5E", 0.22, "wc3", g=True)   # morning sun on the near edge

# --- The ground of town and the flats in front of it.
floor = [(0, 668), (600, 662), (1200, 672), (1800, 664), (2400, 670)]
wash(ridge_d(floor), "#A99D68", 0.88, "wc3")
for y0, col in [(700, "#8F8C5E"), (770, "#9A8C5A")]:
    wash(f"M0,{y0} C700,{y0 - 10} 1500,{y0 + 8} 2400,{y0 - 6} L2400,{y0 + 50} C1500,{y0 + 60} 700,{y0 + 42} 0,{y0 + 54} Z", col, 0.3, "wc3", g=True)

# Gold aspens and dark spruce through town, behind Harrison Avenue.
for x in range(1150, 2420, 46):
    if random.random() < 0.45: conifer(x + jit(10), 702 + jit(6), random.uniform(80, 120), w=0.26)
    else: aspen(x + jit(12), 700 + jit(6), random.uniform(80, 110))
# And across the flats on the left, where the type sits on a desktop: lodgepole
# forest with groves of aspen in it, kept deep in tone.
def woods(x0, x1, base0, hmin, hmax, step, grove=0.22, col="#2F4E3B"):
    """A row of forest: its conifers washed together, its aspen groves one by one."""
    x, full, half, groves = x0, [], [], []
    while x < x1:
        if random.random() < grove:
            n = random.randint(3, 5)
            groves += [(x + k * 15 + jit(4), base0 + jit(6), random.uniform(hmin, hmax) * 0.8) for k in range(n)]
            x += n * 15 + 6
        else:
            f, hf = conifer_d(x + jit(5), base0 + jit(8), random.uniform(hmin, hmax), w=0.25)
            full.append(f); half.append(hf)
            x += step + jit(4)
    wash(" ".join(full), col, 0.92, "wc2")
    wash(" ".join(half), "#6F8F5A", 0.4, "wcs", g=True)
    for gx, gb, gh in groves:
        aspen(gx, gb, gh)
woods(-20, 1180, 682, 40, 70, 15, col="#33533D")
woods(-30, 1185, 716, 60, 96, 19, col="#2F4E3B")
woods(-30, 1185, 754, 80, 124, 23, col="#2A4636")

# The white spire above the roofs, as the hero photograph shows it.
def spire(x):
    tw = 30
    wash(poly([(x, B), (x, B - 150), (x + tw, B - 150), (x + tw, B)]), "#A8553F", 0.92, "wcs")
    wash(poly([(x + tw * 0.6, B), (x + tw * 0.6, B - 150), (x + tw, B - 150), (x + tw, B)]), STONE_D, 0.3, "wcs", g=True)
    for wy in (B - 140, B - 110):
        wash(f"M{x + 9},{wy + 20} L{x + 9},{wy + 6} a6,6 0 0,1 12,0 L{x + 21},{wy + 20} Z", WIN, 0.8, "wcs", g=True)
    ink(poly([(x, B), (x, B - 150), (x + tw, B - 150), (x + tw, B)]), 1.6)
    sp = [(x - 3, B - 150), (x + tw / 2, B - 268), (x + tw + 3, B - 150)]
    add(f'<path d="{poly(sp)}" fill="#FBF8F2" opacity="0.95" filter="url(#wcs)"/>')
    wash(poly([(x + tw / 2, B - 268), (x + tw + 3, B - 150), (x + tw / 2 + 2, B - 150)]), "#9AA3C6", 0.4, "wcs", g=True)
    ink(poly(sp), 1.5, 0.8)
    for k in (0, 1):   # pinnacles at the foot of the spire
        px = x - 3 + k * (tw + 6)
        ink(line([(px, B - 150), (px, B - 162)]), 1.2, 0.7)

B = 712
spire(1462)

# --- Harrison Avenue, base y 712.
INKSCALE = 0.85
CREAM, GREEN_D = "#F4EEE2", "#2F4F45"

def hooded(wx, wy, ww, wh, arch=True, glass=WIN, hood=True):
    """A tall window, round-headed or square, under a white hood."""
    if arch:
        d = f"M{wx},{wy + wh} L{wx},{wy + ww / 2} a{ww / 2},{ww / 2} 0 0,1 {ww},0 L{wx + ww},{wy + wh} Z"
        dd = f"M{wx - 3},{wy + wh + 3} L{wx - 3},{wy + ww / 2} a{ww / 2 + 3},{ww / 2 + 3} 0 0,1 {ww + 6},0 L{wx + ww + 3},{wy + wh + 3} Z"
    else:
        d = poly([(wx, wy + wh), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh)])
        dd = poly([(wx - 3, wy + wh + 3), (wx - 3, wy - 3), (wx + ww + 3, wy - 3), (wx + ww + 3, wy + wh + 3)])
    add(f'<path d="{dd}" fill="{PAPER}"/>')
    wash(d, glass, 0.85, "wcs", g=True)
    ink(dd, 1.0, 0.65)
    if hood:
        hy = wy - 3 if not arch else wy + ww / 2 - 3
        hd = (f"M{wx - 6},{hy} " + (f"a{ww / 2 + 6},{ww / 2 + 6} 0 0,1 {ww + 12},0 l0,-4 a{ww / 2 + 6},{ww / 2 + 8} 0 0,0 {-ww - 12},0 Z" if arch else f"L{wx + ww + 6},{hy} L{wx + ww + 4},{hy - 6} L{wx - 4},{hy - 6} Z"))
        add(f'<path d="{hd}" fill="{CREAM}" opacity="0.95"/>')
        ink(hd, 0.9, 0.6)

def white_cornice(a, b, y, depth=16, step=9):
    cor = poly([(a, y - depth + 6), (b, y - depth + 6), (b, y + 6), (a, y + 6)])
    add(f'<path d="{cor}" fill="{CREAM}"/>')
    wash(poly([(a, y), (b, y), (b, y + 6), (a, y + 6)]), "#9C93A0", 0.45, "wcs", g=True)
    ink(cor, 1.2, 0.7)
    for k in range(int((b - a - 6) / step)):
        bx = a + 5 + k * step
        ink(line([(bx, y + 6), (bx, y - 1)]), 0.9, 0.5)

def depot(x):
    """The depot on East 7th Street: red brick, a hipped roof of grey shingles, a
    half-timbered red gable over the bay, two chimneys, cream arched windows."""
    w, h = 244, 64
    walls = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(walls, "#B44A36", 0.93, "wcs")
    wash(poly([(x + w * 0.62, B - h), (x + w, B - h), (x + w, B), (x + w * 0.62, B)]), STONE_D, 0.25, "wcs", g=True)
    wash(poly([(x, B), (x, B - 10), (x + w, B - 10), (x + w, B)]), "#9C9284", 0.8, "wcs", g=True)   # sandstone footing
    coursing(x, B - h + 6, x + w, B - 10, step=10)
    # chimneys, behind the roof
    for cx in (x + w * 0.33, x + w * 0.72):
        ch = poly([(cx, B - h - 20), (cx, B - h - 74), (cx + 14, B - h - 74), (cx + 14, B - h - 20)])
        wash(ch, "#B8473A", 0.95, "wcs"); ink(ch, 1.3)
        ink(line([(cx - 2, B - h - 74), (cx + 16, B - h - 74)]), 1.6, 0.8)
    roof = poly([(x - 16, B - h + 4), (x + 46, B - h - 44), (x + w - 46, B - h - 44), (x + w + 16, B - h + 4)])
    wash(roof, "#77716C", 0.93, "wcs")
    wash(poly([(x + w * 0.5, B - h - 44), (x + w - 46, B - h - 44), (x + w + 16, B - h + 4), (x + w * 0.5, B - h + 4)]), "#4E4A55", 0.25, "wcs", g=True)
    for k, y in enumerate(range(B - h - 38, B - h, 7)):   # shingle courses
        t = (y - (B - h - 44)) / 48
        a, b = x + 46 - 62 * t, x + w - 46 + 62 * t
        for sx in range(int(a + 4 + (k % 2) * 5), int(b - 4), 11):
            ink(line([(sx, y), (sx, y + 5)]), 0.6, 0.3)
    ink(roof, 1.6, 0.85)
    ink(line([(x - 16, B - h + 4), (x + w + 16, B - h + 4)]), 2.2, 0.85, color="#2F3F3C")   # the dark green fascia
    # the gable over the bay
    gx, gw = x + w * 0.34, 56
    gwall = poly([(gx, B - h + 2), (gx, B - h - 24), (gx + gw, B - h - 24), (gx + gw, B - h + 2)])
    gab = poly([(gx - 6, B - h - 22), (gx + gw / 2, B - h - 62), (gx + gw + 6, B - h - 22)])
    wash(gwall, "#B23A33", 0.95, "wcs"); wash(gab, "#B23A33", 0.95, "wcs")
    for k in range(int(gw / 6)):   # scalloped shingles on the bay face
        ink(f"M{gx + 2 + k * 6},{B - h - 4} a3,3 0 0,0 6,0", 0.6, 0.4)
    trimmed(gx + 12, B - h - 18, 32, 14, "#5B6470")
    ink(gwall, 1.3)
    ink(line([(gx - 8, B - h - 20), (gx + gw / 2, B - h - 64), (gx + gw + 8, B - h - 20)]), 2.4, 0.9, color="#2F4A40")   # green bargeboards
    ink(line([(gx + gw / 2, B - h - 60), (gx + gw / 2, B - h - 24)]), 1.4, 0.85, color="#2F4A40")   # half-timbering
    ink(line([(gx + gw / 2, B - h - 38), (gx + 6, B - h - 26)]), 1.2, 0.8, color="#2F4A40")
    ink(line([(gx + gw / 2, B - h - 38), (gx + gw - 6, B - h - 26)]), 1.2, 0.8, color="#2F4A40")
    ink(line([(gx - 6, B - h - 22), (gx + gw + 6, B - h - 22)]), 1.4, 0.85, color="#2F4A40")
    # windows and doors
    for wx in (x + 40, x + 72, gx + 6, gx + 30, x + 150, x + 190, x + 214):
        hooded(wx, B - h + 14, 18, 36, arch=False, glass="#4A4752", hood=False)
        ink(f"M{wx - 3},{B - h + 12} q{12},-6 24,0", 1.0, 0.6)
    for dx, col in [(x + 12, "#A82E2C"), (x + 172, "#8A5236")]:
        door = poly([(dx, B - 10), (dx, B - h + 12), (dx + 16, B - h + 12), (dx + 16, B - 10)])
        wash(door, col, 0.92, "wcs"); ink(door, 1.2)
    ink(walls, 2.0)
    return x + w

def delaware(x):
    """The Delaware Block: red brick, white hoods over paired windows, a white
    cornice and the corner bay with its name and copper mansard cap."""
    w, h = 176, 166
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, "#B0533C", 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - h + 6, x + w, B - 50, step=10)
    bx0, bw = x + w - 86, 86
    cap = poly([(bx0 - 2, B - h - 30), (bx0 + 14, B - h - 66), (bx0 + bw - 14, B - h - 66), (bx0 + bw + 2, B - h - 30)])
    wash(cap, "#B98257", 0.93, "wcs")
    for k in range(1, 7):
        ink(line([(bx0 + k * bw / 7, B - h - 32), (bx0 + 10 + k * (bw - 20) / 7, B - h - 64)]), 0.7, 0.4)
    ink(cap, 1.4)
    bay = poly([(bx0, B - h + 2), (bx0, B - h - 30), (bx0 + bw, B - h - 30), (bx0 + bw, B - h + 2)])
    add(f'<path d="{bay}" fill="{CREAM}"/>'); ink(bay, 1.3, 0.75)
    add(f'<text x="{bx0 + bw / 2}" y="{B - h - 11}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="8" font-weight="bold" letter-spacing="0.3" fill="#6B3B2E" opacity="0.9">DELAWARE BLOCK</text>')
    white_cornice(x - 5, x + w + 5, B - h)
    for row_y in (B - h + 22, B - h + 74):
        for wx in (x + 10, x + 30, x + 56, bx0 + 18, bx0 + 42):
            hooded(wx, row_y, 15, 40, arch=False, hood=False)
        for wa, wb in [(x + 10, x + 45), (x + 56, x + 71), (bx0 + 18, bx0 + 57)]:   # one white hood over each pair
            hd = f"M{wa - 6},{row_y - 4} Q{(wa + wb) / 2},{row_y - 16} {wb + 6},{row_y - 4} L{wb + 6},{row_y - 9} Q{(wa + wb) / 2},{row_y - 21} {wa - 6},{row_y - 9} Z"
            add(f'<path d="{hd}" fill="{CREAM}"/>'); ink(hd, 0.9, 0.6)
    # the dark green shopfront
    sf = poly([(x, B), (x, B - 50), (x + w, B - 50), (x + w, B)])
    wash(sf, GREEN_D, 0.88, "wcs")
    ink(line([(x - 3, B - 50), (x + w + 3, B - 50)]), 2.0, 0.8)
    for wx in range(int(x + 8), int(x + w - 20), 28):
        wash(poly([(wx, B - 6), (wx, B - 42), (wx + 20, B - 42), (wx + 20, B - 6)]), "#9DB2B4", 0.5, "wcs", g=True)
        ink(poly([(wx, B - 6), (wx, B - 42), (wx + 20, B - 42), (wx + 20, B - 6)]), 0.9, 0.55)
    ink(body, 2.0)
    return x + w

def saloon(x):
    """The Silver Dollar Saloon: a false front of dark boards, a green cornice
    with red bands and rosettes, its name in white, 1879, a plank porch."""
    w, h = 124, 152
    front = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(front, "#5A4334", 0.95, "wcs")
    for k in range(int(w / 6)):
        ink(line([(x + 3 + k * 6, B - h + 24), (x + 3 + k * 6 + jit(0.5), B - 52)]), 0.6, 0.3, color="#2E221B")
    for px in (x, x + w - 7):   # the red corner boards
        wash(poly([(px, B - 52), (px, B - h + 20), (px + 7, B - h + 20), (px + 7, B - 52)]), "#C4513F", 0.9, "wcs", g=True)
    cor = poly([(x - 4, B - h - 4), (x + w + 4, B - h - 4), (x + w + 4, B - h + 22), (x - 4, B - h + 22)])
    wash(cor, "#3E9670", 0.92, "wcs")
    wash(poly([(x - 4, B - h - 4), (x + w + 4, B - h - 4), (x + w + 4, B - h + 2), (x - 4, B - h + 2)]), "#C4513F", 0.9, "wcs", g=True)
    wash(poly([(x - 4, B - h + 17), (x + w + 4, B - h + 17), (x + w + 4, B - h + 22), (x - 4, B - h + 22)]), "#C4513F", 0.9, "wcs", g=True)
    for k in range(9):
        rx = x + 8 + k * 13.5
        add(f'<circle cx="{rx:.1f}" cy="{B - h + 10}" r="4" fill="{CREAM}" opacity="0.9"/>')
        add(f'<circle cx="{rx:.1f}" cy="{B - h + 10}" r="1.8" fill="#2F6E52" opacity="0.9"/>')
    ink(cor, 1.3, 0.8)
    add(f'<text x="{x + w / 2}" y="{B - h + 44}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="15" font-style="italic" font-weight="bold" fill="{CREAM}" opacity="0.95">Silver Dollar</text>')
    add(f'<text x="{x + w / 2}" y="{B - h + 66}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="19" font-weight="bold" fill="{CREAM}" opacity="0.95">Saloon</text>')
    for wx in (x + 12, x + 38, x + 64, x + 90):   # red-trimmed upper windows
        fr = poly([(wx - 3, B - 58), (wx - 3, B - 82), (wx + 21, B - 82), (wx + 21, B - 58)])
        wash(fr, "#C4513F", 0.9, "wcs")
        add(f'<rect x="{wx}" y="{B - 79}" width="18" height="18" fill="{PAPER}"/>')
        wash(poly([(wx + 2, B - 63), (wx + 2, B - 77), (wx + 16, B - 77), (wx + 16, B - 63)]), "#4A4752", 0.7, "wcs", g=True)
        ink(fr, 1.0, 0.7)
    add(f'<text x="{x + w / 2}" y="{B - 49}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="8" font-weight="bold" fill="#E06A55">1 8 7 9</text>')
    # the plank porch on its posts, the wagon wheels
    wash(poly([(x, B), (x, B - 40), (x + w, B - 40), (x + w, B)]), "#3A2E28", 0.7, "wcs", g=True)
    roof = poly([(x - 8, B - 40), (x, B - 54), (x + w, B - 54), (x + w + 8, B - 40)])
    wash(roof, "#CDBB98", 0.93, "wcs")
    for k in range(int(w / 9)):
        ink(line([(x + 2 + k * 9, B - 53), (x - 4 + k * 9.6, B - 41)]), 0.6, 0.4)
    ink(roof, 1.3)
    wash(poly([(x - 8, B - 40), (x + w + 8, B - 40), (x + w + 8, B - 34), (x - 8, B - 34)]), "#C4513F", 0.92, "wcs")
    for px in (x + 2, x + 40, x + 78, x + w - 8):
        post = poly([(px, B), (px, B - 34), (px + 6, B - 34), (px + 6, B)])
        wash(post, "#8A7058", 0.95, "wcs"); ink(post, 0.9, 0.7)
    for cx in (x + 22, x + w - 22):
        ink(f"M{cx - 11},{B - 12} a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0", 1.4, 0.85, color="#D9C7A8")
        for a in range(0, 180, 30):
            ink(line([(cx + 11 * math.cos(math.radians(a)), B - 12 + 11 * math.sin(math.radians(a))), (cx - 11 * math.cos(math.radians(a)), B - 12 - 11 * math.sin(math.radians(a)))]), 0.8, 0.7, color="#D9C7A8")
    ink(front, 2.0)
    return x + w

def opera(x):
    """The Tabor Opera House: a red front with a grey-painted bay, a white
    bracketed cornice and small pediment, round-headed windows, its name across
    the front, the tall flagpole, and the bare brick side wall to the south."""
    w, h, sw = 176, 182, 80
    side = poly([(x + w, B), (x + w, B - h + 2), (x + w + sw, B - h + 12), (x + w + sw, B)])
    wash(side, "#C9774E", 0.93, "wcs")
    wash(side, "#7A6E86", 0.18, "wcs", g=True)
    coursing(x + w, B - h + 16, x + w + sw, B - 6, step=10)
    for row_y, hh in [(B - h + 34, 30), (B - h + 104, 34)]:
        for k in range(3):
            wx = x + w + 10 + k * 24
            d = f"M{wx},{row_y + hh} L{wx},{row_y + 6} a6,6 0 0,1 12,0 L{wx + 12},{row_y + hh} Z"
            wash(d, "#3E3A40", 0.85, "wcs", g=True); ink(d, 0.9, 0.6)
    add(f'<text x="{x + w + sw / 2}" y="{B - 46}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="12" font-style="italic" font-weight="bold" fill="#F1E2C6" opacity="0.7" textLength="{sw - 12}">Dry Climate</text>')
    ink(line([(x + w, B - h + 2), (x + w + sw, B - h + 12)]), 2.4, 0.8, color="#5C5660")
    ink(side, 1.8)
    front = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(front, "#B23C2F", 0.94, "wcs")
    wash(poly([(x + 62, B - 56), (x + 62, B - 92), (x + w, B - 92), (x + w, B - 56)]), "#8E929C", 0.5, "wcs", g=True)   # the grey paint
    coursing(x, B - h + 10, x + w, B - 60, step=10)
    # flagpole, then the cornice and its pediment
    ink(line([(x + 76, B - h - 30), (x + 76, B - h - 150)]), 1.6, 0.85)
    add(f'<circle cx="{x + 76}" cy="{B - h - 152}" r="3.5" fill="#E9E1D2" stroke="{INK}" stroke-width="1" opacity="0.9"/>')
    ped = poly([(x + 34, B - h - 8), (x + 76, B - h - 32), (x + 118, B - h - 8)])
    add(f'<path d="{ped}" fill="{CREAM}"/>')
    wash(poly([(x + 48, B - h - 10), (x + 76, B - h - 26), (x + 104, B - h - 10)]), "#9C93A0", 0.4, "wcs", g=True)
    ink(ped, 1.3, 0.75)
    white_cornice(x - 6, x + w + 4, B - h, depth=18, step=10)
    # windows: the upper row narrow, the lower row tall and round-headed
    for wx, ww in [(x + 10, 11), (x + 28, 11), (x + 46, 11), (x + 68, 16), (x + 100, 12), (x + 126, 12), (x + 152, 12)]:
        hooded(wx, B - h + 20, ww, 30, hood=False)
        ink(f"M{wx - 5},{B - h + 20 + ww / 2} a{ww / 2 + 5},{ww / 2 + 5} 0 0,1 {ww + 10},0", 1.6, 0.8, color=CREAM)
    for wx, ww in [(x + 10, 12), (x + 28, 12), (x + 46, 12), (x + 68, 20), (x + 98, 16), (x + 124, 16), (x + 150, 16)]:
        hooded(wx, B - 98, ww, 40, hood=False)
        ink(f"M{wx - 5},{B - 98 + ww / 2} a{ww / 2 + 5},{ww / 2 + 5} 0 0,1 {ww + 10},0", 1.8, 0.85, color=CREAM)
    for word, tx, ty in [("TABOR", x + 30, B - 106), ("OPERA", x + 88, B - 110), ("HOUSE", x + 146, B - 114)]:
        add(f'<text x="{tx}" y="{ty}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="0.5" fill="{CREAM}" opacity="0.95">{word}</text>')
    # the shopfronts, the balcony over the door and the arched entrance
    wash(poly([(x, B - 50), (x, B - 58), (x + w, B - 58), (x + w, B - 50)]), "#6B2A2A", 0.9, "wcs", g=True)
    sf = poly([(x, B), (x, B - 50), (x + w, B - 50), (x + w, B)])
    wash(sf, "#3D4A40", 0.85, "wcs")
    for wx in (x + 6, x + 34, x + 112, x + 142):
        wash(poly([(wx, B - 4), (wx, B - 42), (wx + 24, B - 42), (wx + 24, B - 4)]), "#9DB2B4", 0.45, "wcs", g=True)
        ink(poly([(wx, B - 4), (wx, B - 42), (wx + 24, B - 42), (wx + 24, B - 4)]), 0.9, 0.6)
    door = f"M{x + 70},{B} L{x + 70},{B - 30} a14,14 0 0,1 28,0 L{x + 98},{B} Z"
    wash(door, "#6E3A2E", 0.92, "wcs"); ink(door, 1.3)
    ink(line([(x + 62, B - 58), (x + 106, B - 58)]), 1.6, 0.85)
    for bx in range(x + 64, x + 106, 5):
        ink(line([(bx, B - 58), (bx, B - 66)]), 0.7, 0.6)
    ink(line([(x + 62, B - 66), (x + 106, B - 66)]), 1.2, 0.8)
    ink(front, 2.1)
    return x + w + sw

def lamp(lx):
    ink(line([(lx, B + 24), (lx, B - 62)]), 2.4, 0.9, color="#2B2A2E")
    lan = poly([(lx - 6, B - 62), (lx - 8, B - 78), (lx + 8, B - 78), (lx + 6, B - 62)])
    add(f'<path d="{lan}" fill="#F6EBD2"/>'); ink(lan, 1.4, 0.9, color="#2B2A2E")
    ink(line([(lx - 9, B - 79), (lx, B - 86), (lx + 9, B - 79)]), 1.6, 0.9, color="#2B2A2E")

wash(poly([(1196, B - 2), (1470, B - 2), (1476, B + 14), (1190, B + 14)]), "#B5AA98", 0.85, "wcs")   # the depot's gravel
wash(poly([(1490, B - 4), (2180, B - 4), (2196, B + 30), (1478, B + 30)]), "#CBBFAA", 0.82, "wcs")   # the avenue
ink(line([(1478, B + 30), (2196, B + 30)]), 1.4, 0.55)
xx = depot(1212)
xx = delaware(1508) + 4
xx = brick_block(xx, 104, 124, "#B2553E", None, cornice="#C24B3B", arched=True) + 4
xx = saloon(xx) + 8
xx = opera(xx)
wash(poly([(1490, B + 2), (2180, B + 2), (2186, B + 14), (1484, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1500, 1690, 1918):
    lamp(lx)
aspen(1484, B + 14, 96)

# Below the avenue, the lower town's aspens and spruce, kept low so the
# shopfronts show over them.
x = 1190
while x < 2420:
    base = random.choice([780, 792, 804]) + jit(4); hh = random.uniform(34, 62)
    if random.random() < 0.55: aspen(x, base, hh * 0.95)
    else: conifer(x, base, min(hh, base - 724), w=0.27)
    x += random.uniform(14, 40)

# --- The Matchless Mine on its dump: the hoist house with the tin roof, the
# board cabin and the timber headframe, and an ore cart.
INKSCALE = 1.1
dumpR = [(1250, 1000), (1420, 905), (1650, 840), (1900, 812), (2150, 800), (2400, 796)]
wash("M1250,1000 " + smooth(dumpR) + " L2400,1000 Z", "#A27A5C", 0.92, "wc1")
wash("M1560,1000 C1760,950 2060,930 2400,925 L2400,1000 Z", "#7A5444", 0.3, "wc3", g=True)
for i in range(170):   # waste rock
    x = random.uniform(1280, 2400); y = interp(dumpR, x) + random.uniform(6, 170)
    if y > 995: continue
    r = random.uniform(2, 6) * (0.7 + (y - 800) / 400)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.6:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.6:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#6E4E3E", "#8A6A58", "#5E5458", "#B08A6A"]), 0.75, "wcs", g=True)
for i in range(60):
    x = random.uniform(1300, 2400); y0 = interp(dumpR, x) + random.uniform(10, 150)
    if y0 < 990: ink(line([(x, y0), (x - 8, y0 + 18)]), 0.9, 0.3)
ink(open_path(dumpR), 1.8, 0.7)

def matchless(x, base):
    timber, lit = "#6E4A32", "#B08458"
    # the hoist house behind, long and low, under corrugated iron
    hx0, hx1 = x - 150, x + 110
    walls = poly([(hx0, base - 4), (hx0, base - 46), (hx1, base - 46), (hx1, base - 4)])
    wash(walls, "#7C573C", 0.93, "wcs")
    for k in range(int((hx1 - hx0) / 7)):
        ink(line([(hx0 + 3 + k * 7, base - 44), (hx0 + 3 + k * 7, base - 6)]), 0.6, 0.35)
    roof = poly([(hx0 - 10, base - 44), (hx0 + 18, base - 76), (hx1 - 4, base - 76), (hx1 + 10, base - 44)])
    wash(roof, "#A7A8AC", 0.93, "wcs")
    for k in range(int((hx1 - hx0) / 6)):
        ink(line([(hx0 + 16 + k * 6, base - 75), (hx0 - 6 + k * 6.3, base - 45)]), 0.6, 0.4)
    ink(walls, 1.5); ink(roof, 1.5)
    # the board cabin, to the left
    cx0 = x - 250; cb = base - 20
    cab = poly([(cx0, cb), (cx0, cb - 62), (cx0 + 34, cb - 92), (cx0 + 68, cb - 62), (cx0 + 68, cb)])
    wash(cab, "#7A5034", 0.94, "wcs")
    wash(poly([(cx0 + 34, cb - 92), (cx0 + 68, cb - 62), (cx0 + 68, cb), (cx0 + 44, cb)]), "#4A2E22", 0.3, "wcs", g=True)
    for k in range(10):
        ink(line([(cx0 + 4 + k * 6.5, cb - 2), (cx0 + 4 + k * 6.5, cb - 60 - (30 - abs(34 - (4 + k * 6.5)) * 0.88))]), 0.6, 0.4)
    ink(line([(cx0 - 6, cb - 58), (cx0 + 34, cb - 96), (cx0 + 74, cb - 58)]), 2.0, 0.9)
    trimmed(cx0 + 10, cb - 54, 22, 18, "#D8CDB8")
    ink(cab, 1.6)
    # the headframe
    def timber_d(x1, y1, x2, y2, t=4):
        L = math.hypot(x2 - x1, y2 - y1); nx, ny = -(y2 - y1) / L * t, (x2 - x1) / L * t
        return poly([(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)])
    beams = [(x - 62, base, x - 28, base - 212, 5), (x + 36, base, x + 30, base - 212, 5),      # the raked post and the upright one
             (x - 38, base - 212, x + 40, base - 212, 6), (x - 32, base - 250, x + 34, base - 250, 5),   # cap and crown
             (x - 26, base - 250, x - 26, base - 212, 3), (x + 26, base - 250, x + 26, base - 212, 3),
             (x - 38, base - 150, x + 32, base - 150, 4), (x - 50, base - 80, x + 34, base - 80, 4),
             (x - 38, base - 150, x + 34, base - 80, 3), (x + 32, base - 150, x - 50, base - 80, 3)]
    for x1, y1, x2, y2, t in beams:
        d = timber_d(x1, y1, x2, y2, t)
        wash(d, timber, 0.95, "wcs")
        ink(d, 1.0, 0.75)
    for x1, y1, x2, y2, t in beams[:2]:   # light on the posts' left faces
        wash(timber_d(x1 - t * 0.5, y1, x2 - t * 0.5, y2, t * 0.45), lit, 0.6, "wcs", g=True)
    add(f'<circle cx="{x}" cy="{base - 232}" r="12" fill="none" stroke="#3A2A20" stroke-width="2.4" opacity="0.85"/>')   # the sheave
    ink(line([(x, base - 232), (x, base - 150)]), 0.9, 0.6)
    for k in range(12):   # the ladder up the left post
        yy = base - 10 - k * 16
        xl = x - 62 + (k * 16 + 10) / 212 * 34
        ink(line([(xl - 10, yy), (xl - 2, yy)]), 1.0, 0.7)
    ink(line([(x - 72, base), (x - 42, base - 196)]), 1.0, 0.7)
    # the timber frame at its foot, with the planked chute leaning on it
    for x1, y1, x2, y2, t in [(x + 16, base, x + 16, base - 70, 3), (x + 72, base, x + 72, base - 70, 3),
                              (x + 10, base - 70, x + 78, base - 70, 3.5), (x + 12, base - 30, x + 76, base - 30, 2.5)]:
        d = timber_d(x1, y1, x2, y2, t); wash(d, timber, 0.95, "wcs"); ink(d, 1.0, 0.75)
    chute = poly([(x + 22, base - 66), (x + 104, base - 24), (x + 98, base - 12), (x + 18, base - 52)])
    wash(chute, "#A88A64", 0.93, "wcs")
    for k in range(1, 6):
        ink(line([(x + 22 + k * 15, base - 64 + k * 7.6), (x + 18 + k * 15, base - 50 + k * 7.6)]), 0.6, 0.45)
    ink(chute, 1.2)
    # an ore cart on its rails, in front of the hoist house
    cx1 = x - 150; cy1 = base + 30
    ink(line([(cx1 - 50, cy1 + 8), (x - 46, cy1 + 4)]), 1.4, 0.7); ink(line([(cx1 - 50, cy1 + 14), (x - 46, cy1 + 10)]), 1.2, 0.6)
    cart = poly([(cx1 + 6, cy1), (cx1, cy1 - 24), (cx1 + 58, cy1 - 26), (cx1 + 52, cy1 - 1)])
    wash(cart, "#9A5236", 0.94, "wcs")
    wash(poly([(cx1 + 2, cy1 - 16), (cx1 + 56, cy1 - 17), (cx1 + 54, cy1 - 10), (cx1 + 4, cy1 - 9)]), "#5E3022", 0.3, "wcs", g=True)
    for k in range(5):
        wash(f"M{cx1 + 8 + k * 10},{cy1 - 25} a6,4 0 1,1 12,0 Z", random.choice(["#C99A3E", "#8A6A58", "#B08A6A"]), 0.9, "wcs", g=True)   # ore heaped in it
    ink(cart, 1.4)
    for wx in (cx1 + 14, cx1 + 42):
        add(f'<circle cx="{wx}" cy="{cy1 + 4}" r="6" fill="#3A3330"/>')

matchless(2236, 852)
for x, hh in [(1540, 130), (1610, 160), (2394, 150)]:
    conifer(x, interp(dumpR, x) + 30, hh, w=0.24)
for i in range(22):
    x = random.uniform(1380, 2380); y = interp(dumpR, x) + random.uniform(60, 150)
    if y < 990: sage(x, y, random.uniform(7, 12))

# --- The Mineral Belt Trail, paved, through lodgepoles and sage.
INKSCALE = 1.15
dumpL = [(0, 800), (200, 830), (420, 880), (620, 950), (760, 1000)]
wash("M0,800 " + smooth(dumpL) + " L0,1000 Z", "#7D5C4A", 0.92, "wc1")
wash("M0,930 C140,944 240,972 320,1000 L0,1000 Z", "#4A3430", 0.3, "wc3", g=True)
for i in range(70):
    x = random.uniform(0, 700); y = interp(dumpL, x) + random.uniform(6, 160)
    if y > 995: continue
    r = random.uniform(2, 5)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.6:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.6:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#5A4036", "#6E5448", "#4E464A"]), 0.75, "wcs", g=True)
ink(open_path(dumpL), 1.8, 0.7)
tl = [(1160, 1000), (1060, 920), (960, 860), (880, 818), (820, 792)]   # left edge, toward the trees
tr = [(1300, 1000), (1170, 922), (1040, 862), (930, 820), (852, 792)]
trail = "M" + f"{tl[0][0]},{tl[0][1]} " + smooth(tl) + f" L{tr[-1][0]},{tr[-1][1]} " + smooth(tr[::-1]) + " Z"
wash("M1150,1000 C1050,926 950,866 830,798 L812,804 C920,868 1020,934 1110,1000 Z", "#BCA982", 0.7, "wcs")   # the sandy shoulder
wash(trail, "#6C6A70", 0.92, "wc2")
wash("M1250,1000 C1140,930 1020,870 900,818 L870,820 C990,874 1110,936 1210,1000 Z", "#4E4C58", 0.3, "wcs", g=True)
tlx = [(p[1], p[0]) for p in tl[::-1]]; trx = [(p[1], p[0]) for p in tr[::-1]]   # x of each edge by y
for k in range(10):   # the centre line, dashed, shortening into the distance
    y = 990 - k * 20
    if y < 800: break
    yb = y - 9 + k * 0.4
    xa = (interp(tlx, y) + interp(trx, y)) / 2; xb = (interp(tlx, yb) + interp(trx, yb)) / 2
    add(f'<path d="M{xa:.1f},{y:.1f} L{xb:.1f},{yb:.1f}" stroke="#F4EFE6" stroke-width="{3 - k * 0.2:.1f}" stroke-linecap="round" opacity="0.85"/>')
ink(open_path(tl), 1.6, 0.7); ink(open_path(tr), 1.6, 0.7)
for i in range(46):   # sage along both sides
    y = random.uniform(800, 990)
    side = random.choice([-1, 1])
    xl = interp(tlx, y); xr = interp(trx, y)
    x = xl - random.uniform(14, 160) if side < 0 else xr + random.uniform(14, 120)
    sage(x, y, random.uniform(6, 12) * (0.6 + (y - 800) / 400))
for i in range(60):   # sage and rabbitbrush across the open flat
    x = random.uniform(240, 1240); y = random.uniform(780, 960)
    if interp(tlx, y) - 30 < x < interp(trx, y) + 30 or y > interp(dumpL, x) - 6: continue
    if random.random() < 0.7: sage(x, y, random.uniform(7, 12))
    else: wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", "#D6AE36", 0.7, "wcs", g=True)
for i in range(160):   # dry grass
    x = random.uniform(0, 2400); top = random.uniform(780, 995)
    if 1300 < x and top > interp(dumpR, x) - 4: continue
    L = random.uniform(8, 24)
    ink(line([(x, top + L), (x + jit(6), top)]), 0.9, 0.4)
# Lodgepoles where the trail goes into the trees, and the big pine at the left.
for x, base, hh in [(760, 806, 150), (700, 812, 120), (930, 800, 110), (640, 820, 170), (1000, 810, 90)]:
    conifer(x, base, hh, w=0.22)
for x, base, hh in [(70, 990, 330), (200, 1000, 250), (330, 1010, 200)]:
    conifer(x, base, hh, w=0.26)
aspen(470, 900, 150)
aspen(540, 930, 130)
aspen(1460, 960, 170)

finish(sys.argv[1])
