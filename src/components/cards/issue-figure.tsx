import { gaussian, mulberry32 } from "@/lib/quant/gbm";
import { normalPdf, straddleValue, studentTPdf, studentTVarEs } from "@/lib/quant/dist";
import { cn } from "@/lib/utils";

/**
 * Topic figures, chosen in content: per newsletter issue (`figure` in the MDX frontmatter) and per
 * project (`figure` in content/projects.json).
 */
export const ISSUE_FIGURES = [
  "tail-risk",
  "straddle",
  "prediction-spread",
  "alt-data",
  "factors",
  "pairs",
  "regimes",
  "momentum",
  "clusters",
  "deciles",
  "rates",
  "event-study",
  "vwap",
  "fund",
  "ongoing",
] as const;
export type IssueFigureKind = (typeof ISSUE_FIGURES)[number];

const W = 320;
const H = 180;
const PAD = 14;

/** Round to 0.1px so server and browser serialise identical attributes (no hydration drift). */
const r1 = (n: number) => Math.round(n * 10) / 10;

const path = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** Maps data ranges onto the figure box. */
function scales(x0: number, x1: number, y0: number, y1: number) {
  const sx = (x: number) => PAD + ((x - x0) / (x1 - x0)) * (W - 2 * PAD);
  const sy = (y: number) => H - PAD - ((y - y0) / (y1 - y0)) * (H - 2 * PAD);
  return { sx, sy };
}

const range = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

/** Fat-tailed returns (Student-t, ν = 4, unit variance) against the normal, with the 95% VaR tail. */
function TailRisk() {
  const nu = 4;
  const { var: v, scale } = studentTVarEs(0.05, nu);
  const t = (x: number) => studentTPdf(x / scale, nu) / scale;
  const { sx, sy } = scales(-4.5, 4.5, 0, 0.6);
  const xs = range(-4.5, 4.5, 181);
  const tail = xs.filter((x) => x <= -v);
  return (
    <>
      <path
        d={`${path(tail.map((x) => [sx(x), sy(t(x))]))} L${sx(-v)} ${sy(0)} L${sx(-4.5)} ${sy(0)} Z`}
        className="fill-current"
        fillOpacity={0.35}
      />
      <path
        d={path(xs.map((x) => [sx(x), sy(normalPdf(x))]))}
        fill="none"
        strokeDasharray="3 4"
        strokeOpacity={0.55}
      />
      <path d={path(xs.map((x) => [sx(x), sy(t(x))]))} fill="none" strokeWidth={1.75} />
      <line x1={r1(sx(-v))} x2={r1(sx(-v))} y1={r1(sy(0))} y2={r1(sy(0.5))} strokeOpacity={0.8} />
      <line x1={PAD} x2={r1(W - PAD)} y1={r1(sy(0))} y2={r1(sy(0))} strokeOpacity={0.35} />
    </>
  );
}

/** Long straddle: payoff at expiry and value six months out (σ = 30%), net of the premium paid. */
function Straddle() {
  const k = 100;
  const premium = straddleValue(k, k, 0.3, 0.5);
  const xs = range(55, 145, 91);
  const { sx, sy } = scales(55, 145, -premium - 4, 45 - premium);
  return (
    <>
      <line x1={PAD} x2={r1(W - PAD)} y1={r1(sy(0))} y2={r1(sy(0))} strokeOpacity={0.35} />
      <line
        x1={r1(sx(k))}
        x2={r1(sx(k))}
        y1={PAD}
        y2={r1(H - PAD)}
        strokeDasharray="2 4"
        strokeOpacity={0.35}
      />
      <path
        d={path(xs.map((s) => [sx(s), sy(straddleValue(s, k, 0.3, 0.5) - premium)]))}
        fill="none"
        strokeDasharray="3 4"
        strokeOpacity={0.6}
      />
      <path
        d={path(xs.map((s) => [sx(s), sy(Math.abs(s - k) - premium)]))}
        fill="none"
        strokeWidth={1.75}
      />
    </>
  );
}

