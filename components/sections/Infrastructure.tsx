"use client";

import { useMemo, useRef, useState } from "react";
import { home, bandsUi, interactive } from "@/content/copy";
import Reveal from "@/components/ui/Reveal";
import SimLabel from "@/components/ui/SimLabel";
import { useInView, useTicker } from "@/components/interactive/hooks";
import { infraGen, type InfraNode } from "@/lib/sim";
import { infraBus } from "@/scenes/engine/scene-store";
import Section from "./Section";

const ui = bandsUi.infrastructure;
const NODES = 160;
const TICK_MS = 200;
const SIM_SPEED = 0.5; // sim ms per wall ms: stretches each incident so it can be followed
const SPARK = 72;

type Ev = { id: number; t: number; node: number; kind: keyof typeof ui.events };
const EV_TONE: Record<Ev["kind"], string> = {
  anomaly: "bg-risk",
  isolated: "bg-caution",
  reroute: "bg-signal",
  restored: "bg-signal",
};

function counts(nodes: InfraNode[]) {
  const c = { ok: 0, warn: 0, anomaly: 0, isolated: 0 };
  for (const n of nodes) c[n.status]++;
  return c;
}

function fmtT(ms: number) {
  const s = Math.floor(ms / 1000);
  return `T+${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function Monitor() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  // pre-roll the seeded sim so the first incident arrives within a few seconds (deterministic, SSR-safe)
  const { sim, first } = useMemo(() => {
    const s = infraGen(11, NODES);
    return { sim: s, first: s.step(3600).nodes };
  }, []);
  const [nodes, setNodes] = useState<InfraNode[]>(first);
  const [lat, setLat] = useState<number[]>(() => Array.from({ length: SPARK }, (_, i) => 6 + Math.sin(i * 0.7) * 0.8));
  const [events, setEvents] = useState<Ev[]>([]);
  const st = useRef({ t: 0, seq: 0, focus: -1, phase: "none" as "none" | "anomaly" | "isolated" });

  useTicker(inView, TICK_MS, () => {
    const s = st.current;
    s.t += TICK_MS;
    const { nodes: next } = sim.step(TICK_MS * SIM_SPEED);
    let an = -1;
    let iso = -1;
    let peak = 0;
    for (const n of next) {
      if (n.status === "anomaly") an = n.id;
      else if (n.status === "isolated") iso = n.id;
      if (n.latencyMs > peak) peak = n.latencyMs;
    }
    infraBus.anomaly = an;
    infraBus.isolated = iso;
    infraBus.stamp = performance.now();

    const add: Ev[] = [];
    const phase = an >= 0 ? "anomaly" : iso >= 0 ? "isolated" : "none";
    if (phase !== s.phase) {
      if (phase === "anomaly") add.push({ id: s.seq++, t: s.t, node: an, kind: "anomaly" });
      if (phase === "isolated") {
        add.push({ id: s.seq++, t: s.t, node: iso, kind: "isolated" });
        add.push({ id: s.seq++, t: s.t + 1, node: iso, kind: "reroute" });
      }
      if (phase === "none" && s.focus >= 0) add.push({ id: s.seq++, t: s.t, node: s.focus, kind: "restored" });
      s.phase = phase;
      s.focus = an >= 0 ? an : iso;
    }
    setNodes(next);
    setLat((l) => [...l.slice(1), peak]);
    if (add.length) setEvents((e) => [...add.reverse(), ...e].slice(0, 5));
  });

  const c = counts(nodes);
  const max = Math.max(20, ...lat);
  const W = 300;
  const H = 64;
  const pts = lat.map((v, i) => `${((i / (SPARK - 1)) * W).toFixed(1)},${(H - 4 - (v / max) * (H - 10)).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${W},${H} L0,${H} Z`;
  const cur = lat[lat.length - 1];
  const spiking = cur > 20;

  const stats = [
    { k: ui.healthy, v: c.ok, tone: "text-signal", dot: "bg-signal" },
    { k: ui.warn, v: c.warn, tone: "text-caution", dot: "bg-caution" },
    { k: ui.anomaly, v: c.anomaly, tone: c.anomaly ? "text-risk" : "text-muted", dot: "bg-risk" },
    { k: ui.isolated, v: c.isolated, tone: c.isolated ? "text-text" : "text-muted", dot: "bg-muted" },
  ];

  return (
    <div ref={ref} className="panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-3">
          <span className="panel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {ui.panelTitle}
        </span>
        <span className="flex items-center gap-2">
          <span className="live-dot" aria-hidden="true" />
          <span className="tabular-nums">
            {NODES} {ui.nodes}
          </span>
        </span>
      </div>

      <dl className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
        {stats.map((s) => (
          <div key={s.k} className="flex flex-col gap-1.5 px-3 py-3 sm:px-4">
            <dt className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-muted">
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              <span className="truncate">{s.k}</span>
            </dt>
            <dd className={`mono text-[20px] tabular-nums leading-none transition-colors ${s.tone}`}>{s.v}</dd>
          </div>
        ))}
      </dl>

      <div className="border-b border-white/5 px-4 pb-3 pt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="mono text-[10px] uppercase tracking-[0.1em] text-muted">{ui.peakLatency}</span>
          <span className={`mono text-[13px] tabular-nums ${spiking ? "text-risk" : "text-text"}`}>
            {cur.toFixed(1)} <span className="text-muted">{ui.msUnit}</span>
          </span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-16 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="infra-lat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--signal)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="url(#infra-lat)" />
          <path d={line} fill="none" stroke={spiking ? "var(--risk)" : "var(--signal)"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="px-4 pb-2 pt-3">
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.1em] text-muted">{ui.eventLog}</p>
        <ol className="mono flex min-h-[132px] flex-col gap-1 text-[12px]" aria-live="off">
          {events.length === 0 ? (
            <li className="text-muted">{interactive.monitoring.anomalyNone}</li>
          ) : (
            events.map((e, i) => (
              <li
                key={e.id}
                className={`ev-in grid grid-cols-[64px_14px_56px_1fr] items-center gap-1 ${i === 0 ? "text-text" : "text-muted"}`}
              >
                <span className="tabular-nums text-muted">{fmtT(e.t)}</span>
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${EV_TONE[e.kind]}`} />
                <span className="tabular-nums">{`N-${String(e.node).padStart(3, "0")}`}</span>
                <span className="truncate">{ui.events[e.kind]}</span>
              </li>
            ))
          )}
        </ol>
      </div>
      <div className="border-t border-white/5 px-4 py-2">
        <SimLabel className="text-[10px]" />
      </div>
    </div>
  );
}

