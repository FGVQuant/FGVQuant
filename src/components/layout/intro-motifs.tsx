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
