"""Fort Collins hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Old Town on an autumn morning, looking west to the foothills. On the skyline,
Horsetooth Rock's granite crest with its two notches, traced from the guide's
photo of the rock (horsetooth-mountain-open-space.jpg), on the timbered
mountain; below it the hogback with its rim of red sandstone and its autumn
grass, as the views over Horsetooth and Lory show them (horsetooth-panorama.jpg,
horsetooth-inlet-bay.jpg, lory-state-park.jpg), and the city's trees. In
town, left to right: the white Northern Hotel with its NORTHERN bar and
vertical HOTEL sign, and the brick storefront beside it with its black awning
and green gooseneck lamps (hero.jpg); the Old Town Square building with its
clipped tower, grey bay window and star on its steel frame, and the square's
orange umbrellas (old-town-square.jpg); the buff-brick Opera House Block with
its white cornice, green-tiled shopfronts and globe lamps (jax-fish-house.jpg);
and the C&S Freight Depot (downtown-transit-center.jpg). In front, cottonwoods
along the Poudre over a meadow, a still pond with willows and reeds, as at
Arapaho Bend and Riverbend Ponds (arapaho-bend.jpg,
riverbend-ponds-natural-area.jpg), and a concrete trail through prairie grass
and rabbitbrush, as at Cathy Fromme Prairie
(cathy-fromme-prairie-natural-area.jpg). The far range, the city's trees and
the fields are generic; no building in it is invented.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

def blob(x, y, rx, ry):
    return f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z"

def cotton(x, base, r, col="#E9AE3E", lit="#D06A1E", shadow=True):
    """wclib's cottonwood with its colour free, for the greener trees along the river."""
    if shadow:
        wash(blob(x + r * 0.8, base + 4, r * 1.2, r * 0.18), "#7E7398", 0.4, "wcs", g=True)
    blobs = [(-0.55, -0.9, 0.62), (0.5, -0.95, 0.6), (0, -1.35, 0.72), (-0.25, -0.7, 0.55), (0.35, -0.65, 0.5), (0.85, -1.2, 0.42), (-0.85, -1.25, 0.4)]
    wash(" ".join(blob(x + dx * r, base + dy * r, rr * r, rr * r) for dx, dy, rr in blobs), col, 0.92, "wc2")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.9:.0f} C{x + r * 1.4:.0f},{base - r * 1.6:.0f} {x + r * 1.3:.0f},{base - r * 0.3:.0f} {x + r * 0.2:.0f},{base - r * 0.25:.0f} C{x + r * 0.6:.0f},{base - r * 0.9:.0f} {x + r * 0.5:.0f},{base - r * 1.4:.0f} {x + r * 0.1:.0f},{base - r * 1.9:.0f} Z", lit, 0.5, "wcs", g=True)
    ink(line([(x - 3, base + 2), (x - 1, base - r * 0.45), (x - r * 0.3, base - r * 0.8)]), 2.0, 0.75)
    ink(line([(x, base - r * 0.45), (x + r * 0.35, base - r * 0.85)]), 1.6, 0.65)
    ink(line([(x + 4, base + 2), (x + 2, base - r * 0.4)]), 1.6, 0.6)

# --- Sky.
sky()
for cx, cy, s in [(300, 130, 60), (980, 96, 44), (1560, 140, 62), (2200, 118, 52), (620, 296, 30), (2130, 288, 28)]:
    cloud(cx, cy, s)

# --- A far range, hazy, behind the foothills.
INKSCALE = 0.55
far = [(0, 404), (180, 392), (380, 404), (560, 386), (760, 398), (940, 382), (1120, 396), (1300, 386), (1500, 398), (1700, 390), (1900, 402), (2100, 388), (2300, 400), (2400, 394)]
wash(ridge_d(far), "#B3B2CE", 0.72, "wc3")
ink(open_path(far[1:8]), 1.2, 0.3)

# --- Horsetooth Mountain and the rock, traced from the photo (photo px * S).
S, RX0, RY0 = 0.36, 1380, 340
def R(pts): return [(RX0 + x * S, RY0 + (y - 297) * S) for x, y in pts]
rock = R([(0, 580), (60, 545), (100, 520), (160, 480), (200, 455), (260, 440), (310, 410), (340, 380), (380, 355), (420, 345), (450, 320), (480, 308),
          (510, 300), (560, 298), (640, 297), (700, 300), (724, 306), (727, 404), (752, 404), (756, 318), (778, 302), (800, 298), (812, 306), (825, 296),
          (870, 295), (888, 302), (891, 424), (918, 424), (922, 298), (948, 290), (1000, 288), (1100, 293), (1160, 305), (1190, 330), (1230, 345), (1280, 358)])
beyond = R([(1320, 356), (1380, 368), (1450, 352), (1520, 336), (1600, 330)]) + [(2040, 372), (2140, 396), (2250, 418), (2400, 432)]
before = [(0, 456), (160, 444), (340, 450), (520, 436), (700, 444), (880, 432), (1040, 440), (1180, 436), (1290, 442), (1350, 443)]
mtn = before + rock + beyond
wash(f"M0,{H} " + " L".join(f"{x:.1f},{y:.1f}" for x, y in mtn) + f" L2400,{H} Z", "#9E9A7C", 0.9, "wc1")
wash("M1180,470 C1300,440 1380,446 1500,430 C1700,404 1900,392 2060,392 C2200,410 2300,440 2400,446 L2400,540 L1180,540 Z", "#4F6A58", 0.3, "wc3", g=True)   # the timber under the rock
for i in range(900):   # pines, thick on the mountain under the rock
    x = random.uniform(0, 2400); top = interp(mtn, x)
    near = 1300 < x < 2150
    y = top + random.uniform(4, 80) + (16 if 1380 < x < 1840 else 0)
    if y < 520 and (near or random.random() < 0.45):
        r = random.uniform(3, 6.5)
        wash(f"M{x - r:.1f},{y + r:.1f} L{x:.1f},{y - r * 1.6:.1f} L{x + r:.1f},{y + r:.1f} Z", random.choice(["#40594A", "#4F6A58", "#5E7466"]), 0.5, "wcs", g=True)
