"""Loveland hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Lake Loveland on an autumn morning, with downtown on its far shore. Behind,
the Front Range as the guide's photograph of the lake shows it (hero.jpg,
its silhouette traced and widened 1.25 times), and in front of the foothills
the Devil's Backbone: its tilted sandstone fins and the Keyhole, traced from
the guide's photograph of the open space (devils-backbone.jpg; the grassy
ridge they stand on from devils-backbone-trail.jpg). On the right, Fourth
Street as the guide's photographs show it, in their order: the three-storey
red brick block with its green cornice and belt course, Henry's tan brick
front with its green shopfront, and the Rialto's cream terra cotta with its
Greek-key friezes, roundels and three arches (henrys-pub-4th-street.jpg,
rialto-theater.jpg); then the Colorado and Southern depot, buff brick under
a long hipped roof with green eaves, its end pavilion with the LOVELAND.
board, the arched door and round-headed window (colorado-southern-depot.jpg).
Gold cottonwoods along the shore, as in hero.jpg. No sculpture: the city's
are modern works with living artists (DECISIONS.md), so the bronze on
Fourth Street and the Benson garden are left out. A composition, not a view:
the lake, Fourth Street and the depot are not seen together from anywhere.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(14)

# --- Sky.
sky()
for cx, cy, s in [(300, 150, 60), (960, 100, 46), (1600, 140, 66), (2180, 108, 50)]:
    cloud(cx, cy, s)
for cx, cy, s in [(560, 300, 28), (1290, 286, 32)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1880, 262, 11), (1918, 250, 8), (1950, 272, 9)]:
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The Front Range, traced from the guide's photo of Lake Loveland (hero.jpg):
# photo x times 1.25, its relief raised by half again. Where the photo's two
# cottonwood trunks and the sun hide the line, it runs on plainly between.
def R(pts): return [(x * 1.25, 352 + (y - 629) * 1.45) for x, y in pts]
INKSCALE = 0.55
far = R([(0, 650), (60, 656), (110, 668), (150, 668), (200, 666), (270, 660), (380, 664), (465, 662), (500, 648), (530, 639), (560, 648),
         (575, 652), (605, 646), (630, 650), (700, 651), (740, 655), (780, 662), (850, 672), (900, 680), (980, 688), (1060, 684), (1150, 662),
         (1250, 642), (1330, 629), (1370, 640), (1400, 646), (1500, 652), (1600, 658), (1690, 658), (1730, 660), (1760, 654), (1800, 662),
         (1850, 670), (1920, 676)])
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
for px, w, dep in [(1662, 70, 26), (662, 52, 20), (756, 36, 12)]:   # the first snow on the high peaks
    py = interp(far, px)
    d = f"M{px - w / 2:.0f},{py + dep:.0f} L{px - w * 0.18:.0f},{py + 2:.0f} L{px + w * 0.2:.0f},{py + 2:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.2:.0f},{py + dep * 0.55:.0f} L{px:.0f},{py + dep:.0f} L{px - w * 0.25:.0f},{py + dep * 0.6:.0f} Z"
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.92" filter="url(#wcs)"/>')
    wash(f"M{px + w * 0.05:.0f},{py + 4:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.15:.0f},{py + dep * 0.6:.0f} Z", "#9AA3C6", 0.45, "wcs", g=True)
ink(open_path(far), 1.4, 0.55)
mid = R([(0, 684), (80, 690), (180, 700), (260, 705), (380, 700), (470, 690), (585, 680), (620, 662), (660, 655), (690, 660), (720, 668),
         (800, 683), (880, 696), (960, 706), (1040, 712), (1120, 708), (1200, 700), (1300, 692), (1400, 690), (1500, 695), (1600, 700),
         (1700, 700), (1800, 690), (1920, 698)])
wash(ridge_d(mid), "#8495AE", 0.8, "wc3")
for a, b in [(825, 1300), (1700, 2000)]:   # shade on the slopes away from the morning sun
    pts = [(x, interp(mid, x)) for x in range(a, b + 1, 12)]
    wash(poly(pts + [(b, 520), (a + (b - a) * 0.4, 520)]), "#6F6B8E", 0.16, "wc3", g=True)
ink(open_path(mid), 1.3, 0.5)
foot = [(x * 1.25, 470 + (y - 730) * 0.9) for x, y in [(0, 732), (100, 736), (230, 736), (300, 742), (450, 758), (560, 775), (650, 776), (700, 770),
        (800, 773), (900, 777), (1000, 775), (1100, 772), (1220, 765), (1300, 760), (1400, 757), (1600, 762), (1800, 765), (1920, 768)]]
wash(ridge_d(foot), "#ADA27A", 0.9, "wc1")
for i in range(50):   # timber on the foothills
    x = random.uniform(0, 2400); y = interp(foot, x) + random.uniform(6, 26)
    r = random.uniform(9, 18)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.45:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.45:.0f} 0 1,0 {-2 * r:.0f},0 Z", "#5F7466", 0.45, "wcs", g=True)
ink(open_path(foot), 1.5, 0.55)

# --- The plain under the foothills.
INKSCALE = 0.8
wash(ridge_d([(0, 540), (800, 544), (1600, 538), (2400, 542)]), "#C9B46E", 0.88, "wc3")

# --- The Devil's Backbone, traced slab by slab from devils-backbone.jpg: photo
# x 200 to 1600 becomes x 400 to 1590, so the Keyhole stands at x 1205, right
# of the type. The slabs lean east; the cracks between them run down to the west.
def BB(pts): return [(0.85 * (px - 200) + 400, 566 - (606 - py)) for px, py in pts]
hog = [(120, 600), (300, 584), (430, 568), (700, 562), (1000, 562), (1300, 560), (1500, 564), (1640, 578), (1800, 600)]
wash(ridge_d(hog, 640), "#BFA866", 0.9, "wc2")
wash(poly([(1000, 562), (1300, 560), (1500, 564), (1640, 578), (1800, 600), (1800, 640), (1000, 640)]), "#8C7B9E", 0.18, "wc3", g=True)
groups = [
    [(205, 606), (210, 545), (230, 535), (255, 530), (270, 527), (290, 524), (310, 525), (325, 521), (345, 520), (355, 522), (362, 530),
     (365, 550), (367, 575), (375, 584), (380, 606)],
    [(405, 606), (410, 577), (422, 560), (430, 554), (437, 560), (455, 557), (470, 550), (480, 547), (490, 537), (510, 530), (530, 517),
     (540, 516), (545, 522), (550, 535), (570, 517), (580, 516), (590, 522), (595, 530), (605, 515), (620, 510), (637, 502), (650, 504),
     (662, 507), (675, 505), (682, 507), (690, 512), (695, 527), (705, 515), (715, 510), (727, 507), (735, 515), (745, 525), (755, 527),
     (775, 520), (782, 517), (790, 530), (797, 512), (807, 515), (815, 520), (830, 505), (845, 497), (860, 494), (870, 495), (880, 497),
     (890, 492), (900, 495), (905, 505), (920, 507), (927, 525), (940, 525), (945, 535), (947, 560), (950, 567), (965, 567), (980, 560),
     (990, 570), (1000, 606)],
    [(1028, 606), (1035, 550), (1045, 515), (1050, 495), (1047, 482), (1065, 479), (1085, 481), (1105, 476), (1120, 479), (1135, 475),
     (1150, 477), (1162, 490), (1170, 500), (1177, 510), (1185, 495), (1195, 487), (1210, 485), (1220, 490), (1225, 500), (1232, 492),
     (1240, 487), (1250, 497), (1260, 520), (1270, 530), (1285, 522), (1305, 515), (1320, 507), (1330, 510), (1340, 515), (1355, 505),
     (1370, 502), (1390, 505), (1400, 515), (1405, 530), (1420, 527), (1440, 520), (1465, 517), (1480, 510), (1500, 507), (1520, 505),
     (1540, 505), (1560, 500), (1575, 497), (1590, 500), (1600, 502), (1610, 606)],
]
fins = [BB(g) for g in groups]
hx, hy = BB([(1146, 566)])[0]   # the Keyhole: a round-headed window through the rock, taller on its west side
hole = f"M{hx - 13:.1f},{hy + 12:.1f} L{hx - 14:.1f},{hy - 4:.1f} C{hx - 13:.1f},{hy - 20:.1f} {hx + 10:.1f},{hy - 20:.1f} {hx + 14:.1f},{hy - 2:.1f} L{hx + 13:.1f},{hy + 12:.1f} Z"
fin_d = " ".join(poly(f) for f in fins) + " " + hole
add(f'<path d="{fin_d}" fill="{PAPER}" fill-rule="evenodd"/>')
wash(fin_d, "#D6B08E", 0.93, "wcs", extra='fill-rule="evenodd"', g=True)
add(f'<clipPath id="fc"><path d="{fin_d}" clip-rule="evenodd"/></clipPath>')
add('<g clip-path="url(#fc)">')
notches = []
for f in fins:
    for i in range(1, len(f) - 2):
        (x0, y0), (x1, y1), (x2, y2) = f[i - 1], f[i], f[i + 1]
        if y1 > y0 and y1 > y2 and y1 - min(y0, y2) > 5: notches.append((x1, y1))
for i in range(34):   # the pink of fresh breaks, down the slabs
    x = random.uniform(400, 1600); y = random.uniform(500, 572); L = random.uniform(24, 48); w = random.uniform(8, 16)
    wash(poly([(x, y), (x + w, y), (x + w + L * 0.5, y - L), (x + L * 0.5, y - L)]), "#C97A5C", 0.3, "wcs", g=True)
for x, y in notches:   # each crack between slabs, with its shadow on the east face below
    L = random.uniform(30, 60)
    wash(poly([(x, y), (x + 6, y + 2), (x - L * 0.5 + 6, y + L), (x - L * 0.5 - 4, y + L)]), "#7A5458", 0.45, "wcs", g=True)
    ink(line([(x, y), (x - L * 0.25, y + L * 0.5), (x - L * 0.5, y + L)]), 1.3, 0.7)
for i in range(110):   # joints leaning east, as the photo shows them
    x = random.uniform(400, 1600); y = random.uniform(470, 570); L = random.uniform(10, 26)
    ink(line([(x, y), (x + L * 0.5, y - L)]), 0.9, 0.4)
for i in range(36):   # bedding
    x = random.uniform(400, 1600); y = random.uniform(480, 560)
    ink(line([(x, y), (x + random.uniform(12, 26), y - random.uniform(3, 7))]), 0.8, 0.3)
for i in range(40):   # grey-green lichen, in streaks down the slabs
    x = random.uniform(400, 1600); y = random.uniform(480, 560); L = random.uniform(12, 26)
    wash(poly([(x, y), (x + 6, y - 2), (x + 6 + L * 0.4, y - L), (x + L * 0.4, y - L + 2)]), "#9FA383", 0.35, "wcs", g=True)
for f in fins:   # shade on the steep east faces
    for (x1, y1), (x2, y2) in zip(f, f[1:]):
        if x2 > x1 and (y2 - y1) > 0.8 * (x2 - x1):
            wash(poly([(x1, y1), (x2, y2), (x2 - 6, 570), (x1 - 22, 570)]), "#7E5A5E", 0.3, "wcs", g=True)
wash(poly([(400, 552), (1600, 552), (1600, 572), (400, 572)]), "#7E6A70", 0.25, "wcs", g=True)
add('</g>')
for f in fins:
    ink(line(f[1:-1]), 1.6, 0.82)
ink(hole, 1.4, 0.8)
for i in range(70):   # dry grass and sage on the ridge
    x = random.uniform(150, 1700); y0 = interp(hog, x) + random.uniform(4, 40)
    if y0 < 600: ink(line([(x, y0), (x - 9, y0 + 11)]), 0.9, 0.3)
for i in range(34):
    x = random.uniform(200, 1700); y = interp(hog, x) + random.uniform(4, 30); r = random.uniform(6, 12)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.6:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.6:.0f} 0 1,0 {-2 * r:.0f},0 Z", "#7F8E5E", 0.7, "wcs")

# --- The near plain and the trees along the lake's far shore.
INKSCALE = 0.85
plain = [(0, 596), (800, 600), (1600, 594), (2400, 598)]
wash(ridge_d(plain), "#CDB86C", 0.88, "wc3")
wash("M0,620 C700,610 1400,628 2400,616 L2400,660 C1400,672 700,652 0,664 Z", "#B9A85C", 0.3, "wc3", g=True)
shore_trees = []
for x in range(-20, 1260, 22):   # the tree line, dense as in hero.jpg, green going gold
    y = 640 + jit(3); r = random.uniform(10, 18)
    col = random.choice(["#7E8F4E", "#A39A45", "#D6A63C", "#7E8F4E", "#5F7A52"])
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.9:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.9:.0f} 0 1,0 {-2 * r:.0f},0 Z", col, 0.85, "wcs")
x = -10
while x < 1170:
    if random.random() < 0.18:
        ponderosa(x, 650, random.uniform(42, 60))
    else:
        r = random.uniform(24, 42)
        cottonwood(x, 648 + jit(3), r, back=True, shadow=False); shore_trees.append((x, r))
    x += random.uniform(34, 76)
for x, base, r in [(1176, 672, 36), (1238, 694, 40)]:   # the point where the shore turns toward town
    cottonwood(x, base, r, back=True, shadow=False); shore_trees.append((x, r))

# --- Downtown on the far shore, base at y 712, from x 1306 to 2330.
B = 712
for x in range(1290, 2420, 116):   # big cottonwoods behind the blocks
    cottonwood(x + jit(24), 652 + jit(8), random.uniform(60, 74), back=True, shadow=False)
wash(poly([(1280, B - 4), (2350, B - 4), (2368, B + 26), (1262, B + 26)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1262, B + 26), (2368, B + 26)]), 1.4, 0.55)
GREEN = "#2F5446"
refl = []   # what the lake gives back

def fret(x0, x1, y, s=6):
    """A Greek-key band, drawn plain: it is too small for the ink's tremor."""
    d, x = [], x0
    while x + s * 1.4 < x1:
        d.append(f"M{x:.1f},{y + s:.1f} L{x:.1f},{y:.1f} L{x + s:.1f},{y:.1f} L{x + s:.1f},{y + s * 0.66:.1f} L{x + s * 0.4:.1f},{y + s * 0.66:.1f} L{x + s * 0.4:.1f},{y + s * 0.33:.1f} M{x:.1f},{y + s:.1f} L{x + s * 1.4:.1f},{y + s:.1f}")
        x += s * 1.4
    add(f'<path d="{" ".join(d)}" fill="none" stroke="{INK}" stroke-width="0.8" opacity="0.55"/>')

