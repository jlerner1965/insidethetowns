"""Evergreen hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Evergreen Lake on an autumn morning, looking up the valley as the guide's
photo from the shore does: the forested hill with its bare granite crown on
the left, the distant blue peaks in the gap, and the pine-dark hill rising on
the right with granite showing through. On the far shore, the boardwalk and
the Evergreen Lake House, a long log building with a glazed log gable facing
the water, a stone base and a sage roof, between blue spruces and gold
aspens. Beyond it, brought to the water's edge for the picture, downtown on
Highway 74: the timber Little Bear with its balcony, bunting and hanging
sign, the sage-green clapboard building with its two gables, the red cafe
with its round sign, the grey clapboard building and the two-storey green
building under their rusty tin roofs, with the highway's guardrail along the
lake. The near bank has granite boulders and dry grass.

Drawn from the guide's own photographs in content/evergreen/images/:
evergreen-lake-from-the-shore.jpg (the hills, the granite crown, the far
peaks, the rock at the water), evergreen-lake.jpg (the ponderosa hillside,
its granite outcrop, the shore fence), evergreen-lake-trail.jpg (the Lake
House, the boardwalk, the blue spruces and the trees behind),
evergreen-lake-ice-skating.jpg (the rounded hill, the tawny meadows with
their scattered pines, the guardrail along Highway 74), highway-74-downtown.jpg
(the Little Bear, the green gabled building, the pines and granite on the
hill behind) and hero.jpg (the green gabled building, the red cafe, the grey
building, the two-storey green building, the heart sign and the antenna).
Nothing stands for a building those photographs do not show.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

def blob(x, y, rx, ry):
    return f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z"

def spire(x, y, r):
    """A fir or spruce seen far off: a narrow, slightly stepped spire."""
    return (f"M{x:.1f},{y - r * 2.3:.1f} L{x + r * 0.45:.1f},{y - r * 1.2:.1f} L{x + r * 0.3:.1f},{y - r * 1.1:.1f} "
            f"L{x + r * 0.85:.1f},{y + r * 0.4:.1f} L{x - r * 0.85:.1f},{y + r * 0.4:.1f} L{x - r * 0.3:.1f},{y - r * 1.1:.1f} L{x - r * 0.45:.1f},{y - r * 1.2:.1f} Z")

def forest(ridge, x0, x1, top, depth, n, cols, rmin, rmax, op=0.8, firs=0.45):
    """Timber on a hillside: n tree dabs below the ridge line, one glaze per colour.
    `top` is how far below the ridge the timber starts (a number, or a function of x)."""
    groups = {c: [] for c in cols}
    for i in range(n):
        x = random.uniform(x0, x1)
        t = top(x) if callable(top) else top
        y = interp(ridge, x) + random.uniform(t, max(t + 1, depth))
        r = random.uniform(rmin, rmax)
        groups[random.choice(cols)].append(spire(x, y, r * 0.8) if random.random() < firs else blob(x, y, r, r * 0.72))
    for c, ds in groups.items():
        if ds: wash(" ".join(ds), c, op, "wcs", g=True)

def crest(ridge, x0, x1, col, rmin, rmax, gap=(12, 26), skip=0.12, firs=0.5, avoid=None):
    """Trees along a ridge line, so the hill's edge reads as timber against what is behind."""
    ds, x = [], x0
    while x < x1:
        if random.random() < skip or (avoid and avoid[0] < x < avoid[1]):
            x += random.uniform(30, 60); continue
        r = random.uniform(rmin, rmax); y = interp(ridge, x) + r * 0.5
        ds.append(spire(x, y, r * 0.8) if random.random() < firs else blob(x, y - r * 0.3, r, r * 0.8))
        x += random.uniform(*gap)
    wash(" ".join(ds), col, 0.9, "wcs")

def outcrop(cx, cy, r):
    """Granite breaking through the timber: a pale rounded slab with a shaded side and a crack."""
    d = f"M{cx - r:.0f},{cy + r * 0.3:.0f} C{cx - r:.0f},{cy - r * 0.5:.0f} {cx - r * 0.3:.0f},{cy - r * 0.75:.0f} {cx + r * 0.2:.0f},{cy - r * 0.7:.0f} C{cx + r * 0.8:.0f},{cy - r * 0.6:.0f} {cx + r:.0f},{cy - r * 0.1:.0f} {cx + r:.0f},{cy + r * 0.3:.0f} Z"
    wash(d, "#CDBFA9", 0.94, "wcs")
    wash(f"M{cx + r * 0.15:.0f},{cy - r * 0.68:.0f} C{cx + r * 0.8:.0f},{cy - r * 0.6:.0f} {cx + r:.0f},{cy - r * 0.1:.0f} {cx + r:.0f},{cy + r * 0.3:.0f} L{cx + r * 0.1:.0f},{cy + r * 0.3:.0f} Z", "#8C7A9C", 0.35, "wcs", g=True)
    ink(d, 1.3, 0.7)
    ink(line([(cx - r * 0.1, cy - r * 0.6), (cx - r * 0.2 + jit(3), cy + r * 0.25)]), 0.9, 0.5)

def granite(cx, cy, r):
    """A granite boulder at the water or in the grass: grey, rounded, lichen on the top."""
    d = f"M{cx - r:.0f},{cy:.0f} C{cx - r:.0f},{cy - r * 0.75:.0f} {cx - r * 0.35:.0f},{cy - r * 0.95:.0f} {cx + r * 0.15:.0f},{cy - r * 0.9:.0f} C{cx + r * 0.85:.0f},{cy - r * 0.85:.0f} {cx + r * 1.05:.0f},{cy - r * 0.35:.0f} {cx + r:.0f},{cy:.0f} Z"
    wash(d, "#BDB1A4", 0.94, "wcs")
    wash(f"M{cx + r * 0.1:.0f},{cy - r * 0.88:.0f} C{cx + r * 0.85:.0f},{cy - r * 0.85:.0f} {cx + r * 1.05:.0f},{cy - r * 0.35:.0f} {cx + r:.0f},{cy:.0f} L{cx:.0f},{cy:.0f} C{cx + r * 0.35:.0f},{cy - r * 0.45:.0f} {cx + r * 0.3:.0f},{cy - r * 0.7:.0f} {cx + r * 0.1:.0f},{cy - r * 0.88:.0f} Z", "#6E6488", 0.5, "wcs", g=True)
    wash(blob(cx - r * 0.3, cy - r * 0.62, r * 0.28, r * 0.12), "#C9A64E", 0.4, "wcs", g=True)
    ink(d, 1.7, 0.8)
    ink(f"M{cx - r * 0.2:.0f},{cy - r * 0.85:.0f} q{r * 0.15:.0f},{r * 0.4:.0f} {r * 0.05:.0f},{r * 0.8:.0f}", 1.0, 0.45)