for a, b in [(1790, 2100), (980, 1180), (300, 520)]:   # the slopes away from the sun
    pts = [(x, interp(mtn, x)) for x in range(a, b + 1, 12)]
    wash(poly(pts + [(b, 520), (a + (b - a) * 0.3, 520)]), "#7F7699", 0.16, "wc3", g=True)
ink(line(before + [rock[0]]), 1.5, 0.55)
ink(line(beyond), 1.5, 0.55)

# The granite face: pale, its blocks split by joints, shadow down the notches.
INKSCALE = 0.75
foot = R([(1280, 358), (1250, 420), (1180, 468), (1060, 474), (980, 452), (900, 446), (800, 456), (700, 436), (600, 426), (500, 446), (400, 474), (300, 504), (200, 534), (100, 562), (0, 580)])
face = poly(rock + foot[1:])
wash(face, "#CDBFB4", 0.95, "wcs")
for blk in [[(722, 306), (726, 404), (700, 436), (680, 380)], [(888, 302), (892, 424), (860, 450), (850, 380)], [(1160, 305), (1280, 358), (1250, 420), (1150, 430)],
            [(640, 297), (722, 306), (700, 360), (660, 330)], [(310, 410), (420, 345), (430, 420), (330, 470)]]:
    wash(poly(R(blk)), "#8C85A3", 0.42, "wcs", g=True)
wash(poly(R([(0, 580), (200, 534), (500, 446), (800, 456), (1060, 474), (1180, 468), (1180, 500), (0, 600)])), "#8C85A3", 0.3, "wcs", g=True)
for a0, a1 in [(724, 756), (888, 922)]:   # the notches, in shadow down their throats
    wash(poly(R([(a0 - 6, 306), (a1 + 6, 306), (a1 - 2, 440), (a0 + 2, 440)])), "#6A6486", 0.5, "wcs", g=True)
wash(poly(R([(300, 440), (1240, 400), (1250, 420), (1180, 468), (1060, 474), (980, 452), (900, 446), (800, 456), (700, 436), (600, 426), (500, 446), (400, 474), (300, 504)])), "#8C85A3", 0.28, "wcs", g=True)
for px, py0, py1 in [(560, 305, 420), (645, 300, 400), (812, 308, 380), (1010, 292, 420), (1080, 296, 400), (460, 330, 440), (1200, 335, 430), (360, 380, 480)]:
    ink(line(R([(px, py0), (px + jit(12), (py0 + py1) / 2), (px + jit(10), py1)])), 1.1, 0.5)
for px, py in [(520, 380), (980, 360), (700, 410), (1120, 400), (300, 470), (900, 420)]:
    ink(line(R([(px, py), (px + 70, py + jit(6))])), 0.9, 0.35)
ink(line(rock), 1.9, 0.85)
for i in range(30):   # pines along the foot of the rock
    t = random.random(); fx = foot[1][0] + (foot[-1][0] - foot[1][0]) * t
    fy = interp(sorted(foot[1:]), fx) + random.uniform(-4, 10)
    ponderosa(fx, fy, random.uniform(14, 26))

# --- The hogback with its red rim, in autumn grass.
INKSCALE = 0.8
hog = [(0, 520), (120, 502), (260, 488), (420, 480), (560, 482), (700, 494), (820, 500), (960, 492), (1100, 498), (1250, 508), (1500, 512), (1800, 508), (2100, 516), (2400, 510)]
wash(ridge_d(hog), "#C7A463", 0.92, "wc1")
wash("M0,540 C300,520 700,526 1100,544 L1100,640 L0,640 Z", "#7E6E86", 0.3, "wc3", g=True)   # the near slope in shade
def rim(x0, x1):
    top = [(x, interp(hog, x) + 3 + 1.2 * math.sin(x / 23)) for x in range(int(x0), int(x1) + 1, 8)]
    bot = [(x, y + 6 + 5 * abs(math.sin(x / 37 + x0)) + random.uniform(0, 3)) for x, y in top]
    bot[0] = (bot[0][0], top[0][1] + 2); bot[-1] = (bot[-1][0], top[-1][1] + 2)
    wash(poly([(x, y + 1) for x, y in bot] + [(x, y + 7 + jit(2)) for x, y in reversed(bot)]), "#7D6070", 0.35, "wcs", g=True)   # its shadow on the slope
    wash(poly(top + list(reversed(bot))), "#BF5A3B", 0.94, "wcs")
    wash(poly([(x, y - 3) for x, y in bot] + [(x, y + 1) for x, y in reversed(bot)]), "#7A3A2C", 0.45, "wcs", g=True)
    ink(line(top), 1.6, 0.8)
    x = x0 + random.uniform(6, 20)
    while x < x1 - 8:   # joints in the sandstone
        ink(line([(x, interp(top, x) + 1), (x + jit(2), interp(bot, x) - 1)]), 0.9, 0.5); x += random.uniform(12, 34)
    for i in range(int((x1 - x0) / 22)):   # rubble below
        rx = random.uniform(x0, x1); ry = interp(bot, rx) + random.uniform(8, 30)
        wash(blob(rx, ry, 4, 2.5), "#B4664A", 0.7, "wcs", g=True)
for x0, x1 in [(70, 330), (352, 640), (668, 820), (860, 1130)]:
    rim(x0, x1)
for i in range(80):   # boulders and junipers on the slope
    x = random.uniform(20, 1180); y = interp(hog, x) + random.uniform(26, 90)
    if y < 600:
        if random.random() < 0.55: wash(blob(x, y, 6, 3.5), "#E6DCCB", 0.8, "wcs", g=True); ink(f"M{x - 6:.0f},{y + 2:.0f} q6,3 12,0", 0.8, 0.45)
        else: wash(blob(x, y, 8, 5), "#5E7450", 0.75, "wcs")
for i in range(50):
    x = random.uniform(0, 1180); y0 = interp(hog, x) + random.uniform(20, 100)
    if y0 < 600: ink(line([(x, y0), (x - 10, y0 + 12)]), 0.9, 0.28)

