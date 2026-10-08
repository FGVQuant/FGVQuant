import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Prominent simulated-fund disclaimer. Rendered near the top and again at the bottom. */
export function Disclaimer({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <aside
      role="note"
      aria-label={title}
      className={cn("rounded-2xl border border-highlight/40 bg-highlight/10 p-5 sm:p-6", className)}
    >
      <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
        <ShieldAlert aria-hidden className="size-4" />
        {title}
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-foreground sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-highlight" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
