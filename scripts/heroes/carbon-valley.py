"""Carbon Valley hero, ink and watercolour, 2400 x 1000, in the Lyons style.

The Carbon Valley on an autumn morning, composed from the guide's own
reference photographs. Across the fields, a low far rise with a line of new
houses along its top and the far tree line, as the St. Vrain State Park sign
photo shows them across the water (st-vrain-state-park.jpg). Along the
right, left to right: Frederick's two-storey red-brick corner building at
Fifth and Oak with its stepped parapet, gooseneck lamps, slit windows and
recessed balcony, the stucco upper floor and one-storey brick front beside
it on Oak, the lower brick building along Fifth and the black lamppost
(fifth-street-at-oak.jpg); Firestone's former Town Hall, low and beige with
its blue metal roof, the mine car in its gable, the stone piers at the door
and the US and Colorado flags (firestone-former-town-hall.jpg); the Carbon
Valley Regional Library's stacked-stone rotunda with its cornice, dark brick
piers and name band, the stone block and stucco wings
(carbon-valley-regional-library.jpg); and Fort Lupton's 1920 Ottesen Grain
Co. feed mill with its two tile silos, the corrugated headhouse, the cyclone
and the long porch (ottesen-grain-mill.jpg). In front, Bald Eagle Pond at
St. Vrain State Park with its tall cottonwoods, the gravel path to the water
and the willows on the right (hero.jpg), and the park's sign in the grass
behind the barbed-wire fence and its red post (st-vrain-state-park.jpg).

None of the guide's photographs shows Dacono, the mountains or the rebuilt
fort at Fort Lupton, so none of them is painted: the horizon is a low haze
of generic hills, and the fields, windbreaks and trees are generic filler.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(14)

sky()
for cx, cy, s in [(290, 130, 58), (930, 96, 44), (1560, 150, 68), (2170, 110, 52), (600, 320, 30), (1880, 300, 30)]:
    cloud(cx, cy, s)

# --- The far horizon. No mountains in the guide's photographs: a low haze of
# hills, then the grassy rise with its new houses, as across the park's water.
INKSCALE = 0.55
far = [(0, 484), (200, 478), (420, 482), (640, 474), (860, 480), (1080, 472), (1300, 478), (1540, 470), (1780, 478), (2020, 472), (2240, 480), (2400, 474)]
wash(ridge_d(far), "#A9AECB", 0.7, "wc3")
ink(open_path(far), 1.1, 0.35)
rise = [(0, 500), (140, 492), (300, 486), (520, 484), (700, 488), (860, 496), (1000, 504)]
wash(ridge_d(rise, 530), "#A6A46E", 0.85, "wc2")
ink(open_path(rise), 1.2, 0.45)
for x in range(150, 820, 15):   # the houses along the top of the rise
    if random.random() < 0.45: continue
    y = interp(rise, x) + 1
    wash(poly([(x - 6, y + 4), (x - 6, y), (x, y - 5), (x + 6, y), (x + 6, y + 4)]), random.choice(["#8E8890", "#A08C7A", "#7E8794", "#C9BBA8"]), 0.55, "wcs", g=True)

# --- The fields, with windbreaks along the far section lines.
INKSCALE = 0.85
fields = [(0, 506), (800, 510), (1600, 504), (2400, 508)]
wash(ridge_d(fields), "#CDB86C", 0.88, "wc3")
for y0, col in [(548, "#A6A35E"), (622, "#D3BC70"), (690, "#B0A25C")]:   # late alfalfa, stubble, pasture
    wash(f"M0,{y0} C600,{y0 - 8} 1400,{y0 + 6} 2400,{y0 - 6} L2400,{y0 + 46} C1400,{y0 + 56} 600,{y0 + 40} 0,{y0 + 50} Z", col, 0.4, "wc3", g=True)
for i in range(40):
    x = random.uniform(0, 2400); y = random.uniform(524, 730)
    ink(line([(x, y), (x + random.uniform(60, 160), y + jit(2))]), 0.8, 0.22)
for x in range(-20, 2440, 28):
    y = interp(fields, x) + 5 + jit(3); r = random.uniform(9, 15)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#7E8F4E", "#A39A45", "#D6A63C"]), 0.85, "wcs")
wash("M0,640 C400,632 800,646 1160,636 L1160,712 C800,722 400,708 0,716 Z", "#8E944E", 0.3, "wc3", g=True)   # a green field toward the water
for x, base, r in [(150, 662, 44), (214, 670, 54), (520, 650, 40), (860, 640, 36)]:
    cottonwood(x, base, r, back=True)
fence = [(0, 728), (380, 722), (760, 730), (1140, 724)]
ink(open_path(fence), 1.2, 0.5); ink(open_path([(x, y + 11) for x, y in fence]), 1.0, 0.4)
for x in range(12, 1140, 44):
    y = interp(fence, x); ink(line([(x, y - 7), (x + 1, y + 20)]), 1.4, 0.55)

# --- The towns, left to right along a base at y 712, with gold cottonwoods behind.
for x in range(1180, 2400, 122):
    cottonwood(x + jit(30), 640 + jit(10), random.uniform(58, 74), back=True, shadow=False)
B = 712
INKSCALE = 1.0
BRICK, BRICK_D, COPING, DARK = "#B5563B", "#7E3426", "#3A3533", "#2B2A2C"

def rect(x0, y0, x1, y1): return poly([(x0, y1), (x0, y0), (x1, y0), (x1, y1)])
def pane(x0, y0, x1, y1, col=None, op=0.85, w=1.0):
    wash(rect(x0, y0, x1, y1), col or WIN, op, "wcs", g=True)
    ink(rect(x0, y0, x1, y1), w, 0.65)
def gooseneck(x, y):
    ink(f"M{x},{y} q0,-9 9,-9", 1.1, 0.8, color=DARK)
    wash(f"M{x + 4},{y - 6} a5,5 0 0,1 10,0 Z", "#ECE7DC", 0.95, "wcs")
    ink(f"M{x + 4},{y - 6} a5,5 0 0,1 10,0 Z", 0.9, 0.7)
def lettering(x0, x1, y, col, op=0.6):   # a suggestion of a sign's words
    x = x0
    while x < x1 - 4:
        L = random.uniform(4, 9)
        ink(line([(x, y), (min(x + L, x1), y + jit(0.5))]), 1.3, op, color=col)
        x += L + random.uniform(2, 4)

def frederick(x):
    """Fifth Street at Oak, Frederick."""
    # The lower brick building along Fifth, its parapet raised at the end.
    lw, lh = 72, 80
    lb = [(x, B), (x, B - lh - 12), (x + 9, B - lh - 12), (x + 9, B - lh), (x + lw, B - lh), (x + lw, B)]
    wash(poly(lb), "#AE563E", 0.92, "wcs")
    wash(rect(x + lw * 0.55, B - lh, x + lw, B), BRICK_D, 0.25, "wcs", g=True)
    coursing(x, B - lh + 2, x + lw, B, step=9)
    wash(rect(x + 9, B - lh - 3, x + lw + 2, B - lh + 3), COPING, 0.6, "wcs", g=True)
    pane(x + 26, B - 42, x + 40, B, "#3E3B46")
    pane(x + 6, B - 46, x + 20, B - 22); pane(x + 48, B - 46, x + 64, B - 22)
    ink(poly(lb), 1.8)
    # The corner building: two storeys, a stepped parapet rising to a peak.
    ax, aw, ah = x + lw + 2, 132, 134
    t = B - ah
    par = [(ax, B), (ax, t + 8), (ax + 20, t + 8), (ax + 20, t - 6), (ax + 42, t - 6), (ax + 42, t - 30), (ax + 70, t - 30), (ax + 70, t), (ax + aw, t), (ax + aw, B)]
    wash(poly(par), BRICK, 0.93, "wcs")
    wash(rect(ax + aw * 0.7, t, ax + aw, B), BRICK_D, 0.22, "wcs", g=True)
    wash(rect(ax + 58, t - 30, ax + 70, t), COPING, 0.45, "wcs", g=True)   # the peak's shaded flank
    coursing(ax, t + 8, ax + aw, B - 54, step=9); coursing(ax + 42, t - 30, ax + 70, t + 8, step=9)
    for a, b, y in [(ax - 2, ax + 20, t + 8), (ax + 20, ax + 42, t - 6), (ax + 42, ax + 70, t - 30), (ax + 70, ax + aw + 2, t)]:
        ink(line([(a, y + 3), (b, y + 3)]), 0.9, 0.5)   # the coping courses
    # The name plaque with two gooseneck lamps over it.
    px0, px1 = ax + 38, ax + 96
    wash(rect(px0, t + 22, px1, t + 32), "#E8E0CE", 0.9, "wcs"); ink(rect(px0, t + 22, px1, t + 32), 1.0, 0.7)
    lettering(px0 + 6, px1 - 6, t + 27, DARK, 0.5)
    for gx in (px0 + 4, px0 + 30): gooseneck(gx, t + 20)
    # Slit windows either side of the recessed balcony.
    for sx in (ax + 14, ax + 28, ax + 98, ax + 112):
        pane(sx, t + 42, sx + 8, t + 82, None, 0.9)
    pane(ax + 54, t + 40, ax + 80, t + 88, "#5E4648", 0.8)
    ink(line([(ax + 54, t + 74), (ax + 80, t + 74)]), 1.2, 0.85, color=DARK)
    for rx in range(int(ax + 57), int(ax + 79), 4):
        ink(line([(rx, t + 74), (rx, t + 87)]), 0.7, 0.7, color=DARK)
    wash(rect(ax + 44, t + 94, ax + 90, t + 101), "#E8E0CE", 0.9, "wcs"); ink(rect(ax + 44, t + 94, ax + 90, t + 101), 0.9, 0.6)
    # The ground floor's recessed porch with its brick piers.
    wash(rect(ax + 6, B - 52, ax + aw - 26, B), "#4A3A3C", 0.7, "wcs", g=True)
    pane(ax + 12, B - 44, ax + 36, B - 8); pane(ax + 58, B - 44, ax + 70, B)
    for pxx in (ax + 40, ax + 76):
        wash(rect(pxx, B - 52, pxx + 12, B), BRICK, 0.95, "wcs"); ink(rect(pxx, B - 52, pxx + 12, B), 1.2, 0.7)
    ink(line([(ax + 6, B - 52), (ax + aw - 26, B - 52)]), 1.4, 0.75)
    ink(poly(par), 2.0)
    # Its side along Oak, then the stucco upper floor set back over a
    # one-storey brick front with a sign band, lamps and big windows.
    bx = ax + aw
    side = rect(bx, t + 6, bx + 30, B)
    wash(side, BRICK, 0.93, "wcs"); wash(side, BRICK_D, 0.3, "wcs", g=True)
    coursing(bx, t + 6, bx + 30, B, step=9)
    wash(rect(bx - 1, t + 2, bx + 31, t + 8), COPING, 0.8, "wcs", g=True)
    pane(bx + 10, t + 22, bx + 20, t + 64)
    ink(side, 1.8)
    sx0, sx1 = bx + 30, bx + 124
    up = rect(sx0, B - 122, sx1, B - 70)
    wash(up, "#D7B28C", 0.92, "wcs")
    wash(rect(sx0 - 2, B - 128, sx1 + 2, B - 120), COPING, 0.85, "wcs")
    pane(sx0 + 14, B - 110, sx0 + 40, B - 92); pane(sx0 + 66, B - 112, sx0 + 84, B - 100)
    ink(up, 1.5)
    front = rect(sx0, B - 72, sx1, B)
    wash(front, "#B25A40", 0.93, "wcs")
    wash(rect(sx0 + sx1 * 0 + 60, B - 72, sx1, B), BRICK_D, 0.18, "wcs", g=True)
    coursing(sx0, B - 70, sx1, B, step=9)
    wash(rect(sx0 - 2, B - 77, sx1 + 2, B - 70), "#8E8A86", 0.8, "wcs")
    wash(rect(sx0 + 16, B - 62, sx1 - 8, B - 53), "#EEE8DC", 0.9, "wcs"); ink(rect(sx0 + 16, B - 62, sx1 - 8, B - 53), 0.9, 0.65)
    lettering(sx0 + 22, sx1 - 14, B - 57.5, DARK, 0.45)
    for gx in (sx0 + 20, sx1 - 30): gooseneck(gx, B - 64)
    pane(sx0 + 8, B - 44, sx0 + 44, B - 10); pane(sx0 + 54, B - 44, sx1 - 6, B - 10)
    ink(front, 1.8)
    ink(line([(sx0 + 1, B - 120), (sx0 + 1, B - 4)]), 1.4, 0.8, color=DARK)   # downspout
    ink(line([(sx1 - 34, B - 16), (sx1 + 6, B - 16)]), 1.3, 0.9, color="#2F5A45")   # the green railing
    for rx in range(int(sx1 - 32), int(sx1 + 6), 5):
        ink(line([(rx, B - 16), (rx, B - 2)]), 0.8, 0.85, color="#2F5A45")
    return sx1 + 6

def lamppost(x):
    """The black lamppost with its acorn globe on Fifth Street."""
    ink(line([(x, B + 22), (x, B - 96)]), 3.0, 0.95, color=DARK)
    ink(line([(x - 6, B + 22), (x + 6, B + 22)]), 3.0, 0.95, color=DARK)
    ink(line([(x - 4, B - 96), (x + 4, B - 96)]), 2.4, 0.95, color=DARK)
    globe = f"M{x - 8},{B - 98} C{x - 11},{B - 112} {x - 6},{B - 122} {x},{B - 124} C{x + 6},{B - 122} {x + 11},{B - 112} {x + 8},{B - 98} Z"
    wash(globe, "#F2EBD8", 0.95, "wcs"); ink(globe, 1.2, 0.8)
    ink(f"M{x - 4},{B - 123} l4,-7 l4,7", 1.3, 0.9, color=DARK)

def small_tree(x, base, r, col, shade):
    blobs = [(-0.5, -0.9, 0.55), (0.45, -0.95, 0.55), (0, -1.3, 0.62), (-0.2, -0.7, 0.5), (0.3, -0.65, 0.45)]
    d = " ".join(f"M{x + dx * r - rr * r:.1f},{base + dy * r:.1f} a{rr * r:.1f},{rr * r:.1f} 0 1,0 {2 * rr * r:.1f},0 a{rr * r:.1f},{rr * r:.1f} 0 1,0 {-2 * rr * r:.1f},0 Z" for dx, dy, rr in blobs)
    wash(d, col, 0.9, "wcs")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.8:.0f} C{x + r * 1.2:.0f},{base - r * 1.5:.0f} {x + r * 1.1:.0f},{base - r * 0.4:.0f} {x + r * 0.2:.0f},{base - r * 0.35:.0f} C{x + r * 0.5:.0f},{base - r * 0.9:.0f} {x + r * 0.4:.0f},{base - r * 1.3:.0f} {x + r * 0.1:.0f},{base - r * 1.8:.0f} Z", shade, 0.45, "wcs", g=True)
    ink(line([(x, base), (x, base - r * 0.5), (x - r * 0.3, base - r * 0.8)]), 1.4, 0.7)
    ink(line([(x, base - r * 0.5), (x + r * 0.3, base - r * 0.85)]), 1.2, 0.6)

def flags(x):
    """The flagpole with the US flag over the Colorado flag."""
    ink(line([(x, B + 2), (x, B - 152)]), 1.5, 0.85)
    add(f'<circle cx="{x}" cy="{B - 154}" r="2.5" fill="{INK}" opacity="0.8"/>')
    fx, fy = x + 1, B - 150
    flag = poly([(fx, fy), (fx + 34, fy + 2), (fx + 34, fy + 22), (fx, fy + 20)])
    add(f'<path d="{flag}" fill="{PAPER}"/>')
    for k in range(4):
        wash(poly([(fx, fy + 1 + k * 5.4), (fx + 34, fy + 3 + k * 5.4), (fx + 34, fy + 5.6 + k * 5.4), (fx, fy + 3.6 + k * 5.4)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx, fy), (fx + 14, fy + 1), (fx + 14, fy + 11), (fx, fy + 10)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(flag, 1.0, 0.7)
    cy = fy + 28
    co = f"M{fx},{cy} C{fx + 12},{cy - 4} {fx + 24},{cy + 4} {fx + 38},{cy + 1} L{fx + 38},{cy + 25} C{fx + 24},{cy + 28} {fx + 12},{cy + 20} {fx},{cy + 24} Z"
    add(f'<path d="{co}" fill="{PAPER}"/>')
    add(f'<clipPath id="coflag"><path d="{co}"/></clipPath>')
    add('<g clip-path="url(#coflag)">')
    wash(rect(fx - 2, cy - 6, fx + 40, cy + 6), "#2F4A8A", 0.9, "wcs", g=True)
    wash(rect(fx - 2, cy + 16, fx + 40, cy + 30), "#2F4A8A", 0.9, "wcs", g=True)
    add('</g>')
    ccx, ccy = fx + 18, cy + 12
    add(f'<path d="M{ccx + 6},{ccy - 6} A8.5,8.5 0 1,0 {ccx + 6},{ccy + 6}" stroke="#C0392B" stroke-width="4" fill="none" opacity="0.9"/>')
    add(f'<circle cx="{ccx}" cy="{ccy}" r="3.6" fill="#E8B730" opacity="0.95"/>')
    ink(co, 1.0, 0.7)

def town_hall(x):
    """Firestone's former Town Hall, 151 Grant Avenue."""
    w, wh = 300, 56
    WALL, STONE_B, ROOF, ROOF_D = "#E9DEC6", "#D5C29C", "#4F90B2", "#2E5F7A"
    top = [(x - 10, B - wh + 2), (x + 34, B - wh - 30), (x + w - 34, B - wh - 30), (x + w + 10, B - wh + 2)]
    roof = poly(top)
    wash(roof, ROOF, 0.92, "wcs")
    wash(poly([(x + w - 34, B - wh - 30), (x + w + 10, B - wh + 2), (x + w - 60, B - wh + 2)]), ROOF_D, 0.3, "wcs", g=True)
    for sx in range(int(x - 4), int(x + w + 8), 8):   # standing seams
        ink(line([(sx, interp(top, sx) + 2), (sx, B - wh + 1)]), 0.6, 0.35, color=ROOF_D)
    ink(roof, 1.6, 0.85)
    wall = rect(x, B - wh, x + w, B)
    wash(wall, WALL, 0.92, "wcs")
    wash(rect(x, B - 22, x + w, B), STONE_B, 0.6, "wcs", g=True)   # the split-face block below
    coursing(x, B - 24, x + w, B, step=7)
    ink(line([(x, B - 22), (x + w, B - 22)]), 1.0, 0.7, color="#3F7FA0")
    wash(rect(x, B - wh, x + w, B - wh + 7), "#7E7398", 0.3, "wcs", g=True)   # shade under the eave
    for px in (x + 4, x + 46):   # the stone pilasters at the west end
        wash(rect(px, B - wh + 4, px + 14, B), "#DCCBA6", 0.9, "wcs"); coursing(px, B - wh + 4, px + 14, B, step=6)
        ink(rect(px, B - wh + 4, px + 14, B), 1.0, 0.6)
    for wx in (x + 222, x + 250, x + 276):
        pane(wx, B - 46, wx + 16, B - 28, "#3E3B46")
    wash(rect(x + w * 0.75, B - wh, x + w, B), "#7A6E86", 0.16, "wcs", g=True)
    ink(wall, 1.8)
    # The entrance portico under its gable, with the mine car in the gable.
    gx0, gx1 = x + 86, x + 214; cx = (gx0 + gx1) / 2
    wash(rect(gx0 + 26, B - 50, gx1 - 26, B), "#6E6680", 0.35, "wcs", g=True)
    pane(gx0 + 30, B - 40, gx1 - 30, B, "#3E3B46", 0.78)
    for mx in (cx - 10, cx + 10):
        ink(line([(mx, B - 40), (mx, B)]), 0.8, 0.6)
    for p0 in (gx0 + 8, gx1 - 24):
        wash(rect(p0, B - 50, p0 + 16, B), "#DCCBA6", 0.95, "wcs"); coursing(p0, B - 50, p0 + 16, B, step=6)
        ink(rect(p0, B - 50, p0 + 16, B), 1.2, 0.7)
    wash(rect(gx0 + 8, B - 50, gx1 - 8, B - 44), WALL, 0.95, "wcs")
    face = poly([(gx0 + 6, B - 62), (cx, B - 124), (gx1 - 6, B - 62)])
    wash(face, "#EDE2CB", 0.95, "wcs")
    car = poly([(cx - 14, B - 99), (cx + 14, B - 99), (cx + 10, B - 87), (cx - 10, B - 87)])
    wash(car, "#D98E72", 0.95, "wcs"); ink(car, 1.1, 0.75)
    for wx in (cx - 6, cx + 6):
        add(f'<circle cx="{wx:.0f}" cy="{B - 83}" r="3.6" fill="#D98E72" stroke="{INK}" stroke-width="0.9" stroke-opacity="0.7"/>')
    lettering(gx0 + 24, gx1 - 24, B - 70, "#7A2420", 0.85)
    wash(rect(gx0 - 6, B - 62, gx1 + 6, B - 50), ROOF, 0.92, "wcs")
    for sx in range(int(gx0 - 2), int(gx1 + 6), 7):
        ink(line([(sx, B - 61), (sx, B - 51)]), 0.6, 0.4, color=ROOF_D)
    rake = poly([(gx0 - 10, B - 58), (cx, B - 134), (gx1 + 10, B - 58), (gx1 - 4, B - 58), (cx, B - 120), (gx0 + 4, B - 58)])
    wash(rake, ROOF, 0.95, "wcs")
    ink(rake, 1.5, 0.85); ink(face, 1.2, 0.6); ink(rect(gx0 - 6, B - 62, gx1 + 6, B - 50), 1.3, 0.8)
    small_tree(x + 70, B + 4, 30, "#D0702E", "#8E3A22")
    flags(x + 238)
    return x + w + 10

