"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { interactive, pagesUi, solutions } from "@/content/copy";
import { infraGen, type InfraNode } from "@/lib/sim";
import SimLabel from "@/components/ui/SimLabel";
import Panel from "@/components/pages/Panel";
import css from "@/components/pages/widgets.module.css";
import { linePath, useInView, useReducedMotion, useTicker } from "./hooks";

const HIST = 60;
const SW = 300;
const SH = 56;
const DT = 500;
const LOG = 5;

type Sample = { cpu: number; mem: number; latency: number; anomaly: boolean };
type EvKind = "anomaly" | "isolated" | "restored";
type Ev = { id: number; t: number; node: number; kind: EvKind };
type State = { nodes: InfraNode[]; hist: Sample[]; events: Ev[]; t: number; nextId: number };

function summarize(nodes: InfraNode[]): Sample {
  const live = nodes.filter((n) => n.status !== "isolated");
  const avg = (f: (n: InfraNode) => number) => live.reduce((a, n) => a + f(n), 0) / Math.max(1, live.length);
  return {
    cpu: avg((n) => n.cpu) * 100,
    mem: avg((n) => n.mem) * 100,
    latency: Math.max(0, ...live.map((n) => n.latencyMs)),
    anomaly: nodes.some((n) => n.status === "anomaly"),
  };
}

function diff(prev: InfraNode[], next: InfraNode[], t: number, startId: number): Ev[] {
  const out: Ev[] = [];
  next.forEach((n, i) => {
    const p = prev[i]?.status;
    if (p === n.status) return;
    const kind: EvKind | null =
      n.status === "anomaly" ? "anomaly" : n.status === "isolated" ? "isolated" : p === "isolated" ? "restored" : null;
    if (kind) out.push({ id: startId + out.length, t, node: n.id, kind });
  });
  return out;
}

/** Pure state transition from one generator step. */
function advance(s: State, nodes: InfraNode[]): State {
  const t = s.t + DT;
  const evs = diff(s.nodes, nodes, t, s.nextId);
  return {
    nodes,
    t,
    hist: [...s.hist.slice(1), summarize(nodes)],
    events: [...evs.reverse(), ...s.events].slice(0, LOG),
    nextId: s.nextId + evs.length,
  };
}

function boot() {
  const gen = infraGen(17, 24);
  let s: State = { nodes: gen.nodes, hist: Array.from({ length: HIST }, () => summarize(gen.nodes)), events: [], t: 0, nextId: 0 };
  for (let i = 0; i < HIST; i++) s = advance(s, gen.step(DT).nodes);
  return { gen, state: s };
}

