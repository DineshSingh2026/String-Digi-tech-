import { priceGen, rng, type Regime } from "@/lib/sim";
import { CONFIG } from "./config";

export type PathData = {
  /** RGBA float texture data: R = log-return from start, B = breach position s (2 = never). */
  data: Float32Array;
  width: number;
  height: number;
  /** Envelope half-width coefficient: w(s) = envC * (sqrt(s) + 0.05) in log-return units. */
  envC: number;
  highlight: number;
  /** Number of paths that leave the envelope (and are clipped). */
  breaches: number;
};

const REGIMES: Regime[] = ["trend", "meanRevert", "highVol", "thinLiquidity"];
let cache: PathData | null = null;

/** Two-pass centred box filter: keeps the price-path character but removes pixel-level jitter at hero scale. */
function smooth(y: number[], r: number): number[] {
  let cur = y;
  for (let pass = 0; pass < 2; pass++) {
    const out = new Array<number>(cur.length);
    for (let t = 0; t < cur.length; t++) {
      const lo = Math.max(0, t - r);
      const hi = Math.min(cur.length - 1, t + r);
      let sum = 0;
      for (let k = lo; k <= hi; k++) sum += cur[k];
      out[t] = sum / (hi - lo + 1);
    }
    cur = out;
  }
  // keep the common origin exact so every path fans out from one point
  const o = cur[0];
  return cur.map((v) => v - o);
}

export function buildPaths(): PathData {
  if (cache) return cache;
  const width = CONFIG.samples;
  const height = CONFIG.paths;
  const ys: number[][] = [];
  for (let i = 0; i < height; i++) {
    const r = rng(CONFIG.seed + i * 7919);
    const schedule: { regime: Regime; steps: number }[] = [];
    let left = width - 1;
    while (left > 0) {
      const steps = Math.min(left, 60 + Math.floor(r() * 140));
      const roll = r();
      const regime = roll < 0.45 ? "trend" : REGIMES[1 + Math.floor(r() * 3)];
      schedule.push({ regime, steps });
      left -= steps;
    }
    const prices = priceGen(CONFIG.seed + i, schedule);
    const p0 = prices[0].price;
    ys.push(smooth(prices.slice(0, width).map((p) => Math.log(p.price / p0)), CONFIG.smoothRadius));
  }
  // Envelope coefficient from the empirical breach quantile.
  const ratios = ys
    .map((y) => {
      let m = 0;
      for (let t = 1; t < width; t++) m = Math.max(m, Math.abs(y[t]) / (Math.sqrt(t / (width - 1)) + 0.05));
      return m;
    })
    .sort((a, b) => a - b);
  const envC = ratios[Math.floor(ratios.length * CONFIG.breachQuantile)];

  const data = new Float32Array(width * height * 4);
  let highlight = -1;
  for (let i = 0; i < height; i++) {
    let breach = 2;
    for (let t = 0; t < width; t++) {
      const s = t / (width - 1);
      if (breach === 2 && Math.abs(ys[i][t]) > envC * (Math.sqrt(s) + 0.05)) breach = s;
      const o = (i * width + t) * 4;
      data[o] = ys[i][t];
      data[o + 1] = 0;
      data[o + 2] = breach;
      data[o + 3] = 1;
    }
    // pick a calm, upward, unbreached path as the single accent highlight
    if (highlight < 0 && breach === 2 && ys[i][width - 1] > envC * 0.25) highlight = i;
  }
  // breach must be known for the whole path, so back-fill the B channel
  for (let i = 0; i < height; i++) {
    const b = data[(i * width + width - 1) * 4 + 2];
    for (let t = 0; t < width; t++) data[(i * width + t) * 4 + 2] = b;
  }
  let breaches = 0;
  for (let i = 0; i < height; i++) if (data[i * width * 4 + 2] < 2) breaches++;
  cache = { data, width, height, envC, highlight: Math.max(0, highlight), breaches };
  return cache;
}
