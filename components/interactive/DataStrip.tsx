"use client";
import { useRef, useState } from "react";
import { heroUi, home, interactive } from "@/content/copy";
import { tickerGen, type TickerRow } from "@/lib/sim";
import SimLabel from "@/components/ui/SimLabel";
import { useInView, useReducedMotion, useTicker } from "./hooks";

type TickerState = ReturnType<ReturnType<typeof tickerGen>["next"]>;
const HIST = 28;

function fmtHeartbeat(hb: unknown): string {
  if (typeof hb === "number") return String(hb % 10000).padStart(4, "0");
  if (typeof hb === "boolean") return hb ? "1" : "0";
  return String(hb);
}

function fmtPrice(p: number): string {
  return p < 10 ? p.toFixed(4) : p.toFixed(2);
}

function Spark({ values, up }: { values: number[]; up: boolean }) {
  const w = 56;
  const h = 18;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  const dx = values.length > 1 ? w / (values.length - 1) : 0;
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${(i * dx).toFixed(1)},${(2 + (1 - (v - min) / span) * (h - 4)).toFixed(1)}`).join("");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" className={up ? "text-signal" : "text-risk"}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function TickerItem({ row, hist }: { row: TickerRow; hist: number[] }) {
  const up = row.changePct >= 0;
  return (
    <li className="flex shrink-0 items-center gap-3 border-r border-white/[0.06] px-6">
      <span className="text-[11px] tracking-[0.08em] text-muted">{row.symbol}</span>
      <span className="text-text">{fmtPrice(row.price)}</span>
      <span className={`inline-flex items-center gap-1 ${up ? "text-signal" : "text-risk"}`}>
        <span aria-hidden="true" className="text-[9px]">
          {up ? "▲" : "▼"}
        </span>
        {up ? "+" : ""}
        {row.changePct.toFixed(2)}%
      </span>
      <Spark values={hist} up={up} />
    </li>
  );
}

export default function DataStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const genRef = useRef<ReturnType<typeof tickerGen> | null>(null);
  if (genRef.current === null) genRef.current = tickerGen(7);
  const [state, setState] = useState<TickerState>(() => genRef.current!.initial);
  // seed a deterministic warm-up history so sparklines are populated on first paint (SSR-safe)
  const [hist, setHist] = useState<number[][]>(() => {
    const g = tickerGen(11);
    const h: number[][] = g.initial.rows.map(() => []);
    for (let i = 0; i < HIST; i++) g.next().rows.forEach((r, j) => h[j].push(r.price));
    return h;
  });
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  useTicker(inView && !reduced, 800, () => {
    if (!genRef.current) return;
    const s = genRef.current.next();
    setState(s);
    setHist((prev) => prev.map((h, i) => [...h.slice(1 - HIST), s.rows[i].price]));
  });
  const r = home.dataStrip.readouts;
  const rows = state.rows;
  const items = (keyPrefix: string) =>
    [0, 1].flatMap((rep) => rows.map((row, i) => <TickerItem key={`${keyPrefix}-${rep}-${row.symbol}`} row={row} hist={hist[i]} />));

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* label */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 md:px-6 lg:border-b-0 lg:border-r">
          <span className="live-dot" aria-hidden="true" />
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-text">{heroUi.marketTape}</span>
          <SimLabel text={home.dataStrip.label} className="ml-auto text-[10px] lg:hidden" />
        </div>

        {/* marquee: two identical halves -> translateX(-50%) loops seamlessly */}
        <div
          className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
          aria-label={interactive.dataStrip.tickerLabel}
          role="region"
        >
          <div className="marquee mono py-4 text-[13px] tabular-nums" style={reduced ? { animation: "none" } : undefined}>
            <ul className="flex">{items("a")}</ul>
            <ul className="flex" aria-hidden="true">
              {items("b")}
            </ul>
          </div>
        </div>

        {/* readouts */}
        <dl className="mono grid grid-cols-3 border-t border-white/[0.06] text-[12px] tabular-nums lg:flex lg:border-l lg:border-t-0">
          <div className="flex flex-col justify-center gap-0.5 px-4 py-3 md:px-6">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">{r.ticks}</dt>
            <dd className="text-[15px] text-text">{state.ticksPerSec.toLocaleString("en-US")}</dd>
          </div>
          <div className="flex flex-col justify-center gap-0.5 border-l border-white/[0.06] px-4 py-3 md:px-6">
            <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">{r.latency}</dt>
            <dd className="text-[15px] text-text">
              {state.latencyMs.toFixed(1)}
              <span className="text-muted"> {interactive.dataStrip.latencyUnit}</span>
            </dd>
          </div>
          <div className="flex flex-col justify-center gap-0.5 border-l border-white/[0.06] px-4 py-3 md:px-6">
            <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
              <span className="live-dot !h-1.5 !w-1.5" aria-hidden="true" />
              {r.heartbeat}
            </dt>
            <dd className="text-[15px] text-signal">{fmtHeartbeat(state.heartbeat)}</dd>
          </div>
        </dl>
      </div>
      <div className="hidden justify-end border-t border-white/[0.06] px-6 py-1.5 lg:flex">
        <SimLabel text={home.dataStrip.label} className="text-[10px]" />
      </div>
    </div>
  );
}
