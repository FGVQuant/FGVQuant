"""Hand-traced geometry of the FGV Quant bull mark (coords in a 1060x800 space, symmetric about x=525)."""
C = 525
def m(p): return (2 * C - p[0], p[1])

# left-half nodes; right half is mirrored
L = {
    "hornTip": (150, 48), "hornOut": (45, 255), "hornBase": (95, 400),
    "ear": (110, 290), "brow": (375, 195), "cheek": (295, 395), "eye": (450, 475),
    "jaw": (387, 612), "mid": (425, 530), "chin": (398, 715),
    "nosA": (340, 472), "nosB": (392, 490), "nosC": (368, 552),
}
CENTER = {"crown": (C, 250), "snout": (C, 620), "base": (C, 745)}
DOTS = ["ear", "brow", "cheek", "eye"]  # nodes drawn as filled dots (mirrored too)
DOTS_CENTER = ["crown"]

HALF_EDGES = [
    ("hornTip", "hornOut"), ("hornOut", "hornBase"), ("hornTip", "ear"), ("ear", "hornBase"),
    ("hornBase", "cheek"), ("ear", "brow"), ("ear", "cheek"), ("brow", "cheek"),
    ("brow", "crown"), ("crown", "cheek"), ("cheek", "eye"), ("mid", "snout"),
    ("cheek", "jaw"), ("eye", "mid"), ("mid", "jaw"), ("jaw", "chin"), ("chin", "snout"), ("chin", "base"),
    ("nosA", "nosB"), ("nosB", "nosC"),
]
CENTER_EDGES = [("crown", "snout"), ("snout", "base")]

def nodes():
    n = dict(CENTER)
    for k, v in L.items():
        n["L_" + k] = v
        n["R_" + k] = m(v)
    return n

def resolve(name, side):
    return name if name in CENTER else f"{side}_{name}"

def edges():
    e = list(CENTER_EDGES)
    for side in ("L", "R"):
        e += [(resolve(a, side), resolve(b, side)) for a, b in HALF_EDGES]
    return e

def dots():
    return DOTS_CENTER + [f"{s}_{d}" for s in ("L", "R") for d in DOTS]
