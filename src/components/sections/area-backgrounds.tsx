import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Area card backgrounds: one recognisable image per area, drawn in
   currentColor at low opacity. Illustrative only, never real data.
   Composed for a 360×200 box anchored top-right ("meet"), so the
   graphic stays clear of the title and description at bottom-left.
   ------------------------------------------------------------------ */

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 360 200"
      preserveAspectRatio="xMaxYMin meet"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Derivatives: call and put payoff "hockey sticks" meeting at the strike. */
export function PayoffBg({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <g stroke="currentColor">
        <line x1="40" y1="130" x2="340" y2="130" strokeOpacity="0.25" />
        <line x1="200" y1="28" x2="200" y2="138" strokeOpacity="0.3" strokeDasharray="3 4" />
        <path d="M40 130 H200 L340 36" strokeOpacity="0.75" strokeWidth="2" />
        <path d="M60 36 L200 130 H340" strokeOpacity="0.3" strokeWidth="1.5" />
      </g>
      <text x="196" y="154" className="fill-current font-mono" fontSize="12" fillOpacity="0.6">
        K
      </text>
    </Frame>
  );
}

const NET_LAYERS: ReadonlyArray<{ x: number; ys: readonly number[]; r: number; o: number }> = [
  { x: 170, ys: [30, 70, 110, 150], r: 5, o: 0.45 },
  { x: 245, ys: [22, 62, 102, 142], r: 5, o: 0.6 },
  { x: 320, ys: [62, 102], r: 6, o: 0.85 },
];

/** Machine learning: a small fully connected neural network. */
export function NeuralNetBg({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <g stroke="currentColor" strokeOpacity="0.2">
        {NET_LAYERS.slice(1).flatMap((layer, li) =>
          NET_LAYERS[li].ys.flatMap((y1) =>
            layer.ys.map((y2) => (
              <line key={`${li}-${y1}-${y2}`} x1={NET_LAYERS[li].x} y1={y1} x2={layer.x} y2={y2} />
            )),
          ),
        )}
      </g>
      <g fill="currentColor">
        {NET_LAYERS.flatMap((layer) =>
          layer.ys.map((y) => (
            <circle key={`${layer.x}-${y}`} cx={layer.x} cy={y} r={layer.r} fillOpacity={layer.o} />
          )),
        )}
      </g>
    </Frame>
  );
}

// [wickTop, wickBottom, bodyTop, bodyHeight, rising]
const XO_CANDLES: ReadonlyArray<readonly [number, number, number, number, boolean]> = [
  [70, 104, 76, 20, false],
  [78, 112, 86, 18, false],
  [84, 116, 90, 18, false],
  [74, 108, 80, 20, true],
  [62, 96, 68, 20, true],
  [56, 88, 62, 18, true],
  [44, 78, 50, 20, true],
  [38, 70, 44, 18, true],
  [30, 62, 36, 18, true],
  [24, 56, 30, 18, true],
  [20, 50, 26, 16, true],
];

/** Algorithmic trading: candles with a fast/slow moving-average crossover and a buy signal. */
export function CrossoverBg({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <g stroke="currentColor" fill="currentColor">
        {XO_CANDLES.map(([wt, wb, bt, bh, up], i) => {
          const x = 104 + i * 22;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={wt} y2={wb} strokeOpacity="0.35" />
              <rect
                x={x - 6}
                y={bt}
                width="12"
                height={bh}
                rx="2"
                fillOpacity={up ? 0.35 : 0.1}
                strokeOpacity="0.45"
              />
            </g>
          );
        })}
        {/* slow average (dashed), then the fast one crossing above it at x≈194, where the buy marker sits */}
        <path
          d="M100 86 C160 92 200 86 240 76 S300 54 340 48"
          fill="none"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d="M100 100 C150 108 190 86 230 70 S300 40 340 32"
          fill="none"
          strokeOpacity="0.8"
          strokeWidth="1.8"
        />
        <path d="M187 114 l7 -10 l7 10 z" stroke="none" fillOpacity="0.9" />
      </g>
    </Frame>
  );
}

