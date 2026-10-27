"""Windsor hero, ink and watercolour, 2400 x 1000, in the Lyons style.

Windsor Lake on an autumn morning, looking west across the water from the
lake trail on the near shore: red sandstone riprap at the water's edge and
the trail along the bank (the guide's winter photo of the lake,
windsor-lake-winter.jpg, and its June aerial, windsor-lake-aerial.jpg);
on the far shore the town among gold cottonwoods and the red-orange trees of
Main Park (main-park.jpg), the buff-brick 1909 town hall that is now the Art
& Heritage Center with its cornice, columns and "City Hall" frieze
(windsor-art-and-heritage-center.jpg), the Windsor Mill's white elevator,
its tall tower and the brick mill with its arched windows, as the guide's
2012 photo shows them (windsor-mill.jpg), and the tall stack and white
concrete elevator that make Windsor's skyline from the lake
(windsor-lake-winter.jpg); and behind it all the Front Range with Longs
Peak's flat top and the snow of the Mummy Range, traced from the aerial.
The fields to the left, the trees along the shores and the grass of the
near bank are generic.
"""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "wclib.py")).read())
random.seed(14)

# --- Sky and clouds, as in the other three.
sky()
for cx, cy, s in [(320, 130, 60), (1010, 92, 42), (1640, 140, 68), (2200, 108, 50)]:
    cloud(cx, cy, s)
for cx, cy, s in [(640, 300, 30), (2010, 290, 32)]:
    cloud(cx, cy, s)
for bx, by, bs in [(1180, 236, 11), (1214, 222, 9), (1250, 244, 10), (1150, 254, 8)]:   # a few geese
    ink(f"M{bx - bs},{by} q{bs / 2},{-bs * 0.6} {bs},0 q{bs / 2},{-bs * 0.6} {bs},0", 1.4, 0.7)

# --- The Front Range, traced from the aerial of the lake (the Commons original,
# 3840 px wide): x scaled to the painting, heights stretched a little.
def R(pts, drop=0): return [(x * 0.625, 398 + (y - 549) * 1.2 + drop) for x, y in pts]
INKSCALE = 0.55
far = R([(0, 641), (300, 640), (467, 630), (640, 623), (733, 609), (833, 605), (893, 598), (967, 595), (1040, 602), (1133, 597),
         (1213, 597), (1273, 589), (1300, 597), (1380, 593), (1460, 577), (1480, 566), (1516, 566), (1540, 575), (1580, 582), (1633, 587),
         (1733, 585), (1833, 589), (1880, 587), (1940, 580), (2033, 583), (2133, 578), (2233, 567), (2300, 558), (2367, 553), (2433, 553),
         (2493, 560), (2553, 555), (2600, 557), (2673, 555), (2740, 562), (2873, 569), (2967, 563), (3040, 560), (3120, 549), (3207, 553),
         (3273, 560), (3340, 563), (3407, 557), (3573, 553), (3707, 557), (3840, 563)])
wash(ridge_d(far), "#A3A9CA", 0.8, "wc3")
def snowcap(x0, x1, dep):
    """Snow left as paper along the skyline, with a cool shadow on its right."""
    top = [(x, interp(far, x) + 1) for x in range(int(x0), int(x1) + 1, 5)]
    bot = [(x, y + dep * random.uniform(0.35, 1.0)) for x, y in reversed(top)]
    # The wobble only: the wash filter's darkened rim would grey a shape this thin.
    add(f'<path d="{poly(top + bot)}" fill="#FBF8F2" opacity="0.94" filter="url(#wob)"/>')
    k = int(len(top) * 0.55)
    if len(top) - k >= 2:
        wash(poly(top[k:] + bot[:len(top) - k]), "#9AA3C6", 0.3, "wob", g=True)
for x0, x1, dep in [(404, 470, 14), (494, 566, 16), (580, 646, 16), (686, 776, 18), (780, 814, 14), (862, 920, 20),
                    (958, 1014, 18), (1184, 1244, 15), (1280, 1314, 12), (1390, 1566, 22), (1840, 1870, 9)]:
    snowcap(x0, x1, dep)
