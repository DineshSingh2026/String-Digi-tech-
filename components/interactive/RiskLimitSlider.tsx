"use client";
import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { home, interactive, pagesUi, solutions } from "@/content/copy";
import { DEFAULT_SCHEDULE, exposureGen, priceGen, type Regime } from "@/lib/sim";
import SimLabel from "@/components/ui/SimLabel";
import Panel from "@/components/pages/Panel";
import css from "@/components/pages/widgets.module.css";
import { useAnimatedNumber, useReducedMotion } from "./hooks";

const MIN = 5;
const MAX = 30;
const W = 760;
const AXIS = 46;
const PW = W - AXIS;
const PRICE_H = 196;
const SUB_H = 104;
const GAP = 30;
const Y_EXP = PRICE_H + GAP;
const Y_DD = Y_EXP + SUB_H + GAP;
const H = Y_DD + SUB_H + 22;
const DD_SCALE = 0.32;
const STEP = 2;

const REGIMES: Regime[] = ["trend", "meanRevert", "highVol", "thinLiquidity"];
const REGIME_COLOR: Record<Regime, string> = {
  trend: "var(--signal)",
  meanRevert: "var(--text)",
  highVol: "var(--risk)",
  thinLiquidity: "var(--caution)",
};
const regimeLabel = (r: Regime) => home.riskFirst.regimes[REGIMES.indexOf(r)] ?? r;

const f1 = (v: number) => v.toFixed(1);

function line(vals: number[], y: (v: number) => number): string {
  const dx = PW / Math.max(1, vals.length - 1);
  return vals.map((v, i) => `${i === 0 ? "M" : "L"}${f1(i * dx)},${f1(y(v))}`).join("");
}

