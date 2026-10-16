"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import bull from "@assets/brand/bull-geometry.json";
import { quantile, simulateGbm } from "@/lib/quant/gbm";
import { cn } from "@/lib/utils";

/**
 * Signature hero visual: a seeded Monte Carlo fan of GBM price paths (p5–p95 band + median).
 *
 * Desktop ("flow" layout): the fan sweeps left→right across the full width and flows AROUND the
 * bull like a current around an obstacle — paths split above and below an ellipse fitted to the
 * mark and rejoin behind it — so the bull always sits on clean purple. The bull then assembles
 * from the points where the paths pass it.
 * Below `xl` ("linear" layout): a faint straight fan behind the copy, with a compact bull above
 * the text column (the copy would collide with a side-by-side bull between `md` and `xl`).
 *
 * Deterministic (seeded), pauses off-screen, re-reads theme colors, static under reduced motion.
 * After the intro the final frame is drawn once and the animation loop stops.
 */
export type MonteCarloCanvasProps = {
  className?: string;
  seed?: number;
  paths?: number;
  steps?: number;
  mu?: number;
  sigma?: number;
  /** Show the bull assembling from the paths. */
  showBull?: boolean;
};

type Vertex = [number, number];
const BULL_NODES = bull.nodes as unknown as Record<string, Vertex>;
const BULL_EDGES = bull.edges as unknown as [string, string][];
const BULL_DOTS = new Set(bull.dots as string[]);
const BULL_ASPECT = bull.viewBox[2] / bull.viewBox[3];
const BULL_KEYS = Object.keys(BULL_NODES);
/** Smallest scale k such that an ellipse with semi-axes k·(w/2, h/2) contains every node. */
const BULL_ELLIPSE_K = Math.max(
  ...Object.values(BULL_NODES).map(([nx, ny]) => Math.hypot((nx - 0.5) / 0.5, (ny - 0.5) / 0.5)),
);

const FAN_MS = 3000;
const BULL_DELAY_MS = 2300; // bull starts assembling while the fan finishes
const BULL_MS = 1500;
/** Deflection sharpness: ρ' = (ρ^P + 1)^(1/P). Higher = tighter envelope, less far-field bend. */
const FLOW_P = 2.2;
/** Extra samples per step near the bull, where the paths curve. */
const FLOW_SUBSTEPS = 4;
/**
 * Vertical scale spans the RANGE_CLIP..1−RANGE_CLIP quantiles of all log-prices rather than the
 * extremes, so the fan opens wide and the most extreme paths run off the edges.
 */