# Longs Peak's dark, flat summit block above its snowfields.
wash(poly([(924, interp(far, 924) + 1), (930, 416), (946, 416), (954, interp(far, 954) + 1), (950, 432), (928, 432)]), "#6F7898", 0.4, "wcs", g=True)
ink(open_path(far), 1.4, 0.55)
near = R([(0, 645), (467, 634), (667, 626), (867, 617), (1067, 612), (1300, 609), (1600, 603), (1880, 595), (1967, 598), (2167, 590),
          (2367, 582), (2540, 587), (2740, 578), (2940, 570), (3200, 566), (3407, 562), (3600, 566), (3840, 568)], drop=3)
wash(ridge_d(near), "#8495AE", 0.8, "wc3")
ink(open_path(near), 1.2, 0.45)
for a, b in [(1560, 1760), (2100, 2300)]:   # shade on the slopes away from the sun
    pts = [(x, interp(near, x)) for x in range(a, b + 1, 12)]
    wash(poly(pts + [(b, 512), (a + (b - a) * 0.4, 512)]), "#6E6788", 0.18, "wc3", g=True)

# --- The plains west of town: a windbreak, then fields.
INKSCALE = 0.8
plains = [(0, 508), (800, 512), (1600, 506), (2400, 510)]
wash(ridge_d(plains), "#CDB86C", 0.88, "wc3")
for x in range(-20, 2440, 28):   # trees along the far section lines
    y = interp(plains, x) + 4 + jit(3); r = random.uniform(8, 14)
    wash(f"M{x - r:.0f},{y:.0f} a{r:.0f},{r * 0.8:.0f} 0 1,0 {2 * r:.0f},0 a{r:.0f},{r * 0.8:.0f} 0 1,0 {-2 * r:.0f},0 Z", random.choice(["#7E8F4E", "#A39A45", "#D6A63C"]), 0.85, "wcs")
for y0, col in [(552, "#9FA35C"), (624, "#D6BE72")]:   # a late green field, then stubble
    wash(f"M0,{y0} C600,{y0 - 8} 1400,{y0 + 6} 2400,{y0 - 6} L2400,{y0 + 46} C1400,{y0 + 56} 600,{y0 + 40} 0,{y0 + 50} Z", col, 0.4, "wc3", g=True)
for i in range(34):
    x = random.uniform(0, 1200); y = random.uniform(530, 690)
    ink(line([(x, y), (x + random.uniform(60, 160), y + jit(2))]), 0.8, 0.22)
# A ploughed field nearer the lake, so the corner under the type stays deep.
wash("M0,646 C400,640 800,648 1240,642 L1240,712 L0,712 Z", "#9C7650", 0.5, "wc3", g=True)
for i in range(26):   # its furrows
    y = random.uniform(652, 704); x = random.uniform(-40, 1100)
    ink(line([(x, y), (x + random.uniform(120, 260), y + jit(2))]), 0.9, 0.3)
for x, r in [(150, 30), (196, 24), (560, 28), (604, 34), (650, 26), (960, 24)]:   # cottonwood clumps out in the fields
    cottonwood(x, 616 + jit(4), r, back=True)

# Everything on the far shore is mirrored in the lake later on.
REFL = []
def tree(x, base, r, back=False, shadow=True):
    cottonwood(x, base, r, back=back, shadow=shadow); REFL.append(("tree", x, base, r, "#D9A640"))
def russet(x, base, r):
    """The red-orange trees in the guide's autumn photo of Main Park, shaped like the cottonwoods."""
    blobs = [(-0.55, -0.9, 0.62), (0.5, -0.95, 0.6), (0, -1.35, 0.72), (-0.25, -0.7, 0.55), (0.35, -0.65, 0.5), (0.85, -1.2, 0.42), (-0.85, -1.25, 0.4)]
    d = " ".join(f"M{x + dx * r - rr * r:.1f},{base + dy * r:.1f} a{rr * r:.1f},{rr * r:.1f} 0 1,0 {2 * rr * r:.1f},0 a{rr * r:.1f},{rr * r:.1f} 0 1,0 {-2 * rr * r:.1f},0 Z" for dx, dy, rr in blobs)
    wash(d, "#D06A34", 0.92, "wc2")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.9:.0f} C{x + r * 1.4:.0f},{base - r * 1.6:.0f} {x + r * 1.3:.0f},{base - r * 0.3:.0f} {x + r * 0.2:.0f},{base - r * 0.25:.0f} C{x + r * 0.6:.0f},{base - r * 0.9:.0f} {x + r * 0.5:.0f},{base - r * 1.4:.0f} {x + r * 0.1:.0f},{base - r * 1.9:.0f} Z", "#9A3222", 0.5, "wcs", g=True)
    ink(line([(x - 3, base + 2), (x - 1, base - r * 0.45), (x - r * 0.3, base - r * 0.8)]), 2.0, 0.75)
    ink(line([(x, base - r * 0.45), (x + r * 0.35, base - r * 0.85)]), 1.6, 0.65)
    REFL.append(("tree", x, base, r, "#C8643A"))

