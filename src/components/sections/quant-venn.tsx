"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Interactive three-set Venn diagram: Tecnologia, Finanças and Modelagem, with "Quant" at the
 * centre. A card beside the Home intro: title and hint on top, the circles, and a caption footer.
 * Hovering (or tapping) any of the seven regions lights it up and the caption describes it; with
 * the diagram focused, the arrow keys step through the regions. Hit-testing is geometric (which
 * circles contain the pointer), so every region is exact.
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
  title: string;
  subtitle: string;
  regions: Record<VennRegionId, VennRegionCopy>;
  labels: {
    /** Caption prefix, by region kind. */
    area: string;
    intersection: string;
    core: string;
    /** Accessible name for the diagram. */
    diagram: string;
    /** Short hint on how to explore it, in the card header. */
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

export function QuantVenn({ title, subtitle, regions, labels, className }: QuantVennProps) {
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

  function step(e: KeyboardEvent) {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    setHovered(null);
    setSelected(ORDER[(ORDER.indexOf(selected) + delta + ORDER.length) % ORDER.length]);
  }

  return (
    <figure className={cn("rounded-2xl border border-border bg-card p-6 sm:p-8", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="font-display text-2xl tracking-tight text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="text-xs text-muted-foreground">{labels.explore}</p>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={labels.diagram}
        tabIndex={0}
        onKeyDown={step}
        className="mx-auto mt-4 block h-auto w-full max-w-[24rem] touch-manipulation rounded-2xl select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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

        {/* topics inside each circle (hidden on small screens, where the caption lists them) */}
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

      <figcaption aria-live="polite" className="mt-6 min-h-[5.5rem] border-t border-border pt-4">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-xs tracking-[0.14em] text-highlight uppercase">
            {kind(active)}
          </span>
          <span className="font-sans text-base font-semibold text-foreground">{current.name}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {current.description}
          {current.items ? <span className="sm:hidden"> ({current.items.join(", ")})</span> : null}
        </p>
      </figcaption>
    </figure>
  );
}
