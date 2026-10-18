"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { parseNumber, simulate, straddle, varEs } from "@/lib/quant/terminal-calc";
import { cn } from "@/lib/utils";

/**
 * Quant calculator in a terminal: every command computes something in the browser (a Monte Carlo
 * of the hero's model, VaR/ES under fat tails, a Black-Scholes straddle). No navigation commands
 * and no canned mission text: the site already says that. All copy comes from Home.terminal.
 */

type Line = { id: number; kind: "cmd" | "out" | "muted" | "error"; text: string };

const COMMANDS = ["sim", "var", "straddle", "help", "clear"] as const;
/** One-click examples for pointer and touch users. */
const EXAMPLES = ["sim 24% 8%", "sim 40% 8%", "var 99", "var 99 3", "straddle 100 100 30% 0.5"];
/** Run on mount: the hero's parameters (μ = 8%, σ = 24%). */
const FIRST = EXAMPLES[0];

export function TerminalPanel({ className }: { className?: string }) {
  const t = useTranslations("Home.terminal");
  const locale = useLocale();
  const nf = (n: number, digits = 1) =>
    new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);
  const pc = (n: number, digits = 1) => `${nf(n * 100, digits)}%`;

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const nextId = useRef(0);
  const mk = (kind: Line["kind"], text: string): Line => ({ id: nextId.current++, kind, text });
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  // Opens with the hero's own model already run, so the panel shows real output at rest. The seed
  // is fixed and values are rounded, so server and client render the same text.
  const [lines, setLines] = useState<Line[]>(() => [
    mk("muted", t("intro")),
    mk("muted", t("hint")),
    mk("cmd", FIRST),
    ...evaluate("sim", FIRST.split(" ").slice(1)),
  ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  /** Returns the output lines for one command, or an error line. */
  function evaluate(name: string, args: string[]): Line[] {
    if (name === "help") {
      const rows = [
        ["synSim", "helpSim"],
        ["synVar", "helpVar"],
        ["synStraddle", "helpStraddle"],
        ["synClear", "helpClear"],
      ] as const;
      // Syntax on one line, description indented below: reads at any width, no wrapped columns.
      return [
        mk("muted", t("helpHeading")),
        ...rows.flatMap(([syn, desc]) => [mk("out", t(syn)), mk("muted", `  ${t(desc)}`)]),
      ];
    }
    if (name === "sim") {
      const sigma = parseNumber(args[0], true) ?? 0.24;
      const mu = parseNumber(args[1], true) ?? 0.08;
      const n = Math.round(parseNumber(args[2]) ?? 10000);
      if (![sigma, mu, n].every(Number.isFinite) || sigma <= 0 || sigma > 2 || n < 100 || n > 50000)
        return [mk("error", t("usageSim"))];
      const r = simulate(mu, sigma, n);
      return [
        mk("muted", t("simHeader", { n: nf(n, 0), mu: pc(mu, 0), sigma: pc(sigma, 0) })),
        mk("out", `p5 ${nf(r.p05)}   p50 ${nf(r.p50)}   p95 ${nf(r.p95)}`),
        mk("out", t("simLoss", { p: pc(r.lossProb) })),
        ...r.bins.map(([start, len]) =>
          mk("out", `${nf(start, 0).padStart(5)} ${"█".repeat(len)}`),
        ),
        mk("muted", t("simNote")),
      ];
    }
    if (name === "var") {
      const raw = parseNumber(args[0]) ?? 95;
      const level = raw > 1 ? raw / 100 : raw;
      const nu = parseNumber(args[1]) ?? 4;
      if (
        !Number.isFinite(level) ||
        level <= 0.5 ||
        level >= 0.9999 ||
        !Number.isFinite(nu) ||
        nu <= 2 ||
        nu > 200
      )
        return [mk("error", t("usageVar"))];
      const r = varEs(level, nu);
      return [
        mk("muted", t("varHeader", { level: pc(level, (level * 1000) % 10 ? 1 : 0) })),
        mk("out", `${"".padEnd(14)}${"VaR".padStart(7)}${"ES".padStart(7)}`),
        mk(
          "out",
          `${t("normal").padEnd(14)}${nf(r.normal.var, 2).padStart(7)}${nf(r.normal.es, 2).padStart(7)}`,
        ),
        mk(
          "out",
          `${t("studentT", { nu: nf(nu, 0) }).padEnd(14)}${nf(r.t.var, 2).padStart(7)}${nf(r.t.es, 2).padStart(7)}`,
        ),
        mk("muted", t("varNote")),
      ];
    }
    if (name === "straddle") {
      const s = parseNumber(args[0]) ?? 100;
      const k = parseNumber(args[1]) ?? 100;
      const sigma = parseNumber(args[2], true) ?? 0.3;
      const years = parseNumber(args[3]) ?? 0.5;
      if (
        ![s, k, sigma, years].every(Number.isFinite) ||
        s <= 0 ||
        k <= 0 ||
        sigma <= 0 ||
        years <= 0 ||
        years > 30
      )
        return [mk("error", t("usageStraddle"))];
      const r = straddle(s, k, sigma, years);
      return [
        mk(
          "muted",
          t("straddleHeader", {
            s: nf(s, 0),
            k: nf(k, 0),
            sigma: pc(sigma, 0),
            years: nf(years, 2),
          }),
        ),
        mk("out", t("straddlePrice", { price: nf(r.price, 2) })),
        mk("out", t("straddleBreakeven", { low: nf(r.low, 2), high: nf(r.high, 2) })),
        mk("muted", t("straddleNote")),
      ];
    }
    return [mk("error", t("notFound", { cmd: name }))];
  }

  function run(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const [head, ...args] = input.replace(/^\//, "").split(/\s+/);
    const name = head.toLowerCase();
    setHistory((h) => [input, ...h].slice(0, 20));
    setHistoryIdx(-1);
    if (name === "clear") {
      setLines([]);
      return;
    }
    const echo = mk("cmd", input);
    const out = evaluate(name, args);
    setLines((prev) => [...prev, echo, ...out]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, history.length - 1);
      if (idx >= 0) {
        setHistoryIdx(idx);
        setValue(history[idx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = historyIdx - 1;
      setHistoryIdx(Math.max(idx, -1));
      setValue(idx >= 0 ? history[idx] : "");
    } else if (e.key === "Tab" && value && !value.includes(" ")) {
      const partial = value.replace(/^\//, "").toLowerCase();
      const match = COMMANDS.find((n) => n.startsWith(partial));
      if (match) {
        e.preventDefault();
        setValue(`${match} `);
      }
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card font-mono text-[0.8rem] leading-relaxed",
        className,
      )}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-500" />
          <span className="size-2.5 rounded-full bg-lavender-600" />
          <span className="size-2.5 rounded-full bg-lavender-400" />
        </div>
        <p className="flex-1 truncate text-center text-xs text-muted-foreground">{t("title")}</p>
        <span aria-hidden className="w-10" />
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="h-80 overflow-y-auto px-4 py-4 sm:h-96 sm:px-5"
      >
        {lines.map((l) => (
          <p
            key={l.id}
            className={cn(
              "break-words whitespace-pre-wrap",
              l.kind === "cmd" && "mt-3 text-foreground first:mt-0",
              l.kind === "out" && "text-foreground/85",
              l.kind === "muted" && "text-muted-foreground",
              l.kind === "error" && "text-destructive",
            )}
          >
            {l.kind === "cmd" ? (
              <span aria-hidden className="mr-2 text-highlight select-none">
                $
              </span>
            ) : null}
            {l.text}
          </p>
        ))}
        <div className="mt-3 flex items-center gap-2 rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card">
          <span aria-hidden className="text-highlight select-none">
            $
          </span>
          <label htmlFor={inputId} className="sr-only">
            {t("inputLabel")}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-foreground caret-highlight outline-none placeholder:text-muted-foreground"
            placeholder="help"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label={t("chipsLabel")}
        className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5"
      >
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              run(ex);
            }}
            className="pressable rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-border-strong hover:bg-accent hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
