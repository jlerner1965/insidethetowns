"""Manitou Springs hero, ink and watercolour, 2400 x 1000, in the Lyons style.

The town at the foot of the mountains on an autumn morning, composed from
the guide's own reference photographs (content/manitou-springs/images/):

- Manitou Avenue, left to right: the buff-brick block with its red coping,
  lattice in the upper windows, sign band and striped awning (hero.jpg, the
  current hero photo); the narrow brick building with the bracketed cornice,
  pointed window hoods and blue scalloped awning (hero.jpg and
  manitou-avenue-700-block.jpg); the red-brick three-storey block with its
  arched top-floor windows under sandstone arches, window boxes and
  corbelled cornice (both photos); the narrow building with the maroon
  awning and the cream gabled front beside it (manitou-avenue-700-block.jpg);
  the cream three-storey block with its red cornice and a tall spruce behind
  it (hero.jpg); black lamp posts and the pink sidewalk with its yellow curb.
- Miramont Castle on the hill above, with its crenellated and stepped-gable
  sandstone towers, round entrance tower and porch, green-shingled bays and
  half-timbered gable, on its sandstone wall with spruces behind
  (miramont-castle.jpg).
- The Cliff House: cream upper storeys, the sage-green floor, the porch on
  sandstone piers with its white balustrade, and the tower under a steep
  brown roof (the-cliff-house-at-pikes-peak.jpg).
- In front, the 7 Minute Spring's pavilion: dark timber frame, octagonal
  shingle roof with cupola and spire, gabled wings with cream sunburst
  gables, X-braced lattice, pink sandstone steps, the low pink wall behind
  it, red sumac, brown shrubs and blue-grey ground cover
  (manitou-mineral-springs.jpg).
- Behind, the Incline's straight line of steps up the timbered mountain
  over red earth (manitou-incline.jpg), and the red cog train on the bare,
  boulder-strewn upper slopes of the Peak
  (broadmoor-manitou-and-pikes-peak-cog-railway.jpg).

No guide photograph shows Pikes Peak's outline, so the summit is a broad,
hazy dome of bare rock as the cog-railway photo shows its upper slopes, not
a traced profile. The mountain on the left, the far ridges, the timber, the
cottonwoods and the scrub oak are generic filler: the left is where the
type sits on a wide screen, so the Cliff Dwellings and Cave of the Winds,
which have photos in the guide, are left out rather than hidden under it.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

# A finer wash for very small things (the cog train), defined here rather than in wclib.
add('<defs>' + wc_filter("wct", 61, warp=2, freq=0.06, pig=0.08, rim=1, rimblur=1.5, rimdark=0.55, rimop=0.5) + '</defs>')

def blob(x, y, rx, ry): return f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z"
def rect(x0, y0, x1, y1): return poly([(x0, y1), (x0, y0), (x1, y0), (x1, y1)])

def fir_d(x, base, h, wr=0.42):
    """A spruce or fir in silhouette: a narrow spire with notched tiers."""
    w = h * wr; right = []
    for k in range(1, 5):
        t = k / 4
        right.append((x + w / 2 * t + jit(0.8), base - h + h * t * 0.9))
        if k < 4: right.append((x + w / 2 * t * 0.45, base - h + h * t * 0.9 + 1.5))
    pts = [(x, base - h)] + right + [(x + w * 0.06, base), (x - w * 0.06, base)] + [(2 * x - px, py) for px, py in reversed(right)]
    return poly(pts)

def forest(ridge, x0, x1, n, depth, hmin, hmax, cols, ymax=1000, op=0.85, skip=None):
    """Timber over a slope: many small firs, one wash per colour; skip(x, y) keeps a clearing."""
    groups = {c: [] for c in cols}
    for i in range(n):
        x = random.uniform(x0, x1); y = interp(ridge, x) + random.uniform(3, depth)
        if y > ymax or (skip and skip(x, y)): continue
        groups[random.choice(cols)].append(fir_d(x, y, random.uniform(hmin, hmax)))
    for c, ds in groups.items():
        if ds: wash(" ".join(ds), c, op, "wcs", g=True)

# --- Sky, as in the other three.
sky()
for cx, cy, s in [(330, 140, 58), (1010, 92, 42), (1540, 150, 54), (2230, 112, 46)]:
    cloud(cx, cy, s)
cloud(640, 272, 26)

# --- Far ridges, cool and hazy.
INKSCALE = 0.55
far = [(0, 352), (180, 328), (380, 344), (560, 318), (760, 338), (960, 324), (1160, 350), (1400, 340), (1800, 360), (2400, 356)]
wash(ridge_d(far), "#B9B4D0", 0.75, "wc3")
ink(open_path(far[:7]), 1.2, 0.35)

# --- The Peak, hazy with distance: a broad dome of bare rock above the timber.
peak = [(0, 470), (500, 474), (860, 470), (1050, 440), (1200, 408), (1350, 372), (1480, 340), (1600, 312), (1720, 292), (1830, 280), (1930, 276), (2030, 282), (2130, 298), (2250, 322), (2400, 348)]
wash(ridge_d(peak), "#B9A7B4", 0.82, "wc3")
lit = [(x, interp(peak, x) + 6) for x in range(1300, 2061, 40)]
wash(open_path(lit) + " " + smooth([lit[-1], (1980, 330), (1760, 372), (1500, 410), lit[0]]) + " Z", "#D9B596", 0.38, "wc3", g=True)   # morning light on the granite
# The face away from the morning sun, its edge following the summit's fall line.
shade_edge = [(1930, 276), (1918, 304), (1926, 330), (1900, 356), (1908, 380), (1876, 410), (1866, 450)]
wash(open_path(shade_edge) + f" L2400,450 L2400,348 C2320,334 2250,322 2130,298 C2060,286 1990,280 1930,276 Z", "#8C7B9E", 0.3, "wc3", g=True)
ribs = [(1640, 312, 1600, 420), (1760, 292, 1730, 420), (1880, 282, 1870, 420), (2010, 284, 2050, 420), (2140, 302, 2200, 420), (2280, 330, 2340, 420)]
for x0, y0, x1, y1 in ribs:   # ribs of rock, each with a gully in shade beside it
    mx = (x0 + x1) / 2 + jit(10)
    ink(f"M{x0},{y0 + 6} Q{mx:.0f},{(y0 + y1) / 2:.0f} {x1},{y1}", 0.9, 0.3)
    if x0 > 1900:
        wash(f"M{x0 + 2},{y0 + 8} Q{mx + 4:.0f},{(y0 + y1) / 2:.0f} {x1 + 4},{y1} L{x1 + 22},{y1} Q{mx + 18:.0f},{(y0 + y1) / 2:.0f} {x0 + 10},{y0 + 8} Z", "#7A6A8E", 0.22, "wcs", g=True)
for x0, y0, x1, y1 in ribs[3:]:   # early snow lying in those gullies, tapering downhill
    mx = (x0 + x1) / 2 + 2
    add(f'<path d="M{x0 + 3},{y0 + 6} Q{mx + 5:.0f},{y0 + 26} {x0 + (x1 - x0) * 0.42 + 6:.0f},{y0 + 54} Q{mx + 1:.0f},{y0 + 26} {x0 + 11},{y0 + 7} Z" fill="#FBF8F2" opacity="0.72" filter="url(#wcs)"/>')
for i in range(70):   # the boulder fields, as the cog-railway photo shows them
    x = random.uniform(1250, 2400); y = interp(peak, x) + random.uniform(8, 110)
    ink(line([(x, y), (x + random.uniform(5, 10), y + jit(1.2))]), 0.7, 0.2)
ink(open_path(peak), 1.4, 0.55)
# The cog railway up the lit shoulder, and the red train on it.
track = [(x, interp(peak, x) + 30) for x in range(1300, 1760, 20)]
ink(open_path(track), 0.9, 0.4)
def cog_train(x, s=0.8):
    y = interp(track, x); y2 = interp(track, x + 90 * s)
    ang = math.degrees(math.atan2(y2 - y, 90 * s))
    add(f'<g transform="translate({x:.1f} {y:.1f}) rotate({ang:.2f}) scale({s})">')
    for k in range(3):
        cx = k * 31
        body = rect(cx, -13, cx + 29, 0)
        add(f'<path d="{body}" fill="{PAPER}"/>')
        wash(body, "#CC2F27", 0.95, "wct", g=True)
        wash(rect(cx, -16, cx + 29, -13), "#B9BEC4", 0.95, "wct", g=True)   # the silver roof
        for wx in range(3, 26, 6):
            add(f'<path d="{rect(cx + wx, -10, cx + wx + 4, -5)}" fill="#3A3238" opacity="0.85"/>')
        ink(body, 1.0, 0.85)
    add('</g>')
cog_train(1546, 0.9)   # between the castle's roofs and the top of the Incline

# --- The Incline's mountain, timbered, with red earth showing through.
INKSCALE = 0.7
rmt = [(820, 700), (930, 630), (1040, 560), (1150, 500), (1260, 458), (1380, 428), (1500, 408), (1620, 396), (1740, 390), (1860, 396), (1980, 414), (2100, 430), (2220, 440), (2400, 456)]
wash(ridge_d(rmt), "#8A8250", 0.92, "wc1")
for x, y, rx, ry in [(1600, 470, 60, 22), (1900, 470, 50, 18), (2150, 500, 80, 22), (1380, 520, 46, 16), (2300, 520, 50, 18), (1760, 500, 30, 40)]:
    wash(blob(x, y, rx, ry), "#A65E40", 0.5, "wc2", g=True)
for i in range(16):   # darker stands, so the timber reads as dense
    x = random.uniform(900, 2400); y = interp(rmt, x) + random.uniform(30, 160)
    wash(blob(x, y, random.uniform(40, 90), random.uniform(14, 24)), "#4E6A4A", 0.35, "wc2", g=True)
forest(rmt, 860, 2400, 1100, 230, 15, 30, ["#3E5A44", "#4E6A4A", "#2F4A3C"], ymax=700)
wash(f"M1740,390 C1860,396 1980,418 2100,434 C2220,442 2400,458 2400,458 L2400,700 L1800,700 C1780,560 1760,460 1740,390 Z", "#7E7398", 0.2, "wc3", g=True)
ink(open_path(rmt), 2.0, 0.7)

def incline(x0, y0, x1, y1):
    """The Incline: a straight cleared strip of steps, wider at its foot."""
    L = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    w0, w1 = 8, 3
    clear = poly([(x0 + nx * w0 * 1.9, y0 + ny * w0 * 1.9), (x1 + nx * w1 * 1.9, y1 + ny * w1 * 1.9), (x1 - nx * w1 * 1.9, y1 - ny * w1 * 1.9), (x0 - nx * w0 * 1.9, y0 - ny * w0 * 1.9)])
    wash(clear, "#A87A58", 0.6, "wcs")   # the red earth either side
    strip = poly([(x0 + nx * w0, y0 + ny * w0), (x1 + nx * w1, y1 + ny * w1), (x1 - nx * w1, y1 - ny * w1), (x0 - nx * w0, y0 - ny * w0)])
    wash(strip, "#E9CFA2", 0.95, "wcs")
    for k in range(1, 46):
        t = k / 46; cx, cy = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t; hw = w0 + (w1 - w0) * t
        ink(line([(cx + nx * hw * 0.85, cy + ny * hw * 0.85), (cx - nx * hw * 0.85, cy - ny * hw * 0.85)]), 0.7, 0.4)
    ink(line([(x0 + nx * w0, y0 + ny * w0), (x1 + nx * w1, y1 + ny * w1)]), 1.0, 0.6)
    ink(line([(x0 - nx * w0, y0 - ny * w0), (x1 - nx * w1, y1 - ny * w1)]), 1.0, 0.6)
    firs = []
    for i in range(40):   # timber crowding the edges
        t = random.uniform(0.05, 0.95); sd = random.choice((-1, 1)); hw = (w0 + (w1 - w0) * t) * random.uniform(2.2, 3.8)
        fx, fy = x0 + (x1 - x0) * t + nx * hw * sd, y0 + (y1 - y0) * t + ny * hw * sd
        firs.append(fir_d(fx, fy, random.uniform(14, 24) * (1.1 - t * 0.4)))
    wash(" ".join(firs), "#2F4A3C", 0.85, "wcs", g=True)
incline(1680, 566, 1742, 392)

# --- The mountain on the left, timbered, running down to the valley and to us.
lmt = [(0, 396), (140, 368), (300, 354), (460, 366), (600, 392), (720, 430), (840, 490), (940, 560), (1020, 640), (1080, 720)]
wash(ridge_d(lmt), "#8A8250", 0.92, "wc1")
for x, y, rx, ry in [(560, 470, 70, 22), (150, 560, 60, 20), (780, 560, 50, 18), (380, 620, 70, 20)]:
    wash(blob(x, y, rx, ry), "#A65E40", 0.48, "wc2", g=True)
for i in range(18):
    x = random.uniform(0, 1050); y = interp(lmt, x) + random.uniform(30, 300)
    wash(blob(x, y, random.uniform(40, 100), random.uniform(14, 26)), "#4E6A4A", 0.35, "wc2", g=True)
forest(lmt, 0, 1080, 1150, 360, 15, 32, ["#3E5A44", "#4E6A4A", "#2F4A3C"], ymax=760)
def scrub(x, y, rx, ry, cols, op=0.55, paper=False):
    """Gambel oak in October: a loose clump of small rust and orange crowns."""
    ds = [blob(x + jit(rx * 0.8), y + jit(ry * 0.7), random.uniform(10, 18), random.uniform(6, 10)) for _ in range(max(4, int(rx * ry / 70)))]
    wash(" ".join(ds), random.choice(cols), op, "wcs", g=not paper)
    wash(" ".join(ds[::3]), "#E08A3C", 0.35, "wcs", g=True)   # the sun on its crowns
for i in range(14):   # scrub oak gone rust on the lower slopes
    x = random.uniform(0, 1000); y = interp(lmt, x) + random.uniform(150, 360)
    if y < 760: scrub(x, y, random.uniform(40, 70), random.uniform(10, 16), ["#B45A2E", "#C47A34", "#A9512C"])
for i in range(8):
    x = random.uniform(900, 2400); y = interp(rmt, x) + random.uniform(80, 180)
    if y < 660: scrub(x, y, random.uniform(40, 60), random.uniform(10, 14), ["#B45A2E", "#C47A34"], 0.5)
wash(f"M300,354 C400,358 460,366 600,392 C720,430 840,490 940,560 L1080,720 L1080,{H} L640,{H} C560,700 450,460 300,354 Z", "#7E7398", 0.18, "wc3", g=True)
ink(open_path(lmt), 2.0, 0.7)

# --- The valley floor, cottonwoods along the creek in the mouth of the valley.
INKSCALE = 0.85
wash("M560,760 C700,700 900,692 1200,694 C1600,690 2000,688 2400,692 L2400,780 L560,780 Z", "#B7A464", 0.88, "wc3")
for x in range(600, 1200, 62):
    cottonwood(x + jit(14), 712 + jit(8), random.uniform(40, 52), back=True)

# --- Miramont Castle on the hill above the avenue.
SAND, SAND_D, GREEN, CREAM, ROOF, TRIMR = "#BC8C6C", "#7E5646", "#7F9C84", "#EEE2C6", "#6A4A3C", "#A2473A"
def ashlar(x0, y0, x1, y1, step=9):
    """Rock-faced sandstone: staggered short courses."""
    row = 0
    for y in range(int(y0) + step, int(y1), step):
        off = (row % 2) * 9; row += 1
        for xx in range(int(x0) + 3 + off, int(x1) - 8, 18):
            ink(line([(xx, y + jit(0.8)), (xx + 12, y + jit(0.8))]), 0.7, 0.3)

def win(x, y, w, h, frame=TRIMR, glass="#4A4752", gothic=False):
    if gothic:
        d = f"M{x},{y + h} L{x},{y + w * 0.5} Q{x},{y} {x + w / 2},{y - w * 0.3} Q{x + w},{y} {x + w},{y + w * 0.5} L{x + w},{y + h} Z"
    else:
        d = rect(x, y, x + w, y + h)
    add(f'<path d="{d}" fill="{PAPER}" stroke="{PAPER}" stroke-width="5"/>')
    wash(d, glass, 0.85, "wcs", g=True)
    ink(d, 1.0, 0.75, color=frame)

def miramont(x, base):
    wb = base - 24
    for sx, sb, sh in [(x + 70, wb - 60, 110), (x + 210, wb - 70, 120), (x + 330, wb - 40, 100)]:   # spruces behind
        wash(fir_d(sx, sb, sh, 0.5), "#2F4A3A", 0.95, "wcs")
    # The crenellated square tower at the back left.
    t = rect(x + 22, wb - 154, x + 76, wb)
    wash(t, SAND, 0.94, "wcs")
    merl = " ".join(rect(x + 22 + k * 12, wb - 164, x + 30 + k * 12, wb - 153) for k in range(5))
    wash(merl, SAND, 0.94, "wcs"); ink(t, 1.4); ink(merl, 1.0, 0.7)
    ashlar(x + 22, wb - 150, x + 76, wb - 100)
    # The stepped-gable towers at the right.
    step = [(x + 252, wb), (x + 252, wb - 138), (x + 263, wb - 138), (x + 263, wb - 148), (x + 274, wb - 148), (x + 274, wb - 158), (x + 296, wb - 158), (x + 296, wb - 148),
            (x + 307, wb - 148), (x + 307, wb - 138), (x + 318, wb - 138), (x + 318, wb)]
    wash(poly(step), SAND, 0.94, "wcs")
    wash(rect(x + 290, wb - 156, x + 318, wb), SAND_D, 0.3, "wcs", g=True)
    ink(poly(step), 1.5)
    ashlar(x + 252, wb - 136, x + 318, wb)
    win(x + 262, wb - 118, 14, 30, gothic=True); win(x + 288, wb - 120, 18, 52)
    # The green-shingled bay at the far right, on its stone base.
    wash(rect(x + 318, wb - 60, x + 376, wb), SAND, 0.94, "wcs")
    wash(rect(x + 318, wb - 104, x + 376, wb - 60), GREEN, 0.92, "wcs")
    roof = poly([(x + 312, wb - 104), (x + 332, wb - 126), (x + 362, wb - 126), (x + 382, wb - 104)])
    wash(roof, ROOF, 0.92, "wcs")
    for k in range(4): win(x + 322 + k * 13, wb - 98, 9, 28)
    ink(rect(x + 318, wb - 104, x + 376, wb), 1.4); ink(roof, 1.3)
    win(x + 334, wb - 46, 10, 24); win(x + 356, wb - 46, 10, 24)
    # The green section in the middle, with its pointed gable and arched windows.
    mid = poly([(x + 188, wb), (x + 188, wb - 118), (x + 220, wb - 150), (x + 252, wb - 118), (x + 252, wb)])
    wash(mid, GREEN, 0.92, "wcs")
    wash(rect(x + 188, wb - 40, x + 252, wb), SAND, 0.94, "wcs")
    ink(mid, 1.4); ink(line([(x + 184, wb - 116), (x + 220, wb - 154), (x + 256, wb - 116)]), 1.6, 0.85, color=ROOF)
    win(x + 198, wb - 100, 12, 26, gothic=True); win(x + 228, wb - 100, 12, 26, gothic=True)
    wash(f"M{x + 214},{wb - 140} l6,-8 l6,8 Z", CREAM, 0.9, "wcs", g=True)
    win(x + 200, wb - 34, 12, 18); win(x + 228, wb - 34, 12, 18)
    # The left wing: stone below, a band of windows in the green bay, a brown hip roof.
    wash(rect(x, wb - 44, x + 116, wb), SAND, 0.94, "wcs")
    wash(rect(x, wb - 96, x + 116, wb - 44), GREEN, 0.92, "wcs")
    lroof = poly([(x - 8, wb - 96), (x + 28, wb - 130), (x + 84, wb - 130), (x + 124, wb - 96)])
    wash(lroof, ROOF, 0.92, "wcs")
    for k in range(6): win(x + 6 + k * 18, wb - 86, 12, 32)
    ink(rect(x, wb - 96, x + 116, wb), 1.5); ink(lroof, 1.3)
    wash(rect(x, wb - 50, x + 116, wb - 44), CREAM, 0.9, "wcs", g=True)
    ashlar(x, wb - 40, x + 116, wb)
    win(x + 14, wb - 34, 14, 24); win(x + 84, wb - 34, 14, 24)
    # The round entrance tower, the half-timbered gable over it, and the porch.
    gx0, gx1 = x + 112, x + 192
    wash(rect(gx0 + 2, wb - 132, gx1 - 2, wb - 92), GREEN, 0.92, "wcs")
    gable = poly([(gx0 - 6, wb - 130), ((gx0 + gx1) / 2, wb - 180), (gx1 + 6, wb - 130)])
    wash(gable, CREAM, 0.94, "wcs")
    for k in range(1, 6):
        gx = gx0 + (gx1 - gx0) * k / 6
        ink(line([(gx, wb - 131), (gx, wb - 131 - (1 - abs(gx - (gx0 + gx1) / 2) / ((gx1 - gx0) / 2 + 6)) * 46)]), 1.1, 0.7, color=ROOF)
    ink(line([(gx0 - 10, wb - 126), ((gx0 + gx1) / 2, wb - 184), (gx1 + 10, wb - 126)]), 2.2, 0.9, color=ROOF)
    win((gx0 + gx1) / 2 - 8, wb - 158, 16, 16)
    win((gx0 + gx1) / 2 - 9, wb - 124, 18, 28, gothic=True)
    drum = f"M{gx0 + 4},{wb} L{gx0 + 4},{wb - 90} Q{(gx0 + gx1) / 2},{wb - 98} {gx1 - 4},{wb - 90} L{gx1 - 4},{wb} Z"
    wash(drum, SAND, 0.95, "wcs")
    wash(f"M{gx1 - 26},{wb} L{gx1 - 26},{wb - 92} Q{gx1 - 12},{wb - 92} {gx1 - 4},{wb - 90} L{gx1 - 4},{wb} Z", SAND_D, 0.35, "wcs", g=True)
    wash(f"M{gx0 + 4},{wb} L{gx0 + 4},{wb - 90} Q{gx0 + 10},{wb - 91} {gx0 + 14},{wb - 92} L{gx0 + 14},{wb} Z", SAND_D, 0.2, "wcs", g=True)
    ashlar(gx0 + 6, wb - 88, gx1 - 6, wb - 40)
    ink(drum, 1.6)
    for rx in range(int(gx0 + 6), int(gx1 - 4), 6):   # the iron railing on the drum
        ink(line([(rx, wb - 93), (rx, wb - 103)]), 0.7, 0.7, color="#2E2A2C")
    ink(line([(gx0 + 4, wb - 103), (gx1 - 4, wb - 103)]), 0.9, 0.8, color="#2E2A2C")
    px0, px1 = gx0 + 18, gx1 - 18
    porch = poly([(px0, wb), (px0, wb - 38), ((px0 + px1) / 2, wb - 58), (px1, wb - 38), (px1, wb)])
    wash(porch, SAND, 0.95, "wcs")
    wash(poly([(px0 + 4, wb - 40), ((px0 + px1) / 2, wb - 54), (px1 - 4, wb - 40)]), CREAM, 0.9, "wcs", g=True)
    wash(rect(px0 + 8, wb - 34, px1 - 8, wb), "#2E2626", 0.85, "wcs", g=True)
    ink(porch, 1.4); ink(line([(px0 - 4, wb - 36), ((px0 + px1) / 2, wb - 60), (px1 + 4, wb - 36)]), 1.8, 0.9, color=ROOF)
    # The long sandstone wall below it all.
    wall = poly([(x - 14, base), (x - 14, wb + 2), (x + 392, wb + 2), (x + 392, base)])
    wash(wall, "#B08466", 0.95, "wcs")
    ashlar(x - 14, wb + 2, x + 392, base, step=8)
    for ax in (x + 214, x + 238):
        win(ax, wb + 6, 14, 14, frame="#2E2A2C", glass="#3A3438", gothic=True)
    ink(wall, 1.6)
    add(f'<path d="M{x + 140},{base} l0,-22 l40,0 l0,22 Z" fill="#D99A86" opacity="0.9" filter="url(#wcs)"/>')   # the steps
    for k in range(4): ink(line([(x + 140, base - 5 - k * 5), (x + 180, base - 5 - k * 5)]), 0.7, 0.5)

INKSCALE = 0.85
MS = 0.86   # drawn smaller and set higher, in the slope above the avenue
add(f'<g transform="translate({1176 - 1176 * MS:.1f} {528 - 528 * MS:.1f}) scale({MS})">')
miramont(1176, 528)
add('</g>')
# The hillside between the castle's wall and the avenue's roofs: spruces and a gold tree.
wash(" ".join(fir_d(x, 572 + jit(6), random.uniform(50, 78), 0.4) for x in (1180, 1222, 1290, 1336, 1446, 1496)), "#2F4A3A", 0.92, "wcs")
cottonwood(1396, 584, 32, back=True, shadow=False)

# --- Big trees behind the avenue, gold and green, clear of the Incline.
for x, r in [(1580, 52), (1840, 50), (2010, 56)]:
    cottonwood(x + jit(10), 620 + jit(6), r, back=True, shadow=False)
wash(fir_d(1950, 566, 140, 0.36), "#2F4A3A", 0.95, "wcs")   # the tall spruce behind the cream block

# --- Manitou Avenue, base y 712.
B = 712
INKSCALE = 0.95
def sign_band(x0, x1, y, cols):
    n = len(cols); w = (x1 - x0) / n
    for k, c in enumerate(cols):
        wash(rect(x0 + k * w, y, x0 + (k + 1) * w, y + 12), c, 0.92, "wcs", g=True)
    ink(rect(x0, y, x1, y + 12), 1.0, 0.7)

def shopfront(x, w, top=34):
    wash(rect(x + 8, B - top, x + w - 8, B - 4), "#5C5560", 0.6, "wcs", g=True)
    for k in range(1, 3):
        ink(line([(x + 8 + (w - 16) * k / 3, B - top), (x + 8 + (w - 16) * k / 3, B - 4)]), 0.8, 0.45)

def striped_awning(x, w, y, cols):
    a = [(x + 4, y), (x + w - 4, y), (x + w + 4, y + 18), (x - 4, y + 18)]
    add(f'<path d="{poly(a)}" fill="{PAPER}"/>')
    n = int(w / 9)
    for k in range(n):
        t0, t1 = k / n, (k + 1) / n
        sp = [(x + 4 + (w - 8) * t0, y), (x + 4 + (w - 8) * t1, y), (x - 4 + (w + 8) * t1, y + 18), (x - 4 + (w + 8) * t0, y + 18)]
        wash(poly(sp), cols[k % len(cols)], 0.9, "wcs", g=True)
    ink(poly(a), 1.3, 0.8)

def buff_block(x):
    """The buff-brick two-storey from the hero photo."""
    w, h = 142, 124
    wall = rect(x, B - h, x + w, B)
    wash(wall, "#CFA26C", 0.93, "wcs")
    wash(rect(x + w * 0.72, B - h, x + w, B), STONE_D, 0.2, "wcs", g=True)
    wash(rect(x - 3, B - h - 6, x + w + 3, B - h + 3), "#A4473A", 0.85, "wcs", g=True)   # red coping
    for px in (x + 2, x + w / 2 - 3, x + w - 8):
        wash(rect(px, B - h + 3, px + 6, B - 58), "#B5704A", 0.4, "wcs", g=True)   # pilasters
    ink(wall, 2.0)
    coursing(x, B - h + 4, x + w, B - 60, step=10)
    ink(rect(x + 14, B - h + 12, x + 62, B - h + 26), 1.0, 0.55); ink(rect(x + 80, B - h + 12, x + 128, B - h + 26), 1.0, 0.55)   # the recessed panels
    for wx in (x + 12, x + 40, x + 84, x + 112):
        trimmed(wx, B - h + 34, 18, 28)
        add(f'<path d="{rect(wx, B - h + 50, wx + 18, B - h + 62)}" fill="#F6F1E8"/>')
        for k in range(4):   # the white lattice
            ink(line([(wx + k * 5, B - h + 62), (wx + k * 5 + 5, B - h + 50)]), 0.5, 0.45)
    sign_band(x + 2, x + w - 2, B - 60, ["#2E2A2E", "#E2C04A"])
    striped_awning(x, w, B - 46, ["#7A2A2A", "#3F5E4A", "#C9A86A"])
    shopfront(x, w, 26)
    return x + w

def bracket_block(x):
    """The narrow brick building with the bracketed cornice and the blue scalloped awning."""
    w, h = 96, 134
    wall = rect(x, B - h, x + w, B)
    wash(wall, "#A9573F", 0.93, "wcs")
    wash(rect(x + w * 0.7, B - h, x + w, B), STONE_D, 0.25, "wcs", g=True)
    ink(wall, 2.0)
    coursing(x, B - h + 18, x + w, B - 56, step=10)
    corn = rect(x - 8, B - h - 4, x + w + 8, B - h + 14)
    wash(corn, "#6E4A34", 0.92, "wcs"); ink(corn, 1.3, 0.8)
    for k in range(int((w + 10) / 10)):
        ink(line([(x - 4 + k * 10, B - h + 14), (x - 4 + k * 10, B - h + 22)]), 1.4, 0.6)   # brackets
    for wx in (x + 16, x + 58):
        wash(poly([(wx - 5, B - h + 40), (wx + 11, B - h + 28), (wx + 27, B - h + 40)]), "#E9DCC0", 0.9, "wcs", g=True)   # pointed hoods
        ink(line([(wx - 5, B - h + 40), (wx + 11, B - h + 28), (wx + 27, B - h + 40)]), 1.0, 0.7)
        trimmed(wx, B - h + 44, 22, 34)
    aw = [(x + 4, B - 50), (x + w + 2, B - 50), (x + w + 14, B - 30), (x - 2, B - 30)]
    wash(poly(aw), "#2E6DB4", 0.92, "wcs"); ink(poly(aw), 1.3, 0.8)
    for k in range(int((w + 14) / 9)):   # the white scallops
        add(f'<path d="M{x + k * 9:.0f},{B - 30} q4.5,6 9,0" stroke="#FBF8F2" stroke-width="2" fill="none" opacity="0.9"/>')
    shopfront(x, w, 28)
    return x + w

def arched_block(x):
    """The red-brick three-storey on the 700 block."""
    w, h = 214, 178
    wall = rect(x, B - h, x + w, B)
    wash(wall, "#B85A3C", 0.94, "wcs")
    wash(rect(x + w * 0.74, B - h, x + w, B), STONE_D, 0.24, "wcs", g=True)
    STN = "#DB9A70"
    for fx in (x - 4, x + w / 2 - 8, x + w - 12):   # the sandstone finials and piers
        wash(rect(fx, B - h - 16, fx + 16, B - h + 6), STN, 0.92, "wcs"); ink(rect(fx, B - h - 16, fx + 16, B - h + 6), 1.1, 0.7)
        wash(rect(fx + 2, B - 64, fx + 14, B), STN, 0.8, "wcs", g=True)
    for y in (B - h + 70, B - 64):   # the belt courses
        wash(rect(x - 3, y, x + w + 3, y + 7), STN, 0.88, "wcs", g=True)
        ink(line([(x - 3, y), (x + w + 3, y)]), 1.0, 0.6)
    for k in range(int(w / 8)):   # the corbelled frieze
        ink(line([(x + 4 + k * 8, B - h + 8), (x + 4 + k * 8, B - h + 14)]), 0.8, 0.5)
    ink(line([(x, B - h + 16), (x + w, B - h + 16)]), 0.9, 0.5)
    ink(wall, 2.1)
    coursing(x, B - h + 18, x + w, B - 66, step=10)
    xs = [x + 16 + k * 23 for k in range(4)] + [x + 116 + k * 23 for k in range(4)]
    for wx in xs:   # the arched top floor, with window boxes
        wash(f"M{wx - 4},{B - h + 64} L{wx - 4},{B - h + 34} a12,12 0 0,1 24,0 L{wx + 20},{B - h + 64} Z", STN, 0.9, "wcs", g=True)
        add(f'<path d="M{wx},{B - h + 62} L{wx},{B - h + 36} a8,8 0 0,1 16,0 L{wx + 16},{B - h + 62} Z" fill="{PAPER}"/>')
        wash(f"M{wx},{B - h + 62} L{wx},{B - h + 36} a8,8 0 0,1 16,0 L{wx + 16},{B - h + 62} Z", WIN, 0.85, "wcs", g=True)
        ink(f"M{wx - 4},{B - h + 64} L{wx - 4},{B - h + 34} a12,12 0 0,1 24,0 L{wx + 20},{B - h + 64}", 1.1, 0.7)
        wash(rect(wx - 2, B - h + 62, wx + 18, B - h + 67), "#3F5E4A", 0.9, "wcs", g=True)
        for k in range(3):
            add(f'<circle cx="{wx + 2 + k * 6 + jit(1):.1f}" cy="{B - h + 61 + jit(1):.1f}" r="2.6" fill="#C8302A" opacity="0.9"/>')
        trimmed(wx, B - h + 84, 16, 34)
    shopfront(x, w, 56)
    return x + w

def narrow_block(x):
    """The narrow brick front with the maroon awning."""
    w, h = 62, 148
    wall = rect(x, B - h, x + w, B)
    wash(wall, "#A44A36", 0.93, "wcs")
    wash(rect(x - 3, B - h - 8, x + w + 3, B - h + 4), "#7A3A2A", 0.8, "wcs", g=True)
    ink(wall, 2.0)
    coursing(x, B - h + 6, x + w, B - 60, step=10)
    for wx in (x + 8, x + 25, x + 42):
        add(f'<path d="M{wx - 2},{B - h + 46} L{wx - 2},{B - h + 22} a8,8 0 0,1 16,0 L{wx + 14},{B - h + 46} Z" fill="{PAPER}"/>')
        ink(f"M{wx - 2},{B - h + 46} L{wx - 2},{B - h + 22} a8,8 0 0,1 16,0 L{wx + 14},{B - h + 46}", 1.0, 0.7)
    aw = f"M{x - 2},{B - h + 52} L{x + w + 2},{B - h + 52} L{x + w + 6},{B - h + 74} C{x + w * 0.5},{B - h + 80} {x + w * 0.5},{B - h + 80} {x - 6},{B - h + 74} Z"
    wash(aw, "#8A2232", 0.94, "wcs"); ink(aw, 1.3, 0.8)
    trimmed(x + 12, B - h + 88, 14, 22); trimmed(x + 36, B - h + 88, 14, 22)
    shopfront(x, w, 34)
    return x + w

def gable_front(x):
    """The cream front with its pointed gable."""
    w, h = 82, 128
    face = poly([(x, B), (x, B - h), (x + w / 2, B - h - 46), (x + w, B - h), (x + w, B)])
    wash(face, "#E6D3A8", 0.94, "wcs")
    wash(poly([(x + w / 2, B - h - 46), (x + w, B - h), (x + w, B), (x + w * 0.74, B)]), STONE_D, 0.2, "wcs", g=True)
    ink(face, 2.0)
    ink(line([(x - 6, B - h + 4), (x + w / 2, B - h - 52), (x + w + 6, B - h + 4)]), 2.0, 0.85, color="#6A4A3C")
    wash(poly([(x + w / 2 - 14, B - h - 8), (x + w / 2, B - h - 30), (x + w / 2 + 14, B - h - 8)]), "#4A4752", 0.8, "wcs", g=True)
    ink(line([(x + 2, B - h + 2), (x + w - 2, B - h + 2)]), 1.2, 0.6)
    for k in range(int(w / 10)): ink(line([(x + 4 + k * 10, B - h + 4), (x + 4 + k * 10, B - h + 12)]), 1.0, 0.5)   # brackets
    for wx in (x + 10, x + 32, x + 54):
        add(f'<path d="M{wx - 2},{B - h + 62} L{wx - 2},{B - h + 28} a9,9 0 0,1 18,0 L{wx + 16},{B - h + 62} Z" fill="{PAPER}"/>')
        wash(f"M{wx},{B - h + 60} L{wx},{B - h + 28} a7,7 0 0,1 14,0 L{wx + 14},{B - h + 60} Z", WIN, 0.85, "wcs", g=True)
        ink(f"M{wx - 2},{B - h + 62} L{wx - 2},{B - h + 28} a9,9 0 0,1 18,0 L{wx + 16},{B - h + 62}", 1.0, 0.7)
    shopfront(x, w, 40)
    return x + w

def cream_block(x):
    """The cream three-storey block with the red cornice, from the hero photo."""
    w, h = 172, 168
    wall = rect(x, B - h, x + w, B)
    wash(wall, "#EADFB8", 0.94, "wcs")
    wash(rect(x + w * 0.72, B - h, x + w, B), "#8E7A64", 0.22, "wcs", g=True)
    RED = "#8E3A2E"
    wash(rect(x - 4, B - h - 8, x + w + 4, B - h + 4), RED, 0.9, "wcs", g=True)
    for k in range(int(w / 9)):   # the corbel table under the cornice
        ink(f"M{x + 2 + k * 9},{B - h + 12} a4.5,4.5 0 0,0 9,0", 0.8, 0.55)
    wash(rect(x - 2, B - 66, x + w + 2, B - 58), RED, 0.85, "wcs", g=True)
    ink(wall, 2.0)
    ink(rect(x - 4, B - h - 8, x + w + 4, B - h + 4), 1.2, 0.7)
    for row, (y0, hh) in enumerate([(B - h + 24, 28), (B - h + 70, 30)]):
        for k in range(5):
            wx = x + 14 + k * 32
            for j in (0, 10):
                trimmed(wx + j, y0, 7, hh)
            wash(rect(wx - 4, y0 + hh + 4, wx + 21, y0 + hh + 8), RED, 0.8, "wcs", g=True)
    for k in range(4):   # arched openings on the ground floor
        ax = x + 14 + k * 40
        wash(f"M{ax},{B - 4} L{ax},{B - 34} a12,12 0 0,1 24,0 L{ax + 24},{B - 4} Z", "#5C5560", 0.65, "wcs", g=True)
        ink(f"M{ax},{B - 4} L{ax},{B - 34} a12,12 0 0,1 24,0 L{ax + 24},{B - 4}", 1.0, 0.6)
    return x + w

def cliff_house(x):
    """The Cliff House: cream storeys over a sage-green floor, a porch on sandstone piers, and its tower."""
    w = 300
    # Roof and dormers.
    roof = poly([(x - 6, B - 150), (x + 34, B - 188), (x + w - 34, B - 188), (x + w + 6, B - 150)])
    wash(roof, "#6E5546", 0.93, "wcs"); ink(roof, 1.6)
    for dx in (54, 238):
        dm = poly([(x + dx - 14, B - 150), (x + dx - 14, B - 172), (x + dx, B - 186), (x + dx + 14, B - 172), (x + dx + 14, B - 150)])
        wash(dm, "#EEE2BC", 0.94, "wcs"); ink(dm, 1.2); trimmed(x + dx - 6, B - 170, 12, 14)
    # Storeys.
    top = rect(x, B - 150, x + w, B - 96)
    wash(top, "#EEE2BC", 0.94, "wcs")
    for y in range(B - 144, B - 98, 7):   # clapboard
        ink(line([(x + 2, y), (x + w - 2, y)]), 0.5, 0.2)
    sage = rect(x, B - 96, x + w, B - 56)
    wash(sage, "#A9B48E", 0.94, "wcs")
    wash(rect(x + w * 0.72, B - 150, x + w, B - 56), "#8E7A64", 0.22, "wcs", g=True)
    for k in range(9):
        trimmed(x + 12 + k * 32, B - 140, 12, 30)
        trimmed(x + 12 + k * 32, B - 88, 12, 24)
    ink(rect(x, B - 150, x + w, B - 56), 2.0)
    ink(line([(x - 4, B - 96), (x + w + 4, B - 96)]), 1.2, 0.6)
    # The porch: a balustrade on its roof, sandstone piers below.
    add(f'<path d="{rect(x - 8, B - 68, x + w + 8, B - 56)}" fill="#F8F3EA"/>')
    for bx in range(int(x - 6), int(x + w + 8), 5):
        ink(line([(bx, B - 67), (bx, B - 57)]), 0.6, 0.4)
    ink(line([(x - 8, B - 68), (x + w + 8, B - 68)]), 1.2, 0.75); ink(line([(x - 10, B - 54), (x + w + 10, B - 54)]), 1.8, 0.85)
    wash(rect(x - 6, B - 54, x + w + 6, B), "#4A403E", 0.62, "wcs", g=True)
    for k in range(7):
        px = x - 6 + k * (w + 6) / 6
        pier = rect(px - 7, B - 54, px + 7, B)
        wash(pier, "#C9A386", 0.95, "wcs"); ink(pier, 1.1, 0.75)
        for y in range(B - 48, B - 2, 9): ink(line([(px - 5, y), (px + 5, y)]), 0.5, 0.35)
    ink(line([(x + 10, B - 20), (x + w - 10, B - 20)]), 1.4, 0.85, color="#F3EDE2")   # the porch rail
    for bx in range(int(x + 12), int(x + w - 10), 6):
        ink(line([(bx, B - 20), (bx, B - 8)]), 0.7, 0.6, color="#EDE6DA")
    # The tower.
    tx0, tx1 = x + 112, x + 188
    tw = rect(tx0, B - 236, tx1, B - 150)
    wash(tw, "#EEE2BC", 0.95, "wcs")
    wash(rect(tx0 + 54, B - 236, tx1, B - 150), "#8E7A64", 0.22, "wcs", g=True)
    ink(tw, 1.8)
    tgab = poly([(tx0 + 8, B - 236), (tx0 + 38, B - 262), (tx1 - 8, B - 236)])
    troof = poly([(tx0 - 10, B - 232), (tx0 + 38, B - 306), (tx1 + 10, B - 232)])
    wash(troof, "#6E5546", 0.94, "wcs"); ink(troof, 1.6)
    wash(tgab, "#EEE2BC", 0.95, "wcs"); ink(tgab, 1.3)
    trimmed(tx0 + 32, B - 254, 12, 12)
    ink(line([(tx0 + 38, B - 306), (tx0 + 38, B - 326)]), 1.4, 0.85)
    wash(rect(tx0 + 4, B - 222, tx1 - 4, B - 208), "#3E6B4A", 0.92, "wcs", g=True)   # the green sign
    add(f'<text x="{(tx0 + tx1) / 2}" y="{B - 211}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="9" font-weight="bold" letter-spacing="0.3" fill="#F4EEDC" opacity="0.95">CLIFF HOUSE</text>')
    for k in range(3): trimmed(tx0 + 10 + k * 22, B - 198, 12, 34)
    return x + w

# Sidewalk, then the buildings.
wash(poly([(1210, B - 4), (2390, B - 4), (2400, B + 14), (1196, B + 14)]), "#D9AE9C", 0.86, "wcs")
xx = 1196
xx = buff_block(xx) + 3
xx = bracket_block(xx) + 3
xx = arched_block(xx) + 3
xx = narrow_block(xx) + 3
xx = gable_front(xx) + 3
xx = cream_block(xx) + 22
cottonwood(xx - 6, B + 8, 40)
cliff_house(xx + 30)
wash(poly([(1196, B + 2), (2400, B + 2), (2400, B + 12), (1190, B + 12)]), "#7E7398", 0.4, "wcs", g=True)
for lx in (1342, 1556, 1782, 1966):   # black lamp posts with lantern heads
    ink(line([(lx, B + 14), (lx, B - 78)]), 2.6, 0.95, color="#2B2A2E")
    wash(f"M{lx - 7},{B - 78} L{lx - 9},{B - 94} Q{lx},{B - 104} {lx + 9},{B - 94} L{lx + 7},{B - 78} Z", "#2B2A2E", 0.9, "wcs", g=True)
ink(line([(1190, B + 14), (2400, B + 14)]), 2.6, 0.9, color="#D9B23A")   # the yellow curb
wash(poly([(1180, B + 16), (2400, B + 16), (2400, B + 44), (1160, B + 44)]), "#A39C94", 0.8, "wcs")   # the street
ink(line([(1160, B + 44), (2400, B + 44)]), 1.4, 0.55)

# --- Foreground: the near slope at left, the spring's garden at right.
INKSCALE = 1.1
wash("M0,770 C600,760 1200,758 1600,758 C2000,760 2400,756 2400,756 L2400,1000 L0,1000 Z", "#A29D5E", 0.9, "wc1")   # the lawn
wash("M1100,860 C1500,840 1900,850 2400,836 L2400,1000 L1100,1000 Z", "#8E8F52", 0.3, "wc3", g=True)

def pine(x, base, h):
    """A near Douglas fir: a dark spire, lit on its left, with a red-brown trunk."""
    d = fir_d(x, base - h * 0.06, h, 0.46)
    wash(d, "#2F4A3C", 0.94, "wcs")
    wash(poly([(x, base - h * 1.06), (x - h * 0.24, base - h * 0.06), (x - h * 0.02, base - h * 0.06)]), "#6F8F5A", 0.4, "wcs", g=True)
    ink(d, 1.2, 0.5)
    ink(line([(x, base), (x, base - h * 0.1)]), 3.0, 0.85, color="#5A3424")

def shrub(x, base, r, col, hi=None):
    ds = [blob(x + jit(r * 0.6), base - r * 0.45 + jit(r * 0.25), r * random.uniform(0.4, 0.6), r * random.uniform(0.3, 0.42)) for _ in range(6)]
    wash(" ".join(ds), col, 0.88, "wcs")
    if hi: wash(" ".join(ds[::2]), hi, 0.4, "wcs", g=True)
    for k in range(4):
        ink(line([(x + jit(r * 0.3), base), (x + jit(r * 0.7), base - r * random.uniform(0.4, 0.8))]), 0.9, 0.5)

def rock(cx, cy, w, h):
    """A low slab of red sandstone, lit on top, its face in shade."""
    pts = [(cx - w / 2, cy), (cx - w / 2 + w * 0.12, cy - h), (cx + w / 2 - w * 0.1, cy - h - jit(3)), (cx + w / 2, cy + jit(2))]
    wash(poly(pts), "#BC6B4C", 0.94, "wcs")
    wash(poly([(cx - w / 2, cy), (cx + w / 2, cy), (cx + w / 2 - 4, cy + h * 0.55), (cx - w / 2 + 6, cy + h * 0.55)]), "#6E3428", 0.6, "wcs", g=True)
    ink(poly(pts), 1.5, 0.8)

# The near slope at left: the mountain's foot, firs, scrub oak and red rock.
bank = [(0, 724), (300, 744), (600, 786), (880, 846), (1100, 918), (1240, 1000)]
wash("M0,1000 L0,724 " + smooth(bank) + " Z", "#7A7444", 0.94, "wc1")
wash("M0,1000 L0,790 C300,800 600,846 880,910 C1000,944 1060,972 1090,1000 Z", "#55583A", 0.42, "wc3", g=True)
def oak_clump(x, base, r):
    """A clump of Gambel oak in its October rust: rounded crowns, shade on the right."""
    blobs = [(-0.6, -0.45, 0.55), (0.1, -0.6, 0.62), (0.75, -0.42, 0.5), (-0.2, -0.3, 0.5), (0.4, -0.28, 0.48)]
    d = " ".join(blob(x + dx * r, base + dy * r, rr * r, rr * r * 0.72) for dx, dy, rr in blobs)
    wash(d, random.choice(["#A44E2A", "#B0582C"]), 0.86, "wc2")
    wash(f"M{x + r * 0.15:.0f},{base - r * 1.05:.0f} C{x + r * 1.2:.0f},{base - r * 0.9:.0f} {x + r * 1.3:.0f},{base - r * 0.1:.0f} {x + r * 0.2:.0f},{base:.0f} Z", "#6E3020", 0.4, "wcs", g=True)
    wash(" ".join(blob(x + dx * r - r * 0.15, base + dy * r - r * 0.1, rr * r * 0.45, rr * r * 0.3) for dx, dy, rr in blobs[:2]), "#D9893A", 0.4, "wcs", g=True)
    for k in range(3):
        ink(line([(x + jit(r * 0.4), base), (x + jit(r * 0.6), base - r * random.uniform(0.3, 0.6))]), 1.0, 0.55)
for x, y, r in [(120, 836, 44), (190, 850, 32), (430, 884, 50), (760, 940, 44), (300, 966, 54), (980, 990, 36), (620, 1000, 40)]:   # scrub oak, rust and red
    oak_clump(x, y, r)
firs = {"#2F4A3C": [], "#3E5A44": []}
for i in range(70):   # timber on the slope
    x = random.uniform(0, 1100); y = interp(bank, x) + random.uniform(10, 120)
    if y < 1000: firs[random.choice(list(firs))].append(fir_d(x, y, random.uniform(30, 56)))
for c, ds in firs.items(): wash(" ".join(ds), c, 0.85, "wcs", g=True)
for x, h in [(60, 250), (190, 180), (560, 160), (930, 140)]:
    pine(x, interp(bank, x) + h * 0.5, h)
for i in range(150):
    x = random.uniform(0, 1150); top = interp(bank, x) + random.uniform(10, 260); L = random.uniform(10, 24)
    if top < 990: ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.36)

def leaf_d(x0, y0, x1, y1, wid):
    L = math.hypot(x1 - x0, y1 - y0) or 1; nx, ny = -(y1 - y0) / L * L * wid, (x1 - x0) / L * L * wid
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    return f"M{x0:.1f},{y0:.1f} Q{mx + nx:.1f},{my + ny:.1f} {x1:.1f},{y1:.1f} Q{mx - nx:.1f},{my - ny:.1f} {x0:.1f},{y0:.1f} Z"

def sumac(x, base, h, col="#C9412B"):
    """Staghorn sumac in its October red: fronds of paired leaflets on a few stems."""
    ds = []
    for k in range(8):
        a = math.radians(-90 + jit(58)); L = h * random.uniform(0.6, 1.0)
        sx, sy = x + jit(8), base
        ink(line([(sx, sy), (sx + math.cos(a) * L * 0.55, sy + math.sin(a) * L * 0.55)]), 1.3, 0.65, color="#5A3424")
        for j in range(5):
            t = 0.45 + j * 0.12; px, py = sx + math.cos(a) * L * t, sy + math.sin(a) * L * t
            for sd in (-1, 1):
                b = a + sd * 0.75
                ds.append(leaf_d(px, py, px + math.cos(b) * h * 0.2, py + math.sin(b) * h * 0.2, 0.22))
        ex, ey = sx + math.cos(a) * L, sy + math.sin(a) * L
        ds.append(leaf_d(ex, ey, ex + math.cos(a) * h * 0.2, ey + math.sin(a) * h * 0.2, 0.22))
    wash(" ".join(ds), col, 0.92, "wcs")
    wash(" ".join(ds[::3]), "#E3812E", 0.5, "wcs", g=True)

def spring_pavilion(cx, base, s=1.0):
    """The 7 Minute Spring's pavilion, from the guide's photo."""
    P = lambda dx, dy: (cx + dx * s, base - dy * s)
    BR, GR, CR, SH = "#4A2E20", "#5E676B", "#EFE3C8", "#4A3A34"
    # The pink sandstone steps, widening toward us.
    for k in range(6):
        y0 = base + k * 13 * s; hw = (34 + k * 5) * s
        st = poly([(cx - hw, y0), (cx + hw, y0), (cx + hw + 2 * s, y0 + 12 * s), (cx - hw - 2 * s, y0 + 12 * s)])
        wash(st, "#DA9C88", 0.92, "wcs")
        wash(poly([(cx - hw, y0 + 8 * s), (cx + hw, y0 + 8 * s), (cx + hw + 2 * s, y0 + 12 * s), (cx - hw - 2 * s, y0 + 12 * s)]), "#9E5A4C", 0.45, "wcs", g=True)
        ink(line([(cx - hw - 2 * s, y0 + 12 * s), (cx + hw + 2 * s, y0 + 12 * s)]), 1.0, 0.5)
    wash(poly([P(-140, -4), P(140, -4), P(140, 4), P(-140, 4)]), "#C98272", 0.8, "wcs")   # its pink floor
    # The wings, each with its gable and arched opening.
    for sd in (-1, 1):
        a, b = 64 * sd, 132 * sd
        body = poly([P(a, 0), P(a, 92), P(b, 92), P(b, 0)])
        add(f'<path d="{body}" fill="{PAPER}"/>')
        wash(body, SH, 0.72, "wcs", g=True)   # the shade inside
        wash(poly([P(a, 0), P(a, 26), P(b, 26), P(b, 0)]), "#C98272", 0.55, "wcs", g=True)   # the pink wall seen through
        for px in (a, b):
            pp = poly([P(px - 5 * sd, 0), P(px - 5 * sd, 94), P(px + 5 * sd, 94), P(px + 5 * sd, 0)])
            wash(pp, BR, 0.95, "wcs")
        ax0, ax1 = P(a + 8 * sd, 56), P(b - 8 * sd, 56)
        add(f'<path d="M{ax0[0]:.1f},{P(0, 92)[1]:.1f} L{ax0[0]:.1f},{ax0[1]:.1f} Q{P((a + b) / 2, 96)[0]:.1f},{P(0, 96)[1]:.1f} {ax1[0]:.1f},{ax1[1]:.1f} L{ax1[0]:.1f},{P(0, 92)[1]:.1f} Z" fill="{BR}" opacity="0.9" filter="url(#wcs)"/>')   # the arch's spandrels
        rf = poly([P((a + b) / 2, 142), P(a - 6 * sd, 92), P(30 * sd, 116), P(40 * sd, 150)])
        wash(rf, GR, 0.94, "wcs"); ink(rf, 1.2, 0.7)
        gab = poly([P(a - 6 * sd, 92), P((a + b) / 2, 142), P(b + 8 * sd, 92)])
        wash(gab, CR, 0.95, "wcs")
        gx, gy = P((a + b) / 2, 96)
        for k in range(7):   # the sunburst
            ang = math.pi * (k + 1) / 8
            ink(line([(gx, gy), (gx - math.cos(ang) * 30 * s, gy - math.sin(ang) * 34 * s)]), 1.4, 0.85, color=BR)
        ink(f"M{gx - 9 * s:.1f},{gy:.1f} a{9 * s:.1f},{9 * s:.1f} 0 0,1 {18 * s:.1f},0", 1.4, 0.9, color=BR)
        ink(line([P(a - 10 * sd, 88), P((a + b) / 2, 146), P(b + 12 * sd, 88)]), 2.8, 0.9, color=BR)
        ink(line([P(a, 92), P(b, 92)]), 2.4, 0.85, color=BR)
        for k in range(3):   # X bracing over the wing's opening
            x0 = a + (b - a) * k / 3; x1 = a + (b - a) * (k + 1) / 3
            ink(line([P(x0, 78), P(x1, 90)]), 1.2, 0.8, color=BR); ink(line([P(x0, 90), P(x1, 78)]), 1.2, 0.8, color=BR)
    # The main body: four posts, the lattice band, the open front with its sign.
    body = poly([P(-64, 0), P(-64, 118), P(64, 118), P(64, 0)])
    add(f'<path d="{body}" fill="{PAPER}"/>')
    wash(body, SH, 0.7, "wcs", g=True)
    wash(poly([P(-64, 0), P(-64, 28), P(64, 28), P(64, 0)]), "#C98272", 0.55, "wcs", g=True)
    wash(poly([P(-58, 92), P(-58, 116), P(58, 116), P(58, 92)]), CR, 0.92, "wcs")
    for k in range(4):   # the X lattice
        x0 = -58 + k * 29
        ink(line([P(x0, 92), P(x0 + 29, 116)]), 1.5, 0.9, color=BR); ink(line([P(x0, 116), P(x0 + 29, 92)]), 1.5, 0.9, color=BR)
        ink(line([P(x0, 92), P(x0, 116)]), 1.3, 0.9, color=BR)
    for px in (-64, -30, 30, 64):
        pp = poly([P(px - 5.5, 0), P(px - 5.5, 120), P(px + 5.5, 120), P(px + 5.5, 0)])
        wash(pp, BR, 0.96, "wcs"); ink(pp, 1.0, 0.6)
    wash(poly([P(-26, 82), P(-26, 91), P(26, 91), P(26, 82)]), "#7A2A2A", 0.95, "wcs", g=True)   # the spring's sign
    ink(line([P(-18, 86.5), P(18, 86.5)]), 1.0, 0.85, color="#F4EEDC")
    ink(line([P(-66, 118), P(66, 118)]), 2.6, 0.9, color=BR); ink(line([P(-66, 92), P(66, 92)]), 2.2, 0.9, color=BR)
    # The octagonal roof, its little gablet, the cupola and the spire.
    roof = poly([P(-98, 116), P(-34, 172), P(34, 172), P(98, 116)])
    wash(roof, GR, 0.95, "wcs")
    wash(poly([P(8, 172), P(34, 172), P(98, 116), P(36, 116)]), "#2E3436", 0.32, "wcs", g=True)
    for k in range(1, 5):   # shingle courses
        yy = 116 + k * 11; f = k * 11 / 56
        ink(line([P(-98 + 64 * f, yy), P(98 - 64 * f, yy)]), 0.7, 0.4)
    ink(roof, 1.7, 0.85)
    gl = poly([P(-12, 132), P(0, 150), P(12, 132)])
    wash(gl, BR, 0.92, "wcs"); wash(poly([P(-6, 135), P(0, 144), P(6, 135)]), CR, 0.92, "wcs", g=True)
    cup = poly([P(-26, 172), P(-26, 190), P(26, 190), P(26, 172)])
    wash(cup, BR, 0.95, "wcs")
    for k in range(4): ink(line([P(-22 + k * 12, 174), P(-16 + k * 12, 188)]), 0.9, 0.8, color=CR)
    ink(cup, 1.2)
    croof = poly([P(-36, 190), P(-14, 206), P(14, 206), P(36, 190)])
    wash(croof, GR, 0.95, "wcs"); ink(croof, 1.3)
    ink(line([P(0, 206), P(0, 240)]), 1.2, 0.85)

# The garden round the pavilion: blue-grey ground cover, brown shrubs, sumac, gold trees.
PCX, PB = 1600, 944
wash("M1100,935 C1500,918 1900,928 2400,912 L2400,1000 L1100,1000 Z", "#7E7E48", 0.3, "wc3", g=True)
wall7 = rect(1372, 874, 1836, 902)   # the low pink wall behind the spring, seen through it in the photo
wash(wall7, "#D9998A", 0.92, "wcs")
wash(rect(1372, 894, 1836, 902), "#9E5A4C", 0.4, "wcs", g=True)
ink(wall7, 1.2, 0.6)
for xx in range(1384, 1830, 36): ink(line([(xx, 876), (xx, 900)]), 0.6, 0.3)
for x, y, rx in [(1390, 934, 80), (1820, 940, 90), (1440, 992, 70), (1790, 996, 80), (2080, 944, 100)]:   # the blue-grey ground cover
    wash(blob(x, y, rx, rx * 0.22), "#8FA3A6", 0.55, "wc2", g=True)
    for k in range(int(rx / 4)):
        ink(line([(x + jit(rx * 0.85), y + jit(rx * 0.12)), (x + jit(rx * 0.85), y + jit(rx * 0.12))]), 0.8, 0.25, color="#4E6468")
cottonwood(1880, 880, 56)
cottonwood(2270, 890, 66)
pine(2376, 1000, 300)
def twiggy(x, base, r):
    """A shrub gone brown for the winter: fine twigs with a few dry leaves."""
    leaves = []
    for k in range(18):
        a = math.radians(-90 + jit(70)); L = r * random.uniform(0.5, 1.0)
        ex, ey = x + math.cos(a) * L, base + math.sin(a) * L
        ink(line([(x + jit(4), base), (ex, ey)]), 0.8, 0.55, color="#5A3A28")
        leaves += [blob(x + math.cos(a) * L * t + jit(3), base + math.sin(a) * L * t, 4, 2.6) for t in (0.6, 0.85, 1.0)]
    wash(" ".join(leaves), "#9A6440", 0.7, "wcs", g=True)
for x, y, r in [(1336, 938, 40), (1994, 922, 36), (2150, 940, 40)]:   # the brown shrubs of the photo
    twiggy(x, y, r)
for i in range(30):   # the last rabbitbrush and asters in the grass
    x = random.uniform(1150, 2400); y = random.uniform(790, 990)
    if abs(x - PCX) < 160 and y > 800: continue
    wash(blob(x, y, 9, 5), random.choice(["#E2B92E", "#E2B92E", "#9A7BC0"]), 0.7, "wcs", g=True)
spring_pavilion(PCX, PB, 0.95)
sumac(1420, 950, 130)
sumac(1488, 972, 96, "#D2502E")
sumac(1770, 960, 110)
for i in range(240):
    x = random.uniform(1150, 2400); top = random.uniform(770, 995); L = random.uniform(8, 20)
    if abs(x - PCX) < 150 and top > 740: continue
    ink(line([(x, top + L), (x + jit(5), top)]), 0.9, 0.35)
for i in range(36):   # fallen leaves
    x = random.uniform(1150, 2400); y = random.uniform(780, 995)
    if abs(x - PCX) < 70: continue
    wash(blob(x, y, 5, 3), random.choice(["#D6A63C", "#C9602E"]), 0.75, "wcs", g=True)

finish(sys.argv[1])
