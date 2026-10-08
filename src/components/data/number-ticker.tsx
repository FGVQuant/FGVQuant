"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type NumberTickerProps = {
  /** Final value to count up to. */
  value: number;
  /** Fixed number of decimal places. */
  decimals?: number;
  /** Text rendered before the number (e.g. "+"). */
  prefix?: string;
  /** Text rendered after the number (e.g. "%"). */
  suffix?: string;
  /** BCP 47 locale for formatting. Defaults to "pt-BR". */
  locale?: string;
  className?: string;
};

/**
 * Animates from 0 to `value` with a spring the first time it scrolls into view.
 * Renders the final value statically under reduced motion; the final value is
 * always exposed to screen readers.
 */
export function NumberTicker({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "pt-BR",
  className,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();

  const format = (n: number) =>
    `${prefix}${new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !inView) return;
    const controls = animate(0, value, {
      type: "spring",
      stiffness: 60,
      damping: 20,
      mass: 1,
      restDelta: 10 ** -(decimals + 1),
      onUpdate: (latest) => {
        el.textContent = format(latest);
      },
      onComplete: () => {
        el.textContent = format(value);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, decimals, prefix, suffix, locale]);

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden="true" className={cn("font-mono tabular-nums", className)}>
        {format(reduced ? value : 0)}
      </span>
    </>
  );
}