/** One contract quoted on two venues: prices drift together to resolution, the gap is the trade. */
function PredictionSpread() {
  const g = gaussian(mulberry32(7));
  const n = 60;
  let p = 0.42;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < n; i++) {
    const left = 1 - i / (n - 1);
    p = Math.min(0.98, Math.max(0.05, p + 0.012 + 0.03 * g() * left));
    a.push(i === n - 1 ? 1 : p);
    b.push(i === n - 1 ? 1 : Math.min(0.99, Math.max(0.02, p + 0.07 * left + 0.015 * g())));
  }
  const { sx, sy } = scales(0, n - 1, 0, 1);
  const A = a.map((y, i) => [sx(i), sy(y)] as [number, number]);
  const B = b.map((y, i) => [sx(i), sy(y)] as [number, number]);
  return (
    <>
      <path
        d={`${path(A)} ${path([...B].reverse()).replace(/^M/, "L")} Z`}
        className="fill-current"
        fillOpacity={0.22}
        stroke="none"
      />
      <path d={path(B)} fill="none" strokeDasharray="3 4" strokeOpacity={0.65} />
      <path d={path(A)} fill="none" strokeWidth={1.75} />
      <line
        x1={PAD}
        x2={r1(W - PAD)}
        y1={r1(sy(1))}
        y2={r1(sy(1))}
        strokeDasharray="2 4"
        strokeOpacity={0.35}
      />
    </>
  );
}

/** Alternative data: a grid of observations (think parking lots from orbit) and the series they track. */
function AltData() {
  const g = gaussian(mulberry32(11));
  const cols = 18;
  const rows = 6;
  const fill = range(0.25, 0.8, cols).map((f) => Math.min(0.95, Math.max(0.05, f + 0.12 * g())));
  const { sx, sy } = scales(0, cols - 1, 0, 1);
  const dots = [];
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const on = r < Math.round(fill[c] * rows);
      dots.push(
        <circle
          key={`${c}-${r}`}
          cx={r1(sx(c))}
          cy={r1(H - PAD - 6 - r * 11)}
          r={2.6}
          className="fill-current"
          stroke="none"
          fillOpacity={on ? 0.75 : 0.15}
        />,
      );
    }
  return (
    <>
      {dots}
      <path
        d={path(fill.map((f, c) => [sx(c), sy(0.55 + 0.45 * f)]))}
        fill="none"
        strokeWidth={1.75}
      />
    </>
  );
}

/** Factor investing: returns against a factor exposure, with the fitted line. */
function Factors() {
  const g = gaussian(mulberry32(3));
  const pts = Array.from({ length: 46 }, () => {
    const x = g();
    return [x, 0.55 * x + 0.65 * g()] as [number, number];
  });
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const beta =
    pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) /
    pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const { sx, sy } = scales(-2.6, 2.6, -2.6, 2.6);
  return (
    <>
      <line x1={r1(sx(-2.6))} x2={r1(sx(2.6))} y1={r1(sy(0))} y2={r1(sy(0))} strokeOpacity={0.3} />
      <line x1={r1(sx(0))} x2={r1(sx(0))} y1={r1(sy(-2.6))} y2={r1(sy(2.6))} strokeOpacity={0.3} />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={r1(sx(x))}
          cy={r1(sy(y))}
          r={2.6}
          className="fill-current"
          stroke="none"
          fillOpacity={0.6}
        />
      ))}
      <path
        d={path([
          [sx(-2.4), sy(my + beta * (-2.4 - mx))],
          [sx(2.4), sy(my + beta * (2.4 - mx))],
        ])}
        fill="none"
        strokeWidth={1.75}
      />
    </>
  );
}

/** Seeded random walk with drift, n steps. */
function walk(seed: number, n: number, drift: number, vol: number) {
  const g = gaussian(mulberry32(seed));
  const out = [0];
  for (let i = 1; i < n; i++) out.push(out[i - 1] + drift + vol * g());
  return out;
}

