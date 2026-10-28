"""Golden hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Golden between its mesas on an autumn morning, looking west to the
foothills: South Table Mountain on the left with its cap of dark basalt and
the knob of Castle Rock; Lookout Mountain's timbered ridge behind, and Mount
Zion with the white M and the cuts of the Lariat Trail; North Table
Mountain's columnar cliffs on the right. Under them Washington Avenue: the
Old Capitol Grill's brick block with its orange tile roof and arched
dormers, the white and the blue storefronts, the "Howdy Folks! Welcome to
Golden" arch over the street, the bronze bison on its sandstone plinth, The
Rose with its tall sign and the cream building beside it; the tower of
Guggenheim Hall on the School of Mines campus behind; and Clear Creek's
whitewater park in front, its granite boulders and a drop with a kayaker,
and the creek trail along the near bank.

Drawn from the guide's own reference photographs (content/golden/images/):
washington-avenue-arch.jpg (the arch, the white and blue storefronts, The
Rose, the bison, the globe lamps), old-capitol-grill-and-smokehouse.jpg (that
block), south-table-mountain-park.jpg (South Table, Castle Rock and
Guggenheim Hall), north-table-mountain-park.jpg and golden-1868.jpg (the
basalt cliff bands of the mesas), golden-between-the-mesas.jpg,
table-mountains-and-the-canyon.jpg and lookout-mountain-park.jpg (how the
mesas, the town and the foothills sit together), golden-history-park.jpg and
windy-saddle-park-trailhead.jpg (Mount Zion, the M, the Lariat Trail cuts
and the pines on its ridge), hero.jpg and clear-creek-whitewater-park.jpg
(the creek, its boulders, drops and paddlers) and clear-creek-trail.jpg (the
path). The Coors brewery, which those photographs also show, is left out.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

def rect(x, y, w, h): return [(x, y + h), (x, y), (x + w, y), (x + w, y + h)]
def dab(x, y, rx, ry, col, op=0.8, g=True, f="wcs"):
    wash(f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z", col, op, f, g=g)

BASALT, BASALT_D = "#8C6050", "#5A372E"
def basalt_band(top, x0, x1, d0, d1, step=8):
    """A cap of columnar basalt: a dark band whose foot breaks off column by column."""
    tp = [(x, interp(top, x) + 4 + jit(1.2)) for x in range(int(x0), int(x1) + 1, step)]   # a rim of grass above
    stepped, depth = [], random.uniform(d0, d1)
    for x, y in tp:   # the foot holds its line, then breaks off a block at a time
        if random.random() < 0.18: depth = min(d1, max(d0, depth + random.uniform(-10, 10)))
        stepped += [(x, y + depth), (x + step - 0.1, y + depth)]
    stepped = stepped[:-1]
    stepped[0] = (stepped[0][0], tp[0][1] + d0 * 0.5); stepped[-1] = (stepped[-1][0], tp[-1][1] + d0 * 0.5)
    wash(poly([(x, y + 4) for x, y in stepped] + [(x, y + 16 + jit(4)) for x, y in reversed(stepped)]), "#7D6070", 0.32, "wcs", g=True)
    wash(poly(tp + list(reversed(stepped))), BASALT, 0.94, "wc2")
    wash(poly([(x, y + 3) for x, y in tp] + [(x, y + 12) for x, y in reversed(tp)]), BASALT_D, 0.35, "wcs", g=True)
    x = x0 + random.uniform(3, 8)
    while x < x1 - 3:   # the joints between the columns
        t = interp(tp, x) + random.uniform(2, 6); b = interp(stepped, x) - random.uniform(1, 6)
        if b - t > 8:
            ink(line([(x, t), (x + jit(1.5), b)]), 1.0, random.uniform(0.35, 0.6))
            if random.random() < 0.3:
                wash(poly([(x, t), (x + 5, t), (x + 5, b), (x, b)]), BASALT_D, 0.35, "wcs", g=True)
        x += random.uniform(5, 13)
    ink(line(tp), 2.0, 0.85)
    ink(line(stepped), 1.3, 0.55)
    x = x0 + random.uniform(20, 80)
    while x < x1 - 30:   # gullies running down from the foot of the cliff
        y = interp(stepped, x); L = random.uniform(70, 170); w = random.uniform(10, 22)
        wash(f"M{x - w / 2:.0f},{y:.0f} C{x - w / 3:.0f},{y + L * 0.4:.0f} {x - w * 0.8:.0f},{y + L * 0.7:.0f} {x - 14:.0f},{y + L:.0f} C{x:.0f},{y + L * 0.6:.0f} {x + w / 2:.0f},{y + L * 0.3:.0f} {x + w / 2:.0f},{y:.0f} Z", "#9A7552", 0.22, "wc2", g=True)
        x += random.uniform(90, 200)
    for i in range(int((x1 - x0) / 10)):   # talus below the cliff
        rx = random.uniform(x0, x1); ry = interp(stepped, rx) + random.uniform(6, 60)
        dab(rx, ry, random.uniform(2.5, 6), 2.2, "#8E6A5A", 0.6)
    return stepped

# --- Sky.
sky()
for cx, cy, s in [(330, 140, 60), (1010, 92, 42), (1660, 150, 66), (2210, 108, 46), (600, 292, 26), (2080, 292, 30)]:
    cloud(cx, cy, s)
for bx, by, bs in [(760, 236, 11), (800, 222, 8), (838, 248, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The higher range far behind, then Lookout Mountain's timbered ridge.
INKSCALE = 0.6
far = [(0, 432), (260, 412), (520, 424), (780, 398), (1040, 384), (1300, 392), (1560, 378), (1820, 400), (2080, 386), (2400, 406)]
wash(ridge_d(far), "#B4B2CF", 0.75, "wc3")
ink(open_path(far[2:9]), 1.1, 0.3)
lookout = [(300, 456), (560, 424), (800, 390), (1000, 368), (1200, 354), (1360, 350), (1470, 360), (1560, 384)]
wash(ridge_d(lookout), "#8E9D94", 0.82, "wc3")
for i in range(80):
    x = random.uniform(320, 1560); y = interp(lookout, x) + random.uniform(3, 44)
    r = random.uniform(7, 15)
    dab(x, y, r, r * 0.5, "#566E62", 0.5)
ink(open_path(lookout), 1.3, 0.5)

# --- Mount Zion, with the M and the Lariat Trail cut across its face.
INKSCALE = 0.7
zion = [(1160, 580), (1290, 496), (1410, 424), (1500, 372), (1562, 344), (1600, 336), (1636, 344), (1716, 384), (1800, 438), (1880, 494), (1980, 556)]
wash(ridge_d(zion), "#C6B276", 0.92, "wc1")
wash(f"M1636,344 C1700,372 1800,438 1880,494 L1980,556 L1980,{H} L1720,{H} C1700,620 1690,430 1636,344 Z", "#8C7B9E", 0.36, "wc3", g=True)
for pts in [[(1396, 450), (1480, 441), (1570, 434), (1660, 422), (1752, 404)], [(1330, 502), (1450, 492), (1580, 484), (1700, 471), (1836, 458)]]:
    for a, b in zip(pts, pts[1:]):   # the road cut, in pieces where the scrub hides it
        if random.random() < 0.2: continue
        seg = [a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + jit(2)), b]
        wash(poly(seg + [(x, y + random.uniform(4, 7)) for x, y in reversed(seg)]), "#B0694A", 0.55, "wcs", g=True)
        ink(line(seg), 1.0, 0.4)
for i in range(70):   # scrub oak and mahogany on the slopes
    x = random.uniform(1200, 1960); y = interp(zion, x) + random.uniform(14, 200)
    if y < 600: dab(x, y, random.uniform(4, 8), 3, "#6E7C52", 0.6)
for i in range(40):
    x = random.uniform(1250, 1950); y0 = interp(zion, x) + random.uniform(20, 160)
    if y0 < 600: ink(line([(x, y0), (x - 10, y0 + 12)]), 0.9, 0.22)
# The M, laid out in white stone a little below the summit.
mx, my, ms = 1600, 370, 1.05
M = [(0, 24), (0, 0), (9, 0), (20, 12), (31, 0), (40, 0), (40, 24), (31, 24), (31, 11), (20, 22), (9, 11), (9, 24)]
Mp = [(mx - 20 * ms + px * ms, my + py * ms + (px - 20) * 0.04) for px, py in M]
add(f'<path d="{poly(Mp)}" fill="#FCFAF4" opacity="0.97" filter="url(#wcs)"/>')
ink(poly(Mp), 0.9, 0.55)
for px in (1650, 1684, 1712, 1736):   # the pines along Zion's north ridge
    ponderosa(px, interp(zion, px) + 6, random.uniform(16, 22))
ink(open_path(zion), 2.0, 0.8)

# --- North Table Mountain on the right, its cliffs facing the canyon.
INKSCALE = 0.8
nt = [(1830, 690), (1876, 620), (1918, 548), (1950, 488), (1976, 446), (2002, 418), (2044, 406), (2200, 400), (2400, 406)]
nt_d = ridge_d(nt)
wash(nt_d, "#D9B26A", 0.92, "wc1")
wash(f"M1840,690 C1880,620 1920,548 1950,488 L2010,640 L1960,{H} Z", "#E9C27E", 0.3, "wc3", g=True)
wash(f"M2100,520 C2200,540 2300,560 2400,560 L2400,{H} L2140,{H} Z", "#8E7E9F", 0.3, "wc3", g=True)
add(f'<clipPath id="ntc"><path d="{nt_d}"/></clipPath>')
add('<g clip-path="url(#ntc)">')
ntb = basalt_band([(1990, 424), (2002, 418), (2044, 406), (2200, 400), (2400, 406)], 1990, 2400, 30, 50)
add('</g>')
for i in range(80):
    x = random.uniform(1880, 2400); y = interp(nt, x) + random.uniform(60, 250)
    if y < 650: dab(x, y, random.uniform(4, 9), 3.5, "#6E7C52", 0.6)
for i in range(60):
    x = random.uniform(1900, 2400); y0 = interp(nt, x) + random.uniform(60, 230)
    if y0 < 650: ink(line([(x, y0), (x - 12, y0 + 14)]), 1.0, 0.3)
ink(open_path(nt[:6]), 2.0, 0.75)

# --- South Table Mountain on the left, with Castle Rock on its western knob.
INKSCALE = 0.8
st = [(0, 410), (140, 400), (330, 396), (520, 400), (700, 394), (860, 398), (980, 402), (1030, 406), (1160, 406), (1210, 426), (1270, 468), (1350, 532), (1440, 598), (1540, 660)]
st_d = ridge_d(st)
wash(st_d, "#D7AC66", 0.92, "wc1")
wash(f"M1160,406 C1220,440 1300,500 1350,532 C1420,580 1480,620 1540,660 L1540,{H} L1300,{H} C1280,640 1220,500 1160,406 Z", "#8C7B9E", 0.4, "wc3", g=True)
wash("M0,560 C300,540 700,560 1100,590 L1300,660 L0,660 Z", "#B08A55", 0.22, "wc3", g=True)   # the lower slopes, deeper
add(f'<clipPath id="stc"><path d="{st_d}"/></clipPath>')
add('<g clip-path="url(#stc)">')
stb = basalt_band(st[:7], 0, 1010, 26, 44)
add('</g>')
for cx, cy, rw in [(160, 520, 70), (420, 500, 50), (610, 540, 80), (860, 512, 60), (300, 590, 90), (760, 600, 70), (1040, 560, 50)]:
    for k in range(3):   # bands of mountain mahogany and sumac along the slope
        dab(cx + jit(rw * 0.5), cy + jit(5), rw * random.uniform(0.35, 0.6), random.uniform(5, 9), "#6E7C52", 0.32, f="wc2")
# Castle Rock: a block of the same basalt, sheer on every side.
cr = [(1016, 412), (1022, 368), (1034, 348), (1060, 340), (1118, 338), (1144, 344), (1158, 362), (1166, 412)]
wash(poly(cr), BASALT, 0.95, "wc2")
wash(poly([(1120, 338), (1144, 344), (1158, 362), (1166, 412), (1124, 412)]), BASALT_D, 0.45, "wcs", g=True)
x = 1024
while x < 1160:
    t = interp(cr[1:6], x) + 4 if x < 1144 else 352
    ink(line([(x, t), (x + jit(1), 408)]), 1.0, 0.5); x += random.uniform(6, 12)
ink(poly(cr), 2.0, 0.85)
wash("M1010,412 C1050,404 1130,404 1172,412 C1190,430 1210,446 1220,460 L1000,452 Z", "#9A7262", 0.45, "wcs", g=True)   # talus under the knob
for i in range(110):
    x = random.uniform(0, 1520); y = interp(st, x) + random.uniform(70, 260)
    if y < 650 and y > interp(st, x) + 50: dab(x, y, random.uniform(4, 10), 3.5, "#6E7C52", 0.6)
for i in range(70):
    x = random.uniform(0, 1500); y0 = interp(st, x) + random.uniform(70, 220)
    if y0 < 640: ink(line([(x, y0), (x - 10, y0 + 20)]), 0.9, 0.24)
ink(open_path(st[6:]), 2.0, 0.75)

# --- Valley floor.
INKSCALE = 0.85
floor = [(0, 646), (600, 638), (1200, 648), (1800, 640), (2400, 648)]
wash(ridge_d(floor), "#CDBB72", 0.85, "wc3")
for x0, y0, w, h, col in [(40, 700, 360, 40, "#B8A85E"), (520, 716, 300, 34, "#D8C27A"), (200, 776, 460, 46, "#BFA866"), (700, 792, 340, 30, "#C9B26C")]:
    wash(f"M{x0},{y0} C{x0 + w * 0.3},{y0 - h * 0.5} {x0 + w * 0.7},{y0 - h * 0.4} {x0 + w},{y0} C{x0 + w * 0.7},{y0 + h * 0.6} {x0 + w * 0.3},{y0 + h * 0.5} {x0},{y0} Z", col, 0.45, "wc3", g=True)

# --- The School of Mines on the hill behind town: Guggenheim Hall's tower.
def guggenheim(x, base):
    w, h = 150, 30
    walls = rect(x, base - h, w, h)
    wash(poly(walls), "#E8D8B4", 0.92, "wcs")
    roof = [(x - 8, base - h + 2), (x + 16, base - h - 22), (x + w - 16, base - h - 22), (x + w + 8, base - h + 2)]
    wash(poly(roof), "#B9533A", 0.92, "wcs")
    for k in range(int((w + 10) / 7)):
        rx = x - 2 + k * 7
        ink(line([(rx, base - h - 1), (rx + (x + w / 2 - rx) * 0.12, base - h - 19)]), 0.6, 0.35)
    ink(poly(roof), 1.4, 0.8); ink(poly(walls), 1.4, 0.8)
    for wx in range(int(x + 10), int(x + w - 10), 14):
        wash(poly(rect(wx, base - h + 9, 7, 12)), WIN, 0.8, "wcs", g=True)
    gx = x + 26   # the curved Mission gable
    gd = f"M{gx},{base - h - 4} L{gx},{base - h - 22} q8,-2 12,-10 q8,-10 16,-10 q8,0 16,10 q4,8 12,10 L{gx + 56},{base - h - 4} Z"
    wash(gd, "#F3ECDD", 0.95, "wcs"); ink(gd, 1.2, 0.8)
    wash(poly(rect(gx + 22, base - h - 24, 12, 14)), WIN, 0.8, "wcs", g=True)
    tx, tw = x + w - 48, 36   # the tower: a square shaft, an open belfry, a balustrade, a lantern and dome
    shaft = rect(tx, base - h - 70, tw, h + 70)
    wash(poly(shaft), "#EBDCB9", 0.95, "wcs")
    wash(poly(rect(tx + tw * 0.64, base - h - 70, tw * 0.36, h + 70)), "#9C8A8A", 0.3, "wcs", g=True)
    ink(poly(shaft), 1.5, 0.85)
    trimmed(tx + 12, base - h - 46, 12, 22, "#5B5560")
    by = base - h - 70
    corn = rect(tx - 3, by - 5, tw + 6, 6)
    wash(poly(corn), "#D9C8A4", 0.9, "wcs"); ink(poly(corn), 1.1, 0.8)
    bel = rect(tx + 1, by - 32, tw - 2, 27)
    wash(poly(bel), "#EBDCB9", 0.95, "wcs")
    for ax in (tx + 6, tx + 20):
        wash(f"M{ax},{by - 7} L{ax},{by - 21} a5,5 0 0,1 10,0 L{ax + 10},{by - 7} Z", "#4E4652", 0.9, "wcs", g=True)
    ink(poly(bel), 1.2, 0.85)
    bal = rect(tx - 2, by - 38, tw + 4, 6)
    wash(poly(bal), "#D9C8A4", 0.9, "wcs"); ink(poly(bal), 1.0, 0.8)
    for k in range(1, 7):
        ink(line([(tx - 2 + k * (tw + 4) / 7, by - 37), (tx - 2 + k * (tw + 4) / 7, by - 33)]), 0.6, 0.6)
    lan = [(tx + 8, by - 38), (tx + 10, by - 52), (tx + tw - 10, by - 52), (tx + tw - 8, by - 38)]
    wash(poly(lan), "#EBDCB9", 0.95, "wcs"); ink(poly(lan), 1.0, 0.8)
    ink(line([(tx + tw / 2, by - 40), (tx + tw / 2, by - 50)]), 0.8, 0.55)
    dome = f"M{tx + 9},{by - 52} C{tx + 10},{by - 66} {tx + tw - 10},{by - 66} {tx + tw - 9},{by - 52} Z"
    wash(dome, "#D9B25A", 0.92, "wcs"); ink(dome, 1.1, 0.85)
    ink(line([(tx + tw / 2, by - 63), (tx + tw / 2, by - 73)]), 1.2, 0.85)
def campus_hall(x, base, w, h):
    walls = rect(x, base - h, w, h)
    wash(poly(walls), "#E3D2AE", 0.9, "wcs")
    roof = [(x - 6, base - h + 2), (x + 12, base - h - 16), (x + w - 12, base - h - 16), (x + w + 6, base - h + 2)]
    wash(poly(roof), "#B9533A", 0.9, "wcs")
    ink(poly(roof), 1.2, 0.75); ink(poly(walls), 1.2, 0.75)
    for wx in range(int(x + 8), int(x + w - 8), 12):
        wash(poly(rect(wx, base - h + 8, 6, 10)), WIN, 0.75, "wcs", g=True)
campus_hall(1250, 596, 110, 26)
guggenheim(1380, 590)

# Gold cottonwoods behind the avenue, leaving the tower clear.
for x in [1200, 1330, 1600, 1700, 1810, 1920, 2030, 2140, 2250, 2350]:
    cottonwood(x + jit(20), 652 + jit(8), random.uniform(56, 70), back=True, shadow=False)
# The creek's edges, needed here for the trees along its far bank on the left.
rt = [(2400, 790), (2000, 800), (1600, 814), (1200, 832), (900, 848), (600, 864), (300, 878), (0, 890)]
rbk = [(800, 1000), (1000, 944), (1300, 902), (1600, 874), (2000, 856), (2400, 846)]
far_y = lambda x: interp(rt[::-1], x)
near_y = lambda x: interp([(0, 1000), (800, 1000), (1000, 944), (1300, 902), (1600, 874), (2000, 856), (2400, 846)], x)
wash("M-40,644 C600,636 1200,652 2440,646 L2440,900 L-40,900 Z", "#A8935A", 0.28, "wc3", g=True)   # the meadow, a tone deeper
for i in range(90):   # grass and rabbitbrush on the flat in front of the avenue
    x = random.uniform(1180, 2400); y = random.uniform(748, far_y(x) - 6)
    if random.random() < 0.25: dab(x, y, 8, 5, "#D6B23E", 0.7)
    else: ink(line([(x, y), (x + jit(4), y - random.uniform(6, 13))]), 0.9, 0.35)
x = -20
while x < 1160:   # a looser row behind, then the big trees along the bank
    if random.random() < 0.2: x += 60; continue
    cottonwood(x + jit(10), 706 + jit(8), random.uniform(34, 44), back=True)
    x += random.uniform(70, 100)
x = -30
while x < 1130:
    if random.random() < 0.15: x += 70; continue
    cottonwood(x, far_y(x) - 34 + jit(6), random.uniform(46, 60), back=random.random() < 0.5)
    x += random.uniform(68, 92)

# --- Washington Avenue, base at y 712.
B = 712
INKSCALE = 0.9
wash(poly([(1210, B - 4), (2290, B - 4), (2310, B + 30), (1190, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1190, B + 30), (2310, B + 30)]), 1.4, 0.55)

def storefront_base(x, w):
    wash(poly(rect(x + 6, B - 40, w - 12, 34)), "#5C5560", 0.62, "wcs", g=True)
    for k in range(1, 4):
        ink(line([(x + 6 + (w - 12) * k / 4, B - 40), (x + 6 + (w - 12) * k / 4, B - 6)]), 0.8, 0.45)

def capitol(x):
    """The Old Capitol Grill block: red brick, a cream dentil frieze on the left half, an orange tile mansard with two arched green dormers on the right."""
    wl, hl, wr, hr = 104, 116, 130, 122
    brick = "#B65A40"
    wash(poly(rect(x, B - hl, wl, hl)), brick, 0.93, "wcs")
    wash(poly(rect(x + wl, B - hr, wr, hr)), brick, 0.93, "wcs")
    wash(poly(rect(x + wl + wr * 0.7, B - hr, wr * 0.3, hr)), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - hl + 22, x + wl + wr, B - 54, step=10)
    fr = rect(x - 3, B - hl - 4, wl + 3, 16)
    wash(poly(fr), "#EFE3C2", 0.92, "wcs"); ink(poly(fr), 1.1, 0.7)
    for k in range(int(wl / 6)):
        ink(line([(x + 3 + k * 6, B - hl + 5), (x + 3 + k * 6, B - hl + 10)]), 0.7, 0.5)
    mans = [(x + wl + 10, B - hr), (x + wl + 16, B - hr - 40), (x + wl + wr - 16, B - hr - 40), (x + wl + wr - 10, B - hr)]
    wash(poly(mans), "#D9733A", 0.94, "wcs")
    for k in range(int((wr - 24) / 6)):
        tx = x + wl + 14 + k * 6
        ink(line([(tx, B - hr - 2), (tx + (x + wl + wr / 2 - tx) * 0.05, B - hr - 38)]), 0.6, 0.35)
    for y in range(int(B - hr - 34), int(B - hr), 8):
        ink(line([(x + wl + 14, y), (x + wl + wr - 14, y)]), 0.5, 0.3)
    ink(poly(mans), 1.3, 0.8)
    for px in (x + wl, x + wl + wr - 12):   # brick piers at the ends of the mansard
        pr = rect(px, B - hr - 48, 12, 48)
        wash(poly(pr), brick, 0.94, "wcs"); ink(poly(pr), 1.2, 0.8)
    for dx in (0.32, 0.68):
        cx = x + wl + wr * dx
        dd = f"M{cx - 13:.0f},{B - hr - 2} L{cx - 13:.0f},{B - hr - 24} a13,13 0 0,1 26,0 L{cx + 13:.0f},{B - hr - 2} Z"
        add(f'<path d="{dd}" fill="{PAPER}"/>')
        wash(dd, "#4E7E74", 0.9, "wcs", g=True)
        for ly in range(int(B - hr - 22), int(B - hr - 4), 4):
            ink(line([(cx - 8, ly), (cx + 8, ly)]), 0.6, 0.5)
        ink(dd, 1.3, 0.85)
        ink(f"M{cx - 17:.0f},{B - hr - 22} a17,15 0 0,1 34,0", 1.2, 0.75, color="#E8DDC8")
    ink(poly(rect(x, B - hl, wl, hl)), 2.0); ink(poly(rect(x + wl, B - hr, wr, hr)), 2.0)
    for wx, ww, top in [(x + 12, 34, B - hl + 26), (x + 58, 34, B - hl + 26), (x + wl + 14, 42, B - hr + 30), (x + wl + 74, 42, B - hr + 30)]:
        add(f'<path d="{poly(rect(wx - 3, top - 3, ww + 6, 46))}" fill="{PAPER}"/>')
        wash(poly(rect(wx, top, ww, 40)), "#55707A", 0.85, "wcs", g=True)
        ink(poly(rect(wx - 3, top - 3, ww + 6, 46)), 1.2, 0.8, color="#2F5A50")
        for k in (1, 2):
            ink(line([(wx + ww * k / 3, top), (wx + ww * k / 3, top + 40)]), 0.9, 0.7, color="#2F5A50")
    sb = rect(x + 4, B - 54, wl + wr - 8, 12)
    wash(poly(sb), "#2F2A2A", 0.9, "wcs", g=True)
    ink(line([(x + 40, B - 48), (x + wl + wr - 30, B - 48)]), 1.2, 0.8, color="#D9B44A")
    storefront_base(x, wl + wr)
    return x + wl + wr

def italianate(x):
    """The white two-storey building west of the arch: bracketed cornice, tall hooded windows."""
    w, h = 112, 140
    wall = rect(x, B - h, w, h)
    wash(poly(wall), "#EFE9DC", 0.88, "wcs")
    wash(poly(rect(x + w * 0.7, B - h, w * 0.3, h)), "#9C94A8", 0.22, "wcs", g=True)
    corn = rect(x - 6, B - h - 12, w + 12, 12)
    wash(poly(corn), "#E2D9C7", 0.92, "wcs"); ink(poly(corn), 1.3, 0.8)
    for bx in range(int(x), int(x + w + 1), 16):
        ink(line([(bx, B - h), (bx, B - h + 9)]), 1.0, 0.7); ink(line([(bx + 3, B - h), (bx + 3, B - h + 6)]), 0.8, 0.6)
    for k in range(int(w / 6)):
        ink(line([(x + 3 + k * 6, B - h + 12), (x + 3 + k * 6, B - h + 15)]), 0.6, 0.45)
    for wx in (x + 15, x + 47, x + 79):
        trimmed(wx, B - h + 34, 18, 40, "#4A4752")
        ink(f"M{wx - 7},{B - h + 30} a16,9 0 0,1 32,0", 1.3, 0.8)
    wash(poly(rect(x + 4, B - 50, w - 8, 8)), "#3F5E4A", 0.8, "wcs", g=True)
    storefront_base(x, w)
    ink(poly(wall), 2.0)
    return x + w

def blue_front(x):
    """The blue building with its white cornice and window trim."""
    w, h = 98, 122
    wall = rect(x, B - h, w, h)
    wash(poly(wall), "#5F8DB0", 0.9, "wcs")
    wash(poly(rect(x + w * 0.7, B - h, w * 0.3, h)), "#2F4A66", 0.22, "wcs", g=True)
    corn = rect(x - 5, B - h - 10, w + 10, 14)
    add(f'<path d="{poly(corn)}" fill="{PAPER}"/>'); ink(poly(corn), 1.3, 0.8)
    for bx in range(int(x), int(x + w + 1), 14):
        ink(line([(bx, B - h + 4), (bx, B - h + 10)]), 0.9, 0.6)
    for wx in (x + 14, x + 40, x + 66):
        trimmed(wx, B - h + 26, 16, 38, "#3E4652")
    wash(poly(rect(x + 4, B - 50, w - 8, 8)), "#F2EEE6", 0.9, "wcs")
    storefront_base(x, w)
    ink(poly(wall), 2.0)
    return x + w

def rose(x):
    """The Rose: red brick, a slate mansard with dormers, maroon awnings and its tall red sign."""
    w, h = 140, 140
    wall = rect(x, B - h, w, h)
    wash(poly(wall), "#B4523C", 0.93, "wcs")
    wash(poly(rect(x + w * 0.7, B - h, w * 0.3, h)), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - h + 30, x + w, B - 56, step=10)
    mans = [(x - 4, B - h + 4), (x + 8, B - h - 26), (x + w - 8, B - h - 26), (x + w + 4, B - h + 4)]
    wash(poly(mans), "#5E5F6C", 0.92, "wcs"); ink(poly(mans), 1.4, 0.85)
    for dx in (34, 92):
        dm = [(x + dx, B - h + 2), (x + dx, B - h - 20), (x + dx + 12, B - h - 30), (x + dx + 24, B - h - 20), (x + dx + 24, B - h + 2)]
        wash(poly(dm), "#B4523C", 0.92, "wcs"); ink(poly(dm), 1.2, 0.85)
        wash(poly(rect(x + dx + 6, B - h - 16, 12, 16)), WIN, 0.85, "wcs", g=True)
    for wx in (x + 34, x + 64, x + 94, x + 118):
        trimmed(wx, B - h + 30, 16, 34, "#3E3B46")
    aw = [(x + 4, B - 58), (x + w - 4, B - 58), (x + w + 4, B - 42), (x - 4, B - 42)]
    wash(poly(aw), "#7A2232", 0.92, "wcs"); ink(poly(aw), 1.3, 0.8)
    storefront_base(x, w)
    ink(poly(wall), 2.0)
    sx, sy = x + 6, B - h - 6   # the sign
    sg = rect(sx, sy, 24, 92)
    add(f'<path d="{poly(rect(sx - 2, sy - 2, 28, 96))}" fill="{PAPER}"/>')
    wash(poly(sg), "#A42E3A", 0.95, "wcs", g=True)
    ink(poly(sg), 1.3, 0.85)
    add(f'<text x="{sx + 12}" y="{sy + 13}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="9" font-weight="bold" fill="#FBF7EE" opacity="0.95">THE</text>')
    for k, ch in enumerate("ROSE"):
        add(f'<text x="{sx + 12}" y="{sy + 33 + k * 18}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="16" font-weight="bold" fill="#FBF7EE" opacity="0.95">{ch}</text>')
    return x + w

def cream_front(x):
    w, h = 112, 124
    wall = rect(x, B - h, w, h)
    wash(poly(wall), "#E2CFA6", 0.9, "wcs")
    wash(poly(rect(x + w * 0.7, B - h, w * 0.3, h)), "#8E7E9F", 0.22, "wcs", g=True)
    wash(poly(rect(x - 4, B - h - 8, w + 8, 10)), "#A8836A", 0.85, "wcs", g=True)
    ink(poly(rect(x - 4, B - h - 8, w + 8, 10)), 1.2, 0.75)
    for wx in (x + 16, x + 50, x + 84):
        trimmed(wx, B - h + 26, 16, 34)
    wash(poly(rect(x + 4, B - 52, w - 8, 10)), "#3F5E4A", 0.85, "wcs", g=True)
    storefront_base(x, w)
    ink(poly(wall), 2.0)
    return x + w

def lamp(lx):
    ink(line([(lx, B + 24), (lx, B - 78)]), 2.2, 0.9, color="#2E2A2C")
    ink(line([(lx - 4, B + 24), (lx + 4, B + 24)]), 2.4, 0.9, color="#2E2A2C")
    add(f'<circle cx="{lx}" cy="{B - 88}" r="9" fill="#FCF8EE" opacity="0.95"/>')
    ink(f"M{lx - 9},{B - 88} a9,9 0 1,1 18,0 a9,9 0 1,1 -18,0", 1.1, 0.8)
    ink(line([(lx - 5, B - 78), (lx + 5, B - 78)]), 1.6, 0.9, color="#2E2A2C")

# Washington Avenue running back through the arch, between the blue front and The Rose.
G0, G1 = 1680, 1962
VX, VY = 1826, B - 22   # the avenue's vanishing point, at the eye height of someone on the sidewalk
def toward(x0, y0, x):   # y on the line from (x0, y0) to the vanishing point
    return y0 + (VY - y0) * (x - x0) / (VX - x0)
wash(poly([(G0 + 10, B + 30), (G1 - 10, B + 30), (VX + 7, VY + 1), (VX - 7, VY + 1)]), "#A9A196", 0.9, "wcs")
for off in (-2.2, 2.2):
    ink(line([(1818 + off, B + 30), (VX - 1 + off * 0.2, VY + 2)]), 1.2, 0.85, color="#D9A93A")
xe = 1800
for (a, b), col in zip([(0, 0.4), (0.4, 0.72), (0.72, 1.0)], ["#EDE6D8", "#6A93B2", "#B9603E"]):   # the avenue's west side running back
    xa, xb = G0 + (xe - G0) * a, G0 + (xe - G0) * b
    q = [(xa, toward(G0, B + 22, xa)), (xa, toward(G0, B - 104, xa)), (xb, toward(G0, B - 104, xb)), (xb, toward(G0, B + 22, xb))]
    wash(poly(q), col, 0.88, "wcs")
    ink(poly(q), 1.0, 0.6)
    for k in range(2):
        wx = xa + (xb - xa) * (0.25 + k * 0.4); ww = (xb - xa) * 0.18
        t0, t1 = toward(G0, B - 80, wx), toward(G0, B - 80, wx + ww)
        wash(poly([(wx, t0), (wx + ww, t1), (wx + ww, t1 + (B - t1) * 0.3), (wx, t0 + (B - t0) * 0.3)]), WIN, 0.7, "wcs", g=True)
for (ax, ay) in [(G0 + 10, B + 30), (G1 - 10, B + 30)]:   # the curbs
    ink(line([(ax, ay), (VX + (7 if ax > VX else -7), VY + 1)]), 1.1, 0.55)
for tx, tr in [(1934, 30), (1894, 20), (1866, 13), (1850, 8), (1806, 7), (1814, 5)]:
    cottonwood(tx, toward(G1 if tx > VX else G0, B + 14, tx), tr, back=True, shadow=False)
for k in range(5):   # the avenue's far end, lost among its trees
    dab(VX - 14 + k * 7, VY - 3 + jit(1), 6, 5, random.choice(["#E9AE3E", "#D6A63C", "#A39A45"]), 0.85, g=False)

xx = capitol(1222) + 6
xx = italianate(xx) + 4
xx = blue_front(xx)
rx = rose(G1 + 2)
cream_front(rx + 4)

# The arch: "Howdy Folks! / Welcome to Golden / Where the West Lives".
INKSCALE = 1.0
for px in (G0 + 6, G1 - 16):
    leg = rect(px, B - 116, 10, 140)
    wash(poly(leg), "#4E3626", 0.95, "wcs"); ink(poly(leg), 1.2, 0.8)
AC = (G0 + G1) / 2
band = f"M{G0},{B - 128} Q{AC},{B - 264} {G1},{B - 128} L{G1 - 8},{B - 100} Q{AC},{B - 232} {G0 + 8},{B - 100} Z"
wash(band, "#5E4230", 0.96, "wcs")
ink(band, 1.6, 0.85)
add(f'<defs><path id="archtext" d="M{G0 + 8},{B - 106} Q{AC},{B - 240} {G1 - 8},{B - 106}"/></defs>')
add(f'<text font-family="DejaVu Serif, Georgia, serif" font-size="17" font-weight="bold" letter-spacing="1" fill="#F2C431" opacity="0.97"><textPath href="#archtext" startOffset="50%" text-anchor="middle">WELCOME TO GOLDEN</textPath></text>')
hp = f"M{AC - 48},{B - 194} L{AC - 48},{B - 216} Q{AC},{B - 236} {AC + 48},{B - 216} L{AC + 48},{B - 194} Z"
wash(hp, "#5E4230", 0.96, "wcs"); ink(hp, 1.3, 0.85)
add(f'<text x="{AC}" y="{B - 201}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="13" font-style="italic" font-weight="bold" fill="#F7EEDC" opacity="0.95">Howdy Folks!</text>')
wp = rect(AC - 54, B - 161, 108, 13)
add(f'<path d="{poly(rect(AC - 56, B - 163, 112, 17))}" fill="{PAPER}"/>')
wash(poly(wp), "#5E4230", 0.96, "wcs", g=True); ink(poly(rect(AC - 56, B - 163, 112, 17)), 1.0, 0.8)
add(f'<text x="{AC}" y="{B - 151.5}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#F7EEDC" opacity="0.92">WHERE THE WEST LIVES</text>')

# The bronze bison on its sandstone plinth at the corner by The Rose.
def bison(x, base, s=1.0):
    for pl, col in [(rect(x - 8, base - 8, 76, 8), "#B9785A"), (rect(x - 4, base - 20, 68, 13), "#C98A6A")]:
        wash(poly(pl), col, 0.95, "wcs"); ink(poly(pl), 1.2, 0.8)
    b0 = base - 20
    # Facing left: the great head held low, the beard, the hump, legs planted.
    pts = [(0, -14), (2, -6), (6, -4), (10, -10), (12, -10), (12, 0), (17, 0), (18, -9), (24, -11), (34, -12), (38, -11), (38, 0), (43, 0),
           (45, -10), (50, -14), (53, -22), (50, -28), (40, -31), (30, -38), (22, -42), (15, -40), (10, -34), (5, -28), (1, -22)]
    bp = [(x + px * s, b0 + py * s) for px, py in pts]
    for lx in (15, 41):   # the far legs
        wash(poly(rect(x + (lx - 4) * s, b0 - 10 * s, 4 * s, 10 * s)), "#2A2422", 0.9, "wcs", g=True)
    wash(poly(bp), "#3B3330", 0.95, "wcs")
    wash(poly([(x + 10 * s, b0 - 34 * s), (x + 15 * s, b0 - 40 * s), (x + 22 * s, b0 - 42 * s), (x + 30 * s, b0 - 38 * s), (x + 26 * s, b0 - 26 * s), (x + 12 * s, b0 - 20 * s)]), "#7A6A58", 0.45, "wcs", g=True)   # light on the shaggy forequarters
    ink(poly(bp), 1.2, 0.9)
    ink(f"M{x + 8 * s:.1f},{b0 - 31 * s:.1f} q-1,-6 4,-8", 1.4, 0.9)   # horn
bison(G1 + 14, B + 28, 1.15)
for lx in (1236, 1452, G0 - 4, G1 + 100, 2236):
    lamp(lx)
wash(poly([(1210, B + 2), (2290, B + 2), (2296, B + 14), (1204, B + 14)]), "#7E7398", 0.4, "wcs", g=True)
for x in (1200, 2276):
    cottonwood(x, B + 12, 38)

# --- Clear Creek, out of the canyon and through the whitewater park.
INKSCALE = 1.1
river_d = f"M{rt[0][0]},{rt[0][1]} " + smooth(rt) + " L0,1000 L800,1000 " + smooth(rbk) + " Z"
wash(river_d, "#76A1B8", 0.92, "wc3")
wash(poly([(2400, 806), (1800, 822), (1300, 850), (900, 880), (600, 920), (420, 1000), (240, 1000), (420, 930), (800, 876), (1300, 836), (1900, 812), (2400, 798)]), "#567E98", 0.35, "wc3", g=True)
wash("M0,900 C300,890 600,880 900,866 L700,1000 L0,1000 Z", "#4F7690", 0.3, "wc3", g=True)   # deeper water on the left, under the words
wash(open_path(rt) + " L0,904 " + smooth([(0, 904), (300, 892), (600, 878), (900, 862), (1200, 846), (1600, 828), (2000, 814), (2400, 804)]) + " Z", "#E2B55A", 0.3, "wc2", g=True)
ink(open_path(rt), 1.8, 0.65)
ink(open_path(rbk), 1.8, 0.6)
for i in range(60):
    t = random.random(); x = 200 + t * 2150
    if x < 1100 and random.random() < 0.6: continue
    y = far_y(x) + (near_y(x) - far_y(x)) * random.uniform(0.15, 0.85)
    L = random.uniform(26, 80) * (1.2 - t * 0.6)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-5 - t * 2:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{3.6 - t * 1.6:.1f}" fill="none" stroke-linecap="round" opacity="0.88"/>')
    if random.random() < 0.35: ink(f"M{x + 6:.0f},{y + 6:.0f} q{L / 3:.0f},-3 {L * 0.6:.0f},0", 1.0, 0.4)

def rock(cx, cy, r, col="#B9AAA1"):
    d = f"M{cx - r:.0f},{cy:.0f} C{cx - r:.0f},{cy - r * 0.8:.0f} {cx - r * 0.3:.0f},{cy - r:.0f} {cx + r * 0.2:.0f},{cy - r * 0.95:.0f} C{cx + r * 0.9:.0f},{cy - r * 0.9:.0f} {cx + r * 1.05:.0f},{cy - r * 0.4:.0f} {cx + r:.0f},{cy:.0f} Z"
    wash(d, col, 0.94, "wcs")
    wash(f"M{cx + r * 0.1:.0f},{cy - r * 0.92:.0f} C{cx + r * 0.9:.0f},{cy - r * 0.9:.0f} {cx + r * 1.05:.0f},{cy - r * 0.4:.0f} {cx + r:.0f},{cy:.0f} L{cx:.0f},{cy:.0f} C{cx + r * 0.35:.0f},{cy - r * 0.5:.0f} {cx + r * 0.3:.0f},{cy - r * 0.8:.0f} {cx + r * 0.1:.0f},{cy - r * 0.92:.0f} Z", "#6E6478", 0.45, "wcs", g=True)
    ink(d, 1.5, 0.8)

GRANITE = ["#B9AAA1", "#C4B49C", "#A99C96"]
def rock_bank(x0, x1, yf, dy, gap=(30, 140), size=(9, 20)):
    """Granite boulders set along a bank in clusters, as the whitewater park's are."""
    x = x0 + random.uniform(0, 40)
    while x < x1:
        for k in range(random.choice([1, 2, 2, 3, 4])):
            r = random.uniform(*size); rock(x, yf(x) + dy + jit(3), r, random.choice(GRANITE)); x += r * random.uniform(1.4, 1.9)
        x += random.uniform(*gap)
