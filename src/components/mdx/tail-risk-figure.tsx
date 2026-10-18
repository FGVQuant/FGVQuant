"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { normalPdf, normalVarEs, studentTPdf, studentTVarEs } from "@/lib/quant/dist";
import { cn } from "@/lib/utils";

const NU = 4;
const LEVELS = [0.95, 0.99] as const;
type Level = (typeof LEVELS)[number];

const W = 640;
const H = 300;
const M = { l: 24, r: 24, t: 30, b: 52 };
const X0 = -5;
const X1 = 5;
const Y1 = 0.6;
const sx = (x: number) => M.l + ((x - X0) / (X1 - X0)) * (W - M.l - M.r);
const sy = (y: number) => H - M.b - (y / Y1) * (H - M.t - M.b);
const r1 = (n: number) => Math.round(n * 10) / 10;
const xs = Array.from({ length: 241 }, (_, i) => X0 + ((X1 - X0) * i) / 240);
const line = (f: (x: number) => number, from = X0, to = X1) =>
  xs
    .filter((x) => x >= from && x <= to)
    .map((x, i) => `${i ? "L" : "M"}${r1(sx(x))} ${r1(sy(f(x)))}`)
    .join(" ");

const { scale } = studentTVarEs(0.05, NU);
const tPdf = (x: number) => studentTPdf(x / scale, NU) / scale;
const NORMAL_PATH = line(normalPdf);
const T_PATH = line(tPdf);

/** Computed once: normal and unit-variance Student-t (ν = 4) loss VaR/ES at both levels. */
const at = (lvl: Level) => ({ normal: normalVarEs(1 - lvl), t: studentTVarEs(1 - lvl, NU) });
const VALUES: Record<Level, ReturnType<typeof at>> = { 0.95: at(0.95), 0.99: at(0.99) };

/**
 * Illustration for the Sep/26 issue's guest column ("risk is an estimate, not a number"): how VaR
 * and Expected Shortfall read a fat-tailed distribution against a normal one with the same
 * variance. Not the column's data: both distributions are stated in the caption.
 */
export function TailRiskFigure() {
  const t = useTranslations("Newsletter.tailRisk");
  const locale = useLocale();
  const [level, setLevel] = useState<Level>(0.95);
  const v = VALUES[level];
  const nf = new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const pct = (l: Level) => `${Math.round(l * 100)}%`;
  const tail = `${line(tPdf, X0, -v.t.var)} L${r1(sx(-v.t.var))} ${r1(sy(0))} L${r1(sx(X0))} ${r1(sy(0))} Z`;
  // Markers move on screen when the level changes: ease-in-out, 300ms; no travel under reduced motion.
  const move = "transition-transform duration-300 ease-in-out motion-reduce:transition-none";

  return (
    <figure className="not-prose my-10 rounded-2xl bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{t("title")}</p>
        <div
          role="group"
          aria-label={t("levelLabel")}
          className="flex gap-1 rounded-full bg-background p-1"
        >
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={cn(
                "pressable rounded-full px-3 py-1 text-sm tabular-nums",
                level === l
                  ? "bg-highlight/15 text-highlight"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pct(l)}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("chartLabel", { level: pct(level) })}
        className="mt-4 w-full text-highlight"
      >
        <path d={tail} className="fill-current" fillOpacity={0.3} />
        <path
          d={NORMAL_PATH}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          strokeDasharray="4 5"
        />
        <path d={T_PATH} fill="none" stroke="currentColor" strokeWidth={2} />
        <line x1={sx(X0)} x2={sx(X1)} y1={sy(0)} y2={sy(0)} className="stroke-border-strong" />
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => (
          <text
            key={x}
            x={r1(sx(x))}
            y={H - M.b + 22}
            textAnchor="middle"
            className="fill-muted-foreground text-[14px] tabular-nums"
          >
            {x}
          </text>
        ))}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[14px]">
          {t("axis")}
        </text>

        {/* Normal VaR (dashed) and the t's VaR and ES. Positions are transforms so they can glide. */}
        <g className={move} style={{ transform: `translateX(${r1(sx(-v.normal.var))}px)` }}>
          <line
            y1={sy(0)}
            y2={sy(0.42)}
            stroke="currentColor"
            strokeOpacity={0.6}
            strokeDasharray="4 5"
          />
        </g>
        <g className={move} style={{ transform: `translateX(${r1(sx(-v.t.var))}px)` }}>
          <line y1={sy(0)} y2={sy(0.5)} stroke="currentColor" strokeWidth={1.5} />
          <text
            y={sy(0.5) - 8}
            textAnchor="middle"
            className="fill-current text-[15px] font-medium"
          >
            VaR
          </text>
        </g>
        <g className={move} style={{ transform: `translateX(${r1(sx(-v.t.es))}px)` }}>
          <path
            d={`M0 ${r1(sy(0)) - 7} L6 ${r1(sy(0))} L0 ${r1(sy(0)) + 7} L-6 ${r1(sy(0))} Z`}
            className="fill-current"
          />
          <text y={sy(0) - 14} textAnchor="middle" className="fill-current text-[15px] font-medium">
            ES
          </text>
        </g>
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 bg-highlight" />
          {t("legendT")}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0 w-5 border-t border-dashed border-highlight" />
          {t("legendNormal")}
        </li>
      </ul>

      <table className="mt-5 w-full text-sm tabular-nums">
        <caption className="sr-only">{t("tableCaption", { level: pct(level) })}</caption>
        <thead>
          <tr className="text-left text-muted-foreground">
            <th scope="col" className="py-2 font-normal">
              {t("distribution")}
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              VaR {pct(level)}
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              ES {pct(level)}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">
          <tr>
            <th scope="row" className="py-2 text-left font-normal text-foreground">
              {t("legendNormal")}
            </th>
            <td className="py-2 text-right">{nf.format(v.normal.var)}</td>
            <td className="py-2 text-right">{nf.format(v.normal.es)}</td>
          </tr>
          <tr>
            <th scope="row" className="py-2 text-left font-normal text-foreground">
              {t("legendT")}
            </th>
            <td className="py-2 text-right">{nf.format(v.t.var)}</td>
            <td className="py-2 text-right">{nf.format(v.t.es)}</td>
          </tr>
        </tbody>
      </table>

      <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {t(level === 0.95 ? "reading95" : "reading99")} {t("caption")}
      </figcaption>
    </figure>
  );
}
