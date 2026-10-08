export type MonthlyBar = { key: string; label: string; value: number; valueLabel: string };

/**
 * Accessible SVG bar chart of the reported monthly returns only (no interpolation).
 * Positive bars use the highlight colour, negative bars the destructive colour.
 * A visually-hidden table carries the same data for assistive tech.
 */
export function MonthlyBars({
  bars,
  ariaLabel,
  tableCaption,
  monthHeader,
  returnHeader,
}: {
  bars: MonthlyBar[];
  ariaLabel: string;
  tableCaption: string;
  monthHeader: string;
  returnHeader: string;
}) {
  const W = 480;
  const H = 260;
  const top = 28; // room for the value label above the tallest positive bar
  const axis = 30; // month-label band at the bottom
  const hasNegative = bars.some((b) => b.value < 0);
  const negPad = hasNegative ? 24 : 0; // keeps a negative bar's value label clear of the month labels
  const plotH = H - top - axis - negPad;
  const max = Math.max(0, ...bars.map((b) => b.value));
  const min = Math.min(0, ...bars.map((b) => b.value));
  const span = max - min || 1;
  const zeroY = top + (max / span) * plotH;
  // horizontal inset so labels centred on the first/last bar never clip at the viewBox edge
  const padX = 32;
  const slot = (W - padX * 2) / Math.max(bars.length, 1);
  const barW = Math.min(88, slot * 0.64);

  // Thin the month labels (and value labels) so they never overlap with 12–36 bars.
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
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-xl"
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
        {bars.map((b, i) => {
          const h = Math.max((Math.abs(b.value) / span) * plotH, 2);
          const x = padX + slot * i + (slot - barW) / 2;
          const positive = b.value >= 0;
          const y = positive ? zeroY - h : zeroY;
          // labels on the outermost bars grow inward so they never clip at the viewBox edge
          const anchor = i === lastIndex ? "end" : i === 0 ? "start" : "middle";
          const labelX = anchor === "end" ? x + barW : anchor === "start" ? x : x + barW / 2;
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
              {(lastIndex - i) % labelStep === 0 ? (
                <text
                  x={labelX}
                  y={H - 8}
                  textAnchor={anchor}
                  className="fill-muted-foreground font-mono text-[12px]"
                >
                  {b.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{monthHeader}</th>
            <th scope="col">{returnHeader}</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b) => (
            <tr key={b.key}>
              <th scope="row">{b.label}</th>
              <td>{b.valueLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