/** Simulated wall clock from elapsed sim ms. */
function clock(t: number): string {
  const s = 14 * 3600 + Math.floor(t / 1000);
  const parts = [Math.floor(s / 3600) % 24, Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0"));
  return `${parts.join(":")}.${String(Math.floor((t % 1000) / 100))}`;
}

const nodeId = (id: number) => `N${String(id + 1).padStart(2, "0")}`;

function Metric({
  label,
  values,
  unit,
  max,
  anomalies,
  color,
  id,
}: {
  label: string;
  values: number[];
  unit: string;
  max: number;
  anomalies: boolean[];
  color: string;
  id: string;
}) {
  const last = values[values.length - 1] ?? 0;
  const peak = Math.max(...values);
  const dx = SW / Math.max(1, values.length - 1);
  const d = linePath(values, SW, SH, 0, max, 4);
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mono mt-1.5 text-[26px] leading-none tabular-nums text-text">
            {last.toFixed(1)}
            <span className="ml-1 text-[12px] text-muted">{unit}</span>
          </p>
        </div>
        <p className="mono text-[10.5px] tabular-nums text-muted">
          {pagesUi.monitoring.peak} <span className="text-text/80">{peak.toFixed(1)}</span>
        </p>
      </div>
      <svg viewBox={`0 0 ${SW} ${SH}`} className="mt-3 block h-[56px] w-full" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {anomalies.map((a, i) =>
          a ? <rect key={i} x={(i * dx - dx / 2).toFixed(1)} width={dx.toFixed(1)} y={0} height={SH} fill="var(--risk)" fillOpacity={0.18} /> : null,
        )}
        <path d={`${d}L${SW},${SH}L0,${SH}Z`} fill={`url(#${id})`} />
        <path d={d} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function cellStyle(n: InfraNode): React.CSSProperties {
  if (n.status === "anomaly") return { background: "var(--risk)", color: "#000" };
  if (n.status === "isolated")
    return {
      background: "repeating-linear-gradient(135deg, rgba(229,72,77,0.28) 0 4px, transparent 4px 9px)",
      boxShadow: "inset 0 0 0 1px rgba(229,72,77,0.7)",
    };
  if (n.status === "warn") return { background: "rgba(245,165,36,0.32)", boxShadow: "inset 0 0 0 1px rgba(245,165,36,0.5)" };
  return { background: `rgba(51,209,180,${(0.06 + n.cpu * 0.42).toFixed(3)})` };
}

export default function MonitoringPanel() {
  const copy = solutions.infrastructure.interactive;
  const m = interactive.monitoring;
  const ui = pagesUi.monitoring;
  const ref = useRef<HTMLDivElement>(null);
  const [initial] = useState(boot);
  const genRef = useRef(initial.gen);
  const stateRef = useRef<State>(initial.state);
  const [state, setState] = useState<State>(initial.state);
  const reduced = useReducedMotion();
  const inView = useInView(ref);

  // Step the generator exactly once per tick, outside any state updater, so StrictMode
  // double-invoking updaters cannot advance the simulation twice.
  useTicker(inView && !reduced, DT, () => {
    const next = advance(stateRef.current, genRef.current.step(DT).nodes);
    stateRef.current = next;
    setState(next);
  });

  const flagged = state.nodes.find((n) => n.status === "anomaly" || n.status === "isolated");
  const anomalies = state.hist.map((h) => h.anomaly);
  const healthy = state.nodes.filter((n) => n.status === "ok").length;
  const warn = state.nodes.filter((n) => n.status === "warn").length;
  const evLabel: Record<EvKind, string> = { anomaly: ui.anomalyEvent, isolated: ui.isolatedEvent, restored: ui.restoredEvent };
  const evTone: Record<EvKind, string> = { anomaly: "text-risk", isolated: "text-caution", restored: "text-signal" };
  const evDot: Record<EvKind, string> = { anomaly: "bg-risk", isolated: "bg-caution", restored: "bg-signal" };

  const legend = [
    { label: m.healthy, swatch: "bg-signal/60" },
    { label: ui.warn, swatch: "bg-caution/60" },
    { label: copy.anomaly, swatch: "bg-risk" },
    { label: m.isolated, swatch: "border border-risk bg-risk/20" },
  ];

  return (
    <div ref={ref}>
      <Panel
        title={
          <>
            {copy.heading} <span className="text-accent">{"//"}</span> {pagesUi.simulation}
          </>
        }
        right={
          <>
            <span className="live-dot" aria-hidden="true" />
            <span className="text-signal">{pagesUi.live}</span>
            <span className="mono ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-muted">{pagesUi.sim}</span>
          </>
        }
        bodyClassName=""
        footer={<SimLabel text={copy.label} />}
      >
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 md:p-5 lg:border-b-0 lg:border-r">
            <Metric id="mp-cpu" label={copy.cpu} unit={m.percentUnit} values={state.hist.map((h) => h.cpu)} max={100} anomalies={anomalies} color="var(--signal)" />
            <Metric id="mp-mem" label={copy.memory} unit={m.percentUnit} values={state.hist.map((h) => h.mem)} max={100} anomalies={anomalies} color="#9fb3c8" />
            <Metric id="mp-lat" label={copy.latency} unit={m.msUnit} values={state.hist.map((h) => h.latency)} max={80} anomalies={anomalies} color="var(--caution)" />
          </div>

          <div className="flex min-w-0 flex-col p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="eyebrow">{ui.heatmap}</p>
              <p className="mono text-[11px] tabular-nums text-muted">
                {m.nodes} <span className="text-text">{state.nodes.length}</span>
                <span className="mx-2 text-white/20">|</span>
                {m.healthy} <span className="text-signal">{healthy}</span>
                <span className="mx-2 text-white/20">|</span>
                {ui.warn} <span className="text-caution">{warn}</span>
              </p>
            </div>
            <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6" aria-hidden="true">
              {state.nodes.map((n) => (
                <li
                  key={n.id}
                  style={cellStyle(n)}
                  className={`mono relative flex h-[58px] flex-col lg:h-[78px] justify-between rounded-md p-2 text-[10px] leading-none text-text transition-[background-color] duration-300 ${
                    n.status === "anomaly" ? css.ring : ""
                  }`}
                >
                  <span className={n.status === "anomaly" ? "text-black/80" : "text-text/70"}>{nodeId(n.id)}</span>
                  <span className="text-[12px] tabular-nums">{n.status === "isolated" ? "—" : `${Math.round(n.cpu * 100)}`}</span>
                </li>
              ))}
            </ul>
            <ul className="mono mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-muted">
              {legend.map((l) => (
                <li key={l.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${l.swatch}`} />
                  {l.label}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-6 rounded-sm bg-gradient-to-r from-signal/10 to-signal/50" />
                {ui.load}
              </li>
            </ul>
            <p className="mono mt-auto flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[12px] tabular-nums" role="status">
              <span className="text-muted">{copy.anomaly}:</span>
              {flagged ? (
                <span className="text-risk">
                  {nodeId(flagged.id)} · {flagged.status === "isolated" ? m.isolated : copy.anomaly}
                </span>
              ) : (
                <span className="text-signal">{m.anomalyNone}</span>
              )}
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">{ui.eventLog}</p>
            <span className="mono text-[11px] tabular-nums text-muted">{clock(state.t)}</span>
          </div>
          <ol className="mono flex flex-col text-[12px] tabular-nums">
            {state.events.length === 0 ? <li className="py-2 text-muted">{ui.awaiting}</li> : null}
            <AnimatePresence initial={false}>
              {state.events.map((e, i) => (
                <motion.li
                  key={e.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid grid-cols-[96px_14px_1fr_auto] items-center gap-2 py-2 ${i > 0 ? "border-t border-white/[0.04]" : ""}`}
                >
                  <span className="text-muted">{clock(e.t)}</span>
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${evDot[e.kind]}`} />
                  <span className={i === 0 ? "text-text" : "text-text/75"}>{evLabel[e.kind]}</span>
                  <span className={evTone[e.kind]}>{nodeId(e.node)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
      </Panel>
    </div>
  );
}