def roundel(cx, cy, r, op=0.6):
    ink(f"M{cx - r:.1f},{cy:.1f} a{r},{r} 0 1,0 {2 * r},0 a{r},{r} 0 1,0 {-2 * r},0", 1.0, op)

def red_block(x):
    """The three-storey red brick block: green dentilled cornice, tall windows with pale lintels, a green belt course over the shops."""
    w, h = 212, 200
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(wall, "#B5533B", 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(x, B - h + 12, x + w, B - 70, step=10)
    for y0 in (B - h + 26, B - h + 90):   # third and second floors
        for k in range(5):
            wx = x + 18 + k * 39
            wash(poly([(wx - 4, y0 - 8), (wx + 18, y0 - 8), (wx + 18, y0 - 3), (wx - 4, y0 - 3)]), "#EADFC6", 0.95, "wcs")
            trimmed(wx, y0, 14, 42)
            ink(line([(wx - 4, y0 + 46), (wx + 18, y0 + 46)]), 1.0, 0.55)
    wash(poly([(x - 7, B - h - 12), (x + w + 7, B - h - 12), (x + w + 7, B - h + 6), (x - 7, B - h + 6)]), GREEN, 0.88, "wcs")
    ink(poly([(x - 7, B - h - 12), (x + w + 7, B - h - 12), (x + w + 7, B - h + 6), (x - 7, B - h + 6)]), 1.3, 0.75)
    for k in range(int((w + 10) / 8)):
        ink(line([(x - 3 + k * 8, B - h + 7), (x - 3 + k * 8, B - h + 11)]), 0.9, 0.5)
    by = B - 66
    wash(poly([(x - 2, by - 8), (x + w + 2, by - 8), (x + w + 2, by + 4), (x - 2, by + 4)]), GREEN, 0.88, "wcs", g=True)
    for k in range(7):
        roundel(x + 14 + k * 31, by - 2, 2.5, 0.7)
    wash(poly([(x + 6, B - 4), (x + 6, B - 52), (x + w - 6, B - 52), (x + w - 6, B - 4)]), "#5C5560", 0.6, "wcs", g=True)
    for px in (x + 6, x + 72, x + 140, x + w - 10):
        add(f'<rect x="{px}" y="{B - 54}" width="5" height="52" fill="{PAPER}"/>')
        wash(poly([(px, B - 2), (px, B - 54), (px + 5, B - 54), (px + 5, B - 2)]), "#D9C7A6", 0.8, "wcs", g=True)
    aw = f"M{x + 10},{B - 52} L{x + 66},{B - 52} L{x + 70},{B - 36} L{x + 6},{B - 36} Z"   # the maroon awning
    wash(aw, "#6E2A26", 0.92, "wcs"); ink(aw, 1.3, 0.75)
    ink(wall, 2.0)
    refl.append((x, x + w, h, "#B5533B"))
    return x + w

def henrys(x):
    """Henry's: tan brick with a darker brick lattice up top, a wide green-framed window, a green shopfront with diamond transoms."""
    w, h = 128, 138
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(wall, "#CDB48C", 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.2, "wcs", g=True)
    coursing(x, B - h + 8, x + w, B - 64, step=9)
    for k in range(9):   # the lattice of darker brick in the parapet
        cx = x + 10 + k * 13.5
        wash(f"M{cx},{B - h + 8} l5,6 l-5,6 l-5,-6 Z", "#8E6A4A", 0.55, "wcs", g=True)
    ink(line([(x - 3, B - h - 4), (x + w + 3, B - h - 4), (x + w + 3, B - h + 3), (x - 3, B - h + 3), (x - 3, B - h - 4)]), 1.2, 0.7)
    gx0, gx1, gy0, gy1 = x + 14, x + w - 14, B - h + 32, B - h + 78
    add(f'<rect x="{gx0 - 3}" y="{gy0 - 3}" width="{gx1 - gx0 + 6}" height="{gy1 - gy0 + 6}" fill="{PAPER}"/>')
    wash(poly([(gx0, gy1), (gx0, gy0), (gx1, gy0), (gx1, gy1)]), WIN, 0.82, "wcs", g=True)
    ink(poly([(gx0 - 3, gy1 + 3), (gx0 - 3, gy0 - 3), (gx1 + 3, gy0 - 3), (gx1 + 3, gy1 + 3)]), 1.8, 0.9, color=GREEN)
    ink(line([(gx0, gy0 + 14), (gx1, gy0 + 14)]), 1.2, 0.85, color=GREEN)
    for k in range(1, 4):
        ink(line([(gx0 + k * (gx1 - gx0) / 4, gy0), (gx0 + k * (gx1 - gx0) / 4, gy1)]), 1.2, 0.85, color=GREEN)
    sx0, sx1 = x + 8, x + w - 8
    wash(poly([(sx0, B - 2), (sx0, B - 62), (sx1, B - 62), (sx1, B - 2)]), GREEN, 0.9, "wcs")
    wash(poly([(sx0 + 4, B - 58), (sx1 - 4, B - 58), (sx1 - 4, B - 48), (sx0 + 4, B - 48)]), "#2E2B30", 0.8, "wcs", g=True)
    for k in range(int((sx1 - sx0 - 8) / 10)):   # the diamond-paned transoms
        cx = sx0 + 9 + k * 10
        add(f'<path d="M{cx},{B - 57} l4,4 l-4,4 l-4,-4 Z" fill="none" stroke="#EFE8DA" stroke-width="0.8" opacity="0.8"/>')
    add(f'<text x="{x + w / 2}" y="{B - 37}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="10" font-weight="bold" letter-spacing="1.5" fill="#F1EAD8" opacity="0.92">HENRY\'S</text>')
    wash(poly([(sx0 + 5, B - 4), (sx0 + 5, B - 32), (sx1 - 5, B - 32), (sx1 - 5, B - 4)]), "#5C5560", 0.75, "wcs", g=True)
    ink(line([(x + 64, B - 32), (x + 64, B - 4)]), 1.0, 0.6, color="#EFE8DA")
    ink(poly([(sx0, B - 2), (sx0, B - 62), (sx1, B - 62), (sx1, B - 2)]), 1.4, 0.8)
    ink(wall, 2.0)
    refl.append((x, x + w, h, "#CDB48C"))
    return x + w

def lantern(lx, ly):
    ink(f"M{lx},{ly} q0,-10 8,-10", 1.2, 0.85, color="#2A2624")
    add(f'<path d="M{lx + 4},{ly - 9} L{lx + 12},{ly - 9} L{lx + 11},{ly + 2} L{lx + 5},{ly + 2} Z" fill="#2A2624" opacity="0.85"/>')
    add(f'<path d="M{lx + 6},{ly - 6} L{lx + 10},{ly - 6} L{lx + 10},{ly} L{lx + 6},{ly} Z" fill="#E9D9A6" opacity="0.8"/>')

def rialto(x):
    """The Rialto, 1920: cream terra cotta, Greek-key friezes and roundels, three window groups above three arches, RIALTO in the great arch."""
    w, h = 264, 162
    CREAM = "#E7DBC1"
    wall = poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])
    wash(wall, CREAM, 0.95, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), "#8E7E78", 0.22, "wcs", g=True)
    for y in range(int(B - h + 12), int(B - 10), 9):   # the terra cotta's courses, faint
        ink(line([(x + 3, y), (x + w - 3, y)]), 0.5, 0.18)
    wash(poly([(x - 5, B - h - 8), (x + w + 5, B - h - 8), (x + w + 5, B - h + 4), (x - 5, B - h + 4)]), "#C9B99A", 0.7, "wcs", g=True)
    ink(poly([(x - 5, B - h - 8), (x + w + 5, B - h - 8), (x + w + 5, B - h + 4), (x - 5, B - h + 4)]), 1.3, 0.7)
    fret(x + 4, x + w - 4, B - h + 8, 5)
    for cx in (x + 8, x + 80, x + w / 2, x + w - 80, x + w - 8):
        roundel(cx, B - h + 22, 3.5, 0.55)
    fret(x + 4, x + w - 4, B - h + 30, 5)
    wy0, wy1 = B - h + 42, B - h + 82
    for gx, n in [(x + 14, 3), (x + 84, 6), (x + w - 62, 3)]:   # the window groups
        pw = 16
        add(f'<rect x="{gx - 3}" y="{wy0 - 3}" width="{n * pw + 6}" height="{wy1 - wy0 + 6}" fill="{PAPER}"/>')
        wash(poly([(gx, wy1), (gx, wy0), (gx + n * pw, wy0), (gx + n * pw, wy1)]), WIN, 0.85, "wcs", g=True)
        wash(poly([(gx, wy0 + 14), (gx, wy0), (gx + n * pw, wy0), (gx + n * pw, wy0 + 14)]), "#C9CFDA", 0.5, "wcs", g=True)
        ink(poly([(gx - 3, wy1 + 3), (gx - 3, wy0 - 3), (gx + n * pw + 3, wy0 - 3), (gx + n * pw + 3, wy1 + 3)]), 1.4, 0.85)
        for k in range(1, n):
            ink(line([(gx + k * pw, wy0), (gx + k * pw, wy1)]), 1.0, 0.7)
        ink(line([(gx, wy0 + 14), (gx + n * pw, wy0 + 14)]), 0.8, 0.6)
    ink(line([(x + 6, wy1 + 6), (x + w - 6, wy1 + 6)]), 1.0, 0.5)
    my = wy1 + 16   # the band of roundels and tiles over the arches
    for cx in (x + 14, x + 56, x + 90, x + w - 90, x + w - 56, x + w - 14):
        roundel(cx, my, 5, 0.6)
    for k in range(9):
        cx = x + 104 + k * 7
        add(f'<path d="M{cx},{my - 3} l3,3 l-3,3 l-3,-3 Z" fill="#8E9AA8" opacity="0.7"/>')
    for px in (x, x + 72, x + w - 78, x + w - 6):   # piers
        ink(line([(px + 3, B - 72), (px + 3, B)]), 0.8, 0.4)
    def arch(ax0, ax1, top, spring, col_top, door_n, label=None):
        rise = spring - top
        d = f"M{ax0},{B} L{ax0},{spring} Q{(ax0 + ax1) / 2},{top - rise} {ax1},{spring} L{ax1},{B} Z"
        add(f'<path d="{d}" fill="{PAPER}"/>')
        wash(d, WIN, 0.85, "wcs", g=True)
        wash(f"M{ax0},{spring + 22} L{ax0},{spring} Q{(ax0 + ax1) / 2},{top - rise} {ax1},{spring} L{ax1},{spring + 22} Z", col_top, 0.55, "wcs", g=True)
        ink(d, 1.6, 0.85)
        ink(line([(ax0, spring + 22), (ax1, spring + 22)]), 1.2, 0.8)
        if label:
            add(f'<text x="{(ax0 + ax1) / 2}" y="{spring + 15}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="15" font-weight="bold" letter-spacing="3" fill="#F3ECDD" opacity="0.92">{label}</text>')
        for k in range(1, door_n):
            dx = ax0 + k * (ax1 - ax0) / door_n
            ink(line([(dx, spring + 24), (dx, B - 2)]), 1.0, 0.65)
        wash(poly([(ax0 + 2, B - 2), (ax0 + 2, B - 8), (ax1 - 2, B - 8), (ax1 - 2, B - 2)]), "#C9A24A", 0.8, "wcs", g=True)   # brass kick plates
    arch(x + 10, x + 66, B - 70, B - 56, "#B7C2CF", 2)
    arch(x + 86, x + w - 92, B - 76, B - 60, "#AFC0D0", 6, "RIALTO")
    arch(x + w - 70, x + w - 12, B - 70, B - 56, "#B7C2CF", 2)
    for lx in (x + 74, x + w - 86, x + w - 6):
        lantern(lx, B - 72)
    ink(wall, 2.0)
    refl.append((x, x + w, h, CREAM))
    return x + w

