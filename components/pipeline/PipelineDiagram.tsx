"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { home, pipelineUi } from "@/content/copy";
import PipelineStage, { type StageTone } from "@/components/ui/PipelineStage";
import { pipelineBus } from "@/scenes/Pipeline/bus";
import { Flow, TUNING, WARM, referenceSnapshot, type Snapshot } from "./engine";
import { CheckIcon, LoopIcon, ReviewerIcon, STAGE_ICONS } from "./icons";

type Orientation = "h" | "v";
type Props = {
  orientation: Orientation;
  stages: readonly string[];
  gates: readonly number[];
  active: number;
  reduced: boolean;
};

/* ---------- layout constants (shared by DOM and canvas so they line up exactly) ---------- */
const H = { height: 360, railY: 186, apexY: 44, labelTop: 236, gap: 54 } as const;
const V = { railX: 66, y0: 84, gaps: [118, 158, 158, 118, 118], left: 16, gap: 52, bottom: 104 } as const;
const V_NODES = V.gaps.reduce<number[]>((a, g) => [...a, (a[a.length - 1] ?? 0) + g], [V.y0]);
const V_HEIGHT = (V_NODES[V_NODES.length - 1] ?? 0) + V.bottom;
const RING_R = 42;
const RING_C = 2 * Math.PI * RING_R;
const HIST = 18;

const r2 = (n: number) => Math.round(n * 100) / 100;
const colPct = (i: number, n: number) => r2(((i + 0.5) / n) * 100);

type RGB = readonly [number, number, number];
const C: Record<"text" | "muted" | "accent" | "signal" | "caution", RGB> = {
  text: [233, 238, 243],
  muted: [138, 151, 166],
  accent: [244, 78, 4],
  signal: [51, 209, 180],
  caution: [245, 165, 36],
};
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type Pt = { x: number; y: number };
type Geo = {
  nodes: Pt[];
  /** px along the rail for each node */
  along: number[];
  rail: (pos: number) => Pt;
  /** unit vector along the rail and its normal */
  dir: Pt;
  arc: Pt[];
  arcCum: number[];
};

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number, out: Pt[]) {
  for (let i = out.length ? 1 : 0; i <= n; i++) {
    const t = i / n;
    const a = 1 - t;
    out.push({
      x: a * a * a * p0.x + 3 * a * a * t * p1.x + 3 * a * t * t * p2.x + t * t * t * p3.x,
      y: a * a * a * p0.y + 3 * a * a * t * p1.y + 3 * a * t * t * p2.y + t * t * t * p3.y,
    });
  }
}

function buildGeo(o: Orientation, w: number, n: number): Geo {
  const arc: Pt[] = [];
  let nodes: Pt[];
  if (o === "h") {
    nodes = Array.from({ length: n }, (_, i) => ({ x: (w * (i + 0.5)) / n, y: H.railY }));
    const a = nodes[n - 1]!;
    const b = nodes[0]!;
    const y0 = H.railY - 34;
    const top = y0 + (H.apexY - y0) / 0.75;
    cubic({ x: a.x, y: y0 }, { x: a.x, y: top }, { x: b.x, y: top }, { x: b.x, y: y0 }, 120, arc);
  } else {
    nodes = V_NODES.map((y) => ({ x: V.railX, y }));
    const last = nodes[n - 1]!;
    const first = nodes[0]!;
    cubic({ x: V.railX, y: last.y + 34 }, { x: V.railX, y: last.y + 68 }, { x: V.left, y: last.y + 68 }, { x: V.left, y: last.y + 12 }, 30, arc);
    cubic({ x: V.left, y: last.y + 12 }, { x: V.left, y: last.y - 100 }, { x: V.left, y: first.y + 100 }, { x: V.left, y: first.y - 12 }, 60, arc);
    cubic({ x: V.left, y: first.y - 12 }, { x: V.left, y: first.y - 68 }, { x: V.railX, y: first.y - 68 }, { x: V.railX, y: first.y - 34 }, 30, arc);
  }
  const arcCum = [0];
  for (let i = 1; i < arc.length; i++) arcCum.push(arcCum[i - 1]! + Math.hypot(arc[i]!.x - arc[i - 1]!.x, arc[i]!.y - arc[i - 1]!.y));
  const s = nodes[0]!;
  const dir = o === "h" ? { x: 1, y: 0 } : { x: 0, y: 1 };
  return {
    nodes,
    along: nodes.map((p) => (o === "h" ? p.x - s.x : p.y - s.y)),
    rail: (pos) => ({ x: s.x + dir.x * pos, y: s.y + dir.y * pos }),
    dir,
    arc,
    arcCum,
  };
}

