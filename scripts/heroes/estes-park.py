"""Estes Park hero, ink and watercolour, 2400 x 1000, in the Lyons style.

The town in its valley on an autumn morning, composed as seen from the Gem
Lake trail on Lumpy Ridge, where the guide's two photographs of the whole
valley were taken, with the town brought up to street scale. Left to
right, as from that trail: Lake Estes in its tan meadows at the east end
of the valley (lumpy-ridge-trailhead.jpg, lake-estes.jpg); the white
Stanley Hotel on its rise, its long wing and taller main block under red
roofs, the cupola with its gold dome and the flag (the-stanley-hotel.jpg,
placed where hero.jpg shows it, east of downtown); and the storefronts of
West Elkhorn Avenue in the order the photograph has them: two gabled false
fronts, one with a blue gable, the board front with teal awnings and
shutters, the red-and-white chalet with its balcony and scalloped canopies,
and the big white clapboard building with its red gable, fanlights and
sandstone base, with green lamp posts and gold and red street trees
(west-elkhorn-avenue.jpg). The Big Thompson runs past the riverwalk's
green railing between banks of rounded granite cobbles and opens into the
lake, as it does (big-thompson-river-downtown.jpg). Behind: the timbered
ridges round the valley with their granite knobs (lumpy-ridge-trailhead.jpg)
and Longs Peak, its flat summit and the Diamond, with Mount Meeker beside
it, traced from hero.jpg; the granite boulders in front are the trail's
own, from hero.jpg's foreground. The pines, aspen, meadow grass, willows
and rabbitbrush are generic filler.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

def ell(x, y, rx, ry):
    return f"M{x - rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1,0 {2 * rx:.1f},0 a{rx:.1f},{ry:.1f} 0 1,0 {-2 * rx:.1f},0 Z"

def pines(trees, dark="#33533D", lit="#6F8F5A"):
    """A stand of ponderosas drawn as wclib's ponderosa(), but batched into
    one wash per layer, so a whole hillside costs two filter passes."""
    d1, d2 = [], []
    for x, base, h in trees:
        d1 += [f"M{x + jit(2) - h * rx:.1f},{base - h * dy:.1f} a{h * rx:.1f},{h * 0.17:.1f} 0 1,0 {2 * h * rx:.1f},0 a{h * rx:.1f},{h * 0.17:.1f} 0 1,0 {-2 * h * rx:.1f},0 Z"
               for dy, rx in [(0.42, 0.34), (0.68, 0.28), (0.9, 0.18)]]
        d2 += [f"M{x - h * rx:.1f},{base - h * dy:.1f} a{h * rx * 0.55:.1f},{h * 0.12:.1f} 0 1,0 {h * rx * 1.1:.1f},0 a{h * rx * 0.55:.1f},{h * 0.12:.1f} 0 1,0 {-h * rx * 1.1:.1f},0 Z"
               for dy, rx in [(0.44, 0.34), (0.7, 0.28)]]
    wash(" ".join(d1), dark, 0.92, "wcs")
    wash(" ".join(d2), lit, 0.55, "wcs", g=True)
    for x, base, h in trees:
        ink(line([(x, base), (x, base - h * 0.4)]), 1.4, 0.7)

# --- Sky, the morning cumulus well clear of the peaks.
sky()
for cx, cy, s in [(330, 140, 58), (960, 96, 42), (1440, 168, 50), (2230, 132, 54)]:
    cloud(cx, cy, s)
for cx, cy, s in [(620, 318, 30), (1150, 352, 26)]:
    cloud(cx, cy, s)

# --- Mount Meeker and Longs Peak, traced from hero.jpg (x + 380, y 312 + (y - 157) * 0.95).
INKSCALE = 0.55
def rough(pts, amt, keep=()):
    """Break a traced ridge line into rock: a jittered point between each pair."""
    out = [pts[0]]
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        if not any(a <= x1 and x2 <= b for a, b in keep):
            out.append(((x1 + x2) / 2 + jit(4), (y1 + y2) / 2 + jit(amt)))
        out.append((x2, y2))
    return out
far = rough([(x, y + 12) for x, y in [(0, 462), (160, 446), (300, 456), (460, 440), (620, 452), (800, 462), (960, 470), (1100, 468), (1180, 458), (1220, 453),
       (1280, 436), (1330, 424), (1360, 407), (1400, 398), (1440, 384), (1490, 367), (1530, 346), (1565, 333), (1585, 336), (1610, 331),
       (1640, 339), (1680, 352), (1705, 350), (1730, 358), (1760, 350), (1780, 344), (1800, 331), (1835, 320), (1858, 309), (1885, 300),
       (1940, 301), (1970, 313), (2020, 339), (2045, 352), (2070, 362), (2100, 356), (2145, 346), (2180, 352), (2240, 367), (2300, 379),
       (2350, 384), (2400, 392)]], 4, keep=[(1880, 1945)])
wash(ridge_d(far), "#A3A9CA", 0.82, "wc3")
# Snow keeps its white: a wobbled edge without wclib's pigment mottling.
add('<defs><filter id="snowf" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="12" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter></defs>')
# Shade on the west flanks, which the morning sun has not reached: each runs
# from a summit to the next col, its edges falling down and to the right as
# the spurs do.
for a, b, sb, cb in [(1610, 1730, 1712, 1786), (1940, 2070, 2060, 2116), (2145, 2400, 2246, 2420)]:
    face = [(x, interp(far, x) + 5) for x in range(a, b + 1, 8)]
    ya, yb = interp(far, a), interp(far, b)
    d = (open_path(face) + f" C{b + (cb - b) * 0.2:.0f},{yb + (505 - yb) * 0.4:.0f} {b + (cb - b) * 0.6:.0f},{yb + (505 - yb) * 0.8:.0f} {cb},505"
         + f" L{sb},505 C{a + (sb - a) * 0.75:.0f},{ya + (505 - ya) * 0.75:.0f} {a + (sb - a) * 0.3:.0f},{ya + (505 - ya) * 0.35:.0f} {a},{ya + 5:.0f} Z")
    wash(d, "#7F7699", 0.26, "wc2", g=True)
    for i in range(int((b - a) / 7)):
        x = random.uniform(a + 10, b); y0 = interp(far, x) + random.uniform(20, 120)
        if y0 < 480: ink(line([(x, y0), (x + 9, y0 + 16)]), 0.9, 0.25)
# Early snow, white against the rock: caps in lobes on Meeker, the Loft, under
# and beside the Diamond and on the shoulders, as hero.jpg has them.
def snow(x0, x1, d0, d1, ph, drop=3):
    top = [(x, interp(far, x) + drop) for x in range(x0, x1 + 1, 6)]
    bot = [(x, interp(far, x) + drop + d0 + (d1 - d0) * (0.5 + 0.5 * math.sin(x / 23 + ph)) ** 2 * min(1, (x - x0) / 24, (x1 - x) / 24) + jit(3)) for x in range(x1, x0 - 1, -6)]
    add(f'<path d="{poly(top + bot)}" fill="#FBF8F2" opacity="0.95" filter="url(#snowf)"/>')
    half = (x0 + x1) / 2
    wash(poly([(x, y + 3) for x, y in top if x > half] + [(x, y - 2) for x, y in bot if x > half]), "#9AA3C6", 0.4, "wcs", g=True)
    for i in range(int((x1 - x0) / 16)):   # rock ribs through it
        x = random.uniform(x0 + 6, x1 - 6); y = interp(far, x) + drop + random.uniform(2, d0)
        ink(line([(x, y), (x + 4 + jit(3), y + random.uniform(10, d1 * 0.7))]), 1.3, 0.5, color="#6F6A86")
for x0, x1, d0, d1, ph, dr in [(1470, 1604, 12, 44, 0.3, 3), (1616, 1724, 10, 36, 1.6, 3), (1736, 1852, 8, 30, 2.4, 3),
                               (1944, 2060, 12, 42, 0.9, 3), (2100, 2296, 12, 40, 2.0, 3)]:
    snow(x0, x1, d0, d1, ph, dr)
add('<path d="M1872,378 C1886,372 1902,376 1916,372 C1924,378 1914,386 1900,388 C1888,396 1878,392 1872,378 Z" fill="#FBF8F2" opacity="0.92" filter="url(#snowf)"/>')   # snow at the foot of the Diamond
for px, h in [(1540, 40), (1584, 30), (1694, 30), (2004, 36), (2040, 24), (2196, 28)]:   # couloirs, tapering out of the snow
    py = interp(far, px) + 16
    add(f'<path d="M{px - 4:.0f},{py:.0f} L{px + 4:.0f},{py:.0f} L{px + 5:.0f},{py + h:.0f} L{px + 3:.0f},{py + h + 6:.0f} Z" fill="#FBF8F2" opacity="0.75" filter="url(#snowf)"/>')
# The Diamond: Longs Peak's sheer east face under the flat summit, bare rock
# streaked top to bottom, with the snow ledge of Broadway across it.
dia = [(x, interp(far, x) + 4) for x in range(1864, 1929, 6)] + [(1922, 358), (1904, 376), (1880, 364)]
wash(poly(dia), "#E9C9A0", 0.3, "wcs", g=True)
for x, L in [(1874, 34), (1889, 44), (1903, 40), (1916, 28)]:
    ink(f"M{x},{interp(far, x) + 9:.0f} q{jit(2):.0f},{L / 2:.0f} {2 + jit(2):.0f},{L}", 0.8, 0.3)
add('<path d="M1874,348 C1892,345 1908,343 1922,345" stroke="#FBF8F2" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.9"/>')   # Broadway
ink(f"M1864,{interp(far, 1864) + 4:.0f} C1868,342 1874,356 1880,364", 1.2, 0.5)
ink(open_path(far), 1.5, 0.6)
for x0, y0 in [(1340, 430), (1400, 412), (1480, 392), (1560, 372), (1650, 360), (1790, 356), (1990, 340), (2050, 384), (2170, 372), (2260, 390)]:   # gullies
    ink(f"M{x0},{y0 + 12} q{jit(6):.0f},20 {jit(8):.0f},{random.uniform(36, 70):.0f}", 1.0, 0.32)

# --- The timbered ridges around the valley, traced from lumpy-ridge-trailhead.jpg.
INKSCALE = 0.6
mid = rough([(0, 430), (80, 418), (150, 440), (230, 424), (320, 448), (420, 440), (500, 416), (560, 422), (640, 438), (720, 428), (790, 408),
       (850, 414), (910, 402), (980, 414), (1060, 432), (1140, 452), (1240, 470), (1340, 484), (1440, 490), (1540, 498), (1640, 492),
       (1740, 500), (1840, 508), (1940, 500), (2040, 488), (2120, 480), (2200, 486), (2300, 498), (2400, 494)], 3)
wash(ridge_d(mid), "#7F90AA", 0.82, "wc3")
wash(poly([(x, interp(mid, x) + 30) for x in range(0, 2401, 40)] + [(2400, 600), (0, 600)]), "#5F7466", 0.22, "wc3", g=True)
for a, b in [(500, 640), (910, 1240), (2120, 2300)]:
    pts = [(x, interp(mid, x)) for x in range(a, b + 1, 12)]
    wash(poly(pts + [(b, 520), (b - 30, 560), (a + (b - a) * 0.4, 520)]), "#7F7699", 0.16, "wc3", g=True)
spires = []
for x in range(0, 2400, 7):   # the timbered skyline
    if random.random() < 0.25: continue
    y = interp(mid, x) + random.uniform(1, 5); h = random.uniform(7, 15)
    spires.append(f"M{x:.0f},{y - h:.0f} L{x + 3:.0f},{y:.0f} L{x - 3:.0f},{y:.0f} Z")
wash(" ".join(spires), "#5F7466", 0.55, "wcs", g=True)
ink(open_path(mid), 1.2, 0.45)

# --- The near hills behind town: warm grass under ponderosas, gold aspen
# in the gullies, granite knobs breaking through.
INKSCALE = 0.75
near = [(0, 466), (70, 450), (130, 458), (200, 484), (300, 512), (420, 536), (560, 556), (720, 568), (880, 574), (1040, 568),
        (1160, 556), (1260, 542), (1360, 532), (1460, 528), (1560, 532), (1640, 528), (1720, 520), (1800, 510), (1860, 504),
        (1920, 508), (2000, 520), (2080, 526), (2160, 520), (2240, 512), (2320, 518), (2400, 524)]
wash(ridge_d(near), "#ADA27A", 0.9, "wc1")
wash(poly([(x, interp(near, x)) for x in range(130, 600, 20)] + [(600, 640), (200, 640)]), "#7F7699", 0.2, "wc3", g=True)
for i in range(50):   # dry-grass strokes
    x = random.uniform(0, 2400); y0 = interp(near, x) + random.uniform(14, 90)
    if y0 < 600: ink(line([(x, y0), (x - 10, y0 + 12)]), 0.9, 0.25)
def knob(cx, cy, w, h):
    """A rounded granite dome, cracked and pale on its sunny side."""
    d = f"M{cx - w / 2:.0f},{cy:.0f} C{cx - w * 0.45:.0f},{cy - h * 0.8:.0f} {cx - w * 0.2:.0f},{cy - h:.0f} {cx + w * 0.05:.0f},{cy - h:.0f} C{cx + w * 0.35:.0f},{cy - h:.0f} {cx + w * 0.5:.0f},{cy - h * 0.6:.0f} {cx + w / 2:.0f},{cy:.0f} Z"
    wash(d, "#C9BBA9", 0.92, "wcs")
    wash(f"M{cx + w * 0.05:.0f},{cy - h:.0f} C{cx + w * 0.35:.0f},{cy - h:.0f} {cx + w * 0.5:.0f},{cy - h * 0.6:.0f} {cx + w / 2:.0f},{cy:.0f} L{cx + w * 0.1:.0f},{cy:.0f} C{cx + w * 0.2:.0f},{cy - h * 0.5:.0f} {cx + w * 0.15:.0f},{cy - h * 0.8:.0f} {cx + w * 0.05:.0f},{cy - h:.0f} Z", "#8A7D90", 0.4, "wcs", g=True)
    ink(d, 1.5, 0.7)
    for k in range(3):
        x = cx - w * 0.3 + k * w * 0.25 + jit(4)
        ink(f"M{x:.0f},{cy - h * 0.85 + k * 4:.0f} q{jit(5):.0f},{h * 0.3:.0f} {jit(6):.0f},{h * 0.6:.0f}", 1.0, 0.45)
for cx, cy, w, h in [(70, 520, 130, 62), (470, 562, 70, 30), (1010, 592, 80, 34), (2330, 560, 110, 48)]:
    knob(cx, cy, w, h)
def aspen(x, y, r):
    """A clump of aspen gone gold, white trunks under it."""
    for k in range(3):
        tx = x - r * 0.5 + k * r * 0.5 + jit(2)
        ink(line([(tx, y + r * 0.9), (tx + jit(1.5), y - r * 0.2)]), 1.0, 0.7, color="#EFE8DA")
    d = " ".join(ell(x + dx * r, y + dy * r, rr * r, rr * r * 0.85) for dx, dy, rr in [(-0.5, 0, 0.55), (0.45, 0.05, 0.5), (0, -0.35, 0.6), (0.1, 0.2, 0.5)])
    wash(d, "#E6AE34", 0.9, "wcs")
    wash(ell(x + r * 0.35, y + r * 0.05, r * 0.45, r * 0.4), "#C46F1E", 0.4, "wcs", g=True)
stand = []
for i in range(150):
    x = random.uniform(0, 2400); y = random.uniform(interp(near, x) + 18, 626)
    if y > 626: continue
    stand.append((y, x))
sky_row, x = [], 20
while x < 2400:   # ponderosas standing on the skyline
    if random.random() < 0.3: x += random.uniform(30, 90); continue
    sky_row.append((x, interp(near, x) + 10, random.uniform(20, 36)))
    x += random.uniform(26, 70)
pines(sky_row)
upper, lower, asp = [], [], []
for y, x in sorted(stand):
    t = (y - 500) / 130
    if random.random() < 0.2: asp.append((x, y - 6, 12 + t * 7))
    else: (upper if y < 590 else lower).append((x, y, random.uniform(18, 28) + t * 16))
pines(upper)
for a3 in asp: aspen(*a3)
pines(lower)
ink(open_path(near), 1.8, 0.7)

# --- The valley floor: tan meadows round the lake.
INKSCALE = 0.85
floor = [(0, 604), (600, 598), (1200, 606), (1800, 600), (2400, 604)]
wash(ridge_d(floor), "#CDB86C", 0.88, "wc3")
wash("M0,640 C500,630 900,646 1300,640 L1300,700 C900,690 500,688 0,700 Z", "#B9A85C", 0.3, "wc3", g=True)
SX, SB = 1240, 614   # where the Stanley stands
wash(f"M{SX - 120},700 C{SX - 60},640 {SX - 20},{SB + 14} {SX + 60},{SB + 10} L{SX + 380},{SB + 10} C{SX + 460},{SB + 14} {SX + 500},650 {SX + 560},700 Z", "#B9A868", 0.5, "wc3", g=True)   # the rise
for i in range(30):
    x = random.uniform(0, 1250); y = random.uniform(612, 630)
    ink(line([(x, y), (x + random.uniform(40, 110), y + jit(2))]), 0.8, 0.22)

# --- Lake Estes and the Big Thompson as one body of water, the river
# coming from the right past downtown and opening into the lake.
wt = [(-20, 634), (200, 628), (450, 632), (700, 624), (950, 630), (1100, 640), (1190, 658), (1240, 684), (1300, 712), (1400, 734),
      (1550, 750), (1800, 760), (2100, 766), (2420, 770)]
wb = [(2420, 826), (2100, 822), (1800, 812), (1550, 796), (1400, 778), (1300, 764), (1200, 758), (1000, 766), (800, 770), (500, 776),
      (200, 782), (-20, 786)]
water = "M" + f"{wt[0][0]},{wt[0][1]} " + smooth(wt) + f" L{wb[0][0]},{wb[0][1]} " + smooth(wb) + " Z"
wash(water, "#6F9EC2", 0.92, "wc3")
wash("M-20,642 C300,636 700,632 950,640 C1060,650 1100,680 1080,708 C1040,738 900,752 700,760 C400,766 100,772 -20,776 Z", "#3F6A8E", 0.4, "wc3", g=True)   # the lake's depth
wash("M-20,638 C300,632 700,628 1000,636 C1080,642 1110,652 1090,662 C900,668 400,670 -20,674 Z", "#4E6A55", 0.26, "wc3", g=True)   # the far shore's pines in the water
wash(open_path(wt[8:]) + " L2420,784 " + smooth([(2420, 784), (2100, 780), (1800, 774), (1550, 764), (1400, 750), (1300, 726)]) + " Z", "#E2B55A", 0.25, "wc2", g=True)
ink(open_path(wt), 1.6, 0.6); ink(open_path(wb), 1.6, 0.55)
for i in range(46):   # wind lines on the lake, left as paper
    x = random.uniform(20, 1150); y = random.uniform(676, 760)
    if y > interp(wb[::-1], x) - 8: continue
    L = random.uniform(30, 80)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-3 {L:.0f},0" stroke="#FBF7EE" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>')
for i in range(60):   # riffles on the river
    x = random.uniform(1300, 2400)
    y = interp(wt, x) + (interp(wb[::-1], x) - interp(wt, x)) * random.uniform(0.2, 0.85)
    L = random.uniform(24, 70)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-4 {L:.0f},0" stroke="#FBF7EE" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.9"/>')
    if random.random() < 0.3: ink(f"M{x + 5:.0f},{y + 5:.0f} q{L / 3:.0f},-3 {L * 0.6:.0f},0", 1.0, 0.4)
# Pines along the lake's far shore.
shore, x = [], -10
while x < 1190:
    if random.random() < 0.2: x += random.uniform(30, 80); continue
    shore.append((x, interp(wt, x) - 1, random.uniform(22, 40)))
    x += random.uniform(18, 46)
pines(shore)

# --- The Stanley Hotel on its rise: white clapboard, red roofs, the cupola and the flag.
def trimmed_arch(cx, y, w, h):
    """An arched window, trimmed like wclib's trimmed()."""
    add(f'<path d="M{cx - w / 2 - 2},{y + 2} L{cx - w / 2 - 2},{y - h + w / 2} a{w / 2 + 2},{w / 2 + 2} 0 0,1 {w + 4},0 L{cx + w / 2 + 2},{y + 2} Z" fill="{PAPER}"/>')
    wash(f"M{cx - w / 2},{y} L{cx - w / 2},{y - h + w / 2} a{w / 2},{w / 2} 0 0,1 {w},0 L{cx + w / 2},{y} Z", "#4A4752", 0.85, "wcs", g=True)