/* Efficient frontier: σ(μ) = √(σ²min + k(μ − μmv)²), plotted in σ/μ space. */
const SIG_MIN = 0.1;
const MU_MV = 0.06;
const K = 4;
const RF = 0.03;
const sigma = (mu: number) => Math.sqrt(SIG_MIN ** 2 + K * (mu - MU_MV) ** 2);
const px = (s: number) => 110 + (s / 0.3) * 230;
const py = (m: number) => 150 - (m / 0.18) * 130;

const MUS = Array.from({ length: 41 }, (_, i) => 0.035 + i * 0.003);
const FRONTIER = MUS.map((m) => `${px(sigma(m)).toFixed(1)} ${py(m).toFixed(1)}`).join(" L");
// Tangency portfolio: the frontier point with the highest Sharpe ratio against RF.
const TANGENT_MU = MUS.reduce((best, m) =>
  (m - RF) / sigma(m) > (best - RF) / sigma(best) ? m : best,
);
const CML_SLOPE = (TANGENT_MU - RF) / sigma(TANGENT_MU);
const CML_END_SIG = 0.29;
// Individual portfolios scattered inside the frontier (deterministic).
const CLOUD = Array.from({ length: 14 }, (_, i) => {
  const m = 0.05 + ((i * 0.0073) % 0.09);
  return [px(sigma(m) + 0.015 + ((i * 37) % 7) * 0.012), py(m)] as const;
});

/** Quantitative research: Markowitz efficient frontier with the capital market line. */
export function FrontierBg({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      <g stroke="currentColor">
        <line x1="110" y1="150" x2="345" y2="150" strokeOpacity="0.25" />
        <line x1="110" y1="150" x2="110" y2="18" strokeOpacity="0.25" />
        <path d={`M${FRONTIER}`} strokeOpacity="0.75" strokeWidth="2" />
        <line
          x1={px(0)}
          y1={py(RF)}
          x2={px(CML_END_SIG)}
          y2={py(RF + CML_SLOPE * CML_END_SIG)}
          strokeOpacity="0.35"
          strokeDasharray="4 4"
        />
      </g>
      <g fill="currentColor" fillOpacity="0.35">
        {CLOUD.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" />
        ))}
      </g>
      <circle
        cx={px(sigma(TANGENT_MU))}
        cy={py(TANGENT_MU)}
        r="4.5"
        fill="currentColor"
        fillOpacity="0.9"
      />
    </Frame>
  );
}

const CODE: ReadonlyArray<readonly [string, number]> = [
  ["import pandas as pd", 0.55],
  ['df = pd.read_csv("ibov.csv")', 0.35],
  ["ret = df.close.pct_change()", 0.35],
  ["ret.rolling(21).std()", 0.22],
];

/** Python & data: a faint pandas snippet (illustrative code, not real output). */
export function CodeBg({ className }: { className?: string }) {
  return (
    <Frame className={className}>
      {/* SVG text, like EquationBg: pure decoration that HTML contrast checkers would misflag. */}
      <g className="fill-current font-mono" fontSize="13">
        {CODE.map(([line, o], i) => (
          <g key={i}>
            <text x="112" y={36 + i * 24} fillOpacity="0.3">
              {i + 1}
            </text>
            <text x="128" y={36 + i * 24} fillOpacity={o}>
              {line}
            </text>
          </g>
        ))}
      </g>
    </Frame>
  );
}

const BY_AREA: Record<string, (props: { className?: string }) => ReactNode> = {
  derivatives: PayoffBg,
  ml: NeuralNetBg,
  algo: CrossoverBg,
  research: FrontierBg,
  python: CodeBg,
};

/** The single area → background mapping, shared by Home and Sobre. */
export function AreaBackground({ id, className }: { id: string; className?: string }) {
  const Bg = BY_AREA[id];
  return Bg ? <Bg className={className} /> : null;
}