rock_bank(1180, 2400, far_y, 6)
rock_bank(20, 1180, far_y, 6, gap=(60, 200), size=(9, 16))
# The drop: a line of boulders across the creek, white water spilling below it.
dx0, dy0, dx1, dy1 = 1430, far_y(1430) + 10, 1360, near_y(1360) - 6
for k in range(8):
    t = k / 7
    rock(dx0 + (dx1 - dx0) * t + jit(4), dy0 + (dy1 - dy0) * t, random.uniform(9, 13), random.choice(["#B9AAA1", "#C4B49C"]))
for k in range(26):
    t = random.random()
    sx = dx0 + (dx1 - dx0) * t - random.uniform(10, 90); sy = dy0 + (dy1 - dy0) * t + random.uniform(-2, 6)
    L = random.uniform(16, 46)
    add(f'<path d="M{sx:.0f},{sy:.0f} q{-L / 2:.0f},{-4:.0f} {-L:.0f},{jit(3):.0f}" stroke="#FCF9F2" stroke-width="{random.uniform(2.5, 5):.1f}" fill="none" stroke-linecap="round" opacity="0.92"/>')
# A kayaker playing in the hole below the drop, and a tuber drifting down to it.
kx, ky = 1300, 868
wash(f"M{kx - 24},{ky} C{kx - 16},{ky - 7} {kx + 16},{ky - 7} {kx + 24},{ky} C{kx + 16},{ky + 5} {kx - 16},{ky + 5} {kx - 24},{ky} Z", "#D2402C", 0.95, "wcs")
ink(f"M{kx - 24},{ky} C{kx - 16},{ky - 7} {kx + 16},{ky - 7} {kx + 24},{ky} C{kx + 16},{ky + 5} {kx - 16},{ky + 5} {kx - 24},{ky} Z", 1.2, 0.85)
wash(poly([(kx - 6, ky - 4), (kx - 5, ky - 16), (kx + 5, ky - 16), (kx + 6, ky - 4)]), "#C8402C", 0.95, "wcs")
dab(kx, ky - 21, 5, 5, "#2F5E8C", 0.95, g=False)
ink(line([(kx - 26, ky - 4), (kx + 24, ky - 22)]), 1.6, 0.9)
for ex, ey in [(kx - 26, ky - 4), (kx + 24, ky - 22)]:
    dab(ex, ey, 5, 2.5, "#E0B23A", 0.95, g=False)
