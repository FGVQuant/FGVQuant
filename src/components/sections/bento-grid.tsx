import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BentoGlow } from "./bento-glow";

/** Responsive bento layout: 1 column on mobile, 6 columns with 18rem rows on lg. */
export function BentoGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn("grid w-full auto-rows-[18rem] grid-cols-1 gap-4 lg:grid-cols-6", className)}
    >
      {children}
    </div>
  );
}

export interface BentoCardProps {
  title: string;
  description: string;
  /** Rendered icon element, e.g. `<Sigma />` (an element, not a component — props must be serializable). */
  icon?: ReactNode;
  eyebrow?: string;
  /** Makes the whole card a link (internal paths are locale-aware). */
  href?: string;
  /** Spans go here, e.g. "lg:col-span-4". */
  className?: string;
  /** Decorative layer rendered behind the content (see the *Bg presets). */
  background?: ReactNode;
  children?: ReactNode;
}

/**
 * Restrained bento card. A radial glow follows the cursor (CSS vars `--mx`/`--my`)
 * and the background slot scales slightly on hover; both are disabled under
 * prefers-reduced-motion.
 */
export function BentoCard({
  title,
  description,
  icon,
  eyebrow,
  href,
  className,
  background,
  children,
}: BentoCardProps) {
  const heading = (
    <h3 className="font-display text-xl leading-tight text-foreground sm:text-2xl">{title}</h3>
  );
  const linkClass =
    "rounded-sm outline-offset-4 after:absolute after:inset-0 after:z-20 after:content-['']";

  return (
    <div
      className={cn(
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card/60 p-6 transition-colors duration-300 hover:border-border-strong",
        className,
      )}
    >
      {background ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)] text-highlight transition-transform duration-700 ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          {background}
        </div>
      ) : null}
      <BentoGlow />

      <div className="relative z-10 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {icon ? (
            <span
              aria-hidden
              className="mb-4 block text-highlight [&>svg]:size-6 [&>svg]:stroke-[1.5]"
            >
              {icon}
            </span>
          ) : null}
          {eyebrow ? (
            <p className="mb-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {eyebrow}
            </p>
          ) : null}
          {href ? (
            href.startsWith("http") ? (
              <a href={href} target="_blank" rel="noreferrer noopener" className={linkClass}>
                {heading}
              </a>
            ) : (
              <Link href={href} className={linkClass}>
                {heading}
              </Link>
            )
          ) : (
            heading
          )}
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
        {href ? (
          <span
            aria-hidden
            className="shrink-0 font-mono text-lg text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-highlight motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          >
            →
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Decorative backgrounds (deterministic, theme-aware via currentColor)
   ------------------------------------------------------------------ */

const NODES: ReadonlyArray<readonly [number, number]> = [
  [230, 40],
  [300, 24],
  [372, 62],
  [270, 98],
  [340, 128],
  [420, 104],
  [200, 130],
  [300, 176],
  [388, 190],
  [240, 210],
  [460, 160],
  [170, 60],
];
const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [6, 7],
  [3, 7],
  [4, 7],
  [4, 8],
  [5, 10],
  [8, 10],
  [7, 8],
  [6, 9],
  [7, 9],
  [0, 11],
  [11, 6],
];

/** Low-poly node/edge network echoing the bull mark. */
export function NodeGraphBg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 260"
      preserveAspectRatio="xMaxYMin slice"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeOpacity="0.28" strokeWidth="1">
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 3.5 : 2.5}
            fillOpacity={i % 3 === 0 ? 0.7 : 0.4}
          />
        ))}
      </g>
    </svg>
  );
}

// [open, close, low, high] on a 0-200 scale (y grows downward when drawn).
const CANDLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [120, 105, 130, 95],
  [105, 112, 118, 98],
  [112, 96, 120, 88],
  [96, 100, 108, 90],
  [100, 84, 106, 76],
  [84, 90, 96, 78],
  [90, 70, 94, 62],
  [70, 74, 80, 64],
  [74, 58, 78, 50],
  [58, 64, 70, 52],
  [64, 46, 68, 38],
  [46, 50, 56, 40],
];

/** Stylised candlestick bars. */
export function CandlesBg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 200"
      preserveAspectRatio="xMaxYMin slice"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden
    >
      {CANDLES.map(([o, c, lo, hi], i) => {
        const x = 20 + i * 28;
        const up = c < o;
        const top = Math.min(o, c);
        const h = Math.max(Math.abs(o - c), 3);
        return (
          <g key={i} stroke="currentColor" fill="currentColor">
            <line x1={x} x2={x} y1={hi} y2={lo} strokeOpacity="0.35" strokeWidth="1.5" />
            <rect
              x={x - 7}
              y={top}
              width="14"
              height={h}
              rx="2"
              fillOpacity={up ? 0.45 : 0.12}
              strokeOpacity="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Large faint monospaced formula. */
const EQ_W = 300;
const EQ_FONT = 44;
const EQ_LINE = 50;

/** Greedy word wrap into lines of at most `max` characters (keeps the formula's natural breaks). */
function wrapWords(text: string, max: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + " " + word).length <= max)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function EquationBg({
  tex = "dS = μS dt + σS dW",
  className,
}: {
  tex?: string;
  className?: string;
}) {
  const lines = wrapWords(tex, 11);
  return (
    <div
      aria-hidden
      className={cn("flex h-full w-full items-start justify-end overflow-hidden p-6", className)}
    >
      {/* Rendered as SVG text: it's pure decoration, and contrast checkers (axe) evaluate HTML
          text even when aria-hidden — SVG keeps the faint look without a false contrast failure. */}
      <svg
        viewBox={`0 0 ${EQ_W} ${lines.length * EQ_LINE + 8}`}
        className="h-auto w-[min(100%,20rem)] opacity-[0.14] select-none sm:w-[min(100%,24rem)]"
      >
        <text
          x={EQ_W}
          textAnchor="end"
          className="fill-current font-mono"
          fontSize={EQ_FONT}
          fontWeight={500}
        >
          {lines.map((line, i) => (
            <tspan key={i} x={EQ_W} dy={i === 0 ? EQ_FONT : EQ_LINE}>
              {line}
            </tspan>
          ))}
        </text>
      </svg>
    </div>
  );
}
