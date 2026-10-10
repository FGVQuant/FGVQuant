import { NumberTicker } from "@/components/data/number-ticker";
import { Sparkline } from "@/components/data/sparkline";
import { cn } from "@/lib/utils";

type KpiItem = {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Optional series drawn as a sparkline under the number. */
  spark?: number[];
  /** Accessible description of the sparkline (localized), e.g. "Retorno acumulado mensal". */
  sparkLabel?: string;
  /** Small footnote (e.g. "Fundo fictício"). */
  note?: string;
};

type KpiStripProps = {
  items: KpiItem[];
  locale?: string;
  className?: string;
};

/**
 * Hairline-bordered band of KPIs: 2 columns on mobile, 4 on large screens.
 * Each cell shows a mono label, an animated number, optional sparkline and note.
 */
export function KpiStrip({ items, locale, className }: KpiStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 border-y border-border lg:grid-cols-4 lg:divide-x lg:divide-border",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className={cn(
            "flex flex-col gap-3 p-5 transition-colors hover:bg-accent sm:p-8",
            i % 2 === 1 && "border-l border-border lg:border-l-0",
            i >= 2 && "border-t border-border lg:border-t-0",
          )}
        >
          <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {item.label}
          </span>
          <NumberTicker
            value={item.value}
            decimals={item.decimals}
            prefix={item.prefix}
            suffix={item.suffix}
            locale={locale}
            className="text-3xl text-foreground sm:text-4xl xl:text-5xl"
          />
          {item.spark && item.spark.length > 1 && (
            <Sparkline data={item.spark} area label={item.sparkLabel ?? item.label} />
          )}
          {item.note && (
            <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              * {item.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