def depot(x):
    """The Colorado and Southern depot: buff brick, a long hipped roof with green eaves, eyebrow dormers and two chimneys; the end pavilion with the LOVELAND. board, the arched door with its awning and a round-headed window."""
    BUFF, BUFF_D, ROOF, RED = "#D9C089", "#9C8458", "#8D877D", "#9E3B2E"
    pw, ph = 98, 88
    bx, bw, bh = x + pw, 250, 72
    # The long body.
    wash(poly([(bx, B), (bx, B - bh), (bx + bw, B - bh), (bx + bw, B)]), BUFF, 0.93, "wcs")
    wash(poly([(bx + bw * 0.75, B - bh), (bx + bw, B - bh), (bx + bw, B), (bx + bw * 0.75, B)]), BUFF_D, 0.25, "wcs", g=True)
    coursing(bx, B - bh + 8, bx + bw, B - 4, step=10)
    for cx, cw, ch in [(bx + 64, 16, 34), (bx + 170, 14, 24)]:   # chimneys
        wash(poly([(cx, B - bh - 40), (cx, B - bh - 40 - ch), (cx + cw, B - bh - 40 - ch), (cx + cw, B - bh - 40)]), BUFF, 0.93, "wcs")
        wash(poly([(cx - 2, B - bh - 40 - ch), (cx + cw + 2, B - bh - 40 - ch), (cx + cw + 2, B - bh - 34 - ch), (cx - 2, B - bh - 34 - ch)]), BUFF_D, 0.6, "wcs", g=True)
        ink(poly([(cx, B - bh - 30), (cx, B - bh - 40 - ch), (cx + cw, B - bh - 40 - ch), (cx + cw, B - bh - 30)]), 1.3, 0.8)
    roof = [(bx - 12, B - bh), (bx + 26, B - bh - 56), (bx + bw - 40, B - bh - 56), (bx + bw + 12, B - bh)]
    wash(poly(roof), ROOF, 0.92, "wcs")
    wash(poly([(bx + bw - 40, B - bh - 56), (bx + bw + 12, B - bh), (bx + bw - 30, B - bh)]), "#5E5A66", 0.35, "wcs", g=True)
    for k, y in enumerate(range(int(B - bh - 50), int(B - bh - 4), 8)):   # shingle courses
        t = (y - (B - bh - 56)) / 56
        ink(line([(bx + 26 - 38 * t + 4, y), (bx + bw - 40 + 52 * t - 4, y)]), 0.6, 0.3)
    for ex in (bx + 118, bx + 214):   # eyebrow dormers
        e = f"M{ex - 16},{B - bh - 24} Q{ex},{B - bh - 44} {ex + 16},{B - bh - 24} Z"
        wash(e, "#5E5A66", 0.8, "wcs", g=True); ink(e, 1.2, 0.75)
    ink(poly(roof), 1.8, 0.85)
    wash(poly([(bx - 12, B - bh), (bx + bw + 12, B - bh), (bx + bw + 12, B - bh + 6), (bx - 12, B - bh + 6)]), GREEN, 0.9, "wcs", g=True)
    for k in range(int(bw / 24) + 1):   # eave brackets
        ink(line([(bx + 4 + k * 24, B - bh + 6), (bx + 4 + k * 24, B - bh + 12), (bx + 10 + k * 24, B - bh + 6)]), 1.0, 0.6)
    for wx in (bx + 18, bx + 44, bx + 92, bx + 118, bx + 166):   # red-framed windows
        add(f'<rect x="{wx - 3}" y="{B - 60}" width="20" height="46" fill="{PAPER}"/>')
        wash(poly([(wx, B - 17), (wx, B - 57), (wx + 14, B - 57), (wx + 14, B - 17)]), WIN, 0.85, "wcs", g=True)
        ink(poly([(wx - 3, B - 14), (wx - 3, B - 60), (wx + 17, B - 60), (wx + 17, B - 14)]), 1.6, 0.9, color=RED)
        ink(line([(wx, B - 40), (wx + 14, B - 40)]), 0.9, 0.8, color=RED)
    dx = bx + 142   # a red door
    wash(poly([(dx, B), (dx, B - 54), (dx + 16, B - 54), (dx + 16, B)]), RED, 0.9, "wcs")
    ink(poly([(dx, B), (dx, B - 54), (dx + 16, B - 54), (dx + 16, B)]), 1.3, 0.8)
    gx0, gx1 = bx + 194, bx + bw - 10   # the glazed east end
    add(f'<rect x="{gx0 - 3}" y="{B - 62}" width="{gx1 - gx0 + 6}" height="60" fill="{PAPER}"/>')
    wash(poly([(gx0, B - 2), (gx0, B - 60), (gx1, B - 60), (gx1, B - 2)]), WIN, 0.85, "wcs", g=True)
    for k in range(1, 5):
        ink(line([(gx0 + k * (gx1 - gx0) / 5, B - 60), (gx0 + k * (gx1 - gx0) / 5, B - 2)]), 0.9, 0.7)
    ink(line([(gx0, B - 44), (gx1, B - 44)]), 0.9, 0.7)
    ink(poly([(gx0 - 2, B - 2), (gx0 - 2, B - 62), (gx1 + 2, B - 62), (gx1 + 2, B - 2)]), 1.4, 0.85, color=GREEN)
    ink(line([(bx, B - 24), (bx + bw, B - 24)]), 1.0, 0.5)
    ink(poly([(bx, B), (bx, B - bh), (bx + bw, B - bh), (bx + bw, B)]), 1.9)
    # The end pavilion, a little taller, with its own hipped roof.
    wall = poly([(x, B), (x, B - ph), (x + pw, B - ph), (x + pw, B)])
    wash(wall, BUFF, 0.93, "wcs")
    wash(poly([(x + pw * 0.75, B - ph), (x + pw, B - ph), (x + pw, B), (x + pw * 0.75, B)]), BUFF_D, 0.25, "wcs", g=True)
    coursing(x, B - ph + 8, x + pw, B - 4, step=10)
    proof = [(x - 13, B - ph), (x + 30, B - ph - 64), (x + pw - 30, B - ph - 64), (x + pw + 13, B - ph)]
    wash(poly(proof), ROOF, 0.92, "wcs")
    wash(poly([(x + pw - 30, B - ph - 64), (x + pw + 13, B - ph), (x + pw - 16, B - ph)]), "#5E5A66", 0.35, "wcs", g=True)
    for y in range(int(B - ph - 58), int(B - ph - 4), 8):
        t = (y - (B - ph - 64)) / 64
        ink(line([(x + 30 - 43 * t + 4, y), (x + pw - 30 + 43 * t - 4, y)]), 0.6, 0.3)
    e = f"M{x + pw / 2 - 20},{B - ph - 22} Q{x + pw / 2},{B - ph - 46} {x + pw / 2 + 20},{B - ph - 22} Z"
    wash(e, "#5E5A66", 0.85, "wcs", g=True); ink(e, 1.2, 0.8)
    for k in range(1, 4):
        ink(line([(x + pw / 2 - 20 + k * 10, B - ph - 23), (x + pw / 2 - 20 + k * 10, B - ph - 31 - (2 - abs(k - 2)) * 4)]), 0.8, 0.6)
    ink(poly(proof), 1.8, 0.85)
    wash(poly([(x - 13, B - ph), (x + pw + 13, B - ph), (x + pw + 13, B - ph + 6), (x - 13, B - ph + 6)]), GREEN, 0.9, "wcs", g=True)
    wash(poly([(x + 9, B - ph + 13), (x + 89, B - ph + 13), (x + 89, B - ph + 31), (x + 9, B - ph + 31)]), "#4A3628", 0.92, "wcs")   # the board
    ink(poly([(x + 9, B - ph + 13), (x + 89, B - ph + 13), (x + 89, B - ph + 31), (x + 9, B - ph + 31)]), 1.2, 0.8)
    add(f'<text x="{x + 49}" y="{B - ph + 26}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="11" font-weight="bold" letter-spacing="0.4" fill="#F1EAD8" opacity="0.95">LOVELAND.</text>')
    ink(f"M{x + 8},{B - 30} a24,24 0 0,1 48,0", 1.4, 0.8)   # the brick arch over the door
    ink(f"M{x + 13},{B - 30} a19,19 0 0,1 38,0", 1.0, 0.55)
    wash(poly([(x + 20, B), (x + 20, B - 40), (x + 44, B - 40), (x + 44, B)]), RED, 0.9, "wcs")
    ink(poly([(x + 20, B), (x + 20, B - 40), (x + 44, B - 40), (x + 44, B)]), 1.3, 0.8)
    aw = f"M{x + 6},{B - 34} L{x + 6},{B - 46} Q{x + 32},{B - 62} {x + 58},{B - 46} L{x + 58},{B - 34} Z"   # the navy awning
    wash(aw, "#2E3A6E", 0.92, "wcs"); ink(aw, 1.3, 0.8)
    ww = f"M{x + 68},{B - 14} L{x + 68},{B - 46} a8,8 0 0,1 16,0 L{x + 84},{B - 14} Z"   # the round-headed window
    add(f'<path d="{ww}" fill="{PAPER}"/>')
    wash(ww, WIN, 0.85, "wcs", g=True); ink(ww, 1.6, 0.9, color=RED)
    ink(wall, 1.9)
    wash(poly([(x - 8, B), (x + pw + bw + 8, B), (x + pw + bw + 14, B + 14), (x - 14, B + 14)]), "#B9785E", 0.55, "wcs", g=True)   # brick paving
    for k in range(int((pw + bw) / 12)):
        ink(line([(x + k * 12, B + 2), (x + k * 12 - 3, B + 12)]), 0.6, 0.3)
    refl.append((x, x + pw + bw, ph + 50, BUFF))
    return x + pw + bw

