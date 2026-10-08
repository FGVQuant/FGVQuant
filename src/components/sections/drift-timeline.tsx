"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TimelineKind = "event" | "competition" | "class" | "visit" | "milestone";

export type TimelineItem = {
  id: string;
  /** ISO yyyy-mm-dd. */
  date: string;
  /** Preformatted, localized label, e.g. "Ago 2026". */
  dateLabel: string;
  /** Semester tag used for grouping, e.g. "2026.2". */
  period?: string;
  kind: TimelineKind;
  title: string;
  description?: string;
  href?: string;
  tag?: string;
};

const KIND_ICON: Record<TimelineKind, LucideIcon> = {
  event: CalendarDays,
  competition: Trophy,
  class: GraduationCap,
  visit: Building2,
  milestone: Sparkles,
};

const DEFAULT_KIND_LABELS: Record<TimelineKind, string> = {
  event: "Evento",
  competition: "Competição",
  class: "Aula",
  visit: "Visita",
  milestone: "Marco",
};

type DriftTimelineProps = {
  items: TimelineItem[];
  /** Localized badge text per kind; falls back to Portuguese defaults. */
  kindLabels?: Partial<Record<TimelineKind, string>>;
  /** Accessible name of the list. */
  ariaLabel?: string;
  /** Text for the link arrow's accessible hint, appended to the title. */
  linkLabel?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Deterministic Brownian-ish spine                                    */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Approximate standard normal from a sum of uniforms. */
function gauss(rand: () => number) {
  return (rand() + rand() + rand() + rand() - 2) * 1.7;
}

type Pt = { x: number; y: number };

/**
 * Builds a smooth path through every node y (at exactly spineX) with a
 * mean-reverting random walk "bridged" to zero at each node.
 */
function buildSpine(
  ys: number[],
  height: number,
  spineX: number,
  amp: number,
  seed: number,
): string {
  const stops = [0, ...ys, height];
  const pts: Pt[] = [{ x: spineX, y: 0 }];
  for (let s = 0; s < stops.length - 1; s++) {
    const y0 = stops[s];
    const y1 = stops[s + 1];
    const span = y1 - y0;
    const m = Math.max(2, Math.round(span / 34));
    const rand = mulberry32(seed * 9973 + s * 131 + 7);
    const w: number[] = [0];
    for (let k = 1; k <= m; k++) w.push(w[k - 1] * 0.72 + gauss(rand));
    const end = w[m];
    for (let k = 1; k <= m; k++) {
      const bridged = w[k] - (k / m) * end;
      const taper = k === m ? 0 : 1;
      pts.push({ x: spineX + bridged * amp * 0.55 * taper, y: y0 + (span * k) / m });
    }
  }
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Node({
  progress,
  fraction,
  reduced,
}: {
  progress: MotionValue<number>;
  fraction: number | null;
  reduced: boolean;
}) {
  const [value, setValue] = useState(0);
  useMotionValueEvent(progress, "change", setValue);
  const passed = fraction !== null && value >= fraction;
  const lit = reduced || passed;

  return (
    <span
      aria-hidden="true"
      data-node
      className="pointer-events-none absolute top-7 left-3 z-10 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full border bg-background transition-[border-color,box-shadow] duration-500",
          lit ? "border-highlight shadow-[0_0_14px_var(--glow)]" : "border-border-strong",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full transition-colors duration-500",
            lit ? "bg-highlight" : "bg-muted-foreground/40",
          )}
        />
      </span>
    </span>
  );
}

