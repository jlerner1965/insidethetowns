"""Lyons hero, ink and watercolour, 2400 x 1000.

Looking west up Main Street on an autumn morning: the hill behind town with
its level band of red sandstone and pines on the crest, a red-capped ridge
to the left, the stone church and the 1881 depot and the sandstone
storefronts, and the St. Vrain in front with its red slabs and boulders.
Washes are filtered for wobbly edges, uneven pigment and darker rims, laid
over warm paper with multiply, and the ink is sepia with a slight tremor.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(23)

# --- Sky: one loose wash, clouds left as paper with warm undersides.
add(f'<rect x="-40" y="-40" width="{W + 80}" height="640" fill="url(#skyg)" opacity="0.85" filter="url(#sky)" style="mix-blend-mode:multiply"/>')
for cx, cy, s in [(360, 150, 62), (1080, 90, 40), (1720, 130, 70), (2240, 215, 44)]:
    cloud(cx, cy, s)

for bx, by, bs in [(760, 250, 12), (800, 236, 9), (842, 262, 10)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)
# --- Far ridges, cool and hazy.
INKSCALE = 0.6
far1 = [(0, 420), (200, 392), (420, 408), (640, 366), (860, 392), (1080, 356), (1300, 380), (1520, 348), (1760, 372), (1980, 342), (2200, 366), (2400, 350)]
wash(ridge_d(far1), "#B9B4D0", 0.75, "wc3")
far2 = [(0, 468), (240, 444), (520, 466), (760, 430), (1000, 452), (1240, 424), (1480, 448), (1720, 420), (1960, 444), (2200, 416), (2400, 436)]
wash(ridge_d(far2), "#A5ABBE", 0.75, "wc3")
ink(open_path(far2[2:9]), 1.2, 0.35)

# --- Left: the hogback with its flat red cap.
mesa = [(0, 452), (110, 412), (220, 374), (300, 354), (580, 352), (660, 374), (780, 452), (900, 540), (1000, 612), (1060, 700)]
wash(ridge_d(mesa), "#E3B36B", 0.92, "wc1")
wash(f"M580,352 C640,370 700,410 780,452 C850,500 930,560 1000,612 L1060,700 L1060,{H} L760,{H} C720,640 660,470 580,352 Z", "#8C7B9E", 0.42, "wc3", g=True)
capb = [(x, 392 + jit(7) + (8 if 400 < x < 470 else 0)) for x in range(300, 581, 18)]
wash(poly([(232, 374), (300, 352), (580, 350), (624, 368)] + list(reversed(capb)) + [(250, 390)]), "#C9603F", 0.92, "wc2")
wash(poly([(x, y - 14) for x, y in capb] + [(x, y + 16 + jit(4)) for x, y in reversed(capb)]), "#8A4434", 0.55, "wc2", g=True)
ink(line([(232, 374), (300, 352), (580, 350), (624, 368)]), 2.4)
ink(line([(250, 390)] + capb + [(624, 368)]), 1.8, 0.75)
for x in range(318, 570, 38):
    ink(line([(x + jit(4), 356), (x + jit(5), 386 + jit(4))]), 1.3, 0.6)
ink(open_path([(0, 452), (110, 412), (220, 374), (232, 374)]), 2.2)
for i in range(26):   # slope strokes following the fall line, light from the left
    x = random.uniform(80, 560); y0 = interp(mesa, x) + random.uniform(40, 200)
    if y0 < 620: ink(line([(x, y0), (x - 10, y0 + 22)]), 0.9, 0.22)
ink(open_path([(624, 368), (660, 376), (780, 452), (900, 540), (1000, 612)]), 2.0, 0.7)
for i in range(46):   # dry-grass hatching on the shadow flank
    x = random.uniform(620, 1000); y0 = interp(mesa, x) + random.uniform(20, 160)
    ink(line([(x, y0), (x - 12, y0 + 14)]), 1.1, 0.35)

# --- The hill behind Main Street.
hill = [(760, 720), (880, 620), (1000, 520), (1130, 420), (1260, 358), (1420, 326), (1600, 316), (1760, 328), (1900, 366), (2040, 424), (2180, 466), (2300, 488), (2400, 494)]
hill_d = ridge_d(hill)
wash(hill_d, "#E8BF70", 0.92, "wc1")
wash(f"M1760,328 C1840,340 1900,366 2040,424 C2120,450 2240,480 2400,494 L2400,{H} L1960,{H} C1940,640 1880,420 1760,328 Z", "#8E7E9F", 0.4, "wc3", g=True)
wash(f"M1000,520 C1100,440 1200,380 1300,350 C1260,420 1180,520 1120,640 L900,700 Z", "#E9C27E", 0.35, "wc3", g=True)  # morning light on the near flank
ink(open_path(hill[:-1]), 2.4, 0.85)

for i in range(90):
    x = random.uniform(1800, 2380); y0 = interp(hill, x) + random.uniform(30, 220)
    if y0 < 620: ink(line([(x, y0), (x - 14, y0 + 16)]), 1.0, 0.32)
for i in range(40):
    x = random.uniform(900, 1700); y0 = interp(hill, x) + random.uniform(150, 300)
    if y0 < 630: ink(f"M{x:.0f},{y0:.0f} q22,-4 44,2", 1.0, 0.25)
wash("M1500,470 C1620,500 1700,560 1760,640 L1600,640 C1560,580 1520,530 1500,470 Z", "#8C7A9C", 0.18, "wc3", g=True)
wash("M1180,500 C1240,540 1280,590 1300,640 L1180,640 C1180,600 1170,540 1180,500 Z", "#8C7A9C", 0.15, "wc3", g=True)
# Cliff band: level beds, cut off by the hill's own edge.
add(f'<clipPath id="hc"><path d="{hill_d}"/></clipPath>')
add('<g clip-path="url(#hc)">')
def btop(x): return 362 + (x - 1200) * 0.03 + 3 * math.sin(x / 41)
for x0, x1 in [(1150, 1500), (1528, 1820), (1846, 2010)]:
    top = [(x, btop(x)) for x in range(x0, x1 + 1, 10)]
    bot, depth, x = [], 72, x0
    while x <= x1:   # the foot steps in blocks, as jointed sandstone breaks
        if random.random() < 0.3: depth = 64 + random.uniform(0, 22)
        bot.append((x, btop(x) + depth)); bot.append((x + 9.9, btop(x) + depth)); x += 10
    bot[0] = (bot[0][0], top[0][1] + 26); bot[-1] = (bot[-1][0], top[-1][1] + 26)
    wash(poly([(x, y) for x, y in bot] + [(x, y + 14 + jit(3)) for x, y in reversed(bot)]), "#7D6070", 0.38, "wcs", g=True)
    wash(poly(top + list(reversed(bot))), "#D2623A", 0.94, "wc2")
    wash(poly([(x, y + 4) for x, y in top] + [(x, y + 16) for x, y in reversed(top)]), "#8F3F2D", 0.35, "wcs", g=True)   # overhang under the lip
    x = x0 + random.uniform(10, 30)
    while x < x1 - 20:
        sx = x
        if random.random() < 0.55:
            wash(poly([(sx, interp(top, sx) + 14), (sx + random.uniform(8, 16), interp(top, sx) + 16), (sx + 10, interp(bot, sx) - 4), (sx - 2, interp(bot, sx) - 2)]), "#8F3F2D", 0.32, "wcs", g=True)
        if random.random() < 0.6:
            ink(line([(sx, interp(top, sx) + random.uniform(4, 20)), (sx + jit(4), interp(bot, sx) - random.uniform(2, 20))]), 1.2, 0.5)
        x += random.uniform(22, 70)
    ink(line(top), 2.2, 0.85)
    ink(line(bot), 1.6, 0.6)
    a, b = x0 + random.uniform(10, 60), x1 - random.uniform(10, 60)
    ink(line([(x, interp(top, x) + 34 + jit(1.5)) for x in range(int(a), int(b), 18)]), 1.0, 0.4)
    for i in range(int((x1 - x0) / 30)):   # rubble below
        rx = random.uniform(x0, x1); ry = interp(bot, rx) + random.uniform(18, 50)
        wash(f"M{rx - 5:.0f},{ry:.0f} a5,3 0 1,0 10,0 a5,3 0 1,0 -10,0 Z", "#B4664A", 0.7, "wcs", g=True)
add('</g>')

# Pines on the crest, junipers down the slope.
x = 1180
while x < 2060:
    if random.random() < 0.16: x += random.uniform(40, 80); continue
    ponderosa(x, interp(hill, x) + 8, random.uniform(26, 54))
    x += random.uniform(10, 30)
for i in range(30):
    x = random.uniform(980, 2360); y = interp(hill, x) + random.uniform(150, 300)
    if y < 640: wash(f"M{x - 9},{y} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", "#61784F", 0.8, "wcs")
for i in range(12):
    x = random.uniform(60, 780); y = interp(mesa, x) + random.uniform(70, 220)
    if y < 640: wash(f"M{x - 8},{y} a8,5 0 1,0 16,0 a8,5 0 1,0 -16,0 Z", "#61784F", 0.8, "wcs")

INKSCALE = 0.85
# --- Valley floor.
floor = [(0, 650), (500, 640), (1000, 652), (1500, 640), (2000, 650), (2400, 642)]
wash(ridge_d(floor), "#CDBB72", 0.85, "wc3")

for x0, y0, w, h, col in [(40, 700, 360, 40, "#B8A85E"), (520, 712, 300, 34, "#D8C27A"), (240, 760, 420, 46, "#BFA866"), (700, 770, 300, 30, "#C9B26C")]:
    wash(f"M{x0},{y0} C{x0 + w * 0.3},{y0 - h * 0.5} {x0 + w * 0.7},{y0 - h * 0.4} {x0 + w},{y0} C{x0 + w * 0.7},{y0 + h * 0.6} {x0 + w * 0.3},{y0 + h * 0.5} {x0},{y0} Z", col, 0.45, "wc3", g=True)
fence = [(0, 742), (300, 732), (620, 744), (900, 730), (1060, 736)]
ink(open_path(fence), 1.3, 0.55); ink(open_path([(x, y + 12) for x, y in fence]), 1.1, 0.45)
for x in range(20, 1060, 46):
    y = interp(fence, x); ink(line([(x, y - 8), (x + 1, y + 24)]), 1.6, 0.6)
for i in range(70):
    x = random.uniform(0, 1050); y = random.uniform(690, 820)
    if y > interp([(0, 884), (300, 866), (600, 846), (900, 820), (1200, 798)], x) - 10: continue
    col = random.choice(["#9DA58A", "#9DA58A", "#D6B23E"])
    wash(f"M{x - 10:.0f},{y:.0f} a10,6 0 1,0 20,0 a10,6 0 1,0 -20,0 Z", col, 0.7, "wcs", g=True)
    ink(line([(x - 6, y + 4), (x - 2, y - 6)]), 0.8, 0.35)
for i in range(120):
    x = random.uniform(0, 1100); y = random.uniform(690, 830)
    if y > interp([(0, 884), (300, 866), (600, 846), (900, 820), (1200, 798)], x) - 8: continue
    ink(line([(x, y), (x + jit(4), y - random.uniform(6, 14))]), 0.9, 0.35)
# --- Cottonwoods, autumn gold, light from the left.
for x in range(-30, 900, 70):
    cottonwood(x + jit(14), 668 + jit(8), random.uniform(44, 60), back=True)
for x in range(2080, 2460, 74):
    cottonwood(x + jit(12), 664 + jit(8), random.uniform(44, 58), back=True)
for x in range(1150, 2100, 120):
    cottonwood(x + jit(20), 618 + jit(6), random.uniform(32, 42), back=True)

# --- Town along Main Street, base at y 702.
B = 702
STONE, STONE_D, SLATE, TRIM, WIN = "#C0694B", "#8E4632", "#6E788A", "#F4E9D3", "#4A4752"
def church(x):
    w, h = 120, 92
    wash(poly([(x, B), (x, B - h), (x + w / 2, B - h - 58), (x + w, B - h), (x + w, B)]), "#C97E5E", 0.92, "wcs")
    wash(poly([(x + w / 2, B - h - 58), (x + w, B - h), (x + w, B), (x + w * 0.75, B)]), STONE_D, 0.35, "wcs", g=True)
    wash(poly([(x - 8, B - h + 4), (x + w / 2, B - h - 64), (x + w + 8, B - h + 4), (x + w, B - h + 6), (x + w / 2, B - h - 52), (x, B - h + 6)]), SLATE, 0.85, "wcs")
    tx, tw, th = x + w, 58, 168
    wash(poly([(tx, B), (tx, B - th), (tx + tw, B - th), (tx + tw, B)]), "#C97E5E", 0.92, "wcs")
    wash(poly([(tx + tw * 0.6, B - th), (tx + tw, B - th), (tx + tw, B), (tx + tw * 0.6, B)]), STONE_D, 0.35, "wcs", g=True)
    wash(poly([(tx - 8, B - th), (tx + tw / 2, B - th - 46), (tx + tw + 8, B - th)]), SLATE, 0.9, "wcs")
    ink(line([(tx + tw / 2, B - th - 46), (tx + tw / 2, B - th - 70)]), 1.6); ink(line([(tx + tw / 2 - 6, B - th - 62), (tx + tw / 2 + 6, B - th - 62)]), 1.4)
    ink(poly([(x, B), (x, B - h), (x + w / 2, B - h - 58), (x + w, B - h), (x + w, B)]), 2.0)
    ink(poly([(tx, B), (tx, B - th), (tx + tw, B - th), (tx + tw, B)]), 2.0)
    ink(line([(tx - 8, B - th), (tx + tw / 2, B - th - 46), (tx + tw + 8, B - th)]), 1.8)
    ink(f"M{x + w / 2 - 12},{B - h - 10} a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0", 1.4, 0.7)
    coursing(x, B - h, x + w, B); coursing(tx, B - th, tx + tw, B)
    for wx in (x + 22, x + 74):
        trimmed(wx, B - 70, 22, 50, "#5B6E80")
    eave_hatch(tx, tx + tw, B - th)
    wash(f"M{tx + 16},{B} L{tx + 16},{B - 40} a13,13 0 0,1 26,0 L{tx + 42},{B} Z", "#D9A63E", 0.9, "wcs", g=True); ink(f"M{tx + 16},{B} L{tx + 16},{B - 40} a13,13 0 0,1 26,0 L{tx + 42},{B}", 1.4)
    wash(poly([(tx + 18, B - th + 24), (tx + 40, B - th + 24), (tx + 40, B - th + 58), (tx + 18, B - th + 58)]), "#6B5A4E", 0.8, "wcs", g=True)
    return tx + tw

def depot(x):
    w, h = 230, 86
    wash(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), STONE, 0.92, "wcs")
    wash(poly([(x + w * 0.55, B - h), (x + w, B - h), (x + w, B), (x + w * 0.55, B)]), STONE_D, 0.25, "wcs", g=True)
    wash(poly([(x - 14, B - h + 2), (x + 38, B - h - 48), (x + w - 38, B - h - 48), (x + w + 14, B - h + 2)]), SLATE, 0.9, "wcs")
    gx, gw = x + w - 92, 104
    wash(poly([(gx - 10, B - h), (gx + gw / 2, B - h - 70), (gx + gw + 10, B - h)]), SLATE, 0.9, "wcs")
    wash(poly([(gx, B), (gx, B - h), (gx + gw / 2, B - h - 56), (gx + gw, B - h), (gx + gw, B)]), STONE, 0.92, "wcs")
    wash(poly([(gx + gw / 2, B - h - 56), (gx + gw, B - h), (gx + gw, B), (gx + gw * 0.7, B)]), STONE_D, 0.3, "wcs", g=True)
    wash(poly([(x + 56, B - h - 30), (x + 56, B - h - 72), (x + 76, B - h - 72), (x + 76, B - h - 30)]), STONE_D, 0.9, "wcs")
    ink(poly([(x, B), (x, B - h), (gx, B - h), (gx, B)]), 2.0)
    ink(line([(x - 14, B - h + 2), (x + 38, B - h - 48), (gx + 4, B - h - 48)]), 1.8)
    ink(poly([(gx, B), (gx, B - h), (gx + gw / 2, B - h - 56), (gx + gw, B - h), (gx + gw, B)]), 2.0)
    ink(line([(gx - 10, B - h), (gx + gw / 2, B - h - 70), (gx + gw + 10, B - h)]), 1.8)
    ink(poly([(x + 56, B - h - 30), (x + 56, B - h - 72), (x + 76, B - h - 72), (x + 76, B - h - 30)]), 1.4)
    coursing(x, B - h, gx, B); coursing(gx, B - h, gx + gw, B)
    for wx in (x + 20, x + 62, x + 104, gx + 16, gx + 62):
        trimmed(wx, B - 64, 22, 46)
    eave_hatch(x, gx, B - h)
    return x + w

# Main Street itself.
wash(poly([(1110, B - 4), (2170, B - 4), (2190, B + 26), (1090, B + 26)]), "#C9BCA6", 0.8, "wcs")
ink(line([(1090, B + 26), (2190, B + 26)]), 1.4, 0.55)
xx = church(1150)
xx = depot(xx + 30)
xx += 26
for w, h, col, aw, st in [(118, 126, "#C46A48", "#7A2E26", True), (92, 104, "#E2B49A", "#3F5E4A", False), (146, 140, "#B65A3C", "#2F4A66", True), (108, 112, "#DDBA8E", "#7A2E26", False), (126, 124, "#C77250", "#3F5E4A", True)]:
    xx = storefront(xx, w, h, col, aw, st) + 6
wash(poly([(1110, B + 2), (2170, B + 2), (2178, B + 14), (1104, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1600, 1790, 1990, 2140):   # street lamps
    ink(line([(lx, B + 20), (lx, B - 52)]), 1.8, 0.8); ink(f"M{lx - 6},{B - 52} l6,-10 l6,10 Z", 1.4, 0.8)
for x in (1125, 1590, 2155):
    cottonwood(x, B + 10, 36)
sl = [(2120, B + 20), (2126, B - 34), (2142, B - 46), (2166, B - 40), (2170, B + 20)]
wash(poly(sl), "#C8705A", 0.95, "wcs"); wash(poly([(2150, B - 44), (2166, B - 40), (2170, B + 20), (2152, B + 20)]), "#8E4632", 0.4, "wcs", g=True); ink(poly(sl), 1.6, 0.8)

INKSCALE = 1.15
# --- The St. Vrain, coming toward us from the right and widening.
rt = [(2400, 748), (2000, 758), (1600, 776), (1200, 798), (900, 820), (600, 846), (300, 866), (0, 884)]
rb = [(2400, 784), (2000, 798), (1600, 826), (1300, 858), (1000, 896), (760, 940), (560, 1000), (0, 1000)]
river = open_path(rt) + f" L0,1000 L560,1000 " + smooth(list(reversed(rb[:-1])))[0:0]
river_d = "M" + f"{rt[0][0]},{rt[0][1]} " + smooth(rt) + f" L0,1000 L560,1000 " + smooth([(560, 1000), (760, 940), (1000, 896), (1300, 858), (1600, 826), (2000, 798), (2400, 784)]).replace("C", "C", 1) + " Z"
wash(river_d, "#86B2CC", 0.92, "wc3")
wash("M" + " ".join(f"{x},{y}" for x, y in [(2400, 760), (1800, 780), (1300, 812), (900, 850), (600, 890), (420, 950), (360, 1000), (220, 1000), (300, 930), (560, 880), (900, 836), (1400, 800), (2000, 776), (2400, 768)]) + " Z", "#5E8AA8", 0.35, "wc3", g=True)
wash(open_path(rt) + " L0,900 " + smooth([(0, 900), (300, 884), (600, 864), (900, 838), (1200, 816), (1600, 794), (2000, 776), (2400, 766)]) + " Z", "#E2B55A", 0.3, "wc2", g=True)   # gold of the cottonwoods in the water
ink(open_path(rt), 1.8, 0.65)
ink(open_path([(560, 1000), (760, 940), (1000, 896), (1300, 858), (1600, 826), (2000, 798), (2400, 784)]), 1.8, 0.6)
for i in range(70):   # riffles left as paper, with a touch of ink
    t = random.random(); x = 120 + t * 2200
    y = interp(rt[::-1], x) + (interp([(0, 1000), (560, 1000), (760, 940), (1000, 896), (1300, 858), (1600, 826), (2000, 798), (2400, 784)], x) - interp(rt[::-1], x)) * random.uniform(0.15, 0.85)
    L = random.uniform(30, 90) * (1.2 - t * 0.7)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-5 - t * 2:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{4 - t * 2:.1f}" fill="none" stroke-linecap="round" opacity="0.9"/>')
    if random.random() < 0.35: ink(f"M{x + 6:.0f},{y + 6:.0f} q{L / 3:.0f},-3 {L * 0.6:.0f},0", 1.0, 0.4)

# Red sandstone slabs and boulders in the river and on the near bank.
def slab(cx, cy, w, h):
    pts = [(cx - w / 2, cy), (cx - w / 2 + w * 0.12, cy - h), (cx + w / 2 - w * 0.08, cy - h - jit(4)), (cx + w / 2, cy + jit(3))]
    wash(poly(pts), "#C97A5A", 0.92, "wcs")
    wash(poly([(cx - w / 2, cy), (cx + w / 2, cy), (cx + w / 2 - 4, cy + h * 0.5), (cx - w / 2 + 6, cy + h * 0.5)]), "#8E4B3A", 0.7, "wcs", g=True)
    ink(poly(pts), 1.6, 0.8)
    add(f'<path d="M{cx - w / 2 - 14:.0f},{cy + h * 0.6:.0f} q{w * 0.6:.0f},8 {w + 28:.0f},0" stroke="#FBF7EE" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>')
for cx, cy, w, h in [(1500, 812, 96, 10), (1590, 808, 54, 8), (1660, 802, 40, 7), (940, 866, 130, 14), (1060, 858, 60, 10), (600, 908, 170, 20), (790, 896, 70, 12), (380, 944, 120, 18)]:
    slab(cx, cy, w, h)
for cx, cy, r, gr in [(1230, 838, 16, False), (1262, 842, 10, True), (700, 930, 30, False), (742, 936, 18, True), (250, 966, 46, True), (310, 978, 26, False), (500, 978, 36, False), (1120, 872, 22, True), (1146, 878, 12, False), (2050, 790, 12, False), (880, 900, 14, True)]:
    boulder(cx, cy, r, gr)

# Near bank, bottom right: dry grass, willows, a few big rocks.
bank = [(560, 1000), (760, 940), (1000, 896), (1300, 858), (1600, 826), (2000, 798), (2400, 784)]
wash("M560,1000 " + smooth(bank) + f" L2400,{H} Z", "#D2B66B", 0.9, "wc1")
wash("M900,1000 C1300,930 1800,880 2400,860 L2400,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for cx, cy, r, gr in [(1380, 900, 34, False), (1640, 872, 26, True), (2160, 852, 40, False), (1900, 900, 30, True)]:
    boulder(cx, cy, r, gr)
for i in range(220):
    x = random.uniform(700, 2400); top = interp(bank, x) + random.uniform(8, 140)
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
for x, w in [(1170, 80), (1760, 110), (2270, 100)]:
    willows(x, interp(bank, x) + 38, w)
for x in (2250, 2360, 1500):
    cottonwood(x, interp(bank, x) + 70, 54)
for i in range(60):   # rabbitbrush along the near bank
    x = random.uniform(900, 2400); y = interp(bank, x) + random.uniform(30, 160)
    if y < 990: wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", "#E2B92E", 0.75, "wcs", g=True)

# Paper grain and uneven paper tone over everything.
finish(sys.argv[1])
