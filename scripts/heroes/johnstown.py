"""Johnstown hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Johnstown on an autumn morning, a composition from the guide's own photos.
The Front Range runs along the horizon with Longs Peak at its north end,
traced from the guide's old hero photo of a county road through the fields
(hero.jpg), which also gives the white post-and-rail fence in front. Out in
the fields stand a pumpjack (oil-well.jpg) and the 1865 Jared L. Brush Barn
with its steep gable, round and arched vents, shed wings and corral fence
(brush-barn.jpg). Along the street, under gold and red autumn trees
(old-town-walk-charlotte-street.jpg): the 1928 Masonic Temple with its great
arch and twin doors (masonic-temple.jpg); the corner of Charlotte Street and
Fremont Avenue with its green street sign and black lamp post
(old-town-walk-charlotte-street.jpg); Harvey Parish's 1914 bungalow, now the
Historic Parish House and Museum, behind its iron fence with its sign and
blue spruce (parish-house.jpg); and Town Hall on Parish Avenue with its
rotunda, portico, flags and the Town's red stone sign (town-hall.jpg).
Each building is traced from its photo through its own scale and offset.
The fields, the ploughed ground, the windbreaks and the trees are generic.
The sugar factory and the milk plant, long gone, and Parish Avenue's
storefronts have no photo in the guide and are not drawn.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(19)

def tracer(x0, base, s, px0, py0):
    """Map a reference photo's pixels (px, py) into the painting: px0 lands
    on x0 and the photo's ground line py0 on base, at s painting pixels to
    one photo pixel."""
    def m(pts): return [(x0 + (px - px0) * s, base - (py0 - py) * s) for px, py in pts]
    def p(px, py): return m([(px, py)])[0]
    return m, p

def blob(x, y, rx, ry):
    return f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z"

def red_tree(x, base, r):
    """The red-leaved trees among the gold ones on Charlotte Street."""
    blobs = [(-0.5, -0.9, 0.58), (0.45, -0.95, 0.56), (0, -1.3, 0.66), (-0.2, -0.68, 0.5), (0.3, -0.62, 0.48), (0.75, -1.18, 0.4), (-0.8, -1.2, 0.38)]
    d = " ".join(blob(x + dx * r, base + dy * r, rr * r, rr * r) for dx, dy, rr in blobs)
    wash(d, "#B8402E", 0.9, "wc2")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.85:.0f} C{x + r * 1.3:.0f},{base - r * 1.5:.0f} {x + r * 1.2:.0f},{base - r * 0.3:.0f} {x + r * 0.2:.0f},{base - r * 0.25:.0f} C{x + r * 0.6:.0f},{base - r * 0.9:.0f} {x + r * 0.5:.0f},{base - r * 1.4:.0f} {x + r * 0.1:.0f},{base - r * 1.85:.0f} Z", "#7A2420", 0.45, "wcs", g=True)
    ink(line([(x - 2, base + 2), (x, base - r * 0.45), (x - r * 0.3, base - r * 0.8)]), 1.8, 0.7)
    ink(line([(x, base - r * 0.45), (x + r * 0.35, base - r * 0.85)]), 1.4, 0.6)

def spruce(x, base, h, col="#3F6664"):
    """A blue spruce in tiers, as beside the Parish House and in front of Town Hall."""
    tiers = 7
    for k in range(tiers):
        t0 = k / tiers; w = h * 0.36 * (1 - t0 * 0.85)
        y = base - h * t0 * 0.92
        wash(poly([(x - w, y), (x + jit(2), y - h * 0.26), (x + w, y)]), col, 0.92, "wcs")
    wash(poly([(x, base - h), (x + h * 0.36, base), (x + h * 0.08, base)]), "#2C3E48", 0.35, "wcs", g=True)
    wash(poly([(x - h * 0.3, base - h * 0.12), (x - h * 0.06, base - h * 0.62), (x - h * 0.02, base - h * 0.15)]), "#8FA6A0", 0.35, "wcs", g=True)
    ink(line([(x, base + 2), (x, base - 8)]), 1.4, 0.7)

sky()
for cx, cy, s in [(330, 140, 60), (1000, 100, 46), (1620, 170, 70), (2230, 104, 50), (690, 300, 32), (1240, 300, 28)]:
    cloud(cx, cy, s)

# --- The Front Range, traced from hero.jpg (x * 1.25): the foothills at 0.75
# of their height above the plains, the snowy crest and Longs Peak, rising at
# the north end, at 1.6 times theirs above the foothills.
def R(pts): return [(x * 1.25, 462 - (805 - y) * 1.6) for x, y in pts]
def F(pts): return [(x * 1.25, 500 - (855 - y) * 0.75) for x, y in pts]
INKSCALE = 0.55
far = R([(0, 800), (60, 796), (120, 798), (200, 792), (260, 796), (330, 789), (400, 794), (440, 787), (500, 792), (560, 785), (620, 783),
         (660, 788), (720, 781), (780, 790), (840, 785), (900, 790), (960, 794), (1000, 789), (1040, 794), (1100, 783), (1150, 788),
         (1210, 779), (1260, 790), (1300, 783), (1340, 788), (1380, 777), (1440, 790), (1480, 794), (1530, 788), (1580, 785), (1620, 780),
         (1660, 767), (1690, 755), (1712, 746), (1730, 745), (1748, 752), (1765, 764), (1790, 759), (1810, 766), (1840, 776), (1880, 782), (1920, 786)])
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
# Snow along the crest, left as paper, with a cool shadow under it.
x = 0
while x < 1990:
    w = random.uniform(70, 150); y0 = interp(far, x + w / 2); dep = random.uniform(8, 16)
    d = f"M{x:.0f},{interp(far, x) + 1:.0f} L{x + w / 2:.0f},{y0 + 1:.0f} L{x + w:.0f},{interp(far, x + w) + 1:.0f} L{x + w * 0.8:.0f},{interp(far, x + w * 0.8) + dep:.0f} L{x + w * 0.55:.0f},{y0 + dep * 0.6:.0f} L{x + w * 0.3:.0f},{interp(far, x + w * 0.3) + dep:.0f} Z"
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.85" filter="url(#wcs)"/>')
    x += w + random.uniform(6, 30)
# Longs Peak: the snowfield on its sunlit face, the shoulder to the north.
lp = R([(1600, 785), (1640, 779), (1680, 762), (1700, 752), (1712, 746), (1730, 745), (1748, 752), (1765, 764), (1790, 759), (1810, 766), (1840, 776), (1880, 782)])
snow = lp + list(reversed([(x, y + d) for (x, y), d in zip(lp, [3, 10, 22, 34, 36, 30, 22, 14, 11, 12, 8, 3])]))
add(f'<path d="{poly(snow)}" fill="#FBF8F2" opacity="0.92" filter="url(#wcs)"/>')
wash(poly([lp[5], lp[6], lp[7], (lp[7][0], lp[7][1] + 10), (lp[5][0] + 6, lp[5][1] + 24)]), "#9AA3C6", 0.5, "wcs", g=True)
for i in range(7):   # couloirs on Longs
    px = random.uniform(lp[2][0], lp[8][0]); py = interp(lp, px)
    ink(line([(px, py + 6), (px + jit(5), py + random.uniform(16, 28))]), 1.0, 0.3)
ink(open_path(far), 1.4, 0.55)
foot = F([(0, 812), (200, 808), (400, 805), (600, 806), (800, 800), (1000, 805), (1100, 800), (1200, 798), (1400, 800), (1600, 800), (1800, 795), (1920, 800)])
wash(ridge_d(foot), "#8495AE", 0.8, "wc3")
for i in range(50):   # timber and gullies on the foothills
    x = random.uniform(0, 2400); y = interp(foot, x) + random.uniform(6, 30)
    if y < 494:
        r = random.uniform(8, 18)
        wash(blob(x, y, r * 1.4, r * 0.3), "#6A7890", 0.2, "wcs", g=True)
ink(open_path(foot), 1.2, 0.45)

# --- The plains: stubble, a late green field, the windbreaks along the ditches.
INKSCALE = 0.85
fields = [(0, 500), (800, 504), (1600, 498), (2400, 502)]
wash(ridge_d(fields), "#CDB86C", 0.88, "wc3")
for y0, col in [(536, "#9FA35C"), (600, "#D6BE72")]:
    wash(f"M0,{y0} C600,{y0 - 8} 1400,{y0 + 6} 2400,{y0 - 6} L2400,{y0 + 44} C1400,{y0 + 54} 600,{y0 + 38} 0,{y0 + 48} Z", col, 0.4, "wc3", g=True)
for x in range(-20, 2440, 28):
    y = interp(fields, x) + 4 + jit(3); r = random.uniform(9, 15)
    wash(blob(x, y, r, r * 0.8), random.choice(["#7E8F4E", "#A39A45", "#D6A63C"]), 0.85, "wcs")
for i in range(36):
    x = random.uniform(0, 2400); y = random.uniform(520, 660)
    ink(line([(x, y), (x + random.uniform(60, 160), y + jit(2))]), 0.8, 0.22)
# The bare field the pumpjack stands in, as in oil-well.jpg: brown earth, green shoots.
wash("M330,600 C490,594 670,594 800,598 L810,624 C670,620 490,622 320,628 Z", "#A3825C", 0.45, "wc3", g=True)
for i in range(40):
    x = random.uniform(350, 790); y = random.uniform(602, 622)
    wash(blob(x, y, 3, 1.6), "#7F9450", 0.5, "wcs", g=True)

def pumpjack(x0, base, s):
    """The pumpjack in oil-well.jpg: horsehead, walking beam, A-frame, orange counterweights and rail."""
    m, p = tracer(x0, base, s, 560, 720)
    K = "#2B2626"
    wash(poly(m([(560, 704), (1180, 704), (1180, 720), (560, 720)])), K, 0.95, "wcs")
    for a, b in [((655, 712), (718, 440)), ((822, 715), (734, 444))]:
        ink(line([p(*a), p(*b)]), 18 * s / INKSCALE, 0.95, color=K)
    for k in range(9):   # the ladder up the front leg
        ya = 470 + k * 28
        xa = 718 - (ya - 440) * (63 / 272)
        ink(line([p(xa - 26, ya), p(xa - 6, ya)]), 0.7, 0.7, color=K)
    wash(poly(m([(600, 416), (852, 326), (868, 366), (630, 450)])), K, 0.95, "wcs")
    wash(poly(m([(585, 412), (626, 404), (648, 470), (652, 540), (632, 546), (614, 480), (590, 442)])), K, 0.95, "wcs")
    ink(line([p(596, 540), p(591, 700)]), 1.0, 0.85, color=K)
    for x in (850, 868):   # pitman arms down to the crank
        ink(line([p(x, 370), p(x + 3, 520)]), 1.3, 0.9, color=K)
    wash(poly(m([(840, 480), (890, 480), (890, 704), (840, 704)])), K, 0.95, "wcs")
    wash(poly(m([(835, 570), (920, 575), (1030, 650), (1030, 704), (870, 704), (840, 640)])), K, 0.95, "wcs")
    for cx in (815, 905):
        cx2, cy2 = p(cx, 522)
        wash(blob(cx2, cy2, 22 * s, 13 * s), "#D2662E", 0.95, "wcs")
    for a, b in [((715, 662), (1000, 662)), ((715, 662), (715, 718)), ((1000, 662), (1000, 718)), ((860, 662), (860, 718))]:
        ink(line([p(*a), p(*b)]), 1.1, 0.9, color="#C4562A")
    ink(line([p(1036, 606), p(1036, 718)]), 1.2, 0.85, color="#5E4636")
pumpjack(622, 616, 0.2)

def brush_barn(x0, base, s):
    """The Jared L. Brush Barn (1865), traced from brush-barn.jpg."""
    m, p = tracer(x0, base, s, 130, 905)
    WOOD, WOOD_D, ROOF = "#B08758", "#6E4E34", "#6B4638"
    left = m([(145, 606), (565, 524), (565, 905), (145, 905)])
    right = m([(1210, 556), (1445, 680), (1445, 905), (1210, 905)])
    gable = m([(565, 482), (933, 160), (1210, 526), (1210, 905), (565, 905)])
    for d in (left, right, gable):
        wash(poly(d), WOOD, 0.93, "wcs")
    wash(poly(right), "#5E4E6E", 0.3, "wcs", g=True)
    wash(poly(m([(196, 628), (560, 628), (560, 905), (196, 905)])), "#2F2723", 0.92, "wcs", g=True)   # the open bay
    for px in range(585, 1205, 34):   # board and batten
        top = 160 + (933 - px) * (322 / 368) if px < 933 else 160 + (px - 933) * (366 / 277)
        ink(line([p(px, max(top, 170) + 6), p(px + jit(3), 900)]), 0.6, 0.35)
    for px in range(1225, 1440, 34):
        ink(line([p(px, 566 + (px - 1210) * 0.53), p(px, 900)]), 0.6, 0.3)
    for px in range(160, 560, 34):
        ink(line([p(px, 606 - (px - 145) * 0.2), p(px, 626)]), 0.6, 0.3)
    wash(poly(m([(933, 142), (455, 514), (470, 526), (565, 494), (933, 170)])), ROOF, 0.92, "wcs")
    wash(poly(m([(470, 514), (130, 666), (148, 672), (565, 530), (565, 512)])), ROOF, 0.9, "wcs")
    wash(poly(m([(1246, 548), (1472, 672), (1452, 680), (1210, 560)])), ROOF, 0.9, "wcs")
    cx, cy = p(920, 285)
    wash(blob(cx, cy, 34 * s, 34 * s), "#8A6844", 0.9, "wcs", g=True)
    wash(blob(cx, cy, 24 * s, 24 * s), "#3A302A", 0.9, "wcs", g=True)
    for x1, x2, y1, y2 in [(768, 828, 330, 446), (1010, 1062, 360, 470)]:
        r = (x2 - x1) / 2
        a, b = p(x1, y2), p(x2, y2)
        top = p(x1, y1 + r)[1]
        d = f"M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{top:.1f} a{r * s:.1f},{r * s:.1f} 0 0,1 {(x2 - x1) * s:.1f},0 L{b[0]:.1f},{b[1]:.1f} Z"
        wash(d, "#3A302A", 0.85, "wcs", g=True); ink(d, 0.9, 0.6)
        for yy in range(int(y1 + r), int(y2), 16):
            ink(line([p(x1 + 4, yy), p(x2 - 4, yy)]), 0.5, 0.5, color="#C8A878")
    door = m([(862, 520), (978, 520), (978, 640), (862, 640)])
    wash(poly(door), "#C49A66", 0.9, "wcs", g=True); ink(poly(door), 1.0, 0.7)
    ink(line([p(866, 524), p(974, 636)]), 1.0, 0.7); ink(line([p(974, 524), p(866, 636)]), 1.0, 0.7)
    for box, col in [((790, 722, 1030, 905), "#BE9260"), ((650, 666, 730, 810), "#C49A66"), ((1100, 726, 1140, 836), "#2F2723")]:
        q = m([(box[0], box[1]), (box[2], box[1]), (box[2], box[3]), (box[0], box[3])])
        wash(poly(q), col, 0.85, "wcs", g=True); ink(poly(q), 0.9, 0.6)
    ink(poly(gable), 1.6); ink(poly(left), 1.3, 0.75); ink(poly(right), 1.3, 0.75)
    ink(line([p(933, 142), p(455, 514)]), 1.6); ink(line([p(933, 142), p(1250, 550)]), 1.5)
    # The pipe corral in front, on wooden posts.
    for py in (828, 912):
        ink(line([p(-20, py), p(1350, py + 4)]), 1.2, 0.8, color="#5E4636")
    for px in (-10, 75, 520, 880, 1200, 1340):
        ink(line([p(px, 790), p(px, 950)]), 2.0, 0.85, color="#6E5038")
INKSCALE = 0.8
for x, r in [(170, 46), (236, 58), (442, 40), (1070, 46), (1124, 36)]:
    cottonwood(x, 656 + jit(6), r, back=True)
brush_barn(806, 660, 0.17)

# --- The town, street base at y 712, right of the type on a desktop.
B = 712
for x, red in [(1190, 0), (1300, 0), (1404, 0), (1506, 1), (1616, 0), (1726, 0), (1836, 1), (1946, 0), (2056, 0), (2166, 0), (2276, 1), (2380, 0)]:
    # big trees behind, gold, and red where Charlotte Street has its red ones
    if red: red_tree(x + jit(12), 632 + jit(6), random.uniform(52, 60))
    else: cottonwood(x + jit(20), 636 + jit(10), random.uniform(58, 72), back=True, shadow=False)
wash(poly([(1180, B - 4), (2350, B - 4), (2370, B + 30), (1160, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1160, B + 30), (2370, B + 30)]), 1.4, 0.55)

def masonic(x0, base, s):
    """The 1928 Masonic Temple, traced from masonic-temple.jpg."""
    m, p = tracer(x0, base, s, 50, 408)
    BUFF = "#D9AA6E"
    wall = m([(52, 408), (54, 236), (64, 232), (64, 124), (72, 122), (72, 46), (80, 44), (80, 22), (146, 22), (146, 44), (150, 46), (150, 72),
              (300, 72), (302, 64), (348, 64), (348, 133), (448, 133), (448, 115), (478, 115), (478, 258), (490, 262), (494, 408)])
    wash(poly(wall), BUFF, 0.94, "wcs")
    wash(poly(m([(52, 408), (54, 236), (64, 232), (64, 124), (72, 122), (72, 408)])), "#8E5A3E", 0.25, "wcs", g=True)
    wash(poly(m([(448, 115), (478, 115), (478, 258), (490, 262), (494, 408), (448, 408)])), "#7A6086", 0.22, "wcs", g=True)
    wash(poly(m([(300, 72), (348, 72), (348, 408), (300, 408)])), "#8E5A3E", 0.12, "wcs", g=True)
    for a, b in [((72, 50), (150, 388)), ((150, 76), (300, 388)), ((300, 68), (348, 388)), ((348, 137), (490, 388))]:
        coursing(*p(*a), *p(*b), step=9)
    wash(poly(m([(52, 390), (494, 390), (494, 408), (52, 408)])), "#8A4636", 0.85, "wcs", g=True)   # the red-brown base course
    # The panel and its lettering.
    pnl = m([(153, 92), (284, 92), (284, 118), (153, 118)])
    add(f'<path d="{poly(pnl)}" fill="{PAPER}"/>')
    wash(poly(pnl), "#EDE3C8", 0.85, "wcs", g=True); ink(poly(pnl), 0.9, 0.6)
    tx, ty = p(218.5, 110.5)
    add(f'<text x="{tx:.1f}" y="{ty:.1f}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="{15 * s:.1f}" letter-spacing="0.4" fill="#5E5048" opacity="0.9">MASONIC TEMPLE</text>')
    for mx, my in [(146, 142), (288, 148)]:   # the two emblems
        cx, cy = p(mx, my)
        add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{17 * s:.1f}" fill="#EDE3C8" opacity="0.95"/>')
        add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{12 * s:.1f}" fill="#9DB0C2" opacity="0.85"/>')
        ink(f"M{cx - 17 * s:.1f},{cy:.1f} a{17 * s:.1f},{17 * s:.1f} 0 1,0 {34 * s:.1f},0 a{17 * s:.1f},{17 * s:.1f} 0 1,0 {-34 * s:.1f},0", 0.6, 0.5)
        ink(f"M{cx - 3:.1f},{cy + 2:.1f} L{cx:.1f},{cy - 3:.1f} L{cx + 3:.1f},{cy + 2:.1f}", 0.6, 0.6)
    # The great recessed arch, in three steps.
    for k, (xa, xb, top, op) in enumerate([(128, 300, 148, 0.18), (140, 288, 162, 0.16), (152, 276, 178, 0.14)]):
        a, b = p(xa, 408), p(xb, 408)
        spring = p(xa, 236)[1]
        rx = (xb - xa) / 2 * s; ry = spring - p(xa, top)[1]
        d = f"M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{spring:.1f} A{rx:.1f},{ry:.1f} 0 0,1 {b[0]:.1f},{spring:.1f} L{b[0]:.1f},{b[1]:.1f} Z"
        wash(d, "#8E5A3E", op, "wcs", g=True)
        ink(f"M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{spring:.1f} A{rx:.1f},{ry:.1f} 0 0,1 {b[0]:.1f},{spring:.1f} L{b[0]:.1f},{b[1]:.1f}", 1.1 if k == 0 else 0.7, 0.7 if k == 0 else 0.45)
    def arched_window(xa, xb, y1, y2, glass="#4A4752", frame=True):
        a, b = p(xa, y2), p(xb, y2)
        r = (xb - xa) / 2 * s; top = p(xa, y1)[1] + r
        d = f"M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{top:.1f} a{r:.1f},{r:.1f} 0 0,1 {2 * r:.1f},0 L{b[0]:.1f},{b[1]:.1f} Z"
        if frame:
            add(f'<path d="{d}" fill="{PAPER}" stroke="{PAPER}" stroke-width="3"/>')
        wash(d, glass, 0.88, "wcs", g=True)
        ink(d, 1.0, 0.7)
        if frame:
            ink(line([((a[0] + b[0]) / 2, top - r), ((a[0] + b[0]) / 2, a[1])]), 0.6, 0.5)
            ink(line([(a[0], (top + a[1]) / 2), (b[0], (top + a[1]) / 2)]), 0.6, 0.5)
    arched_window(165, 198, 200, 268); arched_window(232, 265, 200, 268)
    arched_window(400, 430, 212, 310)
    ink(f"M{p(393, 315)[0]:.1f},{p(393, 315)[1]:.1f} L{p(393, 222)[0]:.1f},{p(393, 222)[1]:.1f} a{23.5 * s:.1f},{23.5 * s:.1f} 0 0,1 {47 * s:.1f},0 L{p(440, 315)[0]:.1f},{p(440, 315)[1]:.1f}", 0.8, 0.5)
    for xa, xb in [(160, 200), (224, 262)]:   # the twin doors, pointed at the top
        a, b = p(xa, 402), p(xb, 402)
        top = p(xa, 330)[1]; peak = p(xa, 316)[1]
        d = f"M{a[0]:.1f},{a[1]:.1f} L{a[0]:.1f},{top:.1f} Q{a[0]:.1f},{peak:.1f} {(a[0] + b[0]) / 2:.1f},{peak:.1f} Q{b[0]:.1f},{peak:.1f} {b[0]:.1f},{top:.1f} L{b[0]:.1f},{b[1]:.1f} Z"
        wash(d, "#3E2A24", 0.95, "wcs"); ink(d, 1.1, 0.8)
    for lx in (148, 274):   # lanterns either side
        cx, cy = p(lx, 304)
        wash(poly([(cx - 2.5, cy - 6), (cx + 2.5, cy - 6), (cx + 1.8, cy + 6), (cx - 1.8, cy + 6)]), "#4A3428", 0.9, "wcs", g=True)
    band = m([(360, 150), (458, 150), (458, 166), (360, 166)])
    wash(poly(band), "#EDE3C8", 0.6, "wcs", g=True)
    for bx in range(362, 456, 10):
        cx, cy = p(bx + 5, 158); ink(blob(cx, cy, 1.6, 1.4), 0.5, 0.45)
    ink(line(m([(88, 208), (103, 182), (118, 208)])), 0.9, 0.6)   # the triangle on the tower
    ink(poly(wall), 2.0)
    for ax, ay in [(80, 30), (302, 70), (448, 120)]:   # the capped tops of the piers
        ink(line([p(ax, ay), p(ax + {80: 66, 302: 46, 448: 30}[ax], ay)]), 1.0, 0.6)
masonic(1236, B, 0.45)

# The corner of Charlotte and Fremont: the Town's green street sign and a black lamp post.
sx = 1470
ink(line([(sx, B + 24), (sx, B - 118)]), 2.4, 0.95, color="#2F6A4E")
wash(poly([(sx - 26, B - 126), (sx + 22, B - 126), (sx + 22, B - 116), (sx - 26, B - 116)]), "#2F6A4E", 0.95, "wcs")
ink(line([(sx - 22, B - 121), (sx + 18, B - 121)]), 0.7, 0.8, color="#F4F1EA")
wash(poly([(sx - 3, B - 112), (sx + 3, B - 110), (sx + 3, B - 98), (sx - 3, B - 100)]), "#2F6A4E", 0.9, "wcs")
lx = 1494
ink(line([(lx, B + 22), (lx, B - 84)]), 2.2, 0.95, color="#2A2828")
wash(poly([(lx - 6, B - 84), (lx + 6, B - 84), (lx + 7, B - 100), (lx - 7, B - 100)]), "#E9D9A8", 0.8, "wcs", g=True)
ink(poly([(lx - 6, B - 84), (lx + 6, B - 84), (lx + 7, B - 100), (lx - 7, B - 100)]), 1.2, 0.9, color="#2A2828")
ink(line([(lx - 8, B - 100), (lx, B - 108), (lx + 8, B - 100)]), 1.4, 0.95, color="#2A2828")

def parish_house(x0, base, s):
    """The Harvey J. Parish House (1914), traced from parish-house.jpg."""
    m, p = tracer(x0, base, s, 218, 712)
    BRICK, TIMBER, SHINGLE, GREEN = "#C25A3E", "#6E4230", "#8E7E6C", "#6F806C"
    front = m([(345, 440), (905, 440), (905, 712), (345, 712)])
    side = m([(905, 452), (1290, 520), (1290, 692), (905, 712)])
    wash(poly(front), BRICK, 0.93, "wcs"); wash(poly(side), BRICK, 0.93, "wcs")
    wash(poly(side), "#6B3E52", 0.25, "wcs", g=True)
    coursing(*p(350, 560), *p(900, 700), step=7)
    for box in [(425, 440, 540, 556), (545, 440, 620, 640), (625, 440, 800, 556), (915, 452, 990, 576), (1000, 455, 1075, 578), (1205, 520, 1236, 610), (1254, 530, 1276, 612)]:
        q = m([(box[0], box[1]), (box[2], box[1]), (box[2], box[3]), (box[0], box[3])])
        add(f'<path d="{poly(q)}" fill="{PAPER}"/>')
        wash(poly(q), "#4C5652", 0.85, "wcs", g=True); ink(poly(q), 1.0, 0.75, color="#2F4A3C")
    for px in (480, 712):
        ink(line([p(px, 442), p(px, 554)]), 0.6, 0.6, color="#2F4A3C")
    trans = m([(425, 392), (800, 392), (800, 428), (425, 428)])
    wash(poly(trans), "#5E6A66", 0.7, "wcs", g=True)
    for px in range(432, 800, 22): ink(line([p(px, 394), p(px, 426)]), 0.4, 0.4)
    for pier in [(345, 415), (800, 895)]:   # the brick piers under the beam
        q = m([(pier[0], 440), (pier[1], 440), (pier[1], 712), (pier[0], 712)])
        wash(poly(q), "#A8462E", 0.35, "wcs", g=True); ink(poly(q), 1.0, 0.7)
    steps = m([(400, 640), (540, 640), (548, 712), (392, 712)])
    wash(poly(steps), "#B24A3C", 0.9, "wcs");
    for k in range(4): ink(line([p(398 - k * 2, 652 + k * 16), p(544 + k * 2, 652 + k * 16)]), 0.5, 0.5)
    # Front gable: green shingle over a brown beam, deep bargeboards, the little balcony.
    gab = m([(300, 372), (525, 158), (870, 372)])
    wash(poly(gab), GREEN, 0.92, "wcs")
    for py in range(200, 370, 14):
        half = (py - 158) * (225 / 214)
        ink(line([p(525 - half * 0.98, py), p(525 + half * 1.6, py)]), 0.45, 0.3)
    wash(poly(m([(240, 360), (925, 360), (925, 392), (240, 392)])), TIMBER, 0.95, "wcs")
    win = m([(545, 245), (640, 245), (640, 298), (545, 298)])
    wash(poly(win), "#4C5652", 0.85, "wcs", g=True); ink(poly(win), 0.9, 0.7)
    bal = m([(512, 298), (662, 298), (662, 338), (512, 338)])
    wash(poly(bal), TIMBER, 0.9, "wcs")
    for px in range(522, 660, 18): ink(line([p(px, 304), p(px, 336)]), 0.5, 0.6, color="#E9DDC8")
    # The side gable to the right.
    sg = m([(950, 348), (1105, 196), (1210, 440)])
    wash(poly(sg), GREEN, 0.92, "wcs"); wash(poly(sg), "#3E4E56", 0.22, "wcs", g=True)
    wash(poly(m([(905, 430), (1220, 442), (1220, 466), (905, 456)])), TIMBER, 0.95, "wcs")
    bal = m([(984, 322), (1056, 330), (1056, 372), (984, 366)])
    wash(poly(bal), TIMBER, 0.9, "wcs")
    win = m([(998, 290), (1036, 292), (1036, 322), (998, 320)])
    wash(poly(win), "#4C5652", 0.85, "wcs", g=True)
    # The shingle roof between the gables, and the bargeboards.
    roof = m([(525, 125), (780, 218), (1105, 180), (925, 352)])
    wash(poly(roof), SHINGLE, 0.92, "wcs")
    for k in range(1, 6):
        t = k / 6
        a = (525 + (925 - 525) * t, 125 + (352 - 125) * t); b = (780 + (1105 - 780) * t, 218 + (180 - 218) * t)
        ink(line([p(*a), p(*b)]), 0.5, 0.35)
    wash(poly(m([(1150, 452), (1232, 456), (1342, 520), (1292, 526)])), SHINGLE, 0.9, "wcs")
    for rafter in [((525, 122), (216, 406), (232, 414), (525, 146)), ((525, 122), (930, 362), (914, 368), (525, 146)),
                   ((1105, 178), (920, 348), (936, 354), (1105, 200)), ((1105, 178), (1236, 456), (1222, 460), (1105, 200))]:
        wash(poly(m(list(rafter))), TIMBER, 0.95, "wcs")
        ink(line(m([rafter[0], rafter[1]])), 1.2, 0.8)
    for bx in (300, 380, 640, 820):   # brackets under the eaves
        ink(line([p(bx, 392), p(bx, 420)]), 1.0, 0.7)
    ink(poly(front), 1.6, 0.85); ink(poly(side), 1.4, 0.75)
    # The museum's white sign on its post.
    ink(line([p(762, 444), p(762, 740)]), 2.0, 0.9, color="#F2EEE4")
    ink(line([p(762, 444), p(762, 740)]), 0.6, 0.5)
    ink(line([p(612, 492), p(768, 492)]), 1.6, 0.9, color="#F2EEE4")
    bd = m([(630, 526), (750, 526), (750, 680), (630, 680)])
    add(f'<path d="{poly(bd)}" fill="#F6F2E8"/>'); ink(poly(bd), 0.9, 0.7)
    for k, (a, b) in enumerate([(660, 720), (650, 740), (655, 735)]):
        yy = 560 + k * 40
        ink(line([p(a, yy), p(b, yy)]), 0.9, 0.8, color="#3E5A40")
parish_house(1524, B - 6, 0.235)
spruce(1806, B - 4, 150)

def town_hall(x0, base, s):
    """Town Hall, 450 South Parish Avenue, traced from town-hall.jpg."""
    m, p = tracer(x0, base, s, 55, 455)
    BRICK, CREAM, GLASS = "#A54E3A", "#EADFC4", "#46505E"
    lw = m([(56, 266), (446, 266), (446, 455), (56, 455)])
    rw = m([(776, 286), (1060, 290), (1100, 300), (1140, 308), (1165, 316), (1165, 455), (776, 455)])
    wash(poly(lw), BRICK, 0.93, "wcs"); wash(poly(rw), BRICK, 0.93, "wcs")
    wash(poly(rw), "#5E3E58", 0.2, "wcs", g=True)
    drum = m([(440, 224), (520, 212), (600, 206), (700, 212), (780, 226), (856, 248), (856, 455), (440, 455)])
    wash(poly(drum), BRICK, 0.94, "wcs")
    wash(poly(m([(700, 212), (780, 226), (856, 248), (856, 455), (700, 455)])), "#5E3E58", 0.2, "wcs", g=True)
    for a, b in [((60, 272), (442, 448)), ((444, 252), (852, 448)), ((780, 318), (1160, 448))]:
        coursing(*p(*a), *p(*b), step=6)
    for c in [[(50, 254), (450, 254), (450, 270), (50, 270)], [(770, 276), (1060, 280), (1168, 306), (1168, 318), (1060, 294), (770, 290)],
              [(436, 222), (520, 206), (600, 200), (700, 206), (780, 220), (860, 242), (860, 254), (780, 232), (700, 218), (600, 212), (520, 218), (436, 234)]]:
        add(f'<path d="{poly(m(c))}" fill="{PAPER}"/>')
        wash(poly(m(c)), CREAM, 0.9, "wcs", g=True); ink(poly(m(c)), 0.8, 0.6)
    def win(box):
        q = m([(box[0], box[1]), (box[2], box[1]), (box[2], box[3]), (box[0], box[3])])
        add(f'<path d="{poly(q)}" fill="{PAPER}"/>')
        wash(poly(q), GLASS, 0.88, "wcs", g=True); ink(poly(q), 0.8, 0.65)
        ink(line(m([(box[0] - 4, box[1] - 4), (box[2] + 4, box[1] - 4)])), 1.4, 0.8, color=CREAM)
    for bx in (78, 150, 222, 298, 362):
        win((bx, 298, bx + 34, 344)); win((bx, 390, bx + 34, 438))
    for box in [(462, 256, 500, 330), (548, 248, 622, 330), (682, 248, 745, 330)]:
        win(box)
    for bx in (880, 940, 1000, 1090):
        win((bx, 332, bx + 30, 364)); win((bx, 392, bx + 30, 438))
    # The curved portico on its columns, the glass entrance behind.
    wash(poly(m([(400, 366), (820, 366), (820, 455), (400, 455)])), "#3E3A44", 0.75, "wcs", g=True)
    pc = m([(372, 344), (480, 336), (600, 332), (720, 338), (832, 350), (832, 368), (720, 356), (600, 350), (480, 354), (372, 362)])
    add(f'<path d="{poly(pc)}" fill="{PAPER}"/>')
    wash(poly(pc), CREAM, 0.9, "wcs", g=True); ink(poly(pc), 0.9, 0.7)
    for cx in (386, 470, 492, 578, 594, 790, 808):
        top = 360 if cx < 600 else 362
        q = m([(cx - 5, top), (cx + 5, top), (cx + 5, 455), (cx - 5, 455)])
        add(f'<path d="{poly(q)}" fill="{PAPER}"/>'); wash(poly(q), CREAM, 0.85, "wcs", g=True)
        ink(line([p(cx + 5, top), p(cx + 5, 455)]), 0.6, 0.5)
    ink(poly(lw), 1.6, 0.85); ink(poly(rw), 1.5, 0.8); ink(poly(drum), 1.6, 0.85)
    # The flags: the Stars and Stripes and Colorado's.
    for fx, fy, us in [(125, 205, True), (165, 212, False)]:
        a, b = p(fx, fy), p(fx, 455)
        ink(line([a, b]), 1.0, 0.8, color="#6E6A6A")
        w, h = 30, 19
        fl = [(a[0], a[1] + 1), (a[0] + w * 0.5, a[1] - 2), (a[0] + w, a[1] + 2), (a[0] + w, a[1] + 2 + h), (a[0] + w * 0.5, a[1] + h - 2), (a[0], a[1] + h + 1)]
        add(f'<path d="{poly(fl)}" fill="{PAPER}"/>')
        if us:
            for k in range(4):
                yk = a[1] + 2 + k * 5
                wash(poly([(a[0], yk), (a[0] + w * 0.5, yk - 3), (a[0] + w, yk + 1), (a[0] + w, yk + 3.5), (a[0] + w * 0.5, yk - 0.5), (a[0], yk + 2.5)]), "#B8372B", 0.85, "wcs", g=True)
            wash(poly([(a[0], a[1] + 1), (a[0] + 13, a[1] - 1), (a[0] + 13, a[1] + 10), (a[0], a[1] + 11)]), "#2F4A7A", 0.9, "wcs", g=True)
        else:
            for k, c in enumerate(["#2F4A7A", None, "#2F4A7A"]):
                if c:
                    yk = a[1] + 1 + k * (h / 3)
                    wash(poly([(a[0], yk), (a[0] + w * 0.5, yk - 3), (a[0] + w, yk + 1), (a[0] + w, yk + 1 + h / 3), (a[0] + w * 0.5, yk - 3 + h / 3), (a[0], yk + h / 3)]), c, 0.85, "wcs", g=True)
            add(f'<circle cx="{a[0] + 12:.1f}" cy="{a[1] + h / 2:.1f}" r="5" fill="none" stroke="#B8372B" stroke-width="2.6" stroke-dasharray="24 8" transform="rotate(30 {a[0] + 12:.1f} {a[1] + h / 2:.1f})"/>')
            add(f'<circle cx="{a[0] + 12:.1f}" cy="{a[1] + h / 2:.1f}" r="2.4" fill="#E2B92E"/>')
        ink(poly(fl), 0.8, 0.6)
    for tx in (300, 380, 900, 1000):   # the young trees along the walk, gold now
        cottonwood(p(tx, 455)[0], base + 6, 17, back=True, shadow=False)
    sx, sy = p(628, 485)
    spruce(sx, sy, 92)
town_hall(1846, B - 8, 0.42)

def town_sign(x, base, w):
    """The Town's sign from town-hall.jpg: red stone, a cream cap, a brick base, the mountains."""
    h = w * 0.37
    stone = [(x, base - w * 0.12), (x, base - w * 0.12 - h), (x + w, base - w * 0.12 - h), (x + w, base - w * 0.12)]
    wash(poly([(x - 6, base - w * 0.12), (x + w + 6, base - w * 0.12), (x + w + 6, base - w * 0.1), (x - 6, base - w * 0.1)]), "#EADFC4", 0.95, "wcs")
    wash(poly([(x + 4, base), (x + 4, base - w * 0.1), (x + w + 2, base - w * 0.1), (x + w + 2, base)]), "#9E4A38", 0.92, "wcs")
    wash(poly(stone), "#C46E58", 0.94, "wcs")
    wash(poly([(x - 3, stone[1][1] - 3), (x + w + 3, stone[1][1] - 3), (x + w + 3, stone[1][1] + 2), (x - 3, stone[1][1] + 2)]), "#EADFC4", 0.9, "wcs", g=True)
    cy = stone[1][1] + h * 0.36
    for k in range(3):   # the three peaks of the Town's logo
        px = x + w * 0.5 + (k - 1) * w * 0.1
        wash(poly([(px - w * 0.05, cy), (px, cy - h * 0.2), (px + w * 0.05, cy)]), "#2A2626", 0.9, "wcs", g=True)
    ink(line([(x + w * 0.1, cy + 1), (x + w * 0.9, cy + 1)]), 1.0, 0.85, color="#2A2626")
    ink(line([(x + w * 0.24, cy + h * 0.28), (x + w * 0.76, cy + h * 0.28)]), 2.0, 0.85, color="#2A2626")
    ink(line([(x + w * 0.2, cy + h * 0.5), (x + w * 0.8, cy + h * 0.5)]), 0.7, 0.7, color="#2A2626")
    ink(poly(stone), 1.3, 0.8)