INKSCALE = 0.95
xx = red_block(1306) + 4
xx = henrys(xx) + 4
xx = rialto(xx)
depot(1970)
wash(poly([(1280, B + 2), (2350, B + 2), (2356, B + 14), (1274, B + 14)]), "#7E7398", 0.4, "wcs", g=True)
lx = 1494   # the street lamp in front of the red block
ink(line([(lx, B + 22), (lx, B - 120)]), 2.2, 0.85, color="#3A3632")
ink(f"M{lx},{B - 120} q0,-16 18,-16", 2.0, 0.85, color="#3A3632")
add(f'<path d="M{lx + 14},{B - 138} l14,0 l-2,6 l-10,0 Z" fill="#3A3632" opacity="0.85"/>')
for x, r in [(1288, 36), (1946, 34), (2364, 38)]:
    cottonwood(x, B + 12, r)

# --- Lake Loveland.
INKSCALE = 1.05
lt = [(0, 650), (500, 652), (900, 658), (1120, 668), (1230, 690), (1290, 726), (1340, 756), (1460, 764), (2400, 764)]
lb = [(0, 912), (500, 906), (1000, 894), (1500, 880), (2000, 870), (2400, 864)]
lake_d = f"M{lt[0][0]},{lt[0][1]} " + smooth(lt) + f" L{lb[-1][0]},{lb[-1][1]} " + smooth(lb[::-1]) + " Z"
wash(lake_d, "#78A5C6", 0.92, "wc3")
add(f'<clipPath id="lk"><path d="{lake_d}"/></clipPath>')
add('<g clip-path="url(#lk)">')
wash("M0,646 C500,648 900,654 1120,664 C1240,684 1300,722 1350,760 L2400,760 L2400,772 L1340,772 C1250,740 1150,690 900,668 C500,664 0,664 0,664 Z", "#5E6E48", 0.3, "wcs", g=True)
strokes = []
def reflect(x0, x1, y0, depth, col, op):
    """A reflection laid in broken horizontal strokes, fading with depth."""
    y = y0
    while y < y0 + depth:
        t = (y - y0) / depth
        xa = x0 + random.uniform(0, 10) + t * 6
        while xa < x1 - 10 - t * 6:
            xb = min(x1 - t * 6, xa + random.uniform(20, 70))
            strokes.append(f'<path d="M{xa:.0f},{y:.0f} L{xb:.0f},{y + jit(1):.0f}" stroke="{col}" stroke-width="{random.uniform(2.5, 5.5) * (1 - t * 0.4):.1f}" stroke-linecap="round" opacity="{op * (1 - t * 0.8):.2f}"/>')
            xa = xb + random.uniform(3, 14) * (0.5 + t)
        y += random.uniform(5, 9) * (1 + t * 0.5)
