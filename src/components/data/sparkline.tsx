"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  /** Intrinsic viewBox width. The SVG scales to its container. */
  width?: number;
  /** Intrinsic viewBox height. */
  height?: number;
  className?: string;
  /** Show a soft gradient fill under the line. */
  area?: boolean;
  /** Accessible description of the series. */
  label?: string;
};

/**
 * Minimal SVG sparkline with a draw-on animation when scrolled into view and
 * a dot on the final point. Scales to container width.
 */
export function Sparkline({
  data,
  width = 160,
  height = 40,
  className,
  area = false,
  label,
}: SparklineProps) {
  const gradId = useId();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  if (data.length < 2) return null;

  const padX = 3;
  const padY = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  const areaPath = `M${pts[0][0].toFixed(2)},${height} L${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L")} L${lx.toFixed(2)},${height} Z`;
  const show = reduced || inView;

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("block h-10 w-full overflow-visible", className)}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="[stop-color:var(--highlight)]" stopOpacity={0.28} />
              <stop offset="100%" className="[stop-color:var(--highlight)]" stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill={`url(#${gradId})`}
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </>
      )}
      <motion.polyline
        points={line}
        fill="none"
        className="stroke-highlight"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: show ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.2, ease: EASE_OUT }}
      />
      <motion.circle
        cx={lx}
        cy={ly}
        r={2.5}
        className="fill-highlight"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ duration: 0.3, delay: reduced ? 0 : 1.1 }}
      />
    </svg>
  );
}
