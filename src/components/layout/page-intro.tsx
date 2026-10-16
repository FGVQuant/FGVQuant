import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard intro band for inner pages: node-dot eyebrow, plain Lora h1, muted lead, optional
 * actions/meta, and an optional page motif. Flat: it sits on the site-wide dots, no glow.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
  motif,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** actions or meta rendered under the lead */
  children?: ReactNode;
  /** page-specific line-art (see intro-motifs.tsx), drawn faintly on the right of the band */
  motif?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border section-tone",
        className,
      )}
    >
      {motif ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 container-page">
          <div className="absolute top-6 right-0 h-40 w-3/5 text-highlight opacity-35 sm:h-52 lg:inset-y-0 lg:my-auto lg:h-[72%] lg:max-h-80 lg:w-[45%] lg:[mask-image:linear-gradient(to_right,transparent,black_35%)] lg:opacity-100">
            {motif}
          </div>
        </div>
      ) : null}
      <div className="container-page pt-20 pb-14 md:pt-28 md:pb-20">
        {eyebrow ? (
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "mt-5 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl",
            motif && "lg:max-w-[52%]", // keep long headlines clear of the motif
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg text-pretty text-muted-foreground",
              motif && "lg:max-w-[52%]",
            )}
          >
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