# --- The city's trees, a sea of them going gold.
INKSCALE = 0.85
wash("M0,560 C600,548 1400,556 2400,550 L2400,700 L0,700 Z", "#A89A58", 0.85, "wc3")
for row, (y0, r0, op) in enumerate([(562, 9, 0.45), (578, 11, 0.5), (596, 14, 0.6)]):
    for x in range(-20, 2440, int(r0 * 1.4)):
        y = y0 + jit(4); r = r0 * random.uniform(0.8, 1.3)
        col = random.choice(["#8C944E", "#A39A45", "#C9A040", "#B8823A", "#7E8A52"])
        wash(blob(x, y, r, r * 0.75), col, op, "wcs", g=True)
    if row == 0: wash("M0,548 C700,540 1500,550 2400,544 L2400,580 L0,580 Z", "#A9A6BE", 0.25, "wc3", g=True)   # haze over the far ones

# --- Gold trees behind Old Town.
for x in range(1170, 2360, 118):
    cottonwood(x + jit(24), 646 + jit(8), random.uniform(58, 74), back=True, shadow=False)

# --- Cottonwoods along the Poudre, and the meadow under them (Arapaho Bend).
TREES = [("#E9AE3E", "#D06A1E"), ("#C9A43E", "#B8642A"), ("#A6A048", "#9A6A2A"), ("#E3A23A", "#C25A22"), ("#D89A36", "#B4521E")]
x = -30
while x < 1190:   # the back row
    cotton(x, 676 + jit(6), random.uniform(36, 46), *random.choice(TREES), shadow=False); x += random.uniform(44, 70)
x = -50
while x < 1190:
    cotton(x, 700 + jit(8), random.uniform(44, 64), *random.choice(TREES)); x += random.uniform(56, 96)
wash("M0,700 C400,696 800,706 1180,704 L1180,800 L0,800 Z", "#B49A58", 0.9, "wc1")
wash("M0,712 C400,706 800,716 1180,712 L1180,800 L0,800 Z", "#76694A", 0.35, "wc3", g=True)
for i in range(60):
    x = random.uniform(0, 1170); y = random.uniform(708, 770)
    wash(blob(x, y, 11, 6), random.choice(["#7E8F4E", "#8C9A58", "#C9A43E"]), 0.6, "wcs", g=True)
for i in range(160):
    x = random.uniform(0, 1180); y = random.uniform(706, 778)
    ink(line([(x, y), (x + jit(5), y - random.uniform(8, 18))]), 0.9, 0.35)

# --- Old Town, base at y 712, from x 1205: clear of the type on a desktop.
B = 712
INKSCALE = 0.9
wash(poly([(1170, B - 4), (2400, B - 4), (2400, B + 30), (1160, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1160, B + 30), (2400, B + 30)]), 1.4, 0.55)

def northern(x):
    """The Northern Hotel: white, four storeys, pilasters with little capped pinnacles, a black shopfront floor and its sign."""
    w, h, g = 262, 214, 54
    top = B - h
    f = poly([(x, B), (x, top), (x + w, top), (x + w, B)])
    add(f'<path d="{f}" fill="{PAPER}"/>')
    wash(f, "#EFE6D6", 0.8, "wcs", g=True)
    wash(poly([(x + w * 0.7, top), (x + w, top), (x + w, B), (x + w * 0.7, B)]), "#8E88A6", 0.22, "wcs", g=True)
    nb = 6; bw = w / nb
    for k in range(nb + 1):
        px = x + k * bw
        if 0 < k < nb:
            wash(poly([(px + 3, top + 4), (px + 7, top + 4), (px + 7, B - g), (px + 3, B - g)]), "#9A93AE", 0.3, "wcs", g=True)
            ink(line([(px - 3, top + 4), (px - 3, B - g)]), 0.7, 0.35)
        pin = poly([(px - 5, top + 2), (px - 5, top - 9), (px + 5, top - 9), (px + 5, top + 2)])
        add(f'<path d="{pin}" fill="{PAPER}"/>'); ink(pin, 1.1, 0.75)
        wash(f"M{px - 6},{top - 9} L{px},{top - 16} L{px + 6},{top - 9} Z", "#5E9C8E", 0.9, "wcs", g=True)
        ink(f"M{px - 6},{top - 9} L{px},{top - 16} L{px + 6},{top - 9}", 1.0, 0.7)
    zz = []
    for k in range(int(w / 8) + 1):
        zz.append((x + 4 + k * 8, top + 9 if k % 2 else top + 15))
    ink(line([(min(px, x + w - 4), py) for px, py in zz]), 0.9, 0.5)
    ink(line([(x, top + 19), (x + w, top + 19)]), 0.9, 0.45)
    for k in range(nb):
        for fl in range(3):
            wx = x + k * bw + bw / 2 - 6; wy = top + 28 + fl * 44
            trimmed(wx, wy, 12, 26)
            if k % 2 == 1 and fl < 2:
                wash(poly([(wx - 1, wy + 33), (wx + 13, wy + 33), (wx + 13, wy + 42), (wx - 1, wy + 42)]), "#D3BE8C", 0.85, "wcs", g=True)
                ink(f"M{wx + 3},{wy + 37.5} a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0", 0.7, 0.55)
    gf = poly([(x, B), (x, B - g), (x + w, B - g), (x + w, B)])
    wash(gf, "#2E2B30", 0.92, "wcs")
    for px in range(int(x + 70), int(x + w - 10), 34):
        wash(poly([(px, B - 4), (px, B - g + 16), (px + 28, B - g + 16), (px + 28, B - 4)]), "#7D8C98", 0.55, "wcs", g=True)
        ink(poly([(px, B - 4), (px, B - g + 16), (px + 28, B - g + 16), (px + 28, B - 4)]), 1.0, 0.8, color="#E9E4DA")
    ink(f, 2.0)
    # The sign, on its grey pylon at the north end.
    sx, sw = x + 24, 32
    ink(line([(sx + sw / 2, B), (sx + sw / 2, B - 60)]), 9, 0.85, color="#8E8A86")
    sg = f"M{sx},{B - 60} L{sx},{top + 26} a{sw / 2},{sw / 2} 0 0,1 {sw},0 L{sx + sw},{B - 60} Z"
    add(f'<path d="{sg}" fill="{PAPER}"/>'); wash(sg, "#1F1D21", 0.95, "wcs", g=True); ink(sg, 1.4, 0.9)
    for i, ch in enumerate("HOTEL"):
        add(f'<text x="{sx + sw / 2:.0f}" y="{top + 66 + i * 19:.0f}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="18" font-weight="bold" fill="#F6F1E6" opacity="0.95">{ch}</text>')
    bar = poly([(sx - 48, top + 26), (sx + sw + 26, top + 26), (sx + sw + 26, top + 44), (sx - 48, top + 44)])
    add(f'<path d="{bar}" fill="{PAPER}"/>'); wash(bar, "#1F1D21", 0.95, "wcs", g=True); ink(bar, 1.3, 0.9)
    add(f'<text x="{sx + sw / 2 - 6:.0f}" y="{top + 40:.0f}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="11.5" font-weight="bold" letter-spacing="0.6" fill="#F6F1E6" opacity="0.95">NORTHERN</text>')
    for k in range(3):
        add(f'<path d="M{sx - 45},{top + 31 + k * 4.5:.1f} L{sx - 37},{top + 31 + k * 4.5:.1f}" stroke="#F6F1E6" stroke-width="1.6" opacity="0.9"/>')
    return x + w

