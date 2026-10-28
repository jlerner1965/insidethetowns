"""Erie hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Old Town Erie on an autumn morning. Behind it the Front Range as the guide's
Baseline Road photo shows it from the plains (hero.jpg): the dark foothills
on the left and the high peaks to the right with the first snow. On the
right, the town: Town Hall, the 1906 Lincoln School, with its grey cupola,
red sandstone base and flagpole, and the coal miners' memorial in front
(town-hall.jpg, town-hall-lincoln-school.jpg, miner-memorial.jpg); the 1930
City Hall with its stepped parapet, buff brick bands and bell cupola, and
the siren tower behind it (old-city-hall.jpg); and on Briggs Street the 1889
Davis Building with its pale cornice and arched windows, and the one-storey
brick block beside it with its striped awning (old-mine-1889.jpg). On the
left, Anderson Farms' red barn, windmill and pumpkin patch
(anderson-farms.jpg). In front, Coal Creek with its weathering-steel
footbridge and red willows (coal-creek-trail.jpg). Fields, hills and
cottonwoods are generic filler.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

# --- Sky.
sky()
for cx, cy, s in [(270, 130, 60), (930, 96, 44), (1590, 140, 68), (2190, 108, 50), (610, 292, 28), (1990, 286, 30)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1180, 236, 11), (1218, 222, 8), (1250, 248, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The Front Range, traced from the Baseline Road photo (photo x * 1.2,
# its height stretched 1.5 times).
def P(pts): return [(x * 1.2, 335 + (y - 470) * 1.5) for x, y in pts]
INKSCALE = 0.55
far = P([(-20, 546), (0, 545), (90, 548), (150, 543), (200, 548), (270, 556), (330, 548), (420, 546), (520, 540), (600, 535), (640, 545),
         (690, 548), (730, 552), (760, 552), (790, 540), (830, 529), (880, 534), (940, 527), (970, 519), (1000, 530), (1060, 520),
         (1150, 507), (1200, 500), (1240, 492), (1270, 497), (1300, 492), (1330, 489), (1360, 505), (1400, 520), (1440, 515),
         (1490, 504), (1530, 510), (1580, 492), (1620, 497), (1650, 495), (1690, 492), (1730, 510), (1790, 504), (1830, 512),
         (1880, 507), (1920, 520), (1970, 501), (2010, 510)])
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
# The first snow on the high peaks: above an autumn snow line, following
# the ridge, with tongues down the gullies; left as paper, cool on the shade side.
SNOW = 335 + (530 - 470) * 1.5
def snow_run(top, bot):
    if len(top) > 2:
        add(f'<path d="{poly(top + list(reversed(bot)))}" fill="#FBF8F2" opacity="0.93" filter="url(#wcs)"/>')
for a0, a1 in [(930, 1290), (1370, 2410)]:
    top, bot = [], []
    for x in range(a0, a1 + 1, 8):
        ry = interp(far, x)
        if ry > SNOW - 4:
            snow_run(top, bot); top, bot = [], []
            continue
        top.append((x, ry + 1))
        tongue = random.uniform(8, 18) if random.random() < 0.22 else 0
        bot.append((x, ry + 3 + (SNOW - ry) * 0.62 + jit(3) + tongue))
    snow_run(top, bot)
for i in range(len(far) - 1):   # shade on the side of each summit away from the light
    (x1, y1), (x2, y2) = far[i], far[i + 1]
    if y2 > y1 + 6 and y1 < SNOW - 8 and x1 > 900:
        wash(poly([(x1, y1 + 2), (x2, min(y2, SNOW)), (x2 - (x2 - x1) * 0.6, min(y2, SNOW) + 4)]), "#8E98BE", 0.45, "wcs", g=True)
ink(open_path(far), 1.4, 0.55)
# The blue ranges under the peaks.
mid = P([(640, 566), (800, 566), (900, 571), (1000, 568), (1100, 566), (1200, 562), (1300, 566), (1400, 561), (1500, 558), (1600, 562),
         (1700, 566), (1800, 560), (1900, 566), (2010, 568)])
wash(ridge_d(mid), "#8E9BB6", 0.8, "wc3")
ink(open_path(mid), 1.2, 0.45)
# The brown foothills, with the one peak that stands out on the right.
brown = P([(900, 592), (1050, 588), (1200, 584), (1330, 578), (1420, 570), (1470, 556), (1500, 551), (1540, 560), (1600, 574),
           (1700, 580), (1800, 576), (1900, 582), (2010, 586)])
wash(ridge_d(brown), "#A49680", 0.85, "wc2")
wash(poly([(x, interp(brown, x)) for x in range(1800, 1930, 10)] + [(1930, 520), (1800, 520)]), "#6E6788", 0.25, "wcs", g=True)
ink(open_path(brown), 1.2, 0.5)
# The big dark foothills on the left, rocky on their sunny face.
massif = P([(-20, 528), (0, 525), (50, 542), (100, 550), (180, 555), (240, 545), (290, 525), (330, 515), (360, 517), (400, 525),
            (440, 522), (470, 517), (520, 511), (550, 515), (580, 530), (620, 540), (680, 555), (740, 567), (800, 572), (900, 580),
            (1000, 588), (1100, 594), (1200, 600)])
wash(ridge_d(massif), "#7A8AA6", 0.88, "wc3")
wash(poly([(x, interp(massif, x)) for x in range(624, 1000, 12)] + [(1000, 520), (760, 520)]), "#665F84", 0.3, "wc3", g=True)
for i in range(22):   # rock ribs on the sunny face, falling away to the left
    rx = random.uniform(280, 700); ry = interp(massif, rx) + random.uniform(10, 40)
    if ry < 492:
        L = random.uniform(18, 40)
        ink(line([(rx, ry), (rx - L * 0.3, ry + L)]), 0.9, 0.2)
wash(poly([(x, interp(massif, x) + 6) for x in range(300, 640, 12)] + [(620, 500), (300, 500)]), "#9C93AE", 0.22, "wc3", g=True)
ink(open_path(massif[:-3]), 1.6, 0.6)

# --- The plains: a far tree line along the ditches, then fields and hills.
INKSCALE = 0.85
plains = [(0, 505), (600, 508), (1200, 502), (1800, 506), (2400, 502)]
wash(ridge_d(plains), "#CDB86C", 0.88, "wc3")
for x in range(-20, 2440, 26):
    y = interp(plains, x) + 6 + jit(3); r = random.uniform(9, 16)
    col = random.choice(["#7E8F4E", "#A39A45", "#D6A63C", "#7E8F4E"])
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", col, 0.85, "wcs")
# Erie's rolling open-space hills on the left, in dry autumn grass.
hill = [(-40, 566), (100, 540), (280, 526), (460, 532), (660, 556), (880, 588), (1100, 610), (1320, 624)]
wash(ridge_d(hill), "#C4A65E", 0.9, "wc1")
wash(f"M460,532 C560,540 700,566 880,588 C1000,600 1160,616 1320,624 L1320,700 L700,700 C640,640 560,580 460,532 Z", "#8C7B9E", 0.3, "wc3", g=True)
ink(open_path(hill[:-1]), 1.8, 0.7)
for i in range(60):
    x = random.uniform(0, 1100); y0 = interp(hill, x) + random.uniform(10, 120)
    if y0 < 640: ink(line([(x, y0), (x - 10, y0 + 12)]), 0.9, 0.28)
for y0, col in [(632, "#9FA35C"), (690, "#B9A85C")]:   # a late green field, then stubble
    wash(f"M0,{y0} C400,{y0 - 8} 900,{y0 + 6} 1300,{y0 - 4} L1300,{y0 + 40} C900,{y0 + 50} 400,{y0 + 36} 0,{y0 + 46} Z", col, 0.42, "wc3", g=True)
for i in range(30):
    x = random.uniform(0, 1100); y = random.uniform(640, 730)
    ink(line([(x, y), (x + random.uniform(60, 140), y + jit(2))]), 0.8, 0.25)
for x, y, r in [(90, 600, 30), (130, 604, 24), (330, 590, 28), (1060, 640, 34), (1110, 646, 28)]:
    cottonwood(x, y, r, back=True)

# --- Anderson Farms: the red barn, its windmill and the pumpkin patch.
def windmill(wx, base, h):
    for s in (-1, 1):
        ink(line([(wx + s * 14, base), (wx + s * 3, base - h)]), 2.0, 0.9, color="#5A4A3A")
    for k in range(4):   # cross bracing
        y1 = base - h * k / 4; y2 = base - h * (k + 1) / 4
        w1 = 13 - 10 * k / 4; w2 = 13 - 10 * (k + 1) / 4
        ink(line([(wx - w1, y1), (wx + w2, y2)]), 1.0, 0.7, color="#5A4A3A")
        ink(line([(wx + w1, y1), (wx - w2, y2)]), 1.0, 0.7, color="#5A4A3A")
    hx, hy, R = wx, base - h - 8, 27
    wash(f"M{hx - R},{hy} a{R},{R} 0 1,0 {2 * R},0 a{R},{R} 0 1,0 {-2 * R},0 Z", "#8E9298", 0.6, "wcs", g=True)
    for k in range(18):   # the vanes
        a = k * math.pi / 9
        ink(line([(hx + 6 * math.cos(a), hy + 6 * math.sin(a)), (hx + R * math.cos(a + 0.1), hy + R * math.sin(a + 0.1))]), 1.0, 0.75)
    ink(f"M{hx - R},{hy} a{R},{R} 0 1,0 {2 * R},0 a{R},{R} 0 1,0 {-2 * R},0", 1.2, 0.7)
    ink(line([(hx, hy), (hx + 40, hy + 1)]), 1.4, 0.85)
    tail = poly([(hx + 34, hy - 2), (hx + 72, hy - 12), (hx + 74, hy + 9), (hx + 34, hy + 4)])
    wash(tail, "#C9C4BA", 0.9, "wcs"); ink(tail, 1.1, 0.75)

def barn(x, base):
    """The tall red barn, gable end on, with white-framed X doors."""
    w, h = 120, 54
    annex = poly([(x + 90, base), (x + 90, base - 40), (x + 130, base - 70), (x + 170, base - 40), (x + 170, base)])
    wash(annex, "#A8322A", 0.95, "wcs"); ink(annex, 1.4, 0.75)
    front = poly([(x, base), (x, base - h), (x + w / 2 - 8, base - h - 54), (x + w / 2, base - h - 66), (x + w / 2 + 8, base - h - 54), (x + w, base - h), (x + w, base)])
    wash(front, "#B8372B", 0.95, "wcs")
    wash(poly([(x + w * 0.62, base - h - 30), (x + w, base - h), (x + w, base), (x + w * 0.62, base)]), "#6B1F18", 0.28, "wcs", g=True)
    for k in range(int(w / 6)):   # board siding
        bx = x + 3 + k * 6
        top = base - h - min(54, (w / 2 - abs(bx - x - w / 2)) * 1.04)
        ink(line([(bx, top + 3), (bx, base - 2)]), 0.6, 0.3)
    ink(line([(x - 6, base - h + 4), (x + w / 2 - 8, base - h - 54), (x + w / 2, base - h - 70), (x + w / 2 + 8, base - h - 54), (x + w + 6, base - h + 4)]), 2.4, 0.85, color="#4A2E24")
    ink(front, 1.6)
    # Loft window, hay door, the farm's sign, the X doors.
    add(f'<rect x="{x + w / 2 - 7}" y="{base - h - 40}" width="14" height="14" fill="{PAPER}"/>')
    wash(poly([(x + w / 2 - 5, base - h - 28), (x + w / 2 - 5, base - h - 38), (x + w / 2 + 5, base - h - 38), (x + w / 2 + 5, base - h - 28)]), "#3E3B46", 0.85, "wcs", g=True)
    ink(poly([(x + w / 2 - 7, base - h - 26), (x + w / 2 - 7, base - h - 40), (x + w / 2 + 7, base - h - 40), (x + w / 2 + 7, base - h - 26)]), 1.0, 0.7)
    hd = poly([(x + 64, base - 52), (x + 64, base - 80), (x + 92, base - 80), (x + 92, base - 52)])
    wash(hd, "#7A231C", 0.4, "wcs", g=True); ink(hd, 1.2, 0.7)
    sg = poly([(x + 10, base - 56), (x + 10, base - 74), (x + 52, base - 74), (x + 52, base - 56)])
    add(f'<path d="{sg}" fill="{PAPER}"/>'); wash(sg, "#EFE6CC", 0.9, "wcs", g=True)
    ink(line([(x + 15, base - 68), (x + 46, base - 68)]), 2.2, 0.8, color="#3F7A4A"); ink(line([(x + 15, base - 62), (x + 40, base - 62)]), 1.6, 0.7, color="#3F7A4A")
    ink(sg, 1.0, 0.7)
    wash(poly([(x + 40, base), (x + 40, base - 42), (x + 80, base - 42), (x + 80, base)]), "#3A2A26", 0.85, "wcs", g=True)
    for dx in (x + 6, x + 82):
        dw = 32
        for a, b in [((dx, base), (dx, base - 42)), ((dx, base - 42), (dx + dw, base - 42)), ((dx + dw, base - 42), (dx + dw, base)), ((dx, base - 42), (dx + dw, base)), ((dx + dw, base - 42), (dx, base))]:
            ink(line([a, b]), 1.6, 0.95, color="#F4EFE6")

FB = 664
windmill(612, FB - 2, 118)
barn(660, FB)
cottonwood(870, FB + 6, 44, back=True); cottonwood(925, FB + 10, 34, back=True)
cottonwood(560, FB + 4, 36, back=True)
for i in range(70):   # the pumpkin patch
    x = random.uniform(500, 1000); y = random.uniform(FB + 14, FB + 62)
    r = random.uniform(4.5, 7.5) * (0.8 + (y - FB) / 160)
    wash(f"M{x - r:.1f},{y:.1f} a{r:.1f},{r * 0.75:.1f} 0 1,0 {2 * r:.1f},0 a{r:.1f},{r * 0.75:.1f} 0 1,0 {-2 * r:.1f},0 Z", random.choice(["#E8812A", "#E28A2E", "#D9722A"]), 0.92, "wcs")
    ink(line([(x, y - r * 0.7), (x + 1, y - r * 0.7 - 3)]), 0.9, 0.6, color="#4E5A2E")
for i in range(40):   # vines
    x = random.uniform(500, 1000); y = random.uniform(FB + 14, FB + 62)
    ink(f"M{x:.0f},{y:.0f} q12,-5 24,0", 0.8, 0.35, color="#556A35")
def shock(x, base, h):   # a corn shock
    s = poly([(x - h * 0.4, base), (x - 2, base - h), (x + 2, base - h), (x + h * 0.4, base)])
    wash(s, "#D8B75E", 0.92, "wcs")
    wash(poly([(x, base - h), (x + h * 0.4, base), (x + 2, base)]), "#8E7A3E", 0.3, "wcs", g=True)
    for k in range(5):
        ink(line([(x + jit(2), base - h + 2), (x - h * 0.35 + k * h * 0.18, base)]), 0.7, 0.45)
    ink(line([(x - 6, base - h * 0.55), (x + 6, base - h * 0.55)]), 1.0, 0.6)
for x, b, h in [(470, 690, 34), (505, 696, 30), (1020, 694, 32), (1052, 700, 28)]:
    shock(x, b, h)
fence = [(0, 724), (360, 718), (760, 726), (1160, 720)]
ink(open_path(fence), 1.3, 0.55); ink(open_path([(x, y + 12) for x, y in fence]), 1.1, 0.45)
for x in range(16, 1160, 46):
    y = interp(fence, x); ink(line([(x, y - 8), (x + 1, y + 24)]), 1.6, 0.6)

# --- Old Town, base at y 702, right of the type on a desktop.
B = 702
# Big cottonwoods of the old streets behind the buildings.
for x in range(1180, 2400, 118):
    cottonwood(x + jit(26), 640 + jit(10), random.uniform(58, 76), back=True, shadow=False)

def siren_tower(sx):
    """The steel siren tower behind the 1930 City Hall."""
    top = B - 200
    for s in (-1, 1):
        ink(line([(sx + s * 20, B - 40), (sx + s * 6, top)]), 1.8, 0.85, color="#5E5A58")
    for k in range(5):
        y1 = B - 40 - (B - 40 - top) * k / 5; y2 = B - 40 - (B - 40 - top) * (k + 1) / 5
        w1 = 20 - 14 * k / 5; w2 = 20 - 14 * (k + 1) / 5
        ink(line([(sx - w1, y1), (sx + w2, y2)]), 0.9, 0.55, color="#5E5A58")
        ink(line([(sx + w1, y1), (sx - w2, y2)]), 0.9, 0.55, color="#5E5A58")
        ink(line([(sx - w2, y2), (sx + w2, y2)]), 0.9, 0.55, color="#5E5A58")
    ink(line([(sx - 12, top), (sx + 12, top)]), 1.6, 0.85)
    cyl = poly([(sx - 7, top), (sx - 7, top - 16), (sx + 7, top - 16), (sx + 7, top)])
    wash(cyl, "#CFC6B6", 0.92, "wcs"); ink(cyl, 1.2, 0.8)
    cap = poly([(sx - 11, top - 16), (sx, top - 28), (sx + 11, top - 16)])
    wash(cap, "#B8AE9C", 0.92, "wcs"); ink(cap, 1.2, 0.8)
    ink(line([(sx, top - 28), (sx, top - 34)]), 1.2, 0.8)

def dark_window(wx, wy, ww, wh, frame=INK, mull=True):
    wash(poly([(wx, wy + wh), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh)]), "#56637A", 0.88, "wcs")
    wash(poly([(wx, wy + wh * 0.45), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh * 0.2)]), "#9DB3C8", 0.35, "wcs", g=True)
    ink(poly([(wx, wy + wh), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh)]), 1.1, 0.75, color=frame)
    if mull:
        ink(line([(wx + ww / 2, wy), (wx + ww / 2, wy + wh)]), 0.7, 0.55)
        ink(line([(wx, wy + wh * 0.5), (wx + ww, wy + wh * 0.5)]), 0.7, 0.55)

def town_hall(x):
    """Town Hall, the 1906 Lincoln School: two brick wings under hipped roofs,
    a red sandstone base, and the centre bay with its grey cupola."""
    lw, bw, rw, wh, bh = 152, 84, 152, 136, 156
    bx = x + lw; rx = bx + bw; xe = rx + rw
    ROOF = "#6F6660"
    for x0, x1 in [(x, bx), (rx, xe)]:
        wall = poly([(x0, B), (x0, B - wh), (x1, B - wh), (x1, B)])
        wash(wall, "#C2603F", 0.93, "wcs")
        wash(poly([(x0 + (x1 - x0) * 0.7, B - wh), (x1, B - wh), (x1, B), (x0 + (x1 - x0) * 0.7, B)]), STONE_D, 0.22, "wcs", g=True)
        wash(poly([(x0, B - wh), (x1, B - wh), (x1, B - wh + 10), (x0, B - wh + 10)]), "#5C3A36", 0.4, "wcs", g=True)   # shade under the eaves
        coursing(x0, B - wh + 10, x1, B - 18, step=10)
        for k in range(4):
            wx = x0 + 16 + k * 35
            dark_window(wx, B - wh + 20, 16, 40)
            dark_window(wx, B - 66, 16, 36)
            ink(line([(wx - 3, B - wh + 63), (wx + 19, B - wh + 63)]), 1.2, 0.55); ink(line([(wx - 3, B - 28), (wx + 19, B - 28)]), 1.2, 0.55)
        roof = poly([(x0 - 12, B - wh), (x0 + 24, B - wh - 30), (x1 - 24, B - wh - 30), (x1 + 12, B - wh)])
        wash(roof, ROOF, 0.92, "wcs")
        wash(poly([(x1 - 24, B - wh - 30), (x1 + 12, B - wh), (x1 - 30, B - wh)]), "#3E3840", 0.3, "wcs", g=True)
        ink(roof, 1.6, 0.8)
        ink(wall, 2.0)
    # The red sandstone base all along.
    base = poly([(x, B), (x, B - 16), (xe, B - 16), (xe, B)])
    wash(base, "#B8664E", 0.92, "wcs")
    for bxx in range(int(x) + 8, int(xe), 26):
        ink(line([(bxx, B - 15), (bxx, B - 8)]), 0.8, 0.4); ink(line([(bxx + 13, B - 8), (bxx + 13, B - 1)]), 0.8, 0.4)
    ink(line([(x, B - 8), (xe, B - 8)]), 0.8, 0.4); ink(line([(x, B - 16), (xe, B - 16)]), 1.2, 0.6)
    # The centre bay, a little taller and standing forward.
    bay = poly([(bx, B), (bx, B - bh), (rx, B - bh), (rx, B)])
    wash(bay, "#C9673F", 0.94, "wcs")
    wash(poly([(bx + bw * 0.62, B - bh), (rx, B - bh), (rx, B), (bx + bw * 0.62, B)]), STONE_D, 0.25, "wcs", g=True)
    wash(poly([(bx, B - bh), (rx, B - bh), (rx, B - bh + 10), (bx, B - bh + 10)]), "#5C3A36", 0.4, "wcs", g=True)
    coursing(bx, B - bh + 10, rx, B - 16, step=10)
    dark_window(bx + 22, B - bh + 26, 18, 38); dark_window(bx + 44, B - bh + 26, 18, 38)
    wash(poly([(bx, B), (bx, B - 16), (rx, B - 16), (rx, B)]), "#B8664E", 0.92, "wcs")
    # The black Lincoln School sign over the door, and the door.
    wash(poly([(bx + 18, B - 70), (bx + 18, B - 58), (rx - 18, B - 58), (rx - 18, B - 70)]), "#2F2C2E", 0.92, "wcs")
    ink(line([(bx + 24, B - 66), (rx - 24, B - 66)]), 1.0, 0.8, color="#F4F1EA"); ink(line([(bx + 28, B - 62), (rx - 28, B - 62)]), 1.0, 0.8, color="#F4F1EA")
    door = poly([(bx + 26, B - 14), (bx + 26, B - 50), (rx - 26, B - 50), (rx - 26, B - 14)])
    wash(door, "#4A4752", 0.9, "wcs"); ink(door, 1.3, 0.8)
    ink(line([(bx + bw / 2, B - 50), (bx + bw / 2, B - 14)]), 0.9, 0.6)
    steps = poly([(bx - 22, B + 10), (bx + 6, B - 14), (rx - 6, B - 14), (rx + 22, B + 10)])
    wash(steps, "#D7D2C8", 0.9, "wcs")
    for k in range(1, 4):
        ink(line([(bx + 6 - 7 * k, B - 14 + 6 * k), (rx - 6 + 7 * k, B - 14 + 6 * k)]), 0.8, 0.5)
    ink(steps, 1.2, 0.7)
    ink(bay, 2.0)
    broof = poly([(bx - 10, B - bh), (bx + 14, B - bh - 18), (rx - 14, B - bh - 18), (rx + 10, B - bh)])
    wash(broof, ROOF, 0.92, "wcs"); ink(broof, 1.5, 0.8)
    # The cupola: grey shingles, arched louvres, a flared pyramid roof.
    cx = bx + bw / 2; ct = B - bh - 18
    box = poly([(cx - 24, ct), (cx - 24, ct - 42), (cx + 24, ct - 42), (cx + 24, ct)])
    wash(box, "#6E788A", 0.92, "wcs")
    wash(poly([(cx + 6, ct), (cx + 6, ct - 42), (cx + 24, ct - 42), (cx + 24, ct)]), "#3E4656", 0.3, "wcs", g=True)
    for k in range(4):
        ink(line([(cx - 22, ct - 8 - k * 9), (cx + 22, ct - 8 - k * 9)]), 0.6, 0.35)
    for vx in (cx - 17, cx + 4):
        v = f"M{vx},{ct - 6} L{vx},{ct - 26} a6.5,6.5 0 0,1 13,0 L{vx + 13},{ct - 6} Z"
        add(f'<path d="{v}" fill="{PAPER}"/>'); wash(v, "#D9D6CF", 0.8, "wcs", g=True); ink(v, 1.0, 0.75)
        for k in range(4):
            ink(line([(vx + 1, ct - 10 - k * 5), (vx + 12, ct - 10 - k * 5)]), 0.6, 0.5)
    ink(box, 1.5)
    proof = f"M{cx - 34},{ct - 40} C{cx - 24},{ct - 46} {cx - 10},{ct - 62} {cx},{ct - 80} C{cx + 10},{ct - 62} {cx + 24},{ct - 46} {cx + 34},{ct - 40} Z"
    wash(proof, "#7C766D", 0.94, "wcs")
    wash(f"M{cx},{ct - 80} C{cx + 10},{ct - 62} {cx + 24},{ct - 46} {cx + 34},{ct - 40} L{cx + 4},{ct - 40} Z", "#3E3840", 0.3, "wcs", g=True)
    ink(proof, 1.5, 0.85)
    ink(line([(cx, ct - 80), (cx, ct - 90)]), 1.2, 0.8)
    return xe

def flag(fx, base, h):
    ink(line([(fx, base), (fx, base - h)]), 2.0, 0.85, color="#8C8E94")
    add(f'<circle cx="{fx}" cy="{base - h - 3}" r="3" fill="#C9A44A"/>')
    gx, gy = fx + 1, base - h + 4
    fl = poly([(gx, gy), (gx + 46, gy + 4), (gx + 50, gy + 34), (gx + 2, gy + 30)])
    add(f'<path d="{fl}" fill="{PAPER}"/>')
    for k in range(4):
        wash(poly([(gx, gy + 3 + k * 8), (gx + 47, gy + 7 + k * 8), (gx + 47.5, gy + 11 + k * 8), (gx + 0.5, gy + 7 + k * 8)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(gx, gy), (gx + 20, gy + 2), (gx + 21, gy + 17), (gx + 1, gy + 15)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(fl, 1.1, 0.7)

def miner_memorial(mx):
    """The memorial to the coal miners: a bronze miner with his pick beside the black granite wall of names."""
    y = B + 18
    plinth = poly([(mx, y), (mx, y - 7), (mx + 66, y - 7), (mx + 66, y)])
    wash(plinth, "#2F2D33", 0.92, "wcs"); ink(plinth, 1.0, 0.8)
    slab = poly([(mx + 26, y - 7), (mx + 26, y - 40), (mx + 62, y - 40), (mx + 62, y - 7)])
    wash(slab, "#34323A", 0.94, "wcs")
    for k in range(6):   # the names
        ink(line([(mx + 30, y - 34 + k * 4.5), (mx + 42, y - 34 + k * 4.5)]), 0.7, 0.7, color="#D8D4CC")
        ink(line([(mx + 46, y - 34 + k * 4.5), (mx + 58, y - 34 + k * 4.5)]), 0.7, 0.7, color="#D8D4CC")
    ink(slab, 1.1, 0.85)
    m = mx + 12   # the miner
    fig = poly([(m - 6, y - 7), (m - 5, y - 20), (m - 6, y - 32), (m - 4, y - 36), (m + 4, y - 36), (m + 6, y - 32), (m + 5, y - 20), (m + 6, y - 7), (m + 1, y - 7), (m, y - 19), (m - 1, y - 7)])
    wash(fig, "#5B4630", 0.95, "wcs")
    add(f'<circle cx="{m}" cy="{y - 40}" r="4" fill="#5B4630"/>')
    ink(line([(m - 6, y - 43), (m + 6, y - 43)]), 1.2, 0.85)   # the helmet's brim
    ink(line([(m - 9, y - 22), (m + 10, y - 27)]), 1.2, 0.85)   # the pick's handle
    ink(f"M{m - 12},{y - 16} q2,-8 5,-8", 1.2, 0.85)
    ink(fig, 0.9, 0.8)

def city_hall(x):
    """The 1930 City Hall: red brick with buff bands and diamonds, a stepped parapet, a white bell cupola, a stucco wing behind."""
    w = 150
    BUFF = "#E3CB98"
    wing = poly([(x + w, B), (x + w, B - 72), (x + w + 72, B - 66), (x + w + 72, B)])
    wash(wing, "#E6C3A0", 0.92, "wcs")
    wash(poly([(x + w + 40, B - 69), (x + w + 72, B - 66), (x + w + 72, B), (x + w + 40, B)]), "#8E6A58", 0.2, "wcs", g=True)
    ink(line([(x + w, B - 74), (x + w + 76, B - 67)]), 2.2, 0.8, color="#F4F1EA")
    for wx in (x + w + 18, x + w + 46):
        wash(poly([(wx, B - 30), (wx, B - 54), (wx + 12, B - 54), (wx + 12, B - 30)]), "#8E9488", 0.7, "wcs", g=True)
        ink(poly([(wx, B - 30), (wx, B - 54), (wx + 12, B - 54), (wx + 12, B - 30)]), 1.0, 0.65)
        ink(line([(wx - 2, B - 29), (wx + 14, B - 29)]), 1.6, 0.7, color="#9C4A34")
    ink(wing, 1.5, 0.8)
    prof = [(x, B), (x, B - 86), (x + 26, B - 86), (x + 26, B - 98), (x + 50, B - 98), (x + 50, B - 112), (x + 100, B - 112), (x + 100, B - 98), (x + 124, B - 98), (x + 124, B - 86), (x + w, B - 86), (x + w, B)]
    front = poly(prof)
    wash(front, "#B5543A", 0.94, "wcs")
    wash(poly([(x + w * 0.72, B - 98), (x + w, B - 86), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - 84, x + w, B - 6, step=10)
    for (a, b) in [((x, B - 86), (x + 26, B - 86)), ((x + 26, B - 98), (x + 50, B - 98)), ((x + 50, B - 112), (x + 100, B - 112)), ((x + 100, B - 98), (x + 124, B - 98)), ((x + 124, B - 86), (x + w, B - 86))]:
        ink(line([(a[0], a[1] + 2), (b[0], b[1] + 2)]), 3.2, 0.9, color=BUFF)   # the buff coping
    wash(poly([(x + 26, B - 80), (x + 124, B - 80), (x + 124, B - 72), (x + 26, B - 72)]), BUFF, 0.85, "wcs", g=True)
    pl = poly([(x + 61, B - 104), (x + 89, B - 104), (x + 89, B - 90), (x + 61, B - 90)])
    add(f'<path d="{pl}" fill="{PAPER}"/>'); wash(pl, "#EFE3C4", 0.9, "wcs", g=True); ink(pl, 0.9, 0.7)
    ink(line([(x + 65, B - 99), (x + 85, B - 99)]), 0.7, 0.6); ink(line([(x + 68, B - 94), (x + 82, B - 94)]), 0.7, 0.6)
    zz = [(x + 6 + k * 7, B - 64 + (4 if k % 2 else -4)) for k in range(20)]
    ink(line(zz), 2.0, 0.9, color=BUFF)   # the band of buff diamonds
    for k in range(0, 20, 2):
        add(f'<circle cx="{x + 6 + k * 7}" cy="{B - 64}" r="1.8" fill="{BUFF}" opacity="0.9"/>')
    ink(line([(x + 4, B - 50), (x + w - 4, B - 50)]), 3.0, 0.85, color=BUFF)
    # Window, door, the big double doors.
    add(f'<rect x="{x + 9}" y="{B - 47}" width="44" height="34" fill="{PAPER}"/>')
    wash(poly([(x + 12, B - 16), (x + 12, B - 44), (x + 50, B - 44), (x + 50, B - 16)]), "#56637A", 0.85, "wcs", g=True)
    ink(poly([(x + 9, B - 13), (x + 9, B - 47), (x + 53, B - 47), (x + 53, B - 13)]), 1.1, 0.7)
    ink(line([(x + 31, B - 44), (x + 31, B - 16)]), 1.0, 0.6, color="#F4F1EA")
    ink(line([(x + 7, B - 11), (x + 55, B - 11)]), 2.4, 0.85, color=BUFF)
    dr = poly([(x + 60, B), (x + 60, B - 46), (x + 78, B - 46), (x + 78, B)])
    wash(dr, "#D6CBB6", 0.92, "wcs"); ink(dr, 1.2, 0.75)
    wash(poly([(x + 64, B - 24), (x + 64, B - 40), (x + 74, B - 40), (x + 74, B - 24)]), "#3E3B46", 0.8, "wcs", g=True)
    dd = poly([(x + 86, B), (x + 86, B - 58), (x + 140, B - 58), (x + 140, B)])
    wash(dd, "#D2C7B0", 0.92, "wcs")
    for gx in (x + 90, x + 115):
        for gy in (B - 54, B - 36, B - 18):
            ink(poly([(gx, gy + 14), (gx, gy), (gx + 21, gy), (gx + 21, gy + 14)]), 0.7, 0.5)
    ink(line([(x + 113, B - 58), (x + 113, B)]), 1.0, 0.7); ink(dd, 1.3, 0.8)
    add(f'<circle cx="{x + 82}" cy="{B - 60}" r="4.5" fill="#F3E3A6" opacity="0.95"/>'); ink(f"M{x + 82},{B - 64} a4.5,4.5 0 1,0 0.1,0", 0.8, 0.6)
    ink(front, 2.0)
    # The bell cupola.
    cx = x + w / 2; ct = B - 112
    wash(poly([(cx - 22, ct), (cx - 22, ct - 8), (cx + 22, ct - 8), (cx + 22, ct)]), "#4E4A50", 0.85, "wcs")
    wash(poly([(cx - 6, ct - 10), (cx - 6, ct - 24), (cx + 6, ct - 24), (cx + 6, ct - 10)]), "#3A3634", 0.9, "wcs")
    for px in (cx - 20, cx - 8, cx + 6, cx + 18):
        ink(line([(px, ct - 8), (px, ct - 32)]), 2.2, 0.95, color="#F4F1EA")
        ink(line([(px - 1.5, ct - 8), (px - 1.5, ct - 32)]), 0.6, 0.5)
    croof = poly([(cx - 34, ct - 32), (cx - 18, ct - 46), (cx + 18, ct - 46), (cx + 34, ct - 32)])
    wash(croof, "#DCD8D0", 0.92, "wcs"); ink(croof, 1.4, 0.85)
    ink(line([(cx - 34, ct - 31), (cx + 34, ct - 31)]), 1.0, 0.7)
    return x + w + 72

def davis(x):
    """The 1889 Davis Building on Briggs Street: red-brown brick, a pale pressed-metal cornice, six arched bays upstairs, a painted wood storefront."""
    w, h = 192, 168
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, "#B6623E", 0.94, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - h + 22, x + w, B - 64, step=10)
    for k in range(6):
        cx = x + w / 6 * (k + 0.5); ax = cx - 9; a0 = B - h + 44; a1 = B - 96
        d = f"M{ax},{a1} L{ax},{a0 + 9} a9,9 0 0,1 18,0 L{ax + 18},{a1} Z"
        if k in (2, 3):   # the two blind arches
            wash(d, "#7E3A28", 0.35, "wcs", g=True)
            ink(d, 0.9, 0.5)
        else:
            wash(d, "#5E7690", 0.9, "wcs")
            wash(f"M{ax},{a0 + 22} L{ax},{a0 + 9} a9,9 0 0,1 18,0 L{ax + 18},{a0 + 14} Z", "#B9CCDC", 0.5, "wcs", g=True)
            ink(d, 1.2, 0.8)
            ink(line([(ax, a0 + 30), (ax + 18, a0 + 30)]), 0.7, 0.5)
        ink(f"M{ax - 5},{a0 + 9} a14,14 0 0,1 28,0", 1.6, 0.6)
        wash(poly([(cx - 3, a0 - 6), (cx + 3, a0 - 6), (cx + 2, a0 + 1), (cx - 2, a0 + 1)]), "#E3CB98", 0.9, "wcs", g=True)
        ink(line([(ax - 3, a1 + 3), (ax + 21, a1 + 3)]), 2.0, 0.75, color="#D9C48E")
    cor = poly([(x - 7, B - h - 18), (x + w + 7, B - h - 18), (x + w + 7, B - h + 6), (x - 7, B - h + 6)])
    wash(cor, "#C8CCAE", 0.95, "wcs")
    wash(poly([(x - 7, B - h - 2), (x + w + 7, B - h - 2), (x + w + 7, B - h + 6), (x - 7, B - h + 6)]), "#7E8466", 0.35, "wcs", g=True)
    for k in range(int((w + 6) / 7)):
        ink(line([(x - 3 + k * 7, B - h - 1), (x - 3 + k * 7, B - h + 4)]), 0.8, 0.5)   # dentils
    ink(cor, 1.5, 0.85)
    ink(line([(x - 7, B - h - 10), (x + w + 7, B - h - 10)]), 0.8, 0.5)
    for bx in (x - 7, x + w - 5):   # end brackets
        br = poly([(bx, B - h - 18), (bx + 12, B - h - 18), (bx + 12, B - h + 18), (bx, B - h + 18)])
        wash(br, "#BCC19E", 0.95, "wcs"); ink(br, 1.2, 0.8)
    pq = poly([(x + w / 2 - 17, B - h + 12), (x + w / 2 + 17, B - h + 12), (x + w / 2 + 17, B - h + 28), (x + w / 2 - 17, B - h + 28)])
    wash(pq, "#C9B37A", 0.92, "wcs"); ink(pq, 1.0, 0.75)
    ink(line([(x + w / 2 - 11, B - h + 18), (x + w / 2 + 11, B - h + 18)]), 0.8, 0.7); ink(line([(x + w / 2 - 11, B - h + 23), (x + w / 2 + 11, B - h + 23)]), 0.8, 0.7)
    # The storefront: grey-painted wood, white trim, a red door.
    sf = poly([(x, B), (x, B - 64), (x + w, B - 64), (x + w, B)])
    wash(sf, "#7E8896", 0.92, "wcs")
    ink(line([(x + 2, B - 64), (x + w - 2, B - 64)]), 3.0, 0.9, color="#F4F1EA")
    for px in (x + 4, x + 64, x + 128, x + w - 4):
        ink(line([(px, B - 62), (px, B)]), 2.4, 0.9, color="#F4F1EA")
    for wx, ww in [(x + 12, 46), (x + 136, 48)]:
        add(f'<rect x="{wx - 3}" y="{B - 57}" width="{ww + 6}" height="44" fill="{PAPER}"/>')
        dark_window(wx, B - 54, ww, 36, mull=False)
        ink(line([(wx, B - 42), (wx + ww, B - 42)]), 0.8, 0.6)
    dr = poly([(x + 86, B), (x + 86, B - 50), (x + 106, B - 50), (x + 106, B)])
    add(f'<path d="{poly([(x + 82, B), (x + 82, B - 54), (x + 110, B - 54), (x + 110, B)])}" fill="{PAPER}"/>')
    wash(dr, "#A23C30", 0.94, "wcs")
    wash(poly([(x + 90, B - 22), (x + 90, B - 44), (x + 102, B - 44), (x + 102, B - 22)]), "#3E3B46", 0.8, "wcs", g=True)
    ink(dr, 1.3, 0.8)
    ink(body, 2.0)
    return x + w

def neighbour(x):
    """The one-storey brick block beside it: a corbelled cornice, a pale storefront with an arched transom, a striped awning."""
    w, h = 168, 116
    body = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(body, "#BC5A3C", 0.94, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - h + 16, x + w, B - 72, step=10)
    for k in range(int((w - 8) / 8)):   # the corbel table
        ink(poly([(x + 5 + k * 8, B - h + 10), (x + 5 + k * 8, B - h + 4), (x + 10 + k * 8, B - h + 4), (x + 10 + k * 8, B - h + 10)]), 0.7, 0.5)
    ink(line([(x, B - h + 4), (x + w, B - h + 4)]), 1.0, 0.6)
    for px0 in (x + 12, x + w / 2 + 6):
        wash(poly([(px0, B - h + 18), (px0 + w / 2 - 18, B - h + 18), (px0 + w / 2 - 18, B - h + 34), (px0, B - h + 34)]), "#7E3A28", 0.32, "wcs", g=True)
    sf = poly([(x + 4, B), (x + 4, B - 72), (x + w - 4, B - 72), (x + w - 4, B)])
    add(f'<path d="{sf}" fill="{PAPER}"/>'); wash(sf, "#DAD6CE", 0.85, "wcs", g=True)
    t = f"M{x + 14},{B - 12} L{x + 14},{B - 46} a22,14 0 0,1 44,0 L{x + 58},{B - 12} Z"
    dark_window(x + 14, B - 46, 44, 34, mull=False); wash(f"M{x + 14},{B - 46} a22,14 0 0,1 44,0 Z", "#56637A", 0.85, "wcs"); ink(t, 1.2, 0.75)
    dark_window(x + 100, B - 44, 54, 32, mull=False)
    dr = poly([(x + 70, B), (x + 70, B - 48), (x + 88, B - 48), (x + 88, B)])
    wash(dr, "#C77F9A", 0.85, "wcs"); ink(dr, 1.2, 0.75)
    ink(sf, 1.4, 0.8)
    # The pink-and-white striped awning.
    a0, a1, ay = x + 92, x + w - 6, B - 70
    aw = poly([(a0 + 4, ay), (a1 - 4, ay), (a1 + 4, ay + 22), (a0 - 4, ay + 22)])
    add(f'<path d="{aw}" fill="{PAPER}"/>')
    n = 9
    for k in range(0, n, 2):
        t0 = k / n; t1 = (k + 1) / n
        xt0 = a0 + 4 + (a1 - a0 - 8) * t0; xt1 = a0 + 4 + (a1 - a0 - 8) * t1
        xb0 = a0 - 4 + (a1 - a0 + 8) * t0; xb1 = a0 - 4 + (a1 - a0 + 8) * t1
        wash(poly([(xt0, ay), (xt1, ay), (xb1, ay + 22), (xb0, ay + 22)]), "#D65C84", 0.9, "wcs", g=True)
    sc = f"M{a0 - 4},{ay + 22} " + " ".join(f"q{(a1 - a0 + 8) / n / 2:.1f},7 {(a1 - a0 + 8) / n:.1f},0" for _ in range(n))
    ink(sc, 1.1, 0.75); ink(aw, 1.3, 0.8)
    ink(body, 2.0)
    return x + w

def lamp2(lx):
    """Old Town's black lamp posts, two lanterns and a banner."""
    ink(line([(lx, B + 24), (lx, B - 98)]), 2.8, 0.92, color="#2B2B30")
    ink(f"M{lx - 16},{B - 92} q16,-10 32,0", 1.8, 0.9, color="#2B2B30")
    for sx in (lx - 16, lx + 16):
        lt = poly([(sx - 5, B - 92), (sx - 6, B - 106), (sx, B - 113), (sx + 6, B - 106), (sx + 5, B - 92)])
        add(f'<path d="{lt}" fill="{PAPER}"/>'); wash(lt, "#F1E2B4", 0.9, "wcs", g=True); ink(lt, 1.3, 0.9, color="#2B2B30")
    bn = poly([(lx + 2, B - 82), (lx + 13, B - 80), (lx + 13, B - 50), (lx + 2, B - 52)])
    wash(bn, "#2F6E6B", 0.9, "wcs"); ink(bn, 1.0, 0.75)

