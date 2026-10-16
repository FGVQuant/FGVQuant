"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BentoGlow } from "./bento-glow";

/**
 * Interactive three-set Venn diagram: Tecnologia, Finanças and Modelagem, with "Quant" at the
 * centre. Hovering (or tapping) any of the seven regions lights it up and shows its description
 * in the side panel; the region buttons do the same for keyboard and touch users.
 * Hit-testing is geometric (which circles contain the pointer), so every region is exact.
 */
export type VennSet = "tech" | "finance" | "model";
export type VennRegionId =
  "tech" | "finance" | "model" | "techFinance" | "techModel" | "financeModel" | "core";

export type VennRegionCopy = {
  name: string;
  description: string;
  /** Topics listed inside a single set's circle (intersections have none). */
  items?: string[];
};

export type QuantVennProps = {
  regions: Record<VennRegionId, VennRegionCopy>;
  labels: {
    /** Panel eyebrows, by region kind. */
    area: string;
    intersection: string;
    core: string;
    /** Accessible name for the diagram and the region buttons group. */
    diagram: string;
    explore: string;
  };
  className?: string;
};

/** viewBox size; circles sit on an equilateral triangle with side 220. */
const W = 760;
const H = 665;
const R = 175;
const CIRCLES: Record<VennSet, { cx: number; cy: number }> = {
  tech: { cx: 270, cy: 240 },
  finance: { cx: 490, cy: 240 },
  model: { cx: 380, cy: 430.5 },
};
const SETS: VennSet[] = ["tech", "finance", "model"];

/** Sets each region lies inside (it lies outside the rest). */
const REGION_SETS: Record<VennRegionId, VennSet[]> = {
  tech: ["tech"],
  finance: ["finance"],
  model: ["model"],
  techFinance: ["tech", "finance"],
  techModel: ["tech", "model"],
  financeModel: ["finance", "model"],
  core: ["tech", "finance", "model"],
};
const ORDER: VennRegionId[] = [
  "core",
  "tech",
  "finance",
  "model",
  "techFinance",
  "techModel",
  "financeModel",
];

/** Set titles sit outside the circles; region labels sit in each intersection. */
const TITLE_POS: Record<VennSet, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  tech: { x: 80, y: 48, anchor: "start" },
  finance: { x: 680, y: 48, anchor: "end" },
  model: { x: 380, y: 650, anchor: "middle" },
};
const LABEL_POS: Partial<Record<VennRegionId, { x: number; y: number }>> = {
  techFinance: { x: 380, y: 180 },
  techModel: { x: 292, y: 356 },
  financeModel: { x: 470, y: 356 },
  core: { x: 380, y: 300 },
};
/** Where each set's topic list is centred, inside the part of the circle no other set covers. */
const ITEMS_POS: Record<VennSet, { x: number; y: number }> = {
  tech: { x: 200, y: 205 },
  finance: { x: 560, y: 205 },
  model: { x: 380, y: 512 },
};
const ITEM_LINE = 25;
const LABEL_LINE = 19;

function regionAt(x: number, y: number): VennRegionId | null {
  const inside = SETS.filter((s) => Math.hypot(x - CIRCLES[s].cx, y - CIRCLES[s].cy) <= R);
  if (inside.length === 0) return null;
  return ORDER.find((id) => {
    const sets = REGION_SETS[id];
    return sets.length === inside.length && sets.every((s) => inside.includes(s));
  })!;
}

