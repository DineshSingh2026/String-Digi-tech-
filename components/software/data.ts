"use client";

import { useEffect, useState } from "react";
import { priceGen, rng, gaussian, tickerGen, type Regime, type TickerState } from "@/lib/sim";

/** Round to 2 decimals so SSR and client markup match exactly. */
export const r2 = (v: number) => Math.round(v * 100) / 100;

/** Locale-independent number formatting (toLocaleString differs between Node and browsers). */
export function fmt(v: number, d = 2): string {
  const neg = v < 0;
  const [int, frac] = Math.abs(v).toFixed(d).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}
export const signed = (v: number, d = 2) => `${v >= 0 ? "+" : "−"}${fmt(Math.abs(v), d)}`;

/* ---------- precomputed, seeded series (deterministic on server and client) ---------- */

const SCHEDULE: { regime: Regime; steps: number }[] = [
  { regime: "trend", steps: 140 },
  { regime: "meanRevert", steps: 70 },
  { regime: "trend", steps: 110 },
  { regime: "highVol", steps: 50 },
  { regime: "meanRevert", steps: 60 },
  { regime: "trend", steps: 130 },
];
const RAW = priceGen(2031, SCHEDULE, 100);
const REF = RAW[160].price;
/** Damp the toy GBM so a 72-minute window moves a realistic fraction of a percent. */
export const SERIES = RAW.map((p) => ({ price: 1842.3 * (p.price / REF) ** 0.22, regime: p.regime }));

export const WINDOW = 72;
export const START = 120;
export const MAX_T = SERIES.length - START - 1;

function walk(seed: number, n: number, start: number, vol: number, lo: number, hi: number, pull = 0.05): number[] {
  const r = rng(seed);
  const out = [start];
  let v = start;
  for (let i = 1; i < n; i++) {
    v += (start - v) * pull + gaussian(r) * vol;
    v = Math.max(lo, Math.min(hi, v));
    out.push(v);
  }
  return out;
}

const N = MAX_T + 40;
export const WALKS = {
  exposure: walk(11, N, 42.6, 0.35, 30, 58),
  drawdown: walk(12, N, 3.84, 0.08, 1.5, 6.4, 0.03),
  fill: walk(13, N, 99.2, 0.05, 98.4, 99.9, 0.2),
  latency: walk(14, N, 3.2, 0.18, 1.6, 5.4, 0.15),
  confidence: walk(15, N, 0.87, 0.012, 0.72, 0.96, 0.1),
};

/** Simulated wall clock: base 14:32:08 SGT, ~1.2s per tick. */
const BASE = 14 * 3600 + 32 * 60 + 8;
export function clock(t: number, withSeconds = true): string {
  const s = (((BASE + Math.round(t * 1.2)) % 86400) + 86400) % 86400;
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}
/** Chart axis clock: one point per minute, last point = current minute. */
export function minuteLabel(offsetFromNow: number, t: number): string {
  const s = BASE + Math.round(t * 1.2);
  const m = ((Math.floor(s / 60) + offsetFromNow) % 1440 + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Sparkline path for a w x h box. */
export function sparkPath(values: number[], w: number, h: number, pad = 1.5): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => `${i ? "L" : "M"}${r2((i / (values.length - 1)) * w)} ${r2(pad + (1 - (v - min) / span) * (h - pad * 2))}`)
    .join(" ");
}

/** Live clock driving every widget. Ticks only while `running` (in view, locked, motion allowed). */
export function useWorkstation(running: boolean) {
  const [t, setT] = useState(0);
  const [ticker, setTicker] = useState<TickerState>(() => tickerGen(31).initial);
  useEffect(() => {
    if (!running) return;
    const gen = tickerGen(31 + t);
    const id = window.setInterval(() => {
      setT((x) => (x + 1) % MAX_T);
      setTicker(gen.next());
    }, 1200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return { t, ticker };
}
