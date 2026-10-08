/**
 * Deterministic geometric Brownian motion simulation for the hero visual.
 * Pure functions only — same seed, same paths (SSR/CSR safe, reproducible screenshots).
 */

/** mulberry32: tiny seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal draws via Box–Muller. */
export function gaussian(rand: () => number) {
  let spare: number | null = null;
  return () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    while (u === 0) u = rand();
    const v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
}

export type GbmParams = {
  paths: number;
  steps: number;
  /** annualised drift */
  mu: number;
  /** annualised volatility */
  sigma: number;
  /** horizon in years */
  horizon: number;
  s0: number;
  seed: number;
};

export type GbmResult = {
  /** paths[i][t] = price of path i at step t (t = 0..steps) */
  paths: Float64Array[];
  /** per-step percentiles across paths */
  p05: Float64Array;
  p50: Float64Array;
  p95: Float64Array;
  min: number;
  max: number;
};

/** S(t+dt) = S(t) · exp((μ − σ²/2)dt + σ√dt · Z) */
export function simulateGbm({ paths, steps, mu, sigma, horizon, s0, seed }: GbmParams): GbmResult {
  const z = gaussian(mulberry32(seed));
  const dt = horizon / steps;
  const drift = (mu - (sigma * sigma) / 2) * dt;
  const vol = sigma * Math.sqrt(dt);

  const out: Float64Array[] = [];
  for (let i = 0; i < paths; i++) {
    const p = new Float64Array(steps + 1);
    p[0] = s0;
    for (let t = 1; t <= steps; t++) p[t] = p[t - 1] * Math.exp(drift + vol * z());
    out.push(p);
  }

  const p05 = new Float64Array(steps + 1);
  const p50 = new Float64Array(steps + 1);
  const p95 = new Float64Array(steps + 1);
  const col = new Float64Array(paths);
  for (let t = 0; t <= steps; t++) {
    for (let i = 0; i < paths; i++) col[i] = out[i][t];
    col.sort();
    p05[t] = quantile(col, 0.05);
    p50[t] = quantile(col, 0.5);
    p95[t] = quantile(col, 0.95);
  }

  let min = Infinity;
  let max = -Infinity;
  for (const p of out)
    for (let t = 0; t <= steps; t++) {
      if (p[t] < min) min = p[t];
      if (p[t] > max) max = p[t];
    }

  return { paths: out, p05, p50, p95, min, max };
}

/** Linear-interpolated quantile of an already-sorted array. */
export function quantile(sorted: ArrayLike<number>, q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
