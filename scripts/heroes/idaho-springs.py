"""Idaho Springs hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Idaho Springs in the Clear Creek valley on an autumn morning, as a
composition, west on the left and east on the right: the steep wooded
hillsides with their pines, rock outcrops and gold aspen; the Charlie Tayler
waterwheel on its timber frame at the west end of town; Miner Street's
blocks, Beau Jo's cream-painted brick with its hooded windows, the 1890
Hanchett Building with its pediment and arched windows, the stucco and red
brick blocks with their bracketed cornices and the tile-roofed Placer Inn
building (Tommyknocker's, at 1401), and its double-globe lamps; and at the east end the red
Argo Gold Mine and Mill stepping up its hill above the tailings, with the
mining museum in front, the long ore shed and the timber tower. Clear Creek
runs in front. Reference photographs, all the guide's own
(content/idaho-springs/images/): hero.jpg and argo-mill.jpg (the mill and
its hill), miner-street.jpg and hanchett-building.jpg (Miner Street and its
lamps), beau-jos-pizza.jpg, water-wheel-park.jpg (the waterwheel), and
idaho-springs-public-library.jpg (the wooded hill behind downtown). No
photograph shows the creek itself, so it is painted plainly, with generic
boulders and willows.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(41)

# --- Sky and clouds, as in the others.
sky()
for cx, cy, s in [(330, 130, 58), (1040, 96, 42), (1660, 140, 66), (2230, 96, 44)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1290, 250, 11), (1328, 236, 8), (1362, 258, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- Far ridges up the valley, cool and hazy.
INKSCALE = 0.6
far1 = [(0, 392), (200, 362), (420, 384), (640, 346), (820, 372), (1000, 336), (1180, 366), (1360, 344), (1560, 374), (1800, 352), (2050, 380), (2400, 356)]
wash(ridge_d(far1), "#B9B4D0", 0.75, "wc3")
far2 = [(0, 452), (260, 428), (520, 446), (760, 412), (980, 438), (1200, 410), (1420, 440), (1640, 424), (1900, 446), (2400, 432)]
wash(ridge_d(far2), "#A5ABBE", 0.75, "wc3")
ink(open_path(far2[3:8]), 1.2, 0.35)

# Town-specific helpers.
def fir(x, base, h, col="#33533D", g=False):
    """A Douglas fir or spruce: a narrow cone in tiers, lit from the left."""
    w = h * 0.3
    right, left = [(x, base - h)], []
    for k in range(1, 5):
        yk = base - h * 0.12 - h * 0.86 * (1 - k / 4); wk = w * (0.3 + 0.7 * k / 4)
        right += [(x + wk + jit(1.5), yk), (x + wk * 0.45, yk - h * 0.05)]
        left += [(x - wk + jit(1.5), yk), (x - wk * 0.45, yk - h * 0.05)]
    right = right[:-1]; left = left[:-1]
    d = poly(right + [(x + 2, base - h * 0.1), (x - 2, base - h * 0.1)] + list(reversed(left)))
    wash(d, col, 0.9, "wcs", g=g)
    wash(poly([(x, base - h)] + left + [(x - 2, base - h * 0.1), (x, base - h * 0.1)]), "#7E9A62", 0.35, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.16)]), 1.2, 0.6)

def blob(x, y, rx, ry, col, op=0.8, g=True, f="wcs"):
    wash(f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z", col, op, f, g=g)

def aspens(x, y, w, h, n):
    """A grove of aspen gone gold on the hillside: narrow crowns run together in one wash, shaded on the right."""
    crowns = []
    for i in range(n):
        cx = x + w / 2 + max(-w / 2, min(w / 2, random.gauss(0, w / 5.5))); cy = y + h / 2 + max(-h / 2, min(h / 2, random.gauss(0, h / 5.5))); r = random.uniform(6, 10)
        crowns.append((cx, cy, r))
    d = " ".join(f"M{cx - r:.1f},{cy:.1f} a{r:.1f},{r * 1.6:.1f} 0 1,0 {2 * r:.1f},0 a{r:.1f},{r * 1.6:.1f} 0 1,0 {-2 * r:.1f},0 Z" for cx, cy, r in crowns)
    wash(d, random.choice(["#EDB03A", "#F1BA42", "#E9A93A"]), 0.9, "wc2")
    for cx, cy, r in crowns[::2]:
        blob(cx + r * 0.45, cy + r * 0.2, r * 0.5, r * 1.1, random.choice(["#C97A2A", "#D8902C"]), 0.45)
    for cx, cy, r in crowns[::4]:
        ink(line([(cx, cy + r * 1.6 + 8), (cx + jit(1), cy + r * 0.6)]), 0.8, 0.45)

def outcrop(x, y, w, h):
    """A face of the valley's brown-grey granite breaking through the timber: a jagged crest, dark joints, lit from the left."""
    prof = [0, 0.5, 0.62, 0.9, 0.96, 0.8, 0.88, 1.0, 0.72, 0.66, 0.4, 0.3, 0]   # stepped, steeper on the shaded side
    n = len(prof) - 1; top = []
    for k, f in enumerate(prof):
        fy = f if k in (0, n) else min(1, max(0.1, f + random.uniform(-0.1, 0.1)))
        top.append((x + w * k / n + (jit(w / n * 0.3) if 0 < k < n else 0), y + h * (1 - fy)))
    foot = [(x + w * 0.8, y + h + 4 + jit(3)), (x + w * 0.5, y + h + 8 + jit(3)), (x + w * 0.2, y + h + 4 + jit(3))]
    face = poly(top + foot)
    wash(face, random.choice(["#A88E78", "#AE937C", "#A08876"]), 0.9, "wc2")
    for k in range(int(w / 14)):   # dark joints running down the face
        sx = x + random.uniform(w * 0.1, w * 0.9); sy = interp(top, sx) + 2; L = random.uniform(0.4, 0.9) * (y + h - sy)
        wash(poly([(sx - 2, sy), (sx + 3, sy), (sx + 5 + jit(2), sy + L), (sx - 1, sy + L)]), "#5E4E58", 0.45, "wcs", g=True)
        if random.random() < 0.5: ink(line([(sx, sy + 2), (sx + 3, sy + L)]), 0.8, 0.45)
    peak = max(range(len(top)), key=lambda i: -top[i][1])
    wash(poly(top[peak:] + [(x + w * 0.62, y + h)]), "#6A5862", 0.3, "wcs", g=True)   # the shaded side
    wash(poly(top[:peak + 1] + [(x + w * 0.35, y + h)]), "#E8CFA4", 0.25, "wcs", g=True)   # the lit side
    ink(line(top[1:-1]), 1.2, 0.6)
    for i in range(int(w / 8)):   # scree below
        sx = x + random.uniform(0, w); sy = y + h + random.uniform(6, 28)
        ink(line([(sx, sy), (sx - 6, sy + 6)]), 0.8, 0.35)

