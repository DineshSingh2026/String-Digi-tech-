import { DEFAULT_SCHEDULE, priceGen, type Regime } from "@/lib/sim/priceGen";
import { CONFIG } from "./config";

export type RegimeData = {
  n: number;
  price: Float32Array; // log price normalised 0..1
  exposure: Float32Array; // 0..1
  drawdown: Float32Array; // 0..limit (fraction)
  regime: Regime[];
  /** [startIndex, endIndex] per schedule segment */
  segments: { regime: Regime; i0: number; i1: number }[];
  limit: number;
};

/**
 * Toy vol-targeted exposure that de-risks in high volatility and as drawdown nears the limit.
 * A per-step clamp means drawdown can never cross the limit. Illustrative only; not a trading model.
 */
export function buildRegimeData(): RegimeData {
  const prices = priceGen(CONFIG.seed, DEFAULT_SCHEDULE);
  const n = prices.length;
  const limit = CONFIG.maxDrawdown;
  const logs = prices.map((p) => Math.log(p.price));
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  const price = new Float32Array(n);
  const exposure = new Float32Array(n);
  const drawdown = new Float32Array(n);
  const regime: Regime[] = prices.map((p) => p.regime);
  for (let i = 0; i < n; i++) price[i] = (logs[i]! - lo) / (hi - lo || 1);

  let varEst = 0.00006;
  let equity = 1;
  let peak = 1;
  let e = 0.8;
  exposure[0] = e;
  for (let i = 1; i < n; i++) {
    const ret = prices[i]!.price / prices[i - 1]!.price - 1;
    const dd = 1 - equity / peak;
    const room = Math.max(0, limit - dd);
    let step = e;
    if (ret < 0 && step * -ret * equity > room * peak * 0.5) step = (room * peak * 0.5) / (equity * -ret);
    equity *= 1 + step * ret;
    peak = Math.max(peak, equity);
    drawdown[i] = Math.min(limit * 0.995, Math.max(0, 1 - equity / peak));
    exposure[i] = step;
    varEst = 0.9 * varEst + 0.1 * ret * ret;
    const volScale = Math.min(1, 0.0075 / Math.sqrt(varEst + 1e-12));
    const headroom = Math.max(0, (limit - drawdown[i]!) / limit);
    const ddScale = Math.max(0.2, Math.min(1, 0.15 + headroom));
    e = Math.max(0.05, Math.min(1, volScale * ddScale));
  }

  const segments: RegimeData["segments"] = [];
  let i0 = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || regime[i] !== regime[i0]) {
      segments.push({ regime: regime[i0]!, i0, i1: i - 1 });
      i0 = i;
    }
  }
  return { n, price, exposure, drawdown, regime, segments, limit };
}