for k in range(4):
    add(f'<path d="M{kx - 40 - k * 8},{ky + 4 + k * 3} q{24 + k * 6},-7 {54 + k * 10},{jit(2):.0f}" stroke="#FCF9F2" stroke-width="{3 - k * 0.5:.1f}" fill="none" stroke-linecap="round" opacity="0.9"/>')
tx_, ty_ = 1690, 846
ink(f"M{tx_ - 13},{ty_} a13,5 0 1,0 26,0 a13,5 0 1,0 -26,0", 4.2, 0.9, color="#3A73B8")
dab(tx_, ty_ - 8, 4, 4, "#8E5A3E", 0.95, g=False)
ink(line([(tx_ - 6, ty_ - 4), (tx_ + 6, ty_ - 4)]), 2.0, 0.8, color="#C44A3A")

# --- The near bank: dry grass, the creek trail, willows, rabbitbrush.
bank = [(800, 1000), (1000, 944), (1300, 902), (1600, 874), (2000, 856), (2400, 846)]
wash("M800,1000 " + smooth(bank) + f" L2400,{H} Z", "#D2B66B", 0.9, "wc1")
wash("M1100,1000 C1400,940 1800,900 2400,890 L2400,1000 Z", "#8F7F5C", 0.32, "wc3", g=True)
rock_bank(1000, 2400, near_y, 10, gap=(40, 160), size=(10, 22))
path_t = [(1230, 1000), (1420, 962), (1700, 934), (2050, 918), (2400, 910)]
path_b = [(2400, 938), (2050, 946), (1720, 962), (1480, 990), (1430, 1000)]
pd = f"M{path_t[0][0]},{path_t[0][1]} " + smooth(path_t) + f" L{path_b[0][0]},{path_b[0][1]} " + smooth(path_b) + " Z"
wash(pd, "#DCCDAE", 0.92, "wcs")
ink(open_path(path_t), 1.4, 0.65); ink(open_path(path_b), 1.4, 0.6)
for i in range(200):
    x = random.uniform(900, 2400); top = near_y(x) + random.uniform(14, 140)
    if top > 1000: continue
    if interp(path_t, x) - 4 < top < interp(path_b[::-1], x) + 4: continue
    L = random.uniform(10, 26)
    ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.42)