def stanley(x, base):
    RED, WH = "#A8362F", "#F3EEE4"
    def wall(pts):
        add(f'<path d="{poly(pts)}" fill="{PAPER}"/>')
        wash(poly(pts), "#E7E2D8", 0.55, "wcs", g=True)
        ink(poly(pts), 1.6, 0.8)
    def dormer(cx, y, w, h, arched=False):
        body = [(cx - w / 2, y), (cx - w / 2, y - h), (cx + w / 2, y - h), (cx + w / 2, y)]
        wash(poly(body), RED, 0.92, "wcs")
        ped = [(cx - w / 2 - 3, y - h), (cx, y - h - w * 0.4), (cx + w / 2 + 3, y - h)]
        add(f'<path d="{poly(ped)}" fill="{WH}"/>'); ink(poly(ped), 1.0, 0.75)
        if arched: trimmed_arch(cx, y - 3, w * 0.4, h - 6)
        else: trimmed(cx - w * 0.2, y - h + 4, w * 0.4, h - 8, "#4A4752")
        ink(poly(body), 1.0, 0.7)
    # The right-hand main block, taller, behind the porch roofs.
    rb = [(x + 228, base), (x + 228, base - 74), (x + 400, base - 74), (x + 400, base)]
    roof_r = [(x + 222, base - 74), (x + 236, base - 92), (x + 392, base - 92), (x + 406, base - 74)]
    wash(poly(roof_r), RED, 0.92, "wcs"); ink(poly(roof_r), 1.4, 0.8)
    wall(rb)
    dormer(x + 306, base - 90, 36, 22, arched=True)
    dormer(x + 250, base - 88, 18, 12); dormer(x + 366, base - 88, 18, 12)
    # The long wing to the left.
    lw = [(x, base), (x, base - 52), (x + 230, base - 52), (x + 230, base)]
    roof_l = [(x - 5, base - 52), (x + 8, base - 68), (x + 222, base - 68), (x + 232, base - 52)]
    wash(poly(roof_l), RED, 0.92, "wcs"); ink(poly(roof_l), 1.4, 0.8)
    # The cupola: a red base, a white belfry, a gold dome and the flag.
    cx = x + 214
    cb = [(cx - 12, base - 66), (cx - 12, base - 84), (cx + 12, base - 84), (cx + 12, base - 66)]
    wash(poly(cb), RED, 0.92, "wcs"); ink(poly(cb), 1.1, 0.8)
    bel = [(cx - 10, base - 84), (cx - 10, base - 104), (cx + 10, base - 104), (cx + 10, base - 84)]
    add(f'<path d="{poly(bel)}" fill="{WH}"/>'); ink(poly(bel), 1.1, 0.8)
    for k in (-5, 1):
        wash(f"M{cx + k},{base - 88} L{cx + k},{base - 97} a2.5,2.5 0 0,1 5,0 L{cx + k + 5},{base - 88} Z", "#4A4752", 0.9, "wcs", g=True)
    ink(line([(cx - 13, base - 104), (cx + 13, base - 104)]), 1.2, 0.8)
    wash(f"M{cx - 10},{base - 105} a10,11 0 0,1 20,0 Z", "#D9A63E", 0.95, "wcs"); ink(f"M{cx - 10},{base - 105} a10,11 0 0,1 20,0", 1.0, 0.8)
    ink(line([(cx, base - 116), (cx, base - 150)]), 1.2, 0.85)
    fx, fy = cx, base - 150
    flag = poly([(fx, fy), (fx + 2, fy + 18), (fx + 30, fy + 21), (fx + 30, fy + 3)])
    add(f'<path d="{flag}" fill="{PAPER}"/>')
    for k in range(3):
        wash(poly([(fx + 1, fy + 2 + k * 6), (fx + 29, fy + 5 + k * 6), (fx + 29, fy + 8 + k * 6), (fx + 1, fy + 5 + k * 6)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx, fy), (fx + 12, fy + 1), (fx + 12, fy + 10), (fx + 1, fy + 9)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(flag, 0.9, 0.7)
    wall(lw)
    for dx in (24, 62, 100, 196):
        dormer(x + dx, base - 66, 16, 11)
    # The central pavilion's pediment, with its round window.
    ped = [(x + 146, base - 52), (x + 176, base - 74), (x + 206, base - 52)]
    add(f'<path d="{poly(ped)}" fill="{WH}"/>'); ink(poly(ped), 1.3, 0.8)
    ink(f"M{x + 171},{base - 60} a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0", 0.9, 0.7)
    # Windows, rows of them.
    for y in (base - 44, base - 30):
        for wx in range(int(x + 8), int(x + 222), 15):
            wash(poly([(wx, y), (wx + 6, y), (wx + 6, y + 9), (wx, y + 9)]), "#4A4752", 0.8, "wcs", g=True)
    for y in (base - 66, base - 50, base - 34):
        for wx in range(int(x + 238), int(x + 392), 17):
            wash(poly([(wx, y), (wx + 7, y), (wx + 7, y + 10), (wx, y + 10)]), "#4A4752", 0.8, "wcs", g=True)
    for ax in (x + 300, x + 334):   # the arched windows of the music room end
        wash(f"M{ax},{base - 4} L{ax},{base - 14} a8,8 0 0,1 16,0 L{ax + 16},{base - 4} Z", "#4A4752", 0.85, "wcs", g=True)
        ink(f"M{ax},{base - 4} L{ax},{base - 14} a8,8 0 0,1 16,0 L{ax + 16},{base - 4}", 0.9, 0.7)
    # The veranda along the wing, and shade under it.
    wash(poly([(x + 2, base - 1), (x + 2, base - 16), (x + 226, base - 16), (x + 226, base - 1)]), "#6E6A7E", 0.4, "wcs", g=True)
    ink(line([(x - 2, base - 17), (x + 230, base - 17)]), 1.5, 0.85)
    for px in range(int(x + 6), int(x + 226), 18):
        ink(line([(px, base - 16), (px, base)]), 1.0, 0.7, color="#F4F1EA")
    wash(poly([(x + 370, base - 74), (x + 400, base - 74), (x + 400, base), (x + 370, base)]), "#8C8AA6", 0.25, "wcs", g=True)
    # The sandstone wall below the lawn.
    sw = [(x - 30, base + 16), (x - 30, base + 2), (x + 436, base + 2), (x + 436, base + 16)]
    wash(poly(sw), "#B48A72", 0.92, "wcs")
    coursing(x - 30, base + 2, x + 436, base + 18, step=6)
    ink(line([(x - 30, base + 2), (x + 436, base + 2)]), 1.6, 0.9, color="#F4F1EA")
    ink(poly(sw), 1.2, 0.7)

pines([(x + jit(10), SB + jit(4), random.uniform(44, 70)) for x in range(SX - 40, SX + 460, 34)])   # pines behind the hotel
stanley(SX, SB)
front = []
for i in range(26):
    x = random.uniform(SX - 110, SX + 520); y = random.uniform(SB + 30, interp(wt, x) - 4)
    front.append((y, x))
pines([(x, SB + 30 + jit(6), random.uniform(40, 56)) for x in (SX - 70, SX - 20, SX + 452, SX + 500)] + [(x, y, random.uniform(30, 46)) for y, x in sorted(front)])

# --- West Elkhorn Avenue, base at y 715, set from x 1,640: right of the type
# on a desktop and inside a phone's crop of the right-hand side.
B = 715
INKSCALE = 0.9
def clapboard(x0, y0, x1, y1, step=7):
    for y in range(int(y0) + step, int(y1), step):
        ink(line([(x0 + 3, y), (x1 - 3, y)]), 0.6, 0.26)

def shopfront(x, w, band, door=True):
    """The street floor: a sign band, the display windows and a door."""
    wash(poly([(x + 2, B - 58), (x + w - 2, B - 58), (x + w - 2, B - 48), (x + 2, B - 48)]), band, 0.9, "wcs", g=True)
    wash(poly([(x + 8, B - 6), (x + 8, B - 44), (x + w - 8, B - 44), (x + w - 8, B - 6)]), "#5C5560", 0.6, "wcs", g=True)
    ink(poly([(x + 8, B - 6), (x + 8, B - 44), (x + w - 8, B - 44), (x + w - 8, B - 6)]), 1.1, 0.65)
    if door:
        dx = x + w * 0.62
        wash(poly([(dx, B), (dx, B - 40), (dx + 16, B - 40), (dx + 16, B)]), "#3E3842", 0.7, "wcs", g=True)
        ink(poly([(dx, B), (dx, B - 40), (dx + 16, B - 40), (dx + 16, B)]), 1.0, 0.7)

def gable_front(x, w, h, gp, peak, trim, band):
    """A white clapboard false front topped with a gable, its edges picked out in colour."""
    body = [(x, B), (x, B - h), (x + w / 2, B - h - gp), (x + w, B - h), (x + w, B)]
    add(f'<path d="{poly(body)}" fill="{PAPER}"/>')
    wash(poly(body), "#E6E0D4", 0.6, "wcs", g=True)
    clapboard(x, B - h, x + w, B - 60)
    if peak:
        wash(poly([(x + 6, B - h), (x + w / 2, B - h - gp + 8), (x + w - 6, B - h), (x + w - 6, B - h + 16), (x + 6, B - h + 16)]), peak, 0.9, "wcs", g=True)
    ink(line([(x - 4, B - h + 2), (x + w / 2, B - h - gp - 2), (x + w + 4, B - h + 2)]), 3.0, 0.9, color=trim)
    ink(poly(body), 1.8)
    ink(f"M{x + w / 2 - 7},{B - h - 4} a7,7 0 1,1 14,0 L{x + w / 2 + 7},{B - h + 8} L{x + w / 2 - 7},{B - h + 8} Z", 1.0, 0.7)
    for wx in (x + w * 0.22, x + w * 0.62):
        trimmed(wx, B - h + 30, 16, 26)
    shopfront(x, w, band)
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), "#8C8AA6", 0.18, "wcs", g=True)
    return x + w

