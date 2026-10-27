export const CONFIG = {
  seed: 8675309,
  maxDrawdown: 0.1,
  /** Panels in NDC y. */
  price: { y0: 0.08, y1: 0.72 },
  exposure: { y0: -0.26, y1: -0.04 },
  drawdown: { y0: -0.74, y1: -0.36 },
  regimeColors: {
    trend: "#33D1B4",
    meanRevert: "#8A97A6",
    highVol: "#F5A524",
    thinLiquidity: "#E5484D",
  },
} as const;
