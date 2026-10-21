"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PanelTab = { id: string; label: string; content: ReactNode };

/**
 * WAI-ARIA tabs for the fund panel. Every panel is rendered on the server and only hidden on
 * the client, so all figures stay in the HTML (no-JS, search engines, print).
 */
/** `items` may hold false/null for tabs whose data is missing; they are skipped. */
export function PanelTabs({
  label,
  items,
}: {
  label: string;
  items: (PanelTab | false | null | undefined)[];
}) {
  const tabs = items.filter((t): t is PanelTab => !!t);
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    const to =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? tabs.length - 1
          : step === undefined
            ? null
            : (active + step + tabs.length) % tabs.length;
    if (to === null) return;
    e.preventDefault();
    setActive(to);
    refs.current[to]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKey}
        className="-mx-1 flex scrollbar-none gap-1 overflow-x-auto overflow-y-hidden border-b border-border px-1 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${base}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-t-md border-b-2 px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              i === active
                ? "border-highlight text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`${base}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={i !== active}
          tabIndex={0}
          className="pt-6 focus-visible:outline-none"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
