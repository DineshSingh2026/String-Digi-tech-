"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MotionValue } from "framer-motion";
import { home, homeBandsUi } from "@/content/copy";
import { buildRegimeData, type RegimeData } from "./data";
import { regimeBus, REGIME_ORDER } from "./bus";
import { CONFIG } from "./config";

export type RegimeReadout = { regime: number; exposure: number; drawdown: number };

const COL = {
  text: "#e9eef3",
  muted: "#8a97a6",
  accent: "#f44e04",
  risk: "#e5484d",
  caution: "#f5a524",
  bg: "#06080b",
};
export const REGIME_HEX = REGIME_ORDER.map((r) => CONFIG.regimeColors[r]);

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Scroll progress 0..1 -> fractional series index. Each of the 4 steps owns one regime segment (last step: thin liquidity + recovery). */
export function progressToIndex(d: RegimeData, p: number): number {
  const s = d.segments;
  const k = Math.min(3, Math.max(0, Math.floor(p * 4)));
  const u = Math.min(1, Math.max(0, p * 4 - k));
  const a = k === 0 ? 36 : s[k]!.i0;
  const b = k === 3 ? s[s.length - 1]!.i1 : s[k]!.i1;
  return a + (b - a) * u;
}

type Props = {
  progress: MotionValue<number>;
  step: number;
  reduced: boolean;
  onReadout?: (r: RegimeReadout) => void;
};

