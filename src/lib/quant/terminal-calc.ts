import { gaussian, mulberry32, quantile } from "./gbm";
import { normalVarEs, straddleValue, studentTVarEs } from "./dist";

/**
 * The maths behind the Home terminal's commands. Pure functions, so outputs are reproducible
 * (fixed seed) and the component only parses input and formats results.
 */

/** "24%", "0,24", "0.24" and "24" all read as 0.24 when `asRate`; plain numbers otherwise. */
export function parseNumber(raw: string | undefined, asRate = false): number | undefined {
  if (raw === undefined) return undefined;
  const pct = raw.trim().endsWith("%");
  const n = Number(raw.trim().replace("%", "").replace(",", "."));
  if (!Number.isFinite(n)) return Number.NaN;
  if (!asRate) return n;
  return pct || Math.abs(n) > 1 ? n / 100 : n;
}

export type SimResult = {
  n: number;
  mu: number;
  sigma: number;
  p05: number;
  p50: number;
  p95: number;
  lossProb: number;
  /** text histogram rows: [bin start, bar length] */
  bins: [number, number][];
};

/** One-year terminal value of R$100 under GBM, n paths, seed 2021 (the hero uses the same model). */
export function simulate(mu: number, sigma: number, n: number): SimResult {
  const z = gaussian(mulberry32(2021));
  const drift = mu - (sigma * sigma) / 2;
  const values = new Float64Array(n);
  for (let i = 0; i < n; i++) values[i] = 100 * Math.exp(drift + sigma * z());
  values.sort();
  let losses = 0;
  for (const v of values) if (v < 100) losses++;
  const lo = quantile(values, 0.01);
  const hi = quantile(values, 0.99);
  const count = 10;
  const width = (hi - lo) / count;
  const counts = new Array<number>(count).fill(0);
  for (const v of values) {
    if (v < lo || v > hi) continue;
    counts[Math.min(count - 1, Math.floor((v - lo) / width))]++;
  }
  const peak = Math.max(...counts);
  return {
    n,
    mu,
    sigma,
    p05: quantile(values, 0.05),
    p50: quantile(values, 0.5),
    p95: quantile(values, 0.95),
    lossProb: losses / n,
    bins: counts.map((c, i) => [lo + i * width, Math.round((c / peak) * 24)]),
  };
}

/** VaR and ES (in standard deviations of loss) for a normal and a unit-variance Student-t. */
export function varEs(level: number, nu: number) {
  const alpha = 1 - level;
  return { normal: normalVarEs(alpha), t: studentTVarEs(alpha, nu) };
}

/** Long straddle price (Black-Scholes, r = 0) and its break-evens at expiry. */
export function straddle(spot: number, strike: number, sigma: number, years: number) {
  const price = straddleValue(spot, strike, sigma, years);
  return { price, low: strike - price, high: strike + price };
}
