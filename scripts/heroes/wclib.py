"""Shared ink-and-watercolour machinery for the painted town heroes.

Each town's script (lyons.py, niwot.py, berthoud.py) runs this file first and
then draws its scene with these helpers into a 2400 x 1000 SVG. Washes get a
paper underlay so they never muddy what is behind them; shadows and accents
are glazes (g=True) laid over with multiply. See README.md for rendering.
"""
import math, random, re, sys
W, H = 2400, 1000
o = []
def add(s): o.append(s)

def smooth(pts):
    d = []
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]; p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}")
    return " ".join(d)
def open_path(pts): return f"M{pts[0][0]:.1f},{pts[0][1]:.1f} " + smooth(pts)
def ridge_d(pts, base=H): return f"M{pts[0][0]},{base} L{pts[0][0]},{pts[0][1]} " + smooth(pts) + f" L{pts[-1][0]},{base} Z"
def poly(pts): return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
def line(pts): return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
def interp(pts, x):
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        if x1 <= x <= x2: return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    return pts[-1][1] if x > pts[-1][0] else pts[0][1]
def jit(a): return random.uniform(-a, a)

INK = "#46301F"
INKSCALE = 1.0
PAPER = "#F7F0E2"
def wash(d, color, op=0.9, f="wc1", extra="", g=False):
    if not g: add(f'<path d="{d}" fill="{PAPER}"/>')
    add(f'<path d="{d}" fill="{color}" opacity="{op}" filter="url(#{f})" style="mix-blend-mode:multiply" {extra}/>')
