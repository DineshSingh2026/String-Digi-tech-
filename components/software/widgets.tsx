"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { softwareUi as ui } from "@/content/copy";
import type { TickerState } from "@/lib/sim";
import { SERIES, START, WINDOW, WALKS, clock, fmt, minuteLabel, r2, signed, sparkPath } from "./data";
import { IconCheck, IconChevron } from "./icons";

/* ---------------------------------- shared bits ---------------------------------- */

export const card =
  "relative h-full overflow-hidden rounded-[10px] border border-[rgba(233,238,243,0.07)] bg-[linear-gradient(180deg,rgba(20,26,35,0.92)_0%,rgba(13,17,23,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]";

function Head({ title, meta }: { title: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-between gap-2 border-b border-[rgba(233,238,243,0.05)] px-3">
      <span className="truncate text-[11.5px] font-medium tracking-[-0.005em] text-text/90">{title}</span>
      {meta ? <span className="mono flex shrink-0 items-center gap-1.5 text-[10px] text-muted/80">{meta}</span> : null}
    </div>
  );
}

function Delta({ v, d = 2, suffix = "%", invert = false }: { v: number; d?: number; suffix?: string; invert?: boolean }) {
  const good = invert ? v <= 0 : v >= 0;
  return (
    <span
      className={`mono inline-flex items-center gap-[3px] rounded-[5px] px-1.5 py-[2px] text-[10px] leading-none tabular-nums ${
        good ? "bg-signal/[0.1] text-signal" : "bg-risk/[0.12] text-risk"
      }`}
    >
      <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true" className={v >= 0 ? "" : "rotate-180"}>
        <path d="M4 1.5L7 6.5H1z" fill="currentColor" />
      </svg>
      {fmt(Math.abs(v), d)}
      {suffix}
    </span>
  );
}

