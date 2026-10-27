"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { interactive, pagesUi, solutions } from "@/content/copy";
import { DEFAULT_SCHEDULE, priceGen, rng } from "@/lib/sim";
import SimLabel from "@/components/ui/SimLabel";
import Panel from "@/components/pages/Panel";
import { useInView, useReducedMotion, useTicker } from "./hooks";

type Candle = { o: number; h: number; l: number; c: number; v: number };
type Severity = "info" | "warn" | "alert";

const WINDOW = 44;
const FORECAST = 12;
const W = 760;
const AXIS = 54;
const PW = W - AXIS;
const PH = 270;
const VGAP = 26;
const VH = 70;
const H = PH + VGAP + VH + 4;
const ALERT_EVERY = 3;
const FEED = 5;

const SEV_DOT: Record<Severity, string> = { info: "bg-signal", warn: "bg-caution", alert: "bg-risk" };
const SEV_TEXT: Record<Severity, string> = { info: "text-signal", warn: "text-caution", alert: "text-risk" };
const SEV_BORDER: Record<Severity, string> = { info: "border-signal/25", warn: "border-caution/30", alert: "border-risk/40" };

const f1 = (v: number) => v.toFixed(1);

function buildCandles(): Candle[] {
  const pts = priceGen(33, DEFAULT_SCHEDULE).map((p) => p.price);
  const r = rng(34);
  const per = 4;
  const out: Candle[] = [];
  for (let i = 0; i + per < pts.length; i += per) {
    const seg = pts.slice(i, i + per + 1);
    const o = seg[0]!;
    const c = seg[seg.length - 1]!;
    const move = Math.abs(c - o) / o;
    out.push({ o, c, h: Math.max(...seg), l: Math.min(...seg), v: 0.3 + r() * 0.5 + move * 40 });
  }
  return out;
}