def storefront_beside(x):
    """The brick storefront beside the hotel: black sign board and awning, green gooseneck lamps."""
    w, h = 140, 116
    f = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(f, "#A8553D", 0.93, "wcs")
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.25, "wcs", g=True)
    coursing(x, B - h + 8, x + w, B - 64, step=10)
    wash(poly([(x - 3, B - h - 6), (x + w + 3, B - h - 6), (x + w + 3, B - h + 4), (x - 3, B - h + 4)]), "#6E3426", 0.7, "wcs", g=True)
    sb = poly([(x + 18, B - 92), (x + w - 18, B - 92), (x + w - 18, B - 72), (x + 18, B - 72)])
    wash(sb, "#252326", 0.92, "wcs"); ink(sb, 1.1, 0.8)
    for lx in range(int(x + 24), int(x + w - 20), 30):
        ink(f"M{lx},{B - 104} c0,-9 13,-9 13,1", 1.4, 0.9, color="#3E7A68")
        wash(f"M{lx + 13},{B - 104} l-6,7 l12,0 Z", "#3E7A68", 0.95, "wcs", g=True)
    aw = poly([(x + 4, B - 64), (x + w - 4, B - 64), (x + w + 4, B - 46), (x - 4, B - 46)])
    wash(aw, "#2E2C30", 0.92, "wcs"); ink(aw, 1.2, 0.8)
    wash(poly([(x + 10, B - 4), (x + 10, B - 42), (x + w - 10, B - 42), (x + w - 10, B - 4)]), "#5C6672", 0.6, "wcs", g=True)
    for px in range(int(x + 10), int(x + w - 9), 30):
        ink(line([(px, B - 42), (px, B - 4)]), 1.1, 0.75, color="#C9CFC9")
    ink(f, 2.0)
    return x + w

def star(cx, cy):
    pts = []
    for k in range(16):
        a = math.pi / 2 + k * math.pi / 8
        r = (24 if k % 4 == 0 else 14) if k % 2 == 0 else 5
        pts.append((cx + r * math.cos(a), cy - r * math.sin(a)))
    add(f'<path d="{poly(pts)}" fill="#F3F1EC"/>')
    wash(poly([(cx, cy)] + pts[0:9]), "#9097A3", 0.6, "wcs", g=True)
    ink(poly(pts), 1.4, 0.95)