function Card({
  item,
  kindLabel,
  linkLabel,
  reduced,
}: {
  item: TimelineItem;
  kindLabel: string;
  linkLabel?: string;
  reduced: boolean;
}) {
  const Icon = KIND_ICON[item.kind];
  const body = (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <time
          dateTime={item.date}
          className="font-mono text-xs tracking-wide text-muted-foreground tabular-nums"
        >
          {item.dateLabel}
        </time>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wide text-highlight uppercase">
          <Icon className="size-3" aria-hidden="true" />
          {kindLabel}
        </span>
        {item.tag ? (
          <span className="font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            {item.tag}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 font-display text-lg leading-snug font-semibold text-foreground md:text-xl">
        {item.title}
        {item.href ? (
          <span
            aria-hidden="true"
            className="ml-1.5 inline-block text-highlight transition-transform group-hover/card:translate-x-0.5"
          >
            →
          </span>
        ) : null}
      </h3>
      {item.description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      ) : null}
    </>
  );

  const cls = "group/card block rounded-2xl p-5 transition-colors md:p-6 glass";

  const inner = item.href ? (
    <a
      href={item.href}
      aria-label={linkLabel ? `${item.title} — ${linkLabel}` : undefined}
      className={cn(cls, "hover:border-border-strong hover:bg-accent")}
    >
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );

  if (reduced) return inner;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {inner}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type Geometry = { width: number; height: number; ys: number[]; spineX: number; amp: number };

/**
 * Vertical timeline whose spine is a deterministic Brownian-looking path that
 * draws on with scroll. Items are grouped by `period` (sticky mono label),
 * left-aligned on mobile and alternating around a centered spine from md up.
 */
export function DriftTimeline({
  items,
  kindLabels,
  ariaLabel,
  linkLabel,
  className,
}: DriftTimelineProps) {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 45%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { period: string; entries: { item: TimelineItem; index: number }[] }
    >();
    items.forEach((item, i) => {
      const key = item.period ?? "";
      const g = map.get(key) ?? { period: key, entries: [] };
      g.entries.push({ item, index: i });
      map.set(key, g);
    });
    // Re-number in DOM order so node measurements and alternation line up.
    let n = 0;
    return [...map.values()].map((g) => ({
      ...g,
      entries: g.entries.map(({ item }) => ({ item, index: n++ })),
    }));
  }, [items]);

  const measure = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const nodes = el.querySelectorAll<HTMLElement>("[data-node]");
    const ys = Array.from(nodes).map((n) => {
      const r = n.getBoundingClientRect();
      return r.top + r.height / 2 - box.top;
    });
    const wide = window.matchMedia("(min-width: 48rem)").matches;
    setGeo({
      width: box.width,
      height: box.height,
      ys,
      spineX: wide ? box.width / 2 : 12,
      amp: wide ? 14 : 8,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, items]);

  const d = useMemo(
    () =>
      geo && geo.ys.length
        ? buildSpine(geo.ys, geo.height, geo.spineX, geo.amp, items.length || 1)
        : null,
    [geo, items.length],
  );

  const labels = { ...DEFAULT_KIND_LABELS, ...kindLabels };

  return (
    <div ref={sectionRef} className={cn("relative", className)}>
      {/* Faint straight track (also the no-JS fallback) */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-3 w-px -translate-x-1/2 bg-border md:left-1/2"
      />
      {geo && d ? (
        <svg
          aria-hidden="true"
          focusable="false"
          width={geo.width}
          height={geo.height}
          viewBox={`0 0 ${geo.width} ${geo.height}`}
          className="pointer-events-none absolute inset-0 overflow-visible text-highlight"
        >
          <path
            d={d}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={1}
            strokeLinecap="round"
          />
          <motion.path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            style={reduced ? { pathLength: 1 } : { pathLength }}
          />
        </svg>
      ) : null}

      <ol className="relative space-y-14 md:space-y-20" aria-label={ariaLabel}>
        {groups.map((group) => (
          <li key={group.period || "__none"} className="relative">
            {group.period ? (
              <div className="sticky top-20 z-20 mb-6 flex pl-9 md:justify-center md:pl-0">
                <span className="rounded-full border border-border-strong bg-background/85 px-3 py-1 font-mono text-xs tracking-widest text-highlight tabular-nums backdrop-blur">
                  {group.period}
                </span>
              </div>
            ) : null}
            <ol className="space-y-8 md:space-y-10">
              {group.entries.map(({ item, index }) => {
                const right = index % 2 === 1;
                const fraction =
                  geo && geo.height > 0 && geo.ys[index] !== undefined
                    ? geo.ys[index] / geo.height
                    : null;
                return (
                  <li key={item.id} className="relative md:grid md:grid-cols-2">
                    <Node progress={scrollYProgress} fraction={fraction} reduced={reduced} />
                    <div
                      className={cn(
                        "pl-9 md:pl-0",
                        right ? "md:col-start-2 md:pl-12" : "md:col-start-1 md:pr-12",
                      )}
                    >
                      <Card
                        item={item}
                        kindLabel={labels[item.kind]}
                        linkLabel={linkLabel}
                        reduced={reduced}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
