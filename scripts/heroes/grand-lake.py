"""Grand Lake hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Grand Lake on an autumn morning, seen from the water. On the left the
forested mountain that rises straight out of the lake, its timber broken by
gold aspen groves (the town's hero photo, the Lakefront Park photo, and the
autumn waterfront aerial for the aspens); beyond, the bare summit with its
pale rock face at the head of the lake (the aerial). On the right the town
on its shore: the big brown house at the water, the long boathouse with
its maroon fascia and white docks, and the small green-roofed boathouse
(the aerial); a log cabin with a green roof and canopied boats at the wall
(the hero photo); Grand Avenue's boardwalk false fronts, the red-panelled
one, the stepped blue one, the tall gabled one with its cream peak, the log
one with the steep shingled roof and the cream two-storey, with porches,
black lamps and flags, under the mountain behind the street (the Grand
Avenue photo); and the two-storey log Kauffman House with its white trim,
porch and lodgepole (its photo). A pontoon heads out up the lake (the
aerial), and in front is Lakefront Park's beach with a spruce, a picnic
table and the pedal boats along their dock (the Lakefront Park photo).
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(41)

GOLD, GOLD_B, RUST = "#EFB230", "#E4A637", "#D06A1E"

def spire(x, base, h, w):
    """A spruce or lodgepole as a jagged spire, tiers stepping out to the foot."""
    n = max(3, int(h / 11))
    R, L = [], []
    for k in range(1, n + 1):
        t = k / n; y = base - h + h * 0.86 * t
        R.append((x + w / 2 * t + jit(w * 0.05), y)); L.append((x - w / 2 * t + jit(w * 0.05), y))
        if k < n:
            yi = y + h * 0.86 / n * 0.28
            R.append((x + w / 2 * t * 0.55, yi)); L.append((x - w / 2 * t * 0.55, yi))
    tr = w * 0.05 + 0.8
    return [(x, base - h)] + R + [(x + tr, base - h * 0.14), (x + tr, base), (x - tr, base), (x - tr, base - h * 0.14)] + L[::-1]

def closed_smooth(pts):
    n = len(pts); d = [f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"]
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        d.append(f"C{p1[0] + (p2[0] - p0[0]) / 6:.1f},{p1[1] + (p2[1] - p0[1]) / 6:.1f} {p2[0] - (p3[0] - p1[0]) / 6:.1f},{p2[1] - (p3[1] - p1[1]) / 6:.1f} {p2[0]:.1f},{p2[1]:.1f}")
    return " ".join(d) + " Z"

def blob(cx, cy, rx, ry, n=10, irr=0.28):
    return closed_smooth([(cx + rx * (1 + jit(irr)) * math.cos(2 * math.pi * k / n), cy + ry * (1 + jit(irr)) * math.sin(2 * math.pi * k / n)) for k in range(n)])

def spires(trees, col, op=0.9, g=False):
    if trees: wash(" ".join(poly(spire(*t)) for t in trees), col, op, "wcs", g=g)

def dabs(pts, col, op=0.9, g=False):
    if pts: wash(" ".join(f"M{x - r:.1f},{y:.1f} a{r:.1f},{r * k:.1f} 0 1,0 {2 * r:.1f},0 a{r:.1f},{r * k:.1f} 0 1,0 {-2 * r:.1f},0 Z" for x, y, r, k in pts), col, op, "wcs", g=g)

def spruce(x, base, h, col="#2F4B38", wide=0.34):
    w = h * wide
    pts = spire(x, base, h, w)
    wash(poly(pts), col, 0.94, "wcs")
    wash(poly([p for p in pts if p[0] >= x - 0.5]), "#1E3026", 0.3, "wcs", g=True)   # shade side
    wash(poly([(x, base - h), (x - w * 0.3, base - h * 0.5), (x - w * 0.12, base - h * 0.3)]), "#7C9262", 0.4, "wcs", g=True)
    ink(poly(pts), 1.1, 0.5)

def aspen(x, base, h, col=GOLD):
    """An aspen in autumn: a tall narrow gold crown over a pale trunk."""
    tw = max(2.0, h * 0.03)
    add(f'<path d="{poly([(x - tw, base), (x - tw * 0.6, base - h * 0.8), (x + tw * 0.6, base - h * 0.8), (x + tw, base)])}" fill="#F3EDE0"/>')
    blobs = [(0, -0.64, 0.19, 0.28), (-0.09, -0.8, 0.14, 0.2), (0.08, -0.5, 0.15, 0.18), (0.04, -0.92, 0.1, 0.12), (-0.07, -0.5, 0.12, 0.15)]
    d = " ".join(f"M{x + dx * h - rx * h:.1f},{base + dy * h:.1f} a{rx * h:.1f},{ry * h:.1f} 0 1,0 {2 * rx * h:.1f},0 a{rx * h:.1f},{ry * h:.1f} 0 1,0 {-2 * rx * h:.1f},0 Z" for dx, dy, rx, ry in blobs)
    wash(d, col, 0.92, "wc2")
    wash(f"M{x + h * 0.02:.0f},{base - h * 1.02:.0f} C{x + h * 0.26:.0f},{base - h * 0.86:.0f} {x + h * 0.24:.0f},{base - h * 0.4:.0f} {x + h * 0.06:.0f},{base - h * 0.34:.0f} C{x + h * 0.12:.0f},{base - h * 0.6:.0f} {x + h * 0.1:.0f},{base - h * 0.86:.0f} {x + h * 0.02:.0f},{base - h * 1.02:.0f} Z", RUST, 0.45, "wcs", g=True)
    ink(line([(x - tw, base), (x - tw * 0.6, base - h * 0.34)]), 0.9, 0.55); ink(line([(x + tw, base), (x + tw * 0.6, base - h * 0.34)]), 0.9, 0.45)
    for k in range(3):   # the dark eyes on the bark
        yy = base - h * (0.08 + k * 0.09)
        ink(line([(x - tw * 0.7, yy), (x + tw * 0.7, yy + 1)]), 1.0, 0.6)

# --- Sky, as in the other guides.
sky()
for cx, cy, s in [(330, 130, 58), (1040, 95, 42), (1720, 140, 66), (2260, 105, 46), (760, 268, 28)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1900, 262, 11), (1936, 250, 8), (1968, 270, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The far range, hazy.
INKSCALE = 0.55
far = [(0, 452), (220, 430), (440, 442), (660, 418), (880, 432), (1080, 410), (1300, 424), (1520, 404), (1760, 420), (2000, 400), (2220, 414), (2400, 404)]
wash(ridge_d(far), "#B9B4D0", 0.75, "wc3")

# --- The bare summit at the head of the lake (the aerial): a steep pale rock
# face on the sunny side, a broad bare top, a long shoulder to the right.
bare = [(1030, 530), (1100, 486), (1150, 446), (1196, 408), (1236, 378), (1268, 360), (1300, 354), (1340, 350), (1384, 352),
        (1430, 346), (1476, 350), (1520, 362), (1566, 380), (1620, 398), (1690, 428), (1770, 466), (1870, 516)]
wash(ridge_d(bare), "#ABA6C0", 0.8, "wc3")
top = [(x, interp(bare, x) + 1) for x in range(1150, 1431, 10)]
foot = [(x, interp(bare, x) + 8 + 84 * math.sin(math.pi * (x - 1150) / 280) ** 0.7 + random.uniform(-14, 10)) for x in range(1430, 1149, -10)]
wash(poly(top + foot), "#C6BCB8", 0.58, "wc2")   # the pale rock face, lit from the left
for i in range(16):   # gullies, shadowed, falling down the face
    gx = random.uniform(1170, 1410); gy = interp(bare, gx) + random.uniform(8, 20)
    L = (10 + 84 * math.sin(math.pi * (gx - 1150) / 280) ** 0.7) * random.uniform(0.5, 0.95)
    ink(line([(gx, gy), (gx - 4 + jit(3), gy + L * 0.5), (gx - 8 + jit(3), gy + L)]), random.uniform(1.0, 2.2), 0.24, color="#6E6680")
    if random.random() < 0.5: ink(line([(gx - 6, gy + L * 0.4), (gx + 10, gy + L * 0.4 + 3)]), 0.8, 0.22)   # a ledge
spires([(x, interp(bare, x) + 10 + 84 * math.sin(math.pi * (x - 1150) / 280) ** 0.7 + random.uniform(-2, 8), random.uniform(8, 13), 5) for x in [random.uniform(1160, 1420) for i in range(40)]], "#5E6A7E", 0.4, g=True)   # timber at the foot of the rock
wash(poly([(x, interp(bare, x) + 2) for x in range(1270, 1621, 15)] + [(x, interp(bare, x) + 22 + 6 * math.sin(x / 29)) for x in range(1620, 1269, -15)]), "#C8AE88", 0.4, "wc2", g=True)   # the bare top
wash("M1476,350 C1540,362 1620,398 1700,432 C1780,470 1830,494 1870,516 L1870,560 L1560,560 C1540,500 1520,420 1476,350 Z", "#7F7699", 0.18, "sky", g=True)
ink(open_path(bare[1:-1]), 1.4, 0.55)
low = [(960, 540), (1080, 500), (1220, 482), (1380, 478), (1540, 484), (1700, 496), (1860, 520)]
wash(ridge_d(low), "#7889A0", 0.8, "wc3")
tl = []
for i in range(120):
    x = random.uniform(980, 1840); top = interp(low, x)
    tl.append((x, top + random.uniform(6, 70), random.uniform(9, 15), 5))
spires(tl, "#56687E", 0.45, g=True)

# --- The mountain behind Grand Avenue (the Grand Avenue photo).
back = [(1460, 620), (1560, 556), (1660, 494), (1760, 440), (1852, 400), (1934, 374), (2014, 364), (2094, 370), (2176, 390), (2266, 410), (2400, 424)]
wash(ridge_d(back), "#8F99A8", 0.85, "wc3")
wash(poly([(x, interp(back, x) + 2) for x in range(1720, 2401, 20)] + [(x, interp(back, x) + 8 + 34 * math.sin(math.pi * (x - 1720) / 680) ** 0.5) for x in range(2400, 1719, -20)]), "#B9A483", 0.24, "sky", g=True)   # the bare upper slopes
wash("M1460,620 C1560,560 1660,520 1760,500 C1900,480 2100,474 2400,470 L2400,640 L1460,640 Z", "#5F7E70", 0.3, "sky", g=True)   # the timber on its lower slopes
wash("M2014,364 C2094,370 2176,390 2266,410 C2320,416 2370,420 2400,424 L2400,600 L2160,600 C2120,520 2080,430 2014,364 Z", "#7F7699", 0.2, "sky", g=True)
tb = []
for i in range(170):
    x = random.uniform(1480, 2400); top = interp(back, x)
    y = top + random.uniform(36, 180)
    if y < 600: tb.append((x, y, random.uniform(10, 17), 6))
spires(tb, "#566A70", 0.45, g=True)
ink(open_path(back), 1.4, 0.55)

# --- The forested mountain rising out of the lake on the left.
INKSCALE = 0.8
lm = [(0, 380), (100, 360), (210, 342), (330, 332), (450, 334), (570, 350), (690, 380), (810, 424), (930, 476), (1040, 532), (1130, 582), (1210, 628), (1290, 668)]
lm_d = ridge_d(lm)
wash(lm_d, "#6B8450", 0.92, "wc1")
wash(f"M450,334 C560,350 700,380 810,424 C930,476 1060,540 1290,668 L1290,{H} L800,{H} C760,700 640,460 450,334 Z", "#3C4E5E", 0.26, "sky", g=True)   # the flank away from the sun
wash(poly([(x, interp(lm, x) + 4) for x in range(0, 501, 25)] + [(x, interp(lm, x) + 90 + 20 * math.sin(x / 61)) for x in range(500, -1, -25)]), "#B3B565", 0.24, "sky", g=True)   # morning light on the crest
td, tm = [], []
for i in range(760):
    x = random.uniform(-10, 1290); top = interp(lm, x)
    y = top + random.uniform(14, max(20, 656 - top))
    if y > 652: continue
    h = random.uniform(13, 24)
    (td if random.random() < 0.55 else tm).append((x, y, h, h * 0.38))
spires(tm, "#3E5E45", 0.5, g=True); spires(td, "#24402E", 0.55, g=True)
crest = []
x = -6
while x < 1290:   # timber standing up along the skyline
    crest.append((x, interp(lm, x) + 7, random.uniform(14, 26), random.uniform(6, 9))); x += random.uniform(7, 15)
spires(crest, "#3B5A42", 0.92)
def grove(gx, gy, sx, sy, ridge, floor=640):
    """A stand of aspen in the timber: a ragged gold patch running down a
    gully, the darker conifers standing in it and over its edges. The paper
    under the gold is set in a little, so the edge darkens over the green
    instead of leaving a white rim."""
    gy = max(gy, interp(ridge, gx) + sy / 2 + 10); gy = min(gy, floor - sy / 2)
    lobes = [(gx + jit(sx * 0.12), gy + t * sy * 0.3, sx * random.uniform(0.32, 0.46), sy * random.uniform(0.3, 0.4)) for t in (-1, 0, 1)]
    under, over = [], []
    for cx, cy, rx, ry in lobes:
        pts = [(math.cos(2 * math.pi * k / 13) * (1 + jit(0.34)), math.sin(2 * math.pi * k / 13) * (1 + jit(0.34))) for k in range(13)]
        over.append(closed_smooth([(cx + rx * u, cy + ry * v) for u, v in pts]))
        under.append(closed_smooth([(cx + (rx - 4) * u, cy + (ry - 4) * v) for u, v in pts]))
    add(f'<path d="{" ".join(under)}" fill="{PAPER}"/>')
    wash(" ".join(over), random.choice([GOLD, GOLD_B]), 0.9, "wc2", g=True)
    wash(blob(gx + sx * 0.16, gy + sy * 0.08, sx * 0.24, sy * 0.3, 9, 0.35), RUST, 0.2, "wcs", g=True)
    n = int(sx * sy / 70)
    dabs([(gx + jit(sx * 0.42), gy + jit(sy * 0.42), random.uniform(3, 6), 1.5) for i in range(n)], "#C98A2A", 0.26, g=True)
    tr = []
    for i in range(int(sx * sy / 160) + 4):
        a = random.uniform(0, 2 * math.pi); rr = random.uniform(0.25, 1.1)
        tr.append((gx + math.cos(a) * sx / 2 * rr, gy + math.sin(a) * sy / 2 * rr + 8, random.uniform(12, 20), 7))
    spires(tr, "#24402E", 0.6, g=True)
for gx, gy, sx, sy in [(150, 460, 56, 90), (330, 420, 66, 76), (470, 500, 46, 110), (620, 440, 60, 72), (720, 540, 64, 90), (850, 520, 48, 70),
                       (960, 590, 60, 52), (1080, 618, 50, 30), (250, 590, 40, 36), (560, 604, 50, 32), (400, 560, 30, 40),
                       (880, 610, 70, 36), (1010, 560, 44, 60), (1160, 630, 36, 24), (660, 620, 46, 26)]:
    grove(gx, gy, sx, sy, lm)
ink(open_path(lm), 2.0, 0.75)
shore_t = []
for x in range(-10, 1170, 9):   # the dark shore timber at the water
    y = interp([(0, 650), (600, 652), (900, 660), (1060, 668), (1160, 690)], x) + jit(2)
    shore_t.append((x, y, random.uniform(22, 40), random.uniform(9, 13)))
spires(shore_t, "#2A4433", 0.88)

# --- The bench of timber behind town, with aspen groves and tall trees.
bench = [(1120, 716), (1180, 670), (1262, 622), (1360, 590), (1480, 572), (1620, 562), (1780, 554), (1940, 546), (2100, 538), (2260, 532), (2400, 528)]
wash(ridge_d(bench), "#5E7A50", 0.92, "wc1")
wash("M1900,546 C2100,538 2260,532 2400,528 L2400,720 L1980,720 Z", "#3C4E5E", 0.2, "wc3", g=True)
tbd, tbm = [], []
for i in range(420):
    x = random.uniform(1120, 2410); top = interp(bench, x)
    y = top + random.uniform(10, 150)
    if y < 700: (tbd if random.random() < 0.55 else tbm).append((x, y, random.uniform(14, 26), 7))
spires(tbm, "#3E5E45", 0.5, g=True); spires(tbd, "#24402E", 0.5, g=True)
crest = []
x = 1150
while x < 2410:
    crest.append((x, interp(bench, x) + 7, random.uniform(16, 30), random.uniform(7, 10))); x += random.uniform(8, 16)
spires(crest, "#3B5A42", 0.92)
for gx, gy, sx, sy in [(1330, 622, 50, 34), (1470, 600, 60, 30), (1600, 592, 70, 30), (1760, 588, 50, 28), (1880, 584, 80, 30), (2010, 600, 60, 30), (2150, 576, 70, 30), (2340, 568, 50, 24), (1250, 660, 40, 30)]:
    grove(gx, gy, sx, sy, bench, 700)
ink(open_path(bench), 1.8, 0.7)
for x, h, kind in [(1146, 120, "s"), (1300, 112, "a"), (1340, 150, "s"), (1530, 104, "a"), (1560, 142, "s"), (1660, 126, "a"), (1700, 168, "s"),
                   (1820, 118, "a"), (1905, 160, "s"), (1990, 124, "a"), (2075, 150, "s"), (2150, 112, "a"), (2260, 132, "a"), (2330, 170, "s"), (2390, 120, "a")]:
    if kind == "s": spruce(x + jit(8), 712, h)
    else: aspen(x + jit(8), 712, h, random.choice([GOLD, GOLD_B]))

# --- The town's shore.
INKSCALE = 0.85
wash(poly([(1110, 722), (1180, 690), (2400, 690), (2400, 740), (1180, 740)]), "#B8AC74", 0.88, "wc2")

# --- The lake.
lt = [(0, 652), (300, 648), (600, 654), (900, 660), (1060, 668), (1140, 690), (1196, 718), (1270, 728), (1600, 730), (2000, 732), (2400, 734)]
lake_d = f"M0,652 " + smooth(lt) + f" L2400,{H} L0,{H} Z"
wash(lake_d, "#78A2BF", 0.92, "wc3")
refl = [(x, interp(lt, x)) for x in range(0, 1141, 30)]
wash(poly(refl + [(x, interp(lt, x) + (interp(lt, x) - interp(lm, x)) * 0.36 + 10 * math.sin(x / 47)) for x in range(1140, -1, -30)]), "#35523F", 0.5, "wc3", g=True)   # the mountain in the water
wash("M0,780 C300,790 700,800 1100,820 C1500,840 1900,850 2400,860 L2400,1000 L0,1000 Z", "#4D7896", 0.44, "sky", g=True)
for gx in (560, 960, 1080):   # gold of the aspens broken in the water
    for k in range(3):
        y = interp(lt, gx) + 14 + k * 11 + jit(3); L = random.uniform(30, 70)
        add(f'<path d="M{gx - L / 2 + jit(10):.0f},{y:.0f} l{L:.0f},0" stroke="#D9A640" stroke-width="{4 - k * 0.5:.1f}" stroke-linecap="round" opacity="0.32" style="mix-blend-mode:multiply"/>')
ink(open_path(lt), 1.6, 0.6)
for x0, x1, col in [(1150, 1282, "#8A5A3E"), (1290, 1470, "#8E2F3A"), (1484, 1564, "#4E7A58"), (1586, 1682, "#C2643E"), (1700, 2200, "#9C6244"), (2212, 2400, "#7A5038")]:
    for k in range(5):   # broken reflections, shorter and fainter going out
        y = interp(lt, x0) + 14 + k * 9
        x = x0 + random.uniform(0, 14)
        while x < x1 - 8:
            L = min(random.uniform(14, 44), x1 - x)
            add(f'<path d="M{x:.0f},{y + jit(1.5):.1f} l{L:.0f},0" stroke="{col}" stroke-width="{4.5 - k * 0.6:.1f}" stroke-linecap="round" opacity="{0.34 - k * 0.05:.2f}" style="mix-blend-mode:multiply"/>')
            x += L + random.uniform(6, 22)
for i in range(90):   # ripples left as paper
    x = random.uniform(40, 2380); top = interp(lt, x) + 12
    y = random.uniform(top, 990)
    if x > 1180 and y > interp([(1180, 1000), (1400, 950), (1650, 918), (1950, 902), (2200, 896), (2400, 892)], x) - 8: continue
    t = (y - 650) / 350
    L = random.uniform(20, 50) * (0.6 + t)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-3 - t * 3:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{1.6 + t * 2:.1f}" fill="none" stroke-linecap="round" opacity="{0.55 if x < 1180 else 0.85}"/>')
    if random.random() < 0.3: ink(f"M{x + 4:.0f},{y + 5:.0f} q{L / 3:.0f},-2 {L * 0.6:.0f},0", 0.9, 0.35)

# --- The waterfront (the aerial): the big brown house, the long boathouse, the small one.
def chalet(x, b):
    w, h = 132, 92
    walls = poly([(x, b), (x, b - h), (x + w, b - h), (x + w, b)])
    wash(walls, "#8A5A3E", 0.93, "wcs")
    wash(poly([(x + w * 0.66, b - h), (x + w, b - h), (x + w, b), (x + w * 0.66, b)]), STONE_D, 0.3, "wcs", g=True)
    roof = poly([(x - 10, b - h + 4), (x + 18, b - h - 34), (x + w - 18, b - h - 34), (x + w + 10, b - h + 4)])
    wash(roof, "#A88468", 0.93, "wcs")
    gx = x + 70   # the cross gable facing the water, with its balcony
    wash(poly([(gx - 6, b - h + 2), (gx + 26, b - h - 44), (gx + 58, b - h + 2)]), "#7A4E36", 0.93, "wcs")
    ink(line([(gx - 10, b - h + 4), (gx + 26, b - h - 48), (gx + 62, b - h + 4)]), 1.6, 0.85)
    ink(walls, 1.8); ink(roof, 1.6)
    for k in range(int(w / 7)):
        ink(line([(x + 4 + k * 7, b - h + 6), (x + 4 + k * 7, b - 2)]), 0.6, 0.25)
    for row, wy in enumerate((b - h + 16, b - 44)):
        for wx in range(int(x + 12), int(x + w - 20), 30):
            trimmed(wx, wy, 16, 22)
    ink(line([(x + 60, b - 52), (x + w - 4, b - 52)]), 1.4, 0.75); ink(line([(x + 60, b - 46), (x + w - 4, b - 46)]), 0.9, 0.55)
    for k in range(9): ink(line([(x + 64 + k * 8, b - 52), (x + 64 + k * 8, b - 46)]), 0.7, 0.5)
    return x + w

def boathouse(x, b):
    w = 176
    roof = poly([(x - 8, b - 52), (x + 26, b - 76), (x + w - 26, b - 76), (x + w + 8, b - 52)])
    wash(roof, "#D9B49E", 0.94, "wcs")
    wash(poly([(x + w * 0.6, b - 76), (x + w - 26, b - 76), (x + w + 8, b - 52), (x + w * 0.66, b - 52)]), "#8C6A70", 0.25, "wcs", g=True)
    fas = poly([(x - 8, b - 52), (x + w + 8, b - 52), (x + w + 8, b - 38), (x - 8, b - 38)])
    wash(fas, "#8E2F3A", 0.94, "wcs")
    wash(poly([(x, b - 38), (x + w, b - 38), (x + w, b), (x, b)]), "#3E3A48", 0.75, "wcs", g=True)   # the open slips
    ink(roof, 1.6); ink(fas, 1.5)
    for px in range(int(x), int(x + w) + 1, 44):
        wash(poly([(px - 3, b - 38), (px + 3, b - 38), (px + 3, b + 2), (px - 3, b + 2)]), "#8E2F3A", 0.94, "wcs")
        ink(line([(px, b - 38), (px, b + 2)]), 1.2, 0.7)
    for sx, col in [(x + 10, "#B23A48"), (x + 98, "#3A9AA8")]:   # boats in the slips
        wash(poly([(sx, b - 4), (sx + 34, b - 4), (sx + 30, b + 4), (sx + 4, b + 4)]), "#ECE8E0", 0.9, "wcs")
        wash(poly([(sx + 2, b - 22), (sx + 32, b - 22), (sx + 32, b - 14), (sx + 2, b - 14)]), col, 0.9, "wcs")
    return x + w

def small_boathouse(x, b):
    w, h = 80, 42
    walls = poly([(x, b), (x, b - h), (x + w, b - h), (x + w, b)])
    wash(walls, "#B8875A", 0.93, "wcs")
    roof = poly([(x - 8, b - h + 2), (x + 10, b - h - 24), (x + w - 10, b - h - 24), (x + w + 8, b - h + 2)])
    wash(roof, "#4E7A58", 0.94, "wcs")
    wash(poly([(x + w * 0.62, b - h), (x + w, b - h), (x + w, b), (x + w * 0.62, b)]), STONE_D, 0.3, "wcs", g=True)
    for dx in (x + 10, x + 44):
        wash(poly([(dx, b), (dx, b - 30), (dx + 26, b - 30), (dx + 26, b)]), "#4A4040", 0.8, "wcs", g=True)
        ink(poly([(dx, b), (dx, b - 30), (dx + 26, b - 30), (dx + 26, b)]), 1.1, 0.7)
    ink(walls, 1.6); ink(roof, 1.5)
    return x + w

def cabin(x, b):
    """A log cabin with a green metal roof and a deck (the hero photo)."""
    w, h = 96, 56
    walls = poly([(x, b), (x, b - h), (x + w / 2, b - h - 40), (x + w, b - h), (x + w, b)])
    wash(walls, "#C2643E", 0.93, "wcs")
    wash(poly([(x + w / 2, b - h - 40), (x + w, b - h), (x + w, b), (x + w * 0.62, b)]), STONE_D, 0.3, "wcs", g=True)
    roof = poly([(x - 10, b - h + 6), (x + w / 2, b - h - 46), (x + w + 10, b - h + 6), (x + w + 2, b - h + 10), (x + w / 2, b - h - 36), (x - 2, b - h + 10)])
    wash(roof, "#4F8058", 0.95, "wcs")
    for y in range(int(b - h + 8), int(b), 8):   # the logs
        ink(line([(x + 3, y), (x + w - 3, y)]), 0.7, 0.32)
    ink(walls, 1.8); ink(roof, 1.4)
    trimmed(x + 18, b - 44, 26, 22); trimmed(x + 56, b - 44, 22, 22)
    trimmed(x + w / 2 - 8, b - h - 18, 16, 14)
    ink(line([(x - 14, b - 14), (x + w + 14, b - 14)]), 1.4, 0.8)   # the deck rail
    for k in range(int((w + 28) / 9)):
        ink(line([(x - 14 + k * 9, b - 14), (x - 14 + k * 9, b + 2)]), 0.8, 0.55)
    return x + w

def docks(x0, x1, b):
    d = poly([(x0, b + 2), (x1, b + 2), (x1, b + 10), (x0, b + 10)])
    for fx in range(int(x0 + 20), int(x1), 52):
        d += " " + poly([(fx, b + 10), (fx + 12, b + 10), (fx + 2, b + 30), (fx - 10, b + 30)])
    wash(d, "#EEEAE2", 0.9, "wcs")
    ink(d, 1.1, 0.55)

WL = 734
xx = chalet(1150, 722)
docks(1150, 1460, 736)
xx = boathouse(xx + 8, WL)
xx = small_boathouse(xx + 14, WL - 2)
xx = cabin(xx + 22, 720)
for sx, col in [(1586, "#B23A48"), (1636, "#3A9AA8")]:   # canopied boats at the wall (the hero photo)
    wash(poly([(sx, 740), (sx + 40, 740), (sx + 36, 750), (sx + 4, 750)]), "#ECE8E0", 0.9, "wcs")
    wash(poly([(sx + 2, 722), (sx + 38, 722), (sx + 38, 732), (sx + 2, 732)]), col, 0.92, "wcs")
    ink(poly([(sx, 740), (sx + 40, 740), (sx + 36, 750), (sx + 4, 750)]), 1.0, 0.6)
    for px in (sx + 4, sx + 36): ink(line([(px, 732), (px, 740)]), 0.8, 0.6)
# The pontoon heading out up the lake, with its wake (the aerial).
px, py = 1080, 822
for k in range(3):
    add(f'<path d="M{px + 8},{py + 8 + k * 4} L{px - 40 - k * 30},{py + 34 + k * 16}" stroke="#FCF9F2" stroke-width="{3 - k * 0.7:.1f}" stroke-linecap="round" opacity="0.85"/>')
    add(f'<path d="M{px + 30},{py + 8 + k * 4} L{px + 78 + k * 30},{py + 34 + k * 16}" stroke="#FCF9F2" stroke-width="{3 - k * 0.7:.1f}" stroke-linecap="round" opacity="0.85"/>')
wash(poly([(px, py), (px + 38, py), (px + 36, py + 10), (px + 2, py + 10)]), "#E8E4DC", 0.92, "wcs")
wash(poly([(px - 2, py - 18), (px + 40, py - 18), (px + 40, py - 11), (px - 2, py - 11)]), "#B23A48", 0.92, "wcs")
ink(poly([(px, py), (px + 38, py), (px + 36, py + 10), (px + 2, py + 10)]), 1.0, 0.7)
for q in (px + 2, px + 36): ink(line([(q, py - 11), (q, py)]), 0.8, 0.6)

# --- Grand Avenue (the Grand Avenue photo): boardwalk false fronts, base 706.
B = 706
def porch(x0, x1, col, y=B - 56):
    wash(poly([(x0 - 4, y), (x1 + 4, y), (x1 + 8, y + 14), (x0 - 8, y + 14)]), col, 0.93, "wcs")
    ink(line([(x0 - 4, y), (x1 + 4, y), (x1 + 8, y + 14), (x0 - 8, y + 14), (x0 - 4, y)]), 1.3, 0.75)
    wash(poly([(x0, y + 14), (x1, y + 14), (x1, B), (x0, B)]), "#4E4852", 0.55, "wcs", g=True)
    for px in range(int(x0 + 4), int(x1), 40):
        wash(poly([(px - 2.5, y + 14), (px + 2.5, y + 14), (px + 3, B), (px - 3, B)]), "#8A5E3E", 0.95, "wcs")
        ink(line([(px, y + 14), (px, B)]), 1.0, 0.6)
def boards(x0, y0, x1, y1, step=7):
    for x in range(int(x0) + 4, int(x1) - 2, step):
        ink(line([(x, y0 + 3), (x, y1)]), 0.55, 0.26)
def front(pts, col):
    wash(poly(pts), col, 0.93, "wcs"); return poly(pts)

def red_front(x):
    w, h = 104, 112
    d = front([(x, B), (x, B - h), (x + w, B - h), (x + w, B)], "#9C6244")
    pnl = front([(x + 34, B - h + 2), (x + 34, B - h - 40), (x + 76, B - h - 40), (x + 76, B - h + 2)], "#B04A3A")
    wash(poly([(x + 70, B - h), (x + w, B - h), (x + w, B), (x + 70, B)]), STONE_D, 0.25, "wcs", g=True)
    boards(x, B - h, x + w, B - 56, 8)
    ink(d, 1.8); ink(pnl, 1.6)
    wash(poly([(x + 44, B - h - 28), (x + 66, B - h - 28), (x + 66, B - h - 4), (x + 44, B - h - 4)]), "#4A3A34", 0.7, "wcs", g=True)
    trimmed(x + 10, B - h + 24, 16, 24); trimmed(x + 80, B - h + 24, 16, 24)
    porch(x, x + w, "#7E6656")
    return x + w

def blue_front(x):
    w, h = 88, 104
    pts = [(x, B), (x, B - h + 20), (x + 10, B - h + 20), (x + 10, B - h + 10), (x + 22, B - h + 10), (x + 22, B - h), (x + w - 22, B - h),
           (x + w - 22, B - h + 10), (x + w - 10, B - h + 10), (x + w - 10, B - h + 20), (x + w, B - h + 20), (x + w, B)]
    d = front(pts, "#8FA4BA")
    wash(poly([(x + 62, B - h + 10), (x + w, B - h + 20), (x + w, B), (x + 62, B)]), "#5E6A8A", 0.25, "wcs", g=True)
    boards(x, B - h + 4, x + w, B - 56, 7)
    add(f'<rect x="{x + 28}" y="{B - h + 22}" width="32" height="22" fill="{PAPER}"/>')
    ink(poly([(x + 28, B - h + 22), (x + 60, B - h + 22), (x + 60, B - h + 44), (x + 28, B - h + 44)]), 1.1, 0.7)
    ink(d, 1.8)
    porch(x, x + w, "#8A7A6A", B - 50)
    return x + w

def gable_front(x):
    """The tall gable-topped false front with the cream peak and a hanging sign."""
    w, h, gh = 88, 138, 40
    d = front([(x, B), (x, B - h), (x + w / 2, B - h - gh), (x + w, B - h), (x + w, B)], "#7A5238")
    pk = front([(x + 4, B - h + 22), (x + 4, B - h), (x + w / 2, B - h - gh + 6), (x + w - 4, B - h), (x + w - 4, B - h + 22)], "#EADFC6")
    for y in range(int(B - h - gh + 16), int(B - h + 22), 6):   # boards in the peak
        hw = min(w / 2 - 4, (y - (B - h - gh + 6)) * (w / 2) / gh)
        ink(line([(x + w / 2 - hw, y), (x + w / 2 + hw, y)]), 0.5, 0.3)
    wash(poly([(x + w * 0.66, B - h), (x + w, B - h), (x + w, B), (x + w * 0.66, B)]), STONE_D, 0.28, "wcs", g=True)
    ink(d, 1.8); ink(line([(x + 4, B - h + 22), (x + w - 4, B - h + 22)]), 1.1, 0.7)
    trimmed(x + 14, B - h + 64, 18, 30); trimmed(x + 56, B - h + 64, 18, 30)
    sg = [(x + 22, B - h + 34), (x + 66, B - h + 34), (x + 66, B - h + 56), (x + 22, B - h + 56)]   # the hanging sign
    wash(poly(sg), "#C9A262", 0.92, "wcs"); ink(poly(sg), 1.1, 0.75)
    porch(x, x + w, "#9A4A36", B - 60)
    return x + w

def log_front(x):
    """The log building with the steep shingled gable."""
    w, h, gh = 92, 68, 66
    d = front([(x, B), (x, B - h), (x + w, B - h), (x + w, B)], "#9A6A48")
    roof = front([(x - 10, B - h + 4), (x + w / 2, B - h - gh), (x + w + 10, B - h + 4)], "#6F6A6C")
    for k, y in enumerate(range(int(B - h - gh + 14), int(B - h), 8)):   # shingle courses
        hw = (y - (B - h - gh)) * (w / 2 + 10) / (gh + 4)
        ink(line([(x + w / 2 - hw, y), (x + w / 2 + hw, y)]), 0.55, 0.32)
    for y in range(int(B - h + 6), int(B - 50), 7):
        ink(line([(x + 3, y), (x + w - 3, y)]), 0.7, 0.32)
        for ex in (x, x + w): ink(f"M{ex - 3},{y - 3} a3,3 0 1,0 6,0", 0.6, 0.35)
    wash(poly([(x + w * 0.62, B - h), (x + w, B - h), (x + w, B), (x + w * 0.62, B)]), STONE_D, 0.3, "wcs", g=True)
    ink(d, 1.8); ink(roof, 1.6)
    trimmed(x + w / 2 - 10, B - h - 30, 20, 22)
    porch(x, x + w, "#6E625A", B - 52)
    return x + w

def cream_front(x):
    w, h = 108, 122
    d = front([(x, B), (x, B - h), (x + w, B - h), (x + w, B)], "#ECE1C8")
    eave = front([(x - 8, B - h + 4), (x + 10, B - h - 16), (x + w - 10, B - h - 16), (x + w + 8, B - h + 4)], "#5E5A62")
    wash(poly([(x + w * 0.66, B - h), (x + w, B - h), (x + w, B), (x + w * 0.66, B)]), "#8E7E6E", 0.28, "wcs", g=True)
    ink(d, 1.8); ink(eave, 1.5)
    for wx in (x + 14, x + 46, x + 78):
        trimmed(wx, B - h + 14, 16, 28, "#3E3A40")
    sg = [(x + 30, B - 92), (x + 62, B - 92), (x + 62, B - 62), (x + 30, B - 62)]
    wash(poly(sg), "#7E2E3A", 0.92, "wcs"); ink(poly(sg), 1.1, 0.75)
    ink(line([(x + 24, B - 96), (x + 68, B - 96)]), 1.2, 0.8)
    porch(x, x + w, "#6A5E58", B - 54)
    return x + w

wash(poly([(1690, B - 4), (2200, B - 4), (2208, B + 14), (1682, B + 14)]), "#B98E64", 0.9, "wcs")   # the boardwalk
for k in range(int(510 / 9)):
    ink(line([(1690 + k * 9, B - 2), (1688 + k * 9, B + 12)]), 0.6, 0.35)
xx = 1696
xx = red_front(xx) + 4
xx = blue_front(xx) + 4
xx = gable_front(xx) + 4
xx = log_front(xx) + 4
xx = cream_front(xx) + 4
ink(line([(1682, B + 14), (2208, B + 14)]), 1.3, 0.6)
for lx in (1800, 1998, 2186):   # the black lamps
    ink(line([(lx, B + 12), (lx, B - 76)]), 2.2, 0.9, color="#2E2A2A")
    ink(f"M{lx - 6},{B - 76} l2,-14 l8,0 l2,14 Z", 1.4, 0.9, color="#2E2A2A")
    ink(f"M{lx - 4},{B - 90} l4,-6 l4,6", 1.2, 0.9, color="#2E2A2A")
def flag(fx, fy):
    pts = [(fx, fy), (fx + 30, fy - 12), (fx + 36, fy + 8), (fx + 6, fy + 20)]
    add(f'<path d="{poly(pts)}" fill="{PAPER}"/>')
    for k in range(4):
        a = k / 4
        wash(poly([(fx + 1 + a * 5, fy + 2 + a * 18), (fx + 31 + a * 5, fy - 10 + a * 18), (fx + 32 + a * 5, fy - 7 + a * 18), (fx + 2 + a * 5, fy + 5 + a * 18)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx, fy), (fx + 13, fy - 5), (fx + 16, fy + 5), (fx + 3, fy + 10)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(poly(pts), 1.0, 0.65); ink(line([(fx - 4, fy + 4), (fx + 40, fy - 14)]), 1.0, 0.7)
for fx in (2034, 2084, 2126, 2160):
    flag(fx, B - 40)

# --- The Kauffman House (its photo): two storeys of dark logs, white trim, a porch.
def kauffman(x):
    gw, gh, pk, ww = 80, 104, 46, 92
    gab = poly([(x, B), (x, B - gh), (x + gw / 2, B - gh - pk), (x + gw, B - gh), (x + gw, B)])
    wing = poly([(x + gw, B), (x + gw, B - 94), (x + gw + ww, B - 94), (x + gw + ww, B)])
    roof = poly([(x + gw - 4, B - 94), (x + gw + 8, B - 128), (x + gw + ww, B - 128), (x + gw + ww + 8, B - 94)])
    wash(roof, "#6E6660", 0.93, "wcs")
    wash(wing, "#7A5038", 0.93, "wcs")
    wash(gab, "#84593E", 0.93, "wcs")
    sh = poly([(x + 8, B - gh), (x + gw / 2, B - gh - pk + 8), (x + gw - 8, B - gh), (x + gw - 8, B - gh + 4), (x + 8, B - gh + 4)])
    wash(sh, "#8E6448", 0.8, "wcs", g=True)
    for k in range(6):   # scalloped shingles in the gable
        yy = B - gh - pk + 18 + k * 6; hw = (yy - (B - gh - pk)) * (gw / 2) / pk - 6
        for sx in range(int(x + gw / 2 - hw), int(x + gw / 2 + hw) - 4, 6):
            ink(f"M{sx},{yy} a3,3 0 0,0 6,0", 0.5, 0.35)
    for y in range(int(B - gh + 6), int(B - 12), 7):   # logs
        ink(line([(x + 4, y), (x + gw - 4, y)]), 0.7, 0.35)
    for y in range(int(B - 90), int(B - 12), 7):
        ink(line([(x + gw + 4, y), (x + gw + ww - 4, y)]), 0.7, 0.3)
    wash(wing, "#3E2E2A", 0.14, "wcs", g=True)
    for cx in (x - 2, x + gw - 4):   # white corner boards
        add(f'<path d="{poly([(cx, B - 6), (cx, B - gh), (cx + 6, B - gh), (cx + 6, B - 6)])}" fill="#F1EADC"/>')
        ink(poly([(cx, B - 6), (cx, B - gh), (cx + 6, B - gh), (cx + 6, B - 6)]), 0.8, 0.5)
    ink(line([(x - 4, B - 54), (x + gw + 2, B - 54)]), 2.4, 0.95, color="#F1EADC")   # the white band between floors
    ink(gab, 1.9); ink(wing, 1.6); ink(roof, 1.5)
    ink(line([(x - 6, B - gh + 4), (x + gw / 2, B - gh - pk - 2), (x + gw + 6, B - gh + 4)]), 1.6, 0.85)
    trimmed(x + 22, B - gh + 14, 36, 30); trimmed(x + 22, B - 46, 36, 30)
    for wx in (x + gw + 28, x + gw + ww - 32):
        trimmed(wx, B - 86, 16, 24)
    pr = poly([(x + gw, B - 52), (x + gw + ww + 4, B - 52), (x + gw + ww + 8, B - 42), (x + gw, B - 42)])
    wash(pr, "#5E5650", 0.93, "wcs"); ink(pr, 1.2, 0.75)
    wash(poly([(x + gw, B - 42), (x + gw + ww, B - 42), (x + gw + ww, B), (x + gw, B)]), "#2E2628", 0.4, "wcs", g=True)
    for px in range(int(x + gw + 8), int(x + gw + ww + 4), 24):
        ink(line([(px, B - 42), (px, B)]), 1.6, 0.85)
    for px in range(int(x + gw + 8), int(x + gw + ww - 8), 24):   # the X railings
        ink(line([(px, B - 20), (px + 24, B - 4)]), 0.9, 0.7); ink(line([(px, B - 4), (px + 24, B - 20)]), 0.9, 0.7)
    for k in range(int((gw + ww + 4) / 14)):   # the stone foundation
        wash(f"M{x + k * 14},{B} a7,4 0 1,0 14,0 a7,4 0 1,0 -14,0 Z", "#9E968C", 0.8, "wcs", g=True)
    return x + gw + ww + 4

kx = kauffman(2204)
# Its lodgepole: a tall bare trunk and a ragged crown.
lx = 2296
wash(poly([(lx - 4, B + 8), (lx - 2, B - 230), (lx + 2, B - 230), (lx + 4, B + 8)]), "#7A4E36", 0.95, "wcs")
ink(line([(lx - 4, B + 8), (lx - 2, B - 220)]), 1.0, 0.6)
crown = []
for k in range(26):
    side = -1 if k % 2 else 1
    crown.append((lx + side * random.uniform(3, 16) * (1 - k / 34), B - 120 - k * 4.4 + jit(5), random.uniform(7, 12), 0.55))
dabs(crown, "#3B5A42", 0.92)
dabs([(cx - 4, cy - 3, r * 0.6, 0.6) for cx, cy, r, k in crown[::2]], "#7C9262", 0.45, g=True)
wash(poly([(1140, B + 14), (2400, B + 14), (2400, B + 22), (1140, B + 22)]), "#7E7398", 0.3, "wcs", g=True)

# --- Lakefront Park's beach in front (the Lakefront Park photo).
INKSCALE = 1.1
bt = [(1180, 1000), (1400, 950), (1650, 918), (1950, 902), (2200, 896), (2400, 892)]
wash("M1180,1000 " + smooth(bt) + f" L2400,{H} Z", "#E0C48A", 0.9, "wc1")
wash(open_path(bt) + " L2400,912 " + smooth([(2400, 912), (2200, 916), (1950, 922), (1650, 938), (1400, 968), (1240, 1000)]) + " Z", "#B99A64", 0.4, "wcs", g=True)   # the wet edge
wash("M1900,1000 C2000,960 2200,940 2400,936 L2400,1000 Z", "#8E7E8E", 0.25, "wc3", g=True)
ink(open_path(bt), 1.6, 0.6)
for i in range(160):   # the sand
    x = random.uniform(1250, 2400); y = random.uniform(interp(bt, x) + 14, 996)
    ink(f"M{x:.0f},{y:.0f} l{random.uniform(3, 8):.0f},{jit(1.5):.1f}", 0.8, 0.3)
# The pedal boats along their dock.
d0, d1 = (1990, 906), (1660, 846)
dock = poly([(d1[0], d1[1]), (d0[0], d0[1]), (d0[0] + 4, d0[1] + 10), (d1[0] + 4, d1[1] + 10)])
wash(dock, "#E4DDD0", 0.9, "wcs"); ink(dock, 1.2, 0.65)
cols = ["#D85A9A", "#E8C03A", "#4FAE6A", "#9A5AC0", "#3AB0B8", "#D85A9A", "#E8C03A", "#3AB0B8"]
for k, col in enumerate(cols):
    t = 0.08 + k * 0.11
    bx = d1[0] + (d0[0] - d1[0]) * t; by = d1[1] + (d0[1] - d1[1]) * t - 10
    tubes = poly([(bx - 16, by), (bx + 18, by - 4), (bx + 20, by + 4), (bx - 14, by + 8)])
    wash(tubes, col, 0.95, "wcs")
    seat = f"M{bx - 6:.0f},{by - 2:.0f} a8,10 0 0,1 16,-2 L{bx + 10:.0f},{by:.0f} Z"
    add(f'<path d="{seat}" fill="#FAF6EE" opacity="0.95"/>'); wash(seat, col, 0.45, "wcs", g=True)
    ink(tubes, 1.0, 0.65); ink(seat, 0.9, 0.6)
    add(f'<path d="M{bx - 20:.0f},{by + 12:.0f} q18,4 40,-2" stroke="#FBF7EE" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.85"/>')
# The picnic table, the spruce on the sand, willows at the edge.
tx, ty = 2180, 946
fb = [(tx + 8, ty - 8), (tx + 100, ty - 14), (tx + 102, ty - 9), (tx + 10, ty - 3)]   # the far bench, behind the top
wash(poly(fb), "#8E6E4C", 0.9, "wcs"); ink(poly(fb), 1.0, 0.7)
for lx2 in (tx + 18, tx + 86):   # the splayed legs
    ink(line([(lx2, ty + 8), (lx2 - 10, ty + 40)]), 1.8, 0.85); ink(line([(lx2, ty + 8), (lx2 + 10, ty + 38)]), 1.8, 0.85)
top = [(tx, ty), (tx + 104, ty - 8), (tx + 110, ty + 6), (tx + 6, ty + 14)]
wash(poly(top), "#B89266", 0.94, "wcs"); ink(poly(top), 1.3, 0.85)
for k in range(1, 5): ink(line([(tx + 1 + k * 1.2, ty + k * 2.8), (tx + 105 + k * 1.2, ty - 8 + k * 2.8)]), 0.6, 0.35)
nb = [(tx - 6, ty + 24), (tx + 108, ty + 16), (tx + 110, ty + 22), (tx - 4, ty + 30)]   # the near bench
wash(poly(nb), "#A07E58", 0.94, "wcs"); ink(poly(nb), 1.1, 0.8)
wash(f"M{tx - 24},{ty + 42} C{tx + 30},{ty + 32} {tx + 110},{ty + 30} {tx + 146},{ty + 38} C{tx + 104},{ty + 50} {tx + 20},{ty + 52} {tx - 24},{ty + 42} Z", "#8E7E8E", 0.3, "wcs", g=True)
spruce(1470, 996, 230, "#33533D", 0.46)
spruce(1560, 984, 96, "#3B5A42", 0.42)
for i in range(5):
    x = random.uniform(2280, 2400); y = interp(bt, x) + random.uniform(4, 20)
    for k in range(int(random.uniform(6, 10))):
        sx = x + k * 6 + jit(2); hh = random.uniform(20, 44)
        ink(line([(sx, y), (sx + jit(6), y - hh)]), 1.0, 0.7, color="#6E2418")
    dabs([(x + k * 6, y - random.uniform(14, 30), 6, 1.6) for k in range(6)], "#DDA43A", 0.85)

finish(sys.argv[1])
