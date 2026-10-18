import { cn } from "@/lib/utils";

type NumberTickerProps = {
  /** Final value to display. */
  value: number;
  /** Fixed number of decimal places. */
  decimals?: number;
  /** Text rendered before the number (e.g. "+"). */
  prefix?: string;
  /** Text rendered after the number (e.g. "%"). */
  suffix?: string;
  /** BCP 47 locale for formatting. Defaults to "pt-BR". */
  locale?: string;
  className?: string;
};

/**
 * Renders the final formatted value, static. Factual figures (stats, simulated-fund returns) are
 * never animated or hidden: no count-up through wrong intermediate numbers, and no fade that could
 * leave a blank in print, screenshots or when an in-view trigger never fires.
 */
export function NumberTicker({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "pt-BR",
  className,
}: NumberTickerProps) {
  const nf = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span className={cn("font-sans tracking-tight tabular-nums", className)}>
      {`${prefix}${nf.format(value)}${suffix}`}
    </span>
  );
}