def old_town_square(x):
    """The Old Town Square building: brick, a clipped tower with the square's emblem, a grey bay window, the star on its frame."""
    tw, sh, tp = 84, 198, 236
    bx, bw, bh = x + tw, 146, 172
    body = poly([(bx, B), (bx, B - bh), (bx + bw, B - bh), (bx + bw, B)])
    tower = poly([(x, B), (x, B - sh), (x + 18, B - tp), (x + tw - 18, B - tp), (x + tw, B - sh), (x + tw, B)])
    # The steel frame and the star, behind the tower's top.
    fr = [(x - 7, B - sh + 18), (x - 7, B - sh - 4), (x + 14, B - tp - 12), (x + tw - 14, B - tp - 12), (x + tw + 7, B - sh - 4), (x + tw + 7, B - sh + 18)]
    ink(line(fr), 2.2, 0.9, color="#4A4F56")
    ink(line([(x + tw + 7, B - sh + 14), (bx + 40, B - bh - 10), (bx + bw, B - bh - 10)]), 1.6, 0.8, color="#4A4F56")
    for k in range(5):
        ink(line([(bx + 48 + k * 24, B - bh - 10), (bx + 48 + k * 24, B - bh)]), 1.1, 0.7, color="#4A4F56")
    ink(line([(x + tw / 2, B - tp - 12), (x + tw / 2, B - tp - 36)]), 2.0, 0.9, color="#4A4F56")
    star(x + tw / 2, B - tp - 52)
    wash(body, "#9A4C3C", 0.93, "wcs")
    wash(tower, "#A5533F", 0.93, "wcs")
    wash(poly([(bx + bw * 0.68, B - bh), (bx + bw, B - bh), (bx + bw, B), (bx + bw * 0.68, B)]), STONE_D, 0.3, "wcs", g=True)
    wash(poly([(x + tw - 10, B - sh), (x + tw, B - sh), (x + tw, B), (x + tw - 10, B)]), STONE_D, 0.3, "wcs", g=True)
    coursing(bx, B - bh + 4, bx + bw, B - 58, step=9); coursing(x, B - sh + 4, x + tw, B - 58, step=9)
    ink(line([(x + 18, B - tp + 6), (x + tw - 18, B - tp + 6)]), 0.8, 0.45)
    # The emblem: a diamond with the gold mark.
    cx, cy, d = x + tw / 2, B - sh + 4, 22
    dm = poly([(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)])
    wash(dm, "#7E3A2C", 0.45, "wcs", g=True); ink(dm, 1.3, 0.85)
    mk = f"M{cx - 15},{cy + 7} C{cx - 6},{cy - 12} {cx + 9},{cy - 13} {cx + 16},{cy - 3} C{cx + 6},{cy - 4} {cx - 2},{cy + 2} {cx - 15},{cy + 7} Z"
    add(f'<path d="{mk}" fill="{PAPER}"/>'); wash(mk, "#E0AC3A", 0.95, "wcs", g=True); ink(mk, 0.9, 0.7)
    # The grey bay window up the tower.
    bwx0, bwx1 = x + 15, x + tw - 15
    bay = poly([(bwx0, B - 62), (bwx0, B - 180), (bwx1, B - 180), (bwx1, B - 62)])
    wash(bay, "#80828A", 0.92, "wcs")
    wash(poly([(bwx0 - 3, B - 186), (bwx1 + 3, B - 186), (bwx1 + 3, B - 178), (bwx0 - 3, B - 178)]), "#5E6068", 0.9, "wcs", g=True)
    for y0 in (B - 168, B - 116):
        g = poly([(bwx0 + 4, y0 + 34), (bwx0 + 4, y0), (bwx1 - 4, y0), (bwx1 - 4, y0 + 34)])
        wash(g, WIN, 0.85, "wcs", g=True)
        ink(g, 1.1, 0.8, color="#B9A27A")
        ink(line([((bwx0 + bwx1) / 2, y0), ((bwx0 + bwx1) / 2, y0 + 34)]), 1.0, 0.7, color="#B9A27A")
        ink(line([(bwx0 + 4, y0 + 17), (bwx1 - 4, y0 + 17)]), 0.9, 0.6, color="#B9A27A")
    ink(bay, 1.4, 0.8)
    # Arched black awnings at street level.
    for ax0, ax1 in [(x + 14, x + tw - 14), (bx + 12, bx + 54)]:
        r = (ax1 - ax0) / 2
        aw = f"M{ax0},{B - 32} L{ax0},{B - 46} a{r},{r * 0.75} 0 0,1 {2 * r},0 L{ax1},{B - 32} Z"
        wash(aw, "#262428", 0.92, "wcs"); ink(aw, 1.2, 0.8)
        wash(poly([(ax0 + 3, B - 2), (ax0 + 3, B - 30), (ax1 - 3, B - 30), (ax1 - 3, B - 2)]), "#4E5560", 0.65, "wcs", g=True)
    aw = poly([(bx + 66, B - 54), (bx + 136, B - 54), (bx + 142, B - 38), (bx + 60, B - 38)])
    wash(aw, "#36343A", 0.9, "wcs"); ink(aw, 1.2, 0.8)
    wash(poly([(bx + 68, B - 2), (bx + 68, B - 36), (bx + 134, B - 36), (bx + 134, B - 2)]), "#4E5560", 0.6, "wcs", g=True)
    # Windows with pale stone heads and sills.
    for wy in (B - 160, B - 112):
        add(f'<rect x="{bx + 12}" y="{wy - 4}" width="44" height="38" fill="{PAPER}"/>')
        wash(poly([(bx + 14, wy), (bx + 54, wy), (bx + 54, wy + 30), (bx + 14, wy + 30)]), WIN, 0.85, "wcs", g=True)
        ink(poly([(bx + 12, wy - 2), (bx + 56, wy - 2), (bx + 56, wy + 32), (bx + 12, wy + 32)]), 1.2, 0.75)
        ink(line([(bx + 34, wy), (bx + 34, wy + 30)]), 0.8, 0.5); ink(line([(bx + 14, wy + 14), (bx + 54, wy + 14)]), 0.8, 0.5)
        ink(line([(bx + 10, wy - 6), (bx + 58, wy - 6)]), 2.2, 0.75, color="#E9DFC8")
        for wx in (bx + 70, bx + 96, bx + 122):
            trimmed(wx, wy, 14, 30)
            ink(line([(wx - 4, wy - 6), (wx + 18, wy - 6)]), 2.2, 0.75, color="#E9DFC8")
    ink(body, 2.0); ink(tower, 2.0)
    return bx + bw

def opera_house(x):
    """The Opera House Block: buff brick, white terracotta pilasters and cornice, shopfronts framed in green tile."""
    w, h = 236, 160
    f = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(f, "#C99F78", 0.93, "wcs")
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.2, "wcs", g=True)
    coursing(x, B - h + 16, x + w, B - 62, step=8)
    def trim(pts):
        d = poly(pts); add(f'<path d="{d}" fill="{PAPER}"/>'); wash(d, "#E7E1D6", 0.6, "wcs", g=True); ink(d, 0.9, 0.6)
    trim([(x - 2, B - h - 14), (x + w + 2, B - h - 14), (x + w + 2, B - h - 6), (x - 2, B - h - 6)])
    trim([(x - 8, B - h - 6), (x + w + 8, B - h - 6), (x + w + 8, B - h + 6), (x - 8, B - h + 6)])
    for k in range(int(w / 9) + 2):
        ink(line([(x - 4 + k * 9, B - h + 6), (x - 4 + k * 9, B - h + 10)]), 1.0, 0.55)
    for px in (x, x + 75, x + 151, x + 226):
        trim([(px, B - h + 6), (px + 10, B - h + 6), (px + 10, B - 60), (px, B - 60)])
    trim([(x, B - 118), (x + w, B - 118), (x + w, B - 112), (x, B - 112)])
    trim([(x - 2, B - 64), (x + w + 2, B - 64), (x + w + 2, B - 56), (x - 2, B - 56)])
    for b0 in (x + 10, x + 85, x + 161):
        for i in range(3):
            trimmed(b0 + 8 + i * 20, B - h + 18, 10, 20)
        add(f'<rect x="{b0 + 6}" y="{B - 106}" width="54" height="38" fill="{PAPER}"/>')
        wash(poly([(b0 + 8, B - 104), (b0 + 58, B - 104), (b0 + 58, B - 72), (b0 + 8, B - 72)]), WIN, 0.85, "wcs", g=True)
        ink(poly([(b0 + 6, B - 106), (b0 + 60, B - 106), (b0 + 60, B - 70), (b0 + 6, B - 70)]), 1.2, 0.75)
        ink(line([(b0 + 24, B - 104), (b0 + 24, B - 72)]), 0.9, 0.55); ink(line([(b0 + 42, B - 104), (b0 + 42, B - 72)]), 0.9, 0.55)
        ink(line([(b0 + 8, B - 94), (b0 + 58, B - 94)]), 0.8, 0.45)
    gf = poly([(x + 4, B), (x + 4, B - 56), (x + w - 4, B - 56), (x + w - 4, B)])
    wash(gf, "#3A3F3E", 0.85, "wcs")
    for b0 in range(int(x + 8), int(x + w - 30), 44):
        tile = poly([(b0, B - 54), (b0 + 38, B - 54), (b0 + 38, B - 40), (b0, B - 40)])
        wash(tile, "#3E7E5E", 0.92, "wcs", g=True); ink(tile, 0.9, 0.7, color="#CFE0D4")
        wash(poly([(b0 + 2, B - 2), (b0 + 2, B - 36), (b0 + 36, B - 36), (b0 + 36, B - 2)]), "#7E8C94", 0.45, "wcs", g=True)
    ink(f, 2.0)
    return x + w