export default function RiskLimitSlider() {
  const copy = solutions["algorithmic-trading"].interactive;
  const rs = interactive.riskSlider;
  const ui = pagesUi.risk;
  const id = useId();
  const reduced = useReducedMotion();
  const [limitPct, setLimitPct] = useState(12);
  const [hover, setHover] = useState<number | null>(null);

  const prices = useMemo(() => priceGen(21, DEFAULT_SCHEDULE).filter((_, i) => i % STEP === 0), []);
  const priceStatic = useMemo(() => {
    const vals = prices.map((p) => p.price);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const y = (v: number) => 8 + (1 - (v - lo) / (hi - lo || 1)) * (PRICE_H - 16);
    const dx = PW / Math.max(1, prices.length - 1);
    // contiguous regime segments
    const segs: { regime: Regime; from: number; to: number }[] = [];
    prices.forEach((p, i) => {
      const last = segs[segs.length - 1];
      if (last && last.regime === p.regime) last.to = i;
      else segs.push({ regime: p.regime, from: Math.max(0, i - 1), to: i });
    });
    const paths = segs.map((s) => ({
      ...s,
      d: prices
        .slice(s.from, s.to + 1)
        .map((p, k) => `${k === 0 ? "M" : "L"}${f1((s.from + k) * dx)},${f1(y(p.price))}`)
        .join(""),
    }));
    return { y, dx, paths, lo, hi };
  }, [prices]);

  const series = useMemo(() => {
    const exp = exposureGen(priceGen(21, DEFAULT_SCHEDULE), limitPct / 100).filter((_, i) => i % STEP === 0);
    const exposure = exp.map((e) => e.exposure);
    const drawdown = exp.map((e) => e.drawdown);
    return {
      exposure,
      drawdown,
      maxDd: Math.max(...drawdown) * 100,
      avgExp: (exposure.reduce((a, b) => a + b, 0) / exposure.length) * 100,
      reduced: (exposure.filter((e) => e < 0.5).length / exposure.length) * 100,
    };
  }, [limitPct]);

  const yExp = (v: number) => 4 + (1 - v) * (SUB_H - 8);
  const yDd = (v: number) => 4 + (Math.min(v, DD_SCALE) / DD_SCALE) * (SUB_H - 8);
  const expLine = line(series.exposure, yExp);
  const ddLine = line(series.drawdown, yDd);
  const expArea = `${expLine}L${PW},${SUB_H}L0,${SUB_H}Z`;
  const ddArea = `${ddLine}L${PW},4L0,4Z`;
  const limitY = yDd(limitPct / 100);
  const tr = { duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] as const };

  const aMax = useAnimatedNumber(series.maxDd, reduced);
  const aAvg = useAnimatedNumber(series.avgExp, reduced);
  const aRed = useAnimatedNumber(series.reduced, reduced);

  const pct = ((limitPct - MIN) / (MAX - MIN)) * 100;
  const thumbLeft = `calc(${pct.toFixed(2)}% + ${((0.5 - pct / 100) * 20).toFixed(2)}px)`;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    if (x < 0 || x > PW) return setHover(null);
    setHover(Math.round(x / priceStatic.dx));
  };
  const hp = hover !== null ? prices[hover] : null;

  const readouts = [
    { label: ui.maxDrawdown, value: `−${aMax.toFixed(1)}`, tone: "text-risk", bar: series.maxDd / MAX, barCol: "bg-risk" },
    { label: rs.limit, value: `−${limitPct.toFixed(1)}`, tone: "text-caution", bar: limitPct / MAX, barCol: "bg-caution" },
    { label: ui.avgExposure, value: aAvg.toFixed(1), tone: "text-signal", bar: series.avgExp / 100, barCol: "bg-signal" },
    { label: ui.reducedTime, value: aRed.toFixed(1), tone: "text-text", bar: series.reduced / 100, barCol: "bg-text/70", note: ui.reducedNote },
  ];

  return (
    <Panel
      title={
        <>
          {copy.heading} <span className="text-accent">{"//"}</span> {pagesUi.simulation}
        </>
      }
      right={<span className="mono rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-muted">{pagesUi.sim}</span>}
      bodyClassName="grid lg:grid-cols-[320px_1fr]"
      footer={<SimLabel text={copy.label} />}
    >
      {/* Controls + readouts */}
      <div className="flex flex-col gap-7 border-b border-white/[0.06] p-5 md:p-6 lg:border-b-0 lg:border-r">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={id} className="eyebrow">
              {copy.sliderLabel}
            </label>
          </div>
          <p className="mono mt-3 text-[52px] leading-none tracking-[-0.04em] text-caution tabular-nums" aria-hidden="true">
            −{limitPct}
            <span className="text-[24px] text-muted">{rs.unit}</span>
          </p>
          <div className="relative mt-9 h-7">
            {/* track */}
            <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[0.08]" />
            <div
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/40 to-accent"
              style={{ width: thumbLeft }}
            />
            {/* bubble */}
            <div
              aria-hidden="true"
              className="mono pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-black shadow-[0_6px_20px_-4px_rgba(244,78,4,0.7)]"
              style={{ left: thumbLeft }}
            >
              −{limitPct}
              {rs.unit}
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-accent" />
            </div>
            <input
              id={id}
              type="range"
              min={MIN}
              max={MAX}
              step={1}
              value={limitPct}
              onChange={(e) => setLimitPct(Number(e.target.value))}
              aria-valuetext={`−${limitPct}${rs.unit}`}
              className={css.range}
            />
          </div>
          <div aria-hidden="true" className="mono mt-3 flex justify-between text-[10px] text-muted">
            {[5, 10, 15, 20, 25, 30].map((t) => (
              <span key={t} className={t <= limitPct ? "text-text/80" : ""}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <dl className="flex flex-col divide-y divide-white/[0.06] rounded-lg border border-white/[0.06] bg-white/[0.02]">
          {readouts.map((r) => (
            <div key={r.label} className="px-3.5 py-3">
              <div className="flex items-end justify-between gap-3">
                <dt className="mono text-[10.5px] uppercase leading-tight tracking-[0.1em] text-muted">
                  {r.label}
                  {r.note ? <span className="mt-1 block normal-case tracking-normal text-muted/80">{r.note}</span> : null}
                </dt>
                <dd className={`mono shrink-0 text-[20px] leading-none tabular-nums ${r.tone}`}>
                  {r.value}
                  <span className="text-[11px] text-muted">{rs.unit}</span>
                </dd>
              </div>
              <div aria-hidden="true" className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${r.barCol} transition-[width] duration-500 ease-[var(--ease-ui)]`}
                  style={{ width: `${Math.min(100, r.bar * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          ))}
        </dl>

        <div>
          <p className="eyebrow mb-3">{ui.regime}</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
            {REGIMES.map((r) => (
              <li key={r} className="mono flex items-center gap-2 text-[11px] text-muted">
                <span aria-hidden="true" className="h-2 w-2 rounded-sm" style={{ background: REGIME_COLOR[r] }} />
                {regimeLabel(r)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="relative min-w-0 p-4 md:p-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-pan-y"
          role="img"
          aria-label={`${rs.price}, ${copy.exposure}, ${copy.drawdown}. ${copy.label}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="rl-exp" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--signal)" stopOpacity="0.35" />
              <stop offset="1" stopColor="var(--signal)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="rl-dd" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--risk)" stopOpacity="0.04" />
              <stop offset="1" stopColor="var(--risk)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* PRICE */}
          <g>
            {priceStatic.paths.map((s, i) => (
              <g key={`b${i}`}>
                <rect
                  x={f1(s.from * priceStatic.dx)}
                  y={0}
                  width={f1((s.to - s.from) * priceStatic.dx)}
                  height={PRICE_H}
                  fill={REGIME_COLOR[s.regime]}
                  fillOpacity={0.045}
                />
                <line x1={f1(s.from * priceStatic.dx)} x2={f1(s.from * priceStatic.dx)} y1={0} y2={H - 22} stroke="rgba(233,238,243,0.08)" strokeDasharray="2 4" />
                <text x={f1(s.from * priceStatic.dx + 6)} y={14} fontSize={9.5} className="mono" fill={REGIME_COLOR[s.regime]} fillOpacity={0.85}>
                  {regimeLabel(s.regime).toUpperCase()}
                </text>
              </g>
            ))}
            {[0.25, 0.5, 0.75].map((k) => (
              <line key={k} x1={0} x2={PW} y1={f1(PRICE_H * k)} y2={f1(PRICE_H * k)} stroke="rgba(233,238,243,0.05)" />
            ))}
            {priceStatic.paths.map((s, i) => (
              <path key={`p${i}`} d={s.d} fill="none" stroke={REGIME_COLOR[s.regime]} strokeWidth={1.6} strokeLinejoin="round" />
            ))}
            <text x={W - 2} y={14} textAnchor="end" fontSize={10} className="mono" fill="var(--muted)">
              {rs.price.toUpperCase()}
            </text>
            <text x={W - 2} y={f1(priceStatic.y(priceStatic.hi) + 22)} textAnchor="end" fontSize={9.5} className="mono" fill="var(--muted)">
              {priceStatic.hi.toFixed(0)}
            </text>
            <text x={W - 2} y={f1(priceStatic.y(priceStatic.lo))} textAnchor="end" fontSize={9.5} className="mono" fill="var(--muted)">
              {priceStatic.lo.toFixed(0)}
            </text>
          </g>

          {/* EXPOSURE */}
          <g transform={`translate(0 ${Y_EXP})`}>
            <rect x={0} y={0} width={PW} height={SUB_H} fill="rgba(233,238,243,0.015)" />
            <line x1={0} x2={PW} y1={f1(yExp(0.5))} y2={f1(yExp(0.5))} stroke="rgba(233,238,243,0.08)" strokeDasharray="2 4" />
            <motion.path initial={false} animate={{ d: expArea }} transition={tr} fill="url(#rl-exp)" />
            <motion.path initial={false} animate={{ d: expLine }} transition={tr} fill="none" stroke="var(--signal)" strokeWidth={1.5} />
            <text x={W - 2} y={10} textAnchor="end" fontSize={10} className="mono" fill="var(--muted)">
              {copy.exposure.toUpperCase()}
            </text>
            <text x={W - 2} y={f1(yExp(1) + 18)} textAnchor="end" fontSize={9.5} className="mono" fill="var(--muted)">
              100{rs.unit}
            </text>
            <text x={W - 2} y={f1(yExp(0))} textAnchor="end" fontSize={9.5} className="mono" fill="var(--muted)">
              0{rs.unit}
            </text>
          </g>

          {/* DRAWDOWN */}
          <g transform={`translate(0 ${Y_DD})`}>
            <rect x={0} y={0} width={PW} height={SUB_H} fill="rgba(233,238,243,0.015)" />
            <motion.rect
              initial={false}
              animate={{ y: limitY, height: Math.max(0, SUB_H - limitY) }}
              transition={tr}
              x={0}
              width={PW}
              fill="var(--risk)"
              fillOpacity={0.05}
            />
            <motion.path initial={false} animate={{ d: ddArea }} transition={tr} fill="url(#rl-dd)" />
            <motion.path initial={false} animate={{ d: ddLine }} transition={tr} fill="none" stroke="var(--risk)" strokeWidth={1.5} />
            <motion.g initial={false} animate={{ y: limitY }} transition={tr}>
              <line x1={0} x2={PW} y1={0} y2={0} stroke="var(--caution)" strokeWidth={1.2} strokeDasharray="6 5" />
              <rect x={PW + 4} y={-9} width={AXIS - 4} height={18} rx={3} fill="var(--caution)" />
              <text x={PW + AXIS / 2 + 2} y={4} textAnchor="middle" fontSize={10} className="mono" fill="#000" fontWeight={600}>
                −{limitPct}
                {rs.unit}
              </text>
            </motion.g>
            <text x={W - 2} y={10} textAnchor="end" fontSize={10} className="mono" fill="var(--muted)">
              {copy.drawdown.toUpperCase()}
            </text>
          </g>

          {/* x axis */}
          {[0, 100, 200, 300, 400].map((t) => (
            <text key={t} x={f1((t / STEP) * priceStatic.dx)} y={H - 6} fontSize={9.5} className="mono" fill="var(--muted)">
              {t}
            </text>
          ))}

          {/* crosshair */}
          {hover !== null && hp ? (
            <g pointerEvents="none">
              <line x1={f1(hover * priceStatic.dx)} x2={f1(hover * priceStatic.dx)} y1={0} y2={H - 22} stroke="rgba(233,238,243,0.35)" />
              <circle cx={f1(hover * priceStatic.dx)} cy={f1(priceStatic.y(hp.price))} r={3.5} fill={REGIME_COLOR[hp.regime]} stroke="var(--bg)" strokeWidth={1.5} />
              <circle cx={f1(hover * priceStatic.dx)} cy={f1(Y_EXP + yExp(series.exposure[hover] ?? 0))} r={3.5} fill="var(--signal)" stroke="var(--bg)" strokeWidth={1.5} />
              <circle cx={f1(hover * priceStatic.dx)} cy={f1(Y_DD + yDd(series.drawdown[hover] ?? 0))} r={3.5} fill="var(--risk)" stroke="var(--bg)" strokeWidth={1.5} />
            </g>
          ) : null}
        </svg>

        {hover !== null && hp ? (
          <div
            aria-hidden="true"
            className="mono pointer-events-none absolute top-6 z-10 min-w-[150px] rounded-lg border border-white/10 bg-bg/90 p-3 text-[11px] leading-relaxed shadow-xl backdrop-blur"
            style={
              hover / prices.length > 0.6
                ? { right: `calc(${(100 - (hover / (prices.length - 1)) * (PW / W) * 100).toFixed(1)}% + 4px)` }
                : { left: `calc(${((hover / (prices.length - 1)) * (PW / W) * 100).toFixed(1)}% + 28px)` }
            }
          >
            <p className="mb-1 text-muted">
              {pagesUi.risk.step} {hover * STEP}
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted">{rs.price}</span>
              <span className="text-text">{hp.price.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted">{copy.exposure}</span>
              <span className="text-signal">
                {((series.exposure[hover] ?? 0) * 100).toFixed(0)}
                {rs.unit}
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted">{copy.drawdown}</span>
              <span className="text-risk">
                −{((series.drawdown[hover] ?? 0) * 100).toFixed(1)}
                {rs.unit}
              </span>
            </p>
            <p className="mt-1" style={{ color: REGIME_COLOR[hp.regime] }}>
              {regimeLabel(hp.regime)}
            </p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
