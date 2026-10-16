/**
 * Illustrative z-score of a pair's spread, showing the Pairs Trading rule: open when |z| crosses
 * the entry band (≈2σ), close when it comes back inside the exit band (≈0.5σ).
 * The series is hand-shaped (deterministic) to show one trade on each side; it is not fund data.
 */
const ENTRY = 2;
const EXIT = 0.5;
const W = 600;
const H = 260;
const PAD_L = 44;
const PAD_R = 8;
const PAD_Y = 14;
const Z_MAX = 3;

/** Key points (t, z) the series passes through; noise is layered on top. */
const KEYS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.2],
  [16, 0.9],
  [30, 1.5],
  [42, 2.3],
  [54, 2.6],
  [70, 1.7],
  [86, 0.35],
  [100, -0.3],
  [114, -1.2],
  [128, -2.25],
  [140, -2.5],
  [156, -1.5],
  [172, -0.35],
  [186, 0.25],
  [200, 0.55],
];
const STEPS = 200;

function series() {
  const z: number[] = [];
  for (let t = 0; t <= STEPS; t++) {
    const k = KEYS.findIndex(([kt]) => kt >= t);
    const [t1, z1] = KEYS[Math.max(k, 1)];
    const [t0, z0] = KEYS[Math.max(k, 1) - 1];
    const u = (t - t0) / (t1 - t0);
    const s = u * u * (3 - 2 * u); // smoothstep between key points
    const noise =
      0.13 * Math.sin(t * 0.9) + 0.08 * Math.sin(t * 2.3 + 1) + 0.05 * Math.sin(t * 5.1);
    z.push(z0 + (z1 - z0) * s + noise);
  }
  return z;
}

/** [open, close] step indices, applying the entry/exit rule to the series. */
function trades(z: number[]) {
  const out: [number, number][] = [];
  let open = -1;
  z.forEach((v, t) => {
    if (open < 0 && Math.abs(v) >= ENTRY) open = t;
    else if (open >= 0 && Math.abs(v) <= EXIT) {
      out.push([open, t]);
      open = -1;
    }
  });
  return out;
}

const x = (t: number) => PAD_L + (t / STEPS) * (W - PAD_L - PAD_R);
const y = (v: number) => PAD_Y + ((Z_MAX - v) / (2 * Z_MAX)) * (H - 2 * PAD_Y);

export function ZScoreChart({
  ariaLabel,
  entryLabel,
  exitLabel,
  openLabel,
  locale,
}: {
  ariaLabel: string;
  entryLabel: string;
  exitLabel: string;
  openLabel: string;
  /** BCP 47 locale for the axis labels ("+0,5" vs "+0.5") */
  locale: string;
}) {
  const axis = new Intl.NumberFormat(locale, { signDisplay: "exceptZero" });
  const z = series();
  const spans = trades(z);
  const path = z.map((v, t) => `${t ? "L" : "M"}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const band = (v: number) => ({ x1: PAD_L, x2: W - PAD_R, y1: y(v), y2: y(v) });

  return (
    <figure>
      <svg role="img" aria-label={ariaLabel} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* open-position spans */}
        {spans.map(([a, b]) => (
          <rect
            key={a}
            x={x(a)}
            y={PAD_Y}
            width={x(b) - x(a)}
            height={H - 2 * PAD_Y}
            rx={6}
            className="fill-highlight/10"
          />
        ))}
        {/* bands */}
        <line {...band(0)} className="stroke-border-strong" strokeWidth={1} />
        {[ENTRY, -ENTRY].map((v) => (
          <line
            key={v}
            {...band(v)}
            className="stroke-highlight"
            strokeOpacity={0.7}
            strokeWidth={1}
            strokeDasharray="6 5"
          />
        ))}
        {[EXIT, -EXIT].map((v) => (
          <line
            key={v}
            {...band(v)}
            className="stroke-muted-foreground"
            strokeOpacity={0.6}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        {[ENTRY, EXIT, 0, -EXIT, -ENTRY].map((v) => (
          <text
            key={v}
            x={PAD_L - 6}
            y={y(v) + 4}
            textAnchor="end"
            // on phones the chart is ~half size: keep only the ±2 entry labels, larger
            className={`fill-muted-foreground font-mono text-[11px] max-sm:text-[20px] ${
              Math.abs(v) === ENTRY ? "" : "max-sm:hidden"
            }`}
          >
            {axis.format(v)}
          </text>
        ))}
        <path d={path} fill="none" className="stroke-foreground" strokeWidth={1.75} />
        {/* entry (filled) and exit (hollow) markers */}
        {spans.map(([a, b]) => (
          <g key={`m${a}`}>
            <circle cx={x(a)} cy={y(z[a])} r={5} className="fill-highlight" />
            <circle
              cx={x(b)}
              cy={y(z[b])}
              r={5}
              className="fill-card stroke-highlight"
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>
      <figcaption className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full bg-highlight" />
          {entryLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full border-2 border-highlight" />
          {exitLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-4 rounded-sm bg-highlight/20" />
          {openLabel}
        </span>
      </figcaption>
    </figure>
  );
}