TEAL = "#3E9C9A"
def teal_front(x, w, h):
    """Board-and-batten front with teal shutters and teal metal awnings."""
    body = [(x, B), (x, B - h), (x + w, B - h), (x + w, B)]
    wash(poly(body), "#A88060", 0.92, "wcs")
    for bx in range(int(x + 8), int(x + w - 4), 9):
        ink(line([(bx, B - h + 14), (bx, B - 62)]), 0.7, 0.35)
    wash(poly([(x - 6, B - h - 4), (x + w + 6, B - h - 4), (x + w + 2, B - h + 10), (x - 2, B - h + 10)]), TEAL, 0.9, "wcs")
    ink(poly([(x - 6, B - h - 4), (x + w + 6, B - h - 4), (x + w + 2, B - h + 10), (x - 2, B - h + 10)]), 1.2, 0.75)
    for wx in (x + w * 0.2, x + w * 0.6):
        trimmed(wx, B - h + 34, 18, 30, "#3E5A62")
        for sx in (wx - 11, wx + 22):
            wash(poly([(sx, B - h + 32), (sx + 7, B - h + 32), (sx + 7, B - h + 64), (sx, B - h + 64)]), TEAL, 0.9, "wcs", g=True)
    wash(poly([(x + w * 0.12, B - h + 30), (x + w * 0.88, B - h + 30), (x + w * 0.92, B - h + 22), (x + w * 0.08, B - h + 22)]), TEAL, 0.9, "wcs", g=True)
    ink(poly(body), 1.8)
    shopfront(x, w, "#6B4A36")
    aw = [(x - 4, B - 52), (x + w + 4, B - 52), (x + w + 10, B - 36), (x - 10, B - 36)]
    wash(poly(aw), TEAL, 0.95, "wcs")
    for k in range(int((w + 16) / 9)):
        ink(line([(x - 6 + k * 9, B - 51), (x - 9 + k * 9, B - 37)]), 0.8, 0.5)
    ink(poly(aw), 1.3, 0.8)
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.18, "wcs", g=True)
    return x + w

