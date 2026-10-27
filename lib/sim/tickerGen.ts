import { rng, gaussian } from "./rng";
import seedRows from "@/data/ticker.json";

export type TickerRow = { symbol: string; price: number; changePct: number };
export type TickerState = { rows: TickerRow[]; ticksPerSec: number; latencyMs: number; heartbeat: number };

const decimals = (p: number) => (p < 10 ? 4 : 2);
const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

/** Simulated ticker. Caller invokes next() roughly every 800ms. */
export function tickerGen(seed: number): { initial: TickerState; next: () => TickerState } {
  const r = rng(seed);
  const base: TickerRow[] = (seedRows as TickerRow[]).map((row) => ({ ...row }));
  const opens = base.map((row) => row.price / (1 + row.changePct / 100));
  const initial: TickerState = { rows: base, ticksPerSec: 1240, latencyMs: 3.2, heartbeat: 0 };
  let state = initial;
  const next = (): TickerState => {
    const rows = state.rows.map((row, i) => {
      const price = round(row.price * (1 + gaussian(r) * 0.0006), decimals(row.price));
      return { symbol: row.symbol, price, changePct: round((price / opens[i] - 1) * 100, 2) };
    });
    state = {
      rows,
      ticksPerSec: Math.round(Math.max(600, Math.min(2400, state.ticksPerSec + gaussian(r) * 60))),
      latencyMs: round(Math.max(0.8, Math.min(9, state.latencyMs + gaussian(r) * 0.3)), 1),
      heartbeat: state.heartbeat + 1,
    };
    return state;
  };
  return { initial, next };
}
