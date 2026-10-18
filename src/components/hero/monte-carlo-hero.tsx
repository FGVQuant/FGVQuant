import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MonteCarloCanvas } from "./monte-carlo-canvas";

/**
 * Hero section: copy on the left, Monte Carlo fan resolving into the bull mark on the right.
 * All strings come in via props (the page passes translated copy).
 */
export type MonteCarloHeroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small mono caption describing the simulation, e.g. "N = 128 · μ = 8% · σ = 24%". */
  legend?: ReactNode;
  /** Shorter caption shown below `sm`, where the full legend is hidden. */
  legendShort?: ReactNode;
  className?: string;
};

export function MonteCarloHero({
  eyebrow,
  title,
  description,
  actions,
  legend,
  legendShort,
  className,
}: MonteCarloHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate -mt-16 flex min-h-[min(100svh,56rem)] items-start overflow-hidden pt-16 xl:items-center",
        className,
      )}
    >
      {/* backdrop layers */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-glow" />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-grid [mask-image:radial-gradient(ellipse_80%_70%_at_60%_45%,black,transparent_80%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,black_70%,rgb(0_0_0/0.5))] xl:[mask-image:linear-gradient(to_right,rgb(0_0_0/0.16),rgb(0_0_0/0.45)_35%,black_52%)]"
      >
        <MonteCarloCanvas />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative container-page pt-[152px] pb-24 sm:pt-48 md:pb-32 xl:pt-32">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="flex items-center gap-2 text-sm font-medium text-highlight">
              <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">{description}</p>
          ) : null}
          {actions ? (
            <div className="mt-10 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
      </div>

      {legendShort ? (
        <p className="absolute right-5 bottom-6 font-mono text-[0.68rem] tracking-wide text-muted-foreground sm:hidden">
          {legendShort}
        </p>
      ) : null}
      {legend ? (
        <p className="absolute right-5 bottom-6 hidden font-mono text-[0.68rem] tracking-wide text-muted-foreground sm:block md:right-8">
          {legend}
        </p>
      ) : null}
    </section>
  );
}