function arcAt(g: Geo, u: number): Pt {
  const total = g.arcCum[g.arcCum.length - 1] ?? 1;
  const d = Math.max(0, Math.min(1, u)) * total;
  let lo = 0;
  let hi = g.arcCum.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (g.arcCum[m]! < d) lo = m;
    else hi = m;
  }
  const a = g.arc[lo]!;
  const b = g.arc[hi]!;
  const seg = g.arcCum[hi]! - g.arcCum[lo]! || 1;
  const t = (d - g.arcCum[lo]!) / seg;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/* ---------- canvas drawing ---------- */
type Pulse = { gate: number; t: number };

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, g: Geo, f: Flow, pulses: Pulse[], o: Orientation) {
  ctx.clearRect(0, 0, w, h);
  const start = g.nodes[0]!;
  const end = g.nodes[g.nodes.length - 1]!;
  const len = f.length;
  const fracExec = (g.along[4] ?? len * 0.8) / len;

  // rail: muted at research -> accent at execution, with layered glow
  const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  grad.addColorStop(0, rgba(C.muted, 0.4));
  grad.addColorStop(0.45, rgba(C.text, 0.42));
  grad.addColorStop(Math.min(0.99, fracExec), rgba(C.accent, 0.95));
  grad.addColorStop(1, rgba(C.accent, 0.5));
  ctx.lineCap = "round";
  ctx.strokeStyle = grad;
  for (const [lw, a] of [
    [14, 0.05],
    [6, 0.12],
    [1.75, 1],
  ] as const) {
    ctx.globalAlpha = a;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // fine ticks between nodes (instrument scale)
  ctx.fillStyle = rgba(C.text, 0.09);
  const nx = -g.dir.y;
  const ny = g.dir.x;
  for (let i = 0; i < g.along.length - 1; i++) {
    const a = g.along[i]!;
    const b = g.along[i + 1]!;
    for (let k = 1; k < 8; k++) {
      const p = g.rail(a + ((b - a) * k) / 8);
      const l = k === 4 ? 6 : 3;
      if (o === "h") ctx.fillRect(p.x - 0.5, p.y + 9, 1, l);
      else ctx.fillRect(p.x + 9, p.y - 0.5, l, 1);
    }
  }

  // refine arc
  const ag = ctx.createLinearGradient(g.arc[0]!.x, g.arc[0]!.y, g.arc[g.arc.length - 1]!.x, g.arc[g.arc.length - 1]!.y);
  ag.addColorStop(0, rgba(C.signal, 0.12));
  ag.addColorStop(0.5, rgba(C.signal, 0.42));
  ag.addColorStop(1, rgba(C.signal, 0.6));
  ctx.strokeStyle = ag;
  for (const [lw, a] of [
    [7, 0.08],
    [1.25, 1],
  ] as const) {
    ctx.globalAlpha = a;
    ctx.lineWidth = lw;
    ctx.beginPath();
    g.arc.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // arrowhead where the loop re-enters research
  {
    const tip = arcAt(g, 0.995);
    const back = arcAt(g, 0.975);
    const ang = Math.atan2(tip.y - back.y, tip.x - back.x);
    ctx.strokeStyle = rgba(C.signal, 0.75);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tip.x - Math.cos(ang - 0.5) * 7, tip.y - Math.sin(ang - 0.5) * 7);
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(tip.x - Math.cos(ang + 0.5) * 7, tip.y - Math.sin(ang + 0.5) * 7);
    ctx.stroke();
  }

  // gate holding zones + barriers
  f.gates.forEach((gate) => {
    const zoneLen = f.tune.spacing * 5.6;
    const a = g.rail(gate.stop - zoneLen);
    const b = g.rail(gate.stop + 6);
    const zg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    zg.addColorStop(0, rgba(C.caution, 0));
    zg.addColorStop(1, rgba(C.caution, 0.4 * (1 - gate.openAmt * 0.6)));
    ctx.strokeStyle = zg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    const c = g.rail(gate.stop + 9);
    const off = gate.openAmt * 9;
    const alpha = 1 - gate.openAmt * 0.55;
    const seg = (s0: number, s1: number) => {
      ctx.moveTo(c.x + nx * s0, c.y + ny * s0);
      ctx.lineTo(c.x + nx * s1, c.y + ny * s1);
    };
    // soft glow
    const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 22);
    glow.addColorStop(0, rgba(C.caution, 0.22 * alpha));
    glow.addColorStop(1, rgba(C.caution, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(c.x - 22, c.y - 22, 44, 44);
    ctx.strokeStyle = rgba(C.caution, alpha);
    ctx.lineWidth = 2.25;
    ctx.beginPath();
    seg(-(14 + off), -(2.5 + off));
    seg(2.5 + off, 14 + off);
    ctx.stroke();
    // bracket serifs facing the queue
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const bx = -g.dir.x * 4;
    const by = -g.dir.y * 4;
    for (const sgn of [-1, 1]) {
      const e = sgn * (14 + off);
      ctx.moveTo(c.x + nx * e, c.y + ny * e);
      ctx.lineTo(c.x + nx * e + bx, c.y + ny * e + by);
    }
    ctx.stroke();
  });

  // release pulses around gate nodes
  pulses.forEach((p) => {
    const gate = f.gates[p.gate];
    if (!gate) return;
    const n = g.nodes[gate.stage]!;
    const e = 1 - Math.pow(1 - Math.min(1, p.t / 1.1), 3);
    ctx.strokeStyle = rgba(mix(C.caution, C.text, e * 0.5), (1 - e) * 0.65);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(n.x, n.y, RING_R + 4 + e * 34, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.globalCompositeOperation = "lighter";

  // refine particles
  f.arc.forEach((u) => {
    const fade = smooth(0, 0.06, u) * (1 - smooth(0.94, 1, u));
    const head = arcAt(g, u);
    for (let k = 1; k <= 6; k++) {
      const a0 = arcAt(g, u - (k - 1) * 0.0055);
      const a1 = arcAt(g, u - k * 0.0055);
      ctx.strokeStyle = rgba(C.signal, (1 - k / 7) * 0.55 * fade);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a0.x, a0.y);
      ctx.lineTo(a1.x, a1.y);
      ctx.stroke();
    }
    dot(ctx, head, C.signal, fade, 2);
  });

  // main flow particles (array sorted by pos desc)
  const ps = f.ps;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]!;
    const behind = ps[i + 1];
    const frac = p.pos / len;
    let col = mix(C.text, C.accent, smooth(0.45, fracExec, frac));
    const hold = p.queued ? 1 : p.boost * 0.85;
    col = mix(col, C.caution, hold);
    const fade = smooth(0, 22, p.pos) * (1 - smooth(len - 26, len - 2, p.pos));
    const head = g.rail(p.pos);
    const trail = Math.min(p.v * 0.5, 34, behind ? p.pos - behind.pos - 6 : 34);
    if (trail > 1.5) {
      const tail = g.rail(p.pos - trail);
      const tg = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      tg.addColorStop(0, rgba(col, 0));
      tg.addColorStop(0.6, rgba(col, 0.35 * fade));
      tg.addColorStop(1, rgba(col, 0.95 * fade));
      ctx.strokeStyle = tg;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();
    }
    dot(ctx, head, col, fade, p.queued ? 2.3 : 2.1);
  }
  ctx.globalCompositeOperation = "source-over";
}

function dot(ctx: CanvasRenderingContext2D, p: Pt, col: RGB, a: number, r: number) {
  const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
  gl.addColorStop(0, rgba(col, 0.42 * a));
  gl.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = gl;
  ctx.fillRect(p.x - r * 4, p.y - r * 4, r * 8, r * 8);
  ctx.fillStyle = rgba(col, a);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(mix(col, C.text, 0.7), 0.9 * a);
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

/* ---------- component ---------- */

type View = { snap: Snapshot; hist: number[][] };

export default function PipelineDiagram({ orientation: o, stages, gates, active, reduced }: Props) {
  const n = stages.length;
  const initial = useMemo<View>(() => {
    const snap = referenceSnapshot(gates);
    return { snap, hist: snap.inFlight.map((v) => Array.from({ length: HIST }, () => v)) };
  }, [gates]);
  const [view, setView] = useState<View>(initial);
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);
  const ringWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const queueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const toastRefs = useRef<(HTMLDivElement | null)[]>([]);
  const toastNRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = wrap.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let geo: Geo | null = null;
    let flow: Flow | null = null;
    const pulses: Pulse[] = [];
    let hist = initial.hist.map((a) => [...a]);

    const flowGeo = (g: Geo) => ({ nodes: g.along, gateStages: gates, gateGap: o === "h" ? H.gap : V.gap });
    const tuning = (g: Geo) => {
      const col = (g.along[1] ?? 200) - (g.along[0] ?? 0);
      return o === "h" ? { ...TUNING, speed: Math.max(44, col * 0.29) } : { ...TUNING, speed: 46, interval: 1.5 };
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = host.clientWidth;
      h = host.clientHeight;
      if (w < 10) return false;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo = buildGeo(o, w, n);
      if (!flow) {
        flow = new Flow(flowGeo(geo), tuning(geo));
        flow.warm(WARM);
      } else flow.setGeometry(flowGeo(geo));
      return true;
    };

    const syncDom = () => {
      if (!flow) return;
      flow.gates.forEach((g, k) => {
        const ring = ringRefs.current[k];
        if (ring) ring.style.strokeDashoffset = String(r2(RING_C * (1 - g.progress)));
        const q = queueRefs.current[k];
        if (q) {
          const txt = `${pipelineUi.queue} ${String(g.queue).padStart(2, "0")}`;
          if (q.textContent !== txt) q.textContent = txt;
          q.style.opacity = g.queue > 0 ? "1" : "0";
        }
      });
    };

    const publish = () => {
      if (!flow) return;
      const snap = flow.snapshot();
      hist = hist.map((a, i) => [...a.slice(1), snap.inFlight[i] ?? 0]);
      setView({ snap, hist });
    };

    const onRelease = (gate: number, count: number) => {
      pulses.push({ gate, t: 0 });
      pipelineBus.releases++;
      const ringWrap = ringWrapRefs.current[gate];
      ringWrap?.animate(
        [
          { transform: "translate(-50%,-50%) scale(1)", filter: "drop-shadow(0 0 0 rgba(245,165,36,0))" },
          { transform: "translate(-50%,-50%) scale(1.07)", filter: "drop-shadow(0 0 14px rgba(245,165,36,0.85))", offset: 0.25 },
          { transform: "translate(-50%,-50%) scale(1)", filter: "drop-shadow(0 0 0 rgba(245,165,36,0))" },
        ],
        { duration: 900, easing: "cubic-bezier(0.22,1,0.36,1)" },
      );
      const toast = toastRefs.current[gate];
      const nEl = toastNRefs.current[gate];
      if (nEl) nEl.textContent = `+${String(count).padStart(2, "0")}`;
      const lift = o === "h" ? ["translate(-50%, 8px)", "translate(-50%, -4px)", "translate(-50%, -22px)"] : ["translate(0, 8px)", "translate(0, -2px)", "translate(0, -14px)"];
      toast?.animate(
        [
          { opacity: 0, transform: `${lift[0]} scale(0.92)` },
          { opacity: 1, transform: `${lift[1]} scale(1)`, offset: 0.18 },
          { opacity: 1, transform: `${lift[1]} scale(1)`, offset: 0.7 },
          { opacity: 0, transform: `${lift[2]} scale(1)` },
        ],
        { duration: 1900, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "both" },
      );
    };

    const busRect = () => {
      const rr = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      pipelineBus.cy = 1 - ((rr.top + rr.height / 2) / vh) * 2;
      pipelineBus.hh = rr.height / vh;
    };

    const render = () => {
      if (geo && flow) draw(ctx, w, h, geo, flow, pulses, o);
      syncDom();
    };

    let raf = 0;
    let last = 0;
    let statT = 0;
    let running = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!flow || !geo) return;
      flow.advance(dt);
      for (const ev of flow.events) onRelease(ev.gate, ev.n);
      flow.events.length = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i]!.t += dt;
        if (pulses[i]!.t > 1.2) pulses.splice(i, 1);
      }
      render();
      busRect();
      statT += dt;
      if (statT > 0.25) {
        statT = 0;
        publish();
      }
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let inView = false;
    if (resize()) {
      render();
      publish();
    }
    const ro = new ResizeObserver(() => {
      if (resize()) {
        render();
        if (reduced) publish();
      }
    });
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      inView = !!e?.isIntersecting;
      if (inView && !document.hidden) {
        if (!flow && resize()) render();
        start();
      } else stop();
    });
    io.observe(host);
    const onVis = () => (document.hidden || !inView ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [o, n, gates, reduced, initial]);

  const { snap, hist } = view;

  const stageInfo = (i: number) => {
    const k = gates.indexOf(i);
    if (k >= 0) {
      const mode = snap.mode[k];
      const rel = mode === "open" || (snap.since[k] ?? 99) < 1.6;
      const status = rel ? pipelineUi.released : mode === "idle" ? pipelineUi.ready : pipelineUi.review;
      const tone: StageTone = rel ? "signal" : "caution";
      return { status, tone, statLabel: pipelineUi.released, statValue: snap.released[k] ?? 0, progress: snap.progress[k] ?? 0 };
    }
    const tone: StageTone = i === 4 ? "accent" : i === 5 ? "signal" : "muted";
    return { status: pipelineUi.status[i] ?? "", tone, statLabel: pipelineUi.inFlight, statValue: snap.inFlight[i] ?? 0, spark: hist[i] };
  };

  const pos = (i: number): React.CSSProperties =>
    o === "h" ? { left: `${colPct(i, n)}%`, top: H.railY } : { left: V.railX, top: V_NODES[i] ?? 0 };

  return (
    <div
      ref={wrap}
      className="relative"
      style={{ height: o === "h" ? H.height : V_HEIGHT }}
      role="group"
      aria-label={pipelineUi.diagram}
    >
      {/* active stage band */}
      {stages.map((s, i) => (
        <div
          key={`band-${s}`}
          aria-hidden="true"
          className="pointer-events-none absolute transition-opacity duration-700"
          style={{
            opacity: i === active ? 1 : 0,
            ...(o === "h"
              ? { left: `${r2((i / n) * 100)}%`, width: `${r2(100 / n)}%`, top: 0, bottom: 0 }
              : { left: 0, right: 0, top: (V_NODES[i] ?? 0) - 52, height: 104 }),
            background:
              o === "h"
                ? "radial-gradient(closest-side, rgba(244,78,4,0.09) 0%, rgba(244,78,4,0.035) 55%, rgba(244,78,4,0) 100%)"
                : "radial-gradient(closest-side, rgba(244,78,4,0.09) 0%, rgba(244,78,4,0.03) 60%, rgba(244,78,4,0) 100%)",
          }}
        />
      ))}

      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* refine pill */}
      <span
        aria-hidden="true"
        className="mono absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-signal/30 bg-[#0b1015] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-signal shadow-[0_0_20px_-6px_rgba(51,209,180,0.55)]"
        style={o === "h" ? { left: "50%", top: H.apexY } : { left: 42, top: (V_NODES[n - 1] ?? 0) + 53 }}
      >
        <LoopIcon />
        {home.pipeline.loop}
      </span>

      {/* gate rings, reviewer badges, queue counters, release toasts */}
      {gates.map((gi, k) => {
        const p = pos(gi);
        return (
          <div key={`gate-${gi}`} aria-hidden="true">
            <div
              ref={(el) => {
                ringWrapRefs.current[k] = el;
              }}
              className="pointer-events-none absolute"
              style={{ ...p, width: 96, height: 96, transform: "translate(-50%,-50%)" }}
            >
              <svg width={96} height={96} viewBox="0 0 96 96" className="absolute inset-0">
                <circle cx={48} cy={48} r={46.5} fill="none" stroke="rgba(245,165,36,0.35)" strokeWidth={1} strokeDasharray="1 5.12" />
                <circle cx={48} cy={48} r={RING_R} fill="none" stroke="rgba(245,165,36,0.14)" strokeWidth={2.5} />
                <circle
                  ref={(el) => {
                    ringRefs.current[k] = el;
                  }}
                  cx={48}
                  cy={48}
                  r={RING_R}
                  fill="none"
                  stroke="#F5A524"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={r2(RING_C)}
                  strokeDashoffset={r2(RING_C * (1 - (initial.snap.progress[k] ?? 0)))}
                  transform="rotate(-90 48 48)"
                  style={{ filter: "drop-shadow(0 0 4px rgba(245,165,36,0.55))" }}
                />
              </svg>
              <span
                className="absolute grid h-[22px] w-[22px] place-items-center rounded-full border border-caution/60 bg-[#120e07] text-caution shadow-[0_0_12px_-2px_rgba(245,165,36,0.5)]"
                style={{ left: 48 + 33 - 11, top: 48 - 33 - 11 }}
                title={pipelineUi.reviewer}
              >
                <ReviewerIcon />
              </span>
            </div>
            <span
              ref={(el) => {
                queueRefs.current[k] = el;
              }}
              className="mono pointer-events-none absolute whitespace-nowrap text-[9.5px] uppercase tracking-[0.14em] text-caution/85 transition-opacity duration-300"
              style={
                o === "h"
                  ? { left: `calc(${colPct(gi, n)}% - ${H.gap + 2}px)`, top: H.railY + 14, transform: "translateX(-100%)" }
                  : { left: V.railX + 14, top: (V_NODES[gi] ?? 0) - V.gap - 6, transform: "translateY(-100%)" }
              }
            >
              {pipelineUi.queue} {String(initial.snap.queue[k] ?? 0).padStart(2, "0")}
            </span>
            <div
              ref={(el) => {
                toastRefs.current[k] = el;
              }}
              className="mono pointer-events-none absolute inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-signal/40 bg-[#08110f]/95 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-signal opacity-0 shadow-[0_0_24px_-4px_rgba(51,209,180,0.55)]"
              style={o === "h" ? { left: `${colPct(gi, n)}%`, top: H.railY - 84 } : { right: 12, top: (V_NODES[gi] ?? 0) - 64 }}
            >
              <CheckIcon />
              {pipelineUi.released}
              <span
                ref={(el) => {
                  toastNRefs.current[k] = el;
                }}
                className="tabular-nums text-text/80"
              />
            </div>
          </div>
        );
      })}

      {/* stage nodes */}
      {stages.map((s, i) => {
        const Icon = STAGE_ICONS[i] ?? STAGE_ICONS[0];
        const on = i === active;
        const gate = gates.includes(i);
        return (
          <div key={`node-${s}`} aria-hidden="true" className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(i)}>
            <span
              className="pointer-events-none absolute -inset-7 rounded-full transition-opacity duration-700"
              style={{
                opacity: on ? 1 : 0,
                background: "radial-gradient(circle, rgba(244,78,4,0.32) 0%, rgba(244,78,4,0.08) 45%, rgba(244,78,4,0) 70%)",
              }}
            />
            <div
              className={`relative grid h-14 w-14 place-items-center rounded-full border transition-[color,border-color,box-shadow] duration-500 ${
                on ? "border-accent/70 text-accent" : gate ? "border-caution/25 text-text/85" : "border-white/10 text-text/70"
              }`}
              style={{
                background: "radial-gradient(circle at 32% 22%, rgba(255,255,255,0.09), rgba(18,24,33,0.92) 55%, rgba(10,13,18,0.96) 100%)",
                boxShadow: on
                  ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 4px rgba(244,78,4,0.08), 0 10px 30px -8px rgba(244,78,4,0.55)"
                  : "inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 26px -10px rgba(0,0,0,0.9)",
              }}
            >
              <Icon className="h-[22px] w-[22px]" />
            </div>
          </div>
        );
      })}

      {/* labels */}
      <ol
        className={o === "h" ? "absolute inset-x-0 grid" : "absolute inset-0"}
        style={o === "h" ? { top: H.labelTop, gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` } : undefined}
      >
        {stages.map((s, i) => {
          const info = stageInfo(i);
          return (
            <PipelineStage
              key={s}
              index={i}
              label={s}
              gate={gates.includes(i)}
              gateLabel={home.pipeline.gateLabel}
              active={i === active}
              layout={o === "h" ? "column" : "row"}
              className={o === "h" ? "px-2" : "absolute"}
              {...info}
              {...(o === "v" ? { style: { left: V.railX + 62, top: (V_NODES[i] ?? 0) - 40 } } : {})}
            />
          );
        })}
      </ol>
    </div>
  );
}
