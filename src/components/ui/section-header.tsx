import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  /** Headline; wrap one word in `<Em>` for the lavender accent. */
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Heading level element. Defaults to h2. */
  as?: "h1" | "h2";
  /** Optional trailing slot (e.g. a ButtonLink), aligned to the right on md+. */
  action?: ReactNode;
  className?: string;
};

/** Lavender emphasis for a single word inside a headline. */
export function Em({ children }: { children: ReactNode }) {
  return <em className="font-[inherit] text-highlight not-italic">{children}</em>;
}

/** Section intro: node-dot eyebrow, serif headline, muted description. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  action,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        centered && "md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-4 inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] text-highlight uppercase",
            )}
          >
            <span aria-hidden className="relative flex size-2 items-center justify-center">
              <span className="absolute size-2 rounded-full bg-highlight/30" />
              <span className="size-1 rounded-full bg-highlight" />
            </span>
            {eyebrow}
          </p>
        ) : null}
        <Heading className="font-display text-3xl leading-[1.1] font-medium tracking-tight text-balance text-foreground sm:text-4xl md:text-5xl">
          {title}
        </Heading>
        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg",
              centered && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