def library(x):
    """The Carbon Valley Regional Library, Firestone."""
    LS, PIER, CORN, CAN, STU, MET = "#C9B597", "#7B5646", "#ECDDBF", "#3D4859", "#CDAE98", "#5D6472"
    wash(rect(x + 196, B - 88, x + 282, B), MET, 0.9, "wcs")   # the dark metal-clad block behind
    for y in range(int(B - 84), int(B - 60), 5):
        ink(line([(x + 198, y), (x + 280, y)]), 0.6, 0.35)
    ink(rect(x + 196, B - 88, x + 282, B), 1.4, 0.7)
    lw = rect(x, B - 72, x + 30, B)   # the west wing's end
    wash(lw, STU, 0.92, "wcs"); pane(x + 4, B - 56, x + 26, B - 10, "#3E434E"); ink(lw, 1.6)
    st = rect(x + 28, B - 94, x + 72, B)   # the stacked-stone block, and its flue
    wash(st, LS, 0.94, "wcs"); coursing(x + 28, B - 94, x + 72, B, step=7)
    wash(rect(x + 60, B - 94, x + 72, B), "#6E6585", 0.25, "wcs", g=True)
    wash(rect(x + 38, B - 104, x + 50, B - 94), "#4E4A4C", 0.9, "wcs"); ink(rect(x + 38, B - 104, x + 50, B - 94), 1.0, 0.7)
    ink(st, 1.7)
    lk = rect(x + 72, B - 70, x + 96, B)
    wash(lk, STU, 0.92, "wcs"); ink(lk, 1.4)
    rw = rect(x + 226, B - 66, x + 290, B)   # the east wing, with sunshades over its windows
    wash(rw, STU, 0.92, "wcs")
    for wx in (x + 240, x + 266):
        pane(wx, B - 48, wx + 16, B - 16, "#3E434E")
        ink(line([(wx - 4, B - 51), (wx + 20, B - 51)]), 1.6, 0.85, color=DARK)
    ink(rw, 1.6)
    # The rotunda: stacked stone between dark brick piers, a band of
    # windows under the cornice, tall glass over the door.
    rx0, rx1, rh = x + 94, x + 226, 118
    cx = (rx0 + rx1) / 2
    drum = f"M{rx0},{B} L{rx0},{B - rh + 6} Q{cx},{B - rh - 6} {rx1},{B - rh + 6} L{rx1},{B} Z"
    wash(drum, LS, 0.94, "wcs")
    coursing(rx0, B - rh + 10, rx1, B, step=8)
    wash(rect(rx1 - 34, B - rh, rx1, B), "#6E6585", 0.22, "wcs", g=True)
    wash(rect(rx1 - 14, B - rh, rx1, B), "#6E6585", 0.18, "wcs", g=True)
    wash(rect(rx0, B - rh, rx0 + 10, B), "#6E6585", 0.15, "wcs", g=True)
    for f in (0.06, 0.3, 0.7, 0.94):
        px = rx0 + (rx1 - rx0) * f
        wash(rect(px - 3.5, B - rh + 8, px + 3.5, B), PIER, 0.85, "wcs", g=True)
    for a, b in [(0.06, 0.3), (0.3, 0.7), (0.7, 0.94)]:
        pane(rx0 + (rx1 - rx0) * a + 6, B - rh + 12, rx0 + (rx1 - rx0) * b - 6, B - rh + 21, "#4A5060", 0.7, 0.8)
    tx0, tx1 = rx0 + (rx1 - rx0) * 0.4, rx0 + (rx1 - rx0) * 0.6
    pane(tx0, B - rh + 28, tx1, B - 62, "#4A5060", 0.75)
    for k in range(1, 4):
        ink(line([(tx0, B - rh + 28 + k * 9), (tx1, B - rh + 28 + k * 9)]), 0.6, 0.45)
    ink(line([(cx, B - rh + 28), (cx, B - 60)]), 0.7, 0.5)
    ink(drum, 1.8)
    corn = f"M{rx0 - 8},{B - rh + 8} Q{cx},{B - rh - 10} {rx1 + 8},{B - rh + 8} L{rx1 + 8},{B - rh + 16} Q{cx},{B - rh - 2} {rx0 - 8},{B - rh + 16} Z"
    wash(corn, CORN, 0.95, "wcs"); ink(corn, 1.4, 0.8)
    # The name band across the front, and the doors under it.
    can = f"M{x + 64},{B - 60} Q{cx},{B - 66} {x + 252},{B - 60} L{x + 252},{B - 47} Q{cx},{B - 53} {x + 64},{B - 47} Z"
    wash(rect(x + 116, B - 48, x + 204, B), "#6E6680", 0.22, "wcs", g=True)
    pane(x + 126, B - 42, x + 194, B, "#4A5060", 0.75)
    for mx in (x + 143, x + 160, x + 177):
        ink(line([(mx, B - 44), (mx, B)]), 0.8, 0.55)
    wash(can, CAN, 0.95, "wcs"); ink(can, 1.3, 0.85)
    lettering(x + 84, x + 232, B - 54.5, "#F4F1EA", 0.95)
    return x + 290