def chalet(x, w, h, gp):
    """The red-and-white chalet front: red trim, a balustraded balcony in the
    gable and dark scalloped shingle canopies over the shop windows."""
    RED = "#B8372B"
    body = [(x, B), (x, B - h), (x + w / 2, B - h - gp), (x + w, B - h), (x + w, B)]
    add(f'<path d="{poly(body)}" fill="{PAPER}"/>')
    wash(poly(body), "#EDE6DA", 0.55, "wcs", g=True)
    wash(poly([(x + 10, B - h - 2), (x + w / 2, B - h - gp + 10), (x + w - 10, B - h - 2)]), "#D9C7A8", 0.6, "wcs", g=True)
    ink(line([(x - 5, B - h + 2), (x + w / 2, B - h - gp - 2), (x + w + 5, B - h + 2)]), 3.0, 0.9, color=RED)
    for cx in (x + 3, x + w - 3):   # red corner boards
        ink(line([(cx, B - h), (cx, B - 50)]), 2.6, 0.85, color=RED)
    # The balcony: a cream rail and balusters across the foot of the gable.
    ink(line([(x - 2, B - h + 2), (x + w + 2, B - h + 2)]), 2.2, 0.9)
    ink(line([(x + 2, B - h - 14), (x + w - 2, B - h - 14)]), 1.6, 0.85, color="#8C6A3E")
    for bx in range(int(x + 6), int(x + w - 4), 7):
        ink(line([(bx, B - h - 13), (bx, B - h + 1)]), 1.0, 0.7, color="#8C6A3E")
    trimmed(x + w / 2 - 9, B - h - gp + 18, 18, 14, "#4A4752")
    for wx in (x + w * 0.18, x + w * 0.62):
        trimmed(wx, B - h + 22, 18, 30)
        ink(poly([(wx - 4, B - h + 52), (wx - 4, B - h + 18), (wx + 22, B - h + 18), (wx + 22, B - h + 52)]), 1.4, 0.85, color=RED)
    ink(poly(body), 1.8)
    shopfront(x, w, RED)
    for cx0, cw in [(x + 2, w * 0.48), (x + w * 0.52, w * 0.46)]:   # the scalloped canopies
        can = [(cx0, B - 40), (cx0 + 8, B - 62), (cx0 + cw - 8, B - 62), (cx0 + cw, B - 40)]
        wash(poly(can), "#55525C", 0.92, "wcs")
        for k in range(int(cw / 8)):
            ink(f"M{cx0 + 2 + k * 8:.0f},{B - 42} a4,4 0 0,0 8,0", 0.8, 0.5, color="#C9C4CC")
        ink(poly(can), 1.2, 0.8)
    ox, oy = x - 2, B - 92   # the oval sign on its bracket
    ink(line([(ox - 6, oy - 14), (ox + 26, oy - 14)]), 1.2, 0.8)
    add(f'<path d="{ell(ox + 10, oy, 18, 10)}" fill="#F7F3EC"/>')
    wash(ell(ox + 10, oy, 6, 3), TEAL, 0.8, "wcs", g=True)
    ink(ell(ox + 10, oy, 18, 10), 1.1, 0.8)
    return x + w

