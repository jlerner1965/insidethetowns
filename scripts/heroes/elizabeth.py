"""Elizabeth hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Main Street on the Palmer Divide on an autumn morning, a composition from
the guide's own photographs. Left to right along the street: the white
two-storey block with its crenellated parapet, the blue-roofed shop and the
white false-front store, then the buff-brick 1907 First National Bank with
its three arches and corner arch, BANK and A-1907-D on the parapet, its
flag and the black Main Street lamp post (hero.jpg, first-national-bank.jpg);
the white Italianate Huber-Carlson Building with its sage trim, red doors
and porch rail (huber-carlson.jpg); and Town Hall's brown stucco, gables,
green trim, porch and red-brown railings, with its flag (town-hall.jpg).
Gold cottonwoods and dark evergreens stand behind the street, as in those
photographs. In front is the Elizabeth Stampede's arena at Casey Jones
Park: the white announcer's booth with its red-framed windows, the steel
chutes hung with banners, the grandstand and a rider (stampede-arena.jpg,
casey-jones-park.jpg). Ponderosa groves on the rolling prairie stand for
the Palmer Divide, as the Casey Jones photographs show the pines; the far
hills are generic, since no reference photograph shows the horizon.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(31)

# --- Sky and clouds, as on the other three.
sky()
for cx, cy, s in [(300, 130, 58), (1010, 100, 44), (1690, 140, 66), (2230, 110, 48)]:
    cloud(cx, cy, s)
for cx, cy, s in [(560, 300, 30), (1420, 300, 34)]:
    cloud(cx, cy, s)

def far_pine(x, base, h, col="#56695E", op=0.8):
    """A ponderosa seen far off: a ragged dark spire, no ink."""
    d = (f"M{x - h * 0.22:.1f},{base:.1f} C{x - h * 0.26:.1f},{base - h * 0.5:.1f} {x - h * 0.1:.1f},{base - h * 0.8:.1f} {x:.1f},{base - h:.1f} "
         f"C{x + h * 0.1:.1f},{base - h * 0.8:.1f} {x + h * 0.26:.1f},{base - h * 0.5:.1f} {x + h * 0.22:.1f},{base:.1f} Z")
    wash(d, col, op, "wcs", g=True)

def tall_pine(x, base, h, lean=0):
    """A ponderosa near to: a long straight trunk and a clumped, round-topped crown on its upper half,
    light from the left."""
    ink(line([(x, base), (x + lean * 0.5, base - h * 0.5), (x + lean, base - h * 0.94)]), max(2.0, h / 70), 0.85, color="#5A3A28")
    blobs, lit = [], []
    for t in (0.48, 0.56, 0.64, 0.72, 0.8, 0.88):
        wmax = h * 0.15 * math.sin(math.pi * min(1, (t - 0.36) / 0.66)) ** 0.5
        sides = random.sample([-1, 1], 2) if random.random() < 0.7 else [random.choice([-1, 1])]
        for side in sides:
            tx = x + lean * t + side * wmax * random.uniform(0.35, 0.7); ty = base - h * t + jit(h * 0.02)
            for _ in range(4):
                cx, cy = tx + jit(h * 0.05), ty + jit(h * 0.022); r = h * random.uniform(0.045, 0.07)
                blobs.append(f"M{cx - r * 1.2:.1f},{cy:.1f} a{r * 1.2:.1f},{r * 0.55:.1f} 0 1,0 {2.4 * r:.1f},0 a{r * 1.2:.1f},{r * 0.55:.1f} 0 1,0 {-2.4 * r:.1f},0 Z")
                if cx < x + lean * t + r * 0.5:
                    lit.append(f"M{cx - r * 0.9:.1f},{cy - r * 0.25:.1f} a{r * 0.5:.1f},{r * 0.4:.1f} 0 1,0 {r:.1f},0 a{r * 0.5:.1f},{r * 0.4:.1f} 0 1,0 {-r:.1f},0 Z")
            if t < 0.88:
                ink(line([(x + lean * t, ty + h * 0.03), (tx, ty)]), max(1.0, h / 140), 0.65, color="#5A3A28")
    top = base - h * 0.97
    r = h * 0.07
    blobs.append(f"M{x + lean - r:.1f},{top + r * 0.6:.1f} a{r:.1f},{r * 0.8:.1f} 0 1,0 {2 * r:.1f},0 a{r:.1f},{r * 0.8:.1f} 0 1,0 {-2 * r:.1f},0 Z")
    wash(" ".join(blobs), "#2F4D3A", 0.94, "wcs")
    if lit: wash(" ".join(lit), "#7A9A62", 0.55, "wcs", g=True)

def spruce(x, base, h):
    """A tall dark evergreen, pointed and tiered, as behind the bank in hero.jpg."""
    pts = [(x, base - h)]
    n = 9
    for i in range(1, n + 1):
        t = i / n; w = h * 0.27 * t + 4
        pts += [(x + w * 0.55, base - h + h * (t - 0.05)), (x + w, base - h + h * t)]
    right = pts[:]
    left = [(2 * x - px, py) for px, py in reversed(pts[1:])]
    d = poly(right + [(x, base - h * 0.02)] + left)
    wash(d, "#2E4A40", 0.93, "wcs")
    wash(poly([(x, base - h)] + [(x - (px - x), py) for px, py in pts[1:]] + [(x, base)]), "#5E7A66", 0.4, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.15)]), 1.8, 0.7)

# --- The far horizon: low rolling hills, generic (no photograph shows it).
INKSCALE = 0.55
far = [(0, 468), (220, 460), (460, 470), (700, 456), (940, 466), (1180, 452), (1420, 464), (1660, 450), (1900, 462), (2150, 452), (2400, 462)]
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
ink(open_path(far), 1.3, 0.5)
# The timbered ridges of the Palmer Divide, dark with ponderosa.
mid = [(0, 500), (160, 486), (380, 494), (600, 478), (820, 490), (1040, 474), (1300, 486), (1560, 468), (1800, 480), (2050, 466), (2250, 476), (2400, 470)]
wash(ridge_d(mid), "#76877C", 0.82, "wc3")
for x in range(-10, 2420, 9):
    if random.random() < 0.25: continue
    far_pine(x + jit(4), interp(mid, x) + 8 + random.uniform(0, 14), random.uniform(14, 28), "#4E6358", 0.75)
ink(open_path(mid), 1.2, 0.45)

# --- Rolling prairie, gold going tawny, with ponderosa groves.
INKSCALE = 0.85
plains = [(0, 532), (300, 522), (620, 536), (940, 524), (1260, 534), (1600, 520), (2000, 530), (2400, 522)]
wash(ridge_d(plains), "#CDB46A", 0.88, "wc3")
for y0, col in [(560, "#A7A05A"), (640, "#C4A85E")]:
    wash(f"M0,{y0} C600,{y0 - 10} 1300,{y0 + 8} 2400,{y0 - 6} L2400,{y0 + 54} C1300,{y0 + 64} 600,{y0 + 48} 0,{y0 + 60} Z", col, 0.36, "wc3", g=True)
# A swell of land on the left, its far side in shade.
swell = [(0, 600), (180, 566), (420, 548), (640, 556), (860, 580), (1100, 612), (1240, 640)]
wash(ridge_d(swell), "#B0934E", 0.9, "wc1")
wash("M0,640 C300,610 700,630 1240,660 L1240,1000 L0,1000 Z", "#8A7A48", 0.3, "wc3", g=True)
wash(f"M640,556 C760,566 860,580 1100,612 L1240,640 L1240,{H} L700,{H} Z", "#7F7699", 0.18, "wc3", g=True)
ink(open_path(swell), 1.6, 0.55)
for i in range(40):   # dry grass strokes
    x = random.uniform(0, 2400); y = random.uniform(540, 700)
    ink(line([(x, y), (x + random.uniform(50, 140), y + jit(2))]), 0.8, 0.2)
# Ponderosa groves, the Palmer Divide's pines.
for gx, gy, n, spread in [(140, 600, 9, 110), (470, 566, 12, 140), (860, 590, 8, 90), (1110, 560, 7, 80)]:
    pts = sorted((gx + random.uniform(-spread, spread), gy + random.uniform(-6, 26)) for _ in range(n))
    for x, y in sorted(pts, key=lambda p: p[1]):
        ponderosa(x, y, random.uniform(40, 70))
# A ranch fence down the swell.
fence = [(0, 706), (320, 694), (660, 704), (980, 690), (1180, 698)]
ink(open_path(fence), 1.2, 0.5); ink(open_path([(x, y + 12) for x, y in fence]), 1.0, 0.4)
for x in range(16, 1180, 46):
    y = interp(fence, x); ink(line([(x, y - 8), (x + 1, y + 22)]), 1.5, 0.6)

# --- Behind Main Street: the evergreens and gold cottonwoods of the photographs.
for x, h in [(1664, 250), (1712, 226), (1560, 190), (2256, 200)]:
    spruce(x, 672, h)
for x in range(1170, 2400, 125):
    cottonwood(x + jit(30), 650 + jit(8), random.uniform(56, 72), back=True, shadow=False)

# --- Main Street, base at y 712, from x 1190: right of the type on a desktop.
B = 712
BUFF, BUFF_D, CREAM, WHITE_W, SHADE = "#CFA978", "#8C6A48", "#F3EAD4", "#ECE7DF", "#7E7398"
wash(poly([(1160, B - 4), (2400, B - 4), (2400, B + 30), (1140, B + 30)]), "#CBBFAA", 0.82, "wcs")   # sidewalk and street
ink(line([(1140, B + 30), (2400, B + 30)]), 1.4, 0.55)

def clapboard(x0, x1, y0, y1, step=7, op=0.26):
    for y in range(int(y0) + step, int(y1), step):
        ink(line([(x0 + 3, y), (x1 - 3, y)]), 0.6, op)

def white_wall(pts, x0, x1, y0, y1, step=7):
    d = poly(pts)
    add(f'<path d="{d}" fill="{PAPER}"/>')
    wash(d, WHITE_W, 0.85, "wcs", g=True)
    clapboard(x0, x1, y0, y1, step)
    return d

def arched_window(wx, wy, ww, wh, frame=PAPER, glass=WIN):
    r = ww / 2
    add(f'<path d="M{wx - 3},{wy + wh + 3} L{wx - 3},{wy + r} a{r + 3},{r + 3} 0 0,1 {ww + 6},0 L{wx + ww + 3},{wy + wh + 3} Z" fill="{frame}"/>')
    wash(f"M{wx},{wy + wh} L{wx},{wy + r} a{r},{r} 0 0,1 {ww},0 L{wx + ww},{wy + wh} Z", glass, 0.85, "wcs", g=True)
    ink(f"M{wx - 3},{wy + wh + 3} L{wx - 3},{wy + r} a{r + 3},{r + 3} 0 0,1 {ww + 6},0 L{wx + ww + 3},{wy + wh + 3} Z", 1.1, 0.7)

def crenellated_block(x, w=270, h=132):
    """The white two-storey block: a raised, stepped end, square merlons along the parapet, arched upper windows."""
    eh = h + 22   # the raised end
    prof = [(x, B), (x, B - eh + 6), (x + 6, B - eh + 6), (x + 6, B - eh - 2), (x + 14, B - eh - 2), (x + 14, B - eh + 6),
            (x + 20, B - eh + 6), (x + 20, B - eh - 10), (x + 34, B - eh - 10), (x + 34, B - eh + 6), (x + 40, B - eh + 6),
            (x + 40, B - eh - 2), (x + 48, B - eh - 2), (x + 48, B - eh + 6), (x + 54, B - eh + 6), (x + 54, B - h)]
    for mx in (x + 100, x + 175, x + w - 22):   # merlons
        prof += [(mx, B - h), (mx, B - h - 10), (mx + 14, B - h - 10), (mx + 14, B - h)]
    prof += [(x + w, B - h), (x + w, B)]
    white_wall(prof, x, x + w, B - eh, B)
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), SHADE, 0.16, "wcs", g=True)
    wash(poly([(x, B - eh + 6), (x + 54, B - eh + 6), (x + 54, B), (x, B)]), "#B9B0C4", 0.18, "wcs", g=True)   # the end, a little forward
    ink(poly(prof), 2.0)
    ink(line([(x + 54, B - eh + 6), (x + 54, B - 40)]), 1.0, 0.5)
    for i, wx in enumerate((x + 8, x + 22, x + 36)):   # three narrow arched windows in the end
        arched_window(wx, B - eh + 34, 10, 30)
    wash(poly([(x + 18, B - 78), (x + 38, B - 78), (x + 38, B - 62), (x + 18, B - 62)]), "#8C6A48", 0.7, "wcs", g=True)   # its sign board
    ink(poly([(x + 18, B - 78), (x + 38, B - 78), (x + 38, B - 62), (x + 18, B - 62)]), 1.0, 0.6)
    for wx in (x + 112, x + 196):
        arched_window(wx, B - h + 32, 14, 28)
    for rx in (x + 84, x + 150, x + 226):   # the little rosettes in the frieze
        add(f'<circle cx="{rx}" cy="{B - h + 16}" r="3.5" fill="none" stroke="{INK}" stroke-width="0.9" opacity="0.55"/>')
    # The wooden porch roof at its foot, left.
    wash(poly([(x - 30, B - 46), (x + 62, B - 54), (x + 66, B - 44), (x - 30, B - 38)]), "#8A5A3A", 0.92, "wcs")
    ink(poly([(x - 30, B - 46), (x + 62, B - 54), (x + 66, B - 44), (x - 30, B - 38)]), 1.3, 0.75)
    wash(poly([(x - 26, B - 38), (x + 62, B - 44), (x + 62, B), (x - 26, B)]), "#5C5560", 0.45, "wcs", g=True)
    for px in (x - 24, x + 18, x + 58):
        ink(line([(px, B), (px, B - 42)]), 1.6, 0.8, color="#5A3A28")
    return x + w

def blue_shop(x, w=112):
    """The little shop with the blue metal roof, a white sign tower at its left with a round orange sign."""
    wall = white_wall([(x, B), (x, B - 34), (x + w, B - 34), (x + w, B)], x, x + w, B - 34, B, 6)
    roof = poly([(x + 14, B - 34), (x + 30, B - 66), (x + w - 12, B - 66), (x + w + 6, B - 34)])
    wash(roof, "#5E86B8", 0.92, "wcs")
    wash(poly([(x + w * 0.62, B - 66), (x + w - 12, B - 66), (x + w + 6, B - 34), (x + w * 0.66, B - 34)]), "#3E5E8E", 0.3, "wcs", g=True)
    for k in range(1, int((w - 14) / 7)):   # standing seams
        sx = x + 20 + k * 7
        ink(line([(sx + 8, B - 64), (sx, B - 36)]), 0.6, 0.35)
    ink(roof, 1.5, 0.8)
    tower = [(x, B), (x, B - 70), (x + 26, B - 70), (x + 26, B)]
    white_wall(tower, x, x + 26, B - 70, B, 6)
    ink(poly(tower), 1.6)
    add(f'<circle cx="{x + 13}" cy="{B - 52}" r="6" fill="#D9672E" opacity="0.92" filter="url(#wcs)"/>')
    ink(f"M{x + 7},{B - 52} a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0", 1.0, 0.7)
    trimmed(x + 44, B - 28, 16, 18, WIN); trimmed(x + 80, B - 28, 16, 18, WIN)
    ink(wall, 1.6)
    for px in range(int(x + 30), int(x + w + 4), 6):   # the white picket fence in front
        ink(line([(px, B + 2), (px, B - 12)]), 1.0, 0.6, color="#F7F3EA")
    ink(line([(x + 28, B - 8), (x + w + 4, B - 8)]), 0.8, 0.5)
    return x + w

def false_front(x, w=166):
    """The white false-front store: a stepped parapet, purple-framed windows, the maroon sign."""
    hl, hc, hp, hr = 84, 100, 110, 92
    prof = [(x, B), (x, B - hl), (x + 22, B - hl), (x + 22, B - hc), (x + 80, B - hc), (x + 80, B - hp), (x + 88, B - hp), (x + 88, B - hc),
            (x + 112, B - hc), (x + 112, B - hr - 4), (x + 120, B - hr - 4), (x + 120, B - hr), (x + w, B - hr), (x + w, B)]
    white_wall(prof, x, x + w, B - hp, B)
    wash(poly([(x + 120, B - hr), (x + w, B - hr), (x + w, B), (x + 120, B)]), SHADE, 0.14, "wcs", g=True)
    for cx in (x + 22, x + 112):   # corner boards and pilasters
        ink(line([(cx, B - hc + 4), (cx, B)]), 1.0, 0.5)
    ink(poly(prof), 2.0)
    purple = "#6F5E9E"
    for wx, ww in [(x + 6, 26), (x + 72, 34)]:
        add(f'<rect x="{wx - 3}" y="{B - 48}" width="{ww + 6}" height="{46}" fill="{PAPER}"/>')
        wash(poly([(wx, B - 4), (wx, B - 45), (wx + ww, B - 45), (wx + ww, B - 4)]), "#C9D2DA", 0.7, "wcs", g=True)
        wash(poly([(wx, B - 4), (wx, B - 45), (wx + ww, B - 45), (wx + ww, B - 4)]), WIN, 0.35, "wcs", g=True)
        ink(poly([(wx - 3, B - 1), (wx - 3, B - 48), (wx + ww + 3, B - 48), (wx + ww + 3, B - 1)]), 2.4, 0.85, color=purple)
    wash(poly([(x + 44, B), (x + 44, B - 46), (x + 60, B - 46), (x + 60, B)]), "#3E3B46", 0.85, "wcs", g=True)
    ink(poly([(x + 44, B), (x + 44, B - 46), (x + 60, B - 46), (x + 60, B)]), 1.2, 0.7)
    sign = poly([(x + 70, B - 80), (x + 102, B - 80), (x + 102, B - 56), (x + 70, B - 56)])
    wash(sign, "#8C2F35", 0.92, "wcs"); ink(sign, 1.1, 0.7)
    ink(line([(x + 76, B - 70), (x + 96, B - 70)]), 0.9, 0.7, color="#F3EAD4"); ink(line([(x + 78, B - 64), (x + 94, B - 64)]), 0.9, 0.6, color="#F3EAD4")
    return x + w

def bank(x, w=150):
    """The 1907 First National Bank: buff brick, three arches in front and one at the corner, cream frieze band
    and cornice, BANK in the frieze, A-1907-D on the raised parapet between two ball finials."""
    sw, side = 50, 44   # the corner portico's side face, then the plain brick wall behind
    # The plain side wall, back and in shade, with its stepped parapet.
    xs = x + w + sw
    sp = [(xs, B), (xs, B - 124), (xs + 20, B - 124), (xs + 20, B - 116), (xs + side, B - 116), (xs + side, B)]
    wash(poly(sp), BUFF, 0.92, "wcs"); wash(poly(sp), SHADE, 0.35, "wcs", g=True)
    coursing(xs, B - 116, xs + side, B, step=8)
    trimmed(xs + 14, B - 74, 14, 34, "#4A4752")
    ink(poly(sp), 1.6, 0.8)
    # Front and corner face.
    body = poly([(x, B), (x, B - 152), (x + w + sw, B - 152), (x + w + sw, B)])
    wash(body, BUFF, 0.94, "wcs")
    wash(poly([(x + w, B - 152), (x + w + sw, B - 152), (x + w + sw, B), (x + w, B)]), SHADE, 0.32, "wcs", g=True)
    for i in range(46):   # the mottle of the brick
        bx = random.uniform(x + 2, x + w + sw - 14); by = random.uniform(B - 150, B - 10)
        wash(poly([(bx, by), (bx + random.uniform(8, 16), by), (bx + random.uniform(8, 16), by + 6), (bx, by + 6)]), random.choice(["#B98E5C", "#D9BC8C", "#A98458"]), 0.4, "wcs", g=True)
    coursing(x, B - 110, x + w + sw, B, step=7)
    coursing(x, B - 150, x + w + sw, B - 112, step=7)
    # The arcade: four piers and three arches in front, one arch on the corner face.
    aw, r = 28, 14
    pw = (w - 3 * aw) / 4
    openings = [x + pw + k * (aw + pw) for k in range(3)] + [x + w + (sw - 24) / 2]
    for k, ox in enumerate(openings):
        a = aw if k < 3 else 24; rr = a / 2
        ring = f"M{ox - 5},{B} L{ox - 5},{B - 80} a{rr + 5},{rr + 5} 0 0,1 {a + 10},0 L{ox + a + 5},{B} Z"
        wash(ring, "#B5875A", 0.7, "wcs", g=True)
        hole = f"M{ox},{B - 4} L{ox},{B - 80} a{rr},{rr} 0 0,1 {a},0 L{ox + a},{B - 4} Z"
        add(f'<path d="{hole}" fill="{PAPER}"/>')
        wash(hole, "#4A3E3A", 0.9, "wcs", g=True)
        wash(f"M{ox},{B - 44} L{ox + a},{B - 44} L{ox + a},{B - 4} L{ox},{B - 4} Z", "#6B4A36", 0.5, "wcs", g=True)   # the wooden doors and panels within
        ink(hole, 1.3, 0.8)
        ink(f"M{ox - 5},{B - 80} a{rr + 5},{rr + 5} 0 0,1 {a + 10},0", 1.0, 0.6)
        for j in range(7):   # voussoirs
            t = math.pi * (j + 0.5) / 7
            ink(line([(ox + rr - math.cos(t) * rr, B - 80 - math.sin(t) * rr), (ox + rr - math.cos(t) * (rr + 5), B - 80 - math.sin(t) * (rr + 5))]), 0.7, 0.5)
    ink(line([(x + w, B - 104), (x + w, B)]), 1.2, 0.6)   # the corner
    # Steps along the front.
    wash(poly([(x - 4, B), (x + w + sw + 4, B), (x + w + sw + 4, B + 6), (x - 4, B + 6)]), "#B9B2A6", 0.9, "wcs")
    # Cream band over the arches, the frieze, then the cornice.
    band = poly([(x - 2, B - 110), (x + w + sw + 2, B - 110), (x + w + sw + 2, B - 104), (x - 2, B - 104)])
    add(f'<path d="{band}" fill="{PAPER}"/>'); wash(band, CREAM, 0.9, "wcs", g=True); ink(band, 1.1, 0.7)
    panel = poly([(x + w / 2 - 22, B - 134), (x + w / 2 + 22, B - 134), (x + w / 2 + 22, B - 118), (x + w / 2 - 22, B - 118)])
    ink(panel, 1.0, 0.6)
    add(f'<text x="{x + w / 2:.1f}" y="{B - 121.5:.1f}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="13" font-weight="bold" fill="#2E2522" opacity="0.9">BANK</text>')
    for gx in (x + 16, x + w - 34):   # recessed panels with their little grilles
        ink(poly([(gx - 4, B - 134), (gx + 22, B - 134), (gx + 22, B - 118), (gx - 4, B - 118)]), 0.9, 0.5)
        add(f'<rect x="{gx + 3}" y="{B - 129}" width="12" height="6" fill="{CREAM}"/>')
        ink(line([(gx + 5, B - 128), (gx + 13, B - 124)]), 0.6, 0.6); ink(line([(gx + 5, B - 124), (gx + 13, B - 128)]), 0.6, 0.6)
    corn = poly([(x - 12, B - 152), (x + w + sw + 12, B - 152), (x + w + sw + 8, B - 140), (x - 8, B - 140)])
    add(f'<path d="{corn}" fill="{PAPER}"/>'); wash(corn, CREAM, 0.9, "wcs", g=True)
    wash(poly([(x - 8, B - 144), (x + w + sw + 8, B - 144), (x + w + sw + 8, B - 140), (x - 8, B - 140)]), "#B8A88A", 0.5, "wcs", g=True)
    ink(corn, 1.4, 0.8)
    for dx in range(int(x - 4), int(x + w + sw + 6), 5):   # dentils
        ink(line([(dx, B - 140), (dx, B - 136)]), 0.8, 0.55)
    for dx in range(int(x + 2), int(x + w + sw), 22):   # brackets
        ink(poly([(dx, B - 140), (dx + 5, B - 140), (dx + 5, B - 133), (dx, B - 136)]), 0.8, 0.55)
    # The parapet: a low brick band, raised in the middle for the date, with ball finials.
    par = poly([(x - 2, B - 152), (x - 2, B - 162), (x + w + sw + 2, B - 162), (x + w + sw + 2, B - 152)])
    wash(par, BUFF, 0.94, "wcs"); coursing(x, B - 162, x + w + sw, B - 152, step=5); ink(par, 1.2, 0.75)
    cx0, cx1 = x + w * 0.3, x + w * 0.7
    mid = poly([(cx0, B - 162), (cx0, B - 172), (cx1, B - 172), (cx1, B - 162)])
    wash(mid, BUFF, 0.94, "wcs"); ink(mid, 1.2, 0.75)
    cap = poly([(cx0 - 6, B - 172), (cx0 - 6, B - 177), (cx1 + 6, B - 177), (cx1 + 6, B - 172)])
    add(f'<path d="{cap}" fill="{PAPER}"/>'); wash(cap, CREAM, 0.9, "wcs", g=True); ink(cap, 1.0, 0.7)
    add(f'<text x="{x + w / 2:.1f}" y="{B - 163.5:.1f}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="9" font-weight="bold" fill="#2E2522" opacity="0.9">A·1907·D</text>')
    for fx in (cx0, cx1):
        add(f'<rect x="{fx - 4}" y="{B - 182}" width="8" height="6" fill="{CREAM}"/>')
        add(f'<circle cx="{fx}" cy="{B - 187}" r="5.5" fill="#FBF6EA"/>')
        wash(f"M{fx},{B - 192.5} a5.5,5.5 0 0,1 0,11 Z", "#B8A88A", 0.45, "wcs", g=True)
        ink(f"M{fx - 5.5},{B - 187} a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0", 1.0, 0.7)
    ink(body, 2.0)
    # The flag hung from the first pier.
    fx, fy = x + pw + 2, B - 92
    ink(line([(fx, fy), (fx + 12, fy - 2)]), 1.2, 0.8)
    flag = poly([(fx + 10, fy - 2), (fx + 2, fy + 38), (fx + 16, fy + 44), (fx + 24, fy + 2)])
    add(f'<path d="{flag}" fill="{PAPER}"/>')
    for k in range(4):
        wash(poly([(fx + 9 - k * 2, fy + 4 + k * 10), (fx + 23 - k * 2, fy + 8 + k * 10), (fx + 22 - k * 2, fy + 12 + k * 10), (fx + 8 - k * 2, fy + 8 + k * 10)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx + 10, fy - 2), (fx + 6, fy + 16), (fx + 14, fy + 19), (fx + 17, fy)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(flag, 1.0, 0.7)
    return x + w + sw + side

def lamp_post(lx):
    """The black Main Street lamp post: two lanterns, a hanging basket and the teal Historic Main Street banner."""
    blk = "#26262B"
    ink(line([(lx, B + 22), (lx, B - 138)]), 3.0, 0.95, color=blk)
    ink(line([(lx - 12, B - 138), (lx + 12, B - 138)]), 1.8, 0.95, color=blk)
    for sx in (lx - 12, lx + 12):
        ink(poly([(sx - 5, B - 140), (sx - 6, B - 154), (sx + 6, B - 154), (sx + 5, B - 140)]), 1.4, 0.95, color=blk)
        ink(f"M{sx - 7},{B - 154} l7,-6 l7,6", 1.4, 0.95, color=blk)
    wash(poly([(lx - 16, B - 120), (lx - 2, B - 120), (lx - 2, B - 82), (lx - 16, B - 82)]), "#2E7F94", 0.92, "wcs")
    ink(line([(lx - 14, B - 106), (lx - 4, B - 106)]), 0.9, 0.8, color="#F3EAD4"); ink(line([(lx - 13, B - 98), (lx - 5, B - 98)]), 0.9, 0.7, color="#F3EAD4")
    ink(poly([(lx - 16, B - 120), (lx - 2, B - 120), (lx - 2, B - 82), (lx - 16, B - 82)]), 1.0, 0.7)
    ink(f"M{lx},{B - 112} q16,-4 18,10", 1.2, 0.9, color=blk)
    ink(f"M{lx + 10},{B - 94} a8,8 0 0,0 16,0", 1.2, 0.9, color=blk)
    for c in ("#C8508E", "#B8372B", "#6F8F5A"):
        wash(f"M{lx + 9 + jit(2):.0f},{B - 96 + jit(2):.0f} a9,5 0 1,0 18,0 a9,5 0 1,0 -18,0 Z", c, 0.75, "wcs", g=True)

def huber_carlson(x, w=140, h=196):
    """The Huber-Carlson Building, 1890: white clapboard, Italianate cornice on brackets, sage trim,
    three tall windows upstairs, big gridded shop windows, red double doors and a white porch rail."""
    sage = "#6E8A6C"
    front = white_wall([(x, B), (x, B - h), (x + w, B - h), (x + w, B)], x, x + w, B - h + 30, B - 94, 6)
    wash(poly([(x + w * 0.74, B - h), (x + w, B - h), (x + w, B), (x + w * 0.74, B)]), SHADE, 0.14, "wcs", g=True)
    corn = poly([(x - 12, B - h - 12), (x + w + 12, B - h - 12), (x + w + 12, B - h - 2), (x - 12, B - h - 2)])
    add(f'<path d="{corn}" fill="{PAPER}"/>'); wash(corn, "#E8E4DA", 0.8, "wcs", g=True)
    wash(poly([(x - 12, B - h - 12), (x + w + 12, B - h - 12), (x + w + 12, B - h - 8), (x - 12, B - h - 8)]), sage, 0.8, "wcs", g=True)
    ink(corn, 1.4, 0.8)
    for k in range(5):   # brackets
        bx = x + 4 + k * (w - 12) / 4
        wash(poly([(bx, B - h - 2), (bx + 6, B - h - 2), (bx + 6, B - h + 10), (bx + 3, B - h + 6), (bx, B - h + 4)]), "#4F6A52", 0.9, "wcs", g=True)
    for k in range(4):   # frieze panels
        px = x + 8 + k * (w - 16) / 4
        wash(poly([(px + 2, B - h + 16), (px + (w - 16) / 4 - 2, B - h + 16), (px + (w - 16) / 4 - 2, B - h + 22), (px + 2, B - h + 22)]), sage, 0.85, "wcs", g=True)
    for cx in (x + 2, x + w - 2):   # sage corner boards
        ink(line([(cx, B - h), (cx, B)]), 3.0, 0.85, color=sage)
    for wx in (x + 24, x + 62, x + 100):   # upstairs windows
        add(f'<rect x="{wx - 4}" y="{B - h + 56}" width="24" height="46" fill="{PAPER}"/>')
        wash(poly([(wx, B - h + 98), (wx, B - h + 60), (wx + 16, B - h + 60), (wx + 16, B - h + 98)]), "#3E3B46", 0.85, "wcs", g=True)
        ink(poly([(wx - 4, B - h + 102), (wx - 4, B - h + 56), (wx + 20, B - h + 56), (wx + 20, B - h + 102)]), 2.2, 0.85, color=sage)
        ink(line([(wx, B - h + 79), (wx + 16, B - h + 79)]), 1.0, 0.7, color=sage)
    sign = poly([(x + 44, B - 92), (x + 96, B - 92), (x + 96, B - 80), (x + 44, B - 80)])
    wash(sign, "#7A3A28", 0.92, "wcs"); ink(sign, 1.0, 0.7)
    ink(line([(x + 50, B - 86), (x + 90, B - 86)]), 0.8, 0.6, color="#E8D9BE")
    # The storefront: a sage-trimmed frame, gridded windows either side of red double doors.
    ink(poly([(x + 6, B - 72), (x + w - 6, B - 72), (x + w - 6, B - 10), (x + 6, B - 10)]), 1.2, 0.7, color=sage)
    for wx, ww in [(x + 10, 40), (x + w - 50, 40)]:
        wash(poly([(wx, B - 14), (wx, B - 68), (wx + ww, B - 68), (wx + ww, B - 14)]), "#3E3B46", 0.8, "wcs", g=True)
        for k in range(1, 4):
            ink(line([(wx + k * ww / 4, B - 68), (wx + k * ww / 4, B - 14)]), 1.0, 0.85, color="#F1EEE6")
            ink(line([(wx, B - 68 + k * 13.5), (wx + ww, B - 68 + k * 13.5)]), 1.0, 0.85, color="#F1EEE6")
        ink(poly([(wx, B - 14), (wx, B - 68), (wx + ww, B - 68), (wx + ww, B - 14)]), 1.2, 0.7)
    wash(poly([(x + 54, B - 68), (x + 86, B - 68), (x + 86, B - 58), (x + 54, B - 58)]), "#3E3B46", 0.7, "wcs", g=True)   # transom
    door = poly([(x + 56, B - 6), (x + 56, B - 52), (x + 84, B - 52), (x + 84, B - 6)])
    wash(door, "#A3302A", 0.95, "wcs")
    ink(door, 1.2, 0.8); ink(line([(x + 70, B - 52), (x + 70, B - 6)]), 1.0, 0.7)
    for k in (0, 1):
        wash(poly([(x + 59 + k * 14, B - 46), (x + 67 + k * 14, B - 46), (x + 67 + k * 14, B - 30), (x + 59 + k * 14, B - 30)]), "#3E3B46", 0.6, "wcs", g=True)
    ink(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), 2.0)
    # The porch: a white rail and stairs on a stone foundation.
    wash(poly([(x - 4, B - 6), (x + w + 10, B - 6), (x + w + 10, B + 4), (x - 4, B + 4)]), "#8E7A68", 0.8, "wcs")
    ink(line([(x + 4, B - 24), (x + w + 6, B - 24)]), 1.8, 0.9, color="#F4F0E8")
    for rx in range(int(x + 8), int(x + w + 6), 6):
        if x + 52 < rx < x + 88: continue
        ink(line([(rx, B - 24), (rx, B - 6)]), 1.0, 0.8, color="#EDE8DE")
    ink(line([(x + 4, B - 24), (x + w + 6, B - 24)]), 0.8, 0.45)
    for k in range(3):   # stairs
        ink(line([(x + 50, B - 6 + k * 4), (x + 90, B - 6 + k * 4)]), 1.0, 0.55)
    return x + w

def town_hall(x, w=250):
    """Town Hall on Banner Street: brown stucco, a tall gabled wing, a big shingle roof with a dormer gable,
    green trim, the porch with TOWN HALL on its fascia, red-brown posts and wooden railings."""
    stucco, roofc, green, rail = "#A9754F", "#6E5A4C", "#2F5A4A", "#A5533A"
    # The big roof behind.
    roof = poly([(x + 60, B - 70), (x + 100, B - 138), (x + w - 30, B - 138), (x + w + 8, B - 70)])
    wash(roof, roofc, 0.92, "wcs")
    for y in range(int(B - 132), int(B - 72), 8):
        ink(line([(x + 100 - (B - 138 - y) * -0.55, y), (x + w - 30 + (y - B + 138) * 0.55, y)]), 0.6, 0.3)
    ink(roof, 1.4, 0.8)
    # The main wall.
    wall = poly([(x + 60, B), (x + 60, B - 72), (x + w, B - 72), (x + w, B)])
    wash(wall, stucco, 0.93, "wcs")
    wash(poly([(x + w * 0.75, B - 72), (x + w, B - 72), (x + w, B), (x + w * 0.75, B)]), "#6B3F2A", 0.25, "wcs", g=True)
    ink(wall, 1.8)
    # The dormer gable in the roof, with its white window.
    dg = poly([(x + 128, B - 72), (x + 128, B - 108), (x + 158, B - 142), (x + 188, B - 108), (x + 188, B - 72)])
    wash(dg, stucco, 0.93, "wcs")
    ink(line([(x + 120, B - 102), (x + 158, B - 146), (x + 196, B - 102)]), 3.0, 0.9, color=green)
    ink(dg, 1.4, 0.8)
    trimmed(x + 150, B - 120, 16, 20, "#3E3B46")
    # The tall wing on the left, its gable to the street.
    wg = poly([(x, B), (x, B - 104), (x + 40, B - 158), (x + 80, B - 104), (x + 80, B)])
    wash(wg, stucco, 0.93, "wcs")
    wash(poly([(x + 40, B - 158), (x + 80, B - 104), (x + 80, B), (x + 52, B)]), "#6B3F2A", 0.2, "wcs", g=True)
    ink(line([(x - 8, B - 96), (x + 40, B - 164), (x + 88, B - 96)]), 3.0, 0.9, color=green)
    wash(poly([(x - 8, B - 96), (x + 40, B - 164), (x + 88, B - 96), (x + 80, B - 96), (x + 40, B - 154), (x, B - 96)]), roofc, 0.9, "wcs")
    ink(wg, 1.8)
    for wx in (x + 20, x + 46):
        trimmed(wx, B - 132, 12, 22, "#3E3B46")
    trimmed(x + 14, B - 58, 14, 22, "#3E3B46")
    door = poly([(x + 50, B), (x + 50, B - 40), (x + 68, B - 40), (x + 68, B)])
    wash(door, green, 0.92, "wcs"); ink(door, 1.2, 0.8)
    # The porch across the main wall.
    pr = poly([(x + 76, B - 62), (x + w + 6, B - 62), (x + w + 14, B - 46), (x + 70, B - 46)])
    wash(pr, roofc, 0.92, "wcs"); ink(pr, 1.3, 0.8)
    fas = poly([(x + 70, B - 46), (x + w + 14, B - 46), (x + w + 14, B - 38), (x + 70, B - 38)])
    wash(fas, green, 0.95, "wcs"); ink(fas, 1.0, 0.7)
    add(f'<text x="{x + 112}" y="{B - 39.5}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="8" font-weight="bold" fill="#F4F0E8">TOWN HALL</text>')
    wash(poly([(x + 76, B - 38), (x + w + 6, B - 38), (x + w + 6, B), (x + 76, B)]), "#5C5560", 0.4, "wcs", g=True)
    for wx in (x + 150, x + 196):
        trimmed(wx, B - 32, 16, 20, "#3E3B46")
    door2 = poly([(x + 124, B), (x + 124, B - 32), (x + 138, B - 32), (x + 138, B)])
    wash(door2, green, 0.92, "wcs"); ink(door2, 1.1, 0.8)
    for px in (x + 84, x + 140, x + 184, x + w):
        wash(poly([(px, B), (px, B - 38), (px + 5, B - 38), (px + 5, B)]), rail, 0.95, "wcs")
        ink(f"M{px - 6},{B - 38} L{px + 2},{B - 30} L{px + 11},{B - 38}", 1.2, 0.85, color=rail)
    # The wooden railings and ramp along the front.
    for y in (B - 20, B - 8):
        ink(line([(x - 40, y), (x + w + 14, y)]), 1.8, 0.9, color=rail)
    for rx in range(int(x - 38), int(x + w + 14), 5):
        ink(line([(rx, B - 20), (rx, B)]), 0.9, 0.75, color=rail)
    for rx in range(int(x - 40), int(x + w + 16), 40):
        ink(line([(rx, B - 24), (rx, B + 2)]), 2.2, 0.9, color=rail)
    # The flagpole and flag.
    fx = x + 26
    ink(line([(fx, B + 16), (fx, B - 196)]), 1.8, 0.85, color="#D9D6CF")
    ink(line([(fx + 1.5, B + 16), (fx + 1.5, B - 196)]), 0.8, 0.6)
    flag = poly([(fx + 2, B - 192), (fx + 48, B - 186), (fx + 50, B - 156), (fx + 2, B - 162)])
    add(f'<path d="{flag}" fill="{PAPER}"/>')
    for k in range(4):
        wash(poly([(fx + 2, B - 190 + k * 8), (fx + 49, B - 184 + k * 8), (fx + 49, B - 180 + k * 8), (fx + 2, B - 186 + k * 8)]), "#B8372B", 0.85, "wcs", g=True)
    wash(poly([(fx + 2, B - 192), (fx + 22, B - 189), (fx + 22, B - 173), (fx + 2, B - 176)]), "#2F4A7A", 0.9, "wcs", g=True)
    ink(flag, 1.1, 0.7)
    return x + w

def juniper(x, base, h):
    blobs = " ".join(f"M{x + jit(h * 0.2) - h * rr:.1f},{base - h * dy:.1f} a{h * rr:.1f},{h * rr * 0.9:.1f} 0 1,0 {2 * h * rr:.1f},0 a{h * rr:.1f},{h * rr * 0.9:.1f} 0 1,0 {-2 * h * rr:.1f},0 Z"
                     for dy, rr in [(0.25, 0.3), (0.45, 0.32), (0.65, 0.26), (0.85, 0.16), (0.4, 0.22)])
    wash(blobs, "#5E7F6A", 0.9, "wcs")
    wash(blobs, "#9DB4A6", 0.35, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.3)]), 1.8, 0.7)

# Draw the street, left to right, with the big cottonwood at the bank and Town Hall's own.
cottonwood(1905, 690, 80, back=True, shadow=False)
cottonwood(2080, 688, 76, back=True, shadow=False)
xx = crenellated_block(1200)
blue_shop(1350)
xx = false_front(xx + 6) + 6
bx = xx
xx = bank(xx)
lamp_post(bx + 150 + 50 + 12)
xx += 40
xx = huber_carlson(xx) + 40
xx = town_hall(xx)
juniper(2392, B + 6, 120)
wash(poly([(1150, B + 2), (2400, B + 2), (2400, B + 14), (1144, B + 14)]), SHADE, 0.45, "wcs", g=True)
cottonwood(1176, B + 12, 38)

# --- In front: the Elizabeth Stampede's arena at Casey Jones Park.
INKSCALE = 1.1
ground = [(0, 760), (800, 752), (1600, 760), (2400, 754)]
wash(ridge_d(ground), "#B99C55", 0.9, "wc1")
wash("M0,880 C500,850 1000,866 1300,860 L1300,1000 L0,1000 Z", "#8A7A48", 0.4, "wc3", g=True)
wash("M1150,790 C1600,780 2000,790 2400,780 L2400,846 L1150,846 Z", "#9C9450", 0.3, "wc3", g=True)
for i in range(30):   # rabbitbrush along the grounds
    x = random.uniform(1150, 2400); y = random.uniform(770, 836)
    wash(f"M{x - 9:.0f},{y:.0f} a9,5 0 1,0 18,0 a9,5 0 1,0 -18,0 Z", "#E2B92E", 0.7, "wcs", g=True)
for x, base, h in [(1206, 866, 160), (1252, 872, 124), (1150, 852, 112), (2330, 862, 104)]:
    tall_pine(x, base, h, jit(5))
# Ponderosas on the left, framing the prairie (and dark behind the type).
for x, base, h in [(70, 930, 300), (190, 900, 250), (300, 940, 270), (430, 905, 190)]:
    tall_pine(x, base, h, jit(10))
# The arena floor, its corner rounded, with grass in front of its near rail.
floor = "M1320,876 L2400,876 L2400,964 L1262,970 C1222,950 1236,890 1320,876 Z"
wash(floor, "#BC9466", 0.92, "wc2")
wash("M1400,898 C1700,888 2000,898 2400,888 L2400,922 C2000,932 1700,922 1380,932 Z", "#D9BC94", 0.4, "wc3", g=True)   # morning sun on the dirt
wash("M1250,950 C1600,940 2000,946 2400,936 L2400,964 L1262,970 Z", "#8A6446", 0.3, "wc3", g=True)
for i in range(60):   # raked dirt
    x = random.uniform(1270, 2380); y = random.uniform(886, 960)
    if x < 1330 - (y - 876) * 0.8: continue
    ink(f"M{x:.0f},{y:.0f} q{random.uniform(20, 40):.0f},-3 {random.uniform(50, 90):.0f},0", 0.8, 0.22)
# The grandstand, full, its aluminium benches in rows.
gs = poly([(1300, 870), (1300, 836), (1340, 790), (1622, 790), (1656, 836), (1656, 870)])
wash(gs, "#8E8A90", 0.85, "wcs")
wash(poly([(1300, 836), (1340, 790), (1356, 790), (1318, 836)]), "#5C5560", 0.4, "wcs", g=True)
crowd = ["#B8372B", "#2F4A7A", "#F4EFE6", "#F4EFE6", "#D6A63C", "#6E5A4C", "#3A3330", "#7E8F9E", "#C8508E", "#6E8A6C"]
for r_, y in enumerate(range(800, 864, 8)):
    x0 = 1300 + max(0, 836 - y) * 0.87 + 4; x1 = 1656 - max(0, 836 - y) * 0.74 - 4
    ink(line([(x0, y + 4), (x1, y + 4)]), 1.2, 0.85, color="#E6E4E0")
    x = x0 + random.uniform(0, 4)
    while x < x1:
        if random.random() < 0.8:
            add(f'<ellipse cx="{x:.1f}" cy="{y + 0.5:.1f}" rx="2.4" ry="3" fill="{random.choice(crowd)}" opacity="0.8"/>')
            add(f'<circle cx="{x:.1f}" cy="{y - 3.5:.1f}" r="1.6" fill="{random.choice(["#E2B9A0", "#C89A78", "#F1EEE6", "#3A3330"])}" opacity="0.85"/>')
        x += random.uniform(5, 7)
ink(gs, 1.6, 0.8)
for sx in (1420, 1540):   # the aisles' white rails
    ink(line([(sx, 870), (sx + 16, 790)]), 1.4, 0.85, color="#F4F1EA")
ink(line([(1340, 786), (1622, 786)]), 1.4, 0.85, color="#F4F1EA")
ink(line([(1300, 852), (1656, 852)]), 1.6, 0.9, color="#F4F1EA")
# The light poles.
for lx, top in [(1700, 748), (2190, 744)]:
    ink(line([(lx, 880), (lx + 2, top)]), 3.0, 0.85, color="#6B4A36")
    ink(poly([(lx - 10, top), (lx + 14, top), (lx + 14, top + 8), (lx - 10, top + 8)]), 1.4, 0.85)
# The announcer's booth on its posts, white with red-framed windows.
bx0, by0, bw, bh = 1810, 782, 220, 58
for px in (bx0 + 10, bx0 + 70, bx0 + 150, bx0 + bw - 12):
    ink(line([(px, by0 + bh), (px, 876)]), 2.0, 0.85, color="#4A4752")
box = poly([(bx0, by0 + bh), (bx0, by0), (bx0 + bw, by0), (bx0 + bw, by0 + bh)])
add(f'<path d="{box}" fill="{PAPER}"/>')
wash(box, "#F1EEE8", 0.7, "wcs", g=True)
wash(poly([(bx0 + bw * 0.78, by0), (bx0 + bw, by0), (bx0 + bw, by0 + bh), (bx0 + bw * 0.78, by0 + bh)]), SHADE, 0.12, "wcs", g=True)
roofb = poly([(bx0 - 6, by0), (bx0 - 2, by0 - 7), (bx0 + bw + 2, by0 - 7), (bx0 + bw + 6, by0)])
add(f'<path d="{roofb}" fill="{PAPER}"/>'); wash(roofb, "#D9D6CF", 0.7, "wcs", g=True); ink(roofb, 1.2, 0.8)
for k, wx in enumerate((bx0 + 12, bx0 + 56, bx0 + 132, bx0 + 176)):
    wash(poly([(wx, by0 + 30), (wx, by0 + 8), (wx + 32, by0 + 8), (wx + 32, by0 + 30)]), "#6E5A4C", 0.8, "wcs", g=True)
    for j in range(2):
        wash(f"M{wx + 8 + j * 14:.0f},{by0 + 30} l0,-10 a4,4 0 0,1 8,0 l0,10 Z", random.choice(["#2F4A7A", "#E2B9A0", "#F4EFE6"]), 0.8, "wcs", g=True)
    ink(poly([(wx, by0 + 30), (wx, by0 + 8), (wx + 32, by0 + 8), (wx + 32, by0 + 30)]), 2.0, 0.9, color="#B32E28")
add(f'<circle cx="{bx0 + 110}" cy="{by0 + 19}" r="10" fill="#FBF8F2" stroke="#B32E28" stroke-width="1.4"/>')
ink(f"M{bx0 + 103},{by0 + 23} q4,-9 8,-4 q3,-5 7,-3", 1.4, 0.9, color="#B32E28")
add(f'<text x="{bx0 + bw / 2}" y="{by0 + 44}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="12.5" font-weight="bold" fill="#5E4A5E" opacity="0.92">ELIZABETH STAMPEDE</text>')
add(f'<text x="{bx0 + bw / 2}" y="{by0 + 54}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="7.5" font-weight="bold" fill="#9E2A24" opacity="0.9">A COLORADO RODEO LEGEND</text>')
ink(box, 1.8)
ink(line([(bx0, by0 + bh), (bx0 + bw, by0 + bh)]), 2.2, 0.85, color="#B32E28")
# The steel chutes and pens along the back, hung with banners.
ink(line([(1268, 846), (2400, 846)]), 1.6, 0.85, color="#4A4752")
for y in (856, 866):
    ink(line([(1262, y), (2400, y)]), 1.4, 0.75, color="#4A4752")
for px in range(1268, 2400, 26):
    ink(line([(px, 842), (px, 876)]), 1.6, 0.8, color="#4A4752")
wash(poly([(1262, 846), (2400, 846), (2400, 876), (1262, 876)]), "#5C5560", 0.22, "wcs", g=True)
for bx_, w_, c in [(1320, 52, "#2F4A7A"), (1460, 46, "#B32E28"), (1580, 50, "#D6A63C"), (1730, 30, "#B32E28"), (1790, 30, "#B32E28"), (2060, 56, "#2F4A7A"), (2140, 30, "#B32E28"), (2240, 54, "#6E8A6C"), (2330, 48, "#B32E28")]:
    tall = w_ == 30
    y0, y1 = (828, 870) if tall else (852, 870)
    sb = poly([(bx_, y1), (bx_, y0), (bx_ + w_, y0), (bx_ + w_, y1)])
    add(f'<path d="{sb}" fill="{PAPER}"/>')
    wash(poly([(bx_ + 4, y0 + 4), (bx_ + w_ - 4, y0 + 4), (bx_ + w_ - 4, y0 + 10), (bx_ + 4, y0 + 10)]), c, 0.85, "wcs", g=True)
    if tall: add(f'<circle cx="{bx_ + w_ / 2}" cy="{y0 + 22}" r="6" fill="{c}" opacity="0.85"/>')
    ink(sb, 1.0, 0.7)
ink(line([(1262, 876), (2400, 876)]), 1.4, 0.6)
# A rider loping past the chutes.
def horse_and_rider(x, y, s=1.3):
    def T(px, py): return (x + px * s, y + py * s)
    body = [T(10, -40), T(40, -44), T(58, -48), T(66, -62), T(72, -72), T(73, -78), T(77, -71), T(88, -58), T(85, -53), T(75, -57), T(68, -50), T(66, -36),
            T(73, -22), T(80, -4), T(75, -2), T(66, -20), T(60, -29), T(40, -29), T(24, -31), T(17, -16), T(10, -2), T(5, -3), T(9, -18), T(5, -30), T(3, -36)]
    wash(poly(body), "#7A4128", 0.95, "wcs")
    wash(poly([T(40, -44), T(58, -48), T(66, -36), T(60, -29), T(40, -29)]), "#4A2618", 0.3, "wcs", g=True)
    ink(poly(body), 1.4, 0.8)
    ink(line([T(62, -30), T(56, -14), T(50, -2)]), 2.4, 0.85, color="#4A2618")   # the far legs
    ink(line([T(22, -30), T(26, -14), T(32, -2)]), 2.4, 0.85, color="#4A2618")
    ink(f"M{T(4, -38)[0]:.0f},{T(4, -38)[1]:.0f} q{-10 * s:.0f},{8 * s:.0f} {-12 * s:.0f},{26 * s:.0f}", 2.6, 0.85, color="#2E1C14")   # tail
    ink(line([T(60, -50), T(68, -66), T(72, -74)]), 2.4, 0.85, color="#2E1C14")   # mane
    # The rider.
    shirt = poly([T(36, -46), T(37, -68), T(47, -70), T(48, -46)])
    wash(shirt, "#C9D2DA", 0.92, "wcs"); ink(shirt, 1.1, 0.8)
    wash(poly([T(34, -46), T(48, -46), T(52, -36), T(40, -32)]), "#3E4A66", 0.92, "wcs")   # jeans
    ink(line([T(46, -64), T(60, -56), T(70, -60)]), 1.4, 0.8)   # arm and reins
    head = T(42, -75)
    add(f'<circle cx="{head[0]:.1f}" cy="{head[1]:.1f}" r="{4.5 * s:.1f}" fill="#E2B9A0"/>')
    hat = poly([T(34, -79), T(50, -79), T(47, -81), T(46, -87), T(38, -87), T(37, -81)])
    wash(hat, "#F1EEE6", 0.95, "wcs"); ink(hat, 1.2, 0.85)
horse_and_rider(2110, 944)
# Dust at the horse's heels, then the white pipe rail along the near side.
for i in range(10):
    add(f'<ellipse cx="{2100 + random.uniform(-40, 10):.0f}" cy="{946 + random.uniform(-10, 4):.0f}" rx="{random.uniform(8, 16):.0f}" ry="{random.uniform(3, 6):.0f}" fill="#D9C2A0" opacity="0.5" filter="url(#wcs)"/>')
rail = [(1262, 970), (1700, 966), (2100, 964), (2400, 962)]
for dy in (-16, -4):
    ink(open_path([(x, y + dy) for x, y in rail]), 2.2, 0.9, color="#F4F1EA")
    ink(open_path([(x, y + dy + 2) for x, y in rail]), 0.7, 0.4)
for px in range(1290, 2400, 70):
    ink(line([(px, interp(rail, px) - 20), (px, interp(rail, px) + 6)]), 2.4, 0.9, color="#F4F1EA")
ink(open_path([(1262, 954), (1232, 930), (1236, 900), (1290, 878)]), 2.2, 0.9, color="#F4F1EA")
wash("M1150,1000 L1150,975 C1600,968 2000,966 2400,962 L2400,1000 Z", "#A8904E", 0.9, "wc1")
for i in range(70):
    x = random.uniform(1150, 2400); top = random.uniform(970, 994)
    ink(line([(x, top + 10), (x + jit(5), top)]), 1.0, 0.45)

# --- Prairie in the left foreground: grass, soapweed and rabbitbrush.
for i in range(200):
    x = random.uniform(0, 1240); top = random.uniform(770, 990); L = random.uniform(12, 32)
    if x > 1180 - (top - 870) * 0.6 and top > 870: continue
    ink(line([(x, top + L), (x + jit(8), top)]), 1.0, 0.42)
for i in range(18):   # soapweed yucca
    x = random.uniform(30, 1150); y = random.uniform(800, 980)
    for k in range(9):
        a = math.radians(random.uniform(-70, 70)); L = random.uniform(14, 26)
        ink(line([(x, y), (x + math.sin(a) * L, y - math.cos(a) * L)]), 1.4, 0.7, color="#4F6A44")
for i in range(16):   # rabbitbrush
    x = random.uniform(0, 1150); y = random.uniform(790, 985)
    wash(f"M{x - 10:.0f},{y:.0f} a10,6 0 1,0 20,0 a10,6 0 1,0 -20,0 Z", "#E2B92E", 0.7, "wcs", g=True)
for i in range(60):
    x = random.uniform(0, 2400); y = random.uniform(764, 840)
    if x > 1280 and y + 12 > 772: continue   # nothing over the stands and the booth
    ink(line([(x, y + 12), (x + jit(5), y)]), 0.9, 0.38)

finish(sys.argv[1])