export function QuantVenn({ regions, labels, className }: QuantVennProps) {
  const [hovered, setHovered] = useState<VennRegionId | null>(null);
  const [selected, setSelected] = useState<VennRegionId>("core");
  const active = hovered ?? selected;
  const activeSets = REGION_SETS[active];
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = (s: VennSet) => `${uid}-clip-${s}`;
  const maskId = (id: VennRegionId) => `${uid}-mask-${id}`;

  function toRegion(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return regionAt(p.x, p.y);
  }

  const kind = (id: VennRegionId) =>
    id === "core" ? labels.core : REGION_SETS[id].length === 2 ? labels.intersection : labels.area;
  const current = regions[active];
  // A set lists its topics; an intersection lists the sets it combines.
  const chips = current.items ?? activeSets.map((s) => regions[s].name);

  return (
    <div
      className={cn(
        "group relative isolate grid gap-8 overflow-hidden rounded-2xl border border-border bg-card/60 p-4 transition-colors duration-300 hover:border-border-strong sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-12",
        className,
      )}
    >
      <BentoGlow />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={labels.diagram}
        className="h-auto w-full touch-manipulation select-none"
        onPointerMove={(e) => setHovered(toRegion(e))}
        onPointerLeave={() => setHovered(null)}
        onClick={(e) => {
          const id = toRegion(e);
          if (id) setSelected(id);
        }}
      >
        <defs>
          {SETS.map((s) => (
            <clipPath key={s} id={clipId(s)}>
              <circle cx={CIRCLES[s].cx} cy={CIRCLES[s].cy} r={R} />
            </clipPath>
          ))}
          {ORDER.map((id) => (
            <mask
              key={id}
              id={maskId(id)}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={W}
              height={H}
            >
              <rect width={W} height={H} fill="white" />
              {SETS.filter((s) => !REGION_SETS[id].includes(s)).map((s) => (
                <circle key={s} cx={CIRCLES[s].cx} cy={CIRCLES[s].cy} r={R} fill="black" />
              ))}
            </mask>
          ))}
        </defs>

        {/* faint base wash per circle */}
        {SETS.map((s) => (
          <circle
            key={s}
            cx={CIRCLES[s].cx}
            cy={CIRCLES[s].cy}
            r={R}
            className="fill-highlight/[0.04]"
          />
        ))}

        {/* region highlights: clip to the region's sets, mask out the others */}
        {ORDER.map((id) => {
          const rect = (
            <rect
              width={W}
              height={H}
              className={cn(
                "fill-highlight transition-opacity duration-300 motion-reduce:transition-none",
                id === active ? (id === "core" ? "opacity-45" : "opacity-30") : "opacity-0",
              )}
            />
          );
          const clipped = REGION_SETS[id].reduceRight(
            (child, s) => <g clipPath={`url(#${clipId(s)})`}>{child}</g>,
            rect,
          );
          return (
            <g key={id} mask={`url(#${maskId(id)})`}>
              {clipped}
            </g>
          );
        })}

        {/* outlines */}
        {SETS.map((s) => (
          <circle
            key={s}
            cx={CIRCLES[s].cx}
            cy={CIRCLES[s].cy}
            r={R}
            fill="none"
            className={cn(
              "stroke-highlight transition-[stroke-opacity,stroke-width] duration-300 motion-reduce:transition-none",
              activeSets.includes(s)
                ? "[stroke-width:2] [stroke-opacity:0.95]"
                : "[stroke-width:1.25] [stroke-opacity:0.35]",
            )}
          />
        ))}

        {/* set titles */}
        {SETS.map((s) => (
          <text
            key={s}
            x={TITLE_POS[s].x}
            y={TITLE_POS[s].y}
            textAnchor={TITLE_POS[s].anchor}
            className={cn(
              "fill-foreground font-display text-[30px] font-medium transition-opacity duration-300 motion-reduce:transition-none max-sm:text-[38px]",
              activeSets.includes(s) ? "opacity-100" : "opacity-50",
            )}
          >
            {regions[s].name}
          </text>
        ))}

        {/* topics inside each circle (hidden on small screens, where the panel lists them) */}
        {SETS.map((s) => {
          const items = regions[s].items ?? [];
          const top = ITEMS_POS[s].y - ((items.length - 1) * ITEM_LINE) / 2;
          return (
            <text
              key={s}
              textAnchor="middle"
              className={cn(
                "fill-muted-foreground font-sans text-[18px] transition-opacity duration-300 motion-reduce:transition-none max-sm:hidden",
                activeSets.includes(s) && active === s
                  ? "opacity-100"
                  : activeSets.includes(s)
                    ? "opacity-80"
                    : "opacity-40",
              )}
            >
              {items.map((item, i) => (
                <tspan key={item} x={ITEMS_POS[s].x} y={top + i * ITEM_LINE}>
                  {item}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* intersection labels */}
        {/* intersection labels, one word per line so they fit the narrow lenses */}
        {(["techFinance", "techModel", "financeModel"] as const).map((id) => {
          const words = regions[id].name.split(" ");
          const top = LABEL_POS[id]!.y - ((words.length - 1) * LABEL_LINE) / 2;
          return (
            <text
              key={id}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "font-mono text-[16px] transition-[fill,opacity] duration-300 motion-reduce:transition-none max-sm:text-[21px]",
                active === id ? "fill-foreground opacity-100" : "fill-muted-foreground opacity-75",
              )}
            >
              {words.map((word, i) => (
                <tspan key={word} x={LABEL_POS[id]!.x} y={top + i * LABEL_LINE}>
                  {word}
                </tspan>
              ))}
            </text>
          );
        })}

        <text
          x={LABEL_POS.core!.x}
          y={LABEL_POS.core!.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={cn(
            "fill-foreground font-display text-[32px] font-medium transition-opacity duration-300 motion-reduce:transition-none max-sm:text-[38px]",
            active === "core" ? "opacity-100" : "opacity-80",
          )}
        >
          {regions.core.name}
        </text>
      </svg>

      <div className="relative z-10 flex flex-col gap-6">
        <div aria-live="polite" className="min-h-[13rem]">
          <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            {kind(active)}
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {current.name}
          </h3>
          <p className="mt-3 max-w-md text-muted-foreground">{current.description}</p>
          {chips.length > 1 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div role="group" aria-label={labels.explore} className="flex flex-wrap gap-2">
          {ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={selected === id}
              onClick={() => setSelected(id)}
              onPointerEnter={() => setHovered(id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setSelected(id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none",
                id === active
                  ? "border-highlight bg-highlight/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {regions[id].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