def tile_silo(x0, x1, top, bot):
    body = rect(x0, top, x1, bot)
    wash(body, "#B47E56", 0.94, "wcs")
    for r, y in enumerate(range(int(top + 4), int(bot - 3), 7)):   # the glazed tiles, each its own colour
        for tx in range(int(x0 + 1 + (r % 2) * 4), int(x1 - 4), 8):
            wash(rect(tx, y, tx + 7, y + 6), random.choice(["#C99062", "#8F5B40", "#A39A6E", "#D6A86E", "#7E6A58", "#B9734E"]), 0.5, "wcs", g=True)
    wash(rect(x1 - (x1 - x0) * 0.35, top, x1, bot), "#5E4A5A", 0.35, "wcs", g=True)
    wash(rect(x0, top, x0 + (x1 - x0) * 0.15, bot), "#5E4A5A", 0.15, "wcs", g=True)
    wash(rect(x0 - 2, top - 4, x1 + 2, top + 3), "#4A3F3A", 0.85, "wcs")
    ink(body, 1.5)

def ottesen(x):
    """The 1920 Ottesen Grain Co. feed mill, Fort Lupton."""
    GALV, GALV_D, SH, GREEN = "#B3BDC6", "#6F7C8E", "#8D9298", "#4E8A52"
    tile_silo(x + 128, x + 162, B - 160, B - 50)   # the second silo, behind
    tile_silo(x + 90, x + 142, B - 172, B - 50)
    # The headhouse: a tall corrugated tower with a little gable cap.
    hx0, hx1, ht = x + 152, x + 196, B - 252
    hh = rect(hx0, ht, hx1, B - 50)
    wash(hh, GALV, 0.94, "wcs")
    wash(rect(hx0 + 6, ht + 30, hx0 + 18, ht + 80), "#E3E8EC", 0.8, "wcs")   # the brighter replaced sheets
    wash(rect(hx1 - 16, ht + 40, hx1 - 6, ht + 110), "#D6DDE3", 0.6, "wcs")
    wash(rect(hx0 + (hx1 - hx0) * 0.6, ht, hx1, B - 50), GALV_D, 0.35, "wcs", g=True)
    for sx in range(int(hx0 + 3), int(hx1 - 1), 4):
        ink(line([(sx, ht + 2), (sx, B - 52)]), 0.5, 0.22)
    cap = poly([(hx0 - 4, ht + 1), ((hx0 + hx1) / 2, ht - 14), (hx1 + 4, ht + 1)])
    wash(cap, GALV_D, 0.9, "wcs"); ink(cap, 1.3)
    pane(hx0 + 18, ht + 120, hx0 + 28, ht + 134, "#3E434E", 0.8, 0.8)
    pane(hx0 + 18, ht + 10, hx0 + 26, ht + 18, "#3E434E", 0.8, 0.8)
    ink(hh, 1.6)
    # The spout from the headhouse to the silo top, and the vent cap.
    ink(line([(hx0, ht + 56), (x + 124, B - 178)]), 2.8, 0.85, color="#4A4444")
    wash(f"M{x + 104},{B - 174} a8,8 0 0,1 16,0 Z", "#E4E6EA", 0.95, "wcs"); ink(f"M{x + 104},{B - 174} a8,8 0 0,1 16,0 Z", 1.0, 0.7)
    # The west shed: a corrugated gable over a long porch with a green rail.
    sw = poly([(x, B), (x, B - 70), (x + 48, B - 112), (x + 96, B - 70), (x + 96, B)])
    wash(sw, "#9AA3AE", 0.93, "wcs")
    for sx in range(int(x + 3), int(x + 95), 4):
        ink(line([(sx, max(B - 70 - (48 - abs(sx - x - 48)) * 42 / 48, B - 110) + 3), (sx, B - 72)]), 0.5, 0.22)
    wash(rect(x, B - 70, x + 96, B), "#55524F", 0.9, "wcs")
    pane(x + 40, B - 98, x + 54, B - 84, "#5A3A2E", 0.85, 0.9)
    ink(sw, 1.6)
    ink(line([(x - 6, B - 68), (x + 48, B - 116), (x + 102, B - 68)]), 2.0, 0.85)
    # The green front between, with its door.
    gf = rect(x + 96, B - 64, x + 176, B)
    wash(gf, GREEN, 0.92, "wcs")
    wash(rect(x + 92, B - 70, x + 180, B - 62), "#3E3633", 0.9, "wcs")
    pane(x + 104, B - 52, x + 120, B - 36, "#2F3034"); pane(x + 152, B - 52, x + 168, B - 36, "#2F3034")
    pane(x + 128, B - 46, x + 146, B, "#2F3034", 0.9)
    wash(rect(x + 138, B - 44, x + 146, B), "#D9826A", 0.9, "wcs", g=True)
    ink(gf, 1.6)
    # The east building, its gable end in corrugated metal, a shingled roof,
    # and the cyclone on top.
    ex0, ex1 = x + 176, x + 262
    ew = poly([(ex0, B), (ex0, B - 64), ((ex0 + ex1) / 2, B - 104), (ex1, B - 64), (ex1, B)])
    wash(ew, "#8E99A6", 0.93, "wcs")
    for sx in range(int(ex0 + 3), int(ex1 - 1), 4):
        ink(line([(sx, B - 64 - (43 - abs(sx - (ex0 + ex1) / 2)) * 40 / 43 + 4), (sx, B - 2)]), 0.5, 0.22)
    wash(rect(ex0 + (ex1 - ex0) * 0.6, B - 90, ex1, B), GALV_D, 0.3, "wcs", g=True)
    pane(ex0 + 14, B - 52, ex0 + 40, B - 30, "#2F3034"); pane(ex1 - 26, B - 52, ex1 - 10, B, "#A0523E", 0.85)
    ink(ew, 1.6)
    rk = poly([(ex0 - 10, B - 60), ((ex0 + ex1) / 2, B - 110), (ex1 + 10, B - 60), (ex1 + 2, B - 60), ((ex0 + ex1) / 2, B - 100), (ex0 - 2, B - 60)])
    wash(rk, SH, 0.95, "wcs"); ink(rk, 1.4, 0.85)
    sh = poly([(hx1, B - 76), (ex0 + 30, B - 92), (ex0 - 4, B - 62), (hx1, B - 62)])
    wash(sh, SH, 0.92, "wcs")
    for k in range(3):
        ink(line([(hx1 + 2, B - 70 + k * 4 - 6), (ex0 + 8, B - 76 + k * 5)]), 0.6, 0.35)
    ink(sh, 1.2, 0.7)
    cyx = ex0 + 58
    ink(f"M{cyx - 18},{B - 92} q0,-30 14,-34", 2.4, 0.85, color="#3E3A3A")
    cy = f"M{cyx - 10},{B - 136} L{cyx + 10},{B - 136} L{cyx + 10},{B - 124} L{cyx + 2},{B - 96} L{cyx - 2},{B - 96} L{cyx - 10},{B - 124} Z"
    wash(cy, "#55504E", 0.95, "wcs"); wash(f"M{cyx},{B - 136} L{cyx + 10},{B - 136} L{cyx + 10},{B - 124} L{cyx + 2},{B - 96} Z", "#2F2B2A", 0.4, "wcs", g=True)
    ink(cy, 1.3, 0.85)
    # The long porch roof across the west shed, on posts, with the green rail.
    pr = poly([(x - 14, B - 50), (x + 100, B - 50), (x + 100, B - 58), (x - 10, B - 60)])
    wash(pr, "#5A4636", 0.95, "wcs"); ink(pr, 1.3, 0.85)
    for px in (x - 8, x + 28, x + 64, x + 96):
        ink(line([(px, B - 50), (px, B)]), 2.0, 0.85, color="#5A3A28")
    pane(x + 40, B - 44, x + 54, B, "#C8705A", 0.85)
    ink(line([(x - 12, B - 20), (x + 100, B - 20)]), 2.0, 0.9, color="#4E8A52")
    for px in (x - 10, x + 30, x + 70):
        ink(line([(px, B - 20), (px, B)]), 1.6, 0.85, color="#4E8A52")
    return x + 262

