"use client";
import { useEffect, useRef } from "react";
import { gaussian, rng } from "@/lib/sim";
import { homeBandsUi } from "@/content/copy";
import { cssVar, useInView, useReducedMotion } from "./hooks";

export type TileKind = "equity" | "clusters" | "nodes" | "assembly";
export type TileLabels = typeof homeBandsUi.services.canvas;

type Palette = {
  bg: string;
  line: string;
  muted: string;
  accent: string;
  signal: string;
  risk: string;
  text: string;
  caution: string;
  font: string;
};
type Drawer = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number, p: Palette) => void;

const TAU = Math.PI * 2;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};
const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

/** rgba() from a #rrggbb hex. */
function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function label(ctx: CanvasRenderingContext2D, p: Palette, text: string, x: number, y: number, color: string, size = 9.5, align: CanvasTextAlign = "left") {
  ctx.font = `500 ${size}px ${p.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text.toUpperCase(), x, y);
}

function frameGrid(ctx: CanvasRenderingContext2D, p: Palette, x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) {
  ctx.strokeStyle = rgba(p.text, 0.05);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= ny; i++) {
    const y = Math.round(y0 + ((y1 - y0) * i) / ny) + 0.5;
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
  }
  for (let i = 0; i <= nx; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / nx) + 0.5;
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
  }
  ctx.stroke();
}

/* ---------------------------------------------------------------- equity */

function makeEquity(L: TileLabels): Drawer {
  const r = rng(11);
  const LIMIT = 0.1;
  const N = 170;
  type Pt = { eq: number; peak: number; dd: number; e: number };
  const buf: Pt[] = [];
  let eq = 1;
  let peak = 1;
  let vol = 0.007;
  let gi = 0; // global index of buf[0]
  const step = () => {
    if (r() < 0.02) vol = vol > 0.008 ? 0.005 : 0.011;
    const ret = 0.001 + vol * gaussian(r);
    const dd0 = 1 - eq / peak;
    const room = Math.max(0, LIMIT - dd0);
    // de-risk as drawdown nears the limit; a single step may never breach it
    let e = Math.max(0.2, Math.min(1, (room / LIMIT) * 1.5));
    if (ret < 0 && e * -ret * eq > room * peak * 0.5) e = (room * peak * 0.5) / (eq * -ret);
    if (ret > 0) e = Math.max(e, 0.6);
    eq *= 1 + e * ret;
    peak = Math.max(peak, eq);
    buf.push({ eq, peak, dd: Math.min(LIMIT, 1 - eq / peak), e });
  };
  for (let i = 0; i < N + 260; i++) step();
  while (buf.length > N + 2) {
    buf.shift();
    gi++;
  }
  let off = 0;
  let sMin = Infinity;
  let sMax = -Infinity;

  return (ctx, w, h, _t, dt, p) => {
    off += dt * 7;
    while (off >= 1) {
      off -= 1;
      step();
      buf.shift();
      gi++;
    }
    let tMin = Infinity;
    let tMax = -Infinity;
    for (const q of buf) {
      tMin = Math.min(tMin, q.eq);
      tMax = Math.max(tMax, q.peak);
    }
    const padV = (tMax - tMin) * 0.12 || 0.01;
    tMin -= padV;
    tMax += padV;
    if (!isFinite(sMin) || dt === 0) {
      sMin = tMin;
      sMax = tMax;
    } else {
      const k = 1 - Math.exp(-dt * 2.5);
      sMin += (tMin - sMin) * k;
      sMax += (tMax - sMax) * k;
    }

    const axisW = 46;
    const x0 = 12;
    const x1 = w - axisW;
    const pTop = 30;
    const strip = h > 460 ? 64 : 0;
    const pBot = (h - strip) * 0.72;
    const dTop = pBot + 22;
    const dBot = h - 12 - strip;
    const dx = (x1 - x0) / (N - 1);
    const X = (i: number) => x0 + (i - off) * dx;
    const Y = (v: number) => pTop + (1 - (v - sMin) / (sMax - sMin || 1)) * (pBot - pTop);
    const DY = (d: number) => dTop + (d / LIMIT) * (dBot - dTop);

    // grid + right axis ticks
    frameGrid(ctx, p, x0, pTop, x1, pBot, 0, 4);
    for (let i = 0; i <= 4; i++) {
      const y = pTop + ((pBot - pTop) * i) / 4;
      const v = sMax - ((sMax - sMin) * i) / 4;
      if (Math.abs(y - Y(buf[buf.length - 1]!.eq)) > 14) label(ctx, p, (v * 100).toFixed(1), x1 + 8, y, rgba(p.muted, 0.85), 9);
    }
    ctx.strokeStyle = rgba(p.text, 0.05);
    ctx.beginPath();
    for (let i = 0; i < buf.length; i++) {
      if ((gi + i) % 30 !== 0) continue;
      const x = Math.round(X(i)) + 0.5;
      ctx.moveTo(x, pTop);
      ctx.lineTo(x, dBot);
    }
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, x1 - x0, h);
    ctx.clip();

    // area under equity
    const grad = ctx.createLinearGradient(0, pTop, 0, pBot);
    grad.addColorStop(0, rgba(p.signal, 0.2));
    grad.addColorStop(1, rgba(p.signal, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(X(0), pBot);
    buf.forEach((q, i) => ctx.lineTo(X(i), Y(q.eq)));
    ctx.lineTo(X(buf.length - 1), pBot);
    ctx.closePath();
    ctx.fill();

    // drawdown wedge between running peak and equity
    ctx.fillStyle = rgba(p.risk, 0.32);
    ctx.beginPath();
    buf.forEach((q, i) => ctx.lineTo(X(i), Y(q.peak)));
    for (let i = buf.length - 1; i >= 0; i--) ctx.lineTo(X(i), Y(buf[i]!.eq));
    ctx.closePath();
    ctx.fill();

    // running peak
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = rgba(p.text, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    buf.forEach((q, i) => ctx.lineTo(X(i), Y(q.peak)));
    ctx.stroke();
    ctx.setLineDash([]);

    // equity line with glow
    ctx.shadowColor = rgba(p.signal, 0.7);
    ctx.shadowBlur = 8;
    ctx.strokeStyle = p.signal;
    ctx.lineWidth = 1.7;
    ctx.lineJoin = "round";
    ctx.beginPath();
    buf.forEach((q, i) => ctx.lineTo(X(i), Y(q.eq)));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // drawdown underwater bars
    for (let i = 0; i < buf.length; i++) {
      const d = buf[i]!.dd;
      if (d <= 0.0005) continue;
      ctx.fillStyle = rgba(p.risk, 0.25 + 0.6 * (d / LIMIT));
      ctx.fillRect(X(i) - dx * 0.5, dTop, Math.max(1, dx * 0.8), DY(d) - dTop);
    }
    ctx.restore();

    // DD panel frame + limit
    ctx.strokeStyle = rgba(p.text, 0.08);
    ctx.beginPath();
    ctx.moveTo(x0, dTop + 0.5);
    ctx.lineTo(x1, dTop + 0.5);
    ctx.stroke();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = p.caution;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0, Math.round(DY(LIMIT)) + 0.5);
    ctx.lineTo(x1, Math.round(DY(LIMIT)) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, p, L.dd, x0, dTop - 9, rgba(p.risk, 0.95), 9);
    label(ctx, p, `${L.limit} -${(LIMIT * 100).toFixed(1)}%`, x1 + 8, DY(LIMIT), p.caution, 9);
    const last = buf[buf.length - 1]!;
    label(ctx, p, `-${(last.dd * 100).toFixed(1)}%`, x1 + 8, dTop + 6, rgba(p.risk, 0.95), 9);

    // head dot + price tag
    const hx = X(buf.length - 1);
    const hy = Y(last.eq);
    const pulse = 0.5 + 0.5 * Math.sin(_t * 4);
    ctx.fillStyle = rgba(p.signal, 0.18 + 0.12 * pulse);
    ctx.beginPath();
    ctx.arc(hx, hy, 9 + 3 * pulse, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(hx, hy, 2.6, 0, TAU);
    ctx.fill();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = rgba(p.signal, 0.6);
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy + 0.5);
    ctx.lineTo(x1 + 2, hy + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = p.signal;
    ctx.fillRect(x1 + 2, hy - 8, axisW - 4, 16);
    label(ctx, p, (last.eq * 100).toFixed(1), x1 + 8, hy, p.bg, 9);

    // legend
    let lx = x0;
    const ly = 12;
    const item = (txt: string, col: string, dash: boolean) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      if (dash) ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 12, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      label(ctx, p, txt, lx + 17, ly, rgba(p.text, 0.75), 9);
      ctx.font = `500 9px ${p.font}`;
      lx += 17 + ctx.measureText(txt.toUpperCase()).width + 16;
    };
    item(L.equity, p.signal, false);
    item(L.peak, rgba(p.text, 0.6), true);
    item(L.dd, p.risk, false);

    // stat strip (tall tiles only): exposure sparkline, current / max drawdown vs limit
    if (strip > 0) {
      const sy = h - strip;
      ctx.fillStyle = rgba(p.text, 0.025);
      ctx.fillRect(0, sy, w, strip);
      ctx.strokeStyle = rgba(p.text, 0.08);
      ctx.beginPath();
      ctx.moveTo(0, sy + 0.5);
      ctx.lineTo(w, sy + 0.5);
      const cw = w / 4;
      for (let i = 1; i < 4; i++) {
        ctx.moveTo(Math.round(cw * i) + 0.5, sy);
        ctx.lineTo(Math.round(cw * i) + 0.5, h);
      }
      ctx.stroke();
      const maxDd = buf.reduce((m, q) => Math.max(m, q.dd), 0);
      const cells: [string, string, string][] = [
        [L.equity, (last.eq * 100).toFixed(1), p.signal],
        [L.exposure, `${Math.round(last.e * 100)}%`, p.text],
        [L.maxDd, `-${(maxDd * 100).toFixed(1)}%`, p.risk],
        [L.limit, `-${(LIMIT * 100).toFixed(1)}%`, p.caution],
      ];
      cells.forEach(([k, v, col], i) => {
        const cx = cw * i + 14;
        label(ctx, p, k, cx, sy + 18, rgba(p.muted, 0.95), 9);
        ctx.font = `500 15px ${p.font}`;
        ctx.textAlign = "left";
        ctx.fillStyle = col;
        ctx.fillText(v, cx, sy + 42);
      });
      // exposure sparkline in its cell
      ctx.strokeStyle = rgba(p.text, 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const sx0 = cw + cw * 0.5;
      const sw = cw * 0.42;
      const tail = buf.slice(-60);
      tail.forEach((q, i) => ctx.lineTo(sx0 + (i / (tail.length - 1)) * sw, sy + 46 - q.e * 18));
      ctx.stroke();
    }
  };
}

/* -------------------------------------------------------------- clusters */

function makeClusters(L: TileLabels): Drawer {
  const r = rng(5);
  const K = 5;
  const cols = ["signal", "accent", "caution", "text", "risk"] as const;
  const centers = Array.from({ length: K }, (_, i) => ({
    x: 0.13 + i * 0.185 + (r() - 0.5) * 0.04,
    y: 0.74 - i * 0.12 + (r() - 0.5) * 0.12,
    sx: 0.035 + r() * 0.02,
    sy: 0.045 + r() * 0.03,
  }));
  type P = { nx: number; ny: number; tx: number; ty: number; c: number; d: number; ph: number };
  const pts: P[] = [];
  for (let i = 0; i < 300; i++) {
    const nx = 0.03 + r() * 0.94;
    const ny = 0.06 + r() * 0.88;
    if (r() < 0.14) {
      pts.push({ nx, ny, tx: nx, ty: ny, c: -1, d: 0, ph: r() * TAU });
    } else {
      const c = Math.floor(r() * K);
      const ctr = centers[c]!;
      pts.push({
        nx,
        ny,
        tx: ctr.x + gaussian(r) * ctr.sx,
        ty: ctr.y + gaussian(r) * ctr.sy,
        c,
        d: r() * 0.12,
        ph: r() * TAU,
      });
    }
  }
  // least-squares fit through cluster centers
  const mx = centers.reduce((a, c) => a + c.x, 0) / K;
  const my = centers.reduce((a, c) => a + c.y, 0) / K;
  let num = 0;
  let den = 0;
  for (const c of centers) {
    num += (c.x - mx) * (c.y - my);
    den += (c.x - mx) * (c.x - mx);
  }
  const slope = num / (den || 1);
  const LOOP = 11;
  const START = LOOP * 0.55;

  return (ctx, w, h, t, _dt, p) => {
    const c = ((t + START) % LOOP) / LOOP;
    // assemble 0.08..0.4, hold to 0.88, dissolve to 1
    const pad = 14;
    const X = (v: number) => pad + v * (w - pad * 2);
    const Y = (v: number) => pad + 8 + v * (h - pad * 2 - 8);
    frameGrid(ctx, p, pad, pad + 8, w - pad, h - pad, 8, 5);
    // axis ticks
    ctx.strokeStyle = rgba(p.text, 0.18);
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const x = Math.round(X(i / 16)) + 0.5;
      ctx.moveTo(x, h - pad);
      ctx.lineTo(x, h - pad - (i % 2 ? 3 : 6));
    }
    ctx.stroke();

    const hold = smooth((c - 0.4) / 0.08) * (1 - smooth((c - 0.86) / 0.05));
    const ringAlpha = hold;

    // assignment lines during convergence
    const conv = (q: P) => {
      if (q.c < 0) return 0;
      const a = smooth((c - 0.08 - q.d) / 0.26);
      const b = smooth((c - 0.88) / 0.1);
      return a * (1 - b);
    };

    ctx.lineWidth = 1;
    for (const q of pts) {
      if (q.c < 0) continue;
      const e = conv(q);
      if (e <= 0.02 || e >= 0.98) continue;
      const ctr = centers[q.c]!;
      const x = q.nx + (q.tx - q.nx) * e;
      const y = q.ny + (q.ty - q.ny) * e;
      ctx.strokeStyle = rgba(p[cols[q.c]!], 0.12);
      ctx.beginPath();
      ctx.moveTo(X(x), Y(y));
      ctx.lineTo(X(ctr.x), Y(ctr.y));
      ctx.stroke();
    }

    // fitted trend line
    if (ringAlpha > 0) {
      const prog = smooth((c - 0.42) / 0.16);
      const xa = 0.02;
      const xb = xa + (0.98 - xa) * prog;
      const ya = my + slope * (xa - mx);
      const yb = my + slope * (xb - mx);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = rgba(p.accent, 0.85 * ringAlpha);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(X(xa), Y(ya));
      ctx.lineTo(X(xb), Y(yb));
      ctx.stroke();
      ctx.setLineDash([]);
      if (prog > 0.95) label(ctx, p, L.fit, X(0.98), Y(my + slope * (0.98 - mx)) - 11, rgba(p.accent, ringAlpha), 9, "right");
    }

    // points
    for (const q of pts) {
      const e = conv(q);
      const jx = Math.sin(t * 0.9 + q.ph) * 0.004;
      const jy = Math.cos(t * 0.7 + q.ph) * 0.004;
      const x = X(q.nx + (q.tx - q.nx) * e + jx);
      const y = Y(q.ny + (q.ty - q.ny) * e + jy);
      if (q.c < 0) {
        ctx.fillStyle = rgba(p.muted, 0.45);
        ctx.fillRect(x - 1, y - 1, 2, 2);
      } else {
        const col = p[cols[q.c]!];
        ctx.fillStyle = e > 0.5 ? rgba(col, 0.5 + 0.45 * e) : rgba(p.muted, 0.55 + 0.3 * e);
        ctx.beginPath();
        ctx.arc(x, y, 1.6 + 0.5 * e, 0, TAU);
        ctx.fill();
      }
    }

    // centroid rings
    if (ringAlpha > 0) {
      centers.forEach((ctr, i) => {
        const col = p[cols[i]!];
        const cx = X(ctr.x);
        const cy = Y(ctr.y);
        const rx = ctr.sx * 2.3 * (w - pad * 2);
        const ry = ctr.sy * 2.3 * (h - pad * 2);
        const grow = easeOut((c - 0.4 - i * 0.03) / 0.1);
        ctx.strokeStyle = rgba(col, 0.75 * ringAlpha);
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.lineDashOffset = -t * 8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * grow, ry * grow, 0, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = rgba(col, 0.08 * ringAlpha);
        ctx.fill();
        ctx.strokeStyle = rgba(col, ringAlpha);
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy);
        ctx.lineTo(cx + 4, cy);
        ctx.moveTo(cx, cy - 4);
        ctx.lineTo(cx, cy + 4);
        ctx.stroke();
        label(ctx, p, `${L.cluster}${i + 1}`, Math.min(w - pad - 14, cx + rx * grow * 0.7), Math.max(pad + 16, cy - ry * grow - 7), rgba(col, ringAlpha), 9);
      });
    }

    // header readout
    const nClustered = pts.filter((q) => conv(q) > 0.5).length;
    label(ctx, p, `k=${K}`, pad, 10, rgba(p.text, 0.8), 9);
    label(ctx, p, `${L.noise} ${pts.length - nClustered}`, w - pad, 10, rgba(p.muted, 0.9), 9, "right");
  };
}

/* ----------------------------------------------------------------- nodes */

function makeNodes(L: TileLabels): Drawer {
  type Node = { x: number; y: number; nb: number[]; ph: number; hub: boolean };
  type Packet = { a: number; b: number; s: number; v: number; reroute: number };
  let nodes: Node[] = [];
  let packets: Packet[] = [];
  let bad = 0;
  let key = "";
  const LOOP = 10;
  const START = LOOP * 0.56;

  const build = (w: number, h: number) => {
    const r = rng(21);
    const top = 30;
    const cols = Math.max(6, Math.round(w / 44));
    const rows = Math.max(4, Math.round((h - top) / 40));
    const gx = (w - 24) / (cols - 1);
    const gy = (h - top - 16) / (rows - 1);
    nodes = [];
    for (let rr = 0; rr < rows; rr++)
      for (let cc = 0; cc < cols; cc++)
        nodes.push({
          x: 12 + cc * gx + (r() - 0.5) * gx * 0.3,
          y: top + rr * gy + (r() - 0.5) * gy * 0.3,
          nb: [],
          ph: r() * TAU,
          hub: r() < 0.12,
        });
    const link = (i: number, j: number) => {
      nodes[i]!.nb.push(j);
      nodes[j]!.nb.push(i);
    };
    for (let rr = 0; rr < rows; rr++)
      for (let cc = 0; cc < cols; cc++) {
        const i = rr * cols + cc;
        if (cc < cols - 1) link(i, i + 1);
        if (rr < rows - 1) link(i, i + cols);
        if (cc < cols - 1 && rr < rows - 1 && r() < 0.28) link(i, i + cols + 1);
      }
    bad = Math.floor(rows / 2) * cols + Math.floor(cols * 0.55);
    packets = Array.from({ length: Math.round(cols * rows * 0.75) }, () => {
      const a = Math.floor(r() * nodes.length);
      const nb = nodes[a]!.nb;
      return { a, b: nb[Math.floor(r() * nb.length)]!, s: r(), v: 0.9 + r() * 0.9, reroute: 0 };
    });
  };
  const pr = rng(99);

  return (ctx, w, h, t, dt, p) => {
    const k = `${Math.round(w)}x${Math.round(h)}`;
    if (k !== key) {
      key = k;
      build(w, h);
    }
    const c = ((t + START) % LOOP) / LOOP;
    const flare = smooth((c - 0.28) / 0.14) * (1 - smooth((c - 0.9) / 0.08));
    const isolated = c > 0.45 && c < 0.92;
    const iso = smooth((c - 0.45) / 0.06) * (1 - smooth((c - 0.9) / 0.04));
    const B = nodes[bad]!;

    // red glow behind bad node
    if (flare > 0) {
      const g = ctx.createRadialGradient(B.x, B.y, 0, B.x, B.y, 90);
      g.addColorStop(0, rgba(p.risk, 0.28 * flare));
      g.addColorStop(1, rgba(p.risk, 0));
      ctx.fillStyle = g;
      ctx.fillRect(B.x - 90, B.y - 90, 180, 180);
    }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!;
      for (const j of n.nb) {
        if (j < i) continue;
        const m = nodes[j]!;
        const touchesBad = i === bad || j === bad;
        if (touchesBad && iso > 0) {
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = rgba(p.risk, 0.25 + 0.2 * (1 - iso));
        } else {
          ctx.strokeStyle = rgba(p.text, 0.13);
        }
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // packets
    for (const q of packets) {
      q.s += dt * q.v;
      if (isolated && q.b === bad && q.s < 0.85) {
        // reroute: turn back before reaching the isolated node
        const a = q.a;
        q.a = q.b;
        q.b = a;
        q.s = 1 - q.s;
        q.reroute = 1;
      }
      while (q.s >= 1) {
        q.s -= 1;
        const from = q.a;
        q.a = q.b;
        const opts = nodes[q.a]!.nb.filter((j) => j !== from && !(isolated && j === bad));
        const list = opts.length ? opts : nodes[q.a]!.nb;
        q.b = list[Math.floor(pr() * list.length)]!;
      }
      q.reroute = Math.max(0, q.reroute - dt * 0.8);
      const A = nodes[q.a]!;
      const Bn = nodes[q.b]!;
      const x = A.x + (Bn.x - A.x) * q.s;
      const y = A.y + (Bn.y - A.y) * q.s;
      const tail = Math.max(0, q.s - 0.45);
      const tx = A.x + (Bn.x - A.x) * tail;
      const ty = A.y + (Bn.y - A.y) * tail;
      const col = q.reroute > 0.05 ? p.accent : p.signal;
      const gr = ctx.createLinearGradient(tx, ty, x, y);
      gr.addColorStop(0, rgba(col, 0));
      gr.addColorStop(1, rgba(col, 0.9));
      ctx.strokeStyle = gr;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = q.reroute > 0.05 ? p.accent : "#d9fff6";
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, TAU);
      ctx.fill();
    }

    // nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!;
      const beat = 0.5 + 0.5 * Math.sin(t * 2.4 + n.ph);
      if (i === bad && flare > 0) continue;
      const s = n.hub ? 5 : 3.5;
      ctx.fillStyle = rgba(p.signal, 0.35 + 0.5 * beat);
      ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      if (n.hub) {
        ctx.strokeStyle = rgba(p.signal, 0.25 + 0.25 * beat);
        ctx.strokeRect(n.x - 5.5, n.y - 5.5, 11, 11);
      }
    }
    if (flare > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 9);
      ctx.fillStyle = rgba(p.risk, 0.6 + 0.4 * pulse);
      ctx.fillRect(B.x - 3.5, B.y - 3.5, 7, 7);
      ctx.strokeStyle = rgba(p.risk, 0.5 * flare * (1 - iso) + 0.2);
      ctx.beginPath();
      ctx.arc(B.x, B.y, 8 + 10 * ((t * 1.4) % 1), 0, TAU);
      ctx.stroke();
      if (iso > 0) {
        ctx.strokeStyle = rgba(p.caution, iso);
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);
        ctx.lineDashOffset = t * 10;
        ctx.beginPath();
        ctx.arc(B.x, B.y, 15, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        const lx = B.x + 22;
        const ly = B.y - 20;
        ctx.strokeStyle = rgba(p.caution, 0.6 * iso);
        ctx.beginPath();
        ctx.moveTo(B.x + 11, B.y - 11);
        ctx.lineTo(lx - 2, ly + 4);
        ctx.stroke();
        ctx.font = `500 9px ${p.font}`;
        const tw = ctx.measureText(L.isolated.toUpperCase()).width;
        ctx.fillStyle = rgba(p.bg, 0.85 * iso);
        ctx.fillRect(lx - 2, ly - 7, tw + 10, 14);
        ctx.strokeStyle = rgba(p.caution, 0.7 * iso);
        ctx.strokeRect(lx - 1.5, ly - 6.5, tw + 9, 13);
        label(ctx, p, L.isolated, lx + 3, ly, rgba(p.caution, iso), 9);
      }
    }

    // status bar
    const total = nodes.length;
    const down = flare > 0.5 ? 1 : 0;
    label(ctx, p, `${L.nodes} ${total}`, 12, 11, rgba(p.text, 0.8), 9);
    label(ctx, p, `${L.healthy} ${total - down}`, 12 + 76, 11, p.signal, 9);
    label(ctx, p, `${L.isolated} ${isolated ? 1 : 0}`, 12 + 170, 11, isolated ? p.caution : rgba(p.muted, 0.9), 9);
    if (isolated) label(ctx, p, L.reroute, w - 12, 11, rgba(p.accent, iso), 9, "right");
  };
}

/* -------------------------------------------------------------- assembly */

function makeAssembly(L: TileLabels): Drawer {
  const r = rng(3);
  type Block = { x: number; y: number; w: number; h: number; kind: "bar" | "chart" | "table" | "alert" | "order"; ox: number; oy: number };
  const blocks: Block[] = [
    { x: 0, y: 0, w: 1, h: 0.1, kind: "bar", ox: 0, oy: -0.4 },
    { x: 0, y: 0.14, w: 0.62, h: 0.5, kind: "chart", ox: -0.5, oy: 0.1 },
    { x: 0, y: 0.68, w: 0.62, h: 0.32, kind: "table", ox: -0.2, oy: 0.5 },
    { x: 0.655, y: 0.14, w: 0.345, h: 0.22, kind: "alert", ox: 0.5, oy: -0.2 },
    { x: 0.655, y: 0.4, w: 0.345, h: 0.6, kind: "order", ox: 0.5, oy: 0.3 },
  ];
  blocks.forEach((b) => {
    b.ox += (r() - 0.5) * 0.15;
    b.oy += (r() - 0.5) * 0.15;
  });
  const series = (() => {
    const rr = rng(8);
    let v = 0.5;
    return Array.from({ length: 90 }, () => {
      v = Math.max(0.12, Math.min(0.88, v + (rr() - 0.47) * 0.08));
      return v;
    });
  })();
  const LOOP = 11;
  const START = LOOP * 0.5;
  const names: Record<Block["kind"], string> = { bar: "", chart: L.chart, table: L.table, alert: L.alert, order: L.order };

  const inner = (ctx: CanvasRenderingContext2D, b: Block, x: number, y: number, w: number, h: number, t: number, live: number, p: Palette) => {
    const a = (v: number) => v * (0.35 + 0.65 * live);
    switch (b.kind) {
      case "bar": {
        ctx.fillStyle = rgba(p.accent, a(0.9));
        ctx.fillRect(x + 8, y + h / 2 - 3, 6, 6);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = rgba(p.text, a(i === 0 ? 0.35 : 0.14));
          ctx.fillRect(x + 22 + i * 46, y + h / 2 - 2, 34, 4);
        }
        ctx.fillStyle = rgba(p.signal, a(0.8));
        ctx.beginPath();
        ctx.arc(x + w - 12, y + h / 2, 3, 0, TAU);
        ctx.fill();
        break;
      }
      case "chart": {
        const px = x + 8;
        const pw = w - 16;
        const py = y + 22;
        const ph = h - 30;
        ctx.strokeStyle = rgba(p.text, 0.05);
        ctx.beginPath();
        for (let i = 0; i <= 3; i++) {
          ctx.moveTo(px, Math.round(py + (ph * i) / 3) + 0.5);
          ctx.lineTo(px + pw, Math.round(py + (ph * i) / 3) + 0.5);
        }
        ctx.stroke();
        const shift = Math.floor(t * 6) % series.length;
        const n = 60;
        // candles-ish volume bars
        for (let i = 0; i < n; i++) {
          const v = series[(i + shift) % series.length]!;
          const vb = Math.abs(v - series[(i + shift + 1) % series.length]!) * 4;
          ctx.fillStyle = rgba(p.muted, a(0.25));
          ctx.fillRect(px + (i / n) * pw, py + ph - vb * ph * 0.25, Math.max(1, pw / n - 1), vb * ph * 0.25);
        }
        ctx.strokeStyle = rgba(p.signal, a(1));
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const v = series[(i + shift) % series.length]!;
          ctx.lineTo(px + (i / (n - 1)) * pw, py + (1 - v) * ph);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
        const lv = series[(n - 1 + shift) % series.length]!;
        ctx.fillStyle = p.signal;
        ctx.beginPath();
        ctx.arc(px + pw, py + (1 - lv) * ph, 2.5, 0, TAU);
        ctx.fill();
        break;
      }
      case "table": {
        const rows = 4;
        const rh = (h - 22) / rows;
        const hl = Math.floor(t * 1.2) % rows;
        for (let i = 0; i < rows; i++) {
          const ry = y + 20 + i * rh;
          if (i === hl && live > 0.5) {
            ctx.fillStyle = rgba(p.accent, 0.1);
            ctx.fillRect(x + 1, ry, w - 2, rh);
          }
          ctx.fillStyle = rgba(p.text, a(0.22));
          ctx.fillRect(x + 8, ry + rh / 2 - 1.5, w * 0.22, 3);
          ctx.fillStyle = rgba(p.text, a(0.12));
          ctx.fillRect(x + w * 0.38, ry + rh / 2 - 1.5, w * 0.16, 3);
          ctx.fillStyle = rgba(i % 2 ? p.risk : p.signal, a(0.7));
          ctx.fillRect(x + w * 0.72, ry + rh / 2 - 1.5, w * 0.18, 3);
          ctx.strokeStyle = rgba(p.text, 0.05);
          ctx.beginPath();
          ctx.moveTo(x + 4, Math.round(ry) + 0.5);
          ctx.lineTo(x + w - 4, Math.round(ry) + 0.5);
          ctx.stroke();
        }
        break;
      }
      case "alert": {
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.fillStyle = rgba(p.caution, a(0.7 + 0.3 * pulse * live));
        ctx.fillRect(x, y, 2, h);
        ctx.fillStyle = rgba(p.caution, a(0.9));
        ctx.beginPath();
        ctx.moveTo(x + 14, y + h / 2 + 7);
        ctx.lineTo(x + 21, y + h / 2 - 6);
        ctx.lineTo(x + 28, y + h / 2 + 7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = rgba(p.text, a(0.3));
        ctx.fillRect(x + 36, y + h / 2 - 5, w * 0.5, 3);
        ctx.fillStyle = rgba(p.text, a(0.14));
        ctx.fillRect(x + 36, y + h / 2 + 3, w * 0.34, 3);
        break;
      }
      case "order": {
        const fy = y + 22;
        const fh = Math.min(18, (h - 60) / 4);
        for (let i = 0; i < 3; i++) {
          const yy = fy + i * (fh + 7);
          ctx.strokeStyle = rgba(p.text, a(0.16));
          ctx.strokeRect(x + 8.5, yy + 0.5, w - 17, fh);
          ctx.fillStyle = rgba(p.text, a(0.2));
          ctx.fillRect(x + 14, yy + fh / 2 - 1.5, (w - 30) * (0.3 + i * 0.15), 3);
        }
        const by = fy + 3 * (fh + 7) + 4;
        const bh = Math.max(14, Math.min(22, y + h - by - 8));
        const pulse = 0.5 + 0.5 * Math.sin(t * 3);
        ctx.fillStyle = rgba(p.accent, a(0.75 + 0.25 * pulse * live));
        ctx.fillRect(x + 8, by, w - 16, bh);
        label(ctx, p, L.buy, x + w / 2, by + bh / 2, rgba("#000000", a(0.85)), 8.5, "center");
        break;
      }
    }
  };

  return (ctx, w, h, t, _dt, p) => {
    const c = ((t + START) % LOOP) / LOOP;
    const pad = 14;
    const W = w - pad * 2;
    const H = h - pad * 2;
    // ghost slots
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = rgba(p.text, 0.1);
    for (const b of blocks) ctx.strokeRect(pad + b.x * W + 0.5, pad + b.y * H + 0.5, b.w * W - 1, b.h * H - 1);
    ctx.setLineDash([]);

    blocks.forEach((b, i) => {
      const start = 0.04 + i * 0.07;
      const k = easeOut((c - start) / 0.16);
      const out = smooth((c - 0.9) / 0.08);
      const e = k * (1 - out);
      if (e <= 0.01) return;
      const land = clamp01(1 - Math.abs(c - (start + 0.16)) / 0.05);
      const x = pad + (b.x + b.ox * (1 - e)) * W;
      const y = pad + (b.y + b.oy * (1 - e)) * H;
      const bw = b.w * W;
      const bh = b.h * H;
      ctx.globalAlpha = e;
      ctx.fillStyle = rgba(p.text, 0.025);
      ctx.fillRect(x, y, bw, bh);
      ctx.strokeStyle = land > 0 ? rgba(p.accent, 0.4 + 0.6 * land) : rgba(p.text, 0.18);
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(bw) - 1, Math.round(bh) - 1);
      // corner brackets
      ctx.strokeStyle = rgba(p.accent, 0.8);
      const cs = 6;
      ctx.beginPath();
      ctx.moveTo(x, y + cs);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cs, y);
      ctx.moveTo(x + bw - cs, y + bh);
      ctx.lineTo(x + bw, y + bh);
      ctx.lineTo(x + bw, y + bh - cs);
      ctx.stroke();
      if (names[b.kind]) label(ctx, p, names[b.kind], x + 8, y + 10, rgba(p.muted, 0.95), 8.5);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, bw, bh);
      ctx.clip();
      inner(ctx, b, x, y, bw, bh, t, smooth((c - start - 0.16) / 0.06), p);
      ctx.restore();
      ctx.globalAlpha = 1;
    });
  };
}

const factories: Record<TileKind, (l: TileLabels) => Drawer> = {
  equity: makeEquity,
  clusters: makeClusters,
  nodes: makeNodes,
  assembly: makeAssembly,
};

/** Dense, always-full 2D illustration for a service tile. Pauses off-screen; static frame under reduced motion. */
export default function ServiceTileCanvas({ kind, labels = homeBandsUi.services.canvas }: { kind: TileKind; labels?: TileLabels }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(canvasRef);
  const reduced = useReducedMotion();
  const drawerRef = useRef<{ kind: TileKind; draw: Drawer; t: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!drawerRef.current || drawerRef.current.kind !== kind) {
      drawerRef.current = { kind, draw: factories[kind](labels), t: 0 };
    }
    const d = drawerRef.current;
    const pal: Palette = {
      bg: cssVar("--bg", "#06080b"),
      line: cssVar("--line", "#1d2530"),
      muted: cssVar("--muted", "#8a97a6"),
      accent: cssVar("--accent", "#f44e04"),
      signal: cssVar("--signal", "#33d1b4"),
      risk: cssVar("--risk", "#e5484d"),
      text: cssVar("--text", "#e9eef3"),
      caution: cssVar("--caution", "#f5a524"),
      font: `${cssVar("--font-jetbrains", "")}${cssVar("--font-jetbrains", "") ? ", " : ""}ui-monospace, monospace`,
    };
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
    const frame = (dt: number) => {
      if (w < 4 || h < 4) return;
      ctx.clearRect(0, 0, w, h);
      d.draw(ctx, w, h, d.t, dt, pal);
    };
    resize();
    const still = reduced || !inView;
    const ro = new ResizeObserver(() => {
      resize();
      if (still) frame(0);
    });
    ro.observe(canvas);
    if (still) {
      frame(0);
      return () => ro.disconnect();
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      if (dt < 1 / 45) return; // ~40fps cap
      last = now;
      d.t += dt;
      frame(dt);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [kind, inView, reduced, labels]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