def spruce(x, base, h, col="#6E9094", shade="#3E5A60"):
    """A blue spruce: a narrow spire in tiers, darker on the side away from the light."""
    w = h * 0.3
    R = []
    for k in range(1, 7):
        t = k / 6; y = base - h + h * 0.9 * t
        R += [(x + w * t * 0.55, y - h * 0.045), (x + w * t, y)]
    L = [(2 * x - px, py) for px, py in reversed(R)]
    pts = [(x, base - h)] + R + [(x + 3, base - h * 0.08), (x - 3, base - h * 0.08)] + L
    wash(poly(pts), col, 0.93, "wcs")
    wash(poly([(x, base - h)] + R + [(x + 3, base - h * 0.08), (x, base - h * 0.08)]), shade, 0.45, "wcs", g=True)
    ink(poly(pts), 1.1, 0.6)
    ink(line([(x, base), (x, base - h * 0.1)]), 1.6, 0.75)

def aspens(x, base, n, h):
    """A grove of aspens in October: narrow gold crowns over pale trunks with dark eyes."""
    crowns, shades, trunks = [], [], []
    for k in range(n):
        tx = x + k * h * 0.2 + jit(h * 0.04); th = h * random.uniform(0.8, 1.1)
        rx, ry, cy = th * 0.17, th * 0.31, base - th * 0.64
        crowns.append(blob(tx, cy, rx, ry))
        shades.append(f"M{tx + rx * 0.1:.1f},{cy - ry:.1f} a{rx:.1f},{ry:.1f} 0 0,1 0,{2 * ry:.1f} Z")
        trunks.append((tx, th))
    wash(" ".join(crowns), random.choice(["#F1B232", "#EBAA36", "#F0BC3E"]), 0.92, "wc2")
    wash(" ".join(shades), "#D07A24", 0.45, "wcs", g=True)
    for tx, th in trunks:
        add(f'<path d="M{tx - 1.6:.1f},{base:.1f} L{tx - 1.2:.1f},{base - th * 0.5:.1f} L{tx + 1.2:.1f},{base - th * 0.5:.1f} L{tx + 1.6:.1f},{base:.1f} Z" fill="#F7F2E8"/>')
        ink(line([(tx + 1.8, base), (tx + 1.4, base - th * 0.48)]), 0.8, 0.6)
        for e in range(3):
            ey = base - th * random.uniform(0.08, 0.42)
            ink(line([(tx - 1.4, ey), (tx + 1.4, ey + 1)]), 0.9, 0.7)

def aspen_patch(cx, cy, n, s):
    """A stand of gold aspens on a timbered slope: narrow crowns, shaded on one side."""
    crowns, shades = [], []
    for k in range(n):
        x = cx + jit(s * 1.1); y = cy + jit(s * 0.45); rx, ry = s * random.uniform(0.3, 0.4), s * random.uniform(0.6, 0.85)
        crowns.append(f"M{x:.1f},{y - ry:.1f} C{x + rx:.1f},{y - ry * 0.4:.1f} {x + rx:.1f},{y + ry * 0.6:.1f} {x:.1f},{y + ry:.1f} C{x - rx:.1f},{y + ry * 0.6:.1f} {x - rx:.1f},{y - ry * 0.4:.1f} {x:.1f},{y - ry:.1f} Z")
        shades.append(f"M{x:.1f},{y - ry:.1f} C{x + rx:.1f},{y - ry * 0.4:.1f} {x + rx:.1f},{y + ry * 0.6:.1f} {x:.1f},{y + ry:.1f} Z")
    wash(" ".join(crowns), random.choice(["#EBAA36", "#F0BC3E"]), 0.9, "wcs")
    wash(" ".join(shades), "#C8702A", 0.4, "wcs", g=True)

def clapboard(x, w, eave, apex, top_y, bot_y, step=7, op=0.28):
    """Siding lines across a wall that may end in a gable."""
    for y in range(int(top_y) + 6, int(bot_y), step):
        if apex is not None and y < eave:
            half = w / 2 * (y - apex) / (eave - apex)
            x0, x1 = x + w / 2 - half + 3, x + w / 2 + half - 3
        else:
            x0, x1 = x + 3, x + w - 3
        if x1 - x0 > 8: ink(line([(x0, y), (x1, y)]), 0.6, op)