TS = 0.92
wash(poly([(1150, B - 4), (2420, B - 4), (2420, B + 30), (1130, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1130, B + 30), (2420, B + 30)]), 1.4, 0.55)
add(f'<g transform="translate(1195 {B}) scale({TS}) translate(-1195 {-B})">')
cottonwood(1186, B + 10, 30)
xx = frederick(1195)
lamppost(1258)
cottonwood(xx + 8, B + 12, 28)
xx = town_hall(xx + 18)
xx = library(xx + 6)
cottonwood(xx + 10, B + 12, 26)
xx = ottesen(xx + 34)
wash(poly([(1150, B + 2), (xx + 20, B + 2), (xx + 26, B + 14), (1144, B + 14)]), "#7E7398", 0.4, "wcs", g=True)
add('</g>')
print("town row ends at x", round(1195 + (xx - 1195) * TS))

# --- Bald Eagle Pond at St. Vrain State Park.
INKSCALE = 1.1
bank = [(0, 742), (800, 738), (1600, 746), (2400, 740)]
wash(ridge_d(bank), "#B9B068", 0.9, "wc1")
wash("M0,880 C700,860 1500,880 2400,860 L2400,1000 L0,1000 Z", "#A8935A", 0.3, "wc3", g=True)
for x in range(-20, 1150, 40):   # the far tree line along the water
    r = random.uniform(16, 30); y = 794 + jit(3)
    col = random.choice(["#A39A45", "#D6A63C", "#7E8F4E", "#C9A23A"])
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 1.1:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 1.1:.0f} 0 1,0 {-2 * r:.0f},0 Z", col, 0.85, "wcs")
for x, r in [(80, 30), (330, 34), (700, 28)]:
    cottonwood(x, 796, r, back=True, shadow=False)