# --- The far shore, left: trees along the water in front of the fields.
for c0, n in [(-20, 3), (250, 2), (420, 4), (760, 3), (990, 3)]:
    x = c0
    for k in range(n):
        if random.random() < 0.2: russet(x, 712 + jit(4), random.uniform(30, 40))
        else: tree(x, 712 + jit(4), random.uniform(32, 48), back=True)
        x += random.uniform(48, 66)

# --- Windsor's skyline from the lake: the tall stack and the white concrete
# elevator, rising behind the trees of the far shore (the winter photo).
INKSCALE = 0.7
def stack(sx, base, h):
    st = base - h
    d = poly([(sx - 8, base), (sx - 6, st), (sx + 6, st), (sx + 8, base)])
    add(f'<path d="{d}" fill="{PAPER}"/>')
    wash(d, "#E6DED2", 0.8, "wcs", g=True)
    wash(poly([(sx + 1, base), (sx + 1, st), (sx + 6, st), (sx + 8, base)]), "#8E8AA6", 0.3, "wcs", g=True)
    wash(poly([(sx - 6, st), (sx + 6, st), (sx + 6, st + 9), (sx - 6, st + 9)]), "#7A6556", 0.85, "wcs", g=True)
    ink(d, 1.3, 0.75)
    REFL.append(("bldg", sx - 8, sx + 8, st, "#E6DED2", True))
def elevator(ex, base, h):
    et = base - h; bw = 32
    for k in range(3):
        bx = ex + k * bw
        d = poly([(bx, base), (bx, et), (bx + bw, et), (bx + bw, base)])
        add(f'<path d="{d}" fill="{PAPER}"/>')
        wash(d, "#E9E6E1", 0.7, "wcs", g=True)
        wash(poly([(bx + bw * 0.62, et), (bx + bw, et), (bx + bw, base), (bx + bw * 0.62, base)]), "#8E8AA6", 0.32, "wcs", g=True)   # the bins' round
        ink(d, 1.3, 0.75)
    hh = poly([(ex + 28, et), (ex + 28, et - 18), (ex + 70, et - 18), (ex + 70, et)])
    add(f'<path d="{hh}" fill="{PAPER}"/>')
    wash(hh, "#E9E6E1", 0.7, "wcs", g=True)
    wash(poly([(ex + 56, et - 18), (ex + 70, et - 18), (ex + 70, et), (ex + 56, et)]), "#8E8AA6", 0.3, "wcs", g=True)
    ink(hh, 1.2, 0.75)
    ink(line([(ex - 6, et + 2), (ex + 3 * bw + 6, et + 2)]), 1.2, 0.7)   # the gallery along the top
    for px_ in range(int(ex - 4), int(ex + 3 * bw + 6), 9):
        ink(line([(px_, et + 2), (px_, et - 4)]), 0.8, 0.6)
    for px_ in (ex + 34, ex + 46, ex + 60):
        ink(line([(px_, et - 18), (px_, et - 26)]), 1.0, 0.65)
    REFL.append(("bldg", ex, ex + 3 * bw, et, "#E9E6E1", True))
stack(1206, 704, 240)
elevator(1236, 704, 168)

# --- Big shade trees of Main Park and the old town, behind the buildings.
INKSCALE = 0.85
for x, r in [(1330, 60), (1460, 70), (1590, 76), (1700, 68), (1840, 60), (2000, 64), (2150, 70), (2290, 74), (2420, 66)]:
    tree(x + jit(20), 648 + jit(8), r, back=True, shadow=False)
