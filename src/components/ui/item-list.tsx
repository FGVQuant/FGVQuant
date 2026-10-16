import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ItemListEntry = {
  key: string;
  title: ReactNode;
  body: ReactNode;
  /** Short leading marker, e.g. the position in a fixed sequence. Only when order carries meaning. */
  marker?: ReactNode;
  /** Trailing link or button. */
  action?: ReactNode;
};

/**
 * Editorial list of short items (formats, offers, channels): ruled rows instead of a grid of
 * identical icon cards. Title and body share a row on md+, with an optional action on the right.
 */
export function ItemList({ items, className }: { items: ItemListEntry[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <li
          key={item.key}
          className="grid gap-x-10 gap-y-2 py-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_auto] md:items-baseline"
        >
          <h3 className="flex items-baseline gap-3 font-sans text-lg font-semibold tracking-tight text-foreground">
            {item.marker ? (
              <span className="text-sm font-normal text-muted-foreground tabular-nums">
                {item.marker}
              </span>
            ) : null}
            {item.title}
          </h3>
          <div className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
            {item.body}
          </div>
          {item.action ? <div className="md:justify-self-end">{item.action}</div> : null}
        </li>
      ))}
    </ul>
  );
}
