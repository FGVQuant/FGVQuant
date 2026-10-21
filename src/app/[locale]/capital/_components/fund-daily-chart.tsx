"use client";

import { useState } from "react";
import type { FundDailyPoint } from "@/lib/content";

type Series = { id: string; label: string };
/** CDI is the benchmark: a thin dashed neutral reference line, not another hue. */
const STROKE: Record<string, string> = {
  fund: "var(--series-fund)",
  pairs: "var(--series-pairs)",
  momentum: "var(--series-momentum)",
  cdi: "var(--muted-foreground)",
};
// ponytail: one validated spare hue for a new strategy; more than one new strategy at a time
// draws the rest in solid gray (still legended and labelled). Validate a 5th hue if that happens.
const SPARE = ["var(--series-new)"];
const dashed = (id: string) => id === "cdi";

const W = 960;
const H = 320;
const PAD_L = 52;
const PAD_R = 150; // room for the direct end labels ("Momentum +10,91%")
const PAD_T = 16;
const PAD_B = 28;

/** Cumulative return (%) from inception, one point per day; hover reads every series at a day. */
export function FundDailyChart({
  points,
  series,
  previewLabel,
  ariaLabel,
  locale,
  nav,
}: {
  /** cumulative factors (1 = inception) */
  points: FundDailyPoint[];
  /** in drawing order, as the JSON lists them (fund, strategies, cdi) */
  series: Series[];
  previewLabel: string;
  ariaLabel: string;
  locale: string;
  /**
   * Simulated NAV per share: base 1.00 before the first day, so the NAV is the fund's cumulative
   * factor (NAV_t = NAV_t-1 × (1 + r_t)); AUM = initial AUM × NAV.
   */
  nav?: {
    label: string;
    dayLabel: string;
    aumLabel: string;
    baseNote: string;
    initialAum: number | null;
  };
}) {
  const [hover, setHover] = useState<number | null>(null);
  const unknown = series.filter((s) => !STROKE[s.id]);
  const stroke = (id: string) =>
    STROKE[id] ?? SPARE[unknown.findIndex((s) => s.id === id)] ?? "var(--muted-foreground)";
  const val = (p: FundDailyPoint, id: string) => p[id] as number;
  const pct = (f: number) => (f - 1) * 100;
  const fmtPct = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  });
  const fmtNav = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
  const fmtAum = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 2,
  });
  const fmtAxis = new Intl.NumberFormat(locale, { signDisplay: "exceptZero" });
  const fmtDay = new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const fmtMonth = new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  });

  const values = points.flatMap((p) => series.map((s) => pct(val(p, s.id))));
  const step = 5;
  const lo = Math.floor(Math.min(0, ...values) / step) * step;
  const hi = Math.ceil(Math.max(...values) / step) * step;
  const n = points.length;
  const x = (i: number) => PAD_L + (i / Math.max(n - 1, 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) => PAD_T + ((hi - v) / (hi - lo || 1)) * (H - PAD_T - PAD_B);
  const ticks = Array.from({ length: (hi - lo) / step + 1 }, (_, k) => lo + k * step);

  // first day of each quarter on the x axis
  const monthTicks = points
    .map((p, i) => ({ i, d: p.date }))
    .filter(
      ({ i, d }) =>
        i > 0 &&
        d.slice(5, 7) !== points[i - 1].date.slice(5, 7) &&
        Number(d.slice(5, 7)) % 3 === 1,
    );

  const previewFrom = points.findIndex((p) => p.preview);
  const path = (id: string) =>
    points
      .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(pct(val(p, id))).toFixed(1)}`)
      .join("");

  // direct end labels, nudged apart so they never overlap
  const ends = series
    .map((s) => ({ s, y: y(pct(val(points[n - 1], s.id))) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 15);

  const pick = (clientX: number, rect: DOMRect) => {
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD_L) / (W - PAD_L - PAD_R)) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };
  const h = hover === null ? null : points[hover];

  return (
    <figure>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
        {series.map((s) => (
          <li key={s.id} className="inline-flex items-center gap-2">
            <svg aria-hidden width="18" height="8">
              <line
                x1="1"
                x2="17"
                y1="4"
                y2="4"
                stroke={stroke(s.id)}
                strokeWidth={2}
                strokeDasharray={dashed(s.id) ? "4 3" : undefined}
                strokeLinecap="round"
              />
            </svg>
            {s.label}
          </li>
        ))}
        {previewFrom >= 0 ? (
          <li className="inline-flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-4 rounded-sm bg-muted" />
            {previewLabel}
          </li>
        ) : null}
      </ul>
      <div className="relative">
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-pan-y"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setHover(null)}
        >
          {previewFrom >= 0 ? (
            <rect
              x={x(previewFrom)}
              y={PAD_T}
              width={x(n - 1) - x(previewFrom)}
              height={H - PAD_T - PAD_B}
              className="fill-muted"
              opacity={0.7}
            />
          ) : null}
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y(v)}
                y2={y(v)}
                className={v === 0 ? "stroke-border-strong" : "stroke-border"}
                strokeWidth={1}
              />
              <text
                x={PAD_L - 8}
                y={y(v) + 4}
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[11px] max-sm:text-[18px]"
              >
                {fmtAxis.format(v)}%
              </text>
            </g>
          ))}
          {monthTicks.map(({ i, d }) => (
            <text
              key={d}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[11px] max-sm:text-[18px]"
            >
              {fmtMonth.format(new Date(d))}
            </text>
          ))}
          {series.map((s) => (
            <path
              key={s.id}
              d={path(s.id)}
              fill="none"
              stroke={stroke(s.id)}
              strokeWidth={dashed(s.id) ? 1.5 : 2}
              strokeDasharray={dashed(s.id) ? "5 4" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {ends.map(({ s, y: ly }) => (
            <text
              key={s.id}
              x={x(n - 1) + 8}
              y={ly + 4}
              className="fill-foreground font-mono text-[11px] max-sm:hidden"
            >
              {s.label} {fmtPct.format(pct(val(points[n - 1], s.id)))}%
            </text>
          ))}
          {h ? (
            <g>
              <line
                x1={x(hover!)}
                x2={x(hover!)}
                y1={PAD_T}
                y2={H - PAD_B}
                className="stroke-border-strong"
                strokeWidth={1}
              />
              {series.map((s) => (
                <circle
                  key={s.id}
                  cx={x(hover!)}
                  cy={y(pct(val(h, s.id)))}
                  r={4}
                  fill={stroke(s.id)}
                  className="stroke-card"
                  strokeWidth={2}
                />
              ))}
            </g>
          ) : null}
        </svg>
        {nav && !h ? (
          // sits in the plot's top-left corner, which the curves leave empty as the fund grows
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-card/85 px-3 py-2.5 backdrop-blur-sm max-sm:hidden"
            style={{ left: `${(PAD_L / W) * 100 + 1.5}%`, top: `${(PAD_T / H) * 100 + 3}%` }}
          >
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {nav.label}
            </p>
            <p className="mt-1 font-mono text-2xl text-foreground tabular-nums">
              {fmtNav.format(val(points[n - 1], "fund"))}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground tabular-nums">
              {n > 1
                ? `${fmtPct.format((val(points[n - 1], "fund") / val(points[n - 2], "fund") - 1) * 100)}% ${nav.dayLabel}`
                : null}
              {nav.initialAum
                ? ` · ${nav.aumLabel} ${fmtAum.format(nav.initialAum * val(points[n - 1], "fund"))}`
                : null}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{nav.baseNote}</p>
          </div>
        ) : null}
        {h ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-border bg-popover p-3 text-xs shadow-lg"
            style={
              hover! > n / 2
                ? { right: `${100 - (x(hover!) / W) * 100 + 2}%` }
                : { left: `${(x(hover!) / W) * 100 + 2}%` }
            }
          >
            <p className="font-mono text-muted-foreground">
              {fmtDay.format(new Date(h.date))}
              {h.preview ? ` · ${previewLabel}` : ""}
            </p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {series.map((s) => (
                <div key={s.id} className="contents">
                  <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ background: stroke(s.id) }}
                    />
                    {s.label}
                  </dt>
                  <dd className="text-right font-mono text-foreground">
                    {fmtPct.format(pct(val(h, s.id)))}%
                  </dd>
                </div>
              ))}
            </dl>
            {nav ? (
              <p className="mt-2 flex justify-between gap-3 border-t border-border pt-2">
                <span className="text-muted-foreground">{nav.label}</span>
                <span className="font-mono text-foreground tabular-nums">
                  {fmtNav.format(val(h, "fund"))}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </figure>
  );
}
