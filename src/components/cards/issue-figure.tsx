import { gaussian, mulberry32 } from "@/lib/quant/gbm";
import { normalPdf, straddleValue, studentTPdf, studentTVarEs } from "@/lib/quant/dist";
import { cn } from "@/lib/utils";

/** Topic figures for newsletter issues, chosen per issue in content (`figure` in the MDX frontmatter). */
export const ISSUE_FIGURES = [
  "tail-risk",
  "straddle",
  "prediction-spread",
  "alt-data",
  "factors",
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

const FIGURES: Record<IssueFigureKind, () => React.ReactElement> = {
  "tail-risk": TailRisk,
  straddle: Straddle,
  "prediction-spread": PredictionSpread,
  "alt-data": AltData,
  factors: Factors,
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
