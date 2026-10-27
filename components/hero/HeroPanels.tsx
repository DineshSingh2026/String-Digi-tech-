"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion as useFmReducedMotion } from "framer-motion";
import { heroUi, home, SIM_LABEL } from "@/content/copy";
import { exposureGen, priceGen, type Regime } from "@/lib/sim";
import { buildPaths } from "@/scenes/SignalField/data";
import { useInView, useReducedMotion, useTicker } from "@/components/interactive/hooks";

const REGIME_ORDER: Regime[] = ["trend", "meanRevert", "highVol", "thinLiquidity"];
const REGIME_TONE: Record<Regime, string> = {
  trend: "text-signal",
  meanRevert: "text-text",
  highVol: "text-caution",
  thinLiquidity: "text-risk",
};
const REGIME_BG: Record<Regime, string> = {
  trend: "bg-signal",
  meanRevert: "bg-text",
  highVol: "bg-caution",
  thinLiquidity: "bg-risk",
};
const LIMIT = 0.08;
const WINDOW = 72;
const W = 300;
const H = 84;

function useSimFeed() {
  const data = useMemo(() => {
    const schedule: { regime: Regime; steps: number }[] = [];
    const seq: Regime[] = ["trend", "meanRevert", "highVol", "trend", "thinLiquidity", "meanRevert", "trend", "highVol"];
    seq.forEach((regime, i) => schedule.push({ regime, steps: 70 + ((i * 37) % 50) }));
    const prices = priceGen(4242, schedule);
    const expo = exposureGen(prices, LIMIT);
    return { prices, expo };
  }, []);
  const [idx, setIdx] = useState(WINDOW + 40);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  useTicker(inView && !reduced, 650, () => {
    setIdx((i) => (i + 1 >= data.prices.length ? WINDOW : i + 1));
  });
  return { ref, idx, ...data };
}

function Sparkline({ values, regimeColor }: { values: number[]; regimeColor: string }) {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const pad = (max - min) * 0.15 || 1;
  min -= pad;
  max += pad;
  const dx = W / (values.length - 1);
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${(i * dx).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;
  const lastY = Number(y(values[values.length - 1]).toFixed(2));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[84px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="hp-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#33D1B4" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#33D1B4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={(H * g).toFixed(2)} y2={(H * g).toFixed(2)} stroke="rgba(233,238,243,0.06)" strokeDasharray="2 4" />
      ))}
      <path d={area} fill="url(#hp-area)" />
      <path d={line} fill="none" stroke="#33D1B4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <line x1={W} x2={W} y1="0" y2={H} stroke="rgba(233,238,243,0.12)" />
      <circle cx={W} cy={lastY} r="3.5" className={regimeColor} fill="currentColor" />
      <circle cx={W} cy={lastY} r="8" className={regimeColor} fill="currentColor" opacity="0.18" />
    </svg>
  );
}

export default function HeroPanels() {
  const { ref, idx, prices, expo } = useSimFeed();
  const fmReduce = useFmReducedMotion();
  const p = buildPaths();
  const regime = prices[idx].regime;
  const regimeLabel = home.riskFirst.regimes[REGIME_ORDER.indexOf(regime)];
  const values = prices.slice(idx - WINDOW + 1, idx + 1).map((x) => x.price);
  const e = expo[idx];
  const ddRatio = Math.min(1, e.drawdown / LIMIT);
  const ddTone = ddRatio > 0.75 ? "bg-risk" : ddRatio > 0.45 ? "bg-caution" : "bg-signal";
  const scale = LIMIT * 1.25;
  const inside = p.height - p.breaches;
  const float = (d: number) =>
    fmReduce ? {} : { animate: { y: [0, -6, 0] }, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay: d } };

  return (
    <div ref={ref} className="relative w-full max-w-[400px] lg:ml-auto">
      {/* Envelope stats: overlaps the monitor for depth */}
      <motion.div
        {...float(1.2)}
        className="panel relative z-20 mb-4 w-full sm:w-[260px] lg:absolute lg:-left-24 lg:-top-36 lg:mb-0"
      >
        <div className="panel-header">
          <span>{heroUi.envelope}</span>
          <span className="panel-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <dl className="grid grid-cols-3 gap-2 px-4 pb-3 pt-3">
          {[
            { k: heroUi.paths, v: p.height, c: "text-text" },
            { k: heroUi.inEnvelope, v: inside, c: "text-signal" },
            { k: heroUi.breaches, v: p.breaches, c: "text-risk" },
          ].map((r) => (
            <div key={r.k} className="min-w-0">
              <dt className="mono truncate text-[10px] uppercase tracking-[0.1em] text-muted">{r.k}</dt>
              <dd className={`mono mt-1 text-[20px] leading-none ${r.c}`}>{r.v}</dd>
            </div>
          ))}
        </dl>
        <div className="mx-4 mb-4 flex h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <span className="h-full bg-signal" style={{ width: `${((inside / p.height) * 100).toFixed(2)}%` }} />
          <span className="h-full bg-risk/70" style={{ width: `${((p.breaches / p.height) * 100).toFixed(2)}%` }} />
        </div>
      </motion.div>

      <motion.div {...float(0)} className="panel relative z-10 w-full">
        <div className="panel-header">
          <span className="flex items-center gap-3">
            <span className="panel-dots" aria-hidden="true">
              <i className="!bg-risk/70" />
              <i className="!bg-caution/70" />
              <i className="!bg-signal/70" />
            </span>
            {heroUi.monitor}
          </span>
          <span className="flex items-center gap-2 text-signal">
            <span className="live-dot" aria-hidden="true" />
            {heroUi.live}
          </span>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{heroUi.regime}</p>
              <p className={`mt-1 font-display text-[22px] leading-none ${REGIME_TONE[regime]}`} aria-live="off">
                {regimeLabel}
              </p>
            </div>
            <div className="flex gap-1" aria-hidden="true">
              {REGIME_ORDER.map((r) => (
                <span
                  key={r}
                  className={`h-5 w-1.5 rounded-sm transition-colors duration-300 ${r === regime ? REGIME_BG[r] : "bg-line"}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3">
            <Sparkline values={values} regimeColor={REGIME_TONE[regime]} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-white/5 bg-white/5">
          <div className="bg-surface/60 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{heroUi.drawdown}</span>
              <span className="mono text-[13px] text-text">{(e.drawdown * 100).toFixed(2)}%</span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-line" aria-hidden="true">
              <span
                className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${ddTone}`}
                style={{ width: `${((e.drawdown / scale) * 100).toFixed(2)}%` }}
              />
              <span className="absolute -top-1 h-3.5 w-px bg-risk" style={{ left: `${((LIMIT / scale) * 100).toFixed(2)}%` }} />
            </div>
            <p className="mono mt-1.5 text-[10px] text-muted">
              {heroUi.limit} <span className="text-risk">{(LIMIT * 100).toFixed(2)}%</span>
            </p>
          </div>
          <div className="bg-surface/60 px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{heroUi.exposure}</span>
              <span className="mono text-[13px] text-text">{(e.exposure * 100).toFixed(0)}%</span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-line" aria-hidden="true">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-text/80 transition-[width] duration-500"
                style={{ width: `${(e.exposure * 100).toFixed(2)}%` }}
              />
            </div>
            <p className="mono mt-1.5 text-[10px] text-muted">
              {heroUi.tick} <span className="text-text">{String(idx).padStart(4, "0")}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-2.5">
          <span className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {heroUi.heartbeat}
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{SIM_LABEL}</span>
        </div>
      </motion.div>
    </div>
  );
}