shore = [(-20, 806), (300, 800), (700, 808), (1100, 802), (1500, 810), (1800, 806), (1990, 816)]
near = [(1990, 816), (2012, 834), (1960, 856), (1800, 872), (1600, 892), (1380, 910), (1180, 928), (1000, 946), (700, 966), (400, 976), (100, 982), (-20, 984)]
pond = open_path(shore) + " " + smooth(near) + " Z"
wash(pond, "#6F9FBF", 0.92, "wc3")
wash("M-20,880 C300,870 700,900 1100,930 C900,960 400,990 -20,990 Z", "#3F6A88", 0.35, "wc3", g=True)   # deeper toward us
rt = [(x, interp(shore, x) + 4) for x in range(-20, 1991, 40)]   # the trees' gold in the water
rb = [(x, interp(shore, x) + 30 + 10 * math.sin(x / 53) + jit(5)) for x in range(1980, -21, -40)]
wash(poly(rt + rb), "#B9A044", 0.3, "wc3", g=True)
for i in range(46):
    x = random.uniform(-20, 1150); y = interp(shore, x) + random.uniform(14, 26); rx, ry = random.uniform(6, 13), random.uniform(10, 20)
    wash(f"M{x - rx:.0f},{y:.0f} a{rx:.0f},{ry:.0f} 0 1,0 {2 * rx:.0f},0 a{rx:.0f},{ry:.0f} 0 1,0 {-2 * rx:.0f},0 Z", random.choice(["#7E8F4E", "#C9A23A", "#9A9A4A"]), 0.26, "wc2", g=True)
