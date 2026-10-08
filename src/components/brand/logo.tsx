import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Localized tagline; rendered beneath the wordmark when provided. */
  tagline?: string;
  /** Hide the wordmark and show the mark only. */
  markOnly?: boolean;
};

export function Logo({ className, tagline, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-foreground", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="20 22 1010 750"
        aria-hidden="true"
        focusable="false"
        className="h-7 w-auto shrink-0 text-highlight"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="17"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="525" y1="250" x2="525" y2="620" />
          <line x1="525" y1="620" x2="525" y2="745" />
          <line x1="150" y1="48" x2="45" y2="255" />
          <line x1="45" y1="255" x2="95" y2="400" />
          <line x1="150" y1="48" x2="110" y2="290" />
          <line x1="110" y1="290" x2="95" y2="400" />
          <line x1="95" y1="400" x2="295" y2="395" />
          <line x1="110" y1="290" x2="375" y2="195" />
          <line x1="110" y1="290" x2="295" y2="395" />
          <line x1="375" y1="195" x2="295" y2="395" />
          <line x1="375" y1="195" x2="525" y2="250" />
          <line x1="525" y1="250" x2="295" y2="395" />
          <line x1="295" y1="395" x2="450" y2="475" />
          <line x1="425" y1="530" x2="525" y2="620" />
          <line x1="295" y1="395" x2="387" y2="612" />
          <line x1="450" y1="475" x2="425" y2="530" />
          <line x1="425" y1="530" x2="387" y2="612" />
          <line x1="387" y1="612" x2="398" y2="715" />
          <line x1="398" y1="715" x2="525" y2="620" />
          <line x1="398" y1="715" x2="525" y2="745" />
          <line x1="340" y1="472" x2="392" y2="490" />
          <line x1="392" y1="490" x2="368" y2="552" />
          <line x1="900" y1="48" x2="1005" y2="255" />
          <line x1="1005" y1="255" x2="955" y2="400" />
          <line x1="900" y1="48" x2="940" y2="290" />
          <line x1="940" y1="290" x2="955" y2="400" />
          <line x1="955" y1="400" x2="755" y2="395" />
          <line x1="940" y1="290" x2="675" y2="195" />
          <line x1="940" y1="290" x2="755" y2="395" />
          <line x1="675" y1="195" x2="755" y2="395" />
          <line x1="675" y1="195" x2="525" y2="250" />
          <line x1="525" y1="250" x2="755" y2="395" />
          <line x1="755" y1="395" x2="600" y2="475" />
          <line x1="625" y1="530" x2="525" y2="620" />
          <line x1="755" y1="395" x2="663" y2="612" />
          <line x1="600" y1="475" x2="625" y2="530" />
          <line x1="625" y1="530" x2="663" y2="612" />
          <line x1="663" y1="612" x2="652" y2="715" />
          <line x1="652" y1="715" x2="525" y2="620" />
          <line x1="652" y1="715" x2="525" y2="745" />
          <line x1="710" y1="472" x2="658" y2="490" />
          <line x1="658" y1="490" x2="682" y2="552" />
        </g>
        <g fill="currentColor">
          <circle cx="525" cy="250" r="21" />
          <circle cx="110" cy="290" r="21" />
          <circle cx="375" cy="195" r="21" />
          <circle cx="295" cy="395" r="21" />
          <circle cx="450" cy="475" r="21" />
          <circle cx="940" cy="290" r="21" />
          <circle cx="675" cy="195" r="21" />
          <circle cx="755" cy="395" r="21" />
          <circle cx="600" cy="475" r="21" />
        </g>
      </svg>
      {markOnly ? (
        <span className="sr-only">FGV Quant</span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-wide whitespace-nowrap">
            FGV QUANT
          </span>
          {tagline ? (
            <span className="mt-1.5 font-mono text-[0.65rem] tracking-wide text-muted-foreground uppercase">
              {tagline}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
