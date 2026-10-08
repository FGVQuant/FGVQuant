import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LogoMarqueeItem {
  name: string;
  logo?: ReactNode;
  href?: string;
}

export interface LogoMarqueeProps {
  items: LogoMarqueeItem[];
  /** Seconds per full loop. Default 40. */
  speed?: number;
  reverse?: boolean;
  /** Pause on hover/focus. Default true. */
  pauseOnHover?: boolean;
  className?: string;
  /** Accessible label for the list. */
  label?: string;
}

const CSS = `
@keyframes fq-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fq-marquee { -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
.fq-marquee-track { animation: fq-marquee var(--fq-speed, 40s) linear infinite; animation-direction: var(--fq-dir, normal); }
.fq-marquee[data-pause="true"]:hover .fq-marquee-track,
.fq-marquee[data-pause="true"]:focus-within .fq-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .fq-marquee { -webkit-mask-image: none; mask-image: none; }
  .fq-marquee-track { animation: none !important; width: auto; flex-wrap: wrap; justify-content: center; }
  .fq-marquee-copy { flex-wrap: wrap; justify-content: center; padding-right: 0 !important; }
  .fq-marquee-copy[aria-hidden="true"] { display: none; }
}
`;

function Item({ name, logo, href, hidden }: LogoMarqueeItem & { hidden?: boolean }) {
  const cls =
    "inline-flex items-center rounded-lg opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 focus-visible:opacity-100 focus-visible:grayscale-0";
  const content = logo ?? (
    <span className="rounded-lg border border-border bg-card/60 px-4 py-2 font-mono text-sm tracking-wide whitespace-nowrap text-foreground">
      {name}
    </span>
  );
  return (
    <li className="shrink-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={name}
          tabIndex={hidden ? -1 : undefined}
          className={cls}
        >
          {content}
        </a>
      ) : (
        <span className={cls} aria-label={logo ? name : undefined}>
          {content}
        </span>
      )}
    </li>
  );
}

/**
 * Infinite, seamless logo marquee. The list is duplicated (second copy aria-hidden);
 * edges fade via mask-image. Under reduced motion it becomes a centered wrapped row.
 */
export function LogoMarquee({
  items,
  speed = 40,
  reverse = false,
  pauseOnHover = true,
  className,
  label,
}: LogoMarqueeProps) {
  const style = {
    "--fq-speed": `${speed}s`,
    "--fq-dir": reverse ? "reverse" : "normal",
  } as CSSProperties;

  return (
    <div
      role="group"
      aria-label={label}
      data-pause={pauseOnHover}
      style={style}
      className={cn("fq-marquee relative w-full overflow-hidden", className)}
    >
      <style>{CSS}</style>
      <div className="fq-marquee-track flex w-max">
        {[false, true].map((hidden) => (
          <ul
            key={String(hidden)}
            aria-hidden={hidden || undefined}
            className="fq-marquee-copy flex shrink-0 items-center gap-10 pr-10"
          >
            {items.map((item) => (
              <Item key={item.name} {...item} hidden={hidden} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
