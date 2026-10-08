"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import bull from "@assets/brand/bull-geometry.json";
import { quantile, simulateGbm } from "@/lib/quant/gbm";
import { cn } from "@/lib/utils";

/**
 * Signature hero visual: a seeded Monte Carlo fan of GBM price paths (p5–p95 band + median).
 *
 * Desktop ("orbit" layout): the fan runs left→right along the lower hero, then bends into an
 * orbit around the bull — entering at the bottom and sweeping counter-clockwise over the top —
 * while a clear disc keeps the bull on clean purple. The orbit's tail fades out (conic gradient)
 * and the bull assembles from the orbiting path tips.
 * Narrow screens ("linear" layout): a faint straight fan with the bull as a watermark above.
 *
 * Deterministic (seeded), pauses off-screen, re-reads theme colors, static under reduced motion.
 */
export type MonteCarloCanvasProps = {
  className?: string;
  seed?: number;
  paths?: number;
  steps?: number;
  mu?: number;
  sigma?: number;
  /** Show the bull assembling from the path tips. */
  showBull?: boolean;
};

type Vertex = [number, number];
const BULL_NODES = bull.nodes as unknown as Record<string, Vertex>;
const BULL_EDGES = bull.edges as unknown as [string, string][];
const BULL_DOTS = new Set(bull.dots as string[]);
const BULL_ASPECT = bull.viewBox[2] / bull.viewBox[3];
const BULL_KEYS = Object.keys(BULL_NODES);
/** Farthest bull node from the mark's centre, in units of the mark's width. */
const BULL_RADIUS = Math.max(
  ...Object.values(BULL_NODES).map(([nx, ny]) => Math.hypot(nx - 0.5, (ny - 0.5) / BULL_ASPECT)),
);

const FAN_MS = 3200;
const BULL_DELAY_MS = 2500; // bull starts assembling while the orbit finishes
const BULL_MS = 1500;
const ORBIT_SWEEP = (300 / 180) * Math.PI; // bottom → right → top → down the left side
const ORBIT_FADE = 0.4; // last 40% of the sweep fades out
const ORBIT_SUBSTEPS = 3; // extra samples per step on the curve, for a smooth arc

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type BullBox = { x: number; y: number; w: number; h: number; alpha: number };

type Layout =
  | {
      mode: "orbit";
      w: number;
      h: number;
      bull: BullBox;
      fanAlpha: number;
      cx: number;
      cy: number;
      /** inner edge of the ribbon — nothing is drawn inside this disc */
      rClear: number;
      /** px per unit of log-return */
      scale: number;
      /** radius of the zero-return line */
      rMid: number;
      /** fraction of the timeline spent on the straight run before the orbit */
      uSplit: number;
    }
  | {
      mode: "linear";
      w: number;
      h: number;
      bull: BullBox;
      fanAlpha: number;
      yTop: number;
      yBottom: number;
    };

type Range = { dLo: number; dHi: number; logMin: number; logMax: number };

function computeLayout(w: number, h: number, range: Range): Layout {
  if (w >= 1024) {
    const bw = Math.min(w * 0.3, 500);
    const bh = bw / BULL_ASPECT;
    const rClear = BULL_RADIUS * bw + bw * 0.07;
    const cy = h * 0.5 + 16; // hero content is offset by the 64px header
    const avail = Math.min(cy - 88, h - cy - 24); // keep the ring clear of the header
    const band = Math.max(bw * 0.18, Math.min(bw * 0.42, avail - rClear));
    const rOuter = rClear + band;
    const cx = Math.min(w * 0.76, w - rOuter - 24);
    const scale = band / (range.dHi - range.dLo);
    const rMid = rClear + range.dHi * scale;
    const straight = cx;
    const arc = rMid * ORBIT_SWEEP;
    return {
      mode: "orbit",
      w,
      h,
      bull: { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh, alpha: 1 },
      fanAlpha: 1,
      cx,
      cy,
      rClear,
      scale,
      rMid,
      uSplit: straight / (straight + arc),
    };
  }
  const bw = Math.min(w * 0.62, 340);
  const bh = bw / BULL_ASPECT;
  return {
    mode: "linear",
    w,
    h,
    bull: { x: w / 2 - bw / 2, y: h * 0.1, w: bw, h: bh, alpha: 0.22 },
    fanAlpha: 0.5,
    yTop: h * 0.55,
    yBottom: h * 0.98,
  };
}

function readColors(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    highlight: cs.getPropertyValue("--highlight").trim() || "#ae94d6",
    foreground: cs.getPropertyValue("--foreground").trim() || "#f4f0fa",
  };
}