for x, r in [(1625, 54), (2360, 46)]:
    russet(x, 676, r)

B = 712
for x, r in [(1176, 36), (1226, 40), (1290, 34)]:   # in front of the elevator's foot
    tree(x, 712 + jit(3), r, back=True)
ponderosa(1258, 714, 70); ponderosa(1318, 716, 56)   # blue spruce, as in the winter photo

# --- The lawn along the far shore.
wash(poly([(1100, B - 4), (2400, B - 4), (2400, B + 12), (1100, B + 12)]), "#A9A65E", 0.8, "wcs")

# --- The Art & Heritage Center: Windsor's 1909 town hall.
BUFF, CREAM = "#D8BC8A", "#F1E7D0"
def heritage(x):
    w, h = 210, 148
    top = B - h
    body = poly([(x, B), (x, top), (x + w, top), (x + w, B)])
    wash(body, BUFF, 0.93, "wcs")
    wash(poly([(x + w * 0.74, top), (x + w, top), (x + w, B), (x + w * 0.74, B)]), "#8E6E58", 0.2, "wcs", g=True)
    coursing(x, top + 36, x + w, B - 6, step=9)
    # The low pediment over the parapet, then the overhanging dentilled cornice.
    ped = poly([(x + 50, top + 8), (x + w / 2, top - 6), (x + w - 50, top + 8)])
    add(f'<path d="{ped}" fill="{PAPER}"/>'); wash(ped, CREAM, 0.9, "wcs", g=True); ink(ped, 1.1, 0.7)
    cor = poly([(x - 11, top + 8), (x + w + 11, top + 8), (x + w + 7, top + 17), (x - 7, top + 17)])
    add(f'<path d="{cor}" fill="{PAPER}"/>'); wash(cor, CREAM, 0.9, "wcs", g=True)
    wash(poly([(x - 7, top + 17), (x + w + 7, top + 17), (x + w + 4, top + 21), (x - 4, top + 21)]), "#7E6A5E", 0.45, "wcs", g=True)   # shadow under it
    ink(cor, 1.3, 0.8)
    for k in range(int((w + 8) / 7) + 1):
        ink(line([(x - 3 + k * 7, top + 18), (x - 3 + k * 7, top + 22)]), 0.9, 0.55)
    fr = poly([(x + 2, top + 23), (x + w - 2, top + 23), (x + w - 2, top + 32), (x + 2, top + 32)])
    add(f'<path d="{fr}" fill="{PAPER}"/>'); wash(fr, CREAM, 0.7, "wcs", g=True)
    add(f'<text x="{x + w / 2}" y="{top + 31}" text-anchor="middle" font-family="Georgia, DejaVu Serif, serif" font-size="8.5" font-weight="bold" letter-spacing="1.4" fill="{INK}" opacity="0.8">CITY HALL</text>')
    for yy, hh_ in [(top + 35, 4), (top + 92, 5)]:   # string courses
        sc = poly([(x - 3, yy), (x + w + 3, yy), (x + w + 3, yy + hh_), (x - 3, yy + hh_)])
        add(f'<path d="{sc}" fill="{PAPER}"/>'); wash(sc, CREAM, 0.85, "wcs", g=True); ink(sc, 0.9, 0.55)
    # Second floor: pedimented windows in the end bays, three between two columns.
    for wx, ww_ in [(x + 12, 21), (x + w - 33, 21)]:
        trimmed(wx, top + 50, ww_, 32, "#5B6E80")
        hood = poly([(wx - 6, top + 46), (wx + ww_ / 2, top + 40), (wx + ww_ + 6, top + 46)])
        add(f'<path d="{hood}" fill="{PAPER}"/>'); wash(hood, CREAM, 0.85, "wcs", g=True); ink(hood, 1.0, 0.7)
    for wx in (x + 62, x + 98, x + 134):
        trimmed(wx, top + 48, 14, 34, "#5B6E80")
    for cx_ in (x + 86, x + 122):
        col_ = poly([(cx_ - 3, top + 40), (cx_ + 3, top + 40), (cx_ + 3, top + 92), (cx_ - 3, top + 92)])
        add(f'<path d="{col_}" fill="{PAPER}"/>'); wash(col_, "#F6F0E2", 0.6, "wcs", g=True)
        ink(line([(cx_ - 3, top + 42), (cx_ - 3, top + 92)]), 0.8, 0.6); ink(line([(cx_ + 3, top + 42), (cx_ + 3, top + 92)]), 0.8, 0.6)
        ink(line([(cx_ - 5, top + 41), (cx_ + 5, top + 41)]), 1.2, 0.7)   # capital
    # Ground floor: a door in each end bay, a double door and the big window.
    for dx_, dw in [(x + 13, 22), (x + 52, 40), (x + w - 34, 21)]:
        dd = poly([(dx_, B), (dx_, B - 42), (dx_ + dw, B - 42), (dx_ + dw, B)])
        add(f'<path d="{dd}" fill="{PAPER}"/>'); wash(dd, "#F4EFE6", 0.7, "wcs", g=True)
        for px_ in ([dx_ + 4, dx_ + dw / 2 + 2] if dw > 30 else [dx_ + 4]):
            wash(poly([(px_, B - 30), (px_, B - 6), (px_ + (dw / 2 - 6 if dw > 30 else dw - 8), B - 6), (px_ + (dw / 2 - 6 if dw > 30 else dw - 8), B - 30)]), WIN, 0.75, "wcs", g=True)
        ink(dd, 1.2, 0.75)
    trimmed(x + 116, B - 44, 36, 36, "#4A4752")
    ink(body, 2.0)
    return x + w