def forest_mass(profile, x0, x1, top_off, depth, n, ylim):
    """The dark canopy of the timbered slopes, in mottled glazes with gaps of open ground."""
    for i in range(n):
        x = random.uniform(x0, x1); y = interp(profile, x) + top_off + random.uniform(0, depth)
        if y > ylim: continue
        blob(x, y, random.uniform(34, 70), random.uniform(14, 26), random.choice(["#5A7452", "#4B6A4C", "#6A8058", "#3F5E48"]), 0.3, f="wc3")

def forest(profile, x0, x1, top_off, depth, n, cols, hmin, hmax, ylim):
    """Timber on a slope: firs scattered down from the ridge line, small with distance."""
    for i in range(n):
        x = random.uniform(x0, x1); y = interp(profile, x) + top_off + random.uniform(0, depth)
        if y > ylim: continue
        fir(x, y, random.uniform(hmin, hmax), random.choice(cols), g=True)

# --- The north side of the valley, behind Miner Street, rising east to the Argo's hill.
INKSCALE = 0.75
north = [(700, 660), (860, 604), (1040, 552), (1200, 512), (1340, 486), (1460, 470), (1560, 452), (1660, 420), (1760, 396), (1860, 364),
         (1960, 330), (2040, 302), (2100, 288), (2160, 294), (2240, 302), (2320, 296), (2400, 306)]
wash(ridge_d(north), "#CDB06C", 0.9, "wc1")
wash(f"M2160,294 C2240,302 2320,296 2400,306 L2400,{H} L2200,{H} C2210,600 2190,420 2160,294 Z", "#8E7E9F", 0.3, "wc3", g=True)
forest_mass(north, 1000, 2400, 14, 240, 150, 660)
for i in range(70):   # dry grass and scree strokes between the trees
    x = random.uniform(1100, 2400); y0 = interp(north, x) + random.uniform(20, 260)
    if y0 < 660: ink(line([(x, y0), (x - 10, y0 + 14)]), 0.9, 0.25)
for x, y, w, h in [(2296, 344, 124, 76), (2318, 420, 90, 44), (1940, 330, 140, 56), (1600, 426, 110, 44), (1270, 496, 90, 34), (2150, 290, 90, 30)]:
    outcrop(x, y, w, h)
for x, y, w, h, n in [(1430, 480, 110, 50, 22), (1730, 420, 100, 60, 22), (1240, 540, 80, 40, 14)]:
    aspens(x, y, w, h, n)
forest(north, 1000, 2400, 6, 240, 190, ["#33533D", "#3F5E48", "#4B6A4C", "#5A7A55"], 20, 38, 660)
x = 1080   # firs along the skyline
while x < 2400:
    if random.random() < 0.2: x += random.uniform(30, 60); continue
    fir(x, interp(north, x) + 10, random.uniform(26, 46))
    x += random.uniform(14, 32)
ink(open_path(north[2:]), 2.0, 0.7)

# The Argo's tailings, pale fans of crushed rock below and beside the mill.
wash("M1850,520 C1920,504 2010,500 2080,510 L2110,712 L1810,712 C1830,640 1840,570 1850,520 Z", "#E2CB98", 0.92, "wc2")
wash("M2310,488 C2340,484 2380,492 2400,500 L2400,712 L2320,712 C2318,620 2314,540 2310,488 Z", "#E2CB98", 0.92, "wc2")
wash("M2318,600 C2350,590 2380,590 2400,596 L2400,712 L2324,712 Z", "#B49A76", 0.3, "wc2", g=True)
for i in range(90):
    x = random.choice([random.uniform(1840, 2100), random.uniform(2324, 2400)]); y = random.uniform(500, 700)
    ink(line([(x, y), (x - 8, y + 10)]), 0.8, 0.28)
for i in range(16):   # loose rock on the tailings
    x = random.uniform(2330, 2400); y = random.uniform(520, 700)
    blob(x, y, 5, 3, "#9C8470", 0.7)

# --- The hill across the west end of town, nearest and darkest.
INKSCALE = 0.85
west = [(0, 340), (90, 322), (180, 300), (260, 292), (330, 300), (400, 286), (470, 296), (560, 322), (650, 352), (740, 384), (820, 420),
        (900, 452), (980, 492), (1080, 540), (1200, 594), (1320, 650), (1440, 700)]