wash(poly([(1180, B + 2), (2350, B + 2), (2356, B + 14), (1174, B + 14)]), "#7E7398", 0.45, "wcs", g=True)

# The Parish House's concrete wall and iron fence along the sidewalk.
wx0, wx1 = 1508, 1812
wash(poly([(wx0, B - 8), (wx1, B - 8), (wx1, B + 8), (wx0, B + 8)]), "#D8CDB8", 0.92, "wcs")
wash(poly([(wx0, B + 2), (wx1, B + 2), (wx1, B + 8), (wx0, B + 8)]), "#7E7398", 0.3, "wcs", g=True)
ink(poly([(wx0, B - 8), (wx1, B - 8), (wx1, B + 8), (wx0, B + 8)]), 1.1, 0.6)
for i in range(30):   # the garden inside: coneflowers gone to seed, a little green
    x = random.uniform(wx0 + 6, wx1 - 6); y = random.uniform(B - 30, B - 12)
    wash(blob(x, y, 4, 3), random.choice(["#8E9A4C", "#A3A85C", "#C27A9A"]), 0.6, "wcs", g=True)
ink(line([(wx0, B - 30), (wx1, B - 30)]), 1.1, 0.85, color="#2E2A28")
ink(line([(wx0, B - 12), (wx1, B - 12)]), 0.9, 0.8, color="#2E2A28")
for fx in range(wx0 + 3, wx1, 6):
    ink(line([(fx, B - 8), (fx, B - 34)]), 0.8, 0.8, color="#2E2A28")
