export const CONFIG = {
  seed: 42,
  clusters: 5,
  count: 9000,
  /** fallback world placement when the band has no data-scene-rect */
  center: [2.2, 0, 0],
  scale: [2.0, 1.6],
  /** fraction of the rect the plot fills */
  fill: [0.9, 0.82],
  depth: 0.5,
  pointSize: 2.6,
  staggerSpread: 0.35,
  jitterAmp: 0.012,
  trendSamples: 128,
  lineWidth: 0.05,
  bandMin: 0.07,
  bandScale: 0.9,
  colors: {
    noise: "#5B6878",
    accent: "#F44E04",
    signal: "#33D1B4",
    text: "#E9EEF3",
  },
  /** per-cluster colours (the colour only emerges as points are classified) */
  clusterColors: ["#33D1B4", "#9FB0C2", "#F44E04", "#6F8193", "#5FE3CB"],
  opacity: { points: 0.85, line: 1, band: 0.4 },
} as const;

/**
 * Local progress lp (0..1 as the plot box crosses the viewport, 0.5 = centred) → phases.
 * Shared by the scene and the DOM overlay so labels and visuals stay in step.
 */
export function phases(lp: number) {
  const c = (v: number) => Math.max(0, Math.min(1, v));
  return {
    organise: c((lp - 0.16) / 0.28),
    draw: c((lp - 0.42) / 0.16),
  };
}