def tin_roof(q, col="#A65F38", step=7):
    """A rusty corrugated tin roof: q is bottom-left, bottom-right, top-right, top-left."""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = q
    wash(poly(q), col, 0.92, "wcs")
    n = max(2, int(abs(x1 - x0) / step))
    for k in range(1, n):
        t = k / n
        ink(line([(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t), (x3 + (x2 - x3) * t, y3 + (y2 - y3) * t)]), 0.55, 0.32)
    for k in range(max(1, n // 5)):   # rust running down the sheets
        t = random.uniform(0.05, 0.9); dt = random.uniform(0.02, 0.05)
        wash(poly([(x0 + (x1 - x0) * t, y0), (x0 + (x1 - x0) * (t + dt), y0), (x3 + (x2 - x3) * (t + dt), y3), (x3 + (x2 - x3) * t, y3)]), "#7A3A24", 0.3, "wcs", g=True)
    ink(poly(q), 1.4, 0.8)

def scallops(x0, x1, y, col, r=6):
    d = " ".join(f"M{sx:.0f},{y:.0f} a{r},{r * 0.8:.0f} 0 0,0 {2 * r},0 Z" for sx in range(int(x0), int(x1 - 2 * r + 1), 2 * r))
    wash(d, col, 0.92, "wcs")
    ink(" ".join(f"M{sx:.0f},{y:.0f} a{r},{r * 0.8:.0f} 0 0,0 {2 * r},0" for sx in range(int(x0), int(x1 - 2 * r + 1), 2 * r)), 0.9, 0.6)

def stones(x0, x1, y0, y1, n, op=0.45):
    for i in range(n):
        sx = random.uniform(x0 + 4, x1 - 10); sy = random.uniform(y0 + 3, y1 - 4)
        ink(blob(sx, sy, random.uniform(4, 8), random.uniform(2.5, 4)), 0.8, op)

# --- Sky: the family's loose wash, clouds left as paper with warm undersides.
sky()
for cx, cy, s in [(250, 118, 58), (930, 92, 44), (1600, 136, 68), (2200, 100, 46), (520, 286, 28), (1330, 292, 30)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1090, 232, 11), (1126, 218, 8), (1158, 242, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The distant peaks in the gap up the valley, cool and hazy.
INKSCALE = 0.55
far = [(0, 470), (300, 462), (600, 466), (900, 448), (1040, 436), (1140, 420), (1210, 404), (1250, 396), (1300, 404), (1360, 398),
       (1420, 380), (1460, 368), (1490, 372), (1550, 392), (1640, 408), (1760, 420), (1900, 430), (2100, 438), (2400, 446)]
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
forest(far, 1000, 1800, 18, 70, 120, ["#8C93B8"], 4, 7, op=0.22)
wash(poly([(x, interp(far, x)) for x in range(1462, 1700, 12)] + [(1700, 470), (1520, 470)]), "#7F7699", 0.2, "wc3", g=True)
ink(open_path(far), 1.4, 0.55)
mid = [(0, 500), (300, 492), (700, 486), (1000, 470), (1180, 462), (1340, 472), (1480, 458), (1620, 464), (1800, 474), (2100, 480), (2400, 484)]
wash(ridge_d(mid), "#8193AC", 0.8, "wc3")
forest(mid, 1000, 1800, 6, 50, 160, ["#6F7F9C"], 5, 10, op=0.4)
ink(open_path(mid), 1.2, 0.45)

# The meadow line along the far shore, defined now so the hills know where they end.
floor = [(0, 652), (300, 646), (600, 640), (900, 630), (1150, 620), (1350, 614), (1500, 626), (1620, 664), (1700, 712)]

# --- The hill with the granite crown, as the photo from the shore has it.
INKSCALE = 0.75
dome = [(160, 640), (300, 580), (440, 512), (560, 456), (660, 410), (740, 382), (810, 368), (870, 364), (930, 368), (1000, 384),
        (1080, 416), (1170, 460), (1270, 508), (1380, 552), (1500, 590), (1600, 622)]
wash(ridge_d(dome), "#899A6C", 0.9, "wc1")
wash(f"M930,368 C1000,384 1080,416 1170,460 C1270,508 1380,552 1500,590 L1600,622 L1600,{H} L1160,{H} C1110,640 1040,460 930,368 Z", "#7F7699", 0.28, "wc3", g=True)
def cthick(x): return max(5, 64 * math.sin(math.pi * (x - 690) / 360) + 6 * math.sin(x / 13))
ctop = [(x, interp(dome, x) - 1) for x in range(690, 1051, 10)]
cbot = [(x, interp(dome, x) + cthick(x) + jit(4)) for x in range(1050, 689, -10)]
wash(poly(ctop + cbot), "#D3C7B3", 0.94, "wc2")
wash(poly([(x, y) for x, y in ctop if x >= 900] + [(x, y) for x, y in cbot if x >= 860]), "#8C7A9C", 0.3, "wc2", g=True)
for i in range(26):   # joints and slabs in the granite
    x = random.uniform(705, 1035); y0 = interp(dome, x) + random.uniform(4, 16)
    if y0 + 14 < interp(dome, x) + cthick(x):
        ink(line([(x, y0), (x + jit(5), min(y0 + random.uniform(10, 30), interp(dome, x) + cthick(x) - 2))]), 0.9, 0.45)
for i in range(8):
    x = random.uniform(720, 1000); y = interp(dome, x) + cthick(x) * random.uniform(0.35, 0.7)
    ink(f"M{x:.0f},{y:.0f} q18,-5 36,1", 0.9, 0.35)
forest(dome, 700, 1040, lambda x: cthick(x) * 0.5, 0, 34, ["#5E7458", "#6E8460"], 5, 9, op=0.75)
forest(dome, 280, 1600, lambda x: cthick(x) + 2 if 690 < x < 1050 else 8, 280, 950, ["#5E7458", "#4A6248", "#6E8460"], 7, 15, op=0.5)
aspen_patch(1150, 500, 6, 24)
wash(f"M160,640 C300,580 440,512 560,456 C660,410 740,382 810,368 C760,470 700,560 640,{H} L160,{H} Z", "#E9C27E", 0.18, "wc3", g=True)   # morning on the sunny flank
crest(dome, 300, 1600, "#4F6A4E", 6, 11, firs=0.75, avoid=(680, 1060))
ink(open_path(dome), 1.8, 0.7)

# --- The near hill on the left, dark with timber, falling to the meadow.
INKSCALE = 0.8
lefthill = [(-20, 404), (80, 412), (200, 436), (330, 476), (450, 524), (550, 572), (640, 616), (720, 650)]
wash(ridge_d(lefthill), "#73855A", 0.92, "wc1")
forest(lefthill, -10, 720, 10, 300, 760, ["#4A6248", "#3F5A44", "#5E7458"], 8, 16, op=0.52)
crest(lefthill, -10, 700, "#3F5A44", 8, 14, firs=0.7)
aspen_patch(250, 560, 6, 22); aspen_patch(540, 612, 5, 20)
ink(open_path(lefthill), 2.0, 0.7)
for i in range(20):   # slope strokes following the fall line
    x = random.uniform(20, 600); y0 = interp(lefthill, x) + random.uniform(40, 200)
    if y0 < 620: ink(line([(x, y0), (x + 10, y0 + 20)]), 0.9, 0.22)

# --- The hill on the right, behind downtown: ponderosa timber with granite showing.
INKSCALE = 0.85
righthill = [(1250, 640), (1340, 580), (1440, 530), (1560, 482), (1680, 444), (1800, 410), (1930, 378), (2060, 350), (2200, 328), (2320, 314), (2420, 308)]
wash(ridge_d(righthill), "#7D8D5A", 0.92, "wc1")
wash(f"M1250,640 C1300,600 1380,550 1440,530 C1500,510 1540,494 1560,482 C1540,560 1480,640 1420,720 Z", "#E9C27E", 0.25, "wc3", g=True)   # morning light on the near flank
forest(righthill, 1260, 2420, 8, 400, 1350, ["#4A6248", "#3F5A44", "#5E7458", "#6E8460"], 8, 17, op=0.5)
for cx, cy, n, s2 in [(1470, 560, 7, 26), (1790, 500, 6, 24), (2160, 452, 7, 24), (2390, 420, 5, 22)]:
    aspen_patch(cx, cy, n, s2)
for cx, cy, r in [(1890, 404, 26), (1930, 398, 18), (2230, 346, 30), (2272, 354, 16), (1640, 476, 16), (2100, 420, 20)]:
    outcrop(cx, cy, r)
    wash(" ".join(spire(cx + jit(r * 1.1), cy + r * random.uniform(0.3, 0.6), random.uniform(6, 10)) for k in range(4)), "#3F5A44", 0.75, "wcs", g=True)
crest(righthill, 1260, 2420, "#3F5A44", 9, 18)
for x, h in [(1720, 70), (2010, 84), (2350, 78)]:
    ponderosa(x, interp(righthill, x) + 14, h)
ink(open_path(righthill), 2.0, 0.75)

# --- The meadows on the far shore: tawny in October, a little green left on the
# course behind the Lake House, scattered ponderosas as on the ice-skating photo.
wash(ridge_d(floor), "#BCA862", 0.88, "wc3")
wash("M1080,640 C1200,616 1400,612 1560,630 C1600,660 1620,690 1600,712 L1100,712 Z", "#A3A85C", 0.32, "wc3", g=True)
wash("M0,676 C300,664 700,660 1100,668 L1100,722 L0,726 Z", "#8F7F5C", 0.38, "wc3", g=True)
crest(floor[:7], -10, 1420, "#4F6A4E", 7, 12, gap=(10, 22), skip=0.25)
for i in range(110):
    x = random.uniform(0, 1500); y = random.uniform(interp(floor, x) + 12, 712)
    ink(line([(x, y), (x + jit(4), y - random.uniform(6, 12))]), 0.8, 0.3)
for x, y, h in [(90, 676, 46), (250, 668, 38), (420, 690, 52), (560, 664, 34), (700, 684, 44), (980, 660, 36), (1110, 652, 30)]:
    ponderosa(x, y, h)

# Broad gold trees behind the Lake House, aspens on the meadow edge.
for x, r in [(1236, 50), (1340, 56), (1452, 50)]:
    cottonwood(x, 646, r, back=True, shadow=False)
aspens(1060, 690, 4, 70)
aspens(1520, 668, 3, 64)
# Tall pines and gold aspens on the slope behind downtown.
for x, h in [(1610, 120), (1760, 140), (1905, 128), (2060, 150), (2200, 132), (2330, 146)]:
    ponderosa(x + jit(10), 690, h)
aspens(1680, 692, 3, 96); aspens(1990, 690, 4, 104); aspens(2270, 692, 3, 98)

# --- Evergreen Lake.
INKSCALE = 1.1
lt = [(0, 724), (300, 721), (600, 719), (900, 717), (1160, 719), (1300, 726), (1450, 731), (1540, 742), (1600, 760), (1800, 765), (2100, 767), (2400, 769)]
wash(ridge_d(lt), "#7FA9C2", 0.92, "wc3")
dense = [(x, interp(lt, x)) for x in range(0, 2401, 40)]
wash(poly([(x, y + 2) for x, y in dense] + [(x, y + 92 + 22 * math.sin(x / 80) + jit(6)) for x, y in reversed(dense)]), "#4F6E5E", 0.34, "wc3", g=True)   # the timber in the water
wash(poly([(x, y + 2) for x, y in dense] + [(x, y + 40 + 10 * math.sin(x / 50)) for x, y in reversed(dense)]), "#3F5A50", 0.22, "wc2", g=True)
for x, w in [(1090, 40), (1250, 50), (1340, 56), (1450, 50), (1545, 30)]:
    wash(blob(x, interp(lt, x) + 22, w, 12), "#E2B55A", 0.35, "wcs", g=True)   # and the gold
for k in range(16):   # the Lake House and its spruces, broken up by the ripples
    sx = 1150 + k * 26 + jit(6); col = "#5E7F7A" if k in (0, 1, 15) else ("#56606E" if 3 <= k <= 6 else "#C68E52")
    wash(poly([(sx, interp(lt, sx) + 4), (sx + 14, interp(lt, sx) + 4), (sx + 12 + jit(3), interp(lt, sx) + random.uniform(40, 70)), (sx + 2, interp(lt, sx) + random.uniform(40, 70))]), col, 0.26, "wcs", g=True)
wash("M0,880 C600,860 1400,890 2400,870 L2400,1000 L0,1000 Z", "#4F7C9A", 0.32, "wc3", g=True)
ink(open_path(lt), 1.4, 0.5)

# The boardwalk along the shore, on piles, with its rail.
def boardwalk(x0, x1, y):
    WOOD, WOOD_D = "#A9774A", "#6E4A32"
    wash(poly([(x0, y + 8), (x1, y + 8), (x1, y + 20), (x0, y + 20)]), "#3F5A6A", 0.3, "wcs", g=True)   # its shadow on the water
    for px in range(int(x0) + 6, int(x1), 26):
        ink(line([(px, y + 6), (px, y + 18)]), 1.4, 0.75, color=WOOD_D)
    deck = poly([(x0 - 4, y), (x1 + 4, y), (x1 + 4, y + 8), (x0 - 4, y + 8)])
    wash(deck, WOOD, 0.93, "wcs")
    ink(deck, 1.3, 0.8)
    ink(line([(x0, y - 22), (x1, y - 22)]), 1.6, 0.85, color=WOOD_D)
    ink(line([(x0, y - 11), (x1, y - 11)]), 1.0, 0.6, color=WOOD_D)
    for px in range(int(x0), int(x1) + 1, 22):
        ink(line([(px, y), (px, y - 24)]), 1.4, 0.85, color=WOOD_D)
boardwalk(770, 1140, 728)

# --- Shore trees on the left: spruces, aspens and a pine or two at the waterline.
for x, kind, h in [(28, "s", 76), (58, "s", 54), (150, "a", 64), (262, "p", 50), (318, "s", 62), (402, "a", 74), (446, "a", 56), (548, "s", 70), (586, "s", 50), (690, "a", 62), (744, "s", 58)]:
    b = interp(lt, x) - 3
    if kind == "s": spruce(x, b, h, col="#55776E", shade="#34504A")
    elif kind == "a": aspens(x - 12, b, 3, h)
    else: ponderosa(x, b, h)
ink(open_path([(x, interp(lt, x) - 22) for x in range(0, 760, 40)]), 1.1, 0.45)   # the shore fence
for x in range(10, 760, 40):
    ink(line([(x, interp(lt, x) - 30), (x + 1, interp(lt, x) - 6)]), 1.4, 0.55)

# --- The Evergreen Lake House.
def lake_house(x, b):
    """Honey log walls on a stone base, a long low sage roof with a lower wing to the
    right and a stone chimney, and the big glazed log gable facing the water, over
    a log railing and the stone wall at the shore."""
    w = 320
    LOG, LOG_D, ROOF, ROCK = "#C68E52", "#8A5A32", "#8E9684", "#ABA69A"
    wing = poly([(x + 232, b - 52), (x + 256, b - 84), (x + w - 10, b - 84), (x + w + 12, b - 52)])
    wash(wing, ROOF, 0.92, "wcs")
    ink(wing, 1.5, 0.8)
    roof = poly([(x - 12, b - 52), (x + 30, b - 94), (x + 232, b - 94), (x + 264, b - 52)])
    wash(roof, ROOF, 0.92, "wcs")
    for y in range(b - 88, b - 54, 7):   # shingle courses
        ink(line([(x - 8 + (b - 52 - y), y), (x + 260 - (b - 52 - y) * 0.76, y)]), 0.6, 0.25)
    wash(poly([(x - 12, b - 52), (x + w + 12, b - 52), (x + w + 4, b - 60), (x - 4, b - 60)]), "#5E6658", 0.35, "wcs", g=True)
    ink(roof, 1.6, 0.85)
    for cx, h2 in [(x + 214, 24), (x + 286, 14)]:   # the chimney and a vent
        top = (b - 94 if cx < x + 232 else b - 84) - h2
        ch = poly([(cx, top + h2 + 4), (cx, top), (cx + 16, top), (cx + 16, top + h2 + 4)])
        wash(ch, ROCK, 0.92, "wcs"); ink(ch, 1.2, 0.8)
        ink(line([(cx - 3, top), (cx + 19, top)]), 1.6, 0.85)
    walls = poly([(x, b), (x, b - 52), (x + w, b - 52), (x + w, b)])
    wash(walls, LOG, 0.93, "wcs")
    wash(poly([(x + w * 0.8, b - 52), (x + w, b - 52), (x + w, b), (x + w * 0.8, b)]), LOG_D, 0.28, "wcs", g=True)
    wash(poly([(x, b - 52), (x + w, b - 52), (x + w, b - 43), (x, b - 43)]), LOG_D, 0.45, "wcs", g=True)   # shadow under the eaves
    for y in range(b - 48, b - 12, 6):
        ink(line([(x + 2, y), (x + w - 2, y)]), 0.6, 0.3)
    wash(poly([(x, b), (x, b - 12), (x + w, b - 12), (x + w, b)]), ROCK, 0.9, "wcs", g=True)
    stones(x, x + w, b - 12, b, 22)
    for wx, ww in [(x + 12, 22), (x + 184, 20), (x + 210, 20), (x + 270, 18), (x + 294, 18)]:
        wash(poly([(wx, b - 16), (wx, b - 40), (wx + ww, b - 40), (wx + ww, b - 16)]), WIN, 0.8, "wcs", g=True)
        ink(poly([(wx, b - 16), (wx, b - 40), (wx + ww, b - 40), (wx + ww, b - 16)]), 1.1, 0.7)
        ink(line([(wx + ww / 2, b - 40), (wx + ww / 2, b - 16)]), 0.7, 0.5)
    ink(walls, 1.8, 0.85)
    for cxx in (x, x + w):   # log ends at the corners
        for y in range(b - 48, b - 12, 6):
            ink(blob(cxx, y + 3, 3.2, 2.6), 0.8, 0.55)
    # The glazed front gable.
    gx = x + 106
    face = poly([(gx - 58, b), (gx - 58, b - 56), (gx, b - 120), (gx + 58, b - 56), (gx + 58, b)])
    wash(face, LOG, 0.95, "wcs")
    wash(poly([(gx, b - 120), (gx + 58, b - 56), (gx + 58, b), (gx + 30, b)]), LOG_D, 0.2, "wcs", g=True)
    tri = poly([(gx - 46, b - 60), (gx, b - 108), (gx + 46, b - 60)])
    low = poly([(gx - 46, b - 52), (gx + 46, b - 52), (gx + 46, b - 14), (gx - 46, b - 14)])
    for p in (tri, low):
        add(f'<path d="{p}" fill="{PAPER}"/>')
        wash(p, "#56606E", 0.85, "wcs", g=True)
    for k in range(3):   # the morning in the glass
        sx = gx - 40 + k * 30
        wash(poly([(sx, b - 18), (sx + 10, b - 50), (sx + 18, b - 50), (sx + 8, b - 18)]), "#E9C27E", 0.35, "wcs", g=True)
    for mx in (gx - 23, gx, gx + 23):
        ink(line([(mx, b - 60 - (46 - abs(mx - gx)) * 48 / 46), (mx, b - 60)]), 1.0, 0.75)
        ink(line([(mx, b - 52), (mx, b - 14)]), 1.0, 0.75)
    ink(line([(gx - 46, b - 34), (gx + 46, b - 34)]), 0.9, 0.6)
    ink(line([(gx - 60, b - 56), (gx + 60, b - 56)]), 3.0, 0.9)   # the tie beam
    ink(line([(gx - 26, b - 56), (gx, b - 84), (gx + 26, b - 56)]), 1.4, 0.75)   # and the truss
    for px in (gx - 54, gx + 50):
        wash(poly([(px, b - 56), (px + 5, b - 56), (px + 5, b - 12), (px, b - 12)]), LOG_D, 0.6, "wcs", g=True)
    band = poly([(gx - 74, b - 48), (gx, b - 132), (gx + 74, b - 48), (gx + 62, b - 48), (gx, b - 120), (gx - 62, b - 48)])
    wash(band, ROOF, 0.95, "wcs")
    ink(line([(gx - 74, b - 48), (gx, b - 132), (gx + 74, b - 48)]), 1.8, 0.85)
    ink(line([(gx - 62, b - 48), (gx, b - 120), (gx + 62, b - 48)]), 1.1, 0.7)
    ink(face, 1.6, 0.8)
    # The log railing on the terrace and the stone wall down to the water.
    wall = poly([(x - 34, b + 20), (x - 30, b + 2), (x + w + 30, b + 2), (x + w + 34, b + 20)])
    wash(wall, ROCK, 0.92, "wcs")
    stones(x - 30, x + w + 30, b + 2, b + 20, 40, 0.5)
    ink(wall, 1.5, 0.8)
    ink(line([(x - 30, b - 12), (x + w + 30, b - 12)]), 1.8, 0.85, color="#6E4A32")
    ink(line([(x - 30, b - 5), (x + w + 30, b - 5)]), 1.0, 0.6, color="#6E4A32")
    for px in range(int(x - 30), int(x + w + 31), 20):
        ink(line([(px, b - 14), (px, b + 2)]), 1.4, 0.8, color="#6E4A32")
    add(f'<path d="M{x - 40},{b + 22} q{(w + 80) / 2},6 {w + 80},0" stroke="#FBF7EE" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.85"/>')

INKSCALE = 1.0
lake_house(1196, 702)
spruce(1176, 716, 104); spruce(1150, 718, 76)
spruce(1548, 722, 112); spruce(1580, 728, 78)

# --- Downtown on Highway 74, drawn at 0.9 and set from x 1600: right of the type
# on a desktop and inside a phone's crop of the right-hand side.
B = 712
def bunting(cx, y, r, d):
    """A pleated flag fan hung from a rail: red and white, a blue band at the top."""
    outer = f"M{cx - r:.1f},{y} a{r:.1f},{d:.1f} 0 0,0 {2 * r:.1f},0 Z"
    add(f'<path d="{outer}" fill="{PAPER}"/>')
    wash(outer, "#B8372B", 0.9, "wcs", g=True)
    add(f'<path d="M{cx - r * 0.74:.1f},{y} a{r * 0.74:.1f},{d * 0.7:.1f} 0 0,0 {2 * r * 0.74:.1f},0 Z" fill="#FBF8F2"/>')
    wash(f"M{cx - r * 0.5:.1f},{y} a{r * 0.5:.1f},{d * 0.44:.1f} 0 0,0 {r:.1f},0 Z", "#2F4A7A", 0.92, "wcs", g=True)
    for k in range(1, 6):
        a = math.pi * k / 6
        ink(line([(cx - r * 0.5 * math.cos(a), y + d * 0.44 * math.sin(a)), (cx - r * math.cos(a), y + d * math.sin(a))]), 0.6, 0.5)
    ink(f"M{cx - r:.1f},{y} a{r:.1f},{d:.1f} 0 0,0 {2 * r:.1f},0", 1.0, 0.7)

def little_bear(x):
    """The Little Bear: dark timber, a full-width balcony with bunting on its rail and
    the hanging sign, heavy log posts, cut-outs along the roofline, on a stone wall."""
    w, h = 190, 146
    TIM, TIM_D, POST = "#74523A", "#3E2B20", "#4E3527"
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, TIM, 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), TIM_D, 0.25, "wcs", g=True)
    for k in range(int(w / 8)):
        ink(line([(x + 4 + k * 8, B - h + 6), (x + 4 + k * 8, B - 26)]), 0.6, 0.3)
    wash(poly([(x + 4, B - h + 12), (x + w - 4, B - h + 12), (x + w - 4, B - 82), (x + 4, B - 82)]), TIM_D, 0.5, "wcs", g=True)
    for wx in (x + 24, x + 140):
        wash(poly([(wx, B - h + 24), (wx + 24, B - h + 24), (wx + 24, B - 90), (wx, B - 90)]), "#2E2A2E", 0.55, "wcs", g=True)
    wash(poly([(x + 4, B - 76), (x + w - 4, B - 76), (x + w - 4, B - 26), (x + 4, B - 26)]), TIM_D, 0.45, "wcs", g=True)
    for wx in (x + 16, x + 132):
        trimmed(wx, B - 66, 34, 30, "#6B5A4E")
    wash(poly([(x + 100, B - 26), (x + 100, B - 64), (x + 124, B - 64), (x + 124, B - 26)]), "#2E2A2E", 0.7, "wcs", g=True)
    ink(poly([(x + 100, B - 26), (x + 100, B - 64), (x + 124, B - 64), (x + 124, B - 26)]), 1.2, 0.75)
    ink(line([(x - 6, B - 80), (x + w + 6, B - 80)]), 2.8, 0.9)   # the balcony
    ink(line([(x + 2, B - 110), (x + w - 2, B - 110)]), 1.8, 0.85)
    for bx in range(int(x + 6), int(x + w - 2), 7):
        ink(line([(bx, B - 110), (bx, B - 82)]), 0.7, 0.5)
    for cx in (x + 35, x + 95, x + 155):
        bunting(cx, B - 110, 20, 19)
    for px in (x + 1, x + 61, x + 121, x + w - 10):   # heavy log posts
        p = poly([(px, B - 24), (px, B - h - 4), (px + 9, B - h - 4), (px + 9, B - 24)])
        wash(p, POST, 0.95, "wcs"); ink(p, 1.0, 0.7)
    beam = poly([(x - 8, B - h - 2), (x + w + 8, B - h - 2), (x + w + 8, B - h + 8), (x - 8, B - h + 8)])
    wash(beam, TIM_D, 0.85, "wcs", g=True); ink(beam, 1.4, 0.8)
    cuts, cx = [], x + 4
    while cx < x + w - 6:   # the row of wooden cut-outs, no two alike
        cw, ch = random.uniform(12, 20), random.uniform(10, 18)
        cuts.append((cx, cw, ch)); cx += cw + random.uniform(4, 9)
    cut = " ".join(f"M{c:.0f},{B - h - 2} L{c + jit(2):.0f},{B - h - ch * 0.6:.0f} C{c + cw * 0.1:.0f},{B - h - ch:.0f} {c + cw * 0.9:.0f},{B - h - ch - jit(3):.0f} {c + cw:.0f},{B - h - ch * 0.5:.0f} L{c + cw:.0f},{B - h - 2} Z" for c, cw, ch in cuts)
    wash(cut, "#8A5E40", 0.92, "wcs")
    ink(cut, 1.0, 0.65)
    for c, cw, ch in cuts[1::2]:
        add(f'<circle cx="{c + cw / 2:.0f}" cy="{B - h - ch * 0.55:.0f}" r="2.2" fill="#F4EFE6" opacity="0.75"/>')
    # The hanging sign, black ringed in yellow, under the balcony.
    ink(line([(x + 72, B - 80), (x + 72, B - 72)]), 1.0, 0.8)
    add(f'<path d="{blob(x + 72, B - 52, 12, 19)}" fill="#2E2A28" opacity="0.92" filter="url(#wcs)"/>')
    ink(blob(x + 72, B - 52, 10, 16), 1.4, 0.85, color="#D9A63E")
    wash(blob(x + 72, B - 56, 5, 4), "#C9A64E", 0.85, "wcs", g=True)
    # The mortared stone wall it stands on, with its steps.
    sw = poly([(x - 6, B), (x - 6, B - 24), (x + w + 6, B - 24), (x + w + 6, B)])
    wash(sw, "#B5A68E", 0.93, "wcs")
    stones(x - 6, x + w + 6, B - 24, B, 30, 0.5)
    for y in (B - 8, B - 16):
        ink(line([(x + 72, y), (x + 110, y)]), 1.0, 0.6)
    ink(sw, 1.4, 0.75)
    return x + w

def green_gables(x):
    """The sage-green clapboard building: a tall front gable and a lower one beside it,
    white-trimmed windows, and a rusty tin roof over the porch."""
    SAGE, SAGE_D, SHING = "#8E9E7A", "#5E6E52", "#5E534C"
    w1, w2 = 104, 70
    for gxx, gw, eave, apex, sh in [(x + w1, w2, B - 108, B - 144, 0.3), (x, w1, B - 122, B - 176, 0)]:
        p = poly([(gxx, B), (gxx, eave), (gxx + gw / 2, apex), (gxx + gw, eave), (gxx + gw, B)])
        wash(p, SAGE, 0.93, "wcs")
        if sh: wash(p, SAGE_D, sh, "wcs", g=True)
        clapboard(gxx, gw, eave, apex, apex, B - 58)
        band = poly([(gxx - 8, eave + 4), (gxx + gw / 2, apex - 8), (gxx + gw + 8, eave + 4), (gxx + gw + 1, eave + 4), (gxx + gw / 2, apex + 2), (gxx - 1, eave + 4)])
        wash(band, SHING, 0.9, "wcs")
        ink(line([(gxx - 8, eave + 4), (gxx + gw / 2, apex - 8), (gxx + gw + 8, eave + 4)]), 1.8, 0.85)
        ink(p, 1.8, 0.85)
    for wx, wy, ww, wh in [(x + 18, B - 108, 20, 32), (x + 66, B - 108, 20, 32), (x + 42, B - 154, 20, 22), (x + w1 + 24, B - 100, 22, 30)]:
        trimmed(wx, wy, ww, wh, "#4A4752")
    wash(poly([(x + 2, B - 44), (x + w1 + w2 - 2, B - 44), (x + w1 + w2 - 2, B), (x + 2, B)]), "#5C5560", 0.5, "wcs", g=True)
    for wx in (x + 14, x + 70, x + w1 + 18):
        trimmed(wx, B - 36, 30, 26, "#6B5A4E")
    tin_roof([(x - 12, B - 44), (x + w1 + w2 + 12, B - 44), (x + w1 + w2 + 4, B - 60), (x - 4, B - 60)])
    for px in (x - 6, x + w1, x + w1 + w2 + 6):
        ink(line([(px, B - 44), (px, B)]), 1.6, 0.8)
    return x + w1 + w2

def red_shop(x):
    """The red board-and-batten cafe with its round sign and a tin roof over the door."""
    w, h = 88, 100
    RED, RED_D = "#B24A36", "#7A2A20"
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, RED, 0.93, "wcs")
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), RED_D, 0.3, "wcs", g=True)
    for k in range(1, int(w / 9)):
        ink(line([(x + k * 9, B - h + 8), (x + k * 9, B - 44)]), 0.7, 0.35)
    tr = poly([(x - 3, B - h - 6), (x + w + 3, B - h - 6), (x + w + 3, B - h + 3), (x - 3, B - h + 3)])
    add(f'<path d="{tr}" fill="#F4EFE6"/>'); ink(tr, 1.2, 0.75)
    trimmed(x + 44, B - h + 20, 30, 28)
    ink(line([(x - 6, B - h + 12), (x + 22, B - h + 12)]), 1.2, 0.8)
    add(f'<path d="{blob(x + 12, B - h + 36, 15, 15)}" fill="{PAPER}"/>')
    wash(blob(x + 12, B - h + 36, 15, 15), "#A8302A", 0.92, "wcs", g=True)
    add(f'<path d="{blob(x + 12, B - h + 36, 9, 9)}" fill="#F4EFE6" opacity="0.9"/>')
    ink(blob(x + 12, B - h + 36, 15, 15), 1.2, 0.8)
    wash(poly([(x + 2, B - 42), (x + w - 2, B - 42), (x + w - 2, B), (x + 2, B)]), "#5C5560", 0.5, "wcs", g=True)
    trimmed(x + 12, B - 34, 26, 24, "#6B5A4E")
    wash(poly([(x + 52, B), (x + 52, B - 36), (x + 74, B - 36), (x + 74, B)]), "#4E3527", 0.8, "wcs", g=True)
    ink(poly([(x + 52, B), (x + 52, B - 36), (x + 74, B - 36), (x + 74, B)]), 1.2, 0.75)
    tin_roof([(x - 10, B - 42), (x + w + 10, B - 42), (x + w + 4, B - 56), (x - 4, B - 56)])
    ink(body, 1.8, 0.85)
    return x + w