const RANGE_CLIP = 0.02;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Layout = {
  mode: "flow" | "linear";
  w: number;
  h: number;
  yTop: number;
  yBottom: number;
  bull: { x: number; y: number; w: number; h: number; alpha: number };
  /** global multiplier for the fan's opacity (lower on narrow screens where it sits behind copy) */
  fanAlpha: number;
  /** flow obstacle: ellipse centre and semi-axes (flow mode only) */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

/** Matches Tailwind's `xl` / `sm` breakpoints, so canvas and CSS layouts switch together. */
const FLOW_QUERY = "(min-width: 80rem)";
const SM_QUERY = "(min-width: 40rem)";
/** Hero text column (`max-w-2xl`) and the `container-page` geometry it sits in. */
const TEXT_W = 672;
const CONTAINER_MAX = 1216;

function computeLayout(w: number, h: number): Layout {
  if (window.matchMedia(FLOW_QUERY).matches) {
    // keep the mark (and its horns) clear of the text column's right edge
    const textRight = Math.max(0, (w - CONTAINER_MAX) / 2) + 32 + TEXT_W;
    const clearX = textRight + 32;
    const bw = Math.min(w * 0.3, 480, (w - clearX) * 0.8);
    const bh = bw / BULL_ASPECT;
    const pad = 1.1; // breathing room between the mark and the paths
    const rx = (bw / 2) * BULL_ELLIPSE_K * pad;
    const ry = (bh / 2) * BULL_ELLIPSE_K * pad;
    // leave room on the right so the paths visibly rejoin and carry on past the bull
    const cx = Math.max(clearX + bw / 2, Math.min(w * 0.74, w - rx - w * 0.07));
    const cy = h * 0.5 + 8; // hero content sits slightly below centre (64px header)
    return {
      mode: "flow",
      w,
      h,
      yTop: cy - h * 0.36,
      yBottom: cy + h * 0.36,
      bull: { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh, alpha: 1 },
      fanAlpha: 1,
      cx,
      cy,
      rx,
      ry,
    };
  }
  // Stacked: compact bull just under the 64px header, left-aligned with the copy; the hero
  // reserves matching top padding (see monte-carlo-hero.tsx).
  const bh = window.matchMedia(SM_QUERY).matches ? 144 : 112;
  const bw = bh * BULL_ASPECT;
  const left = Math.max(0, (w - CONTAINER_MAX) / 2) + (w >= 768 ? 32 : 20);
  return {
    mode: "linear",
    w,
    h,
    yTop: h * 0.55,
    yBottom: h * 0.98,
    bull: { x: left, y: 72, w: bw, h: bh, alpha: 1 },
    fanAlpha: 0.4,
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
  };
}

function readColors(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    highlight: cs.getPropertyValue("--highlight").trim() || "#ae94d6",
    foreground: cs.getPropertyValue("--foreground").trim() || "#f4f0fa",
  };
}

