import { cn } from "@/lib/utils";

type IssueCoverProps = {
  /** Month name in the page locale, e.g. "Setembro". */
  month: string;
  year: string;
  /** Series name, e.g. "FGV Quant Insights". */
  series: string;
  /** First tag or the featured personality. */
  topic?: string;
  large?: boolean;
  className?: string;
};

/** Text-led cover built only from edition data (no numbering, no artwork). */
export function IssueCover({
  month,
  year,
  series,
  topic,
  large = false,
  className,
}: IssueCoverProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex aspect-[16/9] flex-col justify-between overflow-hidden rounded-xl bg-brand-950 p-4 sm:p-5",
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-40" />

      <p className="relative text-sm font-medium text-lavender-400">{series}</p>

      <div className="relative">
        {/* Hairline with a single node: the one graphic accent. */}
        <div className="mb-3 flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-highlight" />
          <span className="h-px flex-1 bg-gradient-to-r from-highlight/60 to-transparent" />
        </div>
        <p
          className={cn(
            "flex flex-wrap items-baseline gap-x-3 font-display leading-none text-foreground",
            large ? "text-4xl sm:text-5xl md:text-6xl" : "text-3xl sm:text-4xl",
          )}
        >
          <span className="min-w-0 break-words">{month}</span>
          <span className="font-mono text-base tracking-tight text-lavender-400 sm:text-lg">
            {year}
          </span>
        </p>
        {topic ? <p className="mt-2 truncate text-sm text-muted-foreground">{topic}</p> : null}
      </div>
    </div>
  );
}
