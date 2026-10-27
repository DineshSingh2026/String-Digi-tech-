/**
 * Scenes draw directly in normalized device coordinates (gl_Position = vec4(ndc, 0, 1)),
 * so they always fill the viewport regardless of camera. Content is biased to the right
 * on wide screens so left-column copy stays readable.
 */
export type PlotRect = { x0: number; x1: number; yC: number; yHalf: number };

export function plotRect(aspect: number): PlotRect {
  if (aspect < 1) return { x0: -1.05, x1: 1.05, yC: -0.1, yHalf: 0.55 };
  if (aspect < 1.4) return { x0: -0.55, x1: 1.02, yC: 0, yHalf: 0.62 };
  return { x0: -0.2, x1: 1.02, yC: 0, yHalf: 0.68 };
}

export const COLORS = {
  bg: "#06080B",
  line: "#1D2530",
  text: "#E9EEF3",
  muted: "#8A97A6",
  accent: "#F44E04",
  signal: "#33D1B4",
  risk: "#E5484D",
  caution: "#F5A524",
} as const;

/** A DOM viewport rect (see readSceneRect) mapped to world units on the z=0 plane of a perspective camera. */
export type WorldBox = { cx: number; cy: number; w: number; h: number };

export function rectToWorld(
  r: { x: number; y: number; w: number; h: number; vw: number; vh: number },
  cam: { position: { z: number }; fov: number },
): WorldBox {
  const worldH = 2 * cam.position.z * Math.tan(((cam.fov / 2) * Math.PI) / 180);
  const worldW = worldH * (r.vw / r.vh);
  return {
    cx: ((r.x + r.w / 2) / r.vw - 0.5) * worldW,
    cy: -((r.y + r.h / 2) / r.vh - 0.5) * worldH,
    w: (r.w / r.vw) * worldW,
    h: (r.h / r.vh) * worldH,
  };
}

/** A DOM viewport rect mapped to normalized device coordinates. */
export function rectToNdc(r: { x: number; y: number; w: number; h: number; vw: number; vh: number }) {
  return {
    x0: (r.x / r.vw) * 2 - 1,
    x1: ((r.x + r.w) / r.vw) * 2 - 1,
    y0: 1 - ((r.y + r.h) / r.vh) * 2,
    y1: 1 - (r.y / r.vh) * 2,
  };
}