def big_white(x, w, h):
    """The big white clapboard building at the corner: a steep red-roofed
    gable, many-paned windows and fanlights over a sandstone base."""
    RED = "#A8362F"
    gx, gw, gp = x + w * 0.38, w * 0.62, 70
    wing = [(x, B), (x, B - h + 30), (gx, B - h + 30), (gx, B)]
    roof = [(x - 8, B - h + 30), (gx - 2, B - h - 26), (gx + 6, B - h - 26), (gx + 6, B - h + 30)]
    wash(poly(roof), RED, 0.92, "wcs"); ink(poly(roof), 1.4, 0.85)
    add(f'<path d="{poly(wing)}" fill="{PAPER}"/>'); wash(poly(wing), "#E6E0D4", 0.6, "wcs", g=True)
    front = [(gx, B), (gx, B - h), (gx + gw / 2, B - h - gp), (gx + gw, B - h), (gx + gw, B)]
    add(f'<path d="{poly(front)}" fill="{PAPER}"/>'); wash(poly(front), "#ECE7DD", 0.5, "wcs", g=True)
    ink(line([(gx - 8, B - h + 6), (gx + gw / 2, B - h - gp - 4), (gx + gw + 8, B - h + 6)]), 5.0, 0.9, color=RED)
    ink(line([(gx - 2, B - h + 2), (gx + gw / 2, B - h - gp + 2), (gx + gw + 2, B - h + 2)]), 1.6, 0.85)
    clapboard(x, B - h + 30, gx, B - 34, 6); clapboard(gx, B - h, gx + gw, B - 34, 6)
    ink(poly(wing), 1.8); ink(poly(front), 1.8)
    def panes(wx, wy, ww, wh):
        add(f'<rect x="{wx - 3}" y="{wy - 3}" width="{ww + 6}" height="{wh + 6}" fill="{PAPER}"/>')
        wash(poly([(wx, wy + wh), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh)]), "#56616E", 0.8, "wcs", g=True)
        for k in range(1, 3): ink(line([(wx + ww * k / 3, wy), (wx + ww * k / 3, wy + wh)]), 0.7, 0.55, color="#F4F1EA")
        ink(line([(wx, wy + wh / 2), (wx + ww, wy + wh / 2)]), 0.7, 0.55, color="#F4F1EA")
        ink(poly([(wx - 3, wy + wh + 3), (wx - 3, wy - 3), (wx + ww + 3, wy - 3), (wx + ww + 3, wy + wh + 3)]), 1.0, 0.7)
    cx = gx + gw / 2
    panes(cx - 22, B - h - 34, 18, 26); panes(cx + 4, B - h - 34, 18, 26)
    for wx in (gx + 12, cx - 12, gx + gw - 36):
        panes(wx, B - h + 22, 24, 34)
    for wx in (x + 12, x + 46):
        panes(wx, B - h + 50, 20, 28)
    for ax in (gx + 14, gx + gw - 52):   # fanlights over the big ground-floor windows
        add(f'<path d="M{ax - 3},{B - 34} L{ax - 3},{B - 70} a22,22 0 0,1 44,0 L{ax + 41},{B - 34} Z" fill="{PAPER}"/>')
        wash(f"M{ax},{B - 36} L{ax},{B - 70} a19,19 0 0,1 38,0 L{ax + 38},{B - 36} Z", "#56616E", 0.8, "wcs", g=True)
        for k in range(5):
            a = math.pi * (k + 1) / 6
            ink(line([(ax + 19, B - 70), (ax + 19 - 19 * math.cos(a), B - 70 - 19 * math.sin(a))]), 0.7, 0.6, color="#F4F1EA")
        ink(line([(ax, B - 70), (ax + 38, B - 70)]), 0.8, 0.6, color="#F4F1EA")
        ink(f"M{ax - 3},{B - 34} L{ax - 3},{B - 70} a22,22 0 0,1 44,0 L{ax + 41},{B - 34}", 1.1, 0.75)
    panes(x + 14, B - 62, 40, 26)
    base_wall = [(x - 4, B), (x - 4, B - 32), (x + w + 4, B - 32), (x + w + 4, B)]
    wash(poly(base_wall), "#A86A52", 0.92, "wcs")
    coursing(x - 4, B - 32, x + w + 4, B, step=8)
    ink(poly(base_wall), 1.4, 0.8)
    wash(poly([(gx + gw * 0.7, B - h), (gx + gw, B - h), (gx + gw, B - 32), (gx + gw * 0.7, B - 32)]), "#8C8AA6", 0.2, "wcs", g=True)
    return x + w