for x0, x1, col in [(1200, 1320, "#B5563B"), (1390, 1500, "#4F90B2"), (1560, 1680, "#BBA486"), (1760, 1880, "#9AA3AE")]:   # and the town's
    for k in range(4):
        x = random.uniform(x0, x1); y = interp(shore, x) + random.uniform(16, 24); rx, ry = random.uniform(8, 14), random.uniform(10, 16)
        wash(f"M{x - rx:.0f},{y:.0f} a{rx:.0f},{ry:.0f} 0 1,0 {2 * rx:.0f},0 a{rx:.0f},{ry:.0f} 0 1,0 {-2 * rx:.0f},0 Z", col, 0.2, "wc2", g=True)
add(f'<clipPath id="pc"><path d="{pond}"/></clipPath>')
add('<g clip-path="url(#pc)">')
for i in range(70):   # glints left as paper
    x = random.uniform(-20, 2000); y = random.uniform(818, 980)
    L = random.uniform(24, 70)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},-4 {L:.0f},0" stroke="#FBF7EE" stroke-width="{random.uniform(1.8, 3.2):.1f}" fill="none" stroke-linecap="round" opacity="0.8"/>')
add('</g>')
ink(open_path(near), 1.8, 0.6)
ink(open_path(shore), 1.5, 0.55)
for i in range(240):   # the riprap along the far shore
    x = random.uniform(-20, 1990); y = interp(shore, x) - 2 + jit(3); r = random.uniform(2.5, 5)
    wash(f"M{x - r:.1f},{y:.1f} a{r:.1f},{r * 0.6:.1f} 0 1,0 {2 * r:.1f},0 a{r:.1f},{r * 0.6:.1f} 0 1,0 {-2 * r:.1f},0 Z", random.choice(["#A49C92", "#B8AFA4", "#8F8A84", "#C4BBAE"]), 0.6, "wcs", g=True)

