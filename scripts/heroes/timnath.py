"""Timnath hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Old Town on its rise above the Cache la Poudre on an autumn morning. On Main
Street: the 1888 Presbyterian church, cream with a fish-scale gable, the
pink fan and round window, the shingled porch over its arched fanlight and
oak doors, the white belfry and brown spire, and the tall pine beside it
(the guide's photo of the church); the one-storey buff-brick corner building
with its corbelled band, gooseneck lamp and white door, the shade trees, the
white building with the garage door and the two-storey red-brick block with
its awning further down (the guide's photo of Old Town). The river comes
out of a corridor of gold cottonwoods, bends toward us and runs off to the
right below the town, with a split-rail fence and tall grass on the near
bank (the guide's river-trail photo, and the row of cottonwoods over water
in its sunrise photo); it stands for the Poudre in general, not one spot on
it. The fields and the low foothills on the horizon are generic, kept hazy
as the guide's Fossil Creek photo shows them. The grain elevator and the
reservoir are not drawn: the guide has no photograph of either.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(11)

sky()
for cx, cy, s in [(330, 140, 60), (1010, 96, 44), (1660, 150, 68), (2240, 112, 46), (1300, 300, 32), (560, 318, 28)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1880, 262, 11), (1916, 248, 9), (1952, 270, 10), (1990, 256, 8)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The foothills west of town, low and hazy: a rounded summit with a long
# shoulder falling north, and a farther ridge behind (generic, after the
# guide's Fossil Creek photo).
INKSCALE = 0.55
far = [(0, 452), (180, 444), (380, 440), (560, 428), (760, 436), (980, 424), (1200, 434), (1420, 426), (1640, 438), (1860, 430), (2100, 440), (2400, 432)]
wash(ridge_d(far), "#B3B3CF", 0.75, "wc3")
ink(open_path(far), 1.2, 0.4)
near = [(0, 470), (120, 452), (260, 428), (360, 418), (440, 420), (560, 438), (720, 456), (900, 468), (1100, 476), (1300, 472), (1500, 480),
        (1700, 470), (1900, 478), (2100, 468), (2400, 476)]
wash(ridge_d(near), "#8E9AB4", 0.8, "wc3")
wash(f"M440,420 {smooth([(440, 420), (560, 438), (720, 456), (900, 468), (1040, 476)])} C900,488 700,482 560,456 C500,444 460,430 440,420 Z", "#7F7699", 0.18, "wc3", g=True)   # the shoulder in shade
ink(open_path(near), 1.4, 0.5)

# --- Farm country between the river and the hills.
INKSCALE = 0.85
plains = [(0, 488), (700, 494), (1400, 486), (2400, 492)]
wash(ridge_d(plains), "#CDB86C", 0.88, "wc3")
for x in range(-20, 2440, 28):   # tree lines along the ditches
    y = interp(plains, x) + 6 + jit(3); r = random.uniform(9, 15)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#7E8F4E", "#A39A45", "#D6A63C", "#7E8F4E"]), 0.85, "wcs")
for y0, col in [(532, "#A3A35C"), (590, "#D3BC70")]:   # a last green field of alfalfa, then stubble
    wash(f"M0,{y0} C600,{y0 - 8} 1400,{y0 + 6} 2400,{y0 - 6} L2400,{y0 + 44} C1400,{y0 + 54} 600,{y0 + 40} 0,{y0 + 48} Z", col, 0.4, "wc3", g=True)
for i in range(36):
    x = random.uniform(0, 2400); y = random.uniform(512, 620)
    ink(line([(x, y), (x + random.uniform(60, 150), y + jit(2))]), 0.8, 0.22)

# --- The river's corridor of cottonwoods, gold with a few still green.
def green_cottonwood(x, base, r):
    cottonwood(x, base, r, back=True, shadow=False)
    blobs = [(-0.4, -1.0, 0.5), (0.3, -1.25, 0.45)]
    wash(" ".join(f"M{x + dx * r - rr * r:.1f},{base + dy * r:.1f} a{rr * r:.1f},{rr * r:.1f} 0 1,0 {2 * rr * r:.1f},0 a{rr * r:.1f},{rr * r:.1f} 0 1,0 {-2 * rr * r:.1f},0 Z" for dx, dy, rr in blobs), "#7E8F4E", 0.5, "wcs", g=True)
for x in range(-40, 1240, 64):
    xx = x + jit(14); r = random.uniform(40, 56)
    if random.random() < 0.2: green_cottonwood(xx, 636 + jit(8), r)
    else: cottonwood(xx, 636 + jit(8), r, back=True, shadow=False)

# --- The river: out of the cottonwoods, toward us, then away to the right
# along the foot of the rise that Old Town stands on.
far_e = [(792, 648), (880, 684), (1010, 730), (1200, 784), (1500, 818), (1900, 838), (2400, 850)]
near_e = [(768, 648), (812, 690), (836, 750), (820, 820), (808, 890), (880, 952), (1160, 978), (1600, 976), (2000, 962), (2400, 948)]
def ex(e, y):   # x on an edge at height y, along its first, falling run
    for (x1, y1), (x2, y2) in zip(e, e[1:]):
        if y1 <= y <= y2 and y2 > y1: return x1 + (x2 - x1) * (y - y1) / (y2 - y1)
    return e[-1][0]
river_d = open_path(far_e) + f" L{near_e[-1][0]},{near_e[-1][1]} " + smooth(list(reversed(near_e))) + " Z"
INKSCALE = 1.0
wash(river_d, "#7FA9C4", 0.92, "wc3")
add(f'<clipPath id="riv"><path d="{river_d}"/></clipPath><g clip-path="url(#riv)">')
wash(open_path(far_e) + " " + " ".join(f"L{x:.0f},{y + 18 + (x - 792) * 0.004:.0f}" for x, y in reversed(far_e)) + " Z", "#9C8A58", 0.34, "wc2", g=True)   # the bank, reflected
for x0, w in [(1120, 50), (1640, 70), (2120, 60)]:   # the willows, reflected
    y0 = interp(far_e, x0 + w / 2) + 4
    wash(f"M{x0:.0f},{y0:.0f} C{x0 + w * 0.2:.0f},{y0 + 30:.0f} {x0 + w * 0.8:.0f},{y0 + 30:.0f} {x0 + w:.0f},{y0:.0f} Z", "#B5553A", 0.3, "wc2", g=True)
wash("M820,1000 C900,940 1100,930 1400,940 C1800,952 2100,930 2400,920 L2400,1000 Z", "#4F7C9A", 0.38, "wc3", g=True)   # deeper water near us
wash("M900,860 C1000,850 1200,856 1400,876 C1300,890 1100,892 960,884 Z", "#C9DDE8", 0.45, "wc3", g=True)   # the sky in the water
add('</g>')
for i in range(46):   # slow ripples, left as paper
    x = random.uniform(860, 2380); yt, yb = interp(far_e, x), interp(near_e[4:], x) if x > 880 else 900
    y = yt + (yb - yt) * random.uniform(0.25, 0.9); L = 24 + (y - 800) * 0.25
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-3 {L:.0f},0" stroke="#F6F1E6" stroke-width="{1.4 + (y - 800) / 120:.1f}" fill="none" stroke-linecap="round" opacity="0.7"/>')

# --- The near bank: dry grass on the left with cottonwoods, the split-rail
# fence and tall grass (after the trail photo), and a fringe along the bottom.
INKSCALE = 1.1
wash(f"M0,648 L{near_e[0][0]},{near_e[0][1]} " + smooth(near_e) + " L2400,1000 L0,1000 Z", "#BFA45E", 0.9, "wc1")
wash("M0,780 C300,790 600,820 820,860 L860,1000 L0,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for i in range(170):
    y = random.uniform(660, 995); xr_ = ex(near_e, min(y, 940)) - 14
    x = random.uniform(0, max(10, xr_))
    L = random.uniform(10, 26) * (0.6 + (y - 660) / 600)
    ink(line([(x, y + L), (x + jit(6), y)]), 1.0, 0.42)
for i in range(30):   # rabbitbrush in the grass
    x = random.uniform(20, 760); y = random.uniform(700, 800)
    if x > ex(near_e, y) - 20: continue
    wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", random.choice(["#C9A43A", "#9DA58A"]), 0.7, "wcs", g=True)
def split_rail(posts, rails):
    for px, top, bot, wpost in posts:
        wash(poly([(px - wpost / 2, bot), (px - wpost / 2 + 2, top), (px + wpost / 2 - 1, top - 2), (px + wpost / 2, bot)]), "#7A6A58", 0.95, "wcs")
        wash(poly([(px + wpost * 0.1, bot), (px + wpost * 0.1, top), (px + wpost / 2, top), (px + wpost / 2, bot)]), "#3F362E", 0.35, "wcs", g=True)
        ink(poly([(px - wpost / 2, bot), (px - wpost / 2 + 2, top), (px + wpost / 2 - 1, top - 2), (px + wpost / 2, bot)]), 1.6, 0.85)
        for k in range(4):
            ink(line([(px - wpost / 3 + k * wpost / 5, top + 6), (px - wpost / 3 + k * wpost / 5 + jit(1), bot - 6)]), 0.7, 0.35)
    for (x0, y0), (x1, y1), th in rails:
        d = poly([(x0, y0 - th / 2), (x1, y1 - th / 2), (x1, y1 + th / 2), (x0, y0 + th / 2)])
        wash(d, "#857462", 0.95, "wcs")
        wash(poly([(x0, y0 + th * 0.1), (x1, y1 + th * 0.1), (x1, y1 + th / 2), (x0, y0 + th / 2)]), "#3F362E", 0.35, "wcs", g=True)
        ink(line([(x0, y0 - th / 2), (x1, y1 - th / 2)]), 1.5, 0.8); ink(line([(x0, y0 + th / 2), (x1, y1 + th / 2)]), 1.3, 0.75)
        n = max(1, int(abs(x1 - x0) / 30))
        for k in range(n):   # the grain of the wood
            gx = x0 + (k + 0.5) * (x1 - x0) / n; sl = (y1 - y0) / (x1 - x0)
            gy = y0 + (gx - x0) * sl
            ink(line([(gx, gy + jit(2)), (gx + 18, gy + sl * 18 + jit(2))]), 0.7, 0.35)
for x, base, r in [(640, 704, 44), (726, 692, 34), (300, 716, 40)]:
    cottonwood(x, base, r)
split_rail([(70, 834, 966, 16), (372, 806, 1000, 28)],
           [((-10, 852), (362, 836), 14), ((-10, 904), (362, 892), 15), ((-10, 956), (362, 950), 17)])
for i in range(80):   # tall grass in front of the fence
    x = random.uniform(-10, 640); base = random.uniform(960, 1010); hgt = random.uniform(70, 200); lean = jit(18)
    ink(f"M{x:.0f},{base:.0f} q{lean * 0.3:.0f},{-hgt * 0.5:.0f} {lean:.0f},{-hgt:.0f}", random.uniform(0.9, 1.4), 0.55, color=random.choice(["#6E5A3A", "#8A7448", "#5E5236"]))
for i in range(22):
    x = random.uniform(0, 640); y = random.uniform(812, 900)
    wash(f"M{x - 3:.0f},{y:.0f} a3,12 0 1,0 6,0 a3,12 0 1,0 -6,0 Z", "#9C8250", 0.7, "wcs", g=True)
for i in range(170):   # the fringe of grass along the near edge of the water
    x = random.uniform(800, 2400); base = random.uniform(interp(near_e[4:], x) + 6, 1008); hgt = random.uniform(16, 60); lean = jit(10)
    ink(f"M{x:.0f},{base:.0f} q{lean * 0.3:.0f},{-hgt * 0.5:.0f} {lean:.0f},{-hgt:.0f}", 1.1, 0.5, color=random.choice(["#6E5A3A", "#8A7448", "#5E5236"]))

# --- The rise below Old Town, falling to the water.
bluff_top = [(950, 666), (1100, 694), (1200, 712), (2400, 712)]
wash(open_path(far_e) + " L2400,712 " + " ".join(f"L{x},{y}" for x, y in reversed(bluff_top[:-1])) + " Z", "#CDB46C", 0.9, "wc1")
wash(open_path([(1010, 730), (1200, 784), (1500, 818), (1900, 838), (2400, 850)]) + " L2400,812 C1900,800 1500,784 1200,758 L1040,722 Z", "#7E7398", 0.26, "wc3", g=True)   # the bank's shade above the water
for i in range(150):
    x = random.uniform(1000, 2400); y = random.uniform(746, interp(far_e, x) - 6)
    if y < 746: continue
    ink(line([(x, y + 12), (x + jit(5), y)]), 0.9, 0.4)
for i in range(26):
    x = random.uniform(1100, 2400); y = random.uniform(754, interp(far_e, x) - 14)
    if y < 754: continue
    wash(f"M{x - 9:.0f},{y:.0f} a9,5 0 1,0 18,0 a9,5 0 1,0 -18,0 Z", random.choice(["#E2B92E", "#E2B92E", "#9A7BC0"]), 0.75, "wcs", g=True)
def willows(x, base, w):
    wands = []
    for k in range(int(w / 7)):
        sx = x + k * 7 + jit(3); hgt = random.uniform(30, 58); lean = jit(8)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.1, 0.75, color="#6E2418")
        wands.append(f"M{sx + lean * 0.6 - 5:.0f},{base - hgt * 0.62:.0f} a5,{hgt * 0.38:.0f} 0 1,0 10,0 a5,{hgt * 0.38:.0f} 0 1,0 -10,0 Z")
    d = " ".join(wands)
    wash(d, "#C24A2C", 0.8, "wcs"); wash(d, "#E8A23E", 0.3, "wcs", g=True)
for x, w in [(1120, 50), (1640, 70), (2120, 60), (850, 36)]:
    willows(x, interp(far_e, x) + 4, w)
INKSCALE = 1.0
ink(open_path(far_e), 1.6, 0.6)   # the water's edges, over both banks
ink(open_path(near_e), 1.6, 0.6)

# --- Old Town, base at y 712, right of the type on a desktop.
for x in range(1180, 2460, 118):
    cottonwood(x + jit(26), 640 + jit(10), random.uniform(58, 76), back=True, shadow=False)
B = 712
TS = 1.08
add(f'<g transform="translate({1200 * (1 - TS):.1f} {(B + 30) * (1 - TS):.1f}) scale({TS})">')
wash(poly([(1190, B - 4), (2400, B - 4), (2400, B + 30), (1170, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and Main Street
ink(line([(1170, B + 30), (2400, B + 30)]), 1.4, 0.55)
ink(line([(1190, B + 18), (2400, B + 18)]), 1.6, 0.5, color="#C9A23A")   # the yellow centre line

CREAM, CREAM_D, SHINGLE, SHINGLE_D = "#E6DDC6", "#9C9278", "#8E6C52", "#5E4434"
def tall_pine(x, base, h):
    """The tall, open pine beside the church: a long trunk, lumpy masses of needles on short boughs."""
    top = base - h
    ink(f"M{x},{base} C{x + 4},{base - h * 0.4} {x - 4},{base - h * 0.7} {x + 1},{top}", 3.2, 0.85)
    masses = [(0.97, 2, 16), (0.91, -11, 22), (0.85, 13, 23), (0.78, -17, 28), (0.72, 17, 27), (0.65, -13, 30), (0.59, 19, 27), (0.52, -7, 24), (0.46, 13, 18)]
    blobs = []
    for fy, dx, rw in masses:
        cy = base - h * fy
        ink(line([(x, cy + 8), (x + dx * 0.9, cy + 2)]), 1.2, 0.7)
        for j in range(5):
            rx = rw * random.uniform(0.45, 0.72)
            blobs.append((x + dx + jit(rw * 0.5), cy + jit(rw * 0.26), rx, rx * 0.66))
    d = " ".join(f"M{cx - rx:.1f},{cy:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z" for cx, cy, rx, ry in blobs)
    wash(d, "#33533D", 0.92, "wcs")
    wash(" ".join(f"M{cx - rx * 0.7:.1f},{cy - ry * 0.4:.1f} a{rx * 0.7:.1f},{ry * 0.4:.1f} 0 1,0 {rx * 1.4:.1f},0 a{rx * 0.7:.1f},{ry * 0.4:.1f} 0 1,0 {-rx * 1.4:.1f},0 Z" for cx, cy, rx, ry in blobs[::3]), "#6F8F5A", 0.5, "wcs", g=True)
    wash(" ".join(f"M{cx - rx * 0.8:.1f},{cy + ry * 0.5:.1f} a{rx * 0.8:.1f},{ry * 0.35:.1f} 0 1,0 {rx * 1.6:.1f},0 a{rx * 0.8:.1f},{ry * 0.35:.1f} 0 1,0 {-rx * 1.6:.1f},0 Z" for cx, cy, rx, ry in blobs[1::3]), "#1F3428", 0.4, "wcs", g=True)

def church(x):
    """The 1888 Presbyterian church: its gable end to the street, the nave behind to the left."""
    w, h, gh = 130, 96, 90
    peak = (x + w / 2, B - h - gh)
    # The nave's side wall and roof, receding to the left.
    sx = x - 78
    side = poly([(sx, B), (sx, B - h + 10), (x, B - h), (x, B)])
    wash(side, CREAM, 0.92, "wcs")
    wash(side, "#8C8AA0", 0.22, "wcs", g=True)
    roof = poly([(sx - 8, B - h + 12), (x - 6, B - h + 2), (peak[0], peak[1]), (peak[0] - 82, peak[1] + 12)])
    wash(roof, SHINGLE, 0.92, "wcs")
    for k in range(1, 9):   # courses of shingles
        t = k / 9
        ink(line([(sx - 8 + (peak[0] - 82 - sx + 8) * t, B - h + 12 + (peak[1] + 12 - B + h - 12) * t), (x - 6 + (peak[0] - x + 6) * t, B - h + 2 + (peak[1] - B + h - 2) * t)]), 0.7, 0.35)
    ink(roof, 1.6, 0.8); ink(side, 1.6, 0.8)
    lx = sx + 30   # a lancet window in the side wall
    lw = f"M{lx},{B - 18} L{lx},{B - 56} Q{lx},{B - 70} {lx + 8},{B - 76} Q{lx + 16},{B - 70} {lx + 16},{B - 56} L{lx + 16},{B - 18} Z"
    wash(lw, "#4E5A6E", 0.85, "wcs", g=True); ink(lw, 1.2, 0.7)
    # The front: cream stucco below, fish-scale shingles in the gable.
    front = poly([(x, B), (x, B - h), peak, (x + w, B - h), (x + w, B)])
    wash(front, CREAM, 0.94, "wcs")
    wash(poly([(x + w * 0.7, B - h + 4), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), "#8C8AA0", 0.2, "wcs", g=True)
    gable = poly([(x + 2, B - h), peak, (x + w - 2, B - h)])
    add(f'<clipPath id="gab"><path d="{gable}"/></clipPath><g clip-path="url(#gab)">')
    for row, y in enumerate(range(int(peak[1]) + 8, B - h, 7)):
        for sx_ in range(int(x) - 6 + (row % 2) * 5, int(x + w) + 6, 10):
            ink(f"M{sx_},{y} a5,5 0 0,0 10,0", 0.6, 0.32)
    add('</g>')
    ink(line([(x - 4, B - h), (x + w + 4, B - h)]), 1.6, 0.8)   # the band at the eaves
    ink(line([(x - 4, B - h + 6), (x + w + 4, B - h + 6)]), 1.0, 0.5)
    # The inner gablet, the pink fan, the window and the round window.
    cx = peak[0]
    ink(line([(cx - 26, B - h - 18), (cx, peak[1] + 22), (cx + 26, B - h - 18)]), 1.3, 0.7)
    ink(line([(cx - 26, B - h - 18), (cx - 26, B - h)]), 1.0, 0.55); ink(line([(cx + 26, B - h - 18), (cx + 26, B - h)]), 1.0, 0.55)
    fy = peak[1] + 50
    wash(f"M{cx - 13},{fy} a13,13 0 0,1 26,0 Z", "#D98A86", 0.9, "wcs", g=True)
    for k in range(5):
        a = math.pi * (k + 1) / 6
        ink(line([(cx, fy), (cx - 12 * math.cos(a), fy - 12 * math.sin(a))]), 0.6, 0.4)
    ink(f"M{cx - 13},{fy} a13,13 0 0,1 26,0 Z", 1.0, 0.6)
    trimmed(cx - 10, fy + 4, 20, 14, "#5A6678")
    add(f'<circle cx="{cx}" cy="{fy + 36}" r="13" fill="{PAPER}"/>')
    wash(f"M{cx - 11},{fy + 36} a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0 Z", "#3F6A8A", 0.88, "wcs", g=True)
    ink(f"M{cx - 13},{fy + 36} a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0 Z", 1.3, 0.75)
    ink(f"M{cx - 6},{fy + 30} q8,4 4,12", 0.8, 0.5, color="#F2EBDD")
    # A lancet window low on the front, left of the porch.
    lx = x + 14
    lw = f"M{lx},{B - 16} L{lx},{B - 50} Q{lx},{B - 62} {lx + 7},{B - 68} Q{lx + 14},{B - 62} {lx + 14},{B - 50} L{lx + 14},{B - 16} Z"
    wash(lw, "#4E5A6E", 0.85, "wcs", g=True); ink(lw, 1.2, 0.7)
    ink(front, 2.0)
    ink(line([(x - 10, B - h + 8), peak, (x + w + 10, B - h + 8)]), 2.2, 0.9)   # barge boards
    # The porch: a shingled gable over the arched fanlight and the oak doors.
    p0, p1 = x + w * 0.34, x + w * 0.92; pc = (p0 + p1) / 2
    wash(poly([(p0 + 4, B), (p0 + 4, B - 50), (p1 - 4, B - 50), (p1 - 4, B)]), CREAM, 0.95, "wcs")
    wash(poly([(p0 - 8, B - 46), (pc, B - 88), (p1 + 8, B - 46), (p1 - 4, B - 46), (pc, B - 74), (p0 + 4, B - 46)]), SHINGLE, 0.95, "wcs")
    ink(poly([(p0 - 8, B - 46), (pc, B - 88), (p1 + 8, B - 46), (p1 - 4, B - 46), (pc, B - 74), (p0 + 4, B - 46)]), 1.4, 0.85)
    ink(line([(p0 + 4, B), (p0 + 4, B - 46)]), 1.4, 0.8); ink(line([(p1 - 4, B), (p1 - 4, B - 46)]), 1.4, 0.8)
    wash(f"M{pc - 13},{B - 44} a13,13 0 0,1 26,0 Z", "#3F6A8A", 0.85, "wcs", g=True)   # the fanlight
    ink(f"M{pc - 16},{B - 44} a16,16 0 0,1 32,0", 1.4, 0.8); ink(f"M{pc - 13},{B - 44} a13,13 0 0,1 26,0", 0.9, 0.55)
    wash(poly([(pc - 13, B), (pc - 13, B - 42), (pc + 13, B - 42), (pc + 13, B)]), "#C99A52", 0.92, "wcs", g=True)
    ink(poly([(pc - 13, B), (pc - 13, B - 42), (pc + 13, B - 42), (pc + 13, B)]), 1.3, 0.8)
    ink(line([(pc, B - 42), (pc, B)]), 0.9, 0.6)
    for dx in (-8, 4):
        ink(poly([(pc + dx, B - 36), (pc + dx + 4, B - 36), (pc + dx + 4, B - 22), (pc + dx, B - 22)]), 0.7, 0.5)
    # The belfry on the ridge: white, open, a bell inside, a brown shingled spire.
    bw = 34; bx = cx - bw / 2
    base_top, stage_top = peak[1] - 16, peak[1] - 50
    wash(poly([(bx, peak[1] + 14), (bx, base_top), (bx + bw, base_top), (bx + bw, peak[1] + 14)]), CREAM, 0.95, "wcs")
    for y in range(int(base_top) + 4, int(peak[1]) + 12, 5):
        ink(line([(bx + 2, y), (bx + bw - 2, y)]), 0.5, 0.3)
    wash(poly([(bx - 3, base_top + 2), (bx - 3, stage_top), (bx + bw + 3, stage_top), (bx + bw + 3, base_top + 2)]), "#F2ECDF", 0.95, "wcs")
    for ox in (bx + 3, bx + bw / 2 + 2):
        op = f"M{ox},{base_top - 2} L{ox},{stage_top + 14} a6,6 0 0,1 {bw / 2 - 5},0 L{ox + bw / 2 - 5},{base_top - 2} Z"
        wash(op, "#4A4752", 0.75, "wcs", g=True); ink(op, 0.9, 0.6)
    wash(f"M{cx - 6},{base_top - 6} q0,-14 6,-14 q6,0 6,14 Z", "#8A6A3A", 0.9, "wcs", g=True)   # the bell
    ink(poly([(bx - 3, base_top + 2), (bx - 3, stage_top), (bx + bw + 3, stage_top), (bx + bw + 3, base_top + 2)]), 1.4, 0.85)
    ink(line([(bx - 5, base_top + 2), (bx + bw + 5, base_top + 2)]), 1.4, 0.8)
    spire = poly([(bx - 9, stage_top + 4), (bx - 2, stage_top - 4), (cx, stage_top - 66), (bx + bw + 2, stage_top - 4), (bx + bw + 9, stage_top + 4)])
    wash(spire, SHINGLE, 0.95, "wcs")
    wash(poly([(cx, stage_top - 66), (bx + bw + 2, stage_top - 4), (bx + bw + 9, stage_top + 4), (cx + 4, stage_top + 4)]), SHINGLE_D, 0.45, "wcs", g=True)
    for k in range(1, 7):
        t = k / 7; yy = stage_top - 66 + 70 * t
        ink(line([(cx - (bw / 2 + 2) * t, yy), (cx + (bw / 2 + 2) * t, yy)]), 0.6, 0.35)
    ink(spire, 1.6, 0.9)
    ink(line([(cx, stage_top - 66), (cx, stage_top - 80)]), 1.4, 0.85)
    # The blue railings by the steps.
    for r0, r1 in [(x + 8, p0 - 2), (p1 + 2, x + w + 22)]:
        ink(line([(r0, B - 14), (r1, B - 14)]), 1.4, 0.85, color="#5C97C4")
        for rx in (r0, (r0 + r1) / 2, r1):
            ink(line([(rx, B - 14), (rx, B + 2)]), 1.2, 0.85, color="#5C97C4")
    # The church's sign on the lawn.
    sgx = x + w + 30
    ink(line([(sgx + 14, B + 8), (sgx + 14, B - 26)]), 2.4, 0.9, color="#2A2E44")
    wash(poly([(sgx, B - 26), (sgx, B - 52), (sgx + 30, B - 52), (sgx + 30, B - 26)]), "#2F3A5E", 0.95, "wcs")
    ink(poly([(sgx, B - 26), (sgx, B - 52), (sgx + 30, B - 52), (sgx + 30, B - 26)]), 1.2, 0.8)
    for k in range(3):
        ink(line([(sgx + 5, B - 46 + k * 7), (sgx + 25 - (k % 2) * 4, B - 46 + k * 7)]), 0.8, 0.8, color="#EDE8DA")
    return x + w

BUFF, BUFF_D, BRICK_R = "#D8BB8A", "#8C5A3C", "#9A5238"
def corner_block(x):
    """The one-storey buff-brick corner building: dark parapet, corbelled band, red-brown string courses."""
    w, h = 184, 112
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(wall, BUFF, 0.94, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.18, "wcs", g=True)
    coursing(x, B - h + 40, x + w, B - 6, step=8)
    wash(poly([(x - 3, B - h - 6), (x + w + 3, B - h - 6), (x + w + 3, B - h + 4), (x - 3, B - h + 4)]), "#6E5038", 0.85, "wcs", g=True)
    wash(poly([(x, B - h + 14), (x + w, B - h + 14), (x + w, B - h + 26), (x, B - h + 26)]), BRICK_R, 0.35, "wcs", g=True)
    for dx in range(int(x) + 4, int(x + w) - 6, 11):   # the corbelled dentils
        add(f'<rect x="{dx}" y="{B - h + 16}" width="6" height="8" fill="#F0E2C4" opacity="0.85"/>')
        ink(poly([(dx, B - h + 16), (dx + 6, B - h + 16), (dx + 6, B - h + 24), (dx, B - h + 24)]), 0.6, 0.45)
    wash(poly([(x, B - h + 34), (x + w, B - h + 34), (x + w, B - h + 38), (x, B - h + 38)]), BRICK_R, 0.75, "wcs", g=True)   # the one string course
    ink(wall, 2.0)
    ink(line([(x - 3, B - h - 6), (x + w + 3, B - h - 6)]), 1.6, 0.85)
    # The big window, in a red-brown brick surround with a stone sill.
    wx0, wx1, wy0, wy1 = x + 20, x + 96, B - h + 56, B - 18
    wash(poly([(wx0 - 6, wy1), (wx0 - 6, wy0 - 6), (wx1 + 6, wy0 - 6), (wx1 + 6, wy1)]), BRICK_R, 0.85, "wcs", g=True)
    add(f'<rect x="{wx0}" y="{wy0}" width="{wx1 - wx0}" height="{wy1 - wy0}" fill="{PAPER}"/>')
    wash(poly([(wx0 + 4, wy0 + 4), (wx1 - 4, wy0 + 4), (wx1 - 4, wy0 + 14), (wx0 + 4, wy0 + 14)]), "#5A6678", 0.75, "wcs", g=True)
    wash(poly([(wx0 + 4, wy0 + 20), (wx1 - 4, wy0 + 20), (wx1 - 4, wy1 - 4), (wx0 + 4, wy1 - 4)]), "#5A6678", 0.6, "wcs", g=True)
    add(f'<rect x="{wx0 + 14}" y="{wy0 + 26}" width="{wx1 - wx0 - 28}" height="{wy1 - wy0 - 34}" fill="#F4EEE2" opacity="0.9"/>')   # the notice in the window
    for k in range(3):
        ink(line([(wx0 + 20, wy0 + 32 + k * 6), (wx1 - 20 - (k % 2) * 6, wy0 + 32 + k * 6)]), 0.6, 0.45)
    ink(poly([(wx0, wy1), (wx0, wy0), (wx1, wy0), (wx1, wy1)]), 1.3, 0.8)
    ink(line([(wx0, wy0 + 17), (wx1, wy0 + 17)]), 1.0, 0.7)
    wash(poly([(wx0 - 8, wy1), (wx1 + 8, wy1), (wx1 + 8, wy1 + 5), (wx0 - 8, wy1 + 5)]), "#E8DCC4", 0.9, "wcs")
    ink(line([(wx0 - 8, wy1 + 5), (wx1 + 8, wy1 + 5)]), 1.0, 0.6)
    # The white door with its transom, and the green gooseneck lamp over it.
    dx0, dx1 = x + w - 62, x + w - 22
    wash(poly([(dx0 - 5, B), (dx0 - 5, wy0 - 6), (dx1 + 5, wy0 - 6), (dx1 + 5, B)]), BRICK_R, 0.85, "wcs", g=True)
    add(f'<rect x="{dx0}" y="{wy0}" width="{dx1 - dx0}" height="{B - wy0}" fill="#F6F2EA"/>')
    wash(poly([(dx0 + 4, wy0 + 4), (dx1 - 4, wy0 + 4), (dx1 - 4, wy0 + 12), (dx0 + 4, wy0 + 12)]), "#5A6678", 0.7, "wcs", g=True)
    wash(poly([(dx0 + 10, wy0 + 20), (dx1 - 10, wy0 + 20), (dx1 - 10, B - 20), (dx0 + 10, B - 20)]), "#4A4F5E", 0.8, "wcs", g=True)
    ink(poly([(dx0, B), (dx0, wy0), (dx1, wy0), (dx1, B)]), 1.3, 0.8)
    ink(line([(dx0, wy0 + 15), (dx1, wy0 + 15)]), 1.0, 0.7)
    lx, ly = dx0 - 4, wy0 - 22
    ink(f"M{lx},{ly + 14} C{lx + 4},{ly - 6} {lx + 26},{ly - 8} {lx + 30},{ly + 4}", 1.6, 0.9, color="#2F5A45")
    wash(f"M{lx + 22},{ly + 12} a8,7 0 0,1 16,0 Z", "#3F6E58", 0.95, "wcs")
    ink(f"M{lx + 22},{ly + 12} a8,7 0 0,1 16,0 Z", 1.1, 0.85)
    ink(line([(lx - 6, ly + 10), (lx - 6, ly - 8)]), 0.8, 0.5)   # the conduit up the wall
    wash(poly([(x, B - 6), (x + w, B - 6), (x + w, B), (x, B)]), "#8E7A62", 0.4, "wcs", g=True)   # the plinth
    return x + w

def garage(x):
    """The white-painted building with the wide garage door, further down Main Street."""
    w, h = 168, 88
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    add(f'<path d="{wall}" fill="{PAPER}"/>')
    wash(wall, "#E9E6E0", 0.85, "wcs", g=True)
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), "#8C8AA0", 0.18, "wcs", g=True)
    wash(poly([(x - 2, B - h - 5), (x + w + 2, B - h - 5), (x + w + 2, B - h + 3), (x - 2, B - h + 3)]), "#7A746C", 0.8, "wcs", g=True)
    gx0, gx1, gy0 = x + 14, x + 112, B - 70
    wash(poly([(gx0, B), (gx0, gy0), (gx1, gy0), (gx1, B)]), "#F1EEE8", 0.9, "wcs", g=True)
    for k in range(1, 5):
        ink(line([(gx0 + 2, gy0 + k * 14), (gx1 - 2, gy0 + k * 14)]), 0.7, 0.45)
    for k in range(5):   # the row of little windows in the door
        trimmed(gx0 + 8 + k * 19, gy0 + 18, 10, 7, "#3E3B46")
    ink(poly([(gx0, B), (gx0, gy0), (gx1, gy0), (gx1, B)]), 1.4, 0.8)
    trimmed(x + 128, B - 62, 22, 48, "#5A6678")   # the side door
    ink(wall, 1.8)
    ink(line([(x - 2, B - h - 5), (x + w + 2, B - h - 5)]), 1.4, 0.8)
    return x + w

def red_block(x):
    """The two-storey red-brick block down the street, white trim at the upper windows, an awning below."""
    w, h = 132, 168
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(wall, "#B4503A", 0.93, "wcs")
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.25, "wcs", g=True)
    coursing(x, B - h + 14, x + w, B - 56, step=10)
    wash(poly([(x - 4, B - h - 10), (x + w + 4, B - h - 10), (x + w + 4, B - h + 6), (x - 4, B - h + 6)]), "#5C3A2E", 0.8, "wcs", g=True)
    for dx in range(int(x) + 2, int(x + w) - 4, 9):
        add(f'<rect x="{dx}" y="{B - h + 8}" width="5" height="5" fill="#F2E8D6" opacity="0.8"/>')
    for wy in (B - h + 26, B - h + 76):
        for k in range(3):
            wx = x + 16 + k * 38
            add(f'<path d="M{wx - 5},{wy + 40} L{wx - 5},{wy + 2} a15,8 0 0,1 30,0 L{wx + 25},{wy + 40} Z" fill="#F4EEE2"/>')
            wash(poly([(wx, wy + 36), (wx, wy + 6), (wx + 20, wy + 6), (wx + 20, wy + 36)]), WIN, 0.85, "wcs", g=True)
            ink(f"M{wx - 5},{wy + 40} L{wx - 5},{wy + 2} a15,8 0 0,1 30,0 L{wx + 25},{wy + 40} Z", 1.1, 0.7)
            ink(line([(wx + 10, wy + 6), (wx + 10, wy + 36)]), 0.7, 0.5)
    ink(wall, 2.0)
    ink(line([(x - 4, B - h - 10), (x + w + 4, B - h - 10)]), 1.4, 0.8)
    wash(poly([(x + 8, B - 4), (x + 8, B - 40), (x + w - 8, B - 40), (x + w - 8, B - 4)]), "#5C5560", 0.6, "wcs", g=True)
    aw = poly([(x + 4, B - 54), (x + w - 4, B - 54), (x + w + 4, B - 34), (x - 4, B - 34)])
    wash(aw, "#D9C3A0", 0.95, "wcs")
    wash(poly([(x - 4, B - 38), (x + w + 4, B - 38), (x + w + 4, B - 34), (x - 4, B - 34)]), "#8E7A62", 0.5, "wcs", g=True)
    ink(aw, 1.3, 0.8)
    return x + w

INKSCALE = 1.0
tall_pine(1236, B + 6, 318)
xx = church(1316)
cottonwood(1538, B + 10, 40)
xx = corner_block(1584) + 30
xx = garage(xx + 34)
cottonwood(1806, B + 12, 42)
xx = red_block(xx + 58)
wash(poly([(1190, B + 2), (2400, B + 2), (2406, B + 12), (1184, B + 12)]), "#7E7398", 0.4, "wcs", g=True)
for x in (2262, 2366):
    cottonwood(x, B + 12, 46)
add('</g>')

finish(sys.argv[1])
