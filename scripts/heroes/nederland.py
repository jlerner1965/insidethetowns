"""Nederland hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Looking west up Barker Reservoir to the town at its head on an autumn
morning, as the guide's photo of the reservoir (barker-meadows-reservoir.jpg)
shows it: the big timbered hill on the left running down to the water, the
snow-capped peaks of the Continental Divide behind, Eldora's ski runs cut
down the mountain in the middle, the bare rocky slope under it and the
timbered ridges to the right, all traced from that photo (stretched, with
the middle moved right to clear the type). Along the shore stand the Mining
Museum's 1923 Bucyrus steam shovel, its riveted boom, dipper stick and
bucket, with the white clapboard building beside it and an old flywheel in
front (from nederland-mining-museum.jpg), and Mountain People's Co-op, its
grey shingled roof, white porch and long navy sign, next to the blue Rustic
Moose with its scalloped trim, porch gable and hanging sign (from the old
hero photograph of East First Street, hero.jpg). The aspens, spruce, sand,
willows and granite are generic filler. No other building is drawn, because
the guide has no photograph of the rest of the town to draw it from (the
Carousel of Happiness among them).
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(14)

def timber(ridge, x0, x1, depth, n, col, op, hmin, hmax, top=6, ylim=None, g=True):
    """Conifers seen from far off: a scatter of small spires below a ridge line."""
    parts = []
    for i in range(n):
        x = random.uniform(x0, x1); y = interp(ridge, x) + random.uniform(top, depth)
        if ylim and y > interp(ylim, x): continue
        h = random.uniform(hmin, hmax); w = h * 0.34
        parts.append(f"M{x:.1f},{y - h:.1f} L{x + w / 2:.1f},{y:.1f} L{x - w / 2:.1f},{y:.1f} Z")
    if parts: wash(" ".join(parts), col, op, "wcs", g=g)

def skyline_trees(ridge, x0, x1, col, step=(7, 16), hs=(10, 20)):
    """Tree tops breaking the ridge line, so the hill reads as timbered."""
    parts, x = [], x0
    while x < x1:
        y = interp(ridge, x) + 3; h = random.uniform(*hs); w = h * 0.36
        parts.append(f"M{x:.1f},{y - h:.1f} L{x + w / 2:.1f},{y + 2:.1f} L{x - w / 2:.1f},{y + 2:.1f} Z")
        x += random.uniform(*step)
    wash(" ".join(parts), col, 0.9, "wcs")

def aspen_drift(cx, cy, L, ang, wid=None):
    """A stand of aspens in their October gold seen across the valley: crowns
    crowded into one wash with a scalloped edge, turning orange in places, with
    a few conifers standing among them."""
    wid = wid or L * 0.3
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    def at(u, v): return (cx + u * ca - v * sa, cy + u * sa + v * ca)
    d, dark, feet = [], [], []
    for i in range(int(L / 7)):
        u = random.uniform(-0.5, 0.5) * L; v = random.uniform(-0.3, 0.3) * wid * (1 - abs(u) / L)
        x, y = at(u, v); r = random.uniform(0.22, 0.4) * wid * (1.1 - abs(u) / L)
        d.append(f"M{x - r * 0.8:.1f},{y:.1f} a{r * 0.8:.1f},{r:.1f} 0 1,0 {r * 1.6:.1f},0 a{r * 0.8:.1f},{r:.1f} 0 1,0 {-r * 1.6:.1f},0 Z")
        # the shade side of each crown, a crescent on its right
        dark.append(f"M{x + r * 0.1:.1f},{y - r:.1f} C{x + r * 1.0:.1f},{y - r * 0.7:.1f} {x + r * 1.0:.1f},{y + r * 0.7:.1f} {x + r * 0.1:.1f},{y + r:.1f} C{x + r * 0.5:.1f},{y + r * 0.3:.1f} {x + r * 0.5:.1f},{y - r * 0.3:.1f} {x + r * 0.1:.1f},{y - r:.1f} Z")
        if random.random() < 0.3: feet.append((x + jit(r * 0.4), y + r * 0.9))
    wash(" ".join(d), random.choice(["#EDB632", "#E9AC2E", "#F0BF40"]), 0.9, "wc2")
    wash(" ".join(dark), "#C8641E", 0.28, "wcs", g=True)
    for x, y in feet:   # a glimpse of white trunks
        add(f'<path d="M{x:.1f},{y:.1f} L{x + 0.4:.1f},{y + 8:.1f}" stroke="#F6F1E6" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>')
    sp = []
    for i in range(int(L / 40)):
        x, y = at(random.uniform(-0.4, 0.4) * L, random.uniform(-0.2, 0.3) * wid); h = random.uniform(12, 22)
        sp.append(f"M{x:.1f},{y - h:.1f} L{x + h * 0.17:.1f},{y:.1f} L{x - h * 0.17:.1f},{y:.1f} Z")
    if sp: wash(" ".join(sp), "#2D4636", 0.6, "wcs", g=True)

def snowcap(ridge, x0, x1, dep):
    """Snow on a far summit, left as paper below the ridge, with a cool shadow side."""
    top = [(x, interp(ridge, x) + 1) for x in range(int(x0), int(x1) + 1, 5)]
    n = len(top); bot = []
    for i in range(n - 1, -1, -1):
        t = 1 - abs(2 * i / (n - 1) - 1)
        bot.append((top[i][0], top[i][1] + dep * (0.25 + 0.75 * t) * random.uniform(0.55, 1.25)))
    d = poly(top + bot)
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.93" filter="url(#wcs)"/>')
    m = int(n * 0.55)
    wash(poly(top[m:] + [p for p in bot if p[0] >= top[m][0]]), "#9AA3C6", 0.45, "wcs", g=True)

def aspen(x, base, h, col=None):
    """An aspen in its October gold: a narrow crown over a white trunk."""
    col = col or random.choice(["#F0B92E", "#EAA92B", "#F3C641", "#F0B92E"])
    bl = [(0, -0.70, 0.17, 0.24), (-0.08, -0.56, 0.15, 0.18), (0.08, -0.58, 0.14, 0.19), (0, -0.86, 0.11, 0.14), (0.02, -0.46, 0.12, 0.12)]
    d = " ".join(f"M{x + dx * h - rx * h:.1f},{base + dy * h:.1f} a{rx * h:.1f},{ry * h:.1f} 0 1,0 {2 * rx * h:.1f},0 a{rx * h:.1f},{ry * h:.1f} 0 1,0 {-2 * rx * h:.1f},0 Z" for dx, dy, rx, ry in bl)
    wash(d, col, 0.92, "wcs")
    wash(f"M{x + h * 0.04:.1f},{base - h * 0.98:.1f} C{x + h * 0.24:.1f},{base - h * 0.8:.1f} {x + h * 0.22:.1f},{base - h * 0.42:.1f} {x + h * 0.04:.1f},{base - h * 0.36:.1f} C{x + h * 0.12:.1f},{base - h * 0.6:.1f} {x + h * 0.1:.1f},{base - h * 0.8:.1f} {x + h * 0.04:.1f},{base - h * 0.98:.1f} Z", "#C8641E", 0.4, "wcs", g=True)
    add(f'<path d="M{x:.1f},{base:.1f} L{x + 0.5:.1f},{base - h * 0.5:.1f}" stroke="#F6F1E6" stroke-width="{max(2.2, h * 0.045):.1f}" stroke-linecap="round"/>')
    ink(line([(x - h * 0.03, base), (x - h * 0.025, base - h * 0.5)]), 0.8, 0.55)
    for k in range(3):
        yy = base - h * random.uniform(0.08, 0.42)
        ink(line([(x - h * 0.02, yy), (x + h * 0.02, yy + 1)]), 0.9, 0.6)

def spruce(x, base, h, col="#34503F"):
    """A dark conifer with tiered, jagged branches."""
    w = h * 0.36; n = 7; R = []
    for i in range(1, n + 1):
        t = i / n; y = base - h + h * 0.86 * t
        R += [(x + w / 2 * t + jit(1.2), y), (x + w / 2 * t * 0.45, y - h * 0.02)]
    R = R[:-1] + [(x + 2, base - h * 0.12)]
    L = [(2 * x - px, py) for px, py in reversed(R)]
    d = poly([(x, base - h)] + R + L)
    wash(d, col, 0.92, "wcs")
    wash(poly([(x, base - h)] + [(px, py) for px, py in L] + [(x, base - h * 0.14)]), "#7E9A64", 0.3, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.16)]), 1.4, 0.7)

def rock(cx, cy, r, col="#BBAEA4"):
    d = f"M{cx - r:.1f},{cy:.1f} C{cx - r:.1f},{cy - r * 0.8:.1f} {cx - r * 0.3:.1f},{cy - r:.1f} {cx + r * 0.2:.1f},{cy - r * 0.95:.1f} C{cx + r * 0.9:.1f},{cy - r * 0.9:.1f} {cx + r * 1.05:.1f},{cy - r * 0.35:.1f} {cx + r:.1f},{cy:.1f} Z"
    wash(d, col, 0.94, "wcs")
    wash(f"M{cx + r * 0.1:.1f},{cy - r * 0.94:.1f} C{cx + r * 0.9:.1f},{cy - r * 0.9:.1f} {cx + r * 1.05:.1f},{cy - r * 0.35:.1f} {cx + r:.1f},{cy:.1f} L{cx:.1f},{cy:.1f} C{cx + r * 0.35:.1f},{cy - r * 0.45:.1f} {cx + r * 0.3:.1f},{cy - r * 0.75:.1f} {cx + r * 0.1:.1f},{cy - r * 0.94:.1f} Z", "#6E6688", 0.45, "wcs", g=True)
    ink(d, 1.6, 0.8)
    wash(f"M{cx - r * 1.2:.1f},{cy + 2:.1f} a{r * 1.2:.1f},{r * 0.18:.1f} 0 1,0 {r * 2.4:.1f},0 a{r * 1.2:.1f},{r * 0.18:.1f} 0 1,0 {-r * 2.4:.1f},0 Z", "#7E7398", 0.4, "wcs", g=True)

# --- Sky.
sky()
for cx, cy, s in [(300, 130, 58), (1010, 92, 42), (1660, 138, 66), (2230, 112, 46), (560, 268, 28), (2000, 290, 30)]:
    cloud(cx, cy, s)

# --- The snowy peaks of the Divide, far off, behind everything (traced from the
# guide's photo of the reservoir: photo x 0-480 stretched to 0-1150, the rest
# fitted into 1150-2400, heights stretched about 1.8 times).
INKSCALE = 0.55
far = [(420, 486), (520, 466), (600, 446), (680, 422), (740, 404), (800, 388), (848, 398), (900, 382), (950, 372), (1004, 386), (1060, 376),
       (1110, 386), (1160, 374), (1214, 358), (1262, 340), (1300, 356), (1350, 386), (1420, 404), (1600, 412), (1700, 398), (1752, 378),
       (1806, 364), (1876, 360), (1930, 372), (1980, 392), (2060, 412), (2200, 420), (2400, 414)]
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
for a, b in [(800, 880), (950, 1040), (1060, 1140), (1262, 1400), (1876, 1990)]:   # the slopes facing away from the sun
    pts = [(x, interp(far, x)) for x in range(a, b + 1, 6)]
    wash(poly(pts + [(b - (b - a) * 0.1, interp(far, b) + 40), (a + (b - a) * 0.3, interp(far, a) + 70)]), "#7F7699", 0.14, "wc3", g=True)
for x0, x1, dep in [(772, 842, 26), (880, 1000, 34), (1036, 1094, 22), (1136, 1188, 22), (1222, 1316, 46), (1744, 1944, 34)]:
    snowcap(far, x0, x1, dep)
for i in range(16):   # gullies
    x = random.uniform(700, 1380); y0 = interp(far, x) + random.uniform(10, 30)
    ink(line([(x, y0), (x + random.uniform(4, 12), y0 + random.uniform(12, 26))]), 0.9, 0.28)
ink(open_path(far), 1.4, 0.55)

# --- Eldora's mountain with its ski runs, and the ridges to the right.
INKSCALE = 0.65
eld = [(860, 600), (960, 562), (1060, 522), (1160, 474), (1240, 438), (1300, 414), (1350, 400), (1420, 392), (1500, 388), (1580, 392),
       (1660, 388), (1720, 396), (1770, 412), (1830, 432), (1900, 446), (1980, 454)]
wash(ridge_d(eld), "#77899A", 0.82, "wc3")
wash(f"M1580,392 C1700,390 1800,420 1980,454 L1980,640 L1640,640 Z", "#5E6A86", 0.18, "wc3", g=True)
timber(eld, 1000, 1960, 170, 300, "#4F6372", 0.35, 6, 12)
for tx, slope, L, wmax in [(1408, -0.55, 118, 14), (1436, -0.42, 134, 20), (1454, 0.36, 124, 18), (1522, 0.22, 112, 15), (1562, -0.12, 120, 17),
                           (1608, 0.18, 100, 13), (1646, -0.26, 110, 15), (1700, 0.38, 72, 10), (1362, -0.62, 70, 10)]:
    ty = interp(eld, tx) + 1
    cl = [(tx + slope * L * t + (jit(5) if 0 < t < 1 else 0), ty + L * t) for t in (0, 0.25, 0.5, 0.75, 1)]
    wd = [4 + (wmax - 4) * t ** 0.7 for t in (0, 0.25, 0.5, 0.75, 1)]
    wash(poly([(x - w / 2, y) for (x, y), w in zip(cl, wd)] + [(x + w / 2, y) for (x, y), w in reversed(list(zip(cl, wd)))]), "#DDD3B3", 0.82, "wcs")
for (x0, y0), (x1, y1) in [((1404, 452), (1470, 432)), ((1520, 470), (1580, 452)), ((1594, 436), (1640, 424))]:   # cat tracks between runs
    add(f'<path d="M{x0},{y0} Q{(x0 + x1) / 2},{(y0 + y1) / 2 + 6} {x1},{y1}" stroke="#DDD3B3" stroke-width="3" fill="none" opacity="0.75" filter="url(#wcs)"/>')
ink(open_path(eld[3:]), 1.3, 0.5)
rr = [(1580, 600), (1660, 540), (1740, 496), (1820, 466), (1900, 446), (1980, 432), (2060, 420), (2160, 410), (2260, 402), (2400, 394)]
wash(ridge_d(rr), "#7F90A8", 0.82, "wc3")
skyline_trees(rr, 1700, 2400, "#6C7E92", hs=(8, 14))
timber(rr, 1640, 2400, 150, 230, "#55687A", 0.35, 6, 12)
ink(open_path(rr), 1.2, 0.45)

# --- The bare rocky slope under Eldora, high and steep at its right end.
INKSCALE = 0.75
rock_s = [(1080, 640), (1160, 580), (1230, 536), (1290, 508), (1370, 494), (1450, 484), (1510, 468), (1540, 460), (1570, 474), (1600, 510), (1630, 560), (1660, 610)]
wash(ridge_d(rock_s), "#C6AC84", 0.9, "wc1")
wash(f"M1540,460 C1560,470 1590,500 1610,530 C1630,560 1650,600 1660,610 L1660,{H} L1560,{H} C1560,600 1550,520 1540,460 Z", "#7E7090", 0.4, "wc3", g=True)
for i in range(30):   # outcrops and their shadows
    x = random.uniform(1180, 1620); y = interp(rock_s, x) + random.uniform(10, 100)
    w = random.uniform(14, 36)
    wash(f"M{x:.0f},{y:.0f} l{w * 0.3:.0f},{-w * 0.4:.0f} l{w * 0.5:.0f},{w * 0.12:.0f} l{w * 0.2:.0f},{w * 0.32:.0f} Z", "#8E7E6C", 0.45, "wcs", g=True)
for i in range(46):
    x = random.uniform(1170, 1640); y0 = interp(rock_s, x) + random.uniform(8, 110)
    ink(line([(x, y0), (x - 9, y0 + 13)]), 0.9, 0.3)
timber(rock_s, 1100, 1650, 140, 70, "#4E6650", 0.6, 6, 14)
ink(open_path(rock_s[1:]), 1.6, 0.6)

# --- The timbered hills behind the town.
INKSCALE = 0.8
cf = [(1080, 650), (1200, 622), (1300, 600), (1400, 590), (1480, 588), (1560, 594), (1640, 584), (1720, 568), (1800, 556), (1900, 548),
      (2000, 552), (2100, 544), (2200, 532), (2300, 524), (2400, 520)]
wash(ridge_d(cf), "#617C5A", 0.9, "wc1")
skyline_trees(cf, 1100, 2400, "#466449")
timber(cf, 1080, 2400, 150, 360, "#2F4A38", 0.45, 8, 18)
for cx, cy, L, ang in [(1780, 590, 150, 14), (2000, 580, 170, 10), (2260, 560, 160, 12), (1580, 618, 110, 16)]:
    aspen_drift(cx, cy, L, ang)
ink(open_path(cf), 1.6, 0.55)

# The big hill on the left, coming down to the water.
lh = [(0, 352), (100, 344), (220, 346), (320, 358), (400, 378), (500, 408), (620, 448), (740, 492), (860, 534), (980, 572), (1100, 610),
      (1220, 646), (1340, 682), (1460, 716)]
wash(ridge_d(lh), "#5E7A56", 0.92, "wc1")
wash(f"M0,352 C200,340 320,360 420,384 C560,440 700,520 760,620 C600,640 300,620 0,600 Z", "#B4B068", 0.2, "wc3", g=True)   # morning light on its upper face
skyline_trees(lh, 0, 1460, "#3F5D45", step=(8, 18), hs=(12, 26))
# Aspen stands high on it only: below y 500 the hill stays deep behind the type.
for cx, cy, L, ang in [(160, 410, 230, 12), (430, 444, 220, 22), (270, 474, 150, 14), (630, 474, 150, 28), (60, 466, 120, 12), (560, 404, 90, 22)]:
    aspen_drift(cx, cy, L, ang)
timber(lh, 0, 1460, 420, 560, "#2D4636", 0.45, 10, 24)
wash("M0,600 " + smooth([(0, 600), (180, 618), (420, 612), (640, 632), (860, 640), (1040, 664), (1200, 694), (1340, 740)]) + " L0,745 Z", "#2E4436", 0.26, "wc3", g=True)   # its shaded foot, deep behind the type
ink(open_path(lh), 2.0, 0.7)

# --- The flat at the head of the reservoir, with town trees: aspens and spruce.
INKSCALE = 0.85
flat = [(1150, 742), (1240, 706), (1320, 692), (1700, 686), (2100, 688), (2400, 690)]
wash(ridge_d(flat), "#C9B676", 0.9, "wc3")
for x in range(1140, 2420, 30):
    if random.random() < 0.3: spruce(x + jit(8), 700, random.uniform(80, 130))
    else: aspen(x + jit(10), 702, random.uniform(80, 130))
spruce(1300, 706, 214); spruce(1356, 706, 170); spruce(1640, 706, 160)   # the tall spruce behind the shovel, as in the photo

B = 712
# Street in front of the buildings.
wash(poly([(1180, B - 4), (2300, B - 4), (2316, B + 22), (1164, B + 22)]), "#CBBFAA", 0.82, "wcs")
ink(line([(1164, B + 22), (2316, B + 22)]), 1.4, 0.55)

def museum_shed(x0, k):
    """The white clapboard building beside the shovel, grey roof, paired windows."""
    def T(u, v): return (x0 + (u - 50) * k, B - (915 - v) * k)
    wall = poly([T(1072, 905), T(1072, 652), T(1300, 652), T(1300, 905)])
    add(f'<path d="{wall}" fill="{PAPER}"/>')
    wash(wall, "#E6E2DA", 0.7, "wcs", g=True)
    for v in range(670, 900, 22):
        ink(line([T(1076, v), T(1296, v)]), 0.6, 0.3)
    roof = poly([T(1060, 655), T(1100, 592), T(1310, 588), T(1310, 655)])
    wash(roof, "#8F969C", 0.92, "wcs"); ink(roof, 1.3, 0.8)
    wash(poly([T(1072, 655), T(1300, 655), T(1300, 690), T(1072, 690)]), "#7E7398", 0.3, "wcs", g=True)
    for u in (1135, 1197):
        trimmed(*T(u, 782), 56 * k, 56 * k, "#4A4752")
    ink(wall, 1.6, 0.8)

def shovel(x0, k):
    """The Mining Museum's 1923 Bucyrus steam shovel, drawn from the guide's photo
    (u, v are that photo's pixels, ground at v 915)."""
    def T(u, v): return (x0 + (u - 50) * k, B - (915 - v) * k)
    def P(*uv): return poly([T(u, v) for u, v in uv])
    RUST, RUST_D, IRON = "#7A4E36", "#4E3226", "#5E4232"
    # Boom: a riveted plate girder from the deck up to the point sheave.
    boom = P((506, 739), (964, 42), (1006, 68), (574, 781))
    wash(boom, RUST, 0.94, "wcs")
    wash(P((540, 760), (985, 55), (1006, 68), (574, 781)), RUST_D, 0.4, "wcs", g=True)
    ink(boom, 1.6, 0.85)
    for t in [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82]:
        u, v = 540 + 445 * t, 760 - 705 * t
        cx, cy = T(u, v); add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{max(1.8, 9 * k):.1f}" fill="#2E2220" opacity="0.8"/>')
    for s in (-1, 1):   # rivet lines down each flange
        for t in [i / 26 for i in range(2, 25)]:
            u, v = 540 + 445 * t + s * 30 * 0.846, 760 - 705 * t + s * 30 * 0.534
            cx, cy = T(u, v); add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="0.9" fill="#2E2220" opacity="0.6"/>')
    sx, sy = T(985, 50)
    wash(f"M{sx - 30 * k:.1f},{sy:.1f} a{30 * k:.1f},{30 * k:.1f} 0 1,0 {60 * k:.1f},0 a{30 * k:.1f},{30 * k:.1f} 0 1,0 {-60 * k:.1f},0 Z", IRON, 0.92, "wcs")
    ink(f"M{sx - 30 * k:.1f},{sy:.1f} a{30 * k:.1f},{30 * k:.1f} 0 1,0 {60 * k:.1f},0 a{30 * k:.1f},{30 * k:.1f} 0 1,0 {-60 * k:.1f},0", 1.2, 0.85)
    # The house: weathered plate sides under a curved rusty roof, with its stack.
    house = P((60, 560), (495, 540), (495, 745), (60, 745))
    wash(house, "#BDB19A", 0.93, "wcs")
    for i in range(10):
        u = random.uniform(80, 470)
        wash(P((u, 560), (u + 10, 560), (u + 6, 740), (u - 2, 740)), "#9A6A4A", 0.3, "wcs", g=True)
    wash(P((60, 585), (125, 585), (125, 745), (60, 745)), "#3A302A", 0.8, "wcs", g=True)     # open end
    wash(P((125, 590), (175, 590), (175, 745), (125, 745)), RUST, 0.9, "wcs")             # door swung open
    wash(P((370, 585), (445, 585), (445, 745), (370, 745)), "#3A302A", 0.75, "wcs", g=True)   # side door
    wash(P((270, 642), (330, 642), (330, 748), (270, 748)), "#F4F0E6", 0.9, "wcs")         # the sign board
    for v in range(660, 740, 12):
        ink(line([T(278, v), T(322, v)]), 0.5, 0.35)
    wash(P((495, 540), (585, 540), (585, 745), (495, 745)), "#3A302A", 0.55, "wcs", g=True)   # open front with its gear
    ink(house, 1.6, 0.85)
    ink(line([T(585, 540), T(585, 745)]), 1.2, 0.7)
    roof = f"M{T(50, 562)[0]:.1f},{T(50, 562)[1]:.1f} Q{T(270, 522)[0]:.1f},{T(270, 522)[1]:.1f} {T(505, 528)[0]:.1f},{T(505, 528)[1]:.1f} L{T(505, 546)[0]:.1f},{T(505, 546)[1]:.1f} Q{T(270, 540)[0]:.1f},{T(270, 540)[1]:.1f} {T(50, 578)[0]:.1f},{T(50, 578)[1]:.1f} Z"
    wash(roof, "#80523A", 0.94, "wcs"); ink(roof, 1.4, 0.85)
    wash(P((175, 498), (215, 498), (215, 530), (175, 530)), "#3A302A", 0.92, "wcs")
    ink(P((175, 498), (215, 498), (215, 530), (175, 530)), 1.2, 0.85)
    # Deck, truck frame and the crawler tracks with their spoked rollers.
    wash(P((40, 745), (600, 745), (600, 790), (40, 790)), RUST_D, 0.92, "wcs"); ink(P((40, 745), (600, 745), (600, 790), (40, 790)), 1.4, 0.85)
    wash(P((200, 790), (600, 790), (600, 822), (200, 822)), IRON, 0.92, "wcs")
    a, b = T(130, 820), T(665, 915); rr_ = (b[1] - a[1]) / 2
    track = f"M{a[0] + rr_:.1f},{a[1]:.1f} L{b[0] - rr_:.1f},{a[1]:.1f} A{rr_:.1f},{rr_:.1f} 0 0,1 {b[0] - rr_:.1f},{b[1]:.1f} L{a[0] + rr_:.1f},{b[1]:.1f} A{rr_:.1f},{rr_:.1f} 0 0,1 {a[0] + rr_:.1f},{a[1]:.1f} Z"
    wash(track, IRON, 0.94, "wcs"); ink(track, 1.6, 0.85)
    for xx in range(int(a[0] + 4), int(b[0] - 2), 5):
        ink(line([(xx, a[1]), (xx, a[1] + 3)]), 0.7, 0.5); ink(line([(xx, b[1] - 3), (xx, b[1])]), 0.7, 0.5)
    for u, r in [(185, 38), (275, 38), (355, 38), (430, 38), (610, 40)]:
        cx, cy = T(u, 866); R = r * k
        wash(f"M{cx - R:.1f},{cy:.1f} a{R:.1f},{R:.1f} 0 1,0 {2 * R:.1f},0 a{R:.1f},{R:.1f} 0 1,0 {-2 * R:.1f},0 Z", "#8A5A3E", 0.9, "wcs")
        ink(f"M{cx - R:.1f},{cy:.1f} a{R:.1f},{R:.1f} 0 1,0 {2 * R:.1f},0 a{R:.1f},{R:.1f} 0 1,0 {-2 * R:.1f},0", 1.1, 0.85)
        for s in range(6):
            an = s * math.pi / 3 + 0.3
            ink(line([(cx, cy), (cx + R * 0.9 * math.cos(an), cy + R * 0.9 * math.sin(an))]), 0.8, 0.7)
    # Dipper stick crossing in front of the boom, and the shipper-shaft gear.
    stick = P((654, 318), (696, 292), (976, 752), (934, 778))
    wash(stick, "#6A4430", 0.94, "wcs"); wash(P((675, 305), (696, 292), (976, 752), (955, 765)), RUST_D, 0.35, "wcs", g=True); ink(stick, 1.5, 0.85)
    gx, gy = T(690, 412); R = 44 * k
    wash(f"M{gx - R:.1f},{gy:.1f} a{R:.1f},{R:.1f} 0 1,0 {2 * R:.1f},0 a{R:.1f},{R:.1f} 0 1,0 {-2 * R:.1f},0 Z", IRON, 0.9, "wcs")
    for s in range(16):
        an = s * math.pi / 8
        ink(line([(gx + R * 0.85 * math.cos(an), gy + R * 0.85 * math.sin(an)), (gx + R * 1.15 * math.cos(an), gy + R * 1.15 * math.sin(an))]), 0.9, 0.75)
    ink(f"M{gx - R:.1f},{gy:.1f} a{R:.1f},{R:.1f} 0 1,0 {2 * R:.1f},0 a{R:.1f},{R:.1f} 0 1,0 {-2 * R:.1f},0", 1.0, 0.8)
    # The dipper, teeth down, hung from the point on its hoist ropes.
    ink(line([T(980, 70), T(982, 760)]), 1.0, 0.75); ink(line([T(1016, 62), T(1020, 712)]), 1.0, 0.75)
    dip = P((870, 778), (962, 762), (1012, 800), (1096, 886), (1040, 896), (906, 900), (876, 852))
    wash(dip, "#5E3C2A", 0.94, "wcs"); wash(P((962, 762), (1012, 800), (1096, 886), (1040, 896)), "#2E2220", 0.35, "wcs", g=True); ink(dip, 1.5, 0.85)
    for u in (1046, 1062, 1078):
        ink(line([T(u, 892), T(u + 6, 906)]), 1.4, 0.8)
    # Boom suspension ropes from the house to the point.
    for (u0, v0), (u1, v1) in [((410, 530), (900, 108)), ((440, 528), (912, 100)), ((470, 528), (924, 92)), ((500, 532), (938, 84))]:
        ink(line([T(u0, v0), T(u1, v1)]), 0.7, 0.6)
    # An old flywheel and an iron ball on the ground in front, as in the photo.
    cx, cy = T(935, 925); R = 95 * k
    ink(f"M{cx - R:.1f},{cy:.1f} a{R:.1f},{R:.1f} 0 1,0 {2 * R:.1f},0 a{R:.1f},{R:.1f} 0 1,0 {-2 * R:.1f},0", 2.4, 0.85, color="#5E3C2A")
    for s in range(5):
        an = s * 2 * math.pi / 5 + 0.2
        ink(line([(cx, cy), (cx + R * math.cos(an), cy + R * math.sin(an))]), 1.3, 0.75, color="#5E3C2A")
    bx, by = T(1180, 972)
    wash(f"M{bx - 8:.1f},{by:.1f} a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 Z", "#5E4232", 0.92, "wcs")

def coop(x, w=280):
    """Mountain People's Co-op: green clapboard under a big grey shingled roof, the
    white porch beam and posts on a board deck, and the long navy sign."""
    e = B - 116
    wall = poly([(x + 4, B - 12), (x + 4, e), (x + w - 4, e), (x + w - 4, B - 12)])
    wash(wall, "#5A6E60", 0.92, "wcs")
    for y in range(int(e + 6), B - 14, 7):
        ink(line([(x + 6, y), (x + w - 6, y)]), 0.5, 0.22)
    for wx, ww in [(x + 26, 74), (x + 116, 60), (x + 186, 22), (x + 222, 34)]:
        add(f'<path d="{poly([(wx - 2, B - 38), (wx - 2, B - 86), (wx + ww + 2, B - 86), (wx + ww + 2, B - 38)])}" fill="{PAPER}"/>')
        wash(poly([(wx, B - 40), (wx, B - 84), (wx + ww, B - 84), (wx + ww, B - 40)]), "#66717F", 0.85, "wcs", g=True)
        wash(poly([(wx + ww * 0.15, B - 84), (wx + ww * 0.5, B - 84), (wx + ww * 0.2, B - 40), (wx, B - 40), (wx, B - 70)]), "#C9D3DA", 0.35, "wcs", g=True)   # sky in the glass
        ink(poly([(wx, B - 40), (wx, B - 84), (wx + ww, B - 84), (wx + ww, B - 40)]), 1.4, 0.8, color="#2E3458")
        add(f'<path d="M{wx + 2},{B - 72} L{wx + ww - 2},{B - 72}" stroke="#F4EFE6" stroke-width="1.4" opacity="0.85"/>')
        if ww > 40: add(f'<path d="M{wx + ww / 2:.1f},{B - 84} L{wx + ww / 2:.1f},{B - 40}" stroke="#F4EFE6" stroke-width="1.4" opacity="0.85"/>')
    for fx in (x + 132, x + 152, x + 168):   # the fruit stand under the window
        wash(f"M{fx - 7},{B - 44} a7,5 0 1,0 14,0 a7,5 0 1,0 -14,0 Z", random.choice(["#D9822E", "#C8442E", "#E2B42E"]), 0.9, "wcs", g=True)
    wash(poly([(x + 4, B - 12), (x + 4, e + 6), (x + w - 4, e + 6), (x + w - 4, B - 12)]), "#5C5560", 0.3, "wcs", g=True)   # porch shade
    roof = [(x - 18, e), (x + 46, B - 172), (x + w - 42, B - 174), (x + w + 18, e)]
    wash(poly(roof), "#747B83", 0.93, "wcs")
    wash(poly([(x + w - 42, B - 174), (x + w + 18, e), (x + w - 30, e)]), "#4E4E66", 0.3, "wcs", g=True)
    for k, y in enumerate(range(B - 168, int(e) - 2, 7)):   # shingle courses
        t = (y - (B - 174)) / (e - (B - 174))
        xa, xb = x + 46 - 64 * t, x + w - 42 + 60 * t
        ink(line([(xa + 3, y), (xb - 3, y)]), 0.55, 0.28)
        for sx in range(int(xa + 4 + (k % 2) * 6), int(xb - 4), 12):
            ink(line([(sx, y), (sx, y + 6)]), 0.5, 0.25)
    ink(poly(roof), 1.8, 0.85)
    beam = poly([(x - 20, e), (x + w + 20, e), (x + w + 20, e + 9), (x - 20, e + 9)])
    add(f'<path d="{beam}" fill="#F8F3EA" filter="url(#wcs)"/>'); ink(beam, 1.2, 0.75)
    wash(poly([(x - 18, e + 9), (x + w + 18, e + 9), (x + w + 18, e + 14), (x - 18, e + 14)]), "#5C5560", 0.35, "wcs", g=True)
    for t in (0.0, 0.27, 0.5, 0.72, 0.94):   # white porch posts with their braces
        px = x - 8 + t * (w + 10)
        post = poly([(px - 4, B - 8), (px - 4, e + 9), (px + 4, e + 9), (px + 4, B - 8)])
        add(f'<path d="{post}" fill="#F8F3EA" filter="url(#wcs)"/>'); ink(post, 1.0, 0.7)
        if 0 < t < 0.9:
            ink(line([(px - 18, e + 9), (px, e + 26)]), 1.6, 0.9, color="#F2EDE4")
    # The long sign hangs in front of the posts.
    sx0, sx1, sy0, sy1 = x + 40, x + w - 26, e + 15, e + 37
    sign = f"M{sx0 + 11},{sy0} L{sx1 - 11},{sy0} A11,11 0 0,1 {sx1 - 11},{sy1} L{sx0 + 11},{sy1} A11,11 0 0,1 {sx0 + 11},{sy0} Z"
    wash(sign, "#333A63", 0.96, "wcs"); ink(sign, 1.2, 0.8)
    for ex in (sx0 + 11, sx1 - 11):
        add(f'<circle cx="{ex}" cy="{(sy0 + sy1) / 2}" r="7.5" fill="#F4F1EA" opacity="0.95"/>')
    add(f'<text x="{(sx0 + sx1) / 2}" y="{sy1 - 6}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="12" font-weight="bold" textLength="{sx1 - sx0 - 50}" lengthAdjust="spacingAndGlyphs" fill="#F4F1EA" opacity="0.95">MOUNTAIN PEOPLE&#8217;S CO-OP</text>')
    add(f'<path d="M{x - 8},{B - 46} L{x + w},{B - 46}" stroke="#F4EFE6" stroke-width="4" stroke-linecap="round" opacity="0.95"/>')
    ink(line([(x - 8, B - 48), (x + w, B - 48)]), 0.6, 0.45)
    deck = poly([(x - 22, B), (x - 22, B - 12), (x + w + 10, B - 12), (x + w + 10, B)])
    wash(deck, "#9C7E5E", 0.92, "wcs"); ink(deck, 1.2, 0.7)
    for dx in range(int(x - 16), int(x + w + 8), 30):
        ink(line([(dx, B - 11), (dx, B - 1)]), 0.6, 0.4)
    return x + w

def rustic_moose(x, w=214):
    """The Rustic Moose: a blue clapboard false front with scalloped white trim,
    a white-edged porch gable, valances over the shop windows and a hanging sign."""
    top = B - 156
    front = poly([(x, B - 10), (x, top), (x + w, top), (x + w, B - 10)])
    wash(front, "#5B7EB2", 0.93, "wcs")
    for y in range(int(top + 16), B - 12, 7):
        ink(line([(x + 2, y), (x + w - 2, y)]), 0.5, 0.25)
    wash(poly([(x + w * 0.75, top), (x + w, top), (x + w, B - 10), (x + w * 0.75, B - 10)]), "#3E4C6E", 0.2, "wcs", g=True)
    sc = f"M{x - 4},{top - 2} L{x + w + 4},{top - 2} L{x + w + 4},{top + 6} " + " ".join("a4,4 0 0,1 -8,0" for _ in range(int((w + 8) / 8))) + " Z"
    add(f'<path d="{sc}" fill="#F8F3EA" filter="url(#wcs)"/>')
    ink(line([(x - 6, top - 3), (x + w + 6, top - 3)]), 1.8, 0.85)
    # Porch gable roof, its white bargeboards, and shade beneath.
    pk = (x + w * 0.42, B - 112); l0 = (x - 6, B - 84); r0 = (x + w + 12, B - 82)
    wash(poly([l0, pk, r0, (x + w, B - 10), (x, B - 10)]), "#344466", 0.22, "wcs", g=True)
    for (a0, a1) in [(l0, pk), (pk, r0)]:
        band = poly([a0, a1, (a1[0], a1[1] + 7), (a0[0], a0[1] + 7)])
        add(f'<path d="{band}" fill="#F8F3EA" filter="url(#wcs)"/>'); ink(band, 1.0, 0.75)
    # Valances over the windows, and the windows' white frames.
    for wx0, wx1 in [(x + 12, x + 90), (x + 124, x + 204)]:
        wash(poly([(wx0, B - 70), (wx1, B - 70), (wx1, B - 22), (wx0, B - 22)]), "#3E4452", 0.85, "wcs", g=True)
        fr = poly([(wx0 - 3, B - 70), (wx1 + 3, B - 70), (wx1 + 3, B - 20), (wx0 - 3, B - 20)])
        add(f'<path d="{fr}" fill="none" stroke="#F6F1E8" stroke-width="3.2"/>')
        for k in range(1, 4):
            mx = wx0 + (wx1 - wx0) * k / 4
            add(f'<path d="M{mx:.1f},{B - 68} L{mx:.1f},{B - 22}" stroke="#F6F1E8" stroke-width="1.6"/>')
        add(f'<path d="M{wx0},{B - 54} L{wx1},{B - 54}" stroke="#F6F1E8" stroke-width="1.6"/>')
        ink(fr, 1.0, 0.6)
        val = f"M{wx0 - 6},{B - 82} L{wx1 + 6},{B - 82} L{wx1 + 6},{B - 72} q-4,10 -8,0 L{wx0 + 2},{B - 72} q-4,10 -8,0 Z"
        wash(val, "#2C4E86", 0.95, "wcs"); ink(val, 1.0, 0.7)
        wash(poly([(wx0, B - 20), (wx1, B - 20), (wx1, B - 10), (wx0, B - 10)]), "#B9A47C", 0.9, "wcs", g=True)
    door = poly([(x + 98, B - 10), (x + 98, B - 76), (x + 118, B - 76), (x + 118, B - 10)])
    wash(door, "#6B4A36", 0.92, "wcs"); ink(door, 1.2, 0.8)
    ink(front, 2.0)
    # The hanging sign on its white bracket (the board only; its carved moose is not drawn).
    bx0, by0 = x + w * 0.46, top + 18
    add(f'<path d="M{bx0:.1f},{by0:.1f} L{x + w * 0.86:.1f},{by0 - 10:.1f} M{bx0:.1f},{by0 + 18:.1f} L{x + w * 0.7:.1f},{by0 - 4:.1f}" stroke="#F6F1E8" stroke-width="3.2" stroke-linecap="round"/>')
    ink(line([(bx0, by0), (x + w * 0.86, by0 - 10)]), 0.8, 0.6)
    sgn = poly([(x + w * 0.6, by0 + 2), (x + w * 0.8, by0 - 4), (x + w * 0.81, by0 + 40), (x + w * 0.61, by0 + 44)])
    wash(sgn, "#C99A58", 0.95, "wcs"); ink(sgn, 1.4, 0.85)
    ink(line([(x + w * 0.64, by0 + 34), (x + w * 0.77, by0 + 32)]), 1.0, 0.6)
    return x + w

INKSCALE = 0.95
museum_shed(1236, 0.29)
shovel(1236, 0.29)
xx = coop(1690)
rustic_moose(xx + 4)
wash(poly([(1180, B + 2), (2300, B + 2), (2306, B + 12), (1174, B + 12)]), "#7E7398", 0.4, "wcs", g=True)
for x in (1650, 2250):
    aspen(x, B + 14, 92)
spruce(2290, B + 16, 150)

# --- The sandy shore and Barker Reservoir.
INKSCALE = 1.1
wl = [(0, 738), (400, 736), (800, 740), (1200, 742), (1600, 746), (2000, 748), (2400, 750)]
wash(poly([(1150, 742), (1190, B + 22), (2400, B + 22), (2400, 752), (1190, 746)]), "#CFB07A", 0.9, "wcs")
wash(ridge_d(wl), "#6393B8", 0.93, "wc3")
wash(open_path(wl[:4]) + " L1200,760 " + smooth([(1200, 760), (1000, 780), (700, 820), (360, 852), (0, 866)]) + " Z", "#2C4846", 0.42, "wc3", g=True)   # the big hill's reflection, deep under the type
wash("M0,800 C600,790 1400,800 2400,790 L2400,1000 L0,1000 Z", "#3E6A92", 0.35, "wc3", g=True)
wash("M0,880 C700,870 1500,880 2400,868 L2400,1000 L0,1000 Z", "#33597E", 0.3, "wc3", g=True)
wash(open_path(wl) + " L2400,790 " + smooth([(2400, 790), (1600, 786), (800, 780), (0, 778)]) + " Z", "#4E6B58", 0.32, "wc2", g=True)   # the hills in the water
for x0, x1, col in [(1250, 1540, "#6B4A36"), (1690, 1970, "#56695C"), (1974, 2188, "#5B7EB2"), (1140, 2400, "#E2B55A")]:   # the town and its trees in the water
    for i in range(int((x1 - x0) / 9)):
        x = random.uniform(x0, x1); y = interp(wl, x) + random.uniform(4, 12); L = random.uniform(10, 30)
        wash(poly([(x - 3, y), (x + 3, y), (x + 2, y + L), (x - 2, y + L)]), col, 0.3, "wcs", g=True)
wash(poly([(x, interp(wl, x) - 5 + jit(1.5)) for x in range(0, 1161, 20)] + [(x, interp(wl, x) + 3) for x in range(1160, -1, -20)]), "#B49A6C", 0.85, "wcs")   # the bare bank at low water
ink(open_path(wl), 1.6, 0.6)
for i in range(90):   # wind riffles, left as paper
    x = random.uniform(0, 2400); y = random.uniform(756, 990)
    t = (y - 750) / 250
    if y > 1000 - (x - 1380) * 0.18 and x > 1380: continue
    L = random.uniform(24, 60) * (0.6 + t)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-3 - t * 3:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{1.6 + t * 2:.1f}" fill="none" stroke-linecap="round" opacity="0.85"/>')
    if random.random() < 0.3: ink(f"M{x + 4:.0f},{y + 5:.0f} q{L / 3:.0f},-2 {L * 0.6:.0f},0", 0.9, 0.35)

# --- The near bank, bottom right: sand, granite, dry grass, willows and spruce.
INKSCALE = 1.15
bank = [(1380, 1000), (1600, 954), (1800, 914), (2000, 886), (2200, 868), (2400, 858)]
wash("M1380,1000 " + smooth(bank) + f" L2400,{H} Z", "#D3B47A", 0.92, "wc1")
wash("M1700,1000 C1900,960 2150,930 2400,920 L2400,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for x0, w in [(1560, 70), (1880, 90)]:   # willows at the water's edge, red in October
    base = interp(bank, x0) + 14; wands = []
    for k in range(int(w / 7)):
        sx = x0 + k * 7 + jit(3); hgt = random.uniform(30, 62); lean = jit(8)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.1, 0.75, color="#6E2418")
        wands.append(f"M{sx + lean * 0.6 - 5:.0f},{base - hgt * 0.62:.0f} a5,{hgt * 0.38:.0f} 0 1,0 10,0 a5,{hgt * 0.38:.0f} 0 1,0 -10,0 Z")
    wash(" ".join(wands), "#C24A2C", 0.8, "wcs"); wash(" ".join(wands), "#E8A23E", 0.3, "wcs", g=True)
for i in range(160):
    x = random.uniform(1450, 2400); top = interp(bank, x) + random.uniform(6, 120)
    if top > 995: continue
    L = random.uniform(10, 26); ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.42)
for cx, cy, r in [(1720, 950, 30), (1770, 958, 18), (2010, 920, 40), (2260, 900, 26), (2090, 940, 20)]:
    rock(cx, cy, r)
for i in range(30):
    x = random.uniform(1500, 2400); y = interp(bank, x) + random.uniform(20, 120)
    if y < 990: wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", random.choice(["#E2B92E", "#C8642E", "#9DA58A"]), 0.75, "wcs", g=True)
spruce(2350, 900, 230); spruce(2214, 892, 150)

finish(sys.argv[1])