/** Pairs trading: two cointegrated prices on top, their spread inside a ±1 band below. */
function Pairs() {
  const n = 70;
  const common = walk(11, n, 0.02, 0.18);
  const g = gaussian(mulberry32(12));
  // mean-reverting AR(1) spread
  const spread: number[] = [];
  for (let i = 0; i < n; i++) spread.push(0.82 * (spread[i - 1] ?? 0) + 0.42 * g());
  const sx = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD);
  const lo = Math.min(...common) - 1;
  const hi = Math.max(...common) + 1;
  const syT = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H * 0.55 - PAD);
  const syB = (v: number) => H * 0.62 + ((1.8 - v) / 3.6) * (H - PAD - H * 0.62);
  return (
    <>
      <path d={path(common.map((c, i) => [sx(i), syT(c + spread[i] * 0.5)]))} strokeWidth={1.75} />
      <path
        d={path(common.map((c, i) => [sx(i), syT(c - spread[i] * 0.5)]))}
        strokeOpacity={0.45}
      />
      {[1, -1].map((z) => (
        <line
          key={z}
          x1={PAD}
          x2={W - PAD}
          y1={r1(syB(z))}
          y2={r1(syB(z))}
          strokeOpacity={0.35}
          strokeDasharray="3 4"
        />
      ))}
      <path d={path(spread.map((v, i) => [sx(i), syB(v)]))} strokeOpacity={0.8} />
    </>
  );
}

/** Regimes: a cumulative return path over alternating shaded regimes. */
function Regimes() {
  const n = 80;
  const cuts = [0, 18, 34, 55, 68, n - 1];
  const g = gaussian(mulberry32(21));
  const pts: number[] = [0];
  for (let i = 1; i < n; i++) {
    const regime = cuts.findIndex((c) => i <= c) % 2;
    pts.push(pts[i - 1] + (regime ? 0.09 : -0.05) + 0.12 * g());
  }
  const { sx, sy } = scales(0, n - 1, Math.min(...pts) - 0.3, Math.max(...pts) + 0.3);
  return (
    <>
      {cuts
        .slice(0, -1)
        .map((c, k) =>
          k % 2 ? (
            <rect
              key={c}
              x={r1(sx(c))}
              y={PAD}
              width={r1(sx(cuts[k + 1]) - sx(c))}
              height={H - 2 * PAD}
              className="fill-current"
              stroke="none"
              fillOpacity={0.12}
            />
          ) : null,
        )}
      <path d={path(pts.map((v, i) => [sx(i), sy(v)]))} strokeWidth={1.75} />
    </>
  );
}

/** Momentum: a trending price and its slower moving average. */
function Momentum() {
  const n = 80;
  const p = walk(31, n, 0.06, 0.2);
  const ma = p.map((_, i) => {
    const w = p.slice(Math.max(0, i - 11), i + 1);
    return w.reduce((x, y) => x + y, 0) / w.length;
  });
  const { sx, sy } = scales(0, n - 1, Math.min(...p) - 0.2, Math.max(...p) + 0.2);
  return (
    <>
      <path d={path(p.map((v, i) => [sx(i), sy(v)]))} strokeOpacity={0.5} />
      <path d={path(ma.map((v, i) => [sx(i), sy(v)]))} strokeWidth={2} />
    </>
  );
}

/** Merge plan for the dendrogram: [leaf a, leaf b, height 0..1], bottom-up. */
const DENDRO: [number, number, number][] = [
  [0, 1, 0.22],
  [2, 3, 0.3],
  [4, 5, 0.18],
  [6, 7, 0.26],
  [8, 9, 0.34],
  [10, 11, 0.2],
  [0, 2, 0.5],
  [4, 6, 0.46],
  [8, 10, 0.55],
  [0, 4, 0.74],
  [0, 8, 0.9],
];

