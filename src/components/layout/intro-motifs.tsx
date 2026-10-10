import type { ReactNode } from "react";
import { BullMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Page-intro signature motifs: one line-art graphic per inner page,
   drawn in currentColor at low opacity (same style as area-backgrounds).
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

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

/** Newsletter: twelve slim bars for the year, filled where an issue exists. */
export function PublishedMonthsMotif({
  year,
  months,
  latest,
  className,
}: {
  year: number;
  /** months (1–12) that have a published issue */
  months: number[];
  /** month (1–12) of the latest issue */
  latest: number;
  className?: string;
}) {
  const published = new Set(months);
  return (
    <Frame className={className}>
      <line x1="20" y1="150" x2="310" y2="150" stroke="currentColor" strokeOpacity="0.25" />
      {MONTHS.map((label, i) => {
        const m = i + 1;
        const x = 28 + i * 24;
        const on = published.has(m);
        const isLatest = m === latest;
        const h = isLatest ? 110 : on ? 80 : 26;
        return (
          <g key={m}>
            <rect
              x={x}
              y={150 - h}
              width="10"
              height={h}
              rx="2"
              stroke="currentColor"
              strokeOpacity={on ? 0.5 : 0.2}
              fill="currentColor"
              fillOpacity={isLatest ? 0.85 : on ? 0.35 : 0}
            />
            <text
              x={x + 5}
              y="168"
              textAnchor="middle"
              className="fill-current font-mono"
              fontSize="10"
              fillOpacity={on ? 0.7 : 0.35}
            >
              {label}
            </text>
          </g>
        );
      })}
      <text
        x="310"
        y="188"
        textAnchor="end"
        className="fill-current font-mono"
        fontSize="11"
        fillOpacity="0.5"
      >
        {year}
      </text>
    </Frame>
  );
}

/** Time: a root box over N child boxes joined by elbow lines (no text). */
export function OrgChartMotif({ seats, className }: { seats: number; className?: string }) {
  const n = Math.max(seats - 1, 0);
  const w = Math.min(70, (290 - (n - 1) * 14) / Math.max(n, 1));
  const gap = 14;
  const total = n * w + (n - 1) * gap;
  const x0 = 175 - total / 2;
  const centers = Array.from({ length: n }, (_, i) => x0 + i * (w + gap) + w / 2);
  return (
    <Frame className={className}>
      <g stroke="currentColor">
        <rect x="135" y="30" width="80" height="34" rx="5" strokeOpacity="0.85" strokeWidth="2" />
        {n > 0 ? (
          <path
            d={`M175 64 V96 M${centers[0]} 96 H${centers[n - 1]} ${centers
              .map((c) => `M${c} 96 V126`)
              .join(" ")}`}
            strokeOpacity="0.35"
          />
        ) : null}
        {centers.map((c) => (
          <rect key={c} x={c - w / 2} y="126" width={w} height="34" rx="5" strokeOpacity="0.45" />
        ))}
      </g>
    </Frame>
  );
}

/** Capital: a generic Monte-Carlo-style fan of paths from one origin. */
const FAN_ENDS = [28, 52, 76, 98, 118, 138, 158, 178, 200] as const;

export function SimulationFanMotif({ className }: { className?: string }) {
  const ox = 30;
  const oy = 110;
  const path = (endY: number, k: number) => {
    // smooth cubic with a small per-path wobble so the fan reads as simulated paths
    const wob = ((k * 37) % 17) - 8;
    return `M${ox} ${oy} C 100 ${oy + wob} 190 ${(oy + endY) / 2 + wob * 1.5} 300 ${endY}`;
  };
  return (
    <Frame className={className}>
      <path
        d={`M${ox} ${oy} C 100 ${oy - 14} 190 66 300 54 L300 166 C 190 152 100 ${oy + 14} ${ox} ${oy} Z`}
        fill="currentColor"
        fillOpacity="0.07"
      />
      <g stroke="currentColor" strokeOpacity="0.3">
        {FAN_ENDS.map((y, k) => (
          <path key={y} d={path(y, k)} />
        ))}
      </g>
      <path d={path(FAN_ENDS[4], 4)} stroke="currentColor" strokeOpacity="0.85" strokeWidth="2" />
      <circle cx={ox} cy={oy} r="5" fill="currentColor" fillOpacity="0.9" />
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

/** Eventos: dots on a line, placed proportionally by date; same-date events stack. */
export function MilestonesMotif({ dates, className }: { dates: string[]; className?: string }) {
  if (dates.length === 0) return <Frame className={className}>{null}</Frame>;
  // position by fractional year ("2026-08-01" → 2026.58) so events in the same year separate
  const ts = dates.map((d) => Number(d.slice(0, 4)) + (Number(d.slice(5, 7) || 1) - 1) / 12);
  const first = Math.min(...ts);
  const last = Math.max(...ts);
  const span = Math.max(last - first, 1);
  const x1 = 40;
  const x2 = 290;
  const seen = new Map<number, number>();
  const dots = ts.map((t) => {
    const dup = seen.get(t) ?? 0;
    seen.set(t, dup + 1);
    // events on the same date stack upward above the line
    return { t, x: x1 + ((t - first) / span) * (x2 - x1), cy: 100 - Math.min(dup, 4) * 16 };
  });
  return (
    <Frame className={className}>
      <line x1={x1 - 10} y1="100" x2={x2 + 10} y2="100" stroke="currentColor" strokeOpacity="0.3" />
      {dots.map((d, i) => {
        const key = d.t === last;
        return (
          <circle
            key={i}
            cx={d.x}
            cy={d.cy}
            r={key ? 6 : 4.5}
            fill="currentColor"
            fillOpacity={key ? 0.9 : 0.5}
          />
        );
      })}
      <text
        x={x1}
        y="136"
        textAnchor="middle"
        className="fill-current font-mono"
        fontSize="11"
        fillOpacity="0.6"
      >
        {Math.floor(first)}
      </text>
      {Math.floor(last) !== Math.floor(first) ? (
        <text
          x={x2}
          y="136"
          textAnchor="middle"
          className="fill-current font-mono"
          fontSize="11"
          fillOpacity="0.6"
        >
          {Math.floor(last)}
        </text>
      ) : null}
    </Frame>
  );
}

/** Processo seletivo: three paths converging on one node. Symbolic. */
export function ConvergingPathsMotif({ className }: { className?: string }) {
  const ends = [30, 100, 170];
  return (
    <Frame className={className}>
      <g stroke="currentColor" strokeOpacity="0.35">
        {ends.map((y) => (
          <path key={y} d={`M20 ${y} C 140 ${y} 180 100 270 100`} />
        ))}
      </g>
      <g fill="currentColor">
        {ends.map((y) => (
          <circle key={y} cx="20" cy={y} r="4" fillOpacity="0.45" />
        ))}
      </g>
      <circle cx="270" cy="100" r="16" stroke="currentColor" strokeOpacity="0.45" />
      <circle cx="270" cy="100" r="8" fill="currentColor" fillOpacity="0.9" />
    </Frame>
  );
}

/** Parceiros: the league (two nodes) linked to three companies. Symbolic. */
export function ConnectionMotif({ className }: { className?: string }) {
  const league = [
    { x: 60, y: 76 },
    { x: 60, y: 124 },
  ];
  const partners = [
    { x: 260, y: 36 },
    { x: 260, y: 100 },
    { x: 260, y: 164 },
  ];
  return (
    <Frame className={className}>
      <g stroke="currentColor" strokeOpacity="0.25">
        <line x1={league[0].x} y1={league[0].y} x2={league[1].x} y2={league[1].y} />
        {league.flatMap((a) =>
          partners.map((b) => <line key={`${a.y}-${b.y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />),
        )}
      </g>
      {league.map((p) => (
        <circle key={p.y} cx={p.x} cy={p.y} r="9" fill="currentColor" fillOpacity="0.85" />
      ))}
      {partners.map((p) => (
        <circle
          key={p.y}
          cx={p.x}
          cy={p.y}
          r="8"
          stroke="currentColor"
          strokeOpacity="0.45"
          fill="currentColor"
          fillOpacity="0.1"
        />
      ))}
    </Frame>
  );
}