for fx in (wx0, wx0 + 152, wx1):
    ink(line([(fx, B - 8), (fx, B - 40)]), 1.8, 0.9, color="#2E2A28")
town_sign(2224, B + 26, 78)
for x in (1200, 2356):
    cottonwood(x, B + 12, 38)
INKSCALE = 1.1

# --- The near ground: grass under the town with fallen leaves, and a ploughed
# field coming toward us on the left.
bank = [(0, 744), (800, 740), (1600, 748), (2400, 742)]
wash(ridge_d(bank), "#B9AE66", 0.9, "wc1")
for i in range(70):   # leaves on the grass below the trees
    x = random.uniform(1180, 2400); y = random.uniform(750, 786)
    wash(blob(x, y, random.uniform(2.5, 4.5), 2), random.choice(["#E3A93A", "#D9832E", "#B8402E", "#E3A93A"]), 0.7, "wcs", g=True)
# The ploughed field: its edge and its furrows run toward one far point.
vx, vy = 735, 600
def edge(y): return vx + (y - vy) * (1700 - vx) / (1000 - vy)
fx = [(edge(y), y) for y in range(772, 1001, 19)]
wash(poly([(0, 1000), (0, 774), (fx[0][0], 772)] + fx[1:]), "#8E6E4C", 0.62, "wc3", g=True)
t = (772 - vy) / (1000 - vy)
xb = vx - 40 * 48
while xb < 1700:   # furrows, unevenly spaced, some darker
    w = random.uniform(38, 58); xb1 = min(xb + w * random.uniform(0.35, 0.6), 1700)
    pts = [(vx + (xb - vx) * t, 772), (vx + (xb1 - vx) * t, 772), (xb1 + jit(4), 1000), (xb + jit(4), 1000)]
    if random.random() < 0.55: wash(poly(pts), "#6E5440", random.uniform(0.14, 0.3), "wcs", g=True)
    ya = 772 + random.uniform(0, 40) * (random.random() < 0.3)
    ink(line([(vx + (xb - vx) * (ya - vy) / (1000 - vy), ya), pts[3]]), 0.9, random.uniform(0.2, 0.36))
    xb += w