def willows(x, base, w):
    wands = []
    for k in range(int(w / 7)):
        sx = x + k * 7 + jit(3); hgt = random.uniform(30, 60); lean = jit(8)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.1, 0.75, color="#6E2418")
        wands.append(f"M{sx + lean * 0.6 - 5:.0f},{base - hgt * 0.62:.0f} a5,{hgt * 0.38:.0f} 0 1,0 10,0 a5,{hgt * 0.38:.0f} 0 1,0 -10,0 Z")
    d = " ".join(wands)
    wash(d, "#C24A2C", 0.78, "wcs")
    wash(d, "#E8A23E", 0.3, "wcs", g=True)
for x, w in [(1560, 70), (1880, 90), (2250, 70)]:
    willows(x, near_y(x) + 28, w)
for i in range(50):
    x = random.uniform(1000, 2400); y = near_y(x) + random.uniform(20, 150)
    if y < 990 and not (interp(path_t, x) - 8 < y < interp(path_b[::-1], x) + 8):
        dab(x, y, 9, 6, "#E2B92E", 0.75)
for x in (2300, 2390):
    cottonwood(x, near_y(x) + 80, 54)
# Willows and a few cottonwoods on the far bank to the left.
for x, w in [(260, 70), (620, 80), (980, 60)]:
    willows(x, far_y(x) + 2, w)

finish(sys.argv[1])