def maple(x, base, r):
    """A red maple, as at both ends of the block."""
    blobs = [(-0.5, -0.9, 0.6), (0.45, -0.95, 0.58), (0, -1.35, 0.7), (-0.2, -0.65, 0.5), (0.35, -0.6, 0.48), (0.8, -1.2, 0.4), (-0.8, -1.25, 0.38)]
    d = " ".join(ell(x + dx * r, base + dy * r, rr * r, rr * r) for dx, dy, rr in blobs)
    wash(d, "#C9452E", 0.9, "wc2")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.9:.0f} C{x + r * 1.4:.0f},{base - r * 1.6:.0f} {x + r * 1.3:.0f},{base - r * 0.3:.0f} {x + r * 0.2:.0f},{base - r * 0.25:.0f} C{x + r * 0.6:.0f},{base - r * 0.9:.0f} {x + r * 0.5:.0f},{base - r * 1.4:.0f} {x + r * 0.1:.0f},{base - r * 1.9:.0f} Z", "#7E2418", 0.4, "wcs", g=True)
    ink(line([(x - 2, base + 2), (x, base - r * 0.5), (x - r * 0.3, base - r * 0.85)]), 1.8, 0.75)
    ink(line([(x, base - r * 0.5), (x + r * 0.3, base - r * 0.9)]), 1.4, 0.65)

