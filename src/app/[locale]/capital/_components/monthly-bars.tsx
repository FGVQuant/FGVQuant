export type MonthlyBar = { key: string; label: string; value: number; valueLabel: string };

/** The chart keeps a fixed size: it shows at most this many months, the collapsed list has them all. */
const WINDOW = 24;

/**
 * Accessible SVG bar chart of the reported monthly returns (no interpolation).
 * Positive bars use the highlight colour, negative bars the destructive colour. Months the league
 * did not report are left out (the caller names them in the coverage line).
 * Short and wide so it fits under the KPIs: it shows the latest WINDOW months, its labels thin out
 * as needed, and every month sits in a collapsed grid below. On narrow screens the chart scrolls
 * inside its card instead of shrinking its labels.
 */
export function MonthlyBars({
  bars: all,
  ariaLabel,
  tableCaption,
  coverage,
  windowNote,
}: {
  bars: MonthlyBar[];
  ariaLabel: string;
  /** label of the collapsed month-by-month values */
  tableCaption: string;
  /** e.g. "12 months reported · Jul 2025–Aug 2026", derived from the data by the caller */
  coverage: string;
  /** shown when the chart holds only the latest months, e.g. "chart shows the last 24 months" */
  windowNote: string;
}) {
  const bars = all.slice(-WINDOW);
  const values = bars.map((b) => b.value);
  const W = 960;
  const H = 200;
  const top = 28; // room for the value label above the tallest positive bar
  const axis = 30; // month-label band at the bottom
  const hasNegative = values.some((v) => v < 0);
  const negPad = hasNegative ? 24 : 0; // keeps a negative bar's value label clear of the month labels
  const plotH = H - top - axis - negPad;
  const max = Math.max(0, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const zeroY = top + (max / span) * plotH;
  // horizontal inset so labels centred on the first/last bar never clip at the viewBox edge
  const padX = 32;
  const slot = (W - padX * 2) / Math.max(bars.length, 1);
  const barW = Math.min(56, slot * 0.64);

  // Thin the month labels (and value labels) so they never overlap.
  const longestLabel = Math.max(0, ...bars.map((b) => b.label.length));
  const labelStep = Math.max(1, Math.ceil((longestLabel * 7.5 + 10) / slot));
  const longestValue = Math.max(0, ...bars.map((b) => b.valueLabel.length));
  const showAllValues = slot >= longestValue * 8 + 6;
  const extremes = new Set(
    [bars.findIndex((b) => b.value === max), bars.findIndex((b) => b.value === min)].filter(
      (i) => i >= 0,
    ),
  );
  // anchor the thinning on the latest month so the most recent label is always shown
  const lastIndex = bars.length - 1;

  return (
    <figure>
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[640px]"
        >
          <line
            x1={0}
            x2={W}
            y1={zeroY}
            y2={zeroY}
            className="stroke-border-strong"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <text
            x={2}
            y={zeroY - 5}
            textAnchor="start"
            className="fill-muted-foreground font-mono text-[12px]"
          >
            0%
          </text>
          {bars.map((b, i) => {
            const x = padX + slot * i + (slot - barW) / 2;
            // labels on the outermost bars grow inward so they never clip at the viewBox edge
            const anchor = i === lastIndex ? "end" : i === 0 ? "start" : "middle";
            const labelX = anchor === "end" ? x + barW : anchor === "start" ? x : x + barW / 2;
            const monthLabel =
              (lastIndex - i) % labelStep === 0 ? (
                <text
                  x={labelX}
                  y={H - 8}
                  textAnchor={anchor}
                  className="fill-muted-foreground font-mono text-[12px]"
                >
                  {b.label}
                </text>
              ) : null;
            const h = Math.max((Math.abs(b.value) / span) * plotH, 2);
            const positive = b.value >= 0;
            const y = positive ? zeroY - h : zeroY;
            return (
              <g key={b.key}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={4}
                  className={positive ? "fill-highlight" : "fill-destructive"}
                />
                {showAllValues || extremes.has(i) ? (
                  <text
                    x={labelX}
                    y={positive ? y - 8 : y + h + 16}
                    textAnchor={anchor}
                    className="fill-foreground font-mono text-[13px]"
                  >
                    {b.valueLabel}
                  </text>
                ) : null}
                {monthLabel}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {coverage}
        {all.length > bars.length ? ` · ${windowNote}` : null}
      </p>
      <details className="group mt-3">
        <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
          {tableCaption}
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4 lg:grid-cols-6">
          {all.map((b) => (
            <div key={b.key} className="flex justify-between gap-3 border-t border-border py-1.5">
              <dt className="font-mono text-muted-foreground">{b.label}</dt>
              <dd className="font-mono tabular-nums">{b.valueLabel}</dd>
            </div>
          ))}
        </dl>
      </details>
    </figure>
  );
}