def grey_shop(x):
    """The grey clapboard building under a rusty corrugated roof, with big upper
    windows, the heart sign, and a long scalloped green awning."""
    w, h = 156, 112
    GREY, GREY_D = "#9AA29D", "#5F6A6A"
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, GREY, 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), GREY_D, 0.25, "wcs", g=True)
    clapboard(x, w, None, None, B - h, B - 60)
    tin_roof([(x - 12, B - h + 2), (x + w + 12, B - h + 2), (x + w - 6, B - h - 34), (x + 14, B - h - 34)])
    for wx in (x + 18, x + 94):
        trimmed(wx, B - h + 16, 44, 32)
    hx, hy = x + 78, B - h + 34
    wash(f"M{hx},{hy + 8} C{hx - 12},{hy - 1} {hx - 7},{hy - 11} {hx},{hy - 4} C{hx + 7},{hy - 11} {hx + 12},{hy - 1} {hx},{hy + 8} Z", "#C8302A", 0.92, "wcs")
    ink(f"M{hx},{hy + 8} C{hx - 12},{hy - 1} {hx - 7},{hy - 11} {hx},{hy - 4} C{hx + 7},{hy - 11} {hx + 12},{hy - 1} {hx},{hy + 8} Z", 1.0, 0.7)
    wash(poly([(x + 2, B - 46), (x + w - 2, B - 46), (x + w - 2, B), (x + 2, B)]), "#5C5560", 0.55, "wcs", g=True)
    for wx in (x + 12, x + 60, x + 108):
        trimmed(wx, B - 38, 36, 28, "#6B5A4E")
    aw = poly([(x + 2, B - 60), (x + w - 2, B - 60), (x + w + 6, B - 46), (x - 6, B - 46)])
    wash(aw, "#2F5A45", 0.92, "wcs")
    for k in range(1, int((w + 12) / 8)):
        ink(line([(x - 6 + k * 8, B - 46), (x + 2 + k * 7.6, B - 60)]), 0.6, 0.35)
    ink(aw, 1.3, 0.8)
    scallops(x - 6, x + w + 6, B - 46, "#2F5A45")
    ink(body, 1.8, 0.85)
    return x + w