wash(ridge_d(west), "#C2A864", 0.92, "wc1")
wash(f"M470,296 C560,322 740,384 900,452 C1060,520 1200,594 1440,700 L1440,{H} L900,{H} C800,640 600,420 470,296 Z", "#8C7B9E", 0.35, "wc3", g=True)
forest_mass(west, 0, 1440, 16, 360, 300, 700)
wash("M90,322 C180,300 260,292 400,286 C360,380 300,480 240,600 L40,640 Z", "#E2BD72", 0.22, "wc3", g=True)   # morning light on the near flank
for x, y, w, h in [(500, 318, 170, 90), (230, 410, 120, 54), (830, 486, 130, 56), (60, 496, 100, 44), (1070, 566, 100, 40)]:
    outcrop(x, y, w, h)
for x, y, w, h, n in [(140, 370, 140, 70, 30), (700, 430, 130, 70, 28), (380, 540, 190, 80, 40), (950, 590, 150, 60, 28), (20, 600, 130, 60, 26), (360, 330, 90, 40, 14)]:
    aspens(x, y, w, h, n)
forest(west, 0, 1420, 8, 360, 330, ["#2F4D3A", "#33533D", "#3F5E48", "#4B6A4C", "#5A7A55"], 24, 44, 700)
x = 10   # firs and ponderosas along the skyline
while x < 1420:
    if random.random() < 0.15: x += random.uniform(30, 60); continue
    if random.random() < 0.35: ponderosa(x, interp(west, x) + 10, random.uniform(34, 52))
    else: fir(x, interp(west, x) + 12, random.uniform(34, 56))
    x += random.uniform(14, 30)
ink(open_path(west), 2.2, 0.8)

# --- The valley floor.
floor = [(0, 690), (600, 684), (1200, 694), (1800, 686), (2400, 692)]
wash(ridge_d(floor), "#BCA868", 0.88, "wc3")
wash("M0,700 C600,694 1200,706 2400,700 L2400,760 C1200,770 600,780 0,790 Z", "#8F8A55", 0.3, "wc3", g=True)
for x in range(-10, 1180, 66):   # spruce and gold cottonwoods along the creek at the west end
    fir(x + jit(20), 716 + jit(6), random.uniform(96, 130), random.choice(["#2F4D3A", "#33533D", "#3F5E48"]))
for x in range(-20, 1180, 82):
    cottonwood(x + jit(14), 728 + jit(6), random.uniform(34, 48), back=True, shadow=False)

