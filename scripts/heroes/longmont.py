"""Longmont hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Longmont on an autumn morning. Behind everything, Longs Peak and Mount
Meeker, the peaks the town was named for, with their first snow: the
skyline and the layered blue foothills are traced from the guide's photo
across McIntosh Lake (hero.jpg). McIntosh Lake fills the left, the peaks'
reflection in it as in mcintosh-lake-sunrise.jpg, with the dry cattails of
its marsh in front (hero.jpg). Downtown on the right, along Main Street:
buff- and red-brick storefronts with a blue awning and globe lamps
(main-street-near-fifth-avenue.jpg); the red-brick neighbour with its
arched window and corbelled brick, and the 1881 Dickens Opera House with
its black bracketed cornice, gold rosettes and lettered pediment, cream
window hoods and striped awnings (dickens-opera-house.jpg); across the
intersection, the three-storey red-brick block with its arched windows,
iron balcony and sandstone base (main-street-at-third-avenue.jpg). At the
right, Left Hand Brewing's wood-sided tasting room and its three white
silos (left-hand-brewing-tasting-room.jpg). A composition, not a view.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(14)

# --- Sky.
sky()
for cx, cy, s in [(240, 130, 58), (800, 100, 44), (1460, 140, 66), (2130, 110, 54), (1980, 286, 30), (430, 300, 28)]:
    cloud(cx, cy, s)
for bx, by, bs in [(560, 236, 11), (598, 222, 8), (636, 248, 9)]:   # geese over the lake
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The range, traced from hero.jpg (photo x, y mapped into the picture):
# Mount Meeker the left summit, Longs Peak the right, its shoulder beyond.
def M(pts, k=1.1): return [(560 + (x - 560) * 1.05, 330 + (y - 158) * k) for x, y in pts]
def peaks_d(pts, base=H):   # straight runs between the traced points, so the summits stay sharp
    return f"M{pts[0][0]:.1f},{base} L" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f" L{pts[-1][0]:.1f},{base} Z"
INKSCALE = 0.55
far = M([(-40, 262), (0, 262), (60, 256), (150, 250), (210, 246), (260, 250), (330, 246), (420, 252), (480, 266), (550, 272), (600, 262),
         (650, 255), (700, 248), (760, 238), (778, 231), (800, 238), (860, 214), (900, 200), (940, 184), (980, 164), (1000, 166),
         (1025, 172), (1050, 163), (1065, 159), (1080, 165), (1100, 184), (1120, 196), (1140, 206), (1180, 199), (1205, 195),
         (1250, 210), (1300, 226), (1350, 240), (1400, 242), (1460, 247), (1540, 250), (1600, 247), (1700, 232), (1760, 220),
         (1800, 212), (1850, 216), (1900, 205)], k=1.3) + [(2060, 402), (2160, 394), (2260, 408), (2440, 400)]
wash(peaks_d(far), "#A3A9CA", 0.8, "wc3")
for a, b in [(1090, 1169), (1237, 1505), (1967, 2160)]:   # the faces away from the morning sun
    pts = [(x, interp(far, x)) for x in range(a, b + 1, 6)]
    wash(poly(pts + [(b, interp(far, b) + 26), (a + (b - a) * 0.5, 492), (a + (b - a) * 0.3, 492)]), "#7F7699", 0.22, "wc3", g=True)
# First snow above a ragged line, left as paper, with tongues down the gullies
# and a cool shadow on the side of each summit away from the sun.
def snowline(x): return 380 + 6 * math.sin(x / 37.0) + 4 * math.sin(x / 11.0)
segs, cur = [], []
for x in range(700, 1760, 6):
    if interp(far, x) < snowline(x) - 4: cur.append(x)
    elif cur: segs.append(cur); cur = []
if cur: segs.append(cur)
snow = []
for seg in segs:
    top = [(x, interp(far, x)) for x in seg]
    off = [random.uniform(-4, 4) for x in seg]
    for k in range(len(seg) // 7):   # gullies holding snow below the line
        c = random.randrange(2, max(3, len(seg) - 2)); dep = random.uniform(10, 26)
        for dk, f in [(-2, 0.3), (-1, 0.7), (0, 1.0), (1, 0.6), (2, 0.25)]:
            if 0 <= c + dk < len(seg): off[c + dk] += dep * f
    bot = [(x, max(snowline(x) + o, interp(far, x) + 3)) for x, o in zip(seg, off)]
    snow.append(poly(top + list(reversed(bot))))
add(f'<clipPath id="snowc"><path d="{" ".join(snow)}"/></clipPath>')
for d in snow:
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.92" filter="url(#wcs)"/>')
add('<g clip-path="url(#snowc)">')
for sx, sy, ex in [(1001, 338, 1034), (1090, 331, 1169), (1237, 378, 1300)]:
    pts = [(x, interp(far, x) - 4) for x in range(sx, ex + 1, 4)]
    wash(poly(pts + [(ex, 430), (sx + (ex - sx) * 0.35, 430), (sx, sy)]), "#9AA3C6", 0.5, "wcs", g=True)
wash(" ".join(snow), "#B9B4D0", 0.12, "wcs", g=True)
add('</g>')
for i in range(16):   # rock ribs down the snow
    x = random.uniform(950, 1240); y0 = interp(far, x) + random.uniform(6, 16)
    if y0 < snowline(x) - 8: ink(line([(x, y0), (x + jit(6), min(snowline(x), y0 + random.uniform(12, 28)))]), 0.9, 0.28)
ink(line(far), 1.4, 0.55)

# Foothills in layers, as the photo has them.
foot1 = M([(-40, 300), (0, 300), (150, 290), (300, 296), (450, 300), (560, 298), (700, 300), (800, 296), (900, 298), (1000, 300),
           (1100, 302), (1200, 300), (1300, 305), (1400, 296), (1500, 290), (1600, 276), (1700, 266), (1800, 262), (1900, 268)]) + [(2080, 452), (2240, 462), (2440, 454)]
wash(ridge_d(foot1), "#8495AE", 0.82, "wc3")
ink(open_path(foot1), 1.3, 0.45)
foot2 = M([(-40, 346), (0, 345), (200, 336), (400, 350), (600, 352), (800, 344), (1000, 350), (1200, 345), (1260, 336), (1300, 333),
           (1350, 338), (1450, 350), (1600, 341), (1800, 334), (1900, 340)]) + [(2080, 530), (2240, 524), (2440, 532)]
wash(ridge_d(foot2), "#A8A07C", 0.88, "wc1")
for i in range(60):   # timber on the foothills
    x = random.uniform(0, 2400); y = interp(foot2, x) + random.uniform(4, 26)
    r = random.uniform(8, 18)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.45:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.45:.0f} 0 1,0 {-2 * r:.0f},0 Z", "#5F7466", 0.45, "wcs", g=True)
ink(open_path(foot2), 1.5, 0.55)

# --- The plains, a far tree line, and the trees along the lake's far shore.
INKSCALE = 0.85
plains = [(0, 556), (600, 560), (1200, 554), (1800, 560), (2400, 556)]
wash(ridge_d(plains), "#CDB86C", 0.88, "wc3")
for x in range(-20, 2440, 26):
    y = interp(plains, x) + 6 + jit(3); r = random.uniform(9, 15)
    col = random.choice(["#7E8F4E", "#A39A45", "#D6A63C", "#7E8F4E"])
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", col, 0.85, "wcs")
wash("M0,596 C500,590 900,600 1240,594 L1240,630 C900,636 500,628 0,634 Z", "#9FA35C", 0.35, "wc3", g=True)   # the green of the fields by the shore
for x in range(-30, 1200, 64):
    cottonwood(x + jit(14), 646 + jit(4), random.uniform(28, 40), back=True, shadow=False)

# --- Gold trees behind downtown.
for x in range(1250, 2200, 118):
    cottonwood(x + jit(24), 626 + jit(8), random.uniform(56, 72), back=True, shadow=False)
for x in (2250, 2350):
    cottonwood(x, 632, 46, back=True, shadow=False)

# --- McIntosh Lake.
INKSCALE = 1.0
lake = "M-20,646 C300,640 700,650 1000,646 C1100,644 1170,652 1200,670 C1236,692 1232,732 1182,758 C1080,804 900,830 700,850 C450,874 200,896 -20,910 Z"
wash(lake, "#6F9DBE", 0.92, "wc3")
wash("M-20,700 C400,690 800,700 1180,690 C1200,720 1160,750 1100,772 C800,820 400,860 -20,880 Z", "#4F7C9A", 0.32, "wc3", g=True)
add(f'<clipPath id="lk"><path d="{lake}"/></clipPath>')
add('<g clip-path="url(#lk)">')
wash("M-20,650 C300,646 700,654 1190,656 L1196,676 C800,680 400,676 -20,680 Z", "#E2B55A", 0.3, "wc2", g=True)   # the shore trees' gold in the water
# The scene upside down in the still water, squeezed, softer and cooler:
# the foothills as a blue band, and the peaks below them where they rise clear.
def R(y): return 652 + (652 - y) * 0.45
wash(poly([(x, R(556)) for x in range(-20, 1221, 40)] + [(x, R(interp(foot1, x))) for x in range(1220, -21, -20)]), "#7F90AA", 0.3, "wc3", g=True)
xs = [x for x in range(740, 1240, 6) if interp(far, x) < interp(foot1, x) - 2]
if xs:
    wash(poly([(x, R(interp(foot1, x))) for x in xs] + [(x, R(interp(far, x))) for x in reversed(xs)]), "#8C8FB8", 0.55, "wc3", g=True)
xs = [x for x in range(940, 1240, 6) if interp(far, x) < snowline(x) - 4]
if xs:
    wash(poly([(x, R(snowline(x))) for x in xs] + [(x, R(interp(far, x))) for x in reversed(xs)]), "#E4E2EE", 0.5, "wcs", g=True)
for i in range(64):   # ripples left as paper
    x = random.uniform(-10, 1180); top = 660; bot = interp([(-20, 900), (400, 866), (800, 838), (1000, 812), (1180, 740)], x) - 8
    if bot <= top: continue
    y = random.uniform(top, bot); L = random.uniform(30, 90)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-4 {L:.0f},0" stroke="#FBF7EE" stroke-width="{random.uniform(2, 3.5):.1f}" fill="none" stroke-linecap="round" opacity="0.72"/>')
    if random.random() < 0.3: ink(f"M{x + 6:.0f},{y + 5:.0f} q{L / 3:.0f},-3 {L * 0.6:.0f},0", 0.9, 0.35)
add('</g>')
ink("M-20,646 C300,640 700,650 1000,646 C1100,644 1170,652 1200,670 C1236,692 1232,732 1182,758", 1.6, 0.6)

# --- Main Street, base at y 712.
B = 712
wash(poly([(1230, B - 4), (2400, B - 4), (2400, B + 30), (1214, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1214, B + 30), (2400, B + 30)]), 1.4, 0.55)
BLACK, GOLD, CREAM = "#2E2A2E", "#C9A23A", "#EFE3CA"

def globe_lamp(lx, top=74):
    ink(line([(lx, B + 24), (lx, B - top)]), 2.4, 0.9, color=BLACK)
    add(f'<circle cx="{lx}" cy="{B - top - 8}" r="8" fill="#FBF7EE" opacity="0.95"/>')
    ink(f"M{lx - 8},{B - top - 8} a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", 1.2, 0.8)
    ink(line([(lx - 5, B - top), (lx + 5, B - top)]), 2.0, 0.9, color=BLACK)

def buff_block(x):
    """Buff brick, two storeys, tall windows framed in red-brown under cream lintels, a dark awning."""
    w, h = 150, 168
    top = B - h
    wash(poly([(x, B), (x, top), (x + w, top), (x + w, B)]), "#D8BA8C", 0.93, "wcs")
    wash(poly([(x + w * 0.72, top), (x + w, top), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.18, "wcs", g=True)
    coursing(x, top + 18, x + w, B - 70, step=10)
    wash(poly([(x - 4, top - 4), (x + w + 4, top - 4), (x + w + 4, top + 12), (x - 4, top + 12)]), "#B89A70", 0.85, "wcs", g=True)
    for k in range(int((w - 10) / 9)):
        ink(line([(x + 6 + k * 9, top + 12), (x + 6 + k * 9, top + 17)]), 0.9, 0.5)
    for px in (x + 4, x + w / 2 - 3, x + w - 10):   # pilasters
        ink(line([(px, top + 16), (px, B - 72)]), 0.9, 0.35); ink(line([(px + 6, top + 16), (px + 6, B - 72)]), 0.9, 0.35)
    for wx in (x + 18, x + 62, x + 106):
        wash(poly([(wx - 6, top + 30), (wx + 32, top + 30), (wx + 32, top + 37), (wx - 6, top + 37)]), CREAM, 0.95, "wcs")
        add(f'<rect x="{wx - 2}" y="{top + 39}" width="30" height="50" fill="{PAPER}"/>')
        wash(poly([(wx, top + 87), (wx, top + 41), (wx + 26, top + 41), (wx + 26, top + 87)]), WIN, 0.85, "wcs", g=True)
        ink(poly([(wx - 2, top + 89), (wx - 2, top + 39), (wx + 28, top + 39), (wx + 28, top + 89)]), 1.6, 0.85, color="#8A3B2C")
        ink(line([(wx, top + 62), (wx + 26, top + 62)]), 0.9, 0.6, color="#8A3B2C")
        ink(poly([(wx - 6, top + 30), (wx + 32, top + 30), (wx + 32, top + 37), (wx - 6, top + 37)]), 1.0, 0.6)
    wash(poly([(x + 8, B - 4), (x + 8, B - 48), (x + w - 8, B - 48), (x + w - 8, B - 4)]), "#5C5560", 0.65, "wcs", g=True)
    aw = [(x + 6, B - 70), (x + w - 6, B - 70), (x + w + 2, B - 50), (x - 2, B - 50)]
    wash(poly(aw), "#3E3532", 0.92, "wcs"); ink(poly(aw), 1.3, 0.75)
    ink(poly([(x, B), (x, top), (x + w, top), (x + w, B)]), 2.0)
    return x + w

def arched_neighbour(x):
    """The red-brick block beside the Dickens: corbelled brick bands, one tall arched window in green, a red fascia."""
    w, h = 108, 188
    top = B - h
    wash(poly([(x, B), (x, top), (x + w, top), (x + w, B)]), "#C46446", 0.93, "wcs")
    wash(poly([(x + w * 0.72, top), (x + w, top), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.2, "wcs", g=True)
    coursing(x, top + 6, x + w, B - 84, step=10)
    for yy in (top + 18, top + 44):   # corbelled zigzag bands
        ink(line([(x + 4 + k * 8, yy + (5 if k % 2 else 0)) for k in range(int((w - 8) / 8) + 1)]), 1.1, 0.6)
        ink(line([(x + 3, yy - 4), (x + w - 3, yy - 4)]), 0.8, 0.45)
    wash(poly([(x + 14, top + 26), (x + 34, top + 26), (x + 34, top + 36), (x + 14, top + 36)]), "#8E4632", 0.5, "wcs", g=True)   # the little plaque
    ax, aw_, ay = x + w / 2 - 14, 28, B - 92
    arch = f"M{ax},{ay} L{ax},{ay - 52} a{aw_ / 2},{aw_ / 2} 0 0,1 {aw_},0 L{ax + aw_},{ay} Z"
    add(f'<path d="{arch}" fill="{PAPER}"/>')
    wash(arch, "#D9C8C6", 0.7, "wcs", g=True)
    ink(arch, 2.2, 0.9, color="#4F6B55")
    ink(line([(ax, ay - 34), (ax + aw_, ay - 34)]), 1.4, 0.85, color="#4F6B55"); ink(line([(ax + aw_ / 2, ay - 66), (ax + aw_ / 2, ay)]), 1.0, 0.7, color="#4F6B55")
    wash(poly([(x - 2, B - 86), (x + w + 2, B - 86), (x + w + 2, B - 80), (x - 2, B - 80)]), CREAM, 0.95, "wcs")
    wash(poly([(x, B - 76), (x + w, B - 76), (x + w, B - 52), (x, B - 52)]), "#8E2E24", 0.9, "wcs", g=True)
    wash(poly([(x + 8, B - 4), (x + 8, B - 50), (x + w - 8, B - 50), (x + w - 8, B - 4)]), "#5C5560", 0.65, "wcs", g=True)
    for px in (x + 30, x + 64):
        ink(line([(px, B - 50), (px, B - 4)]), 1.4, 0.7, color=BLACK)
    ink(poly([(x, B), (x, top), (x + w, top), (x + w, B)]), 2.0)
    return x + w

def dickens(x):
    """The Dickens Opera House, 1881: red brick; a black bracketed cornice with gold rosettes, 1881 at
    its centre and a pediment lettered DICKENS; cream hoods over three pairs of tall windows; a black
    cast-iron storefront under two striped awnings."""
    w, h = 240, 178
    top = B - h; cx = x + w / 2
    wash(poly([(x, B), (x, top), (x + w, top), (x + w, B)]), "#C2664A", 0.93, "wcs")
    wash(poly([(x + w * 0.74, top), (x + w, top), (x + w, B), (x + w * 0.74, B)]), STONE_D, 0.2, "wcs", g=True)
    coursing(x, top + 32, x + w, B - 80, step=10)
    for k in range(1, 3):   # the pilaster strips between the bays
        px = x + w * k / 3
        ink(line([(px - 4, top + 34), (px - 4, B - 82)]), 0.8, 0.4); ink(line([(px + 4, top + 34), (px + 4, B - 82)]), 0.8, 0.4)
    for k in range(3):
        bc = x + w * (k + 0.5) / 3
        hood = [(bc - 34, B - 132), (bc - 34, B - 138)]
        for wx in (bc - 23, bc + 5):
            hood += [(wx - 4, B - 138), (wx + 9, B - 147), (wx + 22, B - 138)]
        hood += [(bc + 34, B - 138), (bc + 34, B - 132)]
        for wx in (bc - 23, bc + 5):
            add(f'<rect x="{wx - 2}" y="{B - 130}" width="22" height="52" fill="{PAPER}"/>')
            wash(poly([(wx, B - 80), (wx, B - 128), (wx + 18, B - 128), (wx + 18, B - 80)]), WIN, 0.88, "wcs", g=True)
            ink(poly([(wx - 2, B - 78), (wx - 2, B - 130), (wx + 20, B - 130), (wx + 20, B - 78)]), 1.5, 0.9, color=BLACK)
            ink(line([(wx, B - 112), (wx + 18, B - 112)]), 0.9, 0.6, color=BLACK)
        add(f'<path d="{poly(hood)}" fill="{PAPER}"/>')
        wash(poly(hood), CREAM, 0.95, "wcs", g=True)
        ink(poly(hood), 1.1, 0.6)
    # The cream sill course, and the cast-iron storefront below it.
    wash(poly([(x, B - 82), (x + w, B - 82), (x + w, B - 76), (x, B - 76)]), CREAM, 0.95, "wcs")
    ink(line([(x, B - 82), (x + w, B - 82)]), 0.9, 0.5)
    wash(poly([(x - 3, B - 76), (x + w + 3, B - 76), (x + w + 3, B - 66), (x - 3, B - 66)]), BLACK, 0.92, "wcs")
    wash(poly([(x + 6, B - 4), (x + 6, B - 64), (x + w - 6, B - 64), (x + w - 6, B - 4)]), "#4A4752", 0.7, "wcs", g=True)
    for px in (x, x + w / 2 - 5, x + w - 10):
        wash(poly([(px, B), (px, B - 66), (px + 10, B - 66), (px + 10, B)]), BLACK, 0.92, "wcs")
    for x0, x1 in [(x + 12, x + w / 2 - 9), (x + w / 2 + 9, x + w - 12)]:
        aw = [(x0 + 4, B - 64), (x1 - 4, B - 64), (x1 + 3, B - 38), (x0 - 3, B - 38)]
        wash(poly(aw), "#EADCC4", 0.95, "wcs")
        for sx in range(int(x0), int(x1) - 3, 8):
            t0 = (sx - x0) / (x1 - x0); t1 = (sx + 4 - x0) / (x1 - x0)
            bx0 = x0 - 3 + t0 * (x1 - x0 + 6); bx1 = x0 - 3 + t1 * (x1 - x0 + 6)
            wash(poly([(sx, B - 64), (sx + 4, B - 64), (bx1, B - 38), (bx0, B - 38)]), "#6E4A3C", 0.85, "wcs", g=True)
        ink(poly(aw), 1.3, 0.8)
    # The cornice: a crown with modillions, a frieze of gold rosettes, brackets, and 1881 at the centre.
    wash(poly([(x - 8, top - 2), (x + w + 8, top - 2), (x + w + 8, top + 28), (x - 8, top + 28)]), BLACK, 0.95, "wcs")
    for k in range(int((w + 10) / 8)):
        ink(line([(x - 4 + k * 8, top + 7), (x - 4 + k * 8, top + 11)]), 1.1, 0.45, color="#8E8478")
    ink(line([(x - 8, top + 6), (x + w + 8, top + 6)]), 0.9, 0.5, color="#8E8478")
    for k in range(int(w / 12)):
        rx = x + 12 + k * 12
        if abs(rx - cx) < 22 or any(abs(rx - bx) < 7 for bx in (x + 2, x + w / 3, x + 2 * w / 3, x + w - 2)): continue
        add(f'<circle cx="{rx:.0f}" cy="{top + 19}" r="2.6" fill="{GOLD}" opacity="0.95"/>')
    for bx in (x + 2, x + w / 3, x + 2 * w / 3, x + w - 2):   # brackets
        wash(poly([(bx - 4, top + 6), (bx + 4, top + 6), (bx + 4, top + 32), (bx, top + 38), (bx - 4, top + 32)]), "#1E1B1F", 0.95, "wcs")
    add(f'<text x="{cx:.0f}" y="{top + 23}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="11" font-weight="bold" fill="{GOLD}" opacity="0.95">1881</text>')
    ped = [(cx - 60, top - 2), (cx, top - 36), (cx + 60, top - 2)]
    wash(poly(ped), BLACK, 0.95, "wcs")
    ink(line(ped), 1.6, 0.85)
    ink(line([(cx - 48, top - 6), (cx, top - 29), (cx + 48, top - 6)]), 0.9, 0.5, color="#8E8478")
    add(f'<text x="{cx:.0f}" y="{top - 8}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="13" font-weight="bold" letter-spacing="0.5" fill="{GOLD}" opacity="0.95">DICKENS</text>')
    ink(poly([(x, B), (x, top + 28), (x + w, top + 28), (x + w, B)]), 2.0)
    ink(line([(x - 8, top - 2), (x + w + 8, top - 2), (x + w + 8, top + 28), (x - 8, top + 28), (x - 8, top - 2)]), 1.4, 0.75)
    return x + w

def third_avenue_block(x):
    """The three-storey red-brick block across the intersection: a chamfered corner with an arched door,
    round-arched windows under pale brick hoods, an iron balcony, a black cornice and a sandstone base."""
    cw, nb, h = 32, 6, 200
    w = nb * 32 + 10
    top = B - h; fx = x + cw
    def arched(wx, wy, ww=14, wh=30):
        d = f"M{wx},{wy + wh} L{wx},{wy + ww / 2} a{ww / 2},{ww / 2} 0 0,1 {ww},0 L{wx + ww},{wy + wh} Z"
        add(f'<path d="M{wx - 3},{wy + wh + 2} L{wx - 3},{wy + ww / 2} a{ww / 2 + 3},{ww / 2 + 3} 0 0,1 {ww + 6},0 L{wx + ww + 3},{wy + wh + 2} Z" fill="{PAPER}"/>')
        wash(d, WIN, 0.88, "wcs", g=True)
        ink(f"M{wx - 3},{wy + ww / 2 + 1} a{ww / 2 + 3},{ww / 2 + 3} 0 0,1 {ww + 6},0", 3.2, 0.9, color="#E7D3B4")
        ink(f"M{wx - 5},{wy + ww / 2 + 1} a{ww / 2 + 5},{ww / 2 + 5} 0 0,1 {ww + 10},0", 0.9, 0.6)
        ink(d, 1.1, 0.75)
    # The corner face, turned toward the light, and the long front.
    wash(poly([(x, B), (x, top + 4), (fx, top), (fx, B)]), "#C66A4A", 0.93, "wcs")
    wash(poly([(fx, B), (fx, top), (x + cw + w, top), (x + cw + w, B)]), "#B9583C", 0.93, "wcs")
    wash(poly([(x + cw + w * 0.74, top), (x + cw + w, top), (x + cw + w, B), (x + cw + w * 0.74, B)]), STONE_D, 0.2, "wcs", g=True)
    coursing(x, top + 14, x + cw + w, B - 24, step=10)
    # Sandstone base with its steps.
    wash(poly([(x - 2, B), (x - 2, B - 24), (x + cw + w + 2, B - 24), (x + cw + w + 2, B)]), "#CDBB98", 0.95, "wcs")
    for yy in (B - 16, B - 8):
        ink(line([(x, yy), (x + cw + w, yy)]), 0.7, 0.35)
    for k in range(int((cw + w) / 22)):
        ink(line([(x + 10 + k * 22 + (6 if k % 2 else 0), B - 24), (x + 10 + k * 22 + (6 if k % 2 else 0), B - 16)]), 0.7, 0.35)
    # Windows: arched on every floor, the corner door below the corner window.
    for wy in (top + 26, top + 80):
        arched(x + 9, wy, 14, 30)
        for k in range(nb):
            arched(fx + 14 + k * 32, wy, 14, 30)
    arched(x + 8, B - 76, 16, 52)   # the arched corner door
    wash(f"M{x + 8},{B - 24} L{x + 8},{B - 68} a8,8 0 0,1 16,0 L{x + 24},{B - 24} Z", "#3A3236", 0.6, "wcs", g=True)
    for k in range(nb):
        arched(fx + 14 + k * 32, B - 76, 14, 44)
    # The iron balcony along the second floor.
    ink(line([(x - 4, B - 88), (x + cw + w + 4, B - 88)]), 2.6, 0.9, color=BLACK)
    ink(line([(x - 2, B - 100), (x + cw + w + 2, B - 100)]), 1.2, 0.85, color=BLACK)
    for bx in range(int(x), int(x + cw + w), 6):
        ink(line([(bx, B - 100), (bx, B - 88)]), 0.6, 0.5, color=BLACK)
    # The cornice.
    wash(poly([(x - 6, top - 6), (fx, top - 10), (x + cw + w + 6, top - 10), (x + cw + w + 6, top + 8), (fx, top + 8), (x - 6, top + 12)]), BLACK, 0.95, "wcs")
    for k in range(int((cw + w) / 8)):
        ink(line([(x - 2 + k * 8, top + 8), (x - 2 + k * 8, top + 13)]), 1.0, 0.55, color=BLACK)
    ink(poly([(x, B), (x, top + 4), (fx, top), (x + cw + w, top), (x + cw + w, B)]), 2.0)
    ink(line([(fx, top), (fx, B)]), 1.4, 0.7)
    return x + cw + w

def corner_signal(px):
    """The corner pole: a street light on a curved arm and a signal head."""
    ink(line([(px, B + 24), (px, B - 196)]), 3.0, 0.92, color=BLACK)
    ink(f"M{px},{B - 196} q0,-18 22,-24 q14,-4 26,0", 2.2, 0.9, color=BLACK)
    wash(f"M{px + 40},{B - 222} l18,0 l-3,7 l-12,0 Z", "#6E6A72", 0.9, "wcs")
    sig = poly([(px - 18, B - 136), (px - 6, B - 136), (px - 6, B - 100), (px - 18, B - 100)])
    wash(sig, "#D9A63E", 0.95, "wcs"); ink(sig, 1.2, 0.85)
    for k, c in enumerate(("#8E3A2C", "#6E5A2C", "#3E6E4E")):
        add(f'<circle cx="{px - 12}" cy="{B - 129 + k * 11}" r="3.4" fill="{c}" opacity="0.9"/>')
    ink(line([(px - 6, B - 118), (px, B - 118)]), 1.4, 0.85, color=BLACK)

def left_hand(x):
    """Left Hand Brewing on Boston Avenue: the wood-sided tasting room with its red sign and porch roof,
    the pale stucco block beside it, and the three white silos behind with railings on their tops."""
    # The silos, behind and to the right, the smallest furthest back.
    for sx, sw, sh in [(x + 184, 42, 154), (x + 140, 52, 182), (x + 88, 52, 178)]:
        body = poly([(sx, B), (sx, B - sh), (sx + sw, B - sh), (sx + sw, B)])
        add(f'<path d="{body}" fill="#FBF8F2" opacity="0.95"/>')
        wash(poly([(sx + sw * 0.6, B - sh), (sx + sw, B - sh), (sx + sw, B), (sx + sw * 0.6, B)]), "#9AA3C6", 0.5, "wcs", g=True)
        wash(poly([(sx, B - sh), (sx + sw * 0.16, B - sh), (sx + sw * 0.16, B), (sx, B)]), "#E9C27E", 0.25, "wcs", g=True)
        ink(body, 1.5, 0.8)
        ink(line([(sx, B - sh * 0.36), (sx + sw, B - sh * 0.36)]), 0.7, 0.35)
        lid = f"M{sx + sw / 2 - 9},{B - sh} l2,-8 l14,0 l2,8 Z"
        add(f'<path d="{lid}" fill="#FBF8F2"/>'); ink(lid, 1.0, 0.75)
        ink(line([(sx - 4, B - sh - 14), (sx + sw + 4, B - sh - 14)]), 1.1, 0.8)   # the railing
        for rx in range(int(sx - 4), int(sx + sw + 6), 9):
            ink(line([(rx, B - sh - 14), (rx, B - sh)]), 0.8, 0.6)
        for k in range(3):   # the spikes on top
            ax = sx + 6 + k * (sw - 12) / 2
            ink(line([(ax, B - sh - 14), (ax + jit(6), B - sh - 40)]), 0.7, 0.55)
    # The chain-link fence in front of the silos.
    ink(line([(x + 88, B - 30), (x + 230, B - 30)]), 1.0, 0.55, color="#6E6A72")
    for fx in range(int(x + 90), int(x + 230), 26):
        ink(line([(fx, B), (fx, B - 32)]), 1.2, 0.65, color="#6E6A72")
    for fx in range(int(x + 92), int(x + 226), 6):
        ink(line([(fx, B - 30), (fx + 6, B - 2)]), 0.5, 0.25, color="#6E6A72")
    # The pale stucco block, then the tasting room in front.
    wash(poly([(x - 4, B), (x - 4, B - 104), (x + 30, B - 104), (x + 30, B)]), "#DCCFB2", 0.93, "wcs")
    wash(poly([(x - 8, B - 104), (x + 34, B - 104), (x + 34, B - 110), (x - 8, B - 110)]), "#7A3A30", 0.9, "wcs", g=True)
    trimmed(x + 4, B - 92, 18, 18, "#4A4752")
    ink(poly([(x - 4, B), (x - 4, B - 104), (x + 30, B - 104), (x + 30, B)]), 1.6)
    up = [(x + 6, B - 52), (x + 6, B - 98), (x + 112, B - 98), (x + 112, B - 52)]
    wash(poly(up), "#A3714C", 0.93, "wcs")
    for yy in range(B - 94, B - 54, 6):
        ink(line([(x + 8, yy), (x + 110, yy)]), 0.6, 0.35)
    wash(poly([(x + 2, B - 98), (x + 116, B - 98), (x + 116, B - 104), (x + 2, B - 104)]), "#6B3328", 0.9, "wcs", g=True)
    add(f'<text x="{x + 59}" y="{B - 82}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="12" font-weight="bold" letter-spacing="0.5" fill="#A8302A" opacity="0.95">LEFT HAND</text>')
    for wx in (x + 24, x + 78):
        trimmed(wx, B - 76, 18, 14, "#4A4752")
    ink(poly(up), 1.8)
    lo = [(x + 4, B), (x + 4, B - 40), (x + 114, B - 40), (x + 114, B)]
    wash(poly(lo), "#9A6844", 0.93, "wcs")
    for yy in range(B - 36, B - 4, 6):
        ink(line([(x + 6, yy), (x + 112, yy)]), 0.6, 0.35)
    for wx, ww in [(x + 12, 34), (x + 74, 32)]:
        trimmed(wx, B - 30, ww, 18, "#4A4752")
    trimmed(x + 54, B - 32, 12, 28, "#5E4636")
    ink(poly(lo), 1.8)
    porch = [(x - 4, B - 38), (x + 10, B - 56), (x + 108, B - 56), (x + 122, B - 38)]
    wash(poly(porch), "#9C4434", 0.93, "wcs"); ink(poly(porch), 1.6, 0.85)
    ink(line([(x - 6, B - 12), (x + 124, B - 12)]), 1.4, 0.75, color="#7A5236")   # the patio rail
    for rx in range(int(x - 4), int(x + 124), 14):
        ink(line([(rx, B - 12), (rx, B + 2)]), 1.2, 0.7, color="#7A5236")

xx = 1236
xx = buff_block(xx) + 4
xx = brick_block(xx, 100, 128, "#B5573C", "#2F4A66") + 4
xx = arched_neighbour(xx) + 2
dk = xx
xx = dickens(xx)
corner_signal(xx + 28)
xx = third_avenue_block(xx + 50)
wash(poly([(1230, B + 2), (xx, B + 2), (xx + 6, B + 14), (1224, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1384, dk - 4, dk + 226):
    globe_lamp(lx)
left_hand(2146)
for x, r in [(1232, 34), (2134, 30)]:
    cottonwood(x, B + 12, r)

# --- The near bank with the lake's loop trail, and the marsh of dry cattails in front.
INKSCALE = 1.15
wash("M1150,1040 L1150,782 C1172,770 1204,752 1226,738 C1240,740 1262,742 1300,742 L2440,742 L2440,1040 Z", "#CDB46C", 0.9, "wc1")
wash("M1300,810 C1700,796 2100,790 2440,784 L2440,1040 L1300,1040 Z", "#B49C5E", 0.3, "wc3", g=True)
for i in range(160):
    x = random.uniform(1200, 2400); y = random.uniform(756, 900)
    ink(line([(x, y + 12), (x + jit(5), y)]), 1.0, 0.38)
tc = [(1250, 794), (1500, 804), (1800, 824), (2100, 854), (2400, 894)]   # the lake's loop trail, narrowing as it goes back
def hw(x): return 3 + 19 * max(0, (x - 1250) / 1150) ** 1.4
trail_t = [(x, y - hw(x)) for x, y in tc]
trail_b = [(x, y + hw(x)) for x, y in reversed(tc)]
trail = f"M{trail_t[0][0]},{trail_t[0][1]} " + smooth(trail_t) + f" L{trail_b[0][0]},{trail_b[0][1]} " + smooth(trail_b) + " Z"
wash(trail, "#D9C49A", 0.9, "wcs")
wash(f"M{trail_b[-1][0]},{trail_b[-1][1]} " + smooth(list(reversed(trail_b))) + f" L2400,{trail_b[0][1] + 10} " + smooth([(x, y + hw(x) + 3 + 7 * (x - 1250) / 1150) for x, y in reversed(tc)]) + " Z", "#8F7F5C", 0.3, "wcs", g=True)
ink(open_path(trail_t), 1.2, 0.5); ink(open_path(list(reversed(trail_b))), 1.2, 0.45)
for i in range(46):   # gravel
    x = random.uniform(1320, 2400); y = interp(tc, x) + jit(hw(x) * 0.7)
    ink(line([(x, y), (x + random.uniform(3, 7), y)]), 0.9, 0.3)
for i in range(40):   # rabbitbrush
    x = random.uniform(1260, 2400); y = random.uniform(760, 960)
    if abs(y - interp(tc, x)) < hw(x) + 10 or y > interp(tc, x) + 70: continue
    wash(f"M{x - 10:.0f},{y:.0f} a10,6 0 1,0 20,0 a10,6 0 1,0 -20,0 Z", "#E2B92E", 0.72, "wcs", g=True)
for x, r in [(1640, 32), (1990, 40), (2330, 52)]:   # cottonwoods along the trail
    cottonwood(x, interp(tc, x) - hw(x) - 6, r)
cottonwood(2200, interp(tc, 2200) + hw(2200) + 40, 46)
mt = [(-20, 900), (400, 866), (800, 838), (1000, 814), (1190, 764), (1300, 822), (1500, 852), (1800, 876), (2100, 918), (2400, 958)]
wash("M-40,1040 L-40,900 C400,866 800,838 1000,814 C1100,800 1160,780 1190,764 C1240,794 1300,822 1500,852 C1800,876 2100,916 2440,960 L2440,1040 Z", "#B99759", 0.92, "wc1")
wash("M-40,1040 L-40,940 C400,920 800,904 1400,930 C1800,940 2100,944 2440,940 L2440,1040 Z", "#8C7048", 0.42, "wc3", g=True)
def cattails(cx, base, n, spread, hmin=50, hmax=120):
    for k in range(n):
        x = cx + random.uniform(-spread, spread); top = base - random.uniform(hmin, hmax); lean = jit(12)
        ink(line([(x, base), (x + lean, top)]), 1.2, 0.7, color="#6B5430")
        if random.random() < 0.28:
            wash(f"M{x + lean * 0.85 - 4:.0f},{top + 18:.0f} a4,13 0 1,0 8,0 a4,13 0 1,0 -8,0 Z", "#6B4329", 0.92, "wcs", g=True)
    for k in range(int(n * 0.6)):   # pale blades catching the light
        x = cx + random.uniform(-spread, spread); L = random.uniform(30, 80)
        add(f'<path d="M{x:.0f},{base:.0f} q{jit(10):.0f},{-L / 2:.0f} {jit(26):.0f},{-L:.0f}" stroke="#F1E2BC" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>')
stands = [(random.uniform(-10, 1340), 1.0) for i in range(56)] + [(random.uniform(1340, 2410), 0.5) for i in range(26)]
for x, dens in sorted(stands, key=lambda s: s[0] * 0 + random.random()):
    t = interp(mt, x); base = random.uniform(t + 34, 1000)
    d = base - t
    cattails(x, base, max(3, int(random.randint(6, 12) * dens)), random.uniform(14, 30), 30 + d * 0.3, 70 + d * 0.6)
for cx, base in [(1196, 800), (1236, 822), (1282, 846), (1330, 868)]:   # reeds round the lake's end
    cattails(cx, base, 10, 22, 50, 100)
for i in range(12):   # the tallest stands in front
    cattails(random.uniform(0, 1300), 1004, random.randint(5, 9), 26, 110, 190)
wash("M-40,975 C400,958 900,972 1300,962 C1700,955 2100,970 2440,958 L2440,1040 L-40,1040 Z", "#8C7048", 0.45, "wc3", g=True)

finish(sys.argv[1])
