"""Berthoud hero, ink and watercolour, 2400 x 1000, in the Lyons style.

The Garden Spot of Colorado on an autumn morning: a big plains sky over the
Front Range with Longs Peak and Mount Meeker (as the Town's own photo of
Pioneer Park shows them), farm fields with grain bins and a red barn,
Mountain Avenue with the sandstone Bimson Blacksmith Shop, its old gas pump
and green lamp post, brick storefronts under gold cottonwoods, and Pioneer
Park's pond and fountain in front.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(8)

sky()
for cx, cy, s in [(260, 120, 56), (900, 170, 70), (1560, 110, 50), (2140, 160, 64), (1250, 300, 36), (520, 320, 30)]:
    cloud(cx, cy, s)

# --- The Front Range, low on the horizon, with Meeker and Longs.
INKSCALE = 0.55
far = [(0, 472), (160, 458), (320, 466), (470, 452), (600, 456), (700, 440), (760, 424), (800, 404), (826, 418), (846, 412), (858, 398),
       (906, 396), (918, 404), (932, 438), (1000, 446), (1080, 452), (1200, 448), (1320, 440), (1460, 452), (1600, 442), (1760, 456), (1900, 446), (2060, 458), (2240, 448), (2400, 460)]
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
for px, w, dep in [(884, 56, 18), (802, 30, 14)]:   # snow on Longs, Meeker and the shoulder
    py = interp(far, px)
    d = f"M{px - w / 2:.0f},{py + dep:.0f} L{px - w * 0.2:.0f},{py + 1:.0f} L{px + w * 0.25:.0f},{py + 1:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.15:.0f},{py + dep * 0.5:.0f} L{px:.0f},{py + dep:.0f} Z"
    add(f'<path d="{d}" fill="#FBF8F2" opacity="0.92" filter="url(#wcs)"/>')
    wash(f"M{px + w * 0.1:.0f},{py + 3:.0f} L{px + w / 2:.0f},{py + dep * 0.8:.0f} L{px + w * 0.15:.0f},{py + dep * 0.5:.0f} Z", "#9AA3C6", 0.45, "wcs", g=True)
ink(open_path(far), 1.4, 0.55)
near = [(0, 488), (200, 476), (420, 484), (640, 470), (900, 478), (1100, 468), (1300, 480), (1560, 470), (1800, 482), (2040, 470), (2400, 482)]
wash(ridge_d(near), "#8495AE", 0.8, "wc3")
ink(open_path(near), 1.2, 0.45)

# --- Farm country: fields, a windbreak, grain bins and a red barn.
INKSCALE = 0.85
fields = [(0, 500), (800, 504), (1600, 498), (2400, 502)]
wash(ridge_d(fields), "#CDB86C", 0.88, "wc3")
for y0, col in [(540, "#9FA35C"), (610, "#D6BE72")]:   # a late green field of alfalfa, then stubble
    wash(f"M0,{y0} C600,{y0 - 8} 1400,{y0 + 6} 2400,{y0 - 6} L2400,{y0 + 46} C1400,{y0 + 56} 600,{y0 + 40} 0,{y0 + 50} Z", col, 0.4, "wc3", g=True)
for i in range(40):
    x = random.uniform(0, 2400); y = random.uniform(520, 660)
    ink(line([(x, y), (x + random.uniform(60, 160), y + jit(2))]), 0.8, 0.22)
for x in range(-20, 2440, 30):   # windbreaks along the far section lines
    y = interp(fields, x) + 4 + jit(3); r = random.uniform(9, 15)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#7E8F4E", "#A39A45", "#D6A63C"]), 0.85, "wcs")
def grain_bin(x, base, w, h):
    body = poly([(x, base), (x, base - h), (x + w, base - h), (x + w, base)])
    wash(body, "#B9BEC4", 0.92, "wcs")
    wash(poly([(x + w * 0.6, base - h), (x + w, base - h), (x + w, base), (x + w * 0.6, base)]), "#6E6F8A", 0.35, "wcs", g=True)
    roof = poly([(x - 3, base - h), (x + w / 2, base - h - w * 0.35), (x + w + 3, base - h)])
    wash(roof, "#A9AEB6", 0.92, "wcs")
    ink(body, 1.4); ink(roof, 1.3)
    for y in range(int(base - h + 8), int(base), 8):   # corrugation
        ink(line([(x + 2, y), (x + w - 2, y)]), 0.6, 0.35)
def silo(x, base, w, h):
    body = poly([(x, base), (x, base - h), (x + w, base - h), (x + w, base)])
    wash(body, "#D9D3C6", 0.92, "wcs")
    wash(poly([(x + w * 0.6, base - h), (x + w, base - h), (x + w, base), (x + w * 0.6, base)]), "#7A7690", 0.3, "wcs", g=True)
    dome = f"M{x},{base - h} a{w / 2},{w * 0.4} 0 0,1 {w},0 Z"
    wash(dome, "#A9AEB6", 0.92, "wcs"); ink(body, 1.4); ink(dome, 1.3)
    for y in range(int(base - h + 14), int(base), 14):
        ink(line([(x + 2, y), (x + w - 2, y)]), 0.6, 0.3)
def barn(x, base):
    w, h = 150, 64
    walls = poly([(x, base), (x, base - h), (x + w, base - h), (x + w, base)])
    roof = poly([(x - 8, base - h), (x + 20, base - h - 34), (x + w / 2, base - h - 50), (x + w - 20, base - h - 34), (x + w + 8, base - h)])
    wash(walls, "#B8372B", 0.95, "wcs"); wash(roof, "#6E6A6A", 0.92, "wcs")
    wash(poly([(x + w * 0.65, base - h), (x + w, base - h), (x + w, base), (x + w * 0.65, base)]), "#6B1F18", 0.3, "wcs", g=True)
    ink(walls, 1.6); ink(roof, 1.5)
    ink(poly([(x + w / 2 - 22, base), (x + w / 2 - 22, base - 40), (x + w / 2 + 22, base - 40), (x + w / 2 + 22, base)]), 1.6, 0.9, color="#F4EFE6")
    ink(line([(x + w / 2 - 22, base - 40), (x + w / 2 + 22, base)]), 1.4, 0.9, color="#F4EFE6"); ink(line([(x + w / 2 + 22, base - 40), (x + w / 2 - 22, base)]), 1.4, 0.9, color="#F4EFE6")
    for k in range(int(w / 9)):
        ink(line([(x + 4 + k * 9, base - h + 4), (x + 4 + k * 9, base - 2)]), 0.6, 0.3)
silo(560, 640, 50, 150)
grain_bin(620, 640, 70, 70); grain_bin(702, 640, 64, 62)
barn(780, 646)
for x, r in [(200, 46), (260, 58), (470, 50), (980, 44)]:
    cottonwood(x, 652, r, back=True)

# --- Mountain Avenue, base at y 712, with gold cottonwoods behind, set 190 to
# the right: clear of the type on a desktop and inside a phone's crop.
add('<g transform="translate(190 0)">')
for x in range(1000, 2300, 130):
    cottonwood(x + jit(30), 640 + jit(10), random.uniform(60, 78), back=True, shadow=False)
B = 712
wash(poly([(940, B - 4), (2300, B - 4), (2320, B + 30), (920, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(920, B + 30), (2320, B + 30)]), 1.4, 0.55)
def bimson(x):
    """The Bimson Blacksmith Shop: mottled sandstone blocks, flat parapet, an arched wooden door."""
    w, h = 250, 150
    wall = poly([(x, B), (x, B - h), (x + w, B - h + 8), (x + w, B)])
    wash(wall, "#D8C3A2", 0.95, "wcs")
    for i in range(70):   # the red-orange and grey blocks in the wall
        bx = random.uniform(x + 4, x + w - 30); by = random.uniform(B - h + 8, B - 14)
        bw, bh = random.uniform(16, 34), random.uniform(10, 16)
        wash(poly([(bx, by), (bx + bw, by), (bx + bw, by + bh), (bx, by + bh)]), random.choice(["#C7704A", "#B8A58C", "#C98A5E", "#9E9284"]), 0.55, "wcs", g=True)
    coursing(x, B - h + 6, x + w, B, step=14)
    wash(poly([(x + w * 0.7, B - h + 6), (x + w, B - h + 8), (x + w, B), (x + w * 0.7, B)]), "#7A6E86", 0.25, "wcs", g=True)
    door = f"M{x + 140},{B} L{x + 140},{B - 70} a42,42 0 0,1 84,0 L{x + 224},{B} Z"
    wash(f"M{x + 132},{B} L{x + 132},{B - 70} a50,50 0 0,1 100,0 L{x + 232},{B} Z", "#C7704A", 0.85, "wcs")   # the red voussoirs
    wash(door, "#5E4636", 0.95, "wcs")
    for k in range(6):
        ink(line([(x + 150 + k * 13, B - 2), (x + 150 + k * 13, B - 98 + abs(k - 2.5) * 6)]), 0.8, 0.4)
    ink(door, 1.6); ink(f"M{x + 132},{B} L{x + 132},{B - 70} a50,50 0 0,1 100,0 L{x + 232},{B}", 1.3, 0.7)
    trimmed(x + 30, B - 110, 52, 80, "#4A4752")
    ink(wall, 2.0)
    fx0, fy0 = x + w - 70, B - h + 30
    ink(line([(fx0, fy0), (fx0 + 60, fy0 - 70)]), 1.6, 0.85)
    fx, fy = fx0 + 60, fy0 - 70
    flag = poly([(fx, fy), (fx - 4, fy + 46), (fx + 50, fy + 54), (fx + 54, fy + 10)])
    add(f'<path d="{flag}" fill="{PAPER}"/>')
    for k in range(4):
        wash(poly([(fx - 1, fy + 4 + k * 12), (fx + 53, fy + 14 + k * 12), (fx + 53, fy + 19 + k * 12), (fx - 1, fy + 9 + k * 12)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx, fy), (fx + 22, fy + 4), (fx + 20, fy + 24), (fx - 2, fy + 20)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(flag, 1.2, 0.7)
    return x + w
def pump_and_lamp(x):
    # The old gas pump: a rusted column, a purple glass cylinder, a white crown.
    wash(poly([(x, B + 6), (x + 6, B - 74), (x + 30, B - 74), (x + 36, B + 6)]), "#8A4A35", 0.92, "wcs")
    wash(poly([(x + 4, B - 74), (x + 4, B - 118), (x + 32, B - 118), (x + 32, B - 74)]), "#8E7BC0", 0.85, "wcs")
    wash(f"M{x + 2},{B - 118} a16,12 0 0,1 32,0 Z", "#F4F1EC", 0.95, "wcs")
    ink(poly([(x, B + 6), (x + 6, B - 74), (x + 30, B - 74), (x + 36, B + 6)]), 1.4); ink(poly([(x + 4, B - 74), (x + 4, B - 118), (x + 32, B - 118), (x + 32, B - 74)]), 1.3)
    ink(f"M{x + 2},{B - 118} a16,12 0 0,1 32,0", 1.2)
    ink(f"M{x + 30},{B - 60} q22,20 4,62", 1.2, 0.8)   # the hose
    # The green lamp post.
    lx = x - 34
    ink(line([(lx, B + 24), (lx, B - 150)]), 3.2, 0.95, color="#2F5A45")
    ink(f"M{lx - 9},{B - 150} a9,9 0 1,1 18,0 Z", 1.6, 0.95, color="#2F5A45")

xx = 1000
xx = brick_block(xx, 150, 140, "#B85A3E", "#2F4A66") + 4
xx = brick_block(xx, 120, 118, "#C9885E", "#7A2E26", cornice="#5C4A3E") + 100
bx = xx
xx = bimson(xx) + 50
pump_and_lamp(bx - 50)
xx = brick_block(xx, 160, 150, "#A9503A", "#3F5E4A", arched=True) + 4
xx = brick_block(xx, 128, 124, "#D2A37C", "#2F2C2E", cornice="#5C4A3E") + 4
wash(poly([(940, B + 2), (2300, B + 2), (2306, B + 14), (934, B + 14)]), "#7E7398", 0.45, "wcs", g=True)
for x in (960, 2290):
    cottonwood(x, B + 12, 40)
add('</g>')

# --- Pioneer Park: the pond, its fountain and the cattails.
INKSCALE = 1.1
bank = [(0, 770), (800, 762), (1600, 772), (2400, 764)]
wash(ridge_d(bank), "#B7B266", 0.9, "wc1")
add('<g transform="translate(420 0)">')
pond = "M360,858 C430,812 700,806 940,812 C1180,800 1420,818 1560,846 C1640,866 1620,900 1500,918 C1300,944 1000,930 800,940 C600,950 420,930 370,904 C340,888 340,870 360,858 Z"
wash(pond, "#7FAFCB", 0.92, "wc3")
wash("M440,852 C700,826 1000,822 1300,834 C1200,866 800,880 480,878 Z", "#C9DDE8", 0.5, "wc3", g=True)   # the sky in the water
wash("M380,896 C700,918 1200,920 1580,878 C1560,906 1300,936 1000,930 C760,940 450,928 380,896 Z", "#4F7C9A", 0.35, "wc3", g=True)
ink(pond, 2.0, 0.7)
# The fountain: a jet left as paper, with spray and rings.
fx, fy = 960, 872
add(f'<path d="M{fx - 10},{fy} C{fx - 6},{fy - 60} {fx - 3},{fy - 110} {fx},{fy - 130} C{fx + 3},{fy - 110} {fx + 6},{fy - 60} {fx + 10},{fy} Z" fill="#FCFAF5" opacity="0.95" filter="url(#wcs)"/>')
for i in range(40):
    a = random.uniform(-1.3, 1.3); r = random.uniform(20, 70)
    add(f'<circle cx="{fx + math.sin(a) * r:.0f}" cy="{fy - 120 + abs(math.sin(a)) * r * 1.4 + random.uniform(0, 40):.0f}" r="{random.uniform(2, 4):.1f}" fill="#FCFAF5" opacity="0.9"/>')
for k, (rx, ry) in enumerate([(34, 7), (66, 11), (104, 16)]):
    add(f'<ellipse cx="{fx}" cy="{fy + 4 + k * 3}" rx="{rx}" ry="{ry}" fill="none" stroke="#FCFAF5" stroke-width="{3 - k * 0.6:.1f}" opacity="0.85"/>')
for i in range(40):
    x = random.uniform(440, 1480); y = random.uniform(840, 920)
    add(f'<path d="M{x:.0f},{y:.0f} q30,-4 60,0" stroke="#FCFAF5" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.75"/>')
# Cattails in clumps at the pond's edges, and grass tufts across the near bank.
def cattails(cx, base, n, spread):
    for k in range(n):
        x = cx + random.uniform(-spread, spread); top = base - random.uniform(50, 110); lean = jit(10)
        ink(line([(x, base), (x + lean, top)]), 1.3, 0.75, color="#55652F")
        if random.random() < 0.45:
            wash(f"M{x + lean - 4:.0f},{top + 4:.0f} a4,13 0 1,0 8,0 a4,13 0 1,0 -8,0 Z", "#6B4329", 0.92, "wcs", g=True)
    wash(f"M{cx - spread - 10:.0f},{base} C{cx - spread},{base - 50} {cx + spread},{base - 50} {cx + spread + 10:.0f},{base} Z", "#8E9A4C", 0.45, "wcs", g=True)
for cx, base, n, sp in [(370, 912, 26, 40), (520, 950, 18, 34), (1540, 900, 22, 36), (1640, 870, 14, 26), (880, 960, 12, 30), (1300, 952, 14, 30)]:
    cattails(cx, base, n, sp)
add('</g>')
for i in range(200):
    x = random.uniform(0, 2400); y = random.uniform(780, 995)
    if 760 < x < 2060 and 800 < y < 945: continue
    ink(line([(x, y + 14), (x + jit(5), y)]), 1.0, 0.4)
wash("M0,975 C400,955 900,970 1300,962 C1700,955 2100,970 2400,958 L2400,1000 L0,1000 Z", "#A49A55", 0.5, "wc3", g=True)

finish(sys.argv[1])