for x, r in shore_trees:   # the gold of the far shore
    reflect(x - r * 0.8, x + r * 0.8, interp(lt, x) + 4, r * 1.3, "#D9A33A", 0.55)
for x0, x1, h, col in refl:   # the town, upside down and broken by ripples
    reflect(x0 + 2, x1 - 2, 766, h * 0.55, col, 0.5)
for x in range(1290, 2420, 60):
    reflect(x - 30, x + 30, 766, 26, "#D9A33A", 0.4)
add(f'<g filter="url(#wcs)" style="mix-blend-mode:multiply">{"".join(strokes)}</g>')
wash("M0,780 C600,790 1400,800 2400,810 L2400,1000 L0,1000 Z", "#5E8AA8", 0.28, "wc3", g=True)
wash(f"M0,870 C500,862 1200,850 2400,830 L2400,1000 L0,1000 Z", "#4F7C9A", 0.3, "wc3", g=True)
for i in range(80):   # ripples left as paper
    x = random.uniform(-40, 2400); y = random.uniform(660, 905)
    if y < interp(lt, x) + 6 or y > interp(lb, x) - 6: continue
    L = random.uniform(40, 150) * (0.6 + (y - 650) / 600)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-3 {L:.0f},0" stroke="#FBF7EE" stroke-width="{1.6 + (y - 650) / 200:.1f}" fill="none" stroke-linecap="round" opacity="0.8"/>')
    if random.random() < 0.3: ink(f"M{x + 8:.0f},{y + 5:.0f} q{L / 3:.0f},-2 {L * 0.6:.0f},0", 0.9, 0.35)
