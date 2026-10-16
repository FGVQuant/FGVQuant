import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

/** Accessible accordion built on native <details>/<summary>. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl bg-card">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-highlight transition-[rotate] duration-200 ease-out group-open:rotate-180"
            />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:px-6 md:text-base">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