# --- The Argo Gold Mine and Mill, red corrugated iron stepping up its hill.
MILL, MROOF, PANE = "#A9372E", "#BC4A3C", "#DAD5C8"
def panes(x0, x1, y0, y1):
    add(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{PAPER}"/>')
    wash(poly([(x0, y1), (x0, y0), (x1, y0), (x1, y1)]), PANE, 0.9, "wcs", g=True)
    for gx in range(int(x0) + 6, int(x1), 9):
        ink(line([(gx, y0), (gx, y1)]), 0.6, 0.45)
    ink(line([(x0, (y0 + y1) / 2), (x1, (y0 + y1) / 2)]), 0.5, 0.35)
    ink(poly([(x0, y1), (x0, y0), (x1, y0), (x1, y1)]), 1.0, 0.6)
def corrugate(x0, x1, y0, y1, step=6):
    for cx in range(int(x0) + 3, int(x1) - 2, step):
        ink(line([(cx, y0 + 2), (cx, y1 - 1)]), 0.5, 0.3)

def argo():
    # The long ore shed to the west: a red roof over dark timber bins.
    wash(poly([(1846, 556), (1846, 514), (2090, 504), (2090, 562)]), "#4A3A31", 0.88, "wcs")
    for k in range(18):
        sx = 1852 + k * 13
        ink(line([(sx, 514 - (sx - 1846) * 0.04), (sx, 558)]), 0.8, 0.5, color="#2E241E")
    ink(line([(1846, 536), (2090, 528)]), 1.0, 0.6, color="#2E241E")
    wash(poly([(1836, 518), (1848, 498), (2094, 488), (2100, 508)]), MROOF, 0.94, "wcs")
    ink(poly([(1836, 518), (1848, 498), (2094, 488), (2100, 508)]), 1.4, 0.8)
    wash(poly([(1860, 600), (1860, 560), (1990, 560), (1990, 600)]), MILL, 0.92, "wcs")   # the red building under the bins
    wash(poly([(1852, 566), (1862, 552), (1988, 552), (1996, 566)]), MROOF, 0.92, "wcs")
    ink(poly([(1860, 600), (1860, 560), (1990, 560), (1990, 600)]), 1.3, 0.75); corrugate(1860, 1990, 566, 600)
    # The timber tower and the water tank on its trestle.
    wash(poly([(2118, 600), (2118, 372), (2142, 368), (2142, 600)]), "#4E3B30", 0.92, "wcs")
    for y in range(384, 590, 22):
        ink(line([(2118, y), (2142, y + 18)]), 0.8, 0.5, color="#2E241E"); ink(line([(2142, y), (2118, y + 18)]), 0.8, 0.5, color="#2E241E")
    ink(poly([(2118, 600), (2118, 372), (2142, 368), (2142, 600)]), 1.3, 0.8)
    wash(poly([(2066, 516), (2066, 486), (2108, 486), (2108, 516)]), MILL, 0.94, "wcs")
    wash(poly([(2062, 488), (2070, 478), (2104, 478), (2112, 488)]), MROOF, 0.94, "wcs")
    ink(poly([(2066, 516), (2066, 486), (2108, 486), (2108, 516)]), 1.3, 0.8); corrugate(2066, 2108, 488, 516, 5)
    for lx in (2070, 2086, 2104):
        ink(line([(lx, 516), (lx + jit(1), 548)]), 1.2, 0.8)
    ink(line([(2070, 520), (2104, 544)]), 0.8, 0.6); ink(line([(2104, 520), (2070, 544)]), 0.8, 0.6)
    # Terraces down the hill: a band of windows, then a red roof, each wider and lower.
    for xl, xr, y in [(2070, 2318, 616), (2092, 2312, 570), (2112, 2304, 524), (2132, 2298, 478)]:
        wall = poly([(xl, y + 60), (xl, y + 22), (xr, y + 22), (xr, y + 60)])
        wash(wall, MILL, 0.94, "wcs")
        wash(poly([(xr - (xr - xl) * 0.25, y + 22), (xr, y + 22), (xr, y + 60), (xr - (xr - xl) * 0.25, y + 60)]), "#5E1E18", 0.3, "wcs", g=True)
        ink(wall, 1.5, 0.8)
        panes(xl + 16, xr - 14, y + 28, y + 40)
        roof = poly([(xl - 8, y + 24), (xl + 2, y), (xr - 2, y), (xr + 8, y + 24)])
        wash(roof, MROOF, 0.94, "wcs")
        wash(poly([(xl - 8, y + 24), (xr + 8, y + 24), (xr + 7, y + 20), (xl - 7, y + 20)]), "#6E221A", 0.45, "wcs", g=True)
        ink(roof, 1.4, 0.8)
    for bx, by in [(2240, 538), (2160, 586)]:   # the little boxes on the roofs
        wash(poly([(bx, by), (bx, by - 22), (bx + 24, by - 22), (bx + 24, by)]), MILL, 0.94, "wcs")
        ink(poly([(bx, by), (bx, by - 22), (bx + 24, by - 22), (bx + 24, by)]), 1.2, 0.8)
        panes(bx + 6, bx + 18, by - 16, by - 8)
    # The top of the mill with its name, as painted on it.
    wall = poly([(2150, 482), (2150, 398), (2290, 398), (2290, 482)])
    wash(wall, MILL, 0.95, "wcs")
    wash(poly([(2250, 398), (2290, 398), (2290, 482), (2250, 482)]), "#5E1E18", 0.25, "wcs", g=True)
    wash(poly([(2144, 400), (2154, 380), (2286, 380), (2296, 400)]), MROOF, 0.95, "wcs")
    ink(poly([(2144, 400), (2154, 380), (2286, 380), (2296, 400)]), 1.4, 0.85)
    ink(wall, 1.6, 0.85)
    add('<text x="2220" y="434" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="34" font-weight="bold" letter-spacing="5" fill="#EBD8A2" opacity="0.95" filter="url(#wcs)">ARGO</text>')
    panes(2164, 2276, 440, 452)
    add('<text x="2220" y="472" text-anchor="middle" font-family="Arial, DejaVu Sans, sans-serif" font-size="14.5" font-weight="bold" fill="#FBF7EE" opacity="0.95" filter="url(#wcs)">GOLD MINE &amp; MILL</text>')
    # The mining museum in front, at the road: a broad low roof with a monitor in the middle.
    walls = poly([(2014, 712), (2014, 664), (2318, 664), (2318, 712)])
    wash(walls, MILL, 0.95, "wcs")
    wash(poly([(2230, 664), (2318, 664), (2318, 712), (2230, 712)]), "#5E1E18", 0.25, "wcs", g=True)
    corrugate(2014, 2318, 668, 712)
    roof = poly([(2000, 668), (2140, 626), (2196, 626), (2332, 668)])
    wash(roof, MROOF, 0.95, "wcs")
    wash(poly([(2000, 668), (2332, 668), (2330, 662), (2004, 662)]), "#6E221A", 0.45, "wcs", g=True)
    ink(roof, 1.6, 0.85); ink(walls, 1.8, 0.85)
    mon = poly([(2148, 630), (2148, 608), (2170, 592), (2192, 608), (2192, 630)])
    wash(mon, MILL, 0.95, "wcs"); ink(mon, 1.3, 0.85)
    wash(poly([(2144, 610), (2170, 588), (2196, 610), (2192, 612), (2170, 594), (2148, 612)]), MROOF, 0.95, "wcs")
    for sx, sw in [(2128, 84), (2062, 44), (2246, 44)]:   # the museum's signs
        add(f'<rect x="{sx}" y="672" width="{sw}" height="11" fill="#F4F0E6" opacity="0.95" filter="url(#wcs)"/>')
        ink(poly([(sx, 683), (sx, 672), (sx + sw, 672), (sx + sw, 683)]), 0.9, 0.6)
        ink(line([(sx + 5, 677.5), (sx + sw - 5, 677.5)]), 0.9, 0.5, color="#5E1E18")
    for wx in (2030, 2086, 2232, 2280):
        panes(wx, wx + 26, 688, 700)
    wash(poly([(2150, 712), (2150, 690), (2186, 690), (2186, 712)]), "#3A2A26", 0.85, "wcs", g=True)   # the open door
    ink(poly([(2150, 712), (2150, 690), (2186, 690), (2186, 712)]), 1.2, 0.8)
argo()

# --- Miner Street, base at y 712, west to east as a facade elevation.
B = 712
CREAM = "#F4E9D3"
wash(poly([(1150, B - 4), (2340, B - 4), (2356, B + 26), (1134, B + 26)]), "#C9BCA6", 0.8, "wcs")   # sidewalk and street
ink(line([(1134, B + 26), (2356, B + 26)]), 1.4, 0.55)

def front(x, w, h, col):
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, col, 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.2, "wcs", g=True)
    return body