# --- The Windsor Mill on Main Street: the white elevator, its tower and the brick mill.
RED_BOARD, MILL_BRICK = "#8E2F2A", "#C8734A"
def mill(x):
    ew, eh = 230, 200
    et = B - eh
    roof = poly([(x - 4, et), (x + 14, et - 36), (x + ew - 4, et - 30), (x + ew + 6, et)])
    wash(roof, "#B9BEC4", 0.92, "wcs")
    for k in range(int(ew / 8)):   # standing seams
        ink(line([(x + 4 + k * 8, et - 2), (x + 18 + k * 8 * 0.98, et - 33 + k * 0.03)]), 0.6, 0.3)
    ink(roof, 1.5, 0.8)
    ink(line([(x - 4, et + 6), (x + 14, et - 36)]), 3.0, 0.85, color="#6E2A24")   # the dark red gable end
    wall = poly([(x, B), (x, et), (x + ew, et), (x + ew, B)])
    add(f'<path d="{wall}" fill="{PAPER}"/>')
    wash(wall, "#ECEAE6", 0.75, "wcs", g=True)
    wash(poly([(x, et), (x + ew, et), (x + ew, et + 10), (x, et + 10)]), "#8E8AA6", 0.35, "wcs", g=True)   # under the eave
    wash(poly([(x + ew * 0.62, et + 10), (x + ew, et + 10), (x + ew, B - 44), (x + ew * 0.62, B - 44)]), "#A9A6C2", 0.22, "wcs", g=True)
    for k in range(1, int(ew / 6)):   # the corrugated cladding
        ink(line([(x + k * 6, et + 12), (x + k * 6, B - 46)]), 0.5, 0.13)
    for yy in range(int(et + 34), int(B - 46), 26):   # its panel seams
        ink(line([(x + 2, yy), (x + ew - 2, yy)]), 0.6, 0.25)
    for dx_ in (10, ew * 0.58):   # downspouts
        ink(line([(x + dx_, et + 2), (x + dx_, B - 2)]), 1.2, 0.55)
    ink(line([(x + 62, B - 104), (x + 84, B - 64)]), 1.4, 0.7); ink(poly([(x + 76, B - 112), (x + 76, B - 98), (x + 86, B - 98), (x + 86, B - 112)]), 1.0, 0.7)   # the chute
    base = poly([(x, B), (x, B - 44), (x + ew, B - 44), (x + ew, B)])
    wash(base, "#7A3A2E", 0.9, "wcs")
    for k in range(int(ew / 9)):
        ink(line([(x + 4 + k * 9, B - 42), (x + 4 + k * 9, B - 2)]), 0.6, 0.3)
    ink(wall, 2.0)
    # The tower, rising beside it with its own white-clad top and roof.
    tx, tw = x + ew, 60
    tower = poly([(tx, B), (tx, B - 238), (tx + tw, B - 238), (tx + tw, B)])
    wash(tower, "#8E6A4C", 0.93, "wcs")
    wash(poly([(tx + tw * 0.6, B - 238), (tx + tw, B - 238), (tx + tw, B), (tx + tw * 0.6, B)]), "#5E3E30", 0.3, "wcs", g=True)
    coursing(tx, B - 236, tx + tw, B - 4, step=8)
    for rx, ry, rw, rh in [(tx + 22, B - 226, 16, 28), (tx + 21, B - 160, 18, 30), (tx + 12, B - 54, 34, 54)]:
        wash(poly([(rx, ry), (rx + rw, ry), (rx + rw, ry + rh), (rx, ry + rh)]), RED_BOARD, 0.9, "wcs")
        ink(poly([(rx, ry), (rx + rw, ry), (rx + rw, ry + rh), (rx, ry + rh)]), 1.1, 0.75)
    ink(tower, 2.0)
    cap = poly([(tx - 32, B - 234), (tx - 32, B - 262), (tx + tw, B - 262), (tx + tw, B - 238), (tx, B - 238), (tx, B - 234)])
    add(f'<path d="{cap}" fill="{PAPER}"/>'); wash(cap, "#ECEAE6", 0.75, "wcs", g=True)
    wash(poly([(tx + 30, B - 262), (tx + tw, B - 262), (tx + tw, B - 238), (tx + 30, B - 238)]), "#A9A6C2", 0.25, "wcs", g=True)
    for wx, wy in [(tx - 20, B - 254), (tx + 2, B - 252)]:
        wash(poly([(wx, wy), (wx + 6, wy), (wx + 6, wy + 8), (wx, wy + 8)]), "#3E3B46", 0.85, "wcs", g=True)
    ink(cap, 1.6, 0.8)
    croof = poly([(tx - 36, B - 262), (tx - 22, B - 284), (tx + tw - 2, B - 278), (tx + tw + 12, B - 262)])
    wash(croof, "#B9BEC4", 0.92, "wcs"); ink(croof, 1.4, 0.8)
    ink(line([(tx - 36, B - 260), (tx - 22, B - 284)]), 2.6, 0.85, color="#6E2A24")
    ink(line([(tx - 36, B - 261), (tx + tw + 12, B - 261)]), 1.6, 0.8, color="#6E2A24")
    # The brick mill: a tall pier by the head house, the brick front with its
    # arched windows, grey corrugated iron behind and a gable end on the right.
    wx0, ww = tx + tw, 186
    pier = poly([(wx0, B), (wx0, B - 176), (wx0 + 18, B - 168), (wx0 + 18, B)])
    wash(pier, MILL_BRICK, 0.93, "wcs"); coursing(wx0, B - 166, wx0 + 18, B, step=8); ink(pier, 1.6)
    iron = poly([(wx0 + 18, B - 92), (wx0 + 18, B - 126), (wx0 + ww - 34, B - 126), (wx0 + ww - 34, B - 92)])
    wash(iron, "#7E838A", 0.9, "wcs")
    for k in range(int((ww - 52) / 6)):
        ink(line([(wx0 + 22 + k * 6, B - 124), (wx0 + 22 + k * 6, B - 94)]), 0.5, 0.3)
    ink(iron, 1.3, 0.75)
    gable = poly([(wx0 + ww - 34, B - 92), (wx0 + ww - 34, B - 136), (wx0 + ww - 17, B - 160), (wx0 + ww, B - 136), (wx0 + ww, B - 92)])
    wash(gable, MILL_BRICK, 0.93, "wcs"); ink(gable, 1.6)
    front = poly([(wx0 + 18, B), (wx0 + 18, B - 92), (wx0 + ww, B - 92), (wx0 + ww, B)])
    wash(front, MILL_BRICK, 0.93, "wcs")
    wash(poly([(wx0 + ww * 0.7, B - 92), (wx0 + ww, B - 92), (wx0 + ww, B), (wx0 + ww * 0.7, B)]), STONE_D, 0.22, "wcs", g=True)
    coursing(wx0 + 18, B - 90, wx0 + ww, B - 4, step=9)
    ink(line([(wx0 + 16, B - 92), (wx0 + ww + 2, B - 92)]), 1.8, 0.8)
    for ax in range(int(wx0 + 30), int(wx0 + ww - 20), 30):
        d = f"M{ax},{B - 16} L{ax},{B - 56} a8,8 0 0,1 16,0 L{ax + 16},{B - 16} Z"
        wash(d, RED_BOARD, 0.9, "wcs"); ink(d, 1.1, 0.75)
        ink(f"M{ax - 3},{B - 56} a11,11 0 0,1 22,0", 1.0, 0.6)
    ink(front, 2.0)
    REFL.append(("bldg", x, x + ew, et - 30, "#ECEAE6", True))
    REFL.append(("bldg", tx, tx + tw, B - 262, "#8E6A4C", False))
    REFL.append(("bldg", wx0, wx0 + ww, B - 130, MILL_BRICK, False))
    return wx0 + ww