def ink(d, w=2.2, op=0.85, color=INK, extra=""):
    w = w * INKSCALE
    # A straight level or upright line has a zero-sized bounding box, which
    # empties the wobble filter's region and the line vanishes. Those lines
    # get their tremor drawn in here instead.
    if re.fullmatch(r"M[\d.\-]+,[\d.\-]+( L[\d.\-]+,[\d.\-]+)+( Z)?", d.strip()):
        pts = [tuple(map(float, p.split(","))) for p in re.findall(r"[\d.\-]+,[\d.\-]+", d)]
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        if max(xs) - min(xs) < 12 or max(ys) - min(ys) < 12:
            out = [pts[0]]
            for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
                n = max(1, int(math.hypot(x2 - x1, y2 - y1) / 10))
                L = math.hypot(x2 - x1, y2 - y1) or 1
                nx, ny = -(y2 - y1) / L, (x2 - x1) / L
                for k in range(1, n + 1):
                    t = k / n; j = random.uniform(-0.9, 0.9) if k < n else 0
                    out.append((x1 + (x2 - x1) * t + nx * j, y1 + (y2 - y1) * t + ny * j))
            d2 = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in out) + (" Z" if d.strip().endswith("Z") else "")
            add(f'<path d="{d2}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}" {extra}/>')
            return
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{op}" filter="url(#wob)" {extra}/>')

def wc_filter(fid, seed, warp=14, freq=0.012, pig=0.022, rim=4, rimblur=5, rimdark=0.5, rimop=0.6):
    return (f'<filter id="{fid}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">'
            f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="3" seed="{seed}" result="warp"/>'
            f'<feDisplacementMap in="SourceGraphic" in2="warp" scale="{warp}" xChannelSelector="R" yChannelSelector="G" result="shape"/>'
            f'<feTurbulence type="fractalNoise" baseFrequency="{pig}" numOctaves="4" seed="{seed + 5}" result="pig"/>'
            f'<feColorMatrix in="pig" type="luminanceToAlpha" result="pa"/>'
            f'<feComponentTransfer in="pa" result="pa2"><feFuncA type="linear" slope="1.3" intercept="0.25"/></feComponentTransfer>'
            f'<feComposite in="shape" in2="pa2" operator="in" result="mott"/>'
            f'<feMorphology in="shape" operator="erode" radius="{rim}" result="inner"/>'
            f'<feGaussianBlur in="inner" stdDeviation="{rimblur}" result="ib"/>'
            f'<feComposite in="shape" in2="ib" operator="out" result="ring"/>'
            f'<feColorMatrix in="ring" type="matrix" values="{rimdark} 0 0 0 0  0 {rimdark} 0 0 0  0 0 {rimdark} 0 0  0 0 0 {rimop} 0" result="rd"/>'
            f'<feMerge><feMergeNode in="mott"/><feMergeNode in="rd"/></feMerge></filter>')

add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
add('<defs>')
add(wc_filter("wc1", 3)); add(wc_filter("wc2", 17, warp=10, freq=0.02, pig=0.03))
add(wc_filter("wc3", 29, warp=22, freq=0.008, pig=0.012, rim=6, rimblur=8, rimdark=0.6, rimop=0.45))
add(wc_filter("wcs", 41, warp=6, freq=0.03, pig=0.04, rim=2, rimblur=3))   # small things
add(wc_filter("sky", 53, warp=30, freq=0.004, pig=0.006, rim=10, rimblur=14, rimdark=0.75, rimop=0.25))
add('<filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter>')
add('<filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>')
add('<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="9" result="n"/>'
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 -1.1 0.62"/></filter>')
add('<filter id="blotch" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="21" result="n"/>'
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.78  0 0 0 0 0.68  0 0 0 0 0.55  0 0 0 -1.4 0.72"/></filter>')
add('<linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E93C4"/><stop offset="0.42" stop-color="#A2C3DC"/><stop offset="0.72" stop-color="#F0D9B8"/><stop offset="0.9" stop-color="#F4CFA2"/></linearGradient>')
add('</defs>')

# Paper.
add(f'<rect width="{W}" height="{H}" fill="#F7F0E2"/>')


STONE, STONE_D, SLATE, TRIM, WIN = "#C0694B", "#8E4632", "#6E788A", "#F4E9D3", "#4A4752"
B = 702

def sky():
    add(f'<rect x="-40" y="-40" width="{W + 80}" height="640" fill="url(#skyg)" opacity="0.85" filter="url(#sky)" style="mix-blend-mode:multiply"/>')

def cloud(cx, cy, s):
    blobs = [(0, 0, 1.0), (-0.9, 0.25, 0.7), (0.95, 0.2, 0.78), (-0.45, -0.3, 0.72), (0.5, -0.35, 0.7), (1.75, 0.45, 0.48), (-1.65, 0.45, 0.46), (0.2, 0.45, 0.8)]
    shapes = "".join(f'<ellipse cx="{cx + dx * s:.0f}" cy="{cy + dy * s:.0f}" rx="{r * s * 1.15:.0f}" ry="{r * s * 0.85:.0f}"/>' for dx, dy, r in blobs)
    add(f'<g fill="#FCF8F0" filter="url(#sky)" opacity="0.9">{shapes}</g>')
    under = "".join(f'<ellipse cx="{cx + dx * s:.0f}" cy="{cy + dy * s + s * 0.35:.0f}" rx="{r * s:.0f}" ry="{r * s * 0.45:.0f}"/>' for dx, dy, r in blobs[1:3] + blobs[5:])
    add(f'<g fill="#B9A3B8" filter="url(#wc3)" opacity="0.35" style="mix-blend-mode:multiply">{under}</g>')

def ponderosa(x, base, h):
    wash(" ".join(f"M{x + jit(2) - h * rx:.1f},{base - h * dy:.1f} a{h * rx:.1f},{h * 0.17:.1f} 0 1,0 {2 * h * rx:.1f},0 a{h * rx:.1f},{h * 0.17:.1f} 0 1,0 {-2 * h * rx:.1f},0 Z"
                  for dy, rx in [(0.42, 0.34), (0.68, 0.28), (0.9, 0.18)]), "#33533D", 0.92, "wcs")
    wash(" ".join(f"M{x - h * rx:.1f},{base - h * dy:.1f} a{h * rx * 0.55:.1f},{h * 0.12:.1f} 0 1,0 {h * rx * 1.1:.1f},0 a{h * rx * 0.55:.1f},{h * 0.12:.1f} 0 1,0 {-h * rx * 1.1:.1f},0 Z" for dy, rx in [(0.44, 0.34), (0.7, 0.28)]), "#6F8F5A", 0.55, "wcs", g=True)
    ink(line([(x, base), (x, base - h * 0.4)]), 1.4, 0.7)

def cottonwood(x, base, r, back=False, shadow=True):
    if shadow:
        wash(f"M{x - r * 0.4:.0f},{base + 4:.0f} a{r * 1.2:.0f},{r * 0.18:.0f} 0 1,0 {r * 2.4:.0f},0 a{r * 1.2:.0f},{r * 0.18:.0f} 0 1,0 {-r * 2.4:.0f},0 Z", "#7E7398", 0.4, "wcs", g=True)
    blobs = [(-0.55, -0.9, 0.62), (0.5, -0.95, 0.6), (0, -1.35, 0.72), (-0.25, -0.7, 0.55), (0.35, -0.65, 0.5), (0.85, -1.2, 0.42), (-0.85, -1.25, 0.4)]
    d = " ".join(f"M{x + dx * r - rr * r:.1f},{base + dy * r:.1f} a{rr * r:.1f},{rr * r:.1f} 0 1,0 {2 * rr * r:.1f},0 a{rr * r:.1f},{rr * r:.1f} 0 1,0 {-2 * rr * r:.1f},0 Z" for dx, dy, rr in blobs)
    wash(d, "#F1B232" if not back else "#E9AE3E", 0.92, "wc2")
    wash(f"M{x + r * 0.1:.0f},{base - r * 1.9:.0f} C{x + r * 1.4:.0f},{base - r * 1.6:.0f} {x + r * 1.3:.0f},{base - r * 0.3:.0f} {x + r * 0.2:.0f},{base - r * 0.25:.0f} C{x + r * 0.6:.0f},{base - r * 0.9:.0f} {x + r * 0.5:.0f},{base - r * 1.4:.0f} {x + r * 0.1:.0f},{base - r * 1.9:.0f} Z", "#D06A1E", 0.5, "wcs", g=True)
    ink(line([(x - 3, base + 2), (x - 1, base - r * 0.45), (x - r * 0.3, base - r * 0.8)]), 2.0, 0.75)
    ink(line([(x, base - r * 0.45), (x + r * 0.35, base - r * 0.85)]), 1.6, 0.65)
    ink(line([(x + 4, base + 2), (x + 2, base - r * 0.4)]), 1.6, 0.6)

def coursing(x0, y0, x1, y1, step=14):
    row = 0
    for y in range(int(y0) + step, int(y1), step):
        off = (row % 2) * 12; row += 1
        for x in range(int(x0) + 4 + off, int(x1) - 10, 24):
            ink(line([(x, y + jit(1)), (x + 16, y + jit(1))]), 0.8, 0.3)

def trimmed(wx, wy, ww, wh, col=None):
    add(f'<rect x="{wx - 4}" y="{wy - 4}" width="{ww + 8}" height="{wh + 8}" fill="{PAPER}"/>')
    wash(poly([(wx, wy + wh), (wx, wy), (wx + ww, wy), (wx + ww, wy + wh)]), col or WIN, 0.85, "wcs", g=True)
    ink(poly([(wx - 4, wy + wh + 4), (wx - 4, wy - 4), (wx + ww + 4, wy - 4), (wx + ww + 4, wy + wh + 4)]), 1.2, 0.7)
    ink(line([(wx + ww / 2, wy), (wx + ww / 2, wy + wh)]), 0.8, 0.5)

def eave_hatch(x0, x1, y):
    for x in range(int(x0) + 4, int(x1) - 4, 7):
        ink(line([(x, y + 2), (x + 8, y + 12)]), 0.7, 0.35)

def storefront(x, w, h, color, awning, stone=False):
    wash(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), color, 0.92, "wcs")
    wash(poly([(x + w * 0.7, B - h), (x + w, B - h), (x + w, B), (x + w * 0.7, B)]), STONE_D, 0.25, "wcs", g=True)
    wash(poly([(x - 5, B - h - 12), (x + w + 5, B - h - 12), (x + w + 5, B - h + 2), (x - 5, B - h + 2)]), STONE_D, 0.75, "wcs", g=True)
    ink(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), 2.0)
    ink(line([(x - 5, B - h - 12), (x + w + 5, B - h - 12), (x + w + 5, B - h + 2), (x - 5, B - h + 2), (x - 5, B - h - 12)]), 1.4, 0.7)
    if stone: coursing(x, B - h + 4, x + w, B - 48)
    for k in range(int((w - 20) / 12)):
        ink(line([(x + 6 + k * 12, B - h - 1), (x + 6 + k * 12, B - h + 3)]), 0.9, 0.5)
    for wx in range(int(x + 14), int(x + w - 26), 38):
        trimmed(wx, B - h + 22, 20, 30)
    eave_hatch(x, x + w, B - h + 2)
    wash(poly([(x + 10, B - 6), (x + 10, B - 42), (x + w - 10, B - 42), (x + w - 10, B - 6)]), "#5C5560", 0.6, "wcs", g=True)
    wash(poly([(x + 6, B - 46), (x + w - 6, B - 46), (x + w, B - 32), (x, B - 32)]), awning, 0.92, "wcs")
    ink(line([(x + 6, B - 46), (x + w - 6, B - 46), (x + w, B - 32), (x, B - 32), (x + 6, B - 46)]), 1.4, 0.75)
    for k in range(int(w / 16)):
        ink(line([(x + 10 + k * 16, B - 46), (x + 6 + k * 16, B - 32)]), 1.0, 0.45)
    return x + w

def foam(cx, cy, r):
    for k in range(5):
        a = random.uniform(-0.6, 0.6)
        add(f'<path d="M{cx - r * 1.6 + jit(6):.0f},{cy + 2 + k * 3:.0f} q{r * 0.8:.0f},{-6 - k:.0f} {r * 1.6 + k * 6:.0f},{jit(3):.0f}" stroke="#FCF9F2" stroke-width="{3.5 - k * 0.5:.1f}" fill="none" stroke-linecap="round" opacity="0.9"/>')
    ink(f"M{cx - r * 1.4:.0f},{cy + 8:.0f} q{r * 0.5:.0f},-8 {r:.0f},-2 q{r * 0.3:.0f},4 {r * 0.6:.0f},-3", 1.0, 0.45)

def chevron(cx, cy, r):
    for k in range(3):
        add(f'<path d="M{cx - r * (1.2 + k * 0.6):.0f},{cy + 6 + k * 7:.0f} L{cx - r * 2.4 - k * 10:.0f},{cy + 2 + k * 4:.0f}" stroke="#FCF9F2" stroke-width="{3 - k * 0.6:.1f}" stroke-linecap="round" opacity="0.85"/>')
        add(f'<path d="M{cx - r * (1.2 + k * 0.6):.0f},{cy + 6 + k * 7:.0f} L{cx - r * 2.0 - k * 8:.0f},{cy + 14 + k * 8:.0f}" stroke="#FCF9F2" stroke-width="{3 - k * 0.6:.1f}" stroke-linecap="round" opacity="0.85"/>')

def boulder(cx, cy, r, granite=False):
    foam(cx, cy, r); chevron(cx, cy, r)
    d = f"M{cx - r},{cy} C{cx - r},{cy - r * 0.9} {cx - r * 0.3},{cy - r * 1.1} {cx + r * 0.2},{cy - r * 1.05} C{cx + r * 0.9},{cy - r} {cx + r * 1.05},{cy - r * 0.4} {cx + r},{cy} Z"
    wash(d, "#B9AAA1" if granite else "#C87055", 0.94, "wcs")
    wash(f"M{cx - r},{cy} L{cx + r},{cy} L{cx + r},{cy - r * 0.15} L{cx - r},{cy - r * 0.15} Z", "#3F4E5C", 0.35, "wcs", g=True)  # wet rim
    wash(f"M{cx + r * 0.1},{cy - r * 1.02} C{cx + r * 0.9},{cy - r} {cx + r * 1.05},{cy - r * 0.4} {cx + r},{cy} L{cx},{cy} C{cx + r * 0.35},{cy - r * 0.5} {cx + r * 0.3},{cy - r * 0.8} {cx + r * 0.1},{cy - r * 1.02} Z", "#7F4536", 0.6, "wcs", g=True)
    ink(d, 1.8, 0.8)
    add(f'<path d="M{cx - r * 1.3:.0f},{cy + 3:.0f} q{r * 1.3:.0f},{r * 0.25:.0f} {r * 2.6:.0f},0" stroke="#FBF7EE" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>')

def brick_block(x, w, h, col, awning, cornice="#3F5E4A", arched=False):
    wash(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), col, 0.93, "wcs")
    wash(poly([(x + w * 0.72, B - h), (x + w, B - h), (x + w, B), (x + w * 0.72, B)]), STONE_D, 0.22, "wcs", g=True)
    wash(poly([(x - 4, B - h - 10), (x + w + 4, B - h - 10), (x + w + 4, B - h + 6), (x - 4, B - h + 6)]), cornice, 0.8, "wcs", g=True)
    ink(poly([(x, B), (x, B - h), (x + w, B - h), (x + w, B)]), 2.0)
    ink(line([(x - 4, B - h - 10), (x + w + 4, B - h - 10), (x + w + 4, B - h + 6), (x - 4, B - h + 6), (x - 4, B - h - 10)]), 1.3, 0.7)
    coursing(x, B - h + 8, x + w, B - 50, step=10)
    for wx in range(int(x + 14), int(x + w - 26), 36):
        if arched:
            add(f'<path d="M{wx - 4},{B - h + 62} L{wx - 4},{B - h + 30} a14,14 0 0,1 28,0 L{wx + 24},{B - h + 62} Z" fill="{PAPER}"/>')
            wash(f"M{wx},{B - h + 60} L{wx},{B - h + 32} a10,10 0 0,1 20,0 L{wx + 20},{B - h + 60} Z", WIN, 0.85, "wcs", g=True)
            ink(f"M{wx - 4},{B - h + 62} L{wx - 4},{B - h + 30} a14,14 0 0,1 28,0 L{wx + 24},{B - h + 62} Z", 1.2, 0.7)
        else:
            trimmed(wx, B - h + 24, 20, 32)
    wash(poly([(x + 10, B - 6), (x + 10, B - 42), (x + w - 10, B - 42), (x + w - 10, B - 6)]), "#5C5560", 0.6, "wcs", g=True)
    if awning:
        wash(f"M{x + 6},{B - 50} L{x + w - 6},{B - 50} L{x + w - 2},{B - 34} C{x + w * 0.5},{B - 28} {x + w * 0.5},{B - 28} {x + 2},{B - 34} Z", awning, 0.92, "wcs")
        ink(f"M{x + 6},{B - 50} L{x + w - 6},{B - 50} L{x + w - 2},{B - 34} C{x + w * 0.5},{B - 28} {x + w * 0.5},{B - 28} {x + 2},{B - 34} Z", 1.3, 0.75)
    return x + w

def finish(path):
    add(f'<rect width="{W}" height="{H}" filter="url(#blotch)" opacity="0.12" style="mix-blend-mode:multiply"/>')
    add(f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.22" style="mix-blend-mode:multiply"/>')
    add('</svg>')
    open(path, "w").write("\n".join(o))
    print("bytes", sum(len(s) + 1 for s in o))