def bracketed(x, w, y, col, deep=16):
    """A bracketed Italianate cornice: a projecting band on scrolled brackets."""
    wash(poly([(x - 6, y - deep), (x + w + 6, y - deep), (x + w + 6, y), (x - 6, y)]), col, 0.92, "wcs")
    ink(poly([(x - 6, y - deep), (x + w + 6, y - deep), (x + w + 6, y), (x - 6, y)]), 1.3, 0.75)
    for k in range(int(w / 16) + 1):
        bx = x + 2 + k * (w - 4) / max(1, int(w / 16))
        wash(f"M{bx - 3:.0f},{y:.0f} l6,0 l-1,10 q-2,3 -4,0 Z", col, 0.95, "wcs", g=True)
        ink(f"M{bx - 3:.0f},{y:.0f} l0,8 q3,4 6,0 l0,-8", 0.8, 0.6)
    ink(line([(x - 6, y - deep + 5), (x + w + 6, y - deep + 5)]), 0.7, 0.5)
def storefronts(x, w, frame, glass="#5C5560", pil=None):
    wash(poly([(x + 6, B - 6), (x + 6, B - 48), (x + w - 6, B - 48), (x + w - 6, B - 6)]), glass, 0.6, "wcs", g=True)
    ink(poly([(x + 6, B - 6), (x + 6, B - 48), (x + w - 6, B - 48), (x + w - 6, B - 6)]), 1.2, 0.7)
    wash(poly([(x + 2, B - 48), (x + w - 2, B - 48), (x + w - 2, B - 56), (x + 2, B - 56)]), frame, 0.92, "wcs", g=True)
    ink(line([(x + 2, B - 56), (x + w - 2, B - 56)]), 1.1, 0.7)
    n = max(2, int(w / 30))
    for k in range(1, n):
        px = x + 6 + k * (w - 12) / n
        wash(poly([(px - 2.5, B - 4), (px - 2.5, B - 48), (px + 2.5, B - 48), (px + 2.5, B - 4)]), pil or frame, 0.95, "wcs", g=True)
        ink(line([(px, B - 4), (px, B - 48)]), 0.8, 0.55)
    ink(line([(x + 6, B - 34), (x + w - 6, B - 34)]), 0.7, 0.4)

def beau_jos(x):
    """Beau Jo's: cream-painted brick, maroon hoods over the upper windows, a corbelled top, ochre shopfronts."""
    w, h = 132, 128
    body = front(x, w, h, "#EFE2B4")
    wash(poly([(x - 2, B - h - 6), (x + w + 2, B - h - 6), (x + w + 2, B - h + 8), (x - 2, B - h + 8)]), "#B26E58", 0.9, "wcs", g=True)
    for k in range(int(w / 8)):   # the corbel table
        ink(line([(x + 4 + k * 8, B - h + 8), (x + 4 + k * 8, B - h + 14)]), 0.9, 0.55, color="#8E4A3A")
    ink(line([(x, B - h + 15), (x + w, B - h + 15)]), 0.8, 0.5)
    for wx in (x + 16, x + 56, x + 96):
        trimmed(wx, B - h + 30, 18, 32, "#4A4752")
        wash(f"M{wx - 7},{B - h + 30} l0,-6 q16,-9 32,0 l0,6 Z", "#9C4E3E", 0.92, "wcs", g=True)
        ink(f"M{wx - 7},{B - h + 30} l0,-6 q16,-9 32,0 l0,6", 1.0, 0.7)
    storefronts(x, w, "#D8AE48", pil="#A8604A")
    ink(body, 2.0)
    ink(line([(x + w - 30, B - 66), (x + w - 30, B - 60)]), 1.0, 0.7)   # the hanging sign
    wash(poly([(x + w - 38, B - 60), (x + w - 22, B - 60), (x + w - 22, B - 76), (x + w - 38, B - 76)]), "#5E4636", 0.9, "wcs", g=True)
    return x + w

def hanchett(x):
    """The Hanchett Building, 1890: plum brick, cream trim, arched windows, a frieze of rosettes and a pediment."""
    w, h = 168, 142
    PLUM, TR = "#8E5C68", "#EEDDB4"
    body = front(x, w, h, PLUM)
    top = B - h
    wash(poly([(x - 4, top - 4), (x + w + 4, top - 4), (x + w + 4, top + 18), (x - 4, top + 18)]), "#667099", 0.9, "wcs")   # the frieze
    for k in range(int(w / 10)):
        add(f'<circle cx="{x + 6 + k * 10}" cy="{top + 7}" r="2.6" fill="#E8C66E" opacity="0.95"/>')
    ink(line([(x - 6, top - 4), (x + w + 6, top - 4)]), 1.4, 0.8); ink(line([(x - 4, top + 18), (x + w + 4, top + 18)]), 1.0, 0.7)
    wash(poly([(x - 2, top + 18), (x + w + 2, top + 18), (x + w + 2, top + 23), (x - 2, top + 23)]), TR, 0.9, "wcs")
    ped = poly([(x + w / 2 - 30, top - 2), (x + w / 2, top - 46), (x + w / 2 + 30, top - 2)])
    wash(ped, TR, 0.95, "wcs")
    wash(poly([(x + w / 2 - 18, top - 6), (x + w / 2, top - 32), (x + w / 2 + 18, top - 6)]), "#E9B48C", 0.85, "wcs", g=True)
    ink(ped, 1.5, 0.85)
    add(f'<text x="{x + w / 2}" y="{top - 9}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="10" font-weight="bold" fill="#6E4450" opacity="0.9">1890</text>')
    ink(line([(x + w / 2, top - 46), (x + w / 2, top - 58)]), 1.2, 0.8)
    for ex in (x - 4, x + w - 8):   # the corner finials
        fin = poly([(ex, top - 4), (ex + 6, top - 20), (ex + 12, top - 4)])
        wash(fin, TR, 0.95, "wcs"); ink(fin, 1.1, 0.8)
    wash(poly([(x + w / 2 - 22, top + 23), (x + w / 2 + 22, top + 23), (x + w / 2 + 22, top + 33), (x + w / 2 - 22, top + 33)]), TR, 0.9, "wcs")   # the name panel
    ink(line([(x + w / 2 - 15, top + 28), (x + w / 2 + 15, top + 28)]), 0.9, 0.6, color="#667099")
    ink(line([(x, top + 92), (x + w, top + 92)]), 1.0, 0.6, color="#E6D2A6")   # the sill band
    for k, wx in enumerate([x + 16, x + 42, x + 76, x + 110, x + 136]):
        ww, wy = (16, top + 50) if k != 2 else (18, top + 46)
        arch = f"M{wx},{wy + 38} L{wx},{wy} a{ww / 2},{ww / 2} 0 0,1 {ww},0 L{wx + ww},{wy + 38} Z"
        add(f'<path d="{arch}" fill="{PAPER}"/>')
        wash(arch, "#4A4752", 0.85, "wcs", g=True)
        ink(arch, 1.2, 0.75, color="#5E5A96")
        ink(f"M{wx - 4},{wy + 2} a{ww / 2 + 4},{ww / 2 + 4} 0 0,1 {ww + 8},0", 2.2, 0.85, color="#E9D4A8")   # the cream arch hoods
    storefronts(x, w, TR, glass="#5C5560", pil="#8E7BB8")
    ink(body, 2.0)
    return x + w