def freight_depot(x):
    """The C&S Freight Depot: red brick, a corbelled cornice, piers above the parapet, its dark sign, tall windows."""
    w, h = 172, 108
    dock = poly([(x + w, B), (x + w, B - 72), (x + w + 90, B - 72), (x + w + 90, B)])
    wash(dock, "#A9503A", 0.9, "wcs")
    wash(dock, "#6E6F8A", 0.25, "wcs", g=True)
    can = poly([(x + w - 4, B - 64), (x + w + 96, B - 58), (x + w + 96, B - 50), (x + w - 4, B - 56)])
    wash(can, "#8E4A36", 0.92, "wcs"); ink(can, 1.2, 0.8)
    for px in (x + w + 30, x + w + 66):
        wash(poly([(px, B - 4), (px, B - 46), (px + 24, B - 46), (px + 24, B - 4)]), "#3A3A40", 0.75, "wcs", g=True)
    ink(dock, 1.6, 0.8)
    f = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(f, "#B4503A", 0.93, "wcs")
    for px in (x, x + 76, x + w - 20):   # piers above the parapet
        p = poly([(px, B - h), (px, B - h - 14), (px + 20, B - h - 14), (px + 20, B - h)])
        wash(p, "#B4503A", 0.93, "wcs"); ink(p, 1.4, 0.8)
    wash(poly([(x + w * 0.7, B - h - 14), (x + w, B - h - 14), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.25, "wcs", g=True)
    coursing(x, B - h + 18, x + w, B - 24, step=9)
    corn = poly([(x - 6, B - h + 4), (x + w + 6, B - h + 4), (x + w + 6, B - h + 14), (x - 6, B - h + 14)])
    add(f'<path d="{corn}" fill="{PAPER}"/>'); wash(corn, "#D9C3A0", 0.8, "wcs", g=True); ink(corn, 1.1, 0.75)
    for k in range(int(w / 7) + 2):
        ink(line([(x - 3 + k * 7, B - h + 14), (x - 3 + k * 7, B - h + 19)]), 1.1, 0.6)
    sg = poly([(x + 10, B - 84), (x + 66, B - 84), (x + 66, B - 60), (x + 10, B - 60)])
    wash(sg, "#2C3340", 0.92, "wcs"); ink(sg, 1.1, 0.8)
    add(f'<text x="{x + 38}" y="{B - 74}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="9" font-weight="bold" fill="#E3D3A0">C &amp; S</text>')
    add(f'<text x="{x + 38}" y="{B - 64}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="6.5" font-weight="bold" fill="#E3D3A0">FREIGHT DEPOT</text>')
    wash(poly([(x + 46, B - 22), (x + 46, B - 54), (x + 64, B - 54), (x + 64, B - 22)]), "#3A3A40", 0.75, "wcs", g=True)
    for wx in (x + 84, x + 112, x + 140):
        trimmed(wx, B - 82, 14, 52)
        ink(line([(wx - 5, B - 88), (wx + 19, B - 88)]), 2.4, 0.75, color="#E3D7BE")
    for lx in (x + 20, x + 102, x + 156):   # green gooseneck lamps
        ink(f"M{lx},{B - 96} c0,-8 11,-8 11,1", 1.3, 0.9, color="#3E7A68")
        wash(f"M{lx + 11},{B - 96} l-5,6 l10,0 Z", "#3E7A68", 0.95, "wcs", g=True)
    wt = poly([(x - 2, B - 24), (x + w + 2, B - 24), (x + w + 2, B - 16), (x - 2, B - 16)])
    wash(wt, "#CDBB9A", 0.85, "wcs", g=True)
    ink(f, 2.0)
    return x + w + 90

def globe_lamp(x):
    ink(line([(x, B + 22), (x, B - 58)]), 2.2, 0.9, color="#2E2C2A")
    ink(line([(x - 9, B - 60), (x + 9, B - 60)]), 1.4, 0.85, color="#2E2C2A")
    for gx, gy in [(x - 9, B - 64), (x + 9, B - 64), (x, B - 72)]:
        add(f'<circle cx="{gx}" cy="{gy}" r="5.5" fill="#FBF8F0"/>')
        ink(f"M{gx - 5.5},{gy} a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0", 0.9, 0.7)

def umbrella(x, base):
    ink(line([(x, base), (x, base - 56)]), 1.6, 0.85)
    u = f"M{x - 36},{base - 42} Q{x - 18},{base - 62} {x},{base - 66} Q{x + 18},{base - 62} {x + 36},{base - 42} Z"
    wash(u, "#E0702C", 0.95, "wcs"); wash(f"M{x},{base - 66} Q{x + 18},{base - 62} {x + 36},{base - 42} L{x + 4},{base - 42} Z", "#A0401E", 0.35, "wcs", g=True); ink(u, 1.3, 0.8)
    for k in (-1, 1): ink(f"M{x},{base - 66} Q{x + k * 12},{base - 56} {x + k * 16},{base - 43}", 0.8, 0.5)

def planter(x, base):
    pot = f"M{x - 12},{base - 18} L{x + 12},{base - 18} L{x + 8},{base} L{x - 8},{base} Z"
    for c, dx, dy in [("#5E7A3E", 0, -26), ("#C8402E", -6, -28), ("#E2B92E", 6, -30), ("#8E5BB0", 0, -34)]:
        wash(blob(x + dx, base + dy, 9, 7), c, 0.85, "wcs", g=(c != "#5E7A3E"))
    wash(pot, "#C9A27A", 0.92, "wcs"); ink(pot, 1.1, 0.75)

xx = northern(1205) + 4
xx = storefront_beside(xx) + 30
ots0 = xx
xx = old_town_square(xx) + 14
op0 = xx
xx = opera_house(xx) + 20
dep0 = xx
freight_depot(xx)
wash(poly([(1170, B + 2), (2400, B + 2), (2400, B + 14), (1164, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for x in (op0 + 40, op0 + 196):
    globe_lamp(x)
for px in (ots0 + 26, ots0 + 220):
    planter(px, B + 20)
umbrella(ots0 + 112, B + 22); umbrella(ots0 + 178, B + 26)
for x, r in ((1150, 34), (ots0 - 15, 26), (dep0 - 6, 34)):
    cottonwood(x, B + 12, r)

# --- The ground in front: a pond as at Riverbend Ponds, still, with willows on
# its far bank and reeds on the near one, and a trail through the prairie
# grass as at Cathy Fromme Prairie.
INKSCALE = 1.1
wash("M0,742 C600,736 1400,746 2400,742 L2400,1000 L0,1000 Z", "#BCA35E", 0.9, "wc1")
wash("M1500,760 C1800,754 2100,760 2400,756 L2400,1000 L1500,1000 Z", "#8F7F5C", 0.25, "wc3", g=True)
pt = [(-20, 800), (220, 784), (520, 796), (820, 782), (1120, 790), (1420, 784), (1610, 800), (1720, 830)]
pb = [(1720, 830), (1712, 884), (1600, 906), (1300, 920), (900, 932), (500, 926), (100, 938), (-20, 936)]
pond_d = "M-20,800 " + smooth(pt) + " " + smooth(pb) + " Z"
wash(pond_d, "#6A98B8", 0.92, "wc3")
wash("M-20,820 C400,812 900,826 1400,818 C1560,816 1680,840 1716,860 C1600,904 1300,918 900,930 C500,924 100,936 -20,936 Z", "#3A6586", 0.42, "wc3", g=True)
wash("M-20,870 C300,862 600,874 900,870 C700,900 300,930 -20,936 Z", "#2F5574", 0.3, "wc3", g=True)
# The far bank: willow scrub going russet, and its reflection.
wash("M-20,800 " + smooth(pt) + " L1716,872 C1400,850 900,840 400,838 L-20,836 Z", "#4E5E44", 0.32, "wc3", g=True)   # the scrub in the water
x = -20
while x < 1660:   # and the gold of the cottonwoods behind it, broken by the ripples
    w = random.uniform(40, 90); y = interp(pt, x) + 30
    wash(blob(x + w / 2, y + random.uniform(6, 20), w / 2, random.uniform(8, 16)), random.choice(["#D6A23A", "#C9A040", "#B89A3E"]), 0.22, "wc3", g=True)
    x += w + random.uniform(10, 60)
for i in range(40):   # the sky in the water, and the light on it
    x = random.uniform(0, 1660); y = random.uniform(812, 904)
    if y > interp(sorted(pb), x) - 10: continue
    L = random.uniform(30, 90) * (0.6 if x < 900 else 1.0)
    add(f'<path d="M{x:.0f},{y:.0f} l{L:.0f},0" stroke="#F6F2E6" stroke-width="{random.uniform(1.4, 2.6):.1f}" stroke-linecap="round" opacity="{0.45 if x < 900 else 0.7}"/>')
scrub = [(x, interp(pt, min(x, 1716)) + 4) for x in range(-20, 1730, 12)]
stop = [(x, y - 16 - 18 * abs(math.sin(x / 71)) ** 2 - 9 * abs(math.sin(x / 23 + 1)) - random.uniform(0, 5)) for x, y in scrub]
wash(poly(stop + list(reversed(scrub))), "#8E844A", 0.9, "wcs")
for x0 in range(-20, 1720, 46):   # patches of russet, gold and olive in it
    w = random.uniform(30, 60); y = interp(pt, min(x0, 1716))
    wash(f"M{x0:.0f},{y + 2:.0f} C{x0 + w * 0.2:.0f},{y - 30:.0f} {x0 + w * 0.8:.0f},{y - 30:.0f} {x0 + w:.0f},{y + 2:.0f} Z", random.choice(["#A0623A", "#B5893E", "#7E7A44", "#C27A3A", "#6E7448"]), 0.55, "wcs", g=True)
for i in range(260):   # the willow wands
    x = random.uniform(-10, 1716); y = interp(pt, min(x, 1716)) + 4
    hgt = random.uniform(12, 34)
    ink(f"M{x:.0f},{y:.0f} q{jit(3):.1f},{-hgt * 0.5:.0f} {jit(7):.1f},{-hgt:.0f}", 0.9, 0.5, color=random.choice(["#5E4A2A", "#6E2E1E", "#4E5230"]))
ink(open_path(pt), 1.4, 0.5)
ink(open_path(pb), 1.6, 0.55)

# The trail, curving up out of the foreground toward town.
cl = [(1990, 1010), (1930, 960), (1862, 910), (1838, 860), (1852, 812), (1878, 776), (1890, 750)]
def tw(y): return 22 + (y - 750) * 0.5
def trail_x(y): return interp(sorted((cy, cx) for cx, cy in cl), y)
tl = [(x - tw(y) / 2, y) for x, y in cl]; tr = [(x + tw(y) / 2, y) for x, y in cl]
trail = "M" + f"{tl[0][0]:.1f},{tl[0][1]:.1f} " + smooth(tl) + f" L{tr[-1][0]:.1f},{tr[-1][1]:.1f} " + smooth(list(reversed(tr))) + " Z"
wash(trail, "#CDBBA6", 0.92, "wcs")
sh = [(x + tw(y) * 0.1, y) for x, y in cl]
wash("M" + f"{sh[0][0]:.1f},{sh[0][1]:.1f} " + smooth(sh) + f" L{tr[-1][0]:.1f},{tr[-1][1]:.1f} " + smooth(list(reversed(tr))) + " Z", "#8E7E86", 0.22, "wcs", g=True)
ink(open_path(tl), 1.5, 0.7); ink(open_path(tr), 1.5, 0.7)
for k in range(1, len(cl) - 1):   # joints in the concrete
    for f in (0.0, 0.5):
        if k + 1 >= len(cl): continue
        x = cl[k][0] + (cl[k + 1][0] - cl[k][0]) * f; y = cl[k][1] + (cl[k + 1][1] - cl[k][1]) * f
        ink(line([(x - tw(y) / 2 + 2, y + 1), (x + tw(y) / 2 - 2, y - 1)]), 0.9, 0.4)

# Reeds and cattails along the near bank, tall in the foreground.
wash("M-20,936 C400,924 900,936 1300,918 C1500,908 1650,892 1720,830 C1760,840 1780,860 1790,880 L1830,1000 L-20,1000 Z", "#8C8448", 0.55, "wc1", g=True)
wash("M0,958 C500,946 1200,960 1830,950 L1840,1000 L0,1000 Z", "#5E5A34", 0.4, "wc3", g=True)
def reed(x, base, hgt, col, cat=False):
    lean = jit(14)
    ink(f"M{x:.0f},{base:.0f} q{lean * 0.2:.1f},{-hgt * 0.5:.0f} {lean:.1f},{-hgt:.0f}", 1.3, 0.78, color=col)
    if cat:
        cx, cy = x + lean * 0.9, base - hgt * 0.86
        wash(blob(cx, cy, 3, 8.5), "#5E3A22", 0.92, "wcs", g=True)
        ink(line([(cx, cy - 10), (cx + lean * 0.05, cy - 22)]), 0.9, 0.7, color=col)
    elif random.random() < 0.4:   # a blade bent over
        ink(f"M{x + lean * 0.3:.0f},{base - hgt * 0.4:.0f} q{12 * (1 if lean > 0 else -1)},-14 {22 * (1 if lean > 0 else -1)},-4", 1.0, 0.6, color=col)
for i in range(560):
    x = random.uniform(-10, 1840); base = random.uniform(944, 1006)
    reed(x, base, random.uniform(34, 140), random.choice(["#55602A", "#6E7A36", "#8E8240", "#A8904E", "#7A5A2E"]), random.random() < 0.035)
for i in range(70):   # reeds at the water's right end
    x = random.uniform(1650, 1790); base = interp([(1650, 900), (1720, 880), (1790, 900)], x) + random.uniform(-4, 30)
    reed(x, base, random.uniform(30, 90), random.choice(["#55602A", "#6E7A36", "#8E8240"]), random.random() < 0.05)
# Prairie grass on either side of the trail, rabbitbrush, a cottonwood.
wash("M1760,800 C1800,790 1840,800 1850,812 C1830,860 1840,900 1900,940 C1820,960 1760,930 1740,880 Z", "#7E7246", 0.3, "wc3", g=True)
wash("M2050,780 C2200,770 2330,790 2400,786 L2400,880 C2250,870 2120,840 2050,820 Z", "#8F7F5C", 0.25, "wc3", g=True)
for i in range(16):   # rabbitbrush in clumps
    cx, cy = random.uniform(1760, 2380), random.uniform(770, 980)
    if abs(cx - trail_x(cy)) < tw(cy) / 2 + 24: continue
    sz = 0.7 + (cy - 750) * 0.004   # nearer is bigger
    d = " ".join(blob(cx + dx * sz, cy + dy * sz, r * sz, r * 0.7 * sz) for dx, dy, r in [(-9, 0, 9), (0, -5, 10), (9, 0, 8), (3, 3, 8)])
    wash(d, "#E6B834", 0.92, "wcs")
    wash(blob(cx + 2 * sz, cy + 4 * sz, 16 * sz, 4 * sz), "#7E8A6A", 0.5, "wcs", g=True)
    for k in range(int(4 + 4 * sz)):
        ink(line([(cx + jit(12 * sz), cy + 7 * sz), (cx + jit(14 * sz), cy - 2 * sz)]), 0.8, 0.45, color="#5E6A4E")
for i in range(700):
    y = random.uniform(752, 1000); x = random.uniform(1700, 2400)
    if abs(x - trail_x(y)) < tw(y) / 2 + 2: continue
    L = 8 + (y - 750) * 0.14
    ink(f"M{x:.0f},{y + L:.0f} q{jit(3):.1f},{-L * 0.5:.1f} {jit(6):.1f},{-L:.1f}", 1.0, 0.42, color=random.choice([INK, "#6E5A30", "#8E7A40"]))
wash("M2000,1000 C2100,940 2250,910 2400,900 L2400,1000 Z", "#8F7F5C", 0.3, "wc3", g=True)
cottonwood(2140, 800, 30)
cottonwood(2336, 968, 82)
for i in range(60):
    x = random.uniform(1990, 2400); y = random.uniform(930, 1000)
    reed(x, y + 10, random.uniform(30, 80), random.choice(["#8E8240", "#A8904E", "#7A5A2E"]))

finish(sys.argv[1])