def big_green(x):
    """The two-storey dark green building: a deep rusty tin roof on brackets, an open
    upper porch on log posts, a scalloped green awning, a TV antenna, a wooden fence."""
    w, h = 184, 156
    DG, DG_D, LOGP = "#41665A", "#263F37", "#B98A52"
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, DG, 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), DG_D, 0.3, "wcs", g=True)
    clapboard(x, w, None, None, B - h, B - 30, op=0.3)
    mx = x + w * 0.62   # the antenna, behind the roof
    ink(line([(mx, B - h - 36), (mx + 4, B - h - 92)]), 1.5, 0.9)
    for k, L in enumerate((54, 44, 34, 24)):
        yy = B - h - 88 + k * 9
        ink(line([(mx - L / 2, yy), (mx + L / 2 + 4, yy - 3)]), 1.2, 0.85)
    tin_roof([(x - 18, B - h + 2), (x + w + 18, B - h + 2), (x + w - 12, B - h - 42), (x + 24, B - h - 42)])
    for bx in range(int(x + 4), int(x + w - 4), 22):   # brackets under the eaves
        br = poly([(bx, B - h + 3), (bx + 9, B - h + 3), (bx + 1, B - h + 13)])
        wash(br, DG_D, 0.9, "wcs", g=True); ink(br, 0.8, 0.6)
    wash(poly([(x + 6, B - h + 14), (x + w - 6, B - h + 14), (x + w - 6, B - 88), (x + 6, B - 88)]), DG_D, 0.6, "wcs", g=True)
    for wx in (x + 30, x + 92, x + 146):
        wash(poly([(wx, B - h + 28), (wx + 22, B - h + 28), (wx + 22, B - 96), (wx, B - 96)]), "#1E2A28", 0.4, "wcs", g=True)
    ink(line([(x + 6, B - 108), (x + w - 6, B - 108)]), 1.6, 0.85)
    for px in (x + 10, x + 66, x + 122, x + w - 16):   # natural log posts
        p = poly([(px, B - 88), (px, B - h + 8), (px + 7, B - h + 8), (px + 7, B - 88)])
        wash(p, LOGP, 0.95, "wcs"); ink(p, 1.0, 0.7)
    aw = poly([(x - 6, B - 88), (x + w + 6, B - 88), (x + w + 12, B - 66), (x - 12, B - 66)])
    wash(aw, "#2F5A45", 0.92, "wcs")
    for k in range(1, int((w + 24) / 8)):
        ink(line([(x - 12 + k * 8, B - 66), (x - 6 + k * 7.7, B - 88)]), 0.6, 0.35)
    ink(aw, 1.4, 0.8)
    scallops(x - 12, x + w + 12, B - 66, "#2F5A45")
    wash(poly([(x + 2, B - 64), (x + w - 2, B - 64), (x + w - 2, B), (x + 2, B)]), "#3E3540", 0.45, "wcs", g=True)
    for wx in (x + 14, x + 64, x + 132):
        trimmed(wx, B - 56, 38, 34, "#6B5A4E")
    ink(body, 1.8, 0.85)
    for y in (B - 26, B - 13):   # the wooden fence along the front
        ink(line([(x - 14, y), (x + w + 14, y)]), 1.4, 0.8, color="#6E4A32")
    for px in range(int(x - 12), int(x + w + 14), 24):
        ink(line([(px, B - 32), (px, B + 2)]), 1.8, 0.85, color="#6E4A32")
    return x + w

