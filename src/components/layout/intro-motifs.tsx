import type { ReactNode } from "react";
import { BullMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Page-intro signature motifs for the pages where an image carries
   meaning (Sobre, Capital, Competições); other intros get PageIntro's
   dot spotlight instead. Drawn in currentColor at low opacity (same
   style as area-backgrounds).
   Static and decorative; PageIntro supplies the colour, mask and
   placement. Illustrative only: no axes, no figures, no real data.
   Composed for a 320×200 box, right-aligned and vertically centred.
   ------------------------------------------------------------------ */

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMaxYMid meet"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Sobre: the brand bull mark, large and faint. */
export function BullMotif({ className }: { className?: string }) {
  return <BullMark className={cn("h-full w-full opacity-45", className)} />;
}

/**
 * Capital: the fund's two strategies. Top, a pair of prices that move together, drift apart
 * (shaded spread, entry dot) and converge again (exit ring): Pairs Trading. Bottom, a ranked
 * row of momentum scores: the strongest bought (solid), the weakest sold (outlined).
 */
const PAIR_STEPS = 56;
const PAIR_X0 = 24;
const PAIR_X1 = 304;
/** spread between the two prices: ~0, widens in the middle, closes again */
const spreadAt = (u: number) => 26 * Math.exp(-(((u - 0.52) / 0.16) ** 2));
const trendAt = (u: number) =>
  78 - 22 * u + 7 * Math.sin(u * 9.5) + 3 * Math.sin(u * 23 + 1) + 1.6 * Math.sin(u * 61);
const MOMENTUM_SCORES = [30, 25, 21, 17, 13, 9, 5, 2, -2, -6, -10, -14, -18, -23] as const;

export function StrategiesMotif({ className }: { className?: string }) {
  const xs = Array.from({ length: PAIR_STEPS + 1 }, (_, i) => i / PAIR_STEPS);
  const px = (u: number) => PAIR_X0 + u * (PAIR_X1 - PAIR_X0);
  const a = xs.map((u) => [px(u), trendAt(u) - spreadAt(u) / 2] as const);
  const b = xs.map(
    (u) => [px(u), trendAt(u) + spreadAt(u) / 2 + 1.2 * Math.sin(u * 47 + 2)] as const,
  );
  const line = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const open = Math.round(PAIR_STEPS * 0.36);
  const close = Math.round(PAIR_STEPS * 0.7);
  const band = `${line(a.slice(open, close + 1))}L${[...b.slice(open, close + 1)]
    .reverse()
    .map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("L")}Z`;
  const mid = (i: number) => (a[i][1] + b[i][1]) / 2;

  const base = 162;
  const barW = 14;
  const gap = (PAIR_X1 - PAIR_X0 - barW * MOMENTUM_SCORES.length) / (MOMENTUM_SCORES.length - 1);
  const ends = 4; // names per leg drawn as long (solid) / short (outlined)

  return (
    <Frame className={className}>
      {/* Pairs Trading */}
      <path d={band} fill="currentColor" fillOpacity="0.14" />
      <path d={line(a)} stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />
      <path d={line(b)} stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <line
        x1={a[open][0]}
        x2={a[open][0]}
        y1={a[open][1] - 4}
        y2={b[open][1] + 4}
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeDasharray="2 3"
      />
      <circle cx={a[open][0]} cy={mid(open)} r="4" fill="currentColor" fillOpacity="0.9" />
      <circle
        cx={a[close][0]}
        cy={mid(close)}
        r="4"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="1.5"
      />

      {/* Momentum */}
      <line
        x1={PAIR_X0 - 6}
        x2={PAIR_X1 + 6}
        y1={base}
        y2={base}
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      {MOMENTUM_SCORES.map((s, i) => {
        const long = i < ends;
        const short = i >= MOMENTUM_SCORES.length - ends;
        return (
          <rect
            key={i}
            x={PAIR_X0 + i * (barW + gap)}
            y={s > 0 ? base - s : base}
            width={barW}
            height={Math.abs(s)}
            rx="2"
            fill="currentColor"
            fillOpacity={long ? 0.75 : short ? 0.06 : 0.16}
            stroke={short ? "currentColor" : undefined}
            strokeOpacity={short ? 0.7 : undefined}
          />
        );
      })}
    </Frame>
  );
}

/** Competições: a 2–1–3 podium with small mono ranks. */
export function PodiumMotif({
  highlight,
  className,
}: {
  highlight?: 1 | 2 | 3;
  className?: string;
}) {
  const blocks = [
    { rank: 2, x: 70, h: 70 },
    { rank: 1, x: 140, h: 100 },
    { rank: 3, x: 210, h: 50 },
  ] as const;
  return (
    <Frame className={className}>
      <line x1="40" y1="160" x2="290" y2="160" stroke="currentColor" strokeOpacity="0.25" />
      {blocks.map((b) => {
        const on = highlight === b.rank;
        return (
          <g key={b.rank}>
            <rect
              x={b.x}
              y={160 - b.h}
              width="60"
              height={b.h}
              rx="3"
              stroke="currentColor"
              strokeOpacity={on ? 0.9 : 0.4}
              strokeWidth={on ? 2 : 1}
              fill="currentColor"
              fillOpacity={on ? 0.22 : 0.05}
            />
            <text
              x={b.x + 30}
              y={160 - b.h + 24}
              textAnchor="middle"
              className="fill-current font-mono"
              fontSize="16"
              fillOpacity={on ? 0.95 : 0.5}
            >
              {b.rank}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}
