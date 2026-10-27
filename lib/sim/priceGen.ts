import { rng, gaussian } from "./rng";

export type Regime = "trend" | "meanRevert" | "highVol" | "thinLiquidity";
export type PricePoint = { t: number; price: number; regime: Regime };

export const DEFAULT_SCHEDULE: { regime: Regime; steps: number }[] = [
  { regime: "trend", steps: 120 },
  { regime: "meanRevert", steps: 90 },
  { regime: "highVol", steps: 70 },
  { regime: "thinLiquidity", steps: 80 },
  { regime: "trend", steps: 90 },
];

/** Toy regime-switching GBM. Illustrative only. */
export function priceGen(seed: number, schedule: { regime: Regime; steps: number }[], start = 100): PricePoint[] {
  const r = rng(seed);
  const out: PricePoint[] = [];
  let price = start;
  let t = 0;
  out.push({ t, price, regime: schedule[0]?.regime ?? "trend" });
  for (const seg of schedule) {
    const anchor = price;
    for (let i = 0; i < seg.steps; i++) {
      t++;
      const z = gaussian(r);
      let ret: number;
      switch (seg.regime) {
        case "trend":
          ret = 0.0004 + 0.008 * z;
          break;
        case "meanRevert":
          ret = 0.08 * Math.log(anchor / price) + 0.006 * z;
          break;
        case "highVol":
          ret = 0.022 * z;
          break;
        case "thinLiquidity":
          ret = 0.012 * z + (r() < 0.06 ? (r() < 0.5 ? -1 : 1) * (0.015 + 0.02 * r()) : 0);
          break;
      }
      price = price * Math.exp(ret);
      out.push({ t, price, regime: seg.regime });
    }
  }
  return out;
}