export function MonteCarloCanvas({
  className,
  seed = 2021, // founding year
  paths = 128,
  steps = 252, // trading days in a year: daily steps make the paths visibly jagged
  mu = 0.08,
  sigma = 0.24,
  showBull = true,
}: MonteCarloCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save-Data users get the static final frame, like reduced motion.
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    const staticOnly = reduced || saveData;

    // Defer the simulation + first draw off the hydration critical path.
    let cleanup: (() => void) | undefined;
    const idle =
      window.requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1) as unknown as number);
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleHandle = idle(() => (cleanup = setup(canvas, ctx)), { timeout: 300 });
    return () => {
      cancelIdle(idleHandle);
      cleanup?.();
    };

    function setup(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      const sim = simulateGbm({ paths, steps, mu, sigma, horizon: 1, s0: 100, seed });
      // Work in log-prices: precompute once.
      const toLog = (q: Float64Array) => q.map((v) => Math.log(v));
      const logPaths = sim.paths.map(toLog);
      const logP05 = toLog(sim.p05);
      const logP50 = toLog(sim.p50);
      const logP95 = toLog(sim.p95);
      const allLog = Float64Array.from(logPaths.flatMap((p) => Array.from(p))).sort();
      const logMin = quantile(allLog, RANGE_CLIP);
      const logMax = quantile(allLog, 1 - RANGE_CLIP);
      // Pair each bull vertex with a path it launches from.
      const pairing = BULL_KEYS.map((_, i) => Math.floor(((i + 0.5) * paths) / BULL_KEYS.length));

      let layout = computeLayout(1, 1);
      let colors = readColors(canvas);
      let samples: number[] = [];
      let tBull = steps; // step at which the fan passes the bull's centre
      let dpr = 1;
      let raf = 0;
      let start = 0;
      /** finished fan, rendered once at device resolution — later frames just blit it */
      let fanCache: HTMLCanvasElement | null = null;
      let visible = true;

      const a = (v: number) => v * layout.fanAlpha;

      /** Push a point out of the bull's ellipse with a smooth, far-decaying displacement. */
      function deflect(x: number, y: number): Vertex {
        const L = layout;
        const dx = (x - L.cx) / L.rx;
        let dy = (y - L.cy) / L.ry;
        if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) dy = 1e-6;
        const rho = Math.hypot(dx, dy);
        const f = Math.pow(Math.pow(rho, FLOW_P) + 1, 1 / FLOW_P) / rho;
        return [L.cx + dx * f * L.rx, L.cy + dy * f * L.ry];
      }

      /** Screen position of log-price `v` at fractional step `t`. */
      function map(t: number, v: number): Vertex {
        const L = layout;
        const k = (v - logMin) / (logMax - logMin);
        const x = (t / steps) * L.w;
        const y = L.yBottom - k * (L.yBottom - L.yTop);
        return L.mode === "flow" ? deflect(x, y) : [x, y];
      }

      /** Log-price of a series at fractional step t (linear interpolation in log space). */
      function valueAt(q: Float64Array, t: number) {
        const i = Math.min(Math.floor(t), steps);
        const f = t - i;
        return i < steps ? q[i] + (q[i + 1] - q[i]) * f : q[i];
      }

      const pointAt = (q: Float64Array, t: number) => map(t, valueAt(q, t));

      function rebuildSamples() {
        const L = layout;
        tBull = L.mode === "flow" ? (L.cx / L.w) * steps : steps;
        // denser sampling where paths bend around the bull
        const near = (t: number) => {
          if (L.mode !== "flow") return false;
          const x = (t / steps) * L.w;
          return Math.abs(x - L.cx) < L.rx * 2.5;
        };
        samples = [];
        for (let t = 0; t <= steps; t++) {
          if (t > 0 && near(t)) {
            for (let k = FLOW_SUBSTEPS - 1; k >= 1; k--) samples.push(t - k / FLOW_SUBSTEPS);
          }
          samples.push(t);
        }
      }

      /** Trace q from 0 up to the fractional `head` — smooth leading edge. */
      function trace(c: CanvasRenderingContext2D, q: Float64Array, head: number) {
        const [x0, y0] = pointAt(q, 0);
        c.moveTo(x0, y0);
        for (const s of samples) {
          if (s <= 0) continue;
          if (s >= head) break;
          const [x, y] = pointAt(q, s);
          c.lineTo(x, y);
        }
        const [x1, y1] = pointAt(q, head);
        c.lineTo(x1, y1);
      }

      function drawFan(head: number) {
        const c = ctx!;
        const L = layout;
        c.save();
        if (L.mode === "flow") {
          // Clip to everything OUTSIDE the bull's ellipse: guarantees clean purple behind the mark,
          // even where the p5–p95 band wraps around it.
          c.beginPath();
          c.rect(0, 0, L.w, L.h);
          c.ellipse(L.cx, L.cy, L.rx, L.ry, 0, 0, Math.PI * 2);
          c.clip("evenodd");
        }

        c.strokeStyle = colors.highlight;
        c.fillStyle = colors.highlight;
        // individual paths
        c.lineWidth = 1;
        c.globalAlpha = a(0.09);
        c.beginPath();
        // narrow screens draw every other path (they're faint there anyway)
        const stride = L.mode === "linear" ? 2 : 1;
        for (let i = 0; i < logPaths.length; i += stride) trace(c, logPaths[i], head);
        c.stroke();
        // p5–p95 band: forward along p95, back along p05
        c.globalAlpha = a(0.1);
        c.beginPath();
        trace(c, logP95, head);
        const back = [head, ...samples.filter((s) => s > 0 && s < head).reverse(), 0];
        for (const s of back) {
          const [x, y] = pointAt(logP05, s);
          c.lineTo(x, y);
        }
        c.closePath();
        c.fill();
        // dashed band edges
        c.globalAlpha = a(0.45);
        c.setLineDash([3, 5]);
        c.beginPath();
        trace(c, logP05, head);
        trace(c, logP95, head);
        c.stroke();
        c.setLineDash([]);
        // median + leading-edge dot
        c.globalAlpha = a(0.95);
        c.lineWidth = 1.5;
        c.beginPath();
        trace(c, logP50, head);
        c.stroke();
        if (head < steps) {
          const [mx, my] = pointAt(logP50, head);
          c.beginPath();
          c.arc(mx, my, 2.5, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }

      function drawBull(progress: number, head: number) {
        if (!showBull || progress <= 0) return;
        const c = ctx!;
        const b = layout.bull;
        const pos: Record<string, Vertex> = {};
        BULL_KEYS.forEach((key, i) => {
          // launch from where the path passes the bull (on the envelope), never ahead of the fan
          const from = pointAt(logPaths[pairing[i]], Math.min(head, tBull));
          const [nx, ny] = BULL_NODES[key];
          const to: Vertex = [b.x + nx * b.w, b.y + ny * b.h];
          // stagger vertices slightly so the mark "crystallises"
          const local = easeOutExpo(clamp01((progress - (i / BULL_KEYS.length) * 0.35) / 0.65));
          pos[key] = [from[0] + (to[0] - from[0]) * local, from[1] + (to[1] - from[1]) * local];
        });
        const settled = easeInOutCubic(clamp01((progress - 0.45) / 0.55));
        const scale = b.w / 1010;

        c.globalAlpha = b.alpha * (0.25 + 0.75 * settled);
        c.strokeStyle = colors.foreground;
        c.lineWidth = Math.max(1, 17 * scale);
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        for (const [p, q] of BULL_EDGES) {
          c.moveTo(pos[p][0], pos[p][1]);
          c.lineTo(pos[q][0], pos[q][1]);
        }
        c.stroke();

        for (const key of BULL_KEYS) {
          const isDot = BULL_DOTS.has(key);
          c.globalAlpha = b.alpha * (isDot ? 1 : 0.9);
          c.fillStyle = isDot ? colors.highlight : colors.foreground;
          c.beginPath();
          c.arc(
            pos[key][0],
            pos[key][1],
            Math.max(1.5, (isDot ? 24 : 8.5) * scale),
            0,
            Math.PI * 2,
          );
          c.fill();
        }
        c.globalAlpha = 1;
      }

      function resize() {
        const rect = canvas!.getBoundingClientRect();
        const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4;
        dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2);
        fanCache = null;
        canvas!.width = Math.round(rect.width * dpr);
        canvas!.height = Math.round(rect.height * dpr);
        layout = computeLayout(rect.width, rect.height);
        rebuildSamples();
      }

      function frame(now: number) {
        if (!start) start = now;
        const elapsed = staticOnly ? Infinity : now - start;
        const fan = clamp01(elapsed / FAN_MS);
        const bullP = clamp01((elapsed - BULL_DELAY_MS) / BULL_MS);
        const done = fan >= 1 && bullP >= 1;
        const head = Math.max(0.001, easeInOutCubic(fan) * steps);

        const c = ctx!;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, layout.w, layout.h);
        if (fan >= 1) {
          // The fan no longer changes: render it once off-screen, then just blit it.
          if (!fanCache) {
            fanCache = document.createElement("canvas");
            fanCache.width = canvas.width;
            fanCache.height = canvas.height;
            const main = ctx;
            ctx = fanCache.getContext("2d")!;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawFan(head);
            ctx = main;
          }
          c.setTransform(1, 0, 0, 1, 0, 0);
          c.drawImage(fanCache, 0, 0);
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
        } else {
          drawFan(head);
        }
        drawBull(bullP, head);

        // Settled: the final frame is on screen, so stop the loop (resize, theme change and
        // scrolling back into view each restart it for one more redraw).
        if (staticOnly || !visible || done) return;
        raf = requestAnimationFrame(frame);
      }

      function restartLoop() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }

      resize();
      restartLoop();

      const ro = new ResizeObserver(() => {
        resize();
        restartLoop();
      });
      ro.observe(canvas);

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) restartLoop();
        else {
          cancelAnimationFrame(raf);
        }
      });
      io.observe(canvas);

      // next-themes toggles a class on <html>; re-read the CSS variables when it changes.
      const mo = new MutationObserver(() => {
        colors = readColors(canvas);
        fanCache = null;
        restartLoop();
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        mo.disconnect();
      };
    }
  }, [seed, paths, steps, mu, sigma, showBull, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block size-full", className)} />;
}