/** Simulated session clock: deterministic from an event index. */
function stamp(idx: number): string {
  const s = 9 * 3600 + 30 * 60 + idx * 41;
  const hh = Math.floor(s / 3600) % 24;
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function AnalyticsDashboard() {
  const copy = solutions["data-analytics"].interactive;
  const ui = pagesUi.analytics;
  const alertsCopy = interactive.analyticsAlerts;
  const ref = useRef<HTMLDivElement>(null);
  const candles = useMemo(buildCandles, []);
  const [pos, setPos] = useState(WINDOW + 6);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  useTicker(inView && !reduced, 1300, () => setPos((p) => (p + 1 >= candles.length ? WINDOW + 6 : p + 1)));

  const view = candles.slice(pos - WINDOW, pos);
  const last = view[view.length - 1]!;
  const first = view[0]!;
  const closes = view.map((c) => c.c);
  const rets = closes.slice(1).map((c, i) => Math.log(c / closes[i]!));
  const mu = rets.reduce((a, b) => a + b, 0) / Math.max(1, rets.length);
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mu) ** 2, 0) / Math.max(1, rets.length));
  const band = Array.from({ length: FORECAST + 1 }, (_, k) => {
    const mid = last.c * Math.exp(mu * k);
    const w = 1.64 * sd * Math.sqrt(k);
    return { mid, up: mid * Math.exp(w), lo: mid * Math.exp(-w) };
  });
  const horizon = band[FORECAST]!;

  const lo = Math.min(...view.map((c) => c.l), ...band.map((b) => b.lo));
  const hi = Math.max(...view.map((c) => c.h), ...band.map((b) => b.up));
  const span = hi - lo || 1;
  const yLo = lo - span * 0.04;
  const yHi = hi + span * 0.04;
  const total = WINDOW + FORECAST;
  const cw = PW / total;
  const Y = (v: number) => 6 + (1 - (v - yLo) / (yHi - yLo)) * (PH - 12);
  const vMax = Math.max(...view.map((c) => c.v));
  const bx = (k: number) => (WINDOW - 1 + k) * cw + cw / 2;
  const bandPath =
    band.map((b, k) => `${k === 0 ? "M" : "L"}${f1(bx(k))},${f1(Y(b.up))}`).join("") +
    band
      .slice()
      .reverse()
      .map((b, k) => `L${f1(bx(FORECAST - k))},${f1(Y(b.lo))}`)
      .join("") +
    "Z";
  const midPath = band.map((b, k) => `${k === 0 ? "M" : "L"}${f1(bx(k))},${f1(Y(b.mid))}`).join("");
  const nowX = bx(0);
  const grid = Array.from({ length: 5 }, (_, i) => yLo + ((i + 0.5) / 5) * (yHi - yLo));

  const change = (last.c / first.o - 1) * 100;
  const kpis = [
    { label: ui.last, value: last.c.toFixed(2), tone: "text-text" },
    { label: ui.change, value: `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(2)}%`, tone: change >= 0 ? "text-signal" : "text-risk" },
    { label: ui.range, value: `${Math.min(...view.map((c) => c.l)).toFixed(1)}–${Math.max(...view.map((c) => c.h)).toFixed(1)}`, tone: "text-text" },
    { label: ui.volatility, value: `${(sd * 100).toFixed(2)}%`, tone: "text-caution" },
    { label: ui.bandWidth, value: `±${(((horizon.up - horizon.lo) / 2 / horizon.mid) * 100).toFixed(2)}%`, tone: "text-accent" },
  ];

  const n = alertsCopy.length;
  const head = Math.floor(pos / ALERT_EVERY);
  const alerts = Array.from({ length: FEED }, (_, i) => {
    const idx = head - i;
    const k = (((idx * 5) % n) + n) % n;
    return { idx, text: alertsCopy[k]!, sev: ui.alertSeverity[k] ?? "info", time: stamp(idx) };
  });

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
        <dl className="grid grid-cols-2 gap-px border-b border-white/[0.06] bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k, i) => (
            <div key={k.label} className={`bg-[#0d1218] px-5 py-4 ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
              <dt className="mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{k.label}</dt>
              <dd className={`mono mt-1.5 text-[19px] tabular-nums md:text-[22px] ${k.tone}`}>{k.value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 p-4 md:p-6">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full"
              role="img"
              aria-label={`${copy.candles}, ${copy.volume}, ${copy.forecast}. ${copy.label}`}
            >
              <defs>
                <linearGradient id="ad-cone" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="var(--accent)" stopOpacity="0.32" />
                  <stop offset="1" stopColor="var(--accent)" stopOpacity="0.06" />
                </linearGradient>
                <linearGradient id="ad-fc" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="var(--accent)" stopOpacity="0.06" />
                  <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* grid + axis */}
              {grid.map((g) => (
                <g key={g.toFixed(4)}>
                  <line x1={0} x2={PW} y1={f1(Y(g))} y2={f1(Y(g))} stroke="rgba(233,238,243,0.05)" />
                  <text x={W - 2} y={f1(Y(g) + 3)} textAnchor="end" fontSize={10} className="mono" fill="var(--muted)">
                    {g.toFixed(1)}
                  </text>
                </g>
              ))}
              {/* forecast zone */}
              <rect x={f1(nowX)} y={0} width={f1(PW - nowX)} height={PH} fill="url(#ad-fc)" />
              <line x1={f1(nowX)} x2={f1(nowX)} y1={0} y2={H} stroke="rgba(233,238,243,0.2)" strokeDasharray="2 4" />
              <path d={bandPath} fill="url(#ad-cone)" stroke="var(--accent)" strokeOpacity={0.55} strokeWidth={1} />
              <path d={midPath} fill="none" stroke="var(--accent)" strokeWidth={1.2} strokeDasharray="4 4" />
              <text x={f1(nowX + 8)} y={16} fontSize={10} className="mono" fill="var(--accent)">
                {copy.forecast.toUpperCase()}
              </text>
              {/* candles */}
              {view.map((c, i) => {
                const x = i * cw + cw / 2;
                const up = c.c >= c.o;
                const col = up ? "var(--signal)" : "var(--risk)";
                const vh = (c.v / vMax) * (VH - 4);
                const top = Y(Math.max(c.o, c.c));
                return (
                  <g key={pos - WINDOW + i}>
                    <line x1={f1(x)} x2={f1(x)} y1={f1(Y(c.h))} y2={f1(Y(c.l))} stroke={col} strokeOpacity={0.9} />
                    <rect
                      x={f1(x - cw * 0.34)}
                      width={f1(cw * 0.68)}
                      y={f1(top)}
                      height={f1(Math.max(1.2, Math.abs(Y(c.o) - Y(c.c))))}
                      fill={up ? col : col}
                      fillOpacity={up ? 0.9 : 0.85}
                      rx={0.8}
                    />
                    <rect
                      x={f1(x - cw * 0.34)}
                      width={f1(cw * 0.68)}
                      y={f1(PH + VGAP + VH - vh)}
                      height={f1(vh)}
                      fill={col}
                      fillOpacity={0.32}
                      rx={0.8}
                    />
                  </g>
                );
              })}
              {/* last price tag */}
              <line x1={0} x2={PW} y1={f1(Y(last.c))} y2={f1(Y(last.c))} stroke="var(--text)" strokeOpacity={0.25} strokeDasharray="1 3" />
              <rect x={PW + 3} y={f1(Y(last.c) - 9)} width={AXIS - 3} height={18} rx={3} fill="var(--text)" />
              <text x={PW + 3 + (AXIS - 3) / 2} y={f1(Y(last.c) + 4)} textAnchor="middle" fontSize={10.5} fontWeight={600} className="mono" fill="#000">
                {last.c.toFixed(2)}
              </text>
              {/* volume label */}
              <line x1={0} x2={PW} y1={PH + VGAP - 6} y2={PH + VGAP - 6} stroke="rgba(233,238,243,0.06)" />
              <text x={W - 2} y={PH + VGAP + 10} textAnchor="end" fontSize={10} className="mono" fill="var(--muted)">
                {copy.volume.toUpperCase()}
              </text>
            </svg>
            <div className="mono mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-1.5 rounded-[1px] bg-signal" />
                <span aria-hidden="true" className="-ml-1 h-2.5 w-1.5 rounded-[1px] bg-risk" />
                {copy.candles}
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-3 rounded-[1px] bg-white/25" />
                {copy.volume}
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-4 rounded-[1px] border border-accent/60 bg-accent/25" />
                {copy.forecast}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col border-t border-white/[0.06] p-4 md:p-5 lg:border-l lg:border-t-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">{copy.alerts}</p>
              <span className="mono text-[11px] text-muted">{stamp(head)}</span>
            </div>
            <ul className="relative flex flex-col gap-2 overflow-hidden" aria-live="off">
              <AnimatePresence initial={false}>
                {alerts.map((a, i) => (
                  <motion.li
                    key={a.idx}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0, y: -16, scale: 0.98 }}
                    animate={{ opacity: i === FEED - 1 ? 0.6 : 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`rounded-lg border bg-white/[0.02] p-3 ${i === 0 ? SEV_BORDER[a.sev] : "border-white/[0.06]"}`}
                  >
                    <div className="mono mb-1.5 flex items-center justify-between text-[10.5px] uppercase tracking-[0.1em]">
                      <span className={`flex items-center gap-2 ${SEV_TEXT[a.sev]}`}>
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${SEV_DOT[a.sev]}`} />
                        {ui.severity[a.sev]}
                      </span>
                      <span className="text-muted">{a.time}</span>
                    </div>
                    <p className={`text-[13px] leading-snug ${i === 0 ? "text-text" : "text-text/80"}`}>{a.text}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}