export default function Infrastructure() {
  const h = home.infrastructure;
  return (
    <Section scene="NodeMesh" labelledBy="infra-h" className="overflow-hidden py-24 lg:py-32" scrim={false}>
      <style>{`
        @keyframes ev-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        .ev-in { animation: ev-in 420ms var(--ease-ui) both; }
      `}</style>
      <div className="container-x grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 flex flex-col lg:col-span-5">
          <Reveal>
            <p className="section-index mb-6">
              07 / {bandsUi.index.total} — {bandsUi.index.infrastructure}
            </p>
            <h2 id="infra-h" className="h2 text-gradient">
              {h.heading}
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-muted md:text-[18px]">{h.body}</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <Monitor />
          </Reveal>
        </div>

        <div className="relative col-span-12 h-[380px] sm:h-[520px] lg:col-span-7 lg:h-auto lg:min-h-[640px]">
          {/* the globe is drawn into this box */}
          <div data-scene-rect className="absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(51,209,180,0.06),transparent_75%)]"
          />
          <ul className="mono pointer-events-none absolute inset-x-0 bottom-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-muted">
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-px w-5 bg-signal shadow-[0_0_6px_var(--signal)]" />
              {ui.legend.heartbeat}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full border border-risk shadow-[0_0_6px_var(--risk)]" />
              {ui.legend.anomaly}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full border border-dashed border-caution" />
              {ui.isolated}
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-[2px] w-5 bg-signal" />
              {ui.legend.reroute}
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