add('</g>')
ink(open_path(lt), 1.6, 0.6)
ink(open_path(lb), 1.8, 0.6)

# --- The near shore: mown grass, a few rocks at the water, cottonwoods.
INKSCALE = 1.15
wash(f"M0,912 " + smooth(lb) + f" L2400,{H} L0,{H} Z", "#ADA85E", 0.9, "wc1")
wash("M0,960 C600,944 1400,940 2400,920 L2400,1000 L0,1000 Z", "#8F8A4E", 0.4, "wc3", g=True)
wash("M0,920 C500,914 1000,902 1500,888 C1900,878 2200,872 2400,870 L2400,884 C2000,890 1500,902 1000,916 C500,928 0,934 0,934 Z", "#7E7398", 0.25, "wcs", g=True)   # the bank's lip in shade
def cattails(cx, base, n, spread):
    for k in range(n):
        x = cx + random.uniform(-spread, spread); top = base - random.uniform(34, 80); lean = jit(8)
        ink(line([(x, base), (x + lean, top)]), 1.2, 0.75, color="#55652F")
        if random.random() < 0.4:
            wash(f"M{x + lean - 3.5:.0f},{top + 4:.0f} a3.5,11 0 1,0 7,0 a3.5,11 0 1,0 -7,0 Z", "#6B4329", 0.92, "wcs", g=True)
    wash(f"M{cx - spread - 10:.0f},{base} C{cx - spread},{base - 40} {cx + spread},{base - 40} {cx + spread + 10:.0f},{base} Z", "#A39A45", 0.45, "wcs", g=True)