wash("M0,880 C400,870 900,884 1400,930 L1490,1000 L0,1000 Z", "#5E4636", 0.25, "wc3", g=True)
ink(line(fx), 1.4, 0.55)
for i in range(70):   # green shoots in the earth, as in oil-well.jpg
    x = random.uniform(0, 1650); y = random.uniform(790, 990)
    if x > edge(y) - 8: continue
    ink(line([(x, y), (x + jit(3), y - random.uniform(4, 9))]), 0.9, 0.4, color="#4E6A34")
for i in range(170):   # grass tufts on the verge to the right
    x = random.uniform(1100, 2400); y = random.uniform(770, 995)
    if x < edge(y) + 10: continue
    ink(line([(x, y + 14), (x + jit(5), y)]), 1.0, 0.4)
for i in range(26):   # rabbitbrush
    x = random.uniform(1700, 2400); y = random.uniform(840, 985)
    if x < edge(y) + 20: continue
    wash(blob(x, y, random.uniform(6, 10), 5), "#E2B92E", 0.7, "wcs", g=True)
wash("M1700,1000 C1900,960 2100,950 2400,940 L2400,1000 Z", "#8E8450", 0.4, "wc3", g=True)
# The white post-and-rail fence of hero.jpg, along the field's edge.
posts = []
for z in [1.12 + 0.17 * k for k in range(8)]:
    y = vy + (1000 - vy) / z; x = edge(y) + 16 / z
    posts.append((x, y, 70 / z, 8 / z))
for frac in (0.92, 0.5):
    ink(open_path([(x + w / 2, y - h * frac) for x, y, h, w in posts]), 2.6, 0.9, color="#FBF8F2")
    ink(open_path([(x + w / 2, y - h * frac + 2) for x, y, h, w in posts]), 0.8, 0.45)
for x, y, h, w in posts:
    q = [(x, y), (x, y - h), (x + w, y - h), (x + w, y)]
    add(f'<path d="{poly(q)}" fill="#FBF8F2" opacity="0.95"/>')
    wash(poly([(x + w * 0.6, y), (x + w * 0.6, y - h), (x + w, y - h), (x + w, y)]), "#8E8AA8", 0.35, "wcs", g=True)
    ink(poly(q), 1.0, 0.7)
    wash(blob(x + w / 2 + w * 1.2, y + 2, w * 2.2, w * 0.4), "#6E6A50", 0.3, "wcs", g=True)
cottonwood(2300, 940, 64)

finish(sys.argv[1])