hx = 1340
heritage(hx); REFL.append(("bldg", hx, hx + 210, B - 148, BUFF, False))
mill(1730)
for x, r in [(1332, 36), (1576, 40), (1612, 34), (2222, 42), (2268, 36)]:
    tree(x, B + 10, r)

# --- Windsor Lake.
INKSCALE = 1.0
SH = 722
lake = [(0, 718), (600, 721), (1200, 719), (1800, 722), (2400, 720)]
wash(ridge_d(lake), "#80AAC6", 0.92, "wc3")
wash("M0,722 C800,728 1600,720 2400,724 L2400,758 C1600,768 800,764 0,770 Z", "#C9DDE8", 0.4, "wc3", g=True)   # the sky in the water
# Reflections of the far shore, pulled down and softened.
for kind, *a in REFL:
    if kind == "tree":
        x, base, r, col = a
        ry = max(10, (SH - (base - 2.0 * r)) * 0.46); rx = r * 1.2
        add(f'<path d="M{x - rx:.0f},{SH + 2} L{x + rx:.0f},{SH + 2} C{x + rx:.0f},{SH + ry * 0.7:.0f} {x + rx * 0.4:.0f},{SH + ry:.0f} {x:.0f},{SH + ry:.0f} C{x - rx * 0.4:.0f},{SH + ry:.0f} {x - rx:.0f},{SH + ry * 0.7:.0f} {x - rx:.0f},{SH + 2} Z" fill="{col}" opacity="0.5" filter="url(#soft)"/>')