/** Briefly tints a value when it changes, like a terminal tick. */
function Flash({ value, children, className = "" }: { value: number; children: React.ReactNode; className?: string }) {
  const prev = useRef(value);
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  useEffect(() => {
    if (value === prev.current) return;
    setDir(value > prev.current ? 1 : -1);
    prev.current = value;
    const id = window.setTimeout(() => setDir(0), 520);
    return () => window.clearTimeout(id);
  }, [value]);
  return (
    <span
      className={`rounded-[3px] transition-colors duration-500 ${
        dir === 1 ? "bg-signal/[0.16] text-signal" : dir === -1 ? "bg-risk/[0.16] text-risk" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}

/* ----------------------------------- KPI row ----------------------------------- */

type Kpi = { label: string; value: string; unit: string; delta: number; deltaSuffix: string; invert?: boolean; spark: number[]; sub?: string };

export function KpiCard({ k }: { k: Kpi }) {
  const good = k.invert ? k.delta <= 0 : k.delta >= 0;
  const stroke = good ? "var(--signal)" : "var(--risk)";
  const w = 64;
  const h = 22;
  const d = sparkPath(k.spark, w, h);
  return (
    <div className={`${card} px-3 pb-2 pt-2`}>
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] text-muted">{k.label}</span>
        <span className="mono text-[9.5px] text-muted/60">{k.sub ?? ui.kpis.vs}</span>
      </div>
      <div className="mono mt-1 flex items-baseline gap-1 text-[19px] font-medium leading-none tracking-[-0.02em] text-text tabular-nums">
        {k.value}
        <span className="text-[11px] font-normal text-muted">{k.unit}</span>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <Delta v={k.delta} suffix={k.deltaSuffix} invert={k.invert} />
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
          <path d={`${d} L${w} ${h} L0 ${h} Z`} fill={stroke} opacity="0.08" />
          <path d={d} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function kpis(t: number, latency: number): Kpi[] {
  const sl = (a: number[]) => a.slice(t, t + 24);
  const at = (a: number[]) => a[t + 23];
  const ago = (a: number[]) => a[t];
  const ex = at(WALKS.exposure);
  const dd = at(WALKS.drawdown);
  const fr = at(WALKS.fill);
  return [
    { label: ui.kpis.exposure, value: fmt(ex, 1), unit: "%", delta: r2(ex - ago(WALKS.exposure)), deltaSuffix: "", spark: sl(WALKS.exposure) },
    {
      label: ui.kpis.drawdown,
      value: fmt(-dd, 2),
      unit: "%",
      delta: r2(dd - ago(WALKS.drawdown)),
      deltaSuffix: "",
      invert: true,
      spark: sl(WALKS.drawdown).map((v) => -v),
      sub: `${ui.kpis.limit} 8.00`,
    },
    { label: ui.kpis.fill, value: fmt(fr, 2), unit: "%", delta: r2(fr - ago(WALKS.fill)), deltaSuffix: "", spark: sl(WALKS.fill) },
    {
      label: ui.kpis.latency,
      value: fmt(latency, 1),
      unit: ui.status.ms,
      delta: r2(latency - ago(WALKS.latency)),
      deltaSuffix: "",
      invert: true,
      spark: [...sl(WALKS.latency).slice(1), latency],
      sub: "p50",
    },
  ];
}

/* ---------------------------------- Main chart ---------------------------------- */

const F = 16;

function niceStep(span: number) {
  const raw = span / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
}

export function PriceChart({ t, compact = false }: { t: number; compact?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const end = START + t;
  const pts = SERIES.slice(end - WINDOW + 1, end + 1).map((p) => p.price);
  const last = pts[pts.length - 1];
  const open = pts[0];
  const chg = (last / open - 1) * 100;
  const recent = pts.slice(-12);
  const drift = (recent[recent.length - 1] / recent[0] - 1) / 12 * 0.6;
  const fc = Array.from({ length: F + 1 }, (_, k) => {
    const mid = last * (1 + drift * k);
    const w = last * 0.0042 * Math.sqrt(k);
    return { mid, hi: mid + w, lo: mid - w };
  });
  let min = Math.min(...pts, ...fc.map((f) => f.lo));
  let max = Math.max(...pts, ...fc.map((f) => f.hi));
  const pad = (max - min) * 0.1;
  min -= pad;
  max += pad;
  const total = WINDOW + F;
  const X = (i: number) => r2((i / (total - 1)) * 100);
  const Y = (v: number) => r2((1 - (v - min) / (max - min)) * 100);

  const line = pts.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v)}`).join(" ");
  const area = `${line} L${X(WINDOW - 1)} 100 L0 100 Z`;
  const up = fc.map((f, k) => `${k ? "L" : "M"}${X(WINDOW - 1 + k)} ${Y(f.hi)}`).join(" ");
  const lo = fc.map((f, k) => `L${X(WINDOW - 1 + k)} ${Y(f.lo)}`).reverse().join(" ");
  const band = `${up} ${lo} Z`;
  const upLine = up;
  const loLine = fc.map((f, k) => `${k ? "L" : "M"}${X(WINDOW - 1 + k)} ${Y(f.lo)}`).join(" ");
  const midLine = fc.map((f, k) => `${k ? "L" : "M"}${X(WINDOW - 1 + k)} ${Y(f.mid)}`).join(" ");

  const step = niceStep(max - min);
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v < max; v += step) ticks.push(v);

  const lastYv = Y(last);
  const yTicks = ticks.filter((v) => Math.abs(Y(v) - lastYv) > 8);
  const ci = hover ?? WINDOW - 21;
  const cv = pts[ci];
  const cx = X(ci);
  const cy = Y(cv);
  const lastY = Y(last);
  const xLabels = [6, 24, 42, 60].map((i) => ({ x: X(i), label: minuteLabel(i - (WINDOW - 1), t) }));

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (total - 1));
    setHover(Math.max(0, Math.min(WINDOW - 1, i)));
  };

  return (
    <div className={`${card} flex flex-col`}>
      <div className="flex items-start justify-between gap-3 px-3 pt-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] font-medium tracking-[0.02em] text-text">SDT-IDX</span>
            <span className="rounded-[4px] border border-[rgba(233,238,243,0.08)] px-1 py-px text-[9.5px] text-muted">{ui.chart.index}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="mono text-[20px] font-medium leading-none tracking-[-0.02em] text-text tabular-nums">{fmt(last, 2)}</span>
            <Delta v={r2(chg)} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex rounded-[6px] border border-[rgba(233,238,243,0.07)] bg-black/20 p-[2px]">
            {ui.chart.timeframes.map((tf) => (
              <span
                key={tf}
                className={`mono rounded-[4px] px-1.5 py-[3px] text-[9.5px] leading-none ${
                  tf === ui.chart.activeTimeframe ? "bg-[rgba(233,238,243,0.08)] text-text shadow-[inset_0_-1px_0_var(--accent)]" : "text-muted/70"
                }`}
              >
                {tf}
              </span>
            ))}
          </div>
          {!compact ? (
            <div className="flex items-center gap-3 text-[9.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <i className="block h-[2px] w-3 rounded-full bg-signal" />
                {ui.chart.price}
              </span>
              <span className="flex items-center gap-1.5">
                <i className="block h-[6px] w-3 rounded-[2px] border border-dashed border-text/40 bg-text/[0.05]" />
                {ui.chart.forecast}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`relative mt-2 flex min-h-0 flex-1 ${compact ? "h-[150px]" : ""}`}>
        {/* plot */}
        <div className="relative ml-3 min-w-0 flex-1" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {ticks.map((v) => (
            <div key={v} className="absolute inset-x-0 h-px bg-[rgba(233,238,243,0.045)]" style={{ top: `${Y(v)}%` }} />
          ))}
          {xLabels.map((l) => (
            <div key={l.x} className="absolute inset-y-0 w-px bg-[rgba(233,238,243,0.03)]" style={{ left: `${l.x}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="ws-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#ws-area)" />
            <path d={band} fill="rgba(233,238,243,0.045)" />
            <path d={upLine} fill="none" stroke="rgba(233,238,243,0.32)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <path d={loLine} fill="none" stroke="rgba(233,238,243,0.32)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <path d={midLine} fill="none" stroke="var(--signal)" strokeOpacity="0.55" strokeWidth="1.25" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            <path d={line} fill="none" stroke="var(--signal)" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0 0 4px rgba(51,209,180,0.55))" }} />
            <line x1={X(WINDOW - 1)} x2="100" y1={lastY} y2={lastY} stroke="var(--signal)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />
          </svg>
          {/* "now" divider */}
          <div className="absolute inset-y-0 w-px bg-[linear-gradient(180deg,rgba(233,238,243,0.18),rgba(233,238,243,0.02))]" style={{ left: `${X(WINDOW - 1)}%` }}>
            <span className="mono absolute left-1.5 top-0 text-[9px] uppercase tracking-[0.1em] text-muted/70">{ui.chart.now}</span>
          </div>
          {/* last point pulse */}
          <span className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_0_3px_rgba(51,209,180,0.18),0_0_12px_rgba(51,209,180,0.6)]" style={{ left: `${X(WINDOW - 1)}%`, top: `${lastY}%` }} />
          {/* crosshair */}
          <div className="pointer-events-none absolute inset-y-0 w-px bg-[rgba(233,238,243,0.22)]" style={{ left: `${cx}%` }} />
          <div className="pointer-events-none absolute inset-x-0 h-px border-t border-dashed border-[rgba(233,238,243,0.16)]" style={{ top: `${cy}%` }} />
          <span className="pointer-events-none absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-signal bg-bg" style={{ left: `${cx}%`, top: `${cy}%` }} />
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-[rgba(233,238,243,0.1)] bg-[#0b0f14]/95 px-2 py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.8)]"
            style={{ left: `${cx}%`, top: `calc(${cy}% - 40px)` }}
          >
            <div className="mono text-[9.5px] leading-tight text-muted">{minuteLabel(ci - (WINDOW - 1), t)}</div>
            <div className="mono text-[11px] leading-tight text-text tabular-nums">{fmt(cv, 2)}</div>
          </div>
          {/* x labels */}
          {xLabels.map((l) => (
            <span key={l.x} className="mono absolute -bottom-[15px] -translate-x-1/2 text-[9px] text-muted/70" style={{ left: `${l.x}%` }}>
              {l.label}
            </span>
          ))}
        </div>
        {/* y axis */}
        <div className="relative w-[52px] shrink-0">
          {yTicks.map((v) => (
            <span key={v} className="mono absolute left-2 -translate-y-1/2 text-[9px] text-muted/70 tabular-nums" style={{ top: `${Y(v)}%` }}>
              {fmt(v, 0)}
            </span>
          ))}
          <span
            className="mono absolute left-1 -translate-y-1/2 rounded-[4px] bg-signal px-1 py-[2px] text-[9.5px] font-semibold leading-none text-[#04130f] tabular-nums"
            style={{ top: `${lastY}%` }}
          >
            {fmt(last, 1)}
          </span>
        </div>
      </div>
      <div className="h-[22px] shrink-0" />
    </div>
  );
}

/* --------------------------------- Order ticket --------------------------------- */

function Field({ label, children, accent = false, className = "" }: { label: string; children: React.ReactNode; accent?: boolean; className?: string }) {
  return (
    <div
      className={`rounded-[7px] border bg-black/25 px-2 pb-[5px] pt-[4px] ${
        accent ? "border-accent/55 shadow-[0_0_0_3px_rgba(244,78,4,0.12)]" : "border-[rgba(233,238,243,0.08)]"
      } ${className}`}
    >
      <div className="text-[9.5px] leading-[13px] text-muted">{label}</div>
      <div className="flex h-[16px] items-center justify-between text-[11.5px] text-text">{children}</div>
    </div>
  );
}

export function OrderTicket({ ticker, t }: { ticker: TickerState; t: number }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const row = ticker.rows[1];
  const qty = 2500;
  const notional = qty * row.price;
  const used = WALKS.exposure[t + 23];
  return (
    <div className={`${card} flex flex-col`}>
      <Head title={ui.ticket.title} meta={<>{ui.ticket.typeValue}</>} />
      <div className="flex flex-1 flex-col gap-[7px] p-2.5">
        <div className="grid grid-cols-2 rounded-[7px] border border-[rgba(233,238,243,0.07)] bg-black/25 p-[2px] text-[11px] font-medium">
          {(["buy", "sell"] as const).map((s) => (
            <span
              key={s}
              onClick={() => setSide(s)}
              className={`cursor-pointer select-none rounded-[5px] py-[4px] text-center transition-colors duration-200 ${
                side === s
                  ? s === "buy"
                    ? "bg-signal/[0.14] text-signal shadow-[inset_0_0_0_1px_rgba(51,209,180,0.35)]"
                    : "bg-risk/[0.14] text-risk shadow-[inset_0_0_0_1px_rgba(229,72,77,0.4)]"
                  : "text-muted hover:text-text"
              }`}
            >
              {s === "buy" ? ui.ticket.buy : ui.ticket.sell}
            </span>
          ))}
        </div>
        <Field label={ui.ticket.symbol}>
          <span className="mono flex items-center gap-1.5 text-[11px]">
            <span className="h-[6px] w-[6px] rounded-[2px] bg-text/50" />
            {row.symbol}
          </span>
          <span className="mono flex items-center gap-0.5 text-[10.5px] text-muted">
            <Flash value={row.price} className="px-0.5">
              {fmt(row.price, 2)}
            </Flash>
            <IconChevron className="h-3 w-3" />
          </span>
        </Field>
        <div className="grid grid-cols-2 gap-[7px]">
          <Field label={ui.ticket.quantity}>
            <span className="mono text-[11px] tabular-nums">{fmt(qty, 0)}</span>
          </Field>
          <Field label={ui.ticket.limit} accent>
            <span className="mono text-[11px] tabular-nums">{fmt(row.price, 2)}</span>
            <span className="h-3 w-px animate-pulse bg-accent" />
          </Field>
        </div>
        <div className="rounded-[7px] border border-[rgba(233,238,243,0.06)] bg-black/15 px-2 py-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-muted">{ui.ticket.notional}</span>
            <span className="mono text-text/90 tabular-nums">{fmt(notional, 2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted">{ui.ticket.risk}</span>
            <span className="flex items-center gap-1 font-medium text-signal">
              <span className="grid h-3 w-3 place-items-center rounded-full bg-signal/15">
                <IconCheck className="h-2.5 w-2.5" />
              </span>
              {ui.ticket.within}
            </span>
          </div>
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[rgba(233,238,243,0.07)]">
            <div className="h-full rounded-full bg-signal/75 transition-[width] duration-700" style={{ width: `${r2((used / 60) * 100)}%` }} />
          </div>
        </div>
        <div className="mt-auto flex h-[28px] shrink-0 items-center justify-center gap-2 rounded-[7px] bg-[linear-gradient(180deg,#ff6420,#f44e04)] text-[11px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_0_1px_rgba(244,78,4,0.6),0_8px_20px_-8px_rgba(244,78,4,0.8)]">
          {ui.ticket.submit}
          <span className="mono rounded-[3px] bg-black/20 px-1 text-[9px] font-normal">⏎</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Watchlist ----------------------------------- */

export function Watchlist({ ticker }: { ticker: TickerState }) {
  return (
    <div className={card}>
      <Head title={ui.watch.title} meta={<>{ticker.rows.length}</>} />
      <div className="px-3 pt-1.5">
        <div className="grid grid-cols-[1fr_54px_44px_30px] gap-1.5 pb-1 text-[9.5px] text-muted/70">
          <span>{ui.watch.symbol}</span>
          <span className="text-right">{ui.watch.last}</span>
          <span className="text-right">{ui.watch.change}</span>
          <span className="text-right">{ui.watch.range}</span>
        </div>
        {ticker.rows.map((row) => {
          const pos = row.changePct >= 0;
          const w = r2(Math.min(Math.abs(row.changePct) / 1.5, 1) * 50);
          return (
            <div key={row.symbol} className="grid h-[23px] grid-cols-[1fr_54px_44px_30px] items-center gap-1.5 border-t border-[rgba(233,238,243,0.04)] text-[10.5px]">
              <span className="mono truncate text-text/90">{row.symbol}</span>
              <span className="mono text-right text-text/90 tabular-nums">
                <Flash value={row.price} className="px-0.5">
                  {fmt(row.price, row.price < 10 ? 4 : 2)}
                </Flash>
              </span>
              <span className={`mono text-right tabular-nums ${pos ? "text-signal" : "text-risk"}`}>{signed(row.changePct)}%</span>
              <span className="relative h-[10px]">
                <span className="absolute inset-y-0 left-1/2 w-px bg-[rgba(233,238,243,0.12)]" />
                <span
                  className={`absolute top-[2px] h-[6px] rounded-[1.5px] transition-all duration-500 ${pos ? "bg-signal/70" : "bg-risk/70"}`}
                  style={pos ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------ Alerts ------------------------------------ */

const sevDot: Record<string, string> = {
  risk: "bg-risk shadow-[0_0_0_3px_rgba(229,72,77,0.16)]",
  caution: "bg-caution shadow-[0_0_0_3px_rgba(245,165,36,0.16)]",
  signal: "bg-signal shadow-[0_0_0_3px_rgba(51,209,180,0.14)]",
};

export function Alerts({ t }: { t: number }) {
  const pool = ui.alerts.items;
  const m = Math.floor(t / 5);
  const shown = [2, 1, 0].map((o) => {
    const k = m + o;
    return { k, item: pool[k % pool.length], at: clock((k - 2) * 5 - 37, false) };
  });
  return (
    <div className={card}>
      <Head
        title={ui.alerts.title}
        meta={
          <span className="flex items-center gap-1 rounded-full bg-risk/[0.12] px-1.5 py-[1px] text-risk">
            <span className="h-1 w-1 rounded-full bg-risk" />
            {m + 3}
          </span>
        }
      />
      <ul className="relative px-2 pt-1">
        <AnimatePresence initial={false}>
          {shown.map(({ k, item, at }, i) => (
            <motion.li
              key={k}
              layout
              initial={{ opacity: 0, y: -10, backgroundColor: "rgba(244,78,4,0.10)" }}
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(244,78,4,0)" }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 380, damping: 32, backgroundColor: { duration: 1.6 } }}
              className="flex items-start gap-2.5 rounded-[6px] px-1.5 py-[5px]"
            >
              <span className={`mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full ${sevDot[item.sev]}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-medium text-text/90">{item.title}</span>
                  <span className="mono shrink-0 text-[9.5px] text-muted/70">{at}</span>
                </span>
                <span className={`block truncate text-[10px] text-muted ${i === 0 ? "" : ""}`}>{item.detail}</span>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ---------------------------------- Model status ---------------------------------- */

const ECG = "M0 18 H14 L17 15 L20 18 H26 L28 21 L31 4 L34 30 L37 18 H44 L48 13 L53 18 H100";

export function ModelStatus({ t, running }: { t: number; running: boolean }) {
  const regime = SERIES[START + t].regime;
  const conf = WALKS.confidence[t + 23];
  return (
    <div className={card}>
      <Head title={ui.model.title} meta={<>{ui.model.version}</>} />
      <div className="px-2.5 pt-2">
        <div className="relative h-[30px] overflow-hidden rounded-[6px] border border-[rgba(233,238,243,0.05)] bg-black/25">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,238,243,0.04)_1px,transparent_1px)] bg-[size:10px_100%]" />
          <motion.div
            className="absolute inset-y-0 left-0 flex w-[200%]"
            animate={running ? { x: ["0%", "-50%"] } : { x: "0%" }}
            transition={running ? { duration: 2.4, ease: "linear", repeat: Infinity } : { duration: 0 }}
          >
            {[0, 1].map((n) => (
              <svg key={n} viewBox="0 0 100 34" preserveAspectRatio="none" className="h-full w-1/2" aria-hidden="true">
                <path d={ECG} fill="none" stroke="var(--signal)" strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 right-0 w-8 bg-[linear-gradient(90deg,transparent,rgba(13,17,23,0.95))]" />
        </div>
        <div className="mt-2 space-y-[5px] text-[10.5px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">{ui.model.status}</span>
            <span className="flex items-center gap-1.5 text-signal">
              <span className="live-dot !h-[5px] !w-[5px]" />
              {ui.model.healthy}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">{ui.model.regime}</span>
            <span className="truncate text-text/90">{ui.model.regimes[regime]}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted">{ui.model.confidence}</span>
            <span className="mono text-text/90 tabular-nums">{fmt(conf, 2)}</span>
          </div>
          <div className="h-[3px] overflow-hidden rounded-full bg-[rgba(233,238,243,0.08)]">
            <span className="block h-full rounded-full bg-[linear-gradient(90deg,rgba(51,209,180,0.4),var(--signal))] transition-[width] duration-700" style={{ width: `${r2(conf * 100)}%` }} />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-[rgba(233,238,243,0.05)] pt-1.5 text-[9.5px] text-muted/80">
          <span>{ui.model.retrain}</span>
          <span className="mono">{ui.model.retrainAt}</span>
        </div>
      </div>
    </div>
  );
}
