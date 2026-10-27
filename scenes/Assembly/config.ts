export type PanelKind = "kpi" | "chart" | "table" | "alert" | "ticket" | "bars" | "spark";

export const CONFIG = {
  seed: 23,
  /** dashboard grid: kind, centre x, centre y, width, height (config units), resting z-depth */
  panels: [
    ["kpi", 1.0, 1.15, 0.65, 0.4, 0.06],
    ["kpi", 1.75, 1.15, 0.65, 0.4, 0.06],
    ["kpi", 2.5, 1.15, 0.65, 0.4, 0.06],
    ["alert", 3.5, 1.15, 1.1, 0.4, 0.3],
    ["chart", 1.75, 0.3, 2.15, 1.1, 0.0],
    ["ticket", 3.5, 0.3, 1.1, 1.1, 0.22],
    ["table", 1.4, -0.75, 1.45, 0.8, 0.1],
    ["bars", 2.7, -0.75, 0.95, 0.8, 0.14],
    ["spark", 3.625, -0.75, 0.85, 0.8, 0.18],
  ] as const satisfies readonly (readonly [PanelKind, number, number, number, number, number])[],
  /** lock order (index into panels): chart first, kpis, then the rest */
  lockOrder: [4, 0, 1, 2, 6, 7, 8, 5, 3],
  /** scattered start positions: kept inside the stage footprint and behind it (z < 0) so nothing flies over copy */
  scatter: { x: [0.6, 4.1], y: [-1.1, 1.3], z: [-3.2, -1.0], rot: 0.9 },
  delaySpread: 0.45,
  window: 0.5,
  spring: { stiffness: 70, damping: 10 },
  loopPeriod: 16,
  bob: 0.025,
  /** max parallax tilt (radians) from pointer / scroll */
  tilt: 0.12,
  colors: {
    outline: "#B8C6D4",
    inner: "#56677A",
    signal: "#33D1B4",
    accent: "#F44E04",
    caution: "#F5A524",
    risk: "#E5484D",
    neutral: "#8A97A6",
  },
  opacity: 0.9,
  /** grid bounds in config units (for fitting into a data-scene-rect) */
  bounds: { cx: 2.3625, cy: 0.1, w: 3.375, h: 2.5 },
  fit: 0.86,
} as const;

/** Local progress (0.5 = rect centred) → assembly drive: fully locked a little before centre. Shared with the DOM. */
export const assemblyDrive = (lp: number) => Math.max(0, Math.min(1, (lp - 0.1) / 0.32));

/** Deterministic per-panel delay from the lock order (shared with the DOM labels). */
export function panelDelay(i: number): number {
  const n = CONFIG.panels.length;
  const rank = (CONFIG.lockOrder as readonly number[]).indexOf(i);
  return (Math.max(0, rank) / Math.max(1, n - 1)) * CONFIG.delaySpread;
}

/** 0..1 lock target of panel i for a given drive. */
export function panelTarget(i: number, drive: number): number {
  return Math.max(0, Math.min(1, (drive * (1 + CONFIG.delaySpread) - panelDelay(i)) / CONFIG.window));
}
