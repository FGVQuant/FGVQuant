/**
 * Small, dependency-free distribution maths for the site's illustrative figures (newsletter covers,
 * the VaR/ES figure). Checked against tabulated values: t₄ quantiles 2.1318 (95%) and 3.7469 (99%),
 * normal VaR/ES 1.6449/2.0627 (95%) and 2.3263/2.6652 (99%), ATM straddle 2·S·(2Φ(σ√t/2) − 1).
 */

/** ln Γ(x) for x > 0 (Lanczos, g = 7). */
export function lnGamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Standard normal density. */
export const normalPdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

/** Standard normal CDF (Abramowitz & Stegun 7.1.26 erf, |error| < 1.5e-7). */
export function normalCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Student-t density with ν degrees of freedom. */
export function studentTPdf(x: number, nu: number): number {
  const lc = lnGamma((nu + 1) / 2) - lnGamma(nu / 2) - 0.5 * Math.log(nu * Math.PI);
  return Math.exp(lc - ((nu + 1) / 2) * Math.log(1 + (x * x) / nu));
}

/** Student-t CDF by Simpson integration from 0 (symmetric), fine for |x| up to ~50. */
export function studentTCdf(x: number, nu: number): number {
  const n = 2000;
  const h = Math.abs(x) / n;
  let s = studentTPdf(0, nu) + studentTPdf(Math.abs(x), nu);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * studentTPdf(i * h, nu);
  const half = (s * h) / 3;
  return x >= 0 ? 0.5 + half : 0.5 - half;
}

/** Inverse of a monotone CDF by bisection on [lo, hi]. */
function invert(cdf: (x: number) => number, p: number, lo = -50, hi = 50): number {
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export const normalQuantile = (p: number) => invert(normalCdf, p, -10, 10);
export const studentTQuantile = (p: number, nu: number) => invert((x) => studentTCdf(x, nu), p);

/**
 * One-sided loss VaR and Expected Shortfall at tail probability α (e.g. 0.05 for 95%), as positive
 * loss magnitudes in units of the distribution's standard deviation.
 */
export function normalVarEs(alpha: number) {
  const q = -normalQuantile(alpha);
  return { var: q, es: normalPdf(q) / alpha };
}

/** Same for a Student-t with ν > 2, rescaled to unit variance so it compares like-for-like. */
export function studentTVarEs(alpha: number, nu: number) {
  const scale = Math.sqrt((nu - 2) / nu);
  const q = -studentTQuantile(alpha, nu);
  const es = (studentTPdf(q, nu) / alpha) * ((nu + q * q) / (nu - 1));
  return { var: q * scale, es: es * scale, scale };
}

/** Black-Scholes value of a long straddle (call + put), r = 0. */
export function straddleValue(spot: number, strike: number, sigma: number, t: number): number {
  if (t <= 0) return Math.abs(spot - strike);
  const sd = sigma * Math.sqrt(t);
  const d1 = (Math.log(spot / strike) + 0.5 * sd * sd) / sd;
  const d2 = d1 - sd;
  const call = spot * normalCdf(d1) - strike * normalCdf(d2);
  const put = call - spot + strike;
  return call + put;
}
