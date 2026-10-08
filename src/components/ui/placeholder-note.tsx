import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Visible marker for content the league hasn't provided yet (see docs/INPUTS.md).
 * Never invent data — render this instead. `label` is localized by the caller
 * (e.g. Common.pending → "A confirmar com a liga" / "To be confirmed by the league").
 */
export function PlaceholderNote({
  label,
  children,
  className,
}: {
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "rounded-2xl border border-dashed border-border-strong bg-card/40 p-5 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.68rem] tracking-wide text-highlight uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
        {label}
      </span>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
