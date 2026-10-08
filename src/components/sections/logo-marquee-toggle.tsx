"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/** Pause/play pill for the CSS-driven marquee (WCAG 2.2.2). Toggles `data-paused` on the sibling `.fq-marquee`. */
export function MarqueeToggle({
  pauseLabel = "Pausar",
  playLabel = "Retomar",
}: {
  pauseLabel?: string;
  playLabel?: string;
}) {
  const [paused, setPaused] = useState(false);
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        e.currentTarget.parentElement
          ?.querySelector(".fq-marquee")
          ?.setAttribute("data-paused", String(next));
      }}
      className="fq-marquee-toggle mt-3 ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground"
    >
      <Icon className="size-3" aria-hidden />
      {paused ? playLabel : pauseLabel}
    </button>
  );
}