def lamp(lx):
    """Elkhorn's dark green lamp posts."""
    ink(line([(lx, B + 18), (lx, B - 96)]), 3.0, 0.95, color="#2F5A45")
    wash(poly([(lx - 7, B - 98), (lx - 5, B - 116), (lx + 5, B - 116), (lx + 7, B - 98)]), "#F2E3B6", 0.9, "wcs")
    ink(poly([(lx - 7, B - 98), (lx - 5, B - 116), (lx + 5, B - 116), (lx + 7, B - 98)]), 1.3, 0.9, color="#2F5A45")
    ink(f"M{lx - 7},{B - 116} l7,-8 l7,8", 1.4, 0.95, color="#2F5A45")
    ink(line([(lx - 6, B + 18), (lx + 6, B + 18)]), 3.0, 0.9, color="#2F5A45")

for x in (1700, 1860, 2010, 2190):   # big gold trees over the block
    cottonwood(x + jit(16), 628 + jit(6), random.uniform(52, 62), back=True, shadow=False)
wash(poly([(1650, B - 4), (2330, B - 4), (2340, B + 26), (1640, B + 26)]), "#CBBFAA", 0.82, "wcs")   # sidewalk
ink(line([(1640, B + 26), (2340, B + 26)]), 1.4, 0.55)
xx = 1676
xx = gable_front(xx, 76, 112, 34, None, "#B8372B", "#B8372B") + 6
xx = gable_front(xx, 96, 124, 40, "#4F6E96", "#B8372B", "#4F6E96") + 6
xx = teal_front(xx, 112, 146) + 8
xx = chalet(xx, 112, 132, 44) + 8
xx = big_white(xx, 186, 166)
wash(poly([(1650, B + 2), (2330, B + 2), (2336, B + 14), (1644, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1772, 2076):
    lamp(lx)
cottonwood(1880, B + 12, 40)
maple(1662, B + 12, 36)
maple(2318, B + 12, 34)

# --- The riverwalk: a path and its green railing along the far bank.
INKSCALE = 1.05
rw = [(1280, 708), (1400, 728), (1550, 742), (1800, 750), (2100, 756), (2420, 760)]
wash(open_path([(1280, 700), (1400, 720), (1550, 734), (1800, 742), (2100, 748), (2420, 752)]) + " L2420,764 " + smooth(list(reversed(rw))) + " Z", "#C4B8A2", 0.7, "wcs")
ink(open_path([(x, y - 14) for x, y in rw[1:]]), 2.0, 0.9, color="#2F5A45")
ink(open_path([(x, y - 6) for x, y in rw[1:]]), 1.2, 0.7, color="#2F5A45")
for x in range(1410, 2420, 30):
    y = interp(rw, x); ink(line([(x, y - 15), (x, y + 1)]), 1.4, 0.85, color="#2F5A45")

# Granite cobbles and boulders lining both banks of the river.
def rocks(pts, n, rmin, rmax, below):
    """Rounded granite cobbles heaped along a bank in clusters, grey and warm."""
    found = []
    while len(found) < n:
        cx = random.uniform(pts[0][0], pts[-1][0])
        for k in range(random.randint(2, 5)):
            x = cx + random.uniform(-28, 28); y = interp(pts, x) + random.uniform(-5, 7) * (1 if below else -1)
            r = random.uniform(rmin, rmax) * random.choice([0.7, 1, 1, 1.35])
            found.append((y, x, r))
    found.sort()
    tones = {"#C2B2A2": [], "#CDB39A": [], "#B3A9A4": []}
    outl = []
    for y, x, r in found:
        d = f"M{x - r:.0f},{y:.0f} C{x - r:.0f},{y - r * 0.8:.0f} {x - r * 0.3:.0f},{y - r * 0.95:.0f} {x + r * 0.2:.0f},{y - r * 0.9:.0f} C{x + r * 0.9:.0f},{y - r * 0.85:.0f} {x + r:.0f},{y - r * 0.3:.0f} {x + r:.0f},{y:.0f} Z"
        random.choice(list(tones.values())).append(d); outl.append((x, y, r, d))
    for c, ds in tones.items():
        if ds: wash(" ".join(ds), c, 0.92, "wcs")
    wash(" ".join(f"M{x + r * 0.1:.0f},{y - r * 0.88:.0f} C{x + r * 0.9:.0f},{y - r * 0.85:.0f} {x + r:.0f},{y - r * 0.3:.0f} {x + r:.0f},{y:.0f} L{x:.0f},{y:.0f} C{x + r * 0.35:.0f},{y - r * 0.5:.0f} {x + r * 0.3:.0f},{y - r * 0.8:.0f} {x + r * 0.1:.0f},{y - r * 0.88:.0f} Z" for x, y, r, d in outl), "#7E6F80", 0.45, "wcs", g=True)
    for x, y, r, d in outl:
        ink(d, 1.1 if r < 14 else 1.5, 0.7)
rocks([(x, interp(wt, x) + 4) for x in range(1300, 2420, 40)], 56, 7, 13, False)
for cx, cy, r in [(1520, 772, 12), (1690, 786, 16), (1716, 790, 9), (1990, 794, 13), (2260, 800, 15), (1380, 752, 9)]:   # boulders in the current
    boulder(cx, cy, r, granite=True)

INKSCALE = 1.15
bank = [(-20, 786), (200, 782), (500, 776), (800, 770), (1000, 766), (1200, 758), (1300, 764), (1400, 778), (1550, 796), (1800, 812), (2100, 822), (2420, 826)]
wash("M-20,786 " + smooth(bank) + f" L2420,{H} L-20,{H} Z", "#C2A65E", 0.9, "wc1")
wash("M-20,792 C300,786 700,778 1000,774 C1060,800 980,830 900,850 C700,890 500,930 300,960 C150,980 40,990 -20,1000 Z", "#7C7558", 0.3, "wc3", g=True)   # the shore in the pines' shade
wash("M-20,930 C300,900 600,936 1000,914 C1400,900 1800,940 2420,910 L2420,1000 L-20,1000 Z", "#8F7F5C", 0.35, "wc3", g=True)
for x0, y0, w, h, col in [(-20, 820, 420, 50, "#A8955A"), (360, 846, 380, 40, "#B39C5C"), (120, 900, 520, 56, "#9E8C56"), (760, 880, 420, 44, "#AC975A"), (980, 820, 300, 34, "#B8A25E"), (1500, 880, 380, 40, "#B39C5C")]:
    wash(f"M{x0},{y0} C{x0 + w * 0.3},{y0 - h * 0.5} {x0 + w * 0.7},{y0 - h * 0.4} {x0 + w},{y0} C{x0 + w * 0.7},{y0 + h * 0.6} {x0 + w * 0.3},{y0 + h * 0.5} {x0},{y0} Z", col, 0.45, "wc3", g=True)
rocks([(x, interp(bank, x) + 6) for x in range(1300, 2420, 40)], 40, 10, 20, True)
for i in range(300):
    x = random.uniform(-10, 2410); top = interp(bank, x) + random.uniform(14, 200)
    if top > 1000: continue
    L = random.uniform(10, 30)
    ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.42)
def willows(x, base, w, cols=("#C9A23A", "#A3A043")):
    wands = []
    for k in range(int(w / 7)):
        sx = x + k * 7 + jit(3); hgt = random.uniform(28, 54); lean = jit(12)
        ink(line([(sx, base), (sx + lean, base - hgt)]), 1.0, 0.6, color="#6E4A24")
        wands.append(ell(sx + lean * 0.6, base - hgt * 0.6, 8, hgt * 0.34))
    d = " ".join(wands)
    wash(d, cols[0], 0.85, "wcs")
    wash(d, cols[1], 0.35, "wcs", g=True)
for x, w in [(1460, 90), (1900, 110), (980, 80), (560, 70)]:
    willows(x, interp(bank, x) + 40, w)
willows(2200, interp(bank, 2200) + 44, 80, ("#C24A2C", "#E8A23E"))
def big_granite(cx, cy, w, h):
    d = f"M{cx - w / 2:.0f},{cy:.0f} C{cx - w * 0.5:.0f},{cy - h * 0.7:.0f} {cx - w * 0.25:.0f},{cy - h:.0f} {cx:.0f},{cy - h:.0f} C{cx + w * 0.3:.0f},{cy - h * 1.02:.0f} {cx + w * 0.5:.0f},{cy - h * 0.5:.0f} {cx + w / 2:.0f},{cy:.0f} Z"
    wash(f"M{cx - w * 0.6:.0f},{cy + 4:.0f} a{w * 0.65:.0f},{h * 0.16:.0f} 0 1,0 {w * 1.3:.0f},0 a{w * 0.65:.0f},{h * 0.16:.0f} 0 1,0 {-w * 1.3:.0f},0 Z", "#6E6A5A", 0.4, "wcs", g=True)
    wash(d, "#C9B6A2", 0.94, "wcs")
    wash(f"M{cx - w * 0.35:.0f},{cy - h * 0.55:.0f} C{cx - w * 0.25:.0f},{cy - h * 0.85:.0f} {cx - w * 0.05:.0f},{cy - h * 0.9:.0f} {cx + w * 0.05:.0f},{cy - h * 0.85:.0f} C{cx - w * 0.1:.0f},{cy - h * 0.7:.0f} {cx - w * 0.25:.0f},{cy - h * 0.55:.0f} {cx - w * 0.35:.0f},{cy - h * 0.55:.0f} Z", "#E9C9A0", 0.4, "wcs", g=True)
    wash(f"M{cx + w * 0.05:.0f},{cy - h:.0f} C{cx + w * 0.3:.0f},{cy - h * 1.02:.0f} {cx + w * 0.5:.0f},{cy - h * 0.5:.0f} {cx + w / 2:.0f},{cy:.0f} L{cx:.0f},{cy:.0f} C{cx + w * 0.2:.0f},{cy - h * 0.5:.0f} {cx + w * 0.15:.0f},{cy - h * 0.8:.0f} {cx + w * 0.05:.0f},{cy - h:.0f} Z", "#7E6F80", 0.5, "wcs", g=True)
    ink(d, 2.0, 0.8)
    for k in range(2):
        x = cx - w * 0.2 + k * w * 0.25
        ink(f"M{x:.0f},{cy - h * 0.9:.0f} q{jit(6):.0f},{h * 0.35:.0f} {jit(8):.0f},{h * 0.7:.0f}", 1.1, 0.5)
for cx, cy, w, h in [(1660, 912, 120, 60), (1740, 930, 70, 34), (2140, 900, 150, 72), (2330, 940, 110, 52), (600, 892, 110, 46), (790, 936, 80, 34), (380, 966, 150, 60)]:
    big_granite(cx, cy, w, h)
def big_pine(x, base, h):
    """A foreground ponderosa: cinnamon trunk, needles in clumps along the boughs, lit from the left."""
    wash(poly([(x - 4, base), (x - 2, base - h * 0.92), (x + 2, base - h * 0.92), (x + 4, base)]), "#9A5636", 0.92, "wcs")
    clumps, lit = [], []
    n = 7
    for k in range(n):
        t = k / (n - 1)
        y = base - h * (0.3 + 0.66 * t)
        span = h * 0.3 * (1 - t * 0.75) + 5
        for side in (-1, 1):
            cx = x + side * span * random.uniform(0.35, 0.6)
            rx = span * random.uniform(0.45, 0.6); ry = h * 0.055
            clumps.append(ell(cx, y, rx, ry))
            if side < 0: lit.append(ell(cx - rx * 0.15, y - ry * 0.3, rx * 0.6, ry * 0.55))
            ink(line([(x, y + ry * 0.6), (cx + side * rx * 0.3, y)]), 1.0, 0.55)
        clumps.append(ell(x, y - h * 0.03, span * 0.4, h * 0.05))
    clumps.append(ell(x, base - h * 0.97, h * 0.05, h * 0.06))
    wash(" ".join(clumps), "#33533D", 0.92, "wcs")
    wash(" ".join(lit), "#6F8F5A", 0.55, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.4)]), 1.8, 0.75)
for x, base, h in [(34, 836, 196), (140, 812, 140), (246, 826, 168), (2392, 870, 170)]:
    big_pine(x, base, h)
brush, sage = [], []
for i in range(60):   # rabbitbrush in flower and grey-green shrubs across the near bank
    x = random.uniform(0, 2400); y = interp(bank, x) + random.uniform(30, 190)
    if y > 990: continue
    r = random.uniform(8, 14)
    (brush if random.random() < 0.55 else sage).append(" ".join(ell(x + dx * r, y + dy * r, r * 0.6, r * 0.45) for dx, dy in [(-0.5, 0), (0.5, 0.05), (0, -0.35)]))
    for k in range(3): ink(line([(x - r * 0.4 + k * r * 0.4, y + r * 0.5), (x - r * 0.5 + k * r * 0.5, y - r * 0.1)]), 0.8, 0.45)
wash(" ".join(brush), "#E2B92E", 0.85, "wcs")
wash(" ".join(sage), "#93A07A", 0.85, "wcs")

finish(sys.argv[1])