/** Factor zoo: a dendrogram merging characteristics into a few clusters below the cut line. */
function Clusters() {
  const leaves = 12;
  const x = (i: number) => PAD + 6 + (i * (W - 2 * PAD - 12)) / (leaves - 1);
  const y = (h: number) => r1(H - PAD - h * (H - 2 * PAD - 8));
  const nodes = Array.from({ length: leaves }, (_, i) => ({ x: x(i), h: 0 }));
  const segments = DENDRO.map(([a, b, h]) => {
    const [na, nb] = [nodes[a], nodes[b]];
    const node = { x: (na.x + nb.x) / 2, h };
    nodes[a] = node;
    nodes[b] = node;
    return { d: `M${r1(na.x)} ${y(na.h)} V${y(h)} H${r1(nb.x)} V${y(nb.h)}`, h };
  });
  return (
    <>
      <line
        x1={PAD}
        x2={W - PAD}
        y1={y(0.62)}
        y2={y(0.62)}
        strokeOpacity={0.35}
        strokeDasharray="3 4"
      />
      {segments.map((s, k) => (
        <path key={k} d={s.d} strokeOpacity={s.h > 0.62 ? 0.45 : 0.9} />
      ))}
    </>
  );
}

/** Decile portfolios: average returns from the most stable decile to the most volatile. */
function Deciles() {
  const vals = [1.07, 1.01, 1.19, 0.97, 0.52, 0.69, 0.47, 1.09, 0.2, -0.22];
  const { sx, sy } = scales(-0.6, 9.6, -0.5, 1.4);
  const bw = (sx(1) - sx(0)) * 0.62;
  return (
    <>
      <line x1={PAD} x2={W - PAD} y1={r1(sy(0))} y2={r1(sy(0))} strokeOpacity={0.4} />
      {vals.map((v, i) => (
        <rect
          key={i}
          x={r1(sx(i) - bw / 2)}
          y={r1(Math.min(sy(v), sy(0)))}
          width={r1(bw)}
          height={r1(Math.abs(sy(v) - sy(0)))}
          className="fill-current"
          stroke="none"
          fillOpacity={i === 0 || i === 9 ? 0.85 : 0.35}
        />
      ))}
    </>
  );
}

/** Interest rates: an observed yield curve and its forecast, dotted. */
function Rates() {
  const ts = range(0.25, 10, 30);
  const curve = (t: number, shift: number) =>
    10.4 + shift + 2.4 * (1 - Math.exp(-t / 2.2)) - 0.08 * t;
  const { sx, sy } = scales(0, 10, 9.6, 13.6);
  return (
    <>
      <path d={path(ts.map((t) => [sx(t), sy(curve(t, 0))]))} strokeWidth={1.75} />
      <path
        d={path(ts.map((t) => [sx(t), sy(curve(t, 0.9))]))}
        strokeOpacity={0.6}
        strokeDasharray="2 5"
      />
      {[0.5, 1, 2, 3, 5, 7, 10].map((t) => (
        <circle
          key={t}
          cx={r1(sx(t))}
          cy={r1(sy(curve(t, 0) + Math.sin(t * 3) * 0.12))}
          r={3}
          className="fill-current"
          stroke="none"
        />
      ))}
    </>
  );
}

/** Event study: cumulative abnormal return around an event day, with a confidence band. */
function EventStudy() {
  const ts = range(-20, 20, 41);
  const car = (t: number) => (t < 0 ? 0.0008 * (t + 20) : 0.016 + 0.027 * (1 - Math.exp(-t / 4)));
  const band = (t: number) => 0.004 + 0.0006 * Math.abs(t);
  const { sx, sy } = scales(-20, 20, -0.02, 0.06);
  const upper = ts.map((t) => [sx(t), sy(car(t) + band(t))] as [number, number]);
  const lower = [...ts].reverse().map((t) => [sx(t), sy(car(t) - band(t))] as [number, number]);
  return (
    <>
      <line
        x1={r1(sx(0))}
        x2={r1(sx(0))}
        y1={PAD}
        y2={H - PAD}
        strokeOpacity={0.4}
        strokeDasharray="3 4"
      />
      <line x1={PAD} x2={W - PAD} y1={r1(sy(0))} y2={r1(sy(0))} strokeOpacity={0.3} />
      <path
        d={`${path([...upper, ...lower])} Z`}
        className="fill-current"
        stroke="none"
        fillOpacity={0.14}
      />
      <path d={path(ts.map((t) => [sx(t), sy(car(t))]))} strokeWidth={2} />
    </>
  );
}

