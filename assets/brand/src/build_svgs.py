"""Generate FGV Quant SVG logo assets from bull_geometry.py. Run: python3 -I build_svgs.py (from this dir)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bull_geometry import nodes, edges, dots

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
STROKE, R = 17, 21
VB = (20, 22, 1010, 750)  # x, y, w, h
PURPLE, WHITE = "#230042", "#FFFFFF"
n = nodes()

def mark_group(color):
    lines = "".join(f'<line x1="{n[a][0]}" y1="{n[a][1]}" x2="{n[b][0]}" y2="{n[b][1]}"/>' for a, b in edges())
    circles = "".join(f'<circle cx="{n[k][0]}" cy="{n[k][1]}" r="{R}"/>' for k in dots())
    return (f'<g fill="none" stroke="{color}" stroke-width="{STROKE}" stroke-linecap="round" stroke-linejoin="round">{lines}</g>'
            f'<g fill="{color}">{circles}</g>')

def svg(vb, body, bg=None, title="FGV Quant"):
    x, y, w, h = vb
    rect = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{rect}{body}</svg>\n')

def write(name, content):
    with open(os.path.join(OUT, name), "w") as f: f.write(content)

# Bull mark variants
write("bull-mark.svg", svg(VB, mark_group("currentColor")))
write("bull-mark-white.svg", svg(VB, mark_group(WHITE)))
write("bull-mark-purple.svg", svg(VB, mark_group(PURPLE)))
# Square app icon / favicon: white bull on brand purple
pad = 160; x, y, w, h = VB; side = max(w, h) + 2 * pad
sq = (x - (side - w) / 2, y - (side - h) / 2, side, side)
write("icon-square.svg", svg(sq, f'<rect x="{sq[0]}" y="{sq[1]}" width="{side}" height="{side}" rx="{side*0.18}" fill="{PURPLE}"/>' + mark_group(WHITE)))

# Horizontal lockup. Text is outlined Lora 400 (lockup-text.json, produced by outline.mjs via opentype.js),
# so it renders identically without the font installed. Subtitle is scaled to the title's width, as in the original.
TEXT = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lockup-text.json")))
def lockup(color, bg=None):
    s = 0.9  # scale of mark inside lockup
    tx, tw = 1080, TEXT["title"]["width"]
    sub_k = tw / TEXT["subtitle"]["width"]
    text = (f'<g fill="{color}">'
            f'<path transform="translate({tx} 470)" d="{TEXT["title"]["d"]}"/>'
            f'<path transform="translate({tx} 700) scale({sub_k:.4f})" d="{TEXT["subtitle"]["d"]}"/></g>')
    body = f'<g transform="translate(20 60) scale({s})">{mark_group(color)}</g>' + text
    return svg((0, 0, round(tx + tw + 40), 800), body, bg)
write("lockup.svg", lockup("currentColor"))
write("lockup-white.svg", lockup(WHITE))
write("lockup-on-purple.svg", lockup(WHITE, PURPLE))

# Geometry export for the Monte Carlo hero animation (normalized 0..1 in the mark viewBox)
x, y, w, h = VB
geo = {
    "viewBox": VB,
    "nodes": {k: [round((v[0] - x) / w, 4), round((v[1] - y) / h, 4)] for k, v in n.items()},
    "edges": edges(), "dots": dots(),
}
write("bull-geometry.json", json.dumps(geo, indent=1))
print("ok")

# Raster icons rendered straight from geometry (Pillow, 4x supersampled) — avoids renderer quirks.
def render_icon(size, rounded=True, ss=4):
    from PIL import Image, ImageDraw
    S = size * ss
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rgb = tuple(int(PURPLE[i:i + 2], 16) for i in (1, 3, 5))
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.18) if rounded else 0, fill=rgb + (255,))
    k = S / sq[2]
    T = lambda p: ((p[0] - sq[0]) * k, (p[1] - sq[1]) * k)
    sw, r = STROKE * k, R * k
    for a, b in edges():
        d.line([T(n[a]), T(n[b])], fill="white", width=max(1, round(sw)))
    for p in [n[a] for e in edges() for a in e]:  # round caps/joins
        cx, cy = T(p); d.ellipse([cx - sw / 2, cy - sw / 2, cx + sw / 2, cy + sw / 2], fill="white")
    for kk in dots():
        cx, cy = T(n[kk]); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="white")
    return im.resize((size, size), Image.LANCZOS)

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "png"), exist_ok=True)
    render_icon(512).save(os.path.join(OUT, "png", "icon-512.png"))
    render_icon(180, rounded=False).save(os.path.join(OUT, "png", "apple-icon-180.png"))  # iOS applies its own mask
    render_icon(48).save(os.path.join(OUT, "png", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("png ok")