for cx, n, sp in [(330, 16, 30), (1020, 12, 26), (1760, 18, 34), (2050, 10, 22)]:
    cattails(cx, interp(lb, cx) + 8, n, sp)
def shore_rock(cx, cy, r):
    d = f"M{cx - r},{cy} C{cx - r},{cy - r * 0.7} {cx - r * 0.2},{cy - r * 0.8} {cx + r * 0.3},{cy - r * 0.7} C{cx + r * 0.9},{cy - r * 0.6} {cx + r},{cy - r * 0.3} {cx + r},{cy} Z"
    wash(d, "#8E8478", 0.9, "wcs")
    wash(f"M{cx + r * 0.2},{cy - r * 0.7} C{cx + r * 0.9},{cy - r * 0.6} {cx + r},{cy - r * 0.3} {cx + r},{cy} L{cx + r * 0.1},{cy} Z", "#4E4A52", 0.45, "wcs", g=True)
    ink(d, 1.4, 0.8)
    add(f'<path d="M{cx - r * 1.3:.0f},{cy + 2:.0f} q{r * 1.3:.0f},{r * 0.2:.0f} {r * 2.6:.0f},0" stroke="#FBF7EE" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85"/>')
for cx, r in [(40, 16), (78, 10), (210, 12), (640, 9), (1520, 11), (1548, 7)]:
    shore_rock(cx, interp(lb, cx) + 4, r)
for i in range(200):
    x = random.uniform(0, 2400); top = interp(lb, x) + random.uniform(8, 100)
    if top > 995: continue
    ink(line([(x, top + random.uniform(8, 18)), (x + jit(5), top)]), 1.0, 0.42)
for i in range(30):   # rabbitbrush
    x = random.uniform(300, 2400); y = interp(lb, x) + random.uniform(24, 90)
    if y < 990: wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", "#E2B92E", 0.75, "wcs", g=True)
for x, r in [(2190, 58), (2330, 50)]:
    cottonwood(x, interp(lb, x) + 52, r)

finish(sys.argv[1])
