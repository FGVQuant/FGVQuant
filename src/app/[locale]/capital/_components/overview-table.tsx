export type OverviewColumn = { id: string; label: string; highlight?: boolean };
export type OverviewRow = { label: string; values: (string | null)[] };

/**
 * "Panorama geral" table: metrics down the side, strategies / fund / benchmark across.
 * The fund column is tinted; empty cells (metric not applicable) show an en dash.
 * Scrolls horizontally on narrow screens rather than squeezing the numbers; the metric column
 * stays pinned so each row keeps its label.
 */
export function OverviewTable({
  caption,
  metricHeader,
  columns,
  rows,
}: {
  caption: string;
  metricHeader: string;
  columns: OverviewColumn[];
  rows: OverviewRow[];
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-strong">
            <th
              scope="col"
              className="sticky left-0 bg-card py-3 pr-4 text-left font-mono text-xs font-normal tracking-wide text-muted-foreground uppercase"
            >
              {metricHeader}
            </th>
            {columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                className={
                  c.highlight
                    ? "rounded-t-lg bg-highlight/10 px-3 py-3 text-right font-sans text-sm font-semibold text-foreground"
                    : "px-3 py-3 text-right font-sans text-sm font-medium text-foreground"
                }
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border">
              <th
                scope="row"
                className="sticky left-0 bg-card py-3 pr-4 text-left font-normal text-muted-foreground"
              >
                {r.label}
              </th>
              {r.values.map((v, i) => (
                <td
                  key={columns[i].id}
                  className={`px-3 py-3 text-right font-mono tabular-nums ${
                    columns[i].highlight ? "bg-highlight/10 text-foreground" : "text-foreground/90"
                  }`}
                >
                  {v ?? <span className="text-muted-foreground">–</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
