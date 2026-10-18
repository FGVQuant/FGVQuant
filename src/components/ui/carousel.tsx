"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const arrowClass =
  "inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * Native scroll-snap row; the arrows (sm+) only scroll it by one viewport. Swipe and
 * trackpad scrolling work without them.
 */
export function Carousel({
  children,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth, behavior: "smooth" });
  return (
    <div>
      <div className="hidden justify-end gap-2 sm:flex">
        <button type="button" aria-label={prevLabel} className={arrowClass} onClick={() => scroll(-1)}>
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label={nextLabel} className={arrowClass} onClick={() => scroll(1)}>
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
      <ul
        ref={ref}
        className="-mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 scrollbar-none gap-4 overflow-x-auto px-5 pb-3 md:-mx-8 md:scroll-px-8 md:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </div>
  );
}
