import type { CSSProperties, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { MarqueeToggle } from "./logo-marquee-toggle";

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
  /** Pause button label. Default "Pausar". */
  pauseLabel?: string;
  /** Play button label. Default "Retomar". */
  playLabel?: string;
  /** Screen-reader hint on external links. Default "(abre em nova aba)". */
  newTabLabel?: string;
}

const CSS = `
@keyframes fq-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fq-marquee { -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
.fq-marquee-track { animation: fq-marquee var(--fq-speed, 40s) linear infinite; animation-direction: var(--fq-dir, normal); }
.fq-marquee[data-paused="true"] .fq-marquee-track { animation-play-state: paused; }
.fq-marquee[data-pause="true"]:hover .fq-marquee-track,
.fq-marquee[data-pause="true"]:focus-within .fq-marquee-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .fq-marquee-toggle { display: none; }
  .fq-marquee { -webkit-mask-image: none; mask-image: none; }
  .fq-marquee-track { animation: none !important; width: auto; flex-wrap: wrap; justify-content: center; }
  .fq-marquee-copy { flex-wrap: wrap; justify-content: center; padding-right: 0 !important; }
  .fq-marquee-copy[aria-hidden="true"] { display: none; }
}
`;

function Item({
  name,
  logo,
  href,
  hidden,
  newTabLabel,
}: LogoMarqueeItem & { hidden?: boolean; newTabLabel: string }) {
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
          <span className="sr-only">{newTabLabel}</span>
        </a>
      ) : (
        <span className={cls}>{content}</span>
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
  pauseLabel,
  playLabel,
  newTabLabel,
}: LogoMarqueeProps) {
  const t = useTranslations("Common");
  newTabLabel ??= t("newTab");
  pauseLabel ??= t("marqueePause");
  playLabel ??= t("marqueePlay");
  const style = {
    "--fq-speed": `${speed}s`,
    "--fq-dir": reverse ? "reverse" : "normal",
  } as CSSProperties;

  return (
    <div className={cn("w-full", className)}>
      <div
        role="group"
        aria-label={label}
        data-pause={pauseOnHover}
        style={style}
        className="fq-marquee relative w-full overflow-hidden"
      >
        <style>{CSS}</style>
        <div className="fq-marquee-track flex w-max">
          {[false, true].map((hidden) => (
            <ul
              key={String(hidden)}
              aria-hidden={hidden || undefined}
              className="fq-marquee-copy flex shrink-0 items-center gap-10 pr-10"
            >
              {items.map((item, i) => (
                <Item
                  key={`${item.name}-${i}`}
                  {...item}
                  hidden={hidden}
                  newTabLabel={newTabLabel}
                />
              ))}
            </ul>
          ))}
        </div>
      </div>
      <MarqueeToggle pauseLabel={pauseLabel} playLabel={playLabel} />
    </div>
  );
}
