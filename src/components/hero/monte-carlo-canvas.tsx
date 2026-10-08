"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import bull from "@assets/brand/bull-geometry.json";
import { simulateGbm, type GbmResult } from "@/lib/quant/gbm";
import { cn } from "@/lib/utils";

/**
 * Signature hero visual: a seeded Monte Carlo fan of GBM price paths with a p5–p95 band and
 * median, whose terminal values then "resolve" into the FGV Quant bull mark.
 *
 * - Deterministic (seeded) so every visitor sees the same fan.
 * - Pauses when off-screen; redraws on resize and theme change.
 * - Reduced motion: renders the final composed frame once, no animation.
 */
export type MonteCarloCanvasProps = {
  className?: string;
  seed?: number;
  paths?: number;
  steps?: number;
  mu?: number;
  sigma?: number;
  /** Show the bull assembling from the path endpoints. */
  showBull?: boolean;
};

type Vertex = [number, number];
const BULL_NODES = bull.nodes as unknown as Record<string, Vertex>;
const BULL_EDGES = bull.edges as unknown as [string, string][];
const BULL_DOTS = new Set(bull.dots as string[]);
const BULL_ASPECT = bull.viewBox[2] / bull.viewBox[3];
const BULL_KEYS = Object.keys(BULL_NODES);

const FAN_MS = 2600;
const BULL_DELAY_MS = 1900; // bull starts assembling while the fan finishes
const BULL_MS = 1500;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Layout = {
  w: number;
  h: number;
  fanX0: number;
  fanX1: number;
  yTop: number;
  yBottom: number;
  bull: { x: number; y: number; w: number; h: number; alpha: number };
  /** global multiplier for the fan's opacity (lower on narrow screens where it sits behind copy) */
  fanAlpha: number;
};

function computeLayout(w: number, h: number): Layout {
  const wide = w >= 1024;
  if (wide) {
    const bw = Math.min(w * 0.34, 540);
    const bh = bw / BULL_ASPECT;
    const bx = w * 0.78 - bw / 2;
    return {
      w,
      h,
      fanX0: 0,
      fanX1: bx - w * 0.02,
      yTop: h * 0.22,
      yBottom: h * 0.9,
      bull: { x: bx, y: h * 0.5 - bh / 2, w: bw, h: bh, alpha: 1 },
      fanAlpha: 1,
    };
  }
  const bw = Math.min(w * 0.62, 340);
  const bh = bw / BULL_ASPECT;
  return {
    w,
    h,
    fanX0: 0,
    fanX1: w,
    yTop: h * 0.55,
    yBottom: h * 0.98,
    bull: { x: w / 2 - bw / 2, y: h * 0.1, w: bw, h: bh, alpha: 0.22 },
    fanAlpha: 0.5,
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
  steps = 96,
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

    const sim: GbmResult = simulateGbm({ paths, steps, mu, sigma, horizon: 1, s0: 100, seed });
    const logMin = Math.log(sim.min);
    const logMax = Math.log(sim.max);
    // Pair each bull vertex with a path whose terminal value it "inherits".
    const pairing = BULL_KEYS.map((_, i) => Math.floor(((i + 0.5) * paths) / BULL_KEYS.length));

    let layout = computeLayout(1, 1);
    const a = (v: number) => v * layout.fanAlpha;
    let colors = readColors(canvas);
    let dpr = 1;
    let raf = 0;
    let start = 0;
    let visible = true;
    let done = false;

    const xAt = (t: number) => layout.fanX0 + (t / steps) * (layout.fanX1 - layout.fanX0);
    const yAt = (s: number) => {
      const k = (Math.log(s) - logMin) / (logMax - logMin);
      return layout.yBottom - k * (layout.yBottom - layout.yTop);
    };
    const bullPoint = (key: string): Vertex => {
      const [nx, ny] = BULL_NODES[key];
      const b = layout.bull;
      return [b.x + nx * b.w, b.y + ny * b.h];
    };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(rect.width * dpr);
      canvas!.height = Math.round(rect.height * dpr);
      layout = computeLayout(rect.width, rect.height);
    }

    function drawFan(progress: number) {
      const upto = Math.max(1, Math.floor(progress * steps));
      const c = ctx!;
      // individual paths
      c.lineWidth = 1;
      c.strokeStyle = colors.highlight;
      c.globalAlpha = a(0.09);
      for (const p of sim.paths) {
        c.beginPath();
        c.moveTo(xAt(0), yAt(p[0]));
        for (let t = 1; t <= upto; t++) c.lineTo(xAt(t), yAt(p[t]));
        c.stroke();
      }
      // p5–p95 band
      c.globalAlpha = a(0.1);
      c.fillStyle = colors.highlight;
      c.beginPath();
      c.moveTo(xAt(0), yAt(sim.p95[0]));
      for (let t = 1; t <= upto; t++) c.lineTo(xAt(t), yAt(sim.p95[t]));
      for (let t = upto; t >= 0; t--) c.lineTo(xAt(t), yAt(sim.p05[t]));
      c.closePath();
      c.fill();
      // band edges (dashed) and median
      c.globalAlpha = a(0.45);
      c.setLineDash([3, 5]);
      for (const q of [sim.p05, sim.p95]) {
        c.beginPath();
        c.moveTo(xAt(0), yAt(q[0]));
        for (let t = 1; t <= upto; t++) c.lineTo(xAt(t), yAt(q[t]));
        c.stroke();
      }
      c.setLineDash([]);
      c.globalAlpha = a(0.95);
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(xAt(0), yAt(sim.p50[0]));
      for (let t = 1; t <= upto; t++) c.lineTo(xAt(t), yAt(sim.p50[t]));
      c.stroke();
      // leading-edge dot on the median
      c.beginPath();
      c.arc(xAt(upto), yAt(sim.p50[upto]), 2.5, 0, Math.PI * 2);
      c.fillStyle = colors.highlight;
      c.fill();
      c.globalAlpha = 1;
    }

    function drawBull(progress: number, time: number) {
      if (!showBull || progress <= 0) return;
      const c = ctx!;
      const b = layout.bull;
      const pos: Record<string, Vertex> = {};
      BULL_KEYS.forEach((key, i) => {
        const path = sim.paths[pairing[i]];
        const from: Vertex = [xAt(steps), yAt(path[steps])];
        const to = bullPoint(key);
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
      for (const [a, z] of BULL_EDGES) {
        c.moveTo(pos[a][0], pos[a][1]);
        c.lineTo(pos[z][0], pos[z][1]);
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

    function frame(now: number) {
      if (!start) start = now;
      const elapsed = reduced ? Infinity : now - start;
      const fan = clamp01(elapsed / FAN_MS);
      const bullP = clamp01((elapsed - BULL_DELAY_MS) / BULL_MS);
      done = fan >= 1 && bullP >= 1;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, layout.w, layout.h);
      drawFan(easeInOutCubic(fan));
      drawBull(bullP, now);

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
