"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-following radial glow. Renders an absolutely positioned decorative layer and
 * tracks the pointer on its parent (CSS vars `--mx`/`--my`). The parent must be `group relative`.
 */
export function BentoGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      parent.style.setProperty("--mx", `${e.clientX - r.left}px`);
      parent.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    parent.addEventListener("pointermove", onMove, { passive: true });
    return () => parent.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
      style={{
        background:
          "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), var(--glow), transparent 70%)",
      }}
    />
  );
}