/** VWAP: an intraday price, its volume-weighted average, and volume bars underneath. */
function Vwap() {
  const n = 60;
  const p = walk(41, n, 0.005, 0.12);
  const v = Array.from(
    { length: n },
    (_, i) => 0.4 + 0.6 * Math.abs(Math.cos((i / n) * Math.PI)) * (0.6 + (0.4 * ((i * 7) % 5)) / 5),
  );
  const vwap: number[] = [];
  for (let i = 0, pv = 0, vv = 0; i < n; i++) {
    pv += p[i] * v[i];
    vv += v[i];
    vwap.push(pv / vv);
  }
  const lo = Math.min(...p) - 0.2;
  const hi = Math.max(...p) + 0.2;
  const sx = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD);
  const sy = (y: number) => PAD + ((hi - y) / (hi - lo)) * (H * 0.66 - PAD);
  const bw = ((W - 2 * PAD) / n) * 0.6;
  return (
    <>
      {v.map((x, i) => (
        <rect
          key={i}
          x={r1(sx(i) - bw / 2)}
          y={r1(H - PAD - x * 34)}
          width={r1(bw)}
          height={r1(x * 34)}
          className="fill-current"
          stroke="none"
          fillOpacity={0.3}
        />
      ))}
      <path d={path(p.map((x, i) => [sx(i), sy(x)]))} strokeOpacity={0.55} />
      <path d={path(vwap.map((x, i) => [sx(i), sy(x)]))} strokeWidth={2} />
    </>
  );
}

/** Simulated fund: a rising equity curve with the area underneath. */
function Fund() {
  const n = 64;
  const p = walk(51, n, 0.05, 0.16);
  const { sx, sy } = scales(0, n - 1, Math.min(...p) - 0.4, Math.max(...p) + 0.3);
  const line = path(p.map((v, i) => [sx(i), sy(v)]));
  return (
    <>
      <path
        d={`${line} L${r1(sx(n - 1))} ${H - PAD} L${r1(sx(0))} ${H - PAD} Z`}
        className="fill-current"
        stroke="none"
        fillOpacity={0.14}
      />
      <path d={line} strokeWidth={2} />
    </>
  );
}

/** Work in progress: a path drawn so far, then a dotted fan of where it may go. */
function Ongoing() {
  const n = 40;
  const p = walk(61, n, 0.03, 0.14);
  const last = p[n - 1];
  const { sx, sy } = scales(0, 70, -1.6, 2.6);
  return (
    <>
      <path d={path(p.map((v, i) => [sx(i), sy(v)]))} strokeWidth={2} />
      {[-0.9, -0.3, 0.3, 0.9].map((k) => (
        <path
          key={k}
          d={path(
            range(n - 1, 70, 12).map((t) => [
              sx(t),
              sy(last + k * Math.sqrt(t - n + 1) * 0.28 + 0.02 * (t - n + 1)),
            ]),
          )}
          strokeOpacity={0.4}
          strokeDasharray="2 5"
        />
      ))}
      <circle cx={r1(sx(n - 1))} cy={r1(sy(last))} r={3.5} className="fill-current" stroke="none" />
    </>
  );
}

const FIGURES: Record<IssueFigureKind, () => React.ReactElement> = {
  "tail-risk": TailRisk,
  straddle: Straddle,
  "prediction-spread": PredictionSpread,
  "alt-data": AltData,
  factors: Factors,
  pairs: Pairs,
  regimes: Regimes,
  momentum: Momentum,
  clusters: Clusters,
  deciles: Deciles,
  rates: Rates,
  "event-study": EventStudy,
  vwap: Vwap,
  fund: Fund,
  ongoing: Ongoing,
};

/**
 * Small line figure for an issue's topic, drawn from real formulas (Student-t vs normal, Black-
 * Scholes straddle) or seeded simulations. Illustrative only: never the issue's own data.
 */
export function IssueFigure({ kind, className }: { kind: IssueFigureKind; className?: string }) {
  const Figure = FIGURES[kind];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      // strokes keep their width when the figure is drawn small (archive thumbnails)
      className={cn("text-highlight [&_*]:[vector-effect:non-scaling-stroke]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Figure />
    </svg>
  );
}
