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
  const H = 240;
  const top = 36;
  const bottom = 32;
  const plotH = H - top - bottom;
  const max = Math.max(0, ...bars.map((b) => b.value));
  const min = Math.min(0, ...bars.map((b) => b.value));
  const span = max - min || 1;
  const zeroY = top + (max / span) * plotH;
  const slot = W / Math.max(bars.length, 1);
  const barW = Math.min(88, slot * 0.5);

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
          const x = slot * i + (slot - barW) / 2;
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
              <text
                x={x + barW / 2}
                y={positive ? y - 8 : y + h + 16}
                textAnchor="middle"
                className="fill-foreground font-mono text-[13px]"
              >
                {b.valueLabel}
              </text>
              <text
                x={x + barW / 2}
                y={H - 8}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[12px]"
              >
                {b.label}
              </text>
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