wash(poly([(1180, B - 4), (2400, B - 4), (2420, B + 30), (1160, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1160, B + 30), (2420, B + 30)]), 1.4, 0.55)
siren_tower(1850)
xx = town_hall(1206)
flag(xx + 18, B + 4, 236)
miner_memorial(1214)
xx = city_hall(xx + 52)
lamp2(xx + 22)
xx = davis(xx + 44)
xx = neighbour(xx + 4)
lamp2(xx + 16)
wash(poly([(1180, B + 2), (2400, B + 2), (2406, B + 14), (1174, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
cottonwood(xx + 64, B + 12, 42)

# --- Coal Creek in front, under its footbridge.
INKSCALE = 1.1
meadow = [(0, 738), (800, 734), (1600, 740), (2400, 736)]
wash(ridge_d(meadow), "#D2B66B", 0.9, "wc1")
wash("M0,790 C500,780 900,800 1300,812 L1400,950 L0,950 Z", "#8F7F5C", 0.4, "wc3", g=True)
wash("M1700,900 C1900,880 2200,890 2400,872 L2400,1000 L1700,1000 Z", "#8F7F5C", 0.3, "wc3", g=True)
tb = [(2440, 770), (2100, 776), (1820, 784), (1620, 798), (1500, 822), (1440, 858), (1404, 906), (1366, 940), (1270, 954), (1000, 944), (600, 934), (220, 940), (-40, 944)]
fb = [(1530, 1012), (1574, 978), (1590, 930), (1604, 896), (1636, 862), (1710, 834), (1860, 818), (2100, 810), (2440, 804)]
creek = f"M{tb[0][0]},{tb[0][1]} " + smooth(tb) + " L-40,1012 " + f"L{fb[0][0]},{fb[0][1]} " + smooth(fb) + " Z"
wash(creek, "#7FA9C2", 0.92, "wc3")
wash("M2440,782 C2000,792 1700,802 1570,836 C1510,868 1494,920 1440,962 C1300,986 800,976 -40,986 L-40,1012 L1500,1012 C1540,960 1556,900 1610,852 C1760,814 2100,800 2440,796 Z", "#5E7F95", 0.33, "wc3", g=True)
wash(f"M{tb[0][0]},{tb[0][1]} " + smooth(tb) + " L-40,964 " + smooth([(-40, 964), (400, 958), (1000, 966), (1300, 974), (1440, 940), (1480, 880), (1540, 840), (1820, 800), (2100, 790), (2440, 784)]) + " Z", "#E2B55A", 0.3, "wc2", g=True)   # cottonwood gold in the water
ink(open_path(tb), 1.6, 0.65); ink(open_path(fb), 1.6, 0.6)
for i in range(56):   # slow ripples left as paper
    t = random.random()
    if t < 0.4:
        x = 1660 + t / 0.4 * 760; y = interp(tb[3::-1], x) + random.uniform(6, 24)
    elif t < 0.6:
        y = 870 + (t - 0.4) / 0.2 * 90; x = random.uniform(interp([(p[1], p[0]) for p in tb[4:7]], y) + 10, interp([(p[1], p[0]) for p in reversed(fb[1:5])], y) - 30)
    else:
        x = random.uniform(-20, 1380); y = interp(tb[::-1][:7], x) + random.uniform(8, 54)
    L = random.uniform(20, 56)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-4 {L:.0f},0" stroke="#FBF7EE" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.85"/>')

def path_band(left, right, col="#D8D2C4"):
    d = f"M{left[0][0]},{left[0][1]} " + smooth(left) + f" L{right[-1][0]},{right[-1][1]} " + smooth(right[::-1]) + " Z"
    wash(d, col, 0.9, "wcs")
    wash(d, "#8E8676", 0.15, "wc2", g=True)
    ink(open_path(left), 1.2, 0.5); ink(open_path(right), 1.2, 0.5)
path_band([(-40, 838), (300, 838), (700, 846), (1060, 866), (1340, 900)], [(-40, 856), (300, 856), (700, 864), (1080, 884), (1352, 912)])
path_band([(1636, 902), (1780, 868), (1960, 842), (2120, 826)], [(1640, 916), (1800, 884), (1980, 856), (2124, 836)])

def footbridge(x0, x1, yd):
    """The weathering-steel footbridge on the Coal Creek Trail."""
    RUST = "#8E4A2E"
    L = x1 - x0
    def dy(x): return yd - 8 * math.sin(math.pi * (x - x0) / L)
    wash(poly([(x0 + 40, yd + 6), (x1 - 40, yd + 6), (x1 - 50, yd + 26), (x0 + 50, yd + 26)]), "#3F4E5C", 0.35, "wcs", g=True)   # shade on the water
    for ax in (x0 - 8, x1 - 38):
        ab = poly([(ax, yd + 20), (ax, yd - 2), (ax + 46, yd - 2), (ax + 46, yd + 20)])
        wash(ab, "#CFCAC0", 0.92, "wcs"); ink(ab, 1.3, 0.7)
    ox, oy = 16, -14   # the far railing, seen over the deck
    xs = [x0 + L * k / 40 for k in range(41)]
    ink(line([(x + ox, dy(x) - 44 + oy) for x in xs]), 2.2, 0.5, color=RUST)
    for k in range(11):
        px = x0 + L * k / 10
        ink(line([(px + ox, dy(px) + oy), (px + ox, dy(px) - 44 + oy)]), 1.4, 0.45, color=RUST)
    deck = poly([(x, dy(x)) for x in xs] + [(x + ox, dy(x) + oy) for x in reversed(xs)])
    wash(deck, "#A5A29A", 0.92, "wcs")
    for k in range(1, 4):
        ink(line([(x + ox * k / 4, dy(x) + oy * k / 4) for x in xs[::4]]), 0.6, 0.35)
    for r in range(1, 6):   # the near railing: bars, posts, braces
        f = r / 6
        ink(line([(x, dy(x) - 44 * f) for x in xs]), 1.3, 0.85, color=RUST)
    for k in range(11):
        px = x0 + L * k / 10
        ink(line([(px, dy(px) + 2), (px, dy(px) - 46)]), 2.4, 0.9, color=RUST)
        if k in (1, 3, 6, 8):
            nx = x0 + L * (k + 1) / 10
            ink(line([(px, dy(px)), (nx, dy(nx) - 44)]), 1.4, 0.8, color=RUST)
    ink(line([(x, dy(x) - 45) for x in xs]), 3.6, 0.95, color=RUST)
    ink(line([(x, dy(x) + 1) for x in xs]), 3.2, 0.95, color=RUST)
    ink(line([(x, dy(x) - 46) for x in xs]), 1.2, 0.6)
footbridge(1350, 1646, 906)

def willows(x, base, w):
    wands = []
    for k in range(int(w / 7)):
        sx = x + k * 7 + jit(3); hgt = random.uniform(34, 70); lean = jit(8)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.1, 0.75, color="#6E2418")
        wands.append(f"M{sx + lean * 0.6 - 5:.0f},{base - hgt * 0.62:.0f} a5,{hgt * 0.38:.0f} 0 1,0 10,0 a5,{hgt * 0.38:.0f} 0 1,0 -10,0 Z")
    d = " ".join(wands)
    wash(d, "#C24A2C", 0.8, "wcs")
    wash(d, "#E8A23E", 0.3, "wcs", g=True)
for x, b, w in [(1250, 950, 90), (1680, 846, 70), (2010, 800, 100), (2290, 798, 80), (860, 942, 100), (300, 946, 120), (40, 1006, 70), (620, 1008, 60), (1100, 1010, 50)]:
    willows(x, b, w)
for x, b, r in [(1180, 852, 48), (460, 832, 44), (1790, 840, 46), (2200, 846, 52), (2370, 958, 62)]:
    cottonwood(x, b, r)
for i in range(240):   # dry grass
    x = random.uniform(0, 2400); top = random.uniform(746, 990)
    if (1380 < x < 1610 and top > 830) or (x < 1400 and top > interp(tb[::-1][:7], x) - 24): continue
    L = random.uniform(10, 28)
    ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.42)
for i in range(50):   # rabbitbrush and the last asters
    x = random.uniform(0, 2400); y = random.uniform(750, 990)
    if (1340 < x < 1620 and y > 820) or (x < 1400 and y > interp(tb[::-1][:7], x) - 10): continue
    col = random.choice(["#E2B92E", "#E2B92E", "#9A7BC0"])
    wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", col, 0.75, "wcs", g=True)

finish(sys.argv[1])