for kind, *a in REFL:
    if kind == "bldg":
        x0, x1, top, col, pale = a
        y1 = SH + (SH - top) * 0.42
        d = poly([(x0 + 2, SH + 2), (x1 - 2, SH + 2), (x1 - 4, y1), (x0 + 4, y1)])
        add(f'<path d="{d}" fill="{PAPER if pale else col}" opacity="{0.5 if pale else 0.34}" filter="url(#wc3)"/>')
wash("M0,780 C800,792 1600,784 2400,792 L2400,1000 L0,1000 Z", "#4F7C9A", 0.32, "wc3", g=True)   # deeper toward us
wash("M0,738 C400,744 900,760 1200,800 C1260,860 1180,920 1100,1000 L0,1000 Z", "#3F6A8A", 0.24, "wc3", g=True)   # deepest under the type
ink(open_path(lake), 1.4, 0.55)
edge = [(0, 904), (600, 896), (1200, 886), (1800, 878), (2400, 872)]
for i in range(180):   # ripples left as paper, breaking up the reflections
    x = random.uniform(-20, 2400); y = random.uniform(726, 884)
    if y > interp(edge, x) - 10: continue
    if x < 1180 and y > 770 and random.random() < 0.6: continue
    t = (y - 720) / 170; L = random.uniform(26, 70) * (0.6 + t)
    add(f'<path d="M{x:.0f},{y:.0f} q{L / 2:.0f},{-2 - t * 3:.0f} {L:.0f},0" stroke="#FBF7EE" stroke-width="{1.6 + t * 2:.1f}" fill="none" stroke-linecap="round" opacity="0.8"/>')
    if random.random() < 0.25: ink(f"M{x + 6:.0f},{y + 5:.0f} q{L / 3:.0f},-2 {L * 0.6:.0f},0", 0.9, 0.35)

