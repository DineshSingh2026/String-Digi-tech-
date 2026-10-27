export const CONFIG = {
  seed: 11,
  count: 160,
  neighbours: 3,
  radius: 1.5,
  /** fallback world centre when the band has no data-scene-rect */
  center: [2.3, 0, 0],
  /** globe diameter as a fraction of the rect's shorter side */
  fit: 0.82,
  nodePx: 7,
  rotationSpeed: 0.06,
  pulseSpeed: 0.5,
  colors: {
    node: "#AFC0D2",
    edge: "#5D7287",
    signal: "#33D1B4",
    risk: "#E5484D",
    caution: "#F5A524",
  },
  opacity: { nodes: 1, edges: 0.32, ring: 0.95, halo: 0.16 },
} as const;
