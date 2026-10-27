"""Niwot hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Second Avenue in Old Town on an autumn morning: the brick blocks with their
awnings, the grey-painted brick building and the Niwot Tribune's false front
and shingled porch; the railroad along town with the red caboose; and behind
it all the Front Range across the fields, traced from the owner's own photo,
with Longs Peak's flat top and the small cone of Haystack Mountain.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(5)

# --- Sky, with the summer-to-autumn cumulus that sits over the range.
sky()
for cx, cy, s in [(300, 130, 58), (980, 110, 44), (1650, 150, 66), (2200, 120, 48)]:
    cloud(cx, cy, s)
for cx, cy, s in [(420, 300, 30), (1880, 312, 34)]:
    cloud(cx, cy, s)

# --- The Front Range, traced from the owner's photo (display x * 1.2, y stretched).
def P(pts, drop=0): return [(x * 1.2, 300 + (y - 40) * 1.25 + drop) for x, y in pts]
INKSCALE = 0.55
far = P([(0, 62), (60, 58), (130, 66), (180, 62), (260, 70), (380, 66), (440, 62), (520, 58), (600, 60), (700, 76), (760, 72), (820, 62),
         (868, 48), (880, 47), (900, 48), (930, 58), (1000, 82), (1100, 85), (1180, 80), (1250, 72), (1290, 74), (1400, 88), (1460, 96),
         (1550, 92), (1640, 92), (1720, 86), (1800, 96), (1900, 104), (2000, 108)])
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
# Snow on the high peaks, left as paper with a cool shadow side.
for px, w, dep in [(1056, 70, 30), (156, 46, 14), (624, 60, 16), (528, 40, 12), (1500, 40, 10)]:
    py = interp(far, px)
    d = f"M{px - w / 2:.0f},{py + dep:.0f} L{px - w * 0.15:.0f},{py + 2:.0f} L{px + w * 0.2:.0f},{py + 2:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.2:.0f},{py + dep * 0.55:.0f} L{px:.0f},{py + dep:.0f} L{px - w * 0.25:.0f},{py + dep * 0.6:.0f} Z"
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.92" filter="url(#wcs)"/>')
    wash(f"M{px + w * 0.05:.0f},{py + 4:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.15:.0f},{py + dep * 0.6:.0f} Z", "#9AA3C6", 0.45, "wcs", g=True)
ink(open_path(far), 1.4, 0.55)
mid = P([(0, 98), (200, 92), (400, 96), (600, 88), (700, 78), (800, 84), (1000, 92), (1100, 100), (1200, 96), (1300, 104), (1500, 108), (1700, 112), (1850, 118), (2000, 124)], drop=6)
wash(ridge_d(mid), "#7F90AA", 0.8, "wc3")
ink(open_path(mid), 1.3, 0.5)
front = P([(0, 128), (150, 118), (300, 100), (440, 86), (560, 64), (620, 74), (700, 104), (780, 128), (860, 140), (1000, 142), (1100, 128),
           (1250, 130), (1400, 134), (1600, 132), (1750, 126), (1820, 120), (1900, 136), (2000, 148)], drop=16)
wash(ridge_d(front), "#ADA27A", 0.9, "wc1")
for i in range(70):   # timber on the upper slopes
    x = random.uniform(0, 2400); y = interp(front, x) + random.uniform(8, 50)
    if y < 470:
        r = random.uniform(10, 22)
        wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.45:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.45:.0f} 0 1,0 {-2 * r:.0f},0 Z", "#5F7466", 0.45, "wcs", g=True)
# Shade on the slopes that face away from the morning sun.
for a, b in [(672, 960), (1500, 1680), (2190, 2400)]:
    pts = [(x, interp(front, x)) for x in range(a, b + 1, 12)]
    wash(poly(pts + [(b, 500), (a + (b - a) * 0.4, 500)]), "#7F7699", 0.15, "wc3", g=True)
ink(open_path(front), 1.6, 0.6)
for i in range(60):   # dry-grass strokes on the foothills
    x = random.uniform(0, 2400); y0 = interp(front, x) + random.uniform(10, 60)
    if y0 < 488: ink(line([(x, y0), (x - 10, y0 + 12)]), 0.9, 0.22)
# Haystack Mountain, the little cone out on the plains.
hay = [(590, 506), (650, 476), (694, 458), (722, 458), (764, 476), (840, 506)]
wash(ridge_d(hay, 530), "#968D5E", 0.9, "wc2")
wash(poly([(722, 458), (764, 476), (840, 506), (840, 530), (712, 530)]), "#6E6788", 0.35, "wcs", g=True)
ink(open_path(hay), 1.6, 0.7)

# --- The plains: a far tree line, then fields striped toward town.
INKSCALE = 0.85
plains = [(0, 500), (600, 506), (1200, 498), (1800, 504), (2400, 500)]
wash(ridge_d(plains), "#CDB86C", 0.88, "wc3")
for x in range(-20, 2440, 26):   # the far tree line along the ditches, green going gold
    y = interp(plains, x) + 6 + jit(3); r = random.uniform(9, 16)
    col = random.choice(["#7E8F4E", "#A39A45", "#D6A63C", "#7E8F4E"])
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", col, 0.85, "wcs")
for y0, col in [(560, "#B9A85C"), (690, "#BCAA60")]:
    wash(f"M0,{y0} C600,{y0 - 10} 1200,{y0 + 8} 2400,{y0 - 6} L2400,{y0 + 60} C1200,{y0 + 70} 600,{y0 + 52} 0,{y0 + 64} Z", col, 0.3, "wc3", g=True)
for i in range(30):   # furrow lines in the fields
    x = random.uniform(0, 760); y = random.uniform(530, 800)
    ink(line([(x, y), (x + random.uniform(60, 140), y + jit(2))]), 0.8, 0.25)
fence = [(0, 724), (360, 718), (700, 726), (860, 722)]
ink(open_path(fence), 1.2, 0.5)
for x in range(10, 860, 44):
    y = interp(fence, x); ink(line([(x, y - 6), (x + 1, y + 20)]), 1.4, 0.55)

for x, r in [(640, 46), (700, 58), (762, 42), (180, 40), (230, 34)]:
    cottonwood(x, 680 + jit(6), r)
# --- Big shade trees of Old Town, behind Second Avenue.
for x in range(1130, 2300, 120):
    cottonwood(x + jit(30), 642 + jit(10), random.uniform(58, 74), back=True, shadow=False)

# --- Second Avenue, drawn at 1.08 times and set at x 1190, base y 712: right of
# the type on a desktop and inside a phone's crop of the right-hand side.
B = 772
TS = 1.08
def tribune(x):
    """The Niwot Tribune: white clapboard false front, shingled porch roof, purple trim, lavender posts."""
    w, h = 210, 118
    add(f'<path d="{poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)])}" fill="{PAPER}"/>')
    wash(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), "#E9E6EE", 0.8, "wcs", g=True)
    for y in range(int(B - h + 8), int(B - 60), 8):   # clapboard
        ink(line([(x + 3, y), (x + w - 3, y)]), 0.6, 0.28)
    wash(poly([(x - 3, B - h - 8), (x + w + 3, B - h - 8), (x + w + 3, B - h + 2), (x - 3, B - h + 2)]), "#5C3B6E", 0.9, "wcs", g=True)
    # A suggestion of the purple lettering.
    add(f'<text x="{x + w / 2}" y="{B - h + 32}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="25" font-weight="bold" fill="#5C3B6E" opacity="0.9" filter="url(#wcs)">Niwot Tribune</text>')
    # Shingled porch roof, sloping toward the street.
    roof = [(x - 14, B - 52), (x + 10, B - 84), (x + w - 10, B - 84), (x + w + 14, B - 52)]
    wash(poly(roof), "#7C766D", 0.92, "wcs")
    for k, y in enumerate(range(B - 80, B - 54, 7)):
        for sx in range(int(x - 6 + (k % 2) * 6), int(x + w + 6), 12):
            ink(line([(sx, y), (sx, y + 6)]), 0.6, 0.35)
    ink(poly(roof), 1.6, 0.8)
    wash(poly([(x, B), (x, B - 52), (x + w, B - 52), (x + w, B)]), "#5C5560", 0.45, "wcs", g=True)   # shade under the porch
    for px in (x + 6, x + 70, x + 140, x + w - 10):
        wash(poly([(px, B), (px, B - 52), (px + 7, B - 52), (px + 7, B)]), "#9C8DC2", 0.95, "wcs")
        wash(f"M{px - 6},{B - 52} q10,10 19,0 Z", "#D46FA0", 0.9, "wcs", g=True)   # pink brackets
        ink(poly([(px, B), (px, B - 52), (px + 7, B - 52), (px + 7, B)]), 1.0, 0.7)
    ink(line([(x + 4, B - 16), (x + w - 4, B - 16)]), 1.4, 0.75, color="#F4F1F6")   # the white railing
    for rx in range(int(x + 10), int(x + w - 6), 8):
        ink(line([(rx, B - 16), (rx, B - 4)]), 0.9, 0.6, color="#EDE8F0")
    ink(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), 2.0)
    # Hanging baskets and the big planter of petunias.
    for bx, by, r in [(x + 36, B - 44, 9), (x + 175, B - 44, 9)]:
        for c in ("#C8508E", "#F2EDF4", "#8E5BB0"):
            wash(f"M{bx - r + jit(3):.0f},{by + jit(3):.0f} a{r},{r * 0.7:.0f} 0 1,0 {2 * r},0 a{r},{r * 0.7:.0f} 0 1,0 {-2 * r},0 Z", c, 0.8, "wcs", g=(c != "#C8508E"))
    return x + w

add(f'<g transform="translate({1190 - 960 * TS:.1f} {712 - B * TS:.1f}) scale({TS})">')
B0 = B; B = 772
wash(poly([(940, B - 4), (1930, B - 4), (1950, B + 30), (920, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(920, B + 30), (1950, B + 30)]), 1.4, 0.55)
xx = 960
xx = brick_block(xx, 150, 120, "#B85A3E", "#2F2C2E") + 4
xx = brick_block(xx, 132, 132, "#C86A3C", None, cornice="#3F6E58") + 4
xx = brick_block(xx, 168, 128, "#B9BEC6", None, cornice="#8E6A58", arched=True) + 6
xx = tribune(xx) + 60
xx = brick_block(xx, 120, 110, "#C2805A", "#3F5E4A") + 4
wash(poly([(940, B + 2), (1930, B + 2), (1936, B + 14), (934, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for lx in (1100, 1416, 1840):   # lamp posts with hanging baskets
    ink(line([(lx, B + 24), (lx, B - 70)]), 2.0, 0.85); ink(f"M{lx - 8},{B - 70} a8,8 0 1,1 16,0 Z", 1.4, 0.85)
    for c in ("#C8508E", "#8E5BB0"):
        wash(f"M{lx + 4},{B - 44} a10,8 0 1,0 20,0 a10,8 0 1,0 -20,0 Z", c, 0.8, "wcs", g=True)
    ink(line([(lx, B - 56), (lx + 14, B - 56), (lx + 14, B - 48)]), 1.0, 0.7)
for x in (930, 1340):
    cottonwood(x, B + 12, 34)
add('</g>')
B = B0
# --- The railroad along town, and the red caboose at its east end.
INKSCALE = 1.05
wash(poly([(0, 752), (2400, 746), (2400, 772), (0, 778)]), "#A89A86", 0.85, "wcs")   # ballast
ink(line([(0, 758), (2400, 752)]), 1.8, 0.8); ink(line([(0, 768), (2400, 762)]), 1.8, 0.8)
for x in range(0, 2400, 18):
    ink(line([(x, 755 - x * 0.0025), (x + 4, 774 - x * 0.0025)]), 1.2, 0.45)
def caboose(x):
    base = 752 - x * 0.0025
    w, h = 250, 70
    body = [(x, base - 16), (x, base - 16 - h), (x + w, base - 16 - h), (x + w, base - 16)]
    wash(poly(body), "#BB3A2C", 0.95, "wcs")
    wash(poly([(x + w * 0.7, base - 16 - h), (x + w, base - 16 - h), (x + w, base - 16), (x + w * 0.7, base - 16)]), "#7A2018", 0.3, "wcs", g=True)
    cup = [(x + 150, base - 16 - h), (x + 150, base - 16 - h - 30), (x + 210, base - 16 - h - 30), (x + 210, base - 16 - h)]
    wash(poly(cup), "#BB3A2C", 0.95, "wcs")
    ink(poly(body), 1.8); ink(poly(cup), 1.6)
    ink(line([(x - 8, base - 16 - h), (x + w + 8, base - 16 - h)]), 2.2, 0.85)
    ink(line([(x + 144, base - 16 - h - 30), (x + 216, base - 16 - h - 30)]), 1.8, 0.85)
    for k in range(int(w / 7)):   # board siding
        ink(line([(x + 4 + k * 7, base - 18 - h + 4), (x + 4 + k * 7, base - 18)]), 0.6, 0.3)
    for wx in (x + 40, x + 92, x + 144):
        trimmed(wx, base - 16 - h + 16, 18, 22, "#3E3B46")
    trimmed(x + 170, base - 16 - h - 24, 18, 14, "#3E3B46")
    for wx in (x + 30, x + 200):   # trucks
        add(f'<circle cx="{wx}" cy="{base - 6}" r="10" fill="#3A3330"/><circle cx="{wx + 26}" cy="{base - 6}" r="10" fill="#3A3330"/>')
        ink(line([(wx - 12, base - 14), (wx + 38, base - 14)]), 2.0, 0.8)
    ink(line([(x + 238, base - 16 - h), (x + 238, base - 16 - h - 18)]), 1.6, 0.8)   # stovepipe
cx0 = 2100; cby = 752 - cx0 * 0.0025
add(f'<g transform="translate({cx0} {cby:.1f}) scale(0.8) translate({-cx0} {-cby:.1f})">')
caboose(cx0)
add('</g>')

# --- Prairie grass in the foreground.
INKSCALE = 1.15
grass = [(0, 782), (800, 778), (1600, 786), (2400, 780)]
wash(ridge_d(grass), "#D7BB68", 0.9, "wc1")
wash("M0,900 C700,870 1500,890 2400,870 L2400,1000 L0,1000 Z", "#A8935A", 0.4, "wc3", g=True)
for i in range(220):
    x = random.uniform(0, 2400); top = random.uniform(790, 990); L = random.uniform(12, 34)
    ink(line([(x, top + L), (x + jit(8), top)]), 1.0, 0.42)
for i in range(26):   # rabbitbrush and the last purple asters
    x = random.uniform(0, 2400); y = random.uniform(800, 980)
    col = random.choice(["#E2B92E", "#E2B92E", "#9A7BC0"])
    wash(f"M{x - 10:.0f},{y:.0f} a10,6 0 1,0 20,0 a10,6 0 1,0 -20,0 Z", col, 0.75, "wcs", g=True)

finish(sys.argv[1])
