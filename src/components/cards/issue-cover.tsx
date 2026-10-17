import { cn } from "@/lib/utils";
import { IssueFigure, type IssueFigureKind } from "@/components/cards/issue-figure";

type IssueCoverProps = {
  /** Month name in the page locale, e.g. "Setembro". */
  month: string;
  year: string;
  /** Series name, e.g. "FGV Quant Insights". */
  series: string;
  /** First tag or the featured personality. */
  topic?: string;
  /** Topic figure drawn in the upper right; omitted when the issue's topic is unknown. */
  figure?: IssueFigureKind;
  /** Small "Illustrative figure" note shown with the figure. */
  figureNote?: string;
  large?: boolean;
  className?: string;
};

/**
 * Cover built from edition data: month typography plus, when known, one figure for the topic.
 * The cover is a dark object in both themes, so its text uses fixed light colours, not theme tokens.
 */
export function IssueCover({
  month,
  year,
  series,
  topic,
  figure,
  figureNote,
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

      {figure ? (
        <IssueFigure
          kind={figure}
          className="absolute top-[12%] right-[4%] w-[58%] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] text-lavender-400"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-lavender-400">{series}</p>
        {figure && figureNote ? <p className="text-xs text-lavender-300/80">{figureNote}</p> : null}
      </div>

      <div className="relative">
        {/* Hairline with a single node: the graphic accent when there is no topic figure. */}
        {figure ? null : (
          <div className="mb-3 flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-highlight" />
            <span className="h-px flex-1 bg-gradient-to-r from-highlight/60 to-transparent" />
          </div>
        )}
        <p
          className={cn(
            "flex flex-wrap items-baseline gap-x-3 font-display leading-none text-white",
            large ? "text-4xl sm:text-5xl md:text-6xl" : "text-3xl sm:text-4xl",
          )}
        >
          <span className="min-w-0 break-words">{month}</span>
          <span className="font-mono text-base tracking-tight text-lavender-400 sm:text-lg">
            {year}
          </span>
        </p>
        {topic ? <p className="mt-2 truncate text-sm text-lavender-300">{topic}</p> : null}
      </div>
    </div>
  );
}
