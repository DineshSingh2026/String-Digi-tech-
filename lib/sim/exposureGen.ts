import type { PricePoint } from "./priceGen";

export type ExposurePoint = { t: number; exposure: number; drawdown: number; limit: number };

/**
 * Toy vol-targeted exposure that de-risks as drawdown approaches the limit.
 * Guarantee: drawdown of the exposure-weighted equity never exceeds `limit`.
 * Illustrative only; not a trading model.
 */
export function exposureGen(prices: PricePoint[], maxDrawdown: number): ExposurePoint[] {
  const limit = maxDrawdown;
  const out: ExposurePoint[] = [];
  if (prices.length === 0) return out;
  const targetVol = 0.01;
  let varEst = 0.0001;
  let equity = 1;
  let peak = 1;
  let exposure = 0.5;
  out.push({ t: prices[0].t, exposure, drawdown: 0, limit });
  for (let i = 1; i < prices.length; i++) {
    const ret = prices[i].price / prices[i - 1].price - 1;
    const dd = 1 - equity / peak;
    const room = Math.max(0, limit - dd);
    let e = exposure;
    if (ret < 0) {
      // hard clamp: the step loss may not consume more than the remaining room
      const maxE = (room * peak) / (equity * -ret);
      if (e > maxE) e = Math.max(0, maxE * 0.98);
    }
    equity = equity * (1 + e * ret);
    if (equity > peak) peak = equity;
    const drawdown = Math.min(limit, Math.max(0, 1 - equity / peak));
    out.push({ t: prices[i].t, exposure: e, drawdown, limit });
    varEst = 0.94 * varEst + 0.06 * ret * ret;
    const volScale = Math.min(1, targetVol / Math.sqrt(varEst + 1e-12));
    const headroom = Math.max(0, (limit - drawdown) / limit);
    const ddScale = headroom < 0.15 ? 0 : Math.min(1, headroom * 1.25);
    exposure = Math.max(0, Math.min(1, volScale * ddScale));
  }
  return out;
}