TS = 0.9
X0 = 1604
add(f'<g transform="translate({X0} {B}) scale({TS}) translate({-X0} {-B})">')
xx = X0
xx = little_bear(xx) + 10
xx = green_gables(xx) + 10
xx = red_shop(xx) + 8
xx = grey_shop(xx) + 12
xx = big_green(xx)
add('</g>')
aspens(2368, 716, 2, 92)

# Highway 74 itself, and its guardrail along the lake.
wash(poly([(1590, B + 2), (2400, B + 2), (2400, B + 32), (1570, B + 32)]), "#BDB3A3", 0.82, "wcs")
wash(poly([(1590, B + 2), (2400, B + 2), (2400, B + 10), (1586, B + 10)]), "#7E7398", 0.4, "wcs", g=True)
ink(line([(1600, B + 21), (2400, B + 21)]), 1.8, 0.75, color="#D9A63E")
wash(poly([(1566, B + 33), (2400, B + 33), (2400, B + 40), (1562, B + 40)]), "#9AA0A4", 0.8, "wcs")
ink(line([(1562, B + 33), (2400, B + 33)]), 1.2, 0.75); ink(line([(1562, B + 40), (2400, B + 40)]), 1.0, 0.6)
for px in range(1580, 2400, 46):
    ink(line([(px, B + 33), (px + 1, B + 50)]), 2.0, 0.8, color="#6E4A32")