function withAlpha(hex: string, alpha: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function MonteCarloCanvas({
  className,
  seed = 2021, // founding year
  paths = 128,
  steps = 120,
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

    const s0 = 100;
    const sim = simulateGbm({ paths, steps, mu, sigma, horizon: 1, s0, seed });
    // Work in log-returns d = ln(S/S0): precompute once.
    const toLog = (q: Float64Array) => q.map((v) => Math.log(v / s0));
    const logPaths = sim.paths.map(toLog);
    const logP05 = toLog(sim.p05);
    const logP50 = toLog(sim.p50);
    const logP95 = toLog(sim.p95);
    const terminal = Float64Array.from(logPaths, (p) => p[steps]).sort();
    const range: Range = {
      dLo: quantile(terminal, 0.03),
      dHi: quantile(terminal, 0.97),
      logMin: Math.log(sim.min / s0),
      logMax: Math.log(sim.max / s0),
    };
    // Pair each bull vertex with a path whose tip it launches from.
    const pairing = BULL_KEYS.map((_, i) => Math.floor(((i + 0.5) * paths) / BULL_KEYS.length));

    let layout = computeLayout(1, 1, range);
    let colors = readColors(canvas);
    let orbitStyle: CanvasGradient | string = colors.highlight;
    let samples: number[] = [];
    let tSplit = steps;
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let visible = true;
    let done = false;

    const a = (v: number) => v * layout.fanAlpha;

    /** Screen position of log-return `d` at fractional step `t`. */
    function map(t: number, d: number): Vertex {
      const u = t / steps;
      const L = layout;
      if (L.mode === "linear") {
        const k = (d - range.logMin) / (range.logMax - range.logMin);
        return [u * L.w, L.yBottom - k * (L.yBottom - L.yTop)];
      }
      if (u <= L.uSplit) {
        // straight run toward the bottom of the orbit; up = higher return
        return [(u / L.uSplit) * L.cx, L.cy + L.rMid - d * L.scale];
      }
      // orbit: counter-clockwise from the bottom; higher return = closer to the bull (= "up" at entry)
      const v = (u - L.uSplit) / (1 - L.uSplit);
      const phi = Math.PI / 2 - v * ORBIT_SWEEP;
      const r = Math.max(L.rClear, L.rMid - d * L.scale);
      return [L.cx + r * Math.cos(phi), L.cy + r * Math.sin(phi)];
    }

    /** Log-return of a series at fractional step t (linear interpolation in log space). */
    function valueAt(q: Float64Array, t: number) {
      const i = Math.min(Math.floor(t), steps);
      const f = t - i;
      return i < steps ? q[i] + (q[i + 1] - q[i]) * f : q[i];
    }

    const pointAt = (q: Float64Array, t: number) => map(t, valueAt(q, t));

    function rebuildSamples() {
      tSplit = layout.mode === "orbit" ? layout.uSplit * steps : steps;
      samples = [];
      for (let t = 0; t <= steps; t++) {
        if (t > tSplit) {
          for (let k = ORBIT_SUBSTEPS - 1; k >= 1; k--) {
            const sub = t - k / ORBIT_SUBSTEPS;
            if (sub > tSplit) samples.push(sub);
          }
        }
        samples.push(t);
      }
    }

    /** Trace q over [tA, tB] clipped at `head`. Returns false if nothing to draw. */
    function trace(
      c: CanvasRenderingContext2D,
      q: Float64Array,
      tA: number,
      tB: number,
      head: number,
    ) {
      if (head <= tA) return false;
      const end = Math.min(head, tB);
      const [x0, y0] = pointAt(q, tA);
      c.moveTo(x0, y0);
      for (const s of samples) {
        if (s <= tA) continue;
        if (s >= end) break;
        const [x, y] = pointAt(q, s);
        c.lineTo(x, y);
      }
      const [x1, y1] = pointAt(q, end);
      c.lineTo(x1, y1);
      return true;
    }

    /** Closed band between lo and hi over [tA, tB] clipped at head. */
    function band(c: CanvasRenderingContext2D, tA: number, tB: number, head: number) {
      if (!trace(c, logP95, tA, tB, head)) return false;
      const end = Math.min(head, tB);
      const back = [end, ...samples.filter((s) => s > tA && s < end).reverse(), tA];
      for (const s of back) {
        const [x, y] = pointAt(logP05, s);
        c.lineTo(x, y);
      }
      c.closePath();
      return true;
    }

    function rebuildOrbitStyle() {
      const L = layout;
      if (L.mode !== "orbit" || typeof ctx!.createConicGradient !== "function") {
        orbitStyle = colors.highlight;
        return;
      }
      // Conic gradients run clockwise from their start angle; start at the orbit's END so
      // offset 0 = tail (transparent), fading in over ORBIT_FADE of the sweep.
      const endAngle = Math.PI / 2 - ORBIT_SWEEP;
      const g = ctx!.createConicGradient(endAngle, L.cx, L.cy);
      const sweepFrac = ORBIT_SWEEP / (Math.PI * 2);
      g.addColorStop(0, withAlpha(colors.highlight, 0));
      g.addColorStop(sweepFrac * ORBIT_FADE, withAlpha(colors.highlight, 1));
      g.addColorStop(1, withAlpha(colors.highlight, 1));
      orbitStyle = g;
    }

    function drawFan(head: number) {
      const c = ctx!;
      const parts: [number, number, CanvasGradient | string][] = [[0, tSplit, colors.highlight]];
      if (tSplit < steps) parts.push([tSplit, steps, orbitStyle]);

      for (const [tA, tB, style] of parts) {
        c.strokeStyle = style;
        c.fillStyle = style;
        // individual paths
        c.lineWidth = 1;
        c.globalAlpha = a(0.09);
        c.beginPath();
        for (const p of logPaths) trace(c, p, tA, tB, head);
        c.stroke();
        // p5–p95 band
        c.globalAlpha = a(0.1);
        c.beginPath();
        if (band(c, tA, tB, head)) c.fill();
        // dashed band edges
        c.globalAlpha = a(0.45);
        c.setLineDash([3, 5]);
        c.beginPath();
        trace(c, logP05, tA, tB, head);
        trace(c, logP95, tA, tB, head);
        c.stroke();
        c.setLineDash([]);
        // median
        c.globalAlpha = a(0.95);
        c.lineWidth = 1.5;
        c.beginPath();
        trace(c, logP50, tA, tB, head);
        c.stroke();
      }
      // leading-edge dot on the median (hidden once it has faded with the orbit tail)
      if (head < steps) {
        const [mx, my] = pointAt(logP50, head);
        const tailFade =
          layout.mode === "orbit" && head > tSplit
            ? clamp01((1 - (head - tSplit) / (steps - tSplit)) / ORBIT_FADE)
            : 1;
        c.globalAlpha = a(0.95) * tailFade;
        c.fillStyle = colors.highlight;
        c.beginPath();
        c.arc(mx, my, 2.5, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    }

    function drawBull(progress: number, head: number, time: number) {
      if (!showBull || progress <= 0) return;
      const c = ctx!;
      const b = layout.bull;
      const pos: Record<string, Vertex> = {};
      BULL_KEYS.forEach((key, i) => {
        // launch from the path's current tip, so nodes never appear ahead of the drawn fan
        const from = pointAt(logPaths[pairing[i]], head);
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
        const twinkle = done && isDot ? 0.5 + 0.5 * Math.sin(time / 900 + key.length * 1.7) : 1;
        c.globalAlpha = b.alpha * (isDot ? 0.65 + 0.35 * twinkle : 0.9);
        c.fillStyle = isDot ? colors.highlight : colors.foreground;
        c.beginPath();
        c.arc(pos[key][0], pos[key][1], Math.max(1.5, (isDot ? 24 : 8.5) * scale), 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(rect.width * dpr);
      canvas!.height = Math.round(rect.height * dpr);
      layout = computeLayout(rect.width, rect.height, range);
      rebuildSamples();
      rebuildOrbitStyle();
    }

    function frame(now: number) {
      if (!start) start = now;
      const elapsed = reduced ? Infinity : now - start;
      const fan = clamp01(elapsed / FAN_MS);
      const bullP = clamp01((elapsed - BULL_DELAY_MS) / BULL_MS);
      done = fan >= 1 && bullP >= 1;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, layout.w, layout.h);
      const head = Math.max(0.001, easeInOutCubic(fan) * steps);
      drawFan(head);
      drawBull(bullP, head, now);

      // Keep animating while building; afterwards only the gentle node twinkle runs (when visible).
      if (!reduced && visible) raf = requestAnimationFrame(frame);
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
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);

    // next-themes toggles a class on <html>; re-read the CSS variables when it changes.
    const mo = new MutationObserver(() => {
      colors = readColors(canvas);
      rebuildOrbitStyle();
      restartLoop();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
    };
  }, [seed, paths, steps, mu, sigma, showBull, reduced]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block size-full", className)} />;
}