def stucco(x):
    """The stucco block east of the Hanchett, with a heavy grey bracketed cornice."""
    w, h = 76, 132
    body = front(x, w, h, "#D7CAB0")
    bracketed(x, w, B - h + 16, "#7C7E8A", 18)
    for wx in (x + 14, x + 44):
        trimmed(wx, B - h + 36, 18, 34, "#4A4752")
    storefronts(x, w, "#6A93A2")
    ink(body, 2.0)
    return x + w

def red_brick(x):
    """The red brick block with its grey bracketed cornice, three tall windows and lattice vents."""
    w, h = 86, 146
    body = front(x, w, h, "#BC7360")
    coursing(x, B - h + 22, x + w, B - 58, step=10)
    bracketed(x, w, B - h + 16, "#7C7E8A", 18)
    for vx in (x + 14, x + 58):   # the diamond-lattice vents
        add(f'<rect x="{vx}" y="{B - h + 24}" width="14" height="10" fill="#F4F0E6" opacity="0.9"/>')
        ink(line([(vx, B - h + 24), (vx + 14, B - h + 34)]), 0.6, 0.5); ink(line([(vx + 14, B - h + 24), (vx, B - h + 34)]), 0.6, 0.5)
    for wx in (x + 14, x + 36, x + 58):
        trimmed(wx, B - h + 42, 12, 40, "#4A4752")
    storefronts(x, w, "#DDB843")
    ink(body, 2.0)
    return x + w

def placer_inn(x):
    """The Placer Inn building, Tommyknocker's at 1401: stucco under a red tile roof, brick diamonds between blue-framed windows, a shaped gable at the east end."""
    w, h = 168, 128
    ST = "#DCC5A8"
    gx = x + w - 52
    body = front(x, w, h, ST)
    roof = poly([(x - 10, B - h + 4), (x + 8, B - h - 22), (gx, B - h - 22), (gx, B - h + 4)])
    wash(roof, "#B9583E", 0.94, "wcs")
    for k, y in enumerate(range(int(B - h - 18), int(B - h + 4), 6)):   # the tile courses
        ink(line([(x - 6 + (y - (B - h - 22)) * -0.6, y), (gx, y)]), 0.6, 0.4)
    for tx in range(int(x), int(gx), 7):
        ink(line([(tx, B - h - 18), (tx - 3, B - h + 4)]), 0.5, 0.3)
    ink(roof, 1.4, 0.8)
    gable = f"M{gx},{B - h + 4} L{gx},{B - h - 30} q8,-4 12,-14 q14,-12 28,0 q4,10 12,14 L{x + w},{B - h + 4} Z"
    wash(gable, ST, 0.94, "wcs"); ink(gable, 1.6, 0.85)
    arch = f"M{gx + 18},{B - h - 12} L{gx + 18},{B - h - 26} a8,8 0 0,1 16,0 L{gx + 34},{B - h - 12} Z"
    wash(arch, "#4A4752", 0.85, "wcs", g=True); ink(arch, 1.0, 0.7)
    for wx in (x + 14, x + 62, x + 128):
        trimmed(wx, B - h + 20, 18, 34, "#4A4752")
        ink(poly([(wx - 4, B - h + 58), (wx - 4, B - h + 16), (wx + 22, B - h + 16), (wx + 22, B - h + 58)]), 1.3, 0.8, color="#5E80A8")
    for dx in (x + 44, x + 94):   # the brick diamonds
        for k in range(3):
            dy = B - h + 22 + k * 12
            d = poly([(dx, dy), (dx + 5, dy + 6), (dx, dy + 12), (dx - 5, dy + 6)])
            wash(d, "#B0604C", 0.9, "wcs", g=True); ink(d, 0.7, 0.5)
    wash(poly([(x + 6, B - 6), (x + 6, B - 52), (x + w - 6, B - 52), (x + w - 6, B - 6)]), "#4E5866", 0.55, "wcs", g=True)
    for gxx in range(int(x + 6), int(x + w - 4), 10):   # the big gridded shop windows
        ink(line([(gxx, B - 52), (gxx, B - 6)]), 0.7, 0.55, color="#5E80A8")
    for gy in range(int(B - 48), int(B - 6), 10):
        ink(line([(x + 6, gy), (x + w - 6, gy)]), 0.7, 0.55, color="#5E80A8")
    aw = f"M{x + 58},{B - 54} L{x + 112},{B - 54} L{x + 116},{B - 36} C{x + 85},{B - 32} {x + 85},{B - 32} {x + 54},{B - 36} Z"
    wash(aw, "#7A2232", 0.94, "wcs"); ink(aw, 1.2, 0.8)
    ink(body, 2.0)
    return x + w