/** DOM 2D chart for the risk-first band: regime bands, price, exposure, drawdown vs limit, scroll playhead. */
export default function RegimeChart({ progress, step, reduced, onReadout }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = useMemo(buildRegimeData, []);
  const stepRef = useRef(step);
  const readoutRef = useRef(onReadout);
  useEffect(() => {
    stepRef.current = step;
    readoutRef.current = onReadout;
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ui = homeBandsUi.risk;
    const regimes = home.riskFirst.regimes;
    const font = (() => {
      const f = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim();
      return f ? `${f}, ui-monospace, monospace` : "ui-monospace, monospace";
    })();
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const txt = (s: string, x: number, y: number, color: string, size = 10, align: CanvasTextAlign = "left") => {
      ctx.font = `500 ${size}px ${font}`;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.fillText(s.toUpperCase(), x, y);
    };

    let shown = progressToIndex(data, progress.get());
    let lastReport = -1;
    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const draw = (dt: number) => {
      if (w < 10 || h < 10) return;
      clock += dt;
      const target = progressToIndex(data, progress.get());
      shown = dt === 0 || reduced ? target : shown + (target - shown) * (1 - Math.exp(-dt * 10));
      const n = data.n;
      const idx = Math.max(0, Math.min(n - 1, shown));
      const ii = Math.floor(idx);
      const focus = stepRef.current;

      ctx.clearRect(0, 0, w, h);
      const gutL = 14;
      const gutR = 56;
      const x0 = gutL;
      const x1 = w - gutR;
      const X = (i: number) => x0 + (i / (n - 1)) * (x1 - x0);
      const gap = 18;
      const top = 30;
      const avail = h - top - 22 - gap * 2;
      const P = { y0: top, y1: top + avail * 0.56 };
      const E = { y0: P.y1 + gap, y1: P.y1 + gap + avail * 0.19 };
      const D = { y0: E.y1 + gap, y1: h - 22 };
      const px = X(idx);

      // regime bands (behind everything)
      const curSeg = data.segments.findIndex((s) => ii >= s.i0 && ii <= s.i1);
      data.segments.forEach((s, si) => {
        const ri = REGIME_ORDER.indexOf(s.regime as (typeof REGIME_ORDER)[number]);
        const col = REGIME_HEX[ri] ?? COL.muted;
        const a = si === curSeg ? 0.13 : s.i0 <= ii ? 0.06 : 0.025;
        const bx0 = X(s.i0);
        const bx1 = X(s.i1 + 1 > n - 1 ? n - 1 : s.i1 + 1);
        const g = ctx.createLinearGradient(0, P.y0, 0, D.y1);
        g.addColorStop(0, rgba(col, a * (focus === 0 ? 1.5 : 1)));
        g.addColorStop(1, rgba(col, a * 0.35));
        ctx.fillStyle = g;
        ctx.fillRect(bx0, P.y0 - 18, bx1 - bx0, D.y1 - P.y0 + 18);
        ctx.fillStyle = rgba(col, si === curSeg ? 0.95 : 0.4);
        ctx.fillRect(bx0, P.y0 - 18, bx1 - bx0 - 2, 2);
        if (bx1 - bx0 > 70) txt(regimes[ri] ?? "", bx0 + 6, P.y0 - 8, rgba(col, si === curSeg ? 1 : 0.55), 9.5);
      });

      // grids
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(233,238,243,0.05)";
      ctx.beginPath();
      for (let k = 0; k <= 4; k++) {
        const y = Math.round(P.y0 + ((P.y1 - P.y0) * k) / 4) + 0.5;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
      }
      for (const R of [E, D]) {
        ctx.moveTo(x0, Math.round(R.y0) + 0.5);
        ctx.lineTo(x1, Math.round(R.y0) + 0.5);
        ctx.moveTo(x0, Math.round(R.y1) + 0.5);
        ctx.lineTo(x1, Math.round(R.y1) + 0.5);
      }
      ctx.stroke();

      // sub-panel focus highlight per step: 1 exposure, 2 price/monitoring, 3 drawdown
      const hl = focus === 1 ? E : focus === 2 ? P : focus === 3 ? D : null;
      if (hl) {
        ctx.fillStyle = "rgba(244,78,4,0.05)";
        ctx.fillRect(x0, hl.y0 - 4, x1 - x0, hl.y1 - hl.y0 + 8);
        ctx.fillStyle = COL.accent;
        ctx.fillRect(x0 - 8, hl.y0 - 4, 2, hl.y1 - hl.y0 + 8);
      }

      // price: past coloured by regime, future dim
      const PY = (v: number) => P.y1 - 6 - v * (P.y1 - P.y0 - 12);
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(138,151,166,0.22)";
      ctx.beginPath();
      for (let i = ii; i < n; i++) ctx.lineTo(X(i), PY(data.price[i]!));
      ctx.stroke();
      ctx.lineWidth = 1.8;
      for (const s of data.segments) {
        if (s.i0 > ii) break;
        const ri = REGIME_ORDER.indexOf(s.regime as (typeof REGIME_ORDER)[number]);
        ctx.strokeStyle = REGIME_HEX[ri] ?? COL.muted;
        ctx.shadowColor = rgba(REGIME_HEX[ri] ?? COL.muted, 0.6);
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const live = ii <= s.i1;
        const end = live ? ii : s.i1;
        for (let i = Math.max(0, s.i0 - 1); i <= end; i++) ctx.lineTo(X(i), PY(data.price[i]!));
        if (live) ctx.lineTo(px, PY(data.price[ii]! + (data.price[Math.min(n - 1, ii + 1)]! - data.price[ii]!) * (idx - ii)));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // exposure
      const EY = (v: number) => E.y1 - v * (E.y1 - E.y0);
      const eg = ctx.createLinearGradient(0, E.y0, 0, E.y1);
      eg.addColorStop(0, "rgba(233,238,243,0.28)");
      eg.addColorStop(1, "rgba(233,238,243,0.03)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.moveTo(X(0), E.y1);
      for (let i = 0; i <= ii; i++) ctx.lineTo(X(i), EY(data.exposure[i]!));
      ctx.lineTo(px, EY(data.exposure[ii]!));
      ctx.lineTo(px, E.y1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(233,238,243,0.85)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i <= ii; i++) ctx.lineTo(X(i), EY(data.exposure[i]!));
      ctx.stroke();
      ctx.strokeStyle = "rgba(233,238,243,0.12)";
      ctx.beginPath();
      for (let i = ii; i < n; i++) ctx.lineTo(X(i), EY(data.exposure[i]!));
      ctx.stroke();

      // drawdown (underwater) + limit ceiling
      const lim = data.limit;
      const DY = (v: number) => D.y0 + (v / lim) * (D.y1 - D.y0 - 4);
      ctx.fillStyle = "rgba(229,72,77,0.42)";
      ctx.beginPath();
      ctx.moveTo(X(0), D.y0);
      for (let i = 0; i <= ii; i++) ctx.lineTo(X(i), DY(data.drawdown[i]!));
      ctx.lineTo(px, D.y0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = COL.risk;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= ii; i++) ctx.lineTo(X(i), DY(data.drawdown[i]!));
      ctx.stroke();
      ctx.strokeStyle = "rgba(229,72,77,0.14)";
      ctx.beginPath();
      for (let i = ii; i < n; i++) ctx.lineTo(X(i), DY(data.drawdown[i]!));
      ctx.stroke();
      const ly = Math.round(DY(lim)) + 0.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = COL.caution;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x0, ly);
      ctx.lineTo(x1, ly);
      ctx.stroke();
      ctx.setLineDash([]);

      // right axis labels
      const cur = { e: data.exposure[ii]!, d: data.drawdown[ii]! };
      txt(ui.price, x1 + 8, P.y0 + 6, COL.muted, 9);
      txt(ui.exposure, x1 + 8, E.y0 + 4, COL.muted, 8.5);
      txt(`${Math.round(cur.e * 100)}${ui.unit}`, x1 + 8, Math.max(E.y0 + 18, EY(cur.e)), COL.text, 10);
      txt(homeBandsUi.services.canvas.dd, x1 + 8, D.y0 + 4, COL.muted, 9);
      txt(`${ui.limit}`, x1 + 8, ly - 7, COL.caution, 9);
      txt(`-${(lim * 100).toFixed(0)}${ui.unit}`, x1 + 8, ly + 6, COL.caution, 9);

      // playhead
      ctx.strokeStyle = "rgba(244,78,4,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(px) + 0.5, P.y0 - 18);
      ctx.lineTo(Math.round(px) + 0.5, D.y1);
      ctx.stroke();
      const pyv = PY(data.price[ii]! + (data.price[Math.min(n - 1, ii + 1)]! - data.price[ii]!) * (idx - ii));
      const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(clock * 4);
      const glow = ctx.createRadialGradient(px, pyv, 0, px, pyv, 22);
      glow.addColorStop(0, `rgba(244,78,4,${0.45 + 0.2 * pulse})`);
      glow.addColorStop(1, "rgba(244,78,4,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(px - 22, pyv - 22, 44, 44);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, pyv, 3, 0, Math.PI * 2);
      ctx.fill();
      for (const [y, c] of [
        [EY(cur.e), COL.text],
        [DY(cur.d), COL.risk],
      ] as const) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(px, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // bus for the ambient WebGL scene
      const rr = canvas.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      regimeBus.playhead = idx / (n - 1);
      const regIdx = Math.max(0, REGIME_ORDER.indexOf(data.regime[ii] as (typeof REGIME_ORDER)[number]));
      regimeBus.regime = regIdx;
      regimeBus.cx = ((rr.left + rr.width / 2) / vw) * 2 - 1;
      regimeBus.cy = 1 - ((rr.top + rr.height / 2) / vh) * 2;
      regimeBus.hw = rr.width / vw;
      regimeBus.hh = rr.height / vh;

      const key = Math.round(idx);
      if (key !== lastReport && readoutRef.current) {
        lastReport = key;
        readoutRef.current({ regime: regIdx, exposure: cur.e, drawdown: cur.d });
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
    };
    draw(0);
    let io: IntersectionObserver | null = null;
    if (reduced) {
      const unsub = progress.on("change", () => draw(0));
      const onResize = () => draw(0);
      window.addEventListener("resize", onResize);
      return () => {
        unsub();
        window.removeEventListener("resize", onResize);
        ro.disconnect();
      };
    }
    io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e?.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
    };
  }, [data, progress, reduced]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