wash(poly([(1550, B + 41), (2400, B + 41), (2400, interp(lt, 2400) + 4), (1600, interp(lt, 1600) + 4), (1540, B + 44)]), "#9C958C", 0.85, "wcs")
stones(1560, 2400, B + 42, B + 56, 60, 0.5)

# --- Riffles left as paper on the calm water, a touch of ink.
bank = [(1480, 1000), (1620, 970), (1780, 944), (1960, 926), (2160, 914), (2400, 908)]
for i in range(80):
    x = random.uniform(0, 2380); y0 = interp(lt, x) + 22
    y = y0 + (1000 - y0) * random.random() ** 0.8
    if x > 1440 and y > interp(bank, x) - 14: continue
    if 760 < x < 1150 and y < 760: continue
    L = random.uniform(30, 110) * (0.6 + (y - 720) / 400)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-3 {L:.0f},0" stroke="#FBF7EE" stroke-width="{1.4 + (y - 720) / 150:.1f}" fill="none" stroke-linecap="round" opacity="0.85"/>')
    if random.random() < 0.3: ink(f"M{x + 6:.0f},{y + 5:.0f} q{L / 3:.0f},-2 {L * 0.6:.0f},0", 0.9, 0.35)

# --- The near bank, bottom right: dry grass and granite boulders at the water.
INKSCALE = 1.15
wash(f"M{bank[0][0]},{bank[0][1]} " + smooth(bank) + " L2400,1000 Z", "#CBB066", 0.9, "wc1")
wash("M1700,1000 C1900,962 2150,946 2400,940 L2400,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for i in range(120):
    x = random.uniform(1520, 2400); top = interp(bank, x) + random.uniform(10, 90)
    if top > 996: continue
    L = random.uniform(10, 26)
    ink(line([(x, min(999, top + L)), (x + jit(6), top)]), 1.0, 0.45)
for i in range(16):
    x = random.uniform(1700, 2400); y = interp(bank, x) + random.uniform(24, 80)
    if y < 990: wash(blob(x, y, 9, 6), "#E2B92E", 0.7, "wcs", g=True)
for cx, cy, r in [(1690, 966, 28), (1872, 946, 44), (1934, 954, 22), (2140, 932, 36), (2330, 924, 28), (1560, 990, 18)]:
    add(f'<path d="M{cx - r * 1.3:.0f},{cy + 3:.0f} q{r * 1.3:.0f},{r * 0.2:.0f} {r * 2.6:.0f},0" stroke="#FBF7EE" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>')
    granite(cx, cy, r)

finish(sys.argv[1])