def lamp(lx):
    """Miner Street's lamp posts, two white globes on each."""
    ink(line([(lx, B + 22), (lx, B - 62)]), 2.0, 0.9, color="#2F2C2E")
    ink(line([(lx - 9, B - 58), (lx + 9, B - 58)]), 1.4, 0.85, color="#2F2C2E")
    for gx in (lx - 9, lx + 9):
        add(f'<circle cx="{gx}" cy="{B - 66}" r="6" fill="#FCF9F2" opacity="0.95"/>')
        ink(f"M{gx - 6},{B - 66} a6,6 0 1,1 12,0 a6,6 0 1,1 -12,0", 1.0, 0.75)

xx = 1372
xx = beau_jos(xx) + 6
xx = hanchett(xx) + 6
xx = stucco(xx) + 4
xx = red_brick(xx) + 4
xx = placer_inn(xx)
wash(poly([(1150, B + 2), (2340, B + 2), (2348, B + 14), (1142, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1520, 1700, 1880, 2050):
    lamp(lx)

# --- The Charlie Tayler waterwheel at the west end, on its timber frame, with the flume behind.
def waterwheel(cx, cy, r):
    WOOD, WOOD_D = "#7E4A40", "#5A332C"
    base = B + 14
    # The flume, coming in on its trestle from the east.
    wash(poly([(cx + r * 1.4, cy - 6), (cx + r * 2.3, cy - 2), (cx + r * 2.3, cy + 6), (cx + r * 1.4, cy + 4)]), WOOD, 0.9, "wcs")
    ink(poly([(cx + r * 1.4, cy - 6), (cx + r * 2.3, cy - 2), (cx + r * 2.3, cy + 6), (cx + r * 1.4, cy + 4)]), 1.1, 0.75)
    for tx in (cx + r * 1.85, cx + r * 2.25):
        ink(line([(tx, cy + 6), (tx - 4, base)]), 1.6, 0.8, color=WOOD_D); ink(line([(tx, cy + 6), (tx + 6, base)]), 1.2, 0.7, color=WOOD_D)
    # The wheel: a doubled rim and its spokes.
    rim = (f"M{cx - r},{cy} a{r},{r} 0 1,0 {2 * r},0 a{r},{r} 0 1,0 {-2 * r},0 Z "
           f"M{cx - r * 0.88:.1f},{cy} a{r * 0.88:.1f},{r * 0.88:.1f} 0 1,1 {2 * r * 0.88:.1f},0 a{r * 0.88:.1f},{r * 0.88:.1f} 0 1,1 {-2 * r * 0.88:.1f},0 Z")
    add(f'<path d="{rim}" fill="{PAPER}" fill-rule="evenodd"/>')
    add(f'<path d="{rim}" fill="{WOOD}" fill-rule="evenodd" opacity="0.92" filter="url(#wcs)" style="mix-blend-mode:multiply"/>')
    for k in range(16):
        a = k * math.pi / 8 + 0.1
        x2, y2 = cx + math.cos(a) * r * 0.9, cy + math.sin(a) * r * 0.9
        ink(line([(cx + math.cos(a) * 6, cy + math.sin(a) * 6), (x2, y2)]), 2.6, 0.9, color=WOOD)
    ink(f"M{cx - r},{cy} a{r},{r} 0 1,0 {2 * r},0 a{r},{r} 0 1,0 {-2 * r},0", 1.4, 0.8)
    ink(f"M{cx - r * 0.88:.1f},{cy} a{r * 0.88:.1f},{r * 0.88:.1f} 0 1,0 {2 * r * 0.88:.1f},0 a{r * 0.88:.1f},{r * 0.88:.1f} 0 1,0 {-2 * r * 0.88:.1f},0", 1.0, 0.6)
    add(f'<circle cx="{cx}" cy="{cy}" r="7" fill="{WOOD_D}" opacity="0.95"/>')
    # The frame: a beam at the axle, posts to the ground, and braces.
    wash(poly([(cx - r * 1.3, cy + 2), (cx - r * 1.3, cy - 5), (cx + r * 1.45, cy - 5), (cx + r * 1.45, cy + 2)]), WOOD, 0.95, "wcs")
    ink(poly([(cx - r * 1.3, cy + 2), (cx - r * 1.3, cy - 5), (cx + r * 1.45, cy - 5), (cx + r * 1.45, cy + 2)]), 1.1, 0.8)
    for px in (cx - r * 1.2, cx - r * 1.08, cx + r * 1.1, cx + r * 1.26):
        ink(line([(px, cy), (px, base)]), 2.4, 0.9, color=WOOD_D)
    ink(line([(cx - 2, cy), (cx - 2, base)]), 2.8, 0.9, color=WOOD_D); ink(line([(cx + 3, cy), (cx + 3, base)]), 2.8, 0.9, color=WOOD_D)
    for a, b in [((cx - 3, cy + 8), (cx - r * 0.7, base)), ((cx + 3, cy + 8), (cx + r * 0.7, base)), ((cx + r * 1.12, cy + 8), (cx + r * 1.5, base))]:
        ink(line([a, b]), 1.8, 0.85, color=WOOD_D)
    for fx in (cx - r * 1.2, cx + 6, cx + r * 1.28):   # the little flags at its feet
        ink(line([(fx, base - 6), (fx, base - 30)]), 0.8, 0.7)
        for k in range(3):
            add(f'<rect x="{fx + 1:.0f}" y="{base - 30 + k * 4}" width="7" height="2" fill="#B8372B" opacity="0.9"/>')
        add(f'<rect x="{fx + 1:.0f}" y="{base - 30}" width="3" height="5" fill="#2F4A7A" opacity="0.9"/>')

for x in (1170, 1350):
    cottonwood(x, B + 16, 34)
waterwheel(1250, 646, 64)

# The bank between the street and the creek.
for i in range(140):
    x = random.uniform(0, 2400); y = random.uniform(744, 780)
    if y > interp([(0, 834), (400, 816), (800, 800), (1200, 784), (1600, 772), (2000, 762), (2400, 756)], x) - 6: continue
    ink(line([(x, y), (x + jit(4), y - random.uniform(6, 14))]), 0.9, 0.4)
for i in range(24):
    x = random.uniform(1150, 2400); y = random.uniform(748, 768)
    blob(x, y, 9, 5, random.choice(["#9DA58A", "#D6B23E"]), 0.6)

# --- Clear Creek, across the foreground and widening to the west.
INKSCALE = 1.15
rt = [(2400, 756), (2000, 762), (1600, 772), (1200, 784), (800, 800), (400, 816), (0, 834)]
rbank = [(0, 966), (300, 944), (700, 908), (1100, 878), (1500, 856), (1900, 838), (2400, 820)]
river_d = f"M2400,{rt[0][1]} " + smooth(rt) + " L0,966 " + smooth(rbank) + " Z"
wash(river_d, "#86B2CC", 0.92, "wc3")
wash("M2400,764 C1800,776 1300,800 900,824 C600,846 300,880 0,910 L0,940 C300,914 700,876 1100,850 C1500,826 1900,808 2400,796 Z", "#5E8AA8", 0.35, "wc3", g=True)
wash(open_path(rt) + " L0,858 " + smooth([(0, 858), (400, 840), (800, 822), (1200, 804), (1600, 790), (2000, 780), (2400, 772)]) + " Z", "#E2B55A", 0.3, "wc2", g=True)   # the gold of the trees in the water
ink(open_path(rt), 1.8, 0.65)
ink(open_path(rbank), 1.8, 0.6)
for i in range(80):   # riffles left as paper
    t = random.random(); x = 60 + t * 2300
    yt, yb = interp(rt[::-1], x), interp(rbank, x)
    y = yt + (yb - yt) * random.uniform(0.15, 0.85)
    L = random.uniform(30, 90) * (1.2 - (x / 2400) * 0.6)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-5:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{3.6 - x / 1600:.1f}" fill="none" stroke-linecap="round" opacity="0.9"/>')
    if random.random() < 0.35: ink(f"M{x + 6:.0f},{y + 6:.0f} q{L / 3:.0f},-3 {L * 0.6:.0f},0", 1.0, 0.4)
for cx, cy, r in [(1720, 806, 16), (1760, 812, 10), (1300, 830, 22), (1340, 836, 12), (900, 862, 30), (950, 870, 16), (520, 900, 38), (580, 910, 20), (220, 930, 44), (2100, 790, 12), (1500, 818, 14)]:
    boulder(cx, cy, r, granite=True)

# --- The near bank: dry grass, willows, granite boulders.
wash("M0,966 " + smooth(rbank) + f" L2400,{H} L0,{H} Z", "#CDB46A", 0.9, "wc1")
wash("M0,1000 C500,970 1300,920 2400,880 L2400,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for cx, cy, r, gr in [(1380, 920, 32, True), (1700, 890, 24, True), (2180, 870, 38, True), (1980, 924, 28, False), (800, 960, 30, True)]:
    boulder(cx, cy, r, gr)
for i in range(220):
    x = random.uniform(0, 2400); top = interp(rbank, x) + random.uniform(8, 150)
    if top > 1000: continue
    L = random.uniform(10, 28)
    ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.45)
def willows(x, base, w):
    wands = []
    for k in range(int(w / 7)):
        sx = x + k * 7 + jit(3); hgt = random.uniform(34, 70); lean = jit(8)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.1, 0.75, color="#6E2418")
        wands.append(f"M{sx + lean * 0.6 - 5:.0f},{base - hgt * 0.62:.0f} a5,{hgt * 0.38:.0f} 0 1,0 10,0 a5,{hgt * 0.38:.0f} 0 1,0 -10,0 Z")
    d = " ".join(wands)
    wash(d, "#C24A2C", 0.8, "wcs")
    wash(d, "#E8A23E", 0.3, "wcs", g=True)
for x, w in [(1160, 80), (1840, 100), (2280, 90), (420, 90)]:
    willows(x, interp(rbank, x) + 40, w)
for x in (2330, 1560, 120):
    cottonwood(x, interp(rbank, x) + 76, 54)
for i in range(60):   # rabbitbrush along the near bank
    x = random.uniform(0, 2400); y = interp(rbank, x) + random.uniform(30, 150)
    if y < 990: blob(x, y, 9, 6, "#E2B92E", 0.75)

# Willows and gold along the far bank, under the town.
for x, w in [(1500, 70), (2000, 60)]:
    willows(x, interp(rt[::-1], x) + 6, w)

finish(sys.argv[1])
