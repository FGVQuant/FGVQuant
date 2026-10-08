import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard intro band for inner pages: node-dot eyebrow, Lora h1 (use <Em> for one emphasised
 * word), muted lead, optional actions/meta. Sits under the sticky header on a soft glow + grid.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** actions or meta rendered under the lead */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden border-b border-border", className)}>
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_70%_80%_at_30%_0%,black,transparent_75%)]"
      />
      <div className="container-page pt-20 pb-14 md:pt-28 md:pb-20">
        {eyebrow ? (
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
