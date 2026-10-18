import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Headline, written plain (emphasis is reserved for the home hero). */
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Heading level element. Defaults to h2. */
  as?: "h1" | "h2";
  /** Optional trailing slot (e.g. a ButtonLink), aligned to the right on md+. */
  action?: ReactNode;
  className?: string;
};

/** Emphasis for a single word/phrase in the home hero headline only: Lora italic in the accent (see `text-emphasis`). */
export function Em({ children }: { children: ReactNode }) {
  return <em className="text-emphasis">{children}</em>;
}

/** Section intro: serif headline, muted description. No eyebrow: the headline carries the section. */
export function SectionHeader({
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