# The gravel path down to the water.
path = "M1290,1000 C1270,970 1220,950 1140,936 C1170,926 1210,924 1250,928 C1340,944 1450,970 1560,1000 Z"
wash(path, "#CDB290", 0.92, "wc1")
for i in range(120):
    x = random.uniform(1180, 1540); y = random.uniform(934, 998)
    add(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{random.uniform(0.8, 1.8):.1f}" fill="#7E6A52" opacity="0.4"/>')
ink("M1290,1000 C1270,970 1220,950 1140,936", 1.3, 0.55); ink("M1250,928 C1340,944 1450,970 1560,1000", 1.3, 0.55)

def reeds(cx, base, n, spread):
    wash(f"M{cx - spread - 6:.0f},{base + 2} C{cx - spread * 0.6:.0f},{base - 12} {cx + spread * 0.6:.0f},{base - 12} {cx + spread + 6:.0f},{base + 2} Z", "#8E9A4C", 0.28, "wcs", g=True)
    for k in range(n):
        x = cx + random.uniform(-spread, spread); top = base - random.uniform(24, 66) * (1 - abs(x - cx) / spread * 0.4); lean = jit(9)
        ink(f"M{x:.0f},{base} q{lean * 0.3:.0f},{(top - base) * 0.5:.0f} {lean:.0f},{top - base:.0f}", 1.3, 0.75, color=random.choice(["#6E7A34", "#8E8A3A", "#B8942E", "#7E6A2E"]))
for cx, base, n, sp in [(60, 996, 30, 34), (330, 990, 26, 30), (640, 980, 32, 36), (880, 962, 18, 24), (1500, 904, 24, 30), (1880, 872, 26, 30), (240, 812, 18, 26), (900, 814, 14, 22)]:
    reeds(cx, base, n, sp)

def poplar(x, base, h, w):
    """The tall, narrow cottonwoods on the shore of Bald Eagle Pond, gone gold."""
    y0, y1 = base - h * 0.17, base - h
    d, sd = [], []
    for k in range(11):
        t = (k + 0.5) / 11
        cy = y0 + (y1 - y0) * t; rw = w * max(0.3, math.sin(math.pi * t ** 0.8)) * random.uniform(0.85, 1.05)
        ry = (y0 - y1) / 11 * 1.25; cx = x + jit(rw * 0.2)
        d.append(f"M{cx - rw:.1f},{cy:.1f} a{rw:.1f},{ry:.1f} 0 1,0 {2 * rw:.1f},0 a{rw:.1f},{ry:.1f} 0 1,0 {-2 * rw:.1f},0 Z")
        sd.append(f"M{cx + rw * 0.05:.1f},{cy:.1f} a{rw * 0.5:.1f},{ry * 0.9:.1f} 0 1,0 {rw * 0.95:.1f},0 a{rw * 0.5:.1f},{ry * 0.9:.1f} 0 1,0 {-rw * 0.95:.1f},0 Z")
        if random.random() < 0.6:   # the lumps along the edge
            sx = cx + random.choice([-1, 1]) * rw * 0.85; sr = rw * random.uniform(0.3, 0.45)
            d.append(f"M{sx - sr:.1f},{cy + jit(6):.1f} a{sr:.1f},{sr * 0.9:.1f} 0 1,0 {2 * sr:.1f},0 a{sr:.1f},{sr * 0.9:.1f} 0 1,0 {-2 * sr:.1f},0 Z")
    wash(f"M{x - w * 0.9:.0f},{base + 4:.0f} a{w * 1.4:.0f},{w * 0.2:.0f} 0 1,0 {w * 2.8:.0f},0 a{w * 1.4:.0f},{w * 0.2:.0f} 0 1,0 {-w * 2.8:.0f},0 Z", "#5E6E78", 0.35, "wcs", g=True)
    ink(line([(x - 3, base + 2), (x - 5, y0 + 10)]), 2.8, 0.8)
    ink(line([(x + 4, base + 2), (x + 6, y0 - 20)]), 2.5, 0.75)
    wash(" ".join(d), "#EDB437", 0.92, "wc2")
    wash(" ".join(sd), "#C9691F", 0.42, "wcs", g=True)
    for k in range(5):
        cy = y0 + (y1 - y0) * random.uniform(0.15, 0.8); cx = x - w * random.uniform(0.1, 0.5)
        wash(f"M{cx - 9:.0f},{cy:.0f} a9,12 0 1,0 18,0 a9,12 0 1,0 -18,0 Z", "#A4A24A", 0.35, "wcs", g=True)
    for k in range(6):   # branches showing through
        by = y0 + (y1 - y0) * random.uniform(0.05, 0.6); s = random.choice([-1, 1])
        ink(line([(x + jit(2), by + 18), (x + s * w * 0.4, by)]), 1.0, 0.5)
for x, base, h, w in [(990, 960, 300, 38), (1080, 950, 450, 50)]:
    poplar(x, base, h, w)

def park_sign(x0, x1, top, bot, ground):
    """The St. Vrain State Park sign on its two log posts."""
    for px in (x0 - 8, x1 - 10):
        post = poly([(px, ground), (px + 1, top - 14), (px + 18, top - 16), (px + 18, ground)])
        wash(post, "#BD9E77", 0.95, "wcs")
        wash(rect(px + 11, top - 16, px + 18, ground), "#7A5E46", 0.35, "wcs", g=True)
        ink(post, 1.4, 0.8)
        for k in range(3):
            ky = random.uniform(top, ground - 20)
            ink(f"M{px + 5},{ky:.0f} q4,-3 7,1", 0.8, 0.5)
    board = rect(x0, top, x1, bot)
    wash(board, "#7B3527", 0.95, "wcs")
    wash(rect(x0, top, x1, top + 15), "#2B2726", 0.95, "wcs")
    ink(board, 1.6, 0.85)
    sans = 'font-family="Liberation Sans, DejaVu Sans, Arial, sans-serif"'
    add(f'<text x="{(x0 + x1) / 2:.0f}" y="{top + 11}" text-anchor="middle" {sans} font-size="8.5" letter-spacing="1.6" fill="#F4EFE6" opacity="0.9">COLORADO PARKS &amp; WILDLIFE</text>')
    add(f'<text x="{x0 + 12}" y="{top + 31}" {sans} font-size="11" font-style="italic" fill="#EFE6DA" opacity="0.9">Welcome to your</text>')
    add(f'<text x="{x0 + 11}" y="{top + 56}" {sans} font-size="23" font-weight="bold" fill="#EFE6DA" opacity="0.92" filter="url(#wcs)">St. Vrain</text>')
    add(f'<text x="{x0 + 11}" y="{top + 81}" {sans} font-size="23" font-weight="bold" fill="#EFE6DA" opacity="0.92" filter="url(#wcs)">State Park</text>')
    lettering(x0 + 12, x0 + 120, top + 96, "#EFE6DA", 0.55)
    rcx, rcy = x1 - 38, top + 50
    add(f'<circle cx="{rcx}" cy="{rcy}" r="22" fill="#E9E2CF" stroke="#2F5C8A" stroke-width="6" opacity="0.95"/>')
    wash(f"M{rcx - 12},{rcy + 10} L{rcx - 4},{rcy - 4} L{rcx + 2},{rcy + 4} L{rcx + 8},{rcy - 2} L{rcx + 13},{rcy + 10} Z", "#6E8F5A", 0.9, "wcs", g=True)
    add(f'<circle cx="{rcx}" cy="{rcy}" r="22" fill="none" stroke="#E2C24A" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.9"/>')
park_sign(1690, 1890, 818, 924, 992)

def willow(x, base, w, h):
    """The willows at the east end of the pond, going yellow."""
    lobes, low = [], []
    for k in range(9):
        f = k / 8 - 0.5
        cx = x + f * w * 0.85 + jit(6); cy = base - h * 0.55 - (1 - abs(f) * 2) * h * 0.25 + jit(4)
        rx, ry = w * 0.15, h * 0.27
        lobes.append(f"M{cx - rx:.0f},{cy:.0f} a{rx:.0f},{ry:.0f} 0 1,0 {2 * rx:.0f},0 a{rx:.0f},{ry:.0f} 0 1,0 {-2 * rx:.0f},0 Z")
        if f > -0.15:   # shade on the side away from the sun and underneath
            low.append(f"M{cx - rx * 0.4:.0f},{cy + ry * 0.35:.0f} a{rx * 0.7:.0f},{ry * 0.55:.0f} 0 1,0 {rx * 1.4:.0f},0 a{rx * 0.7:.0f},{ry * 0.55:.0f} 0 1,0 {-rx * 1.4:.0f},0 Z")
    ink(line([(x - 2, base), (x - 10, base - h * 0.5)]), 2.4, 0.75); ink(line([(x + 4, base), (x + 14, base - h * 0.45)]), 2.0, 0.7)
    wash(" ".join(lobes), "#CDB84A", 0.9, "wc2")
    wash(" ".join(low), "#7E7A34", 0.38, "wcs", g=True)
    for i in range(int(w * 0.55)):   # the hanging wands
        sx = x + random.uniform(-0.46, 0.46) * w; top = base - h * (0.62 + 0.28 * (1 - abs(sx - x) / (w * 0.5))) + random.uniform(0, h * 0.25)
        L = random.uniform(18, 52)
        ink(f"M{sx:.0f},{top:.0f} q{jit(3):.0f},{L * 0.5:.0f} {jit(5):.0f},{L:.0f}", 1.0, 0.55, color=random.choice(["#5E6A2C", "#5E6A2C", "#9A8A2A"]))
for x, base, w, h in [(2120, 958, 250, 168), (2330, 948, 210, 150), (1990, 930, 120, 90)]:
    willow(x, base, w, h)

# The barbed-wire fence along the near edge, and its red post.
for px, col in [(1588, "#A8432E"), (2196, "#8C7A64")]:
    post = poly([(px, 1004), (px, 924), (px + 20, 922), (px + 20, 1004)])
    wash(post, col, 0.95, "wcs"); wash(rect(px + 12, 922, px + 20, 1004), "#5E2A1E", 0.35, "wcs", g=True); ink(post, 1.5, 0.85)
for y0, sag in [(944, 10), (968, 9), (992, 8)]:
    ink(f"M1560,{y0 - 4} Q1890,{y0 + sag} 2196,{y0} Q2320,{y0 + sag * 0.5} 2420,{y0 - 2}", 1.1, 0.75, color="#4E4946")
    for bx in range(1580, 2420, 46):
        by = y0 + 3 + (sag * 0.6 if bx < 2196 else sag * 0.3)
        ink(f"M{bx - 3},{by - 3:.0f} l6,6 M{bx + 3},{by - 3:.0f} l-6,6", 0.8, 0.6, color="#4E4946")

# Dry grass and rabbitbrush on the near bank.
for i in range(240):
    x = random.uniform(0, 2400); y = random.uniform(750, 998)
    if y < 800 and x < 1160: continue
    if 0 < x < 2000 and interp(shore, x) - 6 < y < interp(near[::-1], x) + 4: continue
    ink(line([(x, y + 14), (x + jit(5), y)]), 1.0, 0.4)
for i in range(22):   # rabbitbrush
    x = random.uniform(1150, 2400); y = random.uniform(760, 990)
    if x < 2010 and interp(shore, x) - 12 < y < interp(near[::-1], x) + 8: continue
    wash(f"M{x - 8:.0f},{y:.0f} a8,5 0 1,0 16,0 a8,5 0 1,0 -16,0 Z", "#E2B92E", 0.7, "wcs", g=True)
    for k in range(4): ink(line([(x - 5 + k * 3.5, y + 8), (x - 6 + k * 4, y - 2)]), 0.8, 0.45)

finish(sys.argv[1])
