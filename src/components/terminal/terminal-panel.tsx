"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Signature "terminal" panel: prints the league's mission, then accepts a few scoped
 * slash-commands (/join, /newsletter, /capital, /team …). Navigation commands route via
 * next-intl; others print output. All copy arrives via props.
 */
export type TerminalCommand = {
  /** without the slash, e.g. "join" */
  name: string;
  description: string;
  /** internal path to navigate to */
  href?: string;
  /** lines printed when run (in addition to / instead of navigating) */
  output?: string[];
};

export type TerminalPanelProps = {
  /** window title, e.g. "fgvquant@liga: ~" */
  title?: string;
  /** shell prompt shown before input */
  prompt?: string;
  /** the command typed first, e.g. "cat missao.txt" */
  introCommand: string;
  /** lines "printed" by the intro command (printed immediately) */
  introLines: string[];
  commands: TerminalCommand[];
  labels: {
    /** e.g. "Digite /help para ver os comandos" */
    hint: string;
    /** heading printed above the command list for /help */
    helpHeading: string;
    /** "comando não encontrado: {cmd}" — {cmd} is replaced */
    notFound: string;
    /** "abrindo {path}…" — {path} is replaced */
    navigating: string;
    /** aria-label for the input */
    inputLabel: string;
    /** aria-label for the clickable command chips group */
    chipsLabel: string;
  };
  className?: string;
};

type Line = { id: number; kind: "cmd" | "out" | "muted" | "error"; text: string };

export function TerminalPanel({
  title = "fgvquant@liga: ~",
  prompt = "$",
  introCommand,
  introLines,
  commands,
  labels,
  className,
}: TerminalPanelProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const nextId = useRef(introLines.length + 2);

  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const mk = (kind: Line["kind"], text: string): Line => ({ id: nextId.current++, kind, text });

  // The intro renders immediately: readable and usable on mount, no boot animation.
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, kind: "cmd", text: introCommand },
    ...introLines.map((text, i): Line => ({ id: i + 1, kind: "out", text })),
    { id: introLines.length + 1, kind: "muted", text: labels.hint },
  ]);
  // Keep the log scrolled to the bottom.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function run(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const name = input.replace(/^\//, "").split(/\s+/)[0].toLowerCase();
    const echo = mk("cmd", input);
    setHistory((h) => [input, ...h].slice(0, 20));
    setHistoryIdx(-1);

    if (name === "clear") {
      setLines([]);
      return;
    }
    if (name === "help") {
      const width = Math.max(...commands.map((c) => c.name.length)) + 2;
      setLines((prev) => [
        ...prev,
        echo,
        mk("muted", labels.helpHeading),
        ...commands.map((c) => mk("out", `/${c.name.padEnd(width)}${c.description}`)),
        mk("out", `/${"clear".padEnd(width)}—`),
      ]);
      return;
    }
    const cmd = commands.find((c) => c.name === name);
    if (!cmd) {
      setLines((prev) => [...prev, echo, mk("error", labels.notFound.replace("{cmd}", input))]);
      return;
    }
    const out = (cmd.output ?? []).map((l) => mk("out", l));
    if (cmd.href) out.push(mk("muted", labels.navigating.replace("{path}", cmd.href)));
    setLines((prev) => [...prev, echo, ...out]);
    if (cmd.href) {
      const href = cmd.href;
      setTimeout(() => router.push(href as Parameters<typeof router.push>[0]), reduced ? 0 : 450);
    }
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
    } else if (e.key === "Tab" && value.startsWith("/")) {
      const partial = value.slice(1).toLowerCase();
      const match = [...commands.map((c) => c.name), "help", "clear"].find((n) =>
        n.startsWith(partial),
      );
      if (match && partial.length > 0) {
        e.preventDefault();
        setValue(`/${match}`);
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative overflow-hidden rounded-2xl font-mono text-[0.8rem] leading-relaxed shadow-[0_30px_80px_-30px_rgb(35_0_66/0.6)] glass",
        className,
      )}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-500" />
          <span className="size-2.5 rounded-full bg-lavender-600" />
          <span className="size-2.5 rounded-full bg-lavender-400" />
        </div>
        <p className="flex-1 truncate text-center text-xs text-muted-foreground">{title}</p>
        <span aria-hidden className="w-10" />
      </div>

      {/* output log */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="h-80 overflow-y-auto px-4 py-4 sm:h-96 sm:px-5"
      >
        {lines.map((l) => (
          <TermLine key={l.id} line={l} prompt={prompt} />
        ))}
        {
          <div className="mt-1 flex items-center gap-2 rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
            <span aria-hidden className="text-highlight select-none">
              {prompt}
            </span>
            <label htmlFor={inputId} className="sr-only">
              {labels.inputLabel}
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
              className="min-w-0 flex-1 bg-transparent text-foreground caret-highlight outline-none placeholder:text-muted-foreground"
              placeholder="/help"
            />
          </div>
        }
      </div>

      {/* clickable commands for pointer users */}
      <div
        role="group"
        aria-label={labels.chipsLabel}
        className="flex flex-wrap gap-2 border-t border-border px-4 py-3 sm:px-5"
      >
        {commands.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              run(`/${c.name}`);
            }}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground"
          >
            /{c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TermLine({
  line,
  prompt,
  caret,
  hidden,
}: {
  line: Line;
  prompt: string;
  caret?: boolean;
  hidden?: boolean;
}) {
  return (
    <p
      aria-hidden={hidden || undefined}
      className={cn(
        "break-words whitespace-pre-wrap",
        line.kind === "cmd" && "mt-2 text-foreground first:mt-0",
        line.kind === "out" && "text-foreground/85",
        line.kind === "muted" && "mt-2 text-muted-foreground",
        line.kind === "error" && "text-destructive",
      )}
    >
      {line.kind === "cmd" ? (
        <span aria-hidden className="mr-2 text-highlight select-none">
          {prompt}
        </span>
      ) : null}
      {line.text}
      {caret ? (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-highlight"
        />
      ) : null}
    </p>
  );
}