# --- The near shore: red sandstone riprap at the water's edge, the lake trail, dry grass.
INKSCALE = 1.15
wash(ridge_d(edge), "#BFA963", 0.9, "wc1")
wash("M0,1000 L0,950 C600,940 1500,930 2400,912 L2400,1000 Z", "#8F7F5C", 0.3, "wc3", g=True)
def riprap(cx, cy, w, h):
    """One angular block of red sandstone: a sunlit top, a shaded face."""
    pts = [(cx - w / 2, cy), (cx - w / 2 + jit(4), cy - h * random.uniform(0.4, 0.7)), (cx - w * random.uniform(0.15, 0.35), cy - h),
           (cx + w * random.uniform(0.1, 0.3), cy - h - jit(4)), (cx + w / 2 + jit(3), cy - h * random.uniform(0.35, 0.6)), (cx + w / 2 - random.uniform(0, 6), cy)]
    wash(poly(pts), random.choice(["#C46A4A", "#B9603F", "#CF7C58", "#C2705A"]), 0.93, "wcs")
    ridge = (pts[1][1] + pts[0][1]) / 2
    wash(poly([pts[1], pts[2], pts[3], pts[4], (pts[4][0] - 6, ridge + 2), (pts[1][0] + 6, ridge)]), "#E8A782", 0.42, "wcs", g=True)   # the top, catching the sun
    wash(poly([(cx + w * 0.15, ridge), pts[4], pts[5], (cx + w * 0.1, cy)]), "#7F3E2E", 0.42, "wcs", g=True)
    ink(poly(pts), 1.4, 0.8)
    ink(line([(pts[1][0] + 6, ridge), (pts[4][0] - 6, ridge + 2)]), 0.9, 0.45)
x = -20   # the waterline: half-drowned blocks with paper glints
while x < 2440:
    w_ = random.uniform(36, 70); y = interp(edge, x) + random.uniform(0, 6)
    add(f'<path d="M{x - w_ / 2 - 12:.0f},{y + 3:.0f} q{w_ * 0.6:.0f},5 {w_ + 24:.0f},0" stroke="#FBF7EE" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85"/>')
    riprap(x, y, w_, random.uniform(10, 18))
    x += w_ * random.uniform(0.9, 1.6)
rocks = []
for i in range(96):
    x = random.uniform(-30, 2430); y = interp(edge, x) + random.uniform(10, 46)
    rocks.append((y, x, random.uniform(34, 96)))
for y, x, w_ in sorted(rocks):   # back to front, so the near blocks overlap the far
    riprap(x, y, w_, w_ * random.uniform(0.28, 0.42))
for i in range(90):   # dry grass between the blocks
    x = random.uniform(0, 2400); y = interp(edge, x) + random.uniform(8, 50)
    ink(line([(x, y), (x + jit(5), y - random.uniform(6, 14))]), 0.9, 0.4)
trail = [(470, 1000), (700, 972), (1000, 954), (1400, 942), (1800, 934), (2400, 926)]
trail_b = [(x, y + 22 + (x - 470) * 0.004) for x, y in trail]
wash(open_path(trail) + " L" + " L".join(f"{x:.0f},{y:.0f}" for x, y in reversed(trail_b)) + " Z", "#CDBFA6", 0.85, "wcs")
ink(open_path(trail), 1.3, 0.55); ink(open_path(trail_b), 1.3, 0.5)
for i in range(260):
    x = random.uniform(0, 2400); top = interp(edge, x) + random.uniform(40, 130)
    if top > 995: continue
    if interp(trail, x) - 6 < top < interp(trail_b, x) + 4 and x > 470: continue
    L = random.uniform(10, 26)
    ink(line([(x, top + L), (x + jit(6), top)]), 1.0, 0.42)
for i in range(46):   # rabbitbrush along the bank
    x = random.uniform(0, 2400); y = interp(edge, x) + random.uniform(44, 120)
    if y > 990 or (interp(trail, x) - 10 < y < interp(trail_b, x) + 8 and x > 470): continue
    wash(f"M{x - 9:.0f},{y:.0f} a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0 Z", random.choice(["#E2B92E", "#E2B92E", "#9A7BC0"]), 0.75, "wcs", g=True)

finish(sys.argv[1])
